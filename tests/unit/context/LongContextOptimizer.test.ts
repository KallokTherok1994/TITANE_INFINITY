/**
 * TITANE∞ v24.30 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * LONG CONTEXT OPTIMIZER - TEST SUITE
 * Tests for context compression & optimization (Phase 6)
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LongContextOptimizer, type ContextMessage } from '../../src/core/context/LongContextOptimizer';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

import { invoke } from '@tauri-apps/api/core';
const mockInvoke = vi.mocked(invoke);

describe('LongContextOptimizer', () => {
  let optimizer: LongContextOptimizer;

  beforeEach(() => {
    vi.clearAllMocks();
    optimizer = LongContextOptimizer.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = LongContextOptimizer.getInstance();
      const instance2 = LongContextOptimizer.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('compressContext', () => {
    it('should compress long context to target ratio', async () => {
      const messages: ContextMessage[] = Array.from({ length: 100 }, (_, i) => ({
        id: `msg_${i}`,
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i} with some content`,
        tokens: 50,
        timestamp: Date.now() - (100 - i) * 1000,
        importance: 0.5,
      }));

      mockInvoke.mockResolvedValueOnce({
        original_messages: messages,
        compressed_messages: messages.slice(0, 20),
        original_tokens: 5000,
        compressed_tokens: 1000,
        compression_ratio: 0.2,
        semantic_preservation: 0.94,
        removed_noise: ['Duplicate messages', 'Low importance messages'],
        prioritized_segments: ['Recent conversation', 'Important decisions'],
        execution_time_ms: 250,
      });

      const result = await optimizer.compressContext(messages, {
        maxTokens: 1500,
        targetRatio: 0.2,
      });

      expect(result.compressed_messages.length).toBeLessThan(messages.length);
      expect(result.compression_ratio).toBeLessThan(1.0);
      expect(result.semantic_preservation).toBeGreaterThan(0.9);
    });

    it('should preserve recent messages', async () => {
      const messages: ContextMessage[] = Array.from({ length: 50 }, (_, i) => ({
        id: `msg_${i}`,
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
        tokens: 30,
        timestamp: Date.now() - (50 - i) * 1000,
        importance: 0.5,
      }));

      mockInvoke.mockResolvedValueOnce({
        original_messages: messages,
        compressed_messages: [...messages.slice(0, 20), ...messages.slice(-10)],
        original_tokens: 1500,
        compressed_tokens: 900,
        compression_ratio: 0.6,
        semantic_preservation: 0.96,
        removed_noise: [],
        prioritized_segments: [],
        execution_time_ms: 150,
      });

      const result = await optimizer.compressContext(messages, {
        preserveRecent: 10,
      });

      const recentMessageIds = messages.slice(-10).map(m => m.id);
      const compressedIds = result.compressed_messages.map(m => m.id);

      // All recent messages should be preserved
      recentMessageIds.forEach(id => {
        expect(compressedIds).toContain(id);
      });
    });

    it('should not compress if already under limit', async () => {
      const messages: ContextMessage[] = [
        { id: 'msg_1', role: 'user', content: 'Hello', tokens: 10, timestamp: Date.now(), importance: 0.8 },
        { id: 'msg_2', role: 'assistant', content: 'Hi!', tokens: 5, timestamp: Date.now(), importance: 0.8 },
      ];

      const result = await optimizer.compressContext(messages, {
        maxTokens: 1000,
      });

      expect(result.compressed_messages.length).toBe(messages.length);
      expect(result.compression_ratio).toBe(1.0);
    });
  });

  describe('semanticGrouping', () => {
    it('should group messages by semantic similarity', async () => {
      const messages: ContextMessage[] = [
        { id: '1', role: 'user', content: 'What is the weather?', tokens: 10, timestamp: Date.now(), importance: 0.5 },
        { id: '2', role: 'assistant', content: 'Sunny, 25°C', tokens: 8, timestamp: Date.now(), importance: 0.5 },
        { id: '3', role: 'user', content: 'Tell me a joke', tokens: 10, timestamp: Date.now(), importance: 0.5 },
        { id: '4', role: 'user', content: 'Will it rain tomorrow?', tokens: 10, timestamp: Date.now(), importance: 0.5 },
      ];

      mockInvoke.mockResolvedValueOnce({
        clusters: [
          {
            id: 'group_weather',
            messages: [messages[0], messages[1], messages[3]],
            centroid: [0.8, 0.2, 0.1],
            topic: 'weather',
            importance: 0.6,
            coherence_score: 0.85,
          },
          {
            id: 'group_humor',
            messages: [messages[2]],
            centroid: [0.1, 0.9, 0.1],
            topic: 'humor',
            importance: 0.4,
            coherence_score: 1.0,
          },
        ],
      });

      const result = await optimizer.semanticGrouping(messages);

      expect(result.length).toBe(2);
      expect(result[0].topic).toBe('weather');
      expect(result[0].messages.length).toBe(3);
      expect(result[1].topic).toBe('humor');
      expect(result[1].messages.length).toBe(1);
    });

    it('should use K-means algorithm by default', async () => {
      const messages: ContextMessage[] = Array.from({ length: 20 }, (_, i) => ({
        id: `msg_${i}`,
        role: 'user',
        content: `Message ${i}`,
        tokens: 15,
        timestamp: Date.now(),
        importance: 0.5,
      }));

      mockInvoke.mockResolvedValueOnce({ clusters: [] });

      await optimizer.semanticGrouping(messages);

      expect(mockInvoke).toHaveBeenCalledWith('context_semantic_grouping', {
        messages,
        numGroups: expect.any(Number),
        algorithm: 'kmeans',
        minGroupSize: 2,
      });
    });
  });

  describe('selectiveInjection', () => {
    it('should inject only relevant messages', async () => {
      const baseContext: ContextMessage[] = [
        { id: 'base_1', role: 'user', content: 'Current topic', tokens: 10, timestamp: Date.now(), importance: 0.8 },
      ];

      const additionalContext: ContextMessage[] = [
        { id: 'add_1', role: 'assistant', content: 'Related info', tokens: 10, timestamp: Date.now() - 5000, importance: 0.7 },
        { id: 'add_2', role: 'user', content: 'Unrelated topic', tokens: 10, timestamp: Date.now() - 10000, importance: 0.3 },
      ];

      mockInvoke.mockResolvedValueOnce({
        base_context: baseContext,
        injected_messages: [additionalContext[0]],
        final_context: [...baseContext, additionalContext[0]],
        relevance_scores: [0.85, 0.35],
        total_tokens: 20,
      });

      const result = await optimizer.selectiveInjection(baseContext, additionalContext, {
        relevanceThreshold: 0.6,
      });

      expect(result.injected_messages.length).toBe(1);
      expect(result.injected_messages[0].id).toBe('add_1');
      expect(result.final_context.length).toBe(2);
    });

    it('should limit number of injected messages', async () => {
      const baseContext: ContextMessage[] = [
        { id: 'base_1', role: 'user', content: 'Test', tokens: 10, timestamp: Date.now(), importance: 0.8 },
      ];

      const additionalContext: ContextMessage[] = Array.from({ length: 20 }, (_, i) => ({
        id: `add_${i}`,
        role: 'assistant',
        content: `Additional ${i}`,
        tokens: 10,
        timestamp: Date.now(),
        importance: 0.7,
      }));

      mockInvoke.mockResolvedValueOnce({
        base_context: baseContext,
        injected_messages: additionalContext.slice(0, 5),
        final_context: [...baseContext, ...additionalContext.slice(0, 5)],
        relevance_scores: additionalContext.map(() => 0.8),
        total_tokens: 60,
      });

      const result = await optimizer.selectiveInjection(baseContext, additionalContext, {
        maxInjected: 5,
      });

      expect(result.injected_messages.length).toBeLessThanOrEqual(5);
    });
  });

  describe('removeNoise', () => {
    it('should remove duplicate messages', async () => {
      const messages: ContextMessage[] = [
        { id: '1', role: 'user', content: 'Hello', tokens: 5, timestamp: Date.now(), importance: 0.5 },
        { id: '2', role: 'user', content: 'Hello', tokens: 5, timestamp: Date.now(), importance: 0.5 },
        { id: '3', role: 'assistant', content: 'Hi!', tokens: 5, timestamp: Date.now(), importance: 0.8 },
      ];

      mockInvoke.mockResolvedValueOnce({
        original_messages: messages,
        cleaned_messages: [messages[0], messages[2]],
        removed_duplicates: 1,
        removed_low_relevance: 0,
        removed_contradictions: 0,
        removed_circular: 0,
      });

      const result = await optimizer.removeNoise(messages);

      expect(result.cleaned_messages.length).toBe(2);
      expect(result.removed_duplicates).toBe(1);
    });

    it('should remove low-importance messages', async () => {
      const messages: ContextMessage[] = [
        { id: '1', role: 'user', content: 'Important', tokens: 10, timestamp: Date.now(), importance: 0.9 },
        { id: '2', role: 'user', content: 'Not important', tokens: 10, timestamp: Date.now(), importance: 0.1 },
        { id: '3', role: 'assistant', content: 'Response', tokens: 10, timestamp: Date.now(), importance: 0.8 },
      ];

      mockInvoke.mockResolvedValueOnce({
        original_messages: messages,
        cleaned_messages: [messages[0], messages[2]],
        removed_duplicates: 0,
        removed_low_relevance: 1,
        removed_contradictions: 0,
        removed_circular: 0,
      });

      const result = await optimizer.removeNoise(messages, {
        minImportance: 0.5,
      });

      expect(result.cleaned_messages.length).toBe(2);
      expect(result.removed_low_relevance).toBe(1);
    });

    it('should apply all noise removal strategies', async () => {
      const messages: ContextMessage[] = Array.from({ length: 10 }, (_, i) => ({
        id: `msg_${i}`,
        role: 'user',
        content: `Message ${i}`,
        tokens: 10,
        timestamp: Date.now(),
        importance: 0.5,
      }));

      mockInvoke.mockResolvedValueOnce({
        original_messages: messages,
        cleaned_messages: messages.slice(0, 6),
        removed_duplicates: 2,
        removed_low_relevance: 1,
        removed_contradictions: 1,
        removed_circular: 0,
      });

      const result = await optimizer.removeNoise(messages, {
        removeDuplicates: true,
        removeLowRelevance: true,
        removeContradictions: true,
        removeCircular: true,
      });

      expect(result.removed_duplicates + result.removed_low_relevance +
             result.removed_contradictions + result.removed_circular).toBe(4);
    });
  });

  describe('gateContext', () => {
    it('should filter messages by importance threshold', async () => {
      const messages: ContextMessage[] = [
        { id: '1', role: 'user', content: 'High importance', tokens: 10, timestamp: Date.now(), importance: 0.9 },
        { id: '2', role: 'user', content: 'Medium importance', tokens: 10, timestamp: Date.now(), importance: 0.6 },
        { id: '3', role: 'user', content: 'Low importance', tokens: 10, timestamp: Date.now(), importance: 0.3 },
      ];

      mockInvoke.mockResolvedValueOnce({
        all_messages: messages,
        gated_messages: [messages[0]],
        threshold: 0.7,
        passed_count: 1,
        rejected_count: 2,
      });

      const result = await optimizer.gateContext(messages, {
        threshold: 0.7,
      });

      expect(result.gated_messages.length).toBe(1);
      expect(result.gated_messages[0].importance).toBeGreaterThanOrEqual(0.7);
    });

    it('should preserve system messages regardless of importance', async () => {
      const messages: ContextMessage[] = [
        { id: '1', role: 'system', content: 'System prompt', tokens: 20, timestamp: Date.now(), importance: 0.5 },
        { id: '2', role: 'user', content: 'User message', tokens: 10, timestamp: Date.now(), importance: 0.4 },
      ];

      mockInvoke.mockResolvedValueOnce({
        all_messages: messages,
        gated_messages: [messages[0]],
        threshold: 0.7,
        passed_count: 1,
        rejected_count: 1,
      });

      const result = await optimizer.gateContext(messages, {
        threshold: 0.7,
        preserveSystemMessages: true,
      });

      const systemMessage = result.gated_messages.find(m => m.role === 'system');
      expect(systemMessage).toBeDefined();
    });
  });

  describe('linkConversations', () => {
    it('should create semantic links between chats', async () => {
      const chats = [
        {
          id: 'chat_1',
          messages: [
            { id: '1', role: 'user', content: 'Weather in Paris', tokens: 10, timestamp: Date.now(), importance: 0.5 },
          ],
        },
        {
          id: 'chat_2',
          messages: [
            { id: '2', role: 'user', content: 'Paris temperature', tokens: 10, timestamp: Date.now(), importance: 0.5 },
          ],
        },
      ];

      mockInvoke.mockResolvedValueOnce({
        chat_ids: ['chat_1', 'chat_2'],
        linked_messages: new Map([
          ['chat_1', chats[0].messages],
          ['chat_2', chats[1].messages],
        ]),
        semantic_links: [
          { from: 'chat_1:1', to: 'chat_2:2', similarity: 0.87 },
        ],
        merged_context: [...chats[0].messages, ...chats[1].messages],
      });

      const result = await optimizer.linkConversations(chats, {
        similarityThreshold: 0.8,
      });

      expect(result.chat_ids.length).toBe(2);
      expect(result.semantic_links.length).toBeGreaterThan(0);
      expect(result.semantic_links[0].similarity).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe('optimizeFullContext', () => {
    it('should apply complete optimization pipeline', async () => {
      const messages: ContextMessage[] = Array.from({ length: 100 }, (_, i) => ({
        id: `msg_${i}`,
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
        tokens: 40,
        timestamp: Date.now(),
        importance: Math.random(),
      }));

      // Mock all pipeline steps
      mockInvoke
        .mockResolvedValueOnce({ cleaned_messages: messages, removed_duplicates: 5, removed_low_relevance: 3, removed_contradictions: 0, removed_circular: 0 }) // removeNoise
        .mockResolvedValueOnce({ gated_messages: messages.slice(0, 70), threshold: 0.7, passed_count: 70, rejected_count: 30 }) // gateContext
        .mockResolvedValueOnce({ clusters: [] }) // semanticGrouping
        .mockResolvedValueOnce({
          compressed_messages: messages.slice(0, 30),
          original_tokens: 4000,
          compressed_tokens: 1200,
          compression_ratio: 0.3,
          semantic_preservation: 0.92,
          removed_noise: [],
          prioritized_segments: [],
          execution_time_ms: 0,
        }); // compressContext

      const result = await optimizer.optimizeFullContext(messages, {
        maxTokens: 2000,
        enableGrouping: true,
        enableNoiseRemoval: true,
        enableGating: true,
      });

      expect(result.compressed_messages.length).toBeLessThan(messages.length);
      expect(result.compression_ratio).toBeLessThan(1.0);
      expect(result.semantic_preservation).toBeGreaterThan(0.9);
    });
  });

  describe('Helper Methods', () => {
    it('should calculate message importance correctly', () => {
      const context: ContextMessage[] = [
        { id: '1', role: 'system', content: 'System', tokens: 10, timestamp: Date.now(), importance: 0 },
        { id: '2', role: 'user', content: 'Old message', tokens: 10, timestamp: Date.now() - 10000, importance: 0 },
        { id: '3', role: 'user', content: 'Recent message', tokens: 10, timestamp: Date.now(), importance: 0 },
      ];

      const systemImportance = optimizer.calculateImportance(context[0], context);
      const oldImportance = optimizer.calculateImportance(context[1], context);
      const recentImportance = optimizer.calculateImportance(context[2], context);

      expect(systemImportance).toBe(1.0); // System messages always important
      expect(recentImportance).toBeGreaterThan(oldImportance); // Recent > old
    });

    it('should estimate tokens correctly', () => {
      const text = 'This is a test message';
      const tokens = optimizer.estimateTokens(text);

      // ~1 token per 4 characters
      expect(tokens).toBeCloseTo(text.length / 4, 2);
    });

    it('should create context message with correct fields', () => {
      const message = optimizer.createContextMessage('user', 'Hello world');

      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello world');
      expect(message.tokens).toBeGreaterThan(0);
      expect(message.timestamp).toBeDefined();
      expect(message.importance).toBe(0.5); // default
    });
  });
});
