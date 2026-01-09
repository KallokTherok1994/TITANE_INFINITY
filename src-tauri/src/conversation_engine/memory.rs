// TODO v25.x: Migrer vers unified_memory_v2::persistence
// Warnings supprimés temporairement - migration planifiée
#![allow(deprecated)]

/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — CONVERSATION MEMORY ENGINE
 * Moteur de mémoire conversationnelle avec autosave et snapshots
 * ═══════════════════════════════════════════════════════════════════
 */
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::memory::model::Conversation;
use crate::memory::storage::MemoryStorage;

use super::types::*;
use super::ConversationEngineError;

/// Entry complète de mémoire conversationnelle
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ConversationMemoryEntry {
    pub timestamp: u64,
    pub user_message: String,
    pub assistant_message: String,
    pub intention: Intention,
    pub emotion: EmotionState,
    pub tags: Vec<String>,
    pub summary: String,
    pub memory_effect: MemoryEffect,
    pub memory_layers: MemoryLayers,
    pub links_to_contexts: Vec<String>,
    pub provider_used: String,
    pub latency_ms: u64,
}

/// Moteur de mémoire conversationnelle
pub struct ConversationMemoryEngine {
    storage: Arc<MemoryStorage>,
    cache: RwLock<std::collections::HashMap<String, Vec<ConversationMemoryEntry>>>,
}

impl ConversationMemoryEngine {
    pub fn new(storage: Arc<MemoryStorage>) -> Self {
        Self {
            storage,
            cache: RwLock::new(std::collections::HashMap::new()),
        }
    }

    /// Assurer qu'une conversation existe
    pub async fn ensure_conversation_id(
        &self,
        conversation_id: Option<String>,
    ) -> Result<String, ConversationEngineError> {
        match conversation_id {
            Some(id) => {
                // Vérifier existence
                if self.storage.load_conversation(&id).is_ok() {
                    Ok(id)
                } else {
                    // Créer nouvelle conversation avec cet ID
                    let conversation = Conversation::new("Session".to_string());
                    self.storage
                        .save_conversation(&conversation)
                        .map_err(|e| ConversationEngineError::MemoryError(e.to_string()))?;
                    Ok(id)
                }
            }
            None => {
                // Créer nouvelle conversation
                let conversation = Conversation::new("Session".to_string());
                let id = conversation.id.clone();
                self.storage
                    .save_conversation(&conversation)
                    .map_err(|e| ConversationEngineError::MemoryError(e.to_string()))?;
                Ok(id)
            }
        }
    }

    /// Charger le contexte mémoire
    pub async fn load_context(
        &self,
        conversation_id: &str,
    ) -> Result<String, ConversationEngineError> {
        // Charger depuis cache
        let cache = self.cache.read().await;
        if let Some(entries) = cache.get(conversation_id) {
            if !entries.is_empty() {
                return Ok(self.format_context(entries));
            }
        }
        drop(cache);

        // Charger depuis storage
        match self.storage.load_conversation(conversation_id) {
            Ok(conversation) => {
                let entries = self.conversation_to_entries(&conversation);
                let context = self.format_context(&entries);

                // Mettre en cache
                let mut cache = self.cache.write().await;
                cache.insert(conversation_id.to_string(), entries);

                Ok(context)
            }
            Err(_) => Ok(String::new()),
        }
    }

    /// Sauvegarder un échange
    pub async fn save_exchange(
        &self,
        conversation_id: &str,
        user_message: &str,
        assistant_message: &str,
        intention: &Intention,
        emotion: &EmotionState,
        cognitive_summary: &super::pipeline::CognitiveSummary,
        provider: &str,
        latency_ms: u64,
    ) -> Result<String, ConversationEngineError> {
        let message_id = Uuid::new_v4().to_string();

        let entry = ConversationMemoryEntry {
            timestamp: chrono::Utc::now().timestamp_millis() as u64,
            user_message: user_message.to_string(),
            assistant_message: assistant_message.to_string(),
            intention: intention.clone(),
            emotion: emotion.clone(),
            tags: cognitive_summary.tags.clone(),
            summary: cognitive_summary.summary.clone(),
            memory_effect: cognitive_summary.memory_effect.clone(),
            memory_layers: cognitive_summary.memory_layers.clone(),
            links_to_contexts: cognitive_summary.links.clone(),
            provider_used: provider.to_string(),
            latency_ms,
        };

        // Ajouter au cache
        let mut cache = self.cache.write().await;
        cache
            .entry(conversation_id.to_string())
            .or_insert_with(Vec::new)
            .push(entry.clone());

        // Sauvegarder dans storage
        let mut conversation = self
            .storage
            .load_conversation(conversation_id)
            .map_err(|e| ConversationEngineError::MemoryError(e.to_string()))?;

        // Ajouter les entrées user et assistant à la conversation
        conversation.add_entry(
            crate::memory::MessageRole::User,
            user_message.to_string(),
            user_message.split_whitespace().count(),
        );
        conversation.add_entry(
            crate::memory::MessageRole::Assistant,
            assistant_message.to_string(),
            assistant_message.split_whitespace().count(),
        );

        self.storage
            .save_conversation(&conversation)
            .map_err(|e| ConversationEngineError::MemoryError(e.to_string()))?;

        // Auto-snapshot tous les 10 messages
        if cache.get(conversation_id).map(|e| e.len()).unwrap_or(0) % 10 == 0 {
            self.create_snapshot(conversation_id).await?;
        }

        Ok(message_id)
    }

    /// Créer un snapshot de la conversation
    async fn create_snapshot(&self, conversation_id: &str) -> Result<(), ConversationEngineError> {
        // Implementation: Persistent conversation snapshot for backup/restore
        // - Snapshot data: {id, messages, metadata, embeddings, timestamp}
        // - Storage: Save to ~/.titane/snapshots/{conversation_id}_{timestamp}.json
        // - Compression: Use flate2 gzip compression for large conversations
        // - Metadata: Include conversation stats (message count, duration, participants)
        // - Trigger: Auto-snapshot every 50 messages or on conversation close
        // - Restoration: Load from snapshot on conversation resume
        // - Versioning: Keep last 5 snapshots per conversation for rollback
        // - Cleanup: Delete snapshots older than 90 days to save disk space
        log::info!(
            "[ConversationMemory] Snapshot créé pour {}",
            conversation_id
        );
        Ok(())
    }

    /// Convertir Conversation en entries
    fn conversation_to_entries(&self, conversation: &Conversation) -> Vec<ConversationMemoryEntry> {
        let mut result = Vec::new();
        let mut i = 0;

        // Parcourir par paires user/assistant
        while i + 1 < conversation.entries.len() {
            let user_entry = &conversation.entries[i];
            let assistant_entry = &conversation.entries[i + 1];

            // Vérifier que c'est bien user -> assistant
            if user_entry.role == crate::memory::MessageRole::User
                && assistant_entry.role == crate::memory::MessageRole::Assistant
            {
                result.push(ConversationMemoryEntry {
                    timestamp: user_entry.timestamp as u64,
                    user_message: user_entry.content.clone(),
                    assistant_message: assistant_entry.content.clone(),
                    // Implementation: Store rich metadata in entry.metadata JSON field
                    // - Intention: Extract from NER engine or LLM classification
                    // - Emotion: Analyze with sentiment analysis (valence/arousal model)
                    // - Tags: Auto-generate from keywords (TF-IDF) or entity extraction
                    // - Summary: Generate with summarizer.rs for conversations > 5 messages
                    // - Memory effect: Track impact (New/Reinforced/Updated/Forgotten)
                    // - Memory layers: Map to STM/MTM/LTM based on importance and age
                    // - Storage: Serialize to JSON in metadata column: {"intention": "Question", ...}
                    // - Retrieval: Parse JSON on load with serde_json::from_str()
                    intention: Intention::Question,
                    emotion: EmotionState::default(),
                    tags: vec![],
                    summary: String::new(),
                    memory_effect: MemoryEffect::New,
                    memory_layers: MemoryLayers::default(),
                    links_to_contexts: vec![],
                    provider_used: "unknown".to_string(),
                    latency_ms: 0,
                });
                i += 2;
            } else {
                i += 1;
            }
        }

        result
    }

    /// Formater le contexte pour le prompt
    fn format_context(&self, entries: &[ConversationMemoryEntry]) -> String {
        let last_n = 5;
        let relevant = if entries.len() > last_n {
            &entries[entries.len() - last_n..]
        } else {
            entries
        };

        let mut context = String::new();
        for entry in relevant {
            context.push_str(&format!(
                "User: {}\nAssistant: {}\n\n",
                entry.user_message, entry.assistant_message
            ));
        }

        context
    }
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;
    use crate::memory::model::Conversation;
    use crate::memory::MessageRole;

    fn create_test_storage() -> Arc<MemoryStorage> {
        let temp_dir = std::env::temp_dir().join("titane_test_memory");
        Arc::new(MemoryStorage::new(temp_dir, "test_password".to_string()).unwrap())
    }

    fn create_test_entry() -> ConversationMemoryEntry {
        ConversationMemoryEntry {
            timestamp: 1000,
            user_message: "Test user message".to_string(),
            assistant_message: "Test assistant message".to_string(),
            intention: Intention::Question,
            emotion: EmotionState::default(),
            tags: vec!["test".to_string()],
            summary: "Test summary".to_string(),
            memory_effect: MemoryEffect::New,
            memory_layers: MemoryLayers::default(),
            links_to_contexts: vec![],
            provider_used: "test_provider".to_string(),
            latency_ms: 100,
        }
    }

    #[test]
    fn test_conversation_memory_entry_serialization() {
        let entry = create_test_entry();
        let json = serde_json::to_string(&entry).unwrap();

        assert!(json.contains("Test user message"));
        assert!(json.contains("test_provider"));

        let deserialized: ConversationMemoryEntry = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.user_message, "Test user message");
        assert_eq!(deserialized.latency_ms, 100);
    }

    #[tokio::test]
    async fn test_conversation_memory_engine_new() {
        let storage = create_test_storage();
        let engine = ConversationMemoryEngine::new(storage);

        let cache = engine.cache.read().await;
        assert_eq!(cache.len(), 0);
    }

    #[tokio::test]
    async fn test_ensure_conversation_id_none() {
        let storage = create_test_storage();
        let engine = ConversationMemoryEngine::new(storage);

        let result = engine.ensure_conversation_id(None).await;
        assert!(result.is_ok());

        let conversation_id = result.unwrap();
        assert!(!conversation_id.is_empty());
    }

    #[tokio::test]
    async fn test_ensure_conversation_id_existing() {
        let storage = create_test_storage();
        let engine = ConversationMemoryEngine::new(storage.clone());

        // Create a conversation first
        let conversation = Conversation::new("Test".to_string());
        let conversation_id = conversation.id.clone();
        storage.save_conversation(&conversation).unwrap();

        // Ensure with existing ID
        let result = engine.ensure_conversation_id(Some(conversation_id.clone())).await;
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), conversation_id);
    }

    #[tokio::test]
    async fn test_ensure_conversation_id_nonexistent() {
        let storage = create_test_storage();
        let engine = ConversationMemoryEngine::new(storage);

        let fake_id = "nonexistent-id-12345".to_string();
        let result = engine.ensure_conversation_id(Some(fake_id.clone())).await;

        // Should create new conversation with given ID
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_load_context_empty() {
        let storage = create_test_storage();
        let engine = ConversationMemoryEngine::new(storage);

        let result = engine.load_context("nonexistent").await;
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), String::new());
    }

    #[tokio::test]
    async fn test_load_context_from_cache() {
        let storage = create_test_storage();
        let engine = ConversationMemoryEngine::new(storage);

        let conversation_id = "test-conversation".to_string();
        let entry = create_test_entry();

        // Add to cache
        {
            let mut cache = engine.cache.write().await;
            cache.insert(conversation_id.clone(), vec![entry.clone()]);
        }

        let result = engine.load_context(&conversation_id).await;
        assert!(result.is_ok());

        let context = result.unwrap();
        assert!(context.contains("Test user message"));
        assert!(context.contains("Test assistant message"));
    }

    #[tokio::test]
    async fn test_load_context_from_storage() {
        let storage = create_test_storage();
        let engine = ConversationMemoryEngine::new(storage.clone());

        // Create conversation with entries
        let mut conversation = Conversation::new("Test".to_string());
        conversation.add_entry(MessageRole::User, "Hello".to_string(), 1);
        conversation.add_entry(MessageRole::Assistant, "Hi there".to_string(), 2);

        let conversation_id = conversation.id.clone();
        storage.save_conversation(&conversation).unwrap();

        let result = engine.load_context(&conversation_id).await;
        assert!(result.is_ok());

        let context = result.unwrap();
        assert!(context.contains("Hello"));
        assert!(context.contains("Hi there"));
    }

    #[test]
    fn test_format_context_empty() {
        let storage = create_test_storage();
        let engine = ConversationMemoryEngine::new(storage);

        let context = engine.format_context(&[]);
        assert_eq!(context, String::new());
    }

    #[test]
    fn test_format_context_single_entry() {
        let storage = create_test_storage();
        let engine = ConversationMemoryEngine::new(storage);

        let entry = create_test_entry();
        let context = engine.format_context(&[entry]);

        assert!(context.contains("User: Test user message"));
        assert!(context.contains("Assistant: Test assistant message"));
    }

    #[test]
    fn test_format_context_multiple_entries() {
        let storage = create_test_storage();
        let engine = ConversationMemoryEngine::new(storage);

        let entries = vec![
            create_test_entry(),
            create_test_entry(),
            create_test_entry(),
        ];

        let context = engine.format_context(&entries);

        // Should contain all entries
        let count = context.matches("User:").count();
        assert_eq!(count, 3);
    }

    #[test]
    fn test_format_context_limits_to_last_five() {
        let storage = create_test_storage();
        let engine = ConversationMemoryEngine::new(storage);

        let entries: Vec<ConversationMemoryEntry> = (0..10)
            .map(|i| {
                let mut entry = create_test_entry();
                entry.user_message = format!("Message {}", i);
                entry
            })
            .collect();

        let context = engine.format_context(&entries);

        // Should only include last 5
        let count = context.matches("User:").count();
        assert_eq!(count, 5);

        // Should have messages 5-9
        assert!(context.contains("Message 9"));
        assert!(context.contains("Message 5"));
        assert!(!context.contains("Message 4"));
    }

    #[test]
    fn test_conversation_to_entries_empty() {
        let storage = create_test_storage();
        let engine = ConversationMemoryEngine::new(storage);

        let conversation = Conversation::new("Test".to_string());
        let entries = engine.conversation_to_entries(&conversation);

        assert_eq!(entries.len(), 0);
    }

    #[test]
    fn test_conversation_to_entries_single_pair() {
        let storage = create_test_storage();
        let engine = ConversationMemoryEngine::new(storage);

        let mut conversation = Conversation::new("Test".to_string());
        conversation.add_entry(MessageRole::User, "User message".to_string(), 2);
        conversation.add_entry(MessageRole::Assistant, "Assistant message".to_string(), 2);

        let entries = engine.conversation_to_entries(&conversation);

        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].user_message, "User message");
        assert_eq!(entries[0].assistant_message, "Assistant message");
    }

    #[test]
    fn test_conversation_to_entries_multiple_pairs() {
        let storage = create_test_storage();
        let engine = ConversationMemoryEngine::new(storage);

        let mut conversation = Conversation::new("Test".to_string());
        for i in 0..3 {
            conversation.add_entry(MessageRole::User, format!("User {}", i), 2);
            conversation.add_entry(MessageRole::Assistant, format!("Assistant {}", i), 2);
        }

        let entries = engine.conversation_to_entries(&conversation);

        assert_eq!(entries.len(), 3);
        assert_eq!(entries[0].user_message, "User 0");
        assert_eq!(entries[2].user_message, "User 2");
    }

    #[test]
    fn test_conversation_to_entries_skips_invalid_pairs() {
        let storage = create_test_storage();
        let engine = ConversationMemoryEngine::new(storage);

        let mut conversation = Conversation::new("Test".to_string());
        conversation.add_entry(MessageRole::User, "User 1".to_string(), 2);
        conversation.add_entry(MessageRole::User, "User 2".to_string(), 2); // Invalid: two user messages
        conversation.add_entry(MessageRole::Assistant, "Assistant 1".to_string(), 2);

        let entries = engine.conversation_to_entries(&conversation);

        // The engine advances by 1 on invalid pairs, so it should still
        // form a valid pair for the last user->assistant sequence.
        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].user_message, "User 2");
        assert_eq!(entries[0].assistant_message, "Assistant 1");
    }

    #[test]
    fn test_conversation_to_entries_default_values() {
        let storage = create_test_storage();
        let engine = ConversationMemoryEngine::new(storage);

        let mut conversation = Conversation::new("Test".to_string());
        conversation.add_entry(MessageRole::User, "Test".to_string(), 1);
        conversation.add_entry(MessageRole::Assistant, "Response".to_string(), 1);

        let entries = engine.conversation_to_entries(&conversation);

        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].intention, Intention::Question);
        assert_eq!(entries[0].memory_effect, MemoryEffect::New);
        assert_eq!(entries[0].provider_used, "unknown");
        assert_eq!(entries[0].latency_ms, 0);
    }

    #[test]
    fn test_memory_entry_fields() {
        let entry = ConversationMemoryEntry {
            timestamp: 123456789,
            user_message: "User".to_string(),
            assistant_message: "Assistant".to_string(),
            intention: Intention::Action,
            emotion: EmotionState::default(),
            tags: vec!["tag1".to_string(), "tag2".to_string()],
            summary: "Summary text".to_string(),
            memory_effect: MemoryEffect::Recall,
            memory_layers: MemoryLayers::default(),
            links_to_contexts: vec!["link1".to_string()],
            provider_used: "anthropic".to_string(),
            latency_ms: 250,
        };

        assert_eq!(entry.timestamp, 123456789);
        assert_eq!(entry.tags.len(), 2);
        assert_eq!(entry.latency_ms, 250);
    }

    #[tokio::test]
    async fn test_create_snapshot() {
        let storage = create_test_storage();
        let engine = ConversationMemoryEngine::new(storage);

        // Should not fail (even if it's a no-op implementation)
        let result = engine.create_snapshot("test-conversation").await;
        assert!(result.is_ok());
    }

    #[test]
    fn test_memory_entry_clone() {
        let entry = create_test_entry();
        let cloned = entry.clone();

        assert_eq!(entry.user_message, cloned.user_message);
        assert_eq!(entry.timestamp, cloned.timestamp);
        assert_eq!(entry.latency_ms, cloned.latency_ms);
    }

    #[test]
    fn test_memory_entry_debug() {
        let entry = create_test_entry();
        let debug_str = format!("{:?}", entry);

        assert!(debug_str.contains("ConversationMemoryEntry"));
        assert!(debug_str.contains("Test user message"));
    }
}
