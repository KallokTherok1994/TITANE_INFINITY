// ═══════════════════════════════════════════════════════════════════
// GOVERNANCE COMMANDS - TITANE∞ v21.5.3
// ═══════════════════════════════════════════════════════════════════
//
// Commandes pour la gestion des politiques IA, permissions et audit.

use crate::error::TitaneError;
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IAPolicy {
    pub id: String,
    pub name: String,
    pub description: String,
    pub enabled: bool,
    pub rules: Vec<PolicyRule>,
    pub created_at: u64,
    pub updated_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PolicyRule {
    pub condition: String,
    pub action: String,
    pub severity: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PermissionMatrix {
    pub roles: Vec<String>,
    pub permissions: HashMap<String, Vec<String>>,
    pub last_updated: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PermissionAuditEntry {
    pub timestamp: u64,
    pub user: String,
    pub action: String,
    pub resource: String,
    pub granted: bool,
    pub reason: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityLogEntry {
    pub timestamp: u64,
    pub level: String, // "Info", "Warning", "Error", "Critical"
    pub category: String,
    pub message: String,
    pub metadata: HashMap<String, String>,
}

// ═══════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════

lazy_static! {
    static ref IA_POLICIES: Mutex<Vec<IAPolicy>> = Mutex::new(Vec::new());
    static ref PERMISSION_MATRIX: Mutex<PermissionMatrix> = Mutex::new(PermissionMatrix {
        roles: vec!["admin".to_string(), "user".to_string(), "guest".to_string()],
        permissions: HashMap::new(),
        last_updated: 0,
    });
    static ref PERMISSION_AUDIT: Mutex<Vec<PermissionAuditEntry>> = Mutex::new(Vec::new());
    static ref SECURITY_LOG: Mutex<Vec<SecurityLogEntry>> = Mutex::new(Vec::new());
}

// ═══════════════════════════════════════════════════════════════════
// COMMANDS - IA POLICIES
// ═══════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn get_ia_policies() -> Result<Vec<IAPolicy>, TitaneError> {
    log::debug!("[GOVERNANCE] get_ia_policies called");

    let policies = IA_POLICIES
        .lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock IA_POLICIES: {}", e)))?
        .clone();

    log::info!("[GOVERNANCE] Returned {} IA policies", policies.len());
    Ok(policies)
}

#[tauri::command]
pub async fn save_ia_policies(policies: Vec<IAPolicy>) -> Result<(), TitaneError> {
    log::debug!(
        "[GOVERNANCE] save_ia_policies called with {} policies",
        policies.len()
    );

    let mut state = IA_POLICIES
        .lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock IA_POLICIES: {}", e)))?;

    *state = policies;

    log::info!("[GOVERNANCE] ✅ Saved {} IA policies", state.len());
    Ok(())
}

#[tauri::command]
pub async fn toggle_ia_policy(policy_id: String, enabled: bool) -> Result<(), TitaneError> {
    log::debug!("[GOVERNANCE] toggle_ia_policy: {} → {}", policy_id, enabled);

    let mut state = IA_POLICIES
        .lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock IA_POLICIES: {}", e)))?;

    if let Some(policy) = state.iter_mut().find(|p| p.id == policy_id) {
        policy.enabled = enabled;
        policy.updated_at = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        log::info!(
            "[GOVERNANCE] ✅ Toggled policy '{}' to {}",
            policy_id,
            enabled
        );
        Ok(())
    } else {
        Err(TitaneError::MemoryEntryNotFound(format!(
            "Policy not found: {}",
            policy_id
        )))
    }
}

#[tauri::command]
pub async fn create_ia_policy(policy: IAPolicy) -> Result<String, String> {
    log::debug!("[GOVERNANCE] create_ia_policy: {}", policy.name);

    let mut state = IA_POLICIES
        .lock()
        .map_err(|e| format!("Failed to lock IA_POLICIES: {}", e))?;

    let id = policy.id.clone();
    state.push(policy);

    log::info!("[GOVERNANCE] ✅ Created policy '{}'", id);
    Ok(id)
}

#[tauri::command]
pub async fn delete_ia_policy(policy_id: String) -> Result<(), String> {
    log::debug!("[GOVERNANCE] delete_ia_policy: {}", policy_id);

    let mut state = IA_POLICIES
        .lock()
        .map_err(|e| format!("Failed to lock IA_POLICIES: {}", e))?;

    state.retain(|p| p.id != policy_id);

    log::info!("[GOVERNANCE] ✅ Deleted policy '{}'", policy_id);
    Ok(())
}

// ═══════════════════════════════════════════════════════════════════
// COMMANDS - PERMISSION MATRIX
// ═══════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn get_permission_matrix() -> Result<PermissionMatrix, String> {
    log::debug!("[GOVERNANCE] get_permission_matrix called");

    let matrix = PERMISSION_MATRIX
        .lock()
        .map_err(|e| format!("Failed to lock PERMISSION_MATRIX: {}", e))?
        .clone();

    log::info!(
        "[GOVERNANCE] Returned permission matrix with {} roles",
        matrix.roles.len()
    );
    Ok(matrix)
}

// ═══════════════════════════════════════════════════════════════════
// COMMANDS - PERMISSION AUDIT
// ═══════════════════════════════════════════════════════════════════

// NOTE: get_permission_audit already exists in src-tauri/src/secure_commands.rs
// Removed duplicate to avoid E0428 compilation error

#[tauri::command]
pub async fn clear_permission_audit() -> Result<(), String> {
    log::debug!("[GOVERNANCE] clear_permission_audit called");

    let mut state = PERMISSION_AUDIT
        .lock()
        .map_err(|e| format!("Failed to lock PERMISSION_AUDIT: {}", e))?;

    let count = state.len();
    state.clear();

    log::info!("[GOVERNANCE] ✅ Cleared {} audit entries", count);
    Ok(())
}

// ═══════════════════════════════════════════════════════════════════
// COMMANDS - SECURITY LOG
// ═══════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn get_security_log(
    filters: Option<HashMap<String, String>>,
) -> Result<Vec<SecurityLogEntry>, String> {
    log::debug!("[GOVERNANCE] get_security_log called");

    let log_entries = SECURITY_LOG
        .lock()
        .map_err(|e| format!("Failed to lock SECURITY_LOG: {}", e))?
        .clone();

    let _ = filters;

    log::info!(
        "[GOVERNANCE] Returned {} security log entries",
        log_entries.len()
    );
    Ok(log_entries)
}

#[tauri::command]
pub async fn append_security_log(entry: SecurityLogEntry) -> Result<(), String> {
    log::debug!(
        "[GOVERNANCE] append_security_log: {} - {}",
        entry.level,
        entry.message
    );

    let mut state = SECURITY_LOG
        .lock()
        .map_err(|e| format!("Failed to lock SECURITY_LOG: {}", e))?;

    state.push(entry);

    if state.len() > 10000 {
        state.drain(0..1000);
    }

    log::debug!("[GOVERNANCE] ✅ Appended security log entry");
    Ok(())
}

#[tauri::command]
pub async fn export_security_log(format: String) -> Result<String, String> {
    log::debug!("[GOVERNANCE] export_security_log: format={}", format);

    let log_entries = SECURITY_LOG
        .lock()
        .map_err(|e| format!("Failed to lock SECURITY_LOG: {}", e))?
        .clone();

    match format.as_str() {
        "json" => {
            let json = serde_json::to_string_pretty(&log_entries)
                .map_err(|e| format!("JSON serialization failed: {}", e))?;
            Ok(json)
        }
        "csv" => {
            let mut csv = "timestamp,level,category,message\n".to_string();
            for entry in log_entries {
                csv.push_str(&format!(
                    "{},{},{},{}\n",
                    entry.timestamp,
                    entry.level,
                    entry.category,
                    entry.message.replace(",", ";")
                ));
            }
            Ok(csv)
        }
        _ => Err(format!("Unsupported format: {}", format)),
    }
}

#[tauri::command]
pub async fn clear_security_log() -> Result<(), String> {
    log::debug!("[GOVERNANCE] clear_security_log called");

    let mut state = SECURITY_LOG
        .lock()
        .map_err(|e| format!("Failed to lock SECURITY_LOG: {}", e))?;

    let count = state.len();
    state.clear();

    log::info!("[GOVERNANCE] ✅ Cleared {} security log entries", count);
    Ok(())
}
