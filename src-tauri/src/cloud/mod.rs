// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — CLOUD SYNC ENGINE MODULE
//   Vault chiffré, synchronisation multi-device, local-first
//   AES-256-GCM + Argon2id + X25519 signature
// ═══════════════════════════════════════════════════════════════

pub mod cloud_crypto;
pub mod cloud_sync_engine;
pub mod cloud_vault;
pub mod commands;

pub use cloud_crypto::*;
pub use cloud_sync_engine::*;
pub use cloud_vault::*;

use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// ═══════════════════════════════════════════════════════════════
/// CLOUD SYNC STATUS
/// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SyncStatus {
    /// Aucune synchronisation en cours
    Idle,
    /// Synchronisation en cours
    Syncing,
    /// Synchronisation réussie
    Success,
    /// Erreur de synchronisation
    Error,
    /// Conflit détecté
    Conflict,
    /// Vault corrompu
    Corrupted,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SyncBackend {
    /// Dossier local (Syncthing, Nextcloud, etc.)
    LocalFolder,
    /// S3 privé (MinIO, etc.)
    S3Private,
    /// P2P WebRTC (futur)
    P2P,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SyncMode {
    /// Synchronisation manuelle
    Manual,
    /// Synchronisation automatique
    Auto,
    /// Synchronisation désactivée
    Disabled,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ConflictResolution {
    /// Dernier écrit gagne
    LastWriteWins,
    /// Préférence Kevin (local)
    KevinOverride,
    /// Merge stratégique
    StrategicMerge,
}

/// ═══════════════════════════════════════════════════════════════
/// CLOUD SYNC CONFIGURATION
/// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CloudSyncConfig {
    /// Backend de synchronisation
    pub backend: SyncBackend,
    /// Mode de synchronisation
    pub mode: SyncMode,
    /// Stratégie de résolution des conflits
    pub conflict_resolution: ConflictResolution,
    /// Chemin du dossier de synchronisation (pour LocalFolder)
    pub sync_folder_path: Option<PathBuf>,
    /// Endpoint S3 (pour S3Private)
    pub s3_endpoint: Option<String>,
    /// Bucket S3
    pub s3_bucket: Option<String>,
    /// Intervalle de synchronisation automatique (en secondes)
    pub auto_sync_interval_secs: u64,
    /// Limiter sync pendant training mode
    pub limit_during_training: bool,
    /// Limiter sync pendant developer mode
    pub limit_during_dev_mode: bool,
    /// Activer la compression LZ4
    pub compression_enabled: bool,
}

impl Default for CloudSyncConfig {
    fn default() -> Self {
        Self {
            backend: SyncBackend::LocalFolder,
            mode: SyncMode::Manual,
            conflict_resolution: ConflictResolution::LastWriteWins,
            sync_folder_path: None,
            s3_endpoint: None,
            s3_bucket: None,
            auto_sync_interval_secs: 300, // 5 minutes
            limit_during_training: true,
            limit_during_dev_mode: true,
            compression_enabled: true,
        }
    }
}

/// ═══════════════════════════════════════════════════════════════
/// CLOUD SYNC ERRORS
/// ═══════════════════════════════════════════════════════════════

#[derive(Debug, thiserror::Error)]
pub enum CloudSyncError {
    #[error("Vault encryption failed: {0}")]
    EncryptionFailed(String),
    #[error("Vault decryption failed: {0}")]
    DecryptionFailed(String),
    #[error("Signature verification failed")]
    SignatureInvalid,
    #[error("Vault corrupted: {0}")]
    VaultCorrupted(String),
    #[error("Sync backend unavailable: {0}")]
    BackendUnavailable(String),
    #[error("Conflict detected: {0}")]
    ConflictDetected(String),
    #[error("Permission denied: {0}")]
    PermissionDenied(String),
    #[error("Data blocked by manifest: {0}")]
    DataBlocked(String),
    #[error("Governance validation failed: {0}")]
    GovernanceRejected(String),
    #[error("I/O error: {0}")]
    IoError(String),
    #[error("Serialization error: {0}")]
    SerializationError(String),
    #[error("Device not registered")]
    DeviceNotRegistered,
    #[error("Key derivation failed: {0}")]
    KeyDerivationFailed(String),
    #[error("Compression failed: {0}")]
    CompressionFailed(String),
}

impl From<std::io::Error> for CloudSyncError {
    fn from(e: std::io::Error) -> Self {
        CloudSyncError::IoError(e.to_string())
    }
}

impl From<serde_json::Error> for CloudSyncError {
    fn from(e: serde_json::Error) -> Self {
        CloudSyncError::SerializationError(e.to_string())
    }
}
