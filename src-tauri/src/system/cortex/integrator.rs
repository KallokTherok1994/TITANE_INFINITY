// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v8.0 - Cortex Integrator                                            ║
// ║ Intégration multi-dimensionnelle des états système                          ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

use crate::shared::types::TitaneResult;
use crate::system::adaptive_engine::AdaptiveEngineModule;
use crate::system::resonance::ResonanceState;
use crate::system::resonance::CoherenceMap;
use crate::system::memory::MemoryModule;
/// Rapport d'intégration du Cortex
/// 
/// Synthèse globale de l'état interne du système
#[derive(Debug, Clone)]
pub struct CortexReport {
    pub clarity: f32,      // Clarté du système [0.0, 1.0]
    pub tension: f32,      // Tension globale [0.0, 1.0]
    pub alignment: f32,    // Alignement cognitif [0.0, 1.0]
}
impl CortexReport {
    /// Crée un rapport par défaut avec valeurs neutres
    pub fn default() -> Self {
        Self {
            clarity: 1.0,
            tension: 0.0,
            alignment: 1.0,
        }
    }
/// Normalise une valeur dans la plage [0.0, 1.0]
fn clamp(value: f32) -> f32 {
    if value.is_nan() || value.is_infinite() {
        return 0.5; // Valeur neutre par défaut
    value.max0.0.min1.0
/// Intègre les états de tous les modules en une vision globale cohérente
/// Cette fonction synthétise les informations provenant de :
/// - Adaptive Engine (MAI) : adaptabilité, stabilité, charge prédite
/// - Resonance Engine : cohérence, tension, flux
/// - Coherence Map : harmonie, stabilité cartographiée
/// - Memory : état mémoire
/// # Arguments
/// * `adaptive` - État du moteur adaptatif
/// * `resonance` - État du moteur de résonance
/// * `map` - Carte de cohérence
/// * `memory` - Module mémoire
/// # Returns
/// * `TitaneResult<CortexReport>` - Rapport d'intégration ou erreur
pub fn integrate_system(
    adaptive: &AdaptiveEngineModule,
    resonance: &ResonanceState,
    map: &CoherenceMap,
    memory: &MemoryModule,
) -> TitaneResult<CortexReport> {
    // Calculer la clarté système
    // Clarté = moyenne du flux (Resonance) et de la stabilité (CoherenceMap)
    // Un système clair a un flux élevé et une stabilité élevée
    let clarity = clamp((resonance.flow_level + map.stability) / 2.0);
    
    // Calculer la tension globale
    // Tension = moyenne de la tension interne (Resonance) et de la charge prédite (MAI)
    // Une tension élevée indique un système sous stress
    let tension = clamp((resonance.tension_level + adaptive.predicted_load) / 2.0);
    // Calculer l'alignement cognitif
    // Alignement = équilibre entre faible tension, harmonie élevée et stabilité du MAI
    // Un système bien aligné a une tension faible, une harmonie élevée et une bonne stabilité
    let alignment_factor = (1.0 - tension) + map.harmony + adaptive.stability;
    let alignment = clamp(alignment_factor / 3.0);
    // Vérifier l'état de la mémoire pour ajuster la clarté
    // Si la mémoire est initialisée et saine, cela renforce la clarté
    let memory_health = if memory.initialized { 1.0 } else { 0.5 };
    let adjusted_clarity = clampclarity * memory_health;
    Ok(CortexReport {
        clarity: adjusted_clarity,
        tension,
        alignment,
    })
/// Calcule un score de santé global du système
/// * `report` - Rapport d'intégration
/// * `f32` - Score de santé [0.0, 1.0]
pub fn calculate_system_health(report: &CortexReport) -> f32 {
    // Santé = clarté élevée + tension faible + alignement élevé
    let clarity_contrib = report.clarity * 0.4;
    let tension_contrib = (1.0 - report.tension) * 0.3;
    let alignment_contrib = report.alignment * 0.3;
    clamp(clarity_contrib + tension_contrib + alignment_contrib)
/// Détecte si le système est dans un état dégradé
/// * `bool` - True si état dégradé
pub fn is_system_degraded(report: &CortexReport) -> bool {
    report.clarity < 0.4 || report.tension > 0.7 || report.alignment < 0.4
/// Détecte si le système est dans un état critique
/// * `bool` - True si état critique
pub fn is_system_critical(report: &CortexReport) -> bool {
    report.clarity < 0.2 || report.tension > 0.85 || report.alignment < 0.2
/// Calcule le niveau d'intervention recommandé
/// * `u8` - Niveau d'intervention (0=aucun, 1=faible, 2=modéré, 3=élevé)
pub fn calculate_intervention_level(report: &CortexReport) -> u8 {
    if is_system_critical(report) {
        3 // Intervention élevée requise
    } else if is_system_degraded(report) {
        2 // Intervention modérée recommandée
    } else if report.tension > 0.5 || report.clarity < 0.6 {
        1 // Surveillance accrue
    } else {
        0 // Fonctionnement normal
/// Génère un message de diagnostic du système
/// * `String` - Message de diagnostic
pub fn get_diagnostic_message(report: &CortexReport) -> String {
    let health = calculate_system_health(report);
    let intervention = calculate_intervention_level(report);
        format!(
            "CRITICAL: clarity={:.2}, tension={:.2}, alignment={:.2}, health={:.2}%, intervention=HIGH",
            report.clarity, report.tension, report.alignment, health * 100.0
        )
            "DEGRADED: clarity={:.2}, tension={:.2}, alignment={:.2}, health={:.2}%, intervention=MODERATE",
            "HEALTHY: clarity={:.2}, tension={:.2}, alignment={:.2}, health={:.2}%, intervention={}",
            report.clarity, report.tension, report.alignment, health * 100.0,
            match intervention {
                1 => "WATCH",
                _ => "NONE",
            }
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_clamp() {
        assert_eq!(clamp(-0.5), 0.0);
        assert_eq!(clamp0.5, 0.5);
        assert_eq!(clamp1.5, 1.0);
        assert_eq!(clamp(f32::NAN), 0.5);
        assert_eq!(clamp(f32::INFINITY), 1.0);
    fn test_cortex_report_default() {
        let report = CortexReport::default();
        assert_eq!(report.clarity, 1.0);
        assert_eq!(report.tension, 0.0);
        assert_eq!(report.alignment, 1.0);
    fn test_calculate_system_health() {
        let report = CortexReport {
            clarity: 0.9,
            tension: 0.2,
            alignment: 0.85,
        };
        
        let health = calculate_system_health(&report);
        assert!(health > 0.75);
    fn test_is_system_degraded() {
            clarity: 0.3,
            tension: 0.8,
            alignment: 0.3,
        assert!(is_system_degraded(&report));
    fn test_is_system_critical() {
            clarity: 0.1,
            tension: 0.9,
            alignment: 0.15,
        assert!(is_system_critical(&report));
    fn test_calculate_intervention_level() {
        // Niveau 0 - Normal
        let normal = CortexReport {
            clarity: 0.8,
            tension: 0.3,
            alignment: 0.8,
        assert_eq!(calculate_intervention_level(&normal), 0);
        // Niveau 1 - Surveillance
        let watch = CortexReport {
            clarity: 0.55,
            tension: 0.55,
            alignment: 0.7,
        assert_eq!(calculate_intervention_level(&watch), 1);
        // Niveau 2 - Modéré
        let degraded = CortexReport {
            clarity: 0.35,
            tension: 0.75,
            alignment: 0.35,
        assert_eq!(calculate_intervention_level(&degraded), 2);
        // Niveau 3 - Élevé
        let critical = CortexReport {
            clarity: 0.15,
        assert_eq!(calculate_intervention_level(&critical), 3);
