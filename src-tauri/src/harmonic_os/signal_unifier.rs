// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Unification des signaux multi-sources

#![allow(unused_imports)]
#![allow(dead_code)]

use super::harmonic_field::{HarmonicSignal, SignalSource};
use crate::utils::AppResult as TitaneResult;
use std::collections::HashMap;

pub struct SignalUnifier;

impl SignalUnifier {
    pub fn new() -> Self {
        Self
    }

    pub async fn unify(
        &self,
        signals: HashMap<SignalSource, HarmonicSignal>,
    ) -> TitaneResult<HarmonicSignal> {
        if signals.is_empty() {
            return Ok(HarmonicSignal {
                resonance: 0.5,
                corrections: Default::default(),
                timestamp: chrono::Utc::now().timestamp_millis(),
            });
        }

        let avg_resonance =
            signals.values().map(|s| s.resonance).sum::<f32>() / signals.len() as f32;

        Ok(HarmonicSignal {
            resonance: avg_resonance.clamp(0.0, 1.0),
            corrections: Default::default(),
            timestamp: chrono::Utc::now().timestamp_millis(),
        })
    }
}

impl Default for SignalUnifier {
    fn default() -> Self {
        Self::new()
    }
}
