// 🔥 TITANE∞ v∞ — Conversational Realism Engine
// Mode: Fluidité autonome & interaction naturelle
// Version: 1.0.0

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ═══════════════════════════════════════════════════════════════
// TYPES & STRUCTURES
// ═══════════════════════════════════════════════════════════════

/// Niveau d'intention détecté dans le message
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum IntentionLevel {
    Explicit,     // Question ou demande directe
    Implicit,     // Besoin sous-jacent (clarté, soutien, structure)
    Exploratory,  // Exploration d'idées
    Confirmatory, // Recherche de validation
}

/// Rythme conversationnel détecté
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ConversationalRhythm {
    Rapid,      // Messages courts et rapides → tension/urgence
    Steady,     // Rythme normal → réflexion équilibrée
    Deliberate, // Messages lents et détaillés → réflexion profonde
    Hesitant,   // Hésitations → besoin de clarification
}

/// Type de relance intelligente
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MicroPrompt {
    Deepen,   // "On approfondit ?"
    Simplify, // "Tu veux une version plus simple ?"
    Clarify,  // "Je peux clarifier un angle précis."
    Continue, // "On continue dans ce sens ?"
    Redirect, // "On recentre sur [sujet] ?"
    None,     // Pas de relance nécessaire
}

/// Demande de traitement réaliste
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RealismRequest {
    pub context: String,                   // Contexte conversationnel récent
    pub user_message: String,              // Message actuel de l'utilisateur
    pub draft_response: String,            // Réponse brouillon à affiner
    pub conversation_history: Vec<String>, // Historique pour détecter patterns
    pub recent_topics: Vec<String>,        // Sujets récents pour liens intelligents
}

/// Réponse avec réalisme conversationnel
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RealismResponse {
    pub finalized_response: String,   // Réponse finale naturelle et fluide
    pub micro_prompt: Option<String>, // Relance optionnelle
    pub detected_rhythm: ConversationalRhythm,
    pub detected_intention: IntentionLevel,
    pub smart_links: Vec<String>, // Liens intelligents détectés
    pub interaction_quality: InteractionQuality,
}

/// Qualité de l'interaction
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InteractionQuality {
    pub fluidity: f32,       // 0-1: fluidité de la transition
    pub autonomy: f32,       // 0-1: initiative pertinente
    pub coherence: f32,      // 0-1: cohérence avec conversation
    pub natural_feel: f32,   // 0-1: ressenti naturel
    pub cognitive_load: f32, // 0-1: charge mentale (bas = mieux)
}

// ═══════════════════════════════════════════════════════════════
// CONVERSATIONAL REALISM PROCESSOR
// ═══════════════════════════════════════════════════════════════

pub struct ConversationalRealismProcessor {
    intention_patterns: HashMap<String, IntentionLevel>,
    rhythm_thresholds: RhythmThresholds,
}

struct RhythmThresholds {
    rapid_max_words: usize,      // Messages rapides: < X mots
    deliberate_min_words: usize, // Messages délibérés: > X mots
}

impl ConversationalRealismProcessor {
    pub fn new() -> Self {
        let mut intention_patterns = HashMap::new();

        // Patterns pour détection d'intention explicite
        intention_patterns.insert("comment".to_string(), IntentionLevel::Explicit);
        intention_patterns.insert("quoi".to_string(), IntentionLevel::Explicit);
        intention_patterns.insert("pourquoi".to_string(), IntentionLevel::Explicit);
        intention_patterns.insert("?".to_string(), IntentionLevel::Explicit);

        // Patterns pour intention implicite
        intention_patterns.insert("bloqué".to_string(), IntentionLevel::Implicit);
        intention_patterns.insert("flemme".to_string(), IntentionLevel::Implicit);
        intention_patterns.insert("pas sûr".to_string(), IntentionLevel::Implicit);

        // Patterns exploratoires
        intention_patterns.insert("peut-être".to_string(), IntentionLevel::Exploratory);
        intention_patterns.insert("je pense".to_string(), IntentionLevel::Exploratory);
        intention_patterns.insert("idée".to_string(), IntentionLevel::Exploratory);

        Self {
            intention_patterns,
            rhythm_thresholds: RhythmThresholds {
                rapid_max_words: 10,
                deliberate_min_words: 50,
            },
        }
    }

    /// Processus principal: applique le réalisme conversationnel
    pub async fn process(&self, request: RealismRequest) -> RealismResponse {
        // 1️⃣ Détecter rythme et intention
        let rhythm = self.detect_rhythm(&request.user_message);
        let intention = self.detect_intention(&request.user_message);

        // 2️⃣ Créer liens intelligents
        let smart_links = self.create_smart_links(&request.recent_topics, &request.context);

        // 3️⃣ Appliquer transitions fluides
        let finalized =
            self.apply_fluid_transition(&request.draft_response, &rhythm, &intention, &smart_links);

        // 4️⃣ Générer micro-relance si pertinente
        let micro_prompt = self.generate_micro_prompt(&intention, &rhythm);

        // 5️⃣ Calculer qualité d'interaction
        let interaction_quality =
            self.evaluate_interaction_quality(&finalized, &request.user_message, &rhythm);

        RealismResponse {
            finalized_response: finalized,
            micro_prompt,
            detected_rhythm: rhythm,
            detected_intention: intention,
            smart_links,
            interaction_quality,
        }
    }

    // ─────────────────────────────────────────────────────────
    // DÉTECTION DU RYTHME
    // ─────────────────────────────────────────────────────────

    fn detect_rhythm(&self, message: &str) -> ConversationalRhythm {
        let word_count = message.split_whitespace().count();
        let has_hesitation =
            message.contains("...") || message.contains("euh") || message.contains("hm");

        if has_hesitation {
            ConversationalRhythm::Hesitant
        } else if word_count < self.rhythm_thresholds.rapid_max_words {
            ConversationalRhythm::Rapid
        } else if word_count > self.rhythm_thresholds.deliberate_min_words {
            ConversationalRhythm::Deliberate
        } else {
            ConversationalRhythm::Steady
        }
    }

    // ─────────────────────────────────────────────────────────
    // DÉTECTION D'INTENTION
    // ─────────────────────────────────────────────────────────

    fn detect_intention(&self, message: &str) -> IntentionLevel {
        let lower = message.to_lowercase();

        // Chercher patterns explicites
        for (pattern, level) in &self.intention_patterns {
            if lower.contains(pattern) {
                return level.clone();
            }
        }

        // Par défaut: exploration si pas de pattern trouvé
        IntentionLevel::Exploratory
    }

    // ─────────────────────────────────────────────────────────
    // LIENS INTELLIGENTS
    // ─────────────────────────────────────────────────────────

    fn create_smart_links(&self, recent_topics: &[String], context: &str) -> Vec<String> {
        let mut links = Vec::new();

        // Rechercher mentions de moteurs TITANE
        let engines = vec![
            "MemoryEngine",
            "SingularityState",
            "IdentityEngine",
            "Self-Healing",
            "API Neutralizer",
            "Conversation Engine",
        ];

        for engine in engines {
            if context.contains(engine) {
                links.push(format!("Lien avec {}", engine));
            }
        }

        // Lier aux sujets récents pertinents
        for topic in recent_topics.iter().take(3) {
            if context.to_lowercase().contains(&topic.to_lowercase()) {
                links.push(format!("Résonne avec: {}", topic));
            }
        }

        links
    }

    // ─────────────────────────────────────────────────────────
    // TRANSITIONS FLUIDES
    // ─────────────────────────────────────────────────────────

    fn apply_fluid_transition(
        &self,
        draft: &str,
        rhythm: &ConversationalRhythm,
        intention: &IntentionLevel,
        smart_links: &[String],
    ) -> String {
        let mut result = draft.to_string();

        // Adapter selon rythme détecté
        match rhythm {
            ConversationalRhythm::Rapid => {
                // Style direct, phrases courtes
                result = self.make_concise(&result);
            }
            ConversationalRhythm::Deliberate => {
                // Style développé, posé
                result = self.add_depth(&result);
            }
            ConversationalRhythm::Hesitant => {
                // Clarifier calmement
                result = self.add_clarification(&result);
            }
            ConversationalRhythm::Steady => {
                // Garder équilibre
            }
        }

        // Ajouter liens si pertinents
        if !smart_links.is_empty() && matches!(intention, IntentionLevel::Exploratory) {
            let link_text = smart_links.first().unwrap();
            result.push_str(&format!("\n\n{}", link_text));
        }

        result
    }

    fn make_concise(&self, text: &str) -> String {
        // Garder points essentiels, structure en liste
        let sentences: Vec<&str> = text.split('.').filter(|s| !s.trim().is_empty()).collect();

        if sentences.len() > 3 {
            // Prendre les 3 phrases les plus importantes
            format!(
                "{}.\n{}.\n{}.",
                sentences[0].trim(),
                sentences[sentences.len() / 2].trim(),
                sentences.last().unwrap().trim()
            )
        } else {
            text.to_string()
        }
    }

    fn add_depth(&self, text: &str) -> String {
        // Ajouter nuances et développements
        if text.len() < 200 {
            format!(
                "{}\n\nCette approche présente plusieurs avantages stratégiques.",
                text
            )
        } else {
            text.to_string()
        }
    }

    fn add_clarification(&self, text: &str) -> String {
        // Reformuler calmement pour clarifier
        format!("Reprenons calmement.\n\n{}", text)
    }

    // ─────────────────────────────────────────────────────────
    // MICRO-RELANCES
    // ─────────────────────────────────────────────────────────

    fn generate_micro_prompt(
        &self,
        intention: &IntentionLevel,
        rhythm: &ConversationalRhythm,
    ) -> Option<String> {
        match (intention, rhythm) {
            (IntentionLevel::Exploratory, ConversationalRhythm::Steady) => {
                Some("On approfondit ?".to_string())
            }
            (IntentionLevel::Implicit, ConversationalRhythm::Rapid) => {
                Some("Tu veux une version plus simple ?".to_string())
            }
            (IntentionLevel::Exploratory, ConversationalRhythm::Hesitant) => {
                Some("Je peux clarifier un angle précis.".to_string())
            }
            (_, ConversationalRhythm::Deliberate) => Some("On continue dans ce sens ?".to_string()),
            _ => None,
        }
    }

    // ─────────────────────────────────────────────────────────
    // ÉVALUATION QUALITÉ
    // ─────────────────────────────────────────────────────────

    fn evaluate_interaction_quality(
        &self,
        response: &str,
        user_message: &str,
        rhythm: &ConversationalRhythm,
    ) -> InteractionQuality {
        // Fluidité: basée sur transitions naturelles
        let fluidity = if response.contains("Reprenons") || response.contains("Ce que tu") {
            0.9
        } else {
            0.7
        };

        // Autonomie: détection d'initiatives
        let autonomy = if response.contains("On peut") || response.contains("Je suggère") {
            0.85
        } else {
            0.6
        };

        // Cohérence: longueur adaptée au rythme
        let response_words = response.split_whitespace().count();
        let user_words = user_message.split_whitespace().count();
        let coherence = match rhythm {
            ConversationalRhythm::Rapid if response_words < 50 => 0.95,
            ConversationalRhythm::Deliberate if response_words > 100 => 0.9,
            _ => 0.75,
        };

        // Ressenti naturel: absence d'artifice
        let natural_feel = if response.contains("!") || response.contains("super") {
            0.6 // Trop enthousiaste
        } else {
            0.85
        };

        // Charge cognitive: simplicité du langage
        let cognitive_load = if response_words > 200 {
            0.7 // Charge élevée
        } else if response_words < 30 {
            0.3 // Charge faible
        } else {
            0.5 // Charge moyenne
        };

        InteractionQuality {
            fluidity,
            autonomy,
            coherence,
            natural_feel,
            cognitive_load,
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_rhythm_detection_rapid() {
        let processor = ConversationalRealismProcessor::new();
        let rhythm = processor.detect_rhythm("Bloqué.");
        assert_eq!(rhythm, ConversationalRhythm::Rapid);
    }

    #[tokio::test]
    async fn test_rhythm_detection_hesitant() {
        let processor = ConversationalRealismProcessor::new();
        let rhythm = processor.detect_rhythm("Euh... je sais pas trop...");
        assert_eq!(rhythm, ConversationalRhythm::Hesitant);
    }

    #[tokio::test]
    async fn test_intention_detection_explicit() {
        let processor = ConversationalRealismProcessor::new();
        let intention = processor.detect_intention("Comment faire ça ?");
        assert_eq!(intention, IntentionLevel::Explicit);
    }

    #[tokio::test]
    async fn test_smart_links() {
        let processor = ConversationalRealismProcessor::new();
        let topics = vec!["Architecture".to_string(), "Memory".to_string()];
        let context = "On travaille sur l'Architecture TITANE";
        let links = processor.create_smart_links(&topics, context);
        assert!(!links.is_empty());
    }

    #[tokio::test]
    async fn test_full_process() {
        let processor = ConversationalRealismProcessor::new();
        let request = RealismRequest {
            context: "Discussion sur l'architecture".to_string(),
            user_message: "Bloqué sur la mémoire.".to_string(),
            draft_response: "Voici trois options pour gérer la mémoire.".to_string(),
            conversation_history: vec![],
            recent_topics: vec!["MemoryEngine".to_string()],
        };

        let response = processor.process(request).await;
        assert!(!response.finalized_response.is_empty());
        assert_eq!(response.detected_rhythm, ConversationalRhythm::Rapid);
    }
}
