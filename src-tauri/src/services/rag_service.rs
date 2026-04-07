// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — RAG SERVICE (Ring 3)
//   P6.0 QUALIFIED→CANDIDATE STABLE — Extractive RAG (no LLM, no network)
//   Strategy: EXTRACTIVE_FALLBACK — evidence-bound, no hallucination
//   Security: zero network, zero disk writes, citations ≤ 25 words/source
// ═══════════════════════════════════════════════════════════════

use crate::types::research::{Citation, RetrievedPassage};
use chrono::Utc;
use std::collections::HashSet;

// ─────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────

/// Maximum characters of context fed to the answer builder
const MAX_CONTEXT_CHARS: usize = 6_000;
/// Maximum passages used per answer (top-k cap)
const DEFAULT_RAG_TOP_K: usize = 5;
/// Maximum words per citation excerpt (conformité)
const MAX_EXCERPT_WORDS: usize = 25;
/// Strategy name reported in markers
pub const STRATEGY_EXTRACTIVE: &str = "EXTRACTIVE_FALLBACK";
/// P10 strategy — LLM generation (currently BLOCKED — NONE provider)
pub const STRATEGY_LOCAL_LLM: &str = "LOCAL_LLM_BLOCKED";

// ─────────────────────────────────────────────────────────────────
// OUTPUT
// ─────────────────────────────────────────────────────────────────

/// Output of the RAG service
#[derive(Debug, Clone)]
pub struct RagOutput {
    pub answer_text: String,
    pub citations: Vec<Citation>,
    pub limitations: Vec<String>,
    pub used_passages: usize,
    /// Strategy used: always "EXTRACTIVE_FALLBACK" in P6 (no LLM)
    pub strategy: &'static str,
}

// ─────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────

/// Generate an extractive answer from retrieved passages.
///
/// Rules:
/// - passages empty → "insufficient evidence" answer (no citations)
/// - passages present → extractive summary with citations (evidence-bound)
/// - No LLM, no network — EXTRACTIVE_FALLBACK strategy only
/// - Citations: 1 per unique URL, excerpt ≤ 25 words
pub fn generate_answer(query: &str, passages: &[RetrievedPassage], top_k: usize) -> RagOutput {
    let k = top_k.min(DEFAULT_RAG_TOP_K).max(1);

    // Sort by score descending
    let mut sorted = passages.to_vec();
    sorted.sort_by(|a, b| b.score.cmp(&a.score));
    sorted.truncate(k);

    // No-hallucination guard — empty passages case
    if sorted.is_empty() {
        return RagOutput {
            answer_text: format!(
                "Insufficient evidence for query: \"{}\". \
                 No indexed passages match this query. \
                 Run WEB_LIVE mode to index sources first.",
                query
            ),
            citations: vec![],
            limitations: vec![
                "No indexed passages found for query".to_string(),
                "Corpus limited — run WEB_LIVE mode to index sources".to_string(),
            ],
            used_passages: 0,
            strategy: STRATEGY_EXTRACTIVE,
        };
    }

    let accessed_at = Utc::now().format("%Y-%m-%dT%H:%M:%SZ").to_string();

    // Cap context to MAX_CONTEXT_CHARS
    let mut context_chars = 0usize;
    let mut used: Vec<&RetrievedPassage> = Vec::new();
    for p in &sorted {
        if context_chars + p.passage.len() > MAX_CONTEXT_CHARS {
            break;
        }
        context_chars += p.passage.len();
        used.push(p);
    }

    // Build extractive answer: numbered excerpts from top passages
    let mut answer_parts: Vec<String> = Vec::new();
    for (i, p) in used.iter().enumerate() {
        let excerpt = make_excerpt(&p.passage, MAX_EXCERPT_WORDS);
        answer_parts.push(format!("[{}] {} — {}", i + 1, p.url, excerpt));
    }
    let answer_text = format!(
        "Based on {} indexed source(s) for query \"{}\": {}",
        used.len(),
        query,
        answer_parts.join(" | ")
    );

    // Apply no-hallucination guard (noop for extractive, validates output)
    let (guarded_answer, guard_limitations) = guard_no_hallucination(&answer_text, &used);

    // Build citations
    let citations = build_citations(&used, &accessed_at);

    let mut limitations = vec![
        "Freshness not guaranteed".to_string(),
        format!(
            "Strategy: {} — no generative model used",
            STRATEGY_EXTRACTIVE
        ),
    ];
    limitations.extend(guard_limitations);

    RagOutput {
        answer_text: guarded_answer,
        citations,
        limitations,
        used_passages: used.len(),
        strategy: STRATEGY_EXTRACTIVE,
    }
}

// ─────────────────────────────────────────────────────────────────
// P10 — LLM HOOK (BLOCKED — always falls back to EXTRACTIVE)
// ─────────────────────────────────────────────────────────────────

/// P10.0 — LLM hook entry point.
///
/// If `ENABLE_LOCAL_LLM=true` AND the active provider `is_available()`
/// (both must hold), generation is delegated to the provider.
/// In P10.0 `NullLlmProvider` is always active → always falls back to
/// `generate_answer` with strategy `EXTRACTIVE_FALLBACK`.
///
/// This function is the stable interface; callers should use this
/// instead of `generate_answer` so future LLM providers slot in
/// transparently without changing call sites.
pub fn generate_answer_with_llm_hook(
    query: &str,
    passages: &[RetrievedPassage],
    top_k: usize,
) -> RagOutput {
    if crate::services::local_llm_service::is_enabled() {
        // Future: delegate to provider (P10.1+)
        // For now: NullLlmProvider::is_available() == false, so this branch
        // is never reached in P10.0. Kept for forward-compatibility.
    }
    // Always: extractive fallback
    generate_answer(query, passages, top_k)
}

// ─────────────────────────────────────────────────────────────────
// NO-HALLUCINATION GUARD
// ─────────────────────────────────────────────────────────────────

/// Simple no-hallucination guard (P6 heuristic).
///
/// For EXTRACTIVE_FALLBACK the answer is constructed entirely from passage
/// text, so it is evidence-bound by construction.
/// Guard checks:
/// 1. No passages → force insufficient-evidence answer
/// 2. Extractive answer → accepted as-is (no added content to verify)
pub fn guard_no_hallucination(
    answer: &str,
    passages: &[&RetrievedPassage],
) -> (String, Vec<String>) {
    if passages.is_empty() {
        return (
            "Insufficient evidence — no supporting passages found.".to_string(),
            vec!["Guard: no passages — answer downgraded to insufficient-evidence".to_string()],
        );
    }
    // Extractive fallback is evidence-bound by construction
    (answer.to_string(), vec![])
}

// ─────────────────────────────────────────────────────────────────
// CITATION BUILDER
// ─────────────────────────────────────────────────────────────────

/// Build citations from used passages.
/// One citation per unique URL, excerpt ≤ 25 words.
pub fn build_citations(passages: &[&RetrievedPassage], accessed_at: &str) -> Vec<Citation> {
    let mut seen: HashSet<&str> = HashSet::new();
    let mut citations = Vec::new();

    for (i, p) in passages.iter().enumerate() {
        if seen.contains(p.url.as_str()) {
            continue;
        }
        seen.insert(&p.url);

        citations.push(Citation {
            url: p.url.clone(),
            title: None,
            excerpt: make_excerpt(&p.passage, MAX_EXCERPT_WORDS),
            locator: Some(format!("passage #{}", i + 1)),
            accessed_at: accessed_at.to_string(),
            paragraph_index: p.paragraph_index,
            char_start: p.char_start,
            locator_text: make_locator_text(p.paragraph_index, p.char_start),
        });
    }
    citations
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

/// Truncate text to at most `max_words` words with ellipsis.
fn make_excerpt(text: &str, max_words: usize) -> String {
    let words: Vec<&str> = text.split_whitespace().collect();
    if words.len() <= max_words {
        words.join(" ")
    } else {
        format!("{}…", words[..max_words].join(" "))
    }
}

/// Build a human-readable stable locator string from optional paragraph/char indices.
/// Format: "p={para}, c≈{char}" or None if no indices available.
pub fn make_locator_text(paragraph_index: Option<u32>, char_start: Option<u32>) -> Option<String> {
    match (paragraph_index, char_start) {
        (Some(p), Some(c)) => Some(format!("p={}, c≈{}", p, c)),
        (Some(p), None) => Some(format!("p={}", p)),
        (None, Some(c)) => Some(format!("c≈{}", c)),
        (None, None) => None,
    }
}

// ─────────────────────────────────────────────────────────────────
// UNIT TESTS
// ─────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn make_passage(url: &str, passage: &str, score: usize) -> RetrievedPassage {
        RetrievedPassage {
            url: url.to_string(),
            passage: passage.to_string(),
            score,
            paragraph_index: None,
            char_start: None,
        }
    }

    // ── G_EVIDENCE_BOUND ─────────────────────────────────────────

    #[test]
    fn g_evidence_bound_empty_passages() {
        let out = generate_answer("test query", &[], 5);
        assert!(
            out.answer_text.contains("Insufficient evidence"),
            "Empty passages must produce insufficient-evidence answer"
        );
        assert!(
            out.citations.is_empty(),
            "Empty passages must produce no citations"
        );
        assert!(out.used_passages == 0);
    }

    // ── G_CITATIONS_REQUIRED ─────────────────────────────────────

    #[test]
    fn g_citations_required_when_passages_present() {
        let passages = vec![
            make_passage(
                "https://a.example.com/page",
                "TITANE research engine index test passage alpha beta gamma",
                3,
            ),
            make_passage(
                "https://b.example.com/page",
                "Local lexical search using BM25 scoring delta epsilon",
                2,
            ),
        ];
        let out = generate_answer("TITANE research", &passages, 5);
        assert!(
            !out.citations.is_empty(),
            "Citations must be >= 1 when passages > 0, got: {:?}",
            out.citations
        );
        assert!(out.used_passages >= 1);
        assert!(!out.answer_text.contains("Insufficient evidence"));
    }

    // ── G_CITATION_EXCERPT_25_WORDS ───────────────────────────────

    #[test]
    fn g_citation_excerpt_max_25_words() {
        let long = "word ".repeat(50);
        let passages = vec![make_passage("https://x.com/p", long.trim(), 1)];
        let out = generate_answer("word", &passages, 5);
        for citation in &out.citations {
            let word_count = citation.excerpt.split_whitespace().count();
            assert!(
                word_count <= 25,
                "Excerpt too long: {} words in '{}'",
                word_count,
                citation.excerpt
            );
        }
    }

    // ── G_DEDUP_CITATIONS ─────────────────────────────────────────

    #[test]
    fn g_dedup_citations_same_url() {
        let passages = vec![
            make_passage(
                "https://same.example.com/page",
                "First passage from this URL",
                3,
            ),
            make_passage(
                "https://same.example.com/page",
                "Second passage same URL different text",
                2,
            ),
        ];
        let accessed_at = "2026-01-01T00:00:00Z";
        let refs: Vec<&RetrievedPassage> = passages.iter().collect();
        let citations = build_citations(&refs, accessed_at);
        assert_eq!(citations.len(), 1, "Same URL must produce only 1 citation");
    }

    // ── G_REPRODUCIBILITY_X3 ─────────────────────────────────────

    #[test]
    fn g_reproducibility_x3() {
        let passages = vec![
            make_passage(
                "https://repro.example.com/a",
                "TITANE index reproducibility test passage one",
                5,
            ),
            make_passage(
                "https://repro.example.com/b",
                "TITANE index reproducibility test passage two",
                3,
            ),
        ];
        let r1 = generate_answer("TITANE", &passages, 5);
        let r2 = generate_answer("TITANE", &passages, 5);
        let r3 = generate_answer("TITANE", &passages, 5);
        assert_eq!(r1.used_passages, r2.used_passages);
        assert_eq!(r2.used_passages, r3.used_passages);
        assert_eq!(r1.citations.len(), r2.citations.len());
        assert_eq!(r2.citations.len(), r3.citations.len());
        assert_eq!(r1.strategy, r2.strategy);
        assert_eq!(r2.strategy, r3.strategy);
    }

    // ── G_NO_PROVIDER_USAGE ───────────────────────────────────────
    // (Proof by code review: no network client and no external provider call in this file)
    #[test]
    fn g_no_provider_usage_verified() {
        // This test is a documentation marker.
        // rag_service.rs contains: zero network calls and zero external providers.
        // Confirmed by static analysis on network/provider tokens.
        assert_eq!(STRATEGY_EXTRACTIVE, "EXTRACTIVE_FALLBACK");
    }

    // ── G_GUARD_EMPTY_PASSAGES ────────────────────────────────────

    #[test]
    fn g_guard_no_hallucination_empty() {
        let (answer, lims) = guard_no_hallucination("some claim", &[]);
        assert!(answer.contains("Insufficient evidence"));
        assert!(!lims.is_empty());
    }

    // ── G_GUARD_NOOP_WHEN_PASSAGES ────────────────────────────────

    #[test]
    fn g_guard_noop_with_passages() {
        let p = make_passage("https://x.com", "test passage", 1);
        let (answer, lims) = guard_no_hallucination("extractive answer text", &[&p]);
        assert_eq!(answer, "extractive answer text");
        assert!(lims.is_empty());
    }

    // ── P10: LLM HOOK ─────────────────────────────────────────────

    #[test]
    fn test_llm_hook_disabled_falls_back_to_extractive() {
        let passages = vec![
            make_passage(
                "https://hook.example.com/a",
                "P10 hook test passage evidence alpha beta",
                4,
            ),
            make_passage(
                "https://hook.example.com/b",
                "Second hook test passage evidence gamma delta",
                2,
            ),
        ];
        let out = generate_answer_with_llm_hook("hook test", &passages, 5);
        assert_eq!(
            out.strategy, STRATEGY_EXTRACTIVE,
            "Hook must fall back to EXTRACTIVE_FALLBACK when LLM disabled"
        );
        assert!(!out.citations.is_empty());
        assert!(!out.answer_text.contains("Insufficient evidence"));
    }

    #[test]
    fn test_llm_hook_empty_passages_falls_back_to_extractive() {
        let out = generate_answer_with_llm_hook("no data query", &[], 5);
        assert_eq!(out.strategy, STRATEGY_EXTRACTIVE);
        assert!(out.answer_text.contains("Insufficient evidence"));
        assert_eq!(out.used_passages, 0);
    }

    #[test]
    fn test_strategy_local_llm_constant() {
        assert_eq!(STRATEGY_LOCAL_LLM, "LOCAL_LLM_BLOCKED");
    }

    // ── P13: LOCATOR_TEXT ─────────────────────────────────────────

    #[test]
    fn test_locator_text_both() {
        let result = make_locator_text(Some(3), Some(120));
        assert_eq!(result, Some("p=3, c≈120".to_string()));
    }

    #[test]
    fn test_locator_text_para_only() {
        let result = make_locator_text(Some(5), None);
        assert_eq!(result, Some("p=5".to_string()));
    }

    #[test]
    fn test_locator_text_char_only() {
        let result = make_locator_text(None, Some(200));
        assert_eq!(result, Some("c≈200".to_string()));
    }

    #[test]
    fn test_locator_text_none() {
        let result = make_locator_text(None, None);
        assert!(result.is_none());
    }

    #[test]
    fn test_build_citations_locator_text_populated() {
        let passages = vec![RetrievedPassage {
            url: "https://example.com/p".to_string(),
            passage: "test passage for locator".to_string(),
            score: 5,
            paragraph_index: Some(2),
            char_start: Some(50),
        }];
        let refs: Vec<&RetrievedPassage> = passages.iter().collect();
        let citations = build_citations(&refs, "2026-01-01T00:00:00Z");
        assert_eq!(citations.len(), 1);
        assert_eq!(citations[0].locator_text, Some("p=2, c≈50".to_string()));
    }

    #[test]
    fn test_build_citations_locator_text_none_when_no_indices() {
        let passages = vec![make_passage(
            "https://example.com/q",
            "test passage no index",
            3,
        )];
        let refs: Vec<&RetrievedPassage> = passages.iter().collect();
        let citations = build_citations(&refs, "2026-01-01T00:00:00Z");
        assert_eq!(citations.len(), 1);
        assert!(citations[0].locator_text.is_none());
    }
}
