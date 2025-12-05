// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — Core System Commands
//   Tauri commands for interacting with the modular core system
// ═══════════════════════════════════════════════════════════════

use crate::{
    core::helios_module::HeliosCoreModule,
    plugin_system::{
        registry::CoreRegistry,
        orchestrator::CoreOrchestrator,
        core_module::CoreModule,
    },
    types::HeliosState,
};
use std::sync::Arc;
use tauri::State;
use tokio::sync::RwLock;
use serde::{Serialize, Deserialize};

// ═══════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoreSystemStatus {
    pub total_cores: usize,
    pub initialized_cores: Vec<String>,
    pub health_summary: Vec<CoreHealthSummary>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoreHealthSummary {
    pub name: String,
    pub is_healthy: bool,
    pub message: String,
    pub uptime_seconds: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InitializationReport {
    pub successful: Vec<String>,
    pub failed: Vec<String>,
    pub total_time_ms: u128,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShutdownReport {
    pub successful: Vec<String>,
    pub failed: Vec<String>,
    pub total_time_ms: u128,
}

// ═══════════════════════════════════════════════════════════════
// COMMANDS
// ═══════════════════════════════════════════════════════════════

/// Get overall core system status
///
/// Returns information about all registered cores and their health
#[tauri::command]
pub async fn get_core_system_status(
    registry: State<'_, Arc<RwLock<CoreRegistry>>>,
) -> Result<CoreSystemStatus, String> {
    let reg = registry.read().await;
    let core_names = reg.list_cores();
    let total_cores = core_names.len();

    let mut health_summary = Vec::new();

    for name in &core_names {
        if let Some(module) = reg.get_core(name) {
            match module.health_check().await {
                Ok(health) => {
                    health_summary.push(CoreHealthSummary {
                        name: name.clone(),
                        is_healthy: health.is_healthy,
                        message: health.message,
                        uptime_seconds: health.uptime_seconds,
                    });
                },
                Err(e) => {
                    health_summary.push(CoreHealthSummary {
                        name: name.clone(),
                        is_healthy: false,
                        message: format!("Health check failed: {}", e),
                        uptime_seconds: 0,
                    });
                }
            }
        }
    }

    Ok(CoreSystemStatus {
        total_cores,
        initialized_cores: core_names,
        health_summary,
    })
}

/// Initialize all registered cores
///
/// Uses the orchestrator to initialize cores in dependency order
#[tauri::command]
pub async fn initialize_all_cores(
    registry: State<'_, Arc<RwLock<CoreRegistry>>>,
) -> Result<InitializationReport, String> {
    let orchestrator = CoreOrchestrator::new(registry.inner().clone());

    let start = crate::core::utils::now_ms();
    let report = orchestrator.initialize_all().await
        .map_err(|e| format!("Initialization failed: {}", e))?;
    let duration = crate::core::utils::elapsed_ms(start);

    Ok(InitializationReport {
        successful: report.successful_modules,
        failed: report.failed_modules,
        total_time_ms: duration as u128,
    })
}

/// Shutdown all registered cores
///
/// Uses the orchestrator to shutdown cores in reverse dependency order
#[tauri::command]
pub async fn shutdown_all_cores(
    registry: State<'_, Arc<RwLock<CoreRegistry>>>,
) -> Result<ShutdownReport, String> {
    let orchestrator = CoreOrchestrator::new(registry.inner().clone());

    let start = crate::core::utils::now_ms();
    let report = orchestrator.shutdown_all().await
        .map_err(|e| format!("Shutdown failed: {}", e))?;
    let duration = crate::core::utils::elapsed_ms(start);

    Ok(ShutdownReport {
        successful: report.successful_shutdowns,
        failed: report.failed_shutdowns,
        total_time_ms: duration as u128,
    })
}

/// Get Helios system metrics (specialized command)
///
/// Collects fresh system metrics from Helios core
#[tauri::command]
pub async fn get_helios_metrics(
    registry: State<'_, Arc<RwLock<CoreRegistry>>>,
) -> Result<HeliosState, String> {
    let reg = registry.read().await;

    let helios = reg.get_core("Helios")
        .ok_or_else(|| "Helios core not found in registry".to_string())?;

    // Downcast to HeliosCoreModule to access collect()
    let helios_module = helios.as_any()
        .downcast_ref::<HeliosCoreModule>()
        .ok_or_else(|| "Failed to downcast to HeliosCoreModule".to_string())?;

    helios_module.collect().await
}

/// Get last collected Helios state without new collection
///
/// Returns cached state for lightweight queries
#[tauri::command]
pub async fn get_helios_state_cached(
    registry: State<'_, Arc<RwLock<CoreRegistry>>>,
) -> Result<Option<HeliosState>, String> {
    let reg = registry.read().await;

    let helios = reg.get_core("Helios")
        .ok_or_else(|| "Helios core not found in registry".to_string())?;

    let helios_module = helios.as_any()
        .downcast_ref::<HeliosCoreModule>()
        .ok_or_else(|| "Failed to downcast to HeliosCoreModule".to_string())?;

    Ok(helios_module.get_state().await)
}

/// Check health of a specific core
///
/// # Arguments
/// * `core_name` - Name of the core to check
#[tauri::command]
pub async fn check_core_health(
    registry: State<'_, Arc<RwLock<CoreRegistry>>>,
    core_name: String,
) -> Result<CoreHealthSummary, String> {
    let reg = registry.read().await;

    let module = reg.get_core(&core_name)
        .ok_or_else(|| format!("Core '{}' not found", core_name))?;

    let health = module.health_check().await
        .map_err(|e| format!("Health check failed: {}", e))?;

    Ok(CoreHealthSummary {
        name: core_name,
        is_healthy: health.is_healthy,
        message: health.message,
        uptime_seconds: health.uptime_seconds,
    })
}

/// Get metrics for a specific core
///
/// # Arguments
/// * `core_name` - Name of the core
#[tauri::command]
pub async fn get_core_metrics_by_name(
    registry: State<'_, Arc<RwLock<CoreRegistry>>>,
    core_name: String,
) -> Result<std::collections::HashMap<String, f64>, String> {
    let reg = registry.read().await;

    let module = reg.get_core(&core_name)
        .ok_or_else(|| format!("Core '{}' not found", core_name))?;

    module.metrics().await
        .map_err(|e| format!("Failed to get metrics: {}", e))
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_core_system_status_serialization() {
        let status = CoreSystemStatus {
            total_cores: 1,
            initialized_cores: vec!["Helios".to_string()],
            health_summary: vec![
                CoreHealthSummary {
                    name: "Helios".to_string(),
                    is_healthy: true,
                    message: "All systems operational".to_string(),
                    uptime_seconds: 100,
                }
            ],
        };

        let json = serde_json::to_string(&status).unwrap();
        assert!(json.contains("Helios"));
        assert!(json.contains("total_cores"));
    }

    #[test]
    fn test_initialization_report_structure() {
        let report = InitializationReport {
            successful: vec!["Helios".to_string()],
            failed: vec![],
            total_time_ms: 150,
        };

        assert_eq!(report.successful.len(), 1);
        assert_eq!(report.failed.len(), 0);
        assert!(report.total_time_ms > 0);
    }
}
