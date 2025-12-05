// Conscience Engine - Module #33
// Calcul des indices de conscience cognitive
// Rust 2021 Edition

use super::collect::ConscienceInputs;
/// Calcule les indices de conscience cognitive
/// 
/// Retourne (clarity_index, self_coherence, insight_potential)
/// Tous les résultats sont clampés entre 0.0 et 1.0
pub fn compute_conscience(inputs: &ConscienceInputs) -> (f32, f32, f32) {
    let clarity_index = compute_clarity_index(inputs);
    let self_coherence = compute_self_coherence(inputs);
    let insight_potential = compute_insight_potential(inputs);
    (clarity_index, self_coherence, insight_potential)
}
/// Calcul de l'indice de clarté cognitive
/// clarity_index = metacortex_clarity*0.35 + global_coherence*0.25 + alignment_depth*0.20 + resonance_level*0.20
fn compute_clarity_index(inputs: &ConscienceInputs) -> f32 {
    let value = inputs.metacortex_clarity * 0.35
        + inputs.global_coherence * 0.25
        + inputs.alignment_depth * 0.20
        + inputs.resonance_level * 0.20;
    
    value.clamp(0.0, 1.0)
/// Calcul de l'auto-cohérence
/// self_coherence = homeostasis_score*0.35 + integration_depth*0.30 + continuity_score*0.20 + (1.0 - deviation_index)*0.15
fn compute_self_coherence(inputs: &ConscienceInputs) -> f32 {
    let value = inputs.homeostasis_score * 0.35
        + inputs.integration_depth * 0.30
        + inputs.continuity_score * 0.20
        + (1.0 - inputs.deviation_index) * 0.15;
/// Calcul du potentiel d'insight
/// insight_potential = reasoning_depth*0.40 + metacortex_clarity*0.30 + resonance_level*0.30
fn compute_insight_potential(inputs: &ConscienceInputs) -> f32 {
    let value = inputs.reasoning_depth * 0.40
        + inputs.metacortex_clarity * 0.30
        + inputs.resonance_level * 0.30;
#[cfg(test)]
mod tests {
    use super::*;
    fn create_optimal_inputs() -> ConscienceInputs {
        ConscienceInputs {
            metacortex_clarity: 1.0,
            global_coherence: 1.0,
            reasoning_depth: 1.0,
            regulation_level: 1.0,
            deviation_index: 0.0,
            homeostasis_score: 1.0,
            integration_depth: 1.0,
            continuity_score: 1.0,
            alignment_depth: 1.0,
            resonance_level: 1.0,
        }
    }
    fn create_low_inputs() -> ConscienceInputs {
            metacortex_clarity: 0.0,
            global_coherence: 0.0,
            reasoning_depth: 0.0,
            regulation_level: 0.0,
            deviation_index: 1.0,
            homeostasis_score: 0.0,
            integration_depth: 0.0,
            continuity_score: 0.0,
            alignment_depth: 0.0,
            resonance_level: 0.0,
    #[test]
    fn test_compute_conscience_optimal() {
        let inputs = create_optimal_inputs();
        let (clarity, coherence, insight) = compute_conscience(&inputs);
        
        assert!((clarity - 1.0).abs() < 0.01, "Clarity devrait être proche de 1.0");
        assert!((coherence - 1.0).abs() < 0.01, "Coherence devrait être proche de 1.0");
        assert!((insight - 1.0).abs() < 0.01, "Insight devrait être proche de 1.0");
    fn test_compute_conscience_low() {
        let inputs = create_low_inputs();
        assert!((clarity - 0.0).abs() < 0.01, "Clarity devrait être proche de 0.0");
        assert!((insight - 0.0).abs() < 0.01, "Insight devrait être proche de 0.0");
        // Note: coherence sera > 0 car (1.0 - deviation_index) = (1.0 - 1.0) * 0.15 = 0.0
        assert!(coherence >= 0.0 && coherence <= 0.2);
    fn test_clarity_index_formula() {
        let inputs = ConscienceInputs {
            metacortex_clarity: 0.8,
            global_coherence: 0.6,
            reasoning_depth: 0.5,
            regulation_level: 0.5,
            deviation_index: 0.2,
            homeostasis_score: 0.5,
            integration_depth: 0.5,
            continuity_score: 0.5,
            alignment_depth: 0.7,
            resonance_level: 0.9,
        };
        let clarity = compute_clarity_index(&inputs);
        let expected = 0.8 * 0.35 + 0.6 * 0.25 + 0.7 * 0.20 + 0.9 * 0.20;
        assert!(clarity - expected.abs() < 0.001);
    fn test_self_coherence_formula() {
            metacortex_clarity: 0.5,
            global_coherence: 0.5,
            deviation_index: 0.3,
            homeostasis_score: 0.8,
            integration_depth: 0.7,
            continuity_score: 0.9,
            alignment_depth: 0.5,
            resonance_level: 0.5,
        let coherence = compute_self_coherence(&inputs);
        let expected = 0.8 * 0.35 + 0.7 * 0.30 + 0.9 * 0.20 + (1.0 - 0.3) * 0.15;
        assert!(coherence - expected.abs() < 0.001);
    fn test_insight_potential_formula() {
            metacortex_clarity: 0.85,
            reasoning_depth: 0.75,
            deviation_index: 0.5,
            resonance_level: 0.65,
        let insight = compute_insight_potential(&inputs);
        let expected = 0.75 * 0.40 + 0.85 * 0.30 + 0.65 * 0.30;
        assert!(insight - expected.abs() < 0.001);
    fn test_clamping_upper_bound() {
        let mut inputs = create_optimal_inputs();
        // Force des valeurs au-dessus de 1.0 avant clamping
        inputs.metacortex_clarity = 1.5;
        inputs.global_coherence = 1.2;
        inputs.clamp_all();
        assert!(clarity <= 1.0);
        assert!(coherence <= 1.0);
        assert!(insight <= 1.0);
    fn test_clamping_lower_bound() {
        assert!(clarity >= 0.0);
        assert!(coherence >= 0.0);
        assert!(insight >= 0.0);
    fn test_typical_scenario() {
            metacortex_clarity: 0.75,
            global_coherence: 0.68,
            reasoning_depth: 0.72,
            regulation_level: 0.70,
            deviation_index: 0.20,
            homeostasis_score: 0.80,
            integration_depth: 0.65,
            continuity_score: 0.78,
            alignment_depth: 0.71,
            resonance_level: 0.69,
        // Vérifications de base
        assert!(clarity > 0.6 && clarity < 0.8);
        assert!(coherence > 0.6 && coherence < 0.9);
        assert!(insight > 0.6 && insight < 0.8);
    fn test_deviation_impact_on_coherence() {
        let mut inputs_low_deviation = ConscienceInputs {
            deviation_index: 0.1,
            homeostasis_score: 0.7,
            continuity_score: 0.7,
        let mut inputs_high_deviation = inputs_low_deviation.clone();
        inputs_high_deviation.deviation_index = 0.9;
        let (_, coherence_low, _) = compute_conscience(&inputs_low_deviation);
        let (_, coherence_high, _) = compute_conscience(&inputs_high_deviation);
        // Plus la déviation est haute, plus la cohérence devrait être basse
        assert!(coherence_low > coherence_high);
