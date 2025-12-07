// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.0 — CORE MODULES
//   Module exports (Phase 2 - Fusions #1, #2, #3 COMPLETE)
// ═══════════════════════════════════════════════════════════════

pub mod coherence;      // v20.0 - Fusion #1: Nexus + Consistency
pub mod unified_memory; // v20.0 - Fusion #2: Memory #5 + MemoryModule + Singularity
pub mod system_health;  // v20.0 - Fusion #3: Helios + Sentinel + Self-Heal
pub mod harmonia;

pub use coherence::CoherenceEngine;
pub use unified_memory::UnifiedMemory;
pub use system_health::SystemHealth;
pub use harmonia::HarmoniaModule;

// Deprecated modules (v19.5.2) - Migrated to new fusions
// pub mod nexus;      → CoherenceEngine
// pub mod memory;     → UnifiedMemory
// pub mod sentinel;   → SystemHealth
