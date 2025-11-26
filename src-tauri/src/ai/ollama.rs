// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.3.0 - Ollama Local AI (SECURED)
//   Local AI inference with ShellGuard protection
// ═══════════════════════════════════════════════════════════════

use super::{AIError, AIProvider, AIRequest, AIResponse, AIResult};
use crate::security::shell_guard::ShellGuard;
use serde::{Deserialize, Serialize};
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
    #[allow(dead_code)]
    done: bool,
}

pub struct OllamaClient {
    model: String,
    client: reqwest::Client,
    shell_guard: ShellGuard,
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
            shell_guard: ShellGuard::new(),
        }
    }

    pub fn is_installed(&self) -> bool {
        // ✅ SECURED: Use ShellGuard (ollama needs to be whitelisted)
        // Note: 'ollama' NOT in default whitelist, must be added to policy
        self.shell_guard
            .execute_verified("ollama", &["list"])
            .is_ok()
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
        // ✅ SECURED: Use ShellGuard
        self.shell_guard
            .execute_verified("ollama", &["list"])
            .ok()
            .map(|output| {
                output
                    .lines()
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
