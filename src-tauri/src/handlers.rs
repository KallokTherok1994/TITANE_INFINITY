// TITANE∞ v16 — HANDLERS FACTORY
// Conditional command handlers based on build configuration
// Architecture v16: Cognitive Layer + v15 Core

/// Generate invoke handler for Tauri based on enabled features (v16)
///
/// - In mock mode: uses mock_commands for frontend development
/// - In full mode: uses real backend commands with SingularityEngine v16
#[macro_export]
macro_rules! generate_titane_handlers {
    () => {
        {
            #[cfg(all(feature = "mock", not(feature = "full")))]
            {
                // MOCK MODE: Frontend development with simulated backend (v16)
                use $crate::mock_commands;

                tauri::generate_handler![
                    // System & Helios v16
                    mock_commands::get_helios_state,
                    commands::get_system_vitals,
                    commands::helios_get_metrics,
                    commands::nexus_get_graph,
                    commands::harmonia_get_flows,
                    commands::sentinel_get_alerts,

                    // Cognitive Layer v16 (NEW)
                    commands::cognitive_analyze,
                    commands::cognitive_check_coherence,
                    commands::cognitive_integrate,
                    commands::cognitive_learn,
                    commands::cognitive_get_status,
                    commands::cognitive_optimize,

                    // Engine v16
                    commands::engine_init,
                    commands::engine_tick,
                    commands::engine_sync,
                    commands::engine_health,
                    commands::engine_metrics,
                    commands::engine_modules_info,

                    // Memory Compactor v15
                    commands::memory_compactor_run,
                    commands::memory_compactor_status,

                    // Memory v15 (Key-Value + Conversations)
                    commands::memory_get,
                    commands::memory_set,
                    commands::memory_get_stats,
                    commands::memory_list_all,
                    commands::memory_clear_all,
                    commands::memory_export_conversation,
                    commands::memory_compact,

                    // Evolution v15
                    commands::evolution_run_cycle,
                    commands::evolution_get_stats,
                    commands::evolution_get_state,

                    // Harmonia v15
                    commands::harmonia_get_cpu_metrics,
                    commands::harmonia_get_system_info,

                    // Diagnostic v15
                    commands::backend_self_check,

                    // AI Chat v15 (Real Backend)
                    commands::ai_query,
                    commands::speak,
                    commands::start_recording,
                    commands::stop_recording,
                    commands::transcribe_audio,
                    commands::create_conversation,
                    commands::load_conversation,
                    commands::list_conversations,
                    commands::delete_conversation,
                    commands::clear_all_memory,
                    commands::check_connection,
                    commands::health_check,
                    commands::get_vad_state,
                    commands::get_module_status,

                    // AI Chat v15 — Frontend Integration Commands
                    commands::chat_send_message,
                    commands::chat_stream_message,
                    commands::chat_set_gemini_key,
                    commands::chat_get_providers_status,
                    commands::chat_check_providers,

                    // Engine Commands v15 — TITANE∞ Core Engines
                    commands::engine_get_nexus_state,
                    commands::engine_get_harmonia_state,
                    commands::engine_get_sentinel_state,
                    commands::engine_get_cognition_state,
                    commands::engine_get_singularity_state,
                    commands::engine_init_singularity,
                    commands::engine_tick,
                    commands::engine_get_evolution_state,

                    // Secure Commands v15
                    secure_commands::secure_import_file,
                    secure_commands::secure_read_file,
                    secure_commands::secure_list_files,
                    secure_commands::secure_delete_file,
                    secure_commands::get_permission_audit,
                    secure_commands::validate_chat_message,
                    secure_commands::check_system_integrity,

                    // Time Travel
                    time_commands::list_snapshots,
                    time_commands::get_travel_stats,
                    time_commands::restore_snapshot,
                    time_commands::delete_snapshot,

                    // Super-Prompts P-Ω
                    $crate::cluster::mesh_initialize,
                    $crate::cluster::mesh_get_stats,
                    $crate::knowledge::parse_document,
                    $crate::knowledge::detect_file_format,
                    $crate::hypervision::hypervision_start,
                    $crate::hypervision::get_system_metrics,
                    $crate::creation::create_module,
                    $crate::introspection::introspection_scan,
                    $crate::introspection::introspection_auto_fix,
                    $crate::evolution::evolution_run_cycle,
                    $crate::evolution::evolution_get_stats,
                    $crate::hyper_evolution::hyper_predict_issues,
                    $crate::hyper_evolution::hyper_accelerate,
                    $crate::hyper_evolution::hyper_analyze_structure,
                    $crate::hyper_evolution::hyper_detect_regeneration,
                    $crate::hyper_evolution::hyper_analyze_rewrite,
                    $crate::hyper_evolution::hyper_validate,
                    $crate::cognitive_learning::cognitive_get_map,
                    $crate::cognitive_learning::cognitive_add_concept,
                    $crate::cognitive_learning::cognitive_build_memory,
                    $crate::cognitive_learning::cognitive_create_association,
                    $crate::cognitive_learning::cognitive_get_associations,
                    $crate::cognitive_learning::cognitive_grow_knowledge,
                    $crate::cognitive_learning::cognitive_run_reinforcement,
                    $crate::cognitive_learning::cognitive_summarize,
                    $crate::neuro_symbolic::neuro_fuse,
                    $crate::neuro_symbolic::neuro_adapt_intent,
                    $crate::neuro_symbolic::neuro_translate_symbolic,
                    $crate::neuro_symbolic::neuro_bridge_reasoning,
                    $crate::neuro_symbolic::neuro_map_context,
                    $crate::neuro_symbolic::neuro_get_state,
                    $crate::meta_creation::meta_generate_ideas,
                    $crate::meta_creation::meta_invent_pattern,
                    $crate::meta_creation::meta_design_system,
                    $crate::meta_creation::meta_generate_prototype,
                    $crate::meta_creation::meta_build_solution,
                    $crate::meta_creation::meta_integrate_module,
                    $crate::meta_creation::meta_get_creative_memory,
                    $crate::self_repair::repair_detect_anomalies,
                    $crate::self_repair::repair_execute,
                    $crate::self_repair::repair_regenerate_module,
                    $crate::self_repair::repair_fallback_recovery,
                    $crate::self_repair::repair_deep_rebuild,
                    $crate::self_repair::repair_get_integrity_map,
                    $crate::singularity::singularity_activate,
                    $crate::singularity::singularity_check_coherence,
                    $crate::singularity::singularity_fuse_all,
                    $crate::singularity::singularity_unify,
                    $crate::singularity::singularity_get_state,
                    $crate::singularity::singularity_detect_emergence,

                    // Control Panel
                    control_panel_commands::cp_get_system_info,
                    control_panel_commands::cp_run_system_diagnostic,
                    control_panel_commands::cp_get_design_config,
                    control_panel_commands::cp_set_design_config,
                    control_panel_commands::cp_get_singularity_status,
                    control_panel_commands::cp_toggle_singularity,
                    control_panel_commands::cp_get_ai_config,
                    control_panel_commands::cp_set_ai_config,
                    control_panel_commands::cp_get_memory_stats,
                    control_panel_commands::cp_clear_memory_cache,
                    control_panel_commands::cp_get_modules_status,
                    control_panel_commands::cp_toggle_module,
                    control_panel_commands::cp_get_network_config,
                    control_panel_commands::cp_set_network_config,
                    control_panel_commands::cp_check_for_updates,
                    control_panel_commands::cp_install_update,
                    control_panel_commands::cp_get_logs,
                    control_panel_commands::cp_clear_logs,
                    control_panel_commands::cp_get_security_config,
                    control_panel_commands::cp_set_security_config,
                ]
            }

            #[cfg(not(feature = "mock"))]
            {
                // FULL MODE: Real backend with SingularityEngine v14
                use $crate::{commands, control_panel_commands, secure_commands, time_commands};

                tauri::generate_handler![
                    // System Commands (v14)
                    commands::get_system_status,
                    mock_commands::get_system_health,
                    mock_commands::get_helios_metrics,
                    mock_commands::get_system_info,

                    // Memory & Timeline
                    mock_commands::get_memory_state,
                    mock_commands::memory_get_state,
                    mock_commands::write_snapshot,
                    mock_commands::read_snapshot,
                    mock_commands::write_log,
                    mock_commands::read_logs,
                    mock_commands::add_timeline_event,
                    mock_commands::get_timeline,
                    mock_commands::memory_debug_scan,

                    // Nexus
                    mock_commands::validate_nexus,
                    mock_commands::get_nexus_graph,

                    // Singularity
                    mock_commands::singularity_get_full_state,
                    mock_commands::singularity_get_physical,
                    mock_commands::singularity_get_cognitive,
                    mock_commands::singularity_get_global_coherence,
                    mock_commands::singularity_is_critical,
                    mock_commands::get_singularity_state,
                    mock_commands::sync_singularity,
                    mock_commands::singularity_get_symbolic,
                    mock_commands::singularity_get_adaptive,
                    mock_commands::singularity_get_meta,

                    // Knowledge & Projects
                    mock_commands::get_active_projects,
                    mock_commands::get_recent_decisions,
                    mock_commands::get_knowledge,
                    mock_commands::get_active_rituals,
                    mock_commands::save_chat_interaction,

                    // DevTools
                    mock_commands::get_logs,
                    mock_commands::clear_logs,

                    // Experience
                    mock_commands::experience_get_state,
                    mock_commands::experience_update_state,

                    // File Operations
                    mock_commands::memory_ingest_file,
                    mock_commands::import_file,
                    mock_commands::get_all_files,
                    mock_commands::get_files_by_category,
                    mock_commands::clear_memory,
                    mock_commands::store_file,

                    // Chat AI
                    mock_commands::chat_generate,
                    mock_commands::upload_and_process_file,
                    mock_commands::chat_send_message,
                    mock_commands::chat_get_providers_status,
                    mock_commands::chat_check_providers,
                    mock_commands::chat_create_conversation,
                    mock_commands::chat_get_conversation,
                    mock_commands::chat_delete_conversation,
                    mock_commands::chat_set_gemini_key,
                    mock_commands::chat_stream_message,
                ]
            }
        }
    };
}
