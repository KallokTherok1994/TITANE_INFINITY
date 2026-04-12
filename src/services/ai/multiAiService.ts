/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v28.0 — Multi-AI Orchestrator Service
 *   Frontend service for multi-provider AI generation with
 *   intelligent routing, fallback, fusion, and cache.
 * ═══════════════════════════════════════════════════════════════════
 */

import { tauriClient } from '@/lib/tauriClient';
import { createLogger } from '@/utils/logger';

const logger = createLogger('MultiAiService');

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

/** AI generation modes matching backend AiMode enum */
export type AiMode = 'fast' | 'quality' | 'deep' | 'creative' | 'analysis';

/** AI response metadata */
export interface AiResponseMetadata {
  mode: string;
  temperature_used: number | null;
  finish_reason: string | null;
  cached: boolean;
  fallback_triggered: boolean;
  evaluation_score: number | null;
}

/** AI response from multi-provider orchestrator */
export interface MultiAiResponse {
  output: string;
  provider: string;
  model: string;
  tokens_in: number;
  tokens_out: number;
  latency_ms: number;
  confidence: number;
  metadata: AiResponseMetadata;
}

/** Dual response (two providers in parallel) */
export interface DualAiResponse {
  primary: MultiAiResponse;
  secondary: MultiAiResponse | null;
}

/** Response quality evaluation */
export interface EvaluationResult {
  score: number;
  hallucination_risk: number;
  coherence: number;
  relevance: number;
  warnings: string[];
  recommendations: string[];
}

/** Cache statistics */
export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  total_saved_ms: number;
  hit_rate: number;
}

/** Fusion strategy for multi-provider generation */
export type FusionStrategy = 'best_only' | 'combine' | 'enrich' | 'weighted';

// ═══════════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════════

/**
 * Multi-AI Orchestrator service.
 * Provides typed access to the Rust multi-provider AI system.
 */
export const multiAiService = {
  /**
   * Generate AI response with intelligent routing and automatic fallback.
   * The orchestrator routes to the best provider based on mode, cost, and availability.
   */
  async generate(
    prompt: string,
    mode: AiMode = 'quality',
    options?: {
      userId?: string;
      sessionId?: string;
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<MultiAiResponse> {
    try {
      const result = await tauriClient.multiAiGenerate({
        prompt,
        mode,
        userId: options?.userId ?? 'default',
        sessionId: options?.sessionId ?? crypto.randomUUID(),
        maxTokens: options?.maxTokens,
        temperature: options?.temperature,
      });
      return result as MultiAiResponse;
    } catch (error: unknown) {
      logger.warn('multiAiGenerate failed', { error: String(error) });
      throw error;
    }
  },

  /**
   * Generate responses from two providers in parallel for comparison.
   */
  async generateDual(
    prompt: string,
    mode: AiMode = 'quality',
    options?: { userId?: string; sessionId?: string }
  ): Promise<DualAiResponse> {
    try {
      const result = await tauriClient.multiAiGenerateDual({
        prompt,
        mode,
        userId: options?.userId ?? 'default',
        sessionId: options?.sessionId ?? crypto.randomUUID(),
      });
      return result as DualAiResponse;
    } catch (error: unknown) {
      logger.warn('multiAiGenerateDual failed', { error: String(error) });
      throw error;
    }
  },

  /**
   * Generate with intelligent fusion of multiple provider outputs.
   */
  async generateFused(
    prompt: string,
    mode: AiMode = 'quality',
    fusionStrategy?: FusionStrategy,
    options?: { userId?: string; sessionId?: string }
  ): Promise<MultiAiResponse> {
    try {
      const result = await tauriClient.multiAiGenerateFused({
        prompt,
        mode,
        userId: options?.userId ?? 'default',
        sessionId: options?.sessionId ?? crypto.randomUUID(),
        fusionStrategy,
      });
      return result as MultiAiResponse;
    } catch (error: unknown) {
      logger.warn('multiAiGenerateFused failed', { error: String(error) });
      throw error;
    }
  },

  /**
   * Get list of currently available AI providers.
   */
  async getProviders(): Promise<string[]> {
    try {
      return (await tauriClient.multiAiProviders()) as string[];
    } catch (error: unknown) {
      logger.warn('multiAiProviders failed', { error: String(error) });
      return [];
    }
  },

  /**
   * Get the best provider for a given mode.
   */
  async getBestProvider(mode: AiMode): Promise<string | null> {
    try {
      return (await tauriClient.multiAiBestProvider(mode)) as string | null;
    } catch (error: unknown) {
      logger.warn('multiAiBestProvider failed', { error: String(error) });
      return null;
    }
  },

  /**
   * Evaluate the quality of an AI response (hallucination, coherence, relevance).
   */
  async evaluate(
    prompt: string,
    response: MultiAiResponse,
    mode: AiMode
  ): Promise<EvaluationResult> {
    try {
      return (await tauriClient.multiAiEvaluate({
        prompt,
        response,
        mode,
      })) as EvaluationResult;
    } catch (error: unknown) {
      logger.warn('multiAiEvaluate failed', { error: String(error) });
      throw error;
    }
  },

  /**
   * Enable or disable automatic fallback to alternative providers.
   */
  async setFallback(enabled: boolean): Promise<void> {
    try {
      await tauriClient.multiAiSetFallback(enabled);
    } catch (error: unknown) {
      logger.warn('multiAiSetFallback failed', { error: String(error) });
      throw error;
    }
  },

  /**
   * Configure API keys for providers at runtime.
   * Keys are stored securely in the Rust backend.
   */
  async configureKeys(keys: {
    claudeKey?: string;
    openaiKey?: string;
    geminiKey?: string;
  }): Promise<void> {
    try {
      await tauriClient.multiAiConfigureKeys(keys);
    } catch (error: unknown) {
      logger.warn('multiAiConfigureKeys failed', { error: String(error) });
      throw error;
    }
  },

  /**
   * Get cache statistics (hit rate, misses, evictions, saved latency).
   */
  async getCacheStats(): Promise<CacheStats> {
    try {
      return (await tauriClient.multiAiCacheStats()) as CacheStats;
    } catch (error: unknown) {
      logger.warn('multiAiCacheStats failed', { error: String(error) });
      return { hits: 0, misses: 0, evictions: 0, total_saved_ms: 0, hit_rate: 0 };
    }
  },

  /**
   * Clear the AI response cache.
   */
  async clearCache(): Promise<void> {
    try {
      await tauriClient.multiAiClearCache();
    } catch (error: unknown) {
      logger.warn('multiAiClearCache failed', { error: String(error) });
      throw error;
    }
  },
};
