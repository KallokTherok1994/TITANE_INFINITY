// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — NETWORK POLICY GUARD (Ring 3)
//   P2.0 QUALIFIED — apply-or-fail policy for WebResearch
//   Single choke-point: all WEB_LIVE requests must pass here.
// ═══════════════════════════════════════════════════════════════

use crate::types::research::{ResearchMode, ResearchOptions};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ─────────────────────────────────────────────────────────────────
// ERROR
// ─────────────────────────────────────────────────────────────────

/// Policy violation reason
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PolicyError {
    pub code: String,
    pub message: String,
}

impl std::fmt::Display for PolicyError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "[{}] {}", self.code, self.message)
    }
}

// ─────────────────────────────────────────────────────────────────
// APPLIED POLICY (output)
// ─────────────────────────────────────────────────────────────────

/// Effective policy after validation — passed to FetchService
#[derive(Debug, Clone)]
pub struct AppliedPolicy {
    pub policy_applied: bool,
    pub max_requests: u32,
    pub max_bytes_total: u64,
    pub timeout_ms: u64,
    pub domain_allowlist: Vec<String>,
    pub domain_denylist: Vec<String>,
    /// Budgets suitable for trace serialisation
    pub budgets: HashMap<String, f64>,
}

// Default safe caps used when options omit a field
const DEFAULT_MAX_REQUESTS: u32 = 10;
const DEFAULT_MAX_BYTES: u64 = 10 * 1024 * 1024; // 10 MiB
const DEFAULT_TIMEOUT_MS: u64 = 15_000; // 15 s

// ─────────────────────────────────────────────────────────────────
// GUARD
// ─────────────────────────────────────────────────────────────────

/// Validate `options` and produce an `AppliedPolicy`, or fail with
/// a `PolicyError` that triggers `POLICY_BLOCKED` + `VERDICT_BLOCKED`.
///
/// Rules:
/// 1. OFFLINE mode → network is unconditionally forbidden (caller must
///    enforce; this function should not be called for OFFLINE — returns Err).
/// 2. max_requests == 0 → POLICY_BLOCKED (budget exhausted before start).
/// 3. max_bytes_total == 0 → POLICY_BLOCKED.
/// 4. WEB_LIVE requires a target_url to be set.
pub fn apply_policy(options: &ResearchOptions) -> Result<AppliedPolicy, PolicyError> {
    // Rule 1: OFFLINE must never reach network
    if options.mode == ResearchMode::Offline {
        return Err(PolicyError {
            code: "OFFLINE_NETWORK_FORBIDDEN".to_string(),
            message: "Network is unconditionally forbidden in OFFLINE mode".to_string(),
        });
    }

    // Rule 2: max_requests == 0 → budget exhausted
    let max_requests = options.max_requests.unwrap_or(DEFAULT_MAX_REQUESTS);
    if max_requests == 0 {
        return Err(PolicyError {
            code: "BUDGET_MAX_REQUESTS_ZERO".to_string(),
            message: "max_requests is 0 — fetch budget exhausted before start".to_string(),
        });
    }

    // Rule 3: max_bytes_total == 0 → budget exhausted
    let max_bytes_total = options.max_bytes_total.unwrap_or(DEFAULT_MAX_BYTES);
    if max_bytes_total == 0 {
        return Err(PolicyError {
            code: "BUDGET_MAX_BYTES_ZERO".to_string(),
            message: "max_bytes_total is 0 — byte budget exhausted before start".to_string(),
        });
    }

    // Rule 4: WEB_LIVE requires target_url
    if options.mode == ResearchMode::WebLive && options.target_url.is_none() {
        return Err(PolicyError {
            code: "WEB_LIVE_NO_TARGET_URL".to_string(),
            message: "WEB_LIVE mode requires target_url to be set".to_string(),
        });
    }

    let timeout_ms = options.timeout_ms.unwrap_or(DEFAULT_TIMEOUT_MS);

    let mut budgets = HashMap::new();
    budgets.insert("max_requests".to_string(), max_requests as f64);
    budgets.insert("max_bytes_total".to_string(), max_bytes_total as f64);
    budgets.insert("timeout_ms".to_string(), timeout_ms as f64);

    Ok(AppliedPolicy {
        policy_applied: true,
        max_requests,
        max_bytes_total,
        timeout_ms,
        domain_allowlist: options.domain_allowlist.clone().unwrap_or_default(),
        domain_denylist: options.domain_denylist.clone().unwrap_or_default(),
        budgets,
    })
}

/// Check whether a URL's domain is allowed by the applied policy.
/// Returns Err if the domain is denied or not in the allowlist (when non-empty).
pub fn check_domain(url: &str, policy: &AppliedPolicy) -> Result<(), PolicyError> {
    let domain = extract_domain(url).unwrap_or_else(|| url.to_string());

    // Denylist check
    if policy
        .domain_denylist
        .iter()
        .any(|d| domain.ends_with(d.as_str()))
    {
        return Err(PolicyError {
            code: "DOMAIN_DENIED".to_string(),
            message: format!("Domain '{}' is in the denylist", domain),
        });
    }

    // Allowlist check (only when non-empty)
    if !policy.domain_allowlist.is_empty()
        && !policy
            .domain_allowlist
            .iter()
            .any(|d| domain.ends_with(d.as_str()))
    {
        return Err(PolicyError {
            code: "DOMAIN_NOT_ALLOWED".to_string(),
            message: format!(
                "Domain '{}' is not in the allowlist: {:?}",
                domain, policy.domain_allowlist
            ),
        });
    }

    Ok(())
}

/// Best-effort domain extraction (no external URL crate needed).
pub fn extract_domain(url: &str) -> Option<String> {
    // strip scheme
    let without_scheme = url
        .strip_prefix("https://")
        .or_else(|| url.strip_prefix("http://"))?;
    // take up to first '/' or end
    let host = without_scheme.split('/').next()?;
    // strip port
    let host = host.split(':').next()?;
    Some(host.to_lowercase())
}

// ─────────────────────────────────────────────────────────────────
// UNIT TESTS
// ─────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn base_options(mode: ResearchMode) -> ResearchOptions {
        ResearchOptions {
            mode,
            domain_allowlist: None,
            domain_denylist: None,
            max_sources: None,
            max_pages: None,
            freshness_days: None,
            timeout_ms: None,
            max_bytes_total: None,
            max_requests: None,
            respect_robots: None,
            rate_limit_profile: None,
            target_url: Some("https://example.com/".to_string()),
            cache_enabled: None,
            sandbox_root: None,
            seed_urls: None,
            max_depth: None,
        }
    }

    #[test]
    fn test_offline_always_blocked_by_policy() {
        let opts = base_options(ResearchMode::Offline);
        let result = apply_policy(&opts);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err().code, "OFFLINE_NETWORK_FORBIDDEN");
    }

    #[test]
    fn test_max_requests_zero_blocked() {
        let mut opts = base_options(ResearchMode::WebLive);
        opts.max_requests = Some(0);
        let result = apply_policy(&opts);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err().code, "BUDGET_MAX_REQUESTS_ZERO");
    }

    #[test]
    fn test_max_bytes_zero_blocked() {
        let mut opts = base_options(ResearchMode::WebLive);
        opts.max_bytes_total = Some(0);
        let result = apply_policy(&opts);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err().code, "BUDGET_MAX_BYTES_ZERO");
    }

    #[test]
    fn test_web_live_no_target_url_blocked() {
        let mut opts = base_options(ResearchMode::WebLive);
        opts.target_url = None;
        let result = apply_policy(&opts);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err().code, "WEB_LIVE_NO_TARGET_URL");
    }

    #[test]
    fn test_valid_web_live_policy() {
        let opts = base_options(ResearchMode::WebLive);
        let result = apply_policy(&opts);
        assert!(result.is_ok());
        let policy = result.unwrap();
        assert!(policy.policy_applied);
        assert!(policy.budgets.contains_key("max_requests"));
        assert!(policy.budgets.contains_key("max_bytes_total"));
        assert!(policy.budgets.contains_key("timeout_ms"));
    }

    #[test]
    fn test_domain_denylist() {
        let opts = ResearchOptions {
            mode: ResearchMode::WebLive,
            domain_denylist: Some(vec!["evil.com".to_string()]),
            target_url: Some("https://evil.com/page".to_string()),
            ..base_options(ResearchMode::WebLive)
        };
        let policy = apply_policy(&opts).unwrap();
        let result = check_domain("https://evil.com/page", &policy);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err().code, "DOMAIN_DENIED");
    }

    #[test]
    fn test_domain_allowlist_pass() {
        let opts = ResearchOptions {
            mode: ResearchMode::WebLive,
            domain_allowlist: Some(vec!["example.com".to_string()]),
            target_url: Some("https://example.com/".to_string()),
            ..base_options(ResearchMode::WebLive)
        };
        let policy = apply_policy(&opts).unwrap();
        assert!(check_domain("https://example.com/test", &policy).is_ok());
    }

    #[test]
    fn test_domain_allowlist_fail() {
        let opts = ResearchOptions {
            mode: ResearchMode::WebLive,
            domain_allowlist: Some(vec!["example.com".to_string()]),
            target_url: Some("https://example.com/".to_string()),
            ..base_options(ResearchMode::WebLive)
        };
        let policy = apply_policy(&opts).unwrap();
        let result = check_domain("https://other.com/test", &policy);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err().code, "DOMAIN_NOT_ALLOWED");
    }
}
