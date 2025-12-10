// ═══════════════════════════════════════════════════════════════
//   MEMORY OS INTEGRATION — Cycle Engine ↔ Memory OS
//   SUPER PROMPT #16
// ═══════════════════════════════════════════════════════════════

use crate::cycle_engine::{
    cognitive_rhythm::CognitiveRhythmParams, load_regulator::LoadRegulationParams, CycleEngine,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

/// Memory OS Integration Bridge
pub struct MemoryCycleBridge {
    cycle_engine: Arc<CycleEngine>,
}

impl MemoryCycleBridge {
    pub fn new(cycle_engine: Arc<CycleEngine>) -> Self {
        Self { cycle_engine }
    }

    /// Get memory management adjustments
    pub async fn get_memory_adjustments(&self) -> MemoryAdjustments {
        let rhythm = self.cycle_engine.current_rhythm().await;
        let load_params = self.cycle_engine.current_load_params().await;
        let state = self.cycle_engine.current_state().await;

        MemoryAdjustments {
            consolidation_intensity: rhythm.memory_consolidation,
            stm_to_ltm_threshold: self.calculate_stm_ltm_threshold(&state),
            gc_frequency: load_params.memory_gc_frequency,
            vector_search_depth: load_params.vector_search_k,
            preload_suggestions: self.should_preload_memory(&state),
            purge_stm: matches!(
                state.daily_phase,
                crate::cycle_engine::cycles::DailyPhase::Night
            ),
        }
    }

    /// Check if this is optimal time for memory consolidation
    pub async fn is_consolidation_time(&self) -> bool {
        let state = self.cycle_engine.current_state().await;
        matches!(
            state.daily_phase,
            crate::cycle_engine::cycles::DailyPhase::Night
                | crate::cycle_engine::cycles::DailyPhase::Dusk
        )
    }

    fn calculate_stm_ltm_threshold(
        &self,
        state: &crate::cycle_engine::cycles::CycleState,
    ) -> usize {
        match state.daily_phase {
            crate::cycle_engine::cycles::DailyPhase::Night => 5, // Lower threshold = more aggressive consolidation
            crate::cycle_engine::cycles::DailyPhase::Dusk => 10,
            _ => 20,
        }
    }

    fn should_preload_memory(&self, state: &crate::cycle_engine::cycles::CycleState) -> bool {
        // Preload memory during morning/noon for peak performance
        matches!(
            state.daily_phase,
            crate::cycle_engine::cycles::DailyPhase::Morning
                | crate::cycle_engine::cycles::DailyPhase::Noon
        )
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryAdjustments {
    pub consolidation_intensity: f32,
    pub stm_to_ltm_threshold: usize,
    pub gc_frequency: f32,
    pub vector_search_depth: usize,
    pub preload_suggestions: bool,
    pub purge_stm: bool,
}
