// ============================================================================
// TITANE∞ v8.0 - Stability Monitor Engine
// Module: compute.rs
// Rôle: Calcul du stability_score global

use super::collect::StabilityInputs;
/// Calcule les trois métriques principales de stabilité
///
/// # Formules
/// - `coherence_level = identity_stability + cortex_alignment / 2`
/// - `system_health = (kernel_integrity + 1 - turbulence + 1 - stress) / 3`
/// - `stability_score = coherence_level + system_health / 2`
/// # Arguments
/// * `inputs` - Signaux collectés depuis les modules
/// # Returns
/// * `Ok((stability_score, coherence_level, system_health))` - Les 3 métriques
/// * `Err(String)` - Erreur si calcul invalide
pub fn compute_stability(
    inputs: &StabilityInputs,
) -> Result<(f32, f32, f32), String> {
    // 1. Coherence Level (alignement identité + cortex)
    let coherence_level = (inputs.identity_stability + inputs.cortex_alignment) / 2.0;
    if !coherence_level.is_finite() {
        return Err("Calcul de coherence_level invalide".to_string());
    }
    // 2. System Health (intégrité + faible turbulence + faible stress)
    let system_health = (
        inputs.kernel_integrity
            + (1.0 - inputs.field_turbulence)
            + (1.0 - inputs.secureflow_stress)
    ) / 3.0;
    if !system_health.is_finite() {
        return Err("Calcul de system_health invalide".to_string());
    // 3. Stability Score (moyenne des deux métriques précédentes)
    let stability_score = coherence_level + system_health / 2.0;
    if !stability_score.is_finite() {
        return Err("Calcul de stability_score invalide".to_string());
    // Clamp strict [0.0, 1.0]
    let stability_score = stability_score.clamp(0.0, 1.0);
    let coherence_level = coherence_level.clamp(0.0, 1.0);
    let system_health = system_health.clamp(0.0, 1.0);
    Ok((stability_score, coherence_level, system_health))
}
// TESTS UNITAIRES
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_compute_stability_nominal() {
        let inputs = StabilityInputs {
            kernel_integrity: 0.8,
            identity_stability: 0.9,
            cortex_alignment: 0.85,
            field_turbulence: 0.2,
            secureflow_stress: 0.15,
            lowflow_throttle: 0.0,
        };
        let result = compute_stability(&inputs);
        assert!(result.is_ok());
        let (stability, coherence, health) = result.unwrap();
        // Coherence = (0.9 + 0.85) / 2 = 0.875
        assert!((coherence - 0.875).abs() < 0.001);
        // Health = (0.8 + (1-0.2) + (1-0.15)) / 3 = (0.8 + 0.8 + 0.85) / 3 = 0.816
        assert!((health - 0.816).abs() < 0.01);
        // Stability = (0.875 + 0.816) / 2 = 0.845
        assert!((stability - 0.845).abs() < 0.01);
        // Vérifier le clamp
        assert!(stability >= 0.0 && stability <= 1.0);
        assert!(coherence >= 0.0 && coherence <= 1.0);
        assert!(health >= 0.0 && health <= 1.0);
    fn test_compute_stability_low() {
            kernel_integrity: 0.3,
            identity_stability: 0.4,
            cortex_alignment: 0.35,
            field_turbulence: 0.7,
            secureflow_stress: 0.6,
            lowflow_throttle: 0.5,
        // Coherence = (0.4 + 0.35) / 2 = 0.375
        assert!((coherence - 0.375).abs() < 0.001);
        // Health = (0.3 + (1-0.7) + (1-0.6)) / 3 = (0.3 + 0.3 + 0.4) / 3 = 0.333
        assert!((health - 0.333).abs() < 0.01);
        // Stability = (0.375 + 0.333) / 2 = 0.354
        assert!((stability - 0.354).abs() < 0.01);
    fn test_compute_stability_high() {
            kernel_integrity: 0.95,
            identity_stability: 0.92,
            cortex_alignment: 0.94,
            field_turbulence: 0.05,
            secureflow_stress: 0.08,
        let (stability, _, _) = result.unwrap();
        // Stability devrait être très élevé (> 0.9)
        assert!(stability > 0.9);
    fn test_compute_stability_formula_coherence() {
            kernel_integrity: 0.5,
            identity_stability: 0.6,
            cortex_alignment: 0.8,
            field_turbulence: 0.3,
            secureflow_stress: 0.2,
        let (_, coherence, _) = result.unwrap();
        // Coherence = (0.6 + 0.8) / 2 = 0.7
        assert!((coherence - 0.7).abs() < 0.001);
    fn test_compute_stability_formula_health() {
            kernel_integrity: 0.6,
            identity_stability: 0.5,
            cortex_alignment: 0.5,
            field_turbulence: 0.4,
            secureflow_stress: 0.3,
        let (_, _, health) = result.unwrap();
        // Health = (0.6 + (1-0.4) + (1-0.3)) / 3 = (0.6 + 0.6 + 0.7) / 3 = 0.633
        assert!((health - 0.633).abs() < 0.01);
    fn test_compute_stability_clamp() {
        // Cas extrême pour tester le clamp
            kernel_integrity: 1.0,
            identity_stability: 1.0,
            cortex_alignment: 1.0,
            field_turbulence: 0.0,
            secureflow_stress: 0.0,
        // Tous devraient être 1.0 (maximal)
        assert_eq!(stability, 1.0);
        assert_eq!(coherence, 1.0);
        assert_eq!(health, 1.0);
