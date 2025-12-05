/**
 * TITANE∞ v24.30 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * REALTIME EXECUTION ENGINE - MODERN DIAGNOSTIC SUITE
 * Aligné sur l'implémentation v24.30 (priority queue + pipeline 60 FPS)
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import {
  RealTimeExecutionEngine,
  type RealtimeTask,
  type Priority,
} from '@/core/realtime/RealTimeExecutionEngine';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

import { invoke } from '@tauri-apps/api/core';
const mockInvoke = vi.mocked(invoke);

const originalAudioContext = globalThis.AudioContext;
const originalWindowAudioContext =
  typeof window !== 'undefined' ? (window as any).AudioContext : undefined;

class FakeAudioContext {
  sampleRate = 48_000;
  currentTime = 0;
  destination = {};
  decodeAudioData = vi.fn(async (_chunk: ArrayBuffer) => createAudioBuffer());
  createBufferSource() {
    return {
      buffer: null as AudioBuffer | null,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      onended: null as (() => void) | null,
    };
  }
}

beforeAll(() => {
  (globalThis as any).AudioContext = FakeAudioContext;
  if (typeof window !== 'undefined') {
    (window as any).AudioContext = FakeAudioContext;
  }
});

afterAll(() => {
  (globalThis as any).AudioContext = originalAudioContext;
  if (typeof window !== 'undefined') {
    (window as any).AudioContext = originalWindowAudioContext;
  }
});

describe('RealTimeExecutionEngine', () => {
  let engine: RealTimeExecutionEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    engine = RealTimeExecutionEngine.getInstance();
    engine.stop();
    (engine as any).taskQueue.clear();
    mockInvoke.mockReset();
  });

  it('reuses the singleton instance', () => {
    expect(RealTimeExecutionEngine.getInstance()).toBe(engine);
  });

  it('orders realtime tasks by declared priority', () => {
    const queue = (engine as any).taskQueue;
    queue.clear();
    queue.enqueue(createTask('network', 'low'), 'low');
    queue.enqueue(createTask('avatar', 'high'), 'high');
    queue.enqueue(createTask('ui', 'normal'), 'normal');
    queue.enqueue(createTask('audio', 'critical'), 'critical');

    expect(queue.dequeue()?.type).toBe('audio');
    expect(queue.dequeue()?.type).toBe('avatar');
    expect(queue.dequeue()?.type).toBe('ui');
    expect(queue.dequeue()?.type).toBe('network');
  });

  it('enqueues audio tasks with critical priority', () => {
    const audio = createAudioBuffer();
    engine.enqueueAudio(audio);

    const task = (engine as any).taskQueue.dequeue();
    expect(task?.type).toBe('audio');
    expect(task?.priority).toBe('critical');
    expect(task?.payload).toBe(audio);
  });

  it('routes audio tasks through the audio scheduler', () => {
    const chunk = createAudioBuffer();
    const schedulerSpy = vi.spyOn((engine as any).audioScheduler, 'scheduleChunk');

    (engine as any).executeTask(createTask('audio', 'critical', chunk));

    expect(schedulerSpy).toHaveBeenCalledWith(chunk);
  });

  it('routes avatar tasks through the avatar scheduler', () => {
    const animation = { keyframes: [{ t: 0 }], duration: 500 };
    const schedulerSpy = vi.spyOn((engine as any).avatarScheduler, 'scheduleAnimation');

    (engine as any).executeTask(createTask('avatar', 'high', animation));

    expect(schedulerSpy).toHaveBeenCalledWith(animation);
  });

  it('adds UI events and flushes them after the debounce window', () => {
    vi.useFakeTimers();
    const batcher = (engine as any).uiEventBatcher;

    batcher.addEvent({ type: 'mousemove' });
    batcher.addEvent({ type: 'mousemove' });
    expect(batcher['events'].length).toBe(2);

    vi.advanceTimersByTime(20);
    batcher.flush();

    expect(batcher['events'].length).toBe(0);
    vi.useRealTimers();
  });

  it('sends network payloads through the Tauri bridge', async () => {
    mockInvoke.mockResolvedValue(undefined);
    const payload = { url: 'https://example.com' };

    (engine as any).executeTask(createTask('network', 'low', payload));

    await vi.waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('realtime_network_task', { payload });
    });
  });

  it('marks dropped frames when the frame budget is exceeded', () => {
    (engine as any).metrics.droppedFrames = 0;
    (engine as any).isRunning = true;
    (engine as any).lastFrameTime = performance.now() - (engine as any).frameTime * 2;

    const rafSpy = vi
      .spyOn(globalThis as any, 'requestAnimationFrame')
      .mockImplementation(() => 0);

    (engine as any).executionLoop();

    expect((engine as any).metrics.droppedFrames).toBeGreaterThan(0);

    (engine as any).isRunning = false;
    rafSpy.mockRestore();
  });

  it('prioritizes public enqueue APIs (critical > high > normal > low)', () => {
    const queue = (engine as any).taskQueue;
    queue.clear();

    engine.enqueueNetwork({ http: true });
    engine.enqueueUIEvent({ type: 'click' });
    engine.enqueueAvatar({ keyframes: [] });
    engine.enqueueAudio(createAudioBuffer());

    const order: string[] = [];
    while (queue.size() > 0) {
      order.push(queue.dequeue()!.type);
    }

    expect(order).toEqual(['audio', 'avatar', 'ui', 'network']);
  });

  it('enqueues audio, avatar and UI tasks when running the realtime pipeline', async () => {
    mockInvoke.mockImplementation(async (command) => {
      if (command === 'realtime_stream_tts') {
        return [new ArrayBuffer(8)];
      }
      if (command === 'realtime_generate_avatar_animations') {
        return [{ keyframes: [{ t: 0 }], duration: 400 }];
      }
      return undefined;
    });

    const queue = (engine as any).taskQueue;
    queue.clear();

    await engine.executeRealTimePipeline({
      iaResponse: 'Pipeline diagnostic',
      ttsEnabled: true,
      avatarEnabled: true,
    });

    const tasks = drainQueue(queue);
    const types = tasks.map((task) => task.type);

    expect(types.filter((t) => t === 'audio')).toHaveLength(1);
    expect(types.filter((t) => t === 'avatar')).toHaveLength(1);
    expect(types.filter((t) => t === 'ui')).toHaveLength(1);
  });
});

function createTask(type: RealtimeTask['type'], priority: Priority, payload: any = {}): RealtimeTask {
  return {
    id: `${type}_${Date.now()}`,
    type,
    priority,
    payload,
    timestamp: Date.now(),
    cancellable: true,
  };
}

function createAudioBuffer(duration: number = 0.5): AudioBuffer {
  return { duration } as AudioBuffer;
}

function drainQueue(queue: { dequeue: () => RealtimeTask | undefined; size: () => number }): RealtimeTask[] {
  const tasks: RealtimeTask[] = [];
  while (queue.size() > 0) {
    const task = queue.dequeue();
    if (task) tasks.push(task);
  }
  return tasks;
}
