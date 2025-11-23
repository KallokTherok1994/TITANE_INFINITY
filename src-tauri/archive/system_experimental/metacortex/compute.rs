// TITANE∞ v8.0 - MetaCortex Engine
// Module de calcul du cortex supérieur

use super::collect::MetaCortexInputs;
/// Calcule les trois métriques du MetaCortex
/// Retourne: (metacortex_clarity, reasoning_depth, global_coherence)
pub fn compute_metacortex(
    inputs: &MetaCortexInputs,
) -> Result<(f32, f32, f32), String> {
    // 1. metacortex_clarity: clarté globale du cortex supérieur
    let metacortex_clarity = (
        inputs.cortical_coherence * 0.35 +
        inputs.field_coherence * 0.25 +
        inputs.alignment_depth * 0.20 +
        inputs.resonance_level * 0.20
    ).clamp(0.0, 1.0);
    // 2. reasoning_depth: profondeur potentielle de raisonnement
    let reasoning_depth = (
        inputs.integration_depth * 0.40 +
        inputs.core_density * 0.30 +
        inputs.mesh_density * 0.30
    // 3. global_coherence: cohérence cognitive globale du système
    let global_coherence = (
        inputs.cortical_coherence * 0.30 +
        inputs.network_coherence * 0.25 +
        inputs.field_coherence * 0.20 +
        inputs.continuity_score * 0.15 +
        inputs.alignment_depth * 0.10
    Ok((metacortex_clarity, reasoning_depth, global_coherence))
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_compute_metacortex_optimal() {
        let inputs = MetaCortexInputs {
            core_density: 0.9,
            integration_depth: 0.92,
            cortical_coherence: 0.93,
            mesh_density: 0.88,
            network_coherence: 0.9,
            neural_density: 0.85,
            field_coherence: 0.91,
            continuity_score: 0.87,
            alignment_depth: 0.89,
            resonance_level: 0.88,
        };
        let result = compute_metacortex(&inputs);
        assert!(result.is_ok());
        let (clarity, depth, coherence) = result.unwrap();
        assert!(clarity > 0.85);
        assert!(depth > 0.85);
        assert!(coherence > 0.85);
    }
    fn test_compute_metacortex_low() {
            core_density: 0.2,
            integration_depth: 0.18,
            cortical_coherence: 0.19,
            mesh_density: 0.22,
            network_coherence: 0.17,
            neural_density: 0.2,
            field_coherence: 0.18,
            continuity_score: 0.2,
            alignment_depth: 0.19,
            resonance_level: 0.21,
        assert!(clarity < 0.3);
        assert!(depth < 0.3);
        assert!(coherence < 0.3);
    fn test_metacortex_clarity_formula() {
            core_density: 0.0,
            integration_depth: 0.0,
            cortical_coherence: 1.0,
            mesh_density: 0.0,
            network_coherence: 0.0,
            neural_density: 0.0,
            field_coherence: 0.5,
            continuity_score: 0.0,
            alignment_depth: 0.0,
            resonance_level: 0.0,
        let (clarity, _, _) = result.unwrap();
        // clarity = cortical*0.35 + field*0.25 + alignment*0.20 + resonance*0.20
        // = 1.0*0.35 + 0.5*0.25 = 0.475
        assert!((clarity - 0.475).abs() < 0.01);
    fn test_reasoning_depth_formula() {
            core_density: 0.5,
            integration_depth: 1.0,
            cortical_coherence: 0.0,
            field_coherence: 0.0,
        let (_, depth, _) = result.unwrap();
        // depth = integration*0.40 + core*0.30 + mesh*0.30
        // = 1.0*0.40 + 0.5*0.30 = 0.55
        assert!((depth - 0.55).abs() < 0.01);
    fn test_global_coherence_formula() {
            network_coherence: 0.5,
        let (_, _, coherence) = result.unwrap();
        // coherence = cortical*0.30 + network*0.25 + field*0.20 + continuity*0.15 + alignment*0.10
        // = 1.0*0.30 + 0.5*0.25 = 0.425
        assert!((coherence - 0.425).abs() < 0.01);
    fn test_compute_metacortex_clamping() {
            core_density: 1.0,
            mesh_density: 1.0,
            network_coherence: 1.0,
            neural_density: 1.0,
            field_coherence: 1.0,
            continuity_score: 1.0,
            alignment_depth: 1.0,
            resonance_level: 1.0,
        assert_eq!(clarity, 1.0);
        assert_eq!(depth, 1.0);
        assert_eq!(coherence, 1.0);
    fn test_compute_metacortex_balanced() {
            integration_depth: 0.5,
            cortical_coherence: 0.5,
            mesh_density: 0.5,
            neural_density: 0.5,
            continuity_score: 0.5,
            alignment_depth: 0.5,
            resonance_level: 0.5,
        assert!(clarity >= 0.45 && clarity <= 0.55);
        assert!(depth >= 0.45 && depth <= 0.55);
        assert!(coherence >= 0.45 && coherence <= 0.55);
