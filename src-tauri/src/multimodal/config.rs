#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   MULTIMODAL ENGINE CONFIGURATION
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MultimodalConfig {
    pub vision_enabled: bool,
    pub audio3d_enabled: bool,
    pub image_embeddings_enabled: bool,
    pub vision_model: String, // "CLIP" | "SigLIP" | "ViT"
    pub max_image_size: (u32, u32), // (width, height)
    pub embedding_dimension: usize,
    pub ocr_enabled: bool,
    pub object_detection_enabled: bool,
}

impl Default for MultimodalConfig {
    fn default() -> Self {
        Self {
            vision_enabled: true,
            audio3d_enabled: true,
            image_embeddings_enabled: true,
            vision_model: "CLIP".to_string(),
            max_image_size: (1024, 1024),
            embedding_dimension: 512,
            ocr_enabled: false,
            object_detection_enabled: false,
        }
    }
}

pub type MultimodalResult<T> = Result<T, MultimodalError>;

#[derive(Debug, Clone)]
pub struct MultimodalError(pub String);

impl std::fmt::Display for MultimodalError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "MultimodalError: {}", self.0)
    }
}

impl std::error::Error for MultimodalError {}

#[allow(non_snake_case)]
impl MultimodalError {
    pub fn VisionError(msg: String) -> Self {
        MultimodalError(format!("VisionError: {}", msg))
    }
    
    pub fn Audio3DError(msg: String) -> Self {
        MultimodalError(format!("Audio3DError: {}", msg))
    }
    
    pub fn EmbeddingError(msg: String) -> Self {
        MultimodalError(format!("EmbeddingError: {}", msg))
    }
}
