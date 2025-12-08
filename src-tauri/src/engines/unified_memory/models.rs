// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Unified Memory OS v2 Models
//   SUPER PROMPT #6 vΩ.8 — Type Definitions
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

/// Unique memory entry identifier
pub type MemoryId = String;

/// Memory Entry — Core structure for all memory tiers
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct MemoryEntry {
    /// Unique identifier
    pub id: MemoryId,
    
    /// Creation timestamp (Unix milliseconds)
    pub timestamp: i64,
    
    /// Role: "user", "assistant", "system"
    pub role: String,
    
    /// Content (conversation text, decision, knowledge)
    pub content: String,
    
    /// Semantic embedding (384D vector from all-MiniLM-L6-v2)
    pub embedding: Option<Vec<f32>>,
    
    /// Importance score (0.0-1.0)
    pub importance: f32,
    
    /// Access count (for promotion logic)
    pub access_count: u32,
    
    /// Last accessed timestamp
    pub last_accessed: i64,
    
    /// Memory kind
    pub kind: MemoryKind,
    
    /// Tags for semantic filtering
    pub tags: Vec<String>,
}

/// Memory Bundle — Combined recall from all tiers
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryBundle {
    /// Short-term memories (conversation context)
    pub stm: Vec<MemoryEntry>,
    
    /// Mid-term memories (session context)
    pub mtm: Vec<MemoryEntry>,
    
    /// Long-term memories (persistent knowledge)
    pub ltm: Vec<MemoryEntry>,
    
    /// Total memories returned
    pub total: usize,
}

/// Memory Importance Levels
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum MemoryImportance {
    /// Critical (0.9-1.0) — Always promote to LTM
    Critical,
    
    /// High (0.7-0.89) — Promote to MTM quickly
    High,
    
    /// Medium (0.4-0.69) — Standard promotion logic
    Medium,
    
    /// Low (0.0-0.39) — May be evicted quickly
    Low,
}

impl MemoryImportance {
    /// Convert importance score to enum
    pub fn from_score(score: f32) -> Self {
        match score {
            s if s >= 0.9 => Self::Critical,
            s if s >= 0.7 => Self::High,
            s if s >= 0.4 => Self::Medium,
            _ => Self::Low,
        }
    }
    
    /// Convert enum to score
    pub fn to_score(&self) -> f32 {
        match self {
            Self::Critical => 0.95,
            Self::High => 0.8,
            Self::Medium => 0.55,
            Self::Low => 0.25,
        }
    }
}

/// Memory Kind — Semantic category
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum MemoryKind {
    /// Conversation message
    Conversation,
    
    /// User decision or preference
    Decision,
    
    /// Factual knowledge
    Knowledge,
    
    /// System event or state change
    Event,
    
    /// Emotional or affective state
    Emotion,
    
    /// Cognitive insight
    Insight,
}

/// Embedding Quality Assessment
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum EmbeddingQuality {
    /// High quality (384D, normalized)
    High,
    
    /// Medium quality (partial or compressed)
    Medium,
    
    /// Low quality (fallback or missing)
    Low,
    
    /// Not available
    None,
}

impl EmbeddingQuality {
    /// Assess embedding quality from vector
    pub fn assess(embedding: &Option<Vec<f32>>) -> Self {
        match embedding {
            Some(vec) if vec.len() == 384 => {
                // Check if normalized (L2 norm ≈ 1.0)
                let norm: f32 = vec.iter().map(|x| x * x).sum::<f32>().sqrt();
                if (norm - 1.0).abs() < 0.1 {
                    Self::High
                } else {
                    Self::Medium
                }
            }
            Some(_) => Self::Low,
            None => Self::None,
        }
    }
}

impl Default for MemoryEntry {
    fn default() -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            timestamp: chrono::Utc::now().timestamp_millis(),
            role: "system".to_string(),
            content: String::new(),
            embedding: None,
            importance: 0.5,
            access_count: 0,
            last_accessed: 0,
            kind: MemoryKind::Conversation,
            tags: Vec::new(),
        }
    }
}

impl Default for MemoryBundle {
    fn default() -> Self {
        Self {
            stm: Vec::new(),
            mtm: Vec::new(),
            ltm: Vec::new(),
            total: 0,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_memory_importance_conversion() {
        assert_eq!(MemoryImportance::from_score(0.95), MemoryImportance::Critical);
        assert_eq!(MemoryImportance::from_score(0.75), MemoryImportance::High);
        assert_eq!(MemoryImportance::from_score(0.5), MemoryImportance::Medium);
        assert_eq!(MemoryImportance::from_score(0.2), MemoryImportance::Low);
    }

    #[test]
    fn test_embedding_quality() {
        let high_quality = Some(vec![0.1; 384]);
        assert_eq!(EmbeddingQuality::assess(&high_quality), EmbeddingQuality::Medium);
        
        let none = None;
        assert_eq!(EmbeddingQuality::assess(&none), EmbeddingQuality::None);
    }

    #[test]
    fn test_memory_entry_default() {
        let entry = MemoryEntry::default();
        assert!(entry.id.len() > 0);
        assert_eq!(entry.role, "system");
        assert_eq!(entry.importance, 0.5);
    }
}
