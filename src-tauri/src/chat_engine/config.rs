use std::time::Duration;

/// Adaptive performance profile controlling all engine budgets.
///
/// - `Fast`:     Quick daily chat, low cognitive cost.
/// - `Balanced`: Default profile — rich, fast, stable.
/// - `Deep`:     Long audits/reports; only on explicit signal.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ChatProfile {
    Fast,
    Balanced,
    Deep,
}

impl Default for ChatProfile {
    fn default() -> Self {
        Self::Balanced
    }
}

impl ChatProfile {
    /// Parse from a string label (case-insensitive). Unknown values fall back to `Balanced`.
    pub fn from_str(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "fast" => Self::Fast,
            "deep" => Self::Deep,
            _ => Self::Balanced,
        }
    }
}

/// Configuration for the high-performance chat engine.
///
/// Fields are derived from a `ChatProfile`; use `ChatEngineConfig::for_profile()` to
/// construct. The `Default` implementation corresponds to `ChatProfile::Balanced`.
#[derive(Debug, Clone)]
pub struct ChatEngineConfig {
    /// Active performance profile (informational).
    pub profile: ChatProfile,
    /// Hard deadline for the entire generation request (streaming or not).
    pub response_timeout: Duration,
    /// Maximum wait before the first streaming token arrives.
    pub first_token_timeout: Duration,
    /// Maximum time allowed to fetch memory context entries.
    pub memory_fetch_timeout: Duration,
    /// Default chunk size (in characters) for streaming segmentation.
    pub stream_chunk_size: usize,
    /// Maximum number of tokens from memory to feed into the prompt context.
    pub memory_context_tokens: usize,
    /// Maximum total tokens allowed to be persisted for a conversation.
    pub memory_retention_tokens: usize,
    /// Interval used to debounce memory flush operations to disk.
    pub memory_flush_interval: Duration,
    /// Buffer capacity for stream channels.
    pub stream_channel_buffer: usize,
    /// Maximum number of sequential provider retries (0 = no retry).
    pub max_retry_chain: u8,
    /// Maximum number of provider fallback hops (0 = no fallback).
    pub max_fallback_chain: u8,
    /// Enables the text-to-speech pipeline automatically after a response.
    pub auto_tts_enabled: bool,
}

impl ChatEngineConfig {
    /// Construct a config tuned for the given profile.
    pub fn for_profile(profile: ChatProfile) -> Self {
        match profile {
            ChatProfile::Fast => Self {
                profile,
                response_timeout: Duration::from_millis(30_000),
                first_token_timeout: Duration::from_millis(5_000),
                memory_fetch_timeout: Duration::from_millis(2_000),
                stream_chunk_size: 640,
                memory_context_tokens: 2_560,
                memory_retention_tokens: 7_000,
                memory_flush_interval: Duration::from_millis(350),
                stream_channel_buffer: 40,
                max_retry_chain: 1,
                max_fallback_chain: 1,
                auto_tts_enabled: true,
            },
            ChatProfile::Balanced => Self {
                profile,
                response_timeout: Duration::from_millis(52_000),
                first_token_timeout: Duration::from_millis(7_000),
                memory_fetch_timeout: Duration::from_millis(3_000),
                stream_chunk_size: 832,
                memory_context_tokens: 3_584,
                memory_retention_tokens: 10_000,
                memory_flush_interval: Duration::from_millis(350),
                stream_channel_buffer: 56,
                max_retry_chain: 1,
                max_fallback_chain: 1,
                auto_tts_enabled: true,
            },
            ChatProfile::Deep => Self {
                profile,
                response_timeout: Duration::from_millis(82_000),
                first_token_timeout: Duration::from_millis(10_000),
                memory_fetch_timeout: Duration::from_millis(5_000),
                stream_chunk_size: 960,
                memory_context_tokens: 5_120,
                memory_retention_tokens: 14_000,
                memory_flush_interval: Duration::from_millis(350),
                stream_channel_buffer: 64,
                max_retry_chain: 1,
                max_fallback_chain: 1,
                auto_tts_enabled: true,
            },
        }
    }
}

impl Default for ChatEngineConfig {
    /// Defaults to the `Balanced` profile.
    fn default() -> Self {
        Self::for_profile(ChatProfile::Balanced)
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
        assert_eq!(config.stream_channel_buffer, 32);
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
            stream_channel_buffer: 64,
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
            stream_channel_buffer: 1,
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
            stream_channel_buffer: 1024,
            auto_tts_enabled: true,
        };

        assert_eq!(config.response_timeout.as_secs(), 300);
        assert_eq!(config.stream_chunk_size, 65536);
    }
}
