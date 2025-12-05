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
        // Génération d'une clé à partir d'un master password (devrait être fourni par l'utilisateur)
        let password = b"titane_infinity_master_key_v13"; // TODO: Utiliser une vraie clé utilisateur
        let salt = SaltString::generate(&mut OsRng);
        
        let argon2 = Argon2::default();
        let password_hash = argon2.hash_password(password, &salt)
            .map_err(|e| DocEngineError::StorageError(format!("Erreur de dérivation de clé: {}", e)))?;
        
        // Extraction des 32 premiers octets pour AES-256
        let key_bytes = password_hash.hash.unwrap().as_bytes();
        let key = &key_bytes[..32];
        
        // Chiffrement AES-256-GCM
        let cipher = Aes256Gcm::new_from_slice(key)
            .map_err(|e| DocEngineError::StorageError(format!("Erreur de création du cipher: {}", e)))?;
        
        let nonce = Nonce::from_slice(b"unique_nonce"); // TODO: Générer un nonce unique par document
        
        let ciphertext = cipher.encrypt(nonce, data)
            .map_err(|e| DocEngineError::StorageError(format!("Erreur de chiffrement: {}", e)))?;
        
        Ok(ciphertext)
    }
    
    fn decrypt_data(&self, encrypted_data: &[u8]) -> Result<Vec<u8>> {
        let password = b"titane_infinity_master_key_v13";
        let salt = SaltString::generate(&mut OsRng);
        
        let argon2 = Argon2::default();
        let password_hash = argon2.hash_password(password, &salt)
            .map_err(|e| DocEngineError::StorageError(format!("Erreur de dérivation de clé: {}", e)))?;
        
        let key_bytes = password_hash.hash.unwrap().as_bytes();
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
