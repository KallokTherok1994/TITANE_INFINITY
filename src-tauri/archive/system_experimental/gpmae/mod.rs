// Global Perception & Meta-Awareness Engine (GPMAE) - Module #68
// Perception globale, méta-perception dynamique

pub mod gpmae_core;
pub mod gpmae_sensory_fusion;
pub mod gpmae_meta_mapping;
pub mod gpmae_pattern_scanner;
pub mod gpmae_continuity_buffer;
#[derive(Debug, Clone)]
pub struct GPMAEState {
    pub initialized: bool,
    pub global_percept_state: f32,
    pub meta_awareness_level: f32,
    pub pattern_emergence_score: f32,
    pub last_update: u64,
}
pub fn init() -> Result<GPMAEState, String> {
    Ok(GPMAEState {
        initialized: true,
        global_percept_state: 0.5,
        meta_awareness_level: 0.5,
        pattern_emergence_score: 0.3,
        last_update: 0,
    })
pub fn tick(state: &mut GPMAEState, isce: f32, paefe: f32) -> Result<(), String> {
    let gps = gpmae_core::compute_gps(isce, paefe);
    state.global_percept_state = gps;
    
    let awareness = gpmae_sensory_fusion::fuse_perceptions(gps, isce);
    state.meta_awareness_level = awareness;
    let patterns = gpmae_pattern_scanner::scan_patterns(awareness);
    state.pattern_emergence_score = patterns;
    state.last_update = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| format!("Time error: {}", e))?
        .as_millis() as u64;
    Ok(())

}
