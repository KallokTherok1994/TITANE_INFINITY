// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v8.0 — Field Engine (Champ Cognitif Interne)                    ║
// ║ Analyse du climat mental : courants, pression, turbulence, orientation   ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

mod analyzer;
mod compute;
pub use analyzer::FieldInputs;
use crate::shared::types::TitaneResult;
use crate::system::{
    swarm::SwarmState,
    ans::ANSState,
    resonance::ResonanceState,
    senses::{innersense::InnerSenseState, timesense::TimeSenseState},
};
/// État du Field Engine - Champ cognitif interne
///
/// Représente la "météo mentale" du système avec 4 dimensions :
/// * **currents** - Direction dominante (flux + direction temporelle)
/// * **pressure** - Intensité interne tension + divergence
/// * **turbulence** - Instabilité du système (écart, chaos)
/// * **orientation** - Lecture globale tridimensionnelle
#[derive(Debug, Clone)]
pub struct FieldState {
    pub initialized: bool,
    pub currents: f32,      // Direction dominante [0.0, 1.0]
    pub pressure: f32,      // Intensité interne [0.0, 1.0]
    pub turbulence: f32,    // Instabilité [0.0, 1.0]
    pub orientation: f32,   // Lecture globale [0.0, 1.0]
    pub last_update: u64,   // Timestamp en millisecondes
}
impl FieldState {
    /// Crée un nouvel état Field avec valeurs par défaut
    pub fn new(timestamp: u64) -> Self {
        Self {
            initialized: true,
            currents: 0.5,
            pressure: 0.4,
            turbulence: 0.3,
            orientation: 0.5,
            last_update: timestamp,
        }
    }
    /// Retourne le niveau de stabilité du champ (0.0 = instable, 1.0 = stable)
    pub fn stability(&self) -> f32 {
        // Stabilité = moyenne pondérée : faible turbulence + orientation claire
        let stability = (1.0 - self.turbulence) * 0.6 + self.orientation * 0.4;
        clamp(stability)
    /// Retourne le niveau d'intensité globale pression + courants
    pub fn intensity(&self) -> f32 {
        let intensity = (self.pressure + self.currents) / 2.0;
        clamp(intensity)
    /// Détecte si le champ est dans un état critique
    pub fn is_critical(&self) -> bool {
        self.turbulence > 0.7 || self.pressure > 0.8
    /// Détecte si le champ est stable et orienté
    pub fn is_stable(&self) -> bool {
        self.turbulence < 0.3 && self.orientation > 0.6
    /// Message de diagnostic du champ
    pub fn status_message(&self) -> String {
        if self.is_critical() {
            format!(
                "Field CRITIQUE - Turbulence: {:.2}, Pression: {:.2}",
                self.turbulence, self.pressure
            )
        } else if self.is_stable() {
                "Field STABLE - Orientation: {:.2}, Courants: {:.2}",
                self.orientation, self.currents
        } else {
                "Field NORMAL - Stabilité: {:.2}, Intensité: {:.2}",
                self.stability(),
                self.intensity()
/// Initialise le Field Engine
pub fn init() -> TitaneResult<FieldState> {
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| format!("Erreur timestamp: {}", e))?
        .as_millis() as u64;
    Ok(FieldState::new(timestamp))
/// Tick du Field Engine - Met à jour le champ cognitif
/// # Arguments
/// * `state` - État mutable du Field Engine
/// * `swarm` - État du Swarm Mode
/// * `ans` - État de l'ANS
/// * `resonance` - État de Resonance
/// * `innersense` - État InnerSense
/// * `timesense` - État TimeSense
/// # Pipeline
/// 1. Collecte des inputs (analyzer::collect_field_inputs)
/// 2. Calcul du champ (compute::compute_field)
/// 3. Lissage progressif (70% ancien / 30% nouveau)
/// 4. Mise à jour de l'état
pub fn tick(
    state: &mut FieldState,
    swarm: &SwarmState,
    ans: &ANSState,
    resonance: &ResonanceState,
    innersense: &InnerSenseState,
    timesense: &TimeSenseState,
) -> TitaneResult<()> {
    // 1. Collecte des signaux internes
    let inputs = analyzer::collect_field_inputs(swarm, ans, resonance, innersense, timesense)?;
    // 2. Calcul du champ cognitif
    let (new_currents, new_pressure, new_turbulence, new_orientation) =
        compute::compute_field(&inputs)?;
    // 3. Lissage progressif pour éviter les oscillations
    // 70% ancienne valeur + 30% nouvelle valeur
    const SMOOTH_OLD: f32 = 0.7;
    const SMOOTH_NEW: f32 = 0.3;
    state.currents = smooth_transition(state.currents, new_currents, SMOOTH_OLD, SMOOTH_NEW);
    state.pressure = smooth_transition(state.pressure, new_pressure, SMOOTH_OLD, SMOOTH_NEW);
    state.turbulence =
        smooth_transition(state.turbulence, new_turbulence, SMOOTH_OLD, SMOOTH_NEW);
    state.orientation =
        smooth_transition(state.orientation, new_orientation, SMOOTH_OLD, SMOOTH_NEW);
    // 4. Clamp final de sécurité
    state.currents = clamp(state.currents);
    state.pressure = clamp(state.pressure);
    state.turbulence = clamp(state.turbulence);
    state.orientation = clamp(state.orientation);
    // 5. Mise à jour du timestamp
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
    fn test_field_state_new() {
        let state = FieldState::new1000;
        assert!(state.initialized);
        assert!(state.currents >= 0.0 && state.currents <= 1.0);
        assert!(state.pressure >= 0.0 && state.pressure <= 1.0);
        assert!(state.turbulence >= 0.0 && state.turbulence <= 1.0);
        assert!(state.orientation >= 0.0 && state.orientation <= 1.0);
        assert_eq!(state.last_update, 1000);
    fn test_field_stability() {
        let mut state = FieldState::new1000;
        
        // État stable : faible turbulence + bonne orientation
        state.turbulence = 0.2;
        state.orientation = 0.8;
        assert!(state.stability() > 0.7);
        // État instable : forte turbulence + mauvaise orientation
        state.turbulence = 0.8;
        state.orientation = 0.3;
        assert!(state.stability() < 0.4);
    fn test_field_intensity() {
        state.pressure = 0.6;
        state.currents = 0.8;
        let intensity = state.intensity();
        assert!((intensity - 0.7).abs() < 0.01); // (0.6 + 0.8) / 2 = 0.7
    fn test_field_is_critical() {
        // Turbulence critique
        state.turbulence = 0.75;
        assert!(state.is_critical());
        // Pression critique
        state.turbulence = 0.3;
        state.pressure = 0.85;
        // État normal
        state.turbulence = 0.4;
        state.pressure = 0.5;
        assert!(!state.is_critical());
    fn test_field_is_stable() {
        // État stable
        state.orientation = 0.7;
        assert!(state.is_stable());
        // État instable
        state.turbulence = 0.5;
        state.orientation = 0.4;
        assert!(!state.is_stable());
    fn test_smooth_transition() {
        let old = 0.5;
        let new = 0.8;
        let result = smooth_transition(old, new, 0.7, 0.3);
        let expected = 0.5 * 0.7 + 0.8 * 0.3; // = 0.35 + 0.24 = 0.59
        assert!(result - expected.abs() < 0.001);
    fn test_clamp() {
        assert_eq!(clamp(-0.5), 0.0);
        assert_eq!(clamp0.0, 0.0);
        assert_eq!(clamp0.5, 0.5);
        assert_eq!(clamp1.0, 1.0);
        assert_eq!(clamp1.5, 1.0);
    fn test_field_init() {
        let result = init();
        assert!(result.is_ok());
        let state = result.unwrap();
    fn test_field_status_message() {
        // État critique
        let msg = state.status_message();
        assert!(msg.contains("CRITIQUE"));
        assert!(msg.contains("STABLE"));
        state.orientation = 0.5;
        assert!(msg.contains("NORMAL"));

}
