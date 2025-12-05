// ═══════════════════════════════════════════════════════════════════════════
// TITANE∞ v14 — TAPI ERROR (Standard Error Type)
// ═══════════════════════════════════════════════════════════════════════════
// Format d'erreur standard pour toutes les APIs TITANE∞
// ═══════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::fmt;

/// Catégories d'erreurs TITANE∞
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum TAPIErrorKind {
    /// Erreur de validation input
    ValidationError,
    /// Provider IA indisponible
    ProviderUnavailable,
    /// Timeout dépassé
    Timeout,
    /// Erreur réseau
    NetworkError,
    /// Erreur de parsing
    ParseError,
    /// Erreur mémoire/storage
    StorageError,
    /// Erreur configuration
    ConfigError,
    /// Erreur interne
    InternalError,
    /// Erreur de permissions/sécurité
    SecurityError,
    /// Ressource non trouvée
    NotFound,
}

/// Structure d'erreur standard TITANE∞
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TAPIError {
    /// Type d'erreur
    pub kind: TAPIErrorKind,
    /// Message d'erreur
    pub message: String,
    /// Contexte additionnel (optionnel)
    pub context: Option<String>,
    /// Code d'erreur numérique (optionnel)
    pub code: Option<u32>,
    /// Timestamp
    pub timestamp: u64,
}

impl TAPIError {
    /// Crée une nouvelle TAPIError
    pub fn new(kind: TAPIErrorKind, message: impl Into<String>) -> Self {
        Self {
            kind,
            message: message.into(),
            context: None,
            code: None,
            timestamp: crate::core::utils::now_ms(),
        }
    }

    /// Ajoute du contexte à l'erreur
    pub fn with_context(mut self, context: impl Into<String>) -> Self {
        self.context = Some(context.into());
        self
    }

    /// Ajoute un code d'erreur
    pub fn with_code(mut self, code: u32) -> Self {
        self.code = Some(code);
        self
    }

    // ─────────────────────────────────────────────────────────────────────
    // CONSTRUCTORS PAR TYPE
    // ─────────────────────────────────────────────────────────────────────

    pub fn validation(message: impl Into<String>) -> Self {
        Self::new(TAPIErrorKind::ValidationError, message)
    }

    pub fn provider_unavailable(provider: &str) -> Self {
        Self::new(
            TAPIErrorKind::ProviderUnavailable,
            format!("Provider {} unavailable", provider),
        )
    }

    pub fn timeout(operation: &str) -> Self {
        Self::new(
            TAPIErrorKind::Timeout,
            format!("Operation '{}' timed out", operation),
        )
    }

    pub fn network(message: impl Into<String>) -> Self {
        Self::new(TAPIErrorKind::NetworkError, message)
    }

    pub fn parse(message: impl Into<String>) -> Self {
        Self::new(TAPIErrorKind::ParseError, message)
    }

    pub fn storage(message: impl Into<String>) -> Self {
        Self::new(TAPIErrorKind::StorageError, message)
    }

    pub fn config(message: impl Into<String>) -> Self {
        Self::new(TAPIErrorKind::ConfigError, message)
    }

    pub fn internal(message: impl Into<String>) -> Self {
        Self::new(TAPIErrorKind::InternalError, message)
    }

    pub fn security(message: impl Into<String>) -> Self {
        Self::new(TAPIErrorKind::SecurityError, message)
    }

    pub fn not_found(resource: &str) -> Self {
        Self::new(
            TAPIErrorKind::NotFound,
            format!("Resource '{}' not found", resource),
        )
    }
}

impl fmt::Display for TAPIError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "[{:?}] {}", self.kind, self.message)?;
        if let Some(ctx) = &self.context {
            write!(f, " (context: {})", ctx)?;
        }
        if let Some(code) = self.code {
            write!(f, " [code: {}]", code)?;
        }
        Ok(())
    }
}

impl std::error::Error for TAPIError {}

// Conversions depuis erreurs standard
impl From<std::io::Error> for TAPIError {
    fn from(err: std::io::Error) -> Self {
        TAPIError::internal(err.to_string()).with_context("IO Error")
    }
}

impl From<serde_json::Error> for TAPIError {
    fn from(err: serde_json::Error) -> Self {
        TAPIError::parse(err.to_string()).with_context("JSON parse error")
    }
}

impl From<reqwest::Error> for TAPIError {
    fn from(err: reqwest::Error) -> Self {
        if err.is_timeout() {
            TAPIError::timeout("HTTP request")
        } else if err.is_connect() {
            TAPIError::network("Connection failed")
        } else {
            TAPIError::network(err.to_string())
        }
    }
}

// Conversion vers String pour Tauri commands (Result<T, String>)
impl From<TAPIError> for String {
    fn from(err: TAPIError) -> Self {
        // Format JSON pour parsing côté frontend
        serde_json::to_string(&err).unwrap_or_else(|_| err.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_tapi_error_creation() {
        let err = TAPIError::validation("Input too short");
        assert_eq!(err.kind, TAPIErrorKind::ValidationError);
        assert_eq!(err.message, "Input too short");
    }

    #[test]
    fn test_tapi_error_with_context() {
        let err = TAPIError::provider_unavailable("gemini").with_context("API key missing");
        assert!(err.context.is_some());
    }

    #[test]
    fn test_tapi_error_display() {
        let err = TAPIError::timeout("chat_send").with_code(504);
        let display = format!("{}", err);
        assert!(display.contains("Timeout"));
        assert!(display.contains("504"));
    }
}
