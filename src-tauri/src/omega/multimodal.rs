#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   OMEGA PIPELINE — MULTIMODAL INTEGRATION vΩ
//   SUPER PROMPT #15 — PHASE 5 COMPLETE
//   Extension OMEGA pour Vision, Audio 3D, Cross-Modal Reasoning
// ═══════════════════════════════════════════════════════════════

use crate::multimodal::{
    audio3d::Audio3DEngine,
    config::MultimodalConfig,
    image_memory::ImageMemoryStore,
    multimodal_fusion::{MultimodalFusionEngine, FusionResult},
    vision::VisionEngine,
    vision_models::{VisionModelManager, VisionModel},
};
use crate::omega::{OmegaError, OmegaResult, PipelineInput, PipelineOutput, OutputMetadata};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

/// OMEGA Multimodal Context Extension
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OmegaMultimodalContext {
    /// Image data (bytes)
    pub image: Option<Vec<u8>>,
    /// Audio frame data
    pub audio: Option<Vec<f32>>,
    /// Vision analysis result
    pub vision_analysis: Option<crate::multimodal::vision::VisionAnalysis>,
    /// Audio 3D analysis result
    pub audio3d_analysis: Option<crate::multimodal::audio3d::Audio3DAnalysis>,
    /// Fusion result
    pub fusion_result: Option<FusionResult>,
    /// Cross-modal search hits
    pub cross_modal_hits: Vec<String>,
}

impl Default for OmegaMultimodalContext {
    fn default() -> Self {
        Self {
            image: None,
            audio: None,
            vision_analysis: None,
            audio3d_analysis: None,
            fusion_result: None,
            cross_modal_hits: vec![],
        }
    }
}

/// OMEGA Multimodal Extension - Stage Processor
pub struct OmegaMultimodalProcessor {
    vision_engine: Arc<VisionEngine>,
    vision_models: Arc<RwLock<VisionModelManager>>,
    audio3d_engine: Arc<Audio3DEngine>,
    fusion_engine: Arc<MultimodalFusionEngine>,
    image_memory: Arc<ImageMemoryStore>,
    enabled: bool,
}

impl OmegaMultimodalProcessor {
    /// Create new multimodal processor
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
            vision_engine,
            vision_models,
            audio3d_engine,
            fusion_engine,
            image_memory,
            enabled: config.vision_enabled || config.audio3d_enabled,
        }
    }

    /// Process multimodal inputs and augment OMEGA context
    pub async fn process_multimodal(
        &self,
        input: &PipelineInput,
        multimodal_ctx: &OmegaMultimodalContext,
    ) -> OmegaResult<OmegaMultimodalContext> {
        if !self.enabled {
            log::debug!("🔇 Multimodal processing disabled");
            return Ok(multimodal_ctx.clone());
        }

        let start = std::time::Instant::now();
        log::info!("🌌 OMEGA Multimodal: Processing inputs...");

        let mut context = multimodal_ctx.clone();

        // Process Vision
        if let Some(ref img_bytes) = context.image {
            log::debug!("🖼️  Processing image ({} bytes)", img_bytes.len());

            // Vision analysis
            let vision_analysis = self
                .vision_engine
                .analyze_image_bytes(img_bytes)
                .await
                .map_err(|e| OmegaError::Internal(format!("Vision error: {}", e)))?;

            log::debug!(
                "✨ Vision analysis: {}x{}, brightness: {:.2}, contrast: {:.2}",
                vision_analysis.width,
                vision_analysis.height,
                vision_analysis.brightness,
                vision_analysis.contrast
            );

            context.vision_analysis = Some(vision_analysis.clone());

            // Generate embedding and store in memory
            let models = self.vision_models.read().await;
            let embedding = models
                .embed_image(img_bytes)
                .await
                .map_err(|e| OmegaError::Internal(format!("Embedding error: {}", e)))?;
            drop(models);

            let image_entry = crate::multimodal::image_memory::ImageMemoryEntry {
                id: vision_analysis.image_id.clone(),
                image_path: None,
                image_data: Some(img_bytes.clone()),
                embedding,
                metadata: crate::multimodal::image_memory::ImageMetadata {
                    title: Some(format!("OMEGA Input {}", vision_analysis.image_id)),
                    description: None,
                    tags: vec![],
                    width: vision_analysis.width,
                    height: vision_analysis.height,
                    format: vision_analysis.format.clone(),
                    source: "omega_pipeline".to_string(),
                },
                linked_text: vec![input.text.clone()],
                timestamp: chrono::Utc::now().timestamp(),
                importance: 0.8,
            };

            self.image_memory
                .store_image(image_entry)
                .await
                .map_err(|e| OmegaError::Internal(format!("Memory store error: {}", e)))?;

            log::debug!("💾 Image stored in multimodal memory");
        }

        // Process Audio 3D
        if let Some(ref audio_frame) = context.audio {
            log::debug!("🎙️  Processing audio ({} samples)", audio_frame.len());

            let audio_analysis = self
                .audio3d_engine
                .analyze_audio_frame(audio_frame)
                .await
                .map_err(|e| OmegaError::Internal(format!("Audio3D error: {}", e)))?;

            log::debug!(
                "🎵 Audio analysis: intensity: {:.2}, bands: {:?}",
                audio_analysis.intensity,
                audio_analysis.frequency_bands
            );

            context.audio3d_analysis = Some(audio_analysis);
        }

        // Multimodal Fusion
        if context.vision_analysis.is_some() || context.audio3d_analysis.is_some() {
            log::debug!("🔀 Performing multimodal fusion...");

            let fusion_context = self
                .fusion_engine
                .build_context(
                    Some(input.text.clone()),
                    context.image.clone(),
                    context.audio.clone(),
                )
                .await
                .map_err(|e| OmegaError::Internal(format!("Fusion context error: {}", e)))?;

            let fusion_result = self
                .fusion_engine
                .fuse_signals(&fusion_context, 0.5, 0.3, 0.2)
                .await
                .map_err(|e| OmegaError::Internal(format!("Fusion error: {}", e)))?;

            log::info!(
                "✅ Fusion complete: confidence={:.2}, dominant={:?}",
                fusion_result.confidence,
                fusion_result.dominant_modality
            );

            context.fusion_result = Some(fusion_result);
        }

        // Cross-modal search (if text query present)
        if !input.text.is_empty() {
            log::debug!("🔍 Cross-modal search: '{}'", input.text);

            let models = self.vision_models.read().await;
            let text_embedding = models
                .embed_text(&input.text)
                .await
                .map_err(|e| OmegaError::Internal(format!("Text embedding error: {}", e)))?;
            drop(models);

            let similar_images = self
                .image_memory
                .search_cross_modal(&input.text, &text_embedding, 3)
                .await
                .map_err(|e| OmegaError::Internal(format!("Cross-modal search error: {}", e)))?;

            context.cross_modal_hits = similar_images.iter().map(|e| e.id.clone()).collect();

            if !context.cross_modal_hits.is_empty() {
                log::debug!(
                    "🎯 Found {} similar images via cross-modal search",
                    context.cross_modal_hits.len()
                );
            }
        }

        let elapsed = start.elapsed();
        log::info!(
            "⚡ OMEGA Multimodal processing complete in {:.2}ms",
            elapsed.as_secs_f64() * 1000.0
        );

        Ok(context)
    }

    /// Augment OMEGA output metadata with multimodal info
    pub fn augment_output_metadata(
        &self,
        metadata: &mut OutputMetadata,
        multimodal_ctx: &OmegaMultimodalContext,
    ) {
        // Add multimodal sources
        if multimodal_ctx.vision_analysis.is_some() {
            metadata.sources.push("vision_analysis".to_string());
        }
        if multimodal_ctx.audio3d_analysis.is_some() {
            metadata.sources.push("audio3d_analysis".to_string());
        }
        if let Some(ref fusion) = multimodal_ctx.fusion_result {
            metadata.confidence = (metadata.confidence + fusion.confidence) / 2.0;
        }
    }

    /// Get statistics
    pub async fn stats(&self) -> MultimodalStats {
        let (stored_images, capacity) = self.image_memory.stats().await;
        MultimodalStats {
            enabled: self.enabled,
            stored_images,
            memory_capacity: capacity,
        }
    }
}

/// Multimodal Statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MultimodalStats {
    pub enabled: bool,
    pub stored_images: usize,
    pub memory_capacity: usize,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_omega_multimodal_processor() {
        let config = MultimodalConfig::default();
        let processor = OmegaMultimodalProcessor::new(config);

        let input = PipelineInput::new("test query");
        let mut ctx = OmegaMultimodalContext::default();

        // Create test image
        let img = image::ImageBuffer::from_fn(50, 50, |_, _| image::Rgb([128, 128, 128]));
        let dynamic_img = image::DynamicImage::ImageRgb8(img);
        let mut bytes = Vec::new();
        dynamic_img
            .write_to(
                &mut std::io::Cursor::new(&mut bytes),
                image::ImageFormat::Png,
            )
            .expect("should serialize test image to PNG bytes");

        ctx.image = Some(bytes);

        let result = processor.process_multimodal(&input, &ctx).await;
        assert!(result.is_ok());

        let processed_ctx = result.expect("multimodal processing should succeed");
        assert!(processed_ctx.vision_analysis.is_some());
        assert!(processed_ctx.fusion_result.is_some());
    }

    #[tokio::test]
    async fn test_stats() {
        let config = MultimodalConfig::default();
        let processor = OmegaMultimodalProcessor::new(config);

        let stats = processor.stats().await;
        assert!(stats.enabled);
        assert_eq!(stats.stored_images, 0);
        assert_eq!(stats.memory_capacity, 1000);
    }
}
