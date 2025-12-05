// TITANE∞ v8.0 - VitalCore Engine
// Module principal de vitalité et énergie interne

pub mod collect;
pub mod compute;
use crate::system::continuum::ContinuumState;
use crate::system::deepalignment::DeepAlignmentState;
use crate::system::resonance::ResonanceState;
use crate::system::flowsync::FlowSyncState;
use crate::system::stability::StabilityState;
/// État du VitalCore Engine
#[derive(Debug, Clone)]
pub struct VitalCoreState {
    pub initialized: bool,
    pub vitality_level: f32,
    pub energy_flow: f32,
    pub resilience_index: f32,
    pub last_update: u64,
}
/// Initialise le VitalCore Engine
pub fn init() -> Result<VitalCoreState, String> {
    Ok(VitalCoreState {
        initialized: true,
        vitality_level: 0.5,
        energy_flow: 0.5,
        resilience_index: 0.5,
        last_update: current_timestamp(),
    })
/// Tick principal du VitalCore Engine
pub fn tick(
    state: &mut VitalCoreState,
    continuum: &ContinuumState,
    deepalignment: &DeepAlignmentState,
    resonance: &ResonanceState,
    flowsync: &FlowSyncState,
    stability: &StabilityState,
) -> Result<(), String> {
    if !state.initialized {
        return Err("VitalCore non initialisé".to_string());
    }
    // 1. Collecter
    let inputs = collect::collect_vital_inputs(
        continuum,
        deepalignment,
        resonance,
        flowsync,
        stability,
    )?;
    // 2. Calculer
    let (new_vitality, new_energy, new_resilience) =
        compute::compute_vitalcore(&inputs)?;
    // 3. Lisser 70/30
    state.vitality_level = smooth_transition(state.vitality_level, new_vitality);
    state.energy_flow = smooth_transition(state.energy_flow, new_energy);
    state.resilience_index = smooth_transition(state.resilience_index, new_resilience);
    // 4. Clamp
    clamp_all(state);
    // 5. Update timestamp
    state.last_update = current_timestamp();
    Ok(())
fn smooth_transition(old: f32, new: f32) -> f32 {
    (old * 0.7 + new * 0.3).clamp(0.0, 1.0)
fn clamp_all(state: &mut VitalCoreState) {
    state.vitality_level = state.vitality_level.clamp(0.0, 1.0);
    state.energy_flow = state.energy_flow.clamp(0.0, 1.0);
    state.resilience_index = state.resilience_index.clamp(0.0, 1.0);
fn current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or0
// Helpers
pub fn is_vital(state: &VitalCoreState) -> bool {
    state.vitality_level > 0.7 && state.energy_flow > 0.6
pub fn is_exhausted(state: &VitalCoreState) -> bool {
    state.vitality_level < 0.3 || state.energy_flow < 0.3
pub fn is_resilient(state: &VitalCoreState) -> bool {
    state.resilience_index > 0.7
pub fn is_fragile(state: &VitalCoreState) -> bool {
    state.resilience_index < 0.3
pub fn status_message(state: &VitalCoreState) -> &'static str {
    let avg = (state.vitality_level + state.energy_flow + state.resilience_index) / 3.0;
    
    if avg > 0.85 {
        "VITALITÉ OPTIMALE"
    } else if avg > 0.7 {
        "Vitalité excellente"
    } else if avg > 0.55 {
        "Vitalité correcte"
    } else if avg > 0.4 {
        "Vitalité faible"
    } else {
        "ÉPUISEMENT CRITIQUE"
pub fn vitality_percentage(state: &VitalCoreState) -> f32 {
    (state.vitality_level * 100.0).clamp(0.0, 100.0)
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_init() {
        let result = init();
        assert!(result.is_ok());
        
        let state = result.unwrap();
        assert!(state.initialized);
        assert_eq!(state.vitality_level, 0.5);
        assert_eq!(state.energy_flow, 0.5);
        assert_eq!(state.resilience_index, 0.5);
    fn test_smooth_transition() {
        let result = smooth_transition(0.6, 0.9);
        // 0.6*0.7 + 0.9*0.3 = 0.42 + 0.27 = 0.69
        assert!((result - 0.69).abs() < 0.01);
    fn test_is_vital() {
        let state = VitalCoreState {
            initialized: true,
            vitality_level: 0.8,
            energy_flow: 0.7,
            resilience_index: 0.5,
            last_update: 0,
        };
        assert!(is_vital(&state));
    fn test_is_exhausted() {
            vitality_level: 0.2,
        assert!(is_exhausted(&state));
    fn test_is_resilient() {
            vitality_level: 0.5,
            energy_flow: 0.5,
            resilience_index: 0.8,
        assert!(is_resilient(&state));
    fn test_is_fragile() {
            resilience_index: 0.2,
        assert!(is_fragile(&state));
    fn test_status_message() {
            vitality_level: 0.9,
            energy_flow: 0.9,
            resilience_index: 0.9,
        assert_eq!(status_message(&state), "VITALITÉ OPTIMALE");
    fn test_vitality_percentage() {
            vitality_level: 0.75,
        assert_eq!(vitality_percentage(&state), 75.0);
    fn test_clamp_all() {
        let mut state = VitalCoreState {
            vitality_level: 1.5,
            energy_flow: -0.2,
        clamp_all(&mut state);
        assert_eq!(state.vitality_level, 1.0);
        assert_eq!(state.energy_flow, 0.0);

}
