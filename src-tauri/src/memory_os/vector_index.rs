// ═══════════════════════════════════════════════════════════════
//   VECTOR INDEX TRAIT — Abstraction for HNSW/FAISS
// ═══════════════════════════════════════════════════════════════

use crate::memory_os::types::MemoryOSResult;
use serde::{Deserialize, Serialize};

/// Vector Index Trait (HNSW / FAISS abstraction)
pub trait VectorIndex: Send + Sync {
    /// Add a vector to the index
    fn add_vector(&mut self, id: String, vector: Vec<f32>) -> MemoryOSResult<()>;
    
    /// Search for k nearest neighbors
    fn search(&self, query: &[f32], k: usize) -> MemoryOSResult<Vec<SearchResult>>;
    
    /// Remove a vector from the index
    fn remove(&mut self, id: &str) -> MemoryOSResult<()>;
    
    /// Get vector by ID
    fn get_vector(&self, id: &str) -> Option<Vec<f32>>;
    
    /// Get vector dimension
    fn dimension(&self) -> usize;
    
    /// Get total number of vectors
    fn size(&self) -> usize;
    
    /// Clear all vectors
    fn clear(&mut self) -> MemoryOSResult<()>;
    
    /// Save index to disk
    fn save(&self, path: &str) -> MemoryOSResult<()>;
    
    /// Load index from disk
    fn load(&mut self, path: &str) -> MemoryOSResult<()>;
}

/// Search Result from Vector Index
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub id: String,
    pub distance: f32,
    pub score: f32, // Normalized similarity score (0.0 - 1.0)
}

impl SearchResult {
    /// Convert distance to similarity score
    pub fn from_distance(id: String, distance: f32) -> Self {
        // Convert distance to similarity (assuming cosine distance)
        // score = 1.0 - (distance / 2.0) for cosine
        let score = (1.0 - distance / 2.0).max(0.0).min(1.0);
        Self {
            id,
            distance,
            score,
        }
    }
}

/// Vector Index Configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VectorIndexConfig {
    pub dimension: usize,
    pub max_elements: usize,
    pub ef_construction: usize, // HNSW construction parameter
    pub m: usize,               // HNSW max connections
    pub index_type: IndexType,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum IndexType {
    HNSW,
    FAISS,
}

impl Default for VectorIndexConfig {
    fn default() -> Self {
        Self {
            dimension: 384, // all-MiniLM-L6-v2 dimension
            max_elements: 10_000,
            ef_construction: 200,
            m: 16,
            index_type: IndexType::HNSW, // Default to HNSW (cross-platform)
        }
    }
}

impl VectorIndexConfig {
    pub fn new(dimension: usize) -> Self {
        Self {
            dimension,
            ..Default::default()
        }
    }
    
    pub fn with_max_elements(mut self, max_elements: usize) -> Self {
        self.max_elements = max_elements;
        self
    }
    
    pub fn with_hnsw_params(mut self, ef_construction: usize, m: usize) -> Self {
        self.ef_construction = ef_construction;
        self.m = m;
        self
    }
}
