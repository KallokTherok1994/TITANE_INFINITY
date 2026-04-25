// ═══════════════════════════════════════════════════════════════
//   TITANE∞ Remote Gateway — WebSocket Streaming Handler (Ring 0)
//   Proxies Ollama/AI streaming via ws://host:port/api/stream
// ═══════════════════════════════════════════════════════════════

use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        Query, State,
    },
    response::IntoResponse,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::sync::Arc;

use crate::remote_gateway::auth::{validate_token, RemoteAuthState};

#[derive(Clone)]
pub struct WsState {
    pub auth: Arc<RemoteAuthState>,
}

#[derive(Deserialize)]
pub struct WsQuery {
    /// JWT access token passed as query param for WebSocket upgrade
    pub token: String,
}

/// WebSocket upgrade endpoint: /api/stream?token=<JWT>
pub async fn ws_stream_handler(
    ws: WebSocketUpgrade,
    Query(query): Query<WsQuery>,
    State(state): State<WsState>,
) -> impl IntoResponse {
    // Validate JWT before accepting upgrade
    match validate_token(&state.auth, &query.token, "access").await {
        Ok(_) => ws.on_upgrade(handle_socket),
        Err(e) => {
            // Return 401 as a regular HTTP response (upgrade rejected)
            axum::response::Response::builder()
                .status(401)
                .body(axum::body::Body::from(format!("{{\"ok\":false,\"error\":\"{e}\"}}")))
                .unwrap()
                .into_response()
        }
    }
}

async fn handle_socket(mut socket: WebSocket) {
    while let Some(msg) = socket.recv().await {
        match msg {
            Ok(Message::Text(text)) => {
                let response = process_ws_message(&text).await;
                let payload = serde_json::to_string(&response).unwrap_or_else(|_| {
                    r#"{"ok":false,"error":"serialization_error"}"#.to_string()
                });
                if socket.send(Message::Text(payload)).await.is_err() {
                    break;
                }
            }
            Ok(Message::Close(_)) | Err(_) => break,
            _ => {}
        }
    }
}

#[derive(Deserialize)]
struct StreamRequest {
    command: String,
    payload: Option<Value>,
    #[allow(dead_code)]
    stream_id: Option<String>,
}

#[derive(Serialize)]
struct StreamChunk {
    ok: bool,
    stream_id: String,
    chunk: Option<String>,
    done: bool,
    error: Option<String>,
}

async fn process_ws_message(text: &str) -> Value {
    let req: StreamRequest = match serde_json::from_str(text) {
        Ok(r) => r,
        Err(e) => {
            return json!({
                "ok": false,
                "error": format!("invalid_message: {e}"),
                "done": true,
            });
        }
    };

    match req.command.as_str() {
        "ping" => json!({ "ok": true, "pong": true, "done": true }),
        "stream_ai" => {
            // Phase 1: stub response — Phase 2 will wire AppHandle + ai_query_streaming
            json!({
                "ok": true,
                "stream_id": req.stream_id.unwrap_or_else(|| "stream-1".into()),
                "chunk": "[Remote streaming connected — AppHandle wiring in Phase 2]",
                "done": true,
            })
        }
        _ => json!({
            "ok": false,
            "error": format!("unknown stream command: {}", req.command),
            "done": true,
        }),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_process_ping() {
        let result = process_ws_message(r#"{"command":"ping"}"#).await;
        assert_eq!(result["ok"], true);
        assert_eq!(result["pong"], true);
    }

    #[tokio::test]
    async fn test_process_unknown_command() {
        let result = process_ws_message(r#"{"command":"unknown_cmd"}"#).await;
        assert_eq!(result["ok"], false);
    }

    #[tokio::test]
    async fn test_process_invalid_json() {
        let result = process_ws_message("not json").await;
        assert_eq!(result["ok"], false);
    }
}
