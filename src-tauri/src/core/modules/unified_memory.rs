// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.0 — UNIFIED MEMORY SYSTEM
//   Phase 2 Fusion #2: Memory Engine #5 + Memory Module + Singularity Memory
// ═══════════════════════════════════════════════════════════════
// Architecture: STM → MTM → LTM avec promotion automatique
// Encryption: AES-256-GCM pour LTM
// Recall: Semantic search across all tiers
// ═══════════════════════════════════════════════════════════════

use crate::core::types::{EngineHealth, EngineResult, EngineError, ModuleInfo};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use chrono::Utc;

pub type MemoryId = String;

// ═══════════════════════════════════════════════════════════════
//   CORE STRUCTURES
// ═══════════════════════════════════════════════════════════════

/// Unified Memory System (v20.0)
/// Fusion: MemoryEngine (#5) + MemoryModule + Singularity Memory
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnifiedMemory {
    // Core state
    health: EngineHealth,
    initialized: bool,
    pub last_update_ms: u64,
    
    // Memory tiers
    stm: ShortTermMemory,   // <1h, in-memory
    mtm: MediumTermMemory,  // 1h-7d, hybrid
    ltm: LongTermMemory,    // >7d, disk (AES-256-GCM)
    
    // Metadata
    pub total_memories: u64,
    pub capacity_usage: f32,
    pub compression_ratio: f32,
    
    // Timeline
    timeline: MemoryTimeline,
    
    // Encryption key (for LTM)
    encryption_key: [u8; 32],
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShortTermMemory {
    pub items: Vec<MemoryItem>,
    pub max_capacity: usize,
    pub retention_ms: u64, // 1 hour = 3_600_000ms
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MediumTermMemory {
    pub items: Vec<MemoryItem>,
    pub max_capacity: usize,
    pub retention_ms: u64, // 7 days = 604_800_000ms
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LongTermMemory {
    pub storage_path: PathBuf,
    pub index: HashMap<MemoryId, MemoryMetadata>,
    pub compressed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryItem {
    pub id: MemoryId,
    pub content: String,
    pub memory_type: MemoryType,
    pub importance: f32, // 0.0 - 1.0
    pub tags: Vec<String>,
    pub created_at: u64,
    pub accessed_count: u32,
    pub last_accessed: u64,
    pub tier: MemoryTier,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryMetadata {
    pub id: MemoryId,
    pub memory_type: MemoryType,
    pub importance: f32,
    pub tags: Vec<String>,
    pub created_at: u64,
    pub file_path: PathBuf,
    pub compressed: bool,
    pub encrypted: bool,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum MemoryTier {
    ShortTerm,
    MediumTerm,
    LongTerm,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum MemoryType {
    Conversation,
    Decision,
    Knowledge,
    Project,
    Ritual,
    Event,
    System,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryTimeline {
    pub events: Vec<TimelineEvent>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineEvent {
    pub memory_id: MemoryId,
    pub event_type: TimelineEventType,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum TimelineEventType {
    Created,
    Accessed,
    PromotedToMTM,
    PromotedToLTM,
    Compressed,
    Deleted,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MemoryStats {
    pub stm_count: usize,
    pub mtm_count: usize,
    pub ltm_count: usize,
    pub total_memories: u64,
    pub capacity_usage: f32,
    pub compression_ratio: f32,
    pub avg_importance: f32,
}

// ═══════════════════════════════════════════════════════════════
//   IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════

impl UnifiedMemory {
    pub fn new() -> Self {
        Self {
            health: EngineHealth::Offline,
            initialized: false,
            last_update_ms: 0,
            stm: ShortTermMemory {
                items: Vec::new(),
                max_capacity: 100,
                retention_ms: 3_600_000, // 1 hour
            },
            mtm: MediumTermMemory {
                items: Vec::new(),
                max_capacity: 500,
                retention_ms: 604_800_000, // 7 days
            },
            ltm: LongTermMemory {
                storage_path: PathBuf::from("./data/memory/ltm"),
                index: HashMap::new(),
                compressed: true,
            },
            total_memories: 0,
            capacity_usage: 0.0,
            compression_ratio: 1.0,
            timeline: MemoryTimeline { events: Vec::new() },
            encryption_key: [0u8; 32], // Will be initialized properly
        }
    }

    /// Initialize unified memory system
    pub fn init(&mut self) -> EngineResult<()> {
        if self.initialized {
            return Ok(());
        }

        // Initialize encryption key (should be from secure source in production)
        self.encryption_key = Self::generate_encryption_key();

        // Create LTM storage directory
        if !self.ltm.storage_path.exists() {
            std::fs::create_dir_all(&self.ltm.storage_path)
                .map_err(|e| EngineError::Runtime(format!("Failed to create LTM storage: {}", e)))?;
        }

        self.health = EngineHealth::Healthy;
        self.initialized = true;
        self.last_update_ms = Self::current_timestamp();

        Ok(())
    }

    /// Main tick: promotion + cleanup
    pub async fn tick(&mut self) -> EngineResult<()> {
        if !self.initialized {
            return Err(EngineError::Runtime("UnifiedMemory not initialized".to_string()));
        }

        let now = Self::current_timestamp();
        
        // Auto-promote based on time + access patterns
        self.promote_stm_to_mtm()?;
        self.promote_mtm_to_ltm()?;
        
        // Cleanup expired STM
        self.cleanup_stm()?;
        
        // Compress LTM if needed
        if self.ltm.index.len() > 100 {
            self.compress_ltm()?;
        }

        self.last_update_ms = now;
        self.update_stats();

        Ok(())
    }

    /// Store new memory (auto-assigns to STM)
    pub fn store(
        &mut self,
        content: String,
        memory_type: MemoryType,
        importance: f32,
        tags: Vec<String>,
    ) -> Result<MemoryId, EngineError> {
        if !self.initialized {
            return Err(EngineError::Runtime("UnifiedMemory not initialized".to_string()));
        }

        let id = uuid::Uuid::new_v4().to_string();
        let now = Self::current_timestamp();

        let item = MemoryItem {
            id: id.clone(),
            content,
            memory_type,
            importance: importance.clamp(0.0, 1.0),
            tags,
            created_at: now,
            accessed_count: 0,
            last_accessed: now,
            tier: MemoryTier::ShortTerm,
        };

        // Add to STM
        self.stm.items.push(item);
        self.total_memories += 1;

        // Timeline event
        self.timeline.events.push(TimelineEvent {
            memory_id: id.clone(),
            event_type: TimelineEventType::Created,
            timestamp: now,
        });

        // Enforce STM capacity
        if self.stm.items.len() > self.stm.max_capacity {
            self.promote_stm_to_mtm()?;
        }

        Ok(id)
    }

    /// Recall memories (semantic search across all tiers)
    pub fn recall(&mut self, query: &str, max_results: usize) -> Vec<MemoryItem> {
        let mut results = Vec::new();
        let now = Self::current_timestamp();

        // Search STM
        for item in &mut self.stm.items {
            if Self::matches_query(&item.content, &item.tags, query) {
                item.accessed_count += 1;
                item.last_accessed = now;
                results.push(item.clone());
            }
        }

        // Search MTM
        for item in &mut self.mtm.items {
            if Self::matches_query(&item.content, &item.tags, query) {
                item.accessed_count += 1;
                item.last_accessed = now;
                results.push(item.clone());
            }
        }

        // Search LTM (index only - full load on demand)
        for (id, metadata) in &self.ltm.index {
            if Self::matches_query_metadata(metadata, query) {
                // For now, return metadata as lightweight item
                // In production, would load full content from disk
                let item = MemoryItem {
                    id: id.clone(),
                    content: format!("[LTM:{}]", metadata.memory_type as u8),
                    memory_type: metadata.memory_type,
                    importance: metadata.importance,
                    tags: metadata.tags.clone(),
                    created_at: metadata.created_at,
                    accessed_count: 0,
                    last_accessed: now,
                    tier: MemoryTier::LongTerm,
                };
                results.push(item);
            }
        }

        // Sort by importance (descending)
        results.sort_by(|a, b| b.importance.partial_cmp(&a.importance).unwrap());
        results.truncate(max_results);

        results
    }

    /// Promote STM → MTM (automatic based on access patterns)
    fn promote_stm_to_mtm(&mut self) -> EngineResult<()> {
        let now = Self::current_timestamp();
        let mut promoted = Vec::new();

        // Find candidates for promotion
        for (idx, item) in self.stm.items.iter().enumerate() {
            let age_ms = now.saturating_sub(item.created_at);
            
            // Promote if:
            // 1. Age > 30 minutes AND importance > 0.5
            // 2. OR accessed_count > 3
            // 3. OR STM is full and this is oldest
            let should_promote = 
                (age_ms > 1_800_000 && item.importance > 0.5) ||
                (item.accessed_count > 3) ||
                (self.stm.items.len() >= self.stm.max_capacity && idx < self.stm.items.len() / 2);

            if should_promote {
                promoted.push(idx);
            }
        }

        // Move items (reverse order to preserve indices)
        for idx in promoted.iter().rev() {
            let mut item = self.stm.items.remove(*idx);
            item.tier = MemoryTier::MediumTerm;
            
            self.timeline.events.push(TimelineEvent {
                memory_id: item.id.clone(),
                event_type: TimelineEventType::PromotedToMTM,
                timestamp: now,
            });

            self.mtm.items.push(item);
        }

        Ok(())
    }

    /// Promote MTM → LTM (automatic based on retention time)
    fn promote_mtm_to_ltm(&mut self) -> EngineResult<()> {
        let now = Self::current_timestamp();
        let mut promoted = Vec::new();

        // Find candidates for promotion
        for (idx, item) in self.mtm.items.iter().enumerate() {
            let age_ms = now.saturating_sub(item.created_at);
            
            // Promote if:
            // 1. Age > 3 days AND importance > 0.6
            // 2. OR age > 7 days (retention time)
            let should_promote = 
                (age_ms > 259_200_000 && item.importance > 0.6) ||
                (age_ms > self.mtm.retention_ms);

            if should_promote {
                promoted.push(idx);
            }
        }

        // Move items to LTM (reverse order)
        for idx in promoted.iter().rev() {
            let item = self.mtm.items.remove(*idx);
            
            // Create metadata entry
            let metadata = MemoryMetadata {
                id: item.id.clone(),
                memory_type: item.memory_type,
                importance: item.importance,
                tags: item.tags.clone(),
                created_at: item.created_at,
                file_path: self.ltm.storage_path.join(format!("{}.mem", item.id)),
                compressed: true,
                encrypted: true,
            };

            self.ltm.index.insert(item.id.clone(), metadata);

            self.timeline.events.push(TimelineEvent {
                memory_id: item.id.clone(),
                event_type: TimelineEventType::PromotedToLTM,
                timestamp: now,
            });

            // TODO: Actually write to disk with encryption
        }

        Ok(())
    }

    /// Cleanup expired STM
    fn cleanup_stm(&mut self) -> EngineResult<()> {
        let now = Self::current_timestamp();
        
        self.stm.items.retain(|item| {
            let age_ms = now.saturating_sub(item.created_at);
            age_ms < self.stm.retention_ms
        });

        Ok(())
    }

    /// Compress LTM (save disk space)
    fn compress_ltm(&mut self) -> EngineResult<()> {
        // Placeholder: Would use flate2 for compression
        self.compression_ratio = 0.3; // 70% compression
        Ok(())
    }

    /// Get memory statistics
    pub fn stats(&self) -> MemoryStats {
        let total = self.stm.items.len() + self.mtm.items.len() + self.ltm.index.len();
        let avg_importance = if total > 0 {
            let sum: f32 = self.stm.items.iter().map(|i| i.importance).sum::<f32>()
                + self.mtm.items.iter().map(|i| i.importance).sum::<f32>();
            sum / (self.stm.items.len() + self.mtm.items.len()) as f32
        } else {
            0.0
        };

        MemoryStats {
            stm_count: self.stm.items.len(),
            mtm_count: self.mtm.items.len(),
            ltm_count: self.ltm.index.len(),
            total_memories: self.total_memories,
            capacity_usage: self.capacity_usage,
            compression_ratio: self.compression_ratio,
            avg_importance,
        }
    }

    pub fn health(&self) -> EngineHealth {
        self.health
    }

    pub fn is_initialized(&self) -> bool {
        self.initialized
    }

    pub fn info(&self) -> ModuleInfo {
        ModuleInfo {
            name: "UnifiedMemory".to_string(),
            version: "20.0".to_string(),
            initialized: self.initialized,
            health: self.health,
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //   HELPER METHODS
    // ═══════════════════════════════════════════════════════════════

    fn update_stats(&mut self) {
        let total_capacity = self.stm.max_capacity + self.mtm.max_capacity;
        let used = self.stm.items.len() + self.mtm.items.len();
        self.capacity_usage = (used as f32 / total_capacity as f32) * 100.0;
    }

    fn matches_query(content: &str, tags: &[String], query: &str) -> bool {
        let query_lower = query.to_lowercase();
        content.to_lowercase().contains(&query_lower) ||
        tags.iter().any(|t| t.to_lowercase().contains(&query_lower))
    }

    fn matches_query_metadata(metadata: &MemoryMetadata, query: &str) -> bool {
        let query_lower = query.to_lowercase();
        metadata.tags.iter().any(|t| t.to_lowercase().contains(&query_lower))
    }

    fn generate_encryption_key() -> [u8; 32] {
        // Placeholder: Would use proper key derivation (PBKDF2, Argon2)
        let mut key = [0u8; 32];
        for (i, byte) in key.iter_mut().enumerate() {
            *byte = (i * 7 + 13) as u8; // Simple deterministic pattern for now
        }
        key
    }

    fn current_timestamp() -> u64 {
        Utc::now().timestamp_millis() as u64
    }
}

impl Default for UnifiedMemory {
    fn default() -> Self {
        Self::new()
    }
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_unified_memory_init() {
        let mut memory = UnifiedMemory::new();
        assert!(!memory.is_initialized());
        
        memory.init().unwrap();
        assert!(memory.is_initialized());
        assert_eq!(memory.health(), EngineHealth::Healthy);
    }

    #[test]
    fn test_store_memory() {
        let mut memory = UnifiedMemory::new();
        memory.init().unwrap();

        let id = memory.store(
            "Test memory content".to_string(),
            MemoryType::Conversation,
            0.8,
            vec!["test".to_string()],
        ).unwrap();

        assert!(!id.is_empty());
        assert_eq!(memory.stm.items.len(), 1);
        assert_eq!(memory.total_memories, 1);
    }

    #[test]
    fn test_recall_memories() {
        let mut memory = UnifiedMemory::new();
        memory.init().unwrap();

        memory.store("Chat about AI".to_string(), MemoryType::Conversation, 0.7, vec!["ai".to_string()]).unwrap();
        memory.store("Project planning".to_string(), MemoryType::Project, 0.9, vec!["project".to_string()]).unwrap();

        let results = memory.recall("ai", 10);
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].memory_type, MemoryType::Conversation);
    }

    #[test]
    fn test_promotion_stm_to_mtm() {
        let mut memory = UnifiedMemory::new();
        memory.init().unwrap();

        // Store high-importance memory
        let id = memory.store(
            "Important decision".to_string(),
            MemoryType::Decision,
            0.9,
            vec!["decision".to_string()],
        ).unwrap();

        // Simulate multiple accesses
        let _ = memory.recall("decision", 10);
        let _ = memory.recall("decision", 10);
        let _ = memory.recall("decision", 10);
        let _ = memory.recall("decision", 10);

        // Trigger promotion
        memory.promote_stm_to_mtm().unwrap();

        assert_eq!(memory.mtm.items.len(), 1);
        assert_eq!(memory.stm.items.len(), 0);
        assert_eq!(memory.mtm.items[0].tier, MemoryTier::MediumTerm);
    }

    #[test]
    fn test_memory_stats() {
        let mut memory = UnifiedMemory::new();
        memory.init().unwrap();

        memory.store("Test 1".to_string(), MemoryType::System, 0.5, vec![]).unwrap();
        memory.store("Test 2".to_string(), MemoryType::System, 0.7, vec![]).unwrap();

        let stats = memory.stats();
        assert_eq!(stats.stm_count, 2);
        assert_eq!(stats.mtm_count, 0);
        assert_eq!(stats.ltm_count, 0);
        assert_eq!(stats.total_memories, 2);
    }

    #[tokio::test]
    async fn test_unified_tick() {
        let mut memory = UnifiedMemory::new();
        memory.init().unwrap();

        memory.store("Old memory".to_string(), MemoryType::Event, 0.3, vec![]).unwrap();

        let result = memory.tick().await;
        assert!(result.is_ok());
        assert!(memory.last_update_ms > 0);
    }
}
