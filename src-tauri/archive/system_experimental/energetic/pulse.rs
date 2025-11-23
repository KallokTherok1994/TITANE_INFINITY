use super::flow::FlowMetrics;

pub struct PulseMetrics {
    pub phase: f64,
    pub intensity: f64,
}
pub fn compute_pulse(now_ms: u64, flow: &FlowMetrics) -> PulseMetrics {
    let period_ms = 8000_u64;
    let angle = ((now_ms % period_ms) as f64 / period_ms as f64) * std::f64::consts::TAU;
    let phase = (angle.sin() * 0.5 + 0.5).clamp(0.0, 1.0);
    let intensity = (
        flow.energy * 0.40
        + flow.pressure * 0.35
        + flow.vitality * 0.25
    ).clamp(0.0, 1.0);
    PulseMetrics { phase, intensity }
