use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;
use std::time::Duration;

use tokio::sync::{Mutex, RwLock};
use tokio::task::JoinHandle;
use tokio::time;

use crate::memory::model::Conversation;
use crate::memory::storage::{MemoryStorage, MemoryStoragePort};
use crate::memory::{MemoryEntry, MessageRole};
#[cfg(test)]
use crate::memory::{MemoryError, MemoryResult};

use super::errors::ChatEngineError;

/// High-level memory manager with in-memory caching and corruption guards.
pub struct ChatMemoryManager {
    storage: Arc<dyn MemoryStoragePort + Send + Sync>,
    cached: Arc<RwLock<HashMap<String, Conversation>>>, // in-memory cache for fast access
    retention_tokens: usize,
    flush_interval: Duration,
    flush_tasks: Mutex<HashMap<String, JoinHandle<()>>>,
}

impl ChatMemoryManager {
    pub fn new(
        storage: Arc<dyn MemoryStoragePort + Send + Sync>,
        retention_tokens: usize,
        flush_interval: Duration,
    ) -> Self {
        Self {
            storage,
            cached: Arc::new(RwLock::new(HashMap::new())),
            retention_tokens,
            flush_interval,
            flush_tasks: Mutex::new(HashMap::new()),
        }
    }

    pub fn storage(&self) -> Arc<dyn MemoryStoragePort + Send + Sync> {
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

        let conversation = Conversation::new("Session".to_string());
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
        if !cache.contains_key(conversation_id) {
            drop(cache);
            self.load_into_cache(conversation_id).await?;
            cache = self.cached.write().await;
        }

        let conversation = cache
            .get_mut(conversation_id)
            .ok_or_else(|| ChatEngineError::MemoryFailure("Conversation not found".to_string()))?;

        let tokens = estimate_tokens(content.as_str());
        conversation.add_entry(role, content, tokens);
        self.enforce_retention(conversation);

        drop(cache);
        self.schedule_flush(conversation_id.to_string()).await;
        Ok(())
    }

    fn enforce_retention(&self, conversation: &mut Conversation) {
        if conversation.metadata.total_tokens <= self.retention_tokens {
            return;
        }

        let mut accumulated = 0usize;
        let mut keep_from_index = conversation.entries.len();
        for (idx, entry) in conversation.entries.iter().enumerate().rev() {
            let entry_tokens = entry.tokens.max(1);
            if accumulated + entry_tokens > self.retention_tokens {
                break;
            }
            accumulated += entry_tokens;
            keep_from_index = idx;
        }

        if keep_from_index > 0 {
            conversation.entries.drain(0..keep_from_index);
        }

        conversation.metadata.total_tokens =
            conversation.entries.iter().map(|entry| entry.tokens).sum();
        conversation.metadata.message_count = conversation.entries.len();
    }

    async fn schedule_flush(&self, conversation_id: String) {
        let mut tasks = self.flush_tasks.lock().await;
        if let Some(handle) = tasks.get(&conversation_id) {
            if !handle.is_finished() {
                log::debug!("[Memory] flush coalesced: {}", conversation_id);
                return;
            }
        }

        let storage = self.storage.clone();
        let cached = self.cached.clone();
        let delay = self.flush_interval;
        let conversation_id_for_task = conversation_id.clone();
        let handle = tokio::spawn(async move {
            log::debug!("[Memory] flush scheduled: {}", conversation_id_for_task);
            time::sleep(delay).await;

            let snapshot = {
                let guard = cached.read().await;
                guard.get(&conversation_id_for_task).cloned()
            };

            if let Some(conversation) = snapshot {
                if let Err(err) = storage.save_conversation(&conversation) {
                    log::error!(
                        "[Memory] flush persist failed for {}: {}",
                        conversation_id_for_task,
                        err
                    );
                } else {
                    log::debug!("[Memory] flush persisted: {}", conversation_id_for_task);
                }
            }
        });

        tasks.insert(conversation_id, handle);
    }

    pub async fn flush_conversation_now(
        &self,
        conversation_id: &str,
    ) -> Result<(), ChatEngineError> {
        if let Some(handle) = self.flush_tasks.lock().await.remove(conversation_id) {
            handle.abort();
        }

        let snapshot = {
            let guard = self.cached.read().await;
            guard.get(conversation_id).cloned()
        };

        if let Some(conversation) = snapshot {
            self.storage
                .save_conversation(&conversation)
                .map_err(ChatEngineError::from)?;
            log::debug!("[Memory] flush persisted: {}", conversation_id);
        }

        Ok(())
    }

    pub async fn flush_all_now(&self) -> Result<(), ChatEngineError> {
        let ids = {
            let guard = self.cached.read().await;
            guard.keys().cloned().collect::<Vec<_>>()
        };

        for conversation_id in ids {
            self.flush_conversation_now(&conversation_id).await?;
        }

        Ok(())
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
        {
            let mut tasks = self.flush_tasks.lock().await;
            for (_, handle) in tasks.drain() {
                handle.abort();
            }
        }
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
    use std::sync::atomic::{AtomicUsize, Ordering};
    use std::sync::Mutex as StdMutex;
    use tempfile::TempDir;

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

    #[test]
    fn test_enforce_retention_keeps_most_recent_entries() {
        let temp_dir = TempDir::new().expect("create temp dir");
        let storage = Arc::new(
            MemoryStorage::new(temp_dir.path().to_path_buf(), "test-key".to_string())
                .expect("create storage"),
        );
        let manager = ChatMemoryManager::new(storage, 6, Duration::from_millis(50));

        let mut conversation = Conversation::new("Retention test".to_string());
        conversation.add_entry(MessageRole::User, "oldest".to_string(), 2);
        conversation.add_entry(MessageRole::Assistant, "middle".to_string(), 2);
        conversation.add_entry(MessageRole::User, "newer".to_string(), 2);
        conversation.add_entry(MessageRole::Assistant, "newest".to_string(), 2);

        manager.enforce_retention(&mut conversation);

        let kept: Vec<String> = conversation
            .entries
            .iter()
            .map(|entry| entry.content.clone())
            .collect();

        assert_eq!(kept, vec!["middle", "newer", "newest"]);
        assert!(conversation.metadata.total_tokens <= 6);
        assert_eq!(conversation.metadata.message_count, 3);
    }

    #[derive(Default)]
    struct FakeStorage {
        saves: AtomicUsize,
        conversations: StdMutex<HashMap<String, Conversation>>,
    }

    impl FakeStorage {
        fn save_count(&self) -> usize {
            self.saves.load(Ordering::SeqCst)
        }

        fn reset_save_count(&self) {
            self.saves.store(0, Ordering::SeqCst);
        }
    }

    impl MemoryStoragePort for FakeStorage {
        fn save_conversation(&self, conversation: &Conversation) -> MemoryResult<()> {
            self.saves.fetch_add(1, Ordering::SeqCst);
            let mut guard = self
                .conversations
                .lock()
                .map_err(|e| MemoryError::StorageError(e.to_string()))?;
            guard.insert(conversation.id.clone(), conversation.clone());
            Ok(())
        }

        fn load_conversation(&self, conversation_id: &str) -> MemoryResult<Conversation> {
            let guard = self
                .conversations
                .lock()
                .map_err(|e| MemoryError::StorageError(e.to_string()))?;
            guard.get(conversation_id).cloned().ok_or_else(|| {
                MemoryError::StorageError(format!("Conversation {} not found", conversation_id))
            })
        }

        fn delete_conversation(&self, conversation_id: &str) -> MemoryResult<()> {
            let mut guard = self
                .conversations
                .lock()
                .map_err(|e| MemoryError::StorageError(e.to_string()))?;
            guard.remove(conversation_id);
            Ok(())
        }

        fn export_conversation(&self, conversation_id: &str) -> MemoryResult<String> {
            let conversation = self.load_conversation(conversation_id)?;
            serde_json::to_string_pretty(&conversation)
                .map_err(|e| MemoryError::StorageError(e.to_string()))
        }

        fn clear_all(&self) -> MemoryResult<()> {
            let mut guard = self
                .conversations
                .lock()
                .map_err(|e| MemoryError::StorageError(e.to_string()))?;
            guard.clear();
            Ok(())
        }

        fn get_stats(&self) -> MemoryResult<(u64, u64)> {
            let guard = self
                .conversations
                .lock()
                .map_err(|e| MemoryError::StorageError(e.to_string()))?;
            let total_messages = guard.values().map(|c| c.entries.len() as u64).sum::<u64>();
            Ok((guard.len() as u64, total_messages))
        }
    }

    #[tokio::test]
    async fn test_flush_coalescing_strict_with_manual_flush_trigger() {
        let fake = Arc::new(FakeStorage::default());
        let manager = ChatMemoryManager::new(fake.clone(), 200, Duration::from_millis(250));

        let conversation_id = manager
            .ensure_conversation(None)
            .await
            .expect("create conversation");
        fake.reset_save_count();

        manager
            .append_user_entry(&conversation_id, "first".to_string())
            .await
            .expect("append first");
        manager
            .append_assistant_entry(&conversation_id, "second".to_string())
            .await
            .expect("append second");

        assert!(
            fake.save_count() <= 1,
            "coalescing failed before flush trigger: {}",
            fake.save_count()
        );

        manager
            .flush_conversation_now(&conversation_id)
            .await
            .expect("flush now");

        assert_eq!(
            fake.save_count(),
            1,
            "manual flush must produce exactly one persisted save after coalescing"
        );
    }
}
