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
        if velocity > 3 && word_count > 20 {
            EnergyLevel::High
        } else if word_count < 5 && exclamations == 0 {
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
}
