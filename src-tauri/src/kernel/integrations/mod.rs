// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20Ω — KERNEL INTEGRATIONS MODULE
//   Super Prompt #11 Phase 9 — Integration Bridges
// ═══════════════════════════════════════════════════════════════

pub mod omega_bridge;
pub mod memory_bridge;

pub use omega_bridge::{OmegaKernelBridge, OmegaRequest, OmegaResponse, OmegaStats};
pub use memory_bridge::{
    MemoryKernelBridge, MemoryOperation, MemoryResult, MemoryHealthSnapshot, MemoryStats,
};
