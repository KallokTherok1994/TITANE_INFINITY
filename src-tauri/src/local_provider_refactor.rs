use crate::epic1_provider_refactor::{Provider, ProviderError, ProviderResult};
use async_trait::async_trait;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;

/// Operating mode for local inference
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LocalMode {
    Fast,
    Quality,
}

/// Configuration for the local provider
#[derive(Debug, Clone)]
pub struct LocalConfig {
    pub base_url: String,
    pub model_fast: String,
    pub model_quality: String,
    pub default_mode: LocalMode,
    pub temperature: f32,
    pub timeout_secs: u64,
}

impl Default for LocalConfig {
    fn default() -> Self {
        let base_url = std::env::var("OLLAMA_BASE_URL")
            .or_else(|_| std::env::var("OLLAMA_URL"))
            .unwrap_or_else(|_| "http://127.0.0.1:11434".to_string());

        LocalConfig {
            base_url,
            model_fast: "llama3".to_string(),
            model_quality: "mistral".to_string(),
            default_mode: LocalMode::Quality,
            temperature: 0.7,
            timeout_secs: 60,
        }
    }
}

/// Refactored Local Provider with Result-based error handling
pub struct LocalProvider {
    config: LocalConfig,
    client: Client,
    health_status: bool,
}

impl LocalProvider {
    /// Create a new Local provider instance
    pub fn new(config: LocalConfig) -> ProviderResult<Self> {
        let client = Client::builder()
            .timeout(Duration::from_secs(config.timeout_secs))
            .build()
            .map_err(|e| ProviderError::ConnectionFailed(
                format!("Failed to create HTTP client: {}", e),
            ))?;

        let provider = LocalProvider {
            config,
            client,
            health_status: true,
        };

        provider.validate_config()?;
        Ok(provider)
    }

    fn validate_config(&self) -> ProviderResult<()> {
        if self.config.base_url.trim().is_empty() {
            return Err(ProviderError::InvalidResponse(
                "Local base URL is empty".to_string(),
            ));
        }

        if self.config.model_fast.trim().is_empty() {
            return Err(ProviderError::InvalidResponse(
                "Fast model name is empty".to_string(),
            ));
        }

        if self.config.model_quality.trim().is_empty() {
            return Err(ProviderError::InvalidResponse(
                "Quality model name is empty".to_string(),
            ));
        }

        if !(0.0..=2.0).contains(&self.config.temperature) {
            return Err(ProviderError::InvalidResponse(
                format!("Invalid temperature: {} (must be 0.0-2.0)", self.config.temperature),
            ));
        }

        if self.config.timeout_secs == 0 {
            return Err(ProviderError::InvalidResponse(
                "Timeout must be greater than 0 seconds".to_string(),
            ));
        }

        Ok(())
    }

    fn select_model(&self) -> &str {
        match self.config.default_mode {
            LocalMode::Fast => &self.config.model_fast,
            LocalMode::Quality => &self.config.model_quality,
        }
    }

    fn build_endpoint(&self) -> String {
        format!("{}/api/generate", self.config.base_url)
    }

    fn build_request(&self, prompt: &str) -> LocalRequest {
        LocalRequest {
            model: self.select_model().to_string(),
            prompt: prompt.to_string(),
            stream: false,
            options: LocalOptions {
                temperature: self.config.temperature,
            },
        }
    }

    fn parse_response(&self, body: &str) -> ProviderResult<String> {
        if let Ok(response) = serde_json::from_str::<LocalResponse>(body) {
            if response.response.trim().is_empty() {
                return Err(ProviderError::InvalidResponse(
                    "Empty response from local provider".to_string(),
                ));
            }

            if let Some(done) = response.done {
                if !done {
                    return Err(ProviderError::InvalidResponse(
                        "Incomplete response (done=false)".to_string(),
                    ));
                }
            }

            return Ok(response.response);
        }

        if let Ok(err) = serde_json::from_str::<LocalError>(body) {
            return Err(ProviderError::ApiError(err.error));
        }

        Err(ProviderError::InvalidResponse(format!(
            "Failed to parse response: {}",
            body
        )))
    }

    fn map_http_error(&self, status: u16, body: &str) -> ProviderError {
        if status == 429 {
            return ProviderError::RateLimited(
                format!("Local provider rate limited (status: {})", status),
            );
        }

        match status {
            400 => ProviderError::ApiError(format!("Bad request: {}", body)),
            401 | 403 => ProviderError::ApiError(format!(
                "Authentication failed (status: {})",
                status
            )),
            404 => ProviderError::ApiError(format!(
                "Model not found: {}",
                self.select_model()
            )),
            500..=599 => ProviderError::InternalError(format!(
                "Server error (status: {}): {}",
                status, body
            )),
            _ => ProviderError::ApiError(format!("HTTP error {}: {}", status, body)),
        }
    }

    /// Set health status for testing or monitoring
    pub fn set_health(&mut self, healthy: bool) {
        self.health_status = healthy;
    }

    /// Access current configuration
    pub fn config(&self) -> &LocalConfig {
        &self.config
    }
}

#[async_trait]
impl Provider for LocalProvider {
    async fn send_message(&mut self, message: &str) -> ProviderResult<String> {
        if message.trim().is_empty() {
            return Err(ProviderError::InvalidResponse(
                "Message cannot be empty".to_string(),
            ));
        }

        let endpoint = self.build_endpoint();
        let request_payload = self.build_request(message);

        let response = self
            .client
            .post(&endpoint)
            .json(&request_payload)
            .send()
            .await
            .map_err(|e| {
                if e.is_timeout() {
                    ProviderError::RequestTimeout(format!(
                        "Request to local provider timed out after {}s",
                        self.config.timeout_secs
                    ))
                } else if e.is_connect() {
                    ProviderError::ConnectionFailed(format!(
                        "Failed to connect to local provider at {}",
                        self.config.base_url
                    ))
                } else {
                    ProviderError::InternalError(format!("Request failed: {}", e))
                }
            })?;

        let status = response.status();
        if !status.is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(self.map_http_error(status.as_u16(), &body));
        }

        let response_text = response.text().await.map_err(|e| {
            ProviderError::InvalidResponse(format!("Failed to read response body: {}", e))
        })?;

        self.parse_response(&response_text)
    }

    async fn health_check(&mut self) -> ProviderResult<()> {
        if !self.health_status {
            return Err(ProviderError::InternalError(
                "Provider is marked as unhealthy".to_string(),
            ));
        }

        let health_client = Client::builder()
            .timeout(Duration::from_secs(5))
            .build()
            .map_err(|e| ProviderError::ConnectionFailed(format!(
                "Health check client creation failed: {}",
                e
            )))?;

        let url = format!("{}/api/tags", self.config.base_url);
        let response = health_client
            .get(&url)
            .send()
            .await
            .map_err(|e| ProviderError::ConnectionFailed(format!(
                "Health check failed: {}",
                e
            )))?;

        if response.status().is_success() {
            Ok(())
        } else {
            Err(ProviderError::ApiError(format!(
                "Health check returned status {}",
                response.status()
            )))
        }
    }

    fn name(&self) -> &'static str {
        "Local"
    }

    fn capabilities(&self) -> Vec<String> {
        vec![
            "text_generation".to_string(),
            "local_inference".to_string(),
        ]
    }
}

#[derive(Debug, Serialize)]
struct LocalRequest {
    model: String,
    prompt: String,
    stream: bool,
    options: LocalOptions,
}

#[derive(Debug, Serialize)]
struct LocalOptions {
    temperature: f32,
}

#[derive(Debug, Deserialize)]
struct LocalResponse {
    response: String,
    done: Option<bool>,
}

#[derive(Debug, Deserialize)]
struct LocalError {
    error: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_local_provider_creation() {
        let config = LocalConfig::default();
        let provider = LocalProvider::new(config);
        assert!(provider.is_ok());
    }

    #[test]
    fn test_invalid_base_url() {
        let config = LocalConfig {
            base_url: "".to_string(),
            ..Default::default()
        };
        let provider = LocalProvider::new(config);
        assert!(provider.is_err());
    }

    #[test]
    fn test_invalid_temperature() {
        let config = LocalConfig {
            temperature: 3.0,
            ..Default::default()
        };
        let provider = LocalProvider::new(config);
        assert!(provider.is_err());
    }

    #[test]
    fn test_select_model_modes() {
        let mut config = LocalConfig::default();
        config.default_mode = LocalMode::Fast;
        let provider = LocalProvider::new(config).unwrap();
        assert_eq!(provider.select_model(), "llama3");
    }

    #[test]
    fn test_parse_valid_response() {
        let provider = LocalProvider::new(LocalConfig::default()).unwrap();
        let response_json = r#"{"response":"ok","done":true}"#;
        let result = provider.parse_response(response_json);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "ok");
    }

    #[test]
    fn test_parse_error_response() {
        let provider = LocalProvider::new(LocalConfig::default()).unwrap();
        let error_json = r#"{"error":"model not loaded"}"#;
        let result = provider.parse_response(error_json);
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_empty_message_rejected() {
        let mut provider = LocalProvider::new(LocalConfig::default()).unwrap();
        let result = provider.send_message("").await;
        assert!(result.is_err());
    }

    #[test]
    fn test_capabilities_contains_local() {
        let provider = LocalProvider::new(LocalConfig::default()).unwrap();
        let caps = provider.capabilities();
        assert!(caps.contains(&"local_inference".to_string()));
    }
}
