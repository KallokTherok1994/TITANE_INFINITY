// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v30.0.0 — STORAGE GUARD
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
        // Normaliser la racine sandbox pour des comparaisons robustes (notamment Windows).
        let sandbox_root = if self.data_root.exists() {
            self.data_root
                .canonicalize()
                .unwrap_or_else(|_| self.data_root.clone())
        } else {
            self.data_root.clone()
        };

        // 1. Vérifications basiques
        if relative_path.is_empty() {
            return Err("Empty path".into());
        }

        if relative_path.contains('\0') {
            return Err("Null byte in path".into());
        }

        if relative_path.contains("://") {
            if self.policy.security_logging {
                eprintln!(
                    "[SECURITY:STORAGE] BLOCKED: Scheme-like path rejected: {}",
                    relative_path
                );
            }
            return Err("Scheme-like paths are not allowed".into());
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

        // 3. Interdire tous les chemins absolus/rootés: l API n accepte que des chemins relatifs sandboxés.
        let path = Path::new(relative_path);
        let is_rooted_path = path.is_absolute() || path.has_root();
        if is_rooted_path {
            if self.policy.security_logging {
                eprintln!(
                    "[SECURITY:STORAGE] BLOCKED: Absolute/rooted path rejected: {}",
                    relative_path
                );
            }
            return Err("Absolute or rooted paths are not allowed".into());
        }

        // 4. Construction chemin complet
        let full_path = sandbox_root.join(relative_path);

        // 5. Vérification finale sandbox (si activé)
        if self.policy.fs_sandbox_enabled {
            if !full_path.starts_with(&sandbox_root) {
                return Err(format!(
                    "Path escapes sandbox: {:?} not in {:?}",
                    full_path, sandbox_root
                ));
            }

            // Tenter canonicalisation (résout symlinks, ..)
            // Note: échoue si le fichier n'existe pas encore, donc on vérifie aussi l ancetre existant le plus proche
            let canonical = if full_path.exists() {
                full_path
                    .canonicalize()
                    .map_err(|e| format!("Canonicalize failed: {}", e))?
            } else {
                let mut ancestor = full_path.parent().map(Path::to_path_buf);
                while let Some(candidate) = ancestor {
                    if candidate.exists() {
                        let canonical_parent = candidate
                            .canonicalize()
                            .map_err(|e| format!("Canonicalize parent failed: {}", e))?;

                        if !canonical_parent.starts_with(&sandbox_root) {
                            return Err(format!(
                                "Path escapes sandbox: {:?} not in {:?}",
                                canonical_parent, sandbox_root
                            ));
                        }

                        break;
                    }

                    ancestor = candidate.parent().map(Path::to_path_buf);
                }

                full_path.clone()
            };

            if canonical.exists() && !canonical.starts_with(&sandbox_root) {
                if self.policy.security_logging {
                    eprintln!(
                        "[SECURITY:STORAGE] BLOCKED: Path escapes sandbox: {:?}",
                        canonical
                    );
                }
                return Err(format!(
                    "Path escapes sandbox: {:?} not in {:?}",
                    canonical, sandbox_root
                ));
            }
        }

        Ok(full_path)
    }

    /// Sanitize filename (enlever caractères interdits)
    pub fn sanitize_filename(filename: &str) -> String {
        let sanitized: String = filename
            .chars()
            .filter(|c| c.is_alphanumeric() || *c == '_' || *c == '-' || *c == '.')
            .take(255) // Limite longueur nom fichier
            .collect();

        let trimmed = sanitized.trim_matches('.');
        if !trimmed.is_empty() {
            return trimmed.to_string();
        }

        let mut checksum = 0u64;
        for byte in filename.as_bytes() {
            checksum = checksum.wrapping_mul(131).wrapping_add(u64::from(*byte));
        }

        format!("file_{checksum:x}")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    #[cfg(unix)]
    use std::os::unix::fs::symlink;

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

        // Leading dots are removed to avoid hidden/ambiguous storage names
        assert_eq!(
            StorageGuard::sanitize_filename("../../etc/passwd"),
            "etcpasswd"
        );

        // Pipes removed, hyphens preserved
        assert_eq!(
            StorageGuard::sanitize_filename("file|rm -rf /.txt"),
            "filerm-rf.txt"
        );

        assert!(StorageGuard::sanitize_filename("!!!").starts_with("file_"));
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

    #[cfg(unix)]
    #[tokio::test]
    async fn test_safe_write_rejects_nested_symlink_escape() {
        let temp_root = env::temp_dir().join(format!(
            "titane_test_storage_symlink_escape_{}",
            std::process::id()
        ));
        let sandbox_root = temp_root.join("sandbox");
        let outside_root = temp_root.join("outside");

        std::fs::create_dir_all(&sandbox_root)
            .expect("sandbox root should be creatable for storage guard symlink test");
        std::fs::create_dir_all(&outside_root)
            .expect("outside root should be creatable for storage guard symlink test");

        symlink(&outside_root, sandbox_root.join("linked_out"))
            .expect("symlink should be creatable for storage guard symlink test");

        let guard = StorageGuard::new(sandbox_root.clone());
        let result = guard
            .safe_write_string("linked_out/newdir/escape.txt", "Hello TITANE")
            .await;

        assert!(result.is_err());
        assert!(!outside_root.join("newdir/escape.txt").exists());

        let _ = std::fs::remove_dir_all(&temp_root);
    }
}
