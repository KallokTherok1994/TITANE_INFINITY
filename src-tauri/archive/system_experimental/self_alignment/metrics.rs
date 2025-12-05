// TITANE∞ v8.0 - Self-Alignment Engine: Metrics

pub struct SelfAlignmentMetrics {
    pub alignment: f64,
    pub drift: f64,
    pub correction: f64,
}
pub fn clamp01(v: f64) -> f64 {
    v.clamp(0.0, 1.0)
