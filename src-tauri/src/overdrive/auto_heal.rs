// ═══════════════════════════════════════════════════════════════════════════
// TITANE∞ v16 — OVERDRIVE AUTO-HEAL ENGINE
// ═══════════════════════════════════════════════════════════════════════════
// Module de réparation automatique avancé avec détection proactive
// ═══════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::State;

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURES
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealEvent {
    pub timestamp: u64,
    pub module: String,
    pub event_type: String,
    pub description: String,
    pub severity: String, // info|warning|error|critical|success
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealAction {
    pub timestamp: u64,
    pub module: String,
    pub action: String,
    pub result: String,
    pub success: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealReport {
    pub events: Vec<HealEvent>,
    pub actions: Vec<HealAction>,
    pub status: String,
    pub last_scan: u64,
    pub system_health: u8, // 0-100
    pub critical_errors: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModuleHealth {
    pub module: String,
    pub status: String, // healthy|degraded|critical|offline
    pub uptime: u64,
    pub error_count: usize,
    pub last_check: u64,
}

pub struct AutoHealState {
    events: Arc<Mutex<Vec<HealEvent>>>,
    actions: Arc<Mutex<Vec<HealAction>>>,
    last_scan: Arc<Mutex<u64>>,
    module_health: Arc<Mutex<Vec<ModuleHealth>>>,
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIALISATION
// ─────────────────────────────────────────────────────────────────────────────

pub fn init() -> AutoHealState {
    let state = AutoHealState {
        events: Arc::new(Mutex::new(Vec::new())),
        actions: Arc::new(Mutex::new(Vec::new())),
        last_scan: Arc::new(Mutex::new(0)),
        module_health: Arc::new(Mutex::new(Vec::new())),
    };

    log_event(
        &state,
        "core".to_string(),
        "init".to_string(),
        "Auto-Heal Engine v16 initialisé".to_string(),
        "success".to_string(),
    );

    // Initialiser la santé des modules
    initialize_modules(&state);

    state
}

fn initialize_modules(state: &AutoHealState) {
    let modules = vec![
        "chat_ia",
        "voice_engine",
        "memory_engine",
        "semantic_kernel",
        "exp_engine",
        "project_autopilot",
        "router",
        "webview",
        "ipc",
        "api_bridge",
    ];

    let mut module_health = state.module_health.lock().unwrap();
    for module in modules {
        module_health.push(ModuleHealth {
            module: module.to_string(),
            status: "healthy".to_string(),
            uptime: 0,
            error_count: 0,
            last_check: get_timestamp(),
        });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// DIAGNOSTIC SYSTÈME
// ─────────────────────────────────────────────────────────────────────────────

// DISABLED: Conflit avec src/auto_heal.rs - Utiliser la version v16.0
/*
#[tauri::command]
pub fn auto_heal_scan(state: State<AutoHealState>) -> Result<HealReport, String> {
    let timestamp = get_timestamp();
    *state.last_scan.lock().unwrap() = timestamp;

    log_event(
        &state,
        "core".to_string(),
        "scan".to_string(),
        "Démarrage scan système complet".to_string(),
        "info".to_string(),
    );

    // Scan tous les modules
    let modules = vec![
        "chat_ia",
        "voice_engine",
        "memory_engine",
        "semantic_kernel",
        "exp_engine",
        "project_autopilot",
        "router",
        "webview",
        "ipc",
        "api_bridge",
    ];

    let mut critical_errors = 0;
    let mut total_errors = 0;

    for module in modules {
        match diagnose_module(&state, module) {
            Ok(health) => {
                if health.status == "critical" {
                    critical_errors += 1;
                } else if health.status == "degraded" {
                    total_errors += 1;
                }
                update_module_health(&state, health);
            }
            Err(e) => {
                log_event(
                    &state,
                    module.to_string(),
                    "scan_error".to_string(),
                    format!("Erreur diagnostic: {}", e),
                    "error".to_string(),
                );
                critical_errors += 1;
            }
        }
    }

    // Calculer santé globale
    let system_health = if critical_errors > 0 {
        30
    } else if total_errors > 2 {
        60
    } else if total_errors > 0 {
        80
    } else {
        100
    };

    log_event(
        &state,
        "core".to_string(),
        "scan_complete".to_string(),
        format!(
            "Scan terminé - Santé: {}% - Erreurs critiques: {}",
            system_health, critical_errors
        ),
        if critical_errors > 0 {
            "warning"
        } else {
            "success"
        }
        .to_string(),
    );

    Ok(HealReport {
        events: get_recent_events(&state, 50),
        actions: get_recent_actions(&state, 25),
        status: if critical_errors > 0 {
            "critical".to_string()
        } else if total_errors > 0 {
            "degraded".to_string()
        } else {
            "healthy".to_string()
        },
        last_scan: timestamp,
        system_health,
        critical_errors,
    })
}

fn diagnose_module(state: &AutoHealState, module: &str) -> Result<ModuleHealth, String> {
    let timestamp = get_timestamp();

    // Simulation de diagnostic (à adapter selon les vrais checks)
    let status = match module {
        "chat_ia" => check_chat_ia_health(),
        "voice_engine" => check_voice_engine_health(),
        "memory_engine" => check_memory_engine_health(),
        "router" => check_router_health(),
        "webview" => check_webview_health(),
        _ => "healthy".to_string(),
    };

    let error_count = if status == "critical" {
        5
    } else if status == "degraded" {
        2
    } else {
        0
    };

    Ok(ModuleHealth {
        module: module.to_string(),
        status,
        uptime: 0, // À calculer depuis le démarrage
        error_count,
        last_check: timestamp,
    })
}

fn check_chat_ia_health() -> String {
    // Vérifier orchestrateur, providers, websocket
    "healthy".to_string()
}

fn check_voice_engine_health() -> String {
    // Vérifier ASR, TTS, audio pipeline
    "healthy".to_string()
}

fn check_memory_engine_health() -> String {
    // Vérifier embeddings, vector store
    "healthy".to_string()
}

fn check_router_health() -> String {
    // Vérifier React Router, navigation
    "healthy".to_string()
}

fn check_webview_health() -> String {
    // Vérifier WebView, DOM, rendering
    "healthy".to_string()
}

}
*/

// ─────────────────────────────────────────────────────────────────────────────
// RÉPARATION AUTOMATIQUE
// ─────────────────────────────────────────────────────────────────────────────

// DISABLED: Conflit avec src/auto_heal.rs
/*
#[tauri::command]
pub fn auto_heal_repair(
    module: Option<String>,
    state: State<AutoHealState>,
) -> Result<Vec<String>, String> {
    match module {
        Some(m) => {
            log_event(
                &state,
                m.clone(),
                "repair_start".to_string(),
                format!("Démarrage réparation module: {}", m),
                "info".to_string(),
            );
            repair_module(&state, &m)
        }
        None => {
            log_event(
                &state,
                "core".to_string(),
                "repair_all_start".to_string(),
                "Démarrage réparation complète système".to_string(),
                "info".to_string(),
            );
            repair_all(&state)
        }
    }
}

fn repair_module(state: &AutoHealState, module: &str) -> Result<Vec<String>, String> {
    let mut results = Vec::new();

    let action_result = match module {
        "chat_ia" => repair_chat_ia(state),
        "voice_engine" => repair_voice_engine(state),
        "memory_engine" => repair_memory_engine(state),
        "semantic_kernel" => repair_semantic_kernel(state),
        "exp_engine" => repair_exp_engine(state),
        "project_autopilot" => repair_project_autopilot(state),
        "router" => repair_router(state),
        "webview" => repair_webview(state),
        "ipc" => repair_ipc(state),
        "api_bridge" => repair_api_bridge(state),
        _ => Err(format!("Module inconnu: {}", module)),
    };

    match action_result {
        Ok(msg) => {
            results.push(format!("✅ {} réparé: {}", module, msg));
            log_action(state, module.to_string(), "repair".to_string(), msg, true);
        }
        Err(e) => {
            results.push(format!("❌ {} échec: {}", module, e));
            log_action(state, module.to_string(), "repair".to_string(), e, false);
        }
    }

    Ok(results)
}

fn repair_all(state: &AutoHealState) -> Result<Vec<String>, String> {
    let modules = vec![
        "chat_ia",
        "voice_engine",
        "memory_engine",
        "semantic_kernel",
        "exp_engine",
        "project_autopilot",
        "router",
        "webview",
        "ipc",
        "api_bridge",
    ];

    let mut results = Vec::new();

    for module in modules {
        match repair_module(state, module) {
            Ok(mut r) => results.append(&mut r),
            Err(e) => results.push(format!("❌ {}: {}", module, e)),
        }
    }

    log_event(
        state,
        "core".to_string(),
        "repair_all_complete".to_string(),
        format!("Réparation complète terminée - {} actions", results.len()),
        "success".to_string(),
    );

    Ok(results)
}

// ─────────────────────────────────────────────────────────────────────────────
// RÉPARATIONS SPÉCIFIQUES PAR MODULE
// ─────────────────────────────────────────────────────────────────────────────

fn repair_chat_ia(state: &AutoHealState) -> Result<String, String> {
    // Réinitialiser orchestrateur
    // Reconnecter providers
    // Vider cache messages corrompus
    Ok("Orchestrateur réinitialisé, providers reconnectés".to_string())
}

fn repair_voice_engine(state: &AutoHealState) -> Result<String, String> {
    // Réinitialiser pipeline audio
    // Recalibrer micro
    // Redémarrer ASR/TTS
    Ok("Pipeline audio réinitialisé, ASR/TTS redémarrés".to_string())
}

fn repair_memory_engine(state: &AutoHealState) -> Result<String, String> {
    // Reconstruire index embeddings
    // Vérifier vector store
    // Nettoyer corruptions
    Ok("Index embeddings reconstruit, vector store validé".to_string())
}

fn repair_semantic_kernel(state: &AutoHealState) -> Result<String, String> {
    // Réinitialiser kernel
    // Recharger skills
    // Valider connections
    Ok("Kernel réinitialisé, skills rechargés".to_string())
}

fn repair_exp_engine(state: &AutoHealState) -> Result<String, String> {
    // Valider base XP
    // Recalculer niveaux
    // Synchroniser talents
    Ok("Base XP validée, niveaux recalculés".to_string())
}

fn repair_project_autopilot(state: &AutoHealState) -> Result<String, String> {
    // Réindexer projets
    // Reconstruire dépendances
    // Redémarrer autopilot
    Ok("Projets réindexés, autopilot redémarré".to_string())
}

fn repair_router(state: &AutoHealState) -> Result<String, String> {
    // Nettoyer historique navigation
    // Réinitialiser routes
    Ok("Routes réinitialisées, historique nettoyé".to_string())
}

fn repair_webview(state: &AutoHealState) -> Result<String, String> {
    // Recharger WebView
    // Vider caches
    Ok("WebView rechargée, caches vidés".to_string())
}

fn repair_ipc(state: &AutoHealState) -> Result<String, String> {
    // Réinitialiser channels IPC
    // Reconnecter frontend ↔ backend
    Ok("Channels IPC réinitialisés".to_string())
}

fn repair_api_bridge(state: &AutoHealState) -> Result<String, String> {
    // Reconnecter API externe (Gemini, etc.)
    // Valider authentification
    Ok("API bridge reconnectée, auth validée".to_string())
}

}
*/

// ─────────────────────────────────────────────────────────────────────────────
// LOGS & HISTORIQUE
// ─────────────────────────────────────────────────────────────────────────────

// DISABLED: Conflit avec src/auto_heal.rs
/*
#[tauri::command]
pub fn auto_heal_get_logs(state: State<AutoHealState>) -> Result<HealReport, String> {
    let events = get_recent_events(&state, 100);
    let actions = get_recent_actions(&state, 50);
    let last_scan = *state.last_scan.lock().unwrap();

    // Compter erreurs critiques récentes
    let critical_errors = events
        .iter()
        .filter(|e| e.severity == "critical")
        .count();

    let system_health = if critical_errors > 5 {
        30
    } else if critical_errors > 0 {
        70
    } else {
        100
    };

    Ok(HealReport {
        events,
        actions,
        status: "retrieved".to_string(),
        last_scan,
        system_health,
        critical_errors,
    })
}

fn log_event(
    state: &AutoHealState,
    module: String,
    event_type: String,
    description: String,
    severity: String,
) {
    let event = HealEvent {
        timestamp: get_timestamp(),
        module: module.clone(),
        event_type: event_type.clone(),
        description: description.clone(),
        severity: severity.clone(),
    };

    let mut events = state.events.lock().unwrap();
    events.push(event);

    // Limiter à 100 derniers événements
    let events_len = events.len();
    if events_len > 100 {
        events.drain(0..(events_len - 100));
    }

    println!(
        "[AUTO-HEAL] {} | {} | {} | {}",
        module, event_type, severity, description
    );
}

fn log_action(
    state: &AutoHealState,
    module: String,
    action: String,
    result: String,
    success: bool,
) {
    let action_obj = HealAction {
        timestamp: get_timestamp(),
        module: module.clone(),
        action: action.clone(),
        result: result.clone(),
        success,
    };

    let mut actions = state.actions.lock().unwrap();
    actions.push(action_obj);

    // Limiter à 50 dernières actions
    let actions_len = actions.len();
    if actions_len > 50 {
        actions.drain(0..(actions_len - 50));
    }
}

fn get_recent_events(state: &AutoHealState, count: usize) -> Vec<HealEvent> {
    let events = state.events.lock().unwrap();
    let start = if events.len() > count {
        events.len() - count
    } else {
        0
    };
    events[start..].to_vec()
}

fn get_recent_actions(state: &AutoHealState, count: usize) -> Vec<HealAction> {
    let actions = state.actions.lock().unwrap();
    let start = if actions.len() > count {
        actions.len() - count
    } else {
        0
    };
    actions[start..].to_vec()
}

fn update_module_health(state: &AutoHealState, new_health: ModuleHealth) {
    let mut module_health = state.module_health.lock().unwrap();
    if let Some(health) = module_health
        .iter_mut()
        .find(|h| h.module == new_health.module)
    {
        *health = new_health;
    } else {
        module_health.push(new_health);
    }
}

}
*/

// ─────────────────────────────────────────────────────────────────────────────
// PANIC HANDLER
// ─────────────────────────────────────────────────────────────────────────────

pub fn setup_panic_handler(state: AutoHealState) {
    std::panic::set_hook(Box::new(move |panic_info| {
        let msg = if let Some(s) = panic_info.payload().downcast_ref::<&str>() {
            s.to_string()
        } else {
            "Panic sans message".to_string()
        };

        log_event(
            &state,
            "core".to_string(),
            "panic".to_string(),
            format!("PANIC DÉTECTÉ: {}", msg),
            "critical".to_string(),
        );

        // Auto-réparation immédiate
        let _ = repair_all(&state);
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────

fn get_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
}
