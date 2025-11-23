// ============================================================================
// TITANE∞ v8.0 - Integrity Engine
// Module: evaluate.rs
// Rôle: Calcul du score d'intégrité global

use super::collect::IntegrityInputs;
/// Évalue l'intégrité globale du système
///
/// # Formules
/// - `consistency_score = kernel_identity + cortex_alignment / 2`
/// - `drift_score = cortex_drift` (clamped)
/// - `integrity_score = (consistency + kernel_integrity + stability + 1 - drift) / 4`
/// # Arguments
/// * `inputs` - Signaux collectés depuis les modules
/// # Returns
/// * `Ok((integrity_score, consistency_score, drift_score))` - Les 3 métriques
/// * `Err(String)` - Erreur si calcul invalide
pub fn evaluate_integrity(
    inputs: &IntegrityInputs,
) -> Result<(f32, f32, f32), String> {
    // 1. Consistency Score (cohérence identitaire + alignment cortex)
    let consistency_score = (inputs.kernel_identity + inputs.cortex_alignment) / 2.0;
    if !consistency_score.is_finite() {
        return Err("Calcul de consistency_score invalide".to_string());
    }
    // 2. Drift Score (dérive interne)
    let drift_score = inputs.cortex_drift.clamp(0.0, 1.0);
    if !drift_score.is_finite() {
        return Err("Calcul de drift_score invalide".to_string());
    // 3. Integrity Score (score final global)
    // Formule: moyenne de (consistency, kernel_integrity, stability, inverse_drift)
    let integrity_score = (
        consistency_score
            + inputs.kernel_integrity
            + inputs.stability_score
            + (1.0 - drift_score)
    ) / 4.0;
    if !integrity_score.is_finite() {
        return Err("Calcul de integrity_score invalide".to_string());
    // Clamp strict [0.0, 1.0]
    let integrity_score = integrity_score.clamp(0.0, 1.0);
    let consistency_score = consistency_score.clamp(0.0, 1.0);
    Ok((integrity_score, consistency_score, drift_score))
}
// TESTS UNITAIRES
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_evaluate_integrity_nominal() {
        let inputs = IntegrityInputs {
            kernel_identity: 0.85,
            kernel_integrity: 0.8,
            cortex_alignment: 0.9,
            cortex_drift: 0.15,
            stability_score: 0.82,
        };
        let result = evaluate_integrity(&inputs);
        assert!(result.is_ok());
        let (integrity, consistency, drift) = result.unwrap();
        // Consistency = (0.85 + 0.9) / 2 = 0.875
        assert!((consistency - 0.875).abs() < 0.001);
        // Drift = 0.15
        assert_eq!(drift, 0.15);
        // Integrity = (0.875 + 0.8 + 0.82 + (1-0.15)) / 4 = (0.875 + 0.8 + 0.82 + 0.85) / 4 = 0.836
        assert!((integrity - 0.836).abs() < 0.01);
        // Vérifier le clamp
        assert!(integrity >= 0.0 && integrity <= 1.0);
        assert!(consistency >= 0.0 && consistency <= 1.0);
        assert!(drift >= 0.0 && drift <= 1.0);
    fn test_evaluate_integrity_low() {
            kernel_identity: 0.35,
            kernel_integrity: 0.4,
            cortex_alignment: 0.3,
            cortex_drift: 0.6,
            stability_score: 0.38,
        // Consistency = (0.35 + 0.3) / 2 = 0.325
        assert!((consistency - 0.325).abs() < 0.001);
        // Drift = 0.6 (élevé)
        assert_eq!(drift, 0.6);
        // Integrity = (0.325 + 0.4 + 0.38 + 0.4) / 4 = 0.376
        assert!((integrity - 0.376).abs() < 0.01);
    fn test_evaluate_integrity_high() {
            kernel_identity: 0.95,
            kernel_integrity: 0.92,
            cortex_alignment: 0.94,
            cortex_drift: 0.05,
            stability_score: 0.9,
        let (integrity, _, _) = result.unwrap();
        // Integrity devrait être très élevé (> 0.9)
        assert!(integrity > 0.9);
    fn test_evaluate_integrity_formula_consistency() {
            kernel_identity: 0.7,
            kernel_integrity: 0.5,
            cortex_drift: 0.2,
            stability_score: 0.6,
        let (_, consistency, _) = result.unwrap();
        // Consistency = (0.7 + 0.9) / 2 = 0.8
        assert!((consistency - 0.8).abs() < 0.001);
    fn test_evaluate_integrity_drift_impact() {
            kernel_identity: 0.8,
            cortex_alignment: 0.8,
            cortex_drift: 0.8, // Forte dérive
            stability_score: 0.8,
        let (integrity, _, drift) = result.unwrap();
        // Drift élevé devrait réduire integrity
        assert_eq!(drift, 0.8);
        
        // Integrity = (0.8 + 0.8 + 0.8 + 0.2) / 4 = 0.65
        assert!((integrity - 0.65).abs() < 0.01);
    fn test_evaluate_integrity_clamp() {
        // Cas extrême pour tester le clamp
            kernel_identity: 1.0,
            kernel_integrity: 1.0,
            cortex_alignment: 1.0,
            cortex_drift: 0.0,
            stability_score: 1.0,
        // Tous devraient être optimaux
        assert_eq!(integrity, 1.0);
        assert_eq!(consistency, 1.0);
        assert_eq!(drift, 0.0);
    fn test_evaluate_integrity_formula_complete() {
            kernel_identity: 0.6,
            kernel_integrity: 0.7,
            cortex_drift: 0.3,
            stability_score: 0.65,
        // Integrity = ((0.6+0.8)/2 + 0.7 + 0.65 + 0.7) / 4
        //           = (0.7 + 0.7 + 0.65 + 0.7) / 4 = 0.6875
        assert!((integrity - 0.6875).abs() < 0.01);
