// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ — BROWSER OPERATOR TYPES
//   LOCK 7: BROWSER_OPERATOR_V1 — governed browser relay (navigation, read, extract)
//
//   Mirror exact Rust serde types from src-tauri/src/commands/browser_operator.rs
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// ENUMS (snake_case mirrors Rust serde rename_all = "snake_case")
// ─────────────────────────────────────────────────────────────────

export type BrowserSessionStatus =
  | 'idle'
  | 'navigating'
  | 'reading'
  | 'extracting'
  | 'blocked'
  | 'stopped';

export type BrowserRelayCategory =
  | 'navigation'
  | 'structured_read'
  | 'extraction'
  | 'handoff_required'
  | 'blocked_sensitive'
  | 'tooling_missing';

// ─────────────────────────────────────────────────────────────────
// CORE STRUCTS
// ─────────────────────────────────────────────────────────────────

export interface BrowserSession {
  session_id: string;
  authority_level: string;
  allowed_domains: string[];
  current_url: string | null;
  status: BrowserSessionStatus;
  started_at: string;
  expires_at: string;
  actions_count: number;
  max_actions: number;
  handoff_pending: boolean;
}

export interface BrowserRelayResult {
  ok: boolean;
  category: BrowserRelayCategory;
  url: string;
  title: string | null;
  content: string | null;
  structured_data?: Record<string, unknown> | null;
  block_reason: string | null;
  handoff_required: boolean;
  actions_remaining: number;
  session_id: string;
  executed_at: string;
}

export interface DomainPolicy {
  allowed_domains: string[];
  denied_domains: string[];
  require_https: boolean;
  max_pages_per_session: number;
  sensitive_patterns: string[];
}

export interface BrowserOperatorConfig {
  playwright_available: boolean;
  playwright_version: string | null;
  default_browser: string;
  headless: boolean;
  navigation_timeout_ms: number;
  default_domain_policy: DomainPolicy;
}

// ─────────────────────────────────────────────────────────────────
// IPC CANONICAL WRAPPERS
// ─────────────────────────────────────────────────────────────────

/** Canonical IPC response shape for browser operator commands */
export interface BrowserSessionResponse {
  ok: boolean;
  content: BrowserSession | null;
  error: { message: string } | null;
}

export interface BrowserRelayResponse {
  ok: boolean;
  content: BrowserRelayResult | null;
  error: { message: string } | null;
}

export interface BrowserConfigResponse {
  ok: boolean;
  content: BrowserOperatorConfig | null;
  error: { message: string } | null;
}

export interface BrowserCloseResponse {
  ok: boolean;
  content: boolean | null;
  error: { message: string } | null;
}
