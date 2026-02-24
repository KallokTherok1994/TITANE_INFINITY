// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — WEB RESEARCH TYPES (Ring 1)
//   Contrats IPC stables pour WebResearch Engine (P5.0 QUALIFIED++++)
//   Tauri-only • Zéro réseau UI • Gouvernance stricte
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Contract version — P5.0 adds IndexEvent, RetrievedPassage, index_events typed, sources_count/retrieved_passages_count
pub const RESEARCH_CONTRACT_VERSION: &str = "P5.0";

// ─────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────

/// Research execution mode.
/// - Offline: no network (OFFLINE_HARDSTOP_ENFORCED)
/// - LocalIndex: local semantic index (stub in P3)
/// - WebLive: governed fetch via NetworkPolicyGuard + FetchService
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ResearchMode {
    Offline,
    LocalIndex,
    WebLive,
}

// ─────────────────────────────────────────────────────────────────
// REQUEST
// ─────────────────────────────────────────────────────────────────

/// Research query submitted by the user
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResearchQuery {
    pub question: String,
    pub intent: Option<String>,
    pub locale: Option<String>,
}

/// Research execution options
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResearchOptions {
    pub mode: ResearchMode,
    pub domain_allowlist: Option<Vec<String>>,
    pub domain_denylist: Option<Vec<String>>,
    pub max_sources: Option<u32>,
    pub max_pages: Option<u32>,
    pub freshness_days: Option<u32>,
    pub timeout_ms: Option<u64>,
    pub max_bytes_total: Option<u64>,
    pub max_requests: Option<u32>,
    pub respect_robots: Option<bool>,
    pub rate_limit_profile: Option<String>,
    /// Optional target URL for WEB_LIVE controlled single fetch
    pub target_url: Option<String>,
    /// Allow writing cache to disk (default true in WEB_LIVE)
    pub cache_enabled: Option<bool>,
    /// Path prefix for sandbox (default: data/research)
    pub sandbox_root: Option<String>,
    /// Seed URLs for multi-URL discovery (P7+). If set, enables governed multi-URL crawl.
    pub seed_urls: Option<Vec<String>>,
    /// Maximum discovery depth (P7: max 1)
    pub max_depth: Option<u32>,
}

// ─────────────────────────────────────────────────────────────────
// NETWORK EVENT (P2)
// ─────────────────────────────────────────────────────────────────

/// A single structured network event recorded by FetchService
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkEvent {
    pub domain: String,
    pub url: String,
    /// HTTP status code (0 = error/timeout)
    pub status: u16,
    pub bytes: u64,
    /// Network round-trip time in milliseconds.
    /// 0 when cache_hit = true (served from disk, no network latency).
    pub duration_ms: u64,
    pub cache_hit: bool,
}

// ─────────────────────────────────────────────────────────────────
// CACHE EVENT (P3)
// ─────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum CacheEventKind {
    Hit,
    Miss,
    Write,
    Skip, // dedup: blob already exists
}

/// Cache event emitted by CacheService
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheEvent {
    pub kind: CacheEventKind,
    pub url: String,
    pub blob_hash: Option<String>,
    pub bytes: Option<u64>,
    pub ts: u64, // unix ms
}

// ─────────────────────────────────────────────────────────────────
// ROBOTS EVENT (P3)
// ─────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum RobotsStatus {
    Allow,
    Disallow,
    /// robots.txt fetch error — policy fallback applied
    ErrorFallbackAllow,
    ErrorFallbackBlock,
}

/// Robots check event emitted by RobotsService
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RobotsEvent {
    pub domain: String,
    pub status: RobotsStatus,
    pub fetched: bool,
    pub cached: bool,
}

// ─────────────────────────────────────────────────────────────────
// RATE LIMIT EVENT (P3)
// ─────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum RateLimitAction {
    Allow,
    Delay,
    Block,
}

/// Rate-limit decision event emitted by RateLimitService
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimitEvent {
    pub domain: String,
    pub action: RateLimitAction,
    pub delay_ms: Option<u64>,
    pub reason: Option<String>,
}

// ─────────────────────────────────────────────────────────────────
// EXTRACT EVENT (P4)
// ─────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ExtractStatus {
    Ok,
    Fail,
}

/// Quality signals for the extracted text
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtractQuality {
    pub text_len: usize,
    pub lines: usize,
}

/// Extraction event emitted by ExtractService
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtractEvent {
    pub url: String,
    pub title: Option<String>,
    pub text_bytes: usize,
    pub text_hash: Option<String>,
    pub quality: ExtractQuality,
    pub status: ExtractStatus,
    pub error: Option<String>,
}

// ─────────────────────────────────────────────────────────────────
// INDEX EVENT (P5)
// ─────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum IndexWriteStatus {
    Written,
    SkippedDuplicate,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum IndexQueryStatus {
    Ok,
    Empty,
    Failed,
}

/// Index write/query event emitted by IndexService (P5+)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexEvent {
    pub url: Option<String>,
    pub query: Option<String>,
    pub write_status: Option<IndexWriteStatus>,
    pub query_status: Option<IndexQueryStatus>,
    pub hits_count: Option<usize>,
    pub passages_count: Option<usize>,
    pub error: Option<String>,
}

/// A retrieved text passage from the index (P5+)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetrievedPassage {
    pub url: String,
    pub passage: String,
    pub score: usize,
    /// Paragraph index within the source document (P7+, optional)
    pub paragraph_index: Option<u32>,
    /// Approximate character offset of the passage start within the document (P7+, optional)
    pub char_start: Option<u32>,
}

// ─────────────────────────────────────────────────────────────────
// RESULT PRIMITIVES
// ─────────────────────────────────────────────────────────────────

/// A single discovered document/page
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResearchHit {
    pub url: String,
    pub title: Option<String>,
    pub snippet: Option<String>,
    pub score: Option<f64>,
    pub discovered_at: Option<String>,
    pub source_kind: Option<String>,
}

/// A citation included in the answer
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Citation {
    pub url: String,
    pub title: Option<String>,
    pub excerpt: String,
    pub locator: Option<String>,
    pub accessed_at: String,
    /// Paragraph index within the source document (P7+, optional)
    pub paragraph_index: Option<u32>,
    /// Approximate character offset of the passage start within the document (P7+, optional)
    pub char_start: Option<u32>,
}

// ─────────────────────────────────────────────────────────────────
// OUTPUT
// ─────────────────────────────────────────────────────────────────

/// Synthesized research answer with citations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResearchAnswer {
    pub answer: String,
    pub citations: Vec<Citation>,
    pub confidence: Option<f64>,
    pub limitations: Vec<String>,
    pub trace_id: String,
    /// Number of indexed documents used (P5+)
    pub sources_count: usize,
    /// Number of retrieved passages (P5+)
    pub retrieved_passages_count: usize,
}

/// Execution trace for observability (P5: IndexEvent added, index_events typed)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResearchTrace {
    pub trace_id: String,
    pub markers: Vec<String>,
    pub timings: Option<HashMap<String, f64>>,
    pub budgets: Option<HashMap<String, f64>>,
    /// Structured network events from FetchService (P2+)
    pub network_events: Option<Vec<NetworkEvent>>,
    /// Cache events from CacheService (P3+)
    pub cache_events: Option<Vec<CacheEvent>>,
    /// Robots events from RobotsService (P3+)
    pub robots_events: Option<Vec<RobotsEvent>>,
    /// Rate-limit events from RateLimitService (P3+)
    pub rate_limit_events: Option<Vec<RateLimitEvent>>,
    /// Extraction events from ExtractService (P4+)
    pub extract_events: Option<Vec<ExtractEvent>>,
    /// Index events from IndexService (P5+)
    pub index_events: Option<Vec<IndexEvent>>,
    pub errors: Vec<String>,
}

/// Top-level report returned by the `web_research` Tauri command
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResearchReport {
    pub answer: ResearchAnswer,
    pub trace: ResearchTrace,
}
