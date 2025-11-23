// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — CORE: HELIOS MODULE
//   HeliosCore wrapper implementing CoreModule trait
//   System Monitoring - CPU, RAM, Disk, Load Average
// ═══════════════════════════════════════════════════════════════

use crate::{
    core::helios::HeliosCore,
    plugin_system::{
        core_module::{CoreModule, CoreContext, CoreHealth, CoreError, CoreResult, HealthStatus, CoreMetric},
    },
    types::HeliosState,
};
use async_trait::async_trait;
use std::sync::Arc;
use tokio::sync::RwLock;
use std::time::Instant;

/// HeliosCoreModule - CoreModule implementation for Helios
///
/// This module wraps the existing HeliosCore to provide:
/// - System monitoring (CPU, RAM, Disk, Load)
/// - Health checks based on resource thresholds
/// - Metrics collection for observability
pub struct HeliosCoreModule {
    name: String,
    version: String,
    inner: HeliosCore,
    state: Arc<RwLock<ModuleState>>,
}

struct ModuleState {
    is_initialized: bool,
    initialization_time: Option<Instant>,
    last_collection: Option<HeliosState>,
    collection_count: u64,
}

impl HeliosCoreModule {
    pub fn new() -> Self {
        Self {
            name: "Helios".to_string(),
            version: "17.2.0".to_string(),
            inner: HeliosCore::new(),
            state: Arc::new(RwLock::new(ModuleState {
                is_initialized: false,
                initialization_time: None,
                last_collection: None,
                collection_count: 0,
            })),
        }
    }

    /// Collect current system metrics (public API)
    pub async fn collect(&self) -> Result<HeliosState, String> {
        let mut state = self.state.write().await;

        if !state.is_initialized {
            return Err("Helios not initialized".to_string());
        }

        let metrics = self.inner.collect().await
            .map_err(|e| format!("Failed to collect metrics: {}", e))?;

        state.last_collection = Some(metrics.clone());
        state.collection_count += 1;

        Ok(metrics)
    }

    /// Get last collected state (without new collection)
    pub async fn get_state(&self) -> Option<HeliosState> {
        let state = self.state.read().await;
        state.last_collection.clone()
    }
}

impl Default for HeliosCoreModule {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl CoreModule for HeliosCoreModule {
    fn name(&self) -> &str {
        &self.name
    }

    fn version(&self) -> &str {
        &self.version
    }

    fn dependencies(&self) -> Vec<String> {
        // Helios is a foundational core with no dependencies
        vec![]
    }

    async fn initialize(&self, config: &CoreConfig) -> Result<(), CoreError> {
        if !config.enabled {
            return Err(CoreError::ConfigurationError(
                "Helios is disabled in config".to_string()
            ));
        }

        println!("🚀 Initializing {} v{}", self.name, self.version);

        // Perform initial collection to validate system access
        let initial_state = self.inner.collect().await
            .map_err(|e| CoreError::InitializationFailed(
                format!("Failed initial collection: {}", e)
            ))?;

        let mut state = self.state.write().await;
        state.is_initialized = true;
        state.initialization_time = Some(Instant::now());
        state.last_collection = Some(initial_state);
        state.collection_count = 1;

        println!("✅ {} initialized successfully", self.name);
        Ok(())
    }

    async fn shutdown(&self) -> Result<(), CoreError> {
        println!("🛑 Shutting down {}", self.name);

        let mut state = self.state.write().await;
        state.is_initialized = false;
        state.initialization_time = None;
        state.last_collection = None;

        println!("✅ {} shutdown complete", self.name);
        Ok(())
    }

    async fn health_check(&self) -> Result<CoreHealth, CoreError> {
        let state = self.state.read().await;

        if !state.is_initialized {
            return Ok(CoreHealth {
                is_healthy: false,
                message: "Helios not initialized".to_string(),
                uptime_seconds: 0,
            });
        }

        let uptime = state.initialization_time
            .map(|t| t.elapsed().as_secs())
            .unwrap_or(0);

        // Check last collection health status
        if let Some(ref last) = state.last_collection {
            let health_status = last.health_status();

            let (is_healthy, message) = match health_status {
                crate::types::helios::HealthStatus::Healthy => {
                    (true, format!(
                        "All systems operational (CPU: {:.1}%, RAM: {:.1}%)",
                        last.cpu_usage, last.ram_usage
                    ))
                },
                crate::types::helios::HealthStatus::Warning => {
                    (true, format!(
                        "Warning: High resource usage (CPU: {:.1}%, RAM: {:.1}%)",
                        last.cpu_usage, last.ram_usage
                    ))
                },
                crate::types::helios::HealthStatus::Critical => {
                    (false, format!(
                        "Critical: System resources critical (CPU: {:.1}%, RAM: {:.1}%)",
                        last.cpu_usage, last.ram_usage
                    ))
                },
            };

            Ok(CoreHealth {
                is_healthy,
                message,
                uptime_seconds: uptime,
            })
        } else {
            Ok(CoreHealth {
                is_healthy: true,
                message: "No metrics collected yet".to_string(),
                uptime_seconds: uptime,
            })
        }
    }

    async fn metrics(&self) -> Result<HashMap<String, f64>, CoreError> {
        let state = self.state.read().await;

        let mut metrics = HashMap::new();

        // Add collection count
        metrics.insert("collection_count".to_string(), state.collection_count as f64);

        // Add uptime
        if let Some(init_time) = state.initialization_time {
            metrics.insert("uptime_seconds".to_string(), init_time.elapsed().as_secs() as f64);
        }

        // Add last collected metrics if available
        if let Some(ref last) = state.last_collection {
            metrics.insert("cpu_usage".to_string(), last.cpu_usage);
            metrics.insert("ram_usage".to_string(), last.ram_usage);
            metrics.insert("ram_total_gb".to_string(), last.ram_total_gb);
            metrics.insert("ram_used_gb".to_string(), last.ram_used_gb);
            metrics.insert("disk_usage".to_string(), last.disk_usage);
            metrics.insert("disk_total_gb".to_string(), last.disk_total_gb);
            metrics.insert("disk_used_gb".to_string(), last.disk_used_gb);
            metrics.insert("system_uptime_seconds".to_string(), last.uptime_seconds as f64);
            metrics.insert("load_average_1min".to_string(), last.load_average.one);
            metrics.insert("load_average_5min".to_string(), last.load_average.five);
            metrics.insert("load_average_15min".to_string(), last.load_average.fifteen);
        }

        Ok(metrics)
    }

    async fn reconfigure(&self, config: &CoreConfig) -> Result<(), CoreError> {
        println!("🔧 Reconfiguring {} with new settings", self.name);

        // Helios doesn't have dynamic configuration yet
        // Future: Could add collection interval, thresholds, etc.
        if let Some(interval) = config.settings.get("collection_interval_seconds") {
            println!("  Setting collection_interval = {}", interval);
            // TODO: Store and use this configuration
        }

        Ok(())
    }
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_helios_module_lifecycle() {
        let module = HeliosCoreModule::new();

        assert_eq!(module.name(), "Helios");
        assert_eq!(module.version(), "17.2.0");
        assert_eq!(module.dependencies().len(), 0);
    }

    #[tokio::test]
    async fn test_helios_module_initialization() {
        let module = HeliosCoreModule::new();

        let config = CoreConfig {
            name: "Helios".to_string(),
            enabled: true,
            priority: 255,
            settings: HashMap::new(),
        };

        let result = module.initialize(&config).await;
        assert!(result.is_ok());

        // Check state
        let state = module.state.read().await;
        assert!(state.is_initialized);
        assert!(state.initialization_time.is_some());
        assert!(state.last_collection.is_some());
        assert_eq!(state.collection_count, 1);
    }

    #[tokio::test]
    async fn test_helios_module_collect() {
        let module = HeliosCoreModule::new();

        let config = CoreConfig {
            name: "Helios".to_string(),
            enabled: true,
            priority: 255,
            settings: HashMap::new(),
        };

        module.initialize(&config).await.unwrap();

        let metrics = module.collect().await;
        assert!(metrics.is_ok());

        let metrics = metrics.unwrap();
        assert!(metrics.cpu_usage >= 0.0 && metrics.cpu_usage <= 100.0);
        assert!(metrics.ram_usage >= 0.0 && metrics.ram_usage <= 100.0);
        assert!(metrics.disk_usage >= 0.0 && metrics.disk_usage <= 100.0);
    }

    #[tokio::test]
    async fn test_helios_module_health_check() {
        let module = HeliosCoreModule::new();

        let config = CoreConfig {
            name: "Helios".to_string(),
            enabled: true,
            priority: 255,
            settings: HashMap::new(),
        };

        module.initialize(&config).await.unwrap();

        let health = module.health_check().await;
        assert!(health.is_ok());

        let health = health.unwrap();
        assert!(health.uptime_seconds >= 0);
    }

    #[tokio::test]
    async fn test_helios_module_metrics() {
        let module = HeliosCoreModule::new();

        let config = CoreConfig {
            name: "Helios".to_string(),
            enabled: true,
            priority: 255,
            settings: HashMap::new(),
        };

        module.initialize(&config).await.unwrap();

        let metrics = module.metrics().await;
        assert!(metrics.is_ok());

        let metrics = metrics.unwrap();
        assert!(metrics.contains_key("cpu_usage"));
        assert!(metrics.contains_key("ram_usage"));
        assert!(metrics.contains_key("disk_usage"));
        assert!(metrics.contains_key("collection_count"));
    }

    #[tokio::test]
    async fn test_helios_module_shutdown() {
        let module = HeliosCoreModule::new();

        let config = CoreConfig {
            name: "Helios".to_string(),
            enabled: true,
            priority: 255,
            settings: HashMap::new(),
        };

        module.initialize(&config).await.unwrap();

        let result = module.shutdown().await;
        assert!(result.is_ok());

        let state = module.state.read().await;
        assert!(!state.is_initialized);
    }

    #[tokio::test]
    async fn test_helios_module_disabled_config() {
        let module = HeliosCoreModule::new();

        let config = CoreConfig {
            name: "Helios".to_string(),
            enabled: false,  // Disabled
            priority: 255,
            settings: HashMap::new(),
        };

        let result = module.initialize(&config).await;
        assert!(result.is_err());

        match result {
            Err(CoreError::ConfigurationError(_)) => {},
            _ => panic!("Expected ConfigurationError"),
        }
    }
}
