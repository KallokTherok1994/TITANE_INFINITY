// TITANE∞ v8.0 - Governor Engine
// Module de collecte pour la régulation cognitive

use crate::system::metacortex::MetaCortexState;
use crate::system::coremesh::CoreMeshState;
use crate::system::neuromesh::NeuroMeshState;
use crate::system::neurofield::NeuroFieldState;
use crate::system::continuum::ContinuumState;
use crate::system::stability::StabilityState;
use crate::system::deepalignment::DeepAlignmentState;
/// Entrées pour le calcul de la régulation
#[derive(Debug, Clone)]
pub struct GovernorInputs {
    pub global_coherence: f32,
    pub reasoning_depth: f32,
    pub cortical_coherence: f32,
    pub network_coherence: f32,
    pub field_coherence: f32,
    pub continuity_score: f32,
    pub stability_score: f32,
    pub alignment_depth: f32,
}
/// Collecte les signaux pour la régulation
pub fn collect_governor_inputs(
    metacortex: &MetaCortexState,
    coremesh: &CoreMeshState,
    neuromesh: &NeuroMeshState,
    neurofield: &NeuroFieldState,
    continuum: &ContinuumState,
    stability: &StabilityState,
    deepalignment: &DeepAlignmentState,
) -> Result<GovernorInputs, String> {
    Ok(GovernorInputs {
        global_coherence: metacortex.global_coherence.clamp(0.0, 1.0),
        reasoning_depth: metacortex.reasoning_depth.clamp(0.0, 1.0),
        cortical_coherence: coremesh.cortical_coherence.clamp(0.0, 1.0),
        network_coherence: neuromesh.network_coherence.clamp(0.0, 1.0),
        field_coherence: neurofield.field_coherence.clamp(0.0, 1.0),
        continuity_score: continuum.progression.clamp(0.0, 1.0),
        stability_score: stability.stability_score.clamp(0.0, 1.0),
        alignment_depth: deepalignment.alignment_depth.clamp(0.0, 1.0),
    })
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_collect_governor_inputs() {
        let metacortex = MetaCortexState {
            initialized: true,
            metacortex_clarity: 0.85,
            reasoning_depth: 0.82,
            global_coherence: 0.88,
            last_update: 1000,
        };
        let coremesh = CoreMeshState {
            core_density: 0.8,
            integration_depth: 0.75,
            cortical_coherence: 0.83,
        let neuromesh = NeuroMeshState {
            mesh_density: 0.78,
            synaptic_flow: 0.8,
            network_coherence: 0.85,
        let neurofield = NeuroFieldState {
            neural_density: 0.8,
            signal_propagation: 0.75,
            field_coherence: 0.82,
        let continuum = ContinuumState {
            momentum: 0.7,
            direction: 0.8,
            progression: 0.87,
            stability_trend: 0.75,
        let stability = StabilityState {
            stability_score: 0.8,
            trend: 0.0,
            variance: 0.1,
        let deepalignment = DeepAlignmentState {
            alignment_depth: 0.8,
            direction_alignment: 0.75,
            core_alignment: 0.78,
        let result = collect_governor_inputs(
            &metacortex,
            &coremesh,
            &neuromesh,
            &neurofield,
            &continuum,
            &stability,
            &deepalignment,
        );
        assert!(result.is_ok());
        let inputs = result.unwrap();
        assert_eq!(inputs.global_coherence, 0.88);
        assert_eq!(inputs.stability_score, 0.8);
    }
