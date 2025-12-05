use super::super::sentient::SentientState;
use crate::shared::utils::*;
use super::super::harmonic_brain::HarmonicBrainState;
use super::super::meta_integration::MetaIntegrationState;
use super::super::architecture::ArchitectureState;
use super::super::strategic_intelligence::StrategicIntelligenceState;
use super::super::intention::IntentionState;
use super::super::action_potential::ActionPotentialState;
use super::super::executive_flow::ExecutiveFlowState;
use super::super::central_governor::CentralGovernorState;
use super::super::evolution::EvolutionState;

pub struct GuardianReport {
    pub anomaly_count: u32,
    pub tension_level: f32,
    pub drift_level: f32,
    pub instability_level: f32,
}
pub fn guardian_scan(
    sentient: &SentientState,
    harmonic: &HarmonicBrainState,
    meta: &MetaIntegrationState,
    architecture: &ArchitectureState,
    strategic: &StrategicIntelligenceState,
    intention: &IntentionState,
    action: &ActionPotentialState,
    executive: &ExecutiveFlowState,
    central: &CentralGovernorState,
    evolution: &EvolutionState,
) -> GuardianReport {
    let mut anomaly_count = 0;
    let mut tension = 0.0;
    let mut instab = 0.0;
    macro_rules! check {
        ($val:expr) => {
            if $val < 0.0 || $val > 1.0 {
                anomaly_count += 1;
            }
            tension += (0.5 - $val).abs() * 0.1;
            instab += ($val - 0.5).abs() * 0.05;
        };
    }
    check!(sentient.sentience_level);
    check!(harmonic.neuro_harmony);
    check!(meta.global_integration);
    check!(architecture.structural_integrity);
    check!(strategic.strategic_clarity);
    check!(intention.intentional_drive);
    check!(action.activation_potential);
    check!(executive.executive_load);
    check!(central.safety_margin);
    check!(evolution.evolution_momentum);
    let drift = (meta.alignment_index - strategic.long_term_alignment).abs();
    GuardianReport {
        anomaly_count,
        tension_level: tension.clamp(0.0, 1.0),
        drift_level: drift.clamp(0.0, 1.0),
        instability_level: instab.clamp(0.0, 1.0),
