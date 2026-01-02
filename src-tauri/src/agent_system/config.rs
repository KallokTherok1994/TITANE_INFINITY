//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — AGENT SYSTEM CONFIG
//! Super Prompt #19 — Configuration du système d'agents
//! ═══════════════════════════════════════════════════════════════════════════════

use super::sandbox::SandboxConfig;
use super::supervisor::SupervisionConfig;
use serde::{Deserialize, Serialize};

/// Configuration du système d'agents
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AgentSystemConfig {
    pub name: String,
    pub enabled: bool,

    // Limites
    pub max_agents: usize,
    pub max_concurrent_tasks: usize,
    pub max_collaborations: usize,

    // Timeouts
    pub default_task_timeout_ms: u64,
    pub collaboration_timeout_ms: u64,

    // Sub-configs
    pub supervision_config: SupervisionConfig,
    pub sandbox_config: SandboxConfig,

    // Message bus
    pub message_bus_size: usize,
    pub message_ttl_ms: u64,

    // Features
    pub auto_restart_agents: bool,
    pub enable_collaboration: bool,
    pub enable_learning: bool,

    // Performance
    pub health_check_interval_ms: u64,
    pub cleanup_interval_ms: u64,
}

impl Default for AgentSystemConfig {
    fn default() -> Self {
        Self {
            name: "default".to_string(),
            enabled: true,
            max_agents: 1000, // AUGMENTÉ: 100 → 1000
            max_concurrent_tasks: 500, // AUGMENTÉ: 50 → 500
            max_collaborations: 100, // AUGMENTÉ: 10 → 100
            default_task_timeout_ms: 90000, // Ajouté: 90s
            collaboration_timeout_ms: 3600000, // AUGMENTÉ: 5min → 1h
            supervision_config: SupervisionConfig::default(),
            sandbox_config: SandboxConfig::default(),
            message_bus_size: 1000, // AUGMENTÉ: 100 → 1000
            message_ttl_ms: 600000, // AUGMENTÉ: 1min → 10min
            auto_restart_agents: true,
            enable_collaboration: true,
            enable_learning: false,
            health_check_interval_ms: 30000, // AUGMENTÉ: 5s → 30s
            cleanup_interval_ms: 300000, // AUGMENTÉ: 1min → 5min
        }
    }
}

impl AgentSystemConfig {
    /// Configuration minimale
    pub fn minimal() -> Self {
        Self {
            name: "minimal".to_string(),
            enabled: true,
            max_agents: 10,
            max_concurrent_tasks: 5,
            max_collaborations: 2,
            default_task_timeout_ms: 30000, // Ajouté: 30s
            collaboration_timeout_ms: 60000,
            supervision_config: SupervisionConfig {
                max_retries: 1,
                timeout_ms: 30000,
                ..Default::default()
            },
            sandbox_config: SandboxConfig {
                enabled: false,
                ..Default::default()
            },
            message_bus_size: 50,
            message_ttl_ms: 30000,
            auto_restart_agents: false,
            enable_collaboration: false,
            enable_learning: false,
            health_check_interval_ms: 10000,
            cleanup_interval_ms: 120000,
        }
    }

    /// Configuration production
    pub fn production() -> Self {
        Self {
            name: "production".to_string(),
            enabled: true,
            max_agents: 5000, // AUGMENTÉ: 500 → 5000
            max_concurrent_tasks: 2000, // AUGMENTÉ: 200 → 2000
            max_collaborations: 500, // AUGMENTÉ: 50 → 500
            default_task_timeout_ms: 90000, // Ajouté: 90s
            collaboration_timeout_ms: 3600000, // AUGMENTÉ: 10min → 1h
            supervision_config: SupervisionConfig {
                max_retries: 5,
                timeout_ms: 90000, // ✨ v26.2.1: Match default_task_timeout_ms
                health_check_interval_ms: 3000,
                auto_restart: true,
                ..Default::default()
            },
            sandbox_config: SandboxConfig {
                enabled: true,
                max_memory_mb: 1024,
                max_cpu_percent: 80,
                ..Default::default()
            },
            message_bus_size: 500,
            message_ttl_ms: 120000,
            auto_restart_agents: true,
            enable_collaboration: true,
            enable_learning: true,
            health_check_interval_ms: 3000,
            cleanup_interval_ms: 30000,
        }
    }

    /// Configuration développement
    pub fn development() -> Self {
        Self {
            name: "development".to_string(),
            enabled: true,
            max_agents: 500, // AUGMENTÉ: 50 → 500
            max_concurrent_tasks: 200, // AUGMENTÉ: 20 → 200
            max_collaborations: 100, // AUGMENTÉ: 10 → 100
            default_task_timeout_ms: 60000, // Ajouté: 60s
            collaboration_timeout_ms: 1800000, // AUGMENTÉ: 3min → 30min
            supervision_config: SupervisionConfig {
                max_retries: 2,
                ..Default::default()
            },
            sandbox_config: SandboxConfig {
                enabled: false, // Désactivé en dev
                ..Default::default()
            },
            message_bus_size: 100,
            message_ttl_ms: 60000,
            auto_restart_agents: true,
            enable_collaboration: true,
            enable_learning: true,
            health_check_interval_ms: 5000,
            cleanup_interval_ms: 60000,
        }
    }

    /// Valide la configuration
    pub fn validate(&self) -> Result<(), ConfigError> {
        if self.max_agents == 0 {
            return Err(ConfigError::InvalidValue(
                "max_agents must be > 0".to_string(),
            ));
        }

        if self.max_concurrent_tasks > self.max_agents * 10 {
            return Err(ConfigError::InvalidValue(
                "max_concurrent_tasks seems too high relative to max_agents".to_string(),
            ));
        }

        if self.default_task_timeout_ms < 1000 {
            return Err(ConfigError::InvalidValue(
                "default_task_timeout_ms must be >= 1000".to_string(),
            ));
        }

        Ok(())
    }

    /// Builder pattern
    pub fn builder() -> AgentSystemConfigBuilder {
        AgentSystemConfigBuilder::default()
    }
}

/// Builder pour AgentSystemConfig
#[derive(Default)]
pub struct AgentSystemConfigBuilder {
    config: AgentSystemConfig,
}

impl AgentSystemConfigBuilder {
    pub fn name(mut self, name: &str) -> Self {
        self.config.name = name.to_string();
        self
    }

    pub fn max_agents(mut self, max: usize) -> Self {
        self.config.max_agents = max;
        self
    }

    pub fn max_concurrent_tasks(mut self, max: usize) -> Self {
        self.config.max_concurrent_tasks = max;
        self
    }

    pub fn enable_collaboration(mut self, enable: bool) -> Self {
        self.config.enable_collaboration = enable;
        self
    }

    pub fn enable_learning(mut self, enable: bool) -> Self {
        self.config.enable_learning = enable;
        self
    }

    pub fn sandbox_enabled(mut self, enabled: bool) -> Self {
        self.config.sandbox_config.enabled = enabled;
        self
    }

    pub fn supervision_config(mut self, config: SupervisionConfig) -> Self {
        self.config.supervision_config = config;
        self
    }

    pub fn sandbox_config(mut self, config: SandboxConfig) -> Self {
        self.config.sandbox_config = config;
        self
    }

    pub fn build(self) -> Result<AgentSystemConfig, ConfigError> {
        self.config.validate()?;
        Ok(self.config)
    }
}

/// Erreur de configuration
#[derive(Debug, Clone)]
pub enum ConfigError {
    InvalidValue(String),
    MissingField(String),
}

impl std::fmt::Display for ConfigError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::InvalidValue(msg) => write!(f, "Invalid value: {}", msg),
            Self::MissingField(msg) => write!(f, "Missing field: {}", msg),
        }
    }
}

impl std::error::Error for ConfigError {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = AgentSystemConfig::default();
        assert!(config.validate().is_ok());
    }

    #[test]
    fn test_builder() {
        let config = AgentSystemConfig::builder()
            .name("test")
            .max_agents(50)
            .enable_collaboration(true)
            .build()
            .expect("agent system config builder should succeed");

        assert_eq!(config.name, "test");
        assert_eq!(config.max_agents, 50);
    }

    #[test]
    fn test_invalid_config() {
        let mut config = AgentSystemConfig::default();
        config.max_agents = 0;
        assert!(config.validate().is_err());
    }
}
