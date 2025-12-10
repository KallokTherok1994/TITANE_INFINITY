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

import {
  wrapProviderWithOmnis,
  type OmnisWrapperConfig,
} from './providerWrapper_OMNIS_v1';

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
export const titaneLocalOmnis = wrapProviderWithOmnis(titaneLocalProvider, {
  // Ultra-reliable config for baseline provider
  circuitBreaker: {
    failureThreshold: 20, // Very high tolerance
    recoveryTimeoutMs: 5000, // Quick recovery
    halfOpenMaxCalls: 5,
  },
  retry: {
    maxRetries: 1, // Minimal retries for baseline
    baseDelay: 200,
    maxDelay: 1000,
    backoffMultiplier: 1.2,
    retryableErrors: ['TIMEOUT'],
  },
  isolation: {
    maxConcurrentCalls: 20, // High concurrency for baseline
    queueTimeout: 2000,
  },
  monitoring: {
    enableMetrics: true,
    logErrors: false, // Reduce noise for reliable provider
  },
});

/**
 * GEMINI - OMNIS HARDENED (Vitesse + Intelligence)
 */
export const geminiOmnis = wrapProviderWithOmnis(geminiProvider, {
  // Fast and smart config
  timeoutMs: 7000,
  circuitBreaker: {
    failureThreshold: 3,
    recoveryTimeoutMs: 15000,
    halfOpenMaxCalls: 2,
  },
  retry: {
    maxRetries: 2,
    baseDelay: 1000,
    maxDelay: 4000,
    backoffMultiplier: 2,
    retryableErrors: ['RATE_LIMIT', 'SERVER_ERROR', 'TIMEOUT', 'NETWORK_ERROR'],
  },
  isolation: {
    maxConcurrentCalls: 8,
    queueTimeout: 3000,
  },
  monitoring: {
    enableMetrics: true,
    logErrors: true,
  },
});

/**
 * OLLAMA - OMNIS HARDENED (Local LLM robuste)
 */
export const ollamaOmnis = wrapProviderWithOmnis(ollamaProvider, {
  // Local LLM tolerant config
  timeoutMs: 20000, // Longer timeout for local processing
  circuitBreaker: {
    failureThreshold: 8, // High tolerance for local setup
    recoveryTimeoutMs: 10000,
    halfOpenMaxCalls: 3,
  },
  retry: {
    maxRetries: 3,
    baseDelay: 2000,
    maxDelay: 8000,
    backoffMultiplier: 1.8,
    retryableErrors: ['TIMEOUT', 'NETWORK_ERROR', 'SERVER_ERROR'],
  },
  isolation: {
    maxConcurrentCalls: 4, // Lower concurrency for local resources
    queueTimeout: 5000,
  },
  monitoring: {
    enableMetrics: true,
    logErrors: true,
  },
});

/**
 * TAURI CHAT - OMNIS HARDENED (Backend Rust performant)
 */
export const tauriChatOmnis = wrapProviderWithOmnis(tauriChatProvider, {
  // Rust backend optimized config
  timeoutMs: 6000,
  circuitBreaker: {
    failureThreshold: 5,
    recoveryTimeoutMs: 8000,
    halfOpenMaxCalls: 3,
  },
  retry: {
    maxRetries: 2,
    baseDelay: 800,
    maxDelay: 3000,
    backoffMultiplier: 2,
    retryableErrors: ['TIMEOUT', 'NETWORK_ERROR'],
  },
  isolation: {
    maxConcurrentCalls: 10,
    queueTimeout: 3000,
  },
  monitoring: {
    enableMetrics: true,
    logErrors: true,
  },
});

/**
 * ═══════════════════════════════════════════════════════════════════
 * OPENAI - OMNIS HARDENED MOCK (En attente du vrai provider)
 * ═══════════════════════════════════════════════════════════════════
 */
const openaiMockProvider = {
  name: 'openai' as const,
  async isAvailable(): Promise<boolean> {
    return false; // Désactivé pour l'instant
  },
  async generate(): Promise<any> {
    throw new Error('OpenAI provider not yet implemented - using fallback');
  },
};

export const openaiOmnis = wrapProviderWithOmnis(openaiMockProvider, {
  // Quality-focused config (ready for real implementation)
  timeoutMs: 15000,
  circuitBreaker: {
    failureThreshold: 4,
    recoveryTimeoutMs: 30000,
    halfOpenMaxCalls: 2,
  },
  retry: {
    maxRetries: 3,
    baseDelay: 2000,
    maxDelay: 10000,
    backoffMultiplier: 2.2,
    retryableErrors: ['RATE_LIMIT', 'SERVER_ERROR', 'TIMEOUT'],
  },
  isolation: {
    maxConcurrentCalls: 6,
    queueTimeout: 4000,
  },
  monitoring: {
    enableMetrics: true,
    logErrors: true,
  },
});

/**
 * ═══════════════════════════════════════════════════════════════════
 * CLAUDE - OMNIS HARDENED MOCK (En attente du vrai provider)
 * ═══════════════════════════════════════════════════════════════════
 */
const claudeMockProvider = {
  name: 'claude' as const,
  async isAvailable(): Promise<boolean> {
    return false; // Désactivé pour l'instant
  },
  async generate(): Promise<any> {
    throw new Error('Claude provider not yet implemented - using fallback');
  },
};

export const claudeOmnis = wrapProviderWithOmnis(claudeMockProvider, {
  // Context-aware config (ready for real implementation)
  timeoutMs: 12000,
  circuitBreaker: {
    failureThreshold: 4,
    recoveryTimeoutMs: 25000,
    halfOpenMaxCalls: 3,
  },
  retry: {
    maxRetries: 2,
    baseDelay: 1500,
    maxDelay: 8000,
    backoffMultiplier: 2,
    retryableErrors: ['RATE_LIMIT', 'SERVER_ERROR', 'TIMEOUT'],
  },
  isolation: {
    maxConcurrentCalls: 6,
    queueTimeout: 4000,
  },
  monitoring: {
    enableMetrics: true,
    logErrors: true,
  },
});

/**
 * ═══════════════════════════════════════════════════════════════════
 * OMNIS HARDENED PROVIDERS REGISTRY
 * ═══════════════════════════════════════════════════════════════════
 */
export const omnisHardenedProviders = {
  'titane-local': titaneLocalOmnis,
  gemini: geminiOmnis,
  ollama: ollamaOmnis,
  'tauri-chat': tauriChatOmnis,
  openai: openaiOmnis,
  claude: claudeOmnis,
} as const;

/**
 * ═══════════════════════════════════════════════════════════════════
 * OMNIS PROVIDERS ARRAY (for orchestrator)
 * ═══════════════════════════════════════════════════════════════════
 */
export const omnisProvidersArray = [
  titaneLocalOmnis, // Baseline ultra-fiable
  geminiOmnis, // Vitesse + intelligence
  tauriChatOmnis, // Backend Rust performant
  ollamaOmnis, // Local LLM
  // openaiOmnis,      // Quality provider (mock for now)
  // claudeOmnis,      // Context provider (mock for now)
];

/**
 * ═══════════════════════════════════════════════════════════════════
 * OMNIS DIAGNOSTICS HELPERS
 * ═══════════════════════════════════════════════════════════════════
 */
export function getAllOmnisProviderStats() {
  return Object.entries(omnisHardenedProviders).map(([name, provider]) => ({
    name,
    metrics: provider.getOmnisMetrics(),
    isActive: provider.name in omnisHardenedProviders,
  }));
}

export function resetAllOmnisProviders() {
  Object.values(omnisHardenedProviders).forEach(provider => {
    provider.resetOmnisMetrics();
  });
}

export function getOmnisSystemHealth(): {
  overallHealth: number;
  activeProviders: number;
  totalProviders: number;
  criticalIssues: string[];
} {
  const stats = getAllOmnisProviderStats();
  const activeStats = stats.filter(s => s.isActive);

  const healthScores = activeStats.map(s => s.metrics.healthScore);
  const overallHealth =
    healthScores.length > 0
      ? Math.round(
          healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length
        )
      : 0;

  const criticalIssues = activeStats
    .filter(s => s.metrics.circuitBreakerState.state === 'OPEN')
    .map(s => `${s.name}: Circuit breaker OPEN`);

  return {
    overallHealth,
    activeProviders: activeStats.length,
    totalProviders: stats.length,
    criticalIssues,
  };
}

// Export types for external use
export type { OmnisWrapperConfig } from './providerWrapper_OMNIS_v1';
