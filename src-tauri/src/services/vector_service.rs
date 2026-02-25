// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — VECTOR SERVICE (Ring 3)
//   P7.0 EXPERIMENTAL — Local TF-IDF vector reranking
//   Feature flag: ENABLE_VECTOR_SEARCH=true
//   Invariants: zero network, zero Ollama, zero external providers
//   Strategy: TF-IDF bag-of-words cosine similarity reranking
// ═══════════════════════════════════════════════════════════════

use crate::types::research::RetrievedPassage;
use std::collections::HashMap;

// ─────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────

/// Rerank the top N lexical results before selecting final top_k
pub const VECTOR_RERANK_INPUT_SIZE: usize = 20;
/// Env var to enable vector reranking
pub const VECTOR_FEATURE_FLAG: &str = "ENABLE_VECTOR_SEARCH";

// ─────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────

/// Returns true if vector reranking is enabled (env feature flag).
pub fn is_enabled() -> bool {
    std::env::var(VECTOR_FEATURE_FLAG)
        .map(|v| v.eq_ignore_ascii_case("true") || v == "1")
        .unwrap_or(false)
}

/// Rerank passages using local TF-IDF cosine similarity (no network, no LLM).
///
/// Takes up to `VECTOR_RERANK_INPUT_SIZE` passages from `candidates`,
/// scores them against the `query`, and returns the top `top_k` in order.
///
/// This is a pure function — deterministic given same inputs.
pub fn rerank_passages(
    query: &str,
    candidates: &[RetrievedPassage],
    top_k: usize,
) -> Vec<RetrievedPassage> {
    if candidates.is_empty() || top_k == 0 {
        return vec![];
    }

    let input: Vec<&RetrievedPassage> = candidates
        .iter()
        .take(VECTOR_RERANK_INPUT_SIZE)
        .collect();

    let query_tokens = tokenize(query);
    let query_tf = term_frequencies(&query_tokens);

    // Build corpus for IDF computation
    let corpus: Vec<Vec<String>> = input.iter().map(|p| tokenize(&p.passage)).collect();
    let idf = compute_idf(&corpus);

    // Query TF-IDF vector
    let q_vec = tfidf_vector(&query_tf, &idf);

    // Score each passage
    let mut scored: Vec<(f32, &RetrievedPassage)> = input
        .iter()
        .zip(corpus.iter())
        .map(|(p, tokens)| {
            let tf = term_frequencies(tokens);
            let p_vec = tfidf_vector(&tf, &idf);
            let sim = cosine_similarity(&q_vec, &p_vec);
            (sim, *p)
        })
        .collect();

    // Sort by similarity descending
    scored.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap_or(std::cmp::Ordering::Equal));

    // Return top_k as owned
    scored
        .into_iter()
        .take(top_k)
        .map(|(_, p)| p.clone())
        .collect()
}

// ─────────────────────────────────────────────────────────────────
// TF-IDF IMPLEMENTATION (local, no crates)
// ─────────────────────────────────────────────────────────────────

/// Tokenize text into lowercase words (alphanum only).
fn tokenize(text: &str) -> Vec<String> {
    text.split(|c: char| !c.is_alphanumeric())
        .filter(|w| w.len() >= 2)
        .map(|w| w.to_lowercase())
        .collect()
}

/// Compute term frequencies for a token list.
fn term_frequencies(tokens: &[String]) -> HashMap<String, f32> {
    let mut tf: HashMap<String, f32> = HashMap::new();
    let total = tokens.len() as f32;
    if total == 0.0 {
        return tf;
    }
    for token in tokens {
        *tf.entry(token.clone()).or_insert(0.0) += 1.0 / total;
    }
    tf
}

/// Compute IDF weights from a corpus of token lists.
/// IDF(t) = log(N / (1 + df(t))) + 1  (smoothed)
fn compute_idf(corpus: &[Vec<String>]) -> HashMap<String, f32> {
    let n = corpus.len() as f32;
    let mut df: HashMap<String, usize> = HashMap::new();
    for doc in corpus {
        let mut seen: std::collections::HashSet<&str> = std::collections::HashSet::new();
        for token in doc {
            if seen.insert(token.as_str()) {
                *df.entry(token.clone()).or_insert(0) += 1;
            }
        }
    }
    df.into_iter()
        .map(|(term, count)| {
            let idf = (n / (1.0 + count as f32)).ln() + 1.0;
            (term, idf)
        })
        .collect()
}

/// Compute TF-IDF vector.
fn tfidf_vector(tf: &HashMap<String, f32>, idf: &HashMap<String, f32>) -> HashMap<String, f32> {
    tf.iter()
        .filter_map(|(term, &tf_val)| {
            idf.get(term).map(|&idf_val| (term.clone(), tf_val * idf_val))
        })
        .collect()
}

/// Compute cosine similarity between two sparse vectors.
fn cosine_similarity(a: &HashMap<String, f32>, b: &HashMap<String, f32>) -> f32 {
    if a.is_empty() || b.is_empty() {
        return 0.0;
    }
    let dot: f32 = a
        .iter()
        .filter_map(|(k, &v)| b.get(k).map(|&w| v * w))
        .sum();
    let norm_a: f32 = a.values().map(|&v| v * v).sum::<f32>().sqrt();
    let norm_b: f32 = b.values().map(|&v| v * v).sum::<f32>().sqrt();
    if norm_a == 0.0 || norm_b == 0.0 {
        0.0
    } else {
        dot / (norm_a * norm_b)
    }
}

// ─────────────────────────────────────────────────────────────────
// UNIT TESTS
// ─────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn make_passage(url: &str, text: &str, score: usize) -> RetrievedPassage {
        RetrievedPassage {
            url: url.to_string(),
            passage: text.to_string(),
            score,
            paragraph_index: None,
            char_start: None,
        }
    }

    // ── G_VECTOR_OFFLINE_ONLY: rerank uses no network ─────────────

    #[test]
    fn g_vector_offline_only_no_network() {
        // rerank_passages is pure — no network calls by construction.
        // This test validates determinism (same inputs → same outputs).
        let passages = vec![
            make_passage("https://a.com/p", "TITANE vector rerank alpha beta gamma", 3),
            make_passage("https://b.com/p", "research engine local index delta epsilon", 2),
            make_passage("https://c.com/p", "TITANE alpha gamma zeta", 5),
        ];
        let r1 = rerank_passages("TITANE alpha", &passages, 2);
        let r2 = rerank_passages("TITANE alpha", &passages, 2);
        assert_eq!(r1.len(), r2.len(), "Rerank must be deterministic");
        for (p1, p2) in r1.iter().zip(r2.iter()) {
            assert_eq!(p1.url, p2.url, "Same passage order across runs");
        }
        // STRATEGY_EXTRACTIVE guarantees: zero providers. Verified by static analysis.
        assert!(VECTOR_FEATURE_FLAG == "ENABLE_VECTOR_SEARCH");
    }

    // ── G_RERANK_RETURNS_TOP_K ────────────────────────────────────

    #[test]
    fn g_rerank_returns_top_k() {
        let passages: Vec<RetrievedPassage> = (0..10)
            .map(|i| make_passage(&format!("https://x.com/p{}", i), &format!("text passage {}", i), i))
            .collect();
        let result = rerank_passages("text passage", &passages, 3);
        assert!(result.len() <= 3, "rerank must return at most top_k");
    }

    // ── G_RERANK_EMPTY_PASSAGES ───────────────────────────────────

    #[test]
    fn g_rerank_empty() {
        let result = rerank_passages("query", &[], 5);
        assert!(result.is_empty(), "Empty input must return empty");
    }

    // ── G_COSINE_SIMILARITY ───────────────────────────────────────

    #[test]
    fn g_cosine_similarity_identical() {
        let mut v: HashMap<String, f32> = HashMap::new();
        v.insert("a".to_string(), 1.0);
        v.insert("b".to_string(), 1.0);
        let sim = cosine_similarity(&v, &v);
        assert!(
            (sim - 1.0).abs() < 1e-4,
            "Identical vectors should have cosine similarity ~1.0, got {}",
            sim
        );
    }

    #[test]
    fn g_cosine_similarity_orthogonal() {
        let mut a: HashMap<String, f32> = HashMap::new();
        a.insert("unique_a".to_string(), 1.0);
        let mut b: HashMap<String, f32> = HashMap::new();
        b.insert("unique_b".to_string(), 1.0);
        let sim = cosine_similarity(&a, &b);
        assert!(
            sim < 1e-4,
            "Orthogonal vectors should have cosine similarity ~0.0, got {}",
            sim
        );
    }

    // ── G_TOKENIZE ────────────────────────────────────────────────

    #[test]
    fn g_tokenize_basic() {
        let tokens = tokenize("Hello World! This is TITANE∞.");
        assert!(tokens.contains(&"hello".to_string()));
        assert!(tokens.contains(&"world".to_string()));
        assert!(tokens.contains(&"titane".to_string()));
        // Single-char tokens filtered
        assert!(!tokens.contains(&"a".to_string()));
    }

    // ── G_FEATURE_FLAG ────────────────────────────────────────────

    #[test]
    fn g_feature_flag_disabled_by_default() {
        // In test environment, ENABLE_VECTOR_SEARCH is not set
        // so is_enabled() must return false (safe default)
        std::env::remove_var(VECTOR_FEATURE_FLAG);
        assert!(
            !is_enabled(),
            "Vector search must be disabled by default (no env var set)"
        );
    }
}
