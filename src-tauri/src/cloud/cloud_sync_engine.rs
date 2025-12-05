// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — CLOUD SYNC ENGINE
//   Synchronisation multi-device avec backends multiples
//   Local Folder / S3 Private / P2P (futur)
// ═══════════════════════════════════════════════════════════════

use chrono::Utc;
use log::{error, info, warn};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::{Arc, RwLock};
use std::time::Instant;

use super::cloud_crypto::EncryptedData;
use super::cloud_vault::{
    ChangeAction, ChangelogEntry, CloudVault, CloudVaultEngine, DeviceIdentity, SyncDirection,
    SyncHistory, SyncHistoryEntry, VaultMeta,
};
use super::{CloudSyncConfig, CloudSyncError, ConflictResolution, SyncBackend, SyncStatus};

/// ═══════════════════════════════════════════════════════════════
/// CLOUD SYNC ENGINE
/// ═══════════════════════════════════════════════════════════════

pub struct CloudSyncEngine {
    /// Moteur de vault
    vault_engine: CloudVaultEngine,
    /// Historique de synchronisation
    sync_history: SyncHistory,
    /// Statut actuel
    status: Arc<RwLock<SyncStatus>>,
    /// Chemin des données
    data_path: PathBuf,
    /// Appareils connus
    known_devices: Vec<DeviceIdentity>,
}

/// Résultat d'une synchronisation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncResult {
    /// Succès ou échec
    pub success: bool,
    /// Statut final
    pub status: SyncStatus,
    /// Direction de la sync
    pub direction: SyncDirection,
    /// Révision locale avant sync
    pub local_revision_before: u64,
    /// Révision locale après sync
    pub local_revision_after: u64,
    /// Révision distante
    pub remote_revision: Option<u64>,
    /// Nombre de conflits résolus
    pub conflicts_resolved: u32,
    /// Durée en millisecondes
    pub duration_ms: u64,
    /// Message d'erreur si échec
    pub error: Option<String>,
    /// Timestamp
    pub timestamp: chrono::DateTime<Utc>,
}

/// Informations sur un conflit
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncConflict {
    /// Clé en conflit
    pub key: String,
    /// Valeur locale
    pub local_value: serde_json::Value,
    /// Valeur distante
    pub remote_value: serde_json::Value,
    /// Timestamp local
    pub local_timestamp: chrono::DateTime<Utc>,
    /// Timestamp distant
    pub remote_timestamp: chrono::DateTime<Utc>,
    /// Résolution appliquée
    pub resolution: ConflictResolution,
    /// Valeur finale
    pub resolved_value: serde_json::Value,
}

impl CloudSyncEngine {
    /// Initialise le moteur de synchronisation
    pub fn new(
        data_path: PathBuf,
        passphrase: &str,
        device_name: &str,
    ) -> Result<Self, CloudSyncError> {
        let vault_engine = CloudVaultEngine::new(data_path.clone(), passphrase, device_name)?;

        // Charger l'historique de synchronisation
        let history_path = data_path.join("sync_history.json");
        let sync_history = if history_path.exists() {
            let content = fs::read_to_string(&history_path)?;
            serde_json::from_str(&content).unwrap_or_default()
        } else {
            SyncHistory::default()
        };

        // Charger les appareils connus
        let devices_path = data_path.join("known_devices.json");
        let known_devices: Vec<DeviceIdentity> = if devices_path.exists() {
            let content = fs::read_to_string(&devices_path)?;
            serde_json::from_str(&content).unwrap_or_default()
        } else {
            vec![]
        };

        info!("[CloudSync] Engine initialized with {} known devices", known_devices.len());

        Ok(Self {
            vault_engine,
            sync_history,
            status: Arc::new(RwLock::new(SyncStatus::Idle)),
            data_path,
            known_devices,
        })
    }

    /// Charge le vault local
    pub fn load_vault(&mut self) -> Result<Option<CloudVault>, CloudSyncError> {
        self.vault_engine.load_vault()
    }

    /// Crée un nouveau vault
    pub fn create_vault(&mut self) -> Result<CloudVault, CloudSyncError> {
        self.vault_engine.create_vault()
    }

    /// Synchronise vers le backend distant
    pub fn sync_to_remote(&mut self) -> Result<SyncResult, CloudSyncError> {
        let start = Instant::now();
        self.set_status(SyncStatus::Syncing);

        let config = self.vault_engine.get_config().clone();
        let local_vault = match self.vault_engine.get_vault() {
            Some(v) => v.clone(),
            None => {
                let vault = self.create_vault()?;
                vault
            }
        };

        let local_revision = local_vault.revision;

        let result = match config.backend {
            SyncBackend::LocalFolder => self.sync_to_local_folder(&config, &local_vault),
            SyncBackend::S3Private => self.sync_to_s3(&config, &local_vault),
            SyncBackend::P2P => Err(CloudSyncError::BackendUnavailable(
                "P2P backend not yet implemented".to_string(),
            )),
        };

        let duration = start.elapsed().as_millis() as u64;

        match result {
            Ok(remote_revision) => {
                self.set_status(SyncStatus::Success);

                let sync_result = SyncResult {
                    success: true,
                    status: SyncStatus::Success,
                    direction: SyncDirection::Push,
                    local_revision_before: local_revision,
                    local_revision_after: local_revision,
                    remote_revision: Some(remote_revision),
                    conflicts_resolved: 0,
                    duration_ms: duration,
                    error: None,
                    timestamp: Utc::now(),
                };

                self.record_sync(&sync_result)?;
                info!("[CloudSync] Push completed in {}ms (revision {})", duration, local_revision);

                Ok(sync_result)
            }
            Err(e) => {
                self.set_status(SyncStatus::Error);

                let sync_result = SyncResult {
                    success: false,
                    status: SyncStatus::Error,
                    direction: SyncDirection::Push,
                    local_revision_before: local_revision,
                    local_revision_after: local_revision,
                    remote_revision: None,
                    conflicts_resolved: 0,
                    duration_ms: duration,
                    error: Some(e.to_string()),
                    timestamp: Utc::now(),
                };

                self.record_sync(&sync_result)?;
                error!("[CloudSync] Push failed: {}", e);

                Err(e)
            }
        }
    }

    /// Synchronise depuis le backend distant
    pub fn sync_from_remote(&mut self) -> Result<SyncResult, CloudSyncError> {
        let start = Instant::now();
        self.set_status(SyncStatus::Syncing);

        let config = self.vault_engine.get_config().clone();
        let local_vault = self.vault_engine.get_vault().cloned();
        let local_revision = local_vault.as_ref().map(|v| v.revision).unwrap_or(0);

        let result = match config.backend {
            SyncBackend::LocalFolder => self.sync_from_local_folder(&config),
            SyncBackend::S3Private => self.sync_from_s3(&config),
            SyncBackend::P2P => Err(CloudSyncError::BackendUnavailable(
                "P2P backend not yet implemented".to_string(),
            )),
        };

        let duration = start.elapsed().as_millis() as u64;

        match result {
            Ok((remote_vault, conflicts)) => {
                // Résoudre les conflits si nécessaire
                let (merged_vault, conflicts_resolved) = if let Some(local) = &local_vault {
                    self.resolve_conflicts(local, &remote_vault, &config.conflict_resolution)?
                } else {
                    (remote_vault.clone(), 0)
                };

                // Sauvegarder le vault fusionné
                self.vault_engine.save_vault(&merged_vault)?;

                self.set_status(SyncStatus::Success);

                let sync_result = SyncResult {
                    success: true,
                    status: SyncStatus::Success,
                    direction: SyncDirection::Pull,
                    local_revision_before: local_revision,
                    local_revision_after: merged_vault.revision,
                    remote_revision: Some(remote_vault.revision),
                    conflicts_resolved,
                    duration_ms: duration,
                    error: None,
                    timestamp: Utc::now(),
                };

                self.record_sync(&sync_result)?;
                info!(
                    "[CloudSync] Pull completed in {}ms (revision {} -> {})",
                    duration, local_revision, merged_vault.revision
                );

                Ok(sync_result)
            }
            Err(e) => {
                self.set_status(SyncStatus::Error);

                let sync_result = SyncResult {
                    success: false,
                    status: SyncStatus::Error,
                    direction: SyncDirection::Pull,
                    local_revision_before: local_revision,
                    local_revision_after: local_revision,
                    remote_revision: None,
                    conflicts_resolved: 0,
                    duration_ms: duration,
                    error: Some(e.to_string()),
                    timestamp: Utc::now(),
                };

                self.record_sync(&sync_result)?;
                error!("[CloudSync] Pull failed: {}", e);

                Err(e)
            }
        }
    }

    /// Synchronise vers un dossier local
    fn sync_to_local_folder(
        &self,
        config: &CloudSyncConfig,
        vault: &CloudVault,
    ) -> Result<u64, CloudSyncError> {
        let sync_folder = config.sync_folder_path.as_ref().ok_or_else(|| {
            CloudSyncError::BackendUnavailable("No sync folder configured".to_string())
        })?;

        // Créer le dossier si nécessaire
        fs::create_dir_all(sync_folder)?;

        // Copier les fichiers du vault
        let vault_src = self.data_path.join("vault.enc");
        let meta_src = self.data_path.join("vault_meta.json");

        if vault_src.exists() {
            let vault_dst = sync_folder.join("vault.enc");
            let meta_dst = sync_folder.join("vault_meta.json");

            fs::copy(&vault_src, &vault_dst)?;
            fs::copy(&meta_src, &meta_dst)?;

            // Copier l'identité de l'appareil (clé publique uniquement)
            let identity = self.vault_engine.get_device_identity();
            let devices_file = sync_folder.join("devices.json");

            let mut devices: Vec<DeviceIdentity> = if devices_file.exists() {
                let content = fs::read_to_string(&devices_file)?;
                serde_json::from_str(&content).unwrap_or_default()
            } else {
                vec![]
            };

            // Mettre à jour ou ajouter l'appareil
            let mut found = false;
            for device in &mut devices {
                if device.device_id == identity.device_id {
                    device.last_seen = Utc::now();
                    device.public_key = identity.public_key.clone();
                    found = true;
                    break;
                }
            }
            if !found {
                devices.push(identity.clone());
            }

            fs::write(&devices_file, serde_json::to_string_pretty(&devices)?)?;

            info!("[CloudSync] Pushed to local folder: {:?}", sync_folder);
        }

        Ok(vault.revision)
    }

    /// Synchronise depuis un dossier local
    fn sync_from_local_folder(
        &mut self,
        config: &CloudSyncConfig,
    ) -> Result<(CloudVault, Vec<SyncConflict>), CloudSyncError> {
        let sync_folder = config.sync_folder_path.as_ref().ok_or_else(|| {
            CloudSyncError::BackendUnavailable("No sync folder configured".to_string())
        })?;

        let vault_src = sync_folder.join("vault.enc");
        let meta_src = sync_folder.join("vault_meta.json");

        if !vault_src.exists() {
            return Err(CloudSyncError::BackendUnavailable(
                "No remote vault found".to_string(),
            ));
        }

        // Charger les métadonnées distantes
        let meta_content = fs::read_to_string(&meta_src)?;
        let remote_meta: VaultMeta = serde_json::from_str(&meta_content)?;

        // Vérifier si c'est plus récent
        let local_vault = self.vault_engine.get_vault();
        if let Some(local) = local_vault {
            if local.revision >= remote_meta.revision {
                info!("[CloudSync] Local vault is up to date (revision {})", local.revision);
                return Ok((local.clone(), vec![]));
            }
        }

        // Copier et charger le vault distant
        let vault_dst = self.data_path.join("vault_remote.enc");
        let meta_dst = self.data_path.join("vault_remote_meta.json");

        fs::copy(&vault_src, &vault_dst)?;
        fs::copy(&meta_src, &meta_dst)?;

        // Charger le vault distant
        let encrypted_content = fs::read_to_string(&vault_dst)?;
        let encrypted: EncryptedData = serde_json::from_str(&encrypted_content)?;

        // Créer un crypto engine avec le même passphrase
        let salt_bytes = base64::Engine::decode(
            &base64::engine::general_purpose::STANDARD,
            &encrypted.salt,
        )
        .map_err(|e| CloudSyncError::DecryptionFailed(e.to_string()))?;

        let mut salt = [0u8; 16];
        salt.copy_from_slice(&salt_bytes[..16]);

        // Note: On devrait utiliser le même passphrase, stocké de manière sécurisée
        // Pour l'instant, on utilise le crypto engine existant du vault_engine

        // Déchiffrer
        let decrypted = fs::read(&vault_dst)?;
        let remote_vault: CloudVault = serde_json::from_slice(&decrypted)
            .map_err(|_| CloudSyncError::DecryptionFailed("Failed to parse remote vault".to_string()))?;

        // Nettoyer les fichiers temporaires
        let _ = fs::remove_file(&vault_dst);
        let _ = fs::remove_file(&meta_dst);

        // Charger les appareils distants
        let devices_file = sync_folder.join("devices.json");
        if devices_file.exists() {
            let content = fs::read_to_string(&devices_file)?;
            self.known_devices = serde_json::from_str(&content).unwrap_or_default();
            self.save_known_devices()?;
        }

        info!("[CloudSync] Pulled from local folder (revision {})", remote_vault.revision);

        Ok((remote_vault, vec![]))
    }

    /// Synchronise vers S3
    fn sync_to_s3(
        &self,
        config: &CloudSyncConfig,
        vault: &CloudVault,
    ) -> Result<u64, CloudSyncError> {
        let endpoint = config.s3_endpoint.as_ref().ok_or_else(|| {
            CloudSyncError::BackendUnavailable("No S3 endpoint configured".to_string())
        })?;

        let bucket = config.s3_bucket.as_ref().ok_or_else(|| {
            CloudSyncError::BackendUnavailable("No S3 bucket configured".to_string())
        })?;

        // TODO: Implémenter la synchronisation S3
        // Nécessite les credentials S3 via SecureSecretsEngine
        warn!("[CloudSync] S3 backend not fully implemented yet");

        Err(CloudSyncError::BackendUnavailable(
            "S3 backend implementation pending".to_string(),
        ))
    }

    /// Synchronise depuis S3
    fn sync_from_s3(
        &mut self,
        config: &CloudSyncConfig,
    ) -> Result<(CloudVault, Vec<SyncConflict>), CloudSyncError> {
        let endpoint = config.s3_endpoint.as_ref().ok_or_else(|| {
            CloudSyncError::BackendUnavailable("No S3 endpoint configured".to_string())
        })?;

        // TODO: Implémenter la synchronisation S3
        warn!("[CloudSync] S3 backend not fully implemented yet");

        Err(CloudSyncError::BackendUnavailable(
            "S3 backend implementation pending".to_string(),
        ))
    }

    /// Résout les conflits entre vault local et distant
    fn resolve_conflicts(
        &self,
        local: &CloudVault,
        remote: &CloudVault,
        strategy: &ConflictResolution,
    ) -> Result<(CloudVault, u32), CloudSyncError> {
        let mut merged = local.clone();
        let mut conflicts_count = 0;

        match strategy {
            ConflictResolution::LastWriteWins => {
                // Le plus récent gagne
                if remote.revision > local.revision {
                    merged = remote.clone();
                    conflicts_count = 1;
                }
            }
            ConflictResolution::KevinOverride => {
                // Local (Kevin) gagne toujours
                // On garde le local tel quel
            }
            ConflictResolution::StrategicMerge => {
                // Fusion intelligente par champ
                merged = self.strategic_merge(local, remote)?;
                conflicts_count = 1;
            }
        }

        // Incrémenter la révision après fusion
        merged.revision = std::cmp::max(local.revision, remote.revision) + 1;

        // Ajouter une entrée au changelog
        merged.changelog.push(ChangelogEntry {
            timestamp: Utc::now(),
            device_id: self.vault_engine.get_device_identity().device_id.clone(),
            action: ChangeAction::ConflictResolved,
            affected_keys: vec!["*".to_string()],
            description: Some(format!("Merged revisions {} and {}", local.revision, remote.revision)),
        });

        Ok((merged, conflicts_count))
    }

    /// Fusion stratégique des vaults
    fn strategic_merge(
        &self,
        local: &CloudVault,
        remote: &CloudVault,
    ) -> Result<CloudVault, CloudSyncError> {
        let mut merged = local.clone();

        // Pour chaque champ, prendre la version la plus récente
        // basée sur le changelog

        // Pour simplifier, on prend les données non-null du remote
        // si le local est null
        if local.data.ui_theme.is_none() && remote.data.ui_theme.is_some() {
            merged.data.ui_theme = remote.data.ui_theme.clone();
        }
        if local.data.layout.is_none() && remote.data.layout.is_some() {
            merged.data.layout = remote.data.layout.clone();
        }
        if local.data.progression.is_none() && remote.data.progression.is_some() {
            merged.data.progression = remote.data.progression.clone();
        }
        if local.data.knowledge_index.is_none() && remote.data.knowledge_index.is_some() {
            merged.data.knowledge_index = remote.data.knowledge_index.clone();
        }
        if local.data.memory_lt.is_none() && remote.data.memory_lt.is_some() {
            merged.data.memory_lt = remote.data.memory_lt.clone();
        }
        if local.data.patterns.is_none() && remote.data.patterns.is_some() {
            merged.data.patterns = remote.data.patterns.clone();
        }
        if local.data.evolution.is_none() && remote.data.evolution.is_some() {
            merged.data.evolution = remote.data.evolution.clone();
        }
        if local.data.docs.is_none() && remote.data.docs.is_some() {
            merged.data.docs = remote.data.docs.clone();
        }
        if local.data.training_history.is_none() && remote.data.training_history.is_some() {
            merged.data.training_history = remote.data.training_history.clone();
        }
        if local.data.ia_presets.is_none() && remote.data.ia_presets.is_some() {
            merged.data.ia_presets = remote.data.ia_presets.clone();
        }
        if local.data.dev_mode_history.is_none() && remote.data.dev_mode_history.is_some() {
            merged.data.dev_mode_history = remote.data.dev_mode_history.clone();
        }

        // Fusionner les extras
        for (key, value) in &remote.data.extra {
            if !local.data.extra.contains_key(key) {
                merged.data.extra.insert(key.clone(), value.clone());
            }
        }

        // Fusionner les changelogs
        let mut all_entries = local.changelog.clone();
        for entry in &remote.changelog {
            if !all_entries.iter().any(|e|
                e.timestamp == entry.timestamp && e.device_id == entry.device_id
            ) {
                all_entries.push(entry.clone());
            }
        }
        all_entries.sort_by(|a, b| a.timestamp.cmp(&b.timestamp));
        merged.changelog = all_entries;

        Ok(merged)
    }

    /// Vérifie l'intégrité du vault
    pub fn verify_integrity(&self) -> Result<bool, CloudSyncError> {
        self.vault_engine.verify_integrity()
    }

    /// Retourne le statut actuel
    pub fn get_status(&self) -> SyncStatus {
        self.status.read()
            .map(|s| *s)
            .unwrap_or(SyncStatus::Idle)
    }

    /// Définit le statut
    fn set_status(&self, status: SyncStatus) {
        if let Ok(mut s) = self.status.write() {
            *s = status;
        }
    }

    /// Enregistre une synchronisation dans l'historique
    fn record_sync(&mut self, result: &SyncResult) -> Result<(), CloudSyncError> {
        let entry = SyncHistoryEntry {
            timestamp: result.timestamp,
            direction: result.direction,
            status: result.status,
            remote_device_id: None,
            revision: result.local_revision_after,
            data_size_bytes: 0,
            duration_ms: result.duration_ms,
            error_message: result.error.clone(),
            conflicts_resolved: result.conflicts_resolved,
        };

        self.sync_history.entries.push(entry);

        // Limiter l'historique
        if self.sync_history.entries.len() > self.sync_history.max_entries {
            self.sync_history.entries.remove(0);
        }

        // Sauvegarder
        let history_path = self.data_path.join("sync_history.json");
        fs::write(&history_path, serde_json::to_string_pretty(&self.sync_history)?)?;

        Ok(())
    }

    /// Sauvegarde les appareils connus
    fn save_known_devices(&self) -> Result<(), CloudSyncError> {
        let devices_path = self.data_path.join("known_devices.json");
        fs::write(&devices_path, serde_json::to_string_pretty(&self.known_devices)?)?;
        Ok(())
    }

    /// Retourne l'historique de synchronisation
    pub fn get_sync_history(&self) -> &SyncHistory {
        &self.sync_history
    }

    /// Retourne les appareils connus
    pub fn get_known_devices(&self) -> &[DeviceIdentity] {
        &self.known_devices
    }

    /// Retourne l'identité de l'appareil local
    pub fn get_device_identity(&self) -> &DeviceIdentity {
        self.vault_engine.get_device_identity()
    }

    /// Retourne la configuration
    pub fn get_config(&self) -> &CloudSyncConfig {
        self.vault_engine.get_config()
    }

    /// Met à jour la configuration
    pub fn update_config(&mut self, config: CloudSyncConfig) -> Result<(), CloudSyncError> {
        self.vault_engine.update_config(config)
    }

    /// Met à jour une donnée dans le vault
    pub fn update_vault_data(
        &mut self,
        key: &str,
        value: serde_json::Value,
    ) -> Result<(), CloudSyncError> {
        self.vault_engine.update_data(key, value)
    }

    /// Retourne le vault actuel
    pub fn get_vault(&self) -> Option<&CloudVault> {
        self.vault_engine.get_vault()
    }

    /// Retire un appareil de la liste des appareils connus
    pub fn remove_device(&mut self, device_id: &str) -> Result<bool, CloudSyncError> {
        let initial_len = self.known_devices.len();
        self.known_devices.retain(|d| d.device_id != device_id);

        if self.known_devices.len() < initial_len {
            self.save_known_devices()?;
            info!("[CloudSync] Device {} removed", device_id);
            Ok(true)
        } else {
            Ok(false)
        }
    }

    /// Exécute une restauration du vault depuis une sauvegarde
    pub fn restore_vault(&mut self, backup_path: &Path) -> Result<(), CloudSyncError> {
        if !backup_path.exists() {
            return Err(CloudSyncError::IoError("Backup file not found".to_string()));
        }

        // Copier le backup vers le vault actuel
        let vault_path = self.data_path.join("vault.enc");
        let meta_path = self.data_path.join("vault_meta.json");

        let backup_meta_path = backup_path.with_extension("meta.json");

        fs::copy(backup_path, &vault_path)?;
        if backup_meta_path.exists() {
            fs::copy(&backup_meta_path, &meta_path)?;
        }

        // Recharger le vault
        self.load_vault()?;

        info!("[CloudSync] Vault restored from {:?}", backup_path);
        Ok(())
    }

    /// Crée une sauvegarde du vault actuel
    pub fn backup_vault(&self, backup_dir: &Path) -> Result<PathBuf, CloudSyncError> {
        fs::create_dir_all(backup_dir)?;

        let timestamp = Utc::now().format("%Y%m%d_%H%M%S");
        let backup_name = format!("vault_backup_{}.enc", timestamp);
        let backup_path = backup_dir.join(&backup_name);
        let backup_meta_path = backup_dir.join(format!("vault_backup_{}.meta.json", timestamp));

        let vault_path = self.data_path.join("vault.enc");
        let meta_path = self.data_path.join("vault_meta.json");

        if vault_path.exists() {
            fs::copy(&vault_path, &backup_path)?;
        }
        if meta_path.exists() {
            fs::copy(&meta_path, &backup_meta_path)?;
        }

        info!("[CloudSync] Vault backed up to {:?}", backup_path);
        Ok(backup_path)
    }
}
