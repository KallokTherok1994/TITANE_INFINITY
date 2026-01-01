// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Attracteurs cognitifs

#![allow(unused_imports)]
#![allow(dead_code)]

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Attractor {
    Clarity,    // Clarté cognitive
    Coherence,  // Cohérence logique
    Alignment,  // Alignement multi-moteurs
    Simplicity, // Simplicité (rasoir d'Occam)
    Focus,      // Focus attentionnel
    Truth,      // Vérité factuelle
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttractorState {
    pub clarity: f32,
    pub coherence: f32,
    pub alignment: f32,
    pub simplicity: f32,
    pub focus: f32,
    pub truth: f32,
}

impl AttractorState {
    pub fn new() -> Self {
        Self {
            clarity: 0.5,
            coherence: 0.5,
            alignment: 0.5,
            simplicity: 0.5,
            focus: 0.5,
            truth: 0.5,
        }
    }

    pub fn compute_total_influence(&self, weights: &[f32; 6]) -> f32 {
        let sum = self.clarity * weights[0]
            + self.coherence * weights[1]
            + self.alignment * weights[2]
            + self.simplicity * weights[3]
            + self.focus * weights[4]
            + self.truth * weights[5];

        let total_weight: f32 = weights.iter().sum();
        if total_weight > 0.0 {
            (sum / total_weight).clamp(0.0, 1.0)
        } else {
            0.5
        }
    }

    pub fn get(&self, attractor: Attractor) -> f32 {
        match attractor {
            Attractor::Clarity => self.clarity,
            Attractor::Coherence => self.coherence,
            Attractor::Alignment => self.alignment,
            Attractor::Simplicity => self.simplicity,
            Attractor::Focus => self.focus,
            Attractor::Truth => self.truth,
        }
    }

    pub fn set(&mut self, attractor: Attractor, value: f32) {
        let clamped = value.clamp(0.0, 1.0);
        match attractor {
            Attractor::Clarity => self.clarity = clamped,
            Attractor::Coherence => self.coherence = clamped,
            Attractor::Alignment => self.alignment = clamped,
            Attractor::Simplicity => self.simplicity = clamped,
            Attractor::Focus => self.focus = clamped,
            Attractor::Truth => self.truth = clamped,
        }
    }
}

impl Default for AttractorState {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_attractor_state() {
        let state = AttractorState::new();
        let weights = [1.5, 1.5, 1.3, 1.0, 1.2, 1.4];
        let influence = state.compute_total_influence(&weights);
        assert!((0.0..=1.0).contains(&influence));
    }

    #[test]
    fn test_attractor_state_default() {
        let state = AttractorState::default();
        assert_eq!(state.clarity, 0.5);
        assert_eq!(state.coherence, 0.5);
        assert_eq!(state.alignment, 0.5);
        assert_eq!(state.simplicity, 0.5);
        assert_eq!(state.focus, 0.5);
        assert_eq!(state.truth, 0.5);
    }

    #[test]
    fn test_attractor_get() {
        let state = AttractorState::new();
        assert_eq!(state.get(Attractor::Clarity), 0.5);
        assert_eq!(state.get(Attractor::Coherence), 0.5);
        assert_eq!(state.get(Attractor::Alignment), 0.5);
        assert_eq!(state.get(Attractor::Simplicity), 0.5);
        assert_eq!(state.get(Attractor::Focus), 0.5);
        assert_eq!(state.get(Attractor::Truth), 0.5);
    }

    #[test]
    fn test_attractor_set() {
        let mut state = AttractorState::new();

        state.set(Attractor::Clarity, 0.8);
        assert_eq!(state.clarity, 0.8);

        state.set(Attractor::Coherence, 0.9);
        assert_eq!(state.coherence, 0.9);
    }

    #[test]
    fn test_attractor_set_clamping() {
        let mut state = AttractorState::new();

        state.set(Attractor::Clarity, 1.5);
        assert_eq!(state.clarity, 1.0);

        state.set(Attractor::Truth, -0.5);
        assert_eq!(state.truth, 0.0);
    }

    #[test]
    fn test_compute_influence_with_zero_weights() {
        let state = AttractorState::new();
        let weights = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
        let influence = state.compute_total_influence(&weights);
        assert_eq!(influence, 0.5);
    }

    #[test]
    fn test_compute_influence_all_high() {
        let mut state = AttractorState::new();
        state.clarity = 1.0;
        state.coherence = 1.0;
        state.alignment = 1.0;
        state.simplicity = 1.0;
        state.focus = 1.0;
        state.truth = 1.0;

        let weights = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
        let influence = state.compute_total_influence(&weights);
        assert_eq!(influence, 1.0);
    }

    #[test]
    fn test_attractor_enum_variants() {
        let attractors = [
            Attractor::Clarity,
            Attractor::Coherence,
            Attractor::Alignment,
            Attractor::Simplicity,
            Attractor::Focus,
            Attractor::Truth,
        ];

        for a in attractors {
            let cloned = a;
            assert_eq!(a, cloned);
        }
    }

    #[test]
    fn test_attractor_state_clone() {
        let state = AttractorState::new();
        let cloned = state.clone();
        assert_eq!(cloned.clarity, state.clarity);
        assert_eq!(cloned.coherence, state.coherence);
    }

    #[test]
    fn test_set_all_attractors() {
        let mut state = AttractorState::new();

        state.set(Attractor::Clarity, 0.1);
        state.set(Attractor::Coherence, 0.2);
        state.set(Attractor::Alignment, 0.3);
        state.set(Attractor::Simplicity, 0.4);
        state.set(Attractor::Focus, 0.5);
        state.set(Attractor::Truth, 0.6);

        assert_eq!(state.get(Attractor::Clarity), 0.1);
        assert_eq!(state.get(Attractor::Coherence), 0.2);
        assert_eq!(state.get(Attractor::Alignment), 0.3);
        assert_eq!(state.get(Attractor::Simplicity), 0.4);
        assert_eq!(state.get(Attractor::Focus), 0.5);
        assert_eq!(state.get(Attractor::Truth), 0.6);
    }
}
