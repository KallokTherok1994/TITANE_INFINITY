use crate::system::central_governor::CentralGovernorState;
use crate::system::architecture::ArchitectureState;
use crate::system::harmonic_brain::HarmonicBrainState;
use crate::system::sentient::SentientState;
use crate::system::evolution::EvolutionState;
use crate::system::meta_integration::MetaIntegrationState;
use crate::system::continuum::ContinuumState;

mod collect;
mod compute;
mod alerts;
pub use alerts::AlertMemory;
pub struct ExecutiveFlowState {
    pub initialized: bool,
    pub executive_load: f32,
    pub priority_index: f32,
    pub alert_level: f32,
    pub last_update: u64,
}
pub fn init() -> Result<ExecutiveFlowState, String> {
    Ok(ExecutiveFlowState {
        initialized: true,
        executive_load: 0.5,
        priority_index: 0.5,
        alert_level: 0.5,
        last_update: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map_err(|e| format!("Time error: {}", e))?
            .as_secs(),
    })
pub fn tick(
    state: &mut ExecutiveFlowState,
    central: &CentralGovernorState,
    architecture: &ArchitectureState,
    harmonic: &HarmonicBrainState,
    sentient: &SentientState,
    _evolution: &EvolutionState,
    meta: &MetaIntegrationState,
    _continuum: &ContinuumState,
    alerts: &mut AlertMemory,
) -> Result<(), String> {
    let inputs = collect::collect_executive_inputs(
        central,
        architecture,
        harmonic,
        sentient,
        meta,
    )?;
    let alert_stability = alerts.alert_stability();
    let (executive_load, priority_index, alert_level) =
        compute::compute_executive_flow(&inputs, alert_stability)?;
    state.executive_load = state.executive_load * 0.8 + executive_load * 0.2;
    state.priority_index = state.priority_index * 0.8 + priority_index * 0.2;
    state.alert_level = state.alert_level * 0.8 + alert_level * 0.2;
    state.executive_load = state.executive_load.clamp(0.0, 1.0);
    state.priority_index = state.priority_index.clamp(0.0, 1.0);
    state.alert_level = state.alert_level.clamp(0.0, 1.0);
    alerts.push(state.alert_level);
    state.last_update = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| format!("Time error: {}", e))?
        .as_secs();
    Ok(())

}
