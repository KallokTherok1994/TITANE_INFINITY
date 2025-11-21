#![allow(dead_code)]
// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                       EMOTION DETECTOR v13                                   ║
// ║                  Détecte les émotions depuis l'audio                         ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

use super::{AudioFeatures, Emotion, EmotionalState};

/// Détecteur d'émotion basé sur l'audio
pub struct EmotionDetector;

impl EmotionDetector {
    /// Détecte l'émotion à partir des caractéristiques audio
    pub fn detect_from_audio(features: &AudioFeatures) -> EmotionalState {
        // Calcul de la valence basé sur le pitch et l'énergie
        let valence = Self::calculate_valence(features);
        
        // Calcul de l'intensité basé sur l'énergie et la variance
        let intensity = Self::calculate_intensity(features);
        
        // Détection de l'émotion primaire
        let primary_emotion = Self::detect_primary_emotion(valence, intensity, features);
        
        // Confiance basée sur la clarté des signaux
        let confidence = Self::calculate_confidence(features);

        EmotionalState {
            valence,
            intensity,
            primary_emotion,
            confidence,
        }
    }

    /// Calcule la valence émotionnelle
    fn calculate_valence(features: &AudioFeatures) -> f32 {
        // Pitch élevé + énergie élevée = positif
        // Pitch bas + énergie faible = négatif
        
        let pitch_factor = (features.pitch - 150.0) / 100.0; // Normaliser autour de 150Hz
        let energy_factor = (features.energy - 0.5) * 2.0;
        
        
        (pitch_factor * 0.6 + energy_factor * 0.4).clamp(-1.0, 1.0)
    }

    /// Calcule l'intensité émotionnelle
    fn calculate_intensity(features: &AudioFeatures) -> f32 {
        // Variance élevée + énergie élevée + débit rapide = intensité élevée
        
        let variance_factor = (features.pitch_variance / 50.0).min(1.0);
        let energy_factor = features.energy;
        let rate_factor = (features.speech_rate / 4.0).min(1.0); // Normaliser autour de 4 mots/sec
        
        
        (variance_factor * 0.3 + energy_factor * 0.5 + rate_factor * 0.2)
            .clamp(0.0, 1.0)
    }

    /// Détecte l'émotion primaire
    fn detect_primary_emotion(
        valence: f32,
        intensity: f32,
        features: &AudioFeatures,
    ) -> Emotion {
        // Matrice émotion basée sur valence × intensité
        
        if intensity < 0.3 {
            // Faible intensité
            if valence < -0.3 {
                Emotion::Sad
            } else if valence > 0.3 {
                Emotion::Calm
            } else {
                Emotion::Neutral
            }
        } else if intensity < 0.6 {
            // Intensité moyenne
            if valence < -0.5 {
                Emotion::Frustrated
            } else if valence > 0.5 {
                Emotion::Happy
            } else {
                Emotion::Neutral
            }
        } else {
            // Haute intensité
            if valence < -0.5 {
                Emotion::Angry
            } else if valence > 0.5 {
                Emotion::Excited
            } else if features.pause_count > 3 {
                Emotion::Confused
            } else {
                Emotion::Anxious
            }
        }
    }

    /// Calcule la confiance de la détection
    fn calculate_confidence(features: &AudioFeatures) -> f32 {
        // Confiance basée sur la clarté des signaux
        let energy_confidence = if features.energy > 0.3 { 0.5 } else { 0.2 };
        let variance_confidence = if features.pitch_variance > 10.0 { 0.3 } else { 0.1 };
        let rate_confidence = if features.speech_rate > 1.0 { 0.2 } else { 0.1 };
        
        let confidence: f32 = energy_confidence + variance_confidence + rate_confidence;
        confidence.min(1.0)
    }

    /// Détecte l'émotion à partir du texte (fallback)
    pub fn detect_from_text(text: &str) -> EmotionalState {
        let text_lower = text.to_lowercase();
        
        // Mots-clés émotionnels
        let positive_words = ["heureux", "content", "super", "génial", "excellent", "parfait"];
        let negative_words = ["triste", "frustré", "énervé", "problème", "erreur", "mal"];
        let excited_words = ["!!!", "wow", "incroyable", "fantastique"];
        let anxious_words = ["inquiet", "stress", "peur", "anxieux"];
        
        let positive_count = positive_words.iter().filter(|w| text_lower.contains(*w)).count();
        let negative_count = negative_words.iter().filter(|w| text_lower.contains(*w)).count();
        let excited_count = excited_words.iter().filter(|w| text_lower.contains(*w)).count();
        let anxious_count = anxious_words.iter().filter(|w| text_lower.contains(*w)).count();
        
        let valence = (positive_count as f32 - negative_count as f32) / 5.0;
        let intensity = ((positive_count + negative_count + excited_count + anxious_count) as f32 / 5.0)
            .min(1.0);
        
        let primary_emotion = if excited_count > 0 {
            Emotion::Excited
        } else if anxious_count > 0 {
            Emotion::Anxious
        } else if positive_count > negative_count {
            Emotion::Happy
        } else if negative_count > positive_count {
            Emotion::Frustrated
        } else {
            Emotion::Neutral
        };
        
        EmotionalState {
            valence: valence.clamp(-1.0, 1.0),
            intensity,
            primary_emotion,
            confidence: 0.6, // Moins confiant que l'audio
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_happy() {
        let features = AudioFeatures {
            pitch: 200.0,  // Élevé
            pitch_variance: 30.0,
            energy: 0.7,   // Élevé
            speech_rate: 3.0,
            pause_count: 0,
        };

        let state = EmotionDetector::detect_from_audio(&features);
        assert!(state.valence > 0.0);
        assert!(state.intensity > 0.5);
    }

    #[test]
    fn test_detect_sad() {
        let features = AudioFeatures {
            pitch: 100.0,  // Bas
            pitch_variance: 10.0,
            energy: 0.2,   // Faible
            speech_rate: 1.5,
            pause_count: 2,
        };

        let state = EmotionDetector::detect_from_audio(&features);
        assert!(state.valence < 0.0);
        assert!(state.intensity < 0.5);
    }

    #[test]
    fn test_detect_from_text_positive() {
        let text = "Je suis super content et heureux !";
        let state = EmotionDetector::detect_from_text(text);
        
        assert!(state.valence > 0.0);
        assert_eq!(state.primary_emotion, Emotion::Happy);
    }

    #[test]
    fn test_detect_from_text_negative() {
        let text = "C'est frustrant et j'ai un problème";
        let state = EmotionDetector::detect_from_text(text);
        
        assert!(state.valence < 0.0);
        assert_eq!(state.primary_emotion, Emotion::Frustrated);
    }
}
