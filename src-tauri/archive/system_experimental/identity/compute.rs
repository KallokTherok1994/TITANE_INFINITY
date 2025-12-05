// TITANE∞ v8.0 - Identity Engine: Core Computation

use super::super::meaning::MeaningState;
use super::super::resonance_v2::ResonanceV2State;
use super::super::architecture::ArchitectureState;
use super::super::meta_integration::MetaIntegrationState;
use super::super::strategic_intelligence::StrategicIntelligenceState;
use super::super::evolution::EvolutionState;
use super::super::continuum::ContinuumState;
use super::super::energetic::EnergeticState;
use super::metrics::{IdentityMetrics, clamp01};
pub fn compute_identity(
    meaning: &MeaningState,
    resonance: &ResonanceV2State,
    architecture: &ArchitectureState,
    meta: &MetaIntegrationState,
    strategic: &StrategicIntelligenceState,
    evolution: &EvolutionState,
    continuum: &ContinuumState,
    energetic: &EnergeticState,
) -> IdentityMetrics {
    // CORE → stabilité + structure + résonance
    let mut core = architecture.structural_integrity * 0.4
        + resonance.resonance_index * 0.3
        + meaning.meaning_depth * 0.3;
    core = clamp01(core);
    // ALIGNMENT → cohérence interne + sens + orientation
    let mut alignment = meaning.meaning_alignment * 0.4
        + meta.global_integration * 0.3
        + strategic.strategic_clarity * 0.2
        + resonance.coherence_harmonic_index * 0.1;
    alignment = clamp01(alignment);
    // CONTINUITY → trajectoire + continuité + évolution
    let mut continuity = continuum.continuity_index * 0.4
        + evolution.evolution_momentum * 0.35
        + energetic.energy_level * 0.25;
    continuity = clamp01(continuity);
    IdentityMetrics {
        core,
        alignment,
        continuity,
    }
}
