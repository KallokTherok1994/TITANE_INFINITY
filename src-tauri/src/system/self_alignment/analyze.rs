// TITANE∞ v8.0 - Self-Alignment Engine: Analysis

pub fn refine_value(v: f64) -> f64 {
    (v * 0.94 + 0.03).clamp(0.0, 1.0)
}
