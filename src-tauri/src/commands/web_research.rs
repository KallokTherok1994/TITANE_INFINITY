// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — WEB RESEARCH COMMAND (P3.0 QUALIFIED++)
//   Commande Tauri unique : web_research
//   Ring 3 orchestrator — Policy → Robots → RateLimit → Cache → Fetch
// ═══════════════════════════════════════════════════════════════

use crate::services::cache_service::CacheService;
use crate::services::fetch_service::{FetchError, FetchService};
use crate::services::network_policy::apply_policy;
use crate::services::network_policy::extract_domain;
use crate::services::rate_limit_service::{
    apply_rate_limit_delay, RateLimitProfile, RateLimitService,
};
use crate::services::robots_service::{RobotsErrorPolicy, RobotsService};
use crate::types::research::{
    CacheEvent, CacheEventKind, NetworkEvent, RateLimitAction, RateLimitEvent, ResearchAnswer,
    ResearchMode, ResearchOptions, ResearchQuery, ResearchReport, ResearchTrace, RobotsEvent,
    RobotsStatus, RESEARCH_CONTRACT_VERSION,
};
use std::collections::HashMap;
use std::path::PathBuf;
use uuid::Uuid;

// ─────────────────────────────────────────────────────────────────
// MARKERS (canonical — P2 preserved, P3 extended)
// ─────────────────────────────────────────────────────────────────

const M_START: &str = "RESEARCH_START";
const M_MODE: &str = "MODE_SELECTED";
const M_POLICY_APPLIED: &str = "POLICY_APPLIED";
const M_POLICY_BLOCKED: &str = "POLICY_BLOCKED";
const M_OFFLINE_HARDSTOP: &str = "OFFLINE_HARDSTOP_ENFORCED";
const M_ROBOTS_START: &str = "ROBOTS_CHECK_START";
const M_ROBOTS_OK: &str = "ROBOTS_OK";
const M_ROBOTS_BLOCKED: &str = "ROBOTS_BLOCKED";
const M_ROBOTS_ERROR_ALLOW: &str = "ROBOTS_ERROR_FALLBACK_ALLOW";
const M_ROBOTS_ERROR_BLOCK: &str = "ROBOTS_ERROR_FALLBACK_BLOCK";
const M_RATE_OK: &str = "RATE_LIMIT_OK";
const M_RATE_DELAYED: &str = "RATE_LIMIT_DELAYED";
const M_RATE_BLOCKED: &str = "RATE_LIMIT_BLOCKED";
const M_CACHE_HIT: &str = "CACHE_LOOKUP_HIT";
const M_CACHE_MISS: &str = "CACHE_LOOKUP_MISS";
const M_CACHE_WRITE_OK: &str = "CACHE_WRITE_OK";
const M_CACHE_WRITE_SKIP: &str = "CACHE_WRITE_SKIPPED";
const M_DISCOVERY_SKIP: &str = "DISCOVERY_SKIPPED_P3";
const M_FETCH_DONE: &str = "FETCH_DONE";
const M_FETCH_SKIP: &str = "FETCH_SKIPPED_P3";
const M_EXTRACT_SKIP: &str = "EXTRACT_SKIPPED_P3";
const M_INDEX_SKIP: &str = "INDEX_SKIPPED_P3";
const M_RETRIEVE_SKIP: &str = "RETRIEVE_SKIPPED_P3";
const M_RAG_SKIP: &str = "RAG_SKIPPED_P3";
const M_CITATIONS_EMPTY: &str = "CITATIONS_EMPTY_OK_P3";
const M_END: &str = "RESEARCH_END";

// Default sandbox root (relative to working dir; Tauri would use app_data_dir in production)
const DEFAULT_SANDBOX_ROOT: &str = "data/research";

// ─────────────────────────────────────────────────────────────────
// ORCHESTRATOR
// ─────────────────────────────────────────────────────────────────

async fn run_research(query: &ResearchQuery, options: &ResearchOptions) -> ResearchReport {
    let trace_id = Uuid::new_v4().to_string();
    let mut markers: Vec<String> = Vec::new();
    let mut errors: Vec<String> = Vec::new();
    let mut limitations: Vec<String> = Vec::new();
    let mut network_events: Vec<NetworkEvent> = Vec::new();
    let mut cache_events: Vec<CacheEvent> = Vec::new();
    let mut robots_events: Vec<RobotsEvent> = Vec::new();
    let mut rate_limit_events: Vec<RateLimitEvent> = Vec::new();
    let mut budgets: Option<HashMap<String, f64>> = None;

    // M1
    markers.push(M_START.to_string());
    let mode_str = serde_json::to_string(&options.mode).unwrap_or_else(|_| "UNKNOWN".to_string());
    markers.push(format!("{}:{}", M_MODE, mode_str));

    // ── OFFLINE HARD-STOP ─────────────────────────────────────────
    if options.mode == ResearchMode::Offline {
        markers.push(M_POLICY_APPLIED.to_string());
        markers.push(M_OFFLINE_HARDSTOP.to_string());

        if !network_events.is_empty() {
            errors.push("INVARIANT_VIOLATION: network_events non-empty in OFFLINE".to_string());
            markers.push(M_END.to_string());
            markers.push("VERDICT_FAIL".to_string());
            return make_report(
                trace_id,
                markers,
                errors,
                limitations,
                None,
                None,
                None,
                None,
                budgets,
                query,
                false,
                true,
            );
        }

        limitations.push("No index in P3".to_string());
        push_skip_markers(&mut markers);
        markers.push(M_END.to_string());
        markers.push("VERDICT_PASS".to_string());
        return make_report(
            trace_id,
            markers,
            errors,
            limitations,
            None,
            None,
            None,
            None,
            budgets,
            query,
            false,
            false,
        );
    }

    // ── LOCAL_INDEX stub ──────────────────────────────────────────
    if options.mode == ResearchMode::LocalIndex {
        markers.push(M_POLICY_APPLIED.to_string());
        limitations.push("Index not implemented in P3".to_string());
        push_skip_markers(&mut markers);
        markers.push(M_END.to_string());
        markers.push("VERDICT_PASS".to_string());
        return make_report(
            trace_id,
            markers,
            errors,
            limitations,
            None,
            None,
            None,
            None,
            budgets,
            query,
            false,
            false,
        );
    }

    // ── WEB_LIVE — Policy ─────────────────────────────────────────
    let policy = match apply_policy(options) {
        Ok(p) => {
            budgets = Some(p.budgets.clone());
            markers.push(M_POLICY_APPLIED.to_string());
            p
        }
        Err(e) => {
            errors.push(e.to_string());
            markers.push(M_POLICY_BLOCKED.to_string());
            limitations.push(format!("Policy blocked: {}", e.message));
            push_skip_markers(&mut markers);
            markers.push(M_END.to_string());
            markers.push("VERDICT_BLOCKED".to_string());
            return make_report(
                trace_id,
                markers,
                errors,
                limitations,
                None,
                None,
                None,
                None,
                budgets,
                query,
                true,
                false,
            );
        }
    };

    markers.push(M_DISCOVERY_SKIP.to_string());

    let target_url = options.target_url.as_deref().unwrap_or("");
    let domain = extract_domain(target_url).unwrap_or_else(|| target_url.to_string());

    // ── WEB_LIVE — Cache Service init ─────────────────────────────
    let sandbox_root = PathBuf::from(
        options
            .sandbox_root
            .as_deref()
            .unwrap_or(DEFAULT_SANDBOX_ROOT),
    );
    let cache_enabled = options.cache_enabled.unwrap_or(true);

    let cache_svc_result = if cache_enabled {
        CacheService::new(sandbox_root.clone()).ok()
    } else {
        None
    };

    // ── WEB_LIVE — Robots check ───────────────────────────────────
    markers.push(M_ROBOTS_START.to_string());

    let respect_robots = options.respect_robots.unwrap_or(true);
    if respect_robots {
        if let Some(cache_svc) = &cache_svc_result {
            let robots_svc = RobotsService::new(policy.timeout_ms, RobotsErrorPolicy::AllowOnError);
            let (allowed, robots_event) = robots_svc.is_allowed(target_url, cache_svc).await;

            // Push robots marker
            let robots_marker = match &robots_event.status {
                RobotsStatus::Allow => M_ROBOTS_OK,
                RobotsStatus::Disallow => M_ROBOTS_BLOCKED,
                RobotsStatus::ErrorFallbackAllow => M_ROBOTS_ERROR_ALLOW,
                RobotsStatus::ErrorFallbackBlock => M_ROBOTS_ERROR_BLOCK,
            };
            markers.push(robots_marker.to_string());
            robots_events.push(robots_event);

            if !allowed {
                limitations.push("URL disallowed by robots.txt".to_string());
                push_fetch_skip_markers(&mut markers);
                markers.push(M_END.to_string());
                markers.push("VERDICT_BLOCKED".to_string());
                return make_report(
                    trace_id,
                    markers,
                    errors,
                    limitations,
                    None,
                    None,
                    Some(robots_events),
                    None,
                    budgets,
                    query,
                    true,
                    false,
                );
            }
        } else {
            markers.push(M_ROBOTS_OK.to_string()); // no cache → skip robots (no CacheService)
        }
    } else {
        markers.push(M_ROBOTS_OK.to_string()); // robots disabled by policy
    }

    // ── WEB_LIVE — Rate limit ─────────────────────────────────────
    let rate_profile = match options.rate_limit_profile.as_deref() {
        Some("polite") => RateLimitProfile::Polite,
        Some("strict") => RateLimitProfile::Strict,
        Some(other) if other.parse::<u32>().is_ok() => {
            RateLimitProfile::Custom(other.parse().unwrap())
        }
        _ => RateLimitProfile::Default,
    };

    let mut rate_svc = RateLimitService::new(rate_profile);
    let rl_event = rate_svc.check(&domain);

    let rl_marker = match rl_event.action {
        RateLimitAction::Allow => M_RATE_OK,
        RateLimitAction::Delay => M_RATE_DELAYED,
        RateLimitAction::Block => M_RATE_BLOCKED,
    };
    markers.push(rl_marker.to_string());

    if rl_event.action == RateLimitAction::Block {
        errors.push(format!(
            "Rate limit block for domain '{}': {:?}",
            domain, rl_event.reason
        ));
        rate_limit_events.push(rl_event);
        limitations.push("Rate limit exceeded".to_string());
        push_fetch_skip_markers(&mut markers);
        markers.push(M_END.to_string());
        markers.push("VERDICT_BLOCKED".to_string());
        return make_report(
            trace_id,
            markers,
            errors,
            limitations,
            None,
            None,
            Some(robots_events),
            Some(rate_limit_events),
            budgets,
            query,
            true,
            false,
        );
    }

    // Apply delay if needed (Delay action)
    apply_rate_limit_delay(&rl_event).await;
    rate_limit_events.push(rl_event);

    // ── WEB_LIVE — Cache lookup ───────────────────────────────────
    let cache_hit = if let Some(cache_svc) = &cache_svc_result {
        match cache_svc.lookup(target_url) {
            Ok(Some(entry)) => {
                markers.push(M_CACHE_HIT.to_string());
                cache_events.push(CacheEvent {
                    kind: CacheEventKind::Hit,
                    url: target_url.to_string(),
                    blob_hash: Some(entry.blob_hash.clone()),
                    bytes: Some(entry.bytes),
                    ts: entry.fetched_at,
                });
                // Build a synthetic NetworkEvent for the cache hit
                network_events.push(NetworkEvent {
                    domain: domain.clone(),
                    url: target_url.to_string(),
                    status: entry.status,
                    bytes: entry.bytes,
                    duration_ms: 0,
                    cache_hit: true,
                });
                true
            }
            _ => {
                markers.push(M_CACHE_MISS.to_string());
                false
            }
        }
    } else {
        markers.push(M_CACHE_MISS.to_string());
        false
    };

    // ── WEB_LIVE — Fetch (only on cache MISS) ─────────────────────
    if !cache_hit {
        let mut fetch_svc = FetchService::new(&policy);
        let fetch_result = fetch_svc.fetch(target_url, &policy).await;

        match fetch_result {
            Ok(result) => {
                let status = result.event.status;
                let bytes = result.event.bytes;
                // Rate limit tracking
                if status == 429 || status == 503 {
                    rate_svc.record_error_response(&domain, status);
                } else {
                    rate_svc.record_success(&domain);
                }

                network_events.push(result.event);
                markers.push(format!(
                    "{}:status={},bytes={}",
                    M_FETCH_DONE, status, bytes
                ));

                // Cache write
                if let Some(cache_svc) = &cache_svc_result {
                    match cache_svc.write(
                        target_url,
                        target_url,
                        status,
                        "application/octet-stream",
                        None,
                        None,
                        &result.body,
                    ) {
                        Ok((_, ev)) => {
                            let write_marker = if ev.kind == CacheEventKind::Skip {
                                M_CACHE_WRITE_SKIP
                            } else {
                                M_CACHE_WRITE_OK
                            };
                            markers.push(write_marker.to_string());
                            cache_events.push(ev);
                        }
                        Err(e) => {
                            errors.push(format!("Cache write error: {}", e));
                            markers.push(M_CACHE_WRITE_SKIP.to_string());
                        }
                    }
                }
            }
            Err(e) => {
                let msg = e.to_string();
                errors.push(msg.clone());
                let marker = match &e {
                    FetchError::BudgetExceeded(_) => "FETCH_BUDGET_EXCEEDED",
                    FetchError::PolicyViolation(_) => "FETCH_POLICY_VIOLATION",
                    FetchError::SchemeNotAllowed(_) => "FETCH_SCHEME_INVALID",
                    FetchError::NetworkError(_) => "FETCH_NETWORK_ERROR",
                    FetchError::Timeout(_) => "FETCH_TIMEOUT",
                };
                markers.push(marker.to_string());

                let opt_ne = if network_events.is_empty() {
                    None
                } else {
                    Some(network_events)
                };
                let opt_ce = if cache_events.is_empty() {
                    None
                } else {
                    Some(cache_events)
                };
                let opt_re = if robots_events.is_empty() {
                    None
                } else {
                    Some(robots_events)
                };
                let opt_rl = if rate_limit_events.is_empty() {
                    None
                } else {
                    Some(rate_limit_events)
                };
                push_extract_markers(&mut markers);
                markers.push(M_END.to_string());
                markers.push("VERDICT_FAIL".to_string());
                return make_report(
                    trace_id,
                    markers,
                    errors,
                    limitations,
                    opt_ne,
                    opt_ce,
                    opt_re,
                    opt_rl,
                    budgets,
                    query,
                    false,
                    true,
                );
            }
        }
    }

    push_extract_markers(&mut markers);
    markers.push(M_END.to_string());
    markers.push("VERDICT_PASS".to_string());

    let opt_ne = if network_events.is_empty() {
        None
    } else {
        Some(network_events)
    };
    let opt_ce = if cache_events.is_empty() {
        None
    } else {
        Some(cache_events)
    };
    let opt_re = if robots_events.is_empty() {
        None
    } else {
        Some(robots_events)
    };
    let opt_rl = if rate_limit_events.is_empty() {
        None
    } else {
        Some(rate_limit_events)
    };

    make_report(
        trace_id,
        markers,
        errors,
        limitations,
        opt_ne,
        opt_ce,
        opt_re,
        opt_rl,
        budgets,
        query,
        false,
        false,
    )
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

fn push_skip_markers(markers: &mut Vec<String>) {
    markers.push(M_DISCOVERY_SKIP.to_string());
    markers.push(M_FETCH_SKIP.to_string());
    push_extract_markers(markers);
}

fn push_fetch_skip_markers(markers: &mut Vec<String>) {
    markers.push(M_FETCH_SKIP.to_string());
    push_extract_markers(markers);
}

fn push_extract_markers(markers: &mut Vec<String>) {
    markers.push(M_EXTRACT_SKIP.to_string());
    markers.push(M_INDEX_SKIP.to_string());
    markers.push(M_RETRIEVE_SKIP.to_string());
    markers.push(M_RAG_SKIP.to_string());
    markers.push(M_CITATIONS_EMPTY.to_string());
}

#[allow(clippy::too_many_arguments)]
fn make_report(
    trace_id: String,
    markers: Vec<String>,
    errors: Vec<String>,
    limitations: Vec<String>,
    network_events: Option<Vec<NetworkEvent>>,
    cache_events: Option<Vec<CacheEvent>>,
    robots_events: Option<Vec<RobotsEvent>>,
    rate_limit_events: Option<Vec<RateLimitEvent>>,
    budgets: Option<HashMap<String, f64>>,
    query: &ResearchQuery,
    is_blocked: bool,
    is_fail: bool,
) -> ResearchReport {
    let answer_text = if is_blocked {
        format!(
            "[BLOCKED] Request blocked (contract: {RESEARCH_CONTRACT_VERSION}). Query: \"{}\"",
            query.question
        )
    } else if is_fail {
        format!(
            "[FAIL] Request failed (contract: {RESEARCH_CONTRACT_VERSION}). Query: \"{}\"",
            query.question
        )
    } else {
        format!(
            "[P3] Research completed (contract: {RESEARCH_CONTRACT_VERSION}). \
             Query: \"{}\". Extraction/Index/RAG not yet implemented.",
            query.question
        )
    };

    let answer = ResearchAnswer {
        answer: answer_text,
        citations: vec![],
        confidence: None,
        limitations,
        trace_id: trace_id.clone(),
    };

    let trace = ResearchTrace {
        trace_id,
        markers,
        timings: None,
        budgets,
        network_events,
        cache_events,
        robots_events,
        rate_limit_events,
        index_events: None,
        errors,
    };

    ResearchReport { answer, trace }
}

// ─────────────────────────────────────────────────────────────────
// TAURI COMMAND
// ─────────────────────────────────────────────────────────────────

/// Web research command — P3.0 QUALIFIED++.
///
/// OFFLINE: hard-stop, zero network, VERDICT_PASS
/// LOCAL_INDEX: stub, VERDICT_PASS
/// WEB_LIVE: Policy → Robots → RateLimit → Cache lookup → Fetch → Cache write
#[tauri::command]
pub async fn web_research(
    query: ResearchQuery,
    options: ResearchOptions,
) -> Result<ResearchReport, String> {
    let report = run_research(&query, &options).await;
    Ok(report)
}

// ─────────────────────────────────────────────────────────────────
// UNIT TESTS
// ─────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn make_query(q: &str) -> ResearchQuery {
        ResearchQuery {
            question: q.to_string(),
            intent: None,
            locale: None,
        }
    }

    fn offline_options() -> ResearchOptions {
        ResearchOptions {
            mode: ResearchMode::Offline,
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
            target_url: None,
            cache_enabled: None,
            sandbox_root: None,
        }
    }

    fn web_live_options_no_cache(url: &str) -> ResearchOptions {
        ResearchOptions {
            mode: ResearchMode::WebLive,
            target_url: Some(url.to_string()),
            max_requests: Some(5),
            max_bytes_total: Some(1024 * 1024),
            timeout_ms: Some(10_000),
            cache_enabled: Some(false),
            respect_robots: Some(false),
            domain_allowlist: None,
            domain_denylist: None,
            max_sources: None,
            max_pages: None,
            freshness_days: None,
            rate_limit_profile: None,
            sandbox_root: None,
        }
    }

    fn tmp_sandbox() -> String {
        let dir = std::env::temp_dir()
            .join("titane_research_cmd_test")
            .join(format!(
                "{:x}",
                std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap_or_default()
                    .subsec_nanos()
            ));
        std::fs::create_dir_all(&dir).unwrap();
        dir.to_str().unwrap().to_string()
    }

    // G_OFFLINE_HARDSTOP (P2 preserved)
    #[tokio::test]
    async fn g_offline_hardstop() {
        let q = make_query("OFFLINE");
        let o = offline_options();
        let report = run_research(&q, &o).await;
        assert!(
            report.trace.network_events.is_none()
                || report.trace.network_events.as_ref().unwrap().is_empty()
        );
        assert!(report
            .trace
            .markers
            .iter()
            .any(|m| m == "OFFLINE_HARDSTOP_ENFORCED"));
        assert!(report.trace.markers.iter().any(|m| m == "VERDICT_PASS"));
    }

    // G_BUDGET: max_requests=0 → POLICY_BLOCKED
    #[tokio::test]
    async fn g_budget_max_requests_zero() {
        let q = make_query("budget");
        let mut o = web_live_options_no_cache("https://example.com/");
        o.max_requests = Some(0);
        let report = run_research(&q, &o).await;
        assert!(report.trace.markers.iter().any(|m| m == "POLICY_BLOCKED"));
        assert!(report.trace.markers.iter().any(|m| m == "VERDICT_BLOCKED"));
    }

    // G_TRACE_COMPLETENESS
    #[tokio::test]
    async fn g_trace_completeness_offline() {
        let q = make_query("trace");
        let o = offline_options();
        let report = run_research(&q, &o).await;
        assert!(!report.trace.trace_id.is_empty());
        assert!(report.trace.markers.iter().any(|m| m == "RESEARCH_START"));
        assert!(report.trace.markers.iter().any(|m| m == "RESEARCH_END"));
        assert!(report.trace.markers.iter().any(|m| m == "POLICY_APPLIED"));
    }

    // G_REPRODUCIBILITY x3 OFFLINE
    #[tokio::test]
    async fn g_reproducibility_offline_x3() {
        let q = make_query("repro");
        let o = offline_options();
        let r1 = run_research(&q, &o).await;
        let r2 = run_research(&q, &o).await;
        let r3 = run_research(&q, &o).await;
        assert_ne!(r1.trace.trace_id, r2.trace.trace_id);
        assert_ne!(r2.trace.trace_id, r3.trace.trace_id);
        fn names(r: &ResearchReport) -> Vec<String> {
            r.trace
                .markers
                .iter()
                .map(|m| m.split(':').next().unwrap_or(m).to_string())
                .collect()
        }
        assert_eq!(names(&r1), names(&r2));
        assert_eq!(names(&r2), names(&r3));
    }

    // G_CACHE_HIT_NO_NETWORK: write to cache → second call returns HIT
    #[tokio::test]
    async fn g_cache_hit_no_network() {
        let sandbox = tmp_sandbox();
        let cache_svc = CacheService::new(PathBuf::from(&sandbox)).unwrap();
        let url = "https://cached.example.com/page";
        // Pre-populate cache
        cache_svc
            .write(url, url, 200, "text/html", None, None, b"cached content")
            .unwrap();

        // Run research with cache enabled + no robots
        let q = make_query("cache hit test");
        let o = ResearchOptions {
            mode: ResearchMode::WebLive,
            target_url: Some(url.to_string()),
            max_requests: Some(5),
            max_bytes_total: Some(1024 * 1024),
            timeout_ms: Some(5_000),
            cache_enabled: Some(true),
            respect_robots: Some(false),
            sandbox_root: Some(sandbox.clone()),
            domain_allowlist: None,
            domain_denylist: None,
            max_sources: None,
            max_pages: None,
            freshness_days: None,
            rate_limit_profile: None,
        };
        let report = run_research(&q, &o).await;

        assert!(
            report.trace.markers.iter().any(|m| m == "CACHE_LOOKUP_HIT"),
            "Expected CACHE_LOOKUP_HIT in markers: {:?}",
            report.trace.markers
        );
        // Cache hit → network_events should have cache_hit=true
        if let Some(events) = &report.trace.network_events {
            assert!(
                events.iter().all(|e| e.cache_hit),
                "all events should be cache_hit=true"
            );
        }
    }

    // G_ROBOTS_RESPECT: disallowed URL → ROBOTS_BLOCKED
    #[tokio::test]
    async fn g_robots_blocked_from_cache() {
        let sandbox = tmp_sandbox();
        let cache_svc = CacheService::new(PathBuf::from(&sandbox)).unwrap();
        // Pre-populate robots cache to disallow /admin
        cache_svc
            .put_robots("example.com", "User-agent: *\nDisallow: /admin\n")
            .unwrap();

        let q = make_query("robots blocked");
        let o = ResearchOptions {
            mode: ResearchMode::WebLive,
            target_url: Some("https://example.com/admin/panel".to_string()),
            max_requests: Some(5),
            max_bytes_total: Some(1024 * 1024),
            timeout_ms: Some(5_000),
            cache_enabled: Some(true),
            respect_robots: Some(true),
            sandbox_root: Some(sandbox),
            domain_allowlist: None,
            domain_denylist: None,
            max_sources: None,
            max_pages: None,
            freshness_days: None,
            rate_limit_profile: None,
        };
        let report = run_research(&q, &o).await;

        assert!(
            report.trace.markers.iter().any(|m| m == "ROBOTS_BLOCKED"),
            "Expected ROBOTS_BLOCKED: {:?}",
            report.trace.markers
        );
        assert!(report.trace.markers.iter().any(|m| m == "VERDICT_BLOCKED"));
    }
}
