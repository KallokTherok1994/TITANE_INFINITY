// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — UTILS: ERROR TYPES
//   AppError, AppResult - Unified Error Handling
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

/// Unified error type for TITANE∞ Backend
#[derive(Debug, thiserror::Error, Serialize, Deserialize)]
pub enum AppError {
    #[error("Internal error: {0}")]
    Internal(String),
    
    #[error("System error: {0}")]
    System(String),
    
    #[error("Memory error: {0}")]
    Memory(String),
    
    #[error("Evolution error: {0}")]
    Evolution(String),
    
    #[error("Validation error: {0}")]
    Validation(String),
    
    #[error("IO error: {0}")]
    Io(String),
    
    #[error("Network error: {0}")]
    Network(String),
    
    #[error("Parse error: {0}")]
    Parse(String),
    
    #[error("Not found: {0}")]
    NotFound(String),
}

/// Conversion from std::io::Error
impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        AppError::Io(err.to_string())
    }
}

/// Conversion from serde_json::Error
impl From<serde_json::Error> for AppError {
    fn from(err: serde_json::Error) -> Self {
        AppError::Parse(err.to_string())
    }
}

/// Result type alias using AppError
pub type AppResult<T> = Result<T, AppError>;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_creation() {
        let err = AppError::Internal("test error".to_string());
        assert_eq!(err.to_string(), "Internal error: test error");
    }

    #[test]
    fn test_io_error_conversion() {
        let io_err = std::io::Error::new(std::io::ErrorKind::NotFound, "file not found");
        let app_err: AppError = io_err.into();
        assert!(matches!(app_err, AppError::Io(_)));
    }
}
