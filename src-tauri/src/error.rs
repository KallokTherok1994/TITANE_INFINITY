/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v24 — UNIFIED IPC ERROR TYPES
 * Enum TitaneError commun pour toutes les commands Tauri
 * TODO #12
 * ═══════════════════════════════════════════════════════════════════════════
 */

use serde::{Serialize, Deserialize};
use thiserror::Error;

#[derive(Debug, thiserror::Error)]
pub enum TitaneError {
    // Identity errors
    #[error("Identity not initialized")]
    IdentityNotInitialized,

    #[error("Identity dimension not found: {0}")]
    DimensionNotFound(String),

    #[error("Invalid identity value: {0}")]
    InvalidIdentityValue(String),

    // Memory errors
    #[error("Memory engine not initialized")]
    MemoryNotInitialized,

    #[error("Memory entry not found: {0}")]
    MemoryEntryNotFound(String),

    #[error("Memory persistence failed: {0}")]
    MemoryPersistenceFailed(String),

    // Chat errors
    #[error("Chat provider not available: {0}")]
    ChatProviderUnavailable(String),

    #[error("Chat generation failed: {0}")]
    ChatGenerationFailed(String),

    #[error("Invalid chat request: {0}")]
    InvalidChatRequest(String),

    // Orchestrator errors
    #[error("Orchestrator not initialized")]
    OrchestratorNotInitialized,

    #[error("Engine not found: {0}")]
    EngineNotFound(String),

    #[error("Engine operation failed: {0}")]
    EngineOperationFailed(String),

    // File system errors
    #[error("File not found: {0}")]
    FileNotFound(String),

    #[error("File read failed: {0}")]
    FileReadFailed(String),

    #[error("File write failed: {0}")]
    FileWriteFailed(String),

    // Serialization errors
    #[error("Serialization failed: {0}")]
    SerializationFailed(String),

    #[error("Deserialization failed: {0}")]
    DeserializationFailed(String),

    // Permission errors
    #[error("Permission denied: {0}")]
    PermissionDenied(String),

    // Generic errors
    #[error("Internal error: {0}")]
    InternalError(String),

    #[error("Operation not supported: {0}")]
    NotSupported(String),

    #[error("Timeout: {0}")]
    Timeout(String),

    #[error("Validation error: {message}")]
    ValidationError { message: String },

    #[error("Rate limit exceeded: {message}")]
    RateLimitExceeded { message: String },

    #[error("Encryption error: {message}")]
    EncryptionError { message: String },

    #[error("Audit error: {message}")]
    AuditError { message: String },
}

impl From<std::io::Error> for TitaneError {
    fn from(err: std::io::Error) -> Self {
        TitaneError::InternalError(format!("IO error: {}", err))
    }
}

impl From<serde_json::Error> for TitaneError {
    fn from(err: serde_json::Error) -> Self {
        TitaneError::SerializationFailed(err.to_string())
    }
}

// Conversion vers String pour Tauri commands
impl From<TitaneError> for String {
    fn from(err: TitaneError) -> Self {
        err.to_string()
    }
}
