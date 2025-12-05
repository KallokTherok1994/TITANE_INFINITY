#[derive(Debug, Clone)]
pub struct InnerDynamicsMetrics {
    pub micro_stability: f32,
    pub micro_balance: f32,
    pub micro_turbulence: f32,
}

pub fn clamp01(v: f32) -> f32 {
    if v < 0.0 { 0.0 }
    else if v > 1.0 { 1.0 }
    else { v }
