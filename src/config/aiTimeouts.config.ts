/**
 * TITANE∞ v22Ω — AI Timeouts Configuration
 * Centralized timeout values for consistency across AI services
 */

/**
 * Provider-specific execution timeouts (ms)
 * Ordered by expected latency (fastest to slowest)
 */
export const PROVIDER_TIMEOUTS = {
  'titane-local': 5000, // Noyau infaillible, ultra-rapide
  'tauri-backend': 12000, // Backend Rust local
  ollama: 30000, // Local LLM, dépend du modèle
  gemini: 35000, // Cloud API Google
  openai: 40000, // Cloud API OpenAI
  claude: 40000, // Cloud API Anthropic
  default: 25000, // Fallback
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
 */
export const UI_TIMEOUTS = {
  maxRequest: 45000, // Hard cap to prevent UI freeze
  failsafe: 30000, // Failsafe reset for stuck operations
  localProvider: { short: 8000, long: 15000 },
  ollamaProvider: { short: 12000, long: 25000 },
  cloudProvider: { short: 25000, medium: 35000, long: 45000 },
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
 */
export const STREAM_CONFIG = {
  chunkBatchSize: 5, // Batch N chunks before yielding (reduces UI updates)
  chunkBatchDelayMs: 50, // Max delay before flushing batch
  totalTimeoutMs: 120000, // 2 minutes max for entire stream
  perChunkTimeoutMs: 10000, // 10s max between chunks
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
