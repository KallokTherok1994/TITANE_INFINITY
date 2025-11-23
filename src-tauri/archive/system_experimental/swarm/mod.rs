// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v8.0 - Swarm Mode                                                   ║
// ║ Intelligence distribuée interne et émergence collective                     ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

mod core;
mod reducer;
pub use reducer::SwarmReport;
use crate::shared::types::{TitaneResult, ModuleHealth};
use crate::shared::utils::current_timestamp;
use crate::system::adaptive_engine::AdaptiveEngineModule;
use crate::system::cortex::CortexState;
use crate::system::resonance::ResonanceState;
use crate::system::senses::innersense::InnerSenseState;
use crate::system::senses::timesense::TimeSenseState;
use crate::system::ans::ANSState;
/// État du Swarm Mode
/// 
/// Représente l'intelligence distribuée émergente du système
#[derive(Debug, Clone)]
pub struct SwarmState {
    /// Indique si le système est initialisé
    pub initialized: bool,
    
    /// Consensus global (moyenne des signaux) [0.0, 1.0]
    pub consensus: f32,
    /// Divergence (variance normalisée) [0.0, 1.0]
    pub divergence: f32,
    /// Stabilité émergente [0.0, 1.0]
    pub stability: f32,
    /// Timestamp de la dernière mise à jour (ms)
    pub last_update: u64,
}
impl SwarmState {
    /// Crée un nouvel état avec valeurs initiales optimales
    pub fn new(current_time: u64) -> Self {
        Self {
            initialized: true,
            consensus: 0.7,
            divergence: 0.2,
            stability: 0.8,
            last_update: current_time,
        }
    }
/// Normalise une valeur dans la plage [0.0, 1.0]
fn clamp(value: f32) -> f32 {
    if value.is_nan() || value.is_infinite() {
        return 0.5;
    value.max0.0.min1.0
/// Applique un lissage exponentiel entre deux valeurs
/// # Arguments
/// * `old` - Ancienne valeur
/// * `new` - Nouvelle valeur
/// * `factor` - Facteur de lissage [0.0, 1.0]
/// # Returns
/// * `f32` - Valeur lissée
fn smooth_transition(old: f32, new: f32, factor: f32) -> f32 {
    let f = clamp(factor);
    clamp(old * (1.0 - f) + new * f)
/// Initialise le Swarm Mode
/// * `TitaneResult<SwarmState>` - État initialisé
pub fn init() -> TitaneResult<SwarmState> {
    let state = SwarmState::new(current_timestamp());
    Ok(state)
/// Tick du Swarm Mode
/// Cycle complet d'intelligence distribuée :
/// 1. Générer les micro-signaux depuis tous les modules actifs
/// 2. Réduire les signaux en un état émergent cohérent
/// 3. Mettre à jour l'état global avec lissage
/// * `state` - État du Swarm à mettre à jour
/// * `adaptive` - État du moteur adaptatif
/// * `cortex` - État du Cortex Synchronique
/// * `resonance` - État de résonance
/// * `innersense` - État de perception interne
/// * `timesense` - État de perception temporelle
/// * `ans` - État du système nerveux autonome
/// * `TitaneResult<()>` - Succès ou erreur
pub fn tick(
    state: &mut SwarmState,
    adaptive: &AdaptiveEngineModule,
    cortex: &CortexState,
    resonance: &ResonanceState,
    innersense: &InnerSenseState,
    timesense: &TimeSenseState,
    ans: &ANSState,
) -> TitaneResult<()> {
    // Phase 1 : Génération des micro-signaux distribués
    let signals = core::generate_signals(
        adaptive,
        cortex,
        resonance,
        innersense,
        timesense,
        ans,
    )?;
    // Phase 2 : Réduction émergente
    let report = reducer::reduce_swarm(&signals)?;
    // Phase 3 : Mise à jour avec lissage progressif
    // Lissage doux pour éviter les variations brutales
    // Consensus : facteur 0.3 (30% nouveau, 70% ancien)
    state.consensus = smooth_transition(state.consensus, report.consensus, 0.3);
    // Divergence : facteur 0.3 (réponse modérée)
    state.divergence = smooth_transition(state.divergence, report.divergence, 0.3);
    // Stabilité : facteur 0.4 (40% nouveau, 60% ancien)
    // Réactivité légèrement plus élevée pour la stabilité
    state.stability = smooth_transition(state.stability, report.stability, 0.4);
    // Mise à jour du timestamp
    state.last_update = current_timestamp();
    log::debug!(
        "🐝 [Swarm] Consensus: {:.2}, Divergence: {:.2}, Stability: {:.2}",
        state.consensus,
        state.divergence,
        state.stability
    );
    Ok(())
/// Calcule la santé du Swarm Mode
/// Basé sur la stabilité émergente et le consensus
/// * `state` - État du Swarm
/// * `ModuleHealth` - État de santé
pub fn health(state: &SwarmState) -> ModuleHealth {
    if !state.initialized {
        return ModuleHealth::Critical;
    // Score de santé = combinaison de stabilité et consensus
    let health_score = (state.stability * 0.7 + state.consensus * 0.3);
    if health_score >= 0.7 {
        ModuleHealth::Healthy
    } else if health_score >= 0.4 {
        ModuleHealth::Degraded
    } else {
        ModuleHealth::Critical
/// Récupère un message de statut du Swarm
/// * `String` - Message de statut
pub fn status_message(state: &SwarmState) -> String {
    format!(
        "Consensus: {:.1}% | Divergence: {:.1}% | Stability: {:.1}%",
        state.consensus * 100.0,
        state.divergence * 100.0,
        state.stability * 100.0
    )
/// Détecte si le swarm est en état de cohérence élevée
/// * `bool` - True si cohérence élevée
pub fn is_highly_coherent(state: &SwarmState) -> bool {
    state.stability > 0.8 && state.divergence < 0.2
/// Détecte si le swarm est en état de désynchronisation
/// * `bool` - True si désynchronisation détectée
pub fn is_desynchronized(state: &SwarmState) -> bool {
    state.divergence > 0.6 || state.stability < 0.3
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_swarm_state_new() {
        let state = SwarmState::new1000;
        assert!(state.initialized);
        assert!(state.consensus > 0.0);
        assert!(state.divergence >= 0.0);
        assert!(state.stability > 0.0);
        assert_eq!(state.last_update, 1000);
    fn test_smooth_transition() {
        let old = 0.5;
        let new = 0.8;
        let result = smooth_transition(old, new, 0.3);
        
        // Devrait être entre 0.5 et 0.8, plus proche de 0.5
        assert!(result > 0.5);
        assert!(result < 0.8);
        assert!((result - 0.59).abs() < 0.01);
    fn test_init() {
        let result = init();
        assert!(result.is_ok());
        let state = result.unwrap();
    fn test_health() {
        let mut state = SwarmState::new1000;
        state.stability = 0.9;
        state.consensus = 0.8;
        assert_eq!(health(&state), ModuleHealth::Healthy);
        state.stability = 0.5;
        state.consensus = 0.4;
        assert_eq!(health(&state), ModuleHealth::Degraded);
        state.stability = 0.2;
        state.consensus = 0.1;
        assert_eq!(health(&state), ModuleHealth::Critical);
    fn test_is_highly_coherent() {
        state.stability = 0.85;
        state.divergence = 0.15;
        assert!(is_highly_coherent(&state));
        state.stability = 0.7;
        assert!(!is_highly_coherent(&state));
    fn test_is_desynchronized() {
        state.divergence = 0.7;
        assert!(is_desynchronized(&state));
        state.divergence = 0.2;
        state.stability = 0.8;
        assert!(!is_desynchronized(&state));

}
