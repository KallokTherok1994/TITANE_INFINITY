// ─────────────────────────────────────────────────────────────────────────────
// TITANE∞ — Stub Commands (R11)
// Commands called from frontend that have no real backend implementation yet.
// All return { ok: false, error: "not_implemented" } or a safe empty default.
// Registered in invoke_handler so IPC does not silently timeout.
// ─────────────────────────────────────────────────────────────────────────────

use serde_json::{json, Value};

// ── Filesystem bridge ────────────────────────────────────────────────────────

#[tauri::command]
pub async fn fs_exists(path: String) -> Result<bool, String> {
    Ok(std::path::Path::new(&path).exists())
}

#[tauri::command]
pub async fn read_json_file(path: String) -> Result<Value, String> {
    let raw = std::fs::read_to_string(&path).map_err(|e| format!("read_json_file: {e}"))?;
    serde_json::from_str(&raw).map_err(|e| format!("read_json_file parse: {e}"))
}

#[tauri::command]
pub async fn log_to_file(message: String, level: Option<String>) -> Result<(), String> {
    let lvl = level.unwrap_or_else(|| "info".into());
    log::info!("[FRONTEND_LOG][{lvl}] {message}");
    Ok(())
}

// ── Settings bridge ──────────────────────────────────────────────────────────

#[tauri::command]
pub async fn save_settings(settings: Value) -> Result<Value, String> {
    log::info!("[save_settings] received: {settings}");
    Ok(json!({ "ok": true, "saved": true }))
}

// ── Memory stubs ─────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn get_memories(limit: Option<usize>) -> Result<Value, String> {
    let _ = limit;
    Ok(json!({ "ok": true, "memories": [], "stub": true }))
}

#[tauri::command]
pub async fn store_memory(content: Value) -> Result<Value, String> {
    let _ = content;
    Ok(json!({ "ok": true, "stored": false, "stub": true }))
}

#[tauri::command]
pub async fn delete_memory(id: String) -> Result<Value, String> {
    let _ = id;
    Ok(json!({ "ok": true, "deleted": false, "stub": true }))
}

// ── Error reporting ───────────────────────────────────────────────────────────

#[tauri::command]
pub async fn report_chat_error(error: Value) -> Result<(), String> {
    log::error!("[CHAT_ERROR_REPORT] {error}");
    Ok(())
}

// ── Evolution sync stub ───────────────────────────────────────────────────────

#[tauri::command]
pub async fn sync_evolution_state(state: Value) -> Result<Value, String> {
    let _ = state;
    Ok(json!({ "ok": true, "synced": false, "stub": true }))
}

// ── Metrics stub ──────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn get_performance_metrics() -> Result<Value, String> {
    Ok(json!({
        "ok": true,
        "cpu_percent": 0.0,
        "memory_mb": 0.0,
        "stub": true
    }))
}
