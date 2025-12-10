use std::sync::Arc;

use tokio::sync::RwLock;

use crate::ai::router::AIRouter;
use crate::ai::{AIProvider, AIRequest, AIResponse};

use super::errors::ChatEngineError;
use super::types::ProviderPreference;

/// Thin adapter that exposes the AIRouter behind a minimal interface
/// tailored for the new chat engine. This keeps the rest of the
/// engine agnostic from the legacy router implementation.
#[derive(Clone)]
pub struct ProviderBridge {
    router: Arc<RwLock<AIRouter>>,
}

impl ProviderBridge {
    pub fn new(router: AIRouter) -> Self {
        Self {
            router: Arc::new(RwLock::new(router)),
        }
    }

    pub fn from_shared(router: Arc<RwLock<AIRouter>>) -> Self {
        Self { router }
    }

    pub fn router(&self) -> Arc<RwLock<AIRouter>> {
        self.router.clone()
    }

    pub async fn dispatch(
        &self,
        request: AIRequest,
        preference: ProviderPreference,
    ) -> Result<AIResponse, ChatEngineError> {
        let router = self.router.read().await;

        let response = match preference {
            ProviderPreference::Auto => router.query(request).await,
            ProviderPreference::Gemini => {
                router
                    .query_with_provider(request, AIProvider::Gemini)
                    .await
            }
            ProviderPreference::Ollama => {
                router
                    .query_with_provider(request, AIProvider::Ollama)
                    .await
            }
            ProviderPreference::Local => {
                router
                    .query_with_provider(request, AIProvider::Ollama)
                    .await
            }
        }?;

        Ok(response)
    }

    pub async fn health(&self) -> serde_json::Value {
        let router = self.router.read().await;
        router.health_check().await
    }
}

pub fn build_ai_request(prompt: String, temperature: f32, max_tokens: usize) -> AIRequest {
    AIRequest {
        prompt,
        temperature,
        max_tokens,
        stream: false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // build_ai_request Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_build_ai_request_basic() {
        let request = build_ai_request("Hello world".to_string(), 0.7, 100);
        assert_eq!(request.prompt, "Hello world");
        assert_eq!(request.temperature, 0.7);
        assert_eq!(request.max_tokens, 100);
        assert!(!request.stream);
    }

    #[test]
    fn test_build_ai_request_empty_prompt() {
        let request = build_ai_request(String::new(), 0.5, 50);
        assert!(request.prompt.is_empty());
    }

    #[test]
    fn test_build_ai_request_zero_temperature() {
        let request = build_ai_request("Test".to_string(), 0.0, 100);
        assert_eq!(request.temperature, 0.0);
    }

    #[test]
    fn test_build_ai_request_high_temperature() {
        let request = build_ai_request("Test".to_string(), 2.0, 100);
        assert_eq!(request.temperature, 2.0);
    }

    #[test]
    fn test_build_ai_request_large_max_tokens() {
        let request = build_ai_request("Test".to_string(), 0.5, 100000);
        assert_eq!(request.max_tokens, 100000);
    }

    #[test]
    fn test_build_ai_request_zero_max_tokens() {
        let request = build_ai_request("Test".to_string(), 0.5, 0);
        assert_eq!(request.max_tokens, 0);
    }

    #[test]
    fn test_build_ai_request_long_prompt() {
        let long_prompt = "a".repeat(10000);
        let request = build_ai_request(long_prompt.clone(), 0.5, 100);
        assert_eq!(request.prompt.len(), 10000);
    }

    #[test]
    fn test_build_ai_request_unicode_prompt() {
        let request = build_ai_request("Héllo мир 世界".to_string(), 0.5, 100);
        assert!(request.prompt.contains("мир"));
        assert!(request.prompt.contains("世界"));
    }

    #[test]
    fn test_build_ai_request_stream_always_false() {
        let request = build_ai_request("Test".to_string(), 0.5, 100);
        assert!(!request.stream);
    }
}
