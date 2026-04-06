use sha2::{Digest, Sha256};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ComplianceStatus {
    Compliant,
    Warning,
    Violation,
}

#[derive(Debug, Clone)]
pub struct ComplianceInput {
    pub now_ms: u64,
    pub integrity_ok: bool,
    pub schema_version: u32,
    pub current_schema_version: u32,
    pub last_integrity_check_ms: Option<u64>,
    pub max_integrity_staleness_ms: u64,
}

#[derive(Debug, Clone)]
pub struct ComplianceReport {
    pub status: ComplianceStatus,
    pub violations: Vec<String>,
}

pub struct ComplianceMonitor;

impl ComplianceMonitor {
    pub fn evaluate(input: &ComplianceInput) -> ComplianceReport {
        let mut violations = Vec::new();

        if !input.integrity_ok {
            violations.push("INTEGRITY_CHECK_FAILED".to_string());
        }

        if input.schema_version != input.current_schema_version {
            violations.push("SCHEMA_VERSION_MISMATCH".to_string());
        }

        if let Some(last_check) = input.last_integrity_check_ms {
            if input.now_ms.saturating_sub(last_check) > input.max_integrity_staleness_ms {
                violations.push("INTEGRITY_CHECK_STALE".to_string());
            }
        } else {
            violations.push("INTEGRITY_CHECK_MISSING".to_string());
        }

        let status = if violations.is_empty() {
            ComplianceStatus::Compliant
        } else if violations.iter().all(|code| code.contains("STALE") || code.contains("MISSING")) {
            ComplianceStatus::Warning
        } else {
            ComplianceStatus::Violation
        };

        ComplianceReport { status, violations }
    }
}

#[derive(Debug, Clone)]
pub struct StorageSnapshot {
    pub event_count: u64,
    pub event_log_size_bytes: u64,
    pub snapshot_count: u64,
}

#[derive(Debug, Clone)]
pub struct StorageDriftReport {
    pub drift_detected: bool,
    pub drift_ratio: f64,
    pub reason_codes: Vec<String>,
}

pub struct StorageDriftDetector;

impl StorageDriftDetector {
    pub fn detect(expected: &StorageSnapshot, actual: &StorageSnapshot, threshold_ratio: f64) -> StorageDriftReport {
        let mut reason_codes = Vec::new();

        let event_delta = absolute_delta(expected.event_count, actual.event_count);
        let size_delta = absolute_delta(expected.event_log_size_bytes, actual.event_log_size_bytes);
        let snapshot_delta = absolute_delta(expected.snapshot_count, actual.snapshot_count);

        let expected_weighted = expected.event_count
            .saturating_add(expected.event_log_size_bytes / 1024)
            .saturating_add(expected.snapshot_count.saturating_mul(10));

        let delta_weighted = event_delta
            .saturating_add(size_delta / 1024)
            .saturating_add(snapshot_delta.saturating_mul(10));

        let drift_ratio = if expected_weighted == 0 {
            0.0
        } else {
            (delta_weighted as f64) / (expected_weighted as f64)
        };

        if actual.event_count < expected.event_count {
            reason_codes.push("EVENT_COUNT_REGRESSION".to_string());
        }
        if actual.snapshot_count + 1 < expected.snapshot_count {
            reason_codes.push("SNAPSHOT_COUNT_DROP".to_string());
        }
        if drift_ratio > threshold_ratio {
            reason_codes.push("DRIFT_THRESHOLD_EXCEEDED".to_string());
        }

        StorageDriftReport {
            drift_detected: !reason_codes.is_empty(),
            drift_ratio,
            reason_codes,
        }
    }
}

#[derive(Debug, Clone)]
pub struct PurgeProofV2 {
    pub timestamp_ms: u64,
    pub before_count: u64,
    pub after_count: u64,
    pub purged_ids_hash: String,
    pub proof_hash: String,
}

impl PurgeProofV2 {
    pub fn generate(timestamp_ms: u64, before_count: u64, after_count: u64, purged_ids: &[String]) -> Self {
        let mut ids = purged_ids.to_vec();
        ids.sort();

        let purged_ids_hash = hash_string(&ids.join("|"));
        let proof_hash = hash_string(&format!(
            "{}:{}:{}:{}",
            timestamp_ms, before_count, after_count, purged_ids_hash
        ));

        Self {
            timestamp_ms,
            before_count,
            after_count,
            purged_ids_hash,
            proof_hash,
        }
    }

    pub fn verify(&self) -> bool {
        if self.after_count > self.before_count {
            return false;
        }

        let recomputed = hash_string(&format!(
            "{}:{}:{}:{}",
            self.timestamp_ms, self.before_count, self.after_count, self.purged_ids_hash
        ));

        recomputed == self.proof_hash
    }
}

fn hash_string(value: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(value.as_bytes());
    format!("{:x}", hasher.finalize())
}

fn absolute_delta(left: u64, right: u64) -> u64 {
    if left >= right {
        left - right
    } else {
        right - left
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn compliance_monitor_detects_schema_violation() {
        let report = ComplianceMonitor::evaluate(&ComplianceInput {
            now_ms: 100,
            integrity_ok: true,
            schema_version: 4,
            current_schema_version: 5,
            last_integrity_check_ms: Some(90),
            max_integrity_staleness_ms: 1000,
        });

        assert!(matches!(report.status, ComplianceStatus::Violation));
        assert!(report.violations.iter().any(|v| v == "SCHEMA_VERSION_MISMATCH"));
    }

    #[test]
    fn storage_drift_detector_flags_regression() {
        let expected = StorageSnapshot {
            event_count: 100,
            event_log_size_bytes: 50_000,
            snapshot_count: 10,
        };
        let actual = StorageSnapshot {
            event_count: 80,
            event_log_size_bytes: 20_000,
            snapshot_count: 6,
        };

        let report = StorageDriftDetector::detect(&expected, &actual, 0.1);
        assert!(report.drift_detected);
    }

    #[test]
    fn purge_proof_v2_verifies_integrity() {
        let proof = PurgeProofV2::generate(
            1_700_000,
            120,
            100,
            &["id-1".to_string(), "id-2".to_string()],
        );

        assert!(proof.verify());
    }
}
