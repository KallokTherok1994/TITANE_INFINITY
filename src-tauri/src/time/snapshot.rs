// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   SNAPSHOT — Super-Prompt N
//   Structure de snapshot immutable
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

/// Métadonnées snapshot
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnapshotMetadata {
    /// ID unique (timestamp + hash)
    pub id: String,
    /// Timestamp création
    pub timestamp: u64,
    /// Version TITANE∞
    pub version: String,
    /// Hash SHA-256 du snapshot
    pub sha256: String,
    /// Taille compressée (bytes)
    pub compressed_size: u64,
    /// Taille non compressée (bytes)
    pub uncompressed_size: u64,
    /// Description
    pub description: String,
    /// Contexte au moment du snapshot
    pub context: SnapshotContext,
}

/// Contexte snapshot
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnapshotContext {
    /// XP total
    pub xp_total: u64,
    /// Niveau
    pub level: u32,
    /// Nombre de fichiers en mémoire
    pub memory_files: usize,
    /// Moteurs actifs
    pub active_engines: Vec<String>,
    /// Design System actif
    pub design_system: String,
    /// Persona mood
    pub persona_mood: String,
}

/// Snapshot complet
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Snapshot {
    /// Métadonnées
    pub metadata: SnapshotMetadata,
    /// Données chiffrées compressées
    pub encrypted_data: Vec<u8>,
    /// Signature Ed25519
    pub signature: Vec<u8>,
}

impl Snapshot {
    /// Créer nouveau snapshot
    pub fn new(data: Vec<u8>, context: SnapshotContext, description: String) -> Self {
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or(0);

        let sha256 = Self::calculate_hash(&data);
        let id = format!("{}-{}", timestamp, &sha256[..8]);

        let metadata = SnapshotMetadata {
            id: id.clone(),
            timestamp,
            version: env!("CARGO_PKG_VERSION").to_string(),
            sha256,
            compressed_size: data.len() as u64,
            uncompressed_size: 0, // Will be set during compression
            description,
            context,
        };

        Self {
            metadata,
            encrypted_data: data,
            signature: vec![],
        }
    }

    /// Calculer SHA-256
    fn calculate_hash(data: &[u8]) -> String {
        use sha2::{Digest, Sha256};
        let mut hasher = Sha256::new();
        hasher.update(data);
        format!("{:x}", hasher.finalize())
    }

    /// Obtenir chemin fichier snapshot
    pub fn get_path(&self, base_dir: &Path) -> PathBuf {
        base_dir.join(format!("{}.snapshot", self.metadata.id))
    }

    /// Obtenir chemin signature
    pub fn get_signature_path(&self, base_dir: &Path) -> PathBuf {
        base_dir.join(format!("{}.sig", self.metadata.id))
    }

    /// Vérifier signature
    pub fn verify_signature(&self, public_key: &[u8]) -> Result<(), String> {
        use ed25519_dalek::{Signature, Verifier, VerifyingKey};

        let public_array: [u8; 32] = public_key
            .try_into()
            .map_err(|_| "Invalid public key length".to_string())?;
        let public = VerifyingKey::from_bytes(&public_array)
            .map_err(|e| format!("Invalid public key: {}", e))?;

        let sig_array: [u8; 64] = self
            .signature
            .as_slice()
            .try_into()
            .map_err(|_| "Invalid signature length".to_string())?;
        let sig = Signature::from_bytes(&sig_array);

        let data = serde_json::to_vec(&self.metadata)
            .map_err(|e| format!("Failed to serialize metadata: {}", e))?;

        public
            .verify(&data, &sig)
            .map_err(|e| format!("Signature verification failed: {}", e))
    }
}

/// Index de snapshots
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SnapshotIndex {
    pub snapshots: Vec<SnapshotMetadata>,
}

impl SnapshotIndex {
    /// Charger index
    pub async fn load(path: &PathBuf) -> Result<Self, String> {
        if !path.exists() {
            return Ok(Self::default());
        }

        let data = tokio::fs::read(path)
            .await
            .map_err(|e| format!("Failed to read index: {}", e))?;

        serde_json::from_slice(&data).map_err(|e| format!("Failed to parse index: {}", e))
    }

    /// Sauvegarder index
    pub async fn save(&self, path: &PathBuf) -> Result<(), String> {
        let data = serde_json::to_vec_pretty(self)
            .map_err(|e| format!("Failed to serialize index: {}", e))?;

        tokio::fs::write(path, data)
            .await
            .map_err(|e| format!("Failed to write index: {}", e))
    }

    /// Ajouter snapshot
    pub fn add(&mut self, metadata: SnapshotMetadata) {
        self.snapshots.push(metadata);
        // Trier par timestamp décroissant
        self.snapshots.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
    }

    /// Supprimer snapshot
    pub fn remove(&mut self, id: &str) {
        self.snapshots.retain(|s| s.id != id);
    }

    /// Trouver snapshot par ID
    pub fn find(&self, id: &str) -> Option<&SnapshotMetadata> {
        self.snapshots.iter().find(|s| s.id == id)
    }

    /// Obtenir snapshots récents
    pub fn recent(&self, count: usize) -> Vec<&SnapshotMetadata> {
        self.snapshots.iter().take(count).collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    fn create_test_context() -> SnapshotContext {
        SnapshotContext {
            xp_total: 1000,
            level: 3,
            memory_files: 10,
            active_engines: vec!["Helios".to_string(), "Memory".to_string()],
            design_system: "v∞".to_string(),
            persona_mood: "focused".to_string(),
        }
    }

    fn create_test_metadata(id: &str, timestamp: u64) -> SnapshotMetadata {
        SnapshotMetadata {
            id: id.to_string(),
            timestamp,
            version: "1.0".to_string(),
            sha256: "abc123".to_string(),
            compressed_size: 100,
            uncompressed_size: 200,
            description: "Test snapshot".to_string(),
            context: create_test_context(),
        }
    }

    #[test]
    fn test_snapshot_creation() {
        let context = create_test_context();
        let snapshot = Snapshot::new(vec![1, 2, 3, 4], context, "Test snapshot".to_string());

        assert!(!snapshot.metadata.id.is_empty());
        assert_eq!(snapshot.metadata.compressed_size, 4);
        assert!(!snapshot.metadata.sha256.is_empty());
        assert_eq!(snapshot.metadata.description, "Test snapshot");
    }

    #[test]
    fn test_snapshot_id_format() {
        let context = create_test_context();
        let snapshot = Snapshot::new(vec![1, 2, 3], context, "Test".to_string());

        // ID should be timestamp-hash format
        assert!(snapshot.metadata.id.contains('-'));
        let parts: Vec<&str> = snapshot.metadata.id.split('-').collect();
        assert_eq!(parts.len(), 2);
        assert!(parts[0].parse::<u64>().is_ok()); // First part is timestamp
    }

    #[test]
    fn test_calculate_hash() {
        let data1 = vec![1, 2, 3, 4];
        let data2 = vec![1, 2, 3, 4];
        let data3 = vec![5, 6, 7, 8];

        let context = create_test_context();
        let snap1 = Snapshot::new(data1, context.clone(), "Test".to_string());
        let snap2 = Snapshot::new(data2, context.clone(), "Test".to_string());
        let snap3 = Snapshot::new(data3, context, "Test".to_string());

        // Same data should produce same hash
        assert_eq!(snap1.metadata.sha256, snap2.metadata.sha256);
        // Different data should produce different hash
        assert_ne!(snap1.metadata.sha256, snap3.metadata.sha256);
    }

    #[test]
    fn test_snapshot_get_path() {
        let context = create_test_context();
        let snapshot = Snapshot::new(vec![1, 2, 3], context, "Test".to_string());

        let base_dir = Path::new("/tmp/snapshots");
        let path = snapshot.get_path(base_dir);

        assert!(path.to_str().unwrap().starts_with("/tmp/snapshots"));
        assert!(path.to_str().unwrap().ends_with(".snapshot"));
        assert!(path.to_str().unwrap().contains(&snapshot.metadata.id));
    }

    #[test]
    fn test_snapshot_get_signature_path() {
        let context = create_test_context();
        let snapshot = Snapshot::new(vec![1, 2, 3], context, "Test".to_string());

        let base_dir = Path::new("/tmp/snapshots");
        let sig_path = snapshot.get_signature_path(base_dir);

        assert!(sig_path.to_str().unwrap().starts_with("/tmp/snapshots"));
        assert!(sig_path.to_str().unwrap().ends_with(".sig"));
    }

    #[test]
    fn test_snapshot_context_serialization() {
        let context = create_test_context();
        let json = serde_json::to_string(&context).unwrap();
        assert!(json.contains("xp_total"));
        assert!(json.contains("level"));
        assert!(json.contains("active_engines"));

        let deserialized: SnapshotContext = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.xp_total, 1000);
        assert_eq!(deserialized.level, 3);
    }

    #[test]
    fn test_snapshot_metadata_serialization() {
        let metadata = create_test_metadata("test-123", 1000);
        let json = serde_json::to_string(&metadata).unwrap();
        assert!(json.contains("test-123"));
        assert!(json.contains("sha256"));

        let deserialized: SnapshotMetadata = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.id, "test-123");
        assert_eq!(deserialized.timestamp, 1000);
    }

    #[test]
    fn test_snapshot_index_default() {
        let index = SnapshotIndex::default();
        assert_eq!(index.snapshots.len(), 0);
    }

    #[test]
    fn test_snapshot_index_add() {
        let mut index = SnapshotIndex::default();
        let meta1 = create_test_metadata("snap1", 1000);
        let meta2 = create_test_metadata("snap2", 2000);

        index.add(meta1);
        index.add(meta2);

        assert_eq!(index.snapshots.len(), 2);
        // Should be sorted by timestamp descending
        assert_eq!(index.snapshots[0].id, "snap2");
        assert_eq!(index.snapshots[1].id, "snap1");
    }

    #[test]
    fn test_snapshot_index_remove() {
        let mut index = SnapshotIndex::default();
        index.add(create_test_metadata("snap1", 1000));
        index.add(create_test_metadata("snap2", 2000));

        assert_eq!(index.snapshots.len(), 2);

        index.remove("snap1");
        assert_eq!(index.snapshots.len(), 1);
        assert!(index.find("snap1").is_none());
        assert!(index.find("snap2").is_some());
    }

    #[test]
    fn test_snapshot_index_find() {
        let mut index = SnapshotIndex::default();
        index.add(create_test_metadata("snap1", 1000));

        let found = index.find("snap1");
        assert!(found.is_some());
        assert_eq!(found.unwrap().id, "snap1");

        let not_found = index.find("nonexistent");
        assert!(not_found.is_none());
    }

    #[test]
    fn test_snapshot_index_recent() {
        let mut index = SnapshotIndex::default();
        index.add(create_test_metadata("snap1", 1000));
        index.add(create_test_metadata("snap2", 2000));
        index.add(create_test_metadata("snap3", 3000));
        index.add(create_test_metadata("snap4", 4000));

        let recent = index.recent(2);
        assert_eq!(recent.len(), 2);
        assert_eq!(recent[0].id, "snap4"); // Most recent first
        assert_eq!(recent[1].id, "snap3");
    }

    #[test]
    fn test_snapshot_index_recent_more_than_available() {
        let mut index = SnapshotIndex::default();
        index.add(create_test_metadata("snap1", 1000));

        let recent = index.recent(10);
        assert_eq!(recent.len(), 1);
    }

    #[tokio::test]
    async fn test_snapshot_index_save_and_load() {
        let temp_dir = TempDir::new().unwrap();
        let index_path = temp_dir.path().join("index.json");

        // Create and save index
        let mut index = SnapshotIndex::default();
        index.add(create_test_metadata("snap1", 1000));
        index.add(create_test_metadata("snap2", 2000));

        let save_result = index.save(&index_path).await;
        assert!(save_result.is_ok());

        // Load index
        let loaded = SnapshotIndex::load(&index_path).await.unwrap();
        assert_eq!(loaded.snapshots.len(), 2);
        assert!(loaded.find("snap1").is_some());
        assert!(loaded.find("snap2").is_some());
    }

    #[tokio::test]
    async fn test_snapshot_index_load_nonexistent() {
        let temp_dir = TempDir::new().unwrap();
        let index_path = temp_dir.path().join("nonexistent.json");

        let loaded = SnapshotIndex::load(&index_path).await.unwrap();
        assert_eq!(loaded.snapshots.len(), 0); // Should return default
    }

    #[test]
    fn test_verify_signature_invalid_public_key_length() {
        let context = create_test_context();
        let snapshot = Snapshot::new(vec![1, 2, 3], context, "Test".to_string());

        let invalid_key = vec![1, 2, 3]; // Too short
        let result = snapshot.verify_signature(&invalid_key);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Invalid public key length"));
    }

    #[test]
    fn test_verify_signature_invalid_signature_length() {
        let context = create_test_context();
        let mut snapshot = Snapshot::new(vec![1, 2, 3], context, "Test".to_string());
        snapshot.signature = vec![1, 2, 3]; // Too short

        let valid_key = vec![0u8; 32];
        let result = snapshot.verify_signature(&valid_key);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Invalid signature length"));
    }
}
