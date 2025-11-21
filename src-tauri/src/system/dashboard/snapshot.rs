use super::types::*;

pub fn default_overview() -> DashboardOverview {
    DashboardOverview {
        summary: DashboardSummary {
            clarity: 0.5,
            alignment: 0.5,
            presence: 0.5,
            readiness: 0.5,
        },
        state_map: DashboardStateMap {
            strategic: StrategicBlock {
                strategic_clarity: 0.5,
                directional_focus: 0.5,
                long_term_alignment: 0.5,
            },
            intention: IntentionBlock {
                intentional_drive: 0.5,
                directional_coherence: 0.5,
                potential_alignment: 0.5,
            action: ActionBlock {
                activation_potential: 0.5,
                readiness_level: 0.5,
                expression_gate: 0.5,
            executive: ExecutiveBlock {
                executive_load: 0.5,
                priority_index: 0.5,
                alert_level: 0.5,
            central: CentralBlock {
                regulation_profile: 0.5,
                safety_margin: 0.5,
                adaptive_stability: 0.5,
            architecture: ArchitectureBlock {
                structural_integrity: 0.5,
                cognitive_geometry: 0.5,
                architectural_coherence: 0.5,
            integration: IntegrationBlock {
                global_integration: 0.5,
                systemic_coherence: 0.5,
                alignment_index: 0.5,
            harmonic: HarmonicBlock {
                neuro_harmony: 0.5,
                integration_coherence: 0.5,
                cognitive_resonance: 0.5,
            sentient: SentientBlock {
                sentience_level: 0.5,
                reflexivity_index: 0.5,
                presence_stability: 0.5,
            evolution: EvolutionBlock {
                stability: 0.5,
                adaptive_capacity: 0.5,
                evolution_momentum: 0.5,
    }
}
pub fn default_graphics() -> DashboardGraphics {
    DashboardGraphics {
        curves: DashboardCurves {
            intention: [0.5, 0.5, 0.5],
            action: [0.5, 0.5, 0.5],
            integration: [0.5, 0.5, 0.5],
        radar: DashboardRadar {
            harmonic: [0.5, 0.5, 0.5],
            structure: [0.5, 0.5, 0.5],
pub fn default_meta() -> DashboardMeta {
    DashboardMeta {
        version: "v1".to_string(),
        ui: DashboardMetaUI {
            recommended_layout: "grid".to_string(),
            elements: vec![
                "summary_cards".to_string(),
                "radar_graph".to_string(),
                "line_curves".to_string(),
                "state_map".to_string(),
            ],
pub fn generate_meta() -> DashboardMeta {
    default_meta()
