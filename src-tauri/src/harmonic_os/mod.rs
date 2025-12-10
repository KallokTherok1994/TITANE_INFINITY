// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Système d'Exploitation Harmonique Cognitif vΩ
//!
//! Synchronisation globale et champ harmonique H-Field

#![allow(unused_imports)]
#![allow(dead_code)]

pub mod coherence_resonator;
pub mod config;
pub mod diagnostics;
pub mod dissonance_detector;
pub mod harmonic_field;
pub mod harmonic_loop;
pub mod harmonic_regulator;
pub mod harmonic_state;
pub mod signal_unifier;
pub mod synchronization;

pub use coherence_resonator::CoherenceResonator;
pub use config::HarmonicConfig;
pub use diagnostics::{HarmonicDiagnostics, HarmonicMonitor};
pub use dissonance_detector::{Dissonance, DissonanceDetector};
pub use harmonic_field::{HarmonicCorrections, HarmonicField, HarmonicSignal, SignalSource};
pub use harmonic_loop::HarmonicLoop;
pub use harmonic_regulator::HarmonicRegulator;
pub use harmonic_state::{HarmonicState, HarmonyLevel};
pub use signal_unifier::SignalUnifier;
pub use synchronization::SynchronizationEngine;

use crate::utils::AppResult as TitaneResult;
use std::sync::Arc;
use tokio::sync::RwLock;

/// Système d'Exploitation Harmonique Cognitif
pub struct HarmonicOS {
    config: HarmonicConfig,
    harmonic_loop: Arc<HarmonicLoop>,
    monitor: HarmonicMonitor,
}

impl HarmonicOS {
    /// Crée une nouvelle instance Harmonic OS
    pub fn new(config: HarmonicConfig) -> Self {
        Self {
            harmonic_loop: Arc::new(HarmonicLoop::new(config.clone())),
            monitor: HarmonicMonitor,
            config,
        }
    }

    /// Initialise et démarre la boucle harmonique
    pub async fn initialize(&self) -> TitaneResult<()> {
        log::info!("🎵 Initialisation Harmonic OS vΩ");
        self.harmonic_loop.start().await?;
        log::info!("✅ Harmonic OS démarré");
        Ok(())
    }

    /// Arrête la boucle harmonique
    pub async fn shutdown(&self) -> TitaneResult<()> {
        log::info!("🛑 Arrêt Harmonic OS");
        self.harmonic_loop.stop().await?;
        Ok(())
    }

    /// Récupère l'état harmonique actuel
    pub async fn get_state(&self) -> HarmonicState {
        self.harmonic_loop.get_state().await
    }

    /// Diagnostics complets
    pub async fn diagnostics(&self) -> HarmonicDiagnostics {
        let state = self.get_state().await;
        let detector = DissonanceDetector::new(self.config.max_dissonance);
        let dissonances = detector.detect(&state).await;

        self.monitor.analyze(&state, dissonances)
    }
}

impl Default for HarmonicOS {
    fn default() -> Self {
        Self::new(HarmonicConfig::default())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_harmonic_os_lifecycle() {
        let harmonic_os = HarmonicOS::default();
        harmonic_os.initialize().await.unwrap();

        let state = harmonic_os.get_state().await;
        assert!(state.global_score >= 0.0 && state.global_score <= 1.0);

        harmonic_os.shutdown().await.unwrap();
    }
}
