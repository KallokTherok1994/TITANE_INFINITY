#![allow(dead_code)]
// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                       RESPONSE ADAPTOR v13                                   ║
// ║            Adapte les réponses selon les interruptions                       ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

use super::{InterruptionCause, ConversationState, ConversationStyle};

/// Adaptateur de réponse intelligent
pub struct ResponseAdaptor {
    state: ConversationState,
}

/// Configuration d'adaptation
#[derive(Debug, Clone)]
pub struct AdaptationConfig {
    /// Longueur cible (mots)
    pub target_length: usize,
    /// Profondeur (1-5)
    pub depth: u8,
    /// Vitesse de parole (mots/sec)
    pub speech_speed: f32,
    /// Utiliser des pauses
    pub use_pauses: bool,
    /// Style de formulation
    pub style: ResponseStyle,
}

#[derive(Debug, Clone, PartialEq)]
pub enum ResponseStyle {
    /// Concis et direct
    Concise,
    /// Normal, équilibré
    Balanced,
    /// Détaillé et exhaustif
    Detailed,
    /// Technique et précis
    Technical,
}

impl ResponseAdaptor {
    /// Crée un nouvel adaptateur
    pub fn new(state: ConversationState) -> Self {
        Self { state }
    }

    /// Adapte selon la cause d'interruption
    pub fn adapt_to_interruption(&mut self, cause: &InterruptionCause) {
        match cause {
            InterruptionCause::Confusion => {
                // Simplifier et raccourcir
                self.state.optimal_length = (self.state.optimal_length as f32 * 0.7) as usize;
                self.state.optimal_length = self.state.optimal_length.max(50);
                self.state.depth_level = (self.state.depth_level.saturating_sub(1)).max(1);
                self.state.style = ConversationStyle::Brief;
            }
            InterruptionCause::Correction => {
                // Être plus précis et technique
                self.state.depth_level = (self.state.depth_level + 1).min(5);
                self.state.style = ConversationStyle::Technical;
            }
            InterruptionCause::Impatience => {
                // Accélérer et condenser
                self.state.optimal_length = (self.state.optimal_length as f32 * 0.6) as usize;
                self.state.optimal_length = self.state.optimal_length.max(30);
                self.state.preferred_speed = (self.state.preferred_speed * 1.2).min(4.0);
                self.state.style = ConversationStyle::Brief;
            }
            InterruptionCause::TopicChange => {
                // Reset vers équilibre
                self.state.optimal_length = 150;
                self.state.depth_level = 3;
            }
            InterruptionCause::EmotionalReaction => {
                // S'adapter à l'émotion : plus empathique, moins technique
                self.state.optimal_length = (self.state.optimal_length as f32 * 0.8) as usize;
                self.state.style = ConversationStyle::Casual;
                self.state.preferred_speed = (self.state.preferred_speed * 0.9).max(1.5);
            }
            InterruptionCause::Clarification => {
                // Ajouter de la profondeur sans allonger trop
                self.state.depth_level = (self.state.depth_level + 1).min(5);
            }
            InterruptionCause::NaturalFlow => {
                // C'est bon, continuer normalement
                // Pas de changement
            }
            InterruptionCause::Unknown => {
                // Léger ajustement conservateur
                self.state.optimal_length = (self.state.optimal_length as f32 * 0.9) as usize;
            }
        }

        self.state.last_update = std::time::Instant::now();
    }

    /// Génère une configuration d'adaptation
    pub fn generate_config(&self) -> AdaptationConfig {
        let style = match self.state.style {
            ConversationStyle::Brief => ResponseStyle::Concise,
            ConversationStyle::Casual => ResponseStyle::Balanced,
            ConversationStyle::Detailed => ResponseStyle::Detailed,
            ConversationStyle::Technical => ResponseStyle::Technical,
            ConversationStyle::Creative => ResponseStyle::Balanced,
        };

        AdaptationConfig {
            target_length: self.state.optimal_length,
            depth: self.state.depth_level,
            speech_speed: self.state.preferred_speed,
            use_pauses: self.state.interruption_rate < 0.3,
            style,
        }
    }

    /// Ajuste la longueur d'une réponse générée
    pub fn adjust_response_length(&self, text: &str) -> String {
        let words: Vec<&str> = text.split_whitespace().collect();
        let current_length = words.len();

        if current_length <= self.state.optimal_length {
            return text.to_string();
        }

        // Tronquer intelligemment à la phrase complète la plus proche
        let truncated = words[..self.state.optimal_length].join(" ");
        
        // Trouver la dernière phrase complète
        if let Some(last_period) = truncated.rfind('.') {
            truncated[..=last_period].to_string()
        } else if let Some(last_question) = truncated.rfind('?') {
            truncated[..=last_question].to_string()
        } else if let Some(last_exclamation) = truncated.rfind('!') {
            truncated[..=last_exclamation].to_string()
        } else {
            format!("{}...", truncated)
        }
    }

    /// Insère des fenêtres d'interruption naturelles
    pub fn insert_pause_markers(&self, text: &str) -> String {
        if !self.generate_config().use_pauses {
            return text.to_string();
        }

        // Ajouter des marqueurs de pause aux transitions naturelles
        text.replace(". ", ". [PAUSE_SHORT] ")
            .replace("? ", "? [PAUSE_SHORT] ")
            .replace("! ", "! [PAUSE_SHORT] ")
            .replace("\n\n", "\n\n[PAUSE_MEDIUM]\n\n")
    }

    /// Obtient l'état actuel
    pub fn get_state(&self) -> &ConversationState {
        &self.state
    }

    /// Met à jour l'état manuellement
    pub fn update_state(&mut self, state: ConversationState) {
        self.state = state;
    }

    /// Génère un prompt système adapté pour l'IA
    pub fn generate_system_prompt(&self) -> String {
        let config = self.generate_config();
        
        let length_instruction = match config.style {
            ResponseStyle::Concise => "Sois très concis et direct. Maximum 50 mots.".to_string(),
            ResponseStyle::Balanced => format!("Réponds de manière équilibrée, environ {} mots.", config.target_length),
            ResponseStyle::Detailed => "Fournis une réponse détaillée et exhaustive.".to_string(),
            ResponseStyle::Technical => "Sois précis et technique dans ta réponse.".to_string(),
        };

        let depth_instruction = match config.depth {
            1 => "Reste en surface, réponds simplement.".to_string(),
            2 => "Apporte quelques détails essentiels.".to_string(),
            3 => "Équilibre entre simplicité et profondeur.".to_string(),
            4 => "Approfondis avec des explications détaillées.".to_string(),
            5 => "Analyse en profondeur avec tous les détails.".to_string(),
            _ => "Réponds normalement.".to_string(),
        };

        format!(
            "Instructions d'adaptation TITANE∞:\n\
            - Longueur: {}\n\
            - Profondeur: {}\n\
            - Style: {:?}\n\
            - Vitesse cible: {:.1} mots/sec\n\
            - L'utilisateur préfère des réponses {}.",
            length_instruction,
            depth_instruction,
            config.style,
            config.speech_speed,
            match self.state.style {
                ConversationStyle::Brief => "brèves et directes",
                ConversationStyle::Casual => "conversationnelles et naturelles",
                ConversationStyle::Detailed => "détaillées et complètes",
                ConversationStyle::Technical => "techniques et précises",
                ConversationStyle::Creative => "créatives et expressives",
            }
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_confusion_adaptation() {
        let mut adaptor = ResponseAdaptor::new(ConversationState::default());
        let initial_length = adaptor.state.optimal_length;
        
        adaptor.adapt_to_interruption(&InterruptionCause::Confusion);
        
        assert!(adaptor.state.optimal_length < initial_length);
        assert_eq!(adaptor.state.style, ConversationStyle::Brief);
    }

    #[test]
    fn test_impatience_adaptation() {
        let mut adaptor = ResponseAdaptor::new(ConversationState::default());
        let initial_speed = adaptor.state.preferred_speed;
        
        adaptor.adapt_to_interruption(&InterruptionCause::Impatience);
        
        assert!(adaptor.state.preferred_speed > initial_speed);
        assert!(adaptor.state.optimal_length < 150);
    }

    #[test]
    fn test_response_length_adjustment() {
        let adaptor = ResponseAdaptor::new(ConversationState {
            optimal_length: 20,
            ..Default::default()
        });

        let long_text = "This is a very long response that exceeds the optimal length. \
                         It has multiple sentences. And it needs to be truncated properly. \
                         This should not appear in the final result.";

        let adjusted = adaptor.adjust_response_length(long_text);
        let word_count = adjusted.split_whitespace().count();
        
        assert!(word_count <= 25); // Un peu de marge pour les phrases complètes
    }

    #[test]
    fn test_system_prompt_generation() {
        let adaptor = ResponseAdaptor::new(ConversationState::default());
        let prompt = adaptor.generate_system_prompt();
        
        assert!(prompt.contains("TITANE∞"));
        assert!(prompt.contains("Longueur"));
        assert!(prompt.contains("Profondeur"));
    }

    #[test]
    fn test_pause_insertion() {
        let adaptor = ResponseAdaptor::new(ConversationState::default());
        let text = "First sentence. Second sentence? Third sentence!";
        let with_pauses = adaptor.insert_pause_markers(text);
        
        assert!(with_pauses.contains("[PAUSE_SHORT]"));
    }
}
