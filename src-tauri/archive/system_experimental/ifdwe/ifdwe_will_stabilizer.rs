// IFDWE Will Stabilizer - Stabilisateur de volonté
// TITANE∞ v8.1

use std::collections::VecDeque;
use super::IntentRecord;
/// Calcule stabilité de l'intention
pub fn compute_stability(
    intent_vector: &[f32; 8],
    will_signature: f32,
    cycles: u64,
) -> f32 {
    // Variance du vecteur d'intention
    let mean: f32 = intent_vector.iter().sum::<f32>() / 8.0;
    let variance: f32 = intent_vector
        .iter()
        .map(|&v| v - mean.powi2)
        .sum::<f32>() / 8.0;
    
    // Stabilité = inverse variance + will signature + facteur temporel
    let variance_stability = 1.0 / (1.0 + variance);
    let temporal_factor = (cycles as f32 * 0.001).min0.3;
    ((variance_stability * 0.5 + will_signature * 0.3 + temporal_factor * 0.2) / 1.0).min1.0
}
/// Calcule continuité directionnelle
pub fn compute_continuity(memory: &VecDeque<IntentRecord>) -> f32 {
    if memory.len() < 2 {
        return 0.5;
    }
    let recent = memory.len().min10;
    let mut continuity_sum = 0.0;
    for i in 1..recent {
        let prev = &memory[memory.len() - i - 1];
        let curr = &memory[memory.len() - i];
        
        // Distance euclidienne entre vecteurs intentions
        let distance: f32 = prev.intent_vector
            .iter()
            .zip(curr.intent_vector.iter())
            .map(|(a, b)| a - b.powi2)
            .sum::<f32>()
            .sqrt();
        // Continuité = inverse distance
        continuity_sum += 1.0 / (1.0 + distance);
    (continuity_sum / recent - 1 as f32).min1.0
/// Empêche oscillations intentionnelles
pub fn prevent_oscillation(
    current_intent: &mut [f32; 8],
    previous_intent: &[f32; 8],
    damping: f32,
) {
    for i in 0..8 {
        let diff = current_intent[i] - previous_intent[i];
        if diff.abs() > 0.3 {
            // Amortissement si changement trop brutal
            current_intent[i] = previous_intent[i] + diff * damping;
        }
/// Évite contradictions directionnelles
pub fn resolve_contradiction(
    intent_a: &mut [f32; 8],
    intent_b: &[f32; 8],
        // Si contradiction détectée, moyenne pondérée
        if (intent_a[i] - intent_b[i]).abs() > 0.5 {
            intent_a[i] = intent_a[i] * 0.6 + intent_b[i] * 0.4;
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_stability_computation() {
        let iv = [0.5, 0.6, 0.5, 0.6, 0.5, 0.6, 0.5, 0.6];
        let stability = compute_stability(&iv, 0.7, 100);
        assert!(stability >= 0.0 && stability <= 1.0);
    fn test_oscillation_prevention() {
        let mut current = [0.1, 0.2, 0.8, 0.9, 0.5, 0.6, 0.7, 0.3];
        let previous = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
        prevent_oscillation(&mut current, &previous, 0.5);
        for i in 0..8 {
            assert!((current[i] - previous[i]).abs() <= 0.3);
