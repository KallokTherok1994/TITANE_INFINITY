// secureflow/stabilize.rs
// Application de mesures d'atténuation basées sur le stress

/// Applique la mitigation en fonction du stress_index
/// Retourne (mitigation_level, safe_mode)
pub fn apply_mitigation(stress_index: f32) -> Result<(f32, bool), String> {
    // Validation
    if !stress_index.is_finite() {
        return Err("Indice de stress invalide".to_string());
    }
    let stress = stress_index.clamp(0.0, 1.0);
    // Mitigation Level (atténuation progressive)
    let mitigation = if stress < 0.30 {
        0.0 // Stress faible: aucune mitigation
    } else if stress < 0.60 {
        0.3 // Stress modéré: mitigation légère
    } else if stress < 0.80 {
        0.6 // Stress élevé: mitigation importante
    } else {
        1.0 // Stress critique: mitigation maximale
    };
    let mitigation_level = mitigation.clamp(0.0, 1.0);
    // Safe mode (signal de haute tension interne)
    let safe_mode = stress >= 0.85;
    Ok((mitigation_level, safe_mode))
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_apply_mitigation_no_stress() {
        let (mitigation, safe_mode) = apply_mitigation0.2.unwrap();
        assert_eq!(mitigation, 0.0);
        assert!(!safe_mode);
    fn test_apply_mitigation_low_stress() {
        let (mitigation, safe_mode) = apply_mitigation0.4.unwrap();
        assert_eq!(mitigation, 0.3);
    fn test_apply_mitigation_medium_stress() {
        let (mitigation, safe_mode) = apply_mitigation0.7.unwrap();
        assert_eq!(mitigation, 0.6);
    fn test_apply_mitigation_high_stress() {
        let (mitigation, safe_mode) = apply_mitigation0.85.unwrap();
        assert_eq!(mitigation, 1.0);
        assert!(safe_mode);
    fn test_apply_mitigation_critical_stress() {
        let (mitigation, safe_mode) = apply_mitigation0.95.unwrap();
    fn test_apply_mitigation_boundary_30() {
        let (mitigation, _) = apply_mitigation0.29.unwrap();
        let (mitigation, _) = apply_mitigation0.30.unwrap();
    fn test_apply_mitigation_boundary_60() {
        let (mitigation, _) = apply_mitigation0.59.unwrap();
        let (mitigation, _) = apply_mitigation0.60.unwrap();
    fn test_apply_mitigation_boundary_80() {
        let (mitigation, _) = apply_mitigation0.79.unwrap();
        let (mitigation, _) = apply_mitigation0.80.unwrap();
    fn test_apply_mitigation_boundary_85() {
        let (_, safe_mode) = apply_mitigation0.84.unwrap();
        let (_, safe_mode) = apply_mitigation0.85.unwrap();
    fn test_apply_mitigation_clamp() {
        // Test valeurs hors limites
        let (mitigation, _) = apply_mitigation(-0.5).unwrap();
        let (mitigation, safe_mode) = apply_mitigation1.5.unwrap();
