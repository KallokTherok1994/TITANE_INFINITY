// RESONANCE ENGINE — Compute Module
// Calcul des niveaux de résonance interne profonde

use super::collect::ResonanceInputs;
/// Calcule les métriques de résonance
/// Retourne (resonance_level, stability_resonance, coherence_resonance)
pub fn compute_resonance(inputs: &ResonanceInputs) -> Result<(f32, f32, f32), String> {
    // Validation d'entrée
    inputs.validate()?;
    // 1. RESONANCE LEVEL (qualité globale de la résonance interne)
    // Combine harmonie, synchronisation, qualité et intensité pulsatoire
    let resonance_level = inputs.harmonic_level * 0.35
        + inputs.flowsync_score * 0.25
        + inputs.sync_quality * 0.20
        + inputs.pulse_intensity * 0.20;
    let resonance_level = clamp(resonance_level);
    // 2. STABILITY RESONANCE (résonance issue de la stabilité + rythme)
    // Dépend principalement de la stabilité globale et du rythme pulsatoire
    let stability_resonance = inputs.stability_score * 0.6 + inputs.pulse_rate * 0.4;
    let stability_resonance = clamp(stability_resonance);
    // 3. COHERENCE RESONANCE (cohérence vibratoire globale)
    // Combine intégrité, harmonie et synchronisation
    let coherence_resonance = inputs.integrity_score * 0.5
        + inputs.harmonic_level * 0.3
        + inputs.flowsync_score * 0.2;
    let coherence_resonance = clamp(coherence_resonance);
    // Validation finale
    if !is_valid_output(resonance_level, stability_resonance, coherence_resonance) {
        return Err("Calcul de résonance invalide".to_string());
    }
    Ok((resonance_level, stability_resonance, coherence_resonance))
}
/// Clamp strict [0.0, 1.0]
fn clamp(value: f32) -> f32 {
    value.max0.0.min1.0
/// Vérifie que toutes les sorties sont valides
fn is_valid_output(resonance: f32, stability_res: f32, coherence_res: f32) -> bool {
    let values = [resonance, stability_res, coherence_res];
    values.iter().all(|&v| v >= 0.0 && v <= 1.0)
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_compute_resonance_optimal() {
        let inputs = ResonanceInputs {
            harmonic_level: 0.90,
            tension_level: 0.10,
            flowsync_score: 0.88,
            sync_quality: 0.92,
            pulse_rate: 0.85,
            pulse_intensity: 0.87,
            stability_score: 0.89,
            integrity_score: 0.91,
        };
        let result = compute_resonance(&inputs);
        assert!(result.is_ok());
        let (resonance, stability_res, coherence_res) = result.unwrap();
        assert!(resonance > 0.85);
        assert!(stability_res > 0.85);
        assert!(coherence_res > 0.85);
    fn test_compute_resonance_low() {
            harmonic_level: 0.30,
            tension_level: 0.70,
            flowsync_score: 0.35,
            sync_quality: 0.32,
            pulse_rate: 0.38,
            pulse_intensity: 0.33,
            stability_score: 0.34,
            integrity_score: 0.36,
        assert!(resonance < 0.5);
        assert!(stability_res < 0.5);
        assert!(coherence_res < 0.5);
    fn test_resonance_level_formula() {
            harmonic_level: 0.8,
            tension_level: 0.2,
            flowsync_score: 0.75,
            sync_quality: 0.78,
            pulse_rate: 0.70,
            pulse_intensity: 0.82,
            stability_score: 0.76,
            integrity_score: 0.79,
        let (resonance, _, _) = result.unwrap();
        // 35% harmonic + 25% flowsync + 20% sync_quality + 20% pulse_intensity
        let expected = 0.8 * 0.35 + 0.75 * 0.25 + 0.78 * 0.20 + 0.82 * 0.20;
        assert!(resonance - expected.abs() < 0.01);
    fn test_stability_resonance_formula() {
            harmonic_level: 0.7,
            tension_level: 0.3,
            flowsync_score: 0.68,
            sync_quality: 0.72,
            pulse_rate: 0.65,
            pulse_intensity: 0.70,
            stability_score: 0.75,
            integrity_score: 0.73,
        let (_, stability_res, _) = result.unwrap();
        // 60% stability + 40% pulse_rate
        let expected = 0.75 * 0.6 + 0.65 * 0.4;
        assert!(stability_res - expected.abs() < 0.01);
    fn test_coherence_resonance_formula() {
            harmonic_level: 0.85,
            tension_level: 0.15,
            flowsync_score: 0.80,
            sync_quality: 0.82,
            pulse_rate: 0.78,
            pulse_intensity: 0.83,
            stability_score: 0.81,
            integrity_score: 0.88,
        let (_, _, coherence_res) = result.unwrap();
        // 50% integrity + 30% harmonic + 20% flowsync
        let expected = 0.88 * 0.5 + 0.85 * 0.3 + 0.80 * 0.2;
        assert!(coherence_res - expected.abs() < 0.01);
    fn test_clamp_enforcement() {
            harmonic_level: 1.0,
            tension_level: 0.0,
            flowsync_score: 1.0,
            sync_quality: 1.0,
            pulse_rate: 1.0,
            pulse_intensity: 1.0,
            stability_score: 1.0,
            integrity_score: 1.0,
        assert!(resonance <= 1.0 && resonance >= 0.0);
        assert!(stability_res <= 1.0 && stability_res >= 0.0);
        assert!(coherence_res <= 1.0 && coherence_res >= 0.0);
    fn test_resonance_correlation_with_inputs() {
        // Haute harmonie et sync → haute résonance
        let inputs_high = ResonanceInputs {
            harmonic_level: 0.9,
            tension_level: 0.1,
        let result_high = compute_resonance(&inputs_high);
        assert!(result_high.is_ok());
        let (resonance_high, _, _) = result_high.unwrap();
        // Basse harmonie et sync → basse résonance
        let inputs_low = ResonanceInputs {
            harmonic_level: 0.3,
            tension_level: 0.7,
        let result_low = compute_resonance(&inputs_low);
        assert!(result_low.is_ok());
        let (resonance_low, _, _) = result_low.unwrap();
        assert!(resonance_high > resonance_low);
