/**
 * TITANE∞ — Proprietary License
 * © 2025-2026 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ — WEB RESEARCH TYPES (Ring 1)
 *   Contrats IPC stables pour WebResearch Engine (P2.0 QUALIFIED)
 *   Tauri-only • Zéro réseau UI • Gouvernance stricte
 * ═══════════════════════════════════════════════════════════════════
 */

/** P2.0 contract version — adds NetworkEvent, target_url, budget fields */
export const RESEARCH_CONTRACT_VERSION = 'P2.0' as const;

// ─────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────

/**
 * Research execution mode.
 * - OFFLINE: no network (OFFLINE_HARDSTOP_ENFORCED)
 * - LOCAL_INDEX: local semantic index (stub in P2)
 * - WEB_LIVE: governed fetch via NetworkPolicyGuard + FetchService
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
  /** Optional target URL for WEB_LIVE P2 controlled single fetch */
  target_url?: string | null;
}

// ─────────────────────────────────────────────────────────────────
// NETWORK EVENT (P2)
// ─────────────────────────────────────────────────────────────────

/** A single structured network event recorded by FetchService */
export interface NetworkEvent {
  domain: string;
  url: string;
  /** HTTP status code (0 = error/timeout) */
  status: number;
  bytes: number;
  duration_ms: number;
  cache_hit: boolean;
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

/** Execution trace for observability (P2: typed network_events) */
export interface ResearchTrace {
  trace_id: string;
  markers: string[];
  timings?: Record<string, number> | null;
  budgets?: Record<string, number> | null;
  /** Structured network events from FetchService (P2+) */
  network_events?: NetworkEvent[] | null;
  cache_events?: string[] | null;
  index_events?: string[] | null;
  errors: string[];
}

/** Top-level report returned by the `web_research` Tauri command */
export interface ResearchReport {
  answer: ResearchAnswer;
  trace: ResearchTrace;
}
