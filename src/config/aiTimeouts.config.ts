/**
 * TITANE∞ v28 — AI Timeouts Configuration (OMEGA_CHAT_PERF 2026-03-15)
 * Centralized timeout values aligned with ChatProfile FAST/BALANCED/DEEP.
 *
 * ROOT CAUSE FIX: PROVIDER_TIMEOUTS.ollama was 8000ms — local LLMs cannot
 * complete complex generation in 8s, forcing 3×8s retry chains (24s wasted).
 * providerAttemptMs is now aligned with BALANCED profile (52s total budget).
 */

/**
 * Provider-specific execution timeouts (ms) — BALANCED profile defaults.
 * Ollama/tauri-backend now have realistic budgets for local LLM generation.
 */
export const PROVIDER_TIMEOUTS = {
  'titane-local': 5_000, // Local kernel — ultra-fast
  'tauri-backend': 50_000, // Rust ChatEngine — BALANCED budget
  ollama: 45_000, // Local LLM — realistic generation window
  gemini: 30_000, // Cloud API — generous but bounded
  openai: 30_000,
  claude: 30_000,
  default: 45_000, // Unknown providers get BALANCED budget
} as const;

/**
 * Budgets globaux (ms) — BALANCED profile defaults.
 * - globalRequestMs:    hard wall for the entire request chain
 * - providerAttemptMs:  max budget per single provider attempt
 *   (was 8000 → now 50000 — root cause of 3×8s retry chain fixed)
 * - maxAttempts:        provider fallback depth (primary + 1 fallback)
 *   (was 3 → now 2 — bounded fallback chain per Rule 7/8)
 */
export const REQUEST_BUDGETS = {
  globalRequestMs: 52_000, // Aligned with BALANCED response_timeout
  providerAttemptMs: 50_000, // Single attempt gets most of the budget
  maxAttempts: 2, // Primary + one fallback only
} as const;

/**
 * Memory and context operation timeouts (ms)
 */
export const MEMORY_TIMEOUTS = {
  contextLoad: 5000, // Memory context loading
  cognitiveEnrichment: 3000, // Cognitive context enrichment
  memorySave: 4000, // Unified/Cognitive memory save
  availabilityCheck: 3000, // Provider availability check
} as const;

/**
 * UI-facing timeouts (ms) — aligned with BALANCED profile.
 */
export const UI_TIMEOUTS = {
  maxRequest: 52_000, // Aligned with BALANCED globalRequestMs
  failsafe: 55_000, // Failsafe slightly above globalRequestMs
  localProvider: { short: 6_000, long: 10_000 },
  ollamaProvider: { short: 20_000, long: 45_000 }, // FIXED: was 8/12s — too tight
  cloudProvider: { short: 15_000, medium: 30_000, long: 52_000 },
} as const;

/**
 * Cache TTL values (ms)
 * ✨ v24.3.6: Optimized TTLs to reduce redundant computations
 * ✨ v26.3.0: Further optimizations for LTM integration and recovery boost
 */
export const CACHE_TTL = {
  metrics: 10000, // ✨ v26.3.0: Increased from 5s to 10s - further reduce metric calls by 50%
  providerAvailability: 300000, // ✨ v26.3.0: Increased from 60s to 5min (already 5min in AVAILABILITY_CACHE)
  quickFailCooldown: 30000, // ✨ v26.3.0: Increased from 10s to 30s - reduce retry noise, allow recovery
} as const;

/**
 * Circuit breaker configuration
 */
export const CIRCUIT_BREAKER = {
  criticalErrorWindow: 300000, // 5 minutes
  criticalErrorThreshold: 3, // Errors before degraded mode
  cleanupInterval: 30000, // Quick-fail cleanup interval
} as const;

/**
 * Streaming configuration — aligned with BALANCED profile.
 */
export const STREAM_CONFIG = {
  chunkBatchSize: 5, // Batch N chunks before yielding
  chunkBatchDelayMs: 50, // Max delay before flushing batch
  totalTimeoutMs: 58_000, // BALANCED streaming budget — headroom above 52s worst-case (was 52_000)
  perChunkTimeoutMs: 7_000, // BALANCED first-token window
} as const;

/**
 * Provider availability cache
 * ✨ v24.3.6: Increased TTL to reduce redundant API calls (283 calls/day → ~50)
 */
export const AVAILABILITY_CACHE = {
  ttlMs: 300000, // ✨ v24.3.6: Increased from 60s to 5min - reduces API calls by 80%
  checkTimeoutMs: 1500, // ✨ v24.3.6: Reduced from 2s to 1.5s - faster failover
} as const;

/**
 * Get provider timeout by name
 */
export function getProviderTimeout(providerName: string): number {
  return (
    PROVIDER_TIMEOUTS[providerName as keyof typeof PROVIDER_TIMEOUTS] ??
    PROVIDER_TIMEOUTS.default
  );
}

/**
 * Get adaptive UI timeout based on provider and message length
 */
export function getAdaptiveUITimeout(
  provider: 'local' | 'ollama' | 'cloud',
  messageLength: number
): number {
  const isLongMessage = messageLength > 1000;

  switch (provider) {
    case 'local':
      return isLongMessage
        ? UI_TIMEOUTS.localProvider.long
        : UI_TIMEOUTS.localProvider.short;
    case 'ollama':
      return isLongMessage
        ? UI_TIMEOUTS.ollamaProvider.long
        : UI_TIMEOUTS.ollamaProvider.short;
    case 'cloud':
    default:
      if (messageLength > 2000) return UI_TIMEOUTS.cloudProvider.long;
      if (messageLength > 500) return UI_TIMEOUTS.cloudProvider.medium;
      return UI_TIMEOUTS.cloudProvider.short;
  }
}
