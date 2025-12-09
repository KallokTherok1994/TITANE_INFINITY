// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Champ harmonique H-Field multivariable

#![allow(unused_imports)]
#![allow(dead_code)]

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum SignalSource {
    Kernel,
    Omega,
    Memory,
    AgiCore,
    Agents,
    Multimodal,
    Temporal,
    Energy,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HarmonicSignal {
    pub resonance: f32,
    pub corrections: HarmonicCorrections,
    pub timestamp: i64,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct HarmonicCorrections {
    pub recalibrate_memory: bool,
    pub adjust_omega_depth: bool,
    pub reprioritize_agents: bool,
    pub redistribute_energy: bool,
    pub new_omega_depth: Option<usize>,
}

pub struct HarmonicField {
    signals: HashMap<SignalSource, HarmonicSignal>,
    weights: HashMap<SignalSource, f32>,
}

impl HarmonicField {
    pub fn new() -> Self {
        let mut weights = HashMap::new();
        weights.insert(SignalSource::Kernel, 2.0);
        weights.insert(SignalSource::Omega, 1.5);
        weights.insert(SignalSource::Memory, 1.3);
        weights.insert(SignalSource::AgiCore, 1.2);
        weights.insert(SignalSource::Agents, 1.0);
        weights.insert(SignalSource::Multimodal, 1.1);
        weights.insert(SignalSource::Temporal, 0.9);
        weights.insert(SignalSource::Energy, 1.0);
        
        Self {
            signals: HashMap::new(),
            weights,
        }
    }
    
    pub fn update_signal(&mut self, source: SignalSource, signal: HarmonicSignal) {
        self.signals.insert(source, signal);
    }
    
    pub fn compute_unified_resonance(&self) -> f32 {
        if self.signals.is_empty() {
            return 0.5;
        }
        
        let total_weight: f32 = self.signals.keys()
            .filter_map(|src| self.weights.get(src))
            .sum();
        
        let weighted_sum: f32 = self.signals.iter()
            .filter_map(|(src, sig)| {
                self.weights.get(src).map(|w| sig.resonance * w)
            })
            .sum();
        
        if total_weight > 0.0 {
            (weighted_sum / total_weight).clamp(0.0, 1.0)
        } else {
            0.5
        }
    }
}

impl Default for HarmonicField {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_harmonic_field() {
        let field = HarmonicField::new();
        assert_eq!(field.compute_unified_resonance(), 0.5);
    }
}
