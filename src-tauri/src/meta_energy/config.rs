//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — META-ENERGY CONFIG
//! Super Prompt #20 — Configuration du système énergétique
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use super::energy_model::EnergyDimension;
use super::regulator::RegulationThresholds;

/// Configuration du Meta-Energy Engine
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MetaEnergyConfig {
    pub name: String,
    pub enabled: bool,

    // Tick configuration
    pub tick_interval_ms: u64,
    pub max_tick_duration_ms: u64,

    // Energy settings
    pub initial_energy: f32,
    pub baseline_energy: f32,
    pub energy_decay_rate: f32,

    // Dimension weights
    pub dimension_weights: HashMap<EnergyDimension, f32>,

    // Thresholds
    pub regulation_thresholds: RegulationThresholds,
    pub fatigue_warning_threshold: f32,
    pub recovery_trigger_threshold: f32,

    // Features
    pub auto_regulation: bool,
    pub predictive_enabled: bool,
    pub load_balancing_enabled: bool,

    // Recovery settings
    pub auto_recovery: bool,
    pub min_recovery_duration_ms: u64,
    pub max_recovery_duration_ms: u64,

    // Persistence
    pub persist_state: bool,
    pub state_file_path: Option<String>,
}

impl Default for MetaEnergyConfig {
    fn default() -> Self {
        let mut weights = HashMap::new();
        weights.insert(EnergyDimension::Cognitive, 1.2);
        weights.insert(EnergyDimension::Creative, 1.1);
        weights.insert(EnergyDimension::Social, 0.9);
        weights.insert(EnergyDimension::Executive, 1.0);
        weights.insert(EnergyDimension::Memory, 1.0);
        weights.insert(EnergyDimension::Sensory, 0.8);
        weights.insert(EnergyDimension::Physical, 0.9);

        Self {
            name: "default".to_string(),
            enabled: true,
            tick_interval_ms: 30000, // 30 seconds
            max_tick_duration_ms: 5000,
            initial_energy: 0.8,
            baseline_energy: 0.7,
            energy_decay_rate: 0.001,
            dimension_weights: weights,
            regulation_thresholds: RegulationThresholds::default(),
            fatigue_warning_threshold: 0.6,
            recovery_trigger_threshold: 0.3,
            auto_regulation: true,
            predictive_enabled: true,
            load_balancing_enabled: true,
            auto_recovery: false,
            min_recovery_duration_ms: 300000, // 5 minutes
            max_recovery_duration_ms: 3600000, // 1 hour
            persist_state: true,
            state_file_path: None,
        }
    }
}

impl MetaEnergyConfig {
    /// Configuration minimale pour les tests
    pub fn minimal() -> Self {
        Self {
            name: "minimal".to_string(),
            enabled: true,
            tick_interval_ms: 5000,
            max_tick_duration_ms: 1000,
            initial_energy: 0.8,
            baseline_energy: 0.7,
            energy_decay_rate: 0.0,
            dimension_weights: HashMap::new(),
            regulation_thresholds: RegulationThresholds::default(),
            fatigue_warning_threshold: 0.7,
            recovery_trigger_threshold: 0.2,
            auto_regulation: false,
            predictive_enabled: false,
            load_balancing_enabled: false,
            auto_recovery: false,
            min_recovery_duration_ms: 60000,
            max_recovery_duration_ms: 600000,
            persist_state: false,
            state_file_path: None,
        }
    }

    /// Configuration haute performance
    pub fn high_performance() -> Self {
        let mut weights = HashMap::new();
        weights.insert(EnergyDimension::Cognitive, 1.5);
        weights.insert(EnergyDimension::Creative, 1.3);
        weights.insert(EnergyDimension::Social, 0.8);
        weights.insert(EnergyDimension::Executive, 1.2);
        weights.insert(EnergyDimension::Memory, 1.1);
        weights.insert(EnergyDimension::Sensory, 0.7);
        weights.insert(EnergyDimension::Physical, 0.8);

        Self {
            name: "high_performance".to_string(),
            enabled: true,
            tick_interval_ms: 15000, // 15 seconds
            max_tick_duration_ms: 3000,
            initial_energy: 1.0,
            baseline_energy: 0.85,
            energy_decay_rate: 0.002,
            dimension_weights: weights,
            regulation_thresholds: RegulationThresholds {
                critical_low: 0.05,
                low: 0.15,
                optimal_min: 0.3,
                optimal_max: 0.9,
                high: 0.95,
                critical_high: 0.99,
            },
            fatigue_warning_threshold: 0.7,
            recovery_trigger_threshold: 0.2,
            auto_regulation: true,
            predictive_enabled: true,
            load_balancing_enabled: true,
            auto_recovery: true,
            min_recovery_duration_ms: 180000,
            max_recovery_duration_ms: 1800000,
            persist_state: true,
            state_file_path: Some("meta_energy_hp.json".to_string()),
        }
    }

    /// Configuration économie d'énergie
    pub fn power_saving() -> Self {
        let mut weights = HashMap::new();
        weights.insert(EnergyDimension::Cognitive, 1.0);
        weights.insert(EnergyDimension::Creative, 0.8);
        weights.insert(EnergyDimension::Social, 0.7);
        weights.insert(EnergyDimension::Executive, 0.9);
        weights.insert(EnergyDimension::Memory, 0.9);
        weights.insert(EnergyDimension::Sensory, 0.6);
        weights.insert(EnergyDimension::Physical, 0.7);

        Self {
            name: "power_saving".to_string(),
            enabled: true,
            tick_interval_ms: 60000, // 1 minute
            max_tick_duration_ms: 2000,
            initial_energy: 0.6,
            baseline_energy: 0.5,
            energy_decay_rate: 0.0005,
            dimension_weights: weights,
            regulation_thresholds: RegulationThresholds {
                critical_low: 0.15,
                low: 0.3,
                optimal_min: 0.4,
                optimal_max: 0.7,
                high: 0.8,
                critical_high: 0.9,
            },
            fatigue_warning_threshold: 0.5,
            recovery_trigger_threshold: 0.4,
            auto_regulation: true,
            predictive_enabled: false,
            load_balancing_enabled: true,
            auto_recovery: true,
            min_recovery_duration_ms: 600000,
            max_recovery_duration_ms: 7200000,
            persist_state: true,
            state_file_path: Some("meta_energy_ps.json".to_string()),
        }
    }

    /// Configuration pour le développement
    pub fn development() -> Self {
        Self {
            name: "development".to_string(),
            enabled: true,
            tick_interval_ms: 10000,
            max_tick_duration_ms: 2000,
            initial_energy: 0.9,
            baseline_energy: 0.8,
            energy_decay_rate: 0.002,
            dimension_weights: HashMap::new(),
            regulation_thresholds: RegulationThresholds::default(),
            fatigue_warning_threshold: 0.5,
            recovery_trigger_threshold: 0.3,
            auto_regulation: true,
            predictive_enabled: true,
            load_balancing_enabled: true,
            auto_recovery: false,
            min_recovery_duration_ms: 60000,
            max_recovery_duration_ms: 300000,
            persist_state: false,
            state_file_path: None,
        }
    }

    /// Valide la configuration
    pub fn validate(&self) -> Result<(), ConfigError> {
        if self.tick_interval_ms < 1000 {
            return Err(ConfigError::InvalidValue(
                "tick_interval_ms must be >= 1000".to_string()
            ));
        }

        if self.max_tick_duration_ms >= self.tick_interval_ms {
            return Err(ConfigError::InvalidValue(
                "max_tick_duration_ms must be < tick_interval_ms".to_string()
            ));
        }

        if self.initial_energy < 0.0 || self.initial_energy > 1.0 {
            return Err(ConfigError::InvalidValue(
                "initial_energy must be between 0 and 1".to_string()
            ));
        }

        if self.baseline_energy < 0.0 || self.baseline_energy > 1.0 {
            return Err(ConfigError::InvalidValue(
                "baseline_energy must be between 0 and 1".to_string()
            ));
        }

        if self.fatigue_warning_threshold < 0.0 || self.fatigue_warning_threshold > 1.0 {
            return Err(ConfigError::InvalidValue(
                "fatigue_warning_threshold must be between 0 and 1".to_string()
            ));
        }

        if self.recovery_trigger_threshold < 0.0 || self.recovery_trigger_threshold > 1.0 {
            return Err(ConfigError::InvalidValue(
                "recovery_trigger_threshold must be between 0 and 1".to_string()
            ));
        }

        Ok(())
    }

    /// Charge depuis un fichier JSON
    pub fn load_from_file(path: &str) -> Result<Self, ConfigError> {
        let content = std::fs::read_to_string(path)
            .map_err(|e| ConfigError::IoError(e.to_string()))?;

        let config: Self = serde_json::from_str(&content)
            .map_err(|e| ConfigError::ParseError(e.to_string()))?;

        config.validate()?;
        Ok(config)
    }

    /// Sauvegarde dans un fichier JSON
    pub fn save_to_file(&self, path: &str) -> Result<(), ConfigError> {
        let content = serde_json::to_string_pretty(self)
            .map_err(|e| ConfigError::ParseError(e.to_string()))?;

        std::fs::write(path, content)
            .map_err(|e| ConfigError::IoError(e.to_string()))?;

        Ok(())
    }

    /// Builder pattern
    pub fn builder() -> MetaEnergyConfigBuilder {
        MetaEnergyConfigBuilder::default()
    }
}

/// Builder pour MetaEnergyConfig
#[derive(Default)]
pub struct MetaEnergyConfigBuilder {
    config: MetaEnergyConfig,
}

impl MetaEnergyConfigBuilder {
    pub fn name(mut self, name: &str) -> Self {
        self.config.name = name.to_string();
        self
    }

    pub fn tick_interval(mut self, ms: u64) -> Self {
        self.config.tick_interval_ms = ms;
        self
    }

    pub fn initial_energy(mut self, energy: f32) -> Self {
        self.config.initial_energy = energy;
        self
    }

    pub fn baseline_energy(mut self, energy: f32) -> Self {
        self.config.baseline_energy = energy;
        self
    }

    pub fn auto_regulation(mut self, enabled: bool) -> Self {
        self.config.auto_regulation = enabled;
        self
    }

    pub fn predictive_enabled(mut self, enabled: bool) -> Self {
        self.config.predictive_enabled = enabled;
        self
    }

    pub fn load_balancing_enabled(mut self, enabled: bool) -> Self {
        self.config.load_balancing_enabled = enabled;
        self
    }

    pub fn auto_recovery(mut self, enabled: bool) -> Self {
        self.config.auto_recovery = enabled;
        self
    }

    pub fn persist_state(mut self, persist: bool, path: Option<String>) -> Self {
        self.config.persist_state = persist;
        self.config.state_file_path = path;
        self
    }

    pub fn dimension_weight(mut self, dimension: EnergyDimension, weight: f32) -> Self {
        self.config.dimension_weights.insert(dimension, weight);
        self
    }

    pub fn build(self) -> Result<MetaEnergyConfig, ConfigError> {
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
        let config = MetaEnergyConfig::default();
        assert!(config.validate().is_ok());
    }

    #[test]
    fn test_minimal_config() {
        let config = MetaEnergyConfig::minimal();
        assert!(config.validate().is_ok());
    }

    #[test]
    fn test_builder() {
        let config = MetaEnergyConfig::builder()
            .name("test")
            .initial_energy(0.9)
            .auto_regulation(false)
            .build()
            .expect("meta energy builder should create valid config");

        assert_eq!(config.name, "test");
        assert!(!config.auto_regulation);
    }

    #[test]
    fn test_invalid_config() {
        let mut config = MetaEnergyConfig::default();
        config.tick_interval_ms = 500; // Too small
        assert!(config.validate().is_err());
    }
}
