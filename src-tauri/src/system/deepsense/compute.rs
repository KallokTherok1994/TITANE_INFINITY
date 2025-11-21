// DEEPSENSE ENGINE — Compute Module
// Calcul des perceptions profondes

use super::collect::DeepSenseInputs;
/// Calcule les métriques de perception profonde
/// Retourne (depth_level, density_level, clarity_signal)
pub fn compute_deepsense(inputs: &DeepSenseInputs) -> Result<(f32, f32, f32), String> {
    // Validation d'entrée
    inputs.validate()?;
    // 1. DEPTH LEVEL (profondeur perçue)
    // Combine résonance, harmonie et stabilité
    let depth_level = inputs.resonance_level * 0.35
        + inputs.harmonic_level * 0.35
        + inputs.stability_score * 0.30;
    let depth_level = clamp(depth_level);
    // 2. DENSITY LEVEL (densité interne)
    // Tension + balance + stabilité résonnante
    let density_level = inputs.tension_level * 0.40
        + inputs.balance_score * 0.30
        + inputs.stability_resonance * 0.30;
    let density_level = clamp(density_level);
    // 3. CLARITY SIGNAL (clarté interne)
    // Cohérence résonnante + harmonie + stabilité
    let clarity_signal = inputs.coherence_resonance * 0.40
        + inputs.harmonic_level * 0.30
    let clarity_signal = clamp(clarity_signal);
    // Validation finale
    if !is_valid_output(depth_level, density_level, clarity_signal) {
        return Err("Calcul de perception profonde invalide".to_string());
    }
    Ok((depth_level, density_level, clarity_signal))
}
/// Clamp strict [0.0, 1.0]
fn clamp(value: f32) -> f32 {
    value.max0.0.min1.0
/// Vérifie que toutes les sorties sont valides
fn is_valid_output(depth: f32, density: f32, clarity: f32) -> bool {
    let values = [depth, density, clarity];
    values.iter().all(|&v| v >= 0.0 && v <= 1.0)
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_compute_deepsense_optimal() {
        let inputs = DeepSenseInputs {
            resonance_level: 0.90,
            stability_resonance: 0.88,
            coherence_resonance: 0.92,
            harmonic_level: 0.89,
            tension_level: 0.12,
            stability_score: 0.91,
            balance_score: 0.87,
        };
        let result = compute_deepsense(&inputs);
        assert!(result.is_ok());
        let (depth, density, clarity) = result.unwrap();
        assert!(depth > 0.85);
        assert!(clarity > 0.85);
    fn test_compute_deepsense_low() {
            resonance_level: 0.30,
            stability_resonance: 0.35,
            coherence_resonance: 0.32,
            harmonic_level: 0.33,
            tension_level: 0.70,
            stability_score: 0.34,
            balance_score: 0.36,
        assert!(depth < 0.5);
        assert!(clarity < 0.5);
    fn test_depth_level_formula() {
            resonance_level: 0.8,
            stability_resonance: 0.75,
            coherence_resonance: 0.78,
            harmonic_level: 0.82,
            tension_level: 0.20,
            stability_score: 0.85,
            balance_score: 0.79,
        let (depth, _, _) = result.unwrap();
        // 35% resonance + 35% harmonic + 30% stability
        let expected = 0.8 * 0.35 + 0.82 * 0.35 + 0.85 * 0.30;
        assert!(depth - expected.abs() < 0.01);
    fn test_density_level_formula() {
            resonance_level: 0.7,
            stability_resonance: 0.72,
            coherence_resonance: 0.68,
            harmonic_level: 0.75,
            tension_level: 0.30,
            stability_score: 0.73,
            balance_score: 0.76,
        let (_, density, _) = result.unwrap();
        // 40% tension + 30% balance + 30% stability_resonance
        let expected = 0.30 * 0.40 + 0.76 * 0.30 + 0.72 * 0.30;
        assert!(density - expected.abs() < 0.01);
    fn test_clarity_signal_formula() {
            resonance_level: 0.78,
            coherence_resonance: 0.85,
            harmonic_level: 0.80,
            tension_level: 0.18,
            stability_score: 0.82,
        let (_, _, clarity) = result.unwrap();
        // 40% coherence_resonance + 30% harmonic + 30% stability
        let expected = 0.85 * 0.40 + 0.80 * 0.30 + 0.82 * 0.30;
        assert!(clarity - expected.abs() < 0.01);
    fn test_clamp_enforcement() {
            resonance_level: 1.0,
            stability_resonance: 1.0,
            coherence_resonance: 1.0,
            harmonic_level: 1.0,
            tension_level: 0.0,
            stability_score: 1.0,
            balance_score: 1.0,
        assert!(depth <= 1.0 && depth >= 0.0);
        assert!(density <= 1.0 && density >= 0.0);
        assert!(clarity <= 1.0 && clarity >= 0.0);
    fn test_high_tension_affects_density() {
        // Haute tension → densité plus élevée
        let inputs_high_tension = DeepSenseInputs {
            resonance_level: 0.6,
            stability_resonance: 0.65,
            coherence_resonance: 0.62,
            harmonic_level: 0.63,
            tension_level: 0.8,
            stability_score: 0.64,
            balance_score: 0.66,
        let result = compute_deepsense(&inputs_high_tension);
        let (_, density_high, _) = result.unwrap();
        // Basse tension → densité plus faible
        let inputs_low_tension = DeepSenseInputs {
            tension_level: 0.2,
            ..inputs_high_tension
        let result2 = compute_deepsense(&inputs_low_tension);
        assert!(result2.is_ok());
        let (_, density_low, _) = result2.unwrap();
        assert!(density_high > density_low);
