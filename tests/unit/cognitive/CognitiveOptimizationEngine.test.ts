/**
 * TITANE∞ v24.30 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * COGNITIVE OPTIMIZATION ENGINE - TEST SUITE
 * Tests for cognitive IA optimization (Phase 2)
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CognitiveOptimizationEngine } from '../../src/core/cognitive/CognitiveOptimizationEngine';
import type { CognitiveMessage } from '../../src/core/cognitive/CognitiveOptimizationEngine';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

import { invoke } from '@tauri-apps/api/core';
const mockInvoke = vi.mocked(invoke);

describe('CognitiveOptimizationEngine', () => {
  let engine: CognitiveOptimizationEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    engine = CognitiveOptimizationEngine.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = CognitiveOptimizationEngine.getInstance();
      const instance2 = CognitiveOptimizationEngine.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('analyzeIntention', () => {
    it('should analyze user intention correctly', async () => {
      mockInvoke.mockResolvedValueOnce({
        intention: 'request_information',
        confidence: 0.92,
        entities: ['weather', 'Paris'],
        sentiment: 'neutral',
      });

      const result = await engine.analyzeIntention('What is the weather in Paris?');

      expect(mockInvoke).toHaveBeenCalledWith('cognitive_analyze_intention', {
        message: 'What is the weather in Paris?',
      });
      expect(result.intention).toBe('request_information');
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('should handle ambiguous messages', async () => {
      mockInvoke.mockResolvedValueOnce({
        intention: 'unclear',
        confidence: 0.45,
        entities: [],
        sentiment: 'neutral',
      });

      const result = await engine.analyzeIntention('hello');

      expect(result.confidence).toBeLessThan(0.5);
    });
  });

  describe('checkCoherence', () => {
    it('should validate coherent responses', async () => {
      mockInvoke.mockResolvedValueOnce({
        is_coherent: true,
        coherence_score: 0.95,
        inconsistencies: [],
        corrected_response: null,
      });

      const result = await engine.checkCoherence(
        'The weather in Paris is sunny today.',
        { messages: [], total_tokens: 50, compression_ratio: 1.0 }
      );

      expect(result.is_coherent).toBe(true);
      expect(result.coherence_score).toBeGreaterThan(0.9);
    });

    it('should detect incoherent responses', async () => {
      mockInvoke.mockResolvedValueOnce({
        is_coherent: false,
        coherence_score: 0.4,
        inconsistencies: ['Response contradicts previous statement'],
        corrected_response: 'Corrected version here',
      });

      const result = await engine.checkCoherence(
        'The sky is red and the grass is purple.',
        { messages: [], total_tokens: 50, compression_ratio: 1.0 }
      );

      expect(result.is_coherent).toBe(false);
      expect(result.inconsistencies.length).toBeGreaterThan(0);
      expect(result.corrected_response).toBeDefined();
    });
  });

  describe('optimizeLongContext', () => {
    it('should compress long context effectively', async () => {
      const messages: CognitiveMessage[] = Array.from({ length: 50 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
        tokens: 20,
        importance: 0.5,
      }));

      mockInvoke.mockResolvedValueOnce({
        compressed_messages: messages.slice(0, 20),
        compression_ratio: 0.4,
        tokens_saved: 600,
        semantic_preservation: 0.92,
      });

      const result = await engine.optimizeLongContext(messages);

      expect(result.compressed_messages.length).toBeLessThan(messages.length);
      expect(result.compression_ratio).toBeLessThan(1.0);
      expect(result.semantic_preservation).toBeGreaterThan(0.9);
    });
  });

  describe('memoryGating', () => {
    it('should retrieve relevant memories', async () => {
      mockInvoke.mockResolvedValueOnce({
        relevant_memories: [
          { content: 'User prefers dark mode', similarity: 0.85 },
          { content: 'User timezone: UTC+1', similarity: 0.78 },
        ],
        threshold: 0.7,
        retrieved_count: 2,
      });

      const result = await engine.memoryGating('user preferences', 0.7);

      expect(result.relevant_memories.length).toBe(2);
      expect(result.relevant_memories[0].similarity).toBeGreaterThan(0.7);
    });

    it('should respect similarity threshold', async () => {
      mockInvoke.mockResolvedValueOnce({
        relevant_memories: [],
        threshold: 0.9,
        retrieved_count: 0,
      });

      const result = await engine.memoryGating('random query', 0.9);

      expect(result.relevant_memories.length).toBe(0);
    });
  });

  describe('clusterSemanticMessages', () => {
    it('should group messages by semantic similarity', async () => {
      const messages: CognitiveMessage[] = [
        { role: 'user', content: 'Tell me about weather', tokens: 10, importance: 0.5 },
        { role: 'assistant', content: 'The weather is sunny', tokens: 10, importance: 0.5 },
        { role: 'user', content: 'What about Paris?', tokens: 10, importance: 0.5 },
        { role: 'user', content: 'Tell me a joke', tokens: 10, importance: 0.5 },
      ];

      mockInvoke.mockResolvedValueOnce({
        clusters: [
          {
            id: 'cluster_0',
            messages: [messages[0], messages[1], messages[2]],
            centroid: [0.5, 0.3, 0.2],
            topic: 'weather',
          },
          {
            id: 'cluster_1',
            messages: [messages[3]],
            centroid: [0.1, 0.7, 0.2],
            topic: 'humor',
          },
        ],
      });

      const result = await engine.clusterSemanticMessages(messages);

      expect(result.length).toBe(2);
      expect(result[0].messages.length).toBe(3);
      expect(result[1].messages.length).toBe(1);
    });
  });

  describe('removeNoise', () => {
    it('should remove duplicate messages', async () => {
      const messages: CognitiveMessage[] = [
        { role: 'user', content: 'Hello', tokens: 5, importance: 0.5 },
        { role: 'user', content: 'Hello', tokens: 5, importance: 0.5 },
        { role: 'assistant', content: 'Hi there!', tokens: 5, importance: 0.8 },
      ];

      mockInvoke.mockResolvedValueOnce({
        cleaned_messages: [messages[0], messages[2]],
        removed_count: 1,
        removal_reasons: ['duplicate'],
      });

      const result = await engine.removeNoise(messages);

      expect(result.length).toBe(2);
    });

    it('should remove low-importance messages', async () => {
      const messages: CognitiveMessage[] = [
        { role: 'user', content: 'Important message', tokens: 10, importance: 0.9 },
        { role: 'user', content: 'Not important', tokens: 5, importance: 0.1 },
        { role: 'assistant', content: 'Response', tokens: 10, importance: 0.8 },
      ];

      mockInvoke.mockResolvedValueOnce({
        cleaned_messages: [messages[0], messages[2]],
        removed_count: 1,
        removal_reasons: ['low_importance'],
      });

      const result = await engine.removeNoise(messages);

      expect(result.length).toBe(2);
      expect(result.every(m => m.importance > 0.5)).toBe(true);
    });
  });

  describe('Short-Term Cache', () => {
    it('should cache and retrieve results', async () => {
      const key = 'test_query';
      const value = { result: 'cached value' };

      engine['shortTermCache'].set(key, value);
      const cached = engine['shortTermCache'].get(key);

      expect(cached).toEqual(value);
    });

    it('should respect max cache size (FIFO)', () => {
      const maxSize = 100;

      // Fill cache beyond max
      for (let i = 0; i < maxSize + 10; i++) {
        engine['shortTermCache'].set(`key_${i}`, { value: i });
      }

      expect(engine['shortTermCache'].size).toBeLessThanOrEqual(maxSize);

      // First entries should be evicted
      expect(engine['shortTermCache'].has('key_0')).toBe(false);
      expect(engine['shortTermCache'].has(`key_${maxSize + 9}`)).toBe(true);
    });
  });

  describe('optimizeFullPipeline', () => {
    it('should execute complete optimization pipeline', async () => {
      const history: CognitiveMessage[] = [
        { role: 'user', content: 'Hello', tokens: 5, importance: 0.5 },
        { role: 'assistant', content: 'Hi!', tokens: 5, importance: 0.5 },
      ];

      mockInvoke
        .mockResolvedValueOnce({ intention: 'greeting', confidence: 0.9, entities: [], sentiment: 'positive' }) // analyzeIntention
        .mockResolvedValueOnce({ relevant_memories: [], threshold: 0.7, retrieved_count: 0 }) // memoryGating
        .mockResolvedValueOnce({ compressed_messages: history, compression_ratio: 1.0, tokens_saved: 0, semantic_preservation: 1.0 }) // optimizeLongContext
        .mockResolvedValueOnce({ clusters: [] }) // clusterSemanticMessages
        .mockResolvedValueOnce({ cleaned_messages: history, removed_count: 0, removal_reasons: [] }); // removeNoise

      const result = await engine.optimizeFullPipeline('How are you?', history);

      expect(result.intention).toBeDefined();
      expect(result.optimized_context).toBeDefined();
      expect(result.pipeline_duration_ms).toBeGreaterThanOrEqual(0);
    });

    it('should trigger auto-compression for long contexts', async () => {
      const longHistory: CognitiveMessage[] = Array.from({ length: 200 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
        tokens: 250, // Total: 50k tokens
        importance: 0.5,
      }));

      mockInvoke
        .mockResolvedValueOnce({ intention: 'request', confidence: 0.8, entities: [], sentiment: 'neutral' })
        .mockResolvedValueOnce({ relevant_memories: [], threshold: 0.7, retrieved_count: 0 })
        .mockResolvedValueOnce({
          compressed_messages: longHistory.slice(0, 50),
          compression_ratio: 0.25,
          tokens_saved: 37500,
          semantic_preservation: 0.93,
        })
        .mockResolvedValueOnce({ clusters: [] })
        .mockResolvedValueOnce({ cleaned_messages: longHistory.slice(0, 50), removed_count: 0, removal_reasons: [] });

      const result = await engine.optimizeFullPipeline('Test message', longHistory);

      expect(result.optimized_context.total_tokens).toBeLessThan(50000);
      expect(result.optimized_context.compression_ratio).toBeLessThan(1.0);
    });
  });
});
