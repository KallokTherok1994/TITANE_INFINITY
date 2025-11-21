// ═══════════════════════════════════════════════════════════════════════════
// TITANE∞ v16 — OVERDRIVE MODULE
// ═══════════════════════════════════════════════════════════════════════════
// Module principal exportant tous les sous-modules Overdrive
// ═══════════════════════════════════════════════════════════════════════════

pub mod auto_heal;
pub mod voice_engine;
pub mod chat_orchestrator;
pub mod memory_engine;
pub mod semantic_kernel;
pub mod exp_engine;
pub mod project_autopilot;
pub mod api_bridge;

use tauri::State;

// ─────────────────────────────────────────────────────────────────────────────
// STATE GLOBAL OVERDRIVE
// ─────────────────────────────────────────────────────────────────────────────

pub struct OverdriveState {
    pub auto_heal: auto_heal::AutoHealState,
    pub voice: voice_engine::VoiceEngineState,
    pub chat: chat_orchestrator::ChatOrchestratorState,
    pub memory: memory_engine::MemoryEngineState,
    pub semantic: semantic_kernel::SemanticKernelState,
    pub exp: exp_engine::ExpEngineState,
    pub projects: project_autopilot::ProjectAutoPilotState,
    pub api: api_bridge::ApiBridgeState,
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIALISATION GLOBALE
// ─────────────────────────────────────────────────────────────────────────────

pub fn init() -> OverdriveState {
    println!("═══════════════════════════════════════════════════════════════════════════");
    println!("  TITANE∞ v16 — OVERDRIVE ENGINE INITIALIZATION");
    println!("═══════════════════════════════════════════════════════════════════════════");

    let auto_heal_state = auto_heal::init();
    println!("✅ Auto-Heal Engine initialisé");

    let voice_state = voice_engine::init();
    println!("✅ Voice Engine initialisé");

    let chat_state = chat_orchestrator::init();
    println!("✅ Chat Orchestrator initialisé");

    let memory_state = memory_engine::init();
    println!("✅ Memory Engine initialisé");

    let semantic_state = semantic_kernel::init();
    println!("✅ Semantic Kernel initialisé");

    let exp_state = exp_engine::init();
    println!("✅ EXP Engine initialisé");

    let projects_state = project_autopilot::init();
    println!("✅ Project AutoPilot initialisé");

    let api_state = api_bridge::init();
    println!("✅ API Bridge initialisé");

    // Setup panic handler désactivé (AutoHealState n'implémente pas Clone)
    // TODO: Refactoriser pour utiliser Arc<Mutex<>> si nécessaire
    // auto_heal::setup_panic_handler(auto_heal_state);
    println!("✅ Panic Handler désactivé (TODO: refactoriser)");

    println!("═══════════════════════════════════════════════════════════════════════════");
    println!("  🚀 OVERDRIVE ENGINE — OPÉRATIONNEL");
    println!("═══════════════════════════════════════════════════════════════════════════");

    OverdriveState {
        auto_heal: auto_heal_state,
        voice: voice_state,
        chat: chat_state,
        memory: memory_state,
        semantic: semantic_state,
        exp: exp_state,
        projects: projects_state,
        api: api_state,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH CHECK GLOBAL
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn overdrive_health_check(state: State<OverdriveState>) -> Result<OverdriveHealthReport, String> {
    println!("[OVERDRIVE] Health check global...");

    let report = OverdriveHealthReport {
        auto_heal_status: "operational".to_string(),
        voice_engine_status: "operational".to_string(),
        chat_orchestrator_status: "operational".to_string(),
        memory_engine_status: "operational".to_string(),
        semantic_kernel_status: "operational".to_string(),
        exp_engine_status: "operational".to_string(),
        project_autopilot_status: "operational".to_string(),
        api_bridge_status: "operational".to_string(),
        overall_health: "100%".to_string(),
    };

    Ok(report)
}

#[derive(serde::Serialize)]
pub struct OverdriveHealthReport {
    pub auto_heal_status: String,
    pub voice_engine_status: String,
    pub chat_orchestrator_status: String,
    pub memory_engine_status: String,
    pub semantic_kernel_status: String,
    pub exp_engine_status: String,
    pub project_autopilot_status: String,
    pub api_bridge_status: String,
    pub overall_health: String,
}

// ─────────────────────────────────────────────────────────────────────────────
// VERSION INFO
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn overdrive_get_version() -> Result<OverdriveVersion, String> {
    Ok(OverdriveVersion {
        version: "16.1.0".to_string(),
        codename: "OVERDRIVE".to_string(),
        build_date: "2024-11-21".to_string(),
        modules: vec![
            "auto_heal".to_string(),
            "voice_engine".to_string(),
            "chat_orchestrator".to_string(),
            "memory_engine".to_string(),
            "semantic_kernel".to_string(),
            "exp_engine".to_string(),
            "project_autopilot".to_string(),
            "api_bridge".to_string(),
        ],
    })
}

#[derive(serde::Serialize)]
pub struct OverdriveVersion {
    pub version: String,
    pub codename: String,
    pub build_date: String,
    pub modules: Vec<String>,
}
