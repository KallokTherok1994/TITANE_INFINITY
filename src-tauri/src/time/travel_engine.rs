// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   TRAVEL ENGINE — Super-Prompt N
//   Time-Travel complet avec rollback court et profond
// ═══════════════════════════════════════════════════════════════

use super::snapshot::{Snapshot, SnapshotContext, SnapshotIndex, SnapshotMetadata};
use crate::security::encryption::{CryptoEngine, MasterKey, SigningKeypair};
use std::collections::VecDeque;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::RwLock;

const MAX_RAM_CACHE: usize = 3; // 3 derniers snapshots en RAM
const SNAPSHOT_DIR: &str = "vault/snapshots";

/// Erreurs Time-Travel
#[derive(Debug, Clone)]
pub enum TravelError {
    SnapshotNotFound(String),
    CorruptedSnapshot(String),
    InvalidSignature(String),
    DecryptionFailed(String),
    IoError(String),
    SerializationError(String),
}

impl std::fmt::Display for TravelError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            TravelError::SnapshotNotFound(id) => write!(f, "Snapshot not found: {}", id),
            TravelError::CorruptedSnapshot(msg) => write!(f, "Corrupted snapshot: {}", msg),
            TravelError::InvalidSignature(msg) => write!(f, "Invalid signature: {}", msg),
            TravelError::DecryptionFailed(msg) => write!(f, "Decryption failed: {}", msg),
            TravelError::IoError(msg) => write!(f, "IO error: {}", msg),
            TravelError::SerializationError(msg) => write!(f, "Serialization error: {}", msg),
        }
    }
}

impl std::error::Error for TravelError {}

/// Moteur Time-Travel
pub struct TravelEngine {
    /// Cache RAM (rollback court < 15ms)
    ram_cache: Arc<RwLock<VecDeque<Snapshot>>>,
    /// Index des snapshots disque
    index: Arc<RwLock<SnapshotIndex>>,
    /// Chemin base snapshots
    base_path: PathBuf,
    /// Moteur crypto
    crypto: Arc<CryptoEngine>,
    /// Keypair signatures
    keypair: Arc<SigningKeypair>,
}

impl TravelEngine {
    /// Créer nouveau moteur
    pub async fn new(master_key: &MasterKey, keypair: SigningKeypair) -> Result<Self, TravelError> {
        let base_path = Self::get_base_path();
        let crypto = Arc::new(CryptoEngine::new(master_key));

        // Créer dossiers
        tokio::fs::create_dir_all(&base_path)
            .await
            .map_err(|e| TravelError::IoError(e.to_string()))?;

        // Charger index
        let index_path = base_path.join("index.json");
        let index = SnapshotIndex::load(&index_path)
            .await
            .unwrap_or_default();

        log::info!("✅ TravelEngine initialized: {} snapshots", index.snapshots.len());

        Ok(Self {
            ram_cache: Arc::new(RwLock::new(VecDeque::new())),
            index: Arc::new(RwLock::new(index)),
            base_path,
            crypto,
            keypair: Arc::new(keypair),
        })
    }

    /// Créer snapshot
    pub async fn create_snapshot(
        &self,
        data: Vec<u8>,
        context: SnapshotContext,
        description: String,
    ) -> Result<String, TravelError> {
        log::info!("📸 Creating snapshot: {}", description);

        // Compresser données
        let compressed = self.compress(&data).await?;

        // Chiffrer
        let encrypted = self.crypto
            .encrypt(&compressed)
            .map_err(|e| TravelError::DecryptionFailed(e.to_string()))?;

        // Créer snapshot
        let mut snapshot = Snapshot::new(encrypted, context, description);

        // Signer
        let metadata_bytes = serde_json::to_vec(&snapshot.metadata)
            .map_err(|e| TravelError::SerializationError(e.to_string()))?;
        snapshot.signature = self.keypair.sign(&metadata_bytes);

        // Sauvegarder sur disque
        self.save_snapshot(&snapshot).await?;

        // Ajouter à l'index
        let mut index = self.index.write().await;
        index.add(snapshot.metadata.clone());
        self.save_index(&index).await?;

        // Ajouter au cache RAM
        let mut cache = self.ram_cache.write().await;
        cache.push_back(snapshot.clone());
        if cache.len() > MAX_RAM_CACHE {
            cache.pop_front();
        }

        log::info!("✅ Snapshot created: {}", snapshot.metadata.id);
        Ok(snapshot.metadata.id.clone())
    }

    /// Restaurer snapshot (rollback)
    pub async fn restore_snapshot(&self, id: &str) -> Result<Vec<u8>, TravelError> {
        log::info!("⏮️ Restoring snapshot: {}", id);

        // Chercher dans cache RAM d'abord (rollback court)
        {
            let cache = self.ram_cache.read().await;
            if let Some(snapshot) = cache.iter().find(|s| s.metadata.id == id) {
                log::debug!("✅ Found in RAM cache (< 15ms)");
                return self.decrypt_and_decompress(&snapshot.encrypted_data).await;
            }
        }

        // Sinon charger depuis disque (rollback profond)
        log::debug!("Loading from disk...");
        let snapshot = self.load_snapshot(id).await?;

        // Vérifier signature
        self.verify_snapshot(&snapshot).await?;

        // Déchiffrer et décompresser
        let data = self.decrypt_and_decompress(&snapshot.encrypted_data).await?;

        // Ajouter au cache RAM pour futurs accès rapides
        let mut cache = self.ram_cache.write().await;
        cache.push_back(snapshot);
        if cache.len() > MAX_RAM_CACHE {
            cache.pop_front();
        }

        log::info!("✅ Snapshot restored: {}", id);
        Ok(data)
    }

    /// Supprimer snapshot
    pub async fn delete_snapshot(&self, id: &str) -> Result<(), TravelError> {
        log::info!("🗑️ Deleting snapshot: {}", id);

        // Supprimer fichier
        let path = self.base_path.join(format!("{}.snapshot", id));
        if path.exists() {
            tokio::fs::remove_file(&path)
                .await
                .map_err(|e| TravelError::IoError(e.to_string()))?;
        }

        // Supprimer signature
        let sig_path = self.base_path.join(format!("{}.sig", id));
        if sig_path.exists() {
            tokio::fs::remove_file(&sig_path)
                .await
                .map_err(|e| TravelError::IoError(e.to_string()))?;
        }

        // Retirer de l'index
        let mut index = self.index.write().await;
        index.remove(id);
        self.save_index(&index).await?;

        // Retirer du cache RAM
        let mut cache = self.ram_cache.write().await;
        cache.retain(|s| s.metadata.id != id);

        log::info!("✅ Snapshot deleted: {}", id);
        Ok(())
    }

    /// Lister snapshots
    pub async fn list_snapshots(&self) -> Vec<SnapshotMetadata> {
        let index = self.index.read().await;
        index.snapshots.clone()
    }

    /// Obtenir snapshot récents
    pub async fn recent_snapshots(&self, count: usize) -> Vec<SnapshotMetadata> {
        let index = self.index.read().await;
        index.recent(count).into_iter().cloned().collect()
    }

    /// Compresser données
    async fn compress(&self, data: &[u8]) -> Result<Vec<u8>, TravelError> {
        // Simple compression avec flate2
        use flate2::write::GzEncoder;
        use flate2::Compression;
        use std::io::Write;

        let mut encoder = GzEncoder::new(Vec::new(), Compression::best());
        encoder
            .write_all(data)
            .map_err(|e| TravelError::IoError(e.to_string()))?;
        encoder
            .finish()
            .map_err(|e| TravelError::IoError(e.to_string()))
    }

    /// Décompresser données
    async fn decompress(&self, data: &[u8]) -> Result<Vec<u8>, TravelError> {
        use flate2::read::GzDecoder;
        use std::io::Read;

        let mut decoder = GzDecoder::new(data);
        let mut decompressed = Vec::new();
        decoder
            .read_to_end(&mut decompressed)
            .map_err(|e| TravelError::IoError(e.to_string()))?;
        Ok(decompressed)
    }

    /// Déchiffrer et décompresser
    async fn decrypt_and_decompress(&self, encrypted: &[u8]) -> Result<Vec<u8>, TravelError> {
        // Déchiffrer
        let compressed = self.crypto
            .decrypt(encrypted)
            .map_err(|e| TravelError::DecryptionFailed(e.to_string()))?;

        // Décompresser
        self.decompress(&compressed).await
    }

    /// Sauvegarder snapshot sur disque
    async fn save_snapshot(&self, snapshot: &Snapshot) -> Result<(), TravelError> {
        let path = snapshot.get_path(&self.base_path);
        let sig_path = snapshot.get_signature_path(&self.base_path);

        // Sauvegarder données
        let data = serde_json::to_vec(snapshot)
            .map_err(|e| TravelError::SerializationError(e.to_string()))?;
        tokio::fs::write(&path, data)
            .await
            .map_err(|e| TravelError::IoError(e.to_string()))?;

        // Sauvegarder signature séparément
        tokio::fs::write(&sig_path, &snapshot.signature)
            .await
            .map_err(|e| TravelError::IoError(e.to_string()))?;

        Ok(())
    }

    /// Charger snapshot depuis disque
    async fn load_snapshot(&self, id: &str) -> Result<Snapshot, TravelError> {
        let path = self.base_path.join(format!("{}.snapshot", id));

        if !path.exists() {
            return Err(TravelError::SnapshotNotFound(id.to_string()));
        }

        let data = tokio::fs::read(&path)
            .await
            .map_err(|e| TravelError::IoError(e.to_string()))?;

        serde_json::from_slice(&data)
            .map_err(|e| TravelError::SerializationError(e.to_string()))
    }

    /// Vérifier signature snapshot
    async fn verify_snapshot(&self, snapshot: &Snapshot) -> Result<(), TravelError> {
        let public_key = self.keypair.public_key_bytes();
        snapshot
            .verify_signature(&public_key)
            .map_err(TravelError::InvalidSignature)
    }

    /// Sauvegarder index
    async fn save_index(&self, index: &SnapshotIndex) -> Result<(), TravelError> {
        let path = self.base_path.join("index.json");
        index
            .save(&path)
            .await
            .map_err(TravelError::IoError)
    }

    /// Obtenir chemin base
    fn get_base_path() -> PathBuf {
        dirs::data_local_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("titane_infinity")
            .join(SNAPSHOT_DIR)
    }

    /// Statistiques
    pub async fn stats(&self) -> TravelStats {
        let index = self.index.read().await;
        let cache = self.ram_cache.read().await;

        let total_size: u64 = index.snapshots.iter().map(|s| s.compressed_size).sum();

        TravelStats {
            total_snapshots: index.snapshots.len(),
            cached_in_ram: cache.len(),
            total_size_bytes: total_size,
            oldest_timestamp: index.snapshots.last().map(|s| s.timestamp),
            newest_timestamp: index.snapshots.first().map(|s| s.timestamp),
        }
    }
}

/// Statistiques Time-Travel
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct TravelStats {
    pub total_snapshots: usize,
    pub cached_in_ram: usize,
    pub total_size_bytes: u64,
    pub oldest_timestamp: Option<u64>,
    pub newest_timestamp: Option<u64>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::security::encryption::MasterKey;

    #[tokio::test]
    async fn test_travel_engine() {
        let master_key = MasterKey::generate();
        let keypair = SigningKeypair::generate();
        let engine = TravelEngine::new(&master_key, keypair).await.unwrap();

        let context = SnapshotContext {
            xp_total: 1000,
            level: 3,
            memory_files: 10,
            active_engines: vec!["Helios".to_string()],
            design_system: "v∞".to_string(),
            persona_mood: "focused".to_string(),
        };

        let data = "TITANE INFINITY v∞".as_bytes().to_vec();
        let id = engine
            .create_snapshot(data.clone(), context, "Test".to_string())
            .await
            .unwrap();

        // Restaurer
        let restored = engine.restore_snapshot(&id).await.unwrap();
        assert_eq!(data, restored);

        // Supprimer
        engine.delete_snapshot(&id).await.unwrap();
    }
}
