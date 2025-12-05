// TITANE∞ v8.0 - Meaning Engine: Orientation Refinement

pub fn refine_orientation(ori: f64) -> f64 {
    (ori * 0.92 + 0.04).clamp(0.0, 1.0)
}
