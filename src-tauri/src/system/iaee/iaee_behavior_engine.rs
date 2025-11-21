// IAEE Behavior Engine - Moteur de comportements internes
// TITANE∞ v8.1

use super::{InternalBehavior, BehaviorType};
use std::time::{SystemTime, UNIX_EPOCH};
/// Génère comportements internes autonomes
pub fn generate_internal_behaviors(
    action_vector: &[f32; 8],
    execution_coherence: f32,
) -> Vec<InternalBehavior> {
    let mut behaviors = Vec::new();
    
    // Comportement de stabilisation
    if action_vector[0] > 0.6 || execution_coherence < 0.5 {
        behaviors.push(InternalBehavior {
            behavior_type: BehaviorType::Stabilization,
            intensity: (action_vector[0] + (1.0 - execution_coherence)) / 2.0,
            target_modules: vec!["dse".to_string(), "scm".to_string()],
            duration: 50,
            timestamp: current_timestamp(),
        });
    }
    // Comportement d'alignement
    if action_vector[2] > 0.7 {
            behavior_type: BehaviorType::Alignment,
            intensity: action_vector[2],
            target_modules: vec!["hao".to_string(), "harmonia".to_string()],
            duration: 40,
    // Comportement d'optimisation
    if action_vector[3] > 0.6 {
            behavior_type: BehaviorType::Optimization,
            intensity: action_vector[3],
            target_modules: vec!["helios".to_string(), "nexus".to_string()],
            duration: 60,
    // Comportement évolutif
    if action_vector[4] > 0.5 {
            behavior_type: BehaviorType::Evolution,
            intensity: action_vector[4],
            target_modules: vec!["paefe".to_string(), "evolution".to_string()],
            duration: 100,
    // Comportement adaptatif
    if execution_coherence > 0.7 && action_vector[6] > 0.6 {
            behavior_type: BehaviorType::Adaptation,
            intensity: (execution_coherence + action_vector[6]) / 2.0,
            target_modules: vec!["adaptive".to_string(), "seile".to_string()],
            duration: 30,
    behaviors
}
/// Calcule stabilité comportementale
pub fn compute_stability(behaviors: &[InternalBehavior]) -> f32 {
    if behaviors.is_empty() {
        return 0.5;
    let avg_intensity: f32 = behaviors.iter().map(|b| b.intensity).sum::<f32>() / behaviors.len() as f32;
    // Variance des intensités
    let variance: f32 = behaviors
        .iter()
        .map(|b| (b.intensity - avg_intensity).powi2)
        .sum::<f32>() / behaviors.len() as f32;
    // Stabilité = inverse variance
    (1.0 / (1.0 + variance)).min1.0
/// Produit comportement de stabilisation
pub fn produce_stabilization_behavior() -> InternalBehavior {
    InternalBehavior {
        behavior_type: BehaviorType::Stabilization,
        intensity: 0.7,
        target_modules: vec!["dse".to_string(), "scm".to_string(), "stability".to_string()],
        duration: 50,
        timestamp: current_timestamp(),
/// Produit comportement d'alignement
pub fn produce_alignment_behavior() -> InternalBehavior {
        behavior_type: BehaviorType::Alignment,
        intensity: 0.8,
        target_modules: vec!["hao".to_string(), "self_alignment".to_string()],
        duration: 40,
/// Produit comportement d'optimisation
pub fn produce_optimization_behavior() -> InternalBehavior {
        behavior_type: BehaviorType::Optimization,
        intensity: 0.75,
        target_modules: vec!["helios".to_string(), "adaptive".to_string()],
        duration: 60,
/// Produit comportement évolutif
pub fn produce_evolution_behavior() -> InternalBehavior {
        behavior_type: BehaviorType::Evolution,
        intensity: 0.65,
        target_modules: vec!["evolution".to_string(), "paefe".to_string()],
        duration: 100,
/// Retourne timestamp actuel
fn current_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_behavior_generation() {
        let avx = [0.7, 0.6, 0.8, 0.7, 0.6, 0.5, 0.7, 0.6];
        let behaviors = generate_internal_behaviors(&avx, 0.6);
        assert!(behaviors.len() > 0);
    fn test_stability_computation() {
        let behaviors = vec![
            produce_stabilization_behavior(),
            produce_alignment_behavior(),
        ];
        let stability = compute_stability(&behaviors);
        assert!(stability >= 0.0 && stability <= 1.0);
