//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — CONSTITUTION (Master Prompt v∞)
//! Super Prompt #13 — Système de gouvernance constitutionnelle TITANE∞
//! ═══════════════════════════════════════════════════════════════════════════════
//!
//! La Constitution TITANE∞ définit:
//! - Les principes fondamentaux du système
//! - Les valeurs et l'éthique cognitive
//! - Les limites et garde-fous
//! - Les droits et responsabilités
//! - Les mécanismes de gouvernance

pub mod diagnostics;
pub mod enforcement;
pub mod evolution;
pub mod governance;
pub mod limits;
pub mod principles;
pub mod rights;
pub mod values;

pub use diagnostics::{
    ConstitutionalDiagnostics, ConstitutionalHealth, DiagnosticResult, HealthReport,
};
pub use enforcement::{
    EnforcementEngine, EnforcementStats, SanctionType, ViolationRecord, ViolationSeverity,
};
pub use evolution::{
    Amendment, AmendmentStatus, AmendmentType, ConstitutionVersion, EvolutionEngine,
};
pub use governance::{
    AuthorityLevel, DecisionRequest, DecisionResult, DecisionStatus, DecisionType, GovernanceEngine,
};
pub use limits::{Limit, LimitCategory, LimitCheckResult, LimitSystem, LimitType};
pub use principles::{Principle, PrincipleSet, PrincipleType};
pub use rights::{Right, RightCategory, RightsCharter, RightsContext, RightsHolder};
pub use values::{CoreValue, ValuePriority, ValueSystem};

use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Version de la Constitution
pub const CONSTITUTION_VERSION: &str = "v∞.1.0";

/// Configuration de la Constitution
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ConstitutionConfig {
    /// Activer l'enforcement strict
    pub strict_enforcement: bool,
    /// Permettre les amendements
    pub allow_amendments: bool,
    /// Niveau de logging
    pub log_level: LogLevel,
    /// Activer les alertes
    pub alerts_enabled: bool,
}

impl Default for ConstitutionConfig {
    fn default() -> Self {
        Self {
            strict_enforcement: true,
            allow_amendments: false, // Par défaut, constitution immuable
            log_level: LogLevel::Info,
            alerts_enabled: true,
        }
    }
}

/// Niveau de logging
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum LogLevel {
    Debug,
    Info,
    Warning,
    Error,
}

/// État de la Constitution
#[derive(Clone, Debug, Default)]
pub struct ConstitutionState {
    pub principles_active: usize,
    pub values_defined: usize,
    pub limits_enforced: usize,
    pub violations_detected: u64,
    pub amendments_pending: usize,
    pub health_score: f32,
}

/// La Constitution TITANE∞
pub struct Constitution {
    config: ConstitutionConfig,
    state: Arc<RwLock<ConstitutionState>>,
    principles: PrincipleSet,
    values: ValueSystem,
    limits: LimitSystem,
    rights: RightsCharter,
    governance: GovernanceEngine,
    enforcer: EnforcementEngine,
    evolution: EvolutionEngine,
    diagnostics: ConstitutionalDiagnostics,
}

impl Constitution {
    /// Crée une nouvelle Constitution avec les valeurs fondamentales
    pub fn new(config: ConstitutionConfig) -> Self {
        Self {
            config,
            state: Arc::new(RwLock::new(ConstitutionState::default())),
            principles: PrincipleSet::default_titane(),
            values: ValueSystem::default_titane(),
            limits: LimitSystem::default_titane(),
            rights: RightsCharter::default_titane(),
            governance: GovernanceEngine::new(),
            enforcer: EnforcementEngine::new(),
            evolution: EvolutionEngine::new(),
            diagnostics: ConstitutionalDiagnostics::new(),
        }
    }

    /// Vérifie la conformité d'une action avec la Constitution
    pub async fn check_compliance(&self, action: &ConstitutionalAction) -> ComplianceResult {
        let mut violations = Vec::new();
        let mut warnings = Vec::new();

        // 1. Vérifier les principes
        for principle in self.principles.iter() {
            if !principle.allows(action) {
                violations.push(format!("Violates principle: {}", principle.name));
            }
        }

        // 2. Vérifier les valeurs
        for value in self.values.iter() {
            if !value.compatible_with(action) {
                violations.push(format!("Conflicts with value: {}", value.name));
            }
        }

        // 3. Vérifier les limites
        let limit_results = self.limits.check_action(action);
        for result in limit_results {
            if result.enforcement_required {
                violations.push(format!("Exceeds limit: {}", result.limit_id));
            } else if result.exceeded {
                warnings.push(format!("Limit warning: {}", result.limit_id));
            }
        }

        // Calculer le résultat
        let overall_score = if violations.is_empty() {
            1.0
        } else {
            (1.0 - (violations.len() as f32 * 0.2)).max(0.0)
        };

        let status = if violations.is_empty() {
            ComplianceStatus::Compliant
        } else if overall_score > 0.5 {
            ComplianceStatus::PartiallyCompliant
        } else if overall_score > 0.0 {
            ComplianceStatus::NonCompliant
        } else {
            ComplianceStatus::Blocked
        };

        // Mettre à jour l'état
        if !violations.is_empty() {
            let mut state = self.state.write().await;
            state.violations_detected += violations.len() as u64;
        }

        ComplianceResult {
            status,
            overall_score,
            violations,
            warnings,
            recommendations: vec![],
        }
    }

    /// Applique les sanctions pour une non-conformité
    pub async fn enforce(
        &self,
        action: &ConstitutionalAction,
        compliance: &ComplianceResult,
    ) -> Vec<SanctionType> {
        self.enforcer.enforce(action, compliance).await
    }

    /// Propose un amendement (si autorisé)
    pub async fn propose_amendment(
        &self,
        amendment: Amendment,
    ) -> Result<String, ConstitutionError> {
        if !self.config.allow_amendments {
            return Err(ConstitutionError::AmendmentsDisabled);
        }

        self.evolution
            .propose_amendment(amendment)
            .await
            .map_err(ConstitutionError::InvalidAmendment)
    }

    /// Récupère les principes fondamentaux
    pub fn get_principles(&self) -> &PrincipleSet {
        &self.principles
    }

    /// Récupère les valeurs
    pub fn get_values(&self) -> &ValueSystem {
        &self.values
    }

    /// Récupère les limites
    pub fn get_limits(&self) -> &LimitSystem {
        &self.limits
    }

    /// Récupère les droits
    pub fn get_rights(&self) -> &RightsCharter {
        &self.rights
    }

    /// Récupère l'état actuel
    pub async fn get_state(&self) -> ConstitutionState {
        self.state.read().await.clone()
    }

    /// Récupère la santé de la Constitution
    pub async fn get_health(&self) -> HealthReport {
        self.diagnostics
            .run_full_diagnostic(
                &self.principles,
                &self.values,
                &self.limits,
                &self.rights,
                &self.enforcer,
                &self.evolution,
            )
            .await
    }

    /// Génère un rapport complet
    pub async fn generate_report(&self) -> ConstitutionReport {
        let state = self.state.read().await;
        let health = self.get_health().await;

        ConstitutionReport {
            version: CONSTITUTION_VERSION.to_string(),
            principles_count: self.principles.len(),
            values_count: self.values.len(),
            limits_count: self.limits.len(),
            rights_count: self.rights.len(),
            violations_total: state.violations_detected,
            amendments_pending: state.amendments_pending,
            health: health.overall_health,
            timestamp: Self::now(),
        }
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

/// Action à vérifier pour conformité
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ConstitutionalAction {
    pub action_type: String,
    pub target: String,
    pub parameters: std::collections::HashMap<String, String>,
    pub requester: String,
    pub timestamp: u64,
}

/// Statut de conformité
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub enum ComplianceStatus {
    #[default]
    Compliant,
    PartiallyCompliant,
    NonCompliant,
    Blocked,
}

/// Résultat de vérification de conformité
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct ComplianceResult {
    pub status: ComplianceStatus,
    pub overall_score: f32,
    pub violations: Vec<String>,
    pub warnings: Vec<String>,
    pub recommendations: Vec<String>,
}

/// Rapport de la Constitution
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ConstitutionReport {
    pub version: String,
    pub principles_count: usize,
    pub values_count: usize,
    pub limits_count: usize,
    pub rights_count: usize,
    pub violations_total: u64,
    pub amendments_pending: usize,
    pub health: ConstitutionalHealth,
    pub timestamp: u64,
}

/// Erreurs de la Constitution
#[derive(Debug, Clone)]
pub enum ConstitutionError {
    AmendmentsDisabled,
    InvalidAmendment(String),
    ViolationNotFound,
    EnforcementFailed(String),
    GovernanceError(String),
}

impl std::fmt::Display for ConstitutionError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::AmendmentsDisabled => write!(f, "Amendments are disabled"),
            Self::InvalidAmendment(msg) => write!(f, "Invalid amendment: {}", msg),
            Self::ViolationNotFound => write!(f, "Violation not found"),
            Self::EnforcementFailed(msg) => write!(f, "Enforcement failed: {}", msg),
            Self::GovernanceError(msg) => write!(f, "Governance error: {}", msg),
        }
    }
}

impl std::error::Error for ConstitutionError {}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_constitution_creation() {
        let config = ConstitutionConfig::default();
        let constitution = Constitution::new(config);
        let report = constitution.generate_report().await;

        assert!(report.principles_count > 0);
        assert!(report.values_count > 0);
    }

    #[tokio::test]
    async fn test_compliance_check() {
        let config = ConstitutionConfig::default();
        let constitution = Constitution::new(config);

        let action = ConstitutionalAction {
            action_type: "query".to_string(),
            target: "user_data".to_string(),
            parameters: std::collections::HashMap::new(),
            requester: "system".to_string(),
            timestamp: 0,
        };

        let result = constitution.check_compliance(&action).await;
        // Default action should be compliant
        assert_eq!(result.status, ComplianceStatus::Compliant);
    }
}
