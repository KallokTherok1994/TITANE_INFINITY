// TITANE∞ v8.0 - Conscience Engine: Insight Refinement

pub fn refine_insight(v: f64) -> f64 {
    (v * 0.90 + 0.05).clamp(0.0, 1.0)
}
