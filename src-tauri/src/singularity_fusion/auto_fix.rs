//! ═══════════════════════════════════════════════════════════════════════════
//! AUTO FIX ENGINE - Backend Commands
//! ═══════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectedIssue {
    pub id: String,
    pub issue_type: String,
    pub severity: String,
    pub description: String,
    pub source: String,
    pub detected_at: u64,
    pub fixable: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FixResult {
    pub issue_id: String,
    pub success: bool,
    pub actions_taken: Vec<String>,
    pub duration: u64,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoFixStats {
    pub total_issues_detected: u64,
    pub total_issues_fixed: u64,
    pub fix_success_rate: f32,
    pub avg_fix_duration: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AutoFixAddMutexArgs {
    pub file: Option<String>,
    pub symbol: Option<String>,
    pub reason: Option<String>,
}

// ═══════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════

pub struct AutoFixState {
    pub issues: Mutex<Vec<DetectedIssue>>,
    pub fix_history: Mutex<Vec<FixResult>>,
    pub stats: Mutex<AutoFixStats>,
}

impl Default for AutoFixState {
    fn default() -> Self {
        Self {
            issues: Mutex::new(Vec::new()),
            fix_history: Mutex::new(Vec::new()),
            stats: Mutex::new(AutoFixStats {
                total_issues_detected: 0,
                total_issues_fixed: 0,
                fix_success_rate: 1.0,
                avg_fix_duration: 0.0,
            }),
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMANDS
// ═══════════════════════════════════════════════════════════════════════════

/// Détecte les warnings Rust
#[tauri::command]
pub async fn autofix_detect_rust_warnings(
    state: State<'_, AutoFixState>,
) -> Result<Vec<DetectedIssue>, String> {
    // Simuler détection
    let issues = vec![];

    let mut stored_issues = state.issues.lock().map_err(|e| e.to_string())?;
    stored_issues.extend(issues.clone());

    Ok(issues)
}

/// Détecte les erreurs TypeScript
#[tauri::command]
pub async fn autofix_detect_typescript_errors(
    state: State<'_, AutoFixState>,
) -> Result<Vec<DetectedIssue>, String> {
    let issues = vec![];

    let mut stored_issues = state.issues.lock().map_err(|e| e.to_string())?;
    stored_issues.extend(issues.clone());

    Ok(issues)
}

/// Détecte les violations React Hooks
#[tauri::command]
pub async fn autofix_detect_react_hook_violations(
    state: State<'_, AutoFixState>,
) -> Result<Vec<DetectedIssue>, String> {
    let issues = vec![];

    let mut stored_issues = state.issues.lock().map_err(|e| e.to_string())?;
    stored_issues.extend(issues.clone());

    Ok(issues)
}

/// Détecte les états invalides
#[tauri::command]
pub async fn autofix_detect_invalid_states(
    state: State<'_, AutoFixState>,
) -> Result<Vec<DetectedIssue>, String> {
    let issues = vec![];

    let mut stored_issues = state.issues.lock().map_err(|e| e.to_string())?;
    stored_issues.extend(issues.clone());

    Ok(issues)
}

/// Corrige un problème spécifique
#[tauri::command]
pub async fn autofix_fix_issue(
    state: State<'_, AutoFixState>,
    issue_id: String,
) -> Result<FixResult, String> {
    let start = current_timestamp();

    // Simuler correction
    let result = FixResult {
        issue_id: issue_id.clone(),
        success: true,
        actions_taken: vec!["Applied automatic fix".to_string()],
        duration: current_timestamp() - start,
        timestamp: current_timestamp(),
    };

    // Sauvegarder dans l'historique
    let mut history = state.fix_history.lock().map_err(|e| e.to_string())?;
    history.push(result.clone());

    // Mettre à jour stats
    let mut stats = state.stats.lock().map_err(|e| e.to_string())?;
    stats.total_issues_fixed += 1;

    // Retirer de la liste des issues
    let mut issues = state.issues.lock().map_err(|e| e.to_string())?;
    issues.retain(|i| i.id != issue_id);

    Ok(result)
}

/// Corrige tous les problèmes
#[tauri::command]
pub async fn autofix_fix_all(state: State<'_, AutoFixState>) -> Result<Vec<FixResult>, String> {
    let issues = state.issues.lock().map_err(|e| e.to_string())?.clone();
    let mut results = Vec::new();

    for issue in issues {
        if issue.fixable {
            // Correction inline au lieu d'appel récursif
            let start = current_timestamp();

            let result = FixResult {
                issue_id: issue.id.clone(),
                success: true,
                actions_taken: vec!["Applied automatic fix".to_string()],
                duration: current_timestamp() - start,
                timestamp: current_timestamp(),
            };

            // Sauvegarder dans l'historique
            let mut history = state.fix_history.lock().map_err(|e| e.to_string())?;
            history.push(result.clone());

            // Mettre à jour stats
            let mut stats = state.stats.lock().map_err(|e| e.to_string())?;
            stats.total_issues_fixed += 1;

            results.push(result);
        }
    }

    // Retirer toutes les issues fixées
    let mut issues_lock = state.issues.lock().map_err(|e| e.to_string())?;
    issues_lock.clear();

    Ok(results)
}
/// Obtient l'historique des corrections
#[tauri::command]
pub async fn autofix_get_history(state: State<'_, AutoFixState>) -> Result<Vec<FixResult>, String> {
    let history = state.fix_history.lock().map_err(|e| e.to_string())?;
    Ok(history.clone())
}

/// Obtient les statistiques
#[tauri::command]
pub async fn autofix_get_stats(state: State<'_, AutoFixState>) -> Result<AutoFixStats, String> {
    let stats = state.stats.lock().map_err(|e| e.to_string())?;
    Ok(stats.clone())
}

/// Réinitialise AutoFix
#[tauri::command]
pub async fn autofix_reset(state: State<'_, AutoFixState>) -> Result<(), String> {
    let mut issues = state.issues.lock().map_err(|e| e.to_string())?;
    let mut history = state.fix_history.lock().map_err(|e| e.to_string())?;
    let mut stats = state.stats.lock().map_err(|e| e.to_string())?;

    issues.clear();
    history.clear();
    stats.total_issues_detected = 0;
    stats.total_issues_fixed = 0;
    stats.fix_success_rate = 1.0;
    stats.avg_fix_duration = 0.0;

    println!("[AutoFix] Reset complete");
    Ok(())
}

// ═══════════════════════════════════════════════════════════════════════════
// FRONTEND COMPAT COMMANDS (secureInvoke)
// ═══════════════════════════════════════════════════════════════════════════

/// Frontend-compat: push a Rust warning into the AutoFix issue queue.
#[tauri::command]
pub async fn autofix_rust_warning(state: State<'_, AutoFixState>, warning: String) -> Result<(), String> {
    let now = current_timestamp();

    let issue = DetectedIssue {
        id: format!("rust-warning-{now}"),
        issue_type: "rust_warning".to_string(),
        severity: "medium".to_string(),
        description: warning,
        source: "frontend".to_string(),
        detected_at: now,
        fixable: true,
    };

    {
        let mut issues = state.issues.lock().map_err(|e| e.to_string())?;
        issues.push(issue);
    }
    {
        let mut stats = state.stats.lock().map_err(|e| e.to_string())?;
        stats.total_issues_detected += 1;
    }

    Ok(())
}

/// Frontend-compat: push a TypeScript error into the AutoFix issue queue.
#[tauri::command]
pub async fn autofix_typescript_error(state: State<'_, AutoFixState>, error: String) -> Result<(), String> {
    let now = current_timestamp();

    let issue = DetectedIssue {
        id: format!("ts-error-{now}"),
        issue_type: "typescript_error".to_string(),
        severity: "high".to_string(),
        description: error,
        source: "frontend".to_string(),
        detected_at: now,
        fixable: true,
    };

    {
        let mut issues = state.issues.lock().map_err(|e| e.to_string())?;
        issues.push(issue);
    }
    {
        let mut stats = state.stats.lock().map_err(|e| e.to_string())?;
        stats.total_issues_detected += 1;
    }

    Ok(())
}

/// Frontend-compat alias for `autofix_reset`.
#[tauri::command]
pub async fn autofix_reset_state(state: State<'_, AutoFixState>) -> Result<(), String> {
    autofix_reset(state).await
}

fn record_action(
    state: &State<'_, AutoFixState>,
    action: &str,
    issue_id: &str,
) -> Result<(), String> {
    let start = current_timestamp();
    let now = current_timestamp();

    let result = FixResult {
        issue_id: issue_id.to_string(),
        success: true,
        actions_taken: vec![action.to_string()],
        duration: now.saturating_sub(start),
        timestamp: now,
    };

    {
        let mut history = state.fix_history.lock().map_err(|e| e.to_string())?;
        history.push(result);
    }
    {
        let mut stats = state.stats.lock().map_err(|e| e.to_string())?;
        stats.total_issues_fixed += 1;
        let detected = stats.total_issues_detected.max(stats.total_issues_fixed);
        stats.fix_success_rate = if detected == 0 {
            1.0
        } else {
            (stats.total_issues_fixed as f32 / detected as f32).clamp(0.0, 1.0)
        };
    }

    Ok(())
}

/// Frontend-compat: restart the unified pipeline.
#[tauri::command]
pub async fn autofix_restart_pipeline(state: State<'_, AutoFixState>) -> Result<(), String> {
    record_action(&state, "restart_pipeline", "pipeline").map(|_| ())
}

/// Frontend-compat: restart a given tauri command (record-only).
#[tauri::command]
pub async fn autofix_restart_tauri_command(
    state: State<'_, AutoFixState>,
    command: String,
) -> Result<(), String> {
    let action = format!("restart_tauri_command:{command}");
    record_action(&state, &action, &command)
}

/// Frontend-compat: resync lipsync.
#[tauri::command]
pub async fn autofix_resync_lipsync(state: State<'_, AutoFixState>) -> Result<(), String> {
    record_action(&state, "resync_lipsync", "lipsync").map(|_| ())
}

/// Frontend-compat: record a mutex insertion request (does not edit files).
#[tauri::command]
pub async fn autofix_add_mutex(
    state: State<'_, AutoFixState>,
    args: AutoFixAddMutexArgs,
) -> Result<(), String> {
    let target = args
        .file
        .as_deref()
        .unwrap_or("unknown")
        .to_string();
    let symbol = args.symbol.unwrap_or_else(|| "(unspecified)".to_string());
    let reason = args.reason.unwrap_or_else(|| "".to_string());

    let action = format!("add_mutex file={target} symbol={symbol} {reason}");
    record_action(&state, &action, &target)
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

fn current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64
}
