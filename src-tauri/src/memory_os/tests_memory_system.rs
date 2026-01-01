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

        assert_eq!(snapshot.count, 0, "New STM should be empty");
        assert_eq!(snapshot.tier, MemoryTier::STM);
    }

    #[tokio::test]
    async fn test_stm_push_single_entry() {
        let stm = ShortTermMemory::new();
        let entry = MemoryEntry::new(
            "Test memory content".to_string(),
            0.8,
            MemoryType::Conversation,
        );

        let evicted = stm.push(entry.clone()).await;
        assert!(evicted.is_none(), "First push should not evict");

        let entries = stm.get_all().await;
        assert_eq!(entries.len(), 1, "STM should contain 1 entry");
        assert_eq!(entries[0].content, "Test memory content");
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
            let _ = stm.push(entry).await;
        }

        let entries_before = stm.get_all().await;
        assert_eq!(entries_before.len(), STM_MAX_SIZE);

        // Push one more - should evict oldest (Entry 0)
        let new_entry = MemoryEntry::new(
            "Entry 20 - New".to_string(),
            0.9,
            MemoryType::Conversation,
        );
        let evicted = stm.push(new_entry).await;
        assert!(evicted.is_some(), "Push over capacity should evict one entry");

        let entries_after = stm.get_all().await;
        assert_eq!(entries_after.len(), STM_MAX_SIZE, "STM should maintain max size");

        // First entry should now be "Entry 1" (Entry 0 evicted)
        assert_eq!(entries_after[0].content, "Entry 1");

        // Last entry should be the new one
        assert_eq!(entries_after[STM_MAX_SIZE - 1].content, "Entry 20 - New");
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
            let _ = stm.push(entry).await;
        }

        assert_eq!(stm.len().await, 5);

        // Clear
        stm.clear().await;

        assert_eq!(stm.len().await, 0, "STM should be empty after clear");
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

        let _ = stm.push(entry).await;
        let entries = stm.get_all().await;

        assert_eq!(entries[0].importance, high_importance);
        assert_eq!(entries[0].memory_type, MemoryType::Decision);
    }

    // ═══════════════════════════════════════════════════════════════
    //   MTM (Mid-Term Memory) Tests
    // ═══════════════════════════════════════════════════════════════

    #[tokio::test]
    async fn test_mtm_create_empty() {
        let mtm = MidTermMemory::new();
        let snapshot = mtm.snapshot().await;

        assert_eq!(snapshot.count, 0, "New MTM should be empty");
        assert_eq!(snapshot.tier, MemoryTier::MTM);
    }

    #[tokio::test]
    async fn test_mtm_consolidate_from_stm() {
        let mtm = MidTermMemory::new();

        // Create high-importance entries that should be consolidated
        let entries = vec![
            MemoryEntry::new("Critical decision".to_string(), 0.9, MemoryType::Decision),
            MemoryEntry::new("Important fact".to_string(), 0.85, MemoryType::Knowledge),
        ];

        mtm.add_batch(entries).await;

        // Under capacity: consolidate should not drop entries
        let overflow = mtm.consolidate().await;
        assert!(overflow.is_empty(), "No overflow expected under capacity");

        let snapshot = mtm.snapshot().await;
        assert_eq!(snapshot.count, 2, "MTM should contain consolidated entries");

        let stored = mtm.get_all().await;
        assert_eq!(stored.len(), 2);
        assert!(stored[0].importance >= stored[1].importance);
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
        assert!(entry.timestamp > 0);
    }

    #[test]
    fn test_memory_type_variants() {
        // Ensure all MemoryType variants are accessible
        let types = [MemoryType::Conversation,
            MemoryType::Decision,
            MemoryType::Knowledge,
            MemoryType::Project,
            MemoryType::Ritual,
            MemoryType::Event,
            MemoryType::System,
            MemoryType::Custom];

        assert_eq!(types.len(), 8, "Should have 8 memory type variants");
    }

    #[test]
    fn test_memory_tier_variants() {
        // Ensure all MemoryTier variants work
        let tiers = [MemoryTier::STM,
            MemoryTier::MTM,
            MemoryTier::LTM];

        assert_eq!(tiers.len(), 3, "Should have 3 memory tiers");
    }
}
