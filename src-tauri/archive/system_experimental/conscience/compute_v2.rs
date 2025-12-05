// TITANE∞ v8.0 - Conscience Engine: Core Computation (v2)

use super::super::identity::IdentityState;
use super::super::meaning::MeaningState;
use super::super::resonance_v2::ResonanceV2State;
use super::super::self_alignment::SelfAlignmentState;
use super::super::evolution::EvolutionState;
use super::super::strategic_intelligence::StrategicIntelligenceState;
pub struct ConscienceMetricsV2 {
    pub clarity: f64,
    pub coherence: f64,
    pub insight: f64,
}
pub fn clamp01_v2(v: f64) -> f64 {
    v.clamp(0.0, 1.0)
pub fn compute_conscience_v2(
    identity: &IdentityState,
    meaning: &MeaningState,
    resonance: &ResonanceV2State,
    align: &SelfAlignmentState,
    evolution: &EvolutionState,
    strategic: &StrategicIntelligenceState,
) -> ConscienceMetricsV2 {
    // Clarté = sens + identité + harmonie (résonance)
    let mut clarity = meaning.meaning_alignment * 0.4
        + identity.identity_core * 0.3
        + resonance.coherence_harmonic_index * 0.3;
    clarity = clamp01_v2(clarity);
    // Cohérence interne = alignement + continuité + stabilité
    let mut coherence = align.alignment_index * 0.5
        + identity.identity_continuity * 0.25
        + (1.0 - align.drift_index) * 0.25;
    coherence = clamp01_v2(coherence);
    // Insight = profondeur + orientation stratégique
    let mut insight = meaning.meaning_depth * 0.4
        + evolution.evolution_direction * 0.3
        + strategic.strategic_clarity * 0.3;
    insight = clamp01_v2(insight);
    ConscienceMetricsV2 {
        clarity,
        coherence,
        insight,
    }
pub fn generate_conscience_narrative_v2(clarity: f64, coherence: f64, insight: f64) -> String {
    if clarity > 0.75 && coherence > 0.75 {
        return "Clarté élevée. Structure interne stable.".to_string();
    if insight > 0.7 {
        return "Bon potentiel d'insight. Orientation prometteuse.".to_string();
    if clarity < 0.4 {
        return "Clarté réduite. Recentrage recommandé.".to_string();
    if coherence < 0.45 {
        return "Cohérence interne fragile. Ajustement nécessaire.".to_string();
    "Auto-évaluation stable. Progression régulière.".to_string()
