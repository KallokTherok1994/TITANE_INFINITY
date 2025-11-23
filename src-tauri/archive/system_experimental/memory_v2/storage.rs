// TITANE∞ v8.0 - Memory Storage Module
// Persistence locale sécurisée pour le système de mémoire

use std::fs;
use std::path::Path;
/// Sauvegarde des bytes dans un fichier
/// 
/// Crée automatiquement les répertoires parents si nécessaire
/// # Arguments
/// * `path` - Chemin du fichier
/// * `data` - Données à sauvegarder
/// # Returns
/// * `Ok(())` - Succès
/// * `Err(String)` - Message d'erreur
pub fn save_bytes(path: &str, data: &[u8]) -> Result<(), String> {
    // Créer le chemin parent si nécessaire
    if let Some(parent) = Path::new(path).parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directory '{}': {}", parent.display(), e))?;
    }
    
    // Écriture atomique via fichier temporaire
    let temp_path = format!("{}.tmp", path);
    // Écrire dans le fichier temporaire
    fs::write(&temp_path, data)
        .map_err(|e| format!("Failed to write to temporary file '{}': {}", temp_path, e))?;
    // Renommer atomiquement (plus sûr)
    fs::rename(&temp_path, path)
        .map_err(|e| format!("Failed to rename '{}' to '{}': {}", temp_path, path, e))?;
    Ok(())
}
/// Charge des bytes depuis un fichier
/// * `Ok(Vec<u8>)` - Données chargées
pub fn load_bytes(path: &str) -> Result<Vec<u8>, String> {
    // Vérifier que le fichier existe
    if !Path::new(path).exists() {
        return Err(format!("File '{}' does not exist", path));
    // Lire le fichier
    fs::read(path)
        .map_err(|e| format!("Failed to read file '{}': {}", path, e))
/// Supprime un fichier de stockage
/// * `path` - Chemin du fichier à supprimer
/// * `Ok(())` - Succès (même si le fichier n'existait pas)
/// * `Err(String)` - Message d'erreur en cas d'échec
pub fn clear_storage(path: &str) -> Result<(), String> {
    // Si le fichier n'existe pas, c'est un succès
        return Ok(());
    // Supprimer le fichier
    fs::remove_file(path)
        .map_err(|e| format!("Failed to remove file '{}': {}", path, e))?;
/// Vérifie si un fichier existe
/// * `true` - Le fichier existe
/// * `false` - Le fichier n'existe pas
pub fn file_exists(path: &str) -> bool {
    Path::new(path).exists()
/// Obtient la taille d'un fichier en bytes
/// * `Ok(u64)` - Taille en bytes
pub fn file_size(path: &str) -> Result<u64, String> {
    let metadata = fs::metadata(path)
        .map_err(|e| format!("Failed to get metadata for '{}': {}", path, e))?;
    Ok(metadata.len())
#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    const TEST_DIR: &str = "./test_data";
    const TEST_FILE: &str = "./test_data/test_storage.bin";
    fn cleanup() {
        let _ = fs::remove_dir_all(TEST_DIR);
    #[test]
    fn test_save_and_load_bytes() {
        cleanup();
        
        let data = b"Hello, TITANE Infinity!";
        // Sauvegarder
        save_bytes(TEST_FILE, data).expect("Save should succeed");
        // Charger
        let loaded = load_bytes(TEST_FILE).expect("Load should succeed");
        assert_eq!(data, &loaded[..], "Loaded data should match saved data");
    fn test_save_creates_parent_directories() {
        let nested_path = "./test_data/sub1/sub2/file.bin";
        let data = b"test";
        save_bytes(nested_path, data).expect("Save with nested path should succeed");
        assert!(file_exists(nested_path), "File should exist");
    fn test_load_nonexistent_file() {
        let result = load_bytes("./nonexistent_file.bin");
        assert!(result.is_err(), "Loading nonexistent file should fail");
    fn test_clear_storage() {
        let data = b"test data";
        assert!(file_exists(TEST_FILE), "File should exist before clear");
        clear_storage(TEST_FILE).expect("Clear should succeed");
        assert!(!file_exists(TEST_FILE), "File should not exist after clear");
    fn test_clear_nonexistent_file() {
        // Effacer un fichier qui n'existe pas devrait réussir
        let result = clear_storage("./nonexistent_file.bin");
        assert!(result.is_ok(), "Clearing nonexistent file should succeed");
    fn test_file_exists() {
        assert!(!file_exists(TEST_FILE), "File should not exist initially");
        assert!(file_exists(TEST_FILE), "File should exist after save");
    fn test_file_size() {
        let data = b"12345678"; // 8 bytes
        let size = file_size(TEST_FILE).expect("Getting file size should succeed");
        assert_eq!(size, 8, "File size should be 8 bytes");
    fn test_atomic_write() {
        let data1 = b"first write";
        let data2 = b"second write (should be atomic)";
        // Première écriture
        save_bytes(TEST_FILE, data1).expect("First save should succeed");
        // Deuxième écriture (devrait être atomique)
        save_bytes(TEST_FILE, data2).expect("Second save should succeed");
        // Vérifier que c'est la deuxième version
        assert_eq!(data2, &loaded[..], "Should have second data");
        // Vérifier qu'il n'y a pas de fichier .tmp résiduel
        assert!(!file_exists(&format!("{}.tmp", TEST_FILE)), "Temp file should be cleaned up");
    fn test_large_file() {
        let large_data = vec![0xAB; 1024 * 100]; // 100KB
        save_bytes(TEST_FILE, &large_data).expect("Saving large file should succeed");
        let loaded = load_bytes(TEST_FILE).expect("Loading large file should succeed");
        assert_eq!(large_data, loaded, "Large file roundtrip should preserve data");
