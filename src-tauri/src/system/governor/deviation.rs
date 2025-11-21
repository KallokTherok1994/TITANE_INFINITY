// TITANE∞ v8.0 - Governor Engine: Deviation Refinement

pub fn refine_deviation(v: f64) -> f64 {
    (v * 0.9 + 0.05).clamp(0.0, 1.0)
}
