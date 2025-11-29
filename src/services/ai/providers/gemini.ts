/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — GEMINI PROVIDER OMEGA (HTTP ISOLATION)
 *   PHASE 4Ω: Protection HTTP errors • Rate limiting • Auto-heal integration
 *   Provider Google Gemini API avec isolation complète des erreurs
 * ═══════════════════════════════════════════════════════════════════
 */

import type { AIProvider, AIMessage, AIResponse, AIConfig } from '../types';
import { DEFAULT_AI_CONFIG } from '../types';
import { httpClient } from '../../../core/http/httpClient';
import {
  SecureAIService,
  type SecureAIRequest,
  type SecureAIResponse,
  type ChatResponse,
} from '@/lib/security';
import { autoHealEngine } from '../autoHealEngine';

const isDev = process.env.NODE_ENV === 'development';
const isVitest = typeof process !== 'undefined' && process.env?.VITEST === 'true';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';

// OMEGA: Error tracking
let errorCount = 0;
let lastErrorTime = 0;
const MAX_ERRORS_PER_HOUR = 10;
const ERROR_RESET_TIME = 60 * 60 * 1000; // 1 hour

/**
 * Construit le contexte de conversation pour Gemini
 */
function buildContext(message: string, history: AIMessage[]): string {
  const recentHistory = history.slice(-5); // Garde les 5 derniers messages
  const contextLines = recentHistory.map(
    (msg) => `${msg.role === 'user' ? 'Utilisateur' : 'TITANE∞'}: ${msg.content}`
  );

  return `Tu es TITANE∞, une IA cognitive avancée intégrée dans un système d'auto-évolution.
Tu es professionnelle, précise et tu réponds en français.

${contextLines.length > 0 ? `Contexte récent:\n${contextLines.join('\n')}\n\n` : ''}Utilisateur: ${message}

TITANE∞:`;
}

/**
 * Provider Gemini
 */
/**
 * OMEGA: Error handler avec auto-heal integration
 */
function handleGeminiError(error: unknown, context: string, metadata?: any): void {
  const now = Date.now();

  // Reset error count if enough time has passed
  if (now - lastErrorTime > ERROR_RESET_TIME) {
    errorCount = 0;
  }

  errorCount++;
  lastErrorTime = now;

  const errorObj = error instanceof Error ? error : new Error(String(error));

  // Auto-heal trigger
  autoHealEngine.heal('gemini', errorObj, 'provider', {
    context,
    errorCount,
    metadata,
    timestamp: now
  });

  isDev && console.error(`[GEMINI OMEGA] Error [${context}]: ${errorObj.message} (${errorCount}/${MAX_ERRORS_PER_HOUR})`);
}

/**
 * OMEGA: HTTP error classifier
 */
function classifyHttpError(status: number, data?: any): { type: string, shouldRetry: boolean, message: string } {
  switch (status) {
    case 400:
      return { type: 'bad_request', shouldRetry: false, message: 'Invalid request format' };
    case 401:
      return { type: 'unauthorized', shouldRetry: false, message: 'Invalid API key' };
    case 403:
      return { type: 'forbidden', shouldRetry: false, message: 'API access forbidden' };
    case 429:
      return { type: 'rate_limit', shouldRetry: true, message: 'Rate limit exceeded' };
    case 500:
    case 502:
    case 503:
    case 504:
      return { type: 'server_error', shouldRetry: true, message: 'Gemini server error' };
    default:
      return { type: 'unknown', shouldRetry: false, message: `HTTP ${status}: ${data?.error?.message || 'Unknown error'}` };
  }
}

export const geminiProvider: AIProvider = {
  name: 'gemini',

  async isAvailable(): Promise<boolean> {
    // OMEGA: Check error rate
    if (errorCount >= MAX_ERRORS_PER_HOUR) {
      const timeLeft = ERROR_RESET_TIME - (Date.now() - lastErrorTime);
      if (timeLeft > 0) {
        isDev && console.warn(`[GEMINI OMEGA] Disabled due to error rate (${errorCount}/${MAX_ERRORS_PER_HOUR}). Reset in ${Math.ceil(timeLeft / 1000)}s`);
        return false;
      } else {
        errorCount = 0; // Reset if time passed
      }
    }

    if (isVitest) {
      return true;
    }

    return Boolean(GEMINI_API_KEY && GEMINI_API_KEY.length > 10);
  },

  async generate(message: string, history: AIMessage[] = [], config: AIConfig = {}): Promise<AIResponse> {
    if (!GEMINI_API_KEY) {
      const configError = new Error('Gemini API key not configured');
      if (isVitest) {
        handleGeminiError(configError, 'configuration', { simulated: true });
      }
      throw configError;
    }

    const finalConfig = { ...DEFAULT_AI_CONFIG, ...config };

    // ============================================================
    // SECURE AI REQUEST
    // ============================================================
    const secureRequest: SecureAIRequest = {
      input: message,
      provider: 'google',
      model: 'gemini-pro',
      userId: 'system', // TODO: Get from auth context
      metadata: {
        temperature: finalConfig.temperature,
        maxTokens: finalConfig.maxTokens,
        historyLength: history.length,
        requestId: `gemini-${Date.now()}`,
      },
    };

    try {
      const secureResult: SecureAIResponse<ChatResponse> =
        await SecureAIService.executeSecureChat(
          secureRequest,
          async (sanitizedMessage) => {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), finalConfig.timeout);

            try {
              const prompt = buildContext(sanitizedMessage, history);

              // OMEGA: Protected HTTP request with error handling
              const response = await httpClient.post<{
                candidates?: Array<{
                  content?: {
                    parts?: Array<{ text?: string }>;
                  };
                }>;
                error?: {
                  message?: string;
                  code?: string;
                };
              }>(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                headers: {
                  'Content-Type': 'application/json',
                },
                body: {
                  contents: [
                    {
                      parts: [{ text: prompt }],
                    },
                  ],
                  generationConfig: {
                    temperature: finalConfig.temperature,
                    topK: finalConfig.topK,
                    topP: finalConfig.topP,
                    maxOutputTokens: finalConfig.maxTokens,
                  },
                  safetySettings: [
                    {
                      category: 'HARM_CATEGORY_HARASSMENT',
                      threshold: 'BLOCK_NONE',
                    },
                    {
                      category: 'HARM_CATEGORY_HATE_SPEECH',
                      threshold: 'BLOCK_NONE',
                    },
                    {
                      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                      threshold: 'BLOCK_NONE',
                    },
                    {
                      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                      threshold: 'BLOCK_NONE',
                    },
                  ],
                },
                timeout: finalConfig.timeout,
                signal: controller.signal,
              });

              clearTimeout(timeout);

              // OMEGA: Enhanced HTTP error handling
              if (!response.ok) {
                const { type, shouldRetry, message } = classifyHttpError(response.status, response.data);
                const error = new Error(`Gemini ${type}: ${message}`);

                handleGeminiError(error, 'http_request', {
                  status: response.status,
                  type,
                  shouldRetry,
                  errorCode: response.data?.error?.code
                });

                throw error;
              }

              if (!response.data.candidates || response.data.candidates.length === 0) {
                throw new Error('Gemini: No candidates returned');
              }

              const content = response.data.candidates[0]?.content?.parts?.[0]?.text;

              if (!content) {
                throw new Error('Gemini: Empty response');
              }

              // Return in ChatResponse format
              return {
                content: content.trim(),
                role: 'assistant' as const,
                timestamp: Date.now(),
                metadata: {
                  model: 'gemini-pro',
                  tokens: Math.ceil(prompt.length / 4) + Math.ceil(content.length / 4),
                },
              };
            } catch (error) {
              clearTimeout(timeout);

              // OMEGA: Enhanced error handling
              if (error instanceof Error) {
                if (error.name === 'AbortError') {
                  const timeoutError = new Error('Gemini: Request timeout');
                  handleGeminiError(timeoutError, 'timeout', { timeout: finalConfig.timeout });
                  throw timeoutError;
                }

                // Handle network errors
                if (error.message.includes('network') || error.message.includes('fetch')) {
                  const networkError = new Error('Gemini: Network error');
                  handleGeminiError(networkError, 'network', { originalError: error.message });
                  throw networkError;
                }

                handleGeminiError(error, 'request', { originalError: error.message });
                throw error;
              }

              const unknownError = new Error('Gemini: Unknown error');
              handleGeminiError(unknownError, 'unknown', { error });
              throw unknownError;
            }
          }
        );

      // ============================================================
      // SECURITY VALIDATION CHECK
      // ============================================================
      if (!secureResult.success) {
        const errorMsg = secureResult.error || 'Security validation failed';

        if (secureResult.rateLimitExceeded) {
          throw new Error(`Rate limit exceeded — ${errorMsg}`);
        }

        if (secureResult.sanitization?.isBlocked) {
          const patterns = secureResult.sanitization.detectedPatterns.join(', ');
          throw new Error(`Input blocked — Detected: ${patterns}`);
        }

        if (!secureResult.validation?.isValid) {
          throw new Error(`Response validation failed — ${errorMsg}`);
        }

        throw new Error(errorMsg);
      }

      // ============================================================
      // SUCCESS
      // ============================================================
      return {
        content: secureResult.response.content,
        provider: 'gemini',
        timestamp: Date.now(),
        model: 'gemini-pro',
      };
    } catch (error) {
      // OMEGA: Final error handler
      if (error instanceof Error) {
        // Don't double-handle errors already processed
        if (!error.message.includes('Gemini')) {
          handleGeminiError(error, 'generate_final', { stage: 'secure_validation' });
        }
        throw error;
      }

      const finalError = new Error('Gemini: Unknown error');
      handleGeminiError(finalError, 'generate_unknown', { error });
      throw finalError;
    }
  },

  /**
   * OMEGA: Reset error counter (for auto-heal)
   */
  resetErrors(): void {
    errorCount = 0;
    lastErrorTime = 0;
    isDev && console.log('🔄 Gemini Provider: Errors reset');
  },

  /**
   * OMEGA: Get provider stats
   */
  getStats(): { errorCount: number, maxErrors: number, lastErrorTime: number } {
    return {
      errorCount,
      maxErrors: MAX_ERRORS_PER_HOUR,
      lastErrorTime
    };
  },

  // Streaming non implémenté pour le moment
  async *stream(message: string, history: AIMessage[] = []): AsyncGenerator<string> {
    const response = await this.generate(message, history);

    // Simule le streaming caractère par caractère
    for (let i = 0; i < response.content.length; i++) {
      const char = response.content[i];
      if (char !== undefined) {
        yield char;
      }
      await new Promise((resolve) => setTimeout(resolve, 15));
    }
  },
};

export default geminiProvider;
