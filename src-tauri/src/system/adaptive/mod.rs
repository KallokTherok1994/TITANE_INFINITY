// ============================================================================
// MODULE 34: ADAPTIVE INTELLIGENCE ENGINE
// Moteur d'intelligence adaptative pour TITANE
// Rust 2021 - Pas d'unwrap/expect/panic

pub mod collect;
pub mod compute;
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};
/// État du moteur d'intelligence adaptative
#[derive(Debug, Clone)]
pub struct AdaptiveIntelligenceState {
    pub initialized: bool,
    pub adaptation_score: f32,
    pub plasticity_level: f32,
    pub cognitive_flexibility: f32,
    pub last_update: u64,
}
impl Default for AdaptiveIntelligenceState {
    fn default() -> Self {
        Self {
            initialized: false,
            adaptation_score: 0.5,
            plasticity_level: 0.5,
            cognitive_flexibility: 0.5,
            last_update: 0,
        }
    }
impl AdaptiveIntelligenceState {
    /// Initialise le moteur d'intelligence adaptative
    pub fn init() -> Result<Self, String> {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|e| format!("Erreur lors de la récupération du timestamp: {}", e))?
            .as_secs();
        Ok(Self {
            initialized: true,
            last_update: now,
        })
    /// Mise à jour cyclique avec lissage 70/30
    pub fn tick(&mut self, states: &HashMap<String, f32>) -> Result<(), String> {
        if !self.initialized {
            return Err("Module non initialisé".to_string());
        // Collecte des entrées
        let inputs = collect::collect_adaptive_inputs(states)?;
        // Calcul des nouvelles métriques
        let (new_adaptation, new_plasticity, new_flexibility) = compute::compute_adaptive(&inputs)?;
        // Lissage 70/30 (70% ancienne valeur, 30% nouvelle valeur)
        self.adaptation_score = self.adaptation_score * 0.70 + new_adaptation * 0.30;
        self.plasticity_level = self.plasticity_level * 0.70 + new_plasticity * 0.30;
        self.cognitive_flexibility = self.cognitive_flexibility * 0.70 + new_flexibility * 0.30;
        // Clamping final
        self.adaptation_score = self.adaptation_score.clamp(0.0, 1.0);
        self.plasticity_level = self.plasticity_level.clamp(0.0, 1.0);
        self.cognitive_flexibility = self.cognitive_flexibility.clamp(0.0, 1.0);
        // Mise à jour du timestamp
        self.last_update = SystemTime::now()
        Ok(())
    /// Vérifie si le système est adaptatif (score >= 0.70)
    pub fn is_adaptive(&self) -> bool {
        self.adaptation_score >= 0.70
    /// Vérifie si le système est rigide (score < 0.30)
    pub fn is_rigid(&self) -> bool {
        self.adaptation_score < 0.30
    /// Vérifie si le système est plastique (niveau >= 0.70)
    pub fn is_plastic(&self) -> bool {
        self.plasticity_level >= 0.70
    /// Vérifie si le système est flexible (flexibilité >= 0.70)
    pub fn is_flexible(&self) -> bool {
        self.cognitive_flexibility >= 0.70
    /// Retourne un message de statut en français
    pub fn status_message(&self) -> String {
            return "MODULE NON INITIALISÉ".to_string();
        // Analyse du score d'adaptation
        if self.adaptation_score >= 0.85 && self.plasticity_level >= 0.85 && self.cognitive_flexibility >= 0.85 {
            return "INTELLIGENCE ADAPTATIVE OPTIMALE".to_string();
        if self.is_rigid() {
            return "RIGIDITÉ COGNITIVE CRITIQUE".to_string();
        if self.adaptation_score >= 0.70 {
            if self.is_plastic() && self.is_flexible() {
                return "Système hautement adaptatif et flexible".to_string();
            } else if self.is_plastic() {
                return "Système adaptatif avec plasticité élevée".to_string();
            } else if self.is_flexible() {
                return "Système adaptatif avec flexibilité élevée".to_string();
            } else {
                return "Système adaptatif standard".to_string();
            }
        if self.adaptation_score >= 0.50 {
            return "Adaptation modérée, amélioration possible".to_string();
        if self.adaptation_score >= 0.30 {
            return "Adaptation faible, attention requise".to_string();
        "RIGIDITÉ COGNITIVE CRITIQUE".to_string()
// TESTS
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_init() {
        let result = AdaptiveIntelligenceState::init();
        assert!(result.is_ok());
        
        let state = result.unwrap();
        assert!(state.initialized);
        assert_eq!(state.adaptation_score, 0.5);
        assert_eq!(state.plasticity_level, 0.5);
        assert_eq!(state.cognitive_flexibility, 0.5);
        assert!(state.last_update > 0);
    fn test_tick_uninitialized() {
        let mut state = AdaptiveIntelligenceState::default();
        let states = HashMap::new();
        let result = state.tick(&states);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("non initialisé"));
    fn test_tick_with_smoothing() {
        let mut state = AdaptiveIntelligenceState::init().unwrap();
        // Valeurs initiales
        state.adaptation_score = 0.50;
        state.plasticity_level = 0.50;
        state.cognitive_flexibility = 0.50;
        // Nouvelles valeurs qui donneront des scores élevés
        let mut states = HashMap::new();
        states.insert("conscience_clarity_index".to_string(), 0.90);
        states.insert("conscience_self_coherence".to_string(), 0.95);
        states.insert("conscience_insight_potential".to_string(), 0.88);
        states.insert("governor_regulation_level".to_string(), 0.20);
        states.insert("governor_deviation_index".to_string(), 0.15);
        states.insert("metacortex_global_coherence".to_string(), 0.92);
        states.insert("metacortex_integration_depth".to_string(), 0.85);
        states.insert("neuromesh_neural_density".to_string(), 0.87);
        states.insert("neuromesh_network_coherence".to_string(), 0.89);
        states.insert("continuum_continuity_score".to_string(), 0.93);
        states.insert("alignment_depth".to_string(), 0.91);
        // Avec lissage 70/30, les valeurs devraient être supérieures à 0.50 mais pas encore très élevées
        assert!(state.adaptation_score > 0.50);
        assert!(state.adaptation_score < 0.95);
        assert!(state.plasticity_level > 0.50);
        assert!(state.cognitive_flexibility > 0.50);
    fn test_is_adaptive() {
        state.adaptation_score = 0.80;
        assert!(state.is_adaptive());
        state.adaptation_score = 0.69;
        assert!(!state.is_adaptive());
        state.adaptation_score = 0.70;
    fn test_is_rigid() {
        state.adaptation_score = 0.20;
        assert!(state.is_rigid());
        state.adaptation_score = 0.30;
        assert!(!state.is_rigid());
        state.adaptation_score = 0.29;
    fn test_is_plastic() {
        state.plasticity_level = 0.80;
        assert!(state.is_plastic());
        state.plasticity_level = 0.69;
        assert!(!state.is_plastic());
        state.plasticity_level = 0.70;
    fn test_is_flexible() {
        state.cognitive_flexibility = 0.85;
        assert!(state.is_flexible());
        state.cognitive_flexibility = 0.69;
        assert!(!state.is_flexible());
        state.cognitive_flexibility = 0.70;
    fn test_status_message_uninitialized() {
        let state = AdaptiveIntelligenceState::default();
        assert_eq!(state.status_message(), "MODULE NON INITIALISÉ");
    fn test_status_message_optimal() {
        state.adaptation_score = 0.90;
        state.plasticity_level = 0.88;
        state.cognitive_flexibility = 0.92;
        assert_eq!(state.status_message(), "INTELLIGENCE ADAPTATIVE OPTIMALE");
    fn test_status_message_critical() {
        state.adaptation_score = 0.25;
        assert_eq!(state.status_message(), "RIGIDITÉ COGNITIVE CRITIQUE");
    fn test_status_message_highly_adaptive() {
        state.adaptation_score = 0.75;
        state.plasticity_level = 0.75;
        state.cognitive_flexibility = 0.75;
        let message = state.status_message();
        assert!(message.contains("hautement adaptatif"));

}
