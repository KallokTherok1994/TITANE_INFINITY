// FLOWSYNC ENGINE — Collection Module
// Collecte des flux internes multidimensionnels

use crate::system::pulse::PulseState;
use crate::system::balance::BalanceState;
use crate::system::field::FieldState;
use crate::system::stability::StabilityState;
use crate::system::integrity::IntegrityState;
/// Signaux d'entrée pour la synchronisation des flux
#[derive(Debug, Clone)]
pub struct FlowSyncInputs {
    pub pulse_rate: f32,
    pub pulse_intensity: f32,
    pub balance_score: f32,
    pub field_currents: f32,
    pub field_orientation: f32,
    pub stability_score: f32,
    pub integrity_score: f32,
}
impl FlowSyncInputs {
    /// Valide que tous les champs sont dans [0.0, 1.0]
    pub fn validate(&self) -> Result<(), String> {
        let fields = [
            ("pulse_rate", self.pulse_rate),
            ("pulse_intensity", self.pulse_intensity),
            ("balance_score", self.balance_score),
            ("field_currents", self.field_currents),
            ("field_orientation", self.field_orientation),
            ("stability_score", self.stability_score),
            ("integrity_score", self.integrity_score),
        ];
        for (name, value) in &fields {
            if !(*value >= 0.0 && *value <= 1.0) {
                return Err(format!("FlowSync input '{}' hors limites: {}", name, value));
            }
        }
        Ok(())
    }
/// Collecte les signaux pour la synchronisation des flux
pub fn collect_flowsync_inputs(
    pulse: &PulseState,
    balance: &BalanceState,
    field: &FieldState,
    stability: &StabilityState,
    integrity: &IntegrityState,
) -> Result<FlowSyncInputs, String> {
    // Clamp strict pour sécurité
    let clamp = |v: f32| v.max0.0.min1.0;
    let inputs = FlowSyncInputs {
        pulse_rate: clamp(pulse.pulse_rate),
        pulse_intensity: clamp(pulse.pulse_intensity),
        balance_score: clamp(balance.balance_score as f32),
        field_currents: clamp(field.currents as f32),
        field_orientation: clamp(field.orientation as f32),
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
    fn test_flowsync_inputs_validate_valid() {
        let inputs = FlowSyncInputs {
            pulse_rate: 0.8,
            pulse_intensity: 0.75,
            balance_score: 0.82,
            field_currents: 0.85,
            field_orientation: 0.78,
            stability_score: 0.88,
            integrity_score: 0.84,
        };
        assert!(inputs.validate().is_ok());
    fn test_flowsync_inputs_validate_invalid() {
            pulse_rate: 1.2, // Invalide
        assert!(inputs.validate().is_err());
