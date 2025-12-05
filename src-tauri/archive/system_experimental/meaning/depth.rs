// TITANE∞ v8.0 - Meaning Engine: Depth Refinement

pub fn refine_depth(depth: f64) -> f64 {
    (depth * 0.9 + 0.05).clamp(0.0, 1.0)
}
