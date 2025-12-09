//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — GOUVERNANCE CONSTITUTIONNELLE
//! Super Prompt #13 — Mécanismes de gouvernance et prise de décision
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use std::collections::HashMap;

/// Niveau d'autorité dans la hiérarchie
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub enum AuthorityLevel {
    /// Utilisateur final
    User = 1,
    /// Agent autonome
    Agent = 2,
    /// Sous-système
    Subsystem = 3,
    /// Système principal
    System = 4,
    /// Constitution (plus haute autorité)
    Constitution = 5,
}

/// Type de décision
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum DecisionType {
    /// Décision opérationnelle (routine)
    Operational,
    /// Décision stratégique
    Strategic,
    /// Décision d'urgence
    Emergency,
    /// Décision constitutionnelle
    Constitutional,
    /// Décision de recours
    Appeal,
}

/// Statut d'une décision
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum DecisionStatus {
    Pending,
    Approved,
    Rejected,
    Escalated,
    Expired,
}

/// Demande de décision
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DecisionRequest {
    pub id: String,
    pub decision_type: DecisionType,
    pub requester: String,
    pub requester_level: AuthorityLevel,
    pub subject: String,
    pub description: String,
    pub urgency: f32,
    pub created_at: u64,
    pub expires_at: Option<u64>,
}

/// Résultat d'une décision
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DecisionResult {
    pub request_id: String,
    pub status: DecisionStatus,
    pub decided_by: AuthorityLevel,
    pub rationale: String,
    pub conditions: Vec<String>,
    pub decided_at: u64,
    pub appeal_available: bool,
}

/// Règle de délégation
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DelegationRule {
    pub from_level: AuthorityLevel,
    pub to_level: AuthorityLevel,
    pub decision_types: Vec<DecisionType>,
    pub conditions: Vec<String>,
    pub active: bool,
}

/// Politique de gouvernance
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GovernancePolicy {
    pub id: String,
    pub name: String,
    pub description: String,
    pub applies_to: Vec<DecisionType>,
    pub required_authority: AuthorityLevel,
    pub auto_approve_threshold: Option<f32>,
    pub requires_review: bool,
    pub timeout_ms: u64,
}

/// État de la gouvernance
struct GovernanceState {
    pending_decisions: HashMap<String, DecisionRequest>,
    decision_history: Vec<DecisionResult>,
    delegation_rules: Vec<DelegationRule>,
    policies: Vec<GovernancePolicy>,
}

impl Default for GovernanceState {
    fn default() -> Self {
        Self {
            pending_decisions: HashMap::new(),
            decision_history: Vec::new(),
            delegation_rules: Self::default_delegation_rules(),
            policies: Self::default_policies(),
        }
    }
}

impl GovernanceState {
    fn default_delegation_rules() -> Vec<DelegationRule> {
        vec![
            // Le système peut déléguer les décisions opérationnelles aux agents
            DelegationRule {
                from_level: AuthorityLevel::System,
                to_level: AuthorityLevel::Agent,
                decision_types: vec![DecisionType::Operational],
                conditions: vec!["confidence > 0.8".to_string()],
                active: true,
            },
            // Les agents peuvent déléguer aux sous-systèmes
            DelegationRule {
                from_level: AuthorityLevel::Agent,
                to_level: AuthorityLevel::Subsystem,
                decision_types: vec![DecisionType::Operational],
                conditions: vec!["routine_task".to_string()],
                active: true,
            },
            // L'utilisateur peut escalader vers le système
            DelegationRule {
                from_level: AuthorityLevel::User,
                to_level: AuthorityLevel::System,
                decision_types: vec![DecisionType::Strategic, DecisionType::Appeal],
                conditions: vec![],
                active: true,
            },
        ]
    }

    fn default_policies() -> Vec<GovernancePolicy> {
        vec![
            GovernancePolicy {
                id: "operational_auto".to_string(),
                name: "Auto-approve Operational".to_string(),
                description: "Automatically approve low-risk operational decisions".to_string(),
                applies_to: vec![DecisionType::Operational],
                required_authority: AuthorityLevel::Agent,
                auto_approve_threshold: Some(0.9),
                requires_review: false,
                timeout_ms: 5000,
            },
            GovernancePolicy {
                id: "strategic_review".to_string(),
                name: "Strategic Review".to_string(),
                description: "All strategic decisions require review".to_string(),
                applies_to: vec![DecisionType::Strategic],
                required_authority: AuthorityLevel::System,
                auto_approve_threshold: None,
                requires_review: true,
                timeout_ms: 60000,
            },
            GovernancePolicy {
                id: "emergency_fast".to_string(),
                name: "Emergency Fast-Track".to_string(),
                description: "Emergency decisions are fast-tracked".to_string(),
                applies_to: vec![DecisionType::Emergency],
                required_authority: AuthorityLevel::System,
                auto_approve_threshold: Some(0.7),
                requires_review: false,
                timeout_ms: 1000,
            },
            GovernancePolicy {
                id: "constitutional_strict".to_string(),
                name: "Constitutional Strict".to_string(),
                description: "Constitutional changes require highest authority".to_string(),
                applies_to: vec![DecisionType::Constitutional],
                required_authority: AuthorityLevel::Constitution,
                auto_approve_threshold: None,
                requires_review: true,
                timeout_ms: 86400000, // 24 heures
            },
        ]
    }
}

/// Moteur de gouvernance
pub struct GovernanceEngine {
    state: RwLock<GovernanceState>,
}

impl GovernanceEngine {
    pub fn new() -> Self {
        Self {
            state: RwLock::new(GovernanceState::default()),
        }
    }

    /// Soumet une demande de décision
    pub async fn submit_decision(&self, request: DecisionRequest) -> String {
        let mut state = self.state.write().await;
        let id = request.id.clone();
        state.pending_decisions.insert(id.clone(), request);
        id
    }

    /// Traite une décision en attente
    pub async fn process_decision(&self, request_id: &str) -> Option<DecisionResult> {
        let mut state = self.state.write().await;

        let request = state.pending_decisions.remove(request_id)?;

        // Trouver la politique applicable
        let policy = state.policies.iter()
            .find(|p| p.applies_to.contains(&request.decision_type));

        let result = if let Some(policy) = policy {
            self.apply_policy(&request, policy)
        } else {
            // Politique par défaut: approuver si autorité suffisante
            DecisionResult {
                request_id: request.id.clone(),
                status: if request.requester_level >= AuthorityLevel::Agent {
                    DecisionStatus::Approved
                } else {
                    DecisionStatus::Escalated
                },
                decided_by: request.requester_level,
                rationale: "Default policy applied".to_string(),
                conditions: vec![],
                decided_at: Self::now(),
                appeal_available: true,
            }
        };

        state.decision_history.push(result.clone());
        Some(result)
    }

    /// Applique une politique de gouvernance
    fn apply_policy(&self, request: &DecisionRequest, policy: &GovernancePolicy) -> DecisionResult {
        let now = Self::now();

        // Vérifier l'expiration
        if let Some(expires) = request.expires_at {
            if now > expires {
                return DecisionResult {
                    request_id: request.id.clone(),
                    status: DecisionStatus::Expired,
                    decided_by: AuthorityLevel::System,
                    rationale: "Decision request expired".to_string(),
                    conditions: vec![],
                    decided_at: now,
                    appeal_available: false,
                };
            }
        }

        // Vérifier l'autorité requise
        if request.requester_level < policy.required_authority {
            return DecisionResult {
                request_id: request.id.clone(),
                status: DecisionStatus::Escalated,
                decided_by: policy.required_authority,
                rationale: format!("Requires {} authority", format!("{:?}", policy.required_authority)),
                conditions: vec![],
                decided_at: now,
                appeal_available: true,
            };
        }

        // Vérifier l'auto-approbation
        if let Some(threshold) = policy.auto_approve_threshold {
            if request.urgency >= threshold {
                return DecisionResult {
                    request_id: request.id.clone(),
                    status: DecisionStatus::Approved,
                    decided_by: request.requester_level,
                    rationale: format!("Auto-approved: urgency {} >= threshold {}", request.urgency, threshold),
                    conditions: vec![],
                    decided_at: now,
                    appeal_available: true,
                };
            }
        }

        // Requiert une révision manuelle
        if policy.requires_review {
            return DecisionResult {
                request_id: request.id.clone(),
                status: DecisionStatus::Pending,
                decided_by: policy.required_authority,
                rationale: "Awaiting review".to_string(),
                conditions: vec![],
                decided_at: now,
                appeal_available: false,
            };
        }

        // Approbation par défaut
        DecisionResult {
            request_id: request.id.clone(),
            status: DecisionStatus::Approved,
            decided_by: request.requester_level,
            rationale: "Policy criteria met".to_string(),
            conditions: vec![],
            decided_at: now,
            appeal_available: true,
        }
    }

    /// Traite un appel
    pub async fn process_appeal(&self, original_decision_id: &str, appeal_reason: &str) -> Option<DecisionResult> {
        let mut state = self.state.write().await;

        // Trouver la décision originale
        let original = state.decision_history.iter()
            .find(|d| d.request_id == original_decision_id)?;

        if !original.appeal_available {
            return None;
        }

        // Escalader à un niveau supérieur
        let appeal_level = match original.decided_by {
            AuthorityLevel::User => AuthorityLevel::Agent,
            AuthorityLevel::Agent => AuthorityLevel::Subsystem,
            AuthorityLevel::Subsystem => AuthorityLevel::System,
            AuthorityLevel::System => AuthorityLevel::Constitution,
            AuthorityLevel::Constitution => AuthorityLevel::Constitution,
        };

        let result = DecisionResult {
            request_id: format!("appeal_{}", original_decision_id),
            status: DecisionStatus::Pending,
            decided_by: appeal_level,
            rationale: format!("Appeal: {}", appeal_reason),
            conditions: vec![],
            decided_at: Self::now(),
            appeal_available: appeal_level < AuthorityLevel::Constitution,
        };

        state.decision_history.push(result.clone());
        Some(result)
    }

    /// Vérifie si une délégation est autorisée
    pub async fn can_delegate(&self, from: AuthorityLevel, to: AuthorityLevel, decision_type: DecisionType) -> bool {
        let state = self.state.read().await;

        state.delegation_rules.iter().any(|rule| {
            rule.active
                && rule.from_level == from
                && rule.to_level == to
                && rule.decision_types.contains(&decision_type)
        })
    }

    /// Récupère les décisions en attente
    pub async fn pending_decisions(&self) -> Vec<DecisionRequest> {
        let state = self.state.read().await;
        state.pending_decisions.values().cloned().collect()
    }

    /// Récupère l'historique des décisions
    pub async fn decision_history(&self, limit: usize) -> Vec<DecisionResult> {
        let state = self.state.read().await;
        state.decision_history.iter().rev().take(limit).cloned().collect()
    }

    /// Ajoute une règle de délégation
    pub async fn add_delegation_rule(&self, rule: DelegationRule) {
        let mut state = self.state.write().await;
        state.delegation_rules.push(rule);
    }

    /// Ajoute une politique
    pub async fn add_policy(&self, policy: GovernancePolicy) {
        let mut state = self.state.write().await;
        state.policies.push(policy);
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for GovernanceEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_governance_creation() {
        let engine = GovernanceEngine::new();
        let pending = engine.pending_decisions().await;
        assert!(pending.is_empty());
    }

    #[tokio::test]
    async fn test_submit_decision() {
        let engine = GovernanceEngine::new();
        let request = DecisionRequest {
            id: "test_decision".to_string(),
            decision_type: DecisionType::Operational,
            requester: "test_agent".to_string(),
            requester_level: AuthorityLevel::Agent,
            subject: "Test subject".to_string(),
            description: "Test description".to_string(),
            urgency: 0.5,
            created_at: 0,
            expires_at: None,
        };

        let id = engine.submit_decision(request).await;
        assert_eq!(id, "test_decision");

        let pending = engine.pending_decisions().await;
        assert_eq!(pending.len(), 1);
    }

    #[tokio::test]
    async fn test_process_decision() {
        let engine = GovernanceEngine::new();
        let request = DecisionRequest {
            id: "test_decision".to_string(),
            decision_type: DecisionType::Operational,
            requester: "test_agent".to_string(),
            requester_level: AuthorityLevel::Agent,
            subject: "Test subject".to_string(),
            description: "Test description".to_string(),
            urgency: 0.95, // High urgency for auto-approve
            created_at: 0,
            expires_at: None,
        };

        engine.submit_decision(request).await;
        let result = engine.process_decision("test_decision").await;

        assert!(result.is_some());
        let result = result.unwrap();
        assert_eq!(result.status, DecisionStatus::Approved);
    }

    #[tokio::test]
    async fn test_delegation_check() {
        let engine = GovernanceEngine::new();

        // System can delegate operational to Agent
        assert!(engine.can_delegate(
            AuthorityLevel::System,
            AuthorityLevel::Agent,
            DecisionType::Operational
        ).await);

        // Agent cannot delegate strategic
        assert!(!engine.can_delegate(
            AuthorityLevel::Agent,
            AuthorityLevel::Subsystem,
            DecisionType::Strategic
        ).await);
    }
}
