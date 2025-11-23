// TITANE∞ v8.0 - Identity Engine: Metrics

pub struct IdentityMetrics {
    pub core: f32,
    pub alignment: f32,
    pub continuity: f32,
}
pub fn clamp01(v: f32) -> f32 {
    v.clamp(0.0, 1.0)
