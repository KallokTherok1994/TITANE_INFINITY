/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v30.0.0 - Frontend Security Module
 * Type guards, validation, anti-injection, command whitelist
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { invoke } from '@tauri-apps/api/core';
import { safeInvokeTauri } from '@/utils/tauriProtector';

import { createLogger } from '@/utils/logger';

const logger = createLogger('Security');

type MonitoringBridge = {
  trackRequest: () => void;
  addBreadcrumb: (message: string, category?: string, data?: unknown) => void;
  trackPipelineError: () => void;
  trackPipelineLatency: (latency: number) => void;
  trackError: (error: unknown, context?: unknown) => void;
};

const noopMonitoring: MonitoringBridge = {
  trackRequest: () => {},
  addBreadcrumb: () => {},
  trackPipelineError: () => {},
  trackPipelineLatency: () => {},
  trackError: () => {},
};

let monitoringBridge: MonitoringBridge = noopMonitoring;

void import('@/monitoring')
  .then(mod => {
    const candidate = (mod.monitoring ?? mod.default) as MonitoringBridge | undefined;
    if (candidate) {
      monitoringBridge = candidate;
    }
  })
  .catch((err: unknown) => {
    logger.debug('Optional monitoring module unavailable', { error: String(err) });
  });

const monitoring: MonitoringBridge = {
  trackRequest: () => monitoringBridge.trackRequest(),
  addBreadcrumb: (message, category, data) =>
    monitoringBridge.addBreadcrumb(message, category, data),
  trackPipelineError: () => monitoringBridge.trackPipelineError(),
  trackPipelineLatency: latency => monitoringBridge.trackPipelineLatency(latency),
  trackError: (error, context) => monitoringBridge.trackError(error, context),
};

// ────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────

/**
 * Commandes qui retournent void/null (Unit en Rust → null en JS)
 * Ces commandes sont valides même avec une réponse null/undefined
 * ✅ AJOUTÉ v19.3 pour support Audio/TTS
 */
export const VOID_COMMANDS = new Set<string>([
  // Audio/TTS commands that return () in Rust
  'tts_speak',
  'tts_stop',
  'stop_speaking',
  'pause_speaking',
  'calibrate_titane_voice',
  'resume_speaking',
  'set_audio_output_device',
  'set_audio_input_device',
  'vad_reset',
  'vad_configure',
  // Overdrive Voice Engine commands
  'voice_stop_speaking',
  'voice_cancel_recording',
  'voice_stop_listening',
  // Audio Streaming commands that return ()
  'audio_stop_streaming',
  'audio_force_stop',
  // Recording commands that return ()
  'cancel_recording',
  'stop_recording',
  // Memory commands that return ()
  'memory_delete_entry',
  'memory_clear_all',
  'memory_prune',
  'memory_delete',
  'clear_memory',
  'clear_logs',
  'clear_all_memory',
  'memory_clear',
  // Session commands
  'session_end',
  'end_session',
  // State save commands
  'state_save',
  'experience_update_state',
  'singularity_save_state',
  'singularity_reset',
  // Persistence commands that return ()
  'titan_persist_event',
  'titan_force_snapshot',
  'titan_force_snapshot_current',
  'titan_persistence_init',
  'titan_persistence_shutdown',
  // Logging commands that return ()
  'log_to_file',
  'clear_system_logs',
  'clear_event_stream',
  // Whisper commands that return ()
  'stop_whisper_streaming',
  'send_audio_chunk',
  // Self-heal persistence/sync
  'selfheal_save_profile',
  'selfheal_sync_with_singularity',
  // Config commands that return ()
  'save_ui_theme',
  'delete_config_preset',
  // Multi-IA commands that return ()
  'multi_ai_set_fallback',
  'multi_ai_configure_keys',
  'multi_ai_clear_cache',
  // Evolution commands that return ()
  'sync_evolution_state',
  // Devtools commands that return ()
  'devtools_enable',
  'devtools_disable',
  'devtools_debug_clear',
  'engine_reset',
  // Self-healing commands that return ()
  'autoheal_reset',
  'autoheal_reset_cognitive',
  'autoheal_init_cognitive',
  'autoheal_reset_adaptive',
  'autoheal_clear_narrative',
  'autoheal_init_narrative',
  'autoheal_clear_tts_queue',
  'autoheal_init_tts',
  'autoheal_resync_lipsync',
  'autoheal_rebuild_memory_index',
  'autoheal_validate_memory',
  'autoheal_stop_pipeline',
  'autoheal_clear_pipeline',
  'autoheal_start_pipeline',
  'autoheal_resync_state',
  // AutoFix compat commands that return ()
  'autofix_reset',
  'autofix_rust_warning',
  'autofix_typescript_error',
  'autofix_reset_state',
  'autofix_restart_pipeline',
  'autofix_restart_tauri_command',
  'autofix_resync_lipsync',
  'autofix_add_mutex',
  // CrashGuard commands that return ()
  'crashguard_clear_memory',
  'crashguard_kill_thread',
  'crashguard_restart_module',
  'crashguard_emergency_shutdown',
  'crashguard_reset_pipeline',
  'crashguard_emergency_rollback',
  // Performance commands that return ()
  'performance_throttle_cpu',
  'performance_optimize_gpu',
  'performance_reduce_render_quality',
  'performance_compress_memory',
  'performance_reset_optimizations',
  // Pipeline commands that return ()
  'pipeline_pause',
  'pipeline_resume',
  'pipeline_reset',
  // Window commands that return () (v30.1.0 audit)
  'window_set_fullscreen',
  'window_set_zoom',
  'window_zoom_reset',
  // Recording commands that return () (v30.1.0 audit)
  'start_recording',
  // Chat error reporting (v30.1.0 audit)
  'report_chat_error',
]);

/**
 * Commandes qui peuvent retourner null (Option<T> côté Rust → null en JS)
 * Ces commandes sont valides même avec une réponse null/undefined
 */
export const NULLABLE_COMMANDS = new Set<string>([
  // Persistence
  'titan_load_state',
  // UI theme
  'load_ui_theme',
  'reset_ui_theme',
  // Memory / Vector store
  'memory_get_entry',
  'vector_store_get',
  // Audio Transcription (can be empty or fail)
  'transcribe_audio_file',
]);

/**
 * Whitelist des commandes Tauri autorisées
 * DOIT correspondre à commands/security.rs côté Rust
 * ✅ SYNCHRONISÉ v16.2.2+ (27 nov 2025)
 *
 * ── IPC Risk-Tiering (Rule A2 — 2026-04-27) ─────────────────────
 * Tier 1 — Read-only, zero side effect: get_*, health_*, ping_*, status_*
 *           Safe for remote gateway. No autoheal gate required.
 * Tier 2 — Write, local impact: save_*, write_*, store_*, create_*, update_*, set_*
 *           Autoheal validation recommended before execution in remote context.
 * Tier 3 — Ring 0 critical, irreversible or network/vault/FS: remote_key_*,
 *           total_dev_*, engines_devmode_*, dev_apply_patch, dev_run_command,
 *           window_set_fullscreen, secure_store_*, delete_secret, clear_memory
 *           Requires explicit user approval gate in governed sessions.
 *           Never exposed via remote gateway without explicit scope annotation.
 * ────────────────────────────────────────────────────────────────
 */
export const ALLOWED_COMMANDS = new Set<string>([
  // ═══════════════════════════════════════════════════════════════
  // HELIOS - System Monitoring
  // ═══════════════════════════════════════════════════════════════
  'get_helios_state',
  'get_system_health',
  'get_helios_metrics',
  'get_system_info',

  // ═══════════════════════════════════════════════════════════════
  // MEMORY - Storage & Timeline
  // ═══════════════════════════════════════════════════════════════
  'get_memory_state',
  'memory_get_state',
  'write_snapshot',
  'read_snapshot',
  'write_log',
  'read_logs',
  'add_timeline_event',
  'get_timeline',
  'get_active_projects',
  'get_recent_decisions',
  'get_knowledge',
  'get_active_rituals',
  'save_chat_interaction',
  'memory_save_chat_interaction',
  'memory_get_active_projects',
  'memory_get_recent_decisions',
  'memory_get_knowledge',
  'memory_get_active_rituals',
  'memory_get_timeline',
  'memory_ingest_file',
  'hybrid_memory_publish_governed_report',
  'import_file',
  'get_all_files',
  'get_files_by_category',
  'clear_memory',
  'store_file',
  // Memory OS (init/shutdown/management)
  'memory_init',
  'memory_shutdown',
  'memory_is_running',
  'memory_version',
  // Memory OS store/recall
  'memory_os_store',
  'memory_os_store_batch',
  'memory_recall_by_id',
  'memory_recall_keyword',
  'memory_recall_semantic',
  'memory_recall_recent',
  'memory_recall_by_type',
  'memory_recall_by_tag',
  'memory_os_delete',
  'memory_consolidate',
  'memory_forget',
  'memory_stats',
  'memory_snapshot',
  'memory_stm_snapshot',
  'memory_mtm_snapshot',
  'memory_ltm_snapshot',
  'memory_signal_stats',
  'memory_stm_entries',
  'memory_mtm_entries',
  'memory_all_tags',

  // Legacy Memory commands (compatibilité < v17)
  // NOTE: memory_save_entry → remplacé par memory_store
  // NOTE: memory_get_entry → remplacé par memory_retrieve (quand implémenté)
  'memory_save_entry',
  'memory_get_entry',
  'memory_delete_entry',
  'memory_clear_all',
  'memory_search',
  'memory_export',

  // ═══════════════════════════════════════════════════════════════
  // MEMORY ENGINE (Overdrive)
  // ═══════════════════════════════════════════════════════════════
  'memory_store',
  'memory_store_conversation',
  'memory_get_related',
  'memory_get_all_keys',
  'memory_rebuild_index',
  'memory_get_stats',
  'memory_prune',
  'memory_delete',
  'memory_import',
  'check_online_capabilities',
  'read_production_week1_csv',

  // ═══════════════════════════════════════════════════════════════
  // MEMORY EVOLUTION ENGINE++
  // ═══════════════════════════════════════════════════════════════
  'memory_evolution_status',
  'memory_evolve_full',
  'memory_get_clusters',
  'memory_hierarchy_health',

  // Memory Engine v∞ (Super Prompt #3)
  'memory_retrieve',
  'memory_update',
  'memory_search_semantic',
  'memory_compress',
  'memory_promote',
  'memory_archive',
  'memory_health',
  'memory_maintenance',
  'context_save',
  'context_restore',
  'context_clear',

  // Persistent Memory (frontend hooks)
  'persistent_memory_read',
  'persistent_memory_get_bundles',
  'persistent_memory_get_context',
  'persistent_memory_get_stats',
  'persistent_memory_write_entry',
  'persistent_memory_create_summary',
  'persistent_memory_create_bundle',
  'persistent_memory_add_to_bundle',
  'persistent_memory_promote_entry',
  'persistent_memory_archive_entry',
  'persistent_memory_delete_entry',
  'persistent_memory_export',
  'security_audit_sync_journal',
  'security_audit_publish_signed_export',

  // ═══════════════════════════════════════════════════════════════
  // AI / CHAT COMMANDS
  // ═══════════════════════════════════════════════════════════════
  'ai_send_prompt',
  'ai_get_response',
  'ai_set_model',
  'ai_get_available_models',
  'query_ai',
  'get_ai_status',
  'test_gemini',
  'test_ollama',
  'ping_gemini',
  'ping_ollama',
  'ollama_query', // ✅ v∞ Direct Ollama query
  'ollama_generate', // ✅ Unified Ollama IPC command
  'chat_generate',
  'upload_and_process_file',

  // Chat Orchestrator (v18+)
  'chat_get_providers_status',
  'chat_check_providers',
  'chat_create_conversation',
  'chat_get_conversation',
  'chat_delete_conversation',
  'create_conversation',
  'list_conversations',
  'load_conversation',
  'chat_set_gemini_key',
  'chat_stream_message',
  'chat_mode_change', // ✅ v30.0.0 — Chat mode switching
  'chat_mode_sync', // ✅ v30.0.0 — Chat mode sync
  'chat_generate_suggestions', // ✅ v∞ Suggestions IA
  // Multi-IA Orchestrator Commands (v28.0)
  'multi_ai_generate',
  'multi_ai_generate_dual',
  'multi_ai_generate_fused',
  'multi_ai_providers',
  'multi_ai_best_provider',
  'multi_ai_evaluate',
  'multi_ai_set_fallback',
  'multi_ai_configure_keys',
  'multi_ai_cache_stats',
  'multi_ai_clear_cache',
  'report_chat_error', // ✅ v30.1.0 — Error reporting (void command)
  'generate_response',
  'stream_response',
  'speak_text',
  'save_memory',
  'load_memory',
  'reset_memory',
  'health_check',
  // Control Panel (secure)
  'cp_get_ai_config',
  'cp_set_ai_config',
  'cp_get_design_config',
  'cp_set_design_config',
  'cp_get_modules_status',
  'cp_toggle_module',
  'cp_get_network_config',
  'cp_set_network_config',
  'cp_get_security_config',
  'cp_set_security_config',
  'cp_check_for_updates',
  'cp_install_update',

  // ═══════════════════════════════════════════════════════════════
  // VOICE / TTS / ASR (v∞ PRODUCTION)
  // ═══════════════════════════════════════════════════════════════
  'speak',
  'stop_speaking',
  'is_speaking',
  'pause_speaking',
  'resume_speaking',
  'start_recording',
  'stop_recording',
  'cancel_recording',
  'is_recording',
  'get_recording_status',
  'transcribe_audio',
  'transcribe_audio_file', // ✅ NEW: Whisper-based file transcription

  // ═══════════════════════════════════════════════════════════════
  // AUDIO CENTER (v19.2+)
  // ═══════════════════════════════════════════════════════════════
  'tts_speak',
  'tts_stop',
  'test_tts',
  'get_audio_output_devices',
  'get_audio_input_devices',
  'set_audio_output_device',
  'set_audio_input_device',
  'test_microphone',
  // Note: update_*_settings commands removed - settings stored locally

  // ═══════════════════════════════════════════════════════════════
  // SINGULARITY STATE
  // ═══════════════════════════════════════════════════════════════
  'singularity_get_state',
  'singularity_get_full_state',
  'singularity_get_physical',
  'singularity_get_cognitive',
  'singularity_get_symbolic',
  'singularity_get_adaptive',
  'singularity_get_meta',
  'singularity_get_global_coherence',
  'singularity_is_critical',
  'get_singularity_state',
  'sync_singularity',
  'singularity_update_metric',
  'singularity_reset',
  'update_singularity_state',
  'singularity_self_check',

  // Singularity Mutation Commands (v16.2.2+)
  'singularity_update_physical',
  'singularity_update_cognitive',
  'singularity_update_symbolic',
  'singularity_update_adaptive',
  'singularity_update_meta',
  'singularity_update_full_state',
  'singularity_save_state',
  'singularity_load_state',

  // SINGULARITY v∞/v30 Unified State Commands
  'singularity_get',
  'singularity_set',
  'singularity_diff',
  'singularity_hash',
  'singularity_sync',
  'singularity_meta',
  'singularity_integrity',
  'singularity_repair',
  'singularity_export_json',
  'singularity_snapshot',
  'singularity_selftest_full',

  // ═══════════════════════════════════════════════════════════════
  // NEXUS - Validation
  // ═══════════════════════════════════════════════════════════════
  'validate_nexus',
  'get_nexus_graph',

  // ═══════════════════════════════════════════════════════════════
  // XP & EXPERIENCE SYSTEM (v24)
  // ═══════════════════════════════════════════════════════════════
  'xp_add',
  'xp_get_level',
  'xp_get_total',
  'xp_get_state',
  'experience_get_state',
  'exp_get_global_state',
  'exp_get_categories',
  'exp_get_projects',
  'exp_get_project_stats',
  'exp_get_talents',
  'exp_get_timeline',
  'exp_get_timeline_stats',
  'exp_add_knowledge',
  'experience_update_state',

  // ═══════════════════════════════════════════════════════════════
  // COGNITIVE LAYER
  // ═══════════════════════════════════════════════════════════════
  'cognitive_analyze',
  'cognitive_get_insights',
  'get_cognitive_state',
  'update_cognitive_mode',

  // ═══════════════════════════════════════════════════════════════
  // ORCHESTRATION CENTER (Stats/Dev)
  // ═══════════════════════════════════════════════════════════════
  'orchestration_get_cognitive_state',
  'orchestration_get_unified_state',

  // ═══════════════════════════════════════════════════════════════
  // QA MONITORING (Dev)
  // ═══════════════════════════════════════════════════════════════
  'qa_get_state',
  'qa_get_system_metrics',
  'qa_list_test_suites',
  'qa_list_alerts',
  'qa_run_test_suite',
  'qa_acknowledge_alert',

  // ═══════════════════════════════════════════════════════════════
  // ONE CORE (Dev)
  // ═══════════════════════════════════════════════════════════════
  'one_core_get_state',
  'one_core_get_metrics',
  'one_core_list_commands',
  'one_core_get_event_history',
  'one_core_execute_command',
  'one_core_run_diagnostic',
  'one_core_force_sync',
  'one_core_cleanup',

  // ═══════════════════════════════════════════════════════════════
  // DEVTOOLS & LOGS
  // ═══════════════════════════════════════════════════════════════
  'get_logs',
  'clear_logs',

  // ═══════════════════════════════════════════════════════════════
  // DEVOPS (v19)
  // ═══════════════════════════════════════════════════════════════
  'devops_run',
  'devops_stats',

  // ═══════════════════════════════════════════════════════════════
  // TOTAL_DEV — GOD DEV Governed Space (v30.0.0) [TIER 3 — privileged execution]
  // ═══════════════════════════════════════════════════════════════
  'total_dev_unlock',
  'total_dev_session_status',
  'total_dev_revoke',
  'total_dev_git_op',
  'total_dev_run_command',
  'total_dev_read_file',

  // ═══════════════════════════════════════════════════════════════
  // SECURE COMMANDS (v∞)
  // ═══════════════════════════════════════════════════════════════
  'secure_import_file',
  'secure_read_file',
  'secure_list_files',
  'secure_delete_file',
  'get_gemini_key_status',
  'get_openai_key_status',
  'get_anthropic_key_status',
  'get_copilot_key_status',
  'chat_set_openai_key',
  'chat_set_anthropic_key',
  'get_ia_policies',
  'get_permission_matrix',
  'get_security_log',
  'secure_store_secret',
  'get_secrets_status',
  'has_secret',
  'delete_secret',
  'get_permission_audit',
  'validate_chat_message',
  'check_system_integrity',

  // ═══════════════════════════════════════════════════════════════
  // STATE & SESSION
  // ═══════════════════════════════════════════════════════════════
  'state_get',
  'state_save',
  'get_system_state',
  'get_module_health',
  'session_start',
  'session_end',
  'session_get_current',
  'start_session',
  'end_session',
  'get_session_info',

  // ═══════════════════════════════════════════════════════════════
  // SECURITY & HARDENING
  // ═══════════════════════════════════════════════════════════════
  'run_hardening_selftest',

  // ═══════════════════════════════════════════════════════════════
  // VAD (Voice Activity Detection) v∞
  // ═══════════════════════════════════════════════════════════════
  'vad_get_state',
  'vad_process_frame',
  'vad_configure',
  'vad_reset',
  'vad_test',

  // ═══════════════════════════════════════════════════════════════
  // OVERDRIVE VOICE ENGINE v∞.OPUS-DIAG
  // ═══════════════════════════════════════════════════════════════
  'voice_start_listening',
  'voice_stop_listening',
  'voice_transcribe_audio',
  'voice_detect_wake_word',
  'voice_play_audio',
  'voice_stop_speaking',
  'voice_get_config',
  'voice_update_config',
  'voice_get_status',
  'voice_calibrate_microphone',
  'voice_cancel_recording',
  'voice_is_recording',
  'voice_enable_duplex',
  'voice_disable_duplex',
  'voice_check_interruption',
  'voice_test_pipeline',
  'voice_get_available_models',
  'calibrate_titane_voice', // ✅ v30.0.0 — TITANE voice calibration
  'check_is_titane_speaking', // ✅ v30.0.0 — TITANE voice fingerprinting check (anti-feedback)
  'get_titane_voice_status', // ✅ v30.0.0 — TITANE voice status for fingerprint calibration
  'audio_capture_start', // ✅ v30.0.0 — Audio capture pipeline
  'audio_capture_stop',
  'audio_capture_status',
  'audio_capture_get_chunk',
  'audio_capture_export_wav',
  'audio_list_devices', // ✅ v30.0.0 — List audio input/output devices
  'tts_generate_test_buffer', // ✅ v30.0.0 — TTS test buffer generation
  'start_streaming', // ✅ v30.0.0 — Audio streaming pipeline
  'stop_streaming',
  'get_streaming_state',
  'get_streaming_stats',
  'force_stop_streaming',
  'check_elevenlabs_available', // ✅ v30.0.0 — TTS engine availability checks
  'check_local_tts',
  'synthesize_speech', // ✅ v30.0.0 — TTS synthesis backend

  // ═══════════════════════════════════════════════════════════════
  // PERSISTENCE ENGINE v∞.MPE
  // ═══════════════════════════════════════════════════════════════
  'titan_persist_event',
  'titan_force_snapshot',
  'titan_force_snapshot_current',
  'titan_load_state',
  'titan_get_events_since',
  'titan_list_snapshots',
  'titan_recover_state',
  'titan_get_persistence_status',
  'titan_verify_integrity',
  'titan_get_last_snapshot',

  // ═══════════════════════════════════════════════════════════════
  // SYSTEM CENTER / CLUSTER (v∞.Ω QA)
  // ═══════════════════════════════════════════════════════════════
  'sc_run_quick_diagnostics',
  'sc_run_full_diagnostics',
  'sc_get_diagnostic_status',
  'sc_get_cluster_status',
  'sc_get_cluster_peers',
  'sc_get_logs',
  'sc_get_log_stats',
  'sc_hypervision_get_state',
  'sc_hypervision_get_metrics',
  'sc_hypervision_get_layers',
  'sc_hypervision_get_anomalies',
  'sc_hypervision_start',
  'sc_initialize_cluster',
  'sc_shutdown_cluster',

  // ═══════════════════════════════════════════════════════════════
  // RUNTIME & CONFIG (v∞.Ω QA)
  // ═══════════════════════════════════════════════════════════════
  'get_runtime_config',

  // ═══════════════════════════════════════════════════════════════
  // ENGINE CORE (v∞.Ω QA)
  // ═══════════════════════════════════════════════════════════════
  'engine_init',
  'engine_tick',
  'engine_stop',
  'meta_mode_reset',

  // ═══════════════════════════════════════════════════════════════
  // QA & AUTOFIX (v∞.Ω QA)
  // ═══════════════════════════════════════════════════════════════
  'qa_run_all',
  'qa_run_module',
  'qa_get_last_report',
  'autofix_detect_rust_warnings',
  'autofix_detect_typescript_errors',
  'autofix_detect_react_hook_violations',
  'autofix_detect_invalid_states',
  'autofix_fix_issue',
  'autofix_fix_all',
  'autofix_get_history',
  'autofix_get_stats',
  'autofix_reset',
  'autofix_rust_warning',
  'autofix_typescript_error',
  'autofix_reset_state',
  'autofix_restart_pipeline',
  'autofix_restart_tauri_command',
  'autofix_resync_lipsync',
  'autofix_add_mutex',

  // AutoHeal (vΩ)
  'autoheal_detect_broken',
  'autoheal_detect_broken_modules',
  'autoheal_reset_cognitive',
  'autoheal_init_cognitive',
  'autoheal_reset_adaptive',
  'autoheal_clear_narrative',
  'autoheal_init_narrative',
  'autoheal_clear_tts_queue',
  'autoheal_init_tts',
  'autoheal_resync_lipsync',
  'autoheal_rebuild_memory_index',
  'autoheal_validate_memory',
  'autoheal_stop_pipeline',
  'autoheal_clear_pipeline',
  'autoheal_start_pipeline',
  'autoheal_heal_cognitive_module',
  'autoheal_heal_tts_module',
  'autoheal_heal_lipsync_module',
  'autoheal_heal_memory_module',
  'autoheal_heal_pipeline',
  'autoheal_resync_state',
  'autoheal_get_history',
  'autoheal_reset',

  // ═══════════════════════════════════════════════════════════════
  // PERSONA & NARRATIVE (v∞.Ω QA)
  // ═══════════════════════════════════════════════════════════════
  'persona_initialize',
  'persona_get_state',
  'persona_update',
  'persona_react',
  'persona_reset',
  'persona_get_multipliers',
  'narrative_generate',
  'narrative_get_style',
  'narrative_set_style',
  'narrative_get_identity',
  'narrative_evolve',
  'narrative_get_archetype',
  'narrative_set_archetype',

  // ═══════════════════════════════════════════════════════════════
  // ADAPTIVE (v∞.Ω QA)
  // ═══════════════════════════════════════════════════════════════
  'adaptive_get_profile',
  'adaptive_set_mode',
  'adaptive_learn',
  'adaptive_run_optimization',
  'adaptive_get_history',
  'adaptive_capture_sample',
  'adaptive_get_summary',

  // ═══════════════════════════════════════════════════════════════
  // PERFORMANCE OPTIMIZER (v∞.Ω HARDENING)
  // ═══════════════════════════════════════════════════════════════
  'performance_get_metrics',
  'performance_throttle_cpu',
  'performance_optimize_gpu',
  'performance_reduce_render_quality',
  'performance_compress_memory',
  'performance_reset_optimizations',

  // ═══════════════════════════════════════════════════════════════
  // AUTONOMY ENGINE (v∞.Ω HARDENING)
  // ═══════════════════════════════════════════════════════════════
  'autonomy_scan_backend',
  'autonomy_fix_states',
  'autonomy_heal_modules',
  'autonomy_optimize_performance',
  'autonomy_evolve_ia',
  'autonomy_test_ia_coherence',
  'autonomy_ping',
  'autonomy_shield_state',
  'autonomy_analyse_logs',
  'autonomy_log_report',
  'autonomy_scan_ia',
  'autonomy_scan_tts',
  'autonomy_scan_memory',
  'autonomy_scan_singularity_state',
  'autonomy_fix_tts_sync',
  'autonomy_resync_singularity_state',
  'autonomy_clean_memory',

  // ═══════════════════════════════════════════════════════════════
  // OMNIS AUTO-HEAL (v∞.Ω HARDENING)
  // ═══════════════════════════════════════════════════════════════
  'get_system_health',
  'memory_repair',
  'system_optimize',
  // Admin Engine state aggregator commands (v30.1.0 — previously required skipWhitelistCheck)
  'get_admin_vitals',
  'get_module_statuses',
  'get_performance_anomalies',
  'get_healing_anomalies',
  'get_system_mode',
  // Legacy commands kept for auto-heal compatibility
  'memory_save_entry',
  'memory_get_entry',
  'memory_delete_entry',

  // ═══════════════════════════════════════════════════════════════
  // SELF-HEALING SYNC LAYER (v∞.Ω HARDENING)
  // ═══════════════════════════════════════════════════════════════
  'selfheal_get_vitals',
  'selfheal_load_profile',
  'selfheal_save_profile',
  'selfheal_sync_with_singularity',

  // Self-Heal executor actions (frontend compat)
  'selfheal_restart_module',
  'selfheal_clear_cache',
  'selfheal_regenerate_config',
  'selfheal_repair_json',
  'selfheal_rebuild_memory',
  'selfheal_switch_provider',
  'selfheal_reset_state',
  'selfheal_restart_worker',
  'selfheal_restart_process',
  'selfheal_sync_state',
  'selfheal_mini_audit',
  'selfheal_isolate_module',

  // ═══════════════════════════════════════════════════════════════
  // CONTEXT OPTIMIZER (v24.30)
  // ═══════════════════════════════════════════════════════════════
  'context_compress',
  'context_semantic_grouping',
  'context_selective_injection',
  'context_remove_noise',
  'context_gating',
  'context_link_conversations',

  // ═══════════════════════════════════════════════════════════════
  // VISUAL DEVOPS ENGINE (v30.0.0)
  // ═══════════════════════════════════════════════════════════════
  'visual_devops_analyze_screen',
  'visual_devops_detect_elements',
  'visual_devops_extract_code',
  'visual_devops_generate_fix',
  'visual_devops_generate_script',
  'visual_devops_validate_script',
  'visual_devops_start_session',
  'visual_devops_save_session',
  'visual_devops_load_session',
  'visual_devops_get_report',
  'visual_devops_get_stats',

  // ═══════════════════════════════════════════════════════════════
  // SINGULARITY FUSION ENGINE (v24)
  // ═══════════════════════════════════════════════════════════════
  'singularity_fusion_cycle',
  'singularity_fusion_get_state',
  'singularity_fusion_report_bottleneck',
  'singularity_fusion_sync_media',
  'fusion_analyze_intention',
  'fusion_activate_modules',
  'fusion_configure_style',
  'fusion_generate_ia_response',
  'fusion_adjust_styles',
  'fusion_update_state',
  'fusion_prepare_tts',
  'fusion_process_lipsync',
  'fusion_auto_optimize',
  'fusion_sync_state',
  'fusion_report_bottleneck',

  // ═══════════════════════════════════════════════════════════════
  // COGNITIVE OPTIMIZATION ENGINE (v24)
  // ═══════════════════════════════════════════════════════════════
  'cognitive_analyze_intention',
  'cognitive_check_coherence',
  'cognitive_auto_correct',
  'cognitive_auto_correct_response',
  'cognitive_compress_context',
  'cognitive_optimize_context',
  'cognitive_memory_gating',
  'cognitive_cluster_semantic',
  'cognitive_cluster_messages',
  'cognitive_inject_selective',
  'cognitive_mini_reasoning',
  'cognitive_maintain_continuity',
  'cognitive_narrative_continuity',
  'cognitive_prioritize_steps',

  // ═══════════════════════════════════════════════════════════════
  // SINGULARITY AUTONOMY ENGINE (v24)
  // ═══════════════════════════════════════════════════════════════
  'singularity_autonomy_scan',
  'singularity_autonomy_fix',
  'singularity_autonomy_heal',
  'singularity_autonomy_optimize',
  'singularity_autonomy_evolve',
  'singularity_autonomy_test',
  'singularity_autonomy_shield',
  'singularity_autonomy_analyse',

  // ═══════════════════════════════════════════════════════════════
  // AUTOMATION + XP ENGINE (vΩ∞)
  // ═══════════════════════════════════════════════════════════════
  'xp_sync_state',
  'xp_add_points',
  'xp_get_state',
  'xp_check_level',
  'automation_execute_action',
  'automation_get_list',
  'automation_create',
  'automation_update',
  'automation_delete',
  'automation_trigger',
  'achievement_unlock',
  'achievement_check',
  'daily_reward_claim',

  // ═══════════════════════════════════════════════════════════════
  // REALTIME EXECUTION ENGINE (v24)
  // ═══════════════════════════════════════════════════════════════
  'realtime_stream_tts',
  'realtime_execute_pipeline',
  'realtime_send_network',
  'realtime_network_task',

  // ═══════════════════════════════════════════════════════════════
  // NUMERIC TWIN ENGINE (vΩ∞)
  // ═══════════════════════════════════════════════════════════════
  'twin_get_state',
  'twin_get_fusion_index',
  'twin_submit_observation',
  'twin_apply_evolution',
  'twin_validate_sync',
  'twin_get_evolution_profile',
  'twin_get_identity',
  'twin_recalculate_fusion',

  // ═══════════════════════════════════════════════════════════════
  // ENGINES DEVMODE (v∞.Ω - Kevin Only) [TIER 3 — live patch, requires approval gate]
  // ═══════════════════════════════════════════════════════════════
  'engines_devmode_get_state',
  'engines_devmode_enable',
  'engines_devmode_disable',
  'engines_devmode_validate_patch',
  'engines_devmode_apply_patch',
  'engines_devmode_preview',
  'engines_devmode_rollback',
  'engines_devmode_get_history',
  'engines_devmode_create_backup',
  'engines_devmode_restore_backup',
  'engines_devmode_analyze_file',
  'engines_devmode_changelog',

  // ═══════════════════════════════════════════════════════════════
  // ENGINES MONITORING (v∞.Ω)
  // ═══════════════════════════════════════════════════════════════
  'engines_monitoring_get_metrics',
  'engines_monitoring_get_alerts',
  'engines_monitoring_get_anomalies',
  'engines_monitoring_get_health',
  'engines_monitoring_get_history',
  'engines_monitoring_get_dashboard',
  'engines_monitoring_reset_alerts',

  // ═══════════════════════════════════════════════════════════════
  // ENGINES BUILD PIPELINE (v∞.Ω)
  // ═══════════════════════════════════════════════════════════════
  'engines_build_start',
  'engines_build_get_status',
  'engines_build_get_result',
  'engines_build_cancel',
  'engines_build_clean',
  'engines_get_dashboard',

  // ═══════════════════════════════════════════════════════════════
  // EVOLUTION ENGINE (v∞.Ω)
  // ═══════════════════════════════════════════════════════════════
  'evolution_run_cycle',
  'evolution_get_stats',
  'evolution_get_state',
  'evolution_start',
  'evolution_stop',
  'evolution_get_scores',
  'evolution_update_score',
  'evolution_generate_report',
  'evolution_add_data_point',
  'evolution_get_data_points',
  'evolution_get_patterns',
  'evolution_get_insights',
  'evolution_get_suggestions',
  'evolution_approve_suggestion',
  'evolution_reject_suggestion',
  'evolution_create_action',

  // v30.0.0 — Evolution persistence and data submission
  'evolution_save_state',
  'submit_evolution_data',

  // ═══════════════════════════════════════════════════════════════
  // KNOWLEDGE VAULT (v30.0.0)
  // ═══════════════════════════════════════════════════════════════
  'knowledge_ingest',
  'knowledge_base_runtime_snapshot',
  'knowledge_save_state',

  // ═══════════════════════════════════════════════════════════════
  // AGENDA / TIME CENTER (v30.0.0)
  // ═══════════════════════════════════════════════════════════════
  'agenda_save_event',
  'agenda_save_events',
  'agenda_delete_event',
  'agenda_sync',

  // ═══════════════════════════════════════════════════════════════
  // PROGRESSION / XP (v30.0.0)
  // ═══════════════════════════════════════════════════════════════
  'progression_save_state',

  // ═══════════════════════════════════════════════════════════════
  // META & ORCHESTRATION (v24.4+)
  // ═══════════════════════════════════════════════════════════════
  'meta_get_state',
  'meta_get_alignment',
  'meta_get_report',
  'meta_get_monitoring_metrics',
  'meta_selftest_all',
  'meta_trigger_sync',
  'orchestrator_set_mode',
  'orchestrator_run_cycle',

  // ═══════════════════════════════════════════════════════════════
  // IDENTITY CENTER (v24.4+)
  // ═══════════════════════════════════════════════════════════════
  'identity_list_voice_profiles',
  'identity_get_active_voice_profile',
  'identity_set_active_voice_profile',
  'identity_set_mode',
  'identity_set_voice_profile',
  'identity_enable_rule',
  'identity_disable_rule',
  'identity_set_matrix',

  // ═══════════════════════════════════════════════════════════════
  // REALITY CENTER (v24.4+)
  // ═══════════════════════════════════════════════════════════════
  'reality_set_render_config',
  'reality_toggle_physics',
  'reality_add_entity',

  // ═══════════════════════════════════════════════════════════════
  // HYPER CENTER (v24.4+)
  // ═══════════════════════════════════════════════════════════════
  'hyper_set_mode',

  // ═══════════════════════════════════════════════════════════════
  // NEXUS & SENTINEL (v24.4+)
  // ═══════════════════════════════════════════════════════════════
  'nexus_get_graph',
  'sentinel_get_alerts',
  'harmonia_get_flows',

  // ═══════════════════════════════════════════════════════════════
  // CONFIG HUB (v24.4+)
  // ═══════════════════════════════════════════════════════════════
  'get_all_configs',
  'get_audio_device_config',
  'save_audio_device_config',
  'get_chat_engine_config',
  'get_chat_request_defaults',
  'export_config',
  'export_docx_file',
  'import_config',
  'list_config_presets',
  'update_runtime_config',
  'update_chat_engine_config',
  'set_chat_engine_config',
  'set_chat_request_defaults',
  'set_chat_profile',
  'save_config_preset',
  'load_config_preset',
  'delete_config_preset',
  'save_ui_theme',
  // Phase 1 — Remote Named API Keys [TIER 3 — vault/auth mutation, approval gate required]
  'remote_key_create',
  'remote_key_list',
  'remote_key_revoke',
  'remote_key_rotate',

  // ═══════════════════════════════════════════════════════════════
  // SYSTEM & DIAGNOSTIC (v24.4+)
  // ═══════════════════════════════════════════════════════════════
  'get_system_status',
  'system_get_status',
  'clear_system_logs',
  'clear_event_stream',
  'restart_cores',
  'ping',
  'check_sqlite_available',
  'toggle_safe_mode',
  'engine_reset',

  // ═══════════════════════════════════════════════════════════════
  // SINGULARITY EXTENDED (v24.4+)
  // ═══════════════════════════════════════════════════════════════
  'singularity_check_coherence',
  'singularity_check_integrity',
  'singularity_get_diagnostics',
  'singularity_get_metrics',
  'singularity_get_fusion_state',
  'singularity_create_snapshot',
  'singularity_restore_snapshot',
  'singularity_perform_sync',
  'titan_state_get',
  'titan_persistence_init',
  'titan_persistence_shutdown',

  // ═══════════════════════════════════════════════════════════════
  // MEMORY EXTENDED (v24.4+)
  // ═══════════════════════════════════════════════════════════════
  'memory_parse',
  'memory_synthesize',
  'memory_cluster',
  'memory_extract_patterns',
  'memory_check_and_repair',
  'memory_grow',
  'memory_create_backup',
  'memory_scan',
  'memory_demote',
  'parse_document',
  'detect_file_format',

  // ═══════════════════════════════════════════════════════════════
  // CONVERSATIONS (v24.4+)
  // ═══════════════════════════════════════════════════════════════
  'delete_conversation',

  // ═══════════════════════════════════════════════════════════════
  // OMEGA CONVERSATION ENGINE (v30.0.0)
  // Pipeline de conversation 12 étapes - Cerveau IA TITANE
  // ═══════════════════════════════════════════════════════════════
  'create_new_conversation',
  'conversation_process_message',
  'conversation_generate',
  'conversation_health_check',
  'conversation_memory_stats',
  'conversation_french_postprocess',
  'conversation_realism_process',
  'conversation_emotional_process',
  'conversation_behavioral_check',

  // ═══════════════════════════════════════════════════════════════
  // LITERARY ENGINE (v30.0.0)
  // Moteur littéraire OMEGA pour style et ton
  // ═══════════════════════════════════════════════════════════════
  'literary_engine_process',
  'literary_engine_update_style',
  'literary_engine_get_style_profile',

  // ═══════════════════════════════════════════════════════════════
  // ANTHOLOGY ENGINE (v30.0.0)
  // Intégration anthologie et ADN littéraire
  // ═══════════════════════════════════════════════════════════════
  'anthology_integrate_text',
  'anthology_get_literary_dna',
  'anthology_search_by_tag',
  'anthology_search_by_layer',
  'anthology_get_top_lexical_fields',
  'anthology_get_statistics',

  // ═══════════════════════════════════════════════════════════════
  // VECTOR STORE (v24.4+)
  // ═══════════════════════════════════════════════════════════════
  'vector_store_init',
  'vector_store_insert',
  'vector_store_update',
  'vector_store_delete',
  'vector_store_get',
  'vector_store_search',
  'vector_store_stats',
  'vector_store_get_stats', // Alias for vector_store_stats

  // ═══════════════════════════════════════════════════════════════
  // WHISPER STREAMING (v24.4+)
  // ═══════════════════════════════════════════════════════════════
  'start_whisper_streaming',
  'stop_whisper_streaming',
  'send_audio_chunk',

  // ═══════════════════════════════════════════════════════════════
  // AI EXTENDED (v24.4+)
  // ═══════════════════════════════════════════════════════════════
  'ai_check_ollama_status',
  'ai_generate_local_stream',
  'cognitive_get_map',

  // ═══════════════════════════════════════════════════════════════
  // PIPELINE (v24.4+)
  // ═══════════════════════════════════════════════════════════════
  'pipeline_analyze_intention',
  'pipeline_generate_cognitive_response',
  'pipeline_prepare_tts',
  'pipeline_get_stats',
  'pipeline_validate',

  // ═══════════════════════════════════════════════════════════════
  // FUSION ENGINE (v24.4+)
  // ═══════════════════════════════════════════════════════════════
  'fusion_sync',
  'fusion_merge',

  // ═══════════════════════════════════════════════════════════════
  // CLOUD CENTER (v24.4+)
  // ═══════════════════════════════════════════════════════════════
  'cloud_remove_device',
  'cloud_restore_vault',
  'cloud_update_config',

  // ═══════════════════════════════════════════════════════════════
  // DEVTOOLS (v24.4+)
  // ═══════════════════════════════════════════════════════════════
  'devtools_enable',
  'devtools_disable',
  'devtools_debug_clear',
  'camera_start',
  'fs_exists',
  'read_json_file',

  // ═══════════════════════════════════════════════════════════════
  // DEV SUDO (v24.4+) [TIER 3 — arbitrary FS/command execution]
  // ═══════════════════════════════════════════════════════════════
  'dev_inspect_file',
  'dev_apply_patch', // TIER 3
  'dev_run_command', // TIER 3
  'dev_get_logs',
  'hybrid_analyze_code',

  // ═══════════════════════════════════════════════════════════════
  // SELF-HEALING EXTENDED (v24.4+)
  // ═══════════════════════════════════════════════════════════════
  'self_healing_trigger',
  'confirm_self_healing_action',
  'reject_self_healing_action',
  'autoheal_detect_broken_modules',
  'autoheal_heal_cognitive_module',
  'autoheal_resync_state',
  'autoheal_get_history',
  'autoheal_reset',

  // ═══════════════════════════════════════════════════════════════
  // CRASHGUARD (v24.4+)
  // ═══════════════════════════════════════════════════════════════
  'crashguard_detect_threats',
  'crashguard_get_active_threats',
  'crashguard_get_stats',
  'crashguard_clear_memory',
  'crashguard_kill_thread',
  'crashguard_restart_module',
  'crashguard_emergency_shutdown',
  'crashguard_reset_pipeline',
  'crashguard_emergency_rollback',

  // ═══════════════════════════════════════════════════════════════
  // SECURITY EXTENDED (v24.4+)
  // ═══════════════════════════════════════════════════════════════
  'secure_store_key',

  // ═══════════════════════════════════════════════════════════════
  // STATE & PERSISTENCE (v24.4+)
  // ═══════════════════════════════════════════════════════════════
  'get_state',
  'set_state',
  'delete_state',

  // ═══════════════════════════════════════════════════════════════
  // LOGGING (v24.4+)
  // ═══════════════════════════════════════════════════════════════
  'log_to_file',
  'log_entries',

  // ═══════════════════════════════════════════════════════════════
  // EVOLUTION SYNC (v24.4+)
  // ═══════════════════════════════════════════════════════════════
  'sync_evolution_state',

  // ═══════════════════════════════════════════════════════════════
  // WINDOW CONTROLS (v30.0.0+)
  // Zoom + Fullscreen (CTRL+Scroll, F11, F12)
  // ═══════════════════════════════════════════════════════════════
  'window_get_zoom',
  'window_set_zoom',
  'window_zoom_in',
  'window_zoom_out',
  'window_zoom_reset',
  'window_toggle_fullscreen',
  'window_set_fullscreen',
  'window_is_fullscreen',

  // ═══════════════════════════════════════════════════════════════
  // WEB RESEARCH ENGINE (P1.0 EXPERIMENTAL)
  // ═══════════════════════════════════════════════════════════════
  'web_research',

  // ═══════════════════════════════════════════════════════════════
  // CYCLE ENGINE COMMANDS — V32 Phase 5 (SP#16 Rythmes Cognitifs)
  // ═══════════════════════════════════════════════════════════════
  'cycle_get_state',
  'cycle_get_rhythm',
  'cycle_get_load_params',
  'cycle_predict_events',
  'cycle_suggest_optimal_time',
  'cycle_get_alignment',
  'cycle_get_diagnostics',

  // ═══════════════════════════════════════════════════════════════
  // MULTIMODAL ENGINE COMMANDS — V32 Phase 7 (SP#21 Vision+Audio)
  // ═══════════════════════════════════════════════════════════════
  'analyze_image',
  'analyze_image_path',
  'embed_image',
  'embed_text',
  'switch_vision_model',
  'analyze_audio',
  'store_image',
  'search_similar_images',
  'search_images_by_text',
  'get_all_images',
  'search_images_by_tags',
  'remove_image',
  'clear_image_memory',
  'fuse_multimodal',
  'get_multimodal_stats',
  'update_multimodal_config',
]);

/**
 * Patterns d'injection détectés (aligné avec ai/security.rs)
 */
const INJECTION_PATTERNS = [
  /<script/gi,
  /javascript:/gi,
  /eval\s*\(/gi,
  /__proto__/gi,
  /constructor\s*\[/gi,
  /\$\{/g,
  /exec\s*\(/gi,
  /system\s*\(/gi,
  /\.\.\//g,
];

// Chat/orchestrator commands are intentionally permissive so TITANE can
// interpret rich user prompts and let the orchestrator enforce limits.
const CHAT_OPEN_COMMANDS = new Set<string>([
  'conversation_generate',
  'conversation_process_message',
  'create_new_conversation',
  'chat_check_providers',
  'chat_set_gemini_key',
  'chat_set_openai_key',
  'chat_set_anthropic_key',
]);

function readViteEnvNumber(key: string, fallback: number): number {
  try {
    const raw = (import.meta as unknown as { env?: Record<string, string | undefined> })
      .env?.[key];
    if (!raw) return fallback;
    const num = Number(raw);
    return Number.isFinite(num) && num > 0 ? num : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Taille maximale des payloads
 * Par défaut 25 MB (aligné avec le backend sandbox MAX_FILE_SIZE)
 */
const MAX_PAYLOAD_SIZE =
  readViteEnvNumber('VITE_TITANE_SECURITY_MAX_PAYLOAD_MB', 50) * 1024 * 1024;

// Legacy metric retained for compatibility with existing security stats schema.
const DEFAULT_TIMEOUT_MS = 0;

/**
 * Cache pour détecter les boucles infinies
 */
interface CallTracker {
  count: number;
  firstCall: number;
  lastCall: number;
}

const callTracking = new Map<string, CallTracker>();

// On-demand cleanup (no background interval by default)
let lastCallTrackingCleanupAt = 0;
const CALL_TRACKING_CLEANUP_THROTTLE_MS = 5000;

function maybeCleanupCallTracking(now: number): void {
  if (now - lastCallTrackingCleanupAt < CALL_TRACKING_CLEANUP_THROTTLE_MS) return;
  lastCallTrackingCleanupAt = now;
  cleanupCallTracking();
}

// ═══════════════════════════════════════════════════════════════
// v30.0.0 - LOCAL NETWORK SECURITY MODE
// Pour réseau domestique sécurisé privé - restrictions réduites
// ═══════════════════════════════════════════════════════════════

export interface LocalNetworkSecurityConfig {
  enabled: boolean;
  maxCallsPerSecond: number;
  trackingWindowMs: number;
  skipInjectionCheckForLocalCmds: boolean;
  trustedCommands: Set<string>;
}

let localNetworkMode: LocalNetworkSecurityConfig = {
  enabled: false,
  maxCallsPerSecond: 50,
  trackingWindowMs: 1000,
  skipInjectionCheckForLocalCmds: true,
  trustedCommands: new Set([
    'conversation_process_message',
    'conversation_generate',
    // [RETRAIT v27.0.5-prod] Legacy chat command removed from trusted list (use conversation_generate)
    'chat_stream_message',
    'memory_get_state',
    'memory_store',
    'get_system_health',
    'singularity_get_state',
    'tts_speak',
  ]),
};

/**
 * Activer le mode réseau local sécurisé
 */
export function enableLocalNetworkMode(
  config?: Partial<LocalNetworkSecurityConfig>
): void {
  localNetworkMode = { ...localNetworkMode, enabled: true, ...(config || {}) };
  logger.info('[Security] 🏠 Mode réseau local activé');
}

/**
 * Désactiver le mode réseau local
 */
export function disableLocalNetworkMode(): void {
  localNetworkMode.enabled = false;
  logger.info('[Security] 🔒 Mode réseau local désactivé');
}

/**
 * Obtenir la configuration du mode local
 */
export function getLocalNetworkConfig(): LocalNetworkSecurityConfig {
  return { ...localNetworkMode };
}

const BASE_MAX_CALLS_PER_SECOND = readViteEnvNumber(
  'VITE_TITANE_SECURITY_MAX_CALLS_PER_SECOND',
  120
);
const BASE_TRACKING_WINDOW_MS = readViteEnvNumber(
  'VITE_TITANE_SECURITY_TRACKING_WINDOW_MS',
  1000
);

const getMaxCallsPerSecond = () =>
  localNetworkMode.enabled
    ? localNetworkMode.maxCallsPerSecond
    : BASE_MAX_CALLS_PER_SECOND;
const getTrackingWindowMs = () =>
  localNetworkMode.enabled ? localNetworkMode.trackingWindowMs : BASE_TRACKING_WINDOW_MS;

const MAX_CALLS_PER_SECOND = BASE_MAX_CALLS_PER_SECOND;
const TRACKING_WINDOW_MS = BASE_TRACKING_WINDOW_MS;

const TEST_ONLY_COMMANDS = new Set<string>(['test_command', 'get_projects']);
const isTestEnvironment =
  (typeof process !== 'undefined' && Boolean(process.env?.VITEST_WORKER_ID)) ||
  (typeof globalThis !== 'undefined' &&
    Boolean((globalThis as { __vitest_worker__?: unknown }).__vitest_worker__));

// ────────────────────────────────────────────────────────────────
// Types & Interfaces
// ────────────────────────────────────────────────────────────────

export interface SecureInvokeOptions {
  /** Conservé pour compatibilité (non utilisé) */
  timeout?: number;
  /** Désactiver validation anti-injection (défaut: false) */
  skipInjectionCheck?: boolean;
  /** Désactiver validation whitelist (défaut: false) */
  skipWhitelistCheck?: boolean;
  /** Désactiver anti-loop protection (défaut: false) */
  skipLoopCheck?: boolean;
  /** Considérer une réponse de fallback comme une erreur (défaut: false) */
  treatFallbackAsError?: boolean;
}

export interface CommandValidationResult {
  valid: boolean;
  errors: string[];
}

export interface HardeningTestResult {
  name: string;
  passed: boolean;
  details: string;
}

export interface HardeningReport {
  tests: HardeningTestResult[];
  pass_rate: number;
  timestamp: string;
}

// ────────────────────────────────────────────────────────────────
// Validation Functions
// ────────────────────────────────────────────────────────────────

/**
 * Valider qu'une commande est dans la whitelist
 */
export function validateCommand(command: string): CommandValidationResult {
  const errors: string[] = [];

  if (!command || typeof command !== 'string') {
    errors.push('Command must be a non-empty string');
    return { valid: false, errors };
  }

  // Désactiver whitelist en mode test si variable d'environnement est définie
  if (isTestEnvironment && import.meta.env?.VITE_DISABLE_SECURITY_IN_TESTS === 'true') {
    return { valid: true, errors: [] };
  }

  if (!ALLOWED_COMMANDS.has(command)) {
    if (isTestEnvironment && TEST_ONLY_COMMANDS.has(command)) {
      return { valid: true, errors: [] };
    }
    errors.push(
      `Command "${command}" is not in whitelist. Allowed: ${Array.from(ALLOWED_COMMANDS).join(', ')}`
    );
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

/**
 * Détecter les tentatives d'injection dans le payload
 */
export function detectInjection(
  payload: Record<string, unknown>
): CommandValidationResult {
  const errors: string[] = [];

  // Convertir payload en JSON pour analyse
  const jsonString = JSON.stringify(payload);

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(jsonString)) {
      errors.push(`Injection pattern detected: ${pattern.source}`);
      // Reset lastIndex pour regex globales
      pattern.lastIndex = 0;
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Valider la taille du payload
 */
export function validatePayloadSize(
  payload: Record<string, unknown>
): CommandValidationResult {
  const errors: string[] = [];
  const jsonString = JSON.stringify(payload);
  const sizeBytes = new Blob([jsonString]).size;

  if (sizeBytes > MAX_PAYLOAD_SIZE) {
    errors.push(`Payload too large: ${sizeBytes} bytes (max: ${MAX_PAYLOAD_SIZE} bytes)`);
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

/**
 * Détecter les boucles infinies (trop d'appels rapides)
 */
export function detectInfiniteLoop(command: string): CommandValidationResult {
  const now = Date.now();
  const key = command;
  const trackingWindowMs = getTrackingWindowMs();

  // Keep cache bounded without background polling.
  maybeCleanupCallTracking(now);

  if (!callTracking.has(key)) {
    callTracking.set(key, {
      count: 1,
      firstCall: now,
      lastCall: now,
    });
    return { valid: true, errors: [] };
  }

  const tracker = callTracking.get(key);
  if (!tracker) {
    // Shouldn't happen but handle gracefully
    callTracking.set(key, {
      count: 1,
      firstCall: now,
      lastCall: now,
    });
    return { valid: true, errors: [] };
  }

  // Reset si fenêtre expirée
  if (now - tracker.firstCall > trackingWindowMs) {
    callTracking.set(key, {
      count: 1,
      firstCall: now,
      lastCall: now,
    });
    return { valid: true, errors: [] };
  }

  // Incrémenter compteur
  tracker.count += 1;
  tracker.lastCall = now;

  // Vérifier dépassement - utilise le mode local si actif
  const maxCalls = getMaxCallsPerSecond();
  const effectiveMax =
    localNetworkMode.enabled && localNetworkMode.trustedCommands.has(command)
      ? maxCalls * 2
      : maxCalls;

  if (tracker.count > effectiveMax) {
    const errors = [
      `Infinite loop detected: "${command}" called ${tracker.count} times in ${trackingWindowMs}ms (max: ${effectiveMax})`,
    ];
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

/**
 * Nettoyer le cache de tracking (à appeler périodiquement)
 */
export function cleanupCallTracking(): void {
  const now = Date.now();
  const trackingWindowMs = getTrackingWindowMs();
  for (const [key, tracker] of callTracking.entries()) {
    if (now - tracker.lastCall > trackingWindowMs * 5) {
      callTracking.delete(key);
    }
  }
}

// ─────────────────────────────────────────────────────────────────
// Cleanup automatique toutes les 5 secondes (v24.20: with cleanup)
// ─────────────────────────────────────────────────────────────────

let callTrackingIntervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Démarrer le cleanup call tracking (appelé automatiquement)
 */
function _startCallTrackingCleanup() {
  if (callTrackingIntervalId !== null) return; // Already running

  callTrackingIntervalId = setInterval(cleanupCallTracking, 5000);
  logger.info('[Security] Call tracking cleanup activé (5s)');
}

/**
 * Arrêter le cleanup call tracking (cleanup)
 */
export function stopCallTrackingCleanup() {
  if (callTrackingIntervalId !== null) {
    clearInterval(callTrackingIntervalId);
    callTrackingIntervalId = null;
    logger.info('[Security] Call tracking cleanup désactivé');
  }
}

// Démarrer cleanup si dans le navigateur
// NOTE: Intentionally not auto-started (silent-by-default in production/Tauri).

// ────────────────────────────────────────────────────────────────
// Type Guards
// ────────────────────────────────────────────────────────────────

/**
 * Type guard pour vérifier qu'un objet est un Record<string, unknown>
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard pour HardeningReport
 */
export function isHardeningReport(value: unknown): value is HardeningReport {
  if (!isRecord(value)) return false;

  const hasTests =
    Array.isArray(value.tests) &&
    value.tests.every(
      test =>
        isRecord(test) &&
        typeof test.name === 'string' &&
        typeof test.passed === 'boolean' &&
        typeof test.details === 'string'
    );

  const hasPassRate = typeof value.pass_rate === 'number';
  const hasTimestamp = typeof value.timestamp === 'string';

  return hasTests && hasPassRate && hasTimestamp;
}

/**
 * Type guard pour tableau de strings
 */
export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

/**
 * Type guard pour valider qu'une réponse Tauri est valide
 */
export function isValidTauriResponse<T>(
  value: unknown,
  validator?: (val: unknown) => val is T
): value is T {
  if (value === null || value === undefined) {
    return false;
  }

  // Si validator personnalisé fourni
  if (validator) {
    return validator(value);
  }

  // Validation générique (non-null, non-undefined)
  return true;
}

// ────────────────────────────────────────────────────────────────
// Secure Response Validation
// ────────────────────────────────────────────────────────────────

/**
 * Valider une réponse Tauri avec type guard optionnel
 */
export function validateResponse<T>(
  response: unknown,
  validator?: (val: unknown) => val is T
): CommandValidationResult & { data?: T } {
  const errors: string[] = [];

  // Si validator personnalisé fourni, l'utiliser (peut accepter null)
  if (validator) {
    if (!validator(response)) {
      errors.push('Response failed custom validation');
      return { valid: false, errors };
    }
    return {
      valid: true,
      errors: [],
      data: response as T,
    };
  }

  // Validation générique : accepter objets valides, rejeter null/undefined
  if (response === null || response === undefined) {
    errors.push('Response is null or undefined');
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: response as T,
  };
}

/**
 * Sanitizer générique pour supprimer les propriétés dangereuses
 */
export function sanitizeResponse<T>(response: T): T {
  if (typeof response !== 'object' || response === null) {
    return response;
  }

  // Supprimer __proto__ et constructor
  const sanitized = JSON.parse(JSON.stringify(response));

  if ('__proto__' in sanitized) {
    delete sanitized.__proto__;
  }
  if ('constructor' in sanitized) {
    delete sanitized.constructor;
  }

  return sanitized;
}

// ────────────────────────────────────────────────────────────────
// Secure Invoke Wrapper
// ────────────────────────────────────────────────────────────────

/**
 * Wrapper sécurisé pour invoke Tauri
 *
 * Protections:
 * - ✅ Command whitelist validation
 * - ✅ Injection pattern detection
 * - ✅ Payload size validation
 * - ✅ Infinite loop detection
 * - ✅ Command, payload and response validation
 * - ✅ Response validation with type guards
 *
 * @example
 * ```ts
 * // Simple call
 * const state = await secureInvoke<MemoryState>('memory_get_state');
 *
 * // With payload
 * await secureInvoke('memory_save_entry', {
 *   key: 'test',
 *   value: 'data'
 * });
 *
 * // With custom validator
 * const report = await secureInvoke<HardeningReport>(
 *   'run_hardening_selftest',
 *   {},
 *   {},
 *   isHardeningReport
 * );
 * ```
 */
function normalizeInvokeError(command: string, error: unknown): Error {
  const err = error instanceof Error ? error : new Error(String(error));
  const isAbort = err.name === 'AbortError' || /aborted/i.test(err.message);
  const isTimeout = /timeout after|Timeout after/i.test(err.message);

  if (isTimeout) {
    const timeoutError = new Error(`IPC timeout for ${command}`);
    timeoutError.name = 'IPC_TIMEOUT';
    return timeoutError;
  }

  if (!isAbort) {
    return err;
  }

  const normalized = new Error('Invoke aborted');
  const isOllamaCommand =
    command.includes('ollama') || command === 'conversation_generate';
  normalized.name = isOllamaCommand ? 'OLLAMA_ABORTED' : 'TAURI_ABORTED';
  return normalized;
}

export async function secureInvoke<T>(
  command: string,
  payload: Record<string, unknown> = {},
  options: SecureInvokeOptions = {},
  validator?: (val: unknown) => val is T
): Promise<T> {
  const {
    timeout: _timeout,
    skipInjectionCheck = false,
    skipWhitelistCheck = false,
    skipLoopCheck = false,
    treatFallbackAsError = false,
  } = options;

  const isChatOpenCommand = CHAT_OPEN_COMMANDS.has(command);

  const shouldSkipWhitelistCheck = skipWhitelistCheck || isChatOpenCommand;

  const shouldSkipInjectionCheck =
    skipInjectionCheck ||
    isChatOpenCommand ||
    (localNetworkMode.enabled &&
      localNetworkMode.skipInjectionCheckForLocalCmds &&
      localNetworkMode.trustedCommands.has(command));

  const shouldSkipLoopCheck = skipLoopCheck || isChatOpenCommand;

  const startedAt = Date.now();
  const invokeId = `${startedAt}-${Math.random().toString(36).slice(2, 10)}`;
  logger.info(`IPC:START ${command} ${invokeId}`);
  try {
    monitoring.trackRequest();
    monitoring.addBreadcrumb('secureInvoke start', 'tauri', {
      command,
      hasPayload: payload && Object.keys(payload).length > 0,
      payloadKeysCount: payload ? Object.keys(payload).length : 0,
    });
  } catch {
    // ignore monitoring errors
  }

  // [1] Validation commande whitelist
  if (!shouldSkipWhitelistCheck) {
    const cmdValidation = validateCommand(command);
    if (!cmdValidation.valid) {
      const errorMsg = `Security: ${cmdValidation.errors.join('; ')}`;
      logger.error(`[Security] ✗ ${errorMsg}`);

      try {
        monitoring.trackError(new Error(errorMsg), {
          command,
          stage: 'validateCommand',
        });
      } catch {
        // ignore monitoring errors
      }

      throw new Error(errorMsg);
    }
  }

  // [2] Détection injection
  if (!shouldSkipInjectionCheck) {
    const injectionCheck = detectInjection(payload);
    if (!injectionCheck.valid) {
      const errorMsg = `Security: ${injectionCheck.errors.join('; ')}`;
      logger.error(`[Security] ✗ ${errorMsg}`);

      try {
        monitoring.trackError(new Error(errorMsg), {
          command,
          stage: 'detectInjection',
        });
      } catch {
        // ignore monitoring errors
      }

      throw new Error(errorMsg);
    }
  }

  // [3] Validation taille payload
  const sizeCheck = validatePayloadSize(payload);
  if (!sizeCheck.valid) {
    const errorMsg = `Security: ${sizeCheck.errors.join('; ')}`;
    logger.error(`[Security] ✗ ${errorMsg}`);

    try {
      monitoring.trackError(new Error(errorMsg), {
        command,
        stage: 'validatePayloadSize',
      });
    } catch {
      // ignore monitoring errors
    }

    throw new Error(errorMsg);
  }

  // [4] Détection boucle infinie
  if (!shouldSkipLoopCheck) {
    const loopCheck = detectInfiniteLoop(command);
    if (!loopCheck.valid) {
      const errorMsg = `Security: ${loopCheck.errors.join('; ')}`;
      logger.error(`[Security] ✗ ${errorMsg}`);

      try {
        monitoring.trackError(new Error(errorMsg), {
          command,
          stage: 'detectInfiniteLoop',
        });
      } catch {
        // ignore monitoring errors
      }

      throw new Error(errorMsg);
    }
  }

  // [5] Invoke
  try {
    const isTestEnv =
      (typeof process !== 'undefined' && Boolean(process.env?.VITEST_WORKER_ID)) ||
      (typeof globalThis !== 'undefined' &&
        Boolean((globalThis as { __vitest_worker__?: unknown }).__vitest_worker__));

    let response: unknown;
    if (isTestEnv) {
      // En environnement de test, utiliser directement le module statique.
      response = await invoke<T>(command, payload);
    } else {
      response = await safeInvokeTauri<T>(command, payload);
    }

    // [6] Validation réponse - avec support des commandes void
    const isVoidCommand = VOID_COMMANDS.has(command);

    // Pour les commandes nullable, null/undefined est une réponse valide
    if (NULLABLE_COMMANDS.has(command) && (response === null || response === undefined)) {
      return (response ?? null) as T;
    }

    // Pour les commandes void, null/undefined est une réponse valide
    if (isVoidCommand && (response === null || response === undefined)) {
      // Commande void réussie - retourner un objet vide typé ou null
      return (response ?? null) as T;
    }

    const responseValidation = validateResponse<T>(response, validator);
    if (!responseValidation.valid) {
      const errorMsg = `Response validation failed: ${responseValidation.errors.join('; ')}`;
      logger.error(`[Security] ✗ ${errorMsg}`);
      throw new Error(errorMsg);
    }

    // [7] Sanitization
    if (
      (responseValidation.data === null || responseValidation.data === undefined) &&
      !isVoidCommand &&
      !validator
    ) {
      throw new Error('Response validation succeeded but data is null/undefined');
    }
    const sanitized = sanitizeResponse(responseValidation.data);

    if (sanitized === undefined) {
      throw new Error('Sanitized response is undefined');
    }

    // Si configuré, considérer explicitement les fallbacks comme des erreurs pour permettre les retries
    if (
      treatFallbackAsError &&
      sanitized !== null &&
      typeof sanitized === 'object' &&
      'fallback' in (sanitized as Record<string, unknown>) &&
      (sanitized as Record<string, unknown>).fallback === true
    ) {
      throw new Error('Fallback response received');
    }

    try {
      monitoring.addBreadcrumb('secureInvoke success', 'tauri', {
        command,
        latencyMs: Date.now() - startedAt,
      });
    } catch {
      // ignore monitoring errors
    }

    logger.info(`IPC:END ${command} ${invokeId} ok`);
    return sanitized as T;
  } catch (error) {
    const normalized = normalizeInvokeError(command, error);
    if (normalized.name === 'IPC_TIMEOUT') {
      logger.info(`IPC:TIMEOUT ${command} ${invokeId}`);
    }
    logger.info(`IPC:END ${command} ${invokeId} error`);
    logger.error(`[Security] ✗ secureInvoke("${command}") failed:`, normalized.message);

    try {
      monitoring.trackError(normalized, {
        command,
        stage: 'invoke',
        latencyMs: Date.now() - startedAt,
      });
    } catch {
      // ignore monitoring errors
    }

    throw normalized;
  }
}

// ────────────────────────────────────────────────────────────────
// Security Testing
// ────────────────────────────────────────────────────────────────

/**
 * Appeler le self-test backend de sécurité
 * Retourne le rapport de hardening avec type safety
 */
export async function runSecuritySelfTest(): Promise<HardeningReport> {
  const report = await secureInvoke<HardeningReport>(
    'run_hardening_selftest',
    {},
    {},
    isHardeningReport
  );

  logger.info(`[Security Self-Test] Pass rate: ${(report.pass_rate * 100).toFixed(1)}%`);
  logger.table(
    report.tests.map(t => ({
      Test: t.name,
      Status: t.passed ? '✅ PASS' : '❌ FAIL',
      Details: t.details,
    }))
  );

  return report;
}

/**
 * Exporter les statistiques de sécurité frontend
 */
export function getSecurityStats() {
  return {
    tracked_commands: callTracking.size,
    allowed_commands: ALLOWED_COMMANDS.size,
    tracking_window_ms: TRACKING_WINDOW_MS,
    max_calls_per_second: MAX_CALLS_PER_SECOND,
    max_payload_size_bytes: MAX_PAYLOAD_SIZE,
    default_timeout_ms: DEFAULT_TIMEOUT_MS,
  };
}

// ═══════════════════════════════════════════════════════════════
// v19.0 PHASE 2: AI SECURITY MODULES
// ═══════════════════════════════════════════════════════════════
// NOTE: AI security modules (AIInputSanitizer, AIResponseValidator, AIRateLimiter)
// are not yet implemented. Remove these exports when modules are created.
