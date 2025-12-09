//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — TEMPORAL ENGINE INTEGRATIONS
//! Super Prompt #18 — Intégrations avec Kernel, OMEGA, Memory, AGI
//! ═══════════════════════════════════════════════════════════════════════════════

pub mod kernel_integration;
pub mod omega_integration;
pub mod memory_integration;
pub mod agi_integration;
pub mod conversation_integration;

#[cfg(test)]
mod tests;

pub use kernel_integration::{TemporalKernelBridge, SchedulerAdjustments, ResourceLimits, MaintenanceAdvice};
pub use omega_integration::{TemporalOmegaBridge, OmegaTemporalAdjustments, RoutingStrategy};
pub use memory_integration::{TemporalMemoryBridge, MemoryTemporalAdjustments, PreloadingStrategy, ConsolidationRecommendation};
pub use agi_integration::{TemporalAgiBridge, AgiTemporalAdjustments, HeuristicTuningStrategy, AlignmentRecommendation};
pub use conversation_integration::{TemporalConversationBridge, ConversationTemporalAdjustments, ConversationTone, TemporalNarrative};

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
