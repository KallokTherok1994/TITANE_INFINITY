// TITANE∞ v8.0 - Meaning Engine: Analysis & Computation

use super::super::resonance_v2::ResonanceV2State;
use super::super::architecture::ArchitectureState;
use super::super::meta_integration::MetaIntegrationState;
use super::super::strategic_intelligence::StrategicIntelligenceState;
use super::super::evolution::EvolutionState;
use super::super::continuum::ContinuumState;
use super::super::energetic::EnergeticState;
use super::metrics::{MeaningMetrics, clamp01};
pub fn compute_meaning(
    resonance: &ResonanceV2State,
    architecture: &ArchitectureState,
    meta: &MetaIntegrationState,
    strategic: &StrategicIntelligenceState,
    evolution: &EvolutionState,
    continuum: &ContinuumState,
    energetic: &EnergeticState,
) -> MeaningMetrics {
    // ALIGNMENT → cohérence + structure + architecture
    let mut alignment = resonance.coherence_harmonic_index * 0.4
        + architecture.structural_integrity * 0.3
        + meta.global_integration * 0.2
        + strategic.strategic_clarity * 0.1;
    alignment = clamp01(alignment);
    // DEPTH → continuité + évolution + vitalité
    let mut depth = continuum.continuity_index * 0.4
        + evolution.evolution_momentum * 0.35
        + energetic.energy_level * 0.25;
    depth = clamp01(depth);
    // ORIENTATION → direction stratégique + alignement long terme
    let mut orientation = strategic.long_term_alignment * 0.5
        + evolution.evolution_momentum * 0.3
        + resonance.resonance_index * 0.2;
    orientation = clamp01(orientation);
    MeaningMetrics {
        alignment,
        depth,
        orientation,
    }
}
