//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v∞.MPE — PERSISTENCE TYPES
//! Types pour le système de persistence 100% SAVE
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// Import SingularityState depuis core
use crate::core::SingularityState;

// ═══════════════════════════════════════════════════════════════════════════════
// TITAN EVENT (Événement persisté)
// ═══════════════════════════════════════════════════════════════════════════════

/// Événement TITANE persistable
///
/// Conforme à l'architecture Event Sourcing v∞ avec:
/// - ID unique (UUID v4) pour déduplication
/// - Timestamp en millisecondes pour ordering
/// - schema_version pour migrations
/// - origin pour traçabilité (user, engine, self_heal, system)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TitanEvent {
    /// ID unique (UUID v4)
    pub id: String,
    /// Timestamp en millisecondes
    pub timestamp: u64,
    /// Version du schéma (pour migrations futures)
    pub schema_version: u32,
    /// Origine de l'événement (user, engine, self_heal, system)
    pub origin: EventOrigin,
    /// Module source (xp, memory, progress, knowledge, settings, console, agenda)
    pub module: String,
    /// Type d'événement (add, update, delete, etc.)
    pub event_type: String,
    /// Payload JSON
    pub payload: serde_json::Value,
    /// Métadonnées optionnelles
    pub metadata: Option<HashMap<String, serde_json::Value>>,
}

/// Origine d'un événement TITANE
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum EventOrigin {
    /// Action utilisateur
    User,
    /// Action d'un moteur automatique
    Engine,
    /// Action de self-healing / auto-réparation
    SelfHeal,
    /// Action système (boot, shutdown, etc.)
    System,
    /// Migration de données
    Migration,
}

impl Default for EventOrigin {
    fn default() -> Self {
        Self::User
    }
}

impl TitanEvent {
    /// Créer un nouvel événement avec origine par défaut (User)
    pub fn new(module: &str, event_type: &str, payload: serde_json::Value) -> Self {
        Self::with_origin(module, event_type, payload, EventOrigin::User)
    }

    /// Créer un événement avec origine spécifiée
    pub fn with_origin(
        module: &str,
        event_type: &str,
        payload: serde_json::Value,
        origin: EventOrigin,
    ) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            timestamp: chrono::Utc::now().timestamp_millis() as u64,
            schema_version: super::migrations::CURRENT_SCHEMA_VERSION,
            origin,
            module: module.to_string(),
            event_type: event_type.to_string(),
            payload,
            metadata: None,
        }
    }

    /// Créer un événement système
    pub fn system(module: &str, event_type: &str, payload: serde_json::Value) -> Self {
        Self::with_origin(module, event_type, payload, EventOrigin::System)
    }

    /// Créer un événement de self-healing
    pub fn self_heal(module: &str, event_type: &str, payload: serde_json::Value) -> Self {
        Self::with_origin(module, event_type, payload, EventOrigin::SelfHeal)
    }

    /// Créer un événement engine (automatique)
    pub fn engine(module: &str, event_type: &str, payload: serde_json::Value) -> Self {
        Self::with_origin(module, event_type, payload, EventOrigin::Engine)
    }

    /// Créer un événement avec métadonnées
    pub fn with_metadata(mut self, metadata: HashMap<String, serde_json::Value>) -> Self {
        self.metadata = Some(metadata);
        self
    }

    /// Clé d'idempotence (pour dédoublonnage)
    pub fn idempotency_key(&self) -> String {
        format!("{}:{}:{}", self.module, self.event_type, self.id)
    }

    /// Vérifier si l'événement est d'origine utilisateur
    pub fn is_user_initiated(&self) -> bool {
        self.origin == EventOrigin::User
    }

    /// Vérifier si l'événement est d'origine système
    pub fn is_system_initiated(&self) -> bool {
        matches!(
            self.origin,
            EventOrigin::System | EventOrigin::Engine | EventOrigin::SelfHeal
        )
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SNAPSHOT
// ═══════════════════════════════════════════════════════════════════════════════

/// Snapshot complet de l'état
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Snapshot {
    /// ID du snapshot
    pub id: String,
    /// Version du schéma
    pub schema_version: u32,
    /// Timestamp de création
    pub timestamp: u64,
    /// État sérialisé (JSON compressé)
    pub state_blob: Vec<u8>,
    /// Checksum pour intégrité
    pub checksum: String,
}

impl Snapshot {
    /// Créer un snapshot depuis un SingularityState
    pub fn from_state(state: &SingularityState) -> Self {
        let json = serde_json::to_vec(state).unwrap_or_default();
        let compressed = Self::compress(&json);
        let checksum = Self::compute_checksum(&compressed);

        Self {
            id: uuid::Uuid::new_v4().to_string(),
            schema_version: 1,
            timestamp: chrono::Utc::now().timestamp_millis() as u64,
            state_blob: compressed,
            checksum,
        }
    }

    /// Reconstruire l'état depuis le snapshot
    pub fn to_state(&self) -> SingularityState {
        let decompressed = Self::decompress(&self.state_blob);
        serde_json::from_slice(&decompressed).unwrap_or_default()
    }

    /// Vérifier l'intégrité du snapshot
    pub fn verify_integrity(&self) -> bool {
        let computed = Self::compute_checksum(&self.state_blob);
        computed == self.checksum
    }

    /// Compresser les données (flate2)
    fn compress(data: &[u8]) -> Vec<u8> {
        use flate2::write::GzEncoder;
        use flate2::Compression;
        use std::io::Write;

        let mut encoder = GzEncoder::new(Vec::new(), Compression::fast());
        encoder.write_all(data).unwrap_or_default();
        encoder.finish().unwrap_or_default()
    }

    /// Décompresser les données
    fn decompress(data: &[u8]) -> Vec<u8> {
        use flate2::read::GzDecoder;
        use std::io::Read;

        let mut decoder = GzDecoder::new(data);
        let mut result = Vec::new();
        decoder.read_to_end(&mut result).unwrap_or_default();
        result
    }

    /// Calculer le checksum SHA256
    fn compute_checksum(data: &[u8]) -> String {
        use sha2::{Digest, Sha256};
        let mut hasher = Sha256::new();
        hasher.update(data);
        format!("{:x}", hasher.finalize())
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERSISTENCE STATUS
// ═══════════════════════════════════════════════════════════════════════════════

/// Information sur un snapshot (métadonnées légères)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnapshotInfo {
    pub id: String,
    pub timestamp: u64,
    pub size_bytes: u64,
    pub schema_version: u32,
}

/// Status du système de persistence
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PersistenceStatus {
    /// Nombre d'événements persistés
    pub events_persisted: u64,
    /// Nombre de snapshots créés
    pub snapshots_created: u64,
    /// Dernier événement (timestamp)
    pub last_event: Option<u64>,
    /// Dernier snapshot (timestamp)
    pub last_snapshot: Option<u64>,
    /// Dernier check d'intégrité
    pub last_integrity_check: Option<u64>,
    /// Dernière compaction
    pub last_compaction: Option<u64>,
    /// Dernier boot
    pub last_boot: Option<u64>,
    /// Intégrité OK
    pub integrity_ok: bool,
    /// État dirty (modifications non sauvegardées)
    pub dirty: bool,
    /// Taille du journal (bytes)
    pub journal_size_bytes: u64,
    /// Nombre d'événements en attente de compaction
    pub events_pending_compaction: u64,
    /// Erreurs récentes
    pub recent_errors: Vec<PersistenceError>,
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRITY REPORT
// ═══════════════════════════════════════════════════════════════════════════════

/// Rapport d'intégrité
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntegrityReport {
    pub is_valid: bool,
    pub checked_at: u64,
    pub database_ok: bool,
    pub tables_ok: bool,
    pub indexes_ok: bool,
    pub foreign_keys_ok: bool,
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
}

impl Default for IntegrityReport {
    fn default() -> Self {
        Self {
            is_valid: true,
            checked_at: chrono::Utc::now().timestamp_millis() as u64,
            database_ok: true,
            tables_ok: true,
            indexes_ok: true,
            foreign_keys_ok: true,
            errors: Vec::new(),
            warnings: Vec::new(),
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPACTION REPORT
// ═══════════════════════════════════════════════════════════════════════════════

/// Rapport de compaction
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompactionReport {
    pub events_archived: u64,
    pub events_remaining: u64,
    pub bytes_freed: u64,
    pub duration_ms: u64,
    pub success: bool,
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERSISTENCE ERROR
// ═══════════════════════════════════════════════════════════════════════════════

/// Erreurs de persistence
#[derive(Debug, Clone, Serialize, Deserialize, thiserror::Error)]
pub enum PersistenceError {
    #[error("Moteur de persistence non initialisé")]
    NotInitialized,

    #[error("Erreur de base de données: {0}")]
    DatabaseError(String),

    #[error("Erreur de sérialisation: {0}")]
    SerializationError(String),

    #[error("Erreur d'intégrité: {0}")]
    IntegrityError(String),

    #[error("Erreur de recovery: {0}")]
    RecoveryError(String),

    #[error("Erreur d'IO: {0}")]
    IoError(String),

    #[error("Version de schéma incompatible: attendu {expected}, trouvé {found}")]
    SchemaVersionMismatch { expected: u32, found: u32 },
}

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // EventOrigin Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_event_origin_default() {
        let origin = EventOrigin::default();
        assert_eq!(origin, EventOrigin::User);
    }

    #[test]
    fn test_event_origin_equality() {
        assert_eq!(EventOrigin::User, EventOrigin::User);
        assert_ne!(EventOrigin::User, EventOrigin::Engine);
    }

    #[test]
    fn test_event_origin_all_variants() {
        let variants = vec![
            EventOrigin::User,
            EventOrigin::Engine,
            EventOrigin::SelfHeal,
            EventOrigin::System,
            EventOrigin::Migration,
        ];
        assert_eq!(variants.len(), 5);
    }

    #[test]
    fn test_event_origin_serialization() {
        let origin = EventOrigin::SelfHeal;
        let json = serde_json::to_string(&origin).unwrap();
        assert_eq!(json, "\"self_heal\"");

        let restored: EventOrigin = serde_json::from_str(&json).unwrap();
        assert_eq!(restored, EventOrigin::SelfHeal);
    }

    #[test]
    fn test_event_origin_debug() {
        let origin = EventOrigin::Engine;
        let debug_str = format!("{:?}", origin);
        assert!(debug_str.contains("Engine"));
    }

    #[test]
    fn test_event_origin_clone() {
        let origin = EventOrigin::Migration;
        let cloned = origin.clone();
        assert_eq!(origin, cloned);
    }

    // ─────────────────────────────────────────────────────────────
    // TitanEvent Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_titan_event_new() {
        let event = TitanEvent::new("xp", "add", serde_json::json!({"amount": 100}));

        assert!(!event.id.is_empty());
        assert!(event.timestamp > 0);
        assert_eq!(event.module, "xp");
        assert_eq!(event.event_type, "add");
        assert_eq!(event.origin, EventOrigin::User);
    }

    #[test]
    fn test_titan_event_with_origin() {
        let event = TitanEvent::with_origin(
            "memory",
            "save",
            serde_json::json!({"data": "test"}),
            EventOrigin::Engine,
        );

        assert_eq!(event.origin, EventOrigin::Engine);
        assert_eq!(event.module, "memory");
    }

    #[test]
    fn test_titan_event_system() {
        let event = TitanEvent::system("boot", "startup", serde_json::json!({}));

        assert_eq!(event.origin, EventOrigin::System);
        assert_eq!(event.module, "boot");
    }

    #[test]
    fn test_titan_event_self_heal() {
        let event = TitanEvent::self_heal("health", "repair", serde_json::json!({}));

        assert_eq!(event.origin, EventOrigin::SelfHeal);
    }

    #[test]
    fn test_titan_event_engine() {
        let event = TitanEvent::engine("scheduler", "tick", serde_json::json!({}));

        assert_eq!(event.origin, EventOrigin::Engine);
    }

    #[test]
    fn test_titan_event_with_metadata() {
        let mut metadata = HashMap::new();
        metadata.insert("key".to_string(), serde_json::json!("value"));

        let event =
            TitanEvent::new("test", "action", serde_json::json!({})).with_metadata(metadata);

        assert!(event.metadata.is_some());
        let meta = event.metadata.unwrap();
        assert!(meta.contains_key("key"));
    }

    #[test]
    fn test_titan_event_idempotency_key() {
        let event = TitanEvent::new("module", "type", serde_json::json!({}));
        let key = event.idempotency_key();

        assert!(key.contains("module"));
        assert!(key.contains("type"));
        assert!(key.contains(&event.id));
    }

    #[test]
    fn test_titan_event_is_user_initiated() {
        let user_event = TitanEvent::new("test", "action", serde_json::json!({}));
        let system_event = TitanEvent::system("test", "action", serde_json::json!({}));

        assert!(user_event.is_user_initiated());
        assert!(!system_event.is_user_initiated());
    }

    #[test]
    fn test_titan_event_is_system_initiated() {
        let user_event = TitanEvent::new("test", "action", serde_json::json!({}));
        let system_event = TitanEvent::system("test", "action", serde_json::json!({}));
        let engine_event = TitanEvent::engine("test", "action", serde_json::json!({}));
        let heal_event = TitanEvent::self_heal("test", "action", serde_json::json!({}));

        assert!(!user_event.is_system_initiated());
        assert!(system_event.is_system_initiated());
        assert!(engine_event.is_system_initiated());
        assert!(heal_event.is_system_initiated());
    }

    #[test]
    fn test_titan_event_clone() {
        let event = TitanEvent::new("test", "clone", serde_json::json!({}));
        let cloned = event.clone();

        assert_eq!(event.id, cloned.id);
        assert_eq!(event.module, cloned.module);
    }

    #[test]
    fn test_titan_event_debug() {
        let event = TitanEvent::new("test", "debug", serde_json::json!({}));
        let debug_str = format!("{:?}", event);
        assert!(debug_str.contains("TitanEvent"));
    }

    #[test]
    fn test_titan_event_serialization() {
        let event = TitanEvent::new("xp", "gain", serde_json::json!({"xp": 500}));

        let json = serde_json::to_string(&event).unwrap();
        let restored: TitanEvent = serde_json::from_str(&json).unwrap();

        assert_eq!(restored.module, "xp");
        assert_eq!(restored.event_type, "gain");
    }

    // ─────────────────────────────────────────────────────────────
    // SnapshotInfo Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_snapshot_info_creation() {
        let info = SnapshotInfo {
            id: "snap-1".to_string(),
            timestamp: 1234567890,
            size_bytes: 1024,
            schema_version: 1,
        };

        assert_eq!(info.id, "snap-1");
        assert_eq!(info.size_bytes, 1024);
    }

    #[test]
    fn test_snapshot_info_clone() {
        let info = SnapshotInfo {
            id: "snap".to_string(),
            timestamp: 100,
            size_bytes: 500,
            schema_version: 2,
        };
        let cloned = info.clone();
        assert_eq!(cloned.schema_version, 2);
    }

    #[test]
    fn test_snapshot_info_debug() {
        let info = SnapshotInfo {
            id: "s".to_string(),
            timestamp: 0,
            size_bytes: 0,
            schema_version: 0,
        };
        let debug_str = format!("{:?}", info);
        assert!(debug_str.contains("SnapshotInfo"));
    }

    #[test]
    fn test_snapshot_info_serialization() {
        let info = SnapshotInfo {
            id: "snap-test".to_string(),
            timestamp: 999,
            size_bytes: 2048,
            schema_version: 3,
        };

        let json = serde_json::to_string(&info).unwrap();
        let restored: SnapshotInfo = serde_json::from_str(&json).unwrap();

        assert_eq!(restored.id, "snap-test");
        assert_eq!(restored.size_bytes, 2048);
    }

    // ─────────────────────────────────────────────────────────────
    // PersistenceStatus Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_persistence_status_default() {
        let status = PersistenceStatus::default();

        assert_eq!(status.events_persisted, 0);
        assert_eq!(status.snapshots_created, 0);
        assert!(status.last_event.is_none());
        assert!(!status.dirty);
    }

    #[test]
    fn test_persistence_status_with_data() {
        let status = PersistenceStatus {
            events_persisted: 1000,
            snapshots_created: 5,
            last_event: Some(1234567890),
            last_snapshot: Some(1234567800),
            last_integrity_check: Some(1234567700),
            last_compaction: None,
            last_boot: Some(1234560000),
            integrity_ok: true,
            dirty: false,
            journal_size_bytes: 50000,
            events_pending_compaction: 100,
            recent_errors: vec![],
        };

        assert_eq!(status.events_persisted, 1000);
        assert!(status.integrity_ok);
    }

    #[test]
    fn test_persistence_status_clone() {
        let status = PersistenceStatus {
            events_persisted: 50,
            dirty: true,
            ..Default::default()
        };
        let cloned = status.clone();
        assert_eq!(cloned.events_persisted, 50);
        assert!(cloned.dirty);
    }

    #[test]
    fn test_persistence_status_debug() {
        let status = PersistenceStatus::default();
        let debug_str = format!("{:?}", status);
        assert!(debug_str.contains("PersistenceStatus"));
    }

    #[test]
    fn test_persistence_status_serialization() {
        let status = PersistenceStatus {
            events_persisted: 100,
            integrity_ok: true,
            ..Default::default()
        };

        let json = serde_json::to_string(&status).unwrap();
        let restored: PersistenceStatus = serde_json::from_str(&json).unwrap();

        assert_eq!(restored.events_persisted, 100);
        assert!(restored.integrity_ok);
    }

    // ─────────────────────────────────────────────────────────────
    // IntegrityReport Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_integrity_report_default() {
        let report = IntegrityReport::default();

        assert!(report.is_valid);
        assert!(report.database_ok);
        assert!(report.tables_ok);
        assert!(report.indexes_ok);
        assert!(report.foreign_keys_ok);
        assert!(report.errors.is_empty());
        assert!(report.warnings.is_empty());
    }

    #[test]
    fn test_integrity_report_with_errors() {
        let report = IntegrityReport {
            is_valid: false,
            checked_at: 1234567890,
            database_ok: true,
            tables_ok: false,
            indexes_ok: true,
            foreign_keys_ok: true,
            errors: vec!["Missing table".to_string()],
            warnings: vec!["Index fragmented".to_string()],
        };

        assert!(!report.is_valid);
        assert!(!report.tables_ok);
        assert_eq!(report.errors.len(), 1);
    }

    #[test]
    fn test_integrity_report_clone() {
        let report = IntegrityReport::default();
        let cloned = report.clone();
        assert_eq!(cloned.is_valid, report.is_valid);
    }

    #[test]
    fn test_integrity_report_debug() {
        let report = IntegrityReport::default();
        let debug_str = format!("{:?}", report);
        assert!(debug_str.contains("IntegrityReport"));
    }

    #[test]
    fn test_integrity_report_serialization() {
        let report = IntegrityReport::default();

        let json = serde_json::to_string(&report).unwrap();
        let restored: IntegrityReport = serde_json::from_str(&json).unwrap();

        assert!(restored.is_valid);
        assert!(restored.database_ok);
    }

    // ─────────────────────────────────────────────────────────────
    // CompactionReport Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_compaction_report_creation() {
        let report = CompactionReport {
            events_archived: 500,
            events_remaining: 100,
            bytes_freed: 10000,
            duration_ms: 150,
            success: true,
        };

        assert_eq!(report.events_archived, 500);
        assert!(report.success);
    }

    #[test]
    fn test_compaction_report_failed() {
        let report = CompactionReport {
            events_archived: 0,
            events_remaining: 600,
            bytes_freed: 0,
            duration_ms: 50,
            success: false,
        };

        assert!(!report.success);
        assert_eq!(report.bytes_freed, 0);
    }

    #[test]
    fn test_compaction_report_clone() {
        let report = CompactionReport {
            events_archived: 100,
            events_remaining: 50,
            bytes_freed: 5000,
            duration_ms: 100,
            success: true,
        };
        let cloned = report.clone();
        assert_eq!(cloned.events_archived, 100);
    }

    #[test]
    fn test_compaction_report_debug() {
        let report = CompactionReport {
            events_archived: 0,
            events_remaining: 0,
            bytes_freed: 0,
            duration_ms: 0,
            success: true,
        };
        let debug_str = format!("{:?}", report);
        assert!(debug_str.contains("CompactionReport"));
    }

    #[test]
    fn test_compaction_report_serialization() {
        let report = CompactionReport {
            events_archived: 250,
            events_remaining: 75,
            bytes_freed: 7500,
            duration_ms: 200,
            success: true,
        };

        let json = serde_json::to_string(&report).unwrap();
        let restored: CompactionReport = serde_json::from_str(&json).unwrap();

        assert_eq!(restored.events_archived, 250);
        assert_eq!(restored.bytes_freed, 7500);
    }

    // ─────────────────────────────────────────────────────────────
    // PersistenceError Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_persistence_error_not_initialized() {
        let error = PersistenceError::NotInitialized;
        let display = format!("{}", error);
        assert!(display.contains("non initialisé"));
    }

    #[test]
    fn test_persistence_error_database() {
        let error = PersistenceError::DatabaseError("connection failed".to_string());
        let display = format!("{}", error);
        assert!(display.contains("base de données"));
    }

    #[test]
    fn test_persistence_error_serialization_err() {
        let error = PersistenceError::SerializationError("invalid json".to_string());
        let display = format!("{}", error);
        assert!(display.contains("sérialisation"));
    }

    #[test]
    fn test_persistence_error_integrity() {
        let error = PersistenceError::IntegrityError("checksum mismatch".to_string());
        let display = format!("{}", error);
        assert!(display.contains("intégrité"));
    }

    #[test]
    fn test_persistence_error_recovery() {
        let error = PersistenceError::RecoveryError("snapshot corrupted".to_string());
        let display = format!("{}", error);
        assert!(display.contains("recovery"));
    }

    #[test]
    fn test_persistence_error_io() {
        let error = PersistenceError::IoError("file not found".to_string());
        let display = format!("{}", error);
        assert!(display.contains("IO"));
    }

    #[test]
    fn test_persistence_error_schema_mismatch() {
        let error = PersistenceError::SchemaVersionMismatch {
            expected: 2,
            found: 1,
        };
        let display = format!("{}", error);
        assert!(display.contains("schéma"));
        assert!(display.contains("2"));
        assert!(display.contains("1"));
    }

    #[test]
    fn test_persistence_error_debug() {
        let error = PersistenceError::NotInitialized;
        let debug_str = format!("{:?}", error);
        assert!(debug_str.contains("NotInitialized"));
    }

    #[test]
    fn test_persistence_error_clone() {
        let error = PersistenceError::IoError("test".to_string());
        let cloned = error.clone();
        assert!(format!("{}", cloned).contains("IO"));
    }

    #[test]
    fn test_persistence_error_serialization() {
        let error = PersistenceError::DatabaseError("test".to_string());

        let json = serde_json::to_string(&error).unwrap();
        let restored: PersistenceError = serde_json::from_str(&json).unwrap();

        assert!(format!("{}", restored).contains("base de données"));
    }
}
