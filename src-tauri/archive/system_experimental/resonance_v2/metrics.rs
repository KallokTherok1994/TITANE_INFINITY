// TITANE∞ v8.0 - Resonance Engine v2: Metrics

pub struct ResonanceMetrics {
    pub resonance_index: f32,
    pub oscillation_index: f32,
    pub coherence_harmonic_index: f32,
}
pub fn clamp01(v: f32) -> f32 {
    v.clamp(0.0, 1.0)
