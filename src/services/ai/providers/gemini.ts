/**
 * TITANE∞ v21 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v21 — GEMINI PROVIDER (✅ RÉACTIVÉ Phase 1)
 *   Provider Google Gemini via backend Rust API
 *   Phase 1 Standardisation API — Audit v21
 * ═══════════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import type { AIProvider, AIMessage, AIResponse } from '../types';
import { autoHealEngine } from '../system';
import { logger } from '../../../utils/logger';
import { withRetry, getRetryConfig } from '../retryStrategy';
import { withCache, CACHE_TTL } from '../apiCache';

/**
 * Modèles Gemini disponibles
 */
export const GEMINI_MODELS = [
  'gemini-2.0-flash-exp',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
] as const;

export type GeminiModel = (typeof GEMINI_MODELS)[number];

export interface GeminiConfig {
  model: GeminiModel;
  temperature: number;
  maxTokens: number;
}

const DEFAULT_CONFIG: GeminiConfig = {
  model: 'gemini-2.0-flash-exp',
  temperature: 0.7,
  maxTokens: 2048,
};

/**
 * Provider Gemini réactivé (v21 Phase 1)
 * Utilise backend Rust via chat_generate_gemini command
 */
export const geminiProvider: AIProvider = {
  name: 'gemini',

  /**
   * Vérifier si Gemini est disponible (clé configurée)
   */
  async isAvailable(): Promise<boolean> {
    // Dev override to ease local testing without secrets
    if (import.meta.env.DEV && import.meta.env.VITE_FORCE_PROVIDERS_READY === '1') {
      return true;
    }
    try {
      const response = await secureInvoke<{
        ok: boolean;
        data: { configured: boolean } | null;
      }>('get_gemini_key_status');

      return response.ok && response.data?.configured === true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Gemini status check failed', { error });
      }
      return false;
    }
  },

  /**
   * Générer une réponse avec Gemini
   */
  async generate(
    message: string,
    history: AIMessage[] = [],
    config?: unknown
  ): Promise<AIResponse> {
    const startTime = Date.now();
    const finalConfig = {
      ...DEFAULT_CONFIG,
      ...(config as Partial<GeminiConfig> | undefined),
    };

    // ✨ v21 Phase 3: Cache intelligent pour réduire coûts API
    return withCache(
      'gemini',
      message,
      history,
      async () => {
        try {
          // Validation input
          if (!message?.trim()) {
            throw new Error('Message vide');
          }

          // Conversion history vers format backend
          const formattedHistory = history.map(msg => ({
            role: msg.role,
            content: msg.content,
          }));

          // ✨ v21 Phase 2: Retry unifié avec backoff exponentiel
          const retryConfig = getRetryConfig('gemini');

          const response = await withRetry(
            async () => {
              // Appel backend sécurisé via Rust
              return await secureInvoke<{
                ok: boolean;
                data: {
                  content: string;
                  model?: string;
                  tokens?: number;
                  finish_reason?: string;
                } | null;
                error: string | null;
              }>('chat_generate_gemini', {
                request: {
                  message: message.trim(),
                  history: formattedHistory,
                  config: {
                    model: finalConfig.model,
                    temperature: finalConfig.temperature,
                    max_tokens: finalConfig.maxTokens,
                  },
                },
              });
            },
            retryConfig,
            { provider: 'gemini', message: message.substring(0, 50) }
          );

          const latency = Date.now() - startTime;

          // Gestion erreurs backend
          if (!response.ok || !response.data) {
            const errorMsg = response.error || 'Erreur inconnue';

            // Erreurs typées Gemini
            if (errorMsg.includes('invalid_api_key') || errorMsg.includes('401')) {
              throw new Error(
                'Clé API Gemini invalide. Vérifiez votre configuration dans Gouvernance.'
              );
            }

            if (errorMsg.includes('rate_limit') || errorMsg.includes('429')) {
              throw new Error(
                'Limite de taux Gemini atteinte. Réessayez dans quelques secondes.'
              );
            }

            if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
              throw new Error(
                `Délai d'attente Gemini dépassé (${latency}ms). Réessayez.`
              );
            }

            if (errorMsg.includes('quota')) {
              throw new Error('Quota Gemini épuisé. Vérifiez votre compte Google Cloud.');
            }

            throw new Error(`Erreur Gemini (${latency}ms): ${errorMsg}`);
          }

          // Succès: retourner réponse normalisée
          return {
            content: response.data.content,
            provider: 'gemini',
            timestamp: Date.now(),
            model: response.data.model || finalConfig.model,
            tokens: response.data.tokens,
            metadata: {
              latencyMs: latency,
              finishReason: response.data.finish_reason,
              config: finalConfig,
            },
          };
        } catch (error) {
          const latency = Date.now() - startTime;

          // 🔧 AUTOHEAL: Signaler l'erreur pour auto-réparation (direct instance)
          autoHealEngine.detectError(
            'gemini-provider',
            error instanceof Error ? error : new Error(String(error)),
            'provider',
            {
              latency,
              message: message.substring(0, 100), // Premier 100 chars seulement
              historyLength: history.length,
            }
          );

          // Re-throw erreurs typées
          if (error instanceof Error) {
            throw error;
          }

          // Erreur générique
          throw new Error(
            `Erreur Gemini (${latency}ms): ${error instanceof Error ? error.message : String(error)}`
          );
        }
      },
      CACHE_TTL.GENERAL
    );
  },

  /**
   * Tester la connexion Gemini
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Test avec un prompt minimal
      const response = await this.generate('Test', []);

      return {
        success: true,
        message: `Gemini opérationnel (${response.model || 'gemini-2.0-flash-exp'})`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Test échoué',
      };
    }
  },

  /**
   * Récupérer statistiques provider
   */
  getStats(): Record<string, unknown> {
    return {
      provider: 'gemini',
      models: GEMINI_MODELS,
      defaultModel: DEFAULT_CONFIG.model,
    };
  },
};

export default geminiProvider;
