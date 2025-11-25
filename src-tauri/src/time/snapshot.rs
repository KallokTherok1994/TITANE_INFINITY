// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   SNAPSHOT — Super-Prompt N
//   Structure de snapshot immutable
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::path::PathBuf;

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
    pub fn new(
        data: Vec<u8>,
        context: SnapshotContext,
        description: String,
    ) -> Self {
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
    pub fn get_path(&self, base_dir: &PathBuf) -> PathBuf {
        base_dir.join(format!("{}.snapshot", self.metadata.id))
    }

    /// Obtenir chemin signature
    pub fn get_signature_path(&self, base_dir: &PathBuf) -> PathBuf {
        base_dir.join(format!("{}.sig", self.metadata.id))
    }

    /// Vérifier signature
    pub fn verify_signature(&self, public_key: &[u8]) -> Result<(), String> {
        use ed25519_dalek::{PublicKey, Signature, Verifier};

        let public = PublicKey::from_bytes(public_key)
            .map_err(|e| format!("Invalid public key: {}", e))?;

        let sig = Signature::from_bytes(&self.signature)
            .map_err(|e| format!("Invalid signature: {}", e))?;

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

        serde_json::from_slice(&data)
            .map_err(|e| format!("Failed to parse index: {}", e))
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

    #[test]
    fn test_snapshot_creation() {
        let context = SnapshotContext {
            xp_total: 1000,
            level: 3,
            memory_files: 10,
            active_engines: vec!["Helios".to_string(), "Memory".to_string()],
            design_system: "v∞".to_string(),
            persona_mood: "focused".to_string(),
        };

        let snapshot = Snapshot::new(
            vec![1, 2, 3, 4],
            context,
            "Test snapshot".to_string(),
        );

        assert!(!snapshot.metadata.id.is_empty());
        assert_eq!(snapshot.metadata.compressed_size, 4);
    }

    #[test]
    fn test_snapshot_index() {
        let mut index = SnapshotIndex::default();

        let meta1 = SnapshotMetadata {
            id: "snap1".to_string(),
            timestamp: 1000,
            version: "1.0".to_string(),
            sha256: "abc".to_string(),
            compressed_size: 100,
            uncompressed_size: 200,
            description: "First".to_string(),
            context: SnapshotContext {
                xp_total: 0,
                level: 1,
                memory_files: 0,
                active_engines: vec![],
                design_system: "v1".to_string(),
                persona_mood: "calm".to_string(),
            },
        };

        index.add(meta1);
        assert_eq!(index.snapshots.len(), 1);
        assert!(index.find("snap1").is_some());
    }
}
