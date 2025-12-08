// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1 — VECTOR STORE
//   Super Prompt #12: Embedding-based semantic search
//   Target: <10ms query, 384-dim vectors
// ═══════════════════════════════════════════════════════════════

use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

use super::memory_state::MemoryEntry;

// Logging macro
macro_rules! log_warn {
    ($($arg:tt)*) => {
        log::warn!($($arg)*);
    };
}

/// Default embedding dimension (sentence-transformers)
pub const EMBEDDING_DIM: usize = 384;

/// Vector entry in the store
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct VectorEntry {
    pub id: Uuid,
    pub embedding: Vec<f32>,
    pub metadata: VectorMetadata,
}

/// Metadata associated with vector
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct VectorMetadata {
    pub content_preview: String,
    pub importance: f32,
    pub timestamp: i64,
    pub tags: Vec<String>,
}

/// Search result with similarity score
#[derive(Debug, Clone)]
pub struct VectorSearchResult {
    pub id: Uuid,
    pub similarity: f32,
    pub metadata: VectorMetadata,
}

/// Vector Store for semantic similarity search
///
/// Uses cosine similarity for comparing embeddings.
/// Implements a simple linear search (can be upgraded to HNSW for scale).
#[derive(Debug)]
pub struct VectorStore {
    /// Embedding dimension
    dim: usize,
    /// Vector entries indexed by ID
    vectors: Arc<RwLock<HashMap<Uuid, VectorEntry>>>,
    /// Normalized flag (for cosine similarity optimization)
    normalized: bool,
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
            vectors: Arc::new(RwLock::new(HashMap::new())),
            normalized: true,
        }
    }

    /// Insert vector for entry
    pub async fn insert(&self, entry: &MemoryEntry) -> Result<(), VectorStoreError> {
        let embedding = entry.embedding.as_ref().ok_or_else(|| {
            VectorStoreError::MissingEmbedding(entry.id.to_string())
        })?;

        if embedding.len() != self.dim {
            return Err(VectorStoreError::DimensionMismatch {
                expected: self.dim,
                got: embedding.len(),
            });
        }

        // Normalize embedding for cosine similarity
        let normalized = if self.normalized {
            normalize_vector(embedding)
        } else {
            embedding.clone()
        };

        let vector_entry = VectorEntry {
            id: entry.id,
            embedding: normalized,
            metadata: VectorMetadata {
                content_preview: entry.content.chars().take(100).collect(),
                importance: entry.importance,
                timestamp: entry.timestamp,
                tags: entry.tags.clone(),
            },
        };

        let mut vectors = self.vectors.write().await;
        vectors.insert(entry.id, vector_entry);

        Ok(())
    }

    /// Insert batch of entries
    pub async fn insert_batch(&self, entries: &[MemoryEntry]) -> usize {
        let mut inserted = 0;
        for entry in entries {
            if self.insert(entry).await.is_ok() {
                inserted += 1;
            }
        }
        inserted
    }

    /// Search for similar vectors
    pub async fn search(&self, query_embedding: &[f32], k: usize) -> Vec<VectorSearchResult> {
        let start = std::time::Instant::now();

        if query_embedding.len() != self.dim {
            return Vec::new();
        }

        // Normalize query
        let query_normalized = if self.normalized {
            normalize_vector(query_embedding)
        } else {
            query_embedding.to_vec()
        };

        let vectors = self.vectors.read().await;

        // Calculate similarities
        let mut results: Vec<_> = vectors
            .values()
            .map(|v| {
                let similarity = cosine_similarity(&query_normalized, &v.embedding);
                VectorSearchResult {
                    id: v.id,
                    similarity,
                    metadata: v.metadata.clone(),
                }
            })
            .collect();

        // Sort by similarity (descending)
        results.sort_by(|a, b| b.similarity.partial_cmp(&a.similarity).unwrap());
        results.truncate(k);

        let duration = start.elapsed();
        if duration.as_millis() > super::targets::VECTOR_QUERY_MS {
            log_warn!("Vector search exceeded target: {}ms", duration.as_millis());
        }

        results
    }

    /// Search with minimum similarity threshold
    pub async fn search_threshold(
        &self,
        query_embedding: &[f32],
        threshold: f32,
        k: usize,
    ) -> Vec<VectorSearchResult> {
        let mut results = self.search(query_embedding, k * 2).await;
        results.retain(|r| r.similarity >= threshold);
        results.truncate(k);
        results
    }

    /// Get vector by ID
    pub async fn get(&self, id: &Uuid) -> Option<VectorEntry> {
        self.vectors.read().await.get(id).cloned()
    }

    /// Remove vector by ID
    pub async fn remove(&self, id: &Uuid) -> Option<VectorEntry> {
        self.vectors.write().await.remove(id)
    }

    /// Check if vector exists
    pub async fn exists(&self, id: &Uuid) -> bool {
        self.vectors.read().await.contains_key(id)
    }

    /// Get count
    pub async fn len(&self) -> usize {
        self.vectors.read().await.len()
    }

    /// Check if empty
    pub async fn is_empty(&self) -> bool {
        self.vectors.read().await.is_empty()
    }

    /// Get dimension
    pub fn dim(&self) -> usize {
        self.dim
    }

    /// Clear all vectors
    pub async fn clear(&self) {
        self.vectors.write().await.clear();
    }

    /// Get all IDs
    pub async fn get_ids(&self) -> Vec<Uuid> {
        self.vectors.read().await.keys().cloned().collect()
    }

    /// Rebuild from entries (batch operation)
    pub async fn rebuild(&self, entries: &[MemoryEntry]) -> usize {
        self.clear().await;
        self.insert_batch(entries).await
    }
}

impl Default for VectorStore {
    fn default() -> Self {
        Self::new()
    }
}

impl Clone for VectorStore {
    fn clone(&self) -> Self {
        Self {
            dim: self.dim,
            vectors: Arc::clone(&self.vectors),
            normalized: self.normalized,
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   VECTOR MATH UTILITIES
// ═══════════════════════════════════════════════════════════════

/// Normalize vector to unit length
fn normalize_vector(v: &[f32]) -> Vec<f32> {
    let magnitude: f32 = v.iter().map(|x| x * x).sum::<f32>().sqrt();
    if magnitude > 0.0 {
        v.iter().map(|x| x / magnitude).collect()
    } else {
        v.to_vec()
    }
}

/// Calculate cosine similarity between two vectors
/// For normalized vectors, this is just the dot product
fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    if a.len() != b.len() {
        return 0.0;
    }

    let dot: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
    dot.clamp(-1.0, 1.0)
}

/// Calculate Euclidean distance
#[allow(dead_code)]
fn euclidean_distance(a: &[f32], b: &[f32]) -> f32 {
    if a.len() != b.len() {
        return f32::MAX;
    }

    a.iter()
        .zip(b.iter())
        .map(|(x, y)| (x - y).powi(2))
        .sum::<f32>()
        .sqrt()
}

// ═══════════════════════════════════════════════════════════════
//   ERROR TYPES
// ═══════════════════════════════════════════════════════════════

#[derive(Debug)]
pub enum VectorStoreError {
    MissingEmbedding(String),
    DimensionMismatch { expected: usize, got: usize },
    StorageError(String),
}

impl std::fmt::Display for VectorStoreError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            VectorStoreError::MissingEmbedding(id) => {
                write!(f, "Missing embedding for entry: {}", id)
            }
            VectorStoreError::DimensionMismatch { expected, got } => {
                write!(f, "Dimension mismatch: expected {}, got {}", expected, got)
            }
            VectorStoreError::StorageError(e) => write!(f, "Vector storage error: {}", e),
        }
    }
}

impl std::error::Error for VectorStoreError {}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;
    use crate::memory_os::memory_state::MemoryType;

    fn create_test_embedding(seed: f32) -> Vec<f32> {
        (0..EMBEDDING_DIM).map(|i| (i as f32 + seed) / EMBEDDING_DIM as f32).collect()
    }

    #[tokio::test]
    async fn test_vector_store_insert() {
        let store = VectorStore::new();

        let entry = MemoryEntry::new("Test".to_string(), 0.5, MemoryType::Conversation)
            .with_embedding(create_test_embedding(1.0));

        let result = store.insert(&entry).await;
        assert!(result.is_ok());
        assert_eq!(store.len().await, 1);
    }

    #[tokio::test]
    async fn test_vector_store_search() {
        let store = VectorStore::new();

        // Insert some entries
        for i in 0..5 {
            let entry = MemoryEntry::new(format!("Entry {}", i), 0.5, MemoryType::Conversation)
                .with_embedding(create_test_embedding(i as f32));
            store.insert(&entry).await.ok();
        }

        // Search with a similar vector
        let query = create_test_embedding(2.5);
        let results = store.search(&query, 3).await;

        assert_eq!(results.len(), 3);
        // Results should be sorted by similarity
        assert!(results[0].similarity >= results[1].similarity);
    }

    #[tokio::test]
    async fn test_vector_store_search_threshold() {
        let store = VectorStore::new();

        for i in 0..10 {
            let entry = MemoryEntry::new(format!("Entry {}", i), 0.5, MemoryType::Conversation)
                .with_embedding(create_test_embedding(i as f32));
            store.insert(&entry).await.ok();
        }

        let query = create_test_embedding(5.0);
        let results = store.search_threshold(&query, 0.9, 10).await;

        // Only very similar results should pass threshold
        assert!(results.iter().all(|r| r.similarity >= 0.9));
    }

    #[tokio::test]
    async fn test_cosine_similarity() {
        let a = vec![1.0, 0.0, 0.0];
        let b = vec![1.0, 0.0, 0.0];
        assert!((cosine_similarity(&normalize_vector(&a), &normalize_vector(&b)) - 1.0).abs() < 0.001);

        let c = vec![0.0, 1.0, 0.0];
        assert!((cosine_similarity(&normalize_vector(&a), &normalize_vector(&c))).abs() < 0.001);
    }

    #[tokio::test]
    async fn test_vector_store_remove() {
        let store = VectorStore::new();

        let entry = MemoryEntry::new("Test".to_string(), 0.5, MemoryType::Conversation)
            .with_embedding(create_test_embedding(1.0));
        let id = entry.id;

        store.insert(&entry).await.ok();
        assert!(store.exists(&id).await);

        store.remove(&id).await;
        assert!(!store.exists(&id).await);
    }
}
