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
        Self::new_in_dir(Self::get_base_path(), master_key, keypair).await
    }

    /// Créer nouveau moteur dans un répertoire spécifique.
    ///
    /// Utile pour les tests afin d'éviter d'écrire dans le stockage utilisateur.
    pub async fn new_in_dir(
        base_path: PathBuf,
        master_key: &MasterKey,
        keypair: SigningKeypair,
    ) -> Result<Self, TravelError> {
        let crypto = Arc::new(CryptoEngine::new(master_key));

        // Créer dossiers
        tokio::fs::create_dir_all(&base_path)
            .await
            .map_err(|e| TravelError::IoError(e.to_string()))?;

        // Charger index
        let index_path = base_path.join("index.json");
        let index = SnapshotIndex::load(&index_path).await.unwrap_or_default();

        log::info!(
            "✅ TravelEngine initialized: {} snapshots",
            index.snapshots.len()
        );

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
        let encrypted = self
            .crypto
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
        let data = self
            .decrypt_and_decompress(&snapshot.encrypted_data)
            .await?;

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
        let compressed = self
            .crypto
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

        serde_json::from_slice(&data).map_err(|e| TravelError::SerializationError(e.to_string()))
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
        index.save(&path).await.map_err(TravelError::IoError)
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
    use crate::security::encryption::{MasterKey, MasterKeyGenerator};

    async fn create_test_engine() -> TravelEngine {
        let master_key = MasterKey::generate();
        let keypair = SigningKeypair::generate();
        let base_path = tempfile::Builder::new()
            .prefix("titane_travel_engine_test_")
            .tempdir()
            .expect("tempdir should create")
            .into_path();

        TravelEngine::new_in_dir(base_path, &master_key, keypair)
            .await
            .expect("travel engine should initialize")
    }

    fn create_test_context() -> SnapshotContext {
        SnapshotContext {
            xp_total: 1000,
            level: 3,
            memory_files: 10,
            active_engines: vec!["Helios".to_string()],
            design_system: "v∞".to_string(),
            persona_mood: "focused".to_string(),
        }
    }

    #[test]
    fn test_travel_error_display() {
        let err1 = TravelError::SnapshotNotFound("snap123".to_string());
        assert!(err1.to_string().contains("Snapshot not found"));

        let err2 = TravelError::CorruptedSnapshot("data corrupt".to_string());
        assert!(err2.to_string().contains("Corrupted snapshot"));

        let err3 = TravelError::InvalidSignature("sig fail".to_string());
        assert!(err3.to_string().contains("Invalid signature"));

        let err4 = TravelError::DecryptionFailed("decrypt fail".to_string());
        assert!(err4.to_string().contains("Decryption failed"));

        let err5 = TravelError::IoError("io fail".to_string());
        assert!(err5.to_string().contains("IO error"));

        let err6 = TravelError::SerializationError("ser fail".to_string());
        assert!(err6.to_string().contains("Serialization error"));
    }

    #[test]
    fn test_travel_error_is_error_trait() {
        let err = TravelError::IoError("test".to_string());
        let _: &dyn std::error::Error = &err;
    }

    #[tokio::test]
    async fn test_travel_engine_new() {
        let engine = create_test_engine().await;
        let stats = engine.stats().await;

        assert_eq!(stats.total_snapshots, 0);
        assert_eq!(stats.cached_in_ram, 0);
    }

    #[tokio::test]
    async fn test_create_snapshot() {
        let engine = create_test_engine().await;
        let context = create_test_context();
        let data = b"Test snapshot data".to_vec();

        let result = engine.create_snapshot(data, context, "Test snapshot".to_string()).await;
        assert!(result.is_ok());

        let id = result.unwrap();
        assert!(!id.is_empty());
    }

    #[tokio::test]
    async fn test_create_and_restore_snapshot() {
        let engine = create_test_engine().await;
        let context = create_test_context();
        let original_data = "TITANE INFINITY v∞ Time Travel Test".as_bytes().to_vec();

        // Create
        let id = engine
            .create_snapshot(original_data.clone(), context, "Round-trip test".to_string())
            .await
            .expect("snapshot creation should succeed");

        // Restore
        let restored_data = engine
            .restore_snapshot(&id)
            .await
            .expect("snapshot restore should succeed");

        assert_eq!(original_data, restored_data);
    }

    #[tokio::test]
    async fn test_restore_from_ram_cache() {
        let engine = create_test_engine().await;
        let context = create_test_context();
        let data = b"Cached snapshot".to_vec();

        let id = engine
            .create_snapshot(data.clone(), context, "Cache test".to_string())
            .await
            .unwrap();

        // First restore should be from RAM cache
        let restored = engine.restore_snapshot(&id).await.unwrap();
        assert_eq!(data, restored);

        // Second restore should also be from RAM cache (fast)
        let restored2 = engine.restore_snapshot(&id).await.unwrap();
        assert_eq!(data, restored2);
    }

    #[tokio::test]
    async fn test_restore_nonexistent_snapshot() {
        let engine = create_test_engine().await;

        let result = engine.restore_snapshot("nonexistent-id").await;
        assert!(result.is_err());

        match result.unwrap_err() {
            TravelError::SnapshotNotFound(id) => assert_eq!(id, "nonexistent-id"),
            _ => panic!("Expected SnapshotNotFound error"),
        }
    }

    #[tokio::test]
    async fn test_delete_snapshot() {
        let engine = create_test_engine().await;
        let context = create_test_context();
        let data = b"Delete test".to_vec();

        let id = engine
            .create_snapshot(data, context, "To be deleted".to_string())
            .await
            .unwrap();

        // Delete
        let result = engine.delete_snapshot(&id).await;
        assert!(result.is_ok());

        // Should not be able to restore
        let restore_result = engine.restore_snapshot(&id).await;
        assert!(restore_result.is_err());
    }

    #[tokio::test]
    async fn test_list_snapshots() {
        let engine = create_test_engine().await;
        let context = create_test_context();

        // Initially empty
        assert_eq!(engine.list_snapshots().await.len(), 0);

        // Create multiple snapshots
        for i in 0..3 {
            let data = format!("Snapshot {}", i).into_bytes();
            engine
                .create_snapshot(data, context.clone(), format!("Snapshot {}", i))
                .await
                .unwrap();
        }

        // Should list all
        let snapshots = engine.list_snapshots().await;
        assert_eq!(snapshots.len(), 3);
    }

    #[tokio::test]
    async fn test_recent_snapshots() {
        let engine = create_test_engine().await;
        let context = create_test_context();

        // Create 5 snapshots
        for i in 0..5 {
            let data = format!("Snapshot {}", i).into_bytes();
            engine
                .create_snapshot(data, context.clone(), format!("Snapshot {}", i))
                .await
                .unwrap();
            tokio::time::sleep(tokio::time::Duration::from_millis(10)).await;
        }

        // Get 3 most recent
        let recent = engine.recent_snapshots(3).await;
        assert_eq!(recent.len(), 3);

        // Should be sorted by timestamp descending (most recent first)
        assert!(recent[0].timestamp >= recent[1].timestamp);
        assert!(recent[1].timestamp >= recent[2].timestamp);
    }

    #[tokio::test]
    async fn test_ram_cache_limit() {
        let engine = create_test_engine().await;
        let context = create_test_context();

        // Create more snapshots than MAX_RAM_CACHE
        let mut ids = Vec::new();
        for i in 0..5 {
            let data = format!("Snapshot {}", i).into_bytes();
            let id = engine
                .create_snapshot(data, context.clone(), format!("Snapshot {}", i))
                .await
                .unwrap();
            ids.push(id);
        }

        // Cache should have at most MAX_RAM_CACHE entries
        let stats = engine.stats().await;
        assert!(stats.cached_in_ram <= MAX_RAM_CACHE);
    }

    #[tokio::test]
    async fn test_compress_decompress() {
        let engine = create_test_engine().await;
        // Use highly-compressible input; small/entropy-rich strings can become larger with gzip headers.
        let original = vec![b'a'; 4096];

        let compressed = engine.compress(&original).await.unwrap();
        assert!(compressed.len() < original.len()); // Should be compressed

        let decompressed = engine.decompress(&compressed).await.unwrap();
        assert_eq!(original, decompressed);
    }

    #[tokio::test]
    async fn test_compress_empty_data() {
        let engine = create_test_engine().await;
        let empty = Vec::new();

        let result = engine.compress(&empty).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_stats_initial() {
        let engine = create_test_engine().await;
        let stats = engine.stats().await;

        assert_eq!(stats.total_snapshots, 0);
        assert_eq!(stats.cached_in_ram, 0);
        assert_eq!(stats.total_size_bytes, 0);
        assert!(stats.oldest_timestamp.is_none());
        assert!(stats.newest_timestamp.is_none());
    }

    #[tokio::test]
    async fn test_stats_after_snapshots() {
        let engine = create_test_engine().await;
        let context = create_test_context();

        // Create snapshots
        for i in 0..3 {
            let data = format!("Data {}", i).into_bytes();
            engine
                .create_snapshot(data, context.clone(), format!("Snap {}", i))
                .await
                .unwrap();
        }

        let stats = engine.stats().await;
        assert_eq!(stats.total_snapshots, 3);
        assert!(stats.cached_in_ram <= MAX_RAM_CACHE);
        assert!(stats.total_size_bytes > 0);
        assert!(stats.oldest_timestamp.is_some());
        assert!(stats.newest_timestamp.is_some());
    }

    #[tokio::test]
    async fn test_travel_stats_serialization() {
        let stats = TravelStats {
            total_snapshots: 10,
            cached_in_ram: 3,
            total_size_bytes: 1024000,
            oldest_timestamp: Some(1000),
            newest_timestamp: Some(2000),
        };

        let json = serde_json::to_string(&stats).unwrap();
        assert!(json.contains("10"));
        assert!(json.contains("1024000"));

        let deserialized: TravelStats = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.total_snapshots, 10);
        assert_eq!(deserialized.cached_in_ram, 3);
        assert_eq!(deserialized.total_size_bytes, 1024000);
    }

    #[tokio::test]
    async fn test_multiple_create_restore_cycle() {
        let engine = create_test_engine().await;
        let context = create_test_context();

        for i in 0..5 {
            let data = format!("Cycle {}", i).into_bytes();
            let id = engine
                .create_snapshot(data.clone(), context.clone(), format!("Cycle {}", i))
                .await
                .unwrap();

            let restored = engine.restore_snapshot(&id).await.unwrap();
            assert_eq!(data, restored);
        }
    }

    #[tokio::test]
    async fn test_snapshot_metadata_in_list() {
        let engine = create_test_engine().await;
        let context = create_test_context();

        let id = engine
            .create_snapshot(
                b"Test".to_vec(),
                context,
                "Test description".to_string(),
            )
            .await
            .unwrap();

        let snapshots = engine.list_snapshots().await;
        let found = snapshots.iter().find(|s| s.id == id);

        assert!(found.is_some());
        let metadata = found.unwrap();
        assert_eq!(metadata.description, "Test description");
        assert_eq!(metadata.version, env!("CARGO_PKG_VERSION"));
    }

    #[tokio::test]
    async fn test_delete_nonexistent_snapshot() {
        let engine = create_test_engine().await;

        // Should not error when deleting nonexistent
        let result = engine.delete_snapshot("nonexistent").await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_ram_cache_after_restore() {
        let engine = create_test_engine().await;
        let context = create_test_context();

        // Create snapshot
        let id = engine
            .create_snapshot(b"Cache test".to_vec(), context.clone(), "Test".to_string())
            .await
            .unwrap();

        // Clear cache by creating many more snapshots
        for i in 0..10 {
            let data = format!("Filler {}", i).into_bytes();
            engine
                .create_snapshot(data, context.clone(), format!("Filler {}", i))
                .await
                .unwrap();
        }

        // Restore should load from disk and add to cache
        let _ = engine.restore_snapshot(&id).await.unwrap();

        let stats = engine.stats().await;
        assert!(stats.cached_in_ram > 0);
    }

    #[tokio::test]
    async fn test_snapshot_size_tracking() {
        let engine = create_test_engine().await;
        let context = create_test_context();

        let large_data = vec![0u8; 10000]; // 10KB
        engine
            .create_snapshot(large_data, context, "Large snapshot".to_string())
            .await
            .unwrap();

        let stats = engine.stats().await;
        assert!(stats.total_size_bytes > 0);
    }

    #[tokio::test]
    async fn test_constants() {
        assert_eq!(MAX_RAM_CACHE, 3);
        assert_eq!(SNAPSHOT_DIR, "vault/snapshots");
    }
}
