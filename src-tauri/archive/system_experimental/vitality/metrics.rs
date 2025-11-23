#[derive(Debug, Clone)]
pub struct VitalityMetrics {
    pub vitality: f32,
    pub flow: f32,
    pub tension: f32,
}

pub fn clamp01(v: f32) -> f32 {
    if v < 0.0 { 0.0 }
    else if v > 1.0 { 1.0 }
    else { v }
