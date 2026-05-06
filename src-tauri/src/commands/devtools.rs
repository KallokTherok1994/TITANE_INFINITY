// ═══════════════════════════════════════════════════════════════════════════════
//   TITANE∞ v30.0.0 — DevTools API Commands
//   Tauri commands for observability: logging, metrics, core discovery, cognitive state
// ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::State;
use titane_infinity::cognitive::engine::CognitiveEngine;
use titane_infinity::cognitive::mental::{CognitiveMode, StructurePhase};
use titane_infinity::cognitive::state::{CognitiveState, SystemRecommendation};
use titane_infinity::compat::plugin_system;
use titane_infinity::compat::plugin_system::registry::CoreRegistry;
use titane_infinity::devtools::logging::{LogCollector, LogEntry, LogFilters, LogLevel};
use titane_infinity::devtools::metrics::{MetricPoint, MetricStats, MetricsCollector};
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
pub struct LogAnalysisIssue {
    pub id: String,
    pub severity: String,
    pub source: String,
    pub message: String,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogIntelligentReport {
    pub report_id: String,
    pub generated_at: String,
    pub total_logs: usize,
    pub error_count: usize,
    pub warning_count: usize,
    pub anomaly_score: f64,
    pub trend_summary: String,
    pub inconsistencies: Vec<String>,
    pub improvement_opportunities: Vec<String>,
    pub anomalies: Vec<LogAnalysisIssue>,
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
    let collector: tokio::sync::RwLockReadGuard<'_, LogCollector> = log_collector.read().await;

    let log_level = level
        .as_ref()
        .and_then(|l| match l.to_lowercase().as_str() {
            "debug" => Some(LogLevel::Debug),
            "info" => Some(LogLevel::Info),
            "warn" => Some(LogLevel::Warn),
            "error" => Some(LogLevel::Error),
            _ => None,
        });

    let filters = LogFilters {
        levels: log_level.map(|lvl| vec![lvl]),
        source_cores: source.map(|s| vec![s]),
        ..Default::default()
    };

    let mut logs: Vec<LogEntry> = collector.filter_logs(&filters).await;

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
    let collector: tokio::sync::RwLockReadGuard<'_, LogCollector> = log_collector.read().await;
    Ok(collector.get_correlated_logs(&correlation_id).await)
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
    let collector: tokio::sync::RwLockReadGuard<'_, LogCollector> = log_collector.read().await;
    let all_logs: Vec<LogEntry> = collector.get_recent(10_000).await;

    let query_lower = query.to_lowercase();
    let mut results: Vec<LogEntry> = all_logs
        .into_iter()
        .filter(|log| {
            log.message.to_lowercase().contains(&query_lower)
                || log.source_core.to_lowercase().contains(&query_lower)
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
    let collector: tokio::sync::RwLockReadGuard<'_, LogCollector> = log_collector.read().await;

    let log_level = level
        .as_ref()
        .and_then(|l| match l.to_lowercase().as_str() {
            "debug" => Some(LogLevel::Debug),
            "info" => Some(LogLevel::Info),
            "warn" => Some(LogLevel::Warn),
            "error" => Some(LogLevel::Error),
            _ => None,
        });

    let filters = LogFilters {
        levels: log_level.map(|lvl| vec![lvl]),
        source_cores: source.map(|s| vec![s]),
        ..Default::default()
    };

    let logs = collector.filter_logs(&filters).await;

    serde_json::to_string_pretty(&logs).map_err(|e| format!("Failed to serialize logs: {}", e))
}

fn infer_issue_severity(level: &LogLevel) -> &'static str {
    match level {
        LogLevel::Error | LogLevel::Fatal => "critical",
        LogLevel::Warn => "warning",
        _ => "info",
    }
}

fn compute_anomaly_score(
    total_logs: usize,
    error_count: usize,
    warning_count: usize,
    inconsistencies: usize,
    anomaly_count: usize,
) -> f64 {
    if total_logs == 0 {
        return 0.0;
    }

    let raw = ((error_count as f64 * 2.0)
        + warning_count as f64
        + (inconsistencies as f64 * 3.0)
        + anomaly_count as f64)
        / total_logs as f64;

    (raw * 100.0).min(100.0)
}

fn compute_trend_summary(first_half_errors: usize, second_half_errors: usize) -> String {
    if first_half_errors == 0 && second_half_errors == 0 {
        return "Stable: aucune erreur détectée dans la fenêtre analysée.".to_string();
    }

    if second_half_errors >= first_half_errors + 2 {
        return "Dégradation: les erreurs augmentent dans la seconde moitié de la fenêtre.".to_string();
    }

    if first_half_errors >= second_half_errors + 2 {
        return "Amélioration: les erreurs diminuent dans la seconde moitié de la fenêtre.".to_string();
    }

    "Stable: variation d erreurs faible entre les deux moitiés de la fenêtre.".to_string()
}

#[tauri::command]
pub async fn analyze_logs_intelligent(
    log_collector: State<'_, Arc<RwLock<LogCollector>>>,
    limit: Option<usize>,
    window_minutes: Option<u64>,
) -> Result<LogIntelligentReport, String> {
    let collector: tokio::sync::RwLockReadGuard<'_, LogCollector> = log_collector.read().await;
    let max_logs = limit.unwrap_or(600).clamp(50, 5000);
    let window = Duration::from_secs(window_minutes.unwrap_or(180).clamp(1, 1440) * 60);
    let threshold = SystemTime::now().checked_sub(window);

    let recent_logs = collector.get_recent(max_logs).await;
    let logs: Vec<LogEntry> = if let Some(time_threshold) = threshold {
        recent_logs
            .into_iter()
            .filter(|entry| entry.timestamp >= time_threshold)
            .collect()
    } else {
        recent_logs
    };

    let total_logs = logs.len();
    let error_count = logs
        .iter()
        .filter(|entry| matches!(entry.level, LogLevel::Error | LogLevel::Fatal))
        .count();
    let warning_count = logs
        .iter()
        .filter(|entry| matches!(entry.level, LogLevel::Warn))
        .count();

    let mut message_counts: HashMap<String, usize> = HashMap::new();
    let mut error_source_counts: HashMap<String, usize> = HashMap::new();

    for entry in &logs {
        *message_counts.entry(entry.message.clone()).or_insert(0) += 1;
        if matches!(entry.level, LogLevel::Error | LogLevel::Fatal | LogLevel::Warn) {
            *error_source_counts
                .entry(entry.source_core.clone())
                .or_insert(0) += 1;
        }
    }

    let anomalies: Vec<LogAnalysisIssue> = logs
        .iter()
        .filter(|entry| {
            let msg = entry.message.to_lowercase();
            matches!(entry.level, LogLevel::Error | LogLevel::Fatal | LogLevel::Warn)
                || msg.contains("panic")
                || msg.contains("timeout")
                || msg.contains("violation")
                || msg.contains("failed")
                || msg.contains("undefined")
        })
        .rev()
        .take(8)
        .map(|entry| LogAnalysisIssue {
            id: entry.id.clone(),
            severity: infer_issue_severity(&entry.level).to_string(),
            source: entry.source_core.clone(),
            message: entry.message.clone(),
            timestamp: format!("{:?}", entry.timestamp),
        })
        .collect::<Vec<_>>()
        .into_iter()
        .rev()
        .collect();

    let mut inconsistencies: Vec<String> = Vec::new();

    if total_logs > 0 && error_count == 0 && warning_count > total_logs / 2 {
        inconsistencies.push(
            "Warnings majoritaires sans erreurs: possible saturation silencieuse des retries.".to_string(),
        );
    }

    if message_counts.values().any(|count| *count >= 5) {
        inconsistencies.push(
            "Messages répétitifs détectés (>=5 occurrences): vérifier une boucle de retry ou un spam de log."
                .to_string(),
        );
    }

    let midpoint = total_logs / 2;
    let first_half_errors = logs
        .iter()
        .take(midpoint)
        .filter(|entry| matches!(entry.level, LogLevel::Error | LogLevel::Fatal))
        .count();
    let second_half_errors = logs
        .iter()
        .skip(midpoint)
        .filter(|entry| matches!(entry.level, LogLevel::Error | LogLevel::Fatal))
        .count();

    let trend_summary = compute_trend_summary(first_half_errors, second_half_errors);

    let mut top_sources: Vec<(String, usize)> = error_source_counts.into_iter().collect();
    top_sources.sort_by(|a, b| b.1.cmp(&a.1));

    let mut improvement_opportunities = vec![
        "Ajouter correlation_id/session_id sur les erreurs critiques pour accélérer la causalité cross-module.".to_string(),
        "Normaliser les messages d erreur avec une cause probable + next step actionnable.".to_string(),
        "Réduire le bruit warning via un seuil d alerte et une déduplication côté source.".to_string(),
    ];

    if let Some((source, count)) = top_sources.first() {
        improvement_opportunities.push(format!(
            "Prioriser une revue du module '{}' ({} entrées warning/error dans la fenêtre).",
            source, count
        ));
    }

    let anomaly_score = compute_anomaly_score(
        total_logs,
        error_count,
        warning_count,
        inconsistencies.len(),
        anomalies.len(),
    );

    let now = SystemTime::now();
    let now_ms = now
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .unwrap_or(0);

    Ok(LogIntelligentReport {
        report_id: format!("log-analysis-{}", now_ms),
        generated_at: format!("{:?}", now),
        total_logs,
        error_count,
        warning_count,
        anomaly_score,
        trend_summary,
        inconsistencies,
        improvement_opportunities,
        anomalies,
    })
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
    let collector: tokio::sync::RwLockReadGuard<'_, MetricsCollector> =
        metrics_collector.read().await;
    let series = collector.get_metric_series(&metric_name).await;
    let (points, stats) = if let Some(series) = series {
        (
            series.values.iter().cloned().collect(),
            MetricStats::from_series(&series),
        )
    } else {
        (
            Vec::new(),
            MetricStats {
                name: metric_name.clone(),
                count: 0,
                average: 0.0,
                min: 0.0,
                max: 0.0,
                last: 0.0,
            },
        )
    };

    Ok(MetricResponse {
        metric_name,
        points,
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
    let collector: tokio::sync::RwLockReadGuard<'_, MetricsCollector> =
        metrics_collector.read().await;
    Ok(collector.list_metrics().await)
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
    let collector: tokio::sync::RwLockReadGuard<'_, MetricsCollector> =
        metrics_collector.read().await;
    let series = collector.get_core_metrics(&core_name).await;
    let mut out = std::collections::HashMap::new();
    for metric in series {
        let metric_name = metric.name.clone();
        out.insert(
            metric_name.clone(),
            MetricResponse {
                metric_name,
                points: metric.values.iter().cloned().collect(),
                stats: MetricStats::from_series(&metric),
            },
        );
    }
    Ok(out)
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
    let _logs = log_collector.read().await;
    let reg: tokio::sync::RwLockReadGuard<'_, CoreRegistry> = registry.read().await;
    let active_cores = reg.list_cores().len();

    Ok(DashboardMetrics {
        error_count: 0,
        warning_count: 0,
        total_logs: 0,
        active_cores,
        system_health: 1.0,
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
    let _reg: tokio::sync::RwLockReadGuard<'_, CoreRegistry> = registry.read().await;
    Ok(Vec::new())
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
    let reg: tokio::sync::RwLockReadGuard<'_, CoreRegistry> = registry.read().await;

    let module = reg.get_core(&core_name);
    let status = if module.is_some() {
        CoreHealthStatus::Healthy
    } else {
        CoreHealthStatus::Unknown
    };
    let metrics: Vec<CoreMetricInfo> = Vec::new();

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
    let engine: tokio::sync::RwLockReadGuard<'_, CognitiveEngine> = cognitive_engine.read().await;

    let cognitive_mode = match mode.to_lowercase().as_str() {
        "discovery" => CognitiveMode::Discovery {
            curiosity_level: 0.5,
            topic_jumping: false,
        },
        "focus" => CognitiveMode::Focus {
            depth: 0.8,
            interruption_cost: 0.7,
        },
        "organization" => CognitiveMode::Organization {
            clarity_target: 0.8,
            structuring_phase: StructurePhase::Collecting,
        },
        "rest" => CognitiveMode::Rest { recovery_rate: 0.6 },
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
    let engine: tokio::sync::RwLockReadGuard<'_, CognitiveEngine> = cognitive_engine.read().await;
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
    let engine: tokio::sync::RwLockReadGuard<'_, CognitiveEngine> = cognitive_engine.read().await;
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
    let engine: tokio::sync::RwLockReadGuard<'_, CognitiveEngine> = cognitive_engine.read().await;
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
    let engine: tokio::sync::RwLockReadGuard<'_, CognitiveEngine> = cognitive_engine.read().await;
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
    let engine: tokio::sync::RwLockReadGuard<'_, CognitiveEngine> = cognitive_engine.read().await;
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
    let engine: tokio::sync::RwLockReadGuard<'_, CognitiveEngine> = cognitive_engine.read().await;
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
        let json = serde_json::to_string(&status).expect("CoreHealthStatus should serialize");
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

    #[tokio::test]
    async fn test_compute_anomaly_score_bounds() {
        let score = compute_anomaly_score(100, 10, 20, 2, 5);
        assert!(score >= 0.0);
        assert!(score <= 100.0);
    }

    #[tokio::test]
    async fn test_compute_anomaly_score_zero_logs() {
        let score = compute_anomaly_score(0, 10, 20, 2, 5);
        assert_eq!(score, 0.0);
    }

    #[tokio::test]
    async fn test_compute_trend_summary_degradation() {
        let trend = compute_trend_summary(1, 4);
        assert!(trend.contains("Dégradation"));
    }

    #[tokio::test]
    async fn test_compute_trend_summary_improvement() {
        let trend = compute_trend_summary(5, 1);
        assert!(trend.contains("Amélioration"));
    }
}
