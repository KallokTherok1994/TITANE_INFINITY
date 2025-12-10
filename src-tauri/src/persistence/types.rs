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
