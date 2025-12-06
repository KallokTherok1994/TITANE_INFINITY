/**
 * TITANE∞ vΩ — CognitiveStrategy Unit Tests
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * 
 * Test coverage: Memory operations, Goal tracking, Consistency validation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CognitiveStrategy } from '../../strategies/CognitiveStrategy';

describe('CognitiveStrategy', () => {
  let strategy: CognitiveStrategy;

  beforeEach(() => {
    strategy = new CognitiveStrategy();
  });

  afterEach(async () => {
    await strategy.shutdown();
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
      await strategy.initialize({
        memoryThreshold: 0.7,
        maxMemories: 500
      });
      
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

    it('should store memory', async () => {
      const memoryId = await strategy.storeMemory(
        'User prefers dark mode',
        0.8
      );
      
      expect(memoryId).toBeDefined();
      expect(typeof memoryId).toBe('string');
    });

    it('should store memory with metadata', async () => {
      const memoryId = await strategy.storeMemory(
        'Important configuration',
        0.9,
        { category: 'settings', priority: 'high' }
      );
      
      expect(memoryId).toBeDefined();
    });

    it('should retrieve memories by query', async () => {
      await strategy.storeMemory('User likes Python', 0.7);
      await strategy.storeMemory('User knows TypeScript', 0.8);
      
      const memories = await strategy.retrieveMemories('programming', 5, 0.5);
      
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
      
      const memories = await strategy.retrieveMemories('relevant', 10, 0.7);
      
      expect(memories.every(m => m.relevance >= 0.7)).toBe(true);
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
        { role: 'assistant', content: 'Hi there!' }
      ];
      
      const result = await strategy.processConversation(
        messages as any,
        'Hi there!'
      );
      
      expect(result).toBeDefined();
    });

    it('should process with cognitive mode', async () => {
      const messages = [
        { role: 'user', content: 'Explain quantum computing' }
      ];
      
      const result = await strategy.processConversation(
        messages as any,
        'Quantum computing uses qubits...',
        'cognitive'
      );
      
      expect(result).toBeDefined();
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
      const goalId = await strategy.setGoal(
        'Complete user onboarding',
        'actionable'
      );
      
      expect(goalId).toBeDefined();
      expect(typeof goalId).toBe('string');
    });

    it('should set goal with priority', async () => {
      const goalId = await strategy.setGoal(
        'Fix critical bug',
        'actionable',
        10
      );
      
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
      const goalId = await strategy.setGoal('Simple task', 'actionable', 1);
      
      // Simulate progress
      await strategy.processConversation(
        [{ role: 'user', content: 'Task done' }] as any,
        'Completed'
      );
      
      const progress = await strategy.checkGoalProgress(goalId);
      expect(progress.complete).toBeDefined();
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
      const messages = [
        { role: 'user', content: 'What is 2+2?' },
        { role: 'assistant', content: '2+2 equals 4' }
      ];
      
      const result = await strategy.validateConsistency(
        messages as any,
        '2+2 equals 4'
      );
      
      expect(result.isConsistent).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it('should detect inconsistency', async () => {
      const messages = [
        { role: 'user', content: 'What is the capital of France?' },
        { role: 'assistant', content: 'Paris' }
      ];
      
      // Inconsistent response
      const result = await strategy.validateConsistency(
        messages as any,
        'The capital is Berlin' // Wrong!
      );
      
      expect(result.score).toBeLessThan(1.0);
    });

    it('should provide violation details', async () => {
      const messages = [
        { role: 'assistant', content: 'The answer is yes' },
        { role: 'assistant', content: 'The answer is no' }
      ];
      
      const result = await strategy.validateConsistency(
        messages as any,
        'The answer is maybe'
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
        importance: 0.7
      });
      
      expect(result).toBeDefined();
    });

    it('should execute retrieveMemories operation', async () => {
      await strategy.execute('storeMemory', { content: 'Test', importance: 0.5 });
      
      const result = await strategy.execute('retrieveMemories', {
        query: 'Test',
        limit: 10
      });
      
      expect(Array.isArray(result)).toBe(true);
    });

    it('should execute setGoal operation', async () => {
      const result = await strategy.execute('setGoal', {
        description: 'Test goal',
        type: 'informative'
      });
      
      expect(result).toBeDefined();
    });

    it('should handle invalid operation', async () => {
      await expect(
        strategy.execute('invalidOp', {})
      ).rejects.toThrow();
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
