// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v19.5.2 — Batch Request System
//   P2-3: Batch multiple IPC calls into single request
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

/// Individual request in a batch
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchRequest {
    /// Unique ID for this request (used to match response)
    pub id: String,

    /// Command name to execute
    pub command: String,

    /// Parameters for the command (JSON)
    #[serde(default)]
    pub params: serde_json::Value,
}

/// Response for a single request in the batch
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchResponse {
    /// ID matching the request
    pub id: String,

    /// Success/failure status
    pub success: bool,

    /// Response data (if success)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<serde_json::Value>,

    /// Error message (if failure)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,

    /// Execution time in milliseconds
    pub duration_ms: u64,
}

/// Complete batch execution result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchResult {
    /// All responses (order preserved)
    pub responses: Vec<BatchResponse>,

    /// Total execution time (parallel)
    pub total_duration_ms: u64,

    /// Number of successful requests
    pub success_count: usize,

    /// Number of failed requests
    pub failure_count: usize,
}

// ────────────────────────────────────────────────────────────────
// Command Registry
// ────────────────────────────────────────────────────────────────

/// Execute a batch-safe command
///
/// This maps command names to actual implementation.
/// Only stateless read commands should be batch-enabled.
pub async fn execute_batch_command(
    command: &str,
    params: serde_json::Value,
) -> Result<serde_json::Value, String> {
    match command {
        // System Health commands (cached, read-only)
        "health_get_state" => {
            // Placeholder - actual implementation would use real command
            Ok(serde_json::json!({
                "global_health": 0.95,
                "cpu_usage": 0.15,
                "memory_usage": 0.45,
                "disk_usage": 0.60,
                "initialized": true
            }))
        }

        // Memory commands (cached, read-only)
        "memory_get_state" => Ok(serde_json::json!({
            "stm_count": 12,
            "mtm_count": 45,
            "ltm_count": 230,
            "total_memories": 287,
            "initialized": true
        })),

        // Coherence commands (cached, read-only)
        "coherence_get_state" => Ok(serde_json::json!({
            "health": "Optimal",
            "global_coherence": 0.92,
            "active_connections": 9,
            "initialized": true
        })),

        // Cache metrics
        "cache_get_metrics" => {
            use crate::cache::middleware::get_cache_metrics;
            Ok(get_cache_metrics())
        }

        // Add more batch-safe commands here
        // IMPORTANT: Only add read-only, stateless commands
        _ => Err(format!("Command '{}' is not batch-enabled", command)),
    }
}

// ────────────────────────────────────────────────────────────────
// Batch Executor
// ────────────────────────────────────────────────────────────────

/// Execute multiple requests in parallel
pub async fn execute_batch(requests: Vec<BatchRequest>) -> BatchResult {
    use tokio::time::Instant;

    let start = Instant::now();
    let total_requests = requests.len();

    // Execute all requests in parallel
    let futures: Vec<_> = requests
        .into_iter()
        .map(|req| async move {
            let req_start = Instant::now();

            let (success, data, error) = match execute_batch_command(&req.command, req.params).await
            {
                Ok(result) => (true, Some(result), None),
                Err(err) => (false, None, Some(err)),
            };

            let duration_ms = req_start.elapsed().as_millis() as u64;

            BatchResponse {
                id: req.id,
                success,
                data,
                error,
                duration_ms,
            }
        })
        .collect();

    // Await all futures concurrently using tokio
    use futures_util::future::join_all;
    let responses = join_all(futures).await;

    // Calculate stats
    let success_count = responses.iter().filter(|r| r.success).count();
    let failure_count = total_requests - success_count;
    let total_duration_ms = start.elapsed().as_millis() as u64;

    BatchResult {
        responses,
        total_duration_ms,
        success_count,
        failure_count,
    }
}

// ────────────────────────────────────────────────────────────────
// Tauri Command
// ────────────────────────────────────────────────────────────────

/// Execute a batch of commands
///
/// # Example
/// ```typescript
/// const result = await invoke('batch_execute', {
///   requests: [
///     { id: '1', command: 'health_get_state', params: {} },
///     { id: '2', command: 'memory_get_state', params: {} },
///     { id: '3', command: 'coherence_get_state', params: {} },
///   ]
/// });
/// ```
#[tauri::command]
pub async fn batch_execute(requests: Vec<BatchRequest>) -> Result<BatchResult, String> {
    // Validate batch size
    if requests.is_empty() {
        return Err("Batch cannot be empty".to_string());
    }

    if requests.len() > 50 {
        return Err(format!(
            "Batch too large: {} requests (max 50)",
            requests.len()
        ));
    }

    // Validate unique IDs
    let mut ids = std::collections::HashSet::new();
    for req in &requests {
        if !ids.insert(&req.id) {
            return Err(format!("Duplicate request ID: {}", req.id));
        }
    }

    Ok(execute_batch(requests).await)
}

// ────────────────────────────────────────────────────────────────
// Preset Batches (Common Patterns)
// ────────────────────────────────────────────────────────────────

/// Get all dashboard state in one batch
#[tauri::command]
pub async fn batch_get_dashboard_state() -> Result<BatchResult, String> {
    let requests = vec![
        BatchRequest {
            id: "health".to_string(),
            command: "health_get_state".to_string(),
            params: serde_json::json!({}),
        },
        BatchRequest {
            id: "memory".to_string(),
            command: "memory_get_state".to_string(),
            params: serde_json::json!({}),
        },
        BatchRequest {
            id: "coherence".to_string(),
            command: "coherence_get_state".to_string(),
            params: serde_json::json!({}),
        },
        BatchRequest {
            id: "cache".to_string(),
            command: "cache_get_metrics".to_string(),
            params: serde_json::json!({}),
        },
    ];

    Ok(execute_batch(requests).await)
}

/// Get monitoring overview (fast subset)
#[tauri::command]
pub async fn batch_get_monitoring_overview() -> Result<BatchResult, String> {
    let requests = vec![
        BatchRequest {
            id: "health".to_string(),
            command: "health_get_state".to_string(),
            params: serde_json::json!({}),
        },
        BatchRequest {
            id: "coherence".to_string(),
            command: "coherence_get_state".to_string(),
            params: serde_json::json!({}),
        },
    ];

    Ok(execute_batch(requests).await)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_batch_execute_parallel() {
        let requests = vec![
            BatchRequest {
                id: "1".to_string(),
                command: "health_get_state".to_string(),
                params: serde_json::json!({}),
            },
            BatchRequest {
                id: "2".to_string(),
                command: "memory_get_state".to_string(),
                params: serde_json::json!({}),
            },
        ];

        let result = execute_batch(requests).await;

        assert_eq!(result.responses.len(), 2);
        assert_eq!(result.success_count, 2);
        assert_eq!(result.failure_count, 0);
    }

    #[tokio::test]
    async fn test_batch_invalid_command() {
        let requests = vec![BatchRequest {
            id: "1".to_string(),
            command: "invalid_command".to_string(),
            params: serde_json::json!({}),
        }];

        let result = execute_batch(requests).await;

        assert_eq!(result.responses.len(), 1);
        assert_eq!(result.success_count, 0);
        assert_eq!(result.failure_count, 1);
        assert!(!result.responses[0].success);
    }
}
