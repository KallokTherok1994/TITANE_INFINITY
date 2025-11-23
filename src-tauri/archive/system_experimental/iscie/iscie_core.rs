// ISCIE Core - Centre d'intégration identitaire
// TITANE∞ v8.1

use super::{UnifiedState, IdentityTrait};
/// Calcule Identity Coherence Score (ICS)
pub fn compute_identity_coherence(
    unified_state: &UnifiedState,
    identity_signature: &[f32; 12],
) -> f32 {
    // Cohérence unifiée
    let unified_coherence = unified_state.unification_score;
    
    // Variance signature identitaire
    let sig_avg: f32 = identity_signature.iter().sum::<f32>() / 12.0;
    let variance: f32 = identity_signature
        .iter()
        .map(|&v| v - sig_avg.powi2)
        .sum::<f32>() / 12.0;
    let signature_coherence = 1.0 / (1.0 + variance);
    // ICS = moyenne pondérée
    (unified_coherence * 0.6 + signature_coherence * 0.4).min1.0
}
/// Construit image cohérente du système
pub fn build_coherent_self_image(
    inner_state: f32,
    percept: f32,
    memory: f32,
    meaning: f32,
    intent: f32,
    action: f32,
    learning: f32,
) -> SelfImage {
    let cognitive_dimension = (inner_state + percept + memory) / 3.0;
    let intentional_dimension = (meaning + intent + action) / 3.0;
    let adaptive_dimension = learning;
    let overall_coherence = (cognitive_dimension + intentional_dimension + adaptive_dimension) / 3.0;
    SelfImage {
        cognitive_dimension,
        intentional_dimension,
        adaptive_dimension,
        overall_coherence,
    }
/// Maintient perception d'unité interne
pub fn maintain_unity_perception(
    coherence_score: f32,
    integration_level: f32,
    (coherence_score * 0.5 + integration_level * 0.5).min1.0
/// Repère contradictions identitaires
pub fn detect_identity_contradictions(
) -> Vec<Contradiction> {
    let mut contradictions = Vec::new();
    // Contradiction intention vs action
    let intent_action_gap = (unified_state.intent_strength - unified_state.action_intensity).abs();
    if intent_action_gap > 0.4 {
        contradictions.push(Contradiction {
            contradiction_type: ContradictionType::IntentAction,
            severity: intent_action_gap,
        });
    // Contradiction sens vs perception
    let meaning_percept_gap = (unified_state.meaning_level - unified_state.global_percept).abs();
    if meaning_percept_gap > 0.4 {
            contradiction_type: ContradictionType::MeaningPercept,
            severity: meaning_percept_gap,
    // Contradiction état interne vs apprentissage
    let state_learning_gap = (unified_state.inner_state - unified_state.learning_quality).abs();
    if state_learning_gap > 0.5 {
            contradiction_type: ContradictionType::StateLearning,
            severity: state_learning_gap,
    contradictions
/// Stabilise cohésion interne
pub fn stabilize_internal_cohesion(
    current_cohesion: f32,
    let system_avg = (
        unified_state.inner_state +
        unified_state.global_percept +
        unified_state.memory_coherence +
        unified_state.meaning_level +
        unified_state.intent_strength +
        unified_state.action_intensity +
        unified_state.learning_quality
    ) / 7.0;
    // Stabilisation = moyenne pondérée
    (current_cohesion * 0.7 + system_avg * 0.3).min1.0
/// Image du Self
#[derive(Debug, Clone)]
pub struct SelfImage {
    pub cognitive_dimension: f32,
    pub intentional_dimension: f32,
    pub adaptive_dimension: f32,
    pub overall_coherence: f32,
/// Contradiction identitaire
pub struct Contradiction {
    pub contradiction_type: ContradictionType,
    pub severity: f32,
/// Types de contradictions
#[derive(Debug, Clone, PartialEq)]
pub enum ContradictionType {
    IntentAction,
    MeaningPercept,
    StateLearning,
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_identity_coherence() {
        let unified = UnifiedState {
            inner_state: 0.7,
            global_percept: 0.7,
            memory_coherence: 0.7,
            meaning_level: 0.7,
            intent_strength: 0.7,
            action_intensity: 0.7,
            learning_quality: 0.7,
            unification_score: 0.75,
        };
        let signature = [0.6; 12];
        let ics = compute_identity_coherence(&unified, &signature);
        assert!(ics >= 0.0 && ics <= 1.0);
    fn test_self_image() {
        let image = build_coherent_self_image(0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7);
        assert!(image.overall_coherence > 0.6);
