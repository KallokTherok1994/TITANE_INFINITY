use crate::system::executive_flow::ExecutiveFlowState;
use crate::system::central_governor::CentralGovernorState;
use crate::system::architecture::ArchitectureState;
use crate::system::meta_integration::MetaIntegrationState;
use crate::system::harmonic_brain::HarmonicBrainState;
use crate::system::sentient::SentientState;
use crate::system::evolution::EvolutionState;
use crate::system::continuum::ContinuumState;

mod collect;
mod compute;
mod trend;
pub use trend::TrendMemory;
pub struct StrategicIntelligenceState {
    pub initialized: bool,
    pub strategic_clarity: f32,
    pub directional_focus: f32,
    pub long_term_alignment: f32,
    pub last_update: u64,
}
pub fn init() -> Result<StrategicIntelligenceState, String> {
    Ok(StrategicIntelligenceState {
        initialized: true,
        strategic_clarity: 0.5,
        directional_focus: 0.5,
        long_term_alignment: 0.5,
        last_update: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map_err(|e| format!("Time error: {}", e))?
            .as_secs(),
    })
pub fn tick(
    state: &mut StrategicIntelligenceState,
    executive: &ExecutiveFlowState,
    central: &CentralGovernorState,
    architecture: &ArchitectureState,
    meta: &MetaIntegrationState,
    harmonic: &HarmonicBrainState,
    sentient: &SentientState,
    evolution: &EvolutionState,
    _continuum: &ContinuumState,
    trend_mem: &mut TrendMemory,
) -> Result<(), String> {
    let inputs = collect::collect_strategic_inputs(
        executive,
        central,
        architecture,
        meta,
        harmonic,
        sentient,
        evolution,
    )?;
    let trend_factor = trend_mem.trend_factor();
    let (strategic_clarity, directional_focus, long_term_alignment) =
        compute::compute_strategic_intelligence(&inputs, trend_factor)?;
    state.strategic_clarity = state.strategic_clarity * 0.8 + strategic_clarity * 0.2;
    state.directional_focus = state.directional_focus * 0.8 + directional_focus * 0.2;
    state.long_term_alignment = state.long_term_alignment * 0.8 + long_term_alignment * 0.2;
    state.strategic_clarity = state.strategic_clarity.clamp(0.0, 1.0);
    state.directional_focus = state.directional_focus.clamp(0.0, 1.0);
    state.long_term_alignment = state.long_term_alignment.clamp(0.0, 1.0);
    trend_mem.push(state.strategic_clarity);
    state.last_update = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| format!("Time error: {}", e))?
        .as_secs();
    Ok(())

}
