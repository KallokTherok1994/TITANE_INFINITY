// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — OpenAI Provider
//   SUPER PROMPT #8 — OpenAI GPT Integration
// ═══════════════════════════════════════════════════════════════

use crate::ai::{AiRequest, AiResponse, AiMetadata, AiMode, AIError};
use crate::ai::providers::{AiProvider, ProviderResult};
use async_trait::async_trait;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Instant;

pub struct OpenAiProvider {
    api_key: String,
    client: Client,
    model_gpt4: String,
    model_gpt4_mini: String,
    model_gpt35: String,
}

impl OpenAiProvider {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            client: Client::new(),
            model_gpt4: "gpt-4-turbo".to_string(),
            model_gpt4_mini: "gpt-4-turbo-mini".to_string(),
            model_gpt35: "gpt-3.5-turbo".to_string(),
        }
    }

    fn select_model(&self, mode: AiMode) -> &str {
        match mode {
            AiMode::Deep | AiMode::Creative => &self.model_gpt4,
            AiMode::Quality | AiMode::Analysis => &self.model_gpt4_mini,
            AiMode::Fast => &self.model_gpt35,
        }
    }

    async fn call_openai_api(
        &self,
        model: &str,
        prompt: &str,
        temperature: f32,
        max_tokens: u32,
    ) -> Result<OpenAiResponse, AIError> {
        let request_body = OpenAiRequest {
            model: model.to_string(),
            messages: vec![OpenAiMessage {
                role: "user".to_string(),
                content: prompt.to_string(),
            }],
            max_tokens,
            temperature,
        };

        let response = self
            .client
            .post("https://api.openai.com/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&request_body)
            .timeout(std::time::Duration::from_secs(30))
            .send()
            .await
            .map_err(|e| AIError::NetworkError(e.to_string()))?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            
            return Err(match status.as_u16() {
                401 => AIError::AuthenticationFailed { provider: "openai".to_string() },
                429 => AIError::RateLimitExceeded { 
                    provider: "openai".to_string(), 
                    retry_after: Some(60) 
                },
                _ => AIError::APIError(format!("OpenAI API error {}: {}", status, error_text)),
            });
        }

        response
            .json::<OpenAiResponse>()
            .await
            .map_err(|e| AIError::InvalidResponse(e.to_string()))
    }
}

#[async_trait]
impl AiProvider for OpenAiProvider {
    async fn generate(&self, req: &AiRequest) -> ProviderResult {
        let start = Instant::now();
        let model = self.select_model(req.mode);
        let temperature = req.temperature.unwrap_or(0.7);
        let max_tokens = req.max_tokens.unwrap_or(2048);

        let response = self
            .call_openai_api(model, &req.prompt, temperature, max_tokens)
            .await?;

        let latency = start.elapsed().as_millis();
        
        let choice = response
            .choices
            .first()
            .ok_or_else(|| AIError::InvalidResponse("No choices in response".to_string()))?;

        Ok(AiResponse {
            output: choice.message.content.clone(),
            provider: "openai".to_string(),
            model: model.to_string(),
            tokens_in: response.usage.prompt_tokens,
            tokens_out: response.usage.completion_tokens,
            latency_ms: latency,
            confidence: 0.85,
            metadata: AiMetadata {
                mode: req.mode.to_string(),
                temperature_used: Some(temperature),
                finish_reason: Some(choice.finish_reason.clone()),
                cached: false,
                fallback_triggered: false,
                evaluation_score: None,
            },
        })
    }

    fn name(&self) -> &'static str {
        "openai"
    }

    async fn is_available(&self) -> bool {
        !self.api_key.is_empty()
    }

    fn cost_per_1k_tokens(&self) -> f32 {
        0.01 // Prix moyen OpenAI
    }

    fn average_latency_ms(&self) -> u128 {
        1500 // 1.5 secondes moyenne
    }
}

// ═══════════════════════════════════════════════════════════════
// TYPES OPENAI API
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Serialize)]
struct OpenAiRequest {
    model: String,
    messages: Vec<OpenAiMessage>,
    max_tokens: u32,
    temperature: f32,
}

#[derive(Debug, Serialize, Deserialize)]
struct OpenAiMessage {
    role: String,
    content: String,
}

#[derive(Debug, Deserialize)]
struct OpenAiResponse {
    choices: Vec<OpenAiChoice>,
    usage: OpenAiUsage,
}

#[derive(Debug, Deserialize)]
struct OpenAiChoice {
    message: OpenAiMessage,
    finish_reason: String,
}

#[derive(Debug, Deserialize)]
struct OpenAiUsage {
    prompt_tokens: u32,
    completion_tokens: u32,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_model_selection() {
        let provider = OpenAiProvider::new("test_key".to_string());
        
        assert!(provider.select_model(AiMode::Deep).contains("gpt-4"));
        assert!(provider.select_model(AiMode::Fast).contains("3.5"));
    }

    #[tokio::test]
    async fn test_is_available() {
        let provider = OpenAiProvider::new("test_key".to_string());
        assert!(provider.is_available().await);
    }
}
