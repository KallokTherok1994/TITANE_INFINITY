use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::SystemTime;

/// Résultat standard pour opérations Core
pub type CoreResult<T> = Result<T, CoreError>;

/// Erreurs des cores
#[derive(Debug, thiserror::Error)]
pub enum CoreError {
    #[error("Initialization failed: {0}")]
    InitializationFailed(String),

    #[error("Dependency not found: {0}")]
    DependencyNotFound(String),

    #[error("Configuration error: {0}")]
    ConfigError(String),

    #[error("Runtime error: {0}")]
    RuntimeError(String),

    #[error("Shutdown error: {0}")]
    ShutdownError(String),
}

/// Trait principal pour tous les cores modulaires
#[async_trait]
pub trait CoreModule: Send + Sync {
    /// Nom unique du core (ex: "helios", "nexus")
    fn name(&self) -> &str;

    /// Version semver (ex: "1.0.0")
    fn version(&self) -> &str;

    /// Description courte
    fn description(&self) -> &str;

    /// Dépendances vers autres cores
    fn dependencies(&self) -> Vec<CoreDependency> {
        vec![]
    }

    /// Capabilities exposées (ex: "system.monitoring", "metrics.cpu")
    fn capabilities(&self) -> Vec<String> {
        vec![]
    }

    /// Initialisation async avec contexte
    async fn initialize(&mut self, context: &CoreContext) -> CoreResult<()>;

    /// Arrêt propre du core
    async fn shutdown(&mut self) -> CoreResult<()>;

    /// Health check pour monitoring
    async fn health_check(&self) -> CoreHealth;

    /// Reconfiguration à chaud (optionnel)
    async fn reconfigure(&mut self, config: serde_json::Value) -> CoreResult<()> {
        Err(CoreError::RuntimeError(
            "Reconfiguration not supported".into(),
        ))
    }

    /// Métriques exposées
    fn metrics(&self) -> Vec<CoreMetric> {
        vec![]
    }

    /// Commandes Tauri exposées (optionnel)
    fn tauri_commands(&self) -> Vec<String> {
        vec![]
    }
}

/// Dépendance vers un autre core
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoreDependency {
    pub name: String,
    pub version_req: String, // semver: "^1.0.0", ">=2.0.0"
    pub optional: bool,
}

/// Contexte passé lors de l'initialisation
#[derive(Clone)]
pub struct CoreContext {
    pub app_handle: tauri::AppHandle,
    pub config: serde_json::Value,
    // Ajoutés dynamiquement selon besoins
    pub extras: HashMap<String, serde_json::Value>,
}

impl CoreContext {
    pub fn new(app_handle: tauri::AppHandle, config: serde_json::Value) -> Self {
        Self {
            app_handle,
            config,
            extras: HashMap::new(),
        }
    }

    pub fn with_extra(mut self, key: String, value: serde_json::Value) -> Self {
        self.extras.insert(key, value);
        self
    }
}

/// État de santé d'un core
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoreHealth {
    pub status: HealthStatus,
    pub message: Option<String>,
    pub details: serde_json::Value,
    pub timestamp: SystemTime,
}

impl CoreHealth {
    pub fn healthy() -> Self {
        Self {
            status: HealthStatus::Healthy,
            message: None,
            details: serde_json::json!({}),
            timestamp: SystemTime::now(),
        }
    }

    pub fn degraded(message: String) -> Self {
        Self {
            status: HealthStatus::Degraded,
            message: Some(message),
            details: serde_json::json!({}),
            timestamp: SystemTime::now(),
        }
    }

    pub fn unhealthy(message: String) -> Self {
        Self {
            status: HealthStatus::Unhealthy,
            message: Some(message),
            details: serde_json::json!({}),
            timestamp: SystemTime::now(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum HealthStatus {
    Healthy,
    Degraded,
    Unhealthy,
}

/// Métrique exposée par un core
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoreMetric {
    pub name: String,
    pub metric_type: MetricType,
    pub description: String,
}

impl CoreMetric {
    pub fn counter(name: &str) -> Self {
        Self {
            name: name.to_string(),
            metric_type: MetricType::Counter,
            description: String::new(),
        }
    }

    pub fn gauge(name: &str) -> Self {
        Self {
            name: name.to_string(),
            metric_type: MetricType::Gauge,
            description: String::new(),
        }
    }

    pub fn histogram(name: &str) -> Self {
        Self {
            name: name.to_string(),
            metric_type: MetricType::Histogram,
            description: String::new(),
        }
    }

    pub fn with_description(mut self, desc: &str) -> Self {
        self.description = desc.to_string();
        self
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MetricType {
    Counter,
    Gauge,
    Histogram,
}

/// Informations sur un core enregistré
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoreInfo {
    pub name: String,
    pub version: String,
    pub description: String,
    pub capabilities: Vec<String>,
    pub dependencies: Vec<CoreDependency>,
    pub status: HealthStatus,
}

#[cfg(test)]
mod tests {
    use super::*;

    struct TestCore {
        name: String,
        initialized: bool,
    }

    #[async_trait]
    impl CoreModule for TestCore {
        fn name(&self) -> &str {
            &self.name
        }

        fn version(&self) -> &str {
            "1.0.0"
        }

        fn description(&self) -> &str {
            "Test core"
        }

        async fn initialize(&mut self, _context: &CoreContext) -> CoreResult<()> {
            self.initialized = true;
            Ok(())
        }

        async fn shutdown(&mut self) -> CoreResult<()> {
            self.initialized = false;
            Ok(())
        }

        async fn health_check(&self) -> CoreHealth {
            if self.initialized {
                CoreHealth::healthy()
            } else {
                CoreHealth::unhealthy("Not initialized".into())
            }
        }
    }

    #[tokio::test]
    async fn test_core_lifecycle() {
        let mut core = TestCore {
            name: "test".to_string(),
            initialized: false,
        };

        assert_eq!(core.name(), "test");
        assert!(!core.initialized);

        // Note: Can't fully test without AppHandle
        // This is a minimal structure test
    }

    #[test]
    fn test_core_health_constructors() {
        let healthy = CoreHealth::healthy();
        assert_eq!(healthy.status, HealthStatus::Healthy);

        let degraded = CoreHealth::degraded("Warning".into());
        assert_eq!(degraded.status, HealthStatus::Degraded);

        let unhealthy = CoreHealth::unhealthy("Error".into());
        assert_eq!(unhealthy.status, HealthStatus::Unhealthy);
    }

    #[test]
    fn test_core_metric_builders() {
        let counter = CoreMetric::counter("test.counter");
        assert!(matches!(counter.metric_type, MetricType::Counter));

        let gauge = CoreMetric::gauge("test.gauge")
            .with_description("Test gauge");
        assert!(matches!(gauge.metric_type, MetricType::Gauge));
        assert_eq!(gauge.description, "Test gauge");
    }
}
