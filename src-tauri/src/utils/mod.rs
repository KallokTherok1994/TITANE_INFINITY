// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — UTILS MODULE
//   Centralized utilities: errors, logging, constants
// ═══════════════════════════════════════════════════════════════

pub mod error;
pub mod logging;
pub mod result;
pub mod constants;

pub use error::{AppError, AppResult};
pub use logging::{log_info, log_warn};
pub use constants::*;
