/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — INTENT ANALYZER
 * Analyse d'intention conversationnelle
 * ═══════════════════════════════════════════════════════════════════
 */
use super::types::Intention;

/// Analyseur d'intentions
pub struct IntentAnalyzer {
    // Futurs modèles ML peuvent être ajoutés ici
}

impl IntentAnalyzer {
    pub fn new() -> Self {
        Self {}
    }

    /// Analyser l'intention d'un message
    pub fn analyze(&self, message: &str) -> Intention {
        Intention::analyze(message)
    }

    /// Calculer un score de confiance pour l'intention
    pub fn confidence_score(&self, message: &str, intention: &Intention) -> f32 {
        let lower = message.to_lowercase();

        match intention {
            Intention::Question => {
                let question_markers = ["?", "comment", "pourquoi", "quel", "où"];
                let count = question_markers
                    .iter()
                    .filter(|marker| lower.contains(*marker))
                    .count();
                (count as f32 * 0.25).min(1.0)
            }
            Intention::Action => {
                let action_markers = ["peux-tu", "pourrais-tu", "créer", "faire"];
                let count = action_markers
                    .iter()
                    .filter(|marker| lower.contains(*marker))
                    .count();
                (count as f32 * 0.25).min(1.0)
            }
            _ => 0.5,
        }
    }
}
