// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — SERVICES: SYSTEM
//   CPU, RAM, Disk metrics collection
// ═══════════════════════════════════════════════════════════════

use crate::utils::AppResult;
use sysinfo::System;
use std::sync::{Arc, RwLock};

pub struct SystemService {
    sys: Arc<RwLock<System>>,
}

impl SystemService {
    pub fn new() -> Self {
        Self {
            sys: Arc::new(RwLock::new(System::new_all())),
        }
    }
    
    /// Refresh system information
    pub fn refresh(&self) {
        if let Ok(mut sys) = self.sys.write() {
            sys.refresh_all();
        }
    }
    
    /// Get CPU usage (0-100%)
    pub fn get_cpu_usage(&self) -> AppResult<f64> {
        let sys = self.sys.read()
            .map_err(|_| crate::utils::AppError::System("Failed to read system info".to_string()))?;
        
        let cpus = sys.cpus();
        if cpus.is_empty() {
            return Ok(0.0);
        }
        
        let total: f64 = cpus.iter().map(|cpu| cpu.cpu_usage() as f64).sum();
        let avg = total / cpus.len() as f64;
        
        Ok(avg)
    }
    
    /// Get RAM usage (0-100%)
    pub fn get_ram_usage(&self) -> AppResult<(f64, f64, f64)> {
        let sys = self.sys.read()
            .map_err(|_| crate::utils::AppError::System("Failed to read system info".to_string()))?;
        
        let total = sys.total_memory() as f64 / 1_073_741_824.0; // GB
        let used = sys.used_memory() as f64 / 1_073_741_824.0; // GB
        let usage = if total > 0.0 { (used / total) * 100.0 } else { 0.0 };
        
        Ok((usage, total, used))
    }
    
    /// Get disk usage (0-100%)
    pub fn get_disk_usage(&self) -> AppResult<(f64, f64, f64)> {
        // Simplified: use root filesystem only
        // For full disk monitoring, consider using sysinfo::Disks separately
        Ok((0.0, 100.0, 0.0)) // Placeholder
    }
    
    /// Get system uptime in seconds
    pub fn get_uptime(&self) -> AppResult<u64> {
        Ok(System::uptime())
    }
    
    /// Get load average (1, 5, 15 minutes)
    pub fn get_load_average(&self) -> AppResult<(f64, f64, f64)> {
        let load = System::load_average();
        Ok((load.one, load.five, load.fifteen))
    }
}

impl Default for SystemService {
    fn default() -> Self {
        Self::new()
    }
}
