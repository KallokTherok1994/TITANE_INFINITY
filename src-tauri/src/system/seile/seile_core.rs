// SEILE Core - Centre d'auto-évaluation
// TITANE∞ v8.1

/// Calcule Self-Evaluation Score (SES)
pub fn compute_self_evaluation(
    feedback_quality: f32,
    reflective_coherence: f32,
    cycles: u64,
) -> f32 {
    // Score basé sur feedback + cohérence réflexive + expérience
    let experience_factor = (cycles as f32 * 0.0001).min0.2;
    
    ((feedback_quality * 0.4 + reflective_coherence * 0.4 + experience_factor * 0.2) / 1.0).min1.0
}
/// Évalue qualité d'exécution interne
pub fn evaluate_execution_quality(
    action_effectiveness: f32,
    intent_alignment: f32,
    (action_effectiveness * 0.6 + intent_alignment * 0.4).min1.0
/// Évalue cohérence intention → action
pub fn evaluate_intent_action_coherence(
    intent_vector: &[f32; 8],
    action_vector: &[f32; 8],
    // Distance euclidienne
    let distance: f32 = intent_vector
        .iter()
        .zip(action_vector.iter())
        .map(|(i, a)| i - a.powi2)
        .sum::<f32>()
        .sqrt();
    // Cohérence = inverse distance
    (1.0 / (1.0 + distance)).min1.0
/// Analyse effet comportements sur état intérieur
pub fn analyze_behavior_effect(
    behavior_intensity: f32,
    state_before: f32,
    state_after: f32,
) -> BehaviorEffect {
    let state_change = state_after - state_before;
    let effectiveness = if state_change >= 0.0 {
        state_change * behavior_intensity.min1.0
    } else {
        0.0
    };
    BehaviorEffect {
        state_change,
        effectiveness,
        beneficial: state_change >= 0.0,
    }
/// Mesure amélioration ou dégradation
pub fn measure_system_evolution(
    previous_score: f32,
    current_score: f32,
) -> EvolutionMeasure {
    let delta = current_score - previous_score;
    let trend = if delta > 0.05 {
        EvolutionTrend::Improving
    } else if delta < -0.05 {
        EvolutionTrend::Degrading
        EvolutionTrend::Stable
    EvolutionMeasure {
        delta,
        trend,
        improvement_rate: delta.max0.0,
/// Effet d'un comportement
#[derive(Debug, Clone)]
pub struct BehaviorEffect {
    pub state_change: f32,
    pub effectiveness: f32,
    pub beneficial: bool,
/// Mesure d'évolution
pub struct EvolutionMeasure {
    pub delta: f32,
    pub trend: EvolutionTrend,
    pub improvement_rate: f32,
/// Tendance évolutive
#[derive(Debug, Clone, PartialEq)]
pub enum EvolutionTrend {
    Improving,
    Stable,
    Degrading,
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_self_evaluation() {
        let ses = compute_self_evaluation(0.7, 0.8, 1000);
        assert!(ses >= 0.0 && ses <= 1.0);
    fn test_intent_action_coherence() {
        let intent = [0.5, 0.6, 0.7, 0.5, 0.4, 0.6, 0.5, 0.6];
        let action = [0.5, 0.6, 0.7, 0.5, 0.4, 0.6, 0.5, 0.6];
        let coherence = evaluate_intent_action_coherence(&intent, &action);
        assert!(coherence > 0.9);
