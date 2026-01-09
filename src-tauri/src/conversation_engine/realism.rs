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
                // Tune thresholds so tests map:
                // - "Bloqué sur la mémoire." (~4 words) => Rapid
                // - medium sentence (~6-8 words) => Steady
                // - long paragraph => Deliberate
                rapid_max_words: 5,
                deliberate_min_words: 25,
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
        let lower = message.to_lowercase();
        let has_hesitation = message.contains("...") || lower.contains("euh") || lower.contains("hm");

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
            if let Some(link_text) = smart_links.first() {
                result.push_str(&format!("\n\n{}", link_text));
            }
        }

        result
    }

    fn make_concise(&self, text: &str) -> String {
        // Garder points essentiels, structure en liste
        let sentences: Vec<&str> = text.split('.').filter(|s| !s.trim().is_empty()).collect();

        if sentences.len() > 3 {
            // Prendre les 3 phrases les plus importantes
            let last_sentence = sentences.last().copied().unwrap_or("");
            format!(
                "{}.\n{}.\n{}.",
                sentences[0].trim(),
                sentences[sentences.len() / 2].trim(),
                last_sentence.trim()
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
        let coherence = match rhythm {
            ConversationalRhythm::Rapid if response_words < 50 => 0.95,
            // Deliberate answers don't need to be extremely long to be coherent.
            ConversationalRhythm::Deliberate if response_words >= 40 => 0.9,
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

    #[test]
    fn test_rhythm_detection_deliberate() {
        let processor = ConversationalRealismProcessor::new();
        let long_message = "Je suis en train de réfléchir profondément à la manière dont nous pourrions architecturer ce système de mémoire de façon optimale. Il y a plusieurs angles à considérer, notamment la persistance, la cohérence, et la performance. J'aimerais explorer ces différentes dimensions avec toi.";
        let rhythm = processor.detect_rhythm(long_message);
        assert_eq!(rhythm, ConversationalRhythm::Deliberate);
    }

    #[test]
    fn test_rhythm_detection_steady() {
        let processor = ConversationalRealismProcessor::new();
        let medium_message = "Je pense qu'on pourrait faire ça autrement";
        let rhythm = processor.detect_rhythm(medium_message);
        assert_eq!(rhythm, ConversationalRhythm::Steady);
    }

    #[test]
    fn test_rhythm_detection_with_ellipsis() {
        let processor = ConversationalRealismProcessor::new();
        let hesitant_message = "Je me demandais si...";
        let rhythm = processor.detect_rhythm(hesitant_message);
        assert_eq!(rhythm, ConversationalRhythm::Hesitant);
    }

    #[test]
    fn test_rhythm_detection_with_hm() {
        let processor = ConversationalRealismProcessor::new();
        let rhythm = processor.detect_rhythm("Hm, je sais pas");
        assert_eq!(rhythm, ConversationalRhythm::Hesitant);
    }

    #[test]
    fn test_intention_detection_implicit() {
        let processor = ConversationalRealismProcessor::new();
        let intention = processor.detect_intention("Je suis bloqué sur ce problème");
        assert_eq!(intention, IntentionLevel::Implicit);
    }

    #[test]
    fn test_intention_detection_exploratory() {
        let processor = ConversationalRealismProcessor::new();
        let intention = processor.detect_intention("Peut-être qu'on pourrait essayer ça");
        assert_eq!(intention, IntentionLevel::Exploratory);
    }

    #[test]
    fn test_intention_detection_with_question_mark() {
        let processor = ConversationalRealismProcessor::new();
        let intention = processor.detect_intention("C'est possible ?");
        assert_eq!(intention, IntentionLevel::Explicit);
    }

    #[test]
    fn test_intention_detection_default_exploratory() {
        let processor = ConversationalRealismProcessor::new();
        let intention = processor.detect_intention("Je vais essayer quelque chose");
        assert_eq!(intention, IntentionLevel::Exploratory);
    }

    #[test]
    fn test_smart_links_engine_detection() {
        let processor = ConversationalRealismProcessor::new();
        let context = "On travaille avec le MemoryEngine et le SingularityState";
        let links = processor.create_smart_links(&[], context);
        assert_eq!(links.len(), 2);
        assert!(links[0].contains("MemoryEngine"));
        assert!(links[1].contains("SingularityState"));
    }

    #[test]
    fn test_smart_links_recent_topics() {
        let processor = ConversationalRealismProcessor::new();
        let topics = vec!["Architecture".to_string(), "Performance".to_string()];
        let context = "On parle d'architecture système";
        let links = processor.create_smart_links(&topics, context);
        assert!(!links.is_empty());
        assert!(links.iter().any(|l| l.contains("Architecture")));
    }

    #[test]
    fn test_smart_links_empty() {
        let processor = ConversationalRealismProcessor::new();
        let links = processor.create_smart_links(&[], "Rien de spécial");
        assert!(links.is_empty());
    }

    #[test]
    fn test_smart_links_max_three_topics() {
        let processor = ConversationalRealismProcessor::new();
        let topics = vec![
            "Topic1".to_string(),
            "Topic2".to_string(),
            "Topic3".to_string(),
            "Topic4".to_string(),
            "Topic5".to_string(),
        ];
        let context = "Topic1 Topic2 Topic3 Topic4 Topic5";
        let links = processor.create_smart_links(&topics, context);
        // Only first 3 topics should be considered
        assert!(links.len() <= 3);
    }

    #[test]
    fn test_make_concise_short_text() {
        let processor = ConversationalRealismProcessor::new();
        let text = "Short text. Another sentence.";
        let result = processor.make_concise(text);
        assert_eq!(result, text);
    }

    #[test]
    fn test_make_concise_long_text() {
        let processor = ConversationalRealismProcessor::new();
        let text = "First sentence. Second sentence. Third sentence. Fourth sentence. Fifth sentence.";
        let result = processor.make_concise(text);
        // Should be condensed
        assert!(result.len() < text.len());
        assert!(result.contains("First sentence"));
    }

    #[test]
    fn test_add_depth_short_text() {
        let processor = ConversationalRealismProcessor::new();
        let text = "Short response";
        let result = processor.add_depth(text);
        assert!(result.len() > text.len());
        assert!(result.contains("avantages stratégiques"));
    }

    #[test]
    fn test_add_depth_long_text() {
        let processor = ConversationalRealismProcessor::new();
        let text = "This is a very long text that already has more than two hundred characters in it. It contains a lot of information and details that should be sufficient for a deliberate rhythm. We don't need to add more depth to this because it's already quite comprehensive and detailed.";
        let result = processor.add_depth(text);
        assert_eq!(result, text); // Should not add depth
    }

    #[test]
    fn test_add_clarification() {
        let processor = ConversationalRealismProcessor::new();
        let text = "Original response";
        let result = processor.add_clarification(text);
        assert!(result.starts_with("Reprenons calmement."));
        assert!(result.contains("Original response"));
    }

    #[test]
    fn test_generate_micro_prompt_exploratory_steady() {
        let processor = ConversationalRealismProcessor::new();
        let prompt = processor.generate_micro_prompt(
            &IntentionLevel::Exploratory,
            &ConversationalRhythm::Steady,
        );
        assert_eq!(prompt, Some("On approfondit ?".to_string()));
    }

    #[test]
    fn test_generate_micro_prompt_implicit_rapid() {
        let processor = ConversationalRealismProcessor::new();
        let prompt = processor.generate_micro_prompt(
            &IntentionLevel::Implicit,
            &ConversationalRhythm::Rapid,
        );
        assert_eq!(prompt, Some("Tu veux une version plus simple ?".to_string()));
    }

    #[test]
    fn test_generate_micro_prompt_exploratory_hesitant() {
        let processor = ConversationalRealismProcessor::new();
        let prompt = processor.generate_micro_prompt(
            &IntentionLevel::Exploratory,
            &ConversationalRhythm::Hesitant,
        );
        assert_eq!(prompt, Some("Je peux clarifier un angle précis.".to_string()));
    }

    #[test]
    fn test_generate_micro_prompt_deliberate() {
        let processor = ConversationalRealismProcessor::new();
        let prompt = processor.generate_micro_prompt(
            &IntentionLevel::Explicit,
            &ConversationalRhythm::Deliberate,
        );
        assert_eq!(prompt, Some("On continue dans ce sens ?".to_string()));
    }

    #[test]
    fn test_generate_micro_prompt_none() {
        let processor = ConversationalRealismProcessor::new();
        let prompt = processor.generate_micro_prompt(
            &IntentionLevel::Explicit,
            &ConversationalRhythm::Rapid,
        );
        assert_eq!(prompt, None);
    }

    #[test]
    fn test_evaluate_interaction_quality_high_fluidity() {
        let processor = ConversationalRealismProcessor::new();
        let quality = processor.evaluate_interaction_quality(
            "Reprenons ce point ensemble",
            "Je suis perdu",
            &ConversationalRhythm::Steady,
        );
        assert!(quality.fluidity > 0.8);
    }

    #[test]
    fn test_evaluate_interaction_quality_high_autonomy() {
        let processor = ConversationalRealismProcessor::new();
        let quality = processor.evaluate_interaction_quality(
            "Je suggère qu'on fasse autrement",
            "D'accord",
            &ConversationalRhythm::Steady,
        );
        assert!(quality.autonomy > 0.8);
    }

    #[test]
    fn test_evaluate_interaction_quality_rapid_coherence() {
        let processor = ConversationalRealismProcessor::new();
        let quality = processor.evaluate_interaction_quality(
            "OK, je vois",
            "Compris ?",
            &ConversationalRhythm::Rapid,
        );
        assert!(quality.coherence > 0.9);
    }

    #[test]
    fn test_evaluate_interaction_quality_deliberate_coherence() {
        let processor = ConversationalRealismProcessor::new();
        let long_response = "Je pense qu'on peut aborder ce problème sous plusieurs angles différents. D'abord, il faut considérer l'architecture globale et comment elle s'intègre avec les autres composants. Ensuite, on doit penser à la performance et à la scalabilité. Finalement, il faut aussi prendre en compte la maintenabilité à long terme du code que nous allons écrire.";
        let quality = processor.evaluate_interaction_quality(
            long_response,
            "Comment faire ?",
            &ConversationalRhythm::Deliberate,
        );
        assert!(quality.coherence > 0.8);
    }

    #[test]
    fn test_evaluate_interaction_quality_natural_feel() {
        let processor = ConversationalRealismProcessor::new();
        let quality = processor.evaluate_interaction_quality(
            "On peut voir ça ensemble",
            "D'accord",
            &ConversationalRhythm::Steady,
        );
        assert!(quality.natural_feel > 0.8);
    }

    #[test]
    fn test_evaluate_interaction_quality_low_natural_feel() {
        let processor = ConversationalRealismProcessor::new();
        let quality = processor.evaluate_interaction_quality(
            "Super ! C'est génial ! On va y arriver !",
            "OK",
            &ConversationalRhythm::Steady,
        );
        assert!(quality.natural_feel < 0.7);
    }

    #[test]
    fn test_evaluate_interaction_quality_cognitive_load() {
        let processor = ConversationalRealismProcessor::new();
        let quality = processor.evaluate_interaction_quality(
            "Voici une réponse de longueur moyenne qui devrait avoir une charge cognitive raisonnable",
            "Question",
            &ConversationalRhythm::Steady,
        );
        assert!(quality.cognitive_load >= 0.3 && quality.cognitive_load <= 0.7);
    }

    #[test]
    fn test_apply_fluid_transition_rapid() {
        let processor = ConversationalRealismProcessor::new();
        let draft = "Première phrase. Deuxième phrase. Troisième phrase. Quatrième phrase. Cinquième phrase.";
        let result = processor.apply_fluid_transition(
            draft,
            &ConversationalRhythm::Rapid,
            &IntentionLevel::Explicit,
            &[],
        );
        assert!(result.len() < draft.len()); // Should be more concise
    }

    #[test]
    fn test_apply_fluid_transition_deliberate() {
        let processor = ConversationalRealismProcessor::new();
        let draft = "Short response";
        let result = processor.apply_fluid_transition(
            draft,
            &ConversationalRhythm::Deliberate,
            &IntentionLevel::Exploratory,
            &[],
        );
        assert!(result.len() > draft.len()); // Should add depth
    }

    #[test]
    fn test_apply_fluid_transition_hesitant() {
        let processor = ConversationalRealismProcessor::new();
        let draft = "Original response";
        let result = processor.apply_fluid_transition(
            draft,
            &ConversationalRhythm::Hesitant,
            &IntentionLevel::Implicit,
            &[],
        );
        assert!(result.contains("Reprenons calmement"));
    }

    #[test]
    fn test_apply_fluid_transition_with_smart_links() {
        let processor = ConversationalRealismProcessor::new();
        let draft = "Response about architecture";
        let links = vec!["Lien avec MemoryEngine".to_string()];
        let result = processor.apply_fluid_transition(
            draft,
            &ConversationalRhythm::Steady,
            &IntentionLevel::Exploratory,
            &links,
        );
        assert!(result.contains("Lien avec MemoryEngine"));
    }

    #[test]
    fn test_apply_fluid_transition_steady_no_change() {
        let processor = ConversationalRealismProcessor::new();
        let draft = "Balanced response with good length";
        let result = processor.apply_fluid_transition(
            draft,
            &ConversationalRhythm::Steady,
            &IntentionLevel::Explicit,
            &[],
        );
        assert_eq!(result, draft); // Steady rhythm should keep balance
    }

    #[tokio::test]
    async fn test_full_process_deliberate() {
        let processor = ConversationalRealismProcessor::new();
        let request = RealismRequest {
            context: "Discussion approfondie sur l'architecture".to_string(),
            user_message: "Je réfléchis à la manière dont nous pourrions structurer le système de mémoire pour qu'il soit à la fois performant et maintenable. Il y a plusieurs approches possibles, et j'aimerais explorer les trade-offs de chacune avec toi.".to_string(),
            draft_response: "Excellente question".to_string(),
            conversation_history: vec![],
            recent_topics: vec![],
        };

        let response = processor.process(request).await;
        assert_eq!(response.detected_rhythm, ConversationalRhythm::Deliberate);
        assert!(response.micro_prompt.is_some());
    }

    #[tokio::test]
    async fn test_full_process_hesitant() {
        let processor = ConversationalRealismProcessor::new();
        let request = RealismRequest {
            context: "Discussion".to_string(),
            user_message: "Euh... je sais pas trop comment faire...".to_string(),
            draft_response: "Voici comment".to_string(),
            conversation_history: vec![],
            recent_topics: vec![],
        };

        let response = processor.process(request).await;
        assert_eq!(response.detected_rhythm, ConversationalRhythm::Hesitant);
        assert!(response.finalized_response.contains("Reprenons calmement"));
    }

    #[tokio::test]
    async fn test_full_process_with_smart_links() {
        let processor = ConversationalRealismProcessor::new();
        let request = RealismRequest {
            context: "Le MemoryEngine gère la persistence".to_string(),
            user_message: "Peut-être qu'on pourrait améliorer ça".to_string(),
            draft_response: "Bonne idée".to_string(),
            conversation_history: vec![],
            recent_topics: vec!["Memory".to_string()],
        };

        let response = processor.process(request).await;
        assert_eq!(response.detected_intention, IntentionLevel::Exploratory);
        assert!(!response.smart_links.is_empty());
    }

    #[test]
    fn test_intention_level_serialization() {
        let intention = IntentionLevel::Exploratory;
        let json = serde_json::to_string(&intention).unwrap();
        let deserialized: IntentionLevel = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized, intention);
    }

    #[test]
    fn test_conversational_rhythm_serialization() {
        let rhythm = ConversationalRhythm::Deliberate;
        let json = serde_json::to_string(&rhythm).unwrap();
        let deserialized: ConversationalRhythm = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized, rhythm);
    }

    #[test]
    fn test_micro_prompt_serialization() {
        let prompt = MicroPrompt::Deepen;
        let json = serde_json::to_string(&prompt).unwrap();
        let deserialized: MicroPrompt = serde_json::from_str(&json).unwrap();
        // Can't compare enums without PartialEq, just verify it deserializes
        let _ = deserialized;
    }

    #[test]
    fn test_interaction_quality_serialization() {
        let quality = InteractionQuality {
            fluidity: 0.9,
            autonomy: 0.85,
            coherence: 0.95,
            natural_feel: 0.88,
            cognitive_load: 0.45,
        };
        let json = serde_json::to_string(&quality).unwrap();
        let deserialized: InteractionQuality = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.fluidity, 0.9);
        assert_eq!(deserialized.cognitive_load, 0.45);
    }

    #[test]
    fn test_realism_request_serialization() {
        let request = RealismRequest {
            context: "Test context".to_string(),
            user_message: "Test message".to_string(),
            draft_response: "Test draft".to_string(),
            conversation_history: vec!["History 1".to_string()],
            recent_topics: vec!["Topic 1".to_string()],
        };
        let json = serde_json::to_string(&request).unwrap();
        let deserialized: RealismRequest = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.context, "Test context");
        assert_eq!(deserialized.conversation_history.len(), 1);
    }

    #[test]
    fn test_realism_response_serialization() {
        let response = RealismResponse {
            finalized_response: "Final".to_string(),
            micro_prompt: Some("Prompt".to_string()),
            detected_rhythm: ConversationalRhythm::Steady,
            detected_intention: IntentionLevel::Explicit,
            smart_links: vec!["Link".to_string()],
            interaction_quality: InteractionQuality {
                fluidity: 0.8,
                autonomy: 0.7,
                coherence: 0.9,
                natural_feel: 0.85,
                cognitive_load: 0.5,
            },
        };
        let json = serde_json::to_string(&response).unwrap();
        let deserialized: RealismResponse = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.finalized_response, "Final");
        assert_eq!(deserialized.smart_links.len(), 1);
    }
}
