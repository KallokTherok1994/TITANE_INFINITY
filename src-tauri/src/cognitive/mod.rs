// TITANE∞ v17 - Cognitive Module
// Advanced reasoning, meta-cognition, self-optimization
// Legacy v15 + New v16 engines coexist + v17 security hardening

// Legacy v15 (three centers philosophy)
pub mod body;
pub mod heart;
pub mod mental;
pub mod state;

// New v16 (cognitive engines)
pub mod analysis;
pub mod consistency;
pub mod evolution;
pub mod integration;

// Unified engine (v15 + v16 bridge)
pub mod engine;

// v17 Security hardening
pub mod commands;
pub mod security;
pub mod selftest;

// Re-exports v15
pub use body::*;
pub use heart::*;
pub use mental::*;
pub use state::*;

// Re-exports v16
pub use analysis::AnalysisEngine;
pub use consistency::ConsistencyEngine;
pub use engine::*;
pub use evolution::EvolutionCognitiveEngine;
pub use integration::IntegrationEngine;

// Re-exports v17 (commands for Tauri)
pub use commands::*;
