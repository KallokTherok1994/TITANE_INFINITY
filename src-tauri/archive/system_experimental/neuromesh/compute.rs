// TITANE∞ v8.0 - NeuroMesh Engine
// Module de calcul du réseau neuronal complet

use super::collect::NeuroMeshInputs;
/// Calcule les trois métriques du maillage neuronal
/// Retourne: (mesh_density, synaptic_flow, network_coherence)
pub fn compute_mesh(
    inputs: &NeuroMeshInputs,
) -> Result<(f32, f32, f32), String> {
    // 1. mesh_density: structuration interne du réseau
    // Densité neuronale + continuité + vitalité
    let mesh_density = (
        inputs.neural_density * 0.45 +
        inputs.continuity_score * 0.30 +
        inputs.vitality_level * 0.25
    ).clamp(0.0, 1.0);
    // 2. synaptic_flow: circulation synaptique interne
    // Propagation + vitalité + alignement
    let synaptic_flow = (
        inputs.signal_propagation * 0.50 +
        inputs.vitality_level * 0.30 +
        inputs.alignment_depth * 0.20
    // 3. network_coherence: cohésion globale du réseau neuronal
    // Alignement + densité neuronale + continuité
    let network_coherence = (
        inputs.alignment_depth * 0.40 +
        inputs.neural_density * 0.30 +
        inputs.continuity_score * 0.30
    Ok((mesh_density, synaptic_flow, network_coherence))
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_compute_mesh_optimal() {
        let inputs = NeuroMeshInputs {
            neural_density: 0.9,
            signal_propagation: 0.88,
            vitality_level: 0.92,
            continuity_score: 0.87,
            alignment_depth: 0.9,
        };
        let result = compute_mesh(&inputs);
        assert!(result.is_ok());
        let (mesh_density, synaptic_flow, network_coherence) = result.unwrap();
        
        assert!(mesh_density >= 0.0 && mesh_density <= 1.0);
        assert!(synaptic_flow >= 0.0 && synaptic_flow <= 1.0);
        assert!(network_coherence >= 0.0 && network_coherence <= 1.0);
        assert!(mesh_density > 0.85);
        assert!(synaptic_flow > 0.85);
        assert!(network_coherence > 0.85);
    }
    fn test_compute_mesh_low() {
            neural_density: 0.2,
            signal_propagation: 0.18,
            vitality_level: 0.22,
            continuity_score: 0.17,
            alignment_depth: 0.2,
        assert!(mesh_density < 0.3);
        assert!(synaptic_flow < 0.3);
        assert!(network_coherence < 0.3);
    fn test_compute_mesh_balanced() {
            neural_density: 0.5,
            signal_propagation: 0.5,
            vitality_level: 0.5,
            continuity_score: 0.5,
            alignment_depth: 0.5,
        assert!(mesh_density >= 0.45 && mesh_density <= 0.55);
        assert!(synaptic_flow >= 0.45 && synaptic_flow <= 0.55);
        assert!(network_coherence >= 0.45 && network_coherence <= 0.55);
    fn test_mesh_density_formula() {
            neural_density: 1.0,
            signal_propagation: 0.0,
            continuity_score: 0.0,
            alignment_depth: 0.0,
        let (mesh_density, _, _) = result.unwrap();
        // mesh_density = neural*0.45 + continuity*0.30 + vitality*0.25
        // = 1.0*0.45 + 0.0*0.30 + 0.5*0.25 = 0.575
        assert!((mesh_density - 0.575).abs() < 0.01);
    fn test_synaptic_flow_formula() {
            neural_density: 0.0,
            signal_propagation: 1.0,
        let (_, synaptic_flow, _) = result.unwrap();
        // synaptic_flow = propagation*0.50 + vitality*0.30 + alignment*0.20
        // = 1.0*0.50 + 0.5*0.30 + 0.0*0.20 = 0.65
        assert!((synaptic_flow - 0.65).abs() < 0.01);
    fn test_network_coherence_formula() {
            vitality_level: 0.0,
            alignment_depth: 1.0,
        let (_, _, network_coherence) = result.unwrap();
        // network_coherence = alignment*0.40 + neural*0.30 + continuity*0.30
        // = 1.0*0.40 + 0.5*0.30 + 0.0*0.30 = 0.55
        assert!((network_coherence - 0.55).abs() < 0.01);
    fn test_compute_mesh_clamping() {
            vitality_level: 1.0,
            continuity_score: 1.0,
        assert_eq!(mesh_density, 1.0);
        assert_eq!(synaptic_flow, 1.0);
        assert_eq!(network_coherence, 1.0);
