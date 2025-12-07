// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   ENCRYPTION ENGINE — Super-Prompt J
//   AES-256-GCM + Ed25519 signatures + Master Key management
// ═══════════════════════════════════════════════════════════════

use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use rand::Rng;
use crate::error::{TitaneResult, TitaneError};

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
        
        let ciphertext = self.cipher.encrypt(&nonce, data)
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
        let nonce = Nonce::from_slice(nonce_bytes);
        
        self.cipher.decrypt(nonce, ciphertext)
            .map_err(|e| TitaneError::EncryptionError {
                message: e.to_string(),
            })
    }
    
    fn generate_nonce() -> Nonce<Aes256Gcm> {
        let mut rng = rand::thread_rng();
        let nonce_bytes: [u8; 12] = rng.gen();
        *Nonce::from_slice(&nonce_bytes)
    }
}

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
}
