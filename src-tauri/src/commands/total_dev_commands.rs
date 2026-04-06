// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v29.0.0 — TOTAL_DEV BACKEND COMMANDS
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
use std::process::Command as ProcessCommand;
use std::sync::atomic::{AtomicU64, Ordering};

// ─────────────────────────────────────────────────────────────────
// SHA-256 hash of the super-admin unlock token.
// Stored in Rust code only (never in frontend, logs, or config).
// Never decode, print, or share this constant value.
// ─────────────────────────────────────────────────────────────────
const TOTAL_DEV_UNLOCK_HASH: &str =
    "895d3d67cc9d3b3698b59e35818c7ac9f06c3fe710c48e69a80908ca5ad999a8";

/// Monotonic session counter — reset on restart (in-process only)
static SESSION_EXPIRY: AtomicU64 = AtomicU64::new(0);

fn workspace_dir() -> String {
    std::env::var("TITANE_WORKSPACE_DIR")
        .unwrap_or_else(|_| "/home/titane-os/Documents/GitHub/TITANE_INFINITY".to_string())
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
pub async fn total_dev_git_op(
    op: String,
    args: Vec<String>,
) -> Result<TotalDevGitResult, String> {
    assert_unlocked()?;

    // Allowlist stricte des opérations git autorisées
    const ALLOWED_GIT_OPS: &[&str] = &[
        "status", "diff", "log", "add", "restore", "commit", "push",
        "branch", "stash", "show", "rev-parse", "fetch",
    ];

    if !ALLOWED_GIT_OPS.contains(&op.as_str()) {
        log::warn!("TOTAL_DEV git op rejected (not in allowlist): {}", op);
        return Err(format!("Opération git non autorisée: '{}'. Autorisées: {:?}", op, ALLOWED_GIT_OPS));
    }

    // Validation args: refus des patterns dangereux
    for arg in &args {
        if arg.contains("..") && arg.contains('/') {
            return Err(format!("Argument git suspect rejeté: {}", arg));
        }
    }

    let workspace = workspace_dir();
    let mut cmd = ProcessCommand::new("git");
    cmd.arg(&op).args(&args).current_dir(&workspace);

    log::info!("TOTAL_DEV git {} {:?} in {}", op, args, workspace);

    let output = cmd.output().map_err(|e| format!("git spawn error: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    let exit_code = output.status.code().unwrap_or(-1);

    log::info!("TOTAL_DEV git {} → exit {}", op, exit_code);

    Ok(TotalDevGitResult {
        ok: output.status.success(),
        content: stdout,
        error: if stderr.is_empty() { None } else { Some(stderr) },
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

    // Allowlist étendue TOTAL_DEV (vs devops_run limité)
    const ALLOWED_COMMANDS: &[&str] = &[
        // Navigation
        "pwd", "ls", "ls -la", "ls -lah",
        // Git (via git op)
        "git status", "git diff", "git log --oneline -10", "git log --oneline -20",
        "git branch", "git rev-parse --short HEAD",
        // Node/pnpm
        "node -v", "pnpm -v", "pnpm run build", "pnpm run test",
        "pnpm run lint", "pnpm run check", "pnpm run format:check",
        "pnpm run test:100", "pnpm run test:rust", "pnpm run verify",
        "pnpm run verify:tauri-only", "pnpm run verify:invariants-governed",
        // Cargo/Rust
        "cargo -V", "rustc -V", "cargo check", "cargo build", "cargo clippy",
        "cargo test --manifest-path src-tauri/Cargo.toml",
        // E2E
        "pnpm run e2e:desktop", "pnpm run e2e:desktop:run",
        // System info
        "uname -a", "free -h", "df -h",
        // Tauri
        "pnpm run build:tauri:e2e", "pnpm run build:production",
    ];

    let trimmed = command.trim().to_string();

    // Vérifier si commande dans allowlist OU commence par un préfixe autorisé
    let allowed_prefixes = ["git ", "cargo ", "pnpm run ", "node ", "ls ", "cat src", "cat src-tauri"];

    let is_allowed = ALLOWED_COMMANDS.contains(&trimmed.as_str())
        || allowed_prefixes.iter().any(|p| trimmed.starts_with(p));

    if !is_allowed {
        log::warn!("TOTAL_DEV console command rejected: {}", trimmed);
        return Err(format!("Commande non autorisée dans TOTAL_DEV: '{}'\nUtilisez des commandes de dev valides (pnpm, cargo, git, node, ls, cat).", trimmed));
    }

    let started_at = now_unix();
    let command_id = format!("td_{}", started_at);

    log::info!("TOTAL_DEV console: {}", trimmed);

    let parts: Vec<&str> = trimmed.splitn(2, ' ').collect();
    let program = parts[0];
    let rest = if parts.len() > 1 { parts[1] } else { "" };
    let args: Vec<&str> = if rest.is_empty() { vec![] } else { rest.split_whitespace().collect() };

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

    log::info!("TOTAL_DEV console exit {} ({} chars stdout)", exit_code, stdout.len());

    Ok(TotalDevConsoleResult {
        ok: output.status.success(),
        content: stdout,
        stderr: if stderr.is_empty() { None } else { Some(stderr) },
        exit_code,
        command_id,
        started_at,
        ended_at,
        duration_ms: (ended_at - started_at) * 1000,
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
    use std::path::Path;

    let workspace = workspace_dir();

    // Empêcher path traversal hors workspace
    let resolved = if path.starts_with('/') {
        path.clone()
    } else {
        format!("{}/{}", workspace, path)
    };

    // Vérification qu'on reste dans le workspace
    let canonical_path = Path::new(&resolved)
        .canonicalize()
        .map_err(|e| format!("Chemin invalide: {}", e))?;
    let canonical_workspace = Path::new(&workspace)
        .canonicalize()
        .unwrap_or_else(|_| Path::new(&workspace).to_path_buf());

    if !canonical_path.starts_with(&canonical_workspace) {
        log::warn!("TOTAL_DEV file read BLOCKED (path outside workspace): {}", resolved);
        return Err("Accès refusé: chemin hors du workspace TITANE".to_string());
    }

    // Extensions dangereuses refusées
    let blocked_ext = [".key", ".pem", ".env", ".secret"];
    if blocked_ext.iter().any(|e| path.ends_with(e)) {
        return Err(format!("Lecture refusée: extension sensible ({})", path));
    }

    log::info!("TOTAL_DEV read file: {}", canonical_path.display());

    if !canonical_path.exists() {
        return Ok(TotalDevFileResult {
            ok: false,
            path: path.clone(),
            content: None,
            size: None,
            lines: None,
            error: Some(format!("Fichier introuvable: {}", path)),
        });
    }

    let metadata = fs::metadata(&canonical_path).map_err(|e| e.to_string())?;
    let size = metadata.len();

    // Limite 200KB pour sécurité
    let content = if size < 200_000 {
        fs::read_to_string(&canonical_path).ok()
    } else {
        Some(format!("[Fichier trop volumineux pour lecture directe: {} bytes]", size))
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
