// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Memory Bridge v∞
//   Pont entre Singularity et Unified Memory
// ═══════════════════════════════════════════════════════════════

use crate::engines::unified_memory::UnifiedMemoryEngine;
use crate::singularity_cortex::state::SingularityState;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncResult {
    pub items_synced: usize,
    pub items_filtered: usize,
    pub avg_relevance: f32,
    pub duration_ms: u64,
    pub status: SyncStatus,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum SyncStatus {
    Success,
    PartialSuccess,
    Failed,
}

#[derive(Debug, Clone)]
pub struct MemoryFilter {
    pub min_relevance: f32,
    pub min_content_length: usize,
    pub filter_system: bool,
    pub filter_empty: bool,
}

impl Default for MemoryFilter {
    fn default() -> Self {
        Self {
            min_relevance: 0.3,
            min_content_length: 5,
            filter_system: false,
            filter_empty: true,
        }
    }
}

pub struct MemoryBridge;

impl MemoryBridge {
    pub async fn sync_to_memory(
        state: &mut SingularityState,
        memory: &mut UnifiedMemoryEngine,
        filter: &MemoryFilter,
    ) -> Result<SyncResult, String> {
        let start = std::time::Instant::now();
        
        let recent_context = state.get_recent_context(20);
        let mut items_synced = 0;
        let mut items_filtered = 0;
        let mut relevance_scores = Vec::new();
        
        for (idx, content) in recent_context.iter().enumerate() {
            let relevance = Self::evaluate_relevance(content, state);
            relevance_scores.push(relevance);
            
            if Self::should_filter(content, relevance, filter) {
                items_filtered += 1;
                continue;
            }
            
            let role = if idx % 2 == 0 { "user" } else { "assistant" };
            memory.store(content.clone(), role.to_string(), 0.5).await.map_err(|e| format!("Memory store failed: {}", e))?;
            items_synced += 1;
        }
        
        let duration_ms = start.elapsed().as_millis() as u64;
        let avg_relevance = if relevance_scores.is_empty() { 0.0 } else { relevance_scores.iter().sum::<f32>() / relevance_scores.len() as f32 };
        
        let status = if items_synced > 0 {
            if items_filtered > items_synced { SyncStatus::PartialSuccess } else { SyncStatus::Success }
        } else {
            SyncStatus::Failed
        };
        
        Ok(SyncResult { items_synced, items_filtered, avg_relevance, duration_ms, status })
    }
    
    pub async fn sync_from_memory(
        state: &mut SingularityState,
        memory: &mut UnifiedMemoryEngine,
    ) -> Result<SyncResult, String> {
        let start = std::time::Instant::now();
        
        let bundle = memory.recall("", 10).await.map_err(|e| format!("Memory recall failed: {}", e))?;
        let mut items_synced = 0;
        
        for entry in bundle.stm.iter() {
            let summary = format!("[{}] {}", entry.role, entry.content.chars().take(100).collect::<String>());
            if !state.long_context.iter().any(|c| c.contains(&entry.content[..20.min(entry.content.len())])) {
                state.push_context(summary);
                items_synced += 1;
            }
        }
        
        let duration_ms = start.elapsed().as_millis() as u64;
        
        Ok(SyncResult {
            items_synced,
            items_filtered: 0,
            avg_relevance: 1.0,
            duration_ms,
            status: if items_synced > 0 { SyncStatus::Success } else { SyncStatus::PartialSuccess },
        })
    }
    
    fn evaluate_relevance(content: &str, state: &SingularityState) -> f32 {
        let mut score = 0.0;
        
        let length_score = (content.len() as f32 / 200.0).min(1.0);
        score += length_score * 0.3;
        
        let words: Vec<&str> = content.split_whitespace().collect();
        let unique_words: std::collections::HashSet<&str> = words.iter().copied().collect();
        let diversity = if words.is_empty() { 0.0 } else { unique_words.len() as f32 / words.len() as f32 };
        score += diversity * 0.4;
        
        let has_positive = content.to_lowercase().contains("bon") || content.to_lowercase().contains("bien") || content.to_lowercase().contains("excellent");
        let has_negative = content.to_lowercase().contains("erreur") || content.to_lowercase().contains("problème") || content.to_lowercase().contains("échec");
        
        let tone_match = if state.affective_tone > 0.0 && has_positive {
            1.0
        } else if state.affective_tone < 0.0 && has_negative {
            1.0
        } else if state.affective_tone.abs() < 0.1 {
            0.8
        } else {
            0.5
        };
        
        score += tone_match * 0.3;
        score.clamp(0.0, 1.0)
    }
    
    fn should_filter(content: &str, relevance: f32, filter: &MemoryFilter) -> bool {
        if filter.filter_empty && content.trim().is_empty() {
            return true;
        }
        if content.len() < filter.min_content_length {
            return true;
        }
        if relevance < filter.min_relevance {
            return true;
        }
        if filter.filter_system && content.to_lowercase().starts_with("system:") {
            return true;
        }
        false
    }
}
