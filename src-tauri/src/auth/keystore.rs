// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   AUTH OS — KEYSTORE (Stockage chiffré)
// ═══════════════════════════════════════════════════════════════

use crate::auth::{AuthError, AuthResult, DevTokenData, RoleBinding};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

/// Structure du keystore JSON
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Keystore {
    pub version: String,
    pub dev_token: Option<DevTokenData>,
    pub api_keys: ApiKeysStore,
    pub role_bindings: Vec<RoleBinding>,
}

/// Stockage des API keys (chiffrées via SecureSecretsEngine)
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ApiKeysStore {
    pub openai: Option<String>,
    pub anthropic: Option<String>,
    pub gemini: Option<String>,
}

impl ApiKeysStore {
    /// Au moins une API key configurée?
    pub fn is_any_configured(&self) -> bool {
        self.openai.is_some() || self.anthropic.is_some() || self.gemini.is_some()
    }
}

impl Keystore {
    /// Chemin du keystore
    pub fn path() -> AuthResult<PathBuf> {
        let home =
            std::env::var("HOME").map_err(|_| AuthError::IoError("HOME env var not set".into()))?;
        Ok(PathBuf::from(home)
            .join(".local")
            .join("share")
            .join("titane")
            .join("keystore.json"))
    }

    /// Charger le keystore (ou créer par défaut)
    pub fn load() -> AuthResult<Self> {
        let path = Self::path()?;

        if !path.exists() {
            // Créer keystore vide
            let keystore = Self::default();
            keystore.save()?;
            return Ok(keystore);
        }

        let content = fs::read_to_string(&path)?;
        let keystore: Keystore = serde_json::from_str(&content)?;
        Ok(keystore)
    }

    /// Sauvegarder le keystore
    pub fn save(&self) -> AuthResult<()> {
        let path = Self::path()?;

        // Créer dossier parent si nécessaire
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }

        let content = serde_json::to_string_pretty(self)?;
        fs::write(&path, content)?;
        Ok(())
    }

    /// Créer backup du keystore
    pub fn backup() -> AuthResult<PathBuf> {
        let path = Self::path()?;
        if !path.exists() {
            return Err(AuthError::KeystoreNotFound);
        }

        let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S");
        let backup_path = path.with_file_name(format!("keystore.backup.{}.json", timestamp));
        fs::copy(&path, &backup_path)?;
        Ok(backup_path)
    }

    /// Compter les secrets configurés
    pub fn count_secrets(&self) -> usize {
        let mut count = 0;
        if self.dev_token.is_some() {
            count += 1;
        }
        if self.api_keys.openai.is_some() {
            count += 1;
        }
        if self.api_keys.anthropic.is_some() {
            count += 1;
        }
        if self.api_keys.gemini.is_some() {
            count += 1;
        }
        count
    }
}

impl Default for Keystore {
    fn default() -> Self {
        Self {
            version: "1.0".to_string(),
            dev_token: None,
            api_keys: ApiKeysStore::default(),
            role_bindings: vec![],
        }
    }
}
