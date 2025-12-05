// DSE Coherence Layer - Calcul cohérence globale

pub fn compute_global_coherence(
    cognitive_tempo: f32,
    energetic_flux: f32,
    evolution_momentum: f32,
) -> f32 {
    let coherence = 
        cognitive_tempo * 0.40 +
        energetic_flux * 0.35 +
        evolution_momentum * 0.25;
    
    coherence.clamp(0.0, 1.0)
}
pub fn compute_cognitive_coherence(
    clarity: f32,
    insight: f32,
    plasticity: f32,
    (clarity * 0.4 + insight * 0.3 + plasticity * 0.3).clamp(0.0, 1.0)
