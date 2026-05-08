// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   TIME-TRAVEL COMMANDS — Super-Prompt N
//   Commandes Tauri pour TimePage UI (anciennement TimeNavigator)
// ═══════════════════════════════════════════════════════════════

use crate::security::permission_guard::PERMISSION_GUARD;
use crate::security::permissions::Role;
use crate::persistence::PERSISTENCE_ENGINE;
use serde::{Deserialize, Serialize};

/// Métadonnées snapshot pour UI
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SnapshotMetadata {
    pub id: String,
    pub timestamp: u64,
    pub version: String,
    pub size: usize,
    pub checksum: String,
    pub context: SnapshotContext,
}

/// Context snapshot pour UI
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SnapshotContext {
    pub xp: i32,
    pub level: i32,
    pub active_engines: Vec<String>,
    pub design_system: String,
    pub persona_mood: String,
}

/// Statistiques time-travel
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TravelStats {
    pub total_snapshots: usize,
    pub ram_cache_size: usize,
    pub disk_usage_bytes: usize,
    pub oldest_snapshot: u64,
    pub newest_snapshot: u64,
}

/// Lister tous les snapshots
#[tauri::command]
pub async fn list_snapshots() -> Result<Vec<SnapshotMetadata>, String> {
    // Permission check
    PERMISSION_GUARD
        .require("snapshot_read", Role::User, "list_snapshots")
        .await
        .map_err(|e| e.to_string())?;

    {
        let mut engine = PERSISTENCE_ENGINE.write().await;
        engine.initialize().await.map_err(|e| e.to_string())?;
    }

    let engine = PERSISTENCE_ENGINE.read().await;
    let snapshots = engine.list_snapshots().await.map_err(|e| e.to_string())?;

    Ok(snapshots
        .into_iter()
        .map(|snapshot| SnapshotMetadata {
            checksum: snapshot.id.chars().take(12).collect(),
            context: SnapshotContext {
                xp: 0,
                level: 0,
                active_engines: vec!["PersistenceEngine".to_string()],
                design_system: "persistence-runtime".to_string(),
                persona_mood: "State snapshot".to_string(),
            },
            id: snapshot.id,
            size: snapshot.size_bytes as usize,
            timestamp: snapshot.timestamp / 1000,
            version: format!("schema-{}", snapshot.schema_version),
        })
        .collect())
}

/// Obtenir statistiques time-travel
#[tauri::command]
pub async fn get_travel_stats() -> Result<TravelStats, String> {
    // Permission check
    PERMISSION_GUARD
        .require("snapshot_read", Role::User, "get_travel_stats")
        .await
        .map_err(|e| e.to_string())?;

    {
        let mut engine = PERSISTENCE_ENGINE.write().await;
        engine.initialize().await.map_err(|e| e.to_string())?;
    }

    let engine = PERSISTENCE_ENGINE.read().await;
    let snapshots = engine.list_snapshots().await.map_err(|e| e.to_string())?;

    let disk_usage_bytes = snapshots.iter().map(|snapshot| snapshot.size_bytes).sum::<u64>();
    let oldest_snapshot = snapshots
        .iter()
        .map(|snapshot| snapshot.timestamp / 1000)
        .min()
        .unwrap_or(0);
    let newest_snapshot = snapshots
        .iter()
        .map(|snapshot| snapshot.timestamp / 1000)
        .max()
        .unwrap_or(0);

    Ok(TravelStats {
        total_snapshots: snapshots.len(),
        ram_cache_size: 0,
        disk_usage_bytes: disk_usage_bytes as usize,
        oldest_snapshot,
        newest_snapshot,
    })
}

/// Restaurer un snapshot (ROOT uniquement)
#[tauri::command]
pub async fn restore_snapshot(snapshot_id: String) -> Result<(), String> {
    // Permission check - ROOT ONLY
    PERMISSION_GUARD
        .require("snapshot_restore", Role::Root, "restore_snapshot")
        .await
        .map_err(|e| e.to_string())?;

    log::warn!("🔄 [TIME-TRAVEL] Restore requested: {}", snapshot_id);

    Err(format!(
        "restore_snapshot non supporte sur le runtime persistence-backed actuel ({})",
        snapshot_id
    ))
}

/// Supprimer un snapshot (SYSTEM)
#[tauri::command]
pub async fn delete_snapshot(snapshot_id: String) -> Result<(), String> {
    // Permission check - SYSTEM level
    PERMISSION_GUARD
        .require("snapshot_delete", Role::System, "delete_snapshot")
        .await
        .map_err(|e| e.to_string())?;

    log::info!("🗑️  [TIME-TRAVEL] Delete requested: {}", snapshot_id);

    Err(format!(
        "delete_snapshot non supporte sur le runtime persistence-backed actuel ({})",
        snapshot_id
    ))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn snapshot_metadata_serializes_to_camel_case() {
        let payload = SnapshotMetadata {
            id: "snap".to_string(),
            timestamp: 1,
            version: "schema-1".to_string(),
            size: 42,
            checksum: "abc".to_string(),
            context: SnapshotContext {
                xp: 0,
                level: 0,
                active_engines: vec!["PersistenceEngine".to_string()],
                design_system: "persistence-runtime".to_string(),
                persona_mood: "State snapshot".to_string(),
            },
        };

        let value = serde_json::to_value(payload).expect("snapshot metadata should serialize");
        assert!(value.get("checksum").is_some());
        assert!(value.get("active_engines").is_none());
        assert_eq!(value["context"]["activeEngines"][0], "PersistenceEngine");
    }

    #[test]
    fn travel_stats_serializes_to_camel_case() {
        let payload = TravelStats {
            total_snapshots: 1,
            ram_cache_size: 0,
            disk_usage_bytes: 10,
            oldest_snapshot: 2,
            newest_snapshot: 3,
        };

        let value = serde_json::to_value(payload).expect("travel stats should serialize");
        assert!(value.get("totalSnapshots").is_some());
        assert!(value.get("total_snapshots").is_none());
        assert_eq!(value["diskUsageBytes"], 10);
    }
}
