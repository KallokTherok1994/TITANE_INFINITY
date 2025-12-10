// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — TYPES: HELIOS
//   System Monitoring Types (CPU, RAM, Disk)
// ═══════════════════════════════════════════════════════════════

use super::shared::HealthStatus;
use serde::{Deserialize, Serialize};

/// Helios module state - System metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HeliosState {
    pub cpu_usage: f64,
    pub ram_usage: f64,
    pub ram_total_gb: f64,
    pub ram_used_gb: f64,
    pub disk_usage: f64,
    pub disk_total_gb: f64,
    pub disk_used_gb: f64,
    pub uptime_seconds: u64,
    pub load_average: LoadAverage,
    pub timestamp: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoadAverage {
    pub one: f64,
    pub five: f64,
    pub fifteen: f64,
}

impl Default for HeliosState {
    fn default() -> Self {
        Self {
            cpu_usage: 0.0,
            ram_usage: 0.0,
            ram_total_gb: 0.0,
            ram_used_gb: 0.0,
            disk_usage: 0.0,
            disk_total_gb: 0.0,
            disk_used_gb: 0.0,
            uptime_seconds: 0,
            load_average: LoadAverage::default(),
            timestamp: 0,
        }
    }
}

impl Default for LoadAverage {
    fn default() -> Self {
        Self {
            one: 0.0,
            five: 0.0,
            fifteen: 0.0,
        }
    }
}

impl HeliosState {
    /// Evaluate health status based on thresholds
    pub fn health_status(&self) -> HealthStatus {
        use crate::utils::constants::{
            HEALTH_CPU_CRITICAL, HEALTH_CPU_WARNING, HEALTH_MEM_CRITICAL, HEALTH_MEM_WARNING,
        };

        if self.cpu_usage >= HEALTH_CPU_CRITICAL || self.ram_usage >= HEALTH_MEM_CRITICAL {
            HealthStatus::Critical
        } else if self.cpu_usage >= HEALTH_CPU_WARNING || self.ram_usage >= HEALTH_MEM_WARNING {
            HealthStatus::Degraded
        } else {
            HealthStatus::Healthy
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // LoadAverage Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_load_average_default() {
        let load = LoadAverage::default();
        assert_eq!(load.one, 0.0);
        assert_eq!(load.five, 0.0);
        assert_eq!(load.fifteen, 0.0);
    }

    #[test]
    fn test_load_average_creation() {
        let load = LoadAverage {
            one: 1.5,
            five: 2.0,
            fifteen: 1.8,
        };
        assert_eq!(load.one, 1.5);
        assert_eq!(load.five, 2.0);
        assert_eq!(load.fifteen, 1.8);
    }

    #[test]
    fn test_load_average_clone() {
        let load = LoadAverage {
            one: 0.5,
            five: 1.0,
            fifteen: 0.8,
        };
        let cloned = load.clone();
        assert_eq!(cloned.one, 0.5);
    }

    #[test]
    fn test_load_average_debug() {
        let load = LoadAverage::default();
        let debug_str = format!("{:?}", load);
        assert!(debug_str.contains("LoadAverage"));
    }

    #[test]
    fn test_load_average_serialization() {
        let load = LoadAverage {
            one: 1.2,
            five: 1.5,
            fifteen: 1.3,
        };
        let json = serde_json::to_string(&load).unwrap();
        let restored: LoadAverage = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.one, 1.2);
        assert_eq!(restored.fifteen, 1.3);
    }

    // ─────────────────────────────────────────────────────────────
    // HeliosState Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_helios_state_default() {
        let state = HeliosState::default();

        assert_eq!(state.cpu_usage, 0.0);
        assert_eq!(state.ram_usage, 0.0);
        assert_eq!(state.ram_total_gb, 0.0);
        assert_eq!(state.ram_used_gb, 0.0);
        assert_eq!(state.disk_usage, 0.0);
        assert_eq!(state.disk_total_gb, 0.0);
        assert_eq!(state.disk_used_gb, 0.0);
        assert_eq!(state.uptime_seconds, 0);
        assert_eq!(state.timestamp, 0);
    }

    #[test]
    fn test_helios_state_with_data() {
        let state = HeliosState {
            cpu_usage: 45.5,
            ram_usage: 60.0,
            ram_total_gb: 16.0,
            ram_used_gb: 9.6,
            disk_usage: 75.0,
            disk_total_gb: 500.0,
            disk_used_gb: 375.0,
            uptime_seconds: 86400,
            load_average: LoadAverage {
                one: 2.0,
                five: 1.5,
                fifteen: 1.0,
            },
            timestamp: 1234567890,
        };

        assert_eq!(state.cpu_usage, 45.5);
        assert_eq!(state.ram_total_gb, 16.0);
        assert_eq!(state.uptime_seconds, 86400);
    }

    #[test]
    fn test_helios_state_clone() {
        let state = HeliosState::default();
        let cloned = state.clone();
        assert_eq!(cloned.cpu_usage, state.cpu_usage);
    }

    #[test]
    fn test_helios_state_debug() {
        let state = HeliosState::default();
        let debug_str = format!("{:?}", state);
        assert!(debug_str.contains("HeliosState"));
    }

    #[test]
    fn test_helios_state_serialization() {
        let state = HeliosState {
            cpu_usage: 25.0,
            ram_usage: 50.0,
            ..Default::default()
        };
        let json = serde_json::to_string(&state).unwrap();
        let restored: HeliosState = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.cpu_usage, 25.0);
        assert_eq!(restored.ram_usage, 50.0);
    }

    // ─────────────────────────────────────────────────────────────
    // Health Status Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_health_status_healthy() {
        let state = HeliosState {
            cpu_usage: 30.0,
            ram_usage: 40.0,
            ..Default::default()
        };
        assert!(matches!(state.health_status(), HealthStatus::Healthy));
    }

    #[test]
    fn test_health_status_degraded_cpu() {
        let state = HeliosState {
            cpu_usage: 75.0, // Above warning threshold (70)
            ram_usage: 40.0,
            ..Default::default()
        };
        assert!(matches!(state.health_status(), HealthStatus::Degraded));
    }

    #[test]
    fn test_health_status_degraded_ram() {
        let state = HeliosState {
            cpu_usage: 30.0,
            ram_usage: 85.0, // Above warning threshold (80)
            ..Default::default()
        };
        assert!(matches!(state.health_status(), HealthStatus::Degraded));
    }

    #[test]
    fn test_health_status_critical_cpu() {
        let state = HeliosState {
            cpu_usage: 95.0, // Above critical threshold (90)
            ram_usage: 40.0,
            ..Default::default()
        };
        assert!(matches!(state.health_status(), HealthStatus::Critical));
    }

    #[test]
    fn test_health_status_critical_ram() {
        let state = HeliosState {
            cpu_usage: 30.0,
            ram_usage: 95.0, // Above critical threshold (95)
            ..Default::default()
        };
        assert!(matches!(state.health_status(), HealthStatus::Critical));
    }

    #[test]
    fn test_health_status_both_critical() {
        let state = HeliosState {
            cpu_usage: 95.0,
            ram_usage: 98.0,
            ..Default::default()
        };
        assert!(matches!(state.health_status(), HealthStatus::Critical));
    }
}
