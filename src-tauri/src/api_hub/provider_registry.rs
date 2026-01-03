//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — PROVIDER REGISTRY
//! Super Prompt #17 — Registre des providers et leurs capacités
//! ═══════════════════════════════════════════════════════════════════════════════

use super::{Modality, Provider};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Capacité d'un provider
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ProviderCapability {
    TextGeneration,
    TextEmbeddings,
    ImageGeneration,
    ImageAnalysis,
    AudioTranscription,
    AudioGeneration,
    LongContext,
    MultiModal,
    Streaming,
    FunctionCalling,
    CodeGeneration,
    Reasoning,
}

/// Profil d'un provider
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ProviderProfile {
    pub name: String,
    pub provider: Provider,
    pub capabilities: Vec<ProviderCapability>,
    pub supports_text: bool,
    pub supports_vision: bool,
    pub supports_audio: bool,
    pub supports_embeddings: bool,
    pub max_context_tokens: u32,
    pub cost_rating: u8,    // 1-10, 10 = most expensive
    pub speed_rating: u8,   // 1-10, 10 = fastest
    pub quality_rating: u8, // 1-10, 10 = highest quality
    pub safety_rating: u8,  // 1-10, 10 = safest
    pub models: Vec<ModelInfo>,
    pub rate_limits: RateLimits,
    pub available: bool,
    pub last_latency_ms: Option<u64>,
    pub error_rate: f32,
}

/// Information sur un modèle
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ModelInfo {
    pub id: String,
    pub name: String,
    pub context_window: u32,
    pub cost_per_1k_input: f64,
    pub cost_per_1k_output: f64,
    pub supports_vision: bool,
    pub supports_audio: bool,
    pub is_default: bool,
}

/// Limites de taux
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct RateLimits {
    pub requests_per_minute: u32,
    pub tokens_per_minute: u32,
    pub current_requests: u32,
    pub current_tokens: u32,
    pub reset_at: Option<u64>,
}

impl ProviderProfile {
    /// Profil par défaut OpenAI
    pub fn openai_default() -> Self {
        Self {
            name: "OpenAI".to_string(),
            provider: Provider::OpenAI,
            capabilities: vec![
                ProviderCapability::TextGeneration,
                ProviderCapability::TextEmbeddings,
                ProviderCapability::ImageGeneration,
                ProviderCapability::ImageAnalysis,
                ProviderCapability::AudioTranscription,
                ProviderCapability::AudioGeneration,
                ProviderCapability::Streaming,
                ProviderCapability::FunctionCalling,
                ProviderCapability::CodeGeneration,
                ProviderCapability::Reasoning,
            ],
            supports_text: true,
            supports_vision: true,
            supports_audio: true,
            supports_embeddings: true,
            max_context_tokens: 128000,
            cost_rating: 7,
            speed_rating: 8,
            quality_rating: 9,
            safety_rating: 8,
            models: vec![
                ModelInfo {
                    id: "gpt-4o".to_string(),
                    name: "GPT-4o".to_string(),
                    context_window: 128000,
                    cost_per_1k_input: 0.005,
                    cost_per_1k_output: 0.015,
                    supports_vision: true,
                    supports_audio: false,
                    is_default: true,
                },
                ModelInfo {
                    id: "gpt-4o-mini".to_string(),
                    name: "GPT-4o Mini".to_string(),
                    context_window: 128000,
                    cost_per_1k_input: 0.00015,
                    cost_per_1k_output: 0.0006,
                    supports_vision: true,
                    supports_audio: false,
                    is_default: false,
                },
                ModelInfo {
                    id: "o1".to_string(),
                    name: "O1 Reasoning".to_string(),
                    context_window: 200000,
                    cost_per_1k_input: 0.015,
                    cost_per_1k_output: 0.060,
                    supports_vision: true,
                    supports_audio: false,
                    is_default: false,
                },
                ModelInfo {
                    id: "text-embedding-3-large".to_string(),
                    name: "Embedding 3 Large".to_string(),
                    context_window: 8191,
                    cost_per_1k_input: 0.00013,
                    cost_per_1k_output: 0.0,
                    supports_vision: false,
                    supports_audio: false,
                    is_default: false,
                },
            ],
            rate_limits: RateLimits {
                requests_per_minute: 500,
                tokens_per_minute: 200000,
                ..Default::default()
            },
            available: true,
            last_latency_ms: None,
            error_rate: 0.0,
        }
    }

    /// Profil par défaut Gemini
    pub fn gemini_default() -> Self {
        Self {
            name: "Google Gemini".to_string(),
            provider: Provider::Gemini,
            capabilities: vec![
                ProviderCapability::TextGeneration,
                ProviderCapability::TextEmbeddings,
                ProviderCapability::ImageAnalysis,
                ProviderCapability::AudioTranscription,
                ProviderCapability::LongContext,
                ProviderCapability::MultiModal,
                ProviderCapability::Streaming,
                ProviderCapability::CodeGeneration,
            ],
            supports_text: true,
            supports_vision: true,
            supports_audio: true,
            supports_embeddings: true,
            max_context_tokens: 2000000, // 2M tokens!
            cost_rating: 5,
            speed_rating: 7,
            quality_rating: 8,
            safety_rating: 8,
            models: vec![
                ModelInfo {
                    id: "gemini-2.0-flash".to_string(),
                    name: "Gemini 2.0 Flash".to_string(),
                    context_window: 1000000,
                    cost_per_1k_input: 0.000075,
                    cost_per_1k_output: 0.0003,
                    supports_vision: true,
                    supports_audio: true,
                    is_default: true,
                },
                ModelInfo {
                    id: "gemini-1.5-pro".to_string(),
                    name: "Gemini 1.5 Pro".to_string(),
                    context_window: 2000000,
                    cost_per_1k_input: 0.00125,
                    cost_per_1k_output: 0.005,
                    supports_vision: true,
                    supports_audio: true,
                    is_default: false,
                },
            ],
            rate_limits: RateLimits {
                requests_per_minute: 1000,
                tokens_per_minute: 4000000,
                ..Default::default()
            },
            available: true,
            last_latency_ms: None,
            error_rate: 0.0,
        }
    }

    /// Profil par défaut Anthropic
    pub fn anthropic_default() -> Self {
        Self {
            name: "Anthropic Claude".to_string(),
            provider: Provider::Anthropic,
            capabilities: vec![
                ProviderCapability::TextGeneration,
                ProviderCapability::ImageAnalysis,
                ProviderCapability::LongContext,
                ProviderCapability::Streaming,
                ProviderCapability::FunctionCalling,
                ProviderCapability::CodeGeneration,
                ProviderCapability::Reasoning,
            ],
            supports_text: true,
            supports_vision: true,
            supports_audio: false,
            supports_embeddings: false,
            max_context_tokens: 200000,
            cost_rating: 8,
            speed_rating: 7,
            quality_rating: 10,
            safety_rating: 10,
            models: vec![
                ModelInfo {
                    id: "claude-sonnet-4-20250514".to_string(),
                    name: "Claude Sonnet 4".to_string(),
                    context_window: 200000,
                    cost_per_1k_input: 0.003,
                    cost_per_1k_output: 0.015,
                    supports_vision: true,
                    supports_audio: false,
                    is_default: true,
                },
                ModelInfo {
                    id: "claude-opus-4-20250514".to_string(),
                    name: "Claude Opus 4".to_string(),
                    context_window: 200000,
                    cost_per_1k_input: 0.015,
                    cost_per_1k_output: 0.075,
                    supports_vision: true,
                    supports_audio: false,
                    is_default: false,
                },
                ModelInfo {
                    id: "claude-3-5-haiku-20241022".to_string(),
                    name: "Claude 3.5 Haiku".to_string(),
                    context_window: 200000,
                    cost_per_1k_input: 0.0008,
                    cost_per_1k_output: 0.004,
                    supports_vision: true,
                    supports_audio: false,
                    is_default: false,
                },
            ],
            rate_limits: RateLimits {
                requests_per_minute: 1000,
                tokens_per_minute: 400000,
                ..Default::default()
            },
            available: true,
            last_latency_ms: None,
            error_rate: 0.0,
        }
    }

    /// Vérifie si le provider supporte une modalité
    pub fn supports_modality(&self, modality: Modality) -> bool {
        match modality {
            Modality::Text => self.supports_text,
            Modality::Vision => self.supports_vision,
            Modality::Audio => self.supports_audio,
            Modality::Embeddings => self.supports_embeddings,
            Modality::ImageGeneration => self
                .capabilities
                .contains(&ProviderCapability::ImageGeneration),
            Modality::MultiModal => self.capabilities.contains(&ProviderCapability::MultiModal),
        }
    }

    /// Vérifie si le provider a une capacité
    pub fn has_capability(&self, capability: ProviderCapability) -> bool {
        self.capabilities.contains(&capability)
    }

    /// Calcule un score composite
    pub fn composite_score(&self, weights: &ScoreWeights) -> f32 {
        let cost_score = (10 - self.cost_rating) as f32 * weights.cost;
        let speed_score = self.speed_rating as f32 * weights.speed;
        let quality_score = self.quality_rating as f32 * weights.quality;
        let safety_score = self.safety_rating as f32 * weights.safety;

        cost_score + speed_score + quality_score + safety_score
    }

    /// Récupère le modèle par défaut
    pub fn default_model(&self) -> Option<&ModelInfo> {
        self.models.iter().find(|m| m.is_default)
    }

    /// Récupère un modèle par ID
    pub fn get_model(&self, id: &str) -> Option<&ModelInfo> {
        self.models.iter().find(|m| m.id == id)
    }
}

/// Poids pour le calcul de score
#[derive(Clone, Debug)]
pub struct ScoreWeights {
    pub cost: f32,
    pub speed: f32,
    pub quality: f32,
    pub safety: f32,
}

impl Default for ScoreWeights {
    fn default() -> Self {
        Self {
            cost: 0.2,
            speed: 0.3,
            quality: 0.3,
            safety: 0.2,
        }
    }
}

/// Registre des providers
pub struct ProviderRegistry {
    providers: HashMap<Provider, ProviderProfile>,
}

impl ProviderRegistry {
    pub fn new() -> Self {
        Self {
            providers: HashMap::new(),
        }
    }

    /// Enregistre un provider
    pub fn register_provider(&mut self, provider: Provider, profile: ProviderProfile) {
        self.providers.insert(provider, profile);
    }

    /// Récupère un profil
    pub fn get_profile(&self, provider: Provider) -> Option<&ProviderProfile> {
        self.providers.get(&provider)
    }

    /// Récupère un profil mutable
    pub fn get_profile_mut(&mut self, provider: Provider) -> Option<&mut ProviderProfile> {
        self.providers.get_mut(&provider)
    }

    /// Liste les providers actifs
    pub fn active_providers(&self) -> Vec<Provider> {
        self.providers
            .iter()
            .filter(|(_, p)| p.available)
            .map(|(k, _)| *k)
            .collect()
    }

    /// Providers supportant une modalité
    pub fn providers_for_modality(&self, modality: Modality) -> Vec<&ProviderProfile> {
        self.providers
            .values()
            .filter(|p| p.available && p.supports_modality(modality))
            .collect()
    }

    /// Providers ayant une capacité
    pub fn providers_with_capability(
        &self,
        capability: ProviderCapability,
    ) -> Vec<&ProviderProfile> {
        self.providers
            .values()
            .filter(|p| p.available && p.has_capability(capability))
            .collect()
    }

    /// Meilleur provider pour une modalité selon les poids
    pub fn best_provider_for(
        &self,
        modality: Modality,
        weights: &ScoreWeights,
    ) -> Option<Provider> {
        self.providers_for_modality(modality)
            .into_iter()
            .max_by(|a, b| {
                a.composite_score(weights)
                    .partial_cmp(&b.composite_score(weights))
                    .unwrap_or(std::cmp::Ordering::Equal)
            })
            .map(|p| p.provider)
    }

    /// Met à jour la latence d'un provider
    pub fn update_latency(&mut self, provider: Provider, latency_ms: u64) {
        if let Some(profile) = self.providers.get_mut(&provider) {
            profile.last_latency_ms = Some(latency_ms);
        }
    }

    /// Met à jour le taux d'erreur
    pub fn update_error_rate(&mut self, provider: Provider, error_rate: f32) {
        if let Some(profile) = self.providers.get_mut(&provider) {
            profile.error_rate = error_rate;
        }
    }

    /// Marque un provider comme indisponible
    pub fn mark_unavailable(&mut self, provider: Provider) {
        if let Some(profile) = self.providers.get_mut(&provider) {
            profile.available = false;
        }
    }

    /// Marque un provider comme disponible
    pub fn mark_available(&mut self, provider: Provider) {
        if let Some(profile) = self.providers.get_mut(&provider) {
            profile.available = true;
        }
    }

    /// Nombre de providers enregistrés
    pub fn len(&self) -> usize {
        self.providers.len()
    }

    /// Est vide?
    pub fn is_empty(&self) -> bool {
        self.providers.is_empty()
    }
}

impl Default for ProviderRegistry {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_provider_profile_creation() {
        let profile = ProviderProfile::openai_default();
        assert!(profile.supports_text);
        assert!(profile.supports_vision);
    }

    #[test]
    fn test_registry() {
        let mut registry = ProviderRegistry::new();
        registry.register_provider(Provider::OpenAI, ProviderProfile::openai_default());
        registry.register_provider(Provider::Gemini, ProviderProfile::gemini_default());

        assert_eq!(registry.len(), 2);
        assert_eq!(registry.active_providers().len(), 2);
    }

    #[test]
    fn test_modality_support() {
        let profile = ProviderProfile::anthropic_default();
        assert!(profile.supports_modality(Modality::Text));
        assert!(profile.supports_modality(Modality::Vision));
        assert!(!profile.supports_modality(Modality::Audio));
    }

    #[test]
    fn test_composite_score() {
        let profile = ProviderProfile::openai_default();
        let weights = ScoreWeights::default();
        let score = profile.composite_score(&weights);
        assert!(score > 0.0);
    }

    #[test]
    fn test_provider_variants() {
        let providers = [
            Provider::OpenAI,
            Provider::Anthropic,
            Provider::Gemini,
            Provider::Local,
        ];
        assert_eq!(providers.len(), 4);
    }

    #[test]
    fn test_score_weights_default() {
        let weights = ScoreWeights::default();
        // Les poids devraient être normalisés
        assert!(weights.quality >= 0.0);
        assert!(weights.speed >= 0.0);
        assert!(weights.cost >= 0.0);
    }

    #[test]
    fn test_provider_capability_variants() {
        let capabilities = vec![
            ProviderCapability::TextGeneration,
            ProviderCapability::TextEmbeddings,
            ProviderCapability::ImageGeneration,
            ProviderCapability::ImageAnalysis,
            ProviderCapability::AudioTranscription,
            ProviderCapability::AudioGeneration,
            ProviderCapability::LongContext,
            ProviderCapability::MultiModal,
            ProviderCapability::Streaming,
            ProviderCapability::FunctionCalling,
            ProviderCapability::CodeGeneration,
            ProviderCapability::Reasoning,
        ];
        assert_eq!(capabilities.len(), 12);
    }

    #[test]
    fn test_registry_get_profile() {
        let mut registry = ProviderRegistry::new();
        registry.register_provider(Provider::OpenAI, ProviderProfile::openai_default());

        let profile = registry.get_profile(Provider::OpenAI);
        assert!(profile.is_some());

        let missing = registry.get_profile(Provider::Local);
        // Local n'est pas enregistré donc devrait être None
        assert!(missing.is_none());
    }

    #[test]
    fn test_gemini_profile() {
        let profile = ProviderProfile::gemini_default();
        assert!(profile.supports_text);
        assert!(profile.supports_vision);
        // Gemini a une grande fenêtre de contexte
        assert!(profile.max_context_tokens >= 128000);
    }

    #[test]
    fn test_anthropic_profile() {
        let profile = ProviderProfile::anthropic_default();
        assert!(profile.supports_text);
        assert!(profile.supports_vision);
        // Anthropic/Claude est connu pour sa qualité (rating 1-10)
        assert!(profile.quality_rating >= 9);
    }
}
