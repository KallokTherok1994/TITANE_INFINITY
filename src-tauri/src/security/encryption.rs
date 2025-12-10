// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   ENCRYPTION ENGINE — Super-Prompt J (REPAIRED vΩ FINAL)
//   AES-256-GCM + Ed25519 signatures + Master Key management
// ═══════════════════════════════════════════════════════════════

use crate::error::{TitaneError, TitaneResult};
use aes_gcm::aead::generic_array::GenericArray;
use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm,
};
use ed25519_dalek::{Signature, Signer, SigningKey, Verifier, VerifyingKey};
use rand::Rng;

// ═══════════════════════════════════════════════════════════════
// AES-256-GCM ENCRYPTION
// ═══════════════════════════════════════════════════════════════

pub struct Encryptor {
    cipher: Aes256Gcm,
}

impl Encryptor {
    pub fn new(key: &[u8; 32]) -> Self {
        let cipher = Aes256Gcm::new(key.into());
        Self { cipher }
    }

    pub fn encrypt(&self, data: &[u8]) -> TitaneResult<Vec<u8>> {
        let nonce = Self::generate_nonce();

        let ciphertext =
            self.cipher
                .encrypt(&nonce, data)
                .map_err(|e| TitaneError::EncryptionError {
                    message: e.to_string(),
                })?;

        let mut result = nonce.to_vec();
        result.extend_from_slice(&ciphertext);

        Ok(result)
    }

    pub fn decrypt(&self, data: &[u8]) -> TitaneResult<Vec<u8>> {
        if data.len() < 12 {
            return Err(TitaneError::EncryptionError {
                message: "Data too short".to_string(),
            });
        }

        let (nonce_bytes, ciphertext) = data.split_at(12);
        let nonce = GenericArray::from_slice(nonce_bytes);

        self.cipher
            .decrypt(nonce, ciphertext)
            .map_err(|e| TitaneError::EncryptionError {
                message: e.to_string(),
            })
    }

    fn generate_nonce() -> GenericArray<u8, aes_gcm::aead::consts::U12> {
        let mut rng = rand::thread_rng();
        let nonce_bytes: [u8; 12] = rng.gen();
        *GenericArray::from_slice(&nonce_bytes)
    }
}

// ═══════════════════════════════════════════════════════════════
// ED25519 DIGITAL SIGNATURES (UNIFIED API)
// ═══════════════════════════════════════════════════════════════

pub struct SigningKeypair {
    private: SigningKey,
    public: VerifyingKey,
}

impl SigningKeypair {
    /// Generate a new Ed25519 keypair
    pub fn generate() -> Self {
        let secret_bytes: [u8; 32] = rand::random();
        let private = SigningKey::from_bytes(&secret_bytes);
        let public = private.verifying_key();

        Self { private, public }
    }

    /// Sign a message and return signature bytes
    pub fn sign(&self, message: &[u8]) -> Vec<u8> {
        let signature: Signature = self.private.sign(message);
        signature.to_bytes().to_vec()
    }

    /// Verify a signature against a message
    pub fn verify(&self, message: &[u8], signature: &[u8]) -> bool {
        if signature.len() != 64 {
            return false;
        }

        let sig = match Signature::from_slice(signature) {
            Ok(s) => s,
            Err(_) => return false,
        };

        self.public.verify(message, &sig).is_ok()
    }

    /// Get public key as bytes (32 bytes)
    pub fn public_key_bytes(&self) -> Vec<u8> {
        self.public.to_bytes().to_vec()
    }
}

// ═══════════════════════════════════════════════════════════════
// TYPE ALIASES FOR EXPORTS
// ═══════════════════════════════════════════════════════════════

/// Master encryption key (32 bytes)
pub type MasterKey = [u8; 32];

/// Helper trait to generate random MasterKey
pub trait MasterKeyGenerator {
    fn generate() -> Self;
}

impl MasterKeyGenerator for MasterKey {
    /// Generate a cryptographically secure random master key
    fn generate() -> Self {
        use rand::RngCore;
        let mut key = [0u8; 32];
        rand::thread_rng().fill_bytes(&mut key);
        key
    }
}

/// Alias for encryption engine
pub type CryptoEngine = Encryptor;

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encrypt_decrypt() {
        let key: [u8; 32] = [0u8; 32];
        let encryptor = Encryptor::new(&key);

        let data = b"Hello, TITANE!";
        let encrypted = encryptor.encrypt(data).unwrap();
        let decrypted = encryptor.decrypt(&encrypted).unwrap();

        assert_eq!(data, &decrypted[..]);
    }

    #[test]
    fn test_signing_keypair() {
        let keypair = SigningKeypair::generate();
        let message = b"TITANE infinity message";

        let signature = keypair.sign(message);
        assert_eq!(signature.len(), 64);

        assert!(keypair.verify(message, &signature));
        assert!(!keypair.verify(b"wrong message", &signature));
    }

    #[test]
    fn test_public_key_bytes() {
        let keypair = SigningKeypair::generate();
        let pubkey = keypair.public_key_bytes();
        assert_eq!(pubkey.len(), 32);
    }
}
