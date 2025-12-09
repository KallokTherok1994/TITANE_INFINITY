//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — ENFORCEMENT ENGINE
//! Super Prompt #13 — Application des règles constitutionnelles et sanctions
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use std::collections::HashMap;
use super::{ConstitutionalAction, ComplianceResult, ComplianceStatus};

/// Sévérité d'une violation
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub enum ViolationSeverity {
    /// Avertissement mineur
    Warning = 1,
    /// Violation mineure
    Minor = 2,
    /// Violation modérée
    Moderate = 3,
    /// Violation majeure
    Major = 4,
    /// Violation critique
    Critical = 5,
}

/// Type de sanction
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum SanctionType {
    /// Simple avertissement
    Warning,
    /// Restriction temporaire
    TemporaryRestriction { duration_ms: u64 },
    /// Restriction permanente
    PermanentRestriction,
    /// Blocage d'action
    ActionBlock,
    /// Révocation de privilèges
    PrivilegeRevocation { privileges: Vec<String> },
    /// Isolation
    Isolation,
    /// Arrêt système
    SystemHalt,
}

/// Enregistrement de violation
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ViolationRecord {
    pub id: String,
    pub timestamp: u64,
    pub actor: String,
    pub action: ConstitutionalAction,
    pub violated_rules: Vec<String>,
    pub severity: ViolationSeverity,
    pub sanctions_applied: Vec<SanctionType>,
    pub resolved: bool,
    pub resolution_notes: Option<String>,
}

/// Règle d'enforcement
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EnforcementRule {
    pub id: String,
    pub name: String,
    pub trigger_pattern: String,
    pub severity: ViolationSeverity,
    pub automatic_sanction: Option<SanctionType>,
    pub escalation_threshold: u32,
    pub active: bool,
}

/// État de l'enforcement
struct EnforcementState {
    violations: Vec<ViolationRecord>,
    actor_violations: HashMap<String, Vec<String>>,
    active_restrictions: HashMap<String, Vec<SanctionType>>,
    rules: Vec<EnforcementRule>,
}

impl Default for EnforcementState {
    fn default() -> Self {
        Self {
            violations: Vec::new(),
            actor_violations: HashMap::new(),
            active_restrictions: HashMap::new(),
            rules: Self::default_rules(),
        }
    }
}

impl EnforcementState {
    fn default_rules() -> Vec<EnforcementRule> {
        vec![
            EnforcementRule {
                id: "safety_violation".to_string(),
                name: "Safety Violation".to_string(),
                trigger_pattern: "safety".to_string(),
                severity: ViolationSeverity::Critical,
                automatic_sanction: Some(SanctionType::ActionBlock),
                escalation_threshold: 1,
                active: true,
            },
            EnforcementRule {
                id: "privacy_violation".to_string(),
                name: "Privacy Violation".to_string(),
                trigger_pattern: "privacy".to_string(),
                severity: ViolationSeverity::Major,
                automatic_sanction: Some(SanctionType::ActionBlock),
                escalation_threshold: 2,
                active: true,
            },
            EnforcementRule {
                id: "honesty_violation".to_string(),
                name: "Honesty Violation".to_string(),
                trigger_pattern: "honesty".to_string(),
                severity: ViolationSeverity::Moderate,
                automatic_sanction: Some(SanctionType::Warning),
                escalation_threshold: 3,
                active: true,
            },
            EnforcementRule {
                id: "resource_abuse".to_string(),
                name: "Resource Abuse".to_string(),
                trigger_pattern: "resource".to_string(),
                severity: ViolationSeverity::Minor,
                automatic_sanction: Some(SanctionType::TemporaryRestriction { duration_ms: 60000 }),
                escalation_threshold: 5,
                active: true,
            },
        ]
    }
}

/// Moteur d'enforcement
pub struct EnforcementEngine {
    state: RwLock<EnforcementState>,
}

impl EnforcementEngine {
    pub fn new() -> Self {
        Self {
            state: RwLock::new(EnforcementState::default()),
        }
    }

    /// Applique les sanctions pour une non-conformité
    pub async fn enforce(&self, action: &ConstitutionalAction, compliance: &ComplianceResult) -> Vec<SanctionType> {
        if compliance.status == ComplianceStatus::Compliant {
            return vec![];
        }

        let mut state = self.state.write().await;
        let mut sanctions = Vec::new();

        // Déterminer la sévérité
        let severity = self.determine_severity(compliance);

        // Trouver les règles applicables
        let applicable_rules: Vec<_> = state.rules.iter()
            .filter(|r| r.active && compliance.violations.iter().any(|v| v.contains(&r.trigger_pattern)))
            .cloned()
            .collect();

        // Appliquer les sanctions automatiques
        for rule in &applicable_rules {
            if let Some(ref sanction) = rule.automatic_sanction {
                sanctions.push(sanction.clone());
            }
        }

        // Si pas de sanctions automatiques mais violation, ajouter un warning
        if sanctions.is_empty() && !compliance.violations.is_empty() {
            sanctions.push(SanctionType::Warning);
        }

        // Créer l'enregistrement de violation
        let violation_id = uuid::Uuid::new_v4().to_string();
        let record = ViolationRecord {
            id: violation_id.clone(),
            timestamp: Self::now(),
            actor: action.requester.clone(),
            action: action.clone(),
            violated_rules: compliance.violations.clone(),
            severity,
            sanctions_applied: sanctions.clone(),
            resolved: false,
            resolution_notes: None,
        };

        state.violations.push(record);

        // Mettre à jour les violations par acteur
        state.actor_violations
            .entry(action.requester.clone())
            .or_default()
            .push(violation_id);

        // Appliquer les restrictions actives
        if !sanctions.is_empty() {
            state.active_restrictions
                .entry(action.requester.clone())
                .or_default()
                .extend(sanctions.clone());
        }

        // Vérifier l'escalation
        self.check_escalation(&mut state, &action.requester, &mut sanctions);

        sanctions
    }

    /// Détermine la sévérité basée sur la conformité
    fn determine_severity(&self, compliance: &ComplianceResult) -> ViolationSeverity {
        match compliance.status {
            ComplianceStatus::Compliant => ViolationSeverity::Warning,
            ComplianceStatus::PartiallyCompliant => {
                if compliance.overall_score < 0.3 {
                    ViolationSeverity::Major
                } else if compliance.overall_score < 0.5 {
                    ViolationSeverity::Moderate
                } else {
                    ViolationSeverity::Minor
                }
            }
            ComplianceStatus::NonCompliant => ViolationSeverity::Major,
            ComplianceStatus::Blocked => ViolationSeverity::Critical,
        }
    }

    /// Vérifie si une escalation est nécessaire
    fn check_escalation(&self, state: &mut EnforcementState, actor: &str, sanctions: &mut Vec<SanctionType>) {
        if let Some(actor_violations) = state.actor_violations.get(actor) {
            let violation_count = actor_violations.len();

            // Escalation progressive
            if violation_count >= 10 {
                sanctions.push(SanctionType::Isolation);
            } else if violation_count >= 5 {
                sanctions.push(SanctionType::PrivilegeRevocation {
                    privileges: vec!["advanced_operations".to_string()],
                });
            } else if violation_count >= 3 {
                sanctions.push(SanctionType::TemporaryRestriction { duration_ms: 300000 });
            }
        }
    }

    /// Vérifie si un acteur est restreint
    pub async fn is_restricted(&self, actor: &str) -> bool {
        let state = self.state.read().await;
        state.active_restrictions.contains_key(actor)
    }

    /// Récupère les restrictions actives
    pub async fn get_restrictions(&self, actor: &str) -> Vec<SanctionType> {
        let state = self.state.read().await;
        state.active_restrictions.get(actor).cloned().unwrap_or_default()
    }

    /// Lève une restriction
    pub async fn lift_restriction(&self, actor: &str, sanction: &SanctionType) {
        let mut state = self.state.write().await;
        if let Some(restrictions) = state.active_restrictions.get_mut(actor) {
            restrictions.retain(|s| s != sanction);
            if restrictions.is_empty() {
                state.active_restrictions.remove(actor);
            }
        }
    }

    /// Résout une violation
    pub async fn resolve_violation(&self, violation_id: &str, notes: &str) -> bool {
        let mut state = self.state.write().await;
        if let Some(violation) = state.violations.iter_mut().find(|v| v.id == violation_id) {
            violation.resolved = true;
            violation.resolution_notes = Some(notes.to_string());
            true
        } else {
            false
        }
    }

    /// Récupère les violations non résolues
    pub async fn unresolved_violations(&self) -> Vec<ViolationRecord> {
        let state = self.state.read().await;
        state.violations.iter()
            .filter(|v| !v.resolved)
            .cloned()
            .collect()
    }

    /// Récupère les violations par acteur
    pub async fn violations_by_actor(&self, actor: &str) -> Vec<ViolationRecord> {
        let state = self.state.read().await;
        state.violations.iter()
            .filter(|v| v.actor == actor)
            .cloned()
            .collect()
    }

    /// Récupère les violations par sévérité
    pub async fn violations_by_severity(&self, severity: ViolationSeverity) -> Vec<ViolationRecord> {
        let state = self.state.read().await;
        state.violations.iter()
            .filter(|v| v.severity == severity)
            .cloned()
            .collect()
    }

    /// Statistiques d'enforcement
    pub async fn statistics(&self) -> EnforcementStats {
        let state = self.state.read().await;

        let total_violations = state.violations.len();
        let unresolved = state.violations.iter().filter(|v| !v.resolved).count();
        let restricted_actors = state.active_restrictions.len();

        let by_severity: HashMap<ViolationSeverity, usize> = state.violations.iter()
            .fold(HashMap::new(), |mut acc, v| {
                *acc.entry(v.severity).or_insert(0) += 1;
                acc
            });

        EnforcementStats {
            total_violations,
            unresolved_violations: unresolved,
            restricted_actors,
            violations_by_severity: by_severity,
        }
    }

    /// Ajoute une règle d'enforcement
    pub async fn add_rule(&self, rule: EnforcementRule) {
        let mut state = self.state.write().await;
        state.rules.push(rule);
    }

    /// Active/désactive une règle
    pub async fn set_rule_active(&self, rule_id: &str, active: bool) {
        let mut state = self.state.write().await;
        if let Some(rule) = state.rules.iter_mut().find(|r| r.id == rule_id) {
            rule.active = active;
        }
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for EnforcementEngine {
    fn default() -> Self {
        Self::new()
    }
}

/// Statistiques d'enforcement
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EnforcementStats {
    pub total_violations: usize,
    pub unresolved_violations: usize,
    pub restricted_actors: usize,
    pub violations_by_severity: HashMap<ViolationSeverity, usize>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_enforcement_creation() {
        let engine = EnforcementEngine::new();
        let unresolved = engine.unresolved_violations().await;
        assert!(unresolved.is_empty());
    }

    #[tokio::test]
    async fn test_enforce_violation() {
        let engine = EnforcementEngine::new();

        let action = ConstitutionalAction {
            action_type: "unsafe_action".to_string(),
            target: "system".to_string(),
            parameters: std::collections::HashMap::new(),
            requester: "test_actor".to_string(),
            timestamp: 0,
        };

        let compliance = ComplianceResult {
            status: ComplianceStatus::NonCompliant,
            overall_score: 0.2,
            violations: vec!["safety_violation".to_string()],
            warnings: vec![],
            recommendations: vec![],
        };

        let sanctions = engine.enforce(&action, &compliance).await;
        assert!(!sanctions.is_empty());

        let unresolved = engine.unresolved_violations().await;
        assert_eq!(unresolved.len(), 1);
    }

    #[tokio::test]
    async fn test_restriction_check() {
        let engine = EnforcementEngine::new();

        let action = ConstitutionalAction {
            action_type: "privacy_breach".to_string(),
            target: "user_data".to_string(),
            parameters: std::collections::HashMap::new(),
            requester: "bad_actor".to_string(),
            timestamp: 0,
        };

        let compliance = ComplianceResult {
            status: ComplianceStatus::Blocked,
            overall_score: 0.0,
            violations: vec!["privacy_violation".to_string()],
            warnings: vec![],
            recommendations: vec![],
        };

        engine.enforce(&action, &compliance).await;

        assert!(engine.is_restricted("bad_actor").await);
    }

    #[tokio::test]
    async fn test_statistics() {
        let engine = EnforcementEngine::new();
        let stats = engine.statistics().await;
        assert_eq!(stats.total_violations, 0);
    }
}
