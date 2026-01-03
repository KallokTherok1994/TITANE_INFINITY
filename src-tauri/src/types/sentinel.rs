// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — TYPES: SENTINEL
//   Anomaly Detection & Security Monitoring
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

/// Sentinel module state - Security & anomalies
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SentinelState {
    pub integrity_score: f64,
    pub alerts: Vec<Alert>,
    pub scans_performed: u32,
    pub threats_detected: u32,
    pub timestamp: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Alert {
    pub id: String,
    pub severity: Severity,
    pub category: AlertCategory,
    pub message: String,
    pub timestamp: i64,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum Severity {
    Info,
    Warning,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AlertCategory {
    Performance,
    Security,
    Integrity,
    Resource,
}

impl Default for SentinelState {
    fn default() -> Self {
        Self {
            integrity_score: 100.0,
            alerts: Vec::new(),
            scans_performed: 0,
            threats_detected: 0,
            timestamp: 0,
        }
    }
}

impl SentinelState {
    /// Add new alert
    pub fn add_alert(&mut self, alert: Alert) {
        self.alerts.push(alert);

        // Keep only last 100 alerts
        if self.alerts.len() > 100 {
            self.alerts.remove(0);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // Severity Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_severity_variants() {
        let severities = [Severity::Info, Severity::Warning, Severity::Critical];
        assert_eq!(severities.len(), 3);
    }

    #[test]
    fn test_severity_equality() {
        assert_eq!(Severity::Info, Severity::Info);
        assert_ne!(Severity::Info, Severity::Critical);
    }

    #[test]
    fn test_severity_clone() {
        let sev = Severity::Warning;
        let cloned = sev;
        assert_eq!(sev, cloned);
    }

    #[test]
    fn test_severity_copy() {
        let sev = Severity::Critical;
        let copied: Severity = sev;
        assert_eq!(sev, copied);
    }

    #[test]
    fn test_severity_debug() {
        let sev = Severity::Warning;
        let debug_str = format!("{:?}", sev);
        assert!(debug_str.contains("Warning"));
    }

    #[test]
    fn test_severity_serialization() {
        let sev = Severity::Critical;
        let json = serde_json::to_string(&sev).expect("Severity should serialize to JSON");
        let restored: Severity =
            serde_json::from_str(&json).expect("Severity should deserialize from JSON");
        assert_eq!(restored, Severity::Critical);
    }

    // ─────────────────────────────────────────────────────────────
    // AlertCategory Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_alert_category_variants() {
        let categories = [
            AlertCategory::Performance,
            AlertCategory::Security,
            AlertCategory::Integrity,
            AlertCategory::Resource,
        ];
        assert_eq!(categories.len(), 4);
    }

    #[test]
    fn test_alert_category_clone() {
        let cat = AlertCategory::Security;
        let cloned = cat.clone();
        assert!(matches!(cloned, AlertCategory::Security));
    }

    #[test]
    fn test_alert_category_debug() {
        let cat = AlertCategory::Integrity;
        let debug_str = format!("{:?}", cat);
        assert!(debug_str.contains("Integrity"));
    }

    #[test]
    fn test_alert_category_serialization() {
        let cat = AlertCategory::Resource;
        let json = serde_json::to_string(&cat).expect("AlertCategory should serialize to JSON");
        let restored: AlertCategory =
            serde_json::from_str(&json).expect("AlertCategory should deserialize from JSON");
        assert!(matches!(restored, AlertCategory::Resource));
    }

    // ─────────────────────────────────────────────────────────────
    // Alert Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_alert_creation() {
        let alert = Alert {
            id: "alert-001".to_string(),
            severity: Severity::Warning,
            category: AlertCategory::Performance,
            message: "CPU usage high".to_string(),
            timestamp: 1234567890,
        };

        assert_eq!(alert.id, "alert-001");
        assert_eq!(alert.severity, Severity::Warning);
    }

    #[test]
    fn test_alert_clone() {
        let alert = Alert {
            id: "id".to_string(),
            severity: Severity::Critical,
            category: AlertCategory::Security,
            message: "msg".to_string(),
            timestamp: 100,
        };
        let cloned = alert.clone();
        assert_eq!(cloned.id, "id");
        assert_eq!(cloned.severity, Severity::Critical);
    }

    #[test]
    fn test_alert_debug() {
        let alert = Alert {
            id: "x".to_string(),
            severity: Severity::Info,
            category: AlertCategory::Integrity,
            message: "".to_string(),
            timestamp: 0,
        };
        let debug_str = format!("{:?}", alert);
        assert!(debug_str.contains("Alert"));
    }

    #[test]
    fn test_alert_serialization() {
        let alert = Alert {
            id: "alert-test".to_string(),
            severity: Severity::Warning,
            category: AlertCategory::Resource,
            message: "Low memory".to_string(),
            timestamp: 999999,
        };
        let json = serde_json::to_string(&alert).expect("Alert should serialize to JSON");
        let restored: Alert =
            serde_json::from_str(&json).expect("Alert should deserialize from JSON");
        assert_eq!(restored.id, "alert-test");
        assert_eq!(restored.message, "Low memory");
    }

    // ─────────────────────────────────────────────────────────────
    // SentinelState Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_sentinel_state_default() {
        let state = SentinelState::default();

        assert_eq!(state.integrity_score, 100.0);
        assert!(state.alerts.is_empty());
        assert_eq!(state.scans_performed, 0);
        assert_eq!(state.threats_detected, 0);
        assert_eq!(state.timestamp, 0);
    }

    #[test]
    fn test_sentinel_state_with_data() {
        let state = SentinelState {
            integrity_score: 95.5,
            alerts: vec![],
            scans_performed: 50,
            threats_detected: 2,
            timestamp: 1234567890,
        };

        assert_eq!(state.integrity_score, 95.5);
        assert_eq!(state.scans_performed, 50);
        assert_eq!(state.threats_detected, 2);
    }

    #[test]
    fn test_sentinel_state_clone() {
        let state = SentinelState::default();
        let cloned = state.clone();
        assert_eq!(cloned.integrity_score, state.integrity_score);
    }

    #[test]
    fn test_sentinel_state_debug() {
        let state = SentinelState::default();
        let debug_str = format!("{:?}", state);
        assert!(debug_str.contains("SentinelState"));
    }

    #[test]
    fn test_sentinel_state_serialization() {
        let state = SentinelState {
            integrity_score: 98.0,
            scans_performed: 100,
            ..Default::default()
        };
        let json = serde_json::to_string(&state).expect("SentinelState should serialize to JSON");
        let restored: SentinelState =
            serde_json::from_str(&json).expect("SentinelState should deserialize from JSON");
        assert_eq!(restored.integrity_score, 98.0);
        assert_eq!(restored.scans_performed, 100);
    }

    // ─────────────────────────────────────────────────────────────
    // add_alert Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_add_alert_single() {
        let mut state = SentinelState::default();

        let alert = Alert {
            id: "1".to_string(),
            severity: Severity::Info,
            category: AlertCategory::Performance,
            message: "Test alert".to_string(),
            timestamp: 100,
        };

        state.add_alert(alert);
        assert_eq!(state.alerts.len(), 1);
    }

    #[test]
    fn test_add_alert_multiple() {
        let mut state = SentinelState::default();

        for i in 0..10 {
            let alert = Alert {
                id: format!("alert-{}", i),
                severity: Severity::Info,
                category: AlertCategory::Resource,
                message: format!("Alert {}", i),
                timestamp: i as i64,
            };
            state.add_alert(alert);
        }

        assert_eq!(state.alerts.len(), 10);
    }

    #[test]
    fn test_add_alert_limit_100() {
        let mut state = SentinelState::default();

        // Add 150 alerts
        for i in 0..150 {
            let alert = Alert {
                id: format!("alert-{}", i),
                severity: Severity::Warning,
                category: AlertCategory::Security,
                message: format!("Alert {}", i),
                timestamp: i as i64,
            };
            state.add_alert(alert);
        }

        // Should only keep last 100
        assert_eq!(state.alerts.len(), 100);

        // First alert should be alert-50 (50-149 kept)
        assert_eq!(state.alerts[0].id, "alert-50");

        // Last alert should be alert-149
        assert_eq!(state.alerts[99].id, "alert-149");
    }

    #[test]
    fn test_add_alert_preserves_order() {
        let mut state = SentinelState::default();

        state.add_alert(Alert {
            id: "first".to_string(),
            severity: Severity::Info,
            category: AlertCategory::Integrity,
            message: "First".to_string(),
            timestamp: 1,
        });

        state.add_alert(Alert {
            id: "second".to_string(),
            severity: Severity::Warning,
            category: AlertCategory::Performance,
            message: "Second".to_string(),
            timestamp: 2,
        });

        assert_eq!(state.alerts[0].id, "first");
        assert_eq!(state.alerts[1].id, "second");
    }
}
