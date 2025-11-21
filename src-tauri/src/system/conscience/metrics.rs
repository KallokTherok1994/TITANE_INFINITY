// TITANE∞ v8.0 - Conscience Engine: Metrics

pub struct ConscienceMetrics {
    pub clarity: f64,
    pub coherence: f64,
    pub insight: f64,
}
pub fn clamp01(v: f64) -> f64 {
    v.clamp(0.0, 1.0)
