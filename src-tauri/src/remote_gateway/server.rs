// ═══════════════════════════════════════════════════════════════
//   TITANE∞ Remote Gateway — Axum Server (Ring 0)
//   Started via tauri::async_runtime::spawn() — same tokio runtime
//   Configuration via ENV vars (see RemoteGatewayConfig below)
// ═══════════════════════════════════════════════════════════════

use axum::{
    extract::{Request, State},
    http::{HeaderMap, HeaderName, HeaderValue, StatusCode},
    middleware::{self, Next},
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use std::{net::SocketAddr, sync::Arc, path::PathBuf};
use tower_http::cors::{AllowHeaders, AllowMethods, AllowOrigin, CorsLayer};
use tower_http::set_header::SetResponseHeaderLayer;

use crate::security::csp::get_csp_headers;
use crate::numeric_twin::twin_commands::NumericTwinState;

use crate::{
    conversation_engine::ConversationEngineState,
    overdrive::chat_orchestrator::ChatOrchestratorState,
    remote_gateway::{
        anomaly_detector::AnomalyDetector,
        audit::RemoteAuditLogger,
        auth::{derive_jwt_secret, hash_shared_secret, validate_token, RemoteAuthState},
        handlers::{
            agents_status_handler, auth_refresh_handler, auth_token_handler, config_runtime_handler,
            health_handler, invoke_handler, system_health_handler, GatewayState,
        },
        rate_limit::RemoteRateLimiter,
        static_serve::static_router,
        ws_stream::{ws_stream_handler, WsState},
    },
};

// ── Config ────────────────────────────────────────────────────

#[derive(Clone, Debug)]
pub struct RemoteGatewayConfig {
    /// Port to bind the axum server on (default: 7420)
    pub port: u16,
    /// Allowed CORS origin (default: "*" for dev, strict in prod)
    pub cors_origin: String,
    /// JWT passphrase — derived from SecretsEngine passphrase
    pub jwt_passphrase: String,
    /// Shared secret that clients use to obtain the first JWT
    pub shared_secret: String,
    /// Directory with the remote frontend build (dist/remote)
    pub dist_remote_path: String,
    /// Directory for audit logs
    pub log_dir: PathBuf,
}

impl RemoteGatewayConfig {
    pub fn from_env(secrets_passphrase: &str, shared_secret: &str, log_dir: PathBuf) -> Self {
        Self {
            port: std::env::var("TITANE_REMOTE_PORT")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(7420),
            cors_origin: std::env::var("TITANE_REMOTE_ORIGIN")
                .unwrap_or_else(|_| "*".into()),
            jwt_passphrase: secrets_passphrase.to_string(),
            shared_secret: shared_secret.to_string(),
            dist_remote_path: std::env::var("TITANE_REMOTE_DIST")
                .unwrap_or_else(|_| "dist/remote".into()),
            log_dir,
        }
    }
}

// ── Auth extractor middleware ─────────────────────────────────

/// Axum middleware: validates Bearer JWT on protected routes
async fn require_auth(
    State(auth_state): State<Arc<RemoteAuthState>>,
    req: Request,
    next: Next,
) -> impl IntoResponse {
    let token = extract_bearer(req.headers());
    match token {
        Some(t) => match validate_token(&auth_state, t, "access").await {
            Ok(_) => next.run(req).await.into_response(),
            Err(e) => (
                StatusCode::UNAUTHORIZED,
                Json(serde_json::json!({ "ok": false, "error": e })),
            )
                .into_response(),
        },
        None => (
            StatusCode::UNAUTHORIZED,
            Json(serde_json::json!({ "ok": false, "error": "missing_bearer_token" })),
        )
            .into_response(),
    }
}

fn extract_bearer<'a>(headers: &'a HeaderMap) -> Option<&'a str> {
    headers
        .get("authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
}

// ── Build Router ──────────────────────────────────────────────

fn build_router(config: &RemoteGatewayConfig, engine: Arc<ConversationEngineState>, orchestrator: ChatOrchestratorState) -> Router {
    let auth_state = Arc::new(RemoteAuthState::new(
        derive_jwt_secret(&config.jwt_passphrase),
        hash_shared_secret(&config.shared_secret),
    ));

    let rate_limiter = RemoteRateLimiter::new();
    let audit_logger = RemoteAuditLogger::new(config.log_dir.join("remote_gateway.log"));

    // Phase C2 — instantiate anomaly detector with persist path adjacent to audit log
    let anomaly_path = config.log_dir.join("anomaly_state.json");
    let anomaly_detector = AnomalyDetector::new(anomaly_path);

    let gateway_state = GatewayState {
        auth: auth_state.clone(),
        engine,
        orchestrator,
        twin: Arc::new(NumericTwinState::default()),
        anomaly: anomaly_detector,
    };

    let ws_state = WsState {
        auth: auth_state.clone(),
    };

    // CORS layer
    let cors = build_cors(&config.cors_origin);

    // Public routes (no auth required)
    let public_routes = Router::new()
        .route("/api/health", get(health_handler))
        .route("/api/system/health", get(system_health_handler))
        .route("/api/auth/token", post(auth_token_handler))
        .route("/api/auth/refresh", post(auth_refresh_handler))
        .with_state(gateway_state.clone());

    // Protected routes (require Bearer JWT)
    let protected_routes = Router::new()
        .route("/api/invoke", post(invoke_handler))
        .route("/api/config/runtime", get(config_runtime_handler))
        .route("/api/agents/status", get(agents_status_handler))
        .with_state(gateway_state)
        .layer(middleware::from_fn_with_state(auth_state.clone(), require_auth));

    // WebSocket route (auth via query param)
    let ws_routes = Router::new()
        .route("/api/stream", get(ws_stream_handler))
        .with_state(ws_state);

    // Static frontend (lowest priority — catch-all)
    let static_routes = static_router(&config.dist_remote_path);

    // Security headers — applied to every response
    let csp_headers = get_csp_headers();
    let mut security_layers = Vec::new();
    for (name, value) in &csp_headers {
        if let (Ok(hn), Ok(hv)) = (
            HeaderName::from_bytes(name.as_bytes()),
            HeaderValue::from_str(value),
        ) {
            security_layers.push((hn, hv));
        }
    }

    let mut router = Router::new()
        .merge(public_routes)
        .merge(protected_routes)
        .merge(ws_routes)
        .fallback_service(static_routes)
        .layer(cors);

    // Stack security headers (override — replace any existing value)
    for (hn, hv) in security_layers {
        router = router.layer(SetResponseHeaderLayer::overriding(hn, hv));
    }

    router
}

fn build_cors(origin: &str) -> CorsLayer {
    if origin == "*" {
        CorsLayer::new()
            .allow_origin(AllowOrigin::any())
            .allow_methods(AllowMethods::any())
            .allow_headers(AllowHeaders::any())
    } else {
        let allowed: axum::http::HeaderValue = origin
            .parse()
            .unwrap_or_else(|_| "*".parse().unwrap());
        CorsLayer::new()
            .allow_origin(AllowOrigin::exact(allowed))
            .allow_methods(AllowMethods::any())
            .allow_headers(AllowHeaders::any())
    }
}

// ── Start Server ──────────────────────────────────────────────

/// Start the remote gateway axum server.
/// Call via: `tauri::async_runtime::spawn(start(config, engine, orchestrator))` from main.rs setup hook.
pub async fn start(config: RemoteGatewayConfig, engine: Arc<ConversationEngineState>, orchestrator: ChatOrchestratorState) {
    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    let router = build_router(&config, engine, orchestrator);

    log::info!(
        "🌐 [RemoteGateway] Starting on http://0.0.0.0:{} (CORS: {})",
        config.port,
        config.cors_origin,
    );

    let listener = match tokio::net::TcpListener::bind(addr).await {
        Ok(l) => l,
        Err(e) => {
            log::error!("❌ [RemoteGateway] Failed to bind port {}: {e}", config.port);
            return;
        }
    };

    if let Err(e) = axum::serve(
        listener,
        router.into_make_service_with_connect_info::<SocketAddr>(),
    ).await {
        log::error!("❌ [RemoteGateway] Server error: {e}");
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_config_from_env_defaults() {
        let dir = tempdir().unwrap();
        let cfg = RemoteGatewayConfig::from_env("pass", "secret", dir.path().to_path_buf());
        assert_eq!(cfg.port, 7420);
        assert_eq!(cfg.cors_origin, "*");
    }

    #[test]
    fn test_build_router_no_panic() {
        let dir = tempdir().unwrap();
        let cfg = RemoteGatewayConfig::from_env("pass", "secret", dir.path().to_path_buf());
        let engine_dir = tempdir().unwrap();
        let ai_router = std::sync::Arc::new(tokio::sync::RwLock::new(
            crate::ai::router::AIRouter::new(None, Some("gemma2:2b".into())),
        ));
        let singularity = std::sync::Arc::new(tokio::sync::RwLock::new(
            crate::singularity::singularity_state::SingularityState::default(),
        ));
        let engine = std::sync::Arc::new(
            crate::conversation_engine::ConversationEngineState::new(
                engine_dir.keep(),
                "test-password".into(),
                ai_router,
                singularity,
            )
            .expect("engine init in test"),
        );
        let orchestrator = crate::overdrive::chat_orchestrator::init();
        let _router = build_router(&cfg, engine, orchestrator);
        // Verifies router construction succeeds
    }

    #[test]
    fn test_extract_bearer_valid() {
        let mut headers = axum::http::HeaderMap::new();
        headers.insert(
            "authorization",
            "Bearer mytoken123".parse().unwrap(),
        );
        assert_eq!(extract_bearer(&headers), Some("mytoken123"));
    }

    #[test]
    fn test_extract_bearer_missing() {
        let headers = axum::http::HeaderMap::new();
        assert!(extract_bearer(&headers).is_none());
    }

    #[test]
    fn test_extract_bearer_wrong_scheme() {
        let mut headers = axum::http::HeaderMap::new();
        headers.insert("authorization", "Basic abc".parse().unwrap());
        assert!(extract_bearer(&headers).is_none());
    }
}
