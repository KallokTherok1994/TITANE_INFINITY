// TITANE∞ v8.0 - MemoryCore Module Principal
// Système de mémoire chiffrée AES-256-GCM souverain et local

mod crypto;
mod storage;
pub mod types;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};
use types::{MemoryCollection, MemoryEntry};
/// Chemin par défaut du fichier de mémoire chiffrée
const MEMORY_FILE_PATH: &str = "./data/memory/encrypted_memory.bin";
/// Passphrase par défaut (à remplacer par configuration sécurisée en production)
const DEFAULT_PASSPHRASE: &str = "TITANE_INFINITY_SOVEREIGN_MEMORY_V8";
/// État du système de mémoire
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryState {
    /// Indique si le système est initialisé
    pub initialized: bool,
    
    /// Nombre d'entrées en mémoire
    pub entries_count: usize,
    /// Checksum SHA-256 de la dernière sauvegarde
    pub checksum: String,
    /// Timestamp de la dernière mise à jour (ms depuis epoch)
    pub last_update: u64,
}
impl MemoryState {
    /// Crée un nouvel état de mémoire
    fn new() -> Self {
        Self {
            initialized: false,
            entries_count: 0,
            checksum: String::new(),
            last_update: 0,
        }
    }
/// Module MemoryCore pour gestion globale
pub struct MemoryModule {
    state: Arc<Mutex<MemoryState>>,
    passphrase: String,
    storage_path: String,
impl MemoryModule {
    /// Crée une nouvelle instance du module mémoire
    pub fn new() -> Self {
            state: Arc::new(Mutex::new(MemoryState::new())),
            passphrase: DEFAULT_PASSPHRASE.to_string(),
            storage_path: MEMORY_FILE_PATH.to_string(),
}
    /// Initialise le module
    pub fn init(&mut self) -> Result<(), String> {
        let mut state = self.state.lock()
            .map_err(|e| format!("Failed to lock state: {}", e))?;
        
        state.initialized = true;
        state.last_update = current_timestamp();
        Ok(())
}
    /// Tick périodique du module
    pub fn tick(&mut self) -> Result<(), String> {
        // Vérification de santé basique
        let _state = self.state.lock()
    /// Sauvegarde une entrée de mémoire (interne)
    fn save_entry_internal(&mut self, entry: MemoryEntry) -> Result<(), String> {
        // Charger la collection existante ou créer une nouvelle
        let mut collection = self.load_collection_internal()
}
            .unwrap_or_else(|_| MemoryCollection::new());
        // Ajouter la nouvelle entrée
        collection.add_entry(entry);
        // Sérialiser en JSON
        let json_data = serde_json::to_string(&collection)
            .map_err(|e| format!("Failed to serialize collection: {}", e))?;
        // Chiffrer
        let key = crypto::derive_key_from_passphrase(&self.passphrase);
        let encrypted = crypto::encrypt(&key, json_data.as_bytes())?;
        // Calculer checksum
        let checksum = crypto::calculate_sha256(&encrypted);
        // Sauvegarder sur disque
        storage::save_bytes(&self.storage_path, &encrypted)?;
        // Mettre à jour l'état
        state.entries_count = collection.len();
        state.checksum = checksum;
    /// Charge les entrées de mémoire (interne)
    fn load_entries_internal(&self) -> Result<MemoryCollection, String> {
        self.load_collection_internal()
    /// Charge la collection complète
    fn load_collection_internal(&self) -> Result<MemoryCollection, String> {
        // Charger les bytes chiffrés
        let encrypted = storage::load_bytes(&self.storage_path)?;
        // Déchiffrer
        let decrypted = crypto::decrypt(&key, &encrypted)?;
        // Désérialiser JSON
        let collection: MemoryCollection = serde_json::from_slice(&decrypted)
            .map_err(|e| format!("Failed to deserialize collection: {}", e))?;
        Ok(collection)
    /// Efface toute la mémoire (interne)
    fn clear_memory_internal(&mut self) -> Result<(), String> {
        // Supprimer le fichier
        storage::clear_storage(&self.storage_path)?;
        // Réinitialiser l'état
        state.entries_count = 0;
        state.checksum = String::new();
/// Fonction d'initialisation globale
pub fn init() -> Result<MemoryModule, String> {
    let mut module = MemoryModule::new();
    module.init()?;
    Ok(module)
/// Fonction utilitaire pour obtenir le timestamp actuel
fn current_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or0
/// Génère un ID unique pour une entrée
fn generate_entry_id() -> String {
    use rand::Rng;
    let mut rng = rand::thread_rng();
    let random: u64 = rng.gen();
    format!("{:016x}", random)
// ============================================================================
// API TAURI - Commandes exposées au frontend
/// État global partagé pour l'API Tauri (nécessaire car Tauri commands sont stateless)
static MEMORY_INSTANCE: once_cell::sync::Lazy<Arc<Mutex<Option<MemoryModule>>>> = 
    once_cell::sync::Lazy::new(|| Arc::new(Mutex::new(None)));
/// Initialise l'instance globale (à appeler au démarrage)
pub fn init_global() -> Result<(), String> {
    let module = init()?;
    let mut instance = MEMORY_INSTANCE.lock()
        .map_err(|e| format!("Failed to lock global instance: {}", e))?;
    *instance = Some(module);
    Ok(())
/// Commande Tauri: Sauvegarder une entrée
#[tauri::command]
pub fn save_entry(content: String) -> Result<(), String> {
    let module = instance.as_mut()
        .ok_or("MemoryModule not initialized. Call init_global() first.")?;
    let entry = MemoryEntry::new(
        generate_entry_id(),
        content,
        current_timestamp(),
    );
    module.save_entry_internal(entry)
/// Commande Tauri: Charger toutes les entrées
pub fn load_entries() -> Result<String, String> {
    let instance = MEMORY_INSTANCE.lock()
    let module = instance.as_ref()
    let collection = module.load_entries_internal()?;
    // Convertir en JSON pour le frontend
    serde_json::to_string(&collection)
        .map_err(|e| format!("Failed to serialize collection: {}", e))
/// Commande Tauri: Effacer toute la mémoire
pub fn clear_memory() -> Result<(), String> {
    module.clear_memory_internal()
/// Commande Tauri: Obtenir l'état actuel de la mémoire
pub fn get_memory_state() -> Result<MemoryState, String> {
    let state = module.state.lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    Ok(state.clone())
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_memory_module_initialization() {
        let mut module = MemoryModule::new();
        let result = module.init();
        assert!(result.is_ok(), "Initialization should succeed");
        let state = module.state.lock().unwrap();
        assert!(state.initialized, "State should be initialized");
    fn test_save_and_load_entry() {
        module.init().unwrap();
        let entry = MemoryEntry::new(
            "test_id".to_string(),
            "Test content".to_string(),
            current_timestamp(),
        );
        // Sauvegarder
        let save_result = module.save_entry_internal(entry.clone());
        assert!(save_result.is_ok(), "Save should succeed");
        // Charger
        let load_result = module.load_entries_internal();
        assert!(load_result.is_ok(), "Load should succeed");
        let collection = load_result.unwrap();
        assert_eq!(collection.len(), 1, "Should have 1 entry");
        assert_eq!(collection.entries[0].content, "Test content");
    fn test_clear_memory() {
        // Ajouter une entrée
            "Test".to_string(),
        module.save_entry_internal(entry).unwrap();
        // Vérifier qu'elle existe
        let collection = module.load_entries_internal().unwrap();
        assert_eq!(collection.len(), 1);
        // Effacer
        let clear_result = module.clear_memory_internal();
        assert!(clear_result.is_ok(), "Clear should succeed");
        // Vérifier que c'est vide
        assert_eq!(state.entries_count, 0);
    fn test_multiple_entries() {
        // Ajouter plusieurs entrées
        for i in 0..5 {
            let entry = MemoryEntry::new(
                format!("id_{}", i),
                format!("Content {}", i),
                current_timestamp(),
            );
            module.save_entry_internal(entry).unwrap();
        // Charger et vérifier
        assert_eq!(collection.len(), 5, "Should have 5 entries");
    fn test_generate_entry_id() {
        let id1 = generate_entry_id();
        let id2 = generate_entry_id();
        assert_ne!(id1, id2, "Generated IDs should be unique");
        assert_eq!(id1.len(), 16, "ID should be 16 characters (64-bit hex)");

}
