/**
 * TITANE∞ v24.30 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  LongContextOptimizer,
  type ContextMessage,
  type CompressionResult,
  type SemanticGroup,
  type InjectionResult,
  type NoiseRemovalResult,
  type GatingResult,
  type CrossChatContext,
} from '@/core/context/LongContextOptimizer';
import { invoke } from '@tauri-apps/api/core';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

const mockInvoke = vi.mocked(invoke);

const createMessage = (overrides: Partial<ContextMessage> = {}): ContextMessage => ({
  id: overrides.id || `msg_${Math.random()}`,
  role: overrides.role ?? 'user',
  content: overrides.content ?? 'message',
  tokens: overrides.tokens ?? 10,
  timestamp: overrides.timestamp ?? Date.now(),
  importance: overrides.importance ?? 0.5,
  semantic_vector: overrides.semantic_vector,
  metadata: overrides.metadata,
});

const cleanupSpies = (...spies: Array<{ mockRestore: () => void }>) => {
  spies.forEach(spy => spy.mockRestore());
};

describe('LongContextOptimizer', () => {
  let optimizer: LongContextOptimizer;
  let perfNow = 0;

  beforeEach(() => {
    vi.clearAllMocks();
    perfNow = 0;
    (globalThis as any).performance = {
      now: vi.fn(() => {
        perfNow += 5;
        return perfNow;
      }),
    };
    optimizer = LongContextOptimizer.getInstance();
  });

  describe('Singleton', () => {
    it('returns the same instance every time', () => {
      expect(optimizer).toBe(LongContextOptimizer.getInstance());
    });
  });

  describe('compressContext', () => {
    it('invokes backend compression when token budget is exceeded', async () => {
      const messages = Array.from({ length: 50 }, (_, idx) =>
        createMessage({ id: `msg_${idx}`, tokens: 100 })
      );
      const backendResult: CompressionResult = {
        original_messages: messages,
        compressed_messages: messages.slice(-10),
        original_tokens: 5000,
        compressed_tokens: 800,
        compression_ratio: 0.16,
        semantic_preservation: 0.95,
        removed_noise: ['duplicates'],
        prioritized_segments: ['recent'],
        execution_time_ms: 0,
      };
      mockInvoke.mockResolvedValueOnce(backendResult);

      const result = await optimizer.compressContext(messages, {
        maxTokens: 2000,
        targetRatio: 0.2,
        preserveRecent: 3,
        strategy: 'semantic_grouping',
      });

      expect(mockInvoke).toHaveBeenCalledWith('context_compress', {
        messages,
        maxTokens: 2000,
        targetRatio: 0.2,
        preserveRecent: 3,
        strategy: 'semantic_grouping',
      });
      expect(result.compressed_messages).toEqual(messages.slice(-10));
      expect(result.execution_time_ms).toBeGreaterThan(0);
    });

    it('short circuits when the token count is already under the limit', async () => {
      const messages = [createMessage({ tokens: 50 }), createMessage({ tokens: 40 })];

      const result = await optimizer.compressContext(messages, { maxTokens: 200 });

      expect(mockInvoke).not.toHaveBeenCalled();
      expect(result.compression_ratio).toBe(1.0);
      expect(result.compressed_tokens).toBe(result.original_tokens);
    });

    it('falls back to keeping recent messages when the backend fails', async () => {
      const messages = Array.from({ length: 10 }, (_, idx) =>
        createMessage({ id: `msg_${idx}`, tokens: 200 })
      );
      mockInvoke.mockRejectedValueOnce(new Error('offline'));

      const result = await optimizer.compressContext(messages, {
        preserveRecent: 2,
        maxTokens: 500,
      });

      expect(result.compressed_messages).toEqual(messages.slice(-2));
      expect(result.semantic_preservation).toBe(0.5);
    });
  });

  describe('semanticGrouping', () => {
    it('requests clustering with default options', async () => {
      const messages = Array.from({ length: 15 }, (_, idx) =>
        createMessage({ id: `msg_${idx}` })
      );
      const groups: SemanticGroup[] = [
        {
          id: 'g1',
          messages: messages.slice(0, 5),
          centroid: [],
          topic: 'topic',
          importance: 0.7,
          coherence_score: 0.9,
        },
      ];
      mockInvoke.mockResolvedValueOnce(groups);

      const result = await optimizer.semanticGrouping(messages);

      expect(mockInvoke).toHaveBeenCalledWith(
        'context_semantic_grouping',
        expect.objectContaining({ algorithm: 'kmeans' })
      );
      expect(result).toEqual(groups);
    });

    it('returns temporal buckets when clustering fails', async () => {
      const messages = Array.from({ length: 12 }, (_, idx) =>
        createMessage({ id: `msg_${idx}` })
      );
      mockInvoke.mockRejectedValueOnce(new Error('timeout'));

      const result = await optimizer.semanticGrouping(messages);

      const expectedGroupSize = Math.ceil(messages.length / 5);
      const expectedGroupCount = Math.ceil(messages.length / expectedGroupSize);
      expect(result).toHaveLength(expectedGroupCount);
      expect(result[0].topic).toMatch(/Group/);
    });
  });

  describe('selectiveInjection', () => {
    it('delegates relevance filtering to the backend', async () => {
      const base = [createMessage({ id: 'base' })];
      const extra = [createMessage({ id: 'extra', importance: 0.8 })];
      const injectResult: InjectionResult = {
        base_context: base,
        injected_messages: extra,
        final_context: [...base, ...extra],
        relevance_scores: [0.91],
        total_tokens: 20,
      };
      mockInvoke.mockResolvedValueOnce(injectResult);

      const result = await optimizer.selectiveInjection(base, extra, {
        relevanceThreshold: 0.7,
        maxInjected: 2,
      });

      expect(mockInvoke).toHaveBeenCalledWith('context_selective_injection', {
        baseContext: base,
        additionalContext: extra,
        relevanceThreshold: 0.7,
        maxInjected: 2,
      });
      expect(result.final_context).toEqual(injectResult.final_context);
    });

    it('returns the base context unchanged on backend errors', async () => {
      const base = [createMessage({ id: 'base' })];
      const extra = [createMessage({ id: 'extra' })];
      mockInvoke.mockRejectedValueOnce(new Error('offline'));

      const result = await optimizer.selectiveInjection(base, extra);

      expect(result.final_context).toEqual(base);
      expect(result.injected_messages).toHaveLength(0);
    });
  });

  describe('removeNoise', () => {
    it('passes selected strategies to the backend', async () => {
      const messages = [createMessage({ id: 'a' }), createMessage({ id: 'b' })];
      const noiseResult: NoiseRemovalResult = {
        original_messages: messages,
        cleaned_messages: [messages[0]],
        removed_duplicates: 1,
        removed_low_relevance: 0,
        removed_contradictions: 0,
        removed_circular: 0,
      };
      mockInvoke.mockResolvedValueOnce(noiseResult);

      const result = await optimizer.removeNoise(messages, {
        removeDuplicates: false,
        removeLowRelevance: true,
        removeContradictions: false,
        removeCircular: true,
        minImportance: 0.4,
      });

      expect(mockInvoke).toHaveBeenCalledWith('context_remove_noise', {
        messages,
        strategies: ['remove_low_relevance', 'remove_circular_references'],
        minImportance: 0.4,
      });
      expect(result.cleaned_messages).toHaveLength(1);
    });

    it('performs duplicate filtering locally when backend fails', async () => {
      const messages = [
        createMessage({ content: 'Hello' }),
        createMessage({ content: 'Hello' }),
        createMessage({ content: 'Different' }),
      ];
      mockInvoke.mockRejectedValueOnce(new Error('timeout'));

      const result = await optimizer.removeNoise(messages);

      expect(result.cleaned_messages).toHaveLength(2);
      expect(result.removed_duplicates).toBe(1);
    });
  });

  describe('gateContext', () => {
    it('filters context using backend gating', async () => {
      const messages = [
        createMessage({ importance: 0.9 }),
        createMessage({ importance: 0.4 }),
      ];
      const gatingResult: GatingResult = {
        all_messages: messages,
        gated_messages: [messages[0]],
        threshold: 0.8,
        passed_count: 1,
        rejected_count: 1,
      };
      mockInvoke.mockResolvedValueOnce(gatingResult);

      const result = await optimizer.gateContext(messages, {
        threshold: 0.8,
        preserveRecent: 1,
        preserveSystemMessages: true,
      });

      expect(mockInvoke).toHaveBeenCalledWith('context_gating', {
        messages,
        threshold: 0.8,
        preserveRecent: 1,
        preserveSystemMessages: true,
      });
      expect(result.gated_messages).toEqual([messages[0]]);
    });

    it('falls back to simple importance filtering on failure', async () => {
      const messages = [
        createMessage({ id: 'sys', role: 'system', importance: 0.1 }),
        createMessage({ id: 'old', importance: 0.1 }),
        createMessage({ id: 'recent', importance: 0.2 }),
      ];
      mockInvoke.mockRejectedValueOnce(new Error('offline'));

      const result = await optimizer.gateContext(messages, {
        threshold: 0.9,
        preserveRecent: 1,
      });

      const ids = result.gated_messages.map(m => m.id);
      expect(ids).toContain('sys');
      expect(ids).toContain('recent');
      expect(ids).not.toContain('old');
    });
  });

  describe('linkConversations', () => {
    it('requests cross-chat linking from the backend', async () => {
      const chats = [
        { id: 'chat_1', messages: [createMessage({ id: 'c1' })] },
        { id: 'chat_2', messages: [createMessage({ id: 'c2' })] },
      ];
      const crossContext: CrossChatContext = {
        chat_ids: ['chat_1', 'chat_2'],
        linked_messages: new Map([
          ['chat_1', chats[0].messages],
          ['chat_2', chats[1].messages],
        ]),
        semantic_links: [{ from: 'chat_1:c1', to: 'chat_2:c2', similarity: 0.9 }],
        merged_context: [...chats[0].messages, ...chats[1].messages],
      };
      mockInvoke.mockResolvedValueOnce(crossContext);

      const result = await optimizer.linkConversations(chats, {
        similarityThreshold: 0.85,
        maxLinks: 5,
      });

      expect(mockInvoke).toHaveBeenCalledWith('context_link_conversations', {
        chats,
        similarityThreshold: 0.85,
        maxLinks: 5,
      });
      expect(result.semantic_links).toHaveLength(1);
    });

    it('merges chats without links when the backend fails', async () => {
      const chats = [
        { id: 'chat_1', messages: [createMessage({ id: 'c1' })] },
        { id: 'chat_2', messages: [createMessage({ id: 'c2' })] },
      ];
      mockInvoke.mockRejectedValueOnce(new Error('offline'));

      const result = await optimizer.linkConversations(chats);

      expect(result.semantic_links).toHaveLength(0);
      expect(result.merged_context).toHaveLength(2);
    });
  });

  describe('optimizeFullContext', () => {
    it('chains noise removal, gating, grouping, and compression', async () => {
      const messages = Array.from({ length: 40 }, (_, idx) =>
        createMessage({ id: `msg_${idx}`, tokens: 50 })
      );
      const cleaned = messages.slice(0, 30);
      const gated = cleaned.slice(0, 20);

      const removeSpy = vi.spyOn(optimizer, 'removeNoise').mockResolvedValue({
        original_messages: messages,
        cleaned_messages: cleaned,
        removed_duplicates: 5,
        removed_low_relevance: 2,
        removed_contradictions: 0,
        removed_circular: 0,
      });
      const gateSpy = vi.spyOn(optimizer, 'gateContext').mockResolvedValue({
        all_messages: cleaned,
        gated_messages: gated,
        threshold: 0.7,
        passed_count: gated.length,
        rejected_count: cleaned.length - gated.length,
      });
      const groupSpy = vi.spyOn(optimizer, 'semanticGrouping').mockResolvedValue([
        {
          id: 'g',
          messages: gated,
          centroid: [],
          topic: 'topic',
          importance: 0.8,
          coherence_score: 0.9,
        },
      ]);
      const compressSpy = vi.spyOn(optimizer, 'compressContext').mockResolvedValue({
        original_messages: gated,
        compressed_messages: gated.slice(0, 5),
        original_tokens: 1000,
        compressed_tokens: 250,
        compression_ratio: 0.25,
        semantic_preservation: 0.97,
        removed_noise: [],
        prioritized_segments: ['topic'],
        execution_time_ms: 10,
      });

      const result = await optimizer.optimizeFullContext(messages, {
        maxTokens: 300,
        enableGrouping: true,
        enableNoiseRemoval: true,
        enableGating: true,
        targetCompressionRatio: 0.3,
      });

      expect(removeSpy).toHaveBeenCalled();
      expect(gateSpy).toHaveBeenCalled();
      expect(groupSpy).toHaveBeenCalled();
      expect(compressSpy).toHaveBeenCalled();
      expect(result.compressed_messages).toHaveLength(5);

      cleanupSpies(removeSpy, gateSpy, groupSpy, compressSpy);
    });
  });

  describe('Helpers', () => {
    it('assigns higher importance to system and recent messages', () => {
      const context = [
        createMessage({ id: 'system', role: 'system', importance: 0 }),
        createMessage({ id: 'old', timestamp: Date.now() - 10000 }),
        createMessage({ id: 'recent', timestamp: Date.now() }),
      ];

      const systemImportance = optimizer.calculateImportance(context[0], context);
      const oldImportance = optimizer.calculateImportance(context[1], context);
      const recentImportance = optimizer.calculateImportance(context[2], context);

      expect(systemImportance).toBe(1);
      expect(recentImportance).toBeGreaterThan(oldImportance);
    });

    it('estimates tokens using a 4-character heuristic', () => {
      const text = 'This is a token estimate test';
      const tokens = optimizer.estimateTokens(text);

      expect(tokens).toBeCloseTo(Math.ceil(text.length / 4), 1);
    });

    it('creates context messages with sensible defaults', () => {
      const message = optimizer.createContextMessage('assistant', 'Hello there');

      expect(message.role).toBe('assistant');
      expect(message.tokens).toBeGreaterThan(0);
      expect(message.importance).toBe(0.5);
      expect(message.id).toMatch(/msg_/);
    });
  });
});
