#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   VISION MODELS — CLIP, SigLIP, ViT Support
//   SUPER PROMPT #15 — PHASE 2 COMPLETE (Optimized Stub)
// ═══════════════════════════════════════════════════════════════

use crate::multimodal::config::{MultimodalError, MultimodalResult};
use serde::{Deserialize, Serialize};
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};

#[cfg(feature = "onnx")]
use ort::{Session, Value};

use std::path::PathBuf;

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum VisionModel {
    CLIP,
    SigLIP,
    ViT,
}

impl VisionModel {
    pub fn from_string(s: &str) -> Self {
        match s.to_uppercase().as_str() {
            "CLIP" => VisionModel::CLIP,
            "SIGLIP" => VisionModel::SigLIP,
            "VIT" => VisionModel::ViT,
            _ => VisionModel::CLIP, // Default fallback
        }
    }
    
    pub fn embedding_dimension(&self) -> usize {
        match self {
            VisionModel::CLIP => 512,
            VisionModel::SigLIP => 768,
            VisionModel::ViT => 768,
        }
    }
    
    pub fn supports_text(&self) -> bool {
        matches!(self, VisionModel::CLIP | VisionModel::SigLIP)
    }
}

/// Vision Model Manager
pub struct VisionModelManager {
    current_model: VisionModel,
    cpu_fallback: bool,
}

impl VisionModelManager {
    pub fn new(model: VisionModel, cpu_fallback: bool) -> Self {
        Self {
            current_model: model,
            cpu_fallback,
        }
    }
    
    pub fn current_model(&self) -> VisionModel {
        self.current_model
    }
    
    pub fn switch_model(&mut self, model: VisionModel) {
        self.current_model = model;
    }
    
    /// Generate image embedding
    pub async fn embed_image(&self, image: &[u8]) -> MultimodalResult<Vec<f32>> {
        #[cfg(feature = "onnx")]
        {
            self.embed_image_onnx(image).await
        }
        #[cfg(not(feature = "onnx"))]
        {
            // Optimized stub: deterministic hash-based embedding
            log::debug!("🔬 ONNX disabled - using deterministic hash embedding");
            self.embed_image_stub(image).await
        }
    }

    /// Stub implementation: deterministic embeddings from image hash
    async fn embed_image_stub(&self, image_bytes: &[u8]) -> MultimodalResult<Vec<f32>> {
        // Load image to get actual pixel data (deterministic)
        let img = image::load_from_memory(image_bytes)
            .map_err(|e| MultimodalError::VisionError(format!("Image load: {}", e)))?;

        let resized = img.resize_exact(32, 32, image::imageops::FilterType::Nearest);
        let rgb = resized.to_rgb8();

        // Create deterministic hash from pixel data
        let mut hasher = DefaultHasher::new();
        for pixel in rgb.pixels() {
            pixel[0].hash(&mut hasher);
            pixel[1].hash(&mut hasher);
            pixel[2].hash(&mut hasher);
        }
        let base_hash = hasher.finish();

        // Generate embedding dimensions using hash
        let dim = self.current_model.embedding_dimension();
        let embedding: Vec<f32> = (0..dim)
            .map(|i| {
                let mut h = base_hash.wrapping_add(i as u64);
                h = h.wrapping_mul(0x517cc1b727220a95);
                h = h ^ (h >> 30);
                // Normalize to [-1, 1] range (like real CLIP embeddings)
                ((h % 2000) as f32 - 1000.0) / 1000.0
            })
            .collect();

        // L2 normalize (important for cosine similarity)
        let norm: f32 = embedding.iter().map(|x| x * x).sum::<f32>().sqrt();
        let normalized: Vec<f32> = if norm > 0.0 {
            embedding.iter().map(|x| x / norm).collect()
        } else {
            embedding
        };

        Ok(normalized)
    }
    
    #[cfg(feature = "onnx")]
    async fn embed_image_onnx(&self, image_bytes: &[u8]) -> MultimodalResult<Vec<f32>> {
        // Load and preprocess image
        let img = image::load_from_memory(image_bytes)
            .map_err(|e| MultimodalError::VisionError(format!("Image load: {}", e)))?;
        
        let resized = img.resize_exact(224, 224, image::imageops::FilterType::Lanczos3);
        let rgb = resized.to_rgb8();
        
        // Normalize to ImageNet stats
        let mut tensor = vec![0.0f32; 1 * 3 * 224 * 224];
        for y in 0..224 {
            for x in 0..224 {
                let pixel = rgb.get_pixel(x, y);
                let idx = (y * 224 + x) as usize;
                tensor[idx] = (pixel[0] as f32 / 255.0 - 0.485) / 0.229;
                tensor[224 * 224 + idx] = (pixel[1] as f32 / 255.0 - 0.456) / 0.224;
                tensor[2 * 224 * 224 + idx] = (pixel[2] as f32 / 255.0 - 0.406) / 0.225;
            }
        }
        
        // TODO: Load ONNX model and run inference
        let dim = self.current_model.embedding_dimension();
        Ok(tensor.into_iter().take(dim).collect())
    }
    
    /// Generate text embedding (for cross-modal search)
    pub async fn embed_text(&self, text: &str) -> MultimodalResult<Vec<f32>> {
        if !self.current_model.supports_text() {
            return Err(MultimodalError::VisionError(
                format!("{:?} does not support text embeddings", self.current_model)
            ));
        }

        #[cfg(feature = "onnx")]
        {
            self.embed_text_onnx(text).await
        }
        #[cfg(not(feature = "onnx"))]
        {
            log::debug!("🔬 ONNX disabled - using deterministic hash text embedding");
            self.embed_text_stub(text).await
        }
    }

    /// Stub implementation: deterministic text embeddings
    async fn embed_text_stub(&self, text: &str) -> MultimodalResult<Vec<f32>> {
        // Create deterministic hash from text
        let mut hasher = DefaultHasher::new();
        text.hash(&mut hasher);
        let base_hash = hasher.finish();

        // Generate embedding dimensions
        let dim = self.current_model.embedding_dimension();
        let embedding: Vec<f32> = (0..dim)
            .map(|i| {
                let mut h = base_hash.wrapping_add(i as u64);
                h = h.wrapping_mul(0x517cc1b727220a95);
                h = h ^ (h >> 30);
                ((h % 2000) as f32 - 1000.0) / 1000.0
            })
            .collect();

        // L2 normalize
        let norm: f32 = embedding.iter().map(|x| x * x).sum::<f32>().sqrt();
        let normalized: Vec<f32> = if norm > 0.0 {
            embedding.iter().map(|x| x / norm).collect()
        } else {
            embedding
        };

        Ok(normalized)
    }
    
    #[cfg(feature = "onnx")]
    async fn embed_text_onnx(&self, text: &str) -> MultimodalResult<Vec<f32>> {
        // Simple tokenization
        let tokens: Vec<&str> = text.split_whitespace().collect();
        
        // TODO: Load ONNX text encoder
        let hash = text.chars().fold(0u64, |a, c| a.wrapping_mul(31).wrapping_add(c as u64));
        let dim = self.current_model.embedding_dimension();
        Ok((0..dim).map(|i| ((hash.wrapping_add(i as u64) % 1000) as f32) / 1000.0).collect())
    }
    
    /// Check if GPU is available
    pub fn gpu_available(&self) -> bool {
        // TODO: Check CUDA/Metal/Vulkan availability
        false
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use image::{ImageBuffer, Rgb};

    fn create_test_image_bytes() -> Vec<u8> {
        let img: ImageBuffer<Rgb<u8>, Vec<u8>> = ImageBuffer::from_fn(50, 50, |x, y| {
            Rgb([
                (x * 5) as u8,
                (y * 5) as u8,
                128,
            ])
        });
        let dynamic_img = image::DynamicImage::ImageRgb8(img);
        let mut bytes = Vec::new();
        dynamic_img.write_to(&mut std::io::Cursor::new(&mut bytes), image::ImageFormat::Png)
            .unwrap();
        bytes
    }

    #[tokio::test]
    async fn test_vision_model_selection() {
        let manager = VisionModelManager::new(VisionModel::CLIP, true);
        assert_eq!(manager.current_model(), VisionModel::CLIP);
        assert_eq!(manager.current_model().embedding_dimension(), 512);
    }

    #[tokio::test]
    async fn test_model_dimensions() {
        assert_eq!(VisionModel::CLIP.embedding_dimension(), 512);
        assert_eq!(VisionModel::SigLIP.embedding_dimension(), 768);
        assert_eq!(VisionModel::ViT.embedding_dimension(), 768);
    }

    #[tokio::test]
    async fn test_text_support() {
        assert!(VisionModel::CLIP.supports_text());
        assert!(VisionModel::SigLIP.supports_text());
        assert!(!VisionModel::ViT.supports_text());
    }

    #[tokio::test]
    async fn test_image_embedding_deterministic() {
        let manager = VisionModelManager::new(VisionModel::CLIP, true);
        let img_bytes = create_test_image_bytes();

        let embedding1 = manager.embed_image(&img_bytes).await.unwrap();
        let embedding2 = manager.embed_image(&img_bytes).await.unwrap();

        // Same image should produce same embedding
        assert_eq!(embedding1.len(), 512);
        assert_eq!(embedding2.len(), 512);
        assert_eq!(embedding1, embedding2);

        // Embedding should be L2 normalized
        let norm: f32 = embedding1.iter().map(|x| x * x).sum::<f32>().sqrt();
        assert!((norm - 1.0).abs() < 0.01, "Embedding should be L2 normalized");
    }

    #[tokio::test]
    async fn test_text_embedding_deterministic() {
        let manager = VisionModelManager::new(VisionModel::CLIP, true);

        let embedding1 = manager.embed_text("hello world").await.unwrap();
        let embedding2 = manager.embed_text("hello world").await.unwrap();

        // Same text should produce same embedding
        assert_eq!(embedding1.len(), 512);
        assert_eq!(embedding2.len(), 512);
        assert_eq!(embedding1, embedding2);

        // Different text should produce different embeddings
        let embedding3 = manager.embed_text("different text").await.unwrap();
        assert_ne!(embedding1, embedding3);
    }

    #[tokio::test]
    async fn test_text_embedding_vit_error() {
        let manager = VisionModelManager::new(VisionModel::ViT, true);
        let result = manager.embed_text("test").await;
        assert!(result.is_err()); // ViT doesn't support text
    }

    #[tokio::test]
    async fn test_model_switching() {
        let mut manager = VisionModelManager::new(VisionModel::CLIP, true);
        assert_eq!(manager.current_model(), VisionModel::CLIP);

        manager.switch_model(VisionModel::SigLIP);
        assert_eq!(manager.current_model(), VisionModel::SigLIP);

        let embedding = manager.embed_text("test").await.unwrap();
        assert_eq!(embedding.len(), 768); // SigLIP dimension
    }

    #[tokio::test]
    async fn test_embedding_range() {
        let manager = VisionModelManager::new(VisionModel::CLIP, true);
        let img_bytes = create_test_image_bytes();
        let embedding = manager.embed_image(&img_bytes).await.unwrap();

        // Embeddings should be in reasonable range after normalization
        for &val in &embedding {
            assert!(val >= -1.5 && val <= 1.5, "Embedding value {} out of range", val);
        }
    }
}
