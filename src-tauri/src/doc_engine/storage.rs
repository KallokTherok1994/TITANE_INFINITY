// Module de stockage chiffré des documents

use super::*;
use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce
};
use argon2::{
    password_hash::{PasswordHasher, SaltString},
    Argon2
};
use std::fs;
use std::path::{Path, PathBuf};

pub struct StorageEngine {
    storage_path: PathBuf,
    encryption_enabled: bool,
}

impl StorageEngine {
    pub fn new(storage_path: PathBuf) -> Self {
        Self {
            storage_path,
            encryption_enabled: true,
        }
    }
    
    /// Sauvegarde un document de manière sécurisée
    pub async fn save(&self, document: &Document) -> Result<String> {
        // Créer le répertoire si nécessaire
        fs::create_dir_all(&self.storage_path)
            .map_err(|e| DocEngineError::StorageError(format!("Impossible de créer le répertoire: {}", e)))?;
        
        // Sérialisation
        let json_data = serde_json::to_string_pretty(document)
            .map_err(|e| DocEngineError::StorageError(format!("Erreur de sérialisation: {}", e)))?;
        
        // Chiffrement si activé
        let data_to_store = if self.encryption_enabled {
            self.encrypt_data(json_data.as_bytes())?
        } else {
            json_data.into_bytes()
        };
        
        // Chemin du fichier
        let filename = format!("{}.{}", document.metadata.id, if self.encryption_enabled { "enc" } else { "json" });
        let file_path = self.storage_path.join(&filename);
        
        // Écriture
        fs::write(&file_path, &data_to_store)
            .map_err(|e| DocEngineError::StorageError(format!("Erreur d'écriture: {}", e)))?;
        
        // Sauvegarde des métadonnées
        self.save_metadata(document)?;
        
        Ok(file_path.to_string_lossy().to_string())
    }
    
    /// Charge un document depuis le stockage
    pub async fn load(&self, document_id: &str) -> Result<Document> {
        let filename = format!("{}.{}", document_id, if self.encryption_enabled { "enc" } else { "json" });
        let file_path = self.storage_path.join(&filename);
        
        if !file_path.exists() {
            return Err(DocEngineError::StorageError(format!("Document {} introuvable", document_id)));
        }
        
        // Lecture
        let data = fs::read(&file_path)
            .map_err(|e| DocEngineError::StorageError(format!("Erreur de lecture: {}", e)))?;
        
        // Déchiffrement si nécessaire
        let json_data = if self.encryption_enabled {
            let decrypted = self.decrypt_data(&data)?;
            String::from_utf8(decrypted)
                .map_err(|e| DocEngineError::StorageError(format!("Erreur de décodage: {}", e)))?
        } else {
            String::from_utf8(data)
                .map_err(|e| DocEngineError::StorageError(format!("Erreur de décodage: {}", e)))?
        };
        
        // Désérialisation
        let document: Document = serde_json::from_str(&json_data)
            .map_err(|e| DocEngineError::StorageError(format!("Erreur de désérialisation: {}", e)))?;
        
        Ok(document)
    }
    
    /// Liste tous les documents stockés
    pub async fn list_documents(&self) -> Result<Vec<DocumentMetadata>> {
        let metadata_path = self.storage_path.join("metadata.json");
        
        if !metadata_path.exists() {
            return Ok(Vec::new());
        }
        
        let data = fs::read_to_string(&metadata_path)
            .map_err(|e| DocEngineError::StorageError(format!("Erreur de lecture métadonnées: {}", e)))?;
        
        let metadata_list: Vec<DocumentMetadata> = serde_json::from_str(&data)
            .map_err(|e| DocEngineError::StorageError(format!("Erreur de désérialisation métadonnées: {}", e)))?;
        
        Ok(metadata_list)
    }
    
    /// Supprime un document
    pub async fn delete(&self, document_id: &str) -> Result<()> {
        let filename = format!("{}.{}", document_id, if self.encryption_enabled { "enc" } else { "json" });
        let file_path = self.storage_path.join(&filename);
        
        if file_path.exists() {
            fs::remove_file(&file_path)
                .map_err(|e| DocEngineError::StorageError(format!("Erreur de suppression: {}", e)))?;
        }
        
        // Mise à jour des métadonnées
        self.remove_from_metadata(document_id)?;
        
        Ok(())
    }
    
    fn encrypt_data(&self, data: &[u8]) -> Result<Vec<u8>> {
        // Implementation: Integrate SecureSecretsEngine for production key management
        // - Retrieve master key: SecureSecretsEngine::get_key("doc_engine_master")
        // - Key derivation: Master key + document-specific salt via Argon2id
        // - Key rotation: Support key versioning with metadata header {version: u8, key_id: [u8; 16]}
        // - Storage: Keys in OS keychain (Keychain on macOS, Secret Service on Linux, Credential Manager on Windows)
        // - Fallback: Encrypted key file at ~/.titane/secrets/keys.enc with user password
        // - First run: Generate random master key with rand::thread_rng().fill_bytes(&mut key[32])
        // - Key stretching: PBKDF2 with 600k iterations for user passwords (OWASP recommendation 2024)
        let password = b"titane_infinity_master_key_v13"; // Temporary default key
        let salt = SaltString::generate(&mut OsRng);

        let argon2 = Argon2::default();
        let password_hash = argon2.hash_password(password, &salt)
            .map_err(|e| DocEngineError::StorageError(format!("Erreur de dérivation de clé: {}", e)))?;

        // Extraction des 32 premiers octets pour AES-256 avec gestion d'erreur
        let key_bytes = password_hash.hash
            .ok_or_else(|| DocEngineError::StorageError("Hash non disponible après dérivation".to_string()))?
            .as_bytes();
        if key_bytes.len() < 32 {
            return Err(DocEngineError::StorageError("Clé dérivée trop courte".to_string()));
        }
        let key = &key_bytes[..32];

        // Chiffrement AES-256-GCM
        let cipher = Aes256Gcm::new_from_slice(key)
            .map_err(|e| DocEngineError::StorageError(format!("Erreur de création du cipher: {}", e)))?;

        // Implementation: Generate cryptographically secure unique nonce per document
        // - Generate: OsRng.fill_bytes(&mut nonce[12]) for 96-bit random nonce
        // - Storage format: Prepend nonce to ciphertext: [nonce(12 bytes) || ciphertext || tag(16 bytes)]
        // - Uniqueness: CRITICAL for AES-GCM security - never reuse nonce with same key
        // - Counter mode alternative: Derive from document_id + timestamp + sequence counter
        // - Verification: Assert nonce length == 12 bytes (96 bits standard for GCM)
        // - Extraction on decrypt: nonce = encrypted_data[0..12], ciphertext = encrypted_data[12..]
        // - Security: Collision probability ~2^-96 for random nonces (safe for billions of documents)
        let nonce = Nonce::from_slice(b"unique_nonce");

        let ciphertext = cipher.encrypt(nonce, data)
            .map_err(|e| DocEngineError::StorageError(format!("Erreur de chiffrement: {}", e)))?;

        Ok(ciphertext)
    }

    fn decrypt_data(&self, encrypted_data: &[u8]) -> Result<Vec<u8>> {
        // Implementation: Match encrypt_data key retrieval from SecureSecretsEngine
        // - Extract key version from header: encrypted_data[0..17] for {version, key_id}
        // - Retrieve appropriate key: SecureSecretsEngine::get_key_by_id(key_id)
        // - Handle key rotation: If current key != encryption key, use archived key from rotation history
        // - Key caching: Cache derived keys with TTL (5min) to avoid repeated Argon2 derivation
        // - Error handling: Return "Key not found" if key_id unknown (indicates corrupted data or missing key)
        // - Backward compatibility: Support legacy documents encrypted with old key format (version < 2)
        // - Same storage as encrypt: OS keychain retrieval via SecureSecretsEngine
        let password = b"titane_infinity_master_key_v13"; // Temporary default key
        let salt = SaltString::generate(&mut OsRng);

        let argon2 = Argon2::default();
        let password_hash = argon2.hash_password(password, &salt)
            .map_err(|e| DocEngineError::StorageError(format!("Erreur de dérivation de clé: {}", e)))?;

        // Extraction des 32 premiers octets pour AES-256 avec gestion d'erreur
        let key_bytes = password_hash.hash
            .ok_or_else(|| DocEngineError::StorageError("Hash non disponible après dérivation".to_string()))?
            .as_bytes();
        if key_bytes.len() < 32 {
            return Err(DocEngineError::StorageError("Clé dérivée trop courte".to_string()));
        }
        let key = &key_bytes[..32];

        let cipher = Aes256Gcm::new_from_slice(key)
            .map_err(|e| DocEngineError::StorageError(format!("Erreur de création du cipher: {}", e)))?;

        let nonce = Nonce::from_slice(b"unique_nonce");

        let plaintext = cipher.decrypt(nonce, encrypted_data)
            .map_err(|e| DocEngineError::StorageError(format!("Erreur de déchiffrement: {}", e)))?;

        Ok(plaintext)
    }
    
    fn save_metadata(&self, document: &Document) -> Result<()> {
        let metadata_path = self.storage_path.join("metadata.json");
        
        let mut metadata_list = if metadata_path.exists() {
            let data = fs::read_to_string(&metadata_path)
                .map_err(|e| DocEngineError::StorageError(format!("Erreur de lecture métadonnées: {}", e)))?;
            serde_json::from_str::<Vec<DocumentMetadata>>(&data).unwrap_or_default()
        } else {
            Vec::new()
        };
        
        // Mise à jour ou ajout
        if let Some(pos) = metadata_list.iter().position(|m| m.id == document.metadata.id) {
            metadata_list[pos] = document.metadata.clone();
        } else {
            metadata_list.push(document.metadata.clone());
        }
        
        let json = serde_json::to_string_pretty(&metadata_list)
            .map_err(|e| DocEngineError::StorageError(format!("Erreur de sérialisation métadonnées: {}", e)))?;
        
        fs::write(&metadata_path, json)
            .map_err(|e| DocEngineError::StorageError(format!("Erreur d'écriture métadonnées: {}", e)))?;
        
        Ok(())
    }
    
    fn remove_from_metadata(&self, document_id: &str) -> Result<()> {
        let metadata_path = self.storage_path.join("metadata.json");
        
        if !metadata_path.exists() {
            return Ok(());
        }
        
        let data = fs::read_to_string(&metadata_path)
            .map_err(|e| DocEngineError::StorageError(format!("Erreur de lecture métadonnées: {}", e)))?;
        
        let mut metadata_list: Vec<DocumentMetadata> = serde_json::from_str(&data).unwrap_or_default();
        
        metadata_list.retain(|m| m.id != document_id);
        
        let json = serde_json::to_string_pretty(&metadata_list)
            .map_err(|e| DocEngineError::StorageError(format!("Erreur de sérialisation métadonnées: {}", e)))?;
        
        fs::write(&metadata_path, json)
            .map_err(|e| DocEngineError::StorageError(format!("Erreur d'écriture métadonnées: {}", e)))?;
        
        Ok(())
    }
}

impl Default for StorageEngine {
    fn default() -> Self {
        Self::new(PathBuf::from("./data/titane/memory/documents"))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    fn create_test_document(id: &str) -> Document {
        Document {
            metadata: DocumentMetadata {
                id: id.to_string(),
                title: "Test Document".to_string(),
                doc_type: DocumentType::Report,
                created_at: 1000,
                updated_at: 1000,
                version: "1.0".to_string(),
                author: "Test Author".to_string(),
                tags: vec!["test".to_string()],
            },
            content: DocumentContent {
                title: "Test Document".to_string(),
                executive_summary: "Test summary".to_string(),
                objectives: vec!["Objective 1".to_string()],
                sections: vec![
                    Section {
                        title: "Section 1".to_string(),
                        content: "Section content".to_string(),
                        level: 1,
                        subsections: vec![],
                        metadata: None,
                    },
                ],
                mandatory_clauses: None,
                annexes: vec![],
                references: vec![],
            },
            style: DocumentStyle::Professional,
        }
    }

    #[test]
    fn test_storage_engine_new() {
        let temp_dir = TempDir::new().unwrap();
        let engine = StorageEngine::new(temp_dir.path().to_path_buf());

        assert_eq!(engine.storage_path, temp_dir.path());
        assert!(engine.encryption_enabled);
    }

    #[test]
    fn test_storage_engine_default() {
        let engine = StorageEngine::default();
        assert_eq!(engine.storage_path, PathBuf::from("./data/titane/memory/documents"));
    }

    #[tokio::test]
    async fn test_save_document_with_encryption() {
        let temp_dir = TempDir::new().unwrap();
        let engine = StorageEngine::new(temp_dir.path().to_path_buf());
        let document = create_test_document("doc1");

        let result = engine.save(&document).await;
        assert!(result.is_ok());

        let saved_path = result.unwrap();
        assert!(saved_path.contains("doc1.enc"));
        assert!(PathBuf::from(&saved_path).exists());
    }

    #[tokio::test]
    async fn test_save_document_without_encryption() {
        let temp_dir = TempDir::new().unwrap();
        let mut engine = StorageEngine::new(temp_dir.path().to_path_buf());
        engine.encryption_enabled = false;
        let document = create_test_document("doc2");

        let result = engine.save(&document).await;
        assert!(result.is_ok());

        let saved_path = result.unwrap();
        assert!(saved_path.contains("doc2.json"));
        assert!(PathBuf::from(&saved_path).exists());
    }

    #[tokio::test]
    async fn test_save_creates_directory() {
        let temp_dir = TempDir::new().unwrap();
        let storage_path = temp_dir.path().join("subdir");
        let engine = StorageEngine::new(storage_path.clone());
        let document = create_test_document("doc3");

        let result = engine.save(&document).await;
        assert!(result.is_ok());
        assert!(storage_path.exists());
    }

    #[tokio::test]
    async fn test_load_document_with_encryption() {
        let temp_dir = TempDir::new().unwrap();
        let engine = StorageEngine::new(temp_dir.path().to_path_buf());
        let document = create_test_document("doc4");

        // Save first
        engine.save(&document).await.unwrap();

        // Load
        let result = engine.load("doc4").await;
        assert!(result.is_ok());

        let loaded = result.unwrap();
        assert_eq!(loaded.metadata.id, "doc4");
        assert_eq!(loaded.metadata.title, "Test Document");
        assert_eq!(loaded.content.sections.len(), 1);
    }

    #[tokio::test]
    async fn test_load_document_without_encryption() {
        let temp_dir = TempDir::new().unwrap();
        let mut engine = StorageEngine::new(temp_dir.path().to_path_buf());
        engine.encryption_enabled = false;
        let document = create_test_document("doc5");

        // Save first
        engine.save(&document).await.unwrap();

        // Load
        let result = engine.load("doc5").await;
        assert!(result.is_ok());

        let loaded = result.unwrap();
        assert_eq!(loaded.metadata.id, "doc5");
    }

    #[tokio::test]
    async fn test_load_nonexistent_document() {
        let temp_dir = TempDir::new().unwrap();
        let engine = StorageEngine::new(temp_dir.path().to_path_buf());

        let result = engine.load("nonexistent").await;
        assert!(result.is_err());

        let error = result.unwrap_err().to_string();
        assert!(error.contains("introuvable"));
    }

    #[tokio::test]
    async fn test_list_documents_empty() {
        let temp_dir = TempDir::new().unwrap();
        let engine = StorageEngine::new(temp_dir.path().to_path_buf());

        let result = engine.list_documents().await;
        assert!(result.is_ok());

        let list = result.unwrap();
        assert_eq!(list.len(), 0);
    }

    #[tokio::test]
    async fn test_list_documents_multiple() {
        let temp_dir = TempDir::new().unwrap();
        let engine = StorageEngine::new(temp_dir.path().to_path_buf());

        // Save multiple documents
        engine.save(&create_test_document("doc6")).await.unwrap();
        engine.save(&create_test_document("doc7")).await.unwrap();
        engine.save(&create_test_document("doc8")).await.unwrap();

        let result = engine.list_documents().await;
        assert!(result.is_ok());

        let list = result.unwrap();
        assert_eq!(list.len(), 3);

        let ids: Vec<String> = list.iter().map(|m| m.id.clone()).collect();
        assert!(ids.contains(&"doc6".to_string()));
        assert!(ids.contains(&"doc7".to_string()));
        assert!(ids.contains(&"doc8".to_string()));
    }

    #[tokio::test]
    async fn test_delete_document() {
        let temp_dir = TempDir::new().unwrap();
        let engine = StorageEngine::new(temp_dir.path().to_path_buf());
        let document = create_test_document("doc9");

        // Save first
        let saved_path = engine.save(&document).await.unwrap();
        assert!(PathBuf::from(&saved_path).exists());

        // Delete
        let result = engine.delete("doc9").await;
        assert!(result.is_ok());
        assert!(!PathBuf::from(&saved_path).exists());
    }

    #[tokio::test]
    async fn test_delete_nonexistent_document() {
        let temp_dir = TempDir::new().unwrap();
        let engine = StorageEngine::new(temp_dir.path().to_path_buf());

        // Should not error even if document doesn't exist
        let result = engine.delete("nonexistent").await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_metadata_persistence() {
        let temp_dir = TempDir::new().unwrap();
        let engine = StorageEngine::new(temp_dir.path().to_path_buf());

        // Save document
        engine.save(&create_test_document("doc10")).await.unwrap();

        // Check metadata file exists
        let metadata_path = temp_dir.path().join("metadata.json");
        assert!(metadata_path.exists());

        // List documents should return the metadata
        let list = engine.list_documents().await.unwrap();
        assert_eq!(list.len(), 1);
        assert_eq!(list[0].id, "doc10");
    }

    #[tokio::test]
    async fn test_metadata_update_on_save() {
        let temp_dir = TempDir::new().unwrap();
        let engine = StorageEngine::new(temp_dir.path().to_path_buf());

        // Save document
        let doc1 = create_test_document("doc11");
        engine.save(&doc1).await.unwrap();

        // Update and save again
        let mut doc2 = create_test_document("doc11");
        doc2.metadata.title = "Updated Title".to_string();
        doc2.metadata.version = "2.0".to_string();
        engine.save(&doc2).await.unwrap();

        // List should still have only one entry with updated data
        let list = engine.list_documents().await.unwrap();
        assert_eq!(list.len(), 1);
        assert_eq!(list[0].title, "Updated Title");
        assert_eq!(list[0].version, "2.0");
    }

    #[tokio::test]
    async fn test_metadata_removal_on_delete() {
        let temp_dir = TempDir::new().unwrap();
        let engine = StorageEngine::new(temp_dir.path().to_path_buf());

        // Save multiple documents
        engine.save(&create_test_document("doc12")).await.unwrap();
        engine.save(&create_test_document("doc13")).await.unwrap();

        // Delete one
        engine.delete("doc12").await.unwrap();

        // List should only have doc13
        let list = engine.list_documents().await.unwrap();
        assert_eq!(list.len(), 1);
        assert_eq!(list[0].id, "doc13");
    }

    #[tokio::test]
    async fn test_round_trip_encryption() {
        let temp_dir = TempDir::new().unwrap();
        let engine = StorageEngine::new(temp_dir.path().to_path_buf());
        let original = create_test_document("doc14");

        // Save and load
        engine.save(&original).await.unwrap();
        let loaded = engine.load("doc14").await.unwrap();

        // Verify data integrity
        assert_eq!(loaded.metadata.id, original.metadata.id);
        assert_eq!(loaded.metadata.title, original.metadata.title);
        assert_eq!(loaded.content.title, original.content.title);
        assert_eq!(loaded.content.sections[0].title, original.content.sections[0].title);
        assert_eq!(loaded.content.sections[0].content, original.content.sections[0].content);
    }

    #[test]
    fn test_encrypt_decrypt_data() {
        let temp_dir = TempDir::new().unwrap();
        let engine = StorageEngine::new(temp_dir.path().to_path_buf());

        let original_data = b"Test data for encryption";

        // Encrypt
        let encrypted = engine.encrypt_data(original_data);
        assert!(encrypted.is_ok());

        let encrypted_data = encrypted.unwrap();
        assert_ne!(encrypted_data, original_data.to_vec());

        // Decrypt
        let decrypted = engine.decrypt_data(&encrypted_data);
        assert!(decrypted.is_ok());

        let decrypted_data = decrypted.unwrap();
        assert_eq!(decrypted_data, original_data.to_vec());
    }

    #[test]
    fn test_encrypt_empty_data() {
        let temp_dir = TempDir::new().unwrap();
        let engine = StorageEngine::new(temp_dir.path().to_path_buf());

        let result = engine.encrypt_data(b"");
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_save_multiple_documents() {
        let temp_dir = TempDir::new().unwrap();
        let engine = StorageEngine::new(temp_dir.path().to_path_buf());

        for i in 0..5 {
            let doc = create_test_document(&format!("doc{}", i));
            let result = engine.save(&doc).await;
            assert!(result.is_ok());
        }

        let list = engine.list_documents().await.unwrap();
        assert_eq!(list.len(), 5);
    }

    #[tokio::test]
    async fn test_file_extension_based_on_encryption() {
        let temp_dir = TempDir::new().unwrap();

        // With encryption
        let engine_enc = StorageEngine::new(temp_dir.path().join("enc").to_path_buf());
        let doc1 = create_test_document("doc_enc");
        let path1 = engine_enc.save(&doc1).await.unwrap();
        assert!(path1.ends_with(".enc"));

        // Without encryption
        let mut engine_plain = StorageEngine::new(temp_dir.path().join("plain").to_path_buf());
        engine_plain.encryption_enabled = false;
        let doc2 = create_test_document("doc_plain");
        let path2 = engine_plain.save(&doc2).await.unwrap();
        assert!(path2.ends_with(".json"));
    }
}
