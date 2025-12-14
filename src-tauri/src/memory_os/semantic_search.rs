// ═══════════════════════════════════════════════════════════════
//   SEMANTIC SEARCH ENGINE
// ═══════════════════════════════════════════════════════════════

use crate::memory_os::{
    ClusterResult, EmbeddingEngine, HnswVectorIndex, KMeansClustering, KMeansConfig, MemoryOSError,
    MemoryOSResult, VectorIndex, VectorIndexConfig, VectorSearchResult,
};
use std::cmp::Ordering;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

/// Semantic Search Engine
pub struct SemanticSearchEngine {
    /// Vector index
    index: Arc<RwLock<HnswVectorIndex>>,

    /// Embedding engine
    embeddings: Arc<EmbeddingEngine>,

    /// Content storage (id → content)
    content_map: Arc<RwLock<HashMap<String, String>>>,

    /// Metadata storage (id → metadata)
    metadata_map: Arc<RwLock<HashMap<String, serde_json::Value>>>,

    /// Configuration
    config: SemanticSearchConfig,
}

#[derive(Debug, Clone)]
pub struct SemanticSearchConfig {
    pub index_config: VectorIndexConfig,
    pub search_k: usize,
    pub similarity_threshold: f32,
    pub enable_clustering: bool,
}

impl Default for SemanticSearchConfig {
    fn default() -> Self {
        Self {
            index_config: VectorIndexConfig::default(),
            search_k: 10,
            similarity_threshold: 0.7,
            enable_clustering: true,
        }
    }
}

impl SemanticSearchEngine {
    pub fn new(embeddings: Arc<EmbeddingEngine>, config: SemanticSearchConfig) -> Self {
        let index = HnswVectorIndex::new(config.index_config.clone());

        Self {
            index: Arc::new(RwLock::new(index)),
            embeddings,
            content_map: Arc::new(RwLock::new(HashMap::new())),
            metadata_map: Arc::new(RwLock::new(HashMap::new())),
            config,
        }
    }

    /// Add entry to index
    pub async fn add(
        &self,
        id: String,
        content: String,
        metadata: serde_json::Value,
    ) -> MemoryOSResult<()> {
        // Generate embedding
        let embedding = self.embeddings.embed(&content).await?;

        // Add to vector index
        {
            let mut index = self.index.write().await;
            index.add_vector(id.clone(), embedding)?;
        }

        // Store content and metadata
        {
            let mut content_map = self.content_map.write().await;
            content_map.insert(id.clone(), content);
        }

        {
            let mut metadata_map = self.metadata_map.write().await;
            metadata_map.insert(id, metadata);
        }

        Ok(())
    }

    /// Semantic search
    pub async fn search(&self, query: &str, k: usize) -> MemoryOSResult<Vec<VectorSearchResult>> {
        // Generate query embedding
        let query_embedding = self.embeddings.embed(query).await?;

        // Search index
        let search_results = {
            let index = self.index.read().await;
            index.search(&query_embedding, k)?
        };

        // Fetch content and metadata
        let content_map = self.content_map.read().await;
        let metadata_map = self.metadata_map.read().await;

        let mut results = Vec::new();
        let mut candidates = Vec::new();

        for result in search_results {
            let (Some(content), Some(metadata)) =
                (content_map.get(&result.id), metadata_map.get(&result.id))
            else {
                continue;
            };

            let item = VectorSearchResult {
                id: result.id,
                score: result.score,
                content: content.clone(),
                metadata: metadata.clone(),
            };

            if item.score >= self.config.similarity_threshold {
                results.push(item.clone());
            }

            candidates.push(item);
        }

        if results.is_empty() && !candidates.is_empty() {
            candidates.sort_by(|a, b| {
                b.score
                    .partial_cmp(&a.score)
                    .unwrap_or(Ordering::Equal)
                    .then_with(|| a.id.cmp(&b.id))
            });

            candidates.truncate(k.min(candidates.len()));
            return Ok(candidates);
        }

        Ok(results)
    }

    /// Remove entry
    pub async fn remove(&self, id: &str) -> MemoryOSResult<()> {
        {
            let mut index = self.index.write().await;
            index.remove(id)?;
        }

        {
            let mut content_map = self.content_map.write().await;
            content_map.remove(id);
        }

        {
            let mut metadata_map = self.metadata_map.write().await;
            metadata_map.remove(id);
        }

        Ok(())
    }

    /// Cluster all vectors
    pub async fn cluster(&self) -> MemoryOSResult<ClusterResult> {
        if !self.config.enable_clustering {
            return Err(MemoryOSError::ClusteringError(
                "Clustering is disabled".to_string(),
            ));
        }

        // Get all vectors
        let index = self.index.read().await;
        let size = index.size();

        if size < 5 {
            return Err(MemoryOSError::ClusteringError(format!(
                "Not enough vectors for clustering: {}",
                size
            )));
        }

        // Build vector map
        let content_map = self.content_map.read().await;
        let mut vectors = HashMap::new();

        for id in content_map.keys() {
            if let Some(vec) = index.get_vector(id) {
                vectors.insert(id.clone(), vec);
            }
        }

        drop(index);

        // Determine optimal k (sqrt(n))
        let k = (size as f32).sqrt().ceil() as usize;
        let k = k.max(2).min(20); // Between 2 and 20 clusters

        let kmeans_config = KMeansConfig {
            k,
            ..Default::default()
        };

        let clustering = KMeansClustering::new(kmeans_config);
        clustering.cluster(&vectors)
    }

    /// Compress similar entries (merge duplicates)
    pub async fn compress_similar(&self, threshold: f32) -> MemoryOSResult<u32> {
        let content_map = self.content_map.read().await;
        let ids: Vec<String> = content_map.keys().cloned().collect();
        drop(content_map);

        let mut removed_count = 0;
        let mut processed = std::collections::HashSet::new();

        for id in &ids {
            if processed.contains(id) {
                continue;
            }

            // Find similar entries
            let content_map = self.content_map.read().await;
            let content = match content_map.get(id) {
                Some(c) => c.clone(),
                None => continue,
            };
            drop(content_map);

            let similar = self.search(&content, 10).await?;

            for result in similar {
                if result.id != *id && result.score >= threshold && !processed.contains(&result.id)
                {
                    // Remove similar entry
                    self.remove(&result.id).await?;
                    processed.insert(result.id);
                    removed_count += 1;
                }
            }

            processed.insert(id.clone());
        }

        Ok(removed_count)
    }

    /// Get statistics
    pub async fn stats(&self) -> SemanticSearchStats {
        let index = self.index.read().await;
        let content_count = self.content_map.read().await.len();

        SemanticSearchStats {
            total_entries: content_count,
            dimension: index.dimension(),
            index_size: index.size(),
        }
    }

    /// Clear all data
    pub async fn clear(&self) -> MemoryOSResult<()> {
        {
            let mut index = self.index.write().await;
            index.clear()?;
        }

        {
            let mut content_map = self.content_map.write().await;
            content_map.clear();
        }

        {
            let mut metadata_map = self.metadata_map.write().await;
            metadata_map.clear();
        }

        Ok(())
    }
}

#[derive(Debug, Clone)]
pub struct SemanticSearchStats {
    pub total_entries: usize,
    pub dimension: usize,
    pub index_size: usize,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::memory_os::{EmbeddingConfig, EmbeddingSource};

    #[tokio::test]
    async fn test_semantic_search_basic() {
        let embedding_config = EmbeddingConfig {
            source: EmbeddingSource::Local,
            dimension: 128,
            ..Default::default()
        };

        let embeddings = Arc::new(EmbeddingEngine::new(embedding_config));

        let search_config = SemanticSearchConfig {
            index_config: VectorIndexConfig::new(128),
            ..Default::default()
        };

        let engine = SemanticSearchEngine::new(embeddings, search_config);

        // Add entries
        engine
            .add(
                "1".to_string(),
                "Hello world".to_string(),
                serde_json::json!({}),
            )
            .await
            .unwrap();

        engine
            .add(
                "2".to_string(),
                "Hello there".to_string(),
                serde_json::json!({}),
            )
            .await
            .unwrap();

        // Search
        let results = engine.search("Hello", 10).await.unwrap();

        assert!(!results.is_empty());
    }
}
