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
import { titaneLocalProvider } from '../../services/ai/providers/titaneLocal'; // ← PREMIER (noyau infaillible)
import { tauriChatProvider } from '../../services/ai/providers/tauriChat';
import { geminiProvider } from '../../services/ai/providers/gemini';
import { openaiProvider } from '../../services/ai/providers/openai'; // ← NOUVEAU: OpenAI GPT
import { claudeProvider } from '../../services/ai/providers/claude'; // ← NOUVEAU: Anthropic Claude
import { ollamaProvider } from '../../services/ai/providers/ollama';
import { autoHealEngine } from './systemHealth'; // ← NOUVEAU: Auto-heal intégré
import { metricsEngine } from './metrics'; // ← NOUVEAU: Metrics Engine v20Ω
import type { AggregatedMetrics } from '../../services/ai/metricsEngine';
import { cognitiveKernel } from './cognitiveKernel'; // ← NOUVEAU v22Ω: Cognitive Kernel
import { z } from 'zod';

const isDev = process.env.NODE_ENV === 'development';
const NULL_BYTE = String.fromCharCode(0);
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
 * AutoHealStatus - Zod Schema pour validation runtime (P1 Audit v26.3.1)
 * Compatible avec AutoHealStats de autoHealEngine
 */
const AutoHealStatusSchema = z.object({
  // Champs AutoHealStats (format principal)
  totalErrors: z.number().min(0).optional(),
  totalHeals: z.number().min(0).optional(),
  successRate: z.number().min(0).max(100).optional(),
  avgHealTime: z.number().min(0).optional(),
  errorsByType: z.record(z.string(), z.number()).optional(),
  actionsByType: z.record(z.string(), z.number()).optional(),
  lastHeal: z.number().optional(),
  healthScore: z.number().min(0).max(100).optional(),
  // Champs legacy (backward compatibility)
  enabled: z.boolean().optional(),
  activeHealings: z.number().min(0).optional(),
  totalHealed: z.number().min(0).optional(),
  lastHealTimestamp: z.number().optional(),
  error: z.string().optional(),
  providers: z.record(z.string(), z.unknown()).optional(),
}).passthrough(); // Permet champs additionnels pour extensibilité

type AutoHealStatus = z.infer<typeof AutoHealStatusSchema>;

interface NeuralSelection {
  selectedProvider: string;
  reason: 'optimal' | 'fallback' | 'availability' | 'recovery' | 'emergency';
  confidence: number; // 0-100
  alternates: string[];
}

// ─────────────────────────────────────────────────────────────────
// ORCHESTRATOR OMEGA CLASS
// ─────────────────────────────────────────────────────────────────

class AIOrchestrator {
  // ═══ NEURAL ORDER OMEGA (Local-first Sécurity) ═══
  private providers = [
    titaneLocalProvider, // ← NOYAU INFAILLIBLE (toujours en premier)
    tauriChatProvider, // Backend Rust (cascade interne)
    openaiProvider, // OpenAI GPT-4 (puissant, cloud)
    claudeProvider, // Anthropic Claude (intelligent, cloud)
    geminiProvider, // Google Gemini (performant, cloud)
    ollamaProvider, // Local LLM (privé mais plus lent)
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
  private lastProviderUsed: string | null = null;
  private consecutiveLocalResponses = 0;
  private readonly diversityThreshold = 2;

  // AUTOFIX v19.3Ω: Quick-fail cache for providers that failed very recently
  private readonly QUICK_FAIL_COOLDOWN_MS = 5000; // 5 seconds
  private quickFailCache: Map<string, number> = new Map(); // provider -> failedAt timestamp

  constructor() {
    this.initializeProviderStats();
    this.startWarmup();
  }

  private cleanupQuickFailCache(now: number = Date.now()): void {
    for (const [provider, failedAt] of this.quickFailCache.entries()) {
      if (now - failedAt >= this.QUICK_FAIL_COOLDOWN_MS) {
        this.quickFailCache.delete(provider);
      }
    }
  }

  /**
   * Backward-compatible no-op (interval removed; cleanup is on-demand).
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
    this.providers.forEach(provider => {
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
      });
    });
  }

  private async startWarmup(): Promise<void> {
    if (this.isWarmup) return;
    this.isWarmup = true;

    try {
      isDev &&
        console.log('[OMEGA ORCHESTRATOR] Starting provider warmup (optimized)...');

      // Warmup en parallèle avec timeout court pour performance
      const warmupPromises = this.providers.map(async provider => {
        try {
          const isAvailable = await Promise.race([
            provider.isAvailable(),
            new Promise<boolean>(resolve =>
              setTimeout(() => resolve(provider.name === 'titane-local'), 1500)
            ), // 1.5s timeout, local toujours dispo
          ]);

          const stats = this.providerStats.get(provider.name);
          if (stats) {
            stats.status = isAvailable ? 'healthy' : 'offline';
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

      const warmupResults = await Promise.allSettled(warmupPromises);
      isDev &&
        console.log(
          '[OMEGA ORCHESTRATOR] Warmup complete:',
          warmupResults.map(r => (r.status === 'fulfilled' ? r.value : { error: true }))
        );
    } catch (error) {
      isDev && console.error('[OMEGA ORCHESTRATOR] Warmup failed:', error);
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
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 3.3: NEURAL PROVIDER SELECTION (Intelligence Adaptive)
   * ═══════════════════════════════════════════════════════════════════
   */

  private selectOptimalProvider(message: string, history: AIMessage[]): NeuralSelection {
    // Analyse contextuelle du message
    const messageLength = message.length;
    const contextLength = history.reduce((sum, msg) => sum + msg.content.length, 0);
    const isComplexQuery = messageLength > 200 || contextLength > 5000;
    const requiresRealtime =
      message.toLowerCase().includes('temps réel') ||
      message.toLowerCase().includes('maintenant');

    // 📊 NOUVEAU v20Ω: Obtenir métriques en temps réel pour ajuster le scoring
    const realtimeMetrics = metricsEngine.getAggregatedMetrics();

    // Scoring neuronal des providers
    const providerScores = new Map<string, number>();

    this.providers.forEach(provider => {
      const stats = this.providerStats.get(provider.name);
      if (!stats) return;

      let score = stats.reliability; // Base score (0-100)

      // 📊 NOUVEAU: Ajustement basé sur métriques réelles
      const providerMetrics = realtimeMetrics.providers.find(
        p => p.provider === provider.name
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

      // If provider hasn't been used in 60s and hasn't failed in 30s, give recovery boost
      if (
        timeSinceLastUsed > 60000 &&
        timeSinceLastFailure > 30000 &&
        stats.reliability < 80
      ) {
        const recoveryBoost = Math.min(15, (timeSinceLastUsed - 60000) / 10000); // +1 per 10s idle, max +15
        score += recoveryBoost;
        isDev &&
          console.log(
            `   🔄 Recovery boost for ${provider.name}: +${recoveryBoost.toFixed(1)}`
          );
      }

      // Bonus selon le type de provider
      switch (provider.name) {
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
          score -= stats.status === 'offline' ? 50 : 0; // Malus hors ligne
          break;

        case 'claude':
          score += isComplexQuery ? 28 : 18; // Très bon sur raisonnement
          score += contextLength > 5000 ? 20 : 0; // Excellent contexte long
          score -= stats.status === 'offline' ? 50 : 0; // Malus hors ligne
          break;

        case 'gemini':
          score += isComplexQuery ? 25 : 15; // Excellent sur complexe
          score -= stats.status === 'offline' ? 50 : 0; // Malus hors ligne
          break;

        case 'ollama':
          score += messageLength < 500 ? 15 : 5; // Bon sur court
          score += stats.avgResponseTime < 3000 ? 10 : -10; // Bonus vitesse
          break;
      }

      // Malus échecs récents
      if (stats.lastFailure && Date.now() - stats.lastFailure < 30000) {
        // 30s
        score -= 25;
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

      providerScores.set(provider.name, Math.max(0, score));
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

    // Keep caches bounded without background polling.
    this.cleanupQuickFailCache();

    // Increment metrics
    this.orchestratorMetrics.totalRequests++;
    this.orchestratorMetrics.lastActivity = Date.now();

    try {
      // ═══ PHASE 3.4.1: VALIDATION MESSAGE ═══
      const { sanitized, valid, issues } = this.sanitizeMessage(message);

      if (!valid) {
        const error = `Invalid message: ${issues.join(', ')}`;
        autoHealEngine.heal('orchestrator', error, 'validation', { issues, requestId });
        throw new Error(error);
      }

      if (isDev) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`🟣 OMEGA ORCHESTRATOR: Neural Generation [${requestId}]`);
        console.log(
          `📝 Message: "${sanitized.substring(0, 60)}${sanitized.length > 60 ? '...' : ''}"`
        );
        console.log(`📚 History: ${history.length} messages`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      }

      // ═══ PHASE 3.4.2: NEURAL PROVIDER SELECTION + COGNITIVE KERNEL v22Ω ═══

      // 🧠 NOUVEAU v22Ω: Mise à jour état environnement du Cognitive Kernel
      const realtimeMetrics = metricsEngine.getAggregatedMetrics();
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
        governanceStatus: this.determineGovernanceStatus(realtimeMetrics), // Dynamic governance: 'full' if all checks pass, 'partial' if warnings, 'limited' if errors (duplicate of services/ai/orchestrator.ts)
      });

      // 🧠 Exécuter le processus cognitif complet
      const cognitiveDecision = cognitiveKernel.executeCognitiveProcess({
        message: sanitized,
        providers: this.providers.map(p => p.name),
        metrics: { ...realtimeMetrics } as unknown as MetricsData,
      });

      // Sélection neurale standard
      const selection = this.selectOptimalProvider(sanitized, history);

      // 🧠 Fusionner décision cognitive et sélection neurale
      const finalProvider =
        cognitiveDecision.confidence > 70
          ? cognitiveDecision.provider
          : selection.selectedProvider;

      if (isDev) {
        console.log(
          `🧠 Cognitive Decision: ${cognitiveDecision.provider} (confidence: ${cognitiveDecision.confidence}%, coherence: ${cognitiveDecision.coherenceScore}%)`
        );
        console.log(`   Reason: ${cognitiveDecision.reason}`);
        console.log(
          `   Adaptations: ${cognitiveDecision.adaptations.join(', ') || 'None'}`
        );
        console.log(
          `🧠 Neural Selection: ${selection.selectedProvider} (${selection.reason}, ${selection.confidence}% confidence)`
        );
        console.log(`🎯 Final Provider: ${finalProvider}`);
        console.log(`🔄 Alternates: ${selection.alternates.join(', ')}`);
      }

      // ═══ PHASE 3.4.3: ISOLATED PROVIDER EXECUTION ═══
      const providersToTry = [
        finalProvider, // 🧠 Provider choisi par Cognitive Kernel
        ...cognitiveDecision.alternatives.slice(0, 2), // Alternatives cognitives
        'titane-local', // Fallback garanti
      ].filter((name, index, arr) => arr.indexOf(name) === index); // Deduplicate

      let lastError: Error | null = null;
      let attempts = 0;

      for (const providerName of providersToTry) {
        attempts++;
        const provider = this.providers.find(p => p.name === providerName);
        if (!provider) continue;

        const stats = this.providerStats.get(providerName);
        if (!stats) continue;

        // AUTOFIX v19.3Ω: Quick-fail skip for recently failed providers (except titane-local)
        const quickFailTime = this.quickFailCache.get(providerName);
        if (quickFailTime && providerName !== 'titane-local') {
          const timeSinceFailure = Date.now() - quickFailTime;
          if (timeSinceFailure < this.QUICK_FAIL_COOLDOWN_MS) {
            isDev &&
              console.log(
                `⏭️ Skipping ${providerName} (failed ${timeSinceFailure}ms ago, cooldown: ${this.QUICK_FAIL_COOLDOWN_MS}ms)`
              );
            continue;
          } else {
            // Clear stale cache entry
            this.quickFailCache.delete(providerName);
          }
        }

        // EVOLUTION v21Ω: Track per-provider latency separately from total request time
        const providerStartTime = Date.now();

        try {
          if (isDev) {
            console.log(
              `\n🔍 [${attempts}/${providersToTry.length}] Trying ${providerName}...`
            );
          }

          // ═══ ISOLATED EXECUTION WITH ADAPTIVE TIMEOUT ═══
          const executionTimeout =
            providerName === 'titane-local'
              ? 8000 // Local ultra-rapide
              : providerName === 'tauri-backend'
                ? 45000 // Backend Rust (cascade interne)
                : providerName === 'gemini'
                  ? 40000 // Cloud API
                  : providerName === 'ollama'
                    ? 35000 // Local LLM
                    : 25000; // Default
          const historyForProvider = this.buildHistoryForProvider(
            history,
            providerName,
            config?.promptProfileId,
            config?.promptContext
          );

          const response = await this.executeProviderIsolated(
            provider,
            sanitized,
            historyForProvider,
            executionTimeout,
            requestId
          );

          // ═══ SUCCESS PATH + COGNITIVE KERNEL UPDATE ═══
          // EVOLUTION v21Ω: Use provider-specific timing for accurate stats
          const providerLatency = Date.now() - providerStartTime;
          const totalResponseTime = Date.now() - requestStartTime;
          this.updateProviderStats(providerName, true, providerLatency); // Use provider-specific latency
          this.orchestratorMetrics.totalSuccesses++;

          // 🧠 NOUVEAU v22Ω: Enregistrer succès dans Cognitive Kernel
          cognitiveKernel.recordInMemory('provider', { provider: providerName });
          cognitiveKernel.updateProviderPreferences(providerName, true, providerLatency);

          // AUTOFIX v19.3Ω: Clear quick-fail cache on success
          this.quickFailCache.delete(providerName);

          // 📊 METRICS: Enregistrer succès
          metricsEngine.recordEvent({
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

          if (isDev) {
            console.log(
              `   ✅ SUCCESS in ${providerLatency}ms (total: ${totalResponseTime}ms)`
            );
            console.log(`   📦 Response: ${response.content.length} chars`);
            console.log(`   🏷️ Provider: ${response.provider || providerName}`);
            console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`🟣 OMEGA ORCHESTRATOR: Generation complete! [${requestId}]`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
          }

          return {
            ...response,
            metadata: {
              ...response.metadata,
              requestId,
              selectedProvider: providerName,
              neuralSelection: selection,
              attempts,
              providerLatency, // EVOLUTION v21Ω: Accurate provider-specific latency
              totalResponseTime, // EVOLUTION v21Ω: Total time including fallbacks
              omegaVersion: 'v21Ω',
            },
          };
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          // EVOLUTION v21Ω: Use provider-specific latency for failure stats
          const providerFailureLatency = Date.now() - providerStartTime;

          // ═══ FAILURE PATH + AUTO-HEAL + COGNITIVE KERNEL ═══
          this.updateProviderStats(providerName, false, providerFailureLatency);

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

          // 📊 METRICS: Enregistrer erreur with provider-specific latency
          metricsEngine.recordEvent({
            type: 'error',
            provider: providerName,
            latencyMs: providerFailureLatency, // EVOLUTION v21Ω: Use provider-specific latency
            success: false,
            errorType: lastError.message.substring(0, 50),
            messageLength: sanitized.length,
          });

          // Trigger auto-heal sauf pour titane-local (déjà auto-réparé)
          if (providerName !== 'titane-local') {
            autoHealEngine.heal(providerName, lastError, 'provider', {
              requestId,
              attempt: attempts,
              providerLatency: providerFailureLatency, // EVOLUTION v21Ω: Accurate latency
            });
            this.orchestratorMetrics.autoHealTriggers++;
          }

          if (isDev) {
            console.error(
              `   ❌ FAILED: ${lastError.message} (${providerFailureLatency}ms)`
            );
          }

          // Si c'est titane-local qui échoue, c'est critique
          if (providerName === 'titane-local') {
            isDev && console.error('🚨 CRITICAL: titane-local provider failed!');
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

      if (isDev) {
        console.error('\n🚨 OMEGA ORCHESTRATOR: All providers exhausted!');
        console.error(`Last error: ${lastError?.message || 'Unknown'}`);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      }

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
      // ═══ CRITICAL ERROR HANDLER ═══
      const responseTime = Date.now() - requestStartTime;
      this.orchestratorMetrics.totalFailures++;

      autoHealEngine.heal(
        'orchestrator',
        criticalError instanceof Error ? criticalError : new Error(String(criticalError)),
        'critical',
        {
          requestId,
          responseTime,
        }
      );

      if (isDev) {
        console.error(
          `🆘 OMEGA ORCHESTRATOR: Critical error [${requestId}]:`,
          criticalError
        );
      }

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
        return 'openai';
    }
  }

  private buildHistoryForProvider(
    history: AIMessage[],
    providerName: string,
    promptProfileId?: string,
    promptContext?: PromptContext
  ): AIMessage[] {
    if (!promptProfileId) {
      return history;
    }

    try {
      const promptProvider = this.mapProviderToPromptProvider(providerName);
      const prompt = buildTitanePrompt(promptProfileId, promptProvider, promptContext);

      if (history.length === 0) {
        return [{ role: 'system', content: prompt, timestamp: Date.now() }];
      }

      const cloned = history.map(msg => ({ ...msg }));
      const systemIndex = cloned.findIndex(msg => msg.role === 'system');

      if (systemIndex >= 0) {
        const systemMsg = cloned[systemIndex];
        if (systemMsg) {
          cloned[systemIndex] = {
            ...systemMsg,
            content: prompt,
            timestamp: Date.now(),
          };
        }
      } else {
        cloned.unshift({ role: 'system', content: prompt, timestamp: Date.now() });
      }

      return cloned;
    } catch (error) {
      isDev &&
        console.warn('[OMEGA] Prompt rebuild skipped for provider', providerName, error);
      return history;
    }
  }

  private async executeProviderIsolated(
    provider: AIProvider,
    message: string,
    history: AIMessage[],
    timeout: number,
    requestId: string
  ): Promise<AIResponse> {
    this.currentRequests++;

    try {
      isDev &&
        console.debug('[OMEGA] Provider execution start', requestId, provider.name);
      // Availability check with short timeout
      const availabilityPromise = provider.isAvailable();
      const availabilityTimeout = new Promise<boolean>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Availability check timeout (${requestId})`)),
          3000
        )
      );

      const isAvailable = await Promise.race([availabilityPromise, availabilityTimeout]);

      if (!isAvailable) {
        throw new Error(`Provider ${provider.name} is not available`);
      }

      // Generation with full timeout
      const generationPromise = provider.generate(message, history);
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
    responseTime: number
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

      // Update status based on performance
      if (stats.reliability > 95) {
        stats.status = 'healthy';
      } else if (stats.reliability > 80) {
        stats.status = 'degraded';
      }
    } else {
      stats.failureCount++;
      stats.lastFailure = Date.now();
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
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 3.7: STREAMING OMEGA SÉCURISÉ
   * ═══════════════════════════════════════════════════════════════════
   */

  async *stream(message: string, history: AIMessage[] = []): AsyncGenerator<string> {
    // Keep caches bounded without background polling.
    this.cleanupQuickFailCache();

    const { sanitized, valid, issues } = this.sanitizeMessage(message);

    if (!valid) {
      autoHealEngine.heal(
        'orchestrator',
        `Stream validation failed: ${issues.join(', ')}`,
        'validation'
      );
      yield '⚠️ Message invalide détecté pour streaming...';
      return;
    }

    const selection = this.selectOptimalProvider(sanitized, history);
    const providersToTry = [selection.selectedProvider, 'titane-local']; // Minimal pour streaming

    let hasStreamed = false;

    for (const providerName of providersToTry) {
      const provider = this.providers.find(p => p.name === providerName);
      if (!provider) continue;

      try {
        const isAvailable = await Promise.race([
          provider.isAvailable(),
          new Promise<boolean>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 3000)
          ),
        ]);

        if (!isAvailable) continue;

        if (provider.stream) {
          // Streaming natif avec timeout
          let streamTimeout: NodeJS.Timeout | null = null;
          const streamPromise = provider.stream(sanitized, history);

          try {
            for await (const chunk of streamPromise) {
              // Reset timeout à chaque chunk
              if (streamTimeout) {
                clearTimeout(streamTimeout);
              }
              streamTimeout = setTimeout(() => {
                throw new Error('Stream timeout');
              }, 10000);

              if (chunk && typeof chunk === 'string') {
                yield chunk;
                hasStreamed = true;
              }
            }
            if (streamTimeout) {
              clearTimeout(streamTimeout);
            }
            return; // Streaming successful
          } catch (streamError) {
            if (streamTimeout) {
              clearTimeout(streamTimeout);
            }
            throw streamError;
          }
        } else {
          // Fallback: simulate streaming from generate()
          const response = await this.executeProviderIsolated(
            provider,
            sanitized,
            history,
            15000,
            `stream_${Date.now()}`
          );

          // Simulate typing effet
          for (let i = 0; i < response.content.length; i++) {
            const char = response.content[i];
            if (char) {
              yield char;
              hasStreamed = true;
              await new Promise(resolve => setTimeout(resolve, 15));
            }
          }
          return; // Simulation successful
        }
      } catch (error) {
        isDev && console.warn(`[OMEGA STREAM] ${providerName} failed:`, error);

        // Auto-heal pour streaming failures
        autoHealEngine.heal(
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
  async getProvidersStatus(): Promise<{
    providers: ProviderStats[];
    orchestrator: OrchestratorMetrics;
    autoHeal: AutoHealStatus;
    metrics?: ReturnType<typeof metricsEngine.getAggregatedMetrics>;
    timestamp: number;
  }> {
    try {
      // Update provider availability in parallel
      const availabilityChecks = this.providers.map(async provider => {
        try {
          const isAvailable = await Promise.race([
            provider.isAvailable(),
            new Promise<boolean>((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), 2000)
            ),
          ]);

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

      // Validation runtime Zod (P1 Audit v26.3.1)
      const rawAutoHealStats = autoHealEngine.getStats();
      const validatedAutoHeal = AutoHealStatusSchema.safeParse(rawAutoHealStats);
      
      return {
        providers: Array.from(this.providerStats.values()),
        orchestrator: { ...this.orchestratorMetrics },
        autoHeal: validatedAutoHeal.success 
          ? validatedAutoHeal.data 
          : { error: 'Invalid AutoHeal stats format', raw: rawAutoHealStats },
        metrics: metricsEngine.getAggregatedMetrics(), // 📊 NOUVEAU: Métriques détaillées
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        providers: Array.from(this.providerStats.values()),
        orchestrator: { ...this.orchestratorMetrics },
        autoHeal: { error: 'Auto-heal stats unavailable' },
        metrics: metricsEngine.getAggregatedMetrics(), // 📊 NOUVEAU
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 📊 NOUVEAU v20Ω: Obtenir métriques détaillées
   */
  getDetailedMetrics() {
    // Validation runtime Zod (P1 Audit v26.3.1)
    const rawAutoHealStats = autoHealEngine.getStats();
    const validatedAutoHeal = AutoHealStatusSchema.safeParse(rawAutoHealStats);
    
    return {
      aggregated: metricsEngine.getAggregatedMetrics(),
      health: metricsEngine.getHealthStats(),
      autoHeal: validatedAutoHeal.success 
        ? validatedAutoHeal.data 
        : { error: 'Invalid AutoHeal stats format', raw: rawAutoHealStats },
      orchestrator: { ...this.orchestratorMetrics },
    };
  }

  /**
   * Force reset de tous les providers
   * EVOLUTION v21Ω: Now clears ALL state including quick-fail cache
   */
  async resetAllProviders(): Promise<void> {
    isDev && console.log('[OMEGA ORCHESTRATOR] Force reset all providers...');

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

    autoHealEngine.resetStats();
    await this.startWarmup();
  }

  /**
   * Test de santé complet
   */
  async healthCheck(): Promise<{
    overall: 'healthy' | 'degraded' | 'critical';
    providers: { name: string; status: string; available: boolean }[];
    autoHeal: AutoHealStatus;
    recommendations: string[];
  }> {
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

    // Check auto-heal effectiveness (avec validation Zod P1)
    const autoHealStats = status.autoHeal;
    const validatedAutoHeal = AutoHealStatusSchema.safeParse(autoHealStats);
    
    if (validatedAutoHeal.success) {
      const stats = validatedAutoHeal.data;
      if (stats.successRate && stats.successRate < 80) {
        recommendations.push('Auto-heal effectiveness is low');
      }
    } else {
      recommendations.push('Auto-heal stats validation failed');
    }

    // Check response times
    if (status.orchestrator.avgResponseTime > 10000) {
      recommendations.push('Average response time is high');
    }

    return {
      overall,
      providers: status.providers.map(p => ({
        name: p.name,
        status: p.status,
        available: Date.now() - p.lastUsed < 60000, // Active in last minute
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
  history: AIMessage[] = [],
  config?: AIConfig
): Promise<AIResponse> {
  return aiOrchestrator.generate(message, history, config);
}

export async function* streamTitan(
  message: string,
  history: AIMessage[] = []
): AsyncGenerator<string> {
  yield* aiOrchestrator.stream(message, history);
}

export async function getAIStatus() {
  return aiOrchestrator.getProvidersStatus();
}

export default aiOrchestrator;
