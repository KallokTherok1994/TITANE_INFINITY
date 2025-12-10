// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20Ω — KERNEL INTEGRATIONS MODULE
//   Super Prompt #11 Phase 9 — Integration Bridges
// ═══════════════════════════════════════════════════════════════

pub mod memory_bridge;
pub mod omega_bridge;

pub use memory_bridge::{
    MemoryHealthSnapshot, MemoryKernelBridge, MemoryOperation, MemoryResult, MemoryStats,
};
pub use omega_bridge::{OmegaKernelBridge, OmegaRequest, OmegaResponse, OmegaStats};
