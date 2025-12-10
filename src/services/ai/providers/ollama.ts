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
import { autoHealEngine } from '../autoHealEngine';

const isDev = process.env.NODE_ENV === 'development';
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
 * Construit le prompt pour Ollama
 */
function buildPrompt(message: string, history: AIMessage[]): string {
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

  // Auto-heal trigger
  autoHealEngine.heal('ollama', errorObj, 'provider', {
    context,
    errorCount,
    metadata,
    timestamp: Date.now(),
  });

  isDev &&
    console.error(
      `[OLLAMA OMEGA] Error [${context}]: ${errorObj.message} (${errorCount}/${MAX_ENDPOINT_ERRORS})`
    );

  // Mark as unhealthy if too many errors
  if (errorCount >= MAX_ENDPOINT_ERRORS) {
    endpointHealthy = false;
    isDev &&
      console.warn(`[OLLAMA OMEGA] Endpoint marked unhealthy after ${errorCount} errors`);
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

    isDev && console.log('🔍 Ollama OMEGA: Checking endpoint health...');

    endpointHealthy = await checkEndpointHealth();
    lastHealthCheck = now;

    if (endpointHealthy) {
      errorCount = 0; // Reset on success
    }

    isDev &&
      console.log(
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
      userId: 'system', // TODO: Get from auth context
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
            const prompt = buildPrompt(sanitizedMessage, history);

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
      return {
        content: secureResult.response.content,
        provider: 'ollama',
        timestamp: Date.now(),
        model: OLLAMA_MODEL,
      };
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
    isDev && console.log('🔄 Ollama Provider: Errors and health state reset');
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
    const prompt = buildPrompt(message, history);

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
              yield data.response;
            }
          } catch {
            // Ignore invalid JSON
          }
        }
      }
    } catch (error) {
      handleOllamaError(error, 'stream_error');
      console.error('Ollama streaming error:', error);
      throw error;
    }
  },
};

export default ollamaProvider;
