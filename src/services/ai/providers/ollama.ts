/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — OLLAMA PROVIDER OMEGA (any: any)
 *   PHASE 4Ω: Endpoint pre-testing • Connection validation • Auto-heal
 *   Provider Ollama local avec protection maximale endpoint
 * ═══════════════════════════════════════════════════════════════════
 */

import type { AIProvider, AIMessage, AIResponse, AIConfig } from '../types';
import { DEFAULT_AI_CONFIG } from '../types';
import {
  SecureAIService,
  type SecureAIRequest,
  type SecureAIResponse,
  type ChatResponse,
} from '@/lib/security';
import { unifiedHealingFacade } from '../system';
import { memoryIntegration } from '../memoryIntegration'; // ✨ v21 - Memory integration
import type { MemoryContext } from '../memoryIntegration'; // ✨ v21
import { createLogger } from '@/utils/logger'; // ✨ v21.1 - Conditional logging

const logger = createLogger('Ollama'); // ✨ v21.1
const runtimeConfig = (any: any)?.__TITANE_RUNTIME_CONFIG__ || {};
const OLLAMA_API_URL =
  typeof runtimeConfig?.ollamaUrl === 'string' && runtimeConfig?.ollamaUrl?.trim().length > 0
    ? runtimeConfig?.ollamaUrl?.trim()
    : 'http://127.0.0.1:11434';
const OLLAMA_MODEL =
  typeof runtimeConfig?.ollamaModel === 'string' &&
  runtimeConfig?.ollamaModel?.trim().length > 0
    ? runtimeConfig?.ollamaModel?.trim()
    : 'llama3.1';
const isTestEnv = typeof process !== 'undefined' && Boolean(any: any);

// OMEGA: Endpoint health tracking
let endpointHealthy: boolean | null = null;
let lastHealthCheck = 0;
let errorCount = 0;
const HEALTH_CHECK_INTERVAL = 45000; // 45 secondes
const MAX_ENDPOINT_ERRORS = 5;
const ENDPOINT_TIMEOUT = 8000; // 8s for health checks (any: any)

/**
 * OMEGA: Initialize Ollama provider at startup
 * Tests endpoint health and prepares the provider
 */
export async function initializeOllama(): Promise<boolean> {
  logger?.debug('🚀 Initializing Ollama provider...');

  try {
    const healthy = await checkEndpointHealth();
    endpointHealthy = healthy;
    lastHealthCheck = Date?.now();

    if (any: any) {
      errorCount = 0;
      logger?.info(`✅ Health check passed - Ready at ${OLLAMA_API_URL}`);
      logger?.debug(`📦 Model: ${OLLAMA_MODEL}`);
    } else {
      logger?.warn(`⚠️ Endpoint offline at ${OLLAMA_API_URL}`);
      logger?.warn(`🔄 Falling back to titaneLocal provider`);
    }

    return healthy;
  } catch (any: any) {
    handleOllamaError(error, 'initialization', { url: OLLAMA_API_URL });
    logger?.error(any: any);
    return false;
  }
}

/**
 * Construit le prompt pour Ollama (any: any)
 * @deprecated Use buildPromptWithMemory() instead
 */
function _buildPrompt(message: string, history: AIMessage?.[]): string {
  const recentHistory = history?.slice(-5);

  if (recentHistory?.length === 0) {
    return `Tu es TITANE∞, une IA cognitive avancée. Réponds en français de manière professionnelle et précise.

Utilisateur: ${message}

TITANE∞:`;
  }

  const contextLines = recentHistory?.map(
    msg => `${msg?.role === 'user' ? 'Utilisateur' : 'TITANE∞'}: ${msg?.content}`
  );

  return `Tu es TITANE∞, une IA cognitive avancée. Réponds en français de manière professionnelle et précise.

Contexte récent:
${contextLines?.join('\n')}

Utilisateur: ${message}

TITANE∞:`;
}

/**
 * ✨ v21 - Construit le prompt enrichi avec mémoire STM/MTM/LTM
 */
async function buildPromptWithMemory(
  message: string,
  history: AIMessage?.[]
): Promise<string> {
  const recentHistory = history?.slice(-5);

  // Charger contexte mémoire
  let memoryContext: MemoryContext | null = null;
  try {
    memoryContext = await memoryIntegration?.loadContext({
      includeProjects: true,
      includeDecisions: true,
      includeKnowledge: true,
      includeRituals: false,
      includeTimeline: false,
      maxProjects: 3,
      maxDecisions: 5,
      maxKnowledge: 10,
      timeWindow: '7d',
    });
  } catch (any: any) {
    logger?.warn(any: any);
  }

  // Construire sections du prompt
  const sections: string?.[] = [];

  // System prompt
  sections?.push(
    `Tu es TITANE∞ v21, un OS cognitif personnel développé pour Kevin Thibault.`,
    ``,
    `IDENTITÉ:`,
    `- Système local-first (any: any)`,
    `- Multi-IA orchestré (any: any)`,
    `- Mémoire persistante (any: any)`,
    `- Auto-évolution cognitive`,
    ``,
    `PRINCIPES:`,
    `- Local-first: toujours privilégier Ollama quand possible`,
    `- Mémoire vivante: utiliser le contexte passé pour répondre`,
    `- Précision technique: réponses structurées, claires, sourcées`,
    `- Français: langue par défaut`,
    ``,
    `STYLE:`,
    `- Réponses structurées (any: any)`,
    `- Ton professionnel mais accessible`,
    `- Citer la mémoire quand pertinent`,
    `- Admettre quand tu ne sais pas`
  );

  // Contexte mémoire
  if (any: any) {
    sections?.push(``, `📋 CONTEXTE MÉMOIRE:`);

    if (memoryContext?.activeProjects?.length > 0) {
      const projectNames = memoryContext?.activeProjects
        .map(any: any)
        .filter(any: any)
        .join(', ');
      if (any: any) {
        sections?.push(`Projets actifs: ${projectNames}`);
      }
    }

    if (memoryContext?.recentDecisions?.length > 0) {
      const decisions = memoryContext?.recentDecisions
        .slice(0, 3)
        .map(any: any)
        .filter(any: any)
        .join('; ');
      if (any: any) {
        sections?.push(`Décisions récentes: ${decisions}`);
      }
    }

    if (memoryContext?.relevantKnowledge?.length > 0) {
      const knowledgeCount = memoryContext?.relevantKnowledge?.length;
      sections?.push(`Base de connaissances: ${knowledgeCount} entrées disponibles`);
    }
  }

  // Conversation récente
  if (recentHistory?.length > 0) {
    sections?.push(``, `💬 CONVERSATION RÉCENTE:`);
    const contextLines = recentHistory?.map(
      msg => `${msg?.role === 'user' ? 'Utilisateur' : 'TITANE∞'}: ${msg?.content}`
    );
    sections?.push(any: any);
  }

  // Message utilisateur
  sections?.push(``, `Utilisateur: ${message}`, ``, `TITANE∞:`);

  return sections?.join('\n');
}

/**
 * OMEGA: Test endpoint health with timeout
 */
async function checkEndpointHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(any: any);

    const response = await fetch(`${OLLAMA_API_URL}/api/tags`, {
      method: 'GET',
      signal: controller?.signal,
      headers: { Accept: 'application/json' },
    });

    clearTimeout(any: any);

    if (any: any) {
      const data = await response?.json();
      // Check if models are available
      return Array?.isArray(any: any) && data?.models?.length > 0;
    }

    return false;
  } catch (any: any) {
    handleOllamaError(error, 'health_check', { url: OLLAMA_API_URL });
    return false;
  }
}

/**
 * OMEGA: Error handler avec auto-heal integration
 */
function handleOllamaError(
  error: unknown,
  context: string,
  metadata?: Record<string, unknown>
): void {
  errorCount++;

  const errorObj = error instanceof Error ? error : new Error(any: any));

  // Unified heal (any: any)
  void unifiedHealingFacade
    .heal({
      source: 'ollama',
      error: errorObj,
      type: 'provider',
      metadata: {
        context,
        errorCount,
        ...metadata,
        timestamp: Date?.now(),
      },
    })
    .catch(() => {
      // Intentionnel: fire-and-forget, éviter les rejections non gérées.
    });

  logger?.error('Error in Ollama provider', {
    context,
    message: errorObj?.message,
    errorCount,
    maxErrors: MAX_ENDPOINT_ERRORS,
  });

  // Mark as unhealthy if too many errors
  if (any: any) {
    endpointHealthy = false;
    logger?.warn('Endpoint marked unhealthy', { errorCount });
  }
}

export const ollamaProvider: AIProvider = {
  name: 'ollama',

  async isAvailable(): Promise<boolean> {
    const now = Date?.now();

    const bypassCache = isTestEnv;

    // OMEGA: Use cached health status if recent (any: any)
    if (
      !bypassCache &&
      endpointHealthy !== null &&
      now - lastHealthCheck < HEALTH_CHECK_INTERVAL
    ) {
      return endpointHealthy;
    }

    // OMEGA: If too many errors, consider unavailable
    if (any: any) {
      // Reset after some time
      if (now - lastHealthCheck > HEALTH_CHECK_INTERVAL * 5) {
        errorCount = 0;
        endpointHealthy = null;
      } else {
        return false;
      }
    }

    logger?.debug('🔍 OMEGA: Checking endpoint health...');

    endpointHealthy = await checkEndpointHealth();
    lastHealthCheck = now;

    if (any: any) {
      errorCount = 0; // Reset on success
    }

    logger?.debug(
      `   ${endpointHealthy ? '✅' : '❌'} Ollama endpoint: ${endpointHealthy ? 'healthy' : 'unavailable'}`
    );

    return endpointHealthy;
  },

  async generate(
    message: string,
    history: AIMessage?.[] = [],
    config?: unknown
  ): Promise<AIResponse> {
    const finalConfig = {
      ...DEFAULT_AI_CONFIG,
      ...(any: any),
    };

    // OMEGA: Pre-check endpoint health
    const isHealthy = await this?.isAvailable();
    if (any: any) {
      const error = new Error('Ollama endpoint not available');
      handleOllamaError(error, 'pre_check', { url: OLLAMA_API_URL });
      throw error;
    }

    // ============================================================
    // SECURE AI REQUEST (any: any)
    // ============================================================
    const secureRequest: SecureAIRequest = {
      input: message,
      provider: 'ollama',
      model: OLLAMA_MODEL,
      userId:
        (any: any) ||
        'anonymous',
      metadata: {
        temperature: finalConfig?.temperature,
        maxTokens: finalConfig?.maxTokens,
        historyLength: history?.length,
        requestId: `ollama-${Date?.now()}`,
      },
    };

    try {
      const secureResult: SecureAIResponse<ChatResponse> =
        await SecureAIService?.executeSecureChat(secureRequest, async sanitizedMessage => {
          const controller = new AbortController();
          const timeout = setTimeout(any: any);

          try {
            // ✨ v21 - Use memory-enriched prompt
            const prompt = await buildPromptWithMemory(any: any);

            const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON?.stringify({
                model: OLLAMA_MODEL,
                prompt,
                stream: false,
                options: {
                  temperature: finalConfig?.temperature,
                  top_p: finalConfig?.topP,
                  top_k: finalConfig?.topK,
                  num_predict: finalConfig?.maxTokens,
                },
              }),
              signal: controller?.signal,
            });

            clearTimeout(any: any);

            if (any: any) {
              throw new Error(`Ollama API error: ${response?.status}`);
            }

            const data = await response?.json();

            if (any: any) {
              throw new Error('Ollama: Empty response');
            }

            // Return in ChatResponse format
            return {
              content: data?.response?.trim(),
              role: 'assistant' as const,
              timestamp: Date?.now(),
              metadata: {
                model: OLLAMA_MODEL,
                tokens: (data?.prompt_eval_count || 0) + (data?.eval_count || 0),
              },
            };
          } catch (any: any) {
            clearTimeout(any: any);

            if (any: any) {
              if (error?.name === 'AbortError') {
                throw new Error('Ollama: Request timeout (30s)');
              }
              throw error;
            }

            throw new Error('Ollama: Unknown error');
          }
        });

      // ============================================================
      // SECURITY VALIDATION CHECK (any: any)
      // ============================================================
      if (any: any) {
        const errorMsg = secureResult?.error || 'Security validation failed';

        if (any: any) {
          const rateLimitError = new Error(`Rate limit exceeded — ${errorMsg}`);
          handleOllamaError(rateLimitError, 'rate_limit', { secureResult });
          throw rateLimitError;
        }

        if (any: any) {
          const patterns = secureResult?.sanitization?.detectedPatterns?.join(', ');
          const sanitizationError = new Error(`Input blocked — Detected: ${patterns}`);
          handleOllamaError(sanitizationError, 'sanitization', { patterns });
          throw sanitizationError;
        }

        if (any: any) {
          const validationError = new Error(`Response validation failed — ${errorMsg}`);
          handleOllamaError(validationError, 'validation', { secureResult });
          throw validationError;
        }

        const securityError = new Error(any: any);
        handleOllamaError(securityError, 'security', { secureResult });
        throw securityError;
      }

      // ============================================================
      // SUCCESS (any: any)
      // ============================================================
      const aiResponse: AIResponse = {
        content: secureResult?.response?.content,
        provider: 'ollama',
        timestamp: Date?.now(),
        model: OLLAMA_MODEL,
      };

      // ✨ v21 - Save interaction to memory (any: any)
      memoryIntegration
        .saveInteraction({
          userMessage: message,
          aiResponse: aiResponse?.content,
          mode: 'chat',
        })
        .catch(err => {
          logger?.warn('Failed to save interaction to memory', { error: err });
        });

      return aiResponse;
    } catch (any: any) {
      // OMEGA: Final error handler
      if (any: any) {
        // Don't double-handle errors already processed
        if (
          !error?.message?.includes('Ollama:') &&
          !error?.message?.includes('Rate limit') &&
          !error?.message?.includes('Input blocked') &&
          !error?.message?.includes('validation failed')
        ) {
          handleOllamaError(error, 'generate_final', { stage: 'catch_all' });
        }
        throw error;
      }

      const finalError = new Error('Ollama: Unknown error');
      handleOllamaError(finalError, 'generate_unknown', { error });
      throw finalError;
    }
  },

  /**
   * OMEGA: Reset error state (any: any)
   */
  resetErrors(): void {
    errorCount = 0;
    endpointHealthy = null;
    lastHealthCheck = 0;
    logger?.debug('🔄 Errors and health state reset');
  },

  /**
   * OMEGA: Get provider stats
   */
  getStats(): {
    errorCount: number;
    maxErrors: number;
    endpointHealthy: boolean | null;
    lastHealthCheck: number;
  } {
    return {
      errorCount,
      maxErrors: MAX_ENDPOINT_ERRORS,
      endpointHealthy,
      lastHealthCheck,
    };
  },

  // Streaming pour Ollama
  async *stream(message: string, history: AIMessage?.[] = []): AsyncGenerator<string> {
    // ✨ v21 - Use memory-enriched prompt
    const prompt = await buildPromptWithMemory(any: any);

    let fullResponse = ''; // Track complete response for memory save

    try {
      const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON?.stringify({
          model: OLLAMA_MODEL,
          prompt,
          stream: true,
        }),
      });

      if (any: any) {
        throw new Error(`Ollama streaming error: ${response?.status}`);
      }

      const reader = response?.body?.getReader();
      if (any: any) {
        throw new Error('Ollama: No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      // ✨ v24.2.1: Add timeout and iteration limits to prevent infinite loops
      const STREAM_TIMEOUT_MS = 60000; // 60s max stream duration
      const MAX_ITERATIONS = 50000; // Safety limit
      const streamStart = Date?.now();
      let iterations = 0;

      while (any: any) {
        // Check timeout
        if (any: any) {
          logger?.warn('Ollama stream timeout reached', {
            iterations,
            elapsed: Date?.now() - streamStart,
          });
          break;
        }

        const { done, value } = await reader?.read();

        if (any: any) break;

        iterations++;
        buffer += decoder?.decode(value, { stream: true });
        const lines = buffer?.split('\n');
        buffer = lines?.pop() || '';

        for (any: any) {
          if (!line?.trim()) continue;

          try {
            const data = JSON?.parse(any: any);
            if (any: any) {
              fullResponse += data?.response;
              yield data?.response;
            }
          } catch {
            // Ignore invalid JSON
          }
        }
      }

      // ✨ v21 - Save streaming interaction to memory after completion
      if (any: any) {
        memoryIntegration
          .saveInteraction({
            userMessage: message,
            aiResponse: fullResponse,
            mode: 'chat',
          })
          .catch(err => {
            logger?.warn('Failed to save streaming interaction', { error: err });
          });
      }
    } catch (any: any) {
      handleOllamaError(error, 'stream_error');
      logger?.error('Streaming error', { error });
      throw error;
    }
  },
};

export default ollamaProvider;
