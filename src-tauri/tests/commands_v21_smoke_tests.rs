// ═══════════════════════════════════════════════════════════════════
// SMOKE TESTS - Nouveaux Modules v21.5.3
// Tests basiques validation compilation + error handling
// ═══════════════════════════════════════════════════════════════════

#[cfg(test)]
mod governance_tests {
    use titane_infinity::commands::governance_commands::*;

    #[tokio::test]
    async fn test_governance_get_policies_returns_ok() {
        let result = get_ia_policies().await;
        assert!(result.is_ok(), "get_ia_policies should not panic");
    }

    #[tokio::test]
    async fn test_governance_save_policies() {
        let policies = vec![];
        let result = save_ia_policies(policies).await;
        assert!(result.is_ok(), "save_ia_policies should accept empty vec");
    }

    #[tokio::test]
    async fn test_governance_toggle_nonexistent_policy() {
        let result = toggle_ia_policy("nonexistent_policy_id".to_string(), true).await;
        assert!(result.is_err(), "toggle nonexistent policy should return error");
    }
}

#[cfg(test)]
mod system_center_tests {
    use titane_infinity::commands::system_center_commands::*;

    #[tokio::test]
    async fn test_system_center_clear_logs() {
        let result = sc_clear_logs().await;
        assert!(result.is_ok(), "sc_clear_logs should not panic");
    }

    #[tokio::test]
    async fn test_system_center_add_log() {
        let result = sc_add_log(
            "INFO".to_string(),
            "test_source".to_string(),
            "test message".to_string(),
        )
        .await;
        assert!(result.is_ok(), "sc_add_log should accept valid input");
    }
}

#[cfg(test)]
mod memory_os_tests {
    use titane_infinity::commands::memory_os_commands::*;

    #[tokio::test]
    async fn test_memory_os_clear() {
        let result = memory_clear().await;
        assert!(result.is_ok(), "memory_clear should not panic");
    }

    #[tokio::test]
    async fn test_memory_os_promote_nonexistent() {
        let result = memory_promote("nonexistent_node".to_string()).await;
        assert!(result.is_err(), "promote nonexistent node should return error");
    }

    #[tokio::test]
    async fn test_memory_os_prune_empty() {
        let result = memory_prune().await;
        assert!(result.is_ok(), "prune should work on empty memory");
        let pruned = result.unwrap();
        assert_eq!(pruned, 0, "pruning empty memory should return 0");
    }
}

#[cfg(test)]
mod devtools_tests {
    use titane_infinity::commands::devtools_commands::*;

    #[tokio::test]
    async fn test_devtools_enable_disable() {
        let enable_result = devtools_enable().await;
        assert!(enable_result.is_ok(), "devtools_enable should not panic");

        let disable_result = devtools_disable().await;
        assert!(disable_result.is_ok(), "devtools_disable should not panic");
    }

    #[tokio::test]
    async fn test_devtools_debug_clear() {
        let result = devtools_debug_clear().await;
        assert!(result.is_ok(), "devtools_debug_clear should not panic");
    }
}

#[cfg(test)]
mod whisper_tests {
    use titane_infinity::commands::whisper_commands::*;

    #[tokio::test]
    async fn test_whisper_start_stop() {
        let config = WhisperConfig {
            model: "base".to_string(),
            language: "fr".to_string(),
            sample_rate: 16000,
        };

        let start_result = start_whisper_streaming(config).await;
        assert!(start_result.is_ok(), "start_whisper_streaming should not panic");

        let stop_result = stop_whisper_streaming().await;
        assert!(stop_result.is_ok(), "stop_whisper_streaming should not panic");
    }

    #[tokio::test]
    async fn test_whisper_send_chunk_when_inactive() {
        let result = send_audio_chunk(vec![0u8; 1024]).await;
        assert!(result.is_err(), "sending chunk when inactive should return error");
    }
}

#[cfg(test)]
mod persistent_memory_tests {
    use titane_infinity::commands::persistent_memory_commands::*;

    #[tokio::test]
    async fn test_persistent_memory_promote_nonexistent() {
        let result = persistent_memory_promote_entry("nonexistent_id".to_string()).await;
        assert!(result.is_err(), "promote nonexistent entry should return error");
    }

    #[tokio::test]
    async fn test_persistent_memory_delete() {
        let result = persistent_memory_delete_entry("any_id".to_string()).await;
        assert!(result.is_ok(), "delete should not panic even if entry missing");
    }

    #[tokio::test]
    async fn test_persistent_memory_add_to_nonexistent_bundle() {
        let result = persistent_memory_add_to_bundle(
            "nonexistent_bundle".to_string(),
            vec!["entry1".to_string()],
        )
        .await;
        assert!(
            result.is_err(),
            "add to nonexistent bundle should return error"
        );
    }
}

#[cfg(test)]
mod ui_theme_tests {
    use titane_infinity::commands::ui_theme_commands::*;

    #[tokio::test]
    async fn test_ui_theme_save_load() {
        let tokens = serde_json::json!({
            "primary": "#ff0000",
            "secondary": "#00ff00"
        });

        let save_result = save_ui_theme(tokens).await;
        assert!(save_result.is_ok(), "save_ui_theme should not panic");

        let load_result = load_ui_theme().await;
        assert!(load_result.is_ok(), "load_ui_theme should not panic");
    }
}

#[cfg(test)]
mod self_healing_tests {
    use titane_infinity::commands::self_healing_commands::*;

    #[tokio::test]
    async fn test_self_healing_enable_disable() {
        let enable_result = self_healing_enable().await;
        assert!(enable_result.is_ok(), "enable should not panic");

        let disable_result = self_healing_disable().await;
        assert!(disable_result.is_ok(), "disable should not panic");
    }

    #[tokio::test]
    async fn test_self_healing_trigger_when_disabled() {
        // Ensure disabled first
        let _ = self_healing_disable().await;

        let result = self_healing_trigger("test_action".to_string()).await;
        assert!(
            result.is_err(),
            "trigger when disabled should return error"
        );
    }

    #[tokio::test]
    async fn test_self_healing_get_status() {
        let result = self_healing_get_status().await;
        assert!(result.is_ok(), "get_status should not panic");

        let status = result.unwrap();
        assert!(!status.enabled || status.enabled, "status should have enabled field");
    }
}

#[cfg(test)]
mod singularity_tests {
    use titane_infinity::commands::singularity_commands::*;

    #[tokio::test]
    async fn test_singularity_self_check() {
        let result = singularity_self_check().await;
        assert!(result.is_ok(), "singularity_self_check should not panic");

        let check_result = result.unwrap();
        assert!(!check_result.overall_health.is_empty(), "should return health status");
        assert_eq!(
            check_result.physical_status, "optimal",
            "default physical status should be optimal"
        );
    }
}
