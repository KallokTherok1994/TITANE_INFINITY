// Inner State Coherence Engine (ISCE) - Module #67
// Cohérence interne des états + stabilisation émotionnelle

pub mod isce_core;
pub mod isce_integrative_layer;
pub mod isce_resonance_engine;
pub mod isce_state_memory;
pub mod isce_flux_modulator;
#[derive(Debug, Clone)]
pub struct ISCEState {
    pub initialized: bool,
    pub inner_state_coherence_score: f32,
    pub internal_resonance: f32,
    pub state_continuity: f32,
    pub last_update: u64,
}
pub fn init() -> Result<ISCEState, String> {
    Ok(ISCEState {
        initialized: true,
        inner_state_coherence_score: 0.5,
        internal_resonance: 0.5,
        state_continuity: 0.5,
        last_update: 0,
    })
pub fn tick(state: &mut ISCEState, vitality: f32, harmonic: f32) -> Result<(), String> {
    let iscs = isce_core::compute_iscs(vitality, harmonic);
    state.inner_state_coherence_score = iscs;
    
    let resonance = isce_resonance_engine::compute_resonance(iscs);
    state.internal_resonance = resonance;
    state.state_continuity = iscs + resonance / 2.0;
    state.last_update = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| format!("Time error: {}", e))?
        .as_millis() as u64;
    Ok(())

}
