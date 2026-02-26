/**
 * TITANE∞ — Conversation OS v1 Types (Ring 1)
 * Evidence: docs/_evidence/conversation_os_v1_20260225_224546/
 * Status: EXPERIMENTAL
 * Ring: 1 (Types — No runtime logic)
 */

// ═══════════════════════════════════════════════════════════════
// NET STATE & FAILURE CLASSIFICATION
// ═══════════════════════════════════════════════════════════════

/**
 * Network state classification
 */
export enum NetState {
  /** Network is available and responsive */
  ONLINE = 'ONLINE',
  /** Network is unavailable or unreachable */
  OFFLINE = 'OFFLINE',
  /** Network is available but degraded (slow, intermittent) */
  DEGRADED = 'DEGRADED',
  /** Network is blocked by policy or circuit breaker */
  BLOCKED = 'BLOCKED',
}

/**
 * Failure classification for explicit error attribution
 */
export enum FailureClass {
  DNS = 'DNS',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  CAPTCHA_LIKE = 'CAPTCHA_LIKE',
  HTTP_4XX = 'HTTP_4XX',
  HTTP_5XX = 'HTTP_5XX',
  POLICY_BLOCK = 'POLICY_BLOCK',
  ALLOWLIST_BLOCK = 'ALLOWLIST_BLOCK',
  CREDENTIALS_MISSING = 'CREDENTIALS_MISSING',
  UNKNOWN = 'UNKNOWN',
}

// ═══════════════════════════════════════════════════════════════
// POLICY & ROUTER DECISIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Policy verdict for a conversation turn
 */
export interface PolicyVerdict {
  /** Allow online/external network access */
  allow_online: boolean;
  /** Allow external AI providers (non-local) */
  allow_external_ai: boolean;
  /** Allow tool usage (search, code exec, etc.) */
  allow_tools: boolean;
  /** Reasons for policy decision (human-readable) */
  reasons: string[];
  /** Hard block (stop execution, return error to user) */
  hard_block: boolean;
  /** Current network state at decision time */
  net_state: NetState;
}

/**
 * Router decision about conversation intent
 */
export interface RouterDecision {
  /** Detected user intent (e.g., "QUESTION", "SEARCH", "CODE", "CHAT") */
  intent: string;
  /** User wants web search results */
  wants_search: boolean;
  /** User query relates to memory/history */
  wants_memory: boolean;
  /** User wants to save/persist something */
  wants_write: boolean;
  /** Planned provider strategy (e.g., "local_first", "cloud_preferred") */
  provider_plan: string;
  /** Planned tools (e.g., ["search", "memory"]) */
  tool_plan: string[];
}

/**
 * Provider decision metadata
 */
export interface ProviderDecisionMeta {
  /** Provider used (e.g., "ollama", "gemini", "local_fallback") */
  provider: string;
  /** Mode (e.g., "streaming", "batch") */
  mode: string;
  /** Reasons for provider selection */
  why: string[];
  /** Gate state (e.g., "allowed", "fallback", "blocked") */
  gate_state: string;
  /** Estimated or actual cost (optional) */
  cost?: number;
  /** Latency in milliseconds (optional) */
  latency_ms?: number;
  /** Model used (e.g., "llama3.2", "gemini-pro") */
  model?: string;
  /** Timestamp of decision */
  timestamp: number;
}

/**
 * Tool decision metadata
 */
export interface ToolDecisionMeta {
  /** Tool name (e.g., "search", "memory", "code_exec") */
  tool: string;
  /** Whether tool usage was allowed */
  allowed: boolean;
  /** Reasons for allow/deny */
  why: string[];
  /** Tool parameters (redacted sensitive data) */
  params_redacted: Record<string, unknown>;
  /** Timestamp of decision */
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════
// CITATIONS & SOURCES
// ═══════════════════════════════════════════════════════════════

/**
 * Citation for a source used in response
 */
export interface Citation {
  /** Unique source ID (DB reference) */
  source_id: string;
  /** Source URL */
  url: string;
  /** Source title */
  title: string;
  /** When the source was retrieved */
  retrieved_at: number;
  /** Provider that supplied the source (e.g., "brave_search", "memory") */
  provider: string;
}

// ═══════════════════════════════════════════════════════════════
// TRACE FRAME (OBSERVABILITY)
// ═══════════════════════════════════════════════════════════════

/**
 * TraceFrame: Complete trace of a conversation turn
 * Emitted for every orchestrator execution
 */
export interface TraceFrame {
  /** Unique trace ID for this turn */
  trace_id: string;
  /** Session/conversation ID */
  session_id: string;
  /** Network state during execution */
  net_state: NetState;
  /** Router decision */
  router: RouterDecision;
  /** Policy verdict */
  policy: PolicyVerdict;
  /** Provider decision metadata */
  provider_meta: ProviderDecisionMeta;
  /** Tool decisions (array for multiple tools) */
  tools_meta: ToolDecisionMeta[];
  /** Sources/citations used in response */
  sources_used: Citation[];
  /** Memory entries used (IDs) */
  memory_used: string[];
  /** Timings breakdown (ms) */
  timings: {
    router_ms: number;
    policy_ms: number;
    resilience_ms: number;
    memory_ms: number;
    search_ms: number;
    generation_ms: number;
    persistence_ms: number;
    total_ms: number;
  };
  /** Errors encountered (empty if success) */
  errors: Array<{
    stage: string;
    class: FailureClass;
    message: string;
    timestamp: number;
  }>;
  /** When trace was created */
  created_at: number;
  /** When trace was finalized */
  finalized_at?: number;
}

// ═══════════════════════════════════════════════════════════════
// TYPE GUARDS & UTILITIES
// ═══════════════════════════════════════════════════════════════

/**
 * Check if network state allows online access
 */
export function isOnlineCapable(state: NetState): boolean {
  return state === NetState.ONLINE || state === NetState.DEGRADED;
}

/**
 * Check if failure is retriable
 */
export function isRetriableFailure(failureClass: FailureClass): boolean {
  return [
    FailureClass.TIMEOUT,
    FailureClass.HTTP_5XX,
    FailureClass.RATE_LIMIT,
  ].includes(failureClass);
}

/**
 * Check if failure is a policy/allowlist block (not retriable)
 */
export function isPolicyBlock(failureClass: FailureClass): boolean {
  return [
    FailureClass.POLICY_BLOCK,
    FailureClass.ALLOWLIST_BLOCK,
    FailureClass.CREDENTIALS_MISSING,
  ].includes(failureClass);
}
