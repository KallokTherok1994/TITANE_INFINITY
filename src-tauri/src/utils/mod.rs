// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — UTILS MODULE
//   Centralized utilities: errors, logging, constants
// ═══════════════════════════════════════════════════════════════

pub mod constants;
pub mod error;
pub mod logging;
pub mod result;

#[allow(unused_imports)]
pub use constants::*;
pub use error::{AppError, AppResult};
#[allow(unused_imports)]
pub use logging::{log_info, log_warn};
