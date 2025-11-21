// TITANE∞ v8.0 - DeepAlignment Engine
// Module de collecte des signaux d'alignement profond

use crate::system::deepsense::DeepSenseState;
use crate::system::resonance::ResonanceState;
use crate::system::harmonic::HarmonicState;
use crate::system::flowsync::FlowSyncState;
/// Entrées pour le calcul de l'alignement profond
#[derive(Debug, Clone)]
pub struct DeepAlignmentInputs {
    pub depth_level: f32,
    pub density_level: f32,
    pub clarity_signal: f32,
    pub resonance_level: f32,
    pub coherence_resonance: f32,
    pub harmonic_level: f32,
    pub direction_factor: f32,
    pub sync_quality: f32,
}
/// Collecte les signaux depuis DeepSense, Resonance, Harmonic, FlowSync
pub fn collect_alignment_inputs(
    deepsense: &DeepSenseState,
    resonance: &ResonanceState,
    harmonic: &HarmonicState,
    flowsync: &FlowSyncState,
) -> Result<DeepAlignmentInputs, String> {
    // Lecture directe depuis DeepSense
    let depth_level = deepsense.depth_level.clamp(0.0, 1.0);
    let density_level = deepsense.density_level.clamp(0.0, 1.0);
    let clarity_signal = deepsense.clarity_signal.clamp(0.0, 1.0);
    // Lecture depuis Resonance (ancien format v8.0)
    let resonance_level = resonance.coherence_score.clamp(0.0, 1.0);
    let coherence_resonance = (1.0 - resonance.tension_level).clamp(0.0, 1.0);
    // Lecture depuis Harmonic
    let harmonic_level = harmonic.harmonic_level.clamp(0.0, 1.0);
    // Lecture depuis FlowSync
    let direction_factor = flowsync.direction_factor.clamp(0.0, 1.0);
    let sync_quality = flowsync.sync_quality.clamp(0.0, 1.0);
    Ok(DeepAlignmentInputs {
        depth_level,
        density_level,
        clarity_signal,
        resonance_level,
        coherence_resonance,
        harmonic_level,
        direction_factor,
        sync_quality,
    })
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_collect_alignment_inputs() {
        let deepsense = DeepSenseState {
            initialized: true,
            depth_level: 0.8,
            density_level: 0.7,
            clarity_signal: 0.9,
            last_update: 1000,
        };
        let resonance = ResonanceState {
            coherence_score: 0.75,
            tension_level: 0.2,
            flow_level: 0.8,
            signal_buffer: Vec::new(),
            start_time: 0,
        let harmonic = HarmonicState {
            harmonic_level: 0.85,
            tension_level: 0.15,
            softness_factor: 0.9,
        let flowsync = FlowSyncState {
            flowsync_score: 0.8,
            direction_factor: 0.7,
            sync_quality: 0.85,
        let result = collect_alignment_inputs(&deepsense, &resonance, &harmonic, &flowsync);
        assert!(result.is_ok());
        let inputs = result.unwrap();
        assert_eq!(inputs.depth_level, 0.8);
        assert_eq!(inputs.density_level, 0.7);
        assert_eq!(inputs.clarity_signal, 0.9);
        assert_eq!(inputs.resonance_level, 0.75);
        assert_eq!(inputs.coherence_resonance, 0.8);
        assert_eq!(inputs.harmonic_level, 0.85);
        assert_eq!(inputs.direction_factor, 0.7);
        assert_eq!(inputs.sync_quality, 0.85);
    }
    fn test_collect_with_clamping() {
            depth_level: 1.5, // Au-dessus de 1.0
            density_level: -0.2, // En dessous de 0.0
            clarity_signal: 0.5,
            coherence_score: 0.5,
            tension_level: 0.3,
            flow_level: 0.5,
            harmonic_level: 0.5,
            tension_level: 0.5,
            softness_factor: 0.5,
            flowsync_score: 0.5,
            direction_factor: 0.5,
            sync_quality: 0.5,
        assert_eq!(inputs.depth_level, 1.0); // Clampé à 1.0
        assert_eq!(inputs.density_level, 0.0); // Clampé à 0.0
