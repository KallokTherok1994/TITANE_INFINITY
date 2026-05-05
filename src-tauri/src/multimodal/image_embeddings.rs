#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   IMAGE EMBEDDINGS — Vectorization & Storage
//   SUPER PROMPT #15
// ═══════════════════════════════════════════════════════════════

use crate::multimodal::config::{MultimodalError, MultimodalResult};
use crate::multimodal::vision_models::VisionModelManager;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageEmbedding {
    pub image_id: String,
    pub embedding: Vec<f32>,
    pub model: String,
    pub timestamp: i64,
    pub metadata: serde_json::Value,
}

/// Image Embedding Engine
pub struct ImageEmbeddingEngine {
    model_manager: Arc<RwLock<VisionModelManager>>,
    cache: Arc<RwLock<std::collections::HashMap<String, ImageEmbedding>>>,
    max_cache_size: usize,
}

impl ImageEmbeddingEngine {
    pub fn new(model_manager: Arc<RwLock<VisionModelManager>>) -> Self {
        Self {
            model_manager,
            cache: Arc::new(RwLock::new(std::collections::HashMap::new())),
            max_cache_size: 1000,
        }
    }

    /// Generate image embedding
    pub async fn embed_image(
        &self,
        image_id: String,
        image: &[u8],
    ) -> MultimodalResult<ImageEmbedding> {
        // Check cache
        {
            let cache = self.cache.read().await;
            if let Some(cached) = cache.get(&image_id) {
                return Ok(cached.clone());
            }
        }

        // Generate embedding
        let manager = self.model_manager.read().await;
        let embedding = manager.embed_image(image).await?;
        let model = format!("{:?}", manager.current_model());
        drop(manager);

        let image_embedding = ImageEmbedding {
            image_id: image_id.clone(),
            embedding,
            model,
            timestamp: chrono::Utc::now().timestamp(),
            metadata: serde_json::json!({}),
        };

        // Store in cache
        {
            let mut cache = self.cache.write().await;
            if cache.len() >= self.max_cache_size {
                // Simple LRU: remove oldest
                if let Some(oldest_key) = cache.keys().next().cloned() {
                    cache.remove(&oldest_key);
                }
            }
            cache.insert(image_id, image_embedding.clone());
        }

        Ok(image_embedding)
    }

    /// Batch embed images
    pub async fn embed_batch(
        &self,
        images: Vec<(String, Vec<u8>)>,
    ) -> MultimodalResult<Vec<ImageEmbedding>> {
        let mut results = Vec::new();
        for (id, img) in images {
            let embedding = self.embed_image(id, &img).await?;
            results.push(embedding);
        }
        Ok(results)
    }

    /// Clear cache
    pub async fn clear_cache(&self) {
        let mut cache = self.cache.write().await;
        cache.clear();
    }

    /// Get cache stats
    pub async fn cache_stats(&self) -> (usize, usize) {
        let cache = self.cache.read().await;
        (cache.len(), self.max_cache_size)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::multimodal::vision_models::{VisionModel, VisionModelManager};
    use image::{ImageBuffer, Rgb};

    fn create_test_image_bytes() -> Vec<u8> {
        let img: ImageBuffer<Rgb<u8>, Vec<u8>> =
            ImageBuffer::from_fn(50, 50, |x, y| Rgb([(x * 5) as u8, (y * 5) as u8, 128]));
        let dynamic_img = image::DynamicImage::ImageRgb8(img);
        let mut bytes = Vec::new();
        dynamic_img
            .write_to(
                &mut std::io::Cursor::new(&mut bytes),
                image::ImageFormat::Png,
            )
            .expect("Test image should serialize to PNG bytes");
        bytes
    }

    #[tokio::test]
    async fn test_image_embedding_basic() {
        let manager = Arc::new(RwLock::new(VisionModelManager::new(
            VisionModel::CLIP,
            true,
        )));
        let engine = ImageEmbeddingEngine::new(manager);
        let img_bytes = create_test_image_bytes();
        let result = engine.embed_image("test".to_string(), &img_bytes).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_embedding_cache() {
        let manager = Arc::new(RwLock::new(VisionModelManager::new(
            VisionModel::CLIP,
            true,
        )));
        let engine = ImageEmbeddingEngine::new(manager);
        let id = "test_cache".to_string();
        let img_bytes = create_test_image_bytes();

        let _ = engine.embed_image(id.clone(), &img_bytes).await;
        let (size, _) = engine.cache_stats().await;
        assert_eq!(size, 1);
    }
}
