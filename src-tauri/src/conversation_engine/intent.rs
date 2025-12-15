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

// ═══════════════════════════════════════════════════════════════════════════
// TESTS UNITAIRES
// ═══════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────────────
    // Tests IntentAnalyzer création
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_intent_analyzer_new() {
        let analyzer = IntentAnalyzer::new();
        let _ = analyzer;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests IntentAnalyzer analyze
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_analyze_question_with_mark() {
        let analyzer = IntentAnalyzer::new();
        let result = analyzer.analyze("Qu'est-ce que c'est?");
        assert_eq!(result, Intention::Question);
    }

    #[test]
    fn test_analyze_question_comment() {
        let analyzer = IntentAnalyzer::new();
        let result = analyzer.analyze("comment faire cela");
        assert_eq!(result, Intention::Question);
    }

    #[test]
    fn test_analyze_question_pourquoi() {
        let analyzer = IntentAnalyzer::new();
        let result = analyzer.analyze("pourquoi est-ce ainsi");
        assert_eq!(result, Intention::Question);
    }

    #[test]
    fn test_analyze_question_quel() {
        let analyzer = IntentAnalyzer::new();
        let result = analyzer.analyze("quel est ton nom");
        assert_eq!(result, Intention::Question);
    }

    #[test]
    fn test_analyze_question_ou() {
        let analyzer = IntentAnalyzer::new();
        let result = analyzer.analyze("où est le fichier");
        assert_eq!(result, Intention::Question);
    }

    #[test]
    fn test_analyze_action_peux_tu() {
        let analyzer = IntentAnalyzer::new();
        let result = analyzer.analyze("peux-tu m'aider");
        assert_eq!(result, Intention::Action);
    }

    #[test]
    fn test_analyze_action_pourrais_tu() {
        let analyzer = IntentAnalyzer::new();
        let result = analyzer.analyze("pourrais-tu faire cela");
        assert_eq!(result, Intention::Action);
    }

    #[test]
    fn test_analyze_action_creer() {
        let analyzer = IntentAnalyzer::new();
        let result = analyzer.analyze("créer un nouveau fichier");
        assert_eq!(result, Intention::Action);
    }

    #[test]
    fn test_analyze_action_faire() {
        let analyzer = IntentAnalyzer::new();
        let result = analyzer.analyze("faire une sauvegarde");
        assert_eq!(result, Intention::Action);
    }

    #[test]
    fn test_analyze_action_analyser() {
        let analyzer = IntentAnalyzer::new();
        let result = analyzer.analyze("analyser ce code");
        assert_eq!(result, Intention::Action);
    }

    #[test]
    fn test_analyze_emotion_ressens() {
        let analyzer = IntentAnalyzer::new();
        let result = analyzer.analyze("je ressens de la joie");
        assert_eq!(result, Intention::Emotion);
    }

    #[test]
    fn test_analyze_emotion_heureux() {
        let analyzer = IntentAnalyzer::new();
        let result = analyzer.analyze("je suis heureux");
        assert_eq!(result, Intention::Emotion);
    }

    #[test]
    fn test_analyze_emotion_triste() {
        let analyzer = IntentAnalyzer::new();
        let result = analyzer.analyze("je suis triste");
        assert_eq!(result, Intention::Emotion);
    }

    #[test]
    fn test_analyze_emotion_inquiet() {
        let analyzer = IntentAnalyzer::new();
        let result = analyzer.analyze("je suis inquiet");
        assert_eq!(result, Intention::Emotion);
    }

    #[test]
    fn test_analyze_meta_conversation() {
        let analyzer = IntentAnalyzer::new();
        let result = analyzer.analyze("cette conversation est intéressante");
        assert_eq!(result, Intention::Meta);
    }

    #[test]
    fn test_analyze_meta_discuter() {
        let analyzer = IntentAnalyzer::new();
        let result = analyzer.analyze("discuter de ce sujet");
        assert_eq!(result, Intention::Meta);
    }

    #[test]
    fn test_analyze_meta_parlons() {
        let analyzer = IntentAnalyzer::new();
        let result = analyzer.analyze("parlons de autre chose");
        assert_eq!(result, Intention::Meta);
    }

    #[test]
    fn test_analyze_clarification_default() {
        let analyzer = IntentAnalyzer::new();
        let result = analyzer.analyze("bonjour");
        assert_eq!(result, Intention::Clarification);
    }

    #[test]
    fn test_analyze_empty_message() {
        let analyzer = IntentAnalyzer::new();
        let result = analyzer.analyze("");
        assert_eq!(result, Intention::Clarification);
    }

    #[test]
    fn test_analyze_case_insensitive() {
        let analyzer = IntentAnalyzer::new();
        let result = analyzer.analyze("COMMENT FAIRE CELA?");
        assert_eq!(result, Intention::Question);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests IntentAnalyzer confidence_score
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_confidence_score_question_single_marker() {
        let analyzer = IntentAnalyzer::new();
        let score = analyzer.confidence_score("C'est quoi?", &Intention::Question);
        assert_eq!(score, 0.25);
    }

    #[test]
    fn test_confidence_score_question_multiple_markers() {
        let analyzer = IntentAnalyzer::new();
        let score = analyzer.confidence_score("comment et pourquoi?", &Intention::Question);
        assert_eq!(score, 0.75); // 3 marqueurs: comment, pourquoi, ?
    }

    #[test]
    fn test_confidence_score_question_max_1() {
        let analyzer = IntentAnalyzer::new();
        let score = analyzer.confidence_score("comment pourquoi quel où?", &Intention::Question);
        assert_eq!(score, 1.0); // Max à 1.0
    }

    #[test]
    fn test_confidence_score_question_no_markers() {
        let analyzer = IntentAnalyzer::new();
        let score = analyzer.confidence_score("bonjour", &Intention::Question);
        assert_eq!(score, 0.0);
    }

    #[test]
    fn test_confidence_score_action_single_marker() {
        let analyzer = IntentAnalyzer::new();
        let score = analyzer.confidence_score("peux-tu aider", &Intention::Action);
        assert_eq!(score, 0.25);
    }

    #[test]
    fn test_confidence_score_action_multiple_markers() {
        let analyzer = IntentAnalyzer::new();
        let score = analyzer.confidence_score("peux-tu créer et faire", &Intention::Action);
        assert_eq!(score, 0.75); // 3 marqueurs
    }

    #[test]
    fn test_confidence_score_action_max_1() {
        let analyzer = IntentAnalyzer::new();
        let score =
            analyzer.confidence_score("peux-tu pourrais-tu créer faire", &Intention::Action);
        assert_eq!(score, 1.0);
    }

    #[test]
    fn test_confidence_score_action_no_markers() {
        let analyzer = IntentAnalyzer::new();
        let score = analyzer.confidence_score("bonjour", &Intention::Action);
        assert_eq!(score, 0.0);
    }

    #[test]
    fn test_confidence_score_emotion_default() {
        let analyzer = IntentAnalyzer::new();
        let score = analyzer.confidence_score("n'importe quoi", &Intention::Emotion);
        assert_eq!(score, 0.5);
    }

    #[test]
    fn test_confidence_score_clarification_default() {
        let analyzer = IntentAnalyzer::new();
        let score = analyzer.confidence_score("n'importe quoi", &Intention::Clarification);
        assert_eq!(score, 0.5);
    }

    #[test]
    fn test_confidence_score_meta_default() {
        let analyzer = IntentAnalyzer::new();
        let score = analyzer.confidence_score("n'importe quoi", &Intention::Meta);
        assert_eq!(score, 0.5);
    }

    #[test]
    fn test_confidence_score_case_insensitive() {
        let analyzer = IntentAnalyzer::new();
        let score = analyzer.confidence_score("COMMENT POURQUOI?", &Intention::Question);
        assert_eq!(score, 0.75);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests d'intégration
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_analyze_and_confidence_question() {
        let analyzer = IntentAnalyzer::new();
        let msg = "comment faire cela?";
        let intention = analyzer.analyze(msg);
        let confidence = analyzer.confidence_score(msg, &intention);

        assert_eq!(intention, Intention::Question);
        assert!(confidence > 0.0);
    }

    #[test]
    fn test_analyze_and_confidence_action() {
        let analyzer = IntentAnalyzer::new();
        let msg = "peux-tu créer un fichier";
        let intention = analyzer.analyze(msg);
        let confidence = analyzer.confidence_score(msg, &intention);

        assert_eq!(intention, Intention::Action);
        assert!(confidence > 0.0);
    }

    #[test]
    fn test_multiple_analyses() {
        let analyzer = IntentAnalyzer::new();

        let messages = vec![
            ("comment ça marche?", Intention::Question),
            ("peux-tu m'aider", Intention::Action),
            ("je ressens de la joie", Intention::Emotion),
            ("parlons de cela", Intention::Meta),
            ("salut", Intention::Clarification),
        ];

        for (msg, expected) in messages {
            let result = analyzer.analyze(msg);
            assert_eq!(result, expected, "Failed for message: {}", msg);
        }
    }

    #[test]
    fn test_analyzer_reusability() {
        let analyzer = IntentAnalyzer::new();

        // Utiliser le même analyseur plusieurs fois
        for _ in 0..10 {
            let _ = analyzer.analyze("test message");
            let _ = analyzer.confidence_score("test", &Intention::Question);
        }
    }

    #[test]
    fn test_analyzer_unicode_message() {
        let analyzer = IntentAnalyzer::new();
        let result = analyzer.analyze("Comment ça marche? 🤔");
        assert_eq!(result, Intention::Question);
    }

    #[test]
    fn test_analyzer_long_message() {
        let analyzer = IntentAnalyzer::new();
        let long_msg = "Bonjour ".repeat(100) + "comment ça va?";
        let result = analyzer.analyze(&long_msg);
        assert_eq!(result, Intention::Question);
    }

    #[test]
    fn test_analyzer_special_chars() {
        let analyzer = IntentAnalyzer::new();
        let result = analyzer.analyze("Comment\n\t\rfaire?");
        assert_eq!(result, Intention::Question);
    }
}
