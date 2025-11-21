// TITANE∞ v12 - Memory Module
// Encrypted persistent conversational memory with AES-256-GCM + Argon2id

pub mod encryption;
pub mod model;
pub mod storage;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryEntry {
    pub id: String,
    pub role: MessageRole,
    pub content: String,
    pub timestamp: i64,
    pub tokens: usize,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum MessageRole {
    User,
    Assistant,
    System,
}

impl std::fmt::Display for MessageRole {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            MessageRole::User => write!(f, "user"),
            MessageRole::Assistant => write!(f, "assistant"),
            MessageRole::System => write!(f, "system"),
        }
    }
}

#[derive(Debug)]
pub enum MemoryError {
    EncryptionError(String),
    DecryptionError(String),
    StorageError(String),
    InvalidData(String),
}

impl std::fmt::Display for MemoryError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            MemoryError::EncryptionError(e) => write!(f, "Encryption error: {}", e),
            MemoryError::DecryptionError(e) => write!(f, "Decryption error: {}", e),
            MemoryError::StorageError(e) => write!(f, "Storage error: {}", e),
            MemoryError::InvalidData(e) => write!(f, "Invalid data: {}", e),
        }
    }
}

impl std::error::Error for MemoryError {}

pub type MemoryResult<T> = Result<T, MemoryError>;
