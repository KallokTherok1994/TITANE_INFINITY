// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Régulateur automatique harmonique

#![allow(unused_imports)]
#![allow(dead_code)]

use super::dissonance_detector::Dissonance;
use super::harmonic_field::HarmonicCorrections;
use super::harmonic_state::HarmonicState;
use crate::utils::AppResult as TitaneResult;

pub struct HarmonicRegulator {
    min_resonance: f32,
    max_dissonance: f32,
}

impl HarmonicRegulator {
    pub fn new(min_resonance: f32, max_dissonance: f32) -> Self {
        Self {
            min_resonance,
            max_dissonance,
        }
    }

    pub async fn regulate(
        &self,
        state: &HarmonicState,
        dissonances: &[Dissonance],
    ) -> TitaneResult<HarmonicCorrections> {
        let mut corrections = HarmonicCorrections::default();

        // Omega depth is a strong intervention: trigger only on *significantly* low resonance.
        let omega_depth_threshold = (self.min_resonance * 0.75).clamp(0.0, 1.0);
        if state.cognitive_resonance < omega_depth_threshold {
            corrections.adjust_omega_depth = true;
            corrections.new_omega_depth = Some(3);
        }

        if state.memory_alignment < self.min_resonance {
            corrections.recalibrate_memory = true;
        }

        if state.agent_sync < self.min_resonance {
            corrections.reprioritize_agents = true;
        }

        if state.energy_alignment < 0.4 {
            corrections.redistribute_energy = true;
        }

        let total_severity: f32 = dissonances.iter().map(|d| d.severity).sum();
        if total_severity > self.max_dissonance {
            corrections.adjust_omega_depth = true;
            corrections.new_omega_depth = Some(2);
        }

        Ok(corrections)
    }
}

impl Default for HarmonicRegulator {
    fn default() -> Self {
        Self::new(0.6, 0.3)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_regulation() {
        let regulator = HarmonicRegulator::default();
        let state = HarmonicState::default();
        let corrections = regulator.regulate(&state, &[]).await.unwrap();
        assert!(!corrections.adjust_omega_depth);
    }

    #[test]
    fn test_regulator_default() {
        let regulator = HarmonicRegulator::default();
        assert_eq!(regulator.min_resonance, 0.6);
        assert_eq!(regulator.max_dissonance, 0.3);
    }

    #[test]
    fn test_regulator_new() {
        let regulator = HarmonicRegulator::new(0.7, 0.2);
        assert_eq!(regulator.min_resonance, 0.7);
        assert_eq!(regulator.max_dissonance, 0.2);
    }

    #[tokio::test]
    async fn test_low_cognitive_resonance() {
        let regulator = HarmonicRegulator::default();
        let mut state = HarmonicState::default();
        state.cognitive_resonance = 0.3; // Below threshold

        let corrections = regulator.regulate(&state, &[]).await.unwrap();
        assert!(corrections.adjust_omega_depth);
        assert_eq!(corrections.new_omega_depth, Some(3));
    }

    #[tokio::test]
    async fn test_low_memory_alignment() {
        let regulator = HarmonicRegulator::default();
        let mut state = HarmonicState::default();
        state.memory_alignment = 0.4; // Below threshold

        let corrections = regulator.regulate(&state, &[]).await.unwrap();
        assert!(corrections.recalibrate_memory);
    }

    #[tokio::test]
    async fn test_low_agent_sync() {
        let regulator = HarmonicRegulator::default();
        let mut state = HarmonicState::default();
        state.agent_sync = 0.3; // Below threshold

        let corrections = regulator.regulate(&state, &[]).await.unwrap();
        assert!(corrections.reprioritize_agents);
    }

    #[tokio::test]
    async fn test_low_energy_alignment() {
        let regulator = HarmonicRegulator::default();
        let mut state = HarmonicState::default();
        state.energy_alignment = 0.3; // Below 0.4

        let corrections = regulator.regulate(&state, &[]).await.unwrap();
        assert!(corrections.redistribute_energy);
    }

    #[tokio::test]
    async fn test_high_dissonance_severity() {
        let regulator = HarmonicRegulator::default();
        let state = HarmonicState::default();
        let dissonances = vec![
            Dissonance {
                source: "test".to_string(),
                severity: 0.5,
                description: "High severity".to_string(),
            },
        ];

        let corrections = regulator.regulate(&state, &dissonances).await.unwrap();
        assert!(corrections.adjust_omega_depth);
        assert_eq!(corrections.new_omega_depth, Some(2));
    }

    #[tokio::test]
    async fn test_all_values_ok() {
        let regulator = HarmonicRegulator::default();
        let mut state = HarmonicState::default();
        state.cognitive_resonance = 0.8;
        state.memory_alignment = 0.8;
        state.agent_sync = 0.8;
        state.energy_alignment = 0.8;

        let corrections = regulator.regulate(&state, &[]).await.unwrap();
        assert!(!corrections.adjust_omega_depth);
        assert!(!corrections.recalibrate_memory);
        assert!(!corrections.reprioritize_agents);
        assert!(!corrections.redistribute_energy);
    }

    #[tokio::test]
    async fn test_multiple_issues() {
        let regulator = HarmonicRegulator::default();
        let mut state = HarmonicState::default();
        state.cognitive_resonance = 0.3;
        state.memory_alignment = 0.3;
        state.agent_sync = 0.3;
        state.energy_alignment = 0.2;

        let corrections = regulator.regulate(&state, &[]).await.unwrap();
        assert!(corrections.adjust_omega_depth);
        assert!(corrections.recalibrate_memory);
        assert!(corrections.reprioritize_agents);
        assert!(corrections.redistribute_energy);
    }
}
