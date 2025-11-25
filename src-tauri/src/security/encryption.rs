// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   ENCRYPTION ENGINE — Super-Prompt J
//   AES-256-GCM + Ed25519 signatures + Master Key management
// ═══════════════════════════════════════════════════════════════

use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use ed25519_dalek::{Keypair, PublicKey, SecretKey, Signature, Signer, Verifier};
use rand::RngCore;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tokio::fs;

const NONCE_SIZE: usize = 12;
const KEY_SIZE: usize = 32;

/// Erreurs de cryptographie
#[derive(Debug, Clone)]
pub enum CryptoError {
    EncryptionFailed(String),
    DecryptionFailed(String),
    InvalidKey(String),
    InvalidSignature(String),
    IoError(String),
}

impl std::fmt::Display for CryptoError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            CryptoError::EncryptionFailed(msg) => write!(f, "Encryption failed: {}", msg),
            CryptoError::DecryptionFailed(msg) => write!(f, "Decryption failed: {}", msg),
            CryptoError::InvalidKey(msg) => write!(f, "Invalid key: {}", msg),
            CryptoError::InvalidSignature(msg) => write!(f, "Invalid signature: {}", msg),
            CryptoError::IoError(msg) => write!(f, "IO error: {}", msg),
        }
    }
}

impl std::error::Error for CryptoError {}

/// Master Key pour chiffrement AES-256
#[derive(Clone)]
pub struct MasterKey {
    key: [u8; KEY_SIZE],
}

impl MasterKey {
    /// Générer une nouvelle clé aléatoire
    pub fn generate() -> Self {
        let mut key = [0u8; KEY_SIZE];
        OsRng.fill_bytes(&mut key);
        Self { key }
    }

    /// Charger depuis fichier sécurisé
    pub async fn load_from_file(path: &PathBuf) -> Result<Self, CryptoError> {
        let bytes = fs::read(path)
            .await
            .map_err(|e| CryptoError::IoError(e.to_string()))?;

        if bytes.len() != KEY_SIZE {
            return Err(CryptoError::InvalidKey(format!(
                "Expected {} bytes, got {}",
                KEY_SIZE,
                bytes.len()
            )));
        }

        let mut key = [0u8; KEY_SIZE];
        key.copy_from_slice(&bytes);
        Ok(Self { key })
    }

    /// Sauvegarder dans fichier sécurisé
    pub async fn save_to_file(&self, path: &PathBuf) -> Result<(), CryptoError> {
        // Créer dossier parent si nécessaire
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)
                .await
                .map_err(|e| CryptoError::IoError(e.to_string()))?;
        }

        fs::write(path, &self.key)
            .await
            .map_err(|e| CryptoError::IoError(e.to_string()))?;

        Ok(())
    }

    /// Obtenir bytes bruts (usage interne uniquement)
    fn as_bytes(&self) -> &[u8; KEY_SIZE] {
        &self.key
    }
}

/// Moteur de chiffrement/déchiffrement
pub struct CryptoEngine {
    cipher: Aes256Gcm,
}

impl CryptoEngine {
    /// Créer depuis Master Key
    pub fn new(master_key: &MasterKey) -> Self {
        let cipher = Aes256Gcm::new(master_key.as_bytes().into());
        Self { cipher }
    }

    /// Chiffrer données
    pub fn encrypt(&self, plaintext: &[u8]) -> Result<Vec<u8>, CryptoError> {
        // Générer nonce aléatoire
        let mut nonce_bytes = [0u8; NONCE_SIZE];
        OsRng.fill_bytes(&mut nonce_bytes);
        let nonce = Nonce::from_slice(&nonce_bytes);

        // Chiffrer
        let ciphertext = self
            .cipher
            .encrypt(nonce, plaintext)
            .map_err(|e| CryptoError::EncryptionFailed(e.to_string()))?;

        // Combiner nonce + ciphertext
        let mut result = Vec::with_capacity(NONCE_SIZE + ciphertext.len());
        result.extend_from_slice(&nonce_bytes);
        result.extend_from_slice(&ciphertext);

        Ok(result)
    }

    /// Déchiffrer données
    pub fn decrypt(&self, data: &[u8]) -> Result<Vec<u8>, CryptoError> {
        if data.len() < NONCE_SIZE {
            return Err(CryptoError::DecryptionFailed(
                "Data too short to contain nonce".to_string(),
            ));
        }

        // Extraire nonce + ciphertext
        let (nonce_bytes, ciphertext) = data.split_at(NONCE_SIZE);
        let nonce = Nonce::from_slice(nonce_bytes);

        // Déchiffrer
        let plaintext = self
            .cipher
            .decrypt(nonce, ciphertext)
            .map_err(|e| CryptoError::DecryptionFailed(e.to_string()))?;

        Ok(plaintext)
    }

    /// Chiffrer chaîne UTF-8
    pub fn encrypt_string(&self, plaintext: &str) -> Result<Vec<u8>, CryptoError> {
        self.encrypt(plaintext.as_bytes())
    }

    /// Déchiffrer vers chaîne UTF-8
    pub fn decrypt_string(&self, data: &[u8]) -> Result<String, CryptoError> {
        let plaintext = self.decrypt(data)?;
        String::from_utf8(plaintext)
            .map_err(|e| CryptoError::DecryptionFailed(format!("Invalid UTF-8: {}", e)))
    }

    /// Chiffrer JSON
    pub fn encrypt_json<T: Serialize>(&self, value: &T) -> Result<Vec<u8>, CryptoError> {
        let json = serde_json::to_vec(value)
            .map_err(|e| CryptoError::EncryptionFailed(format!("JSON serialization: {}", e)))?;
        self.encrypt(&json)
    }

    /// Déchiffrer JSON
    pub fn decrypt_json<T: for<'de> Deserialize<'de>>(&self, data: &[u8]) -> Result<T, CryptoError> {
        let json = self.decrypt(data)?;
        serde_json::from_slice(&json)
            .map_err(|e| CryptoError::DecryptionFailed(format!("JSON deserialization: {}", e)))
    }
}

/// Keypair Ed25519 pour signatures
pub struct SigningKeypair {
    keypair: Keypair,
}

impl SigningKeypair {
    /// Générer nouvelle paire de clés
    pub fn generate() -> Self {
        let mut csprng = OsRng;
        let keypair = Keypair::generate(&mut csprng);
        Self { keypair }
    }

    /// Charger depuis fichiers
    pub async fn load_from_files(
        secret_path: &PathBuf,
        public_path: &PathBuf,
    ) -> Result<Self, CryptoError> {
        let secret_bytes = fs::read(secret_path)
            .await
            .map_err(|e| CryptoError::IoError(e.to_string()))?;
        let public_bytes = fs::read(public_path)
            .await
            .map_err(|e| CryptoError::IoError(e.to_string()))?;

        let secret = SecretKey::from_bytes(&secret_bytes)
            .map_err(|e| CryptoError::InvalidKey(e.to_string()))?;
        let public = PublicKey::from_bytes(&public_bytes)
            .map_err(|e| CryptoError::InvalidKey(e.to_string()))?;

        let keypair = Keypair { secret, public };
        Ok(Self { keypair })
    }

    /// Sauvegarder dans fichiers
    pub async fn save_to_files(
        &self,
        secret_path: &PathBuf,
        public_path: &PathBuf,
    ) -> Result<(), CryptoError> {
        // Créer dossiers parents
        if let Some(parent) = secret_path.parent() {
            fs::create_dir_all(parent)
                .await
                .map_err(|e| CryptoError::IoError(e.to_string()))?;
        }
        if let Some(parent) = public_path.parent() {
            fs::create_dir_all(parent)
                .await
                .map_err(|e| CryptoError::IoError(e.to_string()))?;
        }

        fs::write(secret_path, self.keypair.secret.to_bytes())
            .await
            .map_err(|e| CryptoError::IoError(e.to_string()))?;
        fs::write(public_path, self.keypair.public.to_bytes())
            .await
            .map_err(|e| CryptoError::IoError(e.to_string()))?;

        Ok(())
    }

    /// Signer données
    pub fn sign(&self, data: &[u8]) -> Vec<u8> {
        self.keypair.sign(data).to_bytes().to_vec()
    }

    /// Vérifier signature
    pub fn verify(&self, data: &[u8], signature: &[u8]) -> Result<(), CryptoError> {
        let sig = Signature::from_bytes(signature)
            .map_err(|e| CryptoError::InvalidSignature(e.to_string()))?;

        self.keypair
            .verify(data, &sig)
            .map_err(|e| CryptoError::InvalidSignature(e.to_string()))
    }

    /// Obtenir clé publique
    pub fn public_key_bytes(&self) -> [u8; 32] {
        self.keypair.public.to_bytes()
    }
}

/// Initialiser le moteur cryptographique global
pub async fn initialize_crypto_engine() -> Result<(), CryptoError> {
    log::info!("🔐 Initializing Crypto Engine...");

    // Vérifier existence Master Key, sinon générer
    let key_path = get_master_key_path();
    let master_key = if key_path.exists() {
        MasterKey::load_from_file(&key_path).await?
    } else {
        log::warn!("⚠️ Master Key not found, generating new one");
        let key = MasterKey::generate();
        key.save_to_file(&key_path).await?;
        log::info!("✅ Master Key generated and saved");
        key
    };

    // Vérifier keypair Ed25519
    let (secret_path, public_path) = get_signing_keypair_paths();
    if !secret_path.exists() || !public_path.exists() {
        log::warn!("⚠️ Signing keypair not found, generating new one");
        let keypair = SigningKeypair::generate();
        keypair.save_to_files(&secret_path, &public_path).await?;
        log::info!("✅ Signing keypair generated and saved");
    }

    log::info!("✅ Crypto Engine initialized");
    Ok(())
}

fn get_master_key_path() -> PathBuf {
    dirs::data_local_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("titane_infinity")
        .join("vault")
        .join("master.key")
}

fn get_signing_keypair_paths() -> (PathBuf, PathBuf) {
    let base = dirs::data_local_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("titane_infinity")
        .join("vault");

    (base.join("signing.secret"), base.join("signing.public"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encrypt_decrypt() {
        let key = MasterKey::generate();
        let engine = CryptoEngine::new(&key);

        let plaintext = b"TITANE INFINITY v∞";
        let ciphertext = engine.encrypt(plaintext).unwrap();
        let decrypted = engine.decrypt(&ciphertext).unwrap();

        assert_eq!(plaintext, &decrypted[..]);
    }

    #[test]
    fn test_encrypt_decrypt_string() {
        let key = MasterKey::generate();
        let engine = CryptoEngine::new(&key);

        let plaintext = "TITANE INFINITY v∞ — Encrypted";
        let ciphertext = engine.encrypt_string(plaintext).unwrap();
        let decrypted = engine.decrypt_string(&ciphertext).unwrap();

        assert_eq!(plaintext, decrypted);
    }

    #[test]
    fn test_sign_verify() {
        let keypair = SigningKeypair::generate();
        let data = b"TITANE INFINITY v∞";

        let signature = keypair.sign(data);
        assert!(keypair.verify(data, &signature).is_ok());

        // Mauvaise signature
        let wrong_data = b"wrong";
        assert!(keypair.verify(wrong_data, &signature).is_err());
    }
}
