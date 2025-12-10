// TITANE∞ v∞.19.3Ω - Phase 9 Integration Tests
// Singularity State IAContext Integration Test
// Copyright (c) 2025 TITANE∞ Team

use titane_infinity::singularity::{
    ia_context::{IAContext, IAStatus},
    SingularityStateVInfinity,
};

#[test]
fn test_singularity_state_with_ia_context() {
    println!("🔄 Testing Singularity IAContext integration...\n");

    // Test 1: Create SingularityStateVInfinity
    let singularity = SingularityStateVInfinity::init();
    println!("✅ Test 1: SingularityStateVInfinity initialized");

    // Test 2: Verify IAContext present (engine #23)
    assert!(
        singularity.ia_context.active_engine.is_none(),
        "IAContext should start with no active engine"
    );
    assert_eq!(
        singularity.ia_context.available_engines.len(),
        1,
        "IAContext should start with 1 default engine (local)"
    );
    assert_eq!(
        singularity.ia_context.available_engines[0], "local",
        "Default engine should be 'local'"
    );
    println!("✅ Test 2: IAContext present as engine #23 with default 'local' engine");

    // Test 3: Modify IAContext
    let mut modified_singularity = singularity.clone();
    modified_singularity.ia_context.available_engines = vec![
        "openai".to_string(),
        "claude".to_string(),
        "gemini".to_string(),
    ];
    modified_singularity
        .ia_context
        .set_active_engine("openai".to_string());
    modified_singularity
        .ia_context
        .update_engine_status("openai", IAStatus::Available);
    println!("✅ Test 3: IAContext modified (3 engines, openai active)");

    // Test 4: Verify modifications
    assert_eq!(
        modified_singularity.ia_context.active_engine,
        Some("openai".to_string()),
        "Active engine should be set to openai"
    );
    assert_eq!(
        modified_singularity.ia_context.available_engines.len(),
        3,
        "Should have 3 available engines"
    );
    println!("✅ Test 4: Modifications verified");

    // Test 5: Serialize to JSON
    let json =
        serde_json::to_string_pretty(&modified_singularity).expect("Should serialize successfully");

    assert!(
        json.contains("ia_context"),
        "JSON should contain ia_context field"
    );
    assert!(json.contains("openai"), "JSON should contain openai engine");
    assert!(json.contains("claude"), "JSON should contain claude engine");
    println!("✅ Test 5: Serialization successful");
    println!("   - ia_context field present");
    println!("   - All engines serialized");

    // Test 6: Deserialize and verify integrity
    let deserialized: SingularityStateVInfinity =
        serde_json::from_str(&json).expect("Should deserialize successfully");

    assert_eq!(
        deserialized.ia_context.active_engine,
        Some("openai".to_string()),
        "Deserialized active engine should match"
    );
    assert_eq!(
        deserialized.ia_context.available_engines.len(),
        3,
        "Deserialized available engines count should match"
    );
    assert!(
        deserialized
            .ia_context
            .available_engines
            .contains(&"openai".to_string()),
        "Should contain openai"
    );
    assert!(
        deserialized
            .ia_context
            .available_engines
            .contains(&"claude".to_string()),
        "Should contain claude"
    );
    assert!(
        deserialized
            .ia_context
            .available_engines
            .contains(&"gemini".to_string()),
        "Should contain gemini"
    );
    println!("✅ Test 6: Deserialization successful");
    println!("   - All fields preserved");
    println!("   - Integrity maintained");

    // Test 7: Verify engine status preserved
    let openai_status = deserialized
        .ia_context
        .engine_status
        .get("openai")
        .expect("OpenAI status should exist");
    assert_eq!(
        *openai_status,
        IAStatus::Available,
        "OpenAI status should be Available"
    );
    println!("✅ Test 7: Engine status preserved");

    println!("\n🎉 Singularity IAContext integration test PASSED!");
    println!("   - IAContext as engine #23: ✅");
    println!("   - Modifications persist: ✅");
    println!("   - Serialization/Deserialization: ✅");
    println!("   - State integrity: ✅");
}

#[test]
fn test_singularity_merge_with_ia_context() {
    // Simplified test: verify IAContext can be cloned and compared
    let mut state1 = SingularityStateVInfinity::init();
    let mut state2 = SingularityStateVInfinity::init();

    // Modify state1's IAContext
    state1.ia_context.available_engines = vec!["openai".to_string()];
    state1.ia_context.set_active_engine("openai".to_string());

    // Verify state2 is still default
    assert!(state2.ia_context.active_engine.is_none());

    // Clone state1's IAContext to state2
    state2.ia_context = state1.ia_context.clone();

    // Verify clone worked
    assert_eq!(
        state2.ia_context.available_engines.len(),
        1,
        "State2 should have 1 available engine after clone"
    );
    assert_eq!(
        state2.ia_context.active_engine,
        Some("openai".to_string()),
        "State2 should have openai active after clone"
    );

    println!("✅ Singularity IAContext clone test PASSED!");
}

#[test]
fn test_ia_context_clone() {
    let mut original = IAContext::new();
    original.available_engines = vec!["openai".to_string(), "claude".to_string()];
    original.set_active_engine("openai".to_string());

    let cloned = original.clone();

    assert_eq!(original.active_engine, cloned.active_engine);
    assert_eq!(original.available_engines, cloned.available_engines);

    println!("✅ IAContext clone test PASSED!");
}
