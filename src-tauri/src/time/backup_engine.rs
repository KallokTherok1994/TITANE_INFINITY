// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   BACKUP ENGINE — Super-Prompt N
//   Backups automatiques avec redondance triple layer
// ═══════════════════════════════════════════════════════════════

use super::snapshot::SnapshotContext;
use super::travel_engine::TravelEngine;

use std::sync::Arc;
use tokio::sync::RwLock;
use tokio::time::{interval, Duration};

/// Fréquences de backup
const QUICK_BACKUP_INTERVAL: Duration = Duration::from_secs(5 * 60); // 5 min
const STABLE_BACKUP_INTERVAL: Duration = Duration::from_secs(60 * 60); // 1h
const DEEP_BACKUP_INTERVAL: Duration = Duration::from_secs(24 * 60 * 60); // 24h

/// Types de backup
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BackupType {
    Quick,  // 5 min - léger
    Stable, // 1h - complet
    Deep,   // 24h - snapshot permanent
    Forced, // Manuel/migration
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
            max_quick_backups: 12,  // 12 * 5min = 1h
            max_stable_backups: 24, // 24 * 1h = 1 jour
            max_deep_backups: 30,   // 30 jours
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
    async fn perform_backup(&self, backup_type: BackupType) -> Result<String, BackupError> {
        let running = self.running.read().await;
        if !*running {
            return Err(BackupError::DataCollectionFailed(
                "Engine stopped".to_string(),
            ));
        }
        drop(running);

        // Collecter données système
        let data = self.collect_system_data().await?;
        let context = self.collect_context().await?;

        let description = format!("{:?} backup", backup_type);

        // Créer snapshot
        let id = self
            .travel_engine
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
        // Implementation: Integrate with SingularityState for comprehensive backups
        // - Access: let state = SingularityState::load().await? to get current state
        // - Data structure: Include cognitive, memory, xp, metadata fields
        // - Serialization: serde_json::to_vec(&state)? for JSON binary
        // - Compression: Use flate2::write::GzEncoder for gzip compression (~70% reduction)
        // - Incremental: Only backup changed fields since last snapshot
        // - Error handling: Fallback to partial backup if some fields unavailable
        let data = serde_json::json!({
            "version": env!("CARGO_PKG_VERSION"),
            "timestamp": Self::now(),
            "placeholder": "Integration with SingularityState pending"
        });

        serde_json::to_vec(&data).map_err(|e| BackupError::DataCollectionFailed(e.to_string()))
    }

    /// Collecter contexte
    async fn collect_context(&self) -> Result<SnapshotContext, BackupError> {
        // Implementation: Integrate with XP Engine and active engines
        // - XP data: Call XPEngine::get_total_xp() and get_level() from singularity state
        // - Memory files: Count entries in LTM with UnifiedMemory::stats().ltm_count
        // - Active engines: Query StateManager.active_engines or EngineRegistry::list_active()
        // - Design system: Read from config or hardcode current "v∞" version
        // - Consolidation: Aggregate all engine states into single context snapshot
        // - Real-time: This should reflect live system state at backup time
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
    use crate::security::encryption::{MasterKey, MasterKeyGenerator, SigningKeypair};

    fn create_test_travel_engine() -> Arc<TravelEngine> {
        let master_key = MasterKey::generate();
        let keypair = SigningKeypair::generate();
        Arc::new(
            futures::executor::block_on(TravelEngine::new(&master_key, keypair))
                .expect("travel engine should initialize"),
        )
    }

    fn create_test_context() -> SnapshotContext {
        SnapshotContext {
            xp_total: 1000,
            level: 3,
            memory_files: 10,
            active_engines: vec!["Test".to_string()],
            design_system: "v∞".to_string(),
            persona_mood: "test".to_string(),
        }
    }

    #[test]
    fn test_backup_type_variants() {
        assert_eq!(BackupType::Quick, BackupType::Quick);
        assert_ne!(BackupType::Quick, BackupType::Stable);
        assert_ne!(BackupType::Stable, BackupType::Deep);
        assert_ne!(BackupType::Deep, BackupType::Forced);
    }

    #[test]
    fn test_backup_config_default() {
        let config = BackupConfig::default();
        assert!(config.quick_enabled);
        assert!(config.stable_enabled);
        assert!(config.deep_enabled);
        assert_eq!(config.max_quick_backups, 12);
        assert_eq!(config.max_stable_backups, 24);
        assert_eq!(config.max_deep_backups, 30);
    }

    #[test]
    fn test_backup_config_custom() {
        let config = BackupConfig {
            quick_enabled: false,
            stable_enabled: true,
            deep_enabled: false,
            max_quick_backups: 5,
            max_stable_backups: 10,
            max_deep_backups: 15,
        };

        assert!(!config.quick_enabled);
        assert!(config.stable_enabled);
        assert!(!config.deep_enabled);
    }

    #[test]
    fn test_backup_error_display() {
        let err1 = BackupError::TravelEngineError("test error".to_string());
        assert!(err1.to_string().contains("TravelEngine error"));

        let err2 = BackupError::DataCollectionFailed("collection failed".to_string());
        assert!(err2.to_string().contains("Data collection failed"));

        let err3 = BackupError::IoError("io error".to_string());
        assert!(err3.to_string().contains("IO error"));
    }

    #[tokio::test]
    async fn test_backup_engine_new() {
        let travel = create_test_travel_engine();
        let config = BackupConfig::default();
        let engine = BackupEngine::new(travel, config);

        let stats = engine.stats().await;
        assert_eq!(stats.last_quick, 0);
        assert_eq!(stats.last_stable, 0);
        assert_eq!(stats.last_deep, 0);
        assert!(!stats.running);
    }

    #[tokio::test]
    async fn test_backup_engine_start_stop() {
        let travel = create_test_travel_engine();
        let config = BackupConfig {
            quick_enabled: false,
            stable_enabled: false,
            deep_enabled: false,
            ..Default::default()
        };
        let engine = BackupEngine::new(travel, config);

        // Initially not running
        assert!(!engine.stats().await.running);

        // Start engine
        engine.start().await;
        assert!(engine.stats().await.running);

        // Stop engine
        engine.stop().await;
        assert!(!engine.stats().await.running);
    }

    #[tokio::test]
    async fn test_backup_engine_start_idempotent() {
        let travel = create_test_travel_engine();
        let config = BackupConfig {
            quick_enabled: false,
            stable_enabled: false,
            deep_enabled: false,
            ..Default::default()
        };
        let engine = BackupEngine::new(travel, config);

        // Start twice
        engine.start().await;
        engine.start().await; // Should not panic

        assert!(engine.stats().await.running);
    }

    #[tokio::test]
    async fn test_force_backup() {
        let travel = create_test_travel_engine();
        let config = BackupConfig {
            quick_enabled: false,
            stable_enabled: false,
            deep_enabled: false,
            ..Default::default()
        };
        let engine = BackupEngine::new(travel, config);

        let context = create_test_context();
        let data = b"Test backup data".to_vec();

        let result = engine.force_backup(data, context, "unit test").await;
        assert!(result.is_ok());

        let id = result.unwrap();
        assert!(!id.is_empty());
    }

    #[tokio::test]
    async fn test_force_backup_with_reason() {
        let travel = create_test_travel_engine();
        let config = BackupConfig::default();
        let engine = BackupEngine::new(travel, config);

        let context = create_test_context();
        let data = b"Migration backup".to_vec();

        let result = engine
            .force_backup(data, context, "pre-migration backup")
            .await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_collect_system_data() {
        let travel = create_test_travel_engine();
        let config = BackupConfig::default();
        let engine = BackupEngine::new(travel, config);

        let result = engine.collect_system_data().await;
        assert!(result.is_ok());

        let data = result.unwrap();
        assert!(!data.is_empty());

        // Verify it's valid JSON
        let parsed: serde_json::Value = serde_json::from_slice(&data).unwrap();
        assert!(parsed.is_object());
    }

    #[tokio::test]
    async fn test_collect_context() {
        let travel = create_test_travel_engine();
        let config = BackupConfig::default();
        let engine = BackupEngine::new(travel, config);

        let result = engine.collect_context().await;
        assert!(result.is_ok());

        let context = result.unwrap();
        assert_eq!(context.design_system, "v∞");
        assert_eq!(context.level, 1);
    }

    #[tokio::test]
    async fn test_backup_stats_serialization() {
        let stats = BackupStats {
            last_quick: 1000,
            last_stable: 2000,
            last_deep: 3000,
            running: true,
        };

        let json = serde_json::to_string(&stats).unwrap();
        assert!(json.contains("1000"));
        assert!(json.contains("2000"));
        assert!(json.contains("3000"));
        assert!(json.contains("true"));

        let deserialized: BackupStats = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.last_quick, 1000);
        assert_eq!(deserialized.last_stable, 2000);
        assert_eq!(deserialized.last_deep, 3000);
        assert!(deserialized.running);
    }

    #[tokio::test]
    async fn test_perform_backup_when_stopped() {
        let travel = create_test_travel_engine();
        let config = BackupConfig::default();
        let engine = BackupEngine::new(travel, config);

        // Don't start engine
        let result = engine.perform_backup(BackupType::Quick).await;
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("Engine stopped"));
    }

    #[tokio::test]
    async fn test_perform_backup_quick() {
        let travel = create_test_travel_engine();
        let config = BackupConfig::default();
        let engine = BackupEngine::new(travel, config);

        engine.start().await;

        let result = engine.perform_backup(BackupType::Quick).await;
        assert!(result.is_ok());

        let stats = engine.stats().await;
        assert!(stats.last_quick > 0);
    }

    #[tokio::test]
    async fn test_perform_backup_stable() {
        let travel = create_test_travel_engine();
        let config = BackupConfig::default();
        let engine = BackupEngine::new(travel, config);

        engine.start().await;

        let result = engine.perform_backup(BackupType::Stable).await;
        assert!(result.is_ok());

        let stats = engine.stats().await;
        assert!(stats.last_stable > 0);
    }

    #[tokio::test]
    async fn test_perform_backup_deep() {
        let travel = create_test_travel_engine();
        let config = BackupConfig::default();
        let engine = BackupEngine::new(travel, config);

        engine.start().await;

        let result = engine.perform_backup(BackupType::Deep).await;
        assert!(result.is_ok());

        let stats = engine.stats().await;
        assert!(stats.last_deep > 0);
    }

    #[tokio::test]
    async fn test_cleanup_old_backups_quick() {
        let travel = create_test_travel_engine();
        let config = BackupConfig {
            max_quick_backups: 2,
            ..Default::default()
        };
        let engine = BackupEngine::new(travel, config);

        engine.start().await;

        // Create multiple quick backups
        for _ in 0..4 {
            let _ = engine.perform_backup(BackupType::Quick).await;
            tokio::time::sleep(tokio::time::Duration::from_millis(10)).await;
        }

        // Cleanup is called automatically
        let snapshots = engine.travel_engine.list_snapshots().await;
        let quick_snapshots: Vec<_> = snapshots
            .iter()
            .filter(|s| s.description.contains("Quick"))
            .collect();

        assert!(quick_snapshots.len() <= 2);
    }

    #[tokio::test]
    async fn test_cleanup_old_backups_forced_not_cleaned() {
        let travel = create_test_travel_engine();
        let config = BackupConfig {
            max_quick_backups: 1,
            ..Default::default()
        };
        let engine = BackupEngine::new(travel.clone(), config);

        // Create forced backup
        let context = create_test_context();
        let _ = engine
            .force_backup(b"forced".to_vec(), context, "test")
            .await;

        engine.start().await;

        // Create quick backups to trigger cleanup
        for _ in 0..3 {
            let _ = engine.perform_backup(BackupType::Quick).await;
        }

        // Forced backup should still exist
        let snapshots = travel.list_snapshots().await;
        let forced_exists = snapshots.iter().any(|s| s.description.contains("Forced"));
        assert!(forced_exists);
    }

    #[test]
    fn test_now_returns_valid_timestamp() {
        let now = BackupEngine::now();
        assert!(now > 0);
        assert!(now < u64::MAX);

        // Should be reasonably recent (after 2020)
        assert!(now > 1577836800); // 2020-01-01
    }

    #[tokio::test]
    async fn test_backup_type_in_description() {
        let travel = create_test_travel_engine();
        let config = BackupConfig::default();
        let engine = BackupEngine::new(travel.clone(), config);

        engine.start().await;

        let _ = engine.perform_backup(BackupType::Quick).await;
        let _ = engine.perform_backup(BackupType::Stable).await;
        let _ = engine.perform_backup(BackupType::Deep).await;

        let snapshots = travel.list_snapshots().await;

        let has_quick = snapshots.iter().any(|s| s.description.contains("Quick"));
        let has_stable = snapshots.iter().any(|s| s.description.contains("Stable"));
        let has_deep = snapshots.iter().any(|s| s.description.contains("Deep"));

        assert!(has_quick);
        assert!(has_stable);
        assert!(has_deep);
    }

    #[tokio::test]
    async fn test_backup_intervals_constants() {
        assert_eq!(QUICK_BACKUP_INTERVAL, Duration::from_secs(5 * 60));
        assert_eq!(STABLE_BACKUP_INTERVAL, Duration::from_secs(60 * 60));
        assert_eq!(DEEP_BACKUP_INTERVAL, Duration::from_secs(24 * 60 * 60));
    }

    #[test]
    fn test_backup_error_is_error_trait() {
        let err = BackupError::IoError("test".to_string());
        let _: &dyn std::error::Error = &err;
    }

    #[tokio::test]
    async fn test_stats_initial_state() {
        let travel = create_test_travel_engine();
        let config = BackupConfig::default();
        let engine = BackupEngine::new(travel, config);

        let stats = engine.stats().await;
        assert_eq!(stats.last_quick, 0);
        assert_eq!(stats.last_stable, 0);
        assert_eq!(stats.last_deep, 0);
        assert!(!stats.running);
    }

    #[tokio::test]
    async fn test_multiple_force_backups() {
        let travel = create_test_travel_engine();
        let config = BackupConfig::default();
        let engine = BackupEngine::new(travel.clone(), config);

        let context = create_test_context();

        for i in 0..3 {
            let data = format!("backup {}", i).into_bytes();
            let result = engine.force_backup(data, context.clone(), &format!("reason {}", i)).await;
            assert!(result.is_ok());
        }

        let snapshots = travel.list_snapshots().await;
        let forced_count = snapshots
            .iter()
            .filter(|s| s.description.contains("Forced"))
            .count();

        assert_eq!(forced_count, 3);
    }
}
