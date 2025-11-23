use crate::system::harmonic_brain::HarmonicBrainState;
use crate::system::sentient::SentientState;
use crate::system::evolution::EvolutionState;
use crate::system::adaptive_intelligence::AdaptiveIntelligenceState;
use crate::system::conscience::ConscienceState;
use crate::system::metacortex::MetaCortexState;
use crate::system::continuum::ContinuumState;

mod collect;
mod compute;
mod alignment;
pub use alignment::AlignmentMemory;
pub struct MetaIntegrationState {
    pub initialized: bool,
    pub global_integration: f32,
    pub systemic_coherence: f32,
    pub alignment_index: f32,
    pub last_update: u64,
}
pub fn init() -> Result<MetaIntegrationState, String> {
    Ok(MetaIntegrationState {
        initialized: true,
        global_integration: 0.5,
        systemic_coherence: 0.5,
        alignment_index: 0.5,
        last_update: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map_err(|e| format!("Time error: {}", e))?
            .as_secs(),
    })
pub fn tick(
    state: &mut MetaIntegrationState,
    harmonic: &HarmonicBrainState,
    sentient: &SentientState,
    evolution: &EvolutionState,
    adaptive: &AdaptiveIntelligenceState,
    conscience: &ConscienceState,
    metacortex: &MetaCortexState,
    _continuum: &ContinuumState,
    alignment_mem: &mut AlignmentMemory,
) -> Result<(), String> {
    let inputs = collect::collect_meta_inputs(
        harmonic,
        sentient,
        evolution,
        adaptive,
        conscience,
        metacortex,
    )?;
    let alignment_stability = alignment_mem.stability();
    let (global_integration, systemic_coherence, alignment_index) =
        compute::compute_meta_integration(&inputs, alignment_stability)?;
    state.global_integration = state.global_integration * 0.8 + global_integration * 0.2;
    state.systemic_coherence = state.systemic_coherence * 0.8 + systemic_coherence * 0.2;
    state.alignment_index = state.alignment_index * 0.8 + alignment_index * 0.2;
    state.global_integration = state.global_integration.clamp(0.0, 1.0);
    state.systemic_coherence = state.systemic_coherence.clamp(0.0, 1.0);
    state.alignment_index = state.alignment_index.clamp(0.0, 1.0);
    alignment_mem.push(state.global_integration);
    state.last_update = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| format!("Time error: {}", e))?
        .as_secs();
    Ok(())

}
