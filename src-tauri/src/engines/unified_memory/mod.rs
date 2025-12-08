// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Unified Memory Engine v2
//   SUPER PROMPT #6 vΩ.8 — Main Memory Orchestrator
// ═══════════════════════════════════════════════════════════════

pub mod models;
pub mod stm;
pub mod mtm;
pub mod ltm;
pub mod vector_store;
pub mod embeddings;
pub mod summarizer;
pub mod api;

use models::{MemoryBundle, MemoryEntry, MemoryId, MemoryKind};
use stm::ShortTermMemory;
use mtm::MidTermMemory;
use ltm::LongTermMemory;
use vector_store::VectorStore;
use embeddings::{embed_text, EmbeddingProvider};
use summarizer::{summarize, SummaryStrategy};

/// Unified Memory Engine v2 — Central memory orchestrator
/// 
/// Architecture:
/// ```
/// ┌─────────────────────────────────────────────┐
/// │  STM (Short-Term)                          │
/// │  • FIFO buffer (100 messages)              │
/// │  • O(1) push/pop                           │
/// │  • Current conversation context            │
/// ├─────────────────────────────────────────────┤
/// │  MTM (Mid-Term)                            │
/// │  • Rolling summaries (300 messages)        │
/// │  • Semantic clustering                     │
/// │  • Embeddings cache                        │
/// ├─────────────────────────────────────────────┤
/// │  LTM (Long-Term)                           │
/// │  • Persistent storage (10k+ messages)      │
/// │  • Tantivy-ready indexing                  │
/// │  • Hybrid search (lexical + semantic)      │
/// ├─────────────────────────────────────────────┤
/// │  VectorStore                               │
/// │  • 384D embeddings (all-MiniLM-L6-v2)      │
/// │  • kNN search                              │
/// │  • Cosine similarity                       │
/// └─────────────────────────────────────────────┘
/// ```
pub struct UnifiedMemoryEngine {
    /// Short-term memory (conversation buffer)
    stm: ShortTermMemory,
    
    /// Mid-term memory (active session)
    mtm: MidTermMemory,
    
    /// Long-term memory (persistent)
    ltm: LongTermMemory,
    
    /// Vector store (embeddings)
    vectors: VectorStore,
    
    /// Embedding provider
    embedding_provider: EmbeddingProvider,
    
    /// Auto-summarization enabled
    auto_summarize: bool,
    
    /// Promotion thresholds
    stm_to_mtm_threshold: u32,  // Access count
    mtm_to_ltm_age_ms: i64,     // Age in milliseconds
}

impl UnifiedMemoryEngine {
    /// Create new Unified Memory Engine with defaults
    pub fn new() -> Self {
        Self {
            stm: ShortTermMemory::default(),
            mtm: MidTermMemory::default(),
            ltm: LongTermMemory::default(),
            vectors: VectorStore::default(),
            embedding_provider: EmbeddingProvider::Local,
            auto_summarize: true,
            stm_to_mtm_threshold: 3,
            mtm_to_ltm_age_ms: 3_600_000, // 1 hour
        }
    }
    
    /// Create with custom capacities
    pub fn with_capacities(stm_size: usize, mtm_size: usize, ltm_size: usize) -> Self {
        Self {
            stm: ShortTermMemory::new(stm_size),
            mtm: MidTermMemory::new(mtm_size),
            ltm: LongTermMemory::new(ltm_size),
            vectors: VectorStore::default(),
            embedding_provider: EmbeddingProvider::Local,
            auto_summarize: true,
            stm_to_mtm_threshold: 3,
            mtm_to_ltm_age_ms: 3_600_000,
        }
    }
    
    // ═══════════════════════════════════════════════════════════
    //   CORE API — Store & Recall
    // ═══════════════════════════════════════════════════════════
    
    /// Recall memories from all tiers
    /// 
    /// Priority:
    /// 1. STM — Current conversation (always included)
    /// 2. MTM — Active session (if query matches)
    /// 3. LTM — Persistent knowledge (semantic search)
    pub async fn recall(&mut self, query: &str, max_results: usize) -> Result<MemoryBundle, String> {
        let mut bundle = MemoryBundle::default();
        
        // 1. Get all STM (current conversation context)
        bundle.stm = self.stm.recent(50); // Last 50 messages
        
        // 2. Search MTM (active session memories)
        let mtm_results = self.mtm.search(query);
        bundle.mtm = mtm_results.into_iter().take(20).collect();
        
        // 3. Search LTM (semantic + lexical)
        if let Ok(query_embedding) = embed_text(query).await {
            bundle.ltm = self.ltm.search_hybrid(
                query,
                Some(&query_embedding),
                max_results,
                0.5, // 50% lexical, 50% semantic
            );
        } else {
            // Fallback to lexical only
            bundle.ltm = self.ltm.search(query, max_results);
        }
        
        bundle.total = bundle.stm.len() + bundle.mtm.len() + bundle.ltm.len();
        
        Ok(bundle)
    }
    
    /// Store new memory entry
    /// 
    /// Flow:
    /// 1. Generate embedding
    /// 2. Add to STM
    /// 3. Cache in VectorStore
    /// 4. Auto-promote if needed
    pub async fn store(&mut self, content: String, role: String, importance: f32) -> Result<MemoryId, String> {
        // Generate embedding
        let embedding = embed_text(&content).await.ok();
        
        // Create entry
        let entry = MemoryEntry {
            id: uuid::Uuid::new_v4().to_string(),
            timestamp: chrono::Utc::now().timestamp_millis(),
            role,
            content: content.clone(),
            embedding: embedding.clone(),
            importance,
            access_count: 0,
            last_accessed: 0,
            kind: MemoryKind::Conversation,
            tags: Vec::new(),
        };
        
        let id = entry.id.clone();
        
        // Add to VectorStore
        if let Some(emb) = &embedding {
            let _ = self.vectors.add(id.clone(), emb.clone());
        }
        
        // Add to STM
        self.stm.push(entry.clone());
        
        // Auto-promote if STM is full
        if self.stm.is_full() {
            self.promote_stm_to_mtm().await?;
        }
        
        // Auto-summarize if enabled
        if self.auto_summarize && self.stm.len() % 20 == 0 {
            self.summarize().await?;
        }
        
        Ok(id)
    }
    
    /// Embed text using configured provider
    pub async fn embed(&self, text: &str) -> Result<Vec<f32>, String> {
        embed_text(text).await
    }
    
    /// Summarize current MTM state
    pub async fn summarize(&mut self) -> Result<String, String> {
        let entries = self.mtm.list();
        let result = summarize(&entries, SummaryStrategy::KeyMessages).await?;
        
        self.mtm.update_summary(&entries);
        
        Ok(result.summary)
    }
    
    // ═══════════════════════════════════════════════════════════
    //   PROMOTION LOGIC — STM → MTM → LTM
    // ═══════════════════════════════════════════════════════════
    
    /// Promote STM entries to MTM
    /// 
    /// Criteria:
    /// - Access count > threshold (default: 3)
    /// - High importance (> 0.7)
    /// - STM is full
    async fn promote_stm_to_mtm(&mut self) -> Result<(), String> {
        let promoted = self.stm.promote_if(|entry| {
            entry.access_count >= self.stm_to_mtm_threshold || entry.importance > 0.7
        });
        
        for entry in promoted {
            self.mtm.push(entry);
        }
        
        Ok(())
    }
    
    /// Promote MTM entries to LTM
    /// 
    /// Criteria:
    /// - Age > threshold (default: 1 hour)
    /// - Importance > 0.5
    async fn promote_mtm_to_ltm(&mut self) -> Result<(), String> {
        let old_entries = self.mtm.get_old_entries(self.mtm_to_ltm_age_ms);
        
        let demoted = self.mtm.demote_if(|entry| {
            old_entries.iter().any(|e| e.id == entry.id) && entry.importance > 0.5
        });
        
        for entry in demoted {
            self.ltm.insert(entry)?;
        }
        
        Ok(())
    }
    
    /// Tick — Periodic maintenance
    /// 
    /// Runs:
    /// - STM → MTM promotion
    /// - MTM → LTM promotion
    /// - Auto-summarization
    pub async fn tick(&mut self) -> Result<(), String> {
        self.promote_stm_to_mtm().await?;
        self.promote_mtm_to_ltm().await?;
        
        if self.auto_summarize {
            self.summarize().await?;
        }
        
        Ok(())
    }
    
    // ═══════════════════════════════════════════════════════════
    //   METRICS & DIAGNOSTICS
    // ═══════════════════════════════════════════════════════════
    
    /// Get memory statistics
    pub fn stats(&self) -> MemoryStats {
        MemoryStats {
            stm_count: self.stm.len(),
            mtm_count: self.mtm.len(),
            ltm_count: self.ltm.len(),
            vector_count: self.vectors.len(),
            stm_capacity: self.stm.capacity(),
            mtm_capacity: self.mtm.capacity(),
            ltm_capacity: self.ltm.capacity(),
            stm_usage: self.stm.usage(),
            mtm_usage: self.mtm.usage(),
            ltm_usage: self.ltm.usage(),
            total_memories: (self.stm.len() + self.mtm.len() + self.ltm.len()) as u64,
            summary_version: self.mtm.summary_version(),
        }
    }
    
    /// Get current summary
    pub fn get_summary(&self) -> &str {
        self.mtm.get_summary()
    }
    
    /// Clear all memories (dangerous!)
    pub fn clear_all(&mut self) {
        self.stm.clear();
        self.mtm.clear();
        self.ltm.clear();
        self.vectors.clear();
    }
}

/// Memory statistics
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct MemoryStats {
    pub stm_count: usize,
    pub mtm_count: usize,
    pub ltm_count: usize,
    pub vector_count: usize,
    pub stm_capacity: usize,
    pub mtm_capacity: usize,
    pub ltm_capacity: usize,
    pub stm_usage: f32,
    pub mtm_usage: f32,
    pub ltm_usage: f32,
    pub total_memories: u64,
    pub summary_version: u32,
}

impl Default for UnifiedMemoryEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_engine_creation() {
        let engine = UnifiedMemoryEngine::new();
        let stats = engine.stats();
        
        assert_eq!(stats.stm_count, 0);
        assert_eq!(stats.mtm_count, 0);
        assert_eq!(stats.ltm_count, 0);
    }

    #[tokio::test]
    async fn test_store_and_recall() {
        let mut engine = UnifiedMemoryEngine::new();
        
        // Store memories
        let id1 = engine.store(
            "Hello world".to_string(),
            "user".to_string(),
            0.5,
        ).await.unwrap();
        
        let id2 = engine.store(
            "How are you?".to_string(),
            "user".to_string(),
            0.6,
        ).await.unwrap();
        
        assert_eq!(engine.stats().stm_count, 2);
        
        // Recall
        let bundle = engine.recall("hello", 10).await.unwrap();
        assert!(bundle.stm.len() > 0);
    }

    #[tokio::test]
    async fn test_promotion_stm_to_mtm() {
        let mut engine = UnifiedMemoryEngine::with_capacities(5, 10, 100);
        
        // Fill STM beyond capacity
        for i in 0..10 {
            engine.store(
                format!("Message {}", i),
                "user".to_string(),
                0.8,
            ).await.unwrap();
        }
        
        // STM should be capped, MTM should have promoted entries
        let stats = engine.stats();
        assert!(stats.stm_count <= 5);
        assert!(stats.mtm_count > 0);
    }

    #[tokio::test]
    async fn test_summarization() {
        let mut engine = UnifiedMemoryEngine::new();
        
        for i in 0..5 {
            engine.store(
                format!("Test message {}", i),
                "user".to_string(),
                0.5,
            ).await.unwrap();
        }
        
        let summary = engine.summarize().await.unwrap();
        assert!(!summary.is_empty());
    }

    #[tokio::test]
    async fn test_tick() {
        let mut engine = UnifiedMemoryEngine::new();
        
        // Add some memories
        for i in 0..10 {
            engine.store(
                format!("Message {}", i),
                "user".to_string(),
                0.7,
            ).await.unwrap();
        }
        
        // Run tick
        let result = engine.tick().await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_embed() {
        let engine = UnifiedMemoryEngine::new();
        
        let result = engine.embed("Test text").await;
        assert!(result.is_ok());
        
        let embedding = result.unwrap();
        assert_eq!(embedding.len(), 384);
    }
}
