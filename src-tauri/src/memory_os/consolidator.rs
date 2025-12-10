// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1 — MEMORY CONSOLIDATOR
//   Super Prompt #12: Auto-consolidation STM → MTM → LTM
//   Target: <5ms consolidation cycle
// ═══════════════════════════════════════════════════════════════

use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

use super::ltm::LongTermMemory;
use super::memory_state::MemoryEntry;

// Logging macro
macro_rules! log_warn {
    ($($arg:tt)*) => {
        log::warn!($($arg)*);
    };
}

#[allow(unused_imports)]
use super::memory_state::MemoryTier;
use super::mtm::MidTermMemory;
use super::stm::ShortTermMemory;
use super::vector_store::VectorStore;

/// Consolidation configuration
#[derive(Debug, Clone)]
pub struct ConsolidatorConfig {
    /// STM → MTM transfer threshold (age in ms)
    pub stm_transfer_age_ms: i64,
    /// MTM → LTM importance threshold
    pub ltm_importance_threshold: f32,
    /// MTM → LTM age threshold (ms)
    pub ltm_age_threshold_ms: i64,
    /// Enable duplicate merging
    pub merge_duplicates: bool,
    /// Similarity threshold for duplicate detection
    pub duplicate_similarity_threshold: f32,
    /// Enable compression for LTM entries
    pub compress_ltm: bool,
    /// Minimum importance to keep in MTM
    pub mtm_min_importance: f32,
}

impl Default for ConsolidatorConfig {
    fn default() -> Self {
        Self {
            stm_transfer_age_ms: 300_000, // 5 minutes
            ltm_importance_threshold: 0.7,
            ltm_age_threshold_ms: 3_600_000, // 1 hour
            merge_duplicates: true,
            duplicate_similarity_threshold: 0.95,
            compress_ltm: true,
            mtm_min_importance: 0.3,
        }
    }
}

/// Consolidation result statistics
#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
pub struct ConsolidationResult {
    pub stm_to_mtm: usize,
    pub mtm_to_ltm: usize,
    pub duplicates_merged: usize,
    pub entries_compressed: usize,
    pub entries_forgotten: usize,
    pub duration_ms: u128,
    pub timestamp: i64,
}

/// Memory Consolidator - Automatic tier promotion and optimization
///
/// Responsibilities:
/// - Transfer entries from STM → MTM based on age
/// - Promote important entries from MTM → LTM
/// - Merge duplicate entries (using embeddings)
/// - Compress old LTM entries
/// - Coordinate with forgetting engine
#[derive(Debug)]
pub struct Consolidator {
    /// Configuration
    config: Arc<RwLock<ConsolidatorConfig>>,
    /// Last consolidation result
    last_result: Arc<RwLock<Option<ConsolidationResult>>>,
    /// Running flag
    running: Arc<RwLock<bool>>,
}

impl Consolidator {
    /// Create new consolidator with default config
    pub fn new() -> Self {
        Self {
            config: Arc::new(RwLock::new(ConsolidatorConfig::default())),
            last_result: Arc::new(RwLock::new(None)),
            running: Arc::new(RwLock::new(false)),
        }
    }

    /// Create consolidator with custom config
    pub fn with_config(config: ConsolidatorConfig) -> Self {
        Self {
            config: Arc::new(RwLock::new(config)),
            last_result: Arc::new(RwLock::new(None)),
            running: Arc::new(RwLock::new(false)),
        }
    }

    /// Run full consolidation cycle
    pub async fn consolidate(
        &self,
        stm: &ShortTermMemory,
        mtm: &MidTermMemory,
        ltm: &LongTermMemory,
        vector_store: &VectorStore,
    ) -> ConsolidationResult {
        let start = std::time::Instant::now();
        *self.running.write().await = true;

        let config = self.config.read().await.clone();
        let mut result = ConsolidationResult::default();

        // Phase 1: STM → MTM transfer
        let stm_transfers = self.transfer_stm_to_mtm(stm, mtm, &config).await;
        result.stm_to_mtm = stm_transfers.len();

        // Update vector store for transferred entries
        for entry in &stm_transfers {
            if entry.embedding.is_some() {
                let _ = vector_store.insert(entry).await;
            }
        }

        // Phase 2: MTM consolidation (internal sorting)
        let mtm_overflow = mtm.consolidate().await;

        // Phase 3: MTM → LTM promotion
        let ltm_candidates = mtm
            .get_ltm_candidates(config.ltm_importance_threshold, config.ltm_age_threshold_ms)
            .await;

        for entry in ltm_candidates {
            if let Ok(()) = ltm.store(entry).await {
                result.mtm_to_ltm += 1;
            }
        }

        // Phase 4: Handle MTM overflow → LTM
        for entry in mtm_overflow {
            if entry.importance >= config.mtm_min_importance {
                if let Ok(()) = ltm.store(entry).await {
                    result.mtm_to_ltm += 1;
                }
            } else {
                result.entries_forgotten += 1;
            }
        }

        // Phase 5: Duplicate merging (if enabled)
        if config.merge_duplicates {
            result.duplicates_merged = self
                .merge_duplicates_in_mtm(mtm, vector_store, &config)
                .await;
        }

        result.duration_ms = start.elapsed().as_millis();
        result.timestamp = chrono::Utc::now().timestamp_millis();

        // Store result
        *self.last_result.write().await = Some(result.clone());
        *self.running.write().await = false;

        // Log if exceeded target
        if result.duration_ms > super::targets::MEMORY_STORE_MS {
            log_warn!(
                "Consolidation exceeded target: {}ms (target: {}ms)",
                result.duration_ms,
                super::targets::MEMORY_STORE_MS
            );
        }

        result
    }

    /// Transfer aged entries from STM to MTM
    async fn transfer_stm_to_mtm(
        &self,
        stm: &ShortTermMemory,
        mtm: &MidTermMemory,
        config: &ConsolidatorConfig,
    ) -> Vec<MemoryEntry> {
        let now = chrono::Utc::now().timestamp_millis();
        let mut transferred = Vec::new();

        // Get entries older than threshold
        let all_entries = stm.get_all().await;
        let mut to_transfer = Vec::new();

        for entry in all_entries {
            if (now - entry.timestamp) >= config.stm_transfer_age_ms {
                to_transfer.push(entry.id);
            }
        }

        // Remove from STM and add to MTM
        for id in to_transfer {
            if let Some(entry) = stm.remove(&id).await {
                transferred.push(entry.clone());
                mtm.add(entry).await;
            }
        }

        transferred
    }

    /// Merge duplicate entries in MTM using embeddings
    async fn merge_duplicates_in_mtm(
        &self,
        mtm: &MidTermMemory,
        vector_store: &VectorStore,
        config: &ConsolidatorConfig,
    ) -> usize {
        let entries = mtm.get_all().await;
        let mut merged_count = 0;
        let mut to_remove: Vec<Uuid> = Vec::new();

        // Find duplicates using embeddings
        for (i, entry) in entries.iter().enumerate() {
            if to_remove.contains(&entry.id) {
                continue;
            }

            if let Some(ref embedding) = entry.embedding {
                // Search for similar entries
                let similar = vector_store
                    .search_threshold(embedding, config.duplicate_similarity_threshold, 10)
                    .await;

                // Mark duplicates for removal (keep the first/oldest)
                for result in similar.iter().skip(1) {
                    if result.id != entry.id && !to_remove.contains(&result.id) {
                        // Check if this is actually a different entry in the list
                        if entries.iter().skip(i + 1).any(|e| e.id == result.id) {
                            to_remove.push(result.id);
                            merged_count += 1;
                        }
                    }
                }
            }
        }

        // Remove duplicates
        for id in to_remove {
            mtm.remove(&id).await;
            vector_store.remove(&id).await;
        }

        merged_count
    }

    /// Get last consolidation result
    pub async fn last_result(&self) -> Option<ConsolidationResult> {
        self.last_result.read().await.clone()
    }

    /// Check if consolidation is running
    pub async fn is_running(&self) -> bool {
        *self.running.read().await
    }

    /// Update configuration
    pub async fn update_config(&self, config: ConsolidatorConfig) {
        *self.config.write().await = config;
    }

    /// Get current configuration
    pub async fn get_config(&self) -> ConsolidatorConfig {
        self.config.read().await.clone()
    }
}

impl Default for Consolidator {
    fn default() -> Self {
        Self::new()
    }
}

impl Clone for Consolidator {
    fn clone(&self) -> Self {
        Self {
            config: Arc::clone(&self.config),
            last_result: Arc::clone(&self.last_result),
            running: Arc::clone(&self.running),
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   CONSOLIDATION SCHEDULER
// ═══════════════════════════════════════════════════════════════

/// Consolidation schedule configuration
#[derive(Debug, Clone)]
pub struct ConsolidationSchedule {
    /// Interval between consolidations (ms)
    pub interval_ms: u64,
    /// Run consolidation on idle
    pub run_on_idle: bool,
    /// Maximum entries before forced consolidation
    pub max_pending_entries: usize,
}

impl Default for ConsolidationSchedule {
    fn default() -> Self {
        Self {
            interval_ms: 60_000, // 1 minute
            run_on_idle: true,
            max_pending_entries: 50,
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_consolidator_creation() {
        let consolidator = Consolidator::new();
        assert!(!consolidator.is_running().await);
        assert!(consolidator.last_result().await.is_none());
    }

    #[tokio::test]
    async fn test_consolidator_config() {
        let config = ConsolidatorConfig {
            stm_transfer_age_ms: 60_000,
            ltm_importance_threshold: 0.8,
            ..Default::default()
        };

        let consolidator = Consolidator::with_config(config.clone());
        let retrieved = consolidator.get_config().await;

        assert_eq!(retrieved.stm_transfer_age_ms, 60_000);
        assert_eq!(retrieved.ltm_importance_threshold, 0.8);
    }

    #[tokio::test]
    async fn test_consolidation_result_default() {
        let result = ConsolidationResult::default();
        assert_eq!(result.stm_to_mtm, 0);
        assert_eq!(result.mtm_to_ltm, 0);
        assert_eq!(result.duplicates_merged, 0);
    }
}
