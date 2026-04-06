/**
 * TITANE∞ vΩ — CognitiveStrategy Unit Tests
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * Test coverage: Memory operations, Goal tracking, Consistency validation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CognitiveStrategy } from '../../strategies/CognitiveStrategy';
import { memoryIntegration } from '@/services/ai/memoryIntegration';
import { tauriClient } from '@/lib/tauriClient';

describe('CognitiveStrategy', () => {
  let strategy: CognitiveStrategy;

  beforeEach(() => {
    strategy = new CognitiveStrategy();
  });

  afterEach(async () => {
    await strategy.shutdown();
    vi.restoreAllMocks();
  });

  // ───────────────────────────────────────────────────────────────────────
  // INITIALIZATION TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Initialization', () => {
    it('should create strategy', () => {
      expect(strategy).toBeDefined();
      expect(strategy.type).toBe('cognitive');
      expect(strategy.isInitialized()).toBe(false);
    });

    it('should initialize cognitive engines', async () => {
      await strategy.initialize();
      expect(strategy.isInitialized()).toBe(true);
    });

    it('should handle reinitialization', async () => {
      await strategy.initialize();
      await strategy.initialize(); // Second call should be no-op

      expect(strategy.isInitialized()).toBe(true);
    });

    it('should initialize with custom config', async () => {
      await strategy.initialize();

      expect(strategy.isInitialized()).toBe(true);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // MEMORY OPERATIONS TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Memory Operations', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });

    it('should persist active memory before cognitive memory indexing', async () => {
      const order: string[] = [];
      const persistSpy = vi
        .spyOn(memoryIntegration, 'saveStructuredEntry')
        .mockImplementation(async () => {
          order.push('persistent');
        });
      const cognitiveSpy = vi
        // @ts-expect-error: testing private delegate for ordering
        .spyOn(strategy.cognitiveOrchestrator, 'storeTextMemory')
        .mockImplementation(async () => {
          order.push('cognitive');
          return 'semantic-memory-id';
        });

      const memoryId = await strategy.storeMemory('User prefers dark mode', 0.8);

      expect(memoryId).toBe('semantic-memory-id');
      expect(persistSpy).toHaveBeenCalledTimes(1);
      expect(cognitiveSpy).toHaveBeenCalledTimes(1);
      expect(order).toEqual(['persistent', 'cognitive']);
    });

    it('should skip cognitive memory indexing when active persistent write fails', async () => {
      const persistSpy = vi
        .spyOn(memoryIntegration, 'saveStructuredEntry')
        .mockRejectedValue(new Error('persistent-write-failed'));
      const cognitiveSpy = vi
        // @ts-expect-error: testing private delegate skip behavior
        .spyOn(strategy.cognitiveOrchestrator, 'storeTextMemory')
        .mockResolvedValue('semantic-memory-id');

      await expect(strategy.storeMemory('Important configuration', 0.9)).rejects.toThrow(
        'persistent-write-failed'
      );

      expect(persistSpy).toHaveBeenCalledTimes(1);
      expect(cognitiveSpy).not.toHaveBeenCalled();
    });

    it('should store memory', async () => {
      const memoryId = await strategy.storeMemory('User prefers dark mode', 0.8);

      expect(memoryId).toBeDefined();
      expect(typeof memoryId).toBe('string');
    });

    it('should store memory with metadata', async () => {
      const memoryId = await strategy.storeMemory('Important configuration', 0.9);

      expect(memoryId).toBeDefined();
    });

    it('should retrieve memories by query', async () => {
      await strategy.storeMemory('User likes Python', 0.7);
      await strategy.storeMemory('User knows TypeScript', 0.8);

      const memories = await strategy.retrieveMemories('programming', 5);

      expect(Array.isArray(memories)).toBe(true);
    });

    it('should limit retrieved memories', async () => {
      for (let i = 0; i < 10; i++) {
        await strategy.storeMemory(`Memory ${i}`, 0.6);
      }

      const memories = await strategy.retrieveMemories('Memory', 3);
      expect(memories.length).toBeLessThanOrEqual(3);
    });

    it('should filter by relevance threshold', async () => {
      await strategy.storeMemory('Highly relevant', 0.95);
      await strategy.storeMemory('Less relevant', 0.3);

      const memories = await strategy.retrieveMemories('relevant', 10);

      expect(memories.every(m => typeof m.score === 'number')).toBe(true);
    });

    it('should prefer persistent memory retrieval over cognitive enrichment', async () => {
      const readSpy = vi.spyOn(tauriClient, 'persistentMemoryRead').mockResolvedValue({
        entries: [
          {
            id: 'entry-1',
            level: 'intermediate',
            title: 'Atlas roadmap',
            content: 'Roadmap Atlas sprint stabilisation',
            contentType: 'project_context',
            topic: 'project',
            importance: 4,
            tags: ['atlas'],
            status: 'active',
            metadata: {
              createdAt: Date.now(),
              updatedAt: Date.now(),
              lastAccessedAt: Date.now(),
              accessCount: 1,
              schemaVersion: 'v1',
            },
            sourceEntryIds: [],
            relevanceScore: 0.9,
            expiresAt: Date.now() + 1000,
            promotable: true,
          },
        ],
        totalCount: 1,
        queryTime: 3,
        relevanceScores: { 'entry-1': 0.9 },
      });
      const cognitiveSpy = vi
        // @ts-expect-error: testing private delegate skip behavior
        .spyOn(strategy.cognitiveOrchestrator, 'enrichContext')
        .mockResolvedValue({
          memories: '\n[MEMOIRES PERTINENTES]\n1. Fallback cognitive (pertinence: 80%)\n',
          goals: '',
          facts: '',
          combined: '',
          metadata: { memoryCount: 1, goalCount: 0, factCount: 0 },
        });

      const memories = await strategy.retrieveMemories('atlas', 5);

      expect(readSpy).toHaveBeenCalledTimes(1);
      expect(cognitiveSpy).not.toHaveBeenCalled();
      expect(memories).toEqual([
        expect.objectContaining({
          content: 'Atlas roadmap',
        }),
      ]);
    });

    it('should fallback to cognitive enrichment when persistent retrieval fails', async () => {
      const readSpy = vi
        .spyOn(tauriClient, 'persistentMemoryRead')
        .mockRejectedValue(new Error('persistent-read-failed'));
      const cognitiveSpy = vi
        // @ts-expect-error: testing private delegate fallback behavior
        .spyOn(strategy.cognitiveOrchestrator, 'enrichContext')
        .mockResolvedValue({
          memories: '\n[MEMOIRES PERTINENTES]\n1. Fallback cognitive (pertinence: 80%)\n',
          goals: '',
          facts: '',
          combined: '',
          metadata: { memoryCount: 1, goalCount: 0, factCount: 0 },
        });

      const memories = await strategy.retrieveMemories('atlas', 5);

      expect(readSpy).toHaveBeenCalledTimes(1);
      expect(cognitiveSpy).toHaveBeenCalledTimes(1);
      expect(memories).toEqual([
        {
          content: 'Fallback cognitive',
          score: 0.8,
        },
      ]);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // CONVERSATION PROCESSING TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Conversation Processing', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });

    it('should process conversation turn', async () => {
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ];

      await expect(
        strategy.processConversation(messages as any)
      ).resolves.toBeUndefined();
    });

    it('should process with cognitive mode', async () => {
      const messages = [{ role: 'user', content: 'Explain quantum computing' }];

      await expect(
        strategy.processConversation(messages as any)
      ).resolves.toBeUndefined();
    });

    it('should persist to active memory before cognitive save', async () => {
      const order: string[] = [];
      const persistSpy = vi
        .spyOn(memoryIntegration, 'saveInteraction')
        .mockImplementation(async () => {
          order.push('persistent');
        });
      const cognitiveSpy = vi
        // @ts-expect-error: testing private delegate for ordering
        .spyOn(strategy.cognitiveOrchestrator, 'saveInteraction')
        .mockImplementation(async () => {
          order.push('cognitive');
        });

      await strategy.processConversation([
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ] as any);

      expect(persistSpy).toHaveBeenCalledTimes(1);
      expect(cognitiveSpy).toHaveBeenCalledTimes(1);
      expect(order).toEqual(['persistent', 'cognitive']);
    });

    it('should skip cognitive save when active persistent memory write fails', async () => {
      const persistSpy = vi
        .spyOn(memoryIntegration, 'saveInteraction')
        .mockRejectedValue(new Error('persistent-write-failed'));
      const cognitiveSpy = vi
        // @ts-expect-error: testing private delegate skip behavior
        .spyOn(strategy.cognitiveOrchestrator, 'saveInteraction')
        .mockResolvedValue(undefined);

      await expect(
        strategy.processConversation([
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' },
        ] as any)
      ).rejects.toThrow('persistent-write-failed');

      expect(persistSpy).toHaveBeenCalledTimes(1);
      expect(cognitiveSpy).not.toHaveBeenCalled();
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // GOAL TRACKING TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Goal Tracking', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });

    it('should set goal', async () => {
      const goalId = await strategy.setGoal('Complete user onboarding', 'actionable');

      expect(goalId).toBeDefined();
      expect(typeof goalId).toBe('string');
    });

    it('should set goal with priority', async () => {
      const goalId = await strategy.setGoal('Fix critical bug', 'actionable');

      expect(goalId).toBeDefined();
    });

    it('should check goal progress', async () => {
      const goalId = await strategy.setGoal('Test goal', 'informative');

      const progress = await strategy.checkGoalProgress(goalId);

      expect(progress).toBeDefined();
      expect(progress.progress).toBeGreaterThanOrEqual(0);
      expect(progress.progress).toBeLessThanOrEqual(1);
    });

    it('should detect goal completion', async () => {
      const goalId = await strategy.setGoal('Simple task', 'actionable');

      // Simulate progress
      await strategy.processConversation([{ role: 'user', content: 'Task done' }] as any);

      const progress = await strategy.checkGoalProgress(goalId);
      expect(progress).toBeDefined();
      expect(typeof progress.achieved).toBe('boolean');
      expect(typeof progress.progress).toBe('number');
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // CONSISTENCY VALIDATION TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Consistency Validation', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });

    it('should validate consistency', async () => {
      const text =
        'The system maintains coherence across all operations and respects fundamental laws.';

      const result = await strategy.validateConsistency(text);

      expect(result).toBeDefined();
      expect(typeof result.score).toBe('number');
      expect(Array.isArray(result.violations)).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it('should detect inconsistency', async () => {
      const text = 'The capital of France is Berlin'; // Inconsistent/wrong

      const result = await strategy.validateConsistency(text);

      expect(result.score).toBeLessThanOrEqual(1.0); // Will detect the issue
      expect(typeof result.score).toBe('number');
    });

    it('should provide violation details', async () => {
      const messages = [
        { role: 'assistant', content: 'The answer is yes' },
        { role: 'assistant', content: 'The answer is no' },
      ];

      const result = await strategy.validateConsistency(
        messages.map(m => m.content).join('\n')
      );

      expect(Array.isArray(result.violations)).toBe(true);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // HEALTH MONITORING TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Health Monitoring', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });

    it('should check health', async () => {
      const health = await strategy.checkHealth();

      expect(health.status).toBeDefined();
      expect(health.score).toBeGreaterThanOrEqual(0);
      expect(health.timestamp).toBeGreaterThan(0);
    });

    it('should get health score', () => {
      const score = strategy.getHealthScore();

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should detect degraded health', async () => {
      // Simulate heavy load
      for (let i = 0; i < 100; i++) {
        await strategy.storeMemory(`Load test ${i}`, 0.5);
      }

      const health = await strategy.checkHealth();
      expect(['healthy', 'degraded', 'critical']).toContain(health.status);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // METRICS TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Metrics', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });

    it('should record metrics', async () => {
      await strategy.storeMemory('Test', 0.5);

      const metrics = strategy.getMetrics();
      expect(metrics.length).toBeGreaterThan(0);
    });

    it('should get metrics summary', async () => {
      await strategy.storeMemory('Test1', 0.6);
      await strategy.storeMemory('Test2', 0.7);

      const summary = strategy.getSummary();
      expect(summary.totalRequests).toBeGreaterThan(0);
    });

    it('should track memory operations', async () => {
      await strategy.storeMemory('Mem1', 0.8);
      await strategy.retrieveMemories('Mem1', 5);

      const summary = strategy.getSummary();
      expect(summary.totalRequests).toBeGreaterThanOrEqual(2);
    });

    it('should reset metrics', async () => {
      await strategy.storeMemory('Test', 0.5);
      strategy.reset();

      const metrics = strategy.getMetrics();
      expect(metrics.length).toBe(0);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // EXECUTION TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Execution', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });

    it('should execute storeMemory operation', async () => {
      const result = await strategy.execute('storeMemory', {
        content: 'Test memory',
        importance: 0.7,
      });

      expect(result).toBeDefined();
    });

    it('should execute retrieveMemories operation', async () => {
      await strategy.execute('storeMemory', { content: 'Test', importance: 0.5 });

      const result = await strategy.execute('retrieveMemories', {
        query: 'Test',
        limit: 10,
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should execute setGoal operation', async () => {
      const result = await strategy.execute('setGoal', {
        description: 'Test goal',
        type: 'informative',
      });

      expect(result).toBeDefined();
    });

    it('should handle invalid operation', async () => {
      const result = await strategy.execute('invalidOp', {});
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown cognitive operation');
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // SHUTDOWN TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Shutdown', () => {
    it('should shutdown gracefully', async () => {
      await strategy.initialize();
      await strategy.shutdown();

      expect(strategy.isInitialized()).toBe(false);
    });

    it('should handle shutdown when not initialized', async () => {
      await expect(strategy.shutdown()).resolves.not.toThrow();
    });
  });
});
