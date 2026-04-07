// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — DISCOVERY SERVICE (Ring 3)
//   P7.0 — Governed multi-URL discovery (seeded + breadth-limited)
//   Invariants: domain-locked, budget-capped, robots deferred to pipeline
//   Security: no network here — returns URLs only; fetch is caller's job
// ═══════════════════════════════════════════════════════════════

use std::collections::HashSet;

// ─────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────

/// Maximum pages discoverable in a single session (hard cap)
pub const DISCOVERY_MAX_PAGES_HARD_CAP: usize = 20;
/// Default max depth supported (P7 = 1)
pub const DISCOVERY_DEFAULT_MAX_DEPTH: u32 = 1;

// ─────────────────────────────────────────────────────────────────
// RESULT TYPE
// ─────────────────────────────────────────────────────────────────

/// A URL discovered from the seed page, validated and budgeted.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DiscoveredUrl {
    pub url: String,
    pub depth: u32,
}

/// Result of a discovery pass.
#[derive(Debug, Clone)]
pub struct DiscoveryResult {
    pub urls: Vec<DiscoveredUrl>,
    /// Seed URL used as starting point
    pub seed_domain: String,
    /// Were any URLs dropped due to budget?
    pub budget_enforced: bool,
    /// How many candidates were found before budget trim
    pub candidates_found: usize,
}

// ─────────────────────────────────────────────────────────────────
// DISCOVERY SERVICE
// ─────────────────────────────────────────────────────────────────

/// Governed multi-URL discovery from seed HTML.
///
/// Rules (P7):
/// - Only follow links within the same domain as the seed URL (domain-lock)
/// - max_depth = 1 (P7 only extracts direct links from seed)
/// - max_pages budget enforced (capped at DISCOVERY_MAX_PAGES_HARD_CAP)
/// - Extensions filtered: skip non-HTML (pdf, zip, jpg, etc.)
/// - Dedup by URL string
/// - No network calls here — caller does the fetching
pub struct DiscoveryService;

impl DiscoveryService {
    /// Extract and budget governed links from `html_body`.
    ///
    /// # Arguments
    /// - `seed_url`: The origin URL (used for domain-locking)
    /// - `html_body`: The HTML of the seed page (already fetched by caller)
    /// - `max_pages`: Maximum URLs to return (budget gate)
    ///
    /// Returns a `DiscoveryResult` with normalized, deduped, domain-locked URLs.
    pub fn discover(seed_url: &str, html_body: &str, max_pages: usize) -> DiscoveryResult {
        let seed_domain = extract_domain(seed_url).unwrap_or_else(|| seed_url.to_string());
        let cap = max_pages.clamp(1, DISCOVERY_MAX_PAGES_HARD_CAP);

        let raw_links = extract_links(html_body);
        let mut seen: HashSet<String> = HashSet::new();
        // Always dedup seed itself
        seen.insert(normalize_url(seed_url));

        let mut candidates: Vec<DiscoveredUrl> = Vec::new();
        for href in raw_links {
            let abs = resolve_url(seed_url, &href);
            let normalized = normalize_url(&abs);

            // Domain-lock: only same domain
            let link_domain = extract_domain(&normalized).unwrap_or_default();
            if link_domain != seed_domain {
                continue;
            }
            // Skip non-HTML extensions
            if is_non_html_extension(&normalized) {
                continue;
            }
            // Dedup
            if seen.contains(&normalized) {
                continue;
            }
            seen.insert(normalized.clone());
            candidates.push(DiscoveredUrl {
                url: normalized,
                depth: 1,
            });
        }

        let candidates_found = candidates.len();
        let budget_enforced = candidates_found > cap;
        candidates.truncate(cap);

        DiscoveryResult {
            urls: candidates,
            seed_domain,
            budget_enforced,
            candidates_found,
        }
    }
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

/// Extract raw href values from `<a href="...">` anchors in HTML.
/// Minimal parser — no full HTML parser needed; uses regex-like scanning.
fn extract_links(html: &str) -> Vec<String> {
    let mut links = Vec::new();
    let lower = html.to_lowercase();
    let mut pos = 0;

    while pos < lower.len() {
        // Find next <a
        if let Some(tag_start) = lower[pos..]
            .find("<a ")
            .or_else(|| lower[pos..].find("<a\t"))
        {
            let tag_abs = pos + tag_start;
            // Find href= within the tag
            if let Some(href_pos) = lower[tag_abs..].find("href=") {
                let href_abs = tag_abs + href_pos + 5; // skip "href="
                if href_abs < html.len() {
                    let rest = &html[href_abs..];
                    let value = extract_attr_value(rest);
                    if !value.is_empty()
                        && !value.starts_with('#')
                        && !value.starts_with("javascript:")
                        && !value.starts_with("mailto:")
                        && !value.starts_with("tel:")
                    {
                        links.push(value);
                    }
                }
                pos = tag_abs + href_pos + 5;
            } else {
                pos = tag_abs + 3;
            }
        } else {
            break;
        }
    }
    links
}

/// Extract attribute value after `href=` — handles both quoted and unquoted.
fn extract_attr_value(rest: &str) -> String {
    let chars: Vec<char> = rest.chars().collect();
    if chars.is_empty() {
        return String::new();
    }
    let quote = chars[0];
    if quote == '"' || quote == '\'' {
        // Quoted value
        let end = rest[1..].find(quote).unwrap_or(rest.len() - 1);
        rest[1..1 + end].trim().to_string()
    } else {
        // Unquoted value — ends at space, >, or >
        let end = rest.find([' ', '>', '\t', '\n', '"']).unwrap_or(rest.len());
        rest[..end].trim().to_string()
    }
}

/// Resolve a (possibly relative) href against a base URL.
/// Returns an absolute URL string, or the href as-is if already absolute.
fn resolve_url(base: &str, href: &str) -> String {
    if href.starts_with("http://") || href.starts_with("https://") {
        return href.to_string();
    }
    // Protocol-relative
    if href.starts_with("//") {
        let scheme = if base.starts_with("https://") {
            "https:"
        } else {
            "http:"
        };
        return format!("{}{}", scheme, href);
    }
    // Absolute path
    if href.starts_with('/') {
        // Extract origin (scheme://host) from base
        let origin = extract_origin(base);
        return format!("{}{}", origin, href);
    }
    // Relative path: resolve against base directory
    let base_dir = if let Some(idx) = base.rfind('/') {
        if idx > 8 {
            // past "https://"
            &base[..idx + 1]
        } else {
            base
        }
    } else {
        base
    };
    format!("{}{}", base_dir, href)
}

/// Extract origin (scheme://host) from URL.
fn extract_origin(url: &str) -> &str {
    // Find 3rd slash after scheme://
    if let Some(scheme_end) = url.find("://") {
        let after_scheme = &url[scheme_end + 3..];
        if let Some(path_start) = after_scheme.find('/') {
            &url[..scheme_end + 3 + path_start]
        } else {
            url
        }
    } else {
        url
    }
}

/// Normalize URL: strip fragment (#...), trailing slash normalization.
fn normalize_url(url: &str) -> String {
    let no_frag = if let Some(frag) = url.find('#') {
        &url[..frag]
    } else {
        url
    };
    // Strip trailing slash (except root)
    let trimmed = no_frag.trim_end_matches('/');
    if trimmed.is_empty() {
        no_frag.to_string()
    } else {
        trimmed.to_string()
    }
}

/// Extract domain (host) from URL.
pub fn extract_domain(url: &str) -> Option<String> {
    // scheme://host/... or scheme://host
    if let Some(scheme_end) = url.find("://") {
        let rest = &url[scheme_end + 3..];
        let host_end = rest.find('/').unwrap_or(rest.len());
        let host_port = &rest[..host_end];
        // Strip port
        let host = host_port.split(':').next().unwrap_or(host_port);
        if !host.is_empty() {
            return Some(host.to_lowercase());
        }
    }
    None
}

/// Return true if the URL looks like a non-HTML resource.
fn is_non_html_extension(url: &str) -> bool {
    // Strip query string for extension check
    let path = url.split('?').next().unwrap_or(url);
    let ext = path.rsplit('.').next().unwrap_or("").to_lowercase();
    matches!(
        ext.as_str(),
        "pdf"
            | "zip"
            | "gz"
            | "tar"
            | "jpg"
            | "jpeg"
            | "png"
            | "gif"
            | "webp"
            | "svg"
            | "ico"
            | "mp4"
            | "mp3"
            | "avi"
            | "mkv"
            | "ogg"
            | "webm"
            | "woff"
            | "woff2"
            | "ttf"
            | "eot"
            | "otf"
            | "css"
            | "js"
            | "json"
            | "xml"
            | "csv"
            | "xlsx"
            | "docx"
            | "pptx"
            | "exe"
            | "dmg"
            | "deb"
            | "rpm"
            | "apk"
            | "bin"
    )
}

// ─────────────────────────────────────────────────────────────────
// P12 — SITEMAP / RSS PARSING (pure Rust, no network)
// ─────────────────────────────────────────────────────────────────

/// P12 feature flags (default OFF — activated by env var)
pub const ENABLE_DISCOVERY_SITEMAP: bool = false;
pub const ENABLE_DISCOVERY_RSS: bool = false;
pub const P12_DISCOVERY_VERSION: &str = "P12.0";

/// Result of sitemap/RSS URL extraction
#[derive(Debug, Clone)]
pub struct XmlDiscoveryResult {
    /// Format detected: "sitemap", "rss", "atom", or "unknown"
    pub format: &'static str,
    /// Extracted URLs (filtered + capped)
    pub urls: Vec<String>,
    /// Whether any URLs were dropped by budget
    pub budget_enforced: bool,
}

/// Parse URLs from a sitemap XML string.
///
/// Extracts `<loc>` elements from sitemap format.
/// Rules:
/// - No network, no execution — pure string parsing
/// - Domain-locked to `seed_domain`
/// - Capped at `max_urls`
/// - Non-HTML extensions filtered
/// - Returns empty on parse error (never panics)
pub fn parse_sitemap_urls(xml: &str, seed_domain: &str, max_urls: usize) -> XmlDiscoveryResult {
    let enabled = std::env::var("ENABLE_DISCOVERY_SITEMAP").as_deref() == Ok("true");
    if !enabled {
        return XmlDiscoveryResult {
            format: "sitemap",
            urls: vec![],
            budget_enforced: false,
        };
    }
    extract_xml_urls(xml, "sitemap", seed_domain, max_urls, "<loc>", "</loc>")
}

/// Parse URLs from an RSS/Atom feed XML string.
///
/// Extracts `<link>` (RSS) and `<id>` (Atom) elements.
/// Rules:
/// - No network, no execution — pure string parsing
/// - Domain-locked to `seed_domain`
/// - Capped at `max_urls`
/// - Non-HTML extensions filtered
/// - Returns empty on parse error (never panics)
pub fn parse_rss_urls(xml: &str, seed_domain: &str, max_urls: usize) -> XmlDiscoveryResult {
    let enabled = std::env::var("ENABLE_DISCOVERY_RSS").as_deref() == Ok("true");
    if !enabled {
        return XmlDiscoveryResult {
            format: "rss",
            urls: vec![],
            budget_enforced: false,
        };
    }
    // Try <link> (RSS) first, then <id> (Atom)
    let mut result = extract_xml_urls(xml, "rss", seed_domain, max_urls, "<link>", "</link>");
    if result.urls.is_empty() {
        result = extract_xml_urls(xml, "atom", seed_domain, max_urls, "<id>", "</id>");
    }
    result
}

/// Internal: extract text between open/close tags, filter, and cap.
fn extract_xml_urls(
    xml: &str,
    format: &'static str,
    seed_domain: &str,
    max_urls: usize,
    open_tag: &str,
    close_tag: &str,
) -> XmlDiscoveryResult {
    let cap = max_urls.min(DISCOVERY_MAX_PAGES_HARD_CAP);
    let mut urls: Vec<String> = Vec::new();
    let mut search_from = 0;

    while let Some(start) = xml[search_from..].find(open_tag) {
        let abs_start = search_from + start + open_tag.len();
        if let Some(end_offset) = xml[abs_start..].find(close_tag) {
            let url = xml[abs_start..abs_start + end_offset].trim().to_string();
            search_from = abs_start + end_offset + close_tag.len();

            // Validate and filter
            if url.starts_with("http") && !is_non_html_extension(&url) {
                if let Some(domain) = extract_domain(&url) {
                    if domain == seed_domain {
                        urls.push(url);
                    }
                }
            }
        } else {
            break;
        }
    }

    let budget_enforced = urls.len() > cap;
    urls.truncate(cap);
    // Stable sort for reproducibility
    urls.sort();
    urls.dedup();

    XmlDiscoveryResult {
        format,
        urls,
        budget_enforced,
    }
}

// ─────────────────────────────────────────────────────────────────
// UNIT TESTS
// ─────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn make_html(links: &[&str]) -> String {
        let anchors: Vec<String> = links
            .iter()
            .map(|href| format!(r#"<a href="{}">link</a>"#, href))
            .collect();
        format!("<html><body>{}</body></html>", anchors.join("\n"))
    }

    // ── G_DISCOVERY_BUDGET_ENFORCED ───────────────────────────────

    #[test]
    fn g_discovery_budget_enforced_max_2() {
        let html = make_html(&[
            "https://example.com/a",
            "https://example.com/b",
            "https://example.com/c",
            "https://example.com/d",
            "https://example.com/e",
        ]);
        let result = DiscoveryService::discover("https://example.com", &html, 2);
        assert!(
            result.urls.len() <= 2,
            "Budget not enforced: got {} urls, expected <= 2",
            result.urls.len()
        );
        assert!(
            result.budget_enforced,
            "budget_enforced must be true when candidates > max_pages"
        );
    }

    // ── G_DISCOVERY_DOMAIN_LOCK ───────────────────────────────────

    #[test]
    fn g_discovery_domain_lock() {
        let html = make_html(&[
            "https://example.com/internal",
            "https://other.com/external",
            "https://evil.org/attack",
            "/relative-link",
        ]);
        let result = DiscoveryService::discover("https://example.com", &html, 10);
        for url in &result.urls {
            let domain = extract_domain(&url.url).unwrap_or_default();
            assert_eq!(
                domain, "example.com",
                "Domain-lock violated: got URL from domain '{}': {}",
                domain, url.url
            );
        }
    }

    // ── G_DISCOVERY_DEDUP ─────────────────────────────────────────

    #[test]
    fn g_discovery_dedup() {
        let html = make_html(&[
            "https://example.com/page",
            "https://example.com/page",
            "https://example.com/page#fragment",
            "https://example.com/other",
        ]);
        let result = DiscoveryService::discover("https://example.com", &html, 10);
        let urls: Vec<_> = result.urls.iter().map(|u| &u.url).collect();
        let unique: HashSet<_> = urls.iter().collect();
        assert_eq!(urls.len(), unique.len(), "Duplicate URLs found: {:?}", urls);
    }

    // ── G_DISCOVERY_SEED_NOT_RETURNED ────────────────────────────

    #[test]
    fn g_discovery_no_self_link() {
        let html = make_html(&[
            "https://example.com", // seed itself
            "https://example.com/",
            "https://example.com/page",
        ]);
        let result = DiscoveryService::discover("https://example.com", &html, 10);
        for url in &result.urls {
            assert_ne!(
                normalize_url(&url.url),
                normalize_url("https://example.com"),
                "Seed URL must not be returned in discovered URLs"
            );
        }
    }

    // ── G_DISCOVERY_NON_HTML_FILTERED ────────────────────────────

    #[test]
    fn g_discovery_non_html_filtered() {
        let html = make_html(&[
            "https://example.com/doc.pdf",
            "https://example.com/image.jpg",
            "https://example.com/file.zip",
            "https://example.com/page.html",
        ]);
        let result = DiscoveryService::discover("https://example.com", &html, 10);
        for url in &result.urls {
            assert!(
                !url.url.ends_with(".pdf")
                    && !url.url.ends_with(".jpg")
                    && !url.url.ends_with(".zip"),
                "Non-HTML extension should be filtered: {}",
                url.url
            );
        }
    }

    // ── G_RESOLVE_RELATIVE ────────────────────────────────────────

    #[test]
    fn g_resolve_relative_url() {
        let result = resolve_url("https://example.com/blog/post", "/about");
        assert_eq!(result, "https://example.com/about");
    }

    #[test]
    fn g_resolve_protocol_relative() {
        let result = resolve_url("https://example.com/page", "//cdn.example.com/asset.js");
        // Should be filtered later as different domain, but resolution is correct
        assert_eq!(result, "https://cdn.example.com/asset.js");
    }

    // ── G_HARD_CAP ───────────────────────────────────────────────

    #[test]
    fn g_discovery_hard_cap() {
        // Even if we request more than hard cap, it's capped
        let links: Vec<String> = (0..50)
            .map(|i| format!("https://example.com/page{}", i))
            .collect();
        let link_refs: Vec<&str> = links.iter().map(|s| s.as_str()).collect();
        let html = make_html(&link_refs);
        let result = DiscoveryService::discover("https://example.com", &html, 100);
        assert!(
            result.urls.len() <= DISCOVERY_MAX_PAGES_HARD_CAP,
            "Hard cap not enforced: {} > {}",
            result.urls.len(),
            DISCOVERY_MAX_PAGES_HARD_CAP
        );
    }

    // ── P12: SITEMAP PARSING ──────────────────────────────────────

    #[test]
    fn g_p12_sitemap_disabled_by_default() {
        // Feature flag ENABLE_DISCOVERY_SITEMAP is false by default
        // parse_sitemap_urls should return empty
        std::env::remove_var("ENABLE_DISCOVERY_SITEMAP");
        let xml = r#"<?xml version="1.0"?><urlset><url><loc>https://example.com/page</loc></url></urlset>"#;
        let result = parse_sitemap_urls(xml, "example.com", 10);
        assert_eq!(result.format, "sitemap");
        assert!(
            result.urls.is_empty(),
            "Sitemap must be empty when feature disabled"
        );
    }

    #[test]
    fn g_p12_sitemap_enabled_extracts_locs() {
        std::env::set_var("ENABLE_DISCOVERY_SITEMAP", "true");
        let xml = r#"<?xml version="1.0"?><urlset>
            <url><loc>https://example.com/page-a</loc></url>
            <url><loc>https://example.com/page-b</loc></url>
            <url><loc>https://other.com/page</loc></url>
        </urlset>"#;
        let result = parse_sitemap_urls(xml, "example.com", 10);
        assert_eq!(
            result.urls.len(),
            2,
            "Only same-domain URLs should be included"
        );
        assert!(result
            .urls
            .contains(&"https://example.com/page-a".to_string()));
        assert!(result
            .urls
            .contains(&"https://example.com/page-b".to_string()));
        std::env::remove_var("ENABLE_DISCOVERY_SITEMAP");
    }

    #[test]
    fn g_p12_sitemap_budget_enforced() {
        std::env::set_var("ENABLE_DISCOVERY_SITEMAP", "true");
        let locs: String = (0..30)
            .map(|i| format!("<url><loc>https://example.com/p{}</loc></url>", i))
            .collect();
        let xml = format!("<?xml version=\"1.0\"?><urlset>{}</urlset>", locs);
        let result = parse_sitemap_urls(&xml, "example.com", 5);
        assert!(
            result.urls.len() <= 5,
            "Sitemap budget not enforced: {} > 5",
            result.urls.len()
        );
        std::env::remove_var("ENABLE_DISCOVERY_SITEMAP");
    }

    // ── P12: RSS PARSING ──────────────────────────────────────────

    #[test]
    fn g_p12_rss_disabled_by_default() {
        std::env::remove_var("ENABLE_DISCOVERY_RSS");
        let xml = r#"<rss version="2.0"><channel><item><link>https://example.com/news</link></item></channel></rss>"#;
        let result = parse_rss_urls(xml, "example.com", 10);
        assert!(
            result.urls.is_empty(),
            "RSS must be empty when feature disabled"
        );
    }

    #[test]
    fn g_p12_rss_domain_lock() {
        std::env::set_var("ENABLE_DISCOVERY_RSS", "true");
        let xml = r#"<rss version="2.0"><channel>
            <item><link>https://example.com/article-1</link></item>
            <item><link>https://external.com/article-2</link></item>
        </channel></rss>"#;
        let result = parse_rss_urls(xml, "example.com", 10);
        assert_eq!(result.urls.len(), 1, "Only same-domain URL should survive");
        assert_eq!(result.urls[0], "https://example.com/article-1");
        std::env::remove_var("ENABLE_DISCOVERY_RSS");
    }

    // ── P12: CONSTANTS ────────────────────────────────────────────

    #[test]
    fn g_p12_constants() {
        assert!(!ENABLE_DISCOVERY_SITEMAP);
        assert!(!ENABLE_DISCOVERY_RSS);
        assert_eq!(P12_DISCOVERY_VERSION, "P12.0");
    }
}
