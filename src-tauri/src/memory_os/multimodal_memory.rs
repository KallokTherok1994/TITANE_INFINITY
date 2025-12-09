#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   MEMORY OS — MULTIMODAL MEMORY EXTENSION vΩ
//   SUPER PROMPT #15 — PHASE 6 COMPLETE
//   Extends MemoryEntry with multimodal capabilities
// ═══════════════════════════════════════════════════════════════

use crate::memory_os::memory_state::{MemoryEntry, MemoryTier, MemoryType};
// COMMENTED: multimodal module disabled (Phase 1 Stabilisation)
// use crate::multimodal::image_memory::ImageMemoryEntry;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

/// Multimodal content attached to memory entries
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MultimodalContent {
    /// Vision data (image bytes)
    pub image_data: Option<Vec<u8>>,
    /// Image metadata reference (stored in ImageMemoryStore)
    pub image_id: Option<String>,
    /// Audio frame data
    pub audio_data: Option<Vec<f32>>,
    /// Audio metadata
    pub audio_metadata: Option<AudioMetadata>,
    /// Joint embedding (fused text+image+audio)
    pub joint_embedding: Option<Vec<f32>>,
    /// Modality weights used in fusion
    pub modality_weights: Option<ModalityWeights>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioMetadata {
    pub sample_rate: u32,
    pub duration_ms: u64,
    pub intensity: f32,
    pub frequency_bands: Vec<f32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModalityWeights {
    pub text: f32,
    pub vision: f32,
    pub audio: f32,
}

impl Default for MultimodalContent {
    fn default() -> Self {
        Self {
            image_data: None,
            image_id: None,
            audio_data: None,
            audio_metadata: None,
            joint_embedding: None,
            modality_weights: None,
        }
    }
}

/// Extended memory entry with multimodal support
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MultimodalMemoryEntry {
    /// Core memory entry
    pub base: MemoryEntry,
    /// Multimodal attachments
    pub multimodal: MultimodalContent,
}

impl MultimodalMemoryEntry {
    /// Create from base memory entry
    pub fn from_base(base: MemoryEntry) -> Self {
        Self {
            base,
            multimodal: MultimodalContent::default(),
        }
    }

    /// Create with image
    pub fn with_image(mut self, image_data: Vec<u8>, image_id: String) -> Self {
        self.multimodal.image_data = Some(image_data);
        self.multimodal.image_id = Some(image_id);
        self
    }

    /// Create with audio
    pub fn with_audio(mut self, audio_data: Vec<f32>, metadata: AudioMetadata) -> Self {
        self.multimodal.audio_data = Some(audio_data);
        self.multimodal.audio_metadata = Some(metadata);
        self
    }

    /// Create with joint embedding
    pub fn with_joint_embedding(mut self, embedding: Vec<f32>, weights: ModalityWeights) -> Self {
        self.multimodal.joint_embedding = Some(embedding);
        self.multimodal.modality_weights = Some(weights);
        self
    }

    /// Check if entry has multimodal content
    pub fn has_multimodal(&self) -> bool {
        self.multimodal.image_data.is_some()
            || self.multimodal.audio_data.is_some()
            || self.multimodal.joint_embedding.is_some()
    }

    /// Get effective embedding (prefer joint, fallback to text)
    pub fn effective_embedding(&self) -> Option<&Vec<f32>> {
        self.multimodal
            .joint_embedding
            .as_ref()
            .or(self.base.embedding.as_ref())
    }

    /// Get memory size including multimodal data
    pub fn total_size_bytes(&self) -> usize {
        let base_size = self.base.size_bytes();
        let image_size = self.multimodal.image_data.as_ref().map(|d| d.len()).unwrap_or(0);
        let audio_size = self.multimodal.audio_data.as_ref().map(|d| d.len() * 4).unwrap_or(0);
        let joint_emb_size = self.multimodal.joint_embedding.as_ref().map(|e| e.len() * 4).unwrap_or(0);
        base_size + image_size + audio_size + joint_emb_size
    }
}

/// Multimodal Memory Store - extends Memory OS with multimodal capabilities
pub struct MultimodalMemoryStore {
    /// Multimodal entries (indexed by memory entry ID)
    entries: Arc<RwLock<Vec<MultimodalMemoryEntry>>>,
    /// Max entries per tier
    stm_capacity: usize,
    mtm_capacity: usize,
    ltm_capacity: usize,
}

impl MultimodalMemoryStore {
    pub fn new(stm_capacity: usize, mtm_capacity: usize, ltm_capacity: usize) -> Self {
        Self {
            entries: Arc::new(RwLock::new(Vec::new())),
            stm_capacity,
            mtm_capacity,
            ltm_capacity,
        }
    }

    /// Store multimodal memory entry
    pub async fn store(&self, entry: MultimodalMemoryEntry) -> Result<Uuid, String> {
        let mut entries = self.entries.write().await;

        // Check capacity per tier
        let tier = entry.base.tier;
        let tier_count = entries.iter().filter(|e| e.base.tier == tier).count();
        let capacity = match tier {
            MemoryTier::STM => self.stm_capacity,
            MemoryTier::MTM => self.mtm_capacity,
            MemoryTier::LTM => self.ltm_capacity,
        };

        // Evict if at capacity
        if tier_count >= capacity {
            self.evict_lowest_importance(&mut entries, tier);
        }

        let id = entry.base.id;
        entries.push(entry);
        Ok(id)
    }

    /// Evict lowest importance entry from tier
    fn evict_lowest_importance(&self, entries: &mut Vec<MultimodalMemoryEntry>, tier: MemoryTier) {
        let mut tier_entries: Vec<_> = entries
            .iter()
            .enumerate()
            .filter(|(_, e)| e.base.tier == tier)
            .collect();

        if tier_entries.is_empty() {
            return;
        }

        // Sort by relevance score (ascending)
        tier_entries.sort_by(|a, b| {
            a.1.base.relevance_score()
                .partial_cmp(&b.1.base.relevance_score())
                .unwrap()
        });

        // Remove lowest
        if let Some((idx, _)) = tier_entries.first() {
            entries.remove(*idx);
        }
    }

    /// Retrieve by ID
    pub async fn get(&self, id: &Uuid) -> Option<MultimodalMemoryEntry> {
        let entries = self.entries.read().await;
        entries.iter().find(|e| &e.base.id == id).cloned()
    }

    /// Search by joint embedding (cross-modal semantic search)
    pub async fn search_by_joint_embedding(
        &self,
        query_embedding: &[f32],
        k: usize,
        tier_filter: Option<MemoryTier>,
    ) -> Vec<(f32, MultimodalMemoryEntry)> {
        let entries = self.entries.read().await;

        // Filter by tier if specified
        let filtered: Vec<_> = entries
            .iter()
            .filter(|e| {
                if let Some(tier) = tier_filter {
                    e.base.tier == tier
                } else {
                    true
                }
            })
            .collect();

        // Calculate similarities using effective embedding
        let mut scored: Vec<(f32, MultimodalMemoryEntry)> = filtered
            .iter()
            .filter_map(|entry| {
                if let Some(emb) = entry.effective_embedding() {
                    let similarity = cosine_similarity(query_embedding, emb);
                    Some((similarity, (*entry).clone()))
                } else {
                    None
                }
            })
            .collect();

        // Sort by similarity (descending)
        scored.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap());

        // Take top k
        scored.into_iter().take(k).collect()
    }

    /// Search multimodal memories by text query
    pub async fn search_text(&self, query: &str, k: usize) -> Vec<(f32, MultimodalMemoryEntry)> {
        let entries = self.entries.read().await;

        // Simple text matching (in production, use embeddings)
        let mut scored: Vec<(f32, MultimodalMemoryEntry)> = entries
            .iter()
            .map(|entry| {
                let content_lower = entry.base.content.to_lowercase();
                let query_lower = query.to_lowercase();

                // Simple relevance score based on word overlap
                let score = if content_lower.contains(&query_lower) {
                    1.0
                } else {
                    let query_words: Vec<_> = query_lower.split_whitespace().collect();
                    let matches = query_words.iter()
                        .filter(|w| content_lower.contains(*w))
                        .count();
                    matches as f32 / query_words.len().max(1) as f32
                };

                (score * entry.base.relevance_score(), entry.clone())
            })
            .filter(|(score, _)| *score > 0.0)
            .collect();

        scored.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap());
        scored.into_iter().take(k).collect()
    }

    /// Get all multimodal entries (for export/analysis)
    pub async fn get_all(&self) -> Vec<MultimodalMemoryEntry> {
        let entries = self.entries.read().await;
        entries.clone()
    }

    /// Get entries by tier
    pub async fn get_by_tier(&self, tier: MemoryTier) -> Vec<MultimodalMemoryEntry> {
        let entries = self.entries.read().await;
        entries.iter().filter(|e| e.base.tier == tier).cloned().collect()
    }

    /// Get multimodal entries only
    pub async fn get_multimodal_only(&self) -> Vec<MultimodalMemoryEntry> {
        let entries = self.entries.read().await;
        entries.iter().filter(|e| e.has_multimodal()).cloned().collect()
    }

    /// Promote entry to next tier
    pub async fn promote(&self, id: &Uuid) -> Result<(), String> {
        let mut entries = self.entries.write().await;

        if let Some(entry) = entries.iter_mut().find(|e| &e.base.id == id) {
            if let Some(next_tier) = entry.base.tier.next() {
                entry.base.tier = next_tier;
                log::info!("📈 Promoted memory {} to {:?}", id, next_tier);
                Ok(())
            } else {
                Err("Already in highest tier".to_string())
            }
        } else {
            Err(format!("Memory {} not found", id))
        }
    }

    /// Update entry importance
    pub async fn update_importance(&self, id: &Uuid, importance: f32) -> Result<(), String> {
        let mut entries = self.entries.write().await;

        if let Some(entry) = entries.iter_mut().find(|e| &e.base.id == id) {
            entry.base.importance = importance.clamp(0.0, 1.0);
            Ok(())
        } else {
            Err(format!("Memory {} not found", id))
        }
    }

    /// Remove by ID
    pub async fn remove(&self, id: &Uuid) -> Result<(), String> {
        let mut entries = self.entries.write().await;

        let original_len = entries.len();
        entries.retain(|e| &e.base.id != id);

        if entries.len() < original_len {
            Ok(())
        } else {
            Err(format!("Memory {} not found", id))
        }
    }

    /// Get statistics
    pub async fn stats(&self) -> MultimodalMemoryStats {
        let entries = self.entries.read().await;

        let stm_count = entries.iter().filter(|e| e.base.tier == MemoryTier::STM).count();
        let mtm_count = entries.iter().filter(|e| e.base.tier == MemoryTier::MTM).count();
        let ltm_count = entries.iter().filter(|e| e.base.tier == MemoryTier::LTM).count();

        let multimodal_count = entries.iter().filter(|e| e.has_multimodal()).count();
        let with_image = entries.iter().filter(|e| e.multimodal.image_data.is_some()).count();
        let with_audio = entries.iter().filter(|e| e.multimodal.audio_data.is_some()).count();
        let with_joint = entries.iter().filter(|e| e.multimodal.joint_embedding.is_some()).count();

        let total_size_bytes: usize = entries.iter().map(|e| e.total_size_bytes()).sum();

        MultimodalMemoryStats {
            total_entries: entries.len(),
            stm_count,
            mtm_count,
            ltm_count,
            multimodal_count,
            with_image,
            with_audio,
            with_joint_embedding: with_joint,
            total_size_bytes,
            total_size_mb: total_size_bytes as f32 / 1_048_576.0,
        }
    }

    /// Clear all entries
    pub async fn clear(&self) {
        let mut entries = self.entries.write().await;
        entries.clear();
    }
}

/// Statistics for multimodal memory
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MultimodalMemoryStats {
    pub total_entries: usize,
    pub stm_count: usize,
    pub mtm_count: usize,
    pub ltm_count: usize,
    pub multimodal_count: usize,
    pub with_image: usize,
    pub with_audio: usize,
    pub with_joint_embedding: usize,
    pub total_size_bytes: usize,
    pub total_size_mb: f32,
}

/// Helper: Cosine similarity
fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    if a.len() != b.len() {
        return 0.0;
    }

    let dot: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
    let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
    let norm_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();

    if norm_a == 0.0 || norm_b == 0.0 {
        return 0.0;
    }

    dot / (norm_a * norm_b)
}

// Extension trait for MemoryTier
trait MemoryTierExt {
    fn next(&self) -> Option<MemoryTier>;
}

impl MemoryTierExt for MemoryTier {
    fn next(&self) -> Option<MemoryTier> {
        match self {
            MemoryTier::STM => Some(MemoryTier::MTM),
            MemoryTier::MTM => Some(MemoryTier::LTM),
            MemoryTier::LTM => None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_entry(content: &str, importance: f32) -> MultimodalMemoryEntry {
        let base = MemoryEntry::new(content.to_string(), importance, MemoryType::Factual);
        MultimodalMemoryEntry::from_base(base)
    }

    fn create_test_image() -> Vec<u8> {
        let img = image::ImageBuffer::from_fn(50, 50, |_, _| image::Rgb([128, 128, 128]));
        let dynamic = image::DynamicImage::ImageRgb8(img);
        let mut bytes = Vec::new();
        dynamic
            .write_to(&mut std::io::Cursor::new(&mut bytes), image::ImageFormat::Png)
            .unwrap();
        bytes
    }

    #[tokio::test]
    async fn test_multimodal_store_basic() {
        let store = MultimodalMemoryStore::new(10, 50, 1000);
        let entry = create_test_entry("test memory", 0.8);

        let id = store.store(entry).await.unwrap();
        let retrieved = store.get(&id).await;

        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().base.content, "test memory");
    }

    #[tokio::test]
    async fn test_multimodal_with_image() {
        let store = MultimodalMemoryStore::new(10, 50, 1000);
        let mut entry = create_test_entry("memory with image", 0.9);

        let image_data = create_test_image();
        entry = entry.with_image(image_data.clone(), "img_001".to_string());

        assert!(entry.has_multimodal());
        assert_eq!(entry.multimodal.image_id, Some("img_001".to_string()));

        store.store(entry.clone()).await.unwrap();
        let stats = store.stats().await;
        assert_eq!(stats.with_image, 1);
    }

    #[tokio::test]
    async fn test_multimodal_with_audio() {
        let store = MultimodalMemoryStore::new(10, 50, 1000);
        let mut entry = create_test_entry("memory with audio", 0.85);

        let audio_data = vec![0.1, 0.2, 0.3, 0.4];
        let audio_meta = AudioMetadata {
            sample_rate: 44100,
            duration_ms: 1000,
            intensity: 0.7,
            frequency_bands: vec![0.1, 0.2, 0.3, 0.4, 0.5],
        };
        entry = entry.with_audio(audio_data, audio_meta);

        assert!(entry.has_multimodal());
        store.store(entry).await.unwrap();

        let stats = store.stats().await;
        assert_eq!(stats.with_audio, 1);
    }

    #[tokio::test]
    async fn test_joint_embedding_search() {
        let store = MultimodalMemoryStore::new(10, 50, 1000);

        // Store entries with joint embeddings
        let mut entry1 = create_test_entry("first memory", 0.9);
        entry1 = entry1.with_joint_embedding(
            vec![1.0, 0.0, 0.0],
            ModalityWeights { text: 0.5, vision: 0.3, audio: 0.2 },
        );

        let mut entry2 = create_test_entry("second memory", 0.8);
        entry2 = entry2.with_joint_embedding(
            vec![0.9, 0.1, 0.0],
            ModalityWeights { text: 0.4, vision: 0.4, audio: 0.2 },
        );

        store.store(entry1).await.unwrap();
        store.store(entry2).await.unwrap();

        // Search with query similar to first entry
        let query = vec![1.0, 0.0, 0.0];
        let results = store.search_by_joint_embedding(&query, 2, None).await;

        assert_eq!(results.len(), 2);
        assert_eq!(results[0].1.base.content, "first memory"); // Most similar
    }

    #[tokio::test]
    async fn test_tier_filtering() {
        let store = MultimodalMemoryStore::new(10, 50, 1000);

        let mut entry_stm = create_test_entry("stm memory", 0.7);
        entry_stm.base.tier = MemoryTier::STM;

        let mut entry_ltm = create_test_entry("ltm memory", 0.9);
        entry_ltm.base.tier = MemoryTier::LTM;

        store.store(entry_stm).await.unwrap();
        store.store(entry_ltm).await.unwrap();

        let stm_entries = store.get_by_tier(MemoryTier::STM).await;
        assert_eq!(stm_entries.len(), 1);
        assert_eq!(stm_entries[0].base.content, "stm memory");
    }

    #[tokio::test]
    async fn test_promotion() {
        let store = MultimodalMemoryStore::new(10, 50, 1000);
        let entry = create_test_entry("promotable memory", 0.9);
        let id = entry.base.id;

        store.store(entry).await.unwrap();

        // Promote STM → MTM
        store.promote(&id).await.unwrap();
        let retrieved = store.get(&id).await.unwrap();
        assert_eq!(retrieved.base.tier, MemoryTier::MTM);

        // Promote MTM → LTM
        store.promote(&id).await.unwrap();
        let retrieved = store.get(&id).await.unwrap();
        assert_eq!(retrieved.base.tier, MemoryTier::LTM);

        // Cannot promote beyond LTM
        let result = store.promote(&id).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_eviction() {
        let store = MultimodalMemoryStore::new(3, 50, 1000); // STM capacity = 3

        // Store 4 STM entries
        for i in 0..4 {
            let mut entry = create_test_entry(&format!("memory {}", i), (i as f32) / 10.0);
            entry.base.tier = MemoryTier::STM;
            store.store(entry).await.unwrap();
        }

        let stats = store.stats().await;
        assert_eq!(stats.stm_count, 3); // Should evict lowest importance (memory 0)

        let stm_entries = store.get_by_tier(MemoryTier::STM).await;
        let contents: Vec<_> = stm_entries.iter().map(|e| e.base.content.as_str()).collect();
        assert!(!contents.contains(&"memory 0")); // Lowest importance evicted
    }

    #[tokio::test]
    async fn test_stats() {
        let store = MultimodalMemoryStore::new(10, 50, 1000);

        let entry1 = create_test_entry("text only", 0.8);

        let mut entry2 = create_test_entry("with image", 0.9);
        entry2 = entry2.with_image(create_test_image(), "img1".to_string());

        let mut entry3 = create_test_entry("with joint", 0.85);
        entry3 = entry3.with_joint_embedding(
            vec![0.0; 512],
            ModalityWeights { text: 0.5, vision: 0.3, audio: 0.2 },
        );

        store.store(entry1).await.unwrap();
        store.store(entry2).await.unwrap();
        store.store(entry3).await.unwrap();

        let stats = store.stats().await;
        assert_eq!(stats.total_entries, 3);
        assert_eq!(stats.multimodal_count, 2); // entry2 and entry3
        assert_eq!(stats.with_image, 1);
        assert_eq!(stats.with_joint_embedding, 1);
    }

    #[tokio::test]
    async fn test_text_search() {
        let store = MultimodalMemoryStore::new(10, 50, 1000);

        store.store(create_test_entry("the quick brown fox", 0.9)).await.unwrap();
        store.store(create_test_entry("lazy dog sleeping", 0.8)).await.unwrap();
        store.store(create_test_entry("brown bear hunting", 0.85)).await.unwrap();

        let results = store.search_text("brown", 5).await;
        assert_eq!(results.len(), 2); // fox and bear entries
    }
}
