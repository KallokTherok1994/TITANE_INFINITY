//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — API HUB CONFIG
//! Super Prompt #17 — Configuration du Hub API
//! ═══════════════════════════════════════════════════════════════════════════════

use super::{router::ModelChoiceStrategy, Provider};
use serde::{Deserialize, Serialize};

/// Configuration du Hub API
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct APIHubConfig {
    /// Providers activés
    pub enabled_providers: Vec<Provider>,
    /// Stratégie par défaut
    pub default_strategy: ModelChoiceStrategy,
    /// Timeout par défaut (ms)
    pub default_timeout_ms: u64,
    /// Max tokens par défaut
    pub default_max_tokens: u32,
    /// Température par défaut
    pub default_temperature: f32,
    /// Activer le cache
    pub cache_enabled: bool,
    /// TTL du cache (secondes)
    pub cache_ttl_seconds: u64,
    /// Activer les retries
    pub retry_enabled: bool,
    /// Nombre max de retries
    pub max_retries: u32,
    /// Délai entre retries (ms)
    pub retry_delay_ms: u64,
    /// Activer le rate limiting local
    pub rate_limiting_enabled: bool,
    /// Activer la validation de sécurité
    pub safety_validation_enabled: bool,
    /// Activer l'harmonisation des réponses
    pub harmonization_enabled: bool,
    /// Activer les diagnostics
    pub diagnostics_enabled: bool,
    /// Budget maximum journalier (USD)
    pub daily_budget_usd: Option<f64>,
    /// Configuration par provider
    pub provider_configs: ProviderConfigs,
}

impl Default for APIHubConfig {
    fn default() -> Self {
        Self {
            enabled_providers: vec![Provider::OpenAI, Provider::Gemini, Provider::Anthropic],
            default_strategy: ModelChoiceStrategy::Balanced,
            default_timeout_ms: 60000,
            default_max_tokens: 4096,
            default_temperature: 0.7,
            cache_enabled: true,
            cache_ttl_seconds: 3600,
            retry_enabled: true,
            max_retries: 3,
            retry_delay_ms: 1000,
            rate_limiting_enabled: true,
            safety_validation_enabled: true,
            harmonization_enabled: true,
            diagnostics_enabled: true,
            daily_budget_usd: Some(10.0),
            provider_configs: ProviderConfigs::default(),
        }
    }
}

impl APIHubConfig {
    /// Configuration minimale (rapide, pas de sécurité)
    pub fn minimal() -> Self {
        Self {
            safety_validation_enabled: false,
            harmonization_enabled: false,
            cache_enabled: false,
            retry_enabled: false,
            diagnostics_enabled: false,
            ..Default::default()
        }
    }

    /// Configuration production (sécurité maximale)
    pub fn production() -> Self {
        Self {
            safety_validation_enabled: true,
            harmonization_enabled: true,
            cache_enabled: true,
            retry_enabled: true,
            max_retries: 5,
            diagnostics_enabled: true,
            daily_budget_usd: Some(100.0),
            ..Default::default()
        }
    }

    /// Configuration développement
    pub fn development() -> Self {
        Self {
            default_timeout_ms: 120000, // Plus long pour debug
            cache_enabled: false,       // Pas de cache en dev
            daily_budget_usd: Some(5.0),
            ..Default::default()
        }
    }

    /// Vérifie si un provider est activé
    pub fn is_provider_enabled(&self, provider: Provider) -> bool {
        self.enabled_providers.contains(&provider)
    }

    /// Active un provider
    pub fn enable_provider(&mut self, provider: Provider) {
        if !self.enabled_providers.contains(&provider) {
            self.enabled_providers.push(provider);
        }
    }

    /// Désactive un provider
    pub fn disable_provider(&mut self, provider: Provider) {
        self.enabled_providers.retain(|p| *p != provider);
    }
}

/// Configurations par provider
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct ProviderConfigs {
    pub openai: OpenAIConfig,
    pub gemini: GeminiConfig,
    pub anthropic: AnthropicConfig,
}

/// Configuration OpenAI
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct OpenAIConfig {
    pub default_model: String,
    pub embedding_model: String,
    pub vision_model: String,
    pub base_url: Option<String>,
    pub organization_id: Option<String>,
    pub max_requests_per_minute: u32,
}

impl Default for OpenAIConfig {
    fn default() -> Self {
        Self {
            default_model: "gpt-4o".to_string(),
            embedding_model: "text-embedding-3-large".to_string(),
            vision_model: "gpt-4o".to_string(),
            base_url: None,
            organization_id: None,
            max_requests_per_minute: 500,
        }
    }
}

/// Configuration Gemini
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GeminiConfig {
    pub default_model: String,
    pub vision_model: String,
    pub long_context_model: String,
    pub max_requests_per_minute: u32,
}

impl Default for GeminiConfig {
    fn default() -> Self {
        Self {
            default_model: "gemini-2.0-flash".to_string(),
            vision_model: "gemini-2.0-flash".to_string(),
            long_context_model: "gemini-1.5-pro".to_string(),
            max_requests_per_minute: 1000,
        }
    }
}

/// Configuration Anthropic
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AnthropicConfig {
    pub default_model: String,
    pub reasoning_model: String,
    pub fast_model: String,
    pub max_requests_per_minute: u32,
}

impl Default for AnthropicConfig {
    fn default() -> Self {
        Self {
            default_model: "claude-sonnet-4-20250514".to_string(),
            reasoning_model: "claude-opus-4-20250514".to_string(),
            fast_model: "claude-3-5-haiku-20241022".to_string(),
            max_requests_per_minute: 1000,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = APIHubConfig::default();
        assert!(config.enabled_providers.contains(&Provider::OpenAI));
        assert!(config.safety_validation_enabled);
    }

    #[test]
    fn test_minimal_config() {
        let config = APIHubConfig::minimal();
        assert!(!config.safety_validation_enabled);
        assert!(!config.cache_enabled);
    }

    #[test]
    fn test_production_config() {
        let config = APIHubConfig::production();
        assert!(config.safety_validation_enabled);
        assert_eq!(config.max_retries, 5);
    }

    #[test]
    fn test_enable_disable_provider() {
        let mut config = APIHubConfig::default();

        config.disable_provider(Provider::Gemini);
        assert!(!config.is_provider_enabled(Provider::Gemini));

        config.enable_provider(Provider::Gemini);
        assert!(config.is_provider_enabled(Provider::Gemini));
    }

    #[test]
    fn test_provider_configs() {
        let configs = ProviderConfigs::default();
        assert_eq!(configs.openai.default_model, "gpt-4o");
        assert_eq!(configs.gemini.default_model, "gemini-2.0-flash");
        assert_eq!(configs.anthropic.default_model, "claude-sonnet-4-20250514");
    }

    #[test]
    fn test_api_hub_config_all_defaults() {
        let config = APIHubConfig::default();

        assert_eq!(config.default_timeout_ms, 60000);
        assert_eq!(config.default_max_tokens, 4096);
        assert!((config.default_temperature - 0.7).abs() < 0.01);
        assert!(config.cache_enabled);
        assert_eq!(config.cache_ttl_seconds, 3600);
        assert!(config.retry_enabled);
        assert_eq!(config.max_retries, 3);
        assert_eq!(config.retry_delay_ms, 1000);
        assert!(config.rate_limiting_enabled);
        assert!(config.harmonization_enabled);
        assert!(config.diagnostics_enabled);
        assert_eq!(config.daily_budget_usd, Some(10.0));
    }

    #[test]
    fn test_development_config() {
        let config = APIHubConfig::development();

        assert_eq!(config.default_timeout_ms, 120000);
        assert!(!config.cache_enabled);
        assert_eq!(config.daily_budget_usd, Some(5.0));
    }

    #[test]
    fn test_production_config_budget() {
        let config = APIHubConfig::production();
        assert_eq!(config.daily_budget_usd, Some(100.0));
    }

    #[test]
    fn test_enable_already_enabled_provider() {
        let mut config = APIHubConfig::default();
        let initial_count = config.enabled_providers.len();

        config.enable_provider(Provider::OpenAI);

        // Should not add duplicate
        assert_eq!(config.enabled_providers.len(), initial_count);
    }

    #[test]
    fn test_disable_all_providers() {
        let mut config = APIHubConfig::default();

        config.disable_provider(Provider::OpenAI);
        config.disable_provider(Provider::Gemini);
        config.disable_provider(Provider::Anthropic);

        assert!(config.enabled_providers.is_empty());
    }

    #[test]
    fn test_config_clone() {
        let config = APIHubConfig::default();
        let cloned = config.clone();

        assert_eq!(cloned.default_timeout_ms, config.default_timeout_ms);
        assert_eq!(
            cloned.enabled_providers.len(),
            config.enabled_providers.len()
        );
    }

    #[test]
    fn test_openai_config_default() {
        let config = OpenAIConfig::default();

        assert_eq!(config.default_model, "gpt-4o");
        assert_eq!(config.embedding_model, "text-embedding-3-large");
        assert_eq!(config.vision_model, "gpt-4o");
        assert!(config.base_url.is_none());
        assert!(config.organization_id.is_none());
        assert_eq!(config.max_requests_per_minute, 500);
    }

    #[test]
    fn test_gemini_config_default() {
        let config = GeminiConfig::default();

        assert_eq!(config.default_model, "gemini-2.0-flash");
        assert_eq!(config.vision_model, "gemini-2.0-flash");
        assert_eq!(config.long_context_model, "gemini-1.5-pro");
        assert_eq!(config.max_requests_per_minute, 1000);
    }

    #[test]
    fn test_anthropic_config_default() {
        let config = AnthropicConfig::default();

        assert_eq!(config.default_model, "claude-sonnet-4-20250514");
        assert_eq!(config.reasoning_model, "claude-opus-4-20250514");
        assert_eq!(config.fast_model, "claude-3-5-haiku-20241022");
        assert_eq!(config.max_requests_per_minute, 1000);
    }

    #[test]
    fn test_openai_config_clone() {
        let config = OpenAIConfig::default();
        let cloned = config.clone();

        assert_eq!(cloned.default_model, config.default_model);
        assert_eq!(
            cloned.max_requests_per_minute,
            config.max_requests_per_minute
        );
    }

    #[test]
    fn test_gemini_config_clone() {
        let config = GeminiConfig::default();
        let cloned = config.clone();

        assert_eq!(cloned.default_model, config.default_model);
        assert_eq!(cloned.vision_model, config.vision_model);
    }

    #[test]
    fn test_anthropic_config_clone() {
        let config = AnthropicConfig::default();
        let cloned = config.clone();

        assert_eq!(cloned.default_model, config.default_model);
        assert_eq!(cloned.fast_model, config.fast_model);
    }

    #[test]
    fn test_provider_configs_clone() {
        let configs = ProviderConfigs::default();
        let cloned = configs.clone();

        assert_eq!(cloned.openai.default_model, configs.openai.default_model);
        assert_eq!(cloned.gemini.default_model, configs.gemini.default_model);
    }

    #[test]
    fn test_default_strategy() {
        let config = APIHubConfig::default();
        assert_eq!(config.default_strategy, ModelChoiceStrategy::Balanced);
    }

    #[test]
    fn test_minimal_config_features() {
        let config = APIHubConfig::minimal();

        assert!(!config.safety_validation_enabled);
        assert!(!config.harmonization_enabled);
        assert!(!config.cache_enabled);
        assert!(!config.retry_enabled);
        assert!(!config.diagnostics_enabled);
    }
}
