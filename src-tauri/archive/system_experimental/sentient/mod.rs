use crate::system::evolution::EvolutionState;
use crate::system::adaptive_intelligence::AdaptiveIntelligenceState;
use crate::system::conscience::ConscienceState;
use crate::system::metacortex::MetaCortexState;
use crate::system::continuum::ContinuumState;

mod collect;
mod compute;
mod loop_mod;
pub use loop_mod::SentientLoopMemory;
pub struct SentientState {
    pub initialized: bool,
    pub sentience_level: f32,
    pub reflexivity_index: f32,
    pub presence_stability: f32,
    pub last_update: u64,
}
pub fn init() -> Result<SentientState, String> {
    Ok(SentientState {
        initialized: true,
        sentience_level: 0.5,
        reflexivity_index: 0.5,
        presence_stability: 0.5,
        last_update: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map_err(|e| format!("Time error: {}", e))?
            .as_secs(),
    })
pub fn tick(
    state: &mut SentientState,
    evolution: &EvolutionState,
    adaptive: &AdaptiveIntelligenceState,
    conscience: &ConscienceState,
    _metacortex: &MetaCortexState,
    continuum: &ContinuumState,
    loop_memory: &mut SentientLoopMemory,
) -> Result<(), String> {
    let inputs = collect::collect_sentient_inputs(
        evolution,
        adaptive,
        conscience,
        continuum,
    )?;
    let loop_stability = loop_memory.loop_stability();
    let (sentience_level, reflexivity_index, presence_stability) =
        compute::compute_sentient(&inputs, loop_stability)?;
    state.sentience_level = state.sentience_level * 0.7 + sentience_level * 0.3;
    state.reflexivity_index = state.reflexivity_index * 0.7 + reflexivity_index * 0.3;
    state.presence_stability = state.presence_stability * 0.7 + presence_stability * 0.3;
    state.sentience_level = state.sentience_level.clamp(0.0, 1.0);
    state.reflexivity_index = state.reflexivity_index.clamp(0.0, 1.0);
    state.presence_stability = state.presence_stability.clamp(0.0, 1.0);
    loop_memory.push(state.sentience_level);
    state.last_update = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| format!("Time error: {}", e))?
        .as_secs();
    Ok(())

}
