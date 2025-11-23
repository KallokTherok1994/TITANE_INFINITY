use super::guardian::GuardianReport;
use crate::shared::utils::*;

pub fn compute_integrity_score(report: &GuardianReport) -> f32 {
    let base = 1.0 - (report.anomaly_count as f32 * 0.08);
    base.clamp(0.0, 1.0)
}
pub fn compute_tension_score(report: &GuardianReport) -> f32 {
    let score = report.tension_level * 0.5
        + report.instability_level * 0.3
        + report.drift_level * 0.2;
    score.clamp(0.0, 1.0)
