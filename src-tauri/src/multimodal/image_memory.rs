#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   IMAGE MEMORY — Multimodal Memory Storage & Cross-Modal Search
//   SUPER PROMPT #15
// ═══════════════════════════════════════════════════════════════

use crate::multimodal::config::{MultimodalError, MultimodalResult};
use crate::multimodal::image_embeddings::ImageEmbedding;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageMemoryEntry {
    pub id: String,
    pub image_path: Option<String>,
    pub image_data: Option<Vec<u8>>, // Optional: store small images
    pub embedding: Vec<f32>,
    pub metadata: ImageMetadata,
    pub linked_text: Vec<String>, // Cross-modal links
    pub timestamp: i64,
    pub importance: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageMetadata {
    pub title: Option<String>,
    pub description: Option<String>,
    pub tags: Vec<String>,
    pub width: u32,
    pub height: u32,
    pub format: String,
    pub source: String, // "upload" | "screenshot" | "generated"
}

/// Image Memory Store
pub struct ImageMemoryStore {
    entries: Arc<RwLock<Vec<ImageMemoryEntry>>>,
    max_entries: usize,
}

impl ImageMemoryStore {
    pub fn new(max_entries: usize) -> Self {
        Self {
            entries: Arc::new(RwLock::new(Vec::new())),
            max_entries,
        }
    }
    
    /// Store image with embedding
    pub async fn store_image(&self, entry: ImageMemoryEntry) -> MultimodalResult<String> {
        let mut entries = self.entries.write().await;
        
        // Evict oldest if at capacity
        if entries.len() >= self.max_entries {
            entries.sort_by(|a, b| a.importance.partial_cmp(&b.importance).unwrap());
            entries.remove(0);
        }
        
        let id = entry.id.clone();
        entries.push(entry);
        Ok(id)
    }
    
    /// Search by image embedding (k-NN)
    pub async fn search_by_image_embedding(&self, query_embedding: &[f32], k: usize) -> MultimodalResult<Vec<ImageMemoryEntry>> {
        let entries = self.entries.read().await;
        
        // Calculate similarities
        let mut scored: Vec<(f32, ImageMemoryEntry)> = entries
            .iter()
            .map(|entry| {
                let similarity = cosine_similarity(query_embedding, &entry.embedding);
                (similarity, entry.clone())
            })
            .collect();
        
        // Sort by similarity (descending)
        scored.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap());
        
        // Take top k
        Ok(scored.into_iter().take(k).map(|(_, entry)| entry).collect())
    }
    
    /// Cross-modal search (text query → image results)
    pub async fn search_cross_modal(&self, text_query: &str, text_embedding: &[f32], k: usize) -> MultimodalResult<Vec<ImageMemoryEntry>> {
        // Same as image search but using text embedding
        self.search_by_image_embedding(text_embedding, k).await
    }
    
    /// Get by ID
    pub async fn get(&self, id: &str) -> Option<ImageMemoryEntry> {
        let entries = self.entries.read().await;
        entries.iter().find(|e| e.id == id).cloned()
    }
    
    /// Remove by ID
    pub async fn remove(&self, id: &str) -> MultimodalResult<()> {
        let mut entries = self.entries.write().await;
        entries.retain(|e| e.id != id);
        Ok(())
    }
    
    /// Get stats
    pub async fn stats(&self) -> (usize, usize) {
        let entries = self.entries.read().await;
        (entries.len(), self.max_entries)
    }
}

/// Helper: Cosine similarity
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
    
    #[tokio::test]
    async fn test_image_memory_store() {
        let store = ImageMemoryStore::new(100);
        let entry = ImageMemoryEntry {
            id: "test".to_string(),
            image_path: None,
            image_data: None,
            embedding: vec![1.0, 0.0, 0.0],
            metadata: ImageMetadata {
                title: Some("Test".to_string()),
                description: None,
                tags: vec![],
                width: 100,
                height: 100,
                format: "PNG".to_string(),
                source: "test".to_string(),
            },
            linked_text: vec![],
            timestamp: 0,
            importance: 1.0,
        };
        
        let result = store.store_image(entry).await;
        assert!(result.is_ok());
        
        let (count, _) = store.stats().await;
        assert_eq!(count, 1);
    }
}
