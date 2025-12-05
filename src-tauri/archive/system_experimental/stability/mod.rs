// ============================================================================
// TITANE∞ v8.0 - Stability Monitor Engine (Module #17)
// Surveillance globale de la stabilité système
//
// Rôle:
// - Observer l'état global du système
// - Synthétiser un stability_score (0.0-1.0)
// - Calculer coherence_level et system_health
// - Fournir un diagnostic de stabilité
// Philosophie:
// - 100% passif (aucune modification d'autres modules)
// - Déterministe et reproductible
// - Local, sans dépendances externes
// - Source de vérité pour la stabilité globale

use std::time::{SystemTime, UNIX_EPOCH};
use crate::system::{
    kernel::KernelState,
    cortex_sync::CortexSyncState,
    field::FieldState,
    secureflow::SecureFlowState,
    lowflow::LowFlowState,
};
pub mod collect;
pub mod compute;
use collect::StabilityInputs;
/// État du Stability Monitor
#[derive(Debug, Clone)]
pub struct StabilityState {
    pub initialized: bool,         // État d'initialisation
    pub stability_score: f32,      // Score de stabilité global [0.0, 1.0]
    pub coherence_level: f32,      // Niveau de cohérence [0.0, 1.0]
    pub system_health: f32,        // Santé système [0.0, 1.0]
    pub last_update: u64,          // Timestamp dernière mise à jour
}
impl Default for StabilityState {
    fn default() -> Self {
        Self {
            initialized: false,
            stability_score: 0.5,
            coherence_level: 0.5,
            system_health: 0.5,
            last_update: 0,
        }
    }
impl StabilityState {
    /// Crée un nouvel état Stability
    pub fn new() -> Self {
        Self::default()
    /// Lissage progressif (70% ancien + 30% nouveau)
    fn smooth_transition(&mut self, new_stability: f32, new_coherence: f32, new_health: f32) {
        self.stability_score = (0.7 * self.stability_score) + (0.3 * new_stability);
        self.coherence_level = (0.7 * self.coherence_level) + (0.3 * new_coherence);
        self.system_health = (0.7 * self.system_health) + (0.3 * new_health);
    /// Clamp toutes les valeurs dans [0.0, 1.0]
    fn clamp_all(&mut self) {
        self.stability_score = self.stability_score.clamp(0.0, 1.0);
        self.coherence_level = self.coherence_level.clamp(0.0, 1.0);
        self.system_health = self.system_health.clamp(0.0, 1.0);
    /// Retourne un message de statut en français
    pub fn status_message(&self) -> String {
        if self.stability_score >= 0.85 {
            "Stability: EXCELLENT - Système hautement stable".to_string()
        } else if self.stability_score >= 0.70 {
            "Stability: BON - Stabilité satisfaisante".to_string()
        } else if self.stability_score >= 0.50 {
            "Stability: MODÉRÉ - Surveillance recommandée".to_string()
        } else if self.stability_score >= 0.30 {
            "Stability: FAIBLE - Attention nécessaire".to_string()
        } else {
            "Stability: CRITIQUE - Instabilité majeure détectée".to_string()
    /// Vérifie si le système est stable
    pub fn is_stable(&self) -> bool {
        self.stability_score >= 0.60 && self.coherence_level >= 0.50 && self.system_health >= 0.50
    /// Vérifie si le système est en situation critique
    pub fn is_critical(&self) -> bool {
        self.stability_score < 0.30 || self.coherence_level < 0.25 || self.system_health < 0.25
    /// Retourne le niveau de stabilité 0 - 100
    pub fn stability_percentage(&self) -> f32 {
        self.stability_score * 100.0
/// Initialise le Stability Monitor
///
/// # Returns
/// * `Ok(StabilityState)` - État initialisé avec valeurs par défaut
/// * `Err(String)` - Erreur lors de l'initialisation
pub fn init() -> Result<StabilityState, String> {
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|_| "Erreur temporelle".to_string())?
        .as_secs();
    Ok(StabilityState {
        initialized: true,
        stability_score: 0.5,
        coherence_level: 0.5,
        system_health: 0.5,
        last_update: timestamp,
    })
/// Tick principal du Stability Monitor
/// Pipeline:
/// 1. Collecter les signaux (collect::collect_signals)
/// 2. Calculer les métriques (compute::compute_stability)
/// 3. Lisser les transitions (70%/30%)
/// 4. Clamp strict [0.0, 1.0]
/// 5. Mettre à jour timestamp
/// # Arguments
/// * `state` - État mutable du Stability Monitor
/// * `kernel` - État du Kernel Profond
/// * `cortex` - État du Cortex Synchronique
/// * `field` - État du Field Engine
/// * `secureflow` - État du SecureFlow Engine
/// * `lowflow` - État du LowFlow Engine
/// * `Ok(())` - Tick réussi
/// * `Err(String)` - Erreur lors du tick
pub fn tick(
    state: &mut StabilityState,
    kernel: &KernelState,
    cortex: &CortexSyncState,
    field: &FieldState,
    secureflow: &SecureFlowState,
    lowflow: &LowFlowState,
) -> Result<(), String> {
    // 1. Collecter les signaux
    let inputs = collect::collect_signals(kernel, cortex, field, secureflow, lowflow)?;
    // 2. Calculer les métriques de stabilité
    let (stability_score, coherence_level, system_health) = compute::compute_stability(&inputs)?;
    // 3. Lisser les transitions (70% ancien + 30% nouveau)
    state.smooth_transition(stability_score, coherence_level, system_health);
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
    fn test_stability_state_new() {
        let state = StabilityState::new();
        assert!(!state.initialized);
        assert_eq!(state.stability_score, 0.5);
        assert_eq!(state.coherence_level, 0.5);
        assert_eq!(state.system_health, 0.5);
        assert_eq!(state.last_update, 0);
    fn test_stability_state_default() {
        let state = StabilityState::default();
    fn test_stability_state_init() {
        let result = init();
        assert!(result.is_ok());
        let state = result.unwrap();
        assert!(state.initialized);
        assert!(state.last_update > 0);
    fn test_stability_state_smooth_transition() {
        let mut state = StabilityState::new();
        state.stability_score = 0.5;
        state.coherence_level = 0.5;
        state.system_health = 0.5;
        // Appliquer lissage avec nouvelles valeurs
        state.smooth_transition(0.8, 0.9, 0.85);
        // Vérifier formule 70%/30%
        // stability: 0.7*0.5 + 0.3*0.8 = 0.35 + 0.24 = 0.59
        assert!((state.stability_score - 0.59).abs() < 0.01);
        // coherence: 0.7*0.5 + 0.3*0.9 = 0.35 + 0.27 = 0.62
        assert!((state.coherence_level - 0.62).abs() < 0.01);
        // health: 0.7*0.5 + 0.3*0.85 = 0.35 + 0.255 = 0.605
        assert!((state.system_health - 0.605).abs() < 0.01);
    fn test_stability_state_clamp() {
        state.stability_score = 1.5; // > 1.0
        state.coherence_level = -0.2; // < 0.0
        state.clamp_all();
        assert_eq!(state.stability_score, 1.0);
        assert_eq!(state.coherence_level, 0.0);
    fn test_stability_state_is_stable() {
        // Cas stable
        state.stability_score = 0.7;
        state.coherence_level = 0.6;
        state.system_health = 0.65;
        assert!(state.is_stable());
        // Cas instable (stability trop bas)
        assert!(!state.is_stable());
        // Cas instable (coherence trop bas)
        state.coherence_level = 0.4;
    fn test_stability_state_is_critical() {
        // Cas critique
        state.stability_score = 0.25;
        assert!(state.is_critical());
        // Cas non critique
        assert!(!state.is_critical());
    fn test_stability_state_status_messages() {
        // EXCELLENT
        state.stability_score = 0.9;
        assert!(state.status_message().contains("EXCELLENT"));
        // BON
        state.stability_score = 0.75;
        assert!(state.status_message().contains("BON"));
        // MODÉRÉ
        state.stability_score = 0.55;
        assert!(state.status_message().contains("MODÉRÉ"));
        // FAIBLE
        state.stability_score = 0.35;
        assert!(state.status_message().contains("FAIBLE"));
        // CRITIQUE
        state.stability_score = 0.2;
        assert!(state.status_message().contains("CRITIQUE"));
    fn test_stability_state_percentage() {
        assert_eq!(state.stability_percentage(), 75.0);
        state.stability_score = 0.333;
        assert!((state.stability_percentage() - 33.3).abs() < 0.1);

}
