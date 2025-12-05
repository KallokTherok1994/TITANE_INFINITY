// TITANE∞ v8.0 - Governor Engine
// Module principal de régulation cognitive

pub mod collect;
pub mod compute;
use crate::system::metacortex::MetaCortexState;
use crate::system::coremesh::CoreMeshState;
use crate::system::neuromesh::NeuroMeshState;
use crate::system::neurofield::NeuroFieldState;
use crate::system::continuum::ContinuumState;
use crate::system::stability::StabilityState;
use crate::system::deepalignment::DeepAlignmentState;
/// État du Governor Engine
#[derive(Debug, Clone)]
pub struct GovernorState {
    pub initialized: bool,
    pub regulation_level: f32,
    pub deviation_index: f32,
    pub homeostasis_score: f32,
    pub last_update: u64,
}
pub fn init() -> Result<GovernorState, String> {
    Ok(GovernorState {
        initialized: true,
        regulation_level: 0.5,
        deviation_index: 0.5,
        homeostasis_score: 0.5,
        last_update: current_timestamp(),
    })
pub fn tick(
    state: &mut GovernorState,
    metacortex: &MetaCortexState,
    coremesh: &CoreMeshState,
    neuromesh: &NeuroMeshState,
    neurofield: &NeuroFieldState,
    continuum: &ContinuumState,
    stability: &StabilityState,
    deepalignment: &DeepAlignmentState,
) -> Result<(), String> {
    if !state.initialized {
        return Err("Governor non initialisé".to_string());
    }
    let inputs = collect::collect_governor_inputs(
        metacortex, coremesh, neuromesh, neurofield, continuum, stability, deepalignment,
    )?;
    let (new_regulation, new_deviation, new_homeostasis) = compute::compute_governor(&inputs)?;
    state.regulation_level = smooth_transition(state.regulation_level, new_regulation);
    state.deviation_index = smooth_transition(state.deviation_index, new_deviation);
    state.homeostasis_score = smooth_transition(state.homeostasis_score, new_homeostasis);
    clamp_all(state);
    state.last_update = current_timestamp();
    Ok(())
fn smooth_transition(old: f32, new: f32) -> f32 {
    (old * 0.7 + new * 0.3).clamp(0.0, 1.0)
fn clamp_all(state: &mut GovernorState) {
    state.regulation_level = state.regulation_level.clamp(0.0, 1.0);
    state.deviation_index = state.deviation_index.clamp(0.0, 1.0);
    state.homeostasis_score = state.homeostasis_score.clamp(0.0, 1.0);
fn current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or0
pub fn is_regulated(state: &GovernorState) -> bool {
    state.regulation_level < 0.3 && state.homeostasis_score > 0.7
pub fn needs_regulation(state: &GovernorState) -> bool {
    state.regulation_level > 0.7
pub fn is_stable(state: &GovernorState) -> bool {
    state.deviation_index < 0.3 && state.homeostasis_score > 0.7
pub fn is_unstable(state: &GovernorState) -> bool {
    state.deviation_index > 0.7
pub fn status_message(state: &GovernorState) -> &'static str {
    if state.homeostasis_score > 0.85 && state.regulation_level < 0.3 {
        "HOMÉOSTASIE OPTIMALE"
    } else if state.homeostasis_score > 0.7 {
        "Régulation excellente"
    } else if state.homeostasis_score > 0.55 {
        "Régulation correcte"
    } else if state.homeostasis_score > 0.4 {
        "Régulation faible"
    } else {
        "DÉRÉGULATION CRITIQUE"
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_init() {
        let result = init();
        assert!(result.is_ok());
        
        let state = result.unwrap();
        assert!(state.initialized);
        assert_eq!(state.regulation_level, 0.5);
    fn test_is_regulated() {
        let state = GovernorState {
            initialized: true,
            regulation_level: 0.2,
            deviation_index: 0.5,
            homeostasis_score: 0.8,
            last_update: 0,
        };
        assert!(is_regulated(&state));
    fn test_needs_regulation() {
            regulation_level: 0.8,
            homeostasis_score: 0.5,
        assert!(needs_regulation(&state));
    fn test_is_stable() {
            regulation_level: 0.5,
            deviation_index: 0.2,
        assert!(is_stable(&state));
    fn test_status_message() {
            homeostasis_score: 0.9,
        assert_eq!(status_message(&state), "HOMÉOSTASIE OPTIMALE");

}
