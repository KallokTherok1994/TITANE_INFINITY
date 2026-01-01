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
    pub fn analyze(&self, message: &str, context: Option<EmotionState>) -> EmotionState {
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

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EmotionTrend {
    Improving,
    Stable,
    Declining,
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS UNITAIRES
// ═══════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────────────
    // Tests EmotionTrend enum
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_emotion_trend_improving() {
        let trend = EmotionTrend::Improving;
        assert_eq!(trend, EmotionTrend::Improving);
    }

    #[test]
    fn test_emotion_trend_stable() {
        let trend = EmotionTrend::Stable;
        assert_eq!(trend, EmotionTrend::Stable);
    }

    #[test]
    fn test_emotion_trend_declining() {
        let trend = EmotionTrend::Declining;
        assert_eq!(trend, EmotionTrend::Declining);
    }

    #[test]
    fn test_emotion_trend_debug() {
        assert!(format!("{:?}", EmotionTrend::Improving).contains("Improving"));
        assert!(format!("{:?}", EmotionTrend::Stable).contains("Stable"));
        assert!(format!("{:?}", EmotionTrend::Declining).contains("Declining"));
    }

    #[test]
    fn test_emotion_trend_clone() {
        let trend = EmotionTrend::Improving;
        let cloned = trend;
        assert_eq!(trend, cloned);
    }

    #[test]
    fn test_emotion_trend_copy() {
        let trend = EmotionTrend::Stable;
        let copied = trend;
        assert_eq!(trend, copied);
    }

    #[test]
    fn test_emotion_trend_eq() {
        assert_eq!(EmotionTrend::Improving, EmotionTrend::Improving);
        assert_ne!(EmotionTrend::Improving, EmotionTrend::Declining);
        assert_ne!(EmotionTrend::Stable, EmotionTrend::Improving);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests EmotionAnalyzer
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_emotion_analyzer_new() {
        let analyzer = EmotionAnalyzer::new();
        let _ = analyzer;
    }

    #[test]
    fn test_emotion_analyzer_analyze_simple() {
        let analyzer = EmotionAnalyzer::new();
        let result = analyzer.analyze("Bonjour comment ça va?", None);
        // Vérifie que le résultat est valide (valence dans [-1, 1])
        assert!(result.valence >= -1.0 && result.valence <= 1.0);
        assert!(result.intensity >= 0.0 && result.intensity <= 1.0);
        assert!(result.energy >= 0.0 && result.energy <= 1.0);
    }

    #[test]
    fn test_emotion_analyzer_analyze_with_context() {
        let analyzer = EmotionAnalyzer::new();
        let context = EmotionState::new(0.5, 0.6, 0.7);
        let result = analyzer.analyze("Message test", Some(context));
        // Avec contexte positif, la valence moyenne devrait être influencée
        assert!(result.valence >= -1.0 && result.valence <= 1.0);
    }

    #[test]
    fn test_emotion_analyzer_analyze_positive_message() {
        let analyzer = EmotionAnalyzer::new();
        let result = analyzer.analyze("C'est super génial excellent!", None);
        // Message positif devrait avoir valence positive
        assert!(result.valence > 0.0);
    }

    #[test]
    fn test_emotion_analyzer_analyze_negative_message() {
        let analyzer = EmotionAnalyzer::new();
        let result = analyzer.analyze("J'ai un problème, il y a une erreur", None);
        // Message négatif devrait avoir valence négative
        assert!(result.valence < 0.0);
    }

    #[test]
    fn test_emotion_analyzer_analyze_fatigue() {
        let analyzer = EmotionAnalyzer::new();
        let result = analyzer.analyze("Je suis fatigué et épuisé", None);
        // Message de fatigue devrait avoir énergie réduite
        assert!(result.energy < 0.5);
    }

    #[test]
    fn test_emotion_analyzer_analyze_excitement() {
        let analyzer = EmotionAnalyzer::new();
        let result = analyzer.analyze("Wow!!! Incroyable!!!", None);
        // Message avec exclamations devrait avoir intensité élevée
        assert!(result.intensity > 0.5);
    }

    #[test]
    fn test_emotion_analyzer_analyze_context_fusion() {
        let analyzer = EmotionAnalyzer::new();
        let context = EmotionState::new(0.8, 0.3, 0.9);
        let result = analyzer.analyze("Message neutre", Some(context));
        // La fusion devrait être une moyenne
        assert!(result.valence >= -1.0 && result.valence <= 1.0);
    }

    #[test]
    fn test_emotion_analyzer_analyze_empty_message() {
        let analyzer = EmotionAnalyzer::new();
        let result = analyzer.analyze("", None);
        // Message vide devrait donner état neutre
        assert!(result.valence >= -1.0 && result.valence <= 1.0);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests EmotionAnalyzer emotional_trend
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_emotional_trend_empty_history() {
        let analyzer = EmotionAnalyzer::new();
        let history: Vec<EmotionState> = vec![];
        let trend = analyzer.emotional_trend(&history);
        assert_eq!(trend, EmotionTrend::Stable);
    }

    #[test]
    fn test_emotional_trend_single_item() {
        let analyzer = EmotionAnalyzer::new();
        let history = vec![EmotionState::new(0.5, 0.5, 0.5)];
        let trend = analyzer.emotional_trend(&history);
        assert_eq!(trend, EmotionTrend::Improving);
    }

    #[test]
    fn test_emotional_trend_improving() {
        let analyzer = EmotionAnalyzer::new();
        let history = vec![
            EmotionState::new(0.5, 0.5, 0.5),
            EmotionState::new(0.6, 0.5, 0.5),
            EmotionState::new(0.7, 0.5, 0.5),
            EmotionState::new(0.8, 0.5, 0.5),
            EmotionState::new(0.9, 0.5, 0.5),
        ];
        let trend = analyzer.emotional_trend(&history);
        assert_eq!(trend, EmotionTrend::Improving);
    }

    #[test]
    fn test_emotional_trend_declining() {
        let analyzer = EmotionAnalyzer::new();
        let history = vec![
            EmotionState::new(-0.4, 0.5, 0.5),
            EmotionState::new(-0.5, 0.5, 0.5),
            EmotionState::new(-0.6, 0.5, 0.5),
            EmotionState::new(-0.7, 0.5, 0.5),
            EmotionState::new(-0.8, 0.5, 0.5),
        ];
        let trend = analyzer.emotional_trend(&history);
        assert_eq!(trend, EmotionTrend::Declining);
    }

    #[test]
    fn test_emotional_trend_stable() {
        let analyzer = EmotionAnalyzer::new();
        let history = vec![
            EmotionState::new(0.0, 0.5, 0.5),
            EmotionState::new(0.1, 0.5, 0.5),
            EmotionState::new(-0.1, 0.5, 0.5),
            EmotionState::new(0.05, 0.5, 0.5),
            EmotionState::new(0.0, 0.5, 0.5),
        ];
        let trend = analyzer.emotional_trend(&history);
        assert_eq!(trend, EmotionTrend::Stable);
    }

    #[test]
    fn test_emotional_trend_uses_last_5() {
        let analyzer = EmotionAnalyzer::new();
        // 10 éléments, mais seuls les 5 derniers comptent
        let history = vec![
            EmotionState::new(-0.9, 0.5, 0.5), // ignoré
            EmotionState::new(-0.9, 0.5, 0.5), // ignoré
            EmotionState::new(-0.9, 0.5, 0.5), // ignoré
            EmotionState::new(-0.9, 0.5, 0.5), // ignoré
            EmotionState::new(-0.9, 0.5, 0.5), // ignoré
            EmotionState::new(0.5, 0.5, 0.5),
            EmotionState::new(0.6, 0.5, 0.5),
            EmotionState::new(0.7, 0.5, 0.5),
            EmotionState::new(0.8, 0.5, 0.5),
            EmotionState::new(0.9, 0.5, 0.5),
        ];
        let trend = analyzer.emotional_trend(&history);
        // Les 5 derniers sont tous positifs
        assert_eq!(trend, EmotionTrend::Improving);
    }

    #[test]
    fn test_emotional_trend_three_items() {
        let analyzer = EmotionAnalyzer::new();
        let history = vec![
            EmotionState::new(0.5, 0.5, 0.5),
            EmotionState::new(0.6, 0.5, 0.5),
            EmotionState::new(0.7, 0.5, 0.5),
        ];
        let trend = analyzer.emotional_trend(&history);
        assert_eq!(trend, EmotionTrend::Improving);
    }

    #[test]
    fn test_emotional_trend_boundary_positive() {
        let analyzer = EmotionAnalyzer::new();
        // Moyenne exactement 0.3 (seuil)
        let history = vec![
            EmotionState::new(0.3, 0.5, 0.5),
            EmotionState::new(0.3, 0.5, 0.5),
            EmotionState::new(0.3, 0.5, 0.5),
        ];
        let trend = analyzer.emotional_trend(&history);
        // avg_valence = 0.3, pas > 0.3 donc Stable
        assert_eq!(trend, EmotionTrend::Stable);
    }

    #[test]
    fn test_emotional_trend_boundary_negative() {
        let analyzer = EmotionAnalyzer::new();
        // Moyenne exactement -0.3 (seuil)
        let history = vec![
            EmotionState::new(-0.3, 0.5, 0.5),
            EmotionState::new(-0.3, 0.5, 0.5),
            EmotionState::new(-0.3, 0.5, 0.5),
        ];
        let trend = analyzer.emotional_trend(&history);
        // avg_valence = -0.3, pas < -0.3 donc Stable
        assert_eq!(trend, EmotionTrend::Stable);
    }

    #[test]
    fn test_emotional_trend_just_above_positive() {
        let analyzer = EmotionAnalyzer::new();
        let history = vec![
            EmotionState::new(0.31, 0.5, 0.5),
            EmotionState::new(0.31, 0.5, 0.5),
            EmotionState::new(0.31, 0.5, 0.5),
        ];
        let trend = analyzer.emotional_trend(&history);
        assert_eq!(trend, EmotionTrend::Improving);
    }

    #[test]
    fn test_emotional_trend_just_below_negative() {
        let analyzer = EmotionAnalyzer::new();
        let history = vec![
            EmotionState::new(-0.31, 0.5, 0.5),
            EmotionState::new(-0.31, 0.5, 0.5),
            EmotionState::new(-0.31, 0.5, 0.5),
        ];
        let trend = analyzer.emotional_trend(&history);
        assert_eq!(trend, EmotionTrend::Declining);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests d'intégration
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_analyzer_full_workflow() {
        let analyzer = EmotionAnalyzer::new();

        // Analyser plusieurs messages
        let e1 = analyzer.analyze("Je suis super content!", None);
        let e2 = analyzer.analyze("Génial excellent!", Some(e1.clone()));
        let e3 = analyzer.analyze("Fantastique!", Some(e2.clone()));

        // Vérifier la tendance
        let history = vec![e1, e2, e3];
        let trend = analyzer.emotional_trend(&history);

        // Série positive devrait donner Improving
        assert_eq!(trend, EmotionTrend::Improving);
    }

    #[test]
    fn test_analyzer_conversation_simulation() {
        let analyzer = EmotionAnalyzer::new();

        let messages = vec![
            "Bonjour!",
            "J'ai un problème",
            "C'est frustrant",
            "Mais j'ai trouvé la solution!",
            "Super génial!",
        ];

        let mut history = Vec::new();
        let mut context: Option<EmotionState> = None;

        for msg in messages {
            let emotion = analyzer.analyze(msg, context.clone());
            history.push(emotion.clone());
            context = Some(emotion);
        }

        assert_eq!(history.len(), 5);
        let _trend = analyzer.emotional_trend(&history);
    }

    #[test]
    fn test_emotion_analyzer_multiple_instances() {
        let analyzer1 = EmotionAnalyzer::new();
        let analyzer2 = EmotionAnalyzer::new();

        let result1 = analyzer1.analyze("Test message", None);
        let result2 = analyzer2.analyze("Test message", None);

        // Les deux analyseurs devraient donner les mêmes résultats
        assert_eq!(result1.valence, result2.valence);
        assert_eq!(result1.intensity, result2.intensity);
        assert_eq!(result1.energy, result2.energy);
    }

    #[test]
    fn test_emotion_analyzer_unicode() {
        let analyzer = EmotionAnalyzer::new();
        let result = analyzer.analyze("Très heureux! 😊 Génial!", None);
        assert!(result.valence >= -1.0 && result.valence <= 1.0);
    }

    #[test]
    fn test_emotion_analyzer_long_message() {
        let analyzer = EmotionAnalyzer::new();
        let long_msg = "super ".repeat(100);
        let result = analyzer.analyze(&long_msg, None);
        assert!(result.valence > 0.0);
    }
}
