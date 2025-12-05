pub fn compute_iscs(vitality: f32, harmonic: f32) -> f32 {
    ((vitality * 0.5 + harmonic * 0.5)).clamp(0.0, 1.0)
}
