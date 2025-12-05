use crate::system::sentient::SentientState;
use crate::system::evolution::EvolutionState;
use crate::system::adaptive_intelligence::AdaptiveIntelligenceState;
use crate::system::conscience::ConscienceState;
use crate::system::metacortex::MetaCortexState;
use crate::system::continuum::ContinuumState;

mod collect;
mod compute;
mod resonance;
pub use resonance::ResonanceMemory;
pub struct HarmonicBrainState {
    pub initialized: bool,
    pub neuro_harmony: f32,
    pub integration_coherence: f32,
    pub cognitive_resonance: f32,
    pub last_update: u64,
}
pub fn init() -> Result<HarmonicBrainState, String> {
    Ok(HarmonicBrainState {
        initialized: true,
        neuro_harmony: 0.5,
        integration_coherence: 0.5,
        cognitive_resonance: 0.5,
        last_update: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map_err(|e| format!("Time error: {}", e))?
            .as_secs(),
    })
pub fn tick(
    state: &mut HarmonicBrainState,
    sentient: &SentientState,
    evolution: &EvolutionState,
    adaptive: &AdaptiveIntelligenceState,
    conscience: &ConscienceState,
    metacortex: &MetaCortexState,
    continuum: &ContinuumState,
    resonance_mem: &mut ResonanceMemory,
) -> Result<(), String> {
    let inputs = collect::collect_harmonic_inputs(
        sentient,
        evolution,
        adaptive,
        conscience,
        metacortex,
        continuum,
    )?;
    let resonance_factor = resonance_mem.resonance_factor();
    let (neuro_harmony, integration_coherence, cognitive_resonance) =
        compute::compute_harmonic_brain(&inputs, resonance_factor)?;
    state.neuro_harmony = state.neuro_harmony * 0.75 + neuro_harmony * 0.25;
    state.integration_coherence = state.integration_coherence * 0.75 + integration_coherence * 0.25;
    state.cognitive_resonance = state.cognitive_resonance * 0.75 + cognitive_resonance * 0.25;
    state.neuro_harmony = state.neuro_harmony.clamp(0.0, 1.0);
    state.integration_coherence = state.integration_coherence.clamp(0.0, 1.0);
    state.cognitive_resonance = state.cognitive_resonance.clamp(0.0, 1.0);
    resonance_mem.push(state.neuro_harmony);
    state.last_update = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| format!("Time error: {}", e))?
        .as_secs();
    Ok(())

}
