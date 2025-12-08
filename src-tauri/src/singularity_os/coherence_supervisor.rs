// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Coherence Supervisor v∞
//   SUPER PROMPT #7 — Superviseur de cohérence conversationnelle
// ═══════════════════════════════════════════════════════════════

use crate::singularity_os::state::SingularityState;
use serde::{Deserialize, Serialize};

/// Coherence Supervisor — Validation de cohérence conversationnelle
/// 
/// Responsabilités:
/// - Évaluer cohérence des réponses générées
/// - Détecter contradictions internes
/// - Détecter dérives tonales
/// - Valider structure et qualité
pub struct CoherenceSupervisor;

/// Rapport de cohérence
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoherenceReport {
    /// Score global de cohérence (0.0-1.0)
    pub overall_score: f32,
    
    /// Score de cohérence logique (pas de contradictions)
    pub logical_score: f32,
    
    /// Score de cohérence tonale (pas de dérive)
    pub tonal_score: f32,
    
    /// Score de cohérence structurelle (format OK)
    pub structural_score: f32,
    
    /// Liste des problèmes détectés
    pub issues: Vec<CoherenceIssue>,
    
    /// Recommandations pour correction
    pub recommendations: Vec<String>,
    
    /// Validation finale (passe ou non)
    pub is_valid: bool,
}

/// Type de problème de cohérence
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoherenceIssue {
    /// Type de problème
    pub issue_type: IssueType,
    
    /// Gravité (0.0-1.0)
    pub severity: f32,
    
    /// Description du problème
    pub description: String,
    
    /// Position dans le texte (si applicable)
    pub position: Option<usize>,
}

/// Types de problèmes de cohérence
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum IssueType {
    /// Contradiction logique
    LogicalContradiction,
    
    /// Dérive tonale
    TonalDrift,
    
    /// Erreur structurelle
    StructuralError,
    
    /// Répétition excessive
    ExcessiveRepetition,
    
    /// Contenu vide
    EmptyContent,
    
    /// Hors-sujet
    OffTopic,
    
    /// Manque de contexte
    MissingContext,
}

impl CoherenceSupervisor {
    /// Évaluer la cohérence d'une réponse générée
    /// 
    /// Pipeline:
    /// 1. Validation structurelle (non-vide, format OK)
    /// 2. Détection contradictions logiques
    /// 3. Détection dérives tonales
    /// 4. Validation par rapport au contexte
    /// 5. Génération recommandations
    pub fn evaluate(
        response: &str,
        context: &str,
        state: &SingularityState,
    ) -> CoherenceReport {
        let mut issues = Vec::new();
        
        // 1. Validation structurelle
        let structural_score = Self::check_structure(response, &mut issues);
        
        // 2. Validation logique
        let logical_score = Self::check_logical_consistency(response, context, &mut issues);
        
        // 3. Validation tonale
        let tonal_score = Self::check_tonal_consistency(response, state, &mut issues);
        
        // Score global (moyenne pondérée)
        let overall_score = (structural_score * 0.3 
                           + logical_score * 0.4 
                           + tonal_score * 0.3)
                           .clamp(0.0, 1.0);
        
        // Génération recommandations
        let recommendations = Self::generate_recommendations(&issues);
        
        // Validation finale (seuil: 0.6)
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
    
    /// Vérifier structure de la réponse
    fn check_structure(response: &str, issues: &mut Vec<CoherenceIssue>) -> f32 {
        let mut score = 1.0;
        
        // Test 1: Réponse non-vide
        if response.trim().is_empty() {
            issues.push(CoherenceIssue {
                issue_type: IssueType::EmptyContent,
                severity: 1.0,
                description: "Réponse vide".to_string(),
                position: None,
            });
            return 0.0;
        }
        
        // Test 2: Longueur minimale (>10 caractères)
        if response.len() < 10 {
            issues.push(CoherenceIssue {
                issue_type: IssueType::EmptyContent,
                severity: 0.7,
                description: "Réponse trop courte".to_string(),
                position: None,
            });
            score -= 0.3;
        }
        
        // Test 3: Détection répétitions excessives
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
    
    /// Vérifier cohérence logique
    fn check_logical_consistency(
        response: &str,
        context: &str,
        issues: &mut Vec<CoherenceIssue>,
    ) -> f32 {
        let mut score = 1.0;
        
        // Test 1: Mots de contradiction
        let contradiction_markers = ["mais", "cependant", "toutefois", "néanmoins"];
        let contradiction_count = contradiction_markers.iter()
            .filter(|&marker| response.to_lowercase().matches(marker).count() > 2)
            .count();
        
        if contradiction_count > 0 {
            issues.push(CoherenceIssue {
                issue_type: IssueType::LogicalContradiction,
                severity: 0.4,
                description: format!("Multiples marqueurs de contradiction détectés: {}", contradiction_count),
                position: None,
            });
            score -= 0.2;
        }
        
        // Test 2: Cohérence avec contexte
        if !context.is_empty() {
            let context_words: Vec<&str> = context.split_whitespace().collect();
            let response_words: Vec<&str> = response.split_whitespace().collect();
            
            // Calculer overlap (mots communs)
            let overlap = context_words.iter()
                .filter(|w| response_words.contains(w))
                .count();
            
            let overlap_ratio = if context_words.is_empty() {
                1.0
            } else {
                overlap as f32 / context_words.len().min(50) as f32
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
    
    /// Vérifier cohérence tonale
    fn check_tonal_consistency(
        response: &str,
        state: &SingularityState,
        issues: &mut Vec<CoherenceIssue>,
    ) -> f32 {
        let mut score = 1.0;
        
        // Test 1: Tonalité affective (détection extrêmes)
        let positive_markers = ["excellent", "super", "génial", "parfait", "magnifique"];
        let negative_markers = ["terrible", "catastrophe", "échec", "problème", "erreur"];
        
        let positive_count = positive_markers.iter()
            .map(|m| response.to_lowercase().matches(m).count())
            .sum::<usize>();
        
        let negative_count = negative_markers.iter()
            .map(|m| response.to_lowercase().matches(m).count())
            .sum::<usize>();
        
        // Calculer tonalité détectée
        let detected_tone = if positive_count > negative_count {
            (positive_count as f32 - negative_count as f32) / (positive_count + negative_count + 1) as f32
        } else {
            -(negative_count as f32 - positive_count as f32) / (positive_count + negative_count + 1) as f32
        };
        
        // Comparer avec tonalité attendue
        let tone_diff = (detected_tone - state.affective_tone).abs();
        
        if tone_diff > 0.5 {
            issues.push(CoherenceIssue {
                issue_type: IssueType::TonalDrift,
                severity: tone_diff,
                description: format!(
                    "Dérive tonale détectée: attendu {:.2}, détecté {:.2}",
                    state.affective_tone,
                    detected_tone
                ),
                position: None,
            });
            score -= tone_diff * 0.5;
        }
        
        score.max(0.0)
    }
    
    /// Détecter répétitions excessives
    fn has_excessive_repetition(text: &str) -> bool {
        let words: Vec<&str> = text.split_whitespace().collect();
        if words.len() < 10 {
            return false;
        }
        
        // Compter occurrences de chaque mot
        let mut counts = std::collections::HashMap::new();
        for word in words.iter() {
            *counts.entry(word.to_lowercase()).or_insert(0) += 1;
        }
        
        // Détecter si un mot apparaît >20% du texte
        let max_count = counts.values().max().unwrap_or(&0);
        (*max_count as f32 / words.len() as f32) > 0.2
    }
    
    /// Générer recommandations de correction
    fn generate_recommendations(issues: &[CoherenceIssue]) -> Vec<String> {
        let mut recommendations = Vec::new();
        
        for issue in issues {
            let rec = match issue.issue_type {
                IssueType::LogicalContradiction => {
                    "Réévaluer la logique interne et éliminer contradictions"
                }
                IssueType::TonalDrift => {
                    "Ajuster la tonalité pour correspondre au contexte global"
                }
                IssueType::StructuralError => {
                    "Vérifier format et structure de la réponse"
                }
                IssueType::ExcessiveRepetition => {
                    "Varier le vocabulaire et les formulations"
                }
                IssueType::EmptyContent => {
                    "Générer contenu substantiel"
                }
                IssueType::OffTopic => {
                    "Recentrer la réponse sur le sujet"
                }
                IssueType::MissingContext => {
                    "Intégrer davantage d'éléments du contexte"
                }
            };
            
            if issue.severity > 0.5 {
                recommendations.push(rec.to_string());
            }
        }
        
        // Dédupliquer
        recommendations.sort();
        recommendations.dedup();
        
        recommendations
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::singularity_os::state::CognitiveMode;

    #[test]
    fn test_evaluate_valid_response() {
        let state = SingularityState::new();
        let response = "Voici une réponse claire et cohérente avec le contexte fourni.";
        let context = "contexte fourni";
        
        let report = CoherenceSupervisor::evaluate(response, context, &state);
        
        assert!(report.is_valid);
        assert!(report.overall_score > 0.6);
    }

    #[test]
    fn test_evaluate_empty_response() {
        let state = SingularityState::new();
        let response = "";
        let context = "contexte";
        
        let report = CoherenceSupervisor::evaluate(response, context, &state);
        
        assert!(!report.is_valid);
        assert_eq!(report.overall_score, 0.0);
        assert!(report.issues.iter().any(|i| i.issue_type == IssueType::EmptyContent));
    }

    #[test]
    fn test_has_excessive_repetition() {
        let text = "test test test test test test test test test test";
        assert!(CoherenceSupervisor::has_excessive_repetition(text));
        
        let normal_text = "Ceci est un texte normal avec variété de mots";
        assert!(!CoherenceSupervisor::has_excessive_repetition(normal_text));
    }

    #[test]
    fn test_check_structure() {
        let mut issues = Vec::new();
        
        let score = CoherenceSupervisor::check_structure("Réponse valide", &mut issues);
        assert!(score > 0.8);
        assert!(issues.is_empty());
    }

    #[test]
    fn test_tonal_consistency() {
        let mut state = SingularityState::new();
        state.update_affective_tone(0.5); // Positive tone expected
        
        let mut issues = Vec::new();
        
        let response = "Excellent travail, super résultat, parfait!";
        let score = CoherenceSupervisor::check_tonal_consistency(response, &state, &mut issues);
        
        // Should detect positive tone matching state
        assert!(score > 0.7);
    }

    #[test]
    fn test_generate_recommendations() {
        let issues = vec![
            CoherenceIssue {
                issue_type: IssueType::EmptyContent,
                severity: 1.0,
                description: "Empty".to_string(),
                position: None,
            },
            CoherenceIssue {
                issue_type: IssueType::TonalDrift,
                severity: 0.6,
                description: "Drift".to_string(),
                position: None,
            },
        ];
        
        let recommendations = CoherenceSupervisor::generate_recommendations(&issues);
        
        assert!(!recommendations.is_empty());
        assert!(recommendations.len() <= issues.len());
    }
}
