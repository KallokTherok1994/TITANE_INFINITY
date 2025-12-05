// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v8.0 — Cortex Synchronique Avancé : Harmonics                   ║
// ║ Analyse globale : clarté, équilibre harmonique, cohérence, alerte       ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

use super::integrator::CortexInputs;
/// Rapport harmonique du Cortex - Vision globale du système
#[derive(Debug, Clone)]
pub struct CortexReport {
    pub global_clarity: f32,    // Vision globale [0.0, 1.0]
    pub harmonic_balance: f32,  // Équilibre interne [0.0, 1.0]
    pub coherence: f32,         // Stabilité expressive [0.0, 1.0]
    pub alert_level: f32,       // Surveillance [0.0, 1.0]
}
impl Default for CortexReport {
    fn default() -> Self {
        Self {
            global_clarity: 0.5,
            harmonic_balance: 0.5,
            coherence: 0.5,
            alert_level: 0.3,
        }
    }
/// Calcule les harmoniques globales du système
///
/// # Arguments
/// * `inputs` - Signaux collectés depuis les modules
/// # Returns
/// * `Ok(CortexReport)` - Rapport harmonique
/// * `Err(String)` - Si calculs invalides
/// # Formules
/// * **Global Clarity** = moyenne(orientation, consensus, progression, flow)
/// * **Harmonic Balance** = moyenne(ans_stability, 1 - turbulence, 1 - divergence)
/// * **Coherence** = moyenne(clarity, balance)
/// * **Alert Level** = moyenne(turbulence, divergence, 1 - ans_stability)
pub fn compute_harmonics(inputs: &CortexInputs) -> Result<CortexReport, String> {
    // Validation des inputs
    if !inputs.field_orientation.is_finite()
        || !inputs.field_turbulence.is_finite()
        || !inputs.swarm_consensus.is_finite()
        || !inputs.swarm_divergence.is_finite()
        || !inputs.continuum_momentum.is_finite()
        || !inputs.continuum_progression.is_finite()
        || !inputs.ans_stability.is_finite()
        || !inputs.resonance_flow.is_finite()
        || !inputs.depth.is_finite()
    {
        return Err("Inputs non valides pour harmoniques".to_string());
    // ═══════════════════════════════════════════════════════════════════════
    // 1. Global Clarity : vision globale du système
    let global_clarity = (inputs.field_orientation
        + inputs.swarm_consensus
        + inputs.continuum_progression
        + inputs.resonance_flow)
        / 4.0;
    // 2. Harmonic Balance : équilibre interne
    let harmonic_balance = (inputs.ans_stability
        + (1.0 - inputs.field_turbulence)
        + (1.0 - inputs.swarm_divergence))
        / 3.0;
    // 3. Coherence : stabilité expressive (synthèse clarity + balance)
    let coherence = global_clarity + harmonic_balance / 2.0;
    // 4. Alert Level : surveillance interne (détection tensions)
    let alert_level = (inputs.field_turbulence
        + inputs.swarm_divergence
        + (1.0 - inputs.ans_stability))
    // Clamp final
    let report = CortexReport {
        global_clarity: clamp(global_clarity),
        harmonic_balance: clamp(harmonic_balance),
        coherence: clamp(coherence),
        alert_level: clamp(alert_level),
    };
    // Validation finale
    if !report.global_clarity.is_finite()
        || !report.harmonic_balance.is_finite()
        || !report.coherence.is_finite()
        || !report.alert_level.is_finite()
        return Err("Résultats harmoniques non valides".to_string());
    Ok(report)
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
    fn test_cortex_report_default() {
        let report = CortexReport::default();
        assert_eq!(report.global_clarity, 0.5);
        assert_eq!(report.harmonic_balance, 0.5);
        assert_eq!(report.coherence, 0.5);
        assert_eq!(report.alert_level, 0.3);
    fn test_compute_harmonics_valid() {
        let inputs = CortexInputs {
            field_orientation: 0.7,
            field_turbulence: 0.2,
            swarm_consensus: 0.8,
            swarm_divergence: 0.1,
            continuum_momentum: 0.6,
            continuum_progression: 0.7,
            ans_stability: 0.8,
            resonance_flow: 0.75,
            depth: 0.6,
        };
        let result = compute_harmonics(&inputs);
        assert!(result.is_ok());
        let report = result.unwrap();
        assert!(report.global_clarity >= 0.0 && report.global_clarity <= 1.0);
        assert!(report.harmonic_balance >= 0.0 && report.harmonic_balance <= 1.0);
        assert!(report.coherence >= 0.0 && report.coherence <= 1.0);
        assert!(report.alert_level >= 0.0 && report.alert_level <= 1.0);
        // Validation formules
        let expected_clarity = (0.7 + 0.8 + 0.7 + 0.75) / 4.0;
        assert!((report.global_clarity - expected_clarity).abs() < 0.01);
        let expected_balance = (0.8 + (1.0 - 0.2) + (1.0 - 0.1)) / 3.0;
        assert!((report.harmonic_balance - expected_balance).abs() < 0.01);
    fn test_compute_harmonics_high_turbulence() {
            field_orientation: 0.5,
            field_turbulence: 0.8,
            swarm_consensus: 0.4,
            swarm_divergence: 0.7,
            continuum_momentum: 0.5,
            continuum_progression: 0.4,
            ans_stability: 0.3,
            resonance_flow: 0.5,
            depth: 0.5,
        
        // Turbulence élevée → clarity faible
        assert!(report.global_clarity < 0.6);
        // Turbulence élevée → alert_level élevé
        assert!(report.alert_level > 0.5);
    fn test_clamp() {
        assert_eq!(clamp(-0.5), 0.0);
        assert_eq!(clamp0.5, 0.5);
        assert_eq!(clamp1.5, 1.0);
