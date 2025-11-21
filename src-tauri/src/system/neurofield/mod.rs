// TITANE∞ v8.0 - NeuroField Engine
// Module principal du champ neuronal interne

pub mod collect;
pub mod compute;
use crate::system::vitalcore::VitalCoreState;
use crate::system::continuum::ContinuumState;
use crate::system::deepalignment::DeepAlignmentState;
use crate::system::resonance::ResonanceState;
/// État du NeuroField Engine
#[derive(Debug, Clone)]
pub struct NeuroFieldState {
    pub initialized: bool,
    pub neural_density: f32,
    pub signal_propagation: f32,
    pub field_coherence: f32,
    pub last_update: u64,
}
/// Initialise le NeuroField Engine
pub fn init() -> Result<NeuroFieldState, String> {
    Ok(NeuroFieldState {
        initialized: true,
        neural_density: 0.5,
        signal_propagation: 0.5,
        field_coherence: 0.5,
        last_update: current_timestamp(),
    })
/// Tick principal du NeuroField Engine
pub fn tick(
    state: &mut NeuroFieldState,
    vitalcore: &VitalCoreState,
    continuum: &ContinuumState,
    deepalignment: &DeepAlignmentState,
    resonance: &ResonanceState,
) -> Result<(), String> {
    if !state.initialized {
        return Err("NeuroField non initialisé".to_string());
    }
    // 1. Collecter
    let inputs = collect::collect_neuro_inputs(
        vitalcore,
        continuum,
        deepalignment,
        resonance,
    )?;
    // 2. Calculer
    let (new_density, new_propagation, new_coherence) =
        compute::compute_neurofield(&inputs)?;
    // 3. Lisser 70/30
    state.neural_density = smooth_transition(state.neural_density, new_density);
    state.signal_propagation = smooth_transition(state.signal_propagation, new_propagation);
    state.field_coherence = smooth_transition(state.field_coherence, new_coherence);
    // 4. Clamp
    clamp_all(state);
    // 5. Update timestamp
    state.last_update = current_timestamp();
    Ok(())
fn smooth_transition(old: f32, new: f32) -> f32 {
    (old * 0.7 + new * 0.3).clamp(0.0, 1.0)
fn clamp_all(state: &mut NeuroFieldState) {
    state.neural_density = state.neural_density.clamp(0.0, 1.0);
    state.signal_propagation = state.signal_propagation.clamp(0.0, 1.0);
    state.field_coherence = state.field_coherence.clamp(0.0, 1.0);
fn current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or0
// Helpers
pub fn is_dense(state: &NeuroFieldState) -> bool {
    state.neural_density > 0.7
pub fn is_sparse(state: &NeuroFieldState) -> bool {
    state.neural_density < 0.3
pub fn is_propagating(state: &NeuroFieldState) -> bool {
    state.signal_propagation > 0.7
pub fn is_blocked(state: &NeuroFieldState) -> bool {
    state.signal_propagation < 0.3
pub fn is_coherent(state: &NeuroFieldState) -> bool {
    state.field_coherence > 0.7
pub fn is_fragmented(state: &NeuroFieldState) -> bool {
    state.field_coherence < 0.3
pub fn status_message(state: &NeuroFieldState) -> &'static str {
    let avg = (state.neural_density + state.signal_propagation + state.field_coherence) / 3.0;
    
    if avg > 0.85 {
        "CHAMP NEURONAL OPTIMAL"
    } else if avg > 0.7 {
        "Champ neuronal excellent"
    } else if avg > 0.55 {
        "Champ neuronal correct"
    } else if avg > 0.4 {
        "Champ neuronal faible"
    } else {
        "CHAMP NEURONAL FRAGMENTÉ"
pub fn field_percentage(state: &NeuroFieldState) -> f32 {
    ((state.neural_density + state.signal_propagation + state.field_coherence) / 3.0 * 100.0)
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
        assert_eq!(state.neural_density, 0.5);
        assert_eq!(state.signal_propagation, 0.5);
        assert_eq!(state.field_coherence, 0.5);
    fn test_smooth_transition() {
        let result = smooth_transition(0.6, 0.9);
        assert!((result - 0.69).abs() < 0.01);
    fn test_is_dense() {
        let state = NeuroFieldState {
            initialized: true,
            neural_density: 0.8,
            signal_propagation: 0.5,
            field_coherence: 0.5,
            last_update: 0,
        };
        assert!(is_dense(&state));
    fn test_is_sparse() {
            neural_density: 0.2,
        assert!(is_sparse(&state));
    fn test_is_propagating() {
            neural_density: 0.5,
            signal_propagation: 0.8,
        assert!(is_propagating(&state));
    fn test_is_blocked() {
            signal_propagation: 0.2,
        assert!(is_blocked(&state));
    fn test_is_coherent() {
            field_coherence: 0.8,
        assert!(is_coherent(&state));
    fn test_is_fragmented() {
            field_coherence: 0.2,
        assert!(is_fragmented(&state));
    fn test_status_message() {
            neural_density: 0.9,
            signal_propagation: 0.9,
            field_coherence: 0.9,
        assert_eq!(status_message(&state), "CHAMP NEURONAL OPTIMAL");
    fn test_field_percentage() {
            neural_density: 0.6,
            signal_propagation: 0.7,
        let percentage = field_percentage(&state);
        // (0.6 + 0.7 + 0.8) / 3 = 0.7 → 70%
        assert!((percentage - 70.0).abs() < 1.0);
    fn test_clamp_all() {
        let mut state = NeuroFieldState {
            neural_density: 1.5,
            signal_propagation: -0.2,
        clamp_all(&mut state);
        assert_eq!(state.neural_density, 1.0);
        assert_eq!(state.signal_propagation, 0.0);

}
