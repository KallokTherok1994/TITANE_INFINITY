// TITANE∞ v20.1 - AI Router with Performance Cache
// Intelligent routing with automatic fallback (Gemini → Ollama → Offline)
// Architecture v20.1: simplified, maintainable, documented, CACHE-OPTIMIZED

use super::cache::{AIRouterCache, CachedAIResponse};
use super::gemini::GeminiClient;
use super::ollama::OllamaClient;
use super::{AIError, AIProvider, AIRequest, AIResponse, AIResult};
use crate::ia::{IAEngine, UnifiedIAEngine, UnifiedIARequest};
use log::{info, warn};
use std::sync::Arc;
use std::time::Instant;
use tokio::sync::RwLock;

#[derive(Debug, Clone)]
pub enum AIRouterStatus {
    Online,   // Gemini available
    Offline,  // No provider available
    Degraded, // Only Ollama available
}

/// AIRouter v20.1 - Central AI request coordinator with CACHE
///
/// Cascade strategy:
/// 1. Check cache first (instant response)
/// 2. Try UnifiedIA (Claude → OpenAI)
/// 3. Fallback to Gemini API (if internet + API key)
/// 4. Fallback to Ollama (localhost:11434)
/// 5. Return error if all fail
///
/// Cache: LRU avec TTL 5min pour réponses, 30s pour statuts provider
pub struct AIRouter {
    gemini_client: Option<Arc<GeminiClient>>,
    ollama_client: Arc<OllamaClient>,
    unified_ia: Option<Arc<UnifiedIAEngine>>, // 🟢🟣 Unified IA Engine (OpenAI + Claude)
    status: Arc<RwLock<AIRouterStatus>>,
    cache: Arc<AIRouterCache>, // NEW v20.1: LRU cache
}

impl AIRouter {
    /// Create new AIRouter v20.1 with UnifiedIA support + Cache
    pub fn new(gemini_api_key: Option<String>, ollama_model: Option<String>) -> Self {
        let gemini_client = gemini_api_key.map(|key| Arc::new(GeminiClient::new(key)));
        let ollama_client = Arc::new(OllamaClient::new(ollama_model));

        Self {
            gemini_client,
            ollama_client,
            unified_ia: None, // Set via set_unified_ia()
            status: Arc::new(RwLock::new(AIRouterStatus::Online)),
            cache: Arc::new(AIRouterCache::default_cache()), // NEW v20.1
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

    /// Update status with cache (v20.1 optimization)
    /// Évite les checks réseau répétitifs via cache 30s
    async fn update_status_cached(&self) {
        // Check internet avec cache
        let has_internet = if let Some(cached) = self.cache.get_provider_status("internet").await {
            cached
        } else {
            let result = self.check_internet().await;
            self.cache.set_provider_status("internet", result).await;
            result
        };

        // Check Gemini
        let has_gemini = self.gemini_client.is_some() && has_internet;

        // Check Ollama avec cache
        let has_ollama = if let Some(cached) = self.cache.get_provider_status("ollama").await {
            cached
        } else {
            let result = self.ollama_client.is_available().await;
            self.cache.set_provider_status("ollama", result).await;
            result
        };

        let new_status = if has_internet && has_gemini {
            AIRouterStatus::Online
        } else if has_ollama {
            AIRouterStatus::Degraded
        } else {
            AIRouterStatus::Offline
        };

        *self.status.write().await = new_status;
    }

    /// Cache une réponse AI pour réutilisation future
    async fn cache_response(&self, request: &AIRequest, response: &AIResponse) {
        self.cache
            .set_response(
                &request.prompt,
                request.temperature,
                request.max_tokens as u32,
                CachedAIResponse {
                    content: response.content.clone(),
                    tokens: response.tokens as u32,
                    provider: format!("{:?}", response.provider),
                },
            )
            .await;
    }

    /// Execute AI query with automatic cascade fallback v20.1
    /// Fallback chain: Cache → UnifiedIA (Claude→OpenAI) → Gemini → Ollama
    /// v21: Force Ollama if provider_preference = "local" or "ollama"
    pub async fn query(&self, request: AIRequest) -> AIResult<AIResponse> {
        // v21 FIX: Force Ollama en mode local (provider_preference = "local" | "ollama")
        if let Some(ref pref) = request.provider_preference {
            if pref == "local" || pref == "ollama" {
                info!(
                    "[AI Router v21] 🏠 LOCAL MODE FORCED - Direct Ollama (provider_preference={})",
                    pref
                );
                return self.query_ollama_direct(&request).await;
            }
        }
        let query_start = Instant::now();

        log::info!(
            "[AI Router v20.1] Query: prompt_len={}, temp={}, max_tokens={}",
            request.prompt.len(),
            request.temperature,
            request.max_tokens
        );

        // ═══════════════════════════════════════════════════════════════
        // STEP 0: CHECK CACHE FIRST (instant response, ~0ms)
        // ═══════════════════════════════════════════════════════════════
        if let Some(cached) = self
            .cache
            .get_response(
                &request.prompt,
                request.temperature,
                request.max_tokens as u32,
            )
            .await
        {
            log::info!(
                "[AI Router v20.1] ✓ CACHE HIT: {} tokens, {}ms",
                cached.tokens,
                query_start.elapsed().as_millis()
            );
            return Ok(AIResponse {
                content: cached.content,
                tokens: cached.tokens as usize,
                provider: AIProvider::Gemini, // Cached provider
                timestamp: std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap_or_else(|_| std::time::Duration::from_secs(0))
                    .as_secs() as i64,
            });
        }

        // Update status (with cached provider checks)
        self.update_status_cached().await;

        // 1. Try UnifiedIA (Claude → OpenAI) if available
        if let Some(unified_ia) = &self.unified_ia {
            info!("[AI Router v15] Trying UnifiedIA (Claude→OpenAI) (primary)");
            let unified_request = UnifiedIARequest {
                message: request.prompt.clone(),
                history: vec![], // Conversation history handled upstream
                system_prompt: None,
                temperature: request.temperature,
                max_tokens: Some(request.max_tokens),
                preferred_engine: None, // Auto fallback: Claude → OpenAI → Gemini → Local
            };

            match unified_ia.generate(unified_request).await {
                Ok(unified_response) => {
                    log::info!(
                        "[AI Router v20.1] ✓ UnifiedIA success: {:?} engine, {} tokens, {}ms",
                        unified_response.engine_used,
                        unified_response.tokens_used,
                        query_start.elapsed().as_millis()
                    );
                    let response = AIResponse {
                        content: unified_response.content,
                        tokens: unified_response.tokens_used,
                        provider: AIProvider::Gemini, // Implementation: Extend AIProvider enum with OpenAI/Claude variants
                        // - Add to enum: OpenAI, Claude, Anthropic, Cohere
                        // - Detect from model string: if model.contains("gpt") → OpenAI
                        // - Map unified_response.provider field to correct enum variant
                        // - Use match on provider type for accurate tracking
                        timestamp: std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap_or_else(|_| std::time::Duration::from_secs(0))
                            .as_secs() as i64,
                    };
                    // Cache the response for future use
                    self.cache_response(&request, &response).await;
                    return Ok(response);
                }
                Err(e) => {
                    warn!(
                        "[AI Router v15] ✗ UnifiedIA failed: {}, fallback to Gemini",
                        e
                    );
                }
            }
        }

        // 2. Try Gemini if available
        if let Some(gemini) = &self.gemini_client {
            if self.check_internet().await {
                info!("[AI Router v20.1] Trying Gemini API (secondary)");
                match gemini.query(&request).await {
                    Ok(response) => {
                        log::info!(
                            "[AI Router v20.1] ✓ Gemini success: {} tokens, {}ms",
                            response.tokens,
                            query_start.elapsed().as_millis()
                        );
                        // Cache the response
                        self.cache_response(&request, &response).await;
                        return Ok(response);
                    }
                    Err(e) => {
                        warn!(
                            "[AI Router v20.1] ✗ Gemini failed: {}, fallback to Ollama",
                            e
                        );
                    }
                }
            }
        }

        // 3. Fallback to Ollama
        if self.ollama_client.is_available().await {
            info!("[AI Router v20.1] Routing to Ollama (local fallback)");
            match self.ollama_client.query(&request).await {
                Ok(response) => {
                    log::info!(
                        "[AI Router v20.1] ✓ Ollama success: {} tokens, {}ms",
                        response.tokens,
                        query_start.elapsed().as_millis()
                    );
                    // Cache the response
                    self.cache_response(&request, &response).await;
                    return Ok(response);
                }
                Err(e) => {
                    warn!("[AI Router v15] ✗ Ollama failed: {}", e);
                }
            }
        }

        log::error!(
            "[AI Router v15] ✗ No provider available (UnifiedIA + Gemini + Ollama all failed)"
        );
        log::error!(
            "[AI Router v15] 🔍 Debug: unified_ia={}, gemini={}, ollama_available={:?}",
            self.unified_ia.is_some(),
            self.gemini_client.is_some(),
            self.ollama_client.is_available().await
        );
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
                        provider: AIProvider::Gemini, // Implementation: Dynamic provider detection from response
                        // - Enum extension: Add OpenAI, Claude, etc. to AIProvider
                        // - Auto-detect: Parse unified_response.metadata.provider field
                        // - Fallback: Use request.provider if metadata unavailable
                        // - Example: AIProvider::from_str(&metadata.provider).unwrap_or(AIProvider::Gemini)
                        timestamp: std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap_or_else(|_| std::time::Duration::from_secs(0))
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

    /// v21: Direct Ollama query (used for local mode force)
    async fn query_ollama_direct(&self, request: &AIRequest) -> AIResult<AIResponse> {
        let query_start = Instant::now();

        if !self.ollama_client.is_available().await {
            log::error!("[AI Router v21] 🏠 LOCAL MODE: Ollama NOT available");
            return Err(AIError::NoProviderAvailable);
        }

        info!("[AI Router v21] 🏠 LOCAL MODE: Routing to Ollama");
        match self.ollama_client.query(request).await {
            Ok(response) => {
                log::info!(
                    "[AI Router v21] ✅ LOCAL MODE: Ollama success: {} tokens, {}ms",
                    response.tokens,
                    query_start.elapsed().as_millis()
                );
                // Cache the response
                self.cache_response(request, &response).await;
                Ok(response)
            }
            Err(e) => {
                log::error!("[AI Router v21] ❌ LOCAL MODE: Ollama failed: {}", e);
                Err(e)
            }
        }
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
