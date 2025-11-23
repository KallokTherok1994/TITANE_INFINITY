// TITANE∞ v8.0 - CoreMesh Engine
// Module de calcul de la structure profonde du cortex

use super::collect::CoreMeshInputs;
/// Calcule les trois métriques du cortex central
/// Retourne: (core_density, integration_depth, cortical_coherence)
pub fn compute_coremesh(
    inputs: &CoreMeshInputs,
) -> Result<(f32, f32, f32), String> {
    // 1. core_density: densité structurelle du noyau cortical
    // Densité du mesh + densité neuronale + continuité
    let core_density = (
        inputs.mesh_density * 0.45 +
        inputs.neural_density * 0.35 +
        inputs.continuity_score * 0.20
    ).clamp(0.0, 1.0);
    // 2. integration_depth: profondeur d'intégration du réseau → cortex interne
    // Cohérence réseau + alignement + continuité
    let integration_depth = (
        inputs.network_coherence * 0.40 +
        inputs.alignment_depth * 0.40 +
    // 3. cortical_coherence: cohérence du cortex → stabilité directionnelle
    // Alignement + densité mesh + cohérence réseau
    let cortical_coherence = (
        inputs.alignment_depth * 0.45 +
        inputs.mesh_density * 0.30 +
        inputs.network_coherence * 0.25
    Ok((core_density, integration_depth, cortical_coherence))
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_compute_coremesh_optimal() {
        let inputs = CoreMeshInputs {
            mesh_density: 0.92,
            neural_density: 0.9,
            network_coherence: 0.91,
            continuity_score: 0.88,
            alignment_depth: 0.93,
        };
        let result = compute_coremesh(&inputs);
        assert!(result.is_ok());
        let (core_density, integration_depth, cortical_coherence) = result.unwrap();
        
        assert!(core_density >= 0.0 && core_density <= 1.0);
        assert!(integration_depth >= 0.0 && integration_depth <= 1.0);
        assert!(cortical_coherence >= 0.0 && cortical_coherence <= 1.0);
        assert!(core_density > 0.88);
        assert!(integration_depth > 0.88);
        assert!(cortical_coherence > 0.88);
    }
    fn test_compute_coremesh_low() {
            mesh_density: 0.18,
            neural_density: 0.2,
            network_coherence: 0.17,
            continuity_score: 0.22,
            alignment_depth: 0.19,
        assert!(core_density < 0.3);
        assert!(integration_depth < 0.3);
        assert!(cortical_coherence < 0.3);
    fn test_compute_coremesh_balanced() {
            mesh_density: 0.5,
            neural_density: 0.5,
            network_coherence: 0.5,
            continuity_score: 0.5,
            alignment_depth: 0.5,
        assert!(core_density >= 0.45 && core_density <= 0.55);
        assert!(integration_depth >= 0.45 && integration_depth <= 0.55);
        assert!(cortical_coherence >= 0.45 && cortical_coherence <= 0.55);
    fn test_core_density_formula() {
            mesh_density: 1.0,
            network_coherence: 0.0,
            continuity_score: 0.0,
            alignment_depth: 0.0,
        let (core_density, _, _) = result.unwrap();
        // core_density = mesh*0.45 + neural*0.35 + continuity*0.20
        // = 1.0*0.45 + 0.5*0.35 + 0.0*0.20 = 0.625
        assert!((core_density - 0.625).abs() < 0.01);
    fn test_integration_depth_formula() {
            mesh_density: 0.0,
            neural_density: 0.0,
            network_coherence: 1.0,
        let (_, integration_depth, _) = result.unwrap();
        // integration_depth = coherence*0.40 + alignment*0.40 + continuity*0.20
        // = 1.0*0.40 + 0.0*0.40 + 0.5*0.20 = 0.50
        assert!((integration_depth - 0.50).abs() < 0.01);
    fn test_cortical_coherence_formula() {
            alignment_depth: 1.0,
        let (_, _, cortical_coherence) = result.unwrap();
        // cortical_coherence = alignment*0.45 + mesh*0.30 + coherence*0.25
        // = 1.0*0.45 + 0.5*0.30 + 0.0*0.25 = 0.60
        assert!((cortical_coherence - 0.60).abs() < 0.01);
    fn test_compute_coremesh_clamping() {
            neural_density: 1.0,
            continuity_score: 1.0,
        assert_eq!(core_density, 1.0);
        assert_eq!(integration_depth, 1.0);
        assert_eq!(cortical_coherence, 1.0);
