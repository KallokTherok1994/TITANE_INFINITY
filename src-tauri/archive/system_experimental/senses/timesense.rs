// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v8.0 - TimeSense Engine                                             ║
// ║ Perception temporelle interne du système                                    ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

use crate::shared::types::TitaneResult;
use crate::shared::utils::current_timestamp;
use crate::system::cortex::CortexState;
use crate::system::adaptive_engine::AdaptiveEngineModule;
use crate::system::resonance::ResonanceState;
/// État du TimeSense Engine
/// 
/// Représente la perception temporelle interne du système
#[derive(Debug, Clone)]
pub struct TimeSenseState {
    pub initialized: bool,
    pub momentum: f32,        // Vitesse interne du système [0.0, 1.0]
    pub pace: f32,            // Rythme interne [0.0, 1.0]
    pub direction: f32,       // Orientation évolutive [0.0, 1.0]
    pub last_update: u64,     // Timestamp dernière MAJ
}
impl TimeSenseState {
    /// Crée un nouvel état avec valeurs neutres
    pub fn new(current_time: u64) -> Self {
        Self {
            initialized: true,
            momentum: 0.5,
            pace: 0.5,
            direction: 0.5,
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
/// Initialise le TimeSense Engine
/// * `TitaneResult<TimeSenseState>` - État initialisé
pub fn init() -> TitaneResult<TimeSenseState> {
    let state = TimeSenseState::new(current_timestamp());
    Ok(state)
/// Tick du TimeSense Engine
/// Met à jour la perception temporelle interne basée sur :
/// - Cortex : Clarté système globale
/// - AdaptiveEngine : Tendance adaptative et stabilité
/// - Resonance : Tension et flux d'activité
/// * `state` - État du TimeSense à mettre à jour
/// * `cortex` - État du Cortex Synchronique
/// * `adaptive` - État du moteur adaptatif
/// * `resonance` - État de résonance
/// * `TitaneResult<()>` - Succès ou erreur
pub fn tick(
    state: &mut TimeSenseState,
    cortex: &CortexState,
    adaptive: &AdaptiveEngineModule,
    resonance: &ResonanceState,
) -> TitaneResult<()> {
    // Calcul du momentum (vitesse interne du système)
    // Momentum = moyenne de la tendance adaptative et de l'absence de tension
    // Un système avec momentum élevé évolue rapidement et sans friction
    let raw_momentum = (adaptive.trend + (1.0 - resonance.tension_level)) / 2.0;
    let new_momentum = clamp(raw_momentum);
    
    // Lissage doux du momentum (facteur 0.3 = 30% nouveau, 70% ancien)
    state.momentum = smooth_transition(state.momentum, new_momentum, 0.3);
    // Calcul du pace (rythme interne)
    // Pace = moyenne de la tendance adaptative et du flux de résonance
    // Un pace élevé indique un système actif et fluide
    let raw_pace = (adaptive.trend + resonance.flow_level) / 2.0;
    let new_pace = clamp(raw_pace);
    // Lissage doux du pace (facteur 0.3)
    state.pace = smooth_transition(state.pace, new_pace, 0.3);
    // Calcul de la direction (orientation évolutive)
    // Direction = moyenne de la clarté, stabilité et flux
    // Une direction élevée indique un système qui progresse clairement
    let raw_direction = (cortex.system_clarity + adaptive.stability + resonance.flow_level) / 3.0;
    let new_direction = clamp(raw_direction);
    // Lissage doux de la direction (facteur 0.3)
    state.direction = smooth_transition(state.direction, new_direction, 0.3);
    // Mise à jour du timestamp
    state.last_update = current_timestamp();
    Ok(())
/// Calcule un score global de perception temporelle
/// * `state` - État du TimeSense
/// * `f32` - Score de perception temporelle [0.0, 1.0]
pub fn calculate_temporal_perception(state: &TimeSenseState) -> f32 {
    // Perception temporelle = équilibre entre momentum, pace et direction
    let perception = (state.momentum * 0.3 + state.pace * 0.3 + state.direction * 0.4);
    clamp(perception)
/// Détecte si le système est dans un état de stagnation temporelle
/// * `bool` - True si stagnation détectée
pub fn is_stagnating(state: &TimeSenseState) -> bool {
    // Stagnation = faible momentum ET faible pace ET direction incertaine
    state.momentum < 0.3 && state.pace < 0.3 && state.direction < 0.5
/// Détecte si le système est dans un état de progression optimale
/// * `bool` - True si progression optimale
pub fn is_progressing_optimally(state: &TimeSenseState) -> bool {
    // Progression optimale = momentum élevé ET pace élevé ET direction claire
    state.momentum > 0.7 && state.pace > 0.7 && state.direction > 0.7
/// Génère un message de status du TimeSense
/// * `String` - Message de status
pub fn get_status_message(state: &TimeSenseState) -> String {
    let perception = calculate_temporal_perception(state);
    if is_stagnating(state) {
        format!(
            "STAGNATING: momentum={:.2}, pace={:.2}, direction={:.2}, perception={:.2}",
            state.momentum, state.pace, state.direction, perception
        )
    } else if is_progressing_optimally(state) {
            "OPTIMAL: momentum={:.2}, pace={:.2}, direction={:.2}, perception={:.2}",
    } else {
            "ACTIVE: momentum={:.2}, pace={:.2}, direction={:.2}, perception={:.2}",
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_init() {
        let state = init().unwrap();
        assert!(state.initialized);
        assert_eq!(state.momentum, 0.5);
        assert_eq!(state.pace, 0.5);
        assert_eq!(state.direction, 0.5);
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
        let cortex = CortexState::new(current_timestamp());
        let adaptive = crate::system::adaptive_engine::init().unwrap();
        let resonance = crate::system::resonance::init().unwrap();
        
        tick(&mut state, &cortex, &adaptive, &resonance).unwrap();
        // Les valeurs devraient avoir été mises à jour
        assert!(state.last_update > 0);
    fn test_calculate_temporal_perception() {
        state.momentum = 0.8;
        state.pace = 0.7;
        state.direction = 0.9;
        let perception = calculate_temporal_perception(&state);
        // 0.8*0.3 + 0.7*0.3 + 0.9*0.4 = 0.24 + 0.21 + 0.36 = 0.81
        assert!((perception - 0.81).abs() < 0.01);
    fn test_is_stagnating() {
        // État normal
        assert!(!is_stagnating(&state));
        // État stagnant
        state.momentum = 0.2;
        state.pace = 0.2;
        state.direction = 0.3;
        assert!(is_stagnating(&state));
    fn test_is_progressing_optimally() {
        assert!(!is_progressing_optimally(&state));
        // État optimal
        state.pace = 0.8;
        state.direction = 0.8;
        assert!(is_progressing_optimally(&state));
    fn test_get_status_message() {
        let status = get_status_message(&state);
        assert!(status.contains("momentum") && status.contains("pace") && status.contains("direction"));
