// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — ROBOTS SERVICE (Ring 3)
//   P3.0 QUALIFIED++ — robots.txt fetch + parse + cache
//   Default: ALLOW on error (configurable)
// ═══════════════════════════════════════════════════════════════

use crate::services::cache_service::{CacheError, CacheService};
use crate::services::fetch_service::FetchService;
use crate::services::network_policy::AppliedPolicy;
use crate::services::network_policy::extract_domain;
use crate::types::research::{RobotsEvent, RobotsStatus};

// ─────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────

/// Behaviour when robots.txt cannot be fetched (network error / 404+)
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RobotsErrorPolicy {
    /// Default: allow access when robots.txt is unavailable
    AllowOnError,
    /// Strict: block access when robots.txt is unavailable
    BlockOnError,
}

// ─────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────

pub struct RobotsService {
    error_policy: RobotsErrorPolicy,
}

impl RobotsService {
    pub fn new(timeout_ms: u64, error_policy: RobotsErrorPolicy) -> Self {
        let _ = timeout_ms;
        RobotsService { error_policy }
    }

    /// Check whether `url` is allowed by the domain's robots.txt.
    ///
    /// Returns (is_allowed, RobotsEvent).
    /// Reads from cache first; fetches from network if not cached.
    pub async fn is_allowed(
        &self,
        url: &str,
        cache: &CacheService,
        fetch_svc: &mut FetchService,
        policy: &AppliedPolicy,
    ) -> (bool, RobotsEvent) {
        let domain = extract_domain(url).unwrap_or_else(|| url.to_string());
        let path = extract_path(url);

        // Try cache first
        match cache.get_robots(&domain) {
            Ok(Some(content)) => {
                let allowed = parse_robots_allowed(&content, &path);
                return (
                    allowed,
                    RobotsEvent {
                        domain,
                        status: if allowed {
                            RobotsStatus::Allow
                        } else {
                            RobotsStatus::Disallow
                        },
                        fetched: false,
                        cached: true,
                    },
                );
            }
            Ok(None) => {} // MISS — fetch below
            Err(CacheError::SandboxViolation(e)) => {
                return self.error_fallback_event(domain, e);
            }
            Err(_) => {} // DB error — fall through to fetch
        }

        // Fetch robots.txt from network
        let robots_url = format!("https://{}/robots.txt", domain);
        match fetch_svc.fetch(&robots_url, policy).await {
            Ok(result) if (200..300).contains(&result.status) => {
                let text = String::from_utf8_lossy(&result.body).into_owned();
                // Best-effort cache write (ignore errors)
                let _ = cache.put_robots(&domain, &text);
                let allowed = parse_robots_allowed(&text, &path);
                (
                    allowed,
                    RobotsEvent {
                        domain,
                        status: if allowed {
                            RobotsStatus::Allow
                        } else {
                            RobotsStatus::Disallow
                        },
                        fetched: true,
                        cached: false,
                    },
                )
            }
            Ok(result) if result.status == 404 => {
                // No robots.txt → allow everything
                let _ = cache.put_robots(&domain, "");
                (
                    true,
                    RobotsEvent {
                        domain,
                        status: RobotsStatus::Allow,
                        fetched: true,
                        cached: false,
                    },
                )
            }
            _ => {
                // Network error or unexpected status
                self.error_fallback_event(domain, "fetch failed".to_string())
            }
        }
    }

    fn error_fallback_event(&self, domain: String, _reason: String) -> (bool, RobotsEvent) {
        let (allowed, status) = match self.error_policy {
            RobotsErrorPolicy::AllowOnError => (true, RobotsStatus::ErrorFallbackAllow),
            RobotsErrorPolicy::BlockOnError => (false, RobotsStatus::ErrorFallbackBlock),
        };
        (
            allowed,
            RobotsEvent {
                domain,
                status,
                fetched: false,
                cached: false,
            },
        )
    }
}

// ─────────────────────────────────────────────────────────────────
// PARSER (minimal — User-agent: * + Disallow only)
// ─────────────────────────────────────────────────────────────────

/// Parse robots.txt and determine if `path` is allowed for User-agent: *.
/// Returns true (allowed) unless a `Disallow` rule matches the path.
pub fn parse_robots_allowed(robots_txt: &str, path: &str) -> bool {
    let mut in_star_block = false;
    let mut disallowed = false;

    for line in robots_txt.lines() {
        let line = line.trim();
        // Strip inline comments
        let line = if let Some(pos) = line.find('#') {
            &line[..pos]
        } else {
            line
        }
        .trim();

        if line.is_empty() {
            // Blank line ends a block
            in_star_block = false;
            continue;
        }

        if let Some(rest) = line.strip_prefix("User-agent:") {
            let agent = rest.trim();
            in_star_block = agent == "*";
            continue;
        }

        if in_star_block {
            if let Some(rest) = line.strip_prefix("Disallow:") {
                let rule = rest.trim();
                if !rule.is_empty() && path.starts_with(rule) {
                    disallowed = true;
                }
            }
        }
    }

    !disallowed
}

/// Extract URL path (including query) for robots matching
fn extract_path(url: &str) -> String {
    // Strip scheme + host
    let without_scheme = url
        .strip_prefix("https://")
        .or_else(|| url.strip_prefix("http://"))
        .unwrap_or(url);
    // Path starts after first '/'
    if let Some(pos) = without_scheme.find('/') {
        without_scheme[pos..].to_string()
    } else {
        "/".to_string()
    }
}

// ─────────────────────────────────────────────────────────────────
// UNIT TESTS
// ─────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn g_robots_parser_allow() {
        let txt = "User-agent: *\nDisallow: /private\n";
        assert!(parse_robots_allowed(txt, "/public/page"));
    }

    #[test]
    fn g_robots_parser_disallow() {
        let txt = "User-agent: *\nDisallow: /private\n";
        assert!(!parse_robots_allowed(txt, "/private/secret"));
    }

    #[test]
    fn g_robots_parser_disallow_prefix() {
        let txt = "User-agent: *\nDisallow: /secret\n";
        assert!(!parse_robots_allowed(txt, "/secret/sub/page"));
    }

    #[test]
    fn g_robots_parser_empty_disallow_means_allow_all() {
        // Empty Disallow: means allow all
        let txt = "User-agent: *\nDisallow: \n";
        assert!(parse_robots_allowed(txt, "/anything"));
    }

    #[test]
    fn g_robots_parser_no_star_agent_does_not_apply() {
        let txt = "User-agent: Googlebot\nDisallow: /\n";
        // rule is for Googlebot only, not *, so we're allowed
        assert!(parse_robots_allowed(txt, "/anything"));
    }

    #[test]
    fn g_robots_parser_empty_txt_allows_all() {
        assert!(parse_robots_allowed("", "/anything"));
    }

    #[test]
    fn g_extract_path() {
        assert_eq!(
            extract_path("https://example.com/foo/bar?q=1"),
            "/foo/bar?q=1"
        );
        assert_eq!(extract_path("https://example.com"), "/");
    }

    #[test]
    fn g_robots_respect_cached() {
        // If cached content disallows, is_allowed returns false without network
        // (tested via orchestrator integration; parser correctness covered above)
        let txt = "User-agent: *\nDisallow: /admin\n";
        assert!(!parse_robots_allowed(txt, "/admin/panel"));
        assert!(parse_robots_allowed(txt, "/home"));
    }
}
