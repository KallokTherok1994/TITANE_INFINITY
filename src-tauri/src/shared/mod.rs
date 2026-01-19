// TITANE∞ v24.3.0 - Shared Module
// Exports shared utilities and macros
// Note: types migrated to crate::types::shared (v17.3.0)
// Note: titane_core removed v24.3.0 (legacy unused)

pub mod macros;
pub mod utils;

// Re-exports pour API publique du moteur TITANE
#[allow(unused_imports)]
pub use utils::*;
