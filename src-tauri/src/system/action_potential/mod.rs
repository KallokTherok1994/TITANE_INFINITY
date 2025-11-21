use crate::TitaneResult;
use crate::shared::utils::*;
use super::intention::IntentionState;
use super::strategic_intelligence::StrategicIntelligenceState;
use super::executive_flow::ExecutiveFlowState;
use super::central_governor::CentralGovernorState;
use super::architecture::ArchitectureState;
use super::harmonic_brain::HarmonicBrainState;
use super::sentient::SentientState;
use super::meta_integration::MetaIntegrationState;

mod collect;
mod compute;
mod threshold;
pub use threshold::ThresholdMemory;
pub struct ActionPotentialState {
    pub initialized: bool,
    pub activation_potential: f32,
    pub readiness_level: f32,
    pub expression_gate: f32,
    pub last_update: u64,
}
pub fn init() -> TitaneResult<ActionPotentialState> {
    Ok(ActionPotentialState {
        initialized: true,
        activation_potential: 0.5,
        readiness_level: 0.5,
        expression_gate: 0.5,
        last_update: 0,
    })
fn smooth(old: f64, new: f64, alpha: f64) -> f64 {
    let val = old * (1.0 - alpha) + new * alpha;
    val.clamp(0.0, 1.0)
pub fn tick(
    state: &mut ActionPotentialState,
    intention: &IntentionState,
    strategic: &StrategicIntelligenceState,
    executive: &ExecutiveFlowState,
    central: &CentralGovernorState,
    architecture: &ArchitectureState,
    harmonic: &HarmonicBrainState,
    sentient: &SentientState,
    meta: &MetaIntegrationState,
    thresholds: &mut ThresholdMemory,
) -> TitaneResult<()> {
    let inputs = collect::collect_action_inputs(
        intention,
        strategic,
        executive,
        central,
        architecture,
        harmonic,
        meta,
    )?;
    let baseline = thresholds.baseline_threshold();
    let (activation, readiness, expression) = compute::compute_action_potential(&inputs, baseline)?;
    thresholds.push(activation);
    state.activation_potential = smooth(state.activation_potential, activation, 0.25);
    state.readiness_level = smooth(state.readiness_level, readiness, 0.25);
    state.expression_gate = smooth(state.expression_gate, expression, 0.25);
    state.last_update = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64;
    Ok(())

}
