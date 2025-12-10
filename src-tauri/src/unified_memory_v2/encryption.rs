// ═══════════════════════════════════════════════════════════════
//   UNIFIED MEMORY V2 — ENCRYPTION
//   AES-256-GCM encryption (migré depuis memory/encryption.rs)
// ═══════════════════════════════════════════════════════════════

use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use argon2::{
    password_hash::{PasswordHasher, SaltString},
    Argon2,
};
use base64::{engine::general_purpose, Engine as _};

use super::types::{MemoryError, MemoryResult};

/// Memory encryption engine (AES-256-GCM + Argon2id)
pub struct MemoryEncryption {
    cipher: Aes256Gcm,
}

impl MemoryEncryption {
    /// Create new encryption engine from password
    pub fn new(password: &str) -> MemoryResult<Self> {
        // Derive key with Argon2id
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();
        
        let password_hash = argon2
            .hash_password(password.as_bytes(), &salt)
            .map_err(|e| MemoryError::EncryptionError(format!("Argon2 error: {}", e)))?;

        // Extract 32-byte key
        let key_bytes = password_hash.hash.ok_or_else(|| {
            MemoryError::EncryptionError("Failed to extract hash".to_string())
        })?;

        let key: [u8; 32] = key_bytes.as_bytes()[..32]
            .try_into()
            .map_err(|_| MemoryError::EncryptionError("Invalid key length".to_string()))?;

        let cipher = Aes256Gcm::new(&key.into());

        Ok(Self { cipher })
    }

    /// Encrypt data
    pub fn encrypt(&self, plaintext: &[u8]) -> MemoryResult<Vec<u8>> {
        // Generate random 96-bit nonce
        let nonce_bytes: [u8; 12] = rand::random();
        let nonce = Nonce::from_slice(&nonce_bytes);

        let ciphertext = self
            .cipher
            .encrypt(nonce, plaintext)
            .map_err(|e| MemoryError::EncryptionError(format!("AES-GCM error: {}", e)))?;

        // Prepend nonce to ciphertext
        let mut result = nonce.to_vec();
        result.extend_from_slice(&ciphertext);

        Ok(result)
    }

    /// Decrypt data
    pub fn decrypt(&self, encrypted: &[u8]) -> MemoryResult<Vec<u8>> {
        if encrypted.len() < 12 {
            return Err(MemoryError::DecryptionError(
                "Invalid encrypted data length".to_string(),
            ));
        }

        // Extract nonce (first 12 bytes)
        let nonce = Nonce::from_slice(&encrypted[..12]);
        let ciphertext = &encrypted[12..];

        let plaintext = self
            .cipher
            .decrypt(nonce, ciphertext)
            .map_err(|e| MemoryError::DecryptionError(format!("AES-GCM error: {}", e)))?;

        Ok(plaintext)
    }

    /// Encrypt string
    pub fn encrypt_string(&self, plaintext: &str) -> MemoryResult<String> {
        let encrypted = self.encrypt(plaintext.as_bytes())?;
        Ok(general_purpose::STANDARD.encode(encrypted))
    }

    /// Decrypt string
    pub fn decrypt_string(&self, encrypted: &str) -> MemoryResult<String> {
        let encrypted_bytes = general_purpose::STANDARD.decode(encrypted)
            .map_err(|e| MemoryError::DecryptionError(format!("Base64 error: {}", e)))?;

        let plaintext = self.decrypt(&encrypted_bytes)?;

        String::from_utf8(plaintext)
            .map_err(|e| MemoryError::DecryptionError(format!("UTF-8 error: {}", e)))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encryption_roundtrip() {
        let enc = MemoryEncryption::new("test_password_123").unwrap();
        
        let plaintext = "Hello, World!";
        let encrypted = enc.encrypt_string(plaintext).unwrap();
        let decrypted = enc.decrypt_string(&encrypted).unwrap();
        
        assert_eq!(plaintext, decrypted);
    }

    #[test]
    fn test_encryption_different_passwords() {
        let enc1 = MemoryEncryption::new("password1").unwrap();
        let enc2 = MemoryEncryption::new("password2").unwrap();
        
        let plaintext = "Secret data";
        let encrypted = enc1.encrypt_string(plaintext).unwrap();
        
        // Should fail with different password
        assert!(enc2.decrypt_string(&encrypted).is_err());
    }
}
