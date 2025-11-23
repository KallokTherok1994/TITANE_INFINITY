use crate::core::backend::system::{
    resonance::ResonanceState,
    vitality::VitalityState,
    adaptive_intelligence::AdaptiveIntelligenceState,
    self_alignment::SelfAlignmentState,
    evolution::OrganicEvolutionState,
};

use super::metrics::HarmonicMetrics;
use super::compute::compute_harmonic_flow;
use super::directive::build_harmonic_directive;
pub mod metrics;
pub mod compute;
pub mod stabilizer;
pub mod directive;
#[derive(Debug, Clone)]
pub struct HarmonicFlowState {
    pub initialized: bool,
    pub harmonic_index: f32,
    pub oscillation_balance: f32,
    pub turbulence_index: f32,
    pub harmonic_directive: String,
    pub last_update: u64,
}
pub fn init() -> Result<HarmonicFlowState, String> {
    Ok(HarmonicFlowState {
        initialized: true,
        harmonic_index: 0.5,
        oscillation_balance: 0.5,
        turbulence_index: 0.5,
        harmonic_directive: String::new(),
        last_update: 0,
    })
fn smooth(a: f32, b: f32) -> f32 {
    (a * 0.84 + b * 0.16).clamp(0.0, 1.0)
pub fn tick(
    state: &mut HarmonicFlowState,
    resonance: &ResonanceState,
    vitality: &VitalityState,
    adaptive: &AdaptiveIntelligenceState,
    alignment: &SelfAlignmentState,
    evolution: &OrganicEvolutionState,
) -> Result<(), String> {
    let metrics: HarmonicMetrics = compute_harmonic_flow(
        resonance,
        vitality,
        adaptive,
        alignment,
        evolution,
    );
    state.harmonic_index = smooth(state.harmonic_index, metrics.harmonic);
    state.oscillation_balance = smooth(state.oscillation_balance, metrics.balance);
    state.turbulence_index = smooth(state.turbulence_index, metrics.turbulence);
    state.harmonic_directive = build_harmonic_directive(
        state.harmonic_index,
        state.oscillation_balance,
        state.turbulence_index,
    state.last_update = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| format!("Time error: {}", e))?
        .as_millis() as u64;
    
    Ok(())

}
