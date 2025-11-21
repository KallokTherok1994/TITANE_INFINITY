// TITANE∞ v12 - AI Module
// Multi-provider AI system with automatic fallback (Gemini → Ollama)

pub mod gemini;
pub mod ollama;
pub mod router;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIRequest {
    pub prompt: String,
    pub temperature: f32,
    pub max_tokens: usize,
    pub stream: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIResponse {
    pub content: String,
    pub provider: AIProvider,
    pub timestamp: i64,
    pub tokens: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AIProvider {
    Gemini,
    Ollama,
    Offline,
}

#[derive(Debug)]
pub enum AIError {
    NetworkError(String),
    APIError(String),
    TimeoutError,
    InvalidResponse(String),
    NoProviderAvailable,
}

impl std::fmt::Display for AIError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AIError::NetworkError(e) => write!(f, "Network error: {}", e),
            AIError::APIError(e) => write!(f, "API error: {}", e),
            AIError::TimeoutError => write!(f, "Request timeout"),
            AIError::InvalidResponse(e) => write!(f, "Invalid response: {}", e),
            AIError::NoProviderAvailable => write!(f, "No AI provider available"),
        }
    }
}

impl std::error::Error for AIError {}

pub type AIResult<T> = Result<T, AIError>;
