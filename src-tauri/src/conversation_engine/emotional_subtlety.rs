// 🔥 TITANE∞ v∞ — Emotional Subtlety Engine
// Mode: Intelligence émotionnelle subtile et professionnelle
// Version: 1.0.0

use serde::{Deserialize, Serialize};

// ═══════════════════════════════════════════════════════════════
// TYPES & STRUCTURES
// ═══════════════════════════════════════════════════════════════

/// Niveau d'énergie détecté
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum EnergyLevel {
    High,   // Messages denses, enthousiastes → propositions audacieuses
    Medium, // Rythme normal → explications équilibrées
    Low,    // Fatigue, flemme → simplification, respiration
}

/// Niveau de clarté mentale détecté
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ClarityLevel {
    Clear,     // Pensée claire → approfondir
    Fuzzy,     // Pensée floue → reformuler et recentrer
    VeryFuzzy, // Très confus → structure en 3 points
}

/// Charge mentale détectée
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum MentalLoad {
    High,   // Surcharge → réponses très concises
    Normal, // Charge normale → organisation logique
    Low,    // Charge faible → permettre exploration
}

/// État émotionnel implicite détecté
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum EmotionalState {
    Frustration, // → clarifier et détendre
    Fatigue,     // → simplifier
    Confusion,   // → reformuler calmement
    Enthusiasm,  // → amplifier légèrement sans excès
    Neutral,     // État par défaut
}

/// Ton de réponse à appliquer
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ResponseTone {
    Calm,       // Par défaut
    Direct,     // En cas de surcharge
    Expansive,  // Mode créatif
    Analytical, // Mode stratège
}

/// Demande de traitement émotionnel subtil
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmotionalRequest {
    pub context: String,              // Contexte conversationnel
    pub user_message: String,         // Message actuel
    pub draft_response: String,       // Réponse brouillon à affiner
    pub conversation_velocity: usize, // Vitesse (messages/minute)
    pub message_history: Vec<String>, // Historique pour détecter patterns
}

/// Réponse avec subtilité émotionnelle
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmotionalResponse {
    pub finalized_response: String, // Réponse finale avec ton ajusté
    pub detected_energy: EnergyLevel,
    pub detected_clarity: ClarityLevel,
    pub detected_load: MentalLoad,
    pub detected_emotion: EmotionalState,
    pub applied_tone: ResponseTone,
    pub adaptation_quality: AdaptationQuality,
}

/// Qualité de l'adaptation émotionnelle
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdaptationQuality {
    pub emotional_accuracy: f32,   // 0-1: justesse de détection
    pub tone_appropriateness: f32, // 0-1: pertinence du ton
    pub subtlety: f32,             // 0-1: finesse (éviter excès)
    pub support_level: f32,        // 0-1: niveau de soutien
    pub cognitive_protection: f32, // 0-1: protection charge mentale
}

// ═══════════════════════════════════════════════════════════════
// EMOTIONAL SUBTLETY PROCESSOR
// ═══════════════════════════════════════════════════════════════

pub struct EmotionalSubtletyProcessor {
    frustration_keywords: Vec<String>,
    fatigue_keywords: Vec<String>,
    confusion_keywords: Vec<String>,
    enthusiasm_keywords: Vec<String>,
}

impl EmotionalSubtletyProcessor {
    pub fn new() -> Self {
        Self {
            frustration_keywords: vec![
                "merde".to_string(),
                "putain".to_string(),
                "marche pas".to_string(),
                "bloqué".to_string(),
                "chiant".to_string(),
            ],
            fatigue_keywords: vec![
                "flemme".to_string(),
                "fatigué".to_string(),
                "crevé".to_string(),
                "plus l'énergie".to_string(),
                "épuisé".to_string(),
            ],
            confusion_keywords: vec![
                "sais pas".to_string(),
                "comprends pas".to_string(),
                "perdu".to_string(),
                "où j'en suis".to_string(),
                "confus".to_string(),
            ],
            enthusiasm_keywords: vec![
                "génial".to_string(),
                "excellent".to_string(),
                "parfait".to_string(),
                "trouvé".to_string(),
                "ça marche".to_string(),
            ],
        }
    }

    /// Processus principal: applique la subtilité émotionnelle
    pub async fn process(&self, request: EmotionalRequest) -> EmotionalResponse {
        // 1️⃣ Détecter état émotionnel
        let emotion = self.detect_emotional_state(&request.user_message);

        // 2️⃣ Détecter niveau d'énergie
        let energy = self.detect_energy_level(&request.user_message, request.conversation_velocity);

        // 3️⃣ Détecter clarté mentale
        let clarity = self.detect_clarity_level(&request.user_message);

        // 4️⃣ Détecter charge mentale
        let load = self.detect_mental_load(&request.message_history, &energy);

        // 5️⃣ Choisir ton de réponse approprié
        let tone = self.select_response_tone(&emotion, &energy, &load);

        // 6️⃣ Adapter la réponse
        let finalized = self.adapt_response(
            &request.draft_response,
            &emotion,
            &energy,
            &clarity,
            &load,
            &tone,
        );

        // 7️⃣ Évaluer qualité adaptation
        let adaptation_quality = self.evaluate_adaptation_quality(&finalized, &emotion, &tone);

        EmotionalResponse {
            finalized_response: finalized,
            detected_energy: energy,
            detected_clarity: clarity,
            detected_load: load,
            detected_emotion: emotion,
            applied_tone: tone,
            adaptation_quality,
        }
    }

    // ─────────────────────────────────────────────────────────
    // DÉTECTION ÉTAT ÉMOTIONNEL
    // ─────────────────────────────────────────────────────────

    fn detect_emotional_state(&self, message: &str) -> EmotionalState {
        let lower = message.to_lowercase();

        // Frustration
        for keyword in &self.frustration_keywords {
            if lower.contains(keyword) {
                return EmotionalState::Frustration;
            }
        }

        // Fatigue
        for keyword in &self.fatigue_keywords {
            if lower.contains(keyword) {
                return EmotionalState::Fatigue;
            }
        }

        // Confusion
        for keyword in &self.confusion_keywords {
            if lower.contains(keyword) {
                return EmotionalState::Confusion;
            }
        }

        // Enthousiasme
        for keyword in &self.enthusiasm_keywords {
            if lower.contains(keyword) {
                return EmotionalState::Enthusiasm;
            }
        }

        EmotionalState::Neutral
    }

    // ─────────────────────────────────────────────────────────
    // DÉTECTION NIVEAU D'ÉNERGIE
    // ─────────────────────────────────────────────────────────

    fn detect_energy_level(&self, message: &str, velocity: usize) -> EnergyLevel {
        let word_count = message.split_whitespace().count();
        let exclamations = message.matches('!').count();

        // Messages rapides + courts = haute énergie OU basse énergie selon mots
        if velocity >= 5 && word_count >= 17 {
            EnergyLevel::High
        } else if velocity <= 1 && word_count < 5 && exclamations == 0 {
            EnergyLevel::Low
        } else {
            EnergyLevel::Medium
        }
    }

    // ─────────────────────────────────────────────────────────
    // DÉTECTION CLARTÉ
    // ─────────────────────────────────────────────────────────

    fn detect_clarity_level(&self, message: &str) -> ClarityLevel {
        let has_question = message.contains('?');
        let has_hesitation = message.contains("...") || message.contains("euh");
        let word_count = message.split_whitespace().count();

        if has_hesitation && word_count < 10 {
            ClarityLevel::VeryFuzzy
        } else if has_question && word_count < 15 {
            ClarityLevel::Fuzzy
        } else {
            ClarityLevel::Clear
        }
    }

    // ─────────────────────────────────────────────────────────
    // DÉTECTION CHARGE MENTALE
    // ─────────────────────────────────────────────────────────

    fn detect_mental_load(&self, history: &[String], energy: &EnergyLevel) -> MentalLoad {
        let recent_messages = history.len();

        // Beaucoup de messages récents = surcharge possible
        if recent_messages > 20 && matches!(energy, EnergyLevel::Low) {
            MentalLoad::High
        } else if recent_messages < 5 {
            MentalLoad::Low
        } else {
            MentalLoad::Normal
        }
    }

    // ─────────────────────────────────────────────────────────
    // SÉLECTION TON DE RÉPONSE
    // ─────────────────────────────────────────────────────────

    fn select_response_tone(
        &self,
        emotion: &EmotionalState,
        energy: &EnergyLevel,
        load: &MentalLoad,
    ) -> ResponseTone {
        match (emotion, energy, load) {
            (EmotionalState::Frustration, _, MentalLoad::High) => ResponseTone::Direct,
            (EmotionalState::Enthusiasm, EnergyLevel::High, _) => ResponseTone::Expansive,
            (_, EnergyLevel::Low, _) => ResponseTone::Calm,
            (_, _, MentalLoad::High) => ResponseTone::Direct,
            _ => ResponseTone::Calm,
        }
    }

    // ─────────────────────────────────────────────────────────
    // ADAPTATION RÉPONSE
    // ─────────────────────────────────────────────────────────

    fn adapt_response(
        &self,
        draft: &str,
        emotion: &EmotionalState,
        energy: &EnergyLevel,
        clarity: &ClarityLevel,
        load: &MentalLoad,
        tone: &ResponseTone,
    ) -> String {
        let mut response = draft.to_string();

        // Adapter selon état émotionnel
        match emotion {
            EmotionalState::Frustration => {
                response = format!("OK, on recule d'un cran.\n\n{}", response);
            }
            EmotionalState::Fatigue => {
                response = self.simplify_for_fatigue(&response);
            }
            EmotionalState::Confusion => {
                response = format!("Reprenons calmement.\n\n{}", response);
            }
            EmotionalState::Enthusiasm => {
                response = self.amplify_slightly(&response);
            }
            EmotionalState::Neutral => {}
        }

        // Adapter selon clarté
        match clarity {
            ClarityLevel::VeryFuzzy => {
                response = self.structure_in_three_points(&response);
            }
            ClarityLevel::Fuzzy => {
                response = self.add_structure(&response);
            }
            ClarityLevel::Clear => {}
        }

        // Adapter selon charge mentale
        match load {
            MentalLoad::High => {
                response = self.make_very_concise(&response);
            }
            MentalLoad::Low => {
                // Permettre plus d'exploration
            }
            MentalLoad::Normal => {}
        }

        // Adapter selon ton
        match tone {
            ResponseTone::Direct => {
                response = self.make_direct(&response);
            }
            ResponseTone::Expansive => {
                response = self.make_expansive(&response);
            }
            ResponseTone::Analytical => {
                response = self.make_analytical(&response);
            }
            ResponseTone::Calm => {} // Ton par défaut
        }

        response
    }

    // ─────────────────────────────────────────────────────────
    // MÉTHODES D'ADAPTATION SPÉCIFIQUES
    // ─────────────────────────────────────────────────────────

    fn simplify_for_fatigue(&self, text: &str) -> String {
        let sentences: Vec<&str> = text.split('.').filter(|s| !s.trim().is_empty()).collect();

        if sentences.len() > 3 {
            format!(
                "Trois actions simples :\n1. {}\n2. {}\n3. {}",
                sentences[0].trim(),
                sentences.get(1).unwrap_or(&"").trim(),
                sentences.get(2).unwrap_or(&"Pause").trim()
            )
        } else {
            text.to_string()
        }
    }

    fn amplify_slightly(&self, text: &str) -> String {
        if text.len() < 50 {
            format!("Excellent. {}", text)
        } else {
            text.to_string()
        }
    }

    fn structure_in_three_points(&self, text: &str) -> String {
        format!(
            "Reprenons les 3 étapes clés :\n1. [État actuel]\n2. [Objectif]\n3. [Action suivante]\n\n{}",
            text
        )
    }

    fn add_structure(&self, text: &str) -> String {
        format!("Pour clarifier :\n\n{}", text)
    }

    fn make_very_concise(&self, text: &str) -> String {
        let sentences: Vec<&str> = text.split('.').filter(|s| !s.trim().is_empty()).collect();

        if let Some(first) = sentences.first() {
            format!("{}.", first.trim())
        } else {
            text.to_string()
        }
    }

    fn make_direct(&self, text: &str) -> String {
        // Enlever formules de politesse superflues
        text.replace("peut-être", "")
            .replace("je pense que", "")
            .trim()
            .to_string()
    }

    fn make_expansive(&self, text: &str) -> String {
        if text.len() < 100 {
            format!(
                "{}\n\nCette approche ouvre plusieurs perspectives intéressantes.",
                text
            )
        } else {
            text.to_string()
        }
    }

    fn make_analytical(&self, text: &str) -> String {
        format!("Analyse :\n\n{}", text)
    }

    // ─────────────────────────────────────────────────────────
    // ÉVALUATION QUALITÉ
    // ─────────────────────────────────────────────────────────

    fn evaluate_adaptation_quality(
        &self,
        response: &str,
        emotion: &EmotionalState,
        tone: &ResponseTone,
    ) -> AdaptationQuality {
        // Justesse émotionnelle
        let emotional_accuracy = match emotion {
            EmotionalState::Frustration if response.contains("OK, on recule") => 0.9,
            EmotionalState::Fatigue if response.contains("Trois actions simples") => 0.9,
            EmotionalState::Neutral => 0.8,
            _ => 0.7,
        };

        // Pertinence du ton
        let tone_appropriateness = match tone {
            ResponseTone::Direct if response.len() < 100 => 0.9,
            ResponseTone::Calm => 0.85,
            _ => 0.75,
        };

        // Subtilité (absence d'excès)
        let subtlety = if response.contains("super") || response.contains("!!!") {
            0.5 // Trop expressif
        } else {
            0.9
        };

        // Niveau de soutien
        let support_level = if response.contains("Reprenons") || response.contains("OK") {
            0.85
        } else {
            0.7
        };

        // Protection cognitive
        let cognitive_protection = if response.split_whitespace().count() < 50 {
            0.9 // Concis = protection élevée
        } else {
            0.6
        };

        AdaptationQuality {
            emotional_accuracy,
            tone_appropriateness,
            subtlety,
            support_level,
            cognitive_protection,
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
    async fn test_detect_frustration() {
        let processor = EmotionalSubtletyProcessor::new();
        let emotion = processor.detect_emotional_state("Ça marche pas putain");
        assert_eq!(emotion, EmotionalState::Frustration);
    }

    #[tokio::test]
    async fn test_detect_fatigue() {
        let processor = EmotionalSubtletyProcessor::new();
        let emotion = processor.detect_emotional_state("flemme");
        assert_eq!(emotion, EmotionalState::Fatigue);
    }

    #[tokio::test]
    async fn test_energy_detection() {
        let processor = EmotionalSubtletyProcessor::new();
        let energy = processor.detect_energy_level("Bloqué.", 0);
        assert_eq!(energy, EnergyLevel::Low);
    }

    #[tokio::test]
    async fn test_clarity_detection() {
        let processor = EmotionalSubtletyProcessor::new();
        let clarity = processor.detect_clarity_level("Euh... sais pas...");
        assert_eq!(clarity, ClarityLevel::VeryFuzzy);
    }

    #[tokio::test]
    async fn test_full_process_frustration() {
        let processor = EmotionalSubtletyProcessor::new();
        let request = EmotionalRequest {
            context: "Discussion technique".to_string(),
            user_message: "Ça marche pas".to_string(),
            draft_response: "Voici trois solutions.".to_string(),
            conversation_velocity: 1,
            message_history: vec![],
        };

        let response = processor.process(request).await;
        assert!(response.finalized_response.contains("OK, on recule"));
        assert_eq!(response.detected_emotion, EmotionalState::Frustration);
    }

    // ═══════════════════════════════════════════════════════════════
    // TESTS ENUM EnergyLevel
    // ═══════════════════════════════════════════════════════════════

    #[test]
    fn test_energy_level_high() {
        let level = EnergyLevel::High;
        assert_eq!(level, EnergyLevel::High);
    }

    #[test]
    fn test_energy_level_medium() {
        let level = EnergyLevel::Medium;
        assert_eq!(level, EnergyLevel::Medium);
    }

    #[test]
    fn test_energy_level_low() {
        let level = EnergyLevel::Low;
        assert_eq!(level, EnergyLevel::Low);
    }

    #[test]
    fn test_energy_level_clone() {
        let level = EnergyLevel::High;
        let cloned = level.clone();
        assert_eq!(level, cloned);
    }

    #[test]
    fn test_energy_level_debug() {
        let level = EnergyLevel::Medium;
        let debug = format!("{:?}", level);
        assert!(debug.contains("Medium"));
    }

    #[test]
    fn test_energy_level_serialize() {
        let level = EnergyLevel::Low;
        let json = serde_json::to_string(&level).unwrap();
        assert!(json.contains("Low"));
    }

    #[test]
    fn test_energy_level_deserialize() {
        let json = "\"High\"";
        let level: EnergyLevel = serde_json::from_str(json).unwrap();
        assert_eq!(level, EnergyLevel::High);
    }

    // ═══════════════════════════════════════════════════════════════
    // TESTS ENUM ClarityLevel
    // ═══════════════════════════════════════════════════════════════

    #[test]
    fn test_clarity_level_clear() {
        let level = ClarityLevel::Clear;
        assert_eq!(level, ClarityLevel::Clear);
    }

    #[test]
    fn test_clarity_level_fuzzy() {
        let level = ClarityLevel::Fuzzy;
        assert_eq!(level, ClarityLevel::Fuzzy);
    }

    #[test]
    fn test_clarity_level_very_fuzzy() {
        let level = ClarityLevel::VeryFuzzy;
        assert_eq!(level, ClarityLevel::VeryFuzzy);
    }

    #[test]
    fn test_clarity_level_clone() {
        let level = ClarityLevel::Fuzzy;
        let cloned = level.clone();
        assert_eq!(level, cloned);
    }

    #[test]
    fn test_clarity_level_serialize() {
        let level = ClarityLevel::Clear;
        let json = serde_json::to_string(&level).unwrap();
        assert!(json.contains("Clear"));
    }

    #[test]
    fn test_clarity_level_deserialize() {
        let json = "\"VeryFuzzy\"";
        let level: ClarityLevel = serde_json::from_str(json).unwrap();
        assert_eq!(level, ClarityLevel::VeryFuzzy);
    }

    // ═══════════════════════════════════════════════════════════════
    // TESTS ENUM MentalLoad
    // ═══════════════════════════════════════════════════════════════

    #[test]
    fn test_mental_load_high() {
        let load = MentalLoad::High;
        assert_eq!(load, MentalLoad::High);
    }

    #[test]
    fn test_mental_load_normal() {
        let load = MentalLoad::Normal;
        assert_eq!(load, MentalLoad::Normal);
    }

    #[test]
    fn test_mental_load_low() {
        let load = MentalLoad::Low;
        assert_eq!(load, MentalLoad::Low);
    }

    #[test]
    fn test_mental_load_clone() {
        let load = MentalLoad::High;
        let cloned = load.clone();
        assert_eq!(load, cloned);
    }

    #[test]
    fn test_mental_load_serialize() {
        let load = MentalLoad::Normal;
        let json = serde_json::to_string(&load).unwrap();
        assert!(json.contains("Normal"));
    }

    // ═══════════════════════════════════════════════════════════════
    // TESTS ENUM EmotionalState
    // ═══════════════════════════════════════════════════════════════

    #[test]
    fn test_emotional_state_frustration() {
        let state = EmotionalState::Frustration;
        assert_eq!(state, EmotionalState::Frustration);
    }

    #[test]
    fn test_emotional_state_fatigue() {
        let state = EmotionalState::Fatigue;
        assert_eq!(state, EmotionalState::Fatigue);
    }

    #[test]
    fn test_emotional_state_confusion() {
        let state = EmotionalState::Confusion;
        assert_eq!(state, EmotionalState::Confusion);
    }

    #[test]
    fn test_emotional_state_enthusiasm() {
        let state = EmotionalState::Enthusiasm;
        assert_eq!(state, EmotionalState::Enthusiasm);
    }

    #[test]
    fn test_emotional_state_neutral() {
        let state = EmotionalState::Neutral;
        assert_eq!(state, EmotionalState::Neutral);
    }

    #[test]
    fn test_emotional_state_clone() {
        let state = EmotionalState::Enthusiasm;
        let cloned = state.clone();
        assert_eq!(state, cloned);
    }

    #[test]
    fn test_emotional_state_serialize() {
        let state = EmotionalState::Confusion;
        let json = serde_json::to_string(&state).unwrap();
        assert!(json.contains("Confusion"));
    }

    // ═══════════════════════════════════════════════════════════════
    // TESTS ENUM ResponseTone
    // ═══════════════════════════════════════════════════════════════

    #[test]
    fn test_response_tone_calm() {
        let tone = ResponseTone::Calm;
        let debug = format!("{:?}", tone);
        assert!(debug.contains("Calm"));
    }

    #[test]
    fn test_response_tone_direct() {
        let tone = ResponseTone::Direct;
        let debug = format!("{:?}", tone);
        assert!(debug.contains("Direct"));
    }

    #[test]
    fn test_response_tone_expansive() {
        let tone = ResponseTone::Expansive;
        let debug = format!("{:?}", tone);
        assert!(debug.contains("Expansive"));
    }

    #[test]
    fn test_response_tone_analytical() {
        let tone = ResponseTone::Analytical;
        let debug = format!("{:?}", tone);
        assert!(debug.contains("Analytical"));
    }

    #[test]
    fn test_response_tone_clone() {
        let tone = ResponseTone::Calm;
        let cloned = tone.clone();
        let debug = format!("{:?}", cloned);
        assert!(debug.contains("Calm"));
    }

    #[test]
    fn test_response_tone_serialize() {
        let tone = ResponseTone::Direct;
        let json = serde_json::to_string(&tone).unwrap();
        assert!(json.contains("Direct"));
    }

    // ═══════════════════════════════════════════════════════════════
    // TESTS STRUCT EmotionalRequest
    // ═══════════════════════════════════════════════════════════════

    #[test]
    fn test_emotional_request_creation() {
        let request = EmotionalRequest {
            context: "Technical discussion".to_string(),
            user_message: "Test message".to_string(),
            draft_response: "Draft".to_string(),
            conversation_velocity: 5,
            message_history: vec!["Msg1".to_string(), "Msg2".to_string()],
        };
        assert_eq!(request.context, "Technical discussion");
        assert_eq!(request.conversation_velocity, 5);
        assert_eq!(request.message_history.len(), 2);
    }

    #[test]
    fn test_emotional_request_clone() {
        let request = EmotionalRequest {
            context: "Test".to_string(),
            user_message: "Message".to_string(),
            draft_response: "Response".to_string(),
            conversation_velocity: 3,
            message_history: vec![],
        };
        let cloned = request.clone();
        assert_eq!(request.context, cloned.context);
    }

    #[test]
    fn test_emotional_request_serialize() {
        let request = EmotionalRequest {
            context: "ctx".to_string(),
            user_message: "msg".to_string(),
            draft_response: "draft".to_string(),
            conversation_velocity: 1,
            message_history: vec![],
        };
        let json = serde_json::to_string(&request).unwrap();
        assert!(json.contains("ctx"));
        assert!(json.contains("conversation_velocity"));
    }

    #[test]
    fn test_emotional_request_empty_history() {
        let request = EmotionalRequest {
            context: "".to_string(),
            user_message: "".to_string(),
            draft_response: "".to_string(),
            conversation_velocity: 0,
            message_history: vec![],
        };
        assert!(request.message_history.is_empty());
    }

    // ═══════════════════════════════════════════════════════════════
    // TESTS STRUCT EmotionalResponse
    // ═══════════════════════════════════════════════════════════════

    #[test]
    fn test_emotional_response_creation() {
        let response = EmotionalResponse {
            finalized_response: "Final".to_string(),
            detected_energy: EnergyLevel::High,
            detected_clarity: ClarityLevel::Clear,
            detected_load: MentalLoad::Normal,
            detected_emotion: EmotionalState::Neutral,
            applied_tone: ResponseTone::Calm,
            adaptation_quality: AdaptationQuality {
                emotional_accuracy: 0.9,
                tone_appropriateness: 0.8,
                subtlety: 0.7,
                support_level: 0.6,
                cognitive_protection: 0.5,
            },
        };
        assert_eq!(response.finalized_response, "Final");
        assert_eq!(response.detected_energy, EnergyLevel::High);
    }

    #[test]
    fn test_emotional_response_clone() {
        let response = EmotionalResponse {
            finalized_response: "Test".to_string(),
            detected_energy: EnergyLevel::Medium,
            detected_clarity: ClarityLevel::Fuzzy,
            detected_load: MentalLoad::Low,
            detected_emotion: EmotionalState::Fatigue,
            applied_tone: ResponseTone::Direct,
            adaptation_quality: AdaptationQuality {
                emotional_accuracy: 0.5,
                tone_appropriateness: 0.5,
                subtlety: 0.5,
                support_level: 0.5,
                cognitive_protection: 0.5,
            },
        };
        let cloned = response.clone();
        assert_eq!(response.finalized_response, cloned.finalized_response);
    }

    #[test]
    fn test_emotional_response_serialize() {
        let response = EmotionalResponse {
            finalized_response: "test".to_string(),
            detected_energy: EnergyLevel::Low,
            detected_clarity: ClarityLevel::VeryFuzzy,
            detected_load: MentalLoad::High,
            detected_emotion: EmotionalState::Frustration,
            applied_tone: ResponseTone::Analytical,
            adaptation_quality: AdaptationQuality {
                emotional_accuracy: 0.9,
                tone_appropriateness: 0.9,
                subtlety: 0.9,
                support_level: 0.9,
                cognitive_protection: 0.9,
            },
        };
        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("finalized_response"));
        assert!(json.contains("detected_energy"));
    }

    // ═══════════════════════════════════════════════════════════════
    // TESTS STRUCT AdaptationQuality
    // ═══════════════════════════════════════════════════════════════

    #[test]
    fn test_adaptation_quality_creation() {
        let quality = AdaptationQuality {
            emotional_accuracy: 0.95,
            tone_appropriateness: 0.85,
            subtlety: 0.9,
            support_level: 0.8,
            cognitive_protection: 0.75,
        };
        assert_eq!(quality.emotional_accuracy, 0.95);
        assert_eq!(quality.cognitive_protection, 0.75);
    }

    #[test]
    fn test_adaptation_quality_clone() {
        let quality = AdaptationQuality {
            emotional_accuracy: 1.0,
            tone_appropriateness: 1.0,
            subtlety: 1.0,
            support_level: 1.0,
            cognitive_protection: 1.0,
        };
        let cloned = quality.clone();
        assert_eq!(quality.emotional_accuracy, cloned.emotional_accuracy);
    }

    #[test]
    fn test_adaptation_quality_serialize() {
        let quality = AdaptationQuality {
            emotional_accuracy: 0.5,
            tone_appropriateness: 0.5,
            subtlety: 0.5,
            support_level: 0.5,
            cognitive_protection: 0.5,
        };
        let json = serde_json::to_string(&quality).unwrap();
        assert!(json.contains("emotional_accuracy"));
        assert!(json.contains("subtlety"));
    }

    #[test]
    fn test_adaptation_quality_debug() {
        let quality = AdaptationQuality {
            emotional_accuracy: 0.0,
            tone_appropriateness: 0.0,
            subtlety: 0.0,
            support_level: 0.0,
            cognitive_protection: 0.0,
        };
        let debug = format!("{:?}", quality);
        assert!(debug.contains("AdaptationQuality"));
    }

    // ═══════════════════════════════════════════════════════════════
    // TESTS EmotionalSubtletyProcessor
    // ═══════════════════════════════════════════════════════════════

    #[test]
    fn test_processor_new() {
        let processor = EmotionalSubtletyProcessor::new();
        assert!(!processor.frustration_keywords.is_empty());
        assert!(!processor.fatigue_keywords.is_empty());
    }

    #[test]
    fn test_detect_confusion() {
        let processor = EmotionalSubtletyProcessor::new();
        let emotion = processor.detect_emotional_state("je suis perdu, je comprends pas");
        assert_eq!(emotion, EmotionalState::Confusion);
    }

    #[test]
    fn test_detect_enthusiasm() {
        let processor = EmotionalSubtletyProcessor::new();
        let emotion = processor.detect_emotional_state("Génial, ça marche parfaitement!");
        assert_eq!(emotion, EmotionalState::Enthusiasm);
    }

    #[test]
    fn test_detect_neutral() {
        let processor = EmotionalSubtletyProcessor::new();
        let emotion = processor.detect_emotional_state("Peux-tu m'expliquer ceci?");
        assert_eq!(emotion, EmotionalState::Neutral);
    }

    #[test]
    fn test_energy_high_velocity() {
        let processor = EmotionalSubtletyProcessor::new();
        let energy = processor.detect_energy_level(
            "Je suis en train de travailler sur plusieurs projets en même temps et j'ai besoin d'aide rapide",
            5,
        );
        assert_eq!(energy, EnergyLevel::High);
    }

    #[test]
    fn test_energy_medium() {
        let processor = EmotionalSubtletyProcessor::new();
        let energy = processor.detect_energy_level("Message de longueur normale", 2);
        assert_eq!(energy, EnergyLevel::Medium);
    }

    #[test]
    fn test_clarity_clear() {
        let processor = EmotionalSubtletyProcessor::new();
        let clarity = processor.detect_clarity_level(
            "Je veux implémenter une fonction de tri rapide pour les tableaux",
        );
        assert_eq!(clarity, ClarityLevel::Clear);
    }

    #[test]
    fn test_clarity_fuzzy_with_question() {
        let processor = EmotionalSubtletyProcessor::new();
        let clarity = processor.detect_clarity_level("Comment faire?");
        assert_eq!(clarity, ClarityLevel::Fuzzy);
    }

    #[test]
    fn test_detect_mental_load_high() {
        let processor = EmotionalSubtletyProcessor::new();
        let history: Vec<String> = (0..25).map(|i| format!("Message {}", i)).collect();
        let load = processor.detect_mental_load(&history, &EnergyLevel::Low);
        assert_eq!(load, MentalLoad::High);
    }

    #[test]
    fn test_detect_mental_load_low() {
        let processor = EmotionalSubtletyProcessor::new();
        let history = vec!["Msg1".to_string(), "Msg2".to_string()];
        let load = processor.detect_mental_load(&history, &EnergyLevel::High);
        assert_eq!(load, MentalLoad::Low);
    }

    #[test]
    fn test_detect_mental_load_normal() {
        let processor = EmotionalSubtletyProcessor::new();
        let history: Vec<String> = (0..10).map(|i| format!("Message {}", i)).collect();
        let load = processor.detect_mental_load(&history, &EnergyLevel::Medium);
        assert_eq!(load, MentalLoad::Normal);
    }

    #[test]
    fn test_select_tone_frustration_high_load() {
        let processor = EmotionalSubtletyProcessor::new();
        let tone = processor.select_response_tone(
            &EmotionalState::Frustration,
            &EnergyLevel::Medium,
            &MentalLoad::High,
        );
        assert!(matches!(tone, ResponseTone::Direct));
    }

    #[test]
    fn test_select_tone_enthusiasm_high_energy() {
        let processor = EmotionalSubtletyProcessor::new();
        let tone = processor.select_response_tone(
            &EmotionalState::Enthusiasm,
            &EnergyLevel::High,
            &MentalLoad::Normal,
        );
        assert!(matches!(tone, ResponseTone::Expansive));
    }

    #[test]
    fn test_select_tone_low_energy() {
        let processor = EmotionalSubtletyProcessor::new();
        let tone = processor.select_response_tone(
            &EmotionalState::Neutral,
            &EnergyLevel::Low,
            &MentalLoad::Normal,
        );
        assert!(matches!(tone, ResponseTone::Calm));
    }

    #[test]
    fn test_simplify_for_fatigue_long_text() {
        let processor = EmotionalSubtletyProcessor::new();
        let text = "Premier point important. Deuxième élément. Troisième chose. Quatrième item.";
        let simplified = processor.simplify_for_fatigue(text);
        assert!(simplified.contains("Trois actions simples"));
    }

    #[test]
    fn test_simplify_for_fatigue_short_text() {
        let processor = EmotionalSubtletyProcessor::new();
        let text = "Court texte.";
        let simplified = processor.simplify_for_fatigue(text);
        assert_eq!(simplified, text);
    }

    #[test]
    fn test_amplify_slightly_short() {
        let processor = EmotionalSubtletyProcessor::new();
        let text = "Test";
        let amplified = processor.amplify_slightly(text);
        assert!(amplified.starts_with("Excellent."));
    }

    #[test]
    fn test_amplify_slightly_long() {
        let processor = EmotionalSubtletyProcessor::new();
        let text = "Ce texte est suffisamment long pour ne pas être amplifié car il dépasse cinquante caractères.";
        let amplified = processor.amplify_slightly(text);
        assert_eq!(amplified, text);
    }

    #[test]
    fn test_structure_in_three_points() {
        let processor = EmotionalSubtletyProcessor::new();
        let text = "Mon explication";
        let structured = processor.structure_in_three_points(text);
        assert!(structured.contains("3 étapes clés"));
    }

    #[test]
    fn test_add_structure() {
        let processor = EmotionalSubtletyProcessor::new();
        let text = "Explication";
        let structured = processor.add_structure(text);
        assert!(structured.starts_with("Pour clarifier"));
    }

    #[test]
    fn test_make_very_concise() {
        let processor = EmotionalSubtletyProcessor::new();
        let text = "Première phrase. Deuxième phrase. Troisième phrase.";
        let concise = processor.make_very_concise(text);
        assert_eq!(concise, "Première phrase.");
    }

    #[test]
    fn test_make_direct() {
        let processor = EmotionalSubtletyProcessor::new();
        let text = "je pense que peut-être on devrait faire ceci";
        let direct = processor.make_direct(text);
        assert!(!direct.contains("peut-être"));
        assert!(!direct.contains("je pense que"));
    }

    #[test]
    fn test_make_expansive_short() {
        let processor = EmotionalSubtletyProcessor::new();
        let text = "Court";
        let expansive = processor.make_expansive(text);
        assert!(expansive.contains("perspectives intéressantes"));
    }

    #[test]
    fn test_make_analytical() {
        let processor = EmotionalSubtletyProcessor::new();
        let text = "Contenu";
        let analytical = processor.make_analytical(text);
        assert!(analytical.starts_with("Analyse :"));
    }

    #[test]
    fn test_evaluate_adaptation_frustration_match() {
        let processor = EmotionalSubtletyProcessor::new();
        let response = "OK, on recule d'un cran. Voici les solutions.";
        let quality = processor.evaluate_adaptation_quality(
            response,
            &EmotionalState::Frustration,
            &ResponseTone::Calm,
        );
        assert_eq!(quality.emotional_accuracy, 0.9);
    }

    #[test]
    fn test_evaluate_adaptation_fatigue_match() {
        let processor = EmotionalSubtletyProcessor::new();
        let response = "Trois actions simples :\n1. A\n2. B\n3. C";
        let quality = processor.evaluate_adaptation_quality(
            response,
            &EmotionalState::Fatigue,
            &ResponseTone::Calm,
        );
        assert_eq!(quality.emotional_accuracy, 0.9);
    }

    #[test]
    fn test_evaluate_subtlety_excessive() {
        let processor = EmotionalSubtletyProcessor::new();
        let response = "C'est super!!! Trop génial!!!";
        let quality = processor.evaluate_adaptation_quality(
            response,
            &EmotionalState::Neutral,
            &ResponseTone::Calm,
        );
        assert_eq!(quality.subtlety, 0.5);
    }

    #[test]
    fn test_evaluate_support_level() {
        let processor = EmotionalSubtletyProcessor::new();
        let response = "Reprenons ensemble. OK, voici.";
        let quality = processor.evaluate_adaptation_quality(
            response,
            &EmotionalState::Neutral,
            &ResponseTone::Calm,
        );
        assert_eq!(quality.support_level, 0.85);
    }

    #[test]
    fn test_evaluate_cognitive_protection_concise() {
        let processor = EmotionalSubtletyProcessor::new();
        let response = "Court.";
        let quality = processor.evaluate_adaptation_quality(
            response,
            &EmotionalState::Neutral,
            &ResponseTone::Calm,
        );
        assert_eq!(quality.cognitive_protection, 0.9);
    }

    #[tokio::test]
    async fn test_full_process_fatigue() {
        let processor = EmotionalSubtletyProcessor::new();
        let request = EmotionalRequest {
            context: "Discussion".to_string(),
            user_message: "je suis fatigué".to_string(),
            draft_response: "Voici. Deuxième. Troisième. Quatrième.".to_string(),
            conversation_velocity: 1,
            message_history: vec![],
        };
        let response = processor.process(request).await;
        assert_eq!(response.detected_emotion, EmotionalState::Fatigue);
    }

    #[tokio::test]
    async fn test_full_process_confusion() {
        let processor = EmotionalSubtletyProcessor::new();
        let request = EmotionalRequest {
            context: "Help".to_string(),
            user_message: "je comprends pas où j'en suis".to_string(),
            draft_response: "Explication.".to_string(),
            conversation_velocity: 1,
            message_history: vec![],
        };
        let response = processor.process(request).await;
        assert_eq!(response.detected_emotion, EmotionalState::Confusion);
    }

    #[tokio::test]
    async fn test_full_process_enthusiasm() {
        let processor = EmotionalSubtletyProcessor::new();
        let request = EmotionalRequest {
            context: "Success".to_string(),
            user_message: "Génial ça marche!".to_string(),
            draft_response: "Bien".to_string(),
            conversation_velocity: 1,
            message_history: vec![],
        };
        let response = processor.process(request).await;
        assert_eq!(response.detected_emotion, EmotionalState::Enthusiasm);
    }

    #[tokio::test]
    async fn test_full_process_neutral() {
        let processor = EmotionalSubtletyProcessor::new();
        let request = EmotionalRequest {
            context: "Normal".to_string(),
            user_message: "Peux-tu m'aider avec ceci".to_string(),
            draft_response: "Voici l'aide.".to_string(),
            conversation_velocity: 1,
            message_history: vec![],
        };
        let response = processor.process(request).await;
        assert_eq!(response.detected_emotion, EmotionalState::Neutral);
    }

    #[tokio::test]
    async fn test_full_process_high_load() {
        let processor = EmotionalSubtletyProcessor::new();
        let history: Vec<String> = (0..25).map(|i| format!("Message {}", i)).collect();
        let request = EmotionalRequest {
            context: "Busy".to_string(),
            user_message: "ok".to_string(),
            draft_response: "Long. Response. With. Multiple. Sentences.".to_string(),
            conversation_velocity: 1,
            message_history: history,
        };
        let response = processor.process(request).await;
        assert_eq!(response.detected_load, MentalLoad::High);
    }

    #[tokio::test]
    async fn test_full_process_very_fuzzy_clarity() {
        let processor = EmotionalSubtletyProcessor::new();
        let request = EmotionalRequest {
            context: "Unclear".to_string(),
            user_message: "euh...".to_string(),
            draft_response: "Aide.".to_string(),
            conversation_velocity: 1,
            message_history: vec![],
        };
        let response = processor.process(request).await;
        assert_eq!(response.detected_clarity, ClarityLevel::VeryFuzzy);
    }
}
