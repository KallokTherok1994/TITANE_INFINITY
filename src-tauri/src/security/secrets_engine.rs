// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — SECURE SECRETS ENGINE
//   Chiffrement AES-256-GCM + dérivation Argon2id
//   Stockage centralisé des secrets (Gemini, tokens, credentials)
// ═══════════════════════════════════════════════════════════════

use aes_gcm::aead::{Aead, KeyInit};
use aes_gcm::{Aes256Gcm, Nonce};
use argon2::password_hash::rand_core::RngCore;
use argon2::Argon2;
use base64::Engine as _;
use log::{debug, error, info, warn};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::{Arc, RwLock};

const SALT_LEN: usize = 16;
const NONCE_LEN: usize = 12;

#[derive(Debug, thiserror::Error)]
pub enum SecretsError {
    #[error("Missing secrets passphrase (set TITANE_SECRETS_PASSPHRASE)")]
    MissingPassphrase,
    #[error("Encryption failed: {0}")]
    Encryption(String),
    #[error("Decryption failed: {0}")]
    Decryption(String),
    #[error("I/O error: {0}")]
    Io(String),
    #[error("Serialization error: {0}")]
    Serialization(String),
    #[error("Secrets engine unavailable in ephemeral mode")]
    Ephemeral,
}

#[derive(Clone, Debug)]
pub enum SecretsMode {
    Encrypted { path: PathBuf, passphrase: String },
    Ephemeral,
}

#[derive(Serialize, Deserialize)]
struct SecretsFile {
    version: u8,
    secrets: HashMap<String, String>,
}

struct SecretsInner {
    mode: SecretsMode,
    secrets: RwLock<HashMap<String, String>>,
}

#[derive(Clone)]
pub struct SecureSecretsEngine {
    inner: Arc<SecretsInner>,
}

impl SecureSecretsEngine {
    /// Initialise le moteur. Si un mot de passe est fourni, les secrets sont persistant chiffrés.
    pub fn new(passphrase: Option<String>) -> Result<Self, SecretsError> {
        let trimmed = passphrase.and_then(|p| {
            let t = p.trim().to_string();
            if t.is_empty() {
                None
            } else {
                Some(t)
            }
        });

        let mut initial_secrets = HashMap::new();
        let mut needs_initial_persist = false;
        let mode = if let Some(pass) = trimmed {
            let path = Self::resolve_secrets_path()?;
            if let Some(parent) = path.parent() {
                fs::create_dir_all(parent).map_err(|e| SecretsError::Io(e.to_string()))?;
            }

            if path.exists() {
                match Self::decrypt_file(&path, &pass) {
                    Ok(map) => {
                        initial_secrets = map;
                    }
                    Err(err) => {
                        error!("[SecretsEngine] Failed to decrypt secrets file: {}", err);
                        initial_secrets = HashMap::new();
                    }
                }
            } else {
                debug!("[SecretsEngine] No secrets file detected. Creating new encrypted store");
                initial_secrets = HashMap::new();
                needs_initial_persist = true;
            }

            SecretsMode::Encrypted {
                path,
                passphrase: pass,
            }
        } else {
            warn!("[SecretsEngine] No passphrase configured. Running in ephemeral mode (no persistence)");
            SecretsMode::Ephemeral
        };

        let engine = SecureSecretsEngine {
            inner: Arc::new(SecretsInner {
                mode: mode.clone(),
                secrets: RwLock::new(initial_secrets),
            }),
        };

        if matches!(engine.mode(), SecretsMode::Encrypted { .. }) && needs_initial_persist {
            engine.persist().map_err(|e| {
                error!("[SecretsEngine] Failed to persist encrypted store: {}", e);
                e
            })?;
        }

        info!(
            "[SecretsEngine] Secure secrets engine initialised ({})",
            match engine.mode() {
                SecretsMode::Encrypted { .. } => "encrypted".to_string(),
                SecretsMode::Ephemeral => "ephemeral".to_string(),
            }
        );

        Ok(engine)
    }

    pub fn mode(&self) -> SecretsMode {
        match &self.inner.mode {
            SecretsMode::Encrypted { path, passphrase } => SecretsMode::Encrypted {
                path: path.clone(),
                passphrase: passphrase.clone(),
            },
            SecretsMode::Ephemeral => SecretsMode::Ephemeral,
        }
    }

    pub fn get_secret(&self, key: &str) -> Result<Option<String>, SecretsError> {
        let guard = self
            .inner
            .secrets
            .read()
            .map_err(|_| SecretsError::Io("Poisoned lock".into()))?;
        Ok(guard.get(key).cloned())
    }

    pub fn has_secret(&self, key: &str) -> Result<bool, SecretsError> {
        let guard = self
            .inner
            .secrets
            .read()
            .map_err(|_| SecretsError::Io("Poisoned lock".into()))?;
        Ok(guard.contains_key(key))
    }

    pub fn set_secret(&self, key: &str, value: String) -> Result<(), SecretsError> {
        {
            let mut guard = self
                .inner
                .secrets
                .write()
                .map_err(|_| SecretsError::Io("Poisoned lock".into()))?;
            guard.insert(key.to_string(), value);
        }

        if matches!(self.inner.mode, SecretsMode::Ephemeral) {
            warn!(
                "[SecretsEngine] Secret '{}' stored in-memory only (ephemeral mode)",
                key
            );
            return Ok(());
        }
        self.persist()
    }

    pub fn clear_secret(&self, key: &str) -> Result<(), SecretsError> {
        {
            let mut guard = self
                .inner
                .secrets
                .write()
                .map_err(|_| SecretsError::Io("Poisoned lock".into()))?;
            guard.remove(key);
        }

        if matches!(self.inner.mode, SecretsMode::Ephemeral) {
            return Ok(());
        }
        self.persist()
    }

    fn persist(&self) -> Result<(), SecretsError> {
        match &self.inner.mode {
            SecretsMode::Encrypted { path, passphrase } => {
                let snapshot = {
                    let guard = self
                        .inner
                        .secrets
                        .read()
                        .map_err(|_| SecretsError::Io("Poisoned lock".into()))?;
                    guard.clone()
                };

                let payload = SecretsFile {
                    version: 1,
                    secrets: snapshot,
                };

                let json = serde_json::to_vec(&payload)
                    .map_err(|e| SecretsError::Serialization(e.to_string()))?;

                let encrypted = Self::encrypt_buffer(passphrase, &json)?;

                let encoded = base64::engine::general_purpose::STANDARD.encode(encrypted);
                let mut file =
                    fs::File::create(path).map_err(|e| SecretsError::Io(e.to_string()))?;
                file.write_all(encoded.as_bytes())
                    .map_err(|e| SecretsError::Io(e.to_string()))?;

                #[cfg(unix)]
                {
                    use std::os::unix::fs::PermissionsExt;
                    let mut perms = file
                        .metadata()
                        .map_err(|e| SecretsError::Io(e.to_string()))?
                        .permissions();
                    perms.set_mode(0o600);
                    fs::set_permissions(path, perms)
                        .map_err(|e| SecretsError::Io(e.to_string()))?;
                }

                Ok(())
            }
            SecretsMode::Ephemeral => Ok(()),
        }
    }

    fn resolve_secrets_path() -> Result<PathBuf, SecretsError> {
        let base = dirs::config_dir().unwrap_or_else(|| PathBuf::from("."));
        let path = base.join("titane_infinity").join("secrets.enc");
        Ok(path)
    }

    fn decrypt_file(
        path: &Path,
        passphrase: &str,
    ) -> Result<HashMap<String, String>, SecretsError> {
        let content = fs::read_to_string(path).map_err(|e| SecretsError::Io(e.to_string()))?;
        let decoded = base64::engine::general_purpose::STANDARD
            .decode(content.as_bytes())
            .map_err(|e| SecretsError::Decryption(e.to_string()))?;

        if decoded.len() < SALT_LEN + NONCE_LEN {
            return Err(SecretsError::Decryption("Corrupted secrets payload".into()));
        }

        let salt = &decoded[..SALT_LEN];
        let nonce = &decoded[SALT_LEN..SALT_LEN + NONCE_LEN];
        let ciphertext = &decoded[SALT_LEN + NONCE_LEN..];

        let key = Self::derive_key(passphrase, salt)?;
        let cipher =
            Aes256Gcm::new_from_slice(&key).map_err(|e| SecretsError::Decryption(e.to_string()))?;

        let plaintext = cipher
            .decrypt(Nonce::from_slice(nonce), ciphertext)
            .map_err(|e| SecretsError::Decryption(e.to_string()))?;

        let file: SecretsFile = serde_json::from_slice(&plaintext)
            .map_err(|e| SecretsError::Serialization(e.to_string()))?;

        Ok(file.secrets)
    }

    fn encrypt_buffer(passphrase: &str, plaintext: &[u8]) -> Result<Vec<u8>, SecretsError> {
        let mut salt = [0u8; SALT_LEN];
        let mut nonce = [0u8; NONCE_LEN];
        let mut rng = rand::rngs::OsRng;
        rng.fill_bytes(&mut salt);
        rng.fill_bytes(&mut nonce);

        let key = Self::derive_key(passphrase, &salt)?;
        let cipher =
            Aes256Gcm::new_from_slice(&key).map_err(|e| SecretsError::Encryption(e.to_string()))?;

        let ciphertext = cipher
            .encrypt(Nonce::from_slice(&nonce), plaintext)
            .map_err(|e| SecretsError::Encryption(e.to_string()))?;

        let mut payload = Vec::with_capacity(SALT_LEN + NONCE_LEN + ciphertext.len());
        payload.extend_from_slice(&salt);
        payload.extend_from_slice(&nonce);
        payload.extend_from_slice(&ciphertext);

        Ok(payload)
    }

    fn derive_key(passphrase: &str, salt: &[u8]) -> Result<[u8; 32], SecretsError> {
        let mut key = [0u8; 32];
        Argon2::default()
            .hash_password_into(passphrase.as_bytes(), salt, &mut key)
            .map_err(|e| SecretsError::Encryption(e.to_string()))?;
        Ok(key)
    }
}

impl Default for SecureSecretsEngine {
    fn default() -> Self {
        SecureSecretsEngine {
            inner: Arc::new(SecretsInner {
                mode: SecretsMode::Ephemeral,
                secrets: RwLock::new(HashMap::new()),
            }),
        }
    }
}
