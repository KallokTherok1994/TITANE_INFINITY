// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Evaluator (Hallucination + Coherence)
//   SUPER PROMPT #8 — Response Quality Evaluation
// ═══════════════════════════════════════════════════════════════

use crate::ai::{AiRequest, AiResponse};
use serde::{Deserialize, Serialize};

/// Résultat d'évaluation d'une réponse IA
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvaluationResult {
    pub score: f32,                    // 0.0-1.0
    pub hallucination_risk: f32,       // 0.0-1.0
    pub coherence: f32,                // 0.0-1.0
    pub relevance: f32,                // 0.0-1.0
    pub warnings: Vec<String>,
    pub recommendations: Vec<String>,
}

/// Évaluateur de qualité des réponses IA
pub struct Evaluator {
    strict_mode: bool,
}

impl Evaluator {
    pub fn new(strict_mode: bool) -> Self {
        Self { strict_mode }
    }

    /// Évalue une réponse IA complète
    pub fn evaluate(&self, req: &AiRequest, res: &AiResponse) -> EvaluationResult {
        let mut warnings = Vec::new();
        let mut recommendations = Vec::new();

        // 1. Évaluation hallucination
        let hallucination_risk = self.detect_hallucination(&res.output, &req.prompt);
        if hallucination_risk > 0.5 {
            warnings.push(format!(
                "Risque d'hallucination élevé: {:.0}%",
                hallucination_risk * 100.0
            ));
        }

        // 2. Évaluation cohérence
        let coherence = self.evaluate_coherence(&res.output);
        if coherence < 0.6 {
            warnings.push(format!(
                "Cohérence faible: {:.0}%",
                coherence * 100.0
            ));
            recommendations.push("Considérer une régénération avec un autre provider".to_string());
        }

        // 3. Évaluation pertinence
        let relevance = self.evaluate_relevance(&req.prompt, &res.output);
        if relevance < 0.5 {
            warnings.push(format!(
                "Pertinence faible: {:.0}%",
                relevance * 100.0
            ));
            recommendations.push("La réponse ne répond pas directement à la question".to_string());
        }

        // 4. Vérifications provider-specific
        self.check_provider_patterns(res, &mut warnings);

        // 5. Score global
        let score = self.calculate_global_score(hallucination_risk, coherence, relevance);

        if score < 0.5 && self.strict_mode {
            recommendations.push("Mode strict: considérer fallback vers un autre provider".to_string());
        }

        EvaluationResult {
            score,
            hallucination_risk,
            coherence,
            relevance,
            warnings,
            recommendations,
        }
    }

    /// Détecte les hallucinations potentielles
    fn detect_hallucination(&self, output: &str, prompt: &str) -> f32 {
        let mut risk_score: f32 = 0.0;
        let output_lower = output.to_lowercase();
        let prompt_lower = prompt.to_lowercase();

        // Patterns suspects
        let hallucination_markers = [
            "je ne peux pas",
            "je ne sais pas",
            "impossible de",
            "erreur",
            "incorrect",
            "ne correspond pas",
            "contradiction",
        ];

        for marker in &hallucination_markers {
            if output_lower.contains(marker) {
                risk_score += 0.1;
            }
        }

        // Vérification inventions de données
        if output_lower.contains("selon mes sources") && !prompt_lower.contains("sources") {
            risk_score += 0.2;
        }

        if output_lower.contains("d'après les études") && !prompt_lower.contains("études") {
            risk_score += 0.15;
        }

        // Contradictions internes
        if self.detect_internal_contradictions(output) {
            risk_score += 0.3;
        }

        risk_score.min(1.0)
    }

    /// Détecte contradictions internes
    fn detect_internal_contradictions(&self, output: &str) -> bool {
        let contradictory_pairs = [
            ("toujours", "jamais"),
            ("impossible", "possible"),
            ("oui", "non"),
            ("correct", "incorrect"),
            ("vrai", "faux"),
        ];

        for (word1, word2) in &contradictory_pairs {
            if output.to_lowercase().contains(word1) && output.to_lowercase().contains(word2) {
                // Vérifier proximité (dans même paragraphe)
                let paragraphs: Vec<&str> = output.split("\n\n").collect();
                for para in paragraphs {
                    let para_lower = para.to_lowercase();
                    if para_lower.contains(word1) && para_lower.contains(word2) {
                        return true;
                    }
                }
            }
        }

        false
    }

    /// Évalue la cohérence globale
    fn evaluate_coherence(&self, output: &str) -> f32 {
        let mut score: f32 = 1.0;

        // Longueur minimum
        if output.len() < 50 {
            score -= 0.3;
        }

        // Structure présente
        if !output.contains('.') && output.len() > 100 {
            score -= 0.2; // Pas de ponctuation
        }

        // Répétitions excessives
        if self.detect_excessive_repetition(output) {
            score -= 0.3;
        }

        // Formatage correct
        if output.starts_with("```") && !output.ends_with("```") {
            score -= 0.2; // Code block mal fermé
        }

        score.max(0.0)
    }

    /// Détecte répétitions excessives
    fn detect_excessive_repetition(&self, output: &str) -> bool {
        let words: Vec<&str> = output.split_whitespace().collect();
        if words.len() < 10 {
            return false;
        }

        let mut repetition_count = 0;
        for window in words.windows(3) {
            if window[0] == window[1] || window[1] == window[2] {
                repetition_count += 1;
            }
        }

        repetition_count > words.len() / 10 // Plus de 10% répétitions
    }

    /// Évalue la pertinence par rapport au prompt
    fn evaluate_relevance(&self, prompt: &str, output: &str) -> f32 {
        let prompt_lower = prompt.to_lowercase();
        let prompt_words: Vec<&str> = prompt_lower
            .split_whitespace()
            .filter(|w| w.len() > 3) // Mots significatifs
            .collect();

        if prompt_words.is_empty() {
            return 0.5; // Neutre si pas de mots clés
        }

        let output_lower = output.to_lowercase();
        let mut match_count = 0;

        for word in &prompt_words {
            if output_lower.contains(word) {
                match_count += 1;
            }
        }

        (match_count as f32 / prompt_words.len() as f32).min(1.0)
    }

    /// Vérifications patterns spécifiques providers
    fn check_provider_patterns(&self, res: &AiResponse, warnings: &mut Vec<String>) {
        match res.provider.as_str() {
            "titane_engine" => {
                if res.output.contains("mode fallback") {
                    warnings.push("Réponse générée par fallback TITANE Engine".to_string());
                }
            }
            "local" => {
                if res.latency_ms > 10_000 {
                    warnings.push(format!(
                        "Latence locale élevée: {}ms",
                        res.latency_ms
                    ));
                }
            }
            _ => {}
        }

        // Vérification générale de confiance
        if res.confidence < 0.5 {
            warnings.push(format!(
                "Confiance basse du provider: {:.0}%",
                res.confidence * 100.0
            ));
        }
    }

    /// Calcule score global
    fn calculate_global_score(
        &self,
        hallucination_risk: f32,
        coherence: f32,
        relevance: f32,
    ) -> f32 {
        let quality_score = (coherence * 0.4) + (relevance * 0.4) + ((1.0 - hallucination_risk) * 0.2);
        quality_score.max(0.0).min(1.0)
    }

    /// Suggère des améliorations
    pub fn suggest_improvements(&self, result: &EvaluationResult) -> Vec<String> {
        let mut suggestions = Vec::new();

        if result.hallucination_risk > 0.5 {
            suggestions.push("Utiliser un provider avec meilleure vérification factuelle".to_string());
        }

        if result.coherence < 0.6 {
            suggestions.push("Ajuster température ou max_tokens pour plus de cohérence".to_string());
        }

        if result.relevance < 0.5 {
            suggestions.push("Reformuler le prompt pour plus de précision".to_string());
        }

        if result.score < 0.5 {
            suggestions.push("Essayer mode Deep ou Quality pour meilleure qualité".to_string());
        }

        suggestions
    }
}

impl Default for Evaluator {
    fn default() -> Self {
        Self::new(false)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ai::{AiMode, AiMetadata};

    fn create_test_request() -> AiRequest {
        AiRequest {
            prompt: "Expliquer comment fonctionne Rust async".to_string(),
            mode: AiMode::Quality,
            user_id: "test".to_string(),
            session_id: "test".to_string(),
            max_tokens: None,
            temperature: None,
            context: None,
        }
    }

    fn create_test_response(output: &str, confidence: f32) -> AiResponse {
        AiResponse {
            output: output.to_string(),
            provider: "test".to_string(),
            model: "test".to_string(),
            tokens_in: 10,
            tokens_out: 20,
            latency_ms: 1000,
            confidence,
            metadata: AiMetadata::default(),
        }
    }

    #[test]
    fn test_evaluate_good_response() {
        let evaluator = Evaluator::default();
        let req = create_test_request();
        let res = create_test_response(
            "Rust async fonctionne avec des futures et tokio runtime. Les futures sont des tâches asynchrones.",
            0.9
        );

        let result = evaluator.evaluate(&req, &res);
        assert!(result.score > 0.5);
        assert!(result.hallucination_risk < 0.5);
    }

    #[test]
    fn test_detect_hallucination() {
        let evaluator = Evaluator::default();
        
        let safe_output = "Rust est un langage de programmation.";
        let risky_output = "Je ne sais pas. Erreur. Contradiction dans les données.";

        let safe_risk = evaluator.detect_hallucination(safe_output, "Rust");
        let risky_risk = evaluator.detect_hallucination(risky_output, "Rust");

        assert!(risky_risk > safe_risk);
    }

    #[test]
    fn test_evaluate_coherence() {
        let evaluator = Evaluator::default();
        
        let coherent = "Ceci est un texte cohérent. Il contient des phrases bien formées.";
        let incoherent = "texte texte texte texte";

        let coherent_score = evaluator.evaluate_coherence(coherent);
        let incoherent_score = evaluator.evaluate_coherence(incoherent);

        assert!(coherent_score > incoherent_score);
    }

    #[test]
    fn test_evaluate_relevance() {
        let evaluator = Evaluator::default();
        
        let prompt = "Expliquer Rust async programming";
        let relevant = "Rust async programming utilise futures et async/await.";
        let irrelevant = "Python is a great language for web development.";

        let relevant_score = evaluator.evaluate_relevance(prompt, relevant);
        let irrelevant_score = evaluator.evaluate_relevance(prompt, irrelevant);

        assert!(relevant_score > irrelevant_score);
    }
}
