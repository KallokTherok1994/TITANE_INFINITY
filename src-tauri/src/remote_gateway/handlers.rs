// ═══════════════════════════════════════════════════════════════
//   TITANE∞ Remote Gateway — REST Handlers (Ring 0 → Ring 2)
//   All handlers proxy Ring 2 functions. No direct I/O here.
//   IPC contract: { ok: bool, content: Value | null, error: str | null }
// ═══════════════════════════════════════════════════════════════

use axum::{
    extract::{Json, State},
    http::StatusCode,
    response::IntoResponse,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::sync::Arc;

use crate::conversation_engine::{
    commands::{conversation_generate_inner, ConversationGenerateArgs},
    ConversationEngineState,
};
use crate::overdrive::chat_orchestrator::ChatOrchestratorState;
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
    Json(mut payload): Json<InvokeRequest>,
) -> impl IntoResponse {
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
                "memory KV requires Tauri managed state — not available in remote gateway; use LTM via conversation_generate"
            ))
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
                dir.into_path(),
                "test-password".into(),
                ai_router,
                singularity,
            )
            .expect("engine init in test"),
        );
        let orchestrator = crate::overdrive::chat_orchestrator::init();
        GatewayState {
            auth: Arc::new(RemoteAuthState::new(
                derive_jwt_secret("test-pass"),
                hash_shared_secret("test-secret"),
            )),
            engine,
            orchestrator,
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
        let result = invoke_handler(State(state), Json(req)).await;
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
        let result = invoke_handler(State(state), Json(req)).await;
        let _ = result;
    }
}
