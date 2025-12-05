// TITANE∞ v8.0 - Adaptive Intelligence Engine: Metrics

pub struct AdaptiveMetrics {
    pub plasticity: f64,
    pub adaptation: f64,
    pub reserve: f64,
}
pub fn clamp01(v: f64) -> f64 {
    v.clamp(0.0, 1.0)
