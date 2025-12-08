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
        
        let overall_score = (structural_score * 0.3 + logical_score * 0.4 + tonal_score * 0.3).clamp(0.0, 1.0);
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
    
    fn check_logical_consistency(response: &str, context: &str, issues: &mut Vec<CoherenceIssue>) -> f32 {
        let mut score: f32 = 1.0;
        
        let contradiction_markers = ["mais", "cependant", "toutefois", "néanmoins"];
        let contradiction_count = contradiction_markers.iter()
            .filter(|&marker| response.to_lowercase().matches(marker).count() > 2)
            .count();
        
        if contradiction_count > 0 {
            issues.push(CoherenceIssue {
                issue_type: IssueType::LogicalContradiction,
                severity: 0.4,
                description: format!("Multiples marqueurs de contradiction: {}", contradiction_count),
                position: None,
            });
            score -= 0.2;
        }
        
        if !context.is_empty() {
            let context_words: Vec<&str> = context.split_whitespace().collect();
            let response_words: Vec<&str> = response.split_whitespace().collect();
            let overlap = context_words.iter().filter(|w| response_words.contains(w)).count();
            let overlap_ratio = if context_words.is_empty() { 1.0 } else { overlap as f32 / context_words.len().min(50) as f32 };
            
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
    
    fn check_tonal_consistency(response: &str, state: &SingularityState, issues: &mut Vec<CoherenceIssue>) -> f32 {
        let mut score: f32 = 1.0;
        
        let positive_markers = ["excellent", "super", "génial", "parfait", "magnifique"];
        let negative_markers = ["terrible", "catastrophe", "échec", "problème", "erreur"];
        
        let positive_count: usize = positive_markers.iter().map(|m| response.to_lowercase().matches(m).count()).sum();
        let negative_count: usize = negative_markers.iter().map(|m| response.to_lowercase().matches(m).count()).sum();
        
        let detected_tone = if positive_count > negative_count {
            (positive_count as f32 - negative_count as f32) / (positive_count + negative_count + 1) as f32
        } else {
            -(negative_count as f32 - positive_count as f32) / (positive_count + negative_count + 1) as f32
        };
        
        let tone_diff = (detected_tone - state.affective_tone).abs();
        
        if tone_diff > 0.5 {
            issues.push(CoherenceIssue {
                issue_type: IssueType::TonalDrift,
                severity: tone_diff,
                description: format!("Dérive tonale: attendu {:.2}, détecté {:.2}", state.affective_tone, detected_tone),
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
                IssueType::LogicalContradiction => "Réévaluer la logique interne et éliminer contradictions",
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
