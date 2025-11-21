// RESONANCE ENGINE — Collection Module
// Collecte multi-sources des signaux profonds

use crate::system::harmonic::HarmonicState;
use crate::system::flowsync::FlowSyncState;
use crate::system::pulse::PulseState;
use crate::system::stability::StabilityState;
use crate::system::integrity::IntegrityState;
/// Signaux d'entrée pour le calcul de la résonance
#[derive(Debug, Clone)]
pub struct ResonanceInputs {
    pub harmonic_level: f32,
    pub tension_level: f32,
    pub flowsync_score: f32,
    pub sync_quality: f32,
    pub pulse_rate: f32,
    pub pulse_intensity: f32,
    pub stability_score: f32,
    pub integrity_score: f32,
}
impl ResonanceInputs {
    /// Valide que tous les champs sont dans [0.0, 1.0]
    pub fn validate(&self) -> Result<(), String> {
        let fields = [
            ("harmonic_level", self.harmonic_level),
            ("tension_level", self.tension_level),
            ("flowsync_score", self.flowsync_score),
            ("sync_quality", self.sync_quality),
            ("pulse_rate", self.pulse_rate),
            ("pulse_intensity", self.pulse_intensity),
            ("stability_score", self.stability_score),
            ("integrity_score", self.integrity_score),
        ];
        for (name, value) in &fields {
            if !(*value >= 0.0 && *value <= 1.0) {
                return Err(format!("Resonance input '{}' hors limites: {}", name, value));
            }
        }
        Ok(())
    }
/// Collecte les signaux pour l'évaluation de la résonance
pub fn collect_resonance_inputs(
    harmonic: &HarmonicState,
    flowsync: &FlowSyncState,
    pulse: &PulseState,
    stability: &StabilityState,
    integrity: &IntegrityState,
) -> Result<ResonanceInputs, String> {
    // Clamp strict pour sécurité
    let clamp = |v: f32| v.max0.0.min1.0;
    let inputs = ResonanceInputs {
        harmonic_level: clamp(harmonic.harmonic_level),
        tension_level: clamp(harmonic.tension_level),
        flowsync_score: clamp(flowsync.flowsync_score),
        sync_quality: clamp(flowsync.sync_quality),
        pulse_rate: clamp(pulse.pulse_rate),
        pulse_intensity: clamp(pulse.pulse_intensity),
        stability_score: clamp(stability.stability_score as f32),
        integrity_score: clamp(integrity.integrity_score as f32),
    };
    // Validation
    inputs.validate()?;
    Ok(inputs)
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_resonance_inputs_validate_valid() {
        let inputs = ResonanceInputs {
            harmonic_level: 0.85,
            tension_level: 0.15,
            flowsync_score: 0.82,
            sync_quality: 0.88,
            pulse_rate: 0.80,
            pulse_intensity: 0.83,
            stability_score: 0.87,
            integrity_score: 0.84,
        };
        assert!(inputs.validate().is_ok());
    fn test_resonance_inputs_validate_invalid() {
            tension_level: 1.5, // Invalide
        assert!(inputs.validate().is_err());
