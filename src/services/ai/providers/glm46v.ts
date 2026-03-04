/**
 * TITANE∞ v26.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v26.3.0 — GLM-4.6V-FLASH PROVIDER
 *   Provider local GLM-4.6V-Flash avec support multimodal
 *   Architecture: vLLM server + OpenAI-compatible API + Vision
 * ═══════════════════════════════════════════════════════════════════
 */

import type { AIProvider, AIMessage, AIResponse, AIConfig } from '../types';
import { DEFAULT_AI_CONFIG } from '../types';
import {
  SecureAIService,
  secureInvoke,
  type SecureAIRequest,
  type SecureAIResponse,
  type ChatResponse,
} from '@/lib/security';
import { unifiedHealingFacade } from '../unifiedHealingFacade';
import { createLogger } from '@/utils/logger';

const logger = createLogger('GLM46V');

// Configuration vLLM server
const GLM46V_CONFIG = {
  baseUrl: 'http://127.0.0.1:8000/v1',
  model: 'THUDM/glm-4v-9b',
  timeout: 30000,
  healthCheckInterval: 45000,
  maxRetries: 3,
  maxErrors: 5,
};

// Health tracking
let endpointHealthy: boolean | null = null;
let lastHealthCheck = 0;
let errorCount = 0;

/**
 * Initialize GLM-4.6V provider at startup
 */
export async function initializeGLM46V(): Promise<boolean> {
  logger.debug('🚀 Initializing GLM-4.6V provider...');

  try {
    const healthy = await checkEndpointHealth();
    endpointHealthy = healthy;
    lastHealthCheck = Date.now();

    if (healthy) {
      errorCount = 0;
      logger.info(`✅ GLM-4.6V health check passed at ${GLM46V_CONFIG.baseUrl}`);
    } else {
      logger.warn(`⚠️ GLM-4.6V endpoint offline at ${GLM46V_CONFIG.baseUrl}`);
      logger.warn(`🔄 Falling back to other providers`);
    }

    return healthy;
  } catch (error) {
    handleGLM46VError(error, 'initialization');
    return false;
  }
}

/**
 * Build prompt with multimodal content support
 */
function buildPromptWithVision(message: string, history: AIMessage[]): any {
  const recentHistory = history.slice(-5);

  // Build messages array for OpenAI-compatible format
  const messages = [];

  // Add system message
  messages.push({
    role: 'system',
    content: `Tu es TITANE∞ v26.3.0, un système IA multimodal avancé avec capacités de vision.
Tu peux analyser des images et répondre en français de manière professionnelle et précise.
Lorsque tu vois une image, décris-la précisément et utilise cette information pour répondre.`,
  });

  // Add conversation history
  for (const msg of recentHistory) {
    if (typeof msg.content === 'string') {
      messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      });
    } else if (Array.isArray(msg.content)) {
      // Handle multimodal content (OpenAI-like format)
      type ContentPart =
        | { type: 'text'; text: string }
        | { type: 'image_url'; image_url: { url: string } };
      const content = (msg.content as ContentPart[])
        .map(part => {
          if (part.type === 'text') {
            return { type: 'text' as const, text: part.text };
          } else if (part.type === 'image_url') {
            return {
              type: 'image_url' as const,
              image_url: { url: part.image_url.url },
            };
          }
          return null;
        })
        .filter(Boolean);

      messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content,
      });
    }
  }

  // Add current message
  if (typeof message === 'string') {
    messages.push({
      role: 'user',
      content: message,
    });
  } else {
    // Handle multimodal message input (future extension)
    messages.push({
      role: 'user',
      content: message,
    });
  }

  return { messages };
}

/**
 * Health check for vLLM GLM-4.6V server
 */
async function checkEndpointHealth(): Promise<boolean> {
  try {
    const providers =
      await secureInvoke<
        Array<{ provider: string; available: boolean; models?: string[] }>
      >('chat_check_providers');

    const glm = providers.find(item => item.provider.toLowerCase().includes('glm'));

    if (!glm) return false;
    if (!glm.available) return false;
    if (!glm.models || glm.models.length === 0) return true;

    return glm.models.some(model => model.toLowerCase().includes('glm'));
  } catch (error) {
    handleGLM46VError(error, 'health_check');
    return false;
  }
}

/**
 * Error handler with auto-heal integration
 */
function handleGLM46VError(
  error: unknown,
  context: string,
  metadata?: Record<string, unknown>
): void {
  errorCount++;

  const errorObj = error instanceof Error ? error : new Error(String(error));

  // Unified heal (non-blocking)
  void unifiedHealingFacade
    .heal({
      source: 'glm46v',
      error: errorObj,
      type: 'provider',
      metadata: {
        context,
        errorCount,
        ...metadata,
        timestamp: Date.now(),
      },
    })
    .catch(() => {
      // Silent heal failure
    });

  logger.error('GLM-4.6V provider error', {
    context,
    message: errorObj.message,
    errorCount,
    maxErrors: GLM46V_CONFIG.maxErrors,
  });

  // Mark as unhealthy if too many errors
  if (errorCount >= GLM46V_CONFIG.maxErrors) {
    endpointHealthy = false;
    logger.warn('GLM-4.6V endpoint marked unhealthy', { errorCount });
  }
}

/**
 * Convert AIMessage to GLM-4.6V compatible format
 */
function convertToGLM46VFormat(message: string, history: AIMessage[]): any {
  return buildPromptWithVision(message, history);
}

/**
 * GLM-4.6V Provider Implementation
 */
export const glm46vProvider: AIProvider = {
  name: 'glm46v',

  async isAvailable(): Promise<boolean> {
    const now = Date.now();

    // Return cached health status if recent
    if (
      endpointHealthy !== null &&
      now - lastHealthCheck < GLM46V_CONFIG.healthCheckInterval
    ) {
      return endpointHealthy;
    }

    // If too many errors, consider unavailable
    if (errorCount >= GLM46V_CONFIG.maxErrors) {
      if (now - lastHealthCheck > GLM46V_CONFIG.healthCheckInterval * 5) {
        errorCount = 0; // Reset after timeout
        endpointHealthy = null;
      } else {
        return false;
      }
    }

    logger.debug('🔍 Checking GLM-4.6V endpoint health...');

    endpointHealthy = await checkEndpointHealth();
    lastHealthCheck = now;

    if (endpointHealthy) {
      errorCount = 0; // Reset on success
    }

    logger.debug(
      `   ${endpointHealthy ? '✅' : '❌'} GLM-4.6V endpoint: ${endpointHealthy ? 'healthy' : 'unavailable'}`
    );

    return endpointHealthy;
  },

  async generate(
    message: string,
    history: AIMessage[] = [],
    config?: unknown
  ): Promise<AIResponse> {
    const finalConfig = {
      ...DEFAULT_AI_CONFIG,
      ...(config as Partial<AIConfig> | undefined),
    };

    // Pre-check endpoint health
    const isHealthy = await this.isAvailable();
    if (!isHealthy) {
      const error = new Error('GLM-4.6V endpoint not available');
      handleGLM46VError(error, 'pre_check');
      throw error;
    }

    // Secure AI Request
    const secureRequest: SecureAIRequest = {
      input: message,
      provider: 'glm46v',
      model: GLM46V_CONFIG.model,
      userId: 'titane-user',
      metadata: {
        temperature: finalConfig.temperature,
        maxTokens: finalConfig.maxTokens,
        historyLength: history.length,
        requestId: `glm46v-${Date.now()}`,
      },
    };

    try {
      const secureResult: SecureAIResponse<ChatResponse> =
        await SecureAIService.executeSecureChat(secureRequest, async sanitizedMessage => {
          try {
            const _payload = convertToGLM46VFormat(sanitizedMessage, history);

            const data = await secureInvoke<{
              success: boolean;
              error?: string;
              message?: { content?: string; model?: string; tokens?: number };
              latency_ms?: number;
            }>(
              'conversation_generate',
              {
                args: {
                  message: sanitizedMessage,
                  conversationId: `glm46v-${Date.now()}`,
                  mode: null,
                  provider: 'glm46v',
                },
              },
              { timeout: finalConfig.timeout }
            );

            if (!data?.success) {
              throw new Error(data?.error || 'GLM-4.6V IPC error');
            }

            if (!data?.message?.content) {
              throw new Error('GLM-4.6V: Empty response');
            }

            return {
              content: data.message.content.trim(),
              role: 'assistant',
              timestamp: Date.now(),
              metadata: {
                model: data.message.model || GLM46V_CONFIG.model,
                tokens: data.message.tokens || 0,
                finish_reason: 'stop',
              },
            };
          } catch (error) {
            if (error instanceof Error) {
              if (error.name === 'AbortError') {
                throw new Error('GLM-4.6V: Request timeout');
              }
              throw error;
            }

            throw new Error('GLM-4.6V: Unknown error');
          }
        });

      // Security validation check
      if (!secureResult.success) {
        const errorMsg = secureResult.error || 'Security validation failed';

        if (secureResult.rateLimitExceeded) {
          const rateLimitError = new Error(`Rate limit exceeded — ${errorMsg}`);
          handleGLM46VError(rateLimitError, 'rate_limit');
          throw rateLimitError;
        }

        if (secureResult.sanitization?.isBlocked) {
          const patterns = secureResult.sanitization.detectedPatterns.join(', ');
          const sanitizationError = new Error(`Input blocked — Detected: ${patterns}`);
          handleGLM46VError(sanitizationError, 'sanitization');
          throw sanitizationError;
        }

        if (!secureResult.validation?.isValid) {
          const validationError = new Error(`Response validation failed — ${errorMsg}`);
          handleGLM46VError(validationError, 'validation');
          throw validationError;
        }

        const securityError = new Error(errorMsg);
        handleGLM46VError(securityError, 'security');
        throw securityError;
      }

      // Success
      const aiResponse: AIResponse = {
        content: secureResult.response.content,
        provider: 'glm46v',
        timestamp: Date.now(),
        model: GLM46V_CONFIG.model,
      };

      return aiResponse;
    } catch (error) {
      // Final error handler
      if (error instanceof Error) {
        if (
          !error.message.includes('GLM-4.6V:') &&
          !error.message.includes('Rate limit') &&
          !error.message.includes('Input blocked') &&
          !error.message.includes('validation failed')
        ) {
          handleGLM46VError(error, 'generate_final');
        }
        throw error;
      }

      const finalError = new Error('GLM-4.6V: Unknown error');
      handleGLM46VError(finalError, 'generate_unknown');
      throw finalError;
    }
  },

  /**
   * Reset error state
   */
  resetErrors(): void {
    errorCount = 0;
    endpointHealthy = null;
    lastHealthCheck = 0;
    logger.debug('🔄 GLM-4.6V errors and health state reset');
  },

  /**
   * Get provider stats
   */
  getStats(): {
    errorCount: number;
    maxErrors: number;
    endpointHealthy: boolean | null;
    lastHealthCheck: number;
  } {
    return {
      errorCount,
      maxErrors: GLM46V_CONFIG.maxErrors,
      endpointHealthy,
      lastHealthCheck,
    };
  },

  /**
   * Test connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const isAvailable = await this.isAvailable();
      if (isAvailable) {
        return { success: true, message: 'GLM-4.6V endpoint healthy' };
      } else {
        return { success: false, message: 'GLM-4.6V endpoint not available' };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: `GLM-4.6V test failed: ${message}` };
    }
  },
};

export default glm46vProvider;
