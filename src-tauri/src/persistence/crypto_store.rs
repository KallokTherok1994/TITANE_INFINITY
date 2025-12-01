//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v∞.MPE-2 — CRYPTO STORE (Architecture prête pour chiffrement)
//! Couche d'abstraction pour le chiffrement des données
//! © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

/// Algorithme de chiffrement (préparé pour AES-256-GCM)
pub const ENCRYPTION_ALGORITHM: &str = "AES-256-GCM";

/// Taille de la clé en bytes
pub const KEY_SIZE: usize = 32;

/// Taille du nonce en bytes
pub const NONCE_SIZE: usize = 12;

/// Nombre d'itérations PBKDF2
pub const PBKDF2_ITERATIONS: u32 = 100_000;

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/// Configuration du chiffrement
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CryptoConfig {
    /// Chiffrement activé
    pub enabled: bool,
    /// Algorithme utilisé
    pub algorithm: String,
    /// Dérivation de clé
    pub key_derivation: String,
    /// Itérations PBKDF2
    pub iterations: u32,
}

impl Default for CryptoConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            algorithm: ENCRYPTION_ALGORITHM.to_string(),
            key_derivation: "PBKDF2-SHA256".to_string(),
            iterations: PBKDF2_ITERATIONS,
        }
    }
}

/// Données chiffrées
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptedBlob {
    /// Version du format
    pub version: u8,
    /// Nonce/IV
    pub nonce: Vec<u8>,
    /// Données chiffrées
    pub ciphertext: Vec<u8>,
    /// Tag d'authentification (pour GCM)
    pub auth_tag: Vec<u8>,
    /// Salt pour dérivation de clé (si applicable)
    pub salt: Option<Vec<u8>>,
}

/// État de la clé
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum KeyState {
    /// Pas de clé configurée
    NotConfigured,
    /// Clé configurée mais verrouillée
    Locked,
    /// Clé déverrouillée et prête
    Unlocked,
}

/// Rapport de vérification de mot de passe
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PasswordVerification {
    pub is_valid: bool,
    pub key_state: String,
    pub last_unlock: Option<u64>,
}

// ═══════════════════════════════════════════════════════════════════════════════
// ERRORS
// ═══════════════════════════════════════════════════════════════════════════════

/// Erreurs de cryptographie
#[derive(Debug, Clone, Serialize, Deserialize, thiserror::Error)]
pub enum CryptoError {
    #[error("Chiffrement non configuré")]
    NotConfigured,

    #[error("Clé non disponible (verrouillée)")]
    KeyLocked,

    #[error("Mot de passe invalide")]
    InvalidPassword,

    #[error("Données corrompues ou invalides")]
    InvalidData,

    #[error("Erreur de chiffrement: {0}")]
    EncryptionError(String),

    #[error("Erreur de déchiffrement: {0}")]
    DecryptionError(String),

    #[error("Erreur de dérivation de clé: {0}")]
    KeyDerivationError(String),
}

// ═══════════════════════════════════════════════════════════════════════════════
// CRYPTO STORE
// ═══════════════════════════════════════════════════════════════════════════════

/// Store cryptographique (singleton thread-safe)
pub struct CryptoStore {
    /// Configuration
    config: CryptoConfig,
    /// Clé dérivée (en mémoire seulement)
    derived_key: Option<Vec<u8>>,
    /// État de la clé
    key_state: KeyState,
    /// Dernier déverrouillage
    last_unlock: Option<u64>,
    /// Hash du mot de passe pour vérification (ne pas stocker le mot de passe!)
    password_hash: Option<Vec<u8>>,
    /// Salt pour dérivation
    salt: Option<Vec<u8>>,
}

impl CryptoStore {
    pub fn new() -> Self {
        Self {
            config: CryptoConfig::default(),
            derived_key: None,
            key_state: KeyState::NotConfigured,
            last_unlock: None,
            password_hash: None,
            salt: None,
        }
    }

    /// Configurer le chiffrement avec un mot de passe maître
    /// 
    /// # Arguments
    /// * `password` - Mot de passe maître (sera dérivé, jamais stocké)
    /// 
    /// # Note de sécurité
    /// - Le mot de passe n'est JAMAIS stocké en clair
    /// - Une clé est dérivée via PBKDF2-SHA256
    /// - La clé dérivée reste en mémoire uniquement
    pub fn set_master_password(&mut self, password: &str) -> Result<(), CryptoError> {
        // Générer un salt aléatoire
        let salt = Self::generate_random_bytes(32);

        // Dériver la clé via PBKDF2
        let derived_key = self.derive_key(password, &salt)?;

        // Stocker un hash du mot de passe pour vérification future
        let password_hash = Self::hash_password(password, &salt);

        self.salt = Some(salt);
        self.derived_key = Some(derived_key);
        self.password_hash = Some(password_hash);
        self.key_state = KeyState::Unlocked;
        self.last_unlock = Some(chrono::Utc::now().timestamp_millis() as u64);
        self.config.enabled = true;

        log::info!("[CryptoStore] 🔐 Chiffrement configuré et activé");
        Ok(())
    }

    /// Déverrouiller avec le mot de passe
    pub fn unlock(&mut self, password: &str) -> Result<(), CryptoError> {
        let salt = self.salt.as_ref().ok_or(CryptoError::NotConfigured)?;
        let stored_hash = self.password_hash.as_ref().ok_or(CryptoError::NotConfigured)?;

        // Vérifier le mot de passe
        let password_hash = Self::hash_password(password, salt);
        if password_hash != *stored_hash {
            return Err(CryptoError::InvalidPassword);
        }

        // Dériver la clé
        let derived_key = self.derive_key(password, salt)?;
        self.derived_key = Some(derived_key);
        self.key_state = KeyState::Unlocked;
        self.last_unlock = Some(chrono::Utc::now().timestamp_millis() as u64);

        log::info!("[CryptoStore] 🔓 Clé déverrouillée");
        Ok(())
    }

    /// Verrouiller le store (effacer la clé de la mémoire)
    pub fn lock(&mut self) {
        // Effacement sécurisé de la clé
        if let Some(ref mut key) = self.derived_key {
            for byte in key.iter_mut() {
                *byte = 0;
            }
        }
        self.derived_key = None;
        self.key_state = KeyState::Locked;

        log::info!("[CryptoStore] 🔒 Clé verrouillée");
    }

    /// Chiffrer des données
    pub fn encrypt_blob(&self, plaintext: &[u8]) -> Result<EncryptedBlob, CryptoError> {
        if !self.config.enabled {
            return Err(CryptoError::NotConfigured);
        }

        let key = self.derived_key.as_ref().ok_or(CryptoError::KeyLocked)?;

        // Générer un nonce aléatoire
        let nonce = Self::generate_random_bytes(NONCE_SIZE);

        // Pour l'instant, utiliser une simulation simple (XOR)
        // TODO: Implémenter AES-256-GCM avec ring ou aes-gcm crate
        let ciphertext = Self::xor_encrypt(plaintext, key, &nonce);

        // Générer un auth_tag simplifié
        let auth_tag = Self::compute_auth_tag(key, &nonce, &ciphertext);

        Ok(EncryptedBlob {
            version: 1,
            nonce,
            ciphertext,
            auth_tag,
            salt: self.salt.clone(),
        })
    }

    /// Déchiffrer des données
    pub fn decrypt_blob(&self, blob: &EncryptedBlob) -> Result<Vec<u8>, CryptoError> {
        if !self.config.enabled {
            return Err(CryptoError::NotConfigured);
        }

        let key = self.derived_key.as_ref().ok_or(CryptoError::KeyLocked)?;

        // Vérifier le auth_tag
        let expected_tag = Self::compute_auth_tag(key, &blob.nonce, &blob.ciphertext);
        if expected_tag != blob.auth_tag {
            return Err(CryptoError::InvalidData);
        }

        // Déchiffrer (XOR est symétrique)
        let plaintext = Self::xor_encrypt(&blob.ciphertext, key, &blob.nonce);

        Ok(plaintext)
    }

    /// Chiffrer en place (optionnel - pour état conditionnel)
    pub fn encrypt_if_enabled(&self, data: &[u8]) -> Result<Vec<u8>, CryptoError> {
        if self.config.enabled && self.key_state == KeyState::Unlocked {
            let blob = self.encrypt_blob(data)?;
            serde_json::to_vec(&blob).map_err(|e| CryptoError::EncryptionError(e.to_string()))
        } else {
            // Retourner les données non chiffrées
            Ok(data.to_vec())
        }
    }

    /// Déchiffrer si nécessaire
    pub fn decrypt_if_encrypted(&self, data: &[u8]) -> Result<Vec<u8>, CryptoError> {
        // Essayer de parser comme EncryptedBlob
        if let Ok(blob) = serde_json::from_slice::<EncryptedBlob>(data) {
            self.decrypt_blob(&blob)
        } else {
            // Données non chiffrées
            Ok(data.to_vec())
        }
    }

    /// Vérifier l'état actuel
    pub fn get_state(&self) -> KeyState {
        self.key_state.clone()
    }

    /// Vérifier si le chiffrement est actif
    pub fn is_enabled(&self) -> bool {
        self.config.enabled
    }

    /// Obtenir la configuration
    pub fn get_config(&self) -> &CryptoConfig {
        &self.config
    }

    /// Vérifier un mot de passe sans déverrouiller
    pub fn verify_password(&self, password: &str) -> PasswordVerification {
        let is_valid = if let (Some(salt), Some(stored_hash)) = (&self.salt, &self.password_hash) {
            let password_hash = Self::hash_password(password, salt);
            password_hash == *stored_hash
        } else {
            false
        };

        PasswordVerification {
            is_valid,
            key_state: format!("{:?}", self.key_state),
            last_unlock: self.last_unlock,
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════════════════════

    /// Dériver une clé depuis un mot de passe
    fn derive_key(&self, password: &str, salt: &[u8]) -> Result<Vec<u8>, CryptoError> {
        use sha2::{Sha256, Digest};

        // Implémentation simplifiée de PBKDF2
        // TODO: Utiliser ring::pbkdf2 ou rust-crypto pour production
        let mut key = vec![0u8; KEY_SIZE];
        let mut block = Vec::with_capacity(password.len() + salt.len() + 4);
        block.extend_from_slice(password.as_bytes());
        block.extend_from_slice(salt);
        block.extend_from_slice(&1u32.to_be_bytes());

        let mut hasher = Sha256::new();
        hasher.update(&block);
        let mut u = hasher.finalize().to_vec();

        for _ in 1..self.config.iterations {
            let mut hasher = Sha256::new();
            hasher.update(&u);
            let new_u = hasher.finalize().to_vec();
            for (k, v) in key.iter_mut().zip(new_u.iter()) {
                *k ^= v;
            }
            u = new_u;
        }

        Ok(key)
    }

    /// Hash d'un mot de passe pour vérification
    fn hash_password(password: &str, salt: &[u8]) -> Vec<u8> {
        use sha2::{Sha256, Digest};

        let mut hasher = Sha256::new();
        hasher.update(password.as_bytes());
        hasher.update(salt);
        hasher.update(b"TITANE_PASSWORD_VERIFICATION");
        hasher.finalize().to_vec()
    }

    /// Générer des bytes aléatoires
    fn generate_random_bytes(len: usize) -> Vec<u8> {
        use std::time::{SystemTime, UNIX_EPOCH};

        // Implémentation simplifiée - utiliser getrandom en production
        let seed = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();

        let mut bytes = Vec::with_capacity(len);
        let mut state = seed as u64;

        for _ in 0..len {
            state = state.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407);
            bytes.push((state >> 33) as u8);
        }

        bytes
    }

    /// Chiffrement XOR simple (placeholder pour AES-GCM)
    fn xor_encrypt(data: &[u8], key: &[u8], nonce: &[u8]) -> Vec<u8> {
        let mut result = Vec::with_capacity(data.len());
        let combined_key: Vec<u8> = key.iter()
            .zip(nonce.iter().cycle())
            .map(|(k, n)| k ^ n)
            .collect();

        for (i, byte) in data.iter().enumerate() {
            result.push(byte ^ combined_key[i % combined_key.len()]);
        }

        result
    }

    /// Calculer un tag d'authentification
    fn compute_auth_tag(key: &[u8], nonce: &[u8], ciphertext: &[u8]) -> Vec<u8> {
        use sha2::{Sha256, Digest};

        let mut hasher = Sha256::new();
        hasher.update(key);
        hasher.update(nonce);
        hasher.update(ciphertext);
        hasher.update(b"TITANE_AUTH_TAG");
        hasher.finalize()[..16].to_vec()
    }
}

impl Default for CryptoStore {
    fn default() -> Self {
        Self::new()
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════

use once_cell::sync::Lazy;

/// Instance globale du CryptoStore (thread-safe)
pub static CRYPTO_STORE: Lazy<Arc<RwLock<CryptoStore>>> = Lazy::new(|| {
    Arc::new(RwLock::new(CryptoStore::new()))
});

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_set_password_and_unlock() {
        let mut store = CryptoStore::new();

        // Configurer le mot de passe
        store.set_master_password("test_password_123").unwrap();
        assert_eq!(store.key_state, KeyState::Unlocked);
        assert!(store.is_enabled());

        // Verrouiller
        store.lock();
        assert_eq!(store.key_state, KeyState::Locked);

        // Déverrouiller avec bon mot de passe
        store.unlock("test_password_123").unwrap();
        assert_eq!(store.key_state, KeyState::Unlocked);

        // Mauvais mot de passe
        store.lock();
        let result = store.unlock("wrong_password");
        assert!(matches!(result, Err(CryptoError::InvalidPassword)));
    }

    #[test]
    fn test_encrypt_decrypt_cycle() {
        let mut store = CryptoStore::new();
        store.set_master_password("secure_password").unwrap();

        let original = b"Hello TITANE! Secret data here.";

        // Chiffrer
        let blob = store.encrypt_blob(original).unwrap();
        assert_ne!(blob.ciphertext, original.to_vec());

        // Déchiffrer
        let decrypted = store.decrypt_blob(&blob).unwrap();
        assert_eq!(decrypted, original.to_vec());
    }

    #[test]
    fn test_encrypt_if_enabled() {
        let mut store = CryptoStore::new();

        let data = b"test data";

        // Pas activé - retourne les données originales
        let result = store.encrypt_if_enabled(data).unwrap();
        assert_eq!(result, data.to_vec());

        // Activer et rechiffrer
        store.set_master_password("password").unwrap();
        let encrypted = store.encrypt_if_enabled(data).unwrap();
        assert_ne!(encrypted, data.to_vec());
    }

    #[test]
    fn test_verify_password() {
        let mut store = CryptoStore::new();
        store.set_master_password("my_password").unwrap();
        store.lock();

        let verification = store.verify_password("my_password");
        assert!(verification.is_valid);

        let verification = store.verify_password("wrong");
        assert!(!verification.is_valid);
    }
}
