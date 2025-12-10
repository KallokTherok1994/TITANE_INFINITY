/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.LOCAL — AI PIPELINE
 *   Routing intelligent local/cloud avec fallback automatique
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import type { AIRequest, AIResponse, AIConfig, AIModelConfig } from '@/types/aiModel';
import { AI_MODELS, isLocalModel } from '@/types/aiModel';

/**
 * Pipeline IA unifié avec routing automatique
 */
export class AIPipeline {
  private config: AIConfig;
  private streamListeners: Map<string, (chunk: string) => void> = new Map();

  constructor(config: AIConfig) {
    this.config = config;
    this.initializeStreamListener();
  }

  /**
   * Initialise l'écoute des événements de streaming
   */
  private async initializeStreamListener() {
    await listen<{ content: string; done: boolean; model: string }>(
      'ai-stream-chunk',
      event => {
        const { content } = event.payload;
        // Émettre vers tous les listeners actifs
        this.streamListeners.forEach(callback => callback(content));
      }
    );
  }

  /**
   * Génération IA principale avec routing automatique
   */
  async generate(request: AIRequest): Promise<AIResponse> {
    const modelConfig = AI_MODELS[request.provider];

    try {
      if (isLocalModel(request.provider)) {
        return await this.generateLocal(request);
      } else {
        return await this.generateCloud(request);
      }
    } catch (error) {
      console.error(`Erreur avec ${request.provider}:`, error);

      // Fallback automatique si activé
      if (this.config.fallbackEnabled && modelConfig.fallback) {
        console.warn(`Fallback vers ${modelConfig.fallback}...`);
        return await this.generate({
          ...request,
          provider: modelConfig.fallback,
        });
      }

      throw error;
    }
  }

  /**
   * Génération locale via Ollama
   */
  private async generateLocal(request: AIRequest): Promise<AIResponse> {
    const startTime = performance.now();

    try {
      const response = await invoke<{
        content: string;
        model: string;
        done: boolean;
        eval_count?: number;
        total_duration?: number;
      }>('ai_generate_local', {
        request: {
          prompt: request.prompt,
          model: AI_MODELS[request.provider].modelName,
          stream: false,
          system: request.systemPrompt,
          temperature: request.temperature,
          max_tokens: request.maxTokens,
        },
      });

      const latency = performance.now() - startTime;

      return {
        content: response.content,
        provider: request.provider,
        usedFallback: false,
        model: response.model,
        tokensUsed: response.eval_count,
        latency: Math.round(latency),
      };
    } catch (error) {
      throw new Error(
        `Erreur génération locale: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Génération cloud via API externe
   */
  private async generateCloud(request: AIRequest): Promise<AIResponse> {
    const startTime = performance.now();
    const modelConfig = AI_MODELS[request.provider];

    try {
      // TODO: Implémenter appels API Gemini/GPT/Claude
      // Pour l'instant, retourner un placeholder

      const response = await this.mockCloudGeneration(request, modelConfig);
      const latency = performance.now() - startTime;

      return {
        content: response.content,
        provider: request.provider,
        usedFallback: false,
        model: modelConfig.modelName,
        tokensUsed: response.tokensUsed,
        latency: Math.round(latency),
      };
    } catch (error) {
      throw new Error(
        `Erreur génération cloud: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Génération en streaming (local uniquement pour l'instant)
   */
  async generateStream(
    request: AIRequest,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    if (!isLocalModel(request.provider)) {
      throw new Error('Streaming uniquement disponible pour les modèles locaux');
    }

    // Enregistrer le callback
    const listenerId = Math.random().toString(36).substring(7);
    this.streamListeners.set(listenerId, onChunk);

    try {
      await invoke('ai_generate_local_stream', {
        request: {
          prompt: request.prompt,
          model: AI_MODELS[request.provider].modelName,
          stream: true,
          system: request.systemPrompt,
          temperature: request.temperature,
          max_tokens: request.maxTokens,
        },
      });
    } finally {
      // Nettoyer le listener
      this.streamListeners.delete(listenerId);
    }
  }

  /**
   * Scanner les modèles locaux disponibles
   */
  async scanLocalModels(): Promise<string[]> {
    try {
      return await invoke<string[]>('ai_scan_local_models');
    } catch (error) {
      console.error('Erreur scan modèles locaux:', error);
      return [];
    }
  }

  /**
   * Vérifier le statut Ollama
   */
  async checkOllamaStatus(): Promise<{
    available: boolean;
    version?: string;
    models: string[];
  }> {
    try {
      return await invoke('ai_check_ollama_status');
    } catch (error) {
      return {
        available: false,
        version: undefined,
        models: [],
      };
    }
  }

  /**
   * Définir le modèle local par défaut
   */
  async setLocalModel(modelName: string): Promise<string> {
    try {
      return await invoke<string>('ai_set_local_model', { modelName });
    } catch (error) {
      throw new Error(
        `Erreur définition modèle local: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Mock génération cloud (placeholder)
   */
  private async mockCloudGeneration(
    request: AIRequest,
    config: AIModelConfig
  ): Promise<{ content: string; tokensUsed: number }> {
    // TODO: Remplacer par vraies implémentations API
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      content: `[MOCK RESPONSE from ${config.modelName}]\n\nPrompt reçu: "${request.prompt}"\n\nCeci est une réponse de test. Implémentation API à venir.`,
      tokensUsed: 50,
    };
  }

  /**
   * Mise à jour de la configuration
   */
  updateConfig(newConfig: Partial<AIConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Obtenir la configuration actuelle
   */
  getConfig(): AIConfig {
    return { ...this.config };
  }
}

/**
 * Instance globale du pipeline (singleton)
 */
let globalPipeline: AIPipeline | null = null;

/**
 * Obtenir ou créer l'instance globale
 */
export function getAIPipeline(config?: AIConfig): AIPipeline {
  if (!globalPipeline) {
    if (!config) {
      throw new Error('AIPipeline non initialisé. Fournissez une config.');
    }
    globalPipeline = new AIPipeline(config);
  }
  return globalPipeline;
}

/**
 * Réinitialiser l'instance globale (tests uniquement)
 */
export function resetAIPipeline() {
  globalPipeline = null;
}
