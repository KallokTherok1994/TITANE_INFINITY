// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

use serde::{Deserialize, Serialize};

/// Entrée de fichier dans le manifest
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileEntry {
    pub path: String,
    pub sha256: String,
    pub size: usize,
    pub timestamp: u64,
}

/// Manifest de mise à jour signé
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateManifest {
    pub version: String,
    pub timestamp: u64,
    pub description: String,
    pub files: Vec<FileEntry>,
    pub migration_script: Option<String>,
    pub signature: Vec<u8>,
}

impl UpdateManifest {
    /// Créer nouveau manifest
    pub fn new(version: String, description: String) -> Self {
        Self {
            version,
            timestamp: Self::current_timestamp(),
            description,
            files: Vec::new(),
            migration_script: None,
            signature: Vec::new(),
        }
    }

    /// Ajouter fichier
    pub fn add_file(&mut self, entry: FileEntry) {
        self.files.push(entry);
    }

    /// Obtenir données à signer (tout sauf signature)
    pub fn signable_data(&self) -> Result<Vec<u8>, String> {
        let mut manifest_copy = self.clone();
        manifest_copy.signature = Vec::new();
        serde_json::to_vec(&manifest_copy).map_err(|e| format!("Serialization error: {}", e))
    }

    fn current_timestamp() -> u64 {
        use std::time::{SystemTime, UNIX_EPOCH};
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or(0)
    }
}
