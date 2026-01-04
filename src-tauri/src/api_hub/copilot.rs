//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v26.3 — GITHUB COPILOT PROVIDER
//! HTTP client pour GitHub Copilot / GitHub Models API
//! ═══════════════════════════════════════════════════════════════════════════════

// Allow .unwrap() in tests only (this is a common pattern in Rust testing)
#![cfg_attr(test, allow(clippy::unwrap_used))]

use log::{debug, error, info};
use reqwest::{header, Client};
use serde::{Deserialize, Serialize};
use std::time::Duration;

// ✅ Confirmed from API research (STEP 1)
const COPILOT_API_BASE: &str = "https://api.github.com/models";
const COPILOT_TIMEOUT_SECS: u64 = 60;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CopilotRequest {
    pub model: String,
    pub messages: Vec<Message>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens: Option<u32>,
    pub stream: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CopilotResponse {
    pub choices: Vec<Choice>,
    pub usage: Option<Usage>,
    pub model: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Choice {
    pub message: Message,
    pub finish_reason: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Usage {
    pub prompt_tokens: u32,
    pub completion_tokens: u32,
    pub total_tokens: u32,
}

/// Client GitHub Copilot
pub struct CopilotClient {
    client: Client,
    api_key: String,
}

impl CopilotClient {
    pub fn new(api_key: String) -> Result<Self, String> {
        let client = Client::builder()
            .timeout(Duration::from_secs(COPILOT_TIMEOUT_SECS))
            .build()
            .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

        Ok(Self { client, api_key })
    }

    /// Envoyer une requête chat non-streaming
    pub async fn send_chat(&self, request: CopilotRequest) -> Result<CopilotResponse, String> {
        let url = format!("{}/chat/completions", COPILOT_API_BASE);

        debug!("Sending Copilot request: model={}", request.model);

        let response = self
            .client
            .post(&url)
            .header(header::AUTHORIZATION, format!("Bearer {}", self.api_key))
            .header(header::CONTENT_TYPE, "application/json")
            .header(header::USER_AGENT, "TITANE-Infinity/v26.3")
            .json(&request)
            .send()
            .await
            .map_err(|e| {
                error!("Copilot HTTP request failed: {}", e);
                format!("Network error: {}", e)
            })?;

        let status = response.status();

        if !status.is_success() {
            let error_body = response
                .text()
                .await
                .unwrap_or_else(|_| "Unknown error".to_string());
            error!("Copilot API error {}: {}", status, error_body);

            return Err(match status.as_u16() {
                401 => "Clé API Copilot invalide. Vérifiez votre token GitHub.".to_string(),
                403 => "Accès refusé. Vérifiez les permissions de votre token GitHub.".to_string(),
                429 => {
                    "Limite de taux Copilot atteinte. Réessayez dans quelques secondes.".to_string()
                }
                _ => format!("Erreur Copilot ({}): {}", status, error_body),
            });
        }

        let copilot_response: CopilotResponse = response.json().await.map_err(|e| {
            error!("Failed to parse Copilot response: {}", e);
            format!("Invalid response format: {}", e)
        })?;

        info!("Copilot response OK: model={}", copilot_response.model);

        Ok(copilot_response)
    }

    /// Tester la connexion (simple ping)
    pub async fn test_connection(&self) -> Result<TestResult, String> {
        let start = std::time::Instant::now();

        // Test avec un message minimal
        let test_request = CopilotRequest {
            model: "gpt-4".to_string(),
            messages: vec![Message {
                role: "user".to_string(),
                content: "Hello".to_string(),
            }],
            temperature: Some(0.0),
            max_tokens: Some(5),
            stream: false,
        };

        match self.send_chat(test_request).await {
            Ok(response) => {
                let latency_ms = start.elapsed().as_millis() as u64;
                Ok(TestResult {
                    success: true,
                    message: format!("✅ Copilot connecté ({}ms)", latency_ms),
                    latency_ms: Some(latency_ms),
                    available_models: Some(vec![response.model]),
                })
            }
            Err(e) => Ok(TestResult {
                success: false,
                message: format!("❌ {}", e),
                latency_ms: None,
                available_models: None,
            }),
        }
    }

    /// Lister les modèles disponibles (fallback liste statique)
    pub async fn list_models(&self) -> Result<Vec<String>, String> {
        // Based on GitHub Models API documentation
        Ok(vec![
            "gpt-4".to_string(),
            "gpt-4o".to_string(),
            "gpt-3.5-turbo".to_string(),
        ])
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct TestResult {
    pub success: bool,
    pub message: String,
    pub latency_ms: Option<u64>,
    pub available_models: Option<Vec<String>>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_copilot_client_creation() {
        let client = CopilotClient::new("test_key".to_string());
        assert!(client.is_ok());
    }

    #[test]
    fn test_message_serialization() {
        let msg = Message {
            role: "user".to_string(),
            content: "test".to_string(),
        };
        let json = serde_json::to_string(&msg).unwrap();
        assert!(json.contains("user"));
        assert!(json.contains("test"));
    }
}
