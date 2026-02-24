// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — WEB RESEARCH TYPES (Ring 1)
//   Contrats IPC stables pour WebResearch Engine (P1.0 EXPERIMENTAL)
//   Tauri-only • Zéro réseau • Gouvernance stricte
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// P1.0 contract version — increment on breaking change
pub const RESEARCH_CONTRACT_VERSION: &str = "P1.0";

// ─────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────

/// Research execution mode.
/// - Offline: no network, no index (stub answer)
/// - LocalIndex: local semantic index (stub in P1)
/// - WebLive: live web crawl (BLOCKED in P1 — network disabled)
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

/// Execution trace for observability
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResearchTrace {
    pub trace_id: String,
    pub markers: Vec<String>,
    pub timings: Option<HashMap<String, f64>>,
    pub budgets: Option<HashMap<String, f64>>,
    pub network_events: Option<Vec<String>>,
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
