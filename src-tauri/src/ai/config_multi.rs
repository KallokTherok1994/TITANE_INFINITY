// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Multi-IA Configuration
//   SUPER PROMPT #8 — Configuration Management
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Configuration globale du Multi-IA Orchestrator
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiConfig {
    pub providers: ProvidersConfig,
    pub routing: RoutingConfig,
    pub performance: PerformanceConfig,
    pub fallback: FallbackConfig,
}

impl Default for AiConfig {
    fn default() -> Self {
        Self {
            providers: ProvidersConfig::default(),
            routing: RoutingConfig::default(),
            performance: PerformanceConfig::default(),
            fallback: FallbackConfig::default(),
        }
    }
}

/// Configuration des providers IA
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProvidersConfig {
    pub claude: ClaudeConfig,
    pub openai: OpenAiConfig,
    pub local: LocalConfig,
    pub titane: TitaneEngineConfig,
}

impl Default for ProvidersConfig {
    fn default() -> Self {
        Self {
            claude: ClaudeConfig::default(),
            openai: OpenAiConfig::default(),
            local: LocalConfig::default(),
            titane: TitaneEngineConfig::default(),
        }
    }
}

/// Configuration Claude
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClaudeConfig {
    pub enabled: bool,
    pub api_key: Option<String>,
    pub models: ClaudeModels,
    pub timeout_ms: u64,
    pub max_retries: u32,
}

impl Default for ClaudeConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            api_key: std::env::var("ANTHROPIC_API_KEY").ok(),
            models: ClaudeModels::default(),
            timeout_ms: 30_000,
            max_retries: 3,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClaudeModels {
    pub opus: String,
    pub sonnet: String,
    pub haiku: String,
}

impl Default for ClaudeModels {
    fn default() -> Self {
        Self {
            opus: "claude-opus-4-20250514".to_string(),
            sonnet: "claude-sonnet-4-20250514".to_string(),
            haiku: "claude-haiku-4-20250223".to_string(),
        }
    }
}

/// Configuration OpenAI
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenAiConfig {
    pub enabled: bool,
    pub api_key: Option<String>,
    pub models: OpenAiModels,
    pub timeout_ms: u64,
    pub max_retries: u32,
}

impl Default for OpenAiConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            api_key: std::env::var("OPENAI_API_KEY").ok(),
            models: OpenAiModels::default(),
            timeout_ms: 30_000,
            max_retries: 3,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenAiModels {
    pub gpt4: String,
    pub gpt4_mini: String,
    pub gpt35: String,
}

impl Default for OpenAiModels {
    fn default() -> Self {
        Self {
            gpt4: "gpt-4.1-turbo".to_string(),
            gpt4_mini: "gpt-4.1-mini".to_string(),
            gpt35: "gpt-3.5-turbo".to_string(),
        }
    }
}

/// Configuration Local Models
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocalConfig {
    pub enabled: bool,
    pub ollama_url: String,
    pub models: Vec<String>,
    pub timeout_ms: u64,
}

impl Default for LocalConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            ollama_url: "http://localhost:11434".to_string(),
            models: vec![
                "llama3".to_string(),
                "mistral".to_string(),
                "codellama".to_string(),
            ],
            timeout_ms: 60_000,
        }
    }
}

/// Configuration TITANE Engine (fallback interne)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TitaneEngineConfig {
    pub enabled: bool,
    pub max_length: u32,
    pub style: String,
}

impl Default for TitaneEngineConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            max_length: 1024,
            style: "professional".to_string(),
        }
    }
}

/// Configuration du routage intelligent
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoutingConfig {
    pub mode_mappings: HashMap<String, ProviderPriority>,
    pub cost_optimization: bool,
    pub latency_priority: bool,
}

impl Default for RoutingConfig {
    fn default() -> Self {
        let mut mode_mappings = HashMap::new();

        // Fast mode
        mode_mappings.insert(
            "fast".to_string(),
            ProviderPriority {
                primary: "claude_haiku".to_string(),
                secondary: Some("gpt35".to_string()),
                fallback: "titane_engine".to_string(),
            },
        );

        // Quality mode
        mode_mappings.insert(
            "quality".to_string(),
            ProviderPriority {
                primary: "claude_sonnet".to_string(),
                secondary: Some("gpt4_mini".to_string()),
                fallback: "claude_haiku".to_string(),
            },
        );

        // Deep mode
        mode_mappings.insert(
            "deep".to_string(),
            ProviderPriority {
                primary: "claude_opus".to_string(),
                secondary: Some("gpt4".to_string()),
                fallback: "claude_sonnet".to_string(),
            },
        );

        // Creative mode
        mode_mappings.insert(
            "creative".to_string(),
            ProviderPriority {
                primary: "gpt4".to_string(),
                secondary: Some("claude_sonnet".to_string()),
                fallback: "local_llama3".to_string(),
            },
        );

        // Analysis mode
        mode_mappings.insert(
            "analysis".to_string(),
            ProviderPriority {
                primary: "claude_sonnet".to_string(),
                secondary: Some("gpt4_mini".to_string()),
                fallback: "claude_haiku".to_string(),
            },
        );

        Self {
            mode_mappings,
            cost_optimization: true,
            latency_priority: false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderPriority {
    pub primary: String,
    pub secondary: Option<String>,
    pub fallback: String,
}

/// Configuration de performance
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceConfig {
    pub parallel_requests: bool,
    pub cache_enabled: bool,
    pub cache_ttl_seconds: u64,
    pub max_concurrent_requests: usize,
}

impl Default for PerformanceConfig {
    fn default() -> Self {
        Self {
            parallel_requests: true,
            cache_enabled: true,
            cache_ttl_seconds: 300,
            max_concurrent_requests: 10,
        }
    }
}

/// Configuration du fallback system
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FallbackConfig {
    pub enabled: bool,
    pub max_attempts: u32,
    pub retry_delay_ms: u64,
    pub titane_engine_always_available: bool,
}

impl Default for FallbackConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            max_attempts: 3,
            retry_delay_ms: 1000,
            titane_engine_always_available: true,
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = AiConfig::default();
        assert!(config.providers.claude.enabled);
        assert!(config.providers.openai.enabled);
        assert!(config.fallback.enabled);
    }

    #[test]
    fn test_routing_config_modes() {
        let config = RoutingConfig::default();
        assert!(config.mode_mappings.contains_key("fast"));
        assert!(config.mode_mappings.contains_key("quality"));
        assert!(config.mode_mappings.contains_key("deep"));

        let fast = config
            .mode_mappings
            .get("fast")
            .expect("routing config should contain fast mapping");
        assert_eq!(fast.primary, "claude_haiku");
    }

    #[test]
    fn test_claude_models() {
        let models = ClaudeModels::default();
        assert!(models.opus.contains("opus"));
        assert!(models.sonnet.contains("sonnet"));
        assert!(models.haiku.contains("haiku"));
    }
}
