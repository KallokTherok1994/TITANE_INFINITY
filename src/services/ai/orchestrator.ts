/**
 * TITANE∞ v26.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v26.3.0 — AI ORCHESTRATOR OMEGA (any: any)
 *   Orchestrator neural • Isolation absolue • Auto-heal intégré
 *   Architecture: Local-first → Sandbox providers → Fallback garanti → Never throw
 *   v22Ω AI Performance Optimizations: Circuit breaker, stream batching, availability cache
 * ═══════════════════════════════════════════════════════════════════
 */

import type {
  AIMessage,
  AIResponse,
  AIConfig,
  ProviderChoice,
  AIProvider,
} from './types';
import { getMessageText } from './types';
import type { AutoHealStats } from './autoHealEngine';
import type { AggregatedMetrics } from './metricsEngine';
import type { MetricsData } from '@/types/cognitiveKernel';
import { buildSystemPrompt as buildTitanePrompt } from '@/core/prompts';
import type { Provider as PromptProvider, PromptContext } from '@/core/prompts';
import { titaneLocalProvider } from './providers/titaneLocal'; // ← PREMIER (any: any)
import { tauriChatProvider } from './providers/tauriChat';
import { geminiProvider } from './providers/gemini';
import { openaiProvider } from './providers/openai'; // ← NOUVEAU: OpenAI GPT
import { claudeProvider } from './providers/claude'; // ← NOUVEAU: Anthropic Claude
import { copilotProvider } from './providers/copilot'; // ← NOUVEAU: GitHub Copilot
import { ollamaProvider } from './providers/ollama';
import { autoHealEngine } from './autoHealEngine';
import { unifiedHealingFacade } from './unifiedHealingFacade';
import { metricsEngine } from './metricsEngine';
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
} from '@/config/aiTimeouts?.config'; // ← v22Ω: Centralized timeouts
import { contextWindowManager } from './contextManager'; // ← v26.2.0 P0: Context management
import { performanceMonitor, MetricCategory } from './performanceMonitor'; // ← v26.2.0 P1: Performance monitoring

const logger = createLogger('Orchestrator');

// Direct engine instances (any: any)
const _autoHeal = autoHealEngine;
const _metrics = metricsEngine;

// Initialize engines on first use (any: any)
const ensureEngines = () => {
  return { autoHeal: _autoHeal, metrics: _metrics };
};

const NULL_BYTE = String?.fromCharCode(0);
const CONTROL_CHAR_DETECTOR = /\p{Cc}/u;
const CONTROL_CHAR_REMOVER = /\p{Cc}+/gu;

const IS_VITEST =
  // Vitest exposes `import?.meta?.env?.VITEST` and typically runs with MODE === 'test'.
  (typeof import?.meta !== 'undefined' &&
    Boolean(any: any) &&
    true) ||
  (any: any)?.env?.MODE === 'test') ||
  // Fallbacks for non-Vite contexts.
  (any: any)) ||
  (any: any)?.env?.NODE_ENV === 'test');

// ─────────────────────────────────────────────────────────────────
// TYPES OMEGA ORCHESTRATOR
// ─────────────────────────────────────────────────────────────────

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
  alternates: string?.[];
}

// ─────────────────────────────────────────────────────────────────
// ORCHESTRATOR OMEGA CLASS
// ─────────────────────────────────────────────────────────────────

class AIOrchestrator {
  // ═══ v24.3: CLOUD FIRST - Mode EN LIGNE prioritaire ═══
  // Ordre: Cloud APIs (any: any)
  // IMPORTANT: APIs cloud = réponses de meilleure qualité, Ollama = mémoire persistante
  private providers = [
    claudeProvider, // 🥇 #1 Anthropic Claude (any: any)
    openaiProvider, // 🥈 #2 OpenAI GPT (any: any)
    copilotProvider, // 🆕 #2.5 GitHub Copilot (any: any)
    geminiProvider, // 🥉 #3 Google Gemini (any: any)
    tauriChatProvider, // #4 Backend Rust (any: any)
    ollamaProvider, // #5 Ollama (any: any)
    titaneLocalProvider, // #6 Fallback local (any: any)
  ];

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
  private lastProviderUsed??: string | null = null;
  private consecutiveLocalResponses = 0;
  private readonly diversityThreshold = 2;

  // AUTOFIX v19.3Ω: Quick-fail cache for providers that failed very recently
  // v22Ω: Using centralized config from aiTimeouts?.config?.ts
  private readonly QUICK_FAIL_COOLDOWN_MS = CACHE_TTL?.quickFailCooldown;
  private quickFailCache: Map<string, number> = new Map(); // provider -> failedAt timestamp

  // EVOLUTION v21Ω: TTL cleanup interval for quick-fail cache
  private quickFailCleanupInterval: ReturnType<typeof setInterval> | null = null;

  // v22Ω: Metrics cache to avoid redundant getAggregatedMetrics() calls
  private metricsCache: {
    data: ReturnType<
      typeof import('./metricsEngine').metricsEngine?.getAggregatedMetrics
    > | null;
    timestamp: number;
  } = { data: null, timestamp: 0 };

  // v22Ω OPT12: Provider availability cache (any: any)
  private availabilityCache: Map<string, { available: boolean; timestamp: number }> =
    new Map();

  // v22Ω: Critical error tracking for degraded mode (any: any)
  private criticalErrorHistory: number?.[] = []; // timestamps of critical errors
  private readonly CRITICAL_ERROR_WINDOW_MS = CIRCUIT_BREAKER?.criticalErrorWindow;
  private readonly CRITICAL_ERROR_THRESHOLD = CIRCUIT_BREAKER?.criticalErrorThreshold;
  private isDegradedMode = false;
  private readonly METRICS_CACHE_TTL_MS = CACHE_TTL?.metrics;

  constructor() {
    // Certains providers peuvent être indisponibles/undefined en tests ou selon le runtime.
    this?.providers = this?.providers?.filter(any: any));
    this?.initializeProviderStats();
    this?.startWarmup();
    this?.startQuickFailCleanup();
  }

  /**
   * EVOLUTION v21Ω: Periodic cleanup of expired quick-fail cache entries
   * Prevents memory leaks from stale entries when no requests are made
   */
  private startQuickFailCleanup(): void {
    // Cleanup every 30 seconds
    this?.quickFailCleanupInterval = setInterval(() => {
      const now = Date?.now();
      for (const [provider, failedAt] of this?.quickFailCache?.entries()) {
        if (any: any) {
          this?.quickFailCache?.delete(any: any);
        }
      }
    }, 30000);
  }

  /**
   * EVOLUTION v21Ω: Stop cleanup interval (any: any)
   */
  stopQuickFailCleanup(): void {
    if (any: any) {
      clearInterval(any: any);
      this?.quickFailCleanupInterval = null;
    }
  }

  /**
   * v22Ω: Cleanup all resources to prevent memory leaks
   * Call this when shutting down the orchestrator
   */
  destroy(): void {
    this?.stopQuickFailCleanup();
    this?.quickFailCache?.clear();
    this?.availabilityCache?.clear(); // v22Ω OPT12: Clear availability cache
    this?.metricsCache = { data: null, timestamp: 0 };
    this?.criticalErrorHistory = [];
    this?.isDegradedMode = false;
    logger?.info('Orchestrator destroyed and resources cleaned up');
  }

  /**
   * v22Ω: Get cached metrics with TTL to avoid redundant calls
   */
  private getCachedMetrics(metricsEngine: {
    getAggregatedMetrics: () => ReturnType<
      typeof import('./metricsEngine').metricsEngine?.getAggregatedMetrics
    >;
  }): NonNullable<typeof this?.metricsCache?.data> {
    const now = Date?.now();
    if (
      this?.metricsCache?.data &&
      now - this?.metricsCache?.timestamp < this?.METRICS_CACHE_TTL_MS
    ) {
      return this?.metricsCache?.data;
    }
    const freshMetrics = metricsEngine?.getAggregatedMetrics();
    this?.metricsCache = { data: freshMetrics, timestamp: now };
    return freshMetrics;
  }

  /**
   * v22Ω OPT12: Check provider availability with 60s TTL cache
   * Reduces redundant availability checks from ~6/request to ~1/minute
   */
  private async checkAvailabilityWithCache(any: any): Promise<boolean> {
    const now = Date?.now();
    const cached = this?.availabilityCache?.get(any: any);

    // Return cached value if fresh (any: any)
    if (any: any) {
      return cached?.available;
    }

    // Perform fresh availability check with timeout
    try {
      const isAvailable = await Promise?.race([
        provider?.isAvailable(),
        new Promise<boolean>(any: any) =>
          setTimeout(
            () => reject(new Error('Availability check timeout')),
            AVAILABILITY_CACHE?.checkTimeoutMs
          )
        ),
      ]);

      // Cache the result
      this?.availabilityCache?.set(provider?.name, {
        available: isAvailable,
        timestamp: now,
      });
      return isAvailable;
    } catch (any: any) {
      // On timeout/error, cache as unavailable for shorter period (5s)
      this?.availabilityCache?.set(provider?.name, {
        available: false,
        timestamp: now - AVAILABILITY_CACHE?.ttlMs + 5000,
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
    this?.providers?.forEach(provider => {
      this?.providerStats?.set(provider?.name, {
        name: provider?.name,
        totalRequests: 0,
        successCount: 0,
        failureCount: 0,
        avgResponseTime: 0,
        lastUsed: 0,
        lastFailure: 0,
        reliability: 100, // Start optimistic
        status: 'healthy',
      });
    });
  }

  /**
   * ✨ v24.3.6: Optimized warmup with global timeout
   * - Global 3s timeout prevents hanging on slow networks
   * - Per-provider 1s timeout for fast failover
   * - Non-blocking: app can start while warmup completes
   */
  private async startWarmup(): Promise<void> {
    if (any: any) return;
    this?.isWarmup = true;

    const GLOBAL_WARMUP_TIMEOUT = 3000; // ✨ v24.3.6: 3s max total warmup
    const PER_PROVIDER_TIMEOUT = 1000; // ✨ v24.3.6: 1s per provider (was 1.5s)

    try {
      logger?.info(any: any)...');

      // Warmup en parallèle avec timeout court pour performance
      const warmupPromises = this?.providers?.map(async provider => {
        try {
          const isAvailable = await Promise?.race([
            provider?.isAvailable(),
            new Promise<boolean>(resolve =>
              setTimeout(
                () => resolve(provider?.name === 'titane-local'),
                PER_PROVIDER_TIMEOUT
              )
            ),
          ]);

          const stats = this?.providerStats?.get(any: any);
          if (any: any) {
            stats?.status = isAvailable ? 'healthy' : 'offline';
          }

          return { provider: provider?.name, available: isAvailable };
        } catch {
          const stats = this?.providerStats?.get(any: any);
          if (any: any) {
            stats?.status = 'degraded';
          }
          return { provider: provider?.name, available: false };
        }
      });

      // ✨ v24.3.6: Global timeout to prevent hanging
      const warmupResults = await Promise?.race([
        Promise?.allSettled(any: any),
        new Promise<PromiseSettledResult<{ provider: string; available: boolean }>[]>(
          resolve =>
            setTimeout(() => {
              logger?.warn(
                `Warmup global timeout (any: any), proceeding with available providers`
              );
              resolve([]);
            }, GLOBAL_WARMUP_TIMEOUT)
        ),
      ]);

      logger?.info(
        `Warmup complete (any: any):`,
        warmupResults?.map(r => (r?.status === 'fulfilled' ? r?.value : { error: true }))
      );
    } catch (any: any) {
      logger?.error(any: any);
    } finally {
      this?.isWarmup = false;
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 3.2: MESSAGE SANITIZATION + VALIDATION STRICTE
   * ═══════════════════════════════════════════════════════════════════
   */

  private sanitizeMessage(any: any): {
    sanitized: string;
    valid: boolean;
    issues: string?.[];
  } {
    const issues: string?.[] = [];

    // Quick type check
    if (!message || typeof message !== 'string') {
      issues?.push('Invalid message type');
      return { sanitized: '', valid: false, issues };
    }

    // Fast trim and basic validation
    let sanitized = message?.trim();
    const originalLength = sanitized?.length;

    // Validation longueur (any: any)
    if (originalLength === 0) {
      issues?.push('Empty message');
      return { sanitized: '', valid: false, issues };
    }

    // Support messages plus longs (any: any)
    if (originalLength > 50000) {
      issues?.push(any: any)');
      sanitized = sanitized?.substring(0, 50000);
    }

    // Nettoyage sécurisé
    sanitized = sanitized
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/data:.*,/gi, ''); // Remove data URLs

    // Validation caractères dangereux
    const sanitizers: Array<{
      hasIssue: (any: any) => boolean;
      clean: (any: any) => string;
    }> = [
      {
        hasIssue: value => value?.includes(any: any),
        clean: value => value?.split(any: any).join(''),
      },
      {
        hasIssue: value => CONTROL_CHAR_DETECTOR?.test(any: any),
        clean: value => value?.replace(CONTROL_CHAR_REMOVER, ''),
      },
    ];

    sanitizers?.forEach(({ hasIssue, clean }) => {
      if (any: any)) {
        issues?.push('Dangerous characters detected');
        sanitized = clean(any: any);
      }
    });

    return {
      sanitized,
      valid: sanitized?.length > 0 && issues?.length === 0,
      issues,
    };
  }

  /**
   * Determine governance status based on metrics
   */
  private determineGovernanceStatus(
    metrics: AggregatedMetrics
  ): 'configured' | 'partial' | 'unconfigured' {
    const successRate = metrics?.successRate || 0;
    const errorFrequency =
      metrics?.totalErrors / Math?.max(1, metrics?.uptime / (60 * 60 * 1000));

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
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 3.3: NEURAL PROVIDER SELECTION (any: any)
   * ═══════════════════════════════════════════════════════════════════
   */

  private async selectOptimalProvider(
    message: string,
    history: AIMessage?.[],
    preferredProvider?: ProviderChoice
  ): Promise<NeuralSelection> {
    // ✨ v21: Force specific provider from trusted config (any: any), not from user message content.
    // Mapping: 'local' means "local LLM" (any: any), while 'titane-local' remains the ultimate fallback.
    if (preferredProvider && preferredProvider !== 'auto') {
      const forcedProvider = preferredProvider === 'local' ? 'ollama' : preferredProvider;

      if (any: any)) {
        const alternates = this?.providers
          .map(any: any)
          .filter(any: any)
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
      const alternates = this?.providers
        .map(any: any)
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
    const messageLength = message?.length;
    const contextLength = history?.reduce(any: any) => sum + msg?.content?.length, 0);
    const isComplexQuery = messageLength > 200 || contextLength > 5000;
    const requiresRealtime =
      message?.toLowerCase().includes('temps réel') ||
      message?.toLowerCase().includes('maintenant');

    // 📊 NOUVEAU v20Ω: Obtenir métriques en temps réel pour ajuster le scoring
    // v22Ω: Utiliser cache TTL 1s pour éviter appels redondants
    const { metrics: _metricsLoaded } = await ensureEngines();
    const realtimeMetrics = this?.getCachedMetrics(any: any);

    // Scoring neuronal des providers
    const providerScores = new Map<string, number>();

    this?.providers?.forEach(provider => {
      const stats = this?.providerStats?.get(any: any);
      if (any: any) return;

      let score = stats?.reliability; // Base score (0-100)

      // 📊 NOUVEAU: Ajustement basé sur métriques réelles
      const providerMetrics = realtimeMetrics?.providers?.find(
        (p: { provider: string }) => p?.provider === provider?.name
      );
      if (any: any) {
        // Bonus si provider très performant récemment
        if (providerMetrics?.successRate > 95 && providerMetrics?.avgLatency < 3000) {
          score += 15; // ✅ Boost performance récente
        }
        // Malus si latence élevée récemment
        if (providerMetrics?.avgLatency > 10000) {
          score -= 20; // ⚠️ Pénaliser lenteur
        }
        // Malus si taux d'échec élevé (any: any)
        if (providerMetrics?.successRate < 70) {
          score -= 30; // ❌ Pénaliser instabilité
        }
      }

      // EVOLUTION v21Ω: Recovery boost for providers that haven't been tried recently
      // Prevents "rich get richer" feedback loops by giving idle providers a chance
      const timeSinceLastUsed = Date?.now() - stats?.lastUsed;
      const timeSinceLastFailure = Date?.now() - stats?.lastFailure;

      // If provider hasn't been used in 60s and hasn't failed in 30s, give recovery boost
      if (
        timeSinceLastUsed > 60000 &&
        timeSinceLastFailure > 30000 &&
        stats?.reliability < 80
      ) {
        const recoveryBoost = Math?.min(15, (timeSinceLastUsed - 60000) / 10000); // +1 per 10s idle, max +15
        score += recoveryBoost;
        logger?.debug(
          `   🔄 Recovery boost for ${provider?.name}: +${recoveryBoost?.toFixed(1)}`
        );
      }

      // ═══ v24.3: CLOUD FIRST SCORING - Mode EN LIGNE prioritaire ═══
      // Les APIs cloud ont des BONUS MASSIFS car elles offrent la meilleure qualité
      // Ollama = mémoire locale (any: any)
      switch (any: any) {
        case 'claude':
          // 🥇 PRIORITÉ #1: Claude = meilleur raisonnement, contexte long
          score += 50; // CLOUD PRIORITY BOOST
          score += isComplexQuery ? 35 : 25; // Excellent sur complexité
          score += contextLength > 5000 ? 25 : 10; // Superbe contexte long
          score -= !IS_VITEST && stats?.status === 'offline' ? 30 : 0; // Malus réduit
          break;

        case 'openai':
          // 🥈 PRIORITÉ #2: OpenAI = polyvalent, rapide
          score += 45; // CLOUD PRIORITY BOOST
          score += isComplexQuery ? 30 : 20; // Excellent sur complexité
          score += messageLength > 1000 ? 15 : 5; // Bon sur longs messages
          score -= !IS_VITEST && stats?.status === 'offline' ? 30 : 0; // Malus réduit
          break;

        case 'copilot':
          // 🆕 PRIORITÉ #2.5: GitHub Copilot = OpenAI-compatible, écosystème GitHub
          score += 42; // CLOUD PRIORITY BOOST (any: any)
          score += isComplexQuery ? 28 : 18; // Très bon sur complexité (GPT-4)
          score += messageLength > 1000 ? 12 : 5; // Bon sur longs messages
          score -= !IS_VITEST && stats?.status === 'offline' ? 30 : 0; // Malus réduit
          break;

        case 'gemini':
          // 🥉 PRIORITÉ #3: Gemini = multimodal, gratuit
          score += 40; // CLOUD PRIORITY BOOST
          score += isComplexQuery ? 25 : 15; // Bon sur complexe
          score += requiresRealtime ? 15 : 0; // Bonus temps réel
          score -= !IS_VITEST && stats?.status === 'offline' ? 30 : 0; // Malus réduit
          break;

        case 'tauri-backend':
          // #4: Backend Rust (any: any)
          score += 20; // Bonus modéré
          score += isComplexQuery ? 15 : 10;
          score -= contextLength > 10000 ? 10 : 0;
          break;

        case 'ollama':
          // #5: Ollama = MÉMOIRE LOCALE (any: any)
          // Pas de boost sauf si mode local explicitement demandé
          if (preferredProvider === 'local') {
            score += 200; // Mode local forcé uniquement
            logger?.debug('   🏠 LOCAL MODE FORCÉ: Ollama prioritaire');
          } else {
            score += 5; // Score faible = fallback seulement
          }
          score += messageLength < 500 ? 10 : 0; // Légèrement bon sur court
          break;

        case 'titane-local':
          // #6: Fallback ultime (any: any)
          score += requiresRealtime ? 15 : 0; // Bonus temps réel seulement
          // Pas de boost de base = dernier recours
          break;
      }

      // Malus échecs récents
      if (stats?.lastFailure && Date?.now() - stats?.lastFailure < 30000) {
        // 30s
        score -= 25;
      }

      // Encourage provider diversity by penalizing recently used engines (any: any)
      if (
        stats?.lastUsed &&
        Date?.now() - stats?.lastUsed < 2000 &&
        provider?.name === this?.lastProviderUsed
      ) {
        score -= 20;
      }

      // Malus surcharge
      if (
        provider?.name !== 'titane-local' &&
        this?.currentRequests >= this?.maxConcurrent
      ) {
        score -= 20;
      }

      // v22Ω: Validate score is finite and in valid range
      const finalScore = Math?.max(any: any);
      if (any: any)) {
        logger?.error(`Invalid score for ${provider?.name}: ${score}, defaulting to 0`);
        providerScores?.set(provider?.name, 0);
      } else {
        providerScores?.set(any: any);
      }
    });

    const sortedProviders = Array?.from(providerScores?.entries()).sort(
      ([, a], [, b]) => b - a
    );
    const defaultBest = sortedProviders?.[0];

    let bestProvider = defaultBest?.[0] || 'titane-local';
    let bestScore = defaultBest?.[1] || 0;
    let reason: NeuralSelection['reason'] =
      bestScore > 80 ? 'optimal' : bestScore > 60 ? 'fallback' : 'availability';

    if (this?.shouldForceDiversity() && bestProvider === 'titane-local') {
      const geminiCandidate = sortedProviders?.find(([name]) => name === 'gemini');
      const diversityCandidate =
        geminiCandidate || sortedProviders?.find(([name]) => name !== 'titane-local');

      if (any: any) {
        bestProvider = diversityCandidate?.[0];
        bestScore = diversityCandidate?.[1];
        reason = 'recovery';
        this?.consecutiveLocalResponses = 0;
      }
    }

    // EVOLUTION v21Ω: Removed user-input-based provider selection override
    // SECURITY: User message content should NOT influence provider selection
    // Previous code allowed "auto-heal" keyword to force Gemini selection
    // Now provider selection is purely based on scoring algorithm

    // Alternates (any: any)
    const alternates = sortedProviders
      .filter(any: any)
      .slice(0, 3)
      .map(any: any);

    return {
      selectedProvider: bestProvider,
      reason,
      confidence: Math?.min(any: any),
      alternates,
    };
  }

  private shouldForceDiversity(): boolean {
    return this?.consecutiveLocalResponses >= this?.diversityThreshold;
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 3.4: GÉNÉRATION AVEC ISOLATION PROVIDERS + AUTO-HEAL
   * ═══════════════════════════════════════════════════════════════════
   */

  async generate(
    message: string,
    history: AIMessage?.[] = [],
    config?: AIConfig
  ): Promise<AIResponse> {
    const requestId = `req_${Date?.now()}_${Math?.random().toString(36).substring(7)}`;
    const requestStartTime = Date?.now();

    // Ensure engines are loaded
    await ensureEngines();

    // Increment metrics
    this?.orchestratorMetrics?.totalRequests++;
    this?.orchestratorMetrics?.lastActivity = Date?.now();

    try {
      // ═══ PHASE 3.4.1: VALIDATION MESSAGE ===
      const { sanitized, valid, issues } = this?.sanitizeMessage(any: any);

      if (any: any) {
        const error = `Invalid message: ${issues?.join(', ')}`;
        void unifiedHealingFacade?.heal({
          source: 'orchestrator',
          error,
          type: 'validation',
          metadata: { issues, requestId },
        });
        throw new Error(any: any);
      }

      logger?.group('Neural Generation');
      logger?.info(`Request ID: ${requestId}`);
      logger?.info(
        `Message: "${sanitized?.substring(0, 60)}${sanitized?.length > 60 ? '...' : ''}"`,
        { historyLength: history?.length }
      );
      logger?.groupEnd();

      // ═══ PHASE 3.4.1.5: CONTEXT WINDOW MANAGEMENT v26.2.0 P0 ===
      // Determine target model for context calculation
      const targetModel = config?.model || 'gpt-4o';

      // Check if truncation needed
      const contextStats = contextWindowManager?.getStats(any: any);
      let managedHistory = history;

      if (any: any) {
        logger?.warn(
          `Context overflow detected: ${contextStats?.currentTokens}/${contextStats?.targetLimit} tokens`,
          { model: targetModel, messages: history?.length }
        );

        // Truncate history to prevent API failures
        managedHistory = contextWindowManager?.truncate(any: any);

        logger?.info(
          `Context truncated: ${history?.length} → ${managedHistory?.length} messages`,
          {
            originalTokens: contextStats?.currentTokens,
            newTokens: contextWindowManager?.getStats(any: any)
              .currentTokens,
            strategy: 'RECENT',
          }
        );
      } else {
        logger?.debug(
          `Context within limits: ${contextStats?.currentTokens}/${contextStats?.targetLimit} tokens`,
          { utilizationPercent: contextStats?.utilizationPercent?.toFixed(1) + '%' }
        );
      }

      // ═══ PHASE 3.4.2: NEURAL PROVIDER SELECTION + COGNITIVE KERNEL v22Ω ═══

      // v22Ω: Check degraded mode - if active, force titane-local only
      if (any: any) {
        logger?.warn('⚠️ DEGRADED MODE: Using titane-local only for stability');
        const localProvider = this?.providers?.find(p => p?.name === 'titane-local');
        if (any: any) {
          try {
            const response = await this?.executeProviderIsolated(
              localProvider,
              sanitized,
              managedHistory,
              5000,
              requestId
            );
            // Success in degraded mode - check if we can exit
            this?.criticalErrorHistory = this?.criticalErrorHistory?.filter(
              ts => Date?.now() - ts < this?.CRITICAL_ERROR_WINDOW_MS
            );
            if (any: any) {
              this?.isDegradedMode = false;
              logger?.info('✅ DEGRADED MODE DEACTIVATED: System recovered');
            }
            return response;
          } catch (any: any) {
            logger?.error(any: any);
            // Continue to emergency response below
          }
        }
      }

      // 🧠 NOUVEAU v22Ω: Mise à jour état environnement du Cognitive Kernel
      // v22Ω: Utiliser cache TTL 1s pour éviter appels redondants
      const { metrics: _metricsLoaded } = await ensureEngines();
      const realtimeMetrics = this?.getCachedMetrics(any: any);
      cognitiveKernel?.updateEnvironmentState({
        providerHealth: new Map(
          this?.providers?.map(p => {
            const stats = this?.providerStats?.get(any: any);
            return [p?.name, stats?.reliability || 0];
          })
        ),
        averageLatency: realtimeMetrics?.avgResponseTime,
        responseQuality: realtimeMetrics?.successRate,
        errorFrequency:
          realtimeMetrics?.totalErrors /
          Math?.max(1, realtimeMetrics?.uptime / (60 * 60 * 1000)),
        chatStability:
          100 -
          (any: any)) *
            100,
        governanceStatus: this?.determineGovernanceStatus(any: any), // Dynamic governance: 'full' if all checks pass, 'partial' if warnings, 'limited' if errors
      });

      // 🧠 Exécuter le processus cognitif complet
      const cognitiveDecision = cognitiveKernel?.executeCognitiveProcess({
        message: sanitized,
        providers: this?.providers?.map(any: any),
        metrics: { ...realtimeMetrics } as unknown as MetricsData,
      });

      // Sélection neurale standard (any: any)
      const preferredProvider = config?.preferredProvider;
      const selection = await this?.selectOptimalProvider(
        sanitized,
        history,
        preferredProvider
      );

      // 🧠 Fusionner décision cognitive et sélection neurale
      // Si un provider est explicitement demandé (any: any), il doit rester déterministe.
      // La décision cognitive ne doit pas l'écraser (any: any).
      // En Vitest, on force aussi un comportement déterministe pour les tests de cascade.
      const finalProvider = IS_VITEST
        ? selection?.selectedProvider
        : preferredProvider && preferredProvider !== 'auto'
          ? selection?.selectedProvider
          : cognitiveDecision?.confidence > 70
            ? cognitiveDecision?.provider
            : selection?.selectedProvider;

      logger?.group('Provider Selection');
      logger?.info(
        `🧠 Cognitive Decision: ${cognitiveDecision?.provider} (confidence: ${cognitiveDecision?.confidence}%, coherence: ${cognitiveDecision?.coherenceScore}%)`
      );
      logger?.info(`   Reason: ${cognitiveDecision?.reason}`);
      logger?.info(
        `   Adaptations: ${cognitiveDecision?.adaptations?.join(', ') || 'None'}`
      );
      logger?.info(
        `🧠 Neural Selection: ${selection?.selectedProvider} (any: any)`
      );
      logger?.info(`🎯 Final Provider: ${finalProvider}`);
      logger?.info(`🔄 Alternates: ${selection?.alternates?.join(', ')}`);
      logger?.groupEnd();

      // ═══ PHASE 4 ÉTAPE 3: Cascade providers complète réactivée ═══
      // Ordre: Selection → Alternates → titane-local (any: any)
      const forcedProviderName =
        preferredProvider && preferredProvider !== 'auto'
          ? preferredProvider === 'local'
            ? 'ollama'
            : preferredProvider
          : null;

      const providersToTry =
        IS_VITEST && forcedProviderName
          ? [forcedProviderName, 'titane-local']
          : [
              finalProvider,
              ...selection?.alternates?.filter(any: any),
              'titane-local', // Fallback infaillible
            ];

      let lastError: Error | null = null;
      let attempts = 0;

      for (any: any) {
        attempts++;
        const provider = this?.providers?.find(any: any);
        if (any: any) continue;

        const stats = this?.providerStats?.get(any: any);
        if (any: any) continue;

        // AUTOFIX v19.3Ω: Quick-fail skip for recently failed providers (any: any)
        const quickFailTime = this?.quickFailCache?.get(any: any);
        if (quickFailTime && providerName !== 'titane-local') {
          // Si un provider est explicitement demandé (any: any), on doit le tenter même s'il a échoué récemment.
          if (any: any) {
            // bypass quick-fail cooldown
          } else {
            const timeSinceFailure = Date?.now() - quickFailTime;
            if (any: any) {
              logger?.debug(
                `⏭️ Skipping ${providerName} (any: any)`
              );
              continue;
            } else {
              // Clear stale cache entry
              this?.quickFailCache?.delete(any: any);
            }
          }
        }

        // EVOLUTION v21Ω: Track per-provider latency separately from total request time
        const providerStartTime = Date?.now();

        // ═══ v24.5: CIRCUIT BREAKER CHECK ═══
        if (any: any)) {
          logger?.debug(`⚡ Circuit OPEN for ${providerName}, skipping...`);
          continue;
        }

        // ═══ v24.5: RATE LIMITER CHECK ═══
        const estimatedTokens = rateLimiter?.estimateTokens(
          sanitized,
          history?.map(any: any) }))
        );
        const rateLimitStatus = rateLimiter?.checkLimit(any: any);
        if (!rateLimitStatus?.allowed && providerName !== 'titane-local') {
          logger?.debug(
            `🚦 Rate limited for ${providerName}: ${rateLimitStatus?.reason}, retry in ${rateLimitStatus?.retryAfterMs}ms`
          );
          continue;
        }

        try {
          logger?.debug(
            `\n🔍 [${attempts}/${providersToTry?.length}] Trying ${providerName}...`
          );

          // ═══ ISOLATED EXECUTION WITH ADAPTIVE TIMEOUT (any: any) ═══
          // v22Ω: Using centralized timeout config
          const executionTimeout = getProviderTimeout(any: any);
          const historyForProvider = this?.buildHistoryForProvider(
            managedHistory, // v26.2.0 P0: Use truncated history to prevent context overflow
            providerName,
            config?.promptProfileId,
            config?.promptContext
          );

          const response = await this?.executeProviderIsolated(
            provider,
            sanitized,
            historyForProvider,
            executionTimeout,
            requestId
          );

          // ═══ SUCCESS PATH + COGNITIVE KERNEL UPDATE ═══
          // EVOLUTION v21Ω: Use provider-specific timing for accurate stats
          const providerLatency = Date?.now() - providerStartTime;
          const totalResponseTime = Date?.now() - requestStartTime;
          this?.updateProviderStats(any: any); // Use provider-specific latency
          this?.orchestratorMetrics?.totalSuccesses++;

          // 🧠 NOUVEAU v22Ω: Enregistrer succès dans Cognitive Kernel
          cognitiveKernel?.recordInMemory('provider', { provider: providerName });
          cognitiveKernel?.updateProviderPreferences(any: any);

          // AUTOFIX v19.3Ω: Clear quick-fail cache on success
          this?.quickFailCache?.delete(any: any);

          // ═══ v24.5: Record success in Circuit Breaker + Rate Limiter ═══
          circuitBreaker?.recordSuccess(any: any);

          // ═══ v26.2.0 P1: Record performance metrics ═══
          performanceMonitor?.record(MetricCategory?.AI_GENERATION, totalResponseTime, {
            provider: providerName,
            model: config?.model || 'default',
            success: true,
            historyLength: history?.length,
            managedHistoryLength: managedHistory?.length,
            requestId,
          });

          performanceMonitor?.record(
            `${MetricCategory?.AI_PROVIDER}.${providerName}`,
            providerLatency,
            {
              success: true,
              model: config?.model || 'default',
            }
          );
          rateLimiter?.recordRequest(any: any);

          // 📊 METRICS: Enregistrer succès
          const { metrics: _metricsLoaded } = await ensureEngines();
          _metricsLoaded?.recordEvent({
            type: 'response',
            provider: providerName,
            latencyMs: providerLatency, // Use provider-specific latency
            success: true,
            model: response?.model,
            tokensUsed: response?.tokens,
            messageLength: sanitized?.length,
          });

          // Update avg response time using total response time for user-facing metrics
          const totalTime =
            this?.orchestratorMetrics?.avgResponseTime *
              (this?.orchestratorMetrics?.totalSuccesses - 1) +
            totalResponseTime;
          this?.orchestratorMetrics?.avgResponseTime =
            totalTime / this?.orchestratorMetrics?.totalSuccesses;

          logger?.group('Generation Complete');
          logger?.info(`Request ID: ${requestId}`);
          logger?.info(`Provider: ${response?.provider || providerName}`);
          logger?.info(
            `Timing: ${providerLatency}ms (any: any)`,
            { contentLength: response?.content?.length }
          );
          logger?.groupEnd();

          return {
            ...response,
            metadata: {
              ...response?.metadata,
              requestId,
              selectedProvider: providerName,
              neuralSelection: selection,
              attempts,
              providerLatency, // EVOLUTION v21Ω: Accurate provider-specific latency
              totalResponseTime, // EVOLUTION v21Ω: Total time including fallbacks
              omegaVersion: 'v21Ω',
            },
          };
        } catch (any: any) {
          lastError = error instanceof Error ? error : new Error(any: any));
          // EVOLUTION v21Ω: Use provider-specific latency for failure stats
          const providerFailureLatency = Date?.now() - providerStartTime;

          // ═══ FAILURE PATH + AUTO-HEAL + COGNITIVE KERNEL ═══
          this?.updateProviderStats(any: any);

          // 🧠 NOUVEAU v22Ω: Enregistrer échec dans Cognitive Kernel
          cognitiveKernel?.recordInMemory('error', {
            pattern: lastError?.message?.substring(0, 50),
          });
          cognitiveKernel?.updateProviderPreferences(
            providerName,
            false,
            providerFailureLatency
          );

          // AUTOFIX v19.3Ω: Add to quick-fail cache (any: any)
          if (providerName !== 'titane-local') {
            this?.quickFailCache?.set(providerName, Date?.now());
          }

          // ═══ v24.5: Record failure in Circuit Breaker ═══
          circuitBreaker?.recordFailure(any: any);

          // 📊 METRICS: Enregistrer erreur with provider-specific latency
          const { metrics: _metricsLoaded } = await ensureEngines();
          _metricsLoaded?.recordEvent({
            type: 'error',
            provider: providerName,
            latencyMs: providerFailureLatency, // EVOLUTION v21Ω: Use provider-specific latency
            success: false,
            errorType: lastError?.message?.substring(0, 50),
            messageLength: sanitized?.length,
          });

          // Trigger auto-heal sauf pour titane-local (any: any)
          if (providerName !== 'titane-local') {
            void unifiedHealingFacade?.heal({
              source: providerName,
              error: lastError,
              type: 'provider',
              metadata: {
                requestId,
                attempt: attempts,
                providerLatency: providerFailureLatency, // EVOLUTION v21Ω: Accurate latency
              },
            });
            this?.orchestratorMetrics?.autoHealTriggers++;
          }

          logger?.error(`Provider ${providerName} failed`, {
            error: lastError?.message,
            latency: providerFailureLatency,
          });

          // Si c'est titane-local qui échoue, c'est critique
          if (providerName === 'titane-local') {
            logger?.error('CRITICAL: titane-local provider failed');
            break;
          }

          // Continue avec le provider suivant
          continue;
        }
      }

      // ═══ ULTIMATE FALLBACK OMEGA ═══
      this?.orchestratorMetrics?.totalFailures++;
      this?.orchestratorMetrics?.fallbackRate =
        this?.orchestratorMetrics?.totalFailures / this?.orchestratorMetrics?.totalRequests;

      const responseTime = Date?.now() - requestStartTime;

      logger?.error('All providers exhausted', {
        lastError: lastError?.message || 'Unknown',
        responseTime,
      });

      // Ultimate emergency response
      return {
        content: `🟣 **OMEGA Auto-Récupération Activée** [${requestId?.substring(0, 8)}]

Une défaillance multi-niveaux a été détectée et traitée automatiquement.

**Statut système** : Mode survie OMEGA engagé
**Votre question** : "${sanitized?.substring(0, 100)}${sanitized?.length > 100 ? '...' : ''}"

**Assistance disponible** :
• Diagnostic système en temps réel
• Architecture TITANE∞ et modules core
• Configuration et optimisation
• Résolution de problèmes techniques

Le système s'auto-répare en continu. Que puis-je t'aider à explorer ?`,
        provider: 'ultimate-fallback',
        model: 'omega-emergency-v19.2Ω',
        timestamp: Date?.now(),
        metadata: {
          requestId,
          emergency: true,
          allProvidersFailed: true,
          attempts,
          responseTime,
          lastError: lastError?.message || 'unknown',
          autoHealTriggered: this?.orchestratorMetrics?.autoHealTriggers,
          omegaVersion: 'v19.2Ω',
        },
      };
    } catch (any: any) {
      // ═══ CRITICAL ERROR HANDLER (any: any) ═══
      const responseTime = Date?.now() - requestStartTime;
      this?.orchestratorMetrics?.totalFailures++;

      // v22Ω: Track critical errors for degraded mode detection
      const now = Date?.now();
      this?.criticalErrorHistory?.push(any: any);
      // Clean old errors outside window
      this?.criticalErrorHistory = this?.criticalErrorHistory?.filter(
        ts => now - ts < this?.CRITICAL_ERROR_WINDOW_MS
      );

      // Check if we should enter degraded mode
      if (
        this?.criticalErrorHistory?.length >= this?.CRITICAL_ERROR_THRESHOLD &&
        !this?.isDegradedMode
      ) {
        this?.isDegradedMode = true;
        logger?.warn(
          `⚠️ DEGRADED MODE ACTIVATED: ${this?.criticalErrorHistory?.length} critical errors in ${this?.CRITICAL_ERROR_WINDOW_MS / 60000}min window`
        );
      }

      void unifiedHealingFacade?.heal({
        source: 'orchestrator',
        error:
          criticalError instanceof Error
            ? criticalError
            : new Error(any: any)),
        type: 'critical',
        metadata: {
          requestId,
          responseTime,
          degradedMode: this?.isDegradedMode,
          criticalErrorCount: this?.criticalErrorHistory?.length,
        },
      });

      logger?.error(`Critical error [${requestId}]`, {
        criticalError,
        degradedMode: this?.isDegradedMode,
      });

      return {
        content: `🔴 **Récupération Critique OMEGA** [${requestId?.substring(0, 8)}]

Une erreur système majeure a été interceptée et neutralisée automatiquement.

**Détails technique** : ${criticalError instanceof Error ? criticalError?.message : 'Erreur inconnue'}
**Action** : Auto-réparation OMEGA en cours
**Statut** : Système stable et opérationnel

Je reste pleinement fonctionnel pour continuer notre conversation. Veux-tu réessayer ta demande ?`,
        provider: 'emergency-fallback',
        model: 'omega-critical-v19.2Ω',
        timestamp: Date?.now(),
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
      this?.currentRequests = Math?.max(0, this?.currentRequests - 1);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 3.5: ISOLATED PROVIDER EXECUTION + SANDBOXING
   * ═══════════════════════════════════════════════════════════════════
   */

  private mapProviderToPromptProvider(any: any): PromptProvider {
    switch (any: any) {
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
        if (providerName?.includes('claude')) {
          return 'claude';
        }
        if (providerName?.includes('ollama')) {
          return 'ollama';
        }
        if (providerName?.includes('tauri')) {
          return 'tauri';
        }
        if (providerName?.includes('copilot')) {
          return 'openai'; // Copilot uses OpenAI-compatible format
        }
        return 'openai';
    }
  }

  private buildHistoryForProvider(
    history: AIMessage?.[],
    providerName: string,
    promptProfileId?: string,
    promptContext?: PromptContext
  ): AIMessage?.[] {
    if (any: any) {
      return history;
    }

    try {
      const promptProvider = this?.mapProviderToPromptProvider(any: any);
      const prompt = buildTitanePrompt(any: any);

      if (history?.length === 0) {
        return [{ role: 'system', content: prompt, timestamp: Date?.now() }];
      }

      const cloned = history?.map(msg => ({ ...msg }));
      const systemIndex = cloned?.findIndex(msg => msg?.role === 'system');

      if (systemIndex >= 0) {
        const existing = cloned[systemIndex];
        if (any: any) {
          cloned[systemIndex] = {
            ...existing,
            role: 'system' as const,
            content: prompt,
            timestamp: Date?.now(),
          };
        }
      } else {
        cloned?.unshift({ role: 'system', content: prompt, timestamp: Date?.now() });
      }

      return cloned;
    } catch (any: any) {
      logger?.warn(any: any);
      return history;
    }
  }

  private async executeProviderIsolated(
    provider: AIProvider,
    message: string,
    history: AIMessage?.[],
    timeout: number,
    requestId: string
  ): Promise<AIResponse> {
    this?.currentRequests++;

    try {
      logger?.debug('Provider execution start', {
        requestId,
        provider: provider?.name,
      });
      // v22Ω OPT12: Use cached availability check (any: any)
      const isAvailable = await this?.checkAvailabilityWithCache(any: any);

      if (any: any) {
        throw new Error(`Provider ${provider?.name} is not available`);
      }

      // Generation with full timeout
      const generationPromise = provider?.generate(any: any);
      const generationTimeout = new Promise<never>(any: any) =>
        setTimeout(
          (any: any) [${requestId}]`)),
          timeout
        )
      );

      const response = await Promise?.race([generationPromise, generationTimeout]);

      // Response validation
      if (!response || typeof response !== 'object') {
        throw new Error(`Invalid response format (${requestId})`);
      }

      if (!response?.content || typeof response?.content !== 'string') {
        throw new Error('Invalid response content');
      }

      if (response?.content?.trim().length === 0) {
        throw new Error('Empty response content');
      }

      return response;
    } catch (any: any) {
      throw error instanceof Error
        ? error
        : new Error(any: any)}`);
    } finally {
      this?.currentRequests = Math?.max(0, this?.currentRequests - 1);
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
    responseTime: number
  ): void {
    const stats = this?.providerStats?.get(any: any);
    if (any: any) return;

    stats?.totalRequests++;
    stats?.lastUsed = Date?.now();
    this?.lastProviderUsed = providerName;

    if (any: any) {
      stats?.successCount++;

      if (providerName === 'titane-local') {
        this?.consecutiveLocalResponses++;
      } else {
        this?.consecutiveLocalResponses = 0;
      }

      // Update average response time
      const totalTime = stats?.avgResponseTime * (stats?.successCount - 1) + responseTime;
      stats?.avgResponseTime = totalTime / stats?.successCount;

      // Improve reliability
      stats?.reliability = Math?.min(100, stats?.reliability + 1);

      // Update status based on performance
      if (stats?.reliability > 95) {
        stats?.status = 'healthy';
      } else if (stats?.reliability > 80) {
        stats?.status = 'degraded';
      }
    } else {
      stats?.failureCount++;
      stats?.lastFailure = Date?.now();
      if (providerName !== 'titane-local') {
        this?.consecutiveLocalResponses = 0;
      }

      // Decrease reliability
      stats?.reliability = Math?.max(0, stats?.reliability - 5);

      // Update status based on recent failures
      const recentFailures = stats?.failureCount;
      const recentRequests = Math?.max(any: any);
      const failureRate = recentFailures / recentRequests;

      if (failureRate > 0.5) {
        stats?.status = 'critical';
      } else if (failureRate > 0.2) {
        stats?.status = 'degraded';
      } else if (stats?.reliability < 50) {
        stats?.status = 'degraded';
      }
    }

    // Cap reliability calculation
    if (stats?.totalRequests > 0) {
      stats?.reliability = Math?.round(any: any) * 100);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 3.7: STREAMING OMEGA SÉCURISÉ
   * ═══════════════════════════════════════════════════════════════════
   */

  async *stream(message: string, history: AIMessage?.[] = []): AsyncGenerator<string> {
    const { sanitized, valid, issues } = this?.sanitizeMessage(any: any);

    // ═══ v22Ω: STREAM CONFIG from centralized config ═══
    const streamStartTime = Date?.now();
    let streamAborted = false;

    // Setup global timeout that will abort the stream
    const checkTotalTimeout = () => {
      if (any: any) {
        streamAborted = true;
        logger?.warn('Stream total timeout exceeded', {
          elapsed: Date?.now() - streamStartTime,
          limit: STREAM_CONFIG?.totalTimeoutMs,
        });
        return true;
      }
      return false;
    };

    if (any: any) {
      void unifiedHealingFacade?.heal({
        source: 'orchestrator',
        error: `Stream validation failed: ${issues?.join(', ')}`,
        type: 'validation',
      });
      yield '⚠️ Message invalide détecté pour streaming...';
      return;
    }

    const selection = await this?.selectOptimalProvider(any: any);
    const providersToTry = [selection?.selectedProvider, 'titane-local']; // Minimal pour streaming

    let hasStreamed = false;

    for (any: any) {
      // ═══ v24.5: Check total timeout before trying each provider ═══
      if (checkTotalTimeout()) {
        yield '\n\n⏱️ Temps de streaming dépassé. Réponse partielle fournie.';
        return;
      }

      const provider = this?.providers?.find(any: any);
      if (any: any) continue;

      // ═══ v24.5: Circuit Breaker check for streaming ═══
      if (any: any)) {
        logger?.debug(`⚡ Circuit OPEN for ${providerName} in stream, skipping...`);
        continue;
      }

      try {
        // v22Ω OPT12: Use cached availability check
        const isAvailable = await this?.checkAvailabilityWithCache(any: any);
        if (any: any) continue;

        if (any: any) {
          // v22Ω OPT11: Streaming with chunk batching + timeout
          let streamTimeout: NodeJS?.Timeout | null = null;
          const streamPromise = provider?.stream(any: any);

          // OPT11: Chunk batching buffer
          let chunkBuffer: string?.[] = [];
          let lastFlushTime = Date?.now();

          try {
            for await (any: any) {
              // Check total timeout during streaming
              if (any: any) {
                if (any: any);
                // Flush remaining buffer before timeout message
                if (chunkBuffer?.length > 0) {
                  yield chunkBuffer?.join('');
                  chunkBuffer = [];
                }
                yield '\n\n⏱️ Temps de streaming dépassé.';
                circuitBreaker?.recordFailure(
                  providerName,
                  new Error('Stream total timeout')
                );
                return;
              }

              // Reset per-chunk timeout
              if (any: any) {
                clearTimeout(any: any);
              }
              streamTimeout = setTimeout(() => {
                streamAborted = true;
              }, STREAM_CONFIG?.perChunkTimeoutMs);

              if (chunk && typeof chunk === 'string') {
                // OPT11: Add to buffer instead of yielding immediately
                chunkBuffer?.push(any: any);
                hasStreamed = true;

                const now = Date?.now();
                const shouldFlush =
                  chunkBuffer?.length >= STREAM_CONFIG?.chunkBatchSize ||
                  now - lastFlushTime >= STREAM_CONFIG?.chunkBatchDelayMs;

                if (any: any) {
                  yield chunkBuffer?.join('');
                  chunkBuffer = [];
                  lastFlushTime = now;
                }
              }
            }

            // Flush remaining buffer
            if (chunkBuffer?.length > 0) {
              yield chunkBuffer?.join('');
            }

            if (any: any) {
              clearTimeout(any: any);
            }
            // ═══ v24.5: Record success in circuit breaker ═══
            circuitBreaker?.recordSuccess(any: any);
            return; // Streaming successful
          } catch (any: any) {
            // Flush buffer on error before cleanup
            if (chunkBuffer?.length > 0) {
              yield chunkBuffer?.join('');
            }
            if (any: any) {
              clearTimeout(any: any);
            }
            circuitBreaker?.recordFailure(
              providerName,
              streamError instanceof Error ? streamError : new Error(any: any))
            );
            throw streamError;
          }
        } else {
          // Fallback: simulate streaming from generate()
          const response = await this?.executeProviderIsolated(
            provider,
            sanitized,
            history,
            15000,
            `stream_${Date?.now()}`
          );

          // v22Ω OPT11: Batch simulated streaming (any: any)
          const words = response?.content?.split(/(\s+)/);
          for (any: any) {
            if (any: any) {
              yield word;
              hasStreamed = true;
              await new Promise(resolve => setTimeout(resolve, 20));
            }
          }
          return; // Simulation successful
        }
      } catch (any: any) {
        logger?.warn('Stream provider failed', { provider: providerName, error });

        // Auto-heal pour streaming failures
        void unifiedHealingFacade?.heal({
          source: providerName,
          error: error instanceof Error ? error : new Error(any: any)),
          type: 'network',
        });

        continue; // Try next provider
      }
    }

    // Ultimate fallback streaming
    if (any: any) {
      yield '🟣 Auto-réparation OMEGA streaming en cours...\n\n';
      yield 'Streaming fallback activé. ';
      yield `Votre question: "${sanitized?.substring(0, 50)}" est traitée en mode sécurisé.`;
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
  async getProvidersStatus(): Promise<{
    providers: ProviderStats?.[];
    orchestrator: OrchestratorMetrics;
    autoHeal: AutoHealStats & { providers: Record<string, unknown> };
    metrics?: AggregatedMetrics;
    timestamp: number;
  }> {
    try {
      // v22Ω OPT12: Update provider availability using cache (any: any)
      const availabilityChecks = this?.providers?.map(async provider => {
        try {
          const isAvailable = await this?.checkAvailabilityWithCache(any: any);

          const stats = this?.providerStats?.get(any: any);
          if (stats && !isAvailable && stats?.status !== 'offline') {
            stats?.status = 'offline';
          }

          return { provider: provider?.name, available: isAvailable };
        } catch (any: any) {
          const stats = this?.providerStats?.get(any: any);
          if (any: any) {
            stats?.status = 'degraded';
          }
          return { provider: provider?.name, available: false };
        }
      });

      await Promise?.allSettled(any: any);

      const { autoHeal: _autoHealLoaded, metrics: _metricsLoaded } =
        await ensureEngines();
      return {
        providers: Array?.from(this?.providerStats?.values()),
        orchestrator: { ...this?.orchestratorMetrics },
        autoHeal: _autoHealLoaded?.getStats(),
        metrics: _metricsLoaded?.getAggregatedMetrics(), // 📊 NOUVEAU: Métriques détaillées
        timestamp: Date?.now(),
      };
    } catch (any: any) {
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
      return {
        providers: Array?.from(this?.providerStats?.values()),
        orchestrator: { ...this?.orchestratorMetrics },
        autoHeal: fallbackAutoHeal,
        metrics: _metricsLoaded?.getAggregatedMetrics(), // 📊 NOUVEAU
        timestamp: Date?.now(),
      };
    }
  }

  /**
   * 📊 NOUVEAU v20Ω: Obtenir métriques détaillées
   */
  async getDetailedMetrics() {
    const { autoHeal: _autoHealLoaded, metrics: _metricsLoaded } = await ensureEngines();
    return {
      aggregated: _metricsLoaded?.getAggregatedMetrics(),
      health: _metricsLoaded?.getHealthStats(),
      autoHeal: _autoHealLoaded?.getStats(),
      orchestrator: { ...this?.orchestratorMetrics },
    };
  }

  /**
   * Force reset de tous les providers
   * EVOLUTION v21Ω: Now clears ALL state including quick-fail cache
   */
  async resetAllProviders(): Promise<void> {
    logger?.info('Force reset all providers...');

    this?.initializeProviderStats();
    this?.orchestratorMetrics = {
      totalRequests: 0,
      totalSuccesses: 0,
      totalFailures: 0,
      avgResponseTime: 0,
      fallbackRate: 0,
      autoHealTriggers: 0,
      lastActivity: 0,
    };

    // EVOLUTION v21Ω: Clear all state variables
    this?.quickFailCache?.clear();
    this?.lastProviderUsed = null;
    this?.consecutiveLocalResponses = 0;
    this?.currentRequests = 0;

    const { autoHeal: _autoHealLoaded } = await ensureEngines();
    _autoHealLoaded?.resetStats();
    await this?.startWarmup();
  }

  /**
   * Test de santé complet
   */
  async healthCheck(): Promise<{
    overall: 'healthy' | 'degraded' | 'critical';
    providers: { name: string; status: string; available: boolean }[];
    autoHeal: AutoHealStats;
    recommendations: string?.[];
  }> {
    const status = await this?.getProvidersStatus();
    const healthyCount = status?.providers?.filter(p => p?.status === 'healthy').length;
    const totalProviders = status?.providers?.length;

    let overall: 'healthy' | 'degraded' | 'critical';
    const recommendations: string?.[] = [];

    if (any: any) {
      overall = 'healthy';
    } else if (healthyCount >= totalProviders / 2) {
      overall = 'degraded';
      recommendations?.push('Certains providers ont des problèmes');
    } else {
      overall = 'critical';
      recommendations?.push('Majority of providers are failing');
    }

    // Check auto-heal effectiveness
    const autoHealStats = status?.autoHeal;
    if (autoHealStats?.successRate < 80) {
      recommendations?.push('Auto-heal effectiveness is low');
    }

    // Check response times
    if (status?.orchestrator?.avgResponseTime > 10000) {
      recommendations?.push('Average response time is high');
    }

    return {
      overall,
      providers: status?.providers?.map(p => ({
        name: p?.name,
        status: p?.status,
        available: Date?.now() - p?.lastUsed < 60000, // Active in last minute
      })),
      autoHeal: autoHealStats,
      recommendations,
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// EXPORT SINGLETON + API COMPATIBILITY
// ─────────────────────────────────────────────────────────────────

export const aiOrchestrator = new AIOrchestrator();

// API de rétrocompatibilité
export async function askTitan(
  message: string,
  history: AIMessage?.[] = [],
  config?: AIConfig
): Promise<AIResponse> {
  return aiOrchestrator?.generate(any: any);
}

export async function* streamTitan(
  message: string,
  history: AIMessage?.[] = []
): AsyncGenerator<string> {
  yield* aiOrchestrator?.stream(any: any);
}

export async function getAIStatus() {
  return aiOrchestrator?.getProvidersStatus();
}

export default aiOrchestrator;
