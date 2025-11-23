// ============================================================================
// MODULE 34: ADAPTIVE INTELLIGENCE ENGINE - COMPUTE
// Calcul des métriques d'intelligence adaptative
// Rust 2021 - Pas d'unwrap/expect/panic

use super::collect::AdaptiveInputs;
/// Calcule les métriques d'intelligence adaptative
/// Retourne (adaptation_score, plasticity_level, cognitive_flexibility)
pub fn compute_adaptive(inputs: &AdaptiveInputs) -> Result<(f32, f32, f32), String> {
    // Calcul du score d'adaptation
    // adaptation_score = self_coherence*0.30 + global_coherence*0.25 + (1.0-regulation_level)*0.20 + continuity_score*0.15 + alignment_depth*0.10
    let adaptation_score = inputs.self_coherence * 0.30
        + inputs.global_coherence * 0.25
        + (1.0 - inputs.regulation_level) * 0.20
        + inputs.continuity_score * 0.15
        + inputs.alignment_depth * 0.10;
    
    let adaptation_score = clamp_result(adaptation_score, "adaptation_score")?;
    // Calcul du niveau de plasticité
    // plasticity_level = insight_potential*0.35 + integration_depth*0.30 + neural_density*0.20 + network_coherence*0.15
    let plasticity_level = inputs.insight_potential * 0.35
        + inputs.integration_depth * 0.30
        + inputs.neural_density * 0.20
        + inputs.network_coherence * 0.15;
    let plasticity_level = clamp_result(plasticity_level, "plasticity_level")?;
    // Calcul de la flexibilité cognitive
    // cognitive_flexibility = clarity_index*0.30 + insight_potential*0.30 + alignment_depth*0.20 + continuity_score*0.20
    let cognitive_flexibility = inputs.clarity_index * 0.30
        + inputs.insight_potential * 0.30
        + inputs.alignment_depth * 0.20
        + inputs.continuity_score * 0.20;
    let cognitive_flexibility = clamp_result(cognitive_flexibility, "cognitive_flexibility")?;
    Ok((adaptation_score, plasticity_level, cognitive_flexibility))
}
/// Clamp un résultat entre 0.0 et 1.0
fn clamp_result(value: f32, metric_name: &str) -> Result<f32, String> {
    if value.is_nan() {
        return Err(format!("Erreur: {} est NaN", metric_name));
    }
    if value.is_infinite() {
        return Err(format!("Erreur: {} est infini", metric_name));
    Ok(value.clamp(0.0, 1.0))
// TESTS
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_compute_adaptive_optimal() {
        let inputs = AdaptiveInputs {
            clarity_index: 0.90,
            self_coherence: 0.95,
            insight_potential: 0.88,
            regulation_level: 0.30, // Low regulation = high adaptation
            deviation_index: 0.15,
            global_coherence: 0.92,
            integration_depth: 0.85,
            neural_density: 0.87,
            network_coherence: 0.89,
            continuity_score: 0.93,
            alignment_depth: 0.91,
        };
        let result = compute_adaptive(&inputs);
        assert!(result.is_ok());
        
        let (adaptation_score, plasticity_level, cognitive_flexibility) = result.unwrap();
        // Vérification adaptation_score
        let expected_adaptation = 0.95 * 0.30 + 0.92 * 0.25 + (1.0 - 0.30) * 0.20 + 0.93 * 0.15 + 0.91 * 0.10;
        assert!(adaptation_score - expected_adaptation.abs() < 0.001);
        // Vérification plasticity_level
        let expected_plasticity = 0.88 * 0.35 + 0.85 * 0.30 + 0.87 * 0.20 + 0.89 * 0.15;
        assert!(plasticity_level - expected_plasticity.abs() < 0.001);
        // Vérification cognitive_flexibility
        let expected_flexibility = 0.90 * 0.30 + 0.88 * 0.30 + 0.91 * 0.20 + 0.93 * 0.20;
        assert!(cognitive_flexibility - expected_flexibility.abs() < 0.001);
    fn test_compute_adaptive_low_values() {
            clarity_index: 0.20,
            self_coherence: 0.15,
            insight_potential: 0.18,
            regulation_level: 0.90, // High regulation = low adaptation
            deviation_index: 0.85,
            global_coherence: 0.22,
            integration_depth: 0.19,
            neural_density: 0.21,
            network_coherence: 0.23,
            continuity_score: 0.17,
            alignment_depth: 0.16,
        // Tous les scores devraient être bas
        assert!(adaptation_score < 0.30);
        assert!(plasticity_level < 0.30);
        assert!(cognitive_flexibility < 0.30);
    fn test_compute_adaptive_formula_adaptation() {
            clarity_index: 0.5,
            self_coherence: 0.80,
            insight_potential: 0.5,
            regulation_level: 0.40,
            deviation_index: 0.5,
            global_coherence: 0.70,
            integration_depth: 0.5,
            neural_density: 0.5,
            network_coherence: 0.5,
            continuity_score: 0.60,
            alignment_depth: 0.50,
        let (adaptation_score, _, _) = result.unwrap();
        // Calcul manuel: 0.80*0.30 + 0.70*0.25 + (1.0-0.40)*0.20 + 0.60*0.15 + 0.50*0.10
        // = 0.24 + 0.175 + 0.12 + 0.09 + 0.05 = 0.675
        let expected = 0.675;
        assert!(adaptation_score - expected.abs() < 0.001);
    fn test_compute_adaptive_formula_plasticity() {
            self_coherence: 0.5,
            insight_potential: 0.80,
            regulation_level: 0.5,
            global_coherence: 0.5,
            integration_depth: 0.70,
            neural_density: 0.60,
            network_coherence: 0.75,
        continuity_score: 0.5,
            alignment_depth: 0.5,
        let (_, plasticity_level, _) = result.unwrap();
        // Calcul manuel: 0.80*0.35 + 0.70*0.30 + 0.60*0.20 + 0.75*0.15
        // = 0.28 + 0.21 + 0.12 + 0.1125 = 0.7225
        let expected = 0.7225;
        assert!(plasticity_level - expected.abs() < 0.001);
    fn test_compute_adaptive_formula_flexibility() {
            clarity_index: 0.85,
            insight_potential: 0.75,
            continuity_score: 0.80,
            alignment_depth: 0.70,
        let (_, _, cognitive_flexibility) = result.unwrap();
        // Calcul manuel: 0.85*0.30 + 0.75*0.30 + 0.70*0.20 + 0.80*0.20
        // = 0.255 + 0.225 + 0.14 + 0.16 = 0.78
        let expected = 0.78;
        assert!(cognitive_flexibility - expected.abs() < 0.001);
    fn test_compute_adaptive_clamping_high() {
            clarity_index: 1.0,
            self_coherence: 1.0,
            insight_potential: 1.0,
            regulation_level: 0.0, // Minimal regulation
            deviation_index: 0.0,
            global_coherence: 1.0,
            integration_depth: 1.0,
            neural_density: 1.0,
            network_coherence: 1.0,
            continuity_score: 1.0,
            alignment_depth: 1.0,
        // Tous les scores doivent être <= 1.0
        assert!(adaptation_score <= 1.0);
        assert!(plasticity_level <= 1.0);
        assert!(cognitive_flexibility <= 1.0);
    fn test_compute_adaptive_clamping_low() {
            clarity_index: 0.0,
            self_coherence: 0.0,
            insight_potential: 0.0,
            regulation_level: 1.0, // Maximum regulation
            deviation_index: 1.0,
            global_coherence: 0.0,
            integration_depth: 0.0,
            neural_density: 0.0,
            network_coherence: 0.0,
            continuity_score: 0.0,
            alignment_depth: 0.0,
        // Tous les scores doivent être >= 0.0
        assert!(adaptation_score >= 0.0);
        assert!(plasticity_level >= 0.0);
        assert!(cognitive_flexibility >= 0.0);
    fn test_compute_adaptive_default_inputs() {
        let inputs = AdaptiveInputs::default();
        // Avec toutes les valeurs à 0.5 et regulation_level à 0.5
        // adaptation = 0.5*0.30 + 0.5*0.25 + 0.5*0.20 + 0.5*0.15 + 0.5*0.10 = 0.5
        // plasticity = 0.5*0.35 + 0.5*0.30 + 0.5*0.20 + 0.5*0.15 = 0.5
        // flexibility = 0.5*0.30 + 0.5*0.30 + 0.5*0.20 + 0.5*0.20 = 0.5
        assert!((adaptation_score - 0.5).abs() < 0.001);
        assert!((plasticity_level - 0.5).abs() < 0.001);
        assert!((cognitive_flexibility - 0.5).abs() < 0.001);
