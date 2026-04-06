// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ — DESKTOP PERCEPTION COMMANDS
//   LOCK 5: Governed desktop perception for window discovery
//
//   HONESTY CONTRACT:
//   - Desktop perception is read-only (no input injection)
//   - Session binding to session_authority required
//   - Denied zones remain denied
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
pub enum DesktopSessionStatus {
    Idle,
    Perceiving,
    Blocked,
    Stopped,
    Paused,
    HandoffPending,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DesktopPerceptionCategory {
    ActiveWindow,
    WindowList,
    WindowFocus,
    HandoffRequired,
    ForbiddenSensitive,
    ToolingMissing,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DesktopWindowInfo {
    pub title: String,
    pub process_name: String,
    pub pid: u32,
    pub is_focused: bool,
    pub is_visible: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub window_class: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DesktopSession {
    pub session_id: String,
    pub authority_level: String,
    pub allowed_surfaces: Vec<String>,
    pub status: DesktopSessionStatus,
    pub started_at: String,
    pub expires_at: String,
    pub actions_count: u32,
    pub max_actions: u32,
    pub handoff_pending: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DesktopPerceptionResult {
    pub ok: bool,
    pub category: DesktopPerceptionCategory,
    pub scope_used: String,
    pub action: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub active_window: Option<DesktopWindowInfo>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub windows: Option<Vec<DesktopWindowInfo>>,
    pub block_reason: Option<String>,
    pub handoff_required: bool,
    pub actions_remaining: u32,
    pub session_id: String,
    pub executed_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DesktopOperatorConfig {
    pub available: bool,
    pub tooling_available: bool,
    pub default_allowed_surfaces: Vec<String>,
    pub denied_processes: Vec<String>,
    pub sensitive_patterns: Vec<String>,
}

// ─────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────

const DEFAULT_DENIED_PROCESSES: &[&str] = &[
    "gnome-keyring-daemon",
    "kwalletd",
    "seahorse",
    "password",
    "1password",
    "keepass",
    "bitwarden",
    "lastpass",
];

const DEFAULT_SENSITIVE_PATTERNS: &[&str] = &[
    "password",
    "login",
    "sign in",
    "banking",
    "payment",
    "credit card",
    "social security",
    "ssn",
];

const SESSION_TTL_SECS: u64 = 1800; // 30 minutes
const DEFAULT_MAX_ACTIONS: u32 = 50;

// ─────────────────────────────────────────────────────────────────
// SESSION STATE
// ─────────────────────────────────────────────────────────────────

pub struct DesktopOperatorState {
    pub sessions: Mutex<HashMap<String, DesktopSession>>,
}

impl Default for DesktopOperatorState {
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
    format!("dsk_{}_{:08x}", secs, nanos)
}

fn check_tooling_available() -> bool {
    // Check for wmctrl (Linux window management)
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("wmctrl")
            .arg("-l")
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped())
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
    }

    #[cfg(target_os = "macos")]
    {
        // macOS uses osascript for window info
        std::process::Command::new("osascript")
            .arg("-e")
            .arg("tell application \"System Events\" to get name of every process")
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped())
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
    }

    #[cfg(target_os = "windows")]
    {
        // Windows uses PowerShell
        std::process::Command::new("powershell")
            .args(["-Command", "Get-Process | Where-Object {$_.MainWindowTitle} | Select-Object -First 1"])
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped())
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
    }

    #[cfg(not(any(target_os = "linux", target_os = "macos", target_os = "windows")))]
    {
        false
    }
}

fn is_denied_process(process_name: &str) -> bool {
    let proc_lower = process_name.to_lowercase();
    DEFAULT_DENIED_PROCESSES.iter().any(|d| proc_lower.contains(&d.to_lowercase()))
}

fn is_sensitive_title(title: &str) -> bool {
    let title_lower = title.to_lowercase();
    DEFAULT_SENSITIVE_PATTERNS.iter().any(|p| title_lower.contains(&p.to_lowercase()))
}

// ─────────────────────────────────────────────────────────────────
// PLATFORM-SPECIFIC WINDOW DISCOVERY
// ─────────────────────────────────────────────────────────────────

#[cfg(target_os = "linux")]
fn get_active_window_linux() -> Result<DesktopWindowInfo, String> {
    // Use xdotool to get active window
    let output = std::process::Command::new("xdotool")
        .args(["getactivewindow", "getwindowpid", "getwindowname"])
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .output()
        .map_err(|e| format!("Failed to execute xdotool: {}", e))?;

    if !output.status.success() {
        // Fallback: try wmctrl
        return get_active_window_wmctrl();
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let lines: Vec<&str> = stdout.lines().collect();

    if lines.len() < 2 {
        return Err("xdotool output too short".to_string());
    }

    let pid: u32 = lines[0].trim().parse().unwrap_or(0);
    let title = lines[1].trim().to_string();

    // Get process name from /proc
    let process_name = get_process_name_from_pid(pid);

    Ok(DesktopWindowInfo {
        title: title.clone(),
        process_name: process_name.clone(),
        pid,
        is_focused: true,
        is_visible: true,
        window_class: None,
    })
}

#[cfg(target_os = "linux")]
fn get_active_window_wmctrl() -> Result<DesktopWindowInfo, String> {
    let output = std::process::Command::new("wmctrl")
        .args(["-l", "-p"])
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .output()
        .map_err(|e| format!("Failed to execute wmctrl: {}", e))?;

    if !output.status.success() {
        return Err("wmctrl failed".to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);

    // Find focused window (simplified: take first visible)
    for line in stdout.lines() {
        let parts: Vec<&str> = line.splitn(4, ' ').collect();
        if parts.len() >= 4 {
            let pid: u32 = parts[2].trim().parse().unwrap_or(0);
            let title = parts[3].trim().to_string();
            let process_name = get_process_name_from_pid(pid);

            return Ok(DesktopWindowInfo {
                title,
                process_name,
                pid,
                is_focused: true,
                is_visible: true,
                window_class: None,
            });
        }
    }

    Err("No active window found".to_string())
}

#[cfg(target_os = "linux")]
fn list_windows_linux() -> Result<Vec<DesktopWindowInfo>, String> {
    let output = std::process::Command::new("wmctrl")
        .args(["-l", "-p"])
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .output()
        .map_err(|e| format!("Failed to execute wmctrl: {}", e))?;

    if !output.status.success() {
        return Err("wmctrl failed".to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut windows = Vec::new();

    for line in stdout.lines() {
        let parts: Vec<&str> = line.splitn(4, ' ').collect();
        if parts.len() >= 4 {
            let pid: u32 = parts[2].trim().parse().unwrap_or(0);
            let title = parts[3].trim().to_string();
            let process_name = get_process_name_from_pid(pid);

            windows.push(DesktopWindowInfo {
                title,
                process_name,
                pid,
                is_focused: false,
                is_visible: true,
                window_class: None,
            });
        }
    }

    Ok(windows)
}

#[cfg(target_os = "linux")]
fn get_process_name_from_pid(pid: u32) -> String {
    if pid == 0 {
        return "unknown".to_string();
    }

    std::fs::read_to_string(format!("/proc/{}/comm", pid))
        .unwrap_or_else(|_| "unknown".to_string())
        .trim()
        .to_string()
}

#[cfg(target_os = "macos")]
fn get_active_window_macos() -> Result<DesktopWindowInfo, String> {
    let script = r#"
tell application "System Events"
    set frontApp to name of first application process whose frontmost is true
    set frontWindow to name of window 1 of application process frontApp
    return frontApp & "|||" & frontWindow
end tell
"#;

    let output = std::process::Command::new("osascript")
        .arg("-e")
        .arg(script)
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .output()
        .map_err(|e| format!("Failed to execute osascript: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("osascript failed: {}", stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let parts: Vec<&str> = stdout.trim().split("|||").collect();

    if parts.len() < 2 {
        return Err("Unexpected osascript output".to_string());
    }

    Ok(DesktopWindowInfo {
        title: parts[1].to_string(),
        process_name: parts[0].to_string(),
        pid: 0,
        is_focused: true,
        is_visible: true,
        window_class: None,
    })
}

#[cfg(target_os = "macos")]
fn list_windows_macos() -> Result<Vec<DesktopWindowInfo>, String> {
    let script = r#"
tell application "System Events"
    set windowList to {}
    repeat with proc in (every application process whose background only is false)
        try
            repeat with w in (every window of proc)
                set end of windowList to (name of proc) & "|||" & (name of w)
            end repeat
        end try
    end repeat
    return windowList
end tell
"#;

    let output = std::process::Command::new("osascript")
        .arg("-e")
        .arg(script)
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .output()
        .map_err(|e| format!("Failed to execute osascript: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("osascript failed: {}", stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut windows = Vec::new();

    // Parse comma-separated list
    for entry in stdout.trim().split(", ") {
        let parts: Vec<&str> = entry.split("|||").collect();
        if parts.len() >= 2 {
            windows.push(DesktopWindowInfo {
                title: parts[1].to_string(),
                process_name: parts[0].to_string(),
                pid: 0,
                is_focused: false,
                is_visible: true,
                window_class: None,
            });
        }
    }

    Ok(windows)
}

#[cfg(target_os = "windows")]
fn get_active_window_windows() -> Result<DesktopWindowInfo, String> {
    let script = r#"
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class User32 {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")]
    public static extern int GetWindowThreadProcessId(IntPtr hWnd, out int processId);
    [DllImport("user32.dll")]
    public static extern int GetWindowText(IntPtr hWnd, System.Text.StringBuilder lpString, int nMaxCount);
}
"@
$hwnd = [User32]::GetForegroundWindow()
$pid = 0
[User32]::GetWindowThreadProcessId($hwnd, [ref]$pid) | Out-Null
$sb = New-Object System.Text.StringBuilder 256
[User32]::GetWindowText($hwnd, $sb, 256) | Out-Null
$proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
Write-Output "$($proc.ProcessName)|||$($sb.ToString())"
"#;

    let output = std::process::Command::new("powershell")
        .args(["-Command", script])
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .output()
        .map_err(|e| format!("Failed to execute PowerShell: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("PowerShell failed: {}", stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let parts: Vec<&str> = stdout.trim().split("|||").collect();

    if parts.len() < 2 {
        return Err("Unexpected PowerShell output".to_string());
    }

    Ok(DesktopWindowInfo {
        title: parts[1].to_string(),
        process_name: parts[0].to_string(),
        pid: 0,
        is_focused: true,
        is_visible: true,
        window_class: None,
    })
}

#[cfg(target_os = "windows")]
fn list_windows_windows() -> Result<Vec<DesktopWindowInfo>, String> {
    let script = r#"
Get-Process | Where-Object {$_.MainWindowTitle} | ForEach-Object {
    Write-Output "$($_.ProcessName)|||$($_.MainWindowTitle)"
}
"#;

    let output = std::process::Command::new("powershell")
        .args(["-Command", script])
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .output()
        .map_err(|e| format!("Failed to execute PowerShell: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("PowerShell failed: {}", stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut windows = Vec::new();

    for line in stdout.lines() {
        let parts: Vec<&str> = line.split("|||").collect();
        if parts.len() >= 2 {
            windows.push(DesktopWindowInfo {
                title: parts[1].to_string(),
                process_name: parts[0].to_string(),
                pid: 0,
                is_focused: false,
                is_visible: true,
                window_class: None,
            });
        }
    }

    Ok(windows)
}

// ─────────────────────────────────────────────────────────────────
// COMMANDS
// ─────────────────────────────────────────────────────────────────

/// Opens a governed desktop perception session.
#[tauri::command]
pub async fn desktop_open_session(
    state: tauri::State<'_, DesktopOperatorState>,
    allowed_surfaces: Option<Vec<String>>,
) -> Result<DesktopSession, String> {
    let session_id = generate_session_id();
    let now = now_iso();
    let surfaces = allowed_surfaces.unwrap_or_else(|| {
        vec![
            "active_window_read".to_string(),
            "window_list_read".to_string(),
            "window_focus_read".to_string(),
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

    let session = DesktopSession {
        session_id: session_id.clone(),
        authority_level: "OBSERVE".to_string(),
        allowed_surfaces: surfaces.clone(),
        status: DesktopSessionStatus::Idle,
        started_at: now,
        expires_at,
        actions_count: 0,
        max_actions: DEFAULT_MAX_ACTIONS,
        handoff_pending: false,
    };

    {
        let mut sessions = state.sessions.lock().map_err(|e| format!("Lock error: {}", e))?;
        sessions.insert(session_id.clone(), session.clone());
    }

    log::info!(
        "[DesktopOperator] Session opened: {} (surfaces: {:?})",
        session_id,
        surfaces
    );

    Ok(session)
}

/// Closes a desktop perception session.
#[tauri::command]
pub async fn desktop_close_session(
    state: tauri::State<'_, DesktopOperatorState>,
    session_id: String,
) -> Result<bool, String> {
    let mut sessions = state.sessions.lock().map_err(|e| format!("Lock error: {}", e))?;

    if let Some(mut session) = sessions.remove(&session_id) {
        session.status = DesktopSessionStatus::Stopped;
        log::info!("[DesktopOperator] Session closed: {}", session_id);
        Ok(true)
    } else {
        Err(format!("Session not found: {}", session_id))
    }
}

/// Returns current session state.
#[tauri::command]
pub async fn desktop_get_session_status(
    state: tauri::State<'_, DesktopOperatorState>,
    session_id: String,
) -> Result<DesktopSession, String> {
    let sessions = state.sessions.lock().map_err(|e| format!("Lock error: {}", e))?;

    sessions
        .get(&session_id)
        .cloned()
        .ok_or_else(|| format!("Session not found: {}", session_id))
}

/// Gets the active window info.
#[tauri::command]
pub async fn desktop_get_active_window(
    state: tauri::State<'_, DesktopOperatorState>,
    session_id: String,
) -> Result<DesktopPerceptionResult, String> {
    let now = now_iso();

    let mut sessions = state.sessions.lock().map_err(|e| format!("Lock error: {}", e))?;
    let session = sessions
        .get_mut(&session_id)
        .ok_or_else(|| format!("Session not found: {}", session_id))?;

    // Check scope
    if !session.allowed_surfaces.contains(&"active_window_read".to_string()) {
        return Ok(DesktopPerceptionResult {
            ok: false,
            category: DesktopPerceptionCategory::ForbiddenSensitive,
            scope_used: "active_window_read".to_string(),
            action: "get_active_window".to_string(),
            active_window: None,
            windows: None,
            block_reason: Some("Scope 'active_window_read' not allowed".to_string()),
            handoff_required: false,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    // Check tooling
    if !check_tooling_available() {
        return Ok(DesktopPerceptionResult {
            ok: false,
            category: DesktopPerceptionCategory::ToolingMissing,
            scope_used: "active_window_read".to_string(),
            action: "get_active_window".to_string(),
            active_window: None,
            windows: None,
            block_reason: Some("Desktop tooling not available (wmctrl/xdotool/osascript)".to_string()),
            handoff_required: false,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    // Check actions limit
    if session.actions_count >= session.max_actions {
        return Ok(DesktopPerceptionResult {
            ok: false,
            category: DesktopPerceptionCategory::ForbiddenSensitive,
            scope_used: "active_window_read".to_string(),
            action: "get_active_window".to_string(),
            active_window: None,
            windows: None,
            block_reason: Some("Max actions reached".to_string()),
            handoff_required: false,
            actions_remaining: 0,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    session.status = DesktopSessionStatus::Perceiving;
    session.actions_count += 1;

    // Get active window
    #[cfg(target_os = "linux")]
    let result = get_active_window_linux();
    #[cfg(target_os = "macos")]
    let result = get_active_window_macos();
    #[cfg(target_os = "windows")]
    let result = get_active_window_windows();
    #[cfg(not(any(target_os = "linux", target_os = "macos", target_os = "windows")))]
    let result: Result<DesktopWindowInfo, String> = Err("Unsupported platform".to_string());

    session.status = DesktopSessionStatus::Idle;

    match result {
        Ok(window_info) => {
            // Check denied process
            if is_denied_process(&window_info.process_name) {
                return Ok(DesktopPerceptionResult {
                    ok: false,
                    category: DesktopPerceptionCategory::ForbiddenSensitive,
                    scope_used: "active_window_read".to_string(),
                    action: "get_active_window".to_string(),
                    active_window: None,
                    windows: None,
                    block_reason: Some(format!("Process '{}' is in denied list", window_info.process_name)),
                    handoff_required: false,
                    actions_remaining: session.max_actions - session.actions_count,
                    session_id: session_id.clone(),
                    executed_at: now,
                });
            }

            // Check sensitive title
            if is_sensitive_title(&window_info.title) {
                return Ok(DesktopPerceptionResult {
                    ok: false,
                    category: DesktopPerceptionCategory::HandoffRequired,
                    scope_used: "active_window_read".to_string(),
                    action: "get_active_window".to_string(),
                    active_window: None,
                    windows: None,
                    block_reason: Some("Window title suggests sensitive content — handoff required".to_string()),
                    handoff_required: true,
                    actions_remaining: session.max_actions - session.actions_count,
                    session_id: session_id.clone(),
                    executed_at: now,
                });
            }

            Ok(DesktopPerceptionResult {
                ok: true,
                category: DesktopPerceptionCategory::ActiveWindow,
                scope_used: "active_window_read".to_string(),
                action: "get_active_window".to_string(),
                active_window: Some(window_info),
                windows: None,
                block_reason: None,
                handoff_required: false,
                actions_remaining: session.max_actions - session.actions_count,
                session_id: session_id.clone(),
                executed_at: now,
            })
        }
        Err(e) => Ok(DesktopPerceptionResult {
            ok: false,
            category: DesktopPerceptionCategory::ToolingMissing,
            scope_used: "active_window_read".to_string(),
            action: "get_active_window".to_string(),
            active_window: None,
            windows: None,
            block_reason: Some(format!("Failed to get active window: {}", e)),
            handoff_required: false,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        }),
    }
}

/// Lists visible windows.
#[tauri::command]
pub async fn desktop_list_windows(
    state: tauri::State<'_, DesktopOperatorState>,
    session_id: String,
) -> Result<DesktopPerceptionResult, String> {
    let now = now_iso();

    let mut sessions = state.sessions.lock().map_err(|e| format!("Lock error: {}", e))?;
    let session = sessions
        .get_mut(&session_id)
        .ok_or_else(|| format!("Session not found: {}", session_id))?;

    // Check scope
    if !session.allowed_surfaces.contains(&"window_list_read".to_string()) {
        return Ok(DesktopPerceptionResult {
            ok: false,
            category: DesktopPerceptionCategory::ForbiddenSensitive,
            scope_used: "window_list_read".to_string(),
            action: "list_windows".to_string(),
            active_window: None,
            windows: None,
            block_reason: Some("Scope 'window_list_read' not allowed".to_string()),
            handoff_required: false,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    if !check_tooling_available() {
        return Ok(DesktopPerceptionResult {
            ok: false,
            category: DesktopPerceptionCategory::ToolingMissing,
            scope_used: "window_list_read".to_string(),
            action: "list_windows".to_string(),
            active_window: None,
            windows: None,
            block_reason: Some("Desktop tooling not available".to_string()),
            handoff_required: false,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    if session.actions_count >= session.max_actions {
        return Ok(DesktopPerceptionResult {
            ok: false,
            category: DesktopPerceptionCategory::ForbiddenSensitive,
            scope_used: "window_list_read".to_string(),
            action: "list_windows".to_string(),
            active_window: None,
            windows: None,
            block_reason: Some("Max actions reached".to_string()),
            handoff_required: false,
            actions_remaining: 0,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    session.status = DesktopSessionStatus::Perceiving;
    session.actions_count += 1;

    #[cfg(target_os = "linux")]
    let result = list_windows_linux();
    #[cfg(target_os = "macos")]
    let result = list_windows_macos();
    #[cfg(target_os = "windows")]
    let result = list_windows_windows();
    #[cfg(not(any(target_os = "linux", target_os = "macos", target_os = "windows")))]
    let result: Result<Vec<DesktopWindowInfo>, String> = Err("Unsupported platform".to_string());

    session.status = DesktopSessionStatus::Idle;

    match result {
        Ok(mut windows) => {
            // Filter denied processes
            windows.retain(|w| !is_denied_process(&w.process_name));

            Ok(DesktopPerceptionResult {
                ok: true,
                category: DesktopPerceptionCategory::WindowList,
                scope_used: "window_list_read".to_string(),
                action: "list_windows".to_string(),
                active_window: None,
                windows: Some(windows),
                block_reason: None,
                handoff_required: false,
                actions_remaining: session.max_actions - session.actions_count,
                session_id: session_id.clone(),
                executed_at: now,
            })
        }
        Err(e) => Ok(DesktopPerceptionResult {
            ok: false,
            category: DesktopPerceptionCategory::ToolingMissing,
            scope_used: "window_list_read".to_string(),
            action: "list_windows".to_string(),
            active_window: None,
            windows: None,
            block_reason: Some(format!("Failed to list windows: {}", e)),
            handoff_required: false,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        }),
    }
}

/// Returns desktop operator configuration.
#[tauri::command]
pub async fn desktop_get_config() -> Result<DesktopOperatorConfig, String> {
    Ok(DesktopOperatorConfig {
        available: check_tooling_available(),
        tooling_available: check_tooling_available(),
        default_allowed_surfaces: vec![
            "active_window_read".to_string(),
            "window_list_read".to_string(),
            "window_focus_read".to_string(),
        ],
        denied_processes: DEFAULT_DENIED_PROCESSES.iter().map(|s| s.to_string()).collect(),
        sensitive_patterns: DEFAULT_SENSITIVE_PATTERNS.iter().map(|s| s.to_string()).collect(),
    })
}

// ─────────────────────────────────────────────────────────────────
// CONTROL SURFACES — Pause/Resume/Handoff/Kill Switch
// ─────────────────────────────────────────────────────────────────

/// Pauses a desktop perception session.
#[tauri::command]
pub async fn desktop_pause_session(
    state: tauri::State<'_, DesktopOperatorState>,
    session_id: String,
) -> Result<DesktopSession, String> {
    let mut sessions = state.sessions.lock().map_err(|e| format!("Lock error: {}", e))?;

    let session = sessions
        .get_mut(&session_id)
        .ok_or_else(|| format!("Session not found: {}", session_id))?;

    match session.status {
        DesktopSessionStatus::Stopped => {
            return Err("Cannot pause a stopped session".to_string());
        }
        DesktopSessionStatus::Paused => {
            return Ok(session.clone());
        }
        _ => {
            session.status = DesktopSessionStatus::Paused;
            log::info!("[DesktopOperator] Session paused: {}", session_id);
            Ok(session.clone())
        }
    }
}

/// Resumes a paused desktop perception session.
#[tauri::command]
pub async fn desktop_resume_session(
    state: tauri::State<'_, DesktopOperatorState>,
    session_id: String,
) -> Result<DesktopSession, String> {
    let mut sessions = state.sessions.lock().map_err(|e| format!("Lock error: {}", e))?;

    let session = sessions
        .get_mut(&session_id)
        .ok_or_else(|| format!("Session not found: {}", session_id))?;

    match session.status {
        DesktopSessionStatus::Stopped => {
            return Err("Cannot resume a stopped session".to_string());
        }
        DesktopSessionStatus::Paused => {
            session.status = DesktopSessionStatus::Idle;
            log::info!("[DesktopOperator] Session resumed: {}", session_id);
            Ok(session.clone())
        }
        _ => {
            Ok(session.clone())
        }
    }
}

/// Triggers handoff to user for a desktop perception session.
#[tauri::command]
pub async fn desktop_handoff_session(
    state: tauri::State<'_, DesktopOperatorState>,
    session_id: String,
    reason: Option<String>,
) -> Result<DesktopSession, String> {
    let mut sessions = state.sessions.lock().map_err(|e| format!("Lock error: {}", e))?;

    let session = sessions
        .get_mut(&session_id)
        .ok_or_else(|| format!("Session not found: {}", session_id))?;

    session.handoff_pending = true;
    session.status = DesktopSessionStatus::HandoffPending;

    let handoff_reason = reason.unwrap_or_else(|| "User handoff requested".to_string());

    log::info!(
        "[DesktopOperator] Session handoff triggered: {} (reason: {})",
        session_id,
        handoff_reason
    );

    Ok(session.clone())
}

/// Kill switch — immediately stops a desktop perception session.
#[tauri::command]
pub async fn desktop_kill_switch(
    state: tauri::State<'_, DesktopOperatorState>,
    session_id: String,
    reason: Option<String>,
) -> Result<bool, String> {
    let mut sessions = state.sessions.lock().map_err(|e| format!("Lock error: {}", e))?;

    if let Some(mut session) = sessions.remove(&session_id) {
        session.status = DesktopSessionStatus::Stopped;
        session.handoff_pending = false;

        let kill_reason = reason.unwrap_or_else(|| "Kill switch activated".to_string());

        log::warn!(
            "[DesktopOperator] KILL SWITCH activated: {} (reason: {})",
            session_id,
            kill_reason
        );

        Ok(true)
    } else {
        Err(format!("Session not found: {}", session_id))
    }
}

/// Gets the control surface status for a session.
#[tauri::command]
pub async fn desktop_get_control_status(
    state: tauri::State<'_, DesktopOperatorState>,
    session_id: String,
) -> Result<serde_json::Value, String> {
    let sessions = state.sessions.lock().map_err(|e| format!("Lock error: {}", e))?;

    let session = sessions
        .get(&session_id)
        .ok_or_else(|| format!("Session not found: {}", session_id))?;

    Ok(serde_json::json!({
        "session_id": session.session_id,
        "status": serde_json::to_string(&session.status).unwrap_or_else(|_| "unknown".to_string()),
        "handoff_pending": session.handoff_pending,
        "actions_count": session.actions_count,
        "max_actions": session.max_actions,
        "actions_remaining": session.max_actions - session.actions_count,
        "authority_level": session.authority_level,
        "can_pause": !matches!(session.status, DesktopSessionStatus::Stopped),
        "can_resume": matches!(session.status, DesktopSessionStatus::Paused),
        "can_handoff": !matches!(session.status, DesktopSessionStatus::Stopped),
        "can_kill": !matches!(session.status, DesktopSessionStatus::Stopped),
        "checked_at": now_iso()
    }))
}
