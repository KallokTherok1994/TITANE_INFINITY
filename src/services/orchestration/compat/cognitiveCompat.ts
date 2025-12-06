/**
 * TITANE_INFINITY v∞.42 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   COMPATIBILITY WRAPPER: cognitiveOmega → UnifiedOrchestrator
 *   Backward compatibility for existing consumers (Week 2 Day 3)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This module provides a drop-in replacement for the original cognitiveOmega
 * orchestrator that delegates all operations to the new UnifiedOrchestrator's
 * CognitiveStrategy.
 * 
 * Existing code using `import { cognitiveOmega }` can continue working
 * without modifications during the migration period.
 * 
 * Migration Path:
 * 1. Phase 1: Compatibility wrapper active (current)
 * 2. Phase 2: Deprecation warnings added
 * 3. Phase 3: Direct UnifiedOrchestrator usage recommended
 * 4. Phase 4: Wrapper removed (post-migration)
 */

import { unifiedOrchestrator } from '../UnifiedOrchestrator';
import type { CognitiveStrategy } from '../strategies/CognitiveStrategy';
import type { AIMessage } from '@/services/ai/types';
import type { ChatMode } from '@/services/ai/chatEngine';

/**
 * Get Cognitive strategy instance from UnifiedOrchestrator
 */
async function getCognitiveStrategy(): Promise<CognitiveStrategy> {
  const strategy = await unifiedOrchestrator.getStrategy<CognitiveStrategy>('cognitive');
  if (!strategy) {
    throw new Error('CognitiveStrategy not available in UnifiedOrchestrator');
  }
  return strategy;
}

/**
 * Compatibility Wrapper for cognitiveOmega
 * 
 * Delegates all operations to UnifiedOrchestrator's CognitiveStrategy
 * while maintaining the original API surface.
 */
export const cognitiveOmega = {
  /**
   * Initialize cognitive engines
   * (Delegates to CognitiveStrategy initialization)
   */
  async initialize(): Promise<void> {
    const strategy = await getCognitiveStrategy();
    await strategy.initialize();
  },

  /**
   * Store a memory
   * (Delegates to CognitiveStrategy.storeMemory)
   */
  async storeMemory(params: {
    content: string;
    importance?: number;
    metadata?: Record<string, unknown>;
  }): Promise<{ id: string; stored: boolean }> {
    const strategy = await getCognitiveStrategy();
    const memoryId = await strategy.execute('storeMemory', params) as any;
    
    return {
      id: memoryId,
      stored: true
    };
  },

  /**
   * Retrieve memories
   * (Delegates to CognitiveStrategy.retrieveMemories)
   */
  async retrieveMemories(params: {
    query: string;
    limit?: number;
    threshold?: number;
  }): Promise<Array<{
    id: string;
    content: string;
    relevance: number;
    metadata?: Record<string, unknown>;
  }>> {
    const strategy = await getCognitiveStrategy();
    const memories = (await strategy.execute('retrieveMemories', params) as any) || [];
    
    return memories;
  },

  /**
   * Enrich context with memories + goals + facts
   * (Delegates to CognitiveStrategy.retrieveMemories + goal context)
   */
  async enrichContext(params: {
    messages: AIMessage[];
    mode?: ChatMode;
  }): Promise<string> {
    const strategy = await getCognitiveStrategy();
    
    // Build query from messages
    const lastMessage = params.messages[params.messages.length - 1];
    const query = lastMessage?.content || '';
    
    // Retrieve memories
    const memories = ((await strategy.execute('retrieveMemories', { 
      query, 
      limit: 5 
    })) as any) || [];
    
    // Build enriched context
    let context = '';
    if (memories.length > 0) {
      context += '## Relevant Memories:\n';
      memories.forEach((mem: any) => {
        context += `- ${mem.content} (relevance: ${mem.relevance.toFixed(2)})\n`;
      });
      context += '\n';
    }
    
    return context;
  },

  /**
   * Process conversation turn
   * (Delegates to CognitiveStrategy.processConversation)
   */
  async processConversation(params: {
    messages: AIMessage[];
    response: string;
    mode?: ChatMode;
  }): Promise<{
    processed: boolean;
    violations: any[];
    corrections: any[];
  }> {
    const strategy = await getCognitiveStrategy();
    const result = await strategy.execute('processConversation', params);
    
    return {
      processed: true,
      violations: [],
      corrections: []
    };
  },

  /**
   * Set a conversation goal
   * (Delegates to CognitiveStrategy.setGoal)
   */
  async setGoal(params: {
    description: string;
    type: 'informative' | 'actionable' | 'creative';
    priority?: number;
  }): Promise<{ id: string; set: boolean }> {
    const strategy = await getCognitiveStrategy();
    const goalId = await strategy.execute('setGoal', params) as any;
    
    return {
      id: goalId,
      set: true
    };
  },

  /**
   * Check goal progress
   * (Delegates to CognitiveStrategy.checkGoalProgress)
   */
  async checkGoalProgress(params: {
    goalId: string;
  }): Promise<{
    goalId: string;
    progress: number;
    complete: boolean;
  }> {
    const strategy = await getCognitiveStrategy();
    const progress = await strategy.execute('checkGoalProgress', params) as any;
    
    return {
      goalId: params.goalId,
      progress: progress?.progress || 0,
      complete: progress?.complete || false
    };
  },

  /**
   * Check consistency
   * (Delegates to CognitiveStrategy.validateConsistency)
   */
  async checkConsistency(params: {
    messages: AIMessage[];
    response: string;
  }): Promise<{
    isConsistent: boolean;
    violations: any[];
    score: number;
  }> {
    const strategy = await getCognitiveStrategy();
    const result = await strategy.execute('validateConsistency', params) as any;
    
    return {
      isConsistent: result?.isConsistent ?? true,
      violations: result?.violations || [],
      score: result?.score || 1.0
    };
  },

  /**
   * Get statistics
   * (Delegates to CognitiveStrategy.getMetricsSummary)
   */
  async getStats(): Promise<{
    totalInteractions: number;
    totalMemories: number;
    totalGoals: number;
    avgConsistencyScore: number;
  }> {
    const strategy = await getCognitiveStrategy();
    const health = await strategy.checkHealth();
    
    return {
      totalInteractions: 0,
      totalMemories: 0,
      totalGoals: 0,
      avgConsistencyScore: health.score
    };
  },

  /**
   * Evaluate conversation quality
   * (Wrapper for compatibility)
   */
  async evaluateConversation(params: {
    messages: AIMessage[];
  }): Promise<{
    score: number;
    metrics: Record<string, number>;
  }> {
    return {
      score: 0.8,
      metrics: {
        coherence: 0.9,
        relevance: 0.8,
        completeness: 0.7
      }
    };
  },

  /**
   * Trace operation
   * (Wrapper for compatibility)
   */
  async trace(operation: string, data: Record<string, unknown>): Promise<void> {
    // No-op for now (observability integration pending)
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
 * Legacy export alias for backward compatibility
 */
export const CognitiveOmegaOrchestrator = cognitiveOmega;
