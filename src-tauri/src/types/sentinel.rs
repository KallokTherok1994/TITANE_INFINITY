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
