#![allow(dead_code)]
// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                       EMOTION ADAPTOR v13                                    ║
// ║              Adapte la réponse IA selon l'émotion détectée                   ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

use super::{Emotion, EmotionalState};

/// Adaptateur de réponse basé sur l'émotion
pub struct EmotionAdaptor;

/// Configuration d'adaptation émotionnelle
#[derive(Debug, Clone)]
pub struct EmotionAdaptationConfig {
    /// Ton de la réponse
    pub tone: ResponseTone,
    /// Vitesse TTS
    pub tts_speed: f32,
    /// Profondeur de la réponse
    pub depth: u8,
    /// Style de formulation
    pub style: String,
}

#[derive(Debug, Clone, PartialEq)]
pub enum ResponseTone {
    Empathetic,
    Calm,
    Encouraging,
    Direct,
    Gentle,
    Energetic,
}

impl EmotionAdaptor {
    /// Génère une configuration d'adaptation basée sur l'émotion
    pub fn adapt_to_emotion(emotion: &EmotionalState) -> EmotionAdaptationConfig {
        match emotion.primary_emotion {
            Emotion::Happy | Emotion::Excited => EmotionAdaptationConfig {
                tone: ResponseTone::Energetic,
                tts_speed: 2.8,
                depth: 3,
                style: "positif et enthousiaste".to_string(),
            },
            Emotion::Sad => EmotionAdaptationConfig {
                tone: ResponseTone::Empathetic,
                tts_speed: 2.0,
                depth: 2,
                style: "doux et compréhensif".to_string(),
            },
            Emotion::Angry | Emotion::Frustrated => EmotionAdaptationConfig {
                tone: ResponseTone::Calm,
                tts_speed: 2.2,
                depth: 2,
                style: "apaisant et solution-focused".to_string(),
            },
            Emotion::Anxious => EmotionAdaptationConfig {
                tone: ResponseTone::Gentle,
                tts_speed: 2.3,
                depth: 2,
                style: "rassurant et structuré".to_string(),
            },
            Emotion::Confused => EmotionAdaptationConfig {
                tone: ResponseTone::Direct,
                tts_speed: 2.0,
                depth: 4,
                style: "clair et explicatif".to_string(),
            },
            Emotion::Motivated => EmotionAdaptationConfig {
                tone: ResponseTone::Encouraging,
                tts_speed: 2.6,
                depth: 3,
                style: "motivant et actionnable".to_string(),
            },
            Emotion::Tired => EmotionAdaptationConfig {
                tone: ResponseTone::Gentle,
                tts_speed: 2.0,
                depth: 2,
                style: "concis et simple".to_string(),
            },
            Emotion::Calm | Emotion::Neutral => EmotionAdaptationConfig {
                tone: ResponseTone::Direct,
                tts_speed: 2.5,
                depth: 3,
                style: "neutre et équilibré".to_string(),
            },
        }
    }

    /// Génère un prompt système adapté à l'émotion
    pub fn generate_emotion_prompt(emotion: &EmotionalState) -> String {
        let config = Self::adapt_to_emotion(emotion);
        
        let tone_instruction = match config.tone {
            ResponseTone::Empathetic => "Sois empathique et compréhensif. Montre que tu comprends ce que ressent l'utilisateur.",
            ResponseTone::Calm => "Reste calme et apaisant. Aide à désamorcer la tension.",
            ResponseTone::Encouraging => "Sois encourageant et motivant. Inspire l'action et la confiance.",
            ResponseTone::Direct => "Sois direct et clair. Va droit au but.",
            ResponseTone::Gentle => "Sois doux et rassurant. Prends le temps d'expliquer.",
            ResponseTone::Energetic => "Sois énergique et enthousiaste. Matche l'énergie positive.",
        };

        format!(
            "État émotionnel de l'utilisateur détecté : {:?}\n\
            Valence : {:.2} | Intensité : {:.2}\n\
            \n\
            Instructions d'adaptation :\n\
            - Ton : {}\n\
            - Style : {}\n\
            - Profondeur : Niveau {}\n\
            \n\
            {}",
            emotion.primary_emotion,
            emotion.valence,
            emotion.intensity,
            config.tone.clone() as i32,
            config.style,
            config.depth,
            tone_instruction
        )
    }

    /// Ajuste les paramètres TTS selon l'émotion
    pub fn get_tts_params(emotion: &EmotionalState) -> TTSParams {
        let config = Self::adapt_to_emotion(emotion);
        
        // Ajuster pitch et intonation
        let pitch = match emotion.primary_emotion {
            Emotion::Happy | Emotion::Excited => 1.1,
            Emotion::Sad | Emotion::Tired => 0.9,
            _ => 1.0,
        };

        // Ajuster volume
        let volume = match emotion.primary_emotion {
            Emotion::Angry => 0.9, // Légèrement plus bas pour calmer
            Emotion::Anxious => 0.85,
            _ => 1.0,
        };

        TTSParams {
            speed: config.tts_speed,
            pitch,
            volume,
            pause_duration_ms: match emotion.intensity {
                i if i > 0.7 => 200,  // Pauses plus courtes si intense
                i if i < 0.3 => 400,  // Pauses plus longues si calme
                _ => 300,
            },
        }
    }

    /// Détermine si l'IA devrait être plus prudente
    pub fn should_be_cautious(emotion: &EmotionalState) -> bool {
        matches!(
            emotion.primary_emotion,
            Emotion::Angry | Emotion::Frustrated | Emotion::Anxious
        ) && emotion.intensity > 0.6
    }

    /// Suggère des phrases d'ouverture adaptées
    pub fn suggest_opening_phrase(emotion: &EmotionalState) -> String {
        match emotion.primary_emotion {
            Emotion::Happy | Emotion::Excited => {
                "Je vois que tu es motivé ! ".to_string()
            }
            Emotion::Sad => {
                "Je comprends que ce n'est pas facile en ce moment. ".to_string()
            }
            Emotion::Angry | Emotion::Frustrated => {
                "Je comprends ta frustration. Voyons comment je peux t'aider. ".to_string()
            }
            Emotion::Anxious => {
                "Pas de panique, on va y aller étape par étape. ".to_string()
            }
            Emotion::Confused => {
                "Laisse-moi clarifier les choses. ".to_string()
            }
            Emotion::Tired => {
                "Je vais faire simple. ".to_string()
            }
            _ => String::new(),
        }
    }
}

/// Paramètres TTS
#[derive(Debug, Clone)]
pub struct TTSParams {
    pub speed: f32,
    pub pitch: f32,
    pub volume: f32,
    pub pause_duration_ms: u32,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_happy_adaptation() {
        let emotion = EmotionalState {
            valence: 0.8,
            intensity: 0.7,
            primary_emotion: Emotion::Happy,
            confidence: 0.9,
        };

        let config = EmotionAdaptor::adapt_to_emotion(&emotion);
        assert_eq!(config.tone, ResponseTone::Energetic);
        assert!(config.tts_speed > 2.5);
    }

    #[test]
    fn test_sad_adaptation() {
        let emotion = EmotionalState {
            valence: -0.6,
            intensity: 0.3,
            primary_emotion: Emotion::Sad,
            confidence: 0.8,
        };

        let config = EmotionAdaptor::adapt_to_emotion(&emotion);
        assert_eq!(config.tone, ResponseTone::Empathetic);
        assert!(config.tts_speed < 2.5);
    }

    #[test]
    fn test_tts_params() {
        let emotion = EmotionalState {
            valence: 0.0,
            intensity: 0.8,
            primary_emotion: Emotion::Anxious,
            confidence: 0.7,
        };

        let params = EmotionAdaptor::get_tts_params(&emotion);
        assert!(params.volume < 1.0);
        assert_eq!(params.pause_duration_ms, 200); // Pauses courtes si intense
    }

    #[test]
    fn test_cautious_detection() {
        let angry = EmotionalState {
            valence: -0.8,
            intensity: 0.9,
            primary_emotion: Emotion::Angry,
            confidence: 0.9,
        };

        assert!(EmotionAdaptor::should_be_cautious(&angry));

        let calm = EmotionalState {
            valence: 0.0,
            intensity: 0.2,
            primary_emotion: Emotion::Calm,
            confidence: 0.8,
        };

        assert!(!EmotionAdaptor::should_be_cautious(&calm));
    }
}
