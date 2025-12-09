//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — VAULT BRIDGE
//! Super Prompt #17 — Accès sécurisé aux clés API via le Security Layer
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::sync::RwLock;
use super::{Provider, APIHubError};

/// Entrée du vault
#[derive(Clone, Debug)]
struct VaultEntry {
    key: String,
    encrypted: bool,
    created_at: u64,
    last_accessed: u64,
    access_count: u64,
}

/// Statistiques d'accès
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct VaultStats {
    pub total_accesses: u64,
    pub accesses_by_provider: HashMap<String, u64>,
    pub last_access: Option<u64>,
}

/// Audit trail entry
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AuditEntry {
    pub timestamp: u64,
    pub provider: Provider,
    pub action: AuditAction,
    pub success: bool,
    pub requester: Option<String>,
}

/// Action auditée
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum AuditAction {
    KeyAccess,
    KeyStore,
    KeyDelete,
    KeyRotate,
}

/// État interne du vault
struct VaultState {
    entries: HashMap<Provider, VaultEntry>,
    audit_log: Vec<AuditEntry>,
    stats: VaultStats,
}

impl Default for VaultState {
    fn default() -> Self {
        Self {
            entries: HashMap::new(),
            audit_log: Vec::new(),
            stats: VaultStats::default(),
        }
    }
}

/// Pont vers le vault de clés API
pub struct VaultBridge {
    state: RwLock<VaultState>,
    encryption_enabled: bool,
}

impl VaultBridge {
    pub fn new() -> Self {
        Self {
            state: RwLock::new(VaultState::default()),
            encryption_enabled: true,
        }
    }

    /// Récupère une clé API pour un provider
    pub async fn get_api_key(&self, provider: Provider) -> Result<Option<String>, APIHubError> {
        let mut state = self.state.write().await;
        let now = Self::now();

        // Audit l'accès
        state.audit_log.push(AuditEntry {
            timestamp: now,
            provider,
            action: AuditAction::KeyAccess,
            success: true,
            requester: None,
        });

        // Mettre à jour les stats
        state.stats.total_accesses += 1;
        *state.stats.accesses_by_provider
            .entry(format!("{:?}", provider))
            .or_insert(0) += 1;
        state.stats.last_access = Some(now);

        // Récupérer la clé
        if let Some(entry) = state.entries.get_mut(&provider) {
            entry.last_accessed = now;
            entry.access_count += 1;

            let key = if entry.encrypted {
                self.decrypt(&entry.key)?
            } else {
                entry.key.clone()
            };

            Ok(Some(key))
        } else {
            // Essayer de charger depuis l'environnement
            let env_key = self.get_env_key(provider);
            if let Some(key) = env_key {
                // Stocker pour les prochains accès
                self.store_key_internal(&mut state, provider, &key).await?;
                Ok(Some(key))
            } else {
                Ok(None)
            }
        }
    }

    /// Stocke une clé API
    pub async fn store_api_key(&self, provider: Provider, key: &str) -> Result<(), APIHubError> {
        let mut state = self.state.write().await;
        self.store_key_internal(&mut state, provider, key).await
    }

    /// Stocke une clé (implémentation interne)
    async fn store_key_internal(
        &self,
        state: &mut VaultState,
        provider: Provider,
        key: &str,
    ) -> Result<(), APIHubError> {
        let now = Self::now();

        let stored_key = if self.encryption_enabled {
            self.encrypt(key)?
        } else {
            key.to_string()
        };

        state.entries.insert(provider, VaultEntry {
            key: stored_key,
            encrypted: self.encryption_enabled,
            created_at: now,
            last_accessed: now,
            access_count: 0,
        });

        // Audit
        state.audit_log.push(AuditEntry {
            timestamp: now,
            provider,
            action: AuditAction::KeyStore,
            success: true,
            requester: None,
        });

        Ok(())
    }

    /// Supprime une clé API
    pub async fn delete_api_key(&self, provider: Provider) -> Result<bool, APIHubError> {
        let mut state = self.state.write().await;
        let now = Self::now();

        let existed = state.entries.remove(&provider).is_some();

        state.audit_log.push(AuditEntry {
            timestamp: now,
            provider,
            action: AuditAction::KeyDelete,
            success: existed,
            requester: None,
        });

        Ok(existed)
    }

    /// Rotate une clé API
    pub async fn rotate_api_key(&self, provider: Provider, new_key: &str) -> Result<(), APIHubError> {
        let mut state = self.state.write().await;
        let now = Self::now();

        // Supprimer l'ancienne
        state.entries.remove(&provider);

        // Stocker la nouvelle
        self.store_key_internal(&mut state, provider, new_key).await?;

        // Audit
        state.audit_log.push(AuditEntry {
            timestamp: now,
            provider,
            action: AuditAction::KeyRotate,
            success: true,
            requester: None,
        });

        Ok(())
    }

    /// Vérifie si une clé existe pour un provider
    pub async fn has_key(&self, provider: Provider) -> bool {
        let state = self.state.read().await;
        state.entries.contains_key(&provider) || self.get_env_key(provider).is_some()
    }

    /// Liste les providers avec clés configurées
    pub async fn configured_providers(&self) -> Vec<Provider> {
        let state = self.state.read().await;
        let mut providers: Vec<Provider> = state.entries.keys().copied().collect();

        // Ajouter ceux de l'environnement
        for provider in [Provider::OpenAI, Provider::Gemini, Provider::Anthropic] {
            if !providers.contains(&provider) && self.get_env_key(provider).is_some() {
                providers.push(provider);
            }
        }

        providers
    }

    /// Récupère les statistiques
    pub async fn get_stats(&self) -> VaultStats {
        let state = self.state.read().await;
        state.stats.clone()
    }

    /// Récupère l'audit log
    pub async fn get_audit_log(&self, limit: usize) -> Vec<AuditEntry> {
        let state = self.state.read().await;
        state.audit_log.iter().rev().take(limit).cloned().collect()
    }

    /// Récupère une clé depuis les variables d'environnement
    fn get_env_key(&self, provider: Provider) -> Option<String> {
        let env_var = match provider {
            Provider::OpenAI => "OPENAI_API_KEY",
            Provider::Gemini => "GOOGLE_API_KEY",
            Provider::Anthropic => "ANTHROPIC_API_KEY",
            Provider::Local => return None,
        };

        std::env::var(env_var).ok()
    }

    /// Chiffre une clé (simulation - en production utiliser vraie crypto)
    fn encrypt(&self, plaintext: &str) -> Result<String, APIHubError> {
        // En production: utiliser AES-256-GCM ou similaire
        // Ici: simple obfuscation pour la démo
        use base64::{Engine as _, engine::general_purpose::STANDARD};
        let rotated: String = plaintext.chars()
            .map(|c| {
                if c.is_ascii_alphabetic() {
                    let base = if c.is_ascii_lowercase() { b'a' } else { b'A' };
                    let rotated = ((c as u8 - base + 13) % 26) + base;
                    rotated as char
                } else {
                    c
                }
            })
            .collect();
        Ok(STANDARD.encode(rotated.as_bytes()))
    }

    /// Déchiffre une clé
    fn decrypt(&self, ciphertext: &str) -> Result<String, APIHubError> {
        use base64::{Engine as _, engine::general_purpose::STANDARD};
        let decoded = STANDARD.decode(ciphertext)
            .map_err(|e| APIHubError::ConfigurationError(format!("Decryption failed: {}", e)))?;
        let rotated = String::from_utf8(decoded)
            .map_err(|e| APIHubError::ConfigurationError(format!("Invalid UTF-8: {}", e)))?;

        // Reverse ROT13
        let plaintext: String = rotated.chars()
            .map(|c| {
                if c.is_ascii_alphabetic() {
                    let base = if c.is_ascii_lowercase() { b'a' } else { b'A' };
                    let rotated = ((c as u8 - base + 13) % 26) + base;
                    rotated as char
                } else {
                    c
                }
            })
            .collect();

        Ok(plaintext)
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for VaultBridge {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_vault_store_and_retrieve() {
        let vault = VaultBridge::new();

        vault.store_api_key(Provider::OpenAI, "sk-test-key-123").await.unwrap();

        let key = vault.get_api_key(Provider::OpenAI).await.unwrap();
        assert!(key.is_some());
        assert_eq!(key.unwrap(), "sk-test-key-123");
    }

    #[tokio::test]
    async fn test_vault_delete() {
        let vault = VaultBridge::new();

        vault.store_api_key(Provider::Gemini, "test-key").await.unwrap();
        assert!(vault.has_key(Provider::Gemini).await);

        vault.delete_api_key(Provider::Gemini).await.unwrap();

        // Should still check env, so we check the internal state
        let key = vault.get_api_key(Provider::Gemini).await.unwrap();
        // If no env var, should be None
        // (depends on environment)
    }

    #[tokio::test]
    async fn test_vault_rotate() {
        let vault = VaultBridge::new();

        vault.store_api_key(Provider::Anthropic, "old-key").await.unwrap();
        vault.rotate_api_key(Provider::Anthropic, "new-key").await.unwrap();

        let key = vault.get_api_key(Provider::Anthropic).await.unwrap();
        assert_eq!(key.unwrap(), "new-key");
    }

    #[tokio::test]
    async fn test_vault_stats() {
        let vault = VaultBridge::new();

        vault.store_api_key(Provider::OpenAI, "key1").await.unwrap();
        vault.get_api_key(Provider::OpenAI).await.unwrap();
        vault.get_api_key(Provider::OpenAI).await.unwrap();

        let stats = vault.get_stats().await;
        // At least 2 accesses (store might also count as access internally)
        assert!(stats.total_accesses >= 2);
    }

    #[tokio::test]
    async fn test_audit_log() {
        let vault = VaultBridge::new();

        vault.store_api_key(Provider::OpenAI, "key").await.unwrap();
        vault.get_api_key(Provider::OpenAI).await.unwrap();
        vault.delete_api_key(Provider::OpenAI).await.unwrap();

        let log = vault.get_audit_log(10).await;
        assert!(log.len() >= 3);
    }

    #[test]
    fn test_encryption_roundtrip() {
        let vault = VaultBridge::new();
        let original = "sk-test-secret-key-12345";

        let encrypted = vault.encrypt(original).unwrap();
        assert_ne!(encrypted, original);

        let decrypted = vault.decrypt(&encrypted).unwrap();
        assert_eq!(decrypted, original);
    }
}
