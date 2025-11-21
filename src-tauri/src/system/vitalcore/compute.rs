// TITANE∞ v8.0 - VitalCore Engine
// Module de calcul de la vitalité interne

use super::collect::VitalCoreInputs;
/// Calcule les trois métriques vitales
/// Retourne: (vitality_level, energy_flow, resilience_index)
pub fn compute_vitalcore(
    inputs: &VitalCoreInputs,
) -> Result<(f32, f32, f32), String> {
    // 1. vitality_level: énergie vitale globale du système
    // Stabilité + résonance + sync + alignement
    let vitality_level = (
        inputs.stability_score * 0.35 +
        inputs.resonance_level * 0.25 +
        inputs.sync_quality * 0.20 +
        inputs.alignment_depth * 0.20
    ).clamp(0.0, 1.0);
    // 2. energy_flow: mouvement interne de l'énergie
    // Sync + résonance + continuité
    let energy_flow = (
        inputs.sync_quality * 0.40 +
        inputs.resonance_level * 0.30 +
        inputs.continuity_score * 0.30
    // 3. resilience_index: capacité à absorber et récupérer
    // Stabilité + continuité + alignement
    let resilience_index = (
        inputs.stability_score * 0.40 +
        inputs.continuity_score * 0.30 +
        inputs.alignment_depth * 0.30
    Ok((vitality_level, energy_flow, resilience_index))
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_compute_vitalcore_optimal() {
        let inputs = VitalCoreInputs {
            continuity_score: 0.9,
            alignment_depth: 0.88,
            resonance_level: 0.92,
            sync_quality: 0.87,
            stability_score: 0.9,
        };
        let result = compute_vitalcore(&inputs);
        assert!(result.is_ok());
        let (vitality, energy, resilience) = result.unwrap();
        
        assert!(vitality >= 0.0 && vitality <= 1.0);
        assert!(energy >= 0.0 && energy <= 1.0);
        assert!(resilience >= 0.0 && resilience <= 1.0);
        // Valeurs élevées en entrée → valeurs élevées en sortie
        assert!(vitality > 0.85);
        assert!(energy > 0.85);
        assert!(resilience > 0.85);
    }
    fn test_compute_vitalcore_low() {
            continuity_score: 0.2,
            alignment_depth: 0.18,
            resonance_level: 0.22,
            sync_quality: 0.17,
            stability_score: 0.2,
        assert!(vitality < 0.3);
        assert!(energy < 0.3);
        assert!(resilience < 0.3);
    fn test_compute_vitalcore_balanced() {
            continuity_score: 0.5,
            alignment_depth: 0.5,
            resonance_level: 0.5,
            sync_quality: 0.5,
            stability_score: 0.5,
        assert!(vitality >= 0.45 && vitality <= 0.55);
        assert!(energy >= 0.45 && energy <= 0.55);
        assert!(resilience >= 0.45 && resilience <= 0.55);
    fn test_vitality_formula() {
            continuity_score: 0.0,
            resonance_level: 0.0,
            sync_quality: 0.0,
            stability_score: 1.0,
        let (vitality, _, _) = result.unwrap();
        // vitality = stability*0.35 + resonance*0.25 + sync*0.20 + alignment*0.20
        // = 1.0*0.35 + 0*0.25 + 0*0.20 + 0.5*0.20 = 0.45
        assert!((vitality - 0.45).abs() < 0.01);
    fn test_energy_flow_formula() {
            alignment_depth: 0.0,
            sync_quality: 1.0,
            stability_score: 0.0,
        let (_, energy, _) = result.unwrap();
        // energy = sync*0.40 + resonance*0.30 + continuity*0.30
        // = 1.0*0.40 + 0*0.30 + 0.5*0.30 = 0.55
        assert!((energy - 0.55).abs() < 0.01);
    fn test_resilience_formula() {
        let (_, _, resilience) = result.unwrap();
        // resilience = stability*0.40 + continuity*0.30 + alignment*0.30
        // = 1.0*0.40 + 0.5*0.30 + 0.5*0.30 = 0.70
        assert!((resilience - 0.70).abs() < 0.01);
    fn test_compute_vitalcore_clamping() {
            continuity_score: 1.0,
            alignment_depth: 1.0,
            resonance_level: 1.0,
        assert_eq!(vitality, 1.0);
        assert_eq!(energy, 1.0);
        assert_eq!(resilience, 1.0);
