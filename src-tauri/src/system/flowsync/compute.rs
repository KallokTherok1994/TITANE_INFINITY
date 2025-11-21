// FLOWSYNC ENGINE — Compute Module
// Calcul du flux synchronisé et de la direction évolutive

use super::collect::FlowSyncInputs;
/// Calcule les métriques de synchronisation des flux
/// Retourne (flowsync_score, direction_factor, sync_quality)
pub fn compute_flowsync(inputs: &FlowSyncInputs) -> Result<(f32, f32, f32), String> {
    // Validation d'entrée
    inputs.validate()?;
    // 1. FLOWSYNC SCORE (qualité globale de synchronisation)
    // Combine rythme, balance, stabilité et intégrité
    let flowsync_score = inputs.pulse_rate * 0.25
        + inputs.balance_score * 0.25
        + inputs.stability_score * 0.25
        + inputs.integrity_score * 0.25;
    let flowsync_score = clamp(flowsync_score);
    // 2. DIRECTION FACTOR (direction évolutive interne, cohérente)
    // Dépend de l'orientation et des courants du Field
    let direction_factor = inputs.field_orientation * 0.5 + inputs.field_currents * 0.5;
    let direction_factor = clamp(direction_factor);
    // 3. SYNC QUALITY (harmonie entre rythme, champ et stabilité)
    let sync_quality = inputs.pulse_intensity * 0.4
        + inputs.balance_score * 0.3
        + (1.0 - (1.0 - inputs.stability_score)) * 0.3;
    let sync_quality = clamp(sync_quality);
    // Validation finale
    if !is_valid_output(flowsync_score, direction_factor, sync_quality) {
        return Err("Calcul de synchronisation invalide".to_string());
    }
    Ok((flowsync_score, direction_factor, sync_quality))
}
/// Clamp strict [0.0, 1.0]
fn clamp(value: f32) -> f32 {
    value.max0.0.min1.0
/// Vérifie que toutes les sorties sont valides
fn is_valid_output(flowsync: f32, direction: f32, sync: f32) -> bool {
    let values = [flowsync, direction, sync];
    values.iter().all(|&v| v >= 0.0 && v <= 1.0)
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_compute_flowsync_optimal() {
        let inputs = FlowSyncInputs {
            pulse_rate: 0.9,
            pulse_intensity: 0.85,
            balance_score: 0.88,
            field_currents: 0.92,
            field_orientation: 0.90,
            stability_score: 0.89,
            integrity_score: 0.87,
        };
        let result = compute_flowsync(&inputs);
        assert!(result.is_ok());
        let (flowsync, direction, sync) = result.unwrap();
        assert!(flowsync > 0.8);
        assert!(direction > 0.8);
        assert!(sync > 0.8);
    fn test_compute_flowsync_low() {
            pulse_rate: 0.3,
            pulse_intensity: 0.25,
            balance_score: 0.35,
            field_currents: 0.30,
            field_orientation: 0.28,
            stability_score: 0.32,
            integrity_score: 0.34,
        assert!(flowsync < 0.5);
        assert!(direction < 0.5);
        assert!(sync < 0.5);
    fn test_flowsync_score_formula() {
            pulse_rate: 0.8,
            pulse_intensity: 0.7,
            balance_score: 0.75,
            field_currents: 0.72,
            field_orientation: 0.78,
            stability_score: 0.82,
            integrity_score: 0.76,
        let (flowsync, _, _) = result.unwrap();
        // Vérification formule : 25% pulse + 25% balance + 25% stability + 25% integrity
        let expected = (0.8 + 0.75 + 0.82 + 0.76) / 4.0;
        assert!(flowsync - expected.abs() < 0.01);
    fn test_direction_factor_formula() {
            pulse_rate: 0.5,
            pulse_intensity: 0.5,
            balance_score: 0.5,
            field_currents: 0.7,
            field_orientation: 0.9,
            stability_score: 0.5,
            integrity_score: 0.5,
        let (_, direction, _) = result.unwrap();
        // 50% orientation + 50% currents
        let expected = (0.9 + 0.7) / 2.0;
        assert!(direction - expected.abs() < 0.01);
    fn test_sync_quality_formula() {
            pulse_rate: 0.6,
            pulse_intensity: 0.8,
            balance_score: 0.7,
            field_currents: 0.65,
            field_orientation: 0.68,
            stability_score: 0.75,
            integrity_score: 0.72,
        let (_, _, sync) = result.unwrap();
        // 40% intensity + 30% balance + 30% stability
        let expected = 0.8 * 0.4 + 0.7 * 0.3 + 0.75 * 0.3;
        assert!(sync - expected.abs() < 0.01);
    fn test_clamp_enforcement() {
            pulse_rate: 1.0,
            pulse_intensity: 1.0,
            balance_score: 1.0,
            field_currents: 1.0,
            field_orientation: 1.0,
            stability_score: 1.0,
            integrity_score: 1.0,
        assert!(flowsync <= 1.0 && flowsync >= 0.0);
        assert!(direction <= 1.0 && direction >= 0.0);
        assert!(sync <= 1.0 && sync >= 0.0);
