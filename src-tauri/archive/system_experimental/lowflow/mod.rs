// lowflow/mod.rs
// LowFlow Engine - Mode basse charge et dégradation contrôlée

pub mod evaluate;
pub mod degrade;
use crate::system::secureflow::SecureFlowState;
use crate::system::kernel::KernelState;
use crate::system::cortex_sync::CortexSyncState;
use std::time::{SystemTime, UNIX_EPOCH};
/// État du LowFlow Engine
#[derive(Debug, Clone)]
pub struct LowFlowState {
    pub initialized: bool,
    pub throttle_level: f32,
    pub degrade_factor: f32,
    pub lowflow_active: bool,
    pub last_update: u64,
}
impl LowFlowState {
    pub fn new() -> Self {
        Self {
            initialized: false,
            throttle_level: 0.0,
            degrade_factor: 0.0,
            lowflow_active: false,
            last_update: 0,
        }
    }
    /// Niveau de performance résiduelle (0.0 = totalement ralenti, 1.0 = pleine vitesse)
    pub fn performance_level(&self) -> f32 {
        (1.0 - self.throttle_level).clamp(0.0, 1.0)
    /// Le système est-il en mode nominal ?
    pub fn is_nominal(&self) -> bool {
        !self.lowflow_active && self.throttle_level < 0.3
    /// Le système nécessite-t-il une réduction de charge ?
    pub fn needs_throttle(&self) -> bool {
        self.throttle_level > 0.0 || self.lowflow_active
    /// Le système est-il en mode basse charge actif ?
    pub fn is_lowflow_active(&self) -> bool {
        self.lowflow_active
    /// Message de statut lisible
    pub fn status_message(&self) -> &'static str {
        if self.lowflow_active && self.throttle_level >= 0.8 {
            "LowFlow: MODE RALENTI MAXIMAL - Préservation ressources"
        } else if self.lowflow_active {
            "LowFlow: MODE BASSE CHARGE ACTIF - Réduction progressive"
        } else if self.throttle_level > 0.3 {
            "LowFlow: RALENTISSEMENT PRÉVENTIF - Stabilisation en cours"
        } else if self.throttle_level > 0.0 {
            "LowFlow: SURVEILLANCE - Throttle léger appliqué"
        } else {
            "LowFlow: NOMINAL - Performance maximale"
    fn smooth_transition(&mut self, new_throttle: f32, new_degrade: f32) {
        // Lissage 70% ancien + 30% nouveau
        self.throttle_level = self.throttle_level * 0.7 + new_throttle * 0.3;
        self.degrade_factor = self.degrade_factor * 0.7 + new_degrade * 0.3;
    fn clamp_all(&mut self) {
        self.throttle_level = self.throttle_level.clamp(0.0, 1.0);
        self.degrade_factor = self.degrade_factor.clamp(0.0, 1.0);
impl Default for LowFlowState {
    fn default() -> Self {
        Self::new()
/// Initialise le LowFlow Engine avec des valeurs nominales
pub fn init() -> Result<LowFlowState, String> {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| format!("Erreur temporelle: {}", e))?
        .as_millis() as u64;
    Ok(LowFlowState {
        initialized: true,
        throttle_level: 0.0,
        degrade_factor: 0.0,
        lowflow_active: false,
        last_update: now,
    })
/// Tick principal: évalue besoin, applique réduction, met à jour
pub fn tick(
    state: &mut LowFlowState,
    secureflow: &SecureFlowState,
    kernel: &KernelState,
    cortex: &CortexSyncState,
) -> Result<(), String> {
    // 1. Évaluer le besoin de mode basse charge
    let signal = evaluate::evaluate_need(secureflow, kernel, cortex)?;
    // 2. Appliquer la dégradation contrôlée
    let (throttle, degrade, active) = degrade::apply_lowflow(signal.intensity)?;
    // 3. Lissage progressif (70% ancien + 30% nouveau)
    state.smooth_transition(throttle, degrade);
    // 4. Mettre à jour l'état du mode
    state.lowflow_active = active;
    // 5. Clamp strict 0.0 → 1.0
    state.clamp_all();
    // 6. Mise à jour timestamp
    state.last_update = SystemTime::now()
    Ok(())
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_lowflow_state_new() {
        let state = LowFlowState::new();
        assert!(!state.initialized);
        assert_eq!(state.throttle_level, 0.0);
        assert_eq!(state.degrade_factor, 0.0);
        assert!(!state.lowflow_active);
    fn test_lowflow_state_performance_level() {
        let mut state = LowFlowState::new();
        
        state.throttle_level = 0.0;
        assert_eq!(state.performance_level(), 1.0); // 100% performance
        state.throttle_level = 0.3;
        assert_eq!(state.performance_level(), 0.7); // 70% performance
        state.throttle_level = 1.0;
        assert_eq!(state.performance_level(), 0.0); // 0% performance
    fn test_lowflow_state_is_nominal() {
        assert!(state.is_nominal());
        state.throttle_level = 0.5;
        assert!(!state.is_nominal());
        state.lowflow_active = true;
    fn test_lowflow_state_needs_throttle() {
        assert!(!state.needs_throttle());
        assert!(state.needs_throttle());
    fn test_lowflow_state_init() {
        let state = init().unwrap();
        assert!(state.initialized);
        assert!(state.last_update > 0);
    fn test_lowflow_state_smooth_transition() {
        state.degrade_factor = 0.4;
        state.smooth_transition(1.0, 0.8);
        // throttle: 0.5 * 0.7 + 1.0 * 0.3 = 0.65
        assert!((state.throttle_level - 0.65).abs() < 0.01);
        // degrade: 0.4 * 0.7 + 0.8 * 0.3 = 0.52
        assert!((state.degrade_factor - 0.52).abs() < 0.01);
    fn test_lowflow_state_clamp() {
        state.throttle_level = 1.5;
        state.degrade_factor = -0.3;
        state.clamp_all();
        assert_eq!(state.throttle_level, 1.0);
    fn test_lowflow_state_status_messages() {
        // Nominal
        state.lowflow_active = false;
        assert!(state.status_message().contains("NOMINAL"));
        // Surveillance
        state.throttle_level = 0.2;
        assert!(state.status_message().contains("SURVEILLANCE"));
        // Ralentissement préventif
        assert!(state.status_message().contains("RALENTISSEMENT PRÉVENTIF"));
        // Mode basse charge
        state.throttle_level = 0.6;
        assert!(state.status_message().contains("MODE BASSE CHARGE"));
        // Ralenti maximal
        state.throttle_level = 0.9;
        assert!(state.status_message().contains("RALENTI MAXIMAL"));

}
