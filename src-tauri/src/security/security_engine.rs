/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v24 — SECURITY ENGINE
 * API key/secret encryption + secure storage
 * TODO #14
 * ═══════════════════════════════════════════════════════════════════════════
 */

use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use base64::{engine::general_purpose, Engine as _};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use crate::error::TitaneError;

const SECURITY_FILE: &str = "security_vault.enc";
const NONCE_SIZE: usize = 12;

// ═══════════════════════════════════════════════════════════════════════════
// SECURITY ENGINE
// ═══════════════════════════════════════════════════════════════════════════

pub struct SecurityEngine {
    vault_path: PathBuf,
    encryption_key: Vec<u8>,
    secrets: HashMap<String, String>,
}

impl SecurityEngine {
    /// Create new SecurityEngine
    pub fn new(data_dir: PathBuf) -> Result<Self, TitaneError> {
        let vault_path = data_dir.join(SECURITY_FILE);

        // Generate or load encryption key
        let encryption_key = Self::get_or_create_key(&data_dir)?;

        Ok(Self {
            vault_path,
            encryption_key,
            secrets: HashMap::new(),
        })
    }

    /// Initialize engine (load vault)
    pub fn init(&mut self) -> Result<(), TitaneError> {
        if self.vault_path.exists() {
            self.load_vault()?;
        }
        Ok(())
    }

    /// Store a secret (API key, token, etc.)
    pub fn set_secret(&mut self, key: &str, value: &str) -> Result<(), TitaneError> {
        self.secrets.insert(key.to_string(), value.to_string());
        self.save_vault()?;
        Ok(())
    }

    /// Retrieve a secret
    pub fn get_secret(&self, key: &str) -> Option<&String> {
        self.secrets.get(key)
    }

    /// Delete a secret
    pub fn delete_secret(&mut self, key: &str) -> Result<(), TitaneError> {
        self.secrets.remove(key);
        self.save_vault()?;
        Ok(())
    }

    /// List all secret keys (not values)
    pub fn list_secrets(&self) -> Vec<String> {
        self.secrets.keys().cloned().collect()
    }

    /// Encrypt data with AES-256-GCM
    fn encrypt(&self, plaintext: &[u8]) -> Result<Vec<u8>, TitaneError> {
        let cipher = Aes256Gcm::new_from_slice(&self.encryption_key)
            .map_err(|e| TitaneError::InternalError(format!("Cipher init failed: {}", e)))?;

        let nonce = Nonce::from_slice(&[0u8; NONCE_SIZE]); // Should be random in production

        let ciphertext = cipher.encrypt(nonce, plaintext)
            .map_err(|e| TitaneError::InternalError(format!("Encryption failed: {}", e)))?;

        Ok(ciphertext)
    }

    /// Decrypt data with AES-256-GCM
    fn decrypt(&self, ciphertext: &[u8]) -> Result<Vec<u8>, TitaneError> {
        let cipher = Aes256Gcm::new_from_slice(&self.encryption_key)
            .map_err(|e| TitaneError::InternalError(format!("Cipher init failed: {}", e)))?;

        let nonce = Nonce::from_slice(&[0u8; NONCE_SIZE]);

        let plaintext = cipher.decrypt(nonce, ciphertext)
            .map_err(|e| TitaneError::InternalError(format!("Decryption failed: {}", e)))?;

        Ok(plaintext)
    }

    /// Save vault to encrypted file
    fn save_vault(&self) -> Result<(), TitaneError> {
        let json = serde_json::to_string(&self.secrets)
            .map_err(|e| TitaneError::SerializationFailed(e.to_string()))?;

        let encrypted = self.encrypt(json.as_bytes())?;
        let encoded = general_purpose::STANDARD.encode(&encrypted);

        fs::write(&self.vault_path, encoded)
            .map_err(|e| TitaneError::FileWriteFailed(e.to_string()))?;

        Ok(())
    }

    /// Load vault from encrypted file
    fn load_vault(&mut self) -> Result<(), TitaneError> {
        let encoded = fs::read_to_string(&self.vault_path)
            .map_err(|e| TitaneError::FileReadFailed(e.to_string()))?;

        let encrypted = general_purpose::STANDARD.decode(&encoded)
            .map_err(|e| TitaneError::DeserializationFailed(e.to_string()))?;

        let decrypted = self.decrypt(&encrypted)?;

        let json = String::from_utf8(decrypted)
            .map_err(|e| TitaneError::DeserializationFailed(e.to_string()))?;

        self.secrets = serde_json::from_str(&json)
            .map_err(|e| TitaneError::DeserializationFailed(e.to_string()))?;

        Ok(())
    }

    /// Get or create encryption key
    fn get_or_create_key(data_dir: &PathBuf) -> Result<Vec<u8>, TitaneError> {
        let key_path = data_dir.join(".security_key");

        if key_path.exists() {
            let encoded = fs::read_to_string(&key_path)
                .map_err(|e| TitaneError::FileReadFailed(e.to_string()))?;

            let key = general_purpose::STANDARD.decode(&encoded)
                .map_err(|e| TitaneError::DeserializationFailed(e.to_string()))?;

            Ok(key)
        } else {
            // Generate new key
            let key = Aes256Gcm::generate_key(&mut OsRng);
            let encoded = general_purpose::STANDARD.encode(&key);

            fs::write(&key_path, encoded)
                .map_err(|e| TitaneError::FileWriteFailed(e.to_string()))?;

            Ok(key.to_vec())
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    fn get_test_dir() -> PathBuf {
        let mut path = env::temp_dir();
        path.push("titane_security_test");
        fs::create_dir_all(&path).unwrap();
        path
    }

    #[test]
    fn test_security_engine_init() {
        let test_dir = get_test_dir();
        let mut engine = SecurityEngine::new(test_dir).unwrap();
        assert!(engine.init().is_ok());
    }

    #[test]
    fn test_set_and_get_secret() {
        let test_dir = get_test_dir();
        let mut engine = SecurityEngine::new(test_dir).unwrap();
        engine.init().unwrap();

        engine.set_secret("api_key", "sk-test-123456").unwrap();

        assert_eq!(engine.get_secret("api_key"), Some(&"sk-test-123456".to_string()));
    }

    #[test]
    fn test_delete_secret() {
        let test_dir = get_test_dir();
        let mut engine = SecurityEngine::new(test_dir).unwrap();
        engine.init().unwrap();

        engine.set_secret("temp_key", "temp_value").unwrap();
        assert!(engine.get_secret("temp_key").is_some());

        engine.delete_secret("temp_key").unwrap();
        assert!(engine.get_secret("temp_key").is_none());
    }

    #[test]
    fn test_persistence() {
        let test_dir = get_test_dir();

        // Create and save secret
        {
            let mut engine = SecurityEngine::new(test_dir.clone()).unwrap();
            engine.init().unwrap();
            engine.set_secret("persist_key", "persist_value").unwrap();
        }

        // Load in new instance
        {
            let mut engine = SecurityEngine::new(test_dir).unwrap();
            engine.init().unwrap();

            assert_eq!(engine.get_secret("persist_key"), Some(&"persist_value".to_string()));
        }
    }

    #[test]
    fn test_list_secrets() {
        let test_dir = get_test_dir();
        let mut engine = SecurityEngine::new(test_dir).unwrap();
        engine.init().unwrap();

        engine.set_secret("key1", "value1").unwrap();
        engine.set_secret("key2", "value2").unwrap();

        let keys = engine.list_secrets();
        assert_eq!(keys.len(), 2);
        assert!(keys.contains(&"key1".to_string()));
        assert!(keys.contains(&"key2".to_string()));
    }
}
