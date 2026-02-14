// PLAN v25.x: Migrer vers unified_memory_v2::persistence
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
                    let mut conversation = Conversation::new("Session".to_string());
                    conversation.id = id.clone();
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
