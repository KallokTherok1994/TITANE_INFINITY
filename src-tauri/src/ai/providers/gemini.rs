// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Gemini Provider (Multi-IA)
//   v28.0 — Google Gemini Integration for Multi-Provider System
// ═══════════════════════════════════════════════════════════════

use crate::ai::providers::{AiProvider, ProviderResult};
use crate::ai::{AIError, AiMetadata, AiRequest, AiResponse};
use crate::core::http_types::Client;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::time::Instant;

const GEMINI_API_URL: &str =
    "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";

/// Approximate characters per token for estimation when provider doesn't return token counts.
const CHARS_PER_TOKEN_ESTIMATE: u32 = 4;

pub struct GeminiProvider {
    api_key: String,
    client: Client,
    model: String,
}

impl GeminiProvider {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            client: Client::new(),
            model: "gemini-2.0-flash".to_string(),
        }
    }

    async fn call_gemini_api(
        &self,
        prompt: &str,
        temperature: f32,
        max_tokens: u32,
    ) -> Result<GeminiApiResponse, AIError> {
        let url = format!("{}?key={}", GEMINI_API_URL, self.api_key);

        let request_body = GeminiRequest {
            contents: vec![GeminiContent {
                parts: vec![GeminiPart {
                    text: prompt.to_string(),
                }],
            }],
            generation_config: GeminiConfig {
                temperature,
                max_output_tokens: max_tokens,
            },
        };

        let response = self
            .client
            .post(&url)
            .header("Content-Type", "application/json")
            .json(&request_body)
            .timeout(std::time::Duration::from_secs(30))
            .send()
            .await
            .map_err(|e| AIError::NetworkError(e.to_string()))?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            // Sanitize error to prevent API key leakage via URL query params or body
            let sanitized = {
                let mut text = error_text.clone();
                // Strip query params containing keys from URLs
                let lower = text.to_lowercase();
                if lower.contains("key=") || lower.contains("apikey=") || lower.contains("token=") {
                    text = text
                        .split_whitespace()
                        .map(|w| {
                            if let Some(pos) = w.find("?key=") {
                                &w[..pos]
                            } else if let Some(pos) = w.find("&key=") {
                                &w[..pos]
                            } else {
                                w
                            }
                        })
                        .collect::<Vec<_>>()
                        .join(" ");
                }
                // Redact the actual API key value if it appears in the error body
                if !self.api_key.is_empty() && text.contains(&self.api_key) {
                    text = text.replace(&self.api_key, "[REDACTED]");
                }
                text
            };

            return Err(match status.as_u16() {
                401 | 403 => AIError::AuthenticationFailed {
                    provider: "gemini".to_string(),
                },
                429 => AIError::RateLimitExceeded {
                    provider: "gemini".to_string(),
                    retry_after: Some(60),
                },
                _ => AIError::APIError(format!("Gemini API error {}: {}", status, sanitized)),
            });
        }

        response
            .json::<GeminiApiResponse>()
            .await
            .map_err(|e| AIError::InvalidResponse(e.to_string()))
    }
}

#[async_trait]
impl AiProvider for GeminiProvider {
    async fn generate(&self, req: &AiRequest) -> ProviderResult {
        let start = Instant::now();
        let temperature = req.temperature.unwrap_or(0.7);
        let max_tokens = req.max_tokens.unwrap_or(2048);

        let response = self
            .call_gemini_api(&req.prompt, temperature, max_tokens)
            .await?;

        let latency = start.elapsed().as_millis();

        let output = response
            .candidates
            .first()
            .and_then(|c| c.content.parts.first())
            .map(|p| p.text.clone())
            .ok_or_else(|| AIError::InvalidResponse("No content in Gemini response".to_string()))?;

        let tokens_in = (req.prompt.len() as u32) / CHARS_PER_TOKEN_ESTIMATE;
        let tokens_out = (output.len() as u32) / CHARS_PER_TOKEN_ESTIMATE;

        Ok(AiResponse {
            output,
            provider: "gemini".to_string(),
            model: self.model.clone(),
            tokens_in,
            tokens_out,
            latency_ms: latency,
            confidence: 0.85,
            metadata: AiMetadata {
                mode: req.mode.to_string(),
                temperature_used: Some(temperature),
                finish_reason: Some("stop".to_string()),
                cached: false,
                fallback_triggered: false,
                evaluation_score: None,
            },
        })
    }

    fn name(&self) -> &'static str {
        "gemini"
    }

    async fn is_available(&self) -> bool {
        !self.api_key.is_empty()
    }

    fn cost_per_1k_tokens(&self) -> f32 {
        0.0005 // Gemini Flash is very cost-effective
    }

    fn average_latency_ms(&self) -> u128 {
        1200 // ~1.2 seconds average
    }
}

// ═══════════════════════════════════════════════════════════════
// TYPES GEMINI API
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Serialize)]
struct GeminiRequest {
    contents: Vec<GeminiContent>,
    #[serde(rename = "generationConfig")]
    generation_config: GeminiConfig,
}

#[derive(Debug, Serialize)]
struct GeminiContent {
    parts: Vec<GeminiPart>,
}

#[derive(Debug, Serialize)]
struct GeminiPart {
    text: String,
}

#[derive(Debug, Serialize)]
struct GeminiConfig {
    temperature: f32,
    #[serde(rename = "maxOutputTokens")]
    max_output_tokens: u32,
}

#[derive(Debug, Deserialize)]
struct GeminiApiResponse {
    candidates: Vec<GeminiCandidate>,
}

#[derive(Debug, Deserialize)]
struct GeminiCandidate {
    content: GeminiContentResponse,
}

#[derive(Debug, Deserialize)]
struct GeminiContentResponse {
    parts: Vec<GeminiPartResponse>,
}

#[derive(Debug, Deserialize)]
struct GeminiPartResponse {
    text: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_gemini_provider_creation() {
        let provider = GeminiProvider::new("test_key".to_string());
        assert_eq!(provider.name(), "gemini");
        assert_eq!(provider.model, "gemini-2.0-flash");
    }

    #[tokio::test]
    async fn test_gemini_is_available() {
        let provider = GeminiProvider::new("test_key".to_string());
        assert!(provider.is_available().await);

        let empty_provider = GeminiProvider::new("".to_string());
        assert!(!empty_provider.is_available().await);
    }

    #[test]
    fn test_gemini_cost() {
        let provider = GeminiProvider::new("test_key".to_string());
        assert!(provider.cost_per_1k_tokens() < 0.001); // Very cheap
    }
}
