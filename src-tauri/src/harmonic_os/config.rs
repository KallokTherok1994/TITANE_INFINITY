// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Configuration du Harmonic OS

use serde::{Deserialize, Serialize};

/// Configuration complète du Harmonic OS
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HarmonicConfig {
    pub min_resonance: f32,
    pub max_dissonance: f32,
    pub stability_threshold: f32,
    pub loop_interval_ms: u64,
    pub enable_auto_regulation: bool,
    pub weight_cognitive: f32,
    pub weight_emotional: f32,
    pub weight_logical: f32,
    pub weight_memory: f32,
    pub weight_energy: f32,
    pub weight_temporal: f32,
    pub weight_agent: f32,
    pub detect_contradictions: bool,
    pub detect_instability: bool,
    pub detect_drifts: bool,
}

impl Default for HarmonicConfig {
    fn default() -> Self {
        Self {
            min_resonance: 0.6,
            max_dissonance: 0.3,
            stability_threshold: 0.7,
            loop_interval_ms: 1000,
            enable_auto_regulation: true,
            weight_cognitive: 1.5,
            weight_emotional: 1.0,
            weight_logical: 1.5,
            weight_memory: 1.2,
            weight_energy: 1.0,
            weight_temporal: 0.8,
            weight_agent: 1.0,
            detect_contradictions: true,
            detect_instability: true,
            detect_drifts: true,
        }
    }
}

impl HarmonicConfig {
    pub fn high_sensitivity() -> Self {
        Self {
            min_resonance: 0.75,
            max_dissonance: 0.2,
            stability_threshold: 0.8,
            loop_interval_ms: 500,
            ..Default::default()
        }
    }
    
    pub fn low_power() -> Self {
        Self {
            min_resonance: 0.5,
            max_dissonance: 0.4,
            stability_threshold: 0.6,
            loop_interval_ms: 2000,
            enable_auto_regulation: false,
            ..Default::default()
        }
    }
    
    pub fn normalized_weights(&self) -> [f32; 7] {
        let total = self.weight_cognitive + self.weight_emotional + self.weight_logical
            + self.weight_memory + self.weight_energy + self.weight_temporal + self.weight_agent;
        [
            self.weight_cognitive / total,
            self.weight_emotional / total,
            self.weight_logical / total,
            self.weight_memory / total,
            self.weight_energy / total,
            self.weight_temporal / total,
            self.weight_agent / total,
        ]
    }
    
    pub fn validate(&self) -> Result<(), String> {
        if self.min_resonance < 0.0 || self.min_resonance > 1.0 {
            return Err("min_resonance must be 0.0-1.0".to_string());
        }
        if self.loop_interval_ms == 0 {
            return Err("loop_interval_ms must be > 0".to_string());
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_default_config() {
        let config = HarmonicConfig::default();
        assert!(config.validate().is_ok());
    }
}

