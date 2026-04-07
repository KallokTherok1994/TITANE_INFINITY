// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ — BROWSER OPERATOR COMMANDS
//   LOCK 2: Governed browser relay for web navigation & extraction
//
//   HONESTY CONTRACT:
//   - Browser operator is a governed relay, not a free agent
//   - Domain allowlist enforcement is mandatory
//   - Sensitive boundaries trigger handoff_required
//   - Session binding with authority levels
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
pub enum BrowserSessionStatus {
    Idle,
    Navigating,
    Reading,
    Extracting,
    Blocked,
    Stopped,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BrowserRelayCategory {
    Navigation,
    StructuredRead,
    Extraction,
    HandoffRequired,
    BlockedSensitive,
    ToolingMissing,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrowserSession {
    pub session_id: String,
    pub authority_level: String,
    pub allowed_domains: Vec<String>,
    pub current_url: Option<String>,
    pub status: BrowserSessionStatus,
    pub started_at: String,
    pub expires_at: String,
    pub actions_count: u32,
    pub max_actions: u32,
    pub handoff_pending: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrowserRelayResult {
    pub ok: bool,
    pub category: BrowserRelayCategory,
    pub url: String,
    pub title: Option<String>,
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
pub struct DomainPolicy {
    pub allowed_domains: Vec<String>,
    pub denied_domains: Vec<String>,
    pub require_https: bool,
    pub max_pages_per_session: u32,
    pub sensitive_patterns: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrowserOperatorConfig {
    pub playwright_available: bool,
    pub playwright_version: Option<String>,
    pub default_browser: String,
    pub headless: bool,
    pub navigation_timeout_ms: u64,
    pub default_domain_policy: DomainPolicy,
}

// ─────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────

const DEFAULT_SENSITIVE_PATTERNS: &[&str] = &[
    "/login",
    "/signin",
    "/signup",
    "/register",
    "/checkout",
    "/payment",
    "/billing",
    "/account/settings",
    "/account/security",
    "/oauth",
    "/auth/",
    "/admin",
    "/dashboard/settings",
];

const DEFAULT_DENIED_DOMAINS: &[&str] = &["malware.com", "phishing.com"];

const SESSION_TTL_SECS: u64 = 1800; // 30 minutes
const DEFAULT_MAX_ACTIONS: u32 = 50;

// ─────────────────────────────────────────────────────────────────
// SESSION STATE
// ─────────────────────────────────────────────────────────────────

pub struct BrowserOperatorState {
    pub sessions: Mutex<HashMap<String, BrowserSession>>,
}

impl Default for BrowserOperatorState {
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
    format!("brw_{}_{:08x}", secs, nanos)
}

fn extract_domain(url: &str) -> Result<String, String> {
    let url_lower = url.to_lowercase();

    // Extract scheme
    let after_scheme = if let Some(pos) = url_lower.find("://") {
        &url_lower[pos + 3..]
    } else {
        &url_lower
    };

    // Extract domain (before first / or ? or #)
    let domain = after_scheme
        .split('/')
        .next()
        .unwrap_or(after_scheme)
        .split('?')
        .next()
        .unwrap_or(after_scheme)
        .split('#')
        .next()
        .unwrap_or(after_scheme);

    // Remove port if present
    let domain = domain.split(':').next().unwrap_or(domain);

    if domain.is_empty() {
        return Err("Invalid URL: cannot extract domain".to_string());
    }

    Ok(domain.to_string())
}

fn is_domain_allowed(domain: &str, allowed_domains: &[String]) -> bool {
    for allowed in allowed_domains {
        // Exact match
        if domain == allowed.as_str() {
            return true;
        }
        // Subdomain match: *.example.com matches sub.example.com
        if allowed.starts_with("*.") {
            let base = &allowed[2..];
            if domain.ends_with(base)
                && (domain.len() == base.len()
                    || domain[..domain.len() - base.len() - 1].contains('.'))
            {
                return true;
            }
        }
    }
    false
}

fn is_domain_denied(domain: &str, denied_domains: &[String]) -> bool {
    for denied in denied_domains {
        if domain == denied.as_str() || domain.ends_with(&format!(".{}", denied)) {
            return true;
        }
    }
    false
}

fn is_sensitive_url(url: &str, sensitive_patterns: &[String]) -> bool {
    let url_lower = url.to_lowercase();
    for pattern in sensitive_patterns {
        if url_lower.contains(&pattern.to_lowercase()) {
            return true;
        }
    }
    false
}

fn check_playwright_available() -> (bool, Option<String>) {
    // Check if Playwright is available by trying to run npx playwright --version
    match std::process::Command::new("npx")
        .args(["playwright", "--version"])
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .output()
    {
        Ok(output) => {
            if output.status.success() {
                let version = String::from_utf8_lossy(&output.stdout).trim().to_string();
                (true, Some(version))
            } else {
                (false, None)
            }
        }
        Err(_) => (false, None),
    }
}

// ─────────────────────────────────────────────────────────────────
// COMMANDS
// ─────────────────────────────────────────────────────────────────

/// Opens a governed browser session with domain allowlist.
#[tauri::command]
pub async fn browser_open_session(
    state: tauri::State<'_, BrowserOperatorState>,
    allowed_domains: Vec<String>,
    max_actions: Option<u32>,
) -> Result<BrowserSession, String> {
    let session_id = generate_session_id();
    let now = now_iso();
    let max_actions = max_actions.unwrap_or(DEFAULT_MAX_ACTIONS);

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

    let session = BrowserSession {
        session_id: session_id.clone(),
        authority_level: "OBSERVE".to_string(),
        allowed_domains: allowed_domains.clone(),
        current_url: None,
        status: BrowserSessionStatus::Idle,
        started_at: now,
        expires_at,
        actions_count: 0,
        max_actions,
        handoff_pending: false,
    };

    // Store session
    {
        let mut sessions = state
            .sessions
            .lock()
            .map_err(|e| format!("Lock error: {}", e))?;
        sessions.insert(session_id.clone(), session.clone());
    }

    log::info!(
        "[BrowserOperator] Session opened: {} (domains: {:?}, max_actions: {})",
        session_id,
        allowed_domains,
        max_actions
    );

    Ok(session)
}

/// Closes a browser session and releases resources.
#[tauri::command]
pub async fn browser_close_session(
    state: tauri::State<'_, BrowserOperatorState>,
    session_id: String,
) -> Result<bool, String> {
    let mut sessions = state
        .sessions
        .lock()
        .map_err(|e| format!("Lock error: {}", e))?;

    if let Some(mut session) = sessions.remove(&session_id) {
        session.status = BrowserSessionStatus::Stopped;
        log::info!("[BrowserOperator] Session closed: {}", session_id);
        Ok(true)
    } else {
        Err(format!("Session not found: {}", session_id))
    }
}

/// Returns current session state.
#[tauri::command]
pub async fn browser_get_session_status(
    state: tauri::State<'_, BrowserOperatorState>,
    session_id: String,
) -> Result<BrowserSession, String> {
    let sessions = state
        .sessions
        .lock()
        .map_err(|e| format!("Lock error: {}", e))?;

    sessions
        .get(&session_id)
        .cloned()
        .ok_or_else(|| format!("Session not found: {}", session_id))
}

/// Navigates to URL if domain is allowed.
#[tauri::command]
pub async fn browser_navigate(
    state: tauri::State<'_, BrowserOperatorState>,
    session_id: String,
    url: String,
) -> Result<BrowserRelayResult, String> {
    let now = now_iso();

    // Get session
    let mut sessions = state
        .sessions
        .lock()
        .map_err(|e| format!("Lock error: {}", e))?;
    let session = sessions
        .get_mut(&session_id)
        .ok_or_else(|| format!("Session not found: {}", session_id))?;

    // Check session status
    if matches!(session.status, BrowserSessionStatus::Stopped) {
        return Err("Session is stopped".to_string());
    }

    // Check actions limit
    if session.actions_count >= session.max_actions {
        return Ok(BrowserRelayResult {
            ok: false,
            category: BrowserRelayCategory::BlockedSensitive,
            url: url.clone(),
            title: None,
            content: None,
            structured_data: None,
            block_reason: Some("Max actions reached for this session".to_string()),
            handoff_required: false,
            actions_remaining: 0,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    // Extract and validate domain
    let domain = match extract_domain(&url) {
        Ok(d) => d,
        Err(e) => {
            return Ok(BrowserRelayResult {
                ok: false,
                category: BrowserRelayCategory::BlockedSensitive,
                url: url.clone(),
                title: None,
                content: None,
                structured_data: None,
                block_reason: Some(format!("Invalid URL: {}", e)),
                handoff_required: false,
                actions_remaining: session.max_actions - session.actions_count,
                session_id: session_id.clone(),
                executed_at: now,
            });
        }
    };

    // Check denied domains
    let default_denied: Vec<String> = DEFAULT_DENIED_DOMAINS
        .iter()
        .map(|s| s.to_string())
        .collect();
    if is_domain_denied(
        &domain,
        &session.allowed_domains.iter().cloned().collect::<Vec<_>>(),
    ) || is_domain_denied(&domain, &default_denied)
    {
        session.status = BrowserSessionStatus::Blocked;
        return Ok(BrowserRelayResult {
            ok: false,
            category: BrowserRelayCategory::BlockedSensitive,
            url: url.clone(),
            title: None,
            content: None,
            structured_data: None,
            block_reason: Some(format!("Domain '{}' is in denied list", domain)),
            handoff_required: false,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    // Check allowed domains
    if !is_domain_allowed(&domain, &session.allowed_domains) {
        session.status = BrowserSessionStatus::Blocked;
        return Ok(BrowserRelayResult {
            ok: false,
            category: BrowserRelayCategory::BlockedSensitive,
            url: url.clone(),
            title: None,
            content: None,
            structured_data: None,
            block_reason: Some(format!("Domain '{}' is not in allowed list", domain)),
            handoff_required: false,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    // Check sensitive patterns
    let default_sensitive: Vec<String> = DEFAULT_SENSITIVE_PATTERNS
        .iter()
        .map(|s| s.to_string())
        .collect();
    if is_sensitive_url(&url, &default_sensitive) {
        session.handoff_pending = true;
        session.status = BrowserSessionStatus::Idle;
        return Ok(BrowserRelayResult {
            ok: false,
            category: BrowserRelayCategory::HandoffRequired,
            url: url.clone(),
            title: None,
            content: None,
            structured_data: None,
            block_reason: Some("URL matches sensitive pattern — handoff required".to_string()),
            handoff_required: true,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    // Check Playwright availability
    let (pw_available, _pw_version) = check_playwright_available();
    if !pw_available {
        return Ok(BrowserRelayResult {
            ok: false,
            category: BrowserRelayCategory::ToolingMissing,
            url: url.clone(),
            title: None,
            content: None,
            structured_data: None,
            block_reason: Some("Playwright is not installed or not available".to_string()),
            handoff_required: false,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    // Perform navigation via Playwright
    session.status = BrowserSessionStatus::Navigating;
    session.actions_count += 1;
    session.current_url = Some(url.clone());

    let result = navigate_with_playwright(
        &url,
        &session_id,
        session.max_actions - session.actions_count,
    )
    .await;

    session.status = BrowserSessionStatus::Idle;

    Ok(result)
}

/// Reads page content via Playwright.
#[tauri::command]
pub async fn browser_read(
    state: tauri::State<'_, BrowserOperatorState>,
    session_id: String,
) -> Result<BrowserRelayResult, String> {
    let now = now_iso();

    let mut sessions = state
        .sessions
        .lock()
        .map_err(|e| format!("Lock error: {}", e))?;
    let session = sessions
        .get_mut(&session_id)
        .ok_or_else(|| format!("Session not found: {}", session_id))?;

    if matches!(session.status, BrowserSessionStatus::Stopped) {
        return Err("Session is stopped".to_string());
    }

    if session.actions_count >= session.max_actions {
        return Ok(BrowserRelayResult {
            ok: false,
            category: BrowserRelayCategory::BlockedSensitive,
            url: session.current_url.clone().unwrap_or_default(),
            title: None,
            content: None,
            structured_data: None,
            block_reason: Some("Max actions reached".to_string()),
            handoff_required: false,
            actions_remaining: 0,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    let current_url = session.current_url.clone().unwrap_or_default();
    if current_url.is_empty() {
        return Err("No URL has been navigated to yet".to_string());
    }

    session.status = BrowserSessionStatus::Reading;
    session.actions_count += 1;

    let (pw_available, _) = check_playwright_available();
    if !pw_available {
        session.status = BrowserSessionStatus::Idle;
        return Ok(BrowserRelayResult {
            ok: false,
            category: BrowserRelayCategory::ToolingMissing,
            url: current_url,
            title: None,
            content: None,
            structured_data: None,
            block_reason: Some("Playwright is not installed".to_string()),
            handoff_required: false,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    let result = read_with_playwright(
        &current_url,
        &session_id,
        session.max_actions - session.actions_count,
    )
    .await;
    session.status = BrowserSessionStatus::Idle;

    Ok(result)
}

/// Extracts structured content from a CSS selector.
#[tauri::command]
pub async fn browser_extract(
    state: tauri::State<'_, BrowserOperatorState>,
    session_id: String,
    selector: String,
) -> Result<BrowserRelayResult, String> {
    let now = now_iso();

    let mut sessions = state
        .sessions
        .lock()
        .map_err(|e| format!("Lock error: {}", e))?;
    let session = sessions
        .get_mut(&session_id)
        .ok_or_else(|| format!("Session not found: {}", session_id))?;

    if matches!(session.status, BrowserSessionStatus::Stopped) {
        return Err("Session is stopped".to_string());
    }

    if session.actions_count >= session.max_actions {
        return Ok(BrowserRelayResult {
            ok: false,
            category: BrowserRelayCategory::BlockedSensitive,
            url: session.current_url.clone().unwrap_or_default(),
            title: None,
            content: None,
            structured_data: None,
            block_reason: Some("Max actions reached".to_string()),
            handoff_required: false,
            actions_remaining: 0,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    let current_url = session.current_url.clone().unwrap_or_default();
    if current_url.is_empty() {
        return Err("No URL has been navigated to yet".to_string());
    }

    session.status = BrowserSessionStatus::Extracting;
    session.actions_count += 1;

    let (pw_available, _) = check_playwright_available();
    if !pw_available {
        session.status = BrowserSessionStatus::Idle;
        return Ok(BrowserRelayResult {
            ok: false,
            category: BrowserRelayCategory::ToolingMissing,
            url: current_url,
            title: None,
            content: None,
            structured_data: None,
            block_reason: Some("Playwright is not installed".to_string()),
            handoff_required: false,
            actions_remaining: session.max_actions - session.actions_count,
            session_id: session_id.clone(),
            executed_at: now,
        });
    }

    let result = extract_with_playwright(
        &current_url,
        &selector,
        &session_id,
        session.max_actions - session.actions_count,
    )
    .await;
    session.status = BrowserSessionStatus::Idle;

    Ok(result)
}

/// Returns the browser operator configuration and Playwright availability.
#[tauri::command]
pub async fn browser_get_config() -> Result<BrowserOperatorConfig, String> {
    let (pw_available, pw_version) = check_playwright_available();

    Ok(BrowserOperatorConfig {
        playwright_available: pw_available,
        playwright_version: pw_version,
        default_browser: "chromium".to_string(),
        headless: true,
        navigation_timeout_ms: 30000,
        default_domain_policy: DomainPolicy {
            allowed_domains: vec![],
            denied_domains: DEFAULT_DENIED_DOMAINS
                .iter()
                .map(|s| s.to_string())
                .collect(),
            require_https: false,
            max_pages_per_session: 50,
            sensitive_patterns: DEFAULT_SENSITIVE_PATTERNS
                .iter()
                .map(|s| s.to_string())
                .collect(),
        },
    })
}

// ─────────────────────────────────────────────────────────────────
// PLAYWRIGHT INTEGRATION
// ─────────────────────────────────────────────────────────────────

/// Navigate to URL using Playwright CLI and capture page content.
async fn navigate_with_playwright(
    url: &str,
    session_id: &str,
    actions_remaining: u32,
) -> BrowserRelayResult {
    let now = now_iso();

    // Use a Node.js script to control Playwright
    let script = format!(
        r#"
const {{ chromium }} = require('playwright');

(async () => {{
    const browser = await chromium.launch({{ headless: true }});
    const context = await browser.newContext();
    const page = await context.newPage();

    try {{
        await page.goto('{url}', {{ waitUntil: 'domcontentloaded', timeout: 30000 }});
        const title = await page.title();
        const content = await page.evaluate(() => document.body?.innerText?.substring(0, 10000) || '');
        console.log(JSON.stringify({{ ok: true, title, content }}));
    }} catch (err) {{
        console.log(JSON.stringify({{ ok: false, error: err.message }}));
    }} finally {{
        await browser.close();
    }}
}})();
"#,
        url = url.replace('\'', "\\'")
    );

    let output = std::process::Command::new("node")
        .arg("-e")
        .arg(&script)
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .output();

    match output {
        Ok(result) => {
            let stdout = String::from_utf8_lossy(&result.stdout);
            let stderr = String::from_utf8_lossy(&result.stderr);

            // Try to parse JSON output
            if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(stdout.trim()) {
                if parsed["ok"].as_bool().unwrap_or(false) {
                    let title = parsed["title"].as_str().map(|s| s.to_string());
                    let content = parsed["content"].as_str().map(|s| s.to_string());

                    // Check for sensitive content in title
                    let title_lower = title.as_deref().unwrap_or("").to_lowercase();
                    let is_sensitive = DEFAULT_SENSITIVE_PATTERNS
                        .iter()
                        .any(|p| title_lower.contains(&p.replace('/', "")));

                    if is_sensitive {
                        BrowserRelayResult {
                            ok: false,
                            category: BrowserRelayCategory::HandoffRequired,
                            url: url.to_string(),
                            title,
                            content: None,
                            structured_data: None,
                            block_reason: Some(
                                "Page title suggests sensitive content — handoff required"
                                    .to_string(),
                            ),
                            handoff_required: true,
                            actions_remaining,
                            session_id: session_id.to_string(),
                            executed_at: now,
                        }
                    } else {
                        BrowserRelayResult {
                            ok: true,
                            category: BrowserRelayCategory::Navigation,
                            url: url.to_string(),
                            title,
                            content,
                            structured_data: None,
                            block_reason: None,
                            handoff_required: false,
                            actions_remaining,
                            session_id: session_id.to_string(),
                            executed_at: now,
                        }
                    }
                } else {
                    let error = parsed["error"].as_str().unwrap_or("Unknown error");
                    BrowserRelayResult {
                        ok: false,
                        category: BrowserRelayCategory::BlockedSensitive,
                        url: url.to_string(),
                        title: None,
                        content: None,
                        structured_data: None,
                        block_reason: Some(format!("Playwright navigation failed: {}", error)),
                        handoff_required: false,
                        actions_remaining,
                        session_id: session_id.to_string(),
                        executed_at: now,
                    }
                }
            } else {
                log::warn!("[BrowserOperator] Playwright stdout: {}", stdout.trim());
                if !stderr.is_empty() {
                    log::warn!("[BrowserOperator] Playwright stderr: {}", stderr.trim());
                }
                BrowserRelayResult {
                    ok: false,
                    category: BrowserRelayCategory::ToolingMissing,
                    url: url.to_string(),
                    title: None,
                    content: None,
                    structured_data: None,
                    block_reason: Some(format!(
                        "Playwright output parse failed: {}",
                        stderr.trim()
                    )),
                    handoff_required: false,
                    actions_remaining,
                    session_id: session_id.to_string(),
                    executed_at: now,
                }
            }
        }
        Err(e) => BrowserRelayResult {
            ok: false,
            category: BrowserRelayCategory::ToolingMissing,
            url: url.to_string(),
            title: None,
            content: None,
            structured_data: None,
            block_reason: Some(format!("Failed to execute Playwright: {}", e)),
            handoff_required: false,
            actions_remaining,
            session_id: session_id.to_string(),
            executed_at: now,
        },
    }
}

/// Read page content using Playwright.
async fn read_with_playwright(
    url: &str,
    session_id: &str,
    actions_remaining: u32,
) -> BrowserRelayResult {
    let now = now_iso();

    let script = format!(
        r#"
const {{ chromium }} = require('playwright');

(async () => {{
    const browser = await chromium.launch({{ headless: true }});
    const context = await browser.newContext();
    const page = await context.newPage();

    try {{
        await page.goto('{url}', {{ waitUntil: 'domcontentloaded', timeout: 30000 }});
        const title = await page.title();
        const content = await page.evaluate(() => document.body?.innerText?.substring(0, 10000) || '');
        console.log(JSON.stringify({{ ok: true, title, content }}));
    }} catch (err) {{
        console.log(JSON.stringify({{ ok: false, error: err.message }}));
    }} finally {{
        await browser.close();
    }}
}})();
"#,
        url = url.replace('\'', "\\'")
    );

    let output = std::process::Command::new("node")
        .arg("-e")
        .arg(&script)
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .output();

    match output {
        Ok(result) => {
            let stdout = String::from_utf8_lossy(&result.stdout);
            if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(stdout.trim()) {
                if parsed["ok"].as_bool().unwrap_or(false) {
                    BrowserRelayResult {
                        ok: true,
                        category: BrowserRelayCategory::StructuredRead,
                        url: url.to_string(),
                        title: parsed["title"].as_str().map(|s| s.to_string()),
                        content: parsed["content"].as_str().map(|s| s.to_string()),
                        structured_data: None,
                        block_reason: None,
                        handoff_required: false,
                        actions_remaining,
                        session_id: session_id.to_string(),
                        executed_at: now,
                    }
                } else {
                    let error = parsed["error"].as_str().unwrap_or("Unknown error");
                    BrowserRelayResult {
                        ok: false,
                        category: BrowserRelayCategory::BlockedSensitive,
                        url: url.to_string(),
                        title: None,
                        content: None,
                        structured_data: None,
                        block_reason: Some(format!("Read failed: {}", error)),
                        handoff_required: false,
                        actions_remaining,
                        session_id: session_id.to_string(),
                        executed_at: now,
                    }
                }
            } else {
                BrowserRelayResult {
                    ok: false,
                    category: BrowserRelayCategory::ToolingMissing,
                    url: url.to_string(),
                    title: None,
                    content: None,
                    structured_data: None,
                    block_reason: Some("Playwright output parse failed".to_string()),
                    handoff_required: false,
                    actions_remaining,
                    session_id: session_id.to_string(),
                    executed_at: now,
                }
            }
        }
        Err(e) => BrowserRelayResult {
            ok: false,
            category: BrowserRelayCategory::ToolingMissing,
            url: url.to_string(),
            title: None,
            content: None,
            structured_data: None,
            block_reason: Some(format!("Failed to execute Playwright: {}", e)),
            handoff_required: false,
            actions_remaining,
            session_id: session_id.to_string(),
            executed_at: now,
        },
    }
}

/// Extract structured content from a CSS selector using Playwright.
async fn extract_with_playwright(
    url: &str,
    selector: &str,
    session_id: &str,
    actions_remaining: u32,
) -> BrowserRelayResult {
    let now = now_iso();

    let script = format!(
        r#"
const {{ chromium }} = require('playwright');

(async () => {{
    const browser = await chromium.launch({{ headless: true }});
    const context = await browser.newContext();
    const page = await context.newPage();

    try {{
        await page.goto('{url}', {{ waitUntil: 'domcontentloaded', timeout: 30000 }});
        const title = await page.title();
        const elements = await page.$$eval('{selector}', els => els.map(el => ({{
            text: el.innerText?.substring(0, 2000) || '',
            tag: el.tagName?.toLowerCase(),
            href: el.getAttribute('href') || null,
        }})));
        console.log(JSON.stringify({{ ok: true, title, elements }}));
    }} catch (err) {{
        console.log(JSON.stringify({{ ok: false, error: err.message }}));
    }} finally {{
        await browser.close();
    }}
}})();
"#,
        url = url.replace('\'', "\\'"),
        selector = selector.replace('\'', "\\'")
    );

    let output = std::process::Command::new("node")
        .arg("-e")
        .arg(&script)
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .output();

    match output {
        Ok(result) => {
            let stdout = String::from_utf8_lossy(&result.stdout);
            if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(stdout.trim()) {
                if parsed["ok"].as_bool().unwrap_or(false) {
                    let elements = parsed["elements"].clone();
                    let content_summary = elements
                        .as_array()
                        .map(|arr| {
                            arr.iter()
                                .filter_map(|e| e["text"].as_str())
                                .collect::<Vec<_>>()
                                .join("\n---\n")
                        })
                        .unwrap_or_default();

                    BrowserRelayResult {
                        ok: true,
                        category: BrowserRelayCategory::Extraction,
                        url: url.to_string(),
                        title: parsed["title"].as_str().map(|s| s.to_string()),
                        content: if content_summary.is_empty() {
                            None
                        } else {
                            Some(content_summary)
                        },
                        structured_data: Some(serde_json::json!({
                            "selector": selector,
                            "elements": elements,
                            "count": elements.as_array().map(|a| a.len()).unwrap_or(0),
                        })),
                        block_reason: None,
                        handoff_required: false,
                        actions_remaining,
                        session_id: session_id.to_string(),
                        executed_at: now,
                    }
                } else {
                    let error = parsed["error"].as_str().unwrap_or("Unknown error");
                    BrowserRelayResult {
                        ok: false,
                        category: BrowserRelayCategory::BlockedSensitive,
                        url: url.to_string(),
                        title: None,
                        content: None,
                        structured_data: None,
                        block_reason: Some(format!("Extract failed: {}", error)),
                        handoff_required: false,
                        actions_remaining,
                        session_id: session_id.to_string(),
                        executed_at: now,
                    }
                }
            } else {
                BrowserRelayResult {
                    ok: false,
                    category: BrowserRelayCategory::ToolingMissing,
                    url: url.to_string(),
                    title: None,
                    content: None,
                    structured_data: None,
                    block_reason: Some("Playwright output parse failed".to_string()),
                    handoff_required: false,
                    actions_remaining,
                    session_id: session_id.to_string(),
                    executed_at: now,
                }
            }
        }
        Err(e) => BrowserRelayResult {
            ok: false,
            category: BrowserRelayCategory::ToolingMissing,
            url: url.to_string(),
            title: None,
            content: None,
            structured_data: None,
            block_reason: Some(format!("Failed to execute Playwright: {}", e)),
            handoff_required: false,
            actions_remaining,
            session_id: session_id.to_string(),
            executed_at: now,
        },
    }
}
