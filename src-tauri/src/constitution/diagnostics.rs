//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — CONSTITUTIONAL DIAGNOSTICS
//! Super Prompt #13 — Surveillance et diagnostic de santé constitutionnelle
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use std::collections::HashMap;

use super::{
    principles::PrincipleSet,
    values::ValueSystem,
    limits::LimitSystem,
    rights::RightsCharter,
    enforcement::{EnforcementEngine, EnforcementStats},
    evolution::{EvolutionEngine, EvolutionStats},
};

/// Niveau de santé constitutionnelle
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum ConstitutionalHealth {
    /// Parfaite santé
    Excellent,
    /// Bonne santé
    Good,
    /// Acceptable
    Acceptable,
    /// Dégradé
    Degraded,
    /// Critique
    Critical,
}

/// Catégorie de diagnostic
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum DiagnosticCategory {
    Principles,
    Values,
    Limits,
    Rights,
    Enforcement,
    Evolution,
    Coherence,
    Performance,
}

/// Résultat de diagnostic
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DiagnosticResult {
    pub category: DiagnosticCategory,
    pub health: ConstitutionalHealth,
    pub score: f32,
    pub issues: Vec<DiagnosticIssue>,
    pub recommendations: Vec<String>,
    pub timestamp: u64,
}

/// Problème diagnostiqué
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DiagnosticIssue {
    pub id: String,
    pub severity: IssueSeverity,
    pub description: String,
    pub affected_elements: Vec<String>,
    pub suggested_action: Option<String>,
}

/// Sévérité d'un problème
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum IssueSeverity {
    Info,
    Low,
    Medium,
    High,
    Critical,
}

/// Rapport de santé global
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct HealthReport {
    pub overall_health: ConstitutionalHealth,
    pub overall_score: f32,
    pub diagnostics: Vec<DiagnosticResult>,
    pub critical_issues: Vec<DiagnosticIssue>,
    pub statistics: ConstitutionalStats,
    pub generated_at: u64,
}

/// Statistiques constitutionnelles
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct ConstitutionalStats {
    pub total_principles: usize,
    pub total_values: usize,
    pub total_limits: usize,
    pub total_rights: usize,
    pub enforcement_stats: Option<EnforcementStats>,
    pub evolution_stats: Option<EvolutionStats>,
    pub compliance_rate: f32,
    pub average_response_time_ms: u64,
}

/// Tendance de santé
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct HealthTrend {
    pub category: DiagnosticCategory,
    pub scores: Vec<(u64, f32)>,
    pub trend_direction: TrendDirection,
}

/// Direction de la tendance
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum TrendDirection {
    Improving,
    Stable,
    Declining,
}

/// État du diagnostic
struct DiagnosticsState {
    history: Vec<HealthReport>,
    trends: HashMap<DiagnosticCategory, Vec<(u64, f32)>>,
    last_full_diagnostic: Option<u64>,
}

impl Default for DiagnosticsState {
    fn default() -> Self {
        Self {
            history: Vec::new(),
            trends: HashMap::new(),
            last_full_diagnostic: None,
        }
    }
}

/// Moteur de diagnostics constitutionnels
pub struct ConstitutionalDiagnostics {
    state: RwLock<DiagnosticsState>,
}

impl ConstitutionalDiagnostics {
    pub fn new() -> Self {
        Self {
            state: RwLock::new(DiagnosticsState::default()),
        }
    }

    /// Exécute un diagnostic complet
    pub async fn run_full_diagnostic(
        &self,
        principles: &PrincipleSet,
        values: &ValueSystem,
        limits: &LimitSystem,
        rights: &RightsCharter,
        enforcement: &EnforcementEngine,
        evolution: &EvolutionEngine,
    ) -> HealthReport {
        let now = Self::now();
        let mut diagnostics = Vec::new();

        // Diagnostiquer chaque composant
        diagnostics.push(self.diagnose_principles(principles));
        diagnostics.push(self.diagnose_values(values));
        diagnostics.push(self.diagnose_limits(limits));
        diagnostics.push(self.diagnose_rights(rights));
        diagnostics.push(self.diagnose_enforcement(enforcement).await);
        diagnostics.push(self.diagnose_evolution(evolution).await);
        diagnostics.push(self.diagnose_coherence(principles, values, limits));

        // Calculer le score global
        let overall_score = diagnostics.iter()
            .map(|d| d.score)
            .sum::<f32>() / diagnostics.len() as f32;

        let overall_health = Self::score_to_health(overall_score);

        // Collecter les problèmes critiques
        let critical_issues: Vec<_> = diagnostics.iter()
            .flat_map(|d| d.issues.iter())
            .filter(|i| i.severity >= IssueSeverity::High)
            .cloned()
            .collect();

        // Statistiques
        let statistics = ConstitutionalStats {
            total_principles: principles.len(),
            total_values: values.len(),
            total_limits: limits.len(),
            total_rights: rights.len(),
            enforcement_stats: Some(enforcement.statistics().await),
            evolution_stats: Some(evolution.statistics().await),
            compliance_rate: overall_score,
            average_response_time_ms: 50, // Placeholder
        };

        let report = HealthReport {
            overall_health,
            overall_score,
            diagnostics,
            critical_issues,
            statistics,
            generated_at: now,
        };

        // Mettre à jour l'état
        let mut state = self.state.write().await;
        state.history.push(report.clone());
        state.last_full_diagnostic = Some(now);

        // Mettre à jour les tendances
        for diag in &report.diagnostics {
            state.trends
                .entry(diag.category)
                .or_default()
                .push((now, diag.score));
        }

        // Garder seulement les 100 derniers rapports
        while state.history.len() > 100 {
            state.history.remove(0);
        }

        report
    }

    /// Diagnostique les principes
    fn diagnose_principles(&self, principles: &PrincipleSet) -> DiagnosticResult {
        let mut issues = Vec::new();
        let mut score = 1.0;

        // Vérifier qu'il y a des principes fondamentaux
        let foundational = principles.foundational_principles();
        if foundational.is_empty() {
            issues.push(DiagnosticIssue {
                id: "no_foundational_principles".to_string(),
                severity: IssueSeverity::Critical,
                description: "No foundational principles defined".to_string(),
                affected_elements: vec!["principles".to_string()],
                suggested_action: Some("Define foundational principles".to_string()),
            });
            score -= 0.5;
        }

        // Vérifier la cohérence
        for principle in principles.iter() {
            if !principle.enforceable {
                issues.push(DiagnosticIssue {
                    id: format!("not_enforceable_{}", principle.id),
                    severity: IssueSeverity::Low,
                    description: format!("Principle '{}' is not enforceable", principle.name),
                    affected_elements: vec![principle.id.clone()],
                    suggested_action: Some("Consider making enforceable".to_string()),
                });
                score -= 0.02;
            }
        }

        let health = Self::score_to_health(score);

        DiagnosticResult {
            category: DiagnosticCategory::Principles,
            health,
            score: score.max(0.0),
            issues,
            recommendations: if score < 0.8 {
                vec!["Review and strengthen principle definitions".to_string()]
            } else {
                vec![]
            },
            timestamp: Self::now(),
        }
    }

    /// Diagnostique les valeurs
    fn diagnose_values(&self, values: &ValueSystem) -> DiagnosticResult {
        let mut issues = Vec::new();
        let mut score = 1.0;

        // Vérifier les valeurs essentielles
        let essential = values.by_priority(super::values::ValuePriority::Essential);
        if essential.is_empty() {
            issues.push(DiagnosticIssue {
                id: "no_essential_values".to_string(),
                severity: IssueSeverity::High,
                description: "No essential values defined".to_string(),
                affected_elements: vec!["values".to_string()],
                suggested_action: Some("Define essential values".to_string()),
            });
            score -= 0.3;
        }

        // Vérifier les anti-patterns
        for value in values.iter() {
            if value.anti_patterns.is_empty() {
                issues.push(DiagnosticIssue {
                    id: format!("no_antipatterns_{}", value.name),
                    severity: IssueSeverity::Info,
                    description: format!("Value '{}' has no anti-patterns defined", value.name),
                    affected_elements: vec![value.name.clone()],
                    suggested_action: None,
                });
            }
        }

        let health = Self::score_to_health(score);

        DiagnosticResult {
            category: DiagnosticCategory::Values,
            health,
            score: score.max(0.0),
            issues,
            recommendations: vec![],
            timestamp: Self::now(),
        }
    }

    /// Diagnostique les limites
    fn diagnose_limits(&self, limits: &LimitSystem) -> DiagnosticResult {
        let mut issues = Vec::new();
        let mut score = 1.0;

        // Vérifier les limites absolues
        let absolute = limits.absolute_limits();
        if absolute.is_empty() {
            issues.push(DiagnosticIssue {
                id: "no_absolute_limits".to_string(),
                severity: IssueSeverity::Critical,
                description: "No absolute limits defined".to_string(),
                affected_elements: vec!["limits".to_string()],
                suggested_action: Some("Define absolute safety limits".to_string()),
            });
            score -= 0.4;
        }

        // Vérifier les limites dépassées
        let exceeded = limits.exceeded_limits();
        let has_exceeded = !exceeded.is_empty();
        for limit in exceeded {
            issues.push(DiagnosticIssue {
                id: format!("exceeded_{}", limit.id),
                severity: IssueSeverity::High,
                description: format!("Limit '{}' is exceeded", limit.name),
                affected_elements: vec![limit.id.clone()],
                suggested_action: Some(limit.enforcement_action.clone()),
            });
            score -= 0.2;
        }

        let health = Self::score_to_health(score);

        DiagnosticResult {
            category: DiagnosticCategory::Limits,
            health,
            score: score.max(0.0),
            issues,
            recommendations: if has_exceeded {
                vec!["Address exceeded limits immediately".to_string()]
            } else {
                vec![]
            },
            timestamp: Self::now(),
        }
    }

    /// Diagnostique les droits
    fn diagnose_rights(&self, rights: &RightsCharter) -> DiagnosticResult {
        let mut issues = Vec::new();
        let mut score = 1.0;

        // Vérifier les droits utilisateur
        let user_rights = rights.user_rights();
        if user_rights.is_empty() {
            issues.push(DiagnosticIssue {
                id: "no_user_rights".to_string(),
                severity: IssueSeverity::Critical,
                description: "No user rights defined".to_string(),
                affected_elements: vec!["rights".to_string()],
                suggested_action: Some("Define user rights".to_string()),
            });
            score -= 0.5;
        }

        // Vérifier les droits inaliénables
        let inalienable = rights.inalienable_rights();
        if inalienable.len() < 3 {
            issues.push(DiagnosticIssue {
                id: "few_inalienable_rights".to_string(),
                severity: IssueSeverity::Medium,
                description: "Few inalienable rights defined".to_string(),
                affected_elements: vec!["rights".to_string()],
                suggested_action: Some("Review inalienable rights".to_string()),
            });
            score -= 0.1;
        }

        let health = Self::score_to_health(score);

        DiagnosticResult {
            category: DiagnosticCategory::Rights,
            health,
            score: score.max(0.0),
            issues,
            recommendations: vec![],
            timestamp: Self::now(),
        }
    }

    /// Diagnostique l'enforcement
    async fn diagnose_enforcement(&self, enforcement: &EnforcementEngine) -> DiagnosticResult {
        let stats = enforcement.statistics().await;
        let mut issues = Vec::new();
        let mut score = 1.0;

        // Vérifier le taux de violations non résolues
        if stats.unresolved_violations > 0 {
            let unresolved_rate = stats.unresolved_violations as f32 / stats.total_violations.max(1) as f32;
            if unresolved_rate > 0.5 {
                issues.push(DiagnosticIssue {
                    id: "high_unresolved_rate".to_string(),
                    severity: IssueSeverity::High,
                    description: format!("{}% of violations are unresolved", (unresolved_rate * 100.0) as u32),
                    affected_elements: vec!["enforcement".to_string()],
                    suggested_action: Some("Review and resolve pending violations".to_string()),
                });
                score -= 0.3;
            }
        }

        // Vérifier les acteurs restreints
        if stats.restricted_actors > 5 {
            issues.push(DiagnosticIssue {
                id: "many_restricted_actors".to_string(),
                severity: IssueSeverity::Medium,
                description: format!("{} actors are currently restricted", stats.restricted_actors),
                affected_elements: vec!["enforcement".to_string()],
                suggested_action: Some("Review restriction policies".to_string()),
            });
            score -= 0.1;
        }

        let health = Self::score_to_health(score);

        DiagnosticResult {
            category: DiagnosticCategory::Enforcement,
            health,
            score: score.max(0.0),
            issues,
            recommendations: vec![],
            timestamp: Self::now(),
        }
    }

    /// Diagnostique l'évolution
    async fn diagnose_evolution(&self, evolution: &EvolutionEngine) -> DiagnosticResult {
        let stats = evolution.statistics().await;
        let mut issues = Vec::new();
        let score = 1.0;

        // Vérifier les amendements en attente
        if stats.pending_amendments > 10 {
            issues.push(DiagnosticIssue {
                id: "many_pending_amendments".to_string(),
                severity: IssueSeverity::Low,
                description: format!("{} amendments pending review", stats.pending_amendments),
                affected_elements: vec!["evolution".to_string()],
                suggested_action: Some("Review pending amendments".to_string()),
            });
        }

        let health = Self::score_to_health(score);

        DiagnosticResult {
            category: DiagnosticCategory::Evolution,
            health,
            score,
            issues,
            recommendations: vec![],
            timestamp: Self::now(),
        }
    }

    /// Diagnostique la cohérence globale
    fn diagnose_coherence(
        &self,
        principles: &PrincipleSet,
        values: &ValueSystem,
        limits: &LimitSystem,
    ) -> DiagnosticResult {
        let mut issues = Vec::new();
        let mut score = 1.0;

        // Vérifier l'alignement entre principes et valeurs
        let principle_names: Vec<_> = principles.iter().map(|p| p.name.clone()).collect();
        let value_names: Vec<_> = values.iter().map(|v| v.name.clone()).collect();

        // Vérifier que safety est dans les deux
        if !principle_names.iter().any(|n| n.to_lowercase().contains("safety"))
            && !value_names.iter().any(|n| n.to_lowercase().contains("safety"))
        {
            issues.push(DiagnosticIssue {
                id: "missing_safety_alignment".to_string(),
                severity: IssueSeverity::High,
                description: "Safety is not explicitly defined in principles or values".to_string(),
                affected_elements: vec!["principles".to_string(), "values".to_string()],
                suggested_action: Some("Add explicit safety principle and value".to_string()),
            });
            score -= 0.2;
        }

        // Vérifier que les limites couvrent les valeurs essentielles
        let limit_ids: Vec<_> = limits.by_type(super::limits::LimitType::Absolute)
            .iter()
            .map(|l| l.id.clone())
            .collect();

        if limit_ids.is_empty() {
            issues.push(DiagnosticIssue {
                id: "no_absolute_safety_limits".to_string(),
                severity: IssueSeverity::Critical,
                description: "No absolute limits to protect essential values".to_string(),
                affected_elements: vec!["limits".to_string()],
                suggested_action: Some("Add absolute limits for safety".to_string()),
            });
            score -= 0.3;
        }

        let health = Self::score_to_health(score);

        DiagnosticResult {
            category: DiagnosticCategory::Coherence,
            health,
            score: score.max(0.0),
            issues,
            recommendations: if score < 0.9 {
                vec!["Improve alignment between principles, values, and limits".to_string()]
            } else {
                vec![]
            },
            timestamp: Self::now(),
        }
    }

    /// Convertit un score en niveau de santé
    fn score_to_health(score: f32) -> ConstitutionalHealth {
        if score >= 0.9 {
            ConstitutionalHealth::Excellent
        } else if score >= 0.75 {
            ConstitutionalHealth::Good
        } else if score >= 0.5 {
            ConstitutionalHealth::Acceptable
        } else if score >= 0.25 {
            ConstitutionalHealth::Degraded
        } else {
            ConstitutionalHealth::Critical
        }
    }

    /// Récupère les tendances de santé
    pub async fn get_trends(&self) -> Vec<HealthTrend> {
        let state = self.state.read().await;

        state.trends.iter().map(|(category, scores)| {
            let trend_direction = if scores.len() < 2 {
                TrendDirection::Stable
            } else {
                let recent: f32 = scores.iter().rev().take(5).map(|(_, s)| s).sum::<f32>() / 5.0;
                let older: f32 = scores.iter().rev().skip(5).take(5).map(|(_, s)| s).sum::<f32>() / 5.0;

                if recent > older + 0.05 {
                    TrendDirection::Improving
                } else if recent < older - 0.05 {
                    TrendDirection::Declining
                } else {
                    TrendDirection::Stable
                }
            };

            HealthTrend {
                category: *category,
                scores: scores.clone(),
                trend_direction,
            }
        }).collect()
    }

    /// Récupère le dernier rapport
    pub async fn last_report(&self) -> Option<HealthReport> {
        let state = self.state.read().await;
        state.history.last().cloned()
    }

    /// Récupère l'historique des rapports
    pub async fn report_history(&self, limit: usize) -> Vec<HealthReport> {
        let state = self.state.read().await;
        state.history.iter().rev().take(limit).cloned().collect()
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for ConstitutionalDiagnostics {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_diagnostics_creation() {
        let diagnostics = ConstitutionalDiagnostics::new();
        let last = diagnostics.last_report().await;
        assert!(last.is_none());
    }

    #[tokio::test]
    async fn test_full_diagnostic() {
        let diagnostics = ConstitutionalDiagnostics::new();
        let principles = PrincipleSet::default_titane();
        let values = ValueSystem::default_titane();
        let limits = LimitSystem::default_titane();
        let rights = RightsCharter::default_titane();
        let enforcement = EnforcementEngine::new();
        let evolution = EvolutionEngine::new();

        let report = diagnostics.run_full_diagnostic(
            &principles,
            &values,
            &limits,
            &rights,
            &enforcement,
            &evolution,
        ).await;

        assert!(report.overall_score > 0.0);
        assert!(!report.diagnostics.is_empty());
    }

    #[test]
    fn test_score_to_health() {
        assert_eq!(ConstitutionalDiagnostics::score_to_health(0.95), ConstitutionalHealth::Excellent);
        assert_eq!(ConstitutionalDiagnostics::score_to_health(0.8), ConstitutionalHealth::Good);
        assert_eq!(ConstitutionalDiagnostics::score_to_health(0.6), ConstitutionalHealth::Acceptable);
        assert_eq!(ConstitutionalDiagnostics::score_to_health(0.3), ConstitutionalHealth::Degraded);
        assert_eq!(ConstitutionalDiagnostics::score_to_health(0.1), ConstitutionalHealth::Critical);
    }
}
