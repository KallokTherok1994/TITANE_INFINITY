// ═══════════════════════════════════════════════════════════════
//   OMEGA INTEGRATION — Cycle Engine ↔ OMEGA Pipeline
//   SUPER PROMPT #16
// ═══════════════════════════════════════════════════════════════

use crate::cycle_engine::{
    cognitive_rhythm::CognitiveRhythmParams, load_regulator::LoadRegulationParams, CycleEngine,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

/// OMEGA Integration Bridge
pub struct OmegaCycleBridge {
    cycle_engine: Arc<CycleEngine>,
}

impl OmegaCycleBridge {
    pub fn new(cycle_engine: Arc<CycleEngine>) -> Self {
        Self { cycle_engine }
    }

    /// Get OMEGA configuration adjustments based on current cycle
    pub async fn get_omega_adjustments(&self) -> OmegaAdjustments {
        let rhythm = self.cycle_engine.current_rhythm().await;
        let load_params = self.cycle_engine.current_load_params().await;
        let state = self.cycle_engine.current_state().await;

        OmegaAdjustments {
            depth_multiplier: rhythm.omega_depth,
            engine_weights: rhythm.omega_engine_weights(),
            reflection_enabled: rhythm.omega_depth > 0.6,
            coherence_threshold: rhythm.analysis_intensity,
            speed_vs_quality_ratio: rhythm.speed_vs_quality,
            parallel_execution: matches!(
                rhythm.mode,
                crate::cycle_engine::cycles::CognitiveMode::Peak
                    | crate::cycle_engine::cycles::CognitiveMode::Analytical
            ),
            vector_search_k: load_params.vector_search_k,
            context_window_size: self.calculate_context_window(&state),
        }
    }

    /// Get router adjustments
    pub async fn get_router_adjustments(&self) -> RouterAdjustments {
        let rhythm = self.cycle_engine.current_rhythm().await;

        RouterAdjustments {
            creativity_weight: rhythm.creative_temperature,
            analysis_weight: rhythm.analysis_intensity,
            synthesis_weight: if matches!(
                rhythm.mode,
                crate::cycle_engine::cycles::CognitiveMode::Synthesis
            ) {
                1.0
            } else {
                0.5
            },
            prefer_cached_routes: matches!(
                rhythm.mode,
                crate::cycle_engine::cycles::CognitiveMode::Execution
            ),
        }
    }

    fn calculate_context_window(&self, state: &crate::cycle_engine::cycles::CycleState) -> usize {
        match state.daily_phase {
            crate::cycle_engine::cycles::DailyPhase::Noon => 8192,
            crate::cycle_engine::cycles::DailyPhase::Morning => 6144,
            crate::cycle_engine::cycles::DailyPhase::Night => 2048,
            _ => 4096,
        }
    }

    /// Check if self-healing should be intensive
    pub async fn should_intensify_self_healing(&self) -> bool {
        let state = self.cycle_engine.current_state().await;
        matches!(
            state.daily_phase,
            crate::cycle_engine::cycles::DailyPhase::Night
                | crate::cycle_engine::cycles::DailyPhase::Dusk
        )
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OmegaAdjustments {
    pub depth_multiplier: f32,
    pub engine_weights: Vec<f32>,
    pub reflection_enabled: bool,
    pub coherence_threshold: f32,
    pub speed_vs_quality_ratio: f32,
    pub parallel_execution: bool,
    pub vector_search_k: usize,
    pub context_window_size: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RouterAdjustments {
    pub creativity_weight: f32,
    pub analysis_weight: f32,
    pub synthesis_weight: f32,
    pub prefer_cached_routes: bool,
}
