#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   LOAD REGULATOR — Adaptive System Load Management
//   SUPER PROMPT #16
// ═══════════════════════════════════════════════════════════════

use crate::cycle_engine::cognitive_rhythm::CognitiveRhythmParams;
use crate::cycle_engine::cycles::CycleState;
use serde::{Deserialize, Serialize};

/// Load Regulation Parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoadRegulationParams {
    pub omega_intensity: f32,         // 0.0 - 1.0
    pub self_healing_frequency: f32,  // 0.0 - 1.0
    pub vector_search_k: usize,       // Number of results
    pub kernel_priority: f32,         // 0.0 - 1.0
    pub memory_gc_frequency: f32,     // 0.0 - 1.0
    pub agi_introspection_depth: f32, // 0.0 - 1.0
}

pub struct LoadRegulator {
    current_params: LoadRegulationParams,
}

impl LoadRegulator {
    pub fn new() -> Self {
        Self {
            current_params: LoadRegulationParams::default(),
        }
    }

    /// Adjust load based on cycle state and system metrics
    pub fn adjust(
        &mut self,
        cycle_state: &CycleState,
        cognitive_rhythm: &CognitiveRhythmParams,
        cpu_usage: f32,
        memory_usage: f32,
    ) -> LoadRegulationParams {
        // Base parameters from cognitive rhythm
        let mut params = LoadRegulationParams {
            omega_intensity: cognitive_rhythm.omega_depth,
            self_healing_frequency: cognitive_rhythm.memory_consolidation,
            vector_search_k: self.calculate_vector_k(cognitive_rhythm),
            kernel_priority: 0.5,
            memory_gc_frequency: cognitive_rhythm.memory_consolidation,
            agi_introspection_depth: cognitive_rhythm.omega_depth,
        };

        // Adjust based on system load
        if cpu_usage > 0.8 {
            params.omega_intensity *= 0.7;
            params.vector_search_k = (params.vector_search_k as f32 * 0.5) as usize;
        }

        if memory_usage > 0.85 {
            params.memory_gc_frequency = 1.0; // Force GC
        }

        // Night optimization: intensify consolidation
        if matches!(
            cycle_state.cognitive_mode,
            crate::cycle_engine::cycles::CognitiveMode::Consolidation
        ) {
            params.self_healing_frequency = 1.0;
            params.memory_gc_frequency = 1.0;
            params.omega_intensity *= 0.5; // Reduce active processing
        }

        self.current_params = params.clone();
        params
    }

    fn calculate_vector_k(&self, rhythm: &CognitiveRhythmParams) -> usize {
        // More results during analytical/peak phases
        let base = match rhythm.mode {
            crate::cycle_engine::cycles::CognitiveMode::Analytical => 10,
            crate::cycle_engine::cycles::CognitiveMode::Peak => 15,
            crate::cycle_engine::cycles::CognitiveMode::Consolidation => 5,
            _ => 8,
        };
        base
    }

    pub fn current_params(&self) -> &LoadRegulationParams {
        &self.current_params
    }
}

impl Default for LoadRegulationParams {
    fn default() -> Self {
        Self {
            omega_intensity: 0.7,
            self_healing_frequency: 0.5,
            vector_search_k: 8,
            kernel_priority: 0.5,
            memory_gc_frequency: 0.3,
            agi_introspection_depth: 0.7,
        }
    }
}

impl Default for LoadRegulator {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // LoadRegulationParams Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_load_regulation_params_default() {
        let params = LoadRegulationParams::default();
        assert_eq!(params.omega_intensity, 0.7);
        assert_eq!(params.self_healing_frequency, 0.5);
        assert_eq!(params.vector_search_k, 8);
        assert_eq!(params.kernel_priority, 0.5);
        assert_eq!(params.memory_gc_frequency, 0.3);
        assert_eq!(params.agi_introspection_depth, 0.7);
    }

    #[test]
    fn test_load_regulation_params_clone() {
        let params = LoadRegulationParams::default();
        let cloned = params.clone();
        assert_eq!(params.omega_intensity, cloned.omega_intensity);
        assert_eq!(params.vector_search_k, cloned.vector_search_k);
    }

    #[test]
    fn test_load_regulation_params_debug() {
        let params = LoadRegulationParams::default();
        let debug = format!("{:?}", params);
        assert!(debug.contains("LoadRegulationParams"));
    }

    #[test]
    fn test_load_regulation_params_serialization() {
        let params = LoadRegulationParams::default();
        let json = serde_json::to_string(&params).unwrap();
        let restored: LoadRegulationParams = serde_json::from_str(&json).unwrap();
        assert_eq!(params.omega_intensity, restored.omega_intensity);
        assert_eq!(params.vector_search_k, restored.vector_search_k);
    }

    #[test]
    fn test_load_regulation_params_custom() {
        let params = LoadRegulationParams {
            omega_intensity: 0.9,
            self_healing_frequency: 0.8,
            vector_search_k: 15,
            kernel_priority: 0.9,
            memory_gc_frequency: 0.7,
            agi_introspection_depth: 0.6,
        };
        assert_eq!(params.omega_intensity, 0.9);
        assert_eq!(params.vector_search_k, 15);
    }

    // ─────────────────────────────────────────────────────────────
    // LoadRegulator Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_load_regulator_new() {
        let regulator = LoadRegulator::new();
        let params = regulator.current_params();
        assert_eq!(params.omega_intensity, 0.7);
    }

    #[test]
    fn test_load_regulator_default() {
        let regulator = LoadRegulator::default();
        assert_eq!(regulator.current_params().omega_intensity, 0.7);
    }

    #[test]
    fn test_load_regulator_high_cpu() {
        let mut regulator = LoadRegulator::new();
        let cycle_state = CycleState::current();
        let cognitive_rhythm = CognitiveRhythmParams::from_cycle_state(&cycle_state);

        let params = regulator.adjust(&cycle_state, &cognitive_rhythm, 0.9, 0.5);

        // Should reduce intensity under high CPU
        assert!(params.omega_intensity < cognitive_rhythm.omega_depth);
    }

    #[test]
    fn test_load_regulator_normal_cpu() {
        let mut regulator = LoadRegulator::new();
        let cycle_state = CycleState::current();
        let cognitive_rhythm = CognitiveRhythmParams::from_cycle_state(&cycle_state);

        let params = regulator.adjust(&cycle_state, &cognitive_rhythm, 0.5, 0.5);

        // Should not reduce intensity under normal CPU
        assert_eq!(params.omega_intensity, cognitive_rhythm.omega_depth);
    }

    #[test]
    fn test_load_regulator_high_memory() {
        let mut regulator = LoadRegulator::new();
        let cycle_state = CycleState::current();
        let cognitive_rhythm = CognitiveRhythmParams::from_cycle_state(&cycle_state);

        let params = regulator.adjust(&cycle_state, &cognitive_rhythm, 0.5, 0.9);

        // Should force GC under high memory
        assert_eq!(params.memory_gc_frequency, 1.0);
    }

    #[test]
    fn test_load_regulator_normal_memory() {
        let mut regulator = LoadRegulator::new();
        let cycle_state = CycleState::current();
        let cognitive_rhythm = CognitiveRhythmParams::from_cycle_state(&cycle_state);

        let params = regulator.adjust(&cycle_state, &cognitive_rhythm, 0.5, 0.5);

        // Should not force GC under normal memory
        assert!(params.memory_gc_frequency < 1.0);
    }

    #[test]
    fn test_load_regulator_current_params_updates() {
        let mut regulator = LoadRegulator::new();
        let initial = regulator.current_params().omega_intensity;

        let cycle_state = CycleState::current();
        let cognitive_rhythm = CognitiveRhythmParams::from_cycle_state(&cycle_state);
        regulator.adjust(&cycle_state, &cognitive_rhythm, 0.5, 0.5);

        // Current params should be updated
        assert_eq!(
            regulator.current_params().omega_intensity,
            cognitive_rhythm.omega_depth
        );
    }

    #[test]
    fn test_load_regulator_vector_k_reduced_high_cpu() {
        let mut regulator = LoadRegulator::new();
        let cycle_state = CycleState::current();
        let cognitive_rhythm = CognitiveRhythmParams::from_cycle_state(&cycle_state);

        let params_high = regulator.adjust(&cycle_state, &cognitive_rhythm, 0.9, 0.5);

        let mut regulator2 = LoadRegulator::new();
        let params_normal = regulator2.adjust(&cycle_state, &cognitive_rhythm, 0.5, 0.5);

        // Vector k should be reduced under high CPU
        assert!(params_high.vector_search_k < params_normal.vector_search_k);
    }

    #[test]
    fn test_load_regulator_kernel_priority() {
        let mut regulator = LoadRegulator::new();
        let cycle_state = CycleState::current();
        let cognitive_rhythm = CognitiveRhythmParams::from_cycle_state(&cycle_state);

        let params = regulator.adjust(&cycle_state, &cognitive_rhythm, 0.5, 0.5);
        assert_eq!(params.kernel_priority, 0.5);
    }

    #[test]
    fn test_load_regulator_agi_introspection() {
        let mut regulator = LoadRegulator::new();
        let cycle_state = CycleState::current();
        let cognitive_rhythm = CognitiveRhythmParams::from_cycle_state(&cycle_state);

        let params = regulator.adjust(&cycle_state, &cognitive_rhythm, 0.5, 0.5);
        assert_eq!(params.agi_introspection_depth, cognitive_rhythm.omega_depth);
    }

    #[test]
    fn test_load_regulator_consolidation_mode() {
        let mut regulator = LoadRegulator::new();
        let mut cycle_state = CycleState::current();
        cycle_state.daily_phase = crate::cycle_engine::cycles::DailyPhase::Night;
        cycle_state.cognitive_mode = crate::cycle_engine::cycles::CognitiveMode::Consolidation;
        let cognitive_rhythm = CognitiveRhythmParams::from_cycle_state(&cycle_state);

        let params = regulator.adjust(&cycle_state, &cognitive_rhythm, 0.5, 0.5);

        // Should intensify consolidation during night
        assert_eq!(params.self_healing_frequency, 1.0);
        assert_eq!(params.memory_gc_frequency, 1.0);
    }
}
