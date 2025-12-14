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
        ratio >= 0.5 && ratio <= 1.5
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
}
