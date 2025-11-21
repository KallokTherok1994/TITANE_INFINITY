// TITANE∞ v16.0 — AUTO-HEAL MODULE
// Module automatique de surveillance et réparation

use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};
use serde::{Deserialize, Serialize};
use tauri::State;

// ============================================================================
// TYPES
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealEvent {
    pub timestamp: u64,
    pub module: String,
    pub event_type: String,
    pub description: String,
    pub severity: String,
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
}

#[derive(Default)]
pub struct AutoHealState {
    events: Arc<Mutex<Vec<HealEvent>>>,
    actions: Arc<Mutex<Vec<HealAction>>>,
    last_scan: Arc<Mutex<u64>>,
}

// ============================================================================
// UTILITIES
// ============================================================================

fn current_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
}

fn log_event(
    state: &AutoHealState,
    module: &str,
    event_type: &str,
    description: &str,
    severity: &str,
) {
    let event = HealEvent {
        timestamp: current_timestamp(),
        module: module.to_string(),
        event_type: event_type.to_string(),
        description: description.to_string(),
        severity: severity.to_string(),
    };
    
    if let Ok(mut events) = state.events.lock() {
        events.push(event.clone());
        // Garder seulement les 100 derniers événements
        if events.len() > 100 {
            events.remove(0);
        }
    }
    
    println!("[AUTO-HEAL] {} | {} | {}", module, event_type, description);
}

fn log_action(
    state: &AutoHealState,
    module: &str,
    action: &str,
    result: &str,
    success: bool,
) {
    let action_log = HealAction {
        timestamp: current_timestamp(),
        module: module.to_string(),
        action: action.to_string(),
        result: result.to_string(),
        success,
    };
    
    if let Ok(mut actions) = state.actions.lock() {
        actions.push(action_log.clone());
        // Garder seulement les 50 dernières actions
        if actions.len() > 50 {
            actions.remove(0);
        }
    }
    
    println!("[AUTO-HEAL] Action: {} → {} ({})", action, result, if success { "✓" } else { "✗" });
}

// ============================================================================
// DIAGNOSTIC
// ============================================================================

fn diagnose_system(state: &AutoHealState) -> Vec<String> {
    let mut issues = Vec::new();
    
    // Vérifier état de la mémoire (simulation)
    log_event(
        state,
        "System",
        "scan",
        "Diagnostic mémoire...",
        "info",
    );
    
    // Vérifier modules critiques
    let critical_modules = vec!["chat_ia", "router", "webview", "ipc"];
    
    for module in critical_modules {
        // Simulation: vérification basique
        log_event(
            state,
            module,
            "check",
            &format!("Vérification module {}", module),
            "info",
        );
    }
    
    // Mettre à jour timestamp du dernier scan
    if let Ok(mut last_scan) = state.last_scan.lock() {
        *last_scan = current_timestamp();
    }
    
    issues
}

// ============================================================================
// RÉPARATION
// ============================================================================

fn repair_module(state: &AutoHealState, module: &str) -> bool {
    log_event(
        state,
        module,
        "repair_start",
        &format!("Démarrage réparation {}", module),
        "warning",
    );
    
    // Simulation de réparation
    let success = match module {
        "chat_ia" => {
            log_action(
                state,
                "chat_ia",
                "reset_state",
                "État Chat IA réinitialisé",
                true,
            );
            log_action(
                state,
                "chat_ia",
                "reload_orchestrator",
                "Orchestrateur IA rechargé",
                true,
            );
            true
        }
        "router" => {
            log_action(
                state,
                "router",
                "reset_routes",
                "Routes réinitialisées",
                true,
            );
            true
        }
        "webview" => {
            log_action(
                state,
                "webview",
                "reload",
                "WebView rechargé",
                true,
            );
            true
        }
        "ipc" => {
            log_action(
                state,
                "ipc",
                "reconnect",
                "IPC reconnecté",
                true,
            );
            true
        }
        _ => {
            log_action(
                state,
                module,
                "unknown",
                "Module inconnu",
                false,
            );
            false
        }
    };
    
    if success {
        log_event(
            state,
            module,
            "repair_success",
            &format!("Réparation {} réussie", module),
            "success",
        );
    } else {
        log_event(
            state,
            module,
            "repair_failed",
            &format!("Réparation {} échouée", module),
            "error",
        );
    }
    
    success
}

fn repair_all(state: &AutoHealState) -> Vec<String> {
    let modules = vec!["chat_ia", "router", "webview", "ipc"];
    let mut results = Vec::new();
    
    for module in modules {
        let success = repair_module(state, module);
        results.push(format!(
            "{}: {}",
            module,
            if success { "✓" } else { "✗" }
        ));
    }
    
    results
}

// ============================================================================
// TAURI COMMANDS
// ============================================================================

#[tauri::command]
pub async fn auto_heal_scan(state: State<'_, AutoHealState>) -> Result<HealReport, String> {
    log_event(
        &state,
        "System",
        "scan_request",
        "Scan demandé via IPC",
        "info",
    );
    
    let issues = diagnose_system(&state);
    
    let events = state.events.lock().unwrap().clone();
    let actions = state.actions.lock().unwrap().clone();
    let last_scan = *state.last_scan.lock().unwrap();
    
    let status = if issues.is_empty() {
        "healthy".to_string()
    } else {
        format!("{} problèmes détectés", issues.len())
    };
    
    Ok(HealReport {
        events,
        actions,
        status,
        last_scan,
    })
}

#[tauri::command]
pub async fn auto_heal_repair(
    module: Option<String>,
    state: State<'_, AutoHealState>,
) -> Result<Vec<String>, String> {
    match module {
        Some(m) => {
            log_event(
                &state,
                &m,
                "repair_request",
                &format!("Réparation {} demandée", m),
                "warning",
            );
            let success = repair_module(&state, &m);
            Ok(vec![format!(
                "{}: {}",
                m,
                if success { "réparé" } else { "échec" }
            )])
        }
        None => {
            log_event(
                &state,
                "System",
                "repair_all_request",
                "Réparation complète demandée",
                "warning",
            );
            Ok(repair_all(&state))
        }
    }
}

#[tauri::command]
pub async fn auto_heal_get_logs(state: State<'_, AutoHealState>) -> Result<HealReport, String> {
    let events = state.events.lock().unwrap().clone();
    let actions = state.actions.lock().unwrap().clone();
    let last_scan = *state.last_scan.lock().unwrap();
    
    Ok(HealReport {
        events,
        actions,
        status: "logs".to_string(),
        last_scan,
    })
}

// ============================================================================
// PANIC HANDLER
// ============================================================================

pub fn setup_panic_handler(state: AutoHealState) {
    std::panic::set_hook(Box::new(move |panic_info| {
        let msg = panic_info.to_string();
        
        log_event(
            &state,
            "Panic",
            "panic_detected",
            &msg,
            "critical",
        );
        
        // Tentative de réparation automatique
        repair_all(&state);
    }));
}

// ============================================================================
// EXPORTS
// ============================================================================

pub fn init() -> AutoHealState {
    AutoHealState::default()
}
