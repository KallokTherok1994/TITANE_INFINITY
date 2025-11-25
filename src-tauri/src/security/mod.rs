// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — SECURITY MODULE
//   Super-Prompts H, I, J, K, L integration
//   Hardening, Permissions, Encryption, Validation, Sandbox
// ═══════════════════════════════════════════════════════════════

pub mod shell_guard;
pub mod storage_guard;

// Super-Prompts H, J, K, L modules
pub mod encryption;
pub mod permission_guard;
pub mod permissions;
pub mod pre_boot_validation;
pub mod sandbox;
pub mod validation;
pub mod vault_engine; // ✅ v∞ J3 - Memory Vault Layer

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
                "espeak".into(),
                "festival".into(),
                "piper".into(),
                "whisper".into(),
                "pactl".into(),
                "which".into(), // Pour détection de commandes
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

fn get_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_else(|_| std::time::Duration::from_secs(0))
        .as_secs()
}
