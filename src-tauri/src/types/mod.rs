// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — TYPES MODULE
//   All business types centralized
// ═══════════════════════════════════════════════════════════════

pub mod helios;
pub mod nexus;
pub mod harmonia;
pub mod sentinel;
pub mod memory;
pub mod evolution;

// Re-exports for convenience
pub use helios::{HeliosState, HealthStatus, LoadAverage};
pub use nexus::{NexusState, ModuleStatus, ModuleHealth};
pub use harmonia::{HarmoniaState, StabilizationLevel};
pub use sentinel::{SentinelState, Alert, Severity, AlertCategory};
pub use memory::{MemoryState, Snapshot, LogEntry, TimelineEvent};
pub use evolution::{
    EvolutionReport, EvolutionState, Issue, IssueSeverity, IssueCategory,
    Recommendation, RepairAction, RepairResult, EvolutionHistory
};
