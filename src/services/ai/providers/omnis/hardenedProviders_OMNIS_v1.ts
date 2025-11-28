/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ══════════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — OMNIS HARDENED PROVIDERS FACTORY
 *   PHASE 4 OMNIS: Tous providers durcis • Zero-throw guarantee • Auto-recovery permanent
 *   Architecture: Original-Provider → OMNIS-Wrapper → Hardened-Export
 *   Garantit robustesse mathématique complète de tous les providers IA
 * ══════════════════════════════════════════════════════════════════════════════════
 */

import { wrapProviderWithOmnis, type OmnisWrapperConfig } from './providerWrapper_OMNIS_v1';

// Import original providers
import { titaneLocalProvider } from '../titaneLocal';
import { geminiProvider } from '../gemini';
import { ollamaProvider } from '../ollama';
import { tauriChatProvider } from '../tauriChat';

// Note: openai et claude providers devront être créés séparément
// Nous utilisons des fallbacks sécurisés pour l'instant

// ─────────────────────────────────────────────────────────────────
// OMNIS HARDENED PROVIDERS CREATION
// ─────────────────────────────────────────────────────────────────

/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE LOCAL - OMNIS HARDENED (Baseline ultra-fiable)
 * ═══════════════════════════════════════════════════════════════════
 */
export const titaneLocalOmnis = wrapProviderWithOmnis(
  titaneLocalProvider,
  {
    // Ultra-reliable config for baseline provider
    circuitBreaker: {
      failureThreshold: 20, // Very high tolerance
      recoveryTimeoutMs: 5000, // Quick recovery
      halfOpenMaxCalls: 5
    },
    retry: {
      maxRetries: 1, // Minimal retries for baseline
      baseDelay: 200,
      maxDelay: 1000,
      backoffMultiplier: 1.2,
      retryableErrors: ['TIMEOUT']
    },
    isolation: {
      maxConcurrentCalls: 20, // High concurrency for baseline
      queueTimeout: 2000
    },
    monitoring: {
      enableMetrics: true,
      logErrors: false // Reduce noise for reliable provider
    }
  }
);

/**
 * GEMINI - OMNIS HARDENED (Vitesse + Intelligence)
 */
export const geminiOmnis = wrapProviderWithOmnis(
  geminiProvider,
  {
    // Fast and smart config
    timeoutMs: 7000,
    circuitBreaker: {
      failureThreshold: 3,
      recoveryTimeoutMs: 15000,
      halfOpenMaxCalls: 2
    },
    retry: {
      maxRetries: 2,
      baseDelay: 1000,
      maxDelay: 4000,
      backoffMultiplier: 2,
      retryableErrors: ['RATE_LIMIT', 'SERVER_ERROR', 'TIMEOUT', 'NETWORK_ERROR']
    },
    isolation: {
      maxConcurrentCalls: 8,
      queueTimeout: 3000
    },
    monitoring: {
      enableMetrics: true,
      logErrors: true
    }
  }
);

/**
 * OLLAMA - OMNIS HARDENED (Local LLM robuste)
 */
export const ollamaOmnis = wrapProviderWithOmnis(
  ollamaProvider,
  {
    // Local LLM tolerant config
    timeoutMs: 20000, // Longer timeout for local processing
    circuitBreaker: {
      failureThreshold: 8, // High tolerance for local setup
      recoveryTimeoutMs: 10000,
      halfOpenMaxCalls: 3
    },
    retry: {
      maxRetries: 3,
      baseDelay: 2000,
      maxDelay: 8000,
      backoffMultiplier: 1.8,
      retryableErrors: ['TIMEOUT', 'NETWORK_ERROR', 'SERVER_ERROR']
    },
    isolation: {
      maxConcurrentCalls: 4, // Lower concurrency for local resources
      queueTimeout: 5000
    },
    monitoring: {
      enableMetrics: true,
      logErrors: true
    }
  }
);

/**
 * TAURI CHAT - OMNIS HARDENED (Backend Rust performant)
 */
export const tauriChatOmnis = wrapProviderWithOmnis(
  tauriChatProvider,
  {
    // Rust backend optimized config
    timeoutMs: 6000,
    circuitBreaker: {
      failureThreshold: 5,
      recoveryTimeoutMs: 8000,
      halfOpenMaxCalls: 3
    },
    retry: {
      maxRetries: 2,
      baseDelay: 800,
      maxDelay: 3000,
      backoffMultiplier: 2,
      retryableErrors: ['TIMEOUT', 'NETWORK_ERROR']
    },
    isolation: {
      maxConcurrentCalls: 10,
      queueTimeout: 3000
    },
    monitoring: {
      enableMetrics: true,
      logErrors: true
    }
  }
);\n\n/**\n * ═══════════════════════════════════════════════════════════════════\n * OPENAI - OMNIS HARDENED MOCK (En attente du vrai provider)\n * ═══════════════════════════════════════════════════════════════════\n */\nconst openaiMockProvider = {\n  name: 'openai' as const,\n  async isAvailable(): Promise<boolean> {\n    return false; // Désactivé pour l'instant\n  },\n  async generate(): Promise<any> {\n    throw new Error('OpenAI provider not yet implemented - using fallback');\n  }\n};\n\nexport const openaiOmnis = wrapProviderWithOmnis(\n  openaiMockProvider,\n  {\n    // Quality-focused config (ready for real implementation)\n    timeoutMs: 15000,\n    circuitBreaker: {\n      failureThreshold: 4,\n      recoveryTimeoutMs: 30000,\n      halfOpenMaxCalls: 2\n    },\n    retry: {\n      maxRetries: 3,\n      baseDelay: 2000,\n      maxDelay: 10000,\n      backoffMultiplier: 2.2,\n      retryableErrors: ['RATE_LIMIT', 'SERVER_ERROR', 'TIMEOUT']\n    },\n    isolation: {\n      maxConcurrentCalls: 6,\n      queueTimeout: 4000\n    },\n    monitoring: {\n      enableMetrics: true,\n      logErrors: true\n    }\n  }\n);\n\n/**\n * ═══════════════════════════════════════════════════════════════════\n * CLAUDE - OMNIS HARDENED MOCK (En attente du vrai provider)\n * ═══════════════════════════════════════════════════════════════════\n */\nconst claudeMockProvider = {\n  name: 'claude' as const,\n  async isAvailable(): Promise<boolean> {\n    return false; // Désactivé pour l'instant\n  },\n  async generate(): Promise<any> {\n    throw new Error('Claude provider not yet implemented - using fallback');\n  }\n};\n\nexport const claudeOmnis = wrapProviderWithOmnis(\n  claudeMockProvider,\n  {\n    // Context-aware config (ready for real implementation)\n    timeoutMs: 12000,\n    circuitBreaker: {\n      failureThreshold: 4,\n      recoveryTimeoutMs: 25000,\n      halfOpenMaxCalls: 3\n    },\n    retry: {\n      maxRetries: 2,\n      baseDelay: 1500,\n      maxDelay: 8000,\n      backoffMultiplier: 2,\n      retryableErrors: ['RATE_LIMIT', 'SERVER_ERROR', 'TIMEOUT']\n    },\n    isolation: {\n      maxConcurrentCalls: 6,\n      queueTimeout: 4000\n    },\n    monitoring: {\n      enableMetrics: true,\n      logErrors: true\n    }\n  }\n);\n\n/**\n * ═══════════════════════════════════════════════════════════════════\n * OMNIS HARDENED PROVIDERS REGISTRY\n * ═══════════════════════════════════════════════════════════════════\n */\nexport const omnisHardenedProviders = {\n  'titane-local': titaneLocalOmnis,\n  'gemini': geminiOmnis,\n  'ollama': ollamaOmnis,\n  'tauri-chat': tauriChatOmnis,\n  'openai': openaiOmnis,\n  'claude': claudeOmnis\n} as const;\n\n/**\n * ═══════════════════════════════════════════════════════════════════\n * OMNIS PROVIDERS ARRAY (for orchestrator)\n * ═══════════════════════════════════════════════════════════════════\n */\nexport const omnisProvidersArray = [\n  titaneLocalOmnis,    // Baseline ultra-fiable\n  geminiOmnis,         // Vitesse + intelligence\n  tauriChatOmnis,      // Backend Rust performant\n  ollamaOmnis,         // Local LLM\n  // openaiOmnis,      // Quality provider (mock for now)\n  // claudeOmnis,      // Context provider (mock for now)\n];\n\n/**\n * ═══════════════════════════════════════════════════════════════════\n * OMNIS DIAGNOSTICS HELPERS\n * ═══════════════════════════════════════════════════════════════════\n */\nexport function getAllOmnisProviderStats() {\n  return Object.entries(omnisHardenedProviders).map(([name, provider]) => ({\n    name,\n    metrics: provider.getOmnisMetrics(),\n    isActive: provider.name in omnisHardenedProviders\n  }));\n}\n\nexport function resetAllOmnisProviders() {\n  Object.values(omnisHardenedProviders).forEach(provider => {\n    provider.resetOmnisMetrics();\n  });\n}\n\nexport function getOmnisSystemHealth(): {\n  overallHealth: number;\n  activeProviders: number;\n  totalProviders: number;\n  criticalIssues: string[];\n} {\n  const stats = getAllOmnisProviderStats();\n  const activeStats = stats.filter(s => s.isActive);\n  \n  const healthScores = activeStats.map(s => s.metrics.healthScore);\n  const overallHealth = healthScores.length > 0 \n    ? Math.round(healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length)\n    : 0;\n\n  const criticalIssues = activeStats\n    .filter(s => s.metrics.circuitBreakerState.state === 'OPEN')\n    .map(s => `${s.name}: Circuit breaker OPEN`);\n\n  return {\n    overallHealth,\n    activeProviders: activeStats.length,\n    totalProviders: stats.length,\n    criticalIssues\n  };\n}\n\n// Export types for external use\nexport type { OmnisWrapperConfig } from './providerWrapper_OMNIS_v1';
