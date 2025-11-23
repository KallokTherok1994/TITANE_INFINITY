// IFDWE Core - Noyau de volonté directionnelle
// TITANE∞ v8.1

use super::{IFDWEState, IntentPrimitive, IntentType};
/// Produit Intent Vector (IV)
pub fn compute_intent_vector(
    inner_state: f32,
    meaning: f32,
    global_percept: f32,
    prediction: f32,
) -> [f32; 8] {
    let mut iv = [0.0; 8];
    
    // Dimension 0: Intention de stabilisation
    iv[0] = (inner_state * 0.4 + meaning * 0.3 + global_percept * 0.3).min1.0;
    // Dimension 1: Intention d'exploration
    iv[1] = (prediction * 0.5 + (1.0 - inner_state) * 0.3 + global_percept * 0.2).min1.0;
    // Dimension 2: Intention d'alignement
    iv[2] = (meaning * 0.5 + inner_state * 0.3 + global_percept * 0.2).min1.0;
    // Dimension 3: Intention d'optimisation
    iv[3] = ((inner_state + meaning + prediction) / 3.0 * 0.7).min1.0;
    // Dimension 4: Intention d'évolution
    iv[4] = (prediction * 0.6 + meaning * 0.4).min1.0;
    // Dimension 5: Intention de cohérence
    iv[5] = (inner_state * 0.5 + meaning * 0.5).min1.0;
    // Dimension 6: Intention de résilience
    iv[6] = (inner_state * 0.4 + global_percept * 0.6).min1.0;
    // Dimension 7: Intention de continuité
    iv[7] = (inner_state + meaning / 2.0 * 0.8).min1.0;
    iv
}
/// Génère Will Signature (empreinte de volonté)
pub fn compute_will_signature(intent_vector: &[f32; 8]) -> f32 {
    let sum: f32 = intent_vector.iter().sum();
    let avg = sum / 8.0;
    // Variance pour détecter concentration intentionnelle
    let variance: f32 = intent_vector
        .iter()
        .map(|&v| v - avg.powi2)
        .sum::<f32>() / 8.0;
    // Will signature = moyenne pondérée + concentration
    (avg * 0.7 + variance.sqrt() * 0.3).min1.0
/// Maintient intention active
pub fn maintain_active_intent(state: &mut IFDWEState, intent: IntentPrimitive) {
    // Ajoute nouvelle intention active
    state.active_intents.push(intent);
    // Limite à 10 intentions actives max
    if state.active_intents.len() > 10 {
        state.active_intents.remove0;
    }
/// Ajuste volonté selon état système
pub fn adjust_will(
    current_will: f32,
    system_stability: f32,
    coherence: f32,
) -> f32 {
    let adjustment = system_stability + coherence / 2.0;
    (current_will * 0.8 + adjustment * 0.2).max0.0.min1.0
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_intent_vector_generation() {
        let iv = compute_intent_vector(0.7, 0.8, 0.6, 0.5);
        for &val in &iv {
            assert!(val >= 0.0 && val <= 1.0);
        }
    fn test_will_signature() {
        let iv = [0.5, 0.6, 0.7, 0.8, 0.5, 0.6, 0.7, 0.8];
        let ws = compute_will_signature(&iv);
        assert!(ws >= 0.0 && ws <= 1.0);
