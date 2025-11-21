// TITANE∞ v12 - AI Router
// Intelligent routing with automatic fallback (Gemini → Ollama → Offline)

use super::gemini::GeminiClient;
use super::ollama::OllamaClient;
use super::{AIError, AIRequest, AIResponse, AIProvider, AIResult};
use log::{info, warn};
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone)]
pub enum AIRouterStatus {
    Online,
    Offline,
    Degraded,
}

pub struct AIRouter {
    gemini_client: Option<Arc<GeminiClient>>,
    ollama_client: Arc<OllamaClient>,
    status: Arc<RwLock<AIRouterStatus>>,
}

impl AIRouter {
    pub fn new(gemini_api_key: Option<String>, ollama_model: Option<String>) -> Self {
        let gemini_client = gemini_api_key.map(|key| Arc::new(GeminiClient::new(key)));
        let ollama_client = Arc::new(OllamaClient::new(ollama_model));

        Self {
            gemini_client,
            ollama_client,
            status: Arc::new(RwLock::new(AIRouterStatus::Online)),
        }
    }

    pub async fn get_status(&self) -> AIRouterStatus {
        self.status.read().await.clone()
    }

    async fn check_internet(&self) -> bool {
        tokio::time::timeout(
            std::time::Duration::from_secs(3),
            reqwest::get("https://www.google.com"),
        )
        .await
        .is_ok()
    }

    async fn update_status(&self) {
        let has_internet = self.check_internet().await;
        let has_gemini = self
            .gemini_client
            .as_ref()
            .map(|c| c.is_available())
            .is_some();
        let has_ollama = self.ollama_client.is_available().await;

        let new_status = if has_internet && has_gemini {
            AIRouterStatus::Online
        } else if has_ollama {
            AIRouterStatus::Degraded
        } else {
            AIRouterStatus::Offline
        };

        *self.status.write().await = new_status;
    }

    pub async fn query(&self, request: AIRequest) -> AIResult<AIResponse> {
        self.update_status().await;

        // Try Gemini first if available
        if let Some(gemini) = &self.gemini_client {
            if self.check_internet().await {
                info!("Routing to Gemini API");
                match gemini.query(&request).await {
                    Ok(response) => return Ok(response),
                    Err(e) => {
                        warn!("Gemini failed: {}, falling back to Ollama", e);
                    }
                }
            }
        }

        // Fallback to Ollama
        if self.ollama_client.is_available().await {
            info!("Routing to Ollama (local)");
            match self.ollama_client.query(&request).await {
                Ok(response) => return Ok(response),
                Err(e) => {
                    warn!("Ollama failed: {}", e);
                }
            }
        }

        // No provider available
        Err(AIError::NoProviderAvailable)
    }

    pub async fn query_with_provider(
        &self,
        request: AIRequest,
        provider: AIProvider,
    ) -> AIResult<AIResponse> {
        match provider {
            AIProvider::Gemini => {
                if let Some(gemini) = &self.gemini_client {
                    gemini.query(&request).await
                } else {
                    Err(AIError::APIError("Gemini not configured".to_string()))
                }
            }
            AIProvider::Ollama => self.ollama_client.query(&request).await,
            AIProvider::Offline => Err(AIError::NoProviderAvailable),
        }
    }

    pub fn get_available_providers(&self) -> Vec<AIProvider> {
        let mut providers = Vec::new();

        if self.gemini_client.is_some() {
            providers.push(AIProvider::Gemini);
        }

        providers.push(AIProvider::Ollama);
        providers
    }

    pub async fn health_check(&self) -> serde_json::Value {
        let has_internet = self.check_internet().await;
        let gemini_available = self
            .gemini_client
            .as_ref()
            .map(|c| async { c.is_available().await })
            .is_some();
        let ollama_available = self.ollama_client.is_available().await;
        let ollama_models = self.ollama_client.get_available_models();

        serde_json::json!({
            "status": format!("{:?}", *self.status.read().await),
            "internet": has_internet,
            "gemini": {
                "configured": self.gemini_client.is_some(),
                "available": gemini_available,
            },
            "ollama": {
                "available": ollama_available,
                "models": ollama_models,
            }
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_router_creation() {
        let router = AIRouter::new(None, None);
        assert!(router.gemini_client.is_none());
    }

    #[tokio::test]
    async fn test_router_status() {
        let router = AIRouter::new(None, None);
        let status = router.get_status().await;
        // Should return some status
        let _ = format!("{:?}", status);
    }
}
