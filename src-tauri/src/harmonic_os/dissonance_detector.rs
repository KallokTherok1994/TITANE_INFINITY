// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Détection dissonances cognitives

#![allow(unused_imports)]
#![allow(dead_code)]

use super::harmonic_state::HarmonicState;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dissonance {
    pub source: String,
    pub severity: f32,
    pub description: String,
}

pub struct DissonanceDetector {
    threshold: f32,
}

impl DissonanceDetector {
    pub fn new(threshold: f32) -> Self {
        Self { threshold }
    }
    
    pub async fn detect(&self, state: &HarmonicState) -> Vec<Dissonance> {
        let mut dissonances = Vec::new();
        
        if state.cognitive_resonance < self.threshold {
            dissonances.push(Dissonance {
                source: "cognitive".to_string(),
                severity: self.threshold - state.cognitive_resonance,
                description: "Low cognitive resonance".to_string(),
            });
        }
        
        if state.logical_alignment < self.threshold {
            dissonances.push(Dissonance {
                source: "logical".to_string(),
                severity: self.threshold - state.logical_alignment,
                description: "Logical inconsistency detected".to_string(),
            });
        }
        
        dissonances
    }
}

impl Default for DissonanceDetector {
    fn default() -> Self {
        Self::new(0.5)
    }
}
