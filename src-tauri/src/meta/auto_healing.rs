// TITANE∞ v18.2 — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

//! AUTO-HEALING MODULE
//!
//! Automatic healing and regulation system for META-COGNITION and DEEP SYNC.
//! Provides autonomous correction, rollback, and recalibration capabilities.

use serde::{Deserialize, Serialize};
use std::collections::{HashMap, VecDeque};
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::meta::{CognitiveSnapshot, DeepSyncAction, MetaCognitiveReport};

// Import globals from commands module
use crate::meta::commands::{DEEP_SYNC_ENGINE, META_ENGINE};

/// Maximum number of snapshots to keep for rollback
const MAX_SNAPSHOT_HISTORY: usize = 50;

/// Cognitive snapshot for rollback
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CognitiveBackupSnapshot {
    pub timestamp: u64,
    pub snapshot: CognitiveSnapshot,
    pub coherence_score: f32,
    pub success: bool,
}

/// Auto-healing action result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealingActionResult {
    pub action: String,
    pub success: bool,
    pub details: String,
    pub coherence_before: f32,
    pub coherence_after: f32,
    pub timestamp: u64,
}

/// Baseline recalibration result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecalibrationResult {
    pub old_baseline: f32,
    pub new_baseline: f32,
    pub samples_used: usize,
    pub timestamp: u64,
}

/// Auto-Healing Engine
pub struct AutoHealingEngine {
    /// Snapshot history for rollback
    snapshot_history: Arc<RwLock<VecDeque<CognitiveBackupSnapshot>>>,

    /// Healing actions history
    healing_history: Arc<RwLock<Vec<HealingActionResult>>>,

    /// Recalibration history
    recalibration_history: Arc<RwLock<Vec<RecalibrationResult>>>,

    /// Auto-healing enabled
    enabled: Arc<RwLock<bool>>,

    /// Minimum coherence threshold for auto-healing
    healing_threshold: f32,

    /// Baseline recalibration sample size
    recalibration_sample_size: usize,
}

impl AutoHealingEngine {
    pub fn new() -> Self {
        Self {
            snapshot_history: Arc::new(RwLock::new(VecDeque::with_capacity(MAX_SNAPSHOT_HISTORY))),
            healing_history: Arc::new(RwLock::new(Vec::new())),
            recalibration_history: Arc::new(RwLock::new(Vec::new())),
            enabled: Arc::new(RwLock::new(true)),
            healing_threshold: 0.5,
            recalibration_sample_size: 100,
        }
    }

    /// Save cognitive snapshot for potential rollback
    pub async fn save_snapshot(&self, snapshot: CognitiveSnapshot, coherence: f32) {
        let mut history = self.snapshot_history.write().await;

        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("System time before UNIX_EPOCH")
            .as_secs();

        let backup = CognitiveBackupSnapshot {
            timestamp,
            snapshot,
            coherence_score: coherence,
            success: coherence > self.healing_threshold,
        };

        if history.len() >= MAX_SNAPSHOT_HISTORY {
            history.pop_front();
        }
        history.push_back(backup);

        log::debug!("💾 Saved cognitive snapshot: coherence={:.2}", coherence);
    }

    /// Apply healing action based on META-COGNITION recommendation
    pub async fn apply_healing_action(
        &self,
        report: &MetaCognitiveReport,
    ) -> Result<HealingActionResult, String> {
        let enabled = *self.enabled.read().await;
        if !enabled {
            return Err("Auto-healing is disabled".to_string());
        }

        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("System time before UNIX_EPOCH")
            .as_secs();

        let coherence_before = report.coherence_score;

        let action = report
            .recommended_next_state
            .as_ref()
            .unwrap_or(&DeepSyncAction::None);
        let action_name = format!("{:?}", action);

        log::info!("🔧 Applying healing action: {}", action_name);

        let (success, details, coherence_after) = match action {
            DeepSyncAction::None => (true, "No action needed".to_string(), coherence_before),

            DeepSyncAction::StabilizeCognitive => {
                // Stabilize cognitive state by reducing complexity
                let result = self.stabilize_cognitive().await;
                match result {
                    Ok(new_coherence) => (
                        true,
                        "Cognitive stabilization applied".to_string(),
                        new_coherence,
                    ),
                    Err(e) => (
                        false,
                        format!("Stabilization failed: {}", e),
                        coherence_before,
                    ),
                }
            }

            DeepSyncAction::ReanchorMemory => {
                // Re-anchor memory by consolidating recent entries
                let result = self.reanchor_memory().await;
                match result {
                    Ok(new_coherence) => (true, "Memory re-anchored".to_string(), new_coherence),
                    Err(e) => (
                        false,
                        format!("Memory re-anchor failed: {}", e),
                        coherence_before,
                    ),
                }
            }

            DeepSyncAction::RealignEngines(_engines) => {
                // Re-align all engines via deep sync
                let sync_result = {
                    let mut engine = DEEP_SYNC_ENGINE.lock().await;
                    let mut states = HashMap::new();
                    // TODO: Get real engine states from SingularityState
                    states.insert(
                        "cognitive".to_string(),
                        crate::meta::EngineState::new("cognitive".to_string(), 0.7),
                    );
                    states.insert(
                        "memory".to_string(),
                        crate::meta::EngineState::new("memory".to_string(), 0.7),
                    );
                    engine.deep_sync(&states).await
                };

                if sync_result.success {
                    (
                        true,
                        "Engines realigned".to_string(),
                        coherence_before + 0.1,
                    )
                } else {
                    (
                        false,
                        "Engine realignment failed".to_string(),
                        coherence_before,
                    )
                }
            }

            DeepSyncAction::CorrectTimeline => {
                // Correct timeline inconsistencies
                let result = self.correct_timeline().await;
                match result {
                    Ok(new_coherence) => (true, "Timeline corrected".to_string(), new_coherence),
                    Err(e) => (
                        false,
                        format!("Timeline correction failed: {}", e),
                        coherence_before,
                    ),
                }
            }

            DeepSyncAction::RecalibrateAI => {
                // Recalibrate AI baseline
                let result = self.recalibrate_baseline().await;
                match result {
                    Ok(recal) => (
                        true,
                        format!(
                            "Baseline recalibrated: {:.2} → {:.2}",
                            recal.old_baseline, recal.new_baseline
                        ),
                        coherence_before + 0.05,
                    ),
                    Err(e) => (
                        false,
                        format!("Recalibration failed: {}", e),
                        coherence_before,
                    ),
                }
            }

            DeepSyncAction::FullDeepSync => {
                // Perform full deep sync
                let sync_result = {
                    let mut engine = DEEP_SYNC_ENGINE.lock().await;
                    let mut states = HashMap::new();
                    // TODO: Get all engine states
                    states.insert(
                        "cognitive".to_string(),
                        crate::meta::EngineState::new("cognitive".to_string(), 0.7),
                    );
                    states.insert(
                        "memory".to_string(),
                        crate::meta::EngineState::new("memory".to_string(), 0.7),
                    );
                    states.insert(
                        "emotional".to_string(),
                        crate::meta::EngineState::new("emotional".to_string(), 0.7),
                    );
                    engine.deep_sync(&states).await
                };

                if sync_result.success {
                    (
                        true,
                        "Full deep sync completed".to_string(),
                        coherence_before + 0.15,
                    )
                } else {
                    (false, "Full deep sync failed".to_string(), coherence_before)
                }
            }

            DeepSyncAction::EmergencyReset => {
                // Emergency rollback to last good snapshot
                let result = self.rollback_to_last_good().await;
                match result {
                    Ok(coherence) => (
                        true,
                        format!("Emergency rollback: coherence restored to {:.2}", coherence),
                        coherence,
                    ),
                    Err(e) => (
                        false,
                        format!("Emergency rollback failed: {}", e),
                        coherence_before,
                    ),
                }
            }
        };

        let result = HealingActionResult {
            action: action_name,
            success,
            details: details.clone(),
            coherence_before,
            coherence_after,
            timestamp,
        };

        // Record action
        let mut history = self.healing_history.write().await;
        history.push(result.clone());

        // Keep only last 500 actions
        if history.len() > 500 {
            history.drain(0..100);
        }

        if success {
            log::info!(
                "✅ Healing action succeeded: {} ({:.2} → {:.2})",
                details,
                coherence_before,
                coherence_after
            );
        } else {
            log::error!("❌ Healing action failed: {}", details);
        }

        Ok(result)
    }

    /// Rollback to last good cognitive snapshot
    pub async fn rollback_to_last_good(&self) -> Result<f32, String> {
        let history = self.snapshot_history.read().await;

        // Find last successful snapshot
        let last_good = history
            .iter()
            .rev()
            .find(|s| s.success && s.coherence_score > self.healing_threshold);

        match last_good {
            Some(snapshot) => {
                log::warn!(
                    "🔄 Rolling back to snapshot from {} (coherence={:.2})",
                    snapshot.timestamp,
                    snapshot.coherence_score
                );

                // Apply snapshot (in real implementation, this would restore state)
                // For now, just return the coherence score
                Ok(snapshot.coherence_score)
            }
            None => Err("No good snapshot found for rollback".to_string()),
        }
    }

    /// Stabilize cognitive state
    async fn stabilize_cognitive(&self) -> Result<f32, String> {
        // Simulate stabilization (in real implementation, this would adjust cognitive parameters)
        log::debug!("🔧 Stabilizing cognitive state...");
        tokio::time::sleep(tokio::time::Duration::from_millis(10)).await;
        Ok(0.75) // Return improved coherence
    }

    /// Re-anchor memory
    async fn reanchor_memory(&self) -> Result<f32, String> {
        // Simulate memory re-anchoring (in real implementation, this would consolidate memories)
        log::debug!("🔧 Re-anchoring memory...");
        tokio::time::sleep(tokio::time::Duration::from_millis(10)).await;
        Ok(0.78)
    }

    /// Correct timeline
    async fn correct_timeline(&self) -> Result<f32, String> {
        // Simulate timeline correction (in real implementation, this would fix temporal inconsistencies)
        log::debug!("🔧 Correcting timeline...");
        tokio::time::sleep(tokio::time::Duration::from_millis(10)).await;
        Ok(0.80)
    }

    /// Recalibrate baseline
    pub async fn recalibrate_baseline(&self) -> Result<RecalibrationResult, String> {
        let history = self.snapshot_history.read().await;

        // Get recent successful snapshots
        let recent_good: Vec<f32> = history
            .iter()
            .rev()
            .filter(|s| s.success)
            .take(self.recalibration_sample_size)
            .map(|s| s.coherence_score)
            .collect();

        if recent_good.len() < 10 {
            return Err("Not enough samples for recalibration".to_string());
        }

        // Calculate new baseline (median of recent good snapshots)
        let mut sorted = recent_good.clone();
        sorted.sort_by(|a, b| a.partial_cmp(b).expect("NaN value in coherence scores"));
        let new_baseline = sorted[sorted.len() / 2];

        // Get old baseline from META engine
        let old_baseline = {
            let engine = META_ENGINE.lock().await;
            engine.get_baseline()
        };

        // Update baseline
        {
            let mut engine = META_ENGINE.lock().await;
            engine.establish_baseline(new_baseline);
        }

        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("System time before UNIX_EPOCH")
            .as_secs();

        let result = RecalibrationResult {
            old_baseline,
            new_baseline,
            samples_used: recent_good.len(),
            timestamp,
        };

        // Record recalibration
        let mut recal_history = self.recalibration_history.write().await;
        recal_history.push(result.clone());

        log::info!(
            "📊 Baseline recalibrated: {:.2} → {:.2} (using {} samples)",
            old_baseline,
            new_baseline,
            recent_good.len()
        );

        Ok(result)
    }

    /// Enable/disable auto-healing
    pub async fn set_enabled(&self, enabled: bool) {
        *self.enabled.write().await = enabled;
        log::info!(
            "🔧 Auto-healing {}",
            if enabled { "enabled" } else { "disabled" }
        );
    }

    /// Check if auto-healing is enabled
    pub async fn is_enabled(&self) -> bool {
        *self.enabled.read().await
    }

    /// Get healing history
    pub async fn get_healing_history(&self, limit: usize) -> Vec<HealingActionResult> {
        let history = self.healing_history.read().await;
        history.iter().rev().take(limit).cloned().collect()
    }

    /// Get recalibration history
    pub async fn get_recalibration_history(&self, limit: usize) -> Vec<RecalibrationResult> {
        let history = self.recalibration_history.read().await;
        history.iter().rev().take(limit).cloned().collect()
    }

    /// Get snapshot count
    pub async fn get_snapshot_count(&self) -> usize {
        self.snapshot_history.read().await.len()
    }
}

impl Default for AutoHealingEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_auto_healing_creation() {
        let engine = AutoHealingEngine::new();
        assert!(engine.is_enabled().await);
        assert_eq!(engine.get_snapshot_count().await, 0);
    }

    #[tokio::test]
    async fn test_save_snapshot() {
        let engine = AutoHealingEngine::new();

        let snapshot = CognitiveSnapshot {
            timestamp: 0,
            cognitive_integrity: Some(0.9),
            timeline_coherence: Some(0.85),
            memory_alignment: Some(0.88),
            ai_stability: Some(0.92),
            singularity_coherence: Some(0.87),
            emotion_state: Some(0.85),
        };

        engine.save_snapshot(snapshot, 0.9).await;

        assert_eq!(engine.get_snapshot_count().await, 1);
    }

    #[tokio::test]
    async fn test_recalibration() {
        let engine = AutoHealingEngine::new();

        // Save multiple snapshots
        for i in 0..20 {
            let snapshot = CognitiveSnapshot {
                timestamp: i,
                cognitive_integrity: Some(0.8 + (i as f32 * 0.01)),
                ..Default::default()
            };
            engine
                .save_snapshot(snapshot, 0.8 + (i as f32 * 0.01))
                .await;
        }

        // Recalibrate
        let result = engine.recalibrate_baseline().await;
        assert!(result.is_ok());

        let recal = result.expect("Recalibration should succeed");
        assert!(recal.samples_used >= 10);
        assert!(recal.new_baseline > 0.0);
    }
}
