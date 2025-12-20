#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   MULTIMODAL TAURI COMMANDS — Frontend API vΩ
//   SUPER PROMPT #15 — PHASE 8 COMPLETE
//   Exposes multimodal capabilities to Tauri frontend
// ═══════════════════════════════════════════════════════════════

use crate::multimodal::config::{MultimodalConfig, MultimodalError, MultimodalResult};
use crate::multimodal::vision::{VisionAnalysis, VisionEngine};
use crate::multimodal::vision_models::{VisionModel, VisionModelManager};
use crate::multimodal::audio3d::{Audio3DAnalysis, Audio3DEngine};
use crate::multimodal::image_memory::{ImageMemoryEntry, ImageMemoryStore, ImageMetadata};
use crate::multimodal::multimodal_fusion::{FusionResult, MultimodalFusionEngine};
use crate::multimodal::multimodal_context::MultimodalContext;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;
use tauri::State;

/// Multimodal State Manager for Tauri
pub struct MultimodalState {
    pub config: MultimodalConfig,
    pub vision_engine: Arc<VisionEngine>,
    pub vision_models: Arc<RwLock<VisionModelManager>>,
    pub audio3d_engine: Arc<Audio3DEngine>,
    pub image_memory: Arc<ImageMemoryStore>,
    pub fusion_engine: Arc<MultimodalFusionEngine>,
}

impl MultimodalState {
    pub fn new(config: MultimodalConfig) -> Self {
        let vision_engine = Arc::new(VisionEngine::new(config.clone()));
        let vision_models = Arc::new(RwLock::new(VisionModelManager::new(
            VisionModel::from_string(&config.vision_model),
            true,
        )));
        let audio3d_engine = Arc::new(Audio3DEngine::new(44100, 1024));
        let image_memory = Arc::new(ImageMemoryStore::new(1000));
        let fusion_engine = Arc::new(MultimodalFusionEngine::new(
            vision_engine.clone(),
            audio3d_engine.clone(),
            image_memory.clone(),
        ));

        Self {
            config,
            vision_engine,
            vision_models,
            audio3d_engine,
            image_memory,
            fusion_engine,
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   VISION COMMANDS
// ═══════════════════════════════════════════════════════════════

/// Analyze image from bytes
#[tauri::command]
pub async fn analyze_image(
    image_bytes: Vec<u8>,
    state: State<'_, Arc<RwLock<MultimodalState>>>,
) -> Result<VisionAnalysis, String> {
    let state = state.read().await;
    state
        .vision_engine
        .analyze_image_bytes(&image_bytes)
        .await
        .map_err(|e| format!("Vision analysis error: {}", e))
}

/// Analyze image from file path
#[tauri::command]
pub async fn analyze_image_path(
    path: String,
    state: State<'_, Arc<RwLock<MultimodalState>>>,
) -> Result<VisionAnalysis, String> {
    let state = state.read().await;
    state
        .vision_engine
        .analyze_image_path(&path)
        .await
        .map_err(|e| format!("Vision analysis error: {}", e))
}

/// Generate image embedding
#[tauri::command]
pub async fn embed_image(
    image_bytes: Vec<u8>,
    state: State<'_, Arc<RwLock<MultimodalState>>>,
) -> Result<Vec<f32>, String> {
    let state = state.read().await;
    let models = state.vision_models.read().await;
    models
        .embed_image(&image_bytes)
        .await
        .map_err(|e| format!("Embedding error: {}", e))
}

/// Generate text embedding (for cross-modal search)
#[tauri::command]
pub async fn embed_text(
    text: String,
    state: State<'_, Arc<RwLock<MultimodalState>>>,
) -> Result<Vec<f32>, String> {
    let state = state.read().await;
    let models = state.vision_models.read().await;
    models
        .embed_text(&text)
        .await
        .map_err(|e| format!("Text embedding error: {}", e))
}

/// Switch vision model
#[tauri::command]
pub async fn switch_vision_model(
    model_name: String,
    state: State<'_, Arc<RwLock<MultimodalState>>>,
) -> Result<String, String> {
    let state = state.read().await;
    let mut models = state.vision_models.write().await;
    let model = VisionModel::from_string(&model_name);
    models.switch_model(model);
    Ok(format!("Switched to {:?}", model))
}

// ═══════════════════════════════════════════════════════════════
//   AUDIO COMMANDS
// ═══════════════════════════════════════════════════════════════

/// Analyze audio frame
#[tauri::command]
pub async fn analyze_audio(
    audio_samples: Vec<f32>,
    state: State<'_, Arc<RwLock<MultimodalState>>>,
) -> Result<Audio3DAnalysis, String> {
    let state = state.read().await;
    state
        .audio3d_engine
        .analyze_audio_frame(&audio_samples)
        .await
        .map_err(|e| format!("Audio analysis error: {}", e))
}

// ═══════════════════════════════════════════════════════════════
//   IMAGE MEMORY COMMANDS
// ═══════════════════════════════════════════════════════════════

#[derive(Serialize, Deserialize)]
pub struct StoreImageRequest {
    pub image_bytes: Vec<u8>,
    pub title: Option<String>,
    pub description: Option<String>,
    pub tags: Vec<String>,
    pub linked_text: Vec<String>,
}

/// Store image in multimodal memory
#[tauri::command]
pub async fn store_image(
    request: StoreImageRequest,
    state: State<'_, Arc<RwLock<MultimodalState>>>,
) -> Result<String, String> {
    let state_guard = state.read().await;

    // Analyze image
    let vision_analysis = state_guard
        .vision_engine
        .analyze_image_bytes(&request.image_bytes)
        .await
        .map_err(|e| format!("Vision analysis error: {}", e))?;

    // Generate embedding
    let models = state_guard.vision_models.read().await;
    let embedding = models
        .embed_image(&request.image_bytes)
        .await
        .map_err(|e| format!("Embedding error: {}", e))?;
    drop(models);

    // Create memory entry
    let entry = ImageMemoryEntry {
        id: vision_analysis.image_id.clone(),
        image_path: None,
        image_data: Some(request.image_bytes),
        embedding,
        metadata: ImageMetadata {
            title: request.title,
            description: request.description,
            tags: request.tags,
            width: vision_analysis.width,
            height: vision_analysis.height,
            format: vision_analysis.format.clone(),
            source: "tauri_command".to_string(),
        },
        linked_text: request.linked_text,
        timestamp: chrono::Utc::now().timestamp(),
        importance: 0.7,
    };

    // Store in memory
    state_guard
        .image_memory
        .store_image(entry)
        .await
        .map_err(|e| format!("Memory store error: {}", e))
}

/// Search images by image embedding
#[tauri::command]
pub async fn search_similar_images(
    image_bytes: Vec<u8>,
    k: usize,
    state: State<'_, Arc<RwLock<MultimodalState>>>,
) -> Result<Vec<ImageMemoryEntry>, String> {
    let state_guard = state.read().await;

    // Generate query embedding
    let models = state_guard.vision_models.read().await;
    let query_embedding = models
        .embed_image(&image_bytes)
        .await
        .map_err(|e| format!("Embedding error: {}", e))?;
    drop(models);

    // Search
    state_guard
        .image_memory
        .search_by_image_embedding(&query_embedding, k)
        .await
        .map_err(|e| format!("Search error: {}", e))
}

/// Cross-modal search: text query → image results
#[tauri::command]
pub async fn search_images_by_text(
    query: String,
    k: usize,
    state: State<'_, Arc<RwLock<MultimodalState>>>,
) -> Result<Vec<ImageMemoryEntry>, String> {
    let state_guard = state.read().await;

    // Generate text embedding
    let models = state_guard.vision_models.read().await;
    let text_embedding = models
        .embed_text(&query)
        .await
        .map_err(|e| format!("Text embedding error: {}", e))?;
    drop(models);

    // Search
    state_guard
        .image_memory
        .search_cross_modal(&query, &text_embedding, k)
        .await
        .map_err(|e| format!("Cross-modal search error: {}", e))
}

/// Get all stored images
#[tauri::command]
pub async fn get_all_images(
    state: State<'_, Arc<RwLock<MultimodalState>>>,
) -> Result<Vec<ImageMemoryEntry>, String> {
    let state = state.read().await;
    Ok(state.image_memory.get_all().await)
}

/// Search images by tags
#[tauri::command]
pub async fn search_images_by_tags(
    tags: Vec<String>,
    state: State<'_, Arc<RwLock<MultimodalState>>>,
) -> Result<Vec<ImageMemoryEntry>, String> {
    let state = state.read().await;
    Ok(state.image_memory.search_by_tags(&tags).await)
}

/// Remove image from memory
#[tauri::command]
pub async fn remove_image(
    image_id: String,
    state: State<'_, Arc<RwLock<MultimodalState>>>,
) -> Result<(), String> {
    let state = state.read().await;
    state
        .image_memory
        .remove(&image_id)
        .await
        .map_err(|e| format!("Remove error: {}", e))
}

/// Clear all images
#[tauri::command]
pub async fn clear_image_memory(
    state: State<'_, Arc<RwLock<MultimodalState>>>,
) -> Result<(), String> {
    let state = state.read().await;
    state.image_memory.clear().await;
    Ok(())
}

// ═══════════════════════════════════════════════════════════════
//   FUSION COMMANDS
// ═══════════════════════════════════════════════════════════════

#[derive(Serialize, Deserialize)]
pub struct MultimodalFusionRequest {
    pub text: Option<String>,
    pub image_bytes: Option<Vec<u8>>,
    pub audio_samples: Option<Vec<f32>>,
    pub text_weight: f32,
    pub vision_weight: f32,
    pub audio_weight: f32,
}

/// Perform multimodal fusion
#[tauri::command]
pub async fn fuse_multimodal(
    request: MultimodalFusionRequest,
    state: State<'_, Arc<RwLock<MultimodalState>>>,
) -> Result<FusionResult, String> {
    let state_guard = state.read().await;

    // Build context
    let context = state_guard
        .fusion_engine
        .build_context(
            request.text,
            request.image_bytes,
            request.audio_samples,
        )
        .await
        .map_err(|e| format!("Context build error: {}", e))?;

    // Fuse signals
    state_guard
        .fusion_engine
        .fuse_signals(
            &context,
            request.text_weight,
            request.vision_weight,
            request.audio_weight,
        )
        .await
        .map_err(|e| format!("Fusion error: {}", e))
}

// ═══════════════════════════════════════════════════════════════
//   STATISTICS & DIAGNOSTICS
// ═══════════════════════════════════════════════════════════════

#[derive(Serialize, Deserialize)]
pub struct MultimodalStats {
    pub vision_enabled: bool,
    pub audio3d_enabled: bool,
    pub current_vision_model: String,
    pub stored_images: usize,
    pub memory_capacity: usize,
}

/// Get multimodal system statistics
#[tauri::command]
pub async fn get_multimodal_stats(
    state: State<'_, Arc<RwLock<MultimodalState>>>,
) -> Result<MultimodalStats, String> {
    let state_guard = state.read().await;

    let models = state_guard.vision_models.read().await;
    let current_model = format!("{:?}", models.current_model());
    drop(models);

    let (stored_images, capacity) = state_guard.image_memory.stats().await;

    Ok(MultimodalStats {
        vision_enabled: state_guard.config.vision_enabled,
        audio3d_enabled: state_guard.config.audio3d_enabled,
        current_vision_model: current_model,
        stored_images,
        memory_capacity: capacity,
    })
}

/// Update multimodal configuration
#[tauri::command]
pub async fn update_multimodal_config(
    new_config: MultimodalConfig,
    state: State<'_, Arc<RwLock<MultimodalState>>>,
) -> Result<(), String> {
    let mut state_guard = state.write().await;
    state_guard.config = new_config;
    Ok(())
}

// ═══════════════════════════════════════════════════════════════
//   HELPER: Register all commands
// ═══════════════════════════════════════════════════════════════

/// Helper macro to generate command list
#[macro_export]
macro_rules! multimodal_commands {
    () => {
        [
            // Vision
            analyze_image,
            analyze_image_path,
            embed_image,
            embed_text,
            switch_vision_model,
            // Audio
            analyze_audio,
            // Image Memory
            store_image,
            search_similar_images,
            search_images_by_text,
            get_all_images,
            search_images_by_tags,
            remove_image,
            clear_image_memory,
            // Fusion
            fuse_multimodal,
            // Stats
            get_multimodal_stats,
            update_multimodal_config,
        ]
    };
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_state() -> Arc<RwLock<MultimodalState>> {
        let config = MultimodalConfig::default();
        Arc::new(RwLock::new(MultimodalState::new(config)))
    }

    fn create_test_image() -> Vec<u8> {
        let img = image::ImageBuffer::from_fn(50, 50, |_, _| image::Rgb([128, 128, 128]));
        let dynamic = image::DynamicImage::ImageRgb8(img);
        let mut bytes = Vec::new();
        dynamic
            .write_to(&mut std::io::Cursor::new(&mut bytes), image::ImageFormat::Png)
            .expect("test image should encode as PNG");
        bytes
    }

    #[tokio::test]
    async fn test_state_creation() {
        let state = create_test_state();
        let state_guard = state.read().await;
        assert!(state_guard.config.vision_enabled);
    }

    // Note: Full command tests would require Tauri runtime
    // These are integration tests that verify the state management
}
