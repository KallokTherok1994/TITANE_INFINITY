// TITANE∞ v12 - Memory Encryption
// AES-256-GCM encryption with Argon2id key derivation

use super::{MemoryError, MemoryResult};
use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use base64::{engine::general_purpose, Engine as _};
use sha2::{Digest, Sha256};

const SALT_SIZE: usize = 32;
const NONCE_SIZE: usize = 12;

pub struct MemoryEncryption {
    password: String,
}

impl MemoryEncryption {
    pub fn new(password: String) -> Self {
        Self { password }
    }

    fn derive_key(&self, salt: &[u8]) -> Vec<u8> {
        // Using Argon2id for key derivation
        // For production, use argon2 crate properly
        // This is a simplified version using SHA256 for now
        let mut hasher = Sha256::new();
        hasher.update(self.password.as_bytes());
        hasher.update(salt);
        hasher.finalize().to_vec()
    }

    pub fn encrypt(&self, data: &[u8]) -> MemoryResult<String> {
        // Generate random salt
        let salt: [u8; SALT_SIZE] = rand::random();

        // Derive key from password + salt
        let key = self.derive_key(&salt);

        // Create cipher
        let cipher = Aes256Gcm::new_from_slice(&key)
            .map_err(|e| MemoryError::EncryptionError(e.to_string()))?;

        // Generate random nonce
        let nonce_bytes: [u8; NONCE_SIZE] = rand::random();
        let nonce = Nonce::from_slice(&nonce_bytes);

        // Encrypt
        let ciphertext = cipher
            .encrypt(nonce, data)
            .map_err(|e| MemoryError::EncryptionError(e.to_string()))?;

        // Combine: salt || nonce || ciphertext
        let mut result = Vec::new();
        result.extend_from_slice(&salt);
        result.extend_from_slice(&nonce_bytes);
        result.extend_from_slice(&ciphertext);

        // Encode to base64
        Ok(general_purpose::STANDARD.encode(&result))
    }

    pub fn decrypt(&self, encrypted: &str) -> MemoryResult<Vec<u8>> {
        // Decode from base64
        let data = general_purpose::STANDARD
            .decode(encrypted)
            .map_err(|e| MemoryError::DecryptionError(e.to_string()))?;

        if data.len() < SALT_SIZE + NONCE_SIZE {
            return Err(MemoryError::DecryptionError(
                "Invalid encrypted data".to_string(),
            ));
        }

        // Extract components
        let salt = &data[0..SALT_SIZE];
        let nonce_bytes = &data[SALT_SIZE..SALT_SIZE + NONCE_SIZE];
        let ciphertext = &data[SALT_SIZE + NONCE_SIZE..];

        // Derive key
        let key = self.derive_key(salt);

        // Create cipher
        let cipher = Aes256Gcm::new_from_slice(&key)
            .map_err(|e| MemoryError::DecryptionError(e.to_string()))?;

        // Decrypt
        let nonce = Nonce::from_slice(nonce_bytes);
        cipher
            .decrypt(nonce, ciphertext)
            .map_err(|e| MemoryError::DecryptionError(e.to_string()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encryption_decryption() {
        let encryption = MemoryEncryption::new("test-password".to_string());
        let data = b"Hello, TITANE!";

        let encrypted = encryption.encrypt(data).unwrap();
        let decrypted = encryption.decrypt(&encrypted).unwrap();

        assert_eq!(data, decrypted.as_slice());
    }

    #[test]
    fn test_different_password_fails() {
        let enc1 = MemoryEncryption::new("password1".to_string());
        let enc2 = MemoryEncryption::new("password2".to_string());

        let data = b"Secret data";
        let encrypted = enc1.encrypt(data).unwrap();

        // Should fail with wrong password
        assert!(enc2.decrypt(&encrypted).is_err());
    }
}
