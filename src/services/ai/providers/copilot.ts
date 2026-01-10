/**
 * TITANE∞ v26.3 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v26.3 — COPILOT PROVIDER
 *   GitHub Copilot / Models API via backend Rust
 *   Unified AI Provider Architecture
 * ═══════════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import type { AIProvider, AIMessage, AIResponse } from '../types';
import { autoHealEngine } from '../system';
import { logger } from '../../../utils/logger';
import { withRetry, getRetryConfig } from '../retryStrategy';
import { withCache, CACHE_TTL } from '../apiCache';

/**
 * Modèles Copilot disponibles (via GitHub Models API)
 */
export const COPILOT_MODELS = ['gpt-4', 'gpt-4o', 'gpt-3.5-turbo'] as const;

export type CopilotModel = (typeof COPILOT_MODELS)[number];

export interface CopilotConfig {
  model: CopilotModel;
  temperature: number;
  maxTokens: number;
}

const DEFAULT_CONFIG: CopilotConfig = {
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2048,
};

/**
 * Provider GitHub Copilot (v26.3)
 * Utilise backend Rust via chat_generate_copilot command
 */
export const copilotProvider: AIProvider = {
  name: 'copilot',

  /**
   * Vérifier si Copilot est disponible (token GitHub configuré)
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await secureInvoke<{
        configured: boolean;
        status: string;
      }>('get_copilot_key_status');

      return response.configured === true && response.status === 'ok';
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Copilot status check failed', { error });
      }
      return false;
    }
  },

  /**
   * Générer une réponse avec GitHub Copilot
   */
  async generate(
    message: string,
    history: AIMessage[] = [],
    config?: unknown
  ): Promise<AIResponse> {
    const startTime = Date.now();
    const finalConfig = {
      ...DEFAULT_CONFIG,
      ...(config as Partial<CopilotConfig> | undefined),
    };

    // ✨ Cache intelligent pour réduire coûts API
    return withCache(
      'copilot',
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

          // ✨ Retry strategy pour gérer rate limits GitHub
          const response = await withRetry(
            async () => {
              const result = await secureInvoke<{
                ok: boolean;
                data: {
                  content: string;
                  model?: string;
                  tokens?: number;
                  finish_reason?: string;
                } | null;
                error?: string;
              }>('chat_generate_copilot', {
                message,
                history: formattedHistory,
                config: {
                  model: finalConfig.model,
                  temperature: finalConfig.temperature,
                  max_tokens: finalConfig.maxTokens,
                },
              });

              if (!result.ok || !result.data) {
                throw new Error(result.error || 'Erreur Copilot inconnue');
              }

              return result;
            },
            {
              ...getRetryConfig('copilot'),
              shouldRetry: (error: unknown) => {
                // Retry sur rate limits uniquement
                const message = error instanceof Error ? error.message : String(error);
                return (
                  message.includes('Limite de taux') ||
                  message.includes('429') ||
                  message.includes('rate limit')
                );
              },
            }
          );

          if (!response.ok || !response.data) {
            throw new Error(response.error || 'Réponse Copilot invalide');
          }

          const latency = Date.now() - startTime;

          // Log pour monitoring
          if (process.env.NODE_ENV === 'development') {
            logger.info('Copilot response', {
              model: response.data.model || finalConfig.model,
              tokens: response.data.tokens,
              latency,
              finish_reason: response.data.finish_reason,
            });
          }

          return {
            content: response.data.content,
            provider: 'copilot',
            timestamp: Date.now(),
            model: response.data.model || finalConfig.model,
            tokens: response.data.tokens,
            metadata: {
              model: response.data.model || finalConfig.model,
              tokensUsed: response.data.tokens,
              latencyMs: latency,
              cached: false,
              finishReason: response.data.finish_reason || 'stop',
            },
          };
        } catch (error) {
          const latency = Date.now() - startTime;

          // Log error
          logger.error('Copilot generation failed', {
            error,
            message: error instanceof Error ? error.message : String(error),
            latency,
          });

          // Auto-healing: detect error for monitoring
          if (autoHealEngine) {
            try {
              const healError = autoHealEngine.detectError(
                'copilot',
                error instanceof Error ? error : new Error(String(error))
              );

              if (healError) {
                logger.info('Auto-healing: error detected', {
                  errorId: healError.id,
                  type: healError.type,
                });
              }
            } catch (healError) {
              logger.warn('Auto-heal detection failed for Copilot', { healError });
            }
          }

          // Propagate error with context
          throw new Error(
            error instanceof Error
              ? error.message
              : 'Erreur lors de la génération Copilot'
          );
        }
      },
      CACHE_TTL.TECHNICAL // 5 minutes cache for Copilot (technical queries)
    );
  },

  /**
   * Tester la connexion Copilot
   */
  async testConnection(): Promise<{
    success: boolean;
    message: string;
    latency?: number;
  }> {
    try {
      const startTime = Date.now();

      const result = await secureInvoke<{
        success: boolean;
        message: string;
        latency_ms?: number;
        available_models?: string[];
      }>('test_copilot_connection');

      const latency = Date.now() - startTime;

      if (result.success) {
        logger.info('Copilot connection test OK', {
          latency: result.latency_ms || latency,
          models: result.available_models,
        });
      } else {
        logger.warn('Copilot connection test failed', {
          message: result.message,
        });
      }

      return {
        success: result.success,
        message: result.message,
        latency: result.latency_ms || latency,
      };
    } catch (error) {
      logger.error('Copilot test connection error', { error });
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur de test',
      };
    }
  },
};

/**
 * Helper function to configure Copilot API key
 * (Not part of AIProvider interface, separate utility)
 */
export async function setCopilotApiKey(apiKey: string): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const result = await secureInvoke<{
      configured: boolean;
      status: string;
      message?: string;
    }>('chat_set_copilot_key', { apiKey });

    if (result.configured) {
      logger.info('Copilot key configured successfully');
    } else {
      logger.warn('Copilot key configuration failed', {
        status: result.status,
        message: result.message,
      });
    }

    return {
      success: result.configured,
      message: result.message,
    };
  } catch (error) {
    logger.error('Copilot set API key error', { error });
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erreur de configuration',
    };
  }
}

/**
 * Export default pour compatibilité
 */
export default copilotProvider;

/**
 * Helper: vérifier le format du token GitHub
 */
export function isValidGitHubToken(token: string): boolean {
  if (!token || token.trim().length < 16) {
    return false;
  }

  // Format attendu: ghp_xxx ou github_pat_xxx ou gho_xxx
  return (
    token.startsWith('ghp_') ||
    token.startsWith('github_pat_') ||
    token.startsWith('gho_')
  );
}

/**
 * Helper: obtenir le statut Copilot
 */
export async function getCopilotStatus(): Promise<{
  configured: boolean;
  available: boolean;
  status: string;
  message?: string;
}> {
  try {
    const statusResult = await secureInvoke<{
      configured: boolean;
      status: string;
      message?: string;
    }>('get_copilot_key_status');

    const available = await copilotProvider.isAvailable();

    return {
      configured: statusResult.configured,
      available,
      status: statusResult.status,
      message: statusResult.message,
    };
  } catch (error) {
    logger.error('Get Copilot status failed', { error });
    return {
      configured: false,
      available: false,
      status: 'error',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
