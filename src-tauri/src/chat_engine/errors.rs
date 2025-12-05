use std::fmt::{self, Display, Formatter};

use crate::{ai::AIError, memory::MemoryError, tts::TTSError};

/// Unified error type for the chat engine pipeline.
#[derive(Debug)]
pub enum ChatEngineError {
    /// Invalid user input or configuration.
    InvalidInput(String),
    /// Underlying AI provider failure.
    ProviderFailure(String),
    /// All providers were unavailable or rejected the request.
    ProvidersUnavailable,
    /// Timeout reached while waiting for an async task.
    Timeout(String),
    /// Memory subsystem failure.
    MemoryFailure(String),
    /// Text-to-speech subsystem failure.
    SpeechFailure(String),
    /// Any other internal failure.
    Internal(String),
}

impl Display for ChatEngineError {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        match self {
            ChatEngineError::InvalidInput(msg) => write!(f, "Invalid input: {}", msg),
            ChatEngineError::ProviderFailure(msg) => write!(f, "Provider failure: {}", msg),
            ChatEngineError::ProvidersUnavailable => {
                write!(f, "No provider available to process the request")
            }
            ChatEngineError::Timeout(msg) => write!(f, "Timeout: {}", msg),
            ChatEngineError::MemoryFailure(msg) => write!(f, "Memory failure: {}", msg),
            ChatEngineError::SpeechFailure(msg) => write!(f, "Speech failure: {}", msg),
            ChatEngineError::Internal(msg) => write!(f, "Internal error: {}", msg),
        }
    }
}

impl std::error::Error for ChatEngineError {}

impl From<MemoryError> for ChatEngineError {
    fn from(value: MemoryError) -> Self {
        ChatEngineError::MemoryFailure(value.to_string())
    }
}

impl From<TTSError> for ChatEngineError {
    fn from(value: TTSError) -> Self {
        ChatEngineError::SpeechFailure(value.to_string())
    }
}

impl From<AIError> for ChatEngineError {
    fn from(value: AIError) -> Self {
        match value {
            AIError::NoProviderAvailable => ChatEngineError::ProvidersUnavailable,
            AIError::TimeoutError => ChatEngineError::Timeout("AI provider timeout".to_string()),
            AIError::NetworkError(msg) | AIError::APIError(msg) | AIError::InvalidResponse(msg) => {
                ChatEngineError::ProviderFailure(msg)
            }
        }
    }
}
