// ═══════════════════════════════════════════════════════════════
//   UNIFIED MEMORY V2 — INTEGRATION TESTS (Simplified)
//   Phase 2.4: Basic validation tests
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod integration_tests {
    use super::super::*;

    /// Helper: Create test memory instance
    fn create_test_config() -> MemoryConfig {
        MemoryConfig {
            targets: PerformanceTargets::default(),
            limits: CapacityLimits::default(),
            consolidation: config::ConsolidationConfig::default(),
            forgetting: config::ForgettingConfig::default(),
            evolution: config::EvolutionConfig::default(),
            encryption_enabled: false, // Disable for testing speed
            persistence_enabled: false,
        }
    }

    #[tokio::test]
    async fn test_memory_initialization() {
        let config = create_test_config();
        let mut memory = UnifiedMemoryV2::new(config);
        
        let result = memory.init().await;
        assert!(result.is_ok(), "Memory initialization should succeed");
    }

    #[tokio::test]
    async fn test_store_and_retrieve() {
        let config = create_test_config();
        let mut memory = UnifiedMemoryV2::new(config);
        memory.init().await.expect("Init failed");

        // Store a memory
        let id = memory
            .store("Test content", 0.8, types::MemoryType::Conversation)
            .await
            .expect("Store failed");

        assert!(!id.is_empty(), "Should return valid ID");

        // Retrieve it
        let entry = memory.get(&id).await.expect("Get failed");
        assert_eq!(entry.content, "Test content");
        assert!((entry.importance - 0.8).abs() < 0.01);
    }

    #[tokio::test]
    async fn test_recall_search() {
        let config = create_test_config();
        let mut memory = UnifiedMemoryV2::new(config);
        memory.init().await.unwrap();

        // Store multiple entries
        memory
            .store("Rust programming", 0.9, types::MemoryType::Factual)
            .await
            .unwrap();
        memory
            .store("Python scripting", 0.7, types::MemoryType::Factual)
            .await
            .unwrap();

        // Search
        let results = memory.recall("programming", 10).await.unwrap();
        assert!(!results.is_empty(), "Should find matching entries");
    }

    #[tokio::test]
    async fn test_clear_all() {
        let config = create_test_config();
        let mut memory = UnifiedMemoryV2::new(config);
        memory.init().await.unwrap();

        // Add entries
        memory
            .store("Entry 1", 0.5, types::MemoryType::Conversation)
            .await
            .unwrap();
        memory
            .store("Entry 2", 0.5, types::MemoryType::Conversation)
            .await
            .unwrap();

        // Clear
        memory.clear().await.expect("Clear failed");

        // Verify empty
        let stats = memory.stats().await.unwrap();
        assert_eq!(stats.snapshot.total_count, 0, "Should be empty after clear");
    }
}
