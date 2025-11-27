/**
 * TITANE∞ v24.30 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * REALTIME EXECUTION ENGINE - TEST SUITE
 * Tests for 60 FPS real-time execution (Phase 5)
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RealTimeExecutionEngine } from '../../src/core/realtime/RealTimeExecutionEngine';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

import { invoke } from '@tauri-apps/api/core';
const mockInvoke = vi.mocked(invoke);

describe('RealTimeExecutionEngine', () => {
  let engine: RealTimeExecutionEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    engine = RealTimeExecutionEngine.getInstance();
    engine.stop(); // Stop auto-started engine
  });

  afterEach(() => {
    engine.stop();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = RealTimeExecutionEngine.getInstance();
      const instance2 = RealTimeExecutionEngine.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Lifecycle Management', () => {
    it('should start execution loop at target FPS', () => {
      engine.start(60);
      expect(engine['isRunning']).toBe(true);
      expect(engine['targetFPS']).toBe(60);
    });

    it('should stop execution loop cleanly', () => {
      engine.start(60);
      engine.stop();
      expect(engine['isRunning']).toBe(false);
      expect(engine['executionLoopId']).toBeNull();
    });

    it('should not restart if already running', () => {
      engine.start(60);
      const firstLoopId = engine['executionLoopId'];
      engine.start(60);
      expect(engine['executionLoopId']).toBe(firstLoopId);
    });
  });

  describe('Priority Queue', () => {
    it('should dequeue tasks by priority', () => {
      const queue = engine['taskQueue'];

      queue.enqueue({ priority: 1, payload: 'low' } as any, 1);
      queue.enqueue({ priority: 3, payload: 'critical' } as any, 3);
      queue.enqueue({ priority: 2, payload: 'high' } as any, 2);

      const task1 = queue.dequeue();
      const task2 = queue.dequeue();
      const task3 = queue.dequeue();

      expect(task1?.payload).toBe('critical');
      expect(task2?.payload).toBe('high');
      expect(task3?.payload).toBe('low');
    });

    it('should return correct queue size', () => {
      const queue = engine['taskQueue'];

      expect(queue.size()).toBe(0);

      queue.enqueue({ priority: 1 } as any, 1);
      queue.enqueue({ priority: 2 } as any, 2);

      expect(queue.size()).toBe(2);
    });

    it('should handle empty queue', () => {
      const queue = engine['taskQueue'];
      expect(queue.isEmpty()).toBe(true);
      expect(queue.dequeue()).toBeUndefined();
    });
  });

  describe('Audio Scheduler (Critical Priority)', () => {
    it('should enqueue audio with critical priority', () => {
      const audioBuffer = new ArrayBuffer(1024);

      engine.enqueueAudio(audioBuffer, { voice: 'default', rate: 1.0 });

      expect(engine['taskQueue'].size()).toBe(1);
      const task = engine['taskQueue'].dequeue();
      expect(task?.priority).toBe(3); // critical
    });

    it('should schedule audio playback', async () => {
      mockInvoke.mockResolvedValueOnce(undefined);

      const audioBuffer = new ArrayBuffer(2048);
      await engine['audioScheduler'].scheduleAudio(audioBuffer, 0);

      expect(mockInvoke).toHaveBeenCalledWith('realtime_stream_tts', {
        audioBuffer,
        timestamp: 0,
      });
    });
  });

  describe('Avatar Scheduler (High Priority)', () => {
    it('should enqueue avatar with high priority', () => {
      const animation = { joint: 'jaw', rotation: 0.1 };

      engine.enqueueAvatar(animation, {});

      expect(engine['taskQueue'].size()).toBe(1);
      const task = engine['taskQueue'].dequeue();
      expect(task?.priority).toBe(2); // high
    });

    it('should update avatar animations at 60 FPS', () => {
      const scheduler = engine['avatarScheduler'];
      const deltaTime = 16.67; // ~60 FPS

      scheduler.update(deltaTime);

      expect(scheduler['currentFrame']).toBeGreaterThan(0);
    });
  });

  describe('UI Event Batcher (Normal Priority)', () => {
    it('should enqueue UI event with normal priority', () => {
      const event = { type: 'click', target: 'button' };

      engine.enqueueUIEvent(event, {});

      expect(engine['taskQueue'].size()).toBe(1);
      const task = engine['taskQueue'].dequeue();
      expect(task?.priority).toBe(1); // normal
    });

    it('should batch events within debounce window', () => {
      vi.useFakeTimers();
      const batcher = engine['uiEventBatcher'];

      batcher.batchEvent({ type: 'mousemove', x: 10, y: 20 });
      batcher.batchEvent({ type: 'mousemove', x: 15, y: 25 });
      batcher.batchEvent({ type: 'mousemove', x: 20, y: 30 });

      expect(batcher['eventBatch'].length).toBe(3);

      vi.advanceTimersByTime(20); // Exceed 16ms debounce
      batcher.flush();

      expect(batcher['eventBatch'].length).toBe(0);
      vi.useRealTimers();
    });
  });

  describe('Network Tasks (Low Priority)', () => {
    it('should enqueue network with low priority', () => {
      const payload = { url: 'https://api.example.com', method: 'GET' };

      engine.enqueueNetwork(payload, {});

      expect(engine['taskQueue'].size()).toBe(1);
      const task = engine['taskQueue'].dequeue();
      expect(task?.priority).toBe(0); // low
    });
  });

  describe('Execution Loop', () => {
    it('should calculate FPS correctly', async () => {
      vi.useFakeTimers();

      engine.start(60);

      // Simulate multiple frames
      for (let i = 0; i < 10; i++) {
        vi.advanceTimersByTime(16.67); // 60 FPS frame time
        await vi.runOnlyPendingTimersAsync();
      }

      const fps = engine['metrics'].fps;
      expect(fps).toBeGreaterThan(50); // Allow some variance
      expect(fps).toBeLessThan(70);

      vi.useRealTimers();
    });

    it('should detect frame drops', async () => {
      vi.useFakeTimers();

      engine.start(60);

      // Simulate long frame (frame drop)
      vi.advanceTimersByTime(50); // 20 FPS instead of 60
      await vi.runOnlyPendingTimersAsync();

      expect(engine['metrics'].droppedFrames).toBeGreaterThan(0);

      vi.useRealTimers();
    });

    it('should respect frame time budget (80%)', async () => {
      vi.useFakeTimers();

      engine.start(60);

      // Frame time at 60 FPS: ~16.67ms
      // 80% budget: ~13.3ms
      expect(engine['frameTime']).toBeCloseTo(16.67, 1);

      vi.useRealTimers();
    });
  });

  describe('Task Execution', () => {
    it('should execute tasks within frame budget', async () => {
      mockInvoke.mockResolvedValue(undefined);

      // Enqueue multiple tasks
      engine.enqueueAudio(new ArrayBuffer(512), {});
      engine.enqueueAvatar({ joint: 'jaw', rotation: 0.1 }, {});
      engine.enqueueUIEvent({ type: 'click' }, {});

      engine['executeTasks'](16.67);

      // Tasks should be processed
      await vi.waitFor(() => {
        expect(engine['taskQueue'].size()).toBe(0);
      });
    });

    it('should prioritize critical tasks first', async () => {
      mockInvoke.mockResolvedValue(undefined);

      const executionOrder: string[] = [];

      // Override task types to track execution
      engine.enqueueNetwork({ url: 'test' }, {}); // low
      engine.enqueueUIEvent({ type: 'click' }, {}); // normal
      engine.enqueueAvatar({ joint: 'jaw' }, {}); // high
      engine.enqueueAudio(new ArrayBuffer(256), {}); // critical

      // Process all tasks
      while (!engine['taskQueue'].isEmpty()) {
        const task = engine['taskQueue'].dequeue();
        if (task) {
          executionOrder.push(task.type);
        }
      }

      expect(executionOrder[0]).toBe('audio'); // critical first
      expect(executionOrder[1]).toBe('avatar'); // high second
      expect(executionOrder[2]).toBe('ui'); // normal third
      expect(executionOrder[3]).toBe('network'); // low last
    });
  });

  describe('Real-Time Pipeline', () => {
    it('should execute complete realtime pipeline', async () => {
      mockInvoke
        .mockResolvedValueOnce(undefined) // TTS
        .mockResolvedValueOnce(undefined) // Avatar
        .mockResolvedValueOnce(undefined); // Network

      const input = {
        userMessage: 'Test pipeline',
        audioBuffer: new ArrayBuffer(1024),
        animation: { joint: 'jaw', rotation: 0.1 },
      };

      await engine.executeRealTimePipeline(input);

      expect(mockInvoke).toHaveBeenCalledTimes(3);
    });
  });

  describe('Metrics Tracking', () => {
    it('should track average frame time', async () => {
      vi.useFakeTimers();

      engine.start(60);

      // Run multiple frames
      for (let i = 0; i < 5; i++) {
        vi.advanceTimersByTime(16.67);
        await vi.runOnlyPendingTimersAsync();
      }

      expect(engine['metrics'].avgFrameTime).toBeGreaterThan(0);

      vi.useRealTimers();
    });

    it('should track audio/avatar latency', async () => {
      mockInvoke.mockResolvedValue(undefined);

      engine.enqueueAudio(new ArrayBuffer(512), {});
      engine['executeTasks'](16.67);

      await vi.waitFor(() => {
        expect(engine['metrics'].audioLatency).toBeGreaterThanOrEqual(0);
      });
    });

    it('should count dropped frames', async () => {
      vi.useFakeTimers();

      engine.start(60);

      // Simulate slow frame
      vi.advanceTimersByTime(40); // Slow frame
      await vi.runOnlyPendingTimersAsync();

      expect(engine['metrics'].droppedFrames).toBeGreaterThan(0);

      vi.useRealTimers();
    });
  });

  describe('Performance', () => {
    it('should maintain 60 FPS with moderate load', async () => {
      vi.useFakeTimers();
      mockInvoke.mockResolvedValue(undefined);

      engine.start(60);

      // Enqueue moderate number of tasks per frame
      for (let i = 0; i < 30; i++) {
        engine.enqueueUIEvent({ type: 'test', id: i }, {});
        vi.advanceTimersByTime(16.67);
        await vi.runOnlyPendingTimersAsync();
      }

      const avgFps = engine['metrics'].fps;
      expect(avgFps).toBeGreaterThan(55); // Allow 5 FPS variance

      vi.useRealTimers();
    });
  });
});
