//! ═══════════════════════════════════════════════════════════════
//!   TITANE∞ — Memory System Unit Tests
//!   Phase 5: Comprehensive tests for STM, MTM, LTM
//! ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod memory_system_tests {
    use super::super::memory_state::{MemoryEntry, MemoryTier, MemoryType};
    use super::super::stm::{ShortTermMemory, STM_MAX_SIZE};
    use super::super::mtm::MidTermMemory;

    // ═══════════════════════════════════════════════════════════════
    //   STM (Short-Term Memory) Tests
    // ═══════════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_stm_create_empty() {
        let stm = ShortTermMemory::new();
        let snapshot = stm.snapshot().await;

        assert_eq!(snapshot.entries.len(), 0, "New STM should be empty");
        assert_eq!(snapshot.tier, MemoryTier::ShortTerm);
    }

    #[tokio::test]
    async fn test_stm_push_single_entry() {
        let stm = ShortTermMemory::new();
        let entry = MemoryEntry::new(
            "Test memory content".to_string(),
            0.8,
            MemoryType::Conversation,
        );

        stm.push(entry.clone()).await;
        let snapshot = stm.snapshot().await;

        assert_eq!(snapshot.entries.len(), 1, "STM should contain 1 entry");
        assert_eq!(snapshot.entries[0].content, "Test memory content");
    }

    #[tokio::test]
    async fn test_stm_fifo_eviction_when_full() {
        let stm = ShortTermMemory::new();

        // Fill STM to capacity (20 items)
        for i in 0..STM_MAX_SIZE {
            let entry = MemoryEntry::new(
                format!("Entry {}", i),
                0.5,
                MemoryType::Conversation,
            );
            stm.push(entry).await;
        }

        let snapshot_before = stm.snapshot().await;
        assert_eq!(snapshot_before.entries.len(), STM_MAX_SIZE);

        // Push one more - should evict oldest (Entry 0)
        let new_entry = MemoryEntry::new(
            "Entry 20 - New".to_string(),
            0.9,
            MemoryType::Conversation,
        );
        stm.push(new_entry).await;

        let snapshot_after = stm.snapshot().await;
        assert_eq!(
            snapshot_after.entries.len(),
            STM_MAX_SIZE,
            "STM should maintain max size"
        );

        // First entry should now be "Entry 1" (Entry 0 evicted)
        assert_eq!(snapshot_after.entries[0].content, "Entry 1");

        // Last entry should be the new one
        assert_eq!(
            snapshot_after.entries[STM_MAX_SIZE - 1].content,
            "Entry 20 - New"
        );
    }

    #[tokio::test]
    async fn test_stm_clear() {
        let stm = ShortTermMemory::new();

        // Add multiple entries
        for i in 0..5 {
            let entry = MemoryEntry::new(
                format!("Entry {}", i),
                0.5,
                MemoryType::Conversation,
            );
            stm.push(entry).await;
        }

        assert_eq!(stm.snapshot().await.entries.len(), 5);

        // Clear
        stm.clear().await;

        assert_eq!(stm.snapshot().await.entries.len(), 0, "STM should be empty after clear");
    }

    #[tokio::test]
    async fn test_stm_importance_preserved() {
        let stm = ShortTermMemory::new();
        let high_importance = 0.95;

        let entry = MemoryEntry::new(
            "Important memory".to_string(),
            high_importance,
            MemoryType::Decision,
        );

        stm.push(entry).await;
        let snapshot = stm.snapshot().await;

        assert_eq!(snapshot.entries[0].importance, high_importance);
        assert_eq!(snapshot.entries[0].memory_type, MemoryType::Decision);
    }

    // ═══════════════════════════════════════════════════════════════
    //   MTM (Mid-Term Memory) Tests
    // ═══════════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_mtm_create_empty() {
        let mtm = MidTermMemory::new();
        let snapshot = mtm.snapshot().await;

        assert_eq!(snapshot.entries.len(), 0, "New MTM should be empty");
        assert_eq!(snapshot.tier, MemoryTier::MidTerm);
    }

    #[tokio::test]
    async fn test_mtm_consolidate_from_stm() {
        let mtm = MidTermMemory::new();

        // Create high-importance entries that should be consolidated
        let entries = vec![
            MemoryEntry::new("Critical decision".to_string(), 0.9, MemoryType::Decision),
            MemoryEntry::new("Important fact".to_string(), 0.85, MemoryType::Knowledge),
        ];

        mtm.consolidate(entries).await;
        let snapshot = mtm.snapshot().await;

        assert_eq!(snapshot.entries.len(), 2, "MTM should contain consolidated entries");
        assert!(snapshot.entries[0].importance >= 0.8);
    }

    #[tokio::test]
    async fn test_mtm_decay_low_importance() {
        let mtm = MidTermMemory::new();

        // Add entry with moderate importance
        let entry = MemoryEntry::new(
            "Moderate memory".to_string(),
            0.5,
            MemoryType::Conversation,
        );

        mtm.consolidate(vec![entry]).await;

        // Apply decay (this would normally happen over time)
        mtm.decay(0.1).await; // 10% decay

        let snapshot = mtm.snapshot().await;

        // Importance should have decreased
        assert!(snapshot.entries[0].importance < 0.5);
    }

    // ═══════════════════════════════════════════════════════════════
    //   Memory Entry Tests
    // ═══════════════════════════════════════════════════════════════

    #[test]
    fn test_memory_entry_creation() {
        let entry = MemoryEntry::new(
            "Test content".to_string(),
            0.7,
            MemoryType::Project,
        );

        assert_eq!(entry.content, "Test content");
        assert_eq!(entry.importance, 0.7);
        assert_eq!(entry.memory_type, MemoryType::Project);
        assert!(entry.timestamp_ms > 0);
    }

    #[test]
    fn test_memory_type_variants() {
        // Ensure all MemoryType variants are accessible
        let types = vec![
            MemoryType::Conversation,
            MemoryType::Decision,
            MemoryType::Knowledge,
            MemoryType::Project,
            MemoryType::Ritual,
            MemoryType::Event,
            MemoryType::System,
        ];

        assert_eq!(types.len(), 7, "Should have 7 memory type variants");
    }

    #[test]
    fn test_memory_tier_variants() {
        // Ensure all MemoryTier variants work
        let tiers = vec![
            MemoryTier::ShortTerm,
            MemoryTier::MidTerm,
            MemoryTier::LongTerm,
        ];

        assert_eq!(tiers.len(), 3, "Should have 3 memory tiers");
    }
}
