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

use crate::remote_gateway::auth::{
    generate_access_token, generate_refresh_token, validate_token, verify_shared_secret,
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
}

// ── GET /api/health ─────────────────────────────────────────

pub async fn health_handler() -> impl IntoResponse {
    Json(IpcResponse::ok(json!({
        "service": "titane_remote_gateway",
        "status": "ok",
        "version": env!("CARGO_PKG_VERSION"),
    })))
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
    if !verify_shared_secret(&state.auth, &payload.secret).await {
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
    match (
        generate_access_token(&state.auth).await,
        generate_refresh_token(&state.auth).await,
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
    State(_state): State<GatewayState>,
    Json(payload): Json<InvokeRequest>,
) -> impl IntoResponse {
    // Allowlist of commands reachable via remote gateway
    const ALLOWED_COMMANDS: &[&str] = &[
        "health_check",
        "get_system_health",
        "conversation_generate",
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
        _ => {
            // For commands that need the full Tauri backend, return a clear partial status.
            // Phase 1: inline basic commands above. Phase 2 will wire Tauri AppHandle.
            Json(IpcResponse::err(format!(
                "command '{}' requires Tauri AppHandle wiring (Phase 2)",
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
        GatewayState {
            auth: Arc::new(RemoteAuthState::new(
                derive_jwt_secret("test-pass"),
                hash_shared_secret("test-secret"),
            )),
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
