// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Remote Gateway (Ring 0 extension)
//   Axum HTTP/WebSocket server — same tokio runtime as Tauri
//   Activated only via TITANE_REMOTE_ENABLED=1 (disabled by default)
//   Architecture: Rule 4 (Tauri-only runtime preserved)
//                 Rule 5 (One Door — axum handlers proxy Ring 2 fns)
//                 Rule 6 (IPC contract { ok, content, error })
// ═══════════════════════════════════════════════════════════════

pub mod anomaly_detector;
pub mod api_key_store;
pub mod auth;
pub mod audit;
pub mod handlers;
pub mod rate_limit;
pub mod server;
pub mod static_serve;
pub mod ws_stream;
