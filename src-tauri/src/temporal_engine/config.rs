//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — TEMPORAL CONFIG
//! Super Prompt #18 — Configuration du système temporel
//! ═══════════════════════════════════════════════════════════════════════════════

use super::planner::PlannerConfig;
use super::temporal_memory::TemporalMemoryConfig;
use serde::{Deserialize, Serialize};

/// Configuration du moteur temporel
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TemporalConfig {
    pub name: String,
    pub enabled: bool,

    // Tick configuration
    pub tick_interval_ms: u64,
    pub max_tick_duration_ms: u64,

    // Sub-system configs
    pub memory_config: TemporalMemoryConfig,
    pub planner_config: PlannerConfig,

    // Features
    pub routines_enabled: bool,
    pub anticipation_enabled: bool,
    pub alignment_enabled: bool,

    // Thresholds
    pub prediction_confidence_threshold: f32,
    pub alignment_warning_threshold: f32,

    // Performance
    pub max_predictions_per_tick: usize,
    pub max_routines_per_tick: usize,

    // Persistence
    pub persist_state: bool,
    pub state_file_path: Option<String>,
}

impl Default for TemporalConfig {
    fn default() -> Self {
        Self {
            name: "default".to_string(),
            enabled: true,
            tick_interval_ms: 60000,    // 1 minute
            max_tick_duration_ms: 5000, // 5 seconds max per tick
            memory_config: TemporalMemoryConfig::default(),
            planner_config: PlannerConfig::default(),
            routines_enabled: true,
            anticipation_enabled: true,
            alignment_enabled: true,
            prediction_confidence_threshold: 0.5,
            alignment_warning_threshold: 0.4,
            max_predictions_per_tick: 20,
            max_routines_per_tick: 10,
            persist_state: true,
            state_file_path: None,
        }
    }
}

impl TemporalConfig {
    /// Configuration minimale pour les tests
    pub fn minimal() -> Self {
        Self {
            name: "minimal".to_string(),
            enabled: true,
            tick_interval_ms: 1000,
            max_tick_duration_ms: 500,
            memory_config: TemporalMemoryConfig {
                max_traces: 100,
                ..Default::default()
            },
            planner_config: PlannerConfig {
                max_tasks: 50,
                ..Default::default()
            },
            routines_enabled: false,
            anticipation_enabled: false,
            alignment_enabled: false,
            prediction_confidence_threshold: 0.7,
            alignment_warning_threshold: 0.3,
            max_predictions_per_tick: 5,
            max_routines_per_tick: 3,
            persist_state: false,
            state_file_path: None,
        }
    }

    /// Configuration haute performance
    pub fn high_performance() -> Self {
        Self {
            name: "high_performance".to_string(),
            enabled: true,
            tick_interval_ms: 30000,     // 30 seconds
            max_tick_duration_ms: 10000, // 10 seconds max
            memory_config: TemporalMemoryConfig {
                max_traces: 50000,
                decay_rate: 0.005,
                consolidation_threshold: 0.8,
                min_significance: 0.05,
            },
            planner_config: PlannerConfig {
                max_tasks: 5000,
                auto_prioritize: true,
                respect_energy_levels: true,
                default_task_duration_ms: 1800000,
            },
            routines_enabled: true,
            anticipation_enabled: true,
            alignment_enabled: true,
            prediction_confidence_threshold: 0.4,
            alignment_warning_threshold: 0.5,
            max_predictions_per_tick: 50,
            max_routines_per_tick: 20,
            persist_state: true,
            state_file_path: Some("temporal_state_hp.json".to_string()),
        }
    }

    /// Configuration pour le développement
    pub fn development() -> Self {
        Self {
            name: "development".to_string(),
            enabled: true,
            tick_interval_ms: 5000, // 5 seconds (faster for testing)
            max_tick_duration_ms: 2000,
            memory_config: TemporalMemoryConfig {
                max_traces: 1000,
                ..Default::default()
            },
            planner_config: PlannerConfig::default(),
            routines_enabled: true,
            anticipation_enabled: true,
            alignment_enabled: true,
            prediction_confidence_threshold: 0.3, // Lower threshold for more predictions
            alignment_warning_threshold: 0.5,
            max_predictions_per_tick: 30,
            max_routines_per_tick: 15,
            persist_state: false, // Don't persist in dev
            state_file_path: None,
        }
    }

    /// Valide la configuration
    pub fn validate(&self) -> Result<(), ConfigError> {
        if self.tick_interval_ms < 1000 {
            return Err(ConfigError::InvalidValue(
                "tick_interval_ms must be >= 1000".to_string(),
            ));
        }

        if self.max_tick_duration_ms >= self.tick_interval_ms {
            return Err(ConfigError::InvalidValue(
                "max_tick_duration_ms must be < tick_interval_ms".to_string(),
            ));
        }

        if self.prediction_confidence_threshold < 0.0 || self.prediction_confidence_threshold > 1.0
        {
            return Err(ConfigError::InvalidValue(
                "prediction_confidence_threshold must be between 0 and 1".to_string(),
            ));
        }

        if self.alignment_warning_threshold < 0.0 || self.alignment_warning_threshold > 1.0 {
            return Err(ConfigError::InvalidValue(
                "alignment_warning_threshold must be between 0 and 1".to_string(),
            ));
        }

        Ok(())
    }

    /// Charge depuis un fichier JSON
    pub fn load_from_file(path: &str) -> Result<Self, ConfigError> {
        let content =
            std::fs::read_to_string(path).map_err(|e| ConfigError::IoError(e.to_string()))?;

        let config: Self =
            serde_json::from_str(&content).map_err(|e| ConfigError::ParseError(e.to_string()))?;

        config.validate()?;
        Ok(config)
    }

    /// Sauvegarde dans un fichier JSON
    pub fn save_to_file(&self, path: &str) -> Result<(), ConfigError> {
        let content = serde_json::to_string_pretty(self)
            .map_err(|e| ConfigError::ParseError(e.to_string()))?;

        std::fs::write(path, content).map_err(|e| ConfigError::IoError(e.to_string()))?;

        Ok(())
    }

    /// Builder pattern
    pub fn builder() -> TemporalConfigBuilder {
        TemporalConfigBuilder::default()
    }
}

/// Builder pour TemporalConfig
#[derive(Default)]
pub struct TemporalConfigBuilder {
    config: TemporalConfig,
}

impl TemporalConfigBuilder {
    pub fn name(mut self, name: &str) -> Self {
        self.config.name = name.to_string();
        self
    }

    pub fn tick_interval(mut self, ms: u64) -> Self {
        self.config.tick_interval_ms = ms;
        self
    }

    pub fn max_tick_duration(mut self, ms: u64) -> Self {
        self.config.max_tick_duration_ms = ms;
        self
    }

    pub fn routines_enabled(mut self, enabled: bool) -> Self {
        self.config.routines_enabled = enabled;
        self
    }

    pub fn anticipation_enabled(mut self, enabled: bool) -> Self {
        self.config.anticipation_enabled = enabled;
        self
    }

    pub fn alignment_enabled(mut self, enabled: bool) -> Self {
        self.config.alignment_enabled = enabled;
        self
    }

    pub fn persist_state(mut self, persist: bool, path: Option<String>) -> Self {
        self.config.persist_state = persist;
        self.config.state_file_path = path;
        self
    }

    pub fn memory_config(mut self, config: TemporalMemoryConfig) -> Self {
        self.config.memory_config = config;
        self
    }

    pub fn planner_config(mut self, config: PlannerConfig) -> Self {
        self.config.planner_config = config;
        self
    }

    pub fn build(self) -> Result<TemporalConfig, ConfigError> {
        self.config.validate()?;
        Ok(self.config)
    }
}

/// Erreur de configuration
#[derive(Debug, Clone)]
pub enum ConfigError {
    InvalidValue(String),
    IoError(String),
    ParseError(String),
}

impl std::fmt::Display for ConfigError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::InvalidValue(msg) => write!(f, "Invalid config value: {}", msg),
            Self::IoError(msg) => write!(f, "IO error: {}", msg),
            Self::ParseError(msg) => write!(f, "Parse error: {}", msg),
        }
    }
}

impl std::error::Error for ConfigError {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = TemporalConfig::default();
        assert!(config.validate().is_ok());
    }

    #[test]
    fn test_minimal_config() {
        let config = TemporalConfig::minimal();
        assert!(config.validate().is_ok());
    }

    #[test]
    fn test_builder() {
        let config = TemporalConfig::builder()
            .name("test")
            .tick_interval(30000)
            .routines_enabled(false)
            .build()
            .unwrap();

        assert_eq!(config.name, "test");
        assert!(!config.routines_enabled);
    }

    #[test]
    fn test_invalid_config() {
        let mut config = TemporalConfig::default();
        config.tick_interval_ms = 500; // Too small
        assert!(config.validate().is_err());
    }
}
