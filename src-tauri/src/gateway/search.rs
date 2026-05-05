// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — GATEWAY SEARCH (One Door governed)
//   Always-available fallback search: SearXNG → DuckDuckGo Lite
//   No API key required. Used by conversation_engine in all build modes.
// ═══════════════════════════════════════════════════════════════

use serde::Deserialize;
use std::time::Duration;

use super::network;

const SEARCH_TIMEOUT_SECS: u64 = 10;
const DEFAULT_SEARCH_API: &str = "http://127.0.0.1:8888/search";

/// Minimal search result returned by the gateway search fallback.
#[derive(Debug, Clone)]
pub struct GatewaySearchResult {
    pub title: String,
    pub url: String,
    pub snippet: String,
}

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

/// Perform a governed web search via SearXNG (always available, no API key needed).
/// Falls back gracefully if the local SearXNG instance is unavailable.
pub async fn perform_search(
    query: &str,
    max_results: usize,
) -> Result<Vec<GatewaySearchResult>, String> {
    let base_url = std::env::var("TITANE_SEARCH_API_URL")
        .unwrap_or_else(|_| DEFAULT_SEARCH_API.to_string());

    let client =
        network::build_http_client(Duration::from_secs(SEARCH_TIMEOUT_SECS))?;

    let url = reqwest::Url::parse_with_params(&base_url, &[("q", query), ("format", "json")])
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

    Ok(parsed
        .results
        .into_iter()
        .take(max_results)
        .map(|r| GatewaySearchResult {
            title: r.title.unwrap_or_default(),
            url: r.url.unwrap_or_default(),
            snippet: r.content.unwrap_or_default(),
        })
        .collect())
}
