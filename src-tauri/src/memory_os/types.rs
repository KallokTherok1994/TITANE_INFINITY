// ═══════════════════════════════════════════════════════════════
//   MEMORY OS TYPES — Shared types across modules
//   SUPER PROMPTS #6-7-8
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

/// Memory OS Result type
pub type MemoryOSResult<T> = Result<T, MemoryOSError>;

/// Memory OS Error
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryOSError(pub String);

impl std::fmt::Display for MemoryOSError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "MemoryOSError: {}", self.0)
    }
}

impl std::error::Error for MemoryOSError {}

// Conversion automatique depuis std::io::Error
impl From<std::io::Error> for MemoryOSError {
    fn from(err: std::io::Error) -> Self {
        MemoryOSError::IoError(err.to_string())
    }
}

// Conversion automatique depuis serde_json::Error
impl From<serde_json::Error> for MemoryOSError {
    fn from(err: serde_json::Error) -> Self {
        MemoryOSError::IoError(err.to_string())
    }
}

#[allow(non_snake_case)]
impl MemoryOSError {
    pub fn EmbeddingError(msg: String) -> Self {
        MemoryOSError(format!("EmbeddingError: {}", msg))
    }

    pub fn ClusteringError(msg: String) -> Self {
        MemoryOSError(format!("ClusteringError: {}", msg))
    }

    pub fn SearchError(msg: String) -> Self {
        MemoryOSError(format!("SearchError: {}", msg))
    }

    pub fn VectorIndexError(msg: String) -> Self {
        MemoryOSError(format!("VectorIndexError: {}", msg))
    }

    pub fn IoError(msg: String) -> Self {
        MemoryOSError(format!("IoError: {}", msg))
    }
}

/// Vector Search Result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VectorSearchResult {
    pub id: String,
    pub score: f32,
    pub content: String,
    pub metadata: serde_json::Value,
}

/// Cluster
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Cluster {
    pub id: usize,
    pub member_ids: Vec<String>,
    pub centroid: Vec<f32>,
    pub size: usize,
}

/// Cluster Result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClusterResult {
    pub clusters: Vec<Cluster>,
    pub total_items: usize,
    pub silhouette_score: f32,
}
