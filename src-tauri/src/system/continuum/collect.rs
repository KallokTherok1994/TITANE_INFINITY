// TITANE∞ v8.0 - Continuum Engine
// Module de collecte des signaux de continuité

use crate::system::deepalignment::DeepAlignmentState;
use crate::system::deepsense::DeepSenseState;
use crate::system::resonance::ResonanceState;
use crate::system::stability::StabilityState;
/// Entrées pour le calcul de la continuité temporelle
#[derive(Debug, Clone)]
pub struct ContinuumInputs {
    pub alignment_depth: f32,
    pub clarity_signal: f32,
    pub resonance_level: f32,
    pub stability_score: f32,
    pub density_level: f32,
}
/// Collecte les signaux transversaux pour la continuité
pub fn collect_continuum_inputs(
    deepalignment: &DeepAlignmentState,
    deepsense: &DeepSenseState,
    resonance: &ResonanceState,
    stability: &StabilityState,
) -> Result<ContinuumInputs, String> {
    // Lecture depuis DeepAlignment
    let alignment_depth = deepalignment.alignment_depth.clamp(0.0, 1.0);
    // Lecture depuis DeepSense
    let clarity_signal = deepsense.clarity_signal.clamp(0.0, 1.0);
    let density_level = deepsense.density_level.clamp(0.0, 1.0);
    // Lecture depuis Resonance (ancien format)
    let resonance_level = resonance.coherence_score.clamp(0.0, 1.0);
    // Lecture depuis Stability
    let stability_score = stability.stability_score.clamp(0.0, 1.0);
    Ok(ContinuumInputs {
        alignment_depth,
        clarity_signal,
        resonance_level,
        stability_score,
        density_level,
    })
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_collect_continuum_inputs() {
        let deepalignment = DeepAlignmentState {
            initialized: true,
            alignment_depth: 0.8,
            direction_alignment: 0.7,
            core_alignment: 0.75,
            last_update: 1000,
        };
        let deepsense = DeepSenseState {
            depth_level: 0.7,
            density_level: 0.65,
            clarity_signal: 0.85,
        let resonance = ResonanceState {
            coherence_score: 0.75,
            tension_level: 0.2,
            flow_level: 0.8,
            signal_buffer: Vec::new(),
            start_time: 0,
        let stability = StabilityState {
            stability_score: 0.82,
            volatility_index: 0.18,
            recovery_capacity: 0.85,
        let result = collect_continuum_inputs(&deepalignment, &deepsense, &resonance, &stability);
        assert!(result.is_ok());
        let inputs = result.unwrap();
        assert_eq!(inputs.alignment_depth, 0.8);
        assert_eq!(inputs.clarity_signal, 0.85);
        assert_eq!(inputs.resonance_level, 0.75);
        assert_eq!(inputs.stability_score, 0.82);
        assert_eq!(inputs.density_level, 0.65);
    }
    fn test_collect_with_clamping() {
            alignment_depth: 1.5, // Au-dessus
            direction_alignment: 0.5,
            core_alignment: 0.5,
            depth_level: 0.5,
            density_level: -0.2, // En dessous
            clarity_signal: 0.5,
            coherence_score: 0.5,
            tension_level: 0.5,
            flow_level: 0.5,
            stability_score: 0.5,
            volatility_index: 0.5,
            recovery_capacity: 0.5,
        assert_eq!(inputs.alignment_depth, 1.0); // Clampé
        assert_eq!(inputs.density_level, 0.0); // Clampé
