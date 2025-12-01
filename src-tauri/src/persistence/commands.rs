/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.MPE — PERSISTENCE COMMANDS
 * Commandes Tauri pour la persistence 100% SAVE
 * ═══════════════════════════════════════════════════════════════════════════════
 */

use crate::persistence::{PERSISTENCE_ENGINE, TitanEvent, PersistenceStatus, IntegrityReport};
use crate::core::SingularityState;
use serde::{Deserialize, Serialize};

/// DTO pour événement frontend
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TitanEventDto {
    pub module: String,
    pub event_type: String,
    pub payload: serde_json::Value,
    pub metadata: Option<std::collections::HashMap<String, serde_json::Value>>,
}

/// DTO pour le status de persistence
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PersistenceStatusDto {
    pub events_persisted: u64,
    pub snapshots_created: u64,
    pub last_event: Option<u64>,
    pub last_snapshot: Option<u64>,
    pub last_integrity_check: Option<u64>,
    pub integrity_ok: bool,
    pub dirty: bool,
    pub journal_size_bytes: u64,
}

impl From<&PersistenceStatus> for PersistenceStatusDto {
    fn from(status: &PersistenceStatus) -> Self {
        Self {
            events_persisted: status.events_persisted,
            snapshots_created: status.snapshots_created,
            last_event: status.last_event,
            last_snapshot: status.last_snapshot,
            last_integrity_check: status.last_integrity_check,
            integrity_ok: status.integrity_ok,
            dirty: status.dirty,
            journal_size_bytes: status.journal_size_bytes,
        }
    }
}

/// Initialiser le moteur de persistence
#[tauri::command]
pub async fn titan_persistence_init() -> Result<(), String> {
    let mut engine = PERSISTENCE_ENGINE.write().await;
    engine.initialize().await.map_err(|e| e.to_string())
}

/// Persister un événement
#[tauri::command]
pub async fn titan_persist_event(event: TitanEventDto) -> Result<(), String> {
    let titan_event = TitanEvent::new(&event.module, &event.event_type, event.payload);

    let mut engine = PERSISTENCE_ENGINE.write().await;
    engine.persist_event(titan_event).await.map_err(|e| e.to_string())
}

/// Forcer un snapshot avec état fourni
#[tauri::command]
pub async fn titan_force_snapshot(state_json: String) -> Result<(), String> {
    // Désérialiser l'état reçu du frontend
    let state: SingularityState =
        serde_json::from_str(&state_json).map_err(|e| format!("JSON parse error: {}", e))?;

    let mut engine = PERSISTENCE_ENGINE.write().await;
    engine.force_snapshot(&state).await.map_err(|e| e.to_string())
}

/// Obtenir le status de persistence
#[tauri::command]
pub async fn titan_get_persistence_status() -> Result<PersistenceStatusDto, String> {
    let engine = PERSISTENCE_ENGINE.read().await;
    Ok(PersistenceStatusDto::from(engine.get_status()))
}

/// Vérifier l'intégrité
#[tauri::command]
pub async fn titan_check_integrity() -> Result<IntegrityReport, String> {
    let mut engine = PERSISTENCE_ENGINE.write().await;
    engine.check_integrity().await.map_err(|e| e.to_string())
}

/// Compacter le journal
#[tauri::command]
pub async fn titan_compact_journal() -> Result<crate::persistence::CompactionReport, String> {
    let mut engine = PERSISTENCE_ENGINE.write().await;
    engine.compact_journal().await.map_err(|e| e.to_string())
}

/// Charger l'état le plus récent
#[tauri::command]
pub async fn titan_load_state() -> Result<Option<SingularityState>, String> {
    let engine = PERSISTENCE_ENGINE.read().await;
    engine.load_latest_state().await.map_err(|e| e.to_string())
}

/// Shutdown propre
#[tauri::command]
pub async fn titan_persistence_shutdown() -> Result<(), String> {
    let mut engine = PERSISTENCE_ENGINE.write().await;
    engine.shutdown().await.map_err(|e| e.to_string())
}
