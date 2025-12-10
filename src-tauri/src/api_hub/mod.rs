//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — API INTEGRATIONS HUB
//! Super Prompt #17 — Hub d'orchestration multimodale inter-IA
//! ═══════════════════════════════════════════════════════════════════════════════
//!
//! Ce module unifie et orchestre les APIs:
//! - OpenAI (GPT, DALL-E, Whisper, Embeddings)
//! - Gemini (Google AI, Vision, Long Context)
//! - Anthropic (Claude, Analysis, Safety)
//!
//! TITANE∞ devient un système d'orchestration inter-IA capable de choisir
//! dynamiquement le meilleur modèle selon la tâche, le contexte, le coût,
//! la vitesse et l'intention.

pub mod anthropic;
pub mod config;
pub mod diagnostics;
pub mod gemini;
pub mod harmonizer;
pub mod multimodal_router;
pub mod openai;
pub mod provider_registry;
pub mod router;
pub mod safety_bridge;
pub mod temporal_adapter;
pub mod temporal_cache;
pub mod temporal_circuit_breaker;
pub mod temporal_rate_limiter;
pub mod vault_bridge;

#[cfg(test)]
mod temporal_integration_tests;

pub use anthropic::AnthropicProvider;
pub use config::APIHubConfig;
pub use diagnostics::{APIHubDiagnostics, APIHubEvent};
pub use gemini::GeminiProvider;
pub use harmonizer::{HarmonizedResponse, ResponseHarmonizer};
pub use multimodal_router::{MultimodalRequest, MultimodalResponse, MultimodalRouter};
pub use openai::OpenAIProvider;
pub use provider_registry::{ProviderCapability, ProviderProfile, ProviderRegistry};
pub use router::{APIRouter, ModelChoiceStrategy, RouteDecision};
pub use safety_bridge::SafetyBridge;
pub use temporal_adapter::{ApiTemporalAdjustments, ProviderSuggestion, TemporalApiAdapter};
pub use temporal_cache::{CacheStats, TemporalCache};
pub use temporal_circuit_breaker::{
    BreakerStats, CircuitBreakerError, CircuitState, TemporalCircuitBreaker,
};
pub use temporal_rate_limiter::{RateLimitError, TemporalRateLimiter};
pub use vault_bridge::VaultBridge;

use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Version du Hub API
pub const API_HUB_VERSION: &str = "vΩ.1.0";

/// Modalité de requête
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Modality {
    Text,
    Vision,
    Audio,
    Embeddings,
    ImageGeneration,
    MultiModal,
}

/// Provider disponible
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Provider {
    OpenAI,
    Gemini,
    Anthropic,
    Local,
}

impl std::fmt::Display for Provider {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Provider::OpenAI => write!(f, "OpenAI"),
            Provider::Gemini => write!(f, "Gemini"),
            Provider::Anthropic => write!(f, "Anthropic"),
            Provider::Local => write!(f, "Local"),
        }
    }
}

/// Requête unifiée vers le Hub
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct APIRequest {
    pub id: String,
    pub modality: Modality,
    pub content: RequestContent,
    pub preferred_provider: Option<Provider>,
    pub strategy: ModelChoiceStrategy,
    pub max_tokens: Option<u32>,
    pub temperature: Option<f32>,
    pub timeout_ms: Option<u64>,
    pub metadata: std::collections::HashMap<String, String>,
}

/// Contenu de la requête
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum RequestContent {
    Text(String),
    TextWithImages {
        text: String,
        images: Vec<Vec<u8>>,
    },
    Audio(Vec<u8>),
    EmbeddingRequest(Vec<String>),
    ImageGenerationPrompt(String),
    MultiModal {
        text: Option<String>,
        images: Vec<Vec<u8>>,
        audio: Option<Vec<u8>>,
    },
}

/// Réponse unifiée du Hub
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct APIResponse {
    pub id: String,
    pub provider_used: Provider,
    pub modality: Modality,
    pub content: ResponseContent,
    pub usage: UsageStats,
    pub latency_ms: u64,
    pub harmonized: bool,
}

/// Contenu de la réponse
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum ResponseContent {
    Text(String),
    Embeddings(Vec<Vec<f32>>),
    ImageUrls(Vec<String>),
    AudioTranscription(String),
    MultiModal {
        text: Option<String>,
        embeddings: Option<Vec<Vec<f32>>>,
    },
    Error(String),
}

/// Statistiques d'utilisation
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct UsageStats {
    pub prompt_tokens: u32,
    pub completion_tokens: u32,
    pub total_tokens: u32,
    pub estimated_cost_usd: f64,
}

/// État du Hub API
#[derive(Clone, Debug, Default)]
pub struct APIHubState {
    pub total_requests: u64,
    pub requests_by_provider: std::collections::HashMap<Provider, u64>,
    pub total_tokens_used: u64,
    pub total_cost_usd: f64,
    pub average_latency_ms: f64,
    pub errors_count: u64,
}

/// Hub d'intégration API principal
pub struct APIHub {
    config: APIHubConfig,
    state: Arc<RwLock<APIHubState>>,
    registry: ProviderRegistry,
    router: APIRouter,
    multimodal_router: MultimodalRouter,
    harmonizer: ResponseHarmonizer,
    safety_bridge: SafetyBridge,
    vault: VaultBridge,
    diagnostics: APIHubDiagnostics,
    // Providers
    openai: Option<OpenAIProvider>,
    gemini: Option<GeminiProvider>,
    anthropic: Option<AnthropicProvider>,
}

impl APIHub {
    /// Crée un nouveau Hub API
    pub fn new(config: APIHubConfig) -> Self {
        let registry = ProviderRegistry::new();
        let router = APIRouter::new();
        let multimodal_router = MultimodalRouter::new();
        let harmonizer = ResponseHarmonizer::new();
        let safety_bridge = SafetyBridge::new();
        let vault = VaultBridge::new();
        let diagnostics = APIHubDiagnostics::new();

        Self {
            config,
            state: Arc::new(RwLock::new(APIHubState::default())),
            registry,
            router,
            multimodal_router,
            harmonizer,
            safety_bridge,
            vault,
            diagnostics,
            openai: None,
            gemini: None,
            anthropic: None,
        }
    }

    /// Initialise les providers avec les clés API
    pub async fn initialize(&mut self) -> Result<(), APIHubError> {
        // Récupérer les clés depuis le vault
        if let Some(key) = self.vault.get_api_key(Provider::OpenAI).await? {
            self.openai = Some(OpenAIProvider::new(key));
            self.registry
                .register_provider(Provider::OpenAI, ProviderProfile::openai_default());
        }

        if let Some(key) = self.vault.get_api_key(Provider::Gemini).await? {
            self.gemini = Some(GeminiProvider::new(key));
            self.registry
                .register_provider(Provider::Gemini, ProviderProfile::gemini_default());
        }

        if let Some(key) = self.vault.get_api_key(Provider::Anthropic).await? {
            self.anthropic = Some(AnthropicProvider::new(key));
            self.registry
                .register_provider(Provider::Anthropic, ProviderProfile::anthropic_default());
        }

        self.diagnostics
            .emit(APIHubEvent::Initialized {
                providers_count: self.registry.active_providers().len(),
            })
            .await;

        Ok(())
    }

    /// Exécute une requête via le Hub
    pub async fn execute(&self, request: APIRequest) -> Result<APIResponse, APIHubError> {
        let start = std::time::Instant::now();

        // 1. Vérification sécurité
        self.safety_bridge.validate_request(&request).await?;

        // 2. Router vers le meilleur provider
        let decision = self.router.route(&request, &self.registry).await;

        self.diagnostics
            .emit(APIHubEvent::RouteDecision {
                request_id: request.id.clone(),
                provider: decision.provider,
                reason: decision.reason.clone(),
            })
            .await;

        // 3. Exécuter la requête
        let raw_response = match decision.provider {
            Provider::OpenAI => {
                let provider = self
                    .openai
                    .as_ref()
                    .ok_or(APIHubError::ProviderNotAvailable(Provider::OpenAI))?;
                provider.execute(&request).await?
            }
            Provider::Gemini => {
                let provider = self
                    .gemini
                    .as_ref()
                    .ok_or(APIHubError::ProviderNotAvailable(Provider::Gemini))?;
                provider.execute(&request).await?
            }
            Provider::Anthropic => {
                let provider = self
                    .anthropic
                    .as_ref()
                    .ok_or(APIHubError::ProviderNotAvailable(Provider::Anthropic))?;
                provider.execute(&request).await?
            }
            Provider::Local => {
                return Err(APIHubError::ProviderNotAvailable(Provider::Local));
            }
        };

        // 4. Harmoniser la réponse
        let harmonized = self.harmonizer.harmonize(raw_response, &request).await;

        // 5. Mettre à jour les stats
        let latency = start.elapsed().as_millis() as u64;
        self.update_stats(&harmonized, latency).await;

        // 6. Émettre diagnostic
        self.diagnostics
            .emit(APIHubEvent::RequestCompleted {
                request_id: request.id,
                provider: decision.provider,
                latency_ms: latency,
                tokens: harmonized.usage.total_tokens,
            })
            .await;

        Ok(APIResponse {
            id: harmonized.id,
            provider_used: decision.provider,
            modality: request.modality,
            content: harmonized.content,
            usage: harmonized.usage,
            latency_ms: latency,
            harmonized: true,
        })
    }

    /// Exécute une requête multimodale complexe
    pub async fn execute_multimodal(
        &self,
        request: MultimodalRequest,
    ) -> Result<MultimodalResponse, APIHubError> {
        self.multimodal_router
            .route_and_execute(request, self)
            .await
    }

    /// Génère des embeddings
    pub async fn generate_embeddings(
        &self,
        texts: Vec<String>,
    ) -> Result<Vec<Vec<f32>>, APIHubError> {
        let request = APIRequest {
            id: uuid::Uuid::new_v4().to_string(),
            modality: Modality::Embeddings,
            content: RequestContent::EmbeddingRequest(texts),
            preferred_provider: Some(Provider::OpenAI), // OpenAI best for embeddings
            strategy: ModelChoiceStrategy::Quality,
            max_tokens: None,
            temperature: None,
            timeout_ms: Some(30000),
            metadata: std::collections::HashMap::new(),
        };

        let response = self.execute(request).await?;

        match response.content {
            ResponseContent::Embeddings(emb) => Ok(emb),
            _ => Err(APIHubError::UnexpectedResponse(
                "Expected embeddings".to_string(),
            )),
        }
    }

    /// Chat avec sélection automatique du provider
    pub async fn chat(
        &self,
        message: &str,
        strategy: ModelChoiceStrategy,
    ) -> Result<String, APIHubError> {
        let request = APIRequest {
            id: uuid::Uuid::new_v4().to_string(),
            modality: Modality::Text,
            content: RequestContent::Text(message.to_string()),
            preferred_provider: None,
            strategy,
            max_tokens: Some(4096),
            temperature: Some(0.7),
            timeout_ms: Some(60000),
            metadata: std::collections::HashMap::new(),
        };

        let response = self.execute(request).await?;

        match response.content {
            ResponseContent::Text(text) => Ok(text),
            _ => Err(APIHubError::UnexpectedResponse("Expected text".to_string())),
        }
    }

    /// Analyse une image avec vision
    pub async fn analyze_image(&self, prompt: &str, image: Vec<u8>) -> Result<String, APIHubError> {
        let request = APIRequest {
            id: uuid::Uuid::new_v4().to_string(),
            modality: Modality::Vision,
            content: RequestContent::TextWithImages {
                text: prompt.to_string(),
                images: vec![image],
            },
            preferred_provider: Some(Provider::Gemini), // Gemini best for vision
            strategy: ModelChoiceStrategy::VisionDominant,
            max_tokens: Some(4096),
            temperature: Some(0.5),
            timeout_ms: Some(60000),
            metadata: std::collections::HashMap::new(),
        };

        let response = self.execute(request).await?;

        match response.content {
            ResponseContent::Text(text) => Ok(text),
            _ => Err(APIHubError::UnexpectedResponse("Expected text".to_string())),
        }
    }

    /// Récupère les providers disponibles
    pub fn available_providers(&self) -> Vec<Provider> {
        self.registry.active_providers()
    }

    /// Récupère l'état du hub
    pub async fn get_state(&self) -> APIHubState {
        self.state.read().await.clone()
    }

    /// Met à jour les statistiques
    async fn update_stats(&self, response: &HarmonizedResponse, latency: u64) {
        let mut state = self.state.write().await;
        state.total_requests += 1;
        *state
            .requests_by_provider
            .entry(response.provider)
            .or_insert(0) += 1;
        state.total_tokens_used += response.usage.total_tokens as u64;
        state.total_cost_usd += response.usage.estimated_cost_usd;

        // Moving average for latency
        let n = state.total_requests as f64;
        state.average_latency_ms = ((n - 1.0) * state.average_latency_ms + latency as f64) / n;
    }
}

impl Default for APIHub {
    fn default() -> Self {
        Self::new(APIHubConfig::default())
    }
}

/// Erreurs du Hub API
#[derive(Debug, Clone)]
pub enum APIHubError {
    ProviderNotAvailable(Provider),
    AuthenticationFailed(String),
    RateLimited(String),
    RequestTimeout,
    SafetyViolation(String),
    UnexpectedResponse(String),
    NetworkError(String),
    ConfigurationError(String),
}

impl std::fmt::Display for APIHubError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::ProviderNotAvailable(p) => write!(f, "Provider not available: {}", p),
            Self::AuthenticationFailed(msg) => write!(f, "Authentication failed: {}", msg),
            Self::RateLimited(msg) => write!(f, "Rate limited: {}", msg),
            Self::RequestTimeout => write!(f, "Request timeout"),
            Self::SafetyViolation(msg) => write!(f, "Safety violation: {}", msg),
            Self::UnexpectedResponse(msg) => write!(f, "Unexpected response: {}", msg),
            Self::NetworkError(msg) => write!(f, "Network error: {}", msg),
            Self::ConfigurationError(msg) => write!(f, "Configuration error: {}", msg),
        }
    }
}

impl std::error::Error for APIHubError {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_api_hub_creation() {
        let hub = APIHub::default();
        assert!(hub.available_providers().is_empty());
    }

    #[tokio::test]
    async fn test_api_hub_state() {
        let hub = APIHub::default();
        let state = hub.get_state().await;
        assert_eq!(state.total_requests, 0);
    }
}
