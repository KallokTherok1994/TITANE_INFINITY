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

        if state.cognitive_resonance < self.min_resonance {
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
}
