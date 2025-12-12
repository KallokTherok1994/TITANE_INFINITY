/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — OLLAMA PROVIDER OMEGA (ENDPOINT ISOLATION)
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
import { autoHealEngine } from '../system';
import { memoryIntegration } from '../memoryIntegration'; // ✨ v21 - Memory integration
import type { MemoryContext } from '../memoryIntegration'; // ✨ v21
import { createLogger } from '@/utils/logger'; // ✨ v21.1 - Conditional logging

const logger = createLogger('Ollama'); // ✨ v21.1
const runtimeConfig = (globalThis as any)?.__TITANE_RUNTIME_CONFIG__ || {};
const OLLAMA_API_URL =
  typeof runtimeConfig.ollamaUrl === 'string' && runtimeConfig.ollamaUrl.trim().length > 0
    ? runtimeConfig.ollamaUrl.trim()
    : 'http://127.0.0.1:11434';
const OLLAMA_MODEL =
  typeof runtimeConfig.ollamaModel === 'string' &&
  runtimeConfig.ollamaModel.trim().length > 0
    ? runtimeConfig.ollamaModel.trim()
    : 'llama3.1';
const isTestEnv = typeof process !== 'undefined' && Boolean((process as any).env?.VITEST);

// OMEGA: Endpoint health tracking
let endpointHealthy: boolean | null = null;
let lastHealthCheck = 0;
let errorCount = 0;
const HEALTH_CHECK_INTERVAL = 45000; // 45 secondes
const MAX_ENDPOINT_ERRORS = 5;
const ENDPOINT_TIMEOUT = 8000; // 8s for health checks (optimisé)

/**
 * OMEGA: Initialize Ollama provider at startup
 * Tests endpoint health and prepares the provider
 */
export async function initializeOllama(): Promise<boolean> {
  logger.debug('🚀 Initializing Ollama provider...');

  try {
    const healthy = await checkEndpointHealth();
    endpointHealthy = healthy;
    lastHealthCheck = Date.now();

    if (healthy) {
      errorCount = 0;
      logger.info(`✅ Health check passed - Ready at ${OLLAMA_API_URL}`);
      logger.debug(`📦 Model: ${OLLAMA_MODEL}`);
    } else {
      logger.warn(`⚠️ Endpoint offline at ${OLLAMA_API_URL}`);
      logger.warn(`🔄 Falling back to titaneLocal provider`);
    }

    return healthy;
  } catch (error) {
    handleOllamaError(error, 'initialization', { url: OLLAMA_API_URL });
    logger.error('❌ Initialization failed:', error);
    return false;
  }
}

/**
 * Construit le prompt pour Ollama (legacy - sans mémoire)
 * @deprecated Use buildPromptWithMemory() instead
 */
function _buildPrompt(message: string, history: AIMessage[]): string {
  const recentHistory = history.slice(-5);

  if (recentHistory.length === 0) {
    return `Tu es TITANE∞, une IA cognitive avancée. Réponds en français de manière professionnelle et précise.

Utilisateur: ${message}

TITANE∞:`;
  }

  const contextLines = recentHistory.map(
    msg => `${msg.role === 'user' ? 'Utilisateur' : 'TITANE∞'}: ${msg.content}`
  );

  return `Tu es TITANE∞, une IA cognitive avancée. Réponds en français de manière professionnelle et précise.

Contexte récent:
${contextLines.join('\n')}

Utilisateur: ${message}

TITANE∞:`;
}

/**
 * ✨ v21 - Construit le prompt enrichi avec mémoire STM/MTM/LTM
 */
async function buildPromptWithMemory(
  message: string,
  history: AIMessage[]
): Promise<string> {
  const recentHistory = history.slice(-5);

  // Charger contexte mémoire
  let memoryContext: MemoryContext | null = null;
  try {
    memoryContext = await memoryIntegration.loadContext({
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
  } catch (error) {
    logger.warn('Failed to load memory context', error);
  }

  // Construire sections du prompt
  const sections: string[] = [];

  // System prompt
  sections.push(
    `Tu es TITANE∞ v21, un OS cognitif personnel développé pour Kevin Thibault.`,
    ``,
    `IDENTITÉ:`,
    `- Système local-first (priorité absolue à la vie privée)`,
    `- Multi-IA orchestré (Ollama local, Claude, OpenAI en backup)`,
    `- Mémoire persistante (STM/MTM/LTM)`,
    `- Auto-évolution cognitive`,
    ``,
    `PRINCIPES:`,
    `- Local-first: toujours privilégier Ollama quand possible`,
    `- Mémoire vivante: utiliser le contexte passé pour répondre`,
    `- Précision technique: réponses structurées, claires, sourcées`,
    `- Français: langue par défaut`,
    ``,
    `STYLE:`,
    `- Réponses structurées (titres, listes, sections)`,
    `- Ton professionnel mais accessible`,
    `- Citer la mémoire quand pertinent`,
    `- Admettre quand tu ne sais pas`
  );

  // Contexte mémoire
  if (memoryContext) {
    sections.push(``, `📋 CONTEXTE MÉMOIRE:`);

    if (memoryContext.activeProjects?.length > 0) {
      const projectNames = memoryContext.activeProjects
        .map(p => (p as any).name || (p as any).title)
        .filter(Boolean)
        .join(', ');
      if (projectNames) {
        sections.push(`Projets actifs: ${projectNames}`);
      }
    }

    if (memoryContext.recentDecisions?.length > 0) {
      const decisions = memoryContext.recentDecisions
        .slice(0, 3)
        .map(d => (d as any).summary || (d as any).title)
        .filter(Boolean)
        .join('; ');
      if (decisions) {
        sections.push(`Décisions récentes: ${decisions}`);
      }
    }

    if (memoryContext.relevantKnowledge?.length > 0) {
      const knowledgeCount = memoryContext.relevantKnowledge.length;
      sections.push(`Base de connaissances: ${knowledgeCount} entrées disponibles`);
    }
  }

  // Conversation récente
  if (recentHistory.length > 0) {
    sections.push(``, `💬 CONVERSATION RÉCENTE:`);
    const contextLines = recentHistory.map(
      msg => `${msg.role === 'user' ? 'Utilisateur' : 'TITANE∞'}: ${msg.content}`
    );
    sections.push(...contextLines);
  }

  // Message utilisateur
  sections.push(``, `Utilisateur: ${message}`, ``, `TITANE∞:`);

  return sections.join('\n');
}

/**
 * OMEGA: Test endpoint health with timeout
 */
async function checkEndpointHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ENDPOINT_TIMEOUT);

    const response = await fetch(`${OLLAMA_API_URL}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      // Check if models are available
      return Array.isArray(data.models) && data.models.length > 0;
    }

    return false;
  } catch (error) {
    handleOllamaError(error, 'health_check', { url: OLLAMA_API_URL });
    return false;
  }
}

/**
 * OMEGA: Error handler avec auto-heal integration
 */
function handleOllamaError(error: unknown, context: string, metadata?: any): void {
  errorCount++;

  const errorObj = error instanceof Error ? error : new Error(String(error));

  // Auto-heal trigger (direct instance)
  autoHealEngine.heal('ollama', errorObj, 'provider', {
    context,
    errorCount,
    metadata,
    timestamp: Date.now(),
  });

  logger.error('Error in Ollama provider', {
    context,
    message: errorObj.message,
    errorCount,
    maxErrors: MAX_ENDPOINT_ERRORS,
  });

  // Mark as unhealthy if too many errors
  if (errorCount >= MAX_ENDPOINT_ERRORS) {
    endpointHealthy = false;
    logger.warn('Endpoint marked unhealthy', { errorCount });
  }
}

export const ollamaProvider: AIProvider = {
  name: 'ollama',

  async isAvailable(): Promise<boolean> {
    const now = Date.now();

    const bypassCache = isTestEnv;

    // OMEGA: Use cached health status if recent (unless test forces re-check)
    if (
      !bypassCache &&
      endpointHealthy !== null &&
      now - lastHealthCheck < HEALTH_CHECK_INTERVAL
    ) {
      return endpointHealthy;
    }

    // OMEGA: If too many errors, consider unavailable
    if (errorCount >= MAX_ENDPOINT_ERRORS) {
      // Reset after some time
      if (now - lastHealthCheck > HEALTH_CHECK_INTERVAL * 5) {
        errorCount = 0;
        endpointHealthy = null;
      } else {
        return false;
      }
    }

    logger.debug('🔍 OMEGA: Checking endpoint health...');

    endpointHealthy = await checkEndpointHealth();
    lastHealthCheck = now;

    if (endpointHealthy) {
      errorCount = 0; // Reset on success
    }

    logger.debug(
      `   ${endpointHealthy ? '✅' : '❌'} Ollama endpoint: ${endpointHealthy ? 'healthy' : 'unavailable'}`
    );

    return endpointHealthy;
  },

  async generate(
    message: string,
    history: AIMessage[] = [],
    config: AIConfig = {}
  ): Promise<AIResponse> {
    const finalConfig = { ...DEFAULT_AI_CONFIG, ...config };

    // OMEGA: Pre-check endpoint health
    const isHealthy = await this.isAvailable();
    if (!isHealthy) {
      const error = new Error('Ollama endpoint not available');
      handleOllamaError(error, 'pre_check', { url: OLLAMA_API_URL });
      throw error;
    }

    // ============================================================
    // SECURE AI REQUEST (OMEGA Enhanced)
    // ============================================================
    const secureRequest: SecureAIRequest = {
      input: message,
      provider: 'ollama',
      model: OLLAMA_MODEL,
      userId:
        (typeof window !== 'undefined' && (window as any).__TITANE_USER_ID__) ||
        'anonymous',
      metadata: {
        temperature: finalConfig.temperature,
        maxTokens: finalConfig.maxTokens,
        historyLength: history.length,
        requestId: `ollama-${Date.now()}`,
      },
    };

    try {
      const secureResult: SecureAIResponse<ChatResponse> =
        await SecureAIService.executeSecureChat(secureRequest, async sanitizedMessage => {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), finalConfig.timeout);

          try {
            // ✨ v21 - Use memory-enriched prompt
            const prompt = await buildPromptWithMemory(sanitizedMessage, history);

            const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt,
                stream: false,
                options: {
                  temperature: finalConfig.temperature,
                  top_p: finalConfig.topP,
                  top_k: finalConfig.topK,
                  num_predict: finalConfig.maxTokens,
                },
              }),
              signal: controller.signal,
            });

            clearTimeout(timeout);

            if (!response.ok) {
              throw new Error(`Ollama API error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.response) {
              throw new Error('Ollama: Empty response');
            }

            // Return in ChatResponse format
            return {
              content: data.response.trim(),
              role: 'assistant' as const,
              timestamp: Date.now(),
              metadata: {
                model: OLLAMA_MODEL,
                tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
              },
            };
          } catch (error) {
            clearTimeout(timeout);

            if (error instanceof Error) {
              if (error.name === 'AbortError') {
                throw new Error('Ollama: Request timeout (30s)');
              }
              throw error;
            }

            throw new Error('Ollama: Unknown error');
          }
        });

      // ============================================================
      // SECURITY VALIDATION CHECK (OMEGA Enhanced)
      // ============================================================
      if (!secureResult.success) {
        const errorMsg = secureResult.error || 'Security validation failed';

        if (secureResult.rateLimitExceeded) {
          const rateLimitError = new Error(`Rate limit exceeded — ${errorMsg}`);
          handleOllamaError(rateLimitError, 'rate_limit', { secureResult });
          throw rateLimitError;
        }

        if (secureResult.sanitization?.isBlocked) {
          const patterns = secureResult.sanitization.detectedPatterns.join(', ');
          const sanitizationError = new Error(`Input blocked — Detected: ${patterns}`);
          handleOllamaError(sanitizationError, 'sanitization', { patterns });
          throw sanitizationError;
        }

        if (!secureResult.validation?.isValid) {
          const validationError = new Error(`Response validation failed — ${errorMsg}`);
          handleOllamaError(validationError, 'validation', { secureResult });
          throw validationError;
        }

        const securityError = new Error(errorMsg);
        handleOllamaError(securityError, 'security', { secureResult });
        throw securityError;
      }

      // ============================================================
      // SUCCESS (OMEGA)
      // ============================================================
      const aiResponse: AIResponse = {
        content: secureResult.response.content,
        provider: 'ollama',
        timestamp: Date.now(),
        model: OLLAMA_MODEL,
      };

      // ✨ v21 - Save interaction to memory (async, non-blocking)
      memoryIntegration
        .saveInteraction({
          userMessage: message,
          aiResponse: aiResponse.content,
          mode: 'chat',
        })
        .catch(err => {
          logger.warn('Failed to save interaction to memory', { error: err });
        });

      return aiResponse;
    } catch (error) {
      // OMEGA: Final error handler
      if (error instanceof Error) {
        // Don't double-handle errors already processed
        if (
          !error.message.includes('Ollama:') &&
          !error.message.includes('Rate limit') &&
          !error.message.includes('Input blocked') &&
          !error.message.includes('validation failed')
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
   * OMEGA: Reset error state (for auto-heal)
   */
  resetErrors(): void {
    errorCount = 0;
    endpointHealthy = null;
    lastHealthCheck = 0;
    logger.debug('🔄 Errors and health state reset');
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
  async *stream(message: string, history: AIMessage[] = []): AsyncGenerator<string> {
    // ✨ v21 - Use memory-enriched prompt
    const prompt = await buildPromptWithMemory(message, history);

    let fullResponse = ''; // Track complete response for memory save

    try {
      const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama streaming error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Ollama: No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const data = JSON.parse(line);
            if (data.response) {
              fullResponse += data.response;
              yield data.response;
            }
          } catch {
            // Ignore invalid JSON
          }
        }
      }

      // ✨ v21 - Save streaming interaction to memory after completion
      if (fullResponse) {
        memoryIntegration
          .saveInteraction({
            userMessage: message,
            aiResponse: fullResponse,
            mode: 'chat',
          })
          .catch(err => {
            logger.warn('Failed to save streaming interaction', { error: err });
          });
      }
    } catch (error) {
      handleOllamaError(error, 'stream_error');
      logger.error('Streaming error', { error });
      throw error;
    }
  },
};

export default ollamaProvider;
