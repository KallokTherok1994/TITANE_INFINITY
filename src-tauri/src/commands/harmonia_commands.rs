/**
 * TITANE∞ v30.0.0 — Harmonia Commands
 * ═══════════════════════════════════
 *
 * Commandes Tauri pour monitoring CPU et throttling
 * STATUS: PARTIAL — commands defined but NOT registered in main.rs generate_handler[].
 * To activate: add get_harmonia_status, should_throttle, get_recommended_watch_delay,
 * get_harmonia_metrics to the generate_handler![] list in main.rs.
 */
use crate::harmonia_engine::{
    get_cpu_status, get_watch_delay, should_throttle_watchers, CpuStatus,
};

/// Obtient le statut CPU actuel
#[tauri::command]
pub fn get_harmonia_status() -> Result<CpuStatus, String> {
    Ok(get_cpu_status())
}

/// Vérifie si les watchers doivent être throttlés
#[tauri::command]
pub fn should_throttle() -> Result<bool, String> {
    Ok(should_throttle_watchers())
}

/// Obtient le délai recommandé pour les watchers (ms)
#[tauri::command]
pub fn get_recommended_watch_delay() -> Result<u64, String> {
    Ok(get_watch_delay())
}

/// Obtient les métriques Harmonia pour le dashboard
#[tauri::command]
pub fn get_harmonia_metrics() -> Result<serde_json::Value, String> {
    let status = get_cpu_status();
    let should_throttle = should_throttle_watchers();
    let watch_delay = get_watch_delay();

    Ok(serde_json::json!({
        "cpu": status,
        "throttling": {
            "active": should_throttle,
            "watch_delay_ms": watch_delay,
        },
        "timestamp": chrono::Utc::now().timestamp(),
    }))
}
