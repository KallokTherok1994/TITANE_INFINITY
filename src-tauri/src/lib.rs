//! ═══════════════════════════════════════════════════════════════
//!   TITANE∞ v24 — LIB CONFIGURATION
//!   Global compiler settings for all modules
//! ═══════════════════════════════════════════════════════════════

// Allow dead_code for architectural modules not yet integrated in scheduler
#![allow(dead_code)]
#![allow(unused_imports)]

// Global modules export
pub mod api;
pub mod commands;
pub mod cognitive;
pub mod core;
pub mod devtools;
pub mod engine;
pub mod plugin_system;
pub mod security;  // ✅ NEW: Security framework
pub mod services;
pub mod shared;
pub mod system;
pub mod types;
pub mod utils;

// Re-export common types
pub use shared::types::*;
pub use utils::{AppResult, AppError};
