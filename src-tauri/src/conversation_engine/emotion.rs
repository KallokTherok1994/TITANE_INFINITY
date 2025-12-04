/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — EMOTION ANALYZER
 * Analyse émotionnelle conversationnelle
 * ═══════════════════════════════════════════════════════════════════
 */

use super::types::EmotionState;

/// Analyseur d'émotions
pub struct EmotionAnalyzer {
    // Futurs modèles ML peuvent être ajoutés ici
}

impl EmotionAnalyzer {
    pub fn new() -> Self {
        Self {}
    }

    /// Analyser l'émotion d'un message
    pub fn analyze(
        &self,
        message: &str,
        context: Option<EmotionState>,
    ) -> EmotionState {
        let mut detected = EmotionState::analyze(message);

        // Fusionner avec contexte si fourni
        if let Some(ctx) = context {
            detected.valence = (detected.valence + ctx.valence) / 2.0;
            detected.intensity = detected.intensity.max(ctx.intensity);
            detected.energy = (detected.energy + ctx.energy) / 2.0;
        }

        detected
    }

    /// Calculer tendance émotionnelle
    pub fn emotional_trend(&self, history: &[EmotionState]) -> EmotionTrend {
        if history.is_empty() {
            return EmotionTrend::Stable;
        }

        let recent = &history[history.len().saturating_sub(5)..];
        let avg_valence: f32 = recent.iter().map(|e| e.valence).sum::<f32>() / recent.len() as f32;

        if avg_valence > 0.3 {
            EmotionTrend::Improving
        } else if avg_valence < -0.3 {
            EmotionTrend::Declining
        } else {
            EmotionTrend::Stable
        }
    }
}

#[derive(Debug, Clone, Copy)]
pub enum EmotionTrend {
    Improving,
    Stable,
    Declining,
}
