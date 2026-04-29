// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ — IDE OPERATOR COMMANDS
//   LOCK 3: Governed IDE/dev relay for repo inspection & bounded execution
//
//   HONESTY CONTRACT:
//   - IDE operator is a governed relay, not a free coding agent
//   - Scope truth is mandatory (repo_read, file_read, git_read, safe_command)
//   - Session binding to session_authority via total_dev commands
//   - Forbidden actions remain forbidden (no auto-commit, no prod build)
//   - Classification reflects real capability, not aspiration
// ═══════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum IDESessionStatus {
    Idle,
    Inspecting,
    Executing,
    Blocked,
    Stopped,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum IDERelayCategory {
    RepoInventory,
    FileRead,
    GrepSearch,
    GitStatus,
    GitDiff,
    SafeCommand,
    PatchPrepare,
    HandoffRequired,
    ForbiddenSensitive,
    ToolingMissing,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum IDEScopeCategory {
    RepoRead,
    FileRead,
    GrepSearch,
    GitRead,
    SafeCommand,
    PatchPrepare,
    HandoffRequired,
    Forbidden,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IDESession {
    pub session_id: String,
    pub authority_level: String,
    pub workspace_dir: String,
    pub allowed_scopes: Vec<String>,
    pub current_action: Option<String>,
    pub status: IDESessionStatus,
    pub started_at: String,
    pub expires_at: String,
    pub actions_count: u32,
    pub max_actions: u32,
    pub handoff_pending: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IDERelayResult {
    pub ok: bool,
    pub category: IDERelayCategory,
    pub scope_used: String,
    pub action: String,
    pub content: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub structured_data: Option<serde_json::Value>,
    pub block_reason: Option<String>,
    pub handoff_required: bool,
    pub actions_remaining: u32,
    pub session_id: String,
    pub executed_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IDEOperatorConfig {
    pub tooling_available: bool,
    pub git_available: bool,
    pub grep_available: bool,
    pub default_workspace: String,
    pub default_allowed_scopes: Vec<String>,
    pub forbidden_commands: Vec<String>,
    pub sensitive_extensions: Vec<String>,
}

// ─────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────

const DEFAULT_FORBIDDEN_COMMANDS: &[&str] = &[
    "rm -rf /",
    "rm -rf /*",
    "sudo rm",
    "mkfs",
    "dd if=",
    ":(){:|:&};:",
    "chmod 777",
    "> /dev/sda",
    "mv /* /dev/null",
    "curl | bash",
    "wget | sh",
];

const DEFAULT_SENSITIVE_EXTENSIONS: &[&str] = &[
    ".key",
    ".pem",
    ".env",
    ".secret",
    ".p12",
    ".pfx",
    ".jks",
    ".keystore",
];

const SESSION_TTL_SECS: u64 = 1800; // 30 minutes
const DEFAULT_MAX_ACTIONS: u32 = 100;

// ─────────────────────────────────────────────────────────────────
// SESSION STATE
// ─────────────────────────────────────────────────────────────────

pub struct IDEOperatorState {
    pub sessions: Mutex<HashMap<String, IDESession>>,
}

impl Default for IDEOperatorState {
    fn default() -> Self {
        Self {
            sessions: Mutex::new(HashMap::new()),
        }
    }
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

fn now_iso() -> String {
    let now = SystemTime::now();
    let duration = now.duration_since(UNIX_EPOCH).unwrap_or_default();
    let secs = duration.as_secs();
    let millis = duration.subsec_millis();

    let naive = chrono::NaiveDateTime::from_timestamp_opt(secs as i64, 0);
    match naive {
        Some(dt) => {
            let utc = chrono::DateTime::<chrono::Utc>::from_naive_utc_and_offset(dt, chrono::Utc);
            format!("{}.{:03}Z", utc.format("%Y-%m-%dT%H:%M:%S"), millis)
        }
        None => format!("{}.{}Z", secs, millis),
    }
}

fn generate_session_id() -> String {
    let now = SystemTime::now();
    let duration = now.duration_since(UNIX_EPOCH).unwrap_or_default();
    let secs = duration.as_secs();
    let nanos = duration.subsec_nanos();
    format!("ide_{}_{:08x}", secs, nanos)
}

fn workspace_dir() -> String {
    std::env::var("TITANE_WORKSPACE_DIR").unwrap_or_else(|_| {
        dirs::document_dir()
            .map(|d| d.join("TITANE_INFINITY").to_string_lossy().into_owned())
            .unwrap_or_else(|| ".".to_string())
    })
}

fn check_git_available() -> bool {
    std::process::Command::new("git")
        .arg("--version")
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

fn check_grep_available() -> bool {
    std::process::Command::new("grep")
        .arg("--version")
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

fn is_forbidden_command(command: &str) -> bool {
    let cmd_lower = command.to_lowercase();
    DEFAULT_FORBIDDEN_COMMANDS
        .iter()
        .any(|f| cmd_lower.contains(&f.to_lowercase()))
}

fn is_sensitive_extension(path: &str) -> bool {
    DEFAULT_SENSITIVE_EXTENSIONS
        .iter()
        .any(|ext| path.ends_with(ext))
}

fn is_scope_allowed(scope: &str, allowed_scopes: &[String]) -> bool {
    allowed_scopes.iter().any(|s| s == scope)
}

// ─────────────────────────────────────────────────────────────────
// COMMANDS
// ─────────────────────────────────────────────────────────────────

/// Opens a governed IDE session with scope allowlist.
#[tauri::command]
pub async fn ide_open_session(
    state: tauri::State<'_, IDEOperatorState>,
    workspace_dir: Option<String>,
    allowed_scopes: Option<Vec<String>>,
) -> Result<IDESession, String> {
    let session_id = generate_session_id();
    let now = now_iso();
    let workspace = workspace_dir.unwrap_or_else(|| ".".to_string());
    let scopes = allowed_scopes.unwrap_or_else(|| {
        vec![
            "repo_read".to_string(),
            "file_read".to_string(),
            "grep_search".to_string(),
            "git_read".to_string(),
            "safe_command".to_string(),
            "patch_prepare".to_string(),
        ]
    });

    // Calculate expiry
    let expiry_secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
        + SESSION_TTL_SECS;
    let expiry_naive = chrono::NaiveDateTime::from_timestamp_opt(expiry_secs as i64, 0);
    let expires_at = match expiry_naive {
        Some(dt) => {
            let utc = chrono::DateTime::<chrono::Utc>::from_naive_utc_and_offset(dt, chrono::Utc);
            format!("{}.{:03}Z", utc.format("%Y-%m-%dT%H:%M:%S"), 0)
        }
        None => format!("{}.0Z", expiry_secs),
    };

    let session = IDESession {
        session_id: session_id.clone(),
        authority_level: "OBSERVE".to_string(),
        workspace_dir: workspace.clone(),
        allowed_scopes: scopes.clone(),
        current_action: None,
        status: IDESessionStatus::Idle,
        started_at: now,
        expires_at,
        actions_count: 0,
        max_actions: DEFAULT_MAX_ACTIONS,
        handoff_pending: false,
    };

    {
        let mut sessions = state
            .sessions
            .lock()
            .map_err(|e| format!("Lock error: {}", e))?;
        sessions.insert(session_id.clone(), session.clone());
    }

    log::info!(
        "[IDEOperator] Session opened: {} (workspace: {}, scopes: {:?})",
        session_id,
        workspace,
        scopes
    );

    Ok(session)
}

/// Closes an IDE session.
#[tauri::command]
pub async fn ide_close_session(
    state: tauri::State<'_, IDEOperatorState>,
    session_id: String,
) -> Result<bool, String> {
    let mut sessions = state
        .sessions
        .lock()
        .map_err(|e| format!("Lock error: {}", e))?;

    if let Some(mut session) = sessions.remove(&session_id) {
        session.status = IDESessionStatus::Stopped;
        log::info!("[IDEOperator] Session closed: {}", session_id);
        Ok(true)
    } else {
        Err(format!("Session not found: {}", session_id))
    }
}

/// Returns current session state.
#[tauri::command]
pub async fn ide_get_session_status(
    state: tauri::State<'_, IDEOperatorState>,
    session_id: String,
) -> Result<IDESession, String> {
    let sessions = state
        .sessions
        .lock()
        .map_err(|e| format!("Lock error: {}", e))?;

    sessions
        .get(&session_id)
        .cloned()
        .ok_or_else(|| format!("Session not found: {}", session_id))
}

/// Lists repo structure (ls -la in workspace).
#[tauri::command]
pub async fn ide_repo_inventory(
    state: tauri::State<'_, IDEOperatorState>,
    session_id: String,
) -> Result<IDERelayResult, String> {
    let now = now_iso();

    let mut sessions = state
        .sessions
        .lock()
        .map_err(|e| format!("Lock error: {}", e))?;
    let session = sessions
        .get_mut(&session_id)
        .ok_or_else(|| format!("Session not found: {}", session_id))?;

    // Check scope
    if !is_scope_allowed("repo_read", &session.allowed_scopes) {
        return Ok(IDERelayResult {
            ok: false,
            category: IDERelayCategory::ForbiddenSensitive,
            scope_used: "repo_read".to_string(),
            action: "repo_inventory".to_string(),
            content: None,
            structured_data: None,
            block_reason: Some("Scope 'repo_read' not allowed for this session".to_string()),
            handoff_required: false,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    // Check actions limit
    if session.actions_count >= session.max_actions {
        return Ok(IDERelayResult {
            ok: false,
            category: IDERelayCategory::ForbiddenSensitive,
            scope_used: "repo_read".to_string(),
            action: "repo_inventory".to_string(),
            content: None,
            structured_data: None,
            block_reason: Some("Max actions reached for this session".to_string()),
            handoff_required: false,
            actions_remaining: 0,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    session.status = IDESessionStatus::Inspecting;
    session.actions_count += 1;
    session.current_action = Some("repo_inventory".to_string());

    // Execute ls -la
    let workspace = session.workspace_dir.clone();
    let output = std::process::Command::new("ls")
        .args(["-la", &workspace])
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .output();

    session.status = IDESessionStatus::Idle;
    session.current_action = None;

    match output {
        Ok(result) => {
            let stdout = String::from_utf8_lossy(&result.stdout).to_string();
            let stderr = String::from_utf8_lossy(&result.stderr).to_string();

            if result.status.success() {
                Ok(IDERelayResult {
                    ok: true,
                    category: IDERelayCategory::RepoInventory,
                    scope_used: "repo_read".to_string(),
                    action: "repo_inventory".to_string(),
                    content: Some(stdout),
                    structured_data: Some(serde_json::json!({
                        "workspace": workspace,
                        "command": "ls -la",
                    })),
                    block_reason: None,
                    handoff_required: false,
                    actions_remaining: session.max_actions - session.actions_count,
                    session_id: session_id.clone(),
                    executed_at: now,
                })
            } else {
                Ok(IDERelayResult {
                    ok: false,
                    category: IDERelayCategory::ForbiddenSensitive,
                    scope_used: "repo_read".to_string(),
                    action: "repo_inventory".to_string(),
                    content: None,
                    structured_data: None,
                    block_reason: Some(format!("ls failed: {}", stderr)),
                    handoff_required: false,
                    actions_remaining: session.max_actions - session.actions_count,
                    session_id: session_id.clone(),
                    executed_at: now,
                })
            }
        }
        Err(e) => Ok(IDERelayResult {
            ok: false,
            category: IDERelayCategory::ToolingMissing,
            scope_used: "repo_read".to_string(),
            action: "repo_inventory".to_string(),
            content: None,
            structured_data: None,
            block_reason: Some(format!("Failed to execute ls: {}", e)),
            handoff_required: false,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        }),
    }
}

/// Reads file content with scope and path traversal protection.
#[tauri::command]
pub async fn ide_file_read(
    state: tauri::State<'_, IDEOperatorState>,
    session_id: String,
    path: String,
) -> Result<IDERelayResult, String> {
    let now = now_iso();

    let mut sessions = state
        .sessions
        .lock()
        .map_err(|e| format!("Lock error: {}", e))?;
    let session = sessions
        .get_mut(&session_id)
        .ok_or_else(|| format!("Session not found: {}", session_id))?;

    // Check scope
    if !is_scope_allowed("file_read", &session.allowed_scopes) {
        return Ok(IDERelayResult {
            ok: false,
            category: IDERelayCategory::ForbiddenSensitive,
            scope_used: "file_read".to_string(),
            action: "file_read".to_string(),
            content: None,
            structured_data: None,
            block_reason: Some("Scope 'file_read' not allowed".to_string()),
            handoff_required: false,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    // Check sensitive extension
    if is_sensitive_extension(&path) {
        return Ok(IDERelayResult {
            ok: false,
            category: IDERelayCategory::HandoffRequired,
            scope_used: "file_read".to_string(),
            action: "file_read".to_string(),
            content: None,
            structured_data: None,
            block_reason: Some(format!("Sensitive extension detected: {}", path)),
            handoff_required: true,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    // Check actions limit
    if session.actions_count >= session.max_actions {
        return Ok(IDERelayResult {
            ok: false,
            category: IDERelayCategory::ForbiddenSensitive,
            scope_used: "file_read".to_string(),
            action: "file_read".to_string(),
            content: None,
            structured_data: None,
            block_reason: Some("Max actions reached".to_string()),
            handoff_required: false,
            actions_remaining: 0,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    session.status = IDESessionStatus::Inspecting;
    session.actions_count += 1;
    session.current_action = Some(format!("file_read:{}", path));

    // Resolve path
    let workspace = session.workspace_dir.clone();
    let resolved = if path.starts_with('/') {
        path.clone()
    } else {
        format!("{}/{}", workspace, path)
    };

    // Path traversal protection
    let canonical_path = std::path::Path::new(&resolved).canonicalize();
    let canonical_workspace = std::path::Path::new(&workspace)
        .canonicalize()
        .unwrap_or_else(|_| std::path::Path::new(&workspace).to_path_buf());

    session.status = IDESessionStatus::Idle;
    session.current_action = None;

    match canonical_path {
        Ok(cp) => {
            if !cp.starts_with(&canonical_workspace) {
                return Ok(IDERelayResult {
                    ok: false,
                    category: IDERelayCategory::ForbiddenSensitive,
                    scope_used: "file_read".to_string(),
                    action: "file_read".to_string(),
                    content: None,
                    structured_data: None,
                    block_reason: Some("Path outside workspace".to_string()),
                    handoff_required: false,
                    actions_remaining: session.max_actions - session.actions_count,
                    session_id: session_id.clone(),
                    executed_at: now,
                });
            }

            if !cp.exists() {
                return Ok(IDERelayResult {
                    ok: false,
                    category: IDERelayCategory::ForbiddenSensitive,
                    scope_used: "file_read".to_string(),
                    action: "file_read".to_string(),
                    content: None,
                    structured_data: None,
                    block_reason: Some(format!("File not found: {}", path)),
                    handoff_required: false,
                    actions_remaining: session.max_actions - session.actions_count,
                    session_id: session_id.clone(),
                    executed_at: now,
                });
            }

            // Read file (max 200KB)
            let metadata = std::fs::metadata(&cp).map_err(|e| e.to_string())?;
            let size = metadata.len();

            let content = if size < 200_000 {
                std::fs::read_to_string(&cp).ok()
            } else {
                Some(format!("[File too large for direct read: {} bytes]", size))
            };

            let lines = content.as_ref().map(|c| c.lines().count());

            Ok(IDERelayResult {
                ok: true,
                category: IDERelayCategory::FileRead,
                scope_used: "file_read".to_string(),
                action: "file_read".to_string(),
                content,
                structured_data: Some(serde_json::json!({
                    "path": cp.display().to_string(),
                    "size": size,
                    "lines": lines,
                })),
                block_reason: None,
                handoff_required: false,
                actions_remaining: session.max_actions - session.actions_count,
                session_id: session_id.clone(),
                executed_at: now,
            })
        }
        Err(e) => Ok(IDERelayResult {
            ok: false,
            category: IDERelayCategory::ForbiddenSensitive,
            scope_used: "file_read".to_string(),
            action: "file_read".to_string(),
            content: None,
            structured_data: None,
            block_reason: Some(format!("Invalid path: {}", e)),
            handoff_required: false,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        }),
    }
}

/// Searches patterns in files using grep.
#[tauri::command]
pub async fn ide_grep_search(
    state: tauri::State<'_, IDEOperatorState>,
    session_id: String,
    pattern: String,
    path: Option<String>,
) -> Result<IDERelayResult, String> {
    let now = now_iso();

    let mut sessions = state
        .sessions
        .lock()
        .map_err(|e| format!("Lock error: {}", e))?;
    let session = sessions
        .get_mut(&session_id)
        .ok_or_else(|| format!("Session not found: {}", session_id))?;

    // Check scope
    if !is_scope_allowed("grep_search", &session.allowed_scopes) {
        return Ok(IDERelayResult {
            ok: false,
            category: IDERelayCategory::ForbiddenSensitive,
            scope_used: "grep_search".to_string(),
            action: "grep_search".to_string(),
            content: None,
            structured_data: None,
            block_reason: Some("Scope 'grep_search' not allowed".to_string()),
            handoff_required: false,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    // Check grep available
    if !check_grep_available() {
        return Ok(IDERelayResult {
            ok: false,
            category: IDERelayCategory::ToolingMissing,
            scope_used: "grep_search".to_string(),
            action: "grep_search".to_string(),
            content: None,
            structured_data: None,
            block_reason: Some("grep not available".to_string()),
            handoff_required: false,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    // Check actions limit
    if session.actions_count >= session.max_actions {
        return Ok(IDERelayResult {
            ok: false,
            category: IDERelayCategory::ForbiddenSensitive,
            scope_used: "grep_search".to_string(),
            action: "grep_search".to_string(),
            content: None,
            structured_data: None,
            block_reason: Some("Max actions reached".to_string()),
            handoff_required: false,
            actions_remaining: 0,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    session.status = IDESessionStatus::Inspecting;
    session.actions_count += 1;
    session.current_action = Some(format!("grep_search:{}", pattern));

    let workspace = session.workspace_dir.clone();
    let search_path = path.unwrap_or_else(|| workspace.clone());

    let output = std::process::Command::new("grep")
        .args([
            "-rn",
            "--include=*.{ts,tsx,rs,js,json,md,toml}",
            &pattern,
            &search_path,
        ])
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .output();

    session.status = IDESessionStatus::Idle;
    session.current_action = None;

    match output {
        Ok(result) => {
            let stdout = String::from_utf8_lossy(&result.stdout).to_string();
            let match_count = stdout.lines().count();

            Ok(IDERelayResult {
                ok: true,
                category: IDERelayCategory::GrepSearch,
                scope_used: "grep_search".to_string(),
                action: "grep_search".to_string(),
                content: Some(stdout),
                structured_data: Some(serde_json::json!({
                    "pattern": pattern,
                    "path": search_path,
                    "match_count": match_count,
                })),
                block_reason: None,
                handoff_required: false,
                actions_remaining: session.max_actions - session.actions_count,
                session_id: session_id.clone(),
                executed_at: now,
            })
        }
        Err(e) => Ok(IDERelayResult {
            ok: false,
            category: IDERelayCategory::ToolingMissing,
            scope_used: "grep_search".to_string(),
            action: "grep_search".to_string(),
            content: None,
            structured_data: None,
            block_reason: Some(format!("Failed to execute grep: {}", e)),
            handoff_required: false,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        }),
    }
}

/// Git status in workspace.
#[tauri::command]
pub async fn ide_git_status(
    state: tauri::State<'_, IDEOperatorState>,
    session_id: String,
) -> Result<IDERelayResult, String> {
    let now = now_iso();

    let mut sessions = state
        .sessions
        .lock()
        .map_err(|e| format!("Lock error: {}", e))?;
    let session = sessions
        .get_mut(&session_id)
        .ok_or_else(|| format!("Session not found: {}", session_id))?;

    // Check scope
    if !is_scope_allowed("git_read", &session.allowed_scopes) {
        return Ok(IDERelayResult {
            ok: false,
            category: IDERelayCategory::ForbiddenSensitive,
            scope_used: "git_read".to_string(),
            action: "git_status".to_string(),
            content: None,
            structured_data: None,
            block_reason: Some("Scope 'git_read' not allowed".to_string()),
            handoff_required: false,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    // Check git available
    if !check_git_available() {
        return Ok(IDERelayResult {
            ok: false,
            category: IDERelayCategory::ToolingMissing,
            scope_used: "git_read".to_string(),
            action: "git_status".to_string(),
            content: None,
            structured_data: None,
            block_reason: Some("git not available".to_string()),
            handoff_required: false,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    if session.actions_count >= session.max_actions {
        return Ok(IDERelayResult {
            ok: false,
            category: IDERelayCategory::ForbiddenSensitive,
            scope_used: "git_read".to_string(),
            action: "git_status".to_string(),
            content: None,
            structured_data: None,
            block_reason: Some("Max actions reached".to_string()),
            handoff_required: false,
            actions_remaining: 0,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    session.status = IDESessionStatus::Inspecting;
    session.actions_count += 1;
    session.current_action = Some("git_status".to_string());

    let workspace = session.workspace_dir.clone();
    let output = std::process::Command::new("git")
        .args(["status", "--short"])
        .current_dir(&workspace)
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .output();

    session.status = IDESessionStatus::Idle;
    session.current_action = None;

    match output {
        Ok(result) => {
            let stdout = String::from_utf8_lossy(&result.stdout).to_string();
            let changed_files_count = stdout.lines().count();

            Ok(IDERelayResult {
                ok: true,
                category: IDERelayCategory::GitStatus,
                scope_used: "git_read".to_string(),
                action: "git_status".to_string(),
                content: Some(stdout),
                structured_data: Some(serde_json::json!({
                    "workspace": workspace,
                    "changed_files_count": changed_files_count,
                })),
                block_reason: None,
                handoff_required: false,
                actions_remaining: session.max_actions - session.actions_count,
                session_id: session_id.clone(),
                executed_at: now,
            })
        }
        Err(e) => Ok(IDERelayResult {
            ok: false,
            category: IDERelayCategory::ToolingMissing,
            scope_used: "git_read".to_string(),
            action: "git_status".to_string(),
            content: None,
            structured_data: None,
            block_reason: Some(format!("Failed to execute git: {}", e)),
            handoff_required: false,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        }),
    }
}

/// Git diff in workspace.
#[tauri::command]
pub async fn ide_git_diff(
    state: tauri::State<'_, IDEOperatorState>,
    session_id: String,
    target: Option<String>,
) -> Result<IDERelayResult, String> {
    let now = now_iso();

    let mut sessions = state
        .sessions
        .lock()
        .map_err(|e| format!("Lock error: {}", e))?;
    let session = sessions
        .get_mut(&session_id)
        .ok_or_else(|| format!("Session not found: {}", session_id))?;

    if !is_scope_allowed("git_read", &session.allowed_scopes) {
        return Ok(IDERelayResult {
            ok: false,
            category: IDERelayCategory::ForbiddenSensitive,
            scope_used: "git_read".to_string(),
            action: "git_diff".to_string(),
            content: None,
            structured_data: None,
            block_reason: Some("Scope 'git_read' not allowed".to_string()),
            handoff_required: false,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    if !check_git_available() {
        return Ok(IDERelayResult {
            ok: false,
            category: IDERelayCategory::ToolingMissing,
            scope_used: "git_read".to_string(),
            action: "git_diff".to_string(),
            content: None,
            structured_data: None,
            block_reason: Some("git not available".to_string()),
            handoff_required: false,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    if session.actions_count >= session.max_actions {
        return Ok(IDERelayResult {
            ok: false,
            category: IDERelayCategory::ForbiddenSensitive,
            scope_used: "git_read".to_string(),
            action: "git_diff".to_string(),
            content: None,
            structured_data: None,
            block_reason: Some("Max actions reached".to_string()),
            handoff_required: false,
            actions_remaining: 0,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    session.status = IDESessionStatus::Inspecting;
    session.actions_count += 1;
    session.current_action = Some("git_diff".to_string());

    let workspace = session.workspace_dir.clone();
    let mut cmd = std::process::Command::new("git");
    cmd.arg("diff").current_dir(&workspace);

    if let Some(ref t) = target {
        cmd.arg(t);
    }

    let output = cmd
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .output();

    session.status = IDESessionStatus::Idle;
    session.current_action = None;

    match output {
        Ok(result) => {
            let stdout = String::from_utf8_lossy(&result.stdout).to_string();
            let diff_lines = stdout.lines().count();

            Ok(IDERelayResult {
                ok: true,
                category: IDERelayCategory::GitDiff,
                scope_used: "git_read".to_string(),
                action: "git_diff".to_string(),
                content: Some(stdout),
                structured_data: Some(serde_json::json!({
                    "workspace": workspace,
                    "target": target,
                    "diff_lines": diff_lines,
                })),
                block_reason: None,
                handoff_required: false,
                actions_remaining: session.max_actions - session.actions_count,
                session_id: session_id.clone(),
                executed_at: now,
            })
        }
        Err(e) => Ok(IDERelayResult {
            ok: false,
            category: IDERelayCategory::ToolingMissing,
            scope_used: "git_read".to_string(),
            action: "git_diff".to_string(),
            content: None,
            structured_data: None,
            block_reason: Some(format!("Failed to execute git: {}", e)),
            handoff_required: false,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        }),
    }
}

/// Bounded command execution with allowlist and forbidden check.
#[tauri::command]
pub async fn ide_safe_command(
    state: tauri::State<'_, IDEOperatorState>,
    session_id: String,
    command: String,
) -> Result<IDERelayResult, String> {
    let now = now_iso();

    let mut sessions = state
        .sessions
        .lock()
        .map_err(|e| format!("Lock error: {}", e))?;
    let session = sessions
        .get_mut(&session_id)
        .ok_or_else(|| format!("Session not found: {}", session_id))?;

    // Check scope
    if !is_scope_allowed("safe_command", &session.allowed_scopes) {
        return Ok(IDERelayResult {
            ok: false,
            category: IDERelayCategory::ForbiddenSensitive,
            scope_used: "safe_command".to_string(),
            action: "safe_command".to_string(),
            content: None,
            structured_data: None,
            block_reason: Some("Scope 'safe_command' not allowed".to_string()),
            handoff_required: false,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    // Check forbidden commands
    if is_forbidden_command(&command) {
        log::warn!("[IDEOperator] Forbidden command rejected: {}", command);
        return Ok(IDERelayResult {
            ok: false,
            category: IDERelayCategory::ForbiddenSensitive,
            scope_used: "safe_command".to_string(),
            action: "safe_command".to_string(),
            content: None,
            structured_data: None,
            block_reason: Some(format!("Command matches forbidden pattern: {}", command)),
            handoff_required: false,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    // Allowlist for safe commands
    const ALLOWED_PREFIXES: &[&str] = &[
        "ls",
        "pwd",
        "cat",
        "head",
        "tail",
        "wc",
        "find",
        "git status",
        "git diff",
        "git log",
        "git branch",
        "git rev-parse",
        "node -v",
        "pnpm -v",
        "cargo -V",
        "rustc -V",
        "pnpm run build",
        "pnpm run test",
        "pnpm run lint",
        "pnpm run check",
        "cargo check",
        "cargo clippy",
        "uname",
        "free",
        "df",
    ];

    let trimmed = command.trim();
    let is_allowed = ALLOWED_PREFIXES.iter().any(|p| trimmed.starts_with(p));

    if !is_allowed {
        log::warn!("[IDEOperator] Command not in allowlist: {}", trimmed);
        return Ok(IDERelayResult {
            ok: false,
            category: IDERelayCategory::ForbiddenSensitive,
            scope_used: "safe_command".to_string(),
            action: "safe_command".to_string(),
            content: None,
            structured_data: None,
            block_reason: Some(format!(
                "Command not in allowlist: '{}'. Use ls, cat, git, pnpm, cargo.",
                trimmed
            )),
            handoff_required: false,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    if session.actions_count >= session.max_actions {
        return Ok(IDERelayResult {
            ok: false,
            category: IDERelayCategory::ForbiddenSensitive,
            scope_used: "safe_command".to_string(),
            action: "safe_command".to_string(),
            content: None,
            structured_data: None,
            block_reason: Some("Max actions reached".to_string()),
            handoff_required: false,
            actions_remaining: 0,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    session.status = IDESessionStatus::Executing;
    session.actions_count += 1;
    session.current_action = Some(format!("safe_command:{}", command));

    let workspace = session.workspace_dir.clone();
    let parts: Vec<&str> = trimmed.splitn(2, ' ').collect();
    let program = parts[0];
    let rest = if parts.len() > 1 { parts[1] } else { "" };
    let args: Vec<&str> = if rest.is_empty() {
        vec![]
    } else {
        rest.split_whitespace().collect()
    };

    let output = std::process::Command::new(program)
        .args(&args)
        .current_dir(&workspace)
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .output();

    session.status = IDESessionStatus::Idle;
    session.current_action = None;

    match output {
        Ok(result) => {
            let stdout = String::from_utf8_lossy(&result.stdout).to_string();
            let stderr = String::from_utf8_lossy(&result.stderr).to_string();
            let exit_code = result.status.code().unwrap_or(-1);

            Ok(IDERelayResult {
                ok: result.status.success(),
                category: IDERelayCategory::SafeCommand,
                scope_used: "safe_command".to_string(),
                action: "safe_command".to_string(),
                content: Some(stdout),
                structured_data: Some(serde_json::json!({
                    "command": command,
                    "exit_code": exit_code,
                    "stderr": if stderr.is_empty() { None } else { Some(stderr) },
                    "workspace": workspace,
                })),
                block_reason: None,
                handoff_required: false,
                actions_remaining: session.max_actions - session.actions_count,
                session_id: session_id.clone(),
                executed_at: now,
            })
        }
        Err(e) => Ok(IDERelayResult {
            ok: false,
            category: IDERelayCategory::ToolingMissing,
            scope_used: "safe_command".to_string(),
            action: "safe_command".to_string(),
            content: None,
            structured_data: None,
            block_reason: Some(format!("Failed to execute command: {}", e)),
            handoff_required: false,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        }),
    }
}

/// Returns IDE operator configuration.
#[tauri::command]
pub async fn ide_get_config() -> Result<IDEOperatorConfig, String> {
    Ok(IDEOperatorConfig {
        tooling_available: check_git_available() && check_grep_available(),
        git_available: check_git_available(),
        grep_available: check_grep_available(),
        default_workspace: workspace_dir(),
        default_allowed_scopes: vec![
            "repo_read".to_string(),
            "file_read".to_string(),
            "grep_search".to_string(),
            "git_read".to_string(),
            "safe_command".to_string(),
            "patch_prepare".to_string(),
        ],
        forbidden_commands: DEFAULT_FORBIDDEN_COMMANDS
            .iter()
            .map(|s| s.to_string())
            .collect(),
        sensitive_extensions: DEFAULT_SENSITIVE_EXTENSIONS
            .iter()
            .map(|s| s.to_string())
            .collect(),
    })
}
