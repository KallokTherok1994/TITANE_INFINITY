#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   AGENT CONTRACT — Contrats et Règles
//   Définition des contrats d'agents avec invariants et limites
// ═══════════════════════════════════════════════════════════════

use crate::agents::AgentRole;
use serde::{Deserialize, Serialize};

/// Violation de contrat
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ContractViolation {
    /// Dépassement du temps d'exécution maximum
    TimeoutExceeded {
        allowed_seconds: u64,
        actual_seconds: u64,
    },
    /// Dépassement de l'utilisation mémoire
    MemoryExceeded { allowed_mb: usize, actual_mb: usize },
    /// Trop d'échecs consécutifs
    TooManyFailures {
        max_failures: u32,
        actual_failures: u32,
    },
    /// Taux de succès insuffisant
    InsufficientSuccessRate {
        required_rate: f32,
        actual_rate: f32,
    },
    /// Violation d'invariant
    InvariantViolation(String),
    /// Dépassement du quota de messages
    MessageQuotaExceeded {
        max_messages: u64,
        actual_messages: u64,
    },
    /// Action interdite
    ForbiddenAction(String),
}

impl std::fmt::Display for ContractViolation {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::TimeoutExceeded {
                allowed_seconds,
                actual_seconds,
            } => {
                write!(
                    f,
                    "Timeout exceeded: allowed {}s, actual {}s",
                    allowed_seconds, actual_seconds
                )
            }
            Self::MemoryExceeded {
                allowed_mb,
                actual_mb,
            } => {
                write!(
                    f,
                    "Memory exceeded: allowed {}MB, actual {}MB",
                    allowed_mb, actual_mb
                )
            }
            Self::TooManyFailures {
                max_failures,
                actual_failures,
            } => {
                write!(
                    f,
                    "Too many failures: max {}, actual {}",
                    max_failures, actual_failures
                )
            }
            Self::InsufficientSuccessRate {
                required_rate,
                actual_rate,
            } => {
                write!(
                    f,
                    "Insufficient success rate: required {:.2}, actual {:.2}",
                    required_rate, actual_rate
                )
            }
            Self::InvariantViolation(msg) => write!(f, "Invariant violation: {}", msg),
            Self::MessageQuotaExceeded {
                max_messages,
                actual_messages,
            } => {
                write!(
                    f,
                    "Message quota exceeded: max {}, actual {}",
                    max_messages, actual_messages
                )
            }
            Self::ForbiddenAction(action) => write!(f, "Forbidden action: {}", action),
        }
    }
}

/// Contrat d'agent — Définit les responsabilités, limites et invariants
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentContract {
    /// Rôle de l'agent
    pub role: AgentRole,

    // === Responsabilités ===
    /// Liste des responsabilités principales
    pub responsibilities: Vec<String>,

    // === Limites d'exécution ===
    /// Temps d'exécution maximum par tâche (secondes)
    pub max_execution_time_seconds: u64,
    /// Utilisation mémoire maximum (MB)
    pub max_memory_mb: usize,
    /// Quota de messages par minute
    pub message_quota_per_minute: u64,

    // === Métriques attendues ===
    /// Taux de succès minimum requis (0.0-1.0)
    pub required_success_rate: f32,
    /// Nombre maximum d'échecs consécutifs toléré
    pub max_consecutive_failures: u32,

    // === Invariants ===
    /// Invariants que l'agent doit respecter
    pub invariants: Vec<String>,

    // === Restrictions ===
    /// Actions explicitement interdites
    pub forbidden_actions: Vec<String>,

    // === Configuration ===
    /// Redémarrage automatique en cas d'erreur
    pub auto_restart_on_error: bool,
    /// Isolé dans un sandbox strict
    pub sandboxed: bool,
    /// Peut collaborer avec d'autres agents
    pub can_collaborate: bool,
}

impl AgentContract {
    /// Créer un contrat par défaut pour un rôle
    pub fn default_for_role(role: &AgentRole) -> Self {
        match role {
            AgentRole::Observer => Self {
                role: *role,
                responsibilities: vec![
                    "Surveiller l'état du système".to_string(),
                    "Détecter les dérives cognitives".to_string(),
                    "Collecter les métriques de performance".to_string(),
                    "Signaler les anomalies".to_string(),
                ],
                max_execution_time_seconds: 60,
                max_memory_mb: 30,
                message_quota_per_minute: 100,
                required_success_rate: 0.95,
                max_consecutive_failures: 5,
                invariants: vec![
                    "Ne jamais modifier le système observé".to_string(),
                    "Toujours rester en lecture seule".to_string(),
                ],
                forbidden_actions: vec![
                    "Modifier la mémoire".to_string(),
                    "Modifier la configuration".to_string(),
                ],
                auto_restart_on_error: true,
                sandboxed: true,
                can_collaborate: true,
            },

            AgentRole::Memory => Self {
                role: *role,
                responsibilities: vec![
                    "Curer la mémoire STM/MTM/LTM".to_string(),
                    "Consolider les souvenirs importants".to_string(),
                    "Oublier les informations obsolètes".to_string(),
                    "Optimiser la recherche vectorielle".to_string(),
                ],
                max_execution_time_seconds: 120,
                max_memory_mb: 50,
                message_quota_per_minute: 50,
                required_success_rate: 0.98,
                max_consecutive_failures: 3,
                invariants: vec![
                    "Ne jamais supprimer des souvenirs à importance >0.9".to_string(),
                    "Toujours vérifier la cohérence avant consolidation".to_string(),
                ],
                forbidden_actions: vec!["Supprimer toute la mémoire".to_string()],
                auto_restart_on_error: true,
                sandboxed: true,
                can_collaborate: true,
            },

            AgentRole::Synthesizer => Self {
                role: *role,
                responsibilities: vec![
                    "Structurer les idées".to_string(),
                    "Résumer les informations".to_string(),
                    "Organiser les connaissances".to_string(),
                ],
                max_execution_time_seconds: 90,
                max_memory_mb: 40,
                message_quota_per_minute: 60,
                required_success_rate: 0.90,
                max_consecutive_failures: 5,
                invariants: vec!["Préserver le sens original lors des résumés".to_string()],
                forbidden_actions: vec![],
                auto_restart_on_error: true,
                sandboxed: true,
                can_collaborate: true,
            },

            AgentRole::Analyzer => Self {
                role: *role,
                responsibilities: vec![
                    "Effectuer du raisonnement profond".to_string(),
                    "Analyser des patterns complexes".to_string(),
                    "Détecter des relations causales".to_string(),
                ],
                max_execution_time_seconds: 180,
                max_memory_mb: 50,
                message_quota_per_minute: 40,
                required_success_rate: 0.85,
                max_consecutive_failures: 3,
                invariants: vec!["Toujours fournir une justification du raisonnement".to_string()],
                forbidden_actions: vec![],
                auto_restart_on_error: true,
                sandboxed: true,
                can_collaborate: true,
            },

            AgentRole::Temporal => Self {
                role: *role,
                responsibilities: vec![
                    "Modéliser les cycles temporels".to_string(),
                    "Prédire les états futurs".to_string(),
                    "Détecter les patterns temporels".to_string(),
                ],
                max_execution_time_seconds: 120,
                max_memory_mb: 40,
                message_quota_per_minute: 50,
                required_success_rate: 0.80,
                max_consecutive_failures: 5,
                invariants: vec![
                    "Les prédictions doivent inclure un niveau de confiance".to_string()
                ],
                forbidden_actions: vec![],
                auto_restart_on_error: true,
                sandboxed: true,
                can_collaborate: true,
            },

            AgentRole::Security => Self {
                role: *role,
                responsibilities: vec![
                    "Vérifier les permissions ACL".to_string(),
                    "Appliquer les règles de sécurité".to_string(),
                    "Détecter les menaces".to_string(),
                ],
                max_execution_time_seconds: 30,
                max_memory_mb: 30,
                message_quota_per_minute: 200,
                required_success_rate: 0.99,
                max_consecutive_failures: 1,
                invariants: vec![
                    "Toujours bloquer en cas de doute".to_string(),
                    "Ne jamais assouplir les règles sans autorisation".to_string(),
                ],
                forbidden_actions: vec!["Désactiver la sécurité".to_string()],
                auto_restart_on_error: true,
                sandboxed: false, // Besoin d'accès privilégié
                can_collaborate: false,
            },

            AgentRole::API => Self {
                role: *role,
                responsibilities: vec![
                    "Gérer l'API Hub".to_string(),
                    "Valider les requêtes".to_string(),
                    "Appliquer le rate limiting".to_string(),
                ],
                max_execution_time_seconds: 60,
                max_memory_mb: 30,
                message_quota_per_minute: 500,
                required_success_rate: 0.95,
                max_consecutive_failures: 10,
                invariants: vec!["Ne jamais exposer les secrets API".to_string()],
                forbidden_actions: vec![],
                auto_restart_on_error: true,
                sandboxed: true,
                can_collaborate: false,
            },

            AgentRole::Vision => Self {
                role: *role,
                responsibilities: vec![
                    "Analyser les images".to_string(),
                    "Extraire les features visuelles".to_string(),
                    "Rechercher visuellement".to_string(),
                ],
                max_execution_time_seconds: 90,
                max_memory_mb: 100, // Images nécessitent plus de mémoire
                message_quota_per_minute: 30,
                required_success_rate: 0.90,
                max_consecutive_failures: 5,
                invariants: vec![],
                forbidden_actions: vec![],
                auto_restart_on_error: true,
                sandboxed: true,
                can_collaborate: true,
            },

            AgentRole::Audio => Self {
                role: *role,
                responsibilities: vec![
                    "Analyser le spectre audio".to_string(),
                    "Détecter le positionnement spatial".to_string(),
                    "Reconnaître les patterns sonores".to_string(),
                ],
                max_execution_time_seconds: 90,
                max_memory_mb: 80,
                message_quota_per_minute: 30,
                required_success_rate: 0.90,
                max_consecutive_failures: 5,
                invariants: vec![],
                forbidden_actions: vec![],
                auto_restart_on_error: true,
                sandboxed: true,
                can_collaborate: true,
            },

            AgentRole::DevTools => Self {
                role: *role,
                responsibilities: vec![
                    "Enrichir les logs".to_string(),
                    "Tracer les exécutions".to_string(),
                    "Profiler les performances".to_string(),
                ],
                max_execution_time_seconds: 60,
                max_memory_mb: 40,
                message_quota_per_minute: 200,
                required_success_rate: 0.99,
                max_consecutive_failures: 10,
                invariants: vec!["Ne jamais ralentir le système principal".to_string()],
                forbidden_actions: vec![],
                auto_restart_on_error: true,
                sandboxed: true,
                can_collaborate: false,
            },

            AgentRole::Evolution => Self {
                role: *role,
                responsibilities: vec![
                    "Meta-learning".to_string(),
                    "Proposer des micro-améliorations".to_string(),
                    "Adapter le système continuellement".to_string(),
                ],
                max_execution_time_seconds: 300,
                max_memory_mb: 50,
                message_quota_per_minute: 20,
                required_success_rate: 0.70, // Expérimental
                max_consecutive_failures: 10,
                invariants: vec![
                    "Toujours valider les améliorations avant application".to_string(),
                    "Ne jamais dégrader les performances existantes".to_string(),
                ],
                forbidden_actions: vec!["Modifier le noyau système directement".to_string()],
                auto_restart_on_error: true,
                sandboxed: true,
                can_collaborate: true,
            },
        }
    }

    /// Vérifier si un temps d'exécution respecte le contrat
    pub fn check_execution_time(&self, seconds: u64) -> Result<(), ContractViolation> {
        if seconds > self.max_execution_time_seconds {
            Err(ContractViolation::TimeoutExceeded {
                allowed_seconds: self.max_execution_time_seconds,
                actual_seconds: seconds,
            })
        } else {
            Ok(())
        }
    }

    /// Vérifier si l'utilisation mémoire respecte le contrat
    pub fn check_memory_usage(&self, mb: usize) -> Result<(), ContractViolation> {
        if mb > self.max_memory_mb {
            Err(ContractViolation::MemoryExceeded {
                allowed_mb: self.max_memory_mb,
                actual_mb: mb,
            })
        } else {
            Ok(())
        }
    }

    /// Vérifier si le taux de succès respecte le contrat
    pub fn check_success_rate(&self, rate: f32) -> Result<(), ContractViolation> {
        if rate < self.required_success_rate {
            Err(ContractViolation::InsufficientSuccessRate {
                required_rate: self.required_success_rate,
                actual_rate: rate,
            })
        } else {
            Ok(())
        }
    }

    /// Vérifier si les échecs consécutifs respectent le contrat
    pub fn check_consecutive_failures(&self, failures: u32) -> Result<(), ContractViolation> {
        if failures > self.max_consecutive_failures {
            Err(ContractViolation::TooManyFailures {
                max_failures: self.max_consecutive_failures,
                actual_failures: failures,
            })
        } else {
            Ok(())
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────────────
    // Tests ContractViolation
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_contract_violation_timeout() {
        let v = ContractViolation::TimeoutExceeded {
            allowed_seconds: 60,
            actual_seconds: 120,
        };
        assert!(matches!(v, ContractViolation::TimeoutExceeded { .. }));
    }

    #[test]
    fn test_contract_violation_memory() {
        let v = ContractViolation::MemoryExceeded {
            allowed_mb: 50,
            actual_mb: 100,
        };
        assert!(matches!(v, ContractViolation::MemoryExceeded { .. }));
    }

    #[test]
    fn test_contract_violation_too_many_failures() {
        let v = ContractViolation::TooManyFailures {
            max_failures: 5,
            actual_failures: 10,
        };
        assert!(matches!(v, ContractViolation::TooManyFailures { .. }));
    }

    #[test]
    fn test_contract_violation_insufficient_success_rate() {
        let v = ContractViolation::InsufficientSuccessRate {
            required_rate: 0.95,
            actual_rate: 0.80,
        };
        assert!(matches!(v, ContractViolation::InsufficientSuccessRate { .. }));
    }

    #[test]
    fn test_contract_violation_invariant() {
        let v = ContractViolation::InvariantViolation("test invariant".to_string());
        assert!(matches!(v, ContractViolation::InvariantViolation(_)));
    }

    #[test]
    fn test_contract_violation_message_quota() {
        let v = ContractViolation::MessageQuotaExceeded {
            max_messages: 100,
            actual_messages: 150,
        };
        assert!(matches!(v, ContractViolation::MessageQuotaExceeded { .. }));
    }

    #[test]
    fn test_contract_violation_forbidden_action() {
        let v = ContractViolation::ForbiddenAction("delete all".to_string());
        assert!(matches!(v, ContractViolation::ForbiddenAction(_)));
    }

    #[test]
    fn test_contract_violation_display_timeout() {
        let v = ContractViolation::TimeoutExceeded {
            allowed_seconds: 60,
            actual_seconds: 120,
        };
        let s = format!("{}", v);
        assert!(s.contains("Timeout exceeded"));
        assert!(s.contains("60"));
        assert!(s.contains("120"));
    }

    #[test]
    fn test_contract_violation_display_memory() {
        let v = ContractViolation::MemoryExceeded {
            allowed_mb: 50,
            actual_mb: 100,
        };
        let s = format!("{}", v);
        assert!(s.contains("Memory exceeded"));
    }

    #[test]
    fn test_contract_violation_display_failures() {
        let v = ContractViolation::TooManyFailures {
            max_failures: 5,
            actual_failures: 10,
        };
        let s = format!("{}", v);
        assert!(s.contains("Too many failures"));
    }

    #[test]
    fn test_contract_violation_display_success_rate() {
        let v = ContractViolation::InsufficientSuccessRate {
            required_rate: 0.95,
            actual_rate: 0.80,
        };
        let s = format!("{}", v);
        assert!(s.contains("Insufficient success rate"));
    }

    #[test]
    fn test_contract_violation_display_invariant() {
        let v = ContractViolation::InvariantViolation("test".to_string());
        let s = format!("{}", v);
        assert!(s.contains("Invariant violation"));
    }

    #[test]
    fn test_contract_violation_display_message_quota() {
        let v = ContractViolation::MessageQuotaExceeded {
            max_messages: 100,
            actual_messages: 200,
        };
        let s = format!("{}", v);
        assert!(s.contains("Message quota exceeded"));
    }

    #[test]
    fn test_contract_violation_display_forbidden() {
        let v = ContractViolation::ForbiddenAction("hack".to_string());
        let s = format!("{}", v);
        assert!(s.contains("Forbidden action"));
    }

    #[test]
    fn test_contract_violation_clone() {
        let v = ContractViolation::TimeoutExceeded {
            allowed_seconds: 60,
            actual_seconds: 90,
        };
        let cloned = v.clone();
        assert!(matches!(cloned, ContractViolation::TimeoutExceeded { allowed_seconds: 60, .. }));
    }

    #[test]
    fn test_contract_violation_debug() {
        let v = ContractViolation::MemoryExceeded {
            allowed_mb: 50,
            actual_mb: 75,
        };
        let debug = format!("{:?}", v);
        assert!(debug.contains("MemoryExceeded"));
    }

    #[test]
    fn test_contract_violation_serialize() {
        let v = ContractViolation::ForbiddenAction("test".to_string());
        let json = serde_json::to_string(&v).unwrap();
        assert!(json.contains("ForbiddenAction"));
    }

    #[test]
    fn test_contract_violation_deserialize() {
        let json = r#"{"InvariantViolation":"broken"}"#;
        let v: ContractViolation = serde_json::from_str(json).unwrap();
        assert!(matches!(v, ContractViolation::InvariantViolation(_)));
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests AgentContract existing
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_contract_defaults() {
        for role in AgentRole::all() {
            let contract = AgentContract::default_for_role(&role);
            assert!(!contract.responsibilities.is_empty());
            assert!(contract.max_execution_time_seconds > 0);
            assert!(contract.max_memory_mb > 0);
        }
    }

    #[test]
    fn test_timeout_check() {
        let contract = AgentContract::default_for_role(&AgentRole::Observer);
        assert!(contract.check_execution_time(30).is_ok());
        assert!(contract.check_execution_time(300).is_err());
    }

    #[test]
    fn test_memory_check() {
        let contract = AgentContract::default_for_role(&AgentRole::Observer);
        assert!(contract.check_memory_usage(20).is_ok());
        assert!(contract.check_memory_usage(100).is_err());
    }

    #[test]
    fn test_success_rate_check() {
        let contract = AgentContract::default_for_role(&AgentRole::Observer);
        assert!(contract.check_success_rate(0.96).is_ok());
        assert!(contract.check_success_rate(0.80).is_err());
    }

    #[test]
    fn test_security_agent_strict_contract() {
        let contract = AgentContract::default_for_role(&AgentRole::Security);
        assert_eq!(contract.max_consecutive_failures, 1);
        assert_eq!(contract.required_success_rate, 0.99);
        assert!(!contract.sandboxed); // Privilèges élevés
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests AgentContract additional
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_contract_observer() {
        let contract = AgentContract::default_for_role(&AgentRole::Observer);
        assert_eq!(contract.role, AgentRole::Observer);
        assert!(contract.sandboxed);
        assert!(contract.can_collaborate);
    }

    #[test]
    fn test_contract_memory() {
        let contract = AgentContract::default_for_role(&AgentRole::Memory);
        assert_eq!(contract.role, AgentRole::Memory);
        assert_eq!(contract.required_success_rate, 0.98);
    }

    #[test]
    fn test_contract_synthesizer() {
        let contract = AgentContract::default_for_role(&AgentRole::Synthesizer);
        assert!(contract.invariants.len() > 0);
    }

    #[test]
    fn test_contract_analyzer() {
        let contract = AgentContract::default_for_role(&AgentRole::Analyzer);
        assert_eq!(contract.max_execution_time_seconds, 180);
    }

    #[test]
    fn test_contract_temporal() {
        let contract = AgentContract::default_for_role(&AgentRole::Temporal);
        assert!(contract.invariants.len() > 0);
    }

    #[test]
    fn test_contract_api() {
        let contract = AgentContract::default_for_role(&AgentRole::API);
        assert!(!contract.can_collaborate);
        assert_eq!(contract.message_quota_per_minute, 500);
    }

    #[test]
    fn test_contract_vision() {
        let contract = AgentContract::default_for_role(&AgentRole::Vision);
        assert_eq!(contract.max_memory_mb, 100); // High memory for images
    }

    #[test]
    fn test_contract_audio() {
        let contract = AgentContract::default_for_role(&AgentRole::Audio);
        assert_eq!(contract.max_memory_mb, 80);
    }

    #[test]
    fn test_contract_devtools() {
        let contract = AgentContract::default_for_role(&AgentRole::DevTools);
        assert!(!contract.can_collaborate);
    }

    #[test]
    fn test_contract_evolution() {
        let contract = AgentContract::default_for_role(&AgentRole::Evolution);
        assert_eq!(contract.required_success_rate, 0.70); // Experimental
        assert_eq!(contract.max_execution_time_seconds, 300);
    }

    #[test]
    fn test_check_consecutive_failures_ok() {
        let contract = AgentContract::default_for_role(&AgentRole::Observer);
        assert!(contract.check_consecutive_failures(3).is_ok());
    }

    #[test]
    fn test_check_consecutive_failures_exceeded() {
        let contract = AgentContract::default_for_role(&AgentRole::Observer);
        assert!(contract.check_consecutive_failures(10).is_err());
    }

    #[test]
    fn test_check_execution_time_at_limit() {
        let contract = AgentContract::default_for_role(&AgentRole::Observer);
        assert!(contract.check_execution_time(60).is_ok()); // At limit
        assert!(contract.check_execution_time(61).is_err()); // Over
    }

    #[test]
    fn test_check_memory_at_limit() {
        let contract = AgentContract::default_for_role(&AgentRole::Observer);
        assert!(contract.check_memory_usage(30).is_ok()); // At limit
        assert!(contract.check_memory_usage(31).is_err()); // Over
    }

    #[test]
    fn test_check_success_rate_at_limit() {
        let contract = AgentContract::default_for_role(&AgentRole::Observer);
        assert!(contract.check_success_rate(0.95).is_ok()); // At limit
        assert!(contract.check_success_rate(0.94).is_err()); // Under
    }

    #[test]
    fn test_contract_clone() {
        let contract = AgentContract::default_for_role(&AgentRole::Observer);
        let cloned = contract.clone();
        assert_eq!(cloned.role, contract.role);
        assert_eq!(cloned.max_execution_time_seconds, contract.max_execution_time_seconds);
    }

    #[test]
    fn test_contract_debug() {
        let contract = AgentContract::default_for_role(&AgentRole::Memory);
        let debug = format!("{:?}", contract);
        assert!(debug.contains("AgentContract"));
    }

    #[test]
    fn test_contract_serialize() {
        let contract = AgentContract::default_for_role(&AgentRole::Security);
        let json = serde_json::to_string(&contract).unwrap();
        assert!(json.contains("Security"));
        assert!(json.contains("max_execution_time_seconds"));
    }

    #[test]
    fn test_contract_deserialize() {
        let contract = AgentContract::default_for_role(&AgentRole::API);
        let json = serde_json::to_string(&contract).unwrap();
        let restored: AgentContract = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.role, AgentRole::API);
    }
}
