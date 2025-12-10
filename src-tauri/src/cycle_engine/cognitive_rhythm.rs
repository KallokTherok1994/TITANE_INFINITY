#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   COGNITIVE RHYTHM ENGINE — Adaptive Cognitive Tuning
//   SUPER PROMPT #16
// ═══════════════════════════════════════════════════════════════

use crate::cycle_engine::cycles::{CognitiveMode, CycleState, DailyPhase};
use serde::{Deserialize, Serialize};

/// Cognitive Rhythm Parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CognitiveRhythmParams {
    pub mode: CognitiveMode,
    pub omega_depth: f32,          // 0.0 - 1.0 (reflection depth)
    pub analysis_intensity: f32,   // 0.0 - 1.0 (coherence strength)
    pub speed_vs_quality: f32,     // 0.0 (speed) - 1.0 (quality)
    pub memory_consolidation: f32, // 0.0 - 1.0
    pub creative_temperature: f32, // 0.0 - 1.0 (randomness)
}

impl CognitiveRhythmParams {
    pub fn from_cycle_state(state: &CycleState) -> Self {
        match state.daily_phase {
            DailyPhase::Dawn => Self {
                mode: CognitiveMode::Creative,
                omega_depth: 0.6,
                analysis_intensity: 0.4,
                speed_vs_quality: 0.5,
                memory_consolidation: 0.3,
                creative_temperature: 0.8,
            },
            DailyPhase::Morning => Self {
                mode: CognitiveMode::Analytical,
                omega_depth: 0.8,
                analysis_intensity: 0.9,
                speed_vs_quality: 0.7,
                memory_consolidation: 0.4,
                creative_temperature: 0.3,
            },
            DailyPhase::Noon => Self {
                mode: CognitiveMode::Peak,
                omega_depth: 1.0,
                analysis_intensity: 1.0,
                speed_vs_quality: 0.9,
                memory_consolidation: 0.5,
                creative_temperature: 0.5,
            },
            DailyPhase::Afternoon => Self {
                mode: CognitiveMode::Execution,
                omega_depth: 0.7,
                analysis_intensity: 0.7,
                speed_vs_quality: 0.4, // Favor speed
                memory_consolidation: 0.4,
                creative_temperature: 0.4,
            },
            DailyPhase::Dusk => Self {
                mode: CognitiveMode::Synthesis,
                omega_depth: 0.8,
                analysis_intensity: 0.6,
                speed_vs_quality: 0.8,
                memory_consolidation: 0.7,
                creative_temperature: 0.6,
            },
            DailyPhase::Night => Self {
                mode: CognitiveMode::Consolidation,
                omega_depth: 0.5,
                analysis_intensity: 0.3,
                speed_vs_quality: 1.0, // Favor quality
                memory_consolidation: 1.0,
                creative_temperature: 0.2,
            },
        }
    }

    /// Get OMEGA engine weights based on rhythm
    pub fn omega_engine_weights(&self) -> Vec<f32> {
        // Adjust weights for 10 OMEGA engines based on cognitive mode
        match self.mode {
            CognitiveMode::Creative => vec![1.0, 0.5, 0.6, 0.8, 0.7, 0.6, 0.9, 0.8, 0.5, 0.7],
            CognitiveMode::Analytical => vec![1.0, 0.9, 1.0, 0.7, 0.4, 0.8, 0.6, 0.7, 0.8, 0.6],
            CognitiveMode::Peak => vec![1.0, 1.0, 1.0, 1.0, 0.8, 1.0, 0.9, 1.0, 0.9, 0.9],
            CognitiveMode::Execution => vec![1.0, 0.8, 0.7, 0.5, 0.5, 0.7, 0.8, 0.6, 0.7, 0.8],
            CognitiveMode::Synthesis => vec![1.0, 0.9, 0.9, 0.9, 0.6, 0.8, 0.7, 0.8, 0.7, 0.9],
            CognitiveMode::Consolidation => vec![0.5, 0.4, 0.5, 0.6, 0.3, 1.0, 0.4, 0.5, 0.9, 0.4],
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // CognitiveRhythmParams Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_cognitive_rhythm_from_dawn() {
        let state = CycleState::current();
        let mut dawn_state = state.clone();
        dawn_state.daily_phase = DailyPhase::Dawn;
        let params = CognitiveRhythmParams::from_cycle_state(&dawn_state);
        assert_eq!(params.mode, CognitiveMode::Creative);
        assert_eq!(params.omega_depth, 0.6);
        assert_eq!(params.creative_temperature, 0.8);
    }

    #[test]
    fn test_cognitive_rhythm_from_morning() {
        let state = CycleState::current();
        let mut morning_state = state.clone();
        morning_state.daily_phase = DailyPhase::Morning;
        let params = CognitiveRhythmParams::from_cycle_state(&morning_state);
        assert_eq!(params.mode, CognitiveMode::Analytical);
        assert_eq!(params.omega_depth, 0.8);
        assert_eq!(params.analysis_intensity, 0.9);
    }

    #[test]
    fn test_cognitive_rhythm_from_noon() {
        let state = CycleState::current();
        let mut noon_state = state.clone();
        noon_state.daily_phase = DailyPhase::Noon;
        let params = CognitiveRhythmParams::from_cycle_state(&noon_state);
        assert_eq!(params.mode, CognitiveMode::Peak);
        assert_eq!(params.omega_depth, 1.0);
        assert_eq!(params.analysis_intensity, 1.0);
    }

    #[test]
    fn test_cognitive_rhythm_from_afternoon() {
        let state = CycleState::current();
        let mut afternoon_state = state.clone();
        afternoon_state.daily_phase = DailyPhase::Afternoon;
        let params = CognitiveRhythmParams::from_cycle_state(&afternoon_state);
        assert_eq!(params.mode, CognitiveMode::Execution);
        assert_eq!(params.speed_vs_quality, 0.4); // Favor speed
    }

    #[test]
    fn test_cognitive_rhythm_from_dusk() {
        let state = CycleState::current();
        let mut dusk_state = state.clone();
        dusk_state.daily_phase = DailyPhase::Dusk;
        let params = CognitiveRhythmParams::from_cycle_state(&dusk_state);
        assert_eq!(params.mode, CognitiveMode::Synthesis);
        assert_eq!(params.memory_consolidation, 0.7);
    }

    #[test]
    fn test_cognitive_rhythm_from_night() {
        let state = CycleState::current();
        let mut night_state = state.clone();
        night_state.daily_phase = DailyPhase::Night;
        let params = CognitiveRhythmParams::from_cycle_state(&night_state);
        assert_eq!(params.mode, CognitiveMode::Consolidation);
        assert_eq!(params.memory_consolidation, 1.0);
        assert_eq!(params.speed_vs_quality, 1.0); // Favor quality
    }

    #[test]
    fn test_cognitive_rhythm_clone() {
        let state = CycleState::current();
        let params = CognitiveRhythmParams::from_cycle_state(&state);
        let cloned = params.clone();
        assert_eq!(params.mode, cloned.mode);
        assert_eq!(params.omega_depth, cloned.omega_depth);
    }

    #[test]
    fn test_cognitive_rhythm_debug() {
        let state = CycleState::current();
        let params = CognitiveRhythmParams::from_cycle_state(&state);
        let debug = format!("{:?}", params);
        assert!(debug.contains("CognitiveRhythmParams"));
    }

    #[test]
    fn test_cognitive_rhythm_serialization() {
        let state = CycleState::current();
        let params = CognitiveRhythmParams::from_cycle_state(&state);
        let json = serde_json::to_string(&params).unwrap();
        let restored: CognitiveRhythmParams = serde_json::from_str(&json).unwrap();
        assert_eq!(params.mode, restored.mode);
        assert_eq!(params.omega_depth, restored.omega_depth);
    }

    #[test]
    fn test_omega_engine_weights_count() {
        let state = CycleState::current();
        let params = CognitiveRhythmParams::from_cycle_state(&state);
        let weights = params.omega_engine_weights();
        assert_eq!(weights.len(), 10);
    }

    #[test]
    fn test_omega_engine_weights_creative() {
        let state = CycleState::current();
        let mut dawn_state = state.clone();
        dawn_state.daily_phase = DailyPhase::Dawn;
        let params = CognitiveRhythmParams::from_cycle_state(&dawn_state);
        let weights = params.omega_engine_weights();
        assert_eq!(weights[0], 1.0);
    }

    #[test]
    fn test_omega_engine_weights_peak() {
        let state = CycleState::current();
        let mut noon_state = state.clone();
        noon_state.daily_phase = DailyPhase::Noon;
        let params = CognitiveRhythmParams::from_cycle_state(&noon_state);
        let weights = params.omega_engine_weights();
        // Peak has highest weights
        assert!(weights.iter().sum::<f32>() > 9.0);
    }

    #[test]
    fn test_omega_engine_weights_consolidation() {
        let state = CycleState::current();
        let mut night_state = state.clone();
        night_state.daily_phase = DailyPhase::Night;
        let params = CognitiveRhythmParams::from_cycle_state(&night_state);
        let weights = params.omega_engine_weights();
        // Consolidation has lower average weights
        assert!(weights.iter().sum::<f32>() < 6.0);
    }

    #[test]
    fn test_omega_depth_range() {
        for phase in [
            DailyPhase::Dawn,
            DailyPhase::Morning,
            DailyPhase::Noon,
            DailyPhase::Afternoon,
            DailyPhase::Dusk,
            DailyPhase::Night,
        ] {
            let state = CycleState::current();
            let mut test_state = state.clone();
            test_state.daily_phase = phase;
            let params = CognitiveRhythmParams::from_cycle_state(&test_state);
            assert!(params.omega_depth >= 0.0 && params.omega_depth <= 1.0);
        }
    }

    #[test]
    fn test_analysis_intensity_range() {
        for phase in [
            DailyPhase::Dawn,
            DailyPhase::Morning,
            DailyPhase::Noon,
            DailyPhase::Afternoon,
            DailyPhase::Dusk,
            DailyPhase::Night,
        ] {
            let state = CycleState::current();
            let mut test_state = state.clone();
            test_state.daily_phase = phase;
            let params = CognitiveRhythmParams::from_cycle_state(&test_state);
            assert!(params.analysis_intensity >= 0.0 && params.analysis_intensity <= 1.0);
        }
    }

    #[test]
    fn test_memory_consolidation_range() {
        for phase in [
            DailyPhase::Dawn,
            DailyPhase::Morning,
            DailyPhase::Noon,
            DailyPhase::Afternoon,
            DailyPhase::Dusk,
            DailyPhase::Night,
        ] {
            let state = CycleState::current();
            let mut test_state = state.clone();
            test_state.daily_phase = phase;
            let params = CognitiveRhythmParams::from_cycle_state(&test_state);
            assert!(params.memory_consolidation >= 0.0 && params.memory_consolidation <= 1.0);
        }
    }

    #[test]
    fn test_creative_temperature_range() {
        for phase in [
            DailyPhase::Dawn,
            DailyPhase::Morning,
            DailyPhase::Noon,
            DailyPhase::Afternoon,
            DailyPhase::Dusk,
            DailyPhase::Night,
        ] {
            let state = CycleState::current();
            let mut test_state = state.clone();
            test_state.daily_phase = phase;
            let params = CognitiveRhythmParams::from_cycle_state(&test_state);
            assert!(params.creative_temperature >= 0.0 && params.creative_temperature <= 1.0);
        }
    }
}
