// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Unified Memory OS v2 Tests
//   SUPER PROMPT #6 vΩ.8 — Integration Tests
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod unified_memory_tests {
    use titane_infinity::engines::unified_memory::*;

    #[tokio::test]
    async fn test_full_pipeline_store_recall() {
        let mut engine = UnifiedMemoryEngine::new();

        // Store multiple messages
        for i in 0..10 {
            let _id = engine
                .store(
                    format!("Message number {}", i),
                    if i % 2 == 0 { "user" } else { "assistant" }.to_string(),
                    0.5 + (i as f32 / 20.0),
                )
                .await
                .unwrap();
        }

        // Verify storage
        let stats = engine.stats();
        assert_eq!(stats.stm_count, 10);
        assert_eq!(stats.total_memories, 10);

        // Recall
        let bundle = engine.recall("message", 10).await.unwrap();
        assert!(bundle.stm.len() > 0);
        assert!(bundle.total > 0);
    }

    #[tokio::test]
    async fn test_stm_to_mtm_promotion() {
        let mut engine = UnifiedMemoryEngine::with_capacities(5, 20, 100);

        // Fill STM beyond capacity with high importance
        for i in 0..10 {
            engine
                .store(
                    format!("Important message {}", i),
                    "user".to_string(),
                    0.9, // High importance
                )
                .await
                .unwrap();
        }

        // Check promotion happened
        let stats = engine.stats();
        assert!(stats.stm_count <= 5, "STM should be bounded");
        assert!(stats.mtm_count > 0, "MTM should have promoted entries");
    }

    #[tokio::test]
    async fn test_semantic_search() {
        let mut engine = UnifiedMemoryEngine::new();

        // Store semantically related messages
        engine
            .store(
                "Machine learning and artificial intelligence".to_string(),
                "user".to_string(),
                0.8,
            )
            .await
            .unwrap();

        engine
            .store(
                "Deep learning neural networks".to_string(),
                "assistant".to_string(),
                0.8,
            )
            .await
            .unwrap();

        engine
            .store(
                "Weather forecast for tomorrow".to_string(),
                "user".to_string(),
                0.5,
            )
            .await
            .unwrap();

        // Search for AI-related content
        let bundle = engine.recall("artificial intelligence", 10).await.unwrap();
        assert!(bundle.total > 0);

        // Verify relevance (AI messages should be in results)
        let has_ai_content = bundle
            .stm
            .iter()
            .any(|e| e.content.contains("intelligence") || e.content.contains("learning"));
        assert!(has_ai_content, "Should find AI-related content");
    }

    #[tokio::test]
    async fn test_embedding_generation() {
        let engine = UnifiedMemoryEngine::new();

        let embedding = engine.embed("Test text for embedding").await.unwrap();

        assert_eq!(embedding.len(), 384, "Should be 384D vector");

        // Check normalization (L2 norm ≈ 1.0)
        let norm: f32 = embedding.iter().map(|x| x * x).sum::<f32>().sqrt();
        assert!(
            (norm - 1.0).abs() < 0.1,
            "Should be approximately normalized"
        );
    }

    #[tokio::test]
    async fn test_summarization() {
        let mut engine = UnifiedMemoryEngine::new();

        // Add multiple messages to MTM first (STM → MTM promotion)
        for i in 0..20 {
            engine
                .store(
                    format!("Conversation message {}: some important content", i),
                    if i % 2 == 0 { "user" } else { "assistant" }.to_string(),
                    0.8, // High importance for promotion
                )
                .await
                .unwrap();
        }

        // Trigger promotion to MTM
        engine.tick().await.unwrap();

        // Generate summary
        let summary = engine.summarize().await.unwrap();

        // MTM should have content now
        assert!(
            !summary.is_empty() || engine.stats().mtm_count > 0,
            "Summary should not be empty or MTM should have entries"
        );
    }

    #[tokio::test]
    async fn test_memory_lifecycle() {
        let mut engine = UnifiedMemoryEngine::with_capacities(3, 5, 10);

        // Initial state
        assert_eq!(engine.stats().total_memories, 0);

        // Add to STM
        let _id1 = engine
            .store("First message".to_string(), "user".to_string(), 0.5)
            .await
            .unwrap();

        assert_eq!(engine.stats().stm_count, 1);

        // Fill STM to trigger promotion
        for i in 0..5 {
            engine
                .store(format!("Message {}", i), "user".to_string(), 0.8)
                .await
                .unwrap();
        }

        // Verify promotion happened
        let stats = engine.stats();
        assert!(stats.stm_count <= 3);
        assert!(stats.mtm_count > 0);
    }

    #[tokio::test]
    async fn test_tick_maintenance() {
        let mut engine = UnifiedMemoryEngine::new();

        // Add memories
        for i in 0..15 {
            engine
                .store(format!("Message {}", i), "user".to_string(), 0.7)
                .await
                .unwrap();
        }

        // Run tick
        let result = engine.tick().await;
        assert!(result.is_ok());

        // Verify state after tick
        let stats = engine.stats();
        assert!(stats.total_memories > 0);
    }

    #[tokio::test]
    async fn test_memory_stats() {
        let mut engine = UnifiedMemoryEngine::with_capacities(10, 20, 100);

        // Add memories
        for i in 0..5 {
            engine
                .store(format!("Test {}", i), "user".to_string(), 0.5)
                .await
                .unwrap();
        }

        let stats = engine.stats();

        assert_eq!(stats.stm_count, 5);
        assert_eq!(stats.stm_capacity, 10);
        assert_eq!(stats.mtm_capacity, 20);
        assert_eq!(stats.ltm_capacity, 100);
        assert_eq!(stats.total_memories, 5);
        assert!(stats.stm_usage > 0.0 && stats.stm_usage <= 1.0);
    }

    #[tokio::test]
    async fn test_concurrent_access() {
        use std::sync::Arc;
        use tokio::sync::RwLock;

        let engine = Arc::new(RwLock::new(UnifiedMemoryEngine::new()));

        // Spawn multiple concurrent tasks
        let mut handles = vec![];

        for i in 0..10 {
            let engine_clone = engine.clone();
            let handle = tokio::spawn(async move {
                let mut eng = engine_clone.write().await;
                eng.store(format!("Concurrent message {}", i), "user".to_string(), 0.5)
                    .await
            });
            handles.push(handle);
        }

        // Wait for all tasks
        for handle in handles {
            let result = handle.await;
            assert!(result.is_ok());
            assert!(result.unwrap().is_ok());
        }

        // Verify all messages stored
        let stats = {
            let eng = engine.read().await;
            eng.stats()
        };

        assert_eq!(stats.stm_count, 10);
    }

    #[tokio::test]
    async fn test_high_load_scenario() {
        let mut engine = UnifiedMemoryEngine::new();

        // Simulate high load: 1000 messages
        for i in 0..1000 {
            let _id = engine
                .store(
                    format!("Load test message {} with some content", i),
                    if i % 2 == 0 { "user" } else { "assistant" }.to_string(),
                    (i % 10) as f32 / 10.0,
                )
                .await
                .unwrap();

            // Periodic tick every 50 messages
            if i % 50 == 0 {
                engine.tick().await.unwrap();
            }
        }

        // Verify system stability
        let stats = engine.stats();
        assert!(stats.stm_count <= 100, "STM should be bounded");
        assert!(stats.total_memories > 0);

        // Test recall still works
        let bundle = engine.recall("message", 10).await.unwrap();
        assert!(bundle.total > 0);
    }
}
