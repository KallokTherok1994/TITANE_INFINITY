use crate::TitaneResult;
use super::memory::ContinuumMemory;
use super::window::ContinuumSnapshot;

pub struct ContinuumMetrics {
    pub continuity_index: f64,
    pub drift_index: f64,
    pub recovery_potential: f64,
}
pub fn compute_continuum(memory: &ContinuumMemory) -> TitaneResult<ContinuumMetrics> {
    if memory.len() < 2 {
        return Ok(ContinuumMetrics {
            continuity_index: 0.5,
            drift_index: 0.5,
            recovery_potential: 0.5,
        });
    }
    let snapshots = memory.as_slice();
    let continuity_index = compute_continuity(snapshots);
    let drift_index = compute_drift(snapshots);
    let recovery_potential = compute_recovery(continuity_index, drift_index);
    Ok(ContinuumMetrics {
        continuity_index,
        drift_index,
        recovery_potential,
    })
fn compute_continuity(snapshots: &[ContinuumSnapshot]) -> f64 {
    let mut sum_delta = 0.0_f64;
    let mut count = 0_u32;
    for pair in snapshots.windows2 {
        let a = pair[0];
        let b = pair[1];
        let delta = ((b.strategic_clarity - a.strategic_clarity).abs()
            + (b.long_term_alignment - a.long_term_alignment).abs()
            + (b.intentional_drive - a.intentional_drive).abs()
            + (b.activation_potential - a.activation_potential).abs()
            + (b.readiness_level - a.readiness_level).abs()
            + (b.safety_margin - a.safety_margin).abs()
            + (b.structural_integrity - a.structural_integrity).abs()
            + (b.global_integration - a.global_integration).abs()
            + (b.neuro_harmony - a.neuro_harmony).abs()
            + (b.sentience_level - a.sentience_level).abs()
            + (b.evolution_momentum - a.evolution_momentum).abs())
            / 11.0;
        sum_delta += delta;
        count += 1;
    if count == 0 {
        return 0.5;
    let avg_delta = sum_delta / (count as f64);
    let continuity = 1.0 - avg_delta;
    continuity.clamp(0.0, 1.0)
fn compute_drift(snapshots: &[ContinuumSnapshot]) -> f64 {
    let len = snapshots.len();
    if len < 4 {
    let third = len / 3;
    if third == 0 {
    let first_slice = &snapshots[..third];
    let last_slice = &snapshots[len - third..];
    let first_avg = average_snapshot(first_slice);
    let last_avg = average_snapshot(last_slice);
    let raw_drift = ((last_avg.strategic_clarity - first_avg.strategic_clarity).abs()
        + (last_avg.long_term_alignment - first_avg.long_term_alignment).abs()
        + (last_avg.intentional_drive - first_avg.intentional_drive).abs()
        + (last_avg.activation_potential - first_avg.activation_potential).abs()
        + (last_avg.readiness_level - first_avg.readiness_level).abs()
        + (last_avg.safety_margin - first_avg.safety_margin).abs()
        + (last_avg.structural_integrity - first_avg.structural_integrity).abs()
        + (last_avg.global_integration - first_avg.global_integration).abs()
        + (last_avg.neuro_harmony - first_avg.neuro_harmony).abs()
        + (last_avg.sentience_level - first_avg.sentience_level).abs()
        + (last_avg.evolution_momentum - first_avg.evolution_momentum).abs())
        / 11.0;
    raw_drift.clamp(0.0, 1.0)
fn compute_recovery(continuity_index: f64, drift_index: f64) -> f64 {
    let recovery = continuity_index * 0.6 + (1.0 - drift_index) * 0.4;
    recovery.clamp(0.0, 1.0)
fn average_snapshot(slice: &[ContinuumSnapshot]) -> ContinuumSnapshot {
    let len = slice.len() as f64;
    let mut acc = ContinuumSnapshot {
        strategic_clarity: 0.0,
        long_term_alignment: 0.0,
        intentional_drive: 0.0,
        activation_potential: 0.0,
        readiness_level: 0.0,
        safety_margin: 0.0,
        structural_integrity: 0.0,
        global_integration: 0.0,
        neuro_harmony: 0.0,
        sentience_level: 0.0,
        evolution_momentum: 0.0,
    };
    for s in slice {
        acc.strategic_clarity += s.strategic_clarity;
        acc.long_term_alignment += s.long_term_alignment;
        acc.intentional_drive += s.intentional_drive;
        acc.activation_potential += s.activation_potential;
        acc.readiness_level += s.readiness_level;
        acc.safety_margin += s.safety_margin;
        acc.structural_integrity += s.structural_integrity;
        acc.global_integration += s.global_integration;
        acc.neuro_harmony += s.neuro_harmony;
        acc.sentience_level += s.sentience_level;
        acc.evolution_momentum += s.evolution_momentum;
    ContinuumSnapshot {
        strategic_clarity: acc.strategic_clarity / len,
        long_term_alignment: acc.long_term_alignment / len,
        intentional_drive: acc.intentional_drive / len,
        activation_potential: acc.activation_potential / len,
        readiness_level: acc.readiness_level / len,
        safety_margin: acc.safety_margin / len,
        structural_integrity: acc.structural_integrity / len,
        global_integration: acc.global_integration / len,
        neuro_harmony: acc.neuro_harmony / len,
        sentience_level: acc.sentience_level / len,
        evolution_momentum: acc.evolution_momentum / len,
