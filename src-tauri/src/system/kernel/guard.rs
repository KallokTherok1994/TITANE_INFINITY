// kernel/guard.rs
// Évaluation des invariants + risques du Kernel

use super::identity::KernelInputs;
/// Rapport d'évaluation du Kernel Profond
#[derive(Debug, Clone)]
pub struct KernelReport {
    pub identity_stability: f32,
    pub core_integrity: f32,
    pub adaptive_reserve: f32,
    pub overload_risk: f32,
}
impl Default for KernelReport {
    fn default() -> Self {
        Self {
            identity_stability: 0.7,
            core_integrity: 0.7,
            adaptive_reserve: 0.6,
            overload_risk: 0.3,
        }
    }
impl KernelReport {
    fn clamp(mut self) -> Self {
        self.identity_stability = self.identity_stability.clamp(0.0, 1.0);
        self.core_integrity = self.core_integrity.clamp(0.0, 1.0);
        self.adaptive_reserve = self.adaptive_reserve.clamp(0.0, 1.0);
        self.overload_risk = self.overload_risk.clamp(0.0, 1.0);
        self
/// Évalue les invariants du kernel et calcule les risques
pub fn evaluate_kernel(inputs: &KernelInputs) -> Result<KernelReport, String> {
    // 1. Identity stability
    // À quel point l'identité du système reste cohérente dans le temps
    let identity_stability = (inputs.coherence + inputs.clarity + (1.0 - inputs.stability_trend)) / 3.0;
    // 2. Core integrity
    // Solidité structurelle globale
    let core_integrity =
        ((1.0 - inputs.turbulence) + inputs.swarm_consensus + (1.0 - inputs.pressure)) / 3.0;
    // 3. Adaptive reserve
    // Capacité encore disponible pour gérer plus de charge
    let adaptive_reserve =
        ((1.0 - inputs.load_level) + (1.0 - inputs.tension) + inputs.momentum) / 3.0;
    // 4. Overload risk
    // Risque que le système soit en surcharge globale
    let overload_risk =
        (inputs.load_level + inputs.tension + inputs.pressure + inputs.turbulence) / 4.0;
    // Validation
    if !identity_stability.is_finite()
        || !core_integrity.is_finite()
        || !adaptive_reserve.is_finite()
        || !overload_risk.is_finite()
    {
        return Err("Invalid kernel evaluation".to_string());
    Ok(KernelReport {
        identity_stability,
        core_integrity,
        adaptive_reserve,
        overload_risk,
    .clamp())
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_kernel_report_default() {
        let report = KernelReport::default();
        assert_eq!(report.identity_stability, 0.7);
        assert_eq!(report.core_integrity, 0.7);
        assert_eq!(report.adaptive_reserve, 0.6);
        assert_eq!(report.overload_risk, 0.3);
    fn test_evaluate_kernel_optimal() {
        let inputs = KernelInputs {
            clarity: 0.8,
            coherence: 0.8,
            stability_trend: 0.2, // low trend = stable
            momentum: 0.7,
            pressure: 0.2,
            turbulence: 0.1,
            depth: 0.6,
            tension: 0.2,
            load_level: 0.2,
            swarm_consensus: 0.9,
        };
        let report = evaluate_kernel(&inputs).unwrap();
        // High clarity + coherence + stable trend → high identity_stability
        assert!(report.identity_stability > 0.7, "Identity stability should be high");
        // Low turbulence + high consensus + low pressure → high core_integrity
        assert!(report.core_integrity > 0.7, "Core integrity should be high");
        // Low load + low tension + good momentum → high adaptive_reserve
        assert!(report.adaptive_reserve > 0.6, "Adaptive reserve should be high");
        // Low load + tension + pressure + turbulence → low overload_risk
        assert!(report.overload_risk < 0.3, "Overload risk should be low");
    fn test_evaluate_kernel_overloaded() {
            clarity: 0.3,
            coherence: 0.3,
            stability_trend: 0.8, // high trend = unstable
            momentum: 0.2,
            pressure: 0.9,
            turbulence: 0.8,
            depth: 0.4,
            tension: 0.9,
            load_level: 0.9,
            swarm_consensus: 0.2,
        // Low clarity + coherence + unstable trend → low identity_stability
        assert!(report.identity_stability < 0.5, "Identity stability should be low");
        // High turbulence + low consensus + high pressure → low core_integrity
        assert!(report.core_integrity < 0.4, "Core integrity should be low");
        // High load + tension + low momentum → low adaptive_reserve
        assert!(report.adaptive_reserve < 0.3, "Adaptive reserve should be low");
        // High load + tension + pressure + turbulence → high overload_risk
        assert!(report.overload_risk > 0.7, "Overload risk should be high");
    fn test_evaluate_kernel_formulas() {
            clarity: 0.6,
            coherence: 0.7,
            stability_trend: 0.4,
            momentum: 0.5,
            pressure: 0.5,
            turbulence: 0.3,
            depth: 0.5,
            tension: 0.4,
            load_level: 0.3,
            swarm_consensus: 0.6,
        // Vérification des formules exactes
        let expected_identity = (0.7 + 0.6 + (1.0 - 0.4)) / 3.0; // = 0.6333
        let expected_integrity = ((1.0 - 0.3) + 0.6 + (1.0 - 0.5)) / 3.0; // = 0.6
        let expected_reserve = ((1.0 - 0.3) + (1.0 - 0.4) + 0.5) / 3.0; // = 0.6
        let expected_overload = (0.3 + 0.4 + 0.5 + 0.3) / 4.0; // = 0.375
        assert!((report.identity_stability - expected_identity).abs() < 0.01);
        assert!((report.core_integrity - expected_integrity).abs() < 0.01);
        assert!((report.adaptive_reserve - expected_reserve).abs() < 0.01);
        assert!((report.overload_risk - expected_overload).abs() < 0.01);
    fn test_kernel_report_clamp() {
        let report = KernelReport {
            identity_stability: 1.5,
            core_integrity: -0.3,
            adaptive_reserve: 2.0,
            overload_risk: -1.0,
        .clamp();
        assert_eq!(report.identity_stability, 1.0);
        assert_eq!(report.core_integrity, 0.0);
        assert_eq!(report.adaptive_reserve, 1.0);
        assert_eq!(report.overload_risk, 0.0);
    fn test_evaluate_kernel_balanced() {
            clarity: 0.5,
            coherence: 0.5,
            stability_trend: 0.5,
            turbulence: 0.5,
            tension: 0.5,
            load_level: 0.5,
            swarm_consensus: 0.5,
        // Tous les indicateurs devraient être équilibrés autour de 0.5
        assert!((report.identity_stability - 0.5).abs() < 0.1);
        assert!((report.core_integrity - 0.5).abs() < 0.1);
        assert!((report.adaptive_reserve - 0.5).abs() < 0.1);
        assert!((report.overload_risk - 0.5).abs() < 0.1);
