// 🔥 TITANE∞ v∞ — Behavioral Consistency Engine
// Mode: Cohérence comportementale absolue, identité stable et durable
// Version: 1.0.0

use serde::{Deserialize, Serialize};

// ═══════════════════════════════════════════════════════════════
// TYPES & STRUCTURES
// ═══════════════════════════════════════════════════════════════

/// Les 7 lois de cohérence comportementale
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BehavioralLaw {
    ConstantTone,        // Ton calme, clair, posé
    StableStyle,         // Style professionnel, humain, structuré
    RegularRhythm,       // Ni trop lent, ni trop rapide
    InvariablePosture,   // Copilote stratégique
    GlobalAlignment,     // Alignement avec valeurs TITANE
    SelfRegulation,      // Auto-correction automatique
    IdentityPersistence, // Voix constante dans le temps
}

/// Déviation comportementale détectée
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum BehavioralDeviation {
    ToneExcess,         // Trop enthousiaste, agressif, condescendant
    StyleInconsistency, // Trop familier ou trop mécanique
    RhythmIssue,        // Trop dense ou trop léger
    PostureShift,       // Sortie du rôle (thérapeute, comédien)
    ValueMisalignment,  // Contraire aux valeurs TITANE
    None,               // Aucune déviation
}

/// Demande de vérification comportementale
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehavioralRequest {
    pub response_draft: String,          // Réponse à vérifier
    pub conversation_context: String,    // Contexte de la conversation
    pub previous_responses: Vec<String>, // Réponses précédentes (continuité)
    pub user_message: String,            // Message de l'utilisateur
}

/// Réponse avec cohérence comportementale garantie
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehavioralResponse {
    pub finalized_response: String, // Réponse corrigée et stabilisée
    pub deviations_detected: Vec<BehavioralDeviation>,
    pub corrections_applied: Vec<String>,
    pub consistency_score: ConsistencyScore,
}

/// Score de cohérence comportementale
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsistencyScore {
    pub tone_stability: f32,       // 0-1: stabilité du ton
    pub style_coherence: f32,      // 0-1: cohérence stylistique
    pub rhythm_balance: f32,       // 0-1: équilibre du rythme
    pub posture_alignment: f32,    // 0-1: alignement de posture
    pub value_match: f32,          // 0-1: correspondance valeurs
    pub temporal_consistency: f32, // 0-1: continuité dans le temps
    pub overall: f32,              // 0-1: score global
}

// ═══════════════════════════════════════════════════════════════
// BEHAVIORAL CONSISTENCY PROCESSOR
// ═══════════════════════════════════════════════════════════════

pub struct BehavioralConsistencyProcessor {
    // Mots interdits (déviation de ton)
    forbidden_enthusiastic: Vec<String>,
    forbidden_familiar: Vec<String>,
    forbidden_emotional_excess: Vec<String>,

    // Mots attendus (identité TITANE)
    expected_professional: Vec<String>,
    expected_structuring: Vec<String>,
}

impl BehavioralConsistencyProcessor {
    pub fn new() -> Self {
        Self {
            forbidden_enthusiastic: vec![
                "wow".to_string(),
                "super génial".to_string(),
                "incroyable".to_string(),
                "!!!".to_string(),
            ],
            forbidden_familiar: vec![
                "tu vois".to_string(),
                "genre".to_string(),
                "franchement".to_string(),
                "grave".to_string(),
            ],
            forbidden_emotional_excess: vec![
                "je comprends vraiment".to_string(),
                "ce que tu ressens".to_string(),
                "c'est super dur".to_string(),
            ],
            expected_professional: vec![
                "trois options".to_string(),
                "structure".to_string(),
                "clarifier".to_string(),
                "approche".to_string(),
            ],
            expected_structuring: vec![
                "reprenons".to_string(),
                "isolons".to_string(),
                "analysons".to_string(),
                "organisons".to_string(),
            ],
        }
    }

    /// Processus principal: applique la cohérence comportementale
    pub async fn process(&self, request: BehavioralRequest) -> BehavioralResponse {
        let mut response = request.response_draft.clone();
        let mut deviations = Vec::new();
        let mut corrections = Vec::new();

        // 1️⃣ VÉRIFICATION INTERNE (3 étapes)
        let stability_check = self.verify_stability(&response);
        let alignment_check = self.verify_alignment(&response);
        let continuity_check = self.verify_continuity(&response, &request.previous_responses);

        if !stability_check || !alignment_check || !continuity_check {
            // Besoin de correction
        }

        // 2️⃣ DÉTECTION DE DÉVIATIONS

        // Loi 1: Ton Constant
        if let Some(deviation) = self.check_tone_deviation(&response) {
            deviations.push(deviation.clone());
            response = self.correct_tone(&response, &deviation);
            corrections.push("Ton stabilisé".to_string());
        }

        // Loi 2: Style Stable
        if let Some(deviation) = self.check_style_deviation(&response) {
            deviations.push(deviation.clone());
            response = self.correct_style(&response, &deviation);
            corrections.push("Style harmonisé".to_string());
        }

        // Loi 3: Rythme Régulier
        if let Some(deviation) = self.check_rhythm_deviation(&response) {
            deviations.push(deviation.clone());
            response = self.correct_rhythm(&response);
            corrections.push("Rythme équilibré".to_string());
        }

        // Loi 4: Posture Invariable
        if let Some(deviation) = self.check_posture_deviation(&response) {
            deviations.push(deviation.clone());
            response = self.correct_posture(&response);
            corrections.push("Posture rétablie".to_string());
        }

        // Loi 5: Alignement Global
        if !self.check_global_alignment(&response) {
            deviations.push(BehavioralDeviation::ValueMisalignment);
            response = self.enforce_titane_values(&response);
            corrections.push("Valeurs TITANE restaurées".to_string());
        }

        // 3️⃣ CALCUL SCORE DE COHÉRENCE
        let consistency_score =
            self.calculate_consistency_score(&response, &request.previous_responses);

        BehavioralResponse {
            finalized_response: response,
            deviations_detected: deviations,
            corrections_applied: corrections,
            consistency_score,
        }
    }

    // ─────────────────────────────────────────────────────────
    // VÉRIFICATION INTERNE (3 ÉTAPES)
    // ─────────────────────────────────────────────────────────

    fn verify_stability(&self, response: &str) -> bool {
        // Vérifier si la réponse reflète la personnalité constante de TITANE
        let has_calm_tone = !response.contains("!!!") && !response.contains("URGENT");
        let has_clarity = response.len() > 20;

        has_calm_tone && has_clarity
    }

    fn verify_alignment(&self, response: &str) -> bool {
        // Vérifier cohérence avec rôle, style, posture, valeurs
        let has_professional_markers = self
            .expected_professional
            .iter()
            .any(|word| response.to_lowercase().contains(word));

        let no_forbidden = !self
            .forbidden_familiar
            .iter()
            .any(|word| response.to_lowercase().contains(word));

        has_professional_markers || no_forbidden
    }

    fn verify_continuity(&self, response: &str, previous: &[String]) -> bool {
        // Vérifier maintien du fil expressif stable
        if previous.is_empty() {
            return true;
        }

        // Comparer densité moyenne
        let current_density = response.split_whitespace().count();
        let avg_previous: usize = previous
            .iter()
            .map(|r| r.split_whitespace().count())
            .sum::<usize>()
            / previous.len().max(1);

        // Accepter variation de ±50% (les réponses peuvent devenir plus concises sans rupture de ton)
        let ratio = current_density as f32 / avg_previous.max(1) as f32;
        (0.5..=1.5).contains(&ratio)
    }

    // ─────────────────────────────────────────────────────────
    // DÉTECTION DE DÉVIATIONS
    // ─────────────────────────────────────────────────────────

    fn check_tone_deviation(&self, response: &str) -> Option<BehavioralDeviation> {
        let lower = response.to_lowercase();

        // Excès enthousiaste
        for forbidden in &self.forbidden_enthusiastic {
            if lower.contains(forbidden) {
                return Some(BehavioralDeviation::ToneExcess);
            }
        }

        // Excès émotionnel
        for forbidden in &self.forbidden_emotional_excess {
            if lower.contains(forbidden) {
                return Some(BehavioralDeviation::ToneExcess);
            }
        }

        None
    }

    fn check_style_deviation(&self, response: &str) -> Option<BehavioralDeviation> {
        let lower = response.to_lowercase();

        // Trop familier
        for forbidden in &self.forbidden_familiar {
            if lower.contains(forbidden) {
                return Some(BehavioralDeviation::StyleInconsistency);
            }
        }

        // Trop mécanique (phrases trop courtes sans nuance)
        let avg_sentence_length = response.split('.').count();
        if avg_sentence_length < 3 && response.len() > 100 {
            return Some(BehavioralDeviation::StyleInconsistency);
        }

        None
    }

    fn check_rhythm_deviation(&self, response: &str) -> Option<BehavioralDeviation> {
        let word_count = response.split_whitespace().count();

        // Trop dense (>300 mots)
        if word_count > 300 {
            return Some(BehavioralDeviation::RhythmIssue);
        }

        // Trop léger (<10 mots pour une explication)
        if word_count < 10 && response.contains('?') {
            return Some(BehavioralDeviation::RhythmIssue);
        }

        None
    }

    fn check_posture_deviation(&self, response: &str) -> Option<BehavioralDeviation> {
        let lower = response.to_lowercase();

        // Posture de thérapeute
        if lower.contains("je comprends ce que tu ressens")
            || lower.contains("c'est normal de ressentir")
        {
            return Some(BehavioralDeviation::PostureShift);
        }

        // Posture de comédien
        if lower.contains("bravo") || lower.contains("félicitations") {
            return Some(BehavioralDeviation::PostureShift);
        }

        // Posture de moraliste
        if lower.contains("tu devrais") || lower.contains("il faut absolument") {
            return Some(BehavioralDeviation::PostureShift);
        }

        None
    }

    fn check_global_alignment(&self, response: &str) -> bool {
        // Vérifier alignement avec valeurs TITANE: simplicité, clarté, structure
        let has_structure = response.contains("1.")
            || response.contains("2.")
            || response.contains("trois")
            || response.contains("Reprenons");

        let is_clear = !response.contains("peut-être que possiblement");

        has_structure && is_clear
    }

    // ─────────────────────────────────────────────────────────
    // CORRECTIONS
    // ─────────────────────────────────────────────────────────

    fn correct_tone(&self, response: &str, deviation: &BehavioralDeviation) -> String {
        let mut corrected = response.to_string();

        if *deviation == BehavioralDeviation::ToneExcess {
            // Enlever excès enthousiastes
            corrected = corrected
                .replace("!!!", ".")
                .replace("!!", ".")
                .replace("Wow", "")
                .replace("Super génial", "Solide")
                .replace("Incroyable", "Pertinent");

            // Enlever excès émotionnels
            corrected = corrected.replace("je comprends vraiment", "je vois");
        }

        corrected
    }

    fn correct_style(&self, response: &str, deviation: &BehavioralDeviation) -> String {
        let mut corrected = response.to_string();

        if *deviation == BehavioralDeviation::StyleInconsistency {
            // Enlever familiarités
            corrected = corrected
                .replace("tu vois", "")
                .replace("genre", "")
                .replace("franchement", "")
                .replace("grave", "important");

            // Ajouter structure si trop mécanique
            if corrected.split('.').count() < 3 {
                corrected = format!("Pour clarifier :\n\n{}", corrected);
            }
        }

        corrected
    }

    fn correct_rhythm(&self, response: &str) -> String {
        let word_count = response.split_whitespace().count();

        if word_count > 300 {
            // Simplifier si trop dense
            let sentences: Vec<&str> = response.split('.').collect();
            let keep = sentences.len() / 2;
            sentences
                .iter()
                .take(keep)
                .cloned()
                .collect::<Vec<_>>()
                .join(".")
        } else if word_count < 10 {
            // Développer si trop court
            format!("{}. Je peux approfondir si nécessaire.", response)
        } else {
            response.to_string()
        }
    }

    fn correct_posture(&self, response: &str) -> String {
        response
            .replace("je comprends ce que tu ressens", "je vois")
            .replace("Bravo", "Bien")
            .replace("Félicitations", "C'est pertinent")
            .replace("tu devrais", "tu peux")
            .replace("il faut absolument", "on peut")
    }

    fn enforce_titane_values(&self, response: &str) -> String {
        // Ajouter structure si manquante
        if !response.contains("1.") && !response.contains("trois") {
            format!("Trois points clés :\n\n{}", response)
        } else {
            response.to_string()
        }
    }

    // ─────────────────────────────────────────────────────────
    // CALCUL SCORES
    // ─────────────────────────────────────────────────────────

    fn calculate_consistency_score(&self, response: &str, previous: &[String]) -> ConsistencyScore {
        // Ton stable
        let tone_stability = if self.check_tone_deviation(response).is_none() {
            0.95
        } else {
            0.6
        };

        // Style cohérent
        let style_coherence = if self.check_style_deviation(response).is_none() {
            0.9
        } else {
            0.65
        };

        // Rythme équilibré
        let word_count = response.split_whitespace().count();
        let rhythm_balance = if word_count > 20 && word_count < 200 {
            0.9
        } else {
            0.7
        };

        // Posture alignée
        let posture_alignment = if self.check_posture_deviation(response).is_none() {
            0.95
        } else {
            0.5
        };

        // Valeurs TITANE
        let value_match = if self.check_global_alignment(response) {
            0.9
        } else {
            0.6
        };

        // Continuité temporelle
        let temporal_consistency = if self.verify_continuity(response, previous) {
            0.9
        } else {
            0.7
        };

        let overall = (tone_stability
            + style_coherence
            + rhythm_balance
            + posture_alignment
            + value_match
            + temporal_consistency)
            / 6.0;

        ConsistencyScore {
            tone_stability,
            style_coherence,
            rhythm_balance,
            posture_alignment,
            value_match,
            temporal_consistency,
            overall,
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
    async fn test_detect_tone_excess() {
        let processor = BehavioralConsistencyProcessor::new();
        let deviation = processor.check_tone_deviation("Wow!!! C'est super génial !!!");
        assert_eq!(deviation, Some(BehavioralDeviation::ToneExcess));
    }

    #[tokio::test]
    async fn test_detect_style_inconsistency() {
        let processor = BehavioralConsistencyProcessor::new();
        let deviation = processor.check_style_deviation("Tu vois, genre, c'est grave cool");
        assert_eq!(deviation, Some(BehavioralDeviation::StyleInconsistency));
    }

    #[tokio::test]
    async fn test_detect_posture_shift() {
        let processor = BehavioralConsistencyProcessor::new();
        let deviation = processor.check_posture_deviation("Bravo ! Félicitations !");
        assert_eq!(deviation, Some(BehavioralDeviation::PostureShift));
    }

    #[tokio::test]
    async fn test_correct_tone() {
        let processor = BehavioralConsistencyProcessor::new();
        let corrected =
            processor.correct_tone("Wow!!! Super génial !!!", &BehavioralDeviation::ToneExcess);
        assert!(!corrected.contains("!!!"));
        assert!(!corrected.contains("Wow"));
    }

    #[tokio::test]
    async fn test_full_process() {
        let processor = BehavioralConsistencyProcessor::new();
        let request = BehavioralRequest {
            response_draft: "Wow!!! Tu vois, c'est super génial ce que tu fais !!!".to_string(),
            conversation_context: "Discussion technique".to_string(),
            previous_responses: vec!["Voici trois options.".to_string()],
            user_message: "Comment faire ?".to_string(),
        };

        let response = processor.process(request).await;
        assert!(!response.finalized_response.contains("Wow"));
        assert!(!response.finalized_response.contains("tu vois"));
        assert!(!response.deviations_detected.is_empty());
    }

    #[tokio::test]
    async fn test_verify_continuity() {
        let processor = BehavioralConsistencyProcessor::new();
        let previous = vec!["Une réponse de taille normale avec environ quinze mots.".to_string()];
        let current = "Voici trois options pour avancer.";

        let is_continuous = processor.verify_continuity(current, &previous);
        assert!(is_continuous);
    }

    // ═══════════════════════════════════════════════════════════════
    // COMPREHENSIVE TESTS - Session 7
    // ═══════════════════════════════════════════════════════════════

    // ─────────────────────────────────────────────────────────
    // STRUCT TESTS
    // ─────────────────────────────────────────────────────────

    #[test]
    fn test_behavioral_law_variants() {
        // Test all 7 behavioral laws exist and are Debug
        let laws = vec![
            BehavioralLaw::ConstantTone,
            BehavioralLaw::StableStyle,
            BehavioralLaw::RegularRhythm,
            BehavioralLaw::InvariablePosture,
            BehavioralLaw::GlobalAlignment,
            BehavioralLaw::SelfRegulation,
            BehavioralLaw::IdentityPersistence,
        ];
        assert_eq!(laws.len(), 7);
        // Verify Debug trait
        let _ = format!("{:?}", laws[0]);
    }

    #[test]
    fn test_behavioral_deviation_equality() {
        assert_eq!(BehavioralDeviation::ToneExcess, BehavioralDeviation::ToneExcess);
        assert_ne!(BehavioralDeviation::ToneExcess, BehavioralDeviation::StyleInconsistency);
        assert_ne!(BehavioralDeviation::None, BehavioralDeviation::ValueMisalignment);
    }

    #[test]
    fn test_behavioral_request_creation() {
        let request = BehavioralRequest {
            response_draft: "Test response".to_string(),
            conversation_context: "Test context".to_string(),
            previous_responses: vec!["Prev 1".to_string()],
            user_message: "User question".to_string(),
        };
        assert_eq!(request.response_draft, "Test response");
        assert_eq!(request.previous_responses.len(), 1);
    }

    #[test]
    fn test_behavioral_response_structure() {
        let response = BehavioralResponse {
            finalized_response: "Final".to_string(),
            deviations_detected: vec![BehavioralDeviation::ToneExcess],
            corrections_applied: vec!["Correction 1".to_string()],
            consistency_score: ConsistencyScore {
                tone_stability: 0.8,
                style_coherence: 0.85,
                rhythm_balance: 0.9,
                posture_alignment: 0.95,
                value_match: 0.88,
                temporal_consistency: 0.92,
                overall: 0.88,
            },
        };
        assert_eq!(response.deviations_detected.len(), 1);
        assert_eq!(response.corrections_applied.len(), 1);
        assert!(response.consistency_score.overall > 0.8);
    }

    #[test]
    fn test_consistency_score_calculation() {
        let score = ConsistencyScore {
            tone_stability: 1.0,
            style_coherence: 0.9,
            rhythm_balance: 0.8,
            posture_alignment: 0.7,
            value_match: 0.6,
            temporal_consistency: 0.5,
            overall: (1.0 + 0.9 + 0.8 + 0.7 + 0.6 + 0.5) / 6.0,
        };
        assert_eq!(score.overall, 0.75);
    }

    // ─────────────────────────────────────────────────────────
    // PROCESSOR INITIALIZATION
    // ─────────────────────────────────────────────────────────

    #[test]
    fn test_processor_new() {
        let processor = BehavioralConsistencyProcessor::new();
        assert!(!processor.forbidden_enthusiastic.is_empty());
        assert!(!processor.forbidden_familiar.is_empty());
        assert!(!processor.expected_professional.is_empty());
    }

    #[test]
    fn test_processor_forbidden_lists() {
        let processor = BehavioralConsistencyProcessor::new();
        assert!(processor.forbidden_enthusiastic.contains(&"wow".to_string()));
        assert!(processor.forbidden_familiar.contains(&"genre".to_string()));
        assert!(processor.forbidden_emotional_excess.contains(&"je comprends vraiment".to_string()));
    }

    #[test]
    fn test_processor_expected_lists() {
        let processor = BehavioralConsistencyProcessor::new();
        assert!(processor.expected_professional.contains(&"structure".to_string()));
        assert!(processor.expected_structuring.contains(&"reprenons".to_string()));
    }

    // ─────────────────────────────────────────────────────────
    // STABILITY VERIFICATION
    // ─────────────────────────────────────────────────────────

    #[test]
    fn test_verify_stability_calm_tone() {
        let processor = BehavioralConsistencyProcessor::new();
        assert!(processor.verify_stability("Voici une réponse calme et claire."));
        assert!(!processor.verify_stability("URGENT!!! Réponse avec urgence!!!"));
    }

    #[test]
    fn test_verify_stability_minimum_length() {
        let processor = BehavioralConsistencyProcessor::new();
        assert!(!processor.verify_stability("Trop court"));
        assert!(processor.verify_stability("Ceci est une réponse suffisamment longue."));
    }

    #[test]
    fn test_verify_stability_exclamation_marks() {
        let processor = BehavioralConsistencyProcessor::new();
        assert!(!processor.verify_stability("Incroyable!!! C'est trop incroyable!!!"));
        assert!(processor.verify_stability("C'est pertinent et bien structuré."));
    }

    // ─────────────────────────────────────────────────────────
    // ALIGNMENT VERIFICATION
    // ─────────────────────────────────────────────────────────

    #[test]
    fn test_verify_alignment_professional_markers() {
        let processor = BehavioralConsistencyProcessor::new();
        assert!(processor.verify_alignment("Voici une approche structurée."));
        assert!(processor.verify_alignment("Il faut clarifier ce point."));
    }

    #[test]
    fn test_verify_alignment_no_forbidden() {
        let processor = BehavioralConsistencyProcessor::new();
        assert!(processor.verify_alignment("Réponse professionnelle sans familiarités."));
        assert!(!processor.verify_alignment("Tu vois, genre c'est cool."));
    }

    #[test]
    fn test_verify_alignment_edge_cases() {
        let processor = BehavioralConsistencyProcessor::new();
        // Even without professional markers, passes if no forbidden words
        assert!(processor.verify_alignment("Réponse neutre."));
    }

    // ─────────────────────────────────────────────────────────
    // CONTINUITY VERIFICATION
    // ─────────────────────────────────────────────────────────

    #[test]
    fn test_verify_continuity_empty_previous() {
        let processor = BehavioralConsistencyProcessor::new();
        assert!(processor.verify_continuity("Nouvelle conversation", &[]));
    }

    #[test]
    fn test_verify_continuity_similar_density() {
        let processor = BehavioralConsistencyProcessor::new();
        let previous = vec!["Une réponse avec environ dix mots de longueur normale.".to_string()];
        let current = "Une autre réponse similaire avec dix mots.";
        assert!(processor.verify_continuity(current, &previous));
    }

    #[test]
    fn test_verify_continuity_too_different() {
        let processor = BehavioralConsistencyProcessor::new();
        let previous = vec!["Courte.".to_string()];
        let current = "Une très très très très très très très très très très très très très très très très très très très longue réponse qui est trois fois plus dense que la précédente et devrait échouer le test de continuité.";
        assert!(!processor.verify_continuity(current, &previous));
    }

    #[test]
    fn test_verify_continuity_boundary_50_percent() {
        let processor = BehavioralConsistencyProcessor::new();
        let previous = vec!["Dix mots dans cette réponse de taille moyenne ici.".to_string()];
        let current = "Cinq mots réponse test ici."; // 5 words = 50% of 10
        assert!(processor.verify_continuity(current, &previous));
    }

    // ─────────────────────────────────────────────────────────
    // TONE DEVIATION DETECTION
    // ─────────────────────────────────────────────────────────

    #[test]
    fn test_check_tone_deviation_enthusiastic() {
        let processor = BehavioralConsistencyProcessor::new();
        assert_eq!(processor.check_tone_deviation("Wow c'est génial!"), Some(BehavioralDeviation::ToneExcess));
        assert_eq!(processor.check_tone_deviation("C'est super génial!!!"), Some(BehavioralDeviation::ToneExcess));
    }

    #[test]
    fn test_check_tone_deviation_emotional() {
        let processor = BehavioralConsistencyProcessor::new();
        assert_eq!(
            processor.check_tone_deviation("Je comprends vraiment ce que tu ressens"),
            Some(BehavioralDeviation::ToneExcess)
        );
    }

    #[test]
    fn test_check_tone_deviation_none() {
        let processor = BehavioralConsistencyProcessor::new();
        assert_eq!(processor.check_tone_deviation("Réponse professionnelle et calme"), None);
    }

    #[test]
    fn test_check_tone_deviation_case_insensitive() {
        let processor = BehavioralConsistencyProcessor::new();
        assert_eq!(processor.check_tone_deviation("WOW INCROYABLE"), Some(BehavioralDeviation::ToneExcess));
    }

    // ─────────────────────────────────────────────────────────
    // STYLE DEVIATION DETECTION
    // ─────────────────────────────────────────────────────────

    #[test]
    fn test_check_style_deviation_familiar() {
        let processor = BehavioralConsistencyProcessor::new();
        assert_eq!(
            processor.check_style_deviation("Tu vois ce que je veux dire"),
            Some(BehavioralDeviation::StyleInconsistency)
        );
        assert_eq!(
            processor.check_style_deviation("Genre c'est cool"),
            Some(BehavioralDeviation::StyleInconsistency)
        );
    }

    #[test]
    fn test_check_style_deviation_too_mechanical() {
        let processor = BehavioralConsistencyProcessor::new();
        // Short sentences (only 1 period) with >100 chars
        let mechanical = "A".repeat(110);
        assert_eq!(
            processor.check_style_deviation(&mechanical),
            Some(BehavioralDeviation::StyleInconsistency)
        );
    }

    #[test]
    fn test_check_style_deviation_none() {
        let processor = BehavioralConsistencyProcessor::new();
        assert_eq!(processor.check_style_deviation("Voici une réponse. Elle est structurée. Avec plusieurs phrases."), None);
    }

    // ─────────────────────────────────────────────────────────
    // RHYTHM DEVIATION DETECTION
    // ─────────────────────────────────────────────────────────

    #[test]
    fn test_check_rhythm_deviation_too_dense() {
        let processor = BehavioralConsistencyProcessor::new();
        let dense = vec!["mot"; 350].join(" ");
        assert_eq!(processor.check_rhythm_deviation(&dense), Some(BehavioralDeviation::RhythmIssue));
    }

    #[test]
    fn test_check_rhythm_deviation_too_light() {
        let processor = BehavioralConsistencyProcessor::new();
        assert_eq!(processor.check_rhythm_deviation("Quoi?"), Some(BehavioralDeviation::RhythmIssue));
    }

    #[test]
    fn test_check_rhythm_deviation_balanced() {
        let processor = BehavioralConsistencyProcessor::new();
        let balanced = vec!["mot"; 50].join(" ");
        assert_eq!(processor.check_rhythm_deviation(&balanced), None);
    }

    #[test]
    fn test_check_rhythm_deviation_boundary_300_words() {
        let processor = BehavioralConsistencyProcessor::new();
        let exactly_300 = vec!["mot"; 300].join(" ");
        assert_eq!(processor.check_rhythm_deviation(&exactly_300), None);
        let over_300 = vec!["mot"; 301].join(" ");
        assert_eq!(processor.check_rhythm_deviation(&over_300), Some(BehavioralDeviation::RhythmIssue));
    }

    // ─────────────────────────────────────────────────────────
    // POSTURE DEVIATION DETECTION
    // ─────────────────────────────────────────────────────────

    #[test]
    fn test_check_posture_deviation_therapist() {
        let processor = BehavioralConsistencyProcessor::new();
        assert_eq!(
            processor.check_posture_deviation("Je comprends ce que tu ressens"),
            Some(BehavioralDeviation::PostureShift)
        );
        assert_eq!(
            processor.check_posture_deviation("C'est normal de ressentir cela"),
            Some(BehavioralDeviation::PostureShift)
        );
    }

    #[test]
    fn test_check_posture_deviation_comedian() {
        let processor = BehavioralConsistencyProcessor::new();
        assert_eq!(processor.check_posture_deviation("Bravo pour ton travail"), Some(BehavioralDeviation::PostureShift));
        assert_eq!(processor.check_posture_deviation("Félicitations"), Some(BehavioralDeviation::PostureShift));
    }

    #[test]
    fn test_check_posture_deviation_moralist() {
        let processor = BehavioralConsistencyProcessor::new();
        assert_eq!(processor.check_posture_deviation("Tu devrais faire ceci"), Some(BehavioralDeviation::PostureShift));
        assert_eq!(
            processor.check_posture_deviation("Il faut absolument changer"),
            Some(BehavioralDeviation::PostureShift)
        );
    }

    #[test]
    fn test_check_posture_deviation_none() {
        let processor = BehavioralConsistencyProcessor::new();
        assert_eq!(processor.check_posture_deviation("Voici trois options stratégiques"), None);
    }

    // ─────────────────────────────────────────────────────────
    // GLOBAL ALIGNMENT CHECK
    // ─────────────────────────────────────────────────────────

    #[test]
    fn test_check_global_alignment_structured() {
        let processor = BehavioralConsistencyProcessor::new();
        assert!(processor.check_global_alignment("1. Premier point\n2. Deuxième point"));
        assert!(processor.check_global_alignment("Voici trois options pour avancer"));
        assert!(processor.check_global_alignment("Reprenons depuis le début"));
    }

    #[test]
    fn test_check_global_alignment_unclear() {
        let processor = BehavioralConsistencyProcessor::new();
        assert!(!processor.check_global_alignment("Peut-être que possiblement on pourrait"));
    }

    #[test]
    fn test_check_global_alignment_both_conditions() {
        let processor = BehavioralConsistencyProcessor::new();
        // Must have structure AND clarity
        assert!(processor.check_global_alignment("1. Option claire"));
        assert!(!processor.check_global_alignment("Réponse sans structure ni clarté"));
    }

    // ─────────────────────────────────────────────────────────
    // CORRECTION METHODS
    // ─────────────────────────────────────────────────────────

    #[test]
    fn test_correct_tone_removes_enthusiasm() {
        let processor = BehavioralConsistencyProcessor::new();
        let corrected = processor.correct_tone("Wow!!! Super génial!!!", &BehavioralDeviation::ToneExcess);
        assert!(!corrected.contains("!!!"));
        assert!(!corrected.contains("Wow"));
        assert!(corrected.contains("Solide"));
    }

    #[test]
    fn test_correct_tone_removes_emotional_excess() {
        let processor = BehavioralConsistencyProcessor::new();
        let corrected = processor.correct_tone("je comprends vraiment ton expérience", &BehavioralDeviation::ToneExcess);
        assert!(corrected.contains("je vois"));
        assert!(!corrected.contains("je comprends vraiment"));
    }

    #[test]
    fn test_correct_style_removes_familiarity() {
        let processor = BehavioralConsistencyProcessor::new();
        let corrected = processor.correct_style("Tu vois, genre, franchement c'est grave", &BehavioralDeviation::StyleInconsistency);
        assert!(!corrected.contains("tu vois"));
        assert!(!corrected.contains("genre"));
        assert!(!corrected.contains("franchement"));
        assert!(corrected.contains("important"));
    }

    #[test]
    fn test_correct_style_adds_structure() {
        let processor = BehavioralConsistencyProcessor::new();
        let corrected = processor.correct_style("Court", &BehavioralDeviation::StyleInconsistency);
        assert!(corrected.contains("Pour clarifier"));
    }

    #[test]
    fn test_correct_rhythm_simplifies_dense() {
        let processor = BehavioralConsistencyProcessor::new();
        let dense = vec!["Phrase."; 400].join(" ");
        let corrected = processor.correct_rhythm(&dense);
        assert!(corrected.len() < dense.len());
    }

    #[test]
    fn test_correct_rhythm_expands_light() {
        let processor = BehavioralConsistencyProcessor::new();
        let light = "Court";
        let corrected = processor.correct_rhythm(light);
        assert!(corrected.contains("approfondir"));
        assert!(corrected.len() > light.len());
    }

    #[test]
    fn test_correct_posture_removes_shifts() {
        let processor = BehavioralConsistencyProcessor::new();
        let corrected = processor.correct_posture("je comprends ce que tu ressens. Bravo! tu devrais continuer cette approche.");
        assert!(corrected.contains("je vois"));
        assert!(!corrected.contains("je comprends ce que tu ressens"));
        assert!(corrected.contains("Bien"));
        assert!(!corrected.contains("Bravo"));
        assert!(corrected.contains("tu peux"));
        assert!(!corrected.contains("tu devrais"));
    }

    #[test]
    fn test_enforce_titane_values_adds_structure() {
        let processor = BehavioralConsistencyProcessor::new();
        let corrected = processor.enforce_titane_values("Réponse sans structure");
        assert!(corrected.contains("Trois points clés"));
    }

    #[test]
    fn test_enforce_titane_values_keeps_existing_structure() {
        let processor = BehavioralConsistencyProcessor::new();
        let with_structure = "1. Premier point\n2. Deuxième point";
        let corrected = processor.enforce_titane_values(with_structure);
        assert_eq!(corrected, with_structure);
    }

    // ─────────────────────────────────────────────────────────
    // CONSISTENCY SCORE CALCULATION
    // ─────────────────────────────────────────────────────────

    #[test]
    fn test_calculate_consistency_score_perfect() {
        let processor = BehavioralConsistencyProcessor::new();
        let response = "1. Première option pour avancer avec méthode et clarté\n2. Deuxième approche structurée, progressive, et vérifiable\n3. Troisième voie possible avec exemples concrets et critères";
        let previous = vec!["Une réponse antérieure de taille similaire avec structure.".to_string()];
        let score = processor.calculate_consistency_score(response, &previous);

        assert!(score.tone_stability >= 0.9);
        assert!(score.style_coherence >= 0.8);
        assert!(score.rhythm_balance >= 0.8);
        assert!(score.posture_alignment >= 0.9);
        assert!(score.value_match >= 0.8); // Now has structure (numbered list)
        assert!(score.overall > 0.8);
    }

    #[test]
    fn test_calculate_consistency_score_with_deviations() {
        let processor = BehavioralConsistencyProcessor::new();
        let response = "Wow!!! Tu vois, genre, c'est super génial!!!";
        let score = processor.calculate_consistency_score(response, &[]);

        assert!(score.tone_stability < 0.7);
        assert!(score.style_coherence < 0.7);
        assert!(score.overall < 0.8);
    }

    #[test]
    fn test_calculate_consistency_score_all_components() {
        let processor = BehavioralConsistencyProcessor::new();
        let response = "1. Première option\n2. Deuxième option\n3. Troisième option";
        let score = processor.calculate_consistency_score(response, &[]);

        // Verify all 6 components are calculated
        assert!(score.tone_stability > 0.0);
        assert!(score.style_coherence > 0.0);
        assert!(score.rhythm_balance > 0.0);
        assert!(score.posture_alignment > 0.0);
        assert!(score.value_match > 0.0);
        assert!(score.temporal_consistency > 0.0);

        // Verify overall is average of 6 components
        let expected_overall = (score.tone_stability + score.style_coherence + score.rhythm_balance +
                                score.posture_alignment + score.value_match + score.temporal_consistency) / 6.0;
        assert!((score.overall - expected_overall).abs() < 0.001);
    }

    // ─────────────────────────────────────────────────────────
    // FULL PROCESS INTEGRATION
    // ─────────────────────────────────────────────────────────

    #[tokio::test]
    async fn test_process_multiple_deviations() {
        let processor = BehavioralConsistencyProcessor::new();
        let request = BehavioralRequest {
            response_draft: "Wow!!! Tu vois, genre, je comprends vraiment ce que tu ressens!!!".to_string(),
            conversation_context: "Discussion".to_string(),
            previous_responses: vec![],
            user_message: "Aide-moi".to_string(),
        };

        let response = processor.process(request).await;
        assert!(!response.finalized_response.contains("Wow"));
        assert!(!response.finalized_response.contains("tu vois"));
        assert!(response.deviations_detected.len() >= 2);
        assert!(!response.corrections_applied.is_empty());
    }

    #[tokio::test]
    async fn test_process_clean_response() {
        let processor = BehavioralConsistencyProcessor::new();
        let request = BehavioralRequest {
            response_draft: "Voici trois options structurées pour résoudre ce problème technique.".to_string(),
            conversation_context: "Discussion technique".to_string(),
            previous_responses: vec!["Analyse du contexte terminée.".to_string()],
            user_message: "Comment procéder?".to_string(),
        };

        let response = processor.process(request).await;
        assert!(response.deviations_detected.is_empty() || response.deviations_detected.contains(&BehavioralDeviation::None));
        assert!(response.consistency_score.overall >= 0.8);
    }

    #[tokio::test]
    async fn test_process_preserves_good_content() {
        let processor = BehavioralConsistencyProcessor::new();
        let good_draft = "Reprenons depuis le début. Voici trois options:\n1. Option A\n2. Option B\n3. Option C";
        let request = BehavioralRequest {
            response_draft: good_draft.to_string(),
            conversation_context: "Planification".to_string(),
            previous_responses: vec![],
            user_message: "Quelle approche?".to_string(),
        };

        let response = processor.process(request).await;
        // Should not heavily modify already good content
        assert!(response.finalized_response.contains("option"));
        assert!(response.consistency_score.overall >= 0.85);
    }
}
