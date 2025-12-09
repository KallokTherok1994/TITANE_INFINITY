// TITANE∞ — Unified Error Type
// Super Prompt Phase 1: Stabilisation Critique v20.0
// Replaces all unwrap()/expect() with proper error handling

use std::fmt;
use thiserror::Error;

/// Unified application error type for TITANE∞
/// All unwrap()/expect() calls should be replaced with Result<T, AppError>
#[derive(Error, Debug)]
pub enum AppError {
    // === I/O & File System ===
    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),

    #[error("File not found: {path}")]
    FileNotFound { path: String },

    #[error("Failed to create directory: {path}")]
    CreateDirFailed { path: String },

    // === Serialization ===
    #[error("JSON serialization error: {0}")]
    Json(#[from] serde_json::Error),

    // COMMENTED: toml crate not in dependencies
    // #[error("TOML serialization error: {0}")]
    // Toml(#[from] toml::de::Error),

    // === Database & Storage ===
    #[error("Database error: {0}")]
    Database(String),

    #[error("Vector store error: {0}")]
    VectorStore(String),

    #[error("Memory storage error: {0}")]
    MemoryStorage(String),

    // === Crypto & Security ===
    #[error("Encryption error: {0}")]
    Encryption(String),

    #[error("Decryption error: {0}")]
    Decryption(String),

    #[error("Invalid key: {0}")]
    InvalidKey(String),

    #[error("Security validation failed: {0}")]
    SecurityValidation(String),

    // === API & Network ===
    #[error("HTTP request failed: {0}")]
    Http(String),

    #[error("API error: {0}")]
    ApiError(String),

    #[error("Network timeout: {0}")]
    Timeout(String),

    // === AI & LLM ===
    #[error("AI provider error: {provider} - {message}")]
    AiProvider { provider: String, message: String },

    #[error("Model not available: {0}")]
    ModelNotAvailable(String),

    #[error("Token limit exceeded: {current}/{max}")]
    TokenLimitExceeded { current: usize, max: usize },

    // === Memory & Context ===
    #[error("Memory overflow: used {used}MB, limit {limit}MB")]
    MemoryOverflow { used: usize, limit: usize },

    #[error("Context too large: {size} tokens")]
    ContextTooLarge { size: usize },

    #[error("Memory not initialized")]
    MemoryNotInitialized,

    // === Audio & Voice ===
    #[error("Audio recording error: {0}")]
    AudioRecording(String),

    #[error("TTS error: {0}")]
    Tts(String),

    #[error("STT error: {0}")]
    Stt(String),

    #[error("Audio device not found")]
    AudioDeviceNotFound,

    #[error("Feedback loop detected")]
    AudioFeedbackLoop,

    // === Configuration ===
    #[error("Configuration error: {0}")]
    Config(String),

    #[error("Missing required config: {key}")]
    MissingConfig { key: String },

    #[error("Invalid configuration: {0}")]
    InvalidConfig(String),

    // === Engine & System ===
    #[error("Engine not initialized: {engine}")]
    EngineNotInitialized { engine: String },

    #[error("Engine start failed: {engine} - {reason}")]
    EngineStartFailed { engine: String, reason: String },

    #[error("System overload: {0}")]
    SystemOverload(String),

    #[error("Resource exhausted: {resource}")]
    ResourceExhausted { resource: String },

    // === OMEGA Pipeline ===
    #[error("Pipeline execution failed: {stage} - {reason}")]
    PipelineFailed { stage: String, reason: String },

    #[error("Pipeline timeout: {stage}")]
    PipelineTimeout { stage: String },

    // === Validation ===
    #[error("Invalid input: {0}")]
    InvalidInput(String),

    #[error("Validation failed: {field} - {reason}")]
    ValidationFailed { field: String, reason: String },

    // === Concurrency ===
    #[error("Lock poisoned: {0}")]
    LockPoisoned(String),

    #[error("Channel send failed")]
    ChannelSend,

    #[error("Channel receive failed")]
    ChannelReceive,

    // === Generic ===
    #[error("Internal error: {0}")]
    Internal(String),

    #[error("Not implemented: {0}")]
    NotImplemented(String),

    #[error("Operation not supported: {0}")]
    NotSupported(String),

    #[error("{0}")]
    Custom(String),
}

// === Helper constructors ===
impl AppError {
    pub fn io_error(msg: impl Into<String>) -> Self {
        Self::Internal(format!("I/O: {}", msg.into()))
    }

    pub fn database(msg: impl Into<String>) -> Self {
        Self::Database(msg.into())
    }

    pub fn config(msg: impl Into<String>) -> Self {
        Self::Config(msg.into())
    }

    pub fn ai_provider(provider: impl Into<String>, msg: impl Into<String>) -> Self {
        Self::AiProvider {
            provider: provider.into(),
            message: msg.into(),
        }
    }

    pub fn pipeline_failed(stage: impl Into<String>, reason: impl Into<String>) -> Self {
        Self::PipelineFailed {
            stage: stage.into(),
            reason: reason.into(),
        }
    }

    pub fn validation_failed(field: impl Into<String>, reason: impl Into<String>) -> Self {
        Self::ValidationFailed {
            field: field.into(),
            reason: reason.into(),
        }
    }
}

// === Poison error handling ===
impl<T> From<std::sync::PoisonError<T>> for AppError {
    fn from(err: std::sync::PoisonError<T>) -> Self {
        Self::LockPoisoned(err.to_string())
    }
}

// === Result type alias ===
pub type AppResult<T> = Result<T, AppError>;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_display() {
        let err = AppError::FileNotFound {
            path: "/test/file.txt".to_string(),
        };
        assert_eq!(err.to_string(), "File not found: /test/file.txt");
    }

    #[test]
    fn test_error_from_io() {
        let io_err = std::io::Error::new(std::io::ErrorKind::NotFound, "file not found");
        let app_err: AppError = io_err.into();
        assert!(matches!(app_err, AppError::Io(_)));
    }

    #[test]
    fn test_error_ai_provider() {
        let err = AppError::ai_provider("openai", "Rate limit exceeded");
        assert!(err.to_string().contains("openai"));
        assert!(err.to_string().contains("Rate limit"));
    }

    #[test]
    fn test_error_pipeline() {
        let err = AppError::pipeline_failed("analysis", "Timeout after 30s");
        assert!(err.to_string().contains("analysis"));
        assert!(err.to_string().contains("Timeout"));
    }

    #[test]
    fn test_result_type() {
        fn test_function() -> AppResult<String> {
            Ok("success".to_string())
        }
        assert!(test_function().is_ok());
    }
}
