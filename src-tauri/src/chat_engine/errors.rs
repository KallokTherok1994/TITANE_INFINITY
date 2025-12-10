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

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // ChatEngineError Display Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_invalid_input_display() {
        let error = ChatEngineError::InvalidInput("bad data".to_string());
        let display = format!("{}", error);
        assert!(display.contains("Invalid input"));
        assert!(display.contains("bad data"));
    }

    #[test]
    fn test_provider_failure_display() {
        let error = ChatEngineError::ProviderFailure("connection refused".to_string());
        let display = format!("{}", error);
        assert!(display.contains("Provider failure"));
        assert!(display.contains("connection refused"));
    }

    #[test]
    fn test_providers_unavailable_display() {
        let error = ChatEngineError::ProvidersUnavailable;
        let display = format!("{}", error);
        assert!(display.contains("No provider available"));
    }

    #[test]
    fn test_timeout_display() {
        let error = ChatEngineError::Timeout("30s exceeded".to_string());
        let display = format!("{}", error);
        assert!(display.contains("Timeout"));
        assert!(display.contains("30s exceeded"));
    }

    #[test]
    fn test_memory_failure_display() {
        let error = ChatEngineError::MemoryFailure("disk full".to_string());
        let display = format!("{}", error);
        assert!(display.contains("Memory failure"));
        assert!(display.contains("disk full"));
    }

    #[test]
    fn test_speech_failure_display() {
        let error = ChatEngineError::SpeechFailure("audio device error".to_string());
        let display = format!("{}", error);
        assert!(display.contains("Speech failure"));
        assert!(display.contains("audio device error"));
    }

    #[test]
    fn test_internal_display() {
        let error = ChatEngineError::Internal("unexpected state".to_string());
        let display = format!("{}", error);
        assert!(display.contains("Internal error"));
        assert!(display.contains("unexpected state"));
    }

    // ─────────────────────────────────────────────────────────────
    // ChatEngineError Debug Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_chat_engine_error_debug() {
        let error = ChatEngineError::ProvidersUnavailable;
        let debug_str = format!("{:?}", error);
        assert!(debug_str.contains("ProvidersUnavailable"));
    }

    #[test]
    fn test_all_variants_debug() {
        let errors = vec![
            ChatEngineError::InvalidInput("test".to_string()),
            ChatEngineError::ProviderFailure("test".to_string()),
            ChatEngineError::ProvidersUnavailable,
            ChatEngineError::Timeout("test".to_string()),
            ChatEngineError::MemoryFailure("test".to_string()),
            ChatEngineError::SpeechFailure("test".to_string()),
            ChatEngineError::Internal("test".to_string()),
        ];

        for error in errors {
            let debug_str = format!("{:?}", error);
            assert!(!debug_str.is_empty());
        }
    }

    // ─────────────────────────────────────────────────────────────
    // From Conversions Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_from_ai_error_no_provider() {
        let ai_error = AIError::NoProviderAvailable;
        let chat_error: ChatEngineError = ai_error.into();
        assert!(matches!(chat_error, ChatEngineError::ProvidersUnavailable));
    }

    #[test]
    fn test_from_ai_error_timeout() {
        let ai_error = AIError::TimeoutError;
        let chat_error: ChatEngineError = ai_error.into();
        assert!(matches!(chat_error, ChatEngineError::Timeout(_)));
    }

    #[test]
    fn test_from_ai_error_network() {
        let ai_error = AIError::NetworkError("network down".to_string());
        let chat_error: ChatEngineError = ai_error.into();
        assert!(matches!(chat_error, ChatEngineError::ProviderFailure(_)));
        if let ChatEngineError::ProviderFailure(msg) = chat_error {
            assert!(msg.contains("network down"));
        }
    }

    #[test]
    fn test_from_ai_error_api() {
        let ai_error = AIError::APIError("rate limited".to_string());
        let chat_error: ChatEngineError = ai_error.into();
        assert!(matches!(chat_error, ChatEngineError::ProviderFailure(_)));
    }

    #[test]
    fn test_from_ai_error_invalid_response() {
        let ai_error = AIError::InvalidResponse("malformed json".to_string());
        let chat_error: ChatEngineError = ai_error.into();
        assert!(matches!(chat_error, ChatEngineError::ProviderFailure(_)));
    }

    // ─────────────────────────────────────────────────────────────
    // Error Trait Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_error_trait_impl() {
        let error = ChatEngineError::Internal("test".to_string());
        // Should implement std::error::Error
        let _: &dyn std::error::Error = &error;
    }

    #[test]
    fn test_error_source() {
        let error = ChatEngineError::Internal("test".to_string());
        // Default source is None
        assert!(error.source().is_none());
    }
}
