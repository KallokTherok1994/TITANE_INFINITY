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

        // Extraction de points clés (premiers mots de chaque phrase).
        // Si le contenu ne contient pas de '.', on considère qu’il n’y a pas de phrases.
        let key_points: Vec<String> = if content.contains('.') {
            content
                .split('.')
                .filter(|s| !s.trim().is_empty())
                .take(5)
                .map(|s| {
                    let words: Vec<&str> = s.split_whitespace().collect();
                    words.into_iter().take(10).collect::<Vec<_>>().join(" ")
                })
                .collect()
        } else {
            Vec::new()
        };

        // Création du résumé (premiers 300 caractères + points clés si disponibles)
        let summary_text = if content.len() > 300 {
            if key_points.is_empty() {
                format!("{}...", &content[..300])
            } else {
                format!(
                    "{}...\n\nPoints clés:\n- {}",
                    &content[..300],
                    key_points.join("\n- ")
                )
            }
        } else {
            content.clone()
        };

        let summary_length = summary_text.len();
        let compression_ratio = if original_length == 0 {
            0.0
        } else {
            (original_length as f32 - summary_length as f32) / original_length as f32
        };

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

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // Summary Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_summary_creation() {
        let summary = Summary {
            id: "sum-1".to_string(),
            original_length: 1000,
            summary_length: 300,
            compression_ratio: 0.7,
            content: "Summary content".to_string(),
            key_points: vec!["Point 1".to_string()],
        };
        assert_eq!(summary.original_length, 1000);
        assert_eq!(summary.compression_ratio, 0.7);
    }

    #[test]
    fn test_summary_clone() {
        let summary = Summary {
            id: "id".to_string(),
            original_length: 500,
            summary_length: 100,
            compression_ratio: 0.8,
            content: "content".to_string(),
            key_points: vec!["a".to_string(), "b".to_string()],
        };
        let cloned = summary.clone();
        assert_eq!(cloned.compression_ratio, 0.8);
        assert_eq!(cloned.key_points.len(), 2);
    }

    #[test]
    fn test_summary_debug() {
        let summary = Summary {
            id: "x".to_string(),
            original_length: 0,
            summary_length: 0,
            compression_ratio: 0.0,
            content: "y".to_string(),
            key_points: vec![],
        };
        let debug_str = format!("{:?}", summary);
        assert!(debug_str.contains("Summary"));
    }

    #[test]
    fn test_summary_serialization() {
        let summary = Summary {
            id: "summary-123".to_string(),
            original_length: 2000,
            summary_length: 500,
            compression_ratio: 0.75,
            content: "Test summary".to_string(),
            key_points: vec!["Key point one".to_string()],
        };
        let json = serde_json::to_string(&summary).unwrap();
        let restored: Summary = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.id, "summary-123");
        assert_eq!(restored.compression_ratio, 0.75);
    }

    // ─────────────────────────────────────────────────────────────
    // Summarizer Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_summarizer_new() {
        let summarizer = Summarizer::new();
        let _ = summarizer;
    }

    #[test]
    fn test_summarizer_default() {
        let summarizer = Summarizer::default();
        let _ = summarizer;
    }

    #[tokio::test]
    async fn test_summarize_short_content() {
        let summarizer = Summarizer::new();
        let content = "Short content.".to_string();
        let summary = summarizer.summarize(content.clone()).await;

        assert!(summary.id.starts_with("summary_"));
        assert_eq!(summary.original_length, content.len());
        // Short content is not truncated
        assert_eq!(summary.content, content);
    }

    #[tokio::test]
    async fn test_summarize_long_content() {
        let summarizer = Summarizer::new();
        let content = "A".repeat(500);
        let summary = summarizer.summarize(content.clone()).await;

        assert_eq!(summary.original_length, 500);
        // Long content should be truncated
        assert!(summary.content.contains("..."));
        assert!(summary.summary_length < summary.original_length);
    }

    #[tokio::test]
    async fn test_summarize_key_points() {
        let summarizer = Summarizer::new();
        let content = "First sentence here. Second sentence follows. Third one too.".to_string();
        let summary = summarizer.summarize(content).await;

        // Should extract up to 5 key points from sentences
        assert!(!summary.key_points.is_empty());
        assert!(summary.key_points.len() <= 5);
    }

    #[tokio::test]
    async fn test_summarize_compression_ratio() {
        let summarizer = Summarizer::new();
        let content = "A".repeat(1000);
        let summary = summarizer.summarize(content).await;

        // Compression ratio should be positive for long content
        assert!(summary.compression_ratio > 0.0);
        assert!(summary.compression_ratio < 1.0);
    }

    #[tokio::test]
    async fn test_summarize_empty_content() {
        let summarizer = Summarizer::new();
        let summary = summarizer.summarize("".to_string()).await;

        assert_eq!(summary.original_length, 0);
        assert!(summary.key_points.is_empty());
    }

    #[tokio::test]
    async fn test_summarize_no_sentences() {
        let summarizer = Summarizer::new();
        let content = "No period here so no sentence splitting".to_string();
        let summary = summarizer.summarize(content).await;

        // Content without periods won't have key points extracted
        assert!(summary.key_points.is_empty());
    }

    #[tokio::test]
    async fn test_summarize_many_sentences() {
        let summarizer = Summarizer::new();
        let content = "One. Two. Three. Four. Five. Six. Seven. Eight. Nine. Ten.".to_string();
        let summary = summarizer.summarize(content).await;

        // Should only take first 5 sentences as key points
        assert_eq!(summary.key_points.len(), 5);
    }

    #[tokio::test]
    async fn test_summarize_unique_ids() {
        let summarizer = Summarizer::new();
        let summary1 = summarizer.summarize("Test 1".to_string()).await;
        let summary2 = summarizer.summarize("Test 2".to_string()).await;

        assert_ne!(summary1.id, summary2.id);
    }

    #[tokio::test]
    async fn test_summarize_key_point_word_limit() {
        let summarizer = Summarizer::new();
        // Long sentence with many words
        let content = "This is a very long sentence with many many many words that should be truncated to only the first ten words maximum.".to_string();
        let summary = summarizer.summarize(content).await;

        // Each key point should have max 10 words
        for point in &summary.key_points {
            let word_count = point.split_whitespace().count();
            assert!(word_count <= 10);
        }
    }

    #[tokio::test]
    async fn test_summarize_content_boundary() {
        let summarizer = Summarizer::new();

        // Exactly 300 chars
        let content_300 = "A".repeat(300);
        let summary = summarizer.summarize(content_300).await;
        // Should not be truncated (content <= 300)
        assert!(!summary.content.contains("..."));

        // 301 chars
        let content_301 = "A".repeat(301);
        let summary = summarizer.summarize(content_301).await;
        // Should be truncated
        assert!(summary.content.contains("..."));
    }

    // ─────────────────────────────────────────────────────────────
    // Tauri Command Tests
    // ─────────────────────────────────────────────────────────────

    #[tokio::test]
    async fn test_tauri_cognitive_summarize() {
        let result = cognitive_summarize("Test content.".to_string()).await;
        assert!(result.is_ok());
        let summary = result.unwrap();
        assert!(summary.id.starts_with("summary_"));
    }

    #[tokio::test]
    async fn test_tauri_cognitive_summarize_empty() {
        let result = cognitive_summarize("".to_string()).await;
        assert!(result.is_ok());
        let summary = result.unwrap();
        assert_eq!(summary.original_length, 0);
    }
}
