#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   TITANE∞ CYCLE & CONTINUITY ENGINE v2 — SUPER PROMPT #16
//   Rythmes, Saisons, Temporalité, Évolution Cognitive
//   
//   Donne à TITANE∞ une dimension temporelle vivante :
//   - Cycles cognitifs (journalier, hebdo, mensuel, saisonnier)
//   - Rythmes adaptatifs
//   - Régulation de charge
//   - Prédictions temporelles
//   - Alignement système
// ═══════════════════════════════════════════════════════════════

// Core modules
pub mod clock;
pub mod cycles;
pub mod seasons;
pub mod cognitive_rhythm;
pub mod load_regulator;
pub mod continuity;
pub mod predictive;
pub mod alignment;
pub mod diagnostics;
pub mod config;
pub mod engine;

// Integrations
pub mod kernel_integration;
pub mod omega_integration;
pub mod memory_integration;

// pub mod commands; // TODO: Fix type issues

// Re-exports — Components
pub use clock::*;
pub use cycles::*;
pub use seasons::*;
pub use cognitive_rhythm::*;
pub use load_regulator::*;
pub use continuity::*;
pub use predictive::*;
pub use alignment::*;
pub use config::*;

// Re-exports — Main Engine
pub use engine::CycleEngine;

// Re-exports — Integrations
pub use kernel_integration::{KernelCycleBridge, ResourceLimits, SchedulerAdjustments};
pub use memory_integration::{MemoryAdjustments, MemoryCycleBridge};
pub use omega_integration::{OmegaAdjustments, OmegaCycleBridge, RouterAdjustments};

// pub use commands::*;
