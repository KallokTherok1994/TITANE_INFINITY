// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Summarizer v2
//   SUPER PROMPT #6 vΩ.8 — Memory Summarization Engine
// ═══════════════════════════════════════════════════════════════

use super::models::MemoryEntry;

/// Summarization strategy
#[derive(Debug, Clone, Copy)]
pub enum SummaryStrategy {
    /// Extract key messages (first/last + high importance)
    KeyMessages,
    
    /// Semantic clustering + representatives
    Clustering,
    
    /// Simple concatenation + truncation
    Simple,
    
    /// AI-powered summarization (requires LLM)
    AIBased,
}

/// Summary result
#[derive(Debug, Clone)]
pub struct SummaryResult {
    /// Generated summary text
    pub summary: String,
    
    /// Number of entries processed
    pub entries_processed: usize,
    
    /// Strategy used
    pub strategy: SummaryStrategy,
    
    /// Processing time in milliseconds
    pub latency_ms: u64,
    
    /// Compression ratio (summary_len / original_len)
    pub compression_ratio: f32,
}

/// Summarize memory entries
/// 
/// Strategies:
/// - KeyMessages: Extract important messages
/// - Clustering: Group similar messages
/// - Simple: Concatenate + truncate
/// - AIBased: Use LLM (requires API) [TODO]
pub async fn summarize(entries: &[MemoryEntry], strategy: SummaryStrategy) -> Result<SummaryResult, String> {
    let start = std::time::Instant::now();
    
    if entries.is_empty() {
        return Ok(SummaryResult {
            summary: String::new(),
            entries_processed: 0,
            strategy,
            latency_ms: 0,
            compression_ratio: 0.0,
        });
    }
    
    let summary = match strategy {
        SummaryStrategy::KeyMessages => summarize_key_messages(entries),
        SummaryStrategy::Clustering => summarize_clustering(entries),
        SummaryStrategy::Simple => summarize_simple(entries),
        SummaryStrategy::AIBased => {
            // TODO: Implement AI-based summarization
            summarize_key_messages(entries) // Fallback
        }
    };
    
    let latency_ms = start.elapsed().as_millis() as u64;
    
    // Calculate compression ratio
    let original_len: usize = entries.iter().map(|e| e.content.len()).sum();
    let compression_ratio = if original_len > 0 {
        summary.len() as f32 / original_len as f32
    } else {
        0.0
    };
    
    Ok(SummaryResult {
        summary,
        entries_processed: entries.len(),
        strategy,
        latency_ms,
        compression_ratio,
    })
}

/// Extract key messages strategy
/// 
/// Logic:
/// 1. Take first 3 messages (conversation start)
/// 2. Take last 3 messages (recent context)
/// 3. Take top 5 high-importance messages (importance > 0.7)
fn summarize_key_messages(entries: &[MemoryEntry]) -> String {
    let mut key_entries = Vec::new();
    
    // First 3 messages
    let first_n = 3.min(entries.len());
    key_entries.extend_from_slice(&entries[..first_n]);
    
    // Last 3 messages (if different from first)
    if entries.len() > 6 {
        let last_n = 3;
        key_entries.extend_from_slice(&entries[entries.len() - last_n..]);
    }
    
    // High importance messages
    let mut important: Vec<&MemoryEntry> = entries
        .iter()
        .filter(|e| e.importance > 0.7)
        .collect();
    important.sort_by(|a, b| b.importance.partial_cmp(&a.importance).unwrap());
    
    for entry in important.iter().take(5) {
        key_entries.push((*entry).clone());
    }
    
    // Deduplicate by ID
    key_entries.sort_by(|a, b| a.timestamp.cmp(&b.timestamp));
    key_entries.dedup_by(|a, b| a.id == b.id);
    
    // Format summary
    format_summary(&key_entries)
}

/// Clustering strategy (simplified)
/// 
/// Groups messages by:
/// - User vs assistant
/// - Time windows (every 10 messages)
/// - Importance levels
fn summarize_clustering(entries: &[MemoryEntry]) -> String {
    let mut clusters: Vec<Vec<&MemoryEntry>> = Vec::new();
    
    // Group by role
    let user_msgs: Vec<&MemoryEntry> = entries.iter().filter(|e| e.role == "user").collect();
    let assistant_msgs: Vec<&MemoryEntry> = entries.iter().filter(|e| e.role == "assistant").collect();
    
    if !user_msgs.is_empty() {
        clusters.push(user_msgs);
    }
    if !assistant_msgs.is_empty() {
        clusters.push(assistant_msgs);
    }
    
    // Extract representatives
    let mut representatives = Vec::new();
    for cluster in clusters {
        if let Some(rep) = cluster.first() {
            representatives.push((*rep).clone());
        }
        if cluster.len() > 1 {
            if let Some(rep) = cluster.last() {
                representatives.push((*rep).clone());
            }
        }
    }
    
    format_summary(&representatives)
}

/// Simple strategy (concatenate + truncate)
fn summarize_simple(entries: &[MemoryEntry]) -> String {
    let max_messages = 50.min(entries.len());
    let recent: Vec<String> = entries
        .iter()
        .rev()
        .take(max_messages)
        .map(|e| format!("[{}] {}", e.role, e.content))
        .collect();
    
    let mut summary = recent.join("\n");
    
    // Truncate if too long (max 4000 chars)
    if summary.len() > 4000 {
        summary.truncate(4000);
        summary.push_str("\n...[truncated]");
    }
    
    summary
}

/// Format entries into readable summary
fn format_summary(entries: &[MemoryEntry]) -> String {
    entries
        .iter()
        .map(|e| {
            let timestamp = chrono::DateTime::from_timestamp_millis(e.timestamp)
                .map(|dt| dt.format("%H:%M:%S").to_string())
                .unwrap_or_else(|| "??:??:??".to_string());
            
            format!(
                "[{}] {} (importance: {:.2}): {}",
                timestamp,
                e.role,
                e.importance,
                truncate_text(&e.content, 100)
            )
        })
        .collect::<Vec<_>>()
        .join("\n")
}

/// Truncate text to max length
fn truncate_text(text: &str, max_len: usize) -> String {
    if text.len() <= max_len {
        text.to_string()
    } else {
        format!("{}...", &text[..max_len])
    }
}

// ═══════════════════════════════════════════════════════════════
//   FUTURE: AI-BASED SUMMARIZATION
// ═══════════════════════════════════════════════════════════════

/*
TODO: Integrate LLM for intelligent summarization

pub async fn summarize_ai(entries: &[MemoryEntry], llm_api: &str) -> Result<String, String> {
    use reqwest;
    use serde_json::json;
    
    // Prepare context
    let context = entries
        .iter()
        .map(|e| format!("{}: {}", e.role, e.content))
        .collect::<Vec<_>>()
        .join("\n");
    
    let prompt = format!(
        "Summarize the following conversation in 3-5 sentences, \
         focusing on key decisions and important information:\n\n{}",
        context
    );
    
    // Call LLM API
    let client = reqwest::Client::new();
    let response = client
        .post(llm_api)
        .json(&json!({
            "prompt": prompt,
            "max_tokens": 200,
            "temperature": 0.3
        }))
        .send()
        .await
        .map_err(|e| format!("API request failed: {}", e))?;
    
    let data: serde_json::Value = response.json().await
        .map_err(|e| format!("Failed to parse response: {}", e))?;
    
    let summary = data["summary"].as_str()
        .ok_or("Invalid response format")?
        .to_string();
    
    Ok(summary)
}
*/

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_summarize_empty() {
        let entries: Vec<MemoryEntry> = Vec::new();
        let result = summarize(&entries, SummaryStrategy::Simple).await;
        
        assert!(result.is_ok());
        let summary = result.unwrap();
        assert_eq!(summary.entries_processed, 0);
        assert!(summary.summary.is_empty());
    }

    #[tokio::test]
    async fn test_summarize_key_messages() {
        let entries: Vec<MemoryEntry> = (0..10)
            .map(|i| MemoryEntry {
                id: format!("msg_{}", i),
                content: format!("Message {}", i),
                role: if i % 2 == 0 { "user" } else { "assistant" }.to_string(),
                importance: if i == 5 { 0.9 } else { 0.5 },
                ..Default::default()
            })
            .collect();
        
        let result = summarize(&entries, SummaryStrategy::KeyMessages).await;
        
        assert!(result.is_ok());
        let summary = result.unwrap();
        assert_eq!(summary.entries_processed, 10);
        assert!(!summary.summary.is_empty());
        assert!(summary.compression_ratio < 1.0);
    }

    #[tokio::test]
    async fn test_summarize_simple() {
        let entries: Vec<MemoryEntry> = (0..5)
            .map(|i| MemoryEntry {
                id: format!("msg_{}", i),
                content: format!("Content {}", i),
                role: "user".to_string(),
                ..Default::default()
            })
            .collect();
        
        let result = summarize(&entries, SummaryStrategy::Simple).await;
        
        assert!(result.is_ok());
        let summary = result.unwrap();
        assert!(summary.summary.contains("Content"));
        assert_eq!(summary.entries_processed, 5);
    }

    #[tokio::test]
    async fn test_summarize_clustering() {
        let entries: Vec<MemoryEntry> = vec![
            MemoryEntry {
                id: "1".to_string(),
                content: "User message 1".to_string(),
                role: "user".to_string(),
                ..Default::default()
            },
            MemoryEntry {
                id: "2".to_string(),
                content: "Assistant message 1".to_string(),
                role: "assistant".to_string(),
                ..Default::default()
            },
            MemoryEntry {
                id: "3".to_string(),
                content: "User message 2".to_string(),
                role: "user".to_string(),
                ..Default::default()
            },
        ];
        
        let result = summarize(&entries, SummaryStrategy::Clustering).await;
        
        assert!(result.is_ok());
        let summary = result.unwrap();
        assert!(summary.summary.contains("user") || summary.summary.contains("assistant"));
    }

    #[test]
    fn test_truncate_text() {
        let text = "This is a long text that needs truncation";
        let truncated = truncate_text(text, 10);
        
        assert_eq!(truncated.len(), 13); // 10 + "..."
        assert!(truncated.ends_with("..."));
    }

    #[test]
    fn test_truncate_text_short() {
        let text = "Short";
        let truncated = truncate_text(text, 10);
        
        assert_eq!(truncated, "Short");
    }
}
