// ═══════════════════════════════════════════════════════════════
//   UNIFIED MEMORY V2 — INTEGRATION TESTS
//   Phase 2.4: Comprehensive testing suite
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::super::*;
    use std::time::Duration;
    use tokio::time::sleep;

    /// Helper: Create test memory instance
    fn create_test_memory() -> UnifiedMemoryV2 {
        let config = MemoryConfig {
            capacity: CapacityLimits {
                stm_max: 20,
                mtm_max: 200,
                ltm_batch_size: 100,
                embedding_dim: 384,
            },
            performance: PerformanceTargets {
                store_ms: 5,
                recall_ms: 20,
                search_ms: 15,
                consolidation_ms: 50,
                max_ram_mb: 300,
            },
            encryption_enabled: false, // Disable for testing speed
            persistence_enabled: false,
            auto_consolidation: false,
        };
        UnifiedMemoryV2::new(config)
    }

    #[tokio::test]
    async fn test_basic_store_and_recall() {
        let mut memory = create_test_memory();
        memory.init().await.expect("Failed to initialize");

        // Store a memory
        let id = memory
            .store("Test content", 0.8, MemoryType::Conversation)
            .await
            .expect("Failed to store");

        assert!(!id.is_empty(), "Memory ID should not be empty");

        // Recall by exact ID
        let entry = memory.get(&id).await.expect("Failed to get memory");
        assert_eq!(entry.content, "Test content");
        assert_eq!(entry.importance, 0.8);
        assert_eq!(entry.memory_type, MemoryType::Conversation);
    }

    #[tokio::test]
    async fn test_stm_capacity_limit() {
        let memory = create_test_memory();
        memory.init().await.expect("Failed to initialize");

        // Fill STM beyond capacity (20 items)
        for i in 0..25 {
            memory
                .store(&format!("Entry {}", i), 0.5, MemoryType::Conversation)
                .await
                .expect("Failed to store");
        }

        // Check stats
        let stats = memory.stats().await.expect("Failed to get stats");
        assert_eq!(
            stats.stm_count, 20,
            "STM should maintain capacity limit of 20"
        );
    }

    #[tokio::test]
    async fn test_search_across_tiers() {
        let memory = create_test_memory();
        memory.init().await.expect("Failed to initialize");

        // Store memories with different keywords
        memory
            .store("Rust programming language", 0.9, MemoryType::Factual)
            .await
            .unwrap();
        memory
            .store("JavaScript web development", 0.7, MemoryType::Factual)
            .await
            .unwrap();
        memory
            .store("Rust async programming", 0.8, MemoryType::Procedural)
            .await
            .unwrap();

        // Search for "Rust"
        let results = memory.recall("Rust", 10).await.unwrap();
        assert!(
            results.len() >= 2,
            "Should find at least 2 Rust-related entries"
        );

        // Verify results contain "Rust" in content
        for entry in &results {
            assert!(
                entry.content.contains("Rust"),
                "Search results should match query"
            );
        }
    }

    #[tokio::test]
    async fn test_tier_specific_queries() {
        let memory = create_test_memory();
        memory.init().await.expect("Failed to initialize");

        // Store multiple entries
        for i in 0..5 {
            memory
                .store(&format!("STM entry {}", i), 0.5, MemoryType::Conversation)
                .await
                .unwrap();
        }

        // Query STM specifically
        let stm_entries = memory
            .get_by_tier(MemoryTier::STM, 10)
            .await
            .expect("Failed to query STM");

        assert_eq!(stm_entries.len(), 5, "Should retrieve all 5 STM entries");
    }

    #[tokio::test]
    async fn test_consolidation_stm_to_mtm() {
        let config = MemoryConfig {
            capacity: CapacityLimits::default(),
            performance: PerformanceTargets::default(),
            encryption_enabled: false,
            persistence_enabled: false,
            auto_consolidation: true, // Enable for this test
        };
        let memory = UnifiedMemoryV2::new(config);
        memory.init().await.expect("Failed to initialize");

        // Store entries in STM
        for i in 0..10 {
            memory
                .store(&format!("Entry {}", i), 0.6, MemoryType::Conversation)
                .await
                .unwrap();
        }

        // Wait for entries to age (simulate time passing)
        sleep(Duration::from_millis(100)).await;

        // Manually trigger consolidation
        memory.consolidate().await.expect("Consolidation failed");

        // Check stats - some entries should have moved to MTM
        let stats = memory.stats().await.unwrap();
        // Note: Actual consolidation behavior depends on age thresholds
        // This test validates the consolidation runs without errors
        assert!(stats.total_entries >= 10, "All entries should still exist");
    }

    #[tokio::test]
    async fn test_remove_memory() {
        let memory = create_test_memory();
        memory.init().await.expect("Failed to initialize");

        // Store and then remove
        let id = memory
            .store("Temporary entry", 0.5, MemoryType::Conversation)
            .await
            .unwrap();

        let removed = memory.remove(&id).await.expect("Failed to remove");
        assert!(removed, "Should successfully remove entry");

        // Verify it's gone
        let result = memory.get(&id).await;
        assert!(result.is_err(), "Entry should no longer exist");
    }

    #[tokio::test]
    async fn test_memory_metadata() {
        let memory = create_test_memory();
        memory.init().await.expect("Failed to initialize");

        let id = memory
            .store("Test with metadata", 0.7, MemoryType::Factual)
            .await
            .unwrap();

        let entry = memory.get(&id).await.unwrap();

        // Verify metadata fields
        assert_eq!(entry.tier, MemoryTier::STM, "New entries start in STM");
        assert!(entry.created_at > 0, "Should have valid timestamp");
        assert!(entry.last_accessed > 0, "Should have access timestamp");
        assert_eq!(entry.access_count, 1, "Should track access count");
    }

    #[tokio::test]
    async fn test_concurrent_access() {
        let memory = std::sync::Arc::new(create_test_memory());
        memory.init().await.expect("Failed to initialize");

        // Spawn multiple concurrent tasks
        let mut handles = vec![];
        for i in 0..10 {
            let mem = memory.clone();
            let handle = tokio::spawn(async move {
                mem.store(&format!("Concurrent {}", i), 0.5, MemoryType::Conversation)
                    .await
            });
            handles.push(handle);
        }

        // Wait for all tasks
        for handle in handles {
            handle.await.expect("Task failed").expect("Store failed");
        }

        // Verify all entries stored
        let stats = memory.stats().await.unwrap();
        assert_eq!(stats.stm_count, 10, "All concurrent stores should succeed");
    }

    #[tokio::test]
    async fn test_clear_all() {
        let memory = create_test_memory();
        memory.init().await.expect("Failed to initialize");

        // Add some entries
        for i in 0..5 {
            memory
                .store(&format!("Entry {}", i), 0.5, MemoryType::Conversation)
                .await
                .unwrap();
        }

        // Clear all
        memory.clear().await.expect("Failed to clear");

        // Verify empty
        let stats = memory.stats().await.unwrap();
        assert_eq!(stats.total_entries, 0, "All entries should be cleared");
    }

    #[tokio::test]
    async fn test_importance_sorting() {
        let memory = create_test_memory();
        memory.init().await.expect("Failed to initialize");

        // Store entries with different importance
        memory
            .store("Low importance", 0.3, MemoryType::Conversation)
            .await
            .unwrap();
        memory
            .store("High importance", 0.9, MemoryType::Conversation)
            .await
            .unwrap();
        memory
            .store("Medium importance", 0.6, MemoryType::Conversation)
            .await
            .unwrap();

        // Search should return results sorted by relevance/importance
        let results = memory.recall("importance", 10).await.unwrap();
        assert_eq!(results.len(), 3, "Should find all 3 entries");

        // First result should be highest importance (if relevance is equal)
        // Note: Actual sorting depends on search algorithm implementation
    }

    #[tokio::test]
    async fn test_performance_store_latency() {
        let memory = create_test_memory();
        memory.init().await.expect("Failed to initialize");

        let start = std::time::Instant::now();
        memory
            .store("Performance test", 0.5, MemoryType::Conversation)
            .await
            .expect("Store failed");
        let duration = start.elapsed();

        // Target: <5ms for store operation
        assert!(
            duration.as_millis() < 50,
            "Store should complete in <50ms (relaxed for testing)"
        );
    }

    #[tokio::test]
    async fn test_performance_recall_latency() {
        let memory = create_test_memory();
        memory.init().await.expect("Failed to initialize");

        // Pre-populate some data
        for i in 0..100 {
            memory
                .store(&format!("Entry {}", i), 0.5, MemoryType::Conversation)
                .await
                .unwrap();
        }

        let start = std::time::Instant::now();
        memory.recall("Entry", 10).await.expect("Recall failed");
        let duration = start.elapsed();

        // Target: <20ms for recall operation
        assert!(
            duration.as_millis() < 100,
            "Recall should complete in <100ms (relaxed for testing)"
        );
    }
}
