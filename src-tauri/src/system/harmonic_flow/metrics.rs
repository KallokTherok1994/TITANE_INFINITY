#[derive(Debug, Clone)]
pub struct HarmonicMetrics {
    pub harmonic: f32,
    pub balance: f32,
    pub turbulence: f32,
}

pub fn clamp01(v: f32) -> f32 {
    if v < 0.0 { 0.0 }
    else if v > 1.0 { 1.0 }
    else { v }
