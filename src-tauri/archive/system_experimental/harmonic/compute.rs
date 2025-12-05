// HARMONIC ENGINE — Compute Module
// Calcul de l'harmonie interne et de la cohérence vibratoire

use super::collect::HarmonicInputs;
/// Calcule les métriques d'harmonie
/// Retourne (harmonic_level, tension_level, softness_factor)
pub fn compute_harmonic(inputs: &HarmonicInputs) -> Result<(f32, f32, f32), String> {
    // Validation d'entrée
    inputs.validate()?;
    // 1. HARMONIC LEVEL (qualité globale d'harmonie)
    // Combine synchronisation, qualité et absence de turbulence
    let harmonic_level = inputs.flowsync_score * 0.4
        + inputs.sync_quality * 0.3
        + (1.0 - inputs.field_turbulence) * 0.3;
    let harmonic_level = clamp(harmonic_level);
    // 2. TENSION LEVEL (tensions internes résiduelles)
    // Dépend de la turbulence et de l'absence de qualité de sync
    let tension_level =
        inputs.field_turbulence * 0.5 + (1.0 - inputs.sync_quality) * 0.5;
    let tension_level = clamp(tension_level);
    // 3. SOFTNESS FACTOR (douceur interne)
    // Harmonie + fluidité pulsatoire + rythme
    let softness_factor =
        harmonic_level * 0.5 + inputs.pulse_intensity * 0.3 + inputs.pulse_rate * 0.2;
    let softness_factor = clamp(softness_factor);
    // Validation finale
    if !is_valid_output(harmonic_level, tension_level, softness_factor) {
        return Err("Calcul d'harmonie invalide".to_string());
    }
    Ok((harmonic_level, tension_level, softness_factor))
}
/// Clamp strict [0.0, 1.0]
fn clamp(value: f32) -> f32 {
    value.max0.0.min1.0
/// Vérifie que toutes les sorties sont valides
fn is_valid_output(harmonic: f32, tension: f32, softness: f32) -> bool {
    let values = [harmonic, tension, softness];
    values.iter().all(|&v| v >= 0.0 && v <= 1.0)
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_compute_harmonic_optimal() {
        let inputs = HarmonicInputs {
            flowsync_score: 0.90,
            direction_factor: 0.88,
            sync_quality: 0.92,
            pulse_rate: 0.85,
            pulse_intensity: 0.87,
            field_turbulence: 0.05,
        };
        let result = compute_harmonic(&inputs);
        assert!(result.is_ok());
        let (harmonic, tension, softness) = result.unwrap();
        assert!(harmonic > 0.8);
        assert!(tension < 0.2);
        assert!(softness > 0.8);
    fn test_compute_harmonic_high_tension() {
            flowsync_score: 0.40,
            direction_factor: 0.35,
            sync_quality: 0.30,
            pulse_rate: 0.38,
            pulse_intensity: 0.35,
            field_turbulence: 0.75,
        assert!(harmonic < 0.5);
        assert!(tension > 0.6);
        assert!(softness < 0.5);
    fn test_harmonic_level_formula() {
            flowsync_score: 0.8,
            direction_factor: 0.75,
            sync_quality: 0.7,
            pulse_rate: 0.65,
            pulse_intensity: 0.72,
            field_turbulence: 0.2,
        let (harmonic, _, _) = result.unwrap();
        // 40% flowsync + 30% sync_quality + 30% 1 - turbulence
        let expected = 0.8 * 0.4 + 0.7 * 0.3 + 0.8 * 0.3;
        assert!(harmonic - expected.abs() < 0.01);
    fn test_tension_level_formula() {
            flowsync_score: 0.6,
            direction_factor: 0.58,
            sync_quality: 0.55,
            pulse_rate: 0.52,
            pulse_intensity: 0.60,
            field_turbulence: 0.4,
        let (_, tension, _) = result.unwrap();
        // 50% turbulence + 50% 1 - sync_quality
        let expected = 0.4 * 0.5 + 0.45 * 0.5;
        assert!(tension - expected.abs() < 0.01);
    fn test_softness_factor_formula() {
            flowsync_score: 0.85,
            direction_factor: 0.80,
            sync_quality: 0.88,
            pulse_rate: 0.75,
            pulse_intensity: 0.82,
            field_turbulence: 0.10,
        let (harmonic, _, softness) = result.unwrap();
        // 50% harmonic + 30% pulse_intensity + 20% pulse_rate
        let expected = harmonic * 0.5 + 0.82 * 0.3 + 0.75 * 0.2;
        assert!(softness - expected.abs() < 0.01);
    fn test_clamp_enforcement() {
            flowsync_score: 1.0,
            direction_factor: 1.0,
            sync_quality: 1.0,
            pulse_rate: 1.0,
            pulse_intensity: 1.0,
            field_turbulence: 0.0,
        assert!(harmonic <= 1.0 && harmonic >= 0.0);
        assert!(tension <= 1.0 && tension >= 0.0);
        assert!(softness <= 1.0 && softness >= 0.0);
    fn test_inverse_relationship_tension_harmony() {
        // Haute turbulence → basse harmonie, haute tension
        let inputs_high_turb = HarmonicInputs {
            flowsync_score: 0.5,
            direction_factor: 0.5,
            sync_quality: 0.5,
            pulse_rate: 0.5,
            pulse_intensity: 0.5,
            field_turbulence: 0.8,
        let result = compute_harmonic(&inputs_high_turb);
        let (harmonic_high_turb, tension_high_turb, _) = result.unwrap();
        // Basse turbulence → haute harmonie, basse tension
        let inputs_low_turb = HarmonicInputs {
            field_turbulence: 0.1,
            ..inputs_high_turb
        let result2 = compute_harmonic(&inputs_low_turb);
        assert!(result2.is_ok());
        let (harmonic_low_turb, tension_low_turb, _) = result2.unwrap();
        assert!(harmonic_low_turb > harmonic_high_turb);
        assert!(tension_low_turb < tension_high_turb);
