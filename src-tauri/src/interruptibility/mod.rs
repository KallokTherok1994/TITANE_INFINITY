#![allow(dead_code)]
// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                   TITANE∞ v13 - INTERRUPTIBILITY 2.0                        ║
// ║              Analyse intelligente des interruptions humaines                ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

pub mod analyzer;
pub mod adaptor;
pub mod learner;
pub mod window;

// pub use analyzer::InterruptionAnalyzer;
// pub use adaptor::ResponseAdaptor;
// pub use learner::ConversationLearner;
// pub use window::InterruptWindow;

use serde::{Deserialize, Serialize};
use std::time::{Duration, Instant};

/// Cause d'interruption détectée
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[allow(dead_code)]
pub enum InterruptionCause {
    /// Utilisateur confus par la réponse
    Confusion,
    /// Correction d'une erreur de l'IA
    Correction,
    /// Impatience, veut accélérer
    Impatience,
    /// Changement d'idée
    TopicChange,
    /// Réaction émotionnelle forte
    EmotionalReaction,
    /// Veut ajouter une précision
    Clarification,
    /// Interruption naturelle du flow
    NaturalFlow,
    /// Cause inconnue
    Unknown,
}

/// État de la conversation en cours
#[derive(Debug, Clone)]
pub struct ConversationState {
    /// Taux d'interruption (0.0 - 1.0)
    pub interruption_rate: f32,
    /// Longueur optimale des réponses (mots)
    pub optimal_length: usize,
    /// Vitesse préférée (mots/sec)
    pub preferred_speed: f32,
    /// Profondeur souhaitée (1-5)
    pub depth_level: u8,
    /// Style conversationnel détecté
    pub style: ConversationStyle,
    /// Timestamp du dernier ajustement
    pub last_update: Instant,
}

/// Style conversationnel de l'utilisateur
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[derive(Default)]
pub enum ConversationStyle {
    /// Concis, va droit au but
    Brief,
    /// Conversationnel, naturel
    #[default]
    Casual,
    /// Détaillé, analytique
    Detailed,
    /// Technique, précis
    Technical,
    /// Créatif, expressif
    Creative,
}


impl Default for ConversationState {
    fn default() -> Self {
        Self {
            interruption_rate: 0.0,
            optimal_length: 150,
            preferred_speed: 2.5,
            depth_level: 3,
            style: ConversationStyle::Casual,
            last_update: Instant::now(),
        }
    }
}

/// Fenêtre d'interruption naturelle
#[derive(Debug, Clone)]
pub struct NaturalPause {
    /// Position dans le texte (caractères)
    pub position: usize,
    /// Type de pause
    pub pause_type: PauseType,
    /// Durée recommandée (ms)
    pub duration: Duration,
}

#[derive(Debug, Clone, PartialEq)]
pub enum PauseType {
    /// Fin de phrase
    SentenceEnd,
    /// Fin de paragraphe
    ParagraphEnd,
    /// Changement de sujet
    TopicTransition,
    /// Question rhétorique
    RhetoricalQuestion,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_conversation_state_default() {
        let state = ConversationState::default();
        assert_eq!(state.interruption_rate, 0.0);
        assert_eq!(state.optimal_length, 150);
        assert_eq!(state.style, ConversationStyle::Casual);
    }

    #[test]
    fn test_interruption_cause_serialization() {
        let cause = InterruptionCause::Impatience;
        let json = serde_json::to_string(&cause).unwrap();
        let deserialized: InterruptionCause = serde_json::from_str(&json).unwrap();
        assert_eq!(cause, deserialized);
    }
}
