// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — CLOUD SYNC TAURI COMMANDS
//   Commandes exposées au frontend pour Cloud Center
// ═══════════════════════════════════════════════════════════════

use log::info;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::State;

use super::cloud_sync_engine::{CloudSyncEngine, SyncResult};
use super::cloud_vault::DeviceIdentity;
use super::{CloudSyncConfig, SyncBackend, SyncMode, ConflictResolution, SyncStatus};

/// État global du Cloud Sync Engine
pub struct CloudSyncState {
    pub engine: Mutex<Option<CloudSyncEngine>>,
}

impl Default for CloudSyncState {
    fn default() -> Self {
        Self {
            engine: Mutex::new(None),
        }
    }
}

/// ═══════════════════════════════════════════════════════════════
/// RÉPONSES API
/// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CloudStatusResponse {
    pub initialized: bool,
    pub status: SyncStatus,
    pub vault_loaded: bool,
    pub vault_revision: Option<u64>,
    pub vault_size_bytes: Option<u64>,
    pub last_sync: Option<String>,
    pub device_id: Option<String>,
    pub device_name: Option<String>,
    pub backend: Option<SyncBackend>,
    pub sync_mode: Option<SyncMode>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DevicesResponse {
    pub local_device: Option<DeviceIdentity>,
    pub known_devices: Vec<DeviceIdentity>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncHistoryResponse {
    pub entries: Vec<super::cloud_vault::SyncHistoryEntry>,
    pub total_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CloudHealReport {
    pub vault_healthy: bool,
    pub issues_found: Vec<String>,
    pub actions_taken: Vec<String>,
    pub backup_created: bool,
    pub backup_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupInfo {
    pub path: String,
    pub filename: String,
    pub created_timestamp: u64,
    pub size_bytes: u64,
}

/// ═══════════════════════════════════════════════════════════════
/// COMMANDES TAURI
/// ═══════════════════════════════════════════════════════════════

/// Initialise le Cloud Sync Engine
#[tauri::command]
pub async fn cloud_init(
    state: State<'_, CloudSyncState>,
    passphrase: String,
    device_name: String,
) -> Result<CloudStatusResponse, String> {
    info!("[CloudSync] Initializing with device name: {}", device_name);

    let data_path = get_cloud_data_path()?;

    let engine = CloudSyncEngine::new(data_path, &passphrase, &device_name)
        .map_err(|e| format!("Failed to initialize Cloud Sync: {}", e))?;

    let status = engine.get_status();
    let vault = engine.get_vault();
    let device = engine.get_device_identity();
    let config = engine.get_config();

    let response = CloudStatusResponse {
        initialized: true,
        status,
        vault_loaded: vault.is_some(),
        vault_revision: vault.map(|v| v.revision),
        vault_size_bytes: None,
        last_sync: vault.and_then(|v| v.last_sync.map(|t| t.to_rfc3339())),
        device_id: Some(device.device_id.clone()),
        device_name: Some(device.device_name.clone()),
        backend: Some(config.backend),
        sync_mode: Some(config.mode),
    };

    if let Ok(mut guard) = state.engine.lock() {
        *guard = Some(engine);
    }

    info!("[CloudSync] Initialized successfully");
    Ok(response)
}

/// Charge le vault
#[tauri::command]
pub async fn cloud_load_vault(
    state: State<'_, CloudSyncState>,
) -> Result<Option<serde_json::Value>, String> {
    let mut guard = state.engine.lock().map_err(|e| e.to_string())?;
    let engine = guard.as_mut().ok_or("Cloud Sync not initialized")?;

    let vault = engine.load_vault().map_err(|e| e.to_string())?;
    Ok(vault.map(|v| serde_json::to_value(v).unwrap_or_default()))
}

/// Crée un nouveau vault
#[tauri::command]
pub async fn cloud_create_vault(
    state: State<'_, CloudSyncState>,
) -> Result<serde_json::Value, String> {
    let mut guard = state.engine.lock().map_err(|e| e.to_string())?;
    let engine = guard.as_mut().ok_or("Cloud Sync not initialized")?;

    let vault = engine.create_vault().map_err(|e| e.to_string())?;
    serde_json::to_value(vault).map_err(|e| e.to_string())
}

/// Retourne le statut du Cloud Sync
#[tauri::command]
pub async fn cloud_get_status(
    state: State<'_, CloudSyncState>,
) -> Result<CloudStatusResponse, String> {
    let guard = state.engine.lock().map_err(|e| e.to_string())?;

    match guard.as_ref() {
        Some(engine) => {
            let status = engine.get_status();
            let vault = engine.get_vault();
            let device = engine.get_device_identity();
            let config = engine.get_config();

            Ok(CloudStatusResponse {
                initialized: true,
                status,
                vault_loaded: vault.is_some(),
                vault_revision: vault.map(|v| v.revision),
                vault_size_bytes: None,
                last_sync: vault.and_then(|v| v.last_sync.map(|t| t.to_rfc3339())),
                device_id: Some(device.device_id.clone()),
                device_name: Some(device.device_name.clone()),
                backend: Some(config.backend),
                sync_mode: Some(config.mode),
            })
        }
        None => Ok(CloudStatusResponse {
            initialized: false,
            status: SyncStatus::Idle,
            vault_loaded: false,
            vault_revision: None,
            vault_size_bytes: None,
            last_sync: None,
            device_id: None,
            device_name: None,
            backend: None,
            sync_mode: None,
        }),
    }
}

/// Synchronise vers le backend distant
#[tauri::command]
pub async fn cloud_sync_push(
    state: State<'_, CloudSyncState>,
) -> Result<SyncResult, String> {
    let mut guard = state.engine.lock().map_err(|e| e.to_string())?;
    let engine = guard.as_mut().ok_or("Cloud Sync not initialized")?;

    engine.sync_to_remote().map_err(|e| e.to_string())
}

/// Synchronise depuis le backend distant
#[tauri::command]
pub async fn cloud_sync_pull(
    state: State<'_, CloudSyncState>,
) -> Result<SyncResult, String> {
    let mut guard = state.engine.lock().map_err(|e| e.to_string())?;
    let engine = guard.as_mut().ok_or("Cloud Sync not initialized")?;

    engine.sync_from_remote().map_err(|e| e.to_string())
}

/// Met à jour la configuration
#[tauri::command]
pub async fn cloud_update_config(
    state: State<'_, CloudSyncState>,
    backend: String,
    mode: String,
    conflict_resolution: String,
    sync_folder_path: Option<String>,
    s3_endpoint: Option<String>,
    s3_bucket: Option<String>,
    auto_sync_interval_secs: Option<u64>,
    limit_during_training: Option<bool>,
    limit_during_dev_mode: Option<bool>,
    compression_enabled: Option<bool>,
) -> Result<(), String> {
    let mut guard = state.engine.lock().map_err(|e| e.to_string())?;
    let engine = guard.as_mut().ok_or("Cloud Sync not initialized")?;

    let backend = match backend.as_str() {
        "local_folder" => SyncBackend::LocalFolder,
        "s3_private" => SyncBackend::S3Private,
        "p2p" => SyncBackend::P2P,
        _ => SyncBackend::LocalFolder,
    };

    let mode = match mode.as_str() {
        "manual" => SyncMode::Manual,
        "auto" => SyncMode::Auto,
        "disabled" => SyncMode::Disabled,
        _ => SyncMode::Manual,
    };

    let conflict_resolution = match conflict_resolution.as_str() {
        "last_write_wins" => ConflictResolution::LastWriteWins,
        "kevin_override" => ConflictResolution::KevinOverride,
        "strategic_merge" => ConflictResolution::StrategicMerge,
        _ => ConflictResolution::LastWriteWins,
    };

    let config = CloudSyncConfig {
        backend,
        mode,
        conflict_resolution,
        sync_folder_path: sync_folder_path.map(PathBuf::from),
        s3_endpoint,
        s3_bucket,
        auto_sync_interval_secs: auto_sync_interval_secs.unwrap_or(300),
        limit_during_training: limit_during_training.unwrap_or(true),
        limit_during_dev_mode: limit_during_dev_mode.unwrap_or(true),
        compression_enabled: compression_enabled.unwrap_or(true),
    };

    engine.update_config(config).map_err(|e| e.to_string())
}

/// Retourne la liste des appareils
#[tauri::command]
pub async fn cloud_get_devices(
    state: State<'_, CloudSyncState>,
) -> Result<DevicesResponse, String> {
    let guard = state.engine.lock().map_err(|e| e.to_string())?;
    let engine = guard.as_ref().ok_or("Cloud Sync not initialized")?;

    Ok(DevicesResponse {
        local_device: Some(engine.get_device_identity().clone()),
        known_devices: engine.get_known_devices().to_vec(),
    })
}

/// Retire un appareil de la liste
#[tauri::command]
pub async fn cloud_remove_device(
    state: State<'_, CloudSyncState>,
    device_id: String,
) -> Result<bool, String> {
    let mut guard = state.engine.lock().map_err(|e| e.to_string())?;
    let engine = guard.as_mut().ok_or("Cloud Sync not initialized")?;

    engine.remove_device(&device_id).map_err(|e| e.to_string())
}

/// Retourne l'historique de synchronisation
#[tauri::command]
pub async fn cloud_get_sync_history(
    state: State<'_, CloudSyncState>,
    limit: Option<usize>,
) -> Result<SyncHistoryResponse, String> {
    let guard = state.engine.lock().map_err(|e| e.to_string())?;
    let engine = guard.as_ref().ok_or("Cloud Sync not initialized")?;

    let history = engine.get_sync_history();
    let total_count = history.entries.len();

    let entries = if let Some(limit) = limit {
        history.entries.iter().rev().take(limit).cloned().collect()
    } else {
        history.entries.clone()
    };

    Ok(SyncHistoryResponse {
        entries,
        total_count,
    })
}

/// Met à jour une donnée dans le vault
#[tauri::command]
pub async fn cloud_update_vault_data(
    state: State<'_, CloudSyncState>,
    key: String,
    value: serde_json::Value,
) -> Result<(), String> {
    let mut guard = state.engine.lock().map_err(|e| e.to_string())?;
    let engine = guard.as_mut().ok_or("Cloud Sync not initialized")?;

    engine.update_vault_data(&key, value).map_err(|e| e.to_string())
}

/// Vérifie l'intégrité du vault
#[tauri::command]
pub async fn cloud_verify_integrity(
    state: State<'_, CloudSyncState>,
) -> Result<bool, String> {
    let guard = state.engine.lock().map_err(|e| e.to_string())?;
    let engine = guard.as_ref().ok_or("Cloud Sync not initialized")?;

    engine.verify_integrity().map_err(|e| e.to_string())
}

/// Crée une sauvegarde du vault
#[tauri::command]
pub async fn cloud_backup_vault(
    state: State<'_, CloudSyncState>,
) -> Result<String, String> {
    let guard = state.engine.lock().map_err(|e| e.to_string())?;
    let engine = guard.as_ref().ok_or("Cloud Sync not initialized")?;

    let backup_dir = get_cloud_data_path()?.join("backups");
    let backup_path = engine.backup_vault(&backup_dir).map_err(|e| e.to_string())?;

    Ok(backup_path.to_string_lossy().to_string())
}

/// Restaure le vault depuis une sauvegarde
#[tauri::command]
pub async fn cloud_restore_vault(
    state: State<'_, CloudSyncState>,
    backup_path: String,
) -> Result<(), String> {
    let mut guard = state.engine.lock().map_err(|e| e.to_string())?;
    let engine = guard.as_mut().ok_or("Cloud Sync not initialized")?;

    engine.restore_vault(&PathBuf::from(backup_path)).map_err(|e| e.to_string())
}

/// Auto-healing du vault : vérifie et répare si nécessaire
#[tauri::command]
pub async fn cloud_auto_heal(
    state: State<'_, CloudSyncState>,
) -> Result<CloudHealReport, String> {
    info!("[CloudSync] Starting auto-heal scan...");

    let guard = state.engine.lock().map_err(|e| e.to_string())?;
    let engine = guard.as_ref().ok_or("Cloud Sync not initialized")?;

    let mut report = CloudHealReport {
        vault_healthy: true,
        issues_found: vec![],
        actions_taken: vec![],
        backup_created: false,
        backup_path: None,
    };

    // Vérifier l'intégrité
    match engine.verify_integrity() {
        Ok(true) => {
            info!("[CloudSync] Vault integrity verified");
        }
        Ok(false) => {
            report.vault_healthy = false;
            report.issues_found.push("Vault integrity check failed".to_string());

            // Créer un backup avant réparation
            let backup_dir = get_cloud_data_path()?.join("backups");
            if let Ok(backup_path) = engine.backup_vault(&backup_dir) {
                report.backup_created = true;
                report.backup_path = Some(backup_path.to_string_lossy().to_string());
                report.actions_taken.push("Created backup before repair".to_string());
            }
        }
        Err(e) => {
            report.vault_healthy = false;
            report.issues_found.push(format!("Integrity check error: {}", e));
        }
    }

    info!("[CloudSync] Auto-heal complete: healthy={}", report.vault_healthy);
    Ok(report)
}

/// Liste les sauvegardes disponibles
#[tauri::command]
pub async fn cloud_list_backups() -> Result<Vec<BackupInfo>, String> {
    let backup_dir = get_cloud_data_path()?.join("backups");

    if !backup_dir.exists() {
        return Ok(vec![]);
    }

    let mut backups = vec![];

    if let Ok(entries) = std::fs::read_dir(&backup_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().map_or(false, |ext| ext == "vault") {
                if let Ok(metadata) = entry.metadata() {
                    let created = metadata.created()
                        .ok()
                        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                        .map(|d| d.as_secs())
                        .unwrap_or(0);

                    backups.push(BackupInfo {
                        path: path.to_string_lossy().to_string(),
                        filename: path.file_name()
                            .map(|n| n.to_string_lossy().to_string())
                            .unwrap_or_default(),
                        created_timestamp: created,
                        size_bytes: metadata.len(),
                    });
                }
            }
        }
    }

    backups.sort_by(|a, b| b.created_timestamp.cmp(&a.created_timestamp));
    Ok(backups)
}

/// Retourne le chemin des données cloud
fn get_cloud_data_path() -> Result<PathBuf, String> {
    let base_path = dirs::data_local_dir()
        .ok_or("Could not determine data directory")?
        .join("titane-infinity")
        .join("cloud");

    Ok(base_path)
}

/// Retourne toutes les commandes cloud pour l'enregistrement Tauri
pub fn get_cloud_commands() -> Vec<&'static str> {
    vec![
        "cloud_init",
        "cloud_load_vault",
        "cloud_create_vault",
        "cloud_get_status",
        "cloud_sync_push",
        "cloud_sync_pull",
        "cloud_update_config",
        "cloud_get_devices",
        "cloud_remove_device",
        "cloud_get_sync_history",
        "cloud_update_vault_data",
        "cloud_verify_integrity",
        "cloud_backup_vault",
        "cloud_restore_vault",
        "cloud_auto_heal",
        "cloud_list_backups",
    ]
}
