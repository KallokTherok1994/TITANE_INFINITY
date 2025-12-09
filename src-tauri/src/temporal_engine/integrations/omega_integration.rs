//! ═══════════════════════════════════════════════════════════════════════════════
//! TEMPORAL ENGINE ↔ OMEGA PIPELINE INTEGRATION
//! ═══════════════════════════════════════════════════════════════════════════════

use crate::temporal_engine::TemporalContext;
use serde::{Deserialize, Serialize};

/// Bridge entre Temporal Engine et OMEGA Pipeline
pub struct TemporalOmegaBridge;

impl TemporalOmegaBridge {
    /// Obtient les ajustements OMEGA selon le contexte temporel
    pub fn get_omega_adjustments(context: &TemporalContext) -> OmegaTemporalAdjustments {
        let hour = context.now.hour;
        let is_weekend = context.now.is_weekend;
        let season = &context.now.season;

        OmegaTemporalAdjustments {
            depth_multiplier: Self::calculate_depth_multiplier(hour, is_weekend),
            reflection_intensity: Self::calculate_reflection_intensity(hour, season),
            coherence_threshold: Self::calculate_coherence_threshold(hour),
            speed_vs_quality_ratio: Self::calculate_speed_quality_ratio(hour),
            context_window_size: Self::calculate_context_window(hour),
            engine_weights: Self::calculate_engine_weights(hour, is_weekend),
            parallel_execution: Self::should_parallelize(hour),
            cache_aggressiveness: Self::calculate_cache_aggressiveness(hour),
        }
    }

    /// Profondeur de réflexion
    fn calculate_depth_multiplier(hour: u8, is_weekend: bool) -> f32 {
        let base = match hour {
            6..=9 => 0.7,    // Morning: medium
            10..=11 => 1.0,  // Peak: maximum
            12..=13 => 0.5,  // Midday: reduced
            14..=16 => 0.8,  // Afternoon: good
            17..=21 => 0.6,  // Evening: reduced
            _ => 0.3,        // Night: minimal
        };

        if is_weekend {
            base * 0.8
        } else {
            base
        }
    }

    /// Intensité réflexion
    fn calculate_reflection_intensity(hour: u8, season: &crate::temporal_engine::time_model::Season) -> f32 {
        let base = match hour {
            10..=11 => 0.9,
            22..=23 | 0..=5 => 0.4,
            _ => 0.7,
        };

        // Seasonal adjustment
        use crate::temporal_engine::time_model::Season;
        let seasonal_factor = match season {
            Season::Spring => 1.1,
            Season::Summer => 1.2,
            Season::Autumn => 1.0,
            Season::Winter => 0.8,
        };

        base * seasonal_factor
    }

    /// Seuil de cohérence
    fn calculate_coherence_threshold(hour: u8) -> f32 {
        match hour {
            10..=11 => 0.95,  // Peak: high standards
            22..=23 | 0..=5 => 0.6,    // Night: lower
            _ => 0.8,
        }
    }

    /// Ratio vitesse/qualité
    fn calculate_speed_quality_ratio(hour: u8) -> f32 {
        match hour {
            10..=11 => 0.9,   // Peak: favor quality
            12..=13 => 0.3,   // Midday: favor speed
            14..=16 => 0.7,   // Afternoon: balanced
            _ => 0.5,         // Default: balanced
        }
    }

    /// Taille fenêtre de contexte
    fn calculate_context_window(hour: u8) -> usize {
        match hour {
            10..=11 => 16384,  // Peak: max context
            22..=23 | 0..=5 => 2048,    // Night: minimal
            _ => 8192,         // Default: 8K
        }
    }

    /// Poids des 10 moteurs OMEGA
    fn calculate_engine_weights(hour: u8, is_weekend: bool) -> Vec<f32> {
        let base_weights = match hour {
            6..=9 => vec![1.0, 0.7, 0.8, 0.9, 0.6, 0.8, 0.7, 0.8, 0.6, 0.7],   // Morning
            10..=11 => vec![1.0, 1.0, 1.0, 1.0, 0.9, 1.0, 0.9, 1.0, 0.9, 0.9], // Peak
            12..=13 => vec![1.0, 0.5, 0.6, 0.7, 0.4, 0.6, 0.5, 0.6, 0.5, 0.6], // Midday
            14..=16 => vec![1.0, 0.8, 0.9, 0.8, 0.6, 0.8, 0.7, 0.8, 0.7, 0.8], // Afternoon
            17..=21 => vec![1.0, 0.6, 0.7, 0.8, 0.5, 0.7, 0.6, 0.7, 0.6, 0.7], // Evening
            _ => vec![0.5, 0.3, 0.4, 0.5, 0.3, 0.6, 0.4, 0.5, 0.7, 0.4],       // Night
        };

        if is_weekend {
            base_weights.iter().map(|w| w * 0.85).collect()
        } else {
            base_weights
        }
    }

    /// Parallélisation recommandée
    fn should_parallelize(hour: u8) -> bool {
        matches!(hour, 9..=17)
    }

    /// Agressivité du cache
    fn calculate_cache_aggressiveness(hour: u8) -> f32 {
        match hour {
            10..=11 => 0.3,   // Peak: less cache, more fresh
            12..=13 => 0.8,   // Midday: more cache
            22..=23 | 0..=5 => 0.9,    // Night: aggressive cache
            _ => 0.6,
        }
    }

    /// Suggère le routing optimal
    pub fn suggest_routing_strategy(context: &TemporalContext, task_complexity: f32) -> RoutingStrategy {
        let hour = context.now.hour;
        let depth = Self::calculate_depth_multiplier(hour, context.now.is_weekend);

        if task_complexity > 0.8 && depth > 0.7 {
            RoutingStrategy::DeepAnalysis
        } else if task_complexity < 0.3 || hour == 12 || hour == 13 {
            RoutingStrategy::FastTrack
        } else {
            RoutingStrategy::Balanced
        }
    }

    /// Suggère quels moteurs activer
    pub fn suggest_active_engines(context: &TemporalContext) -> Vec<usize> {
        let hour = context.now.hour;

        match hour {
            10..=11 => vec![0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // All engines
            22..=23 | 0..=5 => vec![0, 5, 8],                        // Minimal: orchestrator, memory, health
            _ => vec![0, 1, 2, 3, 5, 7],                    // Core engines
        }
    }
}

/// Ajustements temporels pour OMEGA
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct OmegaTemporalAdjustments {
    pub depth_multiplier: f32,
    pub reflection_intensity: f32,
    pub coherence_threshold: f32,
    pub speed_vs_quality_ratio: f32,
    pub context_window_size: usize,
    pub engine_weights: Vec<f32>,
    pub parallel_execution: bool,
    pub cache_aggressiveness: f32,
}

/// Stratégie de routing
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum RoutingStrategy {
    FastTrack,
    Balanced,
    DeepAnalysis,
}
