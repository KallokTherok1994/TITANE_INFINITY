//! ═══════════════════════════════════════════════════════════════
//!   TITANE∞ v14 — LIB CONFIGURATION (MOCK BACKEND MODE)
//!   Frontend-only development with mocked backend commands
//! ═══════════════════════════════════════════════════════════════

// Allow dead_code for architectural modules not yet integrated
#![allow(dead_code)]
#![allow(unused_imports)]
#![allow(unused_variables)]

// ═══════════════════════════════════════════════════════════════
// MOCK BACKEND MODE - Frontend Development
// ═══════════════════════════════════════════════════════════════

// Core modules (minimal for mock backend)
pub mod mock_commands;  // ✅ Mock commands for frontend development
pub mod secure_commands; // ✅ v∞ Secure commands with permissions
pub mod time_commands;  // ✅ v∞ Time-Travel commands for TimeNavigator
pub mod utils;          // ✅ Utilities (AppResult, AppError)
pub mod types;          // ✅ Type definitions
pub mod shared;         // ✅ Shared types and utilities
pub mod core;           // ✅ Core system (legacy adapters)
pub mod system_state;   // ✅ v∞.A MinimalState structure
pub mod memory_persistence; // ✅ v∞.C Memory persistence + classification
pub mod ai;             // ✅ v∞.C AI module with analyze_file
pub mod security;       // ✅ v∞ Super-Prompts H, J, K, L
pub mod time;           // ✅ v∞ Super-Prompt N (Time-Travel + Backups)
pub mod updates;        // ✅ v∞ Super-Prompt L (Update Engine)

// Commented out complex modules - to be fixed progressively
// pub mod api;           // ❌ Type mismatches (HeliosCore methods)
// pub mod commands;      // ❌ Depends on complex engines
// pub mod cognitive;     // ❌ KevinState fields missing
// pub mod compat;        // ❌ Plugin system deprecated
// pub mod devtools;      // ❌ Collectors not implemented
// pub mod engine;        // ❌ ExpFusion, MetaMode, Evolution stubs needed
// pub mod services;      // ⏳ Should be OK
// pub mod singularity_state; // ❌ Old system
// pub mod system;        // ❌ Persona engine complex

// Re-export common types
pub use utils::{AppResult, AppError};
