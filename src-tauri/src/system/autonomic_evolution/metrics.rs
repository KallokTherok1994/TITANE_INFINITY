// TITANE∞ v10.4 - Autonomic Evolution Supervisor: Metrics (f32 normalized)

pub struct AutonomicEvolutionMetrics {
    pub stability: f32,
    pub coherence: f32,
    pub drift_risk: f32,
}
pub fn clamp01(v: f32) -> f32 {
    v.clamp(0.0, 1.0)
