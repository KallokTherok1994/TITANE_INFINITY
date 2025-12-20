#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   IMAGE MEMORY — Multimodal Memory Storage & Cross-Modal Search
//   SUPER PROMPT #15 — PHASE 3 COMPLETE
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
            entries.sort_by(|a, b| a.importance.partial_cmp(&b.importance).unwrap_or(std::cmp::Ordering::Equal));
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
        scored.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap_or(std::cmp::Ordering::Equal));
        
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

    /// Get all entries
    pub async fn get_all(&self) -> Vec<ImageMemoryEntry> {
        let entries = self.entries.read().await;
        entries.clone()
    }

    /// Search by tags
    pub async fn search_by_tags(&self, tags: &[String]) -> Vec<ImageMemoryEntry> {
        let entries = self.entries.read().await;
        entries
            .iter()
            .filter(|e| tags.iter().any(|tag| e.metadata.tags.contains(tag)))
            .cloned()
            .collect()
    }

    /// Update importance score
    pub async fn update_importance(&self, id: &str, importance: f32) -> MultimodalResult<()> {
        let mut entries = self.entries.write().await;
        if let Some(entry) = entries.iter_mut().find(|e| e.id == id) {
            entry.importance = importance.clamp(0.0, 1.0);
            Ok(())
        } else {
            Err(MultimodalError::VisionError(format!("Image {} not found", id)))
        }
    }

    /// Clear all entries
    pub async fn clear(&self) {
        let mut entries = self.entries.write().await;
        entries.clear();
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

    fn create_test_entry(id: &str, embedding: Vec<f32>, tags: Vec<String>) -> ImageMemoryEntry {
        ImageMemoryEntry {
            id: id.to_string(),
            image_path: None,
            image_data: None,
            embedding,
            metadata: ImageMetadata {
                title: Some(format!("Image {}", id)),
                description: None,
                tags,
                width: 100,
                height: 100,
                format: "PNG".to_string(),
                source: "test".to_string(),
            },
            linked_text: vec![],
            timestamp: chrono::Utc::now().timestamp(),
            importance: 0.5,
        }
    }

    #[tokio::test]
    async fn test_store_and_retrieve() {
        let store = ImageMemoryStore::new(100);
        let entry = create_test_entry("test1", vec![1.0, 0.0, 0.0], vec![]);

        store
            .store_image(entry)
            .await
            .expect("store_image should succeed");

        let retrieved = store.get("test1").await;
        assert!(retrieved.is_some());
        assert_eq!(retrieved.expect("entry should exist").id, "test1");
    }

    #[tokio::test]
    async fn test_similarity_search() {
        let store = ImageMemoryStore::new(100);

        // Store 3 images with different embeddings
        store
            .store_image(create_test_entry("img1", vec![1.0, 0.0, 0.0], vec![]))
            .await
            .expect("store_image should succeed");
        store
            .store_image(create_test_entry("img2", vec![0.9, 0.1, 0.0], vec![]))
            .await
            .expect("store_image should succeed");
        store
            .store_image(create_test_entry("img3", vec![0.0, 1.0, 0.0], vec![]))
            .await
            .expect("store_image should succeed");

        // Search with query similar to img1
        let query = vec![1.0, 0.0, 0.0];
        let results = store
            .search_by_image_embedding(&query, 2)
            .await
            .expect("search_by_image_embedding should succeed");

        assert_eq!(results.len(), 2);
        assert_eq!(results[0].id, "img1"); // Most similar
        assert_eq!(results[1].id, "img2"); // Second most similar
    }

    #[tokio::test]
    async fn test_cosine_similarity() {
        let a = vec![1.0, 0.0, 0.0];
        let b = vec![1.0, 0.0, 0.0];
        let sim = cosine_similarity(&a, &b);
        assert!((sim - 1.0).abs() < 0.01);

        let c = vec![0.0, 1.0, 0.0];
        let sim2 = cosine_similarity(&a, &c);
        assert!((sim2 - 0.0).abs() < 0.01);
    }

    #[tokio::test]
    async fn test_eviction() {
        let store = ImageMemoryStore::new(3); // Small capacity

        // Store 4 images
        for i in 0..4 {
            let mut entry = create_test_entry(&format!("img{}", i), vec![0.0; 512], vec![]);
            entry.importance = i as f32 / 10.0; // Increasing importance
            store
                .store_image(entry)
                .await
                .expect("store_image should succeed");
        }

        let (count, _) = store.stats().await;
        assert_eq!(count, 3); // Should evict lowest importance

        // img0 (lowest importance) should be gone
        assert!(store.get("img0").await.is_none());
        assert!(store.get("img3").await.is_some());
    }

    #[tokio::test]
    async fn test_tag_search() {
        let store = ImageMemoryStore::new(100);

        store
            .store_image(create_test_entry(
                "img1",
                vec![0.0; 512],
                vec!["cat".to_string()],
            ))
            .await
            .expect("store_image should succeed");
        store
            .store_image(create_test_entry(
                "img2",
                vec![0.0; 512],
                vec!["dog".to_string()],
            ))
            .await
            .expect("store_image should succeed");
        store
            .store_image(create_test_entry(
                "img3",
                vec![0.0; 512],
                vec!["cat".to_string(), "cute".to_string()],
            ))
            .await
            .expect("store_image should succeed");

        let results = store.search_by_tags(&["cat".to_string()]).await;
        assert_eq!(results.len(), 2); // img1 and img3
    }

    #[tokio::test]
    async fn test_update_importance() {
        let store = ImageMemoryStore::new(100);
        store
            .store_image(create_test_entry("img1", vec![0.0; 512], vec![]))
            .await
            .expect("store_image should succeed");

        store
            .update_importance("img1", 0.9)
            .await
            .expect("update_importance should succeed");
        let entry = store.get("img1").await.expect("entry should exist");
        assert_eq!(entry.importance, 0.9);

        // Test clamping
        store
            .update_importance("img1", 1.5)
            .await
            .expect("update_importance should succeed");
        let entry = store.get("img1").await.expect("entry should exist");
        assert_eq!(entry.importance, 1.0);
    }

    #[tokio::test]
    async fn test_remove() {
        let store = ImageMemoryStore::new(100);
        store
            .store_image(create_test_entry("img1", vec![0.0; 512], vec![]))
            .await
            .expect("store_image should succeed");

        assert!(store.get("img1").await.is_some());
        store.remove("img1").await.expect("remove should succeed");
        assert!(store.get("img1").await.is_none());
    }

    #[tokio::test]
    async fn test_clear() {
        let store = ImageMemoryStore::new(100);
        for i in 0..5 {
            store
                .store_image(create_test_entry(&format!("img{}", i), vec![0.0; 512], vec![]))
                .await
                .expect("store_image should succeed");
        }

        let (count, _) = store.stats().await;
        assert_eq!(count, 5);

        store.clear().await;
        let (count, _) = store.stats().await;
        assert_eq!(count, 0);
    }
}
