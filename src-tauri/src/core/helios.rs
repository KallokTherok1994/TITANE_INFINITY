// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — CORE: HELIOS
//   System Monitoring - CPU, RAM, Disk, Load
// ═══════════════════════════════════════════════════════════════

use crate::{
    types::{HeliosState, LoadAverage},
    services::SystemService,
    utils::{AppResult, log_info},
};
use chrono::Utc;

pub struct HeliosCore {
    system: SystemService,
}

impl HeliosCore {
    pub fn new() -> Self {
        Self {
            system: SystemService::new(),
        }
    }
    
    /// Collect current system metrics
    pub async fn collect(&self) -> AppResult<HeliosState> {
        log_info("Helios", "Collecting system metrics");
        
        // Refresh system info
        self.system.refresh();
        
        // Collect metrics
        let cpu_usage = self.system.get_cpu_usage()?;
        let (ram_usage, ram_total_gb, ram_used_gb) = self.system.get_ram_usage()?;
        let (disk_usage, disk_total_gb, disk_used_gb) = self.system.get_disk_usage()?;
        let uptime_seconds = self.system.get_uptime()?;
        let (one, five, fifteen) = self.system.get_load_average()?;
        
        Ok(HeliosState {
            cpu_usage,
            ram_usage,
            ram_total_gb,
            ram_used_gb,
            disk_usage,
            disk_total_gb,
            disk_used_gb,
            uptime_seconds,
            load_average: LoadAverage { one, five, fifteen },
            timestamp: Utc::now().timestamp(),
        })
    }
}

impl Default for HeliosCore {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_helios_collect() {
        let helios = HeliosCore::new();
        let state = helios.collect().await;
        assert!(state.is_ok());
        
        let state = state.unwrap();
        assert!(state.cpu_usage >= 0.0 && state.cpu_usage <= 100.0);
        assert!(state.ram_usage >= 0.0 && state.ram_usage <= 100.0);
    }
}
