// ═══════════════════════════════════════════════════════════════
//   HNSW VECTOR INDEX IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════

use crate::memory_os::{
    MemoryOSError, MemoryOSResult, SearchResult, VectorIndex, VectorIndexConfig,
};
use instant_distance::{Builder, HnswMap, Point, Search};
use std::cmp::Ordering;
use std::collections::HashMap;
use std::path::Path;

#[derive(Debug, Clone)]
struct IndexedVectorPoint {
    vector: Vec<f32>,
}

impl Point for IndexedVectorPoint {
    fn distance(&self, other: &Self) -> f32 {
        cosine_distance(&self.vector, &other.vector)
    }
}

fn cosine_distance(a: &[f32], b: &[f32]) -> f32 {
    let mut dot = 0.0f32;
    let mut norm_a = 0.0f32;
    let mut norm_b = 0.0f32;

    for (lhs, rhs) in a.iter().zip(b.iter()) {
        dot += lhs * rhs;
        norm_a += lhs * lhs;
        norm_b += rhs * rhs;
    }

    if norm_a <= f32::EPSILON || norm_b <= f32::EPSILON {
        return 1.0;
    }

    let similarity = (dot / (norm_a.sqrt() * norm_b.sqrt())).clamp(-1.0, 1.0);
    1.0 - similarity
}

/// HNSW-based Vector Index
pub struct HnswVectorIndex {
    /// HNSW index (rebuilt from in-memory vectors using instant-distance)
    hnsw: Option<HnswMap<IndexedVectorPoint, usize>>,

    /// ID to internal index mapping
    id_map: HashMap<String, usize>,

    /// Internal index to ID mapping
    reverse_map: HashMap<usize, String>,

    /// Stored vectors (for retrieval)
    vectors: HashMap<String, Vec<f32>>,

    /// Configuration
    config: VectorIndexConfig,

    /// Next internal index
    next_idx: usize,
}

impl HnswVectorIndex {
    /// Create new HNSW index
    pub fn new(config: VectorIndexConfig) -> Self {
        Self {
            hnsw: None,
            id_map: HashMap::with_capacity(config.max_elements),
            reverse_map: HashMap::with_capacity(config.max_elements),
            vectors: HashMap::with_capacity(config.max_elements),
            config,
            next_idx: 0,
        }
    }

    fn rebuild_index(&mut self) {
        if self.id_map.is_empty() {
            self.hnsw = None;
            return;
        }

        let mut ordered_ids: Vec<(&String, &usize)> = self.id_map.iter().collect();
        ordered_ids.sort_by_key(|(_, idx)| **idx);

        let points: Vec<IndexedVectorPoint> = ordered_ids
            .iter()
            .filter_map(|(id, _)| {
                self.vectors
                    .get(*id)
                    .cloned()
                    .map(|vector| IndexedVectorPoint { vector })
            })
            .collect();

        let values: Vec<usize> = ordered_ids.iter().map(|(_, idx)| **idx).collect();

        if points.is_empty() {
            self.hnsw = None;
            return;
        }

        self.hnsw = Some(Builder::default().seed(42).build(points, values));
    }
}

impl VectorIndex for HnswVectorIndex {
    fn add_vector(&mut self, id: String, vector: Vec<f32>) -> MemoryOSResult<()> {
        if vector.len() != self.config.dimension {
            return Err(MemoryOSError::VectorIndexError(format!(
                "Vector dimension mismatch: expected {}, got {}",
                self.config.dimension,
                vector.len()
            )));
        }

        if self.id_map.contains_key(&id) {
            self.vectors.insert(id, vector);
            self.rebuild_index();
            return Ok(());
        }

        let internal_idx = self.next_idx;
        self.id_map.insert(id.clone(), internal_idx);
        self.reverse_map.insert(internal_idx, id.clone());
        self.vectors.insert(id, vector);
        self.next_idx += 1;
        self.rebuild_index();

        Ok(())
    }

    fn search(&self, query: &[f32], k: usize) -> MemoryOSResult<Vec<SearchResult>> {
        if query.len() != self.config.dimension {
            return Err(MemoryOSError::SearchError(format!(
                "Query dimension mismatch: expected {}, got {}",
                self.config.dimension,
                query.len()
            )));
        }

        let Some(hnsw) = self.hnsw.as_ref() else {
            return Ok(Vec::new());
        };

        let query_point = IndexedVectorPoint {
            vector: query.to_vec(),
        };
        let mut search = Search::default();

        let mut results: Vec<SearchResult> = hnsw
            .search(&query_point, &mut search)
            .filter_map(|item| {
                let internal_idx = *item.value;
                let id = self.reverse_map.get(&internal_idx)?;
                let vector = self.vectors.get(id)?;
                Some(SearchResult::from_distance(
                    id.clone(),
                    cosine_distance(query, vector),
                ))
            })
            .collect();

        results.sort_by(|a, b| {
            let dist_ord = a
                .distance
                .partial_cmp(&b.distance)
                .unwrap_or(Ordering::Greater);
            if dist_ord != Ordering::Equal {
                return dist_ord;
            }
            a.id.cmp(&b.id)
        });

        if results.len() > k {
            results.truncate(k);
        }

        Ok(results)
    }

    fn remove(&mut self, id: &str) -> MemoryOSResult<()> {
        if let Some(idx) = self.id_map.remove(id) {
            self.reverse_map.remove(&idx);
            self.vectors.remove(id);
            self.rebuild_index();
        }

        Ok(())
    }

    fn get_vector(&self, id: &str) -> Option<Vec<f32>> {
        self.vectors.get(id).cloned()
    }

    fn dimension(&self) -> usize {
        self.config.dimension
    }

    fn size(&self) -> usize {
        self.id_map.len()
    }

    fn clear(&mut self) -> MemoryOSResult<()> {
        self.hnsw = None;
        self.id_map.clear();
        self.reverse_map.clear();
        self.vectors.clear();
        self.next_idx = 0;

        Ok(())
    }

    fn save(&self, path: &str) -> MemoryOSResult<()> {
        let path = Path::new(path);

        let metadata = HnswMetadata {
            id_map: self.id_map.clone(),
            reverse_map: self.reverse_map.clone(),
            vectors: self.vectors.clone(),
            config: self.config.clone(),
            next_idx: self.next_idx,
        };

        let metadata_path = path.with_extension("meta");
        let metadata_json = serde_json::to_string_pretty(&metadata)?;
        std::fs::write(metadata_path, metadata_json)?;

        Ok(())
    }

    fn load(&mut self, path: &str) -> MemoryOSResult<()> {
        let path = Path::new(path);
        let metadata_path = path.with_extension("meta");
        let metadata_json = std::fs::read_to_string(metadata_path)?;
        let metadata: HnswMetadata = serde_json::from_str(&metadata_json)?;

        self.id_map = metadata.id_map;
        self.reverse_map = metadata.reverse_map;
        self.vectors = metadata.vectors;
        self.config = metadata.config;
        self.next_idx = metadata.next_idx;
        self.rebuild_index();

        Ok(())
    }
}

/// HNSW Metadata for persistence
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct HnswMetadata {
    id_map: HashMap<String, usize>,
    reverse_map: HashMap<usize, String>,
    vectors: HashMap<String, Vec<f32>>,
    config: VectorIndexConfig,
    next_idx: usize,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hnsw_basic() {
        let config = VectorIndexConfig::new(128);
        let mut index = HnswVectorIndex::new(config);

        let v1 = vec![1.0; 128];
        let v2 = vec![0.5; 128];

        index
            .add_vector("v1".to_string(), v1.clone())
            .expect("v1 should insert");
        index
            .add_vector("v2".to_string(), v2.clone())
            .expect("v2 should insert");

        assert_eq!(index.size(), 2);

        let results = index
            .search(&v1, 1)
            .expect("search should return nearest vector");
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].id, "v1");
    }
}
