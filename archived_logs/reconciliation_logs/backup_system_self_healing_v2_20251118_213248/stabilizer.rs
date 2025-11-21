use super::super::sentient::SentientState;
use super::super::harmonic_brain::HarmonicBrainState;
use super::super::meta_integration::MetaIntegrationState;
use super::super::architecture::ArchitectureState;
use super::super::strategic_intelligence::StrategicIntelligenceState;
use super::super::intention::IntentionState;
use super::super::action_potential::ActionPotentialState;
use super::super::executive_flow::ExecutiveFlowState;
use super::super::central_governor::CentralGovernorState;
use super::super::evolution::EvolutionState;

pub fn apply_stabilization(
    sentient: &mut SentientState,
    harmonic: &mut HarmonicBrainState,
    meta: &mut MetaIntegrationState,
    architecture: &mut ArchitectureState,
    strategic: &mut StrategicIntelligenceState,
    intention: &mut IntentionState,
    action: &mut ActionPotentialState,
    executive: &mut ExecutiveFlowState,
    central: &mut CentralGovernorState,
    evolution: &mut EvolutionState,
) {
    fn soften(x: &mut f64) {
        *x = (*x * 0.98 + 0.01 * 0.5).clamp(0.0, 1.0);
    }

    soften(&mut sentient.sentience_level);
    soften(&mut harmonic.neuro_harmony);
    soften(&mut meta.global_integration);
    soften(&mut architecture.structural_integrity);
    soften(&mut strategic.strategic_clarity);
    soften(&mut intention.intentional_drive);
    soften(&mut action.activation_potential);
    soften(&mut executive.executive_load);
    soften(&mut central.safety_margin);
    soften(&mut evolution.evolution_momentum);
}
