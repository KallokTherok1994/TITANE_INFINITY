// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1 — DEVTOOLS API COMMANDS
//   Tauri IPC commands for DevTools OS
//   Super Prompt #9: Live Debugger, Memory, Metrics, Analyzer
// ═══════════════════════════════════════════════════════════════

use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

use super::analyzer::{AnalyzerEngine, AnalyzerReport, SystemMetricsInput};
use super::debugger::{DebuggerEvent, DebuggerStats, LiveDebugger};
use super::memory_inspector::{
    MemoryBundle, MemoryEntry, MemoryHealthReport, MemoryInspector, MemorySearchResult,
    MemorySystemStats,
};
use super::metrics::MetricsCollector;

// ═══════════════════════════════════════════════════════════════
// GLOBAL DEVTOOLS INSTANCES
// ═══════════════════════════════════════════════════════════════

/// Global Live Debugger instance
pub static LIVE_DEBUGGER: Lazy<LiveDebugger> = Lazy::new(LiveDebugger::new);

/// Global Memory Inspector instance
pub static MEMORY_INSPECTOR: Lazy<MemoryInspector> = Lazy::new(MemoryInspector::new);

/// Global Analyzer Engine instance
pub static ANALYZER_ENGINE: Lazy<AnalyzerEngine> = Lazy::new(AnalyzerEngine::new);

/// DevTools enabled flag
static DEVTOOLS_ENABLED: Lazy<Arc<RwLock<bool>>> = Lazy::new(|| Arc::new(RwLock::new(true)));

// ═══════════════════════════════════════════════════════════════
// RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════

/// Generic DevTools response wrapper
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DevToolsResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
    pub timestamp: i64,
}

impl<T> DevToolsResponse<T> {
    pub fn ok(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
            timestamp: chrono::Utc::now().timestamp_millis(),
        }
    }

    pub fn err(error: impl Into<String>) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(error.into()),
            timestamp: chrono::Utc::now().timestamp_millis(),
        }
    }
}

/// System metrics snapshot for frontend
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemMetricsSnapshot {
    pub cpu_pct: f32,
    pub ram_mb: f32,
    pub latency_ms: u128,
    pub ttft_ms: u128,
    pub uptime_ms: u64,
    pub engine_health: String,
}

/// Combined DevTools status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DevToolsStatus {
    pub enabled: bool,
    pub debugger_enabled: bool,
    pub debugger_events: usize,
    pub memory_entries: usize,
    pub analyzer_available: bool,
    pub version: String,
}

// ═══════════════════════════════════════════════════════════════
// TAURI COMMANDS — DEBUGGER
// ═══════════════════════════════════════════════════════════════

/// Get the last N debug events
#[tauri::command]
pub async fn devtools_debug_last(n: usize) -> DevToolsResponse<Vec<DebuggerEvent>> {
    if !*DEVTOOLS_ENABLED.read().await {
        return DevToolsResponse::err("DevTools is disabled");
    }

    let events = LIVE_DEBUGGER.last(n).await;
    DevToolsResponse::ok(events)
}

/// Get debugger statistics
#[tauri::command]
pub async fn devtools_debug_stats() -> DevToolsResponse<DebuggerStats> {
    if !*DEVTOOLS_ENABLED.read().await {
        return DevToolsResponse::err("DevTools is disabled");
    }

    let stats = LIVE_DEBUGGER.stats().await;
    DevToolsResponse::ok(stats)
}

/// Clear debugger events
#[tauri::command]
pub async fn devtools_debug_clear() -> DevToolsResponse<bool> {
    if !*DEVTOOLS_ENABLED.read().await {
        return DevToolsResponse::err("DevTools is disabled");
    }

    LIVE_DEBUGGER.clear().await;
    DevToolsResponse::ok(true)
}

/// Enable/disable debugger
#[tauri::command]
pub async fn devtools_debug_toggle(enabled: bool) -> DevToolsResponse<bool> {
    if enabled {
        LIVE_DEBUGGER.enable().await;
    } else {
        LIVE_DEBUGGER.disable().await;
    }
    DevToolsResponse::ok(enabled)
}

// ═══════════════════════════════════════════════════════════════
// TAURI COMMANDS — MEMORY INSPECTOR
// ═══════════════════════════════════════════════════════════════

/// Get memory system statistics
#[tauri::command]
pub async fn devtools_memory_stats() -> DevToolsResponse<MemorySystemStats> {
    if !*DEVTOOLS_ENABLED.read().await {
        return DevToolsResponse::err("DevTools is disabled");
    }

    let stats = MEMORY_INSPECTOR.get_stats().await;
    DevToolsResponse::ok(stats)
}

/// Export all memory layers
#[tauri::command]
pub async fn devtools_memory_export() -> DevToolsResponse<MemoryBundle> {
    if !*DEVTOOLS_ENABLED.read().await {
        return DevToolsResponse::err("DevTools is disabled");
    }

    let bundle = MEMORY_INSPECTOR.export_all().await;
    DevToolsResponse::ok(bundle)
}

/// Export STM entries
#[tauri::command]
pub async fn devtools_memory_stm() -> DevToolsResponse<Vec<MemoryEntry>> {
    if !*DEVTOOLS_ENABLED.read().await {
        return DevToolsResponse::err("DevTools is disabled");
    }

    let entries = MEMORY_INSPECTOR.export_stm().await;
    DevToolsResponse::ok(entries)
}

/// Export LTM entries (with optional limit)
#[tauri::command]
pub async fn devtools_memory_ltm(limit: Option<usize>) -> DevToolsResponse<Vec<MemoryEntry>> {
    if !*DEVTOOLS_ENABLED.read().await {
        return DevToolsResponse::err("DevTools is disabled");
    }

    let entries = MEMORY_INSPECTOR.export_ltm(limit).await;
    DevToolsResponse::ok(entries)
}

/// Search memories by keyword
#[tauri::command]
pub async fn devtools_memory_search(
    query: String,
    limit: Option<usize>,
) -> DevToolsResponse<Vec<MemorySearchResult>> {
    if !*DEVTOOLS_ENABLED.read().await {
        return DevToolsResponse::err("DevTools is disabled");
    }

    let results = MEMORY_INSPECTOR.search(&query, limit).await;
    DevToolsResponse::ok(results)
}

/// KNN semantic search
#[tauri::command]
pub async fn devtools_knn(
    text: String,
    k: Option<usize>,
) -> DevToolsResponse<Vec<MemorySearchResult>> {
    if !*DEVTOOLS_ENABLED.read().await {
        return DevToolsResponse::err("DevTools is disabled");
    }

    let results = MEMORY_INSPECTOR.knn(&text, k).await;
    DevToolsResponse::ok(results)
}

/// Memory health check
#[tauri::command]
pub async fn devtools_memory_health() -> DevToolsResponse<MemoryHealthReport> {
    if !*DEVTOOLS_ENABLED.read().await {
        return DevToolsResponse::err("DevTools is disabled");
    }

    let report = MEMORY_INSPECTOR.health_check().await;
    DevToolsResponse::ok(report)
}

// ═══════════════════════════════════════════════════════════════
// TAURI COMMANDS — ANALYZER
// ═══════════════════════════════════════════════════════════════

/// Run full system analysis
#[tauri::command]
pub async fn devtools_analyze(
    system_metrics: Option<SystemMetricsInput>,
) -> DevToolsResponse<AnalyzerReport> {
    if !*DEVTOOLS_ENABLED.read().await {
        return DevToolsResponse::err("DevTools is disabled");
    }

    let debugger_stats = LIVE_DEBUGGER.stats().await;
    let memory_stats = MEMORY_INSPECTOR.get_stats().await;

    let report = ANALYZER_ENGINE
        .analyze(&debugger_stats, &memory_stats, system_metrics.as_ref())
        .await;

    DevToolsResponse::ok(report)
}

// ═══════════════════════════════════════════════════════════════
// TAURI COMMANDS — SYSTEM METRICS
// ═══════════════════════════════════════════════════════════════

/// Get current system metrics snapshot
#[tauri::command]
pub async fn devtools_metrics() -> DevToolsResponse<SystemMetricsSnapshot> {
    if !*DEVTOOLS_ENABLED.read().await {
        return DevToolsResponse::err("DevTools is disabled");
    }

    // Create a basic metrics snapshot
    // In production, these would come from actual system monitoring
    let stats = LIVE_DEBUGGER.stats().await;

    let snapshot = SystemMetricsSnapshot {
        cpu_pct: 0.0, // Would use sysinfo crate in production
        ram_mb: 0.0,  // Would use sysinfo crate in production
        latency_ms: stats.avg_duration_ms as u128,
        ttft_ms: stats.avg_duration_ms as u128 / 2,
        uptime_ms: (chrono::Utc::now().timestamp_millis() - stats.session_start) as u64,
        engine_health: "Healthy".to_string(),
    };

    DevToolsResponse::ok(snapshot)
}

// ═══════════════════════════════════════════════════════════════
// TAURI COMMANDS — DEVTOOLS CONTROL
// ═══════════════════════════════════════════════════════════════

/// Get DevTools status
#[tauri::command]
pub async fn devtools_status() -> DevToolsResponse<DevToolsStatus> {
    let enabled = *DEVTOOLS_ENABLED.read().await;
    let debugger_enabled = LIVE_DEBUGGER.is_enabled().await;
    let events = LIVE_DEBUGGER.last(0).await;
    let memory_stats = MEMORY_INSPECTOR.get_stats().await;

    let status = DevToolsStatus {
        enabled,
        debugger_enabled,
        debugger_events: events.len(),
        memory_entries: memory_stats.total_entries,
        analyzer_available: true,
        version: "v20.1-DevTools-OS".to_string(),
    };

    DevToolsResponse::ok(status)
}

/// Enable DevTools
#[tauri::command]
pub async fn devtools_enable() -> DevToolsResponse<bool> {
    *DEVTOOLS_ENABLED.write().await = true;
    LIVE_DEBUGGER.enable().await;
    DevToolsResponse::ok(true)
}

/// Disable DevTools (for production)
#[tauri::command]
pub async fn devtools_disable() -> DevToolsResponse<bool> {
    *DEVTOOLS_ENABLED.write().await = false;
    LIVE_DEBUGGER.disable().await;
    DevToolsResponse::ok(false)
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS FOR ENGINE INTEGRATION
// ═══════════════════════════════════════════════════════════════

/// Record a debug event from any engine
/// This can be called from other modules to record events
pub async fn record_engine_event(engine: &str, duration_ms: u128, details: impl Into<String>) {
    LIVE_DEBUGGER.record(engine, duration_ms, details).await;
}

/// Record an error event
pub async fn record_engine_error(engine: &str, error: &str, duration_ms: u128) {
    LIVE_DEBUGGER.record_error(engine, error, duration_ms).await;
}

/// Record an AI call
pub async fn record_ai_event(
    provider: &str,
    duration_ms: u128,
    input_tokens: usize,
    output_tokens: usize,
) {
    LIVE_DEBUGGER
        .record_ai_call(provider, duration_ms, input_tokens, output_tokens)
        .await;
}

/// Record a memory operation
pub async fn record_memory_event(
    operation: &str,
    layer: &str,
    duration_ms: u128,
    items_affected: usize,
) {
    LIVE_DEBUGGER
        .record_memory_op(operation, layer, duration_ms, items_affected)
        .await;
}

// ═══════════════════════════════════════════════════════════════
// COMMAND LIST FOR REGISTRATION
// ═══════════════════════════════════════════════════════════════

/// Get all DevTools commands for Tauri registration
/// Usage in main.rs: .invoke_handler(tauri::generate_handler![...devtools::api::get_commands()])
pub fn get_command_names() -> Vec<&'static str> {
    vec![
        "devtools_debug_last",
        "devtools_debug_stats",
        "devtools_debug_clear",
        "devtools_debug_toggle",
        "devtools_memory_stats",
        "devtools_memory_export",
        "devtools_memory_stm",
        "devtools_memory_ltm",
        "devtools_memory_search",
        "devtools_knn",
        "devtools_memory_health",
        "devtools_analyze",
        "devtools_metrics",
        "devtools_status",
        "devtools_enable",
        "devtools_disable",
    ]
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_devtools_status() {
        let response = devtools_status().await;
        assert!(response.success);
        assert!(response.data.is_some());

        let status = response
            .data
            .expect("devtools_status should return data when enabled");
        assert!(status.analyzer_available);
    }

    #[tokio::test]
    async fn test_devtools_enable_disable() {
        // Enable
        let response = devtools_enable().await;
        assert!(response.success);
        assert_eq!(response.data, Some(true));

        // Check enabled
        let status = devtools_status().await;
        assert!(status
            .data
            .expect("status should include data after enable")
            .enabled);

        // Disable
        let response = devtools_disable().await;
        assert!(response.success);
        assert_eq!(response.data, Some(false));
    }

    #[tokio::test]
    async fn test_debug_last() {
        devtools_enable().await;

        // Record some events
        record_engine_event("TestEngine", 50, "Test event 1").await;
        record_engine_event("TestEngine", 75, "Test event 2").await;

        let response = devtools_debug_last(10).await;
        assert!(response.success);
        assert!(response.data.is_some());
    }

    #[tokio::test]
    async fn test_memory_stats() {
        devtools_enable().await;

        let response = devtools_memory_stats().await;
        assert!(response.success);
    }

    #[tokio::test]
    async fn test_analyze() {
        devtools_enable().await;

        let response = devtools_analyze(None).await;
        assert!(response.success);
        assert!(response.data.is_some());

        let report = response
            .data
            .expect("analyze should return a report when enabled");
        assert!(report.risk_score >= 0.0);
        assert!(report.stability_score >= 0.0);
    }

    #[tokio::test]
    async fn test_disabled_devtools() {
        devtools_disable().await;

        let response = devtools_debug_last(10).await;
        assert!(!response.success);
        assert!(response.error.is_some());

        // Re-enable for other tests
        devtools_enable().await;
    }
}
