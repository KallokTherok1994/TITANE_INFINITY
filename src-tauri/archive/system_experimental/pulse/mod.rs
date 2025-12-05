// PULSE ENGINE — Module Principal
// Rythme interne, cadence et respiration du système TITANE∞

pub mod collect;
pub mod compute;
use crate::system::stability::StabilityState;
use crate::system::balance::BalanceState;
use crate::system::secureflow::SecureFlowState;
use crate::system::lowflow::LowFlowState;
use crate::system::field::FieldState;
/// État du moteur de pulsation
#[derive(Debug, Clone)]
pub struct PulseState {
    pub initialized: bool,
    pub pulse_rate: f32,
    pub pulse_intensity: f32,
    pub rhythm_factor: f32,
    pub last_update: u64,
}
impl PulseState {
    /// Crée un nouvel état avec valeurs par défaut
    fn new() -> Self {
        Self {
            initialized: false,
            pulse_rate: 0.0,
            pulse_intensity: 0.0,
            rhythm_factor: 0.0,
            last_update: 0,
        }
    }
    /// Lisse progressivement la transition (70% ancien / 30% nouveau)
    fn smooth_transition(&self, new_rate: f32, new_intensity: f32, new_rhythm: f32) -> (f32, f32, f32) {
        let smoothed_rate = self.pulse_rate * 0.7 + new_rate * 0.3;
        let smoothed_intensity = self.pulse_intensity * 0.7 + new_intensity * 0.3;
        let smoothed_rhythm = self.rhythm_factor * 0.7 + new_rhythm * 0.3;
        (
            clamp(smoothed_rate),
            clamp(smoothed_intensity),
            clamp(smoothed_rhythm),
        )
    /// Clamp tous les champs [0.0, 1.0]
    fn clamp_all(&mut self) {
        self.pulse_rate = clamp(self.pulse_rate);
        self.pulse_intensity = clamp(self.pulse_intensity);
        self.rhythm_factor = clamp(self.rhythm_factor);
/// Initialise le Pulse Engine
pub fn init() -> Result<PulseState, String> {
    let mut state = PulseState::new();
    state.initialized = true;
    Ok(state)
/// Met à jour le pouls interne (tick)
pub fn tick(
    state: &mut PulseState,
    stability: &StabilityState,
    balance: &BalanceState,
    secureflow: &SecureFlowState,
    lowflow: &LowFlowState,
    field: &FieldState,
) -> Result<(), String> {
    // 1. Collecter les signaux
    let inputs = collect::collect_pulse_inputs(stability, balance, secureflow, lowflow, field)
        .map_err(|e| format!("Erreur collecte signaux pulse: {}", e))?;
    // 2. Calculer les métriques
    let (new_rate, new_intensity, new_rhythm) = compute::compute_pulse(&inputs)
        .map_err(|e| format!("Erreur calcul pulse: {}", e))?;
    // 3. Lisser la transition (si déjà initialisé)
    let (final_rate, final_intensity, final_rhythm) = if state.initialized {
        state.smooth_transition(new_rate, new_intensity, new_rhythm)
    } else {
        (new_rate, new_intensity, new_rhythm)
    };
    // 4. Mettre à jour l'état
    state.pulse_rate = final_rate;
    state.pulse_intensity = final_intensity;
    state.rhythm_factor = final_rhythm;
    // 5. Clamp strict
    state.clamp_all();
    // 6. Update timestamp
    state.last_update = state.last_update.wrapping_add1;
    Ok(())
/// Clamp strict [0.0, 1.0]
fn clamp(value: f32) -> f32 {
    value.max0.0.min1.0
// Helpers publics pour requêtes d'état
/// Vérifie si le pouls est fluide (rate >= 0.75)
pub fn is_fluid(state: &PulseState) -> bool {
    state.pulse_rate >= 0.75
/// Vérifie si le pouls est faible (rate < 0.40)
pub fn is_weak(state: &PulseState) -> bool {
    state.pulse_rate < 0.40
/// Vérifie si le rythme est harmonieux (rhythm_factor >= 0.70)
pub fn is_rhythmic(state: &PulseState) -> bool {
    state.rhythm_factor >= 0.70
/// Message de statut en français
pub fn status_message(state: &PulseState) -> String {
    match state.pulse_rate {
        r if r >= 0.85 => "EXCELLENT — Pouls optimal — Rythme fluide".to_string(),
        r if r >= 0.70 => "BON — Pouls stable — Rythme régulier".to_string(),
        r if r >= 0.50 => "MODÉRÉ — Pouls acceptable — Surveillance requise".to_string(),
        r if r >= 0.30 => "FAIBLE — Pouls ralenti — Attention nécessaire".to_string(),
        _ => "CRITIQUE — Pouls très faible — Intervention urgente".to_string(),
/// Conversion en pourcentage (pour dashboard)
pub fn pulse_percentage(state: &PulseState) -> f32 {
    state.pulse_rate * 100.0
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_init() {
        let state = init();
        assert!(state.is_ok());
        let s = state.unwrap();
        assert!(s.initialized);
        assert_eq!(s.pulse_rate, 0.0);
        assert_eq!(s.pulse_intensity, 0.0);
        assert_eq!(s.rhythm_factor, 0.0);
    fn test_smooth_transition() {
        let state = PulseState {
            initialized: true,
            pulse_rate: 0.5,
            pulse_intensity: 0.6,
            rhythm_factor: 0.55,
            last_update: 10,
        };
        let (smoothed_rate, smoothed_intensity, smoothed_rhythm) =
            state.smooth_transition(0.8, 0.9, 0.85);
        // Vérification lissage 70%/30%
        assert!((smoothed_rate - (0.5 * 0.7 + 0.8 * 0.3)).abs() < 0.01);
        assert!((smoothed_intensity - (0.6 * 0.7 + 0.9 * 0.3)).abs() < 0.01);
        assert!((smoothed_rhythm - (0.55 * 0.7 + 0.85 * 0.3)).abs() < 0.01);
    fn test_clamp_all() {
        let mut state = PulseState {
            pulse_rate: 1.5, // Invalide
            pulse_intensity: -0.2, // Invalide
            rhythm_factor: 0.5,
        state.clamp_all();
        assert_eq!(state.pulse_rate, 1.0);
        assert_eq!(state.pulse_intensity, 0.0);
        assert!(state.rhythm_factor >= 0.0 && state.rhythm_factor <= 1.0);
    fn test_is_fluid() {
            pulse_rate: 0.80,
            pulse_intensity: 0.5,
        assert!(is_fluid(&state));
        let state2 = PulseState {
            pulse_rate: 0.70,
            ..state
        assert!(!is_fluid(&state2));
    fn test_is_weak() {
            pulse_rate: 0.35,
        assert!(is_weak(&state));
            pulse_rate: 0.45,
        assert!(!is_weak(&state2));
    fn test_is_rhythmic() {
            rhythm_factor: 0.75,
        assert!(is_rhythmic(&state));
    fn test_status_excellent() {
            pulse_rate: 0.90,
            pulse_intensity: 0.85,
            rhythm_factor: 0.88,
        let msg = status_message(&state);
        assert!(msg.contains("EXCELLENT"));
    fn test_status_critique() {
            pulse_rate: 0.25,
            pulse_intensity: 0.20,
            rhythm_factor: 0.30,
        assert!(msg.contains("CRITIQUE"));
    fn test_pulse_percentage() {
            pulse_rate: 0.75,
        assert_eq!(pulse_percentage(&state), 75.0);

}
