//! ═══════════════════════════════════════════════════════════════
//!   TITANE∞ v16 — LIB CONFIGURATION
//!   Unified backend architecture - v15 Core + v16 Cognitive
//! ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// CORE MODULES v16 (Always Active)
// ═══════════════════════════════════════════════════════════════

pub mod core;       // ✅ SingularityEngine v16 + modules
pub mod cognitive;  // ✅ Cognitive Layer v16 (NEW)
pub mod shared;     // ✅ Shared types and utilities
pub mod types;      // ✅ Type definitions
pub mod utils;      // ✅ Utilities (AppResult, AppError)

// ═══════════════════════════════════════════════════════════════
// AI & MEMORY v15
// ═══════════════════════════════════════════════════════════════

pub mod ai;                 // ✅ AI Router (v15 migration in progress)
pub mod memory;             // ✅ Memory Storage v15

// ═══════════════════════════════════════════════════════════════
// PRODUCTION MODULES (Active)
// ═══════════════════════════════════════════════════════════════

pub mod control_panel_commands;    // ✅ Control Panel
pub mod harmonia_engine;           // ✅ Harmonia CPU monitoring
pub mod memory_compactor;          // ✅ Memory compaction
pub mod memory_persistence;        // ✅ Memory persistence
pub mod secure_commands;           // ✅ Secure commands
pub mod security;                  // ✅ Security layer
pub mod system_state;              // ✅ System state
pub mod time;                      // ✅ Time-travel engine
pub mod time_commands;             // ✅ Time commands
pub mod updates;                   // ✅ Update engine

// ═══════════════════════════════════════════════════════════════
// PHASES 5-10 MODULES (Active)
// ═══════════════════════════════════════════════════════════════

pub mod cluster;               // ✅ Node-Cluster
pub mod creation;              // ✅ Mode Création
pub mod evolution;             // ✅ Auto-Évolution
pub mod hypervision;           // ✅ HyperVision
pub mod introspection;         // ✅ Introspection
pub mod knowledge;             // ✅ Knowledge Fusion

// ═══════════════════════════════════════════════════════════════
// PHASES V-Ω MODULES (Active)
// ═══════════════════════════════════════════════════════════════

pub mod cognitive_learning;    // ✅ Auto-Apprentissage
pub mod hyper_evolution;       // ✅ HyperEvolution
pub mod meta_creation;         // ✅ Méta-Création
pub mod neuro_symbolic;        // ✅ NeuroSymbolic
pub mod self_repair;           // ✅ Auto-Réparation
pub mod singularity;           // ✅ Singularity

// ═══════════════════════════════════════════════════════════════
// BACKEND MODE SELECTION (Mock vs Full)
// ═══════════════════════════════════════════════════════════════

#[cfg(feature = "mock")]
pub mod mock_commands;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod commands;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod api;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod compat;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod modules;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod audio;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod tts;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod engine;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod overdrive;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod cognitive;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod system;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod devtools;

#[cfg(all(not(feature = "mock"), feature = "full"))]
pub mod services;

// ═══════════════════════════════════════════════════════════════
// RE-EXPORTS v15
// ═══════════════════════════════════════════════════════════════

pub use core::{EngineHealth, EngineMetrics, SingularityEngine, SingularityState};
pub use utils::{AppError, AppResult};
