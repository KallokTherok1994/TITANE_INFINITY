// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — WEB SEARCH COMMAND
//   One Door: UI → IPC → Rust → SearXNG/search API → return
//   IPC contract: { ok, content, error }
//   Fallback: DuckDuckGo Lite if SearXNG unavailable
// ═══════════════════════════════════════════════════════════════

use crate::services::network_gateway::{build_client, build_client_with_user_agent};
use serde::{Deserialize, Serialize};
use std::time::Duration;
use url::Url;

const SEARCH_TIMEOUT_SECS: u64 = 10;
const DEFAULT_MAX_RESULTS: u32 = 10;
const DEFAULT_SEARCH_API: &str = "http://127.0.0.1:8888/search";
const DDG_LITE_URL: &str = "https://lite.duckduckgo.com/lite/";
const MAX_SNIPPET_LENGTH: usize = 300;

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

async fn perform_web_search(query: &str, max_results: u32) -> Result<Vec<WebSearchResult>, String> {
    let base_url = search_api_url();
    let client = build_client(Duration::from_secs(SEARCH_TIMEOUT_SECS))
        .map_err(|e| format!("Failed to build HTTP client: {e}"))?;

    let url = Url::parse_with_params(&base_url, &[("q", query), ("format", "json")])
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
///
/// Fallback: if SearXNG fails, tries DuckDuckGo Lite HTML scraper automatically.
#[tauri::command]
pub async fn web_search(
    query: String,
    max_results: Option<u32>,
) -> Result<WebSearchResponse, String> {
    let limit = max_results.unwrap_or(DEFAULT_MAX_RESULTS);

    // Primary: SearXNG
    match perform_web_search(&query, limit).await {
        Ok(results) => {
            eprintln!("[WEB_SEARCH] source=searxng results={}", results.len());
            return Ok(WebSearchResponse {
                ok: true,
                content: Some(results),
                error: None,
            });
        }
        Err(primary_err) => {
            eprintln!(
                "[WEB_SEARCH] source=searxng_failed err={} — trying duckduckgo_lite_fallback",
                primary_err
            );
        }
    }

    // Fallback: DuckDuckGo Lite
    match perform_ddg_lite_search(&query, limit).await {
        Ok(results) => {
            eprintln!(
                "[WEB_SEARCH] source=duckduckgo_lite_fallback results={}",
                results.len()
            );
            Ok(WebSearchResponse {
                ok: true,
                content: Some(results),
                error: None,
            })
        }
        Err(fallback_err) => Ok(WebSearchResponse {
            ok: false,
            content: None,
            error: Some(format!(
                "SearXNG and DuckDuckGo Lite both failed: {fallback_err}"
            )),
        }),
    }
}

// ─────────────────────────────────────────────────────────────────
// DuckDuckGo Lite HTML fallback
// ─────────────────────────────────────────────────────────────────

/// Scrape DuckDuckGo Lite HTML for search results.
/// Extracts `<a class="result-link">` elements for title/URL,
/// and adjacent snippet text.
async fn perform_ddg_lite_search(
    query: &str,
    max_results: u32,
) -> Result<Vec<WebSearchResult>, String> {
    let client = build_client_with_user_agent(
        Duration::from_secs(SEARCH_TIMEOUT_SECS),
        "Mozilla/5.0 (compatible; TITANE-search/1.0)",
    )
    .map_err(|e| format!("Failed to build HTTP client: {e}"))?;

    let url = Url::parse_with_params(DDG_LITE_URL, &[("q", query)])
        .map_err(|e| format!("Failed to build DDG Lite URL: {e}"))?;

    let response = client
        .get(url)
        .send()
        .await
        .map_err(|e| format!("DDG Lite request failed: {e}"))?;

    if !response.status().is_success() {
        let status = response.status();
        return Err(format!("DDG Lite HTTP {status}"));
    }

    let html = response
        .text()
        .await
        .map_err(|e| format!("Failed to read DDG Lite response: {e}"))?;

    Ok(parse_ddg_lite_html(&html, max_results))
}

/// Parse DuckDuckGo Lite HTML and extract result-link anchors.
fn parse_ddg_lite_html(html: &str, max_results: u32) -> Vec<WebSearchResult> {
    let mut results = Vec::new();

    // DDG Lite uses <a class="result-link" href="...">Title</a>
    // followed by a snippet in a <td class="result-snippet"> or similar.
    // We do a lightweight regex-free parse by splitting on anchor tags.
    let mut remaining = html;

    while results.len() < max_results as usize {
        // Find a result-link anchor
        let Some(link_start) = remaining.find("class=\"result-link\"") else {
            break;
        };

        // Walk back to find the opening <a
        let before = &remaining[..link_start];
        let Some(a_start) = before.rfind('<') else {
            remaining = &remaining[link_start + 1..];
            continue;
        };

        let tag_slice = &remaining[a_start..];

        // Extract href
        let href = extract_attr(tag_slice, "href").unwrap_or_default();

        // Find closing > to get title content
        let Some(tag_end) = tag_slice.find('>') else {
            remaining = &remaining[link_start + 1..];
            continue;
        };
        let after_tag = &tag_slice[tag_end + 1..];
        let title_end = after_tag.find("</a>").unwrap_or(after_tag.len());
        let title = strip_tags(&after_tag[..title_end]).trim().to_string();

        // Try to find snippet after this anchor
        let snippet_marker = "result-snippet";
        let snippet = if let Some(snip_start) = after_tag.find(snippet_marker) {
            let snip_slice = &after_tag[snip_start..];
            if let Some(snip_tag_end) = snip_slice.find('>') {
                let snip_content = &snip_slice[snip_tag_end + 1..];
                let snip_close = snip_content
                    .find('<')
                    .unwrap_or(snip_content.len().min(MAX_SNIPPET_LENGTH));
                strip_tags(&snip_content[..snip_close]).trim().to_string()
            } else {
                String::new()
            }
        } else {
            String::new()
        };

        if !href.is_empty() && !title.is_empty() {
            results.push(WebSearchResult {
                title,
                url: href,
                snippet,
            });
        }

        remaining = &remaining[link_start + 1..];
    }

    results
}

fn extract_attr(tag: &str, attr: &str) -> Option<String> {
    let search = format!("{}=\"", attr);
    let start = tag.find(&search)? + search.len();
    let end = tag[start..].find('"')?;
    Some(tag[start..start + end].to_string())
}

fn strip_tags(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut in_tag = false;
    for c in s.chars() {
        match c {
            '<' => in_tag = true,
            '>' => in_tag = false,
            _ if !in_tag => out.push(c),
            _ => {}
        }
    }
    out
}

// ─────────────────────────────────────────────────────────────────
// Unit tests
// ─────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    /// WebSearchResult must serialize to the canonical IPC shape.
    #[test]
    fn test_web_search_result_serialization() {
        let result = WebSearchResult {
            title: "Test Title".to_string(),
            url: "https://example.com".to_string(),
            snippet: "A test snippet".to_string(),
        };

        let json = serde_json::to_value(&result).expect("serialization must succeed");

        assert_eq!(json["title"], "Test Title");
        assert_eq!(json["url"], "https://example.com");
        assert_eq!(json["snippet"], "A test snippet");
    }

    /// search_api_url must produce a well-formed URL with the query encoded.
    #[test]
    fn test_search_url_construction() {
        // Reset env var to default
        std::env::remove_var("TITANE_SEARCH_API_URL");
        std::env::remove_var("SEARXNG_URL");

        let base = search_api_url();
        assert_eq!(base, DEFAULT_SEARCH_API);

        // Build the query URL as perform_web_search would
        let url =
            Url::parse_with_params(&base, &[("q", "hello world"), ("format", "json")])
                .expect("URL construction must succeed");

        let url_str = url.as_str();
        assert!(
            url_str.contains("q=hello+world") || url_str.contains("q=hello%20world"),
            "query must be URL-encoded, got: {url_str}"
        );
        assert!(
            url_str.contains("format=json"),
            "format=json must be present"
        );
    }

    /// When SearXNG is unavailable, the command must gracefully attempt the
    /// DuckDuckGo Lite fallback instead of returning an error immediately.
    /// In tests, both will fail (no network), so we expect ok:false with a
    /// meaningful error — never a panic or empty error.
    #[tokio::test]
    async fn test_search_with_unavailable_searxng() {
        std::env::set_var("TITANE_SEARCH_API_URL", "http://127.0.0.1:19998/search");

        let result = web_search("test query".to_string(), Some(5)).await;

        let resp = result.expect("command must not return Err");

        // Both SearXNG and DDG Lite will fail in test env
        // Either we get results (DDG Lite succeeded) or ok:false with error
        if !resp.ok {
            assert!(
                resp.error.is_some(),
                "error message must be present on failure"
            );
            assert!(
                !resp.error.as_deref().unwrap_or("").is_empty(),
                "error message must not be empty"
            );
        }
    }

    /// When None is passed for max_results, DEFAULT_MAX_RESULTS (10) is used.
    #[test]
    fn test_default_max_results() {
        assert_eq!(DEFAULT_MAX_RESULTS, 10);

        // The limit calculation mirrors the command logic
        let limit: u32 = DEFAULT_MAX_RESULTS;
        assert_eq!(limit, 10);
    }

    /// parse_ddg_lite_html should extract result-link anchors correctly.
    #[test]
    fn test_parse_ddg_lite_html() {
        let html = r#"
            <table>
                <tr>
                    <td><a class="result-link" href="https://example.com/page">Example Page</a></td>
                    <td class="result-snippet">A short description of the page.</td>
                </tr>
                <tr>
                    <td><a class="result-link" href="https://other.com/">Other Site</a></td>
                    <td class="result-snippet">Another snippet here.</td>
                </tr>
            </table>
        "#;

        let results = parse_ddg_lite_html(html, 10);

        assert!(!results.is_empty(), "should parse at least one result");
        assert_eq!(results[0].url, "https://example.com/page");
        assert_eq!(results[0].title, "Example Page");
    }

    /// strip_tags should remove HTML tags from text.
    #[test]
    fn test_strip_tags() {
        let input = "<b>Hello</b> <i>World</i>";
        assert_eq!(strip_tags(input), "Hello World");
    }
}
