// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Boucle harmonique continue

#![allow(unused_imports)]
#![allow(dead_code)]

use super::coherence_resonator::CoherenceResonator;
use super::config::HarmonicConfig;
use super::dissonance_detector::DissonanceDetector;
use super::harmonic_field::{HarmonicField, HarmonicSignal, SignalSource};
use super::harmonic_regulator::HarmonicRegulator;
use super::harmonic_state::HarmonicState;
use super::signal_unifier::SignalUnifier;
use crate::utils::AppResult as TitaneResult;
use std::sync::Arc;
use tokio::sync::RwLock;
use tokio::time::{interval, Duration};

pub struct HarmonicLoop {
    config: HarmonicConfig,
    state: Arc<RwLock<HarmonicState>>,
    field: Arc<RwLock<HarmonicField>>,
    unifier: SignalUnifier,
    resonator: CoherenceResonator,
    detector: DissonanceDetector,
    regulator: HarmonicRegulator,
    running: Arc<RwLock<bool>>,
}

impl HarmonicLoop {
    pub fn new(config: HarmonicConfig) -> Self {
        Self {
            detector: DissonanceDetector::new(config.max_dissonance),
            regulator: HarmonicRegulator::new(config.min_resonance, config.max_dissonance),
            config,
            state: Arc::new(RwLock::new(HarmonicState::default())),
            field: Arc::new(RwLock::new(HarmonicField::default())),
            unifier: SignalUnifier,
            resonator: CoherenceResonator::default(),
            running: Arc::new(RwLock::new(false)),
        }
    }

    pub async fn start(&self) -> TitaneResult<()> {
        let mut running = self.running.write().await;
        *running = true;

        let state = self.state.clone();
        let field = self.field.clone();
        let running_clone = self.running.clone();
        let loop_interval = self.config.loop_interval_ms;

        tokio::spawn(async move {
            let mut tick = interval(Duration::from_millis(loop_interval));
            while *running_clone.read().await {
                tick.tick().await;

                let mut state_guard = state.write().await;
                let field_guard = field.read().await;

                let unified_resonance = field_guard.compute_unified_resonance();
                state_guard.cognitive_resonance = unified_resonance;
                state_guard.increment_cycle();
            }
        });

        Ok(())
    }

    pub async fn stop(&self) -> TitaneResult<()> {
        let mut running = self.running.write().await;
        *running = false;
        Ok(())
    }

    pub async fn get_state(&self) -> HarmonicState {
        self.state.read().await.clone()
    }
}
