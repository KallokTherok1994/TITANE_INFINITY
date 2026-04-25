// ─────────────────────────────────────────────────────────────────────────────
// TITANE∞ — Stub Commands (R11)
// Commands called from frontend that have no real backend implementation yet.
// All return { ok: false, error: "not_implemented" } or a safe empty default.
// Registered in invoke_handler so IPC does not silently timeout.
// ─────────────────────────────────────────────────────────────────────────────

use serde_json::{json, Value};
use std::path::{Component, Path, PathBuf};

const MAX_JSON_FILE_BYTES: u64 = 2 * 1024 * 1024;

fn workspace_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap_or_else(|| Path::new(env!("CARGO_MANIFEST_DIR")))
        .to_path_buf()
}

fn workspace_root_canonical() -> Result<PathBuf, String> {
    workspace_root()
        .canonicalize()
        .map_err(|e| format!("stub filesystem workspace root resolution failed: {e}"))
}

fn resolve_workspace_stub_path(path: &str) -> Result<PathBuf, String> {
    let trimmed = path.trim();

    if trimmed.is_empty() {
        return Err("stub filesystem path cannot be empty".to_string());
    }

    if trimmed.contains('\0') {
        return Err("stub filesystem path contains a NUL byte".to_string());
    }

    if trimmed.contains("://") {
        return Err("stub filesystem path cannot use a protocol scheme".to_string());
    }

    let candidate = Path::new(trimmed);
    if candidate
        .components()
        .any(|component| matches!(component, Component::ParentDir))
    {
        return Err("stub filesystem path traversal is not allowed".to_string());
    }

    let workspace_root = workspace_root();
    let workspace_root_canonical = workspace_root_canonical()?;
    let resolved = if candidate.is_absolute() {
        candidate.to_path_buf()
    } else {
        workspace_root.join(candidate)
    };

    let anchor = if resolved.exists() {
        resolved
            .canonicalize()
            .map_err(|e| format!("stub filesystem path resolution failed: {e}"))?
    } else if let Some(parent) = resolved.parent() {
        if parent.exists() {
            parent
                .canonicalize()
                .map_err(|e| format!("stub filesystem parent resolution failed: {e}"))?
                .join(resolved.file_name().unwrap_or_default())
        } else {
            resolved.clone()
        }
    } else {
        resolved.clone()
    };

    if !anchor.starts_with(&workspace_root_canonical) {
        return Err(format!(
            "stub filesystem path escapes workspace root: {}",
            trimmed
        ));
    }

    Ok(resolved)
}

fn resolve_workspace_json_path(path: &str) -> Result<PathBuf, String> {
    let resolved = resolve_workspace_stub_path(path)?;
    let is_json_file = resolved
        .extension()
        .and_then(|extension| extension.to_str())
        .map(|extension| extension.eq_ignore_ascii_case("json"))
        .unwrap_or(false);

    if !is_json_file {
        return Err("read_json_file only accepts .json files inside the workspace".to_string());
    }

    Ok(resolved)
}

// ── Filesystem bridge ────────────────────────────────────────────────────────

#[tauri::command]
pub async fn fs_exists(path: String) -> Result<bool, String> {
    Ok(resolve_workspace_stub_path(&path)?.exists())
}

#[tauri::command]
pub async fn read_json_file(path: String) -> Result<Value, String> {
    let resolved = resolve_workspace_json_path(&path)?;
    let metadata = std::fs::metadata(&resolved).map_err(|e| format!("read_json_file: {e}"))?;

    if metadata.len() > MAX_JSON_FILE_BYTES {
        return Err(format!(
            "read_json_file refuses files larger than {} bytes",
            MAX_JSON_FILE_BYTES
        ));
    }

    let raw = std::fs::read_to_string(&resolved).map_err(|e| format!("read_json_file: {e}"))?;
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

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn unique_workspace_test_file(suffix: &str) -> PathBuf {
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("system clock should be after epoch")
            .as_nanos();
        workspace_root().join(format!("stub-filesystem-test-{nanos}.{suffix}"))
    }

    #[tokio::test]
    async fn test_fs_exists_accepts_workspace_path() {
        let result = fs_exists("package.json".to_string()).await;
        assert_eq!(
            result.expect("workspace file existence should be readable"),
            true
        );
    }

    #[tokio::test]
    async fn test_fs_exists_rejects_outside_workspace_path() {
        let result = fs_exists("/etc/passwd".to_string()).await;
        assert!(result.is_err());
        assert!(result
            .expect_err("outside-workspace path must be rejected")
            .contains("escapes workspace root"));
    }

    #[tokio::test]
    async fn test_read_json_file_reads_workspace_json() {
        let result = read_json_file("package.json".to_string()).await;
        assert!(result.is_ok());

        let parsed = result.expect("package.json should parse as JSON");
        assert_eq!(
            parsed.get("name"),
            Some(&Value::String("titane-infinity".to_string()))
        );
    }

    #[tokio::test]
    async fn test_read_json_file_rejects_path_traversal() {
        let result = read_json_file("../package.json".to_string()).await;
        assert!(result.is_err());
        assert!(result
            .expect_err("path traversal must be rejected")
            .contains("traversal"));
    }

    #[tokio::test]
    async fn test_read_json_file_rejects_non_json_extension() {
        let result = read_json_file("README.md".to_string()).await;
        assert!(result.is_err());
        assert!(result
            .expect_err("non-json files must be rejected")
            .contains("only accepts .json files"));
    }

    #[tokio::test]
    async fn test_read_json_file_rejects_large_json_files() {
        let path = unique_workspace_test_file("json");
        let payload = format!(
            "{{\"data\":\"{}\"}}",
            "x".repeat((MAX_JSON_FILE_BYTES as usize) + 32)
        );

        fs::write(&path, payload).expect("test fixture should be created");
        let result = read_json_file(
            path.strip_prefix(workspace_root())
                .expect("fixture must remain inside workspace")
                .to_string_lossy()
                .to_string(),
        )
        .await;
        fs::remove_file(&path).expect("test fixture should be removed");

        assert!(result.is_err());
        assert!(result
            .expect_err("oversized json must be rejected")
            .contains("refuses files larger than"));
    }
}
