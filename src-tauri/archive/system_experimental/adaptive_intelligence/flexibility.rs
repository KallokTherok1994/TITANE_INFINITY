// TITANE∞ v8.0 - Adaptive Intelligence Engine: Flexibility Refinement

pub fn refine_flexibility(v: f64) -> f64 {
    (v * 0.90 + 0.05).clamp(0.0, 1.0)
}
