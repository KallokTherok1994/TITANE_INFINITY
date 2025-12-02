// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — CLOUD CRYPTO ENGINE
//   AES-256-GCM + Argon2id + Ed25519 Signatures
//   Chiffrement et signature pour le Cloud Vault
// ═══════════════════════════════════════════════════════════════

use aes_gcm::aead::{Aead, KeyInit};
use aes_gcm::{Aes256Gcm, Nonce};
use argon2::password_hash::rand_core::RngCore;
use argon2::Argon2;
use base64::Engine as _;
use ed25519_dalek::{Signature, Signer, SigningKey, Verifier, VerifyingKey};
use log::{debug, error, info};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs;
use std::path::Path;
use zeroize::Zeroizing;

use super::CloudSyncError;

const SALT_LEN: usize = 16;
const NONCE_LEN: usize = 12;
const KEY_LEN: usize = 32;

/// ═══════════════════════════════════════════════════════════════
/// CLOUD CRYPTO ENGINE
/// ═══════════════════════════════════════════════════════════════

#[derive(Clone)]
pub struct CloudCryptoEngine {
    /// Clé de chiffrement dérivée (AES-256)
    encryption_key: Zeroizing<[u8; KEY_LEN]>,
    /// Salt utilisé pour la dérivation
    salt: [u8; SALT_LEN],
    /// Clé de signature Ed25519
    signing_key: Option<SigningKey>,
    /// Clé de vérification publique
    verifying_key: Option<VerifyingKey>,
}

/// Données chiffrées avec métadonnées
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptedData {
    /// Version du format
    pub version: u8,
    /// Salt pour Argon2id
    pub salt: String,
    /// Nonce pour AES-GCM
    pub nonce: String,
    /// Données chiffrées (base64)
    pub ciphertext: String,
    /// Signature Ed25519 (base64)
    pub signature: Option<String>,
    /// Hash SHA-256 des données originales
    pub content_hash: String,
    /// Timestamp de chiffrement
    pub encrypted_at: String,
}

/// Paire de clés d'appareil
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceKeyPair {
    /// Clé privée Ed25519 (base64) - NE JAMAIS SYNCHRONISER
    pub private_key: String,
    /// Clé publique Ed25519 (base64) - synchronisable
    pub public_key: String,
    /// Fingerprint de la clé publique
    pub fingerprint: String,
    /// Date de création
    pub created_at: String,
}

impl CloudCryptoEngine {
    /// Initialise le moteur crypto avec un mot de passe
    pub fn new(passphrase: &str) -> Result<Self, CloudSyncError> {
        let mut salt = [0u8; SALT_LEN];
        rand::thread_rng().fill_bytes(&mut salt);

        let encryption_key = Self::derive_key(passphrase, &salt)?;

        info!("[CloudCrypto] Crypto engine initialized with new salt");

        Ok(Self {
            encryption_key,
            salt,
            signing_key: None,
            verifying_key: None,
        })
    }

    /// Initialise avec un salt existant (pour déchiffrement)
    pub fn with_salt(passphrase: &str, salt: &[u8; SALT_LEN]) -> Result<Self, CloudSyncError> {
        let encryption_key = Self::derive_key(passphrase, salt)?;

        debug!("[CloudCrypto] Crypto engine initialized with existing salt");

        Ok(Self {
            encryption_key,
            salt: *salt,
            signing_key: None,
            verifying_key: None,
        })
    }

    /// Charge ou génère la paire de clés d'appareil
    pub fn load_or_generate_device_keys(
        &mut self,
        keys_path: &Path,
    ) -> Result<DeviceKeyPair, CloudSyncError> {
        if keys_path.exists() {
            let content = fs::read_to_string(keys_path)?;
            let keypair: DeviceKeyPair = serde_json::from_str(&content)?;

            // Charger les clés
            let private_bytes = base64::engine::general_purpose::STANDARD
                .decode(&keypair.private_key)
                .map_err(|e| CloudSyncError::DecryptionFailed(e.to_string()))?;

            if private_bytes.len() != 32 {
                return Err(CloudSyncError::DecryptionFailed(
                    "Invalid private key length".to_string(),
                ));
            }

            let mut key_bytes = [0u8; 32];
            key_bytes.copy_from_slice(&private_bytes);

            let signing_key = SigningKey::from_bytes(&key_bytes);
            self.verifying_key = Some(signing_key.verifying_key());
            self.signing_key = Some(signing_key);

            info!("[CloudCrypto] Device keys loaded from {:?}", keys_path);
            Ok(keypair)
        } else {
            let keypair = self.generate_device_keys()?;

            // Sauvegarder
            if let Some(parent) = keys_path.parent() {
                fs::create_dir_all(parent)?;
            }
            fs::write(keys_path, serde_json::to_string_pretty(&keypair)?)?;

            info!("[CloudCrypto] New device keys generated and saved");
            Ok(keypair)
        }
    }

    /// Génère une nouvelle paire de clés d'appareil
    fn generate_device_keys(&mut self) -> Result<DeviceKeyPair, CloudSyncError> {
        let mut csprng = rand::thread_rng();

        // Génère 32 bytes aléatoires pour la clé secrète
        let mut secret_bytes = [0u8; 32];
        csprng.fill_bytes(&mut secret_bytes);

        // Crée la clé de signature à partir des bytes
        let signing_key = SigningKey::from_bytes(&secret_bytes);
        let verifying_key = signing_key.verifying_key();

        let private_b64 =
            base64::engine::general_purpose::STANDARD.encode(signing_key.to_bytes());
        let public_b64 =
            base64::engine::general_purpose::STANDARD.encode(verifying_key.to_bytes());

        // Fingerprint = SHA-256 de la clé publique (premiers 16 bytes en hex)
        let mut hasher = Sha256::new();
        hasher.update(verifying_key.to_bytes());
        let hash = hasher.finalize();
        let fingerprint = hex::encode(&hash[..16]);

        self.signing_key = Some(signing_key);
        self.verifying_key = Some(verifying_key);

        Ok(DeviceKeyPair {
            private_key: private_b64,
            public_key: public_b64,
            fingerprint,
            created_at: chrono::Utc::now().to_rfc3339(),
        })
    }

    /// Dérive une clé de chiffrement via Argon2id
    fn derive_key(
        passphrase: &str,
        salt: &[u8; SALT_LEN],
    ) -> Result<Zeroizing<[u8; KEY_LEN]>, CloudSyncError> {
        let mut key = Zeroizing::new([0u8; KEY_LEN]);

        // Paramètres Argon2id sécurisés
        let argon2 = Argon2::default();

        argon2
            .hash_password_into(passphrase.as_bytes(), salt, key.as_mut())
            .map_err(|e| CloudSyncError::KeyDerivationFailed(e.to_string()))?;

        Ok(key)
    }

    /// Chiffre des données avec AES-256-GCM et signe optionnellement
    pub fn encrypt(&self, plaintext: &[u8], sign: bool) -> Result<EncryptedData, CloudSyncError> {
        // Générer un nonce aléatoire
        let mut nonce_bytes = [0u8; NONCE_LEN];
        rand::thread_rng().fill_bytes(&mut nonce_bytes);

        // Créer le cipher AES-256-GCM
        let cipher = Aes256Gcm::new_from_slice(self.encryption_key.as_ref())
            .map_err(|e| CloudSyncError::EncryptionFailed(e.to_string()))?;

        let nonce = Nonce::from_slice(&nonce_bytes);

        // Chiffrer
        let ciphertext = cipher
            .encrypt(nonce, plaintext)
            .map_err(|e| CloudSyncError::EncryptionFailed(e.to_string()))?;

        // Hash du contenu original
        let mut hasher = Sha256::new();
        hasher.update(plaintext);
        let content_hash = hex::encode(hasher.finalize());

        // Signature optionnelle
        let signature = if sign {
            self.sign(&ciphertext)?
        } else {
            None
        };

        Ok(EncryptedData {
            version: 1,
            salt: base64::engine::general_purpose::STANDARD.encode(self.salt),
            nonce: base64::engine::general_purpose::STANDARD.encode(nonce_bytes),
            ciphertext: base64::engine::general_purpose::STANDARD.encode(&ciphertext),
            signature,
            content_hash,
            encrypted_at: chrono::Utc::now().to_rfc3339(),
        })
    }

    /// Déchiffre des données et vérifie la signature
    pub fn decrypt(
        &self,
        encrypted: &EncryptedData,
        verify_signature: bool,
    ) -> Result<Vec<u8>, CloudSyncError> {
        // Décoder le nonce
        let nonce_bytes = base64::engine::general_purpose::STANDARD
            .decode(&encrypted.nonce)
            .map_err(|e| CloudSyncError::DecryptionFailed(e.to_string()))?;

        // Décoder le ciphertext
        let ciphertext = base64::engine::general_purpose::STANDARD
            .decode(&encrypted.ciphertext)
            .map_err(|e| CloudSyncError::DecryptionFailed(e.to_string()))?;

        // Vérifier la signature si demandé
        if verify_signature {
            if let Some(ref sig) = encrypted.signature {
                if !self.verify(sig, &ciphertext)? {
                    return Err(CloudSyncError::SignatureInvalid);
                }
            }
        }

        // Créer le cipher
        let cipher = Aes256Gcm::new_from_slice(self.encryption_key.as_ref())
            .map_err(|e| CloudSyncError::DecryptionFailed(e.to_string()))?;

        let nonce = Nonce::from_slice(&nonce_bytes);

        // Déchiffrer
        let plaintext = cipher
            .decrypt(nonce, ciphertext.as_ref())
            .map_err(|e| CloudSyncError::DecryptionFailed(e.to_string()))?;

        // Vérifier le hash du contenu
        let mut hasher = Sha256::new();
        hasher.update(&plaintext);
        let computed_hash = hex::encode(hasher.finalize());

        if computed_hash != encrypted.content_hash {
            error!("[CloudCrypto] Content hash mismatch - vault may be corrupted");
            return Err(CloudSyncError::VaultCorrupted(
                "Content hash verification failed".to_string(),
            ));
        }

        Ok(plaintext)
    }

    /// Signe des données avec Ed25519
    fn sign(&self, data: &[u8]) -> Result<Option<String>, CloudSyncError> {
        match &self.signing_key {
            Some(key) => {
                let signature: Signature = key.sign(data);
                Ok(Some(
                    base64::engine::general_purpose::STANDARD.encode(signature.to_bytes()),
                ))
            }
            None => Ok(None),
        }
    }

    /// Vérifie une signature Ed25519
    fn verify(&self, signature_b64: &str, data: &[u8]) -> Result<bool, CloudSyncError> {
        match &self.verifying_key {
            Some(key) => {
                let sig_bytes = base64::engine::general_purpose::STANDARD
                    .decode(signature_b64)
                    .map_err(|e| CloudSyncError::SignatureInvalid)?;

                if sig_bytes.len() != 64 {
                    return Ok(false);
                }

                let mut sig_array = [0u8; 64];
                sig_array.copy_from_slice(&sig_bytes);

                let signature = Signature::from_bytes(&sig_array);

                Ok(key.verify(data, &signature).is_ok())
            }
            None => {
                debug!("[CloudCrypto] No verifying key available, skipping signature check");
                Ok(true)
            }
        }
    }

    /// Vérifie une signature avec une clé publique externe
    pub fn verify_with_public_key(
        public_key_b64: &str,
        signature_b64: &str,
        data: &[u8],
    ) -> Result<bool, CloudSyncError> {
        let pub_bytes = base64::engine::general_purpose::STANDARD
            .decode(public_key_b64)
            .map_err(|_| CloudSyncError::SignatureInvalid)?;

        if pub_bytes.len() != 32 {
            return Ok(false);
        }

        let mut key_array = [0u8; 32];
        key_array.copy_from_slice(&pub_bytes);

        let verifying_key = VerifyingKey::from_bytes(&key_array)
            .map_err(|_| CloudSyncError::SignatureInvalid)?;

        let sig_bytes = base64::engine::general_purpose::STANDARD
            .decode(signature_b64)
            .map_err(|_| CloudSyncError::SignatureInvalid)?;

        if sig_bytes.len() != 64 {
            return Ok(false);
        }

        let mut sig_array = [0u8; 64];
        sig_array.copy_from_slice(&sig_bytes);

        let signature = Signature::from_bytes(&sig_array);

        Ok(verifying_key.verify(data, &signature).is_ok())
    }

    /// Retourne le salt actuel
    pub fn get_salt(&self) -> [u8; SALT_LEN] {
        self.salt
    }

    /// Retourne la clé publique si disponible
    pub fn get_public_key(&self) -> Option<String> {
        self.verifying_key.map(|key| {
            base64::engine::general_purpose::STANDARD.encode(key.to_bytes())
        })
    }

    /// Calcule le hash SHA-256 d'un contenu
    pub fn hash_content(data: &[u8]) -> String {
        let mut hasher = Sha256::new();
        hasher.update(data);
        hex::encode(hasher.finalize())
    }
}

/// ═══════════════════════════════════════════════════════════════
/// COMPRESSION LZ4
/// ═══════════════════════════════════════════════════════════════

/// Compresse des données avec LZ4
pub fn compress_lz4(data: &[u8]) -> Result<Vec<u8>, CloudSyncError> {
    // Utilisation de flate2 pour la compression (déjà dans les dépendances)
    use flate2::write::GzEncoder;
    use flate2::Compression;
    use std::io::Write;

    let mut encoder = GzEncoder::new(Vec::new(), Compression::best());
    encoder
        .write_all(data)
        .map_err(|e| CloudSyncError::CompressionFailed(e.to_string()))?;
    encoder
        .finish()
        .map_err(|e| CloudSyncError::CompressionFailed(e.to_string()))
}

/// Décompresse des données LZ4
pub fn decompress_lz4(compressed: &[u8]) -> Result<Vec<u8>, CloudSyncError> {
    use flate2::read::GzDecoder;
    use std::io::Read;

    let mut decoder = GzDecoder::new(compressed);
    let mut decompressed = Vec::new();
    decoder
        .read_to_end(&mut decompressed)
        .map_err(|e| CloudSyncError::CompressionFailed(e.to_string()))?;
    Ok(decompressed)
}

// Ajout de hex pour l'encodage hexadécimal
mod hex {
    const HEX_CHARS: &[u8; 16] = b"0123456789abcdef";

    pub fn encode(data: impl AsRef<[u8]>) -> String {
        let bytes = data.as_ref();
        let mut hex = String::with_capacity(bytes.len() * 2);
        for byte in bytes {
            hex.push(HEX_CHARS[(byte >> 4) as usize] as char);
            hex.push(HEX_CHARS[(byte & 0x0f) as usize] as char);
        }
        hex
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encrypt_decrypt_roundtrip() {
        let engine = CloudCryptoEngine::new("test_password_123").unwrap();
        let plaintext = b"Hello, TITANE Cloud!";

        let encrypted = engine.encrypt(plaintext, false).unwrap();
        let decrypted = engine.decrypt(&encrypted, false).unwrap();

        assert_eq!(plaintext.to_vec(), decrypted);
    }

    #[test]
    fn test_compression_roundtrip() {
        let data = b"This is some test data that should be compressed and decompressed correctly.";

        let compressed = compress_lz4(data).unwrap();
        let decompressed = decompress_lz4(&compressed).unwrap();

        assert_eq!(data.to_vec(), decompressed);
    }
}
