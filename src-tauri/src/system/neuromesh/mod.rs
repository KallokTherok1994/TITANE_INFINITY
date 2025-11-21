// TITANE∞ v8.0 - NeuroMesh Engine
// Module principal du réseau neuronal complet

pub mod collect;
pub mod compute;
use crate::system::neurofield::NeuroFieldState;
use crate::system::vitalcore::VitalCoreState;
use crate::system::continuum::ContinuumState;
use crate::system::deepalignment::DeepAlignmentState;
/// État du NeuroMesh Engine
#[derive(Debug, Clone)]
pub struct NeuroMeshState {
    pub initialized: bool,
    pub mesh_density: f32,
    pub synaptic_flow: f32,
    pub network_coherence: f32,
    pub last_update: u64,
}
/// Initialise le NeuroMesh Engine
pub fn init() -> Result<NeuroMeshState, String> {
    Ok(NeuroMeshState {
        initialized: true,
        mesh_density: 0.5,
        synaptic_flow: 0.5,
        network_coherence: 0.5,
        last_update: current_timestamp(),
    })
/// Tick principal du NeuroMesh Engine
pub fn tick(
    state: &mut NeuroMeshState,
    neurofield: &NeuroFieldState,
    vitalcore: &VitalCoreState,
    continuum: &ContinuumState,
    deepalignment: &DeepAlignmentState,
) -> Result<(), String> {
    if !state.initialized {
        return Err("NeuroMesh non initialisé".to_string());
    }
    // 1. Collecter
    let inputs = collect::collect_mesh_inputs(
        neurofield,
        vitalcore,
        continuum,
        deepalignment,
    )?;
    // 2. Calculer
    let (new_mesh_density, new_synaptic_flow, new_network_coherence) =
        compute::compute_mesh(&inputs)?;
    // 3. Lisser 70/30
    state.mesh_density = smooth_transition(state.mesh_density, new_mesh_density);
    state.synaptic_flow = smooth_transition(state.synaptic_flow, new_synaptic_flow);
    state.network_coherence = smooth_transition(state.network_coherence, new_network_coherence);
    // 4. Clamp
    clamp_all(state);
    // 5. Update timestamp
    state.last_update = current_timestamp();
    Ok(())
fn smooth_transition(old: f32, new: f32) -> f32 {
    (old * 0.7 + new * 0.3).clamp(0.0, 1.0)
fn clamp_all(state: &mut NeuroMeshState) {
    state.mesh_density = state.mesh_density.clamp(0.0, 1.0);
    state.synaptic_flow = state.synaptic_flow.clamp(0.0, 1.0);
    state.network_coherence = state.network_coherence.clamp(0.0, 1.0);
fn current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or0
// Helpers
pub fn is_structured(state: &NeuroMeshState) -> bool {
    state.mesh_density > 0.7 && state.network_coherence > 0.7
pub fn is_sparse(state: &NeuroMeshState) -> bool {
    state.mesh_density < 0.3
pub fn is_flowing(state: &NeuroMeshState) -> bool {
    state.synaptic_flow > 0.7
pub fn is_stagnant(state: &NeuroMeshState) -> bool {
    state.synaptic_flow < 0.3
pub fn is_coherent(state: &NeuroMeshState) -> bool {
    state.network_coherence > 0.7
pub fn is_fragmented(state: &NeuroMeshState) -> bool {
    state.network_coherence < 0.3
pub fn status_message(state: &NeuroMeshState) -> &'static str {
    let avg = (state.mesh_density + state.synaptic_flow + state.network_coherence) / 3.0;
    
    if avg > 0.85 {
        "RÉSEAU NEURONAL OPTIMAL"
    } else if avg > 0.7 {
        "Réseau neuronal excellent"
    } else if avg > 0.55 {
        "Réseau neuronal correct"
    } else if avg > 0.4 {
        "Réseau neuronal faible"
    } else {
        "RÉSEAU NEURONAL FRAGMENTÉ"
pub fn mesh_percentage(state: &NeuroMeshState) -> f32 {
    ((state.mesh_density + state.synaptic_flow + state.network_coherence) / 3.0 * 100.0)
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
        assert_eq!(state.mesh_density, 0.5);
        assert_eq!(state.synaptic_flow, 0.5);
        assert_eq!(state.network_coherence, 0.5);
    fn test_smooth_transition() {
        let result = smooth_transition(0.6, 0.9);
        assert!((result - 0.69).abs() < 0.01);
    fn test_is_structured() {
        let state = NeuroMeshState {
            initialized: true,
            mesh_density: 0.8,
            synaptic_flow: 0.5,
            network_coherence: 0.75,
            last_update: 0,
        };
        assert!(is_structured(&state));
    fn test_is_sparse() {
            mesh_density: 0.2,
            network_coherence: 0.5,
        assert!(is_sparse(&state));
    fn test_is_flowing() {
            mesh_density: 0.5,
            synaptic_flow: 0.8,
        assert!(is_flowing(&state));
    fn test_is_stagnant() {
            synaptic_flow: 0.2,
        assert!(is_stagnant(&state));
    fn test_is_coherent() {
            network_coherence: 0.8,
        assert!(is_coherent(&state));
    fn test_is_fragmented() {
            network_coherence: 0.2,
        assert!(is_fragmented(&state));
    fn test_status_message() {
            mesh_density: 0.9,
            synaptic_flow: 0.9,
            network_coherence: 0.9,
        assert_eq!(status_message(&state), "RÉSEAU NEURONAL OPTIMAL");
    fn test_mesh_percentage() {
            mesh_density: 0.6,
            synaptic_flow: 0.7,
        let percentage = mesh_percentage(&state);
        // (0.6 + 0.7 + 0.8) / 3 = 0.7 → 70%
        assert!((percentage - 70.0).abs() < 1.0);
    fn test_clamp_all() {
        let mut state = NeuroMeshState {
            mesh_density: 1.5,
            synaptic_flow: -0.2,
        clamp_all(&mut state);
        assert_eq!(state.mesh_density, 1.0);
        assert_eq!(state.synaptic_flow, 0.0);

}
