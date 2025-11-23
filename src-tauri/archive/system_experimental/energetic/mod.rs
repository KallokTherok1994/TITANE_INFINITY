use crate::TitaneResult;
use crate::shared::utils::*;
use super::sentient::SentientState;
use super::harmonic_brain::HarmonicBrainState;
use super::meta_integration::MetaIntegrationState;
use super::architecture::ArchitectureState;
use super::strategic_intelligence::StrategicIntelligenceState;
use super::intention::IntentionState;
use super::action_potential::ActionPotentialState;
use super::executive_flow::ExecutiveFlowState;
use super::central_governor::CentralGovernorState;
use super::evolution::EvolutionState;
use super::continuum::ContinuumState;
use super::self_healing_v2::SelfHealingState;

mod flow;
mod pulse;
mod rhythm;
mod metrics;
use flow::FlowMetrics;
use pulse::PulseMetrics;
use rhythm::RhythmMetrics;
pub struct EnergeticState {
    pub initialized: bool,
    pub energy_level: f64,
    pub pulse_phase: f64,
    pub rhythmic_stability: f64,
    pub last_update: u64,
}
pub fn init() -> TitaneResult<EnergeticState> {
    Ok(EnergeticState {
        initialized: true,
        energy_level: 0.60,
        pulse_phase: 0.0,
        rhythmic_stability: 0.75,
        last_update: 0,
    })
fn smooth(old: f64, new: f64, alpha: f64) -> f64 {
    let val = old * (1.0 - alpha) + new * alpha;
    val.clamp(0.0, 1.0)
pub fn tick(
    state: &mut EnergeticState,
    sentient: &SentientState,
    harmonic: &HarmonicBrainState,
    meta: &MetaIntegrationState,
    architecture: &ArchitectureState,
    strategic: &StrategicIntelligenceState,
    intention: &IntentionState,
    action: &ActionPotentialState,
    executive: &ExecutiveFlowState,
    central: &CentralGovernorState,
    evolution: &EvolutionState,
    continuum_state: &ContinuumState,
    healing: &SelfHealingState,
) -> TitaneResult<()> {
    let now_ms = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64;
    let flow = flow::compute_flow(
        sentient,
        harmonic,
        meta,
        architecture,
        strategic,
        intention,
        action,
        executive,
        central,
        evolution,
        continuum_state,
        healing,
    );
    let pulse_val = pulse::compute_pulse(now_ms, &flow);
    let rhythm = rhythm::compute_rhythm(
    let combined = metrics::compute_combined(&flow, &pulse_val, &rhythm);
    state.energy_level = smooth(state.energy_level, combined.energy, 0.25);
    state.pulse_phase = smooth(state.pulse_phase, combined.phase, 0.20);
    state.rhythmic_stability = smooth(state.rhythmic_stability, combined.stability, 0.15);
    state.last_update = now_ms;
    Ok(())

}
