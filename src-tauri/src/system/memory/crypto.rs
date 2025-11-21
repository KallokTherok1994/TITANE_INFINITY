// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v8.0 - MemoryCore Cryptography                                      ║
// ║ Chiffrement AES-256-GCM local et souverain                                  ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use rand::RngCore;
use sha2::{Digest, Sha256};
/// Taille du nonce/IV pour AES-GCM (96 bits / 12 bytes)
const NONCE_SIZE: usize = 12;
/// Taille de la clé AES-256 (256 bits / 32 bytes)
const KEY_SIZE: usize = 32;
/// Dérive une clé de 32 bytes à partir d'une passphrase
///
/// Utilise SHA-256 pour dériver une clé déterministe
/// # Arguments
/// * `passphrase` - La passphrase source
/// # Returns
/// * Clé de 32 bytes pour AES-256
pub fn derive_key_from_passphrase(passphrase: &str) -> [u8; KEY_SIZE] {
    let mut hasher = Sha256::new();
    hasher.update(passphrase.as_bytes());
    let result = hasher.finalize();

    let mut key = [0u8; KEY_SIZE];
    key.copy_from_slice(&result[..KEY_SIZE]);
    key
}
/// Génère un nonce aléatoire de 12 bytes
/// * `Result<[u8; NONCE_SIZE], String>` - Nonce généré ou erreur
fn generate_nonce() -> Result<[u8; NONCE_SIZE], String> {
    let mut nonce_bytes = [0u8; NONCE_SIZE];
    let mut rng = rand::thread_rng();
    rng.fill_bytes(&mut nonce_bytes);
    Ok(nonce_bytes)
}

/// Chiffre des données avec AES-256-GCM
/// Format de sortie: [nonce (12 bytes)] + [ciphertext + tag]
/// * `key` - Clé de chiffrement de 32 bytes
/// * `plaintext` - Données en clair à chiffrer
/// * `Result<Vec<u8>, String>` - Données chiffrées (nonce + ciphertext + tag) ou erreur
pub fn encrypt(key: &[u8], plaintext: &[u8]) -> Result<Vec<u8>, String> {
    // Vérifier la taille de la clé
    if key.len() != KEY_SIZE {
        return Err(format!(
            "Taille de clé invalide: {} bytes (attendu: {} bytes)",
            key.len(),
            KEY_SIZE
        ));
    }
    // Créer le cipher AES-256-GCM
    let cipher = Aes256Gcm::new_from_slice(key)
        .map_err(|e| format!("Erreur lors de la création du cipher: {}", e))?;
    // Générer un nonce aléatoire
    let nonce_bytes = generate_nonce()?;
    let nonce = Nonce::from_slice(&nonce_bytes);
    // Chiffrer les données
    let ciphertext = cipher
        .encrypt(nonce, plaintext)
        .map_err(|e| format!("Erreur lors du chiffrement: {}", e))?;
    // Construire le résultat: nonce + ciphertext (qui contient déjà le tag)
    let mut result = Vec::with_capacity(NONCE_SIZE + ciphertext.len());
    result.extend_from_slice(&nonce_bytes);
    result.extend_from_slice(&ciphertext);
    Ok(result)
}

/// Déchiffre des données avec AES-256-GCM
/// Format d'entrée attendu: [nonce (12 bytes)] + [ciphertext + tag]
/// * `key` - Clé de déchiffrement de 32 bytes
/// * `encrypted_data` - Données chiffrées (nonce + ciphertext + tag)
/// * `Result<Vec<u8>, String>` - Données déchiffrées ou erreur
pub fn decrypt(key: &[u8], encrypted_data: &[u8]) -> Result<Vec<u8>, String> {
    // Vérifier la taille minimale des données
    if encrypted_data.len() < NONCE_SIZE {
        return Err(format!(
            "Données chiffrées trop courtes: {} bytes (minimum: {} bytes)",
            encrypted_data.len(),
            NONCE_SIZE
        ));
    }
    // Créer le cipher AES-256-GCM
    let cipher = Aes256Gcm::new_from_slice(key)
        .map_err(|e| format!("Erreur lors de la création du cipher: {}", e))?;
    // Extraire le nonce et le ciphertext
    let (nonce_bytes, ciphertext) = encrypted_data.split_at(NONCE_SIZE);
    let nonce = Nonce::from_slice(nonce_bytes);
    // Déchiffrer les données
    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| format!("Erreur lors du déchiffrement: {}", e))?;
    Ok(plaintext)
}

/// Calcule le hash SHA-256 d'un ensemble de données
/// * `data` - Données à hasher
/// * Hash hexadécimal en String
pub fn calculate_checksum(data: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data);
    let result = hasher.finalize();
    hex::encode(result)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_derive_key() {
        let key = derive_key_from_passphrase("test_passphrase");
        assert_eq!(key.len(), KEY_SIZE);
    }

    #[test]
    fn test_encrypt_decrypt() {
        let key = derive_key_from_passphrase("test_key");
        let plaintext = b"Hello, TITANE!";

        let encrypted = encrypt(&key, plaintext).expect("Encryption failed");
        let decrypted = decrypt(&key, &encrypted).expect("Decryption failed");
        assert_eq!(plaintext, &decrypted[..]);
    }

    #[test]
    fn test_invalid_key_size() {
        let invalid_key = [0u8; 16]; // Trop court
        let plaintext = b"test";
        let result = encrypt(&invalid_key, plaintext);
        assert!(result.is_err());
    }

    #[test]
    fn test_checksum() {
        let data = b"test data";
        let checksum = calculate_checksum(data);
        assert!(!checksum.is_empty());
        assert_eq!(checksum.len(), 64); // SHA-256 hex = 64 chars
    }
}
