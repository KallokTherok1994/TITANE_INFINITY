use crate::TitaneResult;
use crate::shared::utils::*;
use super::sentient::SentientState;
use super::harmonic_brain::HarmonicBrainState;
use super::meta_integration::MetaIntegrationState;
use super::architecture::ArchitectureState;
use super::strategic_intelligence::StrategicIntelligenceState;
use super::intention::IntentionState;
use super::action_potential::ActionPotentialState;
use super::executive_flow::ExecutiveFlowState;
use super::central_governor::CentralGovernorState;
use super::evolution::EvolutionState;

mod guardian;
mod repair;
mod stabilizer;
mod scoring;

use guardian::{GuardianReport, guardian_scan};

pub struct SelfHealingState {
    pub initialized: bool,
    pub integrity_score: f64,
    pub tension_score: f64,
    pub last_update: u64,
}

pub fn init() -> TitaneResult<SelfHealingState> {
    Ok(SelfHealingState {
        initialized: true,
        integrity_score: 0.75,
        tension_score: 0.50,
        last_update: 0,
    })
}

fn smooth(old: f64, new: f64) -> f64 {
    let val = old * 0.85 + new * 0.15;
    val.clamp(0.0, 1.0)
}

pub fn tick(
    state: &mut SelfHealingState,
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
) -> TitaneResult<()> {
    let report: GuardianReport = guardian_scan(
        sentient,
        harmonic,
        meta,
        architecture,
        strategic,
        intention,
        action,
        executive,
        central,
        evolution,
    );

    repair::apply_repair(
        &report,
        sentient,
        harmonic,
        meta,
        architecture,
        strategic,
        intention,
        action,
        executive,
        central,
        evolution,
    );

    stabilizer::apply_stabilization(
        sentient,
        harmonic,
        meta,
        architecture,
        strategic,
        intention,
        action,
        executive,
        central,
        evolution,
    );

    let integrity = scoring::compute_integrity_score(&report);
    let tension = scoring::compute_tension_score(&report);

    state.integrity_score = smooth(state.integrity_score, integrity);
    state.tension_score = smooth(state.tension_score, tension);

    state.last_update = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64;

    Ok(())
}
