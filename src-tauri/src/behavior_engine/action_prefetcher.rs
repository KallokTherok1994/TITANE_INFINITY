// ═══════════════════════════════════════════════════════════════
// Phase 4 Sprint 3: Action Prefetch System
// ═══════════════════════════════════════════════════════════════
// Purpose: Predict next user actions and preload assets
// Expected: 20-30% latency improvement on action transitions
// ═══════════════════════════════════════════════════════════════

use std::collections::HashMap;
use std::sync::Arc;
use parking_lot::RwLock;

/// Action prediction engine for proactive asset preloading
#[derive(Clone)]
pub struct ActionPrefetcher {
    transitions: Arc<RwLock<TransitionModel>>,
    stats: Arc<RwLock<PrefetchStats>>,
}

struct TransitionModel {
    // action_sequence -> next_action probability map
    patterns: HashMap<String, ActionProbabilities>,
}

struct ActionProbabilities {
    // next_action -> count
    next_actions: HashMap<String, u32>,
    total: u32,
}

#[derive(Debug, Clone, Default)]
struct PrefetchStats {
    predictions_made: u64,
    predictions_correct: u64,
    predictions_wrong: u64,
    assets_preloaded: u64,
    preload_hits: u64,
}

impl ActionPrefetcher {
    pub fn new() -> Self {
        ActionPrefetcher {
            transitions: Arc::new(RwLock::new(TransitionModel {
                patterns: HashMap::new(),
            })),
            stats: Arc::new(RwLock::new(PrefetchStats::default())),
        }
    }

    /// Record user action for pattern learning
    pub fn record_action(&self, action_sequence: String, next_action: String) {
        let mut model = self.transitions.write();

        let probabilities = model
            .patterns
            .entry(action_sequence)
            .or_insert_with(|| ActionProbabilities {
                next_actions: HashMap::new(),
                total: 0,
            });

        *probabilities.next_actions.entry(next_action).or_insert(0) += 1;
        probabilities.total += 1;
    }

    /// Predict next action(s) based on sequence
    /// Returns Vec<(action, probability)> sorted by probability
    pub fn predict_next_actions(&self, action_sequence: &str, top_k: usize) -> Vec<(String, f64)> {
        let model = self.transitions.read();

        if let Some(probabilities) = model.patterns.get(action_sequence) {
            let mut predictions: Vec<(String, f64)> = probabilities
                .next_actions
                .iter()
                .map(|(action, count)| {
                    (
                        action.clone(),
                        (*count as f64) / (probabilities.total as f64),
                    )
                })
                .collect();

            predictions.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
            predictions.truncate(top_k);

            let mut stats = self.stats.write();
            stats.predictions_made += 1;

            return predictions;
        }

        let mut stats = self.stats.write();
        stats.predictions_made += 1;

        Vec::new() // No prediction if sequence not in model
    }

    /// Register prefetch hit (predicted action was correct)
    pub fn register_prefetch_hit(&self) {
        let mut stats = self.stats.write();
        stats.preload_hits += 1;
        stats.predictions_correct += 1;
    }

    /// Register prefetch miss (predicted action was wrong)
    pub fn register_prefetch_miss(&self) {
        let mut stats = self.stats.write();
        stats.predictions_wrong += 1;
    }

    /// Record asset preload attempt
    pub fn record_preload(&self, _assets: usize) {
        let mut stats = self.stats.write();
        stats.assets_preloaded += 1;
    }

    /// Get prediction accuracy
    pub fn stats(&self) -> PrefetchStatsSnapshot {
        let stats = self.stats.read();
        let accuracy = if stats.predictions_made > 0 {
            (stats.predictions_correct as f64) / (stats.predictions_made as f64)
        } else {
            0.0
        };

        let hit_rate = if stats.assets_preloaded > 0 {
            (stats.preload_hits as f64) / (stats.assets_preloaded as f64)
        } else {
            0.0
        };

        PrefetchStatsSnapshot {
            predictions_made: stats.predictions_made,
            accuracy,
            hit_rate,
            assets_preloaded: stats.assets_preloaded,
        }
    }

    /// Reset statistics
    pub fn reset_stats(&self) {
        let mut stats = self.stats.write();
        *stats = PrefetchStats::default();
    }

    /// Clear pattern model
    pub fn clear_model(&self) {
        let mut model = self.transitions.write();
        model.patterns.clear();
    }
}

/// Statistics snapshot
#[derive(Debug, Clone)]
pub struct PrefetchStatsSnapshot {
    pub predictions_made: u64,
    pub accuracy: f64,
    pub hit_rate: f64,
    pub assets_preloaded: u64,
}

impl Default for ActionPrefetcher {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_action_recording_and_prediction() {
        let prefetcher = ActionPrefetcher::new();

        // Record some patterns
        prefetcher.record_action("nav:home".to_string(), "nav:settings".to_string());
        prefetcher.record_action("nav:home".to_string(), "nav:settings".to_string());
        prefetcher.record_action("nav:home".to_string(), "nav:profile".to_string());

        // Predict
        let predictions = prefetcher.predict_next_actions("nav:home", 2);
        assert!(!predictions.is_empty());

        // nav:settings should be most likely (2/3 probability)
        assert_eq!(predictions[0].0, "nav:settings");
        assert!((predictions[0].1 - 0.667).abs() < 0.01);
    }

    #[test]
    fn test_prediction_accuracy() {
        let prefetcher = ActionPrefetcher::new();

        // Build pattern
        for _ in 0..10 {
            prefetcher.record_action("search".to_string(), "results".to_string());
        }

        // Make 3 predictions
        let _ = prefetcher.predict_next_actions("search", 1);
        let _ = prefetcher.predict_next_actions("search", 1);
        let _ = prefetcher.predict_next_actions("search", 1);

        // Record outcomes: 2 hits, 1 miss
        prefetcher.register_prefetch_hit();
        prefetcher.register_prefetch_hit();
        prefetcher.register_prefetch_miss();

        let stats = prefetcher.stats();
        assert_eq!(stats.predictions_made, 3);
        // Accuracy: 2 correct out of 3 predictions = 0.667
        assert!((stats.accuracy - 0.667).abs() < 0.01);
    }

    #[test]
    fn test_no_prediction_for_unknown_sequence() {
        let prefetcher = ActionPrefetcher::new();

        let predictions = prefetcher.predict_next_actions("unknown_action", 5);
        assert!(predictions.is_empty());
    }

    #[test]
    fn test_top_k_filtering() {
        let prefetcher = ActionPrefetcher::new();

        // Record varied outcomes
        for i in 0..20 {
            let action = format!("action_{}", i % 10);
            prefetcher.record_action("start".to_string(), action);
        }

        // Request top 3
        let predictions = prefetcher.predict_next_actions("start", 3);
        assert!(predictions.len() <= 3);
    }

    #[test]
    fn test_preload_hit_rate() {
        let prefetcher = ActionPrefetcher::new();

        // Record predictions
        for _ in 0..10 {
            prefetcher.record_preload(3); // 3 assets
        }

        // Record hits and misses
        for _ in 0..7 {
            prefetcher.register_prefetch_hit();
        }
        for _ in 0..3 {
            prefetcher.register_prefetch_miss();
        }

        let stats = prefetcher.stats();
        assert!((stats.hit_rate - 0.7).abs() < 0.01);
    }
}
