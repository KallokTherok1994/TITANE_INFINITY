// HARMONIC ENGINE — Module Principal
// Harmonie interne et cohérence vibratoire du système

pub mod collect;
pub mod compute;
use crate::system::flowsync::FlowSyncState;
use crate::system::pulse::PulseState;
use crate::system::balance::BalanceState;
use crate::system::field::FieldState;
/// État du moteur harmonique
#[derive(Debug, Clone)]
pub struct HarmonicState {
    pub initialized: bool,
    pub harmonic_level: f32,
    pub tension_level: f32,
    pub softness_factor: f32,
    pub last_update: u64,
}
impl HarmonicState {
    /// Crée un nouvel état avec valeurs par défaut
    fn new() -> Self {
        Self {
            initialized: false,
            harmonic_level: 0.0,
            tension_level: 0.0,
            softness_factor: 0.0,
            last_update: 0,
        }
    }
    /// Lisse progressivement la transition (70% ancien / 30% nouveau)
    fn smooth_transition(&self, new_harmonic: f32, new_tension: f32, new_softness: f32) -> (f32, f32, f32) {
        let smoothed_harmonic = self.harmonic_level * 0.7 + new_harmonic * 0.3;
        let smoothed_tension = self.tension_level * 0.7 + new_tension * 0.3;
        let smoothed_softness = self.softness_factor * 0.7 + new_softness * 0.3;
        (
            clamp(smoothed_harmonic),
            clamp(smoothed_tension),
            clamp(smoothed_softness),
        )
    /// Clamp tous les champs [0.0, 1.0]
    fn clamp_all(&mut self) {
        self.harmonic_level = clamp(self.harmonic_level);
        self.tension_level = clamp(self.tension_level);
        self.softness_factor = clamp(self.softness_factor);
/// Initialise le Harmonic Engine
pub fn init() -> Result<HarmonicState, String> {
    let mut state = HarmonicState::new();
    state.initialized = true;
    Ok(state)
/// Met à jour l'harmonie interne (tick)
pub fn tick(
    state: &mut HarmonicState,
    flowsync: &FlowSyncState,
    pulse: &PulseState,
    balance: &BalanceState,
    field: &FieldState,
) -> Result<(), String> {
    // 1. Collecter les signaux
    let inputs = collect::collect_harmonic_inputs(flowsync, pulse, balance, field)
        .map_err(|e| format!("Erreur collecte signaux harmonic: {}", e))?;
    // 2. Calculer les métriques
    let (new_harmonic, new_tension, new_softness) = compute::compute_harmonic(&inputs)
        .map_err(|e| format!("Erreur calcul harmonic: {}", e))?;
    // 3. Lisser la transition (si déjà initialisé)
    let (final_harmonic, final_tension, final_softness) = if state.initialized {
        state.smooth_transition(new_harmonic, new_tension, new_softness)
    } else {
        (new_harmonic, new_tension, new_softness)
    };
    // 4. Mettre à jour l'état
    state.harmonic_level = final_harmonic;
    state.tension_level = final_tension;
    state.softness_factor = final_softness;
    // 5. Clamp strict
    state.clamp_all();
    // 6. Update timestamp
    state.last_update = state.last_update.wrapping_add1;
    Ok(())
/// Clamp strict [0.0, 1.0]
fn clamp(value: f32) -> f32 {
    value.max0.0.min1.0
// Helpers publics pour requêtes d'état
/// Vérifie si le système est harmonieux (harmonic_level >= 0.75)
pub fn is_harmonious(state: &HarmonicState) -> bool {
    state.harmonic_level >= 0.75
/// Vérifie si le système est tendu (tension_level >= 0.60)
pub fn is_tense(state: &HarmonicState) -> bool {
    state.tension_level >= 0.60
/// Vérifie si le système est fluide (softness_factor >= 0.70)
pub fn is_soft(state: &HarmonicState) -> bool {
    state.softness_factor >= 0.70
/// Vérifie si le système est dissonant (harmonic_level < 0.40)
pub fn is_dissonant(state: &HarmonicState) -> bool {
    state.harmonic_level < 0.40
/// Message de statut en français
pub fn status_message(state: &HarmonicState) -> String {
    match state.harmonic_level {
        h if h >= 0.85 => "HARMONIEUX — Cohérence vibratoire optimale — Douceur maximale".to_string(),
        h if h >= 0.70 => "ÉQUILIBRÉ — Harmonie préservée — Tensions minimes".to_string(),
        h if h >= 0.50 => "ACCEPTABLE — Harmonie partielle — Surveillance requise".to_string(),
        h if h >= 0.30 => "TENDU — Dissonances détectées — Attention nécessaire".to_string(),
        _ => "DISSONANT — Tensions critiques — Intervention urgente".to_string(),
/// Conversion en pourcentage (pour dashboard)
pub fn harmonic_percentage(state: &HarmonicState) -> f32 {
    state.harmonic_level * 100.0
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_init() {
        let state = init();
        assert!(state.is_ok());
        let s = state.unwrap();
        assert!(s.initialized);
        assert_eq!(s.harmonic_level, 0.0);
        assert_eq!(s.tension_level, 0.0);
        assert_eq!(s.softness_factor, 0.0);
    fn test_smooth_transition() {
        let state = HarmonicState {
            initialized: true,
            harmonic_level: 0.6,
            tension_level: 0.4,
            softness_factor: 0.65,
            last_update: 10,
        };
        let (smoothed_harmonic, smoothed_tension, smoothed_softness) =
            state.smooth_transition(0.9, 0.2, 0.85);
        // Vérification lissage 70%/30%
        assert!((smoothed_harmonic - (0.6 * 0.7 + 0.9 * 0.3)).abs() < 0.01);
        assert!((smoothed_tension - (0.4 * 0.7 + 0.2 * 0.3)).abs() < 0.01);
        assert!((smoothed_softness - (0.65 * 0.7 + 0.85 * 0.3)).abs() < 0.01);
    fn test_clamp_all() {
        let mut state = HarmonicState {
            harmonic_level: 1.3, // Invalide
            tension_level: -0.2, // Invalide
            softness_factor: 0.5,
        state.clamp_all();
        assert_eq!(state.harmonic_level, 1.0);
        assert_eq!(state.tension_level, 0.0);
        assert!(state.softness_factor >= 0.0 && state.softness_factor <= 1.0);
    fn test_is_harmonious() {
            harmonic_level: 0.80,
            tension_level: 0.2,
            softness_factor: 0.75,
        assert!(is_harmonious(&state));
        let state2 = HarmonicState {
            harmonic_level: 0.70,
            ..state
        assert!(!is_harmonious(&state2));
    fn test_is_tense() {
            harmonic_level: 0.5,
            tension_level: 0.65,
            softness_factor: 0.45,
        assert!(is_tense(&state));
            tension_level: 0.55,
        assert!(!is_tense(&state2));
    fn test_is_soft() {
            harmonic_level: 0.75,
            tension_level: 0.25,
            softness_factor: 0.78,
        assert!(is_soft(&state));
    fn test_is_dissonant() {
            harmonic_level: 0.35,
            tension_level: 0.70,
            softness_factor: 0.30,
        assert!(is_dissonant(&state));
    fn test_status_harmonieux() {
            harmonic_level: 0.90,
            tension_level: 0.10,
            softness_factor: 0.88,
        let msg = status_message(&state);
        assert!(msg.contains("HARMONIEUX"));
    fn test_status_dissonant() {
            harmonic_level: 0.25,
            tension_level: 0.75,
        assert!(msg.contains("DISSONANT"));
    fn test_harmonic_percentage() {
            harmonic_level: 0.82,
            tension_level: 0.18,
            softness_factor: 0.80,
        assert_eq!(harmonic_percentage(&state), 82.0);

}
