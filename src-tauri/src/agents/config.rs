#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   AGENT SYSTEM CONFIG — Configuration Globale
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

/// Configuration du système d'agents
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentSystemConfig {
    /// Système d'agents activé
    pub enabled: bool,

    // === Limites globales ===
    /// Nombre maximum d'agents concurrents
    pub max_concurrent_agents: usize,
    /// Intervalle de vérification du supervisor (ms)
    pub supervisor_check_interval_ms: u64,

    // === Sandbox ===
    /// Sandbox strict par défaut
    pub default_sandbox_enabled: bool,
    /// Timeout sandbox par défaut (secondes)
    pub default_sandbox_timeout_seconds: u64,

    // === Messaging ===
    /// Taille max de la queue de messages par agent
    pub max_message_queue_size: usize,
    /// Timeout de livraison de message (ms)
    pub message_delivery_timeout_ms: u64,

    // === Collaboration ===
    /// Collaboration inter-agents activée
    pub collaboration_enabled: bool,
    /// Profondeur maximum de collaboration
    pub max_collaboration_depth: usize,

    // === Auto-gestion ===
    /// Redémarrage automatique des agents en erreur
    pub auto_restart_failed_agents: bool,
    /// Nettoyage automatique des agents morts
    pub auto_cleanup_dead_agents: bool,

    // === Diagnostics ===
    /// Niveau de logging (0=minimal, 3=verbose)
    pub log_level: u8,
    /// Métriques détaillées activées
    pub detailed_metrics_enabled: bool,
}

impl Default for AgentSystemConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            max_concurrent_agents: 50,
            supervisor_check_interval_ms: 1000,
            default_sandbox_enabled: true,
            default_sandbox_timeout_seconds: 300,
            max_message_queue_size: 1000,
            message_delivery_timeout_ms: 5000,
            collaboration_enabled: true,
            max_collaboration_depth: 5,
            auto_restart_failed_agents: true,
            auto_cleanup_dead_agents: true,
            log_level: 2,
            detailed_metrics_enabled: true,
        }
    }
}

impl AgentSystemConfig {
    /// Configuration pour production
    pub fn production() -> Self {
        Self {
            log_level: 1,
            detailed_metrics_enabled: false,
            ..Default::default()
        }
    }

    /// Configuration pour développement
    pub fn development() -> Self {
        Self {
            log_level: 3,
            detailed_metrics_enabled: true,
            ..Default::default()
        }
    }

    /// Configuration minimale
    pub fn minimal() -> Self {
        Self {
            enabled: true,
            max_concurrent_agents: 10,
            max_message_queue_size: 100,
            collaboration_enabled: false,
            detailed_metrics_enabled: false,
            log_level: 0,
            ..Default::default()
        }
    }
}
