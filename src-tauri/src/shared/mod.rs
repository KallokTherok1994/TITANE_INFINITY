// TITANE∞ v8.0 - Shared Module
// Exports shared utilities, types, and macros

pub mod macros;
pub mod types;
pub mod utils;

// Re-exports pour API publique du moteur TITANE
#[allow(unused_imports)]
pub use types::*;
#[allow(unused_imports)]
pub use utils::*;
