// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v14 — API HANDLERS V14
//   Unified Tauri command handlers for SingularityEngine architecture
// ═══════════════════════════════════════════════════════════════

/// Get all v14 unified handlers for Tauri app builder
///
/// This consolidates all v14 command handlers into a single invocation
/// for the Tauri builder. Legacy handlers are marked as deprecated.
///
/// Usage in main.rs:
/// ```rust
/// tauri::Builder::default()
///     .invoke_handler(api::handlers_v14::get_handlers())
///     .run(tauri::generate_context!())
/// ```
pub fn get_handlers() -> impl Fn(tauri::Invoke) + Send + Sync + 'static {
    tauri::generate_handler![
        // ═══════════════════════════════════════════════════════════════
        // CORE v14 (SingularityEngine)
        // ═══════════════════════════════════════════════════════════════
        crate::commands::engine_v14::singularity_init,
        crate::commands::engine_v14::singularity_get_state,
        crate::commands::engine_v14::singularity_tick,
        crate::commands::engine_v14::singularity_sync,
        crate::commands::engine_v14::singularity_stop,
        crate::commands::engine_v14::singularity_health,
        crate::commands::engine_v14::singularity_metrics,
        crate::commands::engine_v14::singularity_module_info,
        // ═══════════════════════════════════════════════════════════════
        // EVOLUTION v14 (Auto-Evolution + Health Check)
        // ═══════════════════════════════════════════════════════════════
        crate::commands::evolution_v14::run_auto_evolution,
        crate::commands::evolution_v14::get_evolution_state,
        crate::commands::evolution_v14::evolution_health_check,

        // ═══════════════════════════════════════════════════════════════
        // DIAGNOSTIC v14 (Backend Self-Check + Validation)
        // ═══════════════════════════════════════════════════════════════
        crate::commands::diagnostic::backend_self_check,
        crate::commands::diagnostic::get_backend_info,
        crate::commands::diagnostic::validate_tauri_only,
        // ═══════════════════════════════════════════════════════════════
        // CHAT IA v14 (AI Router + Memory + Voice)
        // ═══════════════════════════════════════════════════════════════
        crate::commands::ai_chat::ai_query,
        crate::commands::ai_chat::speak,
        crate::commands::ai_chat::start_recording,
        crate::commands::ai_chat::stop_recording,
        crate::commands::ai_chat::transcribe_audio,
        crate::commands::ai_chat::get_conversation_history,
        crate::commands::ai_chat::new_conversation,
        crate::commands::ai_chat::delete_conversation,
        // ═══════════════════════════════════════════════════════════════
        // MEMORY v14 (MemoryStorage + Compactor)
        // ═══════════════════════════════════════════════════════════════
        crate::api::memory_api::memory_get_conversations,
        crate::api::memory_api::memory_get_conversation,
        crate::api::memory_api::memory_delete_conversation,
        crate::api::memory_api::memory_export_conversation,
        crate::api::memory_api::memory_clear_all,
        // ═══════════════════════════════════════════════════════════════
        // SYSTEM v14 (System Vitals + Health)
        // ═══════════════════════════════════════════════════════════════
        crate::api::system_api::system_get_vitals,
        crate::api::system_api::system_get_processes,
        crate::api::system_api::system_get_health,
        // ═══════════════════════════════════════════════════════════════
        // HARMONIA v14 (Harmony Engine)
        // ═══════════════════════════════════════════════════════════════
        crate::commands::harmonia_commands::harmonia_get_state,
        crate::commands::harmonia_commands::harmonia_analyze_context,
        crate::commands::harmonia_commands::harmonia_balance,
        // ═══════════════════════════════════════════════════════════════
        // MEMORY COMPACTOR v14
        // ═══════════════════════════════════════════════════════════════
        crate::commands::memory_compactor_commands::compactor_compact_file,
        crate::commands::memory_compactor_commands::compactor_compact_directory,
        crate::commands::memory_compactor_commands::compactor_get_stats,
        // ═══════════════════════════════════════════════════════════════
        // LEGACY DEPRECATED (v12 compatibility - will be removed in v15)
        // ═══════════════════════════════════════════════════════════════
        #[deprecated(since = "14.0.0", note = "Use SingularityEngine commands instead")]
        crate::commands::meta_mode::meta_mode_activate,
        #[deprecated(since = "14.0.0", note = "Use SingularityEngine commands instead")]
        crate::commands::meta_mode::meta_mode_deactivate,
        #[deprecated(since = "14.0.0", note = "Use run_auto_evolution instead")]
        crate::commands::evolution::evolution_run_cycle,
        #[deprecated(since = "14.0.0", note = "Use evolution_health_check instead")]
        crate::commands::evolution::evolution_get_state,
        // ═══════════════════════════════════════════════════════════════
        // SECURE COMMANDS v∞ (Always Active)
        // ═══════════════════════════════════════════════════════════════
        crate::secure_commands::execute_secure_command,
        crate::secure_commands::get_command_permissions,
        crate::secure_commands::verify_command_signature,
        // ═══════════════════════════════════════════════════════════════
        // TIME COMMANDS v∞ (Time-Travel + Backups)
        // ═══════════════════════════════════════════════════════════════
        crate::time_commands::time_create_snapshot,
        crate::time_commands::time_restore_snapshot,
        crate::time_commands::time_list_snapshots,
        crate::time_commands::time_delete_snapshot,
        // ═══════════════════════════════════════════════════════════════
        // CONTROL PANEL v19.1.0
        // ═══════════════════════════════════════════════════════════════
        crate::control_panel_commands::control_panel_get_status,
        crate::control_panel_commands::control_panel_execute_action,
    ]
}

/// Get handler count for diagnostics
pub fn get_handler_count() -> usize {
    // Core v14: 8
    // Evolution v14: 3
    // Diagnostic v14: 3
    // Chat IA v14: 8
    // Memory v14: 5
    // System v14: 3
    // Harmonia v14: 3
    // Compactor v14: 3
    // Legacy deprecated: 4
    // Secure: 3
    // Time: 4
    // Control Panel: 2
    // TOTAL: 49 handlers
    49
}

/// Check if handler is deprecated
pub fn is_handler_deprecated(handler_name: &str) -> bool {
    matches!(
        handler_name,
        "meta_mode_activate"
            | "meta_mode_deactivate"
            | "evolution_run_cycle"
            | "evolution_get_state"
    )
}

/// Get v14 handler categories
pub fn get_handler_categories() -> Vec<(&'static str, Vec<&'static str>)> {
    vec![
        (
            "Core v14",
            vec![
                "singularity_init",
                "singularity_get_state",
                "singularity_tick",
                "singularity_sync",
                "singularity_stop",
                "singularity_health",
                "singularity_metrics",
                "singularity_module_info",
            ],
        ),
        (
            "Evolution v14",
            vec![
                "run_auto_evolution",
                "get_evolution_state",
                "evolution_health_check",
            ],
        ),
        (
            "Diagnostic v14",
            vec![
                "backend_self_check",
                "get_backend_info",
                "validate_tauri_only",
            ],
        ),
        (
            "Chat IA v14",
            vec![
                "ai_query",
                "speak",
                "start_recording",
                "stop_recording",
                "transcribe_audio",
                "get_conversation_history",
                "new_conversation",
                "delete_conversation",
            ],
        ),
        (
            "Memory v14",
            vec![
                "memory_get_conversations",
                "memory_get_conversation",
                "memory_delete_conversation",
                "memory_export_conversation",
                "memory_clear_all",
            ],
        ),
        (
            "System v14",
            vec![
                "system_get_vitals",
                "system_get_processes",
                "system_get_health",
            ],
        ),
        (
            "Harmonia v14",
            vec![
                "harmonia_get_state",
                "harmonia_analyze_context",
                "harmonia_balance",
            ],
        ),
        (
            "Compactor v14",
            vec![
                "compactor_compact_file",
                "compactor_compact_directory",
                "compactor_get_stats",
            ],
        ),
        (
            "Security v∞",
            vec![
                "execute_secure_command",
                "get_command_permissions",
                "verify_command_signature",
            ],
        ),
        (
            "Time-Travel v∞",
            vec![
                "time_create_snapshot",
                "time_restore_snapshot",
                "time_list_snapshots",
                "time_delete_snapshot",
            ],
        ),
        (
            "Control Panel v19",
            vec!["control_panel_get_status", "control_panel_execute_action"],
        ),
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_handler_count() {
        assert_eq!(get_handler_count(), 49);
    }

    #[test]
    fn test_deprecated_handlers() {
        assert!(is_handler_deprecated("meta_mode_activate"));
        assert!(is_handler_deprecated("evolution_run_cycle"));
        assert!(!is_handler_deprecated("singularity_init"));
    }

    #[test]
    fn test_categories_count() {
        let categories = get_handler_categories();
        assert_eq!(categories.len(), 11);

        let total_handlers: usize = categories.iter().map(|(_, handlers)| handlers.len()).sum();
        // 49 total - 4 deprecated = 45 active
        assert_eq!(total_handlers, 45);
    }
}
