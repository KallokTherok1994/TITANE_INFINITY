// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — WEB RESEARCH COMMAND (P2.0 QUALIFIED)
//   Commande Tauri unique : web_research
//   Ring 3 orchestrator — Network Gate + Policy + OFFLINE hard-stop
// ═══════════════════════════════════════════════════════════════

use crate::services::fetch_service::{FetchError, FetchService};
use crate::services::network_policy::{apply_policy, PolicyError};
use crate::types::research::{
    NetworkEvent, ResearchAnswer, ResearchMode, ResearchOptions, ResearchQuery, ResearchReport,
    ResearchTrace, RESEARCH_CONTRACT_VERSION,
};
use std::collections::HashMap;
use uuid::Uuid;

// ─────────────────────────────────────────────────────────────────
// MARKERS (canonical order — P1 markers preserved, P2 added)
// ─────────────────────────────────────────────────────────────────

const M_START: &str = "RESEARCH_START";
const M_MODE: &str = "MODE_SELECTED";
const M_POLICY_APPLIED: &str = "POLICY_APPLIED";
const M_POLICY_BLOCKED: &str = "POLICY_BLOCKED";
const M_OFFLINE_HARDSTOP: &str = "OFFLINE_HARDSTOP_ENFORCED";
const M_DISCOVERY_SKIP: &str = "DISCOVERY_SKIPPED_P2";
const M_FETCH_DONE: &str = "FETCH_DONE";
const M_FETCH_SKIP: &str = "FETCH_SKIPPED_P2";
const M_EXTRACT_SKIP: &str = "EXTRACT_SKIPPED_P2";
const M_INDEX_SKIP: &str = "INDEX_SKIPPED_P2";
const M_RETRIEVE_SKIP: &str = "RETRIEVE_SKIPPED_P2";
const M_RAG_SKIP: &str = "RAG_SKIPPED_P2";
const M_CITATIONS_EMPTY: &str = "CITATIONS_EMPTY_OK_P2";
const M_END: &str = "RESEARCH_END";

// ─────────────────────────────────────────────────────────────────
// ORCHESTRATOR (Ring 2 embedded, Ring 3 services)
// ─────────────────────────────────────────────────────────────────

/// Run the P2 research orchestration.
///
/// OFFLINE  → hard-stop (zero network), VERDICT_PASS
/// LOCAL_INDEX → stub (no index yet), VERDICT_PASS
/// WEB_LIVE → NetworkPolicyGuard → FetchService → 1 governed request
async fn run_research(query: &ResearchQuery, options: &ResearchOptions) -> ResearchReport {
    let trace_id = Uuid::new_v4().to_string();
    let mut markers: Vec<String> = Vec::new();
    let mut errors: Vec<String> = Vec::new();
    let mut limitations: Vec<String> = Vec::new();
    let mut network_events: Vec<NetworkEvent> = Vec::new();
    let mut budgets: Option<HashMap<String, f64>> = None;

    // M1 — start
    markers.push(M_START.to_string());

    // M2 — mode
    let mode_str = serde_json::to_string(&options.mode).unwrap_or_else(|_| "UNKNOWN".to_string());
    markers.push(format!("{}:{}", M_MODE, mode_str));

    // ── OFFLINE HARD-STOP ─────────────────────────────────────────
    if options.mode == ResearchMode::Offline {
        markers.push(M_POLICY_APPLIED.to_string());
        markers.push(M_OFFLINE_HARDSTOP.to_string());

        // Invariant: network_events MUST remain empty — enforced at build-time
        // by never calling FetchService from this branch. We track it explicitly.
        if !network_events.is_empty() {
            errors.push(
                "INVARIANT_VIOLATION: network_events non-empty in OFFLINE hard-stop".to_string(),
            );
            markers.push(M_END.to_string());
            markers.push("VERDICT_FAIL".to_string());
            return make_report(
                trace_id,
                markers,
                errors,
                limitations,
                Some(network_events),
                budgets,
                query,
                false,
                true,
            );
        }

        limitations.push("No index in P2".to_string());
        markers.push(M_DISCOVERY_SKIP.to_string());
        markers.push(M_FETCH_SKIP.to_string());
        markers.push(M_EXTRACT_SKIP.to_string());
        markers.push(M_INDEX_SKIP.to_string());
        markers.push(M_RETRIEVE_SKIP.to_string());
        markers.push(M_RAG_SKIP.to_string());
        markers.push(M_CITATIONS_EMPTY.to_string());
        markers.push(M_END.to_string());
        markers.push("VERDICT_PASS".to_string());

        return make_report(
            trace_id,
            markers,
            errors,
            limitations,
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
        limitations.push("Index not implemented in P2".to_string());
        markers.push(M_DISCOVERY_SKIP.to_string());
        markers.push(M_FETCH_SKIP.to_string());
        markers.push(M_EXTRACT_SKIP.to_string());
        markers.push(M_INDEX_SKIP.to_string());
        markers.push(M_RETRIEVE_SKIP.to_string());
        markers.push(M_RAG_SKIP.to_string());
        markers.push(M_CITATIONS_EMPTY.to_string());
        markers.push(M_END.to_string());
        markers.push("VERDICT_PASS".to_string());

        return make_report(
            trace_id,
            markers,
            errors,
            limitations,
            None,
            budgets,
            query,
            false,
            false,
        );
    }

    // ── WEB_LIVE — NetworkPolicyGuard ─────────────────────────────
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
            markers.push(M_DISCOVERY_SKIP.to_string());
            markers.push(M_FETCH_SKIP.to_string());
            markers.push(M_EXTRACT_SKIP.to_string());
            markers.push(M_INDEX_SKIP.to_string());
            markers.push(M_RETRIEVE_SKIP.to_string());
            markers.push(M_RAG_SKIP.to_string());
            markers.push(M_CITATIONS_EMPTY.to_string());
            markers.push(M_END.to_string());
            markers.push("VERDICT_BLOCKED".to_string());

            return make_report(
                trace_id,
                markers,
                errors,
                limitations,
                None,
                budgets,
                query,
                true,
                false,
            );
        }
    };

    // ── WEB_LIVE — FetchService single governed request ───────────
    markers.push(M_DISCOVERY_SKIP.to_string()); // no discovery in P2

    let target_url = options.target_url.as_deref().unwrap_or("");
    let mut fetch_svc = FetchService::new(&policy);

    let fetch_result = fetch_svc.fetch(target_url, &policy).await;

    let verdict = match fetch_result {
        Ok(result) => {
            network_events.push(result.event);
            let last = network_events.last().expect("just pushed");
            markers.push(format!(
                "{}:status={},bytes={}",
                M_FETCH_DONE, last.status, last.bytes,
            ));
            "VERDICT_PASS"
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
            "VERDICT_FAIL"
        }
    };

    markers.push(M_EXTRACT_SKIP.to_string());
    markers.push(M_INDEX_SKIP.to_string());
    markers.push(M_RETRIEVE_SKIP.to_string());
    markers.push(M_RAG_SKIP.to_string());
    markers.push(M_CITATIONS_EMPTY.to_string());
    markers.push(M_END.to_string());
    markers.push(verdict.to_string());

    let evts = if network_events.is_empty() {
        None
    } else {
        Some(network_events)
    };
    let is_blocked = verdict == "VERDICT_BLOCKED";
    let is_fail = verdict == "VERDICT_FAIL";
    make_report(
        trace_id,
        markers,
        errors,
        limitations,
        evts,
        budgets,
        query,
        is_blocked,
        is_fail,
    )
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

#[allow(clippy::too_many_arguments)]
fn make_report(
    trace_id: String,
    markers: Vec<String>,
    errors: Vec<String>,
    limitations: Vec<String>,
    network_events: Option<Vec<NetworkEvent>>,
    budgets: Option<HashMap<String, f64>>,
    query: &ResearchQuery,
    is_blocked: bool,
    is_fail: bool,
) -> ResearchReport {
    let answer_text = if is_blocked {
        format!(
            "[BLOCKED] Policy blocked this request (contract: {RESEARCH_CONTRACT_VERSION}). \
             Query: \"{}\"",
            query.question
        )
    } else if is_fail {
        format!(
            "[FAIL] Fetch failed (contract: {RESEARCH_CONTRACT_VERSION}). Query: \"{}\"",
            query.question
        )
    } else {
        format!(
            "[P2] Research completed (contract: {RESEARCH_CONTRACT_VERSION}). \
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
        cache_events: None,
        index_events: None,
        errors,
    };

    ResearchReport { answer, trace }
}

// ─────────────────────────────────────────────────────────────────
// TAURI COMMAND (single IPC surface)
// ─────────────────────────────────────────────────────────────────

/// Web research command — P2.0 QUALIFIED.
///
/// OFFLINE: hard-stop, zero network, VERDICT_PASS
/// LOCAL_INDEX: stub, no index, VERDICT_PASS
/// WEB_LIVE: governed fetch via NetworkPolicyGuard + FetchService
#[tauri::command]
pub async fn web_research(
    query: ResearchQuery,
    options: ResearchOptions,
) -> Result<ResearchReport, String> {
    let report = run_research(&query, &options).await;
    Ok(report)
}

// ─────────────────────────────────────────────────────────────────
// UNIT TESTS (G_ gates from P2 spec)
// ─────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

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
        }
    }

    fn web_live_options(url: &str) -> ResearchOptions {
        ResearchOptions {
            mode: ResearchMode::WebLive,
            target_url: Some(url.to_string()),
            max_requests: Some(5),
            max_bytes_total: Some(1024 * 1024),
            timeout_ms: Some(10_000),
            domain_allowlist: None,
            domain_denylist: None,
            max_sources: None,
            max_pages: None,
            freshness_days: None,
            respect_robots: None,
            rate_limit_profile: None,
        }
    }

    // G_OFFLINE_HARDSTOP: network_events.len() == 0
    #[tokio::test]
    async fn g_offline_hardstop() {
        let q = make_query("OFFLINE test");
        let o = offline_options();
        let report = run_research(&q, &o).await;

        // MUST have zero network events
        assert!(
            report.trace.network_events.is_none()
                || report.trace.network_events.as_ref().unwrap().is_empty(),
            "G_OFFLINE_HARDSTOP: network_events must be empty in OFFLINE mode"
        );

        // Must have OFFLINE_HARDSTOP_ENFORCED marker
        assert!(
            report
                .trace
                .markers
                .iter()
                .any(|m| m == "OFFLINE_HARDSTOP_ENFORCED"),
            "must contain OFFLINE_HARDSTOP_ENFORCED"
        );

        // Must produce VERDICT_PASS
        assert!(
            report.trace.markers.iter().any(|m| m == "VERDICT_PASS"),
            "OFFLINE must produce VERDICT_PASS"
        );

        // trace_id non-empty
        assert!(!report.trace.trace_id.is_empty());
    }

    // G_BUDGET_ENFORCED: max_requests=0 → POLICY_BLOCKED
    #[tokio::test]
    async fn g_budget_max_requests_zero() {
        let q = make_query("budget test");
        let mut o = web_live_options("https://example.com/");
        o.max_requests = Some(0);
        let report = run_research(&q, &o).await;

        assert!(
            report.trace.markers.iter().any(|m| m == "POLICY_BLOCKED"),
            "max_requests=0 must produce POLICY_BLOCKED"
        );
        assert!(
            report.trace.markers.iter().any(|m| m == "VERDICT_BLOCKED"),
            "must produce VERDICT_BLOCKED"
        );
    }

    // G_BUDGET_ENFORCED: max_bytes_total=0 → POLICY_BLOCKED
    #[tokio::test]
    async fn g_budget_max_bytes_zero() {
        let q = make_query("budget bytes test");
        let mut o = web_live_options("https://example.com/");
        o.max_bytes_total = Some(0);
        let report = run_research(&q, &o).await;

        assert!(
            report.trace.markers.iter().any(|m| m == "POLICY_BLOCKED"),
            "max_bytes_total=0 must produce POLICY_BLOCKED"
        );
    }

    // G_TRACE_COMPLETENESS: trace_id + POLICY_APPLIED + RESEARCH_START/END
    #[tokio::test]
    async fn g_trace_completeness_offline() {
        let q = make_query("trace test");
        let o = offline_options();
        let report = run_research(&q, &o).await;

        assert!(
            !report.trace.trace_id.is_empty(),
            "trace_id must be present"
        );
        assert!(
            report.trace.markers.iter().any(|m| m == "RESEARCH_START"),
            "must have RESEARCH_START"
        );
        assert!(
            report.trace.markers.iter().any(|m| m == "RESEARCH_END"),
            "must have RESEARCH_END"
        );
        assert!(
            report.trace.markers.iter().any(|m| m == "POLICY_APPLIED"),
            "must have POLICY_APPLIED"
        );
    }

    // G_REPRODUCIBILITY x3: same markers order, trace_ids differ
    #[tokio::test]
    async fn g_reproducibility_offline_x3() {
        let q = make_query("reproducibility");
        let o = offline_options();
        let r1 = run_research(&q, &o).await;
        let r2 = run_research(&q, &o).await;
        let r3 = run_research(&q, &o).await;

        // trace_ids differ
        assert_ne!(r1.trace.trace_id, r2.trace.trace_id);
        assert_ne!(r2.trace.trace_id, r3.trace.trace_id);

        // marker structure identical
        fn marker_names(r: &ResearchReport) -> Vec<String> {
            r.trace
                .markers
                .iter()
                .map(|m| m.split(':').next().unwrap_or(m).to_string())
                .collect()
        }
        assert_eq!(marker_names(&r1), marker_names(&r2));
        assert_eq!(marker_names(&r2), marker_names(&r3));
    }

    // G_REPRODUCIBILITY x3: WEB_LIVE budget blocked → same verdict
    #[tokio::test]
    async fn g_reproducibility_web_live_blocked_x3() {
        let q = make_query("blocked reproducibility");
        let mut o = web_live_options("https://example.com/");
        o.max_requests = Some(0);

        let r1 = run_research(&q, &o).await;
        let r2 = run_research(&q, &o).await;
        let r3 = run_research(&q, &o).await;

        for r in [&r1, &r2, &r3] {
            assert!(r.trace.markers.iter().any(|m| m == "VERDICT_BLOCKED"));
            assert!(r.trace.markers.iter().any(|m| m == "POLICY_BLOCKED"));
        }
    }

    // WEB_LIVE no target_url → POLICY_BLOCKED
    #[tokio::test]
    async fn test_web_live_no_url_blocked() {
        let q = make_query("no url");
        let mut o = web_live_options("https://example.com/");
        o.target_url = None;
        let report = run_research(&q, &o).await;
        assert!(report.trace.markers.iter().any(|m| m == "POLICY_BLOCKED"));
        assert!(report.trace.markers.iter().any(|m| m == "VERDICT_BLOCKED"));
    }

    // LOCAL_INDEX stub → VERDICT_PASS, no network
    #[tokio::test]
    async fn test_local_index_stub() {
        let q = make_query("local index");
        let o = ResearchOptions {
            mode: ResearchMode::LocalIndex,
            target_url: None,
            ..offline_options()
        };
        let report = run_research(&q, &o).await;
        assert!(report.trace.markers.iter().any(|m| m == "VERDICT_PASS"));
        assert!(
            report.trace.network_events.is_none()
                || report.trace.network_events.as_ref().unwrap().is_empty()
        );
    }
}
