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
