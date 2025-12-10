use serde::{Deserialize, Serialize};

/// Which provider should be used for the next request.
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum ProviderPreference {
    Auto,
    Gemini,
    Ollama,
    Local,
}

impl Default for ProviderPreference {
    fn default() -> Self {
        Self::Auto
    }
}

/// Input payload for a generation request.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatRequestPayload {
    pub conversation_id: Option<String>,
    pub user_message: String,
    pub system_prompt: Option<String>,
    pub temperature: f32,
    pub max_output_tokens: usize,
    pub provider: ProviderPreference,
    pub enable_streaming: bool,
}

impl ChatRequestPayload {
    pub fn validate(&self) -> Result<(), String> {
        if self.user_message.trim().is_empty() {
            return Err("Message cannot be empty".to_string());
        }

        if self.user_message.len() > 12_000 {
            return Err("Message too long (limit 12k chars)".to_string());
        }

        if !(0.0..=2.0).contains(&self.temperature) {
            return Err("Temperature must be between 0.0 and 2.0".to_string());
        }

        if self.max_output_tokens == 0 || self.max_output_tokens > 8096 {
            return Err("max_output_tokens must be between 1 and 8096".to_string());
        }

        Ok(())
    }
}

/// Response returned for a non-streaming generation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatCompletionPayload {
    pub conversation_id: String,
    pub message_id: String,
    pub provider: String,
    pub content: String,
    pub token_count: usize,
    pub latency_ms: u128,
    pub timestamp: i64,
}

/// Streaming chunk descriptor sent to the frontend.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamChunk {
    pub conversation_id: String,
    pub message_id: String,
    pub ordinal: u32,
    pub content: String,
    pub done: bool,
}

/// Aggregated health information returned by the engine.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EngineHealthReport {
    pub providers_online: Vec<String>,
    pub providers_degraded: Vec<String>,
    pub provider_errors: Vec<String>,
    pub memory_entries: usize,
    pub memory_tokens: usize,
    pub auto_tts_enabled: bool,
    pub timestamp: i64,
}

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // ProviderPreference Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_provider_preference_default() {
        let pref = ProviderPreference::default();
        assert_eq!(pref, ProviderPreference::Auto);
    }

    #[test]
    fn test_provider_preference_equality() {
        assert_eq!(ProviderPreference::Gemini, ProviderPreference::Gemini);
        assert_ne!(ProviderPreference::Gemini, ProviderPreference::Ollama);
    }

    #[test]
    fn test_provider_preference_clone() {
        let pref = ProviderPreference::Local;
        let cloned = pref.clone();
        assert_eq!(pref, cloned);
    }

    #[test]
    fn test_provider_preference_copy() {
        let pref = ProviderPreference::Ollama;
        let copied: ProviderPreference = pref;
        assert_eq!(pref, copied);
    }

    #[test]
    fn test_provider_preference_debug() {
        let pref = ProviderPreference::Gemini;
        let debug_str = format!("{:?}", pref);
        assert!(debug_str.contains("Gemini"));
    }

    #[test]
    fn test_provider_preference_serialization() {
        let pref = ProviderPreference::Ollama;
        let json = serde_json::to_string(&pref).unwrap();
        assert_eq!(json, "\"ollama\"");

        let restored: ProviderPreference = serde_json::from_str(&json).unwrap();
        assert_eq!(restored, ProviderPreference::Ollama);
    }

    #[test]
    fn test_provider_preference_all_variants() {
        let variants = [
            ProviderPreference::Auto,
            ProviderPreference::Gemini,
            ProviderPreference::Ollama,
            ProviderPreference::Local,
        ];

        for variant in variants {
            let json = serde_json::to_string(&variant).unwrap();
            let restored: ProviderPreference = serde_json::from_str(&json).unwrap();
            assert_eq!(variant, restored);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // ChatRequestPayload Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_chat_request_payload_valid() {
        let payload = ChatRequestPayload {
            conversation_id: Some("conv-123".to_string()),
            user_message: "Hello, how are you?".to_string(),
            system_prompt: Some("You are helpful.".to_string()),
            temperature: 0.7,
            max_output_tokens: 1000,
            provider: ProviderPreference::Auto,
            enable_streaming: true,
        };

        assert!(payload.validate().is_ok());
    }

    #[test]
    fn test_chat_request_payload_empty_message() {
        let payload = ChatRequestPayload {
            conversation_id: None,
            user_message: "   ".to_string(),
            system_prompt: None,
            temperature: 0.7,
            max_output_tokens: 1000,
            provider: ProviderPreference::Auto,
            enable_streaming: false,
        };

        let result = payload.validate();
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("empty"));
    }

    #[test]
    fn test_chat_request_payload_message_too_long() {
        let long_message = "x".repeat(15000);
        let payload = ChatRequestPayload {
            conversation_id: None,
            user_message: long_message,
            system_prompt: None,
            temperature: 0.7,
            max_output_tokens: 1000,
            provider: ProviderPreference::Auto,
            enable_streaming: false,
        };

        let result = payload.validate();
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("too long"));
    }

    #[test]
    fn test_chat_request_payload_temperature_too_low() {
        let payload = ChatRequestPayload {
            conversation_id: None,
            user_message: "Hello".to_string(),
            system_prompt: None,
            temperature: -0.5,
            max_output_tokens: 1000,
            provider: ProviderPreference::Auto,
            enable_streaming: false,
        };

        let result = payload.validate();
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Temperature"));
    }

    #[test]
    fn test_chat_request_payload_temperature_too_high() {
        let payload = ChatRequestPayload {
            conversation_id: None,
            user_message: "Hello".to_string(),
            system_prompt: None,
            temperature: 2.5,
            max_output_tokens: 1000,
            provider: ProviderPreference::Auto,
            enable_streaming: false,
        };

        let result = payload.validate();
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Temperature"));
    }

    #[test]
    fn test_chat_request_payload_max_tokens_zero() {
        let payload = ChatRequestPayload {
            conversation_id: None,
            user_message: "Hello".to_string(),
            system_prompt: None,
            temperature: 0.7,
            max_output_tokens: 0,
            provider: ProviderPreference::Auto,
            enable_streaming: false,
        };

        let result = payload.validate();
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("max_output_tokens"));
    }

    #[test]
    fn test_chat_request_payload_max_tokens_too_high() {
        let payload = ChatRequestPayload {
            conversation_id: None,
            user_message: "Hello".to_string(),
            system_prompt: None,
            temperature: 0.7,
            max_output_tokens: 10000,
            provider: ProviderPreference::Auto,
            enable_streaming: false,
        };

        let result = payload.validate();
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("max_output_tokens"));
    }

    #[test]
    fn test_chat_request_payload_boundary_temperature() {
        // Exactly 0.0
        let payload_low = ChatRequestPayload {
            conversation_id: None,
            user_message: "Hello".to_string(),
            system_prompt: None,
            temperature: 0.0,
            max_output_tokens: 100,
            provider: ProviderPreference::Auto,
            enable_streaming: false,
        };
        assert!(payload_low.validate().is_ok());

        // Exactly 2.0
        let payload_high = ChatRequestPayload {
            conversation_id: None,
            user_message: "Hello".to_string(),
            system_prompt: None,
            temperature: 2.0,
            max_output_tokens: 100,
            provider: ProviderPreference::Auto,
            enable_streaming: false,
        };
        assert!(payload_high.validate().is_ok());
    }

    #[test]
    fn test_chat_request_payload_boundary_tokens() {
        // Min valid
        let payload_min = ChatRequestPayload {
            conversation_id: None,
            user_message: "Hello".to_string(),
            system_prompt: None,
            temperature: 0.7,
            max_output_tokens: 1,
            provider: ProviderPreference::Auto,
            enable_streaming: false,
        };
        assert!(payload_min.validate().is_ok());

        // Max valid
        let payload_max = ChatRequestPayload {
            conversation_id: None,
            user_message: "Hello".to_string(),
            system_prompt: None,
            temperature: 0.7,
            max_output_tokens: 8096,
            provider: ProviderPreference::Auto,
            enable_streaming: false,
        };
        assert!(payload_max.validate().is_ok());
    }

    #[test]
    fn test_chat_request_payload_clone() {
        let payload = ChatRequestPayload {
            conversation_id: Some("conv".to_string()),
            user_message: "test".to_string(),
            system_prompt: None,
            temperature: 0.5,
            max_output_tokens: 500,
            provider: ProviderPreference::Gemini,
            enable_streaming: true,
        };
        let cloned = payload.clone();
        assert_eq!(cloned.user_message, "test");
        assert_eq!(cloned.temperature, 0.5);
    }

    #[test]
    fn test_chat_request_payload_debug() {
        let payload = ChatRequestPayload {
            conversation_id: None,
            user_message: "Hello".to_string(),
            system_prompt: None,
            temperature: 0.7,
            max_output_tokens: 100,
            provider: ProviderPreference::Auto,
            enable_streaming: false,
        };
        let debug_str = format!("{:?}", payload);
        assert!(debug_str.contains("ChatRequestPayload"));
    }

    #[test]
    fn test_chat_request_payload_serialization() {
        let payload = ChatRequestPayload {
            conversation_id: Some("id-1".to_string()),
            user_message: "Hello".to_string(),
            system_prompt: None,
            temperature: 0.7,
            max_output_tokens: 100,
            provider: ProviderPreference::Ollama,
            enable_streaming: true,
        };

        let json = serde_json::to_string(&payload).unwrap();
        let restored: ChatRequestPayload = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.user_message, "Hello");
        assert_eq!(restored.provider, ProviderPreference::Ollama);
    }

    // ─────────────────────────────────────────────────────────────
    // ChatCompletionPayload Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_chat_completion_payload_creation() {
        let payload = ChatCompletionPayload {
            conversation_id: "conv-1".to_string(),
            message_id: "msg-1".to_string(),
            provider: "gemini".to_string(),
            content: "Hello!".to_string(),
            token_count: 10,
            latency_ms: 150,
            timestamp: 1234567890,
        };

        assert_eq!(payload.conversation_id, "conv-1");
        assert_eq!(payload.token_count, 10);
        assert_eq!(payload.latency_ms, 150);
    }

    #[test]
    fn test_chat_completion_payload_clone() {
        let payload = ChatCompletionPayload {
            conversation_id: "conv".to_string(),
            message_id: "msg".to_string(),
            provider: "ollama".to_string(),
            content: "Response".to_string(),
            token_count: 20,
            latency_ms: 200,
            timestamp: 999,
        };
        let cloned = payload.clone();
        assert_eq!(cloned.content, "Response");
        assert_eq!(cloned.provider, "ollama");
    }

    #[test]
    fn test_chat_completion_payload_debug() {
        let payload = ChatCompletionPayload {
            conversation_id: "c".to_string(),
            message_id: "m".to_string(),
            provider: "p".to_string(),
            content: "x".to_string(),
            token_count: 1,
            latency_ms: 1,
            timestamp: 1,
        };
        let debug_str = format!("{:?}", payload);
        assert!(debug_str.contains("ChatCompletionPayload"));
    }

    #[test]
    fn test_chat_completion_payload_serialization() {
        let payload = ChatCompletionPayload {
            conversation_id: "conv-test".to_string(),
            message_id: "msg-test".to_string(),
            provider: "gemini".to_string(),
            content: "The answer is 42.".to_string(),
            token_count: 5,
            latency_ms: 123,
            timestamp: 1700000000,
        };

        let json = serde_json::to_string(&payload).unwrap();
        let restored: ChatCompletionPayload = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.content, "The answer is 42.");
        assert_eq!(restored.timestamp, 1700000000);
    }

    // ─────────────────────────────────────────────────────────────
    // StreamChunk Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_stream_chunk_creation() {
        let chunk = StreamChunk {
            conversation_id: "conv".to_string(),
            message_id: "msg".to_string(),
            ordinal: 0,
            content: "Hello".to_string(),
            done: false,
        };

        assert_eq!(chunk.ordinal, 0);
        assert!(!chunk.done);
    }

    #[test]
    fn test_stream_chunk_done_flag() {
        let chunk = StreamChunk {
            conversation_id: "c".to_string(),
            message_id: "m".to_string(),
            ordinal: 5,
            content: "".to_string(),
            done: true,
        };

        assert!(chunk.done);
        assert!(chunk.content.is_empty());
    }

    #[test]
    fn test_stream_chunk_clone() {
        let chunk = StreamChunk {
            conversation_id: "c".to_string(),
            message_id: "m".to_string(),
            ordinal: 3,
            content: "chunk data".to_string(),
            done: false,
        };
        let cloned = chunk.clone();
        assert_eq!(cloned.ordinal, 3);
        assert_eq!(cloned.content, "chunk data");
    }

    #[test]
    fn test_stream_chunk_debug() {
        let chunk = StreamChunk {
            conversation_id: "c".to_string(),
            message_id: "m".to_string(),
            ordinal: 1,
            content: "x".to_string(),
            done: false,
        };
        let debug_str = format!("{:?}", chunk);
        assert!(debug_str.contains("StreamChunk"));
    }

    #[test]
    fn test_stream_chunk_serialization() {
        let chunk = StreamChunk {
            conversation_id: "conv-id".to_string(),
            message_id: "msg-id".to_string(),
            ordinal: 42,
            content: "streaming content".to_string(),
            done: true,
        };

        let json = serde_json::to_string(&chunk).unwrap();
        let restored: StreamChunk = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.ordinal, 42);
        assert!(restored.done);
    }

    // ─────────────────────────────────────────────────────────────
    // EngineHealthReport Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_engine_health_report_creation() {
        let report = EngineHealthReport {
            providers_online: vec!["gemini".to_string(), "ollama".to_string()],
            providers_degraded: vec![],
            provider_errors: vec![],
            memory_entries: 100,
            memory_tokens: 5000,
            auto_tts_enabled: true,
            timestamp: 1234567890,
        };

        assert_eq!(report.providers_online.len(), 2);
        assert!(report.providers_degraded.is_empty());
        assert!(report.auto_tts_enabled);
    }

    #[test]
    fn test_engine_health_report_with_errors() {
        let report = EngineHealthReport {
            providers_online: vec![],
            providers_degraded: vec!["gemini".to_string()],
            provider_errors: vec!["Connection timeout".to_string()],
            memory_entries: 0,
            memory_tokens: 0,
            auto_tts_enabled: false,
            timestamp: 999,
        };

        assert!(report.providers_online.is_empty());
        assert_eq!(report.providers_degraded.len(), 1);
        assert_eq!(report.provider_errors.len(), 1);
    }

    #[test]
    fn test_engine_health_report_clone() {
        let report = EngineHealthReport {
            providers_online: vec!["a".to_string()],
            providers_degraded: vec![],
            provider_errors: vec![],
            memory_entries: 50,
            memory_tokens: 2500,
            auto_tts_enabled: true,
            timestamp: 111,
        };
        let cloned = report.clone();
        assert_eq!(cloned.memory_entries, 50);
        assert_eq!(cloned.providers_online.len(), 1);
    }

    #[test]
    fn test_engine_health_report_debug() {
        let report = EngineHealthReport {
            providers_online: vec![],
            providers_degraded: vec![],
            provider_errors: vec![],
            memory_entries: 0,
            memory_tokens: 0,
            auto_tts_enabled: false,
            timestamp: 0,
        };
        let debug_str = format!("{:?}", report);
        assert!(debug_str.contains("EngineHealthReport"));
    }

    #[test]
    fn test_engine_health_report_serialization() {
        let report = EngineHealthReport {
            providers_online: vec!["gemini".to_string()],
            providers_degraded: vec!["ollama".to_string()],
            provider_errors: vec!["Error msg".to_string()],
            memory_entries: 75,
            memory_tokens: 3500,
            auto_tts_enabled: true,
            timestamp: 1700000000,
        };

        let json = serde_json::to_string(&report).unwrap();
        let restored: EngineHealthReport = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.memory_entries, 75);
        assert!(restored.auto_tts_enabled);
    }
}
