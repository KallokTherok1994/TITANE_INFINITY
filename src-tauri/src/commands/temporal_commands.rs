// ═══════════════════════════════════════════════════════════════
// TITANE∞ — TEMPORAL COMMANDS
// Données temporelles: blocs agenda, timeline, énergie
// ═══════════════════════════════════════════════════════════════

use crate::security::permission_guard::PERMISSION_GUARD;
use crate::security::permissions::Role;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeBlock {
    pub id: String,
    pub start: String,
    pub end: String,
    pub title: String,
    pub block_type: String,
    pub priority: String,
    pub energy: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineEvent {
    pub id: String,
    pub date: String,
    pub title: String,
    pub event_type: String,
    pub description: String,
    pub importance: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemporalState {
    pub current_energy: u8,
    pub today_blocks: Vec<TimeBlock>,
    pub current_block_id: Option<String>,
}

/// Obtenir l'état temporel actuel (blocs du jour + énergie)
#[tauri::command]
pub async fn temporal_get_today_state() -> Result<TemporalState, String> {
    PERMISSION_GUARD
        .require("system_read", Role::User, "temporal_get_today_state")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    // Lire depuis la base de données ou le fichier de configuration
    let state_path = std::path::Path::new("data/temporal_state.json");

    if state_path.exists() {
        let content = std::fs::read_to_string(state_path)
            .map_err(|e| format!("Failed to read temporal state: {}", e))?;
        let state: TemporalState = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse temporal state: {}", e))?;
        return Ok(state);
    }

    // État par défaut si aucun fichier n'existe
    Ok(TemporalState {
        current_energy: 72,
        today_blocks: vec![],
        current_block_id: None,
    })
}

/// Sauvegarder les blocs du jour
#[tauri::command]
pub async fn temporal_save_today_blocks(blocks: Vec<TimeBlock>) -> Result<(), String> {
    PERMISSION_GUARD
        .require("system_write", Role::User, "temporal_save_today_blocks")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    let state_path = std::path::Path::new("data/temporal_state.json");

    // Créer le répertoire si nécessaire
    if let Some(parent) = state_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create data directory: {}", e))?;
    }

    // Lire l'état existant ou créer un nouveau
    let mut state = if state_path.exists() {
        let content = std::fs::read_to_string(state_path)
            .map_err(|e| format!("Failed to read temporal state: {}", e))?;
        serde_json::from_str::<TemporalState>(&content)
            .map_err(|e| format!("Failed to parse temporal state: {}", e))?
    } else {
        TemporalState {
            current_energy: 72,
            today_blocks: vec![],
            current_block_id: None,
        }
    };

    state.today_blocks = blocks;

    let json = serde_json::to_string_pretty(&state)
        .map_err(|e| format!("Failed to serialize temporal state: {}", e))?;
    std::fs::write(state_path, json)
        .map_err(|e| format!("Failed to write temporal state: {}", e))?;

    Ok(())
}

/// Obtenir les événements de la timeline
#[tauri::command]
pub async fn temporal_get_timeline_events(
    start_date: Option<String>,
    end_date: Option<String>,
) -> Result<Vec<TimelineEvent>, String> {
    PERMISSION_GUARD
        .require("system_read", Role::User, "temporal_get_timeline_events")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    let events_path = std::path::Path::new("data/timeline_events.json");

    if !events_path.exists() {
        return Ok(vec![]);
    }

    let content = std::fs::read_to_string(events_path)
        .map_err(|e| format!("Failed to read timeline events: {}", e))?;
    let mut events: Vec<TimelineEvent> = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse timeline events: {}", e))?;

    // Filtrer par dates si spécifiées
    if let Some(start) = start_date {
        events.retain(|e| e.date >= start);
    }
    if let Some(end) = end_date {
        events.retain(|e| e.date <= end);
    }

    // Trier par date
    events.sort_by(|a, b| a.date.cmp(&b.date));

    Ok(events)
}

/// Ajouter un événement à la timeline
#[tauri::command]
pub async fn temporal_add_timeline_event(event: TimelineEvent) -> Result<(), String> {
    PERMISSION_GUARD
        .require("system_write", Role::User, "temporal_add_timeline_event")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    let events_path = std::path::Path::new("data/timeline_events.json");

    if let Some(parent) = events_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create data directory: {}", e))?;
    }

    let mut events: Vec<TimelineEvent> = if events_path.exists() {
        let content = std::fs::read_to_string(events_path)
            .map_err(|e| format!("Failed to read timeline events: {}", e))?;
        serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse timeline events: {}", e))?
    } else {
        vec![]
    };

    events.push(event);
    events.sort_by(|a, b| a.date.cmp(&b.date));

    let json = serde_json::to_string_pretty(&events)
        .map_err(|e| format!("Failed to serialize timeline events: {}", e))?;
    std::fs::write(events_path, json)
        .map_err(|e| format!("Failed to write timeline events: {}", e))?;

    Ok(())
}

/// Mettre à jour le niveau d'énergie actuel
#[tauri::command]
pub async fn temporal_update_energy(energy: u8) -> Result<(), String> {
    PERMISSION_GUARD
        .require("system_write", Role::User, "temporal_update_energy")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    let state_path = std::path::Path::new("data/temporal_state.json");

    let mut state = if state_path.exists() {
        let content = std::fs::read_to_string(state_path)
            .map_err(|e| format!("Failed to read temporal state: {}", e))?;
        serde_json::from_str::<TemporalState>(&content)
            .map_err(|e| format!("Failed to parse temporal state: {}", e))?
    } else {
        TemporalState {
            current_energy: 72,
            today_blocks: vec![],
            current_block_id: None,
        }
    };

    state.current_energy = energy.min(100);

    if let Some(parent) = state_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create data directory: {}", e))?;
    }

    let json = serde_json::to_string_pretty(&state)
        .map_err(|e| format!("Failed to serialize temporal state: {}", e))?;
    std::fs::write(state_path, json)
        .map_err(|e| format!("Failed to write temporal state: {}", e))?;

    Ok(())
}