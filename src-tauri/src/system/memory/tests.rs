// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v8.0 - MemoryCore Integration Tests                                 ║
// ║ Tests d'intégration pour le système de mémoire chiffrée                     ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

#[cfg(test)]
mod integration_tests {
    use super::super::*;
    use std::fs;
    /// Chemin de test pour éviter de modifier le fichier principal
    const TEST_PATH: &str = "./data/memory/test_memory.bin";
    /// Nettoie les fichiers de test avant et après chaque test
    fn cleanup() {
        let _ = fs::remove_file(TEST_PATH);
        let _ = fs::remove_file(format!("{}.tmp", TEST_PATH));
    }
    #[test]
    fn test_full_lifecycle() {
        cleanup();
        // Test 1: Sauvegarder une entrée
        let entry1 = MemoryEntry::new(
            "test_1".to_string(),
            serde_json::json!({
                "type": "note",
                "text": "Premier test d'intégration"
            }).to_string()
        );
        assert!(save_entry_internal(entry1).is_ok(), "Échec de sauvegarde entry 1");
        // Test 2: Charger les entrées
        let collection = load_entries_internal()
            .expect("Échec de chargement des entrées");
        
        assert_eq!(collection.entries.len(), 1, "Devrait avoir 1 entrée");
        assert_eq!(collection.entries[0].id, "test_1");
        // Test 3: Ajouter une deuxième entrée
        let entry2 = MemoryEntry::new(
            "test_2".to_string(),
            "Deuxième entrée de test".to_string()
        );
        assert!(save_entry_internal(entry2).is_ok(), "Échec de sauvegarde entry 2");
        // Test 4: Vérifier qu'on a bien 2 entrées
        let collection = load_entries_internal()
            .expect("Échec de chargement après ajout");
        assert_eq!(collection.entries.len(), 2, "Devrait avoir 2 entrées");
        // Test 5: Calculer le checksum
        let checksum = calculate_collection_checksum(&collection)
            .expect("Échec de calcul du checksum");
        assert_eq!(checksum.len(), 64, "Le checksum SHA-256 doit faire 64 caractères hex");
        // Test 6: Effacer la mémoire
        assert!(clear_memory_internal().is_ok(), "Échec d'effacement");
        // Test 7: Vérifier que le fichier n'existe plus
        assert!(!storage::exists(TEST_PATH), "Le fichier devrait être supprimé");
    }
    
    #[test]
    fn test_encryption_integrity() {
        // Créer des données de test (ASCII only for byte string literals)
        let original_data = b"Donnees sensibles a chiffrer";
        let passphrase = "test_passphrase_secure";
        // Dériver la clé
        let key = crypto::derive_key_from_passphrase(passphrase);
        assert_eq!(key.len(), 32, "La clé doit faire 32 bytes");
        // Chiffrer
        let encrypted = crypto::encrypt(&key, original_data)
            .expect("Échec de chiffrement");
        assert!(encrypted.len() > original_data.len(), "Les données chiffrées doivent être plus grandes");
        // Déchiffrer
        let decrypted = crypto::decrypt(&key, &encrypted)
            .expect("Échec de déchiffrement");
        assert_eq!(decrypted, original_data, "Les données déchiffrées doivent correspondre");
    }
    
    #[test]
    fn test_wrong_key_fails() {
        let data = b"Secret data";
        let key1 = crypto::derive_key_from_passphrase("password1");
        let key2 = crypto::derive_key_from_passphrase("password2");
        // Chiffrer avec key1
        let encrypted = crypto::encrypt(&key1, data).expect("Encryption failed");
        // Tenter de déchiffrer avec key2 (doit échouer)
        let result = crypto::decrypt(&key2, &encrypted);
        assert!(result.is_err(), "Le déchiffrement avec une mauvaise clé doit échouer");
    }
    
    #[test]
    fn test_large_data() {
        // Créer une grande collection
        let mut collection = MemoryCollection::new();
        for i in 0..1000 {
            collection.add(MemoryEntry::new(
                format!("entry_{}", i),
                format!("Contenu de l'entrée numéro {}", i)
            ));
        }
        // Sérialiser
        let json_data = serde_json::to_vec(&collection)
            .expect("Échec de sérialisation");
        let key = crypto::derive_key_from_passphrase("test");
        let encrypted = crypto::encrypt(&key, &json_data)
            .expect("Échec de chiffrement de données volumineuses");
            .expect("Échec de déchiffrement de données volumineuses");
        // Désérialiser
        let restored: MemoryCollection = serde_json::from_slice(&decrypted)
            .expect("Échec de désérialisation");
        assert_eq!(restored.entries.len(), 1000, "Toutes les entrées doivent être restaurées");
    fn test_storage_atomic_write() {
        let test_data = b"Test atomic write";
        // Écrire les données
        storage::save_bytes(TEST_PATH, test_data)
            .expect("Échec de sauvegarde");
        // Vérifier que le fichier existe
        assert!(storage::exists(TEST_PATH), "Le fichier doit exister");
        // Vérifier que le fichier temporaire n'existe pas
        let temp_path = format!("{}.tmp", TEST_PATH);
        assert!(!storage::exists(&temp_path), "Le fichier temporaire ne doit pas exister");
        // Lire les données
        let loaded = storage::load_bytes(TEST_PATH)
            .expect("Échec de chargement");
        assert_eq!(loaded, test_data, "Les données doivent correspondre");
    fn test_checksum_consistency() {
        // Créer deux collections identiques
        let mut collection1 = MemoryCollection::new();
        collection1.add(MemoryEntry::new("id1".to_string(), "content1".to_string()));
        let mut collection2 = MemoryCollection::new();
        collection2.add(MemoryEntry::new("id1".to_string(), "content1".to_string()));
        // Les checksums doivent être identiques
        let checksum1 = calculate_collection_checksum(&collection1)
            .expect("Échec checksum 1");
        let checksum2 = calculate_collection_checksum(&collection2)
            .expect("Échec checksum 2");
        assert_eq!(checksum1, checksum2, "Les checksums de collections identiques doivent correspondre");
        // Modifier une collection
        collection2.add(MemoryEntry::new("id2".to_string(), "content2".to_string()));
        let checksum3 = calculate_collection_checksum(&collection2)
            .expect("Échec checksum 3");
        assert_ne!(checksum1, checksum3, "Les checksums de collections différentes doivent différer");
    fn test_memory_module_init() {
        // Test l'initialisation du module Memory
        let module = MemoryModule::init()
            .expect("Échec d'initialisation du module");
        assert!(module.initialized, "Le module doit être initialisé");
        assert!(module.memory_initialized, "La mémoire doit être initialisée");
        assert_eq!(module.entries_count, 0, "Devrait commencer avec 0 entrées");
    fn test_memory_module_tick() {
        let mut module = MemoryModule::init()
        let before = module.last_update;
        // Attendre un peu
        std::thread::sleep(std::time::Duration::from_millis(10));
        module.tick()
            .expect("Échec du tick");
        assert!(module.last_update > before, "last_update doit être mis à jour");
    fn test_memory_module_health() {
        let health = module.health();
        assert_eq!(health.name, "Memory");
        assert!(matches!(health.status, crate::shared::types::HealthStatus::Healthy));
    fn test_tauri_commands() {
        // Test save_entry
        let result = save_entry(serde_json::json!({
            "test": "data",
            "value": 123
        }).to_string());
        assert!(result.is_ok(), "save_entry doit réussir");
        // Test load_entries
        let loaded = load_entries()
            .expect("load_entries doit réussir");
        assert!(loaded.contains("test"), "Les données chargées doivent contenir 'test'");
        // Test get_memory_state
        let state_json = get_memory_state()
            .expect("get_memory_state doit réussir");
        assert!(state_json.contains("entries_count"), "L'état doit contenir entries_count");
        assert!(state_json.contains("checksum"), "L'état doit contenir checksum");
        // Test clear_memory
        let result = clear_memory();
        assert!(result.is_ok(), "clear_memory doit réussir");
    fn test_error_handling() {
        // Tenter de charger un fichier inexistant
        let result = load_entries_internal();
        assert!(result.is_err(), "Le chargement d'un fichier inexistant doit échouer");
        // Tenter de déchiffrer avec une mauvaise clé
        let invalid_data = b"not encrypted data";
        let result = crypto::decrypt(&key, invalid_data);
        assert!(result.is_err(), "Le déchiffrement de données invalides doit échouer");
    fn test_concurrent_access() {
        use std::sync::{Arc, Mutex};
        use std::thread;
        let success_count = Arc::new(Mutex::new(0));
        let mut handles = vec![];
        // Lancer plusieurs threads qui écrivent simultanément
        for i in 0..10 {
            let success = Arc::clone(&success_count);
            let handle = thread::spawn(move || {
                let entry = MemoryEntry::new(
                    format!("concurrent_{}", i),
                    format!("Thread {}", i)
                );
                
                if save_entry_internal(entry).is_ok() {
                    let mut count = success.lock().unwrap();
                    *count += 1;
                }
            });
            handles.push(handle);
        // Attendre tous les threads
        for handle in handles {
            handle.join().unwrap();
        let final_count = *success_count.lock().unwrap();
        assert!(final_count > 0, "Au moins quelques écritures doivent réussir");
}
