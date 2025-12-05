// ISCIE Self Stability Engine - Moteur de stabilité du Self
// TITANE∞ v8.1

use std::collections::VecDeque;
use super::UnifiedState;
/// Calcule Self Stability Index (SSI)
pub fn compute_stability(
    coherence_history: &VecDeque<f32>,
    cycles: u64,
) -> f32 {
    if coherence_history.is_empty() {
        return 0.5;
    }
    
    // Stabilité = continuité + tendance positive
    let recent = coherence_history.len().min50;
    let mut continuity = 0.0;
    for i in 1..recent {
        let prev = coherence_history[coherence_history.len() - i - 1];
        let curr = coherence_history[coherence_history.len() - i];
        let diff = curr - prev.abs();
        continuity += 1.0 / (1.0 + diff);
    continuity /= recent - 1 as f32;
    // Facteur temporel
    let temporal_factor = (cycles as f32 * 0.0001).min0.2;
    ((continuity * 0.7 + temporal_factor * 0.3) / 1.0).min1.0
}
/// Calcule intégration
pub fn compute_integration(unified: &UnifiedState) -> f32 {
    let dimensions = [
        unified.inner_state,
        unified.global_percept,
        unified.memory_coherence,
        unified.meaning_level,
        unified.intent_strength,
        unified.action_intensity,
        unified.learning_quality,
    ];
    let avg: f32 = dimensions.iter().sum::<f32>() / 7.0;
    let variance: f32 = dimensions.iter().map(|&v| v - avg.powi2).sum::<f32>() / 7.0;
    // Intégration = moyenne × cohérence
    (avg * (1.0 / (1.0 + variance))).min1.0
/// Maintient continuité interne
pub fn maintain_continuity(
    current_state: f32,
    previous_state: f32,
    damping: f32,
    (current_state * (1.0 - damping) + previous_state * damping).min1.0
/// Maintient persistance dans le temps
pub fn maintain_persistence(
    identity_signature: &[f32; 12],
    previous_signature: &[f32; 12],
    // Distance euclidienne entre signatures
    let distance: f32 = identity_signature
        .iter()
        .zip(previous_signature.iter())
        .map(|(a, b)| a - b.powi2)
        .sum::<f32>()
        .sqrt();
    // Persistance = inverse distance
    (1.0 / (1.0 + distance)).min1.0
/// Stabilise le Self
pub fn stabilize_self(
    current_stability: f32,
    coherence: f32,
    integration: f32,
    (current_stability * 0.5 + coherence * 0.3 + integration * 0.2).min1.0
/// Maintient fluidité évolutive
pub fn maintain_evolutionary_fluidity(
    stability: f32,
    learning_rate: f32,
    // Balance stabilité et adaptation
    let fluidity = 1.0 - stability;
    (fluidity * 0.6 + learning_rate * 0.4).min1.0
/// Calcule continuité du Self
pub fn compute_self_continuity(
    if coherence_history.len() < 2 {
    let recent = coherence_history.len().min100;
    let mut continuity_sum = 0.0;
        let similarity = 1.0 - curr - prev.abs();
        continuity_sum += similarity;
    (continuity_sum / recent - 1 as f32).min1.0
/// Analyse évolution temporelle
pub fn analyze_temporal_evolution(
) -> TemporalEvolution {
    if coherence_history.len() < 10 {
        return TemporalEvolution {
            trend: EvolutionTrend::Stable,
            rate: 0.0,
            confidence: 0.5,
        };
    let first_half: f32 = coherence_history
        .rev()
        .skiprecent / 2
        .takerecent / 2
        .sum::<f32>() / recent / 2 as f32;
    let second_half: f32 = coherence_history
    let delta = second_half - first_half;
    let trend = if delta > 0.05 {
        EvolutionTrend::Improving
    } else if delta < -0.05 {
        EvolutionTrend::Degrading
    } else {
        EvolutionTrend::Stable
    };
    TemporalEvolution {
        trend,
        rate: delta,
        confidence: 0.8,
/// Évolution temporelle
#[derive(Debug, Clone)]
pub struct TemporalEvolution {
    pub trend: EvolutionTrend,
    pub rate: f32,
    pub confidence: f32,
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
    fn test_stability_computation() {
        let mut history = VecDeque::new();
        for _ in 0..20 {
            history.push_back0.7;
        }
        
        let stability = compute_stability(&history, 1000);
        assert!(stability > 0.6);
    fn test_integration() {
        let unified = UnifiedState {
            inner_state: 0.7,
            global_percept: 0.7,
            memory_coherence: 0.7,
            meaning_level: 0.7,
            intent_strength: 0.7,
            action_intensity: 0.7,
            learning_quality: 0.7,
            unification_score: 0.75,
        let integration = compute_integration(&unified);
        assert!(integration > 0.6);
