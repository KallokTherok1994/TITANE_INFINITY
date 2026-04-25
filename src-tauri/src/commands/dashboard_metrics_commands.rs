// ═══════════════════════════════════════════════════════════════
// TITANE∞ — DASHBOARD METRICS COMMANDS
// Métriques temps réel pour graphiques dashboard
// ═══════════════════════════════════════════════════════════════

use crate::security::permission_guard::PERMISSION_GUARD;
use crate::security::permissions::Role;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChartDataPoint {
    pub timestamp: String,
    pub value: f64,
    pub label: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardMetrics {
    pub cpu_usage: Vec<ChartDataPoint>,
    pub memory_usage: Vec<ChartDataPoint>,
    pub api_calls: Vec<ChartDataPoint>,
    pub response_times: Vec<ChartDataPoint>,
}

/// Obtenir les métriques du dashboard pour les graphiques
#[tauri::command]
pub async fn dashboard_get_metrics(
    _time_range: Option<String>,
) -> Result<DashboardMetrics, String> {
    PERMISSION_GUARD
        .require("system_read", Role::User, "dashboard_get_metrics")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    // Lire les métriques depuis les fichiers de logs ou la base
    let metrics_path = std::path::Path::new("data/dashboard_metrics.json");

    if metrics_path.exists() {
        let content = std::fs::read_to_string(metrics_path)
            .map_err(|e| format!("Failed to read metrics: {}", e))?;
        let metrics: DashboardMetrics = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse metrics: {}", e))?;
        return Ok(metrics);
    }

    // Retourner des données vides si aucun historique
    Ok(DashboardMetrics {
        cpu_usage: vec![],
        memory_usage: vec![],
        api_calls: vec![],
        response_times: vec![],
    })
}

/// Obtenir les métriques système en temps réel
#[tauri::command]
pub async fn dashboard_get_realtime_stats() -> Result<serde_json::Value, String> {
    PERMISSION_GUARD
        .require("system_read", Role::User, "dashboard_get_realtime_stats")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    // Collecter les stats système réelles
    let cpu = get_cpu_usage();
    let memory = get_memory_usage();

    Ok(serde_json::json!({
        "cpu_percent": cpu,
        "memory_percent": memory,
        "timestamp": chrono::Utc::now().to_rfc3339(),
    }))
}

#[cfg(target_os = "linux")]
fn get_cpu_usage() -> f64 {
    std::fs::read_to_string("/proc/stat")
        .ok()
        .and_then(|content| {
            content.lines().next().and_then(|line| {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 5 {
                    let user: u64 = parts[1].parse().unwrap_or(0);
                    let system: u64 = parts[3].parse().unwrap_or(0);
                    let idle: u64 = parts[4].parse().unwrap_or(0);
                    let total = user + system + idle;
                    if total > 0 {
                        Some(((user + system) as f64 / total as f64) * 100.0)
                    } else {
                        None
                    }
                } else {
                    None
                }
            })
        })
        .unwrap_or(0.0)
}

#[cfg(not(target_os = "linux"))]
fn get_cpu_usage() -> f64 {
    0.0
}

#[cfg(target_os = "linux")]
fn get_memory_usage() -> f64 {
    std::fs::read_to_string("/proc/meminfo")
        .ok()
        .and_then(|content| {
            let mut total = 0u64;
            let mut available = 0u64;
            for line in content.lines() {
                if line.starts_with("MemTotal:") {
                    total = line
                        .split_whitespace()
                        .nth(1)
                        .and_then(|v| v.parse().ok())
                        .unwrap_or(0);
                } else if line.starts_with("MemAvailable:") {
                    available = line
                        .split_whitespace()
                        .nth(1)
                        .and_then(|v| v.parse().ok())
                        .unwrap_or(0);
                }
            }
            if total > 0 {
                Some(((total - available) as f64 / total as f64) * 100.0)
            } else {
                None
            }
        })
        .unwrap_or(0.0)
}

#[cfg(not(target_os = "linux"))]
fn get_memory_usage() -> f64 {
    0.0
}
