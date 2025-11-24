/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v24.0 — FALLBACK PROVIDER (DEPRECATED)
 *   ⚠️ OBSOLETE : Remplacé par titaneLocalProvider
 *   Garde uniquement pour compatibilité legacy
 * ═══════════════════════════════════════════════════════════════════
 */

import type { AIProvider, AIMessage, AIResponse } from '../types';
import { titaneLocalProvider } from './titaneLocal';

// OBSOLETE : Ces messages ne sont plus utilisés
const FALLBACK_RESPONSES: readonly string[] = [
  "🤖 TITANE∞ — IA Locale Autonome Active",
] as const;

/**
 * Provider Fallback (WRAPPER vers TITANE Local)
 * Redirige vers le provider IA locale autonome
 */
export const fallbackProvider: AIProvider = {
  name: 'fallback',

  async isAvailable(): Promise<boolean> {
    return titaneLocalProvider.isAvailable();
  },

  async generate(message: string, history: AIMessage[] = []): Promise<AIResponse> {
    console.log('[Fallback → TITANE Local] Redirecting to autonomous AI...');
    return titaneLocalProvider.generate(message, history);
  },

  // Pas de streaming pour le fallback
  async *stream(message: string, history: AIMessage[] = []): AsyncGenerator<string> {
    const response = await this.generate(message, history);

    // Simule le streaming mot par mot
    const words = response.content.split(' ');
    for (const word of words) {
      yield word + ' ';
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  },
};

export default fallbackProvider;
