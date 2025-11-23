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

// Re-export main types
pub use types::*;
pub use state::*;
pub use engine::*;
pub use modules::*;
pub use utils::*;

// Re-export legacy adapters for backward compatibility
pub use legacy::{HeliosCore, MemoryCore, NexusCore, HarmoniaCore, SentinelCore};
