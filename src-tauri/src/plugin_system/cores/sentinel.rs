// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — PLUGIN SYSTEM: SENTINEL MODULE
//   CoreModule Implementation - Anomaly Detection & Security
// ═══════════════════════════════════════════════════════════════

use crate::{
    plugin_system::{CoreModule, CoreStatus, CoreHealth, CoreResult, CoreError},
    types::{SentinelState, Alert, Severity, AlertCategory, HeliosState},
    utils::{log_info, log_warn},
};
use async_trait::async_trait;
use chrono::Utc;
use std::sync::Arc;
use std::sync::atomic::{AtomicU32, Ordering};
use tokio::sync::RwLock;
use uuid::Uuid;

// ═══════════════════════════════════════════════════════════════
//   SENTINEL MODULE STRUCTURE
// ═══════════════════════════════════════════════════════════════

pub struct SentinelModule {
    name: String,
    version: String,
    status: Arc<RwLock<CoreStatus>>,
    scans_performed: Arc<AtomicU32>,
    threats_detected: Arc<AtomicU32>,
    alerts: Arc<RwLock<Vec<Alert>>>,
}

// ═══════════════════════════════════════════════════════════════
//   IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════

impl SentinelModule {
    pub fn new() -> Self {
        Self {
            name: "Sentinel".to_string(),
            version: "17.2.0".to_string(),
            status: Arc::new(RwLock::new(CoreStatus::Stopped)),
            scans_performed: Arc::new(AtomicU32::new(0)),
            threats_detected: Arc::new(AtomicU32::new(0)),
            alerts: Arc::new(RwLock::new(Vec::new())),
        }
    }

    // ───────────────────────────────────────────────────────────
    //   BUSINESS METHODS
    // ───────────────────────────────────────────────────────────

    /// Scan system for anomalies based on Helios metrics
    pub async fn scan(&self, helios: &HeliosState) -> CoreResult<SentinelState> {
        log_info("SentinelModule", "Scanning for anomalies");

        self.scans_performed.fetch_add(1, Ordering::Relaxed);

        let mut new_alerts = Vec::new();

        // Check for CPU anomalies
        if helios.cpu_usage > 95.0 {
            let alert = Alert {
                id: Uuid::new_v4().to_string(),
                severity: Severity::Critical,
                category: AlertCategory::Resource,
                message: format!("Critical CPU usage: {:.1}%", helios.cpu_usage),
                timestamp: Utc::now().timestamp(),
            };
            new_alerts.push(alert);
            self.threats_detected.fetch_add(1, Ordering::Relaxed);
            log_warn("SentinelModule", &format!("Critical CPU usage detected: {:.1}%", helios.cpu_usage));
        } else if helios.cpu_usage > 80.0 {
            let alert = Alert {
                id: Uuid::new_v4().to_string(),
                severity: Severity::Warning,
                category: AlertCategory::Performance,
                message: format!("High CPU usage: {:.1}%", helios.cpu_usage),
                timestamp: Utc::now().timestamp(),
            };
            new_alerts.push(alert);
        }

        // Check for RAM anomalies
        if helios.ram_usage > 95.0 {
            let alert = Alert {
                id: Uuid::new_v4().to_string(),
                severity: Severity::Critical,
                category: AlertCategory::Resource,
                message: format!("Critical RAM usage: {:.1}%", helios.ram_usage),
                timestamp: Utc::now().timestamp(),
            };
            new_alerts.push(alert);
            self.threats_detected.fetch_add(1, Ordering::Relaxed);
            log_warn("SentinelModule", &format!("Critical RAM usage detected: {:.1}%", helios.ram_usage));
        } else if helios.ram_usage > 80.0 {
            let alert = Alert {
                id: Uuid::new_v4().to_string(),
                severity: Severity::Warning,
                category: AlertCategory::Performance,
                message: format!("High RAM usage: {:.1}%", helios.ram_usage),
                timestamp: Utc::now().timestamp(),
            };
            new_alerts.push(alert);
        }

        // Check for Disk anomalies
        if helios.disk_usage > 95.0 {
            let alert = Alert {
                id: Uuid::new_v4().to_string(),
                severity: Severity::Critical,
                category: AlertCategory::Resource,
                message: format!("Critical Disk usage: {:.1}%", helios.disk_usage),
                timestamp: Utc::now().timestamp(),
            };
            new_alerts.push(alert);
            self.threats_detected.fetch_add(1, Ordering::Relaxed);
        } else if helios.disk_usage > 85.0 {
            let alert = Alert {
                id: Uuid::new_v4().to_string(),
                severity: Severity::Warning,
                category: AlertCategory::Resource,
                message: format!("High Disk usage: {:.1}%", helios.disk_usage),
                timestamp: Utc::now().timestamp(),
            };
            new_alerts.push(alert);
        }

        // Add alerts to collection
        let mut alerts = self.alerts.write().await;
        for alert in new_alerts {
            alerts.push(alert);
        }

        // Keep only last 100 alerts
        if alerts.len() > 100 {
            alerts.drain(0..alerts.len() - 100);
        }

        // Calculate integrity score
        let critical_count = alerts.iter().filter(|a| a.severity == Severity::Critical).count();
        let warning_count = alerts.iter().filter(|a| a.severity == Severity::Warning).count();
        let integrity_score = (100.0 - (critical_count as f64 * 20.0 + warning_count as f64 * 5.0)).max(0.0);

        let state = SentinelState {
            integrity_score,
            alerts: alerts.clone(),
            scans_performed: self.scans_performed.load(Ordering::Relaxed),
            threats_detected: self.threats_detected.load(Ordering::Relaxed),
            timestamp: Utc::now().timestamp(),
        };

        Ok(state)
    }

    /// Get all alerts
    pub async fn get_alerts(&self) -> CoreResult<Vec<Alert>> {
        let alerts = self.alerts.read().await;
        Ok(alerts.clone())
    }

    /// Clear all alerts
    pub async fn clear_alerts(&self) -> CoreResult<()> {
        let mut alerts = self.alerts.write().await;
        alerts.clear();
        Ok(())
    }

    /// Get scan statistics
    pub async fn get_statistics(&self) -> CoreResult<(u32, u32)> {
        let scans = self.scans_performed.load(Ordering::Relaxed);
        let threats = self.threats_detected.load(Ordering::Relaxed);
        Ok((scans, threats))
    }
}

impl Default for SentinelModule {
    fn default() -> Self {
        Self::new()
    }
}

// ═══════════════════════════════════════════════════════════════
//   CORE MODULE TRAIT IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════

#[async_trait]
impl CoreModule for SentinelModule {
    fn name(&self) -> &str {
        &self.name
    }

    fn version(&self) -> &str {
        &self.version
    }

    fn description(&self) -> &str {
        "Anomaly detection and security monitoring core identifying threats and system integrity issues"
    }

    fn dependencies(&self) -> Vec<String> {
        vec!["Helios".to_string()] // Requires Helios for metrics
    }

    fn capabilities(&self) -> Vec<String> {
        vec![
            "security.scan".to_string(),
            "security.alerts".to_string(),
            "security.integrity".to_string(),
            "security.statistics".to_string(),
            "security.clear".to_string(),
        ]
    }

    async fn initialize(&self) -> CoreResult<()> {
        log_info("SentinelModule", "Initializing Sentinel core");

        let mut status = self.status.write().await;
        *status = CoreStatus::Initializing;
        drop(status);

        // Reset counters
        self.scans_performed.store(0, Ordering::Relaxed);
        self.threats_detected.store(0, Ordering::Relaxed);

        // Clear alerts
        let mut alerts = self.alerts.write().await;
        alerts.clear();
        drop(alerts);

        let mut status = self.status.write().await;
        *status = CoreStatus::Ready;

        Ok(())
    }

    async fn start(&self) -> CoreResult<()> {
        log_info("SentinelModule", "Starting Sentinel core");

        let status = self.status.read().await;
        if *status != CoreStatus::Ready {
            return Err(CoreError::InvalidState(
                format!("Cannot start from {:?} state", *status)
            ));
        }
        drop(status);

        let mut status = self.status.write().await;
        *status = CoreStatus::Running;

        Ok(())
    }

    async fn stop(&self) -> CoreResult<()> {
        log_info("SentinelModule", "Stopping Sentinel core");

        let mut status = self.status.write().await;
        *status = CoreStatus::Stopped;

        Ok(())
    }

    async fn shutdown(&self) -> CoreResult<()> {
        log_info("SentinelModule", "Shutting down Sentinel core");

        let mut status = self.status.write().await;
        *status = CoreStatus::Stopped;

        // Clear alerts
        let mut alerts = self.alerts.write().await;
        alerts.clear();

        Ok(())
    }

    async fn get_status(&self) -> CoreStatus {
        *self.status.read().await
    }

    async fn health_check(&self) -> CoreResult<CoreHealth> {
        let status = self.status.read().await;

        match *status {
            CoreStatus::Running => {
                let alerts = self.alerts.read().await;

                // Count critical alerts
                let critical_count = alerts.iter().filter(|a| a.severity == Severity::Critical).count();

                // Failing if 3+ critical alerts
                if critical_count >= 3 {
                    Ok(CoreHealth::Failing)
                }
                // Degraded if 1+ critical alerts
                else if critical_count > 0 {
                    Ok(CoreHealth::Degraded)
                } else {
                    Ok(CoreHealth::Healthy)
                }
            }
            CoreStatus::Ready | CoreStatus::Stopped => Ok(CoreHealth::Healthy),
            CoreStatus::Initializing | CoreStatus::Stopping => Ok(CoreHealth::Degraded),
            CoreStatus::Uninitialized => Ok(CoreHealth::Degraded),
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   UNIT TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::helios::LoadAverage;

    fn create_test_module() -> SentinelModule {
        SentinelModule::new()
    }

    fn create_helios_state(cpu: f64, ram: f64, disk: f64) -> HeliosState {
        HeliosState {
            cpu_usage: cpu,
            ram_usage: ram,
            ram_total_gb: 16.0,
            ram_used_gb: ram * 16.0 / 100.0,
            disk_usage: disk,
            disk_total_gb: 512.0,
            disk_used_gb: disk * 512.0 / 100.0,
            uptime_seconds: 3600,
            load_average: LoadAverage { one: 1.0, five: 1.0, fifteen: 1.0 },
            timestamp: Utc::now().timestamp(),
        }
    }

    #[tokio::test]
    async fn test_sentinel_lifecycle() {
        let module = create_test_module();

        // Initial state
        assert_eq!(module.get_status().await, CoreStatus::Stopped);

        // Initialize
        module.initialize().await.unwrap();
        assert_eq!(module.get_status().await, CoreStatus::Ready);

        // Start
        module.start().await.unwrap();
        assert_eq!(module.get_status().await, CoreStatus::Running);

        // Stop
        module.stop().await.unwrap();
        assert_eq!(module.get_status().await, CoreStatus::Stopped);

        // Shutdown
        module.shutdown().await.unwrap();
        assert_eq!(module.get_status().await, CoreStatus::Stopped);
    }

    #[tokio::test]
    async fn test_sentinel_scan_healthy() {
        let module = create_test_module();
        module.initialize().await.unwrap();
        module.start().await.unwrap();

        // Healthy system
        let helios = create_helios_state(30.0, 40.0, 50.0);
        let state = module.scan(&helios).await.unwrap();

        assert!(state.integrity_score > 90.0);
        assert_eq!(state.alerts.len(), 0);
        assert_eq!(state.scans_performed, 1);
        assert_eq!(state.threats_detected, 0);
    }

    #[tokio::test]
    async fn test_sentinel_scan_warnings() {
        let module = create_test_module();
        module.initialize().await.unwrap();

        // High but not critical load
        let helios = create_helios_state(85.0, 85.0, 50.0);
        let state = module.scan(&helios).await.unwrap();

        assert_eq!(state.alerts.len(), 2); // CPU + RAM warnings
        assert!(state.alerts.iter().all(|a| a.severity == Severity::Warning));
        assert!(state.integrity_score < 100.0);
    }

    #[tokio::test]
    async fn test_sentinel_scan_critical() {
        let module = create_test_module();
        module.initialize().await.unwrap();

        // Critical load
        let helios = create_helios_state(96.0, 97.0, 98.0);
        let state = module.scan(&helios).await.unwrap();

        assert!(state.alerts.len() >= 3); // CPU + RAM + Disk critical
        let critical_count = state.alerts.iter().filter(|a| a.severity == Severity::Critical).count();
        assert!(critical_count >= 3);
        assert_eq!(state.threats_detected, 3);
    }

    #[tokio::test]
    async fn test_sentinel_alerts_limit() {
        let module = create_test_module();
        module.initialize().await.unwrap();

        // Generate 150 alerts (exceeds 100 limit)
        for _ in 0..150 {
            let helios = create_helios_state(96.0, 96.0, 50.0);
            module.scan(&helios).await.unwrap();
        }

        let alerts = module.get_alerts().await.unwrap();
        assert_eq!(alerts.len(), 100); // Capped at 100
    }

    #[tokio::test]
    async fn test_sentinel_clear_alerts() {
        let module = create_test_module();
        module.initialize().await.unwrap();

        // Generate alerts
        let helios = create_helios_state(96.0, 96.0, 50.0);
        module.scan(&helios).await.unwrap();

        let alerts = module.get_alerts().await.unwrap();
        assert!(alerts.len() > 0);

        // Clear
        module.clear_alerts().await.unwrap();

        let alerts = module.get_alerts().await.unwrap();
        assert_eq!(alerts.len(), 0);
    }

    #[tokio::test]
    async fn test_sentinel_statistics() {
        let module = create_test_module();
        module.initialize().await.unwrap();

        // Perform scans
        let helios_healthy = create_helios_state(30.0, 40.0, 50.0);
        let helios_critical = create_helios_state(96.0, 96.0, 50.0);

        module.scan(&helios_healthy).await.unwrap();
        module.scan(&helios_critical).await.unwrap();
        module.scan(&helios_healthy).await.unwrap();

        let (scans, threats) = module.get_statistics().await.unwrap();
        assert_eq!(scans, 3);
        assert_eq!(threats, 2); // One critical scan detected 2 threats
    }

    #[tokio::test]
    async fn test_sentinel_health_check() {
        let module = create_test_module();
        module.initialize().await.unwrap();
        module.start().await.unwrap();

        // Healthy scan
        let helios = create_helios_state(30.0, 40.0, 50.0);
        module.scan(&helios).await.unwrap();

        let health = module.health_check().await.unwrap();
        assert_eq!(health, CoreHealth::Healthy);

        // One critical alert
        let helios = create_helios_state(96.0, 50.0, 50.0);
        module.scan(&helios).await.unwrap();

        let health = module.health_check().await.unwrap();
        assert_eq!(health, CoreHealth::Degraded);

        // Multiple critical alerts
        let helios = create_helios_state(96.0, 96.0, 96.0);
        module.scan(&helios).await.unwrap();

        let health = module.health_check().await.unwrap();
        assert_eq!(health, CoreHealth::Failing);
    }

    #[tokio::test]
    async fn test_sentinel_capabilities() {
        let module = create_test_module();
        let caps = module.capabilities();

        assert_eq!(caps.len(), 5);
        assert!(caps.contains(&"security.scan".to_string()));
        assert!(caps.contains(&"security.alerts".to_string()));
        assert!(caps.contains(&"security.integrity".to_string()));
        assert!(caps.contains(&"security.statistics".to_string()));
        assert!(caps.contains(&"security.clear".to_string()));
    }

    #[tokio::test]
    async fn test_sentinel_dependencies() {
        let module = create_test_module();
        let deps = module.dependencies();

        assert_eq!(deps.len(), 1);
        assert_eq!(deps[0], "Helios");
    }

    #[tokio::test]
    async fn test_sentinel_integrity_score() {
        let module = create_test_module();
        module.initialize().await.unwrap();

        // No alerts -> 100% integrity
        let helios = create_helios_state(30.0, 40.0, 50.0);
        let state = module.scan(&helios).await.unwrap();
        assert_eq!(state.integrity_score, 100.0);

        // Clear and test with alerts
        module.clear_alerts().await.unwrap();

        // One critical alert -> -20 points
        let helios = create_helios_state(96.0, 50.0, 50.0);
        module.scan(&helios).await.unwrap();
        let state = module.scan(&helios).await.unwrap();
        assert!(state.integrity_score >= 79.0 && state.integrity_score <= 81.0);
    }
}
