// TITANE_INFINITY v26.3.0 — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v26.3.0 — MAIN ENTRY POINT (Singularity Architecture)
//   20 Engines Unified + OMEGA Pipeline + Phase 2 Fusion Commands
//   Stable runtime validé (Linux) • Déploiement utilisateur en cours de validation
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
use tauri::Manager;

// TITANE∞ command modules
use std::sync::Arc;

// EXP Fusion Engine (used by frontend XP/EXP UI)
use crate::commands::exp_fusion::ExpFusionState;

#[cfg(all(not(feature = "mock"), feature = "full"))]
use titane_infinity::chat_engine;

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

// DevOps commands (module local)
mod devops_commands {
    include!("commands/devops.rs");
}

// Audio commands v19.2
mod audio;

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

    // EXP Fusion Engine commands (XP/EXP UI)
    pub mod exp_fusion {
        include!("commands/exp_fusion.rs");
    }

    // ✨ v26.3: GitHub Copilot provider commands
    pub mod copilot_commands {
        include!("commands/copilot_commands.rs");
    }
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

// Singularity State v∞ (5-layer unified state)
mod singularity_state {
    include!("singularity_state/mod.rs");
}

// Security modules
mod security {
    pub mod secrets_engine {
        include!("security/secrets_engine.rs");
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
}

mod core {
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
    pub use titane_infinity::core::{MemoryType, UnifiedMemory};
    // Re-export legacy for API modules
    pub use legacy::{HeliosCore, MemoryCore};
}

mod error {
    include!("error.rs");
}

mod secure_engine {
    include!("secure_engine.rs");
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

// Onboarding System v19.5.2 (Phase 1 - Quick Wins)
mod onboarding;

// Configuration Management System v19.5.2 (Phase 2 - Configuration Hub)
mod config;

// ═══════════════════════════════════════════════════════════════
// SUPPORT MODULES (v21.5 AUTO-FIX) - Types, Memory, Utils
// ═══════════════════════════════════════════════════════════════
mod memory;
mod memory_compactor;
mod types;
mod utils;

// Immersive Avatar Engine v23
mod avatar;

// SINGULARITY-FUSION vΩ (AutoHeal/AutoFix/CrashGuard/Performance/Pipeline)
mod singularity_fusion;

// System Center v∞ (Diagnostics, DevTools, Cluster)
use titane_infinity::system_center;

// Cognitive system (always available)
use titane_infinity::cognitive::{
    AnalysisEngine, ConsistencyEngine, EvolutionCognitiveEngine, IntegrationEngine,
};
use tokio::sync::Mutex;

// Singularity Cortex OS v∞ (SUPER PROMPT #7)
use titane_infinity::singularity_cortex::api::SingularityCortexState;

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
async fn ollama_query(prompt: String) -> Result<String, String> {
    ollama::query_ollama(prompt).await
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

    // ...existing code...

    Ok("Message processed".to_string())
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
    let secrets_passphrase = std::env::var("TITANE_SECRETS_PASSPHRASE")
        .ok()
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

    log::info!("✅ HeliosCore and MemoryCore initialized successfully");

    let app_state = AppState {
        // ...existing code...
        security_manager,
    };

    // Initialize Singularity Cortex OS v∞ (SUPER PROMPT #7)
    let singularity_cortex = SingularityCortexState::new();

    // Initialize Multi-IA Orchestrator v∞ (SUPER PROMPT #8)
    let multi_ai_orchestrator = OrchestratorState::new();

    let builder = tauri::Builder::default()
        .manage(app_state)
        .manage(singularity_cortex)
        .manage(multi_ai_orchestrator)
        .manage(secrets_engine)
        .manage(copilot_state) // ✨ v26.3: Copilot State
        .manage(chat_orchestrator.clone())
        .manage(helios_core)
        .manage(memory_core)
        .manage(avatar::AvatarEngineGlobal::default())
        .manage(singularity_fusion::AutoFixState::default())
        .manage(singularity_fusion::AutoHealState::default())
        .manage(singularity_fusion::CrashGuardState::default())
        .manage(singularity_fusion::PerformanceState::default())
        .manage(singularity_fusion::UnifiedPipelineState::default())
        .manage(state_bridge_commands::FrontendStateStore::default());

    // EXP FUSION ENGINE (XP/EXP UI)
    let builder = builder.manage(ExpFusionState::new());

    builder
        .manage(std::sync::Mutex::new(onboarding::OnboardingState::default()))
        .setup(move |app| {
            // 🔐 Initialize Auth OS v∞ (Unified Authentication System)
            if let Err(e) = auth::init_auth() {
                log::error!("❌ AUTH OS initialization failed: {}", e);
            } else {
                log::info!("✅ AUTH OS v∞ initialized successfully");
            }

            // Initialize SingularityEngine with app_handle
            let singularity_engine = Arc::new(singularity_state::SingularityEngine::new(app.handle().clone()));
            app.manage(singularity_engine.clone());

            // 🎯 Initialize OMEGA Conversation Engine (v19.5.2)
            // IMPORTANT: ne pas crasher le runtime stable si la passphrase n'est pas définie.
            // On démarre en mode "bootstrap" (stockage séparé) pour laisser l'UI s'ouvrir et
            // permettre la configuration sécurisée, sans corrompre un stockage chiffré attendu.
            let app_data_dir = app
                .path()
                .app_data_dir()
                .unwrap_or_else(|_| std::path::PathBuf::from("/tmp/titane"));

            let (storage_dir, password) = match std::env::var("TITANE_SECRETS_PASSPHRASE") {
                Ok(value) => (app_data_dir, value),
                Err(_) if cfg!(debug_assertions) => (
                    app_data_dir,
                    "default-dev-passphrase-change-in-production".to_string(),
                ),
                Err(_) => {
                    log::error!(
                        "⚠️ TITANE∞: TITANE_SECRETS_PASSPHRASE manquante en build release → mode bootstrap (stockage séparé)"
                    );
                    log::error!(
                        "   → Définis TITANE_SECRETS_PASSPHRASE (>=12+ chars) et redémarre pour activer le stockage chiffré principal"
                    );

                    let bootstrap_dir = app_data_dir.join("bootstrap_no_passphrase");
                    (bootstrap_dir, String::new())
                }
            };

            // AIRouter initialization (for OMEGA pipeline)
            let ai_router = Arc::new(tokio::sync::RwLock::new(
                titane_infinity::ai::router::AIRouter::new(None, None) // Will be configured later
            ));

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

            app.manage(conversation_engine);
            log::info!("✅ OMEGA Conversation Engine v19.5.2 initialized");

            // Initialize providers asynchronously within Tauri's async runtime
            let chat_orch_clone = chat_orchestrator.clone();
            tauri::async_runtime::spawn(async move {
                overdrive::chat_orchestrator::initialize_providers_async(&chat_orch_clone).await;
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

                    let request = overdrive::chat_orchestrator::ChatRequest {
                        message: "Réponds uniquement: OK".to_string(),
                        conversation_id: Some("smoke-runtime-chat".to_string()),
                        provider: "ollama".to_string(),
                        model: Some("llama3.1:latest".to_string()),
                        streaming: false,
                        images: None,
                        system_prompt: Some("Réponds uniquement: OK".to_string()),
                    };

                    match overdrive::chat_orchestrator::chat_send_message(
                        request,
                        app_handle.state::<overdrive::chat_orchestrator::ChatOrchestratorState>(),
                    )
                    .await
                    {
                        Ok(response) => {
                            let content_preview = response
                                .message
                                .content
                                .chars()
                                .take(120)
                                .collect::<String>();

                            println!(
                                "[SMOKE-RUNTIME-CHAT] chat_send_message ok provider={} latency_ms={} preview={}",
                                response.message.provider,
                                response.latency_ms,
                                content_preview
                            );
                        }
                        Err(err) => {
                            eprintln!("[SMOKE-RUNTIME-CHAT] chat_send_message error: {err}");
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
                        // Auto-open DevTools in dev mode
                        #[cfg(debug_assertions)]
                        {
                            main_window.open_devtools();
                            log::info!("🛠️ DevTools opened automatically (dev mode)");
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

            // Core messaging
            send_message,
            ollama_query,
            // OMEGA Conversation Engine Commands (v19.5.2)
            conversation_engine::commands::create_new_conversation,
            conversation_engine::commands::conversation_generate,
            conversation_engine::commands::conversation_process_message,
            conversation_engine::commands::conversation_health_check,
            conversation_engine::commands::conversation_memory_stats,
            // Chat Orchestrator Commands (CHAT PIPELINE v21 + R04 Memory Integration)
            overdrive::chat_orchestrator::chat_send_message,
            overdrive::chat_orchestrator::chat_stream_message,
            overdrive::chat_orchestrator::chat_get_providers_status,
            overdrive::chat_orchestrator::chat_check_providers,
            overdrive::chat_orchestrator::chat_get_conversation,
            overdrive::chat_orchestrator::chat_create_conversation,
            overdrive::chat_orchestrator::chat_delete_conversation,
            overdrive::chat_orchestrator::chat_generate_suggestions,
            overdrive::chat_orchestrator::chat_get_memory_stats, // R04 FIX
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

            // Avatar floating window / display state
            avatar::avatar_floating_commands::avatar_get_display_state,
            avatar::avatar_floating_commands::avatar_set_display_state,
            avatar::avatar_floating_commands::avatar_update_display_state,
            avatar::avatar_floating_commands::avatar_reset_display_state,
            avatar::avatar_floating_commands::avatar_mode_floating,
            avatar::avatar_floating_commands::avatar_mode_embed,
            avatar::avatar_floating_commands::avatar_mode_hidden,
            avatar::avatar_floating_commands::avatar_set_position,
            avatar::avatar_floating_commands::avatar_set_size,
            avatar::avatar_floating_commands::avatar_set_scale,
            avatar::avatar_floating_commands::avatar_set_opacity,
            avatar::avatar_floating_commands::avatar_set_always_on_top,
            avatar::avatar_floating_commands::avatar_set_locked,
            avatar::avatar_floating_commands::avatar_set_mirror_mode,
            avatar::avatar_floating_commands::avatar_set_click_through,
            avatar::avatar_floating_commands::avatar_set_anchor,
            avatar::avatar_floating_commands::avatar_set_anchor_by_name,
            avatar::avatar_floating_commands::avatar_list_screens,
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

            // SINGULARITY-FUSION (AutoFix/AutoHeal/CrashGuard/Performance/Pipeline)
            singularity_fusion::autofix_detect_rust_warnings,
            singularity_fusion::autofix_detect_typescript_errors,
            singularity_fusion::autofix_detect_react_hook_violations,
            singularity_fusion::autofix_detect_invalid_states,
            singularity_fusion::autofix_fix_issue,
            singularity_fusion::autofix_fix_all,
            singularity_fusion::autofix_get_history,
            singularity_fusion::autofix_get_stats,
            singularity_fusion::autofix_reset,
            singularity_fusion::autofix_rust_warning,
            singularity_fusion::autofix_typescript_error,
            singularity_fusion::autofix_reset_state,
            singularity_fusion::autofix_restart_pipeline,
            singularity_fusion::autofix_restart_tauri_command,
            singularity_fusion::autofix_resync_lipsync,
            singularity_fusion::autofix_add_mutex,

            singularity_fusion::autoheal_detect_broken,
            singularity_fusion::autoheal_detect_broken_modules,
            singularity_fusion::autoheal_reset_cognitive,
            singularity_fusion::autoheal_init_cognitive,
            singularity_fusion::autoheal_reset_adaptive,
            singularity_fusion::autoheal_clear_narrative,
            singularity_fusion::autoheal_init_narrative,
            singularity_fusion::autoheal_stop_avatar,
            singularity_fusion::autoheal_reload_avatar,
            singularity_fusion::autoheal_start_avatar,
            singularity_fusion::autoheal_clear_tts_queue,
            singularity_fusion::autoheal_init_tts,
            singularity_fusion::autoheal_resync_lipsync,
            singularity_fusion::autoheal_rebuild_memory_index,
            singularity_fusion::autoheal_validate_memory,
            singularity_fusion::autoheal_stop_pipeline,
            singularity_fusion::autoheal_clear_pipeline,
            singularity_fusion::autoheal_start_pipeline,
            singularity_fusion::autoheal_heal_cognitive_module,
            singularity_fusion::autoheal_heal_avatar_module,
            singularity_fusion::autoheal_heal_tts_module,
            singularity_fusion::autoheal_heal_lipsync_module,
            singularity_fusion::autoheal_heal_memory_module,
            singularity_fusion::autoheal_heal_pipeline,
            singularity_fusion::autoheal_resync_state,
            singularity_fusion::autoheal_get_history,
            singularity_fusion::autoheal_reset,

            singularity_fusion::crashguard_detect_threats,
            singularity_fusion::crashguard_clear_memory,
            singularity_fusion::crashguard_kill_thread,
            singularity_fusion::crashguard_restart_module,
            singularity_fusion::crashguard_emergency_shutdown,
            singularity_fusion::crashguard_reset_pipeline,
            singularity_fusion::crashguard_emergency_rollback,
            singularity_fusion::crashguard_get_active_threats,
            singularity_fusion::crashguard_get_stats,

            singularity_fusion::performance_get_metrics,
            singularity_fusion::performance_throttle_cpu,
            singularity_fusion::performance_optimize_gpu,
            singularity_fusion::performance_reduce_render_quality,
            singularity_fusion::performance_compress_memory,
            singularity_fusion::performance_reset_optimizations,

            singularity_fusion::pipeline_analyze_intention,
            singularity_fusion::pipeline_generate_cognitive_response,
            singularity_fusion::pipeline_prepare_tts,
            singularity_fusion::pipeline_prepare_avatar_animation,
            singularity_fusion::pipeline_get_stats,
            singularity_fusion::pipeline_pause,
            singularity_fusion::pipeline_resume,
            singularity_fusion::pipeline_reset,
            singularity_fusion::pipeline_validate,
            // Singularity State Commands (SINGULARITY API v21 REPAIR - 18 commands)
            singularity_state::commands::singularity_get_full_state,
            singularity_state::commands::singularity_get_physical,
            singularity_state::commands::singularity_get_cognitive,
            singularity_state::commands::singularity_get_symbolic,
            singularity_state::commands::singularity_get_adaptive,
            singularity_state::commands::singularity_get_meta,
            singularity_state::commands::singularity_get_global_coherence,
            singularity_state::commands::singularity_is_critical,
            singularity_state::commands::singularity_update_physical,
            singularity_state::commands::singularity_update_cognitive,
            singularity_state::commands::singularity_update_symbolic,
            singularity_state::commands::singularity_update_adaptive,
            singularity_state::commands::singularity_update_meta,
            singularity_state::commands::singularity_update_full_state,
            singularity_state::commands::sync_singularity, // ✅ v∞.FIX - Auto-sync command
            singularity_state::commands::singularity_save_state,
            singularity_state::commands::singularity_load_state,
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
            secure_commands::get_permission_audit, // ✅ v26.2.3: Permission audit log
            secure_commands::check_system_integrity, // ✅ v21.5: System integrity check
            // ✅ v27 (B25): Secrets status + delete (Governance Center)
            secure_commands::get_secrets_status,
            secure_commands::has_secret,
            secure_commands::delete_secret,
            // Runtime Configuration Bridge v∞ (Frontend config without secrets)
            runtime_config::get_runtime_config,
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
            // System Center Commands (6 commands)
            commands_v21::system_center_commands::sc_clear_logs,
            commands_v21::system_center_commands::sc_add_log,
            commands_v21::system_center_commands::sc_initialize_cluster,
            commands_v21::system_center_commands::sc_shutdown_cluster,
            commands_v21::system_center_commands::sc_hypervision_stop,
            commands_v21::system_center_commands::sc_hypervision_clear_anomalies,
            commands_v21::system_center_commands::sc_hypervision_resolve_anomaly,
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
            // Persistent Memory Commands (4 commands)
            commands_v21::persistent_memory_commands::persistent_memory_promote_entry,
            commands_v21::persistent_memory_commands::persistent_memory_archive_entry,
            commands_v21::persistent_memory_commands::persistent_memory_delete_entry,
            commands_v21::persistent_memory_commands::persistent_memory_add_to_bundle,
            // UI Theme Commands (2 commands)
            commands_v21::ui_theme_commands::save_ui_theme,
            commands_v21::ui_theme_commands::load_ui_theme,
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
            config::update::update_runtime_config,
            config::update::update_chat_engine_config,
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
            persistence::commands::titan_reset_module,
            persistence::commands::titan_dump_raw_state,
            persistence::commands::titan_run_full_integrity_check,
            persistence::commands::titan_memory_doctor_diagnose,
            persistence::commands::titan_memory_doctor_summary,
            persistence::commands::titan_memory_doctor_heal,
            persistence::commands::titan_memory_doctor_compact,
            persistence::commands::titan_memory_doctor_export,

            // Onboarding commands
            onboarding::is_onboarding_complete,
            onboarding::complete_onboarding,
            onboarding::get_onboarding_preferences,
        ])
        .run(tauri::generate_context!())
        .unwrap_or_else(|e| {
            eprintln!("❌ TITANE∞ FATAL: Tauri application failed to start");
            eprintln!("   Error: {:?}", e);
            eprintln!("   → Please check logs and system requirements.");
            std::process::exit(1);
        });

    log::info!("TITANE∞ v19.5.2 shutdown - Security System offline");
}
