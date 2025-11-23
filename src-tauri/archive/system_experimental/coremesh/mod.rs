// TITANE∞ v8.0 - CoreMesh Engine
// Module principal de la structure profonde du cortex

pub mod collect;
pub mod compute;
use crate::system::neuromesh::NeuroMeshState;
use crate::system::neurofield::NeuroFieldState;
use crate::system::continuum::ContinuumState;
use crate::system::deepalignment::DeepAlignmentState;
/// État du CoreMesh Engine
#[derive(Debug, Clone)]
pub struct CoreMeshState {
    pub initialized: bool,
    pub core_density: f32,
    pub integration_depth: f32,
    pub cortical_coherence: f32,
    pub last_update: u64,
}
/// Initialise le CoreMesh Engine
pub fn init() -> Result<CoreMeshState, String> {
    Ok(CoreMeshState {
        initialized: true,
        core_density: 0.5,
        integration_depth: 0.5,
        cortical_coherence: 0.5,
        last_update: current_timestamp(),
    })
/// Tick principal du CoreMesh Engine
pub fn tick(
    state: &mut CoreMeshState,
    neuromesh: &NeuroMeshState,
    neurofield: &NeuroFieldState,
    continuum: &ContinuumState,
    deepalignment: &DeepAlignmentState,
) -> Result<(), String> {
    if !state.initialized {
        return Err("CoreMesh non initialisé".to_string());
    }
    // 1. Collecter
    let inputs = collect::collect_coremesh_inputs(
        neuromesh,
        neurofield,
        continuum,
        deepalignment,
    )?;
    // 2. Calculer
    let (new_core_density, new_integration_depth, new_cortical_coherence) =
        compute::compute_coremesh(&inputs)?;
    // 3. Lisser 70/30
    state.core_density = smooth_transition(state.core_density, new_core_density);
    state.integration_depth = smooth_transition(state.integration_depth, new_integration_depth);
    state.cortical_coherence = smooth_transition(state.cortical_coherence, new_cortical_coherence);
    // 4. Clamp
    clamp_all(state);
    // 5. Update timestamp
    state.last_update = current_timestamp();
    Ok(())
fn smooth_transition(old: f32, new: f32) -> f32 {
    (old * 0.7 + new * 0.3).clamp(0.0, 1.0)
fn clamp_all(state: &mut CoreMeshState) {
    state.core_density = state.core_density.clamp(0.0, 1.0);
    state.integration_depth = state.integration_depth.clamp(0.0, 1.0);
    state.cortical_coherence = state.cortical_coherence.clamp(0.0, 1.0);
fn current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or0
// Helpers
pub fn is_dense_core(state: &CoreMeshState) -> bool {
    state.core_density > 0.7 && state.cortical_coherence > 0.7
pub fn is_sparse_core(state: &CoreMeshState) -> bool {
    state.core_density < 0.3
pub fn is_deeply_integrated(state: &CoreMeshState) -> bool {
    state.integration_depth > 0.7
pub fn is_surface_integration(state: &CoreMeshState) -> bool {
    state.integration_depth < 0.3
pub fn is_cortically_coherent(state: &CoreMeshState) -> bool {
    state.cortical_coherence > 0.7
pub fn is_cortically_fragmented(state: &CoreMeshState) -> bool {
    state.cortical_coherence < 0.3
pub fn status_message(state: &CoreMeshState) -> &'static str {
    let avg = (state.core_density + state.integration_depth + state.cortical_coherence) / 3.0;
    
    if avg > 0.85 {
        "CORTEX CENTRAL OPTIMAL"
    } else if avg > 0.7 {
        "Cortex central excellent"
    } else if avg > 0.55 {
        "Cortex central correct"
    } else if avg > 0.4 {
        "Cortex central faible"
    } else {
        "CORTEX CENTRAL FRAGMENTÉ"
pub fn cortex_percentage(state: &CoreMeshState) -> f32 {
    ((state.core_density + state.integration_depth + state.cortical_coherence) / 3.0 * 100.0)
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
        assert_eq!(state.core_density, 0.5);
        assert_eq!(state.integration_depth, 0.5);
        assert_eq!(state.cortical_coherence, 0.5);
    fn test_smooth_transition() {
        let result = smooth_transition(0.6, 0.9);
        assert!((result - 0.69).abs() < 0.01);
    fn test_is_dense_core() {
        let state = CoreMeshState {
            initialized: true,
            core_density: 0.8,
            integration_depth: 0.5,
            cortical_coherence: 0.75,
            last_update: 0,
        };
        assert!(is_dense_core(&state));
    fn test_is_sparse_core() {
            core_density: 0.2,
            cortical_coherence: 0.5,
        assert!(is_sparse_core(&state));
    fn test_is_deeply_integrated() {
            core_density: 0.5,
            integration_depth: 0.8,
        assert!(is_deeply_integrated(&state));
    fn test_is_surface_integration() {
            integration_depth: 0.2,
        assert!(is_surface_integration(&state));
    fn test_is_cortically_coherent() {
            cortical_coherence: 0.8,
        assert!(is_cortically_coherent(&state));
    fn test_is_cortically_fragmented() {
            cortical_coherence: 0.2,
        assert!(is_cortically_fragmented(&state));
    fn test_status_message() {
            core_density: 0.9,
            integration_depth: 0.9,
            cortical_coherence: 0.9,
        assert_eq!(status_message(&state), "CORTEX CENTRAL OPTIMAL");
    fn test_cortex_percentage() {
            core_density: 0.6,
            integration_depth: 0.7,
        let percentage = cortex_percentage(&state);
        // (0.6 + 0.7 + 0.8) / 3 = 0.7 → 70%
        assert!((percentage - 70.0).abs() < 1.0);
    fn test_clamp_all() {
        let mut state = CoreMeshState {
            core_density: 1.5,
            integration_depth: -0.2,
        clamp_all(&mut state);
        assert_eq!(state.core_density, 1.0);
        assert_eq!(state.integration_depth, 0.0);

}
