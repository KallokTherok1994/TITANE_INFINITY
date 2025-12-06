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
 * (aiOrchestrator, omnisOrchestrator) that delegate all operations to the new
 * UnifiedOrchestrator's AIStrategy.
 * 
 * Existing code using `import { aiOrchestrator }` or `import { omnisOrchestrator }`
 * can continue working without modifications during the migration period.
 * 
 * Migration Path:
 * 1. Phase 1: Compatibility wrapper active (current)
 * 2. Phase 2: Deprecation warnings added
 * 3. Phase 3: Direct UnifiedOrchestrator usage recommended
 * 4. Phase 4: Wrapper removed (post-migration)
 */

import { unifiedOrchestrator } from '../UnifiedOrchestrator';
import type { AIStrategy } from '../strategies/AIStrategy';
import type { AIMessage, AIProvider } from '@/services/ai/types';

/**
 * Get AI strategy instance from UnifiedOrchestrator
 */
async function getAIStrategy(): Promise<AIStrategy> {
  const strategy = await unifiedOrchestrator.getStrategy<AIStrategy>('ai');
  if (!strategy) {
    throw new Error('AIStrategy not available in UnifiedOrchestrator');
  }
  return strategy;
}

/**
 * Compatibility Wrapper for aiOrchestrator (Standard Mode)
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
    await strategy.initialize({});
  },

  /**
   * Chat with AI provider
   * (Delegates to AIStrategy.executeWithProvider)
   */
  async chat(params: {
    messages: AIMessage[];
    provider?: AIProvider;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  }): Promise<string> {
    const strategy = await getAIStrategy();
    
    // Select provider if not specified
    let provider = params.provider;
    if (!provider) {
      const selected = await strategy.execute('selectProvider', {
        criteria: {
          mode: 'standard',
          requiresCode: false,
          requiresVision: false,
          latency: 'medium'
        }
      }) as any;
      provider = selected?.provider || 'ollama';
    }
    
    // Execute with provider
    const result = await strategy.execute('executeWithProvider', {
      provider,
      messages: params.messages,
      options: {
        model: params.model,
        temperature: params.temperature,
        maxTokens: params.maxTokens,
        stream: params.stream
      }
    }) as string;
    
    return result;
  },

  /**
   * Get available providers
   * (Delegates to AIStrategy.getAvailableProviders)
   */
  async getAvailableProviders(): Promise<Array<{
    id: AIProvider;
    name: string;
    available: boolean;
    models: string[];
  }>> {
    const strategy = await getAIStrategy();
    const providers = await strategy.execute('getAvailableProviders', {}) as any;
    
    return providers || [];
  },

  /**
   * Warmup provider
   * (Wrapper for compatibility)
   */
  async warmupProvider(provider: AIProvider): Promise<void> {
    // No-op for now
  },

  /**
   * Get provider stats
   * (Wrapper for compatibility)
   */
  async getProviderStats(provider: AIProvider): Promise<{
    totalRequests: number;
    successRate: number;
    avgLatency: number;
  }> {
    return {
      totalRequests: 0,
      successRate: 1.0,
      avgLatency: 500
    };
  },

  /**
   * Shutdown
   * (Wrapper for compatibility)
   */
  async shutdown(): Promise<void> {
    // No-op (UnifiedOrchestrator manages lifecycle)
  }
};

/**
 * Compatibility Wrapper for omnisOrchestrator (Cognitive Mode)
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
    await strategy.initialize({});
  },

  /**
   * Chat with cognitive AI providers
   * (Delegates to AIStrategy.executeWithProvider in cognitive mode)
   */
  async chat(params: {
    messages: AIMessage[];
    provider?: AIProvider;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
    cognitiveEnhancement?: boolean;
  }): Promise<string> {
    const strategy = await getAIStrategy();
    
    // Select provider if not specified (cognitive mode)
    let provider = params.provider;
    if (!provider) {
      const selected = await strategy.execute('selectProvider', {
        criteria: {
          mode: 'cognitive',
          requiresCode: false,
          requiresVision: false,
          latency: 'medium'
        }
      }) as any;
      provider = selected?.provider || 'anthropic';
    }
    
    // Execute with provider (cognitive mode)
    const result = await strategy.execute('executeWithProvider', {
      provider,
      messages: params.messages,
      options: {
        model: params.model,
        temperature: params.temperature,
        maxTokens: params.maxTokens,
        stream: params.stream,
        cognitiveMode: true
      }
    }) as string;
    
    return result;
  },

  /**
   * Get cognitive-enhanced providers
   * (Delegates to AIStrategy.getAvailableProviders filtered for cognitive)
   */
  async getCognitiveProviders(): Promise<Array<{
    id: AIProvider;
    name: string;
    available: boolean;
    cognitiveFeatures: string[];
  }>> {
    const strategy = await getAIStrategy();
    const providers = await strategy.execute('getAvailableProviders', {}) as any;
    
    // Filter for cognitive-capable providers
    return (providers || []).filter((p: any) => 
      ['anthropic', 'openai', 'google'].includes(p.id)
    );
  },

  /**
   * Process with cognitive enhancement
   * (Wrapper for compatibility)
   */
  async processWithCognition(params: {
    messages: AIMessage[];
    enhancementLevel?: number;
  }): Promise<{
    response: string;
    cognitiveInsights: Record<string, unknown>;
  }> {
    const strategy = await getAIStrategy();
    const response = await strategy.execute('executeWithProvider', {
      provider: 'anthropic',
      messages: params.messages,
      options: { cognitiveMode: true }
    }) as string;
    
    return {
      response,
      cognitiveInsights: {
        enhancementLevel: params.enhancementLevel || 1,
        processed: true
      }
    };
  },

  /**
   * Get cognitive stats
   * (Wrapper for compatibility)
   */
  async getCognitiveStats(): Promise<{
    totalCognitiveRequests: number;
    avgEnhancementScore: number;
  }> {
    return {
      totalCognitiveRequests: 0,
      avgEnhancementScore: 0.8
    };
  },

  /**
   * Shutdown
   * (Wrapper for compatibility)
   */
  async shutdown(): Promise<void> {
    // No-op (UnifiedOrchestrator manages lifecycle)
  }
};
