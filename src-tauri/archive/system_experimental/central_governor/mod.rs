use crate::system::governor::GovernorState;
use crate::system::stability::StabilityState;
use crate::system::architecture::ArchitectureState;
use crate::system::meta_integration::MetaIntegrationState;
use crate::system::harmonic_brain::HarmonicBrainState;
use crate::system::sentient::SentientState;
use crate::system::evolution::EvolutionState;
use crate::system::adaptive::AdaptiveIntelligenceState;
use crate::system::conscience::ConscienceState;
use crate::system::continuum::ContinuumState;

mod collect;
mod compute;
mod profile;
pub use profile::RegulationProfileMemory;
pub struct CentralGovernorState {
    pub initialized: bool,
    pub regulation_profile: f32,
    pub safety_margin: f32,
    pub adaptive_stability: f32,
    pub last_update: u64,
}
pub fn init() -> Result<CentralGovernorState, String> {
    Ok(CentralGovernorState {
        initialized: true,
        regulation_profile: 0.5,
        safety_margin: 0.5,
        adaptive_stability: 0.5,
        last_update: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map_err(|e| format!("Time error: {}", e))?
            .as_secs(),
    })
pub fn tick(
    state: &mut CentralGovernorState,
    governor: &GovernorState,
    stability: &StabilityState,
    architecture: &ArchitectureState,
    meta: &MetaIntegrationState,
    harmonic: &HarmonicBrainState,
    sentient: &SentientState,
    evolution: &EvolutionState,
    adaptive: &AdaptiveIntelligenceState,
    conscience: &ConscienceState,
    _continuum: &ContinuumState,
    profile_mem: &mut RegulationProfileMemory,
) -> Result<(), String> {
    let inputs = collect::collect_central_inputs(
        governor,
        stability,
        architecture,
        meta,
        harmonic,
        sentient,
        evolution,
        adaptive,
        conscience,
    )?;
    let profile_stability = profile_mem.profile_stability();
    let (regulation_profile, safety_margin, adaptive_stability) =
        compute::compute_central_governor(&inputs, profile_stability)?;
    state.regulation_profile = state.regulation_profile * 0.75 + regulation_profile * 0.25;
    state.safety_margin = state.safety_margin * 0.75 + safety_margin * 0.25;
    state.adaptive_stability = state.adaptive_stability * 0.75 + adaptive_stability * 0.25;
    state.regulation_profile = state.regulation_profile.clamp(0.0, 1.0);
    state.safety_margin = state.safety_margin.clamp(0.0, 1.0);
    state.adaptive_stability = state.adaptive_stability.clamp(0.0, 1.0);
    profile_mem.push(state.regulation_profile);
    state.last_update = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| format!("Time error: {}", e))?
        .as_secs();
    Ok(())

}
