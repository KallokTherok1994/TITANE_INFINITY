// ─────────────────────────────────────────────────────────────────────────────
//   TITANE∞ Remote Gateway — Named API Key Store
//   Ring 0 | Phase 1 | v31.2.x
//
//   Provides:
//   - Per-client named API keys with argon2id hashing
//   - Scoped keys (scopes: "chat", "memory", "system", "admin")
//   - Revocation, rotation, masking
//   - Disk persistence (optional — falls back to in-memory)
//   - Backward compat: TITANE_REMOTE_SECRET → auto "default" key on startup
// ─────────────────────────────────────────────────────────────────────────────

use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, path::PathBuf};
use uuid::Uuid;

// ── Scopes ────────────────────────────────────────────────────────────────────

/// Allowed permission scopes for a named API key.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum KeyScope {
    /// Full access (token generation + all commands)
    Admin,
    /// AI conversation commands
    Chat,
    /// Memory read/write commands
    Memory,
    /// System health / diagnostic commands
    System,
}

impl KeyScope {
    pub fn all() -> Vec<KeyScope> {
        vec![
            KeyScope::Admin,
            KeyScope::Chat,
            KeyScope::Memory,
            KeyScope::System,
        ]
    }

    pub fn from_str_vec(v: &[String]) -> Vec<KeyScope> {
        v.iter()
            .filter_map(|s| match s.as_str() {
                "admin" => Some(KeyScope::Admin),
                "chat" => Some(KeyScope::Chat),
                "memory" => Some(KeyScope::Memory),
                "system" => Some(KeyScope::System),
                _ => None,
            })
            .collect()
    }
}

// ── Entry ─────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiKeyEntry {
    /// Public key identifier (shown in listings)
    pub key_id: String,
    /// Human-readable label
    pub label: String,
    /// argon2id hash of the secret (never stored in plain text)
    pub secret_hash: String,
    /// Allowed scopes
    pub scopes: Vec<KeyScope>,
    /// Creation timestamp (RFC 3339)
    pub created_at: String,
    /// Last used timestamp (RFC 3339), None until first use
    pub last_used: Option<String>,
    /// Whether the key is active
    pub enabled: bool,
}

/// Masked representation (no hash, safe to return to clients)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiKeyMasked {
    pub key_id: String,
    pub label: String,
    pub scopes: Vec<KeyScope>,
    pub created_at: String,
    pub last_used: Option<String>,
    pub enabled: bool,
}

impl From<&ApiKeyEntry> for ApiKeyMasked {
    fn from(e: &ApiKeyEntry) -> Self {
        ApiKeyMasked {
            key_id: e.key_id.clone(),
            label: e.label.clone(),
            scopes: e.scopes.clone(),
            created_at: e.created_at.clone(),
            last_used: e.last_used.clone(),
            enabled: e.enabled,
        }
    }
}

// ── Store ─────────────────────────────────────────────────────────────────────

#[derive(Debug, Default, Serialize, Deserialize)]
struct StoreDisk {
    entries: HashMap<String, ApiKeyEntry>,
}

pub struct ApiKeyStore {
    entries: HashMap<String, ApiKeyEntry>,
    store_path: Option<PathBuf>,
}

impl ApiKeyStore {
    /// Create an empty in-memory store (no persistence).
    pub fn new_in_memory() -> Self {
        Self {
            entries: HashMap::new(),
            store_path: None,
        }
    }

    /// Load from disk (or create empty if file absent).
    pub fn load_or_create(path: PathBuf) -> Self {
        let entries = if path.exists() {
            match std::fs::read_to_string(&path) {
                Ok(raw) => match serde_json::from_str::<StoreDisk>(&raw) {
                    Ok(disk) => disk.entries,
                    Err(e) => {
                        log::warn!("[ApiKeyStore] failed to parse store at {:?}: {e}", path);
                        HashMap::new()
                    }
                },
                Err(e) => {
                    log::warn!("[ApiKeyStore] failed to read store at {:?}: {e}", path);
                    HashMap::new()
                }
            }
        } else {
            HashMap::new()
        };

        Self {
            entries,
            store_path: Some(path),
        }
    }

    /// Persist to disk (no-op for in-memory stores).
    fn persist(&self) {
        let Some(ref path) = self.store_path else {
            return;
        };
        let disk = StoreDisk {
            entries: self.entries.clone(),
        };
        let raw = match serde_json::to_string_pretty(&disk) {
            Ok(r) => r,
            Err(e) => {
                log::error!("[ApiKeyStore] serialization error: {e}");
                return;
            }
        };
        if let Some(parent) = path.parent() {
            let _ = std::fs::create_dir_all(parent);
        }
        if let Err(e) = std::fs::write(path, raw) {
            log::error!("[ApiKeyStore] write error: {e}");
        }
    }

    // ── Operations ─────────────────────────────────────────────────────────────

    /// Create a new named API key.
    /// Returns `(key_id, plaintext_secret)` — the plaintext is shown ONCE.
    pub fn create_key(
        &mut self,
        label: impl Into<String>,
        scopes: Vec<KeyScope>,
    ) -> Result<(String, String), String> {
        let key_id = format!("tk_{}", Uuid::new_v4().simple());
        let plaintext = format!("tsec_{}", Uuid::new_v4().simple());
        let secret_hash = hash_secret(&plaintext)?;

        let entry = ApiKeyEntry {
            key_id: key_id.clone(),
            label: label.into(),
            secret_hash,
            scopes,
            created_at: Utc::now().to_rfc3339(),
            last_used: None,
            enabled: true,
        };

        self.entries.insert(key_id.clone(), entry);
        self.persist();

        Ok((key_id, plaintext))
    }

    /// Auto-create a "default" key from a plaintext secret (backward compat with TITANE_REMOTE_SECRET).
    /// If a key named "default" already exists, it is NOT replaced.
    /// Returns the key_id of the default key.
    pub fn ensure_default_key(&mut self, plaintext: &str) -> Result<String, String> {
        // Check if a key with label "default" already exists
        if let Some(existing) = self.entries.values().find(|e| e.label == "default") {
            return Ok(existing.key_id.clone());
        }

        let key_id = "tk_default".to_string();
        let secret_hash = hash_secret(plaintext)?;

        let entry = ApiKeyEntry {
            key_id: key_id.clone(),
            label: "default".to_string(),
            secret_hash,
            scopes: KeyScope::all(),
            created_at: Utc::now().to_rfc3339(),
            last_used: None,
            enabled: true,
        };

        self.entries.insert(key_id.clone(), entry);
        self.persist();

        Ok(key_id)
    }

    /// Verify a key_id + candidate secret.
    /// Updates `last_used` on success.
    pub fn verify(&mut self, key_id: &str, candidate: &str) -> bool {
        let entry = match self.entries.get(key_id) {
            Some(e) => e,
            None => return false,
        };

        if !entry.enabled {
            return false;
        }

        let valid = verify_secret(candidate, &entry.secret_hash);
        if valid {
            // Update last_used
            if let Some(entry_mut) = self.entries.get_mut(key_id) {
                entry_mut.last_used = Some(Utc::now().to_rfc3339());
            }
            self.persist();
        }
        valid
    }

    /// Backward-compat verify: check candidate against any enabled key's hash.
    /// Used when the caller does not provide a key_id (legacy auth flow).
    /// Returns the key_id of the matching entry if found.
    pub fn verify_any(&mut self, candidate: &str) -> Option<String> {
        let matching_id = self
            .entries
            .iter()
            .find(|(_, e)| e.enabled && verify_secret(candidate, &e.secret_hash))
            .map(|(id, _)| id.clone());

        if let Some(ref id) = matching_id {
            if let Some(entry) = self.entries.get_mut(id) {
                entry.last_used = Some(Utc::now().to_rfc3339());
            }
            self.persist();
        }

        matching_id
    }

    /// Revoke (disable) a key.
    pub fn revoke(&mut self, key_id: &str) -> Result<(), String> {
        match self.entries.get_mut(key_id) {
            Some(entry) => {
                entry.enabled = false;
                self.persist();
                Ok(())
            }
            None => Err(format!("key_id '{}' not found", key_id)),
        }
    }

    /// Rotate a key: revoke old entry and create a new one with same label + scopes.
    /// Returns `(new_key_id, new_plaintext_secret)`.
    pub fn rotate(&mut self, key_id: &str) -> Result<(String, String), String> {
        let (label, scopes) = match self.entries.get(key_id) {
            Some(e) => (e.label.clone(), e.scopes.clone()),
            None => return Err(format!("key_id '{}' not found", key_id)),
        };

        // Revoke old
        if let Some(entry) = self.entries.get_mut(key_id) {
            entry.enabled = false;
        }

        // Create new
        self.create_key(label, scopes)
    }

    /// List all keys as masked entries (no hashes).
    pub fn list_masked(&self) -> Vec<ApiKeyMasked> {
        let mut list: Vec<ApiKeyMasked> = self
            .entries
            .values()
            .map(ApiKeyMasked::from)
            .collect();
        list.sort_by(|a, b| a.created_at.cmp(&b.created_at));
        list
    }

    /// Get a single entry's scopes (for authorization checks).
    pub fn get_scopes(&self, key_id: &str) -> Option<Vec<KeyScope>> {
        self.entries
            .get(key_id)
            .filter(|e| e.enabled)
            .map(|e| e.scopes.clone())
    }

    /// Check if the store is empty.
    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }
}

// ── Crypto helpers ────────────────────────────────────────────────────────────

fn hash_secret(plaintext: &str) -> Result<String, String> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    argon2
        .hash_password(plaintext.as_bytes(), &salt)
        .map(|h| h.to_string())
        .map_err(|e| format!("argon2 hash error: {e}"))
}

fn verify_secret(candidate: &str, hash_str: &str) -> bool {
    let Ok(parsed) = PasswordHash::new(hash_str) else {
        log::warn!("[ApiKeyStore] invalid hash format in store");
        return false;
    };
    Argon2::default()
        .verify_password(candidate.as_bytes(), &parsed)
        .is_ok()
}

// ── Unit tests ────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_and_verify_key() {
        let mut store = ApiKeyStore::new_in_memory();
        let (key_id, plaintext) = store
            .create_key("test-key", vec![KeyScope::Chat])
            .expect("create_key failed");

        assert!(key_id.starts_with("tk_"));
        assert!(plaintext.starts_with("tsec_"));
        assert!(store.verify(&key_id, &plaintext));
        assert!(!store.verify(&key_id, "wrong-secret"));
    }

    #[test]
    fn test_verify_any() {
        let mut store = ApiKeyStore::new_in_memory();
        let (key_id, plaintext) = store
            .create_key("any-key", KeyScope::all())
            .expect("create_key failed");

        let found = store.verify_any(&plaintext);
        assert_eq!(found, Some(key_id));
    }

    #[test]
    fn test_revoke() {
        let mut store = ApiKeyStore::new_in_memory();
        let (key_id, plaintext) = store
            .create_key("revoke-key", vec![KeyScope::Chat])
            .expect("create_key failed");

        store.revoke(&key_id).unwrap();
        assert!(!store.verify(&key_id, &plaintext));
    }

    #[test]
    fn test_rotate() {
        let mut store = ApiKeyStore::new_in_memory();
        let (key_id, old_plain) = store
            .create_key("rotate-key", vec![KeyScope::Admin])
            .expect("create_key failed");

        let (new_id, new_plain) = store.rotate(&key_id).unwrap();
        assert_ne!(key_id, new_id);
        // Old key disabled
        assert!(!store.verify(&key_id, &old_plain));
        // New key works
        assert!(store.verify(&new_id, &new_plain));
    }

    #[test]
    fn test_ensure_default_key_idempotent() {
        let mut store = ApiKeyStore::new_in_memory();
        let id1 = store.ensure_default_key("my-remote-secret").unwrap();
        let id2 = store.ensure_default_key("other-value").unwrap();
        assert_eq!(id1, id2, "ensure_default_key must be idempotent");
    }

    #[test]
    fn test_list_masked_no_hashes() {
        let mut store = ApiKeyStore::new_in_memory();
        store.create_key("a", vec![KeyScope::Chat]).unwrap();
        store.create_key("b", vec![KeyScope::Admin]).unwrap();

        let list = store.list_masked();
        assert_eq!(list.len(), 2);
        // Confirm serialization has no secret_hash field
        let json = serde_json::to_string(&list).unwrap();
        assert!(!json.contains("secret_hash"));
    }

    #[test]
    fn test_scope_coverage() {
        let all = KeyScope::all();
        assert!(all.contains(&KeyScope::Admin));
        assert!(all.contains(&KeyScope::Chat));
        assert!(all.contains(&KeyScope::Memory));
        assert!(all.contains(&KeyScope::System));
    }
}
