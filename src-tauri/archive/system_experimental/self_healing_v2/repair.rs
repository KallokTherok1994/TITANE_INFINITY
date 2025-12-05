use super::guardian::GuardianReport;
use crate::shared::utils::*;
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

pub fn apply_repair(
    report: &GuardianReport,
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
    if report.anomaly_count == 0 {
        return;
    }
    let factor = 0.05_f64;
    macro_rules! nudge {
        ($v:expr) => {
            $v = ($v + 0.5 * factor).clamp(0.0, 1.0);
        };
    nudge!(sentient.sentience_level);
    nudge!(harmonic.neuro_harmony);
    nudge!(meta.global_integration);
    nudge!(architecture.structural_integrity);
    nudge!(strategic.strategic_clarity);
    nudge!(intention.intentional_drive);
    nudge!(action.activation_potential);
    nudge!(executive.executive_load);
    nudge!(central.safety_margin);
    nudge!(evolution.evolution_momentum);
}
