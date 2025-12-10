// ═══════════════════════════════════════════════════════════════
//   NEURAL MEMORY — CONSOLIDATION ENGINE
//   Auto-promotion STM → MTM → LTM
//   Migré et simplifié depuis memory_os/consolidator.rs
// ═══════════════════════════════════════════════════════════════

use super::{ShortTermMemory, MidTermMemory, LongTermMemory};

/// Consolidation configuration
#[derive(Debug, Clone)]
pub struct ConsolidatorConfig {
    /// STM → MTM transfer age threshold (ms)
    pub stm_transfer_age_ms: i64,
    /// MTM → LTM importance threshold
    pub ltm_importance_threshold: f32,
    /// MTM → LTM age threshold (ms)
    pub ltm_age_threshold_ms: i64,
    /// Minimum importance to keep in MTM
    pub mtm_min_importance: f32,
}

impl Default for ConsolidatorConfig {
    fn default() -> Self {
        Self {
            stm_transfer_age_ms: 300_000,      // 5 minutes
            ltm_importance_threshold: 0.7,
            ltm_age_threshold_ms: 3_600_000,   // 1 hour
            mtm_min_importance: 0.3,
        }
    }
}

/// Consolidation result
#[derive(Debug, Clone, Default)]
pub struct ConsolidationResult {
    pub stm_to_mtm: usize,
    pub mtm_to_ltm: usize,
    pub duration_ms: u128,
}

/// Memory Consolidator
///
/// Orchestrates automatic tier promotion:
/// - STM → MTM (based on age)
/// - MTM → LTM (based on importance + age)
pub struct Consolidator {
    config: ConsolidatorConfig,
}

impl Consolidator {
    pub fn new() -> Self {
        Self {
            config: ConsolidatorConfig::default(),
        }
    }

    pub fn with_config(config: ConsolidatorConfig) -> Self {
        Self { config }
    }

    /// Run full consolidation cycle
    pub async fn consolidate(
        &self,
        stm: &mut ShortTermMemory,
        mtm: &mut MidTermMemory,
        ltm: &mut LongTermMemory,
    ) -> ConsolidationResult {
        let start = std::time::Instant::now();
        let mut result = ConsolidationResult::default();

        let now = chrono::Utc::now().timestamp_millis();

        // Phase 1: STM → MTM (age-based)
        let stm_entries = stm.get_all();
        let mut to_transfer = Vec::new();

        for entry in stm_entries {
            let age_ms = now - entry.created_at;
            if age_ms > self.config.stm_transfer_age_ms {
                to_transfer.push(entry.id.clone());
            }
        }

        for id in &to_transfer {
            if let Some(entry) = stm.remove(id) {
                if mtm.push(entry).is_ok() {
                    result.stm_to_mtm += 1;
                }
            }
        }

        // Phase 2: MTM → LTM (importance + age)
        let mtm_entries = mtm.get_all();
        let mut to_promote = Vec::new();

        for entry in mtm_entries {
            let age_ms = now - entry.created_at;
            let should_promote = entry.importance >= self.config.ltm_importance_threshold
                || age_ms > self.config.ltm_age_threshold_ms;

            if should_promote && entry.importance >= self.config.mtm_min_importance {
                to_promote.push(entry.id.clone());
            }
        }

        for id in &to_promote {
            if let Some(entry) = mtm.remove(id) {
                if ltm.store(entry).await.is_ok() {
                    result.mtm_to_ltm += 1;
                }
            }
        }

        // Save LTM index if modified
        if result.mtm_to_ltm > 0 {
            let _ = ltm.save_index().await;
        }

        result.duration_ms = start.elapsed().as_millis();
        result
    }
}

impl Default for Consolidator {
    fn default() -> Self {
        Self::new()
    }
}
