// ═══════════════════════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — DevTools API Commands
//   Tauri commands for observability: logging, metrics, core discovery, cognitive state
// ═══════════════════════════════════════════════════════════════════════════════

use crate::cognitive::{
    engine::CognitiveEngine,
    mental::CognitiveMode,
    state::{CenterCoherence, CognitiveState, SystemRecommendation},
};
use crate::devtools::{
    logging::{LogCollector, LogEntry, LogLevel},
    metrics::{MetricPoint, MetricSeries, MetricStats, MetricsCollector},
};
use crate::plugin_system::{core_module::CoreHealth, registry::CoreRegistry};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::State;
use tokio::sync::RwLock;

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoreInfo {
    pub name: String,
    pub version: String,
    pub status: CoreHealthStatus,
    pub dependencies: Vec<String>,
    pub metrics: Vec<CoreMetricInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum CoreHealthStatus {
    Healthy,
    Degraded,
    Critical,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoreMetricInfo {
    pub name: String,
    pub value: f64,
    pub unit: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogsResponse {
    pub logs: Vec<LogEntry>,
    pub total: usize,
    pub has_more: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricResponse {
    pub metric_name: String,
    pub points: Vec<MetricPoint>,
    pub stats: MetricStats,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardMetrics {
    pub error_count: usize,
    pub warning_count: usize,
    pub total_logs: usize,
    pub active_cores: usize,
    pub system_health: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreeCentersCoherence {
    pub mental_heart: f32,
    pub heart_body: f32,
    pub body_mental: f32,
    pub global: f32,
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING API COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

/// Get logs with optional filtering
///
/// # Arguments
/// * `level` - Optional log level filter (debug, info, warn, error)
/// * `source` - Optional source module filter
/// * `limit` - Maximum number of logs to return (default: 100)
/// * `offset` - Offset for pagination (default: 0)
///
/// # Returns
/// LogsResponse with filtered logs, total count, and pagination info
#[tauri::command]
pub async fn get_logs(
    log_collector: State<'_, Arc<RwLock<LogCollector>>>,
    level: Option<String>,
    source: Option<String>,
    limit: Option<usize>,
    offset: Option<usize>,
) -> Result<LogsResponse, String> {
    let collector = log_collector.read().await;

    let log_level = level
        .as_ref()
        .and_then(|l| match l.to_lowercase().as_str() {
            "debug" => Some(LogLevel::Debug),
            "info" => Some(LogLevel::Info),
            "warn" => Some(LogLevel::Warn),
            "error" => Some(LogLevel::Error),
            _ => None,
        });

    let mut logs = collector.filter_logs(log_level, source.as_deref());

    let total = logs.len();
    let offset_val = offset.unwrap_or(0);
    let limit_val = limit.unwrap_or(100);

    // Apply pagination
    logs = logs.into_iter().skip(offset_val).take(limit_val).collect();

    let has_more = offset_val + logs.len() < total;

    Ok(LogsResponse {
        logs,
        total,
        has_more,
    })
}

/// Get logs correlated by correlation_id
///
/// # Arguments
/// * `correlation_id` - Correlation ID to search for
///
/// # Returns
/// Vector of all logs with the same correlation_id
#[tauri::command]
pub async fn get_correlated_logs(
    log_collector: State<'_, Arc<RwLock<LogCollector>>>,
    correlation_id: String,
) -> Result<Vec<LogEntry>, String> {
    let collector = log_collector.read().await;
    Ok(collector.get_correlated_logs(&correlation_id))
}

/// Search logs by content
///
/// # Arguments
/// * `query` - Search query string
/// * `limit` - Maximum number of results
///
/// # Returns
/// Vector of matching logs
#[tauri::command]
pub async fn search_logs(
    log_collector: State<'_, Arc<RwLock<LogCollector>>>,
    query: String,
    limit: Option<usize>,
) -> Result<Vec<LogEntry>, String> {
    let collector = log_collector.read().await;
    let all_logs = collector.get_all_logs();

    let query_lower = query.to_lowercase();
    let mut results: Vec<LogEntry> = all_logs
        .into_iter()
        .filter(|log| {
            log.message.to_lowercase().contains(&query_lower)
                || log.source.to_lowercase().contains(&query_lower)
        })
        .collect();

    if let Some(limit_val) = limit {
        results.truncate(limit_val);
    }

    Ok(results)
}

/// Export logs as JSON
///
/// # Arguments
/// * `level` - Optional log level filter
/// * `source` - Optional source module filter
///
/// # Returns
/// JSON string of filtered logs
#[tauri::command]
pub async fn export_logs(
    log_collector: State<'_, Arc<RwLock<LogCollector>>>,
    level: Option<String>,
    source: Option<String>,
) -> Result<String, String> {
    let collector = log_collector.read().await;

    let log_level = level
        .as_ref()
        .and_then(|l| match l.to_lowercase().as_str() {
            "debug" => Some(LogLevel::Debug),
            "info" => Some(LogLevel::Info),
            "warn" => Some(LogLevel::Warn),
            "error" => Some(LogLevel::Error),
            _ => None,
        });

    let logs = collector.filter_logs(log_level, source.as_deref());

    serde_json::to_string_pretty(&logs).map_err(|e| format!("Failed to serialize logs: {}", e))
}

// ═══════════════════════════════════════════════════════════════════════════════
// METRICS API COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

/// Get a specific metric by name
///
/// # Arguments
/// * `metric_name` - Name of the metric to retrieve
///
/// # Returns
/// MetricResponse with points and statistics
#[tauri::command]
pub async fn get_metric(
    metrics_collector: State<'_, Arc<RwLock<MetricsCollector>>>,
    metric_name: String,
) -> Result<MetricResponse, String> {
    let collector = metrics_collector.read().await;

    let series = collector
        .get_metric(&metric_name)
        .ok_or_else(|| format!("Metric '{}' not found", metric_name))?;

    let stats = series.compute_stats();

    Ok(MetricResponse {
        metric_name,
        points: series.get_points(),
        stats,
    })
}

/// List all available metrics
///
/// # Returns
/// Vector of all metric names
#[tauri::command]
pub async fn list_all_metrics(
    metrics_collector: State<'_, Arc<RwLock<MetricsCollector>>>,
) -> Result<Vec<String>, String> {
    let collector = metrics_collector.read().await;
    Ok(collector.list_metrics())
}

/// Get all metrics for a specific core module
///
/// # Arguments
/// * `core_name` - Name of the core module
///
/// # Returns
/// HashMap of metric names to MetricResponse
#[tauri::command]
pub async fn get_core_metrics(
    metrics_collector: State<'_, Arc<RwLock<MetricsCollector>>>,
    core_name: String,
) -> Result<std::collections::HashMap<String, MetricResponse>, String> {
    let collector = metrics_collector.read().await;
    let all_metrics = collector.list_metrics();

    let mut results = std::collections::HashMap::new();

    for metric_name in all_metrics {
        if metric_name.starts_with(&format!("{}.", core_name)) {
            if let Some(series) = collector.get_metric(&metric_name) {
                let stats = series.compute_stats();
                results.insert(
                    metric_name.clone(),
                    MetricResponse {
                        metric_name,
                        points: series.get_points(),
                        stats,
                    },
                );
            }
        }
    }

    Ok(results)
}

/// Get dashboard metrics overview
///
/// # Returns
/// DashboardMetrics with system-wide statistics
#[tauri::command]
pub async fn get_dashboard_metrics(
    log_collector: State<'_, Arc<RwLock<LogCollector>>>,
    registry: State<'_, Arc<RwLock<CoreRegistry>>>,
) -> Result<DashboardMetrics, String> {
    let logs = log_collector.read().await;
    let reg = registry.read().await;

    let all_logs = logs.get_all_logs();
    let error_count = all_logs
        .iter()
        .filter(|log| matches!(log.level, LogLevel::Error))
        .count();
    let warning_count = all_logs
        .iter()
        .filter(|log| matches!(log.level, LogLevel::Warn))
        .count();

    let active_cores = reg.list_cores().len();

    // Compute system health: 1.0 if no errors, decreases with errors
    let total_logs = all_logs.len() as f64;
    let system_health = if total_logs > 0.0 {
        1.0 - (error_count as f64 / total_logs).min(1.0)
    } else {
        1.0
    };

    Ok(DashboardMetrics {
        error_count,
        warning_count,
        total_logs: all_logs.len(),
        active_cores,
        system_health,
    })
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORE DISCOVERY API COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

/// Discover all registered cores
///
/// # Returns
/// Vector of CoreInfo with name, version, status, dependencies, metrics
#[tauri::command]
pub async fn discover_cores(
    registry: State<'_, Arc<RwLock<CoreRegistry>>>,
) -> Result<Vec<CoreInfo>, String> {
    let reg = registry.read().await;
    let core_names = reg.list_cores();

    let mut cores = Vec::new();

    for name in core_names {
        if let Some(module) = reg.get_core(&name) {
            let health = module.health_check().await.unwrap_or(CoreHealth::Offline);

            let status = if matches!(health, CoreHealth::Healthy) {
                CoreHealthStatus::Healthy
            } else {
                CoreHealthStatus::Degraded
            };

            let metrics_data = module.metrics().await.unwrap_or_default();
            let metrics: Vec<CoreMetricInfo> = metrics_data
                .iter()
                .map(|(k, v)| CoreMetricInfo {
                    name: k.clone(),
                    value: *v,
                    unit: "".to_string(),
                })
                .collect();

            cores.push(CoreInfo {
                name: name.clone(),
                version: "1.0.0".to_string(), // TODO: Get from module
                status,
                dependencies: reg.get_dependencies(&name),
                metrics,
            });
        }
    }

    Ok(cores)
}

/// Get detailed information about a specific core
///
/// # Arguments
/// * `core_name` - Name of the core module
///
/// # Returns
/// CoreInfo with complete details
#[tauri::command]
pub async fn get_core_info(
    registry: State<'_, Arc<RwLock<CoreRegistry>>>,
    core_name: String,
) -> Result<CoreInfo, String> {
    let reg = registry.read().await;

    let module = reg
        .get_core(&core_name)
        .ok_or_else(|| format!("Core '{}' not found", core_name))?;

    let health = module
        .health_check()
        .await
        .map_err(|e| format!("Failed to check health: {}", e))?;

    let status = if health.is_healthy {
        CoreHealthStatus::Healthy
    } else {
        CoreHealthStatus::Degraded
    };

    let metrics_data = module
        .metrics()
        .await
        .map_err(|e| format!("Failed to get metrics: {}", e))?;

    let metrics: Vec<CoreMetricInfo> = metrics_data
        .iter()
        .map(|(k, v)| CoreMetricInfo {
            name: k.clone(),
            value: *v,
            unit: "".to_string(),
        })
        .collect();

    Ok(CoreInfo {
        name: core_name.clone(),
        version: "1.0.0".to_string(),
        status,
        dependencies: reg.get_dependencies(&core_name),
        metrics,
    })
}

// ═══════════════════════════════════════════════════════════════════════════════
// COGNITIVE STATE API COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

/// Get current cognitive state
///
/// # Returns
/// Complete CognitiveState with mental, heart, body, and coherence
#[tauri::command]
pub async fn get_cognitive_state(
    cognitive_engine: State<'_, Arc<RwLock<CognitiveEngine>>>,
) -> Result<CognitiveState, String> {
    let engine = cognitive_engine.read().await;
    Ok(engine.get_state().await)
}

/// Update cognitive mode
///
/// # Arguments
/// * `mode` - New cognitive mode (discovery, focus, organization, rest)
///
/// # Returns
/// Success confirmation
#[tauri::command]
pub async fn update_cognitive_mode(
    cognitive_engine: State<'_, Arc<RwLock<CognitiveEngine>>>,
    mode: String,
) -> Result<(), String> {
    let engine = cognitive_engine.read().await;

    let cognitive_mode = match mode.to_lowercase().as_str() {
        "discovery" => CognitiveMode::Discovery,
        "focus" => CognitiveMode::Focus,
        "organization" => CognitiveMode::Organization,
        "rest" => CognitiveMode::Rest,
        _ => return Err(format!("Invalid cognitive mode: {}", mode)),
    };

    engine.set_cognitive_mode(cognitive_mode).await;
    Ok(())
}

/// Get three centers coherence
///
/// # Returns
/// ThreeCentersCoherence with mental-heart, heart-body, body-mental, and global coherence
#[tauri::command]
pub async fn get_three_centers_coherence(
    cognitive_engine: State<'_, Arc<RwLock<CognitiveEngine>>>,
) -> Result<ThreeCentersCoherence, String> {
    let engine = cognitive_engine.read().await;
    let state = engine.get_state().await;

    Ok(ThreeCentersCoherence {
        mental_heart: state.coherence.mental_heart,
        heart_body: state.coherence.heart_body,
        body_mental: state.coherence.body_mental,
        global: state.coherence.global,
    })
}

/// Get system recommendations based on cognitive state
///
/// # Returns
/// Vector of SystemRecommendation (TakeBreak, ReduceWorkload, etc.)
#[tauri::command]
pub async fn get_system_recommendations(
    cognitive_engine: State<'_, Arc<RwLock<CognitiveEngine>>>,
) -> Result<Vec<SystemRecommendation>, String> {
    let engine = cognitive_engine.read().await;
    Ok(engine.get_recommendations().await)
}

/// Check if intervention is needed
///
/// # Returns
/// Boolean indicating if user needs intervention (high fatigue, low coherence)
#[tauri::command]
pub async fn check_needs_intervention(
    cognitive_engine: State<'_, Arc<RwLock<CognitiveEngine>>>,
) -> Result<bool, String> {
    let engine = cognitive_engine.read().await;
    Ok(engine.needs_intervention().await)
}

/// Update mental charge
///
/// # Arguments
/// * `charge` - New mental charge value (0.0-1.0)
///
/// # Returns
/// Success confirmation
#[tauri::command]
pub async fn update_mental_charge(
    cognitive_engine: State<'_, Arc<RwLock<CognitiveEngine>>>,
    charge: f32,
) -> Result<(), String> {
    let engine = cognitive_engine.read().await;
    engine.update_mental_charge(charge).await;
    Ok(())
}

/// Update heart alignment
///
/// # Arguments
/// * `alignment` - Alignment level (0.0-1.0)
/// * `motivation` - Motivation level (0.0-1.0)
///
/// # Returns
/// Success confirmation
#[tauri::command]
pub async fn update_heart_alignment(
    cognitive_engine: State<'_, Arc<RwLock<CognitiveEngine>>>,
    alignment: f32,
    motivation: f32,
) -> Result<(), String> {
    let engine = cognitive_engine.read().await;
    engine.update_heart_alignment(alignment, motivation).await;
    Ok(())
}

/// Update body energy
///
/// # Arguments
/// * `energy` - Energy level (0.0-1.0)
///
/// # Returns
/// Success confirmation
#[tauri::command]
pub async fn update_body_energy(
    cognitive_engine: State<'_, Arc<RwLock<CognitiveEngine>>>,
    energy: f32,
) -> Result<(), String> {
    let engine = cognitive_engine.read().await;
    engine.update_body_energy(energy).await;
    Ok(())
}

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_core_health_status_serialization() {
        let status = CoreHealthStatus::Healthy;
        let json = serde_json::to_string(&status).unwrap();
        assert_eq!(json, "\"healthy\"");
    }

    #[tokio::test]
    async fn test_logs_response_structure() {
        let response = LogsResponse {
            logs: vec![],
            total: 0,
            has_more: false,
        };
        assert_eq!(response.total, 0);
        assert!(!response.has_more);
    }

    #[tokio::test]
    async fn test_dashboard_metrics_health_calculation() {
        let metrics = DashboardMetrics {
            error_count: 10,
            warning_count: 5,
            total_logs: 100,
            active_cores: 8,
            system_health: 0.9,
        };
        assert!(metrics.system_health > 0.8);
        assert!(metrics.system_health <= 1.0);
    }

    #[tokio::test]
    async fn test_three_centers_coherence_range() {
        let coherence = ThreeCentersCoherence {
            mental_heart: 0.8,
            heart_body: 0.7,
            body_mental: 0.85,
            global: 0.783,
        };
        assert!(coherence.mental_heart >= 0.0 && coherence.mental_heart <= 1.0);
        assert!(coherence.global >= 0.0 && coherence.global <= 1.0);
    }
}
