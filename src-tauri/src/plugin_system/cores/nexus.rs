// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — NEXUS CORE MODULE
//   Internal Coherence & Module Status Management
//   Migration: v17.2.0 Phase 2 - CoreModule trait implementation
// ═══════════════════════════════════════════════════════════════

use async_trait::async_trait;
use chrono::Utc;
use std::collections::HashMap;
use std::sync::{Arc, RwLock};

use crate::plugin_system::{CoreModule, CoreResult, CoreError, CoreStatus, HealthStatus, CoreDependency};
use crate::types::{NexusState, ModuleStatus, ModuleHealth};

/// Nexus Core Module - Gère la cohérence interne et le statut des modules
pub struct NexusModule {
    name: String,
    version: String,
    status: Arc<RwLock<CoreStatus>>,
    modules: Arc<RwLock<HashMap<String, ModuleStatus>>>,
}

impl NexusModule {
    /// Créer une nouvelle instance de Nexus
    pub fn new() -> Self {
        Self {
            name: "nexus".to_string(),
            version: "1.0.0".to_string(),
            status: Arc::new(RwLock::new(CoreStatus::Uninitialized)),
            modules: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Enregistrer un module dans Nexus
    pub fn register_module(&self, name: String) -> CoreResult<()> {
        let mut modules = self.modules.write()
            .map_err(|_| CoreError::RuntimeError("Lock poisoned".to_string()))?;

        modules.insert(name.clone(), ModuleStatus {
            name,
            health: ModuleHealth::Healthy,
            uptime: 0,
            last_tick: Utc::now().timestamp(),
            message: "Initialized".to_string(),
        });

        Ok(())
    }

    /// Mettre à jour le statut d'un module
    pub fn update_module(&self, name: &str, health: ModuleHealth, message: String) -> CoreResult<()> {
        let mut modules = self.modules.write()
            .map_err(|_| CoreError::RuntimeError("Lock poisoned".to_string()))?;

        if let Some(module) = modules.get_mut(name) {
            module.health = health;
            module.message = message;
            module.last_tick = Utc::now().timestamp();
        }

        Ok(())
    }

    /// Valider la cohérence du système
    pub async fn validate(&self) -> CoreResult<NexusState> {
        let modules = self.modules.read()
            .map_err(|_| CoreError::RuntimeError("Lock poisoned".to_string()))?;

        let mut state = NexusState {
            modules: modules.clone(),
            coherence_score: 100.0,
            active_connections: modules.len(),
            health: ModuleHealth::Healthy,
            timestamp: Utc::now().timestamp(),
        };

        // Calculer le score de cohérence
        let failing_count = modules.values()
            .filter(|m| matches!(m.health, ModuleHealth::Failing | ModuleHealth::Offline))
            .count();

        let degraded_count = modules.values()
            .filter(|m| matches!(m.health, ModuleHealth::Degraded))
            .count();

        state.coherence_score = 100.0 - (failing_count as f64 * 30.0) - (degraded_count as f64 * 10.0);
        state.coherence_score = state.coherence_score.max(0.0);

        state.calculate_health();

        Ok(state)
    }

    /// Obtenir le nombre de modules enregistrés
    pub fn module_count(&self) -> usize {
        self.modules.read().map(|m| m.len()).unwrap_or(0)
    }
}

impl Default for NexusModule {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl CoreModule for NexusModule {
    fn name(&self) -> &str {
        &self.name
    }

    fn version(&self) -> &str {
        &self.version
    }

    fn description(&self) -> &str {
        "Internal Coherence & Module Status Management"
    }

    fn dependencies(&self) -> Vec<CoreDependency> {
        vec![] // Nexus n'a pas de dépendances
    }

    fn capabilities(&self) -> Vec<String> {
        vec![
            "modules.register".to_string(),
            "modules.status".to_string(),
            "modules.update".to_string(),
            "coherence.validate".to_string(),
            "coherence.score".to_string(),
        ]
    }

    async fn initialize(&mut self, _config: HashMap<String, String>) -> CoreResult<()> {
        let mut status = self.status.write()
            .map_err(|_| CoreError::InitializationFailed("Lock poisoned".to_string()))?;

        *status = CoreStatus::Ready;

        Ok(())
    }

    async fn start(&mut self) -> CoreResult<()> {
        let mut status = self.status.write()
            .map_err(|_| CoreError::RuntimeError("Failed to acquire status lock".to_string()))?;

        *status = CoreStatus::Running;

        Ok(())
    }

    async fn stop(&mut self) -> CoreResult<()> {
        let mut status = self.status.write()
            .map_err(|_| CoreError::ShutdownError("Failed to acquire status lock".to_string()))?;

        *status = CoreStatus::Stopping;

        Ok(())
    }

    async fn shutdown(&mut self) -> CoreResult<()> {
        // Nettoyer les modules enregistrés
        {
            let mut modules = self.modules.write()
                .map_err(|_| CoreError::ShutdownError("Failed to acquire modules lock".to_string()))?;
            modules.clear();
        }

        let mut status = self.status.write()
            .map_err(|_| CoreError::ShutdownError("Failed to acquire status lock".to_string()))?;

        *status = CoreStatus::Stopped;

        Ok(())
    }

    fn get_status(&self) -> CoreStatus {
        *self.status.read().unwrap_or_else(|_| panic!("Status lock poisoned"))
    }

    async fn health_check(&self) -> HealthStatus {
        let is_running = matches!(self.get_status(), CoreStatus::Running);
        let module_count = self.module_count();

        let message = if is_running {
            format!("Nexus operational - {} modules tracked", module_count)
        } else {
            "Nexus not running".to_string()
        };

        HealthStatus {
            is_healthy: is_running,
            last_check: std::time::SystemTime::now(),
            message,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_nexus_lifecycle() {
        let mut nexus = NexusModule::new();

        // Test initialization
        assert_eq!(nexus.get_status(), CoreStatus::Uninitialized);
        nexus.initialize().await.unwrap();
        assert_eq!(nexus.get_status(), CoreStatus::Ready);

        // Test start
        nexus.start().await.unwrap();
        assert_eq!(nexus.get_status(), CoreStatus::Running);

        // Test health check
        let health = nexus.health_check().await;
        assert!(health.is_healthy);

        // Test stop
        nexus.stop().await.unwrap();
        assert_eq!(nexus.get_status(), CoreStatus::Stopping);

        // Test shutdown
        nexus.shutdown().await.unwrap();
        assert_eq!(nexus.get_status(), CoreStatus::Stopped);
    }

    #[tokio::test]
    async fn test_register_module() {
        let mut nexus = NexusModule::new();
        nexus.initialize().await.unwrap();
        nexus.start().await.unwrap();

        // Register a module
        nexus.register_module("test_module".to_string()).unwrap();
        assert_eq!(nexus.module_count(), 1);

        // Validate should work
        let state = nexus.validate().await.unwrap();
        assert_eq!(state.active_connections, 1);
        assert_eq!(state.coherence_score, 100.0);
    }

    #[tokio::test]
    async fn test_update_module() {
        let mut nexus = NexusModule::new();
        nexus.initialize().await.unwrap();
        nexus.start().await.unwrap();

        // Register and update a module
        nexus.register_module("test_module".to_string()).unwrap();
        nexus.update_module("test_module", ModuleHealth::Degraded, "Test degradation".to_string()).unwrap();

        let state = nexus.validate().await.unwrap();
        assert_eq!(state.coherence_score, 90.0); // 100.0 - 10.0 for degraded
    }

    #[tokio::test]
    async fn test_coherence_check() {
        let mut nexus = NexusModule::new();
        nexus.initialize().await.unwrap();
        nexus.start().await.unwrap();

        // Register multiple modules with different health
        nexus.register_module("module1".to_string()).unwrap(); // Healthy
        nexus.register_module("module2".to_string()).unwrap(); // Healthy
        nexus.update_module("module2", ModuleHealth::Degraded, "Degraded".to_string()).unwrap();
        nexus.register_module("module3".to_string()).unwrap(); // Healthy
        nexus.update_module("module3", ModuleHealth::Failing, "Failing".to_string()).unwrap();

        let state = nexus.validate().await.unwrap();
        // 100.0 - (1 failing * 30.0) - (1 degraded * 10.0) = 60.0
        assert_eq!(state.coherence_score, 60.0);
    }

    #[tokio::test]
    async fn test_capabilities() {
        let nexus = NexusModule::new();
        let capabilities = nexus.capabilities();

        assert!(capabilities.contains(&"modules.register".to_string()));
        assert!(capabilities.contains(&"coherence.validate".to_string()));
        assert_eq!(capabilities.len(), 5);
    }

    #[test]
    fn test_dependencies() {
        let nexus = NexusModule::new();
        let dependencies = nexus.dependencies();

        assert!(dependencies.is_empty()); // Nexus has no dependencies
    }

    #[tokio::test]
    async fn test_shutdown_clears_modules() {
        let mut nexus = NexusModule::new();
        nexus.initialize().await.unwrap();
        nexus.start().await.unwrap();

        // Register modules
        nexus.register_module("module1".to_string()).unwrap();
        nexus.register_module("module2".to_string()).unwrap();
        assert_eq!(nexus.module_count(), 2);

        // Shutdown should clear modules
        nexus.shutdown().await.unwrap();
        assert_eq!(nexus.module_count(), 0);
    }
}
