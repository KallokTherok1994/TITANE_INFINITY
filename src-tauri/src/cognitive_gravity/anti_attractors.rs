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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_anti_attractor_state_new() {
        let state = AntiAttractorState::new();
        assert_eq!(state.noise, 0.0);
        assert_eq!(state.confusion, 0.0);
        assert_eq!(state.overload, 0.0);
        assert_eq!(state.dissonance, 0.0);
        assert_eq!(state.drift, 0.0);
    }

    #[test]
    fn test_anti_attractor_state_default() {
        let state = AntiAttractorState::default();
        assert_eq!(state.noise, 0.0);
        assert_eq!(state.confusion, 0.0);
    }

    #[test]
    fn test_anti_attractor_get() {
        let mut state = AntiAttractorState::new();
        state.noise = 0.3;
        state.confusion = 0.4;

        assert_eq!(state.get(AntiAttractor::Noise), 0.3);
        assert_eq!(state.get(AntiAttractor::Confusion), 0.4);
        assert_eq!(state.get(AntiAttractor::Overload), 0.0);
        assert_eq!(state.get(AntiAttractor::Dissonance), 0.0);
        assert_eq!(state.get(AntiAttractor::Drift), 0.0);
    }

    #[test]
    fn test_anti_attractor_set() {
        let mut state = AntiAttractorState::new();

        state.set(AntiAttractor::Noise, 0.5);
        assert_eq!(state.noise, 0.5);

        state.set(AntiAttractor::Confusion, 0.6);
        assert_eq!(state.confusion, 0.6);

        state.set(AntiAttractor::Overload, 0.7);
        assert_eq!(state.overload, 0.7);

        state.set(AntiAttractor::Dissonance, 0.8);
        assert_eq!(state.dissonance, 0.8);

        state.set(AntiAttractor::Drift, 0.9);
        assert_eq!(state.drift, 0.9);
    }

    #[test]
    fn test_anti_attractor_set_clamping() {
        let mut state = AntiAttractorState::new();

        state.set(AntiAttractor::Noise, 1.5);
        assert_eq!(state.noise, 1.0);

        state.set(AntiAttractor::Confusion, -0.5);
        assert_eq!(state.confusion, 0.0);
    }

    #[test]
    fn test_compute_total_repulsion() {
        let mut state = AntiAttractorState::new();
        state.noise = 0.5;
        state.confusion = 0.5;
        state.overload = 0.5;
        state.dissonance = 0.5;
        state.drift = 0.5;

        let weights = [1.0, 1.0, 1.0, 1.0, 1.0];
        let repulsion = state.compute_total_repulsion(&weights);
        assert_eq!(repulsion, 0.5);
    }

    #[test]
    fn test_compute_repulsion_zero_weights() {
        let state = AntiAttractorState::new();
        let weights = [0.0, 0.0, 0.0, 0.0, 0.0];
        let repulsion = state.compute_total_repulsion(&weights);
        assert_eq!(repulsion, 0.0);
    }

    #[test]
    fn test_compute_repulsion_all_high() {
        let mut state = AntiAttractorState::new();
        state.noise = 1.0;
        state.confusion = 1.0;
        state.overload = 1.0;
        state.dissonance = 1.0;
        state.drift = 1.0;

        let weights = [1.0, 1.0, 1.0, 1.0, 1.0];
        let repulsion = state.compute_total_repulsion(&weights);
        assert_eq!(repulsion, 1.0);
    }

    #[test]
    fn test_anti_attractor_enum_variants() {
        let anti_attractors = [
            AntiAttractor::Noise,
            AntiAttractor::Confusion,
            AntiAttractor::Overload,
            AntiAttractor::Dissonance,
            AntiAttractor::Drift,
        ];

        for a in anti_attractors {
            let cloned = a;
            assert_eq!(a, cloned);
        }
    }

    #[test]
    fn test_anti_attractor_state_clone() {
        let mut state = AntiAttractorState::new();
        state.noise = 0.3;
        state.overload = 0.7;

        let cloned = state.clone();
        assert_eq!(cloned.noise, 0.3);
        assert_eq!(cloned.overload, 0.7);
    }
}
