// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Amplification cohérence système

#![allow(unused_imports)]
#![allow(dead_code)]

use super::harmonic_state::HarmonicState;

pub struct CoherenceResonator {
    amplification_factor: f32,
}

impl CoherenceResonator {
    pub fn new(amplification_factor: f32) -> Self {
        Self {
            amplification_factor,
        }
    }

    pub fn amplify(&self, state: &mut HarmonicState) {
        state.cognitive_resonance =
            (state.cognitive_resonance * self.amplification_factor).clamp(0.0, 1.0);
        state.logical_alignment =
            (state.logical_alignment * self.amplification_factor).clamp(0.0, 1.0);
    }
}

impl Default for CoherenceResonator {
    fn default() -> Self {
        Self::new(1.05)
    }
}
