/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v1.0 — AI SERVICES INDEX
 *   Export centralisé - NOUVELLE ARCHITECTURE OPTION B
 * ═══════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────
// 🎯 NOUVELLE ARCHITECTURE v1.0 — CORE EXPORTS
// ─────────────────────────────────────────────────────────────────

// Re-export from new core structure
export * from '@/core/kernels';
export * from '@/core/services';

// ─────────────────────────────────────────────────────────────────
// 🔄 LEGACY EXPORTS (backward compatibility)
// ─────────────────────────────────────────────────────────────────
export * from './system';

// Kernels (kept in services/ai for backward compatibility)
export { cognitiveKernel } from './cognitiveKernel';
export { metaKernel } from './metaKernel';
export { singularityKernel } from './singularityKernel';

// Services (kept in services/ai for backward compatibility)
export { aiOrchestrator, askTitan, streamTitan, getAIStatus } from './orchestrator';
export {
  chatEngine,
  type ChatMode,
  type ChatEngineConfig,
  type ChatEngineResponse,
} from './chatEngine';
// ✨ Direct exports of AI engines (no lazy loading)
export { autoHealEngine, metricsEngine, aiHealthMonitor } from './system';

// ✨ v21 Phase 2: Retry Strategy unifiée
export {
  withRetry,
  withRetryAndTimeout,
  getRetryConfig,
  isRetriableError,
  type RetryConfig,
  DEFAULT_RETRY_CONFIG,
  PROVIDER_RETRY_CONFIGS,
} from './retryStrategy';

// ✨ v21 Phase 3: API Response Cache (LRU)
export {
  apiResponseCache,
  withCache,
  LRUCache,
  CACHE_TTL,
  type CacheStats,
} from './apiCache';

// ✨ v21.5 Sprint 1: Cognitive Cache Connector
export {
  connectCacheToSingularity,
  disconnectCacheFromSingularity,
  isCacheConnected,
  detectPattern,
} from './cognitiveCacheConnector';

// Providers
export { geminiProvider } from './providers/gemini';
export { copilotProvider } from './providers/copilot';
export { ollamaProvider } from './providers/ollama';
export { fallbackProvider } from './providers/fallback';

// Types
export type { AIMessage, AIResponse, AIProvider, AIConfig } from './types';
export { DEFAULT_AI_CONFIG } from './types';

// Modes & Memory
export { chatModes, type ChatModeConfig } from './chatModes';
export { memoryIntegration, type MemoryLoadConfig } from './memoryIntegration';
export type { MemoryContext } from './memoryIntegration';
export { inputValidator, InputValidator } from './inputValidator';
