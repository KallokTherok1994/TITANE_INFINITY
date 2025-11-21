// TITANE∞ v8.0 - Mission Engine: Metrics

pub struct MissionMetrics {
    pub axis: f64,
    pub vector: f64,
    pub coherence: f64,
}

pub fn clamp01(v: f64) -> f64 {
    v.clamp(0.0, 1.0)
}
