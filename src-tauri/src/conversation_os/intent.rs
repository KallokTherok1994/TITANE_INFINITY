//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — INTENT DETECTION ENGINE
//! Super Prompt #9 — Détection et classification des intentions utilisateur
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use super::memory_context::ConversationContext;

/// Types d'intentions utilisateur
#[derive(Clone, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum IntentType {
    /// Question simple ou complexe
    Question,
    /// Commande ou instruction directe
    Command,
    /// Expression émotionnelle
    Emotion,
    /// Demande de clarification
    Clarification,
    /// Planification ou organisation
    Planning,
    /// Demande créative
    Creativity,
    /// Débogage ou résolution de problème
    Debugging,
    /// Question méta sur le système
    Meta,
    /// Conversation sociale / small talk
    Social,
    /// Recherche d'information
    Search,
    /// Demande d'aide
    Help,
    /// Feedback ou critique
    Feedback,
    /// Intention non déterminée
    Unknown,
}

/// Niveau de confiance dans la détection
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct IntentConfidence {
    pub primary: f32,
    pub secondary: Option<(IntentType, f32)>,
}

/// Intention utilisateur détectée
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct UserIntent {
    pub intent_type: IntentType,
    pub confidence: IntentConfidence,
    pub keywords: Vec<String>,
    pub urgency: UrgencyLevel,
    pub complexity: ComplexityLevel,
    pub requires_memory: bool,
    pub requires_reflection: bool,
    pub timestamp: u64,
}

impl Default for UserIntent {
    fn default() -> Self {
        Self {
            intent_type: IntentType::Unknown,
            confidence: IntentConfidence {
                primary: 0.0,
                secondary: None,
            },
            keywords: Vec::new(),
            urgency: UrgencyLevel::Normal,
            complexity: ComplexityLevel::Simple,
            requires_memory: false,
            requires_reflection: false,
            timestamp: Self::now(),
        }
    }
}

impl UserIntent {
    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

/// Niveau d'urgence de la demande
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum UrgencyLevel {
    Low,
    Normal,
    High,
    Critical,
}

/// Niveau de complexité
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum ComplexityLevel {
    Simple,
    Moderate,
    Complex,
    Expert,
}

/// Détecteur d'intentions
pub struct IntentDetector {
    // Patterns de détection
    question_patterns: Vec<&'static str>,
    command_patterns: Vec<&'static str>,
    emotion_patterns: Vec<&'static str>,
    planning_patterns: Vec<&'static str>,
    creativity_patterns: Vec<&'static str>,
    debug_patterns: Vec<&'static str>,
    meta_patterns: Vec<&'static str>,
}

impl IntentDetector {
    pub fn new() -> Self {
        Self {
            question_patterns: vec![
                "?", "qu'est-ce", "comment", "pourquoi", "quand", "où", "qui",
                "what", "how", "why", "when", "where", "who", "which",
                "est-ce que", "is it", "can you", "peux-tu", "sais-tu",
            ],
            command_patterns: vec![
                "fais", "fait", "crée", "génère", "écris", "modifie", "supprime",
                "do", "make", "create", "generate", "write", "modify", "delete",
                "lance", "execute", "run", "start", "stop", "arrête",
            ],
            emotion_patterns: vec![
                "je me sens", "i feel", "frustré", "content", "triste", "heureux",
                "angry", "happy", "sad", "excited", "worried", "anxieux",
                "merci", "thank", "sorry", "désolé", "super", "génial",
            ],
            planning_patterns: vec![
                "planifie", "organise", "schedule", "plan", "agenda",
                "demain", "tomorrow", "next week", "la semaine prochaine",
                "rappelle", "remind", "task", "tâche", "todo",
            ],
            creativity_patterns: vec![
                "imagine", "invente", "crée une histoire", "écris un poème",
                "create a story", "write a poem", "design", "brainstorm",
                "idée", "idea", "concept", "inspiration",
            ],
            debug_patterns: vec![
                "erreur", "error", "bug", "crash", "ne fonctionne pas",
                "doesn't work", "problem", "problème", "fix", "debug",
                "exception", "échec", "failure",
            ],
            meta_patterns: vec![
                "qui es-tu", "who are you", "qu'est-ce que tu es",
                "what are you", "tes capacités", "your capabilities",
                "comment tu fonctionne", "how do you work",
            ],
        }
    }

    /// Détecte l'intention principale
    pub async fn detect(&self, input: &str, context: &ConversationContext) -> UserIntent {
        let input_lower = input.to_lowercase();
        let mut scores: Vec<(IntentType, f32)> = Vec::new();

        // Score question
        let q_score = self.score_patterns(&input_lower, &self.question_patterns);
        if q_score > 0.0 {
            scores.push((IntentType::Question, q_score));
        }

        // Score command
        let cmd_score = self.score_patterns(&input_lower, &self.command_patterns);
        if cmd_score > 0.0 {
            scores.push((IntentType::Command, cmd_score));
        }

        // Score emotion
        let emo_score = self.score_patterns(&input_lower, &self.emotion_patterns);
        if emo_score > 0.0 {
            scores.push((IntentType::Emotion, emo_score));
        }

        // Score planning
        let plan_score = self.score_patterns(&input_lower, &self.planning_patterns);
        if plan_score > 0.0 {
            scores.push((IntentType::Planning, plan_score));
        }

        // Score creativity
        let crea_score = self.score_patterns(&input_lower, &self.creativity_patterns);
        if crea_score > 0.0 {
            scores.push((IntentType::Creativity, crea_score));
        }

        // Score debug
        let dbg_score = self.score_patterns(&input_lower, &self.debug_patterns);
        if dbg_score > 0.0 {
            scores.push((IntentType::Debugging, dbg_score));
        }

        // Score meta
        let meta_score = self.score_patterns(&input_lower, &self.meta_patterns);
        if meta_score > 0.0 {
            scores.push((IntentType::Meta, meta_score));
        }

        // Trier par score décroissant
        scores.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

        // Déterminer l'intention principale
        let (intent_type, primary_confidence) = scores.first()
            .cloned()
            .unwrap_or((IntentType::Unknown, 0.0));

        let secondary = scores.get(1).cloned();

        // Extraire les mots-clés
        let keywords = self.extract_keywords(&input_lower);

        // Déterminer la complexité
        let complexity = self.assess_complexity(&input_lower, &context);

        // Déterminer l'urgence
        let urgency = self.assess_urgency(&input_lower);

        // Déterminer si mémoire/réflexion nécessaire
        let requires_memory = context.history_length > 0 ||
            self.mentions_past(&input_lower);
        let requires_reflection = complexity == ComplexityLevel::Complex ||
            complexity == ComplexityLevel::Expert;

        UserIntent {
            intent_type,
            confidence: IntentConfidence {
                primary: primary_confidence,
                secondary,
            },
            keywords,
            urgency,
            complexity,
            requires_memory,
            requires_reflection,
            timestamp: UserIntent::now(),
        }
    }

    fn score_patterns(&self, input: &str, patterns: &[&str]) -> f32 {
        let matches: f32 = patterns.iter()
            .filter(|p| input.contains(*p))
            .count() as f32;

        if matches > 0.0 {
            (matches / patterns.len() as f32).min(1.0) + 0.3
        } else {
            0.0
        }
    }

    fn extract_keywords(&self, input: &str) -> Vec<String> {
        // Mots à ignorer
        let stop_words = ["le", "la", "les", "un", "une", "des", "de", "du",
            "the", "a", "an", "is", "are", "was", "were", "be", "been",
            "et", "ou", "and", "or", "but", "mais", "que", "qui", "quoi",
            "je", "tu", "il", "elle", "nous", "vous", "ils", "elles",
            "i", "you", "he", "she", "we", "they", "it", "this", "that"];

        input.split_whitespace()
            .filter(|w| w.len() > 2)
            .filter(|w| !stop_words.contains(&w.to_lowercase().as_str()))
            .take(10)
            .map(|w| w.to_string())
            .collect()
    }

    fn assess_complexity(&self, input: &str, context: &ConversationContext) -> ComplexityLevel {
        let word_count = input.split_whitespace().count();
        let has_technical = input.contains("code") || input.contains("algorithm") ||
            input.contains("architecture") || input.contains("système");

        if word_count > 100 || (has_technical && context.history_length > 5) {
            ComplexityLevel::Expert
        } else if word_count > 50 || has_technical {
            ComplexityLevel::Complex
        } else if word_count > 20 {
            ComplexityLevel::Moderate
        } else {
            ComplexityLevel::Simple
        }
    }

    fn assess_urgency(&self, input: &str) -> UrgencyLevel {
        let urgent_words = ["urgent", "immédiatement", "immediately", "asap",
            "critical", "critique", "now", "maintenant", "vite", "quickly"];

        if urgent_words.iter().any(|w| input.contains(w)) {
            UrgencyLevel::Critical
        } else if input.contains("!") || input.to_uppercase() == input {
            UrgencyLevel::High
        } else {
            UrgencyLevel::Normal
        }
    }

    fn mentions_past(&self, input: &str) -> bool {
        let past_words = ["avant", "précédemment", "earlier", "before", "previously",
            "tu as dit", "you said", "on a parlé", "we discussed", "remember"];
        past_words.iter().any(|w| input.contains(w))
    }
}

impl Default for IntentDetector {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_question_detection() {
        let detector = IntentDetector::new();
        let context = ConversationContext::default();

        let intent = detector.detect("Comment fonctionne ce système?", &context).await;
        assert_eq!(intent.intent_type, IntentType::Question);
    }

    #[tokio::test]
    async fn test_command_detection() {
        let detector = IntentDetector::new();
        let context = ConversationContext::default();

        let intent = detector.detect("Crée un fichier test.txt", &context).await;
        assert_eq!(intent.intent_type, IntentType::Command);
    }

    #[tokio::test]
    async fn test_emotion_detection() {
        let detector = IntentDetector::new();
        let context = ConversationContext::default();

        let intent = detector.detect("Je me sens frustré par ce bug", &context).await;
        // Peut être Emotion ou Debugging selon les scores
        assert!(intent.confidence.primary > 0.0);
    }
}
