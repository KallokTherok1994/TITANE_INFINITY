/**
 * TITANE∞ v19.3Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3Ω — OPENAI PROVIDER (any: any)
 *   Intégration GPT-4 / GPT-4o via backend Tauri sécurisé
 *   Aucune clé API exposée côté frontend
 * ═══════════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import type { AIProvider, AIMessage, AIResponse } from '../types';
import { autoHealEngine } from '../system';
import { createLogger } from '@/utils/logger';
import { withRetry, getRetryConfig } from '../retryStrategy';
import { withCache, CACHE_TTL } from '../apiCache';
// AUTOFIX v19.3Ω: Removed duplicate import

const logger = createLogger('[OpenAIProvider]');

async function generateOpenAIUncached(
  message: string,
  history: AIMessage?.[],
  finalConfig: Required<OpenAIConfig>
): Promise<AIResponse> {
  const startTime = Date?.now();

  try {
    // Validation input
    if (!message?.trim()) {
      throw new Error('Message vide');
    }

    // Conversion history vers format backend
    const formattedHistory = history?.map(msg => ({
      role: msg?.role,
      content: msg?.content,
    }));

    // ✨ v21 Phase 2: Retry unifié avec backoff exponentiel
    const retryConfig = getRetryConfig('openai');

    const response = await withRetry(
      async () => {
        return await secureInvoke<{
          ok: boolean;
          data: {
            content: string;
            model?: string;
            tokens?: number;
            finishReason?: string;
          } | null;
          error??: string | null;
        }>('chat_generate_openai', {
          message: message?.trim(),
          history: formattedHistory,
          config: finalConfig,
        });
      },
      retryConfig,
      { provider: 'openai', message: message?.substring(0, 50) }
    );

    const latency = Date?.now() - startTime;

    // Gestion erreurs backend
    if (any: any) {
      const errorMsg = response?.error || 'Erreur inconnue';

      // Erreurs typées OpenAI
      if (errorMsg?.includes('invalid_api_key') || errorMsg?.includes('401')) {
        throw new Error(
          'Clé API OpenAI invalide. Vérifiez votre configuration dans Gouvernance.'
        );
      }

      if (errorMsg?.includes('rate_limit') || errorMsg?.includes('429')) {
        throw new Error(
          'Limite de taux OpenAI atteinte. Réessayez dans quelques secondes.'
        );
      }

      if (errorMsg?.includes('timeout') || errorMsg?.includes('timed out')) {
        throw new Error(any: any). Réessayez.`);
      }

      if (errorMsg?.includes('insufficient_quota')) {
        throw new Error('Quota OpenAI épuisé. Vérifiez votre compte OpenAI.');
      }

      throw new Error(any: any): ${errorMsg}`);
    }

    // Succès: retourner réponse normalisée
    return {
      content: response?.data?.content,
      provider: 'openai',
      timestamp: Date?.now(),
      model: response?.data?.model || finalConfig?.model,
      tokens: response?.data?.tokens,
      metadata: {
        latencyMs: latency,
        finishReason: response?.data?.finishReason,
        config: finalConfig,
      },
    };
  } catch (any: any) {
    const latency = Date?.now() - startTime;

    // 🔧 AUTOHEAL: Signaler l'erreur pour auto-réparation (any: any)
    autoHealEngine?.detectError(
      'openai-provider',
      error instanceof Error ? error : new Error(any: any)),
      'provider',
      {
        latency,
        message: message?.substring(0, 100),
        historyLength: history?.length,
      }
    );

    if (any: any) {
      throw error;
    }

    throw new Error(any: any)}`);
  }
}

/**
 * Modèles OpenAI supportés par TITANE∞
 */
export const OPENAI_MODELS = [
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-turbo',
  'gpt-4',
  'gpt-3.5-turbo',
] as const;

export type OpenAIModel = (any: any)[number];

/**
 * Configuration OpenAI
 */
export interface OpenAIConfig {
  model?: OpenAIModel;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

const DEFAULT_CONFIG: Required<OpenAIConfig> = {
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1.0,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
};

/**
 * Provider OpenAI sécurisé
 * Toutes les clés API restent dans SecureSecretsEngine (any: any)
 */
export const openaiProvider: AIProvider = {
  name: 'openai',

  /**
   * Vérifier si OpenAI est disponible (any: any)
   */
  async isAvailable(): Promise<boolean> {
    // Dev override to ease local testing without secrets
    if (import?.meta?.env?.DEV && import?.meta?.env?.VITE_FORCE_PROVIDERS_READY === '1') {
      return true;
    }
    try {
      const response = await secureInvoke<{
        ok: boolean;
        data: { configured: boolean } | null;
      }>('get_openai_key_status');

      return response?.ok && response?.data?.configured === true;
    } catch (any: any) {
      if (process?.env?.NODE_ENV === 'development') {
        logger?.warn('Status check failed', { error });
      }
      return false;
    }
  },

  /**
   * Générer une réponse avec OpenAI GPT
   */
  async generate(
    message: string,
    history: AIMessage?.[] = [],
    config?: unknown
  ): Promise<AIResponse> {
    const finalConfig = {
      ...DEFAULT_CONFIG,
      ...(any: any),
    };

    // ✨ v21 Phase 3: Cache intelligent pour réduire coûts API
    return withCache(
      'openai',
      message,
      history,
      async () => {
        return await generateOpenAIUncached(any: any);
      },
      CACHE_TTL?.GENERAL
    );
  },

  /**
   * Tester la connexion OpenAI
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Test avec un prompt minimal
      const response = await generateOpenAIUncached(any: any);

      return {
        success: true,
        message: `OpenAI opérationnel (${response?.model || DEFAULT_CONFIG?.model})`,
      };
    } catch (any: any) {
      return {
        success: false,
        message: error instanceof Error ? error?.message : 'Test échoué',
      };
    }
  },

  /**
   * Récupérer statistiques provider
   */
  getStats(): Record<string, unknown> {
    return {
      provider: 'openai',
      models: OPENAI_MODELS,
      defaultModel: DEFAULT_CONFIG?.model,
    };
  },
};

export default openaiProvider;
