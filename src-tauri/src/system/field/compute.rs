// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v8.0 — Field Engine : Compute                                    ║
// ║ Calcul du champ cognitif interne (météo mentale)                         ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

use super::analyzer::FieldInputs;
/// Calcule le champ cognitif interne à partir des inputs collectés
///
/// Retourne : (currents, pressure, turbulence, orientation)
/// # Arguments
/// * `inputs` - Signaux collectés depuis les modules
/// # Returns
/// * `Ok((f32, f32, f32, f32))` - (courants, pression, turbulence, orientation)
/// * `Err(String)` - En cas d'erreur de calcul
/// # Formules
/// * **Courants** = direction dominante = direction + flow / 2
/// * **Pression** = intensité interne = tension + divergence / 2
/// * **Turbulence** = instabilité = (divergence + 1 - consensus) / 2
/// * **Orientation** = lecture globale = (flow + depth + direction) / 3
pub fn compute_field(inputs: &FieldInputs) -> Result<(f32, f32, f32, f32), String> {
    // Validation des inputs
    if !inputs.swarm_consensus.is_finite()
        || !inputs.swarm_divergence.is_finite()
        || !inputs.ans_tension.is_finite()
        || !inputs.flow_level.is_finite()
        || !inputs.depth.is_finite()
        || !inputs.direction.is_finite()
    {
        return Err("Inputs non valides (NaN ou infini)".to_string());
    }
    // ═══════════════════════════════════════════════════════════════════════
    // Calcul des métriques de champ
    // Courants : direction dominante du système
    // Combine direction temporelle + flux de résonance
    let currents = (inputs.direction + inputs.flow_level) / 2.0;
    // Pression : intensité/charge interne
    // Combine tension autonome + divergence du swarm
    let pressure = (inputs.ans_tension + inputs.swarm_divergence) / 2.0;
    // Turbulence : instabilité du système
    // Combine divergence + manque de consensus
    let turbulence = (inputs.swarm_divergence + (1.0 - inputs.swarm_consensus)) / 2.0;
    // Orientation : lecture globale tridimensionnelle
    // Combine flux + profondeur + direction
    let orientation = (inputs.flow_level + inputs.depth + inputs.direction) / 3.0;
    // Validation et clamp final
    let currents_clamped = clamp(currents);
    let pressure_clamped = clamp(pressure);
    let turbulence_clamped = clamp(turbulence);
    let orientation_clamped = clamp(orientation);
    // Vérification finale
    if !currents_clamped.is_finite()
        || !pressure_clamped.is_finite()
        || !turbulence_clamped.is_finite()
        || !orientation_clamped.is_finite()
        return Err("Résultats de calcul non valides".to_string());
    Ok((
        currents_clamped,
        pressure_clamped,
        turbulence_clamped,
        orientation_clamped,
    ))
}
/// Borne une valeur entre 0.0 et 1.0
#[inline]
fn clamp(value: f32) -> f32 {
    if value < 0.0 {
        0.0
    } else if value > 1.0 {
        1.0
    } else {
        value
// ═══════════════════════════════════════════════════════════════════════════
// Tests
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_clamp() {
        assert_eq!(clamp(-0.5), 0.0);
        assert_eq!(clamp0.0, 0.0);
        assert_eq!(clamp0.5, 0.5);
        assert_eq!(clamp1.0, 1.0);
        assert_eq!(clamp1.5, 1.0);
    fn test_compute_field_valid_inputs() {
        let inputs = FieldInputs {
            swarm_consensus: 0.7,
            swarm_divergence: 0.2,
            ans_tension: 0.5,
            flow_level: 0.6,
            depth: 0.8,
            direction: 0.4,
        };
        let result = compute_field(&inputs);
        assert!(result.is_ok());
        let (currents, pressure, turbulence, orientation) = result.unwrap();
        // Validation des bornes [0.0, 1.0]
        assert!(currents >= 0.0 && currents <= 1.0);
        assert!(pressure >= 0.0 && pressure <= 1.0);
        assert!(turbulence >= 0.0 && turbulence <= 1.0);
        assert!(orientation >= 0.0 && orientation <= 1.0);
        // Validation des formules
        let expected_currents = (0.4 + 0.6) / 2.0; // direction + flow / 2
        assert!(currents - expected_currents.abs() < 0.001);
        let expected_pressure = (0.5 + 0.2) / 2.0; // tension + divergence / 2
        assert!(pressure - expected_pressure.abs() < 0.001);
        let expected_turbulence = (0.2 + (1.0 - 0.7)) / 2.0; // (div + 1 - cons) / 2
        assert!(turbulence - expected_turbulence.abs() < 0.001);
        let expected_orientation = (0.6 + 0.8 + 0.4) / 3.0; // (flow + depth + dir) / 3
        assert!(orientation - expected_orientation.abs() < 0.001);
    fn test_compute_field_edge_cases() {
        // Test avec valeurs minimales
        let inputs_min = FieldInputs {
            swarm_consensus: 0.0,
            swarm_divergence: 0.0,
            ans_tension: 0.0,
            flow_level: 0.0,
            depth: 0.0,
            direction: 0.0,
        let result = compute_field(&inputs_min);
        // Test avec valeurs maximales
        let inputs_max = FieldInputs {
            swarm_consensus: 1.0,
            swarm_divergence: 1.0,
            ans_tension: 1.0,
            flow_level: 1.0,
            depth: 1.0,
            direction: 1.0,
        let result = compute_field(&inputs_max);
    fn test_compute_field_high_consensus_low_divergence() {
        // Système stable : consensus élevé, divergence faible
            swarm_consensus: 0.9,
            swarm_divergence: 0.1,
            ans_tension: 0.2,
            flow_level: 0.7,
            direction: 0.6,
        let (_currents, pressure, turbulence, _orientation) = result.unwrap();
        // Pression devrait être basse (tension + divergence faibles)
        assert!(pressure < 0.3);
        // Turbulence devrait être basse (divergence faible, consensus élevé)
        assert!(turbulence < 0.2);
    fn test_compute_field_low_consensus_high_divergence() {
        // Système instable : consensus faible, divergence élevée
            swarm_consensus: 0.2,
            swarm_divergence: 0.8,
            ans_tension: 0.7,
            flow_level: 0.4,
            depth: 0.3,
            direction: 0.5,
        // Pression devrait être élevée (tension + divergence élevées)
        assert!(pressure > 0.7);
        // Turbulence devrait être élevée (divergence haute, consensus bas)
        assert!(turbulence > 0.7);
