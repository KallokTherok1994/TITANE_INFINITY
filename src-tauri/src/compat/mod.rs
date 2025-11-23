// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v14 — COMPATIBILITY MODULE
//   Stubs for removed legacy systems
// ═══════════════════════════════════════════════════════════════

pub mod meta_mode_engine;
pub mod auto_evolution_v15;
pub mod exp_fusion_v15;
pub mod plugin_system;

// Re-export for convenience
pub use meta_mode_engine::*;
pub use auto_evolution_v15::*;
pub use exp_fusion_v15::*;
pub use plugin_system::*;
