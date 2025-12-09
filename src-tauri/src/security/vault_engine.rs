// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   MEMORY VAULT ENGINE — Super-Prompt J3
//   Auto-chiffrement transparent de toute la persistence
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
use super::encryption::MasterKeyGenerator;
use super::encryption::{CryptoEngine, MasterKey};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::path::PathBuf;
use std::sync::Arc;
use tokio::fs;
use tokio::sync::RwLock;

/// Macro for safe mutex locking with auto-recovery
#[allow(unused_macros)]
macro_rules! lock_or_recover {
    ($mutex:expr) => {
        $mutex.lock().unwrap_or_else(|poisoned| {
            log::error!("[VaultEngine] CRITICAL: Mutex poisoned, recovering...");
            poisoned.into_inner()
        })
    };
}


const VAULT_DIR: &str = "vault/encrypted";
const CHECKSUM_SUFFIX: &str = ".sha256";

/// Erreurs Memory Vault
#[derive(Debug, Clone)]
pub enum VaultError {
    EncryptionFailed(String),
    DecryptionFailed(String),
    CorruptionDetected(String),
    IoError(String),
    SerializationError(String),
}

impl std::fmt::Display for VaultError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            VaultError::EncryptionFailed(e) => write!(f, "Encryption failed: {}", e),
            VaultError::DecryptionFailed(e) => write!(f, "Decryption failed: {}", e),
            VaultError::CorruptionDetected(e) => write!(f, "Corruption detected: {}", e),
            VaultError::IoError(e) => write!(f, "IO error: {}", e),
            VaultError::SerializationError(e) => write!(f, "Serialization error: {}", e),
        }
    }
}

impl std::error::Error for VaultError {}

/// Métadonnées vault
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VaultMetadata {
    pub file_id: String,
    pub original_size: usize,
    pub encrypted_size: usize,
    pub checksum: String,
    pub timestamp: u64,
    pub version: String,
}

/// Memory Vault Engine - Chiffrement transparent
pub struct VaultEngine {
    crypto: Arc<CryptoEngine>,
    base_path: PathBuf,
    metadata_index: Arc<RwLock<Vec<VaultMetadata>>>,
}

impl VaultEngine {
    /// Créer nouveau VaultEngine
    pub async fn new(master_key: &MasterKey) -> Result<Self, VaultError> {
        let crypto = Arc::new(CryptoEngine::new(master_key));
        let base_path = PathBuf::from(VAULT_DIR);

        // Créer dossier vault
        fs::create_dir_all(&base_path)
            .await
            .map_err(|e| VaultError::IoError(e.to_string()))?;

        // Charger index existant
        let metadata_index = Arc::new(RwLock::new(Vec::new()));

        Ok(Self {
            crypto,
            base_path,
            metadata_index,
        })
    }

    /// Sauvegarder données chiffrées (avec compression LZMA optionnelle)
    pub async fn save<T: Serialize>(
        &self,
        file_id: &str,
        data: &T,
    ) -> Result<VaultMetadata, VaultError> {
        // 1. Sérialiser
        let json =
            serde_json::to_vec(data).map_err(|e| VaultError::SerializationError(e.to_string()))?;

        let original_size = json.len();

        // 2. Compresser si > 1KB (LZMA serait mieux mais flate2 suffit pour v1)
        let compressed = if json.len() > 1024 {
            use flate2::write::GzEncoder;
            use flate2::Compression;
            use std::io::Write;

            let mut encoder = GzEncoder::new(Vec::new(), Compression::best());
            encoder
                .write_all(&json)
                .map_err(|e| VaultError::EncryptionFailed(format!("Compression: {}", e)))?;
            encoder
                .finish()
                .map_err(|e| VaultError::EncryptionFailed(format!("Compression finish: {}", e)))?
        } else {
            json
        };

        // 3. Chiffrer
        let encrypted = self
            .crypto
            .encrypt(&compressed)
            .map_err(|e| VaultError::EncryptionFailed(e.to_string()))?;

        let encrypted_size = encrypted.len();

        // 4. Calculer checksum
        let mut hasher = Sha256::new();
        hasher.update(&encrypted);
        let checksum = format!("{:x}", hasher.finalize());

        // 5. Sauvegarder fichier chiffré
        let file_path = self.get_file_path(file_id);
        fs::write(&file_path, &encrypted)
            .await
            .map_err(|e| VaultError::IoError(e.to_string()))?;

        // 6. Sauvegarder checksum
        let checksum_path = self.get_checksum_path(file_id);
        fs::write(&checksum_path, &checksum)
            .await
            .map_err(|e| VaultError::IoError(e.to_string()))?;

        // 7. Créer metadata
        let metadata = VaultMetadata {
            file_id: file_id.to_string(),
            original_size,
            encrypted_size,
            checksum: checksum.clone(),
            timestamp: self.current_timestamp(),
            version: "v∞".to_string(),
        };

        // 8. Mettre à jour index
        let mut index = self.metadata_index.write().await;
        index.retain(|m| m.file_id != file_id);
        index.push(metadata.clone());

        log::info!(
            "✅ [VAULT] Saved encrypted: {} ({} → {} bytes)",
            file_id,
            original_size,
            encrypted_size
        );

        Ok(metadata)
    }

    /// Charger données déchiffrées (avec vérification intégrité)
    pub async fn load<T: for<'de> Deserialize<'de>>(&self, file_id: &str) -> Result<T, VaultError> {
        let file_path = self.get_file_path(file_id);
        let checksum_path = self.get_checksum_path(file_id);

        // 1. Charger fichier chiffré
        let encrypted = fs::read(&file_path)
            .await
            .map_err(|e| VaultError::IoError(format!("Read encrypted: {}", e)))?;

        // 2. Vérifier checksum (Memory Guard)
        let expected_checksum = fs::read_to_string(&checksum_path)
            .await
            .map_err(|e| VaultError::IoError(format!("Read checksum: {}", e)))?;

        let mut hasher = Sha256::new();
        hasher.update(&encrypted);
        let actual_checksum = format!("{:x}", hasher.finalize());

        if actual_checksum != expected_checksum {
            return Err(VaultError::CorruptionDetected(format!(
                "Checksum mismatch for {}: expected {}, got {}",
                file_id, expected_checksum, actual_checksum
            )));
        }

        // 3. Déchiffrer
        let compressed = self
            .crypto
            .decrypt(&encrypted)
            .map_err(|e| VaultError::DecryptionFailed(e.to_string()))?;

        // 4. Décompresser (si compressé)
        let json = if compressed.len() > 10 && compressed[0..2] == [0x1f, 0x8b] {
            // Magic bytes GZip détecté
            use flate2::read::GzDecoder;
            use std::io::Read;

            let mut decoder = GzDecoder::new(&compressed[..]);
            let mut decompressed = Vec::new();
            decoder
                .read_to_end(&mut decompressed)
                .map_err(|e| VaultError::DecryptionFailed(format!("Decompression: {}", e)))?;
            decompressed
        } else {
            compressed
        };

        // 5. Désérialiser
        let data: T = serde_json::from_slice(&json)
            .map_err(|e| VaultError::SerializationError(e.to_string()))?;

        log::info!("✅ [VAULT] Loaded decrypted: {}", file_id);

        Ok(data)
    }

    /// Supprimer fichier chiffré
    pub async fn delete(&self, file_id: &str) -> Result<(), VaultError> {
        let file_path = self.get_file_path(file_id);
        let checksum_path = self.get_checksum_path(file_id);

        // Supprimer fichier et checksum
        if file_path.exists() {
            fs::remove_file(&file_path)
                .await
                .map_err(|e| VaultError::IoError(e.to_string()))?;
        }
        if checksum_path.exists() {
            fs::remove_file(&checksum_path)
                .await
                .map_err(|e| VaultError::IoError(e.to_string()))?;
        }

        // Retirer de l'index
        let mut index = self.metadata_index.write().await;
        index.retain(|m| m.file_id != file_id);

        log::info!("🗑️  [VAULT] Deleted: {}", file_id);

        Ok(())
    }

    /// Lister tous les fichiers chiffrés
    pub async fn list_files(&self) -> Vec<VaultMetadata> {
        self.metadata_index.read().await.clone()
    }

    /// Vérifier intégrité complète du vault
    pub async fn verify_integrity(&self) -> Result<Vec<String>, VaultError> {
        let mut corrupted = Vec::new();
        let index = self.metadata_index.read().await.clone();

        for metadata in index {
            if let Err(e) = self.verify_file_integrity(&metadata.file_id).await {
                corrupted.push(format!("{}: {}", metadata.file_id, e));
            }
        }

        if corrupted.is_empty() {
            log::info!("✅ [VAULT] Integrity check: ALL OK");
        } else {
            log::error!("❌ [VAULT] Corrupted files: {}", corrupted.len());
        }

        Ok(corrupted)
    }

    /// Vérifier intégrité d'un fichier spécifique
    async fn verify_file_integrity(&self, file_id: &str) -> Result<(), VaultError> {
        let file_path = self.get_file_path(file_id);
        let checksum_path = self.get_checksum_path(file_id);

        let encrypted = fs::read(&file_path)
            .await
            .map_err(|e| VaultError::IoError(e.to_string()))?;

        let expected_checksum = fs::read_to_string(&checksum_path)
            .await
            .map_err(|e| VaultError::IoError(e.to_string()))?;

        let mut hasher = Sha256::new();
        hasher.update(&encrypted);
        let actual_checksum = format!("{:x}", hasher.finalize());

        if actual_checksum != expected_checksum {
            return Err(VaultError::CorruptionDetected(format!(
                "Checksum mismatch: {} != {}",
                actual_checksum, expected_checksum
            )));
        }

        Ok(())
    }

    /// Statistiques vault
    pub async fn stats(&self) -> VaultStats {
        let index = self.metadata_index.read().await;
        let total_files = index.len();
        let total_original: usize = index.iter().map(|m| m.original_size).sum();
        let total_encrypted: usize = index.iter().map(|m| m.encrypted_size).sum();
        let compression_ratio = if total_original > 0 {
            (total_encrypted as f64 / total_original as f64) * 100.0
        } else {
            100.0
        };

        VaultStats {
            total_files,
            total_original_bytes: total_original,
            total_encrypted_bytes: total_encrypted,
            compression_ratio,
        }
    }

    // === Helpers ===

    fn get_file_path(&self, file_id: &str) -> PathBuf {
        self.base_path.join(format!("{}.enc", file_id))
    }

    fn get_checksum_path(&self, file_id: &str) -> PathBuf {
        self.base_path
            .join(format!("{}.enc{}", file_id, CHECKSUM_SUFFIX))
    }

    fn current_timestamp(&self) -> u64 {
        use std::time::{SystemTime, UNIX_EPOCH};
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or(0)
    }
}

/// Statistiques vault
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VaultStats {
    pub total_files: usize,
    pub total_original_bytes: usize,
    pub total_encrypted_bytes: usize,
    pub compression_ratio: f64,
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_vault_save_load() -> Result<(), Box<dyn std::error::Error>> {
        // Phase 1 Stabilisation: Tests avec ? au lieu de unwrap()
        let master_key = MasterKey::generate();
        let vault = VaultEngine::new(&master_key).await?;

        #[derive(Serialize, Deserialize, Debug, PartialEq)]
        struct TestData {
            message: String,
            count: i32,
        }

        let data = TestData {
            message: "TITANE INFINITY v∞".to_string(),
            count: 42,
        };

        // Save
        let metadata = vault.save("test_data", &data).await?;
        assert_eq!(metadata.file_id, "test_data");
        assert!(metadata.encrypted_size > 0);

        // Load
        let loaded: TestData = vault.load("test_data").await?;
        assert_eq!(loaded, data);
        
        Ok(())
    }

    #[tokio::test]
    async fn test_vault_corruption_detection() -> Result<(), Box<dyn std::error::Error>> {
        // Phase 1 Stabilisation: Tests avec ? au lieu de unwrap()
        let master_key = MasterKey::generate();
        let vault = VaultEngine::new(&master_key).await?;

        let data = vec!["test", "data"];
        vault.save("corrupt_test", &data).await?;

        // Corrompre le fichier
        let file_path = vault.get_file_path("corrupt_test");
        let mut content = fs::read(&file_path).await?;
        content[0] ^= 0xFF; // Flip bits
        fs::write(&file_path, content).await?;

        // Doit détecter corruption
        let result: Result<Vec<String>, _> = vault.load("corrupt_test").await;
        assert!(result.is_err());
        assert!(matches!(
            result.unwrap_err(),
            VaultError::CorruptionDetected(_)
        ));
        
        Ok(())
    }

    #[tokio::test]
    async fn test_vault_integrity_check() -> Result<(), Box<dyn std::error::Error>> {
        // Phase 1 Stabilisation: Tests avec ? au lieu de unwrap()
        let master_key = MasterKey::generate();
        let vault = VaultEngine::new(&master_key).await?;

        vault.save("file1", &"data1").await?;
        vault.save("file2", &"data2").await?;

        let corrupted = vault.verify_integrity().await?;
        assert_eq!(corrupted.len(), 0);
        
        Ok(())
    }
}
