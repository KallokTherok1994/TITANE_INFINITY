// TITANE∞ v15 - Memory Model
// Data structures for conversations and messages
// Clean architecture v15: JSON serialization, documented
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

    // ─────────────────────────────────────────────────────────────
    // Conversation Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_conversation_creation() {
        let conv = Conversation::new("Test Chat".to_string());
        assert_eq!(conv.entries.len(), 0);
        assert_eq!(conv.metadata.message_count, 0);
    }

    #[test]
    fn test_conversation_new_with_title() {
        let conv = Conversation::new("My Conversation".to_string());
        assert_eq!(conv.title, "My Conversation");
        assert!(!conv.id.is_empty());
        assert!(conv.created_at > 0);
        assert!(conv.updated_at > 0);
    }

    #[test]
    fn test_conversation_unique_ids() {
        let conv1 = Conversation::new("Conv1".to_string());
        let conv2 = Conversation::new("Conv2".to_string());
        assert_ne!(conv1.id, conv2.id);
    }

    #[test]
    fn test_add_entry() {
        let mut conv = Conversation::new("Test".to_string());
        conv.add_entry(MessageRole::User, "Hello".to_string(), 1);
        assert_eq!(conv.entries.len(), 1);
        assert_eq!(conv.metadata.message_count, 1);
    }

    #[test]
    fn test_add_entry_updates_tokens() {
        let mut conv = Conversation::new("Test".to_string());
        conv.add_entry(MessageRole::User, "Hello".to_string(), 10);
        conv.add_entry(MessageRole::Assistant, "Hi there".to_string(), 5);

        assert_eq!(conv.metadata.total_tokens, 15);
    }

    #[test]
    fn test_add_entry_roles() {
        let mut conv = Conversation::new("Test".to_string());
        conv.add_entry(MessageRole::User, "User msg".to_string(), 1);
        conv.add_entry(MessageRole::Assistant, "Bot msg".to_string(), 1);
        conv.add_entry(MessageRole::System, "System msg".to_string(), 1);

        assert_eq!(conv.entries.len(), 3);
    }

    #[test]
    fn test_get_context() {
        let mut conv = Conversation::new("Test".to_string());
        conv.add_entry(MessageRole::User, "Message 1".to_string(), 10);
        conv.add_entry(MessageRole::Assistant, "Response 1".to_string(), 20);
        conv.add_entry(MessageRole::User, "Message 2".to_string(), 15);

        let context = conv.get_context(30);
        // Token budget 30: only last message (15 tokens) fits
        assert_eq!(context.len(), 1);
    }

    #[test]
    fn test_get_context_all_fit() {
        let mut conv = Conversation::new("Test".to_string());
        conv.add_entry(MessageRole::User, "Msg 1".to_string(), 5);
        conv.add_entry(MessageRole::Assistant, "Msg 2".to_string(), 5);
        conv.add_entry(MessageRole::User, "Msg 3".to_string(), 5);

        let context = conv.get_context(100);
        assert_eq!(context.len(), 3);
    }

    #[test]
    fn test_get_context_empty() {
        let conv = Conversation::new("Test".to_string());
        let context = conv.get_context(100);
        assert!(context.is_empty());
    }

    #[test]
    fn test_get_context_zero_budget() {
        let mut conv = Conversation::new("Test".to_string());
        conv.add_entry(MessageRole::User, "Hello".to_string(), 5);

        let context = conv.get_context(0);
        assert!(context.is_empty());
    }

    #[test]
    fn test_get_context_order_preserved() {
        let mut conv = Conversation::new("Test".to_string());
        conv.add_entry(MessageRole::User, "First".to_string(), 1);
        conv.add_entry(MessageRole::Assistant, "Second".to_string(), 1);
        conv.add_entry(MessageRole::User, "Third".to_string(), 1);

        let context = conv.get_context(100);
        assert_eq!(context[0].content, "First");
        assert_eq!(context[1].content, "Second");
        assert_eq!(context[2].content, "Third");
    }

    #[test]
    fn test_conversation_clear() {
        let mut conv = Conversation::new("Test".to_string());
        conv.add_entry(MessageRole::User, "Hello".to_string(), 10);
        conv.add_entry(MessageRole::Assistant, "Hi".to_string(), 5);

        conv.clear();

        assert!(conv.entries.is_empty());
        assert_eq!(conv.metadata.total_tokens, 0);
        assert_eq!(conv.metadata.message_count, 0);
    }

    #[test]
    fn test_conversation_clone() {
        let mut conv = Conversation::new("Test".to_string());
        conv.add_entry(MessageRole::User, "Hello".to_string(), 5);

        let cloned = conv.clone();
        assert_eq!(cloned.title, conv.title);
        assert_eq!(cloned.entries.len(), 1);
    }

    #[test]
    fn test_conversation_debug() {
        let conv = Conversation::new("Test".to_string());
        let debug_str = format!("{:?}", conv);
        assert!(debug_str.contains("Conversation"));
    }

    #[test]
    fn test_conversation_serialization() {
        let mut conv = Conversation::new("Test Conv".to_string());
        conv.add_entry(MessageRole::User, "Hello".to_string(), 5);

        let json = serde_json::to_string(&conv).unwrap();
        let restored: Conversation = serde_json::from_str(&json).unwrap();

        assert_eq!(restored.title, "Test Conv");
        assert_eq!(restored.entries.len(), 1);
    }

    // ─────────────────────────────────────────────────────────────
    // ConversationMetadata Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_conversation_metadata_default() {
        let conv = Conversation::new("Test".to_string());
        assert_eq!(conv.metadata.total_tokens, 0);
        assert_eq!(conv.metadata.message_count, 0);
        assert!(conv.metadata.tags.is_empty());
        assert!(!conv.metadata.is_archived);
    }

    #[test]
    fn test_conversation_metadata_clone() {
        let meta = ConversationMetadata {
            total_tokens: 100,
            message_count: 10,
            tags: vec!["tag1".to_string(), "tag2".to_string()],
            is_archived: true,
        };
        let cloned = meta.clone();
        assert_eq!(cloned.total_tokens, 100);
        assert_eq!(cloned.tags.len(), 2);
    }

    #[test]
    fn test_conversation_metadata_debug() {
        let meta = ConversationMetadata {
            total_tokens: 50,
            message_count: 5,
            tags: vec![],
            is_archived: false,
        };
        let debug_str = format!("{:?}", meta);
        assert!(debug_str.contains("ConversationMetadata"));
    }

    #[test]
    fn test_conversation_metadata_serialization() {
        let meta = ConversationMetadata {
            total_tokens: 200,
            message_count: 20,
            tags: vec!["important".to_string()],
            is_archived: true,
        };

        let json = serde_json::to_string(&meta).unwrap();
        let restored: ConversationMetadata = serde_json::from_str(&json).unwrap();

        assert_eq!(restored.total_tokens, 200);
        assert!(restored.is_archived);
    }

    // ─────────────────────────────────────────────────────────────
    // MemoryIndex Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_memory_index_creation() {
        let index = MemoryIndex {
            conversations: vec![],
            total_conversations: 0,
            total_messages: 0,
        };

        assert!(index.conversations.is_empty());
        assert_eq!(index.total_conversations, 0);
    }

    #[test]
    fn test_memory_index_with_data() {
        let summary = ConversationSummary {
            id: "id-1".to_string(),
            title: "Conversation 1".to_string(),
            created_at: 1000,
            updated_at: 2000,
            message_count: 10,
            is_archived: false,
        };

        let index = MemoryIndex {
            conversations: vec![summary],
            total_conversations: 1,
            total_messages: 10,
        };

        assert_eq!(index.conversations.len(), 1);
        assert_eq!(index.total_messages, 10);
    }

    #[test]
    fn test_memory_index_clone() {
        let index = MemoryIndex {
            conversations: vec![],
            total_conversations: 5,
            total_messages: 50,
        };
        let cloned = index.clone();
        assert_eq!(cloned.total_conversations, 5);
    }

    #[test]
    fn test_memory_index_debug() {
        let index = MemoryIndex {
            conversations: vec![],
            total_conversations: 0,
            total_messages: 0,
        };
        let debug_str = format!("{:?}", index);
        assert!(debug_str.contains("MemoryIndex"));
    }

    #[test]
    fn test_memory_index_serialization() {
        let index = MemoryIndex {
            conversations: vec![],
            total_conversations: 3,
            total_messages: 30,
        };

        let json = serde_json::to_string(&index).unwrap();
        let restored: MemoryIndex = serde_json::from_str(&json).unwrap();

        assert_eq!(restored.total_conversations, 3);
        assert_eq!(restored.total_messages, 30);
    }

    // ─────────────────────────────────────────────────────────────
    // ConversationSummary Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_conversation_summary_creation() {
        let summary = ConversationSummary {
            id: "test-id".to_string(),
            title: "My Chat".to_string(),
            created_at: 1000,
            updated_at: 2000,
            message_count: 5,
            is_archived: false,
        };

        assert_eq!(summary.id, "test-id");
        assert_eq!(summary.title, "My Chat");
        assert!(!summary.is_archived);
    }

    #[test]
    fn test_conversation_summary_from_conversation() {
        let mut conv = Conversation::new("Test".to_string());
        conv.add_entry(MessageRole::User, "Hello".to_string(), 5);
        conv.add_entry(MessageRole::Assistant, "Hi".to_string(), 3);

        let summary: ConversationSummary = (&conv).into();

        assert_eq!(summary.id, conv.id);
        assert_eq!(summary.title, conv.title);
        assert_eq!(summary.message_count, 2);
        assert!(!summary.is_archived);
    }

    #[test]
    fn test_conversation_summary_archived() {
        let mut conv = Conversation::new("Test".to_string());
        conv.metadata.is_archived = true;

        let summary: ConversationSummary = (&conv).into();
        assert!(summary.is_archived);
    }

    #[test]
    fn test_conversation_summary_clone() {
        let summary = ConversationSummary {
            id: "id".to_string(),
            title: "title".to_string(),
            created_at: 100,
            updated_at: 200,
            message_count: 10,
            is_archived: true,
        };
        let cloned = summary.clone();
        assert_eq!(cloned.message_count, 10);
        assert!(cloned.is_archived);
    }

    #[test]
    fn test_conversation_summary_debug() {
        let summary = ConversationSummary {
            id: "id".to_string(),
            title: "title".to_string(),
            created_at: 0,
            updated_at: 0,
            message_count: 0,
            is_archived: false,
        };
        let debug_str = format!("{:?}", summary);
        assert!(debug_str.contains("ConversationSummary"));
    }

    #[test]
    fn test_conversation_summary_serialization() {
        let summary = ConversationSummary {
            id: "summary-id".to_string(),
            title: "Summary Title".to_string(),
            created_at: 1234567890,
            updated_at: 1234567900,
            message_count: 25,
            is_archived: false,
        };

        let json = serde_json::to_string(&summary).unwrap();
        let restored: ConversationSummary = serde_json::from_str(&json).unwrap();

        assert_eq!(restored.id, "summary-id");
        assert_eq!(restored.message_count, 25);
    }

    // ─────────────────────────────────────────────────────────────
    // Integration Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_conversation_workflow() {
        // Create conversation
        let mut conv = Conversation::new("Chat Session".to_string());

        // Add messages
        conv.add_entry(MessageRole::System, "You are helpful".to_string(), 3);
        conv.add_entry(MessageRole::User, "Hello!".to_string(), 1);
        conv.add_entry(MessageRole::Assistant, "Hi! How can I help?".to_string(), 5);
        conv.add_entry(MessageRole::User, "What's the weather?".to_string(), 4);
        conv.add_entry(
            MessageRole::Assistant,
            "I don't have access to weather data.".to_string(),
            8,
        );

        // Verify state
        assert_eq!(conv.metadata.message_count, 5);
        assert_eq!(conv.metadata.total_tokens, 21);

        // Get context with budget
        let context = conv.get_context(15);
        // Should get the last few messages that fit in 15 tokens
        assert!(!context.is_empty());

        // Create summary
        let summary: ConversationSummary = (&conv).into();
        assert_eq!(summary.message_count, 5);

        // Clear
        conv.clear();
        assert_eq!(conv.metadata.message_count, 0);
    }

    #[test]
    fn test_multiple_conversations_index() {
        let conv1 = Conversation::new("Conv 1".to_string());
        let mut conv2 = Conversation::new("Conv 2".to_string());
        conv2.add_entry(MessageRole::User, "Hello".to_string(), 5);

        let summaries: Vec<ConversationSummary> = vec![(&conv1).into(), (&conv2).into()];

        let total_messages: usize = summaries.iter().map(|s| s.message_count).sum();

        let index = MemoryIndex {
            conversations: summaries,
            total_conversations: 2,
            total_messages,
        };

        assert_eq!(index.total_conversations, 2);
        assert_eq!(index.total_messages, 1);
    }
}
