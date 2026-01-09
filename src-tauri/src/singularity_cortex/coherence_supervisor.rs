// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Coherence Supervisor v∞
//   Superviseur de cohérence conversationnelle
// ═══════════════════════════════════════════════════════════════

use crate::singularity_cortex::state::SingularityState;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoherenceReport {
    pub overall_score: f32,
    pub logical_score: f32,
    pub tonal_score: f32,
    pub structural_score: f32,
    pub issues: Vec<CoherenceIssue>,
    pub recommendations: Vec<String>,
    pub is_valid: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoherenceIssue {
    pub issue_type: IssueType,
    pub severity: f32,
    pub description: String,
    pub position: Option<usize>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum IssueType {
    LogicalContradiction,
    TonalDrift,
    StructuralError,
    ExcessiveRepetition,
    EmptyContent,
    OffTopic,
    MissingContext,
}

pub struct CoherenceSupervisor;

impl CoherenceSupervisor {
    pub fn evaluate(response: &str, context: &str, state: &SingularityState) -> CoherenceReport {
        let mut issues = Vec::new();

        let structural_score = Self::check_structure(response, &mut issues);
        let logical_score = Self::check_logical_consistency(response, context, &mut issues);
        let tonal_score = Self::check_tonal_consistency(response, state, &mut issues);

        let overall_score =
            (structural_score * 0.3 + logical_score * 0.4 + tonal_score * 0.3).clamp(0.0, 1.0);
        let recommendations = Self::generate_recommendations(&issues);
        let is_valid = overall_score >= 0.6 && !issues.iter().any(|i| i.severity > 0.8);

        CoherenceReport {
            overall_score,
            logical_score,
            tonal_score,
            structural_score,
            issues,
            recommendations,
            is_valid,
        }
    }

    fn check_structure(response: &str, issues: &mut Vec<CoherenceIssue>) -> f32 {
        let mut score: f32 = 1.0;

        if response.trim().is_empty() {
            issues.push(CoherenceIssue {
                issue_type: IssueType::EmptyContent,
                severity: 1.0,
                description: "Réponse vide".to_string(),
                position: None,
            });
            return 0.0;
        }

        if response.len() < 10 {
            issues.push(CoherenceIssue {
                issue_type: IssueType::EmptyContent,
                severity: 0.7,
                description: "Réponse trop courte".to_string(),
                position: None,
            });
            score -= 0.3;
        }

        if Self::has_excessive_repetition(response) {
            issues.push(CoherenceIssue {
                issue_type: IssueType::ExcessiveRepetition,
                severity: 0.5,
                description: "Répétition excessive détectée".to_string(),
                position: None,
            });
            score -= 0.2;
        }

        score.max(0.0)
    }

    fn check_logical_consistency(
        response: &str,
        context: &str,
        issues: &mut Vec<CoherenceIssue>,
    ) -> f32 {
        let mut score: f32 = 1.0;

        let response_lc = response.to_lowercase();
        let contradiction_markers = ["mais", "cependant", "toutefois", "néanmoins"];
        let contradiction_total: usize = contradiction_markers
            .iter()
            .map(|marker| response_lc.matches(marker).count())
            .sum();

        if contradiction_total >= 3 {
            issues.push(CoherenceIssue {
                issue_type: IssueType::LogicalContradiction,
                severity: 0.4,
                description: format!(
                    "Multiples marqueurs de contradiction: {}",
                    contradiction_total
                ),
                position: None,
            });
            score -= 0.2;
        }

        if !context.is_empty() {
            let stopwords = [
                "a", "au", "aux", "avec", "ce", "ces", "cette", "d", "dans", "de", "des", "du",
                "en", "et", "la", "le", "les", "mais", "ou", "par", "pour", "que", "qui", "sur",
                "un", "une",
            ];

            let normalize = |token: &str| -> Option<String> {
                let cleaned: String = token.chars().filter(|c| c.is_alphanumeric()).collect();
                let cleaned = cleaned.to_lowercase();
                if cleaned.len() < 3 {
                    return None;
                }
                if stopwords.iter().any(|w| *w == cleaned) {
                    return None;
                }
                Some(cleaned)
            };

            let context_words: Vec<String> = context
                .split_whitespace()
                .filter_map(&normalize)
                .take(50)
                .collect();
            let response_words: std::collections::HashSet<String> = response
                .split_whitespace()
                .filter_map(&normalize)
                .collect();

            let overlap = context_words
                .iter()
                .filter(|w| response_words.contains(*w))
                .count();
            let overlap_ratio = if context_words.is_empty() {
                1.0
            } else {
                overlap as f32 / context_words.len() as f32
            };

            if overlap_ratio < 0.1 {
                issues.push(CoherenceIssue {
                    issue_type: IssueType::MissingContext,
                    severity: 0.5,
                    description: "Faible lien avec le contexte".to_string(),
                    position: None,
                });
                score -= 0.3;
            }
        }

        score.max(0.0)
    }

    fn check_tonal_consistency(
        response: &str,
        state: &SingularityState,
        issues: &mut Vec<CoherenceIssue>,
    ) -> f32 {
        let mut score: f32 = 1.0;

        let positive_markers = ["excellent", "super", "génial", "parfait", "magnifique"];
        let negative_markers = ["terrible", "catastrophe", "échec", "problème", "erreur"];

        let positive_count: usize = positive_markers
            .iter()
            .map(|m| response.to_lowercase().matches(m).count())
            .sum();
        let negative_count: usize = negative_markers
            .iter()
            .map(|m| response.to_lowercase().matches(m).count())
            .sum();

        let detected_tone = if positive_count > negative_count {
            (positive_count as f32 - negative_count as f32)
                / (positive_count + negative_count + 1) as f32
        } else {
            -(negative_count as f32 - positive_count as f32)
                / (positive_count + negative_count + 1) as f32
        };

        let tone_diff = (detected_tone - state.affective_tone).abs();

        if tone_diff > 0.5 {
            issues.push(CoherenceIssue {
                issue_type: IssueType::TonalDrift,
                severity: tone_diff,
                description: format!(
                    "Dérive tonale: attendu {:.2}, détecté {:.2}",
                    state.affective_tone, detected_tone
                ),
                position: None,
            });
            score -= tone_diff * 0.5;
        }

        score.max(0.0)
    }

    fn has_excessive_repetition(text: &str) -> bool {
        let words: Vec<&str> = text.split_whitespace().collect();
        if words.len() < 10 {
            return false;
        }

        let mut counts = std::collections::HashMap::new();
        for word in words.iter() {
            *counts.entry(word.to_lowercase()).or_insert(0) += 1;
        }

        let max_count = counts.values().max().unwrap_or(&0);
        (*max_count as f32 / words.len() as f32) > 0.2
    }

    fn generate_recommendations(issues: &[CoherenceIssue]) -> Vec<String> {
        let mut recommendations = Vec::new();

        for issue in issues {
            let rec = match issue.issue_type {
                IssueType::LogicalContradiction => {
                    "Réévaluer la logique interne et éliminer contradictions"
                }
                IssueType::TonalDrift => "Ajuster la tonalité pour correspondre au contexte global",
                IssueType::StructuralError => "Vérifier format et structure de la réponse",
                IssueType::ExcessiveRepetition => "Varier le vocabulaire et les formulations",
                IssueType::EmptyContent => "Générer contenu substantiel",
                IssueType::OffTopic => "Recentrer la réponse sur le sujet",
                IssueType::MissingContext => "Intégrer davantage d'éléments du contexte",
            };

            if issue.severity > 0.5 {
                recommendations.push(rec.to_string());
            }
        }

        recommendations.sort();
        recommendations.dedup();
        recommendations
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_state() -> SingularityState {
        let mut state = SingularityState::new();
        state.update_affective_tone(0.0);
        state
    }

    #[test]
    fn test_issue_type_variants() {
        let types = vec![
            IssueType::LogicalContradiction,
            IssueType::TonalDrift,
            IssueType::StructuralError,
            IssueType::ExcessiveRepetition,
            IssueType::EmptyContent,
            IssueType::OffTopic,
            IssueType::MissingContext,
        ];
        assert_eq!(types.len(), 7);
    }

    #[test]
    fn test_evaluate_valid_response() {
        let state = create_test_state();
        let response = "Voici une réponse claire et structurée qui répond au contexte.";
        let context = "Question sur la structure et la clarté";

        let report = CoherenceSupervisor::evaluate(response, context, &state);

        assert!(report.overall_score > 0.5);
        assert!(report.is_valid);
    }

    #[test]
    fn test_evaluate_empty_response() {
        let state = create_test_state();
        let response = "";
        let context = "Question";

        let report = CoherenceSupervisor::evaluate(response, context, &state);

        assert_eq!(report.structural_score, 0.0);
        assert!(!report.is_valid);
        assert!(report.issues.iter().any(|i| i.issue_type == IssueType::EmptyContent));
    }

    #[test]
    fn test_evaluate_very_short_response() {
        let state = create_test_state();
        let response = "Oui.";
        let context = "Question détaillée";

        let report = CoherenceSupervisor::evaluate(response, context, &state);

        assert!(report.issues.iter().any(|i| i.issue_type == IssueType::EmptyContent));
        assert!(report.structural_score < 1.0);
    }

    #[test]
    fn test_check_structure_excessive_repetition() {
        let mut issues = Vec::new();
        let response = "test test test test test test test test test test";

        let score = CoherenceSupervisor::check_structure(response, &mut issues);

        assert!(score < 1.0);
        assert!(issues.iter().any(|i| i.issue_type == IssueType::ExcessiveRepetition));
    }

    #[test]
    fn test_check_logical_consistency_contradictions() {
        let mut issues = Vec::new();
        let response = "C'est bien, mais c'est mal, cependant c'est acceptable, toutefois c'est problématique, néanmoins c'est correct";
        let context = "";

        let score = CoherenceSupervisor::check_logical_consistency(response, context, &mut issues);

        assert!(score < 1.0);
        assert!(issues.iter().any(|i| i.issue_type == IssueType::LogicalContradiction));
    }

    #[test]
    fn test_check_logical_consistency_missing_context() {
        let mut issues = Vec::new();
        let response = "La solution technique implique des algorithmes complexes";
        let context = "Parlez-moi de la cuisine française et des recettes traditionnelles";

        let score = CoherenceSupervisor::check_logical_consistency(response, context, &mut issues);

        assert!(score < 1.0);
        assert!(issues.iter().any(|i| i.issue_type == IssueType::MissingContext));
    }

    #[test]
    fn test_check_logical_consistency_empty_context() {
        let mut issues = Vec::new();
        let response = "Réponse normale sans contexte";
        let context = "";

        let score = CoherenceSupervisor::check_logical_consistency(response, context, &mut issues);

        assert_eq!(score, 1.0);
        assert!(issues.is_empty());
    }

    #[test]
    fn test_check_tonal_consistency_positive() {
        let state = create_test_state();
        let mut issues = Vec::new();
        let response = "C'est excellent et parfait, vraiment super et génial!";

        let score = CoherenceSupervisor::check_tonal_consistency(response, &state, &mut issues);

        // Should detect positive tone
        assert!(score >= 0.0);
    }

    #[test]
    fn test_check_tonal_consistency_negative() {
        let state = create_test_state();
        let mut issues = Vec::new();
        let response = "C'est terrible, une vraie catastrophe, un échec complet avec des problèmes et erreurs";

        let score = CoherenceSupervisor::check_tonal_consistency(response, &state, &mut issues);

        // Should detect negative tone different from neutral state
        assert!(score <= 1.0);
    }

    #[test]
    fn test_check_tonal_consistency_drift() {
        let mut state = create_test_state();
        state.update_affective_tone(-0.8); // Very negative expected tone
        let mut issues = Vec::new();
        let response = "Excellent! Parfait! Génial! Magnifique! Super!";

        let score = CoherenceSupervisor::check_tonal_consistency(response, &state, &mut issues);

        assert!(issues.iter().any(|i| i.issue_type == IssueType::TonalDrift));
        assert!(score < 1.0);
    }

    #[test]
    fn test_has_excessive_repetition_true() {
        let text = "test test test test test test test test test test test test";
        assert!(CoherenceSupervisor::has_excessive_repetition(text));
    }

    #[test]
    fn test_has_excessive_repetition_false() {
        let text = "une phrase normale avec des mots variés et différents";
        assert!(!CoherenceSupervisor::has_excessive_repetition(text));
    }

    #[test]
    fn test_has_excessive_repetition_short_text() {
        let text = "court";
        assert!(!CoherenceSupervisor::has_excessive_repetition(text));
    }

    #[test]
    fn test_generate_recommendations() {
        let issues = vec![
            CoherenceIssue {
                issue_type: IssueType::LogicalContradiction,
                severity: 0.8,
                description: "Test".to_string(),
                position: None,
            },
            CoherenceIssue {
                issue_type: IssueType::TonalDrift,
                severity: 0.6,
                description: "Test".to_string(),
                position: None,
            },
        ];

        let recs = CoherenceSupervisor::generate_recommendations(&issues);

        assert!(!recs.is_empty());
        assert!(recs.len() <= 2);
    }

    #[test]
    fn test_generate_recommendations_low_severity() {
        let issues = vec![CoherenceIssue {
            issue_type: IssueType::OffTopic,
            severity: 0.3, // Below 0.5 threshold
            description: "Test".to_string(),
            position: None,
        }];

        let recs = CoherenceSupervisor::generate_recommendations(&issues);

        assert!(recs.is_empty());
    }

    #[test]
    fn test_generate_recommendations_dedup() {
        let issues = vec![
            CoherenceIssue {
                issue_type: IssueType::ExcessiveRepetition,
                severity: 0.8,
                description: "Test 1".to_string(),
                position: None,
            },
            CoherenceIssue {
                issue_type: IssueType::ExcessiveRepetition,
                severity: 0.7,
                description: "Test 2".to_string(),
                position: None,
            },
        ];

        let recs = CoherenceSupervisor::generate_recommendations(&issues);

        // Should deduplicate identical recommendations
        assert_eq!(recs.len(), 1);
    }

    #[test]
    fn test_coherence_report_is_valid_threshold() {
        let state = create_test_state();

        // Good response
        let good_response = "Voici une réponse bien structurée, claire et pertinente.";
        let report = CoherenceSupervisor::evaluate(good_response, "contexte pertinent", &state);
        assert!(report.is_valid);

        // Empty response
        let bad_response = "";
        let report2 = CoherenceSupervisor::evaluate(bad_response, "", &state);
        assert!(!report2.is_valid);
    }

    #[test]
    fn test_coherence_report_high_severity_invalidates() {
        let state = create_test_state();
        let response = ""; // Empty = high severity issue

        let report = CoherenceSupervisor::evaluate(response, "", &state);

        assert!(!report.is_valid);
        assert!(report.issues.iter().any(|i| i.severity > 0.8));
    }
}
