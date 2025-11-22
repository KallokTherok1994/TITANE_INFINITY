// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — TYPES: HELIOS
//   System Monitoring Types (CPU, RAM, Disk)
// ═══════════════════════════════════════════════════════════════

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

/// System health status
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum HealthStatus {
    Healthy,
    Warning,
    Critical,
}

impl HeliosState {
    /// Evaluate health status based on thresholds
    pub fn health_status(&self) -> HealthStatus {
        use crate::utils::constants::{HEALTH_CPU_CRITICAL, HEALTH_CPU_WARNING, 
                                       HEALTH_MEM_CRITICAL, HEALTH_MEM_WARNING};
        
        if self.cpu_usage >= HEALTH_CPU_CRITICAL || self.ram_usage >= HEALTH_MEM_CRITICAL {
            HealthStatus::Critical
        } else if self.cpu_usage >= HEALTH_CPU_WARNING || self.ram_usage >= HEALTH_MEM_WARNING {
            HealthStatus::Warning
        } else {
            HealthStatus::Healthy
        }
    }
}
