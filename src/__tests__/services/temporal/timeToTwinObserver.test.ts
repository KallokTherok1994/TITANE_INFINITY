/**
 * TITANE∞ — Unit tests for TimeToTwinObserver (Phase 3).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTimeToTwinObserver } from '@/services/temporal/timeToTwinObserver';

describe('TimeToTwinObserver', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('pulseOnce pousse une observation cognitive valide', async () => {
    const submit = vi.fn().mockResolvedValue({ ok: true });
    const observer = createTimeToTwinObserver({
      fetchHealth: vi.fn().mockResolvedValue({
        overall: 0.8,
        energy: 0.7,
        alignment: 0.6,
        consistency: 0.5,
        recovery: 0.4,
      }),
      fetchAlignment: vi.fn().mockResolvedValue({
        score: 0.5,
        active_goals: 3,
        completed_goals: 1,
      }),
      submit,
    });

    const res = await observer.pulseOnce();
    expect(res.pushed).toBe(true);
    expect(submit).toHaveBeenCalledTimes(1);
    const payload = submit.mock.calls[0][0];
    expect(payload.observation_type).toBe('cognitive');
    expect(payload.context).toBe('temporal_engine');
    expect(payload.confidence).toBeCloseTo(0.65, 2);
    expect(payload.content).toMatch(/temporal\.health\.overall=0\.80/);
    expect(payload.content).toMatch(/temporal\.alignment\.score=0\.50/);
  });

  it('pulseOnce remonte raison sur échec submit', async () => {
    const observer = createTimeToTwinObserver({
      fetchHealth: vi.fn().mockResolvedValue({
        overall: 0.5,
        energy: 0.5,
        alignment: 0.5,
        consistency: 0.5,
        recovery: 0.5,
      }),
      fetchAlignment: vi
        .fn()
        .mockResolvedValue({ score: 0.5, active_goals: 0, completed_goals: 0 }),
      submit: vi.fn().mockResolvedValue({ ok: false, error: 'IPC_DOWN' }),
    });

    const res = await observer.pulseOnce();
    expect(res.pushed).toBe(false);
    expect(res.reason).toBe('IPC_DOWN');
  });

  it('start déclenche un pulse + planifie un interval', async () => {
    const submit = vi.fn().mockResolvedValue({ ok: true });
    const observer = createTimeToTwinObserver({
      intervalMs: 5000,
      fetchHealth: vi.fn().mockResolvedValue({
        overall: 0.5,
        energy: 0.5,
        alignment: 0.5,
        consistency: 0.5,
        recovery: 0.5,
      }),
      fetchAlignment: vi
        .fn()
        .mockResolvedValue({ score: 0.5, active_goals: 0, completed_goals: 0 }),
      submit,
    });

    observer.start();
    expect(observer.isRunning()).toBe(true);

    await vi.advanceTimersByTimeAsync(0);
    await Promise.resolve();
    expect(submit).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(5000);
    await Promise.resolve();
    expect(submit.mock.calls.length).toBeGreaterThanOrEqual(2);

    observer.stop();
    expect(observer.isRunning()).toBe(false);
  });

  it('survit aux erreurs fetcher sans planter', async () => {
    const observer = createTimeToTwinObserver({
      fetchHealth: vi.fn().mockRejectedValue(new Error('engine_offline')),
      fetchAlignment: vi
        .fn()
        .mockResolvedValue({ score: 0.5, active_goals: 0, completed_goals: 0 }),
      submit: vi.fn().mockResolvedValue({ ok: true }),
    });

    const res = await observer.pulseOnce();
    expect(res.pushed).toBe(false);
    expect(res.reason).toMatch(/engine_offline/);
  });
});
