// TITANE∞ v8.0 - Evolution Engine
// Module principal d'évolution

pub mod collect;
pub mod compute;
pub mod history;
pub use history::EvolutionHistory;
use crate::system::adaptive::AdaptiveIntelligenceState;
use crate::system::conscience::ConscienceState;
use crate::system::metacortex::MetaCortexState;
use crate::system::continuum::ContinuumState;
use crate::system::neurofield::NeuroFieldState;
use crate::system::neuromesh::NeuroMeshState;
/// État de l'Evolution Engine
#[derive(Debug, Clone)]
pub struct EvolutionState {
    pub initialized: bool,
    pub evolution_momentum: f32,
    pub growth_potential: f32,
    pub trajectory_stability: f32,
    pub last_update: u64,
}
pub fn init() -> Result<EvolutionState, String> {
    Ok(EvolutionState {
        initialized: true,
        evolution_momentum: 0.5,
        growth_potential: 0.5,
        trajectory_stability: 0.5,
        last_update: current_timestamp(),
    })
pub fn tick(
    state: &mut EvolutionState,
    adaptive: &AdaptiveIntelligenceState,
    conscience: &ConscienceState,
    metacortex: &MetaCortexState,
    continuum: &ContinuumState,
    neurofield: &NeuroFieldState,
    neuromesh: &NeuroMeshState,
    history: &mut EvolutionHistory,
) -> Result<(), String> {
    if !state.initialized {
        return Err("Evolution non initialisé".to_string());
    }
    // 1. Collecter
    let inputs = collect::collect_evolution_inputs(
        adaptive, conscience, metacortex, continuum, neurofield, neuromesh,
    )?;
    // 2. Calculer trend depuis l'historique
    let trend = history.trend();
    // 3. Calculer nouvelles valeurs
    let (new_momentum, new_growth, new_stability) = compute::compute_evolution(&inputs, trend)?;
    // 4. Lisser 70/30
    state.evolution_momentum = smooth_transition(state.evolution_momentum, new_momentum);
    state.growth_potential = smooth_transition(state.growth_potential, new_growth);
    state.trajectory_stability = smooth_transition(state.trajectory_stability, new_stability);
    // 5. Clamp
    clamp_all(state);
    // 6. Push dans l'historique
    let avg = (state.evolution_momentum + state.growth_potential + state.trajectory_stability) / 3.0;
    history.push(avg);
    // 7. Update timestamp
    state.last_update = current_timestamp();
    Ok(())
fn smooth_transition(old: f32, new: f32) -> f32 {
    (old * 0.7 + new * 0.3).clamp(0.0, 1.0)
fn clamp_all(state: &mut EvolutionState) {
    state.evolution_momentum = state.evolution_momentum.clamp(0.0, 1.0);
    state.growth_potential = state.growth_potential.clamp(0.0, 1.0);
    state.trajectory_stability = state.trajectory_stability.clamp(0.0, 1.0);
fn current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or0
// Helpers
pub fn is_evolving(state: &EvolutionState) -> bool {
    state.evolution_momentum > 0.7 && state.growth_potential > 0.7
pub fn is_stagnant(state: &EvolutionState) -> bool {
    state.evolution_momentum < 0.3
pub fn has_growth_potential(state: &EvolutionState) -> bool {
    state.growth_potential > 0.7
pub fn is_stable_trajectory(state: &EvolutionState) -> bool {
    state.trajectory_stability > 0.7
pub fn is_chaotic(state: &EvolutionState) -> bool {
    state.trajectory_stability < 0.3
pub fn status_message(state: &EvolutionState) -> &'static str {
    
    if avg > 0.85 {
        "ÉVOLUTION OPTIMALE"
    } else if avg > 0.7 {
        "Évolution excellente"
    } else if avg > 0.55 {
        "Évolution correcte"
    } else if avg > 0.4 {
        "Évolution faible"
    } else {
        "STAGNATION CRITIQUE"
pub fn evolution_percentage(state: &EvolutionState) -> f32 {
    ((state.evolution_momentum + state.growth_potential + state.trajectory_stability) / 3.0 * 100.0)
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
        assert_eq!(state.evolution_momentum, 0.5);
        assert_eq!(state.growth_potential, 0.5);
        assert_eq!(state.trajectory_stability, 0.5);
    fn test_smooth_transition() {
        let result = smooth_transition(0.6, 0.9);
        assert!((result - 0.69).abs() < 0.01);
    fn test_is_evolving() {
        let state = EvolutionState {
            initialized: true,
            evolution_momentum: 0.8,
            growth_potential: 0.75,
            trajectory_stability: 0.5,
            last_update: 0,
        };
        assert!(is_evolving(&state));
    fn test_is_stagnant() {
            evolution_momentum: 0.2,
            growth_potential: 0.5,
        assert!(is_stagnant(&state));
    fn test_has_growth_potential() {
            evolution_momentum: 0.5,
            growth_potential: 0.8,
        assert!(has_growth_potential(&state));
    fn test_is_stable_trajectory() {
            trajectory_stability: 0.8,
        assert!(is_stable_trajectory(&state));
    fn test_is_chaotic() {
            trajectory_stability: 0.2,
        assert!(is_chaotic(&state));
    fn test_status_message() {
            evolution_momentum: 0.9,
            growth_potential: 0.9,
            trajectory_stability: 0.9,
        assert_eq!(status_message(&state), "ÉVOLUTION OPTIMALE");
    fn test_evolution_percentage() {
            evolution_momentum: 0.6,
            growth_potential: 0.7,
        let percentage = evolution_percentage(&state);
        assert!((percentage - 70.0).abs() < 1.0);
    fn test_clamp_all() {
        let mut state = EvolutionState {
            evolution_momentum: 1.5,
            growth_potential: -0.2,
        clamp_all(&mut state);
        assert_eq!(state.evolution_momentum, 1.0);
        assert_eq!(state.growth_potential, 0.0);

}
