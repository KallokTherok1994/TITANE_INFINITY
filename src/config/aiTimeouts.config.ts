/**
 * TITANE∞ v22Ω — AI Timeouts Configuration
 * Centralized timeout values for consistency across AI services
 */

/**
 * Provider-specific execution timeouts (ms)
 * Ordered by expected latency (fastest to slowest)
 * ✨ vΩ.2: Reduced budgets to enforce <= 25s global latency cap
 */
export const PROVIDER_TIMEOUTS = {
  'titane-local': 5000, // Noyau infaillible, ultra-rapide
  'tauri-backend': 8000, // Backend Rust local
  ollama: 8000, // Local LLM (budget borné)
  gemini: 8000, // Cloud APIs bornées
  openai: 8000,
  claude: 8000,
  default: 8000, // Fallback
} as const;

/**
 * Budgets globaux (ms)
 * - globalRequestMs: budget maximal par requête
 * - providerAttemptMs: budget maximal par tentative provider
 * - maxAttempts: nombre max de tentatives
 * ✨ v27+ FIX: Augmenté de 25s → 60s pour requests IA complexes
 */
export const REQUEST_BUDGETS = {
  globalRequestMs: 60000,
  providerAttemptMs: 8000,
  maxAttempts: 3,
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
 * UI-facing timeouts (ms)
 * ✨ v27+ FIX: Augmentés de 25s → 60s pour requests IA complexes
 */
export const UI_TIMEOUTS = {
  maxRequest: 60000, // Hard cap global
  failsafe: 60000, // Failsafe reset aligned
  localProvider: { short: 6000, long: 8000 },
  ollamaProvider: { short: 8000, long: 12000 },
  cloudProvider: { short: 15000, medium: 30000, long: 60000 },
} as const;

/**
 * Cache TTL values (ms)
 * ✨ v24.3.6: Optimized TTLs to reduce redundant computations
 */
export const CACHE_TTL = {
  metrics: 5000, // ✨ v24.3.6: Increased from 1s to 5s - reduces metric refreshes by 80%
  providerAvailability: 60000, // Provider availability cache
  quickFailCooldown: 10000, // ✨ v24.3.6: Increased from 5s to 10s - reduce retry noise
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
 * Streaming configuration (OPT11: Chunk batching)
 * ✨ v27+ FIX: totalTimeoutMs augmenté de 25s → 60s
 */
export const STREAM_CONFIG = {
  chunkBatchSize: 5, // Batch N chunks before yielding (reduces UI updates)
  chunkBatchDelayMs: 50, // Max delay before flushing batch
  totalTimeoutMs: 60000, // 60s max for entire stream
  perChunkTimeoutMs: 4000, // 4s max between chunks
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
