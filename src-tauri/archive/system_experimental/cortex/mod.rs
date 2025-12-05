// ╔══════════════════════════════════════════════════════════════════════════════╗
use std::collections::HashMap;
// ║ TITANE∞ v8.0 - Cortex Synchronique                                          ║
// ║ Synthèse globale de l'état interne du système                               ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

mod integrator;
mod insight;
pub use integrator::CortexReport;
pub use insight::CortexState;
use crate::shared::types::{TitaneResult, ModuleHealth};
use crate::shared::utils::current_timestamp;
use super::adaptive_engine::AdaptiveEngineModule;
use super::resonance::ResonanceState;
use super::HashMap<String, f32>;
use super::memory::MemoryModule;
/// Initialise le Cortex Synchronique
/// 
/// Crée un nouvel état avec des valeurs neutres optimales
/// # Returns
/// * `TitaneResult<CortexState>` - État initialisé
pub fn init() -> TitaneResult<CortexState> {
    let state = CortexState::new(current_timestamp());
    Ok(state)
}
/// Tick du Cortex Synchronique
/// Cycle de synthèse globale :
/// 1. Intégrer les états des 4 modules sources
/// 2. Générer un rapport de synthèse (CortexReport)
/// 3. Analyser les patterns et lisser les transitions
/// 4. Mettre à jour l'état global stable
/// # Arguments
/// * `cortex` - État du cortex à mettre à jour
/// * `adaptive` - Module adaptatif (stabilité, prédictions)
/// * `resonance` - État de résonance (tension, flow)
/// * `map` - Carte de cohérence (harmony, stability)
/// * `memory` - Module mémoire (santé)
/// * `TitaneResult<()>` - Succès ou erreur
pub fn tick(
    cortex: &mut CortexState,
    adaptive: &AdaptiveEngineModule,
    resonance: &ResonanceState,
    map: &CoherenceMap,
    memory: &MemoryModule,
) -> TitaneResult<()> {
    // Phase 1 : Intégration des états sources
    let report = integrator::integrate_system(adaptive, resonance, map, memory)?;
    
    // Phase 2 : Analyse des patterns et lissage
    insight::analyze_patterns(cortex, &report)?;
    // Phase 3 : Détection d'oscillations et correction si nécessaire
    if insight::detect_oscillation(cortex, &report) {
        // Appliquer une correction d'équilibre légère
        insight::apply_equilibrium_correction(cortex, 0.2)?;
    }
    Ok(())
/// Calcule la santé du Cortex Synchronique
/// Basé sur la stabilité de la vision globale
/// * `cortex` - État du cortex
/// * `ModuleHealth` - État de santé
pub fn health(cortex: &CortexState) -> ModuleHealth {
    if !cortex.initialized {
        return ModuleHealth::Critical;
    let stability = insight::calculate_stability(cortex);
    if stability >= 0.7 {
        ModuleHealth::Healthy
    } else if stability >= 0.4 {
        ModuleHealth::Degraded
    } else {
        ModuleHealth::Critical
/// Récupère un message de status du Cortex
/// * `String` - Message de status
pub fn get_status(cortex: &CortexState) -> String {
    insight::get_status_message(cortex)
/// Force une correction d'équilibre du Cortex
/// Utilisé pour stabiliser le système après perturbations
/// * `strength` - Force de correction [0.0, 1.0]
pub fn stabilize(cortex: &mut CortexState, strength: f32) -> TitaneResult<()> {
    insight::apply_equilibrium_correction(cortex, strength)
#[cfg(test)]
mod tests {
    use super::*;
    use crate::system::adaptive_engine;
    use crate::system::resonance;
    use crate::system::harmonia;
    use crate::system::memory;
    #[test]
    fn test_init() {
        let cortex = init().unwrap();
        assert!(cortex.initialized);
        assert_eq!(cortex.system_clarity, 1.0);
        assert_eq!(cortex.global_tension, 0.0);
        assert_eq!(cortex.alignment, 1.0);
    fn test_health() {
        let mut cortex = init().unwrap();
        
        // État optimal
        assert_eq!(health(&cortex), ModuleHealth::Healthy);
        // État dégradé
        cortex.system_clarity = 0.5;
        cortex.global_tension = 0.6;
        cortex.alignment = 0.5;
        assert_eq!(health(&cortex), ModuleHealth::Degraded);
        // État critique
        cortex.system_clarity = 0.2;
        cortex.global_tension = 0.9;
        cortex.alignment = 0.2;
        assert_eq!(health(&cortex), ModuleHealth::Critical);
    fn test_tick() {
        let adaptive = adaptive_engine::init().unwrap();
        let resonance = resonance::init().unwrap();
        let map = HashMap<String, f32>::new();
        let memory = memory::init().unwrap();
        // Premier tick
        tick(&mut cortex, &adaptive, &resonance, &map, &memory).unwrap();
        // Le cortex devrait avoir été mis à jour
        assert!(cortex.last_update > 0);
    fn test_stabilize() {
        // Dégrader l'état
        cortex.system_clarity = 0.3;
        cortex.global_tension = 0.8;
        cortex.alignment = 0.4;
        // Appliquer la stabilisation
        stabilize(&mut cortex, 1.0).unwrap();
        // L'état devrait être amélioré
        assert!(cortex.system_clarity > 0.3);
        assert!(cortex.global_tension < 0.8);
        assert!(cortex.alignment > 0.4);
    fn test_get_status() {
        let status = get_status(&cortex);
        assert!(status.contains("clarity") && status.contains("tension") && status.contains("alignment"));

}
