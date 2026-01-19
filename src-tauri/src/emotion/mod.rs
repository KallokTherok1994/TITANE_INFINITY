#![allow(dead_code)]
// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                        EMOTION ENGINE v13                                    ║
// ║           Détection valence + intensité émotionnelle vocale                  ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

pub mod detector;
// pub mod analyzer;  // À implémenter (template dans TITANE_V13_INTEGRATION_GUIDE.md)
pub mod adaptor;

// pub use detector::EmotionDetector;
// pub use analyzer::EmotionAnalyzer;
// pub use adaptor::EmotionAdaptor;

use serde::{Deserialize, Serialize};

/// État émotionnel détecté
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmotionalState {
    /// Valence (-1.0 = très négatif, 0.0 = neutre, 1.0 = très positif)
    pub valence: f32,
    /// Intensité (0.0 = calme, 1.0 = très intense)
    pub intensity: f32,
    /// Émotion primaire détectée
    pub primary_emotion: Emotion,
    /// Confiance de la détection
    pub confidence: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Emotion {
    Neutral,
    Happy,
    Sad,
    Angry,
    Frustrated,
    Excited,
    Calm,
    Anxious,
    Confused,
    Motivated,
    Tired,
}

impl Default for EmotionalState {
    fn default() -> Self {
        Self {
            valence: 0.0,
            intensity: 0.5,
            primary_emotion: Emotion::Neutral,
            confidence: 0.0,
        }
    }
}

/// Caractéristiques audio pour analyse émotionnelle
#[derive(Debug, Clone)]
pub struct AudioFeatures {
    /// Pitch moyen (Hz)
    pub pitch: f32,
    /// Variance du pitch
    pub pitch_variance: f32,
    /// Énergie/volume
    pub energy: f32,
    /// Débit de parole (mots/sec)
    pub speech_rate: f32,
    /// Pauses/hésitations
    pub pause_count: u32,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_emotional_state_default() {
        let state = EmotionalState::default();
        assert_eq!(state.valence, 0.0);
        assert_eq!(state.intensity, 0.5);
        assert_eq!(state.primary_emotion, Emotion::Neutral);
    }
}
