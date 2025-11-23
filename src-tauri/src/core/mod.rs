// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — CORE MODULE
//   Business logic for all core modules
// ═══════════════════════════════════════════════════════════════

pub mod helios;
pub mod helios_module;  // NEW: CoreModule wrapper
pub mod nexus;
pub mod harmonia;
pub mod sentinel;
pub mod memory;

#[cfg(test)]
mod tests_integration;  // NEW: Integration tests

pub use helios::HeliosCore;
pub use helios_module::HeliosCoreModule;  // NEW: Export wrapper
pub use nexus::NexusCore;
pub use harmonia::HarmoniaCore;
pub use sentinel::SentinelCore;
pub use memory::MemoryCore;
