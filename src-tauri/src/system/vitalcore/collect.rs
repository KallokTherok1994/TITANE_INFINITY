// TITANE∞ v8.0 - VitalCore Engine
// Module de collecte des signaux vitaux

use crate::system::continuum::ContinuumState;
use crate::system::deepalignment::DeepAlignmentState;
use crate::system::resonance::ResonanceState;
use crate::system::flowsync::FlowSyncState;
use crate::system::stability::StabilityState;
/// Entrées pour le calcul de la vitalité
#[derive(Debug, Clone)]
pub struct VitalCoreInputs {
    pub continuity_score: f32,
    pub alignment_depth: f32,
    pub resonance_level: f32,
    pub sync_quality: f32,
    pub stability_score: f32,
}
/// Collecte les signaux vitaux transversaux
pub fn collect_vital_inputs(
    continuum: &ContinuumState,
    deepalignment: &DeepAlignmentState,
    resonance: &ResonanceState,
    flowsync: &FlowSyncState,
    stability: &StabilityState,
) -> Result<VitalCoreInputs, String> {
    // Depuis Continuum: utiliser progression comme continuity_score
    let continuity_score = continuum.progression.clamp(0.0, 1.0);
    // Depuis DeepAlignment
    let alignment_depth = deepalignment.alignment_depth.clamp(0.0, 1.0);
    // Depuis Resonance (ancien format)
    let resonance_level = resonance.coherence_score.clamp(0.0, 1.0);
    // Depuis FlowSync
    let sync_quality = flowsync.sync_quality.clamp(0.0, 1.0);
    // Depuis Stability
    let stability_score = stability.stability_score.clamp(0.0, 1.0);
    Ok(VitalCoreInputs {
        continuity_score,
        alignment_depth,
        resonance_level,
        sync_quality,
        stability_score,
    })
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_collect_vital_inputs() {
        let continuum = ContinuumState {
            initialized: true,
            momentum: 0.7,
            direction: 0.8,
            progression: 0.82,
            stability_trend: 0.75,
            last_update: 1000,
        };
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
        let flowsync = FlowSyncState {
            flowsync_score: 0.8,
            direction_factor: 0.7,
            sync_quality: 0.85,
        let stability = StabilityState {
            stability_score: 0.82,
            volatility_index: 0.18,
            recovery_capacity: 0.85,
        let result = collect_vital_inputs(&continuum, &deepalignment, &resonance, &flowsync, &stability);
        assert!(result.is_ok());
        let inputs = result.unwrap();
        assert_eq!(inputs.continuity_score, 0.82);
        assert_eq!(inputs.alignment_depth, 0.8);
        assert_eq!(inputs.resonance_level, 0.75);
        assert_eq!(inputs.sync_quality, 0.85);
        assert_eq!(inputs.stability_score, 0.82);
    }
    fn test_collect_with_clamping() {
            momentum: 0.5,
            direction: 0.5,
            progression: 1.5, // Au-dessus
            stability_trend: 0.5,
            alignment_depth: -0.2, // En dessous
            direction_alignment: 0.5,
            core_alignment: 0.5,
            coherence_score: 0.5,
            tension_level: 0.5,
            flow_level: 0.5,
            flowsync_score: 0.5,
            direction_factor: 0.5,
            sync_quality: 0.5,
            stability_score: 0.5,
            volatility_index: 0.5,
            recovery_capacity: 0.5,
        assert_eq!(inputs.continuity_score, 1.0); // Clampé
        assert_eq!(inputs.alignment_depth, 0.0); // Clampé
