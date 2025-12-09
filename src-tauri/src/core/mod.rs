// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v14 — CORE MODULE
//   Unified core system for SingularityEngine
// ═══════════════════════════════════════════════════════════════

pub mod boot_orchestrator; // v∞ Boot Orchestrator (Super Prompt #4)
pub mod engine;
pub mod legacy; // Legacy compatibility adapters
pub mod modules;
pub mod state;
pub mod tapi_error;
pub mod types;
pub mod utils; // Unified utilities (timestamps, helpers) // Standard error type for all APIs

// Phase 1.5: Tests unitaires core engine
#[cfg(test)]
mod tests_engine;

// Re-export main types
pub use boot_orchestrator::*;
pub use engine::*;
pub use modules::*;
pub use state::*;
pub use tapi_error::{TAPIError, TAPIErrorKind};
pub use types::*;
pub use utils::*;

// Re-export legacy adapters for backward compatibility
pub use legacy::{HarmoniaCore, HeliosCore, MemoryCore, NexusCore, SentinelCore};
