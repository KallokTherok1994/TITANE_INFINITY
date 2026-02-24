// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — SERVICES MODULE
//   Technical isolation layer
// ═══════════════════════════════════════════════════════════════

pub mod cache_service; // P3: WebResearch — SQLite meta + blob cache
pub mod extract_service; // P4: WebResearch — deterministic HTML→text extractor
pub mod fetch_service; // P2: WebResearch — single network gate
pub mod index_service; // P5: WebResearch — Tantivy lexical index (BM25)
pub mod io_service;
pub mod network_policy; // P2: WebResearch — policy guard
pub mod rag_service; // P6: WebResearch — extractive RAG, citations, no-hallucination guard
pub mod rate_limit_service; // P3: WebResearch — token bucket per domain
pub mod robots_service; // P3: WebResearch — robots.txt check
pub mod storage_service;
pub mod system_service;

pub use storage_service::StorageService;
pub use system_service::SystemService;
