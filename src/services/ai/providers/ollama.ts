/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v16.0 — OLLAMA PROVIDER
 *   Provider Ollama local avec support Llama2, Mistral, etc.
 * ═══════════════════════════════════════════════════════════════════
 */

import type { AIProvider, AIMessage, AIResponse, AIConfig } from '../types';
import { DEFAULT_AI_CONFIG } from '../types';

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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), finalConfig.timeout);

    try {
      const prompt = buildPrompt(message, history);

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

      return {
        content: data.response.trim(),
        provider: 'ollama',
        timestamp: Date.now(),
        model: OLLAMA_MODEL,
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
