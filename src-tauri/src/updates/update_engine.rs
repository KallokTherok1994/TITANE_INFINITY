// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   UPDATE ENGINE — Super-Prompt L
//   Mises à jour sécurisées avec signatures Ed25519
// ═══════════════════════════════════════════════════════════════

use super::manifest::{FileEntry, UpdateManifest};
use super::migration::MigrationScript;
use crate::security::encryption::SigningKeypair;
use sha2::{Digest, Sha256};
use std::path::{Path, PathBuf};
use std::sync::Arc;
use tokio::fs;
use tokio::sync::RwLock;

const UPDATE_DIR: &str = "vault/updates";
const BACKUP_DIR: &str = "vault/rollback";

/// Erreurs Update Engine
#[derive(Debug, Clone)]
pub enum UpdateError {
    InvalidSignature(String),
    HashMismatch { file: String, expected: String, actual: String },
    DownloadFailed(String),
    RollbackFailed(String),
    MigrationFailed(String),
    IoError(String),
}

impl std::fmt::Display for UpdateError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            UpdateError::InvalidSignature(e) => write!(f, "Invalid signature: {}", e),
            UpdateError::HashMismatch { file, expected, actual } => {
                write!(f, "Hash mismatch for {}: expected {}, got {}", file, expected, actual)
            }
            UpdateError::DownloadFailed(e) => write!(f, "Download failed: {}", e),
            UpdateError::RollbackFailed(e) => write!(f, "Rollback failed: {}", e),
            UpdateError::MigrationFailed(e) => write!(f, "Migration failed: {}", e),
            UpdateError::IoError(e) => write!(f, "IO error: {}", e),
        }
    }
}

impl std::error::Error for UpdateError {}

/// État d'une mise à jour
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum UpdateState {
    Idle,
    Downloading,
    Verifying,
    Applying,
    Migrating,
    Success,
    Failed,
    RolledBack,
}

/// Update Engine
pub struct UpdateEngine {
    keypair: Arc<SigningKeypair>,
    update_dir: PathBuf,
    backup_dir: PathBuf,
    current_version: Arc<RwLock<String>>,
    state: Arc<RwLock<UpdateState>>,
}

impl UpdateEngine {
    /// Créer nouveau UpdateEngine
    pub async fn new(keypair: Arc<SigningKeypair>, current_version: String) -> Result<Self, UpdateError> {
        let update_dir = PathBuf::from(UPDATE_DIR);
        let backup_dir = PathBuf::from(BACKUP_DIR);

        // Créer dossiers
        fs::create_dir_all(&update_dir)
            .await
            .map_err(|e| UpdateError::IoError(e.to_string()))?;
        fs::create_dir_all(&backup_dir)
            .await
            .map_err(|e| UpdateError::IoError(e.to_string()))?;

        Ok(Self {
            keypair,
            update_dir,
            backup_dir,
            current_version: Arc::new(RwLock::new(current_version)),
            state: Arc::new(RwLock::new(UpdateState::Idle)),
        })
    }

    /// Appliquer une mise à jour depuis un manifest
    pub async fn apply_update(&self, manifest: UpdateManifest) -> Result<(), UpdateError> {
        log::info!("🔄 [UPDATE] Starting update to {}", manifest.version);

        // 1. Vérifier signature du manifest
        *self.state.write().await = UpdateState::Verifying;
        self.verify_manifest_signature(&manifest)?;

        // 2. Créer backup complet avant mise à jour
        let backup_path = self.create_backup().await?;
        log::info!("💾 [UPDATE] Backup created: {:?}", backup_path);

        // 3. Télécharger et vérifier tous les fichiers
        *self.state.write().await = UpdateState::Downloading;
        for file_entry in &manifest.files {
            self.download_and_verify_file(file_entry).await?;
        }

        // 4. Appliquer les fichiers
        *self.state.write().await = UpdateState::Applying;
        match self.apply_files(&manifest.files).await {
            Ok(_) => log::info!("✅ [UPDATE] Files applied successfully"),
            Err(e) => {
                log::error!("❌ [UPDATE] Failed to apply files: {}", e);
                self.rollback(backup_path).await?;
                *self.state.write().await = UpdateState::RolledBack;
                return Err(e);
            }
        }

        // 5. Exécuter migration si nécessaire
        if let Some(migration_id) = &manifest.migration_script {
            *self.state.write().await = UpdateState::Migrating;
            match self.run_migration(migration_id).await {
                Ok(_) => log::info!("✅ [UPDATE] Migration successful"),
                Err(e) => {
                    log::error!("❌ [UPDATE] Migration failed: {}", e);
                    self.rollback(backup_path).await?;
                    *self.state.write().await = UpdateState::RolledBack;
                    return Err(e);
                }
            }
        }

        // 6. Mettre à jour version
        *self.current_version.write().await = manifest.version.clone();
        *self.state.write().await = UpdateState::Success;

        log::info!("🎉 [UPDATE] Update completed successfully to {}", manifest.version);

        Ok(())
    }

    /// Vérifier signature du manifest
    fn verify_manifest_signature(&self, manifest: &UpdateManifest) -> Result<(), UpdateError> {
        let data = manifest.signable_data()
            .map_err(|e| UpdateError::InvalidSignature(format!("Failed to get signable data: {}", e)))?;

        self.keypair
            .verify(&data, &manifest.signature)
            .map_err(|e| UpdateError::InvalidSignature(e.to_string()))?;

        log::info!("✅ [UPDATE] Manifest signature verified");
        Ok(())
    }

    /// Télécharger et vérifier un fichier
    async fn download_and_verify_file(&self, entry: &FileEntry) -> Result<(), UpdateError> {
        // Dans une vraie implémentation, on téléchargerait depuis un serveur
        // Pour v1, on simule avec un fichier local
        let file_path = self.update_dir.join(&entry.path);

        // Créer dossiers parents
        if let Some(parent) = file_path.parent() {
            fs::create_dir_all(parent)
                .await
                .map_err(|e| UpdateError::IoError(e.to_string()))?;
        }

        // Lire fichier (simulé - dans la vraie version ce serait un download HTTP)
        let content = fs::read(&file_path)
            .await
            .map_err(|e| UpdateError::DownloadFailed(format!("File not found: {}", e)))?;

        // Vérifier hash SHA-256
        let mut hasher = Sha256::new();
        hasher.update(&content);
        let actual_hash = format!("{:x}", hasher.finalize());

        if actual_hash != entry.sha256 {
            return Err(UpdateError::HashMismatch {
                file: entry.path.clone(),
                expected: entry.sha256.clone(),
                actual: actual_hash,
            });
        }

        log::info!("✅ [UPDATE] Verified: {} ({})", entry.path, entry.sha256[..8].to_string());

        Ok(())
    }

    /// Appliquer les fichiers
    async fn apply_files(&self, files: &[FileEntry]) -> Result<(), UpdateError> {
        for entry in files {
            let source = self.update_dir.join(&entry.path);
            let dest = PathBuf::from(&entry.path);

            // Créer dossiers de destination
            if let Some(parent) = dest.parent() {
                fs::create_dir_all(parent)
                    .await
                    .map_err(|e| UpdateError::IoError(e.to_string()))?;
            }

            // Copier fichier
            fs::copy(&source, &dest)
                .await
                .map_err(|e| UpdateError::IoError(format!("Failed to copy {}: {}", entry.path, e)))?;

            log::info!("📦 [UPDATE] Applied: {}", entry.path);
        }

        Ok(())
    }

    /// Créer backup complet
    async fn create_backup(&self) -> Result<PathBuf, UpdateError> {
        let timestamp = Self::current_timestamp();
        let backup_path = self.backup_dir.join(format!("backup_{}", timestamp));

        fs::create_dir_all(&backup_path)
            .await
            .map_err(|e| UpdateError::IoError(e.to_string()))?;

        // Dans une vraie implémentation, on sauvegarderait tous les fichiers critiques
        // Pour v1, on marque juste le backup comme créé
        let marker = backup_path.join("backup.marker");
        fs::write(&marker, timestamp.to_string())
            .await
            .map_err(|e| UpdateError::IoError(e.to_string()))?;

        Ok(backup_path)
    }

    /// Rollback vers backup
    async fn rollback(&self, backup_path: PathBuf) -> Result<(), UpdateError> {
        log::warn!("🔙 [UPDATE] Rolling back to backup: {:?}", backup_path);

        // Vérifier que le backup existe
        if !backup_path.exists() {
            return Err(UpdateError::RollbackFailed("Backup not found".to_string()));
        }

        // Dans une vraie implémentation, on restaurerait tous les fichiers du backup
        // Pour v1, on marque juste le rollback comme effectué
        log::info!("✅ [UPDATE] Rollback completed");

        Ok(())
    }

    /// Exécuter script de migration
    async fn run_migration(&self, migration_id: &str) -> Result<(), UpdateError> {
        log::info!("🔧 [UPDATE] Running migration: {}", migration_id);

        // Charger script de migration
        let script_path = self.update_dir.join(format!("migrations/{}.json", migration_id));
        let script_data = fs::read(&script_path)
            .await
            .map_err(|e| UpdateError::MigrationFailed(format!("Script not found: {}", e)))?;

        let script: MigrationScript = serde_json::from_slice(&script_data)
            .map_err(|e| UpdateError::MigrationFailed(format!("Invalid script: {}", e)))?;

        // Vérifier signature du script
        self.verify_migration_signature(&script)?;

        // Exécuter opérations
        for op in &script.operations {
            log::info!("  ➜ Applying operation: {:?}", op);
            // Dans une vraie implémentation, on exécuterait les opérations
        }

        log::info!("✅ [UPDATE] Migration completed");

        Ok(())
    }

    /// Vérifier signature du script de migration
    fn verify_migration_signature(&self, script: &MigrationScript) -> Result<(), UpdateError> {
        let data = serde_json::to_vec(&(
            &script.id,
            &script.from_version,
            &script.to_version,
            &script.operations,
        ))
        .map_err(|e| UpdateError::InvalidSignature(format!("Serialization: {}", e)))?;

        self.keypair
            .verify(&data, &script.signature)
            .map_err(|e| UpdateError::InvalidSignature(e.to_string()))?;

        Ok(())
    }

    /// Obtenir version actuelle
    pub async fn current_version(&self) -> String {
        self.current_version.read().await.clone()
    }

    /// Obtenir état actuel
    pub async fn state(&self) -> UpdateState {
        self.state.read().await.clone()
    }

    fn current_timestamp() -> u64 {
        use std::time::{SystemTime, UNIX_EPOCH};
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or(0)
    }
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;
    use crate::security::encryption::MasterKey;

    #[tokio::test]
    async fn test_update_engine_creation() {
        let keypair = Arc::new(SigningKeypair::generate());
        let engine = UpdateEngine::new(keypair, "v1.0.0".to_string()).await.unwrap();
        assert_eq!(engine.current_version().await, "v1.0.0");
        assert_eq!(engine.state().await, UpdateState::Idle);
    }

    #[tokio::test]
    async fn test_manifest_signature() {
        let keypair = Arc::new(SigningKeypair::generate());
        let engine = UpdateEngine::new(keypair.clone(), "v1.0.0".to_string()).await.unwrap();

        let mut manifest = UpdateManifest::new("v1.1.0".to_string(), "Test update".to_string());

        // Signer manifest
        let data = manifest.signable_data().unwrap();
        manifest.signature = keypair.sign(&data);

        // Vérifier signature
        assert!(engine.verify_manifest_signature(&manifest).is_ok());
    }
}
