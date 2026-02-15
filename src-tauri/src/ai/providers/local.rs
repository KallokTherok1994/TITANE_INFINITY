// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Local Models Provider
//   SUPER PROMPT #8 — Ollama/GGUF/ONNX Integration
// ═══════════════════════════════════════════════════════════════

use crate::ai::providers::{AiProvider, ProviderResult};
use crate::ai::{AIError, AiMetadata, AiMode, AiRequest, AiResponse};
use async_trait::async_trait;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Instant;

pub struct LocalProvider {
    ollama_url: String,
    client: Client,
    model_fast: String,
    model_quality: String,
}

impl LocalProvider {
    fn default_ollama_url() -> String {
        std::env::var("OLLAMA_BASE_URL")
            .or_else(|_| std::env::var("OLLAMA_URL"))
            .unwrap_or_else(|_| "http://127.0.0.1:11434".to_string())
    }

    pub fn new(ollama_url: Option<String>) -> Self {
        Self {
            ollama_url: ollama_url.unwrap_or_else(Self::default_ollama_url),
            client: Client::new(),
            model_fast: "gemma2:2b".to_string(),  // ✨ Use installed model (was "llama3")
            model_quality: "mistral:latest".to_string(),  // ✨ Use explicit tag
        }
    }

    fn select_model(&self, mode: AiMode) -> &str {
        match mode {
            AiMode::Fast => &self.model_fast,
            _ => &self.model_quality,
        }
    }

    async fn call_ollama_api(
        &self,
        model: &str,
        prompt: &str,
        temperature: f32,
    ) -> Result<OllamaResponse, AIError> {
        let request_body = OllamaRequest {
            model: model.to_string(),
            prompt: prompt.to_string(),
            stream: false,
            options: OllamaOptions { temperature },
        };

        let url = format!("{}/api/generate", self.ollama_url);

        let response = self
            .client
            .post(&url)
            .json(&request_body)
            .timeout(std::time::Duration::from_secs(60))
            .send()
            .await
            .map_err(|e| AIError::ProviderUnavailable {
                provider: "local".to_string(),
                reason: e.to_string(),
            })?;

        if !response.status().is_success() {
            return Err(AIError::ProviderUnavailable {
                provider: "local".to_string(),
                reason: format!("HTTP {}", response.status()),
            });
        }

        response
            .json::<OllamaResponse>()
            .await
            .map_err(|e| AIError::InvalidResponse(e.to_string()))
    }
}

#[async_trait]
impl AiProvider for LocalProvider {
    async fn generate(&self, req: &AiRequest) -> ProviderResult {
        let start = Instant::now();
        let model = self.select_model(req.mode);
        let temperature = req.temperature.unwrap_or(0.7);

        let response = self
            .call_ollama_api(model, &req.prompt, temperature)
            .await?;

        let latency = start.elapsed().as_millis();

        // Estimation des tokens (Ollama ne les retourne pas toujours)
        let tokens_in = (req.prompt.len() / 4) as u32;
        let tokens_out = (response.response.len() / 4) as u32;

        Ok(AiResponse {
            output: response.response,
            provider: "local".to_string(),
            model: model.to_string(),
            tokens_in,
            tokens_out,
            latency_ms: latency,
            confidence: 0.75, // Local models moyenne confiance
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
        "local"
    }

    async fn is_available(&self) -> bool {
        // Test rapide de connexion Ollama
        let url = format!("{}/api/tags", self.ollama_url);
        self.client
            .get(&url)
            .timeout(std::time::Duration::from_secs(2))
            .send()
            .await
            .map(|r| r.status().is_success())
            .unwrap_or(false)
    }

    fn cost_per_1k_tokens(&self) -> f32 {
        0.0 // Local = gratuit
    }

    fn average_latency_ms(&self) -> u128 {
        5000 // 5 secondes (plus lent que cloud)
    }
}

// ═══════════════════════════════════════════════════════════════
// TYPES OLLAMA API
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Serialize)]
struct OllamaRequest {
    model: String,
    prompt: String,
    stream: bool,
    options: OllamaOptions,
}

#[derive(Debug, Serialize)]
struct OllamaOptions {
    temperature: f32,
}

#[derive(Debug, Deserialize)]
struct OllamaResponse {
    response: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_model_selection() {
        let provider = LocalProvider::new(None);

        assert_eq!(provider.select_model(AiMode::Fast), "gemma2:2b");
        assert_eq!(provider.select_model(AiMode::Quality), "mistral:latest");
    }

    #[test]
    fn test_cost() {
        let provider = LocalProvider::new(None);
        assert_eq!(provider.cost_per_1k_tokens(), 0.0);
    }
}
