// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Unified Memory API v2
//   SUPER PROMPT #6 vΩ.8 — Tauri Commands
// ═══════════════════════════════════════════════════════════════

use super::models::{MemoryBundle, MemoryEntry};
use super::{MemoryStats, UnifiedMemoryEngine};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Shared memory engine instance
pub type SharedMemoryEngine = Arc<RwLock<UnifiedMemoryEngine>>;

// ═══════════════════════════════════════════════════════════════
//   TAURI COMMANDS
// ═══════════════════════════════════════════════════════════════

/// Get memory statistics
#[tauri::command]
pub async fn memory_v2_get_stats(
    engine: tauri::State<'_, SharedMemoryEngine>,
) -> Result<MemoryStats, String> {
    let engine = engine.read().await;
    Ok(engine.stats())
}

/// Store new memory entry
#[tauri::command]
pub async fn memory_v2_store(
    engine: tauri::State<'_, SharedMemoryEngine>,
    content: String,
    role: String,
    importance: f32,
) -> Result<String, String> {
    let mut engine = engine.write().await;
    engine.store(content, role, importance).await
}

/// Recall memories
#[tauri::command]
pub async fn memory_v2_recall(
    engine: tauri::State<'_, SharedMemoryEngine>,
    query: String,
    max_results: usize,
) -> Result<MemoryBundle, String> {
    let mut engine = engine.write().await;
    engine.recall(&query, max_results).await
}

/// Embed text
#[tauri::command]
pub async fn memory_v2_embed(
    engine: tauri::State<'_, SharedMemoryEngine>,
    text: String,
) -> Result<Vec<f32>, String> {
    let engine = engine.read().await;
    engine.embed(&text).await
}

/// Summarize current session
#[tauri::command]
pub async fn memory_v2_summarize(
    engine: tauri::State<'_, SharedMemoryEngine>,
) -> Result<String, String> {
    let mut engine = engine.write().await;
    engine.summarize().await
}

/// Get current summary
#[tauri::command]
pub async fn memory_v2_get_summary(
    engine: tauri::State<'_, SharedMemoryEngine>,
) -> Result<String, String> {
    let engine = engine.read().await;
    Ok(engine.get_summary().to_string())
}

/// Run maintenance tick
#[tauri::command]
pub async fn memory_v2_tick(
    engine: tauri::State<'_, SharedMemoryEngine>,
) -> Result<String, String> {
    let mut engine = engine.write().await;
    engine.tick().await?;
    Ok("Tick completed successfully".to_string())
}

/// Clear all memories (dangerous!)
#[tauri::command]
pub async fn memory_v2_clear_all(
    engine: tauri::State<'_, SharedMemoryEngine>,
) -> Result<String, String> {
    let mut engine = engine.write().await;
    engine.clear_all();
    Ok("All memories cleared".to_string())
}

/// Get STM memories
#[tauri::command]
pub async fn memory_v2_get_stm(
    engine: tauri::State<'_, SharedMemoryEngine>,
    limit: usize,
) -> Result<Vec<MemoryEntry>, String> {
    let mut engine = engine.write().await;
    let bundle = engine.recall("", limit).await?;
    Ok(bundle.stm)
}

/// Get MTM memories
#[tauri::command]
pub async fn memory_v2_get_mtm(
    engine: tauri::State<'_, SharedMemoryEngine>,
) -> Result<Vec<MemoryEntry>, String> {
    let mut engine = engine.write().await;
    let bundle = engine.recall("", 100).await?;
    Ok(bundle.mtm)
}

/// Get LTM memories
#[tauri::command]
pub async fn memory_v2_get_ltm(
    engine: tauri::State<'_, SharedMemoryEngine>,
    query: String,
    limit: usize,
) -> Result<Vec<MemoryEntry>, String> {
    let mut engine = engine.write().await;
    let bundle = engine.recall(&query, limit).await?;
    Ok(bundle.ltm)
}

/// Search memories semantically
#[tauri::command]
pub async fn memory_v2_search_semantic(
    engine: tauri::State<'_, SharedMemoryEngine>,
    query: String,
    limit: usize,
) -> Result<MemoryBundle, String> {
    let mut engine = engine.write().await;
    engine.recall(&query, limit).await
}

// ═══════════════════════════════════════════════════════════════
//   HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/// Create shared memory engine instance
pub fn create_shared_engine() -> SharedMemoryEngine {
    Arc::new(RwLock::new(UnifiedMemoryEngine::new()))
}

/// Create shared engine with custom capacities
pub fn create_shared_engine_with_capacities(
    stm_size: usize,
    mtm_size: usize,
    ltm_size: usize,
) -> SharedMemoryEngine {
    Arc::new(RwLock::new(UnifiedMemoryEngine::with_capacities(
        stm_size, mtm_size, ltm_size,
    )))
}

// ═══════════════════════════════════════════════════════════════
//   REGISTRATION HELPER
// ═══════════════════════════════════════════════════════════════

/// Register all memory v2 commands with Tauri
///
/// Usage in main.rs:
/// ```rust,ignore
/// tauri::Builder::default()
///     .manage(unified_memory::api::create_shared_engine())
///     .invoke_handler(tauri::generate_handler![
///         unified_memory::api::memory_v2_get_stats,
///         unified_memory::api::memory_v2_store,
///         unified_memory::api::memory_v2_recall,
///         // ... other commands
///     ])
/// ```
pub fn register_commands() -> Vec<String> {
    vec![
        "memory_v2_get_stats".to_string(),
        "memory_v2_store".to_string(),
        "memory_v2_recall".to_string(),
        "memory_v2_embed".to_string(),
        "memory_v2_summarize".to_string(),
        "memory_v2_get_summary".to_string(),
        "memory_v2_tick".to_string(),
        "memory_v2_clear_all".to_string(),
        "memory_v2_get_stm".to_string(),
        "memory_v2_get_mtm".to_string(),
        "memory_v2_get_ltm".to_string(),
        "memory_v2_search_semantic".to_string(),
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_shared_engine_creation() {
        let engine = create_shared_engine();
        let stats = {
            let eng = engine.read().await;
            eng.stats()
        };

        assert_eq!(stats.stm_count, 0);
        assert_eq!(stats.total_memories, 0);
    }

    #[tokio::test]
    async fn test_shared_engine_store() {
        let engine = create_shared_engine();

        let result = {
            let mut eng = engine.write().await;
            eng.store("Test message".to_string(), "user".to_string(), 0.5)
                .await
        };

        assert!(result.is_ok());

        let stats = {
            let eng = engine.read().await;
            eng.stats()
        };

        assert_eq!(stats.stm_count, 1);
    }

    #[tokio::test]
    async fn test_concurrent_access() {
        let engine = create_shared_engine();
        let engine_clone = engine.clone();

        // Concurrent writes
        let handle1 = tokio::spawn(async move {
            let mut eng = engine.write().await;
            eng.store("Message 1".to_string(), "user".to_string(), 0.5)
                .await
        });

        let handle2 = tokio::spawn(async move {
            let mut eng = engine_clone.write().await;
            eng.store("Message 2".to_string(), "user".to_string(), 0.6)
                .await
        });

        let results = tokio::join!(handle1, handle2);
        assert!(results.0.is_ok());
        assert!(results.1.is_ok());
    }
}
