use super::super::strategic_intelligence::StrategicIntelligenceState;
use super::super::intention::IntentionState;
use super::super::action_potential::ActionPotentialState;
use super::super::executive_flow::ExecutiveFlowState;
use super::super::central_governor::CentralGovernorState;
use super::super::architecture::ArchitectureState;
use super::super::meta_integration::MetaIntegrationState;
use super::super::harmonic_brain::HarmonicBrainState;
use super::super::sentient::SentientState;
use super::super::evolution::EvolutionState;

use super::types::*;
pub struct DashboardRaw {
    pub overview_map: DashboardStateMap,
}
pub fn collect_dashboard_inputs(
    strategic: &StrategicIntelligenceState,
    intention: &IntentionState,
    action: &ActionPotentialState,
    executive: &ExecutiveFlowState,
    central: &CentralGovernorState,
    architecture: &ArchitectureState,
    meta: &MetaIntegrationState,
    harmonic: &HarmonicBrainState,
    sentient: &SentientState,
    evolution: &EvolutionState,
) -> DashboardRaw {
    DashboardRaw {
        overview_map: DashboardStateMap {
            strategic: StrategicBlock {
                strategic_clarity: strategic.strategic_clarity,
                directional_focus: strategic.directional_focus,
                long_term_alignment: strategic.long_term_alignment,
            },
            intention: IntentionBlock {
                intentional_drive: intention.intentional_drive,
                directional_coherence: intention.directional_coherence,
                potential_alignment: intention.potential_alignment,
            action: ActionBlock {
                activation_potential: action.activation_potential,
                readiness_level: action.readiness_level,
                expression_gate: action.expression_gate,
            executive: ExecutiveBlock {
                executive_load: executive.executive_load,
                priority_index: executive.priority_index,
                alert_level: executive.alert_level,
            central: CentralBlock {
                regulation_profile: central.regulation_profile,
                safety_margin: central.safety_margin,
                adaptive_stability: central.adaptive_stability,
            architecture: ArchitectureBlock {
                structural_integrity: architecture.structural_integrity,
                cognitive_geometry: architecture.cognitive_geometry,
                architectural_coherence: architecture.architectural_coherence,
            integration: IntegrationBlock {
                global_integration: meta.global_integration,
                systemic_coherence: meta.systemic_coherence,
                alignment_index: meta.alignment_index,
            harmonic: HarmonicBlock {
                neuro_harmony: harmonic.neuro_harmony,
                integration_coherence: harmonic.integration_coherence,
                cognitive_resonance: harmonic.cognitive_resonance,
            sentient: SentientBlock {
                sentience_level: sentient.sentience_level,
                reflexivity_index: sentient.reflexivity_index,
                presence_stability: sentient.presence_stability,
            evolution: EvolutionBlock {
                stability: evolution.stability,
                adaptive_capacity: evolution.adaptive_capacity,
                evolution_momentum: evolution.evolution_momentum,
        },
    }
