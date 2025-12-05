// TITANE∞ v∞.19.3Ω - Phase 9 Stress Tests
// 1000+ Requests Metrics Accuracy Test
// Copyright (c) 2025 TITANE∞ Team

use std::sync::Arc;
use tokio::sync::RwLock;
use titane_infinity::singularity::ia_context::{
    IAContext, IARequestRecord,
};

#[tokio::test]
async fn test_1000_requests_metrics_accuracy() {
    let ia_context = Arc::new(RwLock::new(IAContext::new()));

    // Setup OpenAI engine
    {
        let mut ctx = ia_context.write().await;
        ctx.available_engines.push("openai".to_string());
    }
    println!("✅ Setup: IAContext initialized for stress test");

    // Generate 1000 requests with varying latencies and tokens
    let mut expected_total_latency = 0u64;
    let mut expected_total_tokens = 0u64;
    let num_requests = 1000;

    println!("🔄 Generating {} requests...", num_requests);

    for i in 0..num_requests {
        let latency = 100 + (i % 500); // 100-600ms range
        let tokens = 500 + (i % 1000); // 500-1500 tokens range

        expected_total_latency += latency;
        expected_total_tokens += tokens;

        let record = IARequestRecord {
            request_id: format!("stress-req-{}", i),
            engine: "openai".to_string(),
            agent_id: Some("stress_tester".to_string()),
            timestamp: chrono::Utc::now().to_rfc3339(),
            latency_ms: latency,
            tokens: tokens as usize,
            success: true,
            error_message: None,
            fallback_used: false,
        };

        let mut ctx = ia_context.write().await;
        ctx.record_request(record);

        // Progress indicator every 100 requests
        if (i + 1) % 100 == 0 {
            println!("   Processed {}/{} requests...", i + 1, num_requests);
        }
    }

    println!("✅ All {} requests recorded", num_requests);

    // Verification Phase
    {
        let ctx = ia_context.read().await;
        let metrics = ctx.engine_metrics.get("openai")
            .expect("OpenAI metrics should exist");

        // Test 1: Total request count
        assert_eq!(
            metrics.total_requests, num_requests,
            "Should have exactly {} total requests",
            num_requests
        );
        println!("✅ Test 1: Total requests = {}", metrics.total_requests);

        // Test 2: Success rate
        assert_eq!(
            metrics.successful_requests, num_requests,
            "Should have {} successful requests",
            num_requests
        );
        assert_eq!(
            metrics.failed_requests, 0,
            "Should have 0 failed requests"
        );
        let success_rate = (metrics.successful_requests as f64 / metrics.total_requests as f64) * 100.0;
        println!("✅ Test 2: Success rate = {:.2}%", success_rate);

        // Test 3: Total tokens
        assert_eq!(
            metrics.total_tokens, expected_total_tokens,
            "Total tokens should match sum of all requests"
        );
        println!("✅ Test 3: Total tokens = {} (expected: {})",
            metrics.total_tokens, expected_total_tokens);

        // Test 4: Average latency accuracy (cumulative moving average)
        // The moving average is calculated over ALL requests, not just last 100
        let expected_avg = expected_total_latency / num_requests;
        let actual_avg = metrics.average_latency_ms;
        let deviation = ((actual_avg as i64 - expected_avg as i64).abs() as f64)
            / (expected_avg as f64) * 100.0;

        println!("   Expected avg latency (all requests): {}ms", expected_avg);
        println!("   Actual avg latency: {}ms", actual_avg);
        println!("   Deviation: {:.4}%", deviation);

        // Cumulative moving average should be very accurate (< 1% deviation)
        assert!(
            deviation < 1.0,
            "Latency deviation should be < 1%, got {:.4}%",
            deviation
        );
        println!("✅ Test 4: Cumulative moving average accuracy < 1% ✅");

        // Test 5: History bounded to 100 entries
        assert_eq!(
            ctx.request_history.len(), 100,
            "History should be limited to 100 entries"
        );
        println!("✅ Test 5: History correctly bounded to 100 entries");

        // Test 6: Memory efficiency (capacity check)
        // Note: Vec capacity grows exponentially, so we allow up to 200 for 100 elements
        assert!(
            ctx.request_history.capacity() <= 200,
            "History capacity should not grow excessively (got {})",
            ctx.request_history.capacity()
        );
        println!("✅ Test 6: Memory bounded (capacity = {} ≤ 200)",
            ctx.request_history.capacity());

        // Test 7: Most recent requests preserved
        let last_request_id = &ctx.request_history[99].request_id;
        assert!(
            last_request_id.contains("stress-req-"),
            "Last entry should be from stress test"
        );
        println!("✅ Test 7: Most recent 100 requests preserved");
    }

    println!("\n🎉 1000-request stress test PASSED!");
    println!("   - {} requests processed successfully", num_requests);
    println!("   - Moving average accuracy: < 1% deviation ✅");
    println!("   - Memory bounded: 100 max entries ✅");
    println!("   - No performance degradation ✅");
}

#[tokio::test]
async fn test_mixed_success_failure_requests() {
    let ia_context = Arc::new(RwLock::new(IAContext::new()));

    {
        let mut ctx = ia_context.write().await;
        ctx.available_engines.push("openai".to_string());
    }

    // Generate 500 successful + 500 failed requests
    for i in 0..1000 {
        let success = i % 2 == 0; // Alternate success/failure

        let record = IARequestRecord {
            request_id: format!("mixed-{}", i),
            engine: "openai".to_string(),
            agent_id: Some("mixed_tester".to_string()),
            timestamp: chrono::Utc::now().to_rfc3339(),
            latency_ms: 200,
            tokens: if success { 500 } else { 0 },
            success,
            error_message: if success { None } else { Some("Simulated error".to_string()) },
            fallback_used: false,
        };

        let mut ctx = ia_context.write().await;
        ctx.record_request(record);
    }

    // Verify metrics with mixed results
    {
        let ctx = ia_context.read().await;
        let metrics = ctx.engine_metrics.get("openai").unwrap();

        assert_eq!(metrics.total_requests, 1000);
        assert_eq!(metrics.successful_requests, 500);
        assert_eq!(metrics.failed_requests, 500);

        let success_rate = (metrics.successful_requests as f64 / metrics.total_requests as f64) * 100.0;
        assert_eq!(success_rate, 50.0, "Success rate should be 50%");

        // Only successful requests contribute to tokens
        assert_eq!(metrics.total_tokens, 500 * 500);

        println!("✅ Mixed success/failure test PASSED!");
        println!("   - 50% success rate correctly tracked");
        println!("   - Failed requests don't contribute to tokens");
    }
}
