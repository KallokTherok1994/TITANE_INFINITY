// TITANE∞ v8.0 - NeuroField Engine
// Module de collecte des signaux neuronaux

use crate::system::vitalcore::VitalCoreState;
use crate::system::continuum::ContinuumState;
use crate::system::deepalignment::DeepAlignmentState;
use crate::system::resonance::ResonanceState;
/// Entrées pour le calcul du champ neuronal
#[derive(Debug, Clone)]
pub struct NeuroFieldInputs {
    pub vitality_level: f32,
    pub energy_flow: f32,
    pub continuity_score: f32,
    pub alignment_depth: f32,
    pub resonance_level: f32,
}
/// Collecte les signaux pré-synaptiques
pub fn collect_neuro_inputs(
    vitalcore: &VitalCoreState,
    continuum: &ContinuumState,
    deepalignment: &DeepAlignmentState,
    resonance: &ResonanceState,
) -> Result<NeuroFieldInputs, String> {
    // Depuis VitalCore
    let vitality_level = vitalcore.vitality_level.clamp(0.0, 1.0);
    let energy_flow = vitalcore.energy_flow.clamp(0.0, 1.0);
    // Depuis Continuum: utiliser progression
    let continuity_score = continuum.progression.clamp(0.0, 1.0);
    // Depuis DeepAlignment
    let alignment_depth = deepalignment.alignment_depth.clamp(0.0, 1.0);
    // Depuis Resonance (ancien format)
    let resonance_level = resonance.coherence_score.clamp(0.0, 1.0);
    Ok(NeuroFieldInputs {
        vitality_level,
        energy_flow,
        continuity_score,
        alignment_depth,
        resonance_level,
    })
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_collect_neuro_inputs() {
        let vitalcore = VitalCoreState {
            initialized: true,
            vitality_level: 0.8,
            energy_flow: 0.75,
            resilience_index: 0.7,
            last_update: 1000,
        };
        let continuum = ContinuumState {
            momentum: 0.7,
            direction: 0.8,
            progression: 0.82,
            stability_trend: 0.75,
        let deepalignment = DeepAlignmentState {
            alignment_depth: 0.8,
            direction_alignment: 0.7,
            core_alignment: 0.75,
        let resonance = ResonanceState {
            coherence_score: 0.75,
            tension_level: 0.2,
            flow_level: 0.8,
            signal_buffer: Vec::new(),
            start_time: 0,
        let result = collect_neuro_inputs(&vitalcore, &continuum, &deepalignment, &resonance);
        assert!(result.is_ok());
        let inputs = result.unwrap();
        assert_eq!(inputs.vitality_level, 0.8);
        assert_eq!(inputs.energy_flow, 0.75);
        assert_eq!(inputs.continuity_score, 0.82);
        assert_eq!(inputs.alignment_depth, 0.8);
        assert_eq!(inputs.resonance_level, 0.75);
    }
    fn test_collect_with_clamping() {
            vitality_level: 1.5, // Au-dessus
            energy_flow: -0.2, // En dessous
            resilience_index: 0.5,
            momentum: 0.5,
            direction: 0.5,
            progression: 0.5,
            stability_trend: 0.5,
            alignment_depth: 0.5,
            direction_alignment: 0.5,
            core_alignment: 0.5,
            coherence_score: 0.5,
            tension_level: 0.5,
            flow_level: 0.5,
        assert_eq!(inputs.vitality_level, 1.0); // Clampé
        assert_eq!(inputs.energy_flow, 0.0); // Clampé
