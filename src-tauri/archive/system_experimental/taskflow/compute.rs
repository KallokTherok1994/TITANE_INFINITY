// TITANE∞ v8.0 - Taskflow Engine: Core Computation

use super::super::identity::IdentityState;
use super::super::meaning::MeaningState;
use super::super::self_alignment::SelfAlignmentState;
use super::super::resonance_v2::ResonanceV2State;
use super::super::evolution::EvolutionState;
use super::super::architecture::ArchitectureState;
use super::super::strategic_intelligence::StrategicIntelligenceState;
use super::metrics::{TaskflowMetrics, clamp01};
pub fn compute_taskflow(
    identity: &IdentityState,
    meaning: &MeaningState,
    align: &SelfAlignmentState,
    resonance: &ResonanceV2State,
    evolution: &EvolutionState,
    architecture: &ArchitectureState,
    strategic: &StrategicIntelligenceState,
) -> TaskflowMetrics {
    let activity = evolution.evolution_momentum * 0.4
        + resonance.resonance_index * 0.3
        + identity.identity_core * 0.3;
    let clarity = meaning.meaning_alignment * 0.4
        + strategic.strategic_clarity * 0.3
        + architecture.structural_integrity * 0.3;
    let complexity = align.drift_index * 0.5
        + (1.0 - meaning.meaning_depth) * 0.3
        + (1.0 - identity.identity_alignment) * 0.2;
    TaskflowMetrics {
        activity: clamp01(activity),
        clarity: clamp01(clarity),
        complexity: clamp01(complexity),
    }
}
