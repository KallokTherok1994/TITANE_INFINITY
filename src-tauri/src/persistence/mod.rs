/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.MPE — PERSISTENCE ENGINE (100% SAVE)
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * Architecture:
 * - Event Log (append-only, idempotent)
 * - Snapshots (état complet périodique)
 * - SQLite WAL mode (robustesse crash)
 * - Auto-save triggers (data + 30min + shutdown)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

pub mod event_log;
pub mod snapshot;
pub mod database;
pub mod recovery;
pub mod types;
pub mod commands;

pub use event_log::EventLog;
pub use snapshot::SnapshotManager;
pub use database::PersistenceDB;
pub use recovery::RecoveryEngine;
pub use types::*;

use once_cell::sync::Lazy;
use std::sync::Arc;
use tokio::sync::RwLock;

// Import SingularityState depuis core (ré-exporté depuis state.rs)
pub use crate::core::SingularityState;

/// Instance globale du moteur de persistence
pub static PERSISTENCE_ENGINE: Lazy<Arc<RwLock<PersistenceEngine>>> = Lazy::new(|| {
    Arc::new(RwLock::new(PersistenceEngine::new()))
});

/// Moteur de persistence principal
pub struct PersistenceEngine {
    db: Option<PersistenceDB>,
    event_log: EventLog,
    snapshot_manager: SnapshotManager,
    recovery_engine: RecoveryEngine,
    status: PersistenceStatus,
    initialized: bool,
}

impl PersistenceEngine {
    pub fn new() -> Self {
        Self {
            db: None,
            event_log: EventLog::new(),
            snapshot_manager: SnapshotManager::new(),
            recovery_engine: RecoveryEngine::new(),
            status: PersistenceStatus::default(),
            initialized: false,
        }
    }

    /// Initialiser le moteur de persistence
    pub async fn initialize(&mut self) -> Result<(), PersistenceError> {
        if self.initialized {
            return Ok(());
        }

        log::info!("[PersistenceEngine] 🚀 Initialisation...");

        // 1. Ouvrir/créer la base de données
        let db = PersistenceDB::open().await?;
        self.db = Some(db);

        // 2. Vérifier l'intégrité
        self.check_integrity().await?;

        // 3. Effectuer le recovery si nécessaire
        self.recovery_engine.recover(&mut self.event_log, &mut self.snapshot_manager).await?;

        self.initialized = true;
        self.status.last_boot = Some(chrono::Utc::now().timestamp_millis() as u64);

        log::info!("[PersistenceEngine] ✅ Initialisé avec succès");
        Ok(())
    }

    /// Persister un événement (append-only)
    pub async fn persist_event(&mut self, event: TitanEvent) -> Result<(), PersistenceError> {
        if let Some(db) = &self.db {
            // Vérifier idempotence
            if self.event_log.has_event(&event.id) {
                log::debug!("[PersistenceEngine] Event {} déjà persisté (idempotent)", event.id);
                return Ok(());
            }

            // Persister dans la DB
            db.insert_event(&event).await?;

            // Ajouter au log en mémoire
            self.event_log.append(event.clone());

            // Mettre à jour le status
            self.status.events_persisted += 1;
            self.status.last_event = Some(chrono::Utc::now().timestamp_millis() as u64);
            self.status.dirty = true;

            log::debug!("[PersistenceEngine] Event {} persisté", event.id);
            Ok(())
        } else {
            Err(PersistenceError::NotInitialized)
        }
    }

    /// Forcer un snapshot complet
    pub async fn force_snapshot(&mut self, state: &SingularityState) -> Result<(), PersistenceError> {
        if let Some(db) = &self.db {
            let snapshot = Snapshot::from_state(state);
            db.save_snapshot(&snapshot).await?;

            self.snapshot_manager.record_snapshot(&snapshot);
            self.status.last_snapshot = Some(chrono::Utc::now().timestamp_millis() as u64);
            self.status.dirty = false;

            log::info!("[PersistenceEngine] 📸 Snapshot forcé créé");
            Ok(())
        } else {
            Err(PersistenceError::NotInitialized)
        }
    }

    /// Charger l'état le plus récent
    pub async fn load_latest_state(&self) -> Result<Option<SingularityState>, PersistenceError> {
        if let Some(db) = &self.db {
            // 1. Charger le dernier snapshot
            if let Some(snapshot) = db.load_latest_snapshot().await? {
                let mut state = snapshot.to_state();

                // 2. Rejouer les événements plus récents
                let events = db.load_events_since(snapshot.timestamp).await?;
                for event in events {
                    self.apply_event_to_state(&mut state, &event);
                }

                return Ok(Some(state));
            }
            Ok(None)
        } else {
            Err(PersistenceError::NotInitialized)
        }
    }

    /// Appliquer un événement à l'état (reducer)
    fn apply_event_to_state(&self, state: &mut SingularityState, event: &TitanEvent) {
        match event.module.as_str() {
            "xp" => {
                if let Some(amount) = event.payload.get("amount").and_then(|v| v.as_i64()) {
                    // Appliquer XP delta aux métriques (ticks comme proxy)
                    state.metrics.ticks += amount as u64;
                }
            }
            "memory" => {
                // Incrémenter compteur mémoire dans le module memory
                state.memory.memory_count += 1;
                state.memory.last_operation_ms = event.timestamp;
            }
            "progress" => {
                // Mettre à jour progression dans cognition (depth comme proxy)
                if let Some(level) = event.payload.get("level").and_then(|v| v.as_i64()) {
                    state.cognition.depth = (level as u8).min(10);
                }
            }
            "knowledge" => {
                // Les connaissances incrémentent le compteur mémoire
                state.memory.memory_count += 1;
                state.cognition.active_thoughts += 1;
            }
            "settings" => {
                // Les settings sont appliqués via les modules appropriés
                state.metrics.last_update_ms = event.timestamp;
            }
            _ => {
                log::debug!("[PersistenceEngine] Module inconnu: {}", event.module);
            }
        }
        state.last_sync_ms = event.timestamp;
    }

    /// Vérifier l'intégrité de la base
    pub async fn check_integrity(&mut self) -> Result<IntegrityReport, PersistenceError> {
        if let Some(db) = &self.db {
            let report = db.check_integrity().await?;
            self.status.last_integrity_check = Some(chrono::Utc::now().timestamp_millis() as u64);
            self.status.integrity_ok = report.is_valid;
            Ok(report)
        } else {
            Err(PersistenceError::NotInitialized)
        }
    }

    /// Obtenir le status de persistence
    pub fn get_status(&self) -> &PersistenceStatus {
        &self.status
    }

    /// Compacter le journal (archiver les anciens événements)
    pub async fn compact_journal(&mut self) -> Result<CompactionReport, PersistenceError> {
        if let Some(db) = &self.db {
            let report = db.compact_events().await?;
            self.status.last_compaction = Some(chrono::Utc::now().timestamp_millis() as u64);
            log::info!("[PersistenceEngine] 🗜️ Compaction: {} events archivés", report.events_archived);
            Ok(report)
        } else {
            Err(PersistenceError::NotInitialized)
        }
    }

    /// Shutdown propre (flush final)
    pub async fn shutdown(&mut self) -> Result<(), PersistenceError> {
        log::info!("[PersistenceEngine] 🛑 Shutdown en cours...");

        // Forcer un snapshot final si dirty
        if self.status.dirty {
            // Note: l'appelant doit fournir l'état
            log::warn!("[PersistenceEngine] État dirty au shutdown - snapshot requis par l'appelant");
        }

        if let Some(db) = &self.db {
            db.close().await?;
        }

        self.initialized = false;
        log::info!("[PersistenceEngine] ✅ Shutdown terminé");
        Ok(())
    }
}

impl Default for PersistenceEngine {
    fn default() -> Self {
        Self::new()
    }
}
