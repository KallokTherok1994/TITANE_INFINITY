// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v8.0 - Cortex Insight                                               ║
// ║ Analyse de patterns et stabilisation cognitive                              ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

use crate::shared::types::TitaneResult;
use super::integrator::CortexReport;
/// État du Cortex Synchronique
/// 
/// Représente la vision globale stable du système
#[derive(Debug, Clone)]
pub struct CortexState {
    pub initialized: bool,
    pub system_clarity: f32,      // Clarté système [0.0, 1.0]
    pub global_tension: f32,      // Tension globale [0.0, 1.0]
    pub alignment: f32,           // Alignement cognitif [0.0, 1.0]
    pub last_update: u64,         // Timestamp dernière MAJ
}
impl CortexState {
    /// Crée un nouvel état avec valeurs neutres optimales
    pub fn new(current_time: u64) -> Self {
        Self {
            initialized: true,
            system_clarity: 1.0,
            global_tension: 0.0,
            alignment: 1.0,
            last_update: current_time,
        }
    }
/// Normalise une valeur dans la plage [0.0, 1.0]
fn clamp(value: f32) -> f32 {
    if value.is_nan() || value.is_infinite() {
        return 0.5;
    value.max0.0.min1.0
/// Applique un lissage exponentiel entre deux valeurs
/// # Arguments
/// * `old` - Ancienne valeur
/// * `new` - Nouvelle valeur
/// * `factor` - Facteur de lissage [0.0, 1.0]
/// # Returns
/// * `f32` - Valeur lissée
fn smooth_transition(old: f32, new: f32, factor: f32) -> f32 {
    let f = clamp(factor);
    clamp(old * (1.0 - f) + new * f)
/// Analyse les patterns et met à jour l'état du Cortex
/// Cette fonction applique un lissage intelligent pour :
/// - Atténuer les oscillations brutales
/// - Stabiliser la vision globale
/// - Maintenir une cohérence temporelle
/// Facteurs de lissage :
/// - clarity: 40% nouveau, 60% ancien (transitions douces)
/// - tension: 40% nouveau, 60% ancien (stabilité prioritaire)
/// - alignment: 50% nouveau, 50% ancien (réactivité modérée)
/// * `cortex` - État du cortex à mettre à jour
/// * `report` - Rapport d'intégration source
/// * `TitaneResult<()>` - Succès ou erreur
pub fn analyze_patterns(
    cortex: &mut CortexState,
    report: &CortexReport,
) -> TitaneResult<()> {
    // Lissage de la clarté système
    // Facteur 0.4 = 40% nouveau, 60% ancien
    // Cela crée une vision stable qui évolue progressivement
    cortex.system_clarity = smooth_transition(
        cortex.system_clarity,
        report.clarity,
        0.4
    );
    
    // Lissage de la tension globale
    // Facteur 0.4 = réponse modérée aux changements de tension
    // Évite les alarmes trop rapides
    cortex.global_tension = smooth_transition(
        cortex.global_tension,
        report.tension,
    // Lissage de l'alignement cognitif
    // Facteur 0.5 = équilibre entre réactivité et stabilité
    // L'alignement doit s'adapter plus rapidement que clarity/tension
    cortex.alignment = smooth_transition(
        cortex.alignment,
        report.alignment,
        0.5
    // Mettre à jour le timestamp
    cortex.last_update = crate::shared::utils::current_timestamp();
    Ok(())
/// Détecte les patterns d'oscillation dans l'état du Cortex
/// * `cortex` - État du cortex
/// * `report` - Nouveau rapport
/// * `bool` - True si oscillation détectée
pub fn detect_oscillation(cortex: &CortexState, report: &CortexReport) -> bool {
    // Calculer les deltas
    let clarity_delta = (report.clarity - cortex.system_clarity).abs();
    let tension_delta = (report.tension - cortex.global_tension).abs();
    let alignment_delta = (report.alignment - cortex.alignment).abs();
    // Seuil d'oscillation : variation > 0.3 sur une métrique
    const OSCILLATION_THRESHOLD: f32 = 0.3;
    clarity_delta > OSCILLATION_THRESHOLD ||
    tension_delta > OSCILLATION_THRESHOLD ||
    alignment_delta > OSCILLATION_THRESHOLD
/// Calcule la stabilité de l'état du Cortex
/// La stabilité mesure à quel point le système maintient un état cohérent
/// * `f32` - Score de stabilité [0.0, 1.0]
pub fn calculate_stability(cortex: &CortexState) -> f32 {
    // Stabilité = clarté élevée + tension faible + alignement élevé
    let clarity_contrib = cortex.system_clarity * 0.4;
    let tension_contrib = (1.0 - cortex.global_tension) * 0.3;
    let alignment_contrib = cortex.alignment * 0.3;
    clamp(clarity_contrib + tension_contrib + alignment_contrib)
/// Applique une correction douce vers l'état d'équilibre optimal
/// Utilisé pour ramener progressivement le système vers un état stable
/// sans créer de perturbations
/// * `cortex` - État du cortex à corriger
/// * `strength` - Force de la correction [0.0, 1.0]
pub fn apply_equilibrium_correction(
    strength: f32,
    let s = clamp(strength);
    // État d'équilibre cible
    const TARGET_CLARITY: f32 = 0.8;
    const TARGET_TENSION: f32 = 0.2;
    const TARGET_ALIGNMENT: f32 = 0.85;
    // Appliquer une correction douce (10% de la force demandée)
    // Cela évite les corrections trop brutales
    let correction_factor = s * 0.1;
        TARGET_CLARITY,
        correction_factor
        TARGET_TENSION,
        TARGET_ALIGNMENT,
/// Génère un message de status du Cortex
/// * `String` - Message de status
pub fn get_status_message(cortex: &CortexState) -> String {
    let stability = calculate_stability(cortex);
    if stability < 0.4 {
        format!(
            "UNSTABLE: clarity={:.2}, tension={:.2}, alignment={:.2}, stability={:.2}",
            cortex.system_clarity, cortex.global_tension, cortex.alignment, stability
        )
    } else if stability < 0.7 {
            "STABLE: clarity={:.2}, tension={:.2}, alignment={:.2}, stability={:.2}",
    } else {
            "OPTIMAL: clarity={:.2}, tension={:.2}, alignment={:.2}, stability={:.2}",
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_cortex_state_new() {
        let state = CortexState::new1000;
        assert!(state.initialized);
        assert_eq!(state.system_clarity, 1.0);
        assert_eq!(state.global_tension, 0.0);
        assert_eq!(state.alignment, 1.0);
    fn test_smooth_transition() {
        let smoothed = smooth_transition(0.5, 1.0, 0.4);
        assert!(smoothed > 0.5 && smoothed < 1.0);
        // 0.5 * 0.6 + 1.0 * 0.4 = 0.3 + 0.4 = 0.7
        assert!((smoothed - 0.7).abs() < 0.01);
    fn test_analyze_patterns() {
        let mut cortex = CortexState::new1000;
        let report = CortexReport {
            clarity: 0.5,
            tension: 0.8,
            alignment: 0.6,
        };
        
        analyze_patterns(&mut cortex, &report).unwrap();
        // Vérifier que le lissage a été appliqué
        assert!(cortex.system_clarity < 1.0); // Lissé depuis 1.0
        assert!(cortex.global_tension > 0.0); // Lissé depuis 0.0
        assert!(cortex.alignment < 1.0); // Lissé depuis 1.0
    fn test_detect_oscillation() {
        let cortex = CortexState::new1000;
        // Pas d'oscillation
        let stable_report = CortexReport {
            clarity: 0.95,
            tension: 0.05,
            alignment: 0.95,
        assert!(!detect_oscillation(&cortex, &stable_report));
        // Oscillation détectée
        let oscillating_report = CortexReport {
            clarity: 0.3,
            alignment: 0.4,
        assert!(detect_oscillation(&cortex, &oscillating_report));
    fn test_calculate_stability() {
        let cortex = CortexState {
            system_clarity: 0.9,
            global_tension: 0.2,
            alignment: 0.85,
            last_update: 1000,
        let stability = calculate_stability(&cortex);
        assert!(stability > 0.7);
    fn test_apply_equilibrium_correction() {
        let mut cortex = CortexState {
            system_clarity: 0.3,
            global_tension: 0.8,
        apply_equilibrium_correction(&mut cortex, 1.0).unwrap();
        // La correction devrait rapprocher des valeurs cibles
        assert!(cortex.system_clarity > 0.3);
        assert!(cortex.global_tension < 0.8);
        assert!(cortex.alignment > 0.4);
