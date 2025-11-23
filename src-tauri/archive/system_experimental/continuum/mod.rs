// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v8.0 — Meta-Continuum Engine                                     ║
// ║ Dynamique temporelle + tendance + momentum + stabilité long terme        ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

pub mod history;
pub mod trend;
pub use history::{Snapshot, record_snapshot};
pub use trend::{ContinuumReport, compute_trend};
use crate::shared::types::TitaneResult;
use crate::system::{
    field::FieldState,
    swarm::SwarmState,
    ans::ANSState,
    resonance::ResonanceState,
    senses::timesense::TimeSenseState,
};
/// État du Meta-Continuum - Dynamique temporelle du système
///
/// Observe l'évolution interne, enregistre l'historique compact,
/// analyse les tendances, mesure le momentum, détecte progression ou dérive.
#[derive(Debug, Clone)]
pub struct ContinuumState {
    pub initialized: bool,
    pub momentum: f32,          // Vitesse d'évolution [0.0, 1.0]
    pub direction: f32,         // Direction globale [0.0, 1.0]
    pub progression: f32,       // Mouvement vers cohérence [0.0, 1.0]
    pub stability_trend: f32,   // Tendance de stabilité [0.0, 1.0]
    pub last_update: u64,       // Timestamp en millisecondes
}
impl ContinuumState {
    /// Crée un nouvel état Continuum avec valeurs par défaut
    pub fn new(timestamp: u64) -> Self {
        Self {
            initialized: true,
            momentum: 0.5,
            direction: 0.5,
            progression: 0.5,
            stability_trend: 0.5,
            last_update: timestamp,
        }
    }
    /// Retourne le niveau de dynamisme momentum + progression
    pub fn dynamism(&self) -> f32 {
        (self.momentum + self.progression) / 2.0
    /// Retourne si le système est en progression positive
    pub fn is_progressing(&self) -> bool {
        self.progression > 0.6 && self.stability_trend > 0.5
    /// Retourne si le système dérive (régression)
    pub fn is_drifting(&self) -> bool {
        self.progression < 0.4 || self.stability_trend < 0.4
    /// Message de diagnostic
    pub fn status_message(&self) -> String {
        if self.is_progressing() {
            format!(
                "Continuum PROGRESSION - Momentum: {:.2}, Progression: {:.2}",
                self.momentum, self.progression
            )
        } else if self.is_drifting() {
                "Continuum DÉRIVE - Progression: {:.2}, Tendance: {:.2}",
                self.progression, self.stability_trend
        } else {
                "Continuum STABLE - Direction: {:.2}, Dynamisme: {:.2}",
                self.direction,
                self.dynamism()
/// Initialise le Meta-Continuum Engine
pub fn init() -> TitaneResult<ContinuumState> {
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| format!("Erreur timestamp: {}", e))?
        .as_millis() as u64;
    Ok(ContinuumState::new(timestamp))
/// Tick du Meta-Continuum - Met à jour la dynamique temporelle
/// # Arguments
/// * `state` - État mutable du Continuum
/// * `field` - État du Field Engine
/// * `swarm` - État du Swarm Mode
/// * `ans` - État de l'ANS
/// * `resonance` - État de Resonance
/// * `time` - État TimeSense
/// # Pipeline
/// 1. Les snapshots sont enregistrés par le scheduler (history::record_snapshot)
/// 2. Le rapport de tendance est calculé (trend::compute_trend)
/// 3. L'état est mis à jour avec lissage (70% ancien / 30% nouveau)
/// Note: Cette fonction ne gère PAS l'historique directement, 
/// elle attend que compute_trend() soit appelé en amont par le scheduler.
pub fn tick(
    state: &mut ContinuumState,
    _field: &FieldState,
    _swarm: &SwarmState,
    _ans: &ANSState,
    _resonance: &ResonanceState,
    _time: &TimeSenseState,
) -> TitaneResult<()> {
    // Note: Le scheduler doit appeler history::record_snapshot et trend::compute_trend
    // avant d'appeler tick(). Cette fonction se concentre sur la mise à jour de l'état.
    
    // Pour l'instant, cette fonction est un placeholder.
    // L'état sera mis à jour directement par le scheduler après compute_trend().
    // Mise à jour du timestamp
    state.last_update = std::time::SystemTime::now()
    Ok(())
/// Met à jour l'état Continuum avec un rapport de tendance (avec lissage)
pub fn update_from_report(state: &mut ContinuumState, report: &ContinuumReport) {
    // Lissage progressif : 70% ancien + 30% nouveau
    const SMOOTH_OLD: f32 = 0.7;
    const SMOOTH_NEW: f32 = 0.3;
    state.momentum = smooth_transition(state.momentum, report.momentum, SMOOTH_OLD, SMOOTH_NEW);
    state.direction = smooth_transition(state.direction, report.direction, SMOOTH_OLD, SMOOTH_NEW);
    state.progression =
        smooth_transition(state.progression, report.progression, SMOOTH_OLD, SMOOTH_NEW);
    state.stability_trend = smooth_transition(
        state.stability_trend,
        report.stability_trend,
        SMOOTH_OLD,
        SMOOTH_NEW,
    );
    // Clamp final
    state.momentum = clamp(state.momentum);
    state.direction = clamp(state.direction);
    state.progression = clamp(state.progression);
    state.stability_trend = clamp(state.stability_trend);
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
    fn test_continuum_state_new() {
        let state = ContinuumState::new1000;
        assert!(state.initialized);
        assert_eq!(state.momentum, 0.5);
        assert_eq!(state.direction, 0.5);
        assert_eq!(state.progression, 0.5);
        assert_eq!(state.stability_trend, 0.5);
        assert_eq!(state.last_update, 1000);
    fn test_continuum_dynamism() {
        let mut state = ContinuumState::new1000;
        state.momentum = 0.6;
        state.progression = 0.8;
        assert_eq!(state.dynamism(), 0.7);
    fn test_continuum_is_progressing() {
        state.progression = 0.7;
        state.stability_trend = 0.6;
        assert!(state.is_progressing());
        state.progression = 0.5;
        assert!(!state.is_progressing());
    fn test_continuum_is_drifting() {
        state.progression = 0.3;
        assert!(state.is_drifting());
        state.progression = 0.6;
        state.stability_trend = 0.3;
        assert!(!state.is_drifting());
    fn test_continuum_init() {
        let result = init();
        assert!(result.is_ok());
        let state = result.unwrap();
    fn test_update_from_report() {
        state.momentum = 0.5;
        let report = ContinuumReport {
            momentum: 0.8,
            direction: 0.7,
            progression: 0.6,
            stability_trend: 0.9,
        };
        update_from_report(&mut state, &report);
        // Avec lissage 0.7/0.3 : 0.5*0.7 + 0.8*0.3 = 0.35 + 0.24 = 0.59
        assert!((state.momentum - 0.59).abs() < 0.01);
    fn test_smooth_transition() {
        let result = smooth_transition(0.5, 0.8, 0.7, 0.3);
        let expected = 0.5 * 0.7 + 0.8 * 0.3; // 0.59
        assert!(result - expected.abs() < 0.001);
    fn test_clamp() {
        assert_eq!(clamp(-0.5), 0.0);
        assert_eq!(clamp0.5, 0.5);
        assert_eq!(clamp1.5, 1.0);

}
