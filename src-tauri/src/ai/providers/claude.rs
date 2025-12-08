// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Claude Provider
//   SUPER PROMPT #8 — Anthropic Claude Integration
// ═══════════════════════════════════════════════════════════════

use crate::ai::{AiRequest, AiResponse, AiMetadata, AiMode, AIError};
use crate::ai::providers::{AiProvider, ProviderResult};
use async_trait::async_trait;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Instant;

pub struct ClaudeProvider {
    api_key: String,
    client: Client,
    model_opus: String,
    model_sonnet: String,
    model_haiku: String,
}

impl ClaudeProvider {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            client: Client::new(),
            model_opus: "claude-opus-4-20250514".to_string(),
            model_sonnet: "claude-sonnet-4-20250514".to_string(),
            model_haiku: "claude-haiku-4-20250223".to_string(),
        }
    }

    fn select_model(&self, mode: AiMode) -> &str {
        match mode {
            AiMode::Deep => &self.model_opus,
            AiMode::Quality | AiMode::Analysis => &self.model_sonnet,
            AiMode::Fast | AiMode::Creative => &self.model_haiku,
        }
    }

    async fn call_claude_api(
        &self,
        model: &str,
        prompt: &str,
        temperature: f32,
        max_tokens: u32,
    ) -> Result<ClaudeResponse, AIError> {
        let request_body = ClaudeRequest {
            model: model.to_string(),
            messages: vec![ClaudeMessage {
                role: "user".to_string(),
                content: prompt.to_string(),
            }],
            max_tokens,
            temperature,
        };

        let response = self
            .client
            .post("https://api.anthropic.com/v1/messages")
            .header("x-api-key", &self.api_key)
            .header("anthropic-version", "2023-06-01")
            .header("content-type", "application/json")
            .json(&request_body)
            .timeout(std::time::Duration::from_secs(30))
            .send()
            .await
            .map_err(|e| AIError::NetworkError(e.to_string()))?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            
            return Err(match status.as_u16() {
                401 => AIError::AuthenticationFailed { provider: "claude".to_string() },
                429 => AIError::RateLimitExceeded { 
                    provider: "claude".to_string(), 
                    retry_after: Some(60) 
                },
                _ => AIError::APIError(format!("Claude API error {}: {}", status, error_text)),
            });
        }

        response
            .json::<ClaudeResponse>()
            .await
            .map_err(|e| AIError::InvalidResponse(e.to_string()))
    }
}

#[async_trait]
impl AiProvider for ClaudeProvider {
    async fn generate(&self, req: &AiRequest) -> ProviderResult {
        let start = Instant::now();
        let model = self.select_model(req.mode);
        let temperature = req.temperature.unwrap_or(0.7);
        let max_tokens = req.max_tokens.unwrap_or(2048);

        let response = self
            .call_claude_api(model, &req.prompt, temperature, max_tokens)
            .await?;

        let latency = start.elapsed().as_millis();
        
        let output = response
            .content
            .first()
            .map(|c| c.text.clone())
            .unwrap_or_default();

        Ok(AiResponse {
            output,
            provider: "claude".to_string(),
            model: model.to_string(),
            tokens_in: response.usage.input_tokens,
            tokens_out: response.usage.output_tokens,
            latency_ms: latency,
            confidence: 0.9, // Claude a généralement haute confiance
            metadata: AiMetadata {
                mode: req.mode.to_string(),
                temperature_used: Some(temperature),
                finish_reason: Some(response.stop_reason),
                cached: false,
                fallback_triggered: false,
                evaluation_score: None,
            },
        })
    }

    fn name(&self) -> &'static str {
        "claude"
    }

    async fn is_available(&self) -> bool {
        !self.api_key.is_empty()
    }

    fn cost_per_1k_tokens(&self) -> f32 {
        // Prix moyen Anthropic (approximatif)
        0.015
    }

    fn average_latency_ms(&self) -> u128 {
        2000 // 2 secondes moyenne
    }
}

// ═══════════════════════════════════════════════════════════════
// TYPES CLAUDE API
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Serialize)]
struct ClaudeRequest {
    model: String,
    messages: Vec<ClaudeMessage>,
    max_tokens: u32,
    temperature: f32,
}

#[derive(Debug, Serialize, Deserialize)]
struct ClaudeMessage {
    role: String,
    content: String,
}

#[derive(Debug, Deserialize)]
struct ClaudeResponse {
    content: Vec<ClaudeContent>,
    stop_reason: String,
    usage: ClaudeUsage,
}

#[derive(Debug, Deserialize)]
struct ClaudeContent {
    text: String,
}

#[derive(Debug, Deserialize)]
struct ClaudeUsage {
    input_tokens: u32,
    output_tokens: u32,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_model_selection() {
        let provider = ClaudeProvider::new("test_key".to_string());
        
        assert!(provider.select_model(AiMode::Deep).contains("opus"));
        assert!(provider.select_model(AiMode::Quality).contains("sonnet"));
        assert!(provider.select_model(AiMode::Fast).contains("haiku"));
    }

    #[tokio::test]
    async fn test_is_available() {
        let provider = ClaudeProvider::new("test_key".to_string());
        assert!(provider.is_available().await);

        let empty_provider = ClaudeProvider::new("".to_string());
        assert!(!empty_provider.is_available().await);
    }
}
