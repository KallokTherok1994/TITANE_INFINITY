// DEEPSENSE ENGINE — Collection Module
// Collecte profonde des signaux internes

use crate::system::resonance::ResonanceState;
use crate::system::harmonic::HarmonicState;
use crate::system::stability::StabilityState;
use crate::system::balance::BalanceState;
/// Signaux d'entrée pour la perception profonde
#[derive(Debug, Clone)]
pub struct DeepSenseInputs {
    pub resonance_level: f32,
    pub stability_resonance: f32,
    pub coherence_resonance: f32,
    pub harmonic_level: f32,
    pub tension_level: f32,
    pub stability_score: f32,
    pub balance_score: f32,
}
impl DeepSenseInputs {
    /// Valide que tous les champs sont dans [0.0, 1.0]
    pub fn validate(&self) -> Result<(), String> {
        let fields = [
            ("resonance_level", self.resonance_level),
            ("stability_resonance", self.stability_resonance),
            ("coherence_resonance", self.coherence_resonance),
            ("harmonic_level", self.harmonic_level),
            ("tension_level", self.tension_level),
            ("stability_score", self.stability_score),
            ("balance_score", self.balance_score),
        ];
        for (name, value) in &fields {
            if !(*value >= 0.0 && *value <= 1.0) {
                return Err(format!("DeepSense input '{}' hors limites: {}", name, value));
            }
        }
        Ok(())
    }
/// Collecte les signaux pour la perception profonde
pub fn collect_deepsense_inputs(
    resonance: &ResonanceState,
    harmonic: &HarmonicState,
    stability: &StabilityState,
    balance: &BalanceState,
) -> Result<DeepSenseInputs, String> {
    // Clamp strict pour sécurité
    let clamp = |v: f32| v.max0.0.min1.0;
    // Note: On utilise coherence_score de l'ancien ResonanceState comme resonance_level
    let inputs = DeepSenseInputs {
        resonance_level: clamp(resonance.coherence_score),
        stability_resonance: clamp(resonance.flow_level),
        coherence_resonance: clamp(1.0 - resonance.tension_level),
        harmonic_level: clamp(harmonic.harmonic_level),
        tension_level: clamp(harmonic.tension_level),
        stability_score: clamp(stability.stability_score as f32),
        balance_score: clamp(balance.balance_score as f32),
    };
    // Validation
    inputs.validate()?;
    Ok(inputs)
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_deepsense_inputs_validate_valid() {
        let inputs = DeepSenseInputs {
            resonance_level: 0.85,
            stability_resonance: 0.82,
            coherence_resonance: 0.88,
            harmonic_level: 0.80,
            tension_level: 0.18,
            stability_score: 0.87,
            balance_score: 0.84,
        };
        assert!(inputs.validate().is_ok());
    fn test_deepsense_inputs_validate_invalid() {
            resonance_level: 1.3, // Invalide
        assert!(inputs.validate().is_err());
