// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1 — MEMORY OS vΩ (Neural Memory System)
//   Super Prompt #12 + #6-7-8: Hierarchical, Vectorized, Auto-Evolutionary
//   Architecture: STM → MTM → LTM with Neural Consolidation + Vector Search
// ═══════════════════════════════════════════════════════════════

//! # Memory OS vΩ
//!
//! A comprehensive neural memory system for TITANE∞ with:
//! - **Hierarchical Storage**: STM (20) → MTM (200) → LTM (∞)
//! - **Vectorized Search**: Embedding-based semantic recall
//! - **Auto-Consolidation**: Intelligent memory promotion
//! - **Forgetting Engine**: Decay-based memory management
//! - **Performance Targets**: <20ms recall, <5ms store, <300MB RAM
//!
//! NEW (SUPER PROMPTs #6-7-8):
//! - **Vector Index**: HNSW-based semantic search
//! - **Embeddings Engine**: OpenAI/Gemini/Local support
//! - **Clustering**: K-means clustering for memory organization
//! - **Memory OS Bridge**: Integration with UnifiedMemory

pub mod api;
pub mod consolidator;
pub mod forgetting;
pub mod indexer;
pub mod ltm;
pub mod memory_os;
pub mod memory_signals;
pub mod memory_state;
pub mod mtm;
pub mod multimodal_memory;
pub mod stm;
pub mod vector_store; // SUPER PROMPT #15 - Phase 6

// NEW: SUPER PROMPTS #6-7-8 modules
pub mod clustering;
pub mod commands;
pub mod config;
pub mod embeddings;
pub mod memory_os_bridge;
pub mod semantic_search;
pub mod similarity;
pub mod types; // Shared types (must be first)
pub mod vector_hnsw;
pub mod vector_index; // Tauri commands

// Re-export public types (selective)
pub use clustering::{InitMethod, KMeansClustering, KMeansConfig};
pub use config::MemoryOSConfigV2;
pub use embeddings::{EmbeddingConfig, EmbeddingEngine, EmbeddingSource};
pub use memory_os_bridge::{MemoryOSBridge, MemoryOSBridgeConfig, MemoryOSBridgeStats};
pub use multimodal_memory::{
    MultimodalContent, MultimodalMemoryEntry, MultimodalMemoryStats, MultimodalMemoryStore,
};
pub use semantic_search::SemanticSearchEngine;
pub use types::*;
pub use vector_index::{SearchResult, VectorIndex, VectorIndexConfig};

// Re-exports for convenient access (original)
pub use consolidator::Consolidator;
pub use forgetting::ForgettingEngine;
pub use ltm::LongTermMemory;
pub use memory_os::MemoryOS;
pub use memory_signals::MemorySignal;
pub use memory_state::{MemoryEntry, MemorySnapshot, MemoryTier, MemoryType};
pub use mtm::MidTermMemory;
pub use stm::ShortTermMemory;
pub use vector_store::VectorStore;

// NEW: Re-exports for SUPER PROMPTs #6-7-8
pub use config::*;
pub use semantic_search::*;
pub use similarity::*;
pub use vector_hnsw::*;
pub use vector_index::*;

// Version info
pub const MEMORY_OS_VERSION: &str = "v20.1-Ω";
pub const MEMORY_OS_NAME: &str = "TITANE Memory OS vΩ";

/// Performance targets (in milliseconds)
pub mod targets {
    pub const STM_PUSH_MS: u128 = 1;
    pub const MTM_CONSOLIDATION_MS: u128 = 3;
    pub const LTM_SEARCH_MS: u128 = 15;
    pub const VECTOR_QUERY_MS: u128 = 10;
    pub const MEMORY_RECALL_MS: u128 = 20;
    pub const MEMORY_STORE_MS: u128 = 5;
    pub const MAX_RAM_MB: usize = 300;
}

/// Capacity limits
pub mod limits {
    pub const STM_MAX_ITEMS: usize = 20;
    pub const MTM_MAX_ITEMS: usize = 200;
    pub const LTM_BATCH_SIZE: usize = 100;
    pub const EMBEDDING_DIM: usize = 384;
    pub const INDEX_REBUILD_THRESHOLD: usize = 1000;
}
