use super::types::*;
use super::collect::DashboardRaw;

pub fn format_dashboard(raw: DashboardRaw) -> (DashboardOverview, DashboardGraphics) {
    let summary = DashboardSummary {
        clarity: raw.overview_map.strategic.strategic_clarity,
        alignment: raw.overview_map.integration.alignment_index,
        presence: raw.overview_map.sentient.sentience_level,
        readiness: raw.overview_map.action.readiness_level,
    };
    let graphics = DashboardGraphics {
        curves: DashboardCurves {
            intention: [
                raw.overview_map.intention.intentional_drive,
                raw.overview_map.intention.directional_coherence,
                raw.overview_map.intention.potential_alignment,
            ],
            action: [
                raw.overview_map.action.activation_potential,
                raw.overview_map.action.readiness_level,
                raw.overview_map.action.expression_gate,
            integration: [
                raw.overview_map.integration.global_integration,
                raw.overview_map.integration.systemic_coherence,
                raw.overview_map.integration.alignment_index,
        },
        radar: DashboardRadar {
            harmonic: [
                raw.overview_map.harmonic.neuro_harmony,
                raw.overview_map.harmonic.integration_coherence,
                raw.overview_map.harmonic.cognitive_resonance,
            structure: [
                raw.overview_map.architecture.structural_integrity,
                raw.overview_map.architecture.cognitive_geometry,
                raw.overview_map.architecture.architectural_coherence,
    let overview = DashboardOverview {
        summary,
        state_map: raw.overview_map,
    (overview, graphics)
}
