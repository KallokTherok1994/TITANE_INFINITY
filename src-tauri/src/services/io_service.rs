// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — SERVICES: IO
//   File operations - read/write with security
// ═══════════════════════════════════════════════════════════════

#![allow(dead_code)] // IO Service - used by file commands

use crate::utils::{AppResult, AppError};
use std::path::{Path, PathBuf};
use tokio::fs;

pub struct IoService {
    base_path: PathBuf,
}

impl IoService {
    pub fn new(base_path: PathBuf) -> Self {
        Self { base_path }
    }

    /// Validate path is within allowed directory
    fn validate_path(&self, path: &Path) -> AppResult<PathBuf> {
        let canonical = path.canonicalize()
            .map_err(|e| AppError::Validation(format!("Invalid path: {}", e)))?;

        if !canonical.starts_with(&self.base_path) {
            return Err(AppError::Validation("Path outside allowed directory".to_string()));
        }

        Ok(canonical)
    }

    /// Read file as string
    pub async fn read_file(&self, path: &Path) -> AppResult<String> {
        let validated = self.validate_path(path)?;

        let content = fs::read_to_string(&validated).await
            .map_err(|e| AppError::Io(format!("Failed to read file: {}", e)))?;

        Ok(content)
    }

    /// Write string to file
    pub async fn write_file(&self, path: &Path, content: &str) -> AppResult<()> {
        let validated = self.validate_path(path)?;

        // Create parent directories if needed
        if let Some(parent) = validated.parent() {
            fs::create_dir_all(parent).await
                .map_err(|e| AppError::Io(format!("Failed to create directories: {}", e)))?;
        }

        fs::write(validated, content).await
            .map_err(|e| AppError::Io(format!("Failed to write file: {}", e)))?;

        Ok(())
    }

    /// Check if file exists
    pub async fn exists(&self, path: &Path) -> bool {
        if let Ok(validated) = self.validate_path(path) {
            validated.exists()
        } else {
            false
        }
    }

    /// Delete file
    pub async fn delete_file(&self, path: &Path) -> AppResult<()> {
        let validated = self.validate_path(path)?;

        fs::remove_file(validated).await
            .map_err(|e| AppError::Io(format!("Failed to delete file: {}", e)))?;

        Ok(())
    }

    /// List files in directory
    pub async fn list_dir(&self, path: &Path) -> AppResult<Vec<PathBuf>> {
        let validated = self.validate_path(path)?;

        let mut entries = fs::read_dir(validated).await
            .map_err(|e| AppError::Io(format!("Failed to read directory: {}", e)))?;

        let mut files = Vec::new();
        while let Some(entry) = entries.next_entry().await
            .map_err(|e| AppError::Io(format!("Failed to read entry: {}", e)))? {
            files.push(entry.path());
        }

        Ok(files)
    }
}
