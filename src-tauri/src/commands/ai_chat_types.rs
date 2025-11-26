// TITANE∞ v14 - AI Chat Types
// Shared types for frontend-backend communication

use serde::{Deserialize, Serialize};

/// Request pour chat AI
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatRequest {
    pub message: String,
    pub conversation_id: Option<String>,
    pub provider: ProviderType,
    pub model: Option<String>,
    pub streaming: bool,
    pub images: Option<Vec<String>>, // base64
    pub system_prompt: Option<String>,
}

/// Type de provider
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProviderType {
    Auto,
    Gemini,
    Ollama,
    Local,
}

impl Default for ProviderType {
    fn default() -> Self {
        ProviderType::Auto
    }
}

/// Response complète de chat
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatResponse {
    pub message: ChatMessage,
    pub success: bool,
    pub error: Option<String>,
    pub latency_ms: u64,
}

/// Message de chat
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub id: String,
    pub role: String, // "user", "assistant", "system"
    pub content: String,
    pub timestamp: i64,
    pub provider: String,
    pub model: String,
    pub tokens: Option<usize>,
    pub multimodal: bool,
}

/// Statut d'un provider
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderStatus {
    pub provider: String,
    pub available: bool,
    pub latency_ms: u64,
    pub models: Vec<String>,
    pub error: Option<String>,
}
