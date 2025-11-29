/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞ — GEMINI PROVIDER (SECURE BACKEND PROXY)
 *   Tous les appels sont délégués au backend Tauri (secrets isolés)
 * ═══════════════════════════════════════════════════════════════════
 */

import type { AIProvider, AIMessage, AIResponse } from '../types';
import { tauriChatProvider } from './tauriChat';

/**
 * Provider façade côté frontend.
 * Les secrets restent confinés dans SecureSecretsEngine (Rust).
 */
export const geminiProvider: AIProvider = {
  name: 'gemini',

  async isAvailable(): Promise<boolean> {
    const backendReady = await tauriChatProvider.isAvailable();
    if (!backendReady) {
      return false;
    }

    try {
      const status = await tauriChatProvider.getProvidersStatus();
      const geminiStatus = status.find((provider) => provider.provider === 'gemini');
      return Boolean(geminiStatus?.available);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[GeminiProvider] Failed to read backend status', error);
      }
      return false;
    }
  },

  async generate(message: string, history: AIMessage[] = []): Promise<AIResponse> {
    const response = await tauriChatProvider.generate(message, history);

    return {
      ...response,
      provider: response.provider === 'tauri-gemini' ? 'gemini' : response.provider,
    };
  },

  resetErrors(): void {
    tauriChatProvider.resetErrors?.();
  },

  getStats(): Record<string, unknown> {
    return tauriChatProvider.getStats?.() || {};
  },
};

export default geminiProvider;
