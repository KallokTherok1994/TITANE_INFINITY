// ═══════════════════════════════════════════════════════════════
//   UNIFIED MEMORY V2 — PUBLIC API
//   Interface simple et unifiée pour tous les besoins mémoire
// ═══════════════════════════════════════════════════════════════

use std::sync::Arc;
use tokio::sync::RwLock;

use super::config::MemoryConfig;
use super::types::*;

/// Unified Memory v2 Public API
///
/// **Usage:**
/// ```rust
/// let mut memory = UnifiedMemoryV2::new(MemoryConfig::default());
/// memory.init().await?;
/// 
/// // Store
/// let id = memory.store("Hello world", 0.8, MemoryType::Conversation).await?;
/// 
/// // Recall
/// let results = memory.recall("world", 10).await?;
/// 
/// // Stats
/// let stats = memory.stats().await?;
/// ```
pub struct UnifiedMemoryV2 {
    config: MemoryConfig,
    // Implementation sera dans neural_memory/ (privé)
    inner: Arc<RwLock<MemoryInner>>,
}

/// Internal state (hidden from public API)
struct MemoryInner {
    initialized: bool,
    // Sera complété avec neural_memory components
}

impl UnifiedMemoryV2 {
    /// Create new memory system
    pub fn new(config: MemoryConfig) -> Self {
        Self {
            config,
            inner: Arc::new(RwLock::new(MemoryInner {
                initialized: false,
            })),
        }
    }

    /// Initialize memory system
    pub async fn init(&mut self) -> MemoryResult<()> {
        let mut inner = self.inner.write().await;
        
        if inner.initialized {
            return Ok(());
        }

        // TODO: Initialize neural_memory components
        // - STM, MTM, LTM
        // - Vector store
        // - Consolidation engine
        // - Forgetting engine
        // - Evolution engine
        // - Persistence layer
        // - Encryption layer

        inner.initialized = true;
        Ok(())
    }

    /// Store new memory
    pub async fn store(
        &self,
        content: impl Into<String>,
        importance: f32,
        memory_type: MemoryType,
    ) -> MemoryResult<MemoryId> {
        let inner = self.inner.read().await;
        
        if !inner.initialized {
            return Err(MemoryError::StorageError("Not initialized".to_string()));
        }

        let entry = MemoryEntry::new(
            content.into(),
            importance,
            memory_type,
        );

        let id = entry.id.clone();

        // TODO: Store in STM (neural_memory)
        // - Add to STM queue
        // - Generate embedding if enabled
        // - Persist if enabled
        // - Encrypt if enabled

        Ok(id)
    }

    /// Recall memories by query
    pub async fn recall(
        &self,
        query: impl Into<String>,
        limit: usize,
    ) -> MemoryResult<Vec<MemoryEntry>> {
        let inner = self.inner.read().await;
        
        if !inner.initialized {
            return Err(MemoryError::StorageError("Not initialized".to_string()));
        }

        let _query = query.into();

        // TODO: Search across STM/MTM/LTM
        // - Vector search if available
        // - Keyword search fallback
        // - Rank by relevance
        // - Return top N

        Ok(Vec::new())
    }

    /// Get memory by ID
    pub async fn get(&self, id: &str) -> MemoryResult<MemoryEntry> {
        let inner = self.inner.read().await;
        
        if !inner.initialized {
            return Err(MemoryError::StorageError("Not initialized".to_string()));
        }

        // TODO: Search by ID in all tiers

        Err(MemoryError::NotFound(id.to_string()))
    }

    /// Remove memory by ID
    pub async fn remove(&self, id: &str) -> MemoryResult<()> {
        let inner = self.inner.read().await;
        
        if !inner.initialized {
            return Err(MemoryError::StorageError("Not initialized".to_string()));
        }

        // TODO: Remove from tier + vector index

        Ok(())
    }

    /// Get memories by tier
    pub async fn get_by_tier(&self, tier: MemoryTier, limit: usize) -> MemoryResult<Vec<MemoryEntry>> {
        let inner = self.inner.read().await;
        
        if !inner.initialized {
            return Err(MemoryError::StorageError("Not initialized".to_string()));
        }

        // TODO: Return memories from specific tier

        Ok(Vec::new())
    }

    /// Get system statistics
    pub async fn stats(&self) -> MemoryResult<MemoryStats> {
        let inner = self.inner.read().await;
        
        if !inner.initialized {
            return Err(MemoryError::StorageError("Not initialized".to_string()));
        }

        let snapshot = MemorySnapshot {
            timestamp: chrono::Utc::now().timestamp_millis(),
            stm_count: 0,
            mtm_count: 0,
            ltm_count: 0,
            total_count: 0,
            total_bytes: 0,
            vector_count: 0,
            cluster_count: 0,
        };

        Ok(MemoryStats {
            snapshot,
            avg_recall_ms: 0.0,
            avg_store_ms: 0.0,
            cache_hit_rate: 0.0,
            consolidation_rate: 0.0,
            decay_rate: 0.0,
        })
    }

    /// Run consolidation cycle (STM→MTM→LTM)
    pub async fn consolidate(&self) -> MemoryResult<ConsolidationResult> {
        let inner = self.inner.read().await;
        
        if !inner.initialized {
            return Err(MemoryError::StorageError("Not initialized".to_string()));
        }

        // TODO: Run consolidation
        
        Ok(ConsolidationResult {
            stm_promoted: 0,
            mtm_promoted: 0,
            ltm_stored: 0,
            duration_ms: 0,
        })
    }

    /// Run forgetting cycle (decay + cleanup)
    pub async fn forget(&self) -> MemoryResult<ForgettingResult> {
        let inner = self.inner.read().await;
        
        if !inner.initialized {
            return Err(MemoryError::StorageError("Not initialized".to_string()));
        }

        // TODO: Run forgetting
        
        Ok(ForgettingResult {
            decayed_count: 0,
            deleted_count: 0,
            duration_ms: 0,
        })
    }

    /// Run evolution cycle (clustering, compression, patterns)
    pub async fn evolve(&self) -> MemoryResult<EvolutionResult> {
        let inner = self.inner.read().await;
        
        if !inner.initialized {
            return Err(MemoryError::StorageError("Not initialized".to_string()));
        }

        // TODO: Run evolution
        
        Ok(EvolutionResult {
            clusters_created: 0,
            compressed_count: 0,
            patterns_extracted: 0,
            duration_ms: 0,
        })
    }

    /// Clear all memories
    pub async fn clear(&self) -> MemoryResult<()> {
        let inner = self.inner.read().await;
        
        if !inner.initialized {
            return Err(MemoryError::StorageError("Not initialized".to_string()));
        }

        // TODO: Clear all tiers + vector index + persistence

        Ok(())
    }
}

/// Consolidation result
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ConsolidationResult {
    pub stm_promoted: usize,
    pub mtm_promoted: usize,
    pub ltm_stored: usize,
    pub duration_ms: u64,
}

/// Forgetting result
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ForgettingResult {
    pub decayed_count: usize,
    pub deleted_count: usize,
    pub duration_ms: u64,
}

/// Evolution result
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct EvolutionResult {
    pub clusters_created: usize,
    pub compressed_count: usize,
    pub patterns_extracted: usize,
    pub duration_ms: u64,
}

/// Public trait for memory operations
#[async_trait::async_trait]
pub trait MemoryAPI {
    async fn store(&self, content: String, importance: f32, memory_type: MemoryType) -> MemoryResult<MemoryId>;
    async fn recall(&self, query: String, limit: usize) -> MemoryResult<Vec<MemoryEntry>>;
    async fn get(&self, id: &str) -> MemoryResult<MemoryEntry>;
    async fn remove(&self, id: &str) -> MemoryResult<()>;
    async fn stats(&self) -> MemoryResult<MemoryStats>;
}

#[async_trait::async_trait]
impl MemoryAPI for UnifiedMemoryV2 {
    async fn store(&self, content: String, importance: f32, memory_type: MemoryType) -> MemoryResult<MemoryId> {
        self.store(content, importance, memory_type).await
    }

    async fn recall(&self, query: String, limit: usize) -> MemoryResult<Vec<MemoryEntry>> {
        self.recall(query, limit).await
    }

    async fn get(&self, id: &str) -> MemoryResult<MemoryEntry> {
        self.get(id).await
    }

    async fn remove(&self, id: &str) -> MemoryResult<()> {
        self.remove(id).await
    }

    async fn stats(&self) -> MemoryResult<MemoryStats> {
        self.stats().await
    }
}
