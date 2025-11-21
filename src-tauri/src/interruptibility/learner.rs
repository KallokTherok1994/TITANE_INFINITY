#![allow(dead_code)]
// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                    CONVERSATION LEARNER v13                                  ║
// ║          Apprend le style conversationnel de l'utilisateur                   ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

use super::{ConversationState, ConversationStyle, InterruptionCause};
use std::collections::VecDeque;
use std::time::{Duration, Instant};

/// Apprend et adapte le style conversationnel
pub struct ConversationLearner {
    /// Historique des interactions récentes
    interaction_history: VecDeque<Interaction>,
    /// État conversationnel courant
    current_state: ConversationState,
    /// Fenêtre d'apprentissage
    learning_window: Duration,
}

#[derive(Debug, Clone)]
struct Interaction {
    timestamp: Instant,
    user_input_length: usize,
    ai_response_length: usize,
    was_interrupted: bool,
    interruption_cause: Option<InterruptionCause>,
    response_time: Duration,
}

impl ConversationLearner {
    /// Crée un nouveau learner
    pub fn new() -> Self {
        Self {
            interaction_history: VecDeque::with_capacity(100),
            current_state: ConversationState::default(),
            learning_window: Duration::from_secs(600), // 10 minutes
        }
    }

    /// Enregistre une nouvelle interaction
    pub fn record_interaction(
        &mut self,
        user_input: &str,
        ai_response: &str,
        was_interrupted: bool,
        interruption_cause: Option<InterruptionCause>,
        response_time: Duration,
    ) {
        let interaction = Interaction {
            timestamp: Instant::now(),
            user_input_length: user_input.split_whitespace().count(),
            ai_response_length: ai_response.split_whitespace().count(),
            was_interrupted,
            interruption_cause,
            response_time,
        };

        self.interaction_history.push_back(interaction);

        // Limiter la taille de l'historique
        if self.interaction_history.len() > 100 {
            self.interaction_history.pop_front();
        }

        // Mettre à jour l'état après chaque interaction
        self.update_state();
    }

    /// Met à jour l'état conversationnel basé sur l'historique
    fn update_state(&mut self) {
        let now = Instant::now();
        let recent: Vec<&Interaction> = self.interaction_history
            .iter()
            .filter(|i| now.duration_since(i.timestamp) < self.learning_window)
            .collect();

        if recent.is_empty() {
            return;
        }

        // Calculer le taux d'interruption
        let interrupted_count = recent.iter().filter(|i| i.was_interrupted).count();
        self.current_state.interruption_rate = interrupted_count as f32 / recent.len() as f32;

        // Calculer la longueur optimale
        let successful_responses: Vec<&&Interaction> = recent.iter()
            .filter(|i| !i.was_interrupted)
            .collect();

        if !successful_responses.is_empty() {
            let avg_length: usize = successful_responses.iter()
                .map(|i| i.ai_response_length)
                .sum::<usize>() / successful_responses.len();
            
            // Ajuster progressivement (lissage)
            self.current_state.optimal_length = 
                (self.current_state.optimal_length as f32 * 0.7 + avg_length as f32 * 0.3) as usize;
        }

        // Détecter le style préféré
        self.current_state.style = self.detect_preferred_style(&recent);

        // Ajuster la vitesse préférée
        self.current_state.preferred_speed = self.calculate_preferred_speed(&recent);

        // Ajuster la profondeur
        self.current_state.depth_level = self.calculate_preferred_depth(&recent);

        self.current_state.last_update = Instant::now();
    }

    /// Détecte le style conversationnel préféré
    fn detect_preferred_style(&self, interactions: &[&Interaction]) -> ConversationStyle {
        let avg_user_length: usize = interactions.iter()
            .map(|i| i.user_input_length)
            .sum::<usize>() / interactions.len().max(1);

        let avg_successful_length: usize = interactions.iter()
            .filter(|i| !i.was_interrupted)
            .map(|i| i.ai_response_length)
            .sum::<usize>() / interactions.iter().filter(|i| !i.was_interrupted).count().max(1);

        // Analyser les patterns
        if avg_user_length < 10 && avg_successful_length < 50 {
            ConversationStyle::Brief
        } else if avg_user_length > 50 || avg_successful_length > 200 {
            ConversationStyle::Detailed
        } else if self.detect_technical_pattern(interactions) {
            ConversationStyle::Technical
        } else if self.detect_creative_pattern(interactions) {
            ConversationStyle::Creative
        } else {
            ConversationStyle::Casual
        }
    }

    /// Détecte un pattern technique
    fn detect_technical_pattern(&self, interactions: &[&Interaction]) -> bool {
        // Basé sur les corrections fréquentes et la précision
        let correction_rate = interactions.iter()
            .filter(|i| matches!(i.interruption_cause, Some(InterruptionCause::Correction)))
            .count() as f32 / interactions.len() as f32;

        correction_rate > 0.3
    }

    /// Détecte un pattern créatif
    fn detect_creative_pattern(&self, interactions: &[&Interaction]) -> bool {
        // Basé sur la variabilité des longueurs
        let lengths: Vec<usize> = interactions.iter()
            .map(|i| i.user_input_length)
            .collect();

        if lengths.is_empty() {
            return false;
        }

        let mean = lengths.iter().sum::<usize>() as f32 / lengths.len() as f32;
        let variance = lengths.iter()
            .map(|&l| {
                let diff = l as f32 - mean;
                diff * diff
            })
            .sum::<f32>() / lengths.len() as f32;

        variance > 400.0 // Haute variabilité
    }

    /// Calcule la vitesse de parole préférée
    fn calculate_preferred_speed(&self, interactions: &[&Interaction]) -> f32 {
        if interactions.is_empty() {
            return 2.5;
        }

        let impatience_count = interactions.iter()
            .filter(|i| matches!(i.interruption_cause, Some(InterruptionCause::Impatience)))
            .count();

        let impatience_rate = impatience_count as f32 / interactions.len() as f32;

        // Plus d'impatience = vitesse plus élevée
        if impatience_rate > 0.3 {
            3.5
        } else if impatience_rate > 0.15 {
            3.0
        } else {
            2.5
        }
    }

    /// Calcule la profondeur préférée
    fn calculate_preferred_depth(&self, interactions: &[&Interaction]) -> u8 {
        if interactions.is_empty() {
            return 3;
        }

        let clarification_count = interactions.iter()
            .filter(|i| matches!(i.interruption_cause, Some(InterruptionCause::Clarification)))
            .count();

        let confusion_count = interactions.iter()
            .filter(|i| matches!(i.interruption_cause, Some(InterruptionCause::Confusion)))
            .count();

        let clarification_rate = clarification_count as f32 / interactions.len() as f32;
        let confusion_rate = confusion_count as f32 / interactions.len() as f32;

        // Clarifications fréquentes = profondeur plus élevée
        // Confusion fréquente = profondeur plus faible
        if confusion_rate > 0.2 {
            2
        } else if clarification_rate > 0.2 {
            4
        } else {
            3
        }
    }

    /// Obtient l'état actuel
    pub fn get_state(&self) -> &ConversationState {
        &self.current_state
    }

    /// Obtient les statistiques d'apprentissage
    pub fn get_learning_stats(&self) -> LearningStats {
        let total = self.interaction_history.len();
        if total == 0 {
            return LearningStats::default();
        }

        let interrupted = self.interaction_history.iter()
            .filter(|i| i.was_interrupted)
            .count();

        let avg_user_length = self.interaction_history.iter()
            .map(|i| i.user_input_length)
            .sum::<usize>() / total;

        let avg_ai_length = self.interaction_history.iter()
            .map(|i| i.ai_response_length)
            .sum::<usize>() / total;

        LearningStats {
            total_interactions: total,
            interruption_rate: interrupted as f32 / total as f32,
            avg_user_input_length: avg_user_length,
            avg_ai_response_length: avg_ai_length,
            detected_style: self.current_state.style.clone(),
            optimal_length: self.current_state.optimal_length,
            preferred_speed: self.current_state.preferred_speed,
        }
    }

    /// Reset l'apprentissage
    pub fn reset(&mut self) {
        self.interaction_history.clear();
        self.current_state = ConversationState::default();
    }
}

/// Statistiques d'apprentissage
#[derive(Debug, Clone, Default)]
pub struct LearningStats {
    pub total_interactions: usize,
    pub interruption_rate: f32,
    pub avg_user_input_length: usize,
    pub avg_ai_response_length: usize,
    pub detected_style: ConversationStyle,
    pub optimal_length: usize,
    pub preferred_speed: f32,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_interaction_recording() {
        let mut learner = ConversationLearner::new();
        
        learner.record_interaction(
            "test input",
            "test response",
            false,
            None,
            Duration::from_millis(500),
        );

        assert_eq!(learner.interaction_history.len(), 1);
    }

    #[test]
    fn test_interruption_rate_calculation() {
        let mut learner = ConversationLearner::new();

        // 3 interactions, 2 interrompues
        learner.record_interaction("test", "response", true, Some(InterruptionCause::Impatience), Duration::from_millis(500));
        learner.record_interaction("test", "response", false, None, Duration::from_millis(500));
        learner.record_interaction("test", "response", true, Some(InterruptionCause::Confusion), Duration::from_millis(500));

        let stats = learner.get_learning_stats();
        assert!((stats.interruption_rate - 0.666).abs() < 0.01);
    }

    #[test]
    fn test_style_detection_brief() {
        let mut learner = ConversationLearner::new();

        // Plusieurs interactions courtes
        for _ in 0..5 {
            learner.record_interaction(
                "ok",
                "Short response here.",
                false,
                None,
                Duration::from_millis(500),
            );
        }

        assert_eq!(learner.get_state().style, ConversationStyle::Brief);
    }

    #[test]
    fn test_optimal_length_learning() {
        let mut learner = ConversationLearner::new();

        // Réponses de 100 mots non interrompues
        let response = "word ".repeat(100);
        
        for _ in 0..5 {
            learner.record_interaction(
                "test",
                &response,
                false,
                None,
                Duration::from_millis(500),
            );
        }

        // La longueur optimale devrait converger vers 100
        let optimal = learner.get_state().optimal_length;
        assert!(optimal > 80 && optimal < 120);
    }
}
