// ═══════════════════════════════════════════════════════════════
//   NEURAL MEMORY — UNIT TESTS
//   Phase 2.4: Component-level testing
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod stm_tests {
    use super::super::stm::ShortTermMemory;
    use crate::unified_memory_v2::types::{MemoryEntry, MemoryType};

    #[test]
    fn test_stm_fifo_behavior() {
        let mut stm = ShortTermMemory::new(5); // Small capacity for testing

        // Add 7 entries (exceeds capacity of 5)
        for i in 0..7 {
            let mut entry =
                MemoryEntry::new(format!("Content {}", i), 0.5, MemoryType::Conversation);
            entry.id = format!("id_{}", i);
            entry.created_at = i as i64;
            stm.push(entry)
                .expect("STM push should succeed for a valid MemoryEntry");
        }

        // Should only have 5 most recent entries
        let all = stm.get_all();
        assert_eq!(all.len(), 5, "STM should maintain FIFO with capacity limit");

        // Newest entries first (reversed order), id_6 should be first
        assert_eq!(
            all[0].id, "id_6",
            "FIFO: newest entry should be first in get_all"
        );
    }

    #[test]
    fn test_stm_search() {
        let mut stm = ShortTermMemory::default();

        // Add test entries
        for keyword in &["rust", "javascript", "rust async"] {
            let entry = MemoryEntry::new(keyword.to_string(), 0.5, MemoryType::Factual);
            stm.push(entry)
                .expect("STM push should succeed for a valid MemoryEntry");
        }

        // Search for "rust"
        let results = stm.search("rust");
        assert_eq!(results.len(), 2, "Should find 2 rust-related entries");
    }
}

#[cfg(test)]
mod mtm_tests {
    use super::super::mtm::MidTermMemory;
    use crate::unified_memory_v2::types::{MemoryEntry, MemoryType};

    #[test]
    fn test_mtm_capacity_limit() {
        let mut mtm = MidTermMemory::new(10);

        // Add 15 entries (exceeds capacity)
        for i in 0..15 {
            let mut entry = MemoryEntry::new(
                format!("Content {}", i),
                (i as f32) / 15.0,
                MemoryType::Conversation,
            );
            entry.id = format!("id_{}", i);
            mtm.push(entry)
                .expect("MTM push should succeed for a valid MemoryEntry");
        }

        // Should maintain capacity and keep most important
        let all = mtm.get_all();
        assert_eq!(all.len(), 10, "MTM should enforce capacity limit");
    }

    #[test]
    fn test_mtm_importance_sorting() {
        let mut mtm = MidTermMemory::default();

        // Add entries with different importance (unsorted)
        let importances = [0.3, 0.9, 0.5, 0.7, 0.1];
        for (i, &imp) in importances.iter().enumerate() {
            let mut entry = MemoryEntry::new(format!("Content {}", i), imp, MemoryType::Factual);
            entry.id = format!("id_{}", i);
            mtm.push(entry)
                .expect("MTM push should succeed for a valid MemoryEntry");
        }

        // Get all should be sorted by importance (descending)
        let all = mtm.get_all();
        assert!(
            all[0].importance >= all[1].importance,
            "MTM should sort by importance"
        );
        assert!(
            all[1].importance >= all[2].importance,
            "MTM should maintain sort order"
        );
    }
}

#[cfg(test)]
mod vector_tests {
    use super::super::vector::VectorStore;
    use crate::unified_memory_v2::types::{MemoryEntry, MemoryType};

    fn create_test_entry(id: &str, content: &str) -> MemoryEntry {
        let mut entry = MemoryEntry::new(content.to_string(), 0.5, MemoryType::Factual);
        entry.id = id.to_string(); // Override ID for testing
        entry
    }

    #[test]
    fn test_vector_store_insert_and_search() {
        let mut store = VectorStore::with_dim(3);

        let entry1 = create_test_entry("doc1", "metadata1");
        let entry2 = create_test_entry("doc2", "metadata2");
        let entry3 = create_test_entry("doc3", "metadata3");

        // Add vectors
        store
            .insert(&entry1, vec![1.0, 0.0, 0.0])
            .expect("VectorStore insert should succeed with correct dimension");
        store
            .insert(&entry2, vec![0.0, 1.0, 0.0])
            .expect("VectorStore insert should succeed with correct dimension");
        store
            .insert(&entry3, vec![0.9, 0.1, 0.0])
            .expect("VectorStore insert should succeed with correct dimension");

        // Search for vector similar to doc1
        let query = vec![1.0, 0.0, 0.0];
        let results = store.search(&query, 2);

        assert_eq!(results.len(), 2, "Should return top 2 results");
        assert_eq!(results[0].id, "doc1", "Most similar should be doc1");
    }

    #[test]
    fn test_vector_store_dimension_validation() {
        let mut store = VectorStore::with_dim(3);
        let entry = create_test_entry("doc1", "meta");

        // Try to insert wrong dimension
        let result = store.insert(&entry, vec![1.0, 2.0]); // Wrong dimension
        assert!(result.is_err(), "Should reject wrong dimension");
    }

    #[test]
    fn test_vector_store_remove() {
        let mut store = VectorStore::with_dim(2);

        let entry1 = create_test_entry("doc1", "meta1");
        let entry2 = create_test_entry("doc2", "meta2");

        store
            .insert(&entry1, vec![1.0, 0.0])
            .expect("VectorStore insert should succeed with correct dimension");
        store
            .insert(&entry2, vec![0.0, 1.0])
            .expect("VectorStore insert should succeed with correct dimension");

        store.remove("doc1");
        // Removal is void - just verify it's gone below

        // Verify it's gone
        let query = vec![1.0, 0.0];
        let results = store.search(&query, 10);
        assert!(
            !results.iter().any(|r| r.id == "doc1"),
            "Removed doc should not appear in search"
        );
    }

    #[test]
    fn test_vector_store_clear() {
        let mut store = VectorStore::with_dim(2);

        let entry1 = create_test_entry("doc1", "meta1");
        let entry2 = create_test_entry("doc2", "meta2");

        store
            .insert(&entry1, vec![1.0, 0.0])
            .expect("VectorStore insert should succeed with correct dimension");
        store
            .insert(&entry2, vec![0.0, 1.0])
            .expect("VectorStore insert should succeed with correct dimension");

        store.clear();

        let query = vec![1.0, 0.0];
        let results = store.search(&query, 10);
        assert_eq!(results.len(), 0, "Store should be empty after clear");
    }
}

#[cfg(test)]
mod consolidation_tests {
    use super::super::consolidation::{Consolidator, ConsolidatorConfig};
    use super::super::{LongTermMemory, MidTermMemory, ShortTermMemory};
    use crate::unified_memory_v2::types::{MemoryEntry, MemoryType};
    use std::time::{SystemTime, UNIX_EPOCH};

    fn create_test_entry(id: &str, importance: f32, age_secs: i64) -> MemoryEntry {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("SystemTime should be after UNIX_EPOCH")
            .as_secs() as i64;

        let mut entry = MemoryEntry::new(
            format!("Content for {}", id),
            importance,
            MemoryType::Conversation,
        );
        entry.id = id.to_string();
        entry.created_at = (now - age_secs) * 1000; // Convert to millis
        entry.updated_at = (now - age_secs) * 1000;
        entry
    }

    #[tokio::test]
    async fn test_consolidation_stm_to_mtm() {
        let consolidator = Consolidator::with_config(ConsolidatorConfig {
            // Seuil réduit pour test (1s)
            stm_transfer_age_ms: 1_000,
            ..ConsolidatorConfig::default()
        });
        let mut stm = ShortTermMemory::default();
        let mut mtm = MidTermMemory::default();
        let mut ltm = LongTermMemory::default();

        // Add old entries to STM (should be transferred)
        stm.push(create_test_entry("old1", 0.6, 5))
            .expect("STM push should succeed for a valid MemoryEntry"); // 5 seconds old
        stm.push(create_test_entry("old2", 0.7, 5))
            .expect("STM push should succeed for a valid MemoryEntry");

        // Add new entry to STM (should stay)
        stm.push(create_test_entry("new1", 0.5, 0))
            .expect("STM push should succeed for a valid MemoryEntry");

        // Run consolidation
        let result = consolidator.consolidate(&mut stm, &mut mtm, &mut ltm).await;

        assert!(
            result.stm_to_mtm >= 2,
            "Should transfer old entries from STM to MTM"
        );
        assert!(
            stm.get_all().len() <= 1,
            "Old entries should be moved out of STM"
        );
    }
}
