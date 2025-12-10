#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   CYCLE ENGINE CONFIGURATION
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CycleEngineConfig {
    pub enabled: bool,
    pub tick_interval_seconds: u64, // Clock tick frequency
    pub daily_cycle_enabled: bool,
    pub weekly_cycle_enabled: bool,
    pub monthly_cycle_enabled: bool,
    pub seasonal_cycle_enabled: bool,
    pub adaptive_load_enabled: bool,
    pub predictive_enabled: bool,
}

impl Default for CycleEngineConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            tick_interval_seconds: 60, // 1 minute
            daily_cycle_enabled: true,
            weekly_cycle_enabled: true,
            monthly_cycle_enabled: true,
            seasonal_cycle_enabled: true,
            adaptive_load_enabled: true,
            predictive_enabled: true,
        }
    }
}

pub type CycleResult<T> = Result<T, CycleError>;

#[derive(Debug, Clone)]
pub struct CycleError(pub String);

impl std::fmt::Display for CycleError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "CycleError: {}", self.0)
    }
}

impl std::error::Error for CycleError {}

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // CycleEngineConfig Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_cycle_engine_config_default() {
        let config = CycleEngineConfig::default();
        assert!(config.enabled);
        assert_eq!(config.tick_interval_seconds, 60);
        assert!(config.daily_cycle_enabled);
        assert!(config.weekly_cycle_enabled);
        assert!(config.monthly_cycle_enabled);
        assert!(config.seasonal_cycle_enabled);
        assert!(config.adaptive_load_enabled);
        assert!(config.predictive_enabled);
    }

    #[test]
    fn test_cycle_engine_config_clone() {
        let config = CycleEngineConfig::default();
        let cloned = config.clone();
        assert!(cloned.enabled);
        assert_eq!(cloned.tick_interval_seconds, config.tick_interval_seconds);
    }

    #[test]
    fn test_cycle_engine_config_debug() {
        let config = CycleEngineConfig::default();
        let debug_str = format!("{:?}", config);
        assert!(debug_str.contains("CycleEngineConfig"));
    }

    #[test]
    fn test_cycle_engine_config_serialization() {
        let config = CycleEngineConfig::default();
        let json = serde_json::to_string(&config).unwrap();
        let restored: CycleEngineConfig = serde_json::from_str(&json).unwrap();
        assert!(restored.enabled);
        assert_eq!(restored.tick_interval_seconds, 60);
    }

    #[test]
    fn test_cycle_engine_config_custom() {
        let config = CycleEngineConfig {
            enabled: false,
            tick_interval_seconds: 30,
            daily_cycle_enabled: false,
            weekly_cycle_enabled: true,
            monthly_cycle_enabled: false,
            seasonal_cycle_enabled: true,
            adaptive_load_enabled: false,
            predictive_enabled: false,
        };
        assert!(!config.enabled);
        assert_eq!(config.tick_interval_seconds, 30);
        assert!(!config.daily_cycle_enabled);
        assert!(!config.adaptive_load_enabled);
    }

    #[test]
    fn test_cycle_engine_config_deserialize() {
        let json = r#"{"enabled": true, "tick_interval_seconds": 120, "daily_cycle_enabled": false, "weekly_cycle_enabled": true, "monthly_cycle_enabled": true, "seasonal_cycle_enabled": false, "adaptive_load_enabled": true, "predictive_enabled": false}"#;
        let config: CycleEngineConfig = serde_json::from_str(json).unwrap();
        assert!(config.enabled);
        assert_eq!(config.tick_interval_seconds, 120);
        assert!(!config.daily_cycle_enabled);
        assert!(!config.seasonal_cycle_enabled);
    }

    // ─────────────────────────────────────────────────────────────
    // CycleError Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_cycle_error_creation() {
        let error = CycleError("Test error".to_string());
        assert_eq!(error.0, "Test error");
    }

    #[test]
    fn test_cycle_error_display() {
        let error = CycleError("Something went wrong".to_string());
        let display = format!("{}", error);
        assert_eq!(display, "CycleError: Something went wrong");
    }

    #[test]
    fn test_cycle_error_debug() {
        let error = CycleError("Debug test".to_string());
        let debug_str = format!("{:?}", error);
        assert!(debug_str.contains("CycleError"));
        assert!(debug_str.contains("Debug test"));
    }

    #[test]
    fn test_cycle_error_clone() {
        let error = CycleError("Clone test".to_string());
        let cloned = error.clone();
        assert_eq!(cloned.0, "Clone test");
    }

    #[test]
    fn test_cycle_error_is_error() {
        let error = CycleError("Error trait test".to_string());
        let _: &dyn std::error::Error = &error;
    }

    // ─────────────────────────────────────────────────────────────
    // CycleResult Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_cycle_result_ok() {
        let result: CycleResult<i32> = Ok(42);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), 42);
    }

    #[test]
    fn test_cycle_result_err() {
        let result: CycleResult<i32> = Err(CycleError("Test error".to_string()));
        assert!(result.is_err());
    }

    #[test]
    fn test_cycle_result_unwrap_err() {
        let result: CycleResult<i32> = Err(CycleError("Unwrap test".to_string()));
        let error = result.unwrap_err();
        assert_eq!(error.0, "Unwrap test");
    }
}
