// TITANE∞ v8.0 - Governor Engine: Metrics

pub struct GovernorMetrics {
    pub regulation: f32,
    pub deviation: f32,
    pub homeostasis: f64,
}
pub fn clamp01(v: f64) -> f64 {
    v.clamp(0.0, 1.0)
