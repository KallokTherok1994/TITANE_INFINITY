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

    // ─── Profile tests ────────────────────────────────────────────

    #[test]
    fn test_profile_default_is_balanced() {
        assert_eq!(ChatProfile::default(), ChatProfile::Balanced);
    }

    #[test]
    fn test_profile_from_str() {
        assert_eq!(ChatProfile::from_str("fast"), ChatProfile::Fast);
        assert_eq!(ChatProfile::from_str("FAST"), ChatProfile::Fast);
        assert_eq!(ChatProfile::from_str("balanced"), ChatProfile::Balanced);
        assert_eq!(ChatProfile::from_str("deep"), ChatProfile::Deep);
        assert_eq!(ChatProfile::from_str("unknown"), ChatProfile::Balanced);
        assert_eq!(ChatProfile::from_str(""), ChatProfile::Balanced);
    }

    #[test]
    fn test_config_default_is_balanced() {
        let config = ChatEngineConfig::default();
        assert_eq!(config.profile, ChatProfile::Balanced);
        // Balanced target: context=3072-4096, retention=8000-12000
        assert!(config.memory_context_tokens >= 3_072);
        assert!(config.memory_context_tokens <= 4_096);
        assert!(config.memory_retention_tokens >= 8_000);
        assert!(config.memory_retention_tokens <= 12_000);
        // Stage timeouts present
        assert!(config.first_token_timeout.as_millis() > 0);
        assert!(config.memory_fetch_timeout.as_millis() > 0);
        // Bounded chains
        assert!(config.max_retry_chain <= 1);
        assert!(config.max_fallback_chain <= 1);
        assert!(config.auto_tts_enabled);
    }

    #[test]
    fn test_fast_profile_bounds() {
        let c = ChatEngineConfig::for_profile(ChatProfile::Fast);
        assert_eq!(c.profile, ChatProfile::Fast);
        // Fast must be faster than Balanced
        let balanced = ChatEngineConfig::for_profile(ChatProfile::Balanced);
        assert!(c.response_timeout <= balanced.response_timeout);
        assert!(c.first_token_timeout <= balanced.first_token_timeout);
        assert!(c.memory_context_tokens <= balanced.memory_context_tokens);
        assert!(c.max_retry_chain <= 1);
        assert!(c.max_fallback_chain <= 1);
    }

    #[test]
    fn test_deep_profile_bounds() {
        let c = ChatEngineConfig::for_profile(ChatProfile::Deep);
        assert_eq!(c.profile, ChatProfile::Deep);
        // Deep must be larger than Balanced
        let balanced = ChatEngineConfig::for_profile(ChatProfile::Balanced);
        assert!(c.response_timeout >= balanced.response_timeout);
        assert!(c.memory_context_tokens >= balanced.memory_context_tokens);
        assert!(c.memory_retention_tokens >= balanced.memory_retention_tokens);
        // Still bounded retries
        assert!(c.max_retry_chain <= 1);
        assert!(c.max_fallback_chain <= 1);
    }

    #[test]
    fn test_memory_ratios() {
        for profile in [ChatProfile::Fast, ChatProfile::Balanced, ChatProfile::Deep] {
            let c = ChatEngineConfig::for_profile(profile);
            assert!(
                c.memory_context_tokens < c.memory_retention_tokens,
                "context < retention violated for {:?}",
                profile
            );
        }
    }

    #[test]
    fn test_chat_engine_config_clone() {
        let config = ChatEngineConfig::default();
        let cloned = config.clone();
        assert_eq!(cloned.response_timeout, config.response_timeout);
        assert_eq!(cloned.stream_chunk_size, config.stream_chunk_size);
        assert_eq!(cloned.auto_tts_enabled, config.auto_tts_enabled);
        assert_eq!(cloned.max_retry_chain, config.max_retry_chain);
        assert_eq!(cloned.max_fallback_chain, config.max_fallback_chain);
    }

    #[test]
    fn test_chat_engine_config_debug() {
        let config = ChatEngineConfig::default();
        let debug_str = format!("{:?}", config);
        assert!(debug_str.contains("ChatEngineConfig"));
        assert!(debug_str.contains("response_timeout"));
        assert!(debug_str.contains("first_token_timeout"));
    }

    #[test]
    fn test_chat_engine_config_custom_values() {
        let config = ChatEngineConfig {
            profile: ChatProfile::Deep,
            response_timeout: Duration::from_secs(82),
            first_token_timeout: Duration::from_millis(10_000),
            memory_fetch_timeout: Duration::from_millis(5_000),
            stream_chunk_size: 960,
            memory_context_tokens: 5120,
            memory_retention_tokens: 14000,
            memory_flush_interval: Duration::from_millis(500),
            stream_channel_buffer: 64,
            max_retry_chain: 1,
            max_fallback_chain: 1,
            auto_tts_enabled: false,
        };

        assert_eq!(config.response_timeout.as_secs(), 82);
        assert_eq!(config.stream_chunk_size, 960);
        assert_eq!(config.memory_context_tokens, 5120);
        assert!(!config.auto_tts_enabled);
    }

    #[test]
    fn test_chat_engine_config_flush_interval() {
        let config = ChatEngineConfig::default();
        assert_eq!(config.memory_flush_interval.as_millis(), 350);
    }

    #[test]
    fn test_chat_engine_config_minimal() {
        let config = ChatEngineConfig {
            profile: ChatProfile::Fast,
            response_timeout: Duration::from_millis(1),
            first_token_timeout: Duration::from_millis(1),
            memory_fetch_timeout: Duration::from_millis(1),
            stream_chunk_size: 1,
            memory_context_tokens: 1,
            memory_retention_tokens: 2,
            memory_flush_interval: Duration::from_millis(1),
            stream_channel_buffer: 1,
            max_retry_chain: 0,
            max_fallback_chain: 0,
            auto_tts_enabled: false,
        };

        assert_eq!(config.stream_chunk_size, 1);
        assert_eq!(config.memory_context_tokens, 1);
        assert_eq!(config.max_retry_chain, 0);
    }
}
