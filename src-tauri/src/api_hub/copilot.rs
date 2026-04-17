//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v30.0.0 — GITHUB COPILOT PROVIDER
//! HTTP client pour GitHub Copilot / GitHub Models API
//! ═══════════════════════════════════════════════════════════════════════════════

// Allow .unwrap() in tests only (this is a common pattern in Rust testing)
#![cfg_attr(test, allow(clippy::unwrap_used))]

use crate::core::http_types::{header, Client};
use log::{debug, error, info, warn};
use serde::{Deserialize, Serialize};
use std::time::Duration;

// ✅ Confirmed from API research (STEP 1)
const COPILOT_API_BASE: &str = "https://api.github.com/models";
const COPILOT_TIMEOUT_SECS: u64 = 60;
const COPILOT_RATE_LIMIT_MESSAGE: &str =
    "Limite de taux Copilot atteinte. Réessayez dans quelques secondes.";
const COPILOT_MAX_RATE_LIMIT_RETRIES: u8 = 2;
const COPILOT_RETRY_BACKOFF_BASE_SECS: u64 = 2;
const COPILOT_RETRY_DELAY_CAP_SECS: u64 = 60;

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
        let mut rate_limit_retries: u8 = 0;

        debug!("Sending Copilot request: model={}", request.model);

        loop {
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
                let headers = response.headers().clone();
                let error_body = response
                    .text()
                    .await
                    .unwrap_or_else(|_| "Unknown error".to_string());
                error!("Copilot API error {}: {}", status, error_body);

                if is_copilot_rate_limited(status.as_u16(), &headers, &error_body)
                    && rate_limit_retries < COPILOT_MAX_RATE_LIMIT_RETRIES
                {
                    rate_limit_retries = rate_limit_retries.saturating_add(1);
                    let retry_delay = compute_rate_limit_retry_delay(&headers, rate_limit_retries);
                    warn!(
                        "Copilot rate limited (status {}). Retrying in {}s (attempt {}/{})",
                        status, retry_delay, rate_limit_retries, COPILOT_MAX_RATE_LIMIT_RETRIES
                    );
                    tokio::time::sleep(Duration::from_secs(retry_delay)).await;
                    continue;
                }

                return Err(classify_copilot_error(
                    status.as_u16(),
                    &headers,
                    &error_body,
                ));
            }

            let copilot_response: CopilotResponse = response.json().await.map_err(|e| {
                error!("Failed to parse Copilot response: {}", e);
                format!("Invalid response format: {}", e)
            })?;

            info!("Copilot response OK: model={}", copilot_response.model);

            return Ok(copilot_response);
        }
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

fn classify_copilot_error(
    status_code: u16,
    headers: &header::HeaderMap,
    error_body: &str,
) -> String {
    if is_copilot_rate_limited(status_code, headers, error_body) {
        return build_copilot_rate_limit_message(headers);
    }

    match status_code {
        401 => "Clé API Copilot invalide. Vérifiez votre token GitHub.".to_string(),
        403 => "Accès refusé. Vérifiez les permissions de votre token GitHub.".to_string(),
        _ => format!("Erreur Copilot ({}): {}", status_code, error_body),
    }
}

fn is_copilot_rate_limited(
    status_code: u16,
    headers: &header::HeaderMap,
    error_body: &str,
) -> bool {
    if status_code == 429 {
        return true;
    }

    if status_code != 403 {
        return false;
    }

    let body = error_body.to_ascii_lowercase();
    let mentions_rate_limit = [
        "rate limit",
        "secondary rate limit",
        "api rate limit exceeded",
        "retry after",
        "too many requests",
    ]
    .iter()
    .any(|needle| body.contains(needle));

    mentions_rate_limit
        || headers.contains_key(header::RETRY_AFTER)
        || header_value_eq(headers, "x-ratelimit-remaining", "0")
}

fn build_copilot_rate_limit_message(headers: &header::HeaderMap) -> String {
    match retry_after_seconds(headers) {
        Some(seconds) if seconds > 0 => {
            format!(
                "Limite de taux Copilot atteinte. Réessayez dans environ {}s.",
                seconds
            )
        }
        _ => COPILOT_RATE_LIMIT_MESSAGE.to_string(),
    }
}

fn retry_after_seconds(headers: &header::HeaderMap) -> Option<u64> {
    headers
        .get(header::RETRY_AFTER)
        .and_then(|value| value.to_str().ok())
        .and_then(|value| value.trim().parse::<u64>().ok())
}

fn compute_rate_limit_retry_delay(headers: &header::HeaderMap, retry_attempt: u8) -> u64 {
    if let Some(seconds) = retry_after_seconds(headers) {
        return seconds.min(COPILOT_RETRY_DELAY_CAP_SECS);
    }

    let multiplier = 2u64.saturating_pow(retry_attempt.saturating_sub(1) as u32);
    COPILOT_RETRY_BACKOFF_BASE_SECS
        .saturating_mul(multiplier)
        .min(COPILOT_RETRY_DELAY_CAP_SECS)
}

fn header_value_eq(headers: &header::HeaderMap, key: &str, expected: &str) -> bool {
    headers
        .get(key)
        .and_then(|value| value.to_str().ok())
        .map(|value| value.trim() == expected)
        .unwrap_or(false)
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

    #[test]
    fn test_classify_copilot_error_keeps_permission_denied_for_regular_403() {
        let headers = header::HeaderMap::new();

        let message = classify_copilot_error(403, &headers, "Resource not accessible by token");

        assert_eq!(
            message,
            "Accès refusé. Vérifiez les permissions de votre token GitHub."
        );
    }

    #[test]
    fn test_classify_copilot_error_detects_rate_limit_body_on_403() {
        let headers = header::HeaderMap::new();

        let message = classify_copilot_error(
            403,
            &headers,
            "You have exceeded a secondary rate limit. Please retry after a while.",
        );

        assert_eq!(message, COPILOT_RATE_LIMIT_MESSAGE);
    }

    #[test]
    fn test_classify_copilot_error_uses_retry_after_when_rate_limited() {
        let mut headers = header::HeaderMap::new();
        headers.insert(header::RETRY_AFTER, header::HeaderValue::from_static("42"));
        headers.insert(
            "x-ratelimit-remaining",
            header::HeaderValue::from_static("0"),
        );

        let message = classify_copilot_error(403, &headers, "Forbidden");

        assert_eq!(
            message,
            "Limite de taux Copilot atteinte. Réessayez dans environ 42s."
        );
    }

    #[test]
    fn test_classify_copilot_error_preserves_429_as_rate_limit() {
        let headers = header::HeaderMap::new();

        let message = classify_copilot_error(429, &headers, "Too many requests");

        assert_eq!(message, COPILOT_RATE_LIMIT_MESSAGE);
    }

    #[test]
    fn test_compute_rate_limit_retry_delay_prefers_retry_after_and_caps() {
        let mut headers = header::HeaderMap::new();
        headers.insert(header::RETRY_AFTER, header::HeaderValue::from_static("120"));

        let delay = compute_rate_limit_retry_delay(&headers, 1);

        assert_eq!(delay, COPILOT_RETRY_DELAY_CAP_SECS);
    }

    #[test]
    fn test_compute_rate_limit_retry_delay_uses_exponential_backoff_without_header() {
        let headers = header::HeaderMap::new();

        assert_eq!(compute_rate_limit_retry_delay(&headers, 1), 2);
        assert_eq!(compute_rate_limit_retry_delay(&headers, 2), 4);
    }
}
