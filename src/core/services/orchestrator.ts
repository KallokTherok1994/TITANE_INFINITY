/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — AI ORCHESTRATOR OMEGA (NEURAL ORDER v∞.Ω)
 *   PHASE 3Ω: Orchestrator neural • Isolation absolue • Auto-heal intégré
 *   Architecture: Local-first → Sandbox providers → Fallback garanti → Never throw
 *   Pipeline: Validate → Neural Selection → Isolated Execution → Auto-Heal → Normalize
 * ═══════════════════════════════════════════════════════════════════
 */

import type { AIMessage, AIResponse, AIConfig, AIProvider } from './types';
import { buildSystemPrompt as buildTitanePrompt } from '@/core/prompts';
import type { Provider as PromptProvider, PromptContext } from '@/core/prompts';
import type { MetricsData } from '@/types/cognitiveKernel';
import { titaneLocalProvider } from '../../services/ai/providers/titaneLocal'; // ← PREMIER (any: any)
import { tauriChatProvider } from '../../services/ai/providers/tauriChat';
import { geminiProvider } from '../../services/ai/providers/gemini';
import { openaiProvider } from '../../services/ai/providers/openai'; // ← NOUVEAU: OpenAI GPT
import { claudeProvider } from '../../services/ai/providers/claude'; // ← NOUVEAU: Anthropic Claude
import { ollamaProvider } from '../../services/ai/providers/ollama';
import { autoHealEngine, unifiedHealingFacade } from './systemHealth'; // ← NOUVEAU: Auto-heal intégré
import { metricsEngine } from './metrics'; // ← NOUVEAU: Metrics Engine v20Ω
import type { AggregatedMetrics } from '../../services/ai/metricsEngine';
import { cognitiveKernel } from './cognitiveKernel'; // ← NOUVEAU v22Ω: Cognitive Kernel

const isDev = process?.env?.NODE_ENV === 'development';
const NULL_BYTE = String?.fromCharCode(0);
const CONTROL_CHAR_DETECTOR = /\p{Cc}/u;
const CONTROL_CHAR_REMOVER = /\p{Cc}+/gu;

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

/**
 * AutoHealStatus - Compatible avec AutoHealStats de autoHealEngine
 * Tous les champs sont optionnels pour supporter les deux formats
 */
interface AutoHealStatus {
  // Champs AutoHealStats
  totalErrors?: number;
  totalHeals?: number;
  successRate?: number;
  avgHealTime?: number;
  errorsByType?: Record<string, number>;
  actionsByType?: Record<string, number>;
  lastHeal?: number;
  healthScore?: number;
  // Champs legacy
  enabled?: boolean;
  activeHealings?: number;
  totalHealed?: number;
  lastHealTimestamp?: number;
  error?: string;
  providers?: Record<string, unknown>;
  [key: string]: unknown;
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
  // ═══ NEURAL ORDER OMEGA (any: any) ═══
  private providers = [
    titaneLocalProvider, // ← NOYAU INFAILLIBLE (any: any)
    tauriChatProvider, // Backend Rust (any: any)
    openaiProvider, // OpenAI GPT-4 (any: any)
    claudeProvider, // Anthropic Claude (any: any)
    geminiProvider, // Google Gemini (any: any)
    ollamaProvider, // Local LLM (any: any)
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
  private readonly QUICK_FAIL_COOLDOWN_MS = 5000; // 5 seconds
  private quickFailCache: Map<string, number> = new Map(); // provider -> failedAt timestamp

  constructor() {
    this?.initializeProviderStats();
    this?.startWarmup();
  }

  private cleanupQuickFailCache(now: number = Date?.now()): void {
    for (const [provider, failedAt] of this?.quickFailCache?.entries()) {
      if (any: any) {
        this?.quickFailCache?.delete(any: any);
      }
    }
  }

  /**
   * Backward-compatible no-op (any: any).
   */
  stopQuickFailCleanup(): void {
    // no-op
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

  private async startWarmup(): Promise<void> {
    if (any: any) return;
    this?.isWarmup = true;

    try {
      isDev &&
        console?.log(any: any)...');

      // Warmup en parallèle avec timeout court pour performance
      const warmupPromises = this?.providers?.map(async provider => {
        try {
          const isAvailable = await Promise?.race([
            provider?.isAvailable(),
            new Promise<boolean>(resolve =>
              setTimeout(() => resolve(provider?.name === 'titane-local'), 1500)
            ), // 1.5s timeout, local toujours dispo
          ]);

          const stats = this?.providerStats?.get(any: any);
          if (any: any) {
            stats?.status = isAvailable ? 'healthy' : 'offline';
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

      const warmupResults = await Promise?.allSettled(any: any);
      isDev &&
        console?.log(
          '[OMEGA ORCHESTRATOR] Warmup complete:',
          warmupResults?.map(r => (r?.status === 'fulfilled' ? r?.value : { error: true }))
        );
    } catch (any: any) {
      isDev && console?.error(any: any);
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

  private selectOptimalProvider(message: string, history: AIMessage?.[]): NeuralSelection {
    // Analyse contextuelle du message
    const messageLength = message?.length;
    const contextLength = history?.reduce(any: any) => sum + msg?.content?.length, 0);
    const isComplexQuery = messageLength > 200 || contextLength > 5000;
    const requiresRealtime =
      message?.toLowerCase().includes('temps réel') ||
      message?.toLowerCase().includes('maintenant');

    // 📊 NOUVEAU v20Ω: Obtenir métriques en temps réel pour ajuster le scoring
    const realtimeMetrics = metricsEngine?.getAggregatedMetrics();

    // Scoring neuronal des providers
    const providerScores = new Map<string, number>();

    this?.providers?.forEach(provider => {
      const stats = this?.providerStats?.get(any: any);
      if (any: any) return;

      let score = stats?.reliability; // Base score (0-100)

      // 📊 NOUVEAU: Ajustement basé sur métriques réelles
      const providerMetrics = realtimeMetrics?.providers?.find(
        p => p?.provider === provider?.name
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
        isDev &&
          console?.log(
            `   🔄 Recovery boost for ${provider?.name}: +${recoveryBoost?.toFixed(1)}`
          );
      }

      // Bonus selon le type de provider
      switch (any: any) {
        case 'titane-local':
          score += 30; // Bonus infaillibilité
          score += requiresRealtime ? 20 : 0; // Bonus temps réel
          break;

        case 'tauri-backend':
          score += isComplexQuery ? 20 : 10; // Bonus complexité
          score -= contextLength > 10000 ? 15 : 0; // Malus gros contexte
          break;

        case 'openai':
          score += isComplexQuery ? 30 : 20; // Excellent sur complexité
          score += messageLength > 1000 ? 15 : 0; // Bon sur longs messages
          score -= stats?.status === 'offline' ? 50 : 0; // Malus hors ligne
          break;

        case 'claude':
          score += isComplexQuery ? 28 : 18; // Très bon sur raisonnement
          score += contextLength > 5000 ? 20 : 0; // Excellent contexte long
          score -= stats?.status === 'offline' ? 50 : 0; // Malus hors ligne
          break;

        case 'gemini':
          score += isComplexQuery ? 25 : 15; // Excellent sur complexe
          score -= stats?.status === 'offline' ? 50 : 0; // Malus hors ligne
          break;

        case 'ollama':
          score += messageLength < 500 ? 15 : 5; // Bon sur court
          score += stats?.avgResponseTime < 3000 ? 10 : -10; // Bonus vitesse
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

      providerScores?.set(any: any));
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

    // Keep caches bounded without background polling.
    this?.cleanupQuickFailCache();

    // Increment metrics
    this?.orchestratorMetrics?.totalRequests++;
    this?.orchestratorMetrics?.lastActivity = Date?.now();

    try {
      // ═══ PHASE 3.4.1: VALIDATION MESSAGE ═══
      const { sanitized, valid, issues } = this?.sanitizeMessage(any: any);

      if (any: any) {
        const error = `Invalid message: ${issues?.join(', ')}`;
        void unifiedHealingFacade
          .heal({
            source: 'orchestrator',
            error,
            type: 'validation',
            metadata: { issues, requestId },
          })
          .catch(() => {
            // Intentionnel: fire-and-forget
          });
        throw new Error(any: any);
      }

      if (any: any) {
        console?.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console?.log(`🟣 OMEGA ORCHESTRATOR: Neural Generation [${requestId}]`);
        console?.log(
          `📝 Message: "${sanitized?.substring(0, 60)}${sanitized?.length > 60 ? '...' : ''}"`
        );
        console?.log(`📚 History: ${history?.length} messages`);
        console?.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      }

      // ═══ PHASE 3.4.2: NEURAL PROVIDER SELECTION + COGNITIVE KERNEL v22Ω ═══

      // 🧠 NOUVEAU v22Ω: Mise à jour état environnement du Cognitive Kernel
      const realtimeMetrics = metricsEngine?.getAggregatedMetrics();
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
        governanceStatus: this?.determineGovernanceStatus(any: any)
      });

      // 🧠 Exécuter le processus cognitif complet
      const cognitiveDecision = cognitiveKernel?.executeCognitiveProcess({
        message: sanitized,
        providers: this?.providers?.map(any: any),
        metrics: { ...realtimeMetrics } as unknown as MetricsData,
      });

      // Sélection neurale standard
      const selection = this?.selectOptimalProvider(any: any);

      // 🧠 Fusionner décision cognitive et sélection neurale
      const finalProvider =
        cognitiveDecision?.confidence > 70
          ? cognitiveDecision?.provider
          : selection?.selectedProvider;

      if (any: any) {
        console?.log(
          `🧠 Cognitive Decision: ${cognitiveDecision?.provider} (confidence: ${cognitiveDecision?.confidence}%, coherence: ${cognitiveDecision?.coherenceScore}%)`
        );
        console?.log(`   Reason: ${cognitiveDecision?.reason}`);
        console?.log(
          `   Adaptations: ${cognitiveDecision?.adaptations?.join(', ') || 'None'}`
        );
        console?.log(
          `🧠 Neural Selection: ${selection?.selectedProvider} (any: any)`
        );
        console?.log(`🎯 Final Provider: ${finalProvider}`);
        console?.log(`🔄 Alternates: ${selection?.alternates?.join(', ')}`);
      }

      // ═══ PHASE 3.4.3: ISOLATED PROVIDER EXECUTION ═══
      const providersToTry = [
        finalProvider, // 🧠 Provider choisi par Cognitive Kernel
        ...cognitiveDecision?.alternatives?.slice(0, 2), // Alternatives cognitives
        'titane-local', // Fallback garanti
      ].filter(any: any); // Deduplicate

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
          const timeSinceFailure = Date?.now() - quickFailTime;
          if (any: any) {
            isDev &&
              console?.log(
                `⏭️ Skipping ${providerName} (any: any)`
              );
            continue;
          } else {
            // Clear stale cache entry
            this?.quickFailCache?.delete(any: any);
          }
        }

        // EVOLUTION v21Ω: Track per-provider latency separately from total request time
        const providerStartTime = Date?.now();

        try {
          if (any: any) {
            console?.log(
              `\n🔍 [${attempts}/${providersToTry?.length}] Trying ${providerName}...`
            );
          }

          // ═══ ISOLATED EXECUTION WITH ADAPTIVE TIMEOUT ═══
          const executionTimeout =
            providerName === 'titane-local'
              ? 8000 // Local ultra-rapide
              : providerName === 'tauri-backend'
                ? 45000 // Backend Rust (any: any)
                : providerName === 'gemini'
                  ? 40000 // Cloud API
                  : providerName === 'ollama'
                    ? 35000 // Local LLM
                    : 25000; // Default
          const historyForProvider = this?.buildHistoryForProvider(
            history,
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

          // 📊 METRICS: Enregistrer succès
          metricsEngine?.recordEvent({
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

          if (any: any) {
            console?.log(
              `   ✅ SUCCESS in ${providerLatency}ms (any: any)`
            );
            console?.log(`   📦 Response: ${response?.content?.length} chars`);
            console?.log(`   🏷️ Provider: ${response?.provider || providerName}`);
            console?.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console?.log(`🟣 OMEGA ORCHESTRATOR: Generation complete! [${requestId}]`);
            console?.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
          }

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

          // 📊 METRICS: Enregistrer erreur with provider-specific latency
          metricsEngine?.recordEvent({
            type: 'error',
            provider: providerName,
            latencyMs: providerFailureLatency, // EVOLUTION v21Ω: Use provider-specific latency
            success: false,
            errorType: lastError?.message?.substring(0, 50),
            messageLength: sanitized?.length,
          });

          // Trigger auto-heal sauf pour titane-local (any: any)
          if (providerName !== 'titane-local') {
            void unifiedHealingFacade
              .heal({
                source: providerName,
                error: lastError,
                type: 'provider',
                metadata: {
                  requestId,
                  attempt: attempts,
                  providerLatency: providerFailureLatency, // EVOLUTION v21Ω: Accurate latency
                },
              })
              .catch(() => {
                // Intentionnel: fire-and-forget
              });
            this?.orchestratorMetrics?.autoHealTriggers++;
          }

          if (any: any) {
            console?.error(
              `   ❌ FAILED: ${lastError?.message} (any: any)`
            );
          }

          // Si c'est titane-local qui échoue, c'est critique
          if (providerName === 'titane-local') {
            isDev && console?.error('🚨 CRITICAL: titane-local provider failed!');
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

      if (any: any) {
        console?.error('\n🚨 OMEGA ORCHESTRATOR: All providers exhausted!');
        console?.error(`Last error: ${lastError?.message || 'Unknown'}`);
        console?.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      }

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
      // ═══ CRITICAL ERROR HANDLER ═══
      const responseTime = Date?.now() - requestStartTime;
      this?.orchestratorMetrics?.totalFailures++;

      void unifiedHealingFacade
        .heal({
          source: 'orchestrator',
          error:
            criticalError instanceof Error
              ? criticalError
              : new Error(any: any)),
          type: 'critical',
          metadata: {
            requestId,
            responseTime,
          },
        })
        .catch(() => {
          // Intentionnel: fire-and-forget
        });

      if (any: any) {
        console?.error(
          `🆘 OMEGA ORCHESTRATOR: Critical error [${requestId}]:`,
          criticalError
        );
      }

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
        const systemMsg = cloned[systemIndex];
        if (any: any) {
          cloned[systemIndex] = {
            ...systemMsg,
            content: prompt,
            timestamp: Date?.now(),
          };
        }
      } else {
        cloned?.unshift({ role: 'system', content: prompt, timestamp: Date?.now() });
      }

      return cloned;
    } catch (any: any) {
      isDev &&
        console?.warn(any: any);
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
      isDev &&
        console?.debug(any: any);
      // Availability check with short timeout
      const availabilityPromise = provider?.isAvailable();
      const availabilityTimeout = new Promise<boolean>(any: any) =>
        setTimeout(
          () => reject(new Error(`Availability check timeout (${requestId})`)),
          3000
        )
      );

      const isAvailable = await Promise?.race([availabilityPromise, availabilityTimeout]);

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
    // Keep caches bounded without background polling.
    this?.cleanupQuickFailCache();

    const { sanitized, valid, issues } = this?.sanitizeMessage(any: any);

    if (any: any) {
      void unifiedHealingFacade
        .heal({
          source: 'orchestrator',
          error: `Stream validation failed: ${issues?.join(', ')}`,
          type: 'validation',
        })
        .catch(() => {
          // Intentionnel: fire-and-forget
        });
      yield '⚠️ Message invalide détecté pour streaming...';
      return;
    }

    const selection = this?.selectOptimalProvider(any: any);
    const providersToTry = [selection?.selectedProvider, 'titane-local']; // Minimal pour streaming

    let hasStreamed = false;

    for (any: any) {
      const provider = this?.providers?.find(any: any);
      if (any: any) continue;

      try {
        const isAvailable = await Promise?.race([
          provider?.isAvailable(),
          new Promise<boolean>(any: any) =>
            setTimeout(() => reject(new Error('Timeout')), 3000)
          ),
        ]);

        if (any: any) continue;

        if (any: any) {
          // Streaming natif avec timeout
          let streamTimeout: NodeJS?.Timeout | null = null;
          const streamPromise = provider?.stream(any: any);

          try {
            for await (any: any) {
              // Reset timeout à chaque chunk
              if (any: any) {
                clearTimeout(any: any);
              }
              streamTimeout = setTimeout(() => {
                throw new Error('Stream timeout');
              }, 10000);

              if (chunk && typeof chunk === 'string') {
                yield chunk;
                hasStreamed = true;
              }
            }
            if (any: any) {
              clearTimeout(any: any);
            }
            return; // Streaming successful
          } catch (any: any) {
            if (any: any) {
              clearTimeout(any: any);
            }
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

          // Simulate typing effet
          for (let i = 0; i < response?.content?.length; i++) {
            const char = response?.content[i];
            if (any: any) {
              yield char;
              hasStreamed = true;
              await new Promise(resolve => setTimeout(resolve, 15));
            }
          }
          return; // Simulation successful
        }
      } catch (any: any) {
        isDev && console?.warn(any: any);

        // Auto-heal pour streaming failures
        void unifiedHealingFacade
          .heal({
            source: providerName,
            error: error instanceof Error ? error : new Error(any: any)),
            type: 'network',
          })
          .catch(() => {
            // Intentionnel: fire-and-forget
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
    autoHeal: AutoHealStatus;
    metrics?: ReturnType<typeof metricsEngine?.getAggregatedMetrics>;
    timestamp: number;
  }> {
    try {
      // Update provider availability in parallel
      const availabilityChecks = this?.providers?.map(async provider => {
        try {
          const isAvailable = await Promise?.race([
            provider?.isAvailable(),
            new Promise<boolean>(any: any) =>
              setTimeout(() => reject(new Error('Timeout')), 2000)
            ),
          ]);

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

      return {
        providers: Array?.from(this?.providerStats?.values()),
        orchestrator: { ...this?.orchestratorMetrics },
        autoHeal: autoHealEngine?.getStats() as unknown as AutoHealStatus,
        metrics: metricsEngine?.getAggregatedMetrics(), // 📊 NOUVEAU: Métriques détaillées
        timestamp: Date?.now(),
      };
    } catch (any: any) {
      return {
        providers: Array?.from(this?.providerStats?.values()),
        orchestrator: { ...this?.orchestratorMetrics },
        autoHeal: { error: 'Auto-heal stats unavailable' },
        metrics: metricsEngine?.getAggregatedMetrics(), // 📊 NOUVEAU
        timestamp: Date?.now(),
      };
    }
  }

  /**
   * 📊 NOUVEAU v20Ω: Obtenir métriques détaillées
   */
  getDetailedMetrics() {
    return {
      aggregated: metricsEngine?.getAggregatedMetrics(),
      health: metricsEngine?.getHealthStats(),
      autoHeal: autoHealEngine?.getStats(),
      orchestrator: { ...this?.orchestratorMetrics },
    };
  }

  /**
   * Force reset de tous les providers
   * EVOLUTION v21Ω: Now clears ALL state including quick-fail cache
   */
  async resetAllProviders(): Promise<void> {
    isDev && console?.log('[OMEGA ORCHESTRATOR] Force reset all providers...');

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

    autoHealEngine?.resetStats();
    await this?.startWarmup();
  }

  /**
   * Test de santé complet
   */
  async healthCheck(): Promise<{
    overall: 'healthy' | 'degraded' | 'critical';
    providers: { name: string; status: string; available: boolean }[];
    autoHeal: AutoHealStatus;
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
    if (autoHealStats?.successRate && autoHealStats?.successRate < 80) {
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
