// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Long-Term Memory (LTM) v2
//   SUPER PROMPT #6 vΩ.8 — Tantivy-Ready Persistent Storage
// ═══════════════════════════════════════════════════════════════

use super::models::{MemoryEntry, MemoryId};
use std::collections::HashMap;

/// Long-Term Memory — Persistent storage with hybrid search
/// 
/// Architecture:
/// - Text indexing: Tantivy (BM25 lexical search) [FUTURE]
/// - Vector search: Cosine similarity on embeddings
/// - Hybrid ranking: Combine lexical + semantic
/// - Compression: Optional AES-256-GCM encryption
/// 
/// Current implementation: In-memory HashMap (Tantivy integration TBD)
pub struct LongTermMemory {
    /// Memory entries (id -> entry)
    entries: HashMap<MemoryId, MemoryEntry>,
    
    /// Maximum capacity (soft limit)
    max_size: usize,
    
    /// Total entries stored (lifetime)
    total_stored: u64,
    
    /// Total entries compressed (lifetime)
    total_compressed: u64,
    
    // TODO: Tantivy index
    // index: tantivy::Index,
    // TODO: Vector index
    // vector_index: VectorIndex,
}

impl LongTermMemory {
    /// Create new LTM with specified capacity
    pub fn new(max: usize) -> Self {
        Self {
            entries: HashMap::with_capacity(max),
            max_size: max,
            total_stored: 0,
            total_compressed: 0,
        }
    }
    
    /// Create default LTM (10,000 entries)
    pub fn default() -> Self {
        Self::new(10_000)
    }
    
    /// Insert entry into LTM
    pub fn insert(&mut self, entry: MemoryEntry) -> Result<(), String> {
        if self.entries.len() >= self.max_size {
            return Err("LTM at capacity".to_string());
        }
        
        let id = entry.id.clone();
        self.entries.insert(id, entry);
        self.total_stored += 1;
        
        Ok(())
    }
    
    /// Get entry by ID
    pub fn get(&self, id: &MemoryId) -> Option<&MemoryEntry> {
        self.entries.get(id)
    }
    
    /// Get mutable entry by ID
    pub fn get_mut(&mut self, id: &MemoryId) -> Option<&mut MemoryEntry> {
        self.entries.get_mut(id)
    }
    
    /// Get all entries
    pub fn list(&self) -> Vec<MemoryEntry> {
        self.entries.values().cloned().collect()
    }
    
    /// Current count
    pub fn len(&self) -> usize {
        self.entries.len()
    }
    
    /// Check if empty
    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }
    
    /// Simple text search (substring matching)
    /// 
    /// TODO: Replace with Tantivy BM25 search
    pub fn search(&self, query: &str, top_k: usize) -> Vec<MemoryEntry> {
        let query_lower = query.to_lowercase();
        
        let mut results: Vec<MemoryEntry> = self.entries
            .values()
            .filter(|e| e.content.to_lowercase().contains(&query_lower))
            .cloned()
            .collect();
        
        // Sort by importance (descending)
        results.sort_by(|a, b| b.importance.partial_cmp(&a.importance).unwrap_or(std::cmp::Ordering::Equal));
        
        // Take top K
        results.truncate(top_k);
        results
    }
    
    /// Semantic search using cosine similarity
    /// 
    /// TODO: Optimize with vector index (HNSW or IVF)
    pub fn search_semantic(&self, query_embedding: &[f32], top_k: usize) -> Vec<MemoryEntry> {
        let mut scored: Vec<(f32, MemoryEntry)> = self.entries
            .values()
            .filter_map(|entry| {
                if let Some(ref emb) = entry.embedding {
                    let similarity = cosine_similarity(query_embedding, emb);
                    Some((similarity, entry.clone()))
                } else {
                    None
                }
            })
            .collect();
        
        // Sort by similarity (descending)
        scored.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap_or(std::cmp::Ordering::Equal));
        
        // Take top K
        scored.truncate(top_k);
        scored.into_iter().map(|(_, entry)| entry).collect()
    }
    
    /// Hybrid search (lexical + semantic)
    /// 
    /// Combines BM25 and vector search with weighted fusion
    pub fn search_hybrid(
        &self,
        query: &str,
        query_embedding: Option<&[f32]>,
        top_k: usize,
        alpha: f32, // Lexical weight (0.0-1.0)
    ) -> Vec<MemoryEntry> {
        // Lexical results
        let lexical = self.search(query, top_k * 2);
        
        // Semantic results
        let semantic = if let Some(emb) = query_embedding {
            self.search_semantic(emb, top_k * 2)
        } else {
            Vec::new()
        };
        
        // Merge and deduplicate
        let mut combined: HashMap<MemoryId, (MemoryEntry, f32)> = HashMap::new();
        
        // Add lexical scores
        for (i, entry) in lexical.iter().enumerate() {
            let score = alpha * (1.0 - (i as f32 / lexical.len() as f32));
            combined.insert(entry.id.clone(), (entry.clone(), score));
        }
        
        // Add semantic scores
        for (i, entry) in semantic.iter().enumerate() {
            let semantic_score = (1.0 - alpha) * (1.0 - (i as f32 / semantic.len() as f32));
            combined
                .entry(entry.id.clone())
                .and_modify(|(_, score)| *score += semantic_score)
                .or_insert((entry.clone(), semantic_score));
        }
        
        // Sort by combined score
        let mut results: Vec<(MemoryEntry, f32)> = combined.into_values().collect();
        results.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
        
        // Take top K
        results.truncate(top_k);
        results.into_iter().map(|(entry, _)| entry).collect()
    }
    
    /// Remove entry by ID
    pub fn remove(&mut self, id: &MemoryId) -> Option<MemoryEntry> {
        self.entries.remove(id)
    }
    
    /// Clear all entries
    pub fn clear(&mut self) {
        self.entries.clear();
    }
    
    /// Get capacity
    pub fn capacity(&self) -> usize {
        self.max_size
    }
    
    /// Get usage ratio (0.0-1.0)
    pub fn usage(&self) -> f32 {
        self.entries.len() as f32 / self.max_size as f32
    }
    
    /// Get total stored (lifetime)
    pub fn total_stored(&self) -> u64 {
        self.total_stored
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

// ═══════════════════════════════════════════════════════════════
//   TANTIVY INTEGRATION (FUTURE)
// ═══════════════════════════════════════════════════════════════

/*
TODO: Implement Tantivy indexing

use tantivy::schema::*;
use tantivy::{Index, IndexWriter, ReloadPolicy};
use tantivy::query::QueryParser;

pub struct TantivyLTM {
    index: Index,
    writer: IndexWriter,
    schema: Schema,
}

impl TantivyLTM {
    pub fn new(index_path: &str) -> Result<Self, String> {
        let mut schema_builder = Schema::builder();
        
        // Define schema
        schema_builder.add_text_field("id", STRING | STORED);
        schema_builder.add_text_field("content", TEXT | STORED);
        schema_builder.add_text_field("role", STRING | STORED);
        schema_builder.add_i64_field("timestamp", INDEXED | STORED);
        schema_builder.add_f64_field("importance", INDEXED | STORED);
        
        let schema = schema_builder.build();
        
        // Create index
        let index = Index::create_in_dir(index_path, schema.clone())
            .map_err(|e| format!("Failed to create index: {}", e))?;
        
        // Create writer
        let writer = index.writer(50_000_000)
            .map_err(|e| format!("Failed to create writer: {}", e))?;
        
        Ok(Self {
            index,
            writer,
            schema,
        })
    }
    
    pub fn insert(&mut self, entry: &MemoryEntry) -> Result<(), String> {
        // Add document to index
        let mut doc = Document::new();
        doc.add_text(self.schema.get_field("id").unwrap(), &entry.id);
        doc.add_text(self.schema.get_field("content").unwrap(), &entry.content);
        doc.add_text(self.schema.get_field("role").unwrap(), &entry.role);
        doc.add_i64(self.schema.get_field("timestamp").unwrap(), entry.timestamp);
        doc.add_f64(self.schema.get_field("importance").unwrap(), entry.importance as f64);
        
        self.writer.add_document(doc)
            .map_err(|e| format!("Failed to add document: {}", e))?;
        
        Ok(())
    }
    
    pub fn commit(&mut self) -> Result<(), String> {
        self.writer.commit()
            .map_err(|e| format!("Failed to commit: {}", e))
    }
    
    pub fn search(&self, query: &str, top_k: usize) -> Result<Vec<MemoryEntry>, String> {
        // Implement BM25 search
        todo!("Implement Tantivy BM25 search")
    }
}
*/

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ltm_creation() {
        let ltm = LongTermMemory::new(100);
        assert_eq!(ltm.len(), 0);
        assert_eq!(ltm.capacity(), 100);
        assert!(ltm.is_empty());
    }

    #[test]
    fn test_ltm_insert() {
        let mut ltm = LongTermMemory::new(10);
        
        let entry = MemoryEntry {
            id: "test_id".to_string(),
            content: "Test content".to_string(),
            ..Default::default()
        };
        
        let result = ltm.insert(entry);
        assert!(result.is_ok());
        assert_eq!(ltm.len(), 1);
        assert_eq!(ltm.total_stored(), 1);
    }

    #[test]
    fn test_ltm_search() {
        let mut ltm = LongTermMemory::new(10);
        
        ltm.insert(MemoryEntry {
            id: "1".to_string(),
            content: "Hello world".to_string(),
            ..Default::default()
        }).unwrap();
        
        ltm.insert(MemoryEntry {
            id: "2".to_string(),
            content: "Goodbye world".to_string(),
            ..Default::default()
        }).unwrap();
        
        let results = ltm.search("world", 10);
        assert_eq!(results.len(), 2);
        
        let results = ltm.search("hello", 10);
        assert_eq!(results.len(), 1);
    }

    #[test]
    fn test_ltm_semantic_search() {
        let mut ltm = LongTermMemory::new(10);
        
        let query_emb = vec![0.5; 384];
        
        ltm.insert(MemoryEntry {
            id: "1".to_string(),
            content: "Similar vector".to_string(),
            embedding: Some(vec![0.48; 384]),
            ..Default::default()
        }).unwrap();
        
        ltm.insert(MemoryEntry {
            id: "2".to_string(),
            content: "Different vector".to_string(),
            embedding: Some(vec![0.1; 384]),
            ..Default::default()
        }).unwrap();
        
        let results = ltm.search_semantic(&query_emb, 2);
        assert_eq!(results.len(), 2);
        assert_eq!(results[0].id, "1"); // More similar
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

    #[test]
    fn test_ltm_hybrid_search() {
        let mut ltm = LongTermMemory::new(10);
        
        ltm.insert(MemoryEntry {
            id: "1".to_string(),
            content: "Machine learning AI".to_string(),
            embedding: Some(vec![0.5; 384]),
            ..Default::default()
        }).unwrap();
        
        ltm.insert(MemoryEntry {
            id: "2".to_string(),
            content: "Deep learning neural networks".to_string(),
            embedding: Some(vec![0.48; 384]),
            ..Default::default()
        }).unwrap();
        
        let query_emb = vec![0.5; 384];
        let results = ltm.search_hybrid("learning", Some(&query_emb), 2, 0.5);
        
        assert!(results.len() > 0);
    }
}
