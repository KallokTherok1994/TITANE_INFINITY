// PULSE ENGINE — Collection Module
// Collecte des signaux pertinents pour le rythme interne

use crate::system::stability::StabilityState;
use crate::system::balance::BalanceState;
use crate::system::secureflow::SecureFlowState;
use crate::system::lowflow::LowFlowState;
use crate::system::field::FieldState;
/// Signaux d'entrée pour le calcul du pouls
#[derive(Debug, Clone)]
pub struct PulseInputs {
    pub stability_score: f32,
    pub balance_score: f32,
    pub stress_index: f32,
    pub throttle_level: f32,
    pub field_currents: f32,
}
impl PulseInputs {
    /// Valide que tous les champs sont dans [0.0, 1.0]
    pub fn validate(&self) -> Result<(), String> {
        let fields = [
            ("stability_score", self.stability_score),
            ("balance_score", self.balance_score),
            ("stress_index", self.stress_index),
            ("throttle_level", self.throttle_level),
            ("field_currents", self.field_currents),
        ];
        for (name, value) in &fields {
            if !(*value >= 0.0 && *value <= 1.0) {
                return Err(format!("Pulse input '{}' hors limites: {}", name, value));
            }
        }
        Ok(())
    }
/// Collecte les signaux nécessaires au calcul du pouls
pub fn collect_pulse_inputs(
    stability: &StabilityState,
    balance: &BalanceState,
    secureflow: &SecureFlowState,
    lowflow: &LowFlowState,
    field: &FieldState,
) -> Result<PulseInputs, String> {
    // Clamp strict pour sécurité
    let clamp = |v: f32| v.max0.0.min1.0;
    let inputs = PulseInputs {
        stability_score: clamp(stability.stability_score as f32),
        balance_score: clamp(balance.balance_score as f32),
        stress_index: clamp(secureflow.stress_index as f32),
        throttle_level: clamp(lowflow.throttle_level as f32),
        field_currents: clamp(field.currents as f32),
    };
    // Validation
    inputs.validate()?;
    Ok(inputs)
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_pulse_inputs_validate_valid() {
        let inputs = PulseInputs {
            stability_score: 0.8,
            balance_score: 0.75,
            stress_index: 0.2,
            throttle_level: 0.15,
            field_currents: 0.85,
        };
        assert!(inputs.validate().is_ok());
    fn test_pulse_inputs_validate_invalid() {
            stability_score: 1.5, // Invalide
        assert!(inputs.validate().is_err());
