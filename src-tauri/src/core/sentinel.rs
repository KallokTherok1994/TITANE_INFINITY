// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — CORE: SENTINEL
//   Anomaly Detection & Security Monitoring
// ═══════════════════════════════════════════════════════════════

use crate::{
    types::{SentinelState, Alert, Severity, AlertCategory, HeliosState},
    utils::{AppResult, log_info, log_warn},
};
use chrono::Utc;
use uuid::Uuid;

pub struct SentinelCore {
    scans_performed: std::sync::atomic::AtomicU32,
    threats_detected: std::sync::atomic::AtomicU32,
}

impl SentinelCore {
    pub fn new() -> Self {
        Self {
            scans_performed: std::sync::atomic::AtomicU32::new(0),
            threats_detected: std::sync::atomic::AtomicU32::new(0),
        }
    }
    
    /// Scan system for anomalies
    pub async fn scan(&self, helios: &HeliosState) -> AppResult<SentinelState> {
        log_info("Sentinel", "Scanning for anomalies");
        
        self.scans_performed.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        
        let mut state = SentinelState {
            integrity_score: 100.0,
            alerts: Vec::new(),
            scans_performed: self.scans_performed.load(std::sync::atomic::Ordering::Relaxed),
            threats_detected: self.threats_detected.load(std::sync::atomic::Ordering::Relaxed),
            timestamp: Utc::now().timestamp(),
        };
        
        // Check for resource anomalies
        if helios.cpu_usage > 90.0 {
            let alert = Alert {
                id: Uuid::new_v4().to_string(),
                severity: Severity::Critical,
                category: AlertCategory::Resource,
                message: format!("Critical CPU usage: {:.1}%", helios.cpu_usage),
                timestamp: Utc::now().timestamp(),
            };
            state.add_alert(alert);
            self.threats_detected.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
            state.threats_detected += 1;
            log_warn("Sentinel", &format!("Critical CPU usage detected: {:.1}%", helios.cpu_usage));
        }
        
        if helios.ram_usage > 90.0 {
            let alert = Alert {
                id: Uuid::new_v4().to_string(),
                severity: Severity::Critical,
                category: AlertCategory::Resource,
                message: format!("Critical RAM usage: {:.1}%", helios.ram_usage),
                timestamp: Utc::now().timestamp(),
            };
            state.add_alert(alert);
            self.threats_detected.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
            state.threats_detected += 1;
            log_warn("Sentinel", &format!("Critical RAM usage detected: {:.1}%", helios.ram_usage));
        }
        
        // Calculate integrity score
        let alert_penalty = state.alerts.len() as f64 * 10.0;
        state.integrity_score = (100.0 - alert_penalty).max(0.0);
        
        Ok(state)
    }
}

impl Default for SentinelCore {
    fn default() -> Self {
        Self::new()
    }
}
