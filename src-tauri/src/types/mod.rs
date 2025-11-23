// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.3.0 — TYPES MODULE
//   All business types centralized
// ═══════════════════════════════════════════════════════════════

pub mod helios;
pub mod nexus;
pub mod harmonia;
pub mod sentinel;
pub mod memory;
pub mod evolution;
pub mod shared;  // ✨ NEW: Types partagés unifiés

// Re-exports for convenience
pub use helios::{HeliosState, LoadAverage};
pub use nexus::{NexusState, ModuleStatus};
pub use harmonia::{HarmoniaState, StabilizationLevel};
pub use sentinel::{SentinelState, Alert, Severity, AlertCategory};
pub use memory::{MemoryState, Snapshot, LogEntry, TimelineEvent};
pub use evolution::{
    EvolutionReport, EvolutionState, Issue, IssueSeverity, IssueCategory,
    Recommendation, RepairAction, RepairResult, EvolutionHistory
};

// Re-export shared types (unified HealthStatus, ModuleHealthInfo, etc.)
pub use shared::{HealthStatus, ModuleHealthInfo, SystemMetrics, LogLevel, CognitiveNode};
