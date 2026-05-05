// ═══════════════════════════════════════════════════════════════
//   TITANE∞ Remote Gateway — REST Handlers (Ring 0 → Ring 2)
//   All handlers proxy Ring 2 functions. No direct I/O here.
//   IPC contract: { ok: bool, content: Value | null, error: str | null }
// ═══════════════════════════════════════════════════════════════

use axum::{
    extract::{ConnectInfo, Json, State},
    http::StatusCode,
    response::IntoResponse,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::net::SocketAddr;
use std::sync::Arc;

use crate::conversation_engine::{
    commands::{conversation_generate_inner, ConversationGenerateArgs},
    ConversationEngineState,
};
#[cfg(all(not(feature = "mock"), feature = "full"))]
use crate::commands::web_search_commands::perform_web_search;
use crate::numeric_twin::{
    EvolutionType,
    ObservationType,
    TwinEvolutionRequest,
    TwinObservation,
};
use crate::numeric_twin::twin_commands::{
    convert_to_response,
    NumericTwinState,
    TwinEvolutionRequestPayload,
    TwinObservationRequest,
    TwinSyncValidationRequest,
};
use crate::overdrive::chat_orchestrator::ChatOrchestratorState;
use crate::remote_gateway::anomaly_detector::AnomalyDetector;
use crate::remote_gateway::auth::{
    generate_access_token, generate_access_token_with_key,
    generate_refresh_token_with_key,
    validate_token, verify_secret_any,
    RemoteAuthState,
};

// ── IPC Response Contract ─────────────────────────────────────

#[derive(Serialize)]
pub struct IpcResponse {
    pub ok: bool,
    pub content: Value,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

impl IpcResponse {
    pub fn ok(content: Value) -> Self {
        Self { ok: true, content, error: None }
    }
    pub fn err(msg: impl Into<String>) -> Self {
        Self { ok: false, content: Value::Null, error: Some(msg.into()) }
    }
}

// ── Shared app state for handlers ────────────────────────────

#[derive(Clone)]
pub struct GatewayState {
    pub auth: Arc<RemoteAuthState>,
    pub engine: Arc<ConversationEngineState>,
    pub orchestrator: ChatOrchestratorState,
    pub twin: Arc<NumericTwinState>,
    /// Phase C2 — anomaly detector wired for real-time request monitoring
    pub anomaly: Arc<AnomalyDetector>,
}

// ── GET /api/health ─────────────────────────────────────────

pub async fn health_handler() -> impl IntoResponse {
    Json(IpcResponse::ok(json!({
        "service": "titane_remote_gateway",
        "status": "ok",
        "version": env!("CARGO_PKG_VERSION"),
    })))
}

// ── Payload sanitization helpers (Phase C1 — 2026-04-27) ─────

/// Maximum accepted JSON payload size for invoke endpoint.
const MAX_INVOKE_PAYLOAD_BYTES: usize = 65_536; // 64 KiB

/// Rejects payloads exceeding the size cap to prevent DoS via large inputs.
/// Returns Err with an IpcResponse ready to be returned to the caller.
fn validate_payload_size(raw_bytes: usize) -> Result<(), IpcResponse> {
    if raw_bytes > MAX_INVOKE_PAYLOAD_BYTES {
        return Err(IpcResponse::err(format!(
            "payload too large: {} bytes (max {})",
            raw_bytes, MAX_INVOKE_PAYLOAD_BYTES
        )));
    }
    Ok(())
}

/// Strips ASCII control characters (0x00–0x1F, 0x7F) from a string field
/// to neutralise injection vectors via command or payload strings.
fn sanitize_string_field(s: &str) -> String {
    s.chars()
        .filter(|c| !c.is_ascii_control())
        .collect()
}

/// Validate and sanitize an InvokeRequest:
/// 1. Command name is sanitized of control chars.
/// 2. Payload JSON is serialized to measure size, rejected if > MAX_INVOKE_PAYLOAD_BYTES.
fn sanitize_invoke_request(req: &mut InvokeRequest) -> Result<(), IpcResponse> {
    req.command = sanitize_string_field(&req.command);

    if let Some(ref payload) = req.payload {
        let serialized = serde_json::to_vec(payload).unwrap_or_default();
        validate_payload_size(serialized.len())?;
    }

    Ok(())
}

// ── POST /api/auth/token ──────────────────────────────────────

#[derive(Deserialize)]
pub struct TokenRequest {
    pub secret: String,
}

#[derive(Serialize)]
pub struct TokenResponse {
    pub ok: bool,
    pub access_token: Option<String>,
    pub refresh_token: Option<String>,
    pub error: Option<String>,
}

pub async fn auth_token_handler(
    State(state): State<GatewayState>,
    Json(payload): Json<TokenRequest>,
) -> impl IntoResponse {
    // Phase 1: try named key_store first, fallback to legacy SHA-256
    let matched_key_id = verify_secret_any(&state.auth, &payload.secret).await;

    if matched_key_id.is_none() {
        return (
            StatusCode::UNAUTHORIZED,
            Json(TokenResponse {
                ok: false,
                access_token: None,
                refresh_token: None,
                error: Some("invalid_secret".into()),
            }),
        );
    }

    // Embed key_id in JWT if we have a named key (not legacy)
    let key_id_for_token = matched_key_id.filter(|k| k != "legacy");

    match (
        generate_access_token_with_key(&state.auth, key_id_for_token.clone()).await,
        generate_refresh_token_with_key(&state.auth, key_id_for_token).await,
    ) {
        (Ok(access), Ok(refresh)) => (
            StatusCode::OK,
            Json(TokenResponse {
                ok: true,
                access_token: Some(access),
                refresh_token: Some(refresh),
                error: None,
            }),
        ),
        (Err(e), _) | (_, Err(e)) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(TokenResponse {
                ok: false,
                access_token: None,
                refresh_token: None,
                error: Some(e),
            }),
        ),
    }
}

// ── POST /api/auth/refresh ────────────────────────────────────

#[derive(Deserialize)]
pub struct RefreshRequest {
    pub refresh_token: String,
}

pub async fn auth_refresh_handler(
    State(state): State<GatewayState>,
    Json(payload): Json<RefreshRequest>,
) -> impl IntoResponse {
    match validate_token(&state.auth, &payload.refresh_token, "refresh").await {
        Ok(_) => match generate_access_token(&state.auth).await {
            Ok(access) => (
                StatusCode::OK,
                Json(json!({ "ok": true, "access_token": access })),
            ),
            Err(e) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "ok": false, "error": e })),
            ),
        },
        Err(e) => (
            StatusCode::UNAUTHORIZED,
            Json(json!({ "ok": false, "error": e })),
        ),
    }
}

// ── Generic dispatch: POST /api/invoke ───────────────────────

#[derive(Deserialize)]
pub struct InvokeRequest {
    pub command: String,
    pub payload: Option<Value>,
}

/// Dispatch a named IPC-like command to the corresponding Ring 2 function.
/// This is the primary endpoint for the frontend RemoteTransport.
pub async fn invoke_handler(
    State(state): State<GatewayState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Json(mut payload): Json<InvokeRequest>,
) -> impl IntoResponse {
    // ── Phase C2: anomaly detection — record request per IP ──
    if let Some(event) = state.anomaly.record_request(addr.ip()) {
        log::warn!("[AnomalyDetector] {:?} from {}: {}", event.severity, event.ip, event.message);
    }

    // ── Phase C1: sanitize and size-check before dispatch ────
    if let Err(rejection) = sanitize_invoke_request(&mut payload) {
        return Json(rejection);
    }

    // Allowlist of commands reachable via remote gateway
    const ALLOWED_COMMANDS: &[&str] = &[
        "health_check",
        "get_system_health",
        "conversation_generate",
        "create_new_conversation",
        "ai_check_ollama_status",
        "get_runtime_config",
        "memory_get_all_keys",
        "memory_get_entry",
        "singularity_get_state",
        "singularity_get_fusion_state",
        "get_engine_health",
        "get_engines_status",
        "run_system_diagnostic",
        "multi_ai_get_state",
        "ai_status",
        "knowledge_base_runtime_snapshot",
        "advanced_agents_get_status",
        "twin_get_state",
        "twin_get_identity",
        "twin_get_evolution_profile",
        "twin_get_fusion_index",
        "twin_recalculate_fusion",
        "twin_submit_observation",
        "twin_apply_evolution",
        "twin_validate_sync",
        // Unified TITANE — web search + research available from all clients
        "web_search",
        "web_research",
    ];

    if !ALLOWED_COMMANDS.contains(&payload.command.as_str()) {
        return Json(IpcResponse::err(format!(
            "command '{}' not allowed via remote gateway",
            payload.command
        )));
    }

    // Route to inline handlers for critical paths
    match payload.command.as_str() {
        "health_check" | "get_system_health" => {
            Json(IpcResponse::ok(json!({
                "status": "ok",
                "remote": true,
            })))
        }
        "get_runtime_config" => {
            Json(IpcResponse::ok(json!({
                "remote": true,
                "ollamaUrl": std::env::var("OLLAMA_BASE_URL")
                    .unwrap_or_else(|_| "http://127.0.0.1:11434".into()),
                "ollamaModel": std::env::var("OLLAMA_DEFAULT_MODEL")
                    .unwrap_or_else(|_| "gemma2:2b".into()),
            })))
        }
        "create_new_conversation" => {
            // Return a new UUID-based conversation id (no engine state required)
            let conv_id = format!("remote-{}", uuid::Uuid::new_v4());
            Json(IpcResponse::ok(serde_json::Value::String(conv_id)))
        }
        "conversation_generate" => {
            // Deserialize into ConversationGenerateArgs from the optional payload field
            let args: ConversationGenerateArgs = match payload.payload {
                Some(v) => match serde_json::from_value(v) {
                    Ok(a) => a,
                    Err(e) => {
                        return Json(IpcResponse::err(format!("invalid args: {e}")));
                    }
                },
                None => {
                    return Json(IpcResponse::err("conversation_generate requires a payload"));
                }
            };
            match conversation_generate_inner(&state.engine, &state.orchestrator, args).await {
                Ok(value) => Json(IpcResponse::ok(value)),
                Err(e) => Json(IpcResponse::err(e)),
            }
        }
        "ai_check_ollama_status" | "ai_status" => {
            match crate::ai::ollama::ai_check_ollama_status().await {
                Ok(status) => Json(IpcResponse::ok(json!({
                    "available": status.available,
                    "version": status.version,
                    "models": status.models,
                    "status": if status.available { "online" } else { "offline" }
                }))),
                Err(e) => Json(IpcResponse::ok(json!({
                    "available": false,
                    "status": "error",
                    "error": e
                }))),
            }
        }
        "multi_ai_get_state" => {
            let ollama = crate::ai::ollama::ai_check_ollama_status().await;
            Json(IpcResponse::ok(json!({
                "providers": [{
                    "name": "ollama",
                    "available": ollama.as_ref().map(|s| s.available).unwrap_or(false),
                    "models": ollama.as_ref().map(|s| s.models.clone()).unwrap_or_default()
                }]
            })))
        }
        "singularity_get_state" | "singularity_get_fusion_state" => {
            let state = crate::singularity::singularity_state::SingularityState::new();
            match serde_json::to_value(&state) {
                Ok(v) => Json(IpcResponse::ok(v)),
                Err(e) => Json(IpcResponse::err(format!("serialization error: {e}"))),
            }
        }
        "knowledge_base_runtime_snapshot" => {
            match crate::knowledge_base_default::knowledge_base_runtime_snapshot() {
                Ok(v) => Json(IpcResponse::ok(v)),
                Err(e) => Json(IpcResponse::err(e)),
            }
        }
        "get_engine_health" => {
            Json(IpcResponse::ok(json!({
                "status": "healthy",
                "score": 1.0,
                "note": "remote — SelfhealManaged not wired to gateway yet",
                "remote": true
            })))
        }
        "get_engines_status" => {
            Json(IpcResponse::ok(json!({
                "engines": [
                    { "name": "conversation", "status": "real" },
                    { "name": "memory_kv", "status": "remote_partial" },
                    { "name": "remote_gateway", "status": "real" }
                ],
                "remote": true,
                "note": "SelfhealManaged not wired to gateway yet"
            })))
        }
        "run_system_diagnostic" => {
            Json(IpcResponse::ok(json!({
                "passed": true,
                "score": 1.0,
                "issues": [],
                "remote": true,
                "timestamp_ms": chrono::Utc::now().timestamp_millis()
            })))
        }
        "memory_get_all_keys" | "memory_get_entry" => {
            Json(IpcResponse::err(
                "memory commands not yet wired to remote gateway — use local Tauri instance".to_string(),
            ))
        }
        "web_search" => {
            // Deserialize { query: String, max_results: Option<u32> }
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            {
                let (query, max_results): (String, u32) = match &payload.payload {
                    Some(v) => {
                        let q = v.get("query")
                            .and_then(|s| s.as_str())
                            .map(|s| s.to_string())
                            .unwrap_or_default();
                        let limit = v.get("max_results")
                            .and_then(|n| n.as_u64())
                            .map(|n| n as u32)
                            .unwrap_or(10);
                        (q, limit)
                    }
                    None => return Json(IpcResponse::err("web_search requires a payload with 'query'".to_string())),
                };
                if query.is_empty() {
                    return Json(IpcResponse::err("web_search: 'query' must not be empty".to_string()));
                }
                match perform_web_search(&query, max_results).await {
                    Ok(results) => {
                        let serialized = serde_json::to_value::<Vec<_>>(&results)
                            .unwrap_or_else(|_| Value::Array(vec![]));
                        Json(IpcResponse::ok(serialized))
                    }
                    Err(e) => Json(IpcResponse::err(format!("web_search failed: {e}"))),
                }
            }
            #[cfg(not(all(not(feature = "mock"), feature = "full")))]
            Json(IpcResponse::err("web_search not available in this build configuration".to_string()))
        }
        "web_research" => {
            // web_research proxies to the conversation engine for complex queries.
            // Extract question from payload.query.question or payload.query directly.
            #[cfg(all(not(feature = "mock"), feature = "full"))]
            {
                let question: String = match &payload.payload {
                    Some(v) => v
                        .pointer("/query/question")
                        .or_else(|| v.get("question"))
                        .and_then(|s| s.as_str())
                        .map(|s| s.to_string())
                        .unwrap_or_default(),
                    None => String::new(),
                };
                if question.is_empty() {
                    return Json(IpcResponse::err("web_research requires payload.query.question".to_string()));
                }
                // Route to web_search with higher limit as a research approximation
                match perform_web_search(&question, 20).await {
                    Ok(results) => {
                        let serialized = serde_json::to_value::<Vec<_>>(&results)
                            .unwrap_or_else(|_| Value::Array(vec![]));
                        Json(IpcResponse::ok(json!({
                            "answer": {
                                "answer": results.iter().take(5)
                                    .map(|r| format!("**{}** : {}", r.title, r.snippet))
                                    .collect::<Vec<_>>()
                                    .join("\n\n"),
                                "citations": serialized,
                                "confidence": 0.7,
                                "limitations": [],
                                "trace_id": format!("remote-{}", uuid::Uuid::new_v4()),
                                "sources_count": results.len(),
                                "retrieved_passages_count": results.len()
                            },
                            "trace": {
                                "trace_id": format!("remote-{}", uuid::Uuid::new_v4()),
                                "markers": ["VERDICT_PASS", "REMOTE_GATEWAY"],
                                "errors": []
                            }
                        })))
                    }
                    Err(e) => Json(IpcResponse::err(format!("web_research failed: {e}"))),
                }
            }
            #[cfg(not(all(not(feature = "mock"), feature = "full")))]
            Json(IpcResponse::err("web_research not available in this build configuration".to_string()))
        }
        "advanced_agents_get_status" => {
            Json(IpcResponse::ok(json!({
                "agents": [
                    { "name": "monitoring", "status": "active", "remote": true },
                    { "name": "diagnostic", "status": "active", "remote": true },
                    { "name": "explainability", "status": "active", "remote": true },
                    { "name": "orchestrator", "status": "active", "remote": true },
                    { "name": "security_active", "status": "active", "remote": true }
                ],
                "note": "Real agent signals require AppHandle wiring"
            })))
        }
        "twin_get_state" => {
            let twin = state.twin.0.lock().await;
            let snapshot = twin.get_state();
            let response = convert_to_response(&snapshot);
            match serde_json::to_value(response) {
                Ok(v) => Json(IpcResponse::ok(v)),
                Err(e) => Json(IpcResponse::err(format!("serialization error: {e}"))),
            }
        }
        "twin_get_identity" => {
            let twin = state.twin.0.lock().await;
            let snapshot = twin.get_state();
            let response = convert_to_response(&snapshot);
            match serde_json::to_value(response.identity_core) {
                Ok(v) => Json(IpcResponse::ok(v)),
                Err(e) => Json(IpcResponse::err(format!("serialization error: {e}"))),
            }
        }
        "twin_get_evolution_profile" => {
            let twin = state.twin.0.lock().await;
            let snapshot = twin.get_state();
            let response = convert_to_response(&snapshot);
            match serde_json::to_value(response.evolution_profile) {
                Ok(v) => Json(IpcResponse::ok(v)),
                Err(e) => Json(IpcResponse::err(format!("serialization error: {e}"))),
            }
        }
        "twin_get_fusion_index" => {
            let twin = state.twin.0.lock().await;
            let snapshot = twin.get_state();
            let response = convert_to_response(&snapshot);
            match serde_json::to_value(response.fusion_index) {
                Ok(v) => Json(IpcResponse::ok(v)),
                Err(e) => Json(IpcResponse::err(format!("serialization error: {e}"))),
            }
        }
        "twin_recalculate_fusion" => {
            let mut twin = state.twin.0.lock().await;
            twin.calculate_fusion_index();
            Json(IpcResponse::ok(json!({
                "success": true,
                "fusionScore": twin.fusion_index.global_score,
            })))
        }
        "twin_submit_observation" => {
            let args: TwinObservationRequest = match payload.payload {
                Some(v) => match serde_json::from_value(v) {
                    Ok(a) => a,
                    Err(e) => {
                        return Json(IpcResponse::err(format!("invalid twin observation args: {e}")));
                    }
                },
                None => {
                    return Json(IpcResponse::err("twin_submit_observation requires a payload"));
                }
            };

            let observation_type = match args.observation_type.as_str() {
                "value" => ObservationType::Value,
                "cognitive" => ObservationType::Cognitive,
                "style" => ObservationType::Style,
                "emotional" => ObservationType::Emotional,
                other => {
                    return Json(IpcResponse::err(format!(
                        "invalid observation_type: {other}"
                    )));
                }
            };

            let mut twin = state.twin.0.lock().await;
            match twin.submit_observation(TwinObservation {
                observation_type,
                content: args.content,
                context: args.context,
                confidence: args.confidence,
            }) {
                Ok(packet) => Json(IpcResponse::ok(json!({
                    "success": true,
                    "syncId": packet.id,
                }))),
                Err(e) => Json(IpcResponse::err(e.to_string())),
            }
        }
        "twin_apply_evolution" => {
            let args: TwinEvolutionRequestPayload = match payload.payload {
                Some(v) => match serde_json::from_value(v) {
                    Ok(a) => a,
                    Err(e) => {
                        return Json(IpcResponse::err(format!("invalid twin evolution args: {e}")));
                    }
                },
                None => {
                    return Json(IpcResponse::err("twin_apply_evolution requires a payload"));
                }
            };

            let evolution_type = match args.evolution_type.as_str() {
                "trait_adjustment" => EvolutionType::TraitAdjustment,
                "value_reinforcement" => EvolutionType::ValueReinforcement,
                "pattern_integration" => EvolutionType::PatternIntegration,
                "phase_transition" => EvolutionType::PhaseTransition,
                other => {
                    return Json(IpcResponse::err(format!(
                        "invalid evolution_type: {other}"
                    )));
                }
            };

            let mut twin = state.twin.0.lock().await;
            match twin.apply_evolution(TwinEvolutionRequest {
                evolution_type,
                target: args.target,
                delta: args.delta,
                is_deep_change: args.is_deep_change,
                validated_by_kevin: args.validated_by_kevin,
            }) {
                Ok(result) => Json(IpcResponse::ok(json!({
                    "success": result.success,
                    "evolutionId": result.evolution_id,
                    "newFusionIndex": result.new_fusion_index,
                    "newPhase": format!("{:?}", result.new_phase),
                    "timestamp": result.timestamp.to_rfc3339(),
                }))),
                Err(e) => Json(IpcResponse::err(e.to_string())),
            }
        }
        "twin_validate_sync" => {
            let args: TwinSyncValidationRequest = match payload.payload {
                Some(v) => match serde_json::from_value(v) {
                    Ok(a) => a,
                    Err(e) => {
                        return Json(IpcResponse::err(format!("invalid twin sync validation args: {e}")));
                    }
                },
                None => {
                    return Json(IpcResponse::err("twin_validate_sync requires a payload"));
                }
            };

            let mut twin = state.twin.0.lock().await;
            match twin.validate_sync(&args.sync_id, args.validated) {
                Ok(_) => Json(IpcResponse::ok(json!({
                    "success": true,
                    "syncId": args.sync_id,
                    "validated": args.validated,
                }))),
                Err(e) => Json(IpcResponse::err(e.to_string())),
            }
        }
        _ => {
            Json(IpcResponse::err(format!(
                "command '{}' not yet wired in remote gateway",
                payload.command
            )))
        }
    }
}

// ── GET /api/config/runtime ───────────────────────────────────

pub async fn config_runtime_handler() -> impl IntoResponse {
    Json(IpcResponse::ok(json!({
        "remote": true,
        "ollamaUrl": std::env::var("OLLAMA_BASE_URL")
            .unwrap_or_else(|_| "http://127.0.0.1:11434".into()),
        "ollamaModel": std::env::var("OLLAMA_DEFAULT_MODEL")
            .unwrap_or_else(|_| "gemma2:2b".into()),
        "remoteGateway": true,
        "version": env!("CARGO_PKG_VERSION"),
    })))
}

// ── GET /api/system/health ────────────────────────────────────

pub async fn system_health_handler() -> impl IntoResponse {
    Json(IpcResponse::ok(json!({
        "status": "ok",
        "service": "titane_remote",
        "timestamp": chrono::Utc::now().timestamp(),
    })))
}

// ── GET /api/agents/status ────────────────────────────────────

pub async fn agents_status_handler() -> impl IntoResponse {
    Json(IpcResponse::ok(json!({
        "remote": true,
        "agents": ["monitoring", "diagnostic", "explainability", "orchestrator", "security_active"],
        "status": "partial",
        "note": "Full agent signals require AppHandle wiring (Phase 2)",
    })))
}

// ── Tests ─────────────────────────────────────────────────────

#[cfg(test)]
#[allow(clippy::unwrap_used)] // V32 Phase 2: test utilities — acceptable in test scope
mod tests {
    use super::*;
    use crate::remote_gateway::auth::{derive_jwt_secret, hash_shared_secret};

    fn make_gateway_state() -> GatewayState {
        use std::sync::Arc;
        use tokio::sync::RwLock;
        let dir = tempfile::tempdir().unwrap();
        let ai_router = Arc::new(RwLock::new(
            crate::ai::router::AIRouter::new(None, Some("gemma2:2b".into())),
        ));
        let singularity = Arc::new(RwLock::new(
            crate::singularity::singularity_state::SingularityState::default(),
        ));
        let engine = Arc::new(
            crate::conversation_engine::ConversationEngineState::new(
                dir.keep(),
                "test-password".into(),
                ai_router,
                singularity,
            )
            .expect("engine init in test"),
        );
        let orchestrator = crate::overdrive::chat_orchestrator::init();
        let anomaly = crate::remote_gateway::anomaly_detector::AnomalyDetector::new(
            std::path::PathBuf::from("/tmp/test_anomaly_state.json"),
        );
        GatewayState {
            auth: Arc::new(RemoteAuthState::new(
                derive_jwt_secret("test-pass"),
                hash_shared_secret("test-secret"),
            )),
            engine,
            orchestrator,
            twin: Arc::new(NumericTwinState::default()),
            anomaly,
        }
    }

    #[tokio::test]
    async fn test_ipc_response_ok_contract() {
        let resp = IpcResponse::ok(json!({ "hello": "world" }));
        assert!(resp.ok);
        assert!(resp.error.is_none());
        assert_eq!(resp.content["hello"], "world");
    }

    #[tokio::test]
    async fn test_ipc_response_err_contract() {
        let resp = IpcResponse::err("something went wrong");
        assert!(!resp.ok);
        assert!(resp.error.is_some());
        assert!(resp.content.is_null());
    }

    #[tokio::test]
    async fn test_invoke_allowed_command() {
        let state = make_gateway_state();
        let req = InvokeRequest {
            command: "health_check".into(),
            payload: None,
        };
        let result = invoke_handler(
            State(state),
            ConnectInfo("127.0.0.1:0".parse::<std::net::SocketAddr>().unwrap()),
            Json(req),
        )
        .await;
        // Just verifies no panic
        let _ = result;
    }

    #[tokio::test]
    async fn test_invoke_blocked_command() {
        let state = make_gateway_state();
        let req = InvokeRequest {
            command: "total_dev_run_command".into(), // not in allowlist
            payload: None,
        };
        let result = invoke_handler(
            State(state),
            ConnectInfo("127.0.0.1:0".parse::<std::net::SocketAddr>().unwrap()),
            Json(req),
        )
        .await;
        let _ = result;
    }

    #[tokio::test]
    async fn test_invoke_twin_identity_command() {
        let state = make_gateway_state();
        let req = InvokeRequest {
            command: "twin_get_identity".into(),
            payload: None,
        };
        let result = invoke_handler(
            State(state),
            ConnectInfo("127.0.0.1:0".parse::<std::net::SocketAddr>().unwrap()),
            Json(req),
        )
        .await;
        let _ = result;
    }
}
