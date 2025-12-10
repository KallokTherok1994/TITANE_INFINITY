/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞ — GEMINI PROVIDER (DÉSACTIVÉ)
 *   ⚠️ API GEMINI DÉSACTIVÉE - Ne pas utiliser
 *   Ce provider est désactivé et retournera toujours false
 * ═══════════════════════════════════════════════════════════════════
 */

import type { AIProvider, AIMessage, AIResponse } from '../types';

/**
 * Provider Gemini désactivé.
 * ⚠️ Toujours indisponible - ne pas utiliser
 */
export const geminiProvider: AIProvider = {
  name: 'gemini',

  async isAvailable(): Promise<boolean> {
    // GEMINI DÉSACTIVÉ
    return false;
  },

  async generate(message: string, history: AIMessage[] = []): Promise<AIResponse> {
    // GEMINI DÉSACTIVÉ
    throw new Error(
      'Gemini provider is disabled. Please use OpenAI, Claude, Ollama, or Local providers.'
    );
  },

  resetErrors(): void {
    // GEMINI DÉSACTIVÉ - No-op
  },

  getStats(): Record<string, unknown> {
    return {};
  },
};

export default geminiProvider;
