use crate::core::backend::system::{
    vitality::VitalityState,
    harmonic_flow::HarmonicFlowState,
    adaptive_intelligence::AdaptiveIntelligenceState,
    resonance::ResonanceState,
    self_alignment::SelfAlignmentState,
};

use super::metrics::InnerDynamicsMetrics;
use super::compute::compute_inner_dynamics;
use super::directive::build_micro_directive;
pub mod metrics;
pub mod compute;
pub mod micro_balance;
pub mod directive;
#[derive(Debug, Clone)]
pub struct InnerDynamicsState {
    pub initialized: bool,
    pub micro_stability: f32,
    pub micro_balance: f32,
    pub micro_turbulence: f32,
    pub micro_directive: String,
    pub last_update: u64,
}
pub fn init() -> Result<InnerDynamicsState, String> {
    Ok(InnerDynamicsState {
        initialized: true,
        micro_stability: 0.5,
        micro_balance: 0.5,
        micro_turbulence: 0.5,
        micro_directive: String::new(),
        last_update: 0,
    })
fn smooth(a: f32, b: f32) -> f32 {
    (a * 0.88 + b * 0.12).clamp(0.0, 1.0)
pub fn tick(
    state: &mut InnerDynamicsState,
    vitality: &VitalityState,
    harmonic: &HarmonicFlowState,
    adaptive: &AdaptiveIntelligenceState,
    resonance: &ResonanceState,
    alignment: &SelfAlignmentState,
) -> Result<(), String> {
    let metrics: InnerDynamicsMetrics = compute_inner_dynamics(
        vitality,
        harmonic,
        adaptive,
        resonance,
        alignment,
    );
    state.micro_stability = smooth(state.micro_stability, metrics.micro_stability);
    state.micro_balance = smooth(state.micro_balance, metrics.micro_balance);
    state.micro_turbulence = smooth(state.micro_turbulence, metrics.micro_turbulence);
    state.micro_directive = build_micro_directive(
        state.micro_stability,
        state.micro_balance,
        state.micro_turbulence,
    state.last_update = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| format!("Time error: {}", e))?
        .as_millis() as u64;
    
    Ok(())

}
