// kernel/mod.rs
// Kernel Profond - Invariants, identité interne, garde-fou global

pub mod identity;
pub mod guard;
use crate::system::cortex_sync::CortexSyncState;
use crate::system::continuum::ContinuumState;
use crate::system::ans::ANSState;
use crate::system::field::FieldState;
use crate::system::swarm::SwarmState;
use crate::system::innersense::InnerSenseState;
use std::time::{SystemTime, UNIX_EPOCH};
/// État du Kernel Profond
#[derive(Debug, Clone)]
pub struct KernelState {
    pub initialized: bool,
    pub identity_stability: f32,
    pub core_integrity: f32,
    pub adaptive_reserve: f32,
    pub overload_risk: f32,
    pub last_update: u64,
}
impl KernelState {
    pub fn new() -> Self {
        Self {
            initialized: false,
            identity_stability: 0.5,
            core_integrity: 0.5,
            adaptive_reserve: 0.5,
            overload_risk: 0.3,
            last_update: 0,
        }
    }
    /// Santé globale du kernel (0.0 = critique, 1.0 = optimal)
    pub fn health(&self) -> f32 {
        ((self.identity_stability + self.core_integrity + self.adaptive_reserve) / 3.0).clamp(0.0, 1.0)
    /// Le kernel est-il stable ?
    pub fn is_stable(&self) -> bool {
        self.identity_stability > 0.6 && self.core_integrity > 0.6 && self.overload_risk < 0.4
    /// Y a-t-il un risque critique ?
    pub fn is_critical(&self) -> bool {
        self.overload_risk > 0.7 || self.core_integrity < 0.3 || self.adaptive_reserve < 0.2
    /// Le système a-t-il une bonne réserve adaptative ?
    pub fn has_capacity(&self) -> bool {
        self.adaptive_reserve > 0.5 && self.overload_risk < 0.5
    /// Message de statut lisible
    pub fn status_message(&self) -> &'static str {
        if self.is_critical() {
            "Kernel: CRITIQUE - Risque de surcharge ou effondrement"
        } else if !self.is_stable() {
            "Kernel: INSTABLE - Surveillance accrue requise"
        } else if self.has_capacity() {
            "Kernel: OPTIMAL - Réserve adaptative disponible"
        } else {
            "Kernel: STABLE - Fonctionnement nominal"
    fn smooth_transition(&mut self, new_identity: f32, new_integrity: f32, new_reserve: f32, new_risk: f32) {
        // Lissage 70% ancien + 30% nouveau
        self.identity_stability = self.identity_stability * 0.7 + new_identity * 0.3;
        self.core_integrity = self.core_integrity * 0.7 + new_integrity * 0.3;
        self.adaptive_reserve = self.adaptive_reserve * 0.7 + new_reserve * 0.3;
        self.overload_risk = self.overload_risk * 0.7 + new_risk * 0.3;
    fn clamp_all(&mut self) {
        self.identity_stability = self.identity_stability.clamp(0.0, 1.0);
        self.core_integrity = self.core_integrity.clamp(0.0, 1.0);
        self.adaptive_reserve = self.adaptive_reserve.clamp(0.0, 1.0);
        self.overload_risk = self.overload_risk.clamp(0.0, 1.0);
impl Default for KernelState {
    fn default() -> Self {
        Self::new()
/// Initialise le Kernel Profond avec des valeurs stables
pub fn init() -> Result<KernelState, String> {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| format!("Time error: {}", e))?
        .as_millis() as u64;
    Ok(KernelState {
        initialized: true,
        identity_stability: 0.7,
        core_integrity: 0.7,
        adaptive_reserve: 0.6,
        overload_risk: 0.3,
        last_update: now,
    })
/// Tick principal: collecte, évaluation, mise à jour
pub fn tick(
    state: &mut KernelState,
    cortex: &CortexSyncState,
    continuum: &ContinuumState,
    ans: &ANSState,
    field: &FieldState,
    swarm: &SwarmState,
    innersense: &InnerSenseState,
) -> Result<(), String> {
    // 1. Collecte des signaux kernel
    let inputs = identity::collect_kernel_inputs(cortex, continuum, ans, field, swarm, innersense)?;
    // 2. Évaluation des invariants et risques
    let report = guard::evaluate_kernel(&inputs)?;
    // 3. Lissage progressif (70% ancien + 30% nouveau)
    state.smooth_transition(
        report.identity_stability,
        report.core_integrity,
        report.adaptive_reserve,
        report.overload_risk,
    );
    // 4. Clamp strict 0.0 → 1.0
    state.clamp_all();
    // 5. Mise à jour timestamp
    state.last_update = SystemTime::now()
    Ok(())
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_kernel_state_new() {
        let state = KernelState::new();
        assert!(!state.initialized);
        assert_eq!(state.identity_stability, 0.5);
        assert_eq!(state.overload_risk, 0.3);
    fn test_kernel_state_health() {
        let state = KernelState {
            initialized: true,
            identity_stability: 0.8,
            core_integrity: 0.7,
            adaptive_reserve: 0.6,
            overload_risk: 0.2,
        };
        let health = state.health();
        let expected = (0.8 + 0.7 + 0.6) / 3.0; // = 0.7
        assert!(health - expected.abs() < 0.01);
    fn test_kernel_state_is_stable() {
        let stable = KernelState {
            identity_stability: 0.7,
        assert!(stable.is_stable());
        let unstable = KernelState {
            adaptive_reserve: 0.4,
            overload_risk: 0.5,
        assert!(!unstable.is_stable());
    fn test_kernel_state_is_critical() {
        let critical = KernelState {
            identity_stability: 0.4,
            core_integrity: 0.2,
            adaptive_reserve: 0.1,
            overload_risk: 0.8,
        assert!(critical.is_critical());
        let safe = KernelState {
        assert!(!safe.is_critical());
    fn test_kernel_state_has_capacity() {
        let has_capacity = KernelState {
        assert!(has_capacity.has_capacity());
        let no_capacity = KernelState {
            identity_stability: 0.6,
            core_integrity: 0.6,
            adaptive_reserve: 0.3,
            overload_risk: 0.6,
        assert!(!no_capacity.has_capacity());
    fn test_kernel_state_init() {
        let state = init().unwrap();
        assert!(state.initialized);
        assert_eq!(state.identity_stability, 0.7);
        assert_eq!(state.core_integrity, 0.7);
        assert_eq!(state.adaptive_reserve, 0.6);
        assert!(state.last_update > 0);
    fn test_kernel_state_smooth_transition() {
        let mut state = KernelState {
        state.smooth_transition(1.0, 1.0, 1.0, 0.0);
        // 0.7 * 0.5 + 0.3 * 1.0 = 0.65
        assert!((state.identity_stability - 0.65).abs() < 0.01);
        assert!((state.core_integrity - 0.65).abs() < 0.01);
        assert!((state.adaptive_reserve - 0.65).abs() < 0.01);
        // 0.7 * 0.5 + 0.3 * 0.0 = 0.35
        assert!((state.overload_risk - 0.35).abs() < 0.01);
    fn test_kernel_state_clamp() {
            identity_stability: 1.5,
            core_integrity: -0.2,
            adaptive_reserve: 2.0,
            overload_risk: -1.0,
        state.clamp_all();
        assert_eq!(state.identity_stability, 1.0);
        assert_eq!(state.core_integrity, 0.0);
        assert_eq!(state.adaptive_reserve, 1.0);
        assert_eq!(state.overload_risk, 0.0);
    fn test_kernel_state_status_messages() {
            identity_stability: 0.2,
        assert!(critical.status_message().contains("CRITIQUE"));
        assert!(unstable.status_message().contains("INSTABLE"));
        let optimal = KernelState {
            core_integrity: 0.8,
            adaptive_reserve: 0.7,
        assert!(optimal.status_message().contains("OPTIMAL"));

}
