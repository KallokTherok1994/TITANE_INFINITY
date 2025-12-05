use crate::system::strategic_intelligence::StrategicIntelligenceState;
use crate::system::executive_flow::ExecutiveFlowState;
use crate::system::central_governor::CentralGovernorState;
use crate::system::architecture::ArchitectureState;
use crate::system::harmonic_brain::HarmonicBrainState;
use crate::system::sentient::SentientState;
use crate::system::evolution::EvolutionState;
use crate::system::meta_integration::MetaIntegrationState;

mod collect;
mod compute;
mod drive;
pub use drive::DriveMemory;
pub struct IntentionState {
    pub initialized: bool,
    pub intentional_drive: f32,
    pub directional_coherence: f32,
    pub potential_alignment: f32,
    pub last_update: u64,
}
pub fn init() -> Result<IntentionState, String> {
    Ok(IntentionState {
        initialized: true,
        intentional_drive: 0.5,
        directional_coherence: 0.5,
        potential_alignment: 0.5,
        last_update: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map_err(|e| format!("Time error: {}", e))?
            .as_secs(),
    })
pub fn tick(
    state: &mut IntentionState,
    strategic: &StrategicIntelligenceState,
    executive: &ExecutiveFlowState,
    central: &CentralGovernorState,
    architecture: &ArchitectureState,
    harmonic: &HarmonicBrainState,
    sentient: &SentientState,
    evolution: &EvolutionState,
    meta: &MetaIntegrationState,
    drive_mem: &mut DriveMemory,
) -> Result<(), String> {
    let inputs = collect::collect_intention_inputs(
        strategic,
        executive,
        central,
        architecture,
        harmonic,
        sentient,
        evolution,
        meta,
    )?;
    let drive_factor = drive_mem.drive_factor();
    let (intentional_drive, directional_coherence, potential_alignment) =
        compute::compute_intention(&inputs, drive_factor)?;
    state.intentional_drive = state.intentional_drive * 0.75 + intentional_drive * 0.25;
    state.directional_coherence = state.directional_coherence * 0.75 + directional_coherence * 0.25;
    state.potential_alignment = state.potential_alignment * 0.75 + potential_alignment * 0.25;
    state.intentional_drive = state.intentional_drive.clamp(0.0, 1.0);
    state.directional_coherence = state.directional_coherence.clamp(0.0, 1.0);
    state.potential_alignment = state.potential_alignment.clamp(0.0, 1.0);
    drive_mem.push(state.intentional_drive);
    state.last_update = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| format!("Time error: {}", e))?
        .as_secs();
    Ok(())

}
