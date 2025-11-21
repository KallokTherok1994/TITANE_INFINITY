// TITANE∞ v8.0 - Resonance Engine v2: Metrics

pub struct ResonanceMetrics {
    pub resonance_index: f64,
    pub oscillation_index: f64,
    pub coherence_harmonic_index: f64,
}

pub fn clamp01(v: f64) -> f64 {
    v.clamp(0.0, 1.0)
}
