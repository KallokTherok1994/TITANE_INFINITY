// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v14 — CORE MODULE
//   Unified core system for SingularityEngine
// ═══════════════════════════════════════════════════════════════

pub mod types;
pub mod state;
pub mod engine;
pub mod modules;
pub mod legacy;  // Legacy compatibility adapters
pub mod utils;   // Unified utilities (timestamps, helpers)
pub mod tapi_error; // Standard error type for all APIs

// Re-export main types
pub use types::*;
pub use state::*;
pub use engine::*;
pub use modules::*;
pub use utils::*;
pub use tapi_error::{TAPIError, TAPIErrorKind};

// Re-export legacy adapters for backward compatibility
pub use legacy::{HeliosCore, MemoryCore, NexusCore, HarmoniaCore, SentinelCore};
