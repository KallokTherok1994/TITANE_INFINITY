// TITANE∞ v12 - Memory Model
// Data structures for conversational memory

use super::{MemoryEntry, MessageRole};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Conversation {
    pub id: String,
    pub title: String,
    pub created_at: i64,
    pub updated_at: i64,
    pub entries: Vec<MemoryEntry>,
    pub metadata: ConversationMetadata,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversationMetadata {
    pub total_tokens: usize,
    pub message_count: usize,
    pub tags: Vec<String>,
    pub is_archived: bool,
}

impl Conversation {
    pub fn new(title: String) -> Self {
        let now = chrono::Utc::now().timestamp();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            title,
            created_at: now,
            updated_at: now,
            entries: Vec::new(),
            metadata: ConversationMetadata {
                total_tokens: 0,
                message_count: 0,
                tags: Vec::new(),
                is_archived: false,
            },
        }
    }

    pub fn add_entry(&mut self, role: MessageRole, content: String, tokens: usize) {
        let entry = MemoryEntry {
            id: uuid::Uuid::new_v4().to_string(),
            role,
            content,
            timestamp: chrono::Utc::now().timestamp(),
            tokens,
            metadata: None,
        };

        self.entries.push(entry);
        self.metadata.total_tokens += tokens;
        self.metadata.message_count += 1;
        self.updated_at = chrono::Utc::now().timestamp();
    }

    pub fn get_context(&self, max_tokens: usize) -> Vec<&MemoryEntry> {
        let mut result = Vec::new();
        let mut token_count = 0;

        // Get messages from most recent, up to max_tokens
        for entry in self.entries.iter().rev() {
            if token_count + entry.tokens > max_tokens {
                break;
            }
            result.push(entry);
            token_count += entry.tokens;
        }

        result.reverse();
        result
    }

    pub fn clear(&mut self) {
        self.entries.clear();
        self.metadata.total_tokens = 0;
        self.metadata.message_count = 0;
        self.updated_at = chrono::Utc::now().timestamp();
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryIndex {
    pub conversations: Vec<ConversationSummary>,
    pub total_conversations: usize,
    pub total_messages: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversationSummary {
    pub id: String,
    pub title: String,
    pub created_at: i64,
    pub updated_at: i64,
    pub message_count: usize,
    pub is_archived: bool,
}

impl From<&Conversation> for ConversationSummary {
    fn from(conv: &Conversation) -> Self {
        Self {
            id: conv.id.clone(),
            title: conv.title.clone(),
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            message_count: conv.metadata.message_count,
            is_archived: conv.metadata.is_archived,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_conversation_creation() {
        let conv = Conversation::new("Test Chat".to_string());
        assert_eq!(conv.entries.len(), 0);
        assert_eq!(conv.metadata.message_count, 0);
    }

    #[test]
    fn test_add_entry() {
        let mut conv = Conversation::new("Test".to_string());
        conv.add_entry(MessageRole::User, "Hello".to_string(), 1);
        assert_eq!(conv.entries.len(), 1);
        assert_eq!(conv.metadata.message_count, 1);
    }

    #[test]
    fn test_get_context() {
        let mut conv = Conversation::new("Test".to_string());
        conv.add_entry(MessageRole::User, "Message 1".to_string(), 10);
        conv.add_entry(MessageRole::Assistant, "Response 1".to_string(), 20);
        conv.add_entry(MessageRole::User, "Message 2".to_string(), 15);

        let context = conv.get_context(30);
        assert_eq!(context.len(), 2); // Should get last 2 messages
    }
}
