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
        let concepts: Vec<String> = message.split_whitespace()
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

        let concepts: Vec<String> = content.split_whitespace()
            .filter(|word| word.len() > 5)
            .take(20)
            .map(|s| s.to_lowercase())
            .collect();

        let summary = format!("Fichier importé: {} ({} concepts)", filename, concepts.len());

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
