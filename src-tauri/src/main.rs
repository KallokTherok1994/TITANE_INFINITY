// TITANE_INFINITY v30.0.0 — Proprietary License
// © 2025-2026 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v30.0.0 — MAIN ENTRY POINT (Singularity Architecture)
//   Tests 93.0% Production Ready + UI Enhanced + COPILOT-XS Compliant
//   20 Engines Unified + OMEGA Pipeline + Production Ready
// ═══════════════════════════════════════════════════════════════

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![allow(dead_code)]
#![allow(deprecated)] // Migration to conversation_engine::conversation_generate in progress

// ═══════════════════════════════════════════════════════════════
// TITANE∞ HARDENING: Import Hygiene v19.5.2
// DO NOT REMOVE: Each import is actively used in production code
// ═══════════════════════════════════════════════════════════════

// Tauri core (Manager trait required for .path() and .get_webview_window())
// Required for both app_data_dir access and DevTools auto-open
use tauri::{Listener, Manager};

// TITANE∞ command modules
use std::process::{Command as ProcessCommand, Stdio};
use std::sync::Arc;

// EXP Fusion Engine (used by frontend XP/EXP UI)
use crate::commands::exp_fusion::ExpFusionState;

#[cfg(all(not(feature = "mock"), feature = "full"))]
use titane_infinity::chat_engine;

// mock_commands — generate_response mock stub (feature = "mock")
#[cfg(feature = "mock")]
use titane_infinity::mock_commands;

// OMEGA Conversation Engine v19.5.2
use titane_infinity::conversation_engine;

// ═══════════════════════════════════════════════════════════════
// TITANE∞ NEW COMMANDS v21.5.3 - BACKEND REBUILD
// ═══════════════════════════════════════════════════════════════
mod commands_v21 {
    pub mod governance_commands {
        include!("commands/governance_commands.rs");
    }
    pub mod system_center_commands {
        include!("commands/system_center_commands.rs");
    }
    pub mod memory_os_commands {
        include!("commands/memory_os_commands.rs");
    }
    pub mod devtools_commands {
        include!("commands/devtools_commands.rs");
    }
    pub mod whisper_commands {
        include!("commands/whisper_commands.rs");
    }
    // audio_config_commands removed - duplicates audio::commands
    pub mod persistent_memory_commands {
        include!("commands/persistent_memory_commands.rs");
    }
    pub mod ui_theme_commands {
        include!("commands/ui_theme_commands.rs");
    }
    pub mod self_healing_commands {
        include!("commands/self_healing_commands.rs");
    }
    pub mod singularity_commands {
        include!("commands/singularity_commands.rs");
    }
    pub mod window_controls_commands {
        include!("commands/window_controls_commands.rs");
    }
}

// ✅ AUTOFIX(memory-chat): Persistent Memory v19.2Ω — full 3-level pipeline
// Previously orphaned; provides persistent_memory_read/get_stats/get_context/write_entry/etc.
mod persistent_memory_v19 {
    include!("commands/persistent_memory.rs");
}

mod memory_system_commands {
    include!("commands/memory_system_commands.rs");
}

// Auto-Evolution Engine API — run_evolution, get_evolution_state, quick_health_check
mod engine_evolution_commands {
    include!("commands/engine_evolution_commands.rs");
}

// Evolution Engine v∞ commands (evolution_get_state, evolution_start/stop, etc.)
mod evolution_engine_commands {
    include!("evolution/evolution_commands.rs");
}

// Persona Engine commands (persona_get_state, persona_react, etc.)
// full: real PersonaEngine; mock/default: lightweight stubs
#[cfg(all(not(feature = "mock"), feature = "full"))]
mod persona_commands {
    pub use titane_infinity::system::persona_engine::commands::*;
}

#[cfg(any(feature = "mock", not(feature = "full")))]
mod persona_commands {
    use std::sync::Mutex;
    use tauri::State;
    #[derive(Default)]
    pub struct PersonaEngine;
    pub type PersonaMutex = Mutex<PersonaEngine>;
    #[tauri::command]
    pub async fn persona_get_state(
        _engine: State<'_, PersonaMutex>,
    ) -> Result<serde_json::Value, String> {
        Ok(serde_json::json!({}))
    }
    #[tauri::command]
    pub async fn persona_get_multipliers(
        _engine: State<'_, PersonaMutex>,
    ) -> Result<serde_json::Value, String> {
        Ok(serde_json::json!({}))
    }
    #[tauri::command]
    pub async fn persona_react(
        _engine: State<'_, PersonaMutex>,
        _event: String,
    ) -> Result<serde_json::Value, String> {
        Ok(serde_json::json!({}))
    }
    #[tauri::command]
    pub async fn persona_update(
        _engine: State<'_, PersonaMutex>,
        _data: serde_json::Value,
    ) -> Result<(), String> {
        Ok(())
    }
    #[tauri::command]
    pub async fn persona_reset(_engine: State<'_, PersonaMutex>) -> Result<(), String> {
        Ok(())
    }
}

// Agenda commands (agenda_load_events, agenda_save_events, agenda_delete_event)
// Available in all builds (no feature gating on agenda module)
mod agenda_commands {
    pub use titane_infinity::agenda::commands::*;
}

// Orchestration Center commands (OPUS #5/6/7)
mod orchestration_center_commands {
    include!("commands/orchestration_center.rs");
}

// QA Monitoring Center commands (OPUS #7)
mod qa_monitoring_commands {
    include!("commands/qa_monitoring.rs");
}

// ONE CORE commands (OPUS #6)
mod one_core_commands {
    include!("commands/one_core.rs");
}

// Coherence Engine commands v20.0 (Phase 2 Fusion #1)
mod coherence_commands {
    include!("commands/coherence_commands.rs");
}

// Unified Memory commands v20.0 (Phase 2 Fusion #2)
mod unified_memory_commands {
    include!("commands/unified_memory_commands.rs");
}

// System Health commands v20.0 (Phase 2 Fusion #3)
mod system_health_commands {
    include!("commands/system_health_commands.rs");
}

// DevOps commands (module local) — desktop-only (hardcoded workspace path)
#[cfg(not(target_os = "android"))]
mod devops_commands {
    include!("commands/devops.rs");
}

// Diagnostic commands v27 (Internet + Providers check)
mod diagnostic_commands {
    include!("commands/diagnostic_commands.rs");
}
// P1: WebResearch Engine (EXPERIMENTAL)
mod web_research_commands {
    include!("commands/web_research.rs");
}
mod audio {
    // Audio types are used directly in audio/*.rs modules via titane_infinity::audio
    #[cfg(feature = "audio-capture")]
    pub use titane_infinity::audio::{AudioConfig, AudioError, AudioResult};

    pub mod capture {
        include!("audio/capture.rs");
    }
    pub mod recording_engine {
        include!("audio/recording_engine.rs");
    }
    pub mod commands {
        include!("audio/commands.rs");

        #[cfg(feature = "mock")]
        #[tauri::command]
        pub async fn speak(
            _text: String,
            _config: Option<serde_json::Value>,
            _use_online: Option<bool>,
        ) -> Result<(), String> {
            Ok(())
        }

        #[cfg(feature = "mock")]
        #[tauri::command]
        pub async fn start_recording(_config: Option<serde_json::Value>) -> Result<String, String> {
            Ok("mock-recording-id".to_string())
        }

        #[cfg(feature = "mock")]
        #[tauri::command]
        pub async fn stop_recording() -> Result<serde_json::Value, String> {
            Ok(serde_json::json!({
                "transcript": "",
                "confidence": 0.0,
                "duration": 0.0,
                "filePath": null,
                "error": "mock-mode",
            }))
        }

        #[cfg(feature = "mock")]
        #[tauri::command]
        pub async fn cancel_recording() -> Result<(), String> {
            Ok(())
        }

        // AUDIO_VOICE_FORENSIC 2026-03-15 — FIX-001: mock stubs for stop_speaking + is_speaking
        // Handler exists in audio/commands.rs but was missing from mock block → IPC error in mock mode
        #[cfg(feature = "mock")]
        #[tauri::command]
        pub async fn stop_speaking() -> Result<(), String> {
            Ok(())
        }

        #[cfg(feature = "mock")]
        #[tauri::command]
        pub async fn is_speaking() -> Result<bool, String> {
            Ok(false)
        }

        #[cfg(feature = "mock")]
        #[tauri::command]
        pub async fn pause_speaking() -> Result<(), String> {
            Ok(())
        }

        #[cfg(feature = "mock")]
        #[tauri::command]
        pub async fn resume_speaking() -> Result<(), String> {
            Ok(())
        }

        // AUDIO_VOICE_FORENSIC 2026-03-15 — FIX-002: mock stubs for transcribe_audio + is_recording
        // Added to generate_handler! in c59e9b5 without corresponding mock stubs → BUILD_RISK
        #[cfg(feature = "mock")]
        #[tauri::command]
        pub async fn transcribe_audio(_audio_data: Vec<u8>) -> Result<String, String> {
            Ok("(mock-transcription)".to_string())
        }

        #[cfg(feature = "mock")]
        #[tauri::command]
        pub async fn is_recording() -> Result<bool, String> {
            Ok(false)
        }

        // AUDIO_VOICE_FORENSIC 2026-03-15 — FIX-003: mock stub for get_recording_status
        // Called in audioSelfHeal.ts, handler exists, missing from capabilities + generate_handler (Q-002)
        #[cfg(feature = "mock")]
        #[tauri::command]
        pub async fn get_recording_status() -> Result<serde_json::Value, String> {
            Ok(serde_json::json!({ "isRecording": false, "durationMs": 0 }))
        }
    }
}

// Secure Commands v∞ (Super-Prompts H, I, J, K) - API Key Management
mod secure_commands {
    include!("secure_commands.rs");
}

// Runtime Config Bridge v∞ (Frontend configuration without secrets)
mod runtime_config {
    include!("runtime_config.rs");
}

// Chat Generate Commands v21 Phase 1 - Provider-specific AI generation
mod commands {
    pub mod chat_generate_commands {
        include!("commands/chat_generate_commands.rs");
    }

    pub mod db_commands {
        include!("commands/db_commands.rs");
    }

    // EXP Fusion Engine commands (XP/EXP UI)
    pub mod exp_fusion {
        include!("commands/exp_fusion.rs");
    }

    // ✨ v26.3: GitHub Copilot provider commands
    pub mod copilot_commands {
        include!("commands/copilot_commands.rs");
    }

    // ✅ R11: Stub commands — fill IPC gaps for frontend-called commands with no real backend
    pub mod stub_commands {
        include!("commands/stub_commands.rs");
    }

    // ✅ AUDIT FIX #1: Unified Ollama provider command
    pub mod ollama_command {
        include!("commands/ollama_command.rs");
    }

    // ✨ TOTAL_DEV v29.0.0 — GOD DEV secure space (unlock, git, console, file)
    pub mod total_dev_commands {
        include!("commands/total_dev_commands.rs");
    }

    pub mod http_commands {
        include!("commands/http_commands.rs");
    }
}

// Legacy AI/Engine/Memory command bridge.
// In full backend mode we forward to the library commands.
// In mock/not-full builds we expose lightweight stubs to keep IPC symbols resolvable.
#[cfg(all(not(feature = "mock"), feature = "full"))]
mod legacy_ai_bridge {
    pub use titane_infinity::commands::ai_chat::{
        ai_query, ai_query_streaming, clear_all_memory, create_conversation, delete_conversation,
        list_conversations, AIChatState,
    };
    pub use titane_infinity::commands::engine_commands::{
        engine_get_cognition_state, engine_get_evolution_state, engine_get_harmonia_state,
        engine_get_nexus_state, engine_get_sentinel_state, engine_get_singularity_state,
        engine_tick,
    };
    pub use titane_infinity::commands::memory_commands::{
        memory_clear_all, memory_compact, memory_export_conversation, memory_get, memory_list_all,
        memory_set,
    };
    // [FIX-016] Real engines/vector_store handlers (full mode)
    pub use titane_infinity::api::vector_store_api::{
        check_sqlite_available, vector_store_delete, vector_store_insert, vector_store_update,
    };
    pub use titane_infinity::commands::engines_commands::{
        engines_build_cancel, engines_build_clean, engines_build_get_result,
        engines_build_get_status, engines_build_start, engines_devmode_analyze_file,
        engines_devmode_apply_patch, engines_devmode_changelog, engines_devmode_create_backup,
        engines_devmode_disable, engines_devmode_enable, engines_devmode_get_history,
        engines_devmode_get_state, engines_devmode_preview, engines_devmode_restore_backup,
        engines_devmode_rollback, engines_devmode_validate_patch, engines_monitoring_get_health,
    };
    // [FIX-016] Real runtime state commands (always-available real implementations)
    pub use titane_infinity::ai::ollama::{
        ai_generate_local, ai_scan_local_models, ai_set_local_model,
    };
    pub use titane_infinity::runtime_real::{
        ai_status, chat_mode_change, chat_mode_sync, clear_event_stream, clear_memory_cache,
        clear_system_logs, conversation_reset, get_engine_health, get_engines_status,
        get_event_stream, get_persistence_status, get_system_logs, log_entries,
        memory_delete_entry, memory_get_all_keys, memory_get_entry, memory_scan,
        multi_ai_get_state, restart_cores, run_system_diagnostic, selfheal_force_evaluation,
        selfheal_get_health, selfheal_get_prediction, selfheal_get_state, test_ai_local,
        titan_state_get, toggle_safe_mode, toggle_singularity, xp_get_state, xp_sync_state,
    };
}

#[cfg(any(feature = "mock", not(feature = "full")))]
mod legacy_ai_bridge {
    use tauri::{Emitter, State, Window};

    #[derive(Default)]
    pub struct AIChatState;

    #[tauri::command]
    pub async fn ai_query(
        _state: State<'_, AIChatState>,
        prompt: String,
        _temperature: Option<f32>,
        _max_tokens: Option<usize>,
    ) -> Result<String, String> {
        Ok(serde_json::json!({
            "content": format!("[mock] {}", prompt),
            "provider": "mock",
            "tokens": 0,
        })
        .to_string())
    }

    #[tauri::command]
    pub async fn ai_query_streaming(
        window: Window,
        _state: State<'_, AIChatState>,
        prompt: String,
        _temperature: Option<f32>,
        _max_tokens: Option<usize>,
    ) -> Result<String, String> {
        let response_id = "mock-stream";
        let _ = window.emit(
            "ai_response_start",
            serde_json::json!({ "response_id": response_id, "provider": "mock" }),
        );
        let _ = window.emit(
            "ai_response_chunk",
            serde_json::json!({
                "response_id": response_id,
                "chunk": format!("[mock] {}", prompt),
                "index": 0,
                "total_chunks": 1,
                "is_last": true,
            }),
        );
        let _ = window.emit(
            "ai_response_end",
            serde_json::json!({
                "response_id": response_id,
                "content": format!("[mock] {}", prompt),
                "provider": "mock",
                "tokens": 0,
            }),
        );
        Ok(
            serde_json::json!({ "response_id": response_id, "status": "streaming_complete" })
                .to_string(),
        )
    }

    #[tauri::command]
    pub async fn create_conversation(
        _state: State<'_, AIChatState>,
        _title: String,
    ) -> Result<String, String> {
        Ok("mock-conversation".to_string())
    }

    #[tauri::command]
    pub async fn list_conversations(_state: State<'_, AIChatState>) -> Result<String, String> {
        Ok("[]".to_string())
    }

    #[tauri::command]
    pub async fn delete_conversation(
        _state: State<'_, AIChatState>,
        _conversation_id: String,
    ) -> Result<(), String> {
        Ok(())
    }

    #[tauri::command]
    pub async fn clear_all_memory(_state: State<'_, AIChatState>) -> Result<(), String> {
        Ok(())
    }

    #[tauri::command]
    pub async fn engine_get_nexus_state(
        _state: State<'_, AIChatState>,
    ) -> Result<serde_json::Value, String> {
        Ok(serde_json::json!({ "health": "mock" }))
    }

    #[tauri::command]
    pub async fn engine_get_harmonia_state(
        _state: State<'_, AIChatState>,
    ) -> Result<serde_json::Value, String> {
        Ok(serde_json::json!({ "health": "mock" }))
    }

    #[tauri::command]
    pub async fn engine_get_sentinel_state(
        _state: State<'_, AIChatState>,
    ) -> Result<serde_json::Value, String> {
        Ok(serde_json::json!({ "health": "mock" }))
    }

    #[tauri::command]
    pub async fn engine_get_cognition_state(
        _state: State<'_, AIChatState>,
    ) -> Result<serde_json::Value, String> {
        Ok(serde_json::json!({ "health": "mock" }))
    }

    #[tauri::command]
    pub async fn engine_get_singularity_state(
        _state: State<'_, AIChatState>,
    ) -> Result<serde_json::Value, String> {
        Ok(serde_json::json!({ "health": "mock" }))
    }

    #[tauri::command]
    pub async fn engine_get_evolution_state(
        _state: State<'_, AIChatState>,
    ) -> Result<serde_json::Value, String> {
        Ok(serde_json::json!({ "status": "mock" }))
    }

    #[tauri::command]
    pub async fn engine_tick(_state: State<'_, AIChatState>) -> Result<(), String> {
        Ok(())
    }

    // [FIX-009] engine_metrics/engine_health/engine_modules not registered — stub stubs
    // SingularityMonitor polls these every 1s; without them every tick logs an error.
    // Stubs return honest DEGRADED/empty values (not mocked as healthy).
    #[tauri::command]
    pub async fn engine_metrics(
        _state: State<'_, AIChatState>,
    ) -> Result<serde_json::Value, String> {
        Ok(serde_json::json!({
            "ticks": 0u64,
            "stability": 0.5f32,
            "latency_ms": 0u64,
            "last_update_ms": 0u64,
            "error_count": 0u32,
            "success_rate": 1.0f32
        }))
    }

    #[tauri::command]
    pub async fn engine_health(
        _state: State<'_, AIChatState>,
    ) -> Result<serde_json::Value, String> {
        Ok(serde_json::json!({ "status": "Degraded" }))
    }

    #[tauri::command]
    pub async fn engine_modules(
        _state: State<'_, AIChatState>,
    ) -> Result<serde_json::Value, String> {
        Ok(serde_json::json!([]))
    }

    // [FIX-010] engines_monitoring_get_metrics / engines_monitoring_get_dashboard unregistered.
    // Real handlers in commands/engines_commands.rs use crate::engines which can't be included
    // from main.rs context. Stubs return honest DEGRADED data until engines module is wired.
    #[tauri::command]
    pub async fn engines_monitoring_get_metrics(
        _state: State<'_, AIChatState>,
    ) -> Result<serde_json::Value, String> {
        Ok(serde_json::json!({
            "cpu_usage": 0.0,
            "ram_usage": 0.0,
            "disk_usage": 0.0,
            "network_in": 0.0,
            "network_out": 0.0,
            "active_engines": 0u32,
            "status": "degraded"
        }))
    }

    #[tauri::command]
    pub async fn engines_monitoring_get_dashboard(
        _state: State<'_, AIChatState>,
    ) -> Result<serde_json::Value, String> {
        Ok(serde_json::json!({
            "status": "degraded",
            "engines": [],
            "metrics": { "cpu_usage": 0.0, "ram_usage": 0.0 },
            "alerts": []
        }))
    }

    // [FIX-010] state_get / system_recovery — no registered handler exists anywhere.
    #[tauri::command]
    pub async fn state_get(_state: State<'_, AIChatState>) -> Result<serde_json::Value, String> {
        Ok(serde_json::json!({ "status": "degraded" }))
    }

    #[tauri::command]
    pub async fn system_recovery(
        _state: State<'_, AIChatState>,
    ) -> Result<serde_json::Value, String> {
        Ok(serde_json::json!({ "success": false, "reason": "system_recovery_not_wired" }))
    }

    #[tauri::command]
    pub async fn memory_get(
        _state: State<'_, AIChatState>,
        _key: String,
    ) -> Result<Option<String>, String> {
        Ok(None)
    }

    #[tauri::command]
    pub async fn memory_set(
        _state: State<'_, AIChatState>,
        _key: String,
        _value: String,
    ) -> Result<(), String> {
        Ok(())
    }

    #[tauri::command]
    pub async fn memory_list_all(_state: State<'_, AIChatState>) -> Result<String, String> {
        Ok("[]".to_string())
    }

    #[tauri::command]
    pub async fn memory_clear_all(_state: State<'_, AIChatState>) -> Result<(), String> {
        Ok(())
    }

    #[tauri::command]
    pub async fn memory_export_conversation(
        _state: State<'_, AIChatState>,
        _conversation_id: String,
    ) -> Result<String, String> {
        Ok("{}".to_string())
    }

    #[tauri::command]
    pub async fn memory_compact(_state: State<'_, AIChatState>) -> Result<String, String> {
        Ok("{}".to_string())
    }

    // [FIX-014] NO_HANDLER stubs — frontend-invoked commands with no Rust handler.
    // All return honest DEGRADED/empty values. Zero silent failure.
    macro_rules! stub_cmd {
        ($name:ident) => {
            #[tauri::command]
            pub async fn $name(_state: State<'_, AIChatState>) -> Result<serde_json::Value, String> {
                Ok(serde_json::json!({ "status": "degraded", "reason": stringify!($name) }))
            }
        };
    }
    stub_cmd!(agenda_save_event);
    stub_cmd!(agenda_sync);
    // ai_generate_local/scan/set → REAL: re-exported below from ai::ollama
    // ai_status → REAL: re-exported below from runtime_real
    stub_cmd!(analyze_bundle_size);
    stub_cmd!(automation_execute_action);
    stub_cmd!(autonomy_clean_memory);
    stub_cmd!(autonomy_fix_tts_sync);
    stub_cmd!(autonomy_log_report);
    stub_cmd!(autonomy_ping);
    stub_cmd!(autonomy_resync_singularity_state);
    stub_cmd!(camera_start);
    // chat_mode_change/sync/conversation_reset/get_engine_health/etc → REAL below
    stub_cmd!(cognitive_get_state);
    stub_cmd!(confirm_self_healing_action);
    // conversation_reset → REAL below
    // dev_apply_patch/dev_get_logs/dev_inspect_file/dev_run_command/hybrid_analyze_code
    // defined in commands/hybrid.rs (hybrid_commands module) — skip stub to avoid redefinition
    stub_cmd!(engine_singularity_reset);
    // engines_build_* / engines_devmode_* / engines_monitoring_get_health
    // → REAL in full mode (commands::engines_commands), stub in mock (no engines module in mock)
    stub_cmd!(engines_build_cancel);
    stub_cmd!(engines_build_clean);
    stub_cmd!(engines_build_get_result);
    stub_cmd!(engines_build_get_status);
    stub_cmd!(engines_build_start);
    stub_cmd!(engines_devmode_analyze_file);
    stub_cmd!(engines_devmode_apply_patch);
    stub_cmd!(engines_devmode_changelog);
    stub_cmd!(engines_devmode_create_backup);
    stub_cmd!(engines_devmode_disable);
    stub_cmd!(engines_devmode_enable);
    stub_cmd!(engines_devmode_get_history);
    stub_cmd!(engines_devmode_get_state);
    stub_cmd!(engines_devmode_get_suggestions);
    stub_cmd!(engines_devmode_preview);
    stub_cmd!(engines_devmode_restore_backup);
    stub_cmd!(engines_devmode_rollback);
    stub_cmd!(engines_devmode_validate_patch);
    stub_cmd!(engines_monitoring_get_health);
    stub_cmd!(evolution_save_state);
    stub_cmd!(execute_shell_command);
    // get_cpu_metrics → REAL via titane_infinity::runtime_real (sysinfo)
    // get_engine_health / get_engines_status / get_event_stream / get_persistence_status
    // get_system_logs / log_entries / memory_* / multi_ai_get_state / restart_cores
    // run_system_diagnostic / selfheal_* / titan_state_get / toggle_* / xp_* → REAL below
    // hybrid_analyze_code defined in commands/hybrid.rs — skip stub
    stub_cmd!(identity_set_matrix);
    stub_cmd!(knowledge_ingest);
    stub_cmd!(knowledge_save_state);
    stub_cmd!(progression_save_state);
    stub_cmd!(realtime_network_task);
    stub_cmd!(reject_self_healing_action);
    stub_cmd!(sc_introspection_generate);
    stub_cmd!(sc_introspection_preview);
    // secure_store_key → REAL via titane_infinity::runtime_real
    stub_cmd!(singularity_autonomy_heal);
    stub_cmd!(stt_transcribe);
    stub_cmd!(submit_evolution_data);
    // Remaining frontend-invoked commands with no always-available handler [FIX-015]
    // load_conversation/get_cognitive_state/engine_init/engine_stop → stub in mock
    stub_cmd!(load_conversation);
    stub_cmd!(get_cognitive_state);
    stub_cmd!(engine_init);
    stub_cmd!(engine_stop);
    // check_sqlite_available/vector_store_* → REAL in full mode, stub in mock
    stub_cmd!(check_sqlite_available);
    stub_cmd!(vector_store_delete);
    stub_cmd!(vector_store_insert);
    stub_cmd!(vector_store_update);
}

// Auth OS v∞ - Unified Authentication System
mod auth;

// Overdrive Chat Orchestrator v14 + Voice Engine
mod overdrive {
    pub mod chat_orchestrator {
        include!("overdrive/chat_orchestrator.rs");
    }
    pub mod voice_engine {
        include!("overdrive/voice_engine.rs");
    }
}

// Security modules
mod security {
    pub mod secrets_engine {
        include!("security/secrets_engine.rs");
    }
    pub mod storage_guard {
        include!("security/storage_guard.rs");
    }
    pub mod permission_guard {
        include!("security/permission_guard.rs");
    }
    pub mod permissions {
        include!("security/permissions.rs");
    }
    pub mod sandbox {
        include!("security/sandbox.rs");
    }
    pub mod validation {
        include!("security/validation.rs");
    }
    pub mod rate_limit {
        include!("security/rate_limit.rs");
    }
    pub mod shell_guard {
        include!("security/shell_guard.rs");
    }

    // Re-export from titane_infinity library for crate::security::* usage + SecurityPolicy for shell_guard
    pub use titane_infinity::security::{
        audit, AuditEvent, AuditEventType, AuditSeverity, SecurityPolicy,
    };
}

// ═══════════════════════════════════════════════════════════════
// API MODULES (v21.5 AUTO-FIX) - Helios & Memory
// ═══════════════════════════════════════════════════════════════
mod api {
    pub mod helios_api {
        include!("api/helios_api.rs");
    }
    pub mod memory_api {
        include!("api/memory_api.rs");
    }
    pub mod telemetry_api {
        include!("api/telemetry_api.rs");
    }
}

mod core {
    pub mod http_types {
        include!("core/http_types.rs");
    }
    pub mod tapi_error {
        include!("core/tapi_error.rs");
    }
    pub mod utils {
        include!("core/utils.rs");
    }
    pub mod legacy {
        include!("core/legacy.rs");
    }
    // Re-export from library for overdrive modules compatibility
    pub use titane_infinity::core::{MemoryItem, MemoryType, UnifiedMemory};
    // Re-export legacy for API modules
    pub use legacy::{HeliosCore, MemoryCore};
}

mod error {
    include!("error.rs");
}

mod secure_engine {
    include!("secure_engine.rs");
}

// Fusion Commands Week 1 - Core Implementations
mod fusion_commands_week1 {
    include!("fusion_commands_week1.rs");
}

// Fusion Commands Week 2 - IA & TTS Implementation
mod fusion_commands_week2 {
    include!("fusion_commands_week2.rs");
}

// Fusion Commands Week 3 - Lip-sync & Avatar Animation
mod fusion_commands_week3 {
    include!("fusion_commands_week3.rs");
}

// Fusion Commands Week 4 - State Sync & Auto-Optimization
mod fusion_commands_week4 {
    include!("fusion_commands_week4.rs");
}

// Hybrid Engine commands v∞.26.0
mod hybrid_commands {
    include!("commands/hybrid.rs");
}

// Frontend OS State Bridge + compatibility commands
mod state_bridge_commands {
    include!("commands/state_bridge_commands.rs");
}

// IA Commands v19.5.2 - OpenAI + Claude + Unified Engine
mod ia_commands {
    include!("commands/ia_commands.rs");
}

// AI Prompt Generator v25.4.2 - Mode Builder AI
mod ai_prompt_generator {
    include!("commands/ai_prompt_generator.rs");
}

// Meta-Mode Engine + Auto-Evolution v15 commands
// In full backend mode we load the real engine.
// In mock/not-full builds we provide stubs so IPC symbols resolve.
#[cfg(all(not(feature = "mock"), feature = "full"))]
mod meta_mode_commands {
    include!("commands/meta_mode.rs");
}

#[cfg(any(feature = "mock", not(feature = "full")))]
mod meta_mode_commands {
    use tauri::State;

    #[derive(Default)]
    pub struct MetaModeState;
    impl MetaModeState {
        pub fn new() -> Self {
            Self
        }
    }

    #[tauri::command]
    pub async fn meta_mode_process(
        _request: serde_json::Value,
    ) -> Result<serde_json::Value, String> {
        Ok(
            serde_json::json!({"active_mode":"STANDARD","content":"[mock]","mode_justification":"mock","adapted_tone":"neutral","adapted_depth":"normal","adapted_speed":"normal"}),
        )
    }
    #[tauri::command]
    pub async fn meta_mode_get_current_mode() -> Result<String, String> {
        Ok("STANDARD".into())
    }
    #[tauri::command]
    pub async fn meta_mode_list_modes() -> Result<Vec<String>, String> {
        Ok(vec!["STANDARD".into()])
    }
    #[tauri::command]
    pub async fn meta_mode_get_history() -> Result<Vec<String>, String> {
        Ok(vec![])
    }
    #[tauri::command]
    pub async fn meta_mode_get_stats(
        _state: State<'_, MetaModeState>,
    ) -> Result<serde_json::Value, String> {
        Ok(serde_json::json!({}))
    }
    #[tauri::command]
    pub async fn meta_mode_reset(_state: State<'_, MetaModeState>) -> Result<String, String> {
        Ok("ok".into())
    }
    #[tauri::command]
    pub async fn meta_mode_get_kevin_state(
        _state: State<'_, MetaModeState>,
    ) -> Result<serde_json::Value, String> {
        Ok(serde_json::json!({}))
    }
}

// Multi-Agents Commands v19.5.2 - Agent permissions management
mod multi_agents_commands {
    include!("commands/multi_agents_commands.rs");
}

// IA Context Commands v19.5.2 - Phase 8 Singularity Integration
mod ia_context_commands {
    include!("commands/ia_context_commands.rs");
}

// Fusion Engine commands v∞.27.0 (Super Prompt #17)
mod fusion;

mod ollama;

// Configuration Management System v19.5.2 (Phase 2 - Configuration Hub)
pub mod config;

// ═══════════════════════════════════════════════════════════════
// SUPPORT MODULES (v21.5 AUTO-FIX) - Types, Memory, Utils
// ═══════════════════════════════════════════════════════════════
mod memory;
mod memory_compactor;
mod services; // P2: WebResearch network gate
mod types;
mod utils;

// Immersive Avatar Engine v23
mod avatar;

// System Center v∞ (Diagnostics, DevTools, Cluster)
use titane_infinity::design_center;
use titane_infinity::system_center;

// Cognitive system (always available)
use titane_infinity::cognitive::{
    AnalysisEngine, ConsistencyEngine, EvolutionCognitiveEngine, IntegrationEngine,
};
use tokio::sync::Mutex;

// Multi-IA Orchestrator v∞ (SUPER PROMPT #8)
use titane_infinity::ai::orchestrator_multi::OrchestratorState;

// Core Singularity State (for CoherenceEngine v20.0)

// QA System v19.8

// Singularity State v∞ (v20)

// Adaptive Engine v21

// Narrative Engine v22

// Immersive Avatar Engine v23

// Cloud Sync Engine v∞ (OPUS #13)

// Memory Evolution Engine++ v∞ (OPUS #14)

// System Identity Engine v∞ (OPUS #15)

// Use persistence module from lib.rs (includes all commands)
use titane_infinity::persistence;
use titane_infinity::time_commands; // FIX-011
                                    // [FIX-013] Bulk handler registrations
use titane_infinity::cloud;
use titane_infinity::cluster;
use titane_infinity::evolution;
use titane_infinity::hyper_intelligence;
use titane_infinity::introspection;
use titane_infinity::knowledge;
use titane_infinity::memory_evolution;
use titane_infinity::meta_orchestrator;

/// Cognitive System State (v16)
pub struct CognitiveSystemState {
    pub analysis: Arc<Mutex<AnalysisEngine>>,
    pub consistency: Arc<Mutex<ConsistencyEngine>>,
    pub integration: Arc<Mutex<IntegrationEngine>>,
    pub evolution: Arc<Mutex<EvolutionCognitiveEngine>>,
}

impl Default for CognitiveSystemState {
    fn default() -> Self {
        Self::new()
    }
}

impl CognitiveSystemState {
    pub fn new() -> Self {
        Self {
            analysis: Arc::new(Mutex::new(AnalysisEngine::new())),
            consistency: Arc::new(Mutex::new(ConsistencyEngine::new())),
            integration: Arc::new(Mutex::new(IntegrationEngine::new())),
            evolution: Arc::new(Mutex::new(EvolutionCognitiveEngine::new())),
        }
    }
}

#[tauri::command]
async fn ollama_query(prompt: String) -> Result<serde_json::Value, String> {
    let result = ollama::query_ollama(prompt).await?;
    Ok(serde_json::json!({
        "response": result.response,
        "model": result.model
    }))
}

// mod security; // DISABLED: Using library instead

use titane_infinity::security::{AuditEvent, AuditEventType, SecurityManager};

pub struct AppState {
    // ...existing code...
    security_manager: Arc<SecurityManager>,
}

#[tauri::command]
async fn send_message(
    message: String,
    state: tauri::State<'_, AppState>,
) -> Result<String, String> {
    // Security checks
    state
        .security_manager
        .validate_and_rate_limit("default_user", &message)
        .await
        .map_err(|e| e.to_string())?;

    // Audit log
    let _ = titane_infinity::security::audit::GLOBAL_AUDIT_LOGGER
        .log(AuditEvent {
            timestamp: chrono::Utc::now(),
            event_type: AuditEventType::DataAccess,
            user_id: "default_user".to_string(),
            details: serde_json::json!({
                "action": "send_message",
                "message_length": message.len()
            }),
            ip_address: None,
            severity: 1,
        })
        .await;

    // STUB: send_message is not implemented. Use conversation_generate instead.
    // This function is kept registered to avoid IPC "Command not found" errors
    // but explicitly rejects calls to surface the misconfiguration.
    log::warn!("[send_message] STUB called — callers must use conversation_generate");
    Err("send_message is not implemented. Use tauri command 'conversation_generate' for AI chat dispatch.".to_string())
}

fn main() {
    fn resolve_log_dir() -> std::path::PathBuf {
        if let Ok(custom) = std::env::var("TITANE_LOG_DIR") {
            return std::path::PathBuf::from(custom);
        }

        if let Some(home) = dirs::home_dir() {
            return home.join(".titane").join("logs");
        }

        dirs::data_local_dir()
            .unwrap_or_else(|| std::path::PathBuf::from("/tmp"))
            .join("titane")
            .join("logs")
    }

    // Persistent logs (frontend debug without DevTools): ~/.titane/logs/titane.log
    let log_dir = resolve_log_dir();
    let _ = std::fs::create_dir_all(&log_dir);
    let log_file_path = log_dir.join("titane.log");
    let log_file = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_file_path);

    // Best-effort logger init; never crash the app due to logging.
    if let Ok(file) = log_file {
        use std::io::Write;
        use std::sync::Mutex;

        struct TeeWriter {
            file: Mutex<std::fs::File>,
        }

        impl Write for TeeWriter {
            fn write(&mut self, buf: &[u8]) -> std::io::Result<usize> {
                if let Ok(mut f) = self.file.lock() {
                    let _ = f.write_all(buf);
                }
                let _ = std::io::stderr().write_all(buf);
                Ok(buf.len())
            }

            fn flush(&mut self) -> std::io::Result<()> {
                if let Ok(mut f) = self.file.lock() {
                    let _ = f.flush();
                }
                let _ = std::io::stderr().flush();
                Ok(())
            }
        }

        let _ = env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info"))
            .format_timestamp_millis()
            .target(env_logger::Target::Pipe(Box::new(TeeWriter {
                file: Mutex::new(file),
            })))
            .try_init();
    } else {
        eprintln!(
            "[LOG] Failed to open log file at {}",
            log_file_path.display()
        );
    }

    let security_manager = Arc::new(SecurityManager::new(log_dir.join("audit.log")));

    // Initialize Secure Secrets Engine (AES-256-GCM encrypted storage)
    let secrets_passphrase_raw = std::env::var("TITANE_SECRETS_PASSPHRASE").ok();
    if secrets_passphrase_raw.is_none() {
        // ⚠️ P0 SECURITY WARNING: TITANE_SECRETS_PASSPHRASE not set.
        // Falling back to dev passphrase — secrets are NOT safely encrypted in this mode.
        // Set TITANE_SECRETS_PASSPHRASE to a strong random value before production deployment.
        log::warn!(
            "⚠️ [SecretsEngine] TITANE_SECRETS_PASSPHRASE not set — using insecure dev passphrase. \
             Set this env var before production deployment."
        );
        eprintln!(
            "⚠️  TITANE∞ WARNING: TITANE_SECRETS_PASSPHRASE not set. \
             Secrets are NOT safely protected. See docs/SECURITY.md."
        );
    }
    let secrets_passphrase = secrets_passphrase_raw
        .or_else(|| Some("default-dev-passphrase-change-in-production".to_string()));

    let secrets_engine =
        match security::secrets_engine::SecureSecretsEngine::new(secrets_passphrase) {
            Ok(engine) => engine,
            Err(e) => {
                eprintln!("❌ TITANE∞ FATAL: Failed to initialize Secure Secrets Engine");
                eprintln!("   Error: {:?}", e);
                eprintln!("   → Please check your security configuration and try again.");
                std::process::exit(1);
            }
        };

    // Initialize Chat Orchestrator with provider management
    let chat_orchestrator = overdrive::chat_orchestrator::init();

    // ✅ v27 FIX: Bootstrap API keys from SecureSecretsEngine will be done in setup hook
    // Cannot call async here (no tokio runtime yet), deferred to setup phase
    log::info!("✅ Chat orchestrator initialized (API keys will be loaded in setup)");

    // ✨ v26.3: Initialize Copilot State
    let copilot_api_key = secrets_engine
        .get_secret(security::secrets_engine::KEY_COPILOT)
        .ok()
        .flatten();

    let copilot_state = commands::copilot_commands::CopilotState {
        api_key: Arc::new(tokio::sync::RwLock::new(copilot_api_key)),
        secrets_engine: Arc::new(secrets_engine.clone()),
    };

    log::info!(
        "✅ Copilot state initialized (key configured: {})",
        copilot_state.api_key.blocking_read().is_some()
    );

    // ═══════════════════════════════════════════════════════════════
    // HELIOS & MEMORY CORES (v21.5 AUTO-FIX) - System Monitoring & Storage
    // ═══════════════════════════════════════════════════════════════
    use crate::core::{HeliosCore, MemoryCore};

    let helios_core = HeliosCore::new();
    let memory_core = MemoryCore::new();

    let core_singularity_state = Arc::new(tokio::sync::RwLock::new(
        titane_infinity::core::state::SingularityState::default(),
    ));

    log::info!("✅ HeliosCore and MemoryCore initialized successfully");

    let app_state = AppState {
        // ...existing code...
        security_manager,
    };

    // Initialize Multi-IA Orchestrator v∞ (SUPER PROMPT #8)
    let multi_ai_orchestrator = OrchestratorState::new();

    // ✅ v27 FIX: Clone secrets_engine for use in setup closure before moving
    let secrets_engine_for_setup = secrets_engine.clone();

    let builder = tauri::Builder::default()
        .manage(app_state)
        .manage(multi_ai_orchestrator)
        .manage(secrets_engine)
        .manage(copilot_state) // ✨ v26.3: Copilot State
        .manage(chat_orchestrator.clone())
        .manage(helios_core)
        .manage(memory_core)
        .manage(core_singularity_state)
        .manage(avatar::AvatarEngineGlobal::default())
        .manage(state_bridge_commands::FrontendStateStore::default())
        // ✅ AUDIT FIX (2026-03-06): Identity Engine State — required by identity_* commands
        .manage(titane_infinity::identity::commands::IdentityEngineState::default())
        // ✅ P2-002 AUDIT FIX (2026-03-06): AIChatState — required by ai_query, ai_query_streaming,
        //    get_conversation_history, and memory_* legacy commands
        .manage(legacy_ai_bridge::AIChatState);

    // EXP FUSION ENGINE (XP/EXP UI)
    let builder = builder.manage(ExpFusionState::new());
    // NUMERIC TWIN ENGINE — TWINS_AUDIT 2026-03-15 (RC-002 fix)
    let builder =
        builder.manage(titane_infinity::numeric_twin::twin_commands::NumericTwinState::default());
    // META-MODE ENGINE — R7 fix: register state so meta_mode_* commands can resolve
    let builder = builder.manage(meta_mode_commands::MetaModeState::new());
    // AUTO-EVOLUTION ENGINE — R8 unlock: needed by run_evolution/quick_health_check
    let builder = builder.manage(titane_infinity::engine::AutoEvolutionEngine::new());
    // EVOLUTION ENGINE COMMANDS — R9: EvolutionState for evolution_start/stop etc.
    let builder = builder.manage(std::sync::Mutex::new(
        titane_infinity::evolution::evolution_commands::EvolutionEngineStore::new(),
    ));
    // PERSONA ENGINE — R9: PersonaEngine state for persona_* commands
    #[cfg(any(feature = "mock", not(feature = "full")))]
    let builder = builder.manage(std::sync::Mutex::new(persona_commands::PersonaEngine));
    #[cfg(all(not(feature = "mock"), feature = "full"))]
    let builder = builder.manage(std::sync::Mutex::new(
        titane_infinity::system::persona_engine::PersonaEngine::default(),
    ));
    // [FIX-014] States required by newly-registered commands
    let builder = builder.manage(
        titane_infinity::singularity::singularity_commands::SingularityStateGlobal::default(),
    );
    let builder =
        builder.manage(titane_infinity::adaptive::adaptive_commands::AdaptiveEngineGlobal::new());
    let builder = builder.manage(titane_infinity::overdrive::memory_engine::init());
    let builder = builder.manage(titane_infinity::fusion::FusionEngineState::default());

    // [FIX-016] Runtime real state — memory KV, flags, logs, XP, selfheal, events
    let builder = builder.manage(titane_infinity::runtime_real::MemoryKvState::default());
    let builder = builder.manage(titane_infinity::runtime_real::SystemFlagsState::default());
    let builder = builder.manage(titane_infinity::runtime_real::LogBufferState::default());
    let builder = builder.manage(titane_infinity::runtime_real::XpStateManaged::default());
    let builder = builder.manage(titane_infinity::runtime_real::SelfhealManaged::default());
    let builder = builder.manage(titane_infinity::runtime_real::EventStreamState::default());
    let builder = builder.manage(titane_infinity::runtime_real::SecureKvState::default());

    // [FIX-STATE-SPLIT] conversation_generate (lib command) expects
    // titane_infinity::overdrive::chat_orchestrator::ChatOrchestratorState via State<>.
    // The inline mod overdrive in main.rs creates a shadow type with a different TypeId,
    // so the .manage(chat_orchestrator.clone()) above registers the wrong type.
    // Register a lib-typed instance so conversation_generate can resolve its orchestrator.
    // API keys are not bootstrapped into this instance (cloud providers unavailable);
    // local/Ollama provider works through ConversationEngineState's ai_router.
    let builder = builder.manage(titane_infinity::overdrive::chat_orchestrator::init());

    builder
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(move |app| {
            app.listen("titane://boot-marker", move |event| {
                let payload = event.payload().to_string();
                log::info!("UI_BOOT_EVENT {}", payload);
            });

            // 🔐 Initialize Auth OS v∞ (Unified Authentication System)
            if let Err(e) = auth::init_auth() {
                log::error!("❌ AUTH OS initialization failed: {}", e);
            } else {
                log::info!("✅ AUTH OS v∞ initialized successfully");
            }

            let option1_db_state = commands::db_commands::Option1DbAppState::try_new(app.handle())
                .map_err(|err| format!("Option1 DB init failed: {}", err.message))?;
            app.manage(option1_db_state);

            // 🎯 Initialize OMEGA Conversation Engine (v19.5.2)
            let storage_dir = app.path().app_data_dir()
                .unwrap_or_else(|_| std::env::temp_dir().join("titane"));
            let password = std::env::var("TITANE_SECRETS_PASSPHRASE")
                .unwrap_or_else(|_| "default-dev-passphrase-change-in-production".to_string());

            // AIRouter initialization (for OMEGA pipeline)
            // FIX v26.4.1: Initialize with default Ollama model to avoid "No AI provider available"
            let default_ollama_model = std::env::var("OLLAMA_DEFAULT_MODEL")
                .ok()
                .filter(|s| !s.is_empty())
                .or_else(|| std::env::var("OLLAMA_MODEL").ok().filter(|s| !s.is_empty()))
                .unwrap_or_else(|| "gemma2:2b".to_string());
            let ai_router = Arc::new(tokio::sync::RwLock::new(
                titane_infinity::ai::router::AIRouter::new(None, Some(default_ollama_model.clone()))
            ));
            log::info!("[AI Router] Initialized with default Ollama model: {}", default_ollama_model);

            // SingularityState reference (already managed)
            let singularity_state = Arc::new(tokio::sync::RwLock::new(
                titane_infinity::singularity::singularity_state::SingularityState::default()
            ));

            let conversation_engine = Arc::new(
                titane_infinity::conversation_engine::ConversationEngineState::new(
                    storage_dir,
                    password,
                    ai_router,
                    singularity_state,
                ).unwrap_or_else(|e| {
                    eprintln!("❌ TITANE∞ FATAL: Failed to initialize OMEGA Conversation Engine");
                    eprintln!("   Error: {:?}", e);
                    eprintln!("   → Please check your configuration and storage permissions.");
                    std::process::exit(1);
                })
            );

            app.manage(conversation_engine.clone());
            log::info!("✅ OMEGA Conversation Engine v19.5.2 initialized");

            // ✅ FIX(omega-init): Initialize OMEGA bridge async — required before first
            //    process_through_omega() call. PipelineState::initialized defaults to false
            //    so every message would fail with "Pipeline not initialized" and fall back
            //    to the legacy 3646-char prompt path (slow). This spawn completes in <1ms.
            tauri::async_runtime::spawn(async move {
                if let Err(e) = conversation_engine.omega_bridge.initialize().await {
                    log::warn!("[OMEGA] Bridge initialization failed: {}", e);
                } else {
                    log::info!("[OMEGA] ✅ OMEGA pipeline bridge initialized — fast path active");
                }
            });

            // ✅ AUTOFIX(memory-chat): PersistentMemoryState v19.2Ω — required by
            //    persistent_memory_read/get_stats/get_context/write_entry IPC commands
            app.manage(persistent_memory_v19::PersistentMemoryState::new(app.handle()));
            log::info!("✅ PersistentMemoryState v19.2Ω initialized");

            // Initialize providers asynchronously within Tauri's async runtime
            let chat_orch_clone = chat_orchestrator.clone();
            tauri::async_runtime::spawn(async move {
                overdrive::chat_orchestrator::initialize_providers_async(&chat_orch_clone).await;
            });

            // ✅ v27 FIX: Bootstrap API keys from SecureSecretsEngine into orchestrator
            // Must be done here (inside setup) where tokio runtime is available
            log::info!(" [main.rs] Spawning bootstrap_api_keys task...");
            let chat_orch_for_bootstrap = chat_orchestrator.clone();
            let secrets_for_bootstrap = secrets_engine_for_setup.clone();
            tauri::async_runtime::spawn(async move {
                log::info!("[main.rs] bootstrap_api_keys task started");
                overdrive::chat_orchestrator::bootstrap_api_keys(&chat_orch_for_bootstrap, &secrets_for_bootstrap).await;
                log::info!("[main.rs] ✅ Chat orchestrator: API keys bootstrapped from SecureSecretsEngine");
            });

            // ─────────────────────────────────────────────────────────────
            // OLLAMA BUNDLED AUTO-START (AppImage/DEB/macOS) — desktop only
            // PROD FIX v27.0.2: Enhanced startup with multiple fallback strategies
            // Attempts: 1) Check if running, 2) Bundled binary, 3) System ollama, 4) Warn user
            // Android: no local Ollama process — use OLLAMA_BASE_URL env var to point to LAN server
            // ─────────────────────────────────────────────────────────────
            #[cfg(not(target_os = "android"))]
            let app_handle = app.handle().clone();
            #[cfg(not(target_os = "android"))]
            tauri::async_runtime::spawn(async move {
                log::info!("[Ollama] ═══════════════════════════════════════════════════");
                log::info!("[Ollama] PROD FIX v27.0.2: Enhanced Auto-Start Routine");
                log::info!("[Ollama] ═══════════════════════════════════════════════════");

                // STEP 1: Check if Ollama already running
                if let Ok(status) = titane_infinity::ai::ollama::ai_check_ollama_status().await {
                    if status.available {
                        log::info!("[Ollama] ✅ Endpoint already available");
                        return;
                    }
                }

                log::warn!("[Ollama] ⚠️ Ollama endpoint not responding. Attempting to start...");

                // STEP 2: Try bundled binary (AppImage/custom builds)
                if let Ok(resource_dir) = app_handle.path().resource_dir() {
                    let bundled_paths = vec![
                        resource_dir.join("resources/ollama/ollama"),
                        resource_dir.join("ollama/ollama"),
                        resource_dir.join("bin/ollama"),
                        resource_dir.join("../ollama"),
                    ];

                    for ollama_path in bundled_paths {
                        if ollama_path.exists() {
                            log::info!("[Ollama] 🔍 Found bundled binary at: {:?}", ollama_path);
                            match ProcessCommand::new(&ollama_path)
                                .arg("serve")
                                .env("OLLAMA_HOST", "127.0.0.1:11434")
                                .stdout(Stdio::null())
                                .stderr(Stdio::null())
                                .spawn()
                            {
                                Ok(_) => {
                                    log::info!("[Ollama] ✅ Bundled Ollama started successfully");
                                    log::info!("[Ollama]    Binary: {:?}", ollama_path);
                                    log::info!("[Ollama]    Endpoint: http://127.0.0.1:11434");
                                    return;
                                }
                                Err(err) => {
                                    log::warn!("[Ollama] ❌ Failed to start bundled: {}", err);
                                }
                            }
                        }
                    }
                }

                // STEP 3: Try system `ollama` command (Linux/macOS)
                log::info!("[Ollama] 🔍 Trying system ollama command...");
                match ProcessCommand::new("ollama")
                    .arg("serve")
                    .env("OLLAMA_HOST", "127.0.0.1:11434")
                    .stdout(Stdio::null())
                    .stderr(Stdio::null())
                    .spawn()
                {
                    Ok(_) => {
                        log::info!("[Ollama] ✅ System ollama started successfully");
                        log::info!("[Ollama]    Command: ollama serve");
                        log::info!("[Ollama]    Endpoint: http://127.0.0.1:11434");
                        return;
                    }
                    Err(err) => {
                        log::warn!("[Ollama] ❌ System ollama failed: {}", err);
                    }
                }

                // STEP 4: Final warning and instructions
                log::error!("[Ollama] ═══════════════════════════════════════════════════");
                log::error!("[Ollama] ❌ CRITICAL: Could not auto-start Ollama");
                log::error!("[Ollama] ═══════════════════════════════════════════════════");
                log::error!("[Ollama] Please start Ollama manually:");
                log::error!("[Ollama]");
                log::error!("[Ollama] 📱 macOS / Linux with Homebrew:");
                log::error!("[Ollama]    brew install ollama");
                log::error!("[Ollama]    ollama serve");
                log::error!("[Ollama]");
                log::error!("[Ollama] 🐧 Linux (apt):");
                log::error!("[Ollama]    sudo apt-get install ollama");
                log::error!("[Ollama]    sudo systemctl start ollama");
                log::error!("[Ollama]");
                log::error!("[Ollama] 🐳 Docker (all platforms):");
                log::error!("[Ollama]    docker run -d -p 11434:11434 ollama/ollama");
                log::error!("[Ollama]");
                log::error!("[Ollama] 🌐 Once running, TITANE∞ will auto-connect");
                log::error!("[Ollama] ═══════════════════════════════════════════════════");
            });

            // ─────────────────────────────────────────────────────────────
            // SMOKE TEST RUNTIME (opt-in)
            // Active uniquement si TITANE_SMOKE_RUNTIME_CHAT=1
            // ─────────────────────────────────────────────────────────────
            if std::env::var("TITANE_SMOKE_RUNTIME_CHAT")
                .ok()
                .is_some_and(|v| v == "1")
            {
                let app_handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    println!("[SMOKE-RUNTIME-CHAT] enabled (TITANE_SMOKE_RUNTIME_CHAT=1)");

                    match overdrive::chat_orchestrator::chat_get_providers_status(
                        app_handle.state::<overdrive::chat_orchestrator::ChatOrchestratorState>(),
                    )
                    .await
                    {
                        Ok(status) => {
                            println!(
                                "[SMOKE-RUNTIME-CHAT] providers_status ok (count={})",
                                status.len()
                            );
                        }
                        Err(err) => {
                            eprintln!("[SMOKE-RUNTIME-CHAT] providers_status error: {err}");
                        }
                    }

                    let _request = overdrive::chat_orchestrator::ChatRequest {
                        message: "Réponds uniquement: OK".to_string(),
                        conversation_id: Some("smoke-runtime-chat".to_string()),
                        provider: "ollama".to_string(),
                        model: Some("gemma2:2b".to_string()),
                        streaming: false,
                        images: None,
                        system_prompt: Some("Réponds uniquement: OK".to_string()),
                    };  // request variable is now unused; left for reference (legacy chat_send_message removed)

                    // [RETRAIT v27.0.5-prod] chat_send_message smoke test disabled (legacy)
                    // TODO: Migrate to conversation_generate if smoke testing needed
                    println!("[SMOKE-RUNTIME-CHAT] chat_send_message test removed (legacy, use conversation_generate)");
                });
            }

            // ─────────────────────────────────────────────────────────────
            // SMOKE TEST IPC conversation_generate (opt-in, STABLE proof)
            // Active uniquement si TITANE_SMOKE_IPC_CONVERSATION_GENERATE=1
            // ─────────────────────────────────────────────────────────────
            if std::env::var("TITANE_SMOKE_IPC_CONVERSATION_GENERATE")
                .ok()
                .is_some_and(|v| v == "1")
            {
                let app_handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    println!("[SMOKE-IPC] enabled (TITANE_SMOKE_IPC_CONVERSATION_GENERATE=1)");

                    // Wait 5s for UI mount + stability
                    tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;

                    // Get conversation engine state
                    let engine_state = app_handle.state::<std::sync::Arc<
                        titane_infinity::conversation_engine::ConversationEngineState
                    >>();

                    // Create minimal conversation request (camelCase payload)
                    // Note: conversation_id = None forces creation of new conversation
                    let request = titane_infinity::conversation_engine::types::ConversationRequest {
                        user_message: "Réponds uniquement: SMOKE_OK".to_string(),
                        conversation_id: None,
                        mode: titane_infinity::conversation_engine::types::ConversationMode::Default,
                        ai_config: Some(titane_infinity::conversation_engine::types::AIConfig {
                            temperature: 0.7,
                            max_tokens: Some(50),
                            provider_preference: titane_infinity::conversation_engine::types::ProviderPreference::Local,
                        }),
                        emotion_context: None,
                        custom_system_prompt: Some("Réponds uniquement: SMOKE_OK".to_string()),
                        history: None,
                    };

                    // Call conversation engine (same logic as conversation_generate command)
                    let start_time = std::time::Instant::now();
                    match engine_state.process_message(request).await {
                        Ok(response) => {
                            let latency_ms = start_time.elapsed().as_millis() as u64;
                            let content_preview = response
                                .assistant_message
                                .chars()
                                .take(120)
                                .collect::<String>();

                            println!(
                                "[SMOKE-IPC] conversation_generate ok latency_ms={} preview={}",
                                latency_ms,
                                content_preview
                            );
                        }
                        Err(err) => {
                            eprintln!("[SMOKE-IPC] conversation_generate error: {err}");
                        }
                    }
                });
            }

            // ✅ CRITICAL FIX: Show main window that was auto-created from tauri.conf.json
            // In Tauri v2, windows defined in app.windows are created but start HIDDEN
            match app.get_webview_window("main") {
                Some(main_window) => {
                    log::info!("📱 Main window found in app context");

                    if let Err(err) = main_window.show() {
                        eprintln!("❌ Failed to show main window: {err}");
                    } else {
                        // Auto-open DevTools (dev mode or TITANE_DEVTOOLS env var)
                        let devtools_enabled = cfg!(debug_assertions)
                            || std::env::var("TITANE_DEVTOOLS")
                                .ok()
                                .is_some_and(|v| v == "1" || v == "true");

                        // Note: open_devtools() method may not be available in all Tauri versions
                        // Skipping auto-open devtools for now - not critical for production
                        if devtools_enabled {
                            log::info!("🛠️ DevTools enabled via environment (manual open required)");
                        }

                        log::info!("✅ Main window shown successfully");
                    }
                }
                None => {
                    eprintln!("⚠️ CRITICAL WARNING: Main window not found!");
                    eprintln!("   This means tauri.conf.json app.windows['main'] was not processed");
                    eprintln!("   Available windows: {:?}", app.webview_windows().keys().collect::<Vec<_>>());
                    // Don't fail setup, but log loudly
                }
            }

            Ok(())
        })
        .on_page_load(|window, payload| {
            log::info!(
                target: "ui",
                "page_load label={} url={}",
                window.label(),
                payload.url()
            );

                        if std::env::var("TITANE_PROBE_BOOT_MARKERS")
                                .ok()
                                .is_some_and(|v| v == "1")
                                && window.label() == "main"
                        {
                                let script = r#"
                                    if (!window.__TITANE_BOOT_PROBE_SCHEDULED__) {
                                        window.__TITANE_BOOT_PROBE_SCHEDULED__ = true;

                                        const probeInvoke = async (marker) => {
                                            try {
                                                if (window.__TAURI_INTERNALS__?.invoke) {
                                                    await window.__TAURI_INTERNALS__.invoke('boot_marker_log', { marker });
                                                }
                                            } catch (_) {
                                                // ignore probe invoke failures
                                            }
                                        };

                                        let probeTick = 0;
                                        const probeIntervalMs = 250;
                                        const probeMaxTicks = 40; // 10s
                                        const probeTimer = setInterval(async () => {
                                            probeTick += 1;

                                            const stage = document.documentElement?.dataset?.titaneBootStage || 'UNKNOWN_STAGE';
                                            const domReady = document.documentElement?.dataset?.titaneBootReady === '1';
                                            const splashEl = document.querySelector('.loading-splash');
                                            const fallbackEl = document.querySelector('.page-loading-fallback');

                                            const splashStyle = splashEl ? window.getComputedStyle(splashEl) : null;
                                            const fallbackStyle = fallbackEl ? window.getComputedStyle(fallbackEl) : null;

                                            const splashVisible = Boolean(
                                                splashEl &&
                                                splashStyle &&
                                                splashStyle.display !== 'none' &&
                                                splashStyle.visibility !== 'hidden' &&
                                                splashStyle.opacity !== '0'
                                            );
                                            const fallbackVisible = Boolean(
                                                fallbackEl &&
                                                fallbackStyle &&
                                                fallbackStyle.display !== 'none' &&
                                                fallbackStyle.visibility !== 'hidden' &&
                                                fallbackStyle.opacity !== '0'
                                            );

                                            const mainTsx = Boolean(window.__TITANE_BOOT__?.main_tsx);
                                            const route = window.location?.pathname || '/';

                                            const marker = [
                                                'LOADER_PROBE',
                                                `t=${probeTick * probeIntervalMs}`,
                                                `stage=${stage}`,
                                                `ready=${domReady ? 1 : 0}`,
                                                `main_tsx=${mainTsx ? 1 : 0}`,
                                                `splash_visible=${splashVisible ? 1 : 0}`,
                                                `fallback_visible=${fallbackVisible ? 1 : 0}`,
                                                `route=${route}`,
                                            ].join('|');

                                            await probeInvoke(marker);

                                            if (probeTick >= probeMaxTicks) {
                                                clearInterval(probeTimer);
                                                await probeInvoke(
                                                    `LOADER_PROBE_FINAL|ready=${domReady ? 1 : 0}|main_tsx=${mainTsx ? 1 : 0}|splash_visible=${splashVisible ? 1 : 0}|fallback_visible=${fallbackVisible ? 1 : 0}|route=${route}`
                                                );
                                            }
                                        }, probeIntervalMs);

                                        setTimeout(async () => {
                                            try {
                                                const stage = document.documentElement?.dataset?.titaneBootStage || 'UNKNOWN_STAGE';
                                                const domReady = document.documentElement?.dataset?.titaneBootReady === '1';
                                                const marker = domReady
                                                    ? 'BOOT:READY'
                                                    : 'BOOT:NOT_READY_22S';

                                                await probeInvoke(marker);
                                                await probeInvoke(`BOOT:STAGE:${stage}`);

                                                console.info('[BOOT_PROBE]', marker);
                                            } catch (e) {
                                                console.error('[BOOT_PROBE_ERR]', String(e));
                                            }
                                        }, 22000);
                                    }
                                "#;

                                if let Err(err) = window.eval(script) {
                                        log::warn!("[BOOT_PROBE] eval injection failed: {}", err);
                                }
                        }
        })
        .invoke_handler(tauri::generate_handler![
            // Frontend OS bridge compatibility
            state_bridge_commands::ping,
            state_bridge_commands::get_system_state,
            state_bridge_commands::get_module_health,
            state_bridge_commands::system_get_status,
            state_bridge_commands::get_state,
            state_bridge_commands::set_state,
            state_bridge_commands::delete_state,
            commands::db_commands::db_put_event,
            commands::db_commands::db_get_stream,
            commands::db_commands::db_put_snapshot,
            commands::db_commands::db_get_snapshot,
            commands::db_commands::db_kv_set,
            commands::db_commands::db_kv_get,
            commands::db_commands::db_sync_now,
            commands::db_commands::db_sync_status,

            // Core messaging
            send_message,
            ollama_query,
            commands::ollama_command::ollama_generate,
            // Chat Engine — generate_response primary IPC path
            // mock build: mock_commands::generate_response; full build: chat_engine::commands::generate_response
            #[cfg(feature = "mock")]
            mock_commands::generate_response,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            chat_engine::commands::generate_response,
            // OMEGA Conversation Engine Commands (v19.5.2)
            conversation_engine::commands::create_new_conversation,
            conversation_engine::commands::conversation_generate,
            conversation_engine::commands::conversation_process_message,
            conversation_engine::commands::conversation_health_check,
            conversation_engine::commands::conversation_memory_stats,
            conversation_engine::commands::load_conversation_history,
            conversation_engine::commands::list_restorable_conversations,
            // Chat Orchestrator Commands (CHAT PIPELINE v21 + R04 Memory Integration)
            // [RETRAIT v27.0.5-prod] chat_send_message removed (legacy, use conversation_generate)
            overdrive::chat_orchestrator::chat_stream_message,
            overdrive::chat_orchestrator::chat_get_providers_status,
            overdrive::chat_orchestrator::chat_check_providers,
            overdrive::chat_orchestrator::chat_get_conversation,
            overdrive::chat_orchestrator::chat_create_conversation,
            overdrive::chat_orchestrator::chat_delete_conversation,
            overdrive::chat_orchestrator::chat_generate_suggestions,
            overdrive::chat_orchestrator::chat_get_memory_stats, // R04 FIX
            overdrive::chat_orchestrator::chat_memory_backup,    // LTM backup coverage
            overdrive::chat_orchestrator::chat_memory_restore,   // LTM restore coverage

            // Diagnostic Commands v27 (Online capabilities check)
            diagnostic_commands::check_online_capabilities,
            // P1: WebResearch Engine (EXPERIMENTAL — stub, no network)
            web_research_commands::web_research,
            // V26 Production Health Telemetry
            api::telemetry_api::read_production_week1_csv,
            // Voice Engine Commands (VOICE PIPELINE v21 REPAIR - 17 commands)
            overdrive::voice_engine::voice_start_listening,
            overdrive::voice_engine::voice_stop_listening,
            overdrive::voice_engine::voice_cancel_recording,
            overdrive::voice_engine::voice_is_recording,
            overdrive::voice_engine::voice_transcribe_audio,
            overdrive::voice_engine::voice_get_status,
            overdrive::voice_engine::voice_get_config,
            overdrive::voice_engine::voice_update_config,
            // voice_synthesize_speech deprecated - use speak() in ai_chat.rs instead
            overdrive::voice_engine::voice_play_audio,
            overdrive::voice_engine::voice_stop_speaking,
            overdrive::voice_engine::voice_test_pipeline,
            overdrive::voice_engine::voice_calibrate_microphone,
            overdrive::voice_engine::voice_detect_wake_word,
            overdrive::voice_engine::voice_get_available_models,
            overdrive::voice_engine::voice_enable_duplex,
            overdrive::voice_engine::voice_disable_duplex,
            overdrive::voice_engine::voice_check_interruption,

            // Immersive Avatar Engine v23 + FullBody
            avatar::avatar_commands::avatar_prepare_speech,
            avatar::avatar_commands::avatar_finish_speech,
            avatar::avatar_commands::avatar_enable_immersion,
            avatar::avatar_commands::avatar_on_wake_word,
            avatar::avatar_commands::avatar_get_current_morph,
            avatar::avatar_commands::avatar_advance_lip_sync,
            avatar::avatar_commands::avatar_get_expression,
            avatar::avatar_commands::avatar_get_state,
            avatar::avatar_commands::avatar_prepare_animation,
            avatar::avatar_selftest::avatar_run_selftest,

            // Avatar appearance
            avatar::appearance_commands::avatar_get_appearance,
            avatar::appearance_commands::avatar_set_appearance,
            avatar::appearance_commands::avatar_update_appearance,
            avatar::appearance_commands::avatar_apply_style_preset,
            avatar::appearance_commands::avatar_parse_style_command,
            avatar::appearance_commands::avatar_save_custom_style,
            avatar::appearance_commands::avatar_load_custom_style,
            avatar::appearance_commands::avatar_merge_styles,
            avatar::appearance_commands::avatar_list_styles,
            avatar::appearance_commands::avatar_add_archetype,

            // Avatar floating window / display state (desktop-only — window APIs not available on Android)
            #[cfg(not(target_os = "android"))]
            avatar::avatar_floating_commands::avatar_get_display_state,
            #[cfg(not(target_os = "android"))]
            avatar::avatar_floating_commands::avatar_set_display_state,
            #[cfg(not(target_os = "android"))]
            avatar::avatar_floating_commands::avatar_update_display_state,
            #[cfg(not(target_os = "android"))]
            avatar::avatar_floating_commands::avatar_reset_display_state,
            #[cfg(not(target_os = "android"))]
            avatar::avatar_floating_commands::avatar_mode_floating,
            #[cfg(not(target_os = "android"))]
            avatar::avatar_floating_commands::avatar_mode_embed,
            #[cfg(not(target_os = "android"))]
            avatar::avatar_floating_commands::avatar_mode_hidden,
            #[cfg(not(target_os = "android"))]
            avatar::avatar_floating_commands::avatar_set_position,
            #[cfg(not(target_os = "android"))]
            avatar::avatar_floating_commands::avatar_set_size,
            #[cfg(not(target_os = "android"))]
            avatar::avatar_floating_commands::avatar_set_scale,
            #[cfg(not(target_os = "android"))]
            avatar::avatar_floating_commands::avatar_set_opacity,
            #[cfg(not(target_os = "android"))]
            avatar::avatar_floating_commands::avatar_set_always_on_top,
            #[cfg(not(target_os = "android"))]
            avatar::avatar_floating_commands::avatar_set_locked,
            #[cfg(not(target_os = "android"))]
            avatar::avatar_floating_commands::avatar_set_mirror_mode,
            #[cfg(not(target_os = "android"))]
            avatar::avatar_floating_commands::avatar_set_click_through,
            #[cfg(not(target_os = "android"))]
            avatar::avatar_floating_commands::avatar_set_anchor,
            #[cfg(not(target_os = "android"))]
            avatar::avatar_floating_commands::avatar_set_anchor_by_name,
            #[cfg(not(target_os = "android"))]
            avatar::avatar_floating_commands::avatar_list_screens,
            #[cfg(not(target_os = "android"))]
            avatar::avatar_floating_commands::avatar_move_to_screen,

            // FullBody engine
            avatar::fullbody_commands::fullbody_initialize,
            avatar::fullbody_commands::fullbody_advance_frame,
            avatar::fullbody_commands::fullbody_activate_gesture,
            avatar::fullbody_commands::fullbody_update_expression,
            avatar::fullbody_commands::fullbody_update_lipsync,
            avatar::fullbody_commands::fullbody_update_state,
            avatar::fullbody_commands::fullbody_on_wake_word,
            avatar::fullbody_commands::fullbody_export_skeleton,
            avatar::fullbody_commands::fullbody_update_context,
            avatar::fullbody_commands::fullbody_get_posture,
            avatar::fullbody_commands::fullbody_get_stats,
            avatar::fullbody_selftest::fullbody_run_selftest,

            // System Center Diagnostics (v∞)
            system_center::diagnostics::sc_run_quick_diagnostics,
            system_center::diagnostics::sc_run_full_diagnostics,
            system_center::diagnostics::sc_get_diagnostic_status,

            // Orchestration Center (Stats/Dev)
            orchestration_center_commands::orchestration_get_cognitive_state,
            orchestration_center_commands::orchestration_get_unified_state,

            // QA Monitoring Center (Dev)
            qa_monitoring_commands::qa_get_state,
            qa_monitoring_commands::qa_get_system_metrics,
            qa_monitoring_commands::qa_list_test_suites,
            qa_monitoring_commands::qa_list_alerts,
            qa_monitoring_commands::qa_run_test_suite,
            qa_monitoring_commands::qa_acknowledge_alert,
            // [FIX-012] qa_monitoring commands called by useQAMonitoring with no try/catch
            qa_monitoring_commands::qa_get_test_result,
            qa_monitoring_commands::qa_list_monitors,
            qa_monitoring_commands::qa_create_monitor,
            qa_monitoring_commands::qa_toggle_monitor,
            qa_monitoring_commands::qa_delete_monitor,
            qa_monitoring_commands::qa_resolve_alert,
            qa_monitoring_commands::qa_get_hardening_config,
            qa_monitoring_commands::qa_update_hardening_config,
            qa_monitoring_commands::qa_run_security_audit,
            qa_monitoring_commands::qa_get_performance_report,
            qa_monitoring_commands::qa_get_logs,
            qa_monitoring_commands::qa_export_metrics_prometheus,
            qa_monitoring_commands::qa_health_check,

            // ONE CORE (Dev)
            one_core_commands::one_core_get_state,
            one_core_commands::one_core_get_metrics,
            one_core_commands::one_core_list_commands,
            one_core_commands::one_core_get_event_history,
            one_core_commands::one_core_execute_command,
            one_core_commands::one_core_run_diagnostic,
            one_core_commands::one_core_force_sync,
            one_core_commands::one_core_cleanup,

            // EXP FUSION ENGINE (XP/EXP UI)
            commands::exp_fusion::exp_get_global_state,
            commands::exp_fusion::exp_get_categories,
            commands::exp_fusion::exp_get_projects,
            commands::exp_fusion::exp_get_project_stats,
            commands::exp_fusion::exp_get_talents,
            commands::exp_fusion::exp_get_timeline,
            commands::exp_fusion::exp_get_timeline_stats,
            commands::exp_fusion::exp_add_knowledge,
            // Secure API Key Management (v∞ - Super-Prompts H, I, J, K)
            // ✅ v21 Phase 1: Réactivation Gemini
            secure_commands::chat_set_gemini_key,
            secure_commands::get_gemini_key_status,
            secure_commands::chat_set_openai_key,
            secure_commands::get_openai_key_status,
            secure_commands::chat_set_anthropic_key,
            secure_commands::get_anthropic_key_status,
            secure_commands::get_secrets_status,
            secure_commands::secure_store_secret,
            secure_commands::has_secret,
            secure_commands::delete_secret,
            secure_commands::get_permission_audit, // ✅ v26.2.3: Permission audit log
            secure_commands::check_system_integrity, // ✅ v21.5: System integrity check
            // Runtime Configuration Bridge v∞ (Frontend config without secrets)
            runtime_config::get_runtime_config,
            runtime_config::boot_marker_log,
            // ✅ v21 Phase 1: Provider-specific AI generation
            commands::chat_generate_commands::chat_generate_gemini,
            commands::chat_generate_commands::chat_generate_openai,
            commands::chat_generate_commands::chat_generate_claude,
            // ✨ v26.3: GitHub Copilot provider
            commands::copilot_commands::chat_generate_copilot,
            commands::copilot_commands::chat_set_copilot_key,
            commands::copilot_commands::get_copilot_key_status,
            commands::copilot_commands::test_copilot_connection,
            // AI Prompt Generator v25.4.2 (Mode Builder)
            ai_prompt_generator::generate_mode_prompt,
            // Meta-Mode Engine v15 commands — R7 fix: was present in backend, missing from handler
            meta_mode_commands::meta_mode_process,
            meta_mode_commands::meta_mode_get_current_mode,
            meta_mode_commands::meta_mode_list_modes,
            meta_mode_commands::meta_mode_get_history,
            meta_mode_commands::meta_mode_get_stats,
            meta_mode_commands::meta_mode_reset,
            meta_mode_commands::meta_mode_get_kevin_state,
            // Ollama AI Provider Status Check
            titane_infinity::ai::ollama::ai_check_ollama_status,
            // Auth OS Commands v∞ (Unified Authentication System)
            auth::commands::auth_get_status,
            auth::commands::auth_generate_dev_token,
            auth::commands::auth_validate_dev_token,
            auth::commands::auth_revoke_dev_token,
            auth::commands::auth_save_api_keys,
            auth::commands::auth_get_api_keys,
            auth::commands::auth_delete_api_key,
            auth::commands::auth_grant_role,
            auth::commands::auth_revoke_role,
            // ═══════════════════════════════════════════════════════════════
            // CRITICAL COMMANDS (v21.5 AUTO-FIX) - Audio + Helios + Memory
            // ═══════════════════════════════════════════════════════════════
            // ═══════════════════════════════════════════════════════════════
            // AUDIO SYSTEM COMMANDS (v24.3.3 FIX) - 13 commands
            // ═══════════════════════════════════════════════════════════════
            // TTS Commands (3)
            audio::commands::tts_speak,
            audio::commands::tts_stop,
            audio::commands::test_tts,
            audio::commands::pause_speaking,
            audio::commands::resume_speaking,
            // Microphone Commands (1)
            audio::commands::test_microphone,
            // Device Detection (2)
            audio::commands::get_audio_output_devices,
            audio::commands::get_audio_input_devices,
            // Device Selection (2) - ✅ v24.3.3 FIX: AJOUTÉ
            audio::commands::set_audio_output_device,
            audio::commands::set_audio_input_device,
            // VAD Commands (5) - ✅ v24.3.3 FIX: AJOUTÉ
            audio::commands::vad_get_state,
            audio::commands::vad_process_frame,
            audio::commands::vad_configure,
            audio::commands::vad_reset,
            audio::commands::vad_test,
            // E2E Audio Truth System
            audio::commands::tts_generate_test_buffer,
            // Audio Capture Commands (6) - opt-in feature (requires libasound2-dev)
            #[cfg(feature = "audio-capture")]
            audio::commands::audio_capture_start,
            #[cfg(feature = "audio-capture")]
            audio::commands::audio_capture_stop,
            #[cfg(feature = "audio-capture")]
            audio::commands::audio_capture_status,
            #[cfg(feature = "audio-capture")]
            audio::commands::audio_capture_get_chunk,
            #[cfg(feature = "audio-capture")]
            audio::commands::audio_capture_export_wav,
            #[cfg(feature = "audio-capture")]
            audio::commands::audio_list_devices,
            // Helios API Commands (System Monitoring) - ONLY get_helios_state
            api::helios_api::get_helios_state,
            // Memory API Commands (Storage + Timeline)
            api::memory_api::get_memory_state,
            api::memory_api::write_snapshot,
            api::memory_api::read_snapshot,
            api::memory_api::write_log,
            api::memory_api::read_logs,
            api::memory_api::add_timeline_event,
            api::memory_api::memory_get_active_projects,
            api::memory_api::memory_get_recent_decisions,
            api::memory_api::memory_save_chat_interaction,
            api::memory_api::memory_get_timeline,
            api::memory_api::memory_get_active_rituals,
            api::memory_api::memory_debug_scan,
            memory_system_commands::memory_save_entry,
            // Auto-Evolution Engine — R8 unlock
            engine_evolution_commands::run_evolution,
            engine_evolution_commands::get_evolution_state,
            engine_evolution_commands::quick_health_check,
            // Evolution Engine v∞ commands — R9 unlock
            evolution_engine_commands::evolution_get_state,
            evolution_engine_commands::evolution_start,
            evolution_engine_commands::evolution_stop,
            evolution_engine_commands::evolution_run_full_cycle,
            evolution_engine_commands::evolution_get_history,
            evolution_engine_commands::evolution_get_suggestions,
            evolution_engine_commands::evolution_approve_suggestion,
            evolution_engine_commands::evolution_reject_suggestion,
            evolution_engine_commands::evolution_create_action,
            evolution_engine_commands::evolution_execute_action,
            evolution_engine_commands::evolution_rollback_action,
            evolution_engine_commands::evolution_get_data_points,
            evolution_engine_commands::evolution_add_data_point,
            evolution_engine_commands::evolution_update_score,
            evolution_engine_commands::evolution_get_scores,
            evolution_engine_commands::evolution_get_insights,
            evolution_engine_commands::evolution_get_patterns,
            evolution_engine_commands::evolution_get_statistics,
            evolution_engine_commands::evolution_generate_report,
            evolution_engine_commands::evolution_clear_old_history,
            // Persona Engine commands — R9 unlock
            persona_commands::persona_get_state,
            persona_commands::persona_get_multipliers,
            persona_commands::persona_react,
            persona_commands::persona_update,
            persona_commands::persona_reset,
            // Agenda commands — R9 unlock
            agenda_commands::agenda_load_events,
            agenda_commands::agenda_save_events,
            agenda_commands::agenda_delete_event,
            // ═══════════════════════════════════════════════════════════════
            // NEW COMMANDS v21.5.3 - BACKEND REBUILD (SUPER PROMPT #2)
            // ═══════════════════════════════════════════════════════════════
            // Governance Commands (11 commands)
            commands_v21::governance_commands::get_ia_policies,
            commands_v21::governance_commands::save_ia_policies,
            commands_v21::governance_commands::toggle_ia_policy,
            commands_v21::governance_commands::create_ia_policy,
            commands_v21::governance_commands::delete_ia_policy,
            commands_v21::governance_commands::get_permission_matrix,
            // get_permission_audit already exists in secure_commands
            commands_v21::governance_commands::clear_permission_audit,
            commands_v21::governance_commands::get_security_log,
            commands_v21::governance_commands::append_security_log,
            commands_v21::governance_commands::export_security_log,
            commands_v21::governance_commands::clear_security_log,
            // System Center Commands
            commands_v21::system_center_commands::sc_get_env,
            // Logs
            system_center::logs::sc_get_logs,
            system_center::logs::sc_get_log_stats,
            system_center::logs::sc_clear_logs,
            system_center::logs::sc_add_log,
            // Cluster
            system_center::cluster::sc_get_cluster_status,
            system_center::cluster::sc_get_cluster_peers,
            system_center::cluster::sc_initialize_cluster,
            system_center::cluster::sc_shutdown_cluster,
            // HyperVision
            system_center::hypervision::sc_hypervision_start,
            system_center::hypervision::sc_hypervision_stop,
            system_center::hypervision::sc_hypervision_get_state,
            system_center::hypervision::sc_hypervision_get_metrics,
            system_center::hypervision::sc_hypervision_get_layers,
            system_center::hypervision::sc_hypervision_get_anomalies,
            system_center::hypervision::sc_hypervision_clear_anomalies,
            system_center::hypervision::sc_hypervision_resolve_anomaly,
            // Introspection
            system_center::introspection::sc_introspection_quick_scan,
            system_center::introspection::sc_introspection_full_scan,
            system_center::introspection::sc_introspection_auto_fix,
            // Memory OS Commands (5 commands)
            commands_v21::memory_os_commands::memory_clear,
            commands_v21::memory_os_commands::memory_promote,
            commands_v21::memory_os_commands::memory_demote,
            commands_v21::memory_os_commands::memory_delete,
            commands_v21::memory_os_commands::memory_prune,
            // ═══════════════════════════════════════════════════════════════
            // PHASE 2 FUSION COMMANDS v20.0 (Coherence + UnifiedMemory + Health)
            // ═══════════════════════════════════════════════════════════════
            // Coherence Commands (5 commands)
            coherence_commands::coherence_get_state,
            coherence_commands::coherence_check_system,
            coherence_commands::coherence_validate_connections,
            coherence_commands::coherence_get_score,
            coherence_commands::coherence_initialize,
            // Unified Memory Commands (6 commands)
            unified_memory_commands::memory_get_state,
            unified_memory_commands::memory_store,
            unified_memory_commands::memory_recall,
            unified_memory_commands::memory_get_stats,
            unified_memory_commands::memory_initialize,
            unified_memory_commands::memory_tick,
            // System Health Commands (9 commands)
            system_health_commands::health_get_state,
            system_health_commands::health_get_report,
            system_health_commands::health_check_system,
            system_health_commands::health_check,
            system_health_commands::health_initialize,
            system_health_commands::health_set_auto_heal,
            system_health_commands::health_get_metrics,
            system_health_commands::get_system_health,
            system_health_commands::memory_repair,
            system_health_commands::system_optimize,
            // DevTools Commands (3 commands)
            commands_v21::devtools_commands::devtools_enable,
            commands_v21::devtools_commands::devtools_disable,
            commands_v21::devtools_commands::devtools_debug_clear,
            // Whisper Streaming Commands (3 commands)
            commands_v21::whisper_commands::start_whisper_streaming,
            commands_v21::whisper_commands::stop_whisper_streaming,
            commands_v21::whisper_commands::send_audio_chunk,
            // Audio Config Commands - NOTE: Already exist in audio::commands (set/get_audio_*_device)
            // ✅ AUTOFIX(memory-chat): Persistent Memory v19.2Ω — full IPC suite
            //    (stubs v21 remplacés; module orphelin désormais enregistré)
            persistent_memory_v19::persistent_memory_read,
            persistent_memory_v19::persistent_memory_get_stats,
            persistent_memory_v19::persistent_memory_get_bundles,
            persistent_memory_v19::persistent_memory_get_context,
            persistent_memory_v19::persistent_memory_write_entry,
            persistent_memory_v19::persistent_memory_create_summary,
            persistent_memory_v19::persistent_memory_create_bundle,
            persistent_memory_v19::persistent_memory_export,
            persistent_memory_v19::persistent_memory_promote_entry,
            persistent_memory_v19::persistent_memory_archive_entry,
            persistent_memory_v19::persistent_memory_delete_entry,
            persistent_memory_v19::persistent_memory_add_to_bundle,
            // UI Theme Commands
            design_center::theme_manager::save_ui_theme,
            design_center::theme_manager::load_ui_theme,
            design_center::theme_manager::reset_ui_theme,
            design_center::theme_manager::update_ui_token,
            // Self-Healing Commands (4 commands)
            commands_v21::self_healing_commands::self_healing_trigger,
            commands_v21::self_healing_commands::self_healing_get_status,
            commands_v21::self_healing_commands::self_healing_enable,
            commands_v21::self_healing_commands::self_healing_disable,
            // Singularity Extra Commands (1 command)
            commands_v21::singularity_commands::singularity_self_check,
            // ═══════════════════════════════════════════════════════════════
            // WINDOW CONTROLS COMMANDS (v26.2.0) - Zoom + Fullscreen
            // ═══════════════════════════════════════════════════════════════
            commands_v21::window_controls_commands::window_get_zoom,
            commands_v21::window_controls_commands::window_set_zoom,
            commands_v21::window_controls_commands::window_zoom_in,
            commands_v21::window_controls_commands::window_zoom_out,
            commands_v21::window_controls_commands::window_zoom_reset,
            commands_v21::window_controls_commands::window_toggle_fullscreen,
            commands_v21::window_controls_commands::window_set_fullscreen,
            commands_v21::window_controls_commands::window_is_fullscreen,
            // ═══════════════════════════════════════════════════════════════
            // CONFIGURATION HUB COMMANDS (v24.3.3 FIX) - 10 commands
            // ═══════════════════════════════════════════════════════════════
            config::get_all_configs,
            config::get_audio_device_config,
            config::save_audio_device_config,
            config::update::update_runtime_config,
            config::update::update_chat_engine_config,
            config::update::get_chat_engine_config,
            config::update::set_chat_engine_config,
            config::update::get_chat_request_defaults,
            config::update::set_chat_request_defaults,
            config::update::set_chat_profile,
            config::io::export_config,
            config::io::import_config,
            // Note: export_full_state n'existe pas encore dans config::io
            config::presets::list_config_presets,
            config::presets::save_config_preset,
            config::presets::load_config_preset,
            config::presets::delete_config_preset,
            // Titan Persistence Commands (26 commands) - 100% SAVE System
            persistence::commands::titan_persistence_init,
            persistence::commands::titan_persist_event,
            persistence::commands::titan_force_snapshot,
            persistence::commands::titan_force_snapshot_current,
            persistence::commands::titan_get_persistence_status,
            persistence::commands::titan_check_integrity,
            persistence::commands::titan_compact_journal,
            persistence::commands::titan_load_state,
            persistence::commands::titan_get_events_since,
            persistence::commands::titan_list_snapshots,
            persistence::commands::titan_recover_state,
            persistence::commands::titan_verify_integrity,
            persistence::commands::titan_persistence_shutdown,
            persistence::commands::titan_migrate_state,
            persistence::commands::titan_get_schema_version,
            persistence::commands::titan_export_data,
            persistence::commands::titan_validate_archive,
            persistence::commands::titan_import_data,
            persistence::commands::titan_get_memory_health,
            persistence::commands::titan_run_self_healing,
            // Time-travel commands [FIX-011] — get_travel_stats + delete_snapshot were unregistered
            time_commands::get_travel_stats,
            time_commands::delete_snapshot,
            persistence::commands::titan_reset_module,
            persistence::commands::titan_dump_raw_state,
            persistence::commands::titan_run_full_integrity_check,
            persistence::commands::titan_memory_doctor_diagnose,
            persistence::commands::titan_memory_doctor_summary,
            persistence::commands::titan_memory_doctor_heal,
            persistence::commands::titan_memory_doctor_compact,
            persistence::commands::titan_memory_doctor_export,

            // Fusion Backend Commands (Week 1)
            fusion_commands_week1::fusion_activate_modules,
            fusion_commands_week1::fusion_adjust_styles,

            // Fusion Backend Commands (Week 2)
            fusion_commands_week2::fusion_generate_ia_response,
            fusion_commands_week2::fusion_prepare_tts,

            // Fusion Backend Commands (Week 3)
            fusion_commands_week3::fusion_process_lipsync,
            fusion_commands_week3::fusion_animate_avatar,

            // Fusion Backend Commands (Week 4)
            fusion_commands_week4::fusion_update_state,
            fusion_commands_week4::fusion_auto_optimize,

            // ═══════════════════════════════════════════════════════════════
            // CONTROL PANEL COMMANDS (v27 FIX — AUDIT FUSION 2026-03-06)
            // Correction P1: commandes cp_* implémentées dans lib mais non
            // enregistrées dans le handler → IPC failures sur le Control Panel
            // ═══════════════════════════════════════════════════════════════
            titane_infinity::control_panel_commands::cp_get_ai_config,
            titane_infinity::control_panel_commands::cp_set_ai_config,
            titane_infinity::control_panel_commands::cp_get_design_config,
            titane_infinity::control_panel_commands::cp_set_design_config,
            titane_infinity::control_panel_commands::cp_get_modules_status,
            titane_infinity::control_panel_commands::cp_toggle_module,
            titane_infinity::control_panel_commands::cp_get_network_config,
            titane_infinity::control_panel_commands::cp_set_network_config,
            titane_infinity::control_panel_commands::cp_get_security_config,
            titane_infinity::control_panel_commands::cp_set_security_config,
            titane_infinity::control_panel_commands::cp_check_for_updates,
            titane_infinity::control_panel_commands::cp_install_update,

            // ═══════════════════════════════════════════════════════════════
            // SELF-HEAL EXECUTOR COMMANDS (AUDIT FIX 2026-03-06 — CONTINUE)
            // 14 commands used in selfHealingExecutor.ts + selfHealingSyncLayer.ts
            // Implemented in commands_v21::self_healing_commands — no State deps
            // ═══════════════════════════════════════════════════════════════
            commands_v21::self_healing_commands::selfheal_clear_cache,
            commands_v21::self_healing_commands::selfheal_isolate_module,
            commands_v21::self_healing_commands::selfheal_mini_audit,
            commands_v21::self_healing_commands::selfheal_rebuild_memory,
            commands_v21::self_healing_commands::selfheal_regenerate_config,
            commands_v21::self_healing_commands::selfheal_repair_json,
            commands_v21::self_healing_commands::selfheal_reset_state,
            commands_v21::self_healing_commands::selfheal_restart_module,
            commands_v21::self_healing_commands::selfheal_restart_process,
            commands_v21::self_healing_commands::selfheal_restart_worker,
            commands_v21::self_healing_commands::selfheal_save_profile,
            commands_v21::self_healing_commands::selfheal_switch_provider,
            commands_v21::self_healing_commands::selfheal_sync_state,
            commands_v21::self_healing_commands::selfheal_sync_with_singularity,

            // ═══════════════════════════════════════════════════════════════
            // IDENTITY ENGINE COMMANDS (AUDIT FIX 2026-03-06 — CONTINUE)
            // 4 commands used in IdentityCenter.tsx + defaultIdentityMatrix.ts
            // Requires IdentityEngineState (managed above)
            // ═══════════════════════════════════════════════════════════════
            titane_infinity::identity::commands::identity_get_matrix,
            titane_infinity::identity::commands::identity_list_voice_profiles,
            titane_infinity::identity::commands::identity_get_active_voice_profile,
            titane_infinity::identity::commands::identity_set_active_voice_profile,
            titane_infinity::identity::commands::identity_set_mode,

            // ═══════════════════════════════════════════════════════════════
            // IDENTITY STUB COMMANDS — P2-001 AUDIT FIX (2026-03-06)
            // Implements missing identity_* stubs declared in tauriCommands.ts
            // and allowlisted in tauri.conf.json
            // ═══════════════════════════════════════════════════════════════
            titane_infinity::identity::commands::identity_get_current_mode,
            titane_infinity::identity::commands::identity_get_available_modes,
            titane_infinity::identity::commands::identity_get_current_tone,
            titane_infinity::identity::commands::identity_get_active_rules,
            titane_infinity::identity::commands::identity_get_coherence_score,
            titane_infinity::identity::commands::identity_disable_rule,
            titane_infinity::identity::commands::identity_enable_rule,
            titane_infinity::identity::commands::identity_get_personality_snapshot,

            // ═══════════════════════════════════════════════════════════════
            // AICHAT LEGACY COMMANDS — P2-002 AUDIT FIX (2026-03-06)
            // Requires AIChatState (managed above)
            // ═══════════════════════════════════════════════════════════════
            legacy_ai_bridge::ai_query,
            legacy_ai_bridge::ai_query_streaming,
            legacy_ai_bridge::create_conversation,
            legacy_ai_bridge::list_conversations,
            legacy_ai_bridge::delete_conversation,
            legacy_ai_bridge::clear_all_memory,
            legacy_ai_bridge::engine_get_nexus_state,
            legacy_ai_bridge::engine_get_harmonia_state,
            legacy_ai_bridge::engine_get_sentinel_state,
            legacy_ai_bridge::engine_get_cognition_state,
            legacy_ai_bridge::engine_get_singularity_state,
            legacy_ai_bridge::engine_get_evolution_state,
            legacy_ai_bridge::engine_tick,
            legacy_ai_bridge::engine_metrics,  // FIX-009
            legacy_ai_bridge::engine_health,   // FIX-009
            legacy_ai_bridge::engine_modules,  // FIX-009
            legacy_ai_bridge::engines_monitoring_get_metrics,  // FIX-010
            legacy_ai_bridge::engines_monitoring_get_dashboard, // FIX-010
            legacy_ai_bridge::state_get,       // FIX-010
            legacy_ai_bridge::system_recovery, // FIX-010
            legacy_ai_bridge::memory_get,
            legacy_ai_bridge::memory_set,
            // memory_get_stats already registered above as unified_memory_commands::memory_get_stats
            legacy_ai_bridge::memory_list_all,
            legacy_ai_bridge::memory_clear_all,
            legacy_ai_bridge::memory_export_conversation,
            legacy_ai_bridge::memory_compact,

            // ═══════════════════════════════════════════════════════════════
            // AUDIO COMMANDS — speak, start/stop/cancel_recording
            // (AUDIT FIX 2026-03-06 — CONTINUE)
            // Used in: tauriBridge.ts, audioSelfHeal.ts, voice.ts, voiceE2ETests.ts
            // audio::commands already included — missing variants added here
            // ═══════════════════════════════════════════════════════════════
            audio::commands::speak,
            audio::commands::start_recording,
            audio::commands::stop_recording,
            audio::commands::cancel_recording,
            // ═══════════════════════════════════════════════════════════════
            // AUDIO FIX 2026-03-15 — AUDIO_VOICE_AUDIT — missing handlers
            // transcribe_audio + is_recording: handler exists in audio::commands
            // but were missing from generate_handler! (allowlisted in tauri.conf.json)
            // ═══════════════════════════════════════════════════════════════
            audio::commands::transcribe_audio,
            audio::commands::is_recording,
            // AUDIO_VOICE_FORENSIC 2026-03-15 — FIX-001: register stop_speaking + is_speaking
            // Handlers exist in audio/commands.rs, allowlisted in capabilities/audio_tts.json
            // but were absent from generate_handler! → IPC error on any frontend invoke
            audio::commands::stop_speaking,
            audio::commands::is_speaking,
            audio::commands::pause_speaking,
            audio::commands::resume_speaking,
            // AUDIO_VOICE_FORENSIC 2026-03-15 — FIX-003: register get_recording_status (Q-002)
            // Called in audioSelfHeal.ts, handler exists, now allowlisted in audio_tts.json
            audio::commands::get_recording_status,

            // ═══════════════════════════════════════════════════════════════
            // NUMERIC TWIN COMMANDS — TWINS_AUDIT 2026-03-15 (RC-001 fix)
            // twin_* IPC suite — requires NumericTwinState managed above
            // ═══════════════════════════════════════════════════════════════
            titane_infinity::numeric_twin::twin_commands::twin_get_state,
            titane_infinity::numeric_twin::twin_commands::twin_get_fusion_index,
            titane_infinity::numeric_twin::twin_commands::twin_submit_observation,
            titane_infinity::numeric_twin::twin_commands::twin_apply_evolution,
            titane_infinity::numeric_twin::twin_commands::twin_validate_sync,
            titane_infinity::numeric_twin::twin_commands::twin_get_evolution_profile,
            titane_infinity::numeric_twin::twin_commands::twin_get_identity,
            titane_infinity::numeric_twin::twin_commands::twin_recalculate_fusion,

            // ═══════════════════════════════════════════════════════════════
            // SECURITY — validate_chat_message
            // (AUDIT FIX 2026-03-06 — CONTINUE)
            // Allowlisted in chat_ai.json but not previously registered
            // ═══════════════════════════════════════════════════════════════
            secure_commands::validate_chat_message,

            // ═══════════════════════════════════════════════════════════════
            // IA COMMANDS — R10 unlock
            // ia_commands module (include! at mod ia_commands block)
            // ═══════════════════════════════════════════════════════════════
            ia_commands::list_ai_providers,
            ia_commands::set_api_key,
            ia_commands::test_api_key,

            // ═══════════════════════════════════════════════════════════════
            // ORCHESTRATION CENTER — ping commands — R10 unlock
            // ═══════════════════════════════════════════════════════════════
            orchestration_center_commands::ping_gemini,
            orchestration_center_commands::ping_ollama,

            // ═══════════════════════════════════════════════════════════════
            // MULTI-AGENTS COMMANDS — R10 unlock
            // ═══════════════════════════════════════════════════════════════
            multi_agents_commands::create_agent,
            multi_agents_commands::get_agent,
            multi_agents_commands::list_agents,

            // ═══════════════════════════════════════════════════════════════
            // SELF HEALING (commands::) — get_vitals / load_profile — R10 unlock
            // (distinct from commands_v21::self_healing_commands::*)
            // ═══════════════════════════════════════════════════════════════
            commands_v21::self_healing_commands::selfheal_get_vitals,
            commands_v21::self_healing_commands::selfheal_load_profile,

            // ═══════════════════════════════════════════════════════════════
            // MOCK COMMANDS — remaining mock-only commands — R10 unlock
            // ═══════════════════════════════════════════════════════════════
            #[cfg(feature = "mock")]
            mock_commands::experience_get_state,
            #[cfg(feature = "mock")]
            mock_commands::experience_update_state,
            #[cfg(feature = "mock")]
            mock_commands::get_system_info,
            #[cfg(feature = "mock")]
            mock_commands::store_file,
            #[cfg(feature = "mock")]
            mock_commands::reset_memory,
            #[cfg(feature = "mock")]
            mock_commands::get_helios_metrics,
            #[cfg(feature = "mock")]
            mock_commands::get_logs,

            // ═══════════════════════════════════════════════════════════════
            // R11: STUB COMMANDS — IPC gap elimination
            // Commands called from frontend with no real backend.
            // All return safe stubs — no silent IPC timeout.
            // ═══════════════════════════════════════════════════════════════
            commands::stub_commands::fs_exists,
            commands::stub_commands::read_json_file,
            commands::stub_commands::log_to_file,
            commands::stub_commands::save_settings,
            commands::stub_commands::get_memories,
            commands::stub_commands::store_memory,
            commands::stub_commands::delete_memory,
            commands::stub_commands::report_chat_error,
            commands::stub_commands::sync_evolution_state,
            commands::stub_commands::get_performance_metrics,

            // ═══════════════════════════════════════════════════════════════
            // R11: REAL BACKENDS now registered (existed but unregistered)
            // ═══════════════════════════════════════════════════════════════

            // singularity::coherence
            titane_infinity::singularity::coherence::singularity_check_coherence,

            // meta::commands
            titane_infinity::meta::commands::meta_get_report,
            titane_infinity::meta::commands::meta_trigger_sync,
            titane_infinity::meta::commands::meta_get_alignment,
            titane_infinity::meta::commands::meta_get_state,
            titane_infinity::meta::commands::meta_selftest_all,
            titane_infinity::meta::commands::meta_get_monitoring_metrics,

            // knowledge::parser
            titane_infinity::knowledge::parser::parse_document,

            // cognitive_learning::semantic_map
            titane_infinity::cognitive_learning::semantic_map::cognitive_get_map,

            // secure_commands — secure_list_files
            secure_commands::secure_list_files,

            // mock get_timeline (safe in both builds since mock_commands always present)
            #[cfg(feature = "mock")]
            mock_commands::get_timeline,

            // ═══════════════════════════════════════════════════════════════
            // [FIX-013] Bulk handler registrations — ~100 commands with real
            // Rust handlers but missing from generate_handler!
            // ═══════════════════════════════════════════════════════════════

            // memory_evolution — MemoryEvolutionCenter
            memory_evolution::commands::memory_evolution_status,
            memory_evolution::commands::memory_add_item,
            memory_evolution::commands::memory_parse,
            memory_evolution::commands::memory_synthesize,
            memory_evolution::commands::memory_cluster,
            memory_evolution::commands::memory_compress,
            memory_evolution::commands::memory_extract_patterns,
            memory_evolution::commands::memory_check_stability,
            memory_evolution::commands::memory_check_and_repair,
            memory_evolution::commands::memory_grow,
            memory_evolution::commands::memory_hierarchy_health,
            memory_evolution::commands::memory_evolve_full,
            memory_evolution::commands::memory_update_config,
            memory_evolution::commands::memory_get_clusters,
            memory_evolution::commands::memory_get_items_by_level,
            memory_evolution::commands::memory_create_backup,
            memory_evolution::commands::memory_list_backups,

            // cloud — CloudCenter
            cloud::commands::cloud_init,
            cloud::commands::cloud_load_vault,
            cloud::commands::cloud_create_vault,
            cloud::commands::cloud_get_status,
            cloud::commands::cloud_sync_push,
            cloud::commands::cloud_sync_pull,
            cloud::commands::cloud_update_config,
            cloud::commands::cloud_get_devices,
            cloud::commands::cloud_remove_device,
            cloud::commands::cloud_get_sync_history,
            cloud::commands::cloud_update_vault_data,
            cloud::commands::cloud_verify_integrity,
            cloud::commands::cloud_backup_vault,
            cloud::commands::cloud_restore_vault,
            cloud::commands::cloud_auto_heal,
            cloud::commands::cloud_list_backups,

            // hyper_intelligence — HyperIntelligencePage
            hyper_intelligence::commands::hyper_init,
            hyper_intelligence::commands::hyper_get_state,
            hyper_intelligence::commands::hyper_get_metrics,
            hyper_intelligence::commands::hyper_set_mode,
            hyper_intelligence::commands::hyper_think,
            hyper_intelligence::commands::hyper_generate_insight,
            hyper_intelligence::commands::hyper_reason,
            hyper_intelligence::commands::hyper_imagine,
            hyper_intelligence::commands::hyper_get_thoughts,
            hyper_intelligence::commands::hyper_get_insights,
            hyper_intelligence::commands::hyper_get_report,

            // devtools — DevTools OS (full non-mock builds only)
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::devtools::api::devtools_debug_last,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::devtools::api::devtools_debug_stats,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::devtools::api::devtools_debug_toggle,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::devtools::api::devtools_memory_stats,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::devtools::api::devtools_memory_export,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::devtools::api::devtools_memory_stm,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::devtools::api::devtools_memory_ltm,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::devtools::api::devtools_memory_search,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::devtools::api::devtools_knn,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::devtools::api::devtools_memory_health,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::devtools::api::devtools_analyze,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::devtools::api::devtools_metrics,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::devtools::api::devtools_status,

            // meta_orchestrator — MetaOrchestratorPage
            meta_orchestrator::commands::orchestrator_init,
            meta_orchestrator::commands::orchestrator_get_state,
            meta_orchestrator::commands::orchestrator_run_cycle,
            meta_orchestrator::commands::orchestrator_set_mode,
            meta_orchestrator::commands::orchestrator_get_metrics,
            meta_orchestrator::commands::orchestrator_enqueue_task,
            meta_orchestrator::commands::orchestrator_get_queue,
            meta_orchestrator::commands::orchestrator_get_engines,
            meta_orchestrator::commands::orchestrator_get_health,
            meta_orchestrator::commands::orchestrator_get_report,

            // cluster — mesh layer
            cluster::mesh_layer::mesh_initialize,
            cluster::mesh_layer::mesh_get_stats,

            // evolution
            evolution::evolution_loop::evolution_run_cycle,
            evolution::evolution_loop::evolution_get_stats,

            // introspection
            introspection::scanner::introspection_scan,
            introspection::scanner::introspection_auto_fix,

            // knowledge
            knowledge::parser::parse_document,
            knowledge::parser::detect_file_format,

            // security::hardening
            titane_infinity::security::hardening::run_hardening_selftest,

            // commands sub-modules (full non-mock builds only)
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::commands::one_core::one_core_get_engine_status,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::commands::one_core::one_core_set_mode,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::commands::one_core::one_core_verify_integrity,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::commands::devtools::get_correlated_logs,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::commands::devtools::search_logs,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::commands::devtools::export_logs,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::commands::devtools::list_all_metrics,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::commands::devtools::get_core_metrics,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::commands::devtools::get_dashboard_metrics,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::commands::devtools::discover_cores,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::commands::devtools::get_core_info,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::commands::devtools::update_cognitive_mode,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::commands::devtools::get_three_centers_coherence,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::commands::devtools::get_system_recommendations,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::commands::devtools::check_needs_intervention,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::commands::devtools::update_mental_charge,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::commands::devtools::update_heart_alignment,
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            titane_infinity::commands::devtools::update_body_energy,

            // mock_commands bulk (feature = "mock" only)
            #[cfg(feature = "mock")]
            mock_commands::get_knowledge,
            #[cfg(feature = "mock")]
            mock_commands::memory_get_knowledge,
            #[cfg(feature = "mock")]
            mock_commands::stream_response,
            #[cfg(feature = "mock")]
            mock_commands::speak_text,
            #[cfg(feature = "mock")]
            mock_commands::save_memory,
            #[cfg(feature = "mock")]
            mock_commands::load_memory,
            #[cfg(feature = "mock")]
            mock_commands::validate_nexus,
            #[cfg(feature = "mock")]
            mock_commands::get_nexus_graph,
            #[cfg(feature = "mock")]
            mock_commands::memory_ingest_file,
            #[cfg(feature = "mock")]
            mock_commands::import_file,
            #[cfg(feature = "mock")]
            mock_commands::upload_and_process_file,
            #[cfg(feature = "mock")]
            mock_commands::get_all_files,
            #[cfg(feature = "mock")]
            mock_commands::get_files_by_category,
            #[cfg(feature = "mock")]
            mock_commands::cognitive_analyze,
            #[cfg(feature = "mock")]
            mock_commands::cognitive_check_coherence,
            #[cfg(feature = "mock")]
            mock_commands::cognitive_integrate,
            #[cfg(feature = "mock")]
            mock_commands::cognitive_get_status,
            #[cfg(feature = "mock")]
            mock_commands::cognitive_optimize,

            // ═══════════════════════════════════════════════════════════════
            // [FIX-014] Frontend-invoked commands with real handlers —
            // 135 TAURI_COMMANDS enum values resolving to unregistered cmds
            // ═══════════════════════════════════════════════════════════════

            // adaptive — AdaptiveEngineGlobal state now managed
            titane_infinity::adaptive::adaptive_commands::adaptive_capture_sample,
            titane_infinity::adaptive::adaptive_commands::adaptive_get_history,
            titane_infinity::adaptive::adaptive_commands::adaptive_get_profile,
            titane_infinity::adaptive::adaptive_commands::adaptive_get_summary,
            titane_infinity::adaptive::adaptive_commands::adaptive_learn,
            titane_infinity::adaptive::adaptive_commands::adaptive_run_optimization,
            titane_infinity::adaptive::adaptive_commands::adaptive_set_mode,

            // singularity — SingularityStateGlobal state now managed (v30.0.0)
            titane_infinity::singularity::singularity_commands::singularity_diff,
            titane_infinity::singularity::singularity_commands::singularity_export_json,
            titane_infinity::singularity::singularity_commands::singularity_get,
            titane_infinity::singularity::singularity_commands::singularity_hash,
            titane_infinity::singularity::singularity_commands::singularity_integrity,
            titane_infinity::singularity::singularity_commands::singularity_meta,
            titane_infinity::singularity::singularity_commands::singularity_repair,
            titane_infinity::singularity::singularity_commands::singularity_set,
            titane_infinity::singularity::singularity_commands::singularity_snapshot,
            titane_infinity::singularity::singularity_commands::singularity_sync,
            titane_infinity::singularity::singularity_selftest::singularity_selftest_full,

            // time_commands extras — module already imported
            time_commands::list_snapshots,
            time_commands::restore_snapshot,

            // audio — calibrate_titane_voice
            titane_infinity::audio::commands::calibrate_titane_voice,

            // fusion — FusionEngineState now managed
            titane_infinity::fusion::fusion_sync,
            titane_infinity::fusion::fusion_merge,

            // hypervision — no State param
            titane_infinity::hypervision::monitor::get_system_metrics,

            // overdrive::memory_engine — MemoryEngineState now managed
            titane_infinity::overdrive::memory_engine::memory_search,

            // [FIX-014] NO_HANDLER stubs (legacy_ai_bridge)
            legacy_ai_bridge::agenda_save_event,
            legacy_ai_bridge::agenda_sync,
            // [FIX-016] ai::ollama — REAL in all modes
            titane_infinity::ai::ollama::ai_generate_local,
            titane_infinity::ai::ollama::ai_scan_local_models,
            titane_infinity::ai::ollama::ai_set_local_model,
            // [FIX-016] runtime_real — REAL in all modes
            titane_infinity::runtime_real::ai_status,
            legacy_ai_bridge::analyze_bundle_size,
            legacy_ai_bridge::automation_execute_action,
            legacy_ai_bridge::autonomy_clean_memory,
            legacy_ai_bridge::autonomy_fix_tts_sync,
            legacy_ai_bridge::autonomy_log_report,
            legacy_ai_bridge::autonomy_ping,
            legacy_ai_bridge::autonomy_resync_singularity_state,
            legacy_ai_bridge::camera_start,
            titane_infinity::runtime_real::chat_mode_change,
            titane_infinity::runtime_real::chat_mode_sync,
            titane_infinity::runtime_real::clear_event_stream,
            titane_infinity::runtime_real::clear_memory_cache,
            titane_infinity::runtime_real::clear_system_logs,
            legacy_ai_bridge::cognitive_get_state,
            legacy_ai_bridge::confirm_self_healing_action,
            titane_infinity::runtime_real::conversation_reset,
            // dev_* and hybrid_analyze_code routed via hybrid_commands
            hybrid_commands::dev_apply_patch,
            hybrid_commands::dev_get_logs,
            hybrid_commands::dev_inspect_file,
            hybrid_commands::dev_run_command,
            hybrid_commands::hybrid_analyze_code,
            legacy_ai_bridge::engine_singularity_reset,
            legacy_ai_bridge::engines_build_cancel,
            legacy_ai_bridge::engines_build_clean,
            legacy_ai_bridge::engines_build_get_result,
            legacy_ai_bridge::engines_build_get_status,
            legacy_ai_bridge::engines_build_start,
            legacy_ai_bridge::engines_devmode_analyze_file,
            legacy_ai_bridge::engines_devmode_apply_patch,
            legacy_ai_bridge::engines_devmode_changelog,
            legacy_ai_bridge::engines_devmode_create_backup,
            legacy_ai_bridge::engines_devmode_disable,
            legacy_ai_bridge::engines_devmode_enable,
            legacy_ai_bridge::engines_devmode_get_history,
            legacy_ai_bridge::engines_devmode_get_state,
            legacy_ai_bridge::engines_devmode_get_suggestions,
            legacy_ai_bridge::engines_devmode_preview,
            legacy_ai_bridge::engines_devmode_restore_backup,
            legacy_ai_bridge::engines_devmode_rollback,
            legacy_ai_bridge::engines_devmode_validate_patch,
            legacy_ai_bridge::engines_monitoring_get_health,
            legacy_ai_bridge::evolution_save_state,
            legacy_ai_bridge::execute_shell_command,
            // get_cpu_metrics → REAL: runtime_real (sysinfo)
            titane_infinity::runtime_real::get_cpu_metrics,
            titane_infinity::runtime_real::get_engine_health,
            titane_infinity::runtime_real::get_engines_status,
            titane_infinity::runtime_real::get_event_stream,
            titane_infinity::runtime_real::get_persistence_status,
            titane_infinity::runtime_real::get_system_logs,
            // hybrid_analyze_code registered via hybrid_commands above
            legacy_ai_bridge::identity_set_matrix,
            legacy_ai_bridge::knowledge_ingest,
            legacy_ai_bridge::knowledge_save_state,
            titane_infinity::runtime_real::log_entries,
            titane_infinity::runtime_real::memory_delete_entry,
            titane_infinity::runtime_real::memory_get_all_keys,
            titane_infinity::runtime_real::memory_get_entry,
            titane_infinity::runtime_real::memory_scan,
            titane_infinity::runtime_real::multi_ai_get_state,
            legacy_ai_bridge::progression_save_state,
            legacy_ai_bridge::realtime_network_task,
            legacy_ai_bridge::reject_self_healing_action,
            titane_infinity::runtime_real::restart_cores,
            titane_infinity::runtime_real::run_system_diagnostic,
            legacy_ai_bridge::sc_introspection_generate,
            legacy_ai_bridge::sc_introspection_preview,
            // secure_store_key → REAL: runtime_real (in-memory KV)
            titane_infinity::runtime_real::secure_store_key,
            titane_infinity::runtime_real::selfheal_force_evaluation,
            titane_infinity::runtime_real::selfheal_get_health,
            titane_infinity::runtime_real::selfheal_get_prediction,
            titane_infinity::runtime_real::selfheal_get_state,
            legacy_ai_bridge::singularity_autonomy_heal,
            legacy_ai_bridge::stt_transcribe,
            legacy_ai_bridge::submit_evolution_data,
            titane_infinity::runtime_real::test_ai_local,
            titane_infinity::runtime_real::titan_state_get,
            titane_infinity::runtime_real::toggle_safe_mode,
            titane_infinity::runtime_real::toggle_singularity,
            titane_infinity::runtime_real::xp_get_state,
            titane_infinity::runtime_real::xp_sync_state,

            // [FIX-014] mock_commands with real handlers (already exist, cfg-gated)
            #[cfg(feature = "mock")]
            mock_commands::chat_generate,
            #[cfg(feature = "mock")]
            mock_commands::clear_logs,
            #[cfg(feature = "mock")]
            mock_commands::get_active_projects,
            #[cfg(feature = "mock")]
            mock_commands::get_singularity_state,
            #[cfg(feature = "mock")]
            mock_commands::save_chat_interaction,

            // [FIX-015] Remaining frontend-invoked stubs (full-only handlers not available in mock)
            legacy_ai_bridge::load_conversation,
            legacy_ai_bridge::get_cognitive_state,
            legacy_ai_bridge::engine_init,
            legacy_ai_bridge::engine_stop,
            legacy_ai_bridge::check_sqlite_available,
            legacy_ai_bridge::vector_store_delete,
            legacy_ai_bridge::vector_store_insert,
            legacy_ai_bridge::vector_store_update,

            // ✨ TOTAL_DEV v29.0.0 — 6 handlers GOD DEV
            commands::total_dev_commands::total_dev_unlock,
            commands::total_dev_commands::total_dev_session_status,
            commands::total_dev_commands::total_dev_revoke,
            commands::total_dev_commands::total_dev_git_op,
            commands::total_dev_commands::total_dev_run_command,
            commands::total_dev_commands::total_dev_read_file,

            // Governed network gateway — frontend httpClient now routes via IPC
            commands::http_commands::http_request,
        ])
        .run(tauri::generate_context!())
        .unwrap_or_else(|e| {
            eprintln!("❌ TITANE∞ FATAL: Tauri application failed to start");
            eprintln!("   Error: {:?}", e);
            eprintln!("   → Please check logs and system requirements.");
            std::process::exit(1);
        });

    log::info!("TITANE∞ v30.0.0 shutdown - Security System offline");
}
