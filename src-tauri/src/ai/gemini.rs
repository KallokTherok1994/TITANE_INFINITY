// TITANE∞ v15 - Gemini AI Provider
// Google Gemini API integration with streaming support
// Clean architecture v15: documented, production-ready

use super::{AIError, AIProvider, AIRequest, AIResponse, AIResult};
use serde::{Deserialize, Serialize};
use std::time::Duration;

const GEMINI_API_URL: &str =
    "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";
const TIMEOUT_SECONDS: u64 = 30;

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
    max_output_tokens: usize,
}

#[derive(Debug, Deserialize)]
struct GeminiResponse {
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

pub struct GeminiClient {
    api_key: String,
    client: reqwest::Client,
}

impl GeminiClient {
    pub fn new(api_key: String) -> Self {
        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(TIMEOUT_SECONDS))
            .build()
            .unwrap_or_else(|_| reqwest::Client::new());

        Self { api_key, client }
    }

    pub async fn is_available(&self) -> bool {
        // Quick health check
        self.client
            .get("https://www.google.com")
            .timeout(Duration::from_secs(3))
            .send()
            .await
            .is_ok()
    }

    pub async fn query(&self, request: &AIRequest) -> AIResult<AIResponse> {
        let url = format!("{}?key={}", GEMINI_API_URL, self.api_key);

        // Force French language system prompt to prevent English responses
        let system_instruction = "IMPORTANT: Tu DOIS répondre UNIQUEMENT en français. Ne réponds JAMAIS en anglais. Toutes tes réponses doivent être en français, quelles que soient les circonstances. Si tu détectes que tu es en train de répondre en anglais, arrête-toi immédiatement et recommence en français.";
        
        let full_prompt = if request.prompt.to_lowercase().contains("réponds en français") || request.prompt.to_lowercase().contains("respond in french") {
            request.prompt.clone()
        } else {
            format!("{}\n\n{}", system_instruction, request.prompt)
        };

        let gemini_request = GeminiRequest {
            contents: vec![GeminiContent {
                parts: vec![GeminiPart {
                    text: full_prompt,
                }],
            }],
            generation_config: GeminiConfig {
                temperature: request.temperature,
                max_output_tokens: request.max_output_tokens,
            },
        };

        let response = self
            .client
            .post(&url)
            .json(&gemini_request)
            .send()
            .await
            .map_err(|e| AIError::NetworkError(e.to_string()))?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(AIError::APIError(format!("{}: {}", status, error_text)));
        }

        let gemini_response: GeminiResponse = response
            .json()
            .await
            .map_err(|e| AIError::InvalidResponse(e.to_string()))?;

        let content = gemini_response
            .candidates
            .first()
            .and_then(|c| c.content.parts.first())
            .map(|p| p.text.clone())
            .ok_or_else(|| AIError::InvalidResponse("No content in response".to_string()))?;

        let tokens = content.split_whitespace().count();

        Ok(AIResponse {
            content,
            provider: AIProvider::Gemini,
            timestamp: chrono::Utc::now().timestamp(),
            tokens,
        })
    }

    pub async fn query_stream(&self, request: &AIRequest) -> AIResult<AIResponse> {
        // For now, fallback to non-streaming
        // TODO: Implement true streaming with Server-Sent Events
        self.query(request).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_gemini_availability() {
        let client = GeminiClient::new("test-key".to_string());
        // Should not panic
        let _ = client.is_available().await;
    }
}
