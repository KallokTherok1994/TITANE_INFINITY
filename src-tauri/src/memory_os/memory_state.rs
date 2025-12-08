// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1 — MEMORY STATE (Data Models)
//   Super Prompt #12: Core memory structures and types
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

// ═══════════════════════════════════════════════════════════════
//   CORE STRUCTURES
// ═══════════════════════════════════════════════════════════════

/// Core memory entry structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryEntry {
    /// Unique identifier
    pub id: Uuid,
    /// Unix timestamp (milliseconds)
    pub timestamp: i64,
    /// Memory content
    pub content: String,
    /// Optional embedding vector (384-dim for sentence transformers)
    pub embedding: Option<Vec<f32>>,
    /// Importance score (0.0 - 1.0)
    pub importance: f32,
    /// Memory tier classification
    pub tier: MemoryTier,
    /// Memory type classification
    pub memory_type: MemoryType,
    /// Tags for categorization
    pub tags: Vec<String>,
    /// Access count for popularity tracking
    pub access_count: u32,
    /// Last access timestamp
    pub last_accessed: i64,
    /// Source identifier (conversation, system, etc.)
    pub source: Option<String>,
    /// Compression flag
    pub compressed: bool,
    /// Additional metadata
    pub metadata: HashMap<String, serde_json::Value>,
}

impl MemoryEntry {
    /// Create a new memory entry
    pub fn new(content: String, importance: f32, memory_type: MemoryType) -> Self {
        let now = chrono::Utc::now().timestamp_millis();
        Self {
            id: Uuid::new_v4(),
            timestamp: now,
            content,
            embedding: None,
            importance: importance.clamp(0.0, 1.0),
            tier: MemoryTier::STM,
            memory_type,
            tags: Vec::new(),
            access_count: 0,
            last_accessed: now,
            source: None,
            compressed: false,
            metadata: HashMap::new(),
        }
    }

    /// Create with tags
    pub fn with_tags(mut self, tags: Vec<String>) -> Self {
        self.tags = tags;
        self
    }

    /// Create with source
    pub fn with_source(mut self, source: String) -> Self {
        self.source = Some(source);
        self
    }

    /// Create with embedding
    pub fn with_embedding(mut self, embedding: Vec<f32>) -> Self {
        self.embedding = Some(embedding);
        self
    }

    /// Mark as accessed
    pub fn mark_accessed(&mut self) {
        self.access_count += 1;
        self.last_accessed = chrono::Utc::now().timestamp_millis();
    }

    /// Calculate age in milliseconds
    pub fn age_ms(&self) -> i64 {
        chrono::Utc::now().timestamp_millis() - self.timestamp
    }

    /// Calculate relevance score (combines importance, recency, and access)
    pub fn relevance_score(&self) -> f32 {
        let now = chrono::Utc::now().timestamp_millis();
        let age_hours = (now - self.timestamp) as f32 / 3_600_000.0;
        let recency_factor = 1.0 / (1.0 + age_hours * 0.1);
        let access_factor = (self.access_count as f32).ln_1p() * 0.1;

        (self.importance * 0.5 + recency_factor * 0.3 + access_factor * 0.2).clamp(0.0, 1.0)
    }

    /// Get content size in bytes
    pub fn size_bytes(&self) -> usize {
        let content_size = self.content.len();
        let embedding_size = self.embedding.as_ref().map(|e| e.len() * 4).unwrap_or(0);
        let tags_size: usize = self.tags.iter().map(|t| t.len()).sum();
        content_size + embedding_size + tags_size + 128 // 128 for struct overhead
    }
}

// ═══════════════════════════════════════════════════════════════
//   ENUMS
// ═══════════════════════════════════════════════════════════════

/// Memory tier classification
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum MemoryTier {
    /// Short-Term Memory (10-20 items, <1h)
    STM,
    /// Mid-Term Memory (50-200 items, 1h-7d)
    MTM,
    /// Long-Term Memory (persistent, >7d)
    LTM,
}

impl MemoryTier {
    /// Get tier display name
    pub fn name(&self) -> &'static str {
        match self {
            MemoryTier::STM => "Short-Term",
            MemoryTier::MTM => "Mid-Term",
            MemoryTier::LTM => "Long-Term",
        }
    }

    /// Get tier abbreviation
    pub fn abbrev(&self) -> &'static str {
        match self {
            MemoryTier::STM => "STM",
            MemoryTier::MTM => "MTM",
            MemoryTier::LTM => "LTM",
        }
    }

    /// Get next tier (for promotion)
    pub fn next(&self) -> Option<MemoryTier> {
        match self {
            MemoryTier::STM => Some(MemoryTier::MTM),
            MemoryTier::MTM => Some(MemoryTier::LTM),
            MemoryTier::LTM => None,
        }
    }
}

/// Memory type classification
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum MemoryType {
    /// Conversation message
    Conversation,
    /// User decision or preference
    Decision,
    /// Knowledge/fact
    Knowledge,
    /// Project-related
    Project,
    /// Recurring pattern/ritual
    Ritual,
    /// Calendar/event
    Event,
    /// System memory
    System,
    /// Custom type
    Custom,
}

impl MemoryType {
    /// Get type display name
    pub fn name(&self) -> &'static str {
        match self {
            MemoryType::Conversation => "Conversation",
            MemoryType::Decision => "Decision",
            MemoryType::Knowledge => "Knowledge",
            MemoryType::Project => "Project",
            MemoryType::Ritual => "Ritual",
            MemoryType::Event => "Event",
            MemoryType::System => "System",
            MemoryType::Custom => "Custom",
        }
    }

    /// Get default importance for this type
    pub fn default_importance(&self) -> f32 {
        match self {
            MemoryType::Decision => 0.8,
            MemoryType::Knowledge => 0.7,
            MemoryType::Project => 0.7,
            MemoryType::Ritual => 0.6,
            MemoryType::Event => 0.5,
            MemoryType::Conversation => 0.4,
            MemoryType::System => 0.3,
            MemoryType::Custom => 0.5,
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   SNAPSHOT & STATISTICS
// ═══════════════════════════════════════════════════════════════

/// Memory system snapshot for DevTools
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemorySnapshot {
    /// Snapshot timestamp
    pub timestamp: i64,
    /// STM statistics
    pub stm: TierSnapshot,
    /// MTM statistics
    pub mtm: TierSnapshot,
    /// LTM statistics
    pub ltm: TierSnapshot,
    /// Total entries across all tiers
    pub total_entries: usize,
    /// Total size in bytes
    pub total_size_bytes: usize,
    /// Number of entries with embeddings
    pub embeddings_count: usize,
    /// Index health status
    pub index_healthy: bool,
    /// Memory OS version
    pub version: String,
}

/// Statistics for a single memory tier
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TierSnapshot {
    /// Tier identifier
    pub tier: MemoryTier,
    /// Entry count
    pub count: usize,
    /// Total size in bytes
    pub size_bytes: usize,
    /// Average importance
    pub avg_importance: f32,
    /// Oldest entry age (ms)
    pub oldest_age_ms: i64,
    /// Newest entry age (ms)
    pub newest_age_ms: i64,
    /// Top tags
    pub top_tags: Vec<(String, usize)>,
}

impl TierSnapshot {
    /// Create empty snapshot
    pub fn empty(tier: MemoryTier) -> Self {
        Self {
            tier,
            count: 0,
            size_bytes: 0,
            avg_importance: 0.0,
            oldest_age_ms: 0,
            newest_age_ms: 0,
            top_tags: Vec::new(),
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   SEARCH RESULTS
// ═══════════════════════════════════════════════════════════════

/// Search result with relevance score
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    /// Memory entry
    pub entry: MemoryEntry,
    /// Search relevance score (0.0 - 1.0)
    pub relevance: f32,
    /// Match type
    pub match_type: MatchType,
}

/// How the result matched the query
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum MatchType {
    /// Exact keyword match
    Keyword,
    /// Semantic/embedding match
    Semantic,
    /// Tag match
    Tag,
    /// Combined match
    Combined,
}

// ═══════════════════════════════════════════════════════════════
//   CONFIGURATION
// ═══════════════════════════════════════════════════════════════

/// Memory OS configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryOSConfig {
    /// STM capacity
    pub stm_capacity: usize,
    /// MTM capacity
    pub mtm_capacity: usize,
    /// STM retention (ms)
    pub stm_retention_ms: u64,
    /// MTM retention (ms)
    pub mtm_retention_ms: u64,
    /// Embedding dimension
    pub embedding_dim: usize,
    /// Enable vector store
    pub enable_vectors: bool,
    /// Auto-consolidation interval (ms)
    pub consolidation_interval_ms: u64,
    /// Forgetting decay rate
    pub decay_rate: f32,
    /// LTM storage path
    pub ltm_storage_path: String,
    /// Enable compression
    pub enable_compression: bool,
}

impl Default for MemoryOSConfig {
    fn default() -> Self {
        Self {
            stm_capacity: 20,
            mtm_capacity: 200,
            stm_retention_ms: 3_600_000,       // 1 hour
            mtm_retention_ms: 604_800_000,     // 7 days
            embedding_dim: 384,
            enable_vectors: true,
            consolidation_interval_ms: 60_000, // 1 minute
            decay_rate: 0.1,
            ltm_storage_path: "./data/memory/ltm".to_string(),
            enable_compression: true,
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_memory_entry_creation() {
        let entry = MemoryEntry::new(
            "Test content".to_string(),
            0.8,
            MemoryType::Conversation,
        );

        assert!(!entry.id.is_nil());
        assert_eq!(entry.content, "Test content");
        assert_eq!(entry.importance, 0.8);
        assert_eq!(entry.tier, MemoryTier::STM);
        assert_eq!(entry.access_count, 0);
    }

    #[test]
    fn test_memory_entry_with_tags() {
        let entry = MemoryEntry::new("Test".to_string(), 0.5, MemoryType::Knowledge)
            .with_tags(vec!["tag1".to_string(), "tag2".to_string()]);

        assert_eq!(entry.tags.len(), 2);
        assert!(entry.tags.contains(&"tag1".to_string()));
    }

    #[test]
    fn test_relevance_score() {
        let entry = MemoryEntry::new("Test".to_string(), 0.8, MemoryType::Decision);
        let score = entry.relevance_score();

        assert!(score > 0.0);
        assert!(score <= 1.0);
    }

    #[test]
    fn test_tier_promotion() {
        assert_eq!(MemoryTier::STM.next(), Some(MemoryTier::MTM));
        assert_eq!(MemoryTier::MTM.next(), Some(MemoryTier::LTM));
        assert_eq!(MemoryTier::LTM.next(), None);
    }

    #[test]
    fn test_memory_type_importance() {
        assert!(MemoryType::Decision.default_importance() > MemoryType::Conversation.default_importance());
    }

    #[test]
    fn test_size_bytes() {
        let entry = MemoryEntry::new("Hello World".to_string(), 0.5, MemoryType::Conversation);
        let size = entry.size_bytes();

        assert!(size > 0);
        assert!(size >= "Hello World".len());
    }
}
