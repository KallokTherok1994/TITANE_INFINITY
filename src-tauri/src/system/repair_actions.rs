//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — REPAIR ACTIONS
//! Actions de réparation automatique
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

/// Actions de réparation disponibles
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
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
}

impl RepairAction {
    /// Priorité de l'action (plus élevé = plus urgent)
    pub fn priority(&self) -> u8 {
        match self {
            RepairAction::RestartOmega => 10,
            RepairAction::ClearMemoryCache => 8,
            RepairAction::TrimMemory => 7,
            RepairAction::RebalanceEngines => 6,
            RepairAction::ForceGC => 5,
            RepairAction::RebuildIndexes => 4,
            RepairAction::ResetConversationContext => 3,
            RepairAction::ReduceParallelism => 3,
            RepairAction::EnableDegradedMode => 2,
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
        }
    }

    /// Risque de l'action (0 = sûr, 10 = risqué)
    pub fn risk_level(&self) -> u8 {
        match self {
            RepairAction::EnableDetailedLogging => 0,
            RepairAction::ForceGC => 1,
            RepairAction::TrimMemory => 2,
            RepairAction::ClearMemoryCache => 3,
            RepairAction::ReduceParallelism => 2,
            RepairAction::RebalanceEngines => 4,
            RepairAction::RebuildIndexes => 5,
            RepairAction::ResetConversationContext => 6,
            RepairAction::EnableDegradedMode => 4,
            RepairAction::RestartOmega => 8,
        }
    }

    /// Temps estimé d'exécution en ms
    pub fn estimated_duration_ms(&self) -> u64 {
        match self {
            RepairAction::EnableDetailedLogging => 10,
            RepairAction::ForceGC => 50,
            RepairAction::ClearMemoryCache => 100,
            RepairAction::TrimMemory => 200,
            RepairAction::ReduceParallelism => 50,
            RepairAction::RebalanceEngines => 300,
            RepairAction::ResetConversationContext => 100,
            RepairAction::EnableDegradedMode => 50,
            RepairAction::RebuildIndexes => 1000,
            RepairAction::RestartOmega => 500,
        }
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
