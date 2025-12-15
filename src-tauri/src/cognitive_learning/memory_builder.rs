/**
 * TITANE∞ v∞ - Memory Builder
 * Convertit conversations + fichiers en connaissance
 */
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryBlock {
    pub id: String,
    pub content: String,
    pub source: MemorySource,
    pub timestamp: u64,
    pub concepts_extracted: Vec<String>,
    pub importance: f32,
    pub summary: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MemorySource {
    Conversation,
    FileImport,
    SystemEvent,
    UserFeedback,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryBuildReport {
    pub blocks_created: usize,
    pub concepts_extracted: usize,
    pub total_importance: f32,
}

pub struct MemoryBuilder;

impl Default for MemoryBuilder {
    fn default() -> Self {
        Self::new()
    }
}

impl MemoryBuilder {
    pub fn new() -> Self {
        Self
    }

    pub async fn build_from_conversation(&self, message: String) -> MemoryBlock {
        let id = format!("mem_{}", uuid::Uuid::new_v4());
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        // Extraction simple de concepts (mots-clés)
        let concepts: Vec<String> = message
            .split_whitespace()
            .filter(|word| word.len() > 5)
            .take(5)
            .map(|s| s.to_lowercase())
            .collect();

        let summary = if message.len() > 100 {
            format!("{}...", &message[..100])
        } else {
            message.clone()
        };

        let importance = (concepts.len() as f32 / 10.0).min(1.0);

        MemoryBlock {
            id,
            content: message,
            source: MemorySource::Conversation,
            timestamp,
            concepts_extracted: concepts,
            importance,
            summary,
        }
    }

    pub async fn build_from_file(&self, filename: String, content: String) -> MemoryBlock {
        let id = format!("mem_file_{}", uuid::Uuid::new_v4());
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let concepts: Vec<String> = content
            .split_whitespace()
            .filter(|word| word.len() > 5)
            .take(20)
            .map(|s| s.to_lowercase())
            .collect();

        let summary = format!(
            "Fichier importé: {} ({} concepts)",
            filename,
            concepts.len()
        );

        MemoryBlock {
            id,
            content,
            source: MemorySource::FileImport,
            timestamp,
            concepts_extracted: concepts.clone(),
            importance: 0.8,
            summary,
        }
    }
}

#[tauri::command]
pub async fn cognitive_build_memory(message: String) -> Result<MemoryBlock, String> {
    let builder = MemoryBuilder::new();
    Ok(builder.build_from_conversation(message).await)
}

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // MemorySource Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_memory_source_variants() {
        let sources = vec![
            MemorySource::Conversation,
            MemorySource::FileImport,
            MemorySource::SystemEvent,
            MemorySource::UserFeedback,
        ];
        assert_eq!(sources.len(), 4);
    }

    #[test]
    fn test_memory_source_clone() {
        let source = MemorySource::Conversation;
        let cloned = source.clone();
        assert!(matches!(cloned, MemorySource::Conversation));
    }

    #[test]
    fn test_memory_source_debug() {
        let source = MemorySource::FileImport;
        let debug_str = format!("{:?}", source);
        assert!(debug_str.contains("FileImport"));
    }

    #[test]
    fn test_memory_source_serialization() {
        let source = MemorySource::SystemEvent;
        let json = serde_json::to_string(&source).unwrap();
        let restored: MemorySource = serde_json::from_str(&json).unwrap();
        assert!(matches!(restored, MemorySource::SystemEvent));
    }

    // ─────────────────────────────────────────────────────────────
    // MemoryBlock Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_memory_block_creation() {
        let block = MemoryBlock {
            id: "test-id".to_string(),
            content: "Test content".to_string(),
            source: MemorySource::Conversation,
            timestamp: 12345,
            concepts_extracted: vec!["concept".to_string()],
            importance: 0.5,
            summary: "Summary".to_string(),
        };
        assert_eq!(block.id, "test-id");
        assert_eq!(block.importance, 0.5);
    }

    #[test]
    fn test_memory_block_clone() {
        let block = MemoryBlock {
            id: "id".to_string(),
            content: "content".to_string(),
            source: MemorySource::UserFeedback,
            timestamp: 100,
            concepts_extracted: vec!["a".to_string(), "b".to_string()],
            importance: 0.8,
            summary: "sum".to_string(),
        };
        let cloned = block.clone();
        assert_eq!(cloned.importance, 0.8);
        assert_eq!(cloned.concepts_extracted.len(), 2);
    }

    #[test]
    fn test_memory_block_debug() {
        let block = MemoryBlock {
            id: "x".to_string(),
            content: "y".to_string(),
            source: MemorySource::Conversation,
            timestamp: 0,
            concepts_extracted: vec![],
            importance: 0.0,
            summary: "z".to_string(),
        };
        let debug_str = format!("{:?}", block);
        assert!(debug_str.contains("MemoryBlock"));
    }

    #[test]
    fn test_memory_block_serialization() {
        let block = MemoryBlock {
            id: "mem-123".to_string(),
            content: "Important content".to_string(),
            source: MemorySource::FileImport,
            timestamp: 999999,
            concepts_extracted: vec!["rust".to_string(), "testing".to_string()],
            importance: 0.9,
            summary: "A summary".to_string(),
        };
        let json = serde_json::to_string(&block).unwrap();
        let restored: MemoryBlock = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.id, "mem-123");
        assert_eq!(restored.importance, 0.9);
    }

    // ─────────────────────────────────────────────────────────────
    // MemoryBuildReport Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_memory_build_report_creation() {
        let report = MemoryBuildReport {
            blocks_created: 10,
            concepts_extracted: 50,
            total_importance: 7.5,
        };
        assert_eq!(report.blocks_created, 10);
        assert_eq!(report.concepts_extracted, 50);
    }

    #[test]
    fn test_memory_build_report_clone() {
        let report = MemoryBuildReport {
            blocks_created: 5,
            concepts_extracted: 25,
            total_importance: 4.0,
        };
        let cloned = report.clone();
        assert_eq!(cloned.blocks_created, 5);
    }

    #[test]
    fn test_memory_build_report_debug() {
        let report = MemoryBuildReport {
            blocks_created: 0,
            concepts_extracted: 0,
            total_importance: 0.0,
        };
        let debug_str = format!("{:?}", report);
        assert!(debug_str.contains("MemoryBuildReport"));
    }

    #[test]
    fn test_memory_build_report_serialization() {
        let report = MemoryBuildReport {
            blocks_created: 20,
            concepts_extracted: 100,
            total_importance: 15.5,
        };
        let json = serde_json::to_string(&report).unwrap();
        let restored: MemoryBuildReport = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.blocks_created, 20);
    }

    // ─────────────────────────────────────────────────────────────
    // MemoryBuilder Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_memory_builder_new() {
        let builder = MemoryBuilder::new();
        // Should create without panic
        let _ = builder;
    }

    #[test]
    fn test_memory_builder_default() {
        let builder = MemoryBuilder::default();
        let _ = builder;
    }

    #[tokio::test]
    async fn test_build_from_conversation_short() {
        let builder = MemoryBuilder::new();
        let block = builder
            .build_from_conversation("Hello world".to_string())
            .await;

        assert!(block.id.starts_with("mem_"));
        assert_eq!(block.content, "Hello world");
        assert!(matches!(block.source, MemorySource::Conversation));
        assert!(block.timestamp > 0);
    }

    #[tokio::test]
    async fn test_build_from_conversation_long() {
        let builder = MemoryBuilder::new();
        let long_message = "A".repeat(200);
        let block = builder.build_from_conversation(long_message.clone()).await;

        // Summary should be truncated to 100 chars + "..."
        assert!(block.summary.ends_with("..."));
        assert!(block.summary.len() <= 103);
    }

    #[tokio::test]
    async fn test_build_from_conversation_concepts() {
        let builder = MemoryBuilder::new();
        let message = "Programming language development requires careful planning".to_string();
        let block = builder.build_from_conversation(message).await;

        // Words > 5 chars: Programming, language, development, requires, careful, planning
        // Takes max 5
        assert!(block.concepts_extracted.len() <= 5);
        assert!(block.concepts_extracted.iter().all(|c| c.len() > 5));
    }

    #[tokio::test]
    async fn test_build_from_conversation_importance() {
        let builder = MemoryBuilder::new();

        // No long words = 0 concepts
        let block1 = builder.build_from_conversation("Hi".to_string()).await;
        assert_eq!(block1.importance, 0.0);

        // Some long words
        let block2 = builder
            .build_from_conversation("Programming development testing".to_string())
            .await;
        assert!(block2.importance > 0.0);
    }

    #[tokio::test]
    async fn test_build_from_file() {
        let builder = MemoryBuilder::new();
        let block = builder
            .build_from_file(
                "test.rs".to_string(),
                "Function implementation with multiple features and capabilities".to_string(),
            )
            .await;

        assert!(block.id.starts_with("mem_file_"));
        assert!(matches!(block.source, MemorySource::FileImport));
        assert_eq!(block.importance, 0.8);
        assert!(block.summary.contains("test.rs"));
    }

    #[tokio::test]
    async fn test_build_from_file_concepts() {
        let builder = MemoryBuilder::new();
        let content = "Implementation development architecture configuration \
                       optimization performance functionality integration";
        let block = builder
            .build_from_file("code.rs".to_string(), content.to_string())
            .await;

        // Takes up to 20 concepts for files
        assert!(block.concepts_extracted.len() <= 20);
    }

    #[tokio::test]
    async fn test_build_unique_ids() {
        let builder = MemoryBuilder::new();
        let block1 = builder.build_from_conversation("Test 1".to_string()).await;
        let block2 = builder.build_from_conversation("Test 2".to_string()).await;

        assert_ne!(block1.id, block2.id);
    }

    // ─────────────────────────────────────────────────────────────
    // Tauri Command Tests
    // ─────────────────────────────────────────────────────────────

    #[tokio::test]
    async fn test_tauri_cognitive_build_memory() {
        let result = cognitive_build_memory("Test message".to_string()).await;
        assert!(result.is_ok());
        let block = result.unwrap();
        assert_eq!(block.content, "Test message");
    }

    #[tokio::test]
    async fn test_tauri_cognitive_build_memory_empty() {
        let result = cognitive_build_memory("".to_string()).await;
        assert!(result.is_ok());
        let block = result.unwrap();
        assert!(block.content.is_empty());
    }
}
