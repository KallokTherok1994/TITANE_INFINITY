// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v24.2 — UNIFIED MEMORY API v2
//   Phase 2 Simplification: Consolidation de 5 modules → 2 modules
//   Architecture: Unified API + Neural Implementation
// ═══════════════════════════════════════════════════════════════

//! # Unified Memory v2
//!
//! **Objectif:** API unique pour tous les besoins mémoire de TITANE∞
//!
//! **Fusion de modules legacy:**
//! - `memory/` → Encryption, Storage, Telemetry
//! - `memory_os/` → STM/MTM/LTM hierarchy, Vector Store
//! - `memory_evolution/` → Evolution, Clustering, Compression
//! - `memory_persistence.rs` → Persistence
//! - `memory_compactor.rs` → Compaction
//!
//! **Nouvelle architecture:**
//! ```text
//! unified_memory_v2/       ← API publique unifiée
//! │  ├── api.rs            ← Interface publique simple
//! │  ├── types.rs          ← Types communs (MemoryEntry, MemoryTier, etc.)
//! │  ├── config.rs         ← Configuration globale
//! │  ├── encryption.rs     ← AES-256-GCM encryption (from memory/)
//! │  ├── persistence.rs    ← Disk I/O (from memory_persistence.rs)
//! │  └── bridge.rs         ← Bridge vers neural_memory/
//! 
//! neural_memory/           ← Implémentation neuronale (privée)
//! │  ├── stm.rs            ← Short-Term Memory (20 items)
//! │  ├── mtm.rs            ← Mid-Term Memory (200 items)
//! │  ├── ltm.rs            ← Long-Term Memory (∞)
//! │  ├── vector.rs         ← Vector Store + Embeddings
//! │  ├── evolution.rs      ← Auto-Evolution Engine
//! │  ├── consolidation.rs  ← STM→MTM→LTM promotion
//! │  ├── forgetting.rs     ← Decay engine (Ebbinghaus)
//! │  └── compaction.rs     ← Memory compaction
//! ```

pub mod api;
pub mod bridge;
pub mod compat; // Phase 2.3: Compatibility layer
pub mod config;
pub mod encryption;
pub mod persistence;
pub mod types;

#[cfg(test)]
mod tests_simple; // Phase 2.4: Integration tests (simplified)

// Re-exports pour interface publique
pub use api::{UnifiedMemoryV2, MemoryAPI};
pub use compat::{MemoryBridge, MemoryVectorSearchResult}; // Compatibility exports
pub use config::{MemoryConfig, PerformanceTargets, CapacityLimits};
pub use types::{
    MemoryEntry, MemoryTier, MemoryType, MemoryId,
    MemorySnapshot, MemoryStats, MemoryError, MemoryResult
};

// Version info
pub const VERSION: &str = "v24.2.0";
pub const MODULE_NAME: &str = "Unified Memory v2";

/// Performance targets (in milliseconds)
pub mod targets {
    pub const STORE_MS: u128 = 5;
    pub const RECALL_MS: u128 = 20;
    pub const SEARCH_MS: u128 = 15;
    pub const CONSOLIDATION_MS: u128 = 50;
    pub const MAX_RAM_MB: usize = 300;
}

/// Capacity limits
pub mod limits {
    pub const STM_MAX: usize = 20;
    pub const MTM_MAX: usize = 200;
    pub const LTM_BATCH: usize = 100;
    pub const EMBEDDING_DIM: usize = 384;
}
