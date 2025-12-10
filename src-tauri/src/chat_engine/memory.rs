use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;

use tokio::sync::RwLock;

use crate::memory::model::Conversation;
use crate::memory::storage::MemoryStorage;
use crate::memory::{MemoryEntry, MessageRole};

use super::errors::ChatEngineError;

/// High-level memory manager with in-memory caching and corruption guards.
pub struct ChatMemoryManager {
    storage: Arc<MemoryStorage>,
    cached: RwLock<HashMap<String, Conversation>>, // in-memory cache for fast access
    retention_tokens: usize,
}

impl ChatMemoryManager {
    pub fn new(storage: Arc<MemoryStorage>, retention_tokens: usize) -> Self {
        Self {
            storage,
            cached: RwLock::new(HashMap::new()),
            retention_tokens,
        }
    }

    pub fn storage(&self) -> Arc<MemoryStorage> {
        self.storage.clone()
    }

    /// Ensure we have a conversation ready. When `conversation_id` is None,
    /// a new conversation is created and persisted immediately.
    pub async fn ensure_conversation(
        &self,
        conversation_id: Option<String>,
    ) -> Result<String, ChatEngineError> {
        if let Some(id) = conversation_id {
            self.load_into_cache(&id).await?;
            return Ok(id);
        }

        let mut conversation = Conversation::new("Session".to_string());
        let id = conversation.id.clone();
        self.storage
            .save_conversation(&conversation)
            .map_err(ChatEngineError::from)?;

        let mut cache = self.cached.write().await;
        cache.insert(id.clone(), conversation);

        Ok(id)
    }

    /// Append a new user entry while enforcing the retention limit.
    pub async fn append_user_entry(
        &self,
        conversation_id: &str,
        content: String,
    ) -> Result<(), ChatEngineError> {
        self.append_entry(conversation_id, MessageRole::User, content)
            .await
    }

    /// Append a new assistant entry while enforcing the retention limit.
    pub async fn append_assistant_entry(
        &self,
        conversation_id: &str,
        content: String,
    ) -> Result<(), ChatEngineError> {
        self.append_entry(conversation_id, MessageRole::Assistant, content)
            .await
    }

    async fn append_entry(
        &self,
        conversation_id: &str,
        role: MessageRole,
        content: String,
    ) -> Result<(), ChatEngineError> {
        let mut cache = self.cached.write().await;
        let conversation = if let Some(conv) = cache.get_mut(conversation_id) {
            conv
        } else {
            drop(cache); // release lock before loading
            self.load_into_cache(conversation_id).await?;
            let mut cache = self.cached.write().await;
            cache
                .get_mut(conversation_id)
                .expect("conversation cached after load")
        };

        let tokens = estimate_tokens(content.as_str());
        conversation.add_entry(role, content, tokens);
        self.enforce_retention(conversation);

        self.storage
            .save_conversation(conversation)
            .map_err(ChatEngineError::from)?;
        Ok(())
    }

    fn enforce_retention(&self, conversation: &mut Conversation) {
        if conversation.metadata.total_tokens <= self.retention_tokens {
            return;
        }

        let mut accumulated = 0usize;
        conversation.entries.retain(|entry| {
            accumulated += entry.tokens.max(1);
            accumulated <= self.retention_tokens
        });

        conversation.metadata.total_tokens =
            conversation.entries.iter().map(|entry| entry.tokens).sum();
        conversation.metadata.message_count = conversation.entries.len();
    }

    async fn load_into_cache(&self, conversation_id: &str) -> Result<(), ChatEngineError> {
        // Fast path: already cached
        if self.cached.read().await.contains_key(conversation_id) {
            return Ok(());
        }

        match self.storage.load_conversation(conversation_id) {
            Ok(conversation) => {
                let mut cache = self.cached.write().await;
                cache.insert(conversation_id.to_string(), conversation);
                Ok(())
            }
            Err(err) => {
                // Attempt auto-repair by resetting corrupted file
                log::warn!(
                    "[Memory] Failed to load conversation {}: {}. Attempting auto-repair",
                    conversation_id,
                    err
                );
                self.handle_corruption(conversation_id).await
            }
        }
    }

    async fn handle_corruption(&self, conversation_id: &str) -> Result<(), ChatEngineError> {
        // Delete corrupted file and insert empty conversation placeholder
        self.storage
            .delete_conversation(conversation_id)
            .map_err(ChatEngineError::from)?;

        let mut conversation = Conversation::new("Recovered session".to_string());
        conversation.id = conversation_id.to_string();
        self.storage
            .save_conversation(&conversation)
            .map_err(ChatEngineError::from)?;

        let mut cache = self.cached.write().await;
        cache.insert(conversation_id.to_string(), conversation);

        Ok(())
    }

    pub async fn context_window(
        &self,
        conversation_id: &str,
        max_tokens: usize,
    ) -> Result<Vec<MemoryEntry>, ChatEngineError> {
        self.load_into_cache(conversation_id).await?;
        let cache = self.cached.read().await;
        let conversation = cache
            .get(conversation_id)
            .ok_or_else(|| ChatEngineError::MemoryFailure("Conversation not found".to_string()))?;

        let context = conversation.get_context(max_tokens);
        Ok(context.into_iter().cloned().collect())
    }

    pub async fn reset_all(&self) -> Result<(), ChatEngineError> {
        self.storage
            .clone()
            .clear_all()
            .map_err(ChatEngineError::from)?;
        let mut cache = self.cached.write().await;
        cache.clear();
        Ok(())
    }

    pub async fn stats(&self) -> Result<(usize, usize), ChatEngineError> {
        let (conversations, messages) = self.storage.get_stats().map_err(ChatEngineError::from)?;
        Ok((conversations as usize, messages as usize))
    }

    pub async fn get_conversation(
        &self,
        conversation_id: &str,
    ) -> Result<Conversation, ChatEngineError> {
        self.load_into_cache(conversation_id).await?;
        let cache = self.cached.read().await;
        cache
            .get(conversation_id)
            .cloned()
            .ok_or_else(|| ChatEngineError::MemoryFailure("Conversation not found".to_string()))
    }

    pub async fn export_conversation_json(
        &self,
        conversation_id: &str,
    ) -> Result<String, ChatEngineError> {
        let json = self
            .storage
            .export_conversation(conversation_id)
            .map_err(ChatEngineError::from)?;
        Ok(json)
    }
}

pub fn create_storage(
    base_dir: PathBuf,
    password: String,
) -> Result<Arc<MemoryStorage>, ChatEngineError> {
    let storage = MemoryStorage::new(base_dir, password).map_err(ChatEngineError::from)?;
    Ok(Arc::new(storage))
}

fn estimate_tokens(content: &str) -> usize {
    let ascii_tokens = content.len() / 4;
    let whitespace_tokens = content.split_whitespace().count();
    ascii_tokens.max(whitespace_tokens).max(1)
}

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // estimate_tokens Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_estimate_tokens_short_string() {
        let tokens = estimate_tokens("hello world");
        assert!(tokens >= 1);
    }

    #[test]
    fn test_estimate_tokens_empty_string() {
        let tokens = estimate_tokens("");
        assert_eq!(tokens, 1); // Minimum is 1
    }

    #[test]
    fn test_estimate_tokens_single_word() {
        let tokens = estimate_tokens("hello");
        assert!(tokens >= 1);
    }

    #[test]
    fn test_estimate_tokens_long_string() {
        let content = "a".repeat(1000);
        let tokens = estimate_tokens(&content);
        assert!(tokens >= 250); // 1000/4 = 250
    }

    #[test]
    fn test_estimate_tokens_many_words() {
        let content = "word ".repeat(100);
        let tokens = estimate_tokens(&content);
        assert!(tokens >= 100); // At least 100 words
    }

    #[test]
    fn test_estimate_tokens_whitespace_only() {
        let tokens = estimate_tokens("     ");
        assert!(tokens >= 1);
    }

    #[test]
    fn test_estimate_tokens_newlines() {
        let content = "line1\nline2\nline3";
        let tokens = estimate_tokens(content);
        assert!(tokens >= 3);
    }

    #[test]
    fn test_estimate_tokens_unicode() {
        let content = "héllo мир 世界";
        let tokens = estimate_tokens(content);
        assert!(tokens >= 1);
    }

    #[test]
    fn test_estimate_tokens_tabs() {
        let content = "word1\tword2\tword3";
        let tokens = estimate_tokens(content);
        assert!(tokens >= 3);
    }

    #[test]
    fn test_estimate_tokens_returns_max() {
        // Test that max is taken between ascii_tokens and whitespace_tokens
        let short_many_words = "a b c d e f g h i j"; // 10 words, ~5 ascii tokens
        let tokens = estimate_tokens(short_many_words);
        assert!(tokens >= 10); // Should be 10 (more words than ascii tokens)
    }
}
