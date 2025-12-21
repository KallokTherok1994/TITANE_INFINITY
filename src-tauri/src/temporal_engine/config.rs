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
            .expect("TemporalConfig builder should build valid config");

        assert_eq!(config.name, "test");
        assert!(!config.routines_enabled);
    }

    #[test]
    fn test_invalid_config() {
        let mut config = TemporalConfig::default();
        config.tick_interval_ms = 500; // Too small
        assert!(config.validate().is_err());
    }

    // ─────────────────────────────────────────────────────────────
    // Additional TemporalConfig Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_default_config_values() {
        let config = TemporalConfig::default();
        assert_eq!(config.name, "default");
        assert!(config.enabled);
        assert_eq!(config.tick_interval_ms, 60000);
        assert_eq!(config.max_tick_duration_ms, 5000);
        assert!(config.routines_enabled);
        assert!(config.anticipation_enabled);
        assert!(config.alignment_enabled);
        assert_eq!(config.prediction_confidence_threshold, 0.5);
        assert_eq!(config.max_predictions_per_tick, 20);
        assert!(config.persist_state);
    }

    #[test]
    fn test_minimal_config_values() {
        let config = TemporalConfig::minimal();
        assert_eq!(config.name, "minimal");
        assert_eq!(config.tick_interval_ms, 1000);
        assert!(!config.routines_enabled);
        assert!(!config.anticipation_enabled);
        assert!(!config.alignment_enabled);
        assert!(!config.persist_state);
    }

    #[test]
    fn test_high_performance_config() {
        let config = TemporalConfig::high_performance();
        assert_eq!(config.name, "high_performance");
        assert_eq!(config.tick_interval_ms, 30000);
        assert_eq!(config.max_tick_duration_ms, 10000);
        assert!(config.routines_enabled);
        assert_eq!(config.max_predictions_per_tick, 50);
        assert!(config.state_file_path.is_some());
        assert!(config.validate().is_ok());
    }

    #[test]
    fn test_development_config() {
        let config = TemporalConfig::development();
        assert_eq!(config.name, "development");
        assert_eq!(config.tick_interval_ms, 5000);
        assert_eq!(config.prediction_confidence_threshold, 0.3);
        assert!(!config.persist_state);
        assert!(config.validate().is_ok());
    }

    #[test]
    fn test_validate_tick_duration_too_high() {
        let mut config = TemporalConfig::default();
        config.max_tick_duration_ms = 70000; // >= tick_interval_ms
        assert!(config.validate().is_err());
    }

    #[test]
    fn test_validate_confidence_threshold_negative() {
        let mut config = TemporalConfig::default();
        config.prediction_confidence_threshold = -0.1;
        assert!(config.validate().is_err());
    }

    #[test]
    fn test_validate_confidence_threshold_over_one() {
        let mut config = TemporalConfig::default();
        config.prediction_confidence_threshold = 1.5;
        assert!(config.validate().is_err());
    }

    #[test]
    fn test_validate_alignment_threshold_negative() {
        let mut config = TemporalConfig::default();
        config.alignment_warning_threshold = -0.5;
        assert!(config.validate().is_err());
    }

    #[test]
    fn test_validate_alignment_threshold_over_one() {
        let mut config = TemporalConfig::default();
        config.alignment_warning_threshold = 2.0;
        assert!(config.validate().is_err());
    }

    #[test]
    fn test_config_clone() {
        let config = TemporalConfig::default();
        let cloned = config.clone();
        assert_eq!(cloned.name, config.name);
        assert_eq!(cloned.tick_interval_ms, config.tick_interval_ms);
    }

    #[test]
    fn test_config_debug() {
        let config = TemporalConfig::default();
        let debug_str = format!("{:?}", config);
        assert!(debug_str.contains("TemporalConfig"));
    }

    #[test]
    fn test_config_serialization() {
        let config = TemporalConfig::default();
        let json = serde_json::to_string(&config).expect("TemporalConfig should serialize");
        let restored: TemporalConfig =
            serde_json::from_str(&json).expect("TemporalConfig should deserialize");
        assert_eq!(restored.name, config.name);
        assert_eq!(restored.tick_interval_ms, config.tick_interval_ms);
    }

    // ─────────────────────────────────────────────────────────────
    // Builder Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_builder_all_options() {
        let config = TemporalConfig::builder()
            .name("custom")
            .tick_interval(120000)
            .max_tick_duration(10000)
            .routines_enabled(true)
            .anticipation_enabled(true)
            .alignment_enabled(false)
            .persist_state(true, Some("custom_state.json".to_string()))
            .build()
            .expect("TemporalConfig builder should build config with all options");

        assert_eq!(config.name, "custom");
        assert_eq!(config.tick_interval_ms, 120000);
        assert!(config.routines_enabled);
        assert!(config.anticipation_enabled);
        assert!(!config.alignment_enabled);
        assert!(config.persist_state);
        assert_eq!(
            config.state_file_path,
            Some("custom_state.json".to_string())
        );
    }

    #[test]
    fn test_builder_invalid_tick_interval() {
        let result = TemporalConfig::builder()
            .tick_interval(500) // Too small
            .build();

        assert!(result.is_err());
    }

    #[test]
    fn test_builder_memory_config() {
        let mem_config = TemporalMemoryConfig {
            max_traces: 5000,
            decay_rate: 0.01,
            consolidation_threshold: 0.9,
            min_significance: 0.1,
        };

        let config = TemporalConfig::builder()
            .memory_config(mem_config)
            .build()
            .expect("TemporalConfig builder should build config with memory_config");

        assert_eq!(config.memory_config.max_traces, 5000);
    }

    #[test]
    fn test_builder_planner_config() {
        let planner_config = PlannerConfig {
            max_tasks: 1000,
            auto_prioritize: true,
            respect_energy_levels: false,
            default_task_duration_ms: 900000,
        };

        let config = TemporalConfig::builder()
            .planner_config(planner_config)
            .build()
            .expect("TemporalConfig builder should build config with planner_config");

        assert_eq!(config.planner_config.max_tasks, 1000);
        assert!(config.planner_config.auto_prioritize);
    }

    // ─────────────────────────────────────────────────────────────
    // ConfigError Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_config_error_display_invalid_value() {
        let error = ConfigError::InvalidValue("test error".to_string());
        let display = format!("{}", error);
        assert!(display.contains("Invalid config value"));
        assert!(display.contains("test error"));
    }

    #[test]
    fn test_config_error_display_io() {
        let error = ConfigError::IoError("file not found".to_string());
        let display = format!("{}", error);
        assert!(display.contains("IO error"));
    }

    #[test]
    fn test_config_error_display_parse() {
        let error = ConfigError::ParseError("invalid json".to_string());
        let display = format!("{}", error);
        assert!(display.contains("Parse error"));
    }

    #[test]
    fn test_config_error_debug() {
        let error = ConfigError::InvalidValue("test".to_string());
        let debug_str = format!("{:?}", error);
        assert!(debug_str.contains("InvalidValue"));
    }

    #[test]
    fn test_config_error_clone() {
        let error = ConfigError::IoError("error".to_string());
        let cloned = error.clone();
        assert!(format!("{}", cloned).contains("IO error"));
    }

    #[test]
    fn test_load_from_nonexistent_file() {
        let result = TemporalConfig::load_from_file("/nonexistent/path/config.json");
        assert!(result.is_err());
    }
}
