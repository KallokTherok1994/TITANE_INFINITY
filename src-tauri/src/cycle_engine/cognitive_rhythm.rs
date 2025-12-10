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
