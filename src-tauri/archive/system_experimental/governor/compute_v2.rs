// TITANE∞ v8.0 - Governor Engine: Core Computation (v2)

use super::super::identity::IdentityState;
use super::super::meaning::MeaningState;
use super::super::self_alignment::SelfAlignmentState;
use super::super::resonance_v2::ResonanceV2State;
use super::super::evolution::EvolutionState;
use super::super::architecture::ArchitectureState;
use super::super::strategic_intelligence::StrategicIntelligenceState;
pub struct GovernorMetricsV2 {
    pub regulation: f64,
    pub deviation: f64,
    pub homeostasis: f64,
}
pub fn clamp01_v2(v: f64) -> f64 {
    v.clamp(0.0, 1.0)
pub fn compute_governor_v2(
    identity: &IdentityState,
    meaning: &MeaningState,
    align: &SelfAlignmentState,
    resonance: &ResonanceV2State,
    evolution: &EvolutionState,
    _architecture: &ArchitectureState,
    strategic: &StrategicIntelligenceState,
) -> GovernorMetricsV2 {
    // Besoin de régulation = dérive + désalignement + instabilité
    let mut regulation = align.drift_index * 0.4
        + (1.0 - identity.identity_continuity) * 0.3
        + (1.0 - meaning.meaning_alignment) * 0.3;
    regulation = clamp01_v2(regulation);
    // Dérive interne = tension entre axes
    let mut deviation = (evolution.evolution_direction - resonance.resonance_index).abs() * 0.4
        + (strategic.strategic_clarity - meaning.meaning_orientation).abs() * 0.6;
    deviation = clamp01_v2(deviation);
    // Homéostasie globale = cohérence + stabilité
    let mut homeostasis = identity.identity_core * 0.35
        + meaning.meaning_depth * 0.35
        + resonance.coherence_harmonic_index * 0.30;
    homeostasis = clamp01_v2(homeostasis);
    GovernorMetricsV2 {
        regulation,
        deviation,
        homeostasis,
    }
pub fn build_governor_directive_v2(regulation: f64, deviation: f64, homeostasis: f64) -> String {
    if homeostasis > 0.75 {
        return "Maintenir l'équilibre actuel.".to_string();
    if regulation > 0.6 {
        return "Ralentir et stabiliser les processus internes.".to_string();
    if deviation > 0.6 {
        return "Réduire la dérive cognitive, recentrer les axes.".to_string();
    if homeostasis < 0.4 {
        return "Renforcer la stabilité avant progression.".to_string();
    "Continuer avec vigilance et ajustements légers.".to_string()
