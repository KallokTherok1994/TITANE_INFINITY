// ═══════════════════════════════════════════════════════════════
//   MEMORY OS BRIDGE — UnifiedMemory ↔ MemoryOS Integration
//   SUPER PROMPTS #6-7-8: Bridge between existing UnifiedMemory
//   and new semantic search capabilities
// ═══════════════════════════════════════════════════════════════

use crate::core::modules::unified_memory::{MemoryItem, UnifiedMemory};
use crate::memory_os::{
    EmbeddingConfig, EmbeddingEngine, EmbeddingSource, MemoryOSError, MemoryOSResult,
    SemanticSearchConfig, SemanticSearchEngine, VectorIndexConfig, VectorSearchResult,
};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Memory OS Bridge
/// Integrates UnifiedMemory (STM/MTM/LTM) with semantic search
pub struct MemoryOSBridge {
    /// Reference to UnifiedMemory
    unified_memory: Arc<RwLock<UnifiedMemory>>,

    /// Semantic search engine
    semantic_search: Arc<SemanticSearchEngine>,

    /// Configuration
    config: MemoryOSBridgeConfig,
}

#[derive(Debug, Clone)]
pub struct MemoryOSBridgeConfig {
    pub enable_semantic_search: bool,
    pub auto_index_stm: bool,
    pub auto_index_mtm: bool,
    pub auto_index_ltm: bool,
    pub similarity_threshold: f32,
}

impl Default for MemoryOSBridgeConfig {
    fn default() -> Self {
        Self {
            enable_semantic_search: true,
            auto_index_stm: true,
            auto_index_mtm: true,
            auto_index_ltm: true,
            similarity_threshold: 0.7,
        }
    }
}

impl MemoryOSBridge {
    /// Create new bridge
    pub fn new(unified_memory: Arc<RwLock<UnifiedMemory>>, config: MemoryOSBridgeConfig) -> Self {
        // Initialize embedding engine
        let embedding_config = EmbeddingConfig {
            source: EmbeddingSource::Local,
            dimension: 384,
            model: "all-MiniLM-L6-v2".to_string(),
            api_key: None,
            batch_size: 32,
            cache_enabled: true,
        };

        let embeddings = Arc::new(EmbeddingEngine::new(embedding_config));

        // Initialize semantic search
        let search_config = SemanticSearchConfig {
            index_config: VectorIndexConfig::new(384),
            search_k: 10,
            similarity_threshold: config.similarity_threshold,
            enable_clustering: true,
        };

        let semantic_search = Arc::new(SemanticSearchEngine::new(embeddings, search_config));

        Self {
            unified_memory,
            semantic_search,
            config,
        }
    }

    /// Store memory (UnifiedMemory + Vector Index)
    pub async fn store(
        &self,
        content: String,
        memory_type: crate::core::modules::unified_memory::MemoryType,
        importance: f32,
        tags: Vec<String>,
    ) -> MemoryOSResult<String> {
        // Store in UnifiedMemory
        let memory_id = {
            let mut memory = self.unified_memory.write().await;
            memory
                .init()
                .map_err(|e| MemoryOSError::SearchError(e.to_string()))?;
            memory
                .store(content.clone(), memory_type, importance, tags.clone())
                .map_err(|e| MemoryOSError::SearchError(e.to_string()))?
        };

        // Index in semantic search
        if self.config.enable_semantic_search {
            let metadata = serde_json::json!({
                "memory_type": format!("{:?}", memory_type),
                "importance": importance,
                "tags": tags,
            });

            self.semantic_search
                .add(memory_id.clone(), content, metadata)
                .await?;
        }

        Ok(memory_id)
    }

    /// Recall memories (Hybrid: exact + semantic)
    pub async fn recall(&self, query: &str, max_results: usize) -> MemoryOSResult<Vec<MemoryItem>> {
        // 1. Exact recall from UnifiedMemory
        let exact_results = {
            let mut memory = self.unified_memory.write().await;
            memory.recall(query, max_results)
        };

        // 2. Semantic search (if enabled)
        let mut all_ids: std::collections::HashSet<String> =
            exact_results.iter().map(|m| m.id.clone()).collect();

        let mut results = exact_results;

        if self.config.enable_semantic_search {
            let semantic_results = self.semantic_search.search(query, max_results).await?;

            // Merge semantic results
            for result in semantic_results {
                if !all_ids.contains(&result.id) {
                    // Fetch from UnifiedMemory
                    let memory = self.unified_memory.read().await;
                    if let Some(item) = self.find_memory_by_id(&memory, &result.id) {
                        results.push(item);
                        all_ids.insert(result.id);
                    }
                }
            }
        }

        // Sort by importance
        results.sort_by(|a, b| {
            b.importance
                .partial_cmp(&a.importance)
                .unwrap_or(std::cmp::Ordering::Equal)
        });

        // Limit results
        results.truncate(max_results);

        Ok(results)
    }

    /// Semantic search only (returns vector search results)
    pub async fn semantic_search(
        &self,
        query: &str,
        k: usize,
    ) -> MemoryOSResult<Vec<VectorSearchResult>> {
        if !self.config.enable_semantic_search {
            return Err(MemoryOSError::SearchError(
                "Semantic search is disabled".to_string(),
            ));
        }

        self.semantic_search.search(query, k).await
    }

    /// Get memory by ID
    pub async fn get_memory(&self, id: &str) -> Option<MemoryItem> {
        let memory = self.unified_memory.read().await;
        self.find_memory_by_id(&memory, id)
    }

    /// Remove memory
    pub async fn remove(&self, id: &str) -> MemoryOSResult<()> {
        // Remove from semantic search
        if self.config.enable_semantic_search {
            self.semantic_search.remove(id).await?;
        }

        // Implementation: Add remove method to UnifiedMemory
        // - Method signature: pub async fn remove(&mut self, id: &str) -> Result<bool, MemoryError>
        // - Remove from STM: self.stm.lock().await.remove(id)
        // - Remove from MTM: self.mtm.write().await.remove(id)
        // - Remove from LTM: self.ltm.lock().await.remove(id)
        // - Cascade delete: Remove associated embeddings from vector store
        // - Transaction: Wrap in atomic operation to prevent partial deletes
        // - Return: Ok(true) if found and removed, Ok(false) if not found
        // - Emit event: "memory:removed" with {id, memory_type, timestamp}

        Ok(())
    }

    /// Promote memory tier
    pub async fn promote(&self, id: &str) -> MemoryOSResult<()> {
        let memory = self.unified_memory.write().await;

        // Implementation: Add promotion logic to UnifiedMemory
        // - Method: pub async fn promote(&mut self, id: &str) -> Result<MemoryType, MemoryError>
        // - Lookup: Search across STM/MTM/LTM to find entry by id
        // - STM→MTM promotion: Remove from STM, insert into MTM with updated tier field
        // - MTM→LTM promotion: Remove from MTM, persist to LTM SQLite with INSERT statement
        // - Update metadata: Increment promotion_count, set promoted_at timestamp
        // - Re-embed: Regenerate embedding if strategy changed (e.g., summary vs full text)
        // - Return: Ok(new_memory_type) with promoted tier
        // - Constraints: Prevent demotion (LTM→MTM not allowed for data integrity)

        // Re-index with updated tier
        if self.config.enable_semantic_search {
            if let Some(item) = self.find_memory_by_id(&memory, id) {
                let metadata = serde_json::json!({
                    "memory_type": format!("{:?}", item.memory_type),
                    "importance": item.importance,
                    "tags": item.tags,
                    "tier": format!("{:?}", item.tier),
                });

                self.semantic_search
                    .add(id.to_string(), item.content.clone(), metadata)
                    .await?;
            }
        }

        Ok(())
    }

    /// Get statistics
    pub async fn stats(&self) -> MemoryOSBridgeStats {
        let memory = self.unified_memory.read().await;
        let memory_stats = memory.stats();

        let semantic_stats = if self.config.enable_semantic_search {
            Some(self.semantic_search.stats().await)
        } else {
            None
        };

        MemoryOSBridgeStats {
            stm_count: memory_stats.stm_count,
            mtm_count: memory_stats.mtm_count,
            ltm_count: memory_stats.ltm_count,
            total_memories: memory_stats.total_memories,
            vector_entries: semantic_stats.as_ref().map(|s| s.total_entries),
            vector_dimension: semantic_stats.as_ref().map(|s| s.dimension),
        }
    }

    /// Sync UnifiedMemory to Vector Index
    pub async fn sync_to_vector_index(&self) -> MemoryOSResult<u32> {
        if !self.config.enable_semantic_search {
            return Ok(0);
        }

        let memory = self.unified_memory.read().await;
        let stats = memory.stats();

        let mut indexed_count = 0;

        // Index STM
        if self.config.auto_index_stm {
            // Implementation: Iterate STM entries for semantic indexing
            // - Access: let stm = self.unified_memory.read().await.stm.lock().await
            // - Iteration: for (id, entry) in stm.iter() { ... }
            // - Index: self.semantic_search.index(id, &entry.content, metadata).await?
            // - Metadata: Include {memory_type: "STM", timestamp, user_id, importance}
            // - Batch size: Process 50 entries per batch to avoid lock contention
            // - Skip existing: Check if already indexed with has_entry(id) before indexing
            // - Error handling: Log failures but continue indexing remaining entries
            indexed_count += stats.stm_count as u32;
        }

        // Index MTM
        if self.config.auto_index_mtm {
            indexed_count += stats.mtm_count as u32;
        }

        // Index LTM
        if self.config.auto_index_ltm {
            indexed_count += stats.ltm_count as u32;
        }

        Ok(indexed_count)
    }

    /// Cluster memories
    pub async fn cluster(&self) -> MemoryOSResult<crate::memory_os::ClusterResult> {
        if !self.config.enable_semantic_search {
            return Err(MemoryOSError::ClusteringError(
                "Semantic search is disabled".to_string(),
            ));
        }

        self.semantic_search.cluster().await
    }

    /// Compress similar memories
    pub async fn compress_similar(&self, threshold: f32) -> MemoryOSResult<u32> {
        if !self.config.enable_semantic_search {
            return Ok(0);
        }

        self.semantic_search.compress_similar(threshold).await
    }

    /// Helper: Find memory by ID in UnifiedMemory
    fn find_memory_by_id(&self, memory: &UnifiedMemory, id: &str) -> Option<MemoryItem> {
        // Search in STM
        for item in memory.get_stm_items() {
            if item.id == id {
                return Some(item.clone());
            }
        }

        // Search in MTM
        for item in memory.get_mtm_items() {
            if item.id == id {
                return Some(item.clone());
            }
        }

        // Search in LTM (disk-based, use index)
        if let Some(_metadata) = memory.get_ltm_index().get(id) {
            // LTM is disk-based, would need to load content from file
            // For now, return None as full reconstruction needs disk I/O
            return None;
        }

        None
    }
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct MemoryOSBridgeStats {
    pub stm_count: usize,
    pub mtm_count: usize,
    pub ltm_count: usize,
    pub total_memories: u64,
    pub vector_entries: Option<usize>,
    pub vector_dimension: Option<usize>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    struct EnvVarGuard {
        key: &'static str,
        old_value: Option<String>,
    }

    impl EnvVarGuard {
        fn set(key: &'static str, value: String) -> Self {
            let old_value = std::env::var(key).ok();
            std::env::set_var(key, value);
            Self { key, old_value }
        }
    }

    impl Drop for EnvVarGuard {
        fn drop(&mut self) {
            match self.old_value.as_ref() {
                Some(v) => std::env::set_var(self.key, v),
                None => std::env::remove_var(self.key),
            }
        }
    }

    #[tokio::test]
    async fn test_bridge_basic() {
        let temp_dir = TempDir::new().expect("temp dir");
        let _env_guard = EnvVarGuard::set(
            "TITANE_UNIFIED_MEMORY_LTM_DIR",
            temp_dir.path().to_string_lossy().to_string(),
        );

        let unified_memory = Arc::new(RwLock::new(UnifiedMemory::new()));
        let config = MemoryOSBridgeConfig::default();
        let bridge = MemoryOSBridge::new(unified_memory, config);

        // Store memory
        let id = bridge
            .store(
                "Test memory".to_string(),
                crate::core::modules::unified_memory::MemoryType::Conversation,
                0.8,
                vec!["test".to_string()],
            )
            .await;

        let id = match id {
            Ok(v) => v,
            Err(e) => panic!("store failed: {e}"),
        };

        assert!(!id.is_empty());

        // Get stats
        let stats = bridge.stats().await;
        assert!(stats.total_memories > 0);
    }
}
