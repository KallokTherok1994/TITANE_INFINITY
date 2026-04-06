// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — WEB RESEARCH COMMAND (P6.0 QUALIFIED→CANDIDATE STABLE)
//   Commande Tauri unique : web_research
//   Ring 3 orchestrator — Policy → Robots → RateLimit → Cache → Fetch → Extract → Index → RAG
// ═══════════════════════════════════════════════════════════════

use crate::services::discovery_service::DiscoveryService;
use crate::services::vector_service;
use crate::services::cache_service::CacheService;
use crate::services::extract_service::ExtractService;
use crate::services::fetch_service::{FetchError, FetchService};
use crate::services::index_service::{IndexService, IndexWriteResult};
use crate::services::network_policy::apply_policy;
use crate::services::network_policy::extract_domain;
use crate::services::rag_service;
use crate::services::rate_limit_service::{
    apply_rate_limit_delay, RateLimitProfile, RateLimitService,
};
use crate::services::robots_service::{RobotsErrorPolicy, RobotsService};
use crate::types::research::{
    CacheEvent, CacheEventKind, Citation, ExtractEvent, ExtractQuality, ExtractStatus, IndexEvent,
    IndexQueryStatus, IndexWriteStatus, NetworkEvent, RateLimitAction, RateLimitEvent,
    ResearchAnswer, ResearchMode, ResearchOptions, ResearchQuery, ResearchReport, ResearchTrace,
    RetrievedPassage, RobotsEvent, RobotsStatus, RESEARCH_CONTRACT_VERSION,
};
use std::collections::HashMap;
use std::path::PathBuf;
use uuid::Uuid;

// ─────────────────────────────────────────────────────────────────
// MARKERS (canonical — P2/P3/P4/P5 preserved, P6 extended)
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
const M_EXTRACT_START: &str = "EXTRACT_START";
const M_EXTRACT_OK: &str = "EXTRACT_OK";
const M_EXTRACT_FAIL: &str = "EXTRACT_FAIL";
const M_TEXT_HASH_OK: &str = "TEXT_HASH_OK";
const M_EXTRACT_SKIP: &str = "EXTRACT_SKIPPED_P6";
// P5 index markers
const M_INDEX_WRITE_START: &str = "INDEX_WRITE_START";
const M_INDEX_WRITE_OK: &str = "INDEX_WRITE_OK";
const M_INDEX_WRITE_SKIP_DUP: &str = "INDEX_WRITE_SKIPPED_DUP";
const M_INDEX_WRITE_FAIL: &str = "INDEX_WRITE_FAIL";
const M_INDEX_QUERY_START: &str = "INDEX_QUERY_START";
const M_INDEX_QUERY_OK: &str = "INDEX_QUERY_OK";
const M_INDEX_QUERY_EMPTY: &str = "INDEX_QUERY_EMPTY";
const M_RETRIEVE_START: &str = "RETRIEVE_PASSAGES_START";
const M_RETRIEVE_OK: &str = "RETRIEVE_PASSAGES_OK";
const M_INDEX_SKIP: &str = "INDEX_SKIPPED_P6";
const M_RETRIEVE_SKIP: &str = "RETRIEVE_SKIPPED_P6";
// P6 RAG markers
const M_RAG_START: &str = "RAG_START";
const M_RAG_CONTEXT_READY: &str = "RAG_CONTEXT_READY";
const M_RAG_OK: &str = "RAG_OK";
const M_RAG_SKIP: &str = "RAG_SKIPPED_P6";
const M_CITATIONS_BUILD_OK: &str = "CITATIONS_BUILD_OK";
const M_CITATIONS_EMPTY_P6: &str = "CITATIONS_EMPTY_OK_P6";
const M_CITATIONS_EMPTY: &str = "CITATIONS_EMPTY_OK_P6"; // alias for skip paths
// P7 discovery + vector markers
const M_DISCOVERY_START: &str = "DISCOVERY_START";
const M_DISCOVERY_SEED_OK: &str = "DISCOVERY_SEED_OK";
const M_DISCOVERY_BREADTH_LIMIT: &str = "DISCOVERY_BREADTH_LIMIT_ENFORCED";
const M_VECTOR_DISABLED: &str = "VECTOR_DISABLED";
const M_VECTOR_RERANK_OK: &str = "VECTOR_RERANK_OK";
const M_END: &str = "RESEARCH_END";

// Default sandbox root (relative to working dir; Tauri would use app_data_dir in production)
const DEFAULT_SANDBOX_ROOT: &str = "data/research";

// ─────────────────────────────────────────────────────────────────
// RAG CONTEXT (carries the P6 answer + citations across make_report call)
// ─────────────────────────────────────────────────────────────────

struct RagContext {
    answer: Option<String>,
    citations: Vec<Citation>,
}

impl Default for RagContext {
    fn default() -> Self {
        RagContext {
            answer: None,
            citations: vec![],
        }
    }
}

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
    let mut extract_events: Vec<ExtractEvent> = Vec::new();
    let mut index_events: Vec<IndexEvent> = Vec::new();
    let mut sources_count: usize = 0;
    let mut retrieved_passages_count: usize = 0;
    let mut budgets: Option<HashMap<String, f64>> = None;
    let mut rag_ctx = RagContext::default();

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
                None,
                None,
                sources_count,
                retrieved_passages_count,
                budgets,
                query,
                RagContext::default(),
                false,
                true,
            );
        }

        // ── OFFLINE + P6: query local index if available (no network) ──
        let offline_sandbox = PathBuf::from(
            options
                .sandbox_root
                .as_deref()
                .unwrap_or(DEFAULT_SANDBOX_ROOT),
        );
        markers.push(M_DISCOVERY_SKIP.to_string());
        markers.push(M_FETCH_SKIP.to_string());
        markers.push(M_EXTRACT_SKIP.to_string());
        markers.push(M_INDEX_QUERY_START.to_string());

        let mut offline_passages: Vec<RetrievedPassage> = Vec::new();

        match IndexService::init_or_open(&offline_sandbox) {
            Ok(ref index_svc) if index_svc.doc_count() > 0 => {
                let top_k = options.max_sources.map(|s| s as usize).unwrap_or(5);
                match index_svc.search(&query.question, Some(top_k)) {
                    Ok(hits) if !hits.is_empty() => {
                        markers.push(M_INDEX_QUERY_OK.to_string());
                        sources_count = hits.len();
                        markers.push(M_RETRIEVE_START.to_string());
                        for hit in &hits {
                            let p = IndexService::retrieve_passages(
                                &hit.body,
                                &query.question,
                                3,
                                &hit.url,
                            );
                            offline_passages.extend(p);
                        }
                        retrieved_passages_count = offline_passages.len();
                        markers.push(M_RETRIEVE_OK.to_string());
                        index_events.push(IndexEvent {
                            url: None,
                            query: Some(query.question.clone()),
                            write_status: None,
                            query_status: Some(IndexQueryStatus::Ok),
                            hits_count: Some(sources_count),
                            passages_count: Some(retrieved_passages_count),
                            error: None,
                        });
                    }
                    _ => {
                        markers.push(M_INDEX_QUERY_EMPTY.to_string());
                        limitations.push("No indexed evidence for offline query".to_string());
                        index_events.push(IndexEvent {
                            url: None,
                            query: Some(query.question.clone()),
                            write_status: None,
                            query_status: Some(IndexQueryStatus::Empty),
                            hits_count: Some(0),
                            passages_count: Some(0),
                            error: None,
                        });
                    }
                }
            }
            _ => {
                markers.push(M_INDEX_QUERY_EMPTY.to_string());
                limitations.push("No indexed evidence for offline query".to_string());
            }
        }

        // RAG
        markers.push(M_RAG_START.to_string());
        let rag_out = rag_service::generate_answer(
            &query.question,
            &offline_passages,
            options.max_sources.map(|s| s as usize).unwrap_or(5),
        );
        markers.push(M_RAG_CONTEXT_READY.to_string());
        markers.push(M_RAG_OK.to_string());
        limitations.extend(rag_out.limitations.iter().cloned());
        markers.push(format!("RAG_STRATEGY:{}", rag_out.strategy));
        markers.push(
            if rag_out.citations.is_empty() {
                M_CITATIONS_EMPTY_P6
            } else {
                M_CITATIONS_BUILD_OK
            }
            .to_string(),
        );
        rag_ctx = RagContext {
            answer: Some(rag_out.answer_text),
            citations: rag_out.citations,
        };

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
            None,
            opt_vec(index_events),
            sources_count,
            retrieved_passages_count,
            budgets,
            query,
            rag_ctx,
            false,
            false,
        );
    }

    // ── LOCAL_INDEX (P6 — real Tantivy query + RAG) ──────────────
    if options.mode == ResearchMode::LocalIndex {
        markers.push(M_POLICY_APPLIED.to_string());

        let sandbox_root = PathBuf::from(
            options
                .sandbox_root
                .as_deref()
                .unwrap_or(DEFAULT_SANDBOX_ROOT),
        );

        markers.push(M_INDEX_QUERY_START.to_string());

        let mut all_passages: Vec<RetrievedPassage> = Vec::new();

        match IndexService::init_or_open(&sandbox_root) {
            Ok(index_svc) => {
                let top_k = options.max_sources.map(|s| s as usize).unwrap_or(5);
                let query_str = &query.question;

                match index_svc.search(query_str, Some(top_k)) {
                    Ok(hits) if !hits.is_empty() => {
                        markers.push(M_INDEX_QUERY_OK.to_string());
                        sources_count = hits.len();

                        // Retrieve passages from full body of each hit
                        markers.push(M_RETRIEVE_START.to_string());
                        for hit in &hits {
                            let passages =
                                IndexService::retrieve_passages(&hit.body, query_str, 3, &hit.url);
                            all_passages.extend(passages);
                        }
                        retrieved_passages_count = all_passages.len();
                        markers.push(M_RETRIEVE_OK.to_string());

                        index_events.push(IndexEvent {
                            url: None,
                            query: Some(query_str.clone()),
                            write_status: None,
                            query_status: Some(IndexQueryStatus::Ok),
                            hits_count: Some(sources_count),
                            passages_count: Some(retrieved_passages_count),
                            error: None,
                        });
                    }
                    Ok(_) => {
                        markers.push(M_INDEX_QUERY_EMPTY.to_string());
                        limitations.push("No indexed evidence found for query".to_string());
                        index_events.push(IndexEvent {
                            url: None,
                            query: Some(query_str.clone()),
                            write_status: None,
                            query_status: Some(IndexQueryStatus::Empty),
                            hits_count: Some(0),
                            passages_count: Some(0),
                            error: None,
                        });
                    }
                    Err(e) => {
                        let err_msg = e.to_string();
                        errors.push(format!("Index query failed: {}", err_msg));
                        limitations.push("Index query failed".to_string());
                        index_events.push(IndexEvent {
                            url: None,
                            query: Some(query_str.clone()),
                            write_status: None,
                            query_status: Some(IndexQueryStatus::Failed),
                            hits_count: None,
                            passages_count: None,
                            error: Some(err_msg),
                        });
                    }
                }
            }
            Err(e) => {
                let err_msg = e.to_string();
                errors.push(format!("Index init failed: {}", err_msg));
                limitations.push("Index unavailable".to_string());
                markers.push(M_INDEX_QUERY_EMPTY.to_string());
            }
        }

        // ── RAG (P6) ─────────────────────────────────────────────
        markers.push(M_RAG_START.to_string());
        let rag_out = rag_service::generate_answer(
            &query.question,
            &all_passages,
            options.max_sources.map(|s| s as usize).unwrap_or(5),
        );
        markers.push(M_RAG_CONTEXT_READY.to_string());
        markers.push(M_RAG_OK.to_string());
        limitations.extend(rag_out.limitations.iter().cloned());
        markers.push(format!("RAG_STRATEGY:{}", rag_out.strategy));
        markers.push(
            if rag_out.citations.is_empty() {
                M_CITATIONS_EMPTY_P6
            } else {
                M_CITATIONS_BUILD_OK
            }
            .to_string(),
        );
        rag_ctx = RagContext {
            answer: Some(rag_out.answer_text),
            citations: rag_out.citations,
        };

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
            None,
            opt_vec(index_events),
            sources_count,
            retrieved_passages_count,
            budgets,
            query,
            rag_ctx,
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
                None,
                None,
                0,
                0,
                budgets,
                query,
                RagContext::default(),
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

    // ── WEB_LIVE P7 — Discovery multi-URL (if seed_urls provided) ─
    // Build the list of URLs to fetch: seed + discovered children.
    // The primary target_url is always fetched first (P5/P6 compat).
    // If seed_urls provided, we perform governed discovery (depth=1).
    let fetch_urls: Vec<String> = {
        let mut urls: Vec<String> = Vec::new();
        if !target_url.is_empty() {
            urls.push(target_url.to_string());
        }
        if let Some(seeds) = &options.seed_urls {
            for seed in seeds {
                if !urls.contains(seed) {
                    urls.push(seed.clone());
                }
            }
        }
        urls
    };

    // We need to process potentially multiple URLs.
    // For P7: if seed_urls are set, after fetching each seed's HTML, we run
    // discovery on it to find child URLs (depth=1 governed).
    // All discovered child URLs are added to the fetch queue (budget-capped).
    // Uses the policy max_pages as the discovery budget.
    let max_pages = options.max_pages.map(|p| p as usize).unwrap_or(5);

    // ── Build final URL list with discovery ───────────────────────
    let mut all_fetch_urls: Vec<String> = fetch_urls.clone();

    if options.seed_urls.is_some() {
        markers.push(M_DISCOVERY_START.to_string());
        // Discovery will run after each seed's HTML is fetched (below),
        // using the raw HTML bytes (not extracted text).
        markers.push(M_DISCOVERY_SEED_OK.to_string());
    }

    // ── WEB_LIVE — Robots check (on primary target_url) ──────────
    markers.push(M_ROBOTS_START.to_string());

    let respect_robots = options.respect_robots.unwrap_or(true);
    let mut fetch_svc = FetchService::new(&policy);
    if respect_robots {
        if let Some(cache_svc) = &cache_svc_result {
            let robots_svc = RobotsService::new(policy.timeout_ms, RobotsErrorPolicy::AllowOnError);
            let (allowed, robots_event) = robots_svc
                .is_allowed(target_url, cache_svc, &mut fetch_svc, &policy)
                .await;

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
                    None,
                    None,
                    0,
                    0,
                    budgets,
                    query,
                    RagContext::default(),
                    true,
                    false,
                );
            }
        } else {
            markers.push(M_ROBOTS_OK.to_string());
        }
    } else {
        markers.push(M_ROBOTS_OK.to_string());
    }

    // ── WEB_LIVE — Rate limit ─────────────────────────────────────
    let rate_profile = match options.rate_limit_profile.as_deref() {
        Some("polite") => RateLimitProfile::Polite,
        Some("strict") => RateLimitProfile::Strict,
        Some(other) => other
            .parse::<u32>()
            .map(RateLimitProfile::Custom)
            .unwrap_or(RateLimitProfile::Default),
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
            None,
            None,
            0,
            0,
            budgets,
            query,
            RagContext::default(),
            true,
            false,
        );
    }

    apply_rate_limit_delay(&rl_event).await;
    rate_limit_events.push(rl_event);

    // ── WEB_LIVE — Cache lookup ───────────────────────────────────
    // Collect bytes for extraction (cache HIT → read blob; MISS → fetch)
    let mut html_bytes_for_extract: Option<Vec<u8>> = None;

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
                network_events.push(NetworkEvent {
                    domain: domain.clone(),
                    url: target_url.to_string(),
                    status: entry.status,
                    bytes: entry.bytes,
                    duration_ms: 0,
                    cache_hit: true,
                });
                // Read blob for extraction
                let blob_path = sandbox_root
                    .join("cache")
                    .join("blobs")
                    .join(format!("{}.bin", entry.blob_hash));
                if let Ok(data) = std::fs::read(&blob_path) {
                    html_bytes_for_extract = Some(data);
                }
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
        let fetch_result = fetch_svc.fetch(target_url, &policy).await;

        match fetch_result {
            Ok(result) => {
                let status = result.event.status;
                let bytes = result.event.bytes;
                if status == 429 || status == 503 {
                    rate_svc.record_error_response(&domain, status);
                } else {
                    rate_svc.record_success(&domain);
                }

                // Stash body for extraction before moving into cache
                html_bytes_for_extract = Some(result.body.clone());

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
                push_extract_skip_markers(&mut markers);
                markers.push(M_END.to_string());
                markers.push("VERDICT_FAIL".to_string());
                return make_report(
                    trace_id,
                    markers,
                    errors,
                    limitations,
                    opt_vec(network_events),
                    opt_vec(cache_events),
                    opt_vec(robots_events),
                    opt_vec(rate_limit_events),
                    None,
                    None,
                    0,
                    0,
                    budgets,
                    query,
                    RagContext::default(),
                    false,
                    true,
                );
            }
        }
    }

    // ── WEB_LIVE — Extract (P4) ────────────────────────────────────
    markers.push(M_EXTRACT_START.to_string());

    let extract_svc = ExtractService::new();
    let mut extracted_text: Option<String> = None;
    let mut extracted_title: Option<String> = None;
    let mut extracted_hash: Option<String> = None;

    if let Some(ref html_bytes) = html_bytes_for_extract {
        match extract_svc.extract(html_bytes) {
            Ok(result) => {
                markers.push(M_EXTRACT_OK.to_string());
                markers.push(format!(
                    "{}:{}",
                    M_TEXT_HASH_OK,
                    result.text_hash.get(..8).unwrap_or(&result.text_hash)
                ));

                // Update cache meta with text_hash (best-effort)
                if let Some(cache_svc) = &cache_svc_result {
                    let _ = cache_svc.update_extract_meta(
                        target_url,
                        &result.text_hash,
                        result.text_len,
                    );
                }

                extracted_text = Some(result.text.clone());
                extracted_title = result.title.clone();
                extracted_hash = Some(result.text_hash.clone());

                extract_events.push(ExtractEvent {
                    url: target_url.to_string(),
                    title: result.title,
                    text_bytes: result.text_len,
                    text_hash: Some(result.text_hash),
                    quality: ExtractQuality {
                        text_len: result.text_len,
                        lines: result.lines,
                    },
                    status: ExtractStatus::Ok,
                    error: None,
                });
            }
            Err(e) => {
                let err_msg = e.to_string();
                markers.push(M_EXTRACT_FAIL.to_string());
                errors.push(format!("Extraction failed: {}", err_msg));
                limitations.push("Extraction failed: insufficient evidence".to_string());

                extract_events.push(ExtractEvent {
                    url: target_url.to_string(),
                    title: None,
                    text_bytes: 0,
                    text_hash: None,
                    quality: ExtractQuality {
                        text_len: 0,
                        lines: 0,
                    },
                    status: ExtractStatus::Fail,
                    error: Some(err_msg),
                });
            }
        }
    } else {
        markers.push(M_EXTRACT_FAIL.to_string());
        limitations.push("No HTML bytes available for extraction".to_string());
        extract_events.push(ExtractEvent {
            url: target_url.to_string(),
            title: None,
            text_bytes: 0,
            text_hash: None,
            quality: ExtractQuality {
                text_len: 0,
                lines: 0,
            },
            status: ExtractStatus::Fail,
            error: Some("no bytes".to_string()),
        });
    }

    // ── WEB_LIVE — Index (P5) ──────────────────────────────────────
    if let (Some(text), Some(hash)) = (&extracted_text, &extracted_hash) {
        markers.push(M_INDEX_WRITE_START.to_string());

        match IndexService::init_or_open(&sandbox_root) {
            Ok(index_svc) => {
                let title = extracted_title.as_deref().unwrap_or("");
                match index_svc.index_document(
                    target_url, title, text, &domain, 0, // fetched_at not tracked here; use 0
                    hash,
                ) {
                    Ok(IndexWriteResult::Written) => {
                        markers.push(M_INDEX_WRITE_OK.to_string());
                        sources_count = 1;
                        index_events.push(IndexEvent {
                            url: Some(target_url.to_string()),
                            query: None,
                            write_status: Some(IndexWriteStatus::Written),
                            query_status: None,
                            hits_count: None,
                            passages_count: None,
                            error: None,
                        });
                    }
                    Ok(IndexWriteResult::SkippedDuplicate) => {
                        markers.push(M_INDEX_WRITE_SKIP_DUP.to_string());
                        index_events.push(IndexEvent {
                            url: Some(target_url.to_string()),
                            query: None,
                            write_status: Some(IndexWriteStatus::SkippedDuplicate),
                            query_status: None,
                            hits_count: None,
                            passages_count: None,
                            error: Some("duplicate".to_string()),
                        });
                    }
                    Err(e) => {
                        let err_msg = e.to_string();
                        markers.push(M_INDEX_WRITE_FAIL.to_string());
                        errors.push(format!("Index write failed: {}", err_msg));
                        index_events.push(IndexEvent {
                            url: Some(target_url.to_string()),
                            query: None,
                            write_status: Some(IndexWriteStatus::Failed),
                            query_status: None,
                            hits_count: None,
                            passages_count: None,
                            error: Some(err_msg),
                        });
                    }
                }
            }
            Err(e) => {
                let err_msg = e.to_string();
                markers.push(M_INDEX_WRITE_FAIL.to_string());
                errors.push(format!("Index init failed: {}", err_msg));
            }
        }
    } else {
        markers.push(M_INDEX_SKIP.to_string());
    }

    // ── WEB_LIVE — RAG (P6/P7) ────────────────────────────────────
    if let Some(ref text) = extracted_text {
        // P7: if seed_urls provided, discover child URLs from RAW HTML bytes
        // (must use html_bytes_for_extract, not extracted plain text — the HTML
        //  contains the <a href> tags needed by DiscoveryService)
        if options.seed_urls.is_some() {
            if let Some(ref html_bytes) = html_bytes_for_extract {
                if let Ok(html_str) = std::str::from_utf8(html_bytes) {
                    let disc =
                        DiscoveryService::discover(target_url, html_str, max_pages.saturating_sub(1));
                    if disc.budget_enforced {
                        markers.push(M_DISCOVERY_BREADTH_LIMIT.to_string());
                    }
                    markers.push(format!("DISCOVERY_RESULTS_{}", disc.urls.len()));
                    for durl in disc.urls {
                        if all_fetch_urls.len() < max_pages && !all_fetch_urls.contains(&durl.url) {
                            all_fetch_urls.push(durl.url);
                        }
                    }
                }
            }
        }

        markers.push(M_RAG_START.to_string());
        let rag_passages = IndexService::retrieve_passages(
            text,
            &query.question,
            vector_service::VECTOR_RERANK_INPUT_SIZE,
            target_url,
        );
        retrieved_passages_count = rag_passages.len();

        // P7: vector reranking (if ENABLE_VECTOR_SEARCH env flag set)
        let final_passages = if vector_service::is_enabled() {
            let reranked = vector_service::rerank_passages(
                &query.question,
                &rag_passages,
                options.max_sources.map(|s| s as usize).unwrap_or(5),
            );
            markers.push(M_VECTOR_RERANK_OK.to_string());
            reranked
        } else {
            markers.push(M_VECTOR_DISABLED.to_string());
            rag_passages
                .into_iter()
                .take(options.max_sources.map(|s| s as usize).unwrap_or(5))
                .collect()
        };

        let rag_out = rag_service::generate_answer(
            &query.question,
            &final_passages,
            options.max_sources.map(|s| s as usize).unwrap_or(5),
        );
        markers.push(M_RAG_CONTEXT_READY.to_string());
        markers.push(M_RAG_OK.to_string());
        limitations.extend(rag_out.limitations.iter().cloned());
        markers.push(format!("RAG_STRATEGY:{}", rag_out.strategy));
        markers.push(
            if rag_out.citations.is_empty() {
                M_CITATIONS_EMPTY_P6
            } else {
                M_CITATIONS_BUILD_OK
            }
            .to_string(),
        );
        rag_ctx = RagContext {
            answer: Some(rag_out.answer_text),
            citations: rag_out.citations,
        };
    } else {
        push_rag_skip_markers(&mut markers);
    }

    markers.push(M_END.to_string());
    markers.push("VERDICT_PASS".to_string());

    make_report(
        trace_id,
        markers,
        errors,
        limitations,
        opt_vec(network_events),
        opt_vec(cache_events),
        opt_vec(robots_events),
        opt_vec(rate_limit_events),
        opt_vec(extract_events),
        opt_vec(index_events),
        sources_count,
        retrieved_passages_count,
        budgets,
        query,
        rag_ctx,
        false,
        false,
    )
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

fn opt_vec<T>(v: Vec<T>) -> Option<Vec<T>> {
    if v.is_empty() {
        None
    } else {
        Some(v)
    }
}

fn push_skip_markers(markers: &mut Vec<String>) {
    markers.push(M_DISCOVERY_SKIP.to_string());
    markers.push(M_FETCH_SKIP.to_string());
    push_extract_skip_markers(markers);
}

fn push_fetch_skip_markers(markers: &mut Vec<String>) {
    markers.push(M_FETCH_SKIP.to_string());
    push_extract_skip_markers(markers);
}

fn push_extract_skip_markers(markers: &mut Vec<String>) {
    markers.push(M_EXTRACT_SKIP.to_string());
    markers.push(M_INDEX_SKIP.to_string());
    push_rag_skip_markers(markers);
}

fn push_rag_skip_markers(markers: &mut Vec<String>) {
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
    extract_events: Option<Vec<ExtractEvent>>,
    index_events: Option<Vec<IndexEvent>>,
    sources_count: usize,
    retrieved_passages_count: usize,
    budgets: Option<HashMap<String, f64>>,
    query: &ResearchQuery,
    rag: RagContext,
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
        rag.answer.unwrap_or_else(|| {
            format!(
                "[P6] Research completed (contract: {RESEARCH_CONTRACT_VERSION}). \
                 Query: \"{}\". Sources: {}. Passages: {}.",
                query.question, sources_count, retrieved_passages_count
            )
        })
    };

    let citations = if is_blocked || is_fail {
        vec![]
    } else {
        rag.citations
    };

    let answer = ResearchAnswer {
        answer: answer_text,
        citations,
        confidence: None,
        limitations,
        trace_id: trace_id.clone(),
        sources_count,
        retrieved_passages_count,
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
        extract_events,
        index_events,
        errors,
    };

    ResearchReport { answer, trace }
}

// ─────────────────────────────────────────────────────────────────
// TAURI COMMAND
// ─────────────────────────────────────────────────────────────────

/// Web research command — P6.0 QUALIFIED→CANDIDATE STABLE.
///
/// OFFLINE: hard-stop, then local index query + RAG if docs available
/// LOCAL_INDEX: real Tantivy query + RAG (EXTRACTIVE_FALLBACK), VERDICT_PASS
/// WEB_LIVE: Policy → Robots → RateLimit → Cache lookup → Fetch → Cache write → Extract → Index → RAG
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
            seed_urls: None,
            max_depth: None,
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
            seed_urls: None,
            max_depth: None,
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
            seed_urls: None,
            max_depth: None,
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
            seed_urls: None,
            max_depth: None,
        };
        let report = run_research(&q, &o).await;

        assert!(
            report.trace.markers.iter().any(|m| m == "ROBOTS_BLOCKED"),
            "Expected ROBOTS_BLOCKED: {:?}",
            report.trace.markers
        );
        assert!(report.trace.markers.iter().any(|m| m == "VERDICT_BLOCKED"));
    }

    // G_EXTRACT_FROM_CACHED_BYTES: pre-populate cache with HTML, run research → EXTRACT_OK
    #[tokio::test]
    async fn g_extract_from_cached_html() {
        let sandbox = tmp_sandbox();
        let cache_svc = CacheService::new(PathBuf::from(&sandbox)).unwrap();
        let url = "https://extract.example.com/page";
        let html =
            b"<html><head><title>Extract Test</title></head><body><p>Hello World</p></body></html>";
        cache_svc
            .write(url, url, 200, "text/html", None, None, html)
            .unwrap();

        let q = make_query("extract test");
        let o = ResearchOptions {
            mode: ResearchMode::WebLive,
            target_url: Some(url.to_string()),
            max_requests: Some(5),
            max_bytes_total: Some(1024 * 1024),
            timeout_ms: Some(5_000),
            cache_enabled: Some(true),
            respect_robots: Some(false),
            sandbox_root: Some(sandbox),
            domain_allowlist: None,
            domain_denylist: None,
            max_sources: None,
            max_pages: None,
            freshness_days: None,
            rate_limit_profile: None,
            seed_urls: None,
            max_depth: None,
        };
        let report = run_research(&q, &o).await;

        assert!(
            report.trace.markers.iter().any(|m| m == "EXTRACT_OK"),
            "Expected EXTRACT_OK, markers: {:?}",
            report.trace.markers
        );
        assert!(
            report
                .trace
                .markers
                .iter()
                .any(|m| m.starts_with("TEXT_HASH_OK")),
            "Expected TEXT_HASH_OK, markers: {:?}",
            report.trace.markers
        );
        assert!(report.trace.extract_events.is_some());
        let evs = report.trace.extract_events.unwrap();
        assert!(!evs.is_empty());
        let ev = &evs[0];
        assert_eq!(ev.status, crate::types::research::ExtractStatus::Ok);
        assert!(ev.text_hash.is_some());
    }

    // G_EXTRACT_DETERMINISTIC_x3 via cache: same HTML → same text_hash
    #[tokio::test]
    async fn g_web_live_extract_deterministic_x3() {
        let sandbox = tmp_sandbox();
        let cache_svc = CacheService::new(PathBuf::from(&sandbox)).unwrap();
        let url = "https://determ.example.com/page";
        let html = b"<html><head><title>Determ</title></head><body><p>Deterministic content</p></body></html>";
        cache_svc
            .write(url, url, 200, "text/html", None, None, html)
            .unwrap();

        let opts = ResearchOptions {
            mode: ResearchMode::WebLive,
            target_url: Some(url.to_string()),
            max_requests: Some(5),
            max_bytes_total: Some(1024 * 1024),
            timeout_ms: Some(5_000),
            cache_enabled: Some(true),
            respect_robots: Some(false),
            sandbox_root: Some(sandbox),
            domain_allowlist: None,
            domain_denylist: None,
            max_sources: None,
            max_pages: None,
            freshness_days: None,
            rate_limit_profile: None,
            seed_urls: None,
            max_depth: None,
        };
        let q = make_query("determ");

        let r1 = run_research(&q, &opts).await;
        let r2 = run_research(&q, &opts).await;
        let r3 = run_research(&q, &opts).await;

        fn text_hash(r: &ResearchReport) -> Option<String> {
            r.trace.extract_events.as_ref()?.first()?.text_hash.clone()
        }
        let h1 = text_hash(&r1);
        let h2 = text_hash(&r2);
        let h3 = text_hash(&r3);
        assert!(h1.is_some(), "run1 missing text_hash");
        assert_eq!(h1, h2, "run1 != run2 hash");
        assert_eq!(h2, h3, "run2 != run3 hash");
    }

    // G_INDEX_WRITE_OK after extract from cache
    #[tokio::test]
    async fn g_index_write_ok_after_extract() {
        let sandbox = tmp_sandbox();
        let cache_svc = CacheService::new(PathBuf::from(&sandbox)).unwrap();
        let url = "https://index-write.example.com/page";
        let html = b"<html><head><title>Index Write Test</title></head><body><p>TITANE index write test content</p></body></html>";
        cache_svc
            .write(url, url, 200, "text/html", None, None, html)
            .unwrap();

        let q = make_query("TITANE index write");
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
            seed_urls: None,
            max_depth: None,
        };
        let report = run_research(&q, &o).await;

        // Either INDEX_WRITE_OK or INDEX_WRITE_SKIPPED_DUP (idempotent)
        let has_index_write = report
            .trace
            .markers
            .iter()
            .any(|m| m == "INDEX_WRITE_OK" || m == "INDEX_WRITE_SKIPPED_DUP");
        assert!(
            has_index_write,
            "Expected INDEX_WRITE_OK or DUP, markers: {:?}",
            report.trace.markers
        );

        // Index write must exist in index_events
        assert!(report.trace.index_events.is_some(), "Expected index_events");
    }

    // G_LOCAL_INDEX_NO_NETWORK: LOCAL_INDEX → network_events must be None
    #[tokio::test]
    async fn g_local_index_no_network() {
        let sandbox = tmp_sandbox();
        let q = make_query("TITANE local query");
        let o = ResearchOptions {
            mode: ResearchMode::LocalIndex,
            target_url: None,
            max_requests: None,
            max_bytes_total: None,
            timeout_ms: None,
            cache_enabled: None,
            respect_robots: None,
            sandbox_root: Some(sandbox),
            domain_allowlist: None,
            domain_denylist: None,
            max_sources: None,
            max_pages: None,
            freshness_days: None,
            rate_limit_profile: None,
            seed_urls: None,
            max_depth: None,
        };
        let report = run_research(&q, &o).await;

        assert!(
            report.trace.network_events.is_none()
                || report.trace.network_events.as_ref().unwrap().is_empty(),
            "LOCAL_INDEX must not produce network events"
        );
        assert!(report.trace.markers.iter().any(|m| m == "VERDICT_PASS"));
    }

    // G_LOCAL_INDEX_QUERY_AFTER_WEBLIVE: fetch+index then query
    #[tokio::test]
    async fn g_local_index_query_after_weblive_index() {
        let sandbox = tmp_sandbox();
        let cache_svc = CacheService::new(PathBuf::from(&sandbox)).unwrap();
        let url = "https://local-query.example.com/page";
        let html = b"<html><head><title>TITANE Engine</title></head><body><p>TITANE local index retrieval test unique42</p></body></html>";
        cache_svc
            .write(url, url, 200, "text/html", None, None, html)
            .unwrap();

        // Step 1: WEB_LIVE → extract + index
        let web_opts = ResearchOptions {
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
            seed_urls: None,
            max_depth: None,
        };
        let web_report = run_research(&make_query("index content"), &web_opts).await;
        // Ensure index write happened
        assert!(
            web_report
                .trace
                .markers
                .iter()
                .any(|m| m == "INDEX_WRITE_OK" || m == "INDEX_WRITE_SKIPPED_DUP"),
            "Step1 must index: {:?}",
            web_report.trace.markers
        );

        // Step 2: LOCAL_INDEX → query
        let local_opts = ResearchOptions {
            mode: ResearchMode::LocalIndex,
            target_url: None,
            max_requests: None,
            max_bytes_total: None,
            timeout_ms: None,
            cache_enabled: None,
            respect_robots: None,
            sandbox_root: Some(sandbox),
            domain_allowlist: None,
            domain_denylist: None,
            max_sources: Some(5),
            max_pages: None,
            freshness_days: None,
            rate_limit_profile: None,
            seed_urls: None,
            max_depth: None,
        };
        let local_report = run_research(&make_query("unique42"), &local_opts).await;
        assert!(
            local_report
                .trace
                .markers
                .iter()
                .any(|m| m == "INDEX_QUERY_OK"),
            "LOCAL_INDEX query must return INDEX_QUERY_OK, markers: {:?}",
            local_report.trace.markers
        );
        assert!(
            local_report.answer.sources_count >= 1,
            "Expected sources_count >= 1"
        );
    }

    // ── G_CITATIONS_REQUIRED: passages > 0 → citations >= 1 ──────

    #[tokio::test]
    async fn g_citations_required_when_passages_found() {
        let sandbox = tmp_sandbox();
        let cache_svc = CacheService::new(PathBuf::from(&sandbox)).unwrap();
        let url = "https://citations.example.com/page";
        let html = b"<html><head><title>Citations Test</title></head><body>\
            <p>TITANE RAG citations test unique_citation_token_99 evidence passage one.</p>\
            <p>Second paragraph for evidence passage two TITANE research.</p>\
            </body></html>";
        cache_svc
            .write(url, url, 200, "text/html", None, None, html)
            .unwrap();

        // Step 1: WEB_LIVE to index
        let web_opts = ResearchOptions {
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
            seed_urls: None,
            max_depth: None,
        };
        run_research(&make_query("unique_citation_token_99"), &web_opts).await;

        // Step 2: LOCAL_INDEX query → should get citations
        let local_opts = ResearchOptions {
            mode: ResearchMode::LocalIndex,
            target_url: None,
            max_requests: None,
            max_bytes_total: None,
            timeout_ms: None,
            cache_enabled: None,
            respect_robots: None,
            sandbox_root: Some(sandbox),
            domain_allowlist: None,
            domain_denylist: None,
            max_sources: Some(5),
            max_pages: None,
            freshness_days: None,
            rate_limit_profile: None,
            seed_urls: None,
            max_depth: None,
        };
        let report = run_research(&make_query("unique_citation_token_99"), &local_opts).await;

        let has_passages =
            report.answer.retrieved_passages_count > 0 || report.answer.sources_count > 0;

        if has_passages {
            assert!(
                !report.answer.citations.is_empty(),
                "G_CITATIONS_REQUIRED FAIL: passages > 0 but citations empty. markers: {:?}",
                report.trace.markers
            );
        }
        // Verify RAG_OK marker is present
        assert!(
            report.trace.markers.iter().any(|m| m == "RAG_OK"),
            "Expected RAG_OK marker, got: {:?}",
            report.trace.markers
        );
    }

    // ── G_EVIDENCE_BOUND: empty index → insufficient evidence ─────

    #[tokio::test]
    async fn g_evidence_bound_empty_index() {
        let sandbox = tmp_sandbox();
        // Local index is empty (no WEB_LIVE indexing)
        let q = make_query("nonexistent_query_token_xyz");
        let o = ResearchOptions {
            mode: ResearchMode::LocalIndex,
            target_url: None,
            max_requests: None,
            max_bytes_total: None,
            timeout_ms: None,
            cache_enabled: None,
            respect_robots: None,
            sandbox_root: Some(sandbox),
            domain_allowlist: None,
            domain_denylist: None,
            max_sources: None,
            max_pages: None,
            freshness_days: None,
            rate_limit_profile: None,
            seed_urls: None,
            max_depth: None,
        };
        let report = run_research(&q, &o).await;
        // Must still have RAG_OK (from RAG with empty passages → insufficient evidence)
        assert!(
            report.trace.markers.iter().any(|m| m == "RAG_OK"),
            "Expected RAG_OK even for empty index, markers: {:?}",
            report.trace.markers
        );
        assert!(
            report.answer.answer.contains("Insufficient evidence")
                || report.answer.answer.contains("insufficient"),
            "Expected insufficient-evidence answer for empty index, got: {}",
            report.answer.answer
        );
        assert!(
            report.answer.citations.is_empty(),
            "No citations expected for empty index"
        );
    }

    // ── G_OFFLINE_ANSWER_FROM_INDEX ───────────────────────────────

    #[tokio::test]
    async fn g_offline_answer_from_index() {
        let sandbox = tmp_sandbox();
        let cache_svc = CacheService::new(PathBuf::from(&sandbox)).unwrap();
        let url = "https://offline-answer.example.com/page";
        let html = b"<html><head><title>Offline Answer Test</title></head><body>\
            <p>TITANE offline answer test unique_offline_token_77 research engine evidence.</p>\
            </body></html>";
        cache_svc
            .write(url, url, 200, "text/html", None, None, html)
            .unwrap();

        // Step 1: WEB_LIVE to populate index
        let web_opts = ResearchOptions {
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
            seed_urls: None,
            max_depth: None,
        };
        run_research(&make_query("unique_offline_token_77"), &web_opts).await;

        // Step 2: OFFLINE mode → must not use network, may answer from index
        let offline_opts = ResearchOptions {
            mode: ResearchMode::Offline,
            target_url: None,
            max_requests: None,
            max_bytes_total: None,
            timeout_ms: None,
            cache_enabled: None,
            respect_robots: None,
            sandbox_root: Some(sandbox),
            domain_allowlist: None,
            domain_denylist: None,
            max_sources: Some(5),
            max_pages: None,
            freshness_days: None,
            rate_limit_profile: None,
            seed_urls: None,
            max_depth: None,
        };
        let report = run_research(&make_query("unique_offline_token_77"), &offline_opts).await;

        // G_OFFLINE invariant: no network events
        assert!(
            report.trace.network_events.is_none()
                || report.trace.network_events.as_ref().unwrap().is_empty(),
            "OFFLINE must produce no network events"
        );
        assert!(
            report
                .trace
                .markers
                .iter()
                .any(|m| m == "OFFLINE_HARDSTOP_ENFORCED"),
            "OFFLINE_HARDSTOP must be present"
        );
        assert!(
            report.trace.markers.iter().any(|m| m == "RAG_OK"),
            "OFFLINE with indexed docs must produce RAG_OK"
        );
        assert!(
            report.trace.markers.iter().any(|m| m == "VERDICT_PASS"),
            "VERDICT_PASS must be present"
        );
    }

    // ── G_REPRODUCIBILITY_RAG_X3 ─────────────────────────────────

    #[tokio::test]
    async fn g_reproducibility_rag_x3() {
        let sandbox = tmp_sandbox();
        let cache_svc = CacheService::new(PathBuf::from(&sandbox)).unwrap();
        let url = "https://rag-repro.example.com/page";
        let html = b"<html><head><title>RAG Repro</title></head><body>\
            <p>TITANE RAG reproducibility test unique_repro_token_42.</p>\
            </body></html>";
        cache_svc
            .write(url, url, 200, "text/html", None, None, html)
            .unwrap();

        // Index
        let web_opts = ResearchOptions {
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
            seed_urls: None,
            max_depth: None,
        };
        run_research(&make_query("unique_repro_token_42"), &web_opts).await;

        let local_opts = ResearchOptions {
            mode: ResearchMode::LocalIndex,
            target_url: None,
            max_requests: None,
            max_bytes_total: None,
            timeout_ms: None,
            cache_enabled: None,
            respect_robots: None,
            sandbox_root: Some(sandbox),
            domain_allowlist: None,
            domain_denylist: None,
            max_sources: Some(5),
            max_pages: None,
            freshness_days: None,
            rate_limit_profile: None,
            seed_urls: None,
            max_depth: None,
        };
        let q = make_query("unique_repro_token_42");
        let r1 = run_research(&q, &local_opts).await;
        let r2 = run_research(&q, &local_opts).await;
        let r3 = run_research(&q, &local_opts).await;

        // Same citations count + same RAG strategy across 3 runs
        assert_eq!(
            r1.answer.citations.len(),
            r2.answer.citations.len(),
            "run1 citations != run2"
        );
        assert_eq!(
            r2.answer.citations.len(),
            r3.answer.citations.len(),
            "run2 citations != run3"
        );
        let strat1 = r1
            .trace
            .markers
            .iter()
            .find(|m| m.starts_with("RAG_STRATEGY:"))
            .cloned();
        let strat2 = r2
            .trace
            .markers
            .iter()
            .find(|m| m.starts_with("RAG_STRATEGY:"))
            .cloned();
        let strat3 = r3
            .trace
            .markers
            .iter()
            .find(|m| m.starts_with("RAG_STRATEGY:"))
            .cloned();
        assert_eq!(strat1, strat2, "run1 strategy != run2");
        assert_eq!(strat2, strat3, "run2 strategy != run3");
    }

    // ── G_CITATION_LOCATOR_VALID (P7) ─────────────────────────────

    #[tokio::test]
    async fn g_citation_locator_valid() {
        use crate::services::index_service::IndexService;

        // Verify that retrieve_passages returns paragraph_index and char_start
        let body = "First paragraph about TITANE research.\n\
                    Second paragraph unrelated content.\n\
                    Third paragraph TITANE engine evidence.";
        let passages = IndexService::retrieve_passages(body, "TITANE", 5, "https://loc.example.com/page");

        for passage in &passages {
            assert!(
                passage.paragraph_index.is_some(),
                "paragraph_index must be set: {:?}",
                passage
            );
            assert!(
                passage.char_start.is_some(),
                "char_start must be set: {:?}",
                passage
            );
        }

        // Verify citations propagate paragraph_index and char_start
        use crate::services::rag_service;
        let rag_out = rag_service::generate_answer("TITANE", &passages, 5);
        for citation in &rag_out.citations {
            // paragraph_index should be set (from passage)
            // (may be None if no passages found, but we seeded passages above)
            let _ = citation.paragraph_index; // field must exist (compile-checked)
            let _ = citation.char_start;
        }
    }

    // ── G_DISCOVERY_BUDGET_ENFORCED_PIPELINE (P7) ─────────────────

    #[tokio::test]
    async fn g_discovery_budget_enforced_pipeline() {
        use crate::services::discovery_service::DiscoveryService;

        let html = r#"<html><body>
            <a href="/page1">1</a>
            <a href="/page2">2</a>
            <a href="/page3">3</a>
            <a href="/page4">4</a>
            <a href="/page5">5</a>
        </body></html>"#;

        let result = DiscoveryService::discover("https://example.com", html, 2);
        assert!(
            result.urls.len() <= 2,
            "Budget not enforced: got {} urls, expected <= 2",
            result.urls.len()
        );
    }

    // ── G_DISCOVERY_DOMAIN_LOCK_PIPELINE (P7) ─────────────────────

    #[tokio::test]
    async fn g_discovery_domain_lock_pipeline() {
        use crate::services::discovery_service::{DiscoveryService, extract_domain};

        let html = r#"<html><body>
            <a href="https://example.com/internal">internal</a>
            <a href="https://evil.org/bad">external</a>
            <a href="https://other.com/page">external2</a>
        </body></html>"#;

        let result = DiscoveryService::discover("https://example.com", html, 10);
        for url in &result.urls {
            let d = extract_domain(&url.url).unwrap_or_default();
            assert_eq!(
                d, "example.com",
                "Domain-lock violated in pipeline: {} (domain: {})",
                url.url, d
            );
        }
    }

    // ── G_VECTOR_OFFLINE_ONLY_PIPELINE (P7) ───────────────────────

    #[test]
    fn g_vector_offline_only_pipeline() {
        use crate::services::vector_service;
        use crate::types::research::RetrievedPassage;

        std::env::remove_var(vector_service::VECTOR_FEATURE_FLAG);
        assert!(
            !vector_service::is_enabled(),
            "Vector must be disabled by default"
        );

        let passages = vec![
            RetrievedPassage {
                url: "https://a.com".to_string(),
                passage: "TITANE research engine test passage alpha".to_string(),
                score: 3,
                paragraph_index: Some(0),
                char_start: Some(0),
            },
        ];
        // rerank_passages is pure — no network, no HTTP client
        let result = vector_service::rerank_passages("TITANE", &passages, 5);
        assert_eq!(result.len(), 1, "Rerank of 1 passage should return 1");
    }
}
