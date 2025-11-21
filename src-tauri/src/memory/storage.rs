// TITANE∞ v12 - Memory Storage
// Encrypted persistent storage for conversations

use super::encryption::MemoryEncryption;
use super::model::{Conversation, ConversationSummary, MemoryIndex};
use super::{MemoryError, MemoryResult};
use std::fs;
use std::path::{Path, PathBuf};

pub struct MemoryStorage {
    storage_dir: PathBuf,
    encryption: MemoryEncryption,
}

impl MemoryStorage {
    pub fn new(storage_dir: PathBuf, password: String) -> MemoryResult<Self> {
        // Create storage directory if it doesn't exist
        if !storage_dir.exists() {
            fs::create_dir_all(&storage_dir)
                .map_err(|e| MemoryError::StorageError(e.to_string()))?;
        }

        Ok(Self {
            storage_dir,
            encryption: MemoryEncryption::new(password),
        })
    }

    fn get_conversation_path(&self, conversation_id: &str) -> PathBuf {
        self.storage_dir
            .join(format!("{}.json.enc", conversation_id))
    }

    fn get_index_path(&self) -> PathBuf {
        self.storage_dir.join("index.json.enc")
    }

    pub fn save_conversation(&self, conversation: &Conversation) -> MemoryResult<()> {
        // Serialize conversation
        let json = serde_json::to_string(conversation)
            .map_err(|e| MemoryError::StorageError(e.to_string()))?;

        // Encrypt
        let encrypted = self.encryption.encrypt(json.as_bytes())?;

        // Write to file
        let path = self.get_conversation_path(&conversation.id);
        fs::write(path, encrypted).map_err(|e| MemoryError::StorageError(e.to_string()))?;

        // Update index
        self.update_index(conversation)?;

        Ok(())
    }

    pub fn load_conversation(&self, conversation_id: &str) -> MemoryResult<Conversation> {
        let path = self.get_conversation_path(conversation_id);

        if !path.exists() {
            return Err(MemoryError::StorageError(format!(
                "Conversation {} not found",
                conversation_id
            )));
        }

        // Read encrypted data
        let encrypted =
            fs::read_to_string(path).map_err(|e| MemoryError::StorageError(e.to_string()))?;

        // Decrypt
        let decrypted = self.encryption.decrypt(&encrypted)?;

        // Deserialize
        let conversation: Conversation = serde_json::from_slice(&decrypted)
            .map_err(|e| MemoryError::InvalidData(e.to_string()))?;

        Ok(conversation)
    }

    pub fn delete_conversation(&self, conversation_id: &str) -> MemoryResult<()> {
        let path = self.get_conversation_path(conversation_id);

        if path.exists() {
            fs::remove_file(path).map_err(|e| MemoryError::StorageError(e.to_string()))?;
        }

        Ok(())
    }

    pub fn list_conversations(&self) -> MemoryResult<Vec<ConversationSummary>> {
        match self.load_index() {
            Ok(index) => Ok(index.conversations),
            Err(_) => Ok(Vec::new()),
        }
    }

    fn load_index(&self) -> MemoryResult<MemoryIndex> {
        let path = self.get_index_path();

        if !path.exists() {
            return Ok(MemoryIndex {
                conversations: Vec::new(),
                total_conversations: 0,
                total_messages: 0,
            });
        }

        let encrypted =
            fs::read_to_string(path).map_err(|e| MemoryError::StorageError(e.to_string()))?;

        let decrypted = self.encryption.decrypt(&encrypted)?;

        let index: MemoryIndex = serde_json::from_slice(&decrypted)
            .map_err(|e| MemoryError::InvalidData(e.to_string()))?;

        Ok(index)
    }

    fn update_index(&self, conversation: &Conversation) -> MemoryResult<()> {
        let mut index = self.load_index().unwrap_or_else(|_| MemoryIndex {
            conversations: Vec::new(),
            total_conversations: 0,
            total_messages: 0,
        });

        // Update or add conversation summary
        let summary = ConversationSummary::from(conversation);
        if let Some(existing) = index
            .conversations
            .iter_mut()
            .find(|s| s.id == conversation.id)
        {
            *existing = summary;
        } else {
            index.conversations.push(summary);
            index.total_conversations += 1;
        }

        // Recalculate totals
        index.total_messages = index
            .conversations
            .iter()
            .map(|c| c.message_count)
            .sum();

        // Serialize and encrypt
        let json =
            serde_json::to_string(&index).map_err(|e| MemoryError::StorageError(e.to_string()))?;

        let encrypted = self.encryption.encrypt(json.as_bytes())?;

        // Write to file
        fs::write(self.get_index_path(), encrypted)
            .map_err(|e| MemoryError::StorageError(e.to_string()))?;

        Ok(())
    }

    pub fn export_conversation(&self, conversation_id: &str) -> MemoryResult<String> {
        let conversation = self.load_conversation(conversation_id)?;
        serde_json::to_string_pretty(&conversation)
            .map_err(|e| MemoryError::StorageError(e.to_string()))
    }

    pub fn clear_all(&self) -> MemoryResult<()> {
        if self.storage_dir.exists() {
            fs::remove_dir_all(&self.storage_dir)
                .map_err(|e| MemoryError::StorageError(e.to_string()))?;
            fs::create_dir_all(&self.storage_dir)
                .map_err(|e| MemoryError::StorageError(e.to_string()))?;
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_storage_creation() {
        let temp_dir = TempDir::new().unwrap();
        let storage = MemoryStorage::new(temp_dir.path().to_path_buf(), "test".to_string());
        assert!(storage.is_ok());
    }

    #[test]
    fn test_save_and_load_conversation() {
        let temp_dir = TempDir::new().unwrap();
        let storage =
            MemoryStorage::new(temp_dir.path().to_path_buf(), "test".to_string()).unwrap();

        let mut conv = Conversation::new("Test".to_string());
        conv.add_entry(
            super::super::MessageRole::User,
            "Hello".to_string(),
            1,
        );

        storage.save_conversation(&conv).unwrap();
        let loaded = storage.load_conversation(&conv.id).unwrap();

        assert_eq!(conv.id, loaded.id);
        assert_eq!(conv.entries.len(), loaded.entries.len());
    }
}
