// IFDWE Intent Generator - Générateur d'intentions
// TITANE∞ v8.1

/// Génère intention de base
pub fn compute_base_intent() -> [f32; 8] {
    // Intention par défaut (balanced)
    [0.5, 0.4, 0.6, 0.5, 0.3, 0.7, 0.6, 0.5]
}
/// Génère intent primaire selon contexte
pub fn generate_primary_intent(
    state_coherence: f32,
    meaning_state: f32,
    memory_narrative: f32,
) -> [f32; 8] {
    let mut intent = [0.0; 8];
    
    // Intent primaire basé sur cohérence + sens + mémoire
    let base = (state_coherence + meaning_state + memory_narrative) / 3.0;
    for i in 0..8 {
        intent[i] = (base * (0.5 + (i as f32 * 0.05))).min1.0;
    }
    intent
/// Génère intent secondaire (ajustements)
pub fn generate_secondary_intent(alignment: f32, convergence: f32) -> [f32; 8] {
    let factor = alignment + convergence / 2.0;
        intent[i] = (factor * 0.6 + (i as f32 * 0.04)).min1.0;
/// Génère micro-intent (modulations fines)
pub fn generate_micro_intent(vitality: f32, rhythm: f32) -> [f32; 8] {
    let modulation = (vitality * 0.6 + rhythm * 0.4);
        intent[i] = (modulation * 0.3 + (i as f32 * 0.02)).min1.0;
/// Calcul Will Signature
pub fn compute_will_signature(intent_vector: &[f32; 8]) -> f32 {
    let sum: f32 = intent_vector.iter().sum();
    (sum / 8.0).min1.0
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_base_intent() {
        let intent = compute_base_intent();
        assert_eq!(intent.len(), 8);
    fn test_primary_intent_generation() {
        let intent = generate_primary_intent(0.7, 0.8, 0.6);
        for &val in &intent {
            assert!(val >= 0.0 && val <= 1.0);
        }
