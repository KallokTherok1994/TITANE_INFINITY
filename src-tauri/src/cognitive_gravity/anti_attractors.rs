// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Anti-attracteurs (forces répulsives)

#![allow(unused_imports)]
#![allow(dead_code)]

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum AntiAttractor {
    Noise,      // Bruit cognitif
    Confusion,  // Confusion logique
    Overload,   // Surcharge cognitive
    Dissonance, // Dissonance (contradictions)
    Drift,      // Dérive temporelle
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AntiAttractorState {
    pub noise: f32,
    pub confusion: f32,
    pub overload: f32,
    pub dissonance: f32,
    pub drift: f32,
}

impl AntiAttractorState {
    pub fn new() -> Self {
        Self {
            noise: 0.0,
            confusion: 0.0,
            overload: 0.0,
            dissonance: 0.0,
            drift: 0.0,
        }
    }

    pub fn compute_total_repulsion(&self, weights: &[f32; 5]) -> f32 {
        let sum = self.noise * weights[0]
            + self.confusion * weights[1]
            + self.overload * weights[2]
            + self.dissonance * weights[3]
            + self.drift * weights[4];

        let total_weight: f32 = weights.iter().sum();
        if total_weight > 0.0 {
            (sum / total_weight).clamp(0.0, 1.0)
        } else {
            0.0
        }
    }

    pub fn get(&self, anti_attractor: AntiAttractor) -> f32 {
        match anti_attractor {
            AntiAttractor::Noise => self.noise,
            AntiAttractor::Confusion => self.confusion,
            AntiAttractor::Overload => self.overload,
            AntiAttractor::Dissonance => self.dissonance,
            AntiAttractor::Drift => self.drift,
        }
    }

    pub fn set(&mut self, anti_attractor: AntiAttractor, value: f32) {
        let clamped = value.clamp(0.0, 1.0);
        match anti_attractor {
            AntiAttractor::Noise => self.noise = clamped,
            AntiAttractor::Confusion => self.confusion = clamped,
            AntiAttractor::Overload => self.overload = clamped,
            AntiAttractor::Dissonance => self.dissonance = clamped,
            AntiAttractor::Drift => self.drift = clamped,
        }
    }
}

impl Default for AntiAttractorState {
    fn default() -> Self {
        Self::new()
    }
}
