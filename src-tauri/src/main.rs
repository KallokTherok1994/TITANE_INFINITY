// TITANE_INFINITY v19.5.2 — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v19.5.2 — MAIN ENTRY POINT (Singularity Architecture)
//   20 Engines Unified + Cognitive Layer + SingularityDashboard
//   Onboarding System + Configuration Hub + Production Ready
// ═══════════════════════════════════════════════════════════════

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![allow(dead_code)]

// ═══════════════════════════════════════════════════════════════
// TITANE∞ HARDENING: Import Hygiene v19.5.2
// DO NOT REMOVE: Each import is actively used in production code
// ═══════════════════════════════════════════════════════════════

// Tauri core (Manager trait required for .path() and .get_webview_window())
// Required for both app_data_dir access and DevTools auto-open
use tauri::Manager;

// TITANE∞ command modules
use std::sync::Arc;

#[cfg(all(not(feature = "mock"), feature = "full"))]
use titane_infinity::chat_engine;

// OMEGA Conversation Engine v19.5.2
use titane_infinity::conversation_engine;

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
mod audio {
    pub mod recording_engine {
        include!("audio/recording_engine.rs");
    }
    pub mod commands {
        include!("audio/commands.rs");
    }
}

// Secure Commands v∞ (Super-Prompts H, I, J, K) - API Key Management
mod secure_commands {
    include!("secure_commands.rs");
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

mod core {
    pub mod tapi_error {
        include!("core/tapi_error.rs");
    }
    pub mod utils {
        include!("core/utils.rs");
    }
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

// IA Commands v19.5.2 - OpenAI + Claude + Unified Engine
mod ia_commands {
    include!("commands/ia_commands.rs");
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
    // Safe fallback for log directory if data_local_dir() fails
    let log_dir = dirs::data_local_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("/tmp"))
        .join("titane")
        .join("logs");
    std::fs::create_dir_all(&log_dir).ok();

    let security_manager = Arc::new(SecurityManager::new(log_dir.join("audit.log")));

    // Initialize Secure Secrets Engine (AES-256-GCM encrypted storage)
    let secrets_passphrase = std::env::var("TITANE_SECRETS_PASSPHRASE")
        .ok()
        .or_else(|| Some("default-dev-passphrase-change-in-production".to_string()));

    let secrets_engine = match security::secrets_engine::SecureSecretsEngine::new(secrets_passphrase) {
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

    let app_state = AppState {
        // ...existing code...
        security_manager,
    };

    // Initialize Singularity Cortex OS v∞ (SUPER PROMPT #7)
    let singularity_cortex = SingularityCortexState::new();

    // Initialize Multi-IA Orchestrator v∞ (SUPER PROMPT #8)
    let multi_ai_orchestrator = OrchestratorState::new();

    tauri::Builder::default()
        .manage(app_state)
        .manage(singularity_cortex)
        .manage(multi_ai_orchestrator)
        .manage(secrets_engine)
        .manage(chat_orchestrator.clone())
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
            let storage_dir = app.path().app_data_dir()
                .unwrap_or_else(|_| std::path::PathBuf::from("/tmp/titane"));
            let password = std::env::var("TITANE_SECRETS_PASSPHRASE")
                .unwrap_or_else(|_| "default-dev-passphrase-change-in-production".to_string());
            
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
                ).map_err(|e| {
                    eprintln!("❌ TITANE∞ FATAL: Failed to initialize OMEGA Conversation Engine");
                    eprintln!("   Error: {:?}", e);
                    eprintln!("   → Please check your configuration and storage permissions.");
                    std::process::exit(1);
                }).unwrap()
            );
            
            app.manage(conversation_engine);
            log::info!("✅ OMEGA Conversation Engine v19.5.2 initialized");
            
            // Initialize providers asynchronously within Tauri's async runtime
            let chat_orch_clone = chat_orchestrator.clone();
            tauri::async_runtime::spawn(async move {
                overdrive::chat_orchestrator::initialize_providers_async(&chat_orch_clone).await;
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Core messaging
            send_message,
            ollama_query,
            // OMEGA Conversation Engine Commands (v19.5.2)
            conversation_engine::commands::create_new_conversation,
            conversation_engine::commands::conversation_generate,
            conversation_engine::commands::conversation_process_message,
            conversation_engine::commands::conversation_health_check,
            conversation_engine::commands::conversation_memory_stats,
            // Chat Orchestrator Commands (CHAT PIPELINE v21)
            overdrive::chat_orchestrator::chat_send_message,
            overdrive::chat_orchestrator::chat_stream_message,
            overdrive::chat_orchestrator::chat_get_providers_status,
            overdrive::chat_orchestrator::chat_check_providers,
            overdrive::chat_orchestrator::chat_get_conversation,
            overdrive::chat_orchestrator::chat_create_conversation,
            overdrive::chat_orchestrator::chat_delete_conversation,
            overdrive::chat_orchestrator::chat_generate_suggestions,
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
            // Singularity State Commands (SINGULARITY API v21 REPAIR - 17 commands)
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
            singularity_state::commands::singularity_save_state,
            singularity_state::commands::singularity_load_state,
            // System Center Diagnostics (v∞)
            system_center::diagnostics::sc_run_quick_diagnostics,
            system_center::diagnostics::sc_run_full_diagnostics,
            system_center::diagnostics::sc_get_diagnostic_status,
            // Secure API Key Management (v∞ - Super-Prompts H, I, J, K)
            secure_commands::chat_set_gemini_key,
            secure_commands::get_gemini_key_status,
            secure_commands::chat_set_openai_key,
            secure_commands::get_openai_key_status,
            secure_commands::chat_set_anthropic_key,
            secure_commands::get_anthropic_key_status,
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
        ])
        .run(tauri::generate_context!())
        .map_err(|e| {
            eprintln!("❌ TITANE∞ FATAL: Tauri application failed to start");
            eprintln!("   Error: {:?}", e);
            eprintln!("   → Please check logs and system requirements.");
            std::process::exit(1);
        })
        .unwrap();

    log::info!("TITANE∞ v19.5.2 shutdown - Security System offline");
}
