// TITANE∞ v8.0 - ANS (Autonomic Nervous System)
// Système Nerveux Autonome - Régulation autonome et homéostasie

use std::collections::VecDeque;
use std::sync::{Arc, Mutex};
use serde::{Deserialize, Serialize};
use crate::shared::types::{ModuleHealth, SystemMetrics};
/// État du système nerveux autonome
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ANSState {
    /// Mode de régulation actif
    pub regulation_mode: RegulationMode,
    
    /// État d'homéostasie (0.0 = chaos, 1.0 = équilibre parfait)
    pub homeostasis: f64,
    /// Niveau d'activation sympathique (0.0-1.0)
    pub sympathetic_activation: f64,
    /// Niveau d'activation parasympathique (0.0-1.0)
    pub parasympathetic_activation: f64,
    /// Balance autonome (-1.0 = parasympathique, +1.0 = sympathique)
    pub autonomic_balance: f64,
    /// Variabilité du système (mesure de flexibilité)
    pub system_variability: f64,
    /// Capacité d'adaptation actuelle
    pub adaptive_capacity: f64,
    /// Décisions autonomes prises
    pub autonomous_decisions: Vec<AutonomousDecision>,
    /// Historique homéostasie (10 derniers ticks)
    homeostasis_history: VecDeque<f64>,
    /// Historique balance (10 derniers ticks)
    balance_history: VecDeque<f64>,
    /// Compteur de ticks
    tick_count: u64,
    /// Seuil d'intervention critique
    intervention_threshold: f64,
}
/// Modes de régulation autonome
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum RegulationMode {
    /// Mode repos (parasympathique dominant)
    Rest,
    /// Mode équilibré (balance neutre)
    Balanced,
    /// Mode alerte (sympathique léger)
    Alert,
    /// Mode stress (sympathique dominant)
    Stress,
    /// Mode récupération (transition vers repos)
    Recovery,
/// Décision autonome prise par l'ANS
pub struct AutonomousDecision {
    /// Type de décision
    pub decision_type: DecisionType,
    /// Justification de la décision
    pub rationale: String,
    /// Confiance dans la décision (0.0-1.0)
    pub confidence: f64,
    /// Timestamp de la décision
    pub timestamp: u64,
    /// Impact attendu
    pub expected_impact: ImpactLevel,
/// Types de décisions autonomes
pub enum DecisionType {
    /// Augmenter ressources
    IncreaseResources,
    /// Réduire charge
    ReduceLoad,
    /// Activer mode repos
    ActivateRest,
    /// Activer mode alerte
    ActivateAlert,
    /// Déclencher récupération
    TriggerRecovery,
    /// Maintenir équilibre
    MaintainBalance,
    /// Intervention d'urgence
    EmergencyIntervention,
/// Niveau d'impact d'une décision
pub enum ImpactLevel {
    Low,
    Medium,
    High,
    Critical,
impl ANSState {
    /// Crée un nouvel état ANS
    pub fn new() -> Self {
        Self {
            regulation_mode: RegulationMode::Balanced,
            homeostasis: 0.8,
            sympathetic_activation: 0.3,
            parasympathetic_activation: 0.7,
            autonomic_balance: 0.0,
            system_variability: 0.5,
            adaptive_capacity: 1.0,
            autonomous_decisions: Vec::new(),
            homeostasis_history: VecDeque::with_capacity10,
            balance_history: VecDeque::with_capacity10,
            tick_count: 0,
            intervention_threshold: 0.3,
        }
    }
    /// Calcule l'homéostasie basée sur les métriques système
    fn calculate_homeostasis(
        &self,
        clarity: f64,
        tension: f64,
        alignment: f64,
        stability: f64,
    ) -> f64 {
        // Homéostasie = combinaison pondérée de:
        // - Clarté (25%) : système comprend son état
        // - Tension inversée (25%) : faible tension = bon
        // - Alignement (30%) : cohérence cognitive
        // - Stabilité (20%) : prévisibilité
        
        let inv_tension = 1.0 - tension;
        (clarity * 0.25 + inv_tension * 0.25 + alignment * 0.3 + stability * 0.2)
            .max0.0
            .min1.0
    /// Calcule la balance autonome
    fn calculate_autonomic_balance(
        load: f64,
        momentum: f64,
        // Balance = tension + charge + momentum
        // Positif = sympathique (activation)
        // Négatif = parasympathique (repos)
        let stress_factor = (tension * 0.4 + load * 0.4 + momentum.abs() * 0.2) * 2.0 - 1.0;
        stress_factor.max(-1.0).min1.0
    /// Calcule les activations sympathique/parasympathique
    fn calculate_activations(&mut self, balance: f64) {
        // Balance positive = sympathique actif
        if balance > 0.0 {
            self.sympathetic_activation = 0.5 + balance * 0.5;
            self.parasympathetic_activation = 0.5 - balance * 0.3;
        } else {
            // Balance négative = parasympathique actif
            self.sympathetic_activation = 0.5 + balance * 0.3;
            self.parasympathetic_activation = 0.5 - balance * 0.5;
        // Assurer bornes [0.0, 1.0]
        self.sympathetic_activation = self.sympathetic_activation.max0.0.min1.0;
        self.parasympathetic_activation = self.parasympathetic_activation.max0.0.min1.0;
    /// Détermine le mode de régulation
    fn determine_regulation_mode(&mut self, balance: f64, homeostasis: f64) {
        let previous_mode = self.regulation_mode;
        self.regulation_mode = if homeostasis < 0.3 {
            // Homéostasie critique -> récupération
            RegulationMode::Recovery
        } else if balance > 0.6 {
            // Stress élevé
            RegulationMode::Stress
        } else if balance > 0.2 {
            // Alerte modérée
            RegulationMode::Alert
        } else if balance < -0.3 {
            // Repos profond
            RegulationMode::Rest
            // Zone d'équilibre
            RegulationMode::Balanced
        };
        // Éviter oscillations trop rapides
        if previous_mode == RegulationMode::Stress && self.regulation_mode == RegulationMode::Balanced {
            self.regulation_mode = RegulationMode::Recovery;
    /// Calcule la variabilité du système
    fn calculate_variability(&self) -> f64 {
        if self.homeostasis_history.len() < 3 {
            return 0.5;
        // Variabilité = écart-type de l'homéostasie récente
        let mean: f64 = self.homeostasis_history.iter().sum::<f64>() 
            / self.homeostasis_history.len() as f64;
        let variance: f64 = self.homeostasis_history
            .iter()
            .map(|&x| x - mean.powi2)
            .sum::<f64>() / self.homeostasis_history.len() as f64;
        variance.sqrt().min1.0
    /// Calcule la capacité d'adaptation
    fn calculate_adaptive_capacity(&self, variability: f64, homeostasis: f64) -> f64 {
        // Capacité = homéostasie haute + variabilité modérée (flexibilité)
        // Variabilité idéale autour de 0.3-0.5
        let variability_score = if variability < 0.5 {
            variability * 2.0
            2.0 - variability * 2.0
        }.max0.0;
        (homeostasis * 0.6 + variability_score * 0.4).min1.0
    /// Prend des décisions autonomes si nécessaire
    fn make_autonomous_decisions(&mut self) {
        // Limiter à 5 décisions actives max
        self.autonomous_decisions.retain(|d| {
            self.tick_count - d.timestamp < 10
        });
        if self.autonomous_decisions.len() >= 5 {
            return;
        // Décision basée sur l'état actuel
        let decision = if self.homeostasis < self.intervention_threshold {
            Some(AutonomousDecision {
                decision_type: DecisionType::EmergencyIntervention,
                rationale: format!(
                    "Homéostasie critique ({:.2}) < seuil ({:.2})",
                    self.homeostasis, self.intervention_threshold
                ),
                confidence: 0.95,
                timestamp: self.tick_count,
                expected_impact: ImpactLevel::Critical,
            })
        } else if self.regulation_mode == RegulationMode::Stress 
            && self.sympathetic_activation > 0.8 {
                decision_type: DecisionType::TriggerRecovery,
                rationale: "Stress prolongé détecté, récupération nécessaire".to_string(),
                confidence: 0.85,
                expected_impact: ImpactLevel::High,
        } else if self.autonomic_balance > 0.7 {
                decision_type: DecisionType::ReduceLoad,
                rationale: "Balance sympathique excessive".to_string(),
                confidence: 0.75,
                expected_impact: ImpactLevel::Medium,
        } else if self.adaptive_capacity < 0.4 {
                decision_type: DecisionType::ActivateRest,
                rationale: "Capacité d'adaptation faible, repos recommandé".to_string(),
                confidence: 0.70,
        } else if self.homeostasis > 0.85 && self.regulation_mode == RegulationMode::Balanced {
                decision_type: DecisionType::MaintainBalance,
                rationale: "État optimal, maintenir l'équilibre".to_string(),
                confidence: 0.90,
                expected_impact: ImpactLevel::Low,
            None
        if let Some(decision) = decision {
            self.autonomous_decisions.push(decision);
/// Initialise le module ANS
pub fn init() -> Arc<Mutex<ANSState>> {
    Arc::new(Mutex::new(ANSState::new()))
/// Tick principal du module ANS
pub fn tick(
    state: &Arc<Mutex<ANSState>>,
    clarity: f64,
    tension: f64,
    alignment: f64,
    stability: f64,
    load: f64,
    momentum: f64,
) -> Result<(), String> {
    let mut ans = state.lock().map_err(|e| format!("Lock failed: {}", e))?;
    ans.tick_count += 1;
    // 1. Calculer l'homéostasie
    ans.homeostasis = ans.calculate_homeostasis(clarity, tension, alignment, stability);
    // 2. Calculer la balance autonome
    ans.autonomic_balance = ans.calculate_autonomic_balance(tension, load, momentum);
    // 3. Mettre à jour activations
    ans.calculate_activations(ans.autonomic_balance);
    // 4. Déterminer mode de régulation
    ans.determine_regulation_mode(ans.autonomic_balance, ans.homeostasis);
    // 5. Calculer variabilité
    ans.system_variability = ans.calculate_variability();
    // 6. Calculer capacité d'adaptation
    ans.adaptive_capacity = ans.calculate_adaptive_capacity(
        ans.system_variability,
        ans.homeostasis,
    );
    // 7. Prendre décisions autonomes si nécessaire
    ans.make_autonomous_decisions();
    // 8. Mettre à jour historiques
    if ans.homeostasis_history.len() >= 10 {
        ans.homeostasis_history.pop_front();
    ans.homeostasis_history.push_back(ans.homeostasis);
    if ans.balance_history.len() >= 10 {
        ans.balance_history.pop_front();
    ans.balance_history.push_back(ans.autonomic_balance);
    Ok(())
/// Retourne la santé du module ANS
pub fn health(state: &Arc<Mutex<ANSState>>) -> Result<ModuleHealth, String> {
    let ans = state.lock().map_err(|e| format!("Lock failed: {}", e))?;
    let status = if ans.homeostasis > 0.7 {
        "healthy".to_string()
    } else if ans.homeostasis > 0.4 {
        "degraded".to_string()
    } else {
        "critical".to_string()
    };
    Ok(ModuleHealth {
        status,
        cpu_usage: 0.5, // ANS est léger
        memory_usage: 1024 * 10, // ~10KB
        uptime: ans.tick_count,
    })
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_ans_initialization() {
        let state = init();
        let ans = state.lock().unwrap();
        assert_eq!(ans.regulation_mode, RegulationMode::Balanced);
        assert!(ans.homeostasis > 0.5);
        assert_eq!(ans.tick_count, 0);
    fn test_homeostasis_calculation() {
        let ans = ANSState::new();
        // État optimal
        let h1 = ans.calculate_homeostasis(0.9, 0.1, 0.9, 0.9);
        assert!(h1 > 0.8);
        // État critique
        let h2 = ans.calculate_homeostasis(0.2, 0.9, 0.2, 0.3);
        assert!(h2 < 0.4);
    fn test_autonomic_balance() {
        // Stress élevé -> balance positive (sympathique)
        let b1 = ans.calculate_autonomic_balance(0.9, 0.8, 0.5);
        assert!(b1 > 0.5);
        // Calme -> balance négative (parasympathique)
        let b2 = ans.calculate_autonomic_balance(0.1, 0.2, 0.0);
        assert!(b2 < 0.0);
    fn test_activations() {
        let mut ans = ANSState::new();
        // Balance sympathique
        ans.calculate_activations0.8;
        assert!(ans.sympathetic_activation > 0.8);
        assert!(ans.parasympathetic_activation < 0.4);
        // Balance parasympathique
        ans.calculate_activations(-0.8);
        assert!(ans.sympathetic_activation < 0.4);
        assert!(ans.parasympathetic_activation > 0.8);
    fn test_regulation_modes() {
        // Stress
        ans.determine_regulation_mode(0.7, 0.6);
        assert_eq!(ans.regulation_mode, RegulationMode::Stress);
        // Repos
        ans.determine_regulation_mode(-0.5, 0.7);
        assert_eq!(ans.regulation_mode, RegulationMode::Rest);
        // Récupération (homéostasie critique)
        ans.determine_regulation_mode(0.0, 0.2);
        assert_eq!(ans.regulation_mode, RegulationMode::Recovery);
    fn test_variability_calculation() {
        // Historique stable
        for _ in 0..5 {
            ans.homeostasis_history.push_back0.8;
        let v1 = ans.calculate_variability();
        assert!(v1 < 0.1); // Très faible variabilité
        // Historique variable
        ans.homeostasis_history.clear();
        ans.homeostasis_history.push_back0.3;
        ans.homeostasis_history.push_back0.7;
        ans.homeostasis_history.push_back0.5;
        ans.homeostasis_history.push_back0.9;
        let v2 = ans.calculate_variability();
        assert!(v2 > 0.2); // Variabilité élevée
    fn test_adaptive_capacity() {
        // Bonne capacité: homéostasie haute + variabilité modérée
        let c1 = ans.calculate_adaptive_capacity(0.4, 0.9);
        assert!(c1 > 0.7);
        // Mauvaise capacité: homéostasie basse
        let c2 = ans.calculate_adaptive_capacity(0.4, 0.3);
        assert!(c2 < 0.5);
    fn test_autonomous_decisions() {
        // Situation critique -> décision d'urgence
        ans.homeostasis = 0.2;
        ans.make_autonomous_decisions();
        assert_eq!(ans.autonomous_decisions.len(), 1);
        assert_eq!(
            ans.autonomous_decisions[0].decision_type,
            DecisionType::EmergencyIntervention
        );
        // Stress prolongé -> récupération
        ans.autonomous_decisions.clear();
        ans.homeostasis = 0.5;
        ans.regulation_mode = RegulationMode::Stress;
        ans.sympathetic_activation = 0.85;
        assert!(ans.autonomous_decisions.len() > 0);
    fn test_decision_expiration() {
        // Ajouter vieille décision
        ans.autonomous_decisions.push(AutonomousDecision {
            decision_type: DecisionType::MaintainBalance,
            rationale: "test".to_string(),
            confidence: 0.8,
            timestamp: 0,
            expected_impact: ImpactLevel::Low,
        ans.tick_count = 15; // 15 ticks plus tard
        // La vieille décision doit être supprimée (TTL = 10 ticks)
        assert_eq!(ans.autonomous_decisions.len(), 0);
    fn test_tick_integration() {
        // Plusieurs ticks avec métriques variées
        for i in 0..5 {
            let clarity = 0.7 + (i as f64) * 0.05;
            let tension = 0.3 - (i as f64) * 0.05;
            let result = tick(&state, clarity, tension, 0.8, 0.7, 0.4, 0.1);
            assert!(result.is_ok());
        assert_eq!(ans.tick_count, 5);
        assert!(ans.homeostasis_history.len() == 5);
    fn test_health_reporting() {
        tick(&state, 0.8, 0.3, 0.85, 0.75, 0.3, 0.1).unwrap();
        let health_result = health(&state);
        assert!(health_result.is_ok());
        let health_status = health_result.unwrap();
        assert_eq!(health_status.status, "healthy");
    fn test_mode_transition_smoothing() {
        // Transition stress -> balanced devrait passer par recovery
        ans.determine_regulation_mode(0.0, 0.6); // Balance neutre
    fn test_max_decisions_limit() {
        ans.homeostasis = 0.1; // Critique
        // Essayer de créer plus de 5 décisions
        for _ in 0..10 {
            ans.make_autonomous_decisions();
            ans.tick_count += 1;
        // Ne devrait jamais dépasser 5 décisions actives
        assert!(ans.autonomous_decisions.len() <= 5);

}
