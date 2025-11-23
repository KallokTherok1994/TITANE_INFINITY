// ============================================================================
// TITANE∞ v8.0 - Integrity Engine (Module #18)
// Validation interne et cohérence structurelle
//
// Rôle:
// - Analyser la cohérence structurelle du système
// - Vérifier l'intégrité interne des signaux
// - Contrôler la stabilité des invariants
// - Détecter incohérences, dérives, contradictions
// - Produire un integrity_score global
// Philosophie:
// - 100% diagnostique (aucune modification)
// - Déterministe et reproductible
// - Local, sans dépendances externes
// - Base de confiance pour TITANE∞

use std::time::{SystemTime, UNIX_EPOCH};
use crate::system::{
    kernel::KernelState,
    cortex_sync::CortexSyncState,
    stability::StabilityState,
};
pub mod collect;
pub mod evaluate;
use collect::IntegrityInputs;
/// État de l'Integrity Engine
#[derive(Debug, Clone)]
pub struct IntegrityState {
    pub initialized: bool,         // État d'initialisation
    pub integrity_score: f32,      // Score d'intégrité global [0.0, 1.0]
    pub consistency_score: f32,    // Score de cohérence [0.0, 1.0]
    pub drift_score: f32,          // Score de dérive [0.0, 1.0]
    pub last_update: u64,          // Timestamp dernière mise à jour
}
impl Default for IntegrityState {
    fn default() -> Self {
        Self {
            initialized: false,
            integrity_score: 0.5,
            consistency_score: 0.5,
            drift_score: 0.2,
            last_update: 0,
        }
    }
impl IntegrityState {
    /// Crée un nouvel état Integrity
    pub fn new() -> Self {
        Self::default()
    /// Lissage progressif (70% ancien + 30% nouveau)
    fn smooth_transition(&mut self, new_integrity: f32, new_consistency: f32, new_drift: f32) {
        self.integrity_score = (0.7 * self.integrity_score) + (0.3 * new_integrity);
        self.consistency_score = (0.7 * self.consistency_score) + (0.3 * new_consistency);
        self.drift_score = (0.7 * self.drift_score) + (0.3 * new_drift);
    /// Clamp toutes les valeurs dans [0.0, 1.0]
    fn clamp_all(&mut self) {
        self.integrity_score = self.integrity_score.clamp(0.0, 1.0);
        self.consistency_score = self.consistency_score.clamp(0.0, 1.0);
        self.drift_score = self.drift_score.clamp(0.0, 1.0);
    /// Retourne un message de statut en français
    pub fn status_message(&self) -> String {
        if self.integrity_score >= 0.85 && self.drift_score < 0.15 {
            "Integrity: EXCELLENT - Intégrité structurelle optimale".to_string()
        } else if self.integrity_score >= 0.70 && self.drift_score < 0.30 {
            "Integrity: BON - Cohérence interne satisfaisante".to_string()
        } else if self.integrity_score >= 0.50 {
            "Integrity: MODÉRÉ - Surveillance de la dérive recommandée".to_string()
        } else if self.integrity_score >= 0.30 {
            "Integrity: FAIBLE - Incohérences détectées".to_string()
        } else {
            "Integrity: CRITIQUE - Corruption structurelle possible".to_string()
    /// Vérifie si l'intégrité est bonne
    pub fn is_intact(&self) -> bool {
        self.integrity_score >= 0.60 && self.consistency_score >= 0.50 && self.drift_score < 0.40
    /// Vérifie si l'intégrité est compromise
    pub fn is_compromised(&self) -> bool {
        self.integrity_score < 0.30 || self.consistency_score < 0.25 || self.drift_score > 0.70
    /// Retourne le niveau d'intégrité 0 - 100
    pub fn integrity_percentage(&self) -> f32 {
        self.integrity_score * 100.0
    /// Vérifie si le système dérive
    pub fn is_drifting(&self) -> bool {
        self.drift_score > 0.50
/// Initialise l'Integrity Engine
///
/// # Returns
/// * `Ok(IntegrityState)` - État initialisé avec valeurs par défaut
/// * `Err(String)` - Erreur lors de l'initialisation
pub fn init() -> Result<IntegrityState, String> {
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|_| "Erreur temporelle".to_string())?
        .as_secs();
    Ok(IntegrityState {
        initialized: true,
        integrity_score: 0.5,
        consistency_score: 0.5,
        drift_score: 0.2,
        last_update: timestamp,
    })
/// Tick principal de l'Integrity Engine
/// Pipeline:
/// 1. Collecter les signaux (collect::collect_inputs)
/// 2. Évaluer l'intégrité (evaluate::evaluate_integrity)
/// 3. Lisser les transitions (70%/30%)
/// 4. Clamp strict [0.0, 1.0]
/// 5. Mettre à jour timestamp
/// # Arguments
/// * `state` - État mutable de l'Integrity Engine
/// * `kernel` - État du Kernel Profond
/// * `cortex` - État du Cortex Synchronique
/// * `stability` - État du Stability Monitor
/// * `Ok(())` - Tick réussi
/// * `Err(String)` - Erreur lors du tick
pub fn tick(
    state: &mut IntegrityState,
    kernel: &KernelState,
    cortex: &CortexSyncState,
    stability: &StabilityState,
) -> Result<(), String> {
    // 1. Collecter les signaux
    let inputs = collect::collect_inputs(kernel, cortex, stability)?;
    // 2. Évaluer l'intégrité
    let (integrity_score, consistency_score, drift_score) = evaluate::evaluate_integrity(&inputs)?;
    // 3. Lisser les transitions (70% ancien + 30% nouveau)
    state.smooth_transition(integrity_score, consistency_score, drift_score);
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
    fn test_integrity_state_new() {
        let state = IntegrityState::new();
        assert!(!state.initialized);
        assert_eq!(state.integrity_score, 0.5);
        assert_eq!(state.consistency_score, 0.5);
        assert_eq!(state.drift_score, 0.2);
        assert_eq!(state.last_update, 0);
    fn test_integrity_state_default() {
        let state = IntegrityState::default();
    fn test_integrity_state_init() {
        let result = init();
        assert!(result.is_ok());
        let state = result.unwrap();
        assert!(state.initialized);
        assert!(state.last_update > 0);
    fn test_integrity_state_smooth_transition() {
        let mut state = IntegrityState::new();
        state.integrity_score = 0.5;
        state.consistency_score = 0.5;
        state.drift_score = 0.3;
        // Appliquer lissage avec nouvelles valeurs
        state.smooth_transition(0.8, 0.9, 0.15);
        // Vérifier formule 70%/30%
        // integrity: 0.7*0.5 + 0.3*0.8 = 0.35 + 0.24 = 0.59
        assert!((state.integrity_score - 0.59).abs() < 0.01);
        // consistency: 0.7*0.5 + 0.3*0.9 = 0.35 + 0.27 = 0.62
        assert!((state.consistency_score - 0.62).abs() < 0.01);
        // drift: 0.7*0.3 + 0.3*0.15 = 0.21 + 0.045 = 0.255
        assert!((state.drift_score - 0.255).abs() < 0.01);
    fn test_integrity_state_clamp() {
        state.integrity_score = 1.5; // > 1.0
        state.consistency_score = -0.2; // < 0.0
        state.drift_score = 0.5;
        state.clamp_all();
        assert_eq!(state.integrity_score, 1.0);
        assert_eq!(state.consistency_score, 0.0);
        assert_eq!(state.drift_score, 0.5);
    fn test_integrity_state_is_intact() {
        // Cas intact
        state.integrity_score = 0.7;
        state.consistency_score = 0.6;
        assert!(state.is_intact());
        // Cas non intact (integrity trop bas)
        assert!(!state.is_intact());
    fn test_integrity_state_is_compromised() {
        // Cas compromis
        state.integrity_score = 0.25;
        assert!(state.is_compromised());
        // Cas non compromis
        state.integrity_score = 0.6;
        assert!(!state.is_compromised());
    fn test_integrity_state_is_drifting() {
        // Dérive élevée
        state.drift_score = 0.6;
        assert!(state.is_drifting());
        // Dérive faible
        assert!(!state.is_drifting());
    fn test_integrity_state_status_messages() {
        // EXCELLENT
        state.integrity_score = 0.9;
        state.drift_score = 0.1;
        assert!(state.status_message().contains("EXCELLENT"));
        // BON
        state.integrity_score = 0.75;
        state.drift_score = 0.25;
        assert!(state.status_message().contains("BON"));
        // MODÉRÉ
        state.integrity_score = 0.55;
        assert!(state.status_message().contains("MODÉRÉ"));
        // FAIBLE
        state.integrity_score = 0.35;
        assert!(state.status_message().contains("FAIBLE"));
        // CRITIQUE
        state.integrity_score = 0.2;
        assert!(state.status_message().contains("CRITIQUE"));
    fn test_integrity_state_percentage() {
        assert_eq!(state.integrity_percentage(), 75.0);
        state.integrity_score = 0.333;
        assert!((state.integrity_percentage() - 33.3).abs() < 0.1);

}
