// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v14 — TYPES MODULE
//   All business types centralized
// ═══════════════════════════════════════════════════════════════

pub mod helios;
pub mod nexus;
pub mod harmonia;
pub mod sentinel;
pub mod memory;
pub mod memory_chat;  // ✨ NEW: Types Chat IA ↔ Memory Core
pub mod evolution;
pub mod shared;  // ✨ NEW: Types partagés unifiés

// Re-exports for convenience
pub use helios::{HeliosState, LoadAverage};
pub use nexus::{NexusState, ModuleStatus};
pub use harmonia::{HarmoniaState, StabilizationLevel};
pub use sentinel::{SentinelState, Alert, Severity, AlertCategory};
pub use memory::{MemoryState, Snapshot, LogEntry, TimelineEvent};
pub use memory_chat::{
    ProjectSummary, ProjectStatus, DecisionSummary, ImpactLevel,
    KnowledgeEntry, RitualInfo, TimelineEntry, TimelineEntryType,
    ChatInteraction, EmotionState
};
pub use evolution::{
    EvolutionReport, EvolutionState, Issue, IssueSeverity, IssueCategory,
    Recommendation, RepairAction, RepairResult, EvolutionHistory
};

// Re-export shared types (unified HealthStatus, ModuleHealthInfo, etc.)
pub use shared::{HealthStatus, ModuleHealthInfo, SystemMetrics, LogLevel, CognitiveNode};

// Re-export AppError for backward compatibility
pub use crate::utils::AppError;

// Type alias for ModuleHealth (deprecated, use ModuleHealthInfo)
pub type ModuleHealth = ModuleHealthInfo;
