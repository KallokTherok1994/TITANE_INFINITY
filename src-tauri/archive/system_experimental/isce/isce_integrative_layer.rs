pub fn integrate_signals(vitality: f32, harmonic: f32, cognitive: f32) -> f32 {
    (vitality * 0.33 + harmonic * 0.33 + cognitive * 0.34).clamp(0.0, 1.0)
}
