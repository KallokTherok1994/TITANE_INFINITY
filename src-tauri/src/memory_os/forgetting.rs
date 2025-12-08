// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1 — FORGETTING ENGINE
//   Super Prompt #12: Decay-based importance reduction
//   L'oubli est basé sur: récence, importance, utilité prédite, similarité
// ═══════════════════════════════════════════════════════════════

use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

use super::memory_state::MemoryEntry;
use super::mtm::MidTermMemory;
use super::stm::ShortTermMemory;
use super::vector_store::VectorStore;

// Allow unused for potential future use
#[allow(unused_imports)]
use super::ltm::LongTermMemory;
#[allow(unused_imports)]
use super::memory_state::MemoryTier;

/// Forgetting configuration
#[derive(Debug, Clone)]
pub struct ForgettingConfig {
    /// Enable decay over time
    pub enable_decay: bool,
    /// Decay rate per day (0.0 - 1.0)
    pub daily_decay_rate: f32,
    /// Minimum importance before deletion
    pub deletion_threshold: f32,
    /// Boost factor for accessed entries
    pub access_boost: f32,
    /// Weight for recency in forgetting score
    pub recency_weight: f32,
    /// Weight for importance in forgetting score
    pub importance_weight: f32,
    /// Weight for access count in forgetting score
    pub access_weight: f32,
    /// Enable similarity-based forgetting (remove similar low-importance)
    pub enable_similarity_pruning: bool,
    /// Similarity threshold for pruning
    pub similarity_prune_threshold: f32,
}

impl Default for ForgettingConfig {
    fn default() -> Self {
        Self {
            enable_decay: true,
            daily_decay_rate: 0.05,      // 5% per day
            deletion_threshold: 0.1,
            access_boost: 0.1,
            recency_weight: 0.3,
            importance_weight: 0.5,
            access_weight: 0.2,
            enable_similarity_pruning: true,
            similarity_prune_threshold: 0.9,
        }
    }
}

/// Forgetting operation result
#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
pub struct ForgettingResult {
    /// Entries that had importance decayed
    pub decayed_count: usize,
    /// Entries deleted due to low importance
    pub deleted_count: usize,
    /// Entries pruned due to similarity
    pub pruned_count: usize,
    /// Entries boosted due to recent access
    pub boosted_count: usize,
    /// Total entries processed
    pub processed_count: usize,
    /// Duration in milliseconds
    pub duration_ms: u128,
    /// Timestamp
    pub timestamp: i64,
}

/// Forgetting Engine - Intelligent memory decay and cleanup
///
/// Implements the forgetting curve based on:
/// - Récence (recency): newer = higher retention
/// - Importance: higher importance = slower decay
/// - Utilité prédite (predicted utility): based on access patterns
/// - Similarité: remove redundant similar entries
#[derive(Debug)]
pub struct ForgettingEngine {
    /// Configuration
    config: Arc<RwLock<ForgettingConfig>>,
    /// Last result
    last_result: Arc<RwLock<Option<ForgettingResult>>>,
    /// Running flag
    running: Arc<RwLock<bool>>,
}

impl ForgettingEngine {
    /// Create new forgetting engine
    pub fn new() -> Self {
        Self {
            config: Arc::new(RwLock::new(ForgettingConfig::default())),
            last_result: Arc::new(RwLock::new(None)),
            running: Arc::new(RwLock::new(false)),
        }
    }

    /// Create with custom config
    pub fn with_config(config: ForgettingConfig) -> Self {
        Self {
            config: Arc::new(RwLock::new(config)),
            last_result: Arc::new(RwLock::new(None)),
            running: Arc::new(RwLock::new(false)),
        }
    }

    /// Apply decay to a single entry
    pub fn decay_entry(entry: &mut MemoryEntry, config: &ForgettingConfig) {
        if !config.enable_decay {
            return;
        }

        let now = chrono::Utc::now().timestamp_millis();
        let age_days = (now - entry.timestamp) as f32 / 86_400_000.0;

        // Base decay factor (exponential decay)
        let decay_factor = 1.0 / (1.0 + age_days * config.daily_decay_rate);

        // Access boost (entries accessed recently decay slower)
        let access_boost = if entry.access_count > 0 {
            let last_access_age = (now - entry.last_accessed) as f32 / 86_400_000.0;
            if last_access_age < 1.0 {
                config.access_boost * (1.0 - last_access_age)
            } else {
                0.0
            }
        } else {
            0.0
        };

        // Apply decay with access boost protection
        entry.importance = (entry.importance * decay_factor + access_boost).clamp(0.0, 1.0);
    }

    /// Calculate forgetting score (higher = more likely to forget)
    pub fn forgetting_score(entry: &MemoryEntry, config: &ForgettingConfig) -> f32 {
        let now = chrono::Utc::now().timestamp_millis();

        // Recency score (0 = new, 1 = old)
        let age_days = (now - entry.timestamp) as f32 / 86_400_000.0;
        let recency_score = (age_days / 30.0).min(1.0); // Normalize to 30 days

        // Importance score (inverted: low importance = high forget score)
        let importance_score = 1.0 - entry.importance;

        // Access score (inverted: high access = low forget score)
        let access_score = 1.0 / (1.0 + entry.access_count as f32 * 0.5);

        // Weighted combination
        config.recency_weight * recency_score
            + config.importance_weight * importance_score
            + config.access_weight * access_score
    }

    /// Run forgetting cycle on STM
    pub async fn process_stm(&self, stm: &ShortTermMemory) -> ForgettingResult {
        let start = std::time::Instant::now();
        let config = self.config.read().await.clone();
        let mut result = ForgettingResult::default();

        // STM cleanup is primarily age-based
        let expired = stm.cleanup_expired().await;
        result.deleted_count = expired.len();
        result.processed_count = stm.len().await + expired.len();
        result.duration_ms = start.elapsed().as_millis();
        result.timestamp = chrono::Utc::now().timestamp_millis();

        result
    }

    /// Run forgetting cycle on MTM
    pub async fn process_mtm(
        &self,
        mtm: &MidTermMemory,
        vector_store: &VectorStore,
    ) -> ForgettingResult {
        let start = std::time::Instant::now();
        *self.running.write().await = true;

        let config = self.config.read().await.clone();
        let mut result = ForgettingResult::default();

        let entries = mtm.get_all().await;
        result.processed_count = entries.len();

        // Process each entry
        let mut to_delete: Vec<Uuid> = Vec::new();
        let mut to_update: Vec<MemoryEntry> = Vec::new();

        for mut entry in entries {
            let original_importance = entry.importance;

            // Apply decay
            Self::decay_entry(&mut entry, &config);

            if entry.importance != original_importance {
                result.decayed_count += 1;
            }

            // Check if importance boosted (from recent access)
            if entry.importance > original_importance {
                result.boosted_count += 1;
            }

            // Check deletion threshold
            if entry.importance < config.deletion_threshold {
                to_delete.push(entry.id);
            } else {
                to_update.push(entry);
            }
        }

        // Similarity pruning (remove redundant low-importance entries)
        if config.enable_similarity_pruning {
            let pruned = self.similarity_prune(&to_update, vector_store, &config).await;
            result.pruned_count = pruned.len();
            for id in pruned {
                to_delete.push(id);
            }
        }

        // Apply deletions
        for id in &to_delete {
            mtm.remove(id).await;
            vector_store.remove(id).await;
        }
        result.deleted_count = to_delete.len();

        result.duration_ms = start.elapsed().as_millis();
        result.timestamp = chrono::Utc::now().timestamp_millis();

        *self.last_result.write().await = Some(result.clone());
        *self.running.write().await = false;

        result
    }

    /// Similarity-based pruning
    async fn similarity_prune(
        &self,
        entries: &[MemoryEntry],
        vector_store: &VectorStore,
        config: &ForgettingConfig,
    ) -> Vec<Uuid> {
        let mut to_prune = Vec::new();
        let mut processed: std::collections::HashSet<Uuid> = std::collections::HashSet::new();

        for entry in entries {
            if processed.contains(&entry.id) {
                continue;
            }
            processed.insert(entry.id);

            if let Some(ref embedding) = entry.embedding {
                // Find similar entries
                let similar = vector_store
                    .search_threshold(embedding, config.similarity_prune_threshold, 10)
                    .await;

                // For groups of similar entries, keep the most important
                for result in &similar {
                    if result.id != entry.id && !processed.contains(&result.id) {
                        // If this similar entry is less important, mark for pruning
                        if result.metadata.importance < entry.importance {
                            to_prune.push(result.id);
                            processed.insert(result.id);
                        }
                    }
                }
            }
        }

        to_prune
    }

    /// Get last forgetting result
    pub async fn last_result(&self) -> Option<ForgettingResult> {
        self.last_result.read().await.clone()
    }

    /// Check if running
    pub async fn is_running(&self) -> bool {
        *self.running.read().await
    }

    /// Update configuration
    pub async fn update_config(&self, config: ForgettingConfig) {
        *self.config.write().await = config;
    }

    /// Get current configuration
    pub async fn get_config(&self) -> ForgettingConfig {
        self.config.read().await.clone()
    }

    /// Calculate retention probability for an entry
    pub fn retention_probability(entry: &MemoryEntry, config: &ForgettingConfig) -> f32 {
        1.0 - Self::forgetting_score(entry, config)
    }
}

impl Default for ForgettingEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl Clone for ForgettingEngine {
    fn clone(&self) -> Self {
        Self {
            config: Arc::clone(&self.config),
            last_result: Arc::clone(&self.last_result),
            running: Arc::clone(&self.running),
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   EBBINGHAUS FORGETTING CURVE
// ═══════════════════════════════════════════════════════════════

/// Ebbinghaus forgetting curve implementation
pub struct EbbinghausCurve {
    /// Stability factor (higher = slower forgetting)
    pub stability: f32,
}

impl EbbinghausCurve {
    pub fn new(stability: f32) -> Self {
        Self { stability }
    }

    /// Calculate retention after time_hours
    /// R = e^(-t/S) where S is stability
    pub fn retention(&self, time_hours: f32) -> f32 {
        (-time_hours / self.stability).exp()
    }

    /// Calculate time until retention drops to threshold
    pub fn time_to_threshold(&self, threshold: f32) -> f32 {
        -self.stability * threshold.ln()
    }
}

impl Default for EbbinghausCurve {
    fn default() -> Self {
        Self { stability: 24.0 } // ~24 hour half-life by default
    }
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;
    use crate::memory_os::memory_state::MemoryType;

    #[test]
    fn test_decay_entry() {
        let mut entry = MemoryEntry::new("Test".to_string(), 0.8, MemoryType::Conversation);
        // Simulate 1 day old
        entry.timestamp = chrono::Utc::now().timestamp_millis() - 86_400_000;

        let config = ForgettingConfig::default();
        let original = entry.importance;

        ForgettingEngine::decay_entry(&mut entry, &config);

        // Should have decayed
        assert!(entry.importance < original);
        assert!(entry.importance > 0.0);
    }

    #[test]
    fn test_forgetting_score() {
        let config = ForgettingConfig::default();

        // New, important entry = low forgetting score
        let new_important = MemoryEntry::new("Test".to_string(), 0.9, MemoryType::Decision);
        let score1 = ForgettingEngine::forgetting_score(&new_important, &config);

        // Old, unimportant entry = high forgetting score
        let mut old_unimportant = MemoryEntry::new("Test".to_string(), 0.2, MemoryType::Conversation);
        old_unimportant.timestamp = chrono::Utc::now().timestamp_millis() - 30 * 86_400_000;
        let score2 = ForgettingEngine::forgetting_score(&old_unimportant, &config);

        assert!(score2 > score1);
    }

    #[test]
    fn test_ebbinghaus_curve() {
        let curve = EbbinghausCurve::new(24.0);

        // At t=0, retention should be 1.0
        let r0 = curve.retention(0.0);
        assert!((r0 - 1.0).abs() < 0.001);

        // At t=24h (stability), retention should be ~0.368
        let r24 = curve.retention(24.0);
        assert!((r24 - 0.368).abs() < 0.01);

        // Retention decreases over time
        assert!(curve.retention(48.0) < curve.retention(24.0));
    }

    #[tokio::test]
    async fn test_forgetting_engine_creation() {
        let engine = ForgettingEngine::new();
        assert!(!engine.is_running().await);
        assert!(engine.last_result().await.is_none());
    }

    #[test]
    fn test_retention_probability() {
        let config = ForgettingConfig::default();
        let entry = MemoryEntry::new("Test".to_string(), 0.8, MemoryType::Knowledge);

        let retention = ForgettingEngine::retention_probability(&entry, &config);
        let forgetting = ForgettingEngine::forgetting_score(&entry, &config);

        assert!((retention + forgetting - 1.0).abs() < 0.001);
    }
}
