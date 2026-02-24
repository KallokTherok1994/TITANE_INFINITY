// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — WEB RESEARCH COMMAND (P1.0 EXPERIMENTAL)
//   Commande Tauri unique : web_research
//   Ring 3 stub — zéro réseau, zéro index, Always Respond
// ═══════════════════════════════════════════════════════════════

use crate::types::research::{
    Citation, ResearchAnswer, ResearchMode, ResearchOptions, ResearchQuery, ResearchReport,
    ResearchTrace, RESEARCH_CONTRACT_VERSION,
};
use uuid::Uuid;

// ─────────────────────────────────────────────────────────────────
// MARKERS (P1 Always Respond — order is canonical)
// ─────────────────────────────────────────────────────────────────

const M_START: &str = "RESEARCH_START";
const M_MODE: &str = "MODE_SELECTED";
const M_POLICY_APPLIED: &str = "POLICY_APPLIED";
const M_POLICY_BLOCKED: &str = "POLICY_BLOCKED";
const M_DISCOVERY_SKIP: &str = "DISCOVERY_SKIPPED_P1";
const M_FETCH_SKIP: &str = "FETCH_SKIPPED_P1";
const M_EXTRACT_SKIP: &str = "EXTRACT_SKIPPED_P1";
const M_INDEX_SKIP: &str = "INDEX_SKIPPED_P1";
const M_RETRIEVE_SKIP: &str = "RETRIEVE_SKIPPED_P1";
const M_RAG_SKIP: &str = "RAG_SKIPPED_P1";
const M_CITATIONS_EMPTY: &str = "CITATIONS_EMPTY_OK_P1";
const M_END: &str = "RESEARCH_END";

// ─────────────────────────────────────────────────────────────────
// STUB SERVICE (Ring 3)
// ─────────────────────────────────────────────────────────────────

/// Execute a deterministic stub research.
/// P1: no network, no index. WEB_LIVE → BLOCKED.
fn run_research_stub(query: &ResearchQuery, options: &ResearchOptions) -> ResearchReport {
    let trace_id = Uuid::new_v4().to_string();
    let mut markers: Vec<String> = Vec::new();
    let mut errors: Vec<String> = Vec::new();
    let mut limitations: Vec<String> = Vec::new();

    // M1 — start
    markers.push(M_START.to_string());

    // M2 — mode selected
    markers.push(format!(
        "{}:{}",
        M_MODE,
        serde_json::to_string(&options.mode).unwrap_or_else(|_| "UNKNOWN".to_string())
    ));

    // M3 — policy
    let is_blocked = options.mode == ResearchMode::WebLive;
    if is_blocked {
        markers.push(M_POLICY_BLOCKED.to_string());
        errors.push("Network disabled in P1 — WEB_LIVE mode not activated".to_string());
        limitations.push("Network disabled in P1".to_string());
    } else {
        markers.push(M_POLICY_APPLIED.to_string());
    }

    // M4-M9 — all processing stages skipped in P1
    markers.push(M_DISCOVERY_SKIP.to_string());
    markers.push(M_FETCH_SKIP.to_string());
    markers.push(M_EXTRACT_SKIP.to_string());
    markers.push(M_INDEX_SKIP.to_string());
    markers.push(M_RETRIEVE_SKIP.to_string());
    markers.push(M_RAG_SKIP.to_string());

    // M10 — citations empty (expected in P1)
    markers.push(M_CITATIONS_EMPTY.to_string());

    // Build limitations per mode
    match &options.mode {
        ResearchMode::Offline => {
            limitations.push("No index in P1".to_string());
        }
        ResearchMode::LocalIndex => {
            limitations.push("Index not implemented in P1".to_string());
        }
        ResearchMode::WebLive => {
            // already added above
        }
    }

    // Build answer
    let (answer_text, verdict) = if is_blocked {
        (
            format!(
                "[BLOCKED] WEB_LIVE mode is not activated in P1 (contract: {RESEARCH_CONTRACT_VERSION}). \
                 Query was: \"{}\"",
                query.question
            ),
            "VERDICT_BLOCKED",
        )
    } else {
        (
            format!(
                "[STUB P1] Research stub for query: \"{}\". \
                 No real answer available in P1 (contract: {RESEARCH_CONTRACT_VERSION}).",
                query.question
            ),
            "VERDICT_PASS",
        )
    };

    // M11-M12 — end + verdict
    markers.push(M_END.to_string());
    markers.push(verdict.to_string());

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
        budgets: None,
        network_events: None,
        cache_events: None,
        index_events: None,
        errors,
    };

    ResearchReport { answer, trace }
}

// ─────────────────────────────────────────────────────────────────
// TAURI COMMAND (surface IPC unique)
// ─────────────────────────────────────────────────────────────────

/// Web research command — P1.0 EXPERIMENTAL stub.
///
/// Returns a deterministic `ResearchReport` with full trace and markers.
/// WEB_LIVE mode returns BLOCKED (network not activated in P1).
/// No real network calls are ever made in P1.
#[tauri::command]
pub async fn web_research(
    query: ResearchQuery,
    options: ResearchOptions,
) -> Result<ResearchReport, String> {
    let report = run_research_stub(&query, &options);
    Ok(report)
}

// ─────────────────────────────────────────────────────────────────
// UNIT TESTS
// ─────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn make_options(mode: ResearchMode) -> ResearchOptions {
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
        }
    }

    fn make_query(q: &str) -> ResearchQuery {
        ResearchQuery {
            question: q.to_string(),
            intent: None,
            locale: None,
        }
    }

    #[test]
    fn test_offline_always_respond() {
        let q = make_query("Test question");
        let o = make_options(ResearchMode::Offline);
        let report = run_research_stub(&q, &o);

        // trace_id non vide
        assert!(
            !report.trace.trace_id.is_empty(),
            "trace_id must not be empty"
        );

        // markers: RESEARCH_START présent
        assert!(
            report.trace.markers.iter().any(|m| m == "RESEARCH_START"),
            "must contain RESEARCH_START"
        );
        // markers: RESEARCH_END présent
        assert!(
            report.trace.markers.iter().any(|m| m == "RESEARCH_END"),
            "must contain RESEARCH_END"
        );
        // verdict PASS
        assert!(
            report.trace.markers.iter().any(|m| m == "VERDICT_PASS"),
            "OFFLINE must produce VERDICT_PASS"
        );
        // report retourné même si vide
        assert!(
            report.answer.citations.is_empty(),
            "P1 must have empty citations"
        );
    }

    #[test]
    fn test_local_index_always_respond() {
        let q = make_query("Another question");
        let o = make_options(ResearchMode::LocalIndex);
        let report = run_research_stub(&q, &o);

        assert!(!report.trace.trace_id.is_empty());
        assert!(report.trace.markers.iter().any(|m| m == "VERDICT_PASS"));
        assert!(report.answer.limitations.iter().any(|l| l.contains("P1")));
    }

    #[test]
    fn test_web_live_blocked() {
        let q = make_query("Live search");
        let o = make_options(ResearchMode::WebLive);
        let report = run_research_stub(&q, &o);

        // Must return a report even when blocked
        assert!(!report.trace.trace_id.is_empty());
        assert!(
            report.trace.markers.iter().any(|m| m == "POLICY_BLOCKED"),
            "WEB_LIVE must have POLICY_BLOCKED marker"
        );
        assert!(
            report.trace.markers.iter().any(|m| m == "VERDICT_BLOCKED"),
            "WEB_LIVE must produce VERDICT_BLOCKED"
        );
        // No network events in P1
        assert!(report.trace.network_events.is_none());
    }

    #[test]
    fn test_reproducibility_same_mode() {
        // Same mode → same marker structure (trace_id differs, markers identical)
        let q = make_query("Reproducibility test");
        let o = make_options(ResearchMode::Offline);
        let r1 = run_research_stub(&q, &o);
        let r2 = run_research_stub(&q, &o);
        let r3 = run_research_stub(&q, &o);

        // trace_ids differ
        assert_ne!(r1.trace.trace_id, r2.trace.trace_id);
        assert_ne!(r2.trace.trace_id, r3.trace.trace_id);

        // marker structure identical (after stripping trace-specific content)
        // We compare by extracting plain marker names (before ':')
        fn marker_names(report: &ResearchReport) -> Vec<String> {
            report
                .trace
                .markers
                .iter()
                .map(|m| m.split(':').next().unwrap_or(m).to_string())
                .collect()
        }
        assert_eq!(marker_names(&r1), marker_names(&r2));
        assert_eq!(marker_names(&r2), marker_names(&r3));
    }
}
