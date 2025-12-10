// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v24.2 — NEURAL MEMORY (Private Implementation)
//   Phase 2 Simplification: Implémentation neuronale STM→MTM→LTM
//   Architecture: Hiérarchique, Vectorisée, Auto-Évolutive
// ═══════════════════════════════════════════════════════════════

//! # Neural Memory (Private Implementation)
//!
//! **Objectif:** Implémentation neuronale privée du système mémoire
//!
//! **Architecture:**
//! - **STM** (Short-Term Memory): FIFO queue, 20 items, <1min lifespan
//! - **MTM** (Mid-Term Memory): Priority queue, 200 items, hours-days lifespan
//! - **LTM** (Long-Term Memory): Persistent index, unlimited, permanent
//! - **Vector Store**: Embedding-based semantic search
//! - **Consolidation**: Auto-promotion STM→MTM→LTM
//! - **Forgetting**: Decay engine (Ebbinghaus curve)
//! - **Evolution**: Clustering, compression, pattern extraction
//! - **Compaction**: Memory optimization
//!
//! **Performance Targets:**
//! - Store: <5ms
//! - Recall: <20ms
//! - Search: <15ms
//! - RAM: <300MB
//!
//! **Privacy:** 
//! Ce module est PRIVÉ et n'est pas exporté publiquement.
//! L'accès se fait uniquement via `unified_memory_v2::api`.

pub mod compaction;
pub mod consolidation;
pub mod evolution;
pub mod forgetting;
pub mod ltm;
pub mod mtm;
pub mod stm;
pub mod vector;

#[cfg(test)]
mod tests; // Phase 2.4: Unit tests

pub use consolidation::Consolidator;
pub use ltm::LongTermMemory;
pub use mtm::MidTermMemory;
pub use stm::ShortTermMemory;
pub use vector::{VectorStore, VectorSearchResult}; // Export VectorSearchResult for compat layer
