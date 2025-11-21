use crate::core::backend::system::{
    identity::IdentityState,
    resonance::ResonanceState,
    conscience::ConscienceState,
    adaptive_intelligence::AdaptiveIntelligenceState,
    self_alignment::SelfAlignmentState,
    evolution::OrganicEvolutionState,
};

use super::metrics::VitalityMetrics;
use super::compute::compute_vitality;
use super::directive::build_energy_directive;
pub mod metrics;
pub mod compute;
pub mod regulation;
pub mod directive;
#[derive(Debug, Clone)]
pub struct VitalityState {
    pub initialized: bool,
    pub vitality_index: f32,
    pub energy_flow: f32,
    pub tension_index: f32,
    pub energy_directive: String,
    pub last_update: u64,
}
pub fn init() -> Result<VitalityState, String> {
    Ok(VitalityState {
        initialized: true,
        vitality_index: 0.5,
        energy_flow: 0.5,
        tension_index: 0.5,
        energy_directive: String::new(),
        last_update: 0,
    })
fn smooth(a: f32, b: f32) -> f32 {
    (a * 0.82 + b * 0.18).clamp(0.0, 1.0)
pub fn tick(
    state: &mut VitalityState,
    identity: &IdentityState,
    resonance: &ResonanceState,
    conscience: &ConscienceState,
    adaptive: &AdaptiveIntelligenceState,
    alignment: &SelfAlignmentState,
    evolution: &OrganicEvolutionState,
) -> Result<(), String> {
    let metrics: VitalityMetrics = compute_vitality(
        identity,
        resonance,
        conscience,
        adaptive,
        alignment,
        evolution,
    );
    state.vitality_index = smooth(state.vitality_index, metrics.vitality);
    state.energy_flow = smooth(state.energy_flow, metrics.flow);
    state.tension_index = smooth(state.tension_index, metrics.tension);
    state.energy_directive = build_energy_directive(
        state.vitality_index,
        state.energy_flow,
        state.tension_index,
    state.last_update = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| format!("Time error: {}", e))?
        .as_millis() as u64;
    
    Ok(())

}
