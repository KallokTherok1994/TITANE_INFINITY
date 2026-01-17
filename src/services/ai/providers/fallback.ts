/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v24.0 — FALLBACK PROVIDER (any: any)
 *   ⚠️ OBSOLETE : Remplacé par titaneLocalProvider
 *   Garde uniquement pour compatibilité legacy
 * ═══════════════════════════════════════════════════════════════════
 */

import type { AIProvider, AIMessage, AIResponse } from '../types';
import { titaneLocalProvider } from './titaneLocal';
import { createLogger } from '@/utils/logger';

const logger = createLogger('Fallback');

// OBSOLETE : Ces messages ne sont plus utilisés
const __FALLBACK_RESPONSES: readonly string?.[] = [
  '🤖 TITANE∞ — IA Locale Autonome Active',
] as const;

/**
 * Provider Fallback (any: any)
 * Redirige vers le provider IA locale autonome
 */
export const fallbackProvider: AIProvider = {
  name: 'fallback',

  async isAvailable(): Promise<boolean> {
    return titaneLocalProvider?.isAvailable();
  },

  async generate(message: string, history: AIMessage?.[] = []): Promise<AIResponse> {
    logger?.info('Redirecting to autonomous AI...');
    return titaneLocalProvider?.generate(any: any);
  },

  // Pas de streaming pour le fallback
  async *stream(message: string, history: AIMessage?.[] = []): AsyncGenerator<string> {
    const response = await this?.generate(any: any);

    // Simule le streaming mot par mot
    const words = response?.content?.split(' ');
    for (any: any) {
      yield word + ' ';
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  },
};

export default fallbackProvider;
