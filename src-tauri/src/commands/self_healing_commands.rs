// ═══════════════════════════════════════════════════════════════════
// SELF-HEALING COMMANDS - TITANE∞ v21.5.3
// ═══════════════════════════════════════════════════════════════════

use crate::error::TitaneError;
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::sync::Mutex;
use sysinfo::System;
use tauri::Manager;

fn unix_time_ms() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SelfHealingStatus {
    pub enabled: bool,
    pub last_action: Option<String>,
    pub last_action_time: u64,
    pub actions_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VitalsSnapshot {
    pub timestamp_ms: u64,
    pub cpu_usage_percent: f32,
    pub memory_used_bytes: u64,
    pub memory_total_bytes: u64,
    pub uptime_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StoredProfile {
    pub updated_at_ms: u64,
    pub profile: serde_json::Value,
}

lazy_static! {
    static ref HEALING_STATUS: Mutex<SelfHealingStatus> = Mutex::new(SelfHealingStatus {
        enabled: false,
        last_action: None,
        last_action_time: 0,
        actions_count: 0,
    });
    static ref SELFHEAL_PROFILE: Mutex<Option<StoredProfile>> = Mutex::new(None);
}

fn record_action(action: &str) {
    if let Ok(mut status) = HEALING_STATUS.lock() {
        status.last_action = Some(action.to_string());
        status.last_action_time = unix_time_ms();
        status.actions_count = status.actions_count.saturating_add(1);
    }
}

fn profile_path(app: &tauri::AppHandle) -> Result<std::path::PathBuf, TitaneError> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| TitaneError::InternalError(format!("Failed to resolve app_data_dir: {e}")))?;
    Ok(dir.join("selfheal_profile.json"))
}

fn load_profile_from_disk(app: &tauri::AppHandle) -> Result<Option<StoredProfile>, TitaneError> {
    let path = profile_path(app)?;
    if !path.exists() {
        return Ok(None);
    }
    let text = std::fs::read_to_string(&path)
        .map_err(|e| TitaneError::InternalError(format!("Failed to read profile: {e}")))?;
    let parsed: StoredProfile = serde_json::from_str(&text)
        .map_err(|e| TitaneError::InternalError(format!("Failed to parse profile JSON: {e}")))?;
    Ok(Some(parsed))
}

fn save_profile_to_disk(
    app: &tauri::AppHandle,
    profile: &StoredProfile,
) -> Result<(), TitaneError> {
    let path = profile_path(app)?;
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| {
            TitaneError::InternalError(format!("Failed to create profile dir: {e}"))
        })?;
    }
    let text = serde_json::to_string_pretty(profile)
        .map_err(|e| TitaneError::InternalError(format!("Failed to serialize profile: {e}")))?;
    std::fs::write(&path, text)
        .map_err(|e| TitaneError::InternalError(format!("Failed to write profile: {e}")))?;
    Ok(())
}

#[tauri::command]
pub async fn self_healing_trigger(action: String) -> Result<(), TitaneError> {
    log::info!("[SELF_HEALING] trigger: {}", action);

    let mut status = HEALING_STATUS
        .lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock HEALING_STATUS: {}", e)))?;

    if !status.enabled {
        return Err(TitaneError::NotSupported(
            "Self-healing is disabled".to_string(),
        ));
    }

    status.last_action = Some(action.clone());
    status.last_action_time = unix_time_ms();
    status.actions_count += 1;

    log::info!("[SELF_HEALING] ✅ Triggered action: {}", action);
    Ok(())
}

#[tauri::command]
pub async fn self_healing_get_status() -> Result<SelfHealingStatus, TitaneError> {
    log::debug!("[SELF_HEALING] get_status called");

    let status = HEALING_STATUS
        .lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock HEALING_STATUS: {}", e)))?
        .clone();

    Ok(status)
}

#[tauri::command]
pub async fn self_healing_enable() -> Result<(), TitaneError> {
    log::info!("[SELF_HEALING] enable called");

    let mut status = HEALING_STATUS
        .lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock HEALING_STATUS: {}", e)))?;

    status.enabled = true;

    log::info!("[SELF_HEALING] ✅ Self-healing enabled");
    Ok(())
}

#[tauri::command]
pub async fn self_healing_disable() -> Result<(), TitaneError> {
    log::info!("[SELF_HEALING] disable called");

    let mut status = HEALING_STATUS
        .lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock HEALING_STATUS: {}", e)))?;

    status.enabled = false;

    log::info!("[SELF_HEALING] ✅ Self-healing disabled");
    Ok(())
}

// ═══════════════════════════════════════════════════════════════════
// SELF-HEAL (frontend compat)
// ═══════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn selfheal_get_vitals() -> Result<VitalsSnapshot, TitaneError> {
    record_action("selfheal_get_vitals");

    let mut system = System::new_all();
    system.refresh_all();

    let cpu_usage = system.global_cpu_info().cpu_usage();
    let total_mem = system.total_memory().saturating_mul(1024);
    let used_mem = system.used_memory().saturating_mul(1024);
    let uptime_ms = System::uptime().saturating_mul(1000);

    Ok(VitalsSnapshot {
        timestamp_ms: unix_time_ms(),
        cpu_usage_percent: cpu_usage,
        memory_used_bytes: used_mem,
        memory_total_bytes: total_mem,
        uptime_ms,
    })
}

#[tauri::command]
pub async fn selfheal_load_profile(
    app: tauri::AppHandle,
) -> Result<serde_json::Value, TitaneError> {
    record_action("selfheal_load_profile");

    if let Ok(guard) = SELFHEAL_PROFILE.lock() {
        if let Some(profile) = guard.clone() {
            return serde_json::to_value(profile).map_err(|e| {
                TitaneError::InternalError(format!("Failed to serialize profile: {e}"))
            });
        }
    }

    let disk = load_profile_from_disk(&app)?.unwrap_or(StoredProfile {
        updated_at_ms: 0,
        profile: json!({}),
    });

    if let Ok(mut guard) = SELFHEAL_PROFILE.lock() {
        *guard = Some(disk.clone());
    }

    serde_json::to_value(disk)
        .map_err(|e| TitaneError::InternalError(format!("Failed to serialize profile: {e}")))
}

#[tauri::command]
pub async fn selfheal_save_profile(
    app: tauri::AppHandle,
    profile: serde_json::Value,
) -> Result<(), TitaneError> {
    record_action("selfheal_save_profile");

    let stored = StoredProfile {
        updated_at_ms: unix_time_ms(),
        profile,
    };

    save_profile_to_disk(&app, &stored)?;

    if let Ok(mut guard) = SELFHEAL_PROFILE.lock() {
        *guard = Some(stored);
    }

    Ok(())
}

#[tauri::command]
pub async fn selfheal_sync_with_singularity(
    payload: serde_json::Value,
) -> Result<serde_json::Value, TitaneError> {
    record_action("selfheal_sync_with_singularity");
    Ok(json!({
        "status": "ok",
        "received": payload,
        "timestamp_ms": unix_time_ms()
    }))
}

// ═══════════════════════════════════════════════════════════════════
// SELF-HEAL executor actions (frontend compat)
// NOTE: These are intentionally safe-by-default and do not perform
// disruptive OS/process operations.
// ═══════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn selfheal_restart_module(
    module: String,
    force: bool,
) -> Result<serde_json::Value, TitaneError> {
    record_action("selfheal_restart_module");
    Ok(json!({"status":"noop","module":module,"force":force}))
}

#[tauri::command]
pub async fn selfheal_clear_cache(
    module: String,
    cache_type: String,
) -> Result<serde_json::Value, TitaneError> {
    record_action("selfheal_clear_cache");
    Ok(json!({"status":"noop","module":module,"cacheType":cache_type}))
}

#[tauri::command]
pub async fn selfheal_regenerate_config(
    module: String,
    template: String,
) -> Result<serde_json::Value, TitaneError> {
    record_action("selfheal_regenerate_config");
    Ok(json!({"status":"noop","module":module,"template":template}))
}

#[tauri::command]
pub async fn selfheal_repair_json(
    file: String,
    backup: bool,
) -> Result<serde_json::Value, TitaneError> {
    record_action("selfheal_repair_json");

    let path = std::path::PathBuf::from(&file);
    if !path.exists() {
        return Ok(json!({"status":"missing","file":file,"backup":backup}));
    }

    let text = std::fs::read_to_string(&path)
        .map_err(|e| TitaneError::InternalError(format!("Failed to read file: {e}")))?;
    match serde_json::from_str::<serde_json::Value>(&text) {
        Ok(_) => Ok(json!({"status":"valid","file":file,"backup":backup})),
        Err(e) => Ok(json!({"status":"invalid","file":file,"error":e.to_string(),"backup":backup})),
    }
}

#[tauri::command]
pub async fn selfheal_rebuild_memory(
    scope: String,
    preserve_recent: bool,
) -> Result<serde_json::Value, TitaneError> {
    record_action("selfheal_rebuild_memory");
    Ok(json!({"status":"noop","scope":scope,"preserveRecent":preserve_recent}))
}

#[tauri::command]
pub async fn selfheal_switch_provider(
    module: String,
    providers: Vec<String>,
) -> Result<serde_json::Value, TitaneError> {
    record_action("selfheal_switch_provider");
    Ok(json!({"status":"noop","module":module,"providers":providers}))
}

#[tauri::command]
pub async fn selfheal_reset_state(
    module: String,
    scope: String,
    source: Option<String>,
) -> Result<serde_json::Value, TitaneError> {
    record_action("selfheal_reset_state");
    Ok(json!({"status":"noop","module":module,"scope":scope,"source":source}))
}

#[tauri::command]
pub async fn selfheal_restart_worker(
    module: String,
    graceful: bool,
) -> Result<serde_json::Value, TitaneError> {
    record_action("selfheal_restart_worker");
    Ok(json!({"status":"noop","module":module,"graceful":graceful}))
}

#[tauri::command]
pub async fn selfheal_restart_process(
    module: String,
    emergency: bool,
) -> Result<serde_json::Value, TitaneError> {
    record_action("selfheal_restart_process");
    Ok(json!({"status":"not_supported","module":module,"emergency":emergency}))
}

#[tauri::command]
pub async fn selfheal_sync_state(
    module: String,
    force: bool,
) -> Result<serde_json::Value, TitaneError> {
    record_action("selfheal_sync_state");
    Ok(json!({"status":"noop","module":module,"force":force}))
}

#[tauri::command]
pub async fn selfheal_mini_audit(
    module: String,
    depth: String,
) -> Result<serde_json::Value, TitaneError> {
    record_action("selfheal_mini_audit");
    Ok(json!({"status":"ok","module":module,"depth":depth,"timestamp_ms":unix_time_ms()}))
}

#[tauri::command]
pub async fn selfheal_isolate_module(
    module: String,
    reason: String,
) -> Result<serde_json::Value, TitaneError> {
    record_action("selfheal_isolate_module");
    Ok(json!({"status":"noop","module":module,"reason":reason}))
}
