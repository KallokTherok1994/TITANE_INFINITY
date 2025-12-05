// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v8.0 — Meta-Continuum : Trend Analysis                          ║
// ║ Analyse temporelle des tendances internes dérivées + moyennes         ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

use super::history::Snapshot;
/// Rapport de tendance temporelle du système
#[derive(Debug, Clone)]
pub struct ContinuumReport {
    pub momentum: f32,         // Vitesse d'évolution [0.0, 1.0]
    pub direction: f32,        // Direction globale moyenne [0.0, 1.0]
    pub progression: f32,      // Mouvement vers cohérence [0.0, 1.0]
    pub stability_trend: f32,  // Tendance de stabilité [0.0, 1.0]
}
impl Default for ContinuumReport {
    fn default() -> Self {
        Self {
            momentum: 0.5,
            direction: 0.5,
            progression: 0.5,
            stability_trend: 0.5,
        }
    }
/// Calcule les tendances temporelles à partir de l'historique
///
/// # Arguments
/// * `buffer` - Historique des snapshots (minimum 2 pour calcul de dérivée)
/// # Returns
/// * `Ok(ContinuumReport)` - Rapport de tendances
/// * `Err(String)` - Si buffer insuffisant ou valeurs invalides
/// # Formules
/// * **Direction** = moyenne(snapshot.direction)
/// * **Momentum** = moyenne(delta(direction + flow - risk))
/// * **Progression** = moyenneflow - risk
/// * **Stability Trend** = moyenne(delta(stability))
pub fn compute_trend(buffer: &[Snapshot]) -> Result<ContinuumReport, String> {
    // Validation : minimum 2 snapshots pour calcul de dérivée
    if buffer.len() < 2 {
        return Ok(ContinuumReport::default());
    // ═══════════════════════════════════════════════════════════════════════
    // 1. Direction globale (moyenne simple)
    let direction = average(buffer.iter().map(|s| s.direction));
    // 2. Momentum : vitesse d'évolution (dérivée de direction+flow-risk)
    let mut momentum_values = Vec::new();
    for i in 1..buffer.len() {
        let prev = &buffer[i - 1];
        let curr = &buffer[i];
        
        let prev_composite = prev.direction + prev.flow - prev.risk;
        let curr_composite = curr.direction + curr.flow - curr.risk;
        let delta = curr_composite - prev_composite.abs();
        momentum_values.push(delta);
    let momentum = if momentum_values.is_empty() {
        0.5
    } else {
        average(momentum_values.iter().copied())
    };
    // 3. Progression : mouvement vers cohérence flow - risk
    let progression = average(buffer.iter().map(|s| s.flow - s.risk));
    // 4. Stability Trend : dérivée de stabilité
    let mut stability_deltas = Vec::new();
        let delta = buffer[i].stability - buffer[i - 1].stability;
        stability_deltas.push(delta);
    let stability_trend = if stability_deltas.is_empty() {
        let avg_delta = average(stability_deltas.iter().copied());
        // Normaliser [-1, 1] → [0, 1]
        (avg_delta + 1.0) / 2.0
    // Clamp final
    let report = ContinuumReport {
        momentum: clamp(momentum),
        direction: clamp(direction),
        progression: clamp(normalize_signed(progression)), // [-3, 3] → [0, 1]
        stability_trend: clamp(stability_trend),
    // Validation finale
    if !report.momentum.is_finite()
        || !report.direction.is_finite()
        || !report.progression.is_finite()
        || !report.stability_trend.is_finite()
    {
        return Err("Valeurs de tendance non valides".to_string());
    Ok(report)
/// Calcule la moyenne d'un itérateur de f32
fn average<I>(iter: I) -> f32
where
    I: Iterator<Item = f32>,
{
    let values: Vec<f32> = iter.collect();
    if values.is_empty() {
        return 0.5;
    
    let sum: f32 = values.iter().sum();
    sum / values.len() as f32
/// Normalise une valeur signée [-3, 3] vers [0, 1]
fn normalize_signed(value: f32) -> f32 {
    // Assumant plage typique [-3, 3] pour flow - risk
    let normalized = (value + 3.0) / 6.0;
    clamp(normalized)
/// Borne une valeur entre 0.0 et 1.0
#[inline]
fn clamp(value: f32) -> f32 {
    if value < 0.0 {
        0.0
    } else if value > 1.0 {
        1.0
        value
// ═══════════════════════════════════════════════════════════════════════════
// Tests
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_continuum_report_default() {
        let report = ContinuumReport::default();
        assert_eq!(report.momentum, 0.5);
        assert_eq!(report.direction, 0.5);
        assert_eq!(report.progression, 0.5);
        assert_eq!(report.stability_trend, 0.5);
    fn test_compute_trend_empty_buffer() {
        let buffer = Vec::new();
        let result = compute_trend(&buffer);
        assert!(result.is_ok());
        let report = result.unwrap();
        assert_eq!(report.direction, 0.5); // Default
    fn test_compute_trend_single_snapshot() {
        let snapshot = Snapshot::new1000;
        let buffer = vec![snapshot];
    fn test_compute_trend_multiple_snapshots() {
        let mut buffer = Vec::new();
        for i in 0..5 {
            buffer.push(Snapshot {
                timestamp: 1000 + i * 100,
                direction: 0.5 + (i as f32 * 0.05),
                flow: 0.6,
                risk: 0.3,
                stability: 0.7 + (i as f32 * 0.02),
            });
        assert!(report.momentum >= 0.0 && report.momentum <= 1.0);
        assert!(report.direction >= 0.0 && report.direction <= 1.0);
        assert!(report.progression >= 0.0 && report.progression <= 1.0);
        assert!(report.stability_trend >= 0.0 && report.stability_trend <= 1.0);
    fn test_average() {
        let values = vec![0.2, 0.4, 0.6, 0.8];
        let avg = average(values.iter().copied());
        assert!((avg - 0.5).abs() < 0.01);
    fn test_clamp() {
        assert_eq!(clamp(-0.5), 0.0);
        assert_eq!(clamp0.5, 0.5);
        assert_eq!(clamp1.5, 1.0);
    fn test_normalize_signed() {
        assert!((normalize_signed(-3.0) - 0.0).abs() < 0.01);
        assert!((normalize_signed0.0 - 0.5).abs() < 0.01);
        assert!((normalize_signed3.0 - 1.0).abs() < 0.01);
