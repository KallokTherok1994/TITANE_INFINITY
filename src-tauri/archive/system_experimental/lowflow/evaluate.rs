// lowflow/evaluate.rs
// Analyse des besoins de réduction de charge

use crate::system::secureflow::SecureFlowState;
use crate::system::kernel::KernelState;
use crate::system::cortex_sync::CortexSyncState;
/// Signal indiquant l'intensité du besoin de mode basse charge
#[derive(Debug, Clone)]
pub struct LowFlowSignal {
    pub intensity: f32,
}
impl Default for LowFlowSignal {
    fn default() -> Self {
        Self { intensity: 0.3 }
    }
impl LowFlowSignal {
    fn clamp(mut self) -> Self {
        self.intensity = self.intensity.clamp(0.0, 1.0);
        self
/// Évalue le besoin de mode basse charge
pub fn evaluate_need(
    secureflow: &SecureFlowState,
    kernel: &KernelState,
    cortex: &CortexSyncState,
) -> Result<LowFlowSignal, String> {
    // L'intensité dépend de 3 facteurs:
    // - stress global (SecureFlow)
    // - surcharge système (Kernel)
    // - alerte interne (Cortex)
    
    let stress = secureflow.stress_index;
    let overload = kernel.overload_risk;
    let alert = cortex.alert_level;
    // Formule: moyenne des 3 indicateurs de danger
    let intensity = (stress + overload + alert) / 3.0;
    // Validation
    if !intensity.is_finite() {
        return Err("Calcul d'intensité invalide".to_string());
    Ok(LowFlowSignal { intensity }.clamp())
#[cfg(test)]
mod tests {
    use super::*;
    use crate::system::secureflow::SecureFlowState;
    use crate::system::kernel::KernelState;
    use crate::system::cortex_sync::CortexSyncState;
    #[test]
    fn test_lowflow_signal_default() {
        let signal = LowFlowSignal::default();
        assert_eq!(signal.intensity, 0.3);
    fn test_evaluate_need_low_intensity() {
        let mut secureflow = SecureFlowState::new();
        secureflow.stress_index = 0.2;
        
        let mut kernel = KernelState::new();
        kernel.overload_risk = 0.1;
        let mut cortex = CortexSyncState::new();
        cortex.alert_level = 0.15;
        let signal = evaluate_need(&secureflow, &kernel, &cortex).unwrap();
        // (0.2 + 0.1 + 0.15) / 3 = 0.15
        assert!((signal.intensity - 0.15).abs() < 0.01);
        assert!(signal.intensity < 0.25);
    fn test_evaluate_need_high_intensity() {
        secureflow.stress_index = 0.8;
        kernel.overload_risk = 0.9;
        cortex.alert_level = 0.85;
        // (0.8 + 0.9 + 0.85) / 3 = 0.85
        assert!((signal.intensity - 0.85).abs() < 0.01);
        assert!(signal.intensity > 0.75);
    fn test_evaluate_need_formula() {
        secureflow.stress_index = 0.5;
        kernel.overload_risk = 0.6;
        cortex.alert_level = 0.4;
        let expected = (0.5 + 0.6 + 0.4) / 3.0; // = 0.5
        assert!((signal.intensity - expected).abs() < 0.01);
    fn test_lowflow_signal_clamp() {
        let signal = LowFlowSignal { intensity: 1.5 }.clamp();
        assert_eq!(signal.intensity, 1.0);
        let signal = LowFlowSignal { intensity: -0.5 }.clamp();
        assert_eq!(signal.intensity, 0.0);
