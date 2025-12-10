/**
 * TITANE∞ v20Ω — CoherenceEngine Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { coherenceEngine } from '../CoherenceEngine';
import { EventBus } from '../bus/EventBus';
import { TaskPrioritizer } from '../coordination/taskPrioritizer';
import { CoherenceValidator } from '../validation/coherenceValidator';
import type { Task, SystemState } from '../types';

describe('CoherenceEngine', () => {
  describe('Event Bus Integration', () => {
    it('should emit and receive events', () => {
      const handler = vi.fn();
      const unsubscribe = coherenceEngine.subscribe('engine:started', handler);

      coherenceEngine.emit({
        type: 'engine:started',
        data: { engineId: 'test-engine' },
      });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'engine:started',
          data: { engineId: 'test-engine' },
        })
      );

      unsubscribe();
    });

    it('should support wildcard subscriptions', () => {
      const handler = vi.fn();
      const unsubscribe = coherenceEngine.subscribe('*', handler);

      coherenceEngine.emit({ type: 'engine:started', data: {} });
      coherenceEngine.emit({ type: 'engine:stopped', data: {} });

      expect(handler).toHaveBeenCalledTimes(2);
      unsubscribe();
    });

    it('should include timestamp in events', () => {
      const handler = vi.fn();
      const unsubscribe = coherenceEngine.subscribe('coherence:validated', handler);

      coherenceEngine.emit({ type: 'coherence:validated', data: {} });

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(Number),
        })
      );
      unsubscribe();
    });
  });

  describe('Task Prioritization', () => {
    it('should prioritize tasks by type weight', () => {
      const tasks: Task[] = [
        { id: '1', type: 'cleanup', priority: 5, payload: {}, createdAt: Date.now() },
        { id: '2', type: 'healing', priority: 5, payload: {}, createdAt: Date.now() },
        {
          id: '3',
          type: 'conversation',
          priority: 5,
          payload: {},
          createdAt: Date.now(),
        },
      ];

      const prioritized = coherenceEngine.prioritize(tasks);

      // Healing should be in immediate/high, conversation in high/normal
      const allHighPriority = [...prioritized.immediate, ...prioritized.high];
      expect(allHighPriority.some(t => t.id === '2')).toBe(true);
    });

    it('should respect deadline urgency', () => {
      const now = Date.now();
      const tasks: Task[] = [
        {
          id: '1',
          type: 'memory',
          priority: 5,
          payload: {},
          createdAt: now,
          deadline: now + 100,
        },
        {
          id: '2',
          type: 'memory',
          priority: 5,
          payload: {},
          createdAt: now,
          deadline: now + 60000,
        },
      ];

      const prioritized = coherenceEngine.prioritize(tasks);

      // Task 1 with imminent deadline should be higher priority
      const allTasks = [
        ...prioritized.immediate,
        ...prioritized.high,
        ...prioritized.normal,
        ...prioritized.low,
        ...prioritized.deferred,
      ];

      const task1Index = allTasks.findIndex(t => t.id === '1');
      const task2Index = allTasks.findIndex(t => t.id === '2');
      expect(task1Index).toBeLessThan(task2Index);
    });
  });

  describe('Validation', () => {
    it('should validate healthy system state', () => {
      const healthyState: SystemState = {
        engines: new Map([
          [
            'engine1',
            {
              id: 'engine1',
              name: 'Test Engine',
              status: 'active',
              lastActivity: Date.now(),
              metrics: { requestCount: 100, errorCount: 5, avgLatency: 200 },
            },
          ],
        ]),
        providers: new Map([
          ['provider1', { id: 'provider1', health: 0.95, latency: 100, available: true }],
        ]),
        memory: { stmCount: 10, mtmCount: 50, ltmCount: 100, totalSize: 1024 * 1024 },
        coherenceScore: 0.9,
        timestamp: Date.now(),
      };

      const result = coherenceEngine.validate(healthyState);

      expect(result.valid).toBe(true);
      expect(result.coherenceScore).toBeGreaterThan(0.8);
      expect(result.issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    it('should detect unhealthy providers', () => {
      const unhealthyState: SystemState = {
        engines: new Map(),
        providers: new Map([
          [
            'provider1',
            { id: 'provider1', health: 0.2, latency: 6000, available: false },
          ],
        ]),
        memory: { stmCount: 0, mtmCount: 0, ltmCount: 0, totalSize: 0 },
        coherenceScore: 0.5,
        timestamp: Date.now(),
      };

      const result = coherenceEngine.validate(unhealthyState);

      expect(result.issues.some(i => i.code === 'PROVIDER_UNHEALTHY')).toBe(true);
    });
  });
});

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  it('should track event history', () => {
    eventBus.emit({ type: 'engine:started', data: { id: 1 } });
    eventBus.emit({ type: 'engine:stopped', data: { id: 1 } });

    const history = eventBus.getHistory();
    expect(history).toHaveLength(2);
  });

  it('should filter history by type', () => {
    eventBus.emit({ type: 'engine:started', data: {} });
    eventBus.emit({ type: 'engine:started', data: {} });
    eventBus.emit({ type: 'engine:stopped', data: {} });

    const startedEvents = eventBus.getHistoryByType('engine:started');
    expect(startedEvents).toHaveLength(2);
  });

  it('should unsubscribe correctly', () => {
    const handler = vi.fn();
    const unsubscribe = eventBus.subscribe('engine:started', handler);

    eventBus.emit({ type: 'engine:started', data: {} });
    expect(handler).toHaveBeenCalledTimes(1);

    unsubscribe();
    eventBus.emit({ type: 'engine:started', data: {} });
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe('TaskPrioritizer', () => {
  let prioritizer: TaskPrioritizer;

  beforeEach(() => {
    prioritizer = new TaskPrioritizer();
  });

  it('should partition tasks into buckets', () => {
    const tasks: Task[] = [
      { id: '1', type: 'healing', priority: 10, payload: {}, createdAt: Date.now() },
      { id: '2', type: 'cleanup', priority: 1, payload: {}, createdAt: Date.now() },
    ];

    const result = prioritizer.prioritize(tasks);

    expect(result.immediate.length + result.high.length).toBeGreaterThan(0);
    expect(result.low.length + result.deferred.length).toBeGreaterThan(0);
  });

  it('should get executable tasks respecting dependencies', () => {
    const tasks: Task[] = [
      { id: '1', type: 'memory', priority: 5, payload: {}, createdAt: Date.now() },
      {
        id: '2',
        type: 'memory',
        priority: 5,
        payload: {},
        createdAt: Date.now(),
        dependencies: ['1'],
      },
    ];

    const completed = new Set<string>();
    let executable = prioritizer.getExecutableTasks(tasks, completed);

    // Only task 1 should be executable initially
    expect(executable.map(t => t.id)).toContain('1');
    expect(executable.map(t => t.id)).not.toContain('2');

    // After task 1 completes, task 2 should be executable
    completed.add('1');
    executable = prioritizer.getExecutableTasks(tasks, completed);
    expect(executable.map(t => t.id)).toContain('2');
  });
});

describe('CoherenceValidator', () => {
  let validator: CoherenceValidator;

  beforeEach(() => {
    validator = new CoherenceValidator();
  });

  it('should detect engine errors', () => {
    const state: SystemState = {
      engines: new Map([
        [
          'broken',
          {
            id: 'broken',
            name: 'Broken Engine',
            status: 'error',
            lastActivity: Date.now(),
            metrics: { requestCount: 10, errorCount: 10, avgLatency: 1000 },
          },
        ],
      ]),
      providers: new Map(),
      memory: { stmCount: 0, mtmCount: 0, ltmCount: 0, totalSize: 0 },
      coherenceScore: 0.5,
      timestamp: Date.now(),
    };

    const result = validator.validate(state);

    expect(result.issues.some(i => i.code === 'ENGINE_ERROR')).toBe(true);
  });

  it('should detect high error rates', () => {
    const state: SystemState = {
      engines: new Map([
        [
          'flaky',
          {
            id: 'flaky',
            name: 'Flaky Engine',
            status: 'active',
            lastActivity: Date.now(),
            metrics: { requestCount: 100, errorCount: 30, avgLatency: 500 },
          },
        ],
      ]),
      providers: new Map(),
      memory: { stmCount: 0, mtmCount: 0, ltmCount: 0, totalSize: 0 },
      coherenceScore: 0.7,
      timestamp: Date.now(),
    };

    const result = validator.validate(state);

    expect(result.issues.some(i => i.code === 'ENGINE_HIGH_ERROR_RATE')).toBe(true);
  });
});
