/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.0 — OLLAMA PROVIDER SÉCURISÉ
 *   Provider Ollama local avec support Llama2, Mistral, etc.
 *   + Sanitization, validation, rate limiting
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

const OLLAMA_API_URL = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'llama2';

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
    (msg) => `${msg.role === 'user' ? 'Utilisateur' : 'TITANE∞'}: ${msg.content}`
  );

  return `Tu es TITANE∞, une IA cognitive avancée. Réponds en français de manière professionnelle et précise.

Contexte récent:
${contextLines.join('\n')}

Utilisateur: ${message}

TITANE∞:`;
}

/**
 * Provider Ollama
 */
export const ollamaProvider: AIProvider = {
  name: 'ollama',

  async isAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(`${OLLAMA_API_URL}/api/tags`, {
        signal: controller.signal,
      });

      clearTimeout(timeout);
      return response.ok;
    } catch {
      return false;
    }
  },

  async generate(message: string, history: AIMessage[] = [], config: AIConfig = {}): Promise<AIResponse> {
    const finalConfig = { ...DEFAULT_AI_CONFIG, ...config };

    // ============================================================
    // SECURE AI REQUEST
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
        await SecureAIService.executeSecureChat(
          secureRequest,
          async (sanitizedMessage) => {
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
        provider: 'ollama',
        timestamp: Date.now(),
        model: OLLAMA_MODEL,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Ollama: Unknown error');
    }
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
      console.error('Ollama streaming error:', error);
      throw error;
    }
  },
};

export default ollamaProvider;
