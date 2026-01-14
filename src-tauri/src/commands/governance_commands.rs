// ═══════════════════════════════════════════════════════════════════
// GOVERNANCE COMMANDS - TITANE∞ v21.5.3
// ═══════════════════════════════════════════════════════════════════
//
// Commandes pour la gestion des politiques IA, permissions et audit.

use crate::secure_commands::SecureResponse;
use crate::security::permissions::{Role as PermissionRole, PERMISSIONS};
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use uuid::Uuid;

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PolicyType {
    Limit,
    Guardrail,
    Restriction,
    Audit,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PolicySeverity {
    Info,
    Warning,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IAPolicy {
    pub id: String,
    pub name: String,
    pub description: String,
    pub r#type: PolicyType,
    pub severity: PolicySeverity,
    pub enabled: bool,
    #[serde(default)]
    pub config: serde_json::Value,
    pub created_at: u64,
    pub updated_at: u64,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateIAPolicyRequest {
    pub name: String,
    pub description: String,
    pub r#type: PolicyType,
    pub severity: PolicySeverity,
    pub enabled: bool,
    #[serde(default)]
    pub config: serde_json::Value,
}

pub type PermissionMatrix = HashMap<String, Vec<PermissionRole>>;

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
    pub id: String,
    pub timestamp: u64,
    pub level: String, // "debug" | "info" | "warn" | "error" | "critical"
    pub category: String,
    pub event: String,
    pub details: String,
    pub source: String,
    #[serde(default)]
    pub user_id: Option<String>,
    #[serde(default)]
    pub metadata: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SecurityLogFilters {
    #[serde(default)]
    pub level: Option<String>,
    #[serde(default)]
    pub category: Option<String>,
    #[serde(default)]
    pub start_date: Option<u64>,
    #[serde(default)]
    pub end_date: Option<u64>,
    #[serde(default)]
    pub search: Option<String>,
    #[serde(default)]
    pub limit: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SecurityLogAppendRequest {
    pub level: String,
    pub category: String,
    pub event: String,
    pub details: String,
    pub source: String,
    #[serde(default)]
    pub user_id: Option<String>,
    #[serde(default)]
    pub metadata: HashMap<String, serde_json::Value>,
}

// ═══════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════

lazy_static! {
    static ref IA_POLICIES: Mutex<Vec<IAPolicy>> = Mutex::new(Vec::new());
    static ref PERMISSION_AUDIT: Mutex<Vec<PermissionAuditEntry>> = Mutex::new(Vec::new());
    static ref SECURITY_LOG: Mutex<Vec<SecurityLogEntry>> = Mutex::new(Vec::new());
}

fn now_ms() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

// ═══════════════════════════════════════════════════════════════════
// COMMANDS - IA POLICIES
// ═══════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn get_ia_policies() -> Result<SecureResponse<Vec<IAPolicy>>, String> {
    log::debug!("[GOVERNANCE] get_ia_policies called");

    let policies = IA_POLICIES
        .lock()
        .map_err(|e| format!("Failed to lock IA_POLICIES: {}", e))?
        .clone();

    if policies.len() > 0 {
        log::debug!("[GOVERNANCE] Returned {} IA policies", policies.len());
    }
    Ok(SecureResponse::success(policies))
}

#[tauri::command]
pub async fn save_ia_policies(policies: Vec<IAPolicy>) -> Result<SecureResponse<()>, String> {
    log::debug!(
        "[GOVERNANCE] save_ia_policies called with {} policies",
        policies.len()
    );

    let mut state = IA_POLICIES
        .lock()
        .map_err(|e| format!("Failed to lock IA_POLICIES: {}", e))?;

    *state = policies;

    log::info!("[GOVERNANCE] ✅ Saved {} IA policies", state.len());
    Ok(SecureResponse::success(()))
}

#[tauri::command]
#[allow(non_snake_case)]
pub async fn toggle_ia_policy(
    policyId: String,
    enabled: bool,
) -> Result<SecureResponse<IAPolicy>, String> {
    log::debug!("[GOVERNANCE] toggle_ia_policy: {} → {}", policyId, enabled);

    let mut state = IA_POLICIES
        .lock()
        .map_err(|e| format!("Failed to lock IA_POLICIES: {}", e))?;

    if let Some(policy) = state.iter_mut().find(|p| p.id == policyId) {
        policy.enabled = enabled;
        policy.updated_at = now_ms();

        let updated = policy.clone();

        log::info!(
            "[GOVERNANCE] ✅ Toggled policy '{}' to {}",
            policyId,
            enabled
        );
        Ok(SecureResponse::success(updated))
    } else {
        Err(format!("Policy not found: {}", policyId))
    }
}

#[tauri::command]
pub async fn create_ia_policy(
    policy: CreateIAPolicyRequest,
) -> Result<SecureResponse<IAPolicy>, String> {
    log::debug!("[GOVERNANCE] create_ia_policy: {}", policy.name);

    let mut state = IA_POLICIES
        .lock()
        .map_err(|e| format!("Failed to lock IA_POLICIES: {}", e))?;

    let now = now_ms();
    let created = IAPolicy {
        id: Uuid::new_v4().to_string(),
        name: policy.name,
        description: policy.description,
        r#type: policy.r#type,
        severity: policy.severity,
        enabled: policy.enabled,
        config: policy.config,
        created_at: now,
        updated_at: now,
    };

    let id = created.id.clone();
    state.push(created.clone());

    log::info!("[GOVERNANCE] ✅ Created policy '{}'", id);
    Ok(SecureResponse::success(created))
}

#[tauri::command]
#[allow(non_snake_case)]
pub async fn delete_ia_policy(policyId: String) -> Result<SecureResponse<()>, String> {
    log::debug!("[GOVERNANCE] delete_ia_policy: {}", policyId);

    let mut state = IA_POLICIES
        .lock()
        .map_err(|e| format!("Failed to lock IA_POLICIES: {}", e))?;

    state.retain(|p| p.id != policyId);

    log::info!("[GOVERNANCE] ✅ Deleted policy '{}'", policyId);
    Ok(SecureResponse::success(()))
}

// ═══════════════════════════════════════════════════════════════════
// COMMANDS - PERMISSION MATRIX
// ═══════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn get_permission_matrix() -> Result<SecureResponse<PermissionMatrix>, String> {
    log::debug!("[GOVERNANCE] get_permission_matrix called");

    let matrix = PERMISSIONS.clone();

    log::debug!(
        "[GOVERNANCE] Returned permission matrix with {} actions",
        matrix.len()
    );
    Ok(SecureResponse::success(matrix))
}

// ═══════════════════════════════════════════════════════════════════
// COMMANDS - PERMISSION AUDIT
// ═══════════════════════════════════════════════════════════════════

// NOTE: get_permission_audit already exists in src-tauri/src/secure_commands.rs
// Removed duplicate to avoid E0428 compilation error

#[tauri::command]
pub async fn clear_permission_audit() -> Result<SecureResponse<()>, String> {
    log::debug!("[GOVERNANCE] clear_permission_audit called");

    let mut state = PERMISSION_AUDIT
        .lock()
        .map_err(|e| format!("Failed to lock PERMISSION_AUDIT: {}", e))?;

    let count = state.len();
    state.clear();

    log::info!("[GOVERNANCE] ✅ Cleared {} audit entries", count);
    Ok(SecureResponse::success(()))
}

// ═══════════════════════════════════════════════════════════════════
// COMMANDS - SECURITY LOG
// ═══════════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn get_security_log(
    filters: Option<SecurityLogFilters>,
) -> Result<SecureResponse<Vec<SecurityLogEntry>>, String> {
    log::debug!("[GOVERNANCE] get_security_log called");

    let mut log_entries = SECURITY_LOG
        .lock()
        .map_err(|e| format!("Failed to lock SECURITY_LOG: {}", e))?
        .clone();

    if let Some(filters) = filters {
        if let Some(level) = filters.level {
            log_entries.retain(|e| e.level == level);
        }
        if let Some(category) = filters.category {
            log_entries.retain(|e| e.category == category);
        }
        if let Some(start) = filters.start_date {
            log_entries.retain(|e| e.timestamp >= start);
        }
        if let Some(end) = filters.end_date {
            log_entries.retain(|e| e.timestamp <= end);
        }
        if let Some(search) = filters.search {
            let q = search.to_lowercase();
            log_entries.retain(|e| {
                e.event.to_lowercase().contains(&q)
                    || e.details.to_lowercase().contains(&q)
                    || e.source.to_lowercase().contains(&q)
            });
        }
        if let Some(limit) = filters.limit {
            if log_entries.len() > limit {
                let start = log_entries.len().saturating_sub(limit);
                log_entries = log_entries[start..].to_vec();
            }
        }
    }

    if log_entries.len() > 0 {
        log::debug!(
            "[GOVERNANCE] Returned {} security log entries",
            log_entries.len()
        );
    }
    Ok(SecureResponse::success(log_entries))
}

#[tauri::command]
pub async fn append_security_log(
    entry: SecurityLogAppendRequest,
) -> Result<SecureResponse<SecurityLogEntry>, String> {
    log::debug!(
        "[GOVERNANCE] append_security_log: {} - {}",
        entry.level,
        entry.event
    );

    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| format!("Failed to compute UNIX timestamp: {}", e))?
        .as_secs();

    let created = SecurityLogEntry {
        id: format!("sec_{}", now),
        timestamp: now,
        level: entry.level,
        category: entry.category,
        event: entry.event,
        details: entry.details,
        source: entry.source,
        user_id: entry.user_id,
        metadata: entry.metadata,
    };

    let mut state = SECURITY_LOG
        .lock()
        .map_err(|e| format!("Failed to lock SECURITY_LOG: {}", e))?;

    state.push(created.clone());

    if state.len() > 10000 {
        state.drain(0..1000);
    }

    log::debug!("[GOVERNANCE] Appended security log entry");
    Ok(SecureResponse::success(created))
}

#[tauri::command]
pub async fn export_security_log(format: String) -> Result<SecureResponse<String>, String> {
    log::debug!("[GOVERNANCE] export_security_log: format={}", format);

    let log_entries = SECURITY_LOG
        .lock()
        .map_err(|e| format!("Failed to lock SECURITY_LOG: {}", e))?
        .clone();

    match format.as_str() {
        "json" => {
            let json = serde_json::to_string_pretty(&log_entries)
                .map_err(|e| format!("JSON serialization failed: {}", e))?;
            Ok(SecureResponse::success(json))
        }
        "csv" => {
            let mut csv = "id,timestamp,level,category,event,details,source\n".to_string();
            for entry in log_entries {
                csv.push_str(&format!(
                    "{},{},{},{},{},{},{}\n",
                    entry.id,
                    entry.timestamp,
                    entry.level,
                    entry.category,
                    entry.event.replace(",", ";"),
                    entry.details.replace(",", ";"),
                    entry.source.replace(",", ";")
                ));
            }
            Ok(SecureResponse::success(csv))
        }
        _ => Err(format!("Unsupported format: {}", format)),
    }
}

#[tauri::command]
pub async fn clear_security_log() -> Result<SecureResponse<()>, String> {
    log::debug!("[GOVERNANCE] clear_security_log called");

    let mut state = SECURITY_LOG
        .lock()
        .map_err(|e| format!("Failed to lock SECURITY_LOG: {}", e))?;

    let count = state.len();
    state.clear();

    if count > 0 {
        log::debug!("[GOVERNANCE] Cleared {} security log entries", count);
    }
    Ok(SecureResponse::success(()))
}
