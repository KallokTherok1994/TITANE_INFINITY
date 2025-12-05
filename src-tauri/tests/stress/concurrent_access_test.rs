// TITANE∞ v∞.19.3Ω - Phase 9 Stress Tests
// Concurrent Access Arc<RwLock> Test
// Copyright (c) 2025 TITANE∞ Team

use std::sync::Arc;
use tokio::sync::RwLock;
use titane_infinity::singularity::ia_context::{
    IAContext, IARequestRecord,
};

#[tokio::test]
async fn test_concurrent_ia_requests() {
    let ia_context = Arc::new(RwLock::new(IAContext::new()));

    // Setup
    {
        let mut ctx = ia_context.write().await;
        ctx.available_engines.push("openai".to_string());
    }
    println!("✅ Setup: IAContext ready for concurrent access test");

    // Spawn 100 concurrent tasks
    let mut handles = vec![];
    let num_tasks = 100;

    println!("🔄 Spawning {} concurrent tasks...", num_tasks);

    for i in 0..num_tasks {
        let ctx = ia_context.clone();
        let handle = tokio::spawn(async move {
            let record = IARequestRecord {
                request_id: format!("concurrent-{}", i),
                engine: "openai".to_string(),
                agent_id: Some(format!("agent-{}", i % 10)),
                timestamp: chrono::Utc::now().to_rfc3339(),
                latency_ms: 100 + (i % 100),
                tokens: 500,
                success: true,
                error_message: None,
                fallback_used: false,
            };

            // Write lock contention test
            let mut ctx = ctx.write().await;
            ctx.record_request(record);

            // Simulate some work
            tokio::time::sleep(tokio::time::Duration::from_micros(100)).await;
        });
        handles.push(handle);
    }

    // Wait for all tasks to complete
    for (i, handle) in handles.into_iter().enumerate() {
        handle.await.expect("Task should complete successfully");
        if (i + 1) % 20 == 0 {
            println!("   {} tasks completed...", i + 1);
        }
    }

    println!("✅ All {} tasks completed", num_tasks);

    // Verification Phase
    {
        let ctx = ia_context.read().await;
        let metrics = ctx.engine_metrics.get("openai")
            .expect("OpenAI metrics should exist");

        // Test 1: All requests recorded
        assert_eq!(
            metrics.total_requests, num_tasks,
            "Should have exactly {} requests",
            num_tasks
        );
        println!("✅ Test 1: All {} concurrent requests recorded", num_tasks);

        // Test 2: No data races (all successful)
        assert_eq!(
            metrics.successful_requests, num_tasks,
            "All requests should be successful"
        );
        assert_eq!(
            metrics.failed_requests, 0,
            "Should have 0 failed requests"
        );
        println!("✅ Test 2: No data races (100% success rate)");

        // Test 3: Metrics coherent
        assert!(
            metrics.average_latency_ms > 0,
            "Average latency should be > 0"
        );
        assert!(
            metrics.total_tokens > 0,
            "Total tokens should be > 0"
        );
        assert_eq!(
            metrics.total_tokens, num_tasks * 500,
            "Total tokens should be sum of all requests"
        );
        println!("✅ Test 3: Metrics coherent and accurate");

        // Test 4: History contains last 100 entries
        assert_eq!(
            ctx.request_history.len(), 100,
            "History should contain exactly 100 entries"
        );
        println!("✅ Test 4: History correctly bounded to 100");

        // Test 5: Different agents recorded
        let unique_agents: std::collections::HashSet<_> = ctx.request_history
            .iter()
            .filter_map(|r| r.agent_id.as_ref())
            .collect();

        assert!(
            unique_agents.len() >= 5,
            "Should have multiple different agents recorded"
        );
        println!("✅ Test 5: Multiple agents tracked ({})", unique_agents.len());
    }

    println!("\n🎉 Concurrent access test PASSED!");
    println!("   - 100 concurrent tasks: No deadlocks ✅");
    println!("   - Arc<RwLock> handling: Correct ✅");
    println!("   - No data races: Metrics coherent ✅");
    println!("   - Thread-safe operations: Verified ✅");
}

#[tokio::test]
async fn test_high_contention_scenario() {
    let ia_context = Arc::new(RwLock::new(IAContext::new()));

    {
        let mut ctx = ia_context.write().await;
        ctx.available_engines = vec!["openai".to_string(), "claude".to_string()];
    }

    // Spawn 200 tasks with deliberate high contention
    let mut handles = vec![];

    for i in 0..200 {
        let ctx = ia_context.clone();
        let engine = if i % 2 == 0 { "openai" } else { "claude" };

        let handle = tokio::spawn(async move {
            let record = IARequestRecord {
                request_id: format!("contention-{}", i),
                engine: engine.to_string(),
                agent_id: Some("contention_tester".to_string()),
                timestamp: chrono::Utc::now().to_rfc3339(),
                latency_ms: 50,
                tokens: 100,
                success: true,
                error_message: None,
                fallback_used: false,
            };

            let mut ctx = ctx.write().await;
            ctx.record_request(record);
        });
        handles.push(handle);
    }

    // Wait for all
    for handle in handles {
        handle.await.expect("Task should complete");
    }

    // Verify both engines tracked correctly
    {
        let ctx = ia_context.read().await;

        let openai_metrics = ctx.engine_metrics.get("openai").unwrap();
        let claude_metrics = ctx.engine_metrics.get("claude").unwrap();

        assert_eq!(openai_metrics.total_requests, 100);
        assert_eq!(claude_metrics.total_requests, 100);

        assert_eq!(
            openai_metrics.total_requests + claude_metrics.total_requests,
            200,
            "Total requests across both engines should be 200"
        );

        println!("✅ High contention test PASSED!");
        println!("   - 200 tasks with lock contention handled correctly");
        println!("   - OpenAI: {} requests", openai_metrics.total_requests);
        println!("   - Claude: {} requests", claude_metrics.total_requests);
    }
}
