/**
 * TITANE∞ — Proprietary License
 * © 2025-2026 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ — WEB RESEARCH TYPES (Ring 1)
 *   Contrats IPC stables pour WebResearch Engine (P1.0 EXPERIMENTAL)
 *   Tauri-only • Zéro réseau UI • Gouvernance stricte
 * ═══════════════════════════════════════════════════════════════════
 */

/** P1.0 contract version — increment on breaking change */
export const RESEARCH_CONTRACT_VERSION = 'P1.0' as const;

// ─────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────

/**
 * Research execution mode.
 * - OFFLINE: no network, no index (stub answer)
 * - LOCAL_INDEX: local semantic index (stub in P1)
 * - WEB_LIVE: live web crawl (BLOCKED in P1 — network disabled)
 */
export type ResearchMode = 'OFFLINE' | 'LOCAL_INDEX' | 'WEB_LIVE';

// ─────────────────────────────────────────────────────────────────
// REQUEST
// ─────────────────────────────────────────────────────────────────

/** Research query submitted by the user */
export interface ResearchQuery {
  question: string;
  intent?: string | null;
  locale?: string | null;
}

/** Research execution options */
export interface ResearchOptions {
  mode: ResearchMode;
  domain_allowlist?: string[] | null;
  domain_denylist?: string[] | null;
  max_sources?: number | null;
  max_pages?: number | null;
  freshness_days?: number | null;
  timeout_ms?: number | null;
  max_bytes_total?: number | null;
  max_requests?: number | null;
  respect_robots?: boolean | null;
  rate_limit_profile?: string | null;
}

// ─────────────────────────────────────────────────────────────────
// RESULT PRIMITIVES
// ─────────────────────────────────────────────────────────────────

/** A single discovered document/page */
export interface ResearchHit {
  url: string;
  title?: string | null;
  snippet?: string | null;
  score?: number | null;
  discovered_at?: string | null;
  source_kind?: string | null;
}

/** A citation included in the answer */
export interface Citation {
  url: string;
  title?: string | null;
  excerpt: string;
  locator?: string | null;
  accessed_at: string;
}

// ─────────────────────────────────────────────────────────────────
// OUTPUT
// ─────────────────────────────────────────────────────────────────

/** Synthesized research answer with citations */
export interface ResearchAnswer {
  answer: string;
  citations: Citation[];
  confidence?: number | null;
  limitations: string[];
  trace_id: string;
}

/** Execution trace for observability */
export interface ResearchTrace {
  trace_id: string;
  markers: string[];
  timings?: Record<string, number> | null;
  budgets?: Record<string, number> | null;
  network_events?: string[] | null;
  cache_events?: string[] | null;
  index_events?: string[] | null;
  errors: string[];
}

/** Top-level report returned by the `web_research` Tauri command */
export interface ResearchReport {
  answer: ResearchAnswer;
  trace: ResearchTrace;
}
