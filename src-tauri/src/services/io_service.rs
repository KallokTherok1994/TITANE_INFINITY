// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v30.0.0 — SERVICES: IO
//   File operations - read/write with security
// ═══════════════════════════════════════════════════════════════

#![allow(dead_code)] // IO Service - used by file commands

use crate::utils::{AppError, AppResult};
use std::path::{Component, Path, PathBuf};
use tokio::fs;

pub struct IoService {
    base_path: PathBuf,
}

impl IoService {
    pub fn new(base_path: PathBuf) -> Self {
        Self { base_path }
    }

    fn canonical_base_path(&self) -> AppResult<PathBuf> {
        self.base_path
            .canonicalize()
            .map_err(|e| AppError::Validation(format!("Invalid base path: {}", e)))
    }

    fn resolve_path(&self, path: &Path, allow_missing: bool) -> AppResult<PathBuf> {
        if path.as_os_str().is_empty() {
            return Err(AppError::Validation("Invalid path: empty path".to_string()));
        }

        if path
            .components()
            .any(|component| matches!(component, Component::ParentDir))
        {
            return Err(AppError::Validation(
                "Invalid path: path traversal detected".to_string(),
            ));
        }

        let base_path = self.canonical_base_path()?;
        let requested = if path.is_absolute() {
            path.to_path_buf()
        } else {
            base_path.join(path)
        };

        let canonical = if requested.exists() {
            requested
                .canonicalize()
                .map_err(|e| AppError::Validation(format!("Invalid path: {}", e)))?
        } else if allow_missing {
            let mut existing_ancestor = requested.as_path();
            while !existing_ancestor.exists() {
                existing_ancestor = existing_ancestor.parent().ok_or_else(|| {
                    AppError::Validation("Invalid path: missing parent directory".to_string())
                })?;
            }

            let canonical_ancestor = existing_ancestor
                .canonicalize()
                .map_err(|e| AppError::Validation(format!("Invalid path: {}", e)))?;
            let relative_tail = requested
                .strip_prefix(existing_ancestor)
                .map_err(|e| AppError::Validation(format!("Invalid path: {}", e)))?;

            canonical_ancestor.join(relative_tail)
        } else {
            return Err(AppError::NotFound(format!(
                "Path does not exist: {}",
                requested.display()
            )));
        };

        if !canonical.starts_with(&base_path) {
            return Err(AppError::Validation(
                "Path outside allowed directory".to_string(),
            ));
        }

        Ok(canonical)
    }

    /// Read file as string
    pub async fn read_file(&self, path: &Path) -> AppResult<String> {
        let validated = self.resolve_path(path, false)?;

        if !validated.is_file() {
            return Err(AppError::Validation("Path is not a file".to_string()));
        }

        let content = fs::read_to_string(&validated)
            .await
            .map_err(|e| AppError::Io(format!("Failed to read file: {}", e)))?;

        Ok(content)
    }

    /// Write string to file
    pub async fn write_file(&self, path: &Path, content: &str) -> AppResult<()> {
        let validated = self.resolve_path(path, true)?;

        // Create parent directories if needed
        if let Some(parent) = validated.parent() {
            fs::create_dir_all(parent)
                .await
                .map_err(|e| AppError::Io(format!("Failed to create directories: {}", e)))?;
        }

        fs::write(validated, content)
            .await
            .map_err(|e| AppError::Io(format!("Failed to write file: {}", e)))?;

        Ok(())
    }

    /// Check if file exists
    pub async fn exists(&self, path: &Path) -> bool {
        if let Ok(validated) = self.resolve_path(path, true) {
            validated.exists()
        } else {
            false
        }
    }

    /// Delete file
    pub async fn delete_file(&self, path: &Path) -> AppResult<()> {
        let validated = self.resolve_path(path, false)?;

        if !validated.is_file() {
            return Err(AppError::Validation("Path is not a file".to_string()));
        }

        fs::remove_file(validated)
            .await
            .map_err(|e| AppError::Io(format!("Failed to delete file: {}", e)))?;

        Ok(())
    }

    /// List files in directory
    pub async fn list_dir(&self, path: &Path) -> AppResult<Vec<PathBuf>> {
        let validated = self.resolve_path(path, false)?;

        if !validated.is_dir() {
            return Err(AppError::Validation("Path is not a directory".to_string()));
        }

        let mut entries = fs::read_dir(validated)
            .await
            .map_err(|e| AppError::Io(format!("Failed to read directory: {}", e)))?;

        let mut files = Vec::new();
        while let Some(entry) = entries
            .next_entry()
            .await
            .map_err(|e| AppError::Io(format!("Failed to read entry: {}", e)))?
        {
            files.push(entry.path());
        }

        Ok(files)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[tokio::test]
    async fn read_file_reads_relative_workspace_file() {
        let dir = tempdir().expect("temp dir");
        let file_path = dir.path().join("nested").join("note.txt");
        std::fs::create_dir_all(file_path.parent().expect("parent exists")).expect("create dir");
        std::fs::write(&file_path, "hello io service\n").expect("write fixture");

        let service = IoService::new(dir.path().to_path_buf());
        let content = service
            .read_file(Path::new("nested/note.txt"))
            .await
            .expect("relative workspace file should be readable");

        assert_eq!(content, "hello io service\n");
    }

    #[tokio::test]
    async fn write_file_creates_new_workspace_file() {
        let dir = tempdir().expect("temp dir");
        let service = IoService::new(dir.path().to_path_buf());

        service
            .write_file(Path::new("nested/new.txt"), "fresh content")
            .await
            .expect("writing a new relative file should succeed");

        let written = std::fs::read_to_string(dir.path().join("nested/new.txt"))
            .expect("written file should exist");
        assert_eq!(written, "fresh content");
    }

    #[tokio::test]
    async fn write_file_rejects_path_traversal() {
        let dir = tempdir().expect("temp dir");
        let service = IoService::new(dir.path().to_path_buf());

        let err = service
            .write_file(Path::new("../escape.txt"), "blocked")
            .await
            .expect_err("path traversal must be rejected");

        assert!(matches!(err, AppError::Validation(_)));
        assert!(err.to_string().contains("path traversal"));
    }

    #[tokio::test]
    async fn read_file_rejects_absolute_path_outside_base() {
        let dir = tempdir().expect("temp dir");
        let service = IoService::new(dir.path().to_path_buf());

        let err = service
            .read_file(Path::new("/etc/passwd"))
            .await
            .expect_err("outside path must be rejected");

        assert!(matches!(err, AppError::Validation(_)));
        assert!(err.to_string().contains("outside allowed directory"));
    }
}
