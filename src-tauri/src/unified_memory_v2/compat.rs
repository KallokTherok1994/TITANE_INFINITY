// ═══════════════════════════════════════════════════════════════
//   UNIFIED MEMORY V2 — COMPATIBILITY LAYER
//   Phase 2.3: Gradual migration support for legacy code
// ═══════════════════════════════════════════════════════════════

//! # Compatibility Layer
//!
//! This module provides compatibility types and re-exports to allow
//! gradual migration from legacy memory_os/ modules to unified_memory_v2.
//!
//! **Strategy:**
//! - Re-export key types from neural_memory for external use
//! - Provide type aliases for common patterns
//! - Allow legacy code to continue working during migration
//!
//! **Deprecation Timeline:**
//! - Phase 2.3 (Today): Compatibility layer active
//! - Phase 2.4 (Next): Deprecation warnings added
//! - Phase 3.0 (Future): Legacy modules removed, compatibility layer deprecated

use super::api::UnifiedMemoryV2;

// Re-export VectorSearchResult for external use
pub use crate::neural_memory::VectorSearchResult as MemoryVectorSearchResult;

/// Type alias: UnifiedMemoryV2 can be used as MemoryOSBridge replacement
/// 
/// **Migration Guide:**
/// ```rust
/// // OLD:
/// // use crate::memory_os::MemoryOSBridge;
/// // let bridge = MemoryOSBridge::new(config);
/// 
/// // NEW:
/// use crate::unified_memory_v2::{UnifiedMemoryV2, MemoryConfig};
/// let memory = UnifiedMemoryV2::new(MemoryConfig::default());
/// memory.init().await?;
/// ```
pub type MemoryBridge = UnifiedMemoryV2;

/// Compatibility: Result type
pub type MemoryResult<T> = super::types::MemoryResult<T>;

/// Compatibility: Error type
pub type MemoryError = super::types::MemoryError;
