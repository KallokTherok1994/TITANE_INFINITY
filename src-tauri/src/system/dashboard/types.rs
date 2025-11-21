use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardOverview {
    pub summary: DashboardSummary,
    pub state_map: DashboardStateMap,
}
pub struct DashboardSummary {
    pub clarity: f32,
    pub alignment: f32,
    pub presence: f32,
    pub readiness: f32,
pub struct DashboardStateMap {
    pub strategic: StrategicBlock,
    pub intention: IntentionBlock,
    pub action: ActionBlock,
    pub executive: ExecutiveBlock,
    pub central: CentralBlock,
    pub architecture: ArchitectureBlock,
    pub integration: IntegrationBlock,
    pub harmonic: HarmonicBlock,
    pub sentient: SentientBlock,
    pub evolution: EvolutionBlock,
pub struct StrategicBlock {
    pub strategic_clarity: f32,
    pub directional_focus: f32,
    pub long_term_alignment: f32,
pub struct IntentionBlock {
    pub intentional_drive: f32,
    pub directional_coherence: f32,
    pub potential_alignment: f32,
pub struct ActionBlock {
    pub activation_potential: f32,
    pub readiness_level: f32,
    pub expression_gate: f32,
pub struct ExecutiveBlock {
    pub executive_load: f32,
    pub priority_index: f32,
    pub alert_level: f32,
pub struct CentralBlock {
    pub regulation_profile: f32,
    pub safety_margin: f32,
    pub adaptive_stability: f32,
pub struct ArchitectureBlock {
    pub structural_integrity: f32,
    pub cognitive_geometry: f32,
    pub architectural_coherence: f32,
pub struct IntegrationBlock {
    pub global_integration: f32,
    pub systemic_coherence: f32,
    pub alignment_index: f32,
pub struct HarmonicBlock {
    pub neuro_harmony: f32,
    pub integration_coherence: f32,
    pub cognitive_resonance: f32,
pub struct SentientBlock {
    pub sentience_level: f32,
    pub reflexivity_index: f32,
    pub presence_stability: f32,
pub struct EvolutionBlock {
    pub stability: f32,
    pub adaptive_capacity: f32,
    pub evolution_momentum: f32,
pub struct DashboardGraphics {
    pub curves: DashboardCurves,
    pub radar: DashboardRadar,
pub struct DashboardCurves {
    pub intention: [f32; 3],
    pub action: [f32; 3],
    pub integration: [f32; 3],
pub struct DashboardRadar {
    pub harmonic: [f32; 3],
    pub structure: [f32; 3],
pub struct DashboardMeta {
    pub version: String,
    pub ui: DashboardMetaUI,
pub struct DashboardMetaUI {
    pub recommended_layout: String,
    pub elements: Vec<String>,
