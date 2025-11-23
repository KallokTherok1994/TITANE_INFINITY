// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v8.0 — Cortex Synchronique Avancé                                ║
// ║ Vision globale + intégration + homéostasie profonde                      ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

mod integrator;
mod harmonics;
pub use integrator::{CortexInputs, collect_signals};
pub use harmonics::{CortexReport, compute_harmonics};
use crate::shared::types::TitaneResult;
use crate::system::{
    field::FieldState,
    swarm::SwarmState,
    continuum::ContinuumState,
    ans::ANSState,
    resonance::ResonanceState,
    senses::innersense::InnerSenseState,
};
/// État du Cortex Synchronique - Vision globale unifiée du système
///
/// Intègre plusieurs noyaux internes, génère une vision stable,
/// mesure harmonie/cohérence/clarté, détecte tensions et déséquilibres.
#[derive(Debug, Clone)]
pub struct CortexSyncState {
    pub initialized: bool,
    pub global_clarity: f32,    // Vision globale [0.0, 1.0]
    pub harmonic_balance: f32,  // Équilibre interne [0.0, 1.0]
    pub coherence: f32,         // Cohérence globale [0.0, 1.0]
    pub alert_level: f32,       // Niveau d'alerte [0.0, 1.0]
    pub last_update: u64,       // Timestamp en millisecondes
}
impl CortexSyncState {
    /// Crée un nouvel état Cortex avec valeurs optimales
    pub fn new(timestamp: u64) -> Self {
        Self {
            initialized: true,
            global_clarity: 0.7,
            harmonic_balance: 0.7,
            coherence: 0.7,
            alert_level: 0.2,
            last_update: timestamp,
        }
    }
    /// Retourne le niveau de santé globale cohérence + balance
    pub fn health(&self) -> f32 {
        (self.coherence * 0.6 + self.harmonic_balance * 0.4).clamp(0.0, 1.0)
    /// Détecte si le système est dans un état optimal
    pub fn is_optimal(&self) -> bool {
        self.coherence > 0.7 && self.harmonic_balance > 0.7 && self.alert_level < 0.3
    /// Détecte si le système nécessite attention
    pub fn needs_attention(&self) -> bool {
        self.alert_level > 0.6 || self.coherence < 0.4 || self.harmonic_balance < 0.4
    /// Message de diagnostic
    pub fn status_message(&self) -> String {
        if self.is_optimal() {
            format!(
                "Cortex OPTIMAL - Clarté: {:.2}, Cohérence: {:.2}",
                self.global_clarity, self.coherence
            )
        } else if self.needs_attention() {
                "Cortex ATTENTION - Alerte: {:.2}, Balance: {:.2}",
                self.alert_level, self.harmonic_balance
        } else {
                "Cortex STABLE - Santé: {:.2}, Clarté: {:.2}",
                self.health(),
                self.global_clarity
/// Initialise le Cortex Synchronique
pub fn init() -> TitaneResult<CortexSyncState> {
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| format!("Erreur timestamp: {}", e))?
        .as_millis() as u64;
    Ok(CortexSyncState::new(timestamp))
/// Tick du Cortex Synchronique - Met à jour la vision globale
/// # Arguments
/// * `state` - État mutable du Cortex
/// * `field` - État du Field Engine
/// * `swarm` - État du Swarm Mode
/// * `continuum` - État du Meta-Continuum
/// * `ans` - État de l'ANS
/// * `resonance` - État de Resonance
/// * `innersense` - État InnerSense
/// # Pipeline
/// 1. Collecte des signaux (integrator::collect_signals)
/// 2. Calcul des harmoniques (harmonics::compute_harmonics)
/// 3. Lissage progressif (70% ancien / 30% nouveau)
/// 4. Mise à jour de l'état
pub fn tick(
    state: &mut CortexSyncState,
    field: &FieldState,
    swarm: &SwarmState,
    continuum: &ContinuumState,
    ans: &ANSState,
    resonance: &ResonanceState,
    innersense: &InnerSenseState,
) -> TitaneResult<()> {
    // 1. Collecte des signaux internes
    let inputs = integrator::collect_signals(field, swarm, continuum, ans, resonance, innersense)?;
    // 2. Calcul des harmoniques globales
    let report = harmonics::compute_harmonics(&inputs)?;
    // 3. Lissage progressif (70% ancien + 30% nouveau)
    const SMOOTH_OLD: f32 = 0.7;
    const SMOOTH_NEW: f32 = 0.3;
    state.global_clarity = smooth_transition(
        state.global_clarity,
        report.global_clarity,
        SMOOTH_OLD,
        SMOOTH_NEW,
    );
    state.harmonic_balance = smooth_transition(
        state.harmonic_balance,
        report.harmonic_balance,
    state.coherence =
        smooth_transition(state.coherence, report.coherence, SMOOTH_OLD, SMOOTH_NEW);
    state.alert_level =
        smooth_transition(state.alert_level, report.alert_level, SMOOTH_OLD, SMOOTH_NEW);
    // 4. Clamp final de sécurité
    state.global_clarity = clamp(state.global_clarity);
    state.harmonic_balance = clamp(state.harmonic_balance);
    state.coherence = clamp(state.coherence);
    state.alert_level = clamp(state.alert_level);
    // 5. Mise à jour timestamp
    state.last_update = std::time::SystemTime::now()
    Ok(())
/// Transition lissée entre ancienne et nouvelle valeur
#[inline]
fn smooth_transition(old: f32, new: f32, factor_old: f32, factor_new: f32) -> f32 {
    old * factor_old + new * factor_new
/// Borne une valeur entre 0.0 et 1.0
fn clamp(value: f32) -> f32 {
    if value < 0.0 {
        0.0
    } else if value > 1.0 {
        1.0
    } else {
        value
// ═══════════════════════════════════════════════════════════════════════════
// Tests
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_cortex_sync_state_new() {
        let state = CortexSyncState::new1000;
        assert!(state.initialized);
        assert_eq!(state.global_clarity, 0.7);
        assert_eq!(state.harmonic_balance, 0.7);
        assert_eq!(state.coherence, 0.7);
        assert_eq!(state.alert_level, 0.2);
    fn test_cortex_health() {
        let mut state = CortexSyncState::new1000;
        state.coherence = 0.8;
        state.harmonic_balance = 0.7;
        let health = state.health();
        let expected = 0.8 * 0.6 + 0.7 * 0.4; // 0.76
        assert!(health - expected.abs() < 0.01);
    fn test_cortex_is_optimal() {
        state.coherence = 0.75;
        state.harmonic_balance = 0.75;
        state.alert_level = 0.2;
        assert!(state.is_optimal());
        state.alert_level = 0.4;
        assert!(!state.is_optimal());
    fn test_cortex_needs_attention() {
        state.alert_level = 0.7;
        assert!(state.needs_attention());
        state.alert_level = 0.3;
        state.coherence = 0.3;
    fn test_cortex_init() {
        let result = init();
        assert!(result.is_ok());
        let state = result.unwrap();
    fn test_smooth_transition() {
        let result = smooth_transition(0.5, 0.8, 0.7, 0.3);
        let expected = 0.5 * 0.7 + 0.8 * 0.3; // 0.59
        assert!(result - expected.abs() < 0.001);
    fn test_clamp() {
        assert_eq!(clamp(-0.5), 0.0);
        assert_eq!(clamp0.5, 0.5);
        assert_eq!(clamp1.5, 1.0);

}
