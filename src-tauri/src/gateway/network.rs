// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — NETWORK GATEWAY (One Door enforcement)
//   Rule 5: All Rust HTTP calls must go through this single factory.
//   Path: UI → IPC → Tauri command → build_http_client*() → External
// ═══════════════════════════════════════════════════════════════

use std::time::Duration;

/// Build a governed reqwest HTTP client with the supplied timeout.
///
/// This is the **single authorised entry point** for all outbound HTTP
/// inside the Tauri backend.  Every Tauri command that needs to make a
/// network request must call this function instead of constructing
/// `reqwest::Client::builder()` directly.
pub fn build_http_client(timeout: Duration) -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .timeout(timeout)
        .build()
        .map_err(|e| format!("NetworkGateway: failed to build HTTP client: {e}"))
}

/// Like [`build_http_client`] but also sets a custom `User-Agent` header.
/// Use this variant only when the remote endpoint explicitly requires a UA string.
pub fn build_http_client_with_user_agent(
    timeout: Duration,
    user_agent: &str,
) -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .timeout(timeout)
        .user_agent(user_agent)
        .build()
        .map_err(|e| format!("NetworkGateway: failed to build HTTP client: {e}"))
}
