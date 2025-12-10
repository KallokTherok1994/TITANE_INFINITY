// ═══════════════════════════════════════════════════════════════
//   CLUSTERING — K-Means Implementation
// ═══════════════════════════════════════════════════════════════

use crate::memory_os::similarity::*;
use crate::memory_os::types::{Cluster, ClusterResult, MemoryOSError, MemoryOSResult};
use rand::Rng;
use std::collections::HashMap;

/// K-Means Clustering Configuration
#[derive(Debug, Clone)]
pub struct KMeansConfig {
    pub k: usize,
    pub max_iterations: usize,
    pub tolerance: f32,
    pub init_method: InitMethod,
}

#[derive(Debug, Clone, Copy)]
pub enum InitMethod {
    Random,
    KMeansPlusPlus,
}

impl Default for KMeansConfig {
    fn default() -> Self {
        Self {
            k: 5,
            max_iterations: 100,
            tolerance: 1e-4,
            init_method: InitMethod::KMeansPlusPlus,
        }
    }
}

/// K-Means Clustering
pub struct KMeansClustering {
    config: KMeansConfig,
}

impl KMeansClustering {
    pub fn new(config: KMeansConfig) -> Self {
        Self { config }
    }

    /// Cluster vectors
    pub fn cluster(&self, vectors: &HashMap<String, Vec<f32>>) -> MemoryOSResult<ClusterResult> {
        if vectors.is_empty() {
            return Err(MemoryOSError::ClusteringError(
                "No vectors to cluster".to_string(),
            ));
        }

        if vectors.len() < self.config.k {
            return Err(MemoryOSError::ClusteringError(format!(
                "Not enough vectors: {} < {}",
                vectors.len(),
                self.config.k
            )));
        }

        let dimension = vectors.values().next().unwrap().len();

        // Convert to matrix format
        let data: Vec<(String, Vec<f32>)> = vectors
            .iter()
            .map(|(id, vec)| (id.clone(), vec.clone()))
            .collect();

        // Initialize centroids
        let mut centroids = self.initialize_centroids(&data, dimension)?;

        // K-means iterations
        let mut assignments: Vec<usize> = vec![0; data.len()];
        let mut prev_centroids = centroids.clone();

        for iteration in 0..self.config.max_iterations {
            // Assignment step
            for (i, (_id, vector)) in data.iter().enumerate() {
                let mut min_dist = f32::MAX;
                let mut best_cluster = 0;

                for (j, centroid) in centroids.iter().enumerate() {
                    let dist = euclidean_distance(vector, centroid);
                    if dist < min_dist {
                        min_dist = dist;
                        best_cluster = j;
                    }
                }

                assignments[i] = best_cluster;
            }

            // Update step
            for (j, centroid_slot) in centroids.iter_mut().enumerate().take(self.config.k) {
                let cluster_points: Vec<&Vec<f32>> = data
                    .iter()
                    .enumerate()
                    .filter(|(i, _)| assignments[*i] == j)
                    .map(|(_, (_, vec))| vec)
                    .collect();

                if !cluster_points.is_empty() {
                    *centroid_slot = compute_centroid(&cluster_points, dimension);
                }
            }

            // Check convergence
            let max_movement = centroids
                .iter()
                .zip(prev_centroids.iter())
                .map(|(c1, c2)| euclidean_distance(c1, c2))
                .fold(0.0f32, f32::max);

            if max_movement < self.config.tolerance {
                break;
            }

            prev_centroids = centroids.clone();
        }

        // Build clusters
        let mut clusters: Vec<Cluster> = (0..self.config.k)
            .map(|i| Cluster {
                id: i,
                centroid: centroids[i].clone(),
                member_ids: Vec::new(),
                size: 0,
            })
            .collect();

        for (i, (id, _)) in data.iter().enumerate() {
            let cluster_id = assignments[i];
            clusters[cluster_id].member_ids.push(id.clone());
            clusters[cluster_id].size += 1;
        }

        // Filter empty clusters
        clusters.retain(|c| c.size > 0);

        // Calculate silhouette score
        let silhouette_score = self.calculate_silhouette(&data, &assignments, &centroids);

        Ok(ClusterResult {
            clusters,
            total_items: data.len(),
            silhouette_score,
        })
    }

    /// Initialize centroids
    fn initialize_centroids(
        &self,
        data: &[(String, Vec<f32>)],
        dimension: usize,
    ) -> MemoryOSResult<Vec<Vec<f32>>> {
        match self.config.init_method {
            InitMethod::Random => self.random_init(data, dimension),
            InitMethod::KMeansPlusPlus => self.kmeans_plusplus_init(data, dimension),
        }
    }

    /// Random initialization
    fn random_init(
        &self,
        data: &[(String, Vec<f32>)],
        _dimension: usize,
    ) -> MemoryOSResult<Vec<Vec<f32>>> {
        let mut rng = rand::thread_rng();
        let mut centroids = Vec::with_capacity(self.config.k);

        for _ in 0..self.config.k {
            let idx = rng.gen_range(0..data.len());
            centroids.push(data[idx].1.clone());
        }

        Ok(centroids)
    }

    /// K-means++ initialization
    fn kmeans_plusplus_init(
        &self,
        data: &[(String, Vec<f32>)],
        _dimension: usize,
    ) -> MemoryOSResult<Vec<Vec<f32>>> {
        let mut rng = rand::thread_rng();
        let mut centroids = Vec::with_capacity(self.config.k);

        // First centroid: random
        let first_idx = rng.gen_range(0..data.len());
        centroids.push(data[first_idx].1.clone());

        // Remaining centroids: weighted by distance
        for _ in 1..self.config.k {
            let mut distances: Vec<f32> = data
                .iter()
                .map(|(_, vec)| {
                    centroids
                        .iter()
                        .map(|c| euclidean_distance(vec, c))
                        .fold(f32::MAX, f32::min)
                        .powi(2)
                })
                .collect();

            let sum: f32 = distances.iter().sum();
            if sum == 0.0 {
                // All points already covered
                break;
            }

            // Normalize to probabilities
            for d in &mut distances {
                *d /= sum;
            }

            // Weighted random selection
            let mut cumulative = 0.0;
            let target = rng.gen::<f32>();

            for (i, &prob) in distances.iter().enumerate() {
                cumulative += prob;
                if cumulative >= target {
                    centroids.push(data[i].1.clone());
                    break;
                }
            }
        }

        Ok(centroids)
    }

    /// Calculate silhouette score
    fn calculate_silhouette(
        &self,
        data: &[(String, Vec<f32>)],
        assignments: &[usize],
        centroids: &[Vec<f32>],
    ) -> f32 {
        if data.len() < 2 {
            return 0.0;
        }

        let mut total_score = 0.0;

        for (i, (_, vec)) in data.iter().enumerate() {
            let cluster_id = assignments[i];

            // a: average distance to points in same cluster
            let same_cluster: Vec<&Vec<f32>> = data
                .iter()
                .enumerate()
                .filter(|(j, _)| *j != i && assignments[*j] == cluster_id)
                .map(|(_, (_, v))| v)
                .collect();

            let a = if same_cluster.is_empty() {
                0.0
            } else {
                same_cluster
                    .iter()
                    .map(|v| euclidean_distance(vec, v))
                    .sum::<f32>()
                    / same_cluster.len() as f32
            };

            // b: min average distance to points in other clusters
            let mut b = f32::MAX;
            for j in 0..centroids.len() {
                if j == cluster_id {
                    continue;
                }

                let other_cluster: Vec<&Vec<f32>> = data
                    .iter()
                    .enumerate()
                    .filter(|(k, _)| assignments[*k] == j)
                    .map(|(_, (_, v))| v)
                    .collect();

                if !other_cluster.is_empty() {
                    let avg_dist = other_cluster
                        .iter()
                        .map(|v| euclidean_distance(vec, v))
                        .sum::<f32>()
                        / other_cluster.len() as f32;

                    b = b.min(avg_dist);
                }
            }

            // Silhouette coefficient
            let s = if a < b {
                1.0 - a / b
            } else if a > b {
                b / a - 1.0
            } else {
                0.0
            };

            total_score += s;
        }

        total_score / data.len() as f32
    }
}

/// Compute centroid from points
fn compute_centroid(points: &[&Vec<f32>], dimension: usize) -> Vec<f32> {
    let mut centroid = vec![0.0; dimension];

    for point in points {
        for (i, val) in point.iter().enumerate() {
            centroid[i] += val;
        }
    }

    let n = points.len() as f32;
    for val in &mut centroid {
        *val /= n;
    }

    centroid
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_kmeans_basic() {
        let mut vectors = HashMap::new();

        // Two clear clusters
        vectors.insert("a1".to_string(), vec![1.0, 1.0]);
        vectors.insert("a2".to_string(), vec![1.1, 0.9]);
        vectors.insert("b1".to_string(), vec![10.0, 10.0]);
        vectors.insert("b2".to_string(), vec![10.1, 9.9]);

        let config = KMeansConfig {
            k: 2,
            max_iterations: 100,
            tolerance: 1e-4,
            init_method: InitMethod::Random,
        };

        let clustering = KMeansClustering::new(config);
        let result = clustering.cluster(&vectors).unwrap();

        assert_eq!(result.clusters.len(), 2);
        assert_eq!(result.total_items, 4);
    }
}
