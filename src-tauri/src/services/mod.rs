// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — SERVICES MODULE
//   Technical isolation layer
// ═══════════════════════════════════════════════════════════════

pub mod cache_service; // P3: WebResearch — SQLite meta + blob cache
pub mod db_service; // Conversation OS v1: Event store (append-only, SHA256)
pub mod discovery_service; // P7: WebResearch — governed multi-URL discovery (seeded, breadth-limited)
pub mod embeddings_service; // Conversation OS v1: Ollama embeddings via governed gateway
pub mod extract_service; // P4: WebResearch — deterministic HTML→text extractor
pub mod fetch_service; // P2: WebResearch — single network gate
pub mod index_service; // P5: WebResearch — Tantivy lexical index (BM25)
pub mod io_service;
pub mod local_llm_service; // P10: WebResearch — local LLM hook (BLOCKED — NONE provider)
pub mod network_gateway; // Conversation OS v1: governed HTTP gateway (allowlist + budgets)
pub mod network_policy; // P2: WebResearch — policy guard
pub mod rag_service; // P6: WebResearch — extractive RAG, citations, no-hallucination guard
pub mod rate_limit_service; // P3: WebResearch — token bucket per domain
pub mod robots_service; // P3: WebResearch — robots.txt check
pub mod search_gateway; // Conversation OS v1: Brave/DDG search gateway
pub mod seed_pack_service; // P12: WebResearch — versioned JSON seed packs
pub mod storage_service;
pub mod system_service;
pub mod vector_service; // P7: WebResearch — local TF-IDF vector reranking (EXPERIMENTAL)
