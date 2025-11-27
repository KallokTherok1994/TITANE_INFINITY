// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v19.8 - QA COMMANDS
//   Commandes Tauri pour système de tests automatisés
// ═══════════════════════════════════════════════════════════════

use crate::qa::qa_engine::{QaEngine, QaReport, QaResult};
use tauri::State;
use tokio::sync::Mutex;

/// État partagé du QA Engine (tokio::sync::Mutex pour async)
pub struct QaState {
    pub engine: Mutex<QaEngine>,
}

impl QaState {
    pub fn new() -> Self {
        Self {
            engine: Mutex::new(QaEngine::new()),
        }
    }
}

/// Exécute tous les tests QA
#[tauri::command]
pub async fn qa_run_all(qa_state: State<'_, QaState>) -> Result<QaReport, String> {
    log::info!("[QA Commands] Running full QA test suite");

    let mut engine = qa_state.engine.lock().await;

    Ok(engine.run_all().await)
}

/// Exécute le test d'un module spécifique
#[tauri::command]
pub async fn qa_run_module(
    module_name: String,
    qa_state: State<'_, QaState>,
) -> Result<QaResult, String> {
    log::info!("[QA Commands] Running test for module: {}", module_name);

    let mut engine = qa_state.engine.lock().await;

    Ok(engine.run_module(&module_name).await)
}

/// Récupère le dernier rapport QA
#[tauri::command]
pub async fn qa_get_last_report(qa_state: State<'_, QaState>) -> Result<Option<QaReport>, String> {
    log::info!("[QA Commands] Fetching last QA report");

    let engine = qa_state.engine.lock().await;

    Ok(engine.get_last_report())
}
