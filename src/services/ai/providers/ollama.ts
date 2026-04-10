/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v30.0.0 — OLLAMA PROVIDER (REAL IMPLEMENTATION)
 *   Provider Ollama avec vraie connexion API
 *   ✨ LTM Integration: Memory Context Injection
 *   ✨ Streaming support avec timeout adaptatif
 * ═══════════════════════════════════════════════════════════════════
 */

import type { AIProvider, AIMessage, AIResponse, AIConfig } from '../types';
import { DEFAULT_AI_CONFIG } from '../types';
import type { EffortLevel } from '../omegaModeClassifier';
import { createLogger } from '@/utils/logger';
import { memoryIntegration } from '../memoryIntegration';
import type { MemoryContext } from '../memoryIntegration';
import { PROVIDER_TIMEOUTS, AVAILABILITY_CACHE } from '@/config/aiTimeouts.config';
import {
  ollamaCheckHealth,
  ollamaGenerate,
  getTransportMode,
} from '../transports/ollamaTransport';

const logger = createLogger('Ollama');
const runtimeEnv = (
  import.meta as ImportMeta & {
    env?: { VITE_OLLAMA_MODEL?: string };
  }
).env;
// OLLAMA CHAMPION mode: llama3.2:latest is the default (lightweight, fast).
// For DEEP_REASONING / ARCHITECT / CERTIFY modes, the canonical kernel routes to llama3.1:latest
// (configured via config/championChallenger.json).
// Override via VITE_OLLAMA_MODEL env var for custom model selection.
const DEFAULT_OLLAMA_MODEL = runtimeEnv?.VITE_OLLAMA_MODEL?.trim() || 'llama3.2:latest';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION — OLLAMA CHAMPION
// ═══════════════════════════════════════════════════════════════

const OLLAMA_CONFIG = {
  model: DEFAULT_OLLAMA_MODEL,
  endpoint: `transport:${getTransportMode().toLowerCase()}`,
  timeout: PROVIDER_TIMEOUTS.ollama || 45000,
  healthCheckInterval: AVAILABILITY_CACHE.ttlMs || 300000,
  maxRetries: 3,
  maxErrors: 5,
  temperature: 0.7,
  // OLLAMA CHAMPION: numCtx=undefined → Rust model_context_window() picks the correct value
  // per-model: llama3.2/3.3/mistral/qwen/deepseek → 32 768; llama3.1/phi4 → 16 384; others → 8 192
  numCtx: undefined as number | undefined,
};

// ═══════════════════════════════════════════════════════════════
// HEALTH TRACKING
// ═══════════════════════════════════════════════════════════════

let endpointHealthy: boolean | null = null;
let lastHealthCheck = 0;
let errorCount = 0;
let lastError: string | null = null;

export async function initializeOllama(): Promise<boolean> {
  logger.info(`Initializing Ollama provider at ${OLLAMA_CONFIG.endpoint}`, {
    model: OLLAMA_CONFIG.model,
  });

  const available = await checkOllamaHealth();
  endpointHealthy = available;
  lastHealthCheck = Date.now();

  if (available) {
    errorCount = 0;
    lastError = null;
    logger.info(`✅ Ollama initialization succeeded (${OLLAMA_CONFIG.model})`);
  } else {
    errorCount = Math.max(errorCount, 1);
    logger.warn(
      `❌ Ollama initialization failed at ${OLLAMA_CONFIG.endpoint}${lastError ? `: ${lastError}` : ''}`
    );
  }

  return available;
}

// ═══════════════════════════════════════════════════════════════
// SYSTEM PROMPT
// ═══════════════════════════════════════════════════════════════

/**
 * Base system identity — always injected when no upstream system history is present.
 */
const SYSTEM_PROMPT_BASE = `Tu es TITANE∞, une IA cognitive avancée développée par Humain Total.
Tu réponds TOUJOURS en français de manière professionnelle, précise et utile.
Tu es un assistant technique expert en architecture logicielle, React, Rust, TypeScript.
Tu peux aider avec le système TITANE∞, son architecture, ses modules, et le développement.
Si tu ne sais pas quelque chose, dis-le honnêtement.
Fournis des réponses complètes, structurées et riches en détails.`;

/**
 * Chain-of-thought addendum injected when Ollama is the sole reasoning engine
 * (no upstream system history injected by chatEngine).
 * Activates systematic deliberation to maximise response quality.
 */
const CHAIN_OF_THOUGHT_ADDENDUM = `

PROTOCOLE DE RAISONNEMENT COGNITIF:
1. ANALYSE — Décompose la demande en composants essentiels avant de répondre.
2. HYPOTHÈSE — Formule l'hypothèse de travail la plus précise possible.
3. RAISONNEMENT — Déduis les étapes intermédiaires de façon logique et explicite.
4. VÉRIFICATION — Contrôle la cohérence interne avant de finaliser.
5. SYNTHÈSE — Produis une réponse structurée, complète et actionnable.

Ne saute aucune étape. Préfère la précision à la concision.`;

/**
 * Returns the Ollama fallback system prompt with optional chain-of-thought enrichment.
 * Used ONLY when chatEngine has not injected a system message via history.
 */
function buildOllamaSystemPrompt(enableChainOfThought: boolean = true): string {
  return enableChainOfThought
    ? SYSTEM_PROMPT_BASE + CHAIN_OF_THOUGHT_ADDENDUM
    : SYSTEM_PROMPT_BASE;
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Build messages array for Ollama API
 */
function buildOllamaMessages(
  message: string,
  history: AIMessage[],
  memoryContext: MemoryContext | null
): Array<{ role: string; content: string }> {
  const messages: Array<{ role: string; content: string }> = [];
  const recentHistory = history.slice(-10);
  const injectedSystemMessages = recentHistory
    .filter(msg => msg.role === 'system' && msg.content.trim().length > 0)
    .map(msg => msg.content.trim());

  // System prompt with memory context
  let systemContent =
    injectedSystemMessages.length > 0
      ? injectedSystemMessages.join('\n\n')
      : buildOllamaSystemPrompt(true);

  if (injectedSystemMessages.length === 0 && memoryContext) {
    const memoryParts: string[] = [];

    if (memoryContext.activeProjects?.length > 0) {
      const projectNames = memoryContext.activeProjects
        .map(p => p.title)
        .filter(Boolean)
        .join(', ');
      if (projectNames) {
        memoryParts.push(`Projets actifs: ${projectNames}`);
      }
    }

    if (memoryContext.recentDecisions?.length > 0) {
      const decisions = memoryContext.recentDecisions
        .slice(0, 3)
        .map(d => d.title)
        .filter(Boolean)
        .join('; ');
      if (decisions) {
        memoryParts.push(`Décisions récentes: ${decisions}`);
      }
    }

    if (memoryContext.relevantKnowledge?.length > 0) {
      memoryParts.push(
        `Base de connaissances: ${memoryContext.relevantKnowledge.length} entrées`
      );
    }

    if (memoryParts.length > 0) {
      systemContent += `\n\n📋 Contexte Mémoire LTM:\n${memoryParts.map(p => `• ${p}`).join('\n')}`;
    }
  }

  messages.push({ role: 'system', content: systemContent });

  // Add conversation history (last 10 messages)
  for (const msg of recentHistory) {
    if (msg.role === 'system') {
      continue;
    }
    messages.push({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    });
  }

  // Add current message
  messages.push({ role: 'user', content: message });

  return messages;
}

/**
 * Check Ollama endpoint health via /api/tags
 */
async function checkOllamaHealth(): Promise<boolean> {
  try {
    const health = await ollamaCheckHealth();
    if (health.ok) {
      const models = health.content.models || [];
      const configuredModelFamily =
        OLLAMA_CONFIG.model.split(':')[0] ?? OLLAMA_CONFIG.model;
      const hasModel = models.some(
        (m: { name: string }) =>
          m.name === OLLAMA_CONFIG.model || m.name.startsWith(configuredModelFamily)
      );

      if (!hasModel && models.length > 0) {
        logger.info(
          `Model ${OLLAMA_CONFIG.model} not found, available: ${models.map((m: { name: string }) => m.name).join(', ')}`
        );
      }

      return true;
    }

    lastError = health.error.message;
    return false;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    lastError = errorMsg;
    logger.debug(`Ollama health check failed: ${errorMsg}`);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// PROVIDER IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════

export const ollamaProvider: AIProvider = {
  name: 'ollama',
  description: 'Ollama Local LLM Provider',

  async isAvailable(): Promise<boolean> {
    const now = Date.now();

    // Return cached health status if recent
    if (
      endpointHealthy !== null &&
      now - lastHealthCheck < OLLAMA_CONFIG.healthCheckInterval
    ) {
      return endpointHealthy;
    }

    // If too many errors, consider unavailable with extended cooldown
    if (errorCount >= OLLAMA_CONFIG.maxErrors) {
      if (now - lastHealthCheck > OLLAMA_CONFIG.healthCheckInterval * 2) {
        errorCount = 0;
        endpointHealthy = null;
      } else {
        return false;
      }
    }

    logger.debug('🔍 Checking Ollama endpoint health...');

    endpointHealthy = await checkOllamaHealth();
    lastHealthCheck = now;

    if (endpointHealthy) {
      errorCount = 0;
      lastError = null;
      logger.info('✅ Ollama endpoint healthy');
    } else {
      errorCount++;
      logger.warn(
        `❌ Ollama endpoint unavailable (errors: ${errorCount}/${OLLAMA_CONFIG.maxErrors})`
      );
    }

    return endpointHealthy;
  },

  async generate(
    message: string,
    history: AIMessage[] = [],
    config?: unknown
  ): Promise<AIResponse> {
    const startTime = Date.now();
    const finalConfig = {
      ...DEFAULT_AI_CONFIG,
      ...(config as Partial<AIConfig> | undefined),
    };

    // Pre-check endpoint health
    const isHealthy = await this.isAvailable();
    if (!isHealthy) {
      throw new Error(
        `Ollama endpoint not available at ${OLLAMA_CONFIG.endpoint}${lastError ? `: ${lastError}` : ''}`
      );
    }

    const hasInjectedSystemHistory = history.some(
      entry => entry.role === 'system' && entry.content.trim().length > 0
    );

    // ✨ LTM Integration: Load memory context only when upstream did not already inject it.
    let memoryContext: MemoryContext | null = null;
    if (!hasInjectedSystemHistory) {
      try {
        memoryContext = await memoryIntegration.loadContext({
          includeProjects: true,
          includeDecisions: true,
          includeKnowledge: true,
          includeRituals: false,
        });
      } catch (error) {
        logger.warn('Failed to load memory context (non-blocking)', error);
      }
    }

    // Build messages with memory context
    const messages = buildOllamaMessages(message, history, memoryContext);

    // Scale timeout based on reasoning effort so DEEP_REASONING/ARCHITECT/CERTIFY chains never cut off
    const reasoningEffort = (finalConfig as { reasoningEffort?: EffortLevel }).reasoningEffort;
    const effortTimeoutSecs =
      reasoningEffort === 'max'
        ? Math.max(120, Math.ceil(OLLAMA_CONFIG.timeout / 1000))
        : reasoningEffort === 'high'
          ? Math.max(90, Math.ceil(OLLAMA_CONFIG.timeout / 1000))
          : Math.ceil(OLLAMA_CONFIG.timeout / 1000);

    // Retry loop
    for (let attempt = 1; attempt <= OLLAMA_CONFIG.maxRetries; attempt++) {
      try {
        const system = messages
          .filter(entry => entry.role === 'system')
          .map(entry => entry.content)
          .join('\n\n')
          .trim();
        const prompt = messages
          .filter(entry => entry.role !== 'system')
          .map(entry => `${entry.role}: ${entry.content}`)
          .join('\n\n')
          .trim();

        const result = await ollamaGenerate({
          model: OLLAMA_CONFIG.model,
          prompt,
          system,
          temperature: finalConfig.temperature ?? OLLAMA_CONFIG.temperature,
          max_tokens:
            typeof finalConfig.maxTokens === 'number' ? finalConfig.maxTokens : undefined,
          timeout_secs: effortTimeoutSecs,
          // num_ctx=undefined → Rust model_context_window() picks the correct value per model
          num_ctx: OLLAMA_CONFIG.numCtx,
        });

        if (!result.ok) {
          throw new Error(result.error.message);
        }

        const data = result.content;
        if (!data.content) {
          throw new Error('Empty response from Ollama transport');
        }

        const content = data.content;
        const latency = Date.now() - startTime;
        const actualModel = data.model || OLLAMA_CONFIG.model;
        const fallbackUsed = actualModel !== OLLAMA_CONFIG.model;

        // Log model mismatch (fallback detection)
        if (fallbackUsed) {
          logger.info(
            `Model fallback detected: requested=${OLLAMA_CONFIG.model}, used=${actualModel}`
          );
        } else {
          logger.debug(`Model verified: ${actualModel}`);
        }

        // Reset error count on success
        errorCount = 0;
        endpointHealthy = true;

        return {
          content,
          provider: 'ollama',
          timestamp: Date.now(),
          model: actualModel,
          tokens: undefined,
          metadata: {
            latencyMs: data.latency_ms ?? latency,
            promptTokens: undefined,
            evalTokens: undefined,
            evalDurationMs: undefined,
            totalDurationMs: data.latency_ms ?? latency,
            memoryContextInjected: hasInjectedSystemHistory || !!memoryContext,
            memoryContextSource: hasInjectedSystemHistory
              ? 'system-history'
              : memoryContext
                ? 'provider-load'
                : 'none',
            memoryContextSize: memoryContext
              ? (memoryContext.activeProjects?.length || 0) +
                (memoryContext.recentDecisions?.length || 0) +
                (memoryContext.relevantKnowledge?.length || 0)
              : 0,
            attempt,
            modelUsed: actualModel,
            modelRequested: OLLAMA_CONFIG.model,
            fallbackUsed,
            // Real Ollama runtime metrics (nanoseconds from Ollama API)
            ollamaTotalDuration: data.total_duration ?? null,
            ollamaLoadDuration: data.load_duration ?? null,
            ollamaPromptEvalCount: data.prompt_eval_count ?? null,
            ollamaPromptEvalDuration: data.prompt_eval_duration ?? null,
            ollamaEvalCount: data.eval_count ?? null,
            ollamaEvalDuration: data.eval_duration ?? null,
            ollamaDoneReason: data.done_reason ?? null,
          },
        };
      } catch (error) {
        const latency = Date.now() - startTime;
        const errorMsg = error instanceof Error ? error.message : String(error);

        logger.warn(
          `Attempt ${attempt}/${OLLAMA_CONFIG.maxRetries} failed (${latency}ms): ${errorMsg}`
        );

        // Increment error count
        errorCount++;
        lastError = errorMsg;

        if (attempt < OLLAMA_CONFIG.maxRetries) {
          const delay = Math.min(1000 * attempt, 3000);
          logger.debug(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    endpointHealthy = false;
    throw new Error(
      `Ollama failed after ${OLLAMA_CONFIG.maxRetries} attempts: ${lastError || 'Unknown error'}`
    );
  },

  async *stream(message: string, history: AIMessage[] = []): AsyncGenerator<string> {
    const isHealthy = await this.isAvailable();
    if (!isHealthy) {
      yield '⚠️ Ollama non disponible. Utilisez le provider local TITANE∞.';
      return;
    }

    try {
      const hasInjectedSystemHistory = history.some(
        entry => entry.role === 'system' && entry.content.trim().length > 0
      );
      const memoryContext = hasInjectedSystemHistory
        ? null
        : await memoryIntegration
            .loadContext({
              includeProjects: true,
              includeDecisions: true,
              includeKnowledge: true,
              includeRituals: false,
            })
            .catch(() => null);

      const messages = buildOllamaMessages(message, history, memoryContext);
      const system = messages
        .filter(entry => entry.role === 'system')
        .map(entry => entry.content)
        .join('\n\n')
        .trim();
      const prompt = messages
        .filter(entry => entry.role !== 'system')
        .map(entry => `${entry.role}: ${entry.content}`)
        .join('\n\n')
        .trim();

      const response = await ollamaGenerate({
        model: OLLAMA_CONFIG.model,
        prompt,
        system,
        temperature: OLLAMA_CONFIG.temperature,
        timeout_secs: Math.ceil(OLLAMA_CONFIG.timeout / 1000),
      });

      if (!response.ok) {
        throw new Error(response.error.message);
      }

      yield response.content.content;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Ollama stream error', { error: errorMsg });
      yield `⚠️ Erreur Ollama: ${errorMsg}`;
    }
  },

  resetErrors(): void {
    errorCount = 0;
    endpointHealthy = null;
    lastHealthCheck = 0;
    lastError = null;
    logger.debug('🔄 Ollama errors and health state reset');
  },

  getStats(): {
    errorCount: number;
    maxErrors: number;
    endpointHealthy: boolean | null;
    lastHealthCheck: number;
    lastError: string | null;
    config: typeof OLLAMA_CONFIG;
  } {
    return {
      errorCount,
      maxErrors: OLLAMA_CONFIG.maxErrors,
      endpointHealthy,
      lastHealthCheck,
      lastError,
      config: OLLAMA_CONFIG,
    };
  },

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const isHealthy = await checkOllamaHealth();
      if (isHealthy) {
        return {
          success: true,
          message: `Ollama healthy at ${OLLAMA_CONFIG.endpoint} (model: ${OLLAMA_CONFIG.model})`,
        };
      } else {
        return {
          success: false,
          message: `Ollama not available at ${OLLAMA_CONFIG.endpoint}${lastError ? `: ${lastError}` : ''}`,
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: `Ollama test failed: ${message}` };
    }
  },
};

export default ollamaProvider;
