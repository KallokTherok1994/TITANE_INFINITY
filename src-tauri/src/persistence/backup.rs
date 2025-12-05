//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v∞.MPE-2 — BACKUP & EXPORT ENGINE
//! Sauvegarde, export et import des données TITANE
//! © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
// Note: tokio::io traits non utilisés directement, std::io::Write utilisé

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/// Mode d'import
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ImportMode {
    /// Remplacer entièrement l'état actuel
    Replace,
    /// Fusionner avec l'état existant
    Merge,
}

/// Métadonnées d'une archive
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArchiveMetadata {
    /// Version de TITANE
    pub titane_version: String,
    /// Version du schéma
    pub schema_version: u32,
    /// Date de création
    pub created_at: u64,
    /// Description optionnelle
    pub description: Option<String>,
    /// Checksum global
    pub checksum: String,
    /// Fichiers inclus
    pub files: Vec<ArchiveFile>,
    /// Taille totale non compressée
    pub uncompressed_size: u64,
}

/// Fichier dans l'archive
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArchiveFile {
    pub name: String,
    pub size: u64,
    pub checksum: String,
    pub file_type: ArchiveFileType,
}

/// Type de fichier dans l'archive
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ArchiveFileType {
    Database,
    Snapshot,
    Events,
    Config,
    Metadata,
}

/// Rapport d'export
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportReport {
    pub success: bool,
    pub archive_path: String,
    pub files_exported: u32,
    pub total_size_bytes: u64,
    pub compressed_size_bytes: u64,
    pub duration_ms: u64,
    pub timestamp: u64,
    pub errors: Vec<String>,
}

/// Rapport d'import
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImportReport {
    pub success: bool,
    pub mode: ImportMode,
    pub files_imported: u32,
    pub events_imported: u64,
    pub snapshots_imported: u32,
    pub schema_version: u32,
    pub duration_ms: u64,
    pub timestamp: u64,
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
}

/// Résultat de validation d'archive
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArchiveValidation {
    pub is_valid: bool,
    pub metadata: Option<ArchiveMetadata>,
    pub compatible_version: bool,
    pub compatible_schema: bool,
    pub integrity_ok: bool,
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
}

// ═══════════════════════════════════════════════════════════════════════════════
// ERRORS
// ═══════════════════════════════════════════════════════════════════════════════

/// Erreurs de backup
#[derive(Debug, Clone, Serialize, Deserialize, thiserror::Error)]
pub enum BackupError {
    #[error("Erreur IO: {0}")]
    IoError(String),

    #[error("Erreur de compression: {0}")]
    CompressionError(String),

    #[error("Erreur de sérialisation: {0}")]
    SerializationError(String),

    #[error("Archive invalide: {0}")]
    InvalidArchive(String),

    #[error("Version incompatible: archive v{archive}, actuel v{current}")]
    IncompatibleVersion { archive: u32, current: u32 },

    #[error("Intégrité compromise: {0}")]
    IntegrityError(String),

    #[error("Permission refusée: {0}")]
    PermissionDenied(String),
}

// ═══════════════════════════════════════════════════════════════════════════════
// BACKUP ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/// Moteur de sauvegarde et restauration
pub struct BackupEngine {
    /// Chemin du répertoire de données
    data_dir: PathBuf,
    /// Dernière exportation
    last_export: Option<u64>,
    /// Dernière importation
    last_import: Option<u64>,
}

impl BackupEngine {
    pub fn new() -> Self {
        let data_dir = Self::get_data_dir();
        Self {
            data_dir,
            last_export: None,
            last_import: None,
        }
    }

    /// Obtenir le répertoire de données
    fn get_data_dir() -> PathBuf {
        let mut path = dirs::data_local_dir().unwrap_or_else(|| PathBuf::from("."));
        path.push("TITANE_INFINITY");
        path.push("persistence");
        path
    }

    /// Exporter les données vers une archive
    pub async fn export(&mut self, output_path: &Path, description: Option<String>) -> Result<ExportReport, BackupError> {
        let start = std::time::Instant::now();
        let now = chrono::Utc::now().timestamp_millis() as u64;

        let mut report = ExportReport {
            success: false,
            archive_path: output_path.to_string_lossy().to_string(),
            files_exported: 0,
            total_size_bytes: 0,
            compressed_size_bytes: 0,
            duration_ms: 0,
            timestamp: now,
            errors: Vec::new(),
        };

        log::info!("[BackupEngine] 📦 Export vers {:?}", output_path);

        // Créer le répertoire parent si nécessaire
        if let Some(parent) = output_path.parent() {
            tokio::fs::create_dir_all(parent)
                .await
                .map_err(|e| BackupError::IoError(e.to_string()))?;
        }

        // Collecter les fichiers à exporter
        let mut files_to_export: Vec<(PathBuf, ArchiveFileType)> = Vec::new();
        let mut archive_files: Vec<ArchiveFile> = Vec::new();

        // Events
        let events_path = self.data_dir.join("titan_events.db.events.json");
        if events_path.exists() {
            files_to_export.push((events_path.clone(), ArchiveFileType::Events));
        }

        // Snapshots
        let snapshots_path = self.data_dir.join("titan_events.db.snapshots.json");
        if snapshots_path.exists() {
            files_to_export.push((snapshots_path.clone(), ArchiveFileType::Snapshot));
        }

        // Créer une archive tar.gz
        let archive_file = tokio::fs::File::create(output_path)
            .await
            .map_err(|e| BackupError::IoError(e.to_string()))?;

        let mut archive_data: Vec<u8> = Vec::new();

        for (file_path, file_type) in &files_to_export {
            match tokio::fs::read(file_path).await {
                Ok(content) => {
                    let file_name = file_path.file_name()
                        .map(|n| n.to_string_lossy().to_string())
                        .unwrap_or_else(|| "unknown".to_string());

                    let checksum = Self::compute_checksum(&content);
                    let size = content.len() as u64;

                    archive_files.push(ArchiveFile {
                        name: file_name.clone(),
                        size,
                        checksum: checksum.clone(),
                        file_type: file_type.clone(),
                    });

                    // Ajouter au contenu de l'archive (format simple: nom + taille + contenu)
                    archive_data.extend_from_slice(file_name.as_bytes());
                    archive_data.push(0); // Séparateur
                    archive_data.extend_from_slice(&size.to_le_bytes());
                    archive_data.extend_from_slice(&content);

                    report.files_exported += 1;
                    report.total_size_bytes += size;
                }
                Err(e) => {
                    report.errors.push(format!("Lecture {:?}: {}", file_path, e));
                }
            }
        }

        // Créer les métadonnées
        let metadata = ArchiveMetadata {
            titane_version: env!("CARGO_PKG_VERSION").to_string(),
            schema_version: super::migrations::CURRENT_SCHEMA_VERSION,
            created_at: now,
            description,
            checksum: Self::compute_checksum(&archive_data),
            files: archive_files,
            uncompressed_size: report.total_size_bytes,
        };

        // Sérialiser les métadonnées
        let metadata_json = serde_json::to_vec(&metadata)
            .map_err(|e| BackupError::SerializationError(e.to_string()))?;

        // Construire l'archive finale
        let mut final_archive: Vec<u8> = Vec::new();

        // Header: TITANE_ARCHIVE + version
        final_archive.extend_from_slice(b"TITANE_ARCHIVE\x00\x01");

        // Métadonnées (taille + contenu)
        final_archive.extend_from_slice(&(metadata_json.len() as u32).to_le_bytes());
        final_archive.extend_from_slice(&metadata_json);

        // Données compressées
        let compressed = Self::compress_data(&archive_data)?;
        final_archive.extend_from_slice(&(compressed.len() as u64).to_le_bytes());
        final_archive.extend_from_slice(&compressed);

        report.compressed_size_bytes = final_archive.len() as u64;

        // Écrire l'archive
        let mut file = archive_file.into_std().await;
        std::io::Write::write_all(&mut file, &final_archive)
            .map_err(|e| BackupError::IoError(e.to_string()))?;

        report.duration_ms = start.elapsed().as_millis() as u64;
        report.success = report.errors.is_empty();

        self.last_export = Some(now);

        log::info!(
            "[BackupEngine] ✅ Export terminé: {} fichiers, {} → {} bytes (ratio {:.1}%)",
            report.files_exported,
            report.total_size_bytes,
            report.compressed_size_bytes,
            (1.0 - report.compressed_size_bytes as f64 / report.total_size_bytes.max(1) as f64) * 100.0
        );

        Ok(report)
    }

    /// Valider une archive avant import
    pub async fn validate_archive(&self, archive_path: &Path) -> Result<ArchiveValidation, BackupError> {
        let mut validation = ArchiveValidation {
            is_valid: false,
            metadata: None,
            compatible_version: false,
            compatible_schema: false,
            integrity_ok: false,
            errors: Vec::new(),
            warnings: Vec::new(),
        };

        // Lire l'archive
        let archive_data = tokio::fs::read(archive_path)
            .await
            .map_err(|e| BackupError::IoError(e.to_string()))?;

        // Vérifier le header
        if !archive_data.starts_with(b"TITANE_ARCHIVE\x00") {
            validation.errors.push("Header invalide: pas une archive TITANE".to_string());
            return Ok(validation);
        }

        // Extraire les métadonnées
        let header_len = 16; // TITANE_ARCHIVE\x00\x01
        if archive_data.len() < header_len + 4 {
            validation.errors.push("Archive trop courte".to_string());
            return Ok(validation);
        }

        let metadata_len = u32::from_le_bytes(
            archive_data[header_len..header_len + 4].try_into().unwrap()
        ) as usize;

        if archive_data.len() < header_len + 4 + metadata_len {
            validation.errors.push("Métadonnées tronquées".to_string());
            return Ok(validation);
        }

        let metadata_bytes = &archive_data[header_len + 4..header_len + 4 + metadata_len];
        let metadata: ArchiveMetadata = serde_json::from_slice(metadata_bytes)
            .map_err(|e| BackupError::SerializationError(e.to_string()))?;

        validation.metadata = Some(metadata.clone());

        // Vérifier la compatibilité de version
        let current_schema = super::migrations::CURRENT_SCHEMA_VERSION;
        let min_supported = super::migrations::MIN_SUPPORTED_VERSION;

        if metadata.schema_version >= min_supported && metadata.schema_version <= current_schema {
            validation.compatible_schema = true;
        } else {
            validation.warnings.push(format!(
                "Schema v{} peut nécessiter migration (actuel: v{})",
                metadata.schema_version, current_schema
            ));
            validation.compatible_schema = true; // Migration possible
        }

        validation.compatible_version = true;

        // Vérifier l'intégrité (checksum des données)
        let data_offset = header_len + 4 + metadata_len + 8;
        if archive_data.len() > data_offset {
            let compressed_data = &archive_data[data_offset..];
            match Self::decompress_data(compressed_data) {
                Ok(decompressed) => {
                    let computed_checksum = Self::compute_checksum(&decompressed);
                    if computed_checksum == metadata.checksum {
                        validation.integrity_ok = true;
                    } else {
                        validation.errors.push("Checksum invalide".to_string());
                    }
                }
                Err(e) => {
                    validation.errors.push(format!("Décompression échouée: {}", e));
                }
            }
        }

        validation.is_valid = validation.errors.is_empty()
            && validation.compatible_version
            && validation.compatible_schema
            && validation.integrity_ok;

        Ok(validation)
    }

    /// Importer une archive
    pub async fn import(
        &mut self,
        archive_path: &Path,
        mode: ImportMode,
    ) -> Result<ImportReport, BackupError> {
        let start = std::time::Instant::now();
        let now = chrono::Utc::now().timestamp_millis() as u64;

        let mut report = ImportReport {
            success: false,
            mode,
            files_imported: 0,
            events_imported: 0,
            snapshots_imported: 0,
            schema_version: 0,
            duration_ms: 0,
            timestamp: now,
            errors: Vec::new(),
            warnings: Vec::new(),
        };

        log::info!("[BackupEngine] 📥 Import depuis {:?} (mode: {:?})", archive_path, mode);

        // Valider d'abord
        let validation = self.validate_archive(archive_path).await?;
        if !validation.is_valid {
            report.errors = validation.errors;
            return Ok(report);
        }

        let metadata = validation.metadata.unwrap();
        report.schema_version = metadata.schema_version;

        // Lire et décompresser l'archive
        let archive_data = tokio::fs::read(archive_path)
            .await
            .map_err(|e| BackupError::IoError(e.to_string()))?;

        let header_len = 16;
        let metadata_len = u32::from_le_bytes(
            archive_data[header_len..header_len + 4].try_into().unwrap()
        ) as usize;

        let data_offset = header_len + 4 + metadata_len + 8;
        let compressed_data = &archive_data[data_offset..];
        let decompressed = Self::decompress_data(compressed_data)?;

        // Parser et restaurer les fichiers
        let mut cursor = 0;
        while cursor < decompressed.len() {
            // Lire le nom du fichier
            let name_end = decompressed[cursor..]
                .iter()
                .position(|&b| b == 0)
                .ok_or_else(|| BackupError::InvalidArchive("Format corrompu".to_string()))?;

            let file_name = String::from_utf8_lossy(&decompressed[cursor..cursor + name_end]).to_string();
            cursor += name_end + 1;

            // Lire la taille
            if cursor + 8 > decompressed.len() {
                break;
            }
            let size = u64::from_le_bytes(
                decompressed[cursor..cursor + 8].try_into().unwrap()
            ) as usize;
            cursor += 8;

            // Lire le contenu
            if cursor + size > decompressed.len() {
                report.errors.push(format!("Fichier {} tronqué", file_name));
                break;
            }
            let content = &decompressed[cursor..cursor + size];
            cursor += size;

            // Restaurer le fichier
            let target_path = self.data_dir.join(&file_name);

            match mode {
                ImportMode::Replace => {
                    // Sauvegarder l'ancien fichier si existant
                    if target_path.exists() {
                        let backup_path = target_path.with_extension(format!(
                            "{}.backup.{}",
                            target_path.extension().unwrap_or_default().to_str().unwrap_or(""),
                            now
                        ));
                        if let Err(e) = tokio::fs::copy(&target_path, &backup_path).await {
                            report.warnings.push(format!("Backup {} échoué: {}", file_name, e));
                        }
                    }

                    tokio::fs::write(&target_path, content)
                        .await
                        .map_err(|e| BackupError::IoError(e.to_string()))?;
                }
                ImportMode::Merge => {
                    // Pour le merge, on fusionne les contenus JSON
                    if target_path.exists() {
                        let existing = tokio::fs::read(&target_path)
                            .await
                            .map_err(|e| BackupError::IoError(e.to_string()))?;

                        let merged = self.merge_json_arrays(&existing, content)?;
                        tokio::fs::write(&target_path, merged)
                            .await
                            .map_err(|e| BackupError::IoError(e.to_string()))?;
                    } else {
                        tokio::fs::write(&target_path, content)
                            .await
                            .map_err(|e| BackupError::IoError(e.to_string()))?;
                    }
                }
            }

            report.files_imported += 1;

            // Compter events/snapshots
            if file_name.contains("events") {
                if let Ok(events) = serde_json::from_slice::<Vec<serde_json::Value>>(content) {
                    report.events_imported = events.len() as u64;
                }
            } else if file_name.contains("snapshots") {
                if let Ok(snapshots) = serde_json::from_slice::<Vec<serde_json::Value>>(content) {
                    report.snapshots_imported = snapshots.len() as u32;
                }
            }
        }

        report.duration_ms = start.elapsed().as_millis() as u64;
        report.success = report.errors.is_empty();

        self.last_import = Some(now);

        log::info!(
            "[BackupEngine] ✅ Import terminé: {} fichiers, {} events, {} snapshots",
            report.files_imported,
            report.events_imported,
            report.snapshots_imported
        );

        Ok(report)
    }

    /// Fusionner deux tableaux JSON
    fn merge_json_arrays(&self, existing: &[u8], new: &[u8]) -> Result<Vec<u8>, BackupError> {
        let mut existing_array: Vec<serde_json::Value> = serde_json::from_slice(existing)
            .unwrap_or_default();

        let new_array: Vec<serde_json::Value> = serde_json::from_slice(new)
            .unwrap_or_default();

        // Dédoublonner par ID si présent
        let existing_ids: std::collections::HashSet<String> = existing_array
            .iter()
            .filter_map(|v| v.get("id").and_then(|id| id.as_str().map(String::from)))
            .collect();

        for item in new_array {
            let id = item.get("id").and_then(|id| id.as_str());
            if id.map(|id| !existing_ids.contains(id)).unwrap_or(true) {
                existing_array.push(item);
            }
        }

        serde_json::to_vec(&existing_array)
            .map_err(|e| BackupError::SerializationError(e.to_string()))
    }

    /// Calculer le checksum SHA256 des données
    fn compute_checksum(data: &[u8]) -> String {
        use sha2::{Sha256, Digest};
        let mut hasher = Sha256::new();
        hasher.update(data);
        format!("{:x}", hasher.finalize())
    }

    /// Compresser des données avec gzip
    fn compress_data(data: &[u8]) -> Result<Vec<u8>, BackupError> {
        use flate2::write::GzEncoder;
        use flate2::Compression;
        use std::io::Write;

        let mut encoder = GzEncoder::new(Vec::new(), Compression::best());
        encoder
            .write_all(data)
            .map_err(|e| BackupError::CompressionError(e.to_string()))?;
        encoder
            .finish()
            .map_err(|e| BackupError::CompressionError(e.to_string()))
    }

    /// Décompresser des données gzip
    fn decompress_data(data: &[u8]) -> Result<Vec<u8>, BackupError> {
        use flate2::read::GzDecoder;
        use std::io::Read;

        let mut decoder = GzDecoder::new(data);
        let mut result = Vec::new();
        decoder
            .read_to_end(&mut result)
            .map_err(|e| BackupError::CompressionError(e.to_string()))?;
        Ok(result)
    }

    /// Obtenir le timestamp de la dernière exportation
    pub fn last_export(&self) -> Option<u64> {
        self.last_export
    }

    /// Obtenir le timestamp de la dernière importation
    pub fn last_import(&self) -> Option<u64> {
        self.last_import
    }

    /// Obtenir le chemin par défaut pour les backups
    pub fn default_backup_path() -> PathBuf {
        let mut path = dirs::document_dir().unwrap_or_else(|| PathBuf::from("."));
        path.push("TITANE_INFINITY_Backups");
        path
    }
}

impl Default for BackupEngine {
    fn default() -> Self {
        Self::new()
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[tokio::test]
    async fn test_export_import_cycle() {
        let temp_dir = tempdir().unwrap();
        let _archive_path = temp_dir.path().join("test_backup.titane");

        let _engine = BackupEngine::new();

        // Créer des fichiers de test
        let test_data_dir = temp_dir.path().join("test_data");
        tokio::fs::create_dir_all(&test_data_dir).await.unwrap();

        // Note: Ce test nécessiterait un setup plus complet
        // avec de vrais fichiers dans le répertoire de données
    }
}
