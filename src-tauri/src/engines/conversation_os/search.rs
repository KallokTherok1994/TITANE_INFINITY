// Ring 2: SearchEngine — Search Result Normalization
// Pure logic, no I/O, transforms raw search results to Citation[]

use serde::{Deserialize, Serialize};
use std::collections::HashSet;

/// Citation structure (normalized search result)
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Citation {
    pub title: String,
    pub url: String,
    pub snippet: String,
    pub source: String,      // "brave_search", "perplexity", etc.
    pub timestamp: String,   // ISO8601
    pub relevance: f32,      // 0.0..1.0
}

/// Raw search result (from external API)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RawSearchResult {
    pub title: Option<String>,
    pub url: Option<String>,
    pub description: Option<String>,
    pub snippet: Option<String>,
    pub source: String,
}

/// Search normalization options
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NormalizationOptions {
    pub max_results: usize,
    pub min_snippet_length: usize,
    pub deduplicate: bool,
    pub require_url: bool,
}

impl Default for NormalizationOptions {
    fn default() -> Self {
        NormalizationOptions {
            max_results: 10,
            min_snippet_length: 50,
            deduplicate: true,
            require_url: true,
        }
    }
}

/// SearchEngine: Normalizes raw search results to Citations
/// 
/// **Ring:** 2 (Engines)  
/// **Status:** EXPERIMENTAL  
/// **Purity:** ✅ No I/O, no state, pure transformation  
/// 
/// Responsibilities:
/// - Transform raw API results to Citation format
/// - Deduplicate by URL
/// - Filter low-quality results
/// - Score/rank results
pub struct SearchEngine;

impl SearchEngine {
    /// Create new SearchEngine (stateless)
    pub fn new() -> Self {
        SearchEngine
    }

    /// Normalize raw search results to Citations
    /// 
    /// # Arguments
    /// * `raw_results` - Raw results from search API
    /// * `options` - Normalization options
    /// 
    /// # Returns
    /// Vec<Citation> with normalized, deduplicated results
    /// 
    /// # Examples
    /// ```
    /// use titane_infinity::engines::conversation_os::search::{NormalizationOptions, RawSearchResult, SearchEngine};
    ///
    /// let engine = SearchEngine::new();
    /// let mut options = NormalizationOptions::default();
    /// options.min_snippet_length = 1;
    /// let raw = vec![RawSearchResult {
    ///     title: Some("Rust Lang".to_string()),
    ///     url: Some("https://rust-lang.org".to_string()),
    ///     description: Some("The Rust programming language".to_string()),
    ///     snippet: None,
    ///     source: "brave_search".to_string(),
    /// }];
    /// let citations = engine.normalize(raw, options);
    /// assert_eq!(citations.len(), 1);
    /// ```
    pub fn normalize(
        &self,
        raw_results: Vec<RawSearchResult>,
        options: NormalizationOptions,
    ) -> Vec<Citation> {
        let mut citations = Vec::new();
        let mut seen_urls = HashSet::new();

        for result in raw_results {
            // Skip if missing required fields
            if options.require_url && result.url.is_none() {
                continue;
            }

            let url = result.url.unwrap_or_default();
            if url.is_empty() {
                continue;
            }

            // Deduplicate by URL
            if options.deduplicate && seen_urls.contains(&url) {
                continue;
            }
            seen_urls.insert(url.clone());

            // Extract snippet (prefer snippet over description)
            let snippet = result
                .snippet
                .or(result.description)
                .unwrap_or_else(|| "No description available".to_string());

            // Filter short snippets
            if snippet.len() < options.min_snippet_length {
                continue;
            }

            // Calculate relevance (placeholder: based on snippet length)
            let relevance = self.calculate_relevance(&snippet, result.title.as_deref());

            let citation = Citation {
                title: result.title.unwrap_or_else(|| "Untitled".to_string()),
                url,
                snippet: self.truncate_snippet(&snippet, 300),
                source: result.source.clone(),
                timestamp: Self::current_timestamp(),
                relevance,
            };

            citations.push(citation);

            if citations.len() >= options.max_results {
                break;
            }
        }

        // Sort by relevance (descending)
        citations.sort_by(|a, b| b.relevance.partial_cmp(&a.relevance).unwrap_or(std::cmp::Ordering::Equal));

        citations
    }

    /// Calculate relevance score for a result
    /// 
    /// Heuristics:
    /// - Snippet length (longer = more relevant, up to a point)
    /// - Title presence (has title = +0.1)
    /// - TODO: Query term matching, domain authority, etc.
    fn calculate_relevance(&self, snippet: &str, title: Option<&str>) -> f32 {
        let mut score = 0.5; // Base score

        // Snippet length contribution (0.0..0.4)
        let snippet_len = snippet.len() as f32;
        let len_score = (snippet_len / 500.0).min(0.4);
        score += len_score;

        // Title presence (+0.1)
        if title.is_some() && !title.unwrap().is_empty() {
            score += 0.1;
        }

        score.min(1.0)
    }

    /// Truncate snippet to max length
    fn truncate_snippet(&self, snippet: &str, max_len: usize) -> String {
        if snippet.len() <= max_len {
            snippet.to_string()
        } else {
            let truncated = &snippet[..max_len];
            format!("{}...", truncated)
        }
    }

    /// Get current timestamp (ISO8601)
    fn current_timestamp() -> String {
        // Placeholder: would use chrono in production
        "2026-02-25T23:00:00Z".to_string()
    }

    /// Merge multiple search sources
    /// 
    /// Combines results from multiple APIs, deduplicates, ranks
    pub fn merge_sources(
        &self,
        sources: Vec<Vec<RawSearchResult>>,
        options: NormalizationOptions,
    ) -> Vec<Citation> {
        let mut all_results = Vec::new();
        for source_results in sources {
            all_results.extend(source_results);
        }
        self.normalize(all_results, options)
    }

    /// Filter citations by quality threshold
    pub fn filter_by_quality(&self, citations: Vec<Citation>, min_relevance: f32) -> Vec<Citation> {
        citations
            .into_iter()
            .filter(|c| c.relevance >= min_relevance)
            .collect()
    }
}

impl Default for SearchEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_raw_result(title: &str, url: &str, description: &str) -> RawSearchResult {
        RawSearchResult {
            title: Some(title.to_string()),
            url: Some(url.to_string()),
            description: Some(description.to_string()),
            snippet: None,
            source: "brave_search".to_string(),
        }
    }

    #[test]
    fn test_normalize_basic() {
        let engine = SearchEngine::new();
        let raw = vec![create_raw_result(
            "Rust Programming",
            "https://rust-lang.org",
            "The Rust Programming Language is a systems programming language that runs blazingly fast",
        )];
        let citations = engine.normalize(raw, NormalizationOptions::default());
        assert_eq!(citations.len(), 1);
        assert_eq!(citations[0].title, "Rust Programming");
        assert_eq!(citations[0].url, "https://rust-lang.org");
        assert!(citations[0].relevance > 0.0);
    }

    #[test]
    fn test_deduplicate_urls() {
        let engine = SearchEngine::new();
        let raw = vec![
            create_raw_result(
                "Rust",
                "https://rust-lang.org",
                "A systems programming language that runs blazingly fast, prevents segfaults",
            ),
            create_raw_result(
                "Rust Again",
                "https://rust-lang.org",
                "Another description of Rust programming language with different text here",
            ),
        ];
        let citations = engine.normalize(raw, NormalizationOptions::default());
        assert_eq!(citations.len(), 1); // Deduplicated
    }

    #[test]
    fn test_filter_short_snippets() {
        let engine = SearchEngine::new();
        let raw = vec![
            create_raw_result("Good Result", "https://example.com", "This is a sufficiently long description that meets the minimum snippet length requirement"),
            create_raw_result("Bad Result", "https://bad.com", "Short"),
        ];
        let options = NormalizationOptions {
            min_snippet_length: 50,
            ..Default::default()
        };
        let citations = engine.normalize(raw, options);
        assert_eq!(citations.len(), 1);
        assert_eq!(citations[0].title, "Good Result");
    }

    #[test]
    fn test_max_results_limit() {
        let engine = SearchEngine::new();
        let raw: Vec<RawSearchResult> = (0..20)
            .map(|i| {
                create_raw_result(
                    &format!("Result {}", i),
                    &format!("https://example.com/{}", i),
                    "This is a good description that is long enough to pass the minimum snippet length filter",
                )
            })
            .collect();
        let options = NormalizationOptions {
            max_results: 5,
            ..Default::default()
        };
        let citations = engine.normalize(raw, options);
        assert_eq!(citations.len(), 5);
    }

    #[test]
    fn test_skip_missing_url() {
        let engine = SearchEngine::new();
        let raw = vec![RawSearchResult {
            title: Some("No URL Result".to_string()),
            url: None,
            description: Some("This result has no URL and should be skipped by the normalization process".to_string()),
            snippet: None,
            source: "brave_search".to_string(),
        }];
        let citations = engine.normalize(raw, NormalizationOptions::default());
        assert_eq!(citations.len(), 0);
    }

    #[test]
    fn test_relevance_calculation() {
        let engine = SearchEngine::new();
        let short_snippet = "Short text here";
        let long_snippet = "This is a much longer snippet with significantly more content that should score higher in the relevance calculation algorithm";
        
        let score_short = engine.calculate_relevance(short_snippet, None);
        let score_long = engine.calculate_relevance(long_snippet, Some("Title"));
        
        assert!(score_long > score_short);
    }

    #[test]
    fn test_snippet_truncation() {
        let engine = SearchEngine::new();
        let long_text = "a".repeat(500);
        let truncated = engine.truncate_snippet(&long_text, 100);
        assert_eq!(truncated.len(), 103); // 100 + "..."
        assert!(truncated.ends_with("..."));
    }

    #[test]
    fn test_merge_sources() {
        let engine = SearchEngine::new();
        let source1 = vec![create_raw_result(
            "Result 1",
            "https://one.com",
            "This is a result from the first search source with a good description",
        )];
        let source2 = vec![create_raw_result(
            "Result 2",
            "https://two.com",
            "This is a result from the second search source with a good description",
        )];
        let citations = engine.merge_sources(vec![source1, source2], NormalizationOptions::default());
        assert_eq!(citations.len(), 2);
    }

    #[test]
    fn test_filter_by_quality() {
        let engine = SearchEngine::new();
        let citations = vec![
            Citation {
                title: "High Quality".to_string(),
                url: "https://high.com".to_string(),
                snippet: "Good snippet".to_string(),
                source: "test".to_string(),
                timestamp: "2026-02-25T00:00:00Z".to_string(),
                relevance: 0.9,
            },
            Citation {
                title: "Low Quality".to_string(),
                url: "https://low.com".to_string(),
                snippet: "Bad snippet".to_string(),
                source: "test".to_string(),
                timestamp: "2026-02-25T00:00:00Z".to_string(),
                relevance: 0.3,
            },
        ];
        let filtered = engine.filter_by_quality(citations, 0.5);
        assert_eq!(filtered.len(), 1);
        assert_eq!(filtered[0].title, "High Quality");
    }
}
