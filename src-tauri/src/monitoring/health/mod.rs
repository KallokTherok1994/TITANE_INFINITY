// ═══════════════════════════════════════════════════════════════
//   Monitoring — Health Checks
//   System diagnostics, hypervision, alerts
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

/// Overall system health status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum HealthLevel {
    Healthy,
    Warning,
    Critical,
}

/// Health status across all subsystems
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthStatus {
    pub overall: HealthLevel,
    pub tauri_healthy: bool,
    pub memory_healthy: bool,
    pub filesystem_healthy: bool,
    pub network_healthy: bool,
    pub last_check: chrono::DateTime<chrono::Utc>,
}

/// Health monitor coordinating all health checks
pub struct HealthMonitor {
    status: HealthStatus,
}

impl HealthMonitor {
    pub fn new() -> Self {
        Self {
            status: HealthStatus {
                overall: HealthLevel::Healthy,
                tauri_healthy: true,
                memory_healthy: true,
                filesystem_healthy: true,
                network_healthy: true,
                last_check: chrono::Utc::now(),
            },
        }
    }

    pub fn get_status(&self) -> HealthStatus {
        self.status.clone()
    }

    /// Run all health checks (from system_center/diagnostics.rs)
    pub fn check_all(&mut self) -> HealthStatus {
        self.status.last_check = chrono::Utc::now();

        // FUTUR: Implement actual health checks
        // - Tauri API health
        // - Memory usage thresholds
        // - Filesystem accessibility
        // - Network connectivity

        // Determine overall status
        self.status.overall = if !self.status.tauri_healthy
            || !self.status.memory_healthy
            || !self.status.filesystem_healthy
        {
            HealthLevel::Critical
        } else if !self.status.network_healthy {
            HealthLevel::Warning
        } else {
            HealthLevel::Healthy
        };

        self.status.clone()
    }

    /// Update individual subsystem health
    pub fn update_subsystem_health(
        &mut self,
        subsystem: &str,
        healthy: bool,
    ) -> Result<(), String> {
        match subsystem {
            "tauri" => self.status.tauri_healthy = healthy,
            "memory" => self.status.memory_healthy = healthy,
            "filesystem" => self.status.filesystem_healthy = healthy,
            "network" => self.status.network_healthy = healthy,
            _ => return Err(format!("Unknown subsystem: {}", subsystem)),
        }
        Ok(())
    }
}

impl Default for HealthMonitor {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_health_monitor_new() {
        let monitor = HealthMonitor::new();
        let status = monitor.get_status();
        assert_eq!(status.overall, HealthLevel::Healthy);
        assert!(status.tauri_healthy);
        assert!(status.memory_healthy);
    }

    #[test]
    fn test_check_all_updates_timestamp() {
        let mut monitor = HealthMonitor::new();
        let initial_timestamp = monitor.status.last_check;

        std::thread::sleep(std::time::Duration::from_millis(10));
        monitor.check_all();

        assert!(monitor.status.last_check > initial_timestamp);
    }

    #[test]
    fn test_overall_status_critical_when_subsystem_unhealthy() {
        let mut monitor = HealthMonitor::new();

        monitor.update_subsystem_health("tauri", false).unwrap();
        monitor.check_all();

        assert_eq!(monitor.status.overall, HealthLevel::Critical);
    }

    #[test]
    fn test_overall_status_warning_when_network_unhealthy() {
        let mut monitor = HealthMonitor::new();

        monitor.update_subsystem_health("network", false).unwrap();
        monitor.check_all();

        assert_eq!(monitor.status.overall, HealthLevel::Warning);
    }

    #[test]
    fn test_update_subsystem_health() {
        let mut monitor = HealthMonitor::new();

        assert!(monitor.status.memory_healthy);

        monitor.update_subsystem_health("memory", false).unwrap();

        assert!(!monitor.status.memory_healthy);
    }

    #[test]
    fn test_unknown_subsystem_returns_error() {
        let mut monitor = HealthMonitor::new();

        let result = monitor.update_subsystem_health("invalid", false);

        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Unknown subsystem"));
    }

    #[test]
    fn test_multiple_critical_subsystems() {
        let mut monitor = HealthMonitor::new();

        monitor.update_subsystem_health("tauri", false).unwrap();
        monitor.update_subsystem_health("memory", false).unwrap();
        monitor.check_all();

        assert_eq!(monitor.status.overall, HealthLevel::Critical);
        assert!(!monitor.status.tauri_healthy);
        assert!(!monitor.status.memory_healthy);
    }
}
