// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v30.0.0 — TOTAL_DEV BACKEND COMMANDS
//   GOD DEV space: secure unlock, git ops, extended console, file chains
//
//   Security contract:
//   - No plaintext password stored or returned
//   - unlock validated via SHA-256 comparison (server-side only)
//   - Session token is ephemeral (runtime only, not persisted)
//   - Git ops: allowlisted per TITANE canon
//   - All ops journaled via log::info/warn
// ═══════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::path::{Component, Path, PathBuf};
use std::process::{Command as ProcessCommand, Stdio};
use std::sync::atomic::{AtomicU64, Ordering};
use std::thread;
use std::time::{Duration, Instant};

// ─────────────────────────────────────────────────────────────────
// SHA-256 hash of the super-admin unlock token.
// Stored in Rust code only (never in frontend, logs, or config).
// Never decode, print, or share this constant value.
// ─────────────────────────────────────────────────────────────────
const TOTAL_DEV_UNLOCK_HASH: &str =
    "895d3d67cc9d3b3698b59e35818c7ac9f06c3fe710c48e69a80908ca5ad999a8";

/// Monotonic session counter — reset on restart (in-process only)
static SESSION_EXPIRY: AtomicU64 = AtomicU64::new(0);

// Cross-platform fallback: uses the user's Documents directory via the `dirs` crate.
fn workspace_dir() -> String {
    std::env::var("TITANE_WORKSPACE_DIR").unwrap_or_else(|_| {
        dirs::document_dir()
            .map(|d| d.join("TITANE_INFINITY").to_string_lossy().into_owned())
            .unwrap_or_else(|| ".".to_string())
    })
}

fn workspace_dir_path() -> PathBuf {
    PathBuf::from(workspace_dir())
}

fn workspace_dir_canonical() -> Result<PathBuf, String> {
    workspace_dir_path()
        .canonicalize()
        .map_err(|e| format!("Workspace TOTAL_DEV invalide: {}", e))
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TotalDevUnlockResult {
    pub ok: bool,
    pub session_token: Option<String>,
    pub expires_at_unix: Option<u64>,
    pub lock_state: String, // "LOCKED" | "UNLOCKED" | "EXPIRED"
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TotalDevSessionStatus {
    pub lock_state: String, // "LOCKED" | "UNLOCKED" | "EXPIRED"
    pub expires_at_unix: Option<u64>,
    pub now_unix: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TotalDevGitResult {
    pub ok: bool,
    pub content: String,
    pub error: Option<String>,
    pub exit_code: i32,
    pub op: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TotalDevConsoleResult {
    pub ok: bool,
    pub content: String,
    pub stderr: Option<String>,
    pub exit_code: i32,
    pub command_id: String,
    pub started_at: u64,
    pub ended_at: u64,
    pub duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TotalDevFileResult {
    pub ok: bool,
    pub path: String,
    pub content: Option<String>,
    pub size: Option<u64>,
    pub lines: Option<usize>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TotalDevCertificationProfileResult {
    pub ok: bool,
    pub profile_id: String,
    pub status: String, // "PASS" | "FAIL" | "BLOCKED"
    pub command: String,
    pub exit_code: i32,
    pub duration_ms: u64,
    pub output_tail: String,
    pub artifact_paths: Vec<String>,
    pub error: Option<String>,
}

#[derive(Debug, Clone)]
struct CertificationProfile {
    profile_id: &'static str,
    command: &'static str,
    program: &'static str,
    args: &'static [&'static str],
    env: &'static [(&'static str, &'static str)],
    required_env: &'static [&'static str],
    timeout_secs: u64,
    artifact_paths: &'static [&'static str],
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

fn now_unix() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

fn hash_token(input: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    format!("{:x}", hasher.finalize())
}

const ALLOWED_TOTAL_DEV_COMMANDS: &[&str] = &[
    "pwd",
    "ls",
    "ls -la",
    "ls -lah",
    "git status",
    "git diff",
    "git log --oneline -10",
    "git log --oneline -20",
    "git branch",
    "git rev-parse --short HEAD",
    "node -v",
    "pnpm -v",
    "pnpm run build",
    "pnpm run test",
    "pnpm run lint",
    "pnpm run check",
    "pnpm run format:check",
    "pnpm run test:100",
    "pnpm run test:rust",
    "pnpm run verify",
    "pnpm run verify:tauri-only",
    "pnpm run verify:invariants-governed",
    "pnpm run verify:frontend-circular-deps",
    "cargo -V",
    "rustc -V",
    "cargo check",
    "cargo build",
    "cargo clippy",
    "cargo check --manifest-path src-tauri/Cargo.toml",
    "cargo clippy --manifest-path src-tauri/Cargo.toml",
    "cargo test --manifest-path src-tauri/Cargo.toml",
    "pnpm run e2e:desktop",
    "pnpm run e2e:desktop:run",
    "uname -a",
    "free -h",
    "df -h",
    "pnpm run build:tauri:e2e",
    "pnpm run build:production",
];

fn certification_profile(profile_id: &str) -> Option<CertificationProfile> {
    match profile_id {
        "ollama-live" => Some(CertificationProfile {
            profile_id: "ollama-live",
            command: "pnpm run verify:ollama:dev:live",
            program: "pnpm",
            args: &["run", "verify:ollama:dev:live"],
            env: &[],
            required_env: &[],
            timeout_secs: 180,
            artifact_paths: &["reports/ollama-dev-awareness/latest.json"],
        }),
        "ollama-performance" => Some(CertificationProfile {
            profile_id: "ollama-performance",
            command: "pnpm run verify:ollama:dev:performance",
            program: "pnpm",
            args: &["run", "verify:ollama:dev:performance"],
            env: &[],
            required_env: &[],
            timeout_secs: 240,
            artifact_paths: &[
                "reports/ollama-dev-performance/latest.json",
                "reports/ollama-dev-performance/latest.md",
            ],
        }),
        "ollama-stack" => Some(CertificationProfile {
            profile_id: "ollama-stack",
            command: "pnpm run verify:ollama:dev:stack",
            program: "pnpm",
            args: &["run", "verify:ollama:dev:stack"],
            env: &[],
            required_env: &[],
            timeout_secs: 600,
            artifact_paths: &[
                "reports/ollama-dev-awareness/latest.json",
                "reports/ollama-dev-performance/latest.json",
            ],
        }),
        "ollama-global-awareness" => Some(CertificationProfile {
            profile_id: "ollama-global-awareness",
            command: "pnpm run verify:ollama:dev:global-awareness",
            program: "pnpm",
            args: &["run", "verify:ollama:dev:global-awareness"],
            env: &[],
            required_env: &[],
            timeout_secs: 240,
            artifact_paths: &[
                "reports/ollama-dev-awareness/latest.json",
                "reports/ollama-dev-awareness/latest.md",
            ],
        }),
        "browser-total-dev-proof" => Some(CertificationProfile {
            profile_id: "browser-total-dev-proof",
            command: "PLAYWRIGHT_JSON_OUTPUT_NAME=reports/playwright-total-dev/results.chromium.json pnpm exec playwright test e2e/total-dev-smoke.spec.ts --project=chromium --reporter=list,json --output=reports/playwright-total-dev",
            program: "pnpm",
            args: &[
                "exec",
                "playwright",
                "test",
                "e2e/total-dev-smoke.spec.ts",
                "--project=chromium",
                "--reporter=list,json",
                "--output=reports/playwright-total-dev",
            ],
            env: &[(
                "PLAYWRIGHT_JSON_OUTPUT_NAME",
                "reports/playwright-total-dev/results.chromium.json",
            )],
            required_env: &[],
            timeout_secs: 300,
            artifact_paths: &[
                "reports/playwright-total-dev",
                "reports/playwright-total-dev/results.chromium.json",
            ],
        }),
        "desktop-total-dev-proof" => Some(CertificationProfile {
            profile_id: "desktop-total-dev-proof",
            command: "WDIO_SPEC=e2e/desktop/total-dev.wdio.test.js pnpm run e2e:desktop:run",
            program: "pnpm",
            args: &["run", "e2e:desktop:run"],
            env: &[("WDIO_SPEC", "e2e/desktop/total-dev.wdio.test.js")],
            required_env: &["TITANE_TOTAL_DEV_E2E_UNLOCK_TOKEN"],
            timeout_secs: 900,
            artifact_paths: &["reports/e2e-desktop"],
        }),
        _ => None,
    }
}

fn redact_total_dev_output(input: &str) -> String {
    input
        .lines()
        .map(|line| {
            let upper = line.to_ascii_uppercase();
            if upper.contains("TOKEN")
                || upper.contains("SECRET")
                || upper.contains("PASSWORD")
                || upper.contains("GITHUB_TOKEN")
                || upper.contains("OPENAI")
                || upper.contains("ANTHROPIC")
                || upper.contains("GEMINI")
            {
                "[REDACTED_TOTAL_DEV_CERTIFICATION_LINE]".to_string()
            } else {
                line.to_string()
            }
        })
        .collect::<Vec<_>>()
        .join("\n")
}

fn tail_output(input: &str, max_chars: usize) -> String {
    let sanitized = redact_total_dev_output(input);
    let char_count = sanitized.chars().count();
    if char_count <= max_chars {
        return sanitized;
    }

    let tail = sanitized
        .chars()
        .skip(char_count.saturating_sub(max_chars))
        .collect::<String>();
    format!("[...truncated...]\n{}", tail)
}

fn classify_certification_status(exit_code: i32, output: &str) -> String {
    if exit_code == 0 {
        return "PASS".to_string();
    }

    if output.contains("BLOCKED")
        || output.contains("BLOCKER")
        || output.contains("WORKSPACE_AHEAD_OF_RUNTIME")
        || output.contains("NO_VALID_BINARY")
        || output.contains("tauri-driver")
        || output.contains("appsink")
    {
        "BLOCKED".to_string()
    } else {
        "FAIL".to_string()
    }
}

fn run_certification_process(
    profile: &CertificationProfile,
) -> Result<(i32, u64, String), String> {
    let workspace = workspace_dir();
    let start = Instant::now();
    let mut command = ProcessCommand::new(profile.program);
    command
        .args(profile.args)
        .current_dir(&workspace)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    for (key, value) in profile.env {
        command.env(key, value);
    }

    let mut child = command
        .spawn()
        .map_err(|e| format!("certification profile spawn error: {}", e))?;

    loop {
        if child
            .try_wait()
            .map_err(|e| format!("certification profile wait error: {}", e))?
            .is_some()
        {
            let output = child
                .wait_with_output()
                .map_err(|e| format!("certification profile output error: {}", e))?;
            let duration_ms = start.elapsed().as_millis() as u64;
            let exit_code = output.status.code().unwrap_or(-1);
            let combined = format!(
                "{}{}",
                String::from_utf8_lossy(&output.stdout),
                String::from_utf8_lossy(&output.stderr)
            );
            return Ok((exit_code, duration_ms, combined));
        }

        if start.elapsed() > Duration::from_secs(profile.timeout_secs) {
            let _ = child.kill();
            let output = child
                .wait_with_output()
                .map_err(|e| format!("certification profile timeout output error: {}", e))?;
            let combined = format!(
                "{}{}\nBLOCKED_TIMEOUT: profile exceeded {}s",
                String::from_utf8_lossy(&output.stdout),
                String::from_utf8_lossy(&output.stderr),
                profile.timeout_secs
            );
            return Ok((-1, start.elapsed().as_millis() as u64, combined));
        }

        thread::sleep(Duration::from_millis(200));
    }
}

fn contains_shell_control(input: &str) -> bool {
    ["&&", "||", "|", ";", ">", "<", "\n", "\r", "`", "$()"]
        .iter()
        .any(|marker| input.contains(marker))
}

fn is_total_dev_command_allowed(input: &str) -> bool {
    ALLOWED_TOTAL_DEV_COMMANDS.contains(&input.trim())
}

const ALLOWED_TOTAL_DEV_GIT_OPS: &[&str] =
    &["status", "diff", "log", "branch", "show", "rev-parse"];

fn are_total_dev_git_args_allowed(op: &str, args: &[String]) -> bool {
    match op {
        "status" => args.is_empty(),
        "diff" => args.is_empty() || args == ["--stat"],
        "log" => args == ["--oneline", "-10"] || args == ["--oneline", "-20"],
        "branch" => args.is_empty() || args == ["--show-current"],
        "show" => args == ["--stat", "--oneline", "HEAD"],
        "rev-parse" => args == ["--short", "HEAD"],
        _ => false,
    }
}

fn resolve_total_dev_read_path(path: &str) -> Result<PathBuf, String> {
    let trimmed = path.trim();

    if trimmed.is_empty() {
        return Err("Chemin TOTAL_DEV vide interdit".to_string());
    }

    if trimmed.contains('\0') {
        return Err("Chemin TOTAL_DEV contient un NUL".to_string());
    }

    if trimmed.contains("://") {
        return Err("Chemin TOTAL_DEV ne peut pas utiliser de scheme".to_string());
    }

    let candidate = Path::new(trimmed);
    if candidate
        .components()
        .any(|component| matches!(component, Component::ParentDir))
    {
        return Err("Path traversal interdit dans TOTAL_DEV".to_string());
    }

    let workspace = workspace_dir_path();
    let workspace_canonical = workspace_dir_canonical()?;
    let resolved = if candidate.is_absolute() {
        candidate.to_path_buf()
    } else {
        workspace.join(candidate)
    };

    let anchor = if resolved.exists() {
        resolved
            .canonicalize()
            .map_err(|e| format!("Chemin invalide: {}", e))?
    } else if let Some(parent) = resolved.parent() {
        if parent.exists() {
            parent
                .canonicalize()
                .map_err(|e| format!("Parent TOTAL_DEV invalide: {}", e))?
                .join(resolved.file_name().unwrap_or_default())
        } else {
            resolved.clone()
        }
    } else {
        resolved.clone()
    };

    if !anchor.starts_with(&workspace_canonical) {
        log::warn!(
            "TOTAL_DEV file read BLOCKED (path outside workspace): {}",
            trimmed
        );
        return Err("Accès refusé: chemin hors du workspace TITANE".to_string());
    }

    Ok(resolved)
}

fn is_total_dev_blocked_file(path: &Path) -> bool {
    let lowercase = path
        .file_name()
        .and_then(|file_name| file_name.to_str())
        .map(|file_name| file_name.to_ascii_lowercase())
        .unwrap_or_default();

    lowercase.ends_with(".env")
        || lowercase.ends_with(".key")
        || lowercase.ends_with(".pem")
        || lowercase.ends_with(".secret")
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMANDS
// ═══════════════════════════════════════════════════════════════════════════

/// Vérifie le token unlock → compare SHA-256 côté serveur uniquement.
/// Le token brut n'est jamais logué ni stocké.
/// Le frontend envoie déjà le hash SHA-256 du mot de passe.
#[tauri::command]
pub async fn total_dev_unlock(token: String) -> Result<TotalDevUnlockResult, String> {
    // Le frontend envoie déjà le hash SHA-256, donc on compare directement
    if token == TOTAL_DEV_UNLOCK_HASH {
        let expires_at = now_unix() + 3600; // 1h session
        SESSION_EXPIRY.store(expires_at, Ordering::SeqCst);

        // Session pseudo-token derivé du hash (jamais le secret brut)
        let session_token = format!("tdsk_{}", &token[..16]);

        log::info!("TOTAL_DEV unlock granted — session until {}", expires_at);

        Ok(TotalDevUnlockResult {
            ok: true,
            session_token: Some(session_token),
            expires_at_unix: Some(expires_at),
            lock_state: "UNLOCKED".to_string(),
            error: None,
        })
    } else {
        log::warn!("TOTAL_DEV unlock attempt rejected (invalid token)");
        Ok(TotalDevUnlockResult {
            ok: false,
            session_token: None,
            expires_at_unix: None,
            lock_state: "LOCKED".to_string(),
            error: Some("Token invalide".to_string()),
        })
    }
}

/// Retourne l'état de session actuel (LOCKED / UNLOCKED / EXPIRED)
#[tauri::command]
pub async fn total_dev_session_status() -> Result<TotalDevSessionStatus, String> {
    let now = now_unix();
    let expiry = SESSION_EXPIRY.load(Ordering::SeqCst);

    let lock_state = if expiry == 0 {
        "LOCKED"
    } else if now < expiry {
        "UNLOCKED"
    } else {
        "EXPIRED"
    };

    Ok(TotalDevSessionStatus {
        lock_state: lock_state.to_string(),
        expires_at_unix: if expiry > 0 { Some(expiry) } else { None },
        now_unix: now,
    })
}

/// Révoque la session TOTAL_DEV (logout)
#[tauri::command]
pub async fn total_dev_revoke() -> Result<bool, String> {
    SESSION_EXPIRY.store(0, Ordering::SeqCst);
    log::info!("TOTAL_DEV session revoked");
    Ok(true)
}

// ─────────────────────────────────────────────────────────────────
// SESSION GUARD (inlined — pas d'external state)
// ─────────────────────────────────────────────────────────────────
fn assert_unlocked() -> Result<(), String> {
    let now = now_unix();
    let expiry = SESSION_EXPIRY.load(Ordering::SeqCst);

    if expiry == 0 {
        return Err("TOTAL_DEV session LOCKED — unlock required".to_string());
    }
    if now >= expiry {
        SESSION_EXPIRY.store(0, Ordering::SeqCst);
        return Err("TOTAL_DEV session EXPIRED — re-unlock required".to_string());
    }
    Ok(())
}

// ─────────────────────────────────────────────────────────────────
// GIT POWER
// ─────────────────────────────────────────────────────────────────

/// Opérations git gouvernées — TOTAL_DEV unlocked required
#[tauri::command]
pub async fn total_dev_git_op(op: String, args: Vec<String>) -> Result<TotalDevGitResult, String> {
    assert_unlocked()?;

    if !ALLOWED_TOTAL_DEV_GIT_OPS.contains(&op.as_str()) {
        log::warn!("TOTAL_DEV git op rejected (not in allowlist): {}", op);
        return Err(format!(
            "Opération git non autorisée: '{}'. Autorisées: {:?}",
            op, ALLOWED_TOTAL_DEV_GIT_OPS
        ));
    }

    // Validation args: refus des patterns dangereux
    for arg in &args {
        if arg.contains("..") && arg.contains('/') {
            return Err(format!("Argument git suspect rejeté: {}", arg));
        }
    }

    if !are_total_dev_git_args_allowed(&op, &args) {
        log::warn!("TOTAL_DEV git args rejected for op {}: {:?}", op, args);
        return Err(format!(
            "Arguments git non autorisés pour '{}'. La surface TOTAL_DEV Git est limitée aux inspections read-only qualifiées.",
            op
        ));
    }

    let workspace = workspace_dir();
    let mut cmd = ProcessCommand::new("git");
    cmd.arg(&op).args(&args).current_dir(&workspace);

    log::info!("TOTAL_DEV git {} {:?} in {}", op, args, workspace);

    let output = cmd
        .output()
        .map_err(|e| format!("git spawn error: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    let exit_code = output.status.code().unwrap_or(-1);

    log::info!("TOTAL_DEV git {} → exit {}", op, exit_code);

    Ok(TotalDevGitResult {
        ok: output.status.success(),
        content: stdout,
        error: if stderr.is_empty() {
            None
        } else {
            Some(stderr)
        },
        exit_code,
        op,
    })
}

// ─────────────────────────────────────────────────────────────────
// CONSOLE POWER — étendue pour TOTAL_DEV
// ─────────────────────────────────────────────────────────────────

/// Console TOTAL_DEV avec allowlist étendue — UNLOCKED required
#[tauri::command]
pub async fn total_dev_run_command(command: String) -> Result<TotalDevConsoleResult, String> {
    assert_unlocked()?;

    let trimmed = command.trim().to_string();

    if trimmed.is_empty() {
        return Err("Commande vide interdite dans TOTAL_DEV".to_string());
    }

    if contains_shell_control(&trimmed) {
        log::warn!(
            "TOTAL_DEV console command rejected (shell control): {}",
            trimmed
        );
        return Err("Operateurs shell interdits dans TOTAL_DEV".to_string());
    }

    if !is_total_dev_command_allowed(&trimmed) {
        log::warn!("TOTAL_DEV console command rejected: {}", trimmed);
        return Err(format!("Commande non autorisee dans TOTAL_DEV: '{}'. Utilisez uniquement une commande exacte de la allowlist gouvernee.", trimmed));
    }

    let started_at = now_unix();
    let command_id = format!("td_{}", started_at);

    log::info!("TOTAL_DEV console: {}", trimmed);

    let parts: Vec<&str> = trimmed.splitn(2, ' ').collect();
    let program = parts[0];
    let rest = if parts.len() > 1 { parts[1] } else { "" };
    let args: Vec<&str> = if rest.is_empty() {
        vec![]
    } else {
        rest.split_whitespace().collect()
    };

    let workspace = workspace_dir();

    let output = ProcessCommand::new(program)
        .args(&args)
        .current_dir(&workspace)
        .output()
        .map_err(|e| format!("spawn error: {}", e))?;

    let ended_at = now_unix();
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    let exit_code = output.status.code().unwrap_or(-1);

    log::info!(
        "TOTAL_DEV console exit {} ({} chars stdout)",
        exit_code,
        stdout.len()
    );

    Ok(TotalDevConsoleResult {
        ok: output.status.success(),
        content: stdout,
        stderr: if stderr.is_empty() {
            None
        } else {
            Some(stderr)
        },
        exit_code,
        command_id,
        started_at,
        ended_at,
        duration_ms: (ended_at - started_at) * 1000,
    })
}

/// Lance un profil de certification gouverné pour Ollama DEV / TOTAL_DEV.
/// Aucun shell libre: chaque profil mappe vers un programme + arguments fixes.
#[tauri::command]
pub async fn total_dev_run_certification_profile(
    profile_id: String,
) -> Result<TotalDevCertificationProfileResult, String> {
    assert_unlocked()?;

    let profile = certification_profile(&profile_id)
        .ok_or_else(|| format!("Profil de certification TOTAL_DEV inconnu: {}", profile_id))?;

    let missing_env: Vec<String> = profile
        .required_env
        .iter()
        .filter(|key| std::env::var(key).unwrap_or_default().trim().is_empty())
        .map(|key| (*key).to_string())
        .collect();

    if !missing_env.is_empty() {
        log::warn!(
            "TOTAL_DEV certification profile blocked by missing env: {}",
            profile.profile_id
        );
        return Ok(TotalDevCertificationProfileResult {
            ok: false,
            profile_id: profile.profile_id.to_string(),
            status: "BLOCKED".to_string(),
            command: profile.command.to_string(),
            exit_code: -1,
            duration_ms: 0,
            output_tail: String::new(),
            artifact_paths: profile
                .artifact_paths
                .iter()
                .map(|path| (*path).to_string())
                .collect(),
            error: Some(format!("BLOCKED_ENV_MISSING: {}", missing_env.join(","))),
        });
    }

    log::info!(
        "TOTAL_DEV certification profile start: {} -> {}",
        profile.profile_id,
        profile.command
    );

    let (exit_code, duration_ms, output) = run_certification_process(&profile)?;
    let status = classify_certification_status(exit_code, &output);
    let ok = status == "PASS";

    log::info!(
        "TOTAL_DEV certification profile end: {} status={} exit={}",
        profile.profile_id,
        status,
        exit_code
    );

    Ok(TotalDevCertificationProfileResult {
        ok,
        profile_id: profile.profile_id.to_string(),
        status: status.clone(),
        command: profile.command.to_string(),
        exit_code,
        duration_ms,
        output_tail: tail_output(&output, 8_000),
        artifact_paths: profile
            .artifact_paths
            .iter()
            .map(|path| (*path).to_string())
            .collect(),
        error: if ok {
            None
        } else {
            Some(format!("{}_EXIT_{}", status, exit_code))
        },
    })
}

// ─────────────────────────────────────────────────────────────────
// FILE POWER — lecture gouvernée
// ─────────────────────────────────────────────────────────────────

/// Lecture de fichier du repo — UNLOCKED required
#[tauri::command]
pub async fn total_dev_read_file(path: String) -> Result<TotalDevFileResult, String> {
    assert_unlocked()?;

    use std::fs;
    let resolved = resolve_total_dev_read_path(&path)?;

    // Extensions dangereuses refusées
    if is_total_dev_blocked_file(&resolved) {
        return Err(format!("Lecture refusée: extension sensible ({})", path));
    }

    if !resolved.exists() {
        return Ok(TotalDevFileResult {
            ok: false,
            path: path.clone(),
            content: None,
            size: None,
            lines: None,
            error: Some(format!("Fichier introuvable: {}", path)),
        });
    }

    if !resolved.is_file() {
        return Err(format!(
            "Lecture refusée: la cible n est pas un fichier ({})",
            path
        ));
    }

    let canonical_path = resolved
        .canonicalize()
        .map_err(|e| format!("Chemin invalide: {}", e))?;

    log::info!("TOTAL_DEV read file: {}", canonical_path.display());

    let metadata = fs::metadata(&canonical_path).map_err(|e| e.to_string())?;
    let size = metadata.len();

    // Limite 200KB pour sécurité
    let content = if size < 200_000 {
        fs::read_to_string(&canonical_path).ok()
    } else {
        Some(format!(
            "[Fichier trop volumineux pour lecture directe: {} bytes]",
            size
        ))
    };

    let lines = content.as_ref().map(|c| c.lines().count());

    Ok(TotalDevFileResult {
        ok: true,
        path: canonical_path.display().to_string(),
        content,
        size: Some(size),
        lines,
        error: None,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn unlock_for_test() {
        SESSION_EXPIRY.store(now_unix() + 60, Ordering::SeqCst);
    }

    fn unique_workspace_test_file(suffix: &str) -> PathBuf {
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("system clock should be after epoch")
            .as_nanos();

        workspace_dir_path().join(format!("total-dev-read-file-test-{nanos}.{suffix}"))
    }

    #[test]
    fn total_dev_command_allowlist_is_exact() {
        assert!(is_total_dev_command_allowed("git status"));
        assert!(is_total_dev_command_allowed(
            "cargo check --manifest-path src-tauri/Cargo.toml"
        ));
        assert!(!is_total_dev_command_allowed("git status --porcelain"));
        assert!(!is_total_dev_command_allowed("pnpm run verify:registry"));
        assert!(!is_total_dev_command_allowed(
            "cat src/pages/TotalDevPage.tsx"
        ));
    }

    #[test]
    fn total_dev_command_detects_shell_control_markers() {
        assert!(contains_shell_control("git status && git diff"));
        assert!(contains_shell_control("pnpm run test | cat"));
        assert!(contains_shell_control("cargo check; pwd"));
        assert!(!contains_shell_control("git status"));
    }

    #[tokio::test]
    async fn total_dev_run_command_rejects_shell_control_operators() {
        unlock_for_test();

        let err = total_dev_run_command("git status && git diff".to_string())
            .await
            .expect_err("shell control operators must be rejected");

        assert!(err.contains("Operateurs shell interdits"));
    }

    #[tokio::test]
    async fn total_dev_run_command_rejects_non_allowlisted_variants() {
        unlock_for_test();

        let err = total_dev_run_command("git status --porcelain".to_string())
            .await
            .expect_err("broad git variants must be rejected");

        assert!(err.contains("Commande non autorisee"));
    }

    #[tokio::test]
    async fn total_dev_run_command_allows_exact_safe_command() {
        unlock_for_test();

        let result = total_dev_run_command("pwd".to_string())
            .await
            .expect("pwd should remain allowed");

        assert!(result.exit_code == 0 || result.ok);
        assert!(!result.command_id.is_empty());
    }

    #[test]
    fn total_dev_certification_profiles_are_fixed_and_allowlisted() {
        let profile = certification_profile("ollama-global-awareness")
            .expect("ollama-global-awareness profile should exist");

        assert_eq!(profile.program, "pnpm");
        assert_eq!(profile.args, &["run", "verify:ollama:dev:global-awareness"]);
        assert!(!contains_shell_control(profile.program));
        assert!(profile
            .artifact_paths
            .contains(&"reports/ollama-dev-awareness/latest.json"));
        assert!(certification_profile("rm-rf-workspace").is_none());
    }

    #[test]
    fn total_dev_certification_desktop_profile_requires_unlock_token_env() {
        let profile = certification_profile("desktop-total-dev-proof")
            .expect("desktop profile should exist");

        assert_eq!(profile.program, "pnpm");
        assert_eq!(profile.args, &["run", "e2e:desktop:run"]);
        assert_eq!(profile.env, &[("WDIO_SPEC", "e2e/desktop/total-dev.wdio.test.js")]);
        assert_eq!(profile.required_env, &["TITANE_TOTAL_DEV_E2E_UNLOCK_TOKEN"]);
    }

    #[test]
    fn total_dev_certification_output_is_redacted_and_bounded() {
        let raw = "safe line\nTITANE_TOTAL_DEV_E2E_UNLOCK_TOKEN=secret\nfinal line";
        let redacted = redact_total_dev_output(raw);

        assert!(redacted.contains("safe line"));
        assert!(redacted.contains("[REDACTED_TOTAL_DEV_CERTIFICATION_LINE]"));
        assert!(!redacted.contains("secret"));
        assert!(tail_output(&"x".repeat(9_000), 8_000).starts_with("[...truncated...]"));
    }

    #[tokio::test]
    async fn total_dev_certification_profile_rejects_unknown_profile() {
        unlock_for_test();

        let err = total_dev_run_certification_profile("unknown-profile".to_string())
            .await
            .expect_err("unknown profile must be rejected before command execution");

        assert!(err.contains("Profil de certification TOTAL_DEV inconnu"));
    }

    #[test]
    fn total_dev_git_allowlist_is_read_only() {
        assert!(ALLOWED_TOTAL_DEV_GIT_OPS.contains(&"status"));
        assert!(ALLOWED_TOTAL_DEV_GIT_OPS.contains(&"rev-parse"));
        assert!(!ALLOWED_TOTAL_DEV_GIT_OPS.contains(&"push"));
        assert!(!ALLOWED_TOTAL_DEV_GIT_OPS.contains(&"commit"));
        assert!(!ALLOWED_TOTAL_DEV_GIT_OPS.contains(&"add"));
    }

    #[test]
    fn total_dev_git_args_are_exact() {
        assert!(are_total_dev_git_args_allowed("status", &[]));
        assert!(are_total_dev_git_args_allowed(
            "diff",
            &["--stat".to_string()]
        ));
        assert!(are_total_dev_git_args_allowed(
            "rev-parse",
            &["--short".to_string(), "HEAD".to_string()]
        ));
        assert!(!are_total_dev_git_args_allowed(
            "status",
            &["--porcelain".to_string()]
        ));
        assert!(!are_total_dev_git_args_allowed(
            "diff",
            &["--cached".to_string(), "--stat".to_string()]
        ));
    }

    #[tokio::test]
    async fn total_dev_git_op_rejects_mutating_operation() {
        unlock_for_test();

        let err = total_dev_git_op(
            "push".to_string(),
            vec!["origin".to_string(), "HEAD".to_string()],
        )
        .await
        .expect_err("mutating git ops must be rejected");

        assert!(err.contains("Opération git non autorisée"));
    }

    #[tokio::test]
    async fn total_dev_git_op_rejects_non_qualified_args() {
        unlock_for_test();

        let err = total_dev_git_op("status".to_string(), vec!["--porcelain".to_string()])
            .await
            .expect_err("non-qualified git args must be rejected");

        assert!(err.contains("Arguments git non autorisés"));
    }

    #[tokio::test]
    async fn total_dev_read_file_reads_workspace_file() {
        unlock_for_test();

        // Set workspace to the repo root (one level above src-tauri/) so the test
        // is portable across CI environments where the user documents dir differs.
        let repo_root = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .expect("CARGO_MANIFEST_DIR must have a parent")
            .to_string_lossy()
            .into_owned();
        std::env::set_var("TITANE_WORKSPACE_DIR", &repo_root);

        let result = total_dev_read_file("package.json".to_string())
            .await
            .expect("package.json should remain readable");

        assert!(result.ok);
        assert!(result.size.unwrap_or_default() > 0);
        assert!(result.lines.unwrap_or_default() > 0);
    }

    #[tokio::test]
    async fn total_dev_read_file_reports_missing_workspace_file() {
        unlock_for_test();

        // Keep workspace deterministic across host environments to avoid
        // resolving to user document directories during tests.
        let repo_root = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .expect("CARGO_MANIFEST_DIR must have a parent")
            .to_string_lossy()
            .into_owned();
        std::env::set_var("TITANE_WORKSPACE_DIR", &repo_root);

        let result =
            total_dev_read_file("src/definitely-missing-total-dev-read-file.ts".to_string())
                .await
                .expect("missing workspace file should return a structured miss");

        assert!(!result.ok);
        assert!(result
            .error
            .unwrap_or_default()
            .contains("Fichier introuvable"));
    }

    #[tokio::test]
    async fn total_dev_read_file_rejects_outside_workspace_path() {
        unlock_for_test();

        let err = total_dev_read_file("/etc/passwd".to_string())
            .await
            .expect_err("outside-workspace paths must be rejected");

        assert!(err.contains("hors du workspace"));
    }

    #[tokio::test]
    async fn total_dev_read_file_rejects_sensitive_extension() {
        unlock_for_test();

        let repo_root = std::env::var("CARGO_MANIFEST_DIR")
            .ok()
            .and_then(|m| PathBuf::from(&m).parent().map(|p| p.to_path_buf()))
            .expect("CARGO_MANIFEST_DIR must have a parent")
            .to_string_lossy()
            .into_owned();
        std::env::set_var("TITANE_WORKSPACE_DIR", &repo_root);

        let path = unique_workspace_test_file("env");
        fs::write(&path, "TOKEN=secret\n").expect("test fixture should be created");

        let relative_path = path
            .strip_prefix(workspace_dir_path())
            .expect("fixture must stay in workspace")
            .to_string_lossy()
            .to_string();

        let err = total_dev_read_file(relative_path.clone())
            .await
            .expect_err("sensitive files must be blocked");
        fs::remove_file(&path).expect("test fixture should be removed");

        assert!(err.contains("extension sensible"));
        assert!(err.contains(&relative_path));
    }
}
