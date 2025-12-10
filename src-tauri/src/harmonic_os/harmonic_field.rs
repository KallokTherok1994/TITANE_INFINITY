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

        let total_weight: f32 = self
            .signals
            .keys()
            .filter_map(|src| self.weights.get(src))
            .sum();

        let weighted_sum: f32 = self
            .signals
            .iter()
            .filter_map(|(src, sig)| self.weights.get(src).map(|w| sig.resonance * w))
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

    #[test]
    fn test_harmonic_field_default() {
        let field = HarmonicField::default();
        assert_eq!(field.compute_unified_resonance(), 0.5);
    }

    #[test]
    fn test_update_signal() {
        let mut field = HarmonicField::new();
        let signal = HarmonicSignal {
            resonance: 0.8,
            corrections: HarmonicCorrections::default(),
            timestamp: 12345,
        };

        field.update_signal(SignalSource::Kernel, signal);
        assert!(field.compute_unified_resonance() != 0.5);
    }

    #[test]
    fn test_unified_resonance_single_signal() {
        let mut field = HarmonicField::new();
        let signal = HarmonicSignal {
            resonance: 1.0,
            corrections: HarmonicCorrections::default(),
            timestamp: 0,
        };

        field.update_signal(SignalSource::Omega, signal);
        let resonance = field.compute_unified_resonance();
        assert_eq!(resonance, 1.0);
    }

    #[test]
    fn test_unified_resonance_multiple_signals() {
        let mut field = HarmonicField::new();

        field.update_signal(
            SignalSource::Kernel,
            HarmonicSignal {
                resonance: 0.8,
                corrections: HarmonicCorrections::default(),
                timestamp: 0,
            },
        );

        field.update_signal(
            SignalSource::Memory,
            HarmonicSignal {
                resonance: 0.6,
                corrections: HarmonicCorrections::default(),
                timestamp: 0,
            },
        );

        let resonance = field.compute_unified_resonance();
        assert!(resonance >= 0.0 && resonance <= 1.0);
    }

    #[test]
    fn test_signal_source_variants() {
        let sources = [
            SignalSource::Kernel,
            SignalSource::Omega,
            SignalSource::Memory,
            SignalSource::AgiCore,
            SignalSource::Agents,
            SignalSource::Multimodal,
            SignalSource::Temporal,
            SignalSource::Energy,
        ];

        for s in sources {
            let cloned = s;
            assert_eq!(s, cloned);
        }
    }

    #[test]
    fn test_harmonic_corrections_default() {
        let corrections = HarmonicCorrections::default();
        assert!(!corrections.recalibrate_memory);
        assert!(!corrections.adjust_omega_depth);
        assert!(!corrections.reprioritize_agents);
        assert!(!corrections.redistribute_energy);
        assert!(corrections.new_omega_depth.is_none());
    }

    #[test]
    fn test_harmonic_signal_clone() {
        let signal = HarmonicSignal {
            resonance: 0.75,
            corrections: HarmonicCorrections {
                recalibrate_memory: true,
                ..Default::default()
            },
            timestamp: 1000,
        };

        let cloned = signal.clone();
        assert_eq!(cloned.resonance, 0.75);
        assert!(cloned.corrections.recalibrate_memory);
    }

    #[test]
    fn test_weights_applied_correctly() {
        let field = HarmonicField::new();

        // Kernel has weight 2.0
        assert_eq!(*field.weights.get(&SignalSource::Kernel).unwrap(), 2.0);
        // Omega has weight 1.5
        assert_eq!(*field.weights.get(&SignalSource::Omega).unwrap(), 1.5);
        // Temporal has lower weight 0.9
        assert_eq!(*field.weights.get(&SignalSource::Temporal).unwrap(), 0.9);
    }

    #[test]
    fn test_update_overwrites_signal() {
        let mut field = HarmonicField::new();

        field.update_signal(
            SignalSource::Kernel,
            HarmonicSignal {
                resonance: 0.3,
                corrections: HarmonicCorrections::default(),
                timestamp: 0,
            },
        );

        let r1 = field.compute_unified_resonance();

        field.update_signal(
            SignalSource::Kernel,
            HarmonicSignal {
                resonance: 0.9,
                corrections: HarmonicCorrections::default(),
                timestamp: 0,
            },
        );

        let r2 = field.compute_unified_resonance();
        assert!(r2 > r1);
    }
}
