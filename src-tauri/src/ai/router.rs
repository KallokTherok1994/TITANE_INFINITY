// TITANE∞ v15 - AI Router
// Intelligent routing with automatic fallback (Gemini → Ollama → Offline)
// Clean architecture v15: simplified, maintainable, documented

use super::gemini::GeminiClient;
use super::ollama::OllamaClient;
use super::{AIError, AIProvider, AIRequest, AIResponse, AIResult};
use log::{info, warn};
use std::sync::Arc;
use tokio::sync::RwLock;
use crate::ia::{UnifiedIAEngine, UnifiedIARequest, IAEngine};

#[derive(Debug, Clone)]
pub enum AIRouterStatus {
    Online,   // Gemini available
    Offline,  // No provider available
    Degraded, // Only Ollama available
}

/// AIRouter v15 - Central AI request coordinator
///
/// Cascade strategy:
/// 1. Try Gemini API (if internet + API key)
/// 2. Fallback to Ollama (localhost:11434)
/// 3. Return error if both fail
pub struct AIRouter {
    gemini_client: Option<Arc<GeminiClient>>,
    ollama_client: Arc<OllamaClient>,
    unified_ia: Option<Arc<UnifiedIAEngine>>,  // 🟢🟣 Unified IA Engine (OpenAI + Claude)
    status: Arc<RwLock<AIRouterStatus>>,
}

impl AIRouter {
    /// Create new AIRouter v15 with UnifiedIA support
    pub fn new(gemini_api_key: Option<String>, ollama_model: Option<String>) -> Self {
        let gemini_client = gemini_api_key.map(|key| Arc::new(GeminiClient::new(key)));
        let ollama_client = Arc::new(OllamaClient::new(ollama_model));

        Self {
            gemini_client,
            ollama_client,
            unified_ia: None,  // Set via set_unified_ia()
            status: Arc::new(RwLock::new(AIRouterStatus::Online)),
        }
    }

    /// Set UnifiedIAEngine (called after initialization)
    pub fn set_unified_ia(&mut self, unified_ia: Arc<UnifiedIAEngine>) {
        self.unified_ia = Some(unified_ia);
        log::info!("[AI Router v15] ✅ UnifiedIA Engine attached (OpenAI + Claude support)");
    }

    /// Get current router status
    pub async fn get_status(&self) -> AIRouterStatus {
        self.status.read().await.clone()
    }

    /// Check internet connectivity (fast timeout)
    async fn check_internet(&self) -> bool {
        tokio::time::timeout(
            std::time::Duration::from_secs(3),
            reqwest::get("https://www.google.com"),
        )
        .await
        .is_ok()
    }

    /// Update router status based on available providers
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

    /// Execute AI query with automatic cascade fallback v15
    /// Fallback chain: UnifiedIA (Claude→OpenAI) → Gemini → Ollama
    pub async fn query(&self, request: AIRequest) -> AIResult<AIResponse> {
        self.update_status().await;

        log::info!(
            "[AI Router v15] Query: prompt_len={}, temp={}, max_tokens={}",
            request.prompt.len(),
            request.temperature,
            request.max_tokens
        );

        // 1. Try UnifiedIA (Claude → OpenAI) if available
        if let Some(unified_ia) = &self.unified_ia {
            info!("[AI Router v15] Trying UnifiedIA (Claude→OpenAI) (primary)");
            let unified_request = UnifiedIARequest {
                message: request.prompt.clone(),
                history: vec![],  // Conversation history handled upstream
                system_prompt: None,
                temperature: request.temperature,
                max_tokens: Some(request.max_tokens),
                preferred_engine: None,  // Auto fallback: Claude → OpenAI → Gemini → Local
            };

            match unified_ia.generate(unified_request).await {
                Ok(unified_response) => {
                    log::info!(
                        "[AI Router v15] ✓ UnifiedIA success: {:?} engine, {} tokens",
                        unified_response.engine_used,
                        unified_response.tokens_used
                    );
                    return Ok(AIResponse {
                        content: unified_response.content,
                        tokens: unified_response.tokens_used,
                        provider: AIProvider::Gemini,  // TODO: Add OpenAI/Claude to AIProvider enum
                        timestamp: std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap()
                            .as_secs() as i64,
                    });
                }
                Err(e) => {
                    warn!("[AI Router v15] ✗ UnifiedIA failed: {}, fallback to Gemini", e);
                }
            }
        }

        // 2. Try Gemini if available
        if let Some(gemini) = &self.gemini_client {
            if self.check_internet().await {
                info!("[AI Router v15] Trying Gemini API (secondary)");
                match gemini.query(&request).await {
                    Ok(response) => {
                        log::info!(
                            "[AI Router v15] ✓ Gemini success: {} tokens",
                            response.tokens
                        );
                        return Ok(response);
                    }
                    Err(e) => {
                        warn!("[AI Router v15] ✗ Gemini failed: {}, fallback to Ollama", e);
                    }
                }
            }
        }

        // 3. Fallback to Ollama
        if self.ollama_client.is_available().await {
            info!("[AI Router v15] Routing to Ollama (local fallback)");
            match self.ollama_client.query(&request).await {
                Ok(response) => {
                    log::info!(
                        "[AI Router v15] ✓ Ollama success: {} tokens",
                        response.tokens
                    );
                    return Ok(response);
                }
                Err(e) => {
                    warn!("[AI Router v15] ✗ Ollama failed: {}", e);
                }
            }
        }

        log::error!("[AI Router v15] ✗ No provider available (UnifiedIA + Gemini + Ollama all failed)");
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

    /// Query specific UnifiedIA engine (OpenAI or Claude)
    pub async fn query_with_unified_engine(
        &self,
        request: AIRequest,
        engine: IAEngine,
    ) -> AIResult<AIResponse> {
        if let Some(unified_ia) = &self.unified_ia {
            let unified_request = UnifiedIARequest {
                message: request.prompt.clone(),
                history: vec![],
                system_prompt: None,
                temperature: request.temperature,
                max_tokens: Some(request.max_tokens),
                preferred_engine: Some(engine),
            };

            match unified_ia.generate(unified_request).await {
                Ok(unified_response) => {
                    Ok(AIResponse {
                        content: unified_response.content,
                        tokens: unified_response.tokens_used,
                        provider: AIProvider::Gemini,  // TODO: Extend AIProvider enum
                        timestamp: std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap()
                            .as_secs() as i64,
                    })
                }
                Err(e) => Err(AIError::APIError(e)),
            }
        } else {
            Err(AIError::APIError("UnifiedIA not configured".to_string()))
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
