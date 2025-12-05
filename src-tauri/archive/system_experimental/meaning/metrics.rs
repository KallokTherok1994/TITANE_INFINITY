// TITANE∞ v8.0 - Meaning Engine: Metrics

pub struct MeaningMetrics {
    pub alignment: f64,
    pub depth: f64,
    pub orientation: f64,
}
pub fn clamp01(v: f64) -> f64 {
    v.clamp(0.0, 1.0)
