// TITANE∞ v8.0 - Mission Engine (Module #54)
use crate::shared::utils::*;
// Direction stratégique profonde, objectifs vivants, axe d'évolution

use crate::TitaneResult;
use super::identity::IdentityState;
use super::meaning::MeaningState;
use super::self_alignment::SelfAlignmentState;
use super::resonance_v2::ResonanceV2State;
use super::evolution::EvolutionState;
use super::strategic_intelligence::StrategicIntelligenceState;
mod compute;
mod coherence;
mod vector;
mod narrative;
mod directive;
mod metrics;
use metrics::MissionMetrics;
use compute::compute_mission;
use directive::build_mission_directive;
use narrative::generate_mission_narrative;
pub struct MissionState {
    pub initialized: bool,
    pub mission_axis: f32,
    pub mission_vector: f32,
    pub mission_coherence: f32,
    pub mission_directive: String,
    pub mission_narrative: String,
    pub last_update: u64,
}
pub fn init() -> TitaneResult<MissionState> {
    Ok(MissionState {
        initialized: true,
        mission_axis: 0.5,
        mission_vector: 0.5,
        mission_coherence: 0.5,
        mission_directive: String::new(),
        mission_narrative: String::new(),
        last_update: 0,
    })
fn smooth(a: f32, b: f32) -> f32 {
    (a * 0.85 + b * 0.15).clamp(0.0, 1.0)
pub fn tick(
    state: &mut MissionState,
    identity: &IdentityState,
    meaning: &MeaningState,
    alignment: &SelfAlignmentState,
    resonance: &ResonanceV2State,
    evolution: &EvolutionState,
    strategic: &StrategicIntelligenceState,
) -> TitaneResult<()> {
    let metrics: MissionMetrics = compute_mission(
        identity,
        meaning,
        alignment,
        resonance,
        evolution,
        strategic,
    );
    state.mission_axis = smooth(state.mission_axis, metrics.axis);
    state.mission_vector = smooth(state.mission_vector, metrics.vector);
    state.mission_coherence = smooth(state.mission_coherence, metrics.coherence);
    state.mission_directive = build_mission_directive(
        state.mission_axis,
        state.mission_vector,
        state.mission_coherence,
    state.mission_narrative = generate_mission_narrative(
    state.last_update = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64;
    Ok(())

}
