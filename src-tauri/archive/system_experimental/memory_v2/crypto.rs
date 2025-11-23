// TITANE∞ v8.0 - Memory Crypto Module
// Chiffrement AES-256-GCM local souverain

use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use sha2::{Digest, Sha256};
use rand::RngCore;
/// Taille de la clé AES-256 (32 bytes)
const KEY_SIZE: usize = 32;
/// Taille du nonce AES-GCM (12 bytes)
const NONCE_SIZE: usize = 12;
/// Dérive une clé de 32 bytes depuis une passphrase
/// 
/// Utilise SHA-256 pour générer une clé déterministe
/// # Arguments
/// * `passphrase` - La passphrase source
/// # Returns
/// * Tableau de 32 bytes utilisable comme clé AES-256
pub fn derive_key_from_passphrase(passphrase: &str) -> [u8; KEY_SIZE] {
    let mut hasher = Sha256::new();
    hasher.update(passphrase.as_bytes());
    let result = hasher.finalize();
    
    let mut key = [0u8; KEY_SIZE];
    key.copy_from_slice(&result[..KEY_SIZE]);
    key
}
/// Chiffre des données avec AES-256-GCM
/// * `key` - Clé de chiffrement (32 bytes)
/// * `plaintext` - Données en clair
/// * `Ok(Vec<u8>)` - Nonce 12 + Ciphertext + Tag 16 concaténés
/// * `Err(String)` - Message d'erreur en cas d'échec
pub fn encrypt(key: &[u8], plaintext: &[u8]) -> Result<Vec<u8>, String> {
    // Validation de la clé
    if key.len() != KEY_SIZE {
        return Err(format!(
            "Invalid key size: expected {}, got {}",
            KEY_SIZE,
            key.len()
        ));
    }
    // Génération du nonce aléatoire (12 bytes)
    let mut nonce_bytes = [0u8; NONCE_SIZE];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);
    // Création du cipher
    let cipher = Aes256Gcm::new_from_slice(key)
        .map_err(|e| format!("Failed to create cipher: {}", e))?;
    // Chiffrement
    let ciphertext = cipher
        .encrypt(nonce, plaintext)
        .map_err(|e| format!("Encryption failed: {}", e))?;
    // Concaténation: nonce + ciphertext (qui contient déjà le tag)
    let mut result = Vec::with_capacity(NONCE_SIZE + ciphertext.len());
    result.extend_from_slice(&nonce_bytes);
    result.extend_from_slice(&ciphertext);
    Ok(result)
/// Déchiffre des données chiffrées avec AES-256-GCM
/// * `key` - Clé de déchiffrement (32 bytes)
/// * `encrypted_data` - Nonce 12 + Ciphertext + Tag 16
/// * `Ok(Vec<u8>)` - Données déchiffrées
pub fn decrypt(key: &[u8], encrypted_data: &[u8]) -> Result<Vec<u8>, String> {
    // Validation de la taille minimale (nonce + tag minimum)
    if encrypted_data.len() < NONCE_SIZE + 16 {
            "Encrypted data too short: expected at least {}, got {}",
            NONCE_SIZE + 16,
            encrypted_data.len()
    // Extraction du nonce (12 premiers bytes)
    let nonce = Nonce::from_slice(&encrypted_data[..NONCE_SIZE]);
    // Le reste est ciphertext + tag
    let ciphertext = &encrypted_data[NONCE_SIZE..];
    // Déchiffrement et vérification du tag
    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| format!("Decryption failed (tag verification failed): {}", e))?;
    Ok(plaintext)
/// Calcule le hash SHA-256 d'un contenu
/// * `data` - Données à hasher
/// * String hexadécimale du hash
pub fn calculate_sha256(data: &[u8]) -> String {
    hasher.update(data);
    // Conversion en hexadécimal
    result.iter()
        .map(|b| format!("{:02x}", b))
        .collect::<String>()
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_derive_key_deterministic() {
        let key1 = derive_key_from_passphrase("test_passphrase");
        let key2 = derive_key_from_passphrase("test_passphrase");
        assert_eq!(key1, key2, "Key derivation should be deterministic");
    fn test_derive_key_different() {
        let key1 = derive_key_from_passphrase("passphrase1");
        let key2 = derive_key_from_passphrase("passphrase2");
        assert_ne!(key1, key2, "Different passphrases should produce different keys");
    fn test_encrypt_decrypt_roundtrip() {
        let key = derive_key_from_passphrase("test_key");
        let plaintext = b"Hello, TITANE Infinity!";
        
        let encrypted = encrypt(&key, plaintext).expect("Encryption should succeed");
        let decrypted = decrypt(&key, &encrypted).expect("Decryption should succeed");
        assert_eq!(plaintext, &decrypted[..], "Roundtrip should preserve data");
    fn test_decrypt_with_wrong_key() {
        let key1 = derive_key_from_passphrase("key1");
        let key2 = derive_key_from_passphrase("key2");
        let plaintext = b"Secret data";
        let encrypted = encrypt(&key1, plaintext).expect("Encryption should succeed");
        let result = decrypt(&key2, &encrypted);
        assert!(result.is_err(), "Decryption with wrong key should fail");
    fn test_encrypt_produces_different_ciphertexts() {
        let plaintext = b"Same plaintext";
        let encrypted1 = encrypt(&key, plaintext).expect("Encryption should succeed");
        let encrypted2 = encrypt(&key, plaintext).expect("Encryption should succeed");
        // Les nonces sont différents, donc les ciphertexts aussi
        assert_ne!(encrypted1, encrypted2, "Same plaintext should produce different ciphertexts (different nonces)");
    fn test_invalid_key_size_encrypt() {
        let invalid_key = [0u8; 16]; // Seulement 16 bytes au lieu de 32
        let plaintext = b"test";
        let result = encrypt(&invalid_key, plaintext);
        assert!(result.is_err(), "Encryption with wrong key size should fail");
    fn test_invalid_key_size_decrypt() {
        let invalid_key = [0u8; 16];
        let data = [0u8; 32];
        let result = decrypt(&invalid_key, &data);
        assert!(result.is_err(), "Decryption with wrong key size should fail");
    fn test_decrypt_too_short_data() {
        let short_data = [0u8; 10]; // Trop court (< 12 + 16)
        let result = decrypt(&key, &short_data);
        assert!(result.is_err(), "Decryption of too short data should fail");
    fn test_calculate_sha256() {
        let data = b"test data";
        let hash1 = calculate_sha256(data);
        let hash2 = calculate_sha256(data);
        assert_eq!(hash1, hash2, "SHA-256 should be deterministic");
        assert_eq!(hash1.len(), 64, "SHA-256 hex string should be 64 characters");
    fn test_large_data_encryption() {
        let large_plaintext = vec![0u8; 1024 * 100]; // 100KB
        let encrypted = encrypt(&key, &large_plaintext).expect("Large data encryption should succeed");
        let decrypted = decrypt(&key, &encrypted).expect("Large data decryption should succeed");
        assert_eq!(large_plaintext, decrypted, "Large data roundtrip should preserve data");
