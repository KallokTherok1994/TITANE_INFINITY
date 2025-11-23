// ╔══════════════════════════════════════════════════════════════════════════════╗
use std::collections::HashMap;
// ║ TITANE∞ v8.0 - InnerSense Engine                                            ║
// ║ Perception interne qualitative du système                                   ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

use crate::shared::types::TitaneResult;
use crate::shared::utils::current_timestamp;
use crate::system::adaptive_engine::AdaptiveEngineModule;
use crate::system::resonance::ResonanceState;
use crate::system::HashMap<String, f32>;
/// État de l'InnerSense Engine
/// 
/// Représente la perception interne qualitative du système
#[derive(Debug, Clone)]
pub struct InnerSenseState {
    pub initialized: bool,
    pub tension: f32,         // Tension interne [0.0, 1.0]
    pub stability: f32,       // Stabilité interne [0.0, 1.0]
    pub charge: f32,          // Charge cognitive [0.0, 1.0]
    pub depth: f32,           // Profondeur interne [0.0, 1.0]
    pub last_update: u64,     // Timestamp dernière MAJ
}
impl InnerSenseState {
    /// Crée un nouvel état avec valeurs neutres
    pub fn new(current_time: u64) -> Self {
        Self {
            initialized: true,
            tension: 0.2,
            stability: 0.8,
            charge: 0.3,
            depth: 0.7,
            last_update: current_time,
        }
    }
/// Normalise une valeur dans la plage [0.0, 1.0]
fn clamp(value: f32) -> f32 {
    if value.is_nan() || value.is_infinite() {
        return 0.5;
    value.max0.0.min1.0
/// Applique une transition douce entre deux valeurs
/// # Arguments
/// * `old` - Ancienne valeur
/// * `new` - Nouvelle valeur
/// * `factor` - Facteur de transition [0.0, 1.0]
/// # Returns
/// * `f32` - Valeur lissée
fn smooth_transition(old: f32, new: f32, factor: f32) -> f32 {
    let f = clamp(factor);
    clamp(old * (1.0 - f) + new * f)
/// Initialise l'InnerSense Engine
/// * `TitaneResult<InnerSenseState>` - État initialisé
pub fn init() -> TitaneResult<InnerSenseState> {
    let state = InnerSenseState::new(current_timestamp());
    Ok(state)
/// Tick de l'InnerSense Engine
/// Met à jour la perception interne qualitative basée sur :
/// - AdaptiveEngine : Charge prédite et stabilité
/// - Resonance : Tension et flux d'activité
/// - CoherenceMap : Stabilité cartographiée
/// * `state` - État de l'InnerSense à mettre à jour
/// * `adaptive` - État du moteur adaptatif
/// * `resonance` - État de résonance
/// * `map` - Carte de cohérence
/// * `TitaneResult<()>` - Succès ou erreur
pub fn tick(
    state: &mut InnerSenseState,
    adaptive: &AdaptiveEngineModule,
    resonance: &ResonanceState,
    map: &CoherenceMap,
) -> TitaneResult<()> {
    // Calcul de la tension interne
    // Tension = moyenne de la charge prédite et de la tension de résonance
    // Une tension élevée indique un système sous stress
    let raw_tension = (adaptive.predicted_load + resonance.tension_level) / 2.0;
    let new_tension = clamp(raw_tension);
    
    // Lissage doux de la tension (facteur 0.3 = 30% nouveau, 70% ancien)
    state.tension = smooth_transition(state.tension, new_tension, 0.3);
    // Calcul de la stabilité interne
    // Stabilité = directement prise de la carte de cohérence
    // Une stabilité élevée indique un système cohérent
    let new_stability = clamp(map.stability);
    // Lissage doux de la stabilité (facteur 0.3)
    state.stability = smooth_transition(state.stability, new_stability, 0.3);
    // Calcul de la charge cognitive
    // Charge = moyenne de la charge prédite et de l'absence de flux
    // Une charge élevée indique un système saturé
    let raw_charge = (adaptive.predicted_load + (1.0 - resonance.flow_level)) / 2.0;
    let new_charge = clamp(raw_charge);
    // Lissage doux de la charge (facteur 0.3)
    state.charge = smooth_transition(state.charge, new_charge, 0.3);
    // Calcul de la profondeur interne
    // Profondeur = moyenne du flux de résonance et de la stabilité adaptative
    // Une profondeur élevée indique un système qui opère avec maturité
    let raw_depth = (resonance.flow_level + adaptive.stability) / 2.0;
    let new_depth = clamp(raw_depth);
    // Lissage doux de la profondeur (facteur 0.3)
    state.depth = smooth_transition(state.depth, new_depth, 0.3);
    // Mise à jour du timestamp
    state.last_update = current_timestamp();
    Ok(())
/// Calcule un score global de perception interne
/// * `state` - État de l'InnerSense
/// * `f32` - Score de perception interne [0.0, 1.0]
pub fn calculate_inner_perception(state: &InnerSenseState) -> f32 {
    // Perception interne = équilibre entre faible tension, haute stabilité, charge modérée et profondeur
    let tension_contrib = (1.0 - state.tension) * 0.25;
    let stability_contrib = state.stability * 0.3;
    let charge_contrib = (1.0 - state.charge) * 0.2;
    let depth_contrib = state.depth * 0.25;
    let perception = tension_contrib + stability_contrib + charge_contrib + depth_contrib;
    clamp(perception)
/// Détecte si le système est dans un état de surcharge
/// * `bool` - True si surcharge détectée
pub fn is_overloaded(state: &InnerSenseState) -> bool {
    // Surcharge = tension élevée ET charge élevée ET stabilité faible
    state.tension > 0.7 && state.charge > 0.7 && state.stability < 0.4
/// Détecte si le système est dans un état de sérénité
/// * `bool` - True si sérénité détectée
pub fn is_serene(state: &InnerSenseState) -> bool {
    // Sérénité = tension faible ET charge faible ET stabilité élevée ET profondeur élevée
    state.tension < 0.3 && state.charge < 0.4 && state.stability > 0.7 && state.depth > 0.7
/// Détecte si le système est dans un état de résilience
/// * `bool` - True si résilient
pub fn is_resilient(state: &InnerSenseState) -> bool {
    // Résilience = stabilité élevée ET profondeur élevée (même avec tension/charge modérée)
    state.stability > 0.6 && state.depth > 0.6
/// Génère un message de status de l'InnerSense
/// * `String` - Message de status
pub fn get_status_message(state: &InnerSenseState) -> String {
    let perception = calculate_inner_perception(state);
    if is_overloaded(state) {
        format!(
            "OVERLOADED: tension={:.2}, stability={:.2}, charge={:.2}, depth={:.2}, perception={:.2}",
            state.tension, state.stability, state.charge, state.depth, perception
        )
    } else if is_serene(state) {
            "SERENE: tension={:.2}, stability={:.2}, charge={:.2}, depth={:.2}, perception={:.2}",
    } else if is_resilient(state) {
            "RESILIENT: tension={:.2}, stability={:.2}, charge={:.2}, depth={:.2}, perception={:.2}",
    } else {
            "BALANCED: tension={:.2}, stability={:.2}, charge={:.2}, depth={:.2}, perception={:.2}",
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_init() {
        let state = init().unwrap();
        assert!(state.initialized);
        assert_eq!(state.tension, 0.2);
        assert_eq!(state.stability, 0.8);
        assert_eq!(state.charge, 0.3);
        assert_eq!(state.depth, 0.7);
    fn test_clamp() {
        assert_eq!(clamp0.5, 0.5);
        assert_eq!(clamp(-0.5), 0.0);
        assert_eq!(clamp1.5, 1.0);
        assert_eq!(clamp(f32::NAN), 0.5);
        assert_eq!(clamp(f32::INFINITY), 0.5);
    fn test_smooth_transition() {
        let result = smooth_transition(0.5, 1.0, 0.3);
        // 0.5 * 0.7 + 1.0 * 0.3 = 0.35 + 0.3 = 0.65
        assert!((result - 0.65).abs() < 0.01);
    fn test_tick() {
        let mut state = init().unwrap();
        let adaptive = crate::system::adaptive_engine::init().unwrap();
        let resonance = crate::system::resonance::init().unwrap();
        let map = crate::system::HashMap<String, f32>::new();
        
        tick(&mut state, &adaptive, &resonance, &map).unwrap();
        // Les valeurs devraient avoir été mises à jour
        assert!(state.last_update > 0);
    fn test_calculate_inner_perception() {
        state.tension = 0.2;
        state.stability = 0.8;
        state.charge = 0.3;
        state.depth = 0.7;
        let perception = calculate_inner_perception(&state);
        // (1-0.2)*0.25 + 0.8*0.3 + (1-0.3)*0.2 + 0.7*0.25
        // 0.8*0.25 + 0.24 + 0.7*0.2 + 0.175
        // 0.2 + 0.24 + 0.14 + 0.175 = 0.755
        assert!((perception - 0.755).abs() < 0.01);
    fn test_is_overloaded() {
        // État normal
        assert!(!is_overloaded(&state));
        // État surchargé
        state.tension = 0.8;
        state.charge = 0.8;
        state.stability = 0.3;
        assert!(is_overloaded(&state));
    fn test_is_serene() {
        assert!(!is_serene(&state));
        // État serein
        state.depth = 0.8;
        assert!(is_serene(&state));
    fn test_is_resilient() {
        assert!(is_resilient(&state)); // État par défaut est résilient
        // État non résilient
        state.stability = 0.4;
        state.depth = 0.4;
        assert!(!is_resilient(&state));
    fn test_get_status_message() {
        let status = get_status_message(&state);
        assert!(status.contains("tension") && status.contains("stability") && status.contains("charge"));
