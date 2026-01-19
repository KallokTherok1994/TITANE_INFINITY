// ═══════════════════════════════════════════════════════════════
//   NEURAL MEMORY — VECTOR STORE
//   Embedding-based semantic search with cosine similarity
//   Migré et simplifié depuis memory_os/vector_store.rs
// ═══════════════════════════════════════════════════════════════

use crate::unified_memory_v2::types::{MemoryEntry, MemoryError, MemoryResult};
use std::collections::HashMap;

/// Default embedding dimension (sentence-transformers)
pub const EMBEDDING_DIM: usize = 384;

/// Vector search result with similarity score
#[derive(Debug, Clone)]
pub struct VectorSearchResult {
    pub id: String,
    pub similarity: f32,
    pub content_preview: String,
}

/// Vector Store for semantic similarity search
///
/// Uses cosine similarity for comparing embeddings.
/// Linear search implementation (sufficient for <10K entries).
pub struct VectorStore {
    dim: usize,
    vectors: HashMap<String, Vec<f32>>,
    metadata: HashMap<String, String>, // ID → content preview
}

impl VectorStore {
    /// Create new vector store with default dimension
    pub fn new() -> Self {
        Self::with_dim(EMBEDDING_DIM)
    }

    /// Create vector store with specific dimension
    pub fn with_dim(dim: usize) -> Self {
        Self {
            dim,
            vectors: HashMap::new(),
            metadata: HashMap::new(),
        }
    }

    /// Insert vector for entry
    pub fn insert(&mut self, entry: &MemoryEntry, embedding: Vec<f32>) -> MemoryResult<()> {
        if embedding.len() != self.dim {
            return Err(MemoryError::ValidationError(format!(
                "Embedding dimension mismatch: expected {}, got {}",
                self.dim,
                embedding.len()
            )));
        }

        // Normalize for cosine similarity
        let normalized = Self::normalize_vector(&embedding);

        self.vectors.insert(entry.id.clone(), normalized);
        self.metadata
            .insert(entry.id.clone(), entry.content.chars().take(100).collect());

        Ok(())
    }

    /// Search for similar vectors
    pub fn search(&self, query_embedding: &[f32], k: usize) -> Vec<VectorSearchResult> {
        if query_embedding.len() != self.dim {
            return Vec::new();
        }

        let query_normalized = Self::normalize_vector(query_embedding);

        let mut results: Vec<_> = self
            .vectors
            .iter()
            .map(|(id, vec)| {
                let similarity = Self::cosine_similarity(&query_normalized, vec);
                VectorSearchResult {
                    id: id.clone(),
                    similarity,
                    content_preview: self.metadata.get(id).cloned().unwrap_or_default(),
                }
            })
            .collect();

        // Sort by similarity (highest first)
        // FIX: Handle NaN values safely to prevent panic
        results.sort_by(|a, b| {
            b.similarity
                .partial_cmp(&a.similarity)
                .unwrap_or(std::cmp::Ordering::Equal)
        });

        // Return top k
        results.into_iter().take(k).collect()
    }

    /// Remove vector
    pub fn remove(&mut self, id: &str) {
        self.vectors.remove(id);
        self.metadata.remove(id);
    }

    /// Get count
    pub fn count(&self) -> usize {
        self.vectors.len()
    }

    /// Clear all
    pub fn clear(&mut self) {
        self.vectors.clear();
        self.metadata.clear();
    }

    // === Helper Functions ===

    /// Normalize vector (L2 norm)
    fn normalize_vector(vec: &[f32]) -> Vec<f32> {
        let magnitude: f32 = vec.iter().map(|x| x * x).sum::<f32>().sqrt();
        if magnitude > 0.0 {
            vec.iter().map(|x| x / magnitude).collect()
        } else {
            vec.to_vec()
        }
    }

    /// Cosine similarity (assumes normalized vectors)
    fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
        a.iter().zip(b.iter()).map(|(x, y)| x * y).sum()
    }
}

impl Default for VectorStore {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::unified_memory_v2::types::MemoryType;

    #[test]
    fn test_vector_store_insert_search() {
        let mut store = VectorStore::new();

        let entry = MemoryEntry::new("Test content".to_string(), 0.8, MemoryType::Conversation);

        let embedding = vec![0.5; EMBEDDING_DIM];
        store
            .insert(&entry, embedding.clone())
            .expect("vector store insertion should succeed");

        let results = store.search(&embedding, 1);
        assert_eq!(results.len(), 1);
        assert!(results[0].similarity > 0.99); // Should be very similar
    }

    #[test]
    fn test_cosine_similarity() {
        let a = vec![1.0, 0.0, 0.0];
        let b = vec![1.0, 0.0, 0.0];
        let c = vec![0.0, 1.0, 0.0];

        let a_norm = VectorStore::normalize_vector(&a);
        let b_norm = VectorStore::normalize_vector(&b);
        let c_norm = VectorStore::normalize_vector(&c);

        let sim_ab = VectorStore::cosine_similarity(&a_norm, &b_norm);
        let sim_ac = VectorStore::cosine_similarity(&a_norm, &c_norm);

        assert!((sim_ab - 1.0).abs() < 0.001); // Same direction = 1.0
        assert!((sim_ac - 0.0).abs() < 0.001); // Orthogonal = 0.0
    }
}
