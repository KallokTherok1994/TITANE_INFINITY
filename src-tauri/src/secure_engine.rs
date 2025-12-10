// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — SECURE SECRETS CORE
//   AES-256-GCM + Argon2id helpers for SecureSecretsEngine
//   All operations are zeroized and tokio-async compliant
// ═══════════════════════════════════════════════════════════════

use aes_gcm::aead::{Aead, KeyInit};
use aes_gcm::{Aes256Gcm, Nonce};
use argon2::{password_hash::rand_core::RngCore, Argon2};
use base64::{engine::general_purpose, Engine as _};
use rand::rngs::OsRng;
use std::path::Path;
use tokio::fs;
use zeroize::{Zeroize, Zeroizing};

const SALT_LEN: usize = 16;
const NONCE_LEN: usize = 12;

#[derive(Debug, thiserror::Error)]
pub enum SecureEngineError {
    #[error("Missing TITANE_SECRETS_PASSPHRASE environment variable")]
    MissingPassphrase,
    #[error("Cryptographic error: {0}")]
    Crypto(String),
    #[error("Invalid payload: {0}")]
    InvalidPayload(String),
    #[error("I/O error: {0}")]
    Io(String),
}

pub type SecureEngineResult<T> = Result<T, SecureEngineError>;

/// Derive a 256-bit key using Argon2id from the provided passphrase and salt.
pub fn derive_key_from_passphrase(
    passphrase: &str,
    salt: &[u8],
) -> SecureEngineResult<Zeroizing<[u8; 32]>> {
    if passphrase.trim().is_empty() {
        return Err(SecureEngineError::MissingPassphrase);
    }

    let mut key = Zeroizing::new([0u8; 32]);
    Argon2::default()
        .hash_password_into(passphrase.as_bytes(), salt, key.as_mut())
        .map_err(|e| SecureEngineError::Crypto(e.to_string()))?;

    Ok(key)
}

/// Encrypt a secret value returning a base64-encoded payload (salt || nonce || ciphertext).
pub fn encrypt_secret(passphrase: &str, plaintext: &[u8]) -> SecureEngineResult<Vec<u8>> {
    let mut salt = [0u8; SALT_LEN];
    let mut nonce_bytes = [0u8; NONCE_LEN];
    OsRng.fill_bytes(&mut salt);
    OsRng.fill_bytes(&mut nonce_bytes);

    let key = derive_key_from_passphrase(passphrase, &salt)?;
    let cipher = Aes256Gcm::new_from_slice(key.as_ref())
        .map_err(|e| SecureEngineError::Crypto(e.to_string()))?;

    let nonce = Nonce::from_slice(&nonce_bytes);
    let ciphertext = cipher
        .encrypt(nonce, plaintext)
        .map_err(|e| SecureEngineError::Crypto(e.to_string()))?;

    let mut payload = Vec::with_capacity(SALT_LEN + NONCE_LEN + ciphertext.len());
    payload.extend_from_slice(&salt);
    payload.extend_from_slice(&nonce_bytes);
    payload.extend_from_slice(&ciphertext);

    let encoded = general_purpose::STANDARD.encode(payload);
    Ok(encoded.into_bytes())
}

/// Decrypt a base64-encoded payload (salt || nonce || ciphertext) using the passphrase.
pub fn decrypt_secret(passphrase: &str, payload: &[u8]) -> SecureEngineResult<Vec<u8>> {
    let decoded = general_purpose::STANDARD
        .decode(payload)
        .map_err(|e| SecureEngineError::InvalidPayload(e.to_string()))?;

    if decoded.len() < SALT_LEN + NONCE_LEN {
        return Err(SecureEngineError::InvalidPayload(
            "Payload too short to contain salt and nonce".into(),
        ));
    }

    let salt = &decoded[..SALT_LEN];
    let nonce_bytes = &decoded[SALT_LEN..SALT_LEN + NONCE_LEN];
    let ciphertext = &decoded[SALT_LEN + NONCE_LEN..];

    let key = derive_key_from_passphrase(passphrase, salt)?;
    let cipher = Aes256Gcm::new_from_slice(key.as_ref())
        .map_err(|e| SecureEngineError::Crypto(e.to_string()))?;

    let nonce = Nonce::from_slice(nonce_bytes);
    cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| SecureEngineError::Crypto(e.to_string()))
}

/// Write an encrypted payload to the provided file path (ensures directories exist).
pub async fn write_secret_file(path: &Path, data: &[u8]) -> SecureEngineResult<()> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .await
            .map_err(|e| SecureEngineError::Io(e.to_string()))?;
    }

    fs::write(path, data)
        .await
        .map_err(|e| SecureEngineError::Io(e.to_string()))
}

/// Read a secret file returning its raw bytes.
pub async fn read_secret_file(path: &Path) -> SecureEngineResult<Vec<u8>> {
    fs::read(path)
        .await
        .map_err(|e| SecureEngineError::Io(e.to_string()))
}

/// Remove a sensitive key from the local .env file if it exists (best-effort).
pub async fn purge_env_key(key: &str) -> SecureEngineResult<()> {
    let current_dir = std::env::current_dir().map_err(|e| SecureEngineError::Io(e.to_string()))?;
    let env_path = current_dir.join(".env");

    if !env_path.exists() {
        return Ok(());
    }

    let contents = fs::read_to_string(&env_path)
        .await
        .map_err(|e| SecureEngineError::Io(e.to_string()))?;

    let needle = format!("{}=", key);
    let mut changed = false;
    let filtered: String = contents
        .lines()
        .filter(|line| {
            let keep = !line.trim_start().starts_with(&needle);
            if !keep {
                changed = true;
            }
            keep
        })
        .map(|line| format!("{}\n", line))
        .collect();

    if changed {
        fs::write(&env_path, filtered)
            .await
            .map_err(|e| SecureEngineError::Io(e.to_string()))?;
    }

    Ok(())
}

/// Helper to load the mandatory passphrase from environment.
pub fn load_passphrase() -> SecureEngineResult<String> {
    match std::env::var("TITANE_SECRETS_PASSPHRASE") {
        Ok(value) => {
            let trimmed = value.trim().to_string();
            if trimmed.is_empty() {
                Err(SecureEngineError::MissingPassphrase)
            } else {
                Ok(trimmed)
            }
        }
        Err(_) => Err(SecureEngineError::MissingPassphrase),
    }
}

/// Overwrite a mutable string buffer with zeros when dropped.
pub fn zeroize_string(value: String) -> Zeroizing<String> {
    Zeroizing::new(value)
}

/// Explicitly zeroize a mutable buffer in-place.
pub fn zeroize_buffer(buffer: &mut [u8]) {
    buffer.zeroize();
}
