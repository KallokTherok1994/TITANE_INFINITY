// TITANE∞ v8.0 - MetaCortex Engine
// Module principal du cortex supérieur

pub mod collect;
pub mod compute;
use crate::system::coremesh::CoreMeshState;
use crate::system::neuromesh::NeuroMeshState;
use crate::system::neurofield::NeuroFieldState;
use crate::system::continuum::ContinuumState;
use crate::system::deepalignment::DeepAlignmentState;
use crate::system::resonance::ResonanceState;
/// État du MetaCortex Engine
#[derive(Debug, Clone)]
pub struct MetaCortexState {
    pub initialized: bool,
    pub metacortex_clarity: f32,
    pub reasoning_depth: f32,
    pub global_coherence: f32,
    pub last_update: u64,
}
/// Initialise le MetaCortex Engine
pub fn init() -> Result<MetaCortexState, String> {
    Ok(MetaCortexState {
        initialized: true,
        metacortex_clarity: 0.5,
        reasoning_depth: 0.5,
        global_coherence: 0.5,
        last_update: current_timestamp(),
    })
/// Tick principal du MetaCortex Engine
pub fn tick(
    state: &mut MetaCortexState,
    coremesh: &CoreMeshState,
    neuromesh: &NeuroMeshState,
    neurofield: &NeuroFieldState,
    continuum: &ContinuumState,
    deepalignment: &DeepAlignmentState,
    resonance: &ResonanceState,
) -> Result<(), String> {
    if !state.initialized {
        return Err("MetaCortex non initialisé".to_string());
    }
    // 1. Collecter
    let inputs = collect::collect_metacortex_inputs(
        coremesh,
        neuromesh,
        neurofield,
        continuum,
        deepalignment,
        resonance,
    )?;
    // 2. Calculer
    let (new_clarity, new_depth, new_coherence) = compute::compute_metacortex(&inputs)?;
    // 3. Lisser 70/30
    state.metacortex_clarity = smooth_transition(state.metacortex_clarity, new_clarity);
    state.reasoning_depth = smooth_transition(state.reasoning_depth, new_depth);
    state.global_coherence = smooth_transition(state.global_coherence, new_coherence);
    // 4. Clamp
    clamp_all(state);
    // 5. Update timestamp
    state.last_update = current_timestamp();
    Ok(())
fn smooth_transition(old: f32, new: f32) -> f32 {
    (old * 0.7 + new * 0.3).clamp(0.0, 1.0)
fn clamp_all(state: &mut MetaCortexState) {
    state.metacortex_clarity = state.metacortex_clarity.clamp(0.0, 1.0);
    state.reasoning_depth = state.reasoning_depth.clamp(0.0, 1.0);
    state.global_coherence = state.global_coherence.clamp(0.0, 1.0);
fn current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or0
// Helpers
pub fn is_clear(state: &MetaCortexState) -> bool {
    state.metacortex_clarity > 0.7 && state.global_coherence > 0.7
pub fn is_confused(state: &MetaCortexState) -> bool {
    state.metacortex_clarity < 0.3
pub fn is_deep_reasoning(state: &MetaCortexState) -> bool {
    state.reasoning_depth > 0.7
pub fn is_shallow_reasoning(state: &MetaCortexState) -> bool {
    state.reasoning_depth < 0.3
pub fn is_coherent(state: &MetaCortexState) -> bool {
    state.global_coherence > 0.7
pub fn is_fragmented(state: &MetaCortexState) -> bool {
    state.global_coherence < 0.3
pub fn status_message(state: &MetaCortexState) -> &'static str {
    let avg = (state.metacortex_clarity + state.reasoning_depth + state.global_coherence) / 3.0;
    
    if avg > 0.85 {
        "METACORTEX OPTIMAL"
    } else if avg > 0.7 {
        "MetaCortex excellent"
    } else if avg > 0.55 {
        "MetaCortex correct"
    } else if avg > 0.4 {
        "MetaCortex faible"
    } else {
        "METACORTEX FRAGMENTÉ"
pub fn cortex_percentage(state: &MetaCortexState) -> f32 {
    ((state.metacortex_clarity + state.reasoning_depth + state.global_coherence) / 3.0 * 100.0)
        .clamp(0.0, 100.0)
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_init() {
        let result = init();
        assert!(result.is_ok());
        
        let state = result.unwrap();
        assert!(state.initialized);
        assert_eq!(state.metacortex_clarity, 0.5);
        assert_eq!(state.reasoning_depth, 0.5);
        assert_eq!(state.global_coherence, 0.5);
    fn test_smooth_transition() {
        let result = smooth_transition(0.6, 0.9);
        assert!((result - 0.69).abs() < 0.01);
    fn test_is_clear() {
        let state = MetaCortexState {
            initialized: true,
            metacortex_clarity: 0.8,
            reasoning_depth: 0.5,
            global_coherence: 0.75,
            last_update: 0,
        };
        assert!(is_clear(&state));
    fn test_is_confused() {
            metacortex_clarity: 0.2,
            global_coherence: 0.5,
        assert!(is_confused(&state));
    fn test_is_deep_reasoning() {
            metacortex_clarity: 0.5,
            reasoning_depth: 0.8,
        assert!(is_deep_reasoning(&state));
    fn test_status_message() {
            metacortex_clarity: 0.9,
            reasoning_depth: 0.9,
            global_coherence: 0.9,
        assert_eq!(status_message(&state), "METACORTEX OPTIMAL");
    fn test_cortex_percentage() {
            metacortex_clarity: 0.6,
            reasoning_depth: 0.7,
            global_coherence: 0.8,
        let percentage = cortex_percentage(&state);
        assert!((percentage - 70.0).abs() < 1.0);
    fn test_clamp_all() {
        let mut state = MetaCortexState {
            metacortex_clarity: 1.5,
            reasoning_depth: -0.2,
        clamp_all(&mut state);
        assert_eq!(state.metacortex_clarity, 1.0);
        assert_eq!(state.reasoning_depth, 0.0);

}
