use crate::plugin_system::{CoreContext, CoreError, CoreHealth, CoreRegistry, CoreResult, EventBus, CoreEvent};
use std::collections::HashMap;
use std::sync::Arc;

/// Orchestrateur pour gérer le lifecycle de tous les cores
pub struct CoreOrchestrator {
    registry: Arc<CoreRegistry>,
    event_bus: Arc<EventBus>,
    app_handle: tauri::AppHandle,
}

impl CoreOrchestrator {
    pub fn new(
        registry: Arc<CoreRegistry>,
        event_bus: Arc<EventBus>,
        app_handle: tauri::AppHandle,
    ) -> Self {
        Self {
            registry,
            event_bus,
            app_handle,
        }
    }

    /// Initialise tous les cores dans l'ordre des dépendances
    pub async fn initialize_all(&self) -> CoreResult<InitializationReport> {
        let order = self.registry.get_initialization_order().await?;
        let mut report = InitializationReport::new();

        for core_name in &order {
            match self.initialize_core(core_name).await {
                Ok(_) => {
                    report.succeeded.push(core_name.clone());
                    log::info!("✅ Core '{}' initialized", core_name);
                }
                Err(e) => {
                    report.failed.push((core_name.clone(), e.to_string()));
                    log::error!("❌ Core '{}' failed to initialize: {}", core_name, e);
                }
            }
        }

        Ok(report)
    }

    /// Initialise un core spécifique
    async fn initialize_core(&self, core_name: &str) -> CoreResult<()> {
        if let Some(core_ref) = self.registry.get_core(core_name).await {
            let config = self.load_core_config(core_name).await?;

            let context = CoreContext::new(self.app_handle.clone(), config);

            let mut core = core_ref.write().await;
            core.initialize(&context).await?;

            self.event_bus
                .emit(CoreEvent::Initialized {
                    name: core_name.to_string(),
                })
                .await;

            Ok(())
        } else {
            Err(CoreError::RuntimeError(format!(
                "Core '{}' not found in registry",
                core_name
            )))
        }
    }

    /// Charge configuration d'un core depuis fichier/profil
    async fn load_core_config(&self, core_name: &str) -> CoreResult<serde_json::Value> {
        // TODO: Charger depuis config file ou profil actif
        // Pour l'instant, retourner config vide
        Ok(serde_json::json!({
            "core_name": core_name,
        }))
    }

    /// Shutdown tous les cores (ordre inverse)
    pub async fn shutdown_all(&self) -> CoreResult<ShutdownReport> {
        let mut order = self.registry.get_initialization_order().await?;
        order.reverse(); // Shutdown dans l'ordre inverse

        let mut report = ShutdownReport::new();

        for core_name in &order {
            match self.shutdown_core(core_name).await {
                Ok(_) => {
                    report.succeeded.push(core_name.clone());
                    log::info!("✅ Core '{}' shutdown", core_name);
                }
                Err(e) => {
                    report.failed.push((core_name.clone(), e.to_string()));
                    log::error!("❌ Core '{}' failed to shutdown: {}", core_name, e);
                }
            }
        }

        Ok(report)
    }

    /// Shutdown un core spécifique
    async fn shutdown_core(&self, core_name: &str) -> CoreResult<()> {
        if let Some(core_ref) = self.registry.get_core(core_name).await {
            let mut core = core_ref.write().await;
            core.shutdown().await?;

            self.event_bus
                .emit(CoreEvent::Shutdown {
                    name: core_name.to_string(),
                })
                .await;

            Ok(())
        } else {
            Err(CoreError::RuntimeError(format!(
                "Core '{}' not found",
                core_name
            )))
        }
    }

    /// Health check de tous les cores
    pub async fn health_check_all(&self) -> HashMap<String, CoreHealth> {
        let cores_info = self.registry.list_cores().await;
        let mut results = HashMap::new();

        for core_info in cores_info {
            if let Some(core_ref) = self.registry.get_core(&core_info.name).await {
                let core = core_ref.read().await;
                let health = core.health_check().await;
                results.insert(core_info.name, health);
            }
        }

        results
    }

    /// Hot-reload configuration d'un core
    pub async fn reload_core_config(&self, core_name: &str) -> CoreResult<()> {
        let config = self.load_core_config(core_name).await?;

        if let Some(core_ref) = self.registry.get_core(core_name).await {
            let mut core = core_ref.write().await;
            core.reconfigure(config).await?;

            self.event_bus
                .emit(CoreEvent::Reconfigured {
                    name: core_name.to_string(),
                })
                .await;

            log::info!("🔄 Core '{}' reconfigured", core_name);

            Ok(())
        } else {
            Err(CoreError::RuntimeError(format!(
                "Core '{}' not found",
                core_name
            )))
        }
    }

    /// Health check périodique (à lancer dans un task)
    pub async fn start_health_monitor(&self, interval_secs: u64) {
        let registry = self.registry.clone();
        let event_bus = self.event_bus.clone();

        tokio::spawn(async move {
            let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(interval_secs));

            loop {
                interval.tick().await;

                let cores = registry.list_cores().await;

                for core_info in cores {
                    if let Some(core_ref) = registry.get_core(&core_info.name).await {
                        let core = core_ref.read().await;
                        let health = core.health_check().await;

                        // Émettre événement si changement de status
                        if health.status != core_info.status {
                            event_bus
                                .emit(CoreEvent::HealthChanged {
                                    name: core_info.name.clone(),
                                    status: health.status.clone(),
                                })
                                .await;

                            log::warn!(
                                "⚠️  Core '{}' health changed: {:?} -> {:?}",
                                core_info.name,
                                core_info.status,
                                health.status
                            );
                        }
                    }
                }
            }
        });
    }
}

/// Rapport d'initialisation
#[derive(Debug, Clone)]
pub struct InitializationReport {
    pub succeeded: Vec<String>,
    pub failed: Vec<(String, String)>,
}

impl InitializationReport {
    fn new() -> Self {
        Self {
            succeeded: Vec::new(),
            failed: Vec::new(),
        }
    }

    pub fn success_rate(&self) -> f32 {
        let total = (self.succeeded.len() + self.failed.len()) as f32;
        if total == 0.0 {
            return 1.0;
        }
        self.succeeded.len() as f32 / total
    }

    pub fn is_complete_success(&self) -> bool {
        self.failed.is_empty()
    }
}

/// Rapport de shutdown
#[derive(Debug, Clone)]
pub struct ShutdownReport {
    pub succeeded: Vec<String>,
    pub failed: Vec<(String, String)>,
}

impl ShutdownReport {
    fn new() -> Self {
        Self {
            succeeded: Vec::new(),
            failed: Vec::new(),
        }
    }

    pub fn is_complete_success(&self) -> bool {
        self.failed.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_initialization_report() {
        let mut report = InitializationReport::new();

        report.succeeded.push("core1".into());
        report.succeeded.push("core2".into());
        report.failed.push(("core3".into(), "error".into()));

        assert_eq!(report.success_rate(), 2.0 / 3.0);
        assert!(!report.is_complete_success());
    }

    #[test]
    fn test_shutdown_report() {
        let mut report = ShutdownReport::new();

        report.succeeded.push("core1".into());
        report.succeeded.push("core2".into());

        assert!(report.is_complete_success());
    }
}
