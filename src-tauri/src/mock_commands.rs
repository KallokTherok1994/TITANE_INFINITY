// ═══════════════════════════════════════════════════════════════════
//   TITANE∞ v14 — MOCK COMMANDS
//   Stubs pour développement frontend-only
// ═══════════════════════════════════════════════════════════════════

use crate::security::permission_guard::PERMISSION_GUARD;
use crate::security::permissions::Role;
use crate::utils::AppResult;
use serde_json::json;

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
        .require(
            "singularity_read",
            Role::System,
            "singularity_get_full_state",
        )
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
pub async fn sync_singularity() -> AppResult<()> {
    // ✅ v∞ Permission check (SYSTEM level required)
    PERMISSION_GUARD
        .require("singularity_write", Role::System, "sync_singularity")
        .await?;

    log::info!("Mock: sync_singularity called");
    Ok(())
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
pub async fn experience_get_state() -> AppResult<Option<serde_json::Value>> {
    // Try to load from localStorage emulation (file-based mock)
    // For now, return None to trigger frontend default state creation
    log::info!("Mock: experience_get_state called");
    Ok(None)
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

use serde::{Deserialize, Serialize};

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

#[tauri::command]
pub async fn chat_send_message(request: MockChatRequest) -> AppResult<MockChatResponse> {
    log::info!("[MOCK CHAT] chat_send_message: {}", request.message);

    let start = std::time::Instant::now();

    // Simulate AI processing delay (200-800ms)
    tokio::time::sleep(tokio::time::Duration::from_millis(
        400 + (rand::random::<u64>() % 400),
    ))
    .await;

    // Determine which mock provider to use based on request
    let (provider, model) = match request.provider.as_str() {
        "gemini" => ("gemini", "gemini-2.0-flash-exp"),
        "ollama" => ("ollama", "llama3.1"),
        "local" => ("local", "titane-echo"),
        _ => {
            // Auto mode: simulate cascade (always succeed with local in mock)
            log::info!("[MOCK CHAT] Auto mode: simulating fallback to local");
            ("local", "titane-echo")
        }
    };

    // Generate mock response based on message content
    let response_content = generate_mock_response(&request.message);

    let latency = start.elapsed().as_millis() as u64;

    Ok(MockChatResponse {
        message: MockChatMessage {
            id: format!("msg_{}", chrono::Utc::now().timestamp_millis()),
            role: "assistant".to_string(),
            content: response_content,
            timestamp: chrono::Utc::now().timestamp_millis() as u64,
            provider: provider.to_string(),
            model: model.to_string(),
            tokens: Some(150),
            multimodal: false,
        },
        success: true,
        error: None,
        latency_ms: latency,
    })
}

#[tauri::command]
pub async fn chat_get_providers_status() -> AppResult<Vec<MockProviderStatus>> {
    log::info!("[MOCK CHAT] chat_get_providers_status");

    Ok(vec![
        MockProviderStatus {
            provider: "gemini".to_string(),
            available: false, // Mock: not configured
            latency_ms: 0,
            models: vec!["gemini-2.0-flash-exp".to_string()],
            error: Some("API key not configured (mock mode)".to_string()),
        },
        MockProviderStatus {
            provider: "ollama".to_string(),
            available: false, // Mock: not running
            latency_ms: 0,
            models: vec!["llama3.1".to_string(), "qwen2.5".to_string()],
            error: Some("Ollama not running (mock mode)".to_string()),
        },
        MockProviderStatus {
            provider: "local".to_string(),
            available: true, // Always available in mock
            latency_ms: 50,
            models: vec!["titane-echo".to_string()],
            error: None,
        },
    ])
}

#[tauri::command]
pub async fn chat_check_providers() -> AppResult<Vec<MockProviderStatus>> {
    // Same as get_providers_status in mock mode
    chat_get_providers_status().await
}

#[tauri::command]
pub async fn chat_create_conversation() -> AppResult<String> {
    let conv_id = format!("conv_{}", chrono::Utc::now().timestamp_millis());
    log::info!("[MOCK CHAT] chat_create_conversation: {}", conv_id);
    Ok(conv_id)
}

#[tauri::command]
pub async fn chat_get_conversation(conversation_id: String) -> AppResult<serde_json::Value> {
    log::info!("[MOCK CHAT] chat_get_conversation: {}", conversation_id);

    Ok(json!({
        "conversation_id": conversation_id,
        "messages": [],
        "created_at": chrono::Utc::now().timestamp_millis(),
        "last_updated": chrono::Utc::now().timestamp_millis(),
    }))
}

#[tauri::command]
pub async fn chat_delete_conversation(conversation_id: String) -> AppResult<()> {
    log::info!("[MOCK CHAT] chat_delete_conversation: {}", conversation_id);
    Ok(())
}

#[tauri::command]
pub async fn chat_set_gemini_key(api_key: String) -> AppResult<()> {
    log::info!("[MOCK CHAT] chat_set_gemini_key: {} chars", api_key.len());
    // Mock: just log, don't actually store
    Ok(())
}

#[tauri::command]
pub async fn chat_stream_message(_request: MockChatRequest) -> AppResult<String> {
    log::info!("[MOCK CHAT] chat_stream_message: streaming not implemented in mock mode");
    Err(crate::utils::AppError::Io(
        "Streaming not supported in mock mode".to_string(),
    ))
}

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
        "Message reçu: \"{}\"\n\n🤖 **Mode Mock Backend**\nCeci est une réponse simulée du backend Rust. \n\nPour des réponses IA réelles:\n• Configure `VITE_GEMINI_API_KEY` dans `.env`\n• Ou lance Ollama: `ollama serve`\n\nArchitecture Chat IA v18 fonctionnelle ✅",
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
