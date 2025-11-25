// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   BACKUP ENGINE — Super-Prompt N
//   Backups automatiques avec redondance triple layer
// ═══════════════════════════════════════════════════════════════

use super::snapshot::SnapshotContext;
use super::travel_engine::TravelEngine;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::RwLock;
use tokio::time::{Duration, interval};

/// Fréquences de backup
const QUICK_BACKUP_INTERVAL: Duration = Duration::from_secs(5 * 60); // 5 min
const STABLE_BACKUP_INTERVAL: Duration = Duration::from_secs(60 * 60); // 1h
const DEEP_BACKUP_INTERVAL: Duration = Duration::from_secs(24 * 60 * 60); // 24h

/// Types de backup
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BackupType {
    Quick,    // 5 min - léger
    Stable,   // 1h - complet
    Deep,     // 24h - snapshot permanent
    Forced,   // Manuel/migration
}

/// Erreurs backup
#[derive(Debug, Clone)]
pub enum BackupError {
    TravelEngineError(String),
    DataCollectionFailed(String),
    IoError(String),
}

impl std::fmt::Display for BackupError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            BackupError::TravelEngineError(e) => write!(f, "TravelEngine error: {}", e),
            BackupError::DataCollectionFailed(e) => write!(f, "Data collection failed: {}", e),
            BackupError::IoError(e) => write!(f, "IO error: {}", e),
        }
    }
}

impl std::error::Error for BackupError {}

/// Configuration backup
#[derive(Debug, Clone)]
pub struct BackupConfig {
    pub quick_enabled: bool,
    pub stable_enabled: bool,
    pub deep_enabled: bool,
    pub max_quick_backups: usize,
    pub max_stable_backups: usize,
    pub max_deep_backups: usize,
}

impl Default for BackupConfig {
    fn default() -> Self {
        Self {
            quick_enabled: true,
            stable_enabled: true,
            deep_enabled: true,
            max_quick_backups: 12,    // 12 * 5min = 1h
            max_stable_backups: 24,   // 24 * 1h = 1 jour
            max_deep_backups: 30,     // 30 jours
        }
    }
}

/// Moteur de backup automatique
pub struct BackupEngine {
    travel_engine: Arc<TravelEngine>,
    config: Arc<RwLock<BackupConfig>>,
    running: Arc<RwLock<bool>>,
    last_quick: Arc<RwLock<u64>>,
    last_stable: Arc<RwLock<u64>>,
    last_deep: Arc<RwLock<u64>>,
}

impl BackupEngine {
    /// Créer nouveau moteur
    pub fn new(travel_engine: Arc<TravelEngine>, config: BackupConfig) -> Self {
        Self {
            travel_engine,
            config: Arc::new(RwLock::new(config)),
            running: Arc::new(RwLock::new(false)),
            last_quick: Arc::new(RwLock::new(0)),
            last_stable: Arc::new(RwLock::new(0)),
            last_deep: Arc::new(RwLock::new(0)),
        }
    }

    /// Démarrer backups automatiques
    pub async fn start(&self) {
        let mut running = self.running.write().await;
        if *running {
            log::warn!("BackupEngine already running");
            return;
        }
        *running = true;
        drop(running);

        log::info!("🔄 BackupEngine started");

        // Lancer tasks de backup
        self.spawn_quick_backup_task();
        self.spawn_stable_backup_task();
        self.spawn_deep_backup_task();
    }

    /// Arrêter backups
    pub async fn stop(&self) {
        let mut running = self.running.write().await;
        *running = false;
        log::info!("⏸️ BackupEngine stopped");
    }

    /// Backup manuel forcé
    pub async fn force_backup(
        &self,
        data: Vec<u8>,
        context: SnapshotContext,
        reason: &str,
    ) -> Result<String, BackupError> {
        log::info!("🔒 Forced backup: {}", reason);

        let description = format!("Forced: {}", reason);
        self.travel_engine
            .create_snapshot(data, context, description)
            .await
            .map_err(|e| BackupError::TravelEngineError(e.to_string()))
    }

    /// Effectuer backup
    async fn perform_backup(
        &self,
        backup_type: BackupType,
    ) -> Result<String, BackupError> {
        let running = self.running.read().await;
        if !*running {
            return Err(BackupError::DataCollectionFailed("Engine stopped".to_string()));
        }
        drop(running);

        // Collecter données système
        let data = self.collect_system_data().await?;
        let context = self.collect_context().await?;

        let description = format!("{:?} backup", backup_type);

        // Créer snapshot
        let id = self.travel_engine
            .create_snapshot(data, context, description)
            .await
            .map_err(|e| BackupError::TravelEngineError(e.to_string()))?;

        // Mettre à jour timestamp
        let now = Self::now();
        match backup_type {
            BackupType::Quick => *self.last_quick.write().await = now,
            BackupType::Stable => *self.last_stable.write().await = now,
            BackupType::Deep => *self.last_deep.write().await = now,
            BackupType::Forced => {}
        }

        // Nettoyer vieux backups
        self.cleanup_old_backups(backup_type).await?;

        Ok(id)
    }

    /// Collecter données système
    async fn collect_system_data(&self) -> Result<Vec<u8>, BackupError> {
        // TODO: Intégrer avec SingularityState
        // Pour l'instant, données mockées
        let data = serde_json::json!({
            "version": env!("CARGO_PKG_VERSION"),
            "timestamp": Self::now(),
            "placeholder": "Integration with SingularityState pending"
        });

        serde_json::to_vec(&data)
            .map_err(|e| BackupError::DataCollectionFailed(e.to_string()))
    }

    /// Collecter contexte
    async fn collect_context(&self) -> Result<SnapshotContext, BackupError> {
        // TODO: Intégrer avec XP Engine et moteurs
        Ok(SnapshotContext {
            xp_total: 0,
            level: 1,
            memory_files: 0,
            active_engines: vec!["Helios".to_string(), "Memory".to_string()],
            design_system: "v∞".to_string(),
            persona_mood: "stable".to_string(),
        })
    }

    /// Nettoyer vieux backups
    async fn cleanup_old_backups(&self, backup_type: BackupType) -> Result<(), BackupError> {
        let config = self.config.read().await;
        let max_count = match backup_type {
            BackupType::Quick => config.max_quick_backups,
            BackupType::Stable => config.max_stable_backups,
            BackupType::Deep => config.max_deep_backups,
            BackupType::Forced => return Ok(()), // Ne pas nettoyer les forced
        };
        drop(config);

        let snapshots = self.travel_engine.list_snapshots().await;

        // Filtrer par type de backup dans la description
        let type_str = format!("{:?}", backup_type);
        let mut typed_snapshots: Vec<_> = snapshots
            .into_iter()
            .filter(|s| s.description.contains(&type_str))
            .collect();

        // Trier par timestamp décroissant
        typed_snapshots.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

        // Supprimer excédent
        if typed_snapshots.len() > max_count {
            for snapshot in typed_snapshots.iter().skip(max_count) {
                log::debug!("🗑️ Cleaning old {:?} backup: {}", backup_type, snapshot.id);
                self.travel_engine
                    .delete_snapshot(&snapshot.id)
                    .await
                    .map_err(|e| BackupError::TravelEngineError(e.to_string()))?;
            }
        }

        Ok(())
    }

    /// Spawner task quick backup
    fn spawn_quick_backup_task(&self) {
        let engine = Arc::new(self.clone_arc_fields());

        tokio::spawn(async move {
            let mut ticker = interval(QUICK_BACKUP_INTERVAL);

            loop {
                ticker.tick().await;

                let running = engine.running.read().await;
                if !*running {
                    break;
                }
                drop(running);

                let config = engine.config.read().await;
                if !config.quick_enabled {
                    drop(config);
                    continue;
                }
                drop(config);

                match engine.perform_backup(BackupType::Quick).await {
                    Ok(id) => log::debug!("✅ Quick backup: {}", id),
                    Err(e) => log::error!("❌ Quick backup failed: {}", e),
                }
            }
        });
    }

    /// Spawner task stable backup
    fn spawn_stable_backup_task(&self) {
        let engine = Arc::new(self.clone_arc_fields());

        tokio::spawn(async move {
            let mut ticker = interval(STABLE_BACKUP_INTERVAL);

            loop {
                ticker.tick().await;

                let running = engine.running.read().await;
                if !*running {
                    break;
                }
                drop(running);

                let config = engine.config.read().await;
                if !config.stable_enabled {
                    drop(config);
                    continue;
                }
                drop(config);

                match engine.perform_backup(BackupType::Stable).await {
                    Ok(id) => log::info!("✅ Stable backup: {}", id),
                    Err(e) => log::error!("❌ Stable backup failed: {}", e),
                }
            }
        });
    }

    /// Spawner task deep backup
    fn spawn_deep_backup_task(&self) {
        let engine = Arc::new(self.clone_arc_fields());

        tokio::spawn(async move {
            let mut ticker = interval(DEEP_BACKUP_INTERVAL);

            loop {
                ticker.tick().await;

                let running = engine.running.read().await;
                if !*running {
                    break;
                }
                drop(running);

                let config = engine.config.read().await;
                if !config.deep_enabled {
                    drop(config);
                    continue;
                }
                drop(config);

                match engine.perform_backup(BackupType::Deep).await {
                    Ok(id) => log::info!("✅ Deep backup + snapshot: {}", id),
                    Err(e) => log::error!("❌ Deep backup failed: {}", e),
                }
            }
        });
    }

    /// Cloner champs Arc pour spawn
    fn clone_arc_fields(&self) -> Self {
        Self {
            travel_engine: Arc::clone(&self.travel_engine),
            config: Arc::clone(&self.config),
            running: Arc::clone(&self.running),
            last_quick: Arc::clone(&self.last_quick),
            last_stable: Arc::clone(&self.last_stable),
            last_deep: Arc::clone(&self.last_deep),
        }
    }

    /// Obtenir timestamp actuel
    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or(0)
    }

    /// Statistiques backup
    pub async fn stats(&self) -> BackupStats {
        BackupStats {
            last_quick: *self.last_quick.read().await,
            last_stable: *self.last_stable.read().await,
            last_deep: *self.last_deep.read().await,
            running: *self.running.read().await,
        }
    }
}

/// Statistiques backup
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct BackupStats {
    pub last_quick: u64,
    pub last_stable: u64,
    pub last_deep: u64,
    pub running: bool,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::security::encryption::{MasterKey, SigningKeypair};

    #[tokio::test]
    async fn test_backup_engine() {
        let master_key = MasterKey::generate();
        let keypair = SigningKeypair::generate();
        let travel = Arc::new(TravelEngine::new(&master_key, keypair).await.unwrap());

        let config = BackupConfig {
            quick_enabled: false,
            stable_enabled: false,
            deep_enabled: false,
            ..Default::default()
        };

        let engine = BackupEngine::new(travel, config);

        // Test forced backup
        let context = SnapshotContext {
            xp_total: 1000,
            level: 3,
            memory_files: 10,
            active_engines: vec!["Test".to_string()],
            design_system: "v∞".to_string(),
            persona_mood: "test".to_string(),
        };

        let data = b"Test backup".to_vec();
        let id = engine.force_backup(data, context, "unit test").await.unwrap();
        assert!(!id.is_empty());
    }
}
