use std::time::Duration;

/// Configuration for the high-performance chat engine.
#[derive(Debug, Clone)]
pub struct ChatEngineConfig {
    /// Maximum time allowed for a single non-streaming generation request.
    pub response_timeout: Duration,
    /// Default chunk size (in characters) for streaming fallback segmentation.
    pub stream_chunk_size: usize,
    /// Maximum number of tokens from memory to feed into the prompt context.
    pub memory_context_tokens: usize,
    /// Maximum total tokens allowed to be persisted for a conversation.
    pub memory_retention_tokens: usize,
    /// Interval used to debounce memory flush operations to disk.
    pub memory_flush_interval: Duration,
    /// Enables the text-to-speech pipeline automatically after a response.
    pub auto_tts_enabled: bool,
}

impl Default for ChatEngineConfig {
    fn default() -> Self {
        Self {
            response_timeout: Duration::from_secs(45),
            stream_chunk_size: 480,
            memory_context_tokens: 2_048,
            memory_retention_tokens: 3_000,
            memory_flush_interval: Duration::from_millis(350),
            auto_tts_enabled: true,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_chat_engine_config_default() {
        let config = ChatEngineConfig::default();
        assert_eq!(config.response_timeout, Duration::from_secs(45));
        assert_eq!(config.stream_chunk_size, 480);
        assert_eq!(config.memory_context_tokens, 2_048);
        assert_eq!(config.memory_retention_tokens, 3_000);
        assert_eq!(config.memory_flush_interval, Duration::from_millis(350));
        assert!(config.auto_tts_enabled);
    }

    #[test]
    fn test_chat_engine_config_clone() {
        let config = ChatEngineConfig::default();
        let cloned = config.clone();
        assert_eq!(cloned.response_timeout, config.response_timeout);
        assert_eq!(cloned.stream_chunk_size, config.stream_chunk_size);
        assert_eq!(cloned.auto_tts_enabled, config.auto_tts_enabled);
    }

    #[test]
    fn test_chat_engine_config_debug() {
        let config = ChatEngineConfig::default();
        let debug_str = format!("{:?}", config);
        assert!(debug_str.contains("ChatEngineConfig"));
        assert!(debug_str.contains("response_timeout"));
    }

    #[test]
    fn test_chat_engine_config_custom_values() {
        let config = ChatEngineConfig {
            response_timeout: Duration::from_secs(60),
            stream_chunk_size: 1024,
            memory_context_tokens: 4096,
            memory_retention_tokens: 6000,
            memory_flush_interval: Duration::from_millis(500),
            auto_tts_enabled: false,
        };

        assert_eq!(config.response_timeout, Duration::from_secs(60));
        assert_eq!(config.stream_chunk_size, 1024);
        assert_eq!(config.memory_context_tokens, 4096);
        assert!(!config.auto_tts_enabled);
    }

    #[test]
    fn test_chat_engine_config_timeout_conversion() {
        let config = ChatEngineConfig::default();
        assert_eq!(config.response_timeout.as_secs(), 45);
        assert_eq!(config.response_timeout.as_millis(), 45000);
    }

    #[test]
    fn test_chat_engine_config_flush_interval_conversion() {
        let config = ChatEngineConfig::default();
        assert_eq!(config.memory_flush_interval.as_millis(), 350);
    }

    #[test]
    fn test_chat_engine_config_memory_ratios() {
        let config = ChatEngineConfig::default();
        // Context tokens should be less than retention tokens
        assert!(config.memory_context_tokens < config.memory_retention_tokens);
    }

    #[test]
    fn test_chat_engine_config_minimal() {
        let config = ChatEngineConfig {
            response_timeout: Duration::from_millis(1),
            stream_chunk_size: 1,
            memory_context_tokens: 1,
            memory_retention_tokens: 1,
            memory_flush_interval: Duration::from_millis(1),
            auto_tts_enabled: false,
        };

        assert_eq!(config.stream_chunk_size, 1);
        assert_eq!(config.memory_context_tokens, 1);
    }

    #[test]
    fn test_chat_engine_config_large_values() {
        let config = ChatEngineConfig {
            response_timeout: Duration::from_secs(300),
            stream_chunk_size: 65536,
            memory_context_tokens: 100_000,
            memory_retention_tokens: 200_000,
            memory_flush_interval: Duration::from_secs(10),
            auto_tts_enabled: true,
        };

        assert_eq!(config.response_timeout.as_secs(), 300);
        assert_eq!(config.stream_chunk_size, 65536);
    }
}
