// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — VectorStore v2
//   SUPER PROMPT #6 vΩ.8 — In-Memory Vector Database
// ═══════════════════════════════════════════════════════════════

use std::collections::HashMap;

/// VectorStore — In-memory vector database with kNN search
///
/// Features:
/// - Fast in-memory storage
/// - Cosine similarity search
/// - k-Nearest Neighbors (kNN)
/// - Thread-safe via ownership
///
/// Future: Replace with HNSW or IVF for large-scale (>100k vectors)
pub struct VectorStore {
    /// Vector storage (id -> embedding)
    pub items: Vec<(String, Vec<f32>)>,

    /// Index for fast ID lookup (id -> position)
    index: HashMap<String, usize>,

    /// Embedding dimension (384 for all-MiniLM-L6-v2)
    dimension: usize,
}

impl VectorStore {
    /// Create new VectorStore with specified dimension
    pub fn new(dimension: usize) -> Self {
        Self {
            items: Vec::new(),
            index: HashMap::new(),
            dimension,
        }
    }

    /// Create default VectorStore (384D)
    pub fn with_default_dimensions() -> Self {
        Self::new(384)
    }

    /// Add vector to store
    pub fn add(&mut self, id: String, embedding: Vec<f32>) -> Result<(), String> {
        // Validate dimension
        if embedding.len() != self.dimension {
            return Err(format!(
                "Embedding dimension mismatch: expected {}, got {}",
                self.dimension,
                embedding.len()
            ));
        }

        // Check if ID already exists
        if self.index.contains_key(&id) {
            return Err(format!("Vector with ID '{}' already exists", id));
        }

        // Add to items
        let position = self.items.len();
        self.items.push((id.clone(), embedding));
        self.index.insert(id, position);

        Ok(())
    }

    /// Update existing vector
    pub fn update(&mut self, id: &str, embedding: Vec<f32>) -> Result<(), String> {
        // Validate dimension
        if embedding.len() != self.dimension {
            return Err(format!(
                "Embedding dimension mismatch: expected {}, got {}",
                self.dimension,
                embedding.len()
            ));
        }

        // Find position
        if let Some(&pos) = self.index.get(id) {
            self.items[pos].1 = embedding;
            Ok(())
        } else {
            Err(format!("Vector with ID '{}' not found", id))
        }
    }

    /// Get vector by ID
    pub fn get(&self, id: &str) -> Option<&Vec<f32>> {
        self.index.get(id).map(|&pos| &self.items[pos].1)
    }

    /// Remove vector by ID
    pub fn remove(&mut self, id: &str) -> Option<Vec<f32>> {
        if let Some(&pos) = self.index.get(id) {
            let (removed_id, embedding) = self.items.remove(pos);
            self.index.remove(&removed_id);

            // Rebuild index (positions changed after removal)
            self.rebuild_index();

            Some(embedding)
        } else {
            None
        }
    }

    /// k-Nearest Neighbors search
    ///
    /// Returns IDs of k most similar vectors (by cosine similarity)
    pub fn knn(&self, query: &[f32], k: usize) -> Vec<String> {
        if query.len() != self.dimension {
            return Vec::new();
        }

        // Calculate similarities
        let mut similarities: Vec<(String, f32)> = self
            .items
            .iter()
            .map(|(id, emb)| {
                let sim = cosine_similarity(query, emb);
                (id.clone(), sim)
            })
            .collect();

        // Sort by similarity (descending)
        similarities.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

        // Take top k
        similarities.into_iter().take(k).map(|(id, _)| id).collect()
    }

    /// k-Nearest Neighbors with scores
    ///
    /// Returns (ID, similarity_score) pairs
    pub fn knn_with_scores(&self, query: &[f32], k: usize) -> Vec<(String, f32)> {
        if query.len() != self.dimension {
            return Vec::new();
        }

        // Calculate similarities
        let mut similarities: Vec<(String, f32)> = self
            .items
            .iter()
            .map(|(id, emb)| {
                let sim = cosine_similarity(query, emb);
                (id.clone(), sim)
            })
            .collect();

        // Sort by similarity (descending)
        similarities.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

        // Take top k
        similarities.into_iter().take(k).collect()
    }

    /// Radius search — return all vectors within similarity threshold
    pub fn radius_search(&self, query: &[f32], threshold: f32) -> Vec<String> {
        if query.len() != self.dimension {
            return Vec::new();
        }

        self.items
            .iter()
            .filter_map(|(id, emb)| {
                let sim = cosine_similarity(query, emb);
                if sim >= threshold {
                    Some(id.clone())
                } else {
                    None
                }
            })
            .collect()
    }

    /// Current count
    pub fn len(&self) -> usize {
        self.items.len()
    }

    /// Check if empty
    pub fn is_empty(&self) -> bool {
        self.items.is_empty()
    }

    /// Clear all vectors
    pub fn clear(&mut self) {
        self.items.clear();
        self.index.clear();
    }

    /// Get dimension
    pub fn dimension(&self) -> usize {
        self.dimension
    }

    /// Rebuild index after removals
    fn rebuild_index(&mut self) {
        self.index.clear();
        for (pos, (id, _)) in self.items.iter().enumerate() {
            self.index.insert(id.clone(), pos);
        }
    }
}

/// Calculate cosine similarity between two vectors
fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    if a.len() != b.len() {
        return 0.0;
    }

    let dot: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
    let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
    let norm_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();

    if norm_a == 0.0 || norm_b == 0.0 {
        return 0.0;
    }

    dot / (norm_a * norm_b)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_vectorstore_creation() {
        let store = VectorStore::new(384);
        assert_eq!(store.len(), 0);
        assert_eq!(store.dimension(), 384);
        assert!(store.is_empty());
    }

    #[test]
    fn test_vectorstore_add() {
        let mut store = VectorStore::new(3);

        let result = store.add("vec1".to_string(), vec![1.0, 0.0, 0.0]);
        assert!(result.is_ok());
        assert_eq!(store.len(), 1);

        // Dimension mismatch
        let result = store.add("vec2".to_string(), vec![1.0, 0.0]);
        assert!(result.is_err());

        // Duplicate ID
        let result = store.add("vec1".to_string(), vec![0.0, 1.0, 0.0]);
        assert!(result.is_err());
    }

    #[test]
    fn test_vectorstore_get() {
        let mut store = VectorStore::new(3);
        store
            .add("vec1".to_string(), vec![1.0, 2.0, 3.0])
            .expect("VectorStore::add should succeed for valid vector");

        let vec = store.get("vec1");
        assert!(vec.is_some());
        assert_eq!(
            vec.expect("VectorStore::get should return Some for existing id"),
            &vec![1.0, 2.0, 3.0]
        );

        let missing = store.get("vec2");
        assert!(missing.is_none());
    }

    #[test]
    fn test_vectorstore_update() {
        let mut store = VectorStore::new(3);
        store
            .add("vec1".to_string(), vec![1.0, 0.0, 0.0])
            .expect("VectorStore::add should succeed for valid vector");

        let result = store.update("vec1", vec![0.0, 1.0, 0.0]);
        assert!(result.is_ok());

        let vec = store
            .get("vec1")
            .expect("VectorStore::get should return Some after update");
        assert_eq!(vec, &vec![0.0, 1.0, 0.0]);
    }

    #[test]
    fn test_vectorstore_remove() {
        let mut store = VectorStore::new(3);
        store
            .add("vec1".to_string(), vec![1.0, 0.0, 0.0])
            .expect("VectorStore::add should succeed for valid vector");
        store
            .add("vec2".to_string(), vec![0.0, 1.0, 0.0])
            .expect("VectorStore::add should succeed for valid vector");

        let removed = store.remove("vec1");
        assert!(removed.is_some());
        assert_eq!(store.len(), 1);

        let vec = store.get("vec1");
        assert!(vec.is_none());
    }

    #[test]
    fn test_vectorstore_knn() {
        let mut store = VectorStore::new(3);

        store
            .add("vec1".to_string(), vec![1.0, 0.0, 0.0])
            .expect("VectorStore::add should succeed for valid vector");
        store
            .add("vec2".to_string(), vec![0.9, 0.1, 0.0])
            .expect("VectorStore::add should succeed for valid vector");
        store
            .add("vec3".to_string(), vec![0.0, 1.0, 0.0])
            .expect("VectorStore::add should succeed for valid vector");

        let query = vec![1.0, 0.0, 0.0];
        let results = store.knn(&query, 2);

        assert_eq!(results.len(), 2);
        assert_eq!(results[0], "vec1"); // Exact match
        assert_eq!(results[1], "vec2"); // Close match
    }

    #[test]
    fn test_vectorstore_knn_with_scores() {
        let mut store = VectorStore::new(3);

        store
            .add("vec1".to_string(), vec![1.0, 0.0, 0.0])
            .expect("VectorStore::add should succeed for valid vector");
        store
            .add("vec2".to_string(), vec![0.0, 1.0, 0.0])
            .expect("VectorStore::add should succeed for valid vector");

        let query = vec![1.0, 0.0, 0.0];
        let results = store.knn_with_scores(&query, 2);

        assert_eq!(results.len(), 2);
        assert_eq!(results[0].0, "vec1");
        assert!((results[0].1 - 1.0).abs() < 0.001); // Perfect match
    }

    #[test]
    fn test_vectorstore_radius_search() {
        let mut store = VectorStore::new(3);

        store
            .add("vec1".to_string(), vec![1.0, 0.0, 0.0])
            .expect("VectorStore::add should succeed for valid vector");
        store
            .add("vec2".to_string(), vec![0.9, 0.1, 0.0])
            .expect("VectorStore::add should succeed for valid vector");
        store
            .add("vec3".to_string(), vec![0.0, 1.0, 0.0])
            .expect("VectorStore::add should succeed for valid vector");

        let query = vec![1.0, 0.0, 0.0];
        let results = store.radius_search(&query, 0.9);

        assert!(results.len() >= 2); // vec1 and vec2
    }

    #[test]
    fn test_cosine_similarity() {
        let a = vec![1.0, 0.0, 0.0];
        let b = vec![1.0, 0.0, 0.0];
        assert!((cosine_similarity(&a, &b) - 1.0).abs() < 0.001);

        let c = vec![0.0, 1.0, 0.0];
        assert!((cosine_similarity(&a, &c) - 0.0).abs() < 0.001);

        let d = vec![0.707, 0.707, 0.0];
        let similarity = cosine_similarity(&a, &d);
        assert!(similarity > 0.7 && similarity < 0.8);
    }
}
