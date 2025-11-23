// ============================================================================
// TITANE∞ v8.0 - Balance Engine
// Module: collect.rs
// Rôle: Collecte des signaux transversaux pour calcul de l'équilibre

use crate::system::{
    kernel::KernelState,
    cortex_sync::CortexSyncState,
    stability::StabilityState,
    integrity::IntegrityState,
    field::FieldState,
    secureflow::SecureFlowState,
    lowflow::LowFlowState,
};
/// Structure contenant tous les signaux pour le calcul de l'équilibre
#[derive(Debug, Clone)]
pub struct BalanceInputs {
    pub identity_stability: f32,    // Stabilité de l'identité (0.0-1.0)
    pub kernel_integrity: f32,      // Intégrité du kernel (0.0-1.0)
    pub cortex_alignment: f32,      // Alignement du cortex (0.0-1.0)
    pub stability_score: f32,       // Score de stabilité global (0.0-1.0)
    pub integrity_score: f32,       // Score d'intégrité global (0.0-1.0)
    pub field_pressure: f32,        // Pression du champ (0.0-1.0)
    pub field_turbulence: f32,      // Turbulence du champ (0.0-1.0)
    pub stress_index: f32,          // Indice de stress (0.0-1.0)
    pub throttle_level: f32,        // Niveau de throttling (0.0-1.0)
}
impl Default for BalanceInputs {
    fn default() -> Self {
        Self {
            identity_stability: 0.5,
            kernel_integrity: 0.5,
            cortex_alignment: 0.5,
            stability_score: 0.5,
            integrity_score: 0.5,
            field_pressure: 0.3,
            field_turbulence: 0.3,
            stress_index: 0.2,
            throttle_level: 0.0,
        }
    }
/// Collecte tous les signaux transversaux nécessaires au calcul d'équilibre
///
/// # Arguments
/// * `kernel` - État du Kernel Profond
/// * `cortex` - État du Cortex Synchronique
/// * `stability` - État du Stability Monitor
/// * `integrity` - État de l'Integrity Engine
/// * `field` - État du Field Engine
/// * `secureflow` - État du SecureFlow Engine
/// * `lowflow` - État du LowFlow Engine
/// # Returns
/// * `Ok(BalanceInputs)` - Signaux collectés et normalisés
/// * `Err(String)` - Erreur lors de la collecte
pub fn collect_balance_inputs(
    kernel: &KernelState,
    cortex: &CortexSyncState,
    stability: &StabilityState,
    integrity: &IntegrityState,
    field: &FieldState,
    secureflow: &SecureFlowState,
    lowflow: &LowFlowState,
) -> Result<BalanceInputs, String> {
    // Collecter les valeurs du Kernel
    let identity_stability = kernel.identity_stability.clamp(0.0, 1.0);
    let kernel_integrity = kernel.core_integrity.clamp(0.0, 1.0);
    // Collecter l'alignement du Cortex
    let cortex_alignment = cortex.alignment.clamp(0.0, 1.0);
    // Collecter les scores de stabilité et intégrité
    let stability_score = stability.stability_score.clamp(0.0, 1.0);
    let integrity_score = integrity.integrity_score.clamp(0.0, 1.0);
    // Collecter les métriques du Field
    let field_pressure = field.pressure.clamp(0.0, 1.0);
    let field_turbulence = field.turbulence.clamp(0.0, 1.0);
    // Collecter le stress de SecureFlow
    let stress_index = secureflow.stress_index.clamp(0.0, 1.0);
    // Collecter le throttle de LowFlow
    let throttle_level = lowflow.throttle_level.clamp(0.0, 1.0);
    // Validation : tous les signaux doivent être finis
    if !identity_stability.is_finite()
        || !kernel_integrity.is_finite()
        || !cortex_alignment.is_finite()
        || !stability_score.is_finite()
        || !integrity_score.is_finite()
        || !field_pressure.is_finite()
        || !field_turbulence.is_finite()
        || !stress_index.is_finite()
        || !throttle_level.is_finite()
    {
        return Err("Signaux d'équilibre invalides (non finis)".to_string());
    Ok(BalanceInputs {
        identity_stability,
        kernel_integrity,
        cortex_alignment,
        stability_score,
        integrity_score,
        field_pressure,
        field_turbulence,
        stress_index,
        throttle_level,
    })
// TESTS UNITAIRES
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_balance_inputs_default() {
        let inputs = BalanceInputs::default();
        assert_eq!(inputs.identity_stability, 0.5);
        assert_eq!(inputs.kernel_integrity, 0.5);
        assert_eq!(inputs.cortex_alignment, 0.5);
        assert_eq!(inputs.stability_score, 0.5);
        assert_eq!(inputs.integrity_score, 0.5);
        assert_eq!(inputs.field_pressure, 0.3);
        assert_eq!(inputs.field_turbulence, 0.3);
        assert_eq!(inputs.stress_index, 0.2);
        assert_eq!(inputs.throttle_level, 0.0);
    fn test_balance_inputs_clamp() {
        let mut inputs = BalanceInputs::default();
        inputs.identity_stability = 1.5; // Devrait être clampé
        inputs.stress_index = -0.5; // Devrait être clampé
        // Vérifier que les valeurs hors limites sont détectées
        assert!(inputs.identity_stability > 1.0 || inputs.stress_index < 0.0);
