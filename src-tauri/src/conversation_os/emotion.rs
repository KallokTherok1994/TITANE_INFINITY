//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — EMOTION ENGINE
//! Super Prompt #9 — Détection et gestion des émotions dans la conversation
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use super::MemoryContext;

/// Tonalité émotionnelle détectée
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum EmotionalTone {
    Neutral,
    Positive,
    Negative,
    Excited,
    Frustrated,
    Curious,
    Anxious,
    Grateful,
    Confused,
    Urgent,
}

impl Default for EmotionalTone {
    fn default() -> Self {
        Self::Neutral
    }
}

/// État émotionnel complet
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct EmotionalState {
    /// Ton principal
    pub primary_tone: EmotionalTone,
    /// Ton secondaire (si mixte)
    pub secondary_tone: Option<EmotionalTone>,
    /// Intensité (0.0-1.0)
    pub intensity: f32,
    /// Confiance dans la détection
    pub confidence: f32,
    /// Mots indicateurs détectés
    pub indicators: Vec<String>,
    /// Suggestion de réponse émotionnelle
    pub suggested_response_tone: ResponseTone,
}

/// Ton de réponse suggéré
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub enum ResponseTone {
    #[default]
    Neutral,
    Empathetic,
    Encouraging,
    Calming,
    Professional,
    Enthusiastic,
    Supportive,
}

/// Moteur d'émotion
pub struct EmotionEngine {
    /// Dictionnaire d'émotions
    emotion_lexicon: EmotionLexicon,
    /// Seuil de détection
    detection_threshold: f32,
}

struct EmotionLexicon {
    positive: Vec<&'static str>,
    negative: Vec<&'static str>,
    frustrated: Vec<&'static str>,
    curious: Vec<&'static str>,
    anxious: Vec<&'static str>,
    grateful: Vec<&'static str>,
    confused: Vec<&'static str>,
    urgent: Vec<&'static str>,
    excited: Vec<&'static str>,
}

impl EmotionLexicon {
    fn new() -> Self {
        Self {
            positive: vec![
                "merci", "super", "génial", "parfait", "excellent", "bravo",
                "thanks", "great", "awesome", "perfect", "excellent", "amazing",
                "bien", "good", "nice", "love", "aime", "content", "happy",
            ],
            negative: vec![
                "mauvais", "bad", "terrible", "awful", "hate", "déteste",
                "nul", "horrible", "worst", "pire", "disappointing",
            ],
            frustrated: vec![
                "frustré", "frustrated", "énervé", "angry", "agacé", "annoyed",
                "marre", "fed up", "ça marche pas", "doesn't work", "encore",
                "again", "toujours pas", "still not", "impossible",
            ],
            curious: vec![
                "comment", "how", "pourquoi", "why", "qu'est-ce", "what",
                "curieux", "curious", "intéressant", "interesting", "wonder",
                "me demande", "savoir", "know", "apprendre", "learn",
            ],
            anxious: vec![
                "inquiet", "worried", "anxieux", "anxious", "peur", "afraid",
                "stress", "stressed", "nerveux", "nervous", "urgent",
                "deadline", "délai", "risque", "risk",
            ],
            grateful: vec![
                "merci beaucoup", "thank you so much", "reconnaissant", "grateful",
                "apprécié", "appreciated", "génial merci", "thanks a lot",
            ],
            confused: vec![
                "confus", "confused", "comprends pas", "don't understand",
                "pas clair", "unclear", "perdu", "lost", "hein", "what",
                "bizarre", "strange", "weird",
            ],
            urgent: vec![
                "urgent", "urgently", "immédiatement", "immediately", "asap",
                "vite", "quickly", "maintenant", "now", "critique", "critical",
            ],
            excited: vec![
                "excité", "excited", "hâte", "can't wait", "incroyable",
                "incredible", "wow", "impressionnant", "impressive", "!!!",
            ],
        }
    }
}

impl EmotionEngine {
    pub fn new() -> Self {
        Self {
            emotion_lexicon: EmotionLexicon::new(),
            detection_threshold: 0.2,
        }
    }

    /// Analyse le texte pour détecter les émotions
    pub async fn analyze(&self, input: &str, _memory_ctx: &MemoryContext) -> EmotionalState {
        let input_lower = input.to_lowercase();
        let mut scores: Vec<(EmotionalTone, f32, Vec<String>)> = Vec::new();

        // Analyser chaque catégorie
        let positive = self.score_category(&input_lower, &self.emotion_lexicon.positive);
        if positive.0 > 0.0 {
            scores.push((EmotionalTone::Positive, positive.0, positive.1));
        }

        let negative = self.score_category(&input_lower, &self.emotion_lexicon.negative);
        if negative.0 > 0.0 {
            scores.push((EmotionalTone::Negative, negative.0, negative.1));
        }

        let frustrated = self.score_category(&input_lower, &self.emotion_lexicon.frustrated);
        if frustrated.0 > 0.0 {
            scores.push((EmotionalTone::Frustrated, frustrated.0, frustrated.1));
        }

        let curious = self.score_category(&input_lower, &self.emotion_lexicon.curious);
        if curious.0 > 0.0 {
            scores.push((EmotionalTone::Curious, curious.0, curious.1));
        }

        let anxious = self.score_category(&input_lower, &self.emotion_lexicon.anxious);
        if anxious.0 > 0.0 {
            scores.push((EmotionalTone::Anxious, anxious.0, anxious.1));
        }

        let grateful = self.score_category(&input_lower, &self.emotion_lexicon.grateful);
        if grateful.0 > 0.0 {
            scores.push((EmotionalTone::Grateful, grateful.0, grateful.1));
        }

        let confused = self.score_category(&input_lower, &self.emotion_lexicon.confused);
        if confused.0 > 0.0 {
            scores.push((EmotionalTone::Confused, confused.0, confused.1));
        }

        let urgent = self.score_category(&input_lower, &self.emotion_lexicon.urgent);
        if urgent.0 > 0.0 {
            scores.push((EmotionalTone::Urgent, urgent.0, urgent.1));
        }

        let excited = self.score_category(&input_lower, &self.emotion_lexicon.excited);
        if excited.0 > 0.0 {
            scores.push((EmotionalTone::Excited, excited.0, excited.1));
        }

        // Trier par score
        scores.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

        // Déterminer l'état émotionnel
        if scores.is_empty() || scores[0].1 < self.detection_threshold {
            return EmotionalState::default();
        }

        let (primary_tone, intensity, indicators) = scores.remove(0);
        let secondary_tone = scores.first()
            .filter(|(_, score, _)| *score >= self.detection_threshold)
            .map(|(tone, _, _)| tone.clone());

        let suggested_response = self.suggest_response_tone(&primary_tone);

        EmotionalState {
            primary_tone,
            secondary_tone,
            intensity: intensity.min(1.0),
            confidence: 0.7, // Confiance moyenne pour analyse lexicale
            indicators,
            suggested_response_tone: suggested_response,
        }
    }

    /// Score une catégorie émotionnelle
    fn score_category(&self, input: &str, keywords: &[&str]) -> (f32, Vec<String>) {
        let mut found = Vec::new();
        let mut score = 0.0;

        for keyword in keywords {
            if input.contains(keyword) {
                found.push(keyword.to_string());
                score += 0.2;
            }
        }

        // Bonus pour les indicateurs forts (ponctuation)
        if input.contains('!') {
            score += 0.1;
        }
        if input.to_uppercase() == input && input.len() > 5 {
            score += 0.15; // Tout en majuscules
        }

        (score, found)
    }

    /// Suggère un ton de réponse approprié
    fn suggest_response_tone(&self, emotion: &EmotionalTone) -> ResponseTone {
        match emotion {
            EmotionalTone::Frustrated => ResponseTone::Calming,
            EmotionalTone::Anxious => ResponseTone::Supportive,
            EmotionalTone::Confused => ResponseTone::Professional,
            EmotionalTone::Curious => ResponseTone::Enthusiastic,
            EmotionalTone::Positive | EmotionalTone::Excited => ResponseTone::Enthusiastic,
            EmotionalTone::Grateful => ResponseTone::Neutral,
            EmotionalTone::Negative => ResponseTone::Empathetic,
            EmotionalTone::Urgent => ResponseTone::Professional,
            EmotionalTone::Neutral => ResponseTone::Neutral,
        }
    }

    /// Modifie le texte pour refléter le ton de réponse
    pub fn apply_tone(&self, text: &str, tone: &ResponseTone) -> String {
        match tone {
            ResponseTone::Empathetic => {
                if !text.starts_with("Je comprends") && !text.starts_with("I understand") {
                    format!("Je comprends. {}", text)
                } else {
                    text.to_string()
                }
            }
            ResponseTone::Encouraging => {
                format!("{} Vous pouvez y arriver!", text.trim_end_matches('.'))
            }
            ResponseTone::Calming => {
                format!("Pas d'inquiétude. {}", text)
            }
            ResponseTone::Supportive => {
                format!("Je suis là pour vous aider. {}", text)
            }
            ResponseTone::Enthusiastic => {
                format!("{}!", text.trim_end_matches('.').trim_end_matches('!'))
            }
            _ => text.to_string(),
        }
    }
}

impl Default for EmotionEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_positive_emotion() {
        let engine = EmotionEngine::new();
        let memory = MemoryContext::default();

        let state = engine.analyze("Merci beaucoup, c'est super!", &memory).await;
        assert!(state.primary_tone == EmotionalTone::Positive ||
                state.primary_tone == EmotionalTone::Grateful);
    }

    #[tokio::test]
    async fn test_frustrated_emotion() {
        let engine = EmotionEngine::new();
        let memory = MemoryContext::default();

        let state = engine.analyze("Je suis frustré, ça marche pas encore!", &memory).await;
        assert_eq!(state.primary_tone, EmotionalTone::Frustrated);
    }

    #[tokio::test]
    async fn test_neutral_emotion() {
        let engine = EmotionEngine::new();
        let memory = MemoryContext::default();

        let state = engine.analyze("Peux-tu me donner la date?", &memory).await;
        // Pourrait être Neutral ou Curious
        assert!(state.intensity <= 0.5);
    }
}
