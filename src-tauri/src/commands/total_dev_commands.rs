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
