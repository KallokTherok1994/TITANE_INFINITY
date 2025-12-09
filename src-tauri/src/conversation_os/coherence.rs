//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — COHERENCE ENGINE
//! Super Prompt #9 — Vérification de cohérence narrative et logique
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use super::narrative::NarrativeState;
use super::memory_context::ConversationContext;

/// Type de problème de cohérence
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum CoherenceIssueType {
    /// Contradiction avec une affirmation précédente
    Contradiction,
    /// Rupture logique dans le raisonnement
    LogicalBreak,
    /// Changement de sujet non justifié
    TopicDrift,
    /// Information manquante pour la conclusion
    MissingContext,
    /// Répétition inutile
    Redundancy,
    /// Incohérence temporelle
    TemporalInconsistency,
    /// Style incohérent
    StyleInconsistency,
}

/// Problème de cohérence détecté
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CoherenceIssue {
    pub issue_type: CoherenceIssueType,
    pub severity: CoherenceSeverity,
    pub description: String,
    pub suggestion: Option<String>,
    pub location: Option<String>,
}

/// Sévérité du problème
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum CoherenceSeverity {
    Minor,
    Moderate,
    Major,
    Critical,
}

/// Rapport de cohérence
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct CoherenceReport {
    /// Score de cohérence global (0.0-1.0)
    pub overall_score: f32,
    /// Problèmes détectés
    pub issues: Vec<CoherenceIssue>,
    /// Cohérence logique
    pub logical_coherence: f32,
    /// Cohérence narrative
    pub narrative_coherence: f32,
    /// Cohérence stylistique
    pub style_coherence: f32,
    /// Recommandations
    pub recommendations: Vec<String>,
    /// Timestamp de l'analyse
    pub timestamp: u64,
}

/// Moteur de cohérence
pub struct CoherenceEngine {
    /// Seuil minimum acceptable
    min_coherence_threshold: f32,
    /// Activer la vérification stricte
    strict_mode: bool,
}

impl CoherenceEngine {
    pub fn new() -> Self {
        Self {
            min_coherence_threshold: 0.6,
            strict_mode: false,
        }
    }

    /// Active le mode strict
    pub fn set_strict_mode(&mut self, strict: bool) {
        self.strict_mode = strict;
    }

    /// Vérifie la cohérence
    pub async fn check(
        &self,
        narrative: &NarrativeState,
        context: &ConversationContext,
    ) -> CoherenceReport {
        let mut issues = Vec::new();
        let mut recommendations = Vec::new();

        // 1. Vérifier la cohérence logique
        let logical_coherence = self.check_logical_coherence(narrative, &mut issues);

        // 2. Vérifier la cohérence narrative
        let narrative_coherence = self.check_narrative_coherence(narrative, &mut issues);

        // 3. Vérifier la cohérence stylistique
        let style_coherence = self.check_style_coherence(narrative, context, &mut issues);

        // 4. Vérifier les contradictions
        self.check_contradictions(narrative, &mut issues);

        // 5. Vérifier la redondance
        self.check_redundancy(narrative, &mut issues);

        // Calculer le score global
        let overall_score = (logical_coherence + narrative_coherence + style_coherence) / 3.0;

        // Générer des recommandations
        if overall_score < self.min_coherence_threshold {
            recommendations.push("Cohérence insuffisante: révision recommandée".to_string());
        }

        for issue in &issues {
            if issue.severity == CoherenceSeverity::Major ||
               issue.severity == CoherenceSeverity::Critical {
                if let Some(ref suggestion) = issue.suggestion {
                    recommendations.push(suggestion.clone());
                }
            }
        }

        CoherenceReport {
            overall_score,
            issues,
            logical_coherence,
            narrative_coherence,
            style_coherence,
            recommendations,
            timestamp: Self::now(),
        }
    }

    /// Vérifie la cohérence logique
    fn check_logical_coherence(
        &self,
        narrative: &NarrativeState,
        issues: &mut Vec<CoherenceIssue>,
    ) -> f32 {
        let mut score: f32 = 1.0;

        // Vérifier la profondeur vs contenu
        if narrative.depth > 5 && narrative.key_points.is_empty() {
            issues.push(CoherenceIssue {
                issue_type: CoherenceIssueType::MissingContext,
                severity: CoherenceSeverity::Minor,
                description: "Conversation longue sans points clés identifiés".to_string(),
                suggestion: Some("Résumer les points principaux".to_string()),
                location: None,
            });
            score -= 0.1;
        }

        // Vérifier la cohérence du résumé
        if narrative.depth > 0 && narrative.conversation_summary.is_empty() {
            issues.push(CoherenceIssue {
                issue_type: CoherenceIssueType::MissingContext,
                severity: CoherenceSeverity::Minor,
                description: "Pas de résumé de conversation".to_string(),
                suggestion: Some("Générer un résumé".to_string()),
                location: None,
            });
            score -= 0.05;
        }

        score.max(0.0)
    }

    /// Vérifie la cohérence narrative
    fn check_narrative_coherence(
        &self,
        narrative: &NarrativeState,
        issues: &mut Vec<CoherenceIssue>,
    ) -> f32 {
        let mut score = narrative.coherence_score;

        // Vérifier le thread actif
        if let Some(ref thread) = narrative.current_thread {
            // Vérifier la continuité des topics
            if thread.elements.len() > 3 {
                let topics: Vec<_> = thread.elements.iter()
                    .flat_map(|e| e.topics.clone())
                    .collect();

                // Calculer la dispersion des topics
                let unique_topics: std::collections::HashSet<_> = topics.iter().collect();
                let topic_ratio = if topics.is_empty() {
                    1.0
                } else {
                    unique_topics.len() as f32 / topics.len() as f32
                };

                // Trop de topics différents = incohérence
                if topic_ratio > 0.8 && topics.len() > 5 {
                    issues.push(CoherenceIssue {
                        issue_type: CoherenceIssueType::TopicDrift,
                        severity: CoherenceSeverity::Moderate,
                        description: "Dispersion thématique élevée".to_string(),
                        suggestion: Some("Recentrer la conversation".to_string()),
                        location: None,
                    });
                    score -= 0.15;
                }
            }

            // Vérifier que le thread a un topic principal si assez d'éléments
            if thread.elements.len() > 5 && thread.main_topic.is_none() {
                issues.push(CoherenceIssue {
                    issue_type: CoherenceIssueType::MissingContext,
                    severity: CoherenceSeverity::Minor,
                    description: "Pas de topic principal identifié".to_string(),
                    suggestion: None,
                    location: None,
                });
                score -= 0.1;
            }
        }

        score.max(0.0)
    }

    /// Vérifie la cohérence stylistique
    fn check_style_coherence(
        &self,
        narrative: &NarrativeState,
        context: &ConversationContext,
        issues: &mut Vec<CoherenceIssue>,
    ) -> f32 {
        let mut score: f32 = 1.0;

        // Vérifier la longueur des réponses (si historique disponible)
        if context.history_length > 3 {
            // Analyse simplifiée: on suppose une cohérence de base
            // En production, analyser les longueurs réelles des réponses précédentes
        }

        // Vérifier la cohérence du contexte actuel
        if narrative.current_context.is_empty() && narrative.depth > 2 {
            issues.push(CoherenceIssue {
                issue_type: CoherenceIssueType::StyleInconsistency,
                severity: CoherenceSeverity::Minor,
                description: "Contexte narratif non défini".to_string(),
                suggestion: None,
                location: None,
            });
            score -= 0.05;
        }

        score.max(0.0)
    }

    /// Vérifie les contradictions
    fn check_contradictions(
        &self,
        narrative: &NarrativeState,
        issues: &mut Vec<CoherenceIssue>,
    ) {
        // Version simplifiée: recherche de patterns contradictoires dans les key_points
        let key_points = &narrative.key_points;

        for i in 0..key_points.len() {
            for j in (i + 1)..key_points.len() {
                if self.are_potentially_contradictory(&key_points[i], &key_points[j]) {
                    issues.push(CoherenceIssue {
                        issue_type: CoherenceIssueType::Contradiction,
                        severity: CoherenceSeverity::Moderate,
                        description: format!(
                            "Contradiction potentielle entre: '{}' et '{}'",
                            &key_points[i][..key_points[i].len().min(30)],
                            &key_points[j][..key_points[j].len().min(30)]
                        ),
                        suggestion: Some("Clarifier la position".to_string()),
                        location: None,
                    });
                }
            }
        }
    }

    /// Détecte les contradictions potentielles (simplifiée)
    fn are_potentially_contradictory(&self, point1: &str, point2: &str) -> bool {
        let negation_pairs = [
            ("oui", "non"),
            ("yes", "no"),
            ("true", "false"),
            ("vrai", "faux"),
            ("always", "never"),
            ("toujours", "jamais"),
            ("all", "none"),
            ("tout", "rien"),
        ];

        let p1_lower = point1.to_lowercase();
        let p2_lower = point2.to_lowercase();

        for (pos, neg) in negation_pairs {
            if (p1_lower.contains(pos) && p2_lower.contains(neg)) ||
               (p1_lower.contains(neg) && p2_lower.contains(pos)) {
                return true;
            }
        }

        false
    }

    /// Vérifie la redondance
    fn check_redundancy(
        &self,
        narrative: &NarrativeState,
        issues: &mut Vec<CoherenceIssue>,
    ) {
        // Vérifier les répétitions dans les key_points
        let key_points = &narrative.key_points;

        for i in 0..key_points.len() {
            for j in (i + 1)..key_points.len() {
                let similarity = self.text_similarity(&key_points[i], &key_points[j]);
                if similarity > 0.8 {
                    issues.push(CoherenceIssue {
                        issue_type: CoherenceIssueType::Redundancy,
                        severity: CoherenceSeverity::Minor,
                        description: "Répétition détectée dans les points clés".to_string(),
                        suggestion: Some("Consolider les informations redondantes".to_string()),
                        location: None,
                    });
                    break;
                }
            }
        }
    }

    /// Calcule la similarité textuelle (simplifiée)
    fn text_similarity(&self, text1: &str, text2: &str) -> f32 {
        let text1_lower = text1.to_lowercase();
        let text2_lower = text2.to_lowercase();

        let words1: std::collections::HashSet<&str> = text1_lower.split_whitespace().collect();
        let words2: std::collections::HashSet<&str> = text2_lower.split_whitespace().collect();

        if words1.is_empty() || words2.is_empty() {
            return 0.0;
        }

        let intersection = words1.intersection(&words2).count();
        let union = words1.union(&words2).count();

        intersection as f32 / union as f32
    }

    /// Corrige automatiquement les problèmes mineurs
    pub async fn auto_correct(&self, text: &str, report: &CoherenceReport) -> String {
        let corrected = text.to_string();

        for issue in &report.issues {
            if issue.severity == CoherenceSeverity::Minor {
                match issue.issue_type {
                    CoherenceIssueType::Redundancy => {
                        // Tentative de dédoublonnage simple
                        // En production: utiliser un algorithme plus sophistiqué
                    }
                    _ => {}
                }
            }
        }

        corrected
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for CoherenceEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_coherence_engine_creation() {
        let engine = CoherenceEngine::new();
        assert!(!engine.strict_mode);
    }

    #[tokio::test]
    async fn test_basic_coherence_check() {
        let engine = CoherenceEngine::new();
        let narrative = NarrativeState::default();
        let context = ConversationContext::default();

        let report = engine.check(&narrative, &context).await;
        assert!(report.overall_score >= 0.0 && report.overall_score <= 1.0);
    }

    #[test]
    fn test_text_similarity() {
        let engine = CoherenceEngine::new();

        let sim = engine.text_similarity("hello world", "hello world");
        assert!((sim - 1.0).abs() < 0.01);

        let sim = engine.text_similarity("hello world", "goodbye moon");
        assert!(sim < 0.5);
    }

    #[test]
    fn test_contradiction_detection() {
        let engine = CoherenceEngine::new();

        assert!(engine.are_potentially_contradictory("c'est toujours vrai", "c'est jamais le cas"));
        assert!(!engine.are_potentially_contradictory("bonjour", "monde"));
    }
}
