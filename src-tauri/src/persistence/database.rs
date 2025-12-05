//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v∞.MPE — PERSISTENCE DATABASE
//! Base de données SQLite avec mode WAL pour robustesse
//! ═══════════════════════════════════════════════════════════════════════════════

use super::types::{CompactionReport, IntegrityReport, PersistenceError, Snapshot, SnapshotInfo, TitanEvent};
use std::path::{Path, PathBuf};
use tokio::sync::Mutex;

/// Configuration SQLite WAL pour robustesse crash
/// (Préparé pour migration future vers SQLite)
#[allow(dead_code)]
const SQLITE_PRAGMAS: &str = r#"
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA wal_autocheckpoint = 1000;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
    PRAGMA cache_size = -64000;
"#;

/// Schéma de la base de données
/// (Préparé pour migration future vers SQLite)
#[allow(dead_code)]
const SCHEMA_SQL: &str = r#"
    -- Table des événements (append-only)
    CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        module TEXT NOT NULL,
        event_type TEXT NOT NULL,
        payload TEXT NOT NULL,
        metadata TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    );

    -- Index pour requêtes performantes
    CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
    CREATE INDEX IF NOT EXISTS idx_events_module ON events(module);
    CREATE INDEX IF NOT EXISTS idx_events_module_type ON events(module, event_type);

    -- Table des snapshots
    CREATE TABLE IF NOT EXISTS snapshots (
        id TEXT PRIMARY KEY,
        schema_version INTEGER NOT NULL,
        timestamp INTEGER NOT NULL,
        state_blob BLOB NOT NULL,
        checksum TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    );

    -- Index pour snapshots
    CREATE INDEX IF NOT EXISTS idx_snapshots_timestamp ON snapshots(timestamp DESC);

    -- Table de métadonnées système
    CREATE TABLE IF NOT EXISTS system_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    );

    -- Insérer version du schéma
    INSERT OR REPLACE INTO system_meta (key, value) VALUES ('schema_version', '1');
    INSERT OR REPLACE INTO system_meta (key, value) VALUES ('created_at', strftime('%s', 'now') * 1000);
"#;

/// Nombre d'événements à garder après compaction
const EVENTS_RETENTION_COUNT: u64 = 5000;

/// Base de données de persistence
pub struct PersistenceDB {
    /// Connexion SQLite (protégée par mutex pour thread-safety)
    #[allow(dead_code)]
    conn: Mutex<Option<PathBuf>>,
    /// Chemin de la base
    db_path: PathBuf,
}

impl PersistenceDB {
    /// Ouvrir/créer la base de données
    pub async fn open() -> Result<Self, PersistenceError> {
        let db_path = Self::get_db_path();

        // Créer le répertoire si nécessaire
        if let Some(parent) = db_path.parent() {
            tokio::fs::create_dir_all(parent)
                .await
                .map_err(|e| PersistenceError::IoError(e.to_string()))?;
        }

        // Pour l'instant, on utilise une approche fichier JSON simple
        // TODO: Migrer vers rusqlite quand les dépendances seront configurées
        log::info!("[PersistenceDB] 📂 Ouverture DB: {:?}", db_path);

        // Simuler l'initialisation du schéma
        Self::ensure_schema(&db_path).await?;

        Ok(Self {
            conn: Mutex::new(Some(db_path.clone())),
            db_path,
        })
    }

    /// Obtenir le chemin de la base
    fn get_db_path() -> PathBuf {
        let mut path = dirs::data_local_dir().unwrap_or_else(|| PathBuf::from("."));
        path.push("TITANE_INFINITY");
        path.push("persistence");
        path.push("titan_events.db");
        path
    }

    /// S'assurer que le schéma existe
    async fn ensure_schema(db_path: &Path) -> Result<(), PersistenceError> {
        // Pour l'instant, créer les fichiers JSON de backup
        let events_path = db_path.with_extension("events.json");
        let snapshots_path = db_path.with_extension("snapshots.json");

        if !events_path.exists() {
            tokio::fs::write(&events_path, "[]")
                .await
                .map_err(|e| PersistenceError::IoError(e.to_string()))?;
        }

        if !snapshots_path.exists() {
            tokio::fs::write(&snapshots_path, "[]")
                .await
                .map_err(|e| PersistenceError::IoError(e.to_string()))?;
        }

        log::info!("[PersistenceDB] ✅ Schéma vérifié/créé");
        Ok(())
    }

    /// Insérer un événement
    pub async fn insert_event(&self, event: &TitanEvent) -> Result<(), PersistenceError> {
        let events_path = self.db_path.with_extension("events.json");

        // Lire les événements existants
        let content = tokio::fs::read_to_string(&events_path)
            .await
            .unwrap_or_else(|_| "[]".to_string());

        let mut events: Vec<TitanEvent> =
            serde_json::from_str(&content).unwrap_or_default();

        // Ajouter le nouvel événement
        events.push(event.clone());

        // Écrire de manière atomique
        let json = serde_json::to_string_pretty(&events)
            .map_err(|e| PersistenceError::SerializationError(e.to_string()))?;

        // Écriture atomique via fichier temporaire
        let temp_path = events_path.with_extension("events.json.tmp");
        tokio::fs::write(&temp_path, &json)
            .await
            .map_err(|e| PersistenceError::IoError(e.to_string()))?;

        tokio::fs::rename(&temp_path, &events_path)
            .await
            .map_err(|e| PersistenceError::IoError(e.to_string()))?;

        Ok(())
    }

    /// Charger les événements depuis un timestamp
    pub async fn load_events_since(&self, timestamp: u64) -> Result<Vec<TitanEvent>, PersistenceError> {
        let events_path = self.db_path.with_extension("events.json");

        let content = tokio::fs::read_to_string(&events_path)
            .await
            .unwrap_or_else(|_| "[]".to_string());

        let events: Vec<TitanEvent> =
            serde_json::from_str(&content).unwrap_or_default();

        Ok(events.into_iter().filter(|e| e.timestamp > timestamp).collect())
    }

    /// Sauvegarder un snapshot
    pub async fn save_snapshot(&self, snapshot: &Snapshot) -> Result<(), PersistenceError> {
        let snapshots_path = self.db_path.with_extension("snapshots.json");

        // Lire les snapshots existants
        let content = tokio::fs::read_to_string(&snapshots_path)
            .await
            .unwrap_or_else(|_| "[]".to_string());

        let mut snapshots: Vec<SnapshotRecord> =
            serde_json::from_str(&content).unwrap_or_default();

        // Ajouter le nouveau snapshot
        snapshots.push(SnapshotRecord {
            id: snapshot.id.clone(),
            schema_version: snapshot.schema_version,
            timestamp: snapshot.timestamp,
            state_blob_base64: base64::encode(&snapshot.state_blob),
            checksum: snapshot.checksum.clone(),
        });

        // Garder seulement les 10 derniers
        if snapshots.len() > 10 {
            snapshots = snapshots.split_off(snapshots.len() - 10);
        }

        // Écrire
        let json = serde_json::to_string_pretty(&snapshots)
            .map_err(|e| PersistenceError::SerializationError(e.to_string()))?;

        let temp_path = snapshots_path.with_extension("snapshots.json.tmp");
        tokio::fs::write(&temp_path, &json)
            .await
            .map_err(|e| PersistenceError::IoError(e.to_string()))?;

        tokio::fs::rename(&temp_path, &snapshots_path)
            .await
            .map_err(|e| PersistenceError::IoError(e.to_string()))?;

        Ok(())
    }

    /// Charger le dernier snapshot
    pub async fn load_latest_snapshot(&self) -> Result<Option<Snapshot>, PersistenceError> {
        let snapshots_path = self.db_path.with_extension("snapshots.json");

        if !snapshots_path.exists() {
            return Ok(None);
        }

        let content = tokio::fs::read_to_string(&snapshots_path)
            .await
            .map_err(|e| PersistenceError::IoError(e.to_string()))?;

        let snapshots: Vec<SnapshotRecord> =
            serde_json::from_str(&content).unwrap_or_default();

        if let Some(record) = snapshots.last() {
            let state_blob = base64::decode(&record.state_blob_base64)
                .map_err(|e| PersistenceError::SerializationError(e.to_string()))?;

            return Ok(Some(Snapshot {
                id: record.id.clone(),
                schema_version: record.schema_version,
                timestamp: record.timestamp,
                state_blob,
                checksum: record.checksum.clone(),
            }));
        }

        Ok(None)
    }

    /// Vérifier l'intégrité de la base
    pub async fn check_integrity(&self) -> Result<IntegrityReport, PersistenceError> {
        let events_path = self.db_path.with_extension("events.json");
        let snapshots_path = self.db_path.with_extension("snapshots.json");

        let mut report = IntegrityReport::default();

        // Vérifier que les fichiers existent et sont lisibles
        if !events_path.exists() {
            report.errors.push("Fichier events.json manquant".to_string());
            report.is_valid = false;
        }

        if !snapshots_path.exists() {
            report.warnings.push("Fichier snapshots.json manquant".to_string());
        }

        // Vérifier que les fichiers sont parsables
        if events_path.exists() {
            match tokio::fs::read_to_string(&events_path).await {
                Ok(content) => {
                    if serde_json::from_str::<Vec<TitanEvent>>(&content).is_err() {
                        report.errors.push("events.json corrompu".to_string());
                        report.is_valid = false;
                    }
                }
                Err(e) => {
                    report.errors.push(format!("Erreur lecture events.json: {}", e));
                    report.is_valid = false;
                }
            }
        }

        if snapshots_path.exists() {
            match tokio::fs::read_to_string(&snapshots_path).await {
                Ok(content) => {
                    if serde_json::from_str::<Vec<SnapshotRecord>>(&content).is_err() {
                        report.errors.push("snapshots.json corrompu".to_string());
                        report.is_valid = false;
                    }
                }
                Err(e) => {
                    report.errors.push(format!("Erreur lecture snapshots.json: {}", e));
                    report.is_valid = false;
                }
            }
        }

        Ok(report)
    }

    /// Compacter les événements
    pub async fn compact_events(&self) -> Result<CompactionReport, PersistenceError> {
        let start = std::time::Instant::now();
        let events_path = self.db_path.with_extension("events.json");

        let content = tokio::fs::read_to_string(&events_path)
            .await
            .unwrap_or_else(|_| "[]".to_string());

        let mut events: Vec<TitanEvent> =
            serde_json::from_str(&content).unwrap_or_default();

        let original_count = events.len() as u64;

        // Garder seulement les N derniers événements
        if events.len() > EVENTS_RETENTION_COUNT as usize {
            let to_archive = events.len() - EVENTS_RETENTION_COUNT as usize;
            events = events.split_off(to_archive);
        }

        let remaining = events.len() as u64;
        let archived = original_count - remaining;

        // Écrire les événements compactés
        let json = serde_json::to_string_pretty(&events)
            .map_err(|e| PersistenceError::SerializationError(e.to_string()))?;

        let original_size = content.len() as u64;
        let new_size = json.len() as u64;

        tokio::fs::write(&events_path, &json)
            .await
            .map_err(|e| PersistenceError::IoError(e.to_string()))?;

        Ok(CompactionReport {
            events_archived: archived,
            events_remaining: remaining,
            bytes_freed: original_size.saturating_sub(new_size),
            duration_ms: start.elapsed().as_millis() as u64,
            success: true,
        })
    }

    /// Lister les snapshots disponibles
    pub async fn list_snapshots(&self) -> Result<Vec<SnapshotInfo>, PersistenceError> {
        let snapshots_path = self.db_path.with_extension("snapshots.json");

        if !snapshots_path.exists() {
            return Ok(Vec::new());
        }

        let content = tokio::fs::read_to_string(&snapshots_path)
            .await
            .map_err(|e| PersistenceError::IoError(e.to_string()))?;

        let snapshots: Vec<SnapshotRecord> =
            serde_json::from_str(&content).unwrap_or_default();

        Ok(snapshots.iter().map(|r| SnapshotInfo {
            id: r.id.clone(),
            timestamp: r.timestamp,
            size_bytes: r.state_blob_base64.len() as u64,
            schema_version: r.schema_version,
        }).collect())
    }

    /// Fermer la base
    pub async fn close(&self) -> Result<(), PersistenceError> {
        log::info!("[PersistenceDB] 🔒 Fermeture de la base");
        Ok(())
    }
}

/// Record de snapshot pour sérialisation JSON
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct SnapshotRecord {
    id: String,
    schema_version: u32,
    timestamp: u64,
    state_blob_base64: String,
    checksum: String,
}

// Module base64 pour encodage
mod base64 {
    pub fn encode(data: &[u8]) -> String {
        ::base64::Engine::encode(&::base64::engine::general_purpose::STANDARD, data)
    }

    pub fn decode(s: &str) -> Result<Vec<u8>, ::base64::DecodeError> {
        ::base64::Engine::decode(&::base64::engine::general_purpose::STANDARD, s)
    }
}
