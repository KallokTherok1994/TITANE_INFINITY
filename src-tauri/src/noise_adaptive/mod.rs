#![allow(dead_code)]
// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                     NOISE ADAPTIVE ENGINE v13                                ║
// ║              Auto-calibration + Réduction Bruit Adaptive                     ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

pub mod calibrator;

// Modules à implémenter (templates disponibles dans TITANE_V13_INTEGRATION_GUIDE.md)
// pub mod noise_gate;
// pub mod vad_dynamic;
// pub mod equalizer;

// pub use calibrator::AudioCalibrator;
// pub use noise_gate::NoiseGate;
// pub use vad_dynamic::DynamicVAD;
// pub use equalizer::AudioEqualizer;

use serde::{Deserialize, Serialize};

/// Configuration audio adaptative
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdaptiveAudioConfig {
    /// Gain micro (0.0 - 2.0)
    pub mic_gain: f32,
    /// Seuil VAD dynamique
    pub vad_threshold: f32,
    /// Niveau de réduction bruit (0.0 - 1.0)
    pub noise_reduction: f32,
    /// Bande passante optimale
    pub bandwidth: AudioBandwidth,
    /// Calibré pour l'environnement ?
    pub is_calibrated: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AudioBandwidth {
    /// Téléphone (300-3400Hz)
    Narrowband,
    /// Standard (50-7000Hz)
    Wideband,
    /// HD (20-20000Hz)
    Fullband,
}

impl Default for AdaptiveAudioConfig {
    fn default() -> Self {
        Self {
            mic_gain: 1.0,
            vad_threshold: 0.5,
            noise_reduction: 0.7,
            bandwidth: AudioBandwidth::Wideband,
            is_calibrated: false,
        }
    }
}

/// Profil d'environnement détecté
#[derive(Debug, Clone, PartialEq)]
pub enum EnvironmentProfile {
    Silent,        // Bureau calme
    Moderate,      // Maison normale
    Noisy,         // Rue, café
    VeryNoisy,     // Atelier, voiture
    Industrial,    // Usine, chantier
}

impl EnvironmentProfile {
    /// Obtient le niveau de réduction bruit recommandé
    pub fn recommended_noise_reduction(&self) -> f32 {
        match self {
            Self::Silent => 0.3,
            Self::Moderate => 0.6,
            Self::Noisy => 0.8,
            Self::VeryNoisy => 0.9,
            Self::Industrial => 0.95,
        }
    }

    /// Obtient le seuil VAD recommandé
    pub fn recommended_vad_threshold(&self) -> f32 {
        match self {
            Self::Silent => 0.3,
            Self::Moderate => 0.5,
            Self::Noisy => 0.65,
            Self::VeryNoisy => 0.75,
            Self::Industrial => 0.85,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = AdaptiveAudioConfig::default();
        assert_eq!(config.mic_gain, 1.0);
        assert_eq!(config.bandwidth, AudioBandwidth::Wideband);
    }

    #[test]
    fn test_environment_recommendations() {
        let silent = EnvironmentProfile::Silent;
        assert!(silent.recommended_noise_reduction() < 0.5);

        let industrial = EnvironmentProfile::Industrial;
        assert!(industrial.recommended_noise_reduction() > 0.9);
    }
}
