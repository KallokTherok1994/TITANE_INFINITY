// ═══════════════════════════════════════════════════════════════
// TITANE∞ — Conversation OS v1 — SearchGatewayService (Ring 3)
// Governed search access via NetworkGatewayService.
// ═══════════════════════════════════════════════════════════════

use crate::services::network_gateway::NetworkGatewayService;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub title: String,
    pub url: String,
    pub snippet: String,
    pub source: String,
}

pub struct SearchGatewayService {
    gateway: NetworkGatewayService,
}

impl SearchGatewayService {
    pub fn new(gateway: NetworkGatewayService) -> Self {
        Self { gateway }
    }

    pub fn default_governed() -> Self {
        Self::new(NetworkGatewayService::default_governed())
    }

    /// Perform search with Brave provider only.
    /// If BRAVE_API_KEY is missing, return explicit CREDENTIALS_MISSING error.
    pub async fn search(&self, query: &str, max_results: usize) -> Result<Vec<SearchResult>, String> {
        let brave_api_key = std::env::var("BRAVE_API_KEY")
            .ok()
            .map(|value| value.trim().to_string())
            .filter(|value| !value.is_empty());

        self.search_with_key(query, max_results, brave_api_key.as_deref())
            .await
    }

    async fn search_with_key(
        &self,
        query: &str,
        max_results: usize,
        brave_api_key: Option<&str>,
    ) -> Result<Vec<SearchResult>, String> {
        let simulate_429 = std::env::var("TITANE_SEARCH_SIMULATE_429")
            .map(|value| value == "1" || value.eq_ignore_ascii_case("true"))
            .unwrap_or(false);
        let test_mode = std::env::var("TITANE_TEST_MODE")
            .map(|value| value == "1" || value.eq_ignore_ascii_case("true"))
            .unwrap_or(false);

        if simulate_429 && test_mode {
            return Err("RATE_LIMIT: simulated_429_test_only".to_string());
        }

        match brave_api_key {
            Some(key) => self.search_brave(query, max_results, key).await,
            None => Err("CREDENTIALS_MISSING: BRAVE_API_KEY not configured".to_string()),
        }
    }

    async fn search_brave(
        &self,
        query: &str,
        max_results: usize,
        api_key: &str,
    ) -> Result<Vec<SearchResult>, String> {
        let encoded_query = urlencoding::encode(query);
        let url = format!(
            "https://api.search.brave.com/res/v1/web/search?q={}&count={}",
            encoded_query,
            max_results.clamp(1, 20)
        );

        let json = self
            .gateway
            .get_json_with_headers(
                &url,
                vec![("X-Subscription-Token".to_string(), api_key.to_string())],
            )
            .await
            .map_err(|err| err.to_string())?;

        Ok(parse_brave_results(&json))
    }

    async fn search_duckduckgo(
        &self,
        query: &str,
        max_results: usize,
    ) -> Result<Vec<SearchResult>, String> {
        let encoded_query = urlencoding::encode(query);
        let url = format!("https://duckduckgo.com/?q={}&format=json", encoded_query);

        let json = self
            .gateway
            .get_json(&url)
            .await
            .map_err(|err| err.to_string())?;

        let mut results = parse_duckduckgo_results(&json);
        if results.is_empty() {
            results.push(SearchResult {
                title: format!("Recherche Web: {}", query),
                url: format!("https://duckduckgo.com/?q={}", encoded_query),
                snippet: "Résultat synthétique (fallback gouverné).".to_string(),
                source: "duckduckgo_fallback".to_string(),
            });
        }

        Ok(results.into_iter().take(max_results).collect())
    }
}

fn parse_brave_results(json: &Value) -> Vec<SearchResult> {
    let mut results = Vec::new();

    if let Some(items) = json
        .get("web")
        .and_then(|web| web.get("results"))
        .and_then(|value| value.as_array())
    {
        for item in items {
            let title = item
                .get("title")
                .and_then(|value| value.as_str())
                .unwrap_or("Sans titre")
                .to_string();
            let url = item
                .get("url")
                .and_then(|value| value.as_str())
                .unwrap_or_default()
                .to_string();
            let snippet = item
                .get("description")
                .and_then(|value| value.as_str())
                .unwrap_or("Description indisponible")
                .to_string();

            if !url.is_empty() {
                results.push(SearchResult {
                    title,
                    url,
                    snippet,
                    source: "brave_search".to_string(),
                });
            }
        }
    }

    results
}

fn parse_duckduckgo_results(json: &Value) -> Vec<SearchResult> {
    let mut results = Vec::new();

    if let Some(related_topics) = json.get("RelatedTopics").and_then(|v| v.as_array()) {
        for topic in related_topics {
            let text = topic
                .get("Text")
                .and_then(|v| v.as_str())
                .unwrap_or_default()
                .to_string();
            let first_url = topic
                .get("FirstURL")
                .and_then(|v| v.as_str())
                .unwrap_or_default()
                .to_string();

            if !first_url.is_empty() {
                results.push(SearchResult {
                    title: text.clone(),
                    url: first_url,
                    snippet: text,
                    source: "duckduckgo".to_string(),
                });
            }
        }
    }

    results
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_search_requires_brave_api_key() {
        let service = SearchGatewayService::default_governed();
        let result = service.search_with_key("rust", 5, None).await;

        assert!(result.is_err());
        assert!(result
            .expect_err("missing key should fail")
            .contains("CREDENTIALS_MISSING"));
    }

    #[tokio::test]
    async fn test_search_simulate_429_test_only() {
        let service = SearchGatewayService::default_governed();
        std::env::set_var("TITANE_TEST_MODE", "1");
        std::env::set_var("TITANE_SEARCH_SIMULATE_429", "1");

        let result = service.search_with_key("rust", 5, Some("fake-key")).await;

        assert!(result.is_err());
        assert!(result
            .expect_err("simulated 429 should fail")
            .contains("RATE_LIMIT"));

        std::env::remove_var("TITANE_SEARCH_SIMULATE_429");
        std::env::remove_var("TITANE_TEST_MODE");
    }

    #[test]
    fn test_parse_brave_results() {
        let json = serde_json::json!({
            "web": {
                "results": [
                    {
                        "title": "Rust",
                        "url": "https://www.rust-lang.org",
                        "description": "Rust language"
                    }
                ]
            }
        });

        let results = parse_brave_results(&json);
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].source, "brave_search");
    }

    #[test]
    fn test_parse_duckduckgo_results() {
        let json = serde_json::json!({
            "RelatedTopics": [
                {
                    "Text": "Rust programming language",
                    "FirstURL": "https://duckduckgo.com/Rust"
                }
            ]
        });

        let results = parse_duckduckgo_results(&json);
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].source, "duckduckgo");
    }
}
