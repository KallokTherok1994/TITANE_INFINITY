// secureflow/mod.rs
// SecureFlow Engine - Sécurité passive et auto-stabilisation

pub mod scan;
pub mod stabilize;
use crate::system::kernel::KernelState;
use crate::system::cortex_sync::CortexSyncState;
use crate::system::ans::ANSState;
use crate::system::field::FieldState;
use std::time::{SystemTime, UNIX_EPOCH};
/// État du SecureFlow Engine
#[derive(Debug, Clone)]
pub struct SecureFlowState {
    pub initialized: bool,
    pub stress_index: f32,
    pub mitigation_level: f32,
    pub safe_mode: bool,
    pub last_update: u64,
}
impl SecureFlowState {
    pub fn new() -> Self {
        Self {
            initialized: false,
            stress_index: 0.3,
            mitigation_level: 0.0,
            safe_mode: false,
            last_update: 0,
        }
    }
    /// Niveau de sécurité global (0.0 = critique, 1.0 = optimal)
    pub fn security_level(&self) -> f32 {
        (1.0 - self.stress_index).clamp(0.0, 1.0)
    /// Le système est-il stable ?
    pub fn is_stable(&self) -> bool {
        self.stress_index < 0.5 && !self.safe_mode
    /// Le système nécessite-t-il une attention ?
    pub fn needs_attention(&self) -> bool {
        self.stress_index > 0.6 || self.mitigation_level > 0.3
    /// Le système est-il en mode sécurité ?
    pub fn is_safe_mode(&self) -> bool {
        self.safe_mode
    /// Message de statut lisible
    pub fn status_message(&self) -> &'static str {
        if self.safe_mode {
            "SecureFlow: MODE SÉCURITÉ - Stress critique détecté"
        } else if self.stress_index > 0.7 {
            "SecureFlow: ALERTE - Stress élevé, mitigation active"
        } else if self.needs_attention() {
            "SecureFlow: ATTENTION - Stress modéré détecté"
        } else if self.is_stable() {
            "SecureFlow: STABLE - Système en sécurité"
        } else {
            "SecureFlow: NOMINAL - Surveillance active"
    fn smooth_transition(&mut self, new_stress: f32, new_mitigation: f32) {
        // Lissage 70% ancien + 30% nouveau
        self.stress_index = self.stress_index * 0.7 + new_stress * 0.3;
        self.mitigation_level = self.mitigation_level * 0.7 + new_mitigation * 0.3;
    fn clamp_all(&mut self) {
        self.stress_index = self.stress_index.clamp(0.0, 1.0);
        self.mitigation_level = self.mitigation_level.clamp(0.0, 1.0);
impl Default for SecureFlowState {
    fn default() -> Self {
        Self::new()
/// Initialise le SecureFlow Engine
pub fn init() -> Result<SecureFlowState, String> {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| format!("Erreur temporelle: {}", e))?
        .as_millis() as u64;
    Ok(SecureFlowState {
        initialized: true,
        stress_index: 0.3,
        mitigation_level: 0.0,
        safe_mode: false,
        last_update: now,
    })
/// Tick principal: scan, stabilize, update
pub fn tick(
    state: &mut SecureFlowState,
    kernel: &KernelState,
    cortex: &CortexSyncState,
    ans: &ANSState,
    field: &FieldState,
) -> Result<(), String> {
    // 1. Scanner le risque global
    let report = scan::scan_risk(kernel, cortex, ans, field)?;
    // 2. Appliquer la mitigation
    let (mitigation_level, safe_mode) = stabilize::apply_mitigation(report.stress_index)?;
    // 3. Lissage progressif (70% ancien + 30% nouveau)
    state.smooth_transition(report.stress_index, mitigation_level);
    // 4. Mise à jour du safe_mode (pas de lissage, c'est un booléen)
    state.safe_mode = safe_mode;
    // 5. Clamp strict 0.0 → 1.0
    state.clamp_all();
    // Mise à jour timestamp
    state.last_update = SystemTime::now()
    Ok(())
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_secureflow_new() {
        let state = SecureFlowState::new();
        assert!(!state.initialized);
        assert_eq!(state.stress_index, 0.3);
        assert_eq!(state.mitigation_level, 0.0);
        assert!(!state.safe_mode);
    fn test_secureflow_security_level() {
        let state = SecureFlowState {
            initialized: true,
        };
        let security = state.security_level();
        assert!((security - 0.7).abs() < 0.01);
    fn test_secureflow_is_stable() {
        let stable = SecureFlowState {
            stress_index: 0.4,
        assert!(stable.is_stable());
        let unstable = SecureFlowState {
            stress_index: 0.6,
            mitigation_level: 0.3,
        assert!(!unstable.is_stable());
    fn test_secureflow_needs_attention() {
        let needs_attention = SecureFlowState {
            stress_index: 0.7,
            mitigation_level: 0.6,
        assert!(needs_attention.needs_attention());
        let ok = SecureFlowState {
        assert!(!ok.needs_attention());
    fn test_secureflow_is_safe_mode() {
        let safe = SecureFlowState {
            stress_index: 0.9,
            mitigation_level: 1.0,
            safe_mode: true,
        assert!(safe.is_safe_mode());
        let normal = SecureFlowState {
        assert!(!normal.is_safe_mode());
    fn test_secureflow_init() {
        let state = init().unwrap();
        assert!(state.initialized);
        assert!(state.last_update > 0);
    fn test_secureflow_smooth_transition() {
        let mut state = SecureFlowState {
            stress_index: 0.5,
        state.smooth_transition(1.0, 1.0);
        // 0.7 * 0.5 + 0.3 * 1.0 = 0.65
        assert!((state.stress_index - 0.65).abs() < 0.01);
        assert!((state.mitigation_level - 0.3).abs() < 0.01);
    fn test_secureflow_clamp() {
            stress_index: 1.5,
            mitigation_level: -0.5,
        state.clamp_all();
        assert_eq!(state.stress_index, 1.0);
    fn test_secureflow_status_messages() {
        let safe_mode = SecureFlowState {
        assert!(safe_mode.status_message().contains("MODE SÉCURITÉ"));
        let alert = SecureFlowState {
            stress_index: 0.8,
        assert!(alert.status_message().contains("ALERTE"));
        assert!(stable.status_message().contains("STABLE"));

}
