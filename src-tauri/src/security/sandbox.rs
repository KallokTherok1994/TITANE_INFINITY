// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   FILE IMPORT SANDBOX — Super-Prompt H3
//   Import sécurisé et isolé de fichiers utilisateur
// ═══════════════════════════════════════════════════════════════

use super::validation::PayloadValidator;
use std::collections::HashSet;
use std::path::{Path, PathBuf};
use tokio::fs;
use tokio::io::AsyncReadExt;

const MAX_FILE_SIZE: u64 = 25 * 1024 * 1024; // 25 MB
const SANDBOX_DIR: &str = "userdata/imports";

lazy_static::lazy_static! {
    /// Extensions autorisées
    static ref ALLOWED_EXTENSIONS: HashSet<&'static str> = {
        let mut set = HashSet::new();
        // Documents
        set.insert("txt");
        set.insert("md");
        set.insert("pdf");
        set.insert("docx");
        set.insert("odt");
        set.insert("rtf");
        // Code
        set.insert("rs");
        set.insert("ts");
        set.insert("tsx");
        set.insert("js");
        set.insert("jsx");
        set.insert("json");
        set.insert("yaml");
        set.insert("yml");
        set.insert("toml");
        set.insert("xml");
        set.insert("html");
        set.insert("css");
        // Images
        set.insert("png");
        set.insert("jpg");
        set.insert("jpeg");
        set.insert("gif");
        set.insert("svg");
        set.insert("webp");
        // Archives
        set.insert("zip");
        set.insert("tar");
        set.insert("gz");
        // Autres
        set.insert("csv");
        set.insert("log");
        set
    };

    /// Extensions interdites (risque exécution)
    static ref FORBIDDEN_EXTENSIONS: HashSet<&'static str> = {
        let mut set = HashSet::new();
        set.insert("exe");
        set.insert("dll");
        set.insert("so");
        set.insert("dylib");
        set.insert("bin");
        set.insert("sh");
        set.insert("bash");
        set.insert("bat");
        set.insert("cmd");
        set.insert("ps1");
        set.insert("wasm");
        set.insert("com");
        set.insert("scr");
        set.insert("msi");
        set.insert("app");
        set.insert("deb");
        set.insert("rpm");
        set
    };
}

/// Erreurs sandbox
#[derive(Debug, Clone)]
pub enum SandboxError {
    FileTooLarge(u64, u64),
    ForbiddenExtension(String),
    InvalidMimeType(String),
    SandboxViolation(String),
    IoError(String),
    ValidationFailed(String),
}

impl std::fmt::Display for SandboxError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            SandboxError::FileTooLarge(size, max) => {
                write!(f, "File too large: {} bytes (max {})", size, max)
            }
            SandboxError::ForbiddenExtension(ext) => {
                write!(f, "Forbidden extension: {}", ext)
            }
            SandboxError::InvalidMimeType(mime) => {
                write!(f, "Invalid MIME type: {}", mime)
            }
            SandboxError::SandboxViolation(msg) => {
                write!(f, "Sandbox violation: {}", msg)
            }
            SandboxError::IoError(msg) => write!(f, "IO error: {}", msg),
            SandboxError::ValidationFailed(msg) => write!(f, "Validation failed: {}", msg),
        }
    }
}

impl std::error::Error for SandboxError {}

/// Informations fichier importé
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ImportedFile {
    pub original_name: String,
    pub safe_name: String,
    pub extension: String,
    pub size: u64,
    pub mime_type: String,
    pub timestamp: u64,
    pub sha256: String,
}

/// Sandbox d'import de fichiers
pub struct FileImportSandbox {
    sandbox_path: PathBuf,
}

impl FileImportSandbox {
    pub fn new() -> Self {
        let sandbox_path = dirs::data_local_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("titane_infinity")
            .join(SANDBOX_DIR);

        Self { sandbox_path }
    }

    /// Initialiser sandbox (créer dossiers)
    pub async fn initialize(&self) -> Result<(), SandboxError> {
        fs::create_dir_all(&self.sandbox_path)
            .await
            .map_err(|e| SandboxError::IoError(e.to_string()))?;

        log::info!(
            "✅ File Import Sandbox initialized: {:?}",
            self.sandbox_path
        );
        Ok(())
    }

    /// Valider extension de fichier
    fn validate_extension(&self, filename: &str) -> Result<String, SandboxError> {
        let ext = Path::new(filename)
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("")
            .to_lowercase();

        // Vérifier extensions interdites
        if FORBIDDEN_EXTENSIONS.contains(ext.as_str()) {
            return Err(SandboxError::ForbiddenExtension(ext.clone()));
        }

        // Vérifier extensions autorisées
        if !ALLOWED_EXTENSIONS.contains(ext.as_str()) {
            return Err(SandboxError::ForbiddenExtension(format!(
                "{} (not in whitelist)",
                ext
            )));
        }

        Ok(ext)
    }

    /// Générer nom sécurisé
    fn generate_safe_name(&self, original: &str, extension: &str) -> String {
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_millis())
            .unwrap_or(0);

        // Sanitize nom original
        let safe_base: String = original
            .chars()
            .filter(|c| c.is_alphanumeric() || *c == '_' || *c == '-')
            .take(50)
            .collect();

        format!("{}_{}.{}", safe_base, timestamp, extension)
    }

    /// Calculer SHA-256
    async fn calculate_sha256(&self, data: &[u8]) -> String {
        use sha2::{Digest, Sha256};
        let mut hasher = Sha256::new();
        hasher.update(data);
        format!("{:x}", hasher.finalize())
    }

    /// Détecter MIME type (basique)
    fn detect_mime_type(&self, data: &[u8], extension: &str) -> String {
        // Vérifier magic bytes
        if data.len() >= 4 {
            // PNG
            if data.starts_with(b"\x89PNG") {
                return "image/png".to_string();
            }
            // JPEG
            if data.starts_with(b"\xFF\xD8\xFF") {
                return "image/jpeg".to_string();
            }
            // PDF
            if data.starts_with(b"%PDF") {
                return "application/pdf".to_string();
            }
            // ZIP
            if data.starts_with(b"PK\x03\x04") {
                return "application/zip".to_string();
            }
        }

        // Fallback sur extension
        match extension {
            "txt" | "md" => "text/plain",
            "json" => "application/json",
            "xml" => "application/xml",
            "html" => "text/html",
            "css" => "text/css",
            "js" => "application/javascript",
            "csv" => "text/csv",
            _ => "application/octet-stream",
        }
        .to_string()
    }

    /// Importer fichier sécurisé
    pub async fn import_file(
        &self,
        filename: &str,
        data: Vec<u8>,
    ) -> Result<ImportedFile, SandboxError> {
        // Valider nom de fichier
        PayloadValidator::validate_string(filename, "filename", true)
            .map_err(|e| SandboxError::ValidationFailed(e.to_string()))?;

        // Valider taille
        let size = data.len() as u64;
        if size > MAX_FILE_SIZE {
            return Err(SandboxError::FileTooLarge(size, MAX_FILE_SIZE));
        }

        // Valider extension
        let extension = self.validate_extension(filename)?;

        // Détecter MIME type
        let mime_type = self.detect_mime_type(&data, &extension);

        // Générer nom sécurisé
        let safe_name = self.generate_safe_name(filename, &extension);

        // Calculer hash
        let sha256 = self.calculate_sha256(&data).await;

        // Écrire dans sandbox
        let file_path = self.sandbox_path.join(&safe_name);
        fs::write(&file_path, &data)
            .await
            .map_err(|e| SandboxError::IoError(e.to_string()))?;

        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or(0);

        let imported = ImportedFile {
            original_name: filename.to_string(),
            safe_name: safe_name.clone(),
            extension,
            size,
            mime_type,
            timestamp,
            sha256,
        };

        log::info!(
            "✅ File imported: {} → {} ({} bytes)",
            filename,
            safe_name,
            size
        );

        Ok(imported)
    }

    /// Lire fichier depuis sandbox
    pub async fn read_file(&self, safe_name: &str) -> Result<Vec<u8>, SandboxError> {
        // Valider nom
        PayloadValidator::validate_path(safe_name)
            .map_err(|e| SandboxError::ValidationFailed(e.to_string()))?;

        let file_path = self.sandbox_path.join(safe_name);

        // Vérifier que le fichier est bien dans la sandbox
        if !file_path.starts_with(&self.sandbox_path) {
            return Err(SandboxError::SandboxViolation(
                "File path outside sandbox".to_string(),
            ));
        }

        // Lire fichier
        let data = fs::read(&file_path)
            .await
            .map_err(|e| SandboxError::IoError(e.to_string()))?;

        Ok(data)
    }

    /// Supprimer fichier
    pub async fn delete_file(&self, safe_name: &str) -> Result<(), SandboxError> {
        // Valider nom
        PayloadValidator::validate_path(safe_name)
            .map_err(|e| SandboxError::ValidationFailed(e.to_string()))?;

        let file_path = self.sandbox_path.join(safe_name);

        // Vérifier sandbox
        if !file_path.starts_with(&self.sandbox_path) {
            return Err(SandboxError::SandboxViolation(
                "File path outside sandbox".to_string(),
            ));
        }

        // Supprimer
        fs::remove_file(&file_path)
            .await
            .map_err(|e| SandboxError::IoError(e.to_string()))?;

        log::info!("🗑️ File deleted: {}", safe_name);
        Ok(())
    }

    /// Lister fichiers dans sandbox
    pub async fn list_files(&self) -> Result<Vec<String>, SandboxError> {
        let mut entries = fs::read_dir(&self.sandbox_path)
            .await
            .map_err(|e| SandboxError::IoError(e.to_string()))?;

        let mut files = Vec::new();

        while let Some(entry) = entries
            .next_entry()
            .await
            .map_err(|e| SandboxError::IoError(e.to_string()))?
        {
            if let Some(name) = entry.file_name().to_str() {
                files.push(name.to_string());
            }
        }

        Ok(files)
    }
}

impl Default for FileImportSandbox {
    fn default() -> Self {
        Self::new()
    }
}

/// Initialiser sandbox globale
pub async fn initialize_sandbox() -> Result<(), SandboxError> {
    let sandbox = FileImportSandbox::new();
    sandbox.initialize().await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_validate_extension() {
        let sandbox = FileImportSandbox::new();

        assert!(sandbox.validate_extension("file.txt").is_ok());
        assert!(sandbox.validate_extension("file.exe").is_err());
        assert!(sandbox.validate_extension("file.sh").is_err());
    }

    #[tokio::test]
    async fn test_import_file() {
        let sandbox = FileImportSandbox::new();
        sandbox.initialize().await.unwrap();

        let data = "TITANE INFINITY v∞".as_bytes().to_vec();
        let result = sandbox.import_file("test.txt", data).await;

        assert!(result.is_ok());
        let imported = result.unwrap();
        assert_eq!(imported.extension, "txt");
        assert_eq!(imported.size, 18);
    }

    #[tokio::test]
    async fn test_file_too_large() {
        let sandbox = FileImportSandbox::new();
        let data = vec![0u8; (MAX_FILE_SIZE + 1) as usize];
        let result = sandbox.import_file("huge.txt", data).await;

        assert!(matches!(result, Err(SandboxError::FileTooLarge(_, _))));
    }
}
