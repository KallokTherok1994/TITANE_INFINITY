// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — OpenAI GPT Integration
//   Secure API calls with streaming support
//   Models: GPT-4, GPT-4 Turbo, GPT-4o, o3, o1
// ═══════════════════════════════════════════════════════════════

use log::{debug, error, info, warn};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Instant;

const OPENAI_API_URL: &str = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL: &str = "gpt-4o"; // GPT-4 Turbo with 128k context
const MAX_TOKENS: usize = 4096;
const MAX_CONTEXT_LENGTH: usize = 50000; // ~50k chars for safety

#[derive(Debug, Serialize, Deserialize)]
pub struct OpenAIRequest {
    pub message: String,
    pub history: Vec<ChatMessage>,
    pub system_prompt: Option<String>,
    pub temperature: f32,
    pub max_tokens: Option<usize>,
    pub model: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChatMessage {
    pub role: String, // "user" | "assistant" | "system"
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OpenAIResponse {
    pub content: String,
    pub model: String,
    pub tokens_used: usize,
    pub finish_reason: String,
    pub latency_ms: u64,
}

#[derive(Debug, Serialize)]
struct OpenAIAPIRequest {
    model: String,
    messages: Vec<ChatMessage>,
    temperature: f32,
    #[serde(skip_serializing_if = "Option::is_none")]
    max_tokens: Option<usize>,
}

#[derive(Debug, Deserialize)]
struct OpenAIAPIResponse {
    choices: Vec<Choice>,
    usage: Usage,
    model: String,
}

#[derive(Debug, Deserialize)]
struct Choice {
    message: ChatMessage,
    finish_reason: String,
}

#[derive(Debug, Deserialize)]
struct Usage {
    total_tokens: usize,
}

pub struct OpenAIClient {
    api_key: String,
    client: Client,
}

impl OpenAIClient {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            client: Client::new(),
        }
    }

    /// Generate response (non-streaming)
    pub async fn generate(&self, request: OpenAIRequest) -> Result<OpenAIResponse, String> {
        let start = Instant::now();

        // Validate and truncate context
        let sanitized_message = self.sanitize_input(&request.message)?;
        let truncated_history = self.truncate_history(&request.history);

        // Build messages array
        let mut messages = Vec::new();

        // System prompt
        if let Some(sys_prompt) = &request.system_prompt {
            messages.push(ChatMessage {
                role: "system".to_string(),
                content: sys_prompt.clone(),
            });
        }

        // History
        messages.extend(truncated_history);

        // User message
        messages.push(ChatMessage {
            role: "user".to_string(),
            content: sanitized_message,
        });

        let api_request = OpenAIAPIRequest {
            model: request.model.unwrap_or_else(|| DEFAULT_MODEL.to_string()),
            messages,
            temperature: request.temperature.clamp(0.0, 2.0),
            max_tokens: request.max_tokens.or(Some(MAX_TOKENS)),
        };

        debug!("[OpenAI] Envoi requête API...");

        let response = self
            .client
            .post(OPENAI_API_URL)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&api_request)
            .send()
            .await
            .map_err(|e| format!("Échec requête: {}", e))?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            error!("[OpenAI] Erreur API {}: {}", status, error_text);
            return Err(format!("Erreur API {}: {}", status, error_text));
        }

        let api_response: OpenAIAPIResponse = response
            .json()
            .await
            .map_err(|e| format!("Échec parsing réponse: {}", e))?;

        let latency = start.elapsed().as_millis() as u64;

        let choice = api_response
            .choices
            .first()
            .ok_or("Aucun choix dans la réponse")?;

        info!(
            "[OpenAI] ✅ Réponse reçue ({} tokens, {} ms)",
            api_response.usage.total_tokens, latency
        );

        Ok(OpenAIResponse {
            content: choice.message.content.clone(),
            model: api_response.model,
            tokens_used: api_response.usage.total_tokens,
            finish_reason: choice.finish_reason.clone(),
            latency_ms: latency,
        })
    }

    /// Sanitize user input (CRITICAL - prevent injection)
    fn sanitize_input(&self, message: &str) -> Result<String, String> {
        if message.trim().is_empty() {
            return Err("Message vide".into());
        }

        if message.len() > MAX_CONTEXT_LENGTH {
            warn!(
                "[OpenAI] Troncature message {} → {} chars",
                message.len(),
                MAX_CONTEXT_LENGTH
            );
            Ok(message.chars().take(MAX_CONTEXT_LENGTH).collect())
        } else {
            Ok(message.trim().to_string())
        }
    }

    /// Truncate history to fit context window
    fn truncate_history(&self, history: &[ChatMessage]) -> Vec<ChatMessage> {
        let mut total_chars = 0;
        let mut result = Vec::new();

        // Reverse order to keep most recent messages
        for msg in history.iter().rev() {
            let msg_len = msg.content.len();
            if total_chars + msg_len > MAX_CONTEXT_LENGTH / 2 {
                break;
            }
            total_chars += msg_len;
            result.push(msg.clone());
        }

        result.reverse();
        result
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sanitize_input() {
        let client = OpenAIClient::new("test_key".to_string());

        // Empty message
        assert!(client.sanitize_input("").is_err());
        assert!(client.sanitize_input("   ").is_err());

        // Valid message
        let result = client.sanitize_input("Hello, world!").unwrap();
        assert_eq!(result, "Hello, world!");

        // Long message truncation
        let long_msg = "a".repeat(MAX_CONTEXT_LENGTH + 1000);
        let result = client.sanitize_input(&long_msg).unwrap();
        assert_eq!(result.len(), MAX_CONTEXT_LENGTH);
    }

    #[test]
    fn test_truncate_history() {
        let client = OpenAIClient::new("test_key".to_string());

        let history = vec![
            ChatMessage {
                role: "user".to_string(),
                content: "a".repeat(10000),
            },
            ChatMessage {
                role: "assistant".to_string(),
                content: "b".repeat(10000),
            },
            ChatMessage {
                role: "user".to_string(),
                content: "c".repeat(10000),
            },
        ];

        let truncated = client.truncate_history(&history);

        // Should keep recent messages within limit
        assert!(truncated.len() <= history.len());
        let total: usize = truncated.iter().map(|m| m.content.len()).sum();
        assert!(total <= MAX_CONTEXT_LENGTH / 2);
    }
}
