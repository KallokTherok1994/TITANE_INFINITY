// TITANE∞ v8.0 - MetaCortex Engine
// Module de collecte pour le cortex supérieur

use crate::system::coremesh::CoreMeshState;
use crate::system::neuromesh::NeuroMeshState;
use crate::system::neurofield::NeuroFieldState;
use crate::system::continuum::ContinuumState;
use crate::system::deepalignment::DeepAlignmentState;
use crate::system::resonance::ResonanceState;
/// Entrées pour le calcul du MetaCortex
#[derive(Debug, Clone)]
pub struct MetaCortexInputs {
    pub core_density: f32,
    pub integration_depth: f32,
    pub cortical_coherence: f32,
    pub mesh_density: f32,
    pub network_coherence: f32,
    pub neural_density: f32,
    pub field_coherence: f32,
    pub continuity_score: f32,
    pub alignment_depth: f32,
    pub resonance_level: f32,
}
/// Collecte les signaux du cerveau complet
pub fn collect_metacortex_inputs(
    coremesh: &CoreMeshState,
    neuromesh: &NeuroMeshState,
    neurofield: &NeuroFieldState,
    continuum: &ContinuumState,
    deepalignment: &DeepAlignmentState,
    resonance: &ResonanceState,
) -> Result<MetaCortexInputs, String> {
    // Depuis CoreMesh
    let core_density = coremesh.core_density.clamp(0.0, 1.0);
    let integration_depth = coremesh.integration_depth.clamp(0.0, 1.0);
    let cortical_coherence = coremesh.cortical_coherence.clamp(0.0, 1.0);
    // Depuis NeuroMesh
    let mesh_density = neuromesh.mesh_density.clamp(0.0, 1.0);
    let network_coherence = neuromesh.network_coherence.clamp(0.0, 1.0);
    // Depuis NeuroField
    let neural_density = neurofield.neural_density.clamp(0.0, 1.0);
    let field_coherence = neurofield.field_coherence.clamp(0.0, 1.0);
    // Depuis Continuum
    let continuity_score = continuum.progression.clamp(0.0, 1.0);
    // Depuis DeepAlignment
    let alignment_depth = deepalignment.alignment_depth.clamp(0.0, 1.0);
    // Depuis Resonance
    let resonance_level = resonance.resonance_level.clamp(0.0, 1.0);
    Ok(MetaCortexInputs {
        core_density,
        integration_depth,
        cortical_coherence,
        mesh_density,
        network_coherence,
        neural_density,
        field_coherence,
        continuity_score,
        alignment_depth,
        resonance_level,
    })
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_collect_metacortex_inputs() {
        let coremesh = CoreMeshState {
            initialized: true,
            core_density: 0.85,
            integration_depth: 0.82,
            cortical_coherence: 0.88,
            last_update: 1000,
        };
        let neuromesh = NeuroMeshState {
            mesh_density: 0.8,
            synaptic_flow: 0.75,
            network_coherence: 0.83,
        let neurofield = NeuroFieldState {
            neural_density: 0.78,
            signal_propagation: 0.8,
            field_coherence: 0.85,
        let continuum = ContinuumState {
            momentum: 0.7,
            direction: 0.8,
            progression: 0.87,
            stability_trend: 0.75,
        let deepalignment = DeepAlignmentState {
            alignment_depth: 0.8,
            direction_alignment: 0.75,
            core_alignment: 0.78,
        let resonance = ResonanceState {
            resonance_level: 0.82,
            harmonic_index: 0.75,
        let result = collect_metacortex_inputs(
            &coremesh,
            &neuromesh,
            &neurofield,
            &continuum,
            &deepalignment,
            &resonance,
        );
        assert!(result.is_ok());
        let inputs = result.unwrap();
        assert_eq!(inputs.core_density, 0.85);
        assert_eq!(inputs.cortical_coherence, 0.88);
        assert_eq!(inputs.resonance_level, 0.82);
    }
    fn test_collect_with_clamping() {
            core_density: 1.5,
            integration_depth: -0.2,
            cortical_coherence: 0.5,
            mesh_density: 0.5,
            synaptic_flow: 0.5,
            network_coherence: 0.5,
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
            resonance_level: 0.5,
            harmonic_index: 0.5,
        assert_eq!(inputs.core_density, 1.0);
        assert_eq!(inputs.integration_depth, 0.0);
