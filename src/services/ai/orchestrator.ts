/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v30.0.0 — AI ORCHESTRATOR OMEGA (NEURAL ORDER)
 *   Orchestrator neural • Isolation absolue • Auto-heal intégré
 *   Architecture: Cloud-first → Sandbox providers → Fallback garanti → Never throw
 *   Lazy cloud providers, Circuit breaker, Rate limiting, Availability cache
 * ═══════════════════════════════════════════════════════════════════
 */

import type {
  AIMessage,
  AIResponse,
  AIConfig,
  ProviderChoice,
  AIProvider,
} from './types';
import type { AutoHealStats } from './autoHealEngine';
import type { AggregatedMetrics } from './metricsEngine';
import { autoHealEngine } from './autoHealEngine';
import { metricsEngine } from './metricsEngine';
import type { MetricsData } from '@/types/cognitiveKernel';
import { buildSystemPrompt as buildTitanePrompt } from '@/core/prompts';
import type { Provider as PromptProvider, PromptContext } from '@/core/prompts';
import { titaneLocalProvider } from './providers/titaneLocal'; // ← PREMIER (noyau infaillible)
import { tauriChatProvider } from './providers/tauriChat';
import { ollamaProvider } from './providers/ollama';
// v37.0.0: Cloud providers lazy-loaded on first use (OpenAI, Claude, Gemini, Copilot)
import { getOrLoadProvider, type LazyProviderName } from './AIProviderLazyLoader';
import { cognitiveKernel } from './cognitiveKernel'; // ← NOUVEAU v22Ω: Cognitive Kernel
import { circuitBreaker } from './circuitBreaker'; // ← v24.5: Circuit Breaker Pattern
import { rateLimiter } from './rateLimiter'; // ← v24.5: Frontend Rate Limiting
import { createLogger } from '@/utils/logger';
import {
  getProviderTimeout,
  CACHE_TTL,
  CIRCUIT_BREAKER,
  STREAM_CONFIG,
  AVAILABILITY_CACHE,
  REQUEST_BUDGETS,
} from '@/config/aiTimeouts.config'; // ← v22Ω: Centralized timeouts
import { getChampion } from './championChallenger'; // ← OMEGA Champion/Challenger
import type { CanonicalMode } from './omegaModeClassifier'; // ← for champion scoring cast

const logger = createLogger('Orchestrator');

type LoadedEngines = {
  autoHeal: typeof autoHealEngine;
  metrics: typeof metricsEngine;
};

let enginesPromise: Promise<LoadedEngines> | null = null;

const ensureEngines = async (): Promise<LoadedEngines> => {
  if (!enginesPromise) {
    enginesPromise = Promise.resolve({
      autoHeal: autoHealEngine,
      metrics: metricsEngine,
    });
  }

  return enginesPromise;
};

const NULL_BYTE = String.fromCharCode(0);
const CONTROL_CHAR_DETECTOR = /\p{Cc}/u;
const CONTROL_CHAR_REMOVER = /\p{Cc}+/gu;

const IS_VITEST =
  // Vitest exposes `import.meta.env.VITEST` and typically runs with MODE === 'test'.
  (typeof import.meta !== 'undefined' &&
    Boolean((import.meta as any)?.env?.VITEST) &&
    true) ||
  (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.MODE === 'test') ||
  // Fallbacks for non-Vite contexts.
  (typeof process !== 'undefined' && Boolean((process as any)?.env?.VITEST)) ||
  (typeof process !== 'undefined' && (process as any)?.env?.NODE_ENV === 'test');

// ─────────────────────────────────────────────────────────────────
// TYPES OMEGA ORCHESTRATOR
// ─────────────────────────────────────────────────────────────────

// v30.3.0: Error type classification for intelligent failover
type ErrorSignature = 'timeout' | 'rate_limit' | 'auth_failed' | 'network' | 'model_error' | 'unknown';

interface ProviderStats {
  name: string;
  totalRequests: number;
  successCount: number;
  failureCount: number;
  avgResponseTime: number;
  lastUsed: number;
  lastFailure: number;
  reliability: number; // 0-100
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
  // v30.3.0: Error-type tracking for intelligent failover
  lastErrorType?: ErrorSignature;
  recentErrors: { type: ErrorSignature; timestamp: number }[];
}

interface OrchestratorMetrics {
  totalRequests: number;
  totalSuccesses: number;
  totalFailures: number;
  avgResponseTime: number;
  fallbackRate: number;
  autoHealTriggers: number;
  lastActivity: number;
}

interface NeuralSelection {
  selectedProvider: string;
  reason: 'optimal' | 'fallback' | 'availability' | 'recovery' | 'emergency';
  confidence: number; // 0-100
  alternates: string[];
}

interface ProvidersStatusSnapshot {
  providers: ProviderStats[];
  orchestrator: OrchestratorMetrics;
  autoHeal: AutoHealStats | (AutoHealStats & { providers: Record<string, unknown> });
  metrics: AggregatedMetrics;
  timestamp: number;
}

interface HealthCheckSnapshot {
  overall: 'healthy' | 'degraded' | 'critical';
  providers: { name: string; status: string; available: boolean }[];
  autoHeal: AutoHealStats;
  recommendations: string[];
}

type ProviderHistoryCache = Map<string, AIMessage[]>;

// ─────────────────────────────────────────────────────────────────
// ORCHESTRATOR OMEGA CLASS
// ─────────────────────────────────────────────────────────────────

class AIOrchestrator {
  // ═══ v24.3: CLOUD FIRST - Mode EN LIGNE prioritaire ═══
  // Ordre: Cloud APIs (qualité) → Backend Rust → Ollama (mémoire locale) → Local (fallback)
  // IMPORTANT: APIs cloud = réponses de meilleure qualité, Ollama = mémoire persistante
  // v37.0.0: Eager providers (local-first, always available)
  // FIX: Lazy initialization to avoid ReferenceError on uninitialized variables
  private eagerProviders: AIProvider[] = []; // Will be initialized in constructor

  // v37.0.0: Lazy providers (cloud, loaded on demand)
  private lazyProviderNames: LazyProviderName[] = [
    'claude',
    'openai',
    'copilot',
    'gemini',
  ];
  private loadedProviders: Map<string, AIProvider> = new Map();

  // Combined providers list (for compatibility)
  private get providers(): AIProvider[] {
    return [...this.eagerProviders, ...Array.from(this.loadedProviders.values())];
  }

  private providerStats: Map<string, ProviderStats> = new Map();
  private orchestratorMetrics: OrchestratorMetrics = {
    totalRequests: 0,
    totalSuccesses: 0,
    totalFailures: 0,
    avgResponseTime: 0,
    fallbackRate: 0,
    autoHealTriggers: 0,
    lastActivity: 0,
  };

  private isWarmup = false;
  private maxConcurrent = 3;
  private currentRequests = 0;
  private lastProviderUsed: string | null = null;
  private consecutiveLocalResponses = 0;
  private readonly diversityThreshold = 2;

  // AUTOFIX v19.3Ω: Quick-fail cache for providers that failed very recently
  // v22Ω: Using centralized config from aiTimeouts.config.ts
  private readonly QUICK_FAIL_COOLDOWN_MS = CACHE_TTL.quickFailCooldown;
  private quickFailCache: Map<string, number> = new Map(); // provider -> failedAt timestamp

  // EVOLUTION v21Ω: TTL cleanup interval for quick-fail cache
  private quickFailCleanupInterval: ReturnType<typeof setInterval> | null = null;

  // v22Ω: Metrics cache to avoid redundant getAggregatedMetrics() calls
  private metricsCache: {
    data: ReturnType<
      typeof import('./metricsEngine').metricsEngine.getAggregatedMetrics
    > | null;
    timestamp: number;
  } = { data: null, timestamp: 0 };

  // v22Ω OPT12: Provider availability cache (60s TTL)
  private availabilityCache: Map<string, { available: boolean; timestamp: number }> =
    new Map();

  // v22Ω: Critical error tracking for degraded mode (using centralized config)
  private criticalErrorHistory: number[] = []; // timestamps of critical errors
  private readonly CRITICAL_ERROR_WINDOW_MS = CIRCUIT_BREAKER.criticalErrorWindow;
  private readonly CRITICAL_ERROR_THRESHOLD = CIRCUIT_BREAKER.criticalErrorThreshold;
  private isDegradedMode = false;
  private readonly METRICS_CACHE_TTL_MS = CACHE_TTL.metrics;
  private readonly STATUS_CACHE_TTL_MS = 2000;
  private readonly HEALTH_CHECK_CACHE_TTL_MS = 2000;
  private providersStatusCache: {
    data: ProvidersStatusSnapshot | null;
    timestamp: number;
  } = { data: null, timestamp: 0 };
  private healthCheckCache: { data: HealthCheckSnapshot | null; timestamp: number } = {
    data: null,
    timestamp: 0,
  };

  constructor() {
    const resolveProviderSafely = (
      providerName: string,
      getter: () => AIProvider | undefined
    ): AIProvider | undefined => {
      try {
        return getter();
      } catch (error) {
        logger.warn(`Provider binding not ready during init: ${providerName}`, {
          error: String((error as Error)?.message || error),
        });
        return undefined;
      }
    };

    const tauriProvider = resolveProviderSafely('tauri-backend', () => tauriChatProvider);
    const ollamaLocalProvider = resolveProviderSafely('ollama', () => ollamaProvider);
    const localFallbackProvider = resolveProviderSafely(
      'titane-local',
      () => titaneLocalProvider
    );

    // Initialize eager providers safely (they may be undefined at import time)
    // Order: Tauri (Rust backend) → Ollama (local memory) → TitaneLocal (fallback)
    const eagerCandidates: (AIProvider | undefined)[] = [
      tauriProvider, // #1 Backend Rust (cascade interne)
      ollamaLocalProvider, // #2 Ollama (mémoire locale + analyse permanente)
      localFallbackProvider, // #3 Fallback local (noyau infaillible)
    ];

    // Filter out undefined providers and ensure we have the fallback
    this.eagerProviders = eagerCandidates.filter((provider): provider is AIProvider =>
      Boolean(provider)
    );

    // Ensure titaneLocalProvider is always available as fallback
    if (localFallbackProvider && !this.eagerProviders.includes(localFallbackProvider)) {
      this.eagerProviders.push(localFallbackProvider);
    }

    this.initializeProviderStats();
    // En contexte tests (Vitest), on évite tout side-effect à l'import :
    // - warmup (appels provider.isAvailable → secureInvoke)
    // - setInterval de cleanup
    if (!IS_VITEST) {
      this.startWarmup();
      this.startQuickFailCleanup();
    }
  }

  /**
   * EVOLUTION v21Ω: Periodic cleanup of expired quick-fail cache entries
   * v30.0.0: Extended to also evict stale availability cache + critical error history
   * Prevents memory leaks from stale entries when no requests are made
   */
  private startQuickFailCleanup(): void {
    // Cleanup every 30 seconds
    this.quickFailCleanupInterval = setInterval(() => {
      const now = Date.now();

      // 1. Quick-fail cache: remove expired entries
      for (const [provider, failedAt] of this.quickFailCache.entries()) {
        if (now - failedAt >= this.QUICK_FAIL_COOLDOWN_MS) {
          this.quickFailCache.delete(provider);
        }
      }

      // 2. Availability cache: remove entries older than 2× TTL
      const availabilityMaxAge = CACHE_TTL.providerAvailability * 2;
      for (const [key, entry] of this.availabilityCache.entries()) {
        if (now - entry.timestamp > availabilityMaxAge) {
          this.availabilityCache.delete(key);
        }
      }

      // 3. Critical error history: prune timestamps outside the window
      this.criticalErrorHistory = this.criticalErrorHistory.filter(
        ts => now - ts < this.CRITICAL_ERROR_WINDOW_MS
      );

      // 4. Expire stale caches (metrics, status, health)
      this.metricsCache = this.expireCache(
        this.metricsCache,
        this.METRICS_CACHE_TTL_MS * 2
      );
      this.providersStatusCache = this.expireCache(
        this.providersStatusCache,
        this.STATUS_CACHE_TTL_MS * 2
      );
      this.healthCheckCache = this.expireCache(
        this.healthCheckCache,
        this.HEALTH_CHECK_CACHE_TTL_MS * 2
      );
    }, 30000);
  }

  /**
   * EVOLUTION v21Ω: Stop cleanup interval (for testing/shutdown)
   */
  stopQuickFailCleanup(): void {
    if (this.quickFailCleanupInterval) {
      clearInterval(this.quickFailCleanupInterval);
      this.quickFailCleanupInterval = null;
    }
  }

  /**
   * v30.0.0: Expire a simple {data, timestamp} cache if older than maxAge.
   */
  private expireCache<T>(
    cache: { data: T | null; timestamp: number },
    maxAgeMs: number
  ): { data: T | null; timestamp: number } {
    if (cache.data && Date.now() - cache.timestamp > maxAgeMs) {
      return { data: null, timestamp: 0 };
    }
    return cache;
  }

  /**
   * v22Ω: Cleanup all resources to prevent memory leaks
   * Call this when shutting down the orchestrator
   */
  destroy(): void {
    this.stopQuickFailCleanup();
    this.quickFailCache.clear();
    this.availabilityCache.clear(); // v22Ω OPT12: Clear availability cache
    this.metricsCache = { data: null, timestamp: 0 };
    this.providersStatusCache = { data: null, timestamp: 0 };
    this.healthCheckCache = { data: null, timestamp: 0 };
    this.criticalErrorHistory = [];
    this.isDegradedMode = false;
    if (this.quickFailCleanupInterval) {
      clearInterval(this.quickFailCleanupInterval);
      this.quickFailCleanupInterval = null;
    }
    logger.info('Orchestrator destroyed and resources cleaned up');
  }

  private invalidateStatusCaches(): void {
    this.providersStatusCache = { data: null, timestamp: 0 };
    this.healthCheckCache = { data: null, timestamp: 0 };
  }

  /**
   * v22Ω: Get cached metrics with TTL to avoid redundant calls
   */
  private getCachedMetrics(metricsEngine: {
    getAggregatedMetrics: () => ReturnType<
      typeof import('./metricsEngine').metricsEngine.getAggregatedMetrics
    >;
  }): NonNullable<typeof this.metricsCache.data> {
    const now = Date.now();
    if (
      this.metricsCache.data &&
      now - this.metricsCache.timestamp < this.METRICS_CACHE_TTL_MS
    ) {
      return this.metricsCache.data;
    }
    const freshMetrics = metricsEngine.getAggregatedMetrics();
    this.metricsCache = { data: freshMetrics, timestamp: now };
    return freshMetrics;
  }

  /**
   * v22Ω OPT12: Check provider availability with 60s TTL cache
   * Reduces redundant availability checks from ~6/request to ~1/minute
   */
  private async checkAvailabilityWithCache(provider: AIProvider): Promise<boolean> {
    const now = Date.now();
    const cached = this.availabilityCache.get(provider.name);

    // Return cached value if fresh (within TTL)
    if (cached && now - cached.timestamp < AVAILABILITY_CACHE.ttlMs) {
      return cached.available;
    }

    // Perform fresh availability check with timeout
    try {
      const isAvailable = await Promise.race([
        provider.isAvailable(),
        new Promise<boolean>((_, reject) =>
          setTimeout(
            () => reject(new Error('Availability check timeout')),
            AVAILABILITY_CACHE.checkTimeoutMs
          )
        ),
      ]);

      // Cache the result
      this.availabilityCache.set(provider.name, {
        available: isAvailable,
        timestamp: now,
      });
      return isAvailable;
    } catch (error) {
      // On timeout/error, cache as unavailable for shorter period (5s)
      this.availabilityCache.set(provider.name, {
        available: false,
        timestamp: now - AVAILABILITY_CACHE.ttlMs + 5000,
      });
      return false;
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 3.1: INITIALISATION STATS PROVIDERS + WARMUP
   * ═══════════════════════════════════════════════════════════════════
   */

  private initializeProviderStats(): void {
    // v37.0.0: Initialize stats for eager providers only
    // Lazy providers get stats when first loaded
    this.eagerProviders.forEach(provider => {
      this.providerStats.set(provider.name, {
        name: provider.name,
        totalRequests: 0,
        successCount: 0,
        failureCount: 0,
        avgResponseTime: 0,
        lastUsed: 0,
        lastFailure: 0,
        reliability: 100, // Start optimistic
        status: 'healthy',
        recentErrors: [],
      });
    });

    // Initialize placeholder stats for lazy providers
    this.lazyProviderNames.forEach(providerName => {
      this.providerStats.set(providerName, {
        name: providerName,
        totalRequests: 0,
        successCount: 0,
        failureCount: 0,
        avgResponseTime: 0,
        lastUsed: 0,
        lastFailure: 0,
        reliability: 100,
        status: 'offline', // Mark as offline until loaded
        recentErrors: [],
      });
    });

    this.invalidateStatusCaches();
  }

  /**
   * ✨ v24.3.6: Optimized warmup with global timeout
   * - Global 3s timeout prevents hanging on slow networks
   * - Per-provider 1s timeout for fast failover
   * - Non-blocking: app can start while warmup completes
   */
  private async startWarmup(): Promise<void> {
    if (IS_VITEST) return;
    if (this.isWarmup) return;
    this.isWarmup = true;

    const GLOBAL_WARMUP_TIMEOUT = 3000; // ✨ v24.3.6: 3s max total warmup
    const PER_PROVIDER_TIMEOUT = 1000; // ✨ v24.3.6: 1s per provider (was 1.5s)

    try {
      logger.info('Starting provider warmup (v24.3.6 optimized)...');

      // Warmup en parallèle avec timeout court pour performance
      // v37.0.0: Warmup only eager providers (local-first)
      // Lazy providers warmup when first requested
      const warmupPromises = this.eagerProviders.map(async provider => {
        try {
          const isAvailable = await Promise.race([
            provider.isAvailable(),
            new Promise<boolean>(resolve =>
              setTimeout(
                () => resolve(provider.name === 'titane-local'),
                PER_PROVIDER_TIMEOUT
              )
            ),
          ]);

          const stats = this.providerStats.get(provider.name);
          if (stats) {
            stats.status = isAvailable ? 'healthy' : 'offline';
          }

          return { provider: provider.name, available: isAvailable };
        } catch {
          const stats = this.providerStats.get(provider.name);
          if (stats) {
            stats.status = 'degraded';
          }
          return { provider: provider.name, available: false };
        }
      });

      // ✨ v24.3.6: Global timeout to prevent hanging
      const warmupResults = await Promise.race([
        Promise.allSettled(warmupPromises),
        new Promise<PromiseSettledResult<{ provider: string; available: boolean }>[]>(
          resolve =>
            setTimeout(() => {
              logger.warn(
                `Warmup global timeout (${GLOBAL_WARMUP_TIMEOUT}ms), proceeding with available providers`
              );
              resolve([]);
            }, GLOBAL_WARMUP_TIMEOUT)
        ),
      ]);

      logger.info(
        `Warmup complete (${warmupResults.length} providers):`,
        warmupResults.map(r => (r.status === 'fulfilled' ? r.value : { error: true }))
      );
      this.invalidateStatusCaches();
    } catch (error) {
      logger.error('Warmup failed', error);
    } finally {
      this.isWarmup = false;
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 3.2: MESSAGE SANITIZATION + VALIDATION STRICTE
   * ═══════════════════════════════════════════════════════════════════
   */

  private sanitizeMessage(message: string): {
    sanitized: string;
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    const fatalIssues: string[] = [];

    // Quick type check
    if (!message || typeof message !== 'string') {
      fatalIssues.push('Invalid message type');
      return { sanitized: '', valid: false, issues };
    }

    // Fast trim and basic validation
    let sanitized = message.trim();
    const originalLength = sanitized.length;

    // Validation longueur (optimisé)
    if (originalLength === 0) {
      fatalIssues.push('Empty message');
      return { sanitized: '', valid: false, issues };
    }

    // Support messages plus longs (50k max)
    if (originalLength > 50000) {
      issues.push('Message too long (>50k chars)');
      sanitized = sanitized.substring(0, 50000);
    }

    // Nettoyage sécurisé
    sanitized = sanitized
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/data:.*,/gi, ''); // Remove data URLs

    // Validation caractères dangereux
    const sanitizers: Array<{
      hasIssue: (value: string) => boolean;
      clean: (value: string) => string;
    }> = [
      {
        hasIssue: value => value.includes(NULL_BYTE),
        clean: value => value.split(NULL_BYTE).join(''),
      },
      {
        hasIssue: value => CONTROL_CHAR_DETECTOR.test(value),
        clean: value => value.replace(CONTROL_CHAR_REMOVER, ''),
      },
    ];

    sanitizers.forEach(({ hasIssue, clean }) => {
      if (hasIssue(sanitized)) {
        issues.push('Dangerous characters detected');
        sanitized = clean(sanitized);
      }
    });

    return {
      sanitized,
      valid: sanitized.length > 0 && fatalIssues.length === 0,
      issues: [...fatalIssues, ...issues],
    };
  }

  /**
   * Determine governance status based on metrics
   */
  private determineGovernanceStatus(
    metrics: AggregatedMetrics
  ): 'configured' | 'partial' | 'unconfigured' {
    const successRate = metrics.successRate || 0;
    const errorFrequency =
      metrics.totalErrors / Math.max(1, metrics.uptime / (60 * 60 * 1000));

    // Configured governance: high success rate, low errors
    if (successRate >= 0.9 && errorFrequency < 1) {
      return 'configured';
    }

    // Unconfigured governance: low success rate or high errors
    if (successRate < 0.5 || errorFrequency > 5) {
      return 'unconfigured';
    }

    // Partial governance: everything in between
    return 'partial';
  }

  /**
   * v30.3.0: Classify error type for intelligent failover routing
   * Different error types warrant different retry strategies
   */
  private classifyError(error: unknown): ErrorSignature {
    const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

    if (msg.includes('timeout') || msg.includes('timed out') || msg.includes('econnaborted')) {
      return 'timeout';
    }
    if (msg.includes('rate limit') || msg.includes('429') || msg.includes('too many requests')) {
      return 'rate_limit';
    }
    if (msg.includes('401') || msg.includes('403') || msg.includes('unauthorized') || msg.includes('forbidden') || msg.includes('api key')) {
      return 'auth_failed';
    }
    if (msg.includes('econnrefused') || msg.includes('enotfound') || msg.includes('network') || msg.includes('fetch failed') || msg.includes('econnreset')) {
      return 'network';
    }
    if (msg.includes('model') || msg.includes('invalid') || msg.includes('context length') || msg.includes('content filter')) {
      return 'model_error';
    }
    return 'unknown';
  }

  /**
   * v30.3.0: Compute error-type-aware penalty for provider scoring
   * - rate_limit: heavy penalty (wait required), strongly boost others
   * - timeout: moderate penalty (may recover soon)
   * - auth_failed: severe penalty (won't recover without config change)
   * - network: moderate penalty with faster recovery
   * - model_error: light penalty (request-specific, not provider-wide)
   */
  private computeErrorPenalty(stats: ProviderStats): number {
    const now = Date.now();
    // Clean old errors (>60s)
    stats.recentErrors = stats.recentErrors.filter(e => now - e.timestamp < 60000);

    if (stats.recentErrors.length === 0) return 0;

    let penalty = 0;
    const errorCounts = new Map<ErrorSignature, number>();
    for (const err of stats.recentErrors) {
      errorCounts.set(err.type, (errorCounts.get(err.type) || 0) + 1);
    }

    // Type-specific penalties
    penalty += (errorCounts.get('rate_limit') || 0) * 40;    // Heavy: must wait
    penalty += (errorCounts.get('auth_failed') || 0) * 60;   // Severe: config broken
    penalty += (errorCounts.get('timeout') || 0) * 20;       // Moderate: may recover
    penalty += (errorCounts.get('network') || 0) * 25;       // Moderate: transient
    penalty += (errorCounts.get('model_error') || 0) * 10;   // Light: request-specific
    penalty += (errorCounts.get('unknown') || 0) * 15;

    return Math.min(80, penalty); // Cap penalty
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 3.3: NEURAL PROVIDER SELECTION (Intelligence Adaptive)
   * ═══════════════════════════════════════════════════════════════════
   */

  private async selectOptimalProvider(
    message: string,
    history: AIMessage[],
    preferredProvider?: ProviderChoice,
    canonicalMode?: string
  ): Promise<NeuralSelection> {
    // ✨ v21: Force specific provider from trusted config (UI/tests), not from user message content.
    // Mapping: 'local' means "local LLM" (Ollama), while 'titane-local' remains the ultimate fallback.
    if (preferredProvider && preferredProvider !== 'auto') {
      const forcedProvider = preferredProvider === 'local' ? 'ollama' : preferredProvider;

      if (this.providers.some(provider => provider.name === forcedProvider)) {
        const alternates = this.providers
          .map(provider => provider.name)
          .filter(name => name !== forcedProvider)
          .slice(0, 3);

        return {
          selectedProvider: forcedProvider,
          reason: 'availability',
          confidence: 100,
          alternates,
        };
      }
    }

    // Vitest: keep tests deterministic + fast by default.
    // Without this, selection can prefer cloud providers and spend multiple
    // availability checks per request, causing E2E timeouts.
    if (IS_VITEST && (!preferredProvider || preferredProvider === 'auto')) {
      const alternates = this.providers
        .map(provider => provider.name)
        .filter(name => name !== 'titane-local')
        .slice(0, 3);

      return {
        selectedProvider: 'titane-local',
        reason: 'availability',
        confidence: 100,
        alternates,
      };
    }

    // Analyse contextuelle du message
    const messageLength = message.length;
    const contextLength = history.reduce((sum, msg) => sum + msg.content.length, 0);
    const isComplexQuery = messageLength > 200 || contextLength > 5000;
    const requiresRealtime =
      message.toLowerCase().includes('temps réel') ||
      message.toLowerCase().includes('maintenant');

    // 📊 NOUVEAU v20Ω: Obtenir métriques en temps réel pour ajuster le scoring
    // v22Ω: Utiliser cache TTL 1s pour éviter appels redondants
    const { metrics: _metricsLoaded } = await ensureEngines();
    const realtimeMetrics = this.getCachedMetrics(_metricsLoaded);

    // Scoring neuronal des providers
    const providerScores = new Map<string, number>();

    this.providers.forEach(provider => {
      const stats = this.providerStats.get(provider.name);
      if (!stats) return;

      let score = stats.reliability; // Base score (0-100)

      // 📊 NOUVEAU: Ajustement basé sur métriques réelles
      const providerMetrics = realtimeMetrics.providers.find(
        (p: { provider: string }) => p.provider === provider.name
      );
      if (providerMetrics) {
        // Bonus si provider très performant récemment
        if (providerMetrics.successRate > 95 && providerMetrics.avgLatency < 3000) {
          score += 15; // ✅ Boost performance récente
        }
        // Malus si latence élevée récemment
        if (providerMetrics.avgLatency > 10000) {
          score -= 20; // ⚠️ Pénaliser lenteur
        }
        // Malus si taux d'échec élevé (but with recovery mechanism)
        if (providerMetrics.successRate < 70) {
          score -= 30; // ❌ Pénaliser instabilité
        }
      }

      // EVOLUTION v21Ω: Recovery boost for providers that haven't been tried recently
      // Prevents "rich get richer" feedback loops by giving idle providers a chance
      const timeSinceLastUsed = Date.now() - stats.lastUsed;
      const timeSinceLastFailure = Date.now() - stats.lastFailure;

      // If provider hasn't been used in 10s and hasn't failed in 10s, give recovery boost
      if (
        timeSinceLastUsed > 10000 &&
        timeSinceLastFailure > 10000 &&
        stats.reliability < 80
      ) {
        const recoveryBoost = Math.min(20, (timeSinceLastUsed - 10000) / 10000); // +1 per 10s idle, max +20
        score += recoveryBoost;
        logger.debug(
          `   🔄 Recovery boost for ${provider.name}: +${recoveryBoost.toFixed(1)}`
        );
      }

      // ═══ v24.3: CLOUD FIRST SCORING - Mode EN LIGNE prioritaire ═══
      // Les APIs cloud ont des BONUS MASSIFS car elles offrent la meilleure qualité
      // Ollama = mémoire locale (toujours actif en background pour sauvegarde)
      switch (provider.name) {
        case 'claude':
          // 🥇 PRIORITÉ #1: Claude = meilleur raisonnement, contexte long
          score += 50; // CLOUD PRIORITY BOOST
          score += isComplexQuery ? 35 : 25; // Excellent sur complexité
          score += contextLength > 5000 ? 25 : 10; // Superbe contexte long
          score -= !IS_VITEST && stats.status === 'offline' ? 30 : 0; // Malus réduit
          break;

        case 'openai':
          // 🥈 PRIORITÉ #2: OpenAI = polyvalent, rapide
          score += 45; // CLOUD PRIORITY BOOST
          score += isComplexQuery ? 30 : 20; // Excellent sur complexité
          score += messageLength > 1000 ? 15 : 5; // Bon sur longs messages
          score -= !IS_VITEST && stats.status === 'offline' ? 30 : 0; // Malus réduit
          break;

        case 'copilot':
          // 🆕 PRIORITÉ #2.5: GitHub Copilot = OpenAI-compatible, écosystème GitHub
          score += 42; // CLOUD PRIORITY BOOST (between OpenAI and Gemini)
          score += isComplexQuery ? 28 : 18; // Très bon sur complexité (GPT-4)
          score += messageLength > 1000 ? 12 : 5; // Bon sur longs messages
          score -= !IS_VITEST && stats.status === 'offline' ? 30 : 0; // Malus réduit
          break;

        case 'gemini':
          // 🥉 PRIORITÉ #3: Gemini = multimodal, gratuit
          score += 40; // CLOUD PRIORITY BOOST
          score += isComplexQuery ? 25 : 15; // Bon sur complexe
          score += requiresRealtime ? 15 : 0; // Bonus temps réel
          score -= !IS_VITEST && stats.status === 'offline' ? 30 : 0; // Malus réduit
          break;

        case 'tauri-backend':
          // #4: Backend Rust (cascade interne)
          score += 20; // Bonus modéré
          score += isComplexQuery ? 15 : 10;
          score -= contextLength > 10000 ? 10 : 0;
          break;

        case 'ollama': {
          // #5: Ollama — CHAMPION MODE AWARE
          // Mode local forcé: Score très haut pour Ollama exclusif
          // Mode champion (per registry): Score élevé pour priorité champion
          // Mode auto sans champion: Score modéré comme fallback local
          if (preferredProvider === 'local') {
            score += 200; // Mode local forcé
            logger.debug('   🏠 LOCAL MODE FORCÉ: Ollama exclusif');
          } else if (canonicalMode) {
            const champion = getChampion(canonicalMode as CanonicalMode);
            if (champion?.provider === 'ollama') {
              score += 120; // 🏆 OLLAMA CHAMPION: priorité maximale pour ce mode
              logger.debug(`   🏆 OLLAMA CHAMPION: mode=${canonicalMode} boost=+120`);
            } else {
              score += 30; // Score modéré si non-champion pour ce mode
              logger.debug('   🏠 AUTO MODE: Ollama non-champion (fallback local)');
            }
          } else {
            score += 30; // Score de base sans info de mode
            logger.debug('   🏠 AUTO MODE: Ollama fallback local (pas de canonicalMode)');
          }
          score += messageLength < 500 ? 10 : 0; // Bonus messages courts
          score += !requiresRealtime ? 5 : 0; // Légèrement bon si async OK
          break;
        }

        case 'titane-local':
          // #6: Fallback ultime (noyau infaillible)
          score += requiresRealtime ? 15 : 0; // Bonus temps réel seulement
          // Pas de boost de base = dernier recours
          break;
      }

      // v30.3.0: Error-type-aware penalty replaces flat -25pts
      // Different error types get different penalties (rate_limit=heavy, timeout=moderate, etc.)
      const errorPenalty = this.computeErrorPenalty(stats);
      if (errorPenalty > 0) {
        score -= errorPenalty;
        logger.debug(`   ⚠️ Error penalty for ${provider.name}: -${errorPenalty} (${stats.recentErrors.map(e => e.type).join(',')})`);
      }

      // Encourage provider diversity by penalizing recently used engines (except titane-local emergency fallback)
      if (
        stats.lastUsed &&
        Date.now() - stats.lastUsed < 2000 &&
        provider.name === this.lastProviderUsed
      ) {
        score -= 20;
      }

      // Malus surcharge
      if (
        provider.name !== 'titane-local' &&
        this.currentRequests >= this.maxConcurrent
      ) {
        score -= 20;
      }

      // v22Ω: Validate score is finite and in valid range
      const finalScore = Math.max(0, score);
      if (!Number.isFinite(finalScore)) {
        logger.error(`Invalid score for ${provider.name}: ${score}, defaulting to 0`);
        providerScores.set(provider.name, 0);
      } else {
        providerScores.set(provider.name, finalScore);
      }
    });

    const sortedProviders = Array.from(providerScores.entries()).sort(
      ([, a], [, b]) => b - a
    );
    const defaultBest = sortedProviders[0];

    let bestProvider = defaultBest?.[0] || 'titane-local';
    let bestScore = defaultBest?.[1] || 0;
    let reason: NeuralSelection['reason'] =
      bestScore > 80 ? 'optimal' : bestScore > 60 ? 'fallback' : 'availability';

    if (this.shouldForceDiversity() && bestProvider === 'titane-local') {
      const geminiCandidate = sortedProviders.find(([name]) => name === 'gemini');
      const diversityCandidate =
        geminiCandidate || sortedProviders.find(([name]) => name !== 'titane-local');

      if (diversityCandidate) {
        bestProvider = diversityCandidate[0];
        bestScore = diversityCandidate[1];
        reason = 'recovery';
        this.consecutiveLocalResponses = 0;
      }
    }

    // EVOLUTION v21Ω: Removed user-input-based provider selection override
    // SECURITY: User message content should NOT influence provider selection
    // Previous code allowed "auto-heal" keyword to force Gemini selection
    // Now provider selection is purely based on scoring algorithm

    // Alternates (top 3 autres)
    const alternates = sortedProviders
      .filter(([name]) => name !== bestProvider)
      .slice(0, 3)
      .map(([name]) => name);

    return {
      selectedProvider: bestProvider,
      reason,
      confidence: Math.min(100, bestScore),
      alternates,
    };
  }

  private shouldForceDiversity(): boolean {
    return this.consecutiveLocalResponses >= this.diversityThreshold;
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 3.4: GÉNÉRATION AVEC ISOLATION PROVIDERS + AUTO-HEAL
   * ═══════════════════════════════════════════════════════════════════
   */

  async generate(
    message: string,
    history: AIMessage[] = [],
    config?: AIConfig
  ): Promise<AIResponse> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const requestStartTime = Date.now();
    const globalBudgetMs = Math.min(
      config?.timeout ?? REQUEST_BUDGETS.globalRequestMs,
      REQUEST_BUDGETS.globalRequestMs
    );
    let routerLatencyMs = 0;
    let lastProviderLatencyMs = 0;
    let finalProviderUsed: string | null = null;

    // 🚨 DEBUG CRITICAL: Log entrée orchestrator (désactivé en production)
    // console.log('[aiOrchestrator] 📨 generate() APPELÉ', {
    //   message: message.substring(0, 100),
    //   historyLength: history.length,
    //   preferredProvider: config?.preferredProvider,
    //   timestamp: new Date().toISOString(),
    // });

    // Ensure engines are loaded
    const { autoHeal, metrics: _metrics } = await ensureEngines();

    // Increment metrics
    this.orchestratorMetrics.totalRequests++;
    this.orchestratorMetrics.lastActivity = Date.now();

    try {
      // ═══ PHASE 3.4.1: VALIDATION MESSAGE ===
      const { sanitized, valid, issues } = this.sanitizeMessage(message);

      if (!valid) {
        const error = `Invalid message: ${issues.join(', ')}`;
        autoHeal.heal('orchestrator', error, 'validation', { issues, requestId });
        throw new Error(error);
      }

      logger.group('Neural Generation');
      logger.info(`Request ID: ${requestId}`);
      logger.info(
        `Message: "${sanitized.substring(0, 60)}${sanitized.length > 60 ? '...' : ''}"`,
        { historyLength: history.length }
      );
      logger.groupEnd();

      // ═══ PHASE 3.4.2: NEURAL PROVIDER SELECTION + COGNITIVE KERNEL v22Ω ═══

      // v22Ω: Check degraded mode - if active, force titane-local only
      if (this.isDegradedMode) {
        logger.warn('⚠️ DEGRADED MODE: Using titane-local only for stability');
        const localProvider = this.providers.find(p => p.name === 'titane-local');
        if (localProvider) {
          try {
            const response = await this.executeProviderIsolated(
              localProvider,
              sanitized,
              history,
              5000,
              requestId
            );
            // Success in degraded mode - check if we can exit
            this.criticalErrorHistory = this.criticalErrorHistory.filter(
              ts => Date.now() - ts < this.CRITICAL_ERROR_WINDOW_MS
            );
            if (this.criticalErrorHistory.length < this.CRITICAL_ERROR_THRESHOLD) {
              this.isDegradedMode = false;
              logger.info('✅ DEGRADED MODE DEACTIVATED: System recovered');
            }
            return response;
          } catch (degradedError) {
            logger.error('Degraded mode fallback also failed:', degradedError);
            // Continue to emergency response below
          }
        }
      }

      // 🧠 NOUVEAU v22Ω: Mise à jour état environnement du Cognitive Kernel
      // v22Ω: Utiliser cache TTL 1s pour éviter appels redondants
      const { metrics: _metricsLoaded } = await ensureEngines();
      const realtimeMetrics = this.getCachedMetrics(_metricsLoaded);
      cognitiveKernel.updateEnvironmentState({
        providerHealth: new Map(
          this.providers.map(p => {
            const stats = this.providerStats.get(p.name);
            return [p.name, stats?.reliability || 0];
          })
        ),
        averageLatency: realtimeMetrics.avgResponseTime,
        responseQuality: realtimeMetrics.successRate,
        errorFrequency:
          realtimeMetrics.totalErrors /
          Math.max(1, realtimeMetrics.uptime / (60 * 60 * 1000)),
        chatStability:
          100 -
          (realtimeMetrics.totalErrors / Math.max(1, realtimeMetrics.totalRequests)) *
            100,
        governanceStatus: this.determineGovernanceStatus(realtimeMetrics), // Dynamic governance: 'full' if all checks pass, 'partial' if warnings, 'limited' if errors
      });

      // 🧠 Exécuter le processus cognitif complet
      const cognitiveDecision = await cognitiveKernel.executeCognitiveProcess({
        message: sanitized,
        providers: this.providers.map(p => p.name),
        metrics: { ...realtimeMetrics } as MetricsData,
      });

      // Sélection neurale standard (avec préférence optionnelle)
      const preferredProvider = config?.preferredProvider;
      // v30: Extract canonicalMode from config for OLLAMA CHAMPION scoring
      const canonicalModeFromConfig = (config as Record<string, unknown>)
        ?.canonicalMode as string | undefined;
      const routerStartTime = Date.now();
      const selection = await this.selectOptimalProvider(
        sanitized,
        history,
        preferredProvider,
        canonicalModeFromConfig
      );

      // ═══ PROVIDER TRUTH CHAIN: Single Canonical Authority ═══
      // vPROVIDER_TRUTH: canonicalDiscernmentKernel is the SOLE authority for provider selection.
      // When preferredProvider is explicitly set (not 'auto'), the canonical kernel chose it.
      // The cognitiveKernel provides health/latency SIGNALS only — never override authority.
      // In Vitest, force deterministic behavior for test stability.
      const finalProvider = IS_VITEST
        ? selection.selectedProvider
        : preferredProvider && preferredProvider !== 'auto'
          ? preferredProvider
          : cognitiveDecision.confidence > 70
            ? cognitiveDecision.provider
            : selection.selectedProvider;
      routerLatencyMs = Date.now() - routerStartTime;

      logger.group('Provider Selection');
      logger.info(
        `🧠 Cognitive Decision: ${cognitiveDecision.provider} (confidence: ${cognitiveDecision.confidence}%, coherence: ${cognitiveDecision.coherenceScore}%)`
      );
      logger.info(`   Reason: ${cognitiveDecision.reason}`);
      logger.info(
        `   Adaptations: ${cognitiveDecision.adaptations.join(', ') || 'None'}`
      );
      logger.info(
        `🧠 Neural Selection: ${selection.selectedProvider} (${selection.reason}, ${selection.confidence}% confidence)`
      );
      logger.info(`🎯 Final Provider: ${finalProvider}`);
      logger.info(`🔄 Alternates: ${selection.alternates.join(', ')}`);
      logger.groupEnd();

      // ═══ PHASE 4 ÉTAPE 3: Cascade providers complète réactivée ═══
      // Ordre: Selection → Alternates → titane-local (fallback garanti)
      const forcedProviderName =
        preferredProvider && preferredProvider !== 'auto'
          ? preferredProvider === 'local'
            ? 'ollama'
            : preferredProvider
          : null;

      const baseProviders =
        IS_VITEST && forcedProviderName
          ? [forcedProviderName, 'titane-local']
          : [
              finalProvider,
              ...selection.alternates.filter(p => p !== finalProvider),
              'titane-local', // Fallback infaillible
            ];

      const uniqueProviders = Array.from(new Set(baseProviders));
      const providersToTry = uniqueProviders.slice(0, REQUEST_BUDGETS.maxAttempts);
      if (
        uniqueProviders.includes('titane-local') &&
        !providersToTry.includes('titane-local') &&
        providersToTry.length > 0
      ) {
        providersToTry[providersToTry.length - 1] = 'titane-local';
      }

      let lastError: Error | null = null;
      let attempts = 0;
      const providerHistoryCache: ProviderHistoryCache = new Map();

      for (const providerName of providersToTry) {
        const elapsedMs = Date.now() - requestStartTime;
        const remainingBudgetMs = globalBudgetMs - elapsedMs;
        if (remainingBudgetMs <= 0) {
          lastError = new Error('Global budget exceeded');
          break;
        }

        attempts++;
        // v37.0.0: Lazy-load cloud providers on first use
        let provider = this.providers.find(p => p.name === providerName);

        // If not found in eager list, try lazy-loading
        if (
          !provider &&
          this.lazyProviderNames.includes(providerName as LazyProviderName)
        ) {
          try {
            logger.debug(`📦 Lazy-loading provider: ${providerName}`);
            provider = await getOrLoadProvider(providerName as LazyProviderName);
            this.loadedProviders.set(providerName, provider);
            logger.info(`✅ Provider ${providerName} loaded successfully`);
          } catch (loadError) {
            logger.error(`❌ Failed to load provider ${providerName}:`, loadError);
            continue;
          }
        }

        if (!provider) continue;

        const stats = this.providerStats.get(providerName);
        if (!stats) continue;

        // AUTOFIX v19.3Ω: Quick-fail skip for recently failed providers (except titane-local)
        const quickFailTime = this.quickFailCache.get(providerName);
        if (quickFailTime && providerName !== 'titane-local') {
          // Si un provider est explicitement demandé (UI/tests), on doit le tenter même s'il a échoué récemment.
          if (forcedProviderName && providerName === forcedProviderName) {
            // bypass quick-fail cooldown
          } else {
            const timeSinceFailure = Date.now() - quickFailTime;
            if (timeSinceFailure < this.QUICK_FAIL_COOLDOWN_MS) {
              logger.debug(
                `⏭️ Skipping ${providerName} (failed ${timeSinceFailure}ms ago, cooldown: ${this.QUICK_FAIL_COOLDOWN_MS}ms)`
              );
              continue;
            } else {
              // Clear stale cache entry
              this.quickFailCache.delete(providerName);
            }
          }
        }

        // EVOLUTION v21Ω: Track per-provider latency separately from total request time
        const providerStartTime = Date.now();

        // ═══ v24.5: CIRCUIT BREAKER CHECK ═══
        if (providerName !== 'titane-local' && !circuitBreaker.canExecute(providerName)) {
          logger.debug(`⚡ Circuit OPEN for ${providerName}, skipping...`);
          continue;
        }

        // ═══ v24.5: RATE LIMITER CHECK ═══
        const estimatedTokens = rateLimiter.estimateTokens(sanitized, history);
        const rateLimitStatus = rateLimiter.checkLimit(providerName, estimatedTokens);
        if (!rateLimitStatus.allowed && providerName !== 'titane-local') {
          logger.debug(
            `🚦 Rate limited for ${providerName}: ${rateLimitStatus.reason}, retry in ${rateLimitStatus.retryAfterMs}ms`
          );
          continue;
        }

        try {
          logger.debug(
            `\n🔍 [${attempts}/${providersToTry.length}] Trying ${providerName}...`
          );

          // 🚨 DEBUG CRITICAL: Log avant tentative provider (désactivé en production)
          // console.log(`[aiOrchestrator] 🎯 Tentative provider #${attempts}`, {
          //   providerName,
          //   totalProviders: providersToTry.length,
          //   isAvailable: !!provider,
          //   timestamp: new Date().toISOString(),
          // });

          // ═══ ISOLATED EXECUTION WITH ADAPTIVE TIMEOUT (v22Ω Optimized) ═══
          // v22Ω: Using centralized timeout config
          const executionTimeout = Math.min(
            getProviderTimeout(providerName),
            REQUEST_BUDGETS.providerAttemptMs,
            Math.max(1000, globalBudgetMs - (Date.now() - requestStartTime))
          );
          const historyForProvider = this.buildHistoryForProvider(
            history,
            providerName,
            config?.promptProfileId,
            config?.promptContext,
            providerHistoryCache
          );

          const response = await this.executeProviderIsolated(
            provider,
            sanitized,
            historyForProvider,
            executionTimeout,
            requestId,
            config
          );

          // 🚨 DEBUG CRITICAL: Log succès provider (désactivé en production)
          // console.log(`[aiOrchestrator] ✅ Succès provider`, {
          //   providerName,
          //   contentLength: response.content?.length,
          //   provider: response.provider,
          //   timestamp: new Date().toISOString(),
          // });

          // ═══ SUCCESS PATH + COGNITIVE KERNEL UPDATE ═══
          // EVOLUTION v21Ω: Use provider-specific timing for accurate stats
          const providerLatency = Date.now() - providerStartTime;
          const totalResponseTime = Date.now() - requestStartTime;
          lastProviderLatencyMs = providerLatency;
          finalProviderUsed = providerName;
          this.updateProviderStats(providerName, true, providerLatency); // Use provider-specific latency
          this.orchestratorMetrics.totalSuccesses++;

          // 🧠 NOUVEAU v22Ω: Enregistrer succès dans Cognitive Kernel
          cognitiveKernel.recordInMemory('provider', { provider: providerName });
          cognitiveKernel.updateProviderPreferences(providerName, true, providerLatency);

          // AUTOFIX v19.3Ω: Clear quick-fail cache on success
          this.quickFailCache.delete(providerName);

          // ═══ v24.5: Record success in Circuit Breaker + Rate Limiter ═══
          circuitBreaker.recordSuccess(providerName);
          rateLimiter.recordRequest(providerName, response.tokens || estimatedTokens);

          // 📊 METRICS: Enregistrer succès
          const { metrics: _metricsLoaded } = await ensureEngines();
          _metricsLoaded.recordEvent({
            type: 'response',
            provider: providerName,
            latencyMs: providerLatency, // Use provider-specific latency
            success: true,
            model: response.model,
            tokensUsed: response.tokens,
            messageLength: sanitized.length,
          });

          // Update avg response time using total response time for user-facing metrics
          const totalTime =
            this.orchestratorMetrics.avgResponseTime *
              (this.orchestratorMetrics.totalSuccesses - 1) +
            totalResponseTime;
          this.orchestratorMetrics.avgResponseTime =
            totalTime / this.orchestratorMetrics.totalSuccesses;

          logger.group('Generation Complete');
          logger.info(`Request ID: ${requestId}`);
          logger.info(`Provider: ${response.provider || providerName}`);
          logger.info(
            `Timing: ${providerLatency}ms (provider) / ${totalResponseTime}ms (total)`,
            { contentLength: response.content.length }
          );
          logger.groupEnd();

          const fallbackUsed = attempts > 1 || providerName !== finalProvider;
          logger.info(
            `[AI_SUMMARY] request_id=${requestId} latency_total=${totalResponseTime} latency_router=${routerLatencyMs} latency_provider=${providerLatency} attempt_count=${attempts} final_provider=${providerName} fallback_used=${fallbackUsed} error_code=none`
          );

          return {
            ...response,
            metadata: {
              ...response.metadata,
              requestId,
              selectedProvider: providerName,
              neuralSelection: selection,
              attempts,
              fallbackUsed,
              providerLatency, // EVOLUTION v21Ω: Accurate provider-specific latency
              totalResponseTime, // EVOLUTION v21Ω: Total time including fallbacks
              omegaVersion: 'v21Ω',
            },
          };
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          // EVOLUTION v21Ω: Use provider-specific latency for failure stats
          const providerFailureLatency = Date.now() - providerStartTime;
          lastProviderLatencyMs = providerFailureLatency;
          finalProviderUsed = providerName;

          // 🚨 DEBUG CRITICAL: Log échec provider (désactivé en production)
          // console.error(`[aiOrchestrator] ❌ Échec provider`, {
          //   providerName,
          //   error: lastError.message,
          //   latency: providerFailureLatency,
          //   timestamp: new Date().toISOString(),
          // });

          // ═══ FAILURE PATH + AUTO-HEAL + COGNITIVE KERNEL ═══
          this.updateProviderStats(providerName, false, providerFailureLatency, lastError);

          // 🧠 NOUVEAU v22Ω: Enregistrer échec dans Cognitive Kernel
          cognitiveKernel.recordInMemory('error', {
            pattern: lastError.message.substring(0, 50),
          });
          cognitiveKernel.updateProviderPreferences(
            providerName,
            false,
            providerFailureLatency
          );

          // AUTOFIX v19.3Ω: Add to quick-fail cache (except titane-local)
          if (providerName !== 'titane-local') {
            this.quickFailCache.set(providerName, Date.now());
          }

          // ═══ v24.5: Record failure in Circuit Breaker ═══
          circuitBreaker.recordFailure(providerName, lastError);

          // 📊 METRICS: Enregistrer erreur with provider-specific latency
          const { metrics: _metricsLoaded } = await ensureEngines();
          _metricsLoaded.recordEvent({
            type: 'error',
            provider: providerName,
            latencyMs: providerFailureLatency, // EVOLUTION v21Ω: Use provider-specific latency
            success: false,
            errorType: lastError.message.substring(0, 50),
            messageLength: sanitized.length,
          });

          // Trigger auto-heal sauf pour titane-local (déjà auto-réparé)
          if (providerName !== 'titane-local') {
            const { autoHeal: _autoHealLoaded } = await ensureEngines();
            _autoHealLoaded.heal(providerName, lastError, 'provider', {
              requestId,
              attempt: attempts,
              providerLatency: providerFailureLatency, // EVOLUTION v21Ω: Accurate latency
            });
            this.orchestratorMetrics.autoHealTriggers++;
          }

          logger.error(`Provider ${providerName} failed`, {
            error: lastError.message,
            latency: providerFailureLatency,
          });

          // Si c'est titane-local qui échoue, c'est critique
          if (providerName === 'titane-local') {
            logger.error('CRITICAL: titane-local provider failed');
            break;
          }

          // Continue avec le provider suivant
          continue;
        }
      }

      // ═══ ULTIMATE FALLBACK OMEGA ═══
      this.orchestratorMetrics.totalFailures++;
      this.orchestratorMetrics.fallbackRate =
        this.orchestratorMetrics.totalFailures / this.orchestratorMetrics.totalRequests;

      const responseTime = Date.now() - requestStartTime;

      logger.error('All providers exhausted', {
        lastError: lastError?.message || 'Unknown',
        responseTime,
      });

      logger.info(
        `[AI_SUMMARY] request_id=${requestId} latency_total=${responseTime} latency_router=${routerLatencyMs} latency_provider=${lastProviderLatencyMs} attempt_count=${attempts} final_provider=${finalProviderUsed ?? 'none'} fallback_used=true error_code=${lastError?.message || 'unknown'}`
      );

      // Ultimate emergency response
      return {
        content: `🟣 **OMEGA Auto-Récupération Activée** [${requestId.substring(0, 8)}]

Une défaillance multi-niveaux a été détectée et traitée automatiquement.

**Statut système** : Mode survie OMEGA engagé
**Votre question** : "${sanitized.substring(0, 100)}${sanitized.length > 100 ? '...' : ''}"

**Assistance disponible** :
• Diagnostic système en temps réel
• Architecture TITANE∞ et modules core
• Configuration et optimisation
• Résolution de problèmes techniques

Le système s'auto-répare en continu. Que puis-je t'aider à explorer ?`,
        provider: 'ultimate-fallback',
        model: 'omega-emergency-v19.2Ω',
        timestamp: Date.now(),
        metadata: {
          requestId,
          emergency: true,
          allProvidersFailed: true,
          attempts,
          responseTime,
          lastError: lastError?.message || 'unknown',
          autoHealTriggered: this.orchestratorMetrics.autoHealTriggers,
          omegaVersion: 'v19.2Ω',
        },
      };
    } catch (criticalError) {
      // ═══ CRITICAL ERROR HANDLER (v22Ω Enhanced) ═══
      const responseTime = Date.now() - requestStartTime;
      this.orchestratorMetrics.totalFailures++;

      // v22Ω: Track critical errors for degraded mode detection
      const now = Date.now();
      this.criticalErrorHistory.push(now);
      // Clean old errors outside window
      this.criticalErrorHistory = this.criticalErrorHistory.filter(
        ts => now - ts < this.CRITICAL_ERROR_WINDOW_MS
      );

      // Check if we should enter degraded mode
      if (
        this.criticalErrorHistory.length >= this.CRITICAL_ERROR_THRESHOLD &&
        !this.isDegradedMode
      ) {
        this.isDegradedMode = true;
        logger.warn(
          `⚠️ DEGRADED MODE ACTIVATED: ${this.criticalErrorHistory.length} critical errors in ${this.CRITICAL_ERROR_WINDOW_MS / 60000}min window`
        );
      }

      const { autoHeal: _autoHealLoaded } = await ensureEngines();
      _autoHealLoaded.heal(
        'orchestrator',
        criticalError instanceof Error ? criticalError : new Error(String(criticalError)),
        'critical',
        {
          requestId,
          responseTime,
          degradedMode: this.isDegradedMode,
          criticalErrorCount: this.criticalErrorHistory.length,
        }
      );

      logger.error(`Critical error [${requestId}]`, {
        criticalError,
        degradedMode: this.isDegradedMode,
      });

      logger.info(
        `[AI_SUMMARY] request_id=${requestId} latency_total=${responseTime} latency_router=${routerLatencyMs} latency_provider=${lastProviderLatencyMs} attempt_count=${0} final_provider=${finalProviderUsed ?? 'none'} fallback_used=true error_code=${criticalError instanceof Error ? criticalError.message : String(criticalError)}`
      );

      return {
        content: `🔴 **Récupération Critique OMEGA** [${requestId.substring(0, 8)}]

Une erreur système majeure a été interceptée et neutralisée automatiquement.

**Détails technique** : ${criticalError instanceof Error ? criticalError.message : 'Erreur inconnue'}
**Action** : Auto-réparation OMEGA en cours
**Statut** : Système stable et opérationnel

Je reste pleinement fonctionnel pour continuer notre conversation. Veux-tu réessayer ta demande ?`,
        provider: 'emergency-fallback',
        model: 'omega-critical-v19.2Ω',
        timestamp: Date.now(),
        metadata: {
          requestId,
          criticalRecovery: true,
          errorType: 'orchestrator-critical',
          responseTime,
          omegaVersion: 'v19.2Ω',
        },
      };
    } finally {
      // ═══ CLEANUP ═══
      this.currentRequests = Math.max(0, this.currentRequests - 1);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 3.5: ISOLATED PROVIDER EXECUTION + SANDBOXING
   * ═══════════════════════════════════════════════════════════════════
   */

  private mapProviderToPromptProvider(providerName: string): PromptProvider {
    switch (providerName) {
      case 'titane-local':
        return 'titane-local';
      case 'tauri-backend':
        return 'tauri';
      case 'ollama':
        return 'ollama';
      case 'gemini':
        return 'gemini';
      case 'copilot':
        return 'openai'; // Copilot uses OpenAI-compatible format
      default:
        if (providerName.includes('claude')) {
          return 'claude';
        }
        if (providerName.includes('ollama')) {
          return 'ollama';
        }
        if (providerName.includes('tauri')) {
          return 'tauri';
        }
        if (providerName.includes('copilot')) {
          return 'openai'; // Copilot uses OpenAI-compatible format
        }
        return 'openai';
    }
  }

  private buildHistoryForProvider(
    history: AIMessage[],
    providerName: string,
    promptProfileId?: string,
    promptContext?: PromptContext,
    requestCache?: ProviderHistoryCache
  ): AIMessage[] {
    if (!promptProfileId) {
      return history;
    }

    try {
      const promptProvider = this.mapProviderToPromptProvider(providerName);
      const cached = requestCache?.get(promptProvider);
      if (cached) {
        return cached;
      }

      const prompt = buildTitanePrompt(promptProfileId, promptProvider, promptContext);

      if (history.length === 0) {
        const promptOnlyHistory: AIMessage[] = [
          { role: 'system', content: prompt, timestamp: Date.now() },
        ];
        requestCache?.set(promptProvider, promptOnlyHistory);
        return promptOnlyHistory;
      }

      const systemIndex = history.findIndex(msg => msg.role === 'system');

      if (systemIndex >= 0) {
        const existing = history[systemIndex];
        if (existing?.content === prompt) {
          requestCache?.set(promptProvider, history);
          return history;
        }
      } else {
        const promptInjectedHistory = [
          { role: 'system' as const, content: prompt, timestamp: Date.now() },
          ...history,
        ];
        requestCache?.set(promptProvider, promptInjectedHistory);
        return promptInjectedHistory;
      }

      const cloned = history.map(msg => ({ ...msg }));
      const existing = cloned[systemIndex];
      if (existing) {
        cloned[systemIndex] = {
          ...existing,
          role: 'system' as const,
          content: prompt,
          timestamp: Date.now(),
        };
      }

      requestCache?.set(promptProvider, cloned);
      return cloned;
    } catch (error) {
      logger.warn(`Prompt rebuild skipped for ${providerName}`, error);
      return history;
    }
  }

  private async executeProviderIsolated(
    provider: AIProvider,
    message: string,
    history: AIMessage[],
    timeout: number,
    requestId: string,
    providerConfig?: AIConfig
  ): Promise<AIResponse> {
    this.currentRequests++;

    try {
      logger.debug('Provider execution start', {
        requestId,
        provider: provider.name,
      });
      // v22Ω OPT12: Use cached availability check (60s TTL)
      const isAvailable = await this.checkAvailabilityWithCache(provider);

      if (!isAvailable) {
        throw new Error(`Provider ${provider.name} is not available`);
      }

      // Generation with full timeout — pass config so temperature/maxTokens reach the provider
      const generationPromise = provider.generate(message, history, providerConfig);
      const generationTimeout = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Provider timeout (${timeout}ms) [${requestId}]`)),
          timeout
        )
      );

      const response = await Promise.race([generationPromise, generationTimeout]);

      // Response validation
      if (!response || typeof response !== 'object') {
        throw new Error(`Invalid response format (${requestId})`);
      }

      if (!response.content || typeof response.content !== 'string') {
        throw new Error('Invalid response content');
      }

      if (response.content.trim().length === 0) {
        throw new Error('Empty response content');
      }

      return response;
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error(`Provider execution failed: ${String(error)}`);
    } finally {
      this.currentRequests = Math.max(0, this.currentRequests - 1);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 3.6: STATS UPDATE + RELIABILITY TRACKING
   * ═══════════════════════════════════════════════════════════════════
   */

  private updateProviderStats(
    providerName: string,
    success: boolean,
    responseTime: number,
    error?: unknown
  ): void {
    const stats = this.providerStats.get(providerName);
    if (!stats) return;

    stats.totalRequests++;
    stats.lastUsed = Date.now();
    this.lastProviderUsed = providerName;

    if (success) {
      stats.successCount++;

      if (providerName === 'titane-local') {
        this.consecutiveLocalResponses++;
      } else {
        this.consecutiveLocalResponses = 0;
      }

      // Update average response time
      const totalTime = stats.avgResponseTime * (stats.successCount - 1) + responseTime;
      stats.avgResponseTime = totalTime / stats.successCount;

      // Improve reliability
      stats.reliability = Math.min(100, stats.reliability + 1);

      // Update status based on derived performance signals
      if (stats.reliability > 80) {
        const derivedStatus = stats.reliability > 95 ? 'healthy' : 'degraded';
        stats.status = derivedStatus;
      }
    } else {
      stats.failureCount++;
      stats.lastFailure = Date.now();
      // v30.3.0: Track error type for intelligent failover
      const errorType = this.classifyError(error);
      stats.lastErrorType = errorType;
      stats.recentErrors.push({ type: errorType, timestamp: Date.now() });
      // Keep only last 10 errors
      if (stats.recentErrors.length > 10) stats.recentErrors = stats.recentErrors.slice(-10);
      if (providerName !== 'titane-local') {
        this.consecutiveLocalResponses = 0;
      }

      // Decrease reliability
      stats.reliability = Math.max(0, stats.reliability - 5);

      // Update status based on recent failures
      const recentFailures = stats.failureCount;
      const recentRequests = Math.max(1, stats.totalRequests);
      const failureRate = recentFailures / recentRequests;

      if (failureRate > 0.5) {
        stats.status = 'critical';
      } else if (failureRate > 0.2) {
        stats.status = 'degraded';
      } else if (stats.reliability < 50) {
        stats.status = 'degraded';
      }
    }

    // Cap reliability calculation
    if (stats.totalRequests > 0) {
      stats.reliability = Math.round((stats.successCount / stats.totalRequests) * 100);
    }

    this.invalidateStatusCaches();
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 3.7: STREAMING OMEGA SÉCURISÉ
   * ═══════════════════════════════════════════════════════════════════
   */

  async *stream(
    message: string,
    history: AIMessage[] = [],
    preferredProvider?: ProviderChoice
  ): AsyncGenerator<string> {
    const { sanitized, valid, issues } = this.sanitizeMessage(message);

    // ═══ v22Ω: STREAM CONFIG from centralized config ═══
    const streamStartTime = Date.now();
    let streamAborted = false;

    // Setup global timeout that will abort the stream
    const checkTotalTimeout = () => {
      if (Date.now() - streamStartTime > STREAM_CONFIG.totalTimeoutMs) {
        streamAborted = true;
        logger.warn('Stream total timeout exceeded', {
          elapsed: Date.now() - streamStartTime,
          limit: STREAM_CONFIG.totalTimeoutMs,
        });
        return true;
      }
      return false;
    };

    if (!valid) {
      const { autoHeal: _autoHealLoaded } = await ensureEngines();
      _autoHealLoaded.heal(
        'orchestrator',
        `Stream validation failed: ${issues.join(', ')}`,
        'validation'
      );
      yield '⚠️ Message invalide détecté pour streaming...';
      return;
    }

    // ═══ PROVIDER TRUTH CHAIN: Honor canonical kernel's provider preference in streaming ═══
    // vPROVIDER_TRUTH: Pass preferredProvider through to selectOptimalProvider
    const selection = await this.selectOptimalProvider(
      sanitized,
      history,
      preferredProvider,
      undefined // canonicalMode not available in stream() public API — kernel chose provider via preferredProvider
    );
    const providersToTry = [selection.selectedProvider, 'titane-local']; // Minimal pour streaming

    let hasStreamed = false;

    for (const providerName of providersToTry) {
      // ═══ v24.5: Check total timeout before trying each provider ═══
      if (checkTotalTimeout()) {
        yield '\n\n⏱️ Temps de streaming dépassé. Réponse partielle fournie.';
        return;
      }

      const provider = this.providers.find(p => p.name === providerName);
      if (!provider) continue;

      // ═══ v24.5: Circuit Breaker check for streaming ═══
      if (providerName !== 'titane-local' && !circuitBreaker.canExecute(providerName)) {
        logger.debug(`⚡ Circuit OPEN for ${providerName} in stream, skipping...`);
        continue;
      }

      try {
        // v22Ω OPT12: Use cached availability check
        const isAvailable = await this.checkAvailabilityWithCache(provider);
        if (!isAvailable) continue;

        if (provider.stream) {
          // v22Ω OPT11: Streaming with chunk batching + timeout
          let streamTimeout: NodeJS.Timeout | null = null;
          const streamPromise = provider.stream(sanitized, history);

          // OPT11: Chunk batching buffer
          let chunkBuffer: string[] = [];
          let lastFlushTime = Date.now();

          try {
            for await (const chunk of streamPromise) {
              // Check total timeout during streaming
              if (checkTotalTimeout() || streamAborted) {
                if (streamTimeout) clearTimeout(streamTimeout);
                // Flush remaining buffer before timeout message
                if (chunkBuffer.length > 0) {
                  yield chunkBuffer.join('');
                  chunkBuffer = [];
                }
                yield '\n\n⏱️ Temps de streaming dépassé.';
                circuitBreaker.recordFailure(
                  providerName,
                  new Error('Stream total timeout')
                );
                return;
              }

              // Reset per-chunk timeout
              if (streamTimeout) {
                clearTimeout(streamTimeout);
              }
              streamTimeout = setTimeout(() => {
                streamAborted = true;
              }, STREAM_CONFIG.perChunkTimeoutMs);

              if (chunk && typeof chunk === 'string') {
                // OPT11: Add to buffer instead of yielding immediately
                chunkBuffer.push(chunk);
                hasStreamed = true;

                const now = Date.now();
                const shouldFlush =
                  chunkBuffer.length >= STREAM_CONFIG.chunkBatchSize ||
                  now - lastFlushTime >= STREAM_CONFIG.chunkBatchDelayMs;

                if (shouldFlush) {
                  yield chunkBuffer.join('');
                  chunkBuffer = [];
                  lastFlushTime = now;
                }
              }
            }

            // Flush remaining buffer
            if (chunkBuffer.length > 0) {
              yield chunkBuffer.join('');
            }

            if (streamTimeout) {
              clearTimeout(streamTimeout);
            }
            // ═══ v24.5: Record success in circuit breaker ═══
            circuitBreaker.recordSuccess(providerName);
            return; // Streaming successful
          } catch (streamError) {
            // Flush buffer on error before cleanup
            if (chunkBuffer.length > 0) {
              yield chunkBuffer.join('');
            }
            if (streamTimeout) {
              clearTimeout(streamTimeout);
            }
            circuitBreaker.recordFailure(
              providerName,
              streamError instanceof Error ? streamError : new Error(String(streamError))
            );
            throw streamError;
          }
        } else {
          // Fallback: simulate streaming from generate()
          const response = await this.executeProviderIsolated(
            provider,
            sanitized,
            history,
            30000,
            `stream_${Date.now()}`
          );

          // v22Ω OPT11: Batch simulated streaming (yield words instead of chars)
          const words = response.content.split(/(\s+)/);
          for (const word of words) {
            if (word) {
              yield word;
              hasStreamed = true;
              await new Promise(resolve => setTimeout(resolve, 20));
            }
          }
          return; // Simulation successful
        }
      } catch (error) {
        logger.warn('Stream provider failed', { provider: providerName, error });

        // Auto-heal pour streaming failures
        const { autoHeal: _autoHealLoaded } = await ensureEngines();
        _autoHealLoaded.heal(
          providerName,
          error instanceof Error ? error : new Error(String(error)),
          'network'
        );

        continue; // Try next provider
      }
    }

    // Ultimate fallback streaming
    if (!hasStreamed) {
      yield '🟣 Auto-réparation OMEGA streaming en cours...\n\n';
      yield 'Streaming fallback activé. ';
      yield `Votre question: "${sanitized.substring(0, 50)}" est traitée en mode sécurisé.`;
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PUBLIC API + MONITORING
   * ═══════════════════════════════════════════════════════════════════
   */

  /**
   * Status complet des providers avec métriques OMEGA
   * AUTOFIX v19.3Ω: Added metrics to return type
   */
  async getProvidersStatus(): Promise<ProvidersStatusSnapshot> {
    const now = Date.now();
    if (
      this.providersStatusCache.data &&
      now - this.providersStatusCache.timestamp < this.STATUS_CACHE_TTL_MS
    ) {
      return this.providersStatusCache.data;
    }

    try {
      // v22Ω OPT12: Update provider availability using cache (parallel)
      // v37.0.0: Check both eager and loaded providers
      const allProviders = [
        ...this.eagerProviders,
        ...Array.from(this.loadedProviders.values()),
      ];
      const availabilityChecks = allProviders.map(async provider => {
        try {
          const isAvailable = await this.checkAvailabilityWithCache(provider);

          const stats = this.providerStats.get(provider.name);
          if (stats && !isAvailable && stats.status !== 'offline') {
            stats.status = 'offline';
          }

          return { provider: provider.name, available: isAvailable };
        } catch (error) {
          const stats = this.providerStats.get(provider.name);
          if (stats) {
            stats.status = 'degraded';
          }
          return { provider: provider.name, available: false };
        }
      });

      await Promise.allSettled(availabilityChecks);

      const { autoHeal: _autoHealLoaded, metrics: _metricsLoaded } =
        await ensureEngines();
      const snapshot: ProvidersStatusSnapshot = {
        providers: Array.from(this.providerStats.values()),
        orchestrator: { ...this.orchestratorMetrics },
        autoHeal: _autoHealLoaded.getStats(),
        metrics: _metricsLoaded.getAggregatedMetrics(), // 📊 NOUVEAU: Métriques détaillées
        timestamp: now,
      };
      this.providersStatusCache = { data: snapshot, timestamp: now };
      return snapshot;
    } catch (error) {
      const { metrics: _metricsLoaded } = await ensureEngines();
      // Return fallback stats with placeholder autoHeal
      const fallbackAutoHeal: AutoHealStats & { providers: Record<string, unknown> } = {
        totalErrors: 0,
        totalHeals: 0,
        successRate: 0,
        avgHealTime: 0,
        errorsByType: {},
        actionsByType: {},
        lastHeal: 0,
        healthScore: 0,
        providers: {},
      };
      const snapshot: ProvidersStatusSnapshot = {
        providers: Array.from(this.providerStats.values()),
        orchestrator: { ...this.orchestratorMetrics },
        autoHeal: fallbackAutoHeal,
        metrics: _metricsLoaded.getAggregatedMetrics(), // 📊 NOUVEAU
        timestamp: now,
      };
      this.providersStatusCache = { data: snapshot, timestamp: now };
      return snapshot;
    }
  }

  /**
   * 📊 NOUVEAU v20Ω: Obtenir métriques détaillées
   */
  async getDetailedMetrics() {
    const { autoHeal: _autoHealLoaded, metrics: _metricsLoaded } = await ensureEngines();
    return {
      aggregated: _metricsLoaded.getAggregatedMetrics(),
      health: _metricsLoaded.getHealthStats(),
      autoHeal: _autoHealLoaded.getStats(),
      orchestrator: { ...this.orchestratorMetrics },
    };
  }

  /**
   * Force reset de tous les providers
   * EVOLUTION v21Ω: Now clears ALL state including quick-fail cache
   */
  async resetAllProviders(): Promise<void> {
    logger.info('Force reset all providers...');

    this.initializeProviderStats();
    this.orchestratorMetrics = {
      totalRequests: 0,
      totalSuccesses: 0,
      totalFailures: 0,
      avgResponseTime: 0,
      fallbackRate: 0,
      autoHealTriggers: 0,
      lastActivity: 0,
    };

    // EVOLUTION v21Ω: Clear all state variables
    this.quickFailCache.clear();
    this.lastProviderUsed = null;
    this.consecutiveLocalResponses = 0;
    this.currentRequests = 0;

    const { autoHeal: _autoHealLoaded } = await ensureEngines();
    _autoHealLoaded.resetStats();
    await this.startWarmup();
  }

  /**
   * Test de santé complet
   */
  async healthCheck(): Promise<HealthCheckSnapshot> {
    const now = Date.now();
    if (
      this.healthCheckCache.data &&
      now - this.healthCheckCache.timestamp < this.HEALTH_CHECK_CACHE_TTL_MS
    ) {
      return this.healthCheckCache.data;
    }

    const status = await this.getProvidersStatus();
    const healthyCount = status.providers.filter(p => p.status === 'healthy').length;
    const totalProviders = status.providers.length;

    let overall: 'healthy' | 'degraded' | 'critical';
    const recommendations: string[] = [];

    if (healthyCount === totalProviders) {
      overall = 'healthy';
    } else if (healthyCount >= totalProviders / 2) {
      overall = 'degraded';
      recommendations.push('Certains providers ont des problèmes');
    } else {
      overall = 'critical';
      recommendations.push('Majority of providers are failing');
    }

    // Check auto-heal effectiveness
    const autoHealStats = status.autoHeal;
    if (autoHealStats.successRate < 80) {
      recommendations.push('Auto-heal effectiveness is low');
    }

    // Check response times
    if (status.orchestrator.avgResponseTime > 10000) {
      recommendations.push('Average response time is high');
    }

    const snapshot: HealthCheckSnapshot = {
      overall,
      providers: status.providers.map(p => ({
        name: p.name,
        status: p.status,
        available: Date.now() - p.lastUsed < 60000, // Active in last minute
      })),
      autoHeal: autoHealStats,
      recommendations,
    };
    this.healthCheckCache = { data: snapshot, timestamp: now };
    return snapshot;
  }
}

// ─────────────────────────────────────────────────────────────────
// EXPORT SINGLETON + API COMPATIBILITY
// ─────────────────────────────────────────────────────────────────

// Lazy initialization to avoid ReferenceError during module loading
let _orchestratorInstance: AIOrchestrator | null = null;

function getOrchestratorInstance(): AIOrchestrator {
  if (!_orchestratorInstance) {
    try {
      _orchestratorInstance = new AIOrchestrator();
    } catch (error) {
      logger.error('Failed to initialize AIOrchestrator:', error);
      // Fallback: Return a stub that won't crash
      throw error;
    }
  }
  return _orchestratorInstance;
}

export const aiOrchestrator = new Proxy({} as AIOrchestrator, {
  get(_target, prop) {
    const instance = getOrchestratorInstance();
    const value = Reflect.get(instance, prop);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
  set(_target, prop, value) {
    const instance = getOrchestratorInstance();
    return Reflect.set(instance, prop, value);
  },
  has(_target, prop) {
    const instance = getOrchestratorInstance();
    return prop in instance;
  },
  getOwnPropertyDescriptor(_target, prop) {
    const instance = getOrchestratorInstance();
    const descriptor = Object.getOwnPropertyDescriptor(instance, prop);
    if (descriptor) {
      return { ...descriptor, configurable: true };
    }
    return {
      configurable: true,
      enumerable: true,
      writable: true,
      value: (instance as unknown as Record<string, unknown>)[
        prop as keyof AIOrchestrator
      ],
    };
  },
});

// API de rétrocompatibilité
export async function askTitan(
  message: string,
  history: AIMessage[] = [],
  config?: AIConfig
): Promise<AIResponse> {
  return getOrchestratorInstance().generate(message, history, config);
}

export async function* streamTitan(
  message: string,
  history: AIMessage[] = []
): AsyncGenerator<string> {
  yield* getOrchestratorInstance().stream(message, history);
}

export async function getAIStatus() {
  return getOrchestratorInstance().getProvidersStatus();
}

export default aiOrchestrator;
