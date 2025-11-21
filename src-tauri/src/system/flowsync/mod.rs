// FLOWSYNC ENGINE — Module Principal
// Coordination et unification des flux internes

pub mod collect;
pub mod compute;
use crate::system::pulse::PulseState;
use crate::system::balance::BalanceState;
use crate::system::field::FieldState;
use crate::system::stability::StabilityState;
use crate::system::integrity::IntegrityState;
/// État du moteur de synchronisation des flux
#[derive(Debug, Clone)]
pub struct FlowSyncState {
    pub initialized: bool,
    pub flowsync_score: f32,
    pub direction_factor: f32,
    pub sync_quality: f32,
    pub last_update: u64,
}
impl FlowSyncState {
    /// Crée un nouvel état avec valeurs par défaut
    fn new() -> Self {
        Self {
            initialized: false,
            flowsync_score: 0.0,
            direction_factor: 0.0,
            sync_quality: 0.0,
            last_update: 0,
        }
    }
    /// Lisse progressivement la transition (70% ancien / 30% nouveau)
    fn smooth_transition(&self, new_flowsync: f32, new_direction: f32, new_sync: f32) -> (f32, f32, f32) {
        let smoothed_flowsync = self.flowsync_score * 0.7 + new_flowsync * 0.3;
        let smoothed_direction = self.direction_factor * 0.7 + new_direction * 0.3;
        let smoothed_sync = self.sync_quality * 0.7 + new_sync * 0.3;
        (
            clamp(smoothed_flowsync),
            clamp(smoothed_direction),
            clamp(smoothed_sync),
        )
    /// Clamp tous les champs [0.0, 1.0]
    fn clamp_all(&mut self) {
        self.flowsync_score = clamp(self.flowsync_score);
        self.direction_factor = clamp(self.direction_factor);
        self.sync_quality = clamp(self.sync_quality);
/// Initialise le FlowSync Engine
pub fn init() -> Result<FlowSyncState, String> {
    let mut state = FlowSyncState::new();
    state.initialized = true;
    Ok(state)
/// Met à jour la synchronisation des flux (tick)
pub fn tick(
    state: &mut FlowSyncState,
    pulse: &PulseState,
    balance: &BalanceState,
    field: &FieldState,
    stability: &StabilityState,
    integrity: &IntegrityState,
) -> Result<(), String> {
    // 1. Collecter les signaux
    let inputs = collect::collect_flowsync_inputs(pulse, balance, field, stability, integrity)
        .map_err(|e| format!("Erreur collecte signaux flowsync: {}", e))?;
    // 2. Calculer les métriques
    let (new_flowsync, new_direction, new_sync) = compute::compute_flowsync(&inputs)
        .map_err(|e| format!("Erreur calcul flowsync: {}", e))?;
    // 3. Lisser la transition (si déjà initialisé)
    let (final_flowsync, final_direction, final_sync) = if state.initialized {
        state.smooth_transition(new_flowsync, new_direction, new_sync)
    } else {
        (new_flowsync, new_direction, new_sync)
    };
    // 4. Mettre à jour l'état
    state.flowsync_score = final_flowsync;
    state.direction_factor = final_direction;
    state.sync_quality = final_sync;
    // 5. Clamp strict
    state.clamp_all();
    // 6. Update timestamp
    state.last_update = state.last_update.wrapping_add1;
    Ok(())
/// Clamp strict [0.0, 1.0]
fn clamp(value: f32) -> f32 {
    value.max0.0.min1.0
// Helpers publics pour requêtes d'état
/// Vérifie si les flux sont synchronisés (flowsync_score >= 0.75)
pub fn is_synced(state: &FlowSyncState) -> bool {
    state.flowsync_score >= 0.75
/// Vérifie si les flux sont désynchronisés (flowsync_score < 0.50)
pub fn is_desynced(state: &FlowSyncState) -> bool {
    state.flowsync_score < 0.50
/// Vérifie si la direction est claire (direction_factor >= 0.70)
pub fn is_oriented(state: &FlowSyncState) -> bool {
    state.direction_factor >= 0.70
/// Vérifie si la qualité de sync est élevée (sync_quality >= 0.75)
pub fn is_quality_sync(state: &FlowSyncState) -> bool {
    state.sync_quality >= 0.75
/// Message de statut en français
pub fn status_message(state: &FlowSyncState) -> String {
    match state.flowsync_score {
        s if s >= 0.85 => "OPTIMAL — Flux parfaitement synchronisés — Cohérence maximale".to_string(),
        s if s >= 0.70 => "SYNCHRONISÉ — Flux unifiés — Direction claire".to_string(),
        s if s >= 0.50 => "ACCEPTABLE — Flux partiellement alignés — Surveillance requise".to_string(),
        s if s >= 0.30 => "DÉSYNCHRONISÉ — Flux fragmentés — Attention nécessaire".to_string(),
        _ => "CRITIQUE — Flux chaotiques — Intervention urgente".to_string(),
/// Conversion en pourcentage (pour dashboard)
pub fn flowsync_percentage(state: &FlowSyncState) -> f32 {
    state.flowsync_score * 100.0
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_init() {
        let state = init();
        assert!(state.is_ok());
        let s = state.unwrap();
        assert!(s.initialized);
        assert_eq!(s.flowsync_score, 0.0);
        assert_eq!(s.direction_factor, 0.0);
        assert_eq!(s.sync_quality, 0.0);
    fn test_smooth_transition() {
        let state = FlowSyncState {
            initialized: true,
            flowsync_score: 0.6,
            direction_factor: 0.65,
            sync_quality: 0.62,
            last_update: 10,
        };
        let (smoothed_flowsync, smoothed_direction, smoothed_sync) =
            state.smooth_transition(0.9, 0.85, 0.88);
        // Vérification lissage 70%/30%
        assert!((smoothed_flowsync - (0.6 * 0.7 + 0.9 * 0.3)).abs() < 0.01);
        assert!((smoothed_direction - (0.65 * 0.7 + 0.85 * 0.3)).abs() < 0.01);
        assert!((smoothed_sync - (0.62 * 0.7 + 0.88 * 0.3)).abs() < 0.01);
    fn test_clamp_all() {
        let mut state = FlowSyncState {
            flowsync_score: 1.2, // Invalide
            direction_factor: -0.1, // Invalide
            sync_quality: 0.5,
        state.clamp_all();
        assert_eq!(state.flowsync_score, 1.0);
        assert_eq!(state.direction_factor, 0.0);
        assert!(state.sync_quality >= 0.0 && state.sync_quality <= 1.0);
    fn test_is_synced() {
            flowsync_score: 0.80,
            direction_factor: 0.75,
            sync_quality: 0.78,
        assert!(is_synced(&state));
        let state2 = FlowSyncState {
            flowsync_score: 0.70,
            ..state
        assert!(!is_synced(&state2));
    fn test_is_desynced() {
            flowsync_score: 0.45,
            direction_factor: 0.5,
            sync_quality: 0.48,
        assert!(is_desynced(&state));
            flowsync_score: 0.55,
        assert!(!is_desynced(&state2));
    fn test_is_oriented() {
            flowsync_score: 0.5,
            sync_quality: 0.6,
        assert!(is_oriented(&state));
    fn test_is_quality_sync() {
            sync_quality: 0.80,
        assert!(is_quality_sync(&state));
    fn test_status_optimal() {
            flowsync_score: 0.90,
            direction_factor: 0.88,
            sync_quality: 0.92,
        let msg = status_message(&state);
        assert!(msg.contains("OPTIMAL"));
    fn test_status_critique() {
            flowsync_score: 0.25,
            direction_factor: 0.30,
            sync_quality: 0.28,
        assert!(msg.contains("CRITIQUE"));
    fn test_flowsync_percentage() {
            flowsync_score: 0.82,
        assert_eq!(flowsync_percentage(&state), 82.0);

}
