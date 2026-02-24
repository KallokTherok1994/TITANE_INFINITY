// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — WEB RESEARCH TYPES (Ring 1)
//   Contrats IPC stables pour WebResearch Engine (P2.0 QUALIFIED)
//   Tauri-only • Zéro réseau UI • Gouvernance stricte
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Contract version — P2.0 adds NetworkEvent, target_url, budget fields
pub const RESEARCH_CONTRACT_VERSION: &str = "P2.0";

// ─────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────

/// Research execution mode.
/// - Offline: no network, no index (OFFLINE_HARDSTOP_ENFORCED)
/// - LocalIndex: local semantic index (stub in P2)
/// - WebLive: live fetch via governed NetworkPolicyGuard + FetchService
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
    /// Optional target URL for WEB_LIVE P2 controlled single fetch
    pub target_url: Option<String>,
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
    pub duration_ms: u64,
    pub cache_hit: bool,
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
}

/// Execution trace for observability (P2: typed network_events)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResearchTrace {
    pub trace_id: String,
    pub markers: Vec<String>,
    pub timings: Option<HashMap<String, f64>>,
    pub budgets: Option<HashMap<String, f64>>,
    /// Structured network events from FetchService (P2+)
    pub network_events: Option<Vec<NetworkEvent>>,
    pub cache_events: Option<Vec<String>>,
    pub index_events: Option<Vec<String>>,
    pub errors: Vec<String>,
}

/// Top-level report returned by the `web_research` Tauri command
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResearchReport {
    pub answer: ResearchAnswer,
    pub trace: ResearchTrace,
}
