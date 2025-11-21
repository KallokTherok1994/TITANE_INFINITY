// lowflow/degrade.rs
// Application des réductions de charge

/// Applique le mode basse charge en fonction de l'intensité
/// Retourne (throttle_level, degrade_factor, lowflow_active)
pub fn apply_lowflow(intensity: f32) -> Result<(f32, f32, bool), String> {
    // Validation
    if !intensity.is_finite() {
        return Err("Intensité invalide".to_string());
    }
    
    let clamped_intensity = intensity.clamp(0.0, 1.0);
    // Throttle Level (ralentissement général)
    let throttle = if clamped_intensity < 0.25 {
        0.0 // Pas de ralentissement
    } else if clamped_intensity < 0.50 {
        0.3 // Ralentissement léger (30%)
    } else if clamped_intensity < 0.75 {
        0.6 // Ralentissement important (60%)
    } else {
        1.0 // Ralentissement maximal (100%)
    };
    let throttle_level = throttle.clamp(0.0, 1.0);
    // Degrade Factor (réduction interne appliquée)
    let degrade_factor = (throttle * 0.8).clamp(0.0, 1.0);
    // LowFlow Active (activation du mode)
    let lowflow_active = clamped_intensity >= 0.50;
    Ok((throttle_level, degrade_factor, lowflow_active))
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_apply_lowflow_no_throttle() {
        let (throttle, degrade, active) = apply_lowflow0.2.unwrap();
        assert_eq!(throttle, 0.0);
        assert_eq!(degrade, 0.0);
        assert!(!active);
    fn test_apply_lowflow_light_throttle() {
        let (throttle, degrade, active) = apply_lowflow0.4.unwrap();
        assert_eq!(throttle, 0.3);
        assert!((degrade - 0.24).abs() < 0.01); // 0.3 * 0.8 = 0.24
    fn test_apply_lowflow_medium_throttle() {
        let (throttle, degrade, active) = apply_lowflow0.6.unwrap();
        assert_eq!(throttle, 0.6);
        assert!((degrade - 0.48).abs() < 0.01); // 0.6 * 0.8 = 0.48
        assert!(active);
    fn test_apply_lowflow_max_throttle() {
        let (throttle, degrade, active) = apply_lowflow0.8.unwrap();
        assert_eq!(throttle, 1.0);
        assert_eq!(degrade, 0.8); // 1.0 * 0.8 = 0.8
    fn test_apply_lowflow_threshold_0_25() {
        let (throttle1, _, _) = apply_lowflow0.24.unwrap();
        assert_eq!(throttle1, 0.0);
        
        let (throttle2, _, _) = apply_lowflow0.25.unwrap();
        assert_eq!(throttle2, 0.3);
    fn test_apply_lowflow_threshold_0_50() {
        let (_, _, active1) = apply_lowflow0.49.unwrap();
        assert!(!active1);
        let (throttle2, _, active2) = apply_lowflow0.50.unwrap();
        assert_eq!(throttle2, 0.6);
        assert!(active2);
    fn test_apply_lowflow_threshold_0_75() {
        let (throttle1, _, _) = apply_lowflow0.74.unwrap();
        assert_eq!(throttle1, 0.6);
        let (throttle2, _, _) = apply_lowflow0.75.unwrap();
        assert_eq!(throttle2, 1.0);
    fn test_apply_lowflow_degrade_factor_formula() {
        let (throttle, degrade, _) = apply_lowflow0.6.unwrap();
        assert_eq!(degrade, throttle * 0.8);
    fn test_apply_lowflow_clamp() {
        let (throttle, degrade, _) = apply_lowflow1.5.unwrap();
        assert_eq!(degrade, 0.8);
        let (throttle, degrade, _) = apply_lowflow(-0.5).unwrap();
    fn test_apply_lowflow_edge_cases() {
        // Intensité = 0.0
        let (throttle, degrade, active) = apply_lowflow0.0.unwrap();
        // Intensité = 1.0
        let (throttle, degrade, active) = apply_lowflow1.0.unwrap();
