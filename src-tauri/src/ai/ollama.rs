// TITANE∞ v12 - Ollama Local AI Provider
// Local AI inference with Ollama (llama3, mistral, phi4, etc.)

use super::{AIError, AIRequest, AIResponse, AIProvider, AIResult};
use serde::{Deserialize, Serialize};
use std::process::Command;
use std::time::Duration;

const OLLAMA_API_URL: &str = "http://localhost:11434/api/generate";
const DEFAULT_MODEL: &str = "llama3";
const TIMEOUT_SECONDS: u64 = 60;

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
    num_predict: usize,
}

#[derive(Debug, Deserialize)]
struct OllamaResponse {
    response: String,
    done: bool,
}

pub struct OllamaClient {
    model: String,
    client: reqwest::Client,
}

impl OllamaClient {
    pub fn new(model: Option<String>) -> Self {
        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(TIMEOUT_SECONDS))
            .build()
            .unwrap_or_else(|_| reqwest::Client::new());

        Self {
            model: model.unwrap_or_else(|| DEFAULT_MODEL.to_string()),
            client,
        }
    }

    pub fn is_installed(&self) -> bool {
        Command::new("ollama")
            .arg("list")
            .output()
            .map(|output| output.status.success())
            .unwrap_or(false)
    }

    pub async fn is_available(&self) -> bool {
        if !self.is_installed() {
            return false;
        }

        // Check if Ollama daemon is running
        self.client
            .get("http://localhost:11434/api/tags")
            .timeout(Duration::from_secs(2))
            .send()
            .await
            .is_ok()
    }

    pub async fn query(&self, request: &AIRequest) -> AIResult<AIResponse> {
        if !self.is_available().await {
            return Err(AIError::NetworkError(
                "Ollama daemon not running".to_string(),
            ));
        }

        let ollama_request = OllamaRequest {
            model: self.model.clone(),
            prompt: request.prompt.clone(),
            stream: false,
            options: OllamaOptions {
                temperature: request.temperature,
                num_predict: request.max_tokens,
            },
        };

        let response = self
            .client
            .post(OLLAMA_API_URL)
            .json(&ollama_request)
            .send()
            .await
            .map_err(|e| AIError::NetworkError(e.to_string()))?;

        if !response.status().is_success() {
            return Err(AIError::APIError(format!(
                "Ollama API error: {}",
                response.status()
            )));
        }

        let ollama_response: OllamaResponse = response
            .json()
            .await
            .map_err(|e| AIError::InvalidResponse(e.to_string()))?;

        let tokens = ollama_response.response.split_whitespace().count();

        Ok(AIResponse {
            content: ollama_response.response,
            provider: AIProvider::Ollama,
            timestamp: chrono::Utc::now().timestamp(),
            tokens,
        })
    }

    pub async fn query_stream(&self, request: &AIRequest) -> AIResult<AIResponse> {
        // For now, fallback to non-streaming
        // TODO: Implement true streaming
        self.query(request).await
    }

    pub fn get_available_models(&self) -> Vec<String> {
        Command::new("ollama")
            .arg("list")
            .output()
            .ok()
            .and_then(|output| String::from_utf8(output.stdout).ok())
            .map(|s| {
                s.lines()
                    .skip(1) // Skip header
                    .filter_map(|line| line.split_whitespace().next())
                    .map(String::from)
                    .collect()
            })
            .unwrap_or_default()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ollama_installed() {
        let client = OllamaClient::new(None);
        // Should not panic
        let _ = client.is_installed();
    }

    #[tokio::test]
    async fn test_ollama_availability() {
        let client = OllamaClient::new(None);
        // Should not panic
        let _ = client.is_available().await;
    }
}
