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

// DevOps commands (module local)
mod devops_commands {
    include!("commands/devops.rs");
}

// System Health commands (module local)
mod system_health_commands {
    include!("commands/system_health.rs");
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

// Cognitive system (always available)
use titane_infinity::cognitive::{
    AnalysisEngine, ConsistencyEngine, EvolutionCognitiveEngine, IntegrationEngine,
};
use tokio::sync::Mutex;

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

#[tokio::main]
async fn main() {
    // Load .env file for API keys and configuration
    dotenv::dotenv().ok();

    // Initialize logger
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    println!("╔══════════════════════════════════════════════════════════════╗");
    println!("║     TITANE∞ v16 — COGNITIVE OS ACTIVE                       ║");
    println!("║     Reasoning + Learning + Self-Aware + Secure              ║");
    println!("╚══════════════════════════════════════════════════════════════╝");

    log::info!("🧠 Starting TITANE∞ v16 Cognitive System...");

    // ═══════════════════════════════════════════════════════════════
    // PRE-BOOT VALIDATION (Super-Prompt L4)
    // ═══════════════════════════════════════════════════════════════
    match titane_infinity::security::pre_boot_validation::validate_pre_boot().await {
        Ok(validation) => {
            if validation.is_valid() {
                log::info!("✅ Pre-boot validation passed");
            } else {
                log::error!("❌ Pre-boot validation failed - aborting");
                log::error!("{}", validation.report());
                std::process::exit(1);
            }
        }
        Err(e) => {
            log::error!("❌ Pre-boot validation error: {}", e);
            std::process::exit(1);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZE SECURITY SYSTEM (Super-Prompts J, K)
    // ═══════════════════════════════════════════════════════════════
    // TITANE∞ HARDENING: Scoped imports for security modules
    use titane_infinity::security::encryption;
    use titane_infinity::security::sandbox;

    if let Err(e) = encryption::initialize_crypto_engine().await {
        log::error!("❌ Failed to initialize crypto engine: {}", e);
        std::process::exit(1);
    }

    // Initialize VaultEngine with master key (Super-Prompt J3)
    let master_key = encryption::get_master_key()
        .await
        .expect("Master key not initialized");
    if let Err(e) = titane_infinity::memory_persistence::init_vault_engine(&master_key).await {
        log::error!("❌ Failed to initialize VaultEngine: {}", e);
        std::process::exit(1);
    }

    if let Err(e) = sandbox::initialize_sandbox().await {
        log::error!("❌ Failed to initialize sandbox: {}", e);
        std::process::exit(1);
    }

    log::info!("✅ Security System initialized");
    log::info!("✅ VaultEngine: Memory encryption ready");
    log::info!("✅ Permissions: ROOT/SYSTEM/IA/USER active");
    log::info!("✅ Encryption: AES-256-GCM + Ed25519");
    log::info!("✅ Sandbox: /userdata/imports/ ready");

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZE SECURE SECRETS ENGINE v∞
    // ═══════════════════════════════════════════════════════════════
    let secrets_passphrase = std::env::var("TITANE_SECRETS_PASSPHRASE").ok();
    let secrets_engine = match SecureSecretsEngine::new(secrets_passphrase) {
        Ok(engine) => engine,  // ✅ Pas de Arc::new - SecureSecretsEngine implémente Clone et utilise Arc en interne
        Err(err) => {
            log::error!("❌ Failed to initialize SecureSecretsEngine: {}", err);
            std::process::exit(1);
        }
    };

    log::info!("✅ SecureSecretsEngine v∞ ready");

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZE UNIFIED IA ENGINE v∞.19.3Ω (OpenAI + Claude + Gemini)
    // ═══════════════════════════════════════════════════════════════
    log::info!("🤖 Initializing Unified IA Engine v∞.19.3Ω...");
    let unified_ia = Arc::new(UnifiedIAEngine::new(Arc::new(secrets_engine.clone())));
    match unified_ia.initialize().await {
        Ok(engines) => {
            log::info!("✅ Unified IA Engine: {} moteurs disponibles", engines.len());
            for engine in engines {
                log::info!("   - {}", engine.display_name());
            }
        }
        Err(e) => {
            log::warn!("⚠️ Unified IA Engine: Initialisation partielle ({})", e);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZE MULTI-AGENTS PERMISSION SYSTEM v∞.19.3Ω
    // ═══════════════════════════════════════════════════════════════
    log::info!("🤖 Initializing Multi-Agents Permission System v∞.19.3Ω...");
    let agent_manager = Arc::new(RwLock::new(AgentPermissionManager::new()));
    log::info!("✅ Multi-Agents: 6 default agents registered");
    log::info!("   - Security Guard (NoExternal)");
    log::info!("   - Code Generator (OpenAI)");
    log::info!("   - Analyst (Claude)");
    log::info!("   - Creative Writer (Gemini)");
    log::info!("   - Conversational (AllExternal)");
    log::info!("   - Orchestrator (AllExternal)");

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZE IA CONTEXT v∞.19.3Ω (Phase 8 - Singularity)
    // ═══════════════════════════════════════════════════════════════
    log::info!("🧠 Initializing IA Context State v∞.19.3Ω...");
    let ia_context_state = Arc::new(RwLock::new(IAContext::new()));
    log::info!("✅ IA Context: State tracking initialized");
    log::info!("   - Multi-engine fallback: enabled");
    log::info!("   - Request history: max 100 entries");
    log::info!("   - Agent permissions: tracking enabled");

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZE COGNITIVE SYSTEM v16
    // ═══════════════════════════════════════════════════════════════
    log::info!("🧠 Initializing Cognitive Layer v16...");
    let cognitive_state = CognitiveSystemState::new();
    log::info!("✅ Cognitive Layer v16: 4 engines active");
    log::info!("   - AnalysisEngine: Pattern detection");
    log::info!("   - ConsistencyEngine: Coherence management");
    log::info!("   - IntegrationEngine: Signal fusion");
    log::info!("   - EvolutionEngine: Learning & optimization");

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZE QA SYSTEM v19.8
    // ═══════════════════════════════════════════════════════════════
    log::info!("🧪 Initializing QA System v19.8...");
    let qa_state = QaState::new();
    log::info!("✅ QA System v19.8: Automated testing engine active");

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZE SINGULARITY STATE v∞ (v20)
    // ═══════════════════════════════════════════════════════════════
    log::info!("🌌 Initializing SingularityState v∞...");
    let singularity_state = SingularityStateGlobal::new();
    log::info!("✅ SingularityState v∞: 20 engines unified");

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZE ADAPTIVE ENGINE v21
    // ═══════════════════════════════════════════════════════════════
    log::info!("🧠 Initializing AdaptiveEngine v21...");
    let adaptive_engine = AdaptiveEngineGlobal::new();
    log::info!("✅ AdaptiveEngine v21: Auto-optimization active");

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZE NARRATIVE ENGINE v22
    // ═══════════════════════════════════════════════════════════════
    log::info!("📖 Initializing NarrativeEngine v22...");
    let narrative_engine = NarrativeEngineGlobal::new();
    log::info!("✅ NarrativeEngine v22: Expressive layer active");

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZE IMMERSIVE AVATAR ENGINE v23
    // ═══════════════════════════════════════════════════════════════
    log::info!("🎭 Initializing ImmersiveAvatarEngine v23...");
    let avatar_engine = AvatarEngineGlobal::new();
    log::info!("✅ ImmersiveAvatarEngine v23: Voice + Lip-Sync + Expressions active");

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZE FUSION ENGINE v∞.27.0 (Super Prompt #17)
    // ═══════════════════════════════════════════════════════════════
    log::info!("🔗 Initializing FusionEngine v∞.27.0...");
    let fusion_state = fusion::FusionEngineState::default();
    log::info!("✅ FusionEngine v∞.27.0: Dataset + Memory + Logs unified");

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZE CHAT ORCHESTRATOR v16 (OVERDRIVE)
    // ═══════════════════════════════════════════════════════════════
    log::info!("💬 Initializing ChatOrchestrator v16...");
    let chat_orchestrator_state = overdrive::chat_orchestrator::init();

    // Initialize providers async (use existing tokio runtime)
    overdrive::chat_orchestrator::initialize_providers_async(&chat_orchestrator_state).await;

    // Load Gemini API key from secure secrets (fallback to environment for migration)
    let mut gemini_ready = false;
    if let Ok(Some(api_key)) = secrets_engine.get_secret("gemini_api_key") {
        {
            let mut key = chat_orchestrator_state.gemini_api_key.write().await;
            *key = Some(api_key.clone());
        }
        chat_orchestrator_state
            .set_provider_availability("gemini", true)
            .await;
        log::info!("✅ Gemini API key loaded from SecureSecretsEngine");
        gemini_ready = true;
    } else if let Ok(env_key) = std::env::var("GEMINI_API_KEY") {
        match secrets_engine.set_secret("gemini_api_key", env_key.clone()) {
            Ok(_) => {
                log::info!("🔐 Migrated GEMINI_API_KEY from environment into SecureSecretsEngine")
            }
            Err(err) => log::error!(
                "❌ Failed to persist Gemini API key into SecureSecretsEngine: {}",
                err
            ),
        }
        {
            let mut key = chat_orchestrator_state.gemini_api_key.write().await;
            *key = Some(env_key);
        }
        chat_orchestrator_state
            .set_provider_availability("gemini", true)
            .await;
        gemini_ready = true;
    }

    if !gemini_ready {
        log::warn!("⚠️ Gemini API key not configured. Cloud provider disabled");
    }

    // Load OpenAI API key from secure secrets (fallback to environment for migration)
    let mut openai_ready = false;
    if let Ok(Some(api_key)) = secrets_engine.get_secret("openai_api_key") {
        {
            let mut key = chat_orchestrator_state.openai_api_key.write().await;
            *key = Some(api_key.clone());
        }
        chat_orchestrator_state
            .set_provider_availability("openai", true)
            .await;
        log::info!("✅ OpenAI API key loaded from SecureSecretsEngine");
        openai_ready = true;
    } else if let Ok(env_key) = std::env::var("OPENAI_API_KEY") {
        match secrets_engine.set_secret("openai_api_key", env_key.clone()) {
            Ok(_) => {
                log::info!("🔐 Migrated OPENAI_API_KEY from environment into SecureSecretsEngine")
            }
            Err(err) => log::error!(
                "❌ Failed to persist OpenAI API key into SecureSecretsEngine: {}",
                err
            ),
        }
        {
            let mut key = chat_orchestrator_state.openai_api_key.write().await;
            *key = Some(env_key);
        }
        chat_orchestrator_state
            .set_provider_availability("openai", true)
            .await;
        openai_ready = true;
    }

    if !openai_ready {
        log::warn!("⚠️ OpenAI API key not configured. OpenAI provider disabled");
    }

    // Load Anthropic API key from secure secrets (fallback to environment for migration)
    let mut anthropic_ready = false;
    if let Ok(Some(api_key)) = secrets_engine.get_secret("anthropic_api_key") {
        {
            let mut key = chat_orchestrator_state.anthropic_api_key.write().await;
            *key = Some(api_key.clone());
        }
        chat_orchestrator_state
            .set_provider_availability("anthropic", true)
            .await;
        log::info!("✅ Anthropic API key loaded from SecureSecretsEngine");
        anthropic_ready = true;
    } else if let Ok(env_key) = std::env::var("ANTHROPIC_API_KEY") {
        match secrets_engine.set_secret("anthropic_api_key", env_key.clone()) {
            Ok(_) => {
                log::info!("🔐 Migrated ANTHROPIC_API_KEY from environment into SecureSecretsEngine")
            }
            Err(err) => log::error!(
                "❌ Failed to persist Anthropic API key into SecureSecretsEngine: {}",
                err
            ),
        }
        {
            let mut key = chat_orchestrator_state.anthropic_api_key.write().await;
            *key = Some(env_key);
        }
        chat_orchestrator_state
            .set_provider_availability("anthropic", true)
            .await;
        anthropic_ready = true;
    }

    if !anthropic_ready {
        log::warn!("⚠️ Anthropic API key not configured. Anthropic provider disabled");
    }

    log::info!("✅ ChatOrchestrator v16: Gemini + OpenAI + Anthropic + Ollama + Local ready");

    #[cfg(all(not(feature = "mock"), feature = "full"))]
    log::info!("⚡ Initializing ChatEngine v∞ (high-performance mode)...");
    #[cfg(all(not(feature = "mock"), feature = "full"))]
    let chat_engine_state =
        match chat_engine::bootstrap_from_env(None, Some(secrets_engine.clone())).await {
            Ok(state) => {
                log::info!("✅ ChatEngine v∞ ready: streaming, memory, TTS active");
                state
            }
            Err(err) => {
                log::error!("❌ Failed to initialize ChatEngine v∞: {}", err);
                std::process::exit(1);
            }
        };

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZE SINGULARITY-FUSION vΩ
    // ═══════════════════════════════════════════════════════════════
    log::info!("🌀 Initializing SINGULARITY-FUSION vΩ...");
    let fusion_engine_state = titane_infinity::singularity_fusion::FusionEngineState::default();
    let unified_pipeline_state =
        titane_infinity::singularity_fusion::UnifiedPipelineState::default();
    let autofix_state = titane_infinity::singularity_fusion::AutoFixState::default();
    let autoheal_state = titane_infinity::singularity_fusion::AutoHealState::default();
    let performance_state = titane_infinity::singularity_fusion::PerformanceState::default();
    let crashguard_state = titane_infinity::singularity_fusion::CrashGuardState::default();
    log::info!("✅ SINGULARITY-FUSION vΩ: 8 engines unified");

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZE EVOLUTION ENGINE vΩ∞
    // ═══════════════════════════════════════════════════════════════
    log::info!("🧬 Initializing EVOLUTION ENGINE vΩ∞...");
    let evolution_engine_state = titane_infinity::evolution::create_evolution_state();
    log::info!("✅ EVOLUTION ENGINE vΩ∞: Continuous improvement active");

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZE VOICE ENGINE v∞
    // ═══════════════════════════════════════════════════════════════
    log::info!("🎤 Initializing VOICE ENGINE v∞...");
    let voice_engine_state = overdrive::voice_engine::init();
    log::info!("✅ VOICE ENGINE v∞: Audio pipeline ready");

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZE CLOUD SYNC ENGINE v∞
    // ═══════════════════════════════════════════════════════════════
    log::info!("☁️ Initializing CLOUD SYNC ENGINE v∞...");
    let cloud_sync_state = CloudSyncState::default();
    log::info!("✅ CLOUD SYNC ENGINE v∞: Encrypted vault ready");

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZE MEMORY EVOLUTION ENGINE++ v∞
    // ═══════════════════════════════════════════════════════════════
    log::info!("🧠 Initializing MEMORY EVOLUTION ENGINE++ v∞...");
    let memory_evolution_state = MemoryEvolutionState::default();
    log::info!("✅ MEMORY EVOLUTION ENGINE++ v∞: Cognitive memory pipeline ready");

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZE SYSTEM IDENTITY ENGINE v∞
    // ═══════════════════════════════════════════════════════════════
    log::info!("🎭 Initializing SYSTEM IDENTITY ENGINE v∞...");
    let identity_engine_state = IdentityEngineState::default();
    log::info!("✅ SYSTEM IDENTITY ENGINE v∞: Personality matrix ready");

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZE IPC PROFILER v19.5.0 (Phase A)
    // ═══════════════════════════════════════════════════════════════
    log::info!("📊 Initializing IPC PERFORMANCE PROFILER v19.5.0...");
    let ipc_profiler = Arc::new(titane_infinity::profiling::IPCProfiler::default());
    log::info!("✅ IPC PROFILER v19.5.0: Performance monitoring ready");

    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .manage(cognitive_state)
        .manage(qa_state)
        .manage(singularity_state)
        .manage(adaptive_engine)
        .manage(narrative_engine)
        .manage(avatar_engine)
        .manage(fusion_state) // ✅ v∞.27.0 Fusion Engine
        .manage(chat_orchestrator_state)
        .manage(secrets_engine)  // ✅ v∞ Gère directement SecureSecretsEngine (implémente Clone)
        .manage(unified_ia.clone()) // ✅ v∞.19.3Ω Unified IA Engine
        .manage(agent_manager.clone()) // ✅ v∞.19.3Ω Multi-Agents Permission System
        .manage(ia_context_state.clone()) // ✅ v∞.19.3Ω IA Context State (Phase 8)
        .manage(fusion_engine_state)
        .manage(unified_pipeline_state)
        .manage(autofix_state)
        .manage(autoheal_state)
        .manage(performance_state)
        .manage(crashguard_state)
        .manage(evolution_engine_state)
        .manage(voice_engine_state)
        .manage(cloud_sync_state)
        .manage(memory_evolution_state)
        .manage(identity_engine_state)
        .manage(ipc_profiler.clone()); // ✅ v19.5.0 IPC Profiler
    #[cfg(all(not(feature = "mock"), feature = "full"))]
    {
        builder = builder.manage(chat_engine_state.clone());
    }

    builder = builder.setup(|_app| {
        log::info!("✅ Cognitive System State managed");
        log::info!("✅ QA System State managed");
        log::info!("✅ SingularityState v∞ managed");
        log::info!("✅ AdaptiveEngine v21 managed");
        log::info!("✅ NarrativeEngine v22 managed");
        log::info!("✅ ImmersiveAvatarEngine v23 managed");
        log::info!("✅ ChatOrchestrator v16 managed");
        log::info!("✅ SecureSecretsEngine v∞ managed");
        log::info!("✅ SINGULARITY-FUSION vΩ managed (6 states)");
        log::info!("✅ CLOUD SYNC ENGINE v∞ managed");

        // ═══════════════════════════════════════════════════════════════
        // INITIALIZE AGENDA ENGINE v∞
        // ═══════════════════════════════════════════════════════════════
        log::info!("📅 Initializing AGENDA ENGINE v∞...");
        let app_data_dir = _app.path().app_data_dir().unwrap_or_else(|_| std::path::PathBuf::from("."));
        tauri::async_runtime::spawn(async move {
            if let Err(e) = titane_infinity::agenda::storage::init_agenda_storage(app_data_dir).await {
                log::error!("❌ Failed to initialize Agenda Storage: {}", e);
            } else {
                log::info!("✅ AGENDA ENGINE v∞ initialized");
            }
        });

        #[cfg(all(not(feature = "mock"), feature = "full"))]
        log::info!("✅ ChatEngine v∞ managed");
        // Auto-open DevTools in debug mode
        #[cfg(debug_assertions)]
        {
            if let Some(window) = _app.get_webview_window("main") {
                window.open_devtools();
                log::info!("DevTools opened automatically (debug mode)");
            }
        }

        Ok(())
    });

    builder = builder.invoke_handler(tauri::generate_handler![
        // TITANE∞ Local Ollama bridge (legacy)
        ollama_query,
        // TITANE∞ v∞.LOCAL - New AI Handlers (Super Prompt #12)
        titane_infinity::ai::ollama::ai_generate_local,
        titane_infinity::ai::ollama::ai_generate_local_stream,
        titane_infinity::ai::ollama::ai_scan_local_models,
        titane_infinity::ai::ollama::ai_set_local_model,
        titane_infinity::ai::ollama::ai_check_ollama_status,
        // ═══════════════════════════════════════════════════════════════
        // MOCK COMMANDS - Frontend Development
        // ═══════════════════════════════════════════════════════════════

        // Helios - System Monitoring
        mock_commands::get_helios_state,
        mock_commands::get_system_health,
        // OMNIS Auto-Heal - System Health (Phase 7)
        system_health_commands::get_system_health,
        system_health_commands::memory_repair,
        system_health_commands::system_optimize,
        // Memory - Storage & Timeline
        mock_commands::get_memory_state,
        mock_commands::write_snapshot,
        mock_commands::read_snapshot,
        mock_commands::write_log,
        mock_commands::read_logs,
        mock_commands::add_timeline_event,
        mock_commands::get_timeline,
        mock_commands::get_active_projects,
        mock_commands::get_recent_decisions,
        mock_commands::get_knowledge,
        mock_commands::get_active_rituals,
        mock_commands::save_chat_interaction,
        mock_commands::memory_save_chat_interaction, // Alias frontend compatibility
        mock_commands::memory_debug_scan,
        // Memory Aliases v17 - Frontend compatibility
        mock_commands::memory_get_active_projects,
        mock_commands::memory_get_recent_decisions,
        mock_commands::memory_get_knowledge,
        mock_commands::memory_get_active_rituals,
        // Nexus - Validation
        mock_commands::validate_nexus,
        mock_commands::get_nexus_graph,
        // Singularity - Unity State
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
        // Singularity - Update commands (v16.2.2+)
        mock_commands::singularity_update_physical,
        mock_commands::singularity_update_cognitive,
        mock_commands::singularity_update_symbolic,
        mock_commands::singularity_update_adaptive,
        mock_commands::singularity_update_meta,
        mock_commands::singularity_update_full_state,
        mock_commands::singularity_save_state,
        mock_commands::singularity_load_state,
        // DevTools - Logging & Debug
        mock_commands::get_logs,
        mock_commands::clear_logs,
        mock_commands::get_system_info,
        // ═══════════════════════════════════════════════════════════════
        // DEVOPS COMMANDS v19 - Dashboard & Build Tools
        // ═══════════════════════════════════════════════════════════════
        devops_commands::devops_run,
        devops_commands::devops_stats,
        // Helios + Memory - Additional Metrics (v∞)
        mock_commands::get_helios_metrics,
        mock_commands::memory_get_state,
        // Experience - XP & Knowledge Domains (v24)
        mock_commands::experience_get_state,
        mock_commands::experience_update_state,
        // Memory - File Ingestion (v24)
        mock_commands::memory_ingest_file,
        mock_commands::import_file,
        // Chat AI - Unified Command (v∞)
        mock_commands::generate_response,
        mock_commands::chat_generate,
        mock_commands::upload_and_process_file,
        mock_commands::stream_response,
        mock_commands::speak_text,
        mock_commands::save_memory,
        mock_commands::load_memory,
        mock_commands::reset_memory,
        mock_commands::health_check,
        // Memory Persistence - v∞.C
        mock_commands::get_all_files,
        mock_commands::get_files_by_category,
        mock_commands::clear_memory,
        mock_commands::store_file,
        runtime_config::get_runtime_config,
        // Chat Engine v∞ - High-Performance Pipeline
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        chat_engine::commands::generate_response,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        chat_engine::commands::stream_response,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        chat_engine::commands::speak_text,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        chat_engine::commands::save_memory,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        chat_engine::commands::load_memory,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        chat_engine::commands::reset_memory,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        chat_engine::commands::health_check,
        // Chat AI - Real Orchestrator (v18) ✅ FIXED v16.1
        overdrive::chat_orchestrator::chat_send_message,
        overdrive::chat_orchestrator::chat_get_providers_status,
        overdrive::chat_orchestrator::chat_check_providers,
        overdrive::chat_orchestrator::chat_create_conversation,
        overdrive::chat_orchestrator::chat_get_conversation,
        overdrive::chat_orchestrator::chat_delete_conversation,
        overdrive::chat_orchestrator::chat_generate_suggestions,  // ✅ v∞
        secure_commands::chat_set_gemini_key,
        secure_commands::get_gemini_key_status,
        secure_commands::chat_set_openai_key,
        secure_commands::get_openai_key_status,
        secure_commands::chat_set_anthropic_key,
        secure_commands::get_anthropic_key_status,
        secure_commands::secure_store_secret,
        overdrive::chat_orchestrator::chat_stream_message,
        // ═══════════════════════════════════════════════════════════════
        // VOICE COMMANDS v19.3.0 - TTS & ASR (Real implementations)
        // ═══════════════════════════════════════════════════════════════
        audio::commands::speak,
        audio::commands::stop_speaking,
        audio::commands::is_speaking,
        audio::commands::start_recording,
        audio::commands::stop_recording,
        audio::commands::cancel_recording,
        audio::commands::is_recording,
        audio::commands::get_recording_status,
        audio::commands::transcribe_audio,
        // ═══════════════════════════════════════════════════════════════
        // VOICE ENGINE COMMANDS v∞ - Overdrive Voice System
        // ═══════════════════════════════════════════════════════════════
        overdrive::voice_engine::voice_start_listening,
        overdrive::voice_engine::voice_stop_listening,
        overdrive::voice_engine::voice_get_config,
        overdrive::voice_engine::voice_update_config,
        overdrive::voice_engine::voice_get_status,
        overdrive::voice_engine::voice_calibrate_microphone,
        overdrive::voice_engine::voice_enable_duplex,
        overdrive::voice_engine::voice_disable_duplex,
        overdrive::voice_engine::voice_check_interruption,
        overdrive::voice_engine::voice_synthesize_speech,
        overdrive::voice_engine::voice_play_audio,
        overdrive::voice_engine::voice_stop_speaking,
        overdrive::voice_engine::voice_transcribe_audio,
        overdrive::voice_engine::voice_detect_wake_word,
        overdrive::voice_engine::voice_cancel_recording,
        overdrive::voice_engine::voice_is_recording,
        overdrive::voice_engine::voice_test_pipeline,
        overdrive::voice_engine::voice_get_available_models,
        // Memory Engine Commands (✅ Active commands only)
        overdrive::memory_engine::memory_store,
        overdrive::memory_engine::memory_store_conversation,
        overdrive::memory_engine::memory_search,
        overdrive::memory_engine::memory_get_related,
        overdrive::memory_engine::memory_rebuild_index,
        overdrive::memory_engine::memory_get_stats,
        overdrive::memory_engine::memory_prune,
        overdrive::memory_engine::memory_delete,
        // memory_clear: DISABLED (conflict with commands::memory_clear)
        overdrive::memory_engine::memory_export,
        overdrive::memory_engine::memory_import,
        // ═══════════════════════════════════════════════════════════════
        // PERSISTENCE ENGINE v∞.MPE - 100% SAVE Architecture
        // Event Log + Snapshots + Recovery (OPUS v∞.MPE)
        // ═══════════════════════════════════════════════════════════════
        persistence::commands::titan_persistence_init,
        persistence::commands::titan_persist_event,
        persistence::commands::titan_force_snapshot,
        persistence::commands::titan_load_state,
        persistence::commands::titan_get_events_since,
        persistence::commands::titan_list_snapshots,
        persistence::commands::titan_recover_state,
        persistence::commands::titan_get_persistence_status,
        persistence::commands::titan_verify_integrity,
        // ═══════════════════════════════════════════════════════════════
        // SECURE COMMANDS v∞ - Super-Prompts H, I, J, K
        // ═══════════════════════════════════════════════════════════════
        secure_commands::secure_import_file,
        secure_commands::secure_read_file,
        secure_commands::secure_list_files,
        secure_commands::secure_delete_file,
        secure_commands::get_permission_audit,
        secure_commands::validate_chat_message,
        secure_commands::check_system_integrity,
        // ═══════════════════════════════════════════════════════════════
        // SECURITY HARDENING v19.3 - Rate Limiting & Audit Logging
        // ═══════════════════════════════════════════════════════════════
        titane_infinity::security::commands::get_rate_limit_stats,
        titane_infinity::security::commands::reset_rate_limit,
        titane_infinity::security::commands::cleanup_rate_limiter,
        titane_infinity::security::commands::test_rate_limit,
        titane_infinity::security::commands::log_audit_event,
        titane_infinity::security::audit::get_audit_logs,
        titane_infinity::security::audit::search_audit_logs_by_type,
        titane_infinity::security::audit::search_audit_logs_by_severity,
        // ═══════════════════════════════════════════════════════════════
        // TIME-TRAVEL COMMANDS v∞ - Super-Prompt N
        // ═══════════════════════════════════════════════════════════════
        time_commands::list_snapshots,
        time_commands::get_travel_stats,
        time_commands::restore_snapshot,
        time_commands::delete_snapshot,
        // ═══════════════════════════════════════════════════════════════
        // SYSTEM CENTER COMMANDS v∞ - Centre Système Unifié
        // ═══════════════════════════════════════════════════════════════

        // Diagnostics
        titane_infinity::system_center::sc_run_quick_diagnostics,
        titane_infinity::system_center::sc_run_full_diagnostics,
        titane_infinity::system_center::sc_get_diagnostic_status,
        // Logs
        titane_infinity::system_center::sc_get_logs,
        titane_infinity::system_center::sc_get_log_stats,
        titane_infinity::system_center::sc_clear_logs,
        titane_infinity::system_center::sc_add_log,
        // Cluster
        titane_infinity::system_center::sc_get_cluster_status,
        titane_infinity::system_center::sc_initialize_cluster,
        titane_infinity::system_center::sc_get_cluster_stats,
        titane_infinity::system_center::sc_shutdown_cluster,
        titane_infinity::system_center::sc_get_cluster_peers,
        // Introspection
        titane_infinity::system_center::sc_introspection_quick_scan,
        titane_infinity::system_center::sc_introspection_full_scan,
        titane_infinity::system_center::sc_introspection_auto_fix,
        titane_infinity::system_center::sc_introspection_get_history,
        // HyperVision
        titane_infinity::system_center::sc_hypervision_start,
        titane_infinity::system_center::sc_hypervision_stop,
        titane_infinity::system_center::sc_hypervision_get_state,
        titane_infinity::system_center::sc_hypervision_get_metrics,
        titane_infinity::system_center::sc_hypervision_get_history,
        titane_infinity::system_center::sc_hypervision_get_layers,
        titane_infinity::system_center::sc_hypervision_get_anomalies,
        titane_infinity::system_center::sc_hypervision_clear_anomalies,
        titane_infinity::system_center::sc_hypervision_resolve_anomaly,

        // ═══════════════════════════════════════════════════════════════
        // FUSION ENGINE COMMANDS v∞.27.0 - Dataset + Memory + Logs
        // ═══════════════════════════════════════════════════════════════
        fusion::fusion_collect,
        fusion::fusion_sync,
        fusion::fusion_build_dataset,
        fusion::fusion_export,
        fusion::fusion_merge,
        fusion::fusion_get_stats,
        fusion::fusion_clear,
        fusion::fusion_configure,
        fusion::fusion_get_config,

        // ═══════════════════════════════════════════════════════════════
        // DESIGN CENTER COMMANDS v16 - Centre Design & Apparence Unifié
        // ═══════════════════════════════════════════════════════════════
        titane_infinity::design_center::load_ui_theme,
        titane_infinity::design_center::save_ui_theme,
        titane_infinity::design_center::reset_ui_theme,
        titane_infinity::design_center::update_ui_token,
        titane_infinity::design_center::export_ui_theme_css,

        // ═══════════════════════════════════════════════════════════════
        // IPC PROFILER COMMANDS v19.5.0 - Performance Monitoring
        // ═══════════════════════════════════════════════════════════════
        titane_infinity::profiling::ipc_profiler::get_ipc_metrics,
        titane_infinity::profiling::ipc_profiler::get_ipc_summary,
        titane_infinity::profiling::ipc_profiler::reset_ipc_metrics,

        // ═══════════════════════════════════════════════════════════════
        // AUDIO CENTER COMMANDS v19.2 - TTS, Devices, Tests
        // ═══════════════════════════════════════════════════════════════
        audio::commands::tts_speak,
        audio::commands::tts_stop,
        audio::commands::test_tts,
        audio::commands::get_audio_output_devices,
        audio::commands::get_audio_input_devices,
        audio::commands::set_audio_output_device,
        audio::commands::set_audio_input_device,
        audio::commands::test_microphone,
        // ═══════════════════════════════════════════════════════════════
        // VAD COMMANDS v∞ - Voice Activity Detection
        // ═══════════════════════════════════════════════════════════════
        audio::commands::vad_get_state,
        audio::commands::vad_process_frame,
        audio::commands::vad_configure,
        audio::commands::vad_reset,
        audio::commands::vad_test,
        // ═══════════════════════════════════════════════════════════════
        // AUDIO CAPTURE COMMANDS v∞ - Real-time cpal capture
        // Requires: feature "audio-capture" + libasound2-dev on Linux
        // ═══════════════════════════════════════════════════════════════
        #[cfg(feature = "audio-capture")]
        audio::commands::audio_capture_start,
        #[cfg(feature = "audio-capture")]
        audio::commands::audio_capture_stop,
        // ═══════════════════════════════════════════════════════════════
        // WHISPER STREAMING COMMANDS v19.3.1 - Real-Time Voice
        // Real-time incremental transcription with partial/final events
        // ═══════════════════════════════════════════════════════════════
        #[cfg(feature = "audio-capture")]
        audio::commands::start_whisper_streaming,
        #[cfg(feature = "audio-capture")]
        audio::commands::send_audio_chunk,
        #[cfg(feature = "audio-capture")]
        audio::commands::stop_whisper_streaming,
        #[cfg(feature = "audio-capture")]
        audio::commands::audio_capture_status,
        #[cfg(feature = "audio-capture")]
        audio::commands::audio_capture_get_chunk,
        #[cfg(feature = "audio-capture")]
        audio::commands::audio_capture_export_wav,
        #[cfg(feature = "audio-capture")]
        audio::commands::audio_list_devices,

        // ═══════════════════════════════════════════════════════════════
        // CENTRE D'ÉVOLUTION COGNITIVE v19.3 (OPUS #4)
        // Unified: Progression + Knowledge + Evolution + Memory
        // ═══════════════════════════════════════════════════════════════
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::cognitive_center::cognitive_get_progression,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::cognitive_center::cognitive_add_xp,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::cognitive_center::cognitive_reset_progression,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::cognitive_center::cognitive_get_knowledge_vault,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::cognitive_center::cognitive_ingest_file,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::cognitive_center::cognitive_search_knowledge,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::cognitive_center::cognitive_delete_knowledge,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::cognitive_center::cognitive_get_evolution,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::cognitive_center::cognitive_run_evolution_cycle,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::cognitive_center::cognitive_add_changelog,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::cognitive_center::cognitive_get_memory,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::cognitive_center::cognitive_store_memory,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::cognitive_center::cognitive_purge_memory,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::cognitive_center::cognitive_consolidate_memory,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::cognitive_center::cognitive_backup_memory,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::cognitive_center::cognitive_get_unified_state,

        // ═══════════════════════════════════════════════════════════════
        // CENTRE D'ORCHESTRATION COGNITIVE v19.5 (OPUS #5/6/7)
        // Unified: Multi-AI + Nexus + Harmonia + Timeline + Cognitive State
        // ═══════════════════════════════════════════════════════════════
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::orchestration_center::orchestration_get_multi_ai,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::orchestration_center::ping_gemini,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::orchestration_center::ping_ollama,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::orchestration_center::test_gemini_services,  // ✅ v∞ Google Cloud Services (22 APIs)
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::orchestration_center::orchestration_ping_providers,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::orchestration_center::orchestration_force_provider,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::orchestration_center::orchestration_set_auto_mode,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::orchestration_center::orchestration_get_nexus,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::orchestration_center::orchestration_update_nexus_node,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::orchestration_center::orchestration_get_harmonia,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::orchestration_center::orchestration_throttle_flow,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::orchestration_center::orchestration_get_timeline,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::orchestration_center::orchestration_add_timeline_event,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::orchestration_center::orchestration_clear_timeline,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::orchestration_center::orchestration_get_cognitive_state,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::orchestration_center::orchestration_set_cognitive_mode,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::orchestration_center::orchestration_analyze_cognitive,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::orchestration_center::orchestration_get_unified_state,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::orchestration_center::orchestration_get_singularity_fragment,

        // ═══════════════════════════════════════════════════════════════
        // ONE CORE v∞ - UNIFIED COMMAND CENTER (OPUS #6)
        // Point d'accès unique à l'intégralité du système TITANE∞
        // ═══════════════════════════════════════════════════════════════
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::one_core::one_core_get_state,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::one_core::one_core_get_engine_status,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::one_core::one_core_list_commands,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::one_core::one_core_execute_command,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::one_core::one_core_run_diagnostic,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::one_core::one_core_get_metrics,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::one_core::one_core_force_sync,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::one_core::one_core_cleanup,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::one_core::one_core_set_mode,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::one_core::one_core_get_event_history,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::one_core::one_core_verify_integrity,

        // ═══════════════════════════════════════════════════════════════
        // QA MONITORING CENTER - OPUS #7 v∞
        // ═══════════════════════════════════════════════════════════════
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::qa_monitoring::qa_get_state,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::qa_monitoring::qa_list_test_suites,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::qa_monitoring::qa_run_test_suite,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::qa_monitoring::qa_get_test_result,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::qa_monitoring::qa_list_monitors,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::qa_monitoring::qa_create_monitor,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::qa_monitoring::qa_toggle_monitor,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::qa_monitoring::qa_delete_monitor,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::qa_monitoring::qa_get_system_metrics,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::qa_monitoring::qa_list_alerts,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::qa_monitoring::qa_acknowledge_alert,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::qa_monitoring::qa_resolve_alert,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::qa_monitoring::qa_get_hardening_config,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::qa_monitoring::qa_update_hardening_config,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::qa_monitoring::qa_run_security_audit,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::qa_monitoring::qa_get_performance_report,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::qa_monitoring::qa_get_logs,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::qa_monitoring::qa_export_metrics_prometheus,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::qa_monitoring::qa_health_check,

        // ═══════════════════════════════════════════════════════════════
        // UNIFIED ENGINES v∞ - OPUS #7/#9/#10
        // QA Engine + Monitoring Engine + Developer Mode + Build Pipeline
        // ═══════════════════════════════════════════════════════════════

        // QA Engine Commands
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_qa_get_state,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_qa_run_all,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_qa_run_suite,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_qa_generate_report,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_qa_get_system_info,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_qa_get_dashboard,

        // Monitoring Engine Commands
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_monitoring_get_state,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_monitoring_get_metrics,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_monitoring_get_heartbeats,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_monitoring_get_anomalies,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_monitoring_get_health,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_monitoring_get_history,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_monitoring_get_dashboard,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_monitoring_reset_alerts,

        // Developer Mode Commands (OPUS #10)
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_devmode_get_state,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_devmode_enable,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_devmode_disable,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_devmode_validate_patch,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_devmode_apply_patch,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_devmode_preview,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_devmode_rollback,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_devmode_get_history,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_devmode_create_backup,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_devmode_restore_backup,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_devmode_analyze_file,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_devmode_changelog,

        // Build Pipeline Commands (OPUS #9)
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_build_start,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_build_get_status,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_build_get_result,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_build_cancel,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_build_clean,

        // Unified Dashboard
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::commands::engines_commands::engines_get_dashboard,

        // ═══════════════════════════════════════════════════════════════
        // PHASES 5-10 COMMANDS v∞ - Super-Prompts P-U (Legacy, kept for compatibility)
        // ═══════════════════════════════════════════════════════════════

        // Phase 5: Node-Cluster (Super-Prompt P)
        titane_infinity::cluster::mesh_initialize,
        titane_infinity::cluster::mesh_get_stats,
        // Phase 6: Knowledge Fusion (Super-Prompt Q)
        titane_infinity::knowledge::parse_document,
        titane_infinity::knowledge::detect_file_format,
        // Phase 7: HyperVision (Super-Prompt R)
        titane_infinity::hypervision::hypervision_start,
        titane_infinity::hypervision::get_system_metrics,
        // Phase 8: Mode Création (Super-Prompt S)
        titane_infinity::creation::create_module,
        // Phase 9: Introspection (Super-Prompt T)
        titane_infinity::introspection::introspection_scan,
        titane_infinity::introspection::introspection_auto_fix,
        // Phase 10: Auto-Évolution (Super-Prompt U)
        titane_infinity::evolution::evolution_run_cycle,
        titane_infinity::evolution::evolution_get_stats,
        // Phase 10+: EVOLUTION ENGINE vΩ∞ - Continuous Improvement
        titane_infinity::evolution::evolution_get_state,
        titane_infinity::evolution::evolution_start,
        titane_infinity::evolution::evolution_stop,
        titane_infinity::evolution::evolution_get_scores,
        titane_infinity::evolution::evolution_update_score,
        titane_infinity::evolution::evolution_generate_report,
        titane_infinity::evolution::evolution_add_data_point,
        titane_infinity::evolution::evolution_get_data_points,
        titane_infinity::evolution::evolution_get_patterns,
        titane_infinity::evolution::evolution_get_insights,
        titane_infinity::evolution::evolution_get_suggestions,
        titane_infinity::evolution::evolution_approve_suggestion,
        titane_infinity::evolution::evolution_reject_suggestion,
        titane_infinity::evolution::evolution_create_action,
        titane_infinity::evolution::evolution_execute_action,
        titane_infinity::evolution::evolution_rollback_action,
        titane_infinity::evolution::evolution_get_history,
        titane_infinity::evolution::evolution_clear_old_history,
        titane_infinity::evolution::evolution_run_full_cycle,
        titane_infinity::evolution::evolution_get_statistics,
        // ═══════════════════════════════════════════════════════════════
        // PHASES V-Ω COMMANDS v∞ - Super-Prompts V-Ω ULTIMATE
        // ═══════════════════════════════════════════════════════════════

        // Phase V: HyperEvolution Engine
        titane_infinity::hyper_evolution::hyper_predict_issues,
        titane_infinity::hyper_evolution::hyper_accelerate,
        titane_infinity::hyper_evolution::hyper_analyze_structure,
        titane_infinity::hyper_evolution::hyper_detect_regeneration,
        titane_infinity::hyper_evolution::hyper_analyze_rewrite,
        titane_infinity::hyper_evolution::hyper_validate,
        // Phase W: Auto-Apprentissage Cognitif
        titane_infinity::cognitive_learning::cognitive_get_map,
        titane_infinity::cognitive_learning::cognitive_add_concept,
        titane_infinity::cognitive_learning::cognitive_build_memory,
        titane_infinity::cognitive_learning::cognitive_create_association,
        titane_infinity::cognitive_learning::cognitive_get_associations,
        titane_infinity::cognitive_learning::cognitive_grow_knowledge,
        titane_infinity::cognitive_learning::cognitive_run_reinforcement,
        titane_infinity::cognitive_learning::cognitive_summarize,
        // Phase X: NeuroSymbolic Fusion
        titane_infinity::neuro_symbolic::neuro_fuse,
        titane_infinity::neuro_symbolic::neuro_adapt_intent,
        titane_infinity::neuro_symbolic::neuro_translate_symbolic,
        titane_infinity::neuro_symbolic::neuro_bridge_reasoning,
        titane_infinity::neuro_symbolic::neuro_map_context,
        titane_infinity::neuro_symbolic::neuro_get_state,
        // Phase Y: Méta-Création
        titane_infinity::meta_creation::meta_generate_ideas,
        titane_infinity::meta_creation::meta_invent_pattern,
        titane_infinity::meta_creation::meta_design_system,
        titane_infinity::meta_creation::meta_generate_prototype,
        titane_infinity::meta_creation::meta_build_solution,
        titane_infinity::meta_creation::meta_integrate_module,
        titane_infinity::meta_creation::meta_get_creative_memory,
        // Phase Z: Auto-Réparation Totale
        titane_infinity::self_repair::repair_detect_anomalies,
        titane_infinity::self_repair::repair_execute,
        titane_infinity::self_repair::repair_regenerate_module,
        titane_infinity::self_repair::repair_fallback_recovery,
        titane_infinity::self_repair::repair_deep_rebuild,
        titane_infinity::self_repair::repair_get_integrity_map,
        // Phase Ω: Singularity Engine
        titane_infinity::singularity::singularity_activate,
        titane_infinity::singularity::singularity_check_coherence,
        titane_infinity::singularity::singularity_fuse_all,
        titane_infinity::singularity::singularity_unify,
        titane_infinity::singularity::singularity_get_state,
        titane_infinity::singularity::singularity_detect_emergence,
        // ═══════════════════════════════════════════════════════════════
        // CONTROL PANEL COMMANDS v19.1.0
        // ═══════════════════════════════════════════════════════════════

        // Système
        control_panel_commands::cp_get_system_info,
        control_panel_commands::cp_run_system_diagnostic,
        // Apparence / Design System
        control_panel_commands::cp_get_design_config,
        control_panel_commands::cp_set_design_config,
        // Singularité
        control_panel_commands::cp_get_singularity_status,
        control_panel_commands::cp_toggle_singularity,
        // IA & APIs
        control_panel_commands::cp_get_ai_config,
        control_panel_commands::cp_set_ai_config,
        // Mémoire
        control_panel_commands::cp_get_memory_stats,
        control_panel_commands::cp_clear_memory_cache,
        // Modules
        control_panel_commands::cp_get_modules_status,
        control_panel_commands::cp_toggle_module,
        // Réseau
        control_panel_commands::cp_get_network_config,
        control_panel_commands::cp_set_network_config,
        // Mises à jour
        control_panel_commands::cp_check_for_updates,
        control_panel_commands::cp_install_update,
        // Logs
        control_panel_commands::cp_get_logs,
        control_panel_commands::cp_clear_logs,
        // Sécurité
        control_panel_commands::cp_get_security_config,
        control_panel_commands::cp_set_security_config,
        // ═══════════════════════════════════════════════════════════════
        // SECURITY HARDENING v17 - Global Self-Test
        // ═══════════════════════════════════════════════════════════════
        titane_infinity::security::run_hardening_selftest,
        // ═══════════════════════════════════════════════════════════════
        // COGNITIVE HARDENING v17.3.0 - Cognitive Security Commands
        // ═══════════════════════════════════════════════════════════════
        titane_infinity::cognitive::cognitive_run_selftest,
        titane_infinity::cognitive::cognitive_validate_state,
        titane_infinity::cognitive::cognitive_compute_hash_cmd,
        // ═══════════════════════════════════════════════════════════════
        // WATCHDOG ENGINE v17.3.0 - Auto-Repair & Monitoring Commands
        // ═══════════════════════════════════════════════════════════════
        titane_infinity::watchdog::watchdog_run_selftest,
        titane_infinity::watchdog::watchdog_scan,
        titane_infinity::watchdog::watchdog_fix,
        // ═══════════════════════════════════════════════════════════════
        // BACKEND GLOBAL SELF-TEST v17.7 - Full System Validation
        // ═══════════════════════════════════════════════════════════════
        titane_infinity::backend_selftest::backend_run_global_selftest,
        // ═══════════════════════════════════════════════════════════════
        // META-COGNITION & DEEP SYNC v18 - Cognitive Supervision
        // ═══════════════════════════════════════════════════════════════
        titane_infinity::meta::meta_get_report,
        titane_infinity::meta::meta_trigger_sync,
        titane_infinity::meta::meta_get_alignment,
        titane_infinity::meta::meta_get_state,
        titane_infinity::meta::meta_selftest_all, // v18.1: Self-test complet
        // ═══════════════════════════════════════════════════════════════
        // META MONITORING & AUTO-HEALING v18.2 - Production Systems
        // ═══════════════════════════════════════════════════════════════
        titane_infinity::meta::meta_get_monitoring_metrics,
        titane_infinity::meta::meta_get_evaluation_history,
        titane_infinity::meta::meta_get_sync_history,
        titane_infinity::meta::meta_get_alerts,
        titane_infinity::meta::meta_acknowledge_alert,
        titane_infinity::meta::meta_set_auto_healing,
        titane_infinity::meta::meta_get_auto_healing_status,
        titane_infinity::meta::meta_get_healing_history,
        titane_infinity::meta::meta_get_recalibration_history,
        titane_infinity::meta::meta_trigger_recalibration,
        // ═══════════════════════════════════════════════════════════════
        // QA SYSTEM v19.8 - Automated Testing & Quality Assurance
        // ═══════════════════════════════════════════════════════════════
        titane_infinity::qa::qa_commands::qa_run_all,
        titane_infinity::qa::qa_commands::qa_run_module,
        titane_infinity::qa::qa_commands::qa_get_last_report,
        // ═══════════════════════════════════════════════════════════════
        // SINGULARITY STATE v∞ (v20) - Global Unified State
        // ═══════════════════════════════════════════════════════════════
        titane_infinity::singularity::singularity_commands::singularity_get,
        titane_infinity::singularity::singularity_commands::singularity_set,
        titane_infinity::singularity::singularity_commands::singularity_diff,
        titane_infinity::singularity::singularity_commands::singularity_hash,
        titane_infinity::singularity::singularity_commands::singularity_sync,
        titane_infinity::singularity::singularity_commands::singularity_meta,
        titane_infinity::singularity::singularity_commands::singularity_integrity,
        titane_infinity::singularity::singularity_commands::singularity_repair,
        titane_infinity::singularity::singularity_commands::singularity_export_json,
        titane_infinity::singularity::singularity_commands::singularity_snapshot,
        titane_infinity::singularity::singularity_selftest::singularity_selftest_full,
        // ═══════════════════════════════════════════════════════════════
        // ADAPTIVE ENGINE v21 - Auto-Optimization & Learning
        // ═══════════════════════════════════════════════════════════════
        titane_infinity::adaptive::adaptive_commands::adaptive_get_profile,
        titane_infinity::adaptive::adaptive_commands::adaptive_set_mode,
        titane_infinity::adaptive::adaptive_commands::adaptive_learn,
        titane_infinity::adaptive::adaptive_commands::adaptive_run_optimization,
        titane_infinity::adaptive::adaptive_commands::adaptive_get_history,
        titane_infinity::adaptive::adaptive_commands::adaptive_capture_sample,
        titane_infinity::adaptive::adaptive_commands::adaptive_get_summary,
        // ═══════════════════════════════════════════════════════════════
        // NARRATIVE ENGINE v22 - Expressive & Symbolic Layer
        // ═══════════════════════════════════════════════════════════════
        titane_infinity::narrative::narrative_commands::narrative_generate,
        titane_infinity::narrative::narrative_commands::narrative_get_style,
        titane_infinity::narrative::narrative_commands::narrative_set_style,
        titane_infinity::narrative::narrative_commands::narrative_get_identity,
        titane_infinity::narrative::narrative_commands::narrative_evolve,
        titane_infinity::narrative::narrative_commands::narrative_get_archetype,
        titane_infinity::narrative::narrative_commands::narrative_set_archetype,
        // ═══════════════════════════════════════════════════════════════
        // IMMERSIVE AVATAR ENGINE v23 - Voice, Lip-Sync & Expressions
        // ═══════════════════════════════════════════════════════════════
        titane_infinity::avatar::avatar_commands::avatar_prepare_speech,
        titane_infinity::avatar::avatar_commands::avatar_finish_speech,
        titane_infinity::avatar::avatar_commands::avatar_enable_immersion,
        titane_infinity::avatar::avatar_commands::avatar_on_wake_word,
        titane_infinity::avatar::avatar_commands::avatar_get_current_morph,
        titane_infinity::avatar::avatar_commands::avatar_advance_lip_sync,
        titane_infinity::avatar::avatar_commands::avatar_get_expression,
        titane_infinity::avatar::avatar_commands::avatar_get_state,
        titane_infinity::avatar::avatar_selftest::avatar_run_selftest,
        // ═══════════════════════════════════════════════════════════════
        // FULL-BODY AVATAR ENGINE v24 - Complete Body, Gestures & Postures
        // ═══════════════════════════════════════════════════════════════
        titane_infinity::avatar::fullbody_commands::fullbody_initialize,
        titane_infinity::avatar::fullbody_commands::fullbody_advance_frame,
        titane_infinity::avatar::fullbody_commands::fullbody_activate_gesture,
        titane_infinity::avatar::fullbody_commands::fullbody_update_expression,
        titane_infinity::avatar::fullbody_commands::fullbody_update_lipsync,
        titane_infinity::avatar::fullbody_commands::fullbody_update_state,
        titane_infinity::avatar::fullbody_commands::fullbody_on_wake_word,
        titane_infinity::avatar::fullbody_commands::fullbody_export_skeleton,
        titane_infinity::avatar::fullbody_commands::fullbody_update_context,
        titane_infinity::avatar::fullbody_commands::fullbody_get_posture,
        titane_infinity::avatar::fullbody_commands::fullbody_get_stats,
        titane_infinity::avatar::fullbody_selftest::fullbody_run_selftest,
        // ═══════════════════════════════════════════════════════════════
        // APPEARANCE ENGINE v24.5 - Outfit, Style & Appearance Control
        // ═══════════════════════════════════════════════════════════════
        titane_infinity::avatar::appearance_commands::avatar_get_appearance,
        titane_infinity::avatar::appearance_commands::avatar_set_appearance,
        titane_infinity::avatar::appearance_commands::avatar_update_appearance,
        titane_infinity::avatar::appearance_commands::avatar_apply_style_preset,
        titane_infinity::avatar::appearance_commands::avatar_parse_style_command,
        titane_infinity::avatar::appearance_commands::avatar_save_custom_style,
        titane_infinity::avatar::appearance_commands::avatar_load_custom_style,
        titane_infinity::avatar::appearance_commands::avatar_merge_styles,
        titane_infinity::avatar::appearance_commands::avatar_list_styles,
        titane_infinity::avatar::appearance_commands::avatar_add_archetype,
        // ═══════════════════════════════════════════════════════════════
        // FLOATING AVATAR WINDOW v24.12 - Display State & Window Control
        // ═══════════════════════════════════════════════════════════════
        titane_infinity::avatar::avatar_floating_commands::avatar_get_display_state,
        titane_infinity::avatar::avatar_floating_commands::avatar_set_display_state,
        titane_infinity::avatar::avatar_floating_commands::avatar_update_display_state,
        titane_infinity::avatar::avatar_floating_commands::avatar_reset_display_state,
        titane_infinity::avatar::avatar_floating_commands::avatar_mode_floating,
        titane_infinity::avatar::avatar_floating_commands::avatar_mode_embed,
        titane_infinity::avatar::avatar_floating_commands::avatar_mode_hidden,
        titane_infinity::avatar::avatar_floating_commands::avatar_set_position,
        titane_infinity::avatar::avatar_floating_commands::avatar_set_size,
        titane_infinity::avatar::avatar_floating_commands::avatar_set_scale,
        titane_infinity::avatar::avatar_floating_commands::avatar_set_opacity,
        titane_infinity::avatar::avatar_floating_commands::avatar_set_always_on_top,
        titane_infinity::avatar::avatar_floating_commands::avatar_set_locked,
        titane_infinity::avatar::avatar_floating_commands::avatar_set_mirror_mode,
        titane_infinity::avatar::avatar_floating_commands::avatar_set_click_through,
        titane_infinity::avatar::avatar_floating_commands::avatar_set_anchor,
        titane_infinity::avatar::avatar_floating_commands::avatar_set_anchor_by_name,
        titane_infinity::avatar::avatar_floating_commands::avatar_list_screens,
        titane_infinity::avatar::avatar_floating_commands::avatar_move_to_screen,
        // ═══════════════════════════════════════════════════════════════
        // SINGULARITY-FUSION vΩ - Unified System Commands
        // ═══════════════════════════════════════════════════════════════
        // Fusion Engine
        titane_infinity::singularity_fusion::singularity_get_fusion_state,
        titane_infinity::singularity_fusion::singularity_start_sync_loop,
        titane_infinity::singularity_fusion::singularity_perform_sync,
        titane_infinity::singularity_fusion::singularity_check_integrity,
        titane_infinity::singularity_fusion::singularity_create_snapshot,
        titane_infinity::singularity_fusion::singularity_restore_snapshot,
        titane_infinity::singularity_fusion::singularity_register_pipeline,
        titane_infinity::singularity_fusion::singularity_complete_pipeline,
        titane_infinity::singularity_fusion::singularity_detect_inconsistencies,
        titane_infinity::singularity_fusion::singularity_get_metrics,
        titane_infinity::singularity_fusion::singularity_get_diagnostics,
        titane_infinity::singularity_fusion::singularity_reset,
        // Unified Pipeline
        titane_infinity::singularity_fusion::pipeline_analyze_intention,
        titane_infinity::singularity_fusion::pipeline_generate_cognitive_response,
        titane_infinity::singularity_fusion::pipeline_prepare_tts,
        titane_infinity::singularity_fusion::pipeline_prepare_avatar_animation,
        titane_infinity::singularity_fusion::pipeline_get_stats,
        titane_infinity::singularity_fusion::pipeline_pause,
        titane_infinity::singularity_fusion::pipeline_resume,
        titane_infinity::singularity_fusion::pipeline_reset,
        titane_infinity::singularity_fusion::pipeline_validate,
        // AutoFix Engine
        titane_infinity::singularity_fusion::autofix_detect_rust_warnings,
        titane_infinity::singularity_fusion::autofix_detect_typescript_errors,
        titane_infinity::singularity_fusion::autofix_detect_react_hook_violations,
        titane_infinity::singularity_fusion::autofix_detect_invalid_states,
        titane_infinity::singularity_fusion::autofix_fix_issue,
        titane_infinity::singularity_fusion::autofix_fix_all,
        titane_infinity::singularity_fusion::autofix_get_history,
        titane_infinity::singularity_fusion::autofix_get_stats,
        titane_infinity::singularity_fusion::autofix_reset,
        // AutoHeal Engine
        titane_infinity::singularity_fusion::autoheal_detect_broken_modules,
        titane_infinity::singularity_fusion::autoheal_heal_cognitive_module,
        titane_infinity::singularity_fusion::autoheal_heal_avatar_module,
        titane_infinity::singularity_fusion::autoheal_heal_tts_module,
        titane_infinity::singularity_fusion::autoheal_heal_lipsync_module,
        titane_infinity::singularity_fusion::autoheal_heal_memory_module,
        titane_infinity::singularity_fusion::autoheal_heal_pipeline,
        titane_infinity::singularity_fusion::autoheal_resync_state,
        titane_infinity::singularity_fusion::autoheal_get_history,
        titane_infinity::singularity_fusion::autoheal_reset,
        // Performance Optimizer
        titane_infinity::singularity_fusion::performance_get_metrics,
        titane_infinity::singularity_fusion::performance_throttle_cpu,
        titane_infinity::singularity_fusion::performance_optimize_gpu,
        titane_infinity::singularity_fusion::performance_reduce_render_quality,
        titane_infinity::singularity_fusion::performance_compress_memory,
        titane_infinity::singularity_fusion::performance_reset_optimizations,
        // CrashGuard
        titane_infinity::singularity_fusion::crashguard_detect_threats,
        titane_infinity::singularity_fusion::crashguard_clear_memory,
        titane_infinity::singularity_fusion::crashguard_kill_thread,
        titane_infinity::singularity_fusion::crashguard_restart_module,
        titane_infinity::singularity_fusion::crashguard_emergency_shutdown,
        titane_infinity::singularity_fusion::crashguard_reset_pipeline,
        titane_infinity::singularity_fusion::crashguard_emergency_rollback,
        titane_infinity::singularity_fusion::crashguard_get_active_threats,
        titane_infinity::singularity_fusion::crashguard_get_stats,
        // ═══════════════════════════════════════════════════════════════
        // DOCS ENGINE v∞ (OPUS #11) - Embedded Documentation System
        // ═══════════════════════════════════════════════════════════════
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::devtools::titan_docs_search,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::devtools::titan_docs_get,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::devtools::titan_docs_list,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::devtools::titan_docs_list_by_module,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::devtools::titan_docs_registry,
        #[cfg(all(not(feature = "mock"), feature = "full"))]
        titane_infinity::devtools::titan_docs_generate_markdown,
        // ═══════════════════════════════════════════════════════════════
        // MEMORY DOCTOR v∞ (OPUS v∞.MPE-Ω) - Memory Diagnostics & Healing
        // ═══════════════════════════════════════════════════════════════
        persistence::commands::titan_memory_doctor_diagnose,
        persistence::commands::titan_memory_doctor_heal,
        persistence::commands::titan_memory_doctor_compact,
        persistence::commands::titan_memory_doctor_export,
        persistence::commands::titan_memory_doctor_summary,
        // ═══════════════════════════════════════════════════════════════
        // AI TRAINING MODE v∞ (OPUS #12) - Kevin-Only Learning System
        // ═══════════════════════════════════════════════════════════════
        titane_infinity::ai_chat::training_verify_kevin,
        titane_infinity::ai_chat::training_enable,
        titane_infinity::ai_chat::training_disable,
        titane_infinity::ai_chat::training_get_state,
        titane_infinity::ai_chat::training_get_stats,
        titane_infinity::ai_chat::training_record_feedback,
        titane_infinity::ai_chat::training_learn_pattern,
        titane_infinity::ai_chat::training_find_patterns,
        titane_infinity::ai_chat::training_start_session,
        titane_infinity::ai_chat::training_process_feedbacks,
        titane_infinity::ai_chat::training_end_session,
        titane_infinity::ai_chat::training_export_patterns,
        titane_infinity::ai_chat::training_import_patterns,
        titane_infinity::ai_chat::training_prune_patterns,
        titane_infinity::ai_chat::training_generate_report,
        // ═══════════════════════════════════════════════════════════════
        // CLOUD SYNC ENGINE v∞ (OPUS #13) - Vault chiffré & Multi-device
        // AES-256-GCM + Argon2id + Ed25519 + Compression GZIP
        // ═══════════════════════════════════════════════════════════════
        titane_infinity::cloud::commands::cloud_init,
        titane_infinity::cloud::commands::cloud_load_vault,
        titane_infinity::cloud::commands::cloud_create_vault,
        titane_infinity::cloud::commands::cloud_get_status,
        titane_infinity::cloud::commands::cloud_sync_push,
        titane_infinity::cloud::commands::cloud_sync_pull,
        titane_infinity::cloud::commands::cloud_update_config,
        titane_infinity::cloud::commands::cloud_get_devices,
        titane_infinity::cloud::commands::cloud_remove_device,
        titane_infinity::cloud::commands::cloud_get_sync_history,
        titane_infinity::cloud::commands::cloud_update_vault_data,
        titane_infinity::cloud::commands::cloud_verify_integrity,
        titane_infinity::cloud::commands::cloud_backup_vault,
        titane_infinity::cloud::commands::cloud_restore_vault,
        titane_infinity::cloud::commands::cloud_auto_heal,
        titane_infinity::cloud::commands::cloud_list_backups,
        // ═══════════════════════════════════════════════════════════════
        // MEMORY EVOLUTION ENGINE++ v∞ (OPUS #14) - Cognitive Memory Pipeline
        // Parser, Synthesizer, Clusterer, Vectorizer, Compressor, Patterns, Stability, Growth
        // ═══════════════════════════════════════════════════════════════
        titane_infinity::memory_evolution::memory_evolution_status,
        titane_infinity::memory_evolution::memory_add_item,
        titane_infinity::memory_evolution::memory_parse,
        titane_infinity::memory_evolution::memory_synthesize,
        titane_infinity::memory_evolution::memory_cluster,
        titane_infinity::memory_evolution::memory_compress,
        titane_infinity::memory_evolution::memory_extract_patterns,
        titane_infinity::memory_evolution::memory_check_stability,
        titane_infinity::memory_evolution::memory_check_and_repair,
        titane_infinity::memory_evolution::memory_grow,
        titane_infinity::memory_evolution::memory_hierarchy_health,
        titane_infinity::memory_evolution::memory_evolve_full,
        titane_infinity::memory_evolution::memory_update_config,
        titane_infinity::memory_evolution::memory_get_clusters,
        titane_infinity::memory_evolution::memory_get_items_by_level,
        titane_infinity::memory_evolution::memory_create_backup,
        titane_infinity::memory_evolution::memory_list_backups,
        // ═══════════════════════════════════════════════════════════════
        // SYSTEM IDENTITY ENGINE v∞ (OPUS #15) - Personality & Voice System
        // Matrix, Voice, Tone, Mode, Rules, Personality
        // ═══════════════════════════════════════════════════════════════
        titane_infinity::identity::identity_get_status,
        titane_infinity::identity::identity_get_full,
        titane_infinity::identity::identity_set_mode,
        titane_infinity::identity::identity_set_communication_style,
        titane_infinity::identity::identity_evolve_trait,
        titane_infinity::identity::identity_get_response_profile,
        titane_infinity::identity::identity_get_matrix,
        titane_infinity::identity::identity_set_matrix_dimension,
        titane_infinity::identity::identity_apply_matrix_profile,
        titane_infinity::identity::identity_list_voice_profiles,
        titane_infinity::identity::identity_get_active_voice_profile,
        titane_infinity::identity::identity_set_active_voice_profile,
        titane_infinity::identity::identity_get_tone,
        titane_infinity::identity::identity_set_tone,
        titane_infinity::identity::identity_list_modes,
        titane_infinity::identity::identity_get_mode_history,
        titane_infinity::identity::identity_get_rules_stats,
        titane_infinity::identity::identity_toggle_rule,
        titane_infinity::identity::identity_get_personality_state,
        titane_infinity::identity::identity_get_personality_profile,
        titane_infinity::identity::identity_set_mood,
        titane_infinity::identity::identity_adjust_energy,
        // ═══════════════════════════════════════════════════════════════
        // META ORCHESTRATOR ENGINE v∞ (OPUS #18) - System Supervisor
        // Awareness, Resources, Priority Scheduler
        // ═══════════════════════════════════════════════════════════════
        titane_infinity::meta_orchestrator::commands::orchestrator_init,
        titane_infinity::meta_orchestrator::commands::orchestrator_get_state,
        titane_infinity::meta_orchestrator::commands::orchestrator_run_cycle,
        titane_infinity::meta_orchestrator::commands::orchestrator_set_mode,
        titane_infinity::meta_orchestrator::commands::orchestrator_get_metrics,
        titane_infinity::meta_orchestrator::commands::orchestrator_enqueue_task,
        titane_infinity::meta_orchestrator::commands::orchestrator_get_queue,
        titane_infinity::meta_orchestrator::commands::orchestrator_get_engines,
        titane_infinity::meta_orchestrator::commands::orchestrator_get_health,
        titane_infinity::meta_orchestrator::commands::orchestrator_get_report,
        // ═══════════════════════════════════════════════════════════════
        // REALITY RENDERING LAYER v∞ (OPUS #19) - Scene, Physics, Lighting
        // ═══════════════════════════════════════════════════════════════
        titane_infinity::reality_renderer::commands::reality_init,
        titane_infinity::reality_renderer::commands::reality_get_state,
        titane_infinity::reality_renderer::commands::reality_render_frame,
        titane_infinity::reality_renderer::commands::reality_create_scene,
        titane_infinity::reality_renderer::commands::reality_load_scene,
        titane_infinity::reality_renderer::commands::reality_add_entity,
        titane_infinity::reality_renderer::commands::reality_remove_entity,
        titane_infinity::reality_renderer::commands::reality_set_render_config,
        titane_infinity::reality_renderer::commands::reality_toggle_physics,
        titane_infinity::reality_renderer::commands::reality_get_report,
        // ═══════════════════════════════════════════════════════════════
        // HYPER-INTELLIGENCE ENGINE v∞ (OPUS #20) - Reasoning, Creativity, Cognition
        // ═══════════════════════════════════════════════════════════════
        titane_infinity::hyper_intelligence::commands::hyper_init,
        titane_infinity::hyper_intelligence::commands::hyper_get_state,
        titane_infinity::hyper_intelligence::commands::hyper_get_metrics,
        titane_infinity::hyper_intelligence::commands::hyper_set_mode,
        titane_infinity::hyper_intelligence::commands::hyper_think,
        titane_infinity::hyper_intelligence::commands::hyper_generate_insight,
        titane_infinity::hyper_intelligence::commands::hyper_reason,
        titane_infinity::hyper_intelligence::commands::hyper_imagine,
        titane_infinity::hyper_intelligence::commands::hyper_get_thoughts,
        titane_infinity::hyper_intelligence::commands::hyper_get_insights,
        titane_infinity::hyper_intelligence::commands::hyper_get_report,
        // ═══════════════════════════════════════════════════════════════
        // AGENDA ENGINE v∞ (TIME/AGENDA SYSTEM)
        // TimeEngine, AgendaEngine, EnergyEngine, PriorityEngine, ChatScheduler
        // ═══════════════════════════════════════════════════════════════
        titane_infinity::agenda::commands::agenda_load_events,
        titane_infinity::agenda::commands::agenda_save_events,
        titane_infinity::agenda::commands::agenda_create_event,
        titane_infinity::agenda::commands::agenda_update_event,
        titane_infinity::agenda::commands::agenda_move_event,
        titane_infinity::agenda::commands::agenda_delete_event,
        titane_infinity::agenda::commands::agenda_get_event,
        titane_infinity::agenda::commands::agenda_get_events_in_range,
        titane_infinity::agenda::commands::agenda_get_stats,
        titane_infinity::agenda::commands::agenda_complete_event,
        titane_infinity::agenda::commands::agenda_cancel_event,
        // ═══════════════════════════════════════════════════════════════
        // HYBRID ENGINE v∞.26.0 - AI Chat + Dev Console Fusion
        // ═══════════════════════════════════════════════════════════════
        hybrid_commands::dev_run_command,
        hybrid_commands::dev_inspect_file,
        hybrid_commands::dev_apply_patch,
        hybrid_commands::dev_get_logs,
        hybrid_commands::hybrid_analyze_code,
        // ═══════════════════════════════════════════════════════════════
        // CONVERSATION ENGINE v∞ - Unified Pipeline, Memory Map, Self-Healing
        // ═══════════════════════════════════════════════════════════════
        // OMEGA Pipeline Commands (Frontend API)
        titane_infinity::conversation_engine::commands::create_new_conversation,
        titane_infinity::conversation_engine::commands::conversation_generate,
        // Legacy/Advanced Commands
        titane_infinity::conversation_engine::commands::conversation_process_message,
        titane_infinity::conversation_engine::commands::conversation_health_check,
        titane_infinity::conversation_engine::commands::conversation_memory_stats,
        titane_infinity::conversation_engine::commands::conversation_french_postprocess,
        titane_infinity::conversation_engine::commands::conversation_realism_process,
        titane_infinity::conversation_engine::commands::conversation_emotional_process,
        titane_infinity::conversation_engine::commands::conversation_behavioral_check,
        titane_infinity::conversation_engine::commands::literary_engine_process,
        titane_infinity::conversation_engine::commands::literary_engine_update_style,
        titane_infinity::conversation_engine::commands::literary_engine_get_style_profile,
        titane_infinity::conversation_engine::commands::anthology_integrate_text,
        titane_infinity::conversation_engine::commands::anthology_get_literary_dna,
        titane_infinity::conversation_engine::commands::anthology_search_by_tag,
        titane_infinity::conversation_engine::commands::anthology_search_by_layer,
        titane_infinity::conversation_engine::commands::anthology_get_top_lexical_fields,
        titane_infinity::conversation_engine::commands::anthology_get_statistics,
        // ═══════════════════════════════════════════════════════════════
        // IA COMMANDS v∞.19.3Ω - OpenAI + Claude + Unified Engine
        // ═══════════════════════════════════════════════════════════════
        ia_commands::set_api_key,
        ia_commands::delete_api_key,
        ia_commands::list_ai_providers,
        ia_commands::test_api_key,
        ia_commands::ia_generate,
        ia_commands::get_available_engines,
        // ═══════════════════════════════════════════════════════════════
        // MULTI-AGENTS COMMANDS v∞.19.3Ω - Permission System
        // ═══════════════════════════════════════════════════════════════
        multi_agents_commands::list_agents,
        multi_agents_commands::get_agent,
        multi_agents_commands::create_agent,
        multi_agents_commands::update_agent_permission,
        multi_agents_commands::can_agent_use_provider,
        multi_agents_commands::get_agent_recommended_provider,
        multi_agents_commands::get_agent_permission_stats,
        // ═══════════════════════════════════════════════════════════════
        // IA CONTEXT COMMANDS v∞.19.3Ω - Phase 8 Singularity Integration
        // ═══════════════════════════════════════════════════════════════
        ia_context_commands::get_ia_context,
        ia_context_commands::get_ia_global_stats,
        ia_context_commands::set_active_ia_engine,
        ia_context_commands::update_available_ia_engines,
        ia_context_commands::update_ia_engine_status,
        ia_context_commands::record_ia_request,
        ia_context_commands::get_ia_engine_metrics,
        ia_context_commands::get_ia_request_history,
        ia_context_commands::set_last_used_ia_agent,
        ia_context_commands::update_agent_ia_permission,
        ia_context_commands::update_agent_ia_recommendation,
        ia_context_commands::get_next_fallback_ia_engine,
        ia_context_commands::set_ia_auto_fallback,
        ia_context_commands::set_ia_fallback_order,
        ia_context_commands::clear_ia_request_history,
        ia_context_commands::reset_ia_engine_metrics,
    ]);

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    log::info!("TITANE∞ v∞ shutdown - Security System offline");
}
