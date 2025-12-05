// Conscience Engine - Module #33
// Gestion de l'état de conscience cognitive du système
// Rust 2021 Edition

pub mod collect;
pub mod compute;
use collect::{collect_conscience_inputs, ConscienceInputs};
use compute::compute_conscience;
/// État de conscience cognitive du système
#[derive(Debug, Clone)]
pub struct ConscienceState {
    pub initialized: bool,
    pub clarity_index: f32,
    pub self_coherence: f32,
    pub insight_potential: f32,
    pub last_update: u64,
}
impl ConscienceState {
    /// Crée un nouvel état non initialisé
    pub fn new() -> Self {
        Self {
            initialized: false,
            clarity_index: 0.0,
            self_coherence: 0.0,
            insight_potential: 0.0,
            last_update: 0,
        }
    }
    /// Initialise l'état de conscience
    pub fn init(&mut self) -> Result<(), String> {
        if self.initialized {
            return Err("État de conscience déjà initialisé".to_string());
        // Première collecte et calcul
        let inputs = collect_conscience_inputs()?;
        let (clarity, coherence, insight) = compute_conscience(&inputs);
        self.clarity_index = clarity;
        self.self_coherence = coherence;
        self.insight_potential = insight;
        self.last_update = get_current_timestamp();
        self.initialized = true;
        Ok(())
    /// Met à jour l'état de conscience avec lissage 70/30
    pub fn tick(&mut self) -> Result<(), String> {
        if !self.initialized {
            return Err("État de conscience non initialisé".to_string());
        // Collecte et calcul des nouvelles valeurs
        let (new_clarity, new_coherence, new_insight) = compute_conscience(&inputs);
        // Lissage 70/30 (70% ancienne valeur, 30% nouvelle valeur)
        self.clarity_index = self.clarity_index * 0.7 + new_clarity * 0.3;
        self.self_coherence = self.self_coherence * 0.7 + new_coherence * 0.3;
        self.insight_potential = self.insight_potential * 0.7 + new_insight * 0.3;
        // Clamp pour garantir les bornes
        self.clarity_index = self.clarity_index.clamp(0.0, 1.0);
        self.self_coherence = self.self_coherence.clamp(0.0, 1.0);
        self.insight_potential = self.insight_potential.clamp(0.0, 1.0);
    /// Vérifie si la conscience est claire (clarity >= 0.7)
    pub fn is_clear(&self) -> bool {
        self.clarity_index >= 0.7
    /// Vérifie si la conscience est confuse (clarity < 0.3)
    pub fn is_confused(&self) -> bool {
        self.clarity_index < 0.3
    /// Vérifie si le système est cohérent (coherence >= 0.7)
    pub fn is_coherent(&self) -> bool {
        self.self_coherence >= 0.7
    /// Vérifie si le système est fragmenté (coherence < 0.3)
    pub fn is_fragmented(&self) -> bool {
        self.self_coherence < 0.3
    /// Vérifie si le potentiel d'insight est élevé (insight >= 0.7)
    pub fn is_insightful(&self) -> bool {
        self.insight_potential >= 0.7
    /// Retourne un message de statut en français
    pub fn status_message(&self) -> String {
            return "CONSCIENCE NON INITIALISÉE".to_string();
        // Statut basé sur la clarté
        let clarity_status = if self.clarity_index >= 0.85 {
            "CLARTÉ COGNITIVE OPTIMALE"
        } else if self.clarity_index >= 0.7 {
            "CLARTÉ COGNITIVE ÉLEVÉE"
        } else if self.clarity_index >= 0.5 {
            "CLARTÉ COGNITIVE MODÉRÉE"
        } else if self.clarity_index >= 0.3 {
            "CLARTÉ COGNITIVE FAIBLE"
        } else {
            "CONFUSION COGNITIVE CRITIQUE"
        };
        // Statut basé sur la cohérence
        let coherence_status = if self.self_coherence >= 0.85 {
            "COHÉRENCE MAXIMALE"
        } else if self.self_coherence >= 0.7 {
            "COHÉRENCE ÉLEVÉE"
        } else if self.self_coherence >= 0.5 {
            "COHÉRENCE MODÉRÉE"
        } else if self.self_coherence >= 0.3 {
            "COHÉRENCE FAIBLE"
            "FRAGMENTATION CRITIQUE"
        // Statut basé sur l'insight
        let insight_status = if self.insight_potential >= 0.85 {
            "INSIGHT EXCEPTIONNEL"
        } else if self.insight_potential >= 0.7 {
            "INSIGHT ÉLEVÉ"
        } else if self.insight_potential >= 0.5 {
            "INSIGHT MODÉRÉ"
        } else if self.insight_potential >= 0.3 {
            "INSIGHT FAIBLE"
            "INSIGHT CRITIQUE"
        format!(
            "{} | {} | {} (Clarté: {:.2}, Cohérence: {:.2}, Insight: {:.2})",
            clarity_status,
            coherence_status,
            insight_status,
            self.clarity_index,
            self.self_coherence,
            self.insight_potential
        )
impl Default for ConscienceState {
    fn default() -> Self {
        Self::new()
/// Obtient le timestamp actuel (simulation)
fn get_current_timestamp() -> u64 {
    // En production, utiliser std::time::SystemTime
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or0
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_conscience_state_new() {
        let state = ConscienceState::new();
        assert!(!state.initialized);
        assert_eq!(state.clarity_index, 0.0);
        assert_eq!(state.self_coherence, 0.0);
        assert_eq!(state.insight_potential, 0.0);
        assert_eq!(state.last_update, 0);
    fn test_init_success() {
        let mut state = ConscienceState::new();
        let result = state.init();
        assert!(result.is_ok());
        assert!(state.initialized);
        assert!(state.clarity_index >= 0.0 && state.clarity_index <= 1.0);
        assert!(state.self_coherence >= 0.0 && state.self_coherence <= 1.0);
        assert!(state.insight_potential >= 0.0 && state.insight_potential <= 1.0);
        assert!(state.last_update > 0);
    fn test_init_already_initialized() {
        state.init().unwrap();
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "État de conscience déjà initialisé");
    fn test_tick_not_initialized() {
        let result = state.tick();
        assert_eq!(result.unwrap_err(), "État de conscience non initialisé");
    fn test_tick_smoothing() {
        
        let initial_clarity = state.clarity_index;
        let initial_coherence = state.self_coherence;
        let initial_insight = state.insight_potential;
        state.tick().unwrap();
        // Les valeurs ne devraient pas changer drastiquement (lissage 70/30)
        let clarity_diff = (state.clarity_index - initial_clarity).abs();
        let coherence_diff = (state.self_coherence - initial_coherence).abs();
        let insight_diff = (state.insight_potential - initial_insight).abs();
        // Avec un lissage 70/30, le changement max théorique est 0.3
        assert!(clarity_diff <= 0.3);
        assert!(coherence_diff <= 0.3);
        assert!(insight_diff <= 0.3);
    fn test_is_clear() {
        state.initialized = true;
        state.clarity_index = 0.8;
        assert!(state.is_clear());
        state.clarity_index = 0.7;
        state.clarity_index = 0.69;
        assert!(!state.is_clear());
    fn test_is_confused() {
        state.clarity_index = 0.2;
        assert!(state.is_confused());
        state.clarity_index = 0.29;
        state.clarity_index = 0.3;
        assert!(!state.is_confused());
    fn test_is_coherent() {
        state.self_coherence = 0.8;
        assert!(state.is_coherent());
        state.self_coherence = 0.7;
        state.self_coherence = 0.69;
        assert!(!state.is_coherent());
    fn test_is_fragmented() {
        state.self_coherence = 0.2;
        assert!(state.is_fragmented());
        state.self_coherence = 0.29;
        state.self_coherence = 0.3;
        assert!(!state.is_fragmented());
    fn test_is_insightful() {
        state.insight_potential = 0.8;
        assert!(state.is_insightful());
        state.insight_potential = 0.7;
        state.insight_potential = 0.69;
        assert!(!state.is_insightful());
    fn test_status_message_not_initialized() {
        assert_eq!(state.status_message(), "CONSCIENCE NON INITIALISÉE");
    fn test_status_message_optimal() {
        state.clarity_index = 0.95;
        state.self_coherence = 0.90;
        state.insight_potential = 0.88;
        let message = state.status_message();
        assert!(message.contains("CLARTÉ COGNITIVE OPTIMALE"));
        assert!(message.contains("COHÉRENCE MAXIMALE"));
        assert!(message.contains("INSIGHT EXCEPTIONNEL"));
    fn test_status_message_critical() {
        state.clarity_index = 0.15;
        state.self_coherence = 0.20;
        state.insight_potential = 0.10;
        assert!(message.contains("CONFUSION COGNITIVE CRITIQUE"));
        assert!(message.contains("FRAGMENTATION CRITIQUE"));
        assert!(message.contains("INSIGHT CRITIQUE"));
    fn test_default_trait() {
        let state = ConscienceState::default();
    fn test_tick_clamping() {
        state.clarity_index = 0.98;
        state.self_coherence = 0.97;
        state.insight_potential = 0.99;
        // Plusieurs ticks pour tester le clamping
        for _ in 0..5 {
            state.tick().unwrap();
        assert!(state.clarity_index <= 1.0);
        assert!(state.self_coherence <= 1.0);
        assert!(state.insight_potential <= 1.0);
        assert!(state.clarity_index >= 0.0);
        assert!(state.self_coherence >= 0.0);
        assert!(state.insight_potential >= 0.0);

}
