// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v14 — API MODULE
//   Tauri Commands Centralization
// ═══════════════════════════════════════════════════════════════

pub mod engine_api;
pub mod handlers_v14; // ✅ Phase 7: Unified v14 handlers
pub mod helios_api;
pub mod memory_api;
pub mod system_api;

// Re-export for builder
pub use engine_api::*;
pub use handlers_v14::*; // ✅ Phase 7: Export unified handlers
pub use helios_api::*;
pub use memory_api::*;
pub use system_api::*;
