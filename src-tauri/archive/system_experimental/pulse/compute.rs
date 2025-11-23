// PULSE ENGINE — Compute Module
// Calculs du rythme interne et de l'intensité pulsatoire

use super::collect::PulseInputs;
/// Calcule les métriques de pouls
/// Retourne (pulse_rate, pulse_intensity, rhythm_factor)
pub fn compute_pulse(inputs: &PulseInputs) -> Result<(f32, f32, f32), String> {
    // Validation d'entrée
    inputs.validate()?;
    // 1. PULSE RATE (rythme global)
    // Plus la stabilité et l'équilibre sont élevés, plus le rythme est fluide
    let pulse_rate = inputs.stability_score * 0.4
        + inputs.balance_score * 0.4
        + (1.0 - inputs.stress_index) * 0.2;
    let pulse_rate = clamp(pulse_rate);
    // 2. PULSE INTENSITY (énergie interne du pouls)
    // Dépend des courants du Field et de l'absence de throttle
    let pulse_intensity = inputs.field_currents * 0.5 + (1.0 - inputs.throttle_level) * 0.5;
    let pulse_intensity = clamp(pulse_intensity);
    // 3. RHYTHM FACTOR (rapport entre pulsation, charge et fluidité)
    let rhythm_factor = pulse_rate * 0.5
        + (1.0 - inputs.throttle_level) * 0.3
        + inputs.field_currents * 0.2;
    let rhythm_factor = clamp(rhythm_factor);
    // Validation finale
    if !is_valid_output(pulse_rate, pulse_intensity, rhythm_factor) {
        return Err("Calcul de pouls invalide".to_string());
    }
    Ok((pulse_rate, pulse_intensity, rhythm_factor))
}
/// Clamp strict [0.0, 1.0]
fn clamp(value: f32) -> f32 {
    value.max0.0.min1.0
/// Vérifie que toutes les sorties sont valides
fn is_valid_output(pulse_rate: f32, pulse_intensity: f32, rhythm_factor: f32) -> bool {
    let values = [pulse_rate, pulse_intensity, rhythm_factor];
    values.iter().all(|&v| v >= 0.0 && v <= 1.0)
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_compute_pulse_optimal() {
        let inputs = PulseInputs {
            stability_score: 0.9,
            balance_score: 0.85,
            stress_index: 0.1,
            throttle_level: 0.05,
            field_currents: 0.95,
        };
        let result = compute_pulse(&inputs);
        assert!(result.is_ok());
        let (rate, intensity, rhythm) = result.unwrap();
        assert!(rate > 0.8);
        assert!(intensity > 0.8);
        assert!(rhythm > 0.8);
    fn test_compute_pulse_low() {
            stability_score: 0.3,
            balance_score: 0.2,
            stress_index: 0.7,
            throttle_level: 0.8,
            field_currents: 0.25,
        assert!(rate < 0.5);
        assert!(intensity < 0.5);
        assert!(rhythm < 0.5);
    fn test_clamp_enforcement() {
            stability_score: 1.0,
            balance_score: 1.0,
            stress_index: 0.0,
            throttle_level: 0.0,
            field_currents: 1.0,
        assert!(rate <= 1.0 && rate >= 0.0);
        assert!(intensity <= 1.0 && intensity >= 0.0);
        assert!(rhythm <= 1.0 && rhythm >= 0.0);
    fn test_pulse_rate_formula() {
            stability_score: 0.8,
            balance_score: 0.7,
            stress_index: 0.2,
            throttle_level: 0.1,
            field_currents: 0.75,
        let (rate, _, _) = result.unwrap();
        // Vérification approximative de la formule
        let expected = 0.8 * 0.4 + 0.7 * 0.4 + 0.8 * 0.2;
        assert!(rate - expected.abs() < 0.01);
    fn test_pulse_intensity_formula() {
            stability_score: 0.5,
            balance_score: 0.5,
            stress_index: 0.3,
            throttle_level: 0.2,
            field_currents: 0.6,
        let (_, intensity, _) = result.unwrap();
        let expected = 0.6 * 0.5 + 0.8 * 0.5;
        assert!(intensity - expected.abs() < 0.01);
    fn test_rhythm_factor_formula() {
            stability_score: 0.7,
            balance_score: 0.65,
            stress_index: 0.25,
            throttle_level: 0.3,
            field_currents: 0.8,
        let (rate, _, rhythm) = result.unwrap();
        // rhythm = rate*0.5 + 1 - throttle*0.3 + currents*0.2
        let expected = rate * 0.5 + 0.7 * 0.3 + 0.8 * 0.2;
        assert!(rhythm - expected.abs() < 0.01);
