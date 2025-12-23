// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — Anthropic Claude Integration
//   Secure API calls with Messages API v1
//   Models: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku
// ═══════════════════════════════════════════════════════════════

use log::{debug, error, info, warn};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Instant;

const CLAUDE_API_URL: &str = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL: &str = "claude-3-5-sonnet-20241022"; // Claude 3.5 Sonnet
const ANTHROPIC_VERSION: &str = "2023-06-01";
const MAX_TOKENS: usize = 4096;
const MAX_CONTEXT_LENGTH: usize = 100000; // Claude supports 200k context

#[derive(Debug, Serialize, Deserialize)]
pub struct ClaudeRequest {
    pub message: String,
    pub history: Vec<ClaudeMessage>,
    pub system_prompt: Option<String>,
    pub temperature: f32,
    pub max_tokens: Option<usize>,
    pub model: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClaudeMessage {
    pub role: String, // "user" | "assistant"
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ClaudeResponse {
    pub content: String,
    pub model: String,
    pub tokens_input: usize,
    pub tokens_output: usize,
    pub stop_reason: String,
    pub latency_ms: u64,
}

#[derive(Debug, Serialize)]
struct ClaudeAPIRequest {
    model: String,
    messages: Vec<ClaudeMessage>,
    #[serde(skip_serializing_if = "Option::is_none")]
    system: Option<String>,
    temperature: f32,
    max_tokens: usize,
}

#[derive(Debug, Deserialize)]
struct ClaudeAPIResponse {
    content: Vec<ContentBlock>,
    model: String,
    stop_reason: String,
    usage: ClaudeUsage,
}

#[derive(Debug, Deserialize)]
struct ContentBlock {
    #[serde(rename = "type")]
    block_type: String,
    text: String,
}

#[derive(Debug, Deserialize)]
struct ClaudeUsage {
    input_tokens: usize,
    output_tokens: usize,
}

pub struct ClaudeClient {
    api_key: String,
    client: Client,
}

impl ClaudeClient {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            client: Client::new(),
        }
    }

    /// Generate response
    pub async fn generate(&self, request: ClaudeRequest) -> Result<ClaudeResponse, String> {
        let start = Instant::now();

        // Validate and sanitize
        let sanitized_message = self.sanitize_input(&request.message)?;
        let truncated_history = self.truncate_history(&request.history);

        // Build messages array (Claude requires alternating user/assistant)
        let mut messages = truncated_history;
        messages.push(ClaudeMessage {
            role: "user".to_string(),
            content: sanitized_message,
        });

        let api_request = ClaudeAPIRequest {
            model: request.model.unwrap_or_else(|| DEFAULT_MODEL.to_string()),
            messages,
            system: request.system_prompt,
            temperature: request.temperature.clamp(0.0, 1.0),
            max_tokens: request.max_tokens.unwrap_or(MAX_TOKENS),
        };

        debug!("[Claude] Envoi requête API...");

        let response = self
            .client
            .post(CLAUDE_API_URL)
            .header("x-api-key", &self.api_key)
            .header("anthropic-version", ANTHROPIC_VERSION)
            .header("Content-Type", "application/json")
            .json(&api_request)
            .send()
            .await
            .map_err(|e| format!("Échec requête: {}", e))?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            error!("[Claude] Erreur API {}: {}", status, error_text);
            return Err(format!("Erreur API {}: {}", status, error_text));
        }

        let api_response: ClaudeAPIResponse = response
            .json()
            .await
            .map_err(|e| format!("Échec parsing réponse: {}", e))?;

        let latency = start.elapsed().as_millis() as u64;

        let content = api_response
            .content
            .first()
            .ok_or("Aucun bloc de contenu dans la réponse")?;

        info!(
            "[Claude] ✅ Réponse reçue ({} in, {} out tokens, {} ms)",
            api_response.usage.input_tokens, api_response.usage.output_tokens, latency
        );

        Ok(ClaudeResponse {
            content: content.text.clone(),
            model: api_response.model,
            tokens_input: api_response.usage.input_tokens,
            tokens_output: api_response.usage.output_tokens,
            stop_reason: api_response.stop_reason,
            latency_ms: latency,
        })
    }

    /// Sanitize user input
    fn sanitize_input(&self, message: &str) -> Result<String, String> {
        if message.trim().is_empty() {
            return Err("Message vide".into());
        }

        if message.len() > MAX_CONTEXT_LENGTH {
            warn!(
                "[Claude] Troncature message {} → {} chars",
                message.len(),
                MAX_CONTEXT_LENGTH
            );
            Ok(message.chars().take(MAX_CONTEXT_LENGTH).collect())
        } else {
            Ok(message.trim().to_string())
        }
    }

    /// Truncate and validate history (Claude requires alternating roles)
    fn truncate_history(&self, history: &[ClaudeMessage]) -> Vec<ClaudeMessage> {
        let mut total_chars = 0;
        let mut result = Vec::new();

        for msg in history.iter().rev() {
            let msg_len = msg.content.len();
            if total_chars + msg_len > MAX_CONTEXT_LENGTH / 2 {
                break;
            }
            total_chars += msg_len;
            result.push(msg.clone());
        }

        result.reverse();

        // Ensure alternating user/assistant roles
        self.ensure_alternating_roles(result)
    }

    /// Ensure messages alternate between user and assistant
    fn ensure_alternating_roles(&self, messages: Vec<ClaudeMessage>) -> Vec<ClaudeMessage> {
        let mut result = Vec::new();
        let mut last_role: Option<String> = None;

        for msg in messages {
            if let Some(ref last) = last_role {
                if last == &msg.role {
                    // Skip duplicate role
                    warn!("[Claude] Saut message {} dupliqué", msg.role);
                    continue;
                }
            }
            last_role = Some(msg.role.clone());
            result.push(msg);
        }

        // Must start with user message
        if !result.is_empty() && result[0].role == "assistant" {
            warn!("[Claude] Suppression premier message assistant");
            result.remove(0);
        }

        result
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sanitize_input() {
        let client = ClaudeClient::new("test_key".to_string());

        assert!(client.sanitize_input("").is_err());
        assert!(client.sanitize_input("   ").is_err());

        let result = client
            .sanitize_input("Bonjour!")
            .expect("valid input should pass sanitation");
        assert_eq!(result, "Bonjour!");

        let long_msg = "x".repeat(MAX_CONTEXT_LENGTH + 1000);
        let result = client
            .sanitize_input(&long_msg)
            .expect("long message should be truncated not errored");
        assert_eq!(result.len(), MAX_CONTEXT_LENGTH);
    }

    #[test]
    fn test_ensure_alternating_roles() {
        let client = ClaudeClient::new("test_key".to_string());

        // Duplicate user messages
        let messages = vec![
            ClaudeMessage {
                role: "user".to_string(),
                content: "Hello".to_string(),
            },
            ClaudeMessage {
                role: "user".to_string(),
                content: "World".to_string(),
            },
            ClaudeMessage {
                role: "assistant".to_string(),
                content: "Hi".to_string(),
            },
        ];

        let result = client.ensure_alternating_roles(messages);

        assert_eq!(result.len(), 2);
        assert_eq!(result[0].role, "user");
        assert_eq!(result[1].role, "assistant");
    }

    #[test]
    fn test_ensure_starts_with_user() {
        let client = ClaudeClient::new("test_key".to_string());

        let messages = vec![
            ClaudeMessage {
                role: "assistant".to_string(),
                content: "Bad start".to_string(),
            },
            ClaudeMessage {
                role: "user".to_string(),
                content: "Good".to_string(),
            },
        ];

        let result = client.ensure_alternating_roles(messages);

        assert_eq!(result.len(), 1);
        assert_eq!(result[0].role, "user");
    }
}
