// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1 — MEMORY INSPECTOR
//   DevTools OS — Memory system exploration and debugging
//   Super Prompt #9: STM/MTM/LTM inspection, search, export
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// A memory entry for inspection/export
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryEntry {
    /// Unique identifier
    pub id: String,
    /// Content of the memory
    pub content: String,
    /// Memory layer (STM, MTM, LTM)
    pub layer: MemoryLayer,
    /// Importance score (0.0 - 1.0)
    pub importance: f32,
    /// Creation timestamp
    pub created_at: u64,
    /// Last access timestamp
    pub accessed_at: u64,
    /// Access count
    pub access_count: u32,
    /// Semantic tags
    pub tags: Vec<String>,
    /// Associated conversation ID
    pub conversation_id: Option<String>,
    /// Embedding vector (if available)
    pub embedding: Option<Vec<f32>>,
}

/// Memory layer identifier
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum MemoryLayer {
    STM, // Short-Term Memory
    MTM, // Medium-Term Memory
    LTM, // Long-Term Memory
}

impl std::fmt::Display for MemoryLayer {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            MemoryLayer::STM => write!(f, "STM"),
            MemoryLayer::MTM => write!(f, "MTM"),
            MemoryLayer::LTM => write!(f, "LTM"),
        }
    }
}

/// Memory statistics for a layer
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LayerStats {
    pub layer: MemoryLayer,
    pub total_entries: usize,
    pub total_size_bytes: usize,
    pub avg_importance: f32,
    pub oldest_entry_age_ms: u64,
    pub newest_entry_age_ms: u64,
    pub top_tags: Vec<(String, usize)>,
}

/// Overall memory system statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemorySystemStats {
    pub stm: LayerStats,
    pub mtm: LayerStats,
    pub ltm: LayerStats,
    pub total_entries: usize,
    pub total_size_bytes: usize,
    pub embeddings_count: usize,
    pub indexed_count: usize,
}

/// Search result from memory
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemorySearchResult {
    pub entry: MemoryEntry,
    pub score: f32,
    pub match_type: MatchType,
}

/// Type of match in search
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MatchType {
    /// Exact text match
    Exact,
    /// Partial/fuzzy text match
    Fuzzy,
    /// Semantic similarity match
    Semantic,
    /// Tag match
    Tag,
}

/// Memory bundle for export
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryBundle {
    pub stm_entries: Vec<MemoryEntry>,
    pub mtm_summary: String,
    pub ltm_entries: Vec<MemoryEntry>,
    pub stats: MemorySystemStats,
    pub export_timestamp: u64,
}

/// Memory Inspector for DevTools OS
///
/// Provides non-intrusive inspection of the UnifiedMemory system
/// for debugging and visualization purposes.
pub struct MemoryInspector {
    /// Cache of recent inspections
    cache_enabled: bool,
}

impl MemoryInspector {
    /// Create a new MemoryInspector
    pub fn new() -> Self {
        Self {
            cache_enabled: true,
        }
    }

    /// Export all STM entries
    ///
    /// Returns a vector of all current Short-Term Memory entries
    pub async fn export_stm(&self) -> Vec<MemoryEntry> {
        // In a real implementation, this would access the UnifiedMemory
        // For now, return mock data structure
        Vec::new()
    }

    /// Export MTM summary
    ///
    /// Returns a consolidated summary of Medium-Term Memory
    pub async fn export_mtm(&self) -> String {
        // In a real implementation, this would access the UnifiedMemory
        "MTM Summary: No data available".to_string()
    }

    /// Export LTM entries
    ///
    /// Returns entries from Long-Term Memory (may be limited)
    pub async fn export_ltm(&self, limit: Option<usize>) -> Vec<MemoryEntry> {
        let _limit = limit.unwrap_or(100);
        // In a real implementation, this would access the UnifiedMemory/LTM storage
        Vec::new()
    }

    /// Export full memory bundle
    pub async fn export_all(&self) -> MemoryBundle {
        let now = chrono::Utc::now().timestamp_millis() as u64;

        MemoryBundle {
            stm_entries: self.export_stm().await,
            mtm_summary: self.export_mtm().await,
            ltm_entries: self.export_ltm(Some(100)).await,
            stats: self.get_stats().await,
            export_timestamp: now,
        }
    }

    /// Search memory using text query
    pub async fn search(&self, query: &str, limit: Option<usize>) -> Vec<MemorySearchResult> {
        let _query = query;
        let _limit = limit.unwrap_or(20);
        // In a real implementation, this would search across all memory layers
        Vec::new()
    }

    /// K-Nearest Neighbors search using embeddings
    pub async fn knn(&self, text: &str, k: Option<usize>) -> Vec<MemorySearchResult> {
        let _text = text;
        let _k = k.unwrap_or(5);
        // In a real implementation, this would:
        // 1. Generate embedding for the query text
        // 2. Find K nearest neighbors in vector space
        Vec::new()
    }

    /// Search by tags
    pub async fn search_by_tags(&self, tags: Vec<String>) -> Vec<MemoryEntry> {
        let _tags = tags;
        // In a real implementation, this would search entries with matching tags
        Vec::new()
    }

    /// Get a specific memory entry by ID
    pub async fn get_entry(&self, id: &str) -> Option<MemoryEntry> {
        let _id = id;
        // In a real implementation, this would lookup the entry
        None
    }

    /// Get entries by conversation ID
    pub async fn get_by_conversation(&self, conversation_id: &str) -> Vec<MemoryEntry> {
        let _conversation_id = conversation_id;
        // In a real implementation, this would filter by conversation
        Vec::new()
    }

    /// Get memory statistics
    pub async fn get_stats(&self) -> MemorySystemStats {
        let now = chrono::Utc::now().timestamp_millis() as u64;

        // Default empty stats - in real implementation, compute from actual memory
        MemorySystemStats {
            stm: LayerStats {
                layer: MemoryLayer::STM,
                total_entries: 0,
                total_size_bytes: 0,
                avg_importance: 0.0,
                oldest_entry_age_ms: 0,
                newest_entry_age_ms: now,
                top_tags: Vec::new(),
            },
            mtm: LayerStats {
                layer: MemoryLayer::MTM,
                total_entries: 0,
                total_size_bytes: 0,
                avg_importance: 0.0,
                oldest_entry_age_ms: 0,
                newest_entry_age_ms: now,
                top_tags: Vec::new(),
            },
            ltm: LayerStats {
                layer: MemoryLayer::LTM,
                total_entries: 0,
                total_size_bytes: 0,
                avg_importance: 0.0,
                oldest_entry_age_ms: 0,
                newest_entry_age_ms: now,
                top_tags: Vec::new(),
            },
            total_entries: 0,
            total_size_bytes: 0,
            embeddings_count: 0,
            indexed_count: 0,
        }
    }

    /// Get layer-specific statistics
    pub async fn get_layer_stats(&self, layer: MemoryLayer) -> LayerStats {
        let stats = self.get_stats().await;
        match layer {
            MemoryLayer::STM => stats.stm,
            MemoryLayer::MTM => stats.mtm,
            MemoryLayer::LTM => stats.ltm,
        }
    }

    /// Get tag distribution across all memory
    pub async fn get_tag_distribution(&self) -> HashMap<String, usize> {
        // In a real implementation, aggregate tags from all layers
        HashMap::new()
    }

    /// Get memory timeline (entries over time)
    pub async fn get_timeline(&self, from: u64, to: u64) -> Vec<MemoryEntry> {
        let _from = from;
        let _to = to;
        // In a real implementation, filter entries by timestamp range
        Vec::new()
    }

    /// Analyze memory health
    pub async fn health_check(&self) -> MemoryHealthReport {
        let stats = self.get_stats().await;

        // Compute health metrics
        let stm_utilization = if stats.stm.total_entries > 0 {
            (stats.stm.total_entries as f32 / 100.0).min(1.0)
        } else {
            0.0
        };

        let mtm_utilization = if stats.mtm.total_entries > 0 {
            (stats.mtm.total_entries as f32 / 500.0).min(1.0)
        } else {
            0.0
        };

        let mut warnings = Vec::new();
        let mut suggestions = Vec::new();

        // Check for potential issues
        if stm_utilization > 0.9 {
            warnings.push("STM near capacity - consolidation may be needed".to_string());
        }

        if stats.embeddings_count == 0 && stats.total_entries > 0 {
            suggestions.push("Consider enabling embeddings for semantic search".to_string());
        }

        if stats.indexed_count < stats.ltm.total_entries {
            suggestions.push("Some LTM entries are not indexed".to_string());
        }

        let health_score = calculate_health_score(&stats, &warnings);

        MemoryHealthReport {
            health_score,
            stm_utilization,
            mtm_utilization,
            warnings,
            suggestions,
            stats,
        }
    }

    /// Enable/disable caching
    pub fn set_cache_enabled(&mut self, enabled: bool) {
        self.cache_enabled = enabled;
    }
}

impl Default for MemoryInspector {
    fn default() -> Self {
        Self::new()
    }
}

/// Memory health report
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryHealthReport {
    /// Overall health score (0.0 - 1.0)
    pub health_score: f32,
    /// STM utilization (0.0 - 1.0)
    pub stm_utilization: f32,
    /// MTM utilization (0.0 - 1.0)
    pub mtm_utilization: f32,
    /// Warning messages
    pub warnings: Vec<String>,
    /// Improvement suggestions
    pub suggestions: Vec<String>,
    /// Current statistics
    pub stats: MemorySystemStats,
}

/// Calculate health score from stats and warnings
fn calculate_health_score(stats: &MemorySystemStats, warnings: &[String]) -> f32 {
    let mut score = 1.0;

    // Deduct for warnings
    score -= warnings.len() as f32 * 0.1;

    // Bonus for having indexed entries
    if stats.indexed_count > 0 {
        score += 0.05;
    }

    // Bonus for having embeddings
    if stats.embeddings_count > 0 {
        score += 0.05;
    }

    score.clamp(0.0, 1.0)
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_inspector_creation() {
        let inspector = MemoryInspector::new();
        assert!(inspector.cache_enabled);
    }

    #[tokio::test]
    async fn test_export_stm() {
        let inspector = MemoryInspector::new();
        let entries = inspector.export_stm().await;
        // Empty for now, but should not panic
        assert!(entries.is_empty());
    }

    #[tokio::test]
    async fn test_get_stats() {
        let inspector = MemoryInspector::new();
        let stats = inspector.get_stats().await;
        assert_eq!(stats.total_entries, 0);
    }

    #[tokio::test]
    async fn test_health_check() {
        let inspector = MemoryInspector::new();
        let report = inspector.health_check().await;
        assert!(report.health_score >= 0.0);
        assert!(report.health_score <= 1.0);
    }

    #[tokio::test]
    async fn test_export_bundle() {
        let inspector = MemoryInspector::new();
        let bundle = inspector.export_all().await;
        assert!(bundle.export_timestamp > 0);
    }

    #[test]
    fn test_memory_layer_display() {
        assert_eq!(format!("{}", MemoryLayer::STM), "STM");
        assert_eq!(format!("{}", MemoryLayer::MTM), "MTM");
        assert_eq!(format!("{}", MemoryLayer::LTM), "LTM");
    }
}
