use crate::TitaneResult;
use super::strategic_intelligence::StrategicIntelligenceState;
use super::intention::IntentionState;
use super::action_potential::ActionPotentialState;
use super::executive_flow::ExecutiveFlowState;
use super::central_governor::CentralGovernorState;
use super::architecture::ArchitectureState;
use super::meta_integration::MetaIntegrationState;
use super::harmonic_brain::HarmonicBrainState;
use super::sentient::SentientState;
use super::evolution::EvolutionState;

mod types;
mod collect;
mod format;
mod snapshot;
pub use types::*;
pub struct DashboardState {
    pub initialized: bool,
    pub dashboard_overview: DashboardOverview,
    pub dashboard_graphics: DashboardGraphics,
    pub dashboard_meta: DashboardMeta,
    pub last_update: u64,
}
pub fn init() -> TitaneResult<DashboardState> {
    Ok(DashboardState {
        initialized: true,
        dashboard_overview: snapshot::default_overview(),
        dashboard_graphics: snapshot::default_graphics(),
        dashboard_meta: snapshot::default_meta(),
        last_update: 0,
    })
pub fn tick(
    state: &mut DashboardState,
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
) -> TitaneResult<()> {
    let raw = collect::collect_dashboard_inputs(
        strategic,
        intention,
        action,
        executive,
        central,
        architecture,
        meta,
        harmonic,
        sentient,
        evolution,
    );
    let (overview, graphics) = format::format_dashboard(raw);
    let meta_info = snapshot::generate_meta();
    state.dashboard_overview = overview;
    state.dashboard_graphics = graphics;
    state.dashboard_meta = meta_info;
    state.last_update = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64;
    Ok(())

}
