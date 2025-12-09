//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — REPAIR ACTIONS
//! Actions de réparation automatique
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

/// Actions de réparation disponibles
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum RepairAction {
    /// Redémarrer le pipeline OMEGA
    RestartOmega,
    /// Vider le cache mémoire
    ClearMemoryCache,
    /// Rééquilibrer les moteurs
    RebalanceEngines,
    /// Réduire l'utilisation mémoire
    TrimMemory,
    /// Réinitialiser le contexte de conversation
    ResetConversationContext,
    /// Reconstruire les index
    RebuildIndexes,
    /// Réduire le parallélisme
    ReduceParallelism,
    /// Activer le mode dégradé
    EnableDegradedMode,
    /// Forcer le garbage collection
    ForceGC,
    /// Log détaillé pour diagnostic
    EnableDetailedLogging,
    /// ═══ SUPER PROMPT #4 Additions ═══
    /// Activer le Safe Mode (fonctionnalités minimales)
    EnableSafeMode,
    /// Désactiver le Safe Mode
    DisableSafeMode,
    /// Redémarrer un moteur spécifique
    RestartEngine(String),
    /// Isoler un moteur défaillant
    IsolateEngine(String),
    /// Restaurer un moteur isolé
    RestoreEngine(String),
    /// Circuit breaker sur les appels LLM
    EnableCircuitBreaker,
    /// Désactiver circuit breaker
    DisableCircuitBreaker,
    /// Réduire la limite de tokens
    ReduceTokenLimit(u32),
    /// Restaurer la limite de tokens
    RestoreTokenLimit,
    /// Purger les providers défaillants
    PurgeFailedProviders,
}

impl RepairAction {
    /// Priorité de l'action (plus élevé = plus urgent)
    pub fn priority(&self) -> u8 {
        match self {
            RepairAction::EnableSafeMode => 12,
            RepairAction::RestartOmega => 10,
            RepairAction::IsolateEngine(_) => 9,
            RepairAction::EnableCircuitBreaker => 9,
            RepairAction::ClearMemoryCache => 8,
            RepairAction::PurgeFailedProviders => 8,
            RepairAction::TrimMemory => 7,
            RepairAction::RestartEngine(_) => 7,
            RepairAction::RebalanceEngines => 6,
            RepairAction::ReduceTokenLimit(_) => 6,
            RepairAction::ForceGC => 5,
            RepairAction::RebuildIndexes => 4,
            RepairAction::ResetConversationContext => 3,
            RepairAction::ReduceParallelism => 3,
            RepairAction::EnableDegradedMode => 2,
            RepairAction::RestoreEngine(_) => 2,
            RepairAction::RestoreTokenLimit => 2,
            RepairAction::DisableSafeMode => 2,
            RepairAction::DisableCircuitBreaker => 2,
            RepairAction::EnableDetailedLogging => 1,
        }
    }

    /// Description de l'action
    pub fn description(&self) -> &'static str {
        match self {
            RepairAction::RestartOmega => "Redémarrage du pipeline OMEGA",
            RepairAction::ClearMemoryCache => "Vidage du cache mémoire",
            RepairAction::RebalanceEngines => "Rééquilibrage des moteurs cognitifs",
            RepairAction::TrimMemory => "Réduction de l'empreinte mémoire",
            RepairAction::ResetConversationContext => "Réinitialisation du contexte",
            RepairAction::RebuildIndexes => "Reconstruction des index de recherche",
            RepairAction::ReduceParallelism => "Réduction du parallélisme",
            RepairAction::EnableDegradedMode => "Activation du mode dégradé",
            RepairAction::ForceGC => "Garbage collection forcé",
            RepairAction::EnableDetailedLogging => "Activation des logs détaillés",
            RepairAction::EnableSafeMode => "Activation du Safe Mode TITANE∞",
            RepairAction::DisableSafeMode => "Désactivation du Safe Mode",
            RepairAction::RestartEngine(_) => "Redémarrage d'un moteur spécifique",
            RepairAction::IsolateEngine(_) => "Isolation d'un moteur défaillant",
            RepairAction::RestoreEngine(_) => "Restauration d'un moteur isolé",
            RepairAction::EnableCircuitBreaker => "Activation du circuit breaker LLM",
            RepairAction::DisableCircuitBreaker => "Désactivation du circuit breaker",
            RepairAction::ReduceTokenLimit(_) => "Réduction de la limite de tokens",
            RepairAction::RestoreTokenLimit => "Restauration de la limite de tokens",
            RepairAction::PurgeFailedProviders => "Purge des providers défaillants",
        }
    }

    /// Risque de l'action (0 = sûr, 10 = risqué)
    pub fn risk_level(&self) -> u8 {
        match self {
            RepairAction::EnableDetailedLogging => 0,
            RepairAction::DisableCircuitBreaker => 1,
            RepairAction::ForceGC => 1,
            RepairAction::ReduceTokenLimit(_) => 1,
            RepairAction::RestoreTokenLimit => 1,
            RepairAction::TrimMemory => 2,
            RepairAction::ReduceParallelism => 2,
            RepairAction::EnableCircuitBreaker => 2,
            RepairAction::ClearMemoryCache => 3,
            RepairAction::RebalanceEngines => 4,
            RepairAction::EnableDegradedMode => 4,
            RepairAction::PurgeFailedProviders => 4,
            RepairAction::RebuildIndexes => 5,
            RepairAction::RestoreEngine(_) => 5,
            RepairAction::ResetConversationContext => 6,
            RepairAction::RestartEngine(_) => 6,
            RepairAction::IsolateEngine(_) => 7,
            RepairAction::RestartOmega => 8,
            RepairAction::EnableSafeMode => 7,
            RepairAction::DisableSafeMode => 5,
        }
    }

    /// Temps estimé d'exécution en ms
    pub fn estimated_duration_ms(&self) -> u64 {
        match self {
            RepairAction::EnableDetailedLogging => 10,
            RepairAction::EnableCircuitBreaker => 10,
            RepairAction::DisableCircuitBreaker => 10,
            RepairAction::ReduceTokenLimit(_) => 10,
            RepairAction::RestoreTokenLimit => 10,
            RepairAction::ForceGC => 50,
            RepairAction::ReduceParallelism => 50,
            RepairAction::EnableDegradedMode => 50,
            RepairAction::EnableSafeMode => 100,
            RepairAction::DisableSafeMode => 100,
            RepairAction::ClearMemoryCache => 100,
            RepairAction::ResetConversationContext => 100,
            RepairAction::PurgeFailedProviders => 100,
            RepairAction::TrimMemory => 200,
            RepairAction::RebalanceEngines => 300,
            RepairAction::RestartEngine(_) => 300,
            RepairAction::IsolateEngine(_) => 50,
            RepairAction::RestoreEngine(_) => 200,
            RepairAction::RestartOmega => 500,
            RepairAction::RebuildIndexes => 1000,
        }
    }

    /// Catégorie de l'action pour le dashboard
    pub fn category(&self) -> &'static str {
        match self {
            RepairAction::EnableSafeMode | RepairAction::DisableSafeMode => "safety",
            RepairAction::RestartOmega | RepairAction::RestartEngine(_) => "restart",
            RepairAction::IsolateEngine(_) | RepairAction::RestoreEngine(_) => "isolation",
            RepairAction::EnableCircuitBreaker | RepairAction::DisableCircuitBreaker => "circuit",
            RepairAction::ClearMemoryCache | RepairAction::TrimMemory | RepairAction::ForceGC => "memory",
            RepairAction::RebalanceEngines | RepairAction::ReduceParallelism => "performance",
            RepairAction::ReduceTokenLimit(_) | RepairAction::RestoreTokenLimit => "limits",
            RepairAction::PurgeFailedProviders => "providers",
            _ => "general",
        }
    }

    /// Indique si l'action nécessite une confirmation utilisateur
    pub fn requires_confirmation(&self) -> bool {
        matches!(
            self,
            RepairAction::EnableSafeMode
                | RepairAction::RestartOmega
                | RepairAction::IsolateEngine(_)
                | RepairAction::ResetConversationContext
        )
    }
}

/// Résultat d'une action de réparation
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RepairResult {
    pub action: RepairAction,
    pub success: bool,
    pub duration_ms: u64,
    pub message: Option<String>,
}

impl RepairResult {
    pub fn success(action: RepairAction, duration_ms: u64) -> Self {
        Self {
            action,
            success: true,
            duration_ms,
            message: None,
        }
    }

    pub fn failure(action: RepairAction, duration_ms: u64, message: String) -> Self {
        Self {
            action,
            success: false,
            duration_ms,
            message: Some(message),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_priority_ordering() {
        assert!(RepairAction::RestartOmega.priority() > RepairAction::EnableDetailedLogging.priority());
    }

    #[test]
    fn test_risk_levels() {
        assert!(RepairAction::RestartOmega.risk_level() > RepairAction::ForceGC.risk_level());
    }
}
