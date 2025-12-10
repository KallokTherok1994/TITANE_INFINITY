#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   ALIGNMENT ENGINE — System-wide Temporal Synchronization
//   SUPER PROMPT #16
// ═══════════════════════════════════════════════════════════════

use crate::cycle_engine::cognitive_rhythm::CognitiveRhythmParams;
use crate::cycle_engine::cycles::CycleState;
use crate::cycle_engine::load_regulator::LoadRegulationParams;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemAlignment {
    pub kernel_aligned: bool,
    pub omega_aligned: bool,
    pub memory_os_aligned: bool,
    pub agi_core_aligned: bool,
    pub self_healing_aligned: bool,
    pub alignment_score: f32, // 0.0 - 1.0
}

pub struct AlignmentEngine {
    current_alignment: SystemAlignment,
}

impl AlignmentEngine {
    pub fn new() -> Self {
        Self {
            current_alignment: SystemAlignment::default(),
        }
    }

    /// Align all subsystems with current cycle
    pub fn align_system(
        &mut self,
        cycle_state: &CycleState,
        cognitive_rhythm: &CognitiveRhythmParams,
        load_params: &LoadRegulationParams,
    ) -> SystemAlignment {
        // TODO: Implement actual alignment logic with each subsystem
        // For now, return placeholder

        let alignment = SystemAlignment {
            kernel_aligned: true,
            omega_aligned: true,
            memory_os_aligned: true,
            agi_core_aligned: true,
            self_healing_aligned: true,
            alignment_score: 0.95,
        };

        self.current_alignment = alignment.clone();
        alignment
    }

    /// Check if system is well-aligned
    pub fn is_well_aligned(&self) -> bool {
        self.current_alignment.alignment_score > 0.8
    }

    /// Get current alignment
    pub fn current_alignment(&self) -> &SystemAlignment {
        &self.current_alignment
    }
}

impl Default for SystemAlignment {
    fn default() -> Self {
        Self {
            kernel_aligned: false,
            omega_aligned: false,
            memory_os_aligned: false,
            agi_core_aligned: false,
            self_healing_aligned: false,
            alignment_score: 0.0,
        }
    }
}

impl Default for AlignmentEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // SystemAlignment Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_system_alignment_default() {
        let alignment = SystemAlignment::default();
        assert!(!alignment.kernel_aligned);
        assert!(!alignment.omega_aligned);
        assert!(!alignment.memory_os_aligned);
        assert!(!alignment.agi_core_aligned);
        assert!(!alignment.self_healing_aligned);
        assert_eq!(alignment.alignment_score, 0.0);
    }

    #[test]
    fn test_system_alignment_clone() {
        let alignment = SystemAlignment::default();
        let cloned = alignment.clone();
        assert_eq!(alignment.kernel_aligned, cloned.kernel_aligned);
        assert_eq!(alignment.alignment_score, cloned.alignment_score);
    }

    #[test]
    fn test_system_alignment_debug() {
        let alignment = SystemAlignment::default();
        let debug = format!("{:?}", alignment);
        assert!(debug.contains("SystemAlignment"));
    }

    #[test]
    fn test_system_alignment_serialization() {
        let alignment = SystemAlignment::default();
        let json = serde_json::to_string(&alignment).unwrap();
        let restored: SystemAlignment = serde_json::from_str(&json).unwrap();
        assert_eq!(alignment.alignment_score, restored.alignment_score);
    }

    #[test]
    fn test_system_alignment_custom() {
        let alignment = SystemAlignment {
            kernel_aligned: true,
            omega_aligned: true,
            memory_os_aligned: true,
            agi_core_aligned: false,
            self_healing_aligned: true,
            alignment_score: 0.85,
        };
        assert!(alignment.kernel_aligned);
        assert!(alignment.omega_aligned);
        assert!(!alignment.agi_core_aligned);
        assert_eq!(alignment.alignment_score, 0.85);
    }

    #[test]
    fn test_system_alignment_score_range() {
        let alignment = SystemAlignment::default();
        assert!(alignment.alignment_score >= 0.0 && alignment.alignment_score <= 1.0);
    }

    // ─────────────────────────────────────────────────────────────
    // AlignmentEngine Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_alignment_engine_new() {
        let engine = AlignmentEngine::new();
        let alignment = engine.current_alignment();
        assert_eq!(alignment.alignment_score, 0.0);
    }

    #[test]
    fn test_alignment_engine_default() {
        let engine = AlignmentEngine::default();
        assert_eq!(engine.current_alignment().alignment_score, 0.0);
    }

    #[test]
    fn test_alignment_engine_is_well_aligned_false() {
        let engine = AlignmentEngine::new();
        assert!(!engine.is_well_aligned());
    }

    #[test]
    fn test_alignment_engine_align_system() {
        let mut engine = AlignmentEngine::new();
        let cycle_state = CycleState::current();
        let cognitive_rhythm = CognitiveRhythmParams::from_cycle_state(&cycle_state);
        let load_params = LoadRegulationParams::default();

        let alignment = engine.align_system(&cycle_state, &cognitive_rhythm, &load_params);
        assert!(alignment.kernel_aligned);
        assert!(alignment.omega_aligned);
        assert_eq!(alignment.alignment_score, 0.95);
    }

    #[test]
    fn test_alignment_engine_is_well_aligned_after_align() {
        let mut engine = AlignmentEngine::new();
        let cycle_state = CycleState::current();
        let cognitive_rhythm = CognitiveRhythmParams::from_cycle_state(&cycle_state);
        let load_params = LoadRegulationParams::default();

        engine.align_system(&cycle_state, &cognitive_rhythm, &load_params);
        assert!(engine.is_well_aligned());
    }

    #[test]
    fn test_alignment_engine_current_alignment_updates() {
        let mut engine = AlignmentEngine::new();
        let initial_score = engine.current_alignment().alignment_score;

        let cycle_state = CycleState::current();
        let cognitive_rhythm = CognitiveRhythmParams::from_cycle_state(&cycle_state);
        let load_params = LoadRegulationParams::default();
        engine.align_system(&cycle_state, &cognitive_rhythm, &load_params);

        assert_ne!(engine.current_alignment().alignment_score, initial_score);
    }

    #[test]
    fn test_alignment_engine_threshold() {
        let engine = AlignmentEngine::new();
        // Threshold is 0.8, default score is 0.0, so not well aligned
        assert!(!engine.is_well_aligned());
    }
}
