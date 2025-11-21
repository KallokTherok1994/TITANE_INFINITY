// ============================================================================
// TITANE∞ v8.0 - Balance Engine (Module #19)
// Équilibre interne global
//
// Rôle:
// - Analyser les signaux transversaux du système
// - Synthétiser un balance_score global
// - Calculer alignment_score et load_balance
// - Mesurer l'équilibre intérieur du système
// - Refléter l'harmonie globale
// Philosophie:
// - 100% diagnostique (aucune modification)
// - Déterministe et reproductible
// - Local, sans dépendances externes
// - Thermostat interne de TITANE∞

use std::time::{SystemTime, UNIX_EPOCH};
use crate::system::{
    kernel::KernelState,
    cortex_sync::CortexSyncState,
    stability::StabilityState,
    integrity::IntegrityState,
    field::FieldState,
    secureflow::SecureFlowState,
    lowflow::LowFlowState,
};
pub mod collect;
pub mod compute;
use collect::BalanceInputs;
/// État du Balance Engine
#[derive(Debug, Clone)]
pub struct BalanceState {
    pub initialized: bool,         // État d'initialisation
    pub balance_score: f32,        // Score d'équilibre global [0.0, 1.0]
    pub alignment_score: f32,      // Score d'alignement [0.0, 1.0]
    pub load_balance: f32,         // Équilibre de charge [0.0, 1.0]
    pub last_update: u64,          // Timestamp dernière mise à jour
}
impl Default for BalanceState {
    fn default() -> Self {
        Self {
            initialized: false,
            balance_score: 0.5,
            alignment_score: 0.5,
            load_balance: 0.5,
            last_update: 0,
        }
    }
impl BalanceState {
    /// Crée un nouvel état Balance
    pub fn new() -> Self {
        Self::default()
    /// Lissage progressif (70% ancien + 30% nouveau)
    fn smooth_transition(&mut self, new_balance: f32, new_alignment: f32, new_load: f32) {
        self.balance_score = (0.7 * self.balance_score) + (0.3 * new_balance);
        self.alignment_score = (0.7 * self.alignment_score) + (0.3 * new_alignment);
        self.load_balance = (0.7 * self.load_balance) + (0.3 * new_load);
    /// Clamp toutes les valeurs dans [0.0, 1.0]
    fn clamp_all(&mut self) {
        self.balance_score = self.balance_score.clamp(0.0, 1.0);
        self.alignment_score = self.alignment_score.clamp(0.0, 1.0);
        self.load_balance = self.load_balance.clamp(0.0, 1.0);
    /// Retourne un message de statut en français
    pub fn status_message(&self) -> String {
        if self.balance_score >= 0.85 && self.load_balance >= 0.75 {
            "Balance: OPTIMAL - Équilibre harmonieux maintenu".to_string()
        } else if self.balance_score >= 0.70 {
            "Balance: BON - Système bien équilibré".to_string()
        } else if self.balance_score >= 0.50 {
            "Balance: MODÉRÉ - Déséquilibres mineurs détectés".to_string()
        } else if self.balance_score >= 0.30 {
            "Balance: FAIBLE - Rééquilibrage recommandé".to_string()
        } else {
            "Balance: CRITIQUE - Déséquilibre majeur du système".to_string()
    /// Vérifie si le système est bien équilibré
    pub fn is_balanced(&self) -> bool {
        self.balance_score >= 0.60 && self.alignment_score >= 0.50 && self.load_balance >= 0.50
    /// Vérifie si le système est déséquilibré
    pub fn is_unbalanced(&self) -> bool {
        self.balance_score < 0.40 || self.alignment_score < 0.30 || self.load_balance < 0.30
    /// Retourne le niveau d'équilibre 0 - 100
    pub fn balance_percentage(&self) -> f32 {
        self.balance_score * 100.0
    /// Vérifie si le système est surchargé
    pub fn is_overloaded(&self) -> bool {
        self.load_balance < 0.40
    /// Vérifie si le système est bien aligné
    pub fn is_aligned(&self) -> bool {
        self.alignment_score >= 0.70
/// Initialise le Balance Engine
///
/// # Returns
/// * `Ok(BalanceState)` - État initialisé avec valeurs par défaut
/// * `Err(String)` - Erreur lors de l'initialisation
pub fn init() -> Result<BalanceState, String> {
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|_| "Erreur temporelle".to_string())?
        .as_secs();
    Ok(BalanceState {
        initialized: true,
        balance_score: 0.5,
        alignment_score: 0.5,
        load_balance: 0.5,
        last_update: timestamp,
    })
/// Tick principal du Balance Engine
/// Pipeline:
/// 1. Collecter les signaux (collect::collect_balance_inputs)
/// 2. Calculer les métriques (compute::compute_balance)
/// 3. Lisser les transitions (70%/30%)
/// 4. Clamp strict [0.0, 1.0]
/// 5. Mettre à jour timestamp
/// # Arguments
/// * `state` - État mutable du Balance Engine
/// * `kernel` - État du Kernel Profond
/// * `cortex` - État du Cortex Synchronique
/// * `stability` - État du Stability Monitor
/// * `integrity` - État de l'Integrity Engine
/// * `field` - État du Field Engine
/// * `secureflow` - État du SecureFlow Engine
/// * `lowflow` - État du LowFlow Engine
/// * `Ok(())` - Tick réussi
/// * `Err(String)` - Erreur lors du tick
pub fn tick(
    state: &mut BalanceState,
    kernel: &KernelState,
    cortex: &CortexSyncState,
    stability: &StabilityState,
    integrity: &IntegrityState,
    field: &FieldState,
    secureflow: &SecureFlowState,
    lowflow: &LowFlowState,
) -> Result<(), String> {
    // 1. Collecter les signaux transversaux
    let inputs = collect::collect_balance_inputs(
        kernel, cortex, stability, integrity, field, secureflow, lowflow,
    )?;
    // 2. Calculer les métriques d'équilibre
    let (balance_score, alignment_score, load_balance) = compute::compute_balance(&inputs)?;
    // 3. Lisser les transitions (70% ancien + 30% nouveau)
    state.smooth_transition(balance_score, alignment_score, load_balance);
    // 4. Clamp strict
    state.clamp_all();
    // 5. Mettre à jour le timestamp
    state.last_update = SystemTime::now()
    Ok(())
// TESTS UNITAIRES
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_balance_state_new() {
        let state = BalanceState::new();
        assert!(!state.initialized);
        assert_eq!(state.balance_score, 0.5);
        assert_eq!(state.alignment_score, 0.5);
        assert_eq!(state.load_balance, 0.5);
        assert_eq!(state.last_update, 0);
    fn test_balance_state_default() {
        let state = BalanceState::default();
    fn test_balance_state_init() {
        let result = init();
        assert!(result.is_ok());
        let state = result.unwrap();
        assert!(state.initialized);
        assert!(state.last_update > 0);
    fn test_balance_state_smooth_transition() {
        let mut state = BalanceState::new();
        state.balance_score = 0.5;
        state.alignment_score = 0.5;
        state.load_balance = 0.5;
        // Appliquer lissage avec nouvelles valeurs
        state.smooth_transition(0.8, 0.9, 0.85);
        // Vérifier formule 70%/30%
        // balance: 0.7*0.5 + 0.3*0.8 = 0.35 + 0.24 = 0.59
        assert!((state.balance_score - 0.59).abs() < 0.01);
        // alignment: 0.7*0.5 + 0.3*0.9 = 0.35 + 0.27 = 0.62
        assert!((state.alignment_score - 0.62).abs() < 0.01);
        // load: 0.7*0.5 + 0.3*0.85 = 0.35 + 0.255 = 0.605
        assert!((state.load_balance - 0.605).abs() < 0.01);
    fn test_balance_state_clamp() {
        state.balance_score = 1.5; // > 1.0
        state.alignment_score = -0.2; // < 0.0
        state.clamp_all();
        assert_eq!(state.balance_score, 1.0);
        assert_eq!(state.alignment_score, 0.0);
    fn test_balance_state_is_balanced() {
        // Cas équilibré
        state.balance_score = 0.7;
        state.alignment_score = 0.6;
        state.load_balance = 0.65;
        assert!(state.is_balanced());
        // Cas déséquilibré (balance trop bas)
        assert!(!state.is_balanced());
    fn test_balance_state_is_unbalanced() {
        // Cas déséquilibré
        state.balance_score = 0.35;
        assert!(state.is_unbalanced());
        state.balance_score = 0.6;
        assert!(!state.is_unbalanced());
    fn test_balance_state_is_overloaded() {
        // Surchargé
        state.load_balance = 0.3;
        assert!(state.is_overloaded());
        // Pas surchargé
        state.load_balance = 0.6;
        assert!(!state.is_overloaded());
    fn test_balance_state_is_aligned() {
        // Bien aligné
        state.alignment_score = 0.75;
        assert!(state.is_aligned());
        // Mal aligné
        assert!(!state.is_aligned());
    fn test_balance_state_status_messages() {
        // OPTIMAL
        state.balance_score = 0.9;
        state.load_balance = 0.8;
        assert!(state.status_message().contains("OPTIMAL"));
        // BON
        state.balance_score = 0.75;
        assert!(state.status_message().contains("BON"));
        // MODÉRÉ
        state.balance_score = 0.55;
        assert!(state.status_message().contains("MODÉRÉ"));
        // FAIBLE
        assert!(state.status_message().contains("FAIBLE"));
        // CRITIQUE
        state.balance_score = 0.2;
        assert!(state.status_message().contains("CRITIQUE"));
    fn test_balance_state_percentage() {
        assert_eq!(state.balance_percentage(), 75.0);
        state.balance_score = 0.333;
        assert!((state.balance_percentage() - 33.3).abs() < 0.1);

}
