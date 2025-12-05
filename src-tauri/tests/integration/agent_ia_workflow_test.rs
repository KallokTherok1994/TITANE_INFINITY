// TITANE∞ v∞.19.3Ω - Phase 9 Integration Tests
// Agent → Permission → IA → Record Complete Workflow
// Copyright (c) 2025 TITANE∞ Team

use std::sync::Arc;
use tokio::sync::RwLock;
use titane_infinity::multi_agents::permissions::{
    AgentPermissionManager, AgentRole, AgentIAPermission, AgentConfig,
};
use titane_infinity::singularity::ia_context::{
    IAContext, IARequestRecord,
};

#[tokio::test]
async fn test_complete_agent_ia_workflow() {
    // Setup: Create agent manager and IA context
    let mut agent_manager = AgentPermissionManager::new();
    let ia_context = Arc::new(RwLock::new(IAContext::new()));

    // Phase 1: Create agent "code_gen" with OpenAIOnly permission
    let mut agent_config = AgentConfig::new(
        "code_gen".to_string(),
        AgentRole::CodeGenerator,
        "Code Generator Test".to_string(),
    );
    agent_config.ia_permission = AgentIAPermission::OpenAIOnly;
    agent_manager.register_agent(agent_config);

    println!("✅ Phase 1: Agent 'code_gen' created with OpenAIOnly permission");

    // Phase 2: Verify Claude access is DENIED
    let can_use_claude = agent_manager
        .can_agent_use_provider("code_gen", "claude");
    assert!(
        !can_use_claude,
        "Agent with OpenAIOnly should NOT access Claude"
    );
    println!("✅ Phase 2: Claude access correctly denied");

    // Phase 3: Verify OpenAI access is ALLOWED
    let can_use_openai = agent_manager
        .can_agent_use_provider("code_gen", "openai");
    assert!(
        can_use_openai,
        "Agent with OpenAIOnly should access OpenAI"
    );
    println!("✅ Phase 3: OpenAI access correctly allowed");

    // Phase 4: Setup IA context with OpenAI engine
    {
        let mut ctx = ia_context.write().await;
        ctx.available_engines = vec!["openai".to_string()];
        ctx.set_active_engine("openai".to_string());
    }
    println!("✅ Phase 4: IA Context configured with OpenAI");

    // Phase 5: Simulate successful IA request
    let request_id = uuid::Uuid::new_v4().to_string();
    let record = IARequestRecord {
        request_id: request_id.clone(),
        engine: "openai".to_string(),
        agent_id: Some("code_gen".to_string()),
        timestamp: chrono::Utc::now().to_rfc3339(),
        latency_ms: 250,
        tokens: 1000,
        success: true,
        error_message: None,
        fallback_used: false,
    };

    {
        let mut ctx = ia_context.write().await;
        ctx.record_request(record);
    }
    println!("✅ Phase 5: IA request recorded");

    // Phase 6: Verify request recorded correctly
    {
        let ctx = ia_context.read().await;
        assert_eq!(
            ctx.request_history.len(), 1,
            "Should have exactly 1 request in history"
        );
        assert_eq!(
            ctx.request_history[0].agent_id,
            Some("code_gen".to_string()),
            "Request should be associated with code_gen agent"
        );
        assert_eq!(
            ctx.request_history[0].engine, "openai",
            "Request should use OpenAI engine"
        );
        assert!(
            ctx.request_history[0].success,
            "Request should be successful"
        );
        println!("✅ Phase 6: Request history verified");
    }

    // Phase 7: Verify metrics updated correctly
    {
        let ctx = ia_context.read().await;
        let metrics = ctx.engine_metrics.get("openai")
            .expect("OpenAI metrics should exist");

        assert_eq!(
            metrics.total_requests, 1,
            "Should have 1 total request"
        );
        assert_eq!(
            metrics.successful_requests, 1,
            "Should have 1 successful request"
        );
        assert_eq!(
            metrics.failed_requests, 0,
            "Should have 0 failed requests"
        );
        assert_eq!(
            metrics.average_latency_ms, 250,
            "Average latency should be 250ms"
        );
        assert_eq!(
            metrics.total_tokens, 1000,
            "Total tokens should be 1000"
        );
        println!("✅ Phase 7: Metrics verified (1 req, 250ms latency, 1000 tokens)");
    }

    // Phase 8: Test permission enforcement on second request
    let can_use_gemini = agent_manager
        .can_agent_use_provider("code_gen", "gemini");
    assert!(
        !can_use_gemini,
        "Agent with OpenAIOnly should NOT access Gemini"
    );
    println!("✅ Phase 8: Gemini access correctly denied");

    println!("\n🎉 Complete Agent→IA workflow test PASSED!");
    println!("   - Permission enforcement: ✅");
    println!("   - Request recording: ✅");
    println!("   - Metrics tracking: ✅");
    println!("   - Agent association: ✅");
}

#[tokio::test]
async fn test_multi_agent_concurrent_requests() {
    // Test multiple agents making concurrent requests with different permissions
    let mut agent_manager = AgentPermissionManager::new();
    let ia_context = Arc::new(RwLock::new(IAContext::new()));

    // Create 3 agents with different permissions
    let mut agent1 = AgentConfig::new(
        "agent_openai".to_string(),
        AgentRole::CodeGenerator,
        "OpenAI Agent".to_string(),
    );
    agent1.ia_permission = AgentIAPermission::OpenAIOnly;
    agent_manager.register_agent(agent1);

    let mut agent2 = AgentConfig::new(
        "agent_claude".to_string(),
        AgentRole::Analyst,
        "Claude Agent".to_string(),
    );
    agent2.ia_permission = AgentIAPermission::ClaudeOnly;
    agent_manager.register_agent(agent2);

    let mut agent3 = AgentConfig::new(
        "agent_all".to_string(),
        AgentRole::Admin,
        "All Access Agent".to_string(),
    );
    agent3.ia_permission = AgentIAPermission::AllExternal;
    agent_manager.register_agent(agent3);

    // Setup IA context
    {
        let mut ctx = ia_context.write().await;
        ctx.available_engines = vec![
            "openai".to_string(),
            "claude".to_string(),
            "gemini".to_string(),
        ];
    }

    // Spawn concurrent requests
    let mut handles = vec![];

    for i in 0..3 {
        let ctx = ia_context.clone();
        let agent_id = match i {
            0 => "agent_openai",
            1 => "agent_claude",
            _ => "agent_all",
        };
        let engine = match i {
            0 => "openai",
            1 => "claude",
            _ => "gemini",
        };

        let handle = tokio::spawn(async move {
            let record = IARequestRecord {
                request_id: format!("req-{}", i),
                engine: engine.to_string(),
                agent_id: Some(agent_id.to_string()),
                timestamp: chrono::Utc::now().to_rfc3339(),
                latency_ms: 100 + (i * 50),
                tokens: (500 + (i * 100)) as usize,
                success: true,
                error_message: None,
                fallback_used: false,
            };

            let mut ctx = ctx.write().await;
            ctx.record_request(record);
        });
        handles.push(handle);
    }

    // Wait for all concurrent requests
    for handle in handles {
        handle.await.expect("Task should complete");
    }

    // Verify all requests recorded
    {
        let ctx = ia_context.read().await;
        assert_eq!(
            ctx.request_history.len(), 3,
            "Should have 3 requests in history"
        );

        // Verify different engines used
        let engines: Vec<String> = ctx.request_history
            .iter()
            .map(|r| r.engine.clone())
            .collect();
        assert!(engines.contains(&"openai".to_string()));
        assert!(engines.contains(&"claude".to_string()));
        assert!(engines.contains(&"gemini".to_string()));

        println!("✅ Multi-agent concurrent requests test PASSED!");
        println!("   - 3 concurrent requests processed");
        println!("   - All engines tracked correctly");
    }
}
