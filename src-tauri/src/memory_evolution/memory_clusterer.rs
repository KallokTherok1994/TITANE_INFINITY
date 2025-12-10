// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — MEMORY CLUSTERER v∞
//   Clustering thématique local
//   KMeans-like heuristique
// ═══════════════════════════════════════════════════════════════

use super::{MemoryEvolutionError, MemoryItem};
use log::info;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Cluster mémoire
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryCluster {
    pub id: String,
    pub label: String,
    pub description: String,
    pub members: Vec<String>,
    pub centroid_keywords: Vec<String>,
    pub coherence_score: f32,
    pub created_at: String,
    pub updated_at: String,
}

/// Résultat du clustering
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClusteringResult {
    pub clusters: Vec<MemoryCluster>,
    pub unclustered_items: Vec<String>,
    pub stats: ClusteringStats,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClusteringStats {
    pub total_items: usize,
    pub clustered_items: usize,
    pub clusters_created: usize,
    pub avg_cluster_size: f32,
    pub silhouette_score: f32,
}

/// Memory Clusterer Engine
pub struct MemoryClusterer {
    config: ClustererConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClustererConfig {
    /// Nombre minimum d'items pour former un cluster
    pub min_cluster_size: usize,
    /// Nombre maximum de clusters
    pub max_clusters: usize,
    /// Seuil de similarité pour grouper
    pub similarity_threshold: f32,
    /// Méthode de clustering
    pub method: ClusteringMethod,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ClusteringMethod {
    TopicBased,
    KeywordBased,
    Hierarchical,
}

impl Default for ClustererConfig {
    fn default() -> Self {
        Self {
            min_cluster_size: 2,
            max_clusters: 20,
            similarity_threshold: 0.5,
            method: ClusteringMethod::TopicBased,
        }
    }
}

impl MemoryClusterer {
    pub fn new(config: ClustererConfig) -> Self {
        Self { config }
    }

    /// Effectue le clustering des items mémoire
    pub fn cluster(&self, items: &[MemoryItem]) -> Result<ClusteringResult, MemoryEvolutionError> {
        info!(
            "[MemoryClusterer] Clustering {} items with method {:?}",
            items.len(),
            self.config.method
        );

        let clusters = match self.config.method {
            ClusteringMethod::TopicBased => self.cluster_by_topic(items)?,
            ClusteringMethod::KeywordBased => self.cluster_by_keywords(items)?,
            ClusteringMethod::Hierarchical => self.cluster_hierarchical(items)?,
        };

        // Identifier les items non clusterisés
        let clustered_ids: std::collections::HashSet<_> = clusters
            .iter()
            .flat_map(|c| c.members.iter().cloned())
            .collect();

        let unclustered: Vec<_> = items
            .iter()
            .filter(|i| !clustered_ids.contains(&i.id))
            .map(|i| i.id.clone())
            .collect();

        // Calculer les stats
        let clustered_count = clustered_ids.len();
        let avg_size = if clusters.is_empty() {
            0.0
        } else {
            clustered_count as f32 / clusters.len() as f32
        };

        let stats = ClusteringStats {
            total_items: items.len(),
            clustered_items: clustered_count,
            clusters_created: clusters.len(),
            avg_cluster_size: avg_size,
            silhouette_score: self.calculate_silhouette(&clusters, items),
        };

        info!(
            "[MemoryClusterer] Created {} clusters, {} items clustered, {} unclustered",
            clusters.len(),
            clustered_count,
            unclustered.len()
        );

        Ok(ClusteringResult {
            clusters,
            unclustered_items: unclustered,
            stats,
        })
    }

    /// Clustering basé sur les topics
    fn cluster_by_topic(
        &self,
        items: &[MemoryItem],
    ) -> Result<Vec<MemoryCluster>, MemoryEvolutionError> {
        let mut groups: HashMap<String, Vec<&MemoryItem>> = HashMap::new();

        for item in items {
            let topic = item.topic.clone().unwrap_or_else(|| "general".to_string());
            groups.entry(topic).or_default().push(item);
        }

        let mut clusters = Vec::new();

        for (topic, group) in groups {
            if group.len() >= self.config.min_cluster_size {
                let keywords = self.extract_cluster_keywords(&group);
                let coherence = self.calculate_coherence(&group);

                clusters.push(MemoryCluster {
                    id: format!(
                        "cluster-{}",
                        uuid::Uuid::new_v4().to_string()[..8].to_string()
                    ),
                    label: topic.clone(),
                    description: format!("Cluster thématique: {}", topic),
                    members: group.iter().map(|i| i.id.clone()).collect(),
                    centroid_keywords: keywords,
                    coherence_score: coherence,
                    created_at: chrono::Utc::now().to_rfc3339(),
                    updated_at: chrono::Utc::now().to_rfc3339(),
                });
            }
        }

        // Limiter le nombre de clusters
        clusters.sort_by(|a, b| b.members.len().cmp(&a.members.len()));
        clusters.truncate(self.config.max_clusters);

        Ok(clusters)
    }

    /// Clustering basé sur les mots-clés
    fn cluster_by_keywords(
        &self,
        items: &[MemoryItem],
    ) -> Result<Vec<MemoryCluster>, MemoryEvolutionError> {
        // Extraire tous les mots-clés significatifs
        let mut keyword_to_items: HashMap<String, Vec<&MemoryItem>> = HashMap::new();

        for item in items {
            let keywords = self.extract_keywords(&item.content);
            for kw in keywords {
                keyword_to_items.entry(kw).or_default().push(item);
            }
        }

        // Trier par nombre d'items
        let mut sorted: Vec<_> = keyword_to_items.into_iter().collect();
        sorted.sort_by(|a, b| b.1.len().cmp(&a.1.len()));

        let mut clusters = Vec::new();
        let mut assigned: std::collections::HashSet<String> = std::collections::HashSet::new();

        for (keyword, group) in sorted {
            // Filtrer les items déjà assignés
            let unassigned: Vec<_> = group
                .iter()
                .filter(|i| !assigned.contains(&i.id))
                .cloned()
                .collect();

            if unassigned.len() >= self.config.min_cluster_size
                && clusters.len() < self.config.max_clusters
            {
                for item in &unassigned {
                    assigned.insert(item.id.clone());
                }

                let coherence = self.calculate_coherence(&unassigned);

                clusters.push(MemoryCluster {
                    id: format!(
                        "cluster-kw-{}",
                        uuid::Uuid::new_v4().to_string()[..8].to_string()
                    ),
                    label: keyword.clone(),
                    description: format!("Cluster par mot-clé: {}", keyword),
                    members: unassigned.iter().map(|i| i.id.clone()).collect(),
                    centroid_keywords: vec![keyword],
                    coherence_score: coherence,
                    created_at: chrono::Utc::now().to_rfc3339(),
                    updated_at: chrono::Utc::now().to_rfc3339(),
                });
            }
        }

        Ok(clusters)
    }

    /// Clustering hiérarchique simplifié
    fn cluster_hierarchical(
        &self,
        items: &[MemoryItem],
    ) -> Result<Vec<MemoryCluster>, MemoryEvolutionError> {
        // Pour l'instant, utiliser une approche topic + importance
        let mut high_importance: Vec<&MemoryItem> = Vec::new();
        let mut medium_importance: Vec<&MemoryItem> = Vec::new();
        let mut low_importance: Vec<&MemoryItem> = Vec::new();

        for item in items {
            if item.importance > 0.7 {
                high_importance.push(item);
            } else if item.importance > 0.4 {
                medium_importance.push(item);
            } else {
                low_importance.push(item);
            }
        }

        let mut clusters = Vec::new();

        // Cluster high importance
        if high_importance.len() >= self.config.min_cluster_size {
            clusters.push(MemoryCluster {
                id: "cluster-priority-high".to_string(),
                label: "High Priority".to_string(),
                description: "Mémoires de haute importance".to_string(),
                members: high_importance.iter().map(|i| i.id.clone()).collect(),
                centroid_keywords: self.extract_cluster_keywords(&high_importance),
                coherence_score: self.calculate_coherence(&high_importance),
                created_at: chrono::Utc::now().to_rfc3339(),
                updated_at: chrono::Utc::now().to_rfc3339(),
            });
        }

        // Cluster medium importance
        if medium_importance.len() >= self.config.min_cluster_size {
            clusters.push(MemoryCluster {
                id: "cluster-priority-medium".to_string(),
                label: "Medium Priority".to_string(),
                description: "Mémoires d'importance moyenne".to_string(),
                members: medium_importance.iter().map(|i| i.id.clone()).collect(),
                centroid_keywords: self.extract_cluster_keywords(&medium_importance),
                coherence_score: self.calculate_coherence(&medium_importance),
                created_at: chrono::Utc::now().to_rfc3339(),
                updated_at: chrono::Utc::now().to_rfc3339(),
            });
        }

        // Cluster low importance
        if low_importance.len() >= self.config.min_cluster_size {
            clusters.push(MemoryCluster {
                id: "cluster-priority-low".to_string(),
                label: "Low Priority".to_string(),
                description: "Mémoires de faible importance".to_string(),
                members: low_importance.iter().map(|i| i.id.clone()).collect(),
                centroid_keywords: self.extract_cluster_keywords(&low_importance),
                coherence_score: self.calculate_coherence(&low_importance),
                created_at: chrono::Utc::now().to_rfc3339(),
                updated_at: chrono::Utc::now().to_rfc3339(),
            });
        }

        // Sous-clusters par topic dans chaque niveau
        let topic_clusters = self.cluster_by_topic(items)?;
        for tc in topic_clusters {
            if !clusters.iter().any(|c| c.label == tc.label) {
                clusters.push(tc);
            }
        }

        clusters.truncate(self.config.max_clusters);
        Ok(clusters)
    }

    /// Extrait les mots-clés d'un texte
    fn extract_keywords(&self, text: &str) -> Vec<String> {
        let stop_words = [
            "le", "la", "les", "de", "du", "des", "un", "une", "et", "ou", "the", "a", "an", "is",
            "are", "was", "were", "be", "been", "to", "of", "in", "for", "on", "with", "at", "by",
            "from",
        ];

        text.split_whitespace()
            .map(|w| {
                w.to_lowercase()
                    .trim_matches(|c: char| !c.is_alphanumeric())
                    .to_string()
            })
            .filter(|w| w.len() > 3 && !stop_words.contains(&w.as_str()))
            .collect()
    }

    /// Extrait les mots-clés représentatifs d'un cluster
    fn extract_cluster_keywords(&self, items: &[&MemoryItem]) -> Vec<String> {
        let mut word_count: HashMap<String, usize> = HashMap::new();

        for item in items {
            for word in self.extract_keywords(&item.content) {
                *word_count.entry(word).or_insert(0) += 1;
            }
        }

        let mut sorted: Vec<_> = word_count.into_iter().collect();
        sorted.sort_by(|a, b| b.1.cmp(&a.1));

        sorted.into_iter().take(5).map(|(w, _)| w).collect()
    }

    /// Calcule le score de cohérence d'un groupe
    fn calculate_coherence(&self, items: &[&MemoryItem]) -> f32 {
        if items.len() < 2 {
            return 1.0;
        }

        // Cohérence basée sur la variance des confidences
        let confidences: Vec<f32> = items.iter().map(|i| i.confidence).collect();
        let mean = confidences.iter().sum::<f32>() / confidences.len() as f32;
        let variance =
            confidences.iter().map(|c| (c - mean).powi(2)).sum::<f32>() / confidences.len() as f32;

        // Plus la variance est basse, plus le cluster est cohérent
        1.0 - variance.sqrt().min(1.0)
    }

    /// Calcule le score silhouette (qualité du clustering)
    fn calculate_silhouette(&self, clusters: &[MemoryCluster], _items: &[MemoryItem]) -> f32 {
        if clusters.is_empty() {
            return 0.0;
        }

        // Approximation simple basée sur la cohérence moyenne
        let avg_coherence =
            clusters.iter().map(|c| c.coherence_score).sum::<f32>() / clusters.len() as f32;

        avg_coherence
    }

    /// Fusionne deux clusters
    pub fn merge_clusters(
        &self,
        cluster_a: &MemoryCluster,
        cluster_b: &MemoryCluster,
    ) -> MemoryCluster {
        let mut members = cluster_a.members.clone();
        members.extend(cluster_b.members.clone());

        let mut keywords = cluster_a.centroid_keywords.clone();
        keywords.extend(cluster_b.centroid_keywords.clone());
        keywords.sort();
        keywords.dedup();
        keywords.truncate(5);

        MemoryCluster {
            id: format!(
                "cluster-merged-{}",
                uuid::Uuid::new_v4().to_string()[..8].to_string()
            ),
            label: format!("{} + {}", cluster_a.label, cluster_b.label),
            description: format!("Fusion de {} et {}", cluster_a.label, cluster_b.label),
            members,
            centroid_keywords: keywords,
            coherence_score: (cluster_a.coherence_score + cluster_b.coherence_score) / 2.0,
            created_at: chrono::Utc::now().to_rfc3339(),
            updated_at: chrono::Utc::now().to_rfc3339(),
        }
    }

    /// Divise un cluster trop grand
    pub fn split_cluster(
        &self,
        cluster: &MemoryCluster,
        items: &[MemoryItem],
    ) -> Vec<MemoryCluster> {
        let cluster_items: Vec<_> = items
            .iter()
            .filter(|i| cluster.members.contains(&i.id))
            .collect();

        if cluster_items.len() < self.config.min_cluster_size * 2 {
            return vec![cluster.clone()];
        }

        // Diviser par importance
        let (high, low): (Vec<_>, Vec<_>) =
            cluster_items.into_iter().partition(|i| i.importance > 0.5);

        let mut result = Vec::new();

        if high.len() >= self.config.min_cluster_size {
            result.push(MemoryCluster {
                id: format!("{}-high", cluster.id),
                label: format!("{} (High)", cluster.label),
                description: format!("Sous-cluster haute importance de {}", cluster.label),
                members: high.iter().map(|i| i.id.clone()).collect(),
                centroid_keywords: cluster.centroid_keywords.clone(),
                coherence_score: cluster.coherence_score,
                created_at: chrono::Utc::now().to_rfc3339(),
                updated_at: chrono::Utc::now().to_rfc3339(),
            });
        }

        if low.len() >= self.config.min_cluster_size {
            result.push(MemoryCluster {
                id: format!("{}-low", cluster.id),
                label: format!("{} (Low)", cluster.label),
                description: format!("Sous-cluster basse importance de {}", cluster.label),
                members: low.iter().map(|i| i.id.clone()).collect(),
                centroid_keywords: cluster.centroid_keywords.clone(),
                coherence_score: cluster.coherence_score,
                created_at: chrono::Utc::now().to_rfc3339(),
                updated_at: chrono::Utc::now().to_rfc3339(),
            });
        }

        if result.is_empty() {
            result.push(cluster.clone());
        }

        result
    }
}

impl Default for MemoryClusterer {
    fn default() -> Self {
        Self::new(ClustererConfig::default())
    }
}
