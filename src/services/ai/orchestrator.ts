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

import type { AIMessage, AIResponse, AIConfig } from './types';
import { buildSystemPrompt as buildTitanePrompt } from '@/core/prompts';
import type { Provider as PromptProvider, PromptContext } from '@/core/prompts';
import { titaneLocalProvider } from './providers/titaneLocal'; // ← PREMIER (noyau infaillible)
import { tauriChatProvider } from './providers/tauriChat';
import { geminiProvider } from './providers/gemini';
import { ollamaProvider } from './providers/ollama';
import { autoHealEngine } from './autoHealEngine'; // ← NOUVEAU: Auto-heal intégré

const isDev = process.env.NODE_ENV === 'development';

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
  alternates: string[];
}

// ─────────────────────────────────────────────────────────────────
// ORCHESTRATOR OMEGA CLASS
// ─────────────────────────────────────────────────────────────────

class AIOrchestrator {
  // ═══ NEURAL ORDER OMEGA (Local-first Sécurity) ═══
  private providers = [
    titaneLocalProvider,   // ← NOYAU INFAILLIBLE (toujours en premier)
    tauriChatProvider,     // Backend Rust (cascade interne)
    geminiProvider,        // Cloud API (performant mais dépendant réseau)
    ollamaProvider,        // Local LLM (privé mais plus lent)
  ];

  private providerStats: Map<string, ProviderStats> = new Map();
  private orchestratorMetrics: OrchestratorMetrics = {
    totalRequests: 0,
    totalSuccesses: 0,
    totalFailures: 0,
    avgResponseTime: 0,
    fallbackRate: 0,
    autoHealTriggers: 0,
    lastActivity: 0
  };

  private isWarmup = false;
  private maxConcurrent = 3;
  private currentRequests = 0;
  private lastProviderUsed: string | null = null;
  private consecutiveLocalResponses = 0;
  private readonly diversityThreshold = 2;

  constructor() {
    this.initializeProviderStats();
    this.startWarmup();
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
        status: 'healthy'
      });
    });
  }

  private async startWarmup(): Promise<void> {
    if (this.isWarmup) return;
    this.isWarmup = true;

    try {
      isDev && console.log('[OMEGA ORCHESTRATOR] Starting provider warmup...');

      // Warmup en parallèle (non-bloquant)
      const warmupPromises = this.providers.map(async provider => {
        try {
          const isAvailable = await Promise.race([
            provider.isAvailable(),
            new Promise<boolean>((_, reject) => setTimeout(() => reject(new Error('Warmup timeout')), 2000))
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
      isDev && console.log('[OMEGA ORCHESTRATOR] Warmup complete:',
        warmupResults.map(r => r.status === 'fulfilled' ? r.value : { error: true })
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

  private sanitizeMessage(message: string): { sanitized: string, valid: boolean, issues: string[] } {
    const issues: string[] = [];

    if (!message || typeof message !== 'string') {
      issues.push('Invalid message type');
      return { sanitized: '', valid: false, issues };
    }

    let sanitized = message.trim();

    // Validation longueur
    if (sanitized.length === 0) {
      issues.push('Empty message');
      return { sanitized: '', valid: false, issues };
    }

    if (sanitized.length > 10000) {
      issues.push('Message too long (>10k chars)');
      sanitized = sanitized.substring(0, 10000);
    }

    // Nettoyage sécurisé
    sanitized = sanitized
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/data:.*,/gi, ''); // Remove data URLs

    // Validation caractères dangereux
    const dangerousPatterns = [
      /\x00/g, // Null bytes
      /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, // Control characters
    ];

    dangerousPatterns.forEach(pattern => {
      if (pattern.test(sanitized)) {
        issues.push('Dangerous characters detected');
        sanitized = sanitized.replace(pattern, '');
      }
    });

    return {
      sanitized,
      valid: sanitized.length > 0 && issues.length === 0,
      issues
    };
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
    const requiresRealtime = message.toLowerCase().includes('temps réel') || message.toLowerCase().includes('maintenant');

    // Scoring neuronal des providers
    const providerScores = new Map<string, number>();

    this.providers.forEach(provider => {
      const stats = this.providerStats.get(provider.name);
      if (!stats) return;

      let score = stats.reliability; // Base score (0-100)

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
      if (stats.lastFailure && Date.now() - stats.lastFailure < 30000) { // 30s
        score -= 25;
      }

      // Encourage provider diversity by penalizing recently used engines (except titane-local emergency fallback)
      if (stats.lastUsed && Date.now() - stats.lastUsed < 2000 && provider.name === this.lastProviderUsed) {
        score -= 20;
      }

      // Malus surcharge
      if (provider.name !== 'titane-local' && this.currentRequests >= this.maxConcurrent) {
        score -= 20;
      }

      providerScores.set(provider.name, Math.max(0, score));
    });

    const sortedProviders = Array.from(providerScores.entries()).sort(([, a], [, b]) => b - a);
    const defaultBest = sortedProviders[0];

    let bestProvider = defaultBest?.[0] || 'titane-local';
    let bestScore = defaultBest?.[1] || 0;
    let reason: NeuralSelection['reason'] = bestScore > 80 ? 'optimal' : bestScore > 60 ? 'fallback' : 'availability';

    if (this.shouldForceDiversity() && bestProvider === 'titane-local') {
      const geminiCandidate = sortedProviders.find(([name]) => name === 'gemini');
      const diversityCandidate = geminiCandidate || sortedProviders.find(([name]) => name !== 'titane-local');

      if (diversityCandidate) {
        bestProvider = diversityCandidate[0];
        bestScore = diversityCandidate[1];
        reason = 'recovery';
        this.consecutiveLocalResponses = 0;
      }
    }

    const messageLower = message.toLowerCase();
    if (messageLower.includes('auto-heal') || messageLower.includes('autoheal')) {
      const geminiStats = this.providerStats.get('gemini');
      if (geminiStats) {
        bestProvider = 'gemini';
        bestScore = providerScores.get('gemini') ?? geminiStats.reliability;
        reason = 'recovery';
      }
    }

    // Alternates (top 3 autres)
    const alternates = sortedProviders
      .filter(([name]) => name !== bestProvider)
      .slice(0, 3)
      .map(([name]) => name);

    return {
      selectedProvider: bestProvider,
      reason,
      confidence: Math.min(100, bestScore),
      alternates
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

  async generate(message: string, history: AIMessage[] = [], config?: AIConfig): Promise<AIResponse> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const requestStartTime = Date.now();

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
        console.log(`📝 Message: "${sanitized.substring(0, 60)}${sanitized.length > 60 ? '...' : ''}"`);
        console.log(`📚 History: ${history.length} messages`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      }

      // ═══ PHASE 3.4.2: NEURAL PROVIDER SELECTION ═══
      const selection = this.selectOptimalProvider(sanitized, history);

      if (isDev) {
        console.log(`🧠 Neural Selection: ${selection.selectedProvider} (${selection.reason}, ${selection.confidence}% confidence)`);
        console.log(`🔄 Alternates: ${selection.alternates.join(', ')}`);
      }

      // ═══ PHASE 3.4.3: ISOLATED PROVIDER EXECUTION ═══
      const providersToTry = [
        selection.selectedProvider,
        ...selection.alternates.slice(0, 2), // Max 2 alternates
        'titane-local' // Fallback garanti
      ].filter((name, index, arr) => arr.indexOf(name) === index); // Deduplicate

      let lastError: Error | null = null;
      let attempts = 0;

      for (const providerName of providersToTry) {
        attempts++;
        const provider = this.providers.find(p => p.name === providerName);
        if (!provider) continue;

        const stats = this.providerStats.get(providerName);
        if (!stats) continue;

        try {
          if (isDev) {
            console.log(`\n🔍 [${attempts}/${providersToTry.length}] Trying ${providerName}...`);
          }

          // ═══ ISOLATED EXECUTION WITH TIMEOUT ═══
          const executionTimeout = providerName === 'titane-local' ? 10000 : 30000; // Local plus rapide
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

          // ═══ SUCCESS PATH ═══
          const responseTime = Date.now() - requestStartTime;
          this.updateProviderStats(providerName, true, responseTime);
          this.orchestratorMetrics.totalSuccesses++;

          // Update avg response time
          const totalTime = this.orchestratorMetrics.avgResponseTime * (this.orchestratorMetrics.totalSuccesses - 1) + responseTime;
          this.orchestratorMetrics.avgResponseTime = totalTime / this.orchestratorMetrics.totalSuccesses;

          if (isDev) {
            console.log(`   ✅ SUCCESS in ${responseTime}ms`);
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
              responseTime,
              omegaVersion: "v19.2Ω"
            }
          };

        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          const responseTime = Date.now() - requestStartTime;

          // ═══ FAILURE PATH + AUTO-HEAL ═══
          this.updateProviderStats(providerName, false, responseTime);

          // Trigger auto-heal sauf pour titane-local (déjà auto-réparé)
          if (providerName !== 'titane-local') {
            autoHealEngine.heal(providerName, lastError, 'provider', {
              requestId,
              attempt: attempts,
              responseTime
            });
            this.orchestratorMetrics.autoHealTriggers++;
          }

          if (isDev) {
            console.error(`   ❌ FAILED: ${lastError.message} (${responseTime}ms)`);
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
      this.orchestratorMetrics.fallbackRate = this.orchestratorMetrics.totalFailures / this.orchestratorMetrics.totalRequests;

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
          omegaVersion: "v19.2Ω"
        }
      };

    } catch (criticalError) {
      // ═══ CRITICAL ERROR HANDLER ═══
      const responseTime = Date.now() - requestStartTime;
      this.orchestratorMetrics.totalFailures++;

      autoHealEngine.heal('orchestrator', criticalError instanceof Error ? criticalError : new Error(String(criticalError)), 'critical', {
        requestId,
        responseTime
      });

      if (isDev) {
        console.error(`🆘 OMEGA ORCHESTRATOR: Critical error [${requestId}]:`, criticalError);
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
          omegaVersion: "v19.2Ω"
        }
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
        cloned[systemIndex] = {
          ...cloned[systemIndex],
          content: prompt,
          timestamp: Date.now(),
        };
      } else {
        cloned.unshift({ role: 'system', content: prompt, timestamp: Date.now() });
      }

      return cloned;
    } catch (error) {
      isDev && console.warn('[OMEGA] Prompt rebuild skipped for provider', providerName, error);
      return history;
    }
  }

  private async executeProviderIsolated(
    provider: any,
    message: string,
    history: AIMessage[],
    timeout: number,
    requestId: string
  ): Promise<AIResponse> {
    this.currentRequests++;

    try {
      // Availability check with short timeout
      const availabilityPromise = provider.isAvailable();
      const availabilityTimeout = new Promise<boolean>((_, reject) =>
        setTimeout(() => reject(new Error('Availability check timeout')), 3000)
      );

      const isAvailable = await Promise.race([availabilityPromise, availabilityTimeout]);

      if (!isAvailable) {
        throw new Error(`Provider ${provider.name} is not available`);
      }

      // Generation with full timeout
      const generationPromise = provider.generate(message, history);
      const generationTimeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Provider timeout (${timeout}ms)`)), timeout)
      );

      const response = await Promise.race([generationPromise, generationTimeout]);

      // Response validation
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response format');
      }

      if (!response.content || typeof response.content !== 'string') {
        throw new Error('Invalid response content');
      }

      if (response.content.trim().length === 0) {
        throw new Error('Empty response content');
      }

      return response;

    } catch (error) {
      throw error instanceof Error ? error : new Error(`Provider execution failed: ${String(error)}`);
    } finally {
      this.currentRequests = Math.max(0, this.currentRequests - 1);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 3.6: STATS UPDATE + RELIABILITY TRACKING
   * ═══════════════════════════════════════════════════════════════════
   */

  private updateProviderStats(providerName: string, success: boolean, responseTime: number): void {
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
    const { sanitized, valid, issues } = this.sanitizeMessage(message);

    if (!valid) {
      autoHealEngine.heal('orchestrator', `Stream validation failed: ${issues.join(', ')}`, 'validation');
      yield "⚠️ Message invalide détecté pour streaming...";
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
          new Promise<boolean>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
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
          const response = await this.executeProviderIsolated(provider, sanitized, history, 15000, `stream_${Date.now()}`);

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
        autoHealEngine.heal(providerName, error instanceof Error ? error : new Error(String(error)), 'network');

        continue; // Try next provider
      }
    }

    // Ultimate fallback streaming
    if (!hasStreamed) {
      yield "🟣 Auto-réparation OMEGA streaming en cours...\n\n";
      yield "Streaming fallback activé. ";
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
   */
  async getProvidersStatus(): Promise<{
    providers: ProviderStats[];
    orchestrator: OrchestratorMetrics;
    autoHeal: any;
    timestamp: number;
  }> {
    try {
      // Update provider availability in parallel
      const availabilityChecks = this.providers.map(async provider => {
        try {
          const isAvailable = await Promise.race([
            provider.isAvailable(),
            new Promise<boolean>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
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

      return {
        providers: Array.from(this.providerStats.values()),
        orchestrator: { ...this.orchestratorMetrics },
        autoHeal: autoHealEngine.getStats(),
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        providers: Array.from(this.providerStats.values()),
        orchestrator: { ...this.orchestratorMetrics },
        autoHeal: { error: 'Auto-heal stats unavailable' },
        timestamp: Date.now()
      };
    }
  }

  /**
   * Force reset de tous les providers
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
      lastActivity: 0
    };

    autoHealEngine.resetStats();
    await this.startWarmup();
  }

  /**
   * Test de santé complet
   */
  async healthCheck(): Promise<{
    overall: 'healthy' | 'degraded' | 'critical';
    providers: { name: string; status: string; available: boolean }[];
    autoHeal: any;
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

    // Check auto-heal effectiveness
    const autoHealStats = status.autoHeal;
    if (autoHealStats.successRate < 80) {
      recommendations.push('Auto-heal effectiveness is low');
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
        available: Date.now() - p.lastUsed < 60000 // Active in last minute
      })),
      autoHeal: autoHealStats,
      recommendations
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// EXPORT SINGLETON + API COMPATIBILITY
// ─────────────────────────────────────────────────────────────────

export const aiOrchestrator = new AIOrchestrator();

// API de rétrocompatibilité
export async function askTitan(message: string, history: AIMessage[] = [], config?: AIConfig): Promise<AIResponse> {
  return aiOrchestrator.generate(message, history, config);
}

export async function* streamTitan(message: string, history: AIMessage[] = []): AsyncGenerator<string> {
  yield* aiOrchestrator.stream(message, history);
}

export async function getAIStatus() {
  return aiOrchestrator.getProvidersStatus();
}

export default aiOrchestrator;
