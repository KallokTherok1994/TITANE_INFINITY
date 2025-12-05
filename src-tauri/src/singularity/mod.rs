/**
 * TITANE∞ v20 - Singularity Engine v∞
 * Architecture finale: 20 moteurs → 1 état global cohérent
 */
// Modules existants v17
pub mod coherence;
pub mod core;
pub mod emergent;
pub mod fusion;
pub mod security;
pub mod singularity_state;
pub mod totality;

// Modules v∞ (v20)
pub mod singularity_commands;
pub mod singularity_selftest;
pub mod singularity_state_vinfinity;

// Module v∞.19.3Ω (Phase 8 - IA Context)
pub mod ia_context;

// Exports v17
pub use self::core::*;
pub use coherence::*;
pub use emergent::*;
pub use fusion::*;
pub use security::*;
pub use singularity_state::*;
pub use totality::*;

// Exports v∞
pub use singularity_commands::*;
pub use ia_context::*;
pub use singularity_selftest::*;
pub use singularity_state_vinfinity::*;
