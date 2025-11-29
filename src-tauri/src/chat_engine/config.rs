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
