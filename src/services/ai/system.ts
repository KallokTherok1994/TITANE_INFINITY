/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v20Ω+ — AI SYSTEM EXPORTS
 *   Point d'entrée centralisé pour le sous-système IA complet
 * ═══════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────
// CORE ORCHESTRATOR
// ─────────────────────────────────────────────────────────────────
export { aiOrchestrator, askTitan, streamTitan, getAIStatus } from './orchestrator';

// ─────────────────────────────────────────────────────────────────
// PROVIDERS
// ─────────────────────────────────────────────────────────────────
// ⚠️ v37.1.0: Local/Tauri/Ollama remain eagerly loaded (always needed)
export { titaneLocalProvider } from './providers/titaneLocal';
export { tauriChatProvider } from './providers/tauriChat';
export { ollamaProvider } from './providers/ollama';

// ⚠️ v37.1.0: Cloud providers now lazy-loaded via AIProviderLazyLoader
// Use: loadGeminiProvider(), loadOpenAIProvider(), loadClaudeProvider(), loadCopilotProvider()
// export { geminiProvider } from './providers/gemini';
// export { openaiProvider } from './providers/openai';
// export { claudeProvider } from './providers/claude';
// export { copilotProvider } from './providers/copilot';

// ─────────────────────────────────────────────────────────────────
// ENGINES (Static imports - already bundled due to metaKernel usage)
// ─────────────────────────────────────────────────────────────────
// ℹ️ Previously lazy-loaded, but metaKernel.ts uses static imports
// Converting to static to avoid Vite chunk splitting warnings
export { autoHealEngine } from './autoHealEngine';
export { metricsEngine } from './metricsEngine';
export { aiHealthMonitor } from './healthMonitor';
export { unifiedHealingFacade } from './unifiedHealingFacade';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────
export type {
  AIMessage,
  AIResponse,
  AIProvider,
  AIProviderName,
  AIConfig,
} from './types';

export type {
  AutoHealError,
  AutoHealAction,
  AutoHealStats,
  AutoHealConfig,
} from './autoHealEngine';

export type { MetricEvent, ProviderMetrics, AggregatedMetrics } from './metricsEngine';

export type { HealthAlert, HealthReport } from './healthMonitor';

// ─────────────────────────────────────────────────────────────────
// UTILITIES (Separated to avoid circular dependencies in bundle)
// ─────────────────────────────────────────────────────────────────
export {
  initializeAISystem,
  quickHealthCheck,
  quickStats,
  quickFix,
} from './systemUtilities';
