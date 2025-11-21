// TITANE∞ v8.0 - NeuroMesh Engine
// Module de collecte des signaux du réseau neuronal

use crate::system::neurofield::NeuroFieldState;
use crate::system::vitalcore::VitalCoreState;
use crate::system::continuum::ContinuumState;
use crate::system::deepalignment::DeepAlignmentState;
/// Entrées pour le calcul du maillage neuronal
#[derive(Debug, Clone)]
pub struct NeuroMeshInputs {
    pub neural_density: f32,
    pub signal_propagation: f32,
    pub vitality_level: f32,
    pub continuity_score: f32,
    pub alignment_depth: f32,
}
/// Collecte les signaux neuronaux pour le mesh
pub fn collect_mesh_inputs(
    neurofield: &NeuroFieldState,
    vitalcore: &VitalCoreState,
    continuum: &ContinuumState,
    deepalignment: &DeepAlignmentState,
) -> Result<NeuroMeshInputs, String> {
    // Depuis NeuroField
    let neural_density = neurofield.neural_density.clamp(0.0, 1.0);
    let signal_propagation = neurofield.signal_propagation.clamp(0.0, 1.0);
    // Depuis VitalCore
    let vitality_level = vitalcore.vitality_level.clamp(0.0, 1.0);
    // Depuis Continuum: utiliser progression
    let continuity_score = continuum.progression.clamp(0.0, 1.0);
    // Depuis DeepAlignment
    let alignment_depth = deepalignment.alignment_depth.clamp(0.0, 1.0);
    Ok(NeuroMeshInputs {
        neural_density,
        signal_propagation,
        vitality_level,
        continuity_score,
        alignment_depth,
    })
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_collect_mesh_inputs() {
        let neurofield = NeuroFieldState {
            initialized: true,
            neural_density: 0.8,
            signal_propagation: 0.75,
            field_coherence: 0.85,
            last_update: 1000,
        };
        let vitalcore = VitalCoreState {
            vitality_level: 0.82,
            energy_flow: 0.75,
            resilience_index: 0.7,
        let continuum = ContinuumState {
            momentum: 0.7,
            direction: 0.8,
            progression: 0.85,
            stability_trend: 0.75,
        let deepalignment = DeepAlignmentState {
            alignment_depth: 0.78,
            direction_alignment: 0.7,
            core_alignment: 0.75,
        let result = collect_mesh_inputs(&neurofield, &vitalcore, &continuum, &deepalignment);
        assert!(result.is_ok());
        let inputs = result.unwrap();
        assert_eq!(inputs.neural_density, 0.8);
        assert_eq!(inputs.signal_propagation, 0.75);
        assert_eq!(inputs.vitality_level, 0.82);
        assert_eq!(inputs.continuity_score, 0.85);
        assert_eq!(inputs.alignment_depth, 0.78);
    }
    fn test_collect_with_clamping() {
            neural_density: 1.5, // Au-dessus
            signal_propagation: -0.2, // En dessous
            field_coherence: 0.5,
            vitality_level: 0.5,
            energy_flow: 0.5,
            resilience_index: 0.5,
            momentum: 0.5,
            direction: 0.5,
            progression: 0.5,
            stability_trend: 0.5,
            alignment_depth: 0.5,
            direction_alignment: 0.5,
            core_alignment: 0.5,
        assert_eq!(inputs.neural_density, 1.0); // Clampé
        assert_eq!(inputs.signal_propagation, 0.0); // Clampé
