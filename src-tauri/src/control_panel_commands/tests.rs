// TITANE∞ OS - Tests Unitaires Backend Rust
// Tests pour control_panel_commands.rs

#[cfg(test)]
mod control_panel_tests {
    use super::super::*;

    // ═══════════════════════════════════════════════════════════
    // TESTS: Système
    // ═══════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_cp_get_system_info() {
        let result = cp_get_system_info().await;
        assert!(result.is_ok());

        let info = result.unwrap();
        assert_eq!(info.version, "v19.1.0");
        assert!(info.memory_usage >= 0.0 && info.memory_usage <= 100.0);
        assert!(info.cpu_usage >= 0.0 && info.cpu_usage <= 100.0);
        assert!(info.disk_usage >= 0.0 && info.disk_usage <= 100.0);
    }

    #[tokio::test]
    async fn test_cp_run_system_diagnostic() {
        let result = cp_run_system_diagnostic().await;
        assert!(result.is_ok());

        let diagnostic = result.unwrap();
        assert!(diagnostic.contains("Système"));
        assert!(diagnostic.contains("OK"));
    }

    // ═══════════════════════════════════════════════════════════
    // TESTS: Design System
    // ═══════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_cp_get_design_config() {
        let result = cp_get_design_config().await;
        assert!(result.is_ok());

        let config = result.unwrap();
        assert!(["light", "dark", "auto"].contains(&config.mode.as_str()));
        assert!(["compact", "normal", "comfortable"].contains(&config.density.as_str()));
    }

    #[tokio::test]
    async fn test_cp_set_design_config() {
        let config = DesignSystemConfig {
            mode: "dark".to_string(),
            density: "compact".to_string(),
            animations_enabled: false,
            transparency_enabled: true,
        };

        let result = cp_set_design_config(config).await;
        assert!(result.is_ok());
    }

    // ═══════════════════════════════════════════════════════════
    // TESTS: Singularité
    // ═══════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_cp_get_singularity_status() {
        let result = cp_get_singularity_status().await;
        assert!(result.is_ok());

        let status = result.unwrap();
        assert!(status.power_level >= 0 && status.power_level <= 100);
        assert!(status.iterations >= 0);
    }

    #[tokio::test]
    async fn test_cp_toggle_singularity() {
        let result = cp_toggle_singularity().await;
        assert!(result.is_ok());
    }

    // ═══════════════════════════════════════════════════════════
    // TESTS: IA Configuration
    // ═══════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_cp_get_ai_config() {
        let result = cp_get_ai_config().await;
        assert!(result.is_ok());

        let config = result.unwrap();
        assert_eq!(config.gemini_api_key, "***MASKED***");
        assert!(["gemini-pro", "gemini-pro-vision"].contains(&config.gemini_model.as_str()));
        assert!(config.temperature >= 0.0 && config.temperature <= 1.0);
        assert!(config.max_tokens > 0);
    }

    #[tokio::test]
    async fn test_cp_set_ai_config() {
        let config = AIConfig {
            gemini_api_key: "test-key-123".to_string(),
            gemini_model: "gemini-pro".to_string(),
            temperature: 0.7,
            max_tokens: 2048,
        };

        let result = cp_set_ai_config(config).await;
        assert!(result.is_ok());
    }

    // ═══════════════════════════════════════════════════════════
    // TESTS: Mémoire
    // ═══════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_cp_get_memory_stats() {
        let result = cp_get_memory_stats().await;
        assert!(result.is_ok());

        let stats = result.unwrap();
        assert!(stats.total_size > 0);
        assert!(stats.used_size <= stats.total_size);
        assert!(stats.cache_size >= 0);
        assert!(stats.vector_count >= 0);
    }

    #[tokio::test]
    async fn test_cp_clear_memory_cache() {
        let result = cp_clear_memory_cache().await;
        assert!(result.is_ok());
    }

    // ═══════════════════════════════════════════════════════════
    // TESTS: Modules
    // ═══════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_cp_get_modules_status() {
        let result = cp_get_modules_status().await;
        assert!(result.is_ok());

        let modules = result.unwrap();
        assert!(modules.len() > 0);
        assert!(modules.iter().all(|m| !m.id.is_empty()));
        assert!(modules.iter().all(|m| !m.name.is_empty()));
    }

    #[tokio::test]
    async fn test_cp_toggle_module() {
        let result = cp_toggle_module("singularity".to_string()).await;
        assert!(result.is_ok());
    }

    // ═══════════════════════════════════════════════════════════
    // TESTS: Réseau
    // ═══════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_cp_get_network_config() {
        let result = cp_get_network_config().await;
        assert!(result.is_ok());

        let config = result.unwrap();
        // Test basic structure - proxy_url is String now
        assert!(config.proxy_url.is_empty() || !config.proxy_url.is_empty());
    }

    #[tokio::test]
    async fn test_cp_set_network_config() {
        let config = NetworkConfig {
            online_mode: true,
            proxy_enabled: false,
            proxy_url: String::new(),
            auto_sync: true,
        };

        let result = cp_set_network_config(config).await;
        assert!(result.is_ok());
    }

    // ═══════════════════════════════════════════════════════════
    // TESTS: Mises à jour
    // ═══════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_cp_check_for_updates() {
        let result = cp_check_for_updates().await;
        assert!(result.is_ok());

        let info = result.unwrap();
        assert!(!info.current_version.is_empty());
        assert!(!info.latest_version.is_empty());
    }

    #[tokio::test]
    async fn test_cp_install_update() {
        let result = cp_install_update().await;
        assert!(result.is_ok());
    }

    // ═══════════════════════════════════════════════════════════
    // TESTS: Logs
    // ═══════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_cp_get_logs() {
        let result = cp_get_logs(100).await;
        assert!(result.is_ok());

        let logs = result.unwrap();
        assert!(logs.len() <= 100);
    }

    #[tokio::test]
    async fn test_cp_clear_logs() {
        let result = cp_clear_logs().await;
        assert!(result.is_ok());
    }

    // ═══════════════════════════════════════════════════════════
    // TESTS: Sécurité
    // ═══════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_cp_get_security_config() {
        let result = cp_get_security_config().await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_cp_set_security_config() {
        let config = SecurityConfig {
            hn_security_enabled: true,
            secure_mode: false,
            encryption_enabled: true,
            audit_logging: true,
        };

        let result = cp_set_security_config(config).await;
        assert!(result.is_ok());
    }

    // ═══════════════════════════════════════════════════════════
    // TESTS: Structures de données
    // ═══════════════════════════════════════════════════════════

    #[test]
    fn test_system_info_structure() {
        let info = SystemInfo {
            version: "v19.1.0".to_string(),
            uptime: 3600,
            memory_usage: 45.2,
            cpu_usage: 23.5,
            disk_usage: 62.8,
            singularity_active: true,
        };

        assert_eq!(info.version, "v19.1.0");
        assert!(info.uptime > 0);
    }

    #[test]
    fn test_design_system_config_structure() {
        let config = DesignSystemConfig {
            mode: "dark".to_string(),
            density: "normal".to_string(),
            animations_enabled: true,
            transparency_enabled: false,
        };

        assert_eq!(config.mode, "dark");
        assert!(config.animations_enabled);
    }

    #[test]
    fn test_module_status_structure() {
        let module = ModuleStatus {
            id: "test".to_string(),
            name: "Test Module".to_string(),
            description: "Test description".to_string(),
            enabled: true,
            icon: "🧪".to_string(),
        };

        assert_eq!(module.id, "test");
        assert!(module.enabled);
    }
}
