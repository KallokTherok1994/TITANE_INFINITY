//! ═══════════════════════════════════════════════════════════════════════════
//! TITANE∞ SINGULARITY-FUSION vΩ - Backend Module
//! ═══════════════════════════════════════════════════════════════════════════
//!
//! @description Module central pour SINGULARITY-FUSION vΩ
//!
//! @modules
//! - fusion_engine: Moteur de fusion central
//! - unified_pipeline: Pipeline unifié IA→TTS→Avatar
//! - auto_fix: Correction automatique
//! - auto_heal: Réparation modules
//! - performance: Optimisation CPU/GPU/Mémoire
//! - crash_guard: Protection crashes + recovery
//!
//! @version Ω (Omega - Final Fusion)
//! @created 2025-11-27

pub mod auto_fix;
pub mod auto_heal;
pub mod crash_guard;
pub mod fusion_engine;
pub mod performance;
pub mod unified_pipeline;

// Réexporter les types publics
#[allow(unused_imports)]
pub use auto_fix::*;
#[allow(unused_imports)]
pub use auto_heal::*;
#[allow(unused_imports)]
pub use crash_guard::*;
#[allow(unused_imports)]
pub use fusion_engine::*;
#[allow(unused_imports)]
pub use performance::*;
#[allow(unused_imports)]
pub use unified_pipeline::*;
