// TITANE∞ v12 - Harmonia Module
// Emotional and contextual balance for natural conversations

use super::ModuleStatus;
use log::info;

pub struct Harmonia {
    active: bool,
    health: f32,
    emotional_state: EmotionalState,
}

#[derive(Debug, Clone)]
pub struct EmotionalState {
    pub valence: f32,      // -1.0 (negative) to 1.0 (positive)
    pub arousal: f32,      // 0.0 (calm) to 1.0 (excited)
    pub coherence: f32,    // 0.0 (disjointed) to 1.0 (coherent)
    pub engagement: f32,   // 0.0 (disengaged) to 1.0 (engaged)
}

impl Default for EmotionalState {
    fn default() -> Self {
        Self {
            valence: 0.5,
            arousal: 0.4,
            coherence: 0.8,
            engagement: 0.7,
        }
    }
}

impl Harmonia {
    pub fn new() -> Self {
        info!("Harmonia emotional balance module initialized");
        Self {
            active: true,
            health: 1.0,
            emotional_state: EmotionalState::default(),
        }
    }

    pub fn analyze_context(&self, text: &str) -> ContextAnalysis {
        let sentiment = self.analyze_sentiment(text);
        let tone = self.detect_tone(text);
        let complexity = self.calculate_complexity(text);

        ContextAnalysis {
            sentiment,
            tone,
            complexity,
            emotional_weight: self.emotional_state.valence,
        }
    }

    fn analyze_sentiment(&self, text: &str) -> f32 {
        // Simple sentiment analysis based on keywords
        let positive_words = ["bien", "merci", "super", "génial", "excellent", "parfait"];
        let negative_words = ["mal", "problème", "erreur", "bug", "cassé", "mauvais"];

        let text_lower = text.to_lowercase();
        let mut score = 0.0;

        for word in positive_words {
            if text_lower.contains(word) {
                score += 0.2;
            }
        }

        for word in negative_words {
            if text_lower.contains(word) {
                score -= 0.2;
            }
        }

        score.clamp(-1.0, 1.0)
    }

    fn detect_tone(&self, text: &str) -> Tone {
        if text.contains('?') {
            Tone::Questioning
        } else if text.contains('!') {
            Tone::Emphatic
        } else if text.len() < 20 {
            Tone::Casual
        } else {
            Tone::Formal
        }
    }

    fn calculate_complexity(&self, text: &str) -> f32 {
        let word_count = text.split_whitespace().count() as f32;
        let sentence_count = text.split(&['.', '!', '?'][..]).count() as f32;
        let avg_word_length = text.len() as f32 / word_count.max(1.0);

        ((word_count / sentence_count.max(1.0)) * avg_word_length / 100.0).clamp(0.0, 1.0)
    }

    pub fn balance_response(&self, response: &str, context: &ContextAnalysis) -> String {
        // Adjust response based on context
        let mut balanced = response.to_string();

        // Match tone
        match context.tone {
            Tone::Emphatic => {
                if !balanced.contains('!') {
                    balanced.push('!');
                }
            }
            Tone::Questioning => {
                // Add clarifying statements
                if context.sentiment < 0.0 {
                    balanced.push_str(" Je suis là pour vous aider.");
                }
            }
            _ => {}
        }

        balanced
    }

    pub fn update_emotional_state(&mut self, interaction_result: &InteractionResult) {
        // Update emotional state based on interaction
        self.emotional_state.valence =
            (self.emotional_state.valence * 0.8 + interaction_result.user_satisfaction * 0.2)
                .clamp(-1.0, 1.0);

        self.emotional_state.engagement =
            (self.emotional_state.engagement * 0.9 + interaction_result.engagement * 0.1)
                .clamp(0.0, 1.0);

        self.emotional_state.coherence =
            (self.emotional_state.coherence * 0.95 + interaction_result.coherence * 0.05)
                .clamp(0.0, 1.0);
    }

    pub fn get_status(&self) -> ModuleStatus {
        ModuleStatus {
            name: "Harmonia".to_string(),
            active: self.active,
            health: self.health,
            last_check: chrono::Utc::now().timestamp(),
        }
    }

    pub fn get_emotional_state(&self) -> &EmotionalState {
        &self.emotional_state
    }
}

impl Default for Harmonia {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone)]
pub struct ContextAnalysis {
    pub sentiment: f32,
    pub tone: Tone,
    pub complexity: f32,
    pub emotional_weight: f32,
}

#[derive(Debug, Clone, Copy)]
pub enum Tone {
    Casual,
    Formal,
    Questioning,
    Emphatic,
}

#[derive(Debug, Clone)]
pub struct InteractionResult {
    pub user_satisfaction: f32,
    pub engagement: f32,
    pub coherence: f32,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_harmonia_creation() {
        let harmonia = Harmonia::new();
        assert!(harmonia.active);
    }

    #[test]
    fn test_sentiment_analysis() {
        let harmonia = Harmonia::new();
        let positive = harmonia.analyze_sentiment("C'est super, merci beaucoup!");
        assert!(positive > 0.0);

        let negative = harmonia.analyze_sentiment("Il y a un problème, c'est cassé");
        assert!(negative < 0.0);
    }

    #[test]
    fn test_tone_detection() {
        let harmonia = Harmonia::new();
        let analysis = harmonia.analyze_context("Comment ça marche?");
        assert!(matches!(analysis.tone, Tone::Questioning));
    }
}
