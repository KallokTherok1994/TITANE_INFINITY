// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.3.0 — STORAGE GUARD
//   Sécurisation accès fichiers système
// ═══════════════════════════════════════════════════════════════

use super::SecurityPolicy;
use std::path::{Path, PathBuf};
use tokio::fs;

/// Garde centralisé pour l'accès sécurisé aux fichiers
pub struct StorageGuard {
    policy: SecurityPolicy,
    data_root: PathBuf,
}

impl StorageGuard {
    pub fn new(data_root: PathBuf) -> Self {
        Self {
            policy: SecurityPolicy::default(),
            data_root,
        }
    }

    /// Lit un fichier de manière sécurisée
    pub async fn safe_read(&self, relative_path: &str) -> Result<Vec<u8>, String> {
        let full_path = self.validate_and_resolve(relative_path)?;

        fs::read(&full_path)
            .await
            .map_err(|e| format!("Read failed: {}", e))
    }

    /// Lit un fichier texte de manière sécurisée
    pub async fn safe_read_string(&self, relative_path: &str) -> Result<String, String> {
        let full_path = self.validate_and_resolve(relative_path)?;

        fs::read_to_string(&full_path)
            .await
            .map_err(|e| format!("Read string failed: {}", e))
    }

    /// Écrit un fichier de manière sécurisée
    pub async fn safe_write(&self, relative_path: &str, data: &[u8]) -> Result<(), String> {
        let full_path = self.validate_and_resolve(relative_path)?;

        // Créer répertoires parents si nécessaire
        if let Some(parent) = full_path.parent() {
            fs::create_dir_all(parent)
                .await
                .map_err(|e| format!("Create dir failed: {}", e))?;
        }

        fs::write(&full_path, data)
            .await
            .map_err(|e| format!("Write failed: {}", e))
    }

    /// Écrit un fichier texte de manière sécurisée
    pub async fn safe_write_string(&self, relative_path: &str, data: &str) -> Result<(), String> {
        self.safe_write(relative_path, data.as_bytes()).await
    }

    /// Supprime un fichier de manière sécurisée
    pub async fn safe_delete(&self, relative_path: &str) -> Result<(), String> {
        let full_path = self.validate_and_resolve(relative_path)?;

        if full_path.exists() {
            fs::remove_file(&full_path)
                .await
                .map_err(|e| format!("Delete failed: {}", e))?;
        }

        Ok(())
    }

    /// Vérifie si un fichier existe
    pub fn exists(&self, relative_path: &str) -> bool {
        if let Ok(full_path) = self.validate_and_resolve(relative_path) {
            full_path.exists()
        } else {
            false
        }
    }

    /// Liste les fichiers d'un répertoire de manière sécurisée
    pub async fn safe_list_dir(&self, relative_path: &str) -> Result<Vec<String>, String> {
        let full_path = self.validate_and_resolve(relative_path)?;

        let mut entries = fs::read_dir(&full_path)
            .await
            .map_err(|e| format!("Read dir failed: {}", e))?;

        let mut files = Vec::new();
        while let Some(entry) = entries
            .next_entry()
            .await
            .map_err(|e| format!("Entry error: {}", e))?
        {
            if let Some(name) = entry.file_name().to_str() {
                files.push(name.to_string());
            }
        }

        Ok(files)
    }

    /// Valide et résout un chemin relatif vers chemin absolu sécurisé
    pub fn validate_and_resolve(&self, relative_path: &str) -> Result<PathBuf, String> {
        // 1. Vérifications basiques
        if relative_path.is_empty() {
            return Err("Empty path".into());
        }

        if relative_path.contains('\0') {
            return Err("Null byte in path".into());
        }

        // 2. Interdire path traversal évident
        if relative_path.contains("..") {
            if self.policy.security_logging {
                eprintln!(
                    "[SECURITY:STORAGE] BLOCKED: Path traversal attempt: {}",
                    relative_path
                );
            }
            return Err("Path traversal detected (..)".into());
        }

        // 3. Interdire chemins absolus (sauf si data_root)
        let path = Path::new(relative_path);
        if path.is_absolute() && !path.starts_with(&self.data_root) {
            if self.policy.security_logging {
                eprintln!(
                    "[SECURITY:STORAGE] BLOCKED: Absolute path outside sandbox: {}",
                    relative_path
                );
            }
            return Err("Absolute paths not allowed outside sandbox".into());
        }

        // 4. Construction chemin complet
        let full_path = if path.is_absolute() {
            path.to_path_buf()
        } else {
            self.data_root.join(relative_path)
        };

        // 5. Vérification finale sandbox (si activé)
        if self.policy.fs_sandbox_enabled {
            // Tenter canonicalisation (résout symlinks, ..)
            // Note: échoue si le fichier n'existe pas encore, donc on vérifie aussi le parent
            let canonical = if full_path.exists() {
                full_path
                    .canonicalize()
                    .map_err(|e| format!("Canonicalize failed: {}", e))?
            } else {
                // Pour nouveaux fichiers, vérifier le répertoire parent
                if let Some(parent) = full_path.parent() {
                    if parent.exists() {
                        let canonical_parent = parent
                            .canonicalize()
                            .map_err(|e| format!("Canonicalize parent failed: {}", e))?;

                        if !canonical_parent.starts_with(&self.data_root) {
                            return Err(format!(
                                "Path escapes sandbox: {:?} not in {:?}",
                                canonical_parent, self.data_root
                            ));
                        }
                    }
                }
                full_path.clone()
            };

            if canonical.exists() && !canonical.starts_with(&self.data_root) {
                if self.policy.security_logging {
                    eprintln!(
                        "[SECURITY:STORAGE] BLOCKED: Path escapes sandbox: {:?}",
                        canonical
                    );
                }
                return Err(format!(
                    "Path escapes sandbox: {:?} not in {:?}",
                    canonical, self.data_root
                ));
            }
        }

        Ok(full_path)
    }

    /// Sanitize filename (enlever caractères interdits)
    pub fn sanitize_filename(filename: &str) -> String {
        filename
            .chars()
            .filter(|c| c.is_alphanumeric() || *c == '_' || *c == '-' || *c == '.')
            .take(255) // Limite longueur nom fichier
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    #[test]
    fn test_validate_path_traversal() {
        let temp_dir = env::temp_dir();
        let guard = StorageGuard::new(temp_dir);

        // Doit échouer
        assert!(guard.validate_and_resolve("../etc/passwd").is_err());
        assert!(guard.validate_and_resolve("file/../../etc/passwd").is_err());
    }

    #[test]
    fn test_validate_null_byte() {
        let temp_dir = env::temp_dir();
        let guard = StorageGuard::new(temp_dir);

        assert!(guard.validate_and_resolve("file\0.txt").is_err());
    }

    #[test]
    fn test_validate_empty_path() {
        let temp_dir = env::temp_dir();
        let guard = StorageGuard::new(temp_dir);

        assert!(guard.validate_and_resolve("").is_err());
    }

    #[test]
    fn test_sanitize_filename() {
        assert_eq!(
            StorageGuard::sanitize_filename("hello world!.txt"),
            "helloworld.txt"
        );

        // Dots at beginning are preserved (....etcpasswd)
        assert_eq!(
            StorageGuard::sanitize_filename("../../etc/passwd"),
            "....etcpasswd"
        );

        // Pipes removed, hyphens preserved
        assert_eq!(
            StorageGuard::sanitize_filename("file|rm -rf /.txt"),
            "filerm-rf.txt"
        );
    }

    #[tokio::test]
    async fn test_safe_operations() {
        let temp_dir = env::temp_dir().join("titane_test_storage");
        std::fs::create_dir_all(&temp_dir)
            .expect("temp dir should be creatable for storage guard test");

        let guard = StorageGuard::new(temp_dir.clone());

        // Écriture
        let result = guard.safe_write_string("test.txt", "Hello TITANE").await;
        assert!(result.is_ok());

        // Lecture
        let content = guard.safe_read_string("test.txt").await;
        assert!(content.is_ok());
        assert_eq!(
            content.expect("should read back written file"),
            "Hello TITANE"
        );

        // Suppression
        let delete_result = guard.safe_delete("test.txt").await;
        assert!(delete_result.is_ok());

        // Cleanup
        let _ = std::fs::remove_dir_all(&temp_dir);
    }
}
