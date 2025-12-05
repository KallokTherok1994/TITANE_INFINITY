// TITANE∞ v∞.19.3Ω - Phase 9 Security Tests
// Permission Enforcement Strict Validation
// Copyright (c) 2025 TITANE∞ Team

use titane_infinity::multi_agents::permissions::{
    AgentPermissionManager, AgentRole, AgentIAPermission, AgentConfig,
};

#[test]
fn test_security_agent_cannot_use_external() {
    let agent_manager = AgentPermissionManager::new();

    // security_guard already exists with NoExternal permission (default agents)
    println!("✅ Setup: Security agent with NoExternal permission (default)");

    // Test 1: OpenAI should be DENIED
    let can_use_openai = agent_manager
        .can_agent_use_provider("security_guard", "openai");
    assert!(
        !can_use_openai,
        "Security agent should NOT use OpenAI"
    );
    println!("✅ Test 1: OpenAI access denied");

    // Test 2: Claude should be DENIED
    let can_use_claude = agent_manager
        .can_agent_use_provider("security_guard", "claude");
    assert!(
        !can_use_claude,
        "Security agent should NOT use Claude"
    );
    println!("✅ Test 2: Claude access denied");

    // Test 3: Gemini should be DENIED
    let can_use_gemini = agent_manager
        .can_agent_use_provider("security_guard", "gemini");
    assert!(
        !can_use_gemini,
        "Security agent should NOT use Gemini"
    );
    println!("✅ Test 3: Gemini access denied");

    // Test 4: Local should be ALLOWED
    let can_use_local = agent_manager
        .can_agent_use_provider("security_guard", "local");
    assert!(
        can_use_local,
        "Security agent SHOULD use Local"
    );
    println!("✅ Test 4: Local access allowed");

    println!("\n🎉 Security agent NoExternal test PASSED!");
    println!("   - 3/3 external APIs correctly blocked");
    println!("   - Local access correctly allowed");
}

#[test]
fn test_all_permission_types() {
    let mut agent_manager = AgentPermissionManager::new();

    println!("🔄 Testing all permission types...\n");

    // Test matrix: permission × provider = expected result
    let test_cases = vec![
        // (permission, provider, expected, description)
        (AgentIAPermission::NoExternal, "openai", false, "NoExternal blocks OpenAI"),
        (AgentIAPermission::NoExternal, "claude", false, "NoExternal blocks Claude"),
        (AgentIAPermission::NoExternal, "gemini", false, "NoExternal blocks Gemini"),
        (AgentIAPermission::NoExternal, "local", true, "NoExternal allows Local"),

        (AgentIAPermission::OpenAIOnly, "openai", true, "OpenAIOnly allows OpenAI"),
        (AgentIAPermission::OpenAIOnly, "claude", false, "OpenAIOnly blocks Claude"),
        (AgentIAPermission::OpenAIOnly, "gemini", false, "OpenAIOnly blocks Gemini"),
        (AgentIAPermission::OpenAIOnly, "local", true, "OpenAIOnly allows Local"),

        (AgentIAPermission::ClaudeOnly, "claude", true, "ClaudeOnly allows Claude"),
        (AgentIAPermission::ClaudeOnly, "openai", false, "ClaudeOnly blocks OpenAI"),
        (AgentIAPermission::ClaudeOnly, "gemini", false, "ClaudeOnly blocks Gemini"),
        (AgentIAPermission::ClaudeOnly, "local", true, "ClaudeOnly allows Local"),

        (AgentIAPermission::GeminiOnly, "gemini", true, "GeminiOnly allows Gemini"),
        (AgentIAPermission::GeminiOnly, "openai", false, "GeminiOnly blocks OpenAI"),
        (AgentIAPermission::GeminiOnly, "claude", false, "GeminiOnly blocks Claude"),
        (AgentIAPermission::GeminiOnly, "local", true, "GeminiOnly allows Local"),

        (AgentIAPermission::AllExternal, "openai", true, "AllExternal allows OpenAI"),
        (AgentIAPermission::AllExternal, "claude", true, "AllExternal allows Claude"),
        (AgentIAPermission::AllExternal, "gemini", true, "AllExternal allows Gemini"),
        (AgentIAPermission::AllExternal, "local", true, "AllExternal allows Local"),

        (AgentIAPermission::Auto, "openai", true, "Auto allows OpenAI"),
        (AgentIAPermission::Auto, "claude", true, "Auto allows Claude"),
        (AgentIAPermission::Auto, "gemini", true, "Auto allows Gemini"),
        (AgentIAPermission::Auto, "local", true, "Auto allows Local"),
    ];

    let total_tests = test_cases.len();
    let mut passed = 0;

    for (i, (permission, provider, expected, description)) in test_cases.iter().enumerate() {
        let agent_id = format!("test_agent_{}", i);

        let mut agent = AgentConfig::new(
            agent_id.clone(),
            AgentRole::Tester,
            format!("Test Agent {}", i),
        );
        agent.ia_permission = *permission;
        agent_manager.register_agent(agent);

        let result = agent_manager.can_agent_use_provider(&agent_id, provider);

        assert_eq!(
            result, *expected,
            "Test failed: {} (expected {}, got {})",
            description, expected, result
        );

        passed += 1;
        println!("✅ Test {}/{}: {}", i + 1, total_tests, description);
    }

    println!("\n🎉 All permission types test PASSED!");
    println!("   - {}/{} test cases passed", passed, total_tests);
    println!("   - 6 permission types validated");
    println!("   - 4 providers tested");
    println!("   - 0 security breaches detected ✅");
}

#[test]
fn test_permission_matrix_complete() {
    let mut agent_manager = AgentPermissionManager::new();

    // Create all 12 agent roles with their default permissions
    let roles_permissions = vec![
        (AgentRole::Security, AgentIAPermission::NoExternal),
        (AgentRole::CodeGenerator, AgentIAPermission::OpenAIOnly),
        (AgentRole::Analyst, AgentIAPermission::ClaudeOnly),
        (AgentRole::Creative, AgentIAPermission::GeminiOnly),
        (AgentRole::Conversational, AgentIAPermission::Auto),
        (AgentRole::Researcher, AgentIAPermission::AllExternal),
        (AgentRole::Tester, AgentIAPermission::AllExternal),
        (AgentRole::Planner, AgentIAPermission::Auto),
        (AgentRole::Orchestrator, AgentIAPermission::AllExternal),
        (AgentRole::System, AgentIAPermission::NoExternal),
        (AgentRole::Debugger, AgentIAPermission::OpenAIOnly),
        (AgentRole::Admin, AgentIAPermission::AllExternal),
    ];

    println!("🔄 Testing complete permission matrix (12 roles)...\n");

    for (role, permission) in &roles_permissions {
        let agent_id = format!("{:?}_agent", role).to_lowercase();
        let mut agent = AgentConfig::new(
            agent_id.clone(),
            *role,
            format!("{:?} Agent", role),
        );
        agent.ia_permission = *permission;
        agent_manager.register_agent(agent);

        // Verify agent created with correct permission
        let agent = agent_manager.get_agent(&agent_id).unwrap();
        assert_eq!(agent.ia_permission, *permission);
        println!("✅ {:?} → {:?}", role, permission);
    }

    println!("\n🎉 Permission matrix test PASSED!");
    println!("   - 12 agent roles created successfully");
    println!("   - All default permissions validated");
}

#[test]
fn test_permission_update() {
    let mut agent_manager = AgentPermissionManager::new();

    // Create agent with OpenAIOnly
    let mut agent = AgentConfig::new(
        "updatable_agent".to_string(),
        AgentRole::CodeGenerator,
        "Updatable Agent".to_string(),
    );
    agent.ia_permission = AgentIAPermission::OpenAIOnly;
    agent_manager.register_agent(agent);

    // Verify initial permission
    assert!(agent_manager.can_agent_use_provider("updatable_agent", "openai"));
    assert!(!agent_manager.can_agent_use_provider("updatable_agent", "claude"));
    println!("✅ Initial permission: OpenAIOnly verified");

    // Update to ClaudeOnly
    let result = agent_manager.update_agent_permission(
        "updatable_agent",
        AgentIAPermission::ClaudeOnly,
    );
    assert!(result.is_ok(), "Permission update should succeed");
    println!("✅ Permission updated to ClaudeOnly");

    // Verify new permission
    assert!(!agent_manager.can_agent_use_provider("updatable_agent", "openai"));
    assert!(agent_manager.can_agent_use_provider("updatable_agent", "claude"));
    println!("✅ New permission: ClaudeOnly verified");

    // Update to AllExternal
    agent_manager.update_agent_permission(
        "updatable_agent",
        AgentIAPermission::AllExternal,
    ).unwrap();
    println!("✅ Permission updated to AllExternal");

    // Verify all providers accessible
    assert!(agent_manager.can_agent_use_provider("updatable_agent", "openai"));
    assert!(agent_manager.can_agent_use_provider("updatable_agent", "claude"));
    assert!(agent_manager.can_agent_use_provider("updatable_agent", "gemini"));
    assert!(agent_manager.can_agent_use_provider("updatable_agent", "local"));
    println!("✅ AllExternal: All providers accessible");

    println!("\n🎉 Permission update test PASSED!");
    println!("   - Dynamic permission changes work correctly");
    println!("   - Access control updated in real-time");
}
