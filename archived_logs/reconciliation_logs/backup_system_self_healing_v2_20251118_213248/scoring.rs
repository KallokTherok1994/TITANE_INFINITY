use super::guardian::GuardianReport;

pub fn compute_integrity_score(report: &GuardianReport) -> f64 {
    let base = 1.0 - (report.anomaly_count as f64 * 0.08);
    base.clamp(0.0, 1.0)
}

pub fn compute_tension_score(report: &GuardianReport) -> f64 {
    let score = report.tension_level * 0.5
        + report.instability_level * 0.3
        + report.drift_level * 0.2;

    score.clamp(0.0, 1.0)
}
