// TITANE∞ v8.0 - CoreMesh Engine
// Module de collecte pour la structure profonde du cortex

use crate::system::neuromesh::NeuroMeshState;
use crate::system::neurofield::NeuroFieldState;
use crate::system::continuum::ContinuumState;
use crate::system::deepalignment::DeepAlignmentState;
/// Entrées pour le calcul du cortex central
#[derive(Debug, Clone)]
pub struct CoreMeshInputs {
    pub mesh_density: f32,
    pub neural_density: f32,
    pub network_coherence: f32,
    pub continuity_score: f32,
    pub alignment_depth: f32,
}
/// Collecte les signaux pour le CoreMesh
pub fn collect_coremesh_inputs(
    neuromesh: &NeuroMeshState,
    neurofield: &NeuroFieldState,
    continuum: &ContinuumState,
    deepalignment: &DeepAlignmentState,
) -> Result<CoreMeshInputs, String> {
    // Depuis NeuroMesh
    let mesh_density = neuromesh.mesh_density.clamp(0.0, 1.0);
    let network_coherence = neuromesh.network_coherence.clamp(0.0, 1.0);
    // Depuis NeuroField
    let neural_density = neurofield.neural_density.clamp(0.0, 1.0);
    // Depuis Continuum: utiliser progression
    let continuity_score = continuum.progression.clamp(0.0, 1.0);
    // Depuis DeepAlignment
    let alignment_depth = deepalignment.alignment_depth.clamp(0.0, 1.0);
    Ok(CoreMeshInputs {
        mesh_density,
        neural_density,
        network_coherence,
        continuity_score,
        alignment_depth,
    })
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_collect_coremesh_inputs() {
        let neuromesh = NeuroMeshState {
            initialized: true,
            mesh_density: 0.85,
            synaptic_flow: 0.8,
            network_coherence: 0.88,
            last_update: 1000,
        };
        let neurofield = NeuroFieldState {
            neural_density: 0.82,
            signal_propagation: 0.75,
            field_coherence: 0.85,
        let continuum = ContinuumState {
            momentum: 0.7,
            direction: 0.8,
            progression: 0.87,
            stability_trend: 0.75,
        let deepalignment = DeepAlignmentState {
            alignment_depth: 0.8,
            direction_alignment: 0.7,
            core_alignment: 0.75,
        let result = collect_coremesh_inputs(&neuromesh, &neurofield, &continuum, &deepalignment);
        assert!(result.is_ok());
        let inputs = result.unwrap();
        assert_eq!(inputs.mesh_density, 0.85);
        assert_eq!(inputs.neural_density, 0.82);
        assert_eq!(inputs.network_coherence, 0.88);
        assert_eq!(inputs.continuity_score, 0.87);
        assert_eq!(inputs.alignment_depth, 0.8);
    }
    fn test_collect_with_clamping() {
            mesh_density: 1.5, // Au-dessus
            network_coherence: -0.2, // En dessous
            neural_density: 0.5,
            signal_propagation: 0.5,
            field_coherence: 0.5,
            momentum: 0.5,
            direction: 0.5,
            progression: 0.5,
            stability_trend: 0.5,
            alignment_depth: 0.5,
            direction_alignment: 0.5,
            core_alignment: 0.5,
        assert_eq!(inputs.mesh_density, 1.0); // Clampé
        assert_eq!(inputs.network_coherence, 0.0); // Clampé
