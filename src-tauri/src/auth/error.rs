// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   AUTH OS — ERROR TYPES
// ═══════════════════════════════════════════════════════════════

use std::fmt;

/// Erreurs AuthOS
#[derive(Debug, Clone)]
pub enum AuthError {
    /// Keystore introuvable
    KeystoreNotFound,
    /// Keystore corrompu
    KeystoreCorrupted(String),
    /// Erreur I/O (lecture/écriture)
    IoError(String),
    /// Token invalide
    InvalidToken(String),
    /// Permission refusée
    PermissionDenied(String),
    /// API Key invalide
    InvalidApiKey(String),
    /// Role manquant
    RoleMissing(String),
    /// Chiffrement échoué
    EncryptionFailed(String),
    /// Autre erreur
    Other(String),
}

impl fmt::Display for AuthError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AuthError::KeystoreNotFound => write!(f, "Keystore introuvable"),
            AuthError::KeystoreCorrupted(msg) => write!(f, "Keystore corrompu: {}", msg),
            AuthError::IoError(msg) => write!(f, "Erreur I/O: {}", msg),
            AuthError::InvalidToken(msg) => write!(f, "Token invalide: {}", msg),
            AuthError::PermissionDenied(msg) => write!(f, "Permission refusée: {}", msg),
            AuthError::InvalidApiKey(msg) => write!(f, "API Key invalide: {}", msg),
            AuthError::RoleMissing(msg) => write!(f, "Role manquant: {}", msg),
            AuthError::EncryptionFailed(msg) => write!(f, "Chiffrement échoué: {}", msg),
            AuthError::Other(msg) => write!(f, "Erreur: {}", msg),
        }
    }
}

impl std::error::Error for AuthError {}

impl From<std::io::Error> for AuthError {
    fn from(err: std::io::Error) -> Self {
        AuthError::IoError(err.to_string())
    }
}

impl From<serde_json::Error> for AuthError {
    fn from(err: serde_json::Error) -> Self {
        AuthError::KeystoreCorrupted(err.to_string())
    }
}

/// Type alias pour Result avec AuthError
pub type AuthResult<T> = Result<T, AuthError>;
