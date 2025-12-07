// TITANE∞ v17 - Memory Module with Security Hardening
// Persistent conversation storage with encryption + SHA256 validation
// Architecture v17: Clean, documented, versioning support, security hardened
// Encrypted persistent conversational memory with AES-256-GCM + Argon2id

pub mod encryption;
pub mod model;
pub mod pool; // NEW: SP-PERF-004 Memory Pool Optimization
pub mod security; // NEW: Security hardening module
pub mod storage;
pub mod telemetry;

// Re-export pool types
pub use pool::{
    BufferPool, EmbeddingPool, MemoryPoolManager, MemoryPoolMetrics, PoolConfig, PoolMetrics,
    PoolMetricsSnapshot, PooledBuffer, PooledEmbedding, PooledString, StringPool,
};

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
    ValidationError(String), // NEW: v17 Validation errors
    TimeoutError(String),    // NEW: v17 Timeout errors
}

impl std::fmt::Display for MemoryError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            MemoryError::EncryptionError(e) => write!(f, "Encryption error: {}", e),
            MemoryError::DecryptionError(e) => write!(f, "Decryption error: {}", e),
            MemoryError::StorageError(e) => write!(f, "Storage error: {}", e),
            MemoryError::InvalidData(e) => write!(f, "Invalid data: {}", e),
            MemoryError::ValidationError(e) => write!(f, "Validation error: {}", e),
            MemoryError::TimeoutError(e) => write!(f, "Timeout error: {}", e),
        }
    }
}

impl std::error::Error for MemoryError {}

pub type MemoryResult<T> = Result<T, MemoryError>;
