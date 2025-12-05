// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — INTEGRATION TEST
//   Test complet du système modulaire avec Helios
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod integration_tests {
    use crate::{
        core::helios_module::HeliosCoreModule,
        plugin_system::{
            registry::CoreRegistry,
            orchestrator::CoreOrchestrator,
            core_module::{CoreConfig, CoreModule},
        },
    };
    use std::sync::Arc;
    use tokio::sync::RwLock;
    use std::collections::HashMap;

    #[tokio::test]
    async fn test_helios_full_lifecycle() {
        // 1. Create registry
        let registry = Arc::new(RwLock::new(CoreRegistry::new()));

        // 2. Create and register Helios module
        let helios = Arc::new(HeliosCoreModule::new());
        {
            let mut reg = registry.write().await;
            reg.register_core(helios.clone()).unwrap();
        }

        // 3. Create orchestrator
        let orchestrator = CoreOrchestrator::new(registry.clone());

        // 4. Initialize all cores
        let init_report = orchestrator.initialize_all().await.unwrap();
        assert_eq!(init_report.successful_modules.len(), 1);
        assert_eq!(init_report.failed_modules.len(), 0);
        assert!(init_report.successful_modules.contains(&"Helios".to_string()));

        // 5. Check health
        let health = helios.health_check().await.unwrap();
        assert!(health.is_healthy || health.message.contains("Warning"));
        assert!(health.uptime_seconds >= 0);

        // 6. Collect metrics
        let state = helios.collect().await.unwrap();
        assert!(state.cpu_usage >= 0.0 && state.cpu_usage <= 100.0);
        assert!(state.ram_usage >= 0.0 && state.ram_usage <= 100.0);

        // 7. Get module metrics
        let metrics = helios.metrics().await.unwrap();
        assert!(metrics.contains_key("cpu_usage"));
        assert!(metrics.contains_key("ram_usage"));
        assert!(metrics.contains_key("collection_count"));

        // 8. Shutdown all cores
        let shutdown_report = orchestrator.shutdown_all().await.unwrap();
        assert_eq!(shutdown_report.successful_shutdowns.len(), 1);
        assert_eq!(shutdown_report.failed_shutdowns.len(), 0);
    }

    #[tokio::test]
    async fn test_helios_registry_operations() {
        let registry = Arc::new(RwLock::new(CoreRegistry::new()));
        let helios = Arc::new(HeliosCoreModule::new());

        // Register
        {
            let mut reg = registry.write().await;
            reg.register_core(helios.clone()).unwrap();
        }

        // List cores
        {
            let reg = registry.read().await;
            let cores = reg.list_cores();
            assert_eq!(cores.len(), 1);
            assert!(cores.contains(&"Helios".to_string()));
        }

        // Get core
        {
            let reg = registry.read().await;
            let core = reg.get_core("Helios");
            assert!(core.is_some());
        }

        // Check dependencies
        {
            let reg = registry.read().await;
            let deps = reg.get_dependencies("Helios");
            assert_eq!(deps.len(), 0);  // Helios has no dependencies
        }
    }

    #[tokio::test]
    async fn test_helios_concurrent_collections() {
        let helios = Arc::new(HeliosCoreModule::new());

        let config = CoreConfig {
            name: "Helios".to_string(),
            enabled: true,
            priority: 255,
            settings: HashMap::new(),
        };

        helios.initialize(&config).await.unwrap();

        // Spawn multiple concurrent collection tasks
        let mut handles = vec![];

        for _ in 0..5 {
            let helios_clone = helios.clone();
            let handle = tokio::spawn(async move {
                helios_clone.collect().await
            });
            handles.push(handle);
        }

        // Wait for all to complete
        let results: Vec<_> = futures::future::join_all(handles).await;

        // All should succeed
        for result in results {
            assert!(result.is_ok());
            let state = result.unwrap();
            assert!(state.is_ok());
        }
    }

    #[tokio::test]
    async fn test_helios_health_status_transitions() {
        let helios = Arc::new(HeliosCoreModule::new());

        let config = CoreConfig {
            name: "Helios".to_string(),
            enabled: true,
            priority: 255,
            settings: HashMap::new(),
        };

        // Before initialization - unhealthy
        let health_before = helios.health_check().await.unwrap();
        assert!(!health_before.is_healthy);
        assert_eq!(health_before.uptime_seconds, 0);

        // After initialization - should be healthy or warning
        helios.initialize(&config).await.unwrap();
        let health_after = helios.health_check().await.unwrap();
        assert!(health_after.uptime_seconds > 0);

        // After shutdown - unhealthy again
        helios.shutdown().await.unwrap();
        let health_shutdown = helios.health_check().await.unwrap();
        assert!(!health_shutdown.is_healthy);
    }

    #[tokio::test]
    async fn test_helios_metrics_accumulation() {
        let helios = Arc::new(HeliosCoreModule::new());

        let config = CoreConfig {
            name: "Helios".to_string(),
            enabled: true,
            priority: 255,
            settings: HashMap::new(),
        };

        helios.initialize(&config).await.unwrap();

        // Initial collection_count should be 1 (from initialization)
        let metrics1 = helios.metrics().await.unwrap();
        let count1 = metrics1.get("collection_count").unwrap();
        assert_eq!(*count1, 1.0);

        // After manual collection
        helios.collect().await.unwrap();
        let metrics2 = helios.metrics().await.unwrap();
        let count2 = metrics2.get("collection_count").unwrap();
        assert_eq!(*count2, 2.0);

        // After another collection
        helios.collect().await.unwrap();
        let metrics3 = helios.metrics().await.unwrap();
        let count3 = metrics3.get("collection_count").unwrap();
        assert_eq!(*count3, 3.0);
    }

    #[tokio::test]
    async fn test_helios_reconfiguration() {
        let helios = Arc::new(HeliosCoreModule::new());

        let config = CoreConfig {
            name: "Helios".to_string(),
            enabled: true,
            priority: 255,
            settings: HashMap::new(),
        };

        helios.initialize(&config).await.unwrap();

        // Reconfigure with new settings
        let new_config = CoreConfig {
            name: "Helios".to_string(),
            enabled: true,
            priority: 200,
            settings: HashMap::from([
                ("collection_interval_seconds".to_string(), "30".to_string()),
            ]),
        };

        let result = helios.reconfigure(&new_config).await;
        assert!(result.is_ok());

        // Module should still be functional
        let state = helios.collect().await;
        assert!(state.is_ok());
    }
}
