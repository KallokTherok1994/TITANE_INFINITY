// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — PLUGIN SYSTEM: HELIOS MODULE
//   CoreModule Implementation - System Monitoring
// ═══════════════════════════════════════════════════════════════

use crate::{
    plugin_system::{CoreModule, CoreStatus, CoreHealth, CoreResult, CoreError},
    types::HeliosState,
    services::SystemService,
    utils::log_info,
};
use async_trait::async_trait;
use chrono::Utc;
use std::sync::Arc;
use tokio::sync::RwLock;

// ═══════════════════════════════════════════════════════════════
//   HELIOS MODULE STRUCTURE
// ═══════════════════════════════════════════════════════════════

pub struct HeliosModule {
    name: String,
    version: String,
    status: Arc<RwLock<CoreStatus>>,
    system: Arc<SystemService>,
    last_state: Arc<RwLock<Option<HeliosState>>>,
}

// ═══════════════════════════════════════════════════════════════
//   IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════

impl HeliosModule {
    pub fn new() -> Self {
        Self {
            name: "Helios".to_string(),
            version: "17.2.0".to_string(),
            status: Arc::new(RwLock::new(CoreStatus::Stopped)),
            system: Arc::new(SystemService::new()),
            last_state: Arc::new(RwLock::new(None)),
        }
    }

    // ───────────────────────────────────────────────────────────
    //   BUSINESS METHODS
    // ───────────────────────────────────────────────────────────

    /// Collect current system metrics
    pub async fn collect(&self) -> CoreResult<HeliosState> {
        log_info("HeliosModule", "Collecting system metrics");

        // Refresh system info
        self.system.refresh();

        // Collect metrics
        let cpu_usage = self.system.get_cpu_usage()
            .map_err(|e| CoreError::Internal(format!("Failed to get CPU: {}", e)))?;
        let (ram_usage, ram_total_gb, ram_used_gb) = self.system.get_ram_usage()
            .map_err(|e| CoreError::Internal(format!("Failed to get RAM: {}", e)))?;
        let (disk_usage, disk_total_gb, disk_used_gb) = self.system.get_disk_usage()
            .map_err(|e| CoreError::Internal(format!("Failed to get disk: {}", e)))?;
        let uptime_seconds = self.system.get_uptime()
            .map_err(|e| CoreError::Internal(format!("Failed to get uptime: {}", e)))?;
        let (one, five, fifteen) = self.system.get_load_average()
            .map_err(|e| CoreError::Internal(format!("Failed to get load: {}", e)))?;

        let state = HeliosState {
            cpu_usage,
            ram_usage,
            ram_total_gb,
            ram_used_gb,
            disk_usage,
            disk_total_gb,
            disk_used_gb,
            uptime_seconds,
            load_average: crate::types::helios::LoadAverage { one, five, fifteen },
            timestamp: Utc::now().timestamp(),
        };

        // Store last state
        let mut last = self.last_state.write().await;
        *last = Some(state.clone());

        Ok(state)
    }

    /// Get last collected state (without new collection)
    pub async fn get_state(&self) -> CoreResult<Option<HeliosState>> {
        let state = self.last_state.read().await;
        Ok(state.clone())
    }
}

impl Default for HeliosModule {
    fn default() -> Self {
        Self::new()
    }
}

// ═══════════════════════════════════════════════════════════════
//   CORE MODULE TRAIT IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════

#[async_trait]
impl CoreModule for HeliosModule {
    fn name(&self) -> &str {
        &self.name
    }

    fn version(&self) -> &str {
        &self.version
    }

    fn description(&self) -> &str {
        "System monitoring core tracking CPU, RAM, disk usage, load average, and system uptime"
    }

    fn dependencies(&self) -> Vec<String> {
        vec![] // Foundational core - no dependencies
    }

    fn capabilities(&self) -> Vec<String> {
        vec![
            "system.monitor.cpu".to_string(),
            "system.monitor.ram".to_string(),
            "system.monitor.disk".to_string(),
            "system.monitor.load".to_string(),
            "system.monitor.uptime".to_string(),
            "system.state".to_string(),
        ]
    }

    async fn initialize(&self) -> CoreResult<()> {
        log_info("HeliosModule", "Initializing Helios core");

        let mut status = self.status.write().await;
        *status = CoreStatus::Initializing;
        drop(status);

        // Perform initial collection to validate system access
        let initial_state = self.collect().await?;

        log_info("HeliosModule", &format!(
            "Initial metrics - CPU: {:.1}%, RAM: {:.1}%, Disk: {:.1}%",
            initial_state.cpu_usage,
            initial_state.ram_usage,
            initial_state.disk_usage
        ));

        let mut status = self.status.write().await;
        *status = CoreStatus::Ready;

        Ok(())
    }

    async fn start(&self) -> CoreResult<()> {
        log_info("HeliosModule", "Starting Helios core");

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
        log_info("HeliosModule", "Stopping Helios core");

        let mut status = self.status.write().await;
        *status = CoreStatus::Stopped;

        Ok(())
    }

    async fn shutdown(&self) -> CoreResult<()> {
        log_info("HeliosModule", "Shutting down Helios core");

        let mut status = self.status.write().await;
        *status = CoreStatus::Stopped;

        // Clear last state
        let mut last = self.last_state.write().await;
        *last = None;

        Ok(())
    }

    async fn get_status(&self) -> CoreStatus {
        *self.status.read().await
    }

    async fn health_check(&self) -> CoreResult<CoreHealth> {
        let status = self.status.read().await;

        match *status {
            CoreStatus::Running => {
                // Check system resources
                let state = self.get_state().await?;

                if let Some(state) = state {
                    // Critical if CPU > 95% or RAM > 95%
                    if state.cpu_usage > 95.0 || state.ram_usage > 95.0 {
                        Ok(CoreHealth::Failing)
                    }
                    // Degraded if CPU > 80% or RAM > 80%
                    else if state.cpu_usage > 80.0 || state.ram_usage > 80.0 {
                        Ok(CoreHealth::Degraded)
                    } else {
                        Ok(CoreHealth::Healthy)
                    }
                } else {
                    Ok(CoreHealth::Degraded) // No metrics collected yet
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

    fn create_test_module() -> HeliosModule {
        HeliosModule::new()
    }

    #[tokio::test]
    async fn test_helios_lifecycle() {
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
    async fn test_helios_collect() {
        let module = create_test_module();
        module.initialize().await.unwrap();
        module.start().await.unwrap();

        // Collect metrics
        let state = module.collect().await.unwrap();

        // Validate ranges
        assert!(state.cpu_usage >= 0.0 && state.cpu_usage <= 100.0);
        assert!(state.ram_usage >= 0.0 && state.ram_usage <= 100.0);
        assert!(state.disk_usage >= 0.0 && state.disk_usage <= 100.0);
        assert!(state.ram_total_gb > 0.0);
        assert!(state.disk_total_gb > 0.0);
    }

    #[tokio::test]
    async fn test_helios_get_state() {
        let module = create_test_module();
        module.initialize().await.unwrap();

        // Initially no state
        let state = module.get_state().await.unwrap();
        assert!(state.is_some()); // initialize() calls collect()

        // After collection
        module.collect().await.unwrap();
        let state = module.get_state().await.unwrap();
        assert!(state.is_some());
    }

    #[tokio::test]
    async fn test_helios_health_check() {
        let module = create_test_module();
        module.initialize().await.unwrap();
        module.start().await.unwrap();

        let health = module.health_check().await.unwrap();

        // Should be healthy or degraded (depending on system load)
        assert!(matches!(health, CoreHealth::Healthy | CoreHealth::Degraded));
    }

    #[tokio::test]
    async fn test_helios_capabilities() {
        let module = create_test_module();
        let caps = module.capabilities();

        assert_eq!(caps.len(), 6);
        assert!(caps.contains(&"system.monitor.cpu".to_string()));
        assert!(caps.contains(&"system.monitor.ram".to_string()));
        assert!(caps.contains(&"system.monitor.disk".to_string()));
        assert!(caps.contains(&"system.monitor.load".to_string()));
        assert!(caps.contains(&"system.monitor.uptime".to_string()));
        assert!(caps.contains(&"system.state".to_string()));
    }

    #[tokio::test]
    async fn test_helios_dependencies() {
        let module = create_test_module();
        let deps = module.dependencies();

        assert_eq!(deps.len(), 0); // Foundational core
    }

    #[tokio::test]
    async fn test_helios_load_average() {
        let module = create_test_module();
        module.initialize().await.unwrap();

        let state = module.collect().await.unwrap();

        // Load average should be reasonable values
        assert!(state.load_average.one >= 0.0);
        assert!(state.load_average.five >= 0.0);
        assert!(state.load_average.fifteen >= 0.0);
    }

    #[tokio::test]
    async fn test_helios_shutdown_clears_state() {
        let module = create_test_module();
        module.initialize().await.unwrap();
        module.collect().await.unwrap();

        // State should exist
        let state = module.get_state().await.unwrap();
        assert!(state.is_some());

        // Shutdown
        module.shutdown().await.unwrap();

        // State should be cleared
        let state = module.get_state().await.unwrap();
        assert!(state.is_none());
    }
}
