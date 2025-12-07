// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.0 — CORE MODULES
//   Module exports (Phase 2 - Fusion #1)
// ═══════════════════════════════════════════════════════════════

pub mod coherence; // v20.0 - Unified Coherence Engine (Nexus + Consistency fusion)
pub mod harmonia;
pub mod memory;
pub mod sentinel;

pub use coherence::CoherenceEngine;
pub use harmonia::HarmoniaModule;
pub use memory::MemoryModule;
pub use sentinel::SentinelModule;

// Deprecated (v19.5.2) - Migrated to CoherenceEngine
// pub mod nexus;
// pub use nexus::NexusModule;
