// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v∞ - Multi-IA Orchestrator Commands (SUPER PROMPT #8)              ║
// ║ Re-export API commands for handlers.rs integration                          ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

// Re-export all Multi-IA API commands
pub use crate::ai::api::{
    multi_ai_best_provider, multi_ai_configure_keys, multi_ai_evaluate, multi_ai_generate,
    multi_ai_generate_dual, multi_ai_generate_fused, multi_ai_providers, multi_ai_set_fallback,
};
