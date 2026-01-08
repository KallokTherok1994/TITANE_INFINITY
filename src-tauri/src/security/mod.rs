// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v19.3 — SECURITY MODULE
//   Production-grade security: Rate Limiting, Audit Logging, Encryption
//   Super-Prompts H, I, J, K, L integration + Global Hardening
// ═══════════════════════════════════════════════════════════════

pub mod secrets_engine;
pub mod shell_guard;
pub mod storage_guard;

// Super-Prompts H, J, K, L modules
pub mod encryption;
pub mod hardening; // Global hardening self-test
pub mod permission_guard;
pub mod permissions;
pub mod pre_boot_validation;
pub mod sandbox;
pub mod validation;
pub mod vault_engine; // v∞ J3 - Memory Vault Layer

// v19.3 Production Security
pub mod audit; // Structured audit logging
pub mod commands; // Tauri commands for security
pub mod csp;
pub mod rate_limit; // Production-grade rate limiting // Content Security Policy

pub use audit::{AuditEvent, AuditEventType, AuditLogger, AuditSeverity};
use encryption::Encryptor;
pub use rate_limit::{RateLimitStats, RateLimiter};

use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Domaines de sécurité TITANE∞
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum SecurityDomain {
    /// Cœurs internes (Helios/Nexus/Harmonia/Sentinel/Memory)
    CoreInternal,
    /// Moteur d'auto-évolution/réparation
    EngineSubsystem,
    /// Services IO (storage, network)
    IoServices,
    /// Exécution externe (shell, process)
    ExternalExecution,
    /// API Tauri (frontend → backend)
    TauriApi,
    /// Fichiers utilisateur (mémoire, snapshots, logs)
    UserData,
}

/// Niveaux de confiance
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum TrustLevel {
    /// Opération interne sûre
    Trusted = 3,
    /// Opération validée
    Validated = 2,
    /// Input utilisateur/externe
    Untrusted = 1,
    /// Interdit par défaut
    Forbidden = 0,
}

/// Classes d'opérations sensibles
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum OperationClass {
    /// Lecture fichier
    FileRead,
    /// Écriture fichier
    FileWrite,
    /// Exécution commande
    ShellExecute,
    /// Réseau sortant
    NetworkOut,
    /// Modification état système
    SystemMutation,
}

/// Politique de sécurité TITANE∞
#[derive(Debug, Clone)]
pub struct SecurityPolicy {
    /// Sandbox FS actif
    pub fs_sandbox_enabled: bool,
    /// Root autorisée pour les données
    pub allowed_data_root: PathBuf,
    /// Commandes shell autorisées (whitelist)
    pub allowed_shell_commands: Vec<String>,
    /// Logging sécurité activé
    pub security_logging: bool,
    /// Mode strict Sentinel
    pub sentinel_strict_mode: bool,
}

impl Default for SecurityPolicy {
    fn default() -> Self {
        Self {
            fs_sandbox_enabled: true,
            allowed_data_root: std::env::var("TITANE_DATA_ROOT")
                .unwrap_or_else(|_| {
                    dirs::data_local_dir()
                        .unwrap_or_else(|| PathBuf::from("."))
                        .join("titane-infinity")
                        .to_string_lossy()
                        .to_string()
                })
                .into(),
            allowed_shell_commands: vec![
                // TTS engines
                "espeak".into(),
                "espeak-ng".into(), // v19.1.0: Enhanced eSpeak version
                "festival".into(),
                "piper".into(),
                "whisper".into(),
                // Audio players - Linux
                "pactl".into(),  // PulseAudio/PipeWire control
                "aplay".into(),  // v19.1.0: ALSA player
                "ffplay".into(), // v19.1.0: FFmpeg player (universal)
                // Audio players - macOS
                "afplay".into(), // v19.1.0: macOS native audio player
                // AI/ML engines
                "ollama".into(), // v26.2.3: Ollama AI local inference
                // NOTE: curl removed for security (not used in production, potential attack vector)
                // Utilities
                "which".into(), // Command detection
            ],
            security_logging: true,
            sentinel_strict_mode: false, // Désactivé par défaut pour ne pas bloquer dev
        }
    }
}

/// Événement de sécurité
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityEvent {
    pub timestamp: u64,
    pub domain: SecurityDomain,
    pub severity: Severity,
    pub operation: OperationClass,
    pub target: String,
    pub message: String,
    pub details: Option<String>,
    pub blocked: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum Severity {
    Info,
    Warning,
    Error,
    Critical,
}

#[derive(Debug, thiserror::Error)]
pub enum SecurityViolation {
    #[error("Unauthorized command: {0}")]
    UnauthorizedCommand(String),

    #[error("Path traversal attempt detected")]
    PathTraversal,

    #[error("Path outside sandbox")]
    OutsideSandbox,

    #[error("Invalid path")]
    InvalidPath,

    #[error("Operation forbidden: {0}")]
    Forbidden(String),

    #[error("Invalid command: {0}")]
    InvalidCommand(String),

    #[error("Dangerous argument: {0}")]
    DangerousArgument(String),
}

#[allow(dead_code)]
fn get_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_else(|_| std::time::Duration::from_secs(0))
        .as_secs()
}

use crate::error::TitaneResult;
pub use validation::InputValidator;

pub struct SecurityManager {
    validator: InputValidator,
    rate_limiter: RateLimiter,
    audit_logger: AuditLogger,
    encryptor: Option<Encryptor>,
}

impl SecurityManager {
    pub fn new(audit_log_path: std::path::PathBuf) -> Self {
        Self {
            validator: InputValidator::default(),
            rate_limiter: RateLimiter::new(100, 60),
            audit_logger: AuditLogger::new(audit_log_path),
            encryptor: None,
        }
    }

    pub async fn validate_and_rate_limit(&self, user_id: &str, message: &str) -> TitaneResult<()> {
        self.rate_limiter.check(user_id).await?;
        self.validator.validate_message(message)?;
        Ok(())
    }
}
