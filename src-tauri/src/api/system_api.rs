// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — API: SYSTEM
//   Comprehensive System State Commands (Phase 2b migrated)
// ═══════════════════════════════════════════════════════════════

use crate::{
    plugin_system::core_system::CoreCollection,
    types::{HeliosState, NexusState, HarmoniaState, SentinelState},
    utils::AppResult,
};
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemState {
    pub helios: HeliosState,
    pub nexus: NexusState,
    pub harmonia: HarmoniaState,
    pub sentinel: SentinelState,
}

#[tauri::command]
pub async fn get_full_system_state(
    cores: tauri::State<'_, CoreCollection>,
) -> AppResult<SystemState> {
    let helios_state = cores.helios.collect().await?;
    let nexus_state = cores.nexus.validate().await?;
    let harmonia_state = cores.harmonia.balance(&helios_state).await?;
    let sentinel_state = cores.sentinel.scan(&helios_state).await?;

    Ok(SystemState {
        helios: helios_state,
        nexus: nexus_state,
        harmonia: harmonia_state,
        sentinel: sentinel_state,
    })
}

#[tauri::command]
pub async fn get_nexus_state(cores: tauri::State<'_, CoreCollection>) -> AppResult<NexusState> {
    cores.nexus.validate().await
}

#[tauri::command]
pub async fn get_harmonia_state(
    cores: tauri::State<'_, CoreCollection>,
) -> AppResult<HarmoniaState> {
    let helios_state = cores.helios.collect().await?;
    cores.harmonia.balance(&helios_state).await
}

#[tauri::command]
pub async fn get_sentinel_state(
    cores: tauri::State<'_, CoreCollection>,
) -> AppResult<SentinelState> {
    let helios_state = cores.helios.collect().await?;
    cores.sentinel.scan(&helios_state).await
}

/// Detailed health report with issues and recommendations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetailedHealthReport {
    pub timestamp: DateTime<Utc>,
    pub overall_status: String, // "healthy", "warning", "critical"
    pub issues: Vec<String>,
    pub recommendations: Vec<String>,
    pub metrics: HealthMetrics,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthMetrics {
    pub cpu_percent: f32,
    pub ram_percent: f32,
    pub disk_percent: f32,
    pub memory_entries: usize,
    pub nexus_nodes: usize,
    pub sentinel_alerts: usize,
}

#[tauri::command]
pub async fn get_detailed_health_report(
    cores: tauri::State<'_, CoreCollection>,
) -> AppResult<DetailedHealthReport> {
    let start = std::time::Instant::now();

    let helios_state = cores.helios.collect().await?;
    let nexus_state = cores.nexus.validate().await?;
    let sentinel_state = cores.sentinel.scan(&helios_state).await?;
    let memory_state = cores.memory.get_memory_state().await?;

    let mut issues = Vec::new();
    let mut recommendations = Vec::new();

    // Check CPU
    if helios_state.cpu > 80.0 {
        issues.push(format!("High CPU usage: {:.1}%", helios_state.cpu));
        recommendations.push("Consider closing unused applications or switching to Eco mode".to_string());
    }

    // Check RAM
    if helios_state.ram > 90.0 {
        issues.push(format!("High RAM usage: {:.1}%", helios_state.ram));
        recommendations.push("Memory flush recommended".to_string());
    } else if helios_state.ram > 80.0 {
        recommendations.push("RAM usage elevated, monitor closely".to_string());
    }

    // Check Disk
    if helios_state.disk > 90.0 {
        issues.push(format!("High disk usage: {:.1}%", helios_state.disk));
        recommendations.push("Storage cleanup required".to_string());
    }

    // Check Memory entries
    if memory_state.total_entries > 10000 {
        recommendations.push(format!("Large memory dataset ({} entries), consider archiving", memory_state.total_entries));
    }

    // Check Sentinel alerts
    if sentinel_state.active_alerts > 0 {
        issues.push(format!("{} active security alerts", sentinel_state.active_alerts));
        recommendations.push("Review security alerts in Sentinel dashboard".to_string());
    }

    // Determine overall status
    let overall_status = if issues.is_empty() {
        "healthy".to_string()
    } else if issues.len() >= 3 || helios_state.cpu > 90.0 || helios_state.ram > 95.0 {
        "critical".to_string()
    } else {
        "warning".to_string()
    };

    let duration = start.elapsed();
    log::info!("[Perf] Health report generated in {}ms", duration.as_millis());

    Ok(DetailedHealthReport {
        timestamp: Utc::now(),
        overall_status,
        issues,
        recommendations,
        metrics: HealthMetrics {
            cpu_percent: helios_state.cpu,
            ram_percent: helios_state.ram,
            disk_percent: helios_state.disk,
            memory_entries: memory_state.total_entries,
            nexus_nodes: nexus_state.total_nodes,
            sentinel_alerts: sentinel_state.active_alerts,
        },
    })
}
