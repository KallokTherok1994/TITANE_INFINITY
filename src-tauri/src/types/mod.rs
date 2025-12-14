// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v14 — TYPES MODULE
//   All business types centralized
// ═══════════════════════════════════════════════════════════════

pub mod evolution;
pub mod harmonia;
pub mod helios;
pub mod memory;
pub mod memory_chat; // ✨ NEW: Types Chat IA ↔ Memory Core
pub mod nexus;
pub mod sentinel;
pub mod shared; // ✨ NEW: Types partagés unifiés

// Re-exports for convenience
#[allow(unused_imports)]
pub use evolution::{
    EvolutionHistory, EvolutionReport, EvolutionState, Issue, IssueCategory, IssueSeverity,
    Recommendation, RepairAction, RepairResult,
};
#[allow(unused_imports)]
pub use harmonia::{HarmoniaState, StabilizationLevel};
pub use helios::HeliosState;
pub use memory::{
    DiskMode, LogEntry, MemoryDirectoryReport, MemoryFileReport, MemoryState, Snapshot,
    TimelineEvent,
};
#[allow(unused_imports)]
pub use memory_chat::{
    ChatInteraction, DecisionSummary, EmotionState, ImpactLevel, KnowledgeEntry, ProjectStatus,
    ProjectSummary, RitualInfo, TimelineEntry, TimelineEntryType,
};
#[allow(unused_imports)]
pub use nexus::{ModuleStatus, NexusState};
#[allow(unused_imports)]
pub use sentinel::{Alert, AlertCategory, SentinelState, Severity};

// Re-export shared types (unified HealthStatus, ModuleHealthInfo, etc.)
#[allow(unused_imports)]
pub use shared::{CognitiveNode, HealthStatus, LogLevel, ModuleHealthInfo, SystemMetrics};

// Re-export AppError for backward compatibility
#[allow(unused_imports)]
pub use crate::utils::AppError;

// Re-export AppError for backward compatibility
// pub use crate::utils::AppError;

// Type alias for ModuleHealth (deprecated, use ModuleHealthInfo)
pub type ModuleHealth = ModuleHealthInfo;
