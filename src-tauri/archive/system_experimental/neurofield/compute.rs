// TITANE∞ v8.0 - NeuroField Engine
// Module de calcul du champ neuronal interne

use super::collect::NeuroFieldInputs;
/// Calcule les trois métriques neuronales
/// Retourne: (neural_density, signal_propagation, field_coherence)
pub fn compute_neurofield(
    inputs: &NeuroFieldInputs,
) -> Result<(f32, f32, f32), String> {
    // 1. neural_density: épaisseur cognitive, base du tissu neuronal
    // Vitalité + continuité + alignement
    let neural_density = (
        inputs.vitality_level * 0.40 +
        inputs.continuity_score * 0.30 +
        inputs.alignment_depth * 0.30
    ).clamp(0.0, 1.0);
    // 2. signal_propagation: fluidité et qualité des échanges internes
    // Énergie + résonance + continuité
    let signal_propagation = (
        inputs.energy_flow * 0.45 +
        inputs.resonance_level * 0.35 +
        inputs.continuity_score * 0.20
    // 3. field_coherence: cohérence du champ neuronal entier
    // Alignement + résonance + vitalité
    let field_coherence = (
        inputs.alignment_depth * 0.40 +
        inputs.resonance_level * 0.30 +
        inputs.vitality_level * 0.30
    Ok((neural_density, signal_propagation, field_coherence))
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_compute_neurofield_optimal() {
        let inputs = NeuroFieldInputs {
            vitality_level: 0.9,
            energy_flow: 0.88,
            continuity_score: 0.92,
            alignment_depth: 0.87,
            resonance_level: 0.9,
        };
        let result = compute_neurofield(&inputs);
        assert!(result.is_ok());
        let (density, propagation, coherence) = result.unwrap();
        
        assert!(density >= 0.0 && density <= 1.0);
        assert!(propagation >= 0.0 && propagation <= 1.0);
        assert!(coherence >= 0.0 && coherence <= 1.0);
        assert!(density > 0.85);
        assert!(propagation > 0.85);
        assert!(coherence > 0.85);
    }
    fn test_compute_neurofield_low() {
            vitality_level: 0.2,
            energy_flow: 0.18,
            continuity_score: 0.22,
            alignment_depth: 0.17,
            resonance_level: 0.2,
        assert!(density < 0.3);
        assert!(propagation < 0.3);
        assert!(coherence < 0.3);
    fn test_compute_neurofield_balanced() {
            vitality_level: 0.5,
            energy_flow: 0.5,
            continuity_score: 0.5,
            alignment_depth: 0.5,
            resonance_level: 0.5,
        assert!(density >= 0.45 && density <= 0.55);
        assert!(propagation >= 0.45 && propagation <= 0.55);
        assert!(coherence >= 0.45 && coherence <= 0.55);
    fn test_neural_density_formula() {
            vitality_level: 1.0,
            energy_flow: 0.0,
            alignment_depth: 0.0,
            resonance_level: 0.0,
        let (density, _, _) = result.unwrap();
        // density = vitality*0.40 + continuity*0.30 + alignment*0.30
        // = 1.0*0.40 + 0.5*0.30 + 0.0*0.30 = 0.55
        assert!((density - 0.55).abs() < 0.01);
    fn test_signal_propagation_formula() {
            vitality_level: 0.0,
            energy_flow: 1.0,
        let (_, propagation, _) = result.unwrap();
        // propagation = energy*0.45 + resonance*0.35 + continuity*0.20
        // = 1.0*0.45 + 0.0*0.35 + 0.5*0.20 = 0.55
        assert!((propagation - 0.55).abs() < 0.01);
    fn test_field_coherence_formula() {
            continuity_score: 0.0,
            alignment_depth: 1.0,
        let (_, _, coherence) = result.unwrap();
        // coherence = alignment*0.40 + resonance*0.30 + vitality*0.30
        // = 1.0*0.40 + 0.0*0.30 + 0.5*0.30 = 0.55
        assert!((coherence - 0.55).abs() < 0.01);
    fn test_compute_neurofield_clamping() {
            continuity_score: 1.0,
            resonance_level: 1.0,
        assert_eq!(density, 1.0);
        assert_eq!(propagation, 1.0);
        assert_eq!(coherence, 1.0);
