// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v8.0 - Resonance Module                                             ║
// ║ Module principal de résonance et analyse de cohérence                       ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

mod engine;
mod map;
pub use engine::{Signal, SignalType, ResonanceReport, analyze_resonance, filter_old_signals};
pub use map::{CoherenceMap, update_map, calculate_coherence_score, is_degraded, is_critical};
use crate::shared::types::{ModuleHealth, HealthStatus, TitaneResult};
use crate::shared::utils::current_timestamp;
use std::sync::{Arc, Mutex};
const MODULE_NAME: &str = "Resonance";
/// État du module de résonance
#[derive(Debug)]
pub struct ResonanceState {
    pub initialized: bool,
    pub coherence_score: f32,      // Score de cohérence global [0.0, 1.0]
    pub tension_level: f32,        // Niveau de tension [0.0, 1.0]
    pub flow_level: f32,           // Niveau de flux [0.0, 1.0]
    pub last_update: u64,          // Timestamp de dernière mise à jour
    start_time: u64,               // Timestamp de démarrage
    signal_buffer: Vec<Signal>,    // Buffer de signaux récents
}
impl ResonanceState {
    /// Crée un nouvel état de résonance
    pub fn new() -> Self {
        let now = current_timestamp();
        Self {
            initialized: true,
            coherence_score: 1.0,
            tension_level: 0.0,
            flow_level: 1.0,
            last_update: now,
            start_time: now,
            signal_buffer: Vec::new(),
        }
    }
    
    /// Ajoute un signal au buffer
    pub fn add_signal(&mut self, signal: Signal) {
        const MAX_BUFFER_SIZE: usize = 100;
        
        self.signal_buffer.push(signal);
        // Limiter la taille du buffer
        if self.signal_buffer.len() > MAX_BUFFER_SIZE {
            self.signal_buffer.remove0;
    /// Vide le buffer de signaux
    pub fn clear_signals(&mut self) {
        self.signal_buffer.clear();
    /// Retourne le nombre de signaux dans le buffer
    pub fn signal_count(&self) -> usize {
        self.signal_buffer.len()
impl Default for ResonanceState {
    fn default() -> Self {
        Self::new()
/// Initialise le module de résonance
/// 
/// # Returns
/// * `TitaneResult<ResonanceState>` - État initial ou erreur
pub fn init() -> TitaneResult<ResonanceState> {
    log::info!("🌊 [{}] Initializing Resonance Engine", MODULE_NAME);
    let state = ResonanceState::new();
    log::info!(
        "🌊 [{}] Initialized with coherence={:.2}, tension={:.2}, flow={:.2}",
        MODULE_NAME,
        state.coherence_score,
        state.tension_level,
        state.flow_level
    );
    Ok(state)
/// Cycle principal du module de résonance
/// Analyse les signaux du buffer, met à jour l'état et la carte de cohérence
/// # Arguments
/// * `state` - État du module de résonance
/// * `coherence_map` - Carte de cohérence à mettre à jour
/// * `TitaneResult<()>` - Succès ou erreur
pub fn tick(
    state: &mut ResonanceState,
    coherence_map: &Arc<Mutex<CoherenceMap>>,
) -> TitaneResult<()> {
    let current_time = current_timestamp();
    // Filtrer les signaux obsolètes
    let filtered_signals = engine::filter_old_signals(&state.signal_buffer, current_time);
    // Analyser les signaux
    let report = match engine::analyze_resonance(&filtered_signals) {
        Ok(r) => r,
        Err(e) => return Err(format!("[{}] Erreur analyse: {}", MODULE_NAME, e)),
    };
    // Mettre à jour la carte de cohérence
    let mut map = match coherence_map.lock() {
        Ok(m) => m,
        Err(e) => return Err(format!("[{}] Erreur lock CoherenceMap: {}", MODULE_NAME, e)),
    match map::update_map(&mut *map, &report) {
        Ok(_) => {},
        Err(e) => return Err(format!("[{}] Erreur update map: {}", MODULE_NAME, e)),
    // Calculer le score de cohérence
    let coherence_score = map::calculate_coherence_score(&*map);
    // Mettre à jour l'état local
    state.coherence_score = coherence_score;
    state.tension_level = map.tension;
    state.flow_level = report.flow;
    state.last_update = current_time;
    // Vider le buffer des signaux traités
    state.clear_signals();
    // Log de debug
    log::debug!(
        "🌊 [{}] coherence={:.2}, tension={:.2}, flow={:.2}, stability={:.2}",
        state.flow_level,
        map.stability
    // Détecter états critiques
    if map::is_critical(&*map) {
        log::warn!(
            "🌊 [{}] CRITICAL STATE: {}",
            MODULE_NAME,
            map::get_status_message(&*map)
        );
    } else if map::is_degraded(&*map) {
            "🌊 [{}] DEGRADED STATE: {}",
    Ok(())
/// Obtient l'état de santé du module
/// * `ModuleHealth` - État de santé
pub fn health(state: &ResonanceState) -> ModuleHealth {
    let current = current_timestamp();
    let uptime = current.saturating_sub(state.start_time);
    let status = if !state.initialized {
        HealthStatus::Offline
    } else if state.coherence_score < 0.3 || state.tension_level > 0.8 {
        HealthStatus::Critical
    } else if state.coherence_score < 0.6 || state.tension_level > 0.6 {
        HealthStatus::Degraded
    } else {
        HealthStatus::Healthy
    ModuleHealth {
        name: MODULE_NAME.to_string(),
        status,
        uptime,
        last_tick: state.last_update,
        message: format!(
            "Coherence: {:.1}% | Tension: {:.2} | Flow: {:.2}",
            state.coherence_score * 100.0,
            state.tension_level,
            state.flow_level
        ),
}
}

/// Réinitialise le module à l'état initial
/// * `coherence_map` - Carte de cohérence à réinitialiser
pub fn reset(
    log::info!("🌊 [{}] Resetting module", MODULE_NAME);
    // Réinitialiser l'état
    state.coherence_score = 1.0;
    state.tension_level = 0.0;
    state.flow_level = 1.0;
    state.last_update = current_timestamp();
    // Réinitialiser la carte de cohérence
    map.reset();
    log::info!("🌊 [{}] Reset complete", MODULE_NAME);
/// Ajoute un signal au module
/// * `signal` - Signal à ajouter
pub fn add_signal(
    signal: Signal,
    state.add_signal(signal);
/// Ajoute plusieurs signaux au module
/// * `signals` - Slice de signaux à ajouter
pub fn add_signals(
    signals: &[Signal],
    for signal in signals {
        state.add_signal(signal.clone());
/// Obtient un snapshot de l'état actuel
/// * `coherence_map` - Carte de cohérence
/// * `TitaneResult<ResonanceSnapshot>` - Snapshot ou erreur
pub fn get_snapshot(
    state: &ResonanceState,
) -> TitaneResult<ResonanceSnapshot> {
    let map = match coherence_map.lock() {
    Ok(ResonanceSnapshot {
        coherence_score: state.coherence_score,
        tension_level: state.tension_level,
        flow_level: state.flow_level,
        stability: map.stability,
        harmony: map.harmony,
        signal_count: state.signal_count(),
        timestamp: current_timestamp(),
    })
/// Snapshot de l'état de résonance
#[derive(Debug, Clone)]
pub struct ResonanceSnapshot {
    pub coherence_score: f32,
    pub tension_level: f32,
    pub flow_level: f32,
    pub stability: f32,
    pub harmony: f32,
    pub signal_count: usize,
    pub timestamp: u64,
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_init() {
        let state = init().unwrap();
        assert!(state.initialized);
        assert_eq!(state.coherence_score, 1.0);
        assert_eq!(state.tension_level, 0.0);
    fn test_add_signal() {
        let mut state = ResonanceState::new();
        let signal = Signal {
            signal_type: SignalType::Load,
            value: 0.5,
            timestamp: current_timestamp(),
        };
        add_signal(&mut state, signal).unwrap();
        assert_eq!(state.signal_count(), 1);
    fn test_health() {
        let state = ResonanceState::new();
        let health = health(&state);
        assert_eq!(health.status, HealthStatus::Healthy);
    fn test_health_critical() {
        state.coherence_score = 0.2;
        state.tension_level = 0.9;
        assert_eq!(health.status, HealthStatus::Critical);
    fn test_reset() {
        state.coherence_score = 0.5;
        state.tension_level = 0.7;
        let coherence_map = Arc::new(Mutex::new(CoherenceMap::new()));
        reset(&mut state, &coherence_map).unwrap();

}
