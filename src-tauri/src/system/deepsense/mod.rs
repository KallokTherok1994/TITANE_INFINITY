// DEEPSENSE ENGINE — Module Principal
// Perception interne avancée et sens profond

pub mod collect;
pub mod compute;
use crate::system::resonance::ResonanceState;
use crate::system::harmonic::HarmonicState;
use crate::system::stability::StabilityState;
use crate::system::balance::BalanceState;
/// État du moteur de perception profonde
#[derive(Debug, Clone)]
pub struct DeepSenseState {
    pub initialized: bool,
    pub depth_level: f32,
    pub density_level: f32,
    pub clarity_signal: f32,
    pub last_update: u64,
}
impl DeepSenseState {
    /// Crée un nouvel état avec valeurs par défaut
    fn new() -> Self {
        Self {
            initialized: false,
            depth_level: 0.0,
            density_level: 0.0,
            clarity_signal: 0.0,
            last_update: 0,
        }
    }
    /// Lisse progressivement la transition (70% ancien / 30% nouveau)
    fn smooth_transition(&self, new_depth: f32, new_density: f32, new_clarity: f32) -> (f32, f32, f32) {
        let smoothed_depth = self.depth_level * 0.7 + new_depth * 0.3;
        let smoothed_density = self.density_level * 0.7 + new_density * 0.3;
        let smoothed_clarity = self.clarity_signal * 0.7 + new_clarity * 0.3;
        (
            clamp(smoothed_depth),
            clamp(smoothed_density),
            clamp(smoothed_clarity),
        )
    /// Clamp tous les champs [0.0, 1.0]
    fn clamp_all(&mut self) {
        self.depth_level = clamp(self.depth_level);
        self.density_level = clamp(self.density_level);
        self.clarity_signal = clamp(self.clarity_signal);
/// Initialise le DeepSense Engine
pub fn init() -> Result<DeepSenseState, String> {
    let mut state = DeepSenseState::new();
    state.initialized = true;
    Ok(state)
/// Met à jour la perception profonde (tick)
pub fn tick(
    state: &mut DeepSenseState,
    resonance: &ResonanceState,
    harmonic: &HarmonicState,
    stability: &StabilityState,
    balance: &BalanceState,
) -> Result<(), String> {
    // 1. Collecter les signaux
    let inputs = collect::collect_deepsense_inputs(resonance, harmonic, stability, balance)
        .map_err(|e| format!("Erreur collecte signaux deepsense: {}", e))?;
    // 2. Calculer les métriques
    let (new_depth, new_density, new_clarity) = compute::compute_deepsense(&inputs)
        .map_err(|e| format!("Erreur calcul deepsense: {}", e))?;
    // 3. Lisser la transition (si déjà initialisé)
    let (final_depth, final_density, final_clarity) = if state.initialized {
        state.smooth_transition(new_depth, new_density, new_clarity)
    } else {
        (new_depth, new_density, new_clarity)
    };
    // 4. Mettre à jour l'état
    state.depth_level = final_depth;
    state.density_level = final_density;
    state.clarity_signal = final_clarity;
    // 5. Clamp strict
    state.clamp_all();
    // 6. Update timestamp
    state.last_update = state.last_update.wrapping_add1;
    Ok(())
/// Clamp strict [0.0, 1.0]
fn clamp(value: f32) -> f32 {
    value.max0.0.min1.0
// Helpers publics pour requêtes d'état
/// Vérifie si la perception est profonde (depth_level >= 0.75)
pub fn is_deep(state: &DeepSenseState) -> bool {
    state.depth_level >= 0.75
/// Vérifie si la perception est superficielle (depth_level < 0.40)
pub fn is_shallow(state: &DeepSenseState) -> bool {
    state.depth_level < 0.40
/// Vérifie si la densité est élevée (density_level >= 0.70)
pub fn is_dense(state: &DeepSenseState) -> bool {
    state.density_level >= 0.70
/// Vérifie si la clarté est élevée (clarity_signal >= 0.75)
pub fn is_clear(state: &DeepSenseState) -> bool {
    state.clarity_signal >= 0.75
/// Message de statut en français
pub fn status_message(state: &DeepSenseState) -> String {
    match state.depth_level {
        d if d >= 0.85 => {
            "PROFOND — Perception optimale — Clarté maximale".to_string()
        d if d >= 0.70 => "CLAIR — Perception stable — Densité cohérente".to_string(),
        d if d >= 0.50 => {
            "ACCEPTABLE — Perception partielle — Surveillance requise".to_string()
        d if d >= 0.30 => "SUPERFICIEL — Perception fragmentée — Attention nécessaire".to_string(),
        _ => "CRITIQUE — Perception altérée — Intervention urgente".to_string(),
/// Conversion en pourcentage (pour dashboard)
pub fn depth_percentage(state: &DeepSenseState) -> f32 {
    state.depth_level * 100.0
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_init() {
        let state = init();
        assert!(state.is_ok());
        let s = state.unwrap();
        assert!(s.initialized);
        assert_eq!(s.depth_level, 0.0);
        assert_eq!(s.density_level, 0.0);
        assert_eq!(s.clarity_signal, 0.0);
    fn test_smooth_transition() {
        let state = DeepSenseState {
            initialized: true,
            depth_level: 0.6,
            density_level: 0.55,
            clarity_signal: 0.62,
            last_update: 10,
        };
        let (smoothed_depth, smoothed_density, smoothed_clarity) =
            state.smooth_transition(0.9, 0.85, 0.92);
        // Vérification lissage 70%/30%
        assert!((smoothed_depth - (0.6 * 0.7 + 0.9 * 0.3)).abs() < 0.01);
        assert!((smoothed_density - (0.55 * 0.7 + 0.85 * 0.3)).abs() < 0.01);
        assert!((smoothed_clarity - (0.62 * 0.7 + 0.92 * 0.3)).abs() < 0.01);
    fn test_clamp_all() {
        let mut state = DeepSenseState {
            depth_level: 1.4, // Invalide
            density_level: -0.3, // Invalide
            clarity_signal: 0.5,
        state.clamp_all();
        assert_eq!(state.depth_level, 1.0);
        assert_eq!(state.density_level, 0.0);
        assert!(state.clarity_signal >= 0.0 && state.clarity_signal <= 1.0);
    fn test_is_deep() {
            depth_level: 0.80,
            density_level: 0.70,
            clarity_signal: 0.78,
        assert!(is_deep(&state));
        let state2 = DeepSenseState {
            depth_level: 0.70,
            ..state
        assert!(!is_deep(&state2));
    fn test_is_shallow() {
            depth_level: 0.35,
            density_level: 0.40,
            clarity_signal: 0.38,
        assert!(is_shallow(&state));
            depth_level: 0.45,
        assert!(!is_shallow(&state2));
    fn test_is_dense() {
            depth_level: 0.65,
            density_level: 0.75,
            clarity_signal: 0.70,
        assert!(is_dense(&state));
    fn test_is_clear() {
            density_level: 0.72,
            clarity_signal: 0.80,
        assert!(is_clear(&state));
    fn test_status_profond() {
            depth_level: 0.90,
            density_level: 0.85,
            clarity_signal: 0.92,
        let msg = status_message(&state);
        assert!(msg.contains("PROFOND"));
    fn test_status_critique() {
            depth_level: 0.25,
            density_level: 0.30,
            clarity_signal: 0.28,
        assert!(msg.contains("CRITIQUE"));
    fn test_depth_percentage() {
            depth_level: 0.76,
        assert_eq!(depth_percentage(&state), 76.0);

}
