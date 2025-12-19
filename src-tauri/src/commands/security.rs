// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.0 — TAURI BRIDGE SECURITY HARDENING
//   Command whitelist, secure invoke, parameter/response validation
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashSet;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CommandSecurityError {
    UnknownCommand(String),
    InvalidParameters(String),
    InvalidResponse(String),
    ExecutionFailed(String),
}

/// Liste blanche stricte des commandes Tauri autorisées
pub fn get_allowed_commands() -> HashSet<&'static str> {
    let mut commands = HashSet::new();

    // ═══════════════════════════════════════════════════════════════
    // HELIOS - System Monitoring
    // ═══════════════════════════════════════════════════════════════
    commands.insert("get_helios_state");
    commands.insert("get_system_health");
    commands.insert("get_helios_metrics");
    commands.insert("get_system_info");

    // ═══════════════════════════════════════════════════════════════
    // MEMORY - Storage & Timeline
    // ═══════════════════════════════════════════════════════════════
    commands.insert("get_memory_state");
    commands.insert("memory_get_state");
    commands.insert("write_snapshot");
    commands.insert("read_snapshot");
    commands.insert("write_log");
    commands.insert("read_logs");
    commands.insert("add_timeline_event");
    commands.insert("get_timeline");
    commands.insert("get_active_projects");
    commands.insert("get_recent_decisions");
    commands.insert("get_knowledge");
    commands.insert("get_active_rituals");
    commands.insert("save_chat_interaction");
    commands.insert("memory_save_chat_interaction");
    commands.insert("memory_get_active_projects");
    commands.insert("memory_get_recent_decisions");
    commands.insert("memory_get_knowledge");
    commands.insert("memory_get_active_rituals");
    commands.insert("memory_get_timeline");
    commands.insert("memory_debug_scan");
    commands.insert("memory_ingest_file");
    commands.insert("import_file");
    commands.insert("get_all_files");
    commands.insert("get_files_by_category");
    commands.insert("clear_memory");
    commands.insert("store_file");

    // ═══════════════════════════════════════════════════════════════
    // MEMORY ENGINE (Overdrive)
    // ═══════════════════════════════════════════════════════════════
    commands.insert("memory_store");
    commands.insert("memory_store_conversation");
    commands.insert("memory_search");
    commands.insert("memory_get_related");
    commands.insert("memory_get_entry");
    commands.insert("memory_get_all_keys");
    commands.insert("memory_rebuild_index");
    commands.insert("memory_get_stats");
    commands.insert("memory_prune");
    commands.insert("memory_delete");
    commands.insert("memory_export");
    commands.insert("memory_import");

    // ═══════════════════════════════════════════════════════════════
    // MEMORY EVOLUTION ENGINE++
    // ═══════════════════════════════════════════════════════════════
    commands.insert("memory_evolution_status");
    commands.insert("memory_evolve_full");
    commands.insert("memory_get_clusters");
    commands.insert("memory_hierarchy_health");

    // ═══════════════════════════════════════════════════════════════
    // KNOWLEDGE FUSION (Phase 6)
    // ═══════════════════════════════════════════════════════════════
    commands.insert("parse_document");
    commands.insert("detect_file_format");

    // ═══════════════════════════════════════════════════════════════
    // AI / CHAT COMMANDS (v21 - CHAT PIPELINE SELF-REPAIR)
    // ═══════════════════════════════════════════════════════════════
    commands.insert("query_ai");
    commands.insert("get_ai_status");
    commands.insert("test_gemini");
    commands.insert("test_ollama");
    commands.insert("chat_generate");
    commands.insert("upload_and_process_file");
    // Chat Orchestrator (v21 - Complete Pipeline)
    commands.insert("chat_send_message");
    commands.insert("chat_stream_message");
    commands.insert("chat_get_providers_status");
    commands.insert("chat_check_providers");
    commands.insert("chat_create_conversation");
    commands.insert("chat_get_conversation");
    commands.insert("chat_delete_conversation");
    commands.insert("chat_generate_suggestions");
    commands.insert("chat_set_gemini_key");
    commands.insert("generate_response");
    commands.insert("stream_response");
    commands.insert("speak_text");
    commands.insert("save_memory");
    commands.insert("load_memory");
    commands.insert("reset_memory");
    commands.insert("health_check");

    // ═══════════════════════════════════════════════════════════════
    // SELF-HEAL (frontend compat)
    // ═══════════════════════════════════════════════════════════════
    commands.insert("selfheal_get_vitals");
    commands.insert("selfheal_load_profile");
    commands.insert("selfheal_save_profile");
    commands.insert("selfheal_sync_with_singularity");

    // Self-Heal executor actions (frontend compat)
    commands.insert("selfheal_restart_module");
    commands.insert("selfheal_clear_cache");
    commands.insert("selfheal_regenerate_config");
    commands.insert("selfheal_repair_json");
    commands.insert("selfheal_rebuild_memory");
    commands.insert("selfheal_switch_provider");
    commands.insert("selfheal_reset_state");
    commands.insert("selfheal_restart_worker");
    commands.insert("selfheal_restart_process");
    commands.insert("selfheal_sync_state");
    commands.insert("selfheal_mini_audit");
    commands.insert("selfheal_isolate_module");

    // ═══════════════════════════════════════════════════════════════
    // SINGULARITY STATE
    // ═══════════════════════════════════════════════════════════════
    commands.insert("singularity_get_full_state");
    commands.insert("singularity_get_physical");
    commands.insert("singularity_get_cognitive");
    commands.insert("singularity_get_symbolic");
    commands.insert("singularity_get_adaptive");
    commands.insert("singularity_get_meta");
    commands.insert("singularity_get_global_coherence");
    commands.insert("singularity_is_critical");
    commands.insert("get_singularity_state");
    commands.insert("sync_singularity");
    commands.insert("update_singularity_state");
    commands.insert("singularity_self_check");
    // Mutation commands (v16.2.2+)
    commands.insert("singularity_update_physical");
    commands.insert("singularity_update_cognitive");
    commands.insert("singularity_update_symbolic");
    commands.insert("singularity_update_adaptive");
    commands.insert("singularity_update_meta");
    commands.insert("singularity_update_full_state");
    commands.insert("singularity_save_state");
    commands.insert("singularity_load_state");

    // ═══════════════════════════════════════════════════════════════
    // NEXUS - Validation
    // ═══════════════════════════════════════════════════════════════
    commands.insert("validate_nexus");
    commands.insert("get_nexus_graph");

    // ═══════════════════════════════════════════════════════════════
    // XP & EXPERIENCE SYSTEM (v24)
    // ═══════════════════════════════════════════════════════════════
    commands.insert("xp_add");
    commands.insert("xp_get_level");
    commands.insert("xp_get_state");
    commands.insert("experience_get_state");
    commands.insert("experience_update_state");

    // ═══════════════════════════════════════════════════════════════
    // EXP FUSION ENGINE (v15)
    // ═══════════════════════════════════════════════════════════════
    commands.insert("exp_get_global_state");
    commands.insert("exp_get_categories");
    commands.insert("exp_get_projects");
    commands.insert("exp_get_project_stats");
    commands.insert("exp_get_talents");
    commands.insert("exp_get_timeline");
    commands.insert("exp_get_timeline_stats");
    commands.insert("exp_add_knowledge");

    // ═══════════════════════════════════════════════════════════════
    // COGNITIVE LAYER
    // ═══════════════════════════════════════════════════════════════
    commands.insert("get_cognitive_state");
    commands.insert("update_cognitive_mode");

    // ═══════════════════════════════════════════════════════════════
    // CENTRE D'ÉVOLUTION COGNITIVE v19.3 (OPUS #4)
    // ═══════════════════════════════════════════════════════════════
    commands.insert("cognitive_get_progression");
    commands.insert("cognitive_add_xp");
    commands.insert("cognitive_reset_progression");
    commands.insert("cognitive_get_knowledge_vault");
    commands.insert("cognitive_ingest_file");
    commands.insert("cognitive_search_knowledge");
    commands.insert("cognitive_delete_knowledge");
    commands.insert("cognitive_get_evolution");
    commands.insert("cognitive_run_evolution_cycle");
    commands.insert("cognitive_add_changelog");
    commands.insert("cognitive_get_memory");
    commands.insert("cognitive_store_memory");
    commands.insert("cognitive_purge_memory");
    commands.insert("cognitive_consolidate_memory");
    commands.insert("cognitive_backup_memory");
    commands.insert("cognitive_get_unified_state");

    // ═══════════════════════════════════════════════════════════════
    // ORCHESTRATION CENTER COMMANDS v19.5 (OPUS #5/6/7)
    // ═══════════════════════════════════════════════════════════════
    commands.insert("orchestration_get_multi_ai");
    commands.insert("orchestration_ping_providers");
    commands.insert("orchestration_force_provider");
    commands.insert("orchestration_set_auto_mode");
    commands.insert("orchestration_get_nexus");
    commands.insert("orchestration_update_nexus_node");
    commands.insert("orchestration_get_harmonia");
    commands.insert("orchestration_throttle_flow");
    commands.insert("orchestration_get_timeline");
    commands.insert("orchestration_add_timeline_event");
    commands.insert("orchestration_clear_timeline");
    commands.insert("orchestration_get_cognitive_state");
    commands.insert("orchestration_set_cognitive_mode");
    commands.insert("orchestration_analyze_cognitive");
    commands.insert("orchestration_get_unified_state");
    commands.insert("orchestration_get_singularity_fragment");

    // ═══════════════════════════════════════════════════════════════
    // ONE CORE COMMANDS v19.6 (OPUS #6)
    // Unified Command Center - Point d'accès unique
    // ═══════════════════════════════════════════════════════════════
    commands.insert("one_core_get_state");
    commands.insert("one_core_get_engine_status");
    commands.insert("one_core_list_commands");
    commands.insert("one_core_execute_command");
    commands.insert("one_core_run_diagnostic");
    commands.insert("one_core_get_metrics");
    commands.insert("one_core_force_sync");
    commands.insert("one_core_cleanup");
    commands.insert("one_core_set_mode");
    commands.insert("one_core_get_event_history");
    commands.insert("one_core_verify_integrity");

    // ═══════════════════════════════════════════════════════════════
    // QA MONITORING CENTER - OPUS #7 v∞
    // ═══════════════════════════════════════════════════════════════
    commands.insert("qa_get_state");
    commands.insert("qa_list_test_suites");
    commands.insert("qa_run_test_suite");
    commands.insert("qa_get_test_result");
    commands.insert("qa_list_monitors");
    commands.insert("qa_create_monitor");
    commands.insert("qa_toggle_monitor");
    commands.insert("qa_delete_monitor");
    commands.insert("qa_get_system_metrics");
    commands.insert("qa_list_alerts");
    commands.insert("qa_acknowledge_alert");
    commands.insert("qa_resolve_alert");
    commands.insert("qa_get_hardening_config");
    commands.insert("qa_update_hardening_config");
    commands.insert("qa_run_security_audit");
    commands.insert("qa_get_performance_report");
    commands.insert("qa_get_logs");
    commands.insert("qa_export_metrics_prometheus");
    commands.insert("qa_health_check");

    // ═══════════════════════════════════════════════════════════════
    // VOICE COMMANDS - TTS & ASR (v16.2.2+ / v∞.7)
    // ═══════════════════════════════════════════════════════════════
    commands.insert("speak");
    commands.insert("stop_speaking");
    commands.insert("is_speaking");
    commands.insert("start_recording");
    commands.insert("stop_recording");
    commands.insert("transcribe_audio");
    commands.insert("force_reset_voice");  // ✅ v∞.7 Emergency reset

    // ═══════════════════════════════════════════════════════════════
    // AUDIO CENTER COMMANDS (v19.2+)
    // ═══════════════════════════════════════════════════════════════
    commands.insert("tts_speak");
    commands.insert("tts_stop");
    commands.insert("test_tts");
    commands.insert("test_microphone");
    commands.insert("get_audio_output_devices");
    commands.insert("get_audio_input_devices");
    commands.insert("set_audio_output_device");
    commands.insert("set_audio_input_device");

    // ═══════════════════════════════════════════════════════════════
    // DEVTOOLS & LOGS
    // ═══════════════════════════════════════════════════════════════
    commands.insert("get_logs");
    commands.insert("clear_logs");

    // ═══════════════════════════════════════════════════════════════
    // DEVOPS (v19)
    // ═══════════════════════════════════════════════════════════════
    commands.insert("devops_run");
    commands.insert("devops_stats");

    // ═══════════════════════════════════════════════════════════════
    // SECURE COMMANDS (v∞)
    // ═══════════════════════════════════════════════════════════════
    commands.insert("secure_import_file");
    commands.insert("secure_read_file");
    commands.insert("secure_list_files");
    commands.insert("secure_delete_file");
    commands.insert("get_permission_audit");
    commands.insert("validate_chat_message");
    commands.insert("check_system_integrity");
    commands.insert("get_gemini_key_status");
    commands.insert("secure_store_secret");

    // ═══════════════════════════════════════════════════════════════
    // STATE & SESSION
    // ═══════════════════════════════════════════════════════════════
    commands.insert("ping");
    commands.insert("get_state");
    commands.insert("set_state");
    commands.insert("delete_state");
    commands.insert("system_get_status");
    commands.insert("get_system_state");
    commands.insert("get_module_health");
    commands.insert("start_session");
    commands.insert("end_session");
    commands.insert("get_session_info");
    commands.insert("get_runtime_config");

    // ═══════════════════════════════════════════════════════════════
    // CONFIG HUB
    // ═══════════════════════════════════════════════════════════════
    commands.insert("get_all_configs");
    commands.insert("export_config");
    commands.insert("import_config");
    commands.insert("list_config_presets");
    commands.insert("save_config_preset");
    commands.insert("load_config_preset");
    commands.insert("delete_config_preset");
    commands.insert("update_runtime_config");
    commands.insert("update_chat_engine_config");

    // ═══════════════════════════════════════════════════════════════
    // SYSTEM CENTER DIAGNOSTICS (v∞)
    // ═══════════════════════════════════════════════════════════════
    commands.insert("sc_run_quick_diagnostics");
    commands.insert("sc_run_full_diagnostics");
    commands.insert("sc_get_diagnostic_status");

    // ═══════════════════════════════════════════════════════════════
    // AVATAR & FULLBODY (v23+)
    // ═══════════════════════════════════════════════════════════════
    // Avatar core
    commands.insert("avatar_prepare_speech");
    commands.insert("avatar_finish_speech");
    commands.insert("avatar_enable_immersion");
    commands.insert("avatar_on_wake_word");
    commands.insert("avatar_get_current_morph");
    commands.insert("avatar_advance_lip_sync");
    commands.insert("avatar_get_expression");
    commands.insert("avatar_get_state");
    commands.insert("avatar_prepare_animation");
    commands.insert("avatar_run_selftest");

    // Avatar appearance
    commands.insert("avatar_get_appearance");
    commands.insert("avatar_set_appearance");
    commands.insert("avatar_update_appearance");
    commands.insert("avatar_apply_style_preset");
    commands.insert("avatar_parse_style_command");
    commands.insert("avatar_save_custom_style");
    commands.insert("avatar_load_custom_style");
    commands.insert("avatar_merge_styles");
    commands.insert("avatar_list_styles");
    commands.insert("avatar_add_archetype");

    // Avatar floating / display
    commands.insert("avatar_get_display_state");
    commands.insert("avatar_set_display_state");
    commands.insert("avatar_update_display_state");
    commands.insert("avatar_reset_display_state");
    commands.insert("avatar_mode_floating");
    commands.insert("avatar_mode_embed");
    commands.insert("avatar_mode_hidden");
    commands.insert("avatar_set_position");
    commands.insert("avatar_set_size");
    commands.insert("avatar_set_scale");
    commands.insert("avatar_set_opacity");
    commands.insert("avatar_set_always_on_top");
    commands.insert("avatar_set_locked");
    commands.insert("avatar_set_mirror_mode");
    commands.insert("avatar_set_click_through");
    commands.insert("avatar_set_anchor");
    commands.insert("avatar_set_anchor_by_name");
    commands.insert("avatar_list_screens");
    commands.insert("avatar_move_to_screen");

    // FullBody
    commands.insert("fullbody_initialize");
    commands.insert("fullbody_advance_frame");
    commands.insert("fullbody_activate_gesture");
    commands.insert("fullbody_update_expression");
    commands.insert("fullbody_update_lipsync");
    commands.insert("fullbody_update_state");
    commands.insert("fullbody_on_wake_word");
    commands.insert("fullbody_export_skeleton");
    commands.insert("fullbody_update_context");
    commands.insert("fullbody_get_posture");
    commands.insert("fullbody_get_stats");
    commands.insert("fullbody_run_selftest");

    // ═══════════════════════════════════════════════════════════════
    // SINGULARITY-FUSION vΩ (AutoFix / AutoHeal / CrashGuard / Performance)
    // ═══════════════════════════════════════════════════════════════
    // AutoFix
    commands.insert("autofix_detect_rust_warnings");
    commands.insert("autofix_detect_typescript_errors");
    commands.insert("autofix_detect_react_hook_violations");
    commands.insert("autofix_detect_invalid_states");
    commands.insert("autofix_fix_issue");
    commands.insert("autofix_fix_all");
    commands.insert("autofix_get_history");
    commands.insert("autofix_get_stats");
    commands.insert("autofix_reset");
    commands.insert("autofix_rust_warning");
    commands.insert("autofix_typescript_error");
    commands.insert("autofix_reset_state");
    commands.insert("autofix_restart_pipeline");
    commands.insert("autofix_restart_tauri_command");
    commands.insert("autofix_resync_lipsync");
    commands.insert("autofix_add_mutex");

    // AutoHeal
    commands.insert("autoheal_detect_broken");
    commands.insert("autoheal_detect_broken_modules");
    commands.insert("autoheal_reset_cognitive");
    commands.insert("autoheal_init_cognitive");
    commands.insert("autoheal_reset_adaptive");
    commands.insert("autoheal_clear_narrative");
    commands.insert("autoheal_init_narrative");
    commands.insert("autoheal_stop_avatar");
    commands.insert("autoheal_reload_avatar");
    commands.insert("autoheal_start_avatar");
    commands.insert("autoheal_clear_tts_queue");
    commands.insert("autoheal_init_tts");
    commands.insert("autoheal_resync_lipsync");
    commands.insert("autoheal_rebuild_memory_index");
    commands.insert("autoheal_validate_memory");
    commands.insert("autoheal_stop_pipeline");
    commands.insert("autoheal_clear_pipeline");
    commands.insert("autoheal_start_pipeline");
    commands.insert("autoheal_heal_cognitive_module");
    commands.insert("autoheal_heal_avatar_module");
    commands.insert("autoheal_heal_tts_module");
    commands.insert("autoheal_heal_lipsync_module");
    commands.insert("autoheal_heal_memory_module");
    commands.insert("autoheal_heal_pipeline");
    commands.insert("autoheal_resync_state");
    commands.insert("autoheal_get_history");
    commands.insert("autoheal_reset");

    // CrashGuard
    commands.insert("crashguard_detect_threats");
    commands.insert("crashguard_clear_memory");
    commands.insert("crashguard_kill_thread");
    commands.insert("crashguard_restart_module");
    commands.insert("crashguard_emergency_shutdown");
    commands.insert("crashguard_reset_pipeline");
    commands.insert("crashguard_emergency_rollback");
    commands.insert("crashguard_get_active_threats");
    commands.insert("crashguard_get_stats");

    // Performance
    commands.insert("performance_get_metrics");
    commands.insert("performance_throttle_cpu");
    commands.insert("performance_optimize_gpu");
    commands.insert("performance_reduce_render_quality");
    commands.insert("performance_compress_memory");
    commands.insert("performance_reset_optimizations");

    // Unified pipeline
    commands.insert("pipeline_analyze_intention");
    commands.insert("pipeline_generate_cognitive_response");
    commands.insert("pipeline_prepare_tts");
    commands.insert("pipeline_prepare_avatar_animation");
    commands.insert("pipeline_get_stats");
    commands.insert("pipeline_pause");
    commands.insert("pipeline_resume");
    commands.insert("pipeline_reset");
    commands.insert("pipeline_validate");

    commands
}

/// Valider qu'une commande est autorisée
pub fn validate_command(command: &str) -> Result<(), CommandSecurityError> {
    let allowed = get_allowed_commands();

    if !allowed.contains(command) {
        log::error!("❌ Unauthorized command attempt: {}", command);
        return Err(CommandSecurityError::UnknownCommand(command.to_string()));
    }

    log::debug!("✅ Command validated: {}", command);
    Ok(())
}

/// Valider les paramètres d'une commande (vérification basique)
pub fn validate_parameters(params: &serde_json::Value) -> Result<(), CommandSecurityError> {
    // Vérifier que c'est un objet ou un tableau valide
    if !params.is_object() && !params.is_array() && !params.is_null() {
        return Err(CommandSecurityError::InvalidParameters(
            "Parameters must be object, array, or null".to_string(),
        ));
    }

    // Vérifier la taille (éviter les payloads énormes)
    let json_str = serde_json::to_string(params)
        .map_err(|e| CommandSecurityError::InvalidParameters(e.to_string()))?;

    const MAX_PARAM_SIZE: usize = 1024 * 1024; // 1 MB
    if json_str.len() > MAX_PARAM_SIZE {
        return Err(CommandSecurityError::InvalidParameters(format!(
            "Parameters too large: {} bytes",
            json_str.len()
        )));
    }

    Ok(())
}

/// Valider une réponse de commande
pub fn validate_response(response: &serde_json::Value) -> Result<(), CommandSecurityError> {
    // Vérifier que la réponse est valide JSON
    if response.is_null() {
        log::warn!("⚠️  Command returned null response");
    }

    // Vérifier la taille
    let json_str = serde_json::to_string(response)
        .map_err(|e| CommandSecurityError::InvalidResponse(e.to_string()))?;

    const MAX_RESPONSE_SIZE: usize = 10 * 1024 * 1024; // 10 MB
    if json_str.len() > MAX_RESPONSE_SIZE {
        return Err(CommandSecurityError::InvalidResponse(format!(
            "Response too large: {} bytes",
            json_str.len()
        )));
    }

    Ok(())
}

/// Logger une tentative de commande non autorisée
pub fn log_unauthorized_attempt(command: &str, source: &str) {
    log::error!(
        "🚨 SECURITY: Unauthorized command '{}' attempted from {}",
        command,
        source
    );
}

/// Statistiques de sécurité
#[derive(Debug, Clone, Default)]
pub struct SecurityStats {
    pub total_commands: u64,
    pub blocked_commands: u64,
    pub invalid_parameters: u64,
    pub invalid_responses: u64,
}

impl SecurityStats {
    pub fn record_command(&mut self) {
        self.total_commands += 1;
    }

    pub fn record_blocked(&mut self) {
        self.blocked_commands += 1;
    }

    pub fn record_invalid_params(&mut self) {
        self.invalid_parameters += 1;
    }

    pub fn record_invalid_response(&mut self) {
        self.invalid_responses += 1;
    }

    pub fn get_block_rate(&self) -> f64 {
        if self.total_commands == 0 {
            return 0.0;
        }
        self.blocked_commands as f64 / self.total_commands as f64
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_command() {
        assert!(validate_command("memory_get_active_projects").is_ok());
        assert!(validate_command("query_ai").is_ok());
        assert!(validate_command("unknown_command").is_err());
        assert!(validate_command("malicious_command").is_err());
    }

    #[test]
    fn test_validate_parameters() {
        let valid = serde_json::json!({"key": "value"});
        assert!(validate_parameters(&valid).is_ok());

        let null_params = serde_json::json!(null);
        assert!(validate_parameters(&null_params).is_ok());

        // Test taille limite (simulé avec un petit objet pour le test)
        let array = serde_json::json!([1, 2, 3, 4, 5]);
        assert!(validate_parameters(&array).is_ok());
    }

    #[test]
    fn test_validate_response() {
        let valid = serde_json::json!({"status": "ok", "data": []});
        assert!(validate_response(&valid).is_ok());

        let null_response = serde_json::json!(null);
        assert!(validate_response(&null_response).is_ok());
    }

    #[test]
    fn test_security_stats() {
        let mut stats = SecurityStats::default();

        stats.record_command();
        stats.record_command();
        stats.record_blocked();

        assert_eq!(stats.total_commands, 2);
        assert_eq!(stats.blocked_commands, 1);
        assert_eq!(stats.get_block_rate(), 0.5);
    }

    #[test]
    fn test_allowed_commands_count() {
        let commands = get_allowed_commands();
        assert!(commands.len() > 20); // Au moins 20 commandes
        assert!(commands.contains("memory_get_active_projects"));
        assert!(commands.contains("query_ai"));
    }
}
