// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! État harmonique global

#![allow(unused_imports)]
#![allow(dead_code)]

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HarmonicState {
    pub cognitive_resonance: f32,
    pub emotional_coherence: f32,
    pub logical_alignment: f32,
    pub memory_alignment: f32,
    pub energy_alignment: f32,
    pub temporal_alignment: f32,
    pub agent_sync: f32,
    pub global_score: f32,
    pub stability: f32,
    pub harmony_level: HarmonyLevel,
    pub last_update: i64,
    pub cycle_count: u64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum HarmonyLevel {
    Critical,
    Low,
    Moderate,
    High,
    Excellent,
}

impl HarmonicState {
    pub fn new() -> Self {
        Self {
            cognitive_resonance: 0.5,
            emotional_coherence: 0.5,
            logical_alignment: 0.5,
            memory_alignment: 0.5,
            energy_alignment: 0.5,
            temporal_alignment: 0.5,
            agent_sync: 0.5,
            global_score: 0.5,
            stability: 0.5,
            harmony_level: HarmonyLevel::Moderate,
            last_update: chrono::Utc::now().timestamp_millis(),
            cycle_count: 0,
        }
    }

    pub fn calculate_global_score(&mut self, weights: &[f32; 7]) {
        let weighted_sum = self.cognitive_resonance * weights[0]
            + self.emotional_coherence * weights[1]
            + self.logical_alignment * weights[2]
            + self.memory_alignment * weights[3]
            + self.energy_alignment * weights[4]
            + self.temporal_alignment * weights[5]
            + self.agent_sync * weights[6];

        let weight_sum: f32 = weights.iter().copied().sum();
        self.global_score = if weight_sum.abs() > f32::EPSILON {
            (weighted_sum / weight_sum).clamp(0.0, 1.0)
        } else {
            0.0
        };

        self.harmony_level = Self::compute_harmony_level(self.global_score);
    }

    pub fn calculate_stability(&mut self) {
        let values = [
            self.cognitive_resonance,
            self.emotional_coherence,
            self.logical_alignment,
            self.memory_alignment,
            self.energy_alignment,
            self.temporal_alignment,
            self.agent_sync,
        ];
        let mean = values.iter().sum::<f32>() / values.len() as f32;
        let variance = values.iter().map(|v| (v - mean).powi(2)).sum::<f32>() / values.len() as f32;
        let std_dev = variance.sqrt();
        self.stability = (1.0 - std_dev).clamp(0.0, 1.0);
    }

    fn compute_harmony_level(score: f32) -> HarmonyLevel {
        match score {
            s if s < 0.3 => HarmonyLevel::Critical,
            s if s < 0.5 => HarmonyLevel::Low,
            s if s < 0.7 => HarmonyLevel::Moderate,
            s if s < 0.9 => HarmonyLevel::High,
            _ => HarmonyLevel::Excellent,
        }
    }

    pub fn is_critical(&self) -> bool {
        self.harmony_level == HarmonyLevel::Critical
    }

    pub fn is_stable(&self, threshold: f32) -> bool {
        self.stability >= threshold
    }

    pub fn increment_cycle(&mut self) {
        self.cycle_count += 1;
        self.last_update = chrono::Utc::now().timestamp_millis();
    }
}

impl Default for HarmonicState {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_harmonic_state() {
        let state = HarmonicState::new();
        assert_eq!(state.harmony_level, HarmonyLevel::Moderate);
    }

    #[test]
    fn test_harmonic_state_default() {
        let state = HarmonicState::default();
        assert_eq!(state.cognitive_resonance, 0.5);
        assert_eq!(state.emotional_coherence, 0.5);
        assert_eq!(state.logical_alignment, 0.5);
        assert_eq!(state.memory_alignment, 0.5);
        assert_eq!(state.energy_alignment, 0.5);
        assert_eq!(state.temporal_alignment, 0.5);
        assert_eq!(state.agent_sync, 0.5);
        assert_eq!(state.global_score, 0.5);
        assert_eq!(state.cycle_count, 0);
    }

    #[test]
    fn test_calculate_global_score() {
        let mut state = HarmonicState::new();
        state.cognitive_resonance = 0.8;
        state.emotional_coherence = 0.7;
        state.logical_alignment = 0.9;

        let weights = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
        state.calculate_global_score(&weights);

        assert!(state.global_score >= 0.0 && state.global_score <= 1.0);
    }

    #[test]
    fn test_harmony_level_critical() {
        let mut state = HarmonicState::new();
        state.cognitive_resonance = 0.1;
        state.emotional_coherence = 0.1;
        state.logical_alignment = 0.1;
        state.memory_alignment = 0.1;
        state.energy_alignment = 0.1;
        state.temporal_alignment = 0.1;
        state.agent_sync = 0.1;

        let weights = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
        state.calculate_global_score(&weights);

        assert_eq!(state.harmony_level, HarmonyLevel::Critical);
    }

    #[test]
    fn test_harmony_level_excellent() {
        let mut state = HarmonicState::new();
        state.cognitive_resonance = 0.95;
        state.emotional_coherence = 0.95;
        state.logical_alignment = 0.95;
        state.memory_alignment = 0.95;
        state.energy_alignment = 0.95;
        state.temporal_alignment = 0.95;
        state.agent_sync = 0.95;

        let weights = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
        state.calculate_global_score(&weights);

        assert_eq!(state.harmony_level, HarmonyLevel::Excellent);
    }

    #[test]
    fn test_calculate_stability() {
        let mut state = HarmonicState::new();
        // All values equal = high stability
        state.calculate_stability();
        assert!(state.stability > 0.9);

        // Vary values = lower stability
        state.cognitive_resonance = 0.1;
        state.emotional_coherence = 0.9;
        state.calculate_stability();
        assert!(state.stability < 0.9);
    }

    #[test]
    fn test_is_critical() {
        let mut state = HarmonicState::new();
        state.harmony_level = HarmonyLevel::Critical;
        assert!(state.is_critical());

        state.harmony_level = HarmonyLevel::High;
        assert!(!state.is_critical());
    }

    #[test]
    fn test_is_stable() {
        let mut state = HarmonicState::new();

        state.stability = 0.8;
        assert!(state.is_stable(0.7));
        assert!(state.is_stable(0.8));
        assert!(!state.is_stable(0.9));
    }

    #[test]
    fn test_increment_cycle() {
        let mut state = HarmonicState::new();
        assert_eq!(state.cycle_count, 0);

        state.increment_cycle();
        assert_eq!(state.cycle_count, 1);

        state.increment_cycle();
        assert_eq!(state.cycle_count, 2);
    }

    #[test]
    fn test_harmony_level_enum() {
        assert_ne!(HarmonyLevel::Critical, HarmonyLevel::Low);
        assert_ne!(HarmonyLevel::Low, HarmonyLevel::Moderate);
        assert_ne!(HarmonyLevel::Moderate, HarmonyLevel::High);
        assert_ne!(HarmonyLevel::High, HarmonyLevel::Excellent);
    }

    #[test]
    fn test_state_clone() {
        let mut state = HarmonicState::new();
        state.cognitive_resonance = 0.8;
        state.harmony_level = HarmonyLevel::High;

        let cloned = state.clone();
        assert_eq!(cloned.cognitive_resonance, 0.8);
        assert_eq!(cloned.harmony_level, HarmonyLevel::High);
    }

    #[test]
    fn test_harmony_level_thresholds() {
        let mut state = HarmonicState::new();
        let weights = [1.0; 7];

        // Test Low threshold (0.3-0.5)
        state.cognitive_resonance = 0.4;
        state.emotional_coherence = 0.4;
        state.logical_alignment = 0.4;
        state.memory_alignment = 0.4;
        state.energy_alignment = 0.4;
        state.temporal_alignment = 0.4;
        state.agent_sync = 0.4;
        state.calculate_global_score(&weights);
        assert_eq!(state.harmony_level, HarmonyLevel::Low);

        // Test High threshold (0.7-0.9)
        state.cognitive_resonance = 0.8;
        state.emotional_coherence = 0.8;
        state.logical_alignment = 0.8;
        state.memory_alignment = 0.8;
        state.energy_alignment = 0.8;
        state.temporal_alignment = 0.8;
        state.agent_sync = 0.8;
        state.calculate_global_score(&weights);
        assert_eq!(state.harmony_level, HarmonyLevel::High);
    }
}
