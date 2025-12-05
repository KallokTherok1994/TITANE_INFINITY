// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v14 — COMPATIBILITY MODULE
//   Stubs for removed legacy systems + v12↔v14 bridge
// ═══════════════════════════════════════════════════════════════

pub mod auto_evolution_v15;
pub mod core_collection; // ✅ NEW: v12↔v14 bridge
pub mod exp_fusion_v15;
pub mod meta_mode_engine;
pub mod plugin_system;

// Re-export for convenience
pub use auto_evolution_v15::*;
pub use core_collection::CoreCollection;
pub use exp_fusion_v15::*;
pub use meta_mode_engine::*;
pub use plugin_system::*;
