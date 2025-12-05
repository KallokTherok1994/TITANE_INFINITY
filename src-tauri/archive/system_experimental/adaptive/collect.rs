// ============================================================================
// MODULE 34: ADAPTIVE INTELLIGENCE ENGINE - COLLECT
// Collecte des entrées adaptatives depuis les modules système
// Rust 2021 - Pas d'unwrap/expect/panic

use std::collections::HashMap;
/// Structure contenant toutes les entrées pour le calcul d'intelligence adaptative
#[derive(Debug, Clone)]
pub struct AdaptiveInputs {
    pub clarity_index: f32,
    pub self_coherence: f32,
    pub insight_potential: f32,
    pub regulation_level: f32,
    pub deviation_index: f32,
    pub global_coherence: f32,
    pub integration_depth: f32,
    pub neural_density: f32,
    pub network_coherence: f32,
    pub continuity_score: f32,
    pub alignment_depth: f32,
}
impl Default for AdaptiveInputs {
    fn default() -> Self {
        Self {
            clarity_index: 0.5,
            self_coherence: 0.5,
            insight_potential: 0.5,
            regulation_level: 0.5,
            deviation_index: 0.5,
            global_coherence: 0.5,
            integration_depth: 0.5,
            neural_density: 0.5,
            network_coherence: 0.5,
            continuity_score: 0.5,
            alignment_depth: 0.5,
        }
    }
/// Collecte les entrées adaptatives depuis les différents états système
pub fn collect_adaptive_inputs(states: &HashMap<String, f32>) -> Result<AdaptiveInputs, String> {
    // Extraction et validation des valeurs depuis ConscienceState
    let clarity_index = clamp_value(
        states.get("conscience_clarity_index").copied().unwrap_or0.5,
        "clarity_index"
    )?;
    let self_coherence = clamp_value(
        states.get("conscience_self_coherence").copied().unwrap_or0.5,
        "self_coherence"
    let insight_potential = clamp_value(
        states.get("conscience_insight_potential").copied().unwrap_or0.5,
        "insight_potential"
    // Extraction depuis GovernorState
    let regulation_level = clamp_value(
        states.get("governor_regulation_level").copied().unwrap_or0.5,
        "regulation_level"
    let deviation_index = clamp_value(
        states.get("governor_deviation_index").copied().unwrap_or0.5,
        "deviation_index"
    // Extraction depuis MetaCortexState
    let global_coherence = clamp_value(
        states.get("metacortex_global_coherence").copied().unwrap_or0.5,
        "global_coherence"
    let integration_depth = clamp_value(
        states.get("metacortex_integration_depth").copied().unwrap_or0.5,
        "integration_depth"
    // Extraction depuis CoreMeshState / NeuroMeshState
    let neural_density = clamp_value(
        states.get("neuromesh_neural_density").copied().unwrap_or0.5,
        "neural_density"
    let network_coherence = clamp_value(
        states.get("neuromesh_network_coherence").copied().unwrap_or0.5,
        "network_coherence"
    // Extraction depuis ContinuumState
    let continuity_score = clamp_value(
        states.get("continuum_continuity_score").copied().unwrap_or0.5,
        "continuity_score"
    // Extraction depuis DeepAlignmentState
    let alignment_depth = clamp_value(
        states.get("alignment_depth").copied().unwrap_or0.5,
        "alignment_depth"
    Ok(AdaptiveInputs {
        clarity_index,
        self_coherence,
        insight_potential,
        regulation_level,
        deviation_index,
        global_coherence,
        integration_depth,
        neural_density,
        network_coherence,
        continuity_score,
        alignment_depth,
    })
/// Clamp une valeur entre 0.0 et 1.0
fn clamp_value(value: f32, field_name: &str) -> Result<f32, String> {
    if value.is_nan() {
        return Err(format!("Erreur: {} est NaN", field_name));
    if value.is_infinite() {
        return Err(format!("Erreur: {} est infini", field_name));
    Ok(value.clamp(0.0, 1.0))
// TESTS
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_collect_adaptive_inputs_default() {
        let states = HashMap::new();
        let result = collect_adaptive_inputs(&states);
        assert!(result.is_ok());
        
        let inputs = result.unwrap();
        assert_eq!(inputs.clarity_index, 0.5);
        assert_eq!(inputs.self_coherence, 0.5);
        assert_eq!(inputs.insight_potential, 0.5);
        assert_eq!(inputs.regulation_level, 0.5);
        assert_eq!(inputs.deviation_index, 0.5);
        assert_eq!(inputs.global_coherence, 0.5);
        assert_eq!(inputs.integration_depth, 0.5);
        assert_eq!(inputs.neural_density, 0.5);
        assert_eq!(inputs.network_coherence, 0.5);
        assert_eq!(inputs.continuity_score, 0.5);
        assert_eq!(inputs.alignment_depth, 0.5);
    fn test_collect_adaptive_inputs_with_values() {
        let mut states = HashMap::new();
        states.insert("conscience_clarity_index".to_string(), 0.85);
        states.insert("conscience_self_coherence".to_string(), 0.90);
        states.insert("conscience_insight_potential".to_string(), 0.75);
        states.insert("governor_regulation_level".to_string(), 0.60);
        states.insert("governor_deviation_index".to_string(), 0.20);
        states.insert("metacortex_global_coherence".to_string(), 0.88);
        states.insert("metacortex_integration_depth".to_string(), 0.82);
        states.insert("neuromesh_neural_density".to_string(), 0.78);
        states.insert("neuromesh_network_coherence".to_string(), 0.85);
        states.insert("continuum_continuity_score".to_string(), 0.92);
        states.insert("alignment_depth".to_string(), 0.87);
        assert_eq!(inputs.clarity_index, 0.85);
        assert_eq!(inputs.self_coherence, 0.90);
        assert_eq!(inputs.insight_potential, 0.75);
        assert_eq!(inputs.regulation_level, 0.60);
        assert_eq!(inputs.deviation_index, 0.20);
        assert_eq!(inputs.global_coherence, 0.88);
        assert_eq!(inputs.integration_depth, 0.82);
        assert_eq!(inputs.neural_density, 0.78);
        assert_eq!(inputs.network_coherence, 0.85);
        assert_eq!(inputs.continuity_score, 0.92);
        assert_eq!(inputs.alignment_depth, 0.87);
    fn test_collect_adaptive_inputs_clamping() {
        states.insert("conscience_clarity_index".to_string(), 1.5);
        states.insert("conscience_self_coherence".to_string(), -0.3);
        states.insert("governor_regulation_level".to_string(), 2.0);
        states.insert("alignment_depth".to_string(), -1.0);
        assert_eq!(inputs.clarity_index, 1.0); // Clamped to 1.0
        assert_eq!(inputs.self_coherence, 0.0); // Clamped to 0.0
        assert_eq!(inputs.regulation_level, 1.0); // Clamped to 1.0
        assert_eq!(inputs.alignment_depth, 0.0); // Clamped to 0.0
    fn test_clamp_value_normal() {
        let result = clamp_value(0.75, "test_field");
        assert_eq!(result.unwrap(), 0.75);
    fn test_clamp_value_above_max() {
        let result = clamp_value(1.5, "test_field");
        assert_eq!(result.unwrap(), 1.0);
    fn test_clamp_value_below_min() {
        let result = clamp_value(-0.3, "test_field");
        assert_eq!(result.unwrap(), 0.0);
    fn test_clamp_value_nan() {
        let result = clamp_value(f32::NAN, "test_field");
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("NaN"));
    fn test_clamp_value_infinite() {
        let result = clamp_value(f32::INFINITY, "test_field");
        assert!(result.unwrap_err().contains("infini"));
