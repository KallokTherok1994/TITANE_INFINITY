// ═══════════════════════════════════════════════════════════════
//   UNIFIED MEMORY V2 — TYPES
//   Consolidation de types de memory/, memory_os/, memory_evolution/
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Unique identifier for memory entries
pub type MemoryId = String;

/// Memory tier (hierarchy level)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum MemoryTier {
    /// Short-Term Memory (session, ~20 items, <1min lifespan)
    STM,
    /// Mid-Term Memory (hours-days, ~200 items, adaptive decay)
    MTM,
    /// Long-Term Memory (permanent, unlimited, indexed)
    LTM,
}

impl MemoryTier {
    /// Get next tier in hierarchy (for promotion)
    pub fn next(self) -> Option<Self> {
        match self {
            MemoryTier::STM => Some(MemoryTier::MTM),
            MemoryTier::MTM => Some(MemoryTier::LTM),
            MemoryTier::LTM => None,
        }
    }

    /// Get tier name
    pub fn name(&self) -> &'static str {
        match self {
            MemoryTier::STM => "STM",
            MemoryTier::MTM => "MTM",
            MemoryTier::LTM => "LTM",
        }
    }
}

/// Memory type (semantic classification)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum MemoryType {
    /// Conversational context
    Conversation,
    /// Factual knowledge
    Factual,
    /// Procedural knowledge (how-to)
    Procedural,
    /// Semantic relationships
    Semantic,
    /// Episodic events (time-bound)
    Episodic,
    /// User decisions
    Decision,
    /// System observations
    Observation,
    /// Meta-cognition
    Meta,
    /// Extracted patterns
    Pattern,
}

impl MemoryType {
    /// Default importance score for this type
    pub fn default_importance(&self) -> f32 {
        match self {
            MemoryType::Decision => 0.9,
            MemoryType::Factual => 0.8,
            MemoryType::Procedural => 0.75,
            MemoryType::Meta => 0.7,
            MemoryType::Pattern => 0.65,
            MemoryType::Semantic => 0.6,
            MemoryType::Episodic => 0.5,
            MemoryType::Observation => 0.4,
            MemoryType::Conversation => 0.3,
        }
    }
}

/// Unified memory entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryEntry {
    /// Unique identifier (UUID v4)
    pub id: MemoryId,
    /// Current tier (STM/MTM/LTM)
    pub tier: MemoryTier,
    /// Memory type (semantic classification)
    pub memory_type: MemoryType,
    /// Content (text)
    pub content: String,
    /// Optional summary (for compressed entries)
    pub summary: Option<String>,
    /// Importance score [0.0-1.0]
    pub importance: f32,
    /// Confidence score [0.0-1.0]
    pub confidence: f32,
    /// Tags for categorization
    pub tags: Vec<String>,
    /// Creation timestamp (Unix millis)
    pub created_at: i64,
    /// Last update timestamp
    pub updated_at: i64,
    /// Last access timestamp
    pub last_accessed: Option<i64>,
    /// Access counter
    pub access_count: u64,
    /// Vector embedding ID (if vectorized)
    pub vector_id: Option<String>,
    /// Cluster assignment
    pub cluster_id: Option<String>,
    /// Compression flag
    pub compressed: bool,
    /// Custom metadata
    pub metadata: HashMap<String, serde_json::Value>,
}

impl MemoryEntry {
    /// Create new memory entry
    pub fn new(content: String, importance: f32, memory_type: MemoryType) -> Self {
        let now = chrono::Utc::now().timestamp_millis();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            tier: MemoryTier::STM, // Always start in STM
            memory_type,
            content,
            summary: None,
            importance: importance.clamp(0.0, 1.0),
            confidence: 1.0,
            tags: Vec::new(),
            created_at: now,
            updated_at: now,
            last_accessed: None,
            access_count: 0,
            vector_id: None,
            cluster_id: None,
            compressed: false,
            metadata: HashMap::new(),
        }
    }

    /// Update access tracking
    pub fn touch(&mut self) {
        self.access_count += 1;
        let now = chrono::Utc::now().timestamp_millis();
        self.last_accessed = Some(now);
        self.updated_at = now;
    }

    /// Calculate relevance score (for search ranking)
    pub fn relevance_score(&self) -> f32 {
        let recency_factor = self.recency_factor();
        let access_factor = (self.access_count as f32).ln().max(0.0) / 10.0;

        (self.importance * 0.5) + (recency_factor * 0.3) + (access_factor * 0.2)
    }

    /// Calculate recency factor [0.0-1.0]
    fn recency_factor(&self) -> f32 {
        let now = chrono::Utc::now().timestamp_millis();
        let age_ms = (now - self.created_at) as f32;
        let age_hours = age_ms / (1000.0 * 3600.0);

        // Exponential decay: 1.0 → 0.5 in 24h
        (-(age_hours / 24.0)).exp()
    }

    /// Estimate memory size in bytes
    pub fn size_bytes(&self) -> usize {
        std::mem::size_of::<Self>()
            + self.content.len()
            + self.summary.as_ref().map_or(0, |s| s.len())
            + self.tags.iter().map(|t| t.len()).sum::<usize>()
    }
}

/// Memory snapshot (system state)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemorySnapshot {
    pub timestamp: i64,
    pub stm_count: usize,
    pub mtm_count: usize,
    pub ltm_count: usize,
    pub total_count: usize,
    pub total_bytes: usize,
    pub vector_count: usize,
    pub cluster_count: usize,
}

/// Memory statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryStats {
    pub snapshot: MemorySnapshot,
    pub avg_recall_ms: f32,
    pub avg_store_ms: f32,
    pub cache_hit_rate: f32,
    pub consolidation_rate: f32,
    pub decay_rate: f32,
}

/// Memory errors
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MemoryError {
    NotFound(String),
    StorageError(String),
    EncryptionError(String),
    DecryptionError(String),
    ValidationError(String),
    CapacityExceeded(String),
    PermissionDenied(String),
    Timeout(String),
}

impl std::fmt::Display for MemoryError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            MemoryError::NotFound(e) => write!(f, "Memory not found: {}", e),
            MemoryError::StorageError(e) => write!(f, "Storage error: {}", e),
            MemoryError::EncryptionError(e) => write!(f, "Encryption error: {}", e),
            MemoryError::DecryptionError(e) => write!(f, "Decryption error: {}", e),
            MemoryError::ValidationError(e) => write!(f, "Validation error: {}", e),
            MemoryError::CapacityExceeded(e) => write!(f, "Capacity exceeded: {}", e),
            MemoryError::PermissionDenied(e) => write!(f, "Permission denied: {}", e),
            MemoryError::Timeout(e) => write!(f, "Timeout: {}", e),
        }
    }
}

impl std::error::Error for MemoryError {}

pub type MemoryResult<T> = Result<T, MemoryError>;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_memory_entry_creation() {
        let entry = MemoryEntry::new("Test memory".to_string(), 0.8, MemoryType::Conversation);

        assert_eq!(entry.tier, MemoryTier::STM);
        assert_eq!(entry.importance, 0.8);
        assert_eq!(entry.access_count, 0);
    }

    #[test]
    fn test_tier_promotion() {
        assert_eq!(MemoryTier::STM.next(), Some(MemoryTier::MTM));
        assert_eq!(MemoryTier::MTM.next(), Some(MemoryTier::LTM));
        assert_eq!(MemoryTier::LTM.next(), None);
    }

    #[test]
    fn test_memory_type_importance() {
        assert!(
            MemoryType::Decision.default_importance()
                > MemoryType::Conversation.default_importance()
        );
    }

    #[test]
    fn test_relevance_score() {
        let entry = MemoryEntry::new("Test".to_string(), 0.8, MemoryType::Decision);
        let score = entry.relevance_score();
        assert!(score > 0.0 && score <= 1.0);
    }
}
