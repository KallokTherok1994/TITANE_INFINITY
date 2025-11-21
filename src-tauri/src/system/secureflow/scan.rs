// secureflow/scan.rs
// Évaluation de la situation globale et calcul du stress

use crate::system::kernel::KernelState;
use crate::system::cortex_sync::CortexSyncState;
use crate::system::ans::ANSState;
use crate::system::field::FieldState;
/// Rapport d'évaluation du SecureFlow
#[derive(Debug, Clone)]
pub struct SecureFlowReport {
    pub stress_index: f32,
}
impl Default for SecureFlowReport {
    fn default() -> Self {
        Self {
            stress_index: 0.3,
        }
    }
impl SecureFlowReport {
    fn clamp(mut self) -> Self {
        self.stress_index = self.stress_index.clamp(0.0, 1.0);
        self
/// Scanne le risque global du système
pub fn scan_risk(
    kernel: &KernelState,
    cortex: &CortexSyncState,
    ans: &ANSState,
    field: &FieldState,
) -> Result<SecureFlowReport, String> {
    // Calcul du stress_index basé sur 5 facteurs
    // Le stress représente le risque global en fonction de:
    // - surcharge (kernel.overload_risk)
    // - perte d'identité (1.0 - kernel.identity_stability)
    // - perte d'intégrité (1.0 - kernel.core_integrity)
    // - tension réflexe (ans.tension_level)
    // - turbulence intérieure (field.turbulence)
    
    let stress_index = (kernel.overload_risk
        + (1.0 - kernel.identity_stability)
        + (1.0 - kernel.core_integrity)
        + ans.tension_level
        + field.turbulence)
        / 5.0;
        // Validation: toutes les valeurs doivent être finies
    if !stress_index.is_finite() {
        return Err("Calcul de stress invalide".to_string());
    Ok(SecureFlowReport { stress_index }.clamp())
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_secureflow_report_default() {
        let report = SecureFlowReport::default();
        assert_eq!(report.stress_index, 0.3);
    fn test_secureflow_report_clamp() {
        let report = SecureFlowReport {
            stress_index: 1.5,
        .clamp();
        assert_eq!(report.stress_index, 1.0);
            stress_index: -0.5,
        assert_eq!(report.stress_index, 0.0);
    fn test_scan_risk_formula() {
        use crate::system::kernel::KernelState;
        use crate::system::cortex_sync::CortexSyncState;
        use crate::system::ans::ANSState;
        use crate::system::field::FieldState;
        let kernel = KernelState {
            initialized: true,
            identity_stability: 0.8,  // loss = 0.2
            core_integrity: 0.7,      // loss = 0.3
            adaptive_reserve: 0.6,
            overload_risk: 0.4,       // risk = 0.4
            last_update: 0,
        };
        let cortex = CortexSyncState {
            global_clarity: 0.7,
            harmonic_balance: 0.7,
            coherence: 0.7,
            alert_level: 0.2,
        let ans = ANSState {
            tension_level: 0.3,       // tension = 0.3
            load_level: 0.4,
        let field = FieldState {
            currents: 0.5,
            pressure: 0.5,
            turbulence: 0.2,          // turbulence = 0.2
            orientation: 0.7,
        let report = scan_risk(&kernel, &cortex, &ans, &field).unwrap();
        // stress = (0.4 + 0.2 + 0.3 + 0.3 + 0.2) / 5 = 1.4 / 5 = 0.28
        let expected = (0.4 + 0.2 + 0.3 + 0.3 + 0.2) / 5.0;
        assert!((report.stress_index - expected).abs() < 0.01);
    fn test_scan_risk_low_stress() {
            identity_stability: 0.9,
            core_integrity: 0.9,
            adaptive_reserve: 0.8,
            overload_risk: 0.1,
            global_clarity: 0.8,
            harmonic_balance: 0.8,
            coherence: 0.8,
            alert_level: 0.1,
            tension_level: 0.1,
            load_level: 0.2,
            currents: 0.6,
            pressure: 0.3,
            turbulence: 0.1,
            orientation: 0.8,
        // Optimal conditions → low stress
        assert!(report.stress_index < 0.3, "Low stress expected");
    fn test_scan_risk_high_stress() {
            identity_stability: 0.3,
            core_integrity: 0.3,
            adaptive_reserve: 0.2,
            overload_risk: 0.8,
            global_clarity: 0.3,
            harmonic_balance: 0.3,
            coherence: 0.3,
            alert_level: 0.7,
            tension_level: 0.8,
            load_level: 0.9,
            currents: 0.4,
            pressure: 0.8,
            turbulence: 0.8,
            orientation: 0.3,
        // Critical conditions → high stress
        assert!(report.stress_index > 0.6, "High stress expected");
