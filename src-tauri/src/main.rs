// TITANE_INFINITY v∞.19.2.3Ω — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞.19.2.3Ω — MAIN ENTRY POINT (Singularity Architecture)
//   20 Engines Unified + Cognitive Layer + SingularityDashboard
// ═══════════════════════════════════════════════════════════════

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// ═══════════════════════════════════════════════════════════════
// TITANE∞ HARDENING: Import Hygiene v∞.19.2.3Ω
// DO NOT REMOVE: Each import is actively used in production code
// ═══════════════════════════════════════════════════════════════

// Tauri core (Manager trait required for .path() and .get_webview_window())
// Required for both app_data_dir access and DevTools auto-open
use tauri::Manager;
use std::sync::{Arc, RwLock};
use tokio::sync::RwLock as TokioRwLock;

// TITANE∞ command modules
use titane_infinity::{
    control_panel_commands,
    mock_commands,
    overdrive, // ✅ v16.1 CHAT ORCHESTRATOR
    persistence, // ✅ v∞.MPE PERSISTENCE ENGINE
    runtime_config,
    secure_commands,
    time_commands,
};

use titane_infinity::security::secrets_engine::SecureSecretsEngine;
use titane_infinity::ia::UnifiedIAEngine;
use titane_infinity::multi_agents::AgentPermissionManager;
use titane_infinity::singularity::ia_context::IAContext;

#[cfg(all(not(feature = "mock"), feature = "full"))]
use titane_infinity::chat_engine;

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

// Hybrid Engine commands v∞.26.0
mod hybrid_commands {
    include!("commands/hybrid.rs");
}

// IA Commands v∞.19.3Ω - OpenAI + Claude + Unified Engine
mod ia_commands {
    include!("commands/ia_commands.rs");
}

// Multi-Agents Commands v∞.19.3Ω - Agent permissions management
mod multi_agents_commands {
    include!("commands/multi_agents_commands.rs");
}

// IA Context Commands v∞.19.3Ω - Phase 8 Singularity Integration
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

// Cognitive system (always available)
use titane_infinity::cognitive::{
    AnalysisEngine, ConsistencyEngine, EvolutionCognitiveEngine, IntegrationEngine,
};
use tokio::sync::Mutex;

// Core Singularity State (for CoherenceEngine v20.0)
use titane_infinity::core::state::SingularityState;

// QA System v19.8
use titane_infinity::qa::qa_commands::QaState;

// Singularity State v∞ (v20)
use titane_infinity::singularity::singularity_commands::SingularityStateGlobal;

// Adaptive Engine v21
use titane_infinity::adaptive::adaptive_commands::AdaptiveEngineGlobal;

// Narrative Engine v22
use titane_infinity::narrative::narrative_commands::NarrativeEngineGlobal;

// Immersive Avatar Engine v23
use titane_infinity::avatar::AvatarEngineGlobal;

// Cloud Sync Engine v∞ (OPUS #13)
use titane_infinity::cloud::commands::CloudSyncState;

// Memory Evolution Engine++ v∞ (OPUS #14)
use titane_infinity::memory_evolution::MemoryEvolutionState;

// System Identity Engine v∞ (OPUS #15)
use titane_infinity::identity::IdentityEngineState;

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

mod security;

use security::{SecurityManager, AuditEvent, AuditEventType};

pub struct AppState {
    // ...existing code...
    security_manager: Arc<SecurityManager>,
}

#[tauri::command]
async fn send_message(
    message: String,
    state: tauri::State<'_, AppState>
) -> Result<String, String> {
    // Security checks
    state.security_manager
        .validate_and_rate_limit("default_user", &message)
        .await
        .map_err(|e| e.to_string())?;
    
    // Audit log
    let _ = state.security_manager.audit_logger.log(AuditEvent {
        timestamp: chrono::Utc::now(),
        event_type: AuditEventType::DataAccess,
        user_id: "default_user".to_string(),
        details: serde_json::json!({ 
            "action": "send_message",
            "message_length": message.len()
        }),
        ip_address: None,
    }).await;
    
    // ...existing code...
    
    Ok("Message processed".to_string())
}

fn main() {
    let log_dir = dirs::data_local_dir()
        .unwrap()
        .join("titane")
        .join("logs");
    std::fs::create_dir_all(&log_dir).ok();
    
    let security_manager = Arc::new(SecurityManager::new(
        log_dir.join("audit.log")
    ));

    let app_state = AppState {
        // ...existing code...
        security_manager,
    };

    tauri::Builder::default()
        .manage(app_state)
        // ...existing code...
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    log::info!("TITANE∞ v∞ shutdown - Security System offline");
}
