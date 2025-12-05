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
