#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   TITANE∞ MULTIMODAL ENGINE vΩ — SUPER PROMPT #15
//   Vision, Images, Audio 3D, Embeddings Multimodaux
// ═══════════════════════════════════════════════════════════════

pub mod vision;
pub mod vision_models;
pub mod image_embeddings;
pub mod image_memory;
pub mod audio3d;
pub mod multimodal_fusion;
pub mod multimodal_context;
pub mod multimodal_events;
pub mod diagnostics;
pub mod config;
pub mod commands; // SUPER PROMPT #15 - Phase 8

// Re-exports
pub use vision::*;
pub use vision_models::*;
pub use image_embeddings::*;
pub use image_memory::*;
pub use audio3d::*;
pub use multimodal_fusion::*;
pub use multimodal_context::*;
pub use multimodal_events::*;
pub use config::*;
pub use commands::*;
