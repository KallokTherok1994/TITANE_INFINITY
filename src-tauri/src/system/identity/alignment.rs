// TITANE∞ v8.0 - Identity Engine: Alignment Refinement

pub fn refine_alignment(v: f64) -> f64 {
    (v * 0.9 + 0.05).clamp(0.0, 1.0)
}
