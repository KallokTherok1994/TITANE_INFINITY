/**
 * TITANE∞ v19.3Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3Ω — OPENAI PROVIDER (SECURE BACKEND PROXY)
 *   Intégration GPT-4 / GPT-4o via backend Tauri sécurisé
 *   Aucune clé API exposée côté frontend
 * ═══════════════════════════════════════════════════════════════════
 */

import { invoke } from '@tauri-apps/api/core';
import type { AIProvider, AIMessage, AIResponse } from '../types';

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

export type OpenAIModel = typeof OPENAI_MODELS[number];

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
 * Toutes les clés API restent dans SecureSecretsEngine (Rust)
 */
export const openaiProvider: AIProvider = {
  name: 'openai',

  /**
   * Vérifier si OpenAI est disponible (clé configurée)
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await invoke<{
        ok: boolean;
        data: { configured: boolean } | null;
      }>('get_openai_key_status');

      return response.ok && response.data?.configured === true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[OpenAIProvider] Status check failed:', error);
      }
      return false;
    }
  },

  /**
   * Générer une réponse avec OpenAI GPT
   */
  async generate(
    message: string,
    history: AIMessage[] = [],
    config?: Partial<OpenAIConfig>
  ): Promise<AIResponse> {
    const startTime = Date.now();
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    try {
      // Validation input
      if (!message?.trim()) {
        throw new Error('Message vide');
      }

      // Conversion history vers format backend
      const formattedHistory = history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Appel backend sécurisé
      const response = await invoke<{
        ok: boolean;
        data: {
          content: string;
          model?: string;
          tokens?: number;
          finishReason?: string;
        } | null;
        error: string | null;
      }>('chat_generate_openai', {
        message: message.trim(),
        history: formattedHistory,
        config: finalConfig,
      });

      const latency = Date.now() - startTime;

      // Gestion erreurs backend
      if (!response.ok || !response.data) {
        const errorMsg = response.error || 'Erreur inconnue';

        // Erreurs typées OpenAI
        if (errorMsg.includes('invalid_api_key') || errorMsg.includes('401')) {
          throw new Error(
            'Clé API OpenAI invalide. Vérifiez votre configuration dans Gouvernance.'
          );
        }

        if (errorMsg.includes('rate_limit') || errorMsg.includes('429')) {
          throw new Error(
            'Limite de taux OpenAI atteinte. Réessayez dans quelques secondes.'
          );
        }

        if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
          throw new Error(`Délai d'attente OpenAI dépassé (${latency}ms). Réessayez.`);
        }

        if (errorMsg.includes('insufficient_quota')) {
          throw new Error('Quota OpenAI épuisé. Vérifiez votre compte OpenAI.');
        }

        throw new Error(`Erreur OpenAI (${latency}ms): ${errorMsg}`);
      }

      // Succès: retourner réponse normalisée
      return {
        content: response.data.content,
        provider: 'openai',
        timestamp: Date.now(),
        model: response.data.model || finalConfig.model,
        tokens: response.data.tokens,
        metadata: {
          latencyMs: latency,
          finishReason: response.data.finishReason,
          config: finalConfig,
        },
      };
    } catch (error) {
      const latency = Date.now() - startTime;

      // Re-throw erreurs typées
      if (error instanceof Error) {
        throw error;
      }

      // Erreur générique
      throw new Error(
        `Erreur OpenAI (${latency}ms): ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Tester la connexion OpenAI
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Test avec un prompt minimal
      const response = await this.generate('Test', []);

      return {
        success: true,
        message: `OpenAI opérationnel (${response.model || 'gpt-4o-mini'})`,
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
      provider: 'openai',
      models: OPENAI_MODELS,
      defaultModel: DEFAULT_CONFIG.model,
    };
  },
};

export default openaiProvider;
