#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   MULTIMODAL CONTEXT — Unified Context for OMEGA
//   SUPER PROMPT #15
// ═══════════════════════════════════════════════════════════════

use crate::multimodal::audio3d::Audio3DAnalysis;
use crate::multimodal::vision::VisionAnalysis;
use serde::{Deserialize, Serialize};

/// Multimodal Context (enriched for OMEGA Pipeline)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MultimodalContext {
    /// Text input (original)
    pub text: Option<String>,
    
    /// Vision analysis (if image provided)
    pub vision: Option<VisionAnalysis>,
    
    /// Audio 3D analysis (if audio provided)
    pub audio3d: Option<Audio3DAnalysis>,
    
    /// Vector search results (cross-modal)
    pub vector_hits: Vec<MultimodalMemoryHit>,
    
    /// Fusion metadata
    pub fusion_metadata: FusionMetadata,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MultimodalMemoryHit {
    pub id: String,
    pub score: f32,
    pub modality: Modality,
    pub content: String,
    pub metadata: serde_json::Value,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum Modality {
    Text,
    Image,
    Audio,
    Video,
    Hybrid,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FusionMetadata {
    pub primary_modality: Modality,
    pub secondary_modalities: Vec<Modality>,
    pub confidence: f32,
    pub timestamp: i64,
}

impl MultimodalContext {
    pub fn new() -> Self {
        Self {
            text: None,
            vision: None,
            audio3d: None,
            vector_hits: vec![],
            fusion_metadata: FusionMetadata {
                primary_modality: Modality::Text,
                secondary_modalities: vec![],
                confidence: 1.0,
                timestamp: chrono::Utc::now().timestamp(),
            },
        }
    }
    
    pub fn with_text(mut self, text: String) -> Self {
        self.text = Some(text);
        self.fusion_metadata.primary_modality = Modality::Text;
        self
    }
    
    pub fn with_vision(mut self, vision: VisionAnalysis) -> Self {
        self.vision = Some(vision);
        self.fusion_metadata.secondary_modalities.push(Modality::Image);
        self
    }
    
    pub fn with_audio3d(mut self, audio3d: Audio3DAnalysis) -> Self {
        self.audio3d = Some(audio3d);
        self.fusion_metadata.secondary_modalities.push(Modality::Audio);
        self
    }
    
    pub fn add_vector_hit(&mut self, hit: MultimodalMemoryHit) {
        self.vector_hits.push(hit);
    }
    
    pub fn is_multimodal(&self) -> bool {
        !self.fusion_metadata.secondary_modalities.is_empty()
    }
    
    pub fn modality_count(&self) -> usize {
        1 + self.fusion_metadata.secondary_modalities.len()
    }
}

impl Default for MultimodalContext {
    fn default() -> Self {
        Self::new()
    }
}
