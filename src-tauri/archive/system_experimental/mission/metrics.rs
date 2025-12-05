// TITANE∞ v8.0 - Mission Engine: Metrics
use crate::shared::utils::*;

pub struct MissionMetrics {
    pub axis: f32,
    pub vector: f32,
    pub coherence: f32,
}
pub fn clamp01(v: f32) -> f32 {
    v.clamp(0.0, 1.0)
