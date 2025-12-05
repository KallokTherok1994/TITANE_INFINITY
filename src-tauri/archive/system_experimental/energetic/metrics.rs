use super::flow::FlowMetrics;
use super::pulse::PulseMetrics;
use super::rhythm::RhythmMetrics;

pub struct CombinedMetrics {
    pub energy: f64,
    pub phase: f64,
    pub stability: f64,
}
pub fn compute_combined(
    flow: &FlowMetrics,
    pulse: &PulseMetrics,
    rhythm: &RhythmMetrics,
) -> CombinedMetrics {
    let energy = (
        flow.energy * 0.40
        + pulse.intensity * 0.35
        + rhythm.activity_scale * 0.25
    ).clamp(0.0, 1.0);
    let phase = pulse.phase;
    let stability = (
        rhythm.stability * 0.60
        + flow.vitality * 0.25
        + (1.0 - flow.pressure) * 0.15
    CombinedMetrics {
        energy,
        phase,
        stability,
    }
