/**
 * TITANE∞ — Proprietary License
 * © 2025-2026 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ — WEB RESEARCH TYPES (Ring 1)
 *   Contrats IPC stables pour WebResearch Engine (P5.0 QUALIFIED++++)
 *   Tauri-only • Zéro réseau UI • Gouvernance stricte
 * ═══════════════════════════════════════════════════════════════════
 */

/** P5.0 contract version — adds IndexEvent, RetrievedPassage, sources_count, retrieved_passages_count */
export const RESEARCH_CONTRACT_VERSION = 'P5.0' as const;

// ─────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────

/**
 * Research execution mode.
 * - OFFLINE: no network (OFFLINE_HARDSTOP_ENFORCED)
 * - LOCAL_INDEX: local semantic index (stub in P3)
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
  /** Optional target URL for WEB_LIVE controlled single fetch */
  target_url?: string | null;
  /** Allow writing cache to disk (default true in WEB_LIVE) */
  cache_enabled?: boolean | null;
  /** Override sandbox root path (default: data/research) */
  sandbox_root?: string | null;
  /** Seed URLs for multi-URL discovery (P7+) */
  seed_urls?: string[] | null;
  /** Maximum discovery depth — P7 supports max 1 */
  max_depth?: number | null;
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
// CACHE EVENT (P3)
// ─────────────────────────────────────────────────────────────────

export type CacheEventKind = 'HIT' | 'MISS' | 'WRITE' | 'SKIP';

/** Cache event emitted by CacheService */
export interface CacheEvent {
  kind: CacheEventKind;
  url: string;
  blob_hash?: string | null;
  bytes?: number | null;
  ts: number; // unix ms
}

// ─────────────────────────────────────────────────────────────────
// ROBOTS EVENT (P3)
// ─────────────────────────────────────────────────────────────────

export type RobotsStatus =
  | 'ALLOW'
  | 'DISALLOW'
  | 'ERROR_FALLBACK_ALLOW'
  | 'ERROR_FALLBACK_BLOCK';

/** Robots check event emitted by RobotsService */
export interface RobotsEvent {
  domain: string;
  status: RobotsStatus;
  fetched: boolean;
  cached: boolean;
}

// ─────────────────────────────────────────────────────────────────
// RATE LIMIT EVENT (P3)
// ─────────────────────────────────────────────────────────────────

export type RateLimitAction = 'ALLOW' | 'DELAY' | 'BLOCK';

/** Rate-limit decision event emitted by RateLimitService */
export interface RateLimitEvent {
  domain: string;
  action: RateLimitAction;
  delay_ms?: number | null;
  reason?: string | null;
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
  /** Paragraph index within the source document (P7+) */
  paragraph_index?: number | null;
  /** Approximate character offset of the passage start (P7+) */
  char_start?: number | null;
  /** Human-readable stable locator text e.g. "p=3, c≈120" (P13+) */
  locator_text?: string | null;
}

// ─────────────────────────────────────────────────────────────────
// EXTRACT EVENT (P4)
// ─────────────────────────────────────────────────────────────────

export type ExtractStatus = 'OK' | 'FAIL';

/** Quality signals for the extracted text */
export interface ExtractQuality {
  text_len: number;
  lines: number;
}

/** Extraction event emitted by ExtractService */
export interface ExtractEvent {
  url: string;
  title?: string | null;
  text_bytes: number;
  text_hash?: string | null;
  quality: ExtractQuality;
  status: ExtractStatus;
  error?: string | null;
}

// ─────────────────────────────────────────────────────────────────
// INDEX EVENT (P5)
// ─────────────────────────────────────────────────────────────────

export type IndexWriteStatus = 'WRITTEN' | 'SKIPPED_DUPLICATE' | 'FAILED';
export type IndexQueryStatus = 'OK' | 'EMPTY' | 'FAILED';

/** Index write/query event emitted by IndexService (P5+) */
export interface IndexEvent {
  url?: string | null;
  query?: string | null;
  write_status?: IndexWriteStatus | null;
  query_status?: IndexQueryStatus | null;
  hits_count?: number | null;
  passages_count?: number | null;
  error?: string | null;
}

/** A retrieved text passage from the Tantivy index (P5+) */
export interface RetrievedPassage {
  url: string;
  passage: string;
  score: number;
  /** Paragraph index within the source document (P7+) */
  paragraph_index?: number | null;
  /** Approximate character offset of the passage start (P7+) */
  char_start?: number | null;
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
  /** Number of indexed documents used (P5+) */
  sources_count: number;
  /** Number of retrieved passages (P5+) */
  retrieved_passages_count: number;
}

/** Execution trace for observability (P5: IndexEvent added, index_events typed) */
export interface ResearchTrace {
  trace_id: string;
  markers: string[];
  timings?: Record<string, number> | null;
  budgets?: Record<string, number> | null;
  /** Structured network events from FetchService (P2+) */
  network_events?: NetworkEvent[] | null;
  /** Cache events from CacheService (P3+) */
  cache_events?: CacheEvent[] | null;
  /** Robots events from RobotsService (P3+) */
  robots_events?: RobotsEvent[] | null;
  /** Rate-limit events from RateLimitService (P3+) */
  rate_limit_events?: RateLimitEvent[] | null;
  /** Extraction events from ExtractService (P4+) */
  extract_events?: ExtractEvent[] | null;
  /** Index events from IndexService (P5+) */
  index_events?: IndexEvent[] | null;
  errors: string[];
}

/** Top-level report returned by the `web_research` Tauri command */
export interface ResearchReport {
  answer: ResearchAnswer;
  trace: ResearchTrace;
}
