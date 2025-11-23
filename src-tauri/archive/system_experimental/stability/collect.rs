// ============================================================================
// TITANE∞ v8.0 - Stability Monitor Engine
// Module: collect.rs
// Rôle: Collecte des signaux pour calcul du stability_score

use crate::system::{
    kernel::KernelState,
    cortex_sync::CortexSyncState,
    field::FieldState,
    secureflow::SecureFlowState,
    lowflow::LowFlowState,
};
/// Structure contenant tous les signaux nécessaires au calcul de stabilité
#[derive(Debug, Clone)]
pub struct StabilityInputs {
    pub kernel_integrity: f32,       // Intégrité du kernel (0.0-1.0)
    pub identity_stability: f32,     // Stabilité de l'identité (0.0-1.0)
    pub cortex_alignment: f32,       // Alignement cortex (0.0-1.0)
    pub field_turbulence: f32,       // Turbulence du champ (0.0-1.0)
    pub secureflow_stress: f32,      // Indice de stress (0.0-1.0)
    pub lowflow_throttle: f32,       // Niveau de throttling (0.0-1.0)
}
impl Default for StabilityInputs {
    fn default() -> Self {
        Self {
            kernel_integrity: 0.5,
            identity_stability: 0.5,
            cortex_alignment: 0.5,
            field_turbulence: 0.3,
            secureflow_stress: 0.2,
            lowflow_throttle: 0.0,
        }
    }
/// Collecte tous les signaux nécessaires au calcul de stabilité
///
/// # Arguments
/// * `kernel` - État du Kernel Profond
/// * `cortex` - État du Cortex Synchronique
/// * `field` - État du Field Engine
/// * `secureflow` - État du SecureFlow Engine
/// * `lowflow` - État du LowFlow Engine
/// # Returns
/// * `Ok(StabilityInputs)` - Signaux collectés et normalisés
/// * `Err(String)` - Erreur lors de la collecte
pub fn collect_signals(
    kernel: &KernelState,
    cortex: &CortexSyncState,
    field: &FieldState,
    secureflow: &SecureFlowState,
    lowflow: &LowFlowState,
) -> Result<StabilityInputs, String> {
    // Collecter les valeurs du Kernel Profond
    let kernel_integrity = kernel.core_integrity.clamp(0.0, 1.0);
    let identity_stability = kernel.identity_stability.clamp(0.0, 1.0);
    // Collecter l'alignement du Cortex
    let cortex_alignment = cortex.alignment.clamp(0.0, 1.0);
    // Collecter la turbulence du Field
    let field_turbulence = field.turbulence.clamp(0.0, 1.0);
    // Collecter le stress de SecureFlow
    let secureflow_stress = secureflow.stress_index.clamp(0.0, 1.0);
    // Collecter le throttle de LowFlow
    let lowflow_throttle = lowflow.throttle_level.clamp(0.0, 1.0);
    // Validation : tous les signaux doivent être finis
    if !kernel_integrity.is_finite()
        || !identity_stability.is_finite()
        || !cortex_alignment.is_finite()
        || !field_turbulence.is_finite()
        || !secureflow_stress.is_finite()
        || !lowflow_throttle.is_finite()
    {
        return Err("Signaux de stabilité invalides (non finis)".to_string());
    Ok(StabilityInputs {
        kernel_integrity,
        identity_stability,
        cortex_alignment,
        field_turbulence,
        secureflow_stress,
        lowflow_throttle,
    })
// TESTS UNITAIRES
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_stability_inputs_default() {
        let inputs = StabilityInputs::default();
        assert_eq!(inputs.kernel_integrity, 0.5);
        assert_eq!(inputs.identity_stability, 0.5);
        assert_eq!(inputs.cortex_alignment, 0.5);
        assert_eq!(inputs.field_turbulence, 0.3);
        assert_eq!(inputs.secureflow_stress, 0.2);
        assert_eq!(inputs.lowflow_throttle, 0.0);
    fn test_stability_inputs_clamp() {
        let mut inputs = StabilityInputs::default();
        inputs.kernel_integrity = 1.5; // Devrait être clampé
        inputs.field_turbulence = -0.5; // Devrait être clampé
        // Vérifier que les valeurs sont bien dans [0.0, 1.0]
        assert!(inputs.kernel_integrity >= 0.0 && inputs.kernel_integrity <= 1.0);
        assert!(inputs.field_turbulence >= 0.0 && inputs.field_turbulence <= 1.0);
