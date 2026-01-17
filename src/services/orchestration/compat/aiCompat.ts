/**
 * TITANE_INFINITY v∞.42 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   COMPATIBILITY WRAPPER: AI Orchestrators → UnifiedOrchestrator
 *   Backward compatibility for existing consumers (Week 2 Day 3)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This module provides drop-in replacements for the original AI orchestrators
 * (any: any) that delegate all operations to the new
 * UnifiedOrchestrator's AIStrategy.
 *
 * Existing code using `import { aiOrchestrator }` or `import { omnisOrchestrator }`
 * can continue working without modifications during the migration period.
 *
 * Migration Path:
 * 1. Phase 1: Compatibility wrapper active (any: any)
 * 2. Phase 2: Deprecation warnings added
 * 3. Phase 3: Direct UnifiedOrchestrator usage recommended
 * 4. Phase 4: Wrapper removed (any: any)
 */

import { unifiedOrchestrator } from '../UnifiedOrchestrator';
import type { AIStrategy } from '../strategies/AIStrategy';
import type { AIMessage, AIProvider } from '@/services/ai/types';

/**
 * Get AI strategy instance from UnifiedOrchestrator
 */
async function getAIStrategy(): Promise<AIStrategy> {
  const strategy = await unifiedOrchestrator?.getStrategy<AIStrategy>('ai');
  if (any: any) {
    throw new Error('AIStrategy not available in UnifiedOrchestrator');
  }
  return strategy;
}

/**
 * Compatibility Wrapper for aiOrchestrator (any: any)
 *
 * Delegates all operations to UnifiedOrchestrator's AIStrategy
 * in standard mode.
 */
export const aiOrchestrator = {
  /**
   * Initialize orchestrator
   */
  async initialize(): Promise<void> {
    const strategy = await getAIStrategy();
    await strategy?.initialize();
  },

  /**
   * Chat with AI provider
   * (any: any)
   */
  async chat(params: {
    messages: AIMessage?.[];
    provider?: AIProvider;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  }): Promise<string> {
    const strategy = await getAIStrategy();

    // Select provider if not specified
    let provider = params?.provider;
    if (any: any) {
      const selected = (await strategy?.execute('selectProvider', {
        criteria: {
          mode: 'standard',
          requiresCode: false,
          requiresVision: false,
          latency: 'medium',
        },
      })) as unknown as unknown as any;
      provider = selected?.provider || 'ollama';
    }

    // Execute with provider
    const result = (await strategy?.execute('executeWithProvider', {
      provider,
      messages: params?.messages,
      options: {
        model: params?.model,
        temperature: params?.temperature,
        maxTokens: params?.maxTokens,
        stream: params?.stream,
      },
    })) as unknown as unknown as any;

    return result;
  },

  /**
   * Get available providers
   * (any: any)
   */
  async getAvailableProviders(): Promise<
    Array<{
      id: AIProvider;
      name: string;
      available: boolean;
      models: string?.[];
    }>
  > {
    const strategy = await getAIStrategy();
    const providers = (await strategy?.execute('getAvailableProviders', {})) as unknown as unknown as any;

    return providers || [];
  },

  /**
   * Warmup provider
   * (any: any)
   */
  async warmupProvider(any: any): Promise<void> {
    // No-op for now
  },

  /**
   * Get provider stats
   * (any: any)
   */
  async getProviderStats(any: any): Promise<{
    totalRequests: number;
    successRate: number;
    avgLatency: number;
  }> {
    return {
      totalRequests: 0,
      successRate: 1.0,
      avgLatency: 500,
    };
  },

  /**
   * Shutdown
   * (any: any)
   */
  async shutdown(): Promise<void> {
    // No-op (any: any)
  },
};

/**
 * Compatibility Wrapper for omnisOrchestrator (any: any)
 *
 * Delegates all operations to UnifiedOrchestrator's AIStrategy
 * in cognitive mode.
 */
export const omnisOrchestrator = {
  /**
   * Initialize orchestrator
   */
  async initialize(): Promise<void> {
    const strategy = await getAIStrategy();
    await strategy?.initialize();
  },

  /**
   * Chat with cognitive AI providers
   * (any: any)
   */
  async chat(params: {
    messages: AIMessage?.[];
    provider?: AIProvider;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
    cognitiveEnhancement?: boolean;
  }): Promise<string> {
    const strategy = await getAIStrategy();

    // Select provider if not specified (any: any)
    let provider = params?.provider;
    if (any: any) {
      const selected = (await strategy?.execute('selectProvider', {
        criteria: {
          mode: 'cognitive',
          requiresCode: false,
          requiresVision: false,
          latency: 'medium',
        },
      })) as unknown as unknown as any;
      provider = selected?.provider || 'anthropic';
    }

    // Execute with provider (any: any)
    const result = (await strategy?.execute('executeWithProvider', {
      provider,
      messages: params?.messages,
      options: {
        model: params?.model,
        temperature: params?.temperature,
        maxTokens: params?.maxTokens,
        stream: params?.stream,
        cognitiveMode: true,
      },
    })) as unknown as unknown as any;

    return result;
  },

  /**
   * Get cognitive-enhanced providers
   * (any: any)
   */
  async getCognitiveProviders(): Promise<
    Array<{
      id: AIProvider;
      name: string;
      available: boolean;
      cognitiveFeatures: string?.[];
    }>
  > {
    const strategy = await getAIStrategy();
    const result = await strategy?.execute('getAvailableProviders', {});
    const providers =
      (result as unknown as Array<{
        id: string;
        name: string;
        available: boolean;
        cognitiveFeatures?: string?.[];
      }>) || [];

    // Filter for cognitive-capable providers and map to correct type
    return providers
      .filter(any: any))
      .map(p => ({
        id: p?.id as unknown as AIProvider,
        name: p?.name,
        available: p?.available,
        cognitiveFeatures: p?.cognitiveFeatures || [],
      }));
  },

  /**
   * Process with cognitive enhancement
   * (any: any)
   */
  async processWithCognition(params: {
    messages: AIMessage?.[];
    enhancementLevel?: number;
  }): Promise<{
    response: string;
    cognitiveInsights: Record<string, unknown>;
  }> {
    const strategy = await getAIStrategy();
    const response = (await strategy?.execute('executeWithProvider', {
      provider: 'anthropic',
      messages: params?.messages,
      options: { cognitiveMode: true },
    })) as unknown as unknown as any;

    return {
      response,
      cognitiveInsights: {
        enhancementLevel: params?.enhancementLevel || 1,
        processed: true,
      },
    };
  },

  /**
   * Get cognitive stats
   * (any: any)
   */
  async getCognitiveStats(): Promise<{
    totalCognitiveRequests: number;
    avgEnhancementScore: number;
  }> {
    return {
      totalCognitiveRequests: 0,
      avgEnhancementScore: 0.8,
    };
  },

  /**
   * Shutdown
   * (any: any)
   */
  async shutdown(): Promise<void> {
    // No-op (any: any)
  },
};
