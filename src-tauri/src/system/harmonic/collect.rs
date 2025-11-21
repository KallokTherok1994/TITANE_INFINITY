// HARMONIC ENGINE — Collection Module
// Collecte des signaux internes pour l'harmonie vibratoire

use crate::system::flowsync::FlowSyncState;
use crate::system::pulse::PulseState;
use crate::system::balance::BalanceState;
use crate::system::field::FieldState;
/// Signaux d'entrée pour le calcul de l'harmonie
#[derive(Debug, Clone)]
pub struct HarmonicInputs {
    pub flowsync_score: f32,
    pub direction_factor: f32,
    pub sync_quality: f32,
    pub pulse_rate: f32,
    pub pulse_intensity: f32,
    pub field_turbulence: f32,
}
impl HarmonicInputs {
    /// Valide que tous les champs sont dans [0.0, 1.0]
    pub fn validate(&self) -> Result<(), String> {
        let fields = [
            ("flowsync_score", self.flowsync_score),
            ("direction_factor", self.direction_factor),
            ("sync_quality", self.sync_quality),
            ("pulse_rate", self.pulse_rate),
            ("pulse_intensity", self.pulse_intensity),
            ("field_turbulence", self.field_turbulence),
        ];
        for (name, value) in &fields {
            if !(*value >= 0.0 && *value <= 1.0) {
                return Err(format!("Harmonic input '{}' hors limites: {}", name, value));
            }
        }
        Ok(())
    }
/// Collecte les signaux pour l'évaluation harmonique
pub fn collect_harmonic_inputs(
    flowsync: &FlowSyncState,
    pulse: &PulseState,
    balance: &BalanceState,
    field: &FieldState,
) -> Result<HarmonicInputs, String> {
    // Clamp strict pour sécurité
    let clamp = |v: f32| v.max0.0.min1.0;
    let inputs = HarmonicInputs {
        flowsync_score: clamp(flowsync.flowsync_score),
        direction_factor: clamp(flowsync.direction_factor),
        sync_quality: clamp(flowsync.sync_quality),
        pulse_rate: clamp(pulse.pulse_rate),
        pulse_intensity: clamp(pulse.pulse_intensity),
        field_turbulence: clamp(field.turbulence as f32),
    };
    // Validation
    inputs.validate()?;
    Ok(inputs)
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_harmonic_inputs_validate_valid() {
        let inputs = HarmonicInputs {
            flowsync_score: 0.85,
            direction_factor: 0.80,
            sync_quality: 0.82,
            pulse_rate: 0.78,
            pulse_intensity: 0.83,
            field_turbulence: 0.15,
        };
        assert!(inputs.validate().is_ok());
    fn test_harmonic_inputs_validate_invalid() {
            direction_factor: -0.1, // Invalide
        assert!(inputs.validate().is_err());
