#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   AGI CORE — MULTIMODAL PERCEPTION vΩ
//   SUPER PROMPT #15 — PHASE 7 COMPLETE
//   Extends AGI Core with multimodal perceptive capabilities
// ═══════════════════════════════════════════════════════════════

use crate::agi_core::{AGIContext, AGIError};
use crate::multimodal::vision::VisionAnalysis;
use crate::multimodal::audio3d::Audio3DAnalysis;
use crate::multimodal::multimodal_fusion::FusionResult;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Extended AGI Context with multimodal perception
#[derive(Clone, Debug, Default)]
pub struct MultimodalAGIContext {
    /// Base AGI context
    pub base: AGIContext,
    /// Vision perception
    pub vision: Option<VisionAnalysis>,
    /// Audio perception
    pub audio: Option<Audio3DAnalysis>,
    /// Fusion result
    pub fusion: Option<FusionResult>,
    /// Perceptual confidence (0.0 - 1.0)
    pub perceptual_confidence: f32,
    /// Cross-modal insights
    pub cross_modal_insights: Vec<String>,
}

impl MultimodalAGIContext {
    pub fn new() -> Self {
        Self::default()
    }

    /// Create from base AGI context
    pub fn from_base(base: AGIContext) -> Self {
        Self {
            base,
            ..Default::default()
        }
    }

    /// Add vision perception
    pub fn with_vision(mut self, vision: VisionAnalysis) -> Self {
        self.vision = Some(vision);
        self.update_perceptual_confidence();
        self
    }

    /// Add audio perception
    pub fn with_audio(mut self, audio: Audio3DAnalysis) -> Self {
        self.audio = Some(audio);
        self.update_perceptual_confidence();
        self
    }

    /// Add fusion result
    pub fn with_fusion(mut self, fusion: FusionResult) -> Self {
        self.fusion = Some(fusion);
        self.update_perceptual_confidence();
        self
    }

    /// Update perceptual confidence based on available modalities
    fn update_perceptual_confidence(&mut self) {
        let mut total_confidence = 0.0;
        let mut count = 0.0;

        if let Some(ref vision) = self.vision {
            // Vision quality metric
            let vision_quality = (vision.brightness + vision.contrast) / 2.0;
            total_confidence += vision_quality;
            count += 1.0;
        }

        if let Some(ref audio) = self.audio {
            total_confidence += audio.intensity;
            count += 1.0;
        }

        if let Some(ref fusion) = self.fusion {
            total_confidence += fusion.confidence;
            count += 1.0;
        }

        self.perceptual_confidence = if count > 0.0 {
            total_confidence / count
        } else {
            0.0
        };
    }

    /// Check if context has multimodal data
    pub fn is_multimodal(&self) -> bool {
        self.vision.is_some() || self.audio.is_some() || self.fusion.is_some()
    }

    /// Get dominant modality
    pub fn dominant_modality(&self) -> Option<String> {
        self.fusion.as_ref().map(|f| format!("{:?}", f.dominant_modality))
    }
}

/// Multimodal Perceptive Introspection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerceptiveIntrospection {
    /// Has visual perception
    pub has_vision: bool,
    /// Has audio perception
    pub has_audio: bool,
    /// Perceptual quality score (0.0 - 1.0)
    pub perceptual_quality: f32,
    /// Perceptual conflicts detected
    pub conflicts: Vec<String>,
    /// Perceptual insights
    pub insights: Vec<String>,
    /// Cross-modal consistency score
    pub consistency_score: f32,
}

impl Default for PerceptiveIntrospection {
    fn default() -> Self {
        Self {
            has_vision: false,
            has_audio: false,
            perceptual_quality: 0.0,
            conflicts: vec![],
            insights: vec![],
            consistency_score: 1.0,
        }
    }
}

/// Multimodal Perception Engine for AGI Core
pub struct MultimodalPerceptionEngine {
    /// Enable vision processing
    vision_enabled: bool,
    /// Enable audio processing
    audio_enabled: bool,
    /// Perceptual confidence threshold
    confidence_threshold: f32,
}

impl MultimodalPerceptionEngine {
    pub fn new(vision_enabled: bool, audio_enabled: bool, confidence_threshold: f32) -> Self {
        Self {
            vision_enabled,
            audio_enabled,
            confidence_threshold,
        }
    }

    /// Perform perceptive introspection on multimodal context
    pub async fn introspect(&self, context: &MultimodalAGIContext) -> PerceptiveIntrospection {
        let mut introspection = PerceptiveIntrospection::default();

        introspection.has_vision = context.vision.is_some();
        introspection.has_audio = context.audio.is_some();

        // Calculate perceptual quality
        introspection.perceptual_quality = context.perceptual_confidence;

        // Detect conflicts
        introspection.conflicts = self.detect_conflicts(context).await;

        // Generate insights
        introspection.insights = self.generate_insights(context).await;

        // Calculate cross-modal consistency
        introspection.consistency_score = self.calculate_consistency(context).await;

        introspection
    }

    /// Detect conflicts between modalities
    async fn detect_conflicts(&self, context: &MultimodalAGIContext) -> Vec<String> {
        let mut conflicts = Vec::new();

        // Example: Check if fusion confidence is low (indicating conflict)
        if let Some(ref fusion) = context.fusion {
            if fusion.confidence < 0.5 {
                conflicts.push(format!(
                    "Low fusion confidence ({:.2}) suggests modality conflict",
                    fusion.confidence
                ));
            }
        }

        // Example: Check vision quality
        if let Some(ref vision) = context.vision {
            if vision.brightness < 0.2 {
                conflicts.push("Low image brightness may affect perception quality".to_string());
            }
            if vision.contrast < 0.3 {
                conflicts.push("Low image contrast may affect feature detection".to_string());
            }
        }

        // Example: Check audio intensity
        if let Some(ref audio) = context.audio {
            if audio.intensity < 0.1 {
                conflicts.push("Low audio intensity may affect perception".to_string());
            }
        }

        conflicts
    }

    /// Generate perceptual insights
    async fn generate_insights(&self, context: &MultimodalAGIContext) -> Vec<String> {
        let mut insights = Vec::new();

        // Vision insights
        if let Some(ref vision) = context.vision {
            insights.push(format!(
                "Image: {}x{}, {} format, brightness={:.2}, contrast={:.2}",
                vision.width, vision.height, vision.format, vision.brightness, vision.contrast
            ));

            if !vision.dominant_colors.is_empty() {
                insights.push(format!(
                    "Dominant colors: {} detected",
                    vision.dominant_colors.len()
                ));
            }

            insights.push(format!(
                "Visual features: {} dimensions",
                vision.features.len()
            ));
        }

        // Audio insights
        if let Some(ref audio) = context.audio {
            insights.push(format!(
                "Audio: intensity={:.2}, {} frequency bands",
                audio.intensity,
                audio.frequency_bands.len()
            ));

            if let Some(ref spatial) = audio.spatial_position {
                insights.push(format!(
                    "Spatial audio: azimuth={:.1}°, elevation={:.1}°, distance={:.2}m",
                    spatial.azimuth, spatial.elevation, spatial.distance
                ));
            }
        }

        // Fusion insights
        if let Some(ref fusion) = context.fusion {
            insights.push(format!(
                "Multimodal fusion: confidence={:.2}, dominant={:?}",
                fusion.confidence, fusion.dominant_modality
            ));

            if let Some(text_weight) = fusion.modality_weights.get("text") {
                if let Some(vision_weight) = fusion.modality_weights.get("vision") {
                    if let Some(audio_weight) = fusion.modality_weights.get("audio") {
                        insights.push(format!(
                            "Modality weights: text={:.2}, vision={:.2}, audio={:.2}",
                            text_weight, vision_weight, audio_weight
                        ));
                    }
                }
            }
        }

        insights
    }

    /// Calculate cross-modal consistency
    async fn calculate_consistency(&self, context: &MultimodalAGIContext) -> f32 {
        if !context.is_multimodal() {
            return 1.0; // No multimodal data = no inconsistency
        }

        // Use fusion confidence as consistency metric
        if let Some(ref fusion) = context.fusion {
            fusion.confidence
        } else {
            // If no fusion but has multiple modalities, assume moderate consistency
            if context.vision.is_some() && context.audio.is_some() {
                0.7
            } else {
                1.0
            }
        }
    }

    /// Enhance reasoning with perceptual data
    pub async fn enhance_reasoning(
        &self,
        context: &MultimodalAGIContext,
        reasoning_input: &str,
    ) -> Result<String, AGIError> {
        let mut enhanced = reasoning_input.to_string();

        // Add vision context
        if let Some(ref vision) = context.vision {
            enhanced.push_str(&format!(
                "\n[VISUAL CONTEXT] Image: {}x{}, brightness={:.2}, {} dominant colors detected",
                vision.width, vision.height, vision.brightness, vision.dominant_colors.len()
            ));
        }

        // Add audio context
        if let Some(ref audio) = context.audio {
            enhanced.push_str(&format!(
                "\n[AUDIO CONTEXT] Intensity={:.2}, spatial position available: {}",
                audio.intensity,
                audio.spatial_position.is_some()
            ));
        }

        // Add fusion context
        if let Some(ref fusion) = context.fusion {
            enhanced.push_str(&format!(
                "\n[MULTIMODAL FUSION] Confidence={:.2}, dominant={:?}",
                fusion.confidence, fusion.dominant_modality
            ));
        }

        Ok(enhanced)
    }

    /// Learn from multimodal interaction
    pub async fn meta_learn_multimodal(
        &self,
        context: &MultimodalAGIContext,
        outcome_success: bool,
    ) -> Vec<String> {
        let mut lessons = Vec::new();

        if !context.is_multimodal() {
            return lessons;
        }

        // Learn from successful multimodal interactions
        if outcome_success {
            if context.perceptual_confidence > 0.8 {
                lessons.push("High perceptual confidence correlates with success".to_string());
            }

            if let Some(ref fusion) = context.fusion {
                if fusion.confidence > 0.7 {
                    lessons.push(format!(
                        "Effective fusion with dominant modality {:?}",
                        fusion.dominant_modality
                    ));
                }
            }
        } else {
            // Learn from failures
            if context.perceptual_confidence < 0.5 {
                lessons.push("Low perceptual confidence may indicate insufficient sensory data".to_string());
            }

            if let Some(ref vision) = context.vision {
                if vision.brightness < 0.3 || vision.contrast < 0.3 {
                    lessons.push("Poor image quality may require preprocessing or rejection".to_string());
                }
            }
        }

        lessons
    }

    /// Suggest perceptual improvements
    pub async fn suggest_improvements(&self, context: &MultimodalAGIContext) -> Vec<String> {
        let mut suggestions = Vec::new();

        // Vision improvements
        if let Some(ref vision) = context.vision {
            if vision.brightness < 0.4 {
                suggestions.push("Consider brightness adjustment or better lighting".to_string());
            }
            if vision.contrast < 0.4 {
                suggestions.push("Consider contrast enhancement or histogram equalization".to_string());
            }
        }

        // Audio improvements
        if let Some(ref audio) = context.audio {
            if audio.intensity < 0.2 {
                suggestions.push("Consider audio amplification or noise reduction".to_string());
            }
        }

        // Fusion improvements
        if let Some(ref fusion) = context.fusion {
            if fusion.confidence < 0.6 {
                suggestions.push("Consider adjusting modality weights for better fusion".to_string());
            }
        }

        // General improvements
        if !context.is_multimodal() && (self.vision_enabled || self.audio_enabled) {
            suggestions.push("Enable multimodal inputs for richer perception".to_string());
        }

        suggestions
    }
}

/// Statistics for multimodal perception
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MultimodalPerceptionStats {
    pub total_perceptions: usize,
    pub vision_count: usize,
    pub audio_count: usize,
    pub fusion_count: usize,
    pub avg_perceptual_quality: f32,
    pub avg_consistency: f32,
    pub conflicts_detected: usize,
}

impl Default for MultimodalPerceptionStats {
    fn default() -> Self {
        Self {
            total_perceptions: 0,
            vision_count: 0,
            audio_count: 0,
            fusion_count: 0,
            avg_perceptual_quality: 0.0,
            avg_consistency: 1.0,
            conflicts_detected: 0,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::multimodal::audio3d::SpatialPosition;

    fn create_test_vision() -> VisionAnalysis {
        VisionAnalysis {
            image_id: "test_001".to_string(),
            width: 640,
            height: 480,
            format: "PNG".to_string(),
            brightness: 0.7,
            contrast: 0.6,
            features: vec![0.1; 100],
            dominant_colors: vec![(128, 128, 128), (200, 200, 200)],
            clusters: vec![],
        }
    }

    fn create_test_audio() -> Audio3DAnalysis {
        Audio3DAnalysis {
            intensity: 0.8,
            frequency_bands: vec![0.1, 0.2, 0.3, 0.4, 0.5],
            spatial_position: Some(SpatialPosition {
                azimuth: 45.0,
                elevation: 15.0,
                distance: 2.5,
            }),
            is_speech: false,
        }
    }

    #[tokio::test]
    async fn test_multimodal_context_creation() {
        let base = AGIContext::default();
        let context = MultimodalAGIContext::from_base(base);

        assert!(!context.is_multimodal());
        assert_eq!(context.perceptual_confidence, 0.0);
    }

    #[tokio::test]
    async fn test_context_with_vision() {
        let base = AGIContext::default();
        let vision = create_test_vision();
        let context = MultimodalAGIContext::from_base(base).with_vision(vision);

        assert!(context.is_multimodal());
        assert!(context.perceptual_confidence > 0.0);
    }

    #[tokio::test]
    async fn test_context_with_audio() {
        let base = AGIContext::default();
        let audio = create_test_audio();
        let context = MultimodalAGIContext::from_base(base).with_audio(audio);

        assert!(context.is_multimodal());
        assert!(context.perceptual_confidence > 0.0);
    }

    #[tokio::test]
    async fn test_perceptive_introspection() {
        let engine = MultimodalPerceptionEngine::new(true, true, 0.7);
        let base = AGIContext::default();
        let vision = create_test_vision();
        let audio = create_test_audio();
        let context = MultimodalAGIContext::from_base(base)
            .with_vision(vision)
            .with_audio(audio);

        let introspection = engine.introspect(&context).await;

        assert!(introspection.has_vision);
        assert!(introspection.has_audio);
        assert!(introspection.perceptual_quality > 0.0);
        assert!(!introspection.insights.is_empty());
    }

    #[tokio::test]
    async fn test_conflict_detection() {
        let engine = MultimodalPerceptionEngine::new(true, true, 0.7);
        let base = AGIContext::default();

        // Create low-quality vision
        let mut vision = create_test_vision();
        vision.brightness = 0.1; // Very low brightness
        vision.contrast = 0.2; // Low contrast

        let context = MultimodalAGIContext::from_base(base).with_vision(vision);
        let introspection = engine.introspect(&context).await;

        assert!(!introspection.conflicts.is_empty());
    }

    #[tokio::test]
    async fn test_enhanced_reasoning() {
        let engine = MultimodalPerceptionEngine::new(true, true, 0.7);
        let base = AGIContext::default();
        let vision = create_test_vision();
        let context = MultimodalAGIContext::from_base(base).with_vision(vision);

        let enhanced = engine
            .enhance_reasoning(&context, "What do you see?")
            .await
            .expect("should enhance reasoning with multimodal context");

        assert!(enhanced.contains("VISUAL CONTEXT"));
        assert!(enhanced.contains("640x480"));
    }

    #[tokio::test]
    async fn test_meta_learning_success() {
        let engine = MultimodalPerceptionEngine::new(true, true, 0.7);
        let base = AGIContext::default();
        let vision = create_test_vision();
        let audio = create_test_audio();
        let context = MultimodalAGIContext::from_base(base)
            .with_vision(vision)
            .with_audio(audio);

        let lessons = engine.meta_learn_multimodal(&context, true).await;

        assert!(!lessons.is_empty());
        // Should learn positive lessons from success
        assert!(lessons.iter().any(|l| l.contains("confidence")));
    }

    #[tokio::test]
    async fn test_improvement_suggestions() {
        let engine = MultimodalPerceptionEngine::new(true, true, 0.7);
        let base = AGIContext::default();

        // Create low-quality vision
        let mut vision = create_test_vision();
        vision.brightness = 0.3;
        vision.contrast = 0.2;

        let context = MultimodalAGIContext::from_base(base).with_vision(vision);
        let suggestions = engine.suggest_improvements(&context).await;

        assert!(!suggestions.is_empty());
        assert!(suggestions.iter().any(|s| s.contains("brightness") || s.contains("contrast")));
    }

    #[tokio::test]
    async fn test_consistency_calculation() {
        let engine = MultimodalPerceptionEngine::new(true, true, 0.7);

        // Test 1: No multimodal data
        let base = AGIContext::default();
        let context1 = MultimodalAGIContext::from_base(base);
        let introspection1 = engine.introspect(&context1).await;
        assert_eq!(introspection1.consistency_score, 1.0);

        // Test 2: With vision
        let base2 = AGIContext::default();
        let vision = create_test_vision();
        let context2 = MultimodalAGIContext::from_base(base2).with_vision(vision);
        let introspection2 = engine.introspect(&context2).await;
        assert!(introspection2.consistency_score > 0.0);
    }
}
