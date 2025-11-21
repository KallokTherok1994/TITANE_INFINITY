// ============================================================================
// TITANE∞ v8.0 - Integrity Engine
// Module: collect.rs
// Rôle: Collecte des signaux pour validation de l'intégrité

use crate::system::{
    kernel::KernelState,
    cortex_sync::CortexSyncState,
    stability::StabilityState,
};
/// Structure contenant les signaux pour l'évaluation de l'intégrité
#[derive(Debug, Clone)]
pub struct IntegrityInputs {
    pub kernel_identity: f32,       // Stabilité de l'identité kernel (0.0-1.0)
    pub kernel_integrity: f32,      // Intégrité du kernel (0.0-1.0)
    pub cortex_alignment: f32,      // Alignement du cortex (0.0-1.0)
    pub cortex_drift: f32,          // Dérive du cortex (0.0-1.0)
    pub stability_score: f32,       // Score de stabilité global (0.0-1.0)
}
impl Default for IntegrityInputs {
    fn default() -> Self {
        Self {
            kernel_identity: 0.5,
            kernel_integrity: 0.5,
            cortex_alignment: 0.5,
            cortex_drift: 0.2,
            stability_score: 0.5,
        }
    }
/// Collecte les signaux nécessaires à l'évaluation de l'intégrité
///
/// # Arguments
/// * `kernel` - État du Kernel Profond
/// * `cortex` - État du Cortex Synchronique
/// * `stability` - État du Stability Monitor
/// # Returns
/// * `Ok(IntegrityInputs)` - Signaux collectés et normalisés
/// * `Err(String)` - Erreur lors de la collecte
pub fn collect_inputs(
    kernel: &KernelState,
    cortex: &CortexSyncState,
    stability: &StabilityState,
) -> Result<IntegrityInputs, String> {
    // Collecter les valeurs du Kernel
    let kernel_identity = kernel.identity_stability.clamp(0.0, 1.0);
    let kernel_integrity = kernel.core_integrity.clamp(0.0, 1.0);
    // Collecter les valeurs du Cortex
    let cortex_alignment = cortex.alignment.clamp(0.0, 1.0);
    
    // Calculer la dérive du cortex (inverse de la stabilité tendancielle)
    // Plus la stability_trend est faible, plus il y a de dérive
    let cortex_drift = (1.0 - cortex.stability).clamp(0.0, 1.0);
    // Collecter le score de stabilité global
    let stability_score = stability.stability_score.clamp(0.0, 1.0);
    // Validation : tous les signaux doivent être finis
    if !kernel_identity.is_finite()
        || !kernel_integrity.is_finite()
        || !cortex_alignment.is_finite()
        || !cortex_drift.is_finite()
        || !stability_score.is_finite()
    {
        return Err("Signaux d'intégrité invalides (non finis)".to_string());
    Ok(IntegrityInputs {
        kernel_identity,
        kernel_integrity,
        cortex_alignment,
        cortex_drift,
        stability_score,
    })
// TESTS UNITAIRES
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_integrity_inputs_default() {
        let inputs = IntegrityInputs::default();
        assert_eq!(inputs.kernel_identity, 0.5);
        assert_eq!(inputs.kernel_integrity, 0.5);
        assert_eq!(inputs.cortex_alignment, 0.5);
        assert_eq!(inputs.cortex_drift, 0.2);
        assert_eq!(inputs.stability_score, 0.5);
    fn test_integrity_inputs_clamp() {
        let mut inputs = IntegrityInputs::default();
        inputs.kernel_identity = 1.5; // Devrait être clampé
        inputs.cortex_drift = -0.3; // Devrait être clampé
        // Vérifier que les valeurs hors limites sont hors [0.0, 1.0]
        assert!(inputs.kernel_identity > 1.0 || inputs.kernel_identity < 0.0 
            || inputs.cortex_drift > 1.0 || inputs.cortex_drift < 0.0);
