// ============================================================================
// TITANE∞ v8.0 - Balance Engine
// Module: compute.rs
// Rôle: Calcul du balance_score et métriques d'équilibre

use super::collect::BalanceInputs;
/// Calcule les trois métriques principales d'équilibre
///
/// # Formules
/// - `alignment_score = identity_stability + cortex_alignment / 2`
/// - `load_balance = (1 - stress + 1 - throttle) / 2`
/// - `balance_score = (stability + integrity + alignment + 1 - turbulence + 1 - pressure) / 5`
/// # Arguments
/// * `inputs` - Signaux collectés depuis les modules
/// # Returns
/// * `Ok((balance_score, alignment_score, load_balance))` - Les 3 métriques
/// * `Err(String)` - Erreur si calcul invalide
pub fn compute_balance(
    inputs: &BalanceInputs,
) -> Result<(f32, f32, f32), String> {
    // 1. Alignment Score identité + cortex
    let alignment_score = (inputs.identity_stability + inputs.cortex_alignment) / 2.0;
    if !alignment_score.is_finite() {
        return Err("Calcul de alignment_score invalide".to_string());
    }
    // 2. Load Balance (charge globale – inversion de stress + throttle)
    let load_balance = ((1.0 - inputs.stress_index) + (1.0 - inputs.throttle_level)) / 2.0;
    if !load_balance.is_finite() {
        return Err("Calcul de load_balance invalide".to_string());
    // 3. Balance Score (compilation globale)
    // Intègre: stabilité, intégrité, alignement, faible turbulence, faible pression
    let balance_score = (
        inputs.stability_score
            + inputs.integrity_score
            + alignment_score
            + (1.0 - inputs.field_turbulence)
            + (1.0 - inputs.field_pressure)
    ) / 5.0;
    if !balance_score.is_finite() {
        return Err("Calcul de balance_score invalide".to_string());
    // Clamp strict [0.0, 1.0]
    let balance_score = balance_score.clamp(0.0, 1.0);
    let alignment_score = alignment_score.clamp(0.0, 1.0);
    let load_balance = load_balance.clamp(0.0, 1.0);
    Ok((balance_score, alignment_score, load_balance))
}
// TESTS UNITAIRES
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_compute_balance_nominal() {
        let inputs = BalanceInputs {
            identity_stability: 0.8,
            kernel_integrity: 0.85,
            cortex_alignment: 0.9,
            stability_score: 0.82,
            integrity_score: 0.88,
            field_pressure: 0.2,
            field_turbulence: 0.15,
            stress_index: 0.18,
            throttle_level: 0.1,
        };
        let result = compute_balance(&inputs);
        assert!(result.is_ok());
        let (balance, alignment, load) = result.unwrap();
        // Alignment = (0.8 + 0.9) / 2 = 0.85
        assert!((alignment - 0.85).abs() < 0.001);
        // Load = ((1-0.18) + (1-0.1)) / 2 = (0.82 + 0.9) / 2 = 0.86
        assert!((load - 0.86).abs() < 0.01);
        // Balance = (0.82 + 0.88 + 0.85 + 0.85 + 0.8) / 5 = 4.2 / 5 = 0.84
        assert!((balance - 0.84).abs() < 0.01);
        // Vérifier le clamp
        assert!(balance >= 0.0 && balance <= 1.0);
        assert!(alignment >= 0.0 && alignment <= 1.0);
        assert!(load >= 0.0 && load <= 1.0);
    fn test_compute_balance_low() {
            identity_stability: 0.3,
            kernel_integrity: 0.35,
            cortex_alignment: 0.4,
            stability_score: 0.32,
            integrity_score: 0.38,
            field_pressure: 0.7,
            field_turbulence: 0.65,
            stress_index: 0.6,
            throttle_level: 0.5,
        // Alignment = (0.3 + 0.4) / 2 = 0.35
        assert!((alignment - 0.35).abs() < 0.001);
        // Load = ((1-0.6) + (1-0.5)) / 2 = (0.4 + 0.5) / 2 = 0.45
        assert!((load - 0.45).abs() < 0.01);
        // Balance = (0.32 + 0.38 + 0.35 + 0.35 + 0.3) / 5 = 1.7 / 5 = 0.34
        assert!((balance - 0.34).abs() < 0.01);
    fn test_compute_balance_high() {
            identity_stability: 0.95,
            kernel_integrity: 0.92,
            cortex_alignment: 0.94,
            stability_score: 0.93,
            integrity_score: 0.91,
            field_pressure: 0.05,
            field_turbulence: 0.08,
            stress_index: 0.06,
            throttle_level: 0.0,
        let (balance, _, _) = result.unwrap();
        // Balance devrait être très élevé (> 0.9)
        assert!(balance > 0.9);
    fn test_compute_balance_formula_alignment() {
            identity_stability: 0.6,
            kernel_integrity: 0.5,
            cortex_alignment: 0.8,
            stability_score: 0.6,
            integrity_score: 0.6,
            field_pressure: 0.3,
            field_turbulence: 0.3,
            stress_index: 0.2,
        let (_, alignment, _) = result.unwrap();
        // Alignment = (0.6 + 0.8) / 2 = 0.7
        assert!((alignment - 0.7).abs() < 0.001);
    fn test_compute_balance_formula_load() {
            identity_stability: 0.5,
            cortex_alignment: 0.5,
            stability_score: 0.5,
            integrity_score: 0.5,
            stress_index: 0.4,
            throttle_level: 0.2,
        let (_, _, load) = result.unwrap();
        // Load = ((1-0.4) + (1-0.2)) / 2 = (0.6 + 0.8) / 2 = 0.7
        assert!((load - 0.7).abs() < 0.001);
    fn test_compute_balance_clamp() {
        // Cas extrême pour tester le clamp
            identity_stability: 1.0,
            kernel_integrity: 1.0,
            cortex_alignment: 1.0,
            stability_score: 1.0,
            integrity_score: 1.0,
            field_pressure: 0.0,
            field_turbulence: 0.0,
            stress_index: 0.0,
        // Tous devraient être 1.0 (maximal)
        assert_eq!(balance, 1.0);
        assert_eq!(alignment, 1.0);
        assert_eq!(load, 1.0);
    fn test_compute_balance_formula_complete() {
            identity_stability: 0.7,
            kernel_integrity: 0.6,
            stability_score: 0.65,
            integrity_score: 0.7,
            field_pressure: 0.4,
            stress_index: 0.25,
            throttle_level: 0.15,
        // Balance = (0.65 + 0.7 + 0.75 + 0.7 + 0.6) / 5 = 3.4 / 5 = 0.68
        assert!((balance - 0.68).abs() < 0.02);
