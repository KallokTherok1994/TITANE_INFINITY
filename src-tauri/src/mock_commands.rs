// ═══════════════════════════════════════════════════════════════════
//   TITANE∞ v14 — MOCK COMMANDS
//   Stubs pour développement frontend-only
// ═══════════════════════════════════════════════════════════════════

use crate::memory::telemetry;
use crate::security::permission_guard::PERMISSION_GUARD;
use crate::security::permissions::Role;
use crate::utils::AppResult;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::time::Duration;
use tauri::{async_runtime, Emitter, Window};
use tokio::time::sleep;
use uuid::Uuid;

#[derive(Debug, Serialize)]
pub struct MockCommandAck {
    command: &'static str,
    status: &'static str,
    timestamp_ms: i64,
}

impl MockCommandAck {
    fn new(command: &'static str) -> Self {
        Self {
            command,
            status: "ok",
            timestamp_ms: chrono::Utc::now().timestamp_millis(),
        }
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct MockStreamRequest {
    pub conversation_id: Option<String>,
    pub user_message: String,
    pub system_prompt: Option<String>,
    pub temperature: Option<f32>,
    pub max_output_tokens: Option<u32>,
    pub provider: Option<String>,
    pub enable_streaming: Option<bool>,
}

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
        "timestamp": chrono::Utc::now().timestamp_millis(),
        "disk_mode": "disabled",
        "synthetic_mode": true,
        "last_validation_ts": chrono::Utc::now().timestamp_millis(),
        "last_compaction_ts": chrono::Utc::now().timestamp_millis() - 86_400_000,
        "issues": ["mock_mode"],
    }))
}

#[tauri::command]
pub async fn get_helios_metrics() -> AppResult<serde_json::Value> {
    log::info!("Mock: get_helios_metrics called");
    Ok(json!({
        "temperature": 0.0,
        "load": 0.0,
        "status": "ok",
        "ok": true,
        "ts": chrono::Utc::now().timestamp()
    }))
}

#[tauri::command]
pub async fn memory_get_state() -> AppResult<serde_json::Value> {
    log::info!("Mock: memory_get_state called");
    Ok(json!({
        "short_term": [],
        "long_term": [],
        "checksum": "ok",
        "ok": true,
        "ts": chrono::Utc::now().timestamp()
    }))
}

#[tauri::command]
pub async fn write_snapshot(_snapshot: serde_json::Value) -> AppResult<()> {
    // ✅ v∞ Permission check (SYSTEM level required)
    PERMISSION_GUARD
        .require("snapshot_write", Role::System, "write_snapshot")
        .await?;

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
        }),
    ])
}

#[tauri::command]
pub async fn add_timeline_event(_event: serde_json::Value) -> AppResult<()> {
    log::info!("Mock: add_timeline_event called");
    Ok(())
}

#[tauri::command]
pub async fn get_timeline(_limit: usize) -> AppResult<Vec<serde_json::Value>> {
    Ok(vec![json!({
        "id": "event_001",
        "timestamp": chrono::Utc::now().timestamp_millis(),
        "event_type": "SystemStart",
        "description": "Mock timeline event"
    })])
}

#[tauri::command]
pub async fn get_active_projects() -> AppResult<Vec<serde_json::Value>> {
    Ok(vec![json!({
        "name": "TITANE_INFINITY",
        "status": "active",
        "level": 14
    })])
}

#[tauri::command]
pub async fn get_recent_decisions(_count: usize) -> AppResult<Vec<serde_json::Value>> {
    Ok(vec![json!({
        "id": "decision_001",
        "timestamp": chrono::Utc::now().timestamp_millis(),
        "description": "Mock decision"
    })])
}

#[tauri::command]
pub async fn get_knowledge() -> AppResult<Vec<serde_json::Value>> {
    Ok(vec![json!({
        "id": "knowledge_001",
        "category": "system",
        "content": "Mock knowledge entry"
    })])
}

#[tauri::command]
pub async fn get_active_rituals() -> AppResult<Vec<serde_json::Value>> {
    Ok(vec![json!({
        "id": "ritual_001",
        "name": "Daily Sync",
        "frequency": "daily"
    })])
}

#[tauri::command]
pub async fn save_chat_interaction(
    _interaction: serde_json::Value,
) -> AppResult<serde_json::Value> {
    log::info!("Mock: save_chat_interaction called");
    Ok(json!({
        "status": "ok",
        "saved": true,
        "timestamp_ms": chrono::Utc::now().timestamp_millis(),
    }))
}

// Alias pour compatibilité frontend
#[tauri::command]
pub async fn memory_save_chat_interaction(
    _interaction: serde_json::Value,
) -> AppResult<serde_json::Value> {
    log::info!("Mock: memory_save_chat_interaction (alias) called");
    save_chat_interaction(_interaction).await
}

#[tauri::command]
pub async fn memory_debug_scan() -> AppResult<serde_json::Value> {
    log::info!("Mock: memory_debug_scan called");
    let report = telemetry::scan_memory_directory();
    Ok(serde_json::to_value(report).unwrap_or_else(|_| {
        json!({
            "base_path": "memory",
            "missing": true,
            "total_size_bytes": 0,
            "files": []
        })
    }))
}

// ═══════════════════════════════════════════════════════════════
// MEMORY ALIASES - Frontend Compatibility v17
// ═══════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn memory_get_active_projects() -> AppResult<Vec<serde_json::Value>> {
    log::info!("Mock: memory_get_active_projects (alias) called");
    get_active_projects().await
}

#[tauri::command]
pub async fn memory_get_recent_decisions(
    limit: usize,
    time_window: Option<String>,
) -> AppResult<Vec<serde_json::Value>> {
    log::info!(
        "Mock: memory_get_recent_decisions (alias) called — limit={} time_window={:?}",
        limit,
        time_window
    );
    get_recent_decisions(limit).await
}

#[tauri::command]
pub async fn memory_get_knowledge() -> AppResult<Vec<serde_json::Value>> {
    log::info!("Mock: memory_get_knowledge (alias) called");
    get_knowledge().await
}

#[tauri::command]
pub async fn memory_get_active_rituals() -> AppResult<Vec<serde_json::Value>> {
    log::info!("Mock: memory_get_active_rituals (alias) called");
    get_active_rituals().await
}

#[tauri::command]
pub async fn memory_get_timeline(time_window: Option<String>) -> AppResult<Vec<serde_json::Value>> {
    log::info!(
        "Mock: memory_get_timeline (alias) called — time_window={:?}",
        time_window
    );
    get_timeline(10).await
}

#[tauri::command]
pub async fn generate_response(payload: MockStreamRequest) -> AppResult<serde_json::Value> {
    let conversation_id = payload
        .conversation_id
        .filter(|id| !id.trim().is_empty())
        .unwrap_or_else(|| format!("mock-conv-{}", Uuid::new_v4()));

    let message_id = format!("mock-msg-{}", Uuid::new_v4());
    let user_preview: String = payload.user_message.chars().take(180).collect();

    let provider = payload.provider.unwrap_or_else(|| "mock".to_string());
    let content = if user_preview.is_empty() {
        "(MOCK) Réponse générée automatiquement.".to_string()
    } else {
        format!("(MOCK) Réponse instantanée pour: {}", user_preview)
    };

    Ok(json!({
        "conversation_id": conversation_id,
        "message_id": message_id,
        "provider": provider,
        "content": content,
        "token_count": (content.len() / 4).max(12),
        "latency_ms": 42,
        "timestamp": chrono::Utc::now().timestamp_millis(),
    }))
}

#[tauri::command]
pub async fn stream_response(
    window: Window,
    payload: MockStreamRequest,
) -> AppResult<serde_json::Value> {
    let MockStreamRequest {
        conversation_id,
        user_message,
        ..
    } = payload;

    let conversation_id = conversation_id
        .filter(|id| !id.trim().is_empty())
        .unwrap_or_else(|| format!("mock-conv-{}", Uuid::new_v4()));

    let message_id = format!("mock-msg-{}", Uuid::new_v4());
    let user_preview: String = user_message.chars().take(180).collect();
    let response_text = if user_preview.is_empty() {
        "(MOCK) Réponse générée pour message vide.".to_string()
    } else {
        format!("(MOCK) Réponse générée pour: {}", user_preview)
    };

    let conv_for_chunk = conversation_id.clone();
    let conv_for_done = conversation_id.clone();
    let msg_for_chunk = message_id.clone();
    let msg_for_done = message_id.clone();
    let chunk_text = response_text.clone();

    async_runtime::spawn(async move {
        let chunk_event = json!({
            "conversation_id": conv_for_chunk,
            "message_id": msg_for_chunk,
            "ordinal": 0,
            "content": chunk_text,
            "done": false,
        });

        if let Err(err) = window.emit("chat:stream:chunk", chunk_event) {
            log::error!("[Mock ChatEngine] Failed to emit chunk: {}", err);
            return;
        }

        sleep(Duration::from_millis(150)).await;

        let done_event = json!({
            "conversation_id": conv_for_done,
            "message_id": msg_for_done,
            "ordinal": 1,
            "content": "",
            "done": true,
        });

        if let Err(err) = window.emit("chat:stream:done", done_event) {
            log::error!("[Mock ChatEngine] Failed to emit done: {}", err);
        }
    });

    Ok(json!({
        "conversationId": conversation_id,
        "messageId": message_id,
    }))
}

#[tauri::command]
pub async fn speak_text(
    text: String,
    mode: Option<String>,
    speed: Option<f32>,
    pitch: Option<f32>,
    voice: Option<String>,
) -> AppResult<serde_json::Value> {
    log::info!(
        "Mock: speak_text called (len={}, mode={:?}, speed={:?}, pitch={:?}, voice={:?})",
        text.len(),
        mode,
        speed,
        pitch,
        voice
    );
    Ok(json!({
        "status": "ok",
        "mode": mode.unwrap_or_else(|| "auto".to_string()),
        "speed": speed.unwrap_or(1.0),
        "pitch": pitch.unwrap_or(1.0),
    }))
}

#[tauri::command]
pub async fn save_memory(conversation_id: String) -> AppResult<String> {
    log::info!(
        "Mock: save_memory called conversation_id={}",
        conversation_id
    );
    Ok(conversation_id)
}

#[tauri::command]
pub async fn load_memory(conversation_id: String) -> AppResult<serde_json::Value> {
    log::info!(
        "Mock: load_memory called conversation_id={}",
        conversation_id
    );
    Ok(json!({
        "conversation_id": conversation_id,
        "messages": [
            {
                "role": "user",
                "content": "(MOCK) Message utilisateur précédent"
            },
            {
                "role": "assistant",
                "content": "(MOCK) Réponse historique"
            }
        ]
    }))
}

#[tauri::command]
pub async fn reset_memory() -> AppResult<serde_json::Value> {
    log::info!("Mock: reset_memory called");
    Ok(json!({
        "status": "ok",
        "reset": true,
        "timestamp": chrono::Utc::now().timestamp_millis(),
    }))
}

#[tauri::command]
pub async fn health_check() -> AppResult<serde_json::Value> {
    log::info!("Mock: health_check called");
    Ok(json!({
        "providers_online": ["mock"],
        "providers_degraded": [],
        "provider_errors": [],
        "memory_entries": 5,
        "memory_tokens": 256,
        "auto_tts_enabled": false,
        "timestamp": chrono::Utc::now().timestamp_millis(),
    }))
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
pub async fn singularity_get_physical() -> AppResult<serde_json::Value> {
    Ok(json!({
        "helios": {
            "active": true,
            "cpu_usage": 0.25,
            "memory_usage": 0.45,
            "disk_usage": 0.62,
            "temperature": 55.0,
            "battery_level": 1.0,
            "last_update": chrono::Utc::now().timestamp_millis()
        },
        "system_health": {
            "global_health": 0.95,
            "last_check": chrono::Utc::now().timestamp_millis()
        },
        "metrics": {
            "cpu_usage": 0.25,
            "memory_usage": 0.45,
            "disk_usage": 0.62,
            "response_time": 15,
            "throughput": 1024,
            "performance_score": 0.85
        }
    }))
}

#[tauri::command]
pub async fn singularity_get_cognitive() -> AppResult<serde_json::Value> {
    Ok(json!({
        "memory": {
            "total_memories": 42,
            "active_memories": 5,
            "memory_usage": 0.012,
            "last_retrieval": chrono::Utc::now().timestamp_millis(),
            "compression_ratio": 0.9
        },
        "conversation": {
            "active_threads": 1,
            "message_count": 12,
            "context_depth": 5,
            "last_message": chrono::Utc::now().timestamp_millis()
        },
        "knowledge": {
            "graph_size": 128,
            "connections": 256,
            "depth": 7,
            "last_update": chrono::Utc::now().timestamp_millis()
        }
    }))
}

#[tauri::command]
pub async fn singularity_get_full_state() -> AppResult<serde_json::Value> {
    // ✅ v∞ Permission check (SYSTEM level required)
    PERMISSION_GUARD
        .require("state_read", Role::System, "singularity_get_full_state")
        .await?;

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
pub async fn sync_singularity() -> AppResult<serde_json::Value> {
    // ✅ v∞ Permission check (SYSTEM level required)
    PERMISSION_GUARD
        .require("state_write", Role::System, "sync_singularity")
        .await?;

    log::info!("Mock: sync_singularity called");

    // ✅ FIXED v16.2.2+: Toujours retourner un état valide, jamais null
    Ok(json!({
        "physical": {
            "cpu": 0.0,
            "ram": 0.0,
            "disk": 0.0,
            "network": 0.0,
            "energy": 1.0,
            "temperature": 50.0,
            "power_mode": "balanced"
        },
        "cognitive": {
            "focus": 0.8,
            "load": 0.3,
            "depth": 0.5,
            "clarity": 0.9,
            "creativity": 0.7,
            "mode": "default"
        },
        "symbolic": {
            "narrative_coherence": 0.9,
            "identity_strength": 0.8,
            "purpose_alignment": 0.85,
            "meaning_depth": 0.7
        },
        "adaptive": {
            "learning_rate": 0.5,
            "adaptation_speed": 0.6,
            "resilience": 0.8,
            "flexibility": 0.7
        },
        "meta": {
            "self_awareness": 0.8,
            "introspection_depth": 0.7,
            "evolution_stage": "stable",
            "consciousness_level": 0.75
        },
        "coherence": 0.85,
        "timestamp": chrono::Utc::now().timestamp_millis()
    }))
}

// ─────────────────────────────────────────────────────────────────
// SINGULARITY - Layer-specific getters (Phase 2 additions)
// ─────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn singularity_get_symbolic() -> AppResult<serde_json::Value> {
    Ok(json!({
        "persona": "default",
        "identity": {},
        "symbolic_map": {},
        "ok": true,
        "ts": chrono::Utc::now().timestamp()
    }))
}

#[tauri::command]
pub async fn singularity_get_adaptive() -> AppResult<serde_json::Value> {
    Ok(json!({
        "autoheal": "stable",
        "watchdog": "active",
        "anomalies": 0,
        "ok": true,
        "ts": chrono::Utc::now().timestamp()
    }))
}

#[tauri::command]
pub async fn singularity_get_meta() -> AppResult<serde_json::Value> {
    Ok(json!({
        "route": "Dashboard",
        "ui_state": {},
        "system_flags": {},
        "ok": true,
        "ts": chrono::Utc::now().timestamp()
    }))
}

// ─────────────────────────────────────────────────────────────────
// SINGULARITY - Update commands (v16.2.2+)
// ─────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn singularity_update_physical(physical: serde_json::Value) -> AppResult<MockCommandAck> {
    PERMISSION_GUARD
        .require("state_write", Role::System, "singularity_update_physical")
        .await?;
    log::info!(
        "Mock: singularity_update_physical called with: {:?}",
        physical
    );
    Ok(MockCommandAck::new("singularity_update_physical"))
}

#[tauri::command]
pub async fn singularity_update_cognitive(
    cognitive: serde_json::Value,
) -> AppResult<MockCommandAck> {
    PERMISSION_GUARD
        .require("state_write", Role::System, "singularity_update_cognitive")
        .await?;
    log::info!(
        "Mock: singularity_update_cognitive called with: {:?}",
        cognitive
    );
    Ok(MockCommandAck::new("singularity_update_cognitive"))
}

#[tauri::command]
pub async fn singularity_update_symbolic(
    _symbolic: serde_json::Value,
) -> AppResult<MockCommandAck> {
    PERMISSION_GUARD
        .require("state_write", Role::System, "singularity_update_symbolic")
        .await?;
    log::info!("Mock: singularity_update_symbolic called");
    Ok(MockCommandAck::new("singularity_update_symbolic"))
}

#[tauri::command]
pub async fn singularity_update_adaptive(
    _adaptive: serde_json::Value,
) -> AppResult<MockCommandAck> {
    PERMISSION_GUARD
        .require("state_write", Role::System, "singularity_update_adaptive")
        .await?;
    log::info!("Mock: singularity_update_adaptive called");
    Ok(MockCommandAck::new("singularity_update_adaptive"))
}

#[tauri::command]
pub async fn singularity_update_meta(_meta: serde_json::Value) -> AppResult<MockCommandAck> {
    PERMISSION_GUARD
        .require("state_write", Role::System, "singularity_update_meta")
        .await?;
    log::info!("Mock: singularity_update_meta called");
    Ok(MockCommandAck::new("singularity_update_meta"))
}

#[tauri::command]
pub async fn singularity_update_full_state(_state: serde_json::Value) -> AppResult<MockCommandAck> {
    PERMISSION_GUARD
        .require("state_write", Role::System, "singularity_update_full_state")
        .await?;
    log::info!("Mock: singularity_update_full_state called");
    Ok(MockCommandAck::new("singularity_update_full_state"))
}

#[tauri::command]
pub async fn singularity_save_state() -> AppResult<MockCommandAck> {
    PERMISSION_GUARD
        .require("state_write", Role::System, "singularity_save_state")
        .await?;
    log::info!("Mock: singularity_save_state called");
    Ok(MockCommandAck::new("singularity_save_state"))
}

#[tauri::command]
pub async fn singularity_load_state() -> AppResult<MockCommandAck> {
    PERMISSION_GUARD
        .require("state_read", Role::System, "singularity_load_state")
        .await?;
    log::info!("Mock: singularity_load_state called");
    Ok(MockCommandAck::new("singularity_load_state"))
}

// ═══════════════════════════════════════════════════════════════
// DEVTOOLS - Logging & Debug
// ═══════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn get_logs(_filter: Option<String>) -> AppResult<Vec<serde_json::Value>> {
    Ok(vec![json!({
        "timestamp": chrono::Utc::now().timestamp_millis(),
        "level": "INFO",
        "message": "Mock backend active",
        "target": "mock_commands"
    })])
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
pub async fn experience_get_state() -> AppResult<serde_json::Value> {
    // Return default experience state matching TypeScript ExperienceState interface
    log::info!("Mock: experience_get_state called - returning default state");

    let default_state = serde_json::json!({
        "totalXp": 0,
        "level": 1,
        "domains": {
            "cognitive": {
                "id": "cognitive",
                "label": "Cognition",
                "description": "Intelligence cognitive, analyse, raisonnement",
                "xp": 0,
                "level": 1,
                "category": "cognitive",
                "lastUpdated": chrono::Utc::now().timestamp_millis(),
                "icon": "🧠",
                "position": { "x": 400, "y": 100 }
            },
            "business": {
                "id": "business",
                "label": "Business",
                "description": "Stratégie, management, opérations",
                "xp": 0,
                "level": 1,
                "category": "business",
                "lastUpdated": chrono::Utc::now().timestamp_millis(),
                "icon": "💼",
                "position": { "x": 200, "y": 250 }
            },
            "memory": {
                "id": "memory",
                "label": "Mémoire",
                "description": "Ingestion de fichiers, stockage de connaissances",
                "xp": 0,
                "level": 1,
                "category": "memory",
                "lastUpdated": chrono::Utc::now().timestamp_millis(),
                "icon": "📂",
                "position": { "x": 600, "y": 250 }
            },
            "chat": {
                "id": "chat",
                "label": "Chat IA",
                "description": "Interactions conversationnelles",
                "xp": 0,
                "level": 1,
                "category": "cognitive",
                "lastUpdated": chrono::Utc::now().timestamp_millis(),
                "icon": "💬",
                "position": { "x": 300, "y": 400 }
            },
            "system": {
                "id": "system",
                "label": "Système",
                "description": "Événements système, auto-heal, évolution",
                "xp": 0,
                "level": 1,
                "category": "system",
                "lastUpdated": chrono::Utc::now().timestamp_millis(),
                "icon": "⚙️",
                "position": { "x": 500, "y": 400 }
            }
        },
        "history": [],
        "lastUpdated": chrono::Utc::now().timestamp_millis(),
        "version": "1.0.0"
    });

    Ok(default_state)
}

#[tauri::command]
pub async fn experience_update_state(state: serde_json::Value) -> AppResult<()> {
    log::info!(
        "Mock: experience_update_state called with state: {:?}",
        state
    );
    // In mock mode, we just log. Real impl would save to JSON file.
    Ok(())
}

// ═══════════════════════════════════════════════════════════════
// MEMORY - File Ingestion (v24) - REAL STORAGE
// ═══════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn memory_ingest_file(
    path: String,
    content: Option<String>,
    category: Option<String>,
    metadata: Option<serde_json::Value>,
) -> AppResult<serde_json::Value> {
    log::info!("memory_ingest_file called with path: {}", path);

    // Extract filename from path
    let filename = std::path::Path::new(&path)
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown.txt")
        .to_string();

    // Determine category (auto-classify if not provided)
    let file_category = category.unwrap_or_else(|| {
        if path.ends_with(".md") {
            "document".to_string()
        } else if path.ends_with(".json") || path.ends_with(".yaml") || path.ends_with(".yml") {
            "data".to_string()
        } else if path.ends_with(".rs")
            || path.ends_with(".ts")
            || path.ends_with(".tsx")
            || path.ends_with(".js")
            || path.ends_with(".py")
        {
            "code".to_string()
        } else if path.ends_with(".toml") || path.ends_with(".ini") || path.ends_with(".env") {
            "config".to_string()
        } else {
            "unknown".to_string()
        }
    });

    // Get content size
    let content_size = content.as_ref().map(|c| c.len()).unwrap_or(0);
    let line_count = content.as_ref().map(|c| c.lines().count()).unwrap_or(0);
    let word_count = content
        .as_ref()
        .map(|c| c.split_whitespace().count())
        .unwrap_or(0);

    // Store file in memory_persistence if content is provided
    if let Some(ref file_content) = content {
        if let Err(e) = crate::memory_persistence::store_file(&path, file_content, &file_category) {
            log::warn!("Failed to store file in memory: {}", e);
        } else {
            log::info!(
                "✅ File stored in memory: {} ({} bytes, {} lines)",
                filename,
                content_size,
                line_count
            );
        }
    }

    let ingested_at = chrono::Utc::now().timestamp_millis();

    Ok(json!({
        "success": true,
        "filename": filename,
        "path": path,
        "size": content_size,
        "lines": line_count,
        "words": word_count,
        "category": file_category,
        "ingested_at": ingested_at,
        "metadata": metadata
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
        }
        Err(e) => {
            log::error!("Failed to read file {}: {}", path, e);
            Err(crate::utils::AppError::Io(format!(
                "Failed to read file: {}",
                e
            )))
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// CHAT AI - Mock Chat Orchestrator (v18)
// Simulates backend chat_orchestrator.rs behavior for frontend dev
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MockChatRequest {
    pub message: String,
    pub conversation_id: Option<String>,
    pub provider: String,
    pub model: Option<String>,
    pub streaming: bool,
    pub images: Option<Vec<String>>,
    pub system_prompt: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MockChatMessage {
    pub id: String,
    pub role: String,
    pub content: String,
    pub timestamp: u64,
    pub provider: String,
    pub model: String,
    pub tokens: Option<u32>,
    pub multimodal: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MockChatResponse {
    pub message: MockChatMessage,
    pub success: bool,
    pub error: Option<String>,
    pub latency_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MockProviderStatus {
    pub provider: String,
    pub available: bool,
    pub latency_ms: u64,
    pub models: Vec<String>,
    pub error: Option<String>,
}

// ═══════════════════════════════════════════════════════════════
// CHAT GENERATE — Commande Unifiée Simplifiée (v∞)
// ═══════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn chat_generate(input: String) -> Result<String, String> {
    // Permission check: IA role required
    PERMISSION_GUARD
        .require("chat_generate", Role::Ia, "chat_generate")
        .await?;

    log::info!("[CHAT GENERATE] Received: {}", input);

    let start = std::time::Instant::now();

    // Simulate AI processing delay
    tokio::time::sleep(tokio::time::Duration::from_millis(
        300 + (rand::random::<u64>() % 500),
    ))
    .await;

    // Generate response
    let response_content = generate_mock_response(&input);

    let latency = start.elapsed().as_millis();

    // Return JSON structure
    let response = json!({
        "content": response_content,
        "provider": "titane-local",
        "model": "titane-echo-v∞",
        "timestamp": chrono::Utc::now().timestamp_millis(),
        "latency_ms": latency,
        "success": true
    });

    Ok(response.to_string())
}

// ═══════════════════════════════════════════════════════════════
// CHAT AI - MOCKS REMOVED v16.1
// Real implementations in src/overdrive/chat_orchestrator.rs
// ═══════════════════════════════════════════════════════════════

// Removed 8 mock chat commands:
// - chat_send_message
// - chat_get_providers_status
// - chat_check_providers
// - chat_create_conversation
// - chat_get_conversation
// - chat_delete_conversation
// - chat_set_gemini_key
// - chat_stream_message

// ═══════════════════════════════════════════════════════════════
// FILE UPLOAD & PROCESSING — Unified Command (v∞)
// ═══════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn upload_and_process_file(path: String) -> Result<String, String> {
    log::info!("[FILE UPLOAD] Processing: {}", path);

    // Read file content
    let content = match tokio::fs::read_to_string(&path).await {
        Ok(c) => c,
        Err(e) => return Err(format!("Failed to read file: {}", e)),
    };

    // Extract filename
    let filename = std::path::Path::new(&path)
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown")
        .to_string();

    // Analyze content
    let lines = content.lines().count();
    let words = content.split_whitespace().count();
    let size = content.len();

    // Classify by extension
    let file_type = if path.ends_with(".md") {
        "markdown"
    } else if path.ends_with(".rs") {
        "rust"
    } else if path.ends_with(".ts") || path.ends_with(".tsx") {
        "typescript"
    } else if path.ends_with(".json") {
        "json"
    } else {
        "text"
    };

    // ✅ v∞.C - Generate AI summary with fallback
    let summary = match crate::ai::analyze_file(&content).await {
        Ok(s) => s,
        Err(_) => {
            // Fallback: first 300 chars
            if content.len() > 300 {
                format!("{}...", &content[..300])
            } else {
                content.clone()
            }
        }
    };

    // Create response JSON
    let response = json!({
        "filename": filename,
        "path": path,
        "type": file_type,
        "lines": lines,
        "words": words,
        "size": size,
        "summary": summary,
        "processed_at": chrono::Utc::now().timestamp_millis(),
        "success": true
    });

    log::info!(
        "[FILE UPLOAD] ✅ Processed: {} ({} lines, {} words)",
        filename,
        lines,
        words
    );

    Ok(response.to_string())
}

// ═══════════════════════════════════════════════════════════════
// ✅ v∞.C - MEMORY PERSISTENCE COMMANDS
// ═══════════════════════════════════════════════════════════════

/// Récupérer tous les fichiers stockés
#[tauri::command]
pub async fn get_all_files() -> Result<String, String> {
    log::info!("[MEMORY] get_all_files");
    match crate::memory_persistence::get_all_files() {
        Ok(files) => {
            serde_json::to_string(&files).map_err(|e| format!("Serialization error: {}", e))
        }
        Err(e) => Err(e),
    }
}

/// Récupérer les fichiers par catégorie
#[tauri::command]
pub async fn get_files_by_category(category: String) -> Result<String, String> {
    log::info!("[MEMORY] get_files_by_category: {}", category);
    match crate::memory_persistence::get_files_by_category(&category) {
        Ok(files) => {
            serde_json::to_string(&files).map_err(|e| format!("Serialization error: {}", e))
        }
        Err(e) => Err(e),
    }
}

/// Effacer toute la mémoire
#[tauri::command]
pub async fn clear_memory() -> Result<bool, String> {
    log::info!("[MEMORY] clear_memory");
    match crate::memory_persistence::clear_memory() {
        Ok(_) => Ok(true),
        Err(e) => Err(e),
    }
}

/// Sauvegarder un fichier dans la mémoire
#[tauri::command]
pub async fn store_file(path: String, category: String, content: String) -> Result<bool, String> {
    log::info!("[MEMORY] store_file: {} ({})", path, category);
    match crate::memory_persistence::store_file(&path, &category, &content) {
        Ok(_) => Ok(true),
        Err(e) => Err(e),
    }
}

// ─────────────────────────────────────────────────────────────────
// Helper: Generate mock AI responses
// ─────────────────────────────────────────────────────────────────

fn generate_mock_response(message: &str) -> String {
    let lower = message.to_lowercase();

    // Pattern-based responses
    if lower.contains("bonjour") || lower.contains("salut") || lower.contains("hello") {
        return "Bonjour ! Je suis TITANE∞ en mode mock backend. Mes réponses sont simulées pour le développement frontend. Pour utiliser les vrais services IA, configure Gemini API ou lance Ollama.".to_string();
    }

    if lower.contains("comment ça va") || lower.contains("comment vas-tu") {
        return "Je fonctionne en mode mock ! Tous mes systèmes sont opérationnels pour le développement. Backend réel non activé.".to_string();
    }

    if lower.contains("qui es-tu") || lower.contains("présente-toi") {
        return "TITANE∞ — Système cognitif local\n\n**Mode actuel:** Mock Backend (développement frontend)\n**Architecture:** React + Tauri + Rust\n**Design System:** v24 Metallic Monochrome\n\nPour activer l'IA réelle, configure `.env` avec ta clé Gemini API.".to_string();
    }

    if lower.contains("test") {
        return "✅ Test réussi ! Le backend mock répond correctement. L'architecture Chat IA v18 fonctionne:\n\n• Provider cascade: tauri → gemini → ollama → local\n• Fallback automatique garanti\n• UI métallique active\n\nProchaine étape: activer backend réel avec Gemini/Ollama.".to_string();
    }

    // Default response
    format!(
        "Message reçu: \"{}\"\n\n🤖 **Mode Mock Backend**\nCeci est une réponse simulée du backend Rust. \n\nPour activer le backend sécurisé:\n• Définis `TITANE_SECRETS_PASSPHRASE` puis appelle `chat_set_gemini_key`\n• Ou lance Ollama: `ollama serve`\n\nArchitecture Chat IA v18 fonctionnelle ✅",
        message
    )
}

// ═══════════════════════════════════════════════════════════════
// COGNITIVE LAYER v16 - Mock Commands
// ═══════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn cognitive_analyze(_data: String) -> AppResult<serde_json::Value> {
    Ok(json!({
        "anomalies_detected": 0,
        "patterns_found": ["normal_operation"],
        "confidence_score": 0.95,
        "timestamp": chrono::Utc::now().timestamp()
    }))
}

#[tauri::command]
pub async fn cognitive_check_coherence(_state_data: String) -> AppResult<serde_json::Value> {
    Ok(json!({
        "is_coherent": true,
        "contradictions_found": 0,
        "coherence_score": 0.98,
        "recommendations": []
    }))
}

#[tauri::command]
pub async fn cognitive_integrate(signals: Vec<String>) -> AppResult<serde_json::Value> {
    Ok(json!({
        "signals_merged": signals.len(),
        "context_depth": 5,
        "integration_quality": 0.92
    }))
}

#[tauri::command]
pub async fn cognitive_learn(experience: String) -> AppResult<()> {
    log::info!("[Cognitive v16 Mock] Learning from: {}", experience);
    Ok(())
}

#[tauri::command]
pub async fn cognitive_get_status() -> AppResult<serde_json::Value> {
    Ok(json!({
        "analysis_scans": 42,
        "consistency_checks": 35,
        "integration_cycles": 28,
        "learning_cycles": 15,
        "optimization_score": 0.87
    }))
}

#[tauri::command]
pub async fn cognitive_optimize() -> AppResult<()> {
    log::info!("[Cognitive v16 Mock] Running optimization");
    Ok(())
}

// ═══════════════════════════════════════════════════════════════
// VOICE / TTS / ASR (v16.2.2+)
// ═══════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn speak(
    text: String,
    _config: Option<serde_json::Value>,
    _use_online: Option<bool>,
) -> AppResult<()> {
    log::info!(
        "[Voice Mock] TTS: \"{}\"",
        text.chars().take(50).collect::<String>()
    );
    Ok(())
}

#[tauri::command]
pub async fn stop_speaking() -> AppResult<()> {
    log::info!("[Voice Mock] TTS stopped");
    Ok(())
}

#[tauri::command]
pub async fn is_speaking() -> AppResult<bool> {
    Ok(false)
}

#[tauri::command]
pub async fn start_recording(_config: Option<serde_json::Value>) -> AppResult<String> {
    log::info!("[Voice Mock] Recording started");
    Ok("mock-recording-id".to_string())
}

#[tauri::command]
pub async fn stop_recording() -> AppResult<serde_json::Value> {
    log::info!("[Voice Mock] Recording stopped");
    Ok(json!({
        "transcript": "Bonjour TITANE (mock transcript)",
        "confidence": 0.95,
        "duration": 2.5
    }))
}

#[tauri::command]
pub async fn transcribe_audio(_audio_data: Vec<u8>) -> AppResult<String> {
    log::info!(
        "[Voice Mock] Transcribing audio ({} bytes)",
        _audio_data.len()
    );
    // En mode mock, retourner une transcription fictive
    // En production, ceci utilise Whisper/Vosk via asr.rs
    Ok("Bonjour, ceci est une transcription de test.".to_string())
}
