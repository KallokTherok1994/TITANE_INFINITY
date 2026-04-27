// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Remote Gateway Anomaly Detector (Phase C2 — 2026-04-27)
//   GAP 7 fix: runtime anomaly detection on API key rotation and rate usage.
//   Persists state across restarts via app_data_dir/remote_gateway/anomaly_state.json
//
//   Security signals emitted:
//     ALERT  — API key rotated > 3 times per hour from same IP
//     WARN   — Request rate approaching limit (> 45 req/min from same IP)
//
//   Architecture: Rule 3 (Ring 0), Rule 5 (One Door), Rule 6 (IPC contract)
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::net::IpAddr;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

// ── Constants ────────────────────────────────────────────────

/// Sliding window for rate-limit warning detection (60 seconds).
const RATE_WINDOW_SECS: u64 = 60;
/// Warn threshold: >45 req/min from a single IP.
const RATE_WARN_THRESHOLD: u64 = 45;
/// Sliding window for key-rotation detection (1 hour).
const KEY_ROTATION_WINDOW_SECS: u64 = 3600;
/// Alert threshold: >3 key rotations per hour from a single IP.
const KEY_ROTATION_ALERT_THRESHOLD: usize = 3;

// ── Data types ───────────────────────────────────────────────

/// Severity classification for anomaly signals.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "UPPERCASE")]
pub enum AnomalySeverity {
    Warn,
    Alert,
}

/// One recorded anomaly event.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnomalyEvent {
    pub timestamp: u64,
    pub ip: String,
    pub severity: AnomalySeverity,
    pub message: String,
}

/// Per-IP counters tracked in the sliding windows.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct IpStats {
    /// Timestamps (Unix secs) of recent requests in the rate window.
    request_timestamps: Vec<u64>,
    /// Timestamps (Unix secs) of recent API key rotation operations.
    key_rotation_timestamps: Vec<u64>,
}

/// Serializable snapshot persisted to disk across restarts.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct PersistedState {
    ip_stats: HashMap<String, IpStats>,
    anomaly_log: Vec<AnomalyEvent>,
}

// ── AnomalyDetector ──────────────────────────────────────────

/// Thread-safe anomaly detector for the remote gateway.
/// Wrap in `Arc<AnomalyDetector>` and share across axum handlers.
#[derive(Debug)]
pub struct AnomalyDetector {
    state: Mutex<PersistedState>,
    persist_path: PathBuf,
}

impl AnomalyDetector {
    /// Construct a detector that persists to `persist_path`.
    /// Loads existing state from disk if the file is present.
    pub fn new(persist_path: PathBuf) -> Arc<Self> {
        let state = Self::load_from_disk(&persist_path).unwrap_or_default();
        Arc::new(Self {
            state: Mutex::new(state),
            persist_path,
        })
    }

    /// Record a request from `ip`. Returns any new anomaly event emitted.
    pub fn record_request(&self, ip: IpAddr) -> Option<AnomalyEvent> {
        let now = unix_now();
        let mut guard = self.state.lock().unwrap_or_else(|p| p.into_inner());
        let stats = guard.ip_stats.entry(ip.to_string()).or_default();

        // Prune expired timestamps
        stats.request_timestamps.retain(|&t| now.saturating_sub(t) < RATE_WINDOW_SECS);
        stats.request_timestamps.push(now);

        let count = stats.request_timestamps.len() as u64;
        if count > RATE_WARN_THRESHOLD {
            let event = AnomalyEvent {
                timestamp: now,
                ip: ip.to_string(),
                severity: AnomalySeverity::Warn,
                message: format!(
                    "Rate approaching limit: {} req/min from {} (threshold {})",
                    count, ip, RATE_WARN_THRESHOLD
                ),
            };
            guard.anomaly_log.push(event.clone());
            drop(guard);
            self.persist();
            return Some(event);
        }

        drop(guard);
        None
    }

    /// Record an API key rotation from `ip`. Returns any new anomaly event emitted.
    pub fn record_key_rotation(&self, ip: IpAddr) -> Option<AnomalyEvent> {
        let now = unix_now();
        let mut guard = self.state.lock().unwrap_or_else(|p| p.into_inner());
        let stats = guard.ip_stats.entry(ip.to_string()).or_default();

        // Prune expired rotation timestamps
        stats
            .key_rotation_timestamps
            .retain(|&t| now.saturating_sub(t) < KEY_ROTATION_WINDOW_SECS);
        stats.key_rotation_timestamps.push(now);

        let count = stats.key_rotation_timestamps.len();
        if count > KEY_ROTATION_ALERT_THRESHOLD {
            let event = AnomalyEvent {
                timestamp: now,
                ip: ip.to_string(),
                severity: AnomalySeverity::Alert,
                message: format!(
                    "Rapid key rotation detected: {} rotations/hour from {} (threshold {})",
                    count, ip, KEY_ROTATION_ALERT_THRESHOLD
                ),
            };
            guard.anomaly_log.push(event.clone());
            drop(guard);
            self.persist();
            return Some(event);
        }

        drop(guard);
        None
    }

    /// Return all anomaly events recorded since the detector was created or last reset.
    pub fn get_anomalies(&self) -> Vec<AnomalyEvent> {
        self.state
            .lock()
            .unwrap_or_else(|p| p.into_inner())
            .anomaly_log
            .clone()
    }

    /// Return anomaly events of at least `severity`.
    pub fn get_anomalies_by_severity(&self, severity: &AnomalySeverity) -> Vec<AnomalyEvent> {
        self.get_anomalies()
            .into_iter()
            .filter(|e| e.severity == *severity || e.severity == AnomalySeverity::Alert)
            .collect()
    }

    // ── Persistence helpers ──────────────────────────────────

    fn load_from_disk(path: &PathBuf) -> Option<PersistedState> {
        let bytes = std::fs::read(path).ok()?;
        serde_json::from_slice(&bytes).ok()
    }

    fn persist(&self) {
        let guard = self.state.lock().unwrap_or_else(|p| p.into_inner());
        if let Some(parent) = self.persist_path.parent() {
            let _ = std::fs::create_dir_all(parent);
        }
        if let Ok(bytes) = serde_json::to_vec_pretty(&*guard) {
            let _ = std::fs::write(&self.persist_path, bytes);
        }
    }
}

// ── Utility ──────────────────────────────────────────────────

fn unix_now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or(Duration::ZERO)
        .as_secs()
}

// ── Tests ────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use std::net::IpAddr;
    use std::str::FromStr;

    fn test_ip() -> IpAddr {
        IpAddr::from_str("10.0.0.1").unwrap()
    }

    fn tmp_path() -> PathBuf {
        let d = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default();
        let tid = format!("{:?}", std::thread::current().id())
            .chars()
            .filter(|c| c.is_ascii_alphanumeric())
            .collect::<String>();
        std::env::temp_dir().join(format!(
            "titane_anomaly_test_{}_{}_{}.json",
            d.as_secs(),
            d.subsec_nanos(),
            tid
        ))
    }

    #[test]
    fn test_no_anomaly_below_threshold() {
        let detector = AnomalyDetector::new(tmp_path());
        for _ in 0..44 {
            let result = detector.record_request(test_ip());
            assert!(result.is_none(), "Should not emit below threshold");
        }
    }

    #[test]
    fn test_warn_above_rate_threshold() {
        let detector = AnomalyDetector::new(tmp_path());
        let mut last = None;
        for _ in 0..=RATE_WARN_THRESHOLD {
            last = detector.record_request(test_ip());
        }
        assert!(last.is_some(), "Should emit WARN when threshold exceeded");
        assert_eq!(last.unwrap().severity, AnomalySeverity::Warn);
    }

    #[test]
    fn test_alert_on_rapid_key_rotation() {
        let detector = AnomalyDetector::new(tmp_path());
        let mut last = None;
        for _ in 0..=KEY_ROTATION_ALERT_THRESHOLD {
            last = detector.record_key_rotation(test_ip());
        }
        assert!(last.is_some(), "Should emit ALERT when rotation threshold exceeded");
        assert_eq!(last.unwrap().severity, AnomalySeverity::Alert);
    }

    #[test]
    fn test_get_anomalies_returns_all() {
        let detector = AnomalyDetector::new(tmp_path());
        // Trigger both kinds
        for _ in 0..=RATE_WARN_THRESHOLD {
            detector.record_request(test_ip());
        }
        for _ in 0..=KEY_ROTATION_ALERT_THRESHOLD {
            detector.record_key_rotation(test_ip());
        }
        assert!(!detector.get_anomalies().is_empty());
    }
}
