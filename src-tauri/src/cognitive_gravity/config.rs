// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Configuration Cognitive Gravity Engine

#![allow(unused_imports)]
#![allow(dead_code)]

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GravityConfig {
    // Thresholds
    pub min_cognitive_mass: f32,
    pub max_entropy: f32,
    pub stability_threshold: f32,

    // Gravity Loop
    pub loop_interval_ms: u64,
    pub enable_auto_stabilization: bool,

    // Attractor Weights
    pub weight_clarity: f32,
    pub weight_coherence: f32,
    pub weight_alignment: f32,
    pub weight_simplicity: f32,
    pub weight_focus: f32,
    pub weight_truth: f32,

    // Anti-Attractor Weights
    pub weight_noise: f32,
    pub weight_confusion: f32,
    pub weight_overload: f32,
    pub weight_dissonance: f32,
    pub weight_drift: f32,

    // Propagation
    pub enable_kernel_propagation: bool,
    pub enable_omega_propagation: bool,
    pub enable_memory_propagation: bool,
    pub enable_agents_propagation: bool,
    pub enable_harmonic_propagation: bool,
}

impl GravityConfig {
    pub fn default() -> Self {
        Self {
            min_cognitive_mass: 0.5,
            max_entropy: 0.4,
            stability_threshold: 0.7,
            loop_interval_ms: 1000,
            enable_auto_stabilization: true,

            // Attractors (positive forces)
            weight_clarity: 1.5,
            weight_coherence: 1.5,
            weight_alignment: 1.3,
            weight_simplicity: 1.0,
            weight_focus: 1.2,
            weight_truth: 1.4,

            // Anti-Attractors (negative forces)
            weight_noise: 0.8,
            weight_confusion: 1.0,
            weight_overload: 1.2,
            weight_dissonance: 1.3,
            weight_drift: 0.9,

            // Propagation
            enable_kernel_propagation: true,
            enable_omega_propagation: true,
            enable_memory_propagation: true,
            enable_agents_propagation: true,
            enable_harmonic_propagation: true,
        }
    }

    pub fn high_stability() -> Self {
        let mut config = Self::default();
        config.stability_threshold = 0.85;
        config.min_cognitive_mass = 0.7;
        config.max_entropy = 0.25;
        config.loop_interval_ms = 500;

        // Boost attractors
        config.weight_clarity = 2.0;
        config.weight_coherence = 2.0;
        config.weight_alignment = 1.8;
        config.weight_truth = 2.0;

        config
    }

    pub fn low_power() -> Self {
        let mut config = Self::default();
        config.loop_interval_ms = 2000;
        config.enable_auto_stabilization = false;

        // Reduce weights
        config.weight_clarity = 1.0;
        config.weight_coherence = 1.0;
        config.weight_alignment = 1.0;

        config
    }

    pub fn attractor_weights(&self) -> [f32; 6] {
        [
            self.weight_clarity,
            self.weight_coherence,
            self.weight_alignment,
            self.weight_simplicity,
            self.weight_focus,
            self.weight_truth,
        ]
    }

    pub fn anti_attractor_weights(&self) -> [f32; 5] {
        [
            self.weight_noise,
            self.weight_confusion,
            self.weight_overload,
            self.weight_dissonance,
            self.weight_drift,
        ]
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_gravity_config() {
        let config = GravityConfig::default();
        assert_eq!(config.min_cognitive_mass, 0.5);
        assert_eq!(config.attractor_weights().len(), 6);
        assert_eq!(config.anti_attractor_weights().len(), 5);
    }
}
