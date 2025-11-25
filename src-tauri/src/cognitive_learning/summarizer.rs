/**
 * TITANE∞ v∞ - Summarizer
 * Crée des synthèses pour optimiser la mémoire
 */

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Summary {
    pub id: String,
    pub original_length: usize,
    pub summary_length: usize,
    pub compression_ratio: f32,
    pub content: String,
    pub key_points: Vec<String>,
}

pub struct Summarizer;

impl Default for Summarizer {
    fn default() -> Self {
        Self::new()
    }
}

impl Summarizer {
    pub fn new() -> Self {
        Self
    }

    pub async fn summarize(&self, content: String) -> Summary {
        let id = format!("summary_{}", uuid::Uuid::new_v4());
        let original_length = content.len();

        // Extraction de points clés (premiers mots de chaque phrase)
        let key_points: Vec<String> = content
            .split('.')
            .filter(|s| !s.trim().is_empty())
            .take(5)
            .map(|s| {
                let words: Vec<&str> = s.split_whitespace().collect();
                words.into_iter().take(10).collect::<Vec<_>>().join(" ")
            })
            .collect();

        // Création du résumé (premiers 300 caractères + points clés)
        let summary_text = if content.len() > 300 {
            format!("{}...\n\nPoints clés:\n- {}",
                &content[..300],
                key_points.join("\n- "))
        } else {
            content.clone()
        };

        let summary_length = summary_text.len();
        let compression_ratio = (original_length as f32 - summary_length as f32) / original_length as f32;

        Summary {
            id,
            original_length,
            summary_length,
            compression_ratio,
            content: summary_text,
            key_points,
        }
    }
}

#[tauri::command]
pub async fn cognitive_summarize(content: String) -> Result<Summary, String> {
    let summarizer = Summarizer::new();
    Ok(summarizer.summarize(content).await)
}
