//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — TEMPORAL ENGINE INTEGRATIONS
//! Super Prompt #18 — Intégrations avec Kernel, OMEGA, Memory, AGI
//! ═══════════════════════════════════════════════════════════════════════════════

pub mod agi_integration;
pub mod conversation_integration;
pub mod kernel_integration;
pub mod memory_integration;
pub mod omega_integration;

#[cfg(test)]
mod tests;

pub use agi_integration::{
    AgiTemporalAdjustments, AlignmentRecommendation, HeuristicTuningStrategy, TemporalAgiBridge,
};
pub use conversation_integration::{
    ConversationTemporalAdjustments, ConversationTone, TemporalConversationBridge,
    TemporalNarrative,
};
pub use kernel_integration::{
    MaintenanceAdvice, ResourceLimits, SchedulerAdjustments, TemporalKernelBridge,
};
pub use memory_integration::{
    ConsolidationRecommendation, MemoryTemporalAdjustments, PreloadingStrategy,
    TemporalMemoryBridge,
};
pub use omega_integration::{OmegaTemporalAdjustments, RoutingStrategy, TemporalOmegaBridge};

use serde::{Deserialize, Serialize};

/// Configuration d'intégration système
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct IntegrationConfig {
    pub kernel_sync_enabled: bool,
    pub omega_adaptation_enabled: bool,
    pub memory_consolidation_enabled: bool,
    pub agi_meta_learning_enabled: bool,
    pub conversation_context_enabled: bool,
}

impl Default for IntegrationConfig {
    fn default() -> Self {
        Self {
            kernel_sync_enabled: true,
            omega_adaptation_enabled: true,
            memory_consolidation_enabled: true,
            agi_meta_learning_enabled: true,
            conversation_context_enabled: true,
        }
    }
}
