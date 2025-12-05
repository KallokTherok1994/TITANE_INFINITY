// TITANE∞ v13 - Semantic Storage
// Stockage persistant chiffré pour l'index sémantique

use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use argon2::{Argon2, PasswordHasher};
use argon2::password_hash::{SaltString, rand_core::OsRng};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

/// Gestionnaire de stockage sémantique
pub struct SemanticStorage {
    storage_path: PathBuf,
    encryption_key: Option<Vec<u8>>,
}

impl SemanticStorage {
    pub fn new(storage_path: PathBuf) -> Self {
        Self {
            storage_path,
            encryption_key: None,
        }
    }

    pub fn with_encryption(storage_path: PathBuf, password: &str) -> Result<Self, String> {
        let key = Self::derive_key(password)?;
        Ok(Self {
            storage_path,
            encryption_key: Some(key),
        })
    }

    fn derive_key(password: &str) -> Result<Vec<u8>, String> {
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();
        
        let password_hash = argon2
            .hash_password(password.as_bytes(), &salt)
            .map_err(|e| format!("Key derivation failed: {}", e))?;

        let hash_bytes = password_hash.hash.ok_or("No hash generated")?;
        Ok(hash_bytes.as_bytes()[..32].to_vec())
    }

    pub fn save<T: Serialize>(&self, filename: &str, data: &T) -> Result<(), String> {
        let json = serde_json::to_string(data)
            .map_err(|e| format!("Serialization failed: {}", e))?;

        let data_bytes = if let Some(key) = &self.encryption_key {
            self.encrypt(json.as_bytes(), key)?
        } else {
            json.into_bytes()
        };

        let filepath = self.storage_path.join(filename);
        if let Some(parent) = filepath.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create directory: {}", e))?;
        }

        fs::write(&filepath, data_bytes)
            .map_err(|e| format!("Failed to write file: {}", e))?;

        Ok(())
    }

    pub fn load<T: for<'de> Deserialize<'de>>(&self, filename: &str) -> Result<T, String> {
        let filepath = self.storage_path.join(filename);
        
        let data_bytes = fs::read(&filepath)
            .map_err(|e| format!("Failed to read file: {}", e))?;

        let json_bytes = if let Some(key) = &self.encryption_key {
            self.decrypt(&data_bytes, key)?
        } else {
            data_bytes
        };

        let json = String::from_utf8(json_bytes)
            .map_err(|e| format!("Invalid UTF-8: {}", e))?;

        serde_json::from_str(&json)
            .map_err(|e| format!("Deserialization failed: {}", e))
    }

    fn encrypt(&self, data: &[u8], key: &[u8]) -> Result<Vec<u8>, String> {
        let cipher = Aes256Gcm::new_from_slice(key)
            .map_err(|e| format!("Cipher creation failed: {}", e))?;

        let nonce = Nonce::from_slice(b"unique nonce"); // TODO: Generate random nonce
        
        cipher
            .encrypt(nonce, data)
            .map_err(|e| format!("Encryption failed: {}", e))
    }

    fn decrypt(&self, data: &[u8], key: &[u8]) -> Result<Vec<u8>, String> {
        let cipher = Aes256Gcm::new_from_slice(key)
            .map_err(|e| format!("Cipher creation failed: {}", e))?;

        let nonce = Nonce::from_slice(b"unique nonce");
        
        cipher
            .decrypt(nonce, data)
            .map_err(|e| format!("Decryption failed: {}", e))
    }
}
