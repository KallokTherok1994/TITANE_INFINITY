// ISCIE Identity Emergence Layer - Construction de l'empreinte identitaire
// TITANE∞ v8.1

use super::{UnifiedState, IdentityTrait, TraitType};
use std::time::{SystemTime, UNIX_EPOCH};
/// Construit Identity Signature (IdS)
pub fn construct_signature(
    unified_state: &UnifiedState,
    traits: &[IdentityTrait],
) -> [f32; 12] {
    let mut signature = [0.0; 12];
    
    // Dimension 0-2: Cognitive
    signature[0] = unified_state.inner_state;
    signature[1] = unified_state.global_percept;
    signature[2] = unified_state.memory_coherence;
    // Dimension 3-5: Intentional
    signature[3] = unified_state.meaning_level;
    signature[4] = unified_state.intent_strength;
    signature[5] = unified_state.action_intensity;
    // Dimension 6-7: Adaptive
    signature[6] = unified_state.learning_quality;
    signature[7] = unified_state.unification_score;
    // Dimension 8-11: Traits
    let trait_strength = compute_trait_strength(traits);
    signature[8] = trait_strength.stability;
    signature[9] = trait_strength.adaptability;
    signature[10] = trait_strength.coherence;
    signature[11] = trait_strength.intentionality;
    signature
}
/// Calcule force des traits
fn compute_trait_strength(traits: &[IdentityTrait]) -> TraitStrength {
    let mut strength = TraitStrength {
        stability: 0.5,
        adaptability: 0.5,
        coherence: 0.5,
        intentionality: 0.5,
        reflectivity: 0.5,
    };
    for trait_item in traits {
        match trait_item.trait_type {
            TraitType::Stability => strength.stability = (strength.stability + trait_item.strength) / 2.0,
            TraitType::Adaptability => strength.adaptability = (strength.adaptability + trait_item.strength) / 2.0,
            TraitType::Coherence => strength.coherence = (strength.coherence + trait_item.strength) / 2.0,
            TraitType::Intentionality => strength.intentionality = (strength.intentionality + trait_item.strength) / 2.0,
            TraitType::Reflectivity => strength.reflectivity = (strength.reflectivity + trait_item.strength) / 2.0,
        }
    }
    strength
/// Calcule cohérence de la signature
pub fn compute_coherence(signature: &[f32; 12]) -> f32 {
    let avg: f32 = signature.iter().sum::<f32>() / 12.0;
    let variance: f32 = signature.iter().map(|&v| v - avg.powi2).sum::<f32>() / 12.0;
    // Cohérence = inverse variance
    (1.0 / (1.0 + variance)).min1.0
/// Identifie patterns permanents
pub fn identify_permanent_patterns(
    signature_history: &[[f32; 12]],
) -> Vec<PermanentPattern> {
    let mut patterns = Vec::new();
    if signature_history.len() < 10 {
        return patterns;
    // Analyse stabilité de chaque dimension
    for dim in 0..12 {
        let values: Vec<f32> = signature_history.iter().map(|s| s[dim]).collect();
        let avg: f32 = values.iter().sum::<f32>() / values.len() as f32;
        let variance: f32 = values.iter().map(|&v| v - avg.powi2).sum::<f32>() / values.len() as f32;
        
        if variance < 0.05 {
            // Pattern stable détecté
            patterns.push(PermanentPattern {
                dimension: dim,
                stable_value: avg,
                persistence: signature_history.len() as u64,
            });
    patterns
/// Identifie traits structurels récurrents
pub fn identify_structural_traits(
) -> Vec<IdentityTrait> {
    let mut traits = Vec::new();
    // Trait de stabilité
    if unified_state.unification_score > 0.7 {
        traits.push(IdentityTrait {
            trait_type: TraitType::Stability,
            strength: unified_state.unification_score,
            persistence: 0,
            timestamp: current_timestamp(),
        });
    // Trait d'adaptabilité
    if unified_state.learning_quality > 0.7 {
            trait_type: TraitType::Adaptability,
            strength: unified_state.learning_quality,
    // Trait de cohérence
    let coherence_avg = (unified_state.inner_state + unified_state.memory_coherence) / 2.0;
    if coherence_avg > 0.7 {
            trait_type: TraitType::Coherence,
            strength: coherence_avg,
    // Trait d'intentionnalité
    if unified_state.intent_strength > 0.6 {
            trait_type: TraitType::Intentionality,
            strength: unified_state.intent_strength,
    traits
/// Identifie cohérences persistantes
pub fn identify_persistent_coherences(
    coherence_history: &[f32],
) -> f32 {
    if coherence_history.is_empty() {
        return 0.5;
    let recent = coherence_history.len().min50;
    let avg: f32 = coherence_history.iter().rev().take(recent).sum::<f32>() / recent as f32;
    avg.min1.0
/// Force des traits
#[derive(Debug, Clone)]
struct TraitStrength {
    pub stability: f32,
    pub adaptability: f32,
    pub coherence: f32,
    pub intentionality: f32,
    pub reflectivity: f32,
/// Pattern permanent
pub struct PermanentPattern {
    pub dimension: usize,
    pub stable_value: f32,
    pub persistence: u64,
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
    fn test_signature_construction() {
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
        let traits = vec![];
        let signature = construct_signature(&unified, &traits);
        for &val in &signature {
            assert!(val >= 0.0 && val <= 1.0);
    fn test_coherence_computation() {
        let signature = [0.7; 12];
        let coherence = compute_coherence(&signature);
        assert!(coherence > 0.9);
