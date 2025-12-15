// ═══════════════════════════════════════════════════════════════
//   UNIFIED MEMORY V2 — PUBLIC API
//   Interface simple et unifiée pour tous les besoins mémoire
// ═══════════════════════════════════════════════════════════════

use std::sync::Arc;
use tokio::sync::RwLock;

use super::bridge::MemoryBridge;
use super::config::MemoryConfig;
use super::types::*;

/// Unified Memory v2 Public API
///
/// **Usage:**
/// ```rust,ignore
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
    bridge: MemoryBridge,
}

impl UnifiedMemoryV2 {
    /// Create new memory system
    pub fn new(config: MemoryConfig) -> Self {
        Self {
            config,
            inner: Arc::new(RwLock::new(MemoryInner {
                initialized: false,
                bridge: MemoryBridge::default(),
            })),
        }
    }

    /// Initialize memory system
    pub async fn init(&mut self) -> MemoryResult<()> {
        let mut inner = self.inner.write().await;

        if inner.initialized {
            return Ok(());
        }

        inner.bridge.init().await?;
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
        let mut inner = self.inner.write().await;

        if !inner.initialized {
            return Err(MemoryError::StorageError("Not initialized".to_string()));
        }

        let entry = MemoryEntry::new(content.into(), importance, memory_type);

        let id = entry.id.clone();
        inner.bridge.store_stm(entry).await?;

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

        inner.bridge.search(&query.into(), limit).await
    }

    /// Get memory by ID
    pub async fn get(&self, id: &str) -> MemoryResult<MemoryEntry> {
        let inner = self.inner.read().await;

        if !inner.initialized {
            return Err(MemoryError::StorageError("Not initialized".to_string()));
        }

        inner.bridge.get(id).await
    }

    /// Remove memory by ID
    pub async fn remove(&self, id: &str) -> MemoryResult<()> {
        let mut inner = self.inner.write().await;

        if !inner.initialized {
            return Err(MemoryError::StorageError("Not initialized".to_string()));
        }

        inner.bridge.remove(id).await
    }

    /// Get memories by tier
    pub async fn get_by_tier(
        &self,
        tier: MemoryTier,
        limit: usize,
    ) -> MemoryResult<Vec<MemoryEntry>> {
        let inner = self.inner.read().await;

        if !inner.initialized {
            return Err(MemoryError::StorageError("Not initialized".to_string()));
        }

        inner.bridge.get_by_tier(tier, limit).await
    }

    /// Get system statistics
    pub async fn stats(&self) -> MemoryResult<MemoryStats> {
        let inner = self.inner.read().await;

        if !inner.initialized {
            return Err(MemoryError::StorageError("Not initialized".to_string()));
        }

        let bridge_stats = inner.bridge.stats();

        let snapshot = MemorySnapshot {
            timestamp: chrono::Utc::now().timestamp_millis(),
            stm_count: bridge_stats.stm_count,
            mtm_count: bridge_stats.mtm_count,
            ltm_count: bridge_stats.ltm_count,
            total_count: bridge_stats.stm_count + bridge_stats.mtm_count + bridge_stats.ltm_count,
            total_bytes: 0, // TODO: Calculate from entries
            vector_count: bridge_stats.vector_count,
            cluster_count: 0, // TODO: Implement clustering
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
        let mut inner = self.inner.write().await;

        if !inner.initialized {
            return Err(MemoryError::StorageError("Not initialized".to_string()));
        }

        let start = std::time::Instant::now();
        inner.bridge.consolidate().await?;

        Ok(ConsolidationResult {
            stm_promoted: 0,
            mtm_promoted: 0,
            ltm_stored: 0,
            duration_ms: start.elapsed().as_millis() as u64,
        })
    }

    /// Run forgetting cycle (decay + cleanup)
    pub async fn forget(&self) -> MemoryResult<ForgettingResult> {
        let inner = self.inner.read().await;

        if !inner.initialized {
            return Err(MemoryError::StorageError("Not initialized".to_string()));
        }

        // TODO: Implement forgetting

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

        // TODO: Implement evolution

        Ok(EvolutionResult {
            clusters_created: 0,
            compressed_count: 0,
            patterns_extracted: 0,
            duration_ms: 0,
        })
    }

    /// Clear all memories
    pub async fn clear(&self) -> MemoryResult<()> {
        let mut inner = self.inner.write().await;

        if !inner.initialized {
            return Err(MemoryError::StorageError("Not initialized".to_string()));
        }

        inner.bridge.clear().await
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
    async fn store(
        &self,
        content: String,
        importance: f32,
        memory_type: MemoryType,
    ) -> MemoryResult<MemoryId>;
    async fn recall(&self, query: String, limit: usize) -> MemoryResult<Vec<MemoryEntry>>;
    async fn get(&self, id: &str) -> MemoryResult<MemoryEntry>;
    async fn remove(&self, id: &str) -> MemoryResult<()>;
    async fn stats(&self) -> MemoryResult<MemoryStats>;
}

#[async_trait::async_trait]
impl MemoryAPI for UnifiedMemoryV2 {
    async fn store(
        &self,
        content: String,
        importance: f32,
        memory_type: MemoryType,
    ) -> MemoryResult<MemoryId> {
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
