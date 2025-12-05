// TITANE∞ v8.0 - DeepAlignment Engine
// Module principal d'alignement profond et cohérence avancée

pub mod collect;
pub mod compute;
use crate::system::deepsense::DeepSenseState;
use crate::system::resonance::ResonanceState;
use crate::system::harmonic::HarmonicState;
use crate::system::flowsync::FlowSyncState;
/// État du DeepAlignment Engine
#[derive(Debug, Clone)]
pub struct DeepAlignmentState {
    pub initialized: bool,
    pub alignment_depth: f32,
    pub direction_alignment: f32,
    pub core_alignment: f32,
    pub last_update: u64,
}
/// Initialise le DeepAlignment Engine
pub fn init() -> Result<DeepAlignmentState, String> {
    Ok(DeepAlignmentState {
        initialized: true,
        alignment_depth: 0.5,
        direction_alignment: 0.5,
        core_alignment: 0.5,
        last_update: current_timestamp(),
    })
/// Tick principal du DeepAlignment Engine
pub fn tick(
    state: &mut DeepAlignmentState,
    deepsense: &DeepSenseState,
    resonance: &ResonanceState,
    harmonic: &HarmonicState,
    flowsync: &FlowSyncState,
) -> Result<(), String> {
    if !state.initialized {
        return Err("DeepAlignment non initialisé".to_string());
    }
    // 1. Collecter les signaux
    let inputs = collect::collect_alignment_inputs(
        deepsense,
        resonance,
        harmonic,
        flowsync,
    )?;
    // 2. Calculer les nouvelles valeurs
    let (new_alignment_depth, new_direction_alignment, new_core_alignment) =
        compute::compute_alignment(&inputs)?;
    // 3. Lissage progressif (70% ancien + 30% nouveau)
    state.alignment_depth = smooth_transition(state.alignment_depth, new_alignment_depth);
    state.direction_alignment = smooth_transition(state.direction_alignment, new_direction_alignment);
    state.core_alignment = smooth_transition(state.core_alignment, new_core_alignment);
    // 4. Clamp final strict
    clamp_all(state);
    // 5. Mise à jour timestamp
    state.last_update = current_timestamp();
    Ok(())
/// Lissage progressif 70/30
fn smooth_transition(old: f32, new: f32) -> f32 {
    (old * 0.7 + new * 0.3).clamp(0.0, 1.0)
/// Clamp strict de tous les champs
fn clamp_all(state: &mut DeepAlignmentState) {
    state.alignment_depth = state.alignment_depth.clamp(0.0, 1.0);
    state.direction_alignment = state.direction_alignment.clamp(0.0, 1.0);
    state.core_alignment = state.core_alignment.clamp(0.0, 1.0);
/// Timestamp actuel en millisecondes
fn current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or0
/// Helpers pour le diagnostic
pub fn is_aligned(state: &DeepAlignmentState) -> bool {
    state.alignment_depth > 0.7 && state.core_alignment > 0.7
pub fn is_misaligned(state: &DeepAlignmentState) -> bool {
    state.alignment_depth < 0.3 || state.core_alignment < 0.3
pub fn is_oriented(state: &DeepAlignmentState) -> bool {
    state.direction_alignment > 0.7
pub fn is_disoriented(state: &DeepAlignmentState) -> bool {
    state.direction_alignment < 0.3
pub fn status_message(state: &DeepAlignmentState) -> &'static str {
    let avg = (state.alignment_depth + state.direction_alignment + state.core_alignment) / 3.0;
    
    if avg > 0.85 {
        "ALIGNEMENT OPTIMAL"
    } else if avg > 0.7 {
        "Alignement excellent"
    } else if avg > 0.55 {
        "Alignement correct"
    } else if avg > 0.4 {
        "Alignement faible"
    } else {
        "DÉSALIGNEMENT CRITIQUE"
pub fn alignment_percentage(state: &DeepAlignmentState) -> f32 {
    ((state.alignment_depth + state.direction_alignment + state.core_alignment) / 3.0 * 100.0)
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
        assert_eq!(state.alignment_depth, 0.5);
        assert_eq!(state.direction_alignment, 0.5);
        assert_eq!(state.core_alignment, 0.5);
    fn test_smooth_transition() {
        let old = 0.6;
        let new = 0.9;
        let result = smooth_transition(old, new);
        // 0.6 * 0.7 + 0.9 * 0.3 = 0.42 + 0.27 = 0.69
        assert!((result - 0.69).abs() < 0.01);
    fn test_smooth_transition_clamping() {
        let result = smooth_transition(1.5, 1.8);
        assert_eq!(result, 1.0); // Clampé à 1.0
        let result = smooth_transition(-0.2, -0.5);
        assert_eq!(result, 0.0); // Clampé à 0.0
    fn test_clamp_all() {
        let mut state = DeepAlignmentState {
            initialized: true,
            alignment_depth: 1.5,
            direction_alignment: -0.2,
            core_alignment: 0.5,
            last_update: 0,
        };
        clamp_all(&mut state);
        assert_eq!(state.alignment_depth, 1.0);
        assert_eq!(state.direction_alignment, 0.0);
    fn test_is_aligned() {
        let state = DeepAlignmentState {
            alignment_depth: 0.8,
            direction_alignment: 0.6,
            core_alignment: 0.75,
        assert!(is_aligned(&state));
        let state2 = DeepAlignmentState {
            alignment_depth: 0.5,
        assert!(!is_aligned(&state2));
    fn test_is_misaligned() {
            alignment_depth: 0.2,
        assert!(is_misaligned(&state));
    fn test_is_oriented() {
            direction_alignment: 0.8,
        assert!(is_oriented(&state));
    fn test_is_disoriented() {
            direction_alignment: 0.2,
        assert!(is_disoriented(&state));
    fn test_status_message() {
            alignment_depth: 0.9,
            direction_alignment: 0.9,
            core_alignment: 0.9,
        assert_eq!(status_message(&state), "ALIGNEMENT OPTIMAL");
            core_alignment: 0.2,
        assert_eq!(status_message(&state2), "DÉSALIGNEMENT CRITIQUE");
    fn test_alignment_percentage() {
            alignment_depth: 0.6,
            direction_alignment: 0.7,
            core_alignment: 0.8,
        let percentage = alignment_percentage(&state);
        // (0.6 + 0.7 + 0.8) / 3 = 0.7 → 70%
        assert!((percentage - 70.0).abs() < 1.0);
    fn test_tick_full_cycle() {
        let mut state = init().unwrap();
        let deepsense = DeepSenseState {
            depth_level: 0.8,
            density_level: 0.7,
            clarity_signal: 0.9,
            last_update: 1000,
        let resonance = ResonanceState {
            coherence_score: 0.75,
            tension_level: 0.2,
            flow_level: 0.8,
            signal_buffer: Vec::new(),
            start_time: 0,
        let harmonic = HarmonicState {
            harmonic_level: 0.85,
            tension_level: 0.15,
            softness_factor: 0.9,
        let flowsync = FlowSyncState {
            flowsync_score: 0.8,
            direction_factor: 0.7,
            sync_quality: 0.85,
        let result = tick(&mut state, &deepsense, &resonance, &harmonic, &flowsync);
        // Les valeurs doivent avoir évolué
        assert!(state.alignment_depth != 0.5);
        assert!(state.direction_alignment != 0.5);
        assert!(state.core_alignment != 0.5);
        // Toutes les valeurs doivent être dans [0, 1]
        assert!(state.alignment_depth >= 0.0 && state.alignment_depth <= 1.0);
        assert!(state.direction_alignment >= 0.0 && state.direction_alignment <= 1.0);
        assert!(state.core_alignment >= 0.0 && state.core_alignment <= 1.0);

}
