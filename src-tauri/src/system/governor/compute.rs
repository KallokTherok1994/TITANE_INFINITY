// TITANE∞ v8.0 - Governor Engine
// Module de calcul de la régulation cognitive

use super::collect::GovernorInputs;
/// Calcule les trois métriques du Governor
/// Retourne: (regulation_level, deviation_index, homeostasis_score)
pub fn compute_governor(
    inputs: &GovernorInputs,
) -> Result<(f32, f32, f32), String> {
    // 1. regulation_level: niveau de régulation nécessaire
    // Plus le système est cohérent, moins il faut réguler
    let regulation_level = (
        (1.0 - inputs.global_coherence) * 0.40 +
        (1.0 - inputs.cortical_coherence) * 0.30 +
        (1.0 - inputs.field_coherence) * 0.30
    ).clamp(0.0, 1.0);
    // 2. deviation_index: mesure des dérives internes
    let deviation_index = (
        (1.0 - inputs.stability_score) * 0.35 +
        (1.0 - inputs.network_coherence) * 0.35 +
        (1.0 - inputs.alignment_depth) * 0.30
    // 3. homeostasis_score: capacité de stabilité naturelle
    let homeostasis_score = (
        inputs.global_coherence * 0.30 +
        inputs.stability_score * 0.30 +
        inputs.continuity_score * 0.20 +
        inputs.alignment_depth * 0.20
    Ok((regulation_level, deviation_index, homeostasis_score))
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_compute_governor_high_coherence() {
        let inputs = GovernorInputs {
            global_coherence: 0.9,
            reasoning_depth: 0.88,
            cortical_coherence: 0.92,
            network_coherence: 0.9,
            field_coherence: 0.91,
            continuity_score: 0.87,
            stability_score: 0.9,
            alignment_depth: 0.89,
        };
        let result = compute_governor(&inputs);
        assert!(result.is_ok());
        let (regulation, deviation, homeostasis) = result.unwrap();
        
        // High coherence → low regulation needed
        assert!(regulation < 0.2);
        // High stability → low deviation
        assert!(deviation < 0.2);
        // High coherence → high homeostasis
        assert!(homeostasis > 0.85);
    }
    fn test_compute_governor_low_coherence() {
            global_coherence: 0.2,
            reasoning_depth: 0.18,
            cortical_coherence: 0.19,
            network_coherence: 0.17,
            field_coherence: 0.18,
            continuity_score: 0.2,
            stability_score: 0.19,
            alignment_depth: 0.18,
        // Low coherence → high regulation needed
        assert!(regulation > 0.7);
        // Low stability → high deviation
        assert!(deviation > 0.7);
        // Low coherence → low homeostasis
        assert!(homeostasis < 0.3);
    fn test_regulation_level_formula() {
            global_coherence: 1.0,
            reasoning_depth: 0.0,
            cortical_coherence: 0.5,
            network_coherence: 0.0,
            field_coherence: 0.0,
            continuity_score: 0.0,
            stability_score: 0.0,
            alignment_depth: 0.0,
        let (regulation, _, _) = result.unwrap();
        // regulation = 1 - global*0.40 + 1 - cortical*0.30 + 1 - field*0.30
        // = 0.0*0.40 + 0.5*0.30 + 1.0*0.30 = 0.45
        assert!((regulation - 0.45).abs() < 0.01);
    fn test_deviation_index_formula() {
            global_coherence: 0.0,
            cortical_coherence: 0.0,
            network_coherence: 1.0,
            stability_score: 0.5,
        let (_, deviation, _) = result.unwrap();
        // deviation = 1 - stability*0.35 + 1 - network*0.35 + 1 - alignment*0.30
        // = 0.5*0.35 + 0.0*0.35 + 1.0*0.30 = 0.475
        assert!((deviation - 0.475).abs() < 0.01);
    fn test_homeostasis_score_formula() {
            continuity_score: 0.5,
        let (_, _, homeostasis) = result.unwrap();
        // homeostasis = global*0.30 + stability*0.30 + continuity*0.20 + alignment*0.20
        // = 1.0*0.30 + 0.0*0.30 + 0.5*0.20 + 0.0*0.20 = 0.40
        assert!((homeostasis - 0.40).abs() < 0.01);
    fn test_compute_governor_clamping() {
            reasoning_depth: 1.0,
            cortical_coherence: 1.0,
            field_coherence: 1.0,
            continuity_score: 1.0,
            stability_score: 1.0,
            alignment_depth: 1.0,
        assert_eq!(regulation, 0.0);
        assert_eq!(deviation, 0.0);
        assert_eq!(homeostasis, 1.0);
