/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v16.0 — GEMINI PROVIDER
 *   Provider Google Gemini API avec gestion erreurs robuste
 * ═══════════════════════════════════════════════════════════════════
 */

import type { AIProvider, AIMessage, AIResponse, AIConfig } from '../types';
import { DEFAULT_AI_CONFIG } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

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
export const geminiProvider: AIProvider = {
  name: 'gemini',

  async isAvailable(): Promise<boolean> {
    return Boolean(GEMINI_API_KEY && GEMINI_API_KEY.length > 10);
  },

  async generate(message: string, history: AIMessage[] = [], config: AIConfig = {}): Promise<AIResponse> {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const finalConfig = { ...DEFAULT_AI_CONFIG, ...config };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), finalConfig.timeout);

    try {
      const prompt = buildContext(message, history);

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`
        );
      }

      const data = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('Gemini: No candidates returned');
      }

      const content = data.candidates[0]?.content?.parts?.[0]?.text;

      if (!content) {
        throw new Error('Gemini: Empty response');
      }

      return {
        content: content.trim(),
        provider: 'gemini',
        timestamp: Date.now(),
        model: 'gemini-pro',
      };
    } catch (error) {
      clearTimeout(timeout);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Gemini: Request timeout (30s)');
        }
        throw error;
      }

      throw new Error('Gemini: Unknown error');
    }
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
