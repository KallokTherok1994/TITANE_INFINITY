// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v14 — MOCK COMMANDS
//   Stubs pour développement frontend-only
// ═══════════════════════════════════════════════════════════════

use serde_json::json;
use crate::utils::AppResult;

// ═══════════════════════════════════════════════════════════════
// HELIOS - System Monitoring
// ═══════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn get_helios_state() -> AppResult<serde_json::Value> {
    Ok(json!({
        "cpu_usage": 25.5,
        "ram_usage": 45.2,
        "ram_total_gb": 16.0,
        "ram_used_gb": 7.2,
        "disk_usage": 62.8,
        "disk_total_gb": 512.0,
        "disk_used_gb": 321.5,
        "uptime_seconds": 3600,
        "load_average": {
            "one": 1.2,
            "five": 1.5,
            "fifteen": 1.8
        },
        "timestamp": chrono::Utc::now().timestamp_millis()
    }))
}

#[tauri::command]
pub async fn get_system_health() -> AppResult<serde_json::Value> {
    Ok(json!({
        "status": "Healthy",
        "score": 95,
        "message": "System operating normally (MOCK DATA)"
    }))
}

// ═══════════════════════════════════════════════════════════════
// MEMORY - Storage & Timeline
// ═══════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn get_memory_state() -> AppResult<serde_json::Value> {
    Ok(json!({
        "snapshots_count": 5,
        "log_entries_count": 42,
        "timeline_events": 128,
        "storage_size_mb": 12.5,
        "timestamp": chrono::Utc::now().timestamp_millis()
    }))
}

#[tauri::command]
pub async fn write_snapshot(_snapshot: serde_json::Value) -> AppResult<()> {
    log::info!("Mock: write_snapshot called");
    Ok(())
}

#[tauri::command]
pub async fn read_snapshot() -> AppResult<Option<serde_json::Value>> {
    Ok(Some(json!({
        "id": "snapshot_mock_001",
        "timestamp": chrono::Utc::now().timestamp_millis(),
        "metadata": {}
    })))
}

#[tauri::command]
pub async fn write_log(_log: serde_json::Value) -> AppResult<()> {
    log::info!("Mock: write_log called");
    Ok(())
}

#[tauri::command]
pub async fn read_logs(_count: usize) -> AppResult<Vec<serde_json::Value>> {
    Ok(vec![
        json!({
            "id": "log_001",
            "timestamp": chrono::Utc::now().timestamp_millis(),
            "message": "Mock log entry 1",
            "level": "info"
        }),
        json!({
            "id": "log_002",
            "timestamp": chrono::Utc::now().timestamp_millis() - 60000,
            "message": "Mock log entry 2",
            "level": "debug"
        })
    ])
}

#[tauri::command]
pub async fn add_timeline_event(_event: serde_json::Value) -> AppResult<()> {
    log::info!("Mock: add_timeline_event called");
    Ok(())
}

#[tauri::command]
pub async fn get_timeline(_limit: usize) -> AppResult<Vec<serde_json::Value>> {
    Ok(vec![
        json!({
            "id": "event_001",
            "timestamp": chrono::Utc::now().timestamp_millis(),
            "event_type": "SystemStart",
            "description": "Mock timeline event"
        })
    ])
}

#[tauri::command]
pub async fn get_active_projects() -> AppResult<Vec<serde_json::Value>> {
    Ok(vec![
        json!({
            "name": "TITANE_INFINITY",
            "status": "active",
            "level": 14
        })
    ])
}

#[tauri::command]
pub async fn get_recent_decisions(_count: usize) -> AppResult<Vec<serde_json::Value>> {
    Ok(vec![
        json!({
            "id": "decision_001",
            "timestamp": chrono::Utc::now().timestamp_millis(),
            "description": "Mock decision"
        })
    ])
}

#[tauri::command]
pub async fn get_knowledge() -> AppResult<Vec<serde_json::Value>> {
    Ok(vec![
        json!({
            "id": "knowledge_001",
            "category": "system",
            "content": "Mock knowledge entry"
        })
    ])
}

#[tauri::command]
pub async fn get_active_rituals() -> AppResult<Vec<serde_json::Value>> {
    Ok(vec![
        json!({
            "id": "ritual_001",
            "name": "Daily Sync",
            "frequency": "daily"
        })
    ])
}

#[tauri::command]
pub async fn save_chat_interaction(_interaction: serde_json::Value) -> AppResult<()> {
    log::info!("Mock: save_chat_interaction called");
    Ok(())
}

// ═══════════════════════════════════════════════════════════════
// NEXUS - Validation
// ═══════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn validate_nexus() -> AppResult<bool> {
    Ok(true)
}

#[tauri::command]
pub async fn get_nexus_graph() -> AppResult<serde_json::Value> {
    Ok(json!({
        "nodes": [],
        "edges": [],
        "stats": {
            "node_count": 0,
            "edge_count": 0
        }
    }))
}

// ═══════════════════════════════════════════════════════════════
// SINGULARITY - Unity State
// ═══════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn singularity_get_full_state() -> AppResult<serde_json::Value> {
    Ok(json!({
        "physical": {
            "cpu_load": 0.25,
            "ram_usage": 0.45,
            "io_throughput": 1024,
            "network_latency": 15,
            "gpu_usage": 0.0,
            "temperature": 55.0,
            "power_consumption": 45.0,
            "timestamp": chrono::Utc::now().timestamp_millis()
        },
        "cognitive": {
            "attention_focus": 0.7,
            "memory_load": 0.4,
            "processing_depth": 3,
            "creativity_index": 0.6,
            "reasoning_score": 0.8,
            "decision_latency": 120,
            "timestamp": chrono::Utc::now().timestamp_millis()
        },
        "symbolic": {
            "language_model_temp": 0.7,
            "context_window": 4096,
            "token_count": 1250,
            "embedding_dim": 768,
            "semantic_drift": 0.02,
            "symbol_coherence": 0.85,
            "timestamp": chrono::Utc::now().timestamp_millis()
        },
        "adaptive": {
            "learning_rate": 0.001,
            "exploration_rate": 0.15,
            "plasticity": 0.6,
            "resilience": 0.8,
            "adaptation_speed": 0.5,
            "stability_index": 0.75,
            "timestamp": chrono::Utc::now().timestamp_millis()
        },
        "meta": {
            "self_awareness": 0.65,
            "reflection_depth": 2,
            "meta_learning": 0.5,
            "consciousness_level": 1,
            "coherence_score": 0.8,
            "integration_level": 0.7,
            "timestamp": chrono::Utc::now().timestamp_millis()
        },
        "global_coherence": 0.72,
        "is_critical": false,
        "mode": "MOCK",
        "version": "14.0.0"
    }))
}

#[tauri::command]
pub async fn get_singularity_state() -> AppResult<serde_json::Value> {
    Ok(json!({
        "timestamp": chrono::Utc::now().timestamp_millis(),
        "mode": "mock",
        "health": "Healthy",
        "modules": {
            "helios": "active",
            "memory": "active",
            "nexus": "active",
            "harmonia": "standby",
            "sentinel": "active"
        }
    }))
}

#[tauri::command]
pub async fn singularity_get_global_coherence() -> AppResult<f64> {
    Ok(0.72)
}

#[tauri::command]
pub async fn singularity_is_critical() -> AppResult<bool> {
    Ok(false)
}

#[tauri::command]
pub async fn sync_singularity() -> AppResult<()> {
    log::info!("Mock: sync_singularity called");
    Ok(())
}

// ─────────────────────────────────────────────────────────────────
// SINGULARITY - Layer-specific getters (Phase 2 additions)
// ─────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn singularity_get_symbolic() -> AppResult<serde_json::Value> {
    Ok(json!({
        "language_model_temp": 0.7,
        "context_window": 4096,
        "token_count": 1250,
        "embedding_dim": 768,
        "semantic_drift": 0.02,
        "symbol_coherence": 0.85,
        "timestamp": chrono::Utc::now().timestamp_millis()
    }))
}

#[tauri::command]
pub async fn singularity_get_adaptive() -> AppResult<serde_json::Value> {
    Ok(json!({
        "learning_rate": 0.001,
        "exploration_rate": 0.15,
        "plasticity": 0.6,
        "resilience": 0.8,
        "adaptation_speed": 0.5,
        "stability_index": 0.75,
        "timestamp": chrono::Utc::now().timestamp_millis()
    }))
}

#[tauri::command]
pub async fn singularity_get_meta() -> AppResult<serde_json::Value> {
    Ok(json!({
        "self_awareness": 0.65,
        "reflection_depth": 2,
        "meta_learning": 0.5,
        "consciousness_level": 1,
        "coherence_score": 0.8,
        "integration_level": 0.7,
        "timestamp": chrono::Utc::now().timestamp_millis()
    }))
}

// ═══════════════════════════════════════════════════════════════
// DEVTOOLS - Logging & Debug
// ═══════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn get_logs(_filter: Option<String>) -> AppResult<Vec<serde_json::Value>> {
    Ok(vec![
        json!({
            "timestamp": chrono::Utc::now().timestamp_millis(),
            "level": "INFO",
            "message": "Mock backend active",
            "target": "mock_commands"
        })
    ])
}

#[tauri::command]
pub async fn clear_logs() -> AppResult<()> {
    log::info!("Mock: clear_logs called");
    Ok(())
}

#[tauri::command]
pub async fn get_system_info() -> AppResult<serde_json::Value> {
    Ok(json!({
        "version": "14.0.0",
        "mode": "MOCK_BACKEND",
        "rust_version": env!("CARGO_PKG_RUST_VERSION"),
        "features": ["frontend-only", "mock-data"]
    }))
}

// ═══════════════════════════════════════════════════════════════
// EXPERIENCE - XP & Knowledge Domains (v24)
// ═══════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn experience_get_state() -> AppResult<Option<serde_json::Value>> {
    // Try to load from localStorage emulation (file-based mock)
    // For now, return None to trigger frontend default state creation
    log::info!("Mock: experience_get_state called");
    Ok(None)
}

#[tauri::command]
pub async fn experience_update_state(state: serde_json::Value) -> AppResult<()> {
    log::info!("Mock: experience_update_state called with state: {:?}", state);
    // In mock mode, we just log. Real impl would save to JSON file.
    Ok(())
}

// ═══════════════════════════════════════════════════════════════
// MEMORY - File Ingestion (v24)
// ═══════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn memory_ingest_file(path: String) -> AppResult<serde_json::Value> {
    log::info!("Mock: memory_ingest_file called with path: {}", path);

    // Extract filename from path
    let filename = std::path::Path::new(&path)
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown.txt")
        .to_string();

    // Mock file reading
    let mock_size = 1024; // 1KB
    let mock_type = if path.ends_with(".md") {
        "markdown"
    } else if path.ends_with(".json") {
        "json"
    } else if path.ends_with(".rs") {
        "rust"
    } else {
        "text"
    };

    Ok(json!({
        "filename": filename,
        "size": mock_size,
        "type": mock_type,
        "ingested_at": chrono::Utc::now().timestamp_millis()
    }))
}

// ═══════════════════════════════════════════════════════════════
// FILE IMPORT - Real Implementation (v24)
// ═══════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn import_file(path: String) -> AppResult<String> {
    log::info!("Reading file: {}", path);

    match tokio::fs::read_to_string(&path).await {
        Ok(content) => {
            log::info!("File read successfully: {} bytes", content.len());
            Ok(content)
        },
        Err(e) => {
            log::error!("Failed to read file {}: {}", path, e);
            Err(crate::utils::AppError::Io(format!("Failed to read file: {}", e)))
        }
    }
}
