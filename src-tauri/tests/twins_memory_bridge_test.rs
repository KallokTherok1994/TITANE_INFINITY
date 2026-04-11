use serde_json::json;
use titane_infinity::core::modules::unified_memory::UnifiedMemory;
use titane_infinity::digital_twin_v14_1::memory_bridge::MemoryBridge;

#[test]
fn twin_memory_bridge_stores_and_recalls_kevin_context() {
    let mut memory = UnifiedMemory::new();
    let bridge = MemoryBridge::new();

    let store_result = bridge.store_numeric_twin_state(
        &mut memory,
        "phase_transition",
        0.93,
        "Improving",
        "Symbiosis",
        0.87,
        &["kevin", "symbiose", "retour-au-vivant"],
        json!({
            "owner": "Kevin Thibault",
            "reflectionAxis": "clarté intérieure"
        }),
    );

    assert!(
        store_result.is_ok(),
        "twin snapshot should store into UnifiedMemory"
    );

    let recalled = bridge
        .recall_twin_memories(&mut memory, "Kevin symbiose clarté", 5)
        .expect("twin memory recall should succeed");

    assert!(
        !recalled.is_empty(),
        "stored twin memory should be found again"
    );
    assert!(
        recalled
            .iter()
            .any(|entry| entry.content.contains("Kevin Thibault")),
        "owner context should remain present in recalled twin memories"
    );
}
