// TITANE∞ v8.0 - DeepAlignment Engine
// Module de calcul de l'alignement profond

use super::collect::DeepAlignmentInputs;
/// Calcule les trois métriques d'alignement profond
/// Retourne: (alignment_depth, direction_alignment, core_alignment)
pub fn compute_alignment(
    inputs: &DeepAlignmentInputs,
) -> Result<(f32, f32, f32), String> {
    // 1. alignment_depth: profondeur d'alignement du système
    // Combine profondeur perceptive + clarté + résonance
    let alignment_depth = (
        inputs.depth_level * 0.40 +
        inputs.clarity_signal * 0.30 +
        inputs.resonance_level * 0.30
    ).clamp(0.0, 1.0);
    // 2. direction_alignment: cohérence de l'orientation interne
    // Combine direction + qualité sync + harmonique
    let direction_alignment = (
        inputs.direction_factor * 0.50 +
        inputs.sync_quality * 0.30 +
        inputs.harmonic_level * 0.20
    // 3. core_alignment: intégration profonde du noyau cognitif
    // Combine densité + cohérence résonante + clarté
    let core_alignment = (
        inputs.density_level * 0.35 +
        inputs.coherence_resonance * 0.35 +
        inputs.clarity_signal * 0.30
    Ok((alignment_depth, direction_alignment, core_alignment))
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_compute_alignment_optimal() {
        let inputs = DeepAlignmentInputs {
            depth_level: 0.9,
            density_level: 0.85,
            clarity_signal: 0.95,
            resonance_level: 0.88,
            coherence_resonance: 0.92,
            harmonic_level: 0.87,
            direction_factor: 0.9,
            sync_quality: 0.86,
        };
        let result = compute_alignment(&inputs);
        assert!(result.is_ok());
        let (alignment_depth, direction_alignment, core_alignment) = result.unwrap();
        
        // Vérifier que toutes les valeurs sont dans [0, 1]
        assert!(alignment_depth >= 0.0 && alignment_depth <= 1.0);
        assert!(direction_alignment >= 0.0 && direction_alignment <= 1.0);
        assert!(core_alignment >= 0.0 && core_alignment <= 1.0);
        // Avec des entrées élevées, les sorties doivent être élevées
        assert!(alignment_depth > 0.85);
        assert!(direction_alignment > 0.85);
        assert!(core_alignment > 0.85);
    }
    fn test_compute_alignment_low() {
            depth_level: 0.2,
            density_level: 0.15,
            clarity_signal: 0.25,
            resonance_level: 0.18,
            coherence_resonance: 0.22,
            harmonic_level: 0.17,
            direction_factor: 0.2,
            sync_quality: 0.16,
        // Avec des entrées faibles, les sorties doivent être faibles
        assert!(alignment_depth < 0.3);
        assert!(direction_alignment < 0.3);
        assert!(core_alignment < 0.3);
    fn test_compute_alignment_balanced() {
            depth_level: 0.5,
            density_level: 0.5,
            clarity_signal: 0.5,
            resonance_level: 0.5,
            coherence_resonance: 0.5,
            harmonic_level: 0.5,
            direction_factor: 0.5,
            sync_quality: 0.5,
        // Avec des entrées moyennes, les sorties doivent être moyennes
        assert!(alignment_depth >= 0.45 && alignment_depth <= 0.55);
        assert!(direction_alignment >= 0.45 && direction_alignment <= 0.55);
        assert!(core_alignment >= 0.45 && core_alignment <= 0.55);
    fn test_compute_alignment_depth_formula() {
            depth_level: 1.0,
            density_level: 0.0,
            resonance_level: 0.0,
            coherence_resonance: 0.0,
            harmonic_level: 0.0,
            direction_factor: 0.0,
            sync_quality: 0.0,
        let (alignment_depth, _, _) = result.unwrap();
        // alignment_depth = depth*0.4 + clarity*0.3 + resonance*0.3
        // = 1.0*0.4 + 0.5*0.3 + 0.0*0.3 = 0.55
        assert!((alignment_depth - 0.55).abs() < 0.01);
    fn test_compute_alignment_direction_formula() {
            depth_level: 0.0,
            clarity_signal: 0.0,
            direction_factor: 1.0,
        let (_, direction_alignment, _) = result.unwrap();
        // direction_alignment = direction*0.5 + sync*0.3 + harmonic*0.2
        // = 1.0*0.5 + 0.0*0.3 + 0.5*0.2 = 0.6
        assert!((direction_alignment - 0.6).abs() < 0.01);
    fn test_compute_alignment_core_formula() {
            density_level: 1.0,
        let (_, _, core_alignment) = result.unwrap();
        // core_alignment = density*0.35 + coherence*0.35 + clarity*0.3
        // = 1.0*0.35 + 0.5*0.35 + 0.0*0.3 = 0.525
        assert!((core_alignment - 0.525).abs() < 0.01);
    fn test_compute_alignment_clamping() {
        // Test avec des valeurs qui pourraient théoriquement dépasser 1.0
            clarity_signal: 1.0,
            resonance_level: 1.0,
            coherence_resonance: 1.0,
            harmonic_level: 1.0,
            sync_quality: 1.0,
        // Toutes les valeurs doivent être clampées à 1.0
        assert_eq!(alignment_depth, 1.0);
        assert_eq!(direction_alignment, 1.0);
        assert_eq!(core_alignment, 1.0);
