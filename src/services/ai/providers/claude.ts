/**
 * TITANE∞ v19.3Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3Ω — ANTHROPIC CLAUDE PROVIDER (SECURE BACKEND PROXY)
 *   Intégration Claude via backend Tauri sécurisé
 *   Aucune clé API exposée côté frontend
 * ═══════════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import type { AIProvider, AIMessage, AIResponse } from '../types';
import { autoHealEngine } from '../autoHealEngine';
import { withRetry, getRetryConfig } from '../retryStrategy';
import { createLogger } from '@/utils/logger';
import { withCache, CACHE_TTL } from '../apiCache';

const logger = createLogger('[ClaudeProvider]');

async function generateClaudeUncached(
  message: string,
  history: AIMessage[],
  finalConfig: Required<ClaudeConfig>
): Promise<AIResponse> {
  const startTime = Date.now();

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
    const retryConfig = getRetryConfig('claude');

    const response = await withRetry(
      async () => {
        return await secureInvoke<{
          ok: boolean;
          data: {
            content: string;
            model?: string;
            tokens?: number;
            stopReason?: string;
          } | null;
          error: string | null;
        }>('chat_generate_claude', {
          message: message.trim(),
          history: formattedHistory,
          config: finalConfig,
        });
      },
      retryConfig,
      { provider: 'claude', message: message.substring(0, 50) }
    );

    const latency = Date.now() - startTime;

    // Gestion erreurs backend
    if (!response.ok || !response.data) {
      const errorMsg = response.error || 'Erreur inconnue';

      // Erreurs typées Claude
      if (errorMsg.includes('invalid_api_key') || errorMsg.includes('401')) {
        throw new Error(
          'Clé API Anthropic invalide. Vérifiez votre configuration dans Gouvernance.'
        );
      }

      if (errorMsg.includes('rate_limit') || errorMsg.includes('429')) {
        throw new Error(
          'Limite de taux Anthropic atteinte. Réessayez dans quelques secondes.'
        );
      }

      if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
        throw new Error(`Délai d'attente Claude dépassé (${latency}ms). Réessayez.`);
      }

      if (errorMsg.includes('overloaded') || errorMsg.includes('529')) {
        throw new Error('Serveurs Claude surchargés. Réessayez dans un instant.');
      }

      if (errorMsg.includes('insufficient_quota')) {
        throw new Error('Quota Anthropic épuisé. Vérifiez votre compte Anthropic.');
      }

      throw new Error(`Erreur Claude (${latency}ms): ${errorMsg}`);
    }

    // Succès: retourner réponse normalisée
    return {
      content: response.data.content,
      provider: 'claude',
      timestamp: Date.now(),
      model: response.data.model || finalConfig.model,
      tokens: response.data.tokens,
      metadata: {
        latencyMs: latency,
        stopReason: response.data.stopReason,
        config: finalConfig,
      },
    };
  } catch (error) {
    const latency = Date.now() - startTime;

    // 🔧 AUTOHEAL: Signaler l'erreur pour auto-réparation (direct instance)
    autoHealEngine.detectError(
      'claude-provider',
      error instanceof Error ? error : new Error(String(error)),
      'provider',
      {
        latency,
        message: message.substring(0, 100),
        historyLength: history.length,
      }
    );

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(`Erreur Claude (${latency}ms): ${String(error)}`);
  }
}

/**
 * Modèles Claude supportés par TITANE∞
 */
export const CLAUDE_MODELS = [
  'claude-3-5-sonnet-20241022',
  'claude-3-5-haiku-20241022',
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229',
  'claude-3-haiku-20240307',
] as const;

export type ClaudeModel = (typeof CLAUDE_MODELS)[number];

/**
 * Configuration Claude
 */
export interface ClaudeConfig {
  model?: ClaudeModel;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

const DEFAULT_CONFIG: Required<ClaudeConfig> = {
  model: 'claude-3-5-sonnet-20241022',
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1.0,
  topK: 40,
};

/**
 * Provider Anthropic Claude sécurisé
 * Toutes les clés API restent dans SecureSecretsEngine (Rust)
 */
export const claudeProvider: AIProvider = {
  name: 'claude',

  /**
   * Vérifier si Claude est disponible (clé configurée)
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await secureInvoke<{
        ok: boolean;
        data: { configured: boolean } | null;
      }>('get_anthropic_key_status');

      return response.ok && response.data?.configured === true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Status check failed', { error });
      }
      return false;
    }
  },

  /**
   * Générer une réponse avec Claude
   */
  async generate(
    message: string,
    history: AIMessage[] = [],
    config?: unknown
  ): Promise<AIResponse> {
    const finalConfig = {
      ...DEFAULT_CONFIG,
      ...(config as Partial<ClaudeConfig> | undefined),
    };

    // ✨ v21 Phase 3: Cache intelligent pour réduire coûts API
    return withCache(
      'claude',
      message,
      history,
      async () => {
        return await generateClaudeUncached(message, history, finalConfig);
      },
      CACHE_TTL.GENERAL
    );
  },

  /**
   * Tester la connexion Claude
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Test avec un prompt minimal
      // Utilise un prompt spécifique pour éviter les collisions de cache entre tests
      // (le cache est basé sur provider+message+history et peut ignorer la config).
      const response = await generateClaudeUncached(
        '__claude_connection_test__',
        [],
        DEFAULT_CONFIG
      );

      return {
        success: true,
        message: `Claude opérationnel (${response.model || DEFAULT_CONFIG.model})`,
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
      provider: 'claude',
      models: CLAUDE_MODELS,
      defaultModel: DEFAULT_CONFIG.model,
    };
  },
};

export default claudeProvider;
