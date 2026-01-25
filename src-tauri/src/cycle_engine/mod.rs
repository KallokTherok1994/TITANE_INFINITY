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
pub mod alignment;
pub mod clock;
pub mod cognitive_rhythm;
pub mod config;
pub mod continuity;
pub mod cycles;
pub mod diagnostics;
pub mod engine;
pub mod load_regulator;
pub mod predictive;
pub mod seasons;

// Integrations
pub mod kernel_integration;
pub mod memory_integration;
pub mod omega_integration;

// INTEGRATION: Fix cycle_engine commands module type issues
// 1. Problem: Command enum conflicts with Tauri's Command trait or parameter type mismatches
// 2. Solution: Rename enum to CycleCommand or use fully qualified paths
// 3. Type alignment: Ensure all command handlers use Tauri 2.0 #[tauri::command] signature
// 4. Async bounds: Add Send + Sync bounds for async command return types
// 5. State access: Fix AppState type conflicts, use tauri::State<AppState> correctly
// 6. Testing: Re-enable after fixes, ensure commands compile and integrate with Tauri runtime
// pub mod commands; // FUTUR: Fix type issues

// Re-exports — Components
pub use alignment::*;
pub use clock::*;
pub use cognitive_rhythm::*;
pub use config::*;
pub use continuity::*;
pub use cycles::*;
pub use load_regulator::*;
pub use predictive::*;
pub use seasons::*;

// Re-exports — Main Engine
pub use engine::CycleEngine;

// Re-exports — Integrations
pub use kernel_integration::{KernelCycleBridge, ResourceLimits, SchedulerAdjustments};
pub use memory_integration::{MemoryAdjustments, MemoryCycleBridge};
pub use omega_integration::{OmegaAdjustments, OmegaCycleBridge, RouterAdjustments};

// pub use commands::*;
