//! TITANE∞ v∞ — System Center: HyperVision
//!
//! Commandes pour le monitoring temps réel :
//! - System metrics (CPU, RAM, disk)
//! - Layer health
//! - Anomaly detection
//!
//! © 2025 TITANE Team. All rights reserved.

use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};

/// Macro for safe mutex locking with auto-recovery
macro_rules! lock_or_recover {
    ($mutex:expr) => {
        $mutex.lock().unwrap_or_else(|poisoned| {
            log::error!("[Hypervision] CRITICAL: Mutex poisoned, recovering...");
            poisoned.into_inner()
        })
    };
}

// ══════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemMetricsSnapshot {
    pub timestamp: u64,
    pub cpu_usage: f32,
    pub memory_usage: f32,
    pub memory_total_mb: u64,
    pub memory_used_mb: u64,
    pub disk_usage: f32,
    pub disk_total_gb: u64,
    pub disk_used_gb: u64,
    pub network_rx_bytes: u64,
    pub network_tx_bytes: u64,
    pub active_processes: usize,
    pub coherence: f32,
    pub stability: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LayerHealth {
    pub layer_id: usize,
    pub name: String,
    pub health: f32,
    pub load: f32,
    pub errors: usize,
    pub warnings: usize,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AnomalySeverity {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Anomaly {
    pub id: String,
    pub timestamp: u64,
    pub severity: AnomalySeverity,
    pub layer: String,
    pub metric: String,
    pub description: String,
    pub value: f32,
    pub threshold: f32,
    pub auto_resolved: bool,
    pub resolved_at: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HyperVisionState {
    pub is_monitoring: bool,
    pub started_at: Option<u64>,
    pub metrics_count: usize,
    pub anomalies_count: usize,
    pub last_update: Option<u64>,
}

// ══════════════════════════════════════════════════════════════════
// INTERNAL STATE
// ══════════════════════════════════════════════════════════════════

const MAX_METRICS_HISTORY: usize = 500;
const MAX_ANOMALIES: usize = 100;

#[derive(Default)]
struct HyperVisionInternalState {
    is_monitoring: bool,
    started_at: Option<u64>,
    metrics_history: Vec<SystemMetricsSnapshot>,
    anomalies: Vec<Anomaly>,
}

static HV_STATE: Lazy<Arc<Mutex<HyperVisionInternalState>>> =
    Lazy::new(|| Arc::new(Mutex::new(HyperVisionInternalState::default())));

static LAYER_NAMES: [&str; 5] = ["Physical", "Network", "Logic", "Memory", "Security"];

// ══════════════════════════════════════════════════════════════════
// METRICS COLLECTION
// ══════════════════════════════════════════════════════════════════

fn collect_metrics() -> SystemMetricsSnapshot {
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or(std::time::Duration::from_secs(0))
        .as_millis() as u64;

    // Simulated metrics (in production, use sysinfo crate)
    // TODO: Replace with actual system metrics collection
    SystemMetricsSnapshot {
        timestamp,
        cpu_usage: 30.0 + (rand::random::<f32>() * 40.0),
        memory_usage: 50.0 + (rand::random::<f32>() * 30.0),
        memory_total_mb: 16384,
        memory_used_mb: 8192 + (rand::random::<f32>() * 4096.0) as u64,
        disk_usage: 60.0 + (rand::random::<f32>() * 15.0),
        disk_total_gb: 512,
        disk_used_gb: 300 + (rand::random::<f32>() * 50.0) as u64,
        network_rx_bytes: 1024 * 1024 * (1 + rand::random::<u64>() % 100),
        network_tx_bytes: 512 * 1024 * (1 + rand::random::<u64>() % 50),
        active_processes: 100 + (rand::random::<f32>() * 50.0) as usize,
        coherence: 85.0 + (rand::random::<f32>() * 15.0),
        stability: 90.0 + (rand::random::<f32>() * 10.0),
    }
}

fn get_layer_health(layer_id: usize) -> LayerHealth {
    let health = 80.0 + (rand::random::<f32>() * 20.0);
    let status = if health >= 90.0 {
        "excellent"
    } else if health >= 70.0 {
        "good"
    } else if health >= 50.0 {
        "degraded"
    } else {
        "critical"
    };

    LayerHealth {
        layer_id,
        name: LAYER_NAMES.get(layer_id).unwrap_or(&"Unknown").to_string(),
        health,
        load: 20.0 + (rand::random::<f32>() * 50.0),
        errors: (rand::random::<f32>() * 3.0) as usize,
        warnings: (rand::random::<f32>() * 10.0) as usize,
        status: status.to_string(),
    }
}

fn detect_anomalies(metrics: &SystemMetricsSnapshot) -> Vec<Anomaly> {
    let mut anomalies = Vec::new();

    // CPU anomaly
    if metrics.cpu_usage > 90.0 {
        anomalies.push(Anomaly {
            id: uuid::Uuid::new_v4().to_string(),
            timestamp: metrics.timestamp,
            severity: AnomalySeverity::High,
            layer: "Physical".to_string(),
            metric: "cpu_usage".to_string(),
            description: format!("High CPU usage detected: {:.1}%", metrics.cpu_usage),
            value: metrics.cpu_usage,
            threshold: 90.0,
            auto_resolved: false,
            resolved_at: None,
        });
    }

    // Memory anomaly
    if metrics.memory_usage > 95.0 {
        anomalies.push(Anomaly {
            id: uuid::Uuid::new_v4().to_string(),
            timestamp: metrics.timestamp,
            severity: AnomalySeverity::Critical,
            layer: "Memory".to_string(),
            metric: "memory_usage".to_string(),
            description: format!("Critical memory usage: {:.1}%", metrics.memory_usage),
            value: metrics.memory_usage,
            threshold: 95.0,
            auto_resolved: false,
            resolved_at: None,
        });
    }

    // Disk anomaly
    if metrics.disk_usage > 90.0 {
        anomalies.push(Anomaly {
            id: uuid::Uuid::new_v4().to_string(),
            timestamp: metrics.timestamp,
            severity: AnomalySeverity::Medium,
            layer: "Storage".to_string(),
            metric: "disk_usage".to_string(),
            description: format!("High disk usage: {:.1}%", metrics.disk_usage),
            value: metrics.disk_usage,
            threshold: 90.0,
            auto_resolved: false,
            resolved_at: None,
        });
    }

    // Low coherence
    if metrics.coherence < 70.0 {
        anomalies.push(Anomaly {
            id: uuid::Uuid::new_v4().to_string(),
            timestamp: metrics.timestamp,
            severity: AnomalySeverity::Medium,
            layer: "Logic".to_string(),
            metric: "coherence".to_string(),
            description: format!("Low system coherence: {:.1}%", metrics.coherence),
            value: metrics.coherence,
            threshold: 70.0,
            auto_resolved: false,
            resolved_at: None,
        });
    }

    anomalies
}

// ══════════════════════════════════════════════════════════════════
// TAURI COMMANDS
// ══════════════════════════════════════════════════════════════════

/// Start HyperVision monitoring
#[tauri::command]
pub async fn sc_hypervision_start() -> Result<HyperVisionState, String> {
    let mut state = lock_or_recover!(HV_STATE);

    if state.is_monitoring {
        return Err("HyperVision already running".to_string());
    }

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or(std::time::Duration::from_secs(0))
        .as_secs();

    state.is_monitoring = true;
    state.started_at = Some(now);

    println!("[SystemCenter::HyperVision] Monitoring started");

    Ok(HyperVisionState {
        is_monitoring: true,
        started_at: Some(now),
        metrics_count: state.metrics_history.len(),
        anomalies_count: state.anomalies.len(),
        last_update: None,
    })
}

/// Stop HyperVision monitoring
#[tauri::command]
pub async fn sc_hypervision_stop() -> Result<(), String> {
    let mut state = lock_or_recover!(HV_STATE);
    state.is_monitoring = false;
    state.started_at = None;

    println!("[SystemCenter::HyperVision] Monitoring stopped");

    Ok(())
}

/// Get current state
#[tauri::command]
pub async fn sc_hypervision_get_state() -> Result<HyperVisionState, String> {
    let state = lock_or_recover!(HV_STATE);

    Ok(HyperVisionState {
        is_monitoring: state.is_monitoring,
        started_at: state.started_at,
        metrics_count: state.metrics_history.len(),
        anomalies_count: state.anomalies.len(),
        last_update: state.metrics_history.last().map(|m| m.timestamp),
    })
}

/// Get current metrics snapshot
#[tauri::command]
pub async fn sc_hypervision_get_metrics() -> Result<SystemMetricsSnapshot, String> {
    let metrics = collect_metrics();

    // Store in history
    let mut state = lock_or_recover!(HV_STATE);
    if state.metrics_history.len() >= MAX_METRICS_HISTORY {
        state.metrics_history.remove(0);
    }
    state.metrics_history.push(metrics.clone());

    // Detect anomalies
    let new_anomalies = detect_anomalies(&metrics);
    for anomaly in new_anomalies {
        if state.anomalies.len() >= MAX_ANOMALIES {
            state.anomalies.remove(0);
        }
        state.anomalies.push(anomaly);
    }

    Ok(metrics)
}

/// Get metrics history
#[tauri::command]
pub async fn sc_hypervision_get_history(
    limit: Option<usize>,
) -> Result<Vec<SystemMetricsSnapshot>, String> {
    let state = lock_or_recover!(HV_STATE);
    let limit = limit.unwrap_or(100);

    let start = if state.metrics_history.len() > limit {
        state.metrics_history.len() - limit
    } else {
        0
    };

    Ok(state.metrics_history[start..].to_vec())
}

/// Get layer health for all layers
#[tauri::command]
pub async fn sc_hypervision_get_layers() -> Result<Vec<LayerHealth>, String> {
    let layers: Vec<LayerHealth> = (0..5).map(get_layer_health).collect();
    Ok(layers)
}

/// Get detected anomalies
#[tauri::command]
pub async fn sc_hypervision_get_anomalies(
    include_resolved: Option<bool>,
) -> Result<Vec<Anomaly>, String> {
    let state = lock_or_recover!(HV_STATE);
    let include = include_resolved.unwrap_or(false);

    let anomalies: Vec<Anomaly> = state
        .anomalies
        .iter()
        .filter(|a| include || !a.auto_resolved)
        .cloned()
        .collect();

    Ok(anomalies)
}

/// Clear anomalies
#[tauri::command]
pub async fn sc_hypervision_clear_anomalies() -> Result<(), String> {
    let mut state = lock_or_recover!(HV_STATE);
    state.anomalies.clear();
    Ok(())
}

/// Resolve an anomaly
#[tauri::command]
pub async fn sc_hypervision_resolve_anomaly(anomaly_id: String) -> Result<(), String> {
    let mut state = lock_or_recover!(HV_STATE);

    if let Some(anomaly) = state.anomalies.iter_mut().find(|a| a.id == anomaly_id) {
        anomaly.auto_resolved = true;
        anomaly.resolved_at = Some(
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or(std::time::Duration::from_secs(0))
                .as_secs(),
        );
        Ok(())
    } else {
        Err(format!("Anomaly {} not found", anomaly_id))
    }
}
