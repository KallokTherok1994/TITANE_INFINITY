// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.0 — PHASE 1 STABILISATION: MEMORY STORAGE TESTS
//   Tests complets pour memory/storage.rs
//   Pattern moderne: Result<(), Box<dyn Error>> + ? operator
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use crate::memory::model::Conversation;
    use crate::memory::storage::MemoryStorage;
    use crate::memory::MessageRole;
    use std::error::Error;
    use tempfile::TempDir;

    // ═══════════════════════════════════════════════════════════════
    //   HELPERS
    // ═══════════════════════════════════════════════════════════════

    /// Helper: Créer un MemoryStorage de test avec directory temporaire
    fn create_test_storage() -> Result<(MemoryStorage, TempDir), Box<dyn Error>> {
        let temp_dir = TempDir::new()?;
        let storage =
            MemoryStorage::new(temp_dir.path().to_path_buf(), "test_password".to_string())?;
        Ok((storage, temp_dir))
    }

    /// Helper: Créer une conversation de test
    fn create_test_conversation() -> Conversation {
        let mut conv = Conversation::new("Test Conversation".to_string());
        conv.add_entry(MessageRole::User, "Hello".to_string(), 5);
        conv.add_entry(MessageRole::Assistant, "Hi there!".to_string(), 10);
        conv
    }

    // ═══════════════════════════════════════════════════════════════
    //   TESTS UNITAIRES — CRÉATION & INITIALISATION
    // ═══════════════════════════════════════════════════════════════

    #[test]
    fn test_memory_storage_creation() -> Result<(), Box<dyn Error>> {
        // Phase 1 Stabilisation: Test création basique
        let (storage, _temp_dir) = create_test_storage()?;

        assert!(storage.storage_dir().exists());

        Ok(())
    }

    #[test]
    fn test_memory_storage_creates_directory() -> Result<(), Box<dyn Error>> {
        // Phase 1 Stabilisation: Directory créé automatiquement
        let temp_dir = TempDir::new()?;
        let storage_path = temp_dir.path().join("new_storage");

        assert!(!storage_path.exists());

        let _storage = MemoryStorage::new(storage_path.clone(), "password".to_string())?;

        assert!(storage_path.exists());

        Ok(())
    }

    #[test]
    fn test_memory_storage_with_different_passwords() -> Result<(), Box<dyn Error>> {
        // Phase 1 Stabilisation: Différents passwords
        let temp_dir1 = TempDir::new()?;
        let temp_dir2 = TempDir::new()?;

        let _storage1 =
            MemoryStorage::new(temp_dir1.path().to_path_buf(), "password1".to_string())?;

        let _storage2 =
            MemoryStorage::new(temp_dir2.path().to_path_buf(), "password2".to_string())?;

        // Les deux storages doivent être indépendants
        Ok(())
    }

    // ═══════════════════════════════════════════════════════════════
    //   TESTS UNITAIRES — SAVE & LOAD CONVERSATION
    // ═══════════════════════════════════════════════════════════════

    #[test]
    fn test_save_and_load_conversation() -> Result<(), Box<dyn Error>> {
        // Phase 1 Stabilisation: Save puis load
        let (storage, _temp_dir) = create_test_storage()?;
        let conv = create_test_conversation();

        storage.save_conversation(&conv)?;

        let loaded = storage.load_conversation(&conv.id)?;

        assert_eq!(loaded.id, conv.id);
        assert_eq!(loaded.title, conv.title);
        assert_eq!(loaded.entries.len(), conv.entries.len());

        Ok(())
    }

    #[test]
    fn test_load_nonexistent_conversation() -> Result<(), Box<dyn Error>> {
        // Phase 1 Stabilisation: Load conversation inexistante doit échouer proprement
        let (storage, _temp_dir) = create_test_storage()?;

        let result = storage.load_conversation("nonexistent-id");

        assert!(result.is_err());

        Ok(())
    }

    #[test]
    fn test_save_overwrites_existing() -> Result<(), Box<dyn Error>> {
        // Phase 1 Stabilisation: Save overwrite conversation existante
        let (storage, _temp_dir) = create_test_storage()?;
        let mut conv = create_test_conversation();

        storage.save_conversation(&conv)?;

        // Modifier et re-sauvegarder
        conv.add_entry(MessageRole::User, "More content".to_string(), 15);
        storage.save_conversation(&conv)?;

        let loaded = storage.load_conversation(&conv.id)?;
        assert_eq!(loaded.entries.len(), 3);

        Ok(())
    }

    #[test]
    fn test_conversation_encryption() -> Result<(), Box<dyn Error>> {
        // Phase 1 Stabilisation: Vérifier que les données sont chiffrées
        let (storage, temp_dir) = create_test_storage()?;
        let conv = create_test_conversation();

        storage.save_conversation(&conv)?;

        // Lire le fichier brut (chiffré)
        let file_path = temp_dir.path().join(format!("{}.json.enc", conv.id));
        let encrypted_data = std::fs::read_to_string(file_path)?;

        // Ne doit PAS contenir le texte en clair
        assert!(!encrypted_data.contains("Hello"));
        assert!(!encrypted_data.contains("Hi there"));

        Ok(())
    }

    // ═══════════════════════════════════════════════════════════════
    //   TESTS UNITAIRES — DELETE CONVERSATION
    // ═══════════════════════════════════════════════════════════════

    #[test]
    fn test_delete_conversation() -> Result<(), Box<dyn Error>> {
        // Phase 1 Stabilisation: Suppression
        let (storage, _temp_dir) = create_test_storage()?;
        let conv = create_test_conversation();

        storage.save_conversation(&conv)?;
        storage.delete_conversation(&conv.id)?;

        let result = storage.load_conversation(&conv.id);
        assert!(result.is_err());

        Ok(())
    }

    #[test]
    fn test_delete_nonexistent_conversation() -> Result<(), Box<dyn Error>> {
        // Phase 1 Stabilisation: Delete conversation inexistante ne doit pas échouer
        let (storage, _temp_dir) = create_test_storage()?;

        let result = storage.delete_conversation("nonexistent-id");

        // Doit réussir (idempotent)
        assert!(result.is_ok());

        Ok(())
    }

    // ═══════════════════════════════════════════════════════════════
    //   TESTS UNITAIRES — LIST & INDEX
    // ═══════════════════════════════════════════════════════════════

    #[test]
    fn test_list_conversations_empty() -> Result<(), Box<dyn Error>> {
        // Phase 1 Stabilisation: Liste vide au départ
        let (storage, _temp_dir) = create_test_storage()?;

        let list = storage.list_conversations()?;

        assert!(list.is_empty());

        Ok(())
    }

    #[test]
    fn test_list_conversations_after_save() -> Result<(), Box<dyn Error>> {
        // Phase 1 Stabilisation: Liste après save
        let (storage, _temp_dir) = create_test_storage()?;
        let conv = create_test_conversation();

        storage.save_conversation(&conv)?;

        let list = storage.list_conversations()?;

        assert_eq!(list.len(), 1);
        assert_eq!(list[0].id, conv.id);
        assert_eq!(list[0].title, conv.title);

        Ok(())
    }

    #[test]
    fn test_list_multiple_conversations() -> Result<(), Box<dyn Error>> {
        // Phase 1 Stabilisation: Liste multiple conversations
        let (storage, _temp_dir) = create_test_storage()?;

        let conv1 = create_test_conversation();
        let conv2 = create_test_conversation();
        let conv3 = create_test_conversation();

        storage.save_conversation(&conv1)?;
        storage.save_conversation(&conv2)?;
        storage.save_conversation(&conv3)?;

        let list = storage.list_conversations()?;

        assert_eq!(list.len(), 3);

        Ok(())
    }

    #[test]
    fn test_index_updates_after_modification() -> Result<(), Box<dyn Error>> {
        // Phase 1 Stabilisation: Index mis à jour après modification
        let (storage, _temp_dir) = create_test_storage()?;
        let mut conv = create_test_conversation();

        storage.save_conversation(&conv)?;

        // Modifier et re-sauvegarder
        conv.add_entry(MessageRole::User, "New message".to_string(), 20);
        storage.save_conversation(&conv)?;

        let list = storage.list_conversations()?;

        assert_eq!(list.len(), 1);
        assert_eq!(list[0].message_count, 3); // Updated count

        Ok(())
    }

    // ═══════════════════════════════════════════════════════════════
    //   TESTS UNITAIRES — EXPORT
    // ═══════════════════════════════════════════════════════════════

    #[test]
    fn test_export_conversation() -> Result<(), Box<dyn Error>> {
        // Phase 1 Stabilisation: Export JSON
        let (storage, _temp_dir) = create_test_storage()?;
        let conv = create_test_conversation();

        storage.save_conversation(&conv)?;

        let exported = storage.export_conversation(&conv.id)?;

        // Doit être du JSON valide
        assert!(exported.contains(&conv.id));
        assert!(exported.contains("Test Conversation"));

        Ok(())
    }

    #[test]
    fn test_export_nonexistent_conversation() -> Result<(), Box<dyn Error>> {
        // Phase 1 Stabilisation: Export conversation inexistante doit échouer
        let (storage, _temp_dir) = create_test_storage()?;

        let result = storage.export_conversation("nonexistent-id");

        assert!(result.is_err());

        Ok(())
    }

    // ═══════════════════════════════════════════════════════════════
    //   TESTS UNITAIRES — CLEAR ALL
    // ═══════════════════════════════════════════════════════════════

    #[test]
    fn test_clear_all() -> Result<(), Box<dyn Error>> {
        // Phase 1 Stabilisation: Clear all
        let (storage, _temp_dir) = create_test_storage()?;

        let conv1 = create_test_conversation();
        let conv2 = create_test_conversation();

        storage.save_conversation(&conv1)?;
        storage.save_conversation(&conv2)?;

        storage.clear_all()?;

        let list = storage.list_conversations()?;
        assert!(list.is_empty());

        Ok(())
    }

    #[test]
    fn test_clear_all_recreates_directory() -> Result<(), Box<dyn Error>> {
        // Phase 1 Stabilisation: Clear all recrée le directory
        let (storage, _temp_dir) = create_test_storage()?;

        storage.clear_all()?;

        assert!(storage.storage_dir().exists());

        Ok(())
    }

    // ═══════════════════════════════════════════════════════════════
    //   TESTS INTEGRATION — SCÉNARIOS COMPLEXES
    // ═══════════════════════════════════════════════════════════════

    #[test]
    fn test_full_lifecycle() -> Result<(), Box<dyn Error>> {
        // Phase 1 Stabilisation: Lifecycle complet
        let (storage, _temp_dir) = create_test_storage()?;

        // 1. Create and save
        let mut conv = Conversation::new("Lifecycle Test".to_string());
        conv.add_entry(MessageRole::User, "Message 1".to_string(), 10);
        storage.save_conversation(&conv)?;

        // 2. Load and verify
        let loaded = storage.load_conversation(&conv.id)?;
        assert_eq!(loaded.entries.len(), 1);

        // 3. Modify and save
        conv.add_entry(MessageRole::Assistant, "Response 1".to_string(), 15);
        storage.save_conversation(&conv)?;

        // 4. List and verify
        let list = storage.list_conversations()?;
        assert_eq!(list.len(), 1);
        assert_eq!(list[0].message_count, 2);

        // 5. Export
        let exported = storage.export_conversation(&conv.id)?;
        assert!(exported.contains("Lifecycle Test"));

        // 6. Delete
        storage.delete_conversation(&conv.id)?;

        // 7. Verify deleted
        let result = storage.load_conversation(&conv.id);
        assert!(result.is_err());

        Ok(())
    }

    #[test]
    fn test_concurrent_saves() -> Result<(), Box<dyn Error>> {
        // Phase 1 Stabilisation: Sauvegardes séquentielles multiples
        let (storage, _temp_dir) = create_test_storage()?;

        for i in 0..10 {
            let mut conv = Conversation::new(format!("Conversation {}", i));
            conv.add_entry(MessageRole::User, format!("Message {}", i), 10);
            storage.save_conversation(&conv)?;
        }

        let list = storage.list_conversations()?;
        assert_eq!(list.len(), 10);

        Ok(())
    }

    #[test]
    fn test_large_conversation() -> Result<(), Box<dyn Error>> {
        // Phase 1 Stabilisation: Conversation avec beaucoup de messages
        let (storage, _temp_dir) = create_test_storage()?;
        let mut conv = Conversation::new("Large Conversation".to_string());

        for i in 0..100 {
            conv.add_entry(
                if i % 2 == 0 {
                    MessageRole::User
                } else {
                    MessageRole::Assistant
                },
                format!("Message {}", i),
                10,
            );
        }

        storage.save_conversation(&conv)?;

        let loaded = storage.load_conversation(&conv.id)?;
        assert_eq!(loaded.entries.len(), 100);

        Ok(())
    }

    #[test]
    fn test_special_characters_in_conversation() -> Result<(), Box<dyn Error>> {
        // Phase 1 Stabilisation: Caractères spéciaux
        let (storage, _temp_dir) = create_test_storage()?;
        let mut conv = Conversation::new("Spécial Çàrâctêrès 🚀💡".to_string());

        conv.add_entry(
            MessageRole::User,
            "Message with émojis 🎉 and symbols !@#$%".to_string(),
            20,
        );

        storage.save_conversation(&conv)?;

        let loaded = storage.load_conversation(&conv.id)?;
        assert!(loaded.title.contains("Spécial"));
        assert!(loaded.entries[0].content.contains("🎉"));

        Ok(())
    }

    // ═══════════════════════════════════════════════════════════════
    //   TESTS PERFORMANCE (IGNORÉS PAR DÉFAUT)
    // ═══════════════════════════════════════════════════════════════

    #[test]
    #[ignore]
    fn test_performance_100_conversations() -> Result<(), Box<dyn Error>> {
        // Phase 1 Stabilisation: Performance 100 conversations
        let (storage, _temp_dir) = create_test_storage()?;

        let start = std::time::Instant::now();

        for i in 0..100 {
            let mut conv = Conversation::new(format!("Conv {}", i));
            conv.add_entry(MessageRole::User, format!("Message {}", i), 10);
            storage.save_conversation(&conv)?;
        }

        let elapsed = start.elapsed();
        println!("Saved 100 conversations in {:?}", elapsed);

        let list = storage.list_conversations()?;
        assert_eq!(list.len(), 100);

        Ok(())
    }

    #[test]
    #[ignore]
    fn test_memory_stability() -> Result<(), Box<dyn Error>> {
        // Phase 1 Stabilisation: Stabilité mémoire
        let (storage, _temp_dir) = create_test_storage()?;

        for i in 0..50 {
            let mut conv = Conversation::new(format!("Memory test {}", i));
            conv.add_entry(MessageRole::User, "Test".to_string(), 5);
            storage.save_conversation(&conv)?;

            // Load and drop immediately
            let _ = storage.load_conversation(&conv.id)?;
        }

        Ok(())
    }
}
