// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — WEB SEARCH COMMAND
//   One Door: UI → IPC → Rust → SearXNG/search API → return
//   IPC contract: { ok, content, error }
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::time::Duration;

const SEARCH_TIMEOUT_SECS: u64 = 10;
const DEFAULT_MAX_RESULTS: u32 = 10;
const DEFAULT_SEARCH_API: &str = "http://127.0.0.1:8888/search";

// ─────────────────────────────────────────────────────────────────
// Public types (IPC canonical contract)
// ─────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WebSearchResult {
    pub title: String,
    pub url: String,
    pub snippet: String,
}

#[derive(Debug, Serialize)]
pub struct WebSearchResponse {
    pub ok: bool,
    pub content: Option<Vec<WebSearchResult>>,
    pub error: Option<String>,
}

// ─────────────────────────────────────────────────────────────────
// SearXNG JSON response shape
// ─────────────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
struct SearxngResponse {
    results: Vec<SearxngResult>,
}

#[derive(Debug, Deserialize)]
struct SearxngResult {
    title: Option<String>,
    url: Option<String>,
    content: Option<String>,
}

// ─────────────────────────────────────────────────────────────────
// Helper: resolve search API URL
// ─────────────────────────────────────────────────────────────────

fn search_api_url() -> String {
    std::env::var("TITANE_SEARCH_API_URL")
        .or_else(|_| std::env::var("SEARXNG_URL"))
        .unwrap_or_else(|_| DEFAULT_SEARCH_API.to_string())
}

// ─────────────────────────────────────────────────────────────────
// Internal implementation
// ─────────────────────────────────────────────────────────────────

async fn perform_web_search(
    query: &str,
    max_results: u32,
) -> Result<Vec<WebSearchResult>, String> {
    let base_url = search_api_url();
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(SEARCH_TIMEOUT_SECS))
        .build()
        .map_err(|e| format!("Failed to build HTTP client: {e}"))?;

    let url = reqwest::Url::parse_with_params(
        &base_url,
        &[("q", query), ("format", "json")],
    )
    .map_err(|e| format!("Failed to build search URL: {e}"))?;

    let response = client
        .get(url)
        .send()
        .await
        .map_err(|e| format!("Search API request failed: {e}"))?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(format!("Search API HTTP {status}: {body}"));
    }

    let parsed: SearxngResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse search API response: {e}"))?;

    let results: Vec<WebSearchResult> = parsed
        .results
        .into_iter()
        .take(max_results as usize)
        .map(|r| WebSearchResult {
            title: r.title.unwrap_or_default(),
            url: r.url.unwrap_or_default(),
            snippet: r.content.unwrap_or_default(),
        })
        .collect();

    Ok(results)
}

// ─────────────────────────────────────────────────────────────────
// Tauri command
// ─────────────────────────────────────────────────────────────────

/// Perform a web search via the configured search API (default: SearXNG).
///
/// Returns `{ ok: true, content: [{ title, url, snippet }], error: null }` on success.
/// Returns `{ ok: false, content: null, error: "..." }` on failure.
///
/// One Door governance: this is the only entry point for web search.
/// The search API URL is configurable via `TITANE_SEARCH_API_URL` env var
/// or disk runtime config.
#[tauri::command]
pub async fn web_search(
    query: String,
    max_results: Option<u32>,
) -> Result<WebSearchResponse, String> {
    let limit = max_results.unwrap_or(DEFAULT_MAX_RESULTS);

    match perform_web_search(&query, limit).await {
        Ok(results) => Ok(WebSearchResponse {
            ok: true,
            content: Some(results),
            error: None,
        }),
        Err(e) => Ok(WebSearchResponse {
            ok: false,
            content: None,
            error: Some(e),
        }),
    }
}
